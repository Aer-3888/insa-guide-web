---
title: "Analyse de protocoles -- Exam Prep"
sidebar_position: 3
---

# Analyse de protocoles -- Exam Prep

Exercices types d'analyse de captures et de protocoles, tels qu'ils apparaissent en DS.

---

## Exercice 1 : Identifier les couches dans une capture

**Donne** : une trame capturee par Wireshark.

```
Ethernet II, Src: a4:4e:31:08:ac:84, Dst: 0c:70:4a:f8:8a:47
  Type: 0x0800 (IPv4)

Internet Protocol Version 4
  Src: 192.168.1.10, Dst: 93.184.216.34
  TTL: 64
  Protocol: TCP (6)

Transmission Control Protocol
  Src Port: 54321, Dst Port: 80
  Seq: 1, Ack: 1
  Flags: PSH, ACK
  Window: 64240

Hypertext Transfer Protocol
  GET /index.html HTTP/1.1
  Host: www.example.com
```

**Analyse :**

| Couche | Protocole | Adresses | Info cle |
|--------|-----------|----------|----------|
| 2 (Liaison) | Ethernet | MAC a4:4e:31:08:ac:84 -> 0c:70:4a:f8:8a:47 | Type=0x0800 (IPv4) |
| 3 (Reseau) | IPv4 | 192.168.1.10 -> 93.184.216.34 | TTL=64, Protocol=TCP |
| 4 (Transport) | TCP | Port 54321 -> Port 80 | Flags=PSH+ACK |
| 7 (Application) | HTTP | - | GET /index.html HTTP/1.1 |

---

## Exercice 2 : Analyser un 3-way handshake TCP

**Donne** : trois paquets captures.

```
Paquet 1 : 192.168.1.10:54321 -> 93.184.216.34:80
           Flags=SYN, Seq=100, Ack=0, Win=64240

Paquet 2 : 93.184.216.34:80 -> 192.168.1.10:54321
           Flags=SYN+ACK, Seq=500, Ack=101, Win=65535

Paquet 3 : 192.168.1.10:54321 -> 93.184.216.34:80
           Flags=ACK, Seq=101, Ack=501, Win=64240
```

**Questions et reponses :**

Q1 : Quel est le numero de sequence initial du client ?
R : **100** (Seq du paquet SYN).

Q2 : Quel est le numero de sequence initial du serveur ?
R : **500** (Seq du paquet SYN-ACK).

Q3 : Pourquoi Ack=101 dans le paquet 2 ?
R : Parce que SYN consomme 1 numero de sequence. Le serveur attend l'octet 101 (= 100 + 1).

Q4 : Pourquoi Ack=501 dans le paquet 3 ?
R : Meme raison. Le client a recu le SYN du serveur (Seq=500) et attend l'octet 501.

Q5 : Les paquets du handshake contiennent-ils des donnees ?
R : Non. Le Segment Length est 0 pour les trois paquets.

---

## Exercice 3 : Transfert de donnees TCP

**Donne** : apres le handshake, les echanges suivants.

```
Paquet 4 : Client -> Serveur, Seq=101, Ack=501, Len=200
           (GET request, 200 octets)

Paquet 5 : Serveur -> Client, Seq=501, Ack=301
           (ACK de la requete)

Paquet 6 : Serveur -> Client, Seq=501, Ack=301, Len=1500
           (Debut de la reponse HTTP)

Paquet 7 : Client -> Serveur, Seq=301, Ack=2001
           (ACK)

Paquet 8 : Serveur -> Client, Seq=2001, Ack=301, Len=800
           (Fin de la reponse HTTP)

Paquet 9 : Client -> Serveur, Seq=301, Ack=2801
           (ACK)
```

**Questions :**

Q1 : Quel est le prochain numero de sequence du client apres le paquet 4 ?
R : **301** (101 + 200 = 301).

Q2 : Combien d'octets le serveur a-t-il envoye au total ?
R : **2300** (1500 + 800).

Q3 : Quel ACK confirme la reception complete de la reponse ?
R : **Ack=2801** (paquet 9). 501 + 1500 + 800 = 2801.

---

## Exercice 4 : Analyser un echange ARP

**Donne** : deux paquets captures.

```
Paquet 1 (ARP Request) :
  Ethernet: Src=AA:AA:AA:AA:AA:AA, Dst=FF:FF:FF:FF:FF:FF
  ARP: Opcode=Request
       Sender MAC=AA:AA:AA:AA:AA:AA, Sender IP=192.168.1.10
       Target MAC=00:00:00:00:00:00, Target IP=192.168.1.1

Paquet 2 (ARP Reply) :
  Ethernet: Src=BB:BB:BB:BB:BB:BB, Dst=AA:AA:AA:AA:AA:AA
  ARP: Opcode=Reply
       Sender MAC=BB:BB:BB:BB:BB:BB, Sender IP=192.168.1.1
       Target MAC=AA:AA:AA:AA:AA:AA, Target IP=192.168.1.10
```

**Questions :**

Q1 : Pourquoi la destination Ethernet est FF:FF:FF:FF:FF:FF dans le paquet 1 ?
R : Parce que l'ARP Request est envoye en **broadcast** : l'emetteur ne connait pas la MAC du destinataire.

Q2 : Pourquoi le paquet 2 n'est pas en broadcast ?
R : L'ARP Reply est en **unicast** : le destinataire est connu (c'est celui qui a pose la question).

Q3 : Que met PC A dans son cache ARP apres cet echange ?
R : 192.168.1.1 -> BB:BB:BB:BB:BB:BB.

---

## Exercice 5 : Routage pas a pas

**Donne** : PC A (192.168.1.10, MAC AA) envoie un paquet a PC B (10.0.0.20, MAC BB) via R1 et R2.

```
LAN1 : 192.168.1.0/24
  PC A : 192.168.1.10 (MAC AA), gateway 192.168.1.1
  R1 eth0 : 192.168.1.1 (MAC R1A)

Lien : 192.168.2.0/24
  R1 eth1 : 192.168.2.1 (MAC R1B)
  R2 eth0 : 192.168.2.2 (MAC R2A)

LAN2 : 10.0.0.0/24
  R2 eth1 : 10.0.0.1 (MAC R2B)
  PC B : 10.0.0.20 (MAC BB)
```

**Remplir le tableau :**

| Saut | MAC src | MAC dest | IP src | IP dest | TTL |
|------|---------|----------|--------|---------|-----|
| A -> R1 | AA | R1A | 192.168.1.10 | 10.0.0.20 | 64 |
| R1 -> R2 | R1B | R2A | 192.168.1.10 | 10.0.0.20 | 63 |
| R2 -> B | R2B | BB | 192.168.1.10 | 10.0.0.20 | 62 |

**Points cles :**
- IP src et IP dest **ne changent jamais** (sauf NAT).
- MAC src et MAC dest **changent a chaque saut**.
- TTL est **decremente de 1** a chaque routeur.
- A chaque saut, le routeur fait un **ARP** pour trouver la MAC du prochain saut.

---

## Exercice 6 : Analyse DNS

**Donne** : deux paquets captures.

```
Paquet 1 (requete DNS) :
  UDP, Src Port=49152, Dst Port=53
  DNS Query: www.example.com, Type=A

Paquet 2 (reponse DNS) :
  UDP, Src Port=53, Dst Port=49152
  DNS Response: www.example.com, Type=A, 93.184.216.34, TTL=86400
```

**Questions :**

Q1 : Quel transport utilise DNS ici ?
R : **UDP** (port 53). Reponse courte, pas besoin de TCP.

Q2 : Que signifie TTL=86400 ?
R : Le resultat peut etre **cache pendant 86400 secondes** (24 heures).

Q3 : Quand DNS utiliserait-il TCP ?
R : Pour les reponses > 512 octets ou les transferts de zone entre serveurs DNS.

---

## Exercice 7 : Comparaison TCP vs UDP

**Question** : pour chaque application, indiquer le protocole adapte et justifier.

| Application | Protocole | Justification |
|-------------|-----------|---------------|
| Navigateur web | TCP | Fiabilite necessaire (pages completes) |
| Streaming video | UDP | Latence critique, perte acceptable |
| Transfert de fichier | TCP | Integrite des donnees obligatoire |
| Jeu en ligne (FPS) | UDP | Latence < fiabilite |
| Resolution DNS | UDP | Requete courte, retransmission par l'app |
| Email (envoi) | TCP | Fiabilite necessaire |
| VoIP | UDP | Latence critique, silence > retard |
| Chat multicast | UDP | Multicast impossible avec TCP |
