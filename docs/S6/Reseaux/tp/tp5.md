---
title: "TP5 - Application de chat multicast"
sidebar_position: 5
---

# TP5 - Application de chat multicast

Programmation reseau avancee : multicast IP, multithreading et communication temps reel.

## Objectifs

- Comprendre les concepts du multicast IP
- Implementer la programmation socket multicast en C
- Utiliser les threads POSIX (pthreads) pour les operations concurrentes
- Construire une application de chat temps reel
- Gerer les entrees/sorties du terminal en mode raw

## Themes abordes

1. **Multicast IP** - Protocole de communication de groupe
2. **Multithreading** - Operations d'envoi/reception concurrentes
3. **Controle du terminal** - Mode raw pour la saisie interactive
4. **Protocole de chat** - Formatage et affichage des messages

---

## Concepts du multicast IP

### Qu'est-ce que le multicast ?

Le **multicast** permet la communication un-vers-plusieurs :
- Un emetteur, plusieurs recepteurs
- Plus efficace que l'unicast vers chaque recepteur
- Moins de surcout que le broadcast

### Adresses multicast

**Plage multicast IPv4 :** 224.0.0.0 a 239.255.255.255

| Plage | Usage |
|-------|-------|
| 224.0.0.0 - 224.0.0.255 | Reseau local (non route) |
| 224.0.1.0 - 238.255.255.255 | Multicast global |
| 239.0.0.0 - 239.255.255.255 | Organisation locale |

**Adresses courantes :**
- `224.0.0.1` - Tous les hotes de ce sous-reseau
- `224.0.0.2` - Tous les routeurs de ce sous-reseau
- `224.0.0.10` - Application personnalisee (utilisee dans ce TP)

### Fonctionnement

1. L'**emetteur** envoie des paquets UDP a l'adresse du groupe multicast
2. Les **recepteurs** rejoignent le groupe multicast (s'abonnent)
3. Le **reseau** livre les paquets a tous les membres du groupe
4. **IGMP** (Internet Group Management Protocol) gere l'appartenance aux groupes

---

## Vue d'ensemble de l'architecture

### Conception de l'application

```
┌─────────────────────────────────────┐
│      Main Thread (main)             │
│  - Initialize socket                │
│  - Join multicast group             │
│  - Spawn threads                    │
└────────┬─────────────────┬──────────┘
         │                 │
    ┌────▼────┐      ┌────▼────────┐
    │ Send    │      │ Receive     │
    │ Thread  │      │ Thread      │
    ├─────────┤      ├─────────────┤
    │ Read    │      │ recv()      │
    │ keyboard│      │ Parse       │
    │ Format  │      │ Display     │
    │ sendto()│      │ Redraw      │
    └─────────┘      └─────────────┘
```

### Communication entre threads

- **Ressource partagee :** Chaine de saisie (texte en cours de frappe)
- **Synchronisation :** Un mutex protege la chaine de saisie
- **Coordination :** Le thread principal attend que le thread d'envoi se termine

---

## Implementation (main.c)

### 1. Analyse des arguments en ligne de commande

**Utilisation :**
```bash
./chat ADDRESS PORT NAME
./chat 224.0.0.10 10000 Alice
```

**Structure des arguments :**
```c noexec
typedef struct {
    bool help;
    bool version;
    char *address;  // Multicast group (e.g., 224.0.0.10)
    char *port;     // Port number (e.g., 10000)
    char *name;     // Username
} Args;
```

**Definition des arguments par macros :**
```c noexec
#define ARGS_FLAGS \
    FLAG(help, h, "show this help message and exit") \
    FLAG(version, v, "show program's version number and exit")

#define ARGS_PARAMS \
    PARAM(address, ADDRESS, "the multicast address to use") \
    PARAM(port, PORT, "the port to use") \
    PARAM(name, NAME, "the name of the user")
```

Cela permet l'analyse generique et la generation de l'aide.

### 2. Configuration du socket

```c noexec
// Create UDP socket
const int sock = socket(AF_INET, SOCK_DGRAM, 0);
if (sock == -1) {
    error("failed to create socket: %s", strerror(errno));
}

// Join multicast group
const struct ip_mreq option = {
    .imr_multiaddr = { .s_addr = inet_addr(args.address) },
    .imr_interface = { .s_addr = INADDR_ANY },  // All interfaces
};

if (setsockopt(sock, IPPROTO_IP, IP_ADD_MEMBERSHIP,
               &option, sizeof(option)) == -1) {
    error("failed to set IP_ADD_MEMBERSHIP option: %s", strerror(errno));
}

// Enable address reuse (multiple programs on same machine)
const int opt = 1;
if (setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) == -1) {
    error("failed to set SO_REUSEADDR option: %s", strerror(errno));
}

// Bind to port (receive from multicast group)
const struct sockaddr_in server_addr = {
    .sin_family = AF_INET,
    .sin_port = htons(port),
    .sin_addr.s_addr = htonl(INADDR_ANY),  // Receive from any source
};

if (bind(sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
    error("failed to bind socket: %s", strerror(errno));
}
```

### Options socket importantes

#### `IP_ADD_MEMBERSHIP`

Rejoint un groupe multicast :
```c noexec
struct ip_mreq {
    struct in_addr imr_multiaddr;  // Multicast group address
    struct in_addr imr_interface;  // Local interface (INADDR_ANY = all)
};
```

#### `SO_REUSEADDR`

Permet a plusieurs processus de se lier au meme port :
```c noexec
int opt = 1;
setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
```

Essentiel pour le multicast - tous les recepteurs ont besoin du meme port.

#### Autres options utiles

```c noexec
// Set TTL (Time To Live) - how many router hops
unsigned char ttl = 5;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl));

// Enable loopback (receive own messages)
unsigned char loop = 1;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_LOOP, &loop, sizeof(loop));

// Set outgoing interface
struct in_addr interface_addr;
interface_addr.s_addr = inet_addr("192.168.1.100");
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_IF, &interface_addr, sizeof(interface_addr));
```

### 3. Structure des threads

#### Chaine de saisie (etat partage)

```c noexec
typedef struct {
    size_t capacity;          // Buffer size
    size_t size;              // Current length
    char *string;             // Character buffer
    pthread_mutex_t mutex;    // Protects concurrent access
} InputString;
```

**Operations :**
```c noexec
// Initialize
InputString *input_string_init(void) {
    InputString *self = safe_malloc(sizeof(*self));
    self->capacity = 2;
    self->size = 0;
    self->string = safe_malloc(self->capacity);
    pthread_mutex_init(&self->mutex, NULL);
    return self;
}

// Append character (grows buffer if needed)
void input_string_append(InputString *self, const char chr) {
    if (self->size == self->capacity) {
        self->capacity *= 2;
        self->string = realloc(self->string, self->capacity);
    }
    self->string[self->size++] = chr;
}

// Clear
void input_string_clear(InputString *self) {
    self->size = 0;
}

// Display with prompt
void input_string_draw(InputString *self) {
    lock_mutex(&self->mutex);
    printf(CLEAR_LINE "❯ ");
    fwrite(self->string, self->size, 1, stdout);
    fflush(stdout);
    unlock_mutex(&self->mutex);
}
```

#### Thread d'envoi

```c noexec
typedef struct {
    int sock;
    int port;
    const char *username;
    const char *address;         // Multicast group
    InputString *input_string;
} SendMessagesThread;

static void *send_messages_thread(void *data) {
    const SendMessagesThread *thread = data;
    
    // Setup destination address (multicast group)
    struct sockaddr_in destination_address = {
        .sin_family = AF_INET,
        .sin_port = htons(thread->port),
    };
    inet_pton(AF_INET, thread->address, &destination_address.sin_addr);
    
    // Enable terminal raw mode (read char by char)
    terminal_enable_raw_mode();
    atexit(terminal_disable_raw_mode);
    
    while (true) {
        input_string_draw(thread->input_string);
        
        // Read one character
        char input_char = fgetc(stdin);
        
        if (input_char == EOF || input_char == 4) break;  // Ctrl+D
        
        if (input_char == 127) {  // Backspace
            lock_mutex(&thread->input_string->mutex);
            if (thread->input_string->size) 
                --thread->input_string->size;
            unlock_mutex(&thread->input_string->mutex);
            continue;
        }
        
        if (input_char == 12) {  // Ctrl+L (clear screen)
            printf("\033[H\033[J");
            continue;
        }
        
        if (input_char == '\n') {  // Enter - send message
            if (thread->input_string->size) {
                lock_mutex(&thread->input_string->mutex);
                
                // Format message: "username@message content"
                const size_t message_length = 
                    1 + strlen(thread->username) + 
                    thread->input_string->size;
                char *message = malloc(message_length);
                
                snprintf(message, message_length, "%s@%s", 
                        thread->username, 
                        thread->input_string->string);
                
                input_string_clear(thread->input_string);
                unlock_mutex(&thread->input_string->mutex);
                
                // Send to multicast group
                if (sendto(thread->sock, message, message_length, 0,
                          (struct sockaddr*)&destination_address,
                          sizeof(destination_address)) == -1) {
                    error("failed to send message: %s", strerror(errno));
                }
                
                free(message);
            }
            continue;
        }
        
        // Regular character - append to input string
        lock_mutex(&thread->input_string->mutex);
        input_string_append(thread->input_string, input_char);
        unlock_mutex(&thread->input_string->mutex);
    }
    
    return NULL;
}
```

#### Thread de reception

```c noexec
typedef struct {
    int sock;
    InputString *input_string;
} ReceiveMessagesThread;

static void *receive_messages_thread(void *data) {
    ReceiveMessagesThread *thread = data;
    
    while (true) {
        char buffer[2048];
        memset(buffer, 0, sizeof(buffer));
        
        // Receive multicast message
        const ssize_t message_size = recv(thread->sock, &buffer, 
                                         sizeof(buffer), 0);
        if (message_size == 0) continue;
        
        // Parse and display message
        print_message(buffer, strlen(buffer), thread->input_string);
    }
    
    return NULL;
}
```

#### Affichage des messages

```c noexec
static void print_message(char *message, const size_t message_length,
                          InputString *input_string) {
    if (message_length == 0) return;
    
    // Clear current line
    printf(CLEAR_LINE);
    
    // Parse message format: "username@content"
    char *at = strchr(message, '@');
    if (at != NULL) {
        *at = '\0';
        const char *name = message;
        const char *message_content = at + 1;
        
        // Get current time
        const time_t now = time(NULL);
        const struct tm *t = localtime(&now);
        
        // Display: "HH:MM: username: message"
        printf("%02d:%02d: %s: %s", t->tm_hour, t->tm_min, 
               name, message_content);
    } else {
        printf("invalid message received: %s", message);
    }
    
    if (message[message_length - 1] != '\n') {
        putc('\n', stdout);
    }
    
    // Redraw input prompt
    input_string_draw(input_string);
}
```

### 4. Mode raw du terminal

Le terminal normal est en **mode ligne** - la saisie n'est disponible qu'apres avoir appuye sur Entree.

Le **mode raw** permet la saisie caractere par caractere :

```c noexec
static void terminal_enable_raw_mode() {
    struct termios terminal;
    tcgetattr(STDIN_FILENO, &terminal);
    
    // Disable canonical mode and echo
    terminal.c_lflag &= ~(ICANON | ECHO);
    
    tcsetattr(STDIN_FILENO, TCSANOW, &terminal);
}

static void terminal_disable_raw_mode() {
    struct termios terminal;
    tcgetattr(STDIN_FILENO, &terminal);
    
    // Re-enable canonical mode and echo
    terminal.c_lflag |= (ICANON | ECHO);
    
    tcsetattr(STDIN_FILENO, TCSANOW, &terminal);
}
```

**Pourquoi c'est necessaire :** Pour afficher le prompt avec le texte en cours de saisie en temps reel tout en recevant des messages.

### 5. Gestion des threads

```c noexec
int main(const int argc, char *argv[]) {
    // ... parse args, setup socket ...
    
    InputString *input_string = input_string_init();
    
    // Create receive thread
    pthread_t receive_messages;
    ReceiveMessagesThread receive_data = {
        .sock = sock,
        .input_string = input_string,
    };
    pthread_create(&receive_messages, NULL, 
                   receive_messages_thread, &receive_data);
    
    // Create send thread
    pthread_t send_messages;
    SendMessagesThread send_data = {
        .sock = sock,
        .port = port,
        .address = args.address,
        .username = args.name,
        .input_string = input_string,
    };
    pthread_create(&send_messages, NULL, 
                   send_messages_thread, &send_data);
    
    // Wait for send thread (blocks until user exits)
    pthread_join(send_messages, NULL);
    
    // Cancel and cleanup receive thread
    pthread_cancel(receive_messages);
    pthread_join(receive_messages, NULL);
    
    // Cleanup
    input_string_destroy(input_string);
    close(sock);
    
    return EXIT_SUCCESS;
}
```

---

## Compilation et execution

### Compiler

```bash
gcc -pthread -o chat main.c
# -pthread: Link pthread library
```

### Lancer plusieurs instances

```bash
# Terminal 1
./chat 224.0.0.10 10000 Alice

# Terminal 2
./chat 224.0.0.10 10000 Bob

# Terminal 3
./chat 224.0.0.10 10000 Charlie
```

### Utilisation

Taper un message et appuyer sur Entree pour envoyer.

**Touches speciales :**
- `Ctrl+D` ou `Ctrl+C` - Quitter
- `Backspace` / `Delete` - Supprimer un caractere
- `Ctrl+L` - Effacer l'ecran

**Exemple de chat :**
```
❯ Hello everyone!
10:30: Alice: Hello everyone!
10:30: Bob: Hi Alice!
❯ How are you?
10:31: Alice: How are you?
10:31: Charlie: Good, thanks!
```

---

## Protocole de messages

### Format

```
<username>@<message content>
```

### Exemples

```
Alice@Hello world
Bob@How is everyone?
Charlie@I'm good!
```

### Pourquoi le separateur @ ?

- Simple a parser avec `strchr()`
- Peu probable dans les noms d'utilisateur
- Delimiteur clair pour le debugging

### Ameliorations

**Format JSON :**
```json
{
  "user": "Alice",
  "message": "Hello world",
  "timestamp": 1234567890
}
```

**Format binaire :**
```c noexec
struct Message {
    uint32_t timestamp;
    uint8_t username_len;
    char username[32];
    uint16_t message_len;
    char message[256];
};
```

---

## Multicast vs autres approches

### Unicast (un-a-un)

```
Sender → Receiver 1
Sender → Receiver 2
Sender → Receiver 3
```

**Cout :** N messages pour N recepteurs

### Broadcast (un-a-tous)

```
Sender → [All hosts on network]
```

**Problemes :**
- Inonde le reseau
- Tous les hotes traitent le paquet (meme ceux qui ne sont pas interesses)
- Non routable

### Multicast (un-a-plusieurs)

```
Sender → [Multicast Group] → Receivers (who joined group)
```

**Avantages :**
- Un seul paquet pour plusieurs recepteurs
- Seuls les hotes interesses recoivent
- Routable (avec la bonne configuration)

---

## Analyse reseau

### Capture Wireshark

**Filtre :** `ip.dst == 224.0.0.10`

**Structure du paquet :**
```
Ethernet Header
├─ Destination MAC: 01:00:5E:00:00:0A (multicast MAC)
└─ Source MAC: <sender MAC>

IP Header
├─ Source IP: <sender IP>
├─ Destination IP: 224.0.0.10 (multicast group)
└─ Protocol: 17 (UDP)

UDP Header
├─ Source Port: <ephemeral>
├─ Destination Port: 10000
└─ Length: <data length>

Data
└─ "Alice@Hello world"
```

### Adresse MAC multicast

L'IP multicast correspond a une adresse MAC Ethernet multicast :
```
224.0.0.10
→ 01:00:5E:00:00:0A
```

Formule : `01:00:5E:<23 bits de poids faible de l'IP>`

---

## Synchronisation avec les mutex

### Pourquoi c'est necessaire ?

**Probleme :** Les deux threads accedent a `input_string` :
- Le thread d'envoi lit/modifie (saisie utilisateur)
- Le thread de reception affiche les messages -> redessine le prompt -> lit `input_string`

Sans synchronisation : **race condition** -> corruption/crash.

### Solution : Mutex

```c noexec
pthread_mutex_t mutex;

// Initialize
pthread_mutex_init(&mutex, NULL);

// Critical section
pthread_mutex_lock(&mutex);
// ... access shared data ...
pthread_mutex_unlock(&mutex);

// Cleanup
pthread_mutex_destroy(&mutex);
```

### Dans notre code

Chaque acces a `input_string` est protege :

```c noexec
// Append character
lock_mutex(&self->mutex);
input_string_append(thread->input_string, input_char);
unlock_mutex(&self->mutex);

// Display
lock_mutex(&self->mutex);
printf(CLEAR_LINE "❯ ");
fwrite(self->string, self->size, 1, stdout);
unlock_mutex(&self->mutex);
```

---

## Fonctionnalites avancees

### 1. Messages prives

```
/msg Bob Hello Bob!
```

Implementation :
- Parser `/msg <utilisateur> <message>`
- Envoyer un datagramme UDP unicast a l'utilisateur specifique
- Necessite de suivre les IPs des utilisateurs (protocole de decouverte necessaire)

### 2. Notifications d'arrivee/depart

```
Charlie joined the chat
Bob left the chat
```

Implementation :
- Envoyer un message special a l'arrivee : `@JOIN@Charlie`
- Envoyer au depart : `@LEAVE@Bob`
- Suivre les utilisateurs actifs dans chaque client

### 3. Historique des messages

Sauvegarder les messages dans un fichier :
```c noexec
FILE *log = fopen("chat.log", "a");
fprintf(log, "[%s] %s: %s\n", timestamp, username, message);
fclose(log);
```

### 4. Chiffrement

Chiffrer les messages avec une cle symetrique :
```c noexec
// Pseudo-code
encrypted = encrypt_aes(message, shared_key);
sendto(sock, encrypted, len, ...);

decrypted = decrypt_aes(received, shared_key);
```

### 5. Transfert de fichiers

Envoyer un fichier via multicast :
```
Alice@FILE:image.jpg:12345  (announce file, size)
Alice@CHUNK:0:...binary...  (send chunks)
Alice@CHUNK:1:...binary...
...
Alice@DONE:image.jpg        (transfer complete)
```

Les recepteurs reassemblent les morceaux.

---

## Depannage

### Messages non recus

**Verifier :**
1. Adresse multicast correcte ? (224.0.0.x)
2. Port correct sur toutes les instances ?
3. Pare-feu bloquant ?
4. Groupe multicast rejoint ?

```bash
# Check multicast membership (Linux)
netstat -g

# Test with netcat (if available)
nc -u 224.0.0.10 10000
```

### Ses propres messages ne sont pas visibles

**Cause :** Loopback multicast desactive

**Solution :** Activer le loopback :
```c noexec
unsigned char loop = 1;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_LOOP, &loop, sizeof(loop));
```

### Messages uniquement sur la machine locale

**Cause :** TTL = 0 (par defaut)

**Solution :** Augmenter le TTL :
```c noexec
unsigned char ttl = 5;  // Up to 5 router hops
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl));
```

### Terminal casse apres la sortie

**Cause :** Mode raw non restaure

**Solution :** Assurer le nettoyage avec `atexit()` :
```c noexec
atexit(terminal_disable_raw_mode);
```

Ou manuellement :
```bash
reset  # Reset terminal
```

---

## Points a retenir

1. **Multicast = communication un-vers-plusieurs** efficace
2. **IP_ADD_MEMBERSHIP** rejoint un groupe multicast
3. **SO_REUSEADDR** permet plusieurs recepteurs sur le meme port
4. **pthreads** permettent les operations concurrentes
5. **Les mutex** protegent les donnees partagees des race conditions
6. **Le mode raw du terminal** pour la saisie caractere par caractere
7. **Le protocole de messages** definit le comportement de l'application
8. **sendto()** pour le multicast (destination = adresse du groupe)
9. **recv()** recoit de n'importe quel membre du groupe

---

## Fichiers dans ce repertoire

### Code source (`src/`)
- `main.c` - Implementation complete du chat multicast

### Documentation
- `tp5.pdf` - Enonce du TP

### Compilation

```bash
gcc -pthread -o chat main.c -Wall -Wextra
./chat 224.0.0.10 10000 YourName
```

---

## Pour aller plus loin

- RFC 1112 (IP Multicast)
- RFC 2236 (IGMP v2)
- RFC 3376 (IGMP v3)
- Programmation POSIX Threads (pthreads)
- `man 7 ip` - Options socket IP
- `man pthread_create`, `man pthread_mutex_lock`
- Controle du terminal (`man termios`)

---

## Comparaison avec les applications de chat modernes

Ce TP demontre les concepts fondamentaux utilises dans les applications temps reel :

| Concept | Notre implementation | Industrie (ex: Slack, Discord) |
|---------|---------------------|-------------------------------|
| Communication de groupe | Multicast IP | Pub/Sub (Redis, Kafka) |
| Temps reel | Multicast UDP | WebSocket sur TCP |
| Format des messages | Texte : `user@msg` | JSON ou Protocol Buffers |
| Livraison | Best-effort UDP | Fiable (TCP + ACK) |
| Persistance | Aucune | Stockage en base de donnees |
| Scalabilite | Reseau local | Infrastructure cloud |
| Securite | Aucune | TLS, authentification, chiffrement |

Malgre sa simplicite, notre chat demontre les principes fondamentaux applicables aux systemes de production.
