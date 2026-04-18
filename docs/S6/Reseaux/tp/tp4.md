---
title: "TP4 - Programmation socket en C"
sidebar_position: 4
---

# TP4 - Programmation socket en C

Programmation reseau bas niveau avec l'API sockets C sous Linux et Windows.

## Objectifs

- Maitriser l'API socket POSIX en C
- Comprendre la programmation socket multiplateforme (Linux/Windows)
- Implementer des clients/serveurs TCP et UDP en C
- Comparer la programmation socket en C et en Java

## Themes abordes

1. **Client/Serveur TCP** - Communication orientee connexion
2. **Client/Serveur UDP** - Datagrammes sans connexion
3. **Support multiplateforme** - Windows (Winsock) vs Linux
4. **Jeu "Plus ou Moins"** - Porter le jeu du TP3 en C

---

## Vue d'ensemble de l'API Socket C

### En-tetes essentiels

**Linux :**
```c noexec
#include <sys/types.h>    // Socket types
#include <sys/socket.h>   // Socket functions
#include <netinet/in.h>   // Internet address structures
#include <arpa/inet.h>    // inet_addr, inet_ntoa
#include <unistd.h>       // close()
#include <netdb.h>        // gethostbyname()
```

**Windows :**
```c noexec
#include <winsock2.h>     // Winsock API
#pragma comment(lib, "ws2_32.lib")  // Link with Winsock library
```

### Initialisation multiplateforme

```c noexec
#ifdef WIN32
static void init(void) {
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) {
        puts("WSAStartup failed!");
        exit(EXIT_FAILURE);
    }
}

static void end(void) {
    WSACleanup();
}
#else
static void init(void) { /* Nothing on Linux */ }
static void end(void) { /* Nothing on Linux */ }
#endif
```

---

## Partie 1 : Programmation TCP

### Serveur TCP

**Etapes :**
1. Creer le socket
2. Lier au port (bind)
3. Ecouter les connexions (listen)
4. Accepter les connexions clients (accept)
5. Echanger des donnees
6. Fermer la connexion

**Implementation (ServeurTCP.c) :**

```c noexec
int main(int argc, char** argv) {
    init();  // Windows initialization
    
    // Parse arguments
    if (argc != 3) {
        fprintf(stderr, "usage: %s id port\n", argv[0]);
        exit(1);
    }
    char* id = argv[1];
    short port = atoi(argv[2]);
    
    // 1. Create TCP socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        fprintf(stderr, "socket: %s\n", strerror(errno));
        exit(1);
    }
    
    // 2. Setup server address structure
    struct sockaddr_in serveur;
    serveur.sin_family = AF_INET;           // IPv4
    serveur.sin_port = htons(port);         // Port (network byte order)
    serveur.sin_addr.s_addr = htonl(INADDR_ANY);  // Any interface
    
    // 3. Bind socket to port
    if (bind(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        fprintf(stderr, "bind: %s\n", strerror(errno));
        exit(1);
    }
    
    // 4. Listen for connections (backlog = 5)
    if (listen(sock, 5) != 0) {
        fprintf(stderr, "listen: %s\n", strerror(errno));
        exit(1);
    }
    
    printf("Server %s listening on port %d\n", id, port);
    
    // 5. Main server loop
    while (1) {
        struct sockaddr_in client;
        socklen_t len = sizeof(client);
        
        // Accept client connection
        int sock_pipe = accept(sock, (struct sockaddr *)&client, &len);
        if (sock_pipe < 0) {
            fprintf(stderr, "accept: %s\n", strerror(errno));
            continue;
        }
        
        printf("Client connected: %s:%d\n",
               inet_ntoa(client.sin_addr),
               ntohs(client.sin_port));
        
        // Exchange messages (example: 3 messages)
        for (int i = 0; i < 3; i++) {
            char buf_read[256], buf_write[256];
            
            // Receive message
            int ret = recv(sock_pipe, buf_read, 256, 0);
            if (ret <= 0) {
                printf("recv: %s\n", strerror(errno));
                break;
            }
            
            printf("Received: %s\n", buf_read);
            
            // Send response
            sprintf(buf_write, "#%s=%03d#", id, i);
            ret = send(sock_pipe, buf_write, strlen(buf_write) + 1, 0);
            if (ret <= 0) {
                printf("send: %s\n", strerror(errno));
                break;
            }
            
            sleep(2);  // Simulate processing
        }
        
        // Close client connection
        close(sock_pipe);
    }
    
    end();  // Windows cleanup
    return 0;
}
```

### Client TCP

**Etapes :**
1. Creer le socket
2. Configurer l'adresse du serveur
3. Se connecter au serveur
4. Echanger des donnees
5. Fermer le socket

**Implementation (ClientTCP.c) :**

```c noexec
int main(int argc, char** argv) {
    init();
    
    if (argc != 4) {
        fprintf(stderr, "usage: %s id serveur port\n", argv[0]);
        exit(1);
    }
    
    char* id = argv[1];
    char* server_addr = argv[2];
    short sport = atoi(argv[3]);
    
    // 1. Create socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        fprintf(stderr, "socket: %s\n", strerror(errno));
        exit(1);
    }
    
    // 2. Setup server address
    struct sockaddr_in serveur;
    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(sport);
#ifdef WIN32
    serveur.sin_addr.s_addr = inet_addr(server_addr);
#else
    inet_aton(server_addr, (struct in_addr *)&serveur.sin_addr);
#endif
    
    // 3. Connect to server
    if (connect(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        fprintf(stderr, "connect: %s\n", strerror(errno));
        exit(1);
    }
    
    // Get local address info
    struct sockaddr_in moi;
    socklen_t len = sizeof(moi);
    getsockname(sock, (struct sockaddr *)&moi, &len);
    
    printf("Connected from (%s,%d) to (%s,%d)\n",
           inet_ntoa(moi.sin_addr), ntohs(moi.sin_port),
           inet_ntoa(serveur.sin_addr), ntohs(serveur.sin_port));
    
    // 4. Exchange messages
    for (int i = 0; i < 3; i++) {
        char buf_read[256], buf_write[256];
        
        // Send message
        sprintf(buf_write, "#%s=%03d", id, i);
        printf("Sending: %s\n", buf_write);
        
        int ret = send(sock, buf_write, strlen(buf_write) + 1, 0);
        if (ret <= strlen(buf_write)) {
            printf("send: %s\n", strerror(errno));
            continue;
        }
        
        // Receive response
        ret = recv(sock, buf_read, 256, 0);
        if (ret <= 0) {
            printf("recv: %s\n", strerror(errno));
            continue;
        }
        
        printf("Received: %s\n", buf_read);
    }
    
    // 5. Close connection
    close(sock);
    end();
    return 0;
}
```

### Execution de l'exemple TCP

```bash
# Compiler
gcc -o serveur ServeurTCP.c
gcc -o client ClientTCP.c

# Terminal 1 : Demarrer le serveur
./serveur SRV1 8000

# Terminal 2 : Demarrer le client
./client CLI1 127.0.0.1 8000
```

**Sortie (Serveur) :**
```
Server SRV1 listening on port 8000
Client connected: 127.0.0.1:54321
Received: #CLI1=000
Received: #CLI1=001
Received: #CLI1=002
```

**Sortie (Client) :**
```
Connected from (127.0.0.1,54321) to (127.0.0.1,8000)
Sending: #CLI1=000
Received: #SRV1=000#
Sending: #CLI1=001
Received: #SRV1=001#
Sending: #CLI1=002
Received: #SRV1=002#
```

---

## Partie 2 : Programmation UDP

### Serveur UDP

**Differences cles par rapport a TCP :**
- Pas de `listen()` ni de `accept()`
- Utilisation de `recvfrom()` et `sendto()` (incluent l'adresse de l'emetteur/destinataire)
- Chaque datagramme est independant

**Implementation (serveur_UDP2_et.c) :**

```c noexec
int main(int argc, char** argv) {
    init();
    
    if (argc != 3) {
        fprintf(stderr, "usage: %s id port\n", argv[0]);
        exit(1);
    }
    
    char* id = argv[1];
    short port = atoi(argv[2]);
    
    // 1. Create UDP socket
    int sock = socket(AF_INET, SOCK_DGRAM, 0);  // SOCK_DGRAM for UDP
    if (sock == -1) {
        fprintf(stderr, "socket: %s\n", strerror(errno));
        exit(1);
    }
    
    // 2. Bind to port
    struct sockaddr_in serveur;
    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(port);
    serveur.sin_addr.s_addr = htonl(INADDR_ANY);
    
    if (bind(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        fprintf(stderr, "bind: %s\n", strerror(errno));
        exit(1);
    }
    
    printf("UDP Server %s listening on port %d\n", id, port);
    
    // 3. Main loop - receive and respond
    while (1) {
        char buf[256];
        struct sockaddr_in client;
        socklen_t len = sizeof(client);
        
        // Receive datagram
        int ret = recvfrom(sock, buf, 256, 0,
                          (struct sockaddr *)&client, &len);
        if (ret <= 0) {
            printf("recvfrom: %s\n", strerror(errno));
            continue;
        }
        
        printf("Received from %s:%d: %s\n",
               inet_ntoa(client.sin_addr),
               ntohs(client.sin_port),
               buf);
        
        // Send response back to client
        ret = sendto(sock, buf, strlen(buf) + 1, 0,
                    (struct sockaddr *)&client, len);
        if (ret <= 0) {
            printf("sendto: %s\n", strerror(errno));
        }
    }
    
    close(sock);
    end();
    return 0;
}
```

### Client UDP

**Implementation (client_UDP2_et.c) :**

```c noexec
int main(int argc, char** argv) {
    init();
    
    if (argc != 4) {
        fprintf(stderr, "usage: %s id serveur port\n", argv[0]);
        exit(1);
    }
    
    char* id = argv[1];
    char* server_addr = argv[2];
    short port = atoi(argv[3]);
    
    // 1. Create UDP socket (no need to bind for client)
    int sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock == -1) {
        fprintf(stderr, "socket: %s\n", strerror(errno));
        exit(1);
    }
    
    // 2. Setup server address
    struct sockaddr_in serveur;
    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(port);
#ifdef WIN32
    serveur.sin_addr.s_addr = inet_addr(server_addr);
#else
    inet_aton(server_addr, (struct in_addr *)&serveur.sin_addr);
#endif
    
    // 3. Send datagrams
    for (int i = 0; i < 3; i++) {
        char buf_send[256], buf_recv[256];
        
        sprintf(buf_send, "#%s=%03d", id, i);
        printf("Sending: %s\n", buf_send);
        
        // Send datagram
        int ret = sendto(sock, buf_send, strlen(buf_send) + 1, 0,
                        (struct sockaddr *)&serveur, sizeof(serveur));
        if (ret <= 0) {
            printf("sendto: %s\n", strerror(errno));
            continue;
        }
        
        // Receive response
        struct sockaddr_in from;
        socklen_t len = sizeof(from);
        ret = recvfrom(sock, buf_recv, 256, 0,
                      (struct sockaddr *)&from, &len);
        if (ret <= 0) {
            printf("recvfrom: %s\n", strerror(errno));
            continue;
        }
        
        printf("Received: %s\n", buf_recv);
        sleep(1);
    }
    
    close(sock);
    end();
    return 0;
}
```

### Execution de l'exemple UDP

```bash
# Compiler
gcc -o udp_server serveur_UDP2_et.c
gcc -o udp_client client_UDP2_et.c

# Terminal 1 : Demarrer le serveur
./udp_server SRV 7000

# Terminal 2 : Demarrer le client
./udp_client CLI 127.0.0.1 7000
```

---

## Partie 3 : Jeu "Plus ou Moins" en C

Portage du jeu de devinette du TP3 en C.

### Serveur (ServeurPlusMoins.c)

```c noexec
int main(int argc, char** argv) {
    init();
    
    // ... socket setup code ...
    
    while (1) {
        int sock_pipe = accept(sock, (struct sockaddr *)&client, &len);
        
        // Pick random number
        srand(time(NULL));
        int target = (rand() % 100) + 1;  // 1 to 100
        
        // Send welcome
        char welcome[] = "Guess a number between 1 and 100\n";
        send(sock_pipe, welcome, strlen(welcome), 0);
        
        // Game loop
        while (1) {
            char buf[256];
            int ret = recv(sock_pipe, buf, 256, 0);
            if (ret <= 0) break;
            
            // Parse guess
            int guess = atoi(buf);
            
            // Evaluate
            char response[2];
            if (guess < target) {
                response[0] = '+';
            } else if (guess > target) {
                response[0] = '-';
            } else {
                response[0] = '=';
                send(sock_pipe, response, 1, 0);
                break;  // Game over
            }
            response[1] = '\0';
            
            send(sock_pipe, response, 1, 0);
        }
        
        close(sock_pipe);
    }
    
    return 0;
}
```

### Client (ClientPlusMoins.c)

```c noexec
int main(int argc, char** argv) {
    init();
    
    // ... connect to server ...
    
    // Read welcome message
    char buf[256];
    recv(sock, buf, 256, 0);
    printf("%s\n", buf);
    
    // Game loop
    while (1) {
        printf("Your guess: ");
        fgets(buf, 256, stdin);
        
        // Send guess
        send(sock, buf, strlen(buf), 0);
        
        // Receive response
        char response[2];
        recv(sock, response, 1, 0);
        response[1] = '\0';
        
        if (response[0] == '+') {
            printf("It's higher\n");
        } else if (response[0] == '-') {
            printf("It's lower\n");
        } else if (response[0] == '=') {
            printf("You found it!\n");
            break;
        }
    }
    
    close(sock);
    end();
    return 0;
}
```

---

## Comparaison TCP vs UDP (analyse Wireshark)

### Exercice : Capturer et comparer

1. **Demarrer Wireshark** sur l'interface loopback
2. **Lancer le client/serveur TCP**
3. **Lancer le client/serveur UDP**
4. **Comparer le nombre de paquets**

### Resultats attendus

**TCP (3 echanges de messages) :**
```
1-3:   Three-way handshake (SYN, SYN-ACK, ACK)
4-5:   Client sends msg 1, server ACKs
6-7:   Server sends response, client ACKs
8-9:   Client sends msg 2, server ACKs
10-11: Server sends response, client ACKs
12-13: Client sends msg 3, server ACKs
14-15: Server sends response, client ACKs
16-19: Four-way termination (FIN-ACK x2, ACK x2)
Total: ~19 packets
```

**UDP (3 echanges de messages) :**
```
1: Client → Server (datagram 1)
2: Server → Client (response 1)
3: Client → Server (datagram 2)
4: Server → Client (response 2)
5: Client → Server (datagram 3)
6: Server → Client (response 3)
Total: 6 packets
```

### Observation

**Q5-Q6 :** TCP a un surcout significatif du a :
- L'etablissement de connexion (3 paquets)
- Les accuses de reception pour chaque transfert de donnees
- La terminaison de connexion (4 paquets)
- Total : environ 3 fois plus de paquets qu'UDP pour les memes donnees

**Raison :** TCP garantit la fiabilite, l'ordre et le controle de flux. UDP sacrifie ces garanties pour la rapidite et la simplicite.

---

## Fonctions socket principales

### Communes a TCP et UDP

```c noexec
// Create socket
int socket(int domain, int type, int protocol);
// domain: AF_INET (IPv4), AF_INET6 (IPv6)
// type: SOCK_STREAM (TCP), SOCK_DGRAM (UDP)
// protocol: 0 (default)

// Bind to address/port
int bind(int socket, const struct sockaddr *address, socklen_t length);

// Close socket
int close(int socket);  // Linux
int closesocket(SOCKET socket);  // Windows

// Get socket name (local address)
int getsockname(int socket, struct sockaddr *address, socklen_t *length);

// Get peer name (remote address)
int getpeername(int socket, struct sockaddr *address, socklen_t *length);
```

### Specifiques a TCP

```c noexec
// Listen for connections
int listen(int socket, int backlog);
// backlog: max queued connections

// Accept connection (creates new socket for client)
int accept(int socket, struct sockaddr *address, socklen_t *length);

// Connect to server
int connect(int socket, const struct sockaddr *address, socklen_t length);

// Send data
ssize_t send(int socket, const void *buffer, size_t length, int flags);

// Receive data
ssize_t recv(int socket, void *buffer, size_t length, int flags);
```

### Specifiques a UDP

```c noexec
// Send datagram (specify destination)
ssize_t sendto(int socket, const void *buffer, size_t length,
               int flags, const struct sockaddr *dest_addr,
               socklen_t dest_len);

// Receive datagram (captures sender info)
ssize_t recvfrom(int socket, void *buffer, size_t length,
                 int flags, struct sockaddr *src_addr,
                 socklen_t *src_len);
```

---

## Structures d'adresses

### Structure d'adresse IPv4

```c noexec
struct sockaddr_in {
    sa_family_t    sin_family;  // AF_INET
    in_port_t      sin_port;    // Port (network byte order)
    struct in_addr sin_addr;    // IP address
    char           sin_zero[8]; // Padding
};

struct in_addr {
    uint32_t s_addr;  // IP address (network byte order)
};
```

### Adresse socket generique

```c noexec
struct sockaddr {
    sa_family_t sa_family;  // Address family
    char        sa_data[14];  // Address data
};
```

Utilise pour le cast de type :
```c noexec
struct sockaddr_in addr;
bind(sock, (struct sockaddr *)&addr, sizeof(addr));
```

---

## Conversion d'ordre des octets

L'ordre du reseau est **big-endian**. La machine peut etre little-endian.

```c noexec
// Host to Network (16-bit)
uint16_t htons(uint16_t hostshort);

// Network to Host (16-bit)
uint16_t ntohs(uint16_t netshort);

// Host to Network (32-bit)
uint32_t htonl(uint32_t hostlong);

// Network to Host (32-bit)
uint32_t ntohl(uint32_t netlong);
```

**Exemple :**
```c noexec
// Port 8000 in network byte order
serveur.sin_port = htons(8000);

// Display port from network byte order
printf("Port: %d\n", ntohs(serveur.sin_port));
```

---

## Conversion d'adresses

### Chaine vers binaire

```c noexec
// Linux - preferred
int inet_aton(const char *cp, struct in_addr *inp);

// Cross-platform (deprecated but widely supported)
in_addr_t inet_addr(const char *cp);

// Modern (IPv4 and IPv6)
int inet_pton(int af, const char *src, void *dst);
// af: AF_INET or AF_INET6
```

### Binaire vers chaine

```c noexec
// IPv4 only (not thread-safe)
char *inet_ntoa(struct in_addr in);

// Modern (IPv4 and IPv6, thread-safe)
const char *inet_ntop(int af, const void *src, char *dst, socklen_t size);
```

**Exemple :**
```c noexec
// String → Binary
struct in_addr addr;
inet_aton("192.168.1.1", &addr);

// Binary → String
printf("IP: %s\n", inet_ntoa(addr));
```

---

## Gestion des erreurs

### Linux

Les erreurs positionnent `errno`, a verifier avec `strerror()` :

```c noexec
if (connect(sock, ...) < 0) {
    fprintf(stderr, "connect: %s\n", strerror(errno));
    exit(1);
}
```

### Windows

Utiliser `WSAGetLastError()` :

```c noexec
if (connect(sock, ...) == SOCKET_ERROR) {
    fprintf(stderr, "connect failed: %d\n", WSAGetLastError());
    exit(1);
}
```

---

## Problemes courants

### 1. Bind echoue avec "Address already in use"

**Solution :** Activer SO_REUSEADDR :
```c noexec
int opt = 1;
setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
```

### 2. Connect echoue immediatement

**Causes :**
- Serveur non demarre
- Mauvaise IP/mauvais port
- Pare-feu bloquant

**Debugger :**
```bash
netstat -tuln | grep 8000  # Check if server listening
telnet 127.0.0.1 8000      # Test connection
```

### 3. recv() retourne 0

**Signification :** Le pair a ferme la connexion proprement (a envoye FIN).

**Action :** Fermer le socket et quitter.

### 4. Envoi/reception partiel

`send()` et `recv()` peuvent transferer moins que demande.

**Solution :** Boucler jusqu'a completion :
```c noexec
ssize_t send_all(int sock, const void *buf, size_t len) {
    size_t total = 0;
    while (total < len) {
        ssize_t sent = send(sock, buf + total, len - total, 0);
        if (sent <= 0) return sent;  // Error
        total += sent;
    }
    return total;
}
```

---

## Points a retenir

1. **Les sockets C sont bas niveau** - plus de controle, plus de responsabilite
2. **Differences multiplateforme** - Winsock vs POSIX
3. **L'ordre des octets compte** - utiliser htons/ntohs/htonl/ntohl
4. **La verification d'erreurs est essentielle** - les operations reseau peuvent echouer
5. **Compromis TCP vs UDP** - fiabilite vs efficacite
6. **Structures d'adresses** - sockaddr_in pour IPv4
7. **Gestion des ressources** - toujours fermer les sockets avec close()

---

## Fichiers dans ce repertoire

### Code source (`src/`)
- `ClientTCP.c` - Implementation du client TCP
- `ServeurTCP.c` - Implementation du serveur TCP
- `client_UDP2_et.c` - Client UDP
- `serveur_UDP2_et.c` - Serveur UDP
- `ClientPlusMoins.c` - Client du jeu de devinette
- `ServeurPlusMoins.c` - Serveur du jeu de devinette

### Documentation
- `TP4 Res.pdf` - Enonce du TP
- `fire.txt` - Fichier de donnees exemple

### Compilation

```bash
# Linux
gcc -o client ClientTCP.c
gcc -o server ServeurTCP.c

# Windows (MinGW or Visual Studio)
cl ClientTCP.c /link ws2_32.lib
```

---

## Pour aller plus loin

- Beej's Guide to Network Programming (excellent tutoriel sur les sockets C)
- `man 2 socket`, `man 2 bind`, `man 2 connect` (pages man Linux)
- Documentation Winsock (Microsoft Docs)
- Stevens, "Unix Network Programming" (reference classique)
