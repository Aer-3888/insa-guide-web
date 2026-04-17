---
title: "04 -- Couche transport (TCP & UDP)"
sidebar_position: 4
---

# 04 -- Couche transport (TCP & UDP)

## Vue d'ensemble

La couche transport assure deux fonctions :
1. **Multiplexage/demultiplexage** via les numeros de port (plusieurs applications partagent le reseau).
2. **Fiabilite** (TCP uniquement) : livraison garantie, ordonnee, sans erreurs.

---

## Numeros de port

Un port est un entier sur **16 bits** (0-65535). Un **socket** = (adresse IP, port).

| Plage | Nom | Usage |
|-------|-----|-------|
| 0-1023 | Bien connus (well-known) | HTTP=80, SSH=22, DNS=53 |
| 1024-49151 | Enregistres | Applications specifiques |
| 49152-65535 | Dynamiques (ephemeres) | Attribues aux clients |

---

## TCP (Transmission Control Protocol)

### Caracteristiques

- **Connecte** : etablissement de connexion avant echange de donnees.
- **Fiable** : livraison garantie, dans l'ordre, sans duplication.
- **Flux d'octets** : pas de frontieres de messages.
- **Full-duplex** : envoi et reception simultanes.
- **Controle de flux** : fenetre glissante.
- **Controle de congestion** : slow start, congestion avoidance.

### En-tete TCP (20 octets minimum)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
| Offset|  Res  |U|A|P|R|S|F|          Window Size             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |       Urgent Pointer          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

| Champ | Taille | Role |
|-------|--------|------|
| Source / Dest Port | 16 bits chacun | Identifier l'application |
| Sequence Number | 32 bits | Position du premier octet dans le flux |
| Acknowledgment Number | 32 bits | Prochain octet attendu |
| Flags | 6 bits | SYN, ACK, FIN, RST, PSH, URG |
| Window Size | 16 bits | Taille fenetre de reception (controle de flux) |

### Flags TCP

| Flag | Role |
|------|------|
| **SYN** | Initie la connexion, synchronise les numeros de sequence |
| **ACK** | Confirme la reception |
| **FIN** | Demande la fermeture |
| **RST** | Reinitialise la connexion (erreur/refus) |
| **PSH** | Passer les donnees a l'application immediatement |
| **URG** | Donnees urgentes |

---

### Three-way handshake (ouverture)

```
Client                          Serveur
  |                                |
  |--- SYN, Seq=x --------------->|  (Etat: SYN_SENT)
  |                                |
  |<-- SYN+ACK, Seq=y, Ack=x+1 --|  (Etat: SYN_RECEIVED)
  |                                |
  |--- ACK, Seq=x+1, Ack=y+1 --->|  (Etat: ESTABLISHED)
  |                                |  (Etat: ESTABLISHED)
```

**Paquet 1 (SYN)** : le client envoie son numero de sequence initial x (aleatoire).
**Paquet 2 (SYN-ACK)** : le serveur envoie y et acquitte x+1.
**Paquet 3 (ACK)** : le client acquitte y+1. Connexion etablie.

**SYN et FIN consomment chacun 1 numero de sequence** (meme sans donnees).

---

### Transfert de donnees

```
Client                          Serveur
  |--- Seq=1, Len=100 ---------->|  (octets 1-100)
  |<-- ACK=101 ------------------|  (j'attends l'octet 101)
  |--- Seq=101, Len=200 -------->|  (octets 101-300)
  |<-- ACK=301 ------------------|  (j'attends l'octet 301)
```

- **ACK cumulatif** : ACK=301 signifie "j'ai recu tout jusqu'a 300".
- **Retransmission** : si un segment est perdu, l'emetteur detecte la perte (timeout ou triple ACK duplique) et retransmet.

---

### Four-way teardown (fermeture)

```
Client                          Serveur
  |--- FIN, Seq=u --------------->|  (FIN_WAIT_1)
  |<-- ACK, Ack=u+1 -------------|  (CLOSE_WAIT)
  |                                |  (serveur finit d'envoyer)
  |<-- FIN, Seq=v ----------------|  (LAST_ACK)
  |--- ACK, Ack=v+1 ------------>|  (TIME_WAIT: 2*MSL)
  |                                |  (CLOSED)
  |  [2*MSL plus tard]            |
  |  (CLOSED)                     |
```

**TIME_WAIT** : le client attend 2*MSL (~2 min) pour s'assurer que le dernier ACK est bien arrive. C'est pourquoi un serveur peut refuser de redemarrer sur le meme port ("Address already in use"). Solution : `SO_REUSEADDR`.

---

### Controle de flux (fenetre glissante)

Le recepteur annonce une **Window Size** dans chaque ACK. L'emetteur ne peut pas envoyer plus d'octets que cette fenetre sans accuseé de reception.

Si le recepteur est deborde : `Window=0` = "arrete d'envoyer".

### Controle de congestion

Protege le **reseau** (pas le recepteur).

| Algorithme | Description |
|------------|-------------|
| **Slow Start** | cwnd commence a 1 MSS, double a chaque RTT (exponentiel) |
| **Congestion Avoidance** | Au-dessus de ssthresh, cwnd += 1 MSS par RTT (lineaire) |
| **Detection** | Timeout => cwnd=1 MSS, ssthresh=cwnd/2. Triple ACK duplique => cwnd=cwnd/2 (Fast Recovery) |

**Fenetre effective = min(rwnd, cwnd)** (minimum de la fenetre recepteur et congestion).

---

## UDP (User Datagram Protocol)

### Caracteristiques

- **Non connecte** : pas de handshake.
- **Non fiable** : pas de garantie de livraison, d'ordre ou d'absence de doublons.
- **Leger** : en-tete de 8 octets seulement.
- **Sans etat** : le serveur ne garde rien sur les clients.

### En-tete UDP (8 octets)

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Length             |           Checksum            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Quand utiliser UDP ?

- **DNS** : requetes courtes, retransmission geree par l'application.
- **Streaming video/audio** : mieux perdre une image qu'attendre.
- **Jeux en ligne** : latence > fiabilite.
- **VoIP** : silence > retard.
- **DHCP** : configuration initiale.
- **Multicast** : un emetteur, plusieurs recepteurs.

---

## TCP vs UDP : comparaison

| Critere | TCP | UDP |
|---------|-----|-----|
| Connexion | Oui (3-way handshake) | Non |
| Fiabilite | Oui (ACK, retransmission) | Non |
| Ordre | Oui (seq numbers) | Non |
| Controle de flux | Oui (fenetre) | Non |
| Controle de congestion | Oui | Non |
| En-tete | 20+ octets | 8 octets |
| Multicast | Non | Oui |
| Type | Flux d'octets | Datagrammes |
| Usage | HTTP, FTP, SSH, email | DNS, streaming, jeux |

---

## Pieges classiques

1. **Seq number = compteur d'octets, pas de segments** : si segment 1 = 100 octets a Seq=1, segment 2 commence a Seq=101.
2. **SYN et FIN consomment 1 numero de sequence** : ACK du SYN = Seq_initial + 1.
3. **UDP ne garantit rien** : ni livraison, ni ordre, ni absence de doublons.
4. **TIME_WAIT n'est pas un bug** : c'est une securite (2*MSL). `SO_REUSEADDR` pour contourner.
5. **Controle de flux != controle de congestion** : flux protege le recepteur, congestion protege le reseau.
6. **TCP = flux d'octets** : pas de frontieres de messages. "Bonjour"+"Monde" peut arriver comme "BonjourMonde".

---

## CHEAT SHEET

```
TCP : connecte, fiable, ordonne, flux d'octets, 20+ octets d'en-tete
UDP : non connecte, non fiable, datagrammes, 8 octets d'en-tete

3-way handshake : SYN(Seq=x) -> SYN-ACK(Seq=y,Ack=x+1) -> ACK(Seq=x+1,Ack=y+1)
4-way teardown  : FIN -> ACK -> FIN -> ACK  (puis TIME_WAIT 2*MSL)

SYN et FIN consomment chacun 1 numero de sequence

Controle de flux : Window Size dans ACK (protege recepteur)
Controle de congestion : cwnd (protege reseau)
  Slow Start : cwnd double a chaque RTT (exponentiel)
  Congestion Avoidance : cwnd + 1 MSS par RTT (lineaire)
  Fenetre effective = min(rwnd, cwnd)

Ports : HTTP=80  HTTPS=443  DNS=53  SSH=22  FTP=20/21  SMTP=25
```
