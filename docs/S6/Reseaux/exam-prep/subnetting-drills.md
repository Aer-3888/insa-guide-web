---
title: "Exercices de sous-reseaux -- Exam Prep"
sidebar_position: 6
---

# Exercices de sous-reseaux -- Exam Prep

Le sous-reseautage est le theme **le plus teste** en DS. Maitrise ces exercices et tu garantis des points.

---

## Rappel de la methode

```
1. Masque en notation decimale (ex: /26 -> 255.255.255.192)
2. Pas = 256 - dernier octet du masque (ex: 256-192 = 64)
3. Adresse reseau = plus grand multiple du pas <= octet hote
4. Broadcast = prochain multiple du pas - 1
5. Premier hote = adresse reseau + 1
6. Dernier hote = broadcast - 1
7. Nombre d'hotes = 2^(32-n) - 2
```

---

## Exercice 1 : Trouver les infos reseau

Pour chaque adresse, donner : adresse reseau, broadcast, premier hote, dernier hote, nombre d'hotes.

### 1a) 192.168.5.130/25

```
Masque : 255.255.255.128
Pas : 256 - 128 = 128
Sous-reseaux dans le 4e octet : 0, 128
130 >= 128 -> Reseau : 192.168.5.128
Broadcast : 192.168.5.255 (128 + 128 - 1)
Premier hote : 192.168.5.129
Dernier hote : 192.168.5.254
Nombre d'hotes : 2^7 - 2 = 126
```

### 1b) 10.45.72.200/20

```
Masque : /20 = 255.255.240.0 (20 bits = 8+8+4, dernier octet significatif = 3e)
Pas dans le 3e octet : 256 - 240 = 16
3e octet = 72. 72 / 16 = 4.5 -> 4 * 16 = 64
Reseau : 10.45.64.0
Broadcast : 10.45.79.255 (64 + 16 - 1 = 79 dans le 3e octet, 255 dans le 4e)
Premier hote : 10.45.64.1
Dernier hote : 10.45.79.254
Nombre d'hotes : 2^12 - 2 = 4094
```

### 1c) 172.16.45.130/26

```
Masque : 255.255.255.192
Pas : 256 - 192 = 64
Sous-reseaux : 0, 64, 128, 192
130 : entre 128 et 192
Reseau : 172.16.45.128
Broadcast : 172.16.45.191
Premier hote : 172.16.45.129
Dernier hote : 172.16.45.190
Nombre d'hotes : 2^6 - 2 = 62
```

### 1d) 10.0.0.1/30

```
Masque : 255.255.255.252
Pas : 256 - 252 = 4
1 : entre 0 et 4
Reseau : 10.0.0.0
Broadcast : 10.0.0.3
Premier hote : 10.0.0.1
Dernier hote : 10.0.0.2
Nombre d'hotes : 2^2 - 2 = 2 (lien point a point)
```

### 1e) 192.168.100.65/27

```
Masque : 255.255.255.224
Pas : 256 - 224 = 32
Sous-reseaux : 0, 32, 64, 96, 128, 160, 192, 224
65 : entre 64 et 96
Reseau : 192.168.100.64
Broadcast : 192.168.100.95
Premier hote : 192.168.100.65
Dernier hote : 192.168.100.94
Nombre d'hotes : 2^5 - 2 = 30
```

---

## Exercice 2 : Decouper un reseau

### 2a) 192.168.1.0/24 en sous-reseaux de 50 hotes

```
Besoin : 50 + 2 = 52 adresses. 2^6 = 64 >= 52.
Masque : /26 (32 - 6 = 26)
Pas : 64

| # | Adresse reseau    | Broadcast         | Plage d'hotes              | Hotes |
|---|-------------------|-------------------|----------------------------|-------|
| 1 | 192.168.1.0/26    | 192.168.1.63      | 192.168.1.1 - .62          | 62    |
| 2 | 192.168.1.64/26   | 192.168.1.127     | 192.168.1.65 - .126        | 62    |
| 3 | 192.168.1.128/26  | 192.168.1.191     | 192.168.1.129 - .190       | 62    |
| 4 | 192.168.1.192/26  | 192.168.1.255     | 192.168.1.193 - .254       | 62    |
```

4 sous-reseaux de 62 hotes chacun.

### 2b) 10.0.0.0/8 en 8 sous-reseaux egaux

```
8 sous-reseaux = 2^3 -> 3 bits supplementaires
Masque : /8 + 3 = /11 = 255.224.0.0
Pas dans le 2e octet : 256 - 224 = 32

| # | Reseau        | Broadcast        | Hotes           |
|---|---------------|------------------|-----------------|
| 1 | 10.0.0.0/11   | 10.31.255.255    | 2^21 - 2 = 2M  |
| 2 | 10.32.0.0/11  | 10.63.255.255    | 2M              |
| 3 | 10.64.0.0/11  | 10.95.255.255    | 2M              |
| 4 | 10.96.0.0/11  | 10.127.255.255   | 2M              |
| 5 | 10.128.0.0/11 | 10.159.255.255   | 2M              |
| 6 | 10.160.0.0/11 | 10.191.255.255   | 2M              |
| 7 | 10.192.0.0/11 | 10.223.255.255   | 2M              |
| 8 | 10.224.0.0/11 | 10.255.255.255   | 2M              |
```

---

## Exercice 3 : VLSM

### 3a) Reseau 172.16.0.0/16, besoins : 500, 200, 100, 50, 2, 2 hotes

**Methode** : du plus grand au plus petit.

```
500 hotes : 500+2=502, 2^9=512 >= 502 -> /23 (9 bits hote)
  172.16.0.0/23 (512 adresses)
  Prochain : 172.16.2.0

200 hotes : 200+2=202, 2^8=256 >= 202 -> /24
  172.16.2.0/24 (256 adresses)
  Prochain : 172.16.3.0

100 hotes : 100+2=102, 2^7=128 >= 102 -> /25
  172.16.3.0/25 (128 adresses)
  Prochain : 172.16.3.128

50 hotes : 50+2=52, 2^6=64 >= 52 -> /26
  172.16.3.128/26 (64 adresses)
  Prochain : 172.16.3.192

2 hotes : 2+2=4, 2^2=4 >= 4 -> /30
  172.16.3.192/30 (4 adresses)
  Prochain : 172.16.3.196

2 hotes : /30
  172.16.3.196/30 (4 adresses)
```

**Bilan :**

| Besoin | CIDR | Adresse | Hotes disponibles |
|--------|------|---------|-------------------|
| 500 | /23 | 172.16.0.0/23 | 510 |
| 200 | /24 | 172.16.2.0/24 | 254 |
| 100 | /25 | 172.16.3.0/25 | 126 |
| 50 | /26 | 172.16.3.128/26 | 62 |
| 2 | /30 | 172.16.3.192/30 | 2 |
| 2 | /30 | 172.16.3.196/30 | 2 |

---

## Exercice 4 : Deux machines sont-elles sur le meme reseau ?

### Methode

Appliquer le masque (ET logique) aux deux adresses. Si le resultat est identique, elles sont sur le meme reseau.

### 4a) 192.168.1.100/24 et 192.168.1.200/24

```
192.168.1.100 AND 255.255.255.0 = 192.168.1.0
192.168.1.200 AND 255.255.255.0 = 192.168.1.0
Meme reseau : OUI
```

### 4b) 10.1.1.5/25 et 10.1.1.130/25

```
10.1.1.5   AND 255.255.255.128 = 10.1.1.0
10.1.1.130 AND 255.255.255.128 = 10.1.1.128
Meme reseau : NON (10.1.1.0/25 vs 10.1.1.128/25)
```

### 4c) 172.16.45.130/26 et 172.16.45.190/26

```
172.16.45.130 AND 255.255.255.192 = 172.16.45.128
172.16.45.190 AND 255.255.255.192 = 172.16.45.128
Meme reseau : OUI
```

---

## Exercice 5 : Fragmentation IP

### Un paquet de 3000 octets de donnees, MTU = 1500

```
Donnees par fragment = 1500 - 20 = 1480 (deja multiple de 8)

Fragment 1 : 1480 octets, offset=0,   MF=1, Total Length=1500
Fragment 2 : 1480 octets, offset=185, MF=1, Total Length=1500
             (offset = 1480/8 = 185)
Fragment 3 : 40 octets,   offset=370, MF=0, Total Length=60
             (offset = 2960/8 = 370)

Verification : 1480 + 1480 + 40 = 3000
```

### Un paquet de 5000 octets de donnees, MTU = 1000

```
Donnees par fragment = 1000 - 20 = 980. 980/8 = 122.5 -> arrondir a 976 (122*8)

Fragment 1 : 976 octets, offset=0,   MF=1, Total Length=996
Fragment 2 : 976 octets, offset=122, MF=1, Total Length=996
Fragment 3 : 976 octets, offset=244, MF=1, Total Length=996
Fragment 4 : 976 octets, offset=366, MF=1, Total Length=996
Fragment 5 : 976 octets, offset=488, MF=1, Total Length=996
Fragment 6 : 120 octets, offset=610, MF=0, Total Length=140

Verification : 5*976 + 120 = 5000
```

---

## Tableau de reference rapide

| CIDR | Masque | Pas | Hotes | Nb sous-reseaux dans /24 |
|------|--------|-----|-------|--------------------------|
| /24 | 255.255.255.0 | 256 | 254 | 1 |
| /25 | 255.255.255.128 | 128 | 126 | 2 |
| /26 | 255.255.255.192 | 64 | 62 | 4 |
| /27 | 255.255.255.224 | 32 | 30 | 8 |
| /28 | 255.255.255.240 | 16 | 14 | 16 |
| /29 | 255.255.255.248 | 8 | 6 | 32 |
| /30 | 255.255.255.252 | 4 | 2 | 64 |
