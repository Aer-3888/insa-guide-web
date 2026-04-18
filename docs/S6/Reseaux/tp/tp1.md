---
title: "TP1 - Decouverte reseau"
sidebar_position: 1
---

# TP1 - Decouverte reseau

Fondamentaux du reseau a travers les outils en ligne de commande et l'analyse de paquets avec Wireshark.

## Objectifs

Apprendre a inspecter et analyser la configuration reseau, le routage et les protocoles au niveau paquet en utilisant les outils reseau Linux et Wireshark.

## Themes abordes

1. **IP & Ethernet** - Configuration des interfaces et adressage
2. **ARP & ICMP** - Resolution d'adresses et analyse du ping
3. **Fragmentation IP** - MTU et fragmentation des paquets
4. **Services Internet** - Numeros de port et correspondance avec les services
5. **DNS** - Resolution de noms de domaine
6. **TCP & HTTP** - Etablissement de connexion et transfert de donnees

---

## Section 1 : IP & Ethernet

### Commandes
```bash
hostname                    # Nom de la machine
ifconfig                    # Interfaces reseau (obsolete)
ip addr show               # Liste moderne des interfaces
ip route show              # Table de routage
```

### Observations cles

**Q1 : Identification de la machine**
- Hostname : nom de la machine sur le reseau
- Interfaces : `lo` (loopback), `wlp3s0` (WiFi), `enp0s25` (Ethernet), `tun1` (VPN)
- Adresses IPv4 : `127.0.0.1` (loopback), `192.168.x.x` (reseau local)
- Adresses IPv6 : `::1` (loopback), link-local `fe80::/64`

**Q2 : MTU (Maximum Transmission Unit)**
| Interface | MTU | Remarques |
|-----------|-----|-----------|
| lo | 65536 | Loopback - pas de fragmentation necessaire |
| enp0s25, wlp3s0 | 1500 | MTU Ethernet standard |
| tun1 | 1420 | Tunnel VPN - legerement inferieur |

**Q3 : Table de routage**
```
# IPv4
default via 192.168.43.1 dev wlp3s0        # Passerelle par defaut
10.8.1.0/24 dev tun1                       # Reseau VPN
192.168.43.0/24 dev wlp3s0                 # Reseau local

# IPv6
default dev tun1                           # Route par defaut VPN
fd11:1::/64 dev tun1                       # Reseau IPv6 VPN
```

**Explication du routage :**
- Les paquets a destination du reseau local passent directement par `wlp3s0`
- Tout le reste passe par la passerelle par defaut ou le tunnel VPN
- Les routes VPN peuvent remplacer le routage par defaut pour certaines destinations

**Q4 : Comparaison avec une machine distante**
Connexion au VPS `vulpinecitrus.info` pour comparer la configuration reseau :
- Plus d'interfaces : `eth0` (publique), `docker0`, `tun0`, plusieurs `veth*` (conteneurs Docker)
- IPv4 publique : `51.91.58.45`
- IPv6 publique : `2001:41d0:305:2100::4547`
- Docker cree des reseaux bridge pour l'isolation des conteneurs

---

## Section 2 : Analyse ARP et ICMP

### ARP (Address Resolution Protocol)

**Role :** Associer les adresses IP aux adresses MAC sur le reseau local.

**Q5 : Table ARP**
```bash
arp -a
```

Affiche des associations comme :
```
192.168.43.1    ether   0c:70:4a:f8:8a:47   C   wlp3s0
```

**Q7 : Structure du paquet ARP** (capture apres purge du cache ARP)
```
Ethernet type: 0x0806 (ARP)
Hardware type: 1 (Ethernet)
Protocol type: 0x0800 (IPv4)
Hardware size: 6 (taille adresse MAC)
Protocol size: 4 (taille adresse IPv4)
Opcode: 1 (request) / 2 (reply)
Sender MAC: 0c:70:4a:f8:8a:47
Sender IP: 192.168.43.1
Target MAC: 00:00:00:00:00:00 (broadcast pour la requete)
Target IP: 192.168.43.251
```

**Deroulement :**
1. Le telephone/AP demande : "Qui a 192.168.43.251 ? Dites-le a 192.168.43.1"
2. Le laptop repond : "192.168.43.251 se trouve a a4:4e:31:08:ac:84"

### ICMP (Internet Control Message Protocol)

**Q6 : Analyse du ping**
```bash
ping -c 4 1.1.1.1
```

Capture sur l'interface VPN pour un trafic plus propre.

**Structure ICMP Echo Request/Reply :**
```
Type: 8 (Echo Request) / 0 (Echo Reply)
Code: 0
Checksum: 2 octets
Identifier: 2 octets (BE et LE)
Sequence number: 2 octets
Timestamp: 8 octets
Data: 48 octets (renvoyes a l'identique dans le Reply)
```

**Points cles :**
- ICMP est encapsule dans les paquets IP (numero de protocole IP : 1)
- Echo Request/Reply est utilise par `ping` pour tester la connectivite
- Le RTT (Round-Trip Time) est mesure entre la requete et la reponse

---

## Section 3 : Fragmentation IP

**Q14 : Test de la fragmentation**
```bash
ping -s 2000 1.1.1.1    # Taille du paquet > MTU (1420)
```

**Q15 : Analyse des fragments dans Wireshark**

Premier fragment :
```
Flags: More Fragments = 1
Fragment Offset: 0
Total Length: 1420
Identification: 0x1234 (identique pour tous les fragments)
```

Dernier fragment :
```
Flags: More Fragments = 0
Fragment Offset: 1400
Total Length: 628
Identification: 0x1234 (correspond au premier fragment)
```

**Q16 : Differences entre les fragments**
- Total length (1420 vs 628)
- Flag More Fragments (1 vs 0)
- Fragment offset (0 vs 1400)
- Checksum (recalcule pour chaque fragment)
- Meme champ identification pour regrouper les fragments

**Pourquoi la fragmentation se produit :**
Quand la taille du paquet depasse le MTU, la couche IP le decoupe en fragments plus petits qui tiennent dans le MTU. L'hote recepteur reassemble les fragments grace aux champs identification et offset.

---

## Section 4 : Services Internet

**Q17 : Correspondance service-port**

Fichier : `/etc/services`

Services courants :
```
ftp         20/tcp, 21/tcp      # File Transfer Protocol
ssh         22/tcp              # Secure Shell
telnet      23/tcp              # Telnet
smtp        25/tcp              # Simple Mail Transfer
domain      53/udp, 53/tcp      # DNS
http        80/tcp              # World Wide Web
pop3        110/tcp             # Post Office Protocol v3
ntp         123/udp             # Network Time Protocol
imap        143/tcp             # Internet Message Access
https       443/tcp             # HTTP over TLS/SSL
```

**Q18 : Connexions actives**
```bash
netstat -tuln    # Afficher les ports TCP/UDP en ecoute
netstat -tun     # Afficher les connexions etablies
```

La sortie montre :
- De nombreuses connexions HTTPS (port 443) vers divers services
- Une connexion HTTP (port 80) vers des miroirs de paquets
- Un client DHCP sur le port UDP bootpc
- Des connexions dans les etats : ESTABLISHED, TIME_WAIT

**Etats de connexion :**
- ESTABLISHED : connexion active
- TIME_WAIT : connexion fermee, en attente pour s'assurer que le distant a bien recu le FIN
- LISTEN : serveur en attente de connexions

---

## Section 5 : DNS et tests reseau

**Q19 : Tests de ping vers differents emplacements**
```bash
ping google.com           # ~142ms, 0.8% de perte
ping namibia-server.com   # ~283ms, 0% de perte
ping victoria.ac.nz       # ~135ms, 1.2% de perte
```

**Q20 : Analyse du traceroute**
```bash
traceroute google.com     # 11 sauts via le FAI jusqu'a Google
traceroute namibia-site   # 22 sauts via les backbones internationaux
traceroute victoria.ac.nz # 12 sauts via CDN
```

**Observations :**
- Plus de sauts = plus de latence (en general)
- Certains sauts ne repondent pas (`* * *`) - pare-feu bloquant ICMP
- Le FAI route via des points de peering (Cogent, etc.)
- Les CDN reduisent le nombre de sauts (le site neo-zelandais est en fait servi depuis Paris)

**Q21 : Lookups DNS**
```bash
nslookup www.free.fr
nslookup www.insa-rennes.fr
```

Resultats :
- `www.free.fr` : `212.27.48.10`, `2a01:e0c:1::1`
- `www.insa-rennes.fr` : `193.52.94.51` (pas d'IPv6)

---

## Section 6 : TCP & HTTP

**Q22-30 : Analyse du handshake TCP**

Capture d'une connexion HTTPS pour analyser le three-way handshake TCP.

### Three-Way Handshake

**Paquet 1 : SYN**
```
Client -> Serveur
Flags: SYN
Seq: 238730258 (initial aleatoire)
Ack: 0
Window: 64860
Options: MSS, SACK, timestamps, window scale
```

**Paquet 2 : SYN-ACK**
```
Serveur -> Client
Flags: SYN, ACK
Seq: 1347695507 (initial aleatoire du serveur)
Ack: 238730259 (seq client + 1)
Window: 64296
```

**Paquet 3 : ACK**
```
Client -> Serveur
Flags: ACK
Seq: 238730259
Ack: 1347695508 (seq serveur + 1)
Window: 64896
```

### Observations cles

**Q22 :** HTTPS utilise le port TCP 443

**Q23 :** L'en-tete TCP fait 32 octets (20 de base + 12 d'options)

**Q24 :** La longueur du segment est 0 pour tous les paquets du handshake (pas de donnees, uniquement du controle)

**Q25 :** Wireshark affiche des numeros de sequence relatifs commencant a 0 pour la lisibilite

**Q26 :** Trame Ethernet (non visible dans le tunnel VPN) :
```
Src MAC: a4:4e:31:08:ac:84
Dst MAC: 0c:70:4a:f8:8a:47
Type: 0x0800 (IPv4)
```

**Q27 :** MSS (Maximum Segment Size) = min(fenetre client, fenetre serveur) = 64296

**Q28 :** Le dernier ACK complete le handshake avec Seq=238730259, Ack=1347695508

**Q29 :** La connexion est etablie, prete pour le transfert de donnees

**Q30 :** TCP assure une livraison fiable et ordonnee grace a :
- Les numeros de sequence (suivi de l'ordre des octets)
- Les accuses de reception (confirmation de reception)
- La retransmission en cas de timeout
- Le controle de flux via la taille de fenetre

---

## Resume des outils et commandes

| Outil | Role | Exemple |
|-------|------|---------|
| `hostname` | Nom de la machine | `hostname` |
| `ip addr` | Info interfaces | `ip addr show wlp3s0` |
| `ip route` | Table de routage | `ip route show` |
| `arp` | Cache ARP | `arp -a` |
| `ping` | Test de connectivite | `ping -c 4 google.com` |
| `traceroute` | Tracer la route | `traceroute google.com` |
| `netstat` | Connexions | `netstat -tuln` |
| `nslookup` | Lookup DNS | `nslookup google.com` |
| `dig` | Details DNS | `dig google.com` |
| `wireshark` | Capture de paquets | Lancer l'interface, selectionner l'interface |

---

## Filtres Wireshark

```
arp                         # Paquets ARP uniquement
icmp                        # Paquets ICMP
tcp.flags.syn == 1          # Paquets TCP SYN
tcp.port == 443             # Trafic HTTPS
ip.addr == 192.168.1.1      # IP specifique
tcp.stream eq 0             # Suivre un flux TCP
```

---

## Points a retenir

1. **Architecture en couches** : chaque couche de protocole ajoute son propre en-tete
2. **ARP est local** : fonctionne uniquement sur le meme segment reseau
3. **ICMP pour le diagnostic** : ping et traceroute reposent sur ICMP
4. **Surcout de la fragmentation** : a eviter quand possible (Path MTU Discovery)
5. **Fiabilite TCP** : handshake, numeros de sequence et ACK assurent la livraison
6. **Numeros de port** : identifient les services specifiques sur un hote
7. **Decisions de routage** : basees sur l'IP de destination et la table de routage

---

## Pour aller plus loin

- Capturer des requetes DNS avec Wireshark (port UDP 53)
- Analyser des requetes HTTP GET/POST (port TCP 80)
- Observer les retransmissions TCP en cas de perte de paquets
- Comparer le window scaling TCP avec differents serveurs
- Examiner le Neighbor Discovery IPv6 (remplace ARP pour IPv6)

---

## Fichiers dans ce repertoire

- `CR.md` - Compte rendu de TP original (francais)
- `tp(11).pdf` - Enonce du TP
- `TP1_GONZALEZ.pdf` - Rapport complete
