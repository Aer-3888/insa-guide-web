---
title: "TP4 - Programmation socket en C"
sidebar_position: 4
---

# TP4 - Programmation socket en C

> D'apres les instructions de l'enseignant : S6/Reseaux/data/moodle/tp/TP4/README.md

Ce TP porte les programmes Java des TPs precedents en C avec l'API POSIX sockets :
1. **Client/Serveur TCP** : echanges de messages avec connexion.
2. **Client/Serveur UDP** : echanges de messages sans connexion.
3. **Plus ou Moins en C** : le jeu de devinette du TP3, porte en C.

---

## Squelette multiplateforme (Linux/Windows)

Tous les fichiers C de ce TP commencent par le meme squelette de portabilite :

```c noexec
#ifdef WIN32
#include <winsock2.h>
#elif defined(linux)
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

static void init(void) {
#ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) { puts("WSAStartup failed!"); exit(EXIT_FAILURE); }
#endif
}

static void end(void) {
#ifdef WIN32
    WSACleanup();
#endif
}
```

---

## Partie 1 : Client/Serveur TCP

### Exercice 1 : Ecrire un serveur TCP en C qui accepte les connexions, echange 3 messages avec chaque client, puis ferme la connexion.

**Reponse :**

Le serveur TCP suit ces etapes : socket() -> bind() -> listen() -> accept() -> recv()/send() -> close().

#### Code complet : ServeurTCP.c

```c noexec
/* serveur_TCP.c (serveur TCP) */

#ifdef WIN32
#include <winsock2.h>
#elif defined(linux)
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

static void init(void) {
#ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) { puts("WSAStartup failed!"); exit(EXIT_FAILURE); }
#endif
}

static void end(void) {
#ifdef WIN32
    WSACleanup();
#endif
}

#define NBECHANGE 3

char *id = 0;
short port = 0;
int sock = 0;
int nb_reponse = 0;

int main(int argc, char **argv) {
    init();
    struct sockaddr_in serveur;

    if (argc != 3) {
        fprintf(stderr, "usage: %s id port\n", argv[0]);
        exit(1);
    }
    id = argv[1];
    port = atoi(argv[2]);

    /* Create TCP socket: AF_INET=IPv4, SOCK_STREAM=TCP */
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        fprintf(stderr, "%s: socket %s\n", argv[0], strerror(errno));
        exit(1);
    }

    /* Setup server address: htons/htonl convert to network byte order */
    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(port);
    serveur.sin_addr.s_addr = htonl(INADDR_ANY);

    /* Bind socket to port */
    if (bind(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        fprintf(stderr, "%s: bind %s\n", argv[0], strerror(errno));
        exit(1);
    }

    /* Listen for connections (backlog = 5) */
    if (listen(sock, 5) != 0) {
        fprintf(stderr, "%s: listen %s\n", argv[0], strerror(errno));
        exit(1);
    }

    while (1) {
        struct sockaddr_in client;
        socklen_t len = sizeof(client);
        int sock_pipe;
        int ret, nb_question;

        /* Accept returns a NEW socket for this client */
        sock_pipe = accept(sock, (struct sockaddr *)&client, &len);

        for (nb_question = 0; nb_question < NBECHANGE; nb_question++) {
            char buf_read[1 << 8], buf_write[1 << 8];

            ret = recv(sock_pipe, buf_read, 256, 0);
            if (ret <= 0) {
                printf("%s: read=%d: %s\n", argv[0], ret, strerror(errno));
                break;
            }

            printf("srv %s recu de (%s,%4d):%s\n", id,
                   inet_ntoa(client.sin_addr), ntohs(client.sin_port), buf_read);

            sprintf(buf_write, "#%2s=%03d#", id, nb_reponse++);
            ret = send(sock_pipe, buf_write, strlen(buf_write) + 1, 0);
            if (ret <= 0) {
                printf("%s: write=%d: %s\n", argv[0], ret, strerror(errno));
                break;
            }

#ifdef WIN32
            Sleep(2000);
#else
            sleep(2);
#endif
        }
        close(sock_pipe);
    }
    end();
    return 0;
}
```

### Exercice 2 : Ecrire un client TCP en C qui se connecte au serveur, echange 3 messages, puis ferme.

**Reponse :**

#### Code complet : ClientTCP.c

```c noexec
/* Client_TCP.c (Client TCP) */

#ifdef WIN32
#include <winsock2.h>
#elif defined(linux)
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

static void init(void) {
#ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) { puts("WSAStartup failed!"); exit(EXIT_FAILURE); }
#endif
}

static void end(void) {
#ifdef WIN32
    WSACleanup();
#endif
}

#define NBECHANGE 3

char *id = 0;
short sport = 0;
int sock = 0;

int main(int argc, char **argv) {
    init();
    struct sockaddr_in moi;
    struct sockaddr_in serveur;
    int nb_question = 0;
    int ret;
    socklen_t len;

    if (argc != 4) {
        fprintf(stderr, "usage: %s id serveur port %d\n", argv[0], argc);
        exit(1);
    }
    id = argv[1];
    sport = atoi(argv[3]);

    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        fprintf(stderr, "%s: socket %s\n", argv[0], strerror(errno));
        exit(1);
    }

    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(sport);
#ifdef WIN32
    serveur.sin_addr.s_addr = inet_addr(argv[2]);
#else
    inet_aton(argv[2], (struct in_addr *)&serveur.sin_addr);
#endif

    /* connect() initiates the TCP 3-way handshake */
    if (connect(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        fprintf(stderr, "%s: connect %s\n", argv[0], strerror(errno));
        perror("bind");
        exit(1);
    }

    /* getsockname() retrieves the local address assigned by the OS */
    len = sizeof(moi);
    getsockname(sock, (struct sockaddr *)&moi, &len);

    for (nb_question = 0; nb_question < NBECHANGE; nb_question++) {
        char buf_read[1 << 8], buf_write[1 << 8];

        sprintf(buf_write, "#%2s=%03d", id, nb_question);
        printf("client %2s: (%s,%4d) envoie a ", id,
               inet_ntoa(moi.sin_addr), ntohs(moi.sin_port));
        printf(" (%s,%4d) : %s\n", inet_ntoa(serveur.sin_addr),
               ntohs(serveur.sin_port), buf_write);

        ret = send(sock, buf_write, strlen(buf_write) + 1, 0);
        if (ret <= (int)strlen(buf_write)) {
            printf("%s: erreur dans write (num=%d, mess=%s)\n",
                   argv[0], ret, strerror(errno));
            continue;
        }

        printf("client %2s: (%s,%4d) recoit de ", id,
               inet_ntoa(moi.sin_addr), ntohs(moi.sin_port));
        ret = recv(sock, buf_read, 256, 0);
        if (ret <= 0) {
            printf("%s: erreur dans read (num=%d,mess=%s)\n",
                   argv[0], ret, strerror(errno));
            continue;
        }
        printf("(%s,%4d):%s\n", inet_ntoa(serveur.sin_addr),
               ntohs(serveur.sin_port), buf_read);
    }

    close(sock);
    end();
    return 0;
}
```

**Comment tester :**

```bash
# Compile
gcc -o serveur_tcp ServeurTCP.c
gcc -o client_tcp ClientTCP.c

# Terminal 1: start server
./serveur_tcp SRV1 8000

# Terminal 2: start client
./client_tcp CLI1 127.0.0.1 8000
# Expected output:
# client CLI1: (127.0.0.1,54321) envoie a  (127.0.0.1,8000) : #CLI1=000
# client CLI1: (127.0.0.1,54321) recoit de (127.0.0.1,8000):#SRV1=000#
# client CLI1: (127.0.0.1,54321) envoie a  (127.0.0.1,8000) : #CLI1=001
# client CLI1: (127.0.0.1,54321) recoit de (127.0.0.1,8000):#SRV1=001#
# client CLI1: (127.0.0.1,54321) envoie a  (127.0.0.1,8000) : #CLI1=002
# client CLI1: (127.0.0.1,54321) recoit de (127.0.0.1,8000):#SRV1=002#
```

---

## Partie 2 : Client/Serveur UDP

### Exercice 3 : Ecrire un serveur echo UDP en C.

**Reponse :**

Differences cles par rapport a TCP : pas de listen()/accept(), utilisation de recvfrom()/sendto() qui incluent l'adresse de l'emetteur/destinataire, un seul socket pour tous les clients.

#### Code complet : serveur_UDP2_et.c

```c noexec
/* serveur_UDP.c (serveur UDP) */

#ifdef WIN32
#include <winsock2.h>
#elif defined(linux)
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

static void init(void) {
#ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) { puts("WSAStartup failed!"); exit(EXIT_FAILURE); }
#endif
}

static void end(void) {
#ifdef WIN32
    WSACleanup();
#endif
}

char *id = 0;
short port = 0;
int sock = 0;
int nb_reponse = 0;

int main(int argc, char **argv) {
    init();
    int ret;
    struct sockaddr_in serveur;

    if (argc != 3) {
        fprintf(stderr, "usage: %s id port\n", argv[0]);
        exit(1);
    }
    id = argv[1];
    port = atoi(argv[2]);

    /* SOCK_DGRAM = UDP datagram socket */
    if ((sock = socket(AF_INET, SOCK_DGRAM, 0)) == -1) {
        fprintf(stderr, "%s: socket %s\n", argv[0], strerror(errno));
        exit(1);
    }

    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(port);
    serveur.sin_addr.s_addr = htonl(INADDR_ANY);

    if (bind(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        fprintf(stderr, "%s: bind %s\n", argv[0], strerror(errno));
        exit(1);
    }

    /* No listen() or accept() in UDP */

    while (1) {
        struct sockaddr_in client;
        int client_len = sizeof(client);
        char buf_read[256], buf_write[256];

        /* recvfrom() fills client address so we know who to reply to */
        ret = recvfrom(sock, buf_read, 256, 0,
                       (struct sockaddr *)&client, (socklen_t *)&client_len);
        if (ret <= 0) {
            printf("%s: recvfrom=%d: %s\n", argv[0], ret, strerror(errno));
            continue;
        }

        printf("serveur %s recu le msg %s de %s:%d\n", id, buf_read,
               inet_ntoa(client.sin_addr), ntohs(client.sin_port));

        sprintf(buf_write, "serveur#%2s reponse%03d#", id, nb_reponse++);

        /* sendto() specifies the destination address */
        ret = sendto(sock, buf_write, 256, 0,
                     (struct sockaddr *)&client, (socklen_t)client_len);
        if (ret <= 0) {
            printf("%s: sendto=%d: %s\n", argv[0], ret, strerror(errno));
            continue;
        }
    }
    end();
    return 0;
}
```

### Exercice 4 : Ecrire un client UDP en C qui envoie 20 messages puis recoit 20 reponses.

**Reponse :**

#### Code complet : client_UDP2_et.c

```c noexec
/* client_UDP.c (client UDP) */

#ifdef WIN32
#include <winsock2.h>
#elif defined(linux)
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

static void init(void) {
#ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) { puts("WSAStartup failed!"); exit(EXIT_FAILURE); }
#endif
}

static void end(void) {
#ifdef WIN32
    WSACleanup();
#endif
}

#define NB_REQUETES 20

char *id = 0;
short sport = 0;
int sock = 0;

int main(int argc, char **argv) {
    init();
    struct sockaddr_in moi;
    struct sockaddr_in serveur;
    int nb_question = 0;
    int ret, len;
    char buf_read[256], buf_write[256];

    if (argc != 4) {
        fprintf(stderr, "usage: %s id host port\n", argv[0]);
        exit(1);
    }
    id = argv[1];
    sport = atoi(argv[3]);

    /* UDP client: no bind needed, OS assigns ephemeral port */
    if ((sock = socket(AF_INET, SOCK_DGRAM, 0)) == -1) {
        fprintf(stderr, "%s: socket %s\n", argv[0], strerror(errno));
        exit(1);
    }

    len = sizeof(moi);
    getsockname(sock, (struct sockaddr *)&moi, (socklen_t *)&len);

    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(sport);
#ifdef WIN32
    serveur.sin_addr.s_addr = inet_addr(argv[2]);
#else
    inet_aton(argv[2], (struct in_addr *)&serveur.sin_addr);
#endif

    /* Phase 1: send NB_REQUETES messages at once */
    while (nb_question < NB_REQUETES) {
        sprintf(buf_write, "#%2s=%03d", id, nb_question++);
        printf("client %2s: (%s,%4d) envoie a ", id,
               inet_ntoa(moi.sin_addr), ntohs(moi.sin_port));
        printf("(%s,%4d): %s\n", inet_ntoa(serveur.sin_addr),
               ntohs(serveur.sin_port), buf_write);

        ret = sendto(sock, buf_write, strlen(buf_write) + 1, 0,
                     (struct sockaddr *)&serveur, sizeof(serveur));
        if (ret <= 0) {
            printf("%s: erreur dans sendto (num=%d, mess=%s)\n",
                   argv[0], ret, strerror(errno));
            continue;
        }
    }

    /* Phase 2: receive NB_REQUETES responses */
    nb_question = 0;
    while (nb_question < NB_REQUETES) {
        len = sizeof(moi);
        getsockname(sock, (struct sockaddr *)&moi, (socklen_t *)&len);
        printf("client %2s: (%s,%4d) recoit de ", id,
               inet_ntoa(moi.sin_addr), ntohs(moi.sin_port));

        socklen_t serveur_len = sizeof(serveur);
        ret = recvfrom(sock, buf_read, sizeof(buf_read), 0,
                       (struct sockaddr *)&serveur, &serveur_len);
        if (ret <= 0) {
            printf("%s: erreur dans recvfrom (num=%d, mess=%s)\n",
                   argv[0], ret, strerror(errno));
            continue;
        }

        printf("(%s,%4d) : %s\n", inet_ntoa(serveur.sin_addr),
               ntohs(serveur.sin_port), buf_read);
        nb_question++;
    }

    close(sock);
    end();
    return 0;
}
```

**Comment tester :**

```bash
gcc -o serveur_udp serveur_UDP2_et.c
gcc -o client_udp client_UDP2_et.c

# Terminal 1
./serveur_udp SRV 7000

# Terminal 2
./client_udp CLI 127.0.0.1 7000
```

---

## Partie 3 : Jeu "Plus ou Moins" en C

### Exercice 5 : Porter le serveur du jeu de devinette du TP3 (Java) en C.

**Reponse :**

#### Code complet : ServeurPlusMoins.c

```c noexec
/* ServeurPlusMoins.c */

#ifdef WIN32
#include <winsock2.h>
#elif defined(linux)
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <time.h>

static void init(void) {
#ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) { puts("WSAStartup failed!"); exit(EXIT_FAILURE); }
#endif
}

static void end(void) {
#ifdef WIN32
    WSACleanup();
#endif
}

short port = 0;
int sock = 0;

int main(int argc, char **argv) {
    init();
    struct sockaddr_in serveur;

    if (argc != 2) {
        fprintf(stderr, "usage: %s port\n", argv[0]);
        exit(1);
    }
    port = atoi(argv[1]);

    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        fprintf(stderr, "%s: socket %s\n", argv[0], strerror(errno));
        exit(1);
    }

    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(port);
    serveur.sin_addr.s_addr = htonl(INADDR_ANY);

    if (bind(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        fprintf(stderr, "%s: bind %s\n", argv[0], strerror(errno));
        exit(1);
    }

    if (listen(sock, 5) != 0) {
        fprintf(stderr, "%s: listen %s\n", argv[0], strerror(errno));
        exit(1);
    }

    srandom(time(NULL));
    unsigned int to_be_guessed = 0;

    while (1) {
        struct sockaddr_in client;
        socklen_t len = sizeof(client);
        int sock_pipe;
        int ret;

        sock_pipe = accept(sock, (struct sockaddr *)&client, &len);

        /* Send welcome message (no '\0', protocol uses '\n' as delimiter) */
        char buf_read[1 << 8], buf_write[1 << 8];
        sprintf(buf_write, "Hello. Please behave.\n");
        ret = send(sock_pipe, buf_write, strlen(buf_write), 0);
        if (ret <= 0) {
            fprintf(stderr, "%s: write=%d: %s\n", argv[0], ret, strerror(errno));
            close(sock_pipe);
            continue;
        }

        /* Pick random number 0 to 65534 */
        to_be_guessed = random() % 65535;
        printf("Client will have to guess %d\n", to_be_guessed);

        char *pend = NULL;

        while (1) {
            ret = recv(sock_pipe, buf_read, 256, 0);
            if (ret <= 0) {
                printf("%s: read=%d: %s\n", argv[0], ret, strerror(errno));
                break;
            }

            printf("srv recu de (%s,%4d):%s\n",
                   inet_ntoa(client.sin_addr), ntohs(client.sin_port), buf_read);

            /* strtol() is more robust than atoi() for number parsing */
            long guess = strtol(buf_read, &pend, 10);

            buf_write[1] = '\n';

            if (errno != 0 || (*pend != '\0' && *pend != '\n')) {
                buf_write[0] = '~';
                printf("Invalid number '%ld'\n", guess);
            } else {
                printf("Client guessed %ld\n", guess);
                if (guess == to_be_guessed) {
                    buf_write[0] = '=';
                } else {
                    buf_write[0] = guess < (long)to_be_guessed ? '+' : '-';
                }
            }

            /* Send exactly 2 bytes: response code + '\n' */
            ret = send(sock_pipe, buf_write, 2, 0);
            if (ret <= 0) {
                printf("%s: write=%d: %s\n", argv[0], ret, strerror(errno));
                break;
            }

            if (buf_write[0] == '=')
                break;

#ifdef WIN32
            Sleep(2000);
#else
            sleep(2);
#endif
        }
        close(sock_pipe);
    }
    end();
    return 0;
}
```

### Exercice 6 : Ecrire le client interactif pour le jeu de devinette en C.

**Reponse :**

#### Code complet : ClientPlusMoins.c

```c noexec
/* ClientPlusMoins.c */

#ifdef WIN32
#include <winsock2.h>
#elif defined(linux)
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>

static void init(void) {
#ifdef WIN32
    WSADATA wsa;
    int err = WSAStartup(MAKEWORD(2, 2), &wsa);
    if (err < 0) { puts("WSAStartup failed!"); exit(EXIT_FAILURE); }
#endif
}

static void end(void) {
#ifdef WIN32
    WSACleanup();
#endif
}

short sport = 0;
int sockid = 0;

int main(int argc, char **argv) {
    init();
    struct sockaddr_in sock;
    struct sockaddr_in servsock;
    unsigned int ret;
    socklen_t len;

    if (argc != 3) {
        fprintf(stderr, "usage: %s serveur port\n", argv[0]);
        exit(1);
    }
    sport = atoi(argv[2]);

    if ((sockid = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        fprintf(stderr, "%s: socket %s\n", argv[0], strerror(errno));
        exit(1);
    }

    servsock.sin_family = AF_INET;
    servsock.sin_port = htons(sport);
#ifdef WIN32
    servsock.sin_addr.s_addr = inet_addr(argv[1]);
#else
    inet_aton(argv[1], (struct in_addr *)&servsock.sin_addr);
#endif

    if (connect(sockid, (struct sockaddr *)&servsock, sizeof(servsock)) < 0) {
        fprintf(stderr, "%s: connect %s\n", argv[0], strerror(errno));
        perror("bind");
        exit(1);
    }

    len = sizeof(sock);
    getsockname(sockid, (struct sockaddr *)&sock, &len);

    /* Read welcome message */
    char buf_read[1 << 8];
    ret = recv(sockid, buf_read, 256, 0);
    if (ret == 0) {
        fprintf(stderr, "%s: Error reading modality line\n", argv[0]);
        end();
        exit(EXIT_FAILURE);
    }
    buf_read[ret - 1] = '\0';
    printf("Server said: \"%s\"\n", buf_read);

    /* Interactive game loop */
    while (1) {
        char buf_read[1 << 8], buf_write[1 << 8];

        scanf("%256s", buf_write);
        if (strlen(buf_write) == 0) {
            fprintf(stderr, "Stream error. Was stdin closed prematurely?\n");
            break;
        }

        /* Append '\n' as protocol delimiter */
        sprintf(buf_write, "%s\n", buf_write);

        ret = send(sockid, buf_write, strlen(buf_write), 0);
        if (ret < strlen(buf_write)) {
            printf("%s: erreur dans write (num=%d, mess=%s)\n",
                   argv[0], ret, strerror(errno));
            continue;
        }

        /* Receive response (2 bytes: code + '\n') */
        ret = recv(sockid, buf_read, 256, 0);
        if (ret == 0) {
            printf("%s: erreur dans read (num=%d,mess=%s)\n",
                   argv[0], ret, strerror(errno));
            continue;
        }
        buf_read[ret - 1] = '\0';

        switch (buf_read[0]) {
            case '+': { printf("Higher.\n"); break; }
            case '-': { printf("Lower.\n"); break; }
            case '~': { printf("...What?\n"); break; }
            case '=': { printf("It's a win!\n"); break; }
        }
        if (buf_read[0] == '=')
            break;
    }

    close(sockid);
    end();
    return 0;
}
```

**Comment tester :**

```bash
gcc -o pm_serveur ServeurPlusMoins.c
gcc -o pm_client ClientPlusMoins.c

# Terminal 1
./pm_serveur 9000
# Output: Client will have to guess 42735

# Terminal 2
./pm_client 127.0.0.1 9000
# Server said: "Hello. Please behave."
# 30000
# Higher.
# 50000
# Lower.
# 42735
# It's a win!

# Or test with netcat:
nc localhost 9000
# Hello. Please behave.
# 50000
# +
# 25000
# -
```

---

## Exercice 7 : Comparer le nombre de paquets TCP et UDP dans Wireshark.

**Reponse :**

Capturer les echanges TCP et UDP avec 3 messages chacun :

**TCP (3 echanges de messages) :**
```
 1-3   : Three-way handshake (SYN, SYN-ACK, ACK)           = 3
 4-5   : Client sends msg 1, Server ACKs                    = 2
 6-7   : Server sends response 1, Client ACKs               = 2
 8-9   : Client sends msg 2, Server ACKs                    = 2
10-11  : Server sends response 2, Client ACKs               = 2
12-13  : Client sends msg 3, Server ACKs                    = 2
14-15  : Server sends response 3, Client ACKs               = 2
16-19  : Four-way termination (FIN-ACK x2, ACK x2)          = 4
                                                      Total = ~19 packets
```

**UDP (3 echanges de messages) :**
```
1 : Client -> Server (datagram 1)   = 1
2 : Server -> Client (response 1)   = 1
3 : Client -> Server (datagram 2)   = 1
4 : Server -> Client (response 2)   = 1
5 : Client -> Server (datagram 3)   = 1
6 : Server -> Client (response 3)   = 1
                              Total = 6 packets
```

TCP utilise environ 3 fois plus de paquets qu'UDP pour le meme echange. C'est le cout de la fiabilite (handshake, ACK, terminaison).
