---
title: "03 -- Couche reseau (IP)"
sidebar_position: 3
---

# 03 -- Couche reseau (IP)

## Vue d'ensemble

La couche reseau (couche 3) permet d'acheminer des paquets entre machines sur des reseaux differents grace a l'adressage IP et au routage. Ce chapitre couvre IPv4, le sous-reseau, CIDR, NAT, la fragmentation et l'introduction a IPv6.

---

## Adresse IPv4

Une adresse IPv4 fait **32 bits** (4 octets), notee en decimal pointe.

```
192     . 168     . 1       . 42
11000000. 10101000. 00000001. 00101010
```

Chaque octet va de 0 a 255.

**Puissances de 2 (a connaitre par coeur) :**

| 2^1 | 2^2 | 2^3 | 2^4 | 2^5 | 2^6 | 2^7 | 2^8 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 |

---

## Masque de sous-reseau et CIDR

Le masque separe la partie **reseau** de la partie **hote**.

```
Adresse IP : 192.168.1.42    = 11000000.10101000.00000001.00101010
Masque     : 255.255.255.0   = 11111111.11111111.11111111.00000000
                                |--- partie reseau ---||-- hote --|
```

**Notation CIDR** : `/n` = n bits a 1 dans le masque.

| CIDR | Masque | Pas (block size) | Hotes utilisables |
|------|--------|-------------------|-------------------|
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 |

**Formules essentielles :**

| Formule | Description |
|---------|-------------|
| Nombre d'adresses = 2^(32-n) | Pour un masque /n |
| **Nombre d'hotes = 2^(32-n) - 2** | On retire adresse reseau + broadcast |
| **Pas = 256 - dernier octet du masque** | Block size |

---

## Calcul de sous-reseaux : methode pas a pas

### Exercice type : trouver les infos d'un sous-reseau

**Donne** : 172.16.45.130/26

1. **Masque** : /26 = 255.255.255.192
2. **Pas** : 256 - 192 = 64
3. **Adresse reseau** : sous-reseaux a 0, 64, 128, 192. 130 est entre 128 et 192 => **172.16.45.128**
4. **Broadcast** : prochain sous-reseau - 1 = 192 - 1 = 191 => **172.16.45.191**
5. **Plage d'hotes** : 172.16.45.129 -- 172.16.45.190 (**62 hotes**)

### Exercice type : decouper un reseau

**Donne** : 192.168.1.0/24, besoin de sous-reseaux de 50 hotes.

1. 50 + 2 = 52 adresses necessaires. 2^6 = 64 >= 52 => 6 bits hote, masque /26.
2. Pas = 64.
3. Sous-reseaux : 192.168.1.0/26, .64/26, .128/26, .192/26 (4 sous-reseaux de 62 hotes).

### VLSM (Variable Length Subnet Mask)

Allouer des masques differents selon les besoins. **Methode** : toujours du plus grand au plus petit.

**Exemple** : 192.168.10.0/24, besoins : 100, 50, 25, 2, 2 hotes.

| Sous-reseau | CIDR | Adresse | Hotes |
|-------------|------|---------|-------|
| 100 hotes | /25 | 192.168.10.0/25 | 126 |
| 50 hotes | /26 | 192.168.10.128/26 | 62 |
| 25 hotes | /27 | 192.168.10.192/27 | 30 |
| 2 hotes | /30 | 192.168.10.224/30 | 2 |
| 2 hotes | /30 | 192.168.10.228/30 | 2 |

---

## Adresses privees et speciales

**Adresses privees (RFC 1918)** -- non routees sur Internet :

| Plage | CIDR |
|-------|------|
| 10.0.0.0 -- 10.255.255.255 | 10.0.0.0/8 |
| 172.16.0.0 -- 172.31.255.255 | 172.16.0.0/12 |
| 192.168.0.0 -- 192.168.255.255 | 192.168.0.0/16 |

**Adresses speciales :**

| Adresse | Usage |
|---------|-------|
| 127.0.0.0/8 | Loopback (127.0.0.1 = localhost) |
| 0.0.0.0 | Adresse indefinie / "cette machine" |
| 255.255.255.255 | Broadcast limite (reseau local) |
| 169.254.0.0/16 | Link-local (APIPA) |

---

## NAT (Network Address Translation)

NAT traduit les adresses privees en adresses publiques pour acceder a Internet.

**Fonctionnement :**
1. PC envoie un paquet avec IP source privee (ex: 192.168.1.10).
2. Le routeur NAT remplace l'IP source par son IP publique + un port unique.
3. Il enregistre la correspondance dans sa table NAT.
4. La reponse revient a l'IP publique, le routeur traduit a l'envers.

NAT est une **exception** a la regle "l'IP source ne change pas de bout en bout".

---

## En-tete IP

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |    ToS        |         Total Length          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|   Fragment Offset       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|    TTL        |    Protocol   |       Header Checksum         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source Address                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination Address                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Champs importants pour les DS :**

| Champ | Taille | Role |
|-------|--------|------|
| TTL | 8 bits | Decremente a chaque routeur. A 0 = paquet detruit + ICMP Time Exceeded |
| Protocol | 8 bits | 1=ICMP, 6=TCP, 17=UDP |
| Flags + Offset | 3+13 bits | Fragmentation : MF=1 si d'autres fragments, offset en unites de 8 octets |
| Total Length | 16 bits | Taille totale du paquet (max 65535) |

---

## Fragmentation IP

Quand un paquet depasse le MTU, il est fragmente.

**Exemple** : 4000 octets de donnees, MTU = 1500.

```
Donnees par fragment = MTU - en-tete IP = 1500 - 20 = 1480 (multiple de 8 : OK)
```

| Fragment | Donnees | Offset | MF | Total Length |
|----------|---------|--------|----|----|
| 1 | 1480 | 0 | 1 | 1500 |
| 2 | 1480 | 185 (=1480/8) | 1 | 1500 |
| 3 | 1040 | 370 (=2960/8) | 0 | 1060 |

Verification : 1480 + 1480 + 1040 = 4000.

---

## Table de routage

```
Destination        Masque              Passerelle        Interface    Metrique
192.168.1.0        /24                 Directement       eth0         0
10.0.0.0           /8                  192.168.1.1       eth0         1
0.0.0.0            /0                  192.168.1.254     eth0         10
```

**Longest prefix match** : la route avec le masque le plus long qui correspond gagne.

**Route par defaut** : 0.0.0.0/0, utilisee quand aucune route specifique ne correspond.

**Commandes :**
```bash
ip route show     # Linux
route -n          # Linux (ancien)
route print       # Windows
```

---

## IPv6 (introduction)

- **128 bits** (vs 32 pour IPv4) : 340 undecillions d'adresses.
- **Format** : 2001:0db8:85a3:0000:0000:8a2e:0370:7334.
- **Pas de broadcast** : remplace par multicast.
- **Pas de NAT necessaire** : assez d'adresses pour tout le monde.
- **Pas de fragmentation par les routeurs** : seule la source fragmente (Path MTU Discovery).
- **En-tete simplifie** : 40 octets fixes, pas de checksum IP.

---

## Pieges classiques

1. **Oublier -2 dans le nombre d'hotes** : 2^n - 2 (adresse reseau + broadcast).
2. **Pas = 256 - dernier octet du masque** : pour /26, 256-192=64.
3. **/31 = 2 adresses, pas d'adresse reseau ni broadcast** (liens point a point, RFC 3021), **/32 = 1 adresse** (loopback).
4. **Masque toujours contigu** : suite de 1 puis suite de 0. 255.255.128.255 est invalide.
5. **VLSM : toujours du plus grand au plus petit** et aligner sur les multiples du pas.
6. **TTL decremente a chaque routeur** : oubli frequent en exercices de routage.

---

## CHEAT SHEET

```
Nombre d'hotes = 2^(32-n) - 2          Pas = 256 - dernier octet masque

Masques courants :
  /24=255.255.255.0   (254 hotes, pas=256)
  /25=255.255.255.128 (126 hotes, pas=128)
  /26=255.255.255.192 (62 hotes, pas=64)
  /27=255.255.255.224 (30 hotes, pas=32)
  /28=255.255.255.240 (14 hotes, pas=16)
  /30=255.255.255.252 (2 hotes, pas=4)

Adresses privees : 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
Loopback : 127.0.0.0/8

Fragmentation : donnees/fragment = (MTU-20), arrondi au multiple de 8 inf.
  Offset en unites de 8 octets. MF=1 sauf dernier fragment.

TTL : decremente a chaque routeur. 0 -> paquet detruit + ICMP Time Exceeded.
Protocol : 1=ICMP, 6=TCP, 17=UDP

Methode sous-reseau :
  1. Masque -> Pas
  2. Adresse / Pas -> sous-reseau
  3. Prochain sous-reseau - 1 -> broadcast
  4. Reseau+1 -> premier hote, Broadcast-1 -> dernier hote
```
