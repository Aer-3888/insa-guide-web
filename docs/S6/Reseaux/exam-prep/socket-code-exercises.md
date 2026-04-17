---
title: "Exercices de programmation socket -- Exam Prep"
sidebar_position: 5
---

# Exercices de programmation socket -- Exam Prep

Exercices types de code socket en C, tels qu'ils apparaissent en DS.

---

## Exercice 1 : Completer un serveur TCP

**Donne** : completer les blancs dans ce serveur TCP echo.

```c noexec
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

int main() {
    // 1. Creer le socket
    int sock = socket(_____, _____, 0);           // (a)

    // 2. Configurer l'adresse
    struct sockaddr_in addr;
    addr.sin_family = _____;                       // (b)
    addr.sin_port = _____(8080);                   // (c)
    addr.sin_addr.s_addr = _____(INADDR_ANY);      // (d)

    // 3. Lier
    bind(sock, (struct sockaddr *)&addr, sizeof(addr));

    // 4. Ecouter
    _____(sock, 5);                                // (e)

    while (1) {
        struct sockaddr_in client;
        socklen_t len = sizeof(client);

        // 5. Accepter
        int cli = _____(sock, (struct sockaddr *)&client, &len);  // (f)

        char buf[256];
        int n = _____(cli, buf, 256, 0);           // (g)
        _____(cli, buf, n, 0);                     // (h) echo

        close(cli);
    }
}
```

**Reponses :**

```
(a) AF_INET, SOCK_STREAM
(b) AF_INET
(c) htons
(d) htonl
(e) listen
(f) accept
(g) recv
(h) send
```

---

## Exercice 2 : Completer un client UDP

```c noexec
int main(int argc, char **argv) {
    int sock = socket(AF_INET, _____, 0);          // (a)

    struct sockaddr_in srv;
    srv.sin_family = AF_INET;
    srv.sin_port = htons(atoi(argv[2]));
    _____(argv[1], &srv.sin_addr);                  // (b)

    char msg[] = "Hello";
    _____(sock, msg, strlen(msg)+1, 0,              // (c)
          (struct sockaddr *)&srv, sizeof(srv));

    char buf[256];
    struct sockaddr_in from;
    socklen_t len = sizeof(from);
    _____(sock, buf, 256, 0,                        // (d)
          (struct sockaddr *)&from, &len);

    printf("Recu : %s\n", buf);
    close(sock);
}
```

**Reponses :**

```
(a) SOCK_DGRAM
(b) inet_aton
(c) sendto
(d) recvfrom
```

---

## Exercice 3 : Ecrire un serveur TCP complet de memoire

**Enonce** : ecrire un serveur TCP qui ecoute sur un port passe en argument, accepte une connexion, lit un message, repond "OK\n", puis ferme.

**Solution :**

```c noexec
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s port\n", argv[0]);
        return 1;
    }

    int sock = socket(AF_INET, SOCK_STREAM, 0);

    int opt = 1;
    setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(atoi(argv[1]));
    addr.sin_addr.s_addr = htonl(INADDR_ANY);

    bind(sock, (struct sockaddr *)&addr, sizeof(addr));
    listen(sock, 5);

    struct sockaddr_in client;
    socklen_t len = sizeof(client);
    int cli = accept(sock, (struct sockaddr *)&client, &len);

    char buf[256];
    int n = recv(cli, buf, sizeof(buf) - 1, 0);
    if (n > 0) {
        buf[n] = '\0';
        printf("Recu : %s\n", buf);
        send(cli, "OK\n", 3, 0);
    }

    close(cli);
    close(sock);
    return 0;
}
```

---

## Exercice 4 : Identifier les erreurs

**Donne** : le code suivant contient 5 erreurs. Les trouver.

```c noexec
int main() {
    int sock = socket(AF_INET, SOCK_DGRAM, 0);     // 1

    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = 8080;                            // 2
    addr.sin_addr.s_addr = INADDR_ANY;               // 3

    bind(sock, &addr, sizeof(addr));                  // 4

    listen(sock, 5);                                  // 5

    char buf[256];
    recv(sock, buf, 256, 0);                          // 6

    close(sock);
}
```

**Erreurs :**

1. **Ligne "port"** : `8080` doit etre `htons(8080)`. Les ports doivent etre en network byte order.

2. **Ligne "INADDR_ANY"** : doit etre `htonl(INADDR_ANY)`. Les adresses doivent etre en network byte order.

3. **Ligne "bind"** : le second argument doit etre caste : `(struct sockaddr *)&addr`.

4. **Ligne "listen"** : `listen()` est pour TCP (SOCK_STREAM), pas UDP (SOCK_DGRAM). A supprimer.

5. **Ligne "recv"** : pour UDP, il faut utiliser `recvfrom()` au lieu de `recv()` pour connaitre l'adresse de l'emetteur.

---

## Exercice 5 : Rejoindre un groupe multicast

**Enonce** : completer le code pour rejoindre le groupe multicast 224.0.0.42 sur le port 5000.

```c noexec
int sock = socket(AF_INET, SOCK_DGRAM, 0);

// Rejoindre le groupe multicast
struct ip_mreq mreq;
mreq.imr_multiaddr.s_addr = _____("224.0.0.42");  // (a)
mreq.imr_interface.s_addr = _____;                  // (b)

setsockopt(sock, _____, _____, &mreq, sizeof(mreq)); // (c)

// Permettre la reutilisation du port
int opt = 1;
setsockopt(sock, SOL_SOCKET, _____, &opt, sizeof(opt)); // (d)

// Bind
struct sockaddr_in addr;
addr.sin_family = AF_INET;
addr.sin_port = htons(5000);
addr.sin_addr.s_addr = htonl(INADDR_ANY);
bind(sock, (struct sockaddr *)&addr, sizeof(addr));
```

**Reponses :**

```
(a) inet_addr
(b) INADDR_ANY
(c) IPPROTO_IP, IP_ADD_MEMBERSHIP
(d) SO_REUSEADDR
```

---

## Aide-memoire : fonctions a connaitre

```c noexec
// Creation
socket(AF_INET, SOCK_STREAM/SOCK_DGRAM, 0)

// Configuration
htons(port), htonl(addr), inet_aton("ip", &addr), inet_ntoa(addr)

// TCP serveur
bind(), listen(), accept(), recv(), send(), close()

// TCP client
connect(), send(), recv(), close()

// UDP
bind(), recvfrom(), sendto(), close()

// Options
setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, ...)
setsockopt(sock, IPPROTO_IP, IP_ADD_MEMBERSHIP, ...)

// Structure
struct sockaddr_in { sin_family, sin_port, sin_addr.s_addr }
```
