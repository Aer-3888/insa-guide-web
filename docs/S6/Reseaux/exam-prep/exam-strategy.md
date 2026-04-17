---
title: "Strategie d'examen -- Reseaux"
sidebar_position: 2
---

# Strategie d'examen -- Reseaux

## Principes generaux

1. **Lire tout le sujet** avant de commencer. Identifier les exercices ou tu es le plus a l'aise.
2. **Commencer par les sous-reseaux** : c'est mecanique, ca rapporte des points rapidement.
3. **Bien gerer le temps** : ne pas rester bloque sur un exercice. Si ca bloque apres 5 min, passer au suivant.
4. **Toujours justifier** : meme si la reponse est fausse, le raisonnement peut rapporter des points.
5. **Dessiner des schemas** : pour le routage, tracer le reseau et annoter les MAC/IP a chaque saut.

---

## Repartition du temps conseillee (DS 2h)

| Phase | Duree | Action |
|-------|-------|--------|
| Lecture complete | 10 min | Lire tout, reperer les exercices faciles |
| Exercice sous-reseaux | 25 min | Calculs mecaniques, pas d'erreur d'inattention |
| Exercice routage | 25 min | Schema, table de routage, MAC/IP a chaque saut |
| Exercice TCP/protocoles | 25 min | Handshake, seq numbers, analyse de capture |
| Exercice socket/applicatif | 25 min | Code C, conception de protocole |
| Relecture | 10 min | Verifier les calculs, les oublis |

---

## Les 15 pieges les plus frequents en DS

| # | Piege | Bonne reponse |
|---|-------|---------------|
| 1 | Oublier -2 dans le nombre d'hotes | 2^n - 2 (reseau + broadcast) |
| 2 | Adresse MAC constante de bout en bout | NON, elle change a chaque saut |
| 3 | Adresse IP change a chaque routeur | NON, elle reste constante (sauf NAT) |
| 4 | ARP Reply en broadcast | NON, ARP Reply est en unicast |
| 5 | Hub = Switch | NON, hub = couche 1, switch = couche 2 |
| 6 | DNS toujours en UDP | NON, TCP pour reponses > 512 octets |
| 7 | HTTP garde un etat | NON, HTTP est sans etat (stateless) |
| 8 | SYN ne consomme pas de Seq | SI, SYN et FIN consomment 1 numero de sequence |
| 9 | TCP envoie des messages | NON, TCP est un flux d'octets |
| 10 | Controle de flux = controle de congestion | NON, flux = recepteur, congestion = reseau |
| 11 | /31 = 0 hote | NON, /31 = 2 hotes (liens point a point) |
| 12 | Masque non contigu possible | NON, toujours une suite de 1 puis de 0 |
| 13 | TIME_WAIT est un bug | NON, c'est voulu (2*MSL pour securite) |
| 14 | UDP garantit l'ordre | NON, aucune garantie |
| 15 | TTL ne change pas | SI, decremente a chaque routeur |

---

## Checklist avant le DS

### Sous-reseaux
- [ ] Connaitre le tableau des masques /24 a /30 par coeur
- [ ] Maitriser la methode : masque -> pas -> reseau -> broadcast -> plage
- [ ] Savoir faire du VLSM (du plus grand au plus petit)
- [ ] Puissances de 2 de 2^1 a 2^10

### Routage
- [ ] Savoir lire une table de routage
- [ ] Appliquer le longest prefix match
- [ ] Tracer le parcours d'un paquet : IP (constante) vs MAC (variable) vs TTL (decremente)
- [ ] Connaitre RIP (sauts, max 15) vs OSPF (cout, Dijkstra) vs BGP (inter-AS)

### TCP/UDP
- [ ] Dessiner le 3-way handshake avec les numeros de sequence
- [ ] Savoir que SYN et FIN consomment 1 seq
- [ ] Expliquer la difference controle de flux vs congestion
- [ ] Connaitre la fenetre effective = min(rwnd, cwnd)
- [ ] Savoir ce qu'est TIME_WAIT et pourquoi il existe

### Programmation socket
- [ ] Ecrire un serveur TCP en C de memoire
- [ ] Connaitre les differences TCP (listen/accept/send/recv) vs UDP (sendto/recvfrom)
- [ ] htons(), htonl(), inet_aton(), inet_ntoa()
- [ ] SO_REUSEADDR, IP_ADD_MEMBERSHIP

### Protocoles applicatifs
- [ ] DNS : hierarchie, resolution iterative, types A/AAAA/CNAME/MX/NS
- [ ] HTTP : GET/POST, codes 200/301/404/500, Host obligatoire en 1.1
- [ ] DHCP : processus DORA
- [ ] ARP : request = broadcast, reply = unicast

---

## Formules a memoriser

```
Nombre d'hotes = 2^(32-n) - 2
Pas = 256 - dernier octet du masque
Bits supplementaires = ceil(log2(nb sous-reseaux))

Cout OSPF = reference (100 Mbit/s) / bande passante du lien

Fragmentation :
  Donnees par fragment = (MTU - 20) arrondi au multiple de 8 inferieur
  Offset = position en octets / 8

TCP :
  ACK = Seq_recu + longueur_donnees_recues
  Pour SYN : ACK = Seq_initial + 1
  Fenetre effective = min(rwnd, cwnd)
```

---

## Commandes reseau a connaitre

```bash
ip addr show          # Interfaces et adresses
ip route show         # Table de routage
arp -a                # Cache ARP
ping <ip>             # Test connectivite (ICMP)
traceroute <ip>       # Chemin parcouru
nslookup <domaine>    # Resolution DNS
dig <domaine>         # DNS detaille
netstat -tuln         # Ports en ecoute
```
