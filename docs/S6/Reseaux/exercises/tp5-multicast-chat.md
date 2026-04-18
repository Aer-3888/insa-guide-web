---
title: "TP5 - Application de chat multicast en C"
sidebar_position: 5
---

# TP5 - Application de chat multicast en C

> D'apres les instructions de l'enseignant : S6/Reseaux/data/moodle/tp/TP5/README.md

Ce TP construit une application de chat multicast en C utilisant :
- **IP Multicast** : communication un-vers-plusieurs via adresse de groupe (224.x.x.x)
- **pthreads** : threads concurrents pour envoi et reception simultanees
- **Mutex** : synchronisation de l'acces au buffer partage
- **Terminal raw mode** : lecture caractere par caractere sans attendre Enter

**Fichier produit** : `main.c` (tout en un seul fichier, ~615 lignes)

---

## Concepts multicast

### Exercice 1 : Comprendre le multicast IP et ses differences avec l'unicast et le broadcast.

**Reponse :**

```
Unicast (un-a-un)           Multicast (un-a-plusieurs)       Broadcast (un-a-tous)
  Emetteur                    Emetteur                         Emetteur
     |                           |                                |
     +---> Recepteur A           +---> Groupe 224.0.0.10          +---> Tous les hotes
     +---> Recepteur B                  |-> Recepteur A                 |-> Recepteur A
     +---> Recepteur C                  |-> Recepteur C                 |-> Recepteur B
  3 paquets envoyes           1 paquet envoye                  1 paquet envoye
  (seuls A,B,C recoivent)    (seuls A,C recoivent, B non)     (TOUS recoivent, meme B)
```

- **Unicast** : 1 paquet par destinataire. Couteux si N destinataires.
- **Multicast** : 1 paquet, livre a tous les membres du groupe. Efficace.
- **Broadcast** : 1 paquet, livre a TOUS les hotes du reseau (meme ceux pas interesses).

**Adresses multicast IPv4** (plage 224.0.0.0 -- 239.255.255.255) :

| Plage | Usage |
|-------|-------|
| 224.0.0.0 -- 224.0.0.255 | Reseau local (non route par les routeurs) |
| 224.0.1.0 -- 238.255.255.255 | Multicast global (routable) |
| 239.0.0.0 -- 239.255.255.255 | Organisation locale (prive) |

Pour ce TP, on utilise `224.0.0.10` (local, non route).

**Multicast et adresses MAC** :

L'adresse IP multicast est traduite en adresse MAC multicast :
```
IP  224.0.0.10  -->  MAC 01:00:5E:00:00:0A
Formule : 01:00:5E + 23 bits de poids faible de l'adresse IP
```

**Pourquoi UDP obligatoire ?** Le multicast fonctionne uniquement avec UDP. TCP necessite une connexion point-a-point (1 client, 1 serveur). Le multicast n'a pas de notion de connexion : n'importe qui peut envoyer au groupe, n'importe quel membre recoit.

---

## Architecture de l'application

### Exercice 2 : Comprendre l'architecture a deux threads de l'application de chat et pourquoi un mutex est necessaire.

**Reponse :**

```
                          main()
                            |
               +------------+------------+
               |                         |
         setup socket             setup terminal
         join multicast           InputString (shared)
         bind port                      |
               |                        |
     +---------+---------+              |
     |                   |              |
pthread_create()    pthread_create()    |
     |                   |              |
     v                   v              |
  Receive             Send              |
  Thread              Thread            |
  ------              ------            |
  while(1):           while(1):         |
    recv()              draw prompt  <--+
    parse msg           fgetc(stdin)    |
    display             if '\n':        |
    redraw prompt         format msg    |
                          sendto()      |
                        if Ctrl+D:      |
                          break         |
                                        |
                          pthread_join(send)
                          pthread_cancel(recv)
                          cleanup
```

**Donnee partagee** : `InputString` -- le texte en cours de saisie par l'utilisateur.
- Le thread d'envoi le **modifie** (ajout de caracteres, effacement, vidage apres envoi).
- Le thread de reception le **lit** (pour redessiner le prompt apres affichage d'un message recu).
- Un **mutex** protege chaque acces pour eviter les race conditions.

**Sans mutex (race condition)** :
```
Thread Envoi                    Thread Reception
-----------                     ----------------
input_string->size = 5          |
|                               print_message()
|                               |  input_string_draw()
input_string_append('a')        |    printf(input_string->string)
  -> realloc() en cours         |       -> LIT une adresse INVALIDEE
  -> CRASH / corruption         |          par le realloc
```

**Avec mutex (correct)** :
```
Thread Envoi                    Thread Reception
-----------                     ----------------
lock_mutex()                    |
  input_string_append('a')      lock_mutex()   <- BLOQUE (attend)
  -> realloc() safe             |
unlock_mutex()                  |              <- DEBLOQUE
                                |  input_string_draw()
                                |    printf(input_string->string)
                                |    -> LIT une adresse VALIDE
                                unlock_mutex()
```

---

## Implementation complete : main.c

### Exercice 3 : Implementer les en-tetes, macros, structures de donnees et fonctions utilitaires.

**Reponse :**

```c noexec
/**
 * TP 5: Multicast Chat
 */

#include <arpa/inet.h>
#include <assert.h>
#include <errno.h>
#include <libgen.h>
#include <netinet/in.h>
#include <pthread.h>         /* pthreads : threads POSIX */
#include <stdarg.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <termios.h>         /* termios : controle du terminal */
#include <time.h>
#include <unistd.h>

#define VERSION "1.0.0"
#define STRING_DEFAULT_CAPACITY 2
```

**Macro-based argument definition** -- allows generic parsing and help generation:

```c noexec
/**
 * Macro that defines the command-line flags.
 * Each FLAG(name, short_name, description) generates:
 * - A bool field in Args struct
 * - Parsing for -h/--help, -v/--version
 */
#define ARGS_FLAGS                                   \
    FLAG(help, h, "show this help message and exit") \
    FLAG(version, v, "show program's version number and exit")

/**
 * Macro that defines positional parameters.
 * Each PARAM(name, DISPLAY_NAME, description) generates:
 * - A char* field in Args struct
 * - Positional parsing in declaration order
 */
#define ARGS_PARAMS                                         \
    PARAM(address, ADDRESS,                                 \
          "the multicast address to use (e.g. 224.0.0.10)") \
    PARAM(port, PORT, "the port to use (e.g. 10000)")       \
    PARAM(name, NAME, "the name of the user")

/**
 * Structure containing the parsed arguments.
 * Macros FLAG and PARAM generate the fields automatically.
 */
typedef struct {
#define FLAG(name, short_name, description) bool name;
    ARGS_FLAGS
#undef FLAG
#define PARAM(name, param_name, description) char *name;
    ARGS_PARAMS
#undef PARAM
} Args;
```

**Data structures** -- shared state and thread parameter structs:

```c noexec
/**
 * Shared input buffer between threads.
 * Protected by a mutex to prevent race conditions.
 */
typedef struct {
    size_t capacity;          /* Allocated size */
    size_t size;              /* Current character count */
    char *string;             /* Character buffer */
    pthread_mutex_t mutex;    /* Protection mutex */
} InputString;

/**
 * Data passed to the send thread.
 */
typedef struct {
    int sock;                 /* Shared UDP socket */
    int port;                 /* Multicast group port */
    const char *username;     /* User's name */
    const char *address;      /* Multicast address (e.g. "224.0.0.10") */
    InputString *input_string; /* Shared input buffer */
} SendMessagesThread;

/**
 * Data passed to the receive thread.
 */
typedef struct {
    int sock;                 /* Shared UDP socket */
    InputString *input_string; /* Shared input buffer */
} ReceiveMessagesThread;
```

**Utility functions** -- error handling, pthread checking, safe allocation:

```c noexec
static const char *program_name = NULL;

#define PRINTF_LIKE __attribute__((format(printf, 1, 2)))
#define NORETURN __attribute__((__noreturn__))

/**
 * Print error message and exit the program.
 */
static void error(const char *format, ...) PRINTF_LIKE NORETURN;
static void error(const char *format, ...) {
    assert(program_name && "no program name");
    fprintf(stderr, "%s: error: ", program_name);
    va_list args;
    va_start(args, format);
    vfprintf(stderr, format, args);
    va_end(args);
    fputc('\n', stderr);
    _exit(EXIT_FAILURE);
}

/**
 * Check pthread return code. pthread functions return 0 on success
 * and an error code on failure (unlike system calls which return -1
 * and set errno).
 */
static void check_pthread_code(const int code, const char *message) {
    if (code == 0) return;
    error("%s: %s", message, strerror(code));
}

static bool string_equals(const char *string1, const char *string2) {
    return strcmp(string1, string2) == 0;
}

/**
 * malloc() with error checking.
 */
void *safe_malloc(const size_t size) {
    void *ptr = malloc(size);
    if (ptr == NULL) {
        error("failed to allocate memory: %s", strerror(errno));
    }
    return ptr;
}
```

### Exercice 4 : Implementer l'analyseur d'arguments en ligne de commande avec le systeme de macros.

**Reponse :**

```c noexec
/**
 * Print program usage line.
 */
static void print_usage(const char *program_name, FILE *stream) {
    fprintf(
        stream,
        "usage: %s "
#define FLAG(name, short_name, description) "[-" #short_name "] "
    ARGS_FLAGS
#undef FLAG
#define PARAM(name, param_name, description) #param_name " "
    ARGS_PARAMS
#undef PARAM
        "\n",
        program_name
    );
}

/**
 * Print full help message.
 */
static void print_help(const char *program_name) {
    print_usage(program_name, stdout);
    printf(
        "\n"
        "Control your desktop with a controller.\n"
        "\n"
        "positional arguments:\n"
#define PARAM(name, param_name, description) "    %-21s " description "\n"
    ARGS_PARAMS
#undef PARAM
        "\n"
        "options:\n"
#define FLAG(name, short_name, description) \
    "    -" #short_name ", --%-15s " description "\n"
    ARGS_FLAGS
#undef FLAG
#define PARAM(name, param_name, description) , #param_name
    ARGS_PARAMS
#undef PARAM
#define FLAG(name, short_name, description) , #name
    ARGS_FLAGS
#undef FLAG
    );
}

#define CHAR(c) #c[0]

/**
 * Parse command-line arguments.
 * Handles both flags (-h, --help) and positional params (address, port, name).
 */
static void args_parse(Args *args, char *argv[], const char *program_name) {
    for (; *argv; ++argv) {
        if ((*argv)[0] == '-' && (*argv)[1]) {
            if ((*argv)[1] == '-') {
                /* Long flags: --help, --version */
#define FLAG(name, short_name, description) \
    if (string_equals(*argv, "--" #name)) { \
        args->name = true;                  \
        continue;                           \
    }
    ARGS_FLAGS
#undef FLAG
            } else {
                /* Short flags: -h, -v */
                for (size_t i = 1; (*argv)[i]; ++i) {
#define FLAG(name, short_name, description) \
    if ((*argv)[i] == CHAR(short_name)) {   \
        args->name = true;                  \
        continue;                           \
    }
    ARGS_FLAGS
#undef FLAG
                    print_usage(program_name, stderr);
                    error("unrecognized arguments: '-%c'", (*argv)[i]);
                }
                continue;
            }
        }

        /* Positional parameters: fill in order of declaration */
#define PARAM(field, name, description) \
    if (args->field == NULL) { \
        args->field = *argv; \
        continue; \
    }
    ARGS_PARAMS
#undef PARAM

        print_usage(program_name, stderr);
        error("unrecognized arguments: '%s'", *argv);
    }
}
```

**Usage** :
```bash
./chat ADDRESS PORT NAME
./chat 224.0.0.10 10000 Alice
./chat -h          # shows help
./chat --version   # shows version
```

### Exercice 5 : Implementer le buffer partage InputString avec protection par mutex.

**Reponse :**

```c noexec
/**
 * Mutex wrappers with error checking.
 */
static void lock_mutex(pthread_mutex_t *mutex) {
    check_pthread_code(pthread_mutex_lock(mutex), "failed to lock mutex");
}

static void unlock_mutex(pthread_mutex_t *mutex) {
    check_pthread_code(pthread_mutex_unlock(mutex), "failed to unlock mutex");
}

/**
 * Initialize an InputString.
 * Capacity starts at 2 and doubles dynamically when full.
 */
static InputString *input_string_init(void) {
    InputString *self = safe_malloc(sizeof(*self));
    self->capacity = STRING_DEFAULT_CAPACITY;
    self->size = 0;
    self->string = safe_malloc(sizeof(*self->string) * self->capacity);

    /* pthread_mutex_init(&mutex, attr)
     *   Initializes a mutex. attr = NULL = default (non-recursive).
     *   Returns 0 on success. */
    check_pthread_code(pthread_mutex_init(&self->mutex, NULL),
                       "failed to initialize mutex");
    return self;
}

/**
 * Append a character to the buffer (with dynamic resizing).
 * WARNING: this function does NOT lock the mutex.
 * The caller must hold the mutex before calling.
 */
static void input_string_append(InputString *self, const char chr) {
    if (self->size == self->capacity) {
        self->capacity *= 2;
        self->string = realloc(self->string,
                               sizeof(*self->string) * self->capacity);
    }
    self->string[self->size++] = chr;
}

/**
 * Clear the buffer.
 */
static void input_string_clear(InputString *self) {
    self->size = 0;
}

/* ANSI escape to clear current line and return cursor to start */
#define CLEAR_LINE "\r\33[2K"

/**
 * Display the prompt with current buffer content.
 * Protected by mutex because the receive thread can call this
 * while the send thread modifies the buffer.
 */
static void input_string_draw(InputString *self) {
    lock_mutex(&self->mutex);
    printf(CLEAR_LINE ">>> ");
    fwrite(self->string, self->size, 1, stdout);
    fflush(stdout);
    unlock_mutex(&self->mutex);
}

/**
 * Free memory and destroy the mutex.
 */
static void input_string_destroy(InputString *self) {
    free(self->string);
    check_pthread_code(pthread_mutex_destroy(&self->mutex),
                       "failed to destroy mutex");
    free(self);
}
```

### Exercice 6 : Implementer le mode raw du terminal pour la saisie caractere par caractere.

**Reponse :**

En mode normal (canonique), le terminal bufferise la saisie ligne par ligne : `fgetc()` ne retourne qu'apres que l'utilisateur ait appuye sur Entree, et les caracteres saisis sont affiches automatiquement.

En mode raw, chaque caractere est disponible immediatement (pas besoin d'Entree) et l'echo est desactive (on gere l'affichage nous-memes via `input_string_draw`).

```c noexec
/**
 * Enable terminal raw mode.
 *
 * API: tcgetattr(fd, &termios) -- read current config
 *      tcsetattr(fd, when, &termios) -- apply new config
 *      TCSANOW: apply immediately
 *      ICANON: canonical mode (disabled here)
 *      ECHO: automatic echo (disabled here)
 */
static void terminal_enable_raw_mode() {
    struct termios terminal;
    tcgetattr(STDIN_FILENO, &terminal);
    terminal.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &terminal);
}

/**
 * Restore terminal to normal mode.
 * CRITICAL: always call on exit, otherwise the terminal stays
 * in raw mode and becomes unusable.
 */
static void terminal_disable_raw_mode() {
    struct termios terminal;
    tcgetattr(STDIN_FILENO, &terminal);
    terminal.c_lflag |= (ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &terminal);
}
```

### Exercice 7 : Implementer la fonction d'affichage des messages qui parse le protocole "username@contenu".

**Reponse :**

Format du protocole de messages : `<username>@<contenu du message>\n\0`

Parsing a la reception :
```c noexec
char *at = strchr(buffer, '@');    /* Find the '@' */
*at = '\0';                         /* Split the string */
const char *name = buffer;          /* Before '@' = username */
const char *content = at + 1;       /* After '@' = message */
```

```c noexec
/**
 * Display a received message in format "HH:MM: name: content"
 * then redraw the input prompt.
 */
static void print_message(char *message, const size_t message_length,
                          InputString *input_string) {
    if (message_length == 0) return;

    /* Clear the current line (the prompt being displayed) */
    printf(CLEAR_LINE);

    /* Parse the message: find the '@' separator */
    char *at = strchr(message, '@');
    if (at != NULL) {
        *at = '\0';                        /* Split string at '@' */
        const char *name = message;        /* Before '@' = username */
        const char *message_content = at + 1;  /* After '@' = content */

        /* Timestamp */
        const time_t now = time(NULL);
        const struct tm *t = localtime(&now);
        printf("%02d:%02d: %s: %s", t->tm_hour, t->tm_min,
               name, message_content);
    } else {
        printf("invalid message received: %s", message);
    }

    if (message[message_length - 1] != '\n') {
        putc('\n', stdout);
    }

    /* Redraw prompt so user sees their in-progress text */
    input_string_draw(input_string);
}
```

### Exercice 8 : Implementer le thread de reception qui ecoute les messages multicast.

**Reponse :**

Le thread de reception tourne dans une boucle infinie. Puisque le socket a rejoint le groupe multicast (via `IP_ADD_MEMBERSHIP`) et est lie au port du groupe, `recv()` recoit les datagrammes envoyes au groupe. Le thread est annule via `pthread_cancel()` quand le thread d'envoi se termine.

```c noexec
/**
 * Receive thread: listens for multicast messages.
 * Runs until cancelled by pthread_cancel().
 * recv() is a cancellation point so the thread can be cancelled
 * while blocking on recv().
 */
static void *receive_messages_thread(void *data) {
    ReceiveMessagesThread *thread = data;

    while (true) {
        char buffer[2048];
        memset(buffer, 0, sizeof(buffer));

        /* recv(socket, buffer, length, flags)
         *   Receives data from the socket.
         *   In UDP multicast, receives the next datagram for the group.
         *   Returns the number of bytes received.
         *   Blocks if no message available. */
        const ssize_t message_size = recv(thread->sock, &buffer,
                                          sizeof(buffer), 0);
        if (message_size == 0) continue;

        const size_t buffer_length = strlen(buffer);
        print_message(buffer, buffer_length, thread->input_string);
    }

    return NULL;
}
```

### Exercice 9 : Implementer le thread d'envoi qui lit la saisie clavier et envoie les messages au groupe multicast.

**Reponse :**

Le thread d'envoi gere :
- L'activation du mode raw du terminal (lecture caractere par caractere)
- Le redessin du prompt apres chaque frappe
- La gestion des touches speciales : Backspace (127), Ctrl+L (12), Ctrl+D (4/EOF)
- A l'appui sur Entree : formater le message comme `username@contenu\n\0`, envoyer via `sendto()` au groupe multicast, vider le buffer

```c noexec
/**
 * Send thread: reads keyboard and sends to multicast group.
 * Exits when user presses Ctrl+D (EOF).
 */
static void *send_messages_thread(void *data) {
    const SendMessagesThread *thread = data;

    /* Setup destination address = multicast group */
    struct sockaddr_in destination_address = {
        .sin_family = AF_INET,
        .sin_port = htons(thread->port),
    };

    /* inet_pton(af, src_string, dst_binary)
     *   Converts IP address string to binary.
     *   More modern than inet_aton(): supports IPv4 and IPv6.
     *   Returns 1 on success, 0 if invalid format, -1 on error. */
    if (inet_pton(AF_INET, thread->address,
                  &destination_address.sin_addr) != 1) {
        error("invalid multicast address: %s", strerror(errno));
    }

    /* Enable raw mode for character-by-character reading */
    terminal_enable_raw_mode();
    /* Register cleanup for program exit */
    atexit(terminal_disable_raw_mode);

    while (true) {
        /* Display prompt with current typed text */
        input_string_draw(thread->input_string);

        /* Read one character (raw mode = no Enter needed) */
        char input_char = fgetc(stdin);

        /* --- Ctrl+D (EOF): quit --- */
        if (input_char == EOF || input_char == 4) break;

        /* --- Backspace (code 127): delete last character --- */
        if (input_char == 127) {
            lock_mutex(&thread->input_string->mutex);
            if (thread->input_string->size)
                --thread->input_string->size;
            unlock_mutex(&thread->input_string->mutex);
            continue;
        }

        /* --- Ctrl+L (code 12): clear screen --- */
        if (input_char == 12) {
            printf("\033[H\033[J");   /* ANSI: cursor home + erase display */
            continue;
        }

        /* --- Enter: send message --- */
        if (input_char == '\n') {
            if (thread->input_string->size) {
                lock_mutex(&thread->input_string->mutex);

                /* Terminate string with '\n' and '\0' */
                input_string_append(thread->input_string, input_char);
                input_string_append(thread->input_string, '\0');

                /* Format message: "username@content\n\0"
                 * +1 for the '\0' from snprintf */
                const size_t message_length =
                    1 + strlen(thread->username) +
                    thread->input_string->size;
                char *message = safe_malloc(sizeof(*message) * message_length);

                snprintf(message, message_length, "%s@%s",
                         thread->username,
                         thread->input_string->string);

                input_string_clear(thread->input_string);
                unlock_mutex(&thread->input_string->mutex);

                /* sendto(socket, buffer, length, flags, dest_addr, addrlen)
                 *   Sends a UDP datagram to the specified address.
                 *   Here, dest = multicast group address.
                 *   The datagram is delivered to ALL group members. */
                if (sendto(thread->sock, message, message_length, 0,
                           (struct sockaddr *)&destination_address,
                           sizeof(destination_address)) == -1) {
                    error("failed to send message: %s", strerror(errno));
                }
                free(message);
            }
            continue;
        }

        /* --- Regular character: append to buffer --- */
        lock_mutex(&thread->input_string->mutex);
        input_string_append(thread->input_string, input_char);
        unlock_mutex(&thread->input_string->mutex);
    }

    return NULL;
}
```

### Exercice 10 : Implementer la fonction main qui configure le socket multicast, lance les threads et gere le nettoyage.

**Reponse :**

La fonction main suit ces etapes :
1. Analyser les arguments en ligne de commande
2. Creer un socket UDP (`SOCK_DGRAM`)
3. Rejoindre le groupe multicast (`IP_ADD_MEMBERSHIP`)
4. Activer la reutilisation d'adresse (`SO_REUSEADDR`) pour que plusieurs processus puissent se lier au meme port
5. Lier au port (bind)
6. Creer le `InputString` partage
7. Lancer le thread de reception
8. Lancer le thread d'envoi
9. Attendre que le thread d'envoi se termine (`pthread_join`)
10. Annuler et joindre le thread de reception (`pthread_cancel` + `pthread_join`)
11. Nettoyer les ressources

```c noexec
int main(const int argc, char *argv[]) {
    (void)argc;

    /* Get program name for error messages */
    assert(*argv && "no program name");
    program_name = basename(*argv++);

    /* --- Parse arguments --- */
    Args args = {0};
    args_parse(&args, argv, program_name);

    if (args.help) {
        print_help(program_name);
        return EXIT_SUCCESS;
    }
    if (args.version) {
        printf("%s " VERSION "\n", program_name);
        return EXIT_SUCCESS;
    }
    if (args.address == NULL) {
        print_usage(program_name, stderr);
        error("missing argument: ADDRESS");
    }
    if (args.port == NULL) {
        print_usage(program_name, stderr);
        error("missing argument: PORT");
    }

    const int port = strtol(args.port, NULL, 10);
    if (errno != 0) error("%s: not a valid port number", args.port);

    if (args.name == NULL) {
        print_usage(program_name, stderr);
        error("missing argument: NAME");
    }

    /* --- Step 1: Create UDP socket --- */
    const int sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock == -1) error("failed to create socket: %s", strerror(errno));

    /* --- Step 2: Join multicast group ---
     *
     * setsockopt(socket, IPPROTO_IP, IP_ADD_MEMBERSHIP, &mreq, len)
     *   Asks the OS to join a multicast group.
     *   The OS sends an IGMP message to the router.
     *   The socket will now receive datagrams sent to this group.
     *
     * struct ip_mreq:
     *   imr_multiaddr: multicast group address (e.g. 224.0.0.10)
     *   imr_interface: local interface to use (INADDR_ANY = all)
     */
    const struct ip_mreq option = {
        .imr_multiaddr = { .s_addr = inet_addr(args.address) },
        .imr_interface = { .s_addr = INADDR_ANY },
    };
    if (setsockopt(sock, IPPROTO_IP, IP_ADD_MEMBERSHIP,
                   &option, sizeof(option)) == -1) {
        error("failed to set IP_ADD_MEMBERSHIP option: %s", strerror(errno));
    }

    /* --- Step 3: Enable SO_REUSEADDR ---
     *
     * In multicast, ALL receivers must bind to the SAME port.
     * Without SO_REUSEADDR, the 2nd process fails with
     * "Address already in use".
     */
    const int opt = 1;
    if (setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) == -1) {
        error("failed to set SO_REUSEADDR option: %s", strerror(errno));
    }

    /* --- Step 4: Bind to port ---
     * Bind on INADDR_ANY (not the multicast address) to receive
     * datagrams destined to the group on this port. */
    const struct sockaddr_in server_addr = {
        .sin_family = AF_INET,
        .sin_port = htons(port),
        .sin_addr.s_addr = htonl(INADDR_ANY),
    };
    if (bind(sock, (struct sockaddr *)&server_addr,
             sizeof(server_addr)) == -1) {
        error("failed to bind socket: %s", strerror(errno));
    }

    /* --- Step 5: Create shared input buffer --- */
    InputString *input_string = input_string_init();

    /* --- Step 6: Spawn receive thread ---
     *
     * pthread_create(&thread, attr, start_routine, arg)
     *   Creates a new thread of execution.
     *   thread: thread ID (for later join/cancel)
     *   attr: NULL = default attributes
     *   start_routine: function to run (void *(*)(void *))
     *   arg: argument passed to the function
     *   Returns 0 on success.
     */
    pthread_t receive_messages;
    ReceiveMessagesThread receive_messages_thread_data = {
        .sock = sock,
        .input_string = input_string,
    };
    check_pthread_code(pthread_create(
        &receive_messages, NULL,
        receive_messages_thread,
        (void *)&receive_messages_thread_data
    ), "failed to create thread");

    /* --- Step 7: Spawn send thread --- */
    pthread_t send_messages;
    SendMessagesThread send_messages_thread_data = {
        .sock = sock,
        .port = port,
        .address = args.address,
        .username = args.name,
        .input_string = input_string,
    };
    check_pthread_code(pthread_create(
        &send_messages, NULL,
        send_messages_thread,
        (void *)&send_messages_thread_data
    ), "failed to create thread");

    /* --- Step 8: Wait for send thread to exit ---
     *
     * pthread_join(thread, retval)
     *   Blocks until the specified thread terminates.
     *   The send thread terminates when user presses Ctrl+D.
     */
    check_pthread_code(pthread_join(send_messages, NULL),
                       "failed to join thread");

    /* --- Step 9: Stop receive thread ---
     *
     * pthread_cancel(thread)
     *   Requests thread cancellation. The thread may be in a
     *   blocking call (recv()), it will be cancelled at a
     *   "cancellation point". recv() is a cancellation point.
     */
    check_pthread_code(pthread_cancel(receive_messages),
                       "failed to cancel thread");
    check_pthread_code(pthread_join(receive_messages, NULL),
                       "failed to join thread");

    /* --- Step 10: Cleanup --- */
    input_string_destroy(input_string);
    if (close(sock) == -1)
        error("failed to close socket: %s", strerror(errno));

    return EXIT_SUCCESS;
}
```

---

## Compilation et execution

### Exercice 11 : Compiler et lancer le chat multicast avec plusieurs utilisateurs.

**Reponse :**

#### Makefile

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -D_POSIX_C_SOURCE=200809L
LDFLAGS = -pthread

all: chat

chat: main.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

clean:
	rm -f chat

.PHONY: all clean
```

#### Compilation directe

```bash
$ gcc -pthread -Wall -Wextra -std=c11 -D_POSIX_C_SOURCE=200809L -o chat main.c
```

**Flags** :
- `-pthread` : lier la bibliotheque pthreads et definir les macros necessaires
- `-Wall -Wextra` : activer tous les avertissements utiles
- `-std=c11` : standard C11
- `-D_POSIX_C_SOURCE=200809L` : activer les extensions POSIX (pthreads, termios)

#### Execution avec 3 utilisateurs

```bash
# Terminal 1
$ ./chat 224.0.0.10 10000 Alice
>>> Hello everyone!
14:30: Alice: Hello everyone!
14:30: Bob: Hi Alice!
>>> How are you?
14:31: Alice: How are you?
14:31: Charlie: Good, thanks!
>>>

# Terminal 2
$ ./chat 224.0.0.10 10000 Bob
14:30: Alice: Hello everyone!
>>> Hi Alice!
14:30: Bob: Hi Alice!
14:31: Alice: How are you?
>>>

# Terminal 3
$ ./chat 224.0.0.10 10000 Charlie
14:30: Alice: Hello everyone!
14:30: Bob: Hi Alice!
14:31: Alice: How are you?
>>> Good, thanks!
14:31: Charlie: Good, thanks!
>>>
```

**Touches speciales** :
- `Ctrl+D` : quitter
- `Backspace` : supprimer le dernier caractere
- `Ctrl+L` : effacer l'ecran

#### Test avec netcat

```bash
# Send a message to the group (as "test")
$ echo -n "test@Hello from nc" | nc -u 224.0.0.10 10000
```

#### Verifier l'appartenance au groupe multicast

```bash
$ netstat -gn
IPv4 Multicast Group Memberships
Interface       Group           Member
lo              224.0.0.10      1
eth0            224.0.0.10      1
```

---

## Analyse reseau (Wireshark)

### Exercice 12 : Capturer et analyser le trafic multicast avec Wireshark.

**Reponse :**

**Filtre** : `ip.dst == 224.0.0.10 && udp.port == 10000`

**Structure du paquet** :

```
Ethernet Header:
  Destination MAC: 01:00:5E:00:00:0A     (multicast MAC derived from IP)
  Source MAC: aa:bb:cc:dd:ee:ff           (sender's MAC)
  Type: 0x0800 (IPv4)

IP Header:
  Source IP: 192.168.1.100                (sender's IP)
  Destination IP: 224.0.0.10              (multicast group address)
  Protocol: 17 (UDP)
  TTL: 1 (local only, default)

UDP Header:
  Source Port: 45678 (ephemeral)
  Destination Port: 10000
  Length: 25

Data:
  "Alice@Hello world\n\0"                (25 bytes)
```

**Observations cles** :
- La MAC destination `01:00:5E:00:00:0A` est une MAC multicast, pas unicast
- L'IP destination est le groupe multicast `224.0.0.10`, pas un hote specifique
- Le TTL est par defaut a 1 (reseau local uniquement)
- La charge utile contient le protocole brut `username@message`

---

## Reference des options socket

### Exercice 13 : Comprendre les options socket multicast et quand les utiliser.

**Reponse :**

| Option | Level | Description | Default |
|--------|-------|-------------|---------|
| `IP_ADD_MEMBERSHIP` | `IPPROTO_IP` | Join a multicast group | -- |
| `IP_DROP_MEMBERSHIP` | `IPPROTO_IP` | Leave a multicast group | -- |
| `IP_MULTICAST_TTL` | `IPPROTO_IP` | Number of router hops allowed | 1 |
| `IP_MULTICAST_LOOP` | `IPPROTO_IP` | Receive own messages | 1 (enabled) |
| `IP_MULTICAST_IF` | `IPPROTO_IP` | Choose outgoing interface | INADDR_ANY |
| `SO_REUSEADDR` | `SOL_SOCKET` | Multiple processes on same port | 0 (disabled) |

**Utilisation d'options supplementaires** :

```c noexec
/* Set TTL (how many router hops the packet can cross) */
unsigned char ttl = 5;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl));

/* Enable loopback (receive own messages) */
unsigned char loop = 1;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_LOOP, &loop, sizeof(loop));

/* Set outgoing interface */
struct in_addr interface_addr;
interface_addr.s_addr = inet_addr("192.168.1.100");
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_IF,
           &interface_addr, sizeof(interface_addr));
```

---

## Depannage

| Probleme | Cause | Solution |
|---------|-------|----------|
| "Address already in use" | `SO_REUSEADDR` manquant | Ajouter `setsockopt(SO_REUSEADDR)` avant `bind()` |
| Messages non recus | Groupe non rejoint | Verifier `setsockopt(IP_ADD_MEMBERSHIP)` |
| Ses propres messages invisibles | Loopback multicast desactive | `unsigned char loop = 1; setsockopt(sock, IPPROTO_IP, IP_MULTICAST_LOOP, &loop, sizeof(loop));` |
| Messages locaux uniquement | TTL = 1 (par defaut) | `unsigned char ttl = 5; setsockopt(sock, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl));` |
| Terminal casse apres un crash | Mode raw non restaure | Taper `reset` dans le terminal |
| Deadlock | Mutex verrouille deux fois par le meme thread | Ne jamais appeler une fonction prenant le mutex depuis une section deja protegee |
| Segfault dans `realloc()` | Race condition sur `InputString` | S'assurer que TOUS les acces au buffer sont proteges par le mutex |
