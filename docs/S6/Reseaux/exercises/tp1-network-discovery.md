---
title: "TP1 - Decouverte reseau"
sidebar_position: 1
---

# TP1 - Decouverte reseau

> Following teacher instructions from: S6/Reseaux/data/moodle/tp/TP1/README.md

Ce TP explore les couches reseau avec des outils en ligne de commande Linux et Wireshark. Aucun code a ecrire : on observe et analyse les protocoles en action.

**Outils** : terminal Linux, Wireshark, ping, traceroute, arp, nslookup, netstat, ip.

---

## Section 1 : IP & Ethernet

### Q1. Quel est le hostname de votre machine ? Quelles sont ses interfaces reseau, leurs adresses IP (v4 et v6) ?

**Answer:**

```bash
$ hostname
awoobis

$ ip addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
2: enp0s25: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500
    (pas de cable connecte)
3: wlp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.43.251/24 brd 192.168.43.255 scope global wlp3s0
    inet6 fe80::a64e:31ff:fe08:ac84/64 scope link
4: tun1: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1420
    inet 10.8.1.135/24 scope global tun1
    inet6 fd11:1::135/64 scope global
```

Le hostname est `awoobis`. L'IP de l'interface WiFi `wlp3s0` est 192.168.43.251 (v4) et fe80::a64e:31ff:fe08:ac84 (v6 link-local). L'interface `tun1` (tunnel VPN) a l'IP 10.8.1.135 et fd11:1::135 en IPv6. Les adresses de loopback sont 127.0.0.1 et ::1 sur l'interface `lo`.

### Q2. Quels sont les MTU de chaque interface ?

**Answer:**

| Interface | MTU | Explication |
|-----------|-----|-------------|
| `lo` | 65536 | Loopback : pas de carte reseau physique, pas de limite hardware |
| `enp0s25` | 1500 | Ethernet filaire : standard Ethernet (trame max 1518 octets dont 18 d'en-tete) |
| `wlp3s0` | 1500 | WiFi : meme standard Ethernet |
| `tun1` | 1420 | Tunnel VPN : overhead d'encapsulation (~80 octets), donc 1500 - 80 = 1420 |
| `wwp0s20u4i6` | 1500 | Port pour carte SIM sur le laptop |

Les MTU different car chaque interface a des contraintes physiques et d'encapsulation differentes. Le loopback n'a pas de limite physique, les interfaces Ethernet/WiFi ont le standard de 1500 octets, et le tunnel VPN a un MTU reduit a cause de l'encapsulation supplementaire.

### Q3. Afficher la table de routage IPv4 et IPv6. Expliquer le role de chaque route.

**Answer:**

```bash
$ ip route show
default via 192.168.43.1 dev wlp3s0 proto dhcp metric 600
10.8.1.0/24 dev tun1 proto kernel scope link src 10.8.1.135
192.168.43.0/24 dev wlp3s0 proto kernel scope link src 192.168.43.251 metric 600

$ ip -6 route show
::1 dev lo proto kernel metric 256 pref medium
fd11:1::/64 dev tun1 proto kernel metric 256 pref medium
fe80::/64 dev wlp3s0 proto kernel metric 600 pref medium
default dev tun1 metric 1024 pref medium
```

Interpretation ligne par ligne :

- `default via 192.168.43.1 dev wlp3s0` : route par defaut. Tout paquet dont la destination ne correspond a aucune autre route passe par la passerelle 192.168.43.1 (le telephone/routeur WiFi).
- `10.8.1.0/24 dev tun1` : les paquets destines au sous-reseau VPN (10.8.1.x) passent directement par le tunnel.
- `192.168.43.0/24 dev wlp3s0` : les paquets destines au reseau local WiFi sortent directement par la carte WiFi.

Le noyau applique la decision de routage : il cherche la route la plus specifique (plus long prefixe). Si aucune ne correspond, il utilise la route `default`.

En IPv6, la route par defaut passe par le tunnel VPN (`default dev tun1`).

### Q4. Se connecter sur une machine distante. Comparer la configuration reseau.

**Answer:**

Connexion sur un VPS (vulpinecitrus.info) :

```bash
$ ssh vulpinecitrus.info
$ ip addr show
```

Le hostname est `vulpinecitrus.info`. Les interfaces et leurs IPs :
- `lo` (65536) : 127.0.0.1 / ::1
- `eth0` (1500) : 51.91.58.45 / 2001:41d0:305:2100::4547 (adresse publique)
- `tun0` (1420) : 10.8.1.1 / fd11:1::1 (bout du tunnel VPN)
- `docker0` : 172.17.0.1 (bridge Docker)
- `br-5aa5338f7baf` : 172.18.0.1 (bridge Docker)
- Plusieurs `veth*` : interfaces virtuelles Docker (vethfec39c6, veth5986e70, vethd8747d2)

Routes par defaut :
```
default via 51.91.56.1 dev eth0
10.8.1.0/24 dev tun0 proto kernel scope link src 10.8.1.1
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1
172.18.0.0/16 dev br-5aa5338f7baf proto kernel scope link src 172.18.0.1
```

Differences avec la machine locale : le VPS a une adresse IP publique (51.91.58.45), un nombre d'interfaces plus important du a Docker qui cree des reseaux bridge pour l'isolation des conteneurs, et les routes incluent les sous-reseaux Docker.

---

## Section 2 : Analyse ARP et ICMP

### Q5. Afficher la table ARP de votre machine.

**Answer:**

```bash
$ arp -a
192.168.43.1             ether   0c:70:4a:f8:8a:47   C   wlp3s0
216.239.38.21                    (incomplete)             enp0s25
216.239.36.21                    (incomplete)             enp0s25
216.239.34.21                    (incomplete)             enp0s25
216.239.32.21                    (incomplete)             enp0s25
```

ARP (Address Resolution Protocol) associe une adresse IP (couche 3) a une adresse MAC (couche 2) sur le reseau local. L'entree complete montre que la passerelle 192.168.43.1 a la MAC 0c:70:4a:f8:8a:47. Les entrees "incomplete" signifient que la resolution ARP n'a pas abouti (l'interface n'est pas connectee).

### Q6. Capturer un echange ping dans Wireshark. Identifier les champs du paquet ICMP.

**Answer:**

Pour avoir une capture du trafic plus claire (au vu des programmes qui tournent), on utilise le tunnel VPN (interface `tun1`) :

```bash
$ ping -c 4 1.1.1.1
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=12.3 ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=57 time=11.8 ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=57 time=12.1 ms
64 bytes from 1.1.1.1: icmp_seq=4 ttl=57 time=11.9 ms
```

Filtre Wireshark : `icmp`

Structure du paquet ICMP Echo Request :
```
Trame IP :
  Protocol: 1 (ICMP)
  Source: 10.8.1.135
  Destination: 1.1.1.1

Paquet ICMP :
  Type: 8 (Echo Request)            -- 1 octet
  Code: 0                           -- 1 octet (seule valeur possible pour Echo)
  Checksum: 0xXXXX                  -- 2 octets
  Identifier (BE): 0xXXXX           -- 2 octets
  Identifier (LE): 0xXXXX           -- 2 octets
  Sequence Number: 1                -- 2 octets
  Timestamp: 8 octets               -- horodatage de l'envoi
  Data: 48 octets                   -- donnees arbitraires
```

Structure du paquet ICMP Echo Reply :
```
  Type: 0 (Echo Reply)              -- Type 0 au lieu de 8
  Code: 0
  Checksum: (recalcule)
  Identifier: (meme que le Request)
  Sequence Number: 1 (meme)
  Data: 48 octets (copies du Request, renvoyees a l'identique)
```

Le RTT (Round-Trip Time) est calcule comme la difference entre le timestamp de reception et le timestamp dans le Request. ICMP est encapsule dans IP (protocol number: 1).

### Q7. Capturer un echange ARP. Decrire la requete et la reponse.

**Answer:**

On purge le cache ARP en deconnectant puis reconnectant le WiFi, puis on capture sur l'interface `wlp3s0` avec le filtre Wireshark `arp`.

Paquet ARP Request :
```
Trame Ethernet :
  Destination: ff:ff:ff:ff:ff:ff (broadcast)
  Source: 0c:70:4a:f8:8a:47
  Type: 0x0806 (ARP)

Paquet ARP :
  Hardware type: 1 (Ethernet)        -- 2 octets
  Protocol type: 0x0800 (IPv4)       -- 2 octets
  Hardware size: 6                   -- 1 octet (taille adresse MAC = 6 octets)
  Protocol size: 4                   -- 1 octet (taille adresse IPv4 = 4 octets)
  Opcode: 1 (Request)               -- 2 octets
  Sender MAC: 0c:70:4a:f8:8a:47     -- 6 octets (le telephone/AP)
  Sender IP: 192.168.43.1           -- 4 octets
  Target MAC: 00:00:00:00:00:00     -- 6 octets (inconnu, c'est le but)
  Target IP: 192.168.43.251         -- 4 octets
```

Traduction : le telephone (192.168.43.1, MAC=0C:70:4A:F8:8A:47) demande "Qui a 192.168.43.251 ? Dites-le a 192.168.43.1".

Paquet ARP Reply :
```
Trame Ethernet :
  Destination: 0c:70:4a:f8:8a:47 (unicast vers le demandeur)
  Source: a4:4e:31:08:ac:84

Paquet ARP :
  Opcode: 2 (Reply)
  Sender MAC: a4:4e:31:08:ac:84
  Sender IP: 192.168.43.251
  Target MAC: 0c:70:4a:f8:8a:47
  Target IP: 192.168.43.1
```

Traduction : le laptop (MAC=a4:4e:31:08:ac:84) repond "192.168.43.251 se situe a MAC a4:4e:31:08:ac:84".

Deroulement :
```
  Passerelle (192.168.43.1)                  PC (192.168.43.251)
         |                                         |
         |--- ARP Request (broadcast) ------------>|  "Qui a .251 ?"
         |                                         |
         |<-- ARP Reply (unicast) ----------------|  ".251 est a MAC a4:4e:..."
         |                                         |
    (met a jour table ARP)                         |
```

Points cles :
- ARP ne fonctionne que sur le meme segment reseau local (couche 2).
- La requete est en broadcast (ff:ff:ff:ff:ff:ff), la reponse en unicast.
- Chaque machine garde un cache ARP pour eviter de re-demander.

---

## Section 3 : IP Fragmentation

### Q14. Envoyer un ping dont la taille depasse le MTU. Observer la fragmentation.

**Answer:**

```bash
$ ping -s 2000 -c 1 1.1.1.1
PING 1.1.1.1 (1.1.1.1) 2000(2028) bytes of data.
2008 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=13.2 ms
```

Le paquet total fait 2000 (data) + 8 (ICMP header) + 20 (IP header) = 2028 octets, ce qui depasse le MTU de 1420 du tunnel VPN. Le paquet est donc fragmente.

Dans l'en-tete IP du premier fragment, le 3e bit de poids fort du 7e byte (Flags) est mis a 1, signifiant "More Fragments" : d'autres fragments vont arriver.

### Q15. Analyser le deuxieme fragment dans Wireshark.

**Answer:**

Filtre Wireshark : `ip.flags.mf == 1 || ip.frag_offset > 0`

Premier fragment :
```
IP Header :
  Total Length: 1420
  Identification: 0x1234          (identifiant commun a tous les fragments)
  Flags: More Fragments = 1       (MF=1 : d'autres fragments suivent)
  Fragment Offset: 0              (premier fragment)
  Protocol: 1 (ICMP)
  Payload: 1400 octets (1420 - 20 d'en-tete IP)
```

Deuxieme (dernier) fragment :
```
IP Header :
  Total Length: 628
  Identification: 0x1234          (MEME identifiant)
  Flags: More Fragments = 0       (MF=0 : c'est le dernier)
  Fragment Offset: 1400           (commence a l'octet 1400)
  Protocol: 1 (ICMP)
  Payload: 608 octets (628 - 20 d'en-tete IP)
```

Dans le deuxieme fragment, le bit "More Fragments" n'est pas mis a 1 (not set), ce qui indique que ce n'est pas le premier fragment et qu'il n'y a pas d'autres fragments a venir (c'est le dernier). Les deux fragments ont la meme Identification dans l'en-tete IP.

Verification : 1400 + 608 = 2008 octets = 2000 (data) + 8 (ICMP header). Correct.

### Q16. Quelles sont les differences entre les deux fragments ?

**Answer:**

| Champ | Fragment 1 | Fragment 2 |
|-------|-----------|-----------|
| Total Length | 1420 | 628 |
| More Fragments flag | 1 (d'autres suivent) | 0 (dernier) |
| Fragment Offset | 0 | 1400 |
| Checksum | (calcule pour ce fragment) | (recalcule pour ce fragment) |

Ce qui ne change PAS : Identification (meme valeur pour regrouper les fragments), Source IP, Destination IP, Protocol (ICMP = 1).

Le reassemblage est fait par le destinataire : il collecte tous les fragments avec la meme Identification, les trie par Fragment Offset, et reconstitue le paquet original.

---

## Section 4 : Services Internet

### Q17. Quel fichier contient la correspondance entre les noms de service et les numeros de port ?

**Answer:**

C'est le fichier `/etc/services` :

```bash
$ grep -E "^(ftp|ssh|telnet|smtp|domain|http|pop3|ntp|imap|https|doom|irc)" /etc/services
ftp-data        20/tcp
ftp             21/tcp          # controle; 20/tcp pour les donnees
ssh             22/tcp
telnet          23/tcp
smtp            25/tcp          # Simple Mail Transfer Protocol
domain          53/tcp
domain          53/udp          # DNS
http            80/tcp          www
pop3            110/tcp         # Post Office Protocol v3
ntp             123/udp         # Network Time Protocol
imap2           143/tcp         imap
https           443/tcp
```

Quelques services notables : `doom` (666/tcp, legacy serveur Doom), `irc` (en pratique 6667/tcp).

### Q18. Afficher les connexions actives avec netstat.

**Answer:**

```bash
$ netstat -tun
Proto  Local Address              Foreign Address            State
tcp    awoobis:35918              lb-140-82-114-25:https     ESTABLISHED
tcp    awoobis:38460              162.159.138.232:https      ESTABLISHED
tcp    awoobis:45032              fra02s18-in-f4.1e:https    TIME_WAIT
tcp    awoobis:57082              ec2-54-149-175-5.:https    ESTABLISHED
tcp    awoobis:51540              stackoverflow.com:https    ESTABLISHED
tcp    awoobis:36828              162.159.136.234:https      ESTABLISHED
tcp    awoobis:42186              mirrors.stuart:www-http    ESTABLISHED
tcp    awoobis:43616              45.ip-51-91-58.eu:https    TIME_WAIT
udp    awoobis:bootpc             _gateway:bootps            ESTABLISHED
```

Etats des connexions TCP :

| Etat | Signification |
|------|---------------|
| `ESTABLISHED` | Connexion active, donnees echangees |
| `TIME_WAIT` | Connexion fermee, attente pour s'assurer que le dernier ACK est bien arrive |
| `LISTEN` | Serveur en attente de connexions |
| `SYN_SENT` | Le SYN a ete envoye, en attente du SYN-ACK |

La plupart des connexions sont en HTTPS (port 443) vers divers services (GitHub, StackOverflow, Cloudflare, etc.). La connexion UDP bootpc/bootps correspond au client DHCP.

---

## Section 5 : Nommage (DNS) et tests reseau

### Q19. Lancer des pings vers des serveurs geographiquement differents.

**Answer:**

```bash
$ ping -c 20 google.com         # ~142ms en moyenne, ~0.8% packet loss
$ ping -c 20 namibia-server     # ~283ms en moyenne, 0% packet loss
$ ping -c 20 www.victoria.ac.nz # ~135ms en moyenne, ~1.2% packet loss
```

| Destination | RTT moyen | Perte | Observation |
|-------------|-----------|-------|-------------|
| google.com | ~142 ms | ~0.8% | Serveurs proches (CDN en France) |
| Namibie | ~283 ms | 0% | Tres loin geographiquement, latence elevee |
| victoria.ac.nz (NZ) | ~135 ms | ~1.2% | Etonnamment rapide car servi par CDN a Paris (Fastly) |

### Q20. Lancer des traceroutes vers les memes destinations. Analyser.

**Answer:**

```bash
$ traceroute google.com          # 11 sauts
 1  _gateway (192.168.43.1)  9.5 ms
 2  10.88.0.1  91.0 ms
 3  192.168.253.30  178.8 ms
 ...
 8  72.14.220.92  439.3 ms          (entree reseau Google)
 9  108.170.231.111  441.9 ms
10  66.249.95.247  189.1 ms
11  par21s12-in-f4.1e100.net  154.0 ms

$ traceroute namibia-server      # 22 sauts
 1  _gateway  8.8 ms
 ...
 9  be2102.ccr41.par01.atlas.cogentco.com  88.5 ms  (peering Cogent, Paris)
10  be12497.ccr41.lon13.atlas.cogentco.com  73.7 ms  (Londres)
11  be2053.rcr21.lon13.atlas.cogentco.com  109.8 ms
 ...
16  196.44.0.29  307.3 ms           (entree reseau africain)
 ...
22  196.216.167.71  274.0 ms

$ traceroute www.victoria.ac.nz  # 12 sauts
 1  _gateway  9.5 ms
 ...
 9  be2103.ccr42.par01.atlas.cogentco.com  49.5 ms  (Cogent Paris)
10  be2922.rcr21.par01.atlas.cogentco.com  41.5 ms
11  netdna-gw.cdg.ip4.cogentco.com  48.9 ms
12  151.101.66.49  46.7 ms          (CDN Fastly, Paris)
```

Observations cles :
- Plus de sauts = plus de latence (en general).
- Certains sauts ne repondent pas (`* * *`) : pare-feu bloquant ICMP.
- Les CDN (Content Delivery Networks) raccourcissent le chemin : la Nouvelle-Zelande est servie depuis Paris (Fastly CDN).
- Le routage passe par des points de peering (Cogent a Paris, puis backbones internationaux).
- La Namibie necessite 22 sauts via Cogent, Londres, puis l'Afrique, d'ou la latence de ~283ms.

### Q21. Faire des lookups DNS.

**Answer:**

```bash
$ nslookup www.free.fr
Name:   www.free.fr
Address: 212.27.48.10
Address: 2a01:e0c:1::1

$ nslookup www.insa-rennes.fr
Name:   www.insa-rennes.fr
Address: 193.52.94.51
```

| Site | IPv4 | IPv6 |
|------|------|------|
| www.free.fr | 212.27.48.10 | 2a01:e0c:1::1 |
| www.insa-rennes.fr | 193.52.94.51 | (pas d'IPv6) |

On peut capturer les requetes DNS dans Wireshark avec le filtre `dns` ou `udp.port == 53`. Une requete DNS de type A (IPv4) est envoyee en UDP vers le port 53 du serveur DNS, et la reponse contient l'adresse IP resolue.

---

## Section 6 : TCP et HTTP

### Q22. Quel port est utilise par HTTPS ?

**Answer:**

Le port utilise est TCP 443, qui correspond au service HTTPS (HTTP sur TLS/SSL).

### Q23. Quelle est la taille de l'en-tete TCP ?

**Answer:**

L'en-tete TCP fait 32 octets (20 octets de base + 12 octets d'options : MSS, SACK Permitted, Timestamps, Window Scale).

### Q24. Quelle est la segment length des trois paquets du handshake ?

**Answer:**

La Segment Length est mise a 0 pour les trois paquets du handshake. Aucune donnee applicative n'est echangee durant le handshake : ce sont uniquement des paquets de controle (SYN, SYN-ACK, ACK).

### Q25. Quel est le numero de sequence initial du client ?

**Answer:**

Wireshark affiche un numero de sequence relatif a 0 pour la lisibilite. En realite, le numero de sequence initial (ISN) choisi aleatoirement par le noyau est 238730258. La window length (taille du nombre d'octets pouvant etre envoyes sans ACK immediat) est 64860.

### Q26. Analyser le deuxieme paquet (SYN-ACK) : en-tete Ethernet, en-tete IP, champs TCP.

**Answer:**

En-tete Ethernet (dans un tunnel VPN, on ne voit pas la trame Ethernet, mais sur une interface WiFi on aurait) :
```
Source MAC: a4:4e:31:08:ac:84
Destination MAC: 0c:70:4a:f8:8a:47
Type: 0x0800 (IPv4)
```

En-tete IP (dans le tunnel) :
```
Source IP: 51.91.58.45
Destination IP: 10.8.1.135
```

Champs TCP du SYN-ACK :
```
Source Port: 443
Destination Port: 59676
Sequence Number: 1347695507 (ISN du serveur, aleatoire)
Acknowledgment Number: 238730259 (= ISN client + 1)
Flags: SYN = 1, ACK = 1
Window Size: 64296
Segment Length: 0
```

### Q27. Quel est le MSS negocie ?

**Answer:**

Le MSS (Maximum Segment Size) est le minimum des fenetres annoncees : min(64860, 64296) = 64296 octets.

### Q28. Analyser le troisieme paquet (ACK final du handshake).

**Answer:**

```
Sequence Number: 238730259
Acknowledgment Number: 1347695508 (= ISN serveur + 1)
Flags: ACK = 1
Window Size: 64896
Segment Length: 0
```

Ce troisieme paquet complete le handshake TCP a 3 voies. La connexion est desormais etablie.

### Q29. La connexion est-elle etablie ?

**Answer:**

Oui. Apres le troisieme paquet ACK, la connexion TCP est pleinement etablie (etat ESTABLISHED des deux cotes). Les deux parties peuvent maintenant echanger des donnees applicatives.

### Q30. Comment TCP assure la fiabilite du transfert ?

**Answer:**

TCP assure une livraison fiable et ordonnee grace a :
- **Numeros de sequence** : chaque octet est numerote, permettant de reconstituer l'ordre.
- **Accusés de reception (ACK)** : le recepteur confirme la reception de chaque segment.
- **Retransmission** : si un ACK n'est pas recu dans le delai imparti (timeout), l'emetteur retransmet.
- **Controle de flux** : la Window Size limite le debit pour ne pas saturer le recepteur.
- **Checksum** : detection des erreurs de transmission.

Diagramme du handshake complet :
```
  Client (port 59676)                    Serveur (port 443)
         |                                      |
         |--- SYN, Seq=238730258 ------------->|  "Je veux me connecter"
         |                                      |
         |<-- SYN-ACK, Seq=1347695507 ---------|  "OK, moi aussi"
         |    Ack=238730259                     |
         |                                      |
         |--- ACK, Ack=1347695508 ------------>|  "Connexion etablie"
         |                                      |
         |==== CONNEXION TCP ETABLIE ==========|
```

---

## Reference : Filtres Wireshark

| Filtre | Usage |
|--------|-------|
| `arp` | Paquets ARP (resolution MAC) |
| `icmp` | Paquets ICMP (ping, traceroute) |
| `tcp.flags.syn == 1` | Paquets SYN (debut connexion TCP) |
| `tcp.port == 443` | Trafic HTTPS |
| `udp.port == 53` | Requetes/reponses DNS |
| `ip.addr == 192.168.1.1` | Tout trafic depuis/vers cette IP |
| `ip.flags.mf == 1 \|\| ip.frag_offset > 0` | Paquets fragmentes |
| `tcp.stream eq 0` | Suivre un flux TCP complet |
