---
title: "06 -- Programmation socket en C"
sidebar_position: 6
---

# 06 -- Programmation socket en C

## Vue d'ensemble

Les sockets sont l'API standard pour la communication reseau. Ce chapitre couvre l'API POSIX en C, utilisee dans les TP4 et TP5 du cours. La maitrise du code socket est critique pour l'examen.

---

## API Socket : vue d'ensemble

### TCP (SOCK_STREAM)

```
Serveur                              Client
socket(AF_INET, SOCK_STREAM, 0)      socket(AF_INET, SOCK_STREAM, 0)
    |                                     |
bind(sock, &addr, sizeof(addr))      connect(sock, &srv_addr, sizeof)
    |                                     |
listen(sock, backlog)                send() / recv()
    |                                     |
accept() --> new_fd                  close(sock)
    |
recv() / send()
    |
close(new_fd)
```

### UDP (SOCK_DGRAM)

```
Serveur                              Client
socket(AF_INET, SOCK_DGRAM, 0)       socket(AF_INET, SOCK_DGRAM, 0)
    |                                     |
bind(sock, &addr, sizeof(addr))      sendto(sock, buf, len, 0, &dest, sizeof)
    |                                     |
recvfrom(sock, buf, len, 0,          recvfrom(...)
         &client, &client_len)            |
    |                                close(sock)
sendto(sock, buf, len, 0,
       &client, client_len)
    |
close(sock)
```

---

## Structures d'adresses

### sockaddr_in (IPv4)

```c noexec
struct sockaddr_in {
    sa_family_t    sin_family;  // AF_INET
    in_port_t      sin_port;    // Port (network byte order)
    struct in_addr sin_addr;    // Adresse IP
    char           sin_zero[8]; // Padding
};

struct in_addr {
    uint32_t s_addr;  // Adresse IP (network byte order)
};
```

Le cast `(struct sockaddr *)` est necessaire car les fonctions socket prennent des `sockaddr` generiques.

---

## Conversion d'octets (byte order)

Le reseau utilise **big-endian**. La machine peut etre little-endian.

```c noexec
uint16_t htons(uint16_t hostshort);   // Host to Network (16 bits) - pour les ports
uint16_t ntohs(uint16_t netshort);    // Network to Host (16 bits)
uint32_t htonl(uint32_t hostlong);    // Host to Network (32 bits) - pour les IP
uint32_t ntohl(uint32_t netlong);     // Network to Host (32 bits)
```

**Toujours utiliser htons() pour les ports et htonl() pour les adresses IP.**

---

## Conversion d'adresses IP

```c noexec
// String -> binaire
int inet_aton(const char *cp, struct in_addr *inp);          // Linux
in_addr_t inet_addr(const char *cp);                         // Cross-platform
int inet_pton(int af, const char *src, void *dst);           // Moderne (IPv4+IPv6)

// Binaire -> string
char *inet_ntoa(struct in_addr in);                          // IPv4 (pas thread-safe)
const char *inet_ntop(int af, const void *src, char *dst,    // Moderne (thread-safe)
                      socklen_t size);
```

---

## Serveur TCP complet annote

```c noexec
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s port\n", argv[0]);
        exit(1);
    }
    short port = atoi(argv[1]);

    // 1. Creer le socket TCP
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    //         AF_INET     = IPv4
    //         SOCK_STREAM = TCP (flux d'octets)
    //         0           = protocole par defaut (TCP)
    if (sock == -1) {
        perror("socket");
        exit(1);
    }

    // Option : reutiliser le port (evite "Address already in use")
    int opt = 1;
    setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // 2. Lier le socket a un port (bind)
    struct sockaddr_in serveur;
    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(port);              // Port en network byte order
    serveur.sin_addr.s_addr = htonl(INADDR_ANY); // Ecouter sur toutes les interfaces

    if (bind(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        perror("bind");
        exit(1);
    }

    // 3. Ecouter les connexions entrantes
    if (listen(sock, 5) != 0) {  // backlog = 5 connexions en attente max
        perror("listen");
        exit(1);
    }

    printf("Serveur ecoute sur le port %d\n", port);

    // 4. Boucle principale : accepter et servir les clients
    while (1) {
        struct sockaddr_in client;
        socklen_t len = sizeof(client);

        // accept() bloque jusqu'a reception d'une connexion
        // Retourne un NOUVEAU socket dedie a ce client
        int sock_client = accept(sock, (struct sockaddr *)&client, &len);
        if (sock_client < 0) {
            perror("accept");
            continue;
        }

        printf("Client connecte : %s:%d\n",
               inet_ntoa(client.sin_addr), ntohs(client.sin_port));

        // 5. Echanger des donnees avec le client
        char buf[256];
        int ret = recv(sock_client, buf, sizeof(buf) - 1, 0);
        if (ret > 0) {
            buf[ret] = '\0';
            printf("Recu : %s\n", buf);

            // Repondre
            const char *reponse = "Message recu\n";
            send(sock_client, reponse, strlen(reponse), 0);
        }

        // 6. Fermer la connexion client
        close(sock_client);
    }

    close(sock);
    return 0;
}
```

---

## Client TCP complet annote

```c noexec
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

int main(int argc, char **argv) {
    if (argc != 3) {
        fprintf(stderr, "usage: %s serveur port\n", argv[0]);
        exit(1);
    }

    // 1. Creer le socket TCP
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        perror("socket");
        exit(1);
    }

    // 2. Configurer l'adresse du serveur
    struct sockaddr_in serveur;
    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(atoi(argv[2]));
    inet_aton(argv[1], &serveur.sin_addr);  // Convertir string -> binaire

    // 3. Se connecter au serveur (declenche le 3-way handshake)
    if (connect(sock, (struct sockaddr *)&serveur, sizeof(serveur)) < 0) {
        perror("connect");
        exit(1);
    }

    // 4. Envoyer des donnees
    const char *message = "Hello serveur\n";
    send(sock, message, strlen(message), 0);

    // 5. Recevoir la reponse
    char buf[256];
    int ret = recv(sock, buf, sizeof(buf) - 1, 0);
    if (ret > 0) {
        buf[ret] = '\0';
        printf("Reponse : %s\n", buf);
    }

    // 6. Fermer
    close(sock);
    return 0;
}
```

---

## Serveur UDP complet annote

```c noexec
int main(int argc, char **argv) {
    int sock = socket(AF_INET, SOCK_DGRAM, 0);  // SOCK_DGRAM = UDP

    struct sockaddr_in serveur;
    serveur.sin_family = AF_INET;
    serveur.sin_port = htons(atoi(argv[1]));
    serveur.sin_addr.s_addr = htonl(INADDR_ANY);

    bind(sock, (struct sockaddr *)&serveur, sizeof(serveur));

    while (1) {
        char buf[256];
        struct sockaddr_in client;
        socklen_t len = sizeof(client);

        // recvfrom : recoit un datagramme ET l'adresse de l'emetteur
        int ret = recvfrom(sock, buf, sizeof(buf), 0,
                           (struct sockaddr *)&client, &len);
        if (ret > 0) {
            buf[ret] = '\0';
            printf("Recu de %s:%d : %s\n",
                   inet_ntoa(client.sin_addr), ntohs(client.sin_port), buf);

            // sendto : envoie un datagramme a une adresse specifique
            sendto(sock, buf, ret, 0,
                   (struct sockaddr *)&client, len);
        }
    }
    close(sock);
}
```

**Differences UDP vs TCP :**
- `SOCK_DGRAM` au lieu de `SOCK_STREAM`
- Pas de `listen()`, pas de `accept()`
- `recvfrom()` / `sendto()` au lieu de `recv()` / `send()`
- Un seul socket pour tous les clients

---

## Multicast (TP5)

### Rejoindre un groupe multicast

```c noexec
struct ip_mreq mreq;
mreq.imr_multiaddr.s_addr = inet_addr("224.0.0.10");  // Groupe multicast
mreq.imr_interface.s_addr = INADDR_ANY;                // Toutes les interfaces

setsockopt(sock, IPPROTO_IP, IP_ADD_MEMBERSHIP, &mreq, sizeof(mreq));
```

### Envoyer au groupe

```c noexec
struct sockaddr_in dest;
dest.sin_family = AF_INET;
dest.sin_port = htons(10000);
dest.sin_addr.s_addr = inet_addr("224.0.0.10");

sendto(sock, message, len, 0, (struct sockaddr *)&dest, sizeof(dest));
```

### Options utiles

```c noexec
// Autoriser plusieurs processus sur le meme port
int opt = 1;
setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

// TTL multicast (nombre de sauts)
unsigned char ttl = 5;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl));

// Recevoir ses propres messages (loopback)
unsigned char loop = 1;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_LOOP, &loop, sizeof(loop));
```

---

## Serveur concurrent (pthreads)

Pour gerer plusieurs clients en parallele :

```c noexec
#include <pthread.h>

void *handle_client(void *arg) {
    int sock_client = *(int *)arg;
    free(arg);

    char buf[256];
    int ret = recv(sock_client, buf, sizeof(buf), 0);
    // ... traitement ...
    close(sock_client);
    return NULL;
}

// Dans la boucle accept :
while (1) {
    int *sock_client = malloc(sizeof(int));
    *sock_client = accept(sock, (struct sockaddr *)&client, &len);

    pthread_t thread;
    pthread_create(&thread, NULL, handle_client, sock_client);
    pthread_detach(thread);  // Liberer automatiquement les ressources
}
```

Compilation : `gcc -pthread -o serveur serveur.c`

---

## Problemes courants et solutions

| Probleme | Cause | Solution |
|----------|-------|----------|
| "Address already in use" | Port encore en TIME_WAIT | `setsockopt(SO_REUSEADDR)` |
| `connect()` refuse | Serveur pas demarre / mauvais port | Verifier avec `netstat -tuln` |
| `recv()` retourne 0 | Le pair a ferme la connexion (FIN) | Fermer le socket |
| Envoi/reception partiel | `send()`/`recv()` ne transferent pas tout | Boucler jusqu'a completion |
| Caracteres parasites | Buffer pas termine par '\0' | `buf[ret] = '\0'` apres `recv()` |

---

## Compilation et execution

```bash
# Compiler
gcc -o serveur ServeurTCP.c
gcc -o client ClientTCP.c
gcc -pthread -o chat main.c    # Avec pthreads

# Executer
./serveur 8000                        # Demarre le serveur
./client 127.0.0.1 8000              # Connecte le client
./chat 224.0.0.10 10000 Alice        # Chat multicast
```

---

## CHEAT SHEET

```
TCP :  socket(SOCK_STREAM) -> bind -> listen -> accept -> recv/send -> close
UDP :  socket(SOCK_DGRAM)  -> bind -> recvfrom/sendto -> close
Client TCP : socket -> connect -> send/recv -> close
Client UDP : socket -> sendto/recvfrom -> close

Fonctions cles :
  htons(port)          : port en network byte order
  htonl(INADDR_ANY)    : ecouter sur toutes les interfaces
  inet_aton("IP", &addr) : string -> binaire
  inet_ntoa(addr)      : binaire -> string

Structures :
  struct sockaddr_in { sin_family, sin_port, sin_addr }
  Cast : (struct sockaddr *)&addr

Multicast :
  IP_ADD_MEMBERSHIP avec struct ip_mreq
  SO_REUSEADDR pour plusieurs recepteurs
  sendto() vers adresse 224.x.x.x

Erreurs courantes :
  "Address already in use" -> SO_REUSEADDR
  recv() == 0 -> pair a ferme
  Toujours htons() pour les ports
  Toujours terminer buf par '\0'
```
