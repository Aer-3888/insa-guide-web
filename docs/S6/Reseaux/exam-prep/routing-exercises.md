---
title: "Exercices de routage -- Exam Prep"
sidebar_position: 4
---

# Exercices de routage -- Exam Prep

Exercices types de routage : tables de routage, longest prefix match, tracage pas a pas.

---

## Exercice 1 : Longest prefix match

**Donne** : table de routage du routeur R.

```
Destination      Masque    Passerelle       Interface
10.0.0.0         /8        192.168.1.1      eth0
10.1.0.0         /16       192.168.1.2      eth0
10.1.2.0         /24       192.168.1.3      eth1
172.16.0.0       /12       192.168.1.4      eth1
0.0.0.0          /0        192.168.1.254    eth0
```

Pour chaque paquet, indiquer la passerelle choisie.

### Paquet a destination de 10.1.2.42

```
10.0.0.0/8      -> correspond (8 bits)
10.1.0.0/16     -> correspond (16 bits)
10.1.2.0/24     -> correspond (24 bits)  <- GAGNANT
0.0.0.0/0       -> correspond (0 bits)

Reponse : 192.168.1.3 via eth1
```

### Paquet a destination de 10.1.3.5

```
10.0.0.0/8      -> correspond (8 bits)
10.1.0.0/16     -> correspond (16 bits)  <- GAGNANT
10.1.2.0/24     -> NE correspond PAS (10.1.3 != 10.1.2)
0.0.0.0/0       -> correspond (0 bits)

Reponse : 192.168.1.2 via eth0
```

### Paquet a destination de 10.2.3.4

```
10.0.0.0/8      -> correspond (8 bits)   <- GAGNANT
10.1.0.0/16     -> NE correspond PAS (10.2 != 10.1)
10.1.2.0/24     -> NE correspond PAS
0.0.0.0/0       -> correspond (0 bits)

Reponse : 192.168.1.1 via eth0
```

### Paquet a destination de 172.16.5.10

```
172.16.0.0/12   -> correspond (12 bits)  <- GAGNANT
0.0.0.0/0       -> correspond (0 bits)

Verification /12 : 172.16.0.0/12 couvre 172.16.0.0 - 172.31.255.255
172.16.5.10 est dans cette plage -> OUI

Reponse : 192.168.1.4 via eth1
```

### Paquet a destination de 8.8.8.8

```
Aucune route specifique ne correspond.
0.0.0.0/0       -> correspond (0 bits)   <- GAGNANT (route par defaut)

Reponse : 192.168.1.254 via eth0
```

---

## Exercice 2 : Routage pas a pas complet

**Topologie** :

```
PC A (192.168.1.10, MAC=AA)
  |
  | LAN1 : 192.168.1.0/24
  |
R1 (eth0: 192.168.1.1, MAC=R1A) (eth1: 10.0.0.1, MAC=R1B)
  |
  | LAN2 : 10.0.0.0/24
  |
R2 (eth0: 10.0.0.2, MAC=R2A) (eth1: 172.16.0.1, MAC=R2B)
  |
  | LAN3 : 172.16.0.0/24
  |
PC B (172.16.0.10, MAC=BB)
```

**Tables de routage** :

```
PC A :  default via 192.168.1.1
R1 :    192.168.1.0/24 directement (eth0)
        10.0.0.0/24 directement (eth1)
        172.16.0.0/24 via 10.0.0.2
R2 :    10.0.0.0/24 directement (eth0)
        172.16.0.0/24 directement (eth1)
        192.168.1.0/24 via 10.0.0.1
```

### PC A envoie un paquet a PC B (172.16.0.10)

**Etape 1 : PC A**

```
IP dest = 172.16.0.10. Pas sur le meme reseau que 192.168.1.10/24.
-> Envoyer a la passerelle par defaut : 192.168.1.1
-> ARP : "Qui a 192.168.1.1 ?" -> MAC = R1A

Trame envoyee :
  MAC dest = R1A (routeur, PAS PC B)
  MAC src  = AA
  IP dest  = 172.16.0.10
  IP src   = 192.168.1.10
  TTL      = 64
```

**Etape 2 : R1**

```
Recoit la trame sur eth0. Retire l'en-tete Ethernet.
Lit IP dest = 172.16.0.10.
Consulte table de routage :
  172.16.0.0/24 via 10.0.0.2 (eth1)
-> ARP : "Qui a 10.0.0.2 ?" -> MAC = R2A
Decremente TTL : 64 -> 63

Trame envoyee :
  MAC dest = R2A
  MAC src  = R1B
  IP dest  = 172.16.0.10  (INCHANGE)
  IP src   = 192.168.1.10 (INCHANGE)
  TTL      = 63
```

**Etape 3 : R2**

```
Recoit sur eth0. Retire Ethernet.
IP dest = 172.16.0.10 -> directement connecte (eth1)
-> ARP : "Qui a 172.16.0.10 ?" -> MAC = BB
Decremente TTL : 63 -> 62

Trame envoyee :
  MAC dest = BB
  MAC src  = R2B
  IP dest  = 172.16.0.10  (INCHANGE)
  IP src   = 192.168.1.10 (INCHANGE)
  TTL      = 62
```

**Etape 4 : PC B**

```
Recoit la trame. MAC dest = BB = sa MAC -> OK.
Retire Ethernet. IP dest = 172.16.0.10 = son IP -> OK.
Retire IP. Passe au transport.
```

### Tableau recapitulatif

| Saut | MAC src | MAC dest | IP src | IP dest | TTL |
|------|---------|----------|--------|---------|-----|
| A -> R1 | AA | R1A | 192.168.1.10 | 172.16.0.10 | 64 |
| R1 -> R2 | R1B | R2A | 192.168.1.10 | 172.16.0.10 | 63 |
| R2 -> B | R2B | BB | 192.168.1.10 | 172.16.0.10 | 62 |

---

## Exercice 3 : Construire une table de routage

**Donne** : un routeur R a trois interfaces.

```
eth0 : 192.168.1.1/24 (connecte au LAN bureaux)
eth1 : 10.0.0.1/30    (lien vers R2, adresse R2 = 10.0.0.2)
eth2 : 172.16.0.1/30  (lien vers R3, adresse R3 = 172.16.0.2)
```

R2 connait les reseaux 10.1.0.0/16 et 10.2.0.0/16.
R3 connait le reseau 172.16.10.0/24.
Internet est accessible via R2.

**Table de routage de R :**

| Destination | Masque | Passerelle | Interface |
|-------------|--------|------------|-----------|
| 192.168.1.0 | /24 | Directement connecte | eth0 |
| 10.0.0.0 | /30 | Directement connecte | eth1 |
| 172.16.0.0 | /30 | Directement connecte | eth2 |
| 10.1.0.0 | /16 | 10.0.0.2 | eth1 |
| 10.2.0.0 | /16 | 10.0.0.2 | eth1 |
| 172.16.10.0 | /24 | 172.16.0.2 | eth2 |
| 0.0.0.0 | /0 | 10.0.0.2 | eth1 |

---

## Exercice 4 : RIP vs OSPF

**Donne** : topologie avec couts.

```
    10 Mbit/s        100 Mbit/s
A ----------- B ------------ C
|                             |
|  1 Gbit/s                   | 10 Mbit/s
|                             |
D --------------------------->E
         100 Mbit/s
```

**Question** : quel chemin prend un paquet de A a C avec RIP ? Avec OSPF ?

**RIP** (metrique = nombre de sauts) :
- A -> B -> C = 2 sauts
- A -> D -> E -> C = 3 sauts
- **Choix RIP : A -> B -> C** (moins de sauts)

**OSPF** (metrique = cout basee sur la bande passante, reference = 100) :
- A -> B : cout = 100/10 = 10. B -> C : cout = 100/100 = 1. Total = **11**.
- A -> D : cout = 100/1000 = 1. D -> E : cout = 100/100 = 1. E -> C : cout = 100/10 = 10. Total = **12**.
- **Choix OSPF : A -> B -> C** (cout total = 11 vs 12)

Dans d'autres topologies, RIP et OSPF peuvent donner des resultats differents car la metrique differe.

---

## Points cles a retenir

1. **Longest prefix match** : toujours la route avec le masque le plus long.
2. **Route par defaut** = /0 : correspond a tout, priorite la plus basse.
3. **IP ne change pas** (sauf NAT), **MAC change** a chaque saut, **TTL decremente**.
4. **ARP** necessaire a chaque saut pour connaitre la MAC du prochain hop.
5. **RIP** = sauts (max 15), **OSPF** = cout (bande passante).
