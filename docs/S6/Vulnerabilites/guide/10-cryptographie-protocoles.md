---
title: "Chapitre 10 -- Cryptographie et protocoles de securite"
sidebar_position: 10
---

# Chapitre 10 -- Cryptographie et protocoles de securite

> Sources : C1-annotated.pdf, intro.pdf (Barbara Fila)
> Objectif : maitriser les notations, comprendre les protocoles et leurs proprietes

---

## 10.1 Terminologie

| Francais | Anglais | Definition |
|----------|---------|-----------|
| Texte chiffre | Ciphertext | Message rendu illisible |
| Texte clair | Plaintext | Message original |
| Chiffrer | Encrypt | Rendre illisible avec une cle |
| Dechiffrer | Decrypt | Retrouver le clair avec la cle |

**Attention en francais :**
- On dit **chiffrer**, PAS "crypter"
- **Decrypter** = retrouver le clair SANS la cle (casser le chiffrement)
- **Dechiffrer** = retrouver le clair AVEC la cle

---

## 10.2 Notations du cours

### Chiffrement asymetrique

```
pk(i)         Cle publique de i (connue de tous)
sk(i)         Cle privee de i (connue de i seul)

{m}pk(i)      Chiffrement pour i : seul i peut dechiffrer (avec sk(i))
{m}sk(i)      Signature de i : tout le monde peut verifier (avec pk(i))

dec(enc(m, pk(i)), sk(i)) = m
```

### Chiffrement symetrique

```
k(i,r)        Cle partagee entre i et r
{m}k          Chiffrement symetrique de m avec k

dec(enc(m, k), k) = m
```

### Hachage et nonce

```
h(m)          Hachage de m (fonction a sens unique)
nonce n       Nombre utilise une seule fois
```

---

## 10.3 Hypothese de cryptographie parfaite

> Sans connaitre la cle de dechiffrement, il est impossible de retrouver le message chiffre. Sans connaitre le message, il est impossible de retrouver le message a partir de son hash.

### Proprietes d'une fonction de hachage

| Propriete | Definition |
|-----------|-----------|
| **Resistance a la pre-image** | h(m) donne, difficile de trouver m |
| **Resistance 2nde pre-image** | m donne, difficile de trouver m' tel que h(m) = h(m') |
| **Resistance aux collisions** | Difficile de trouver m et m' distincts tels que h(m) = h(m') |

---

## 10.4 Inference de messages

### Regles de deduction

| Ce qu'on sait | Ce qu'on deduit | Nom |
|--------------|----------------|-----|
| m | m | Identite |
| m1, m2 | (m1, m2) | Paire |
| m, k | {m}k | Chiffrement |
| (m1, m2) | m1 et m2 | Decomposition |
| {m}k, k^(-1) | m | Dechiffrement |

**Cle inverse :**
- Symetrique : `k^(-1) = k`
- Asymetrique : `pk(i)^(-1) = sk(i)` et `sk(i)^(-1) = pk(i)`

### Exemples

- Si on connait `{m}pk(b)` et `sk(b)` --> on peut deduire `m`
- Si on connait `pk(b)` et `m` --> on peut creer `{m}pk(b)`
- Si on connait seulement `{m}pk(b)` et `pk(b)` --> on NE PEUT PAS deduire `m`

---

## 10.5 Principe de Kerckhoffs

> La securite repose sur le secret de la **cle**, pas sur le secret de l'algorithme.
> **Pas de securite par l'obscurite.**

---

## 10.6 Protocoles de communication

### Message Sequence Charts (MSC)

```
Connaissance initiale      Connaissance initiale
de i                       de r
     |                          |
     i                          r
     |                          |
     |       message 1          |
     |------------------------->|
     |       message 2          |
     |<-------------------------|
     |                          |
   [claim]                   [claim]
```

Conventions :
- Axes verticaux = **roles** du protocole
- Connaissances initiales au-dessus des noms
- Fleches = messages
- [claim] = propriete de securite verifiee

---

## 10.7 Secret (Secrecy)

### Definition

> Le secret d'un message est satisfait pour un role r si, chaque fois qu'un agent honnete executant r communique avec des agents honnetes, l'adversaire ne peut pas deduire le message.

### Secret valide (chiffrement asymetrique, point de vue de i)

```
     pk(r)                    sk(r), pk(r)
       i                          r
       |     {i, n}pk(r)          |
       |------------------------->|
     [secret n : VALIDE]
```
Seul r (avec sk(r)) peut dechiffrer. Si r est honnete, n reste secret.

### Secret invalide (point de vue de r)

```
     pk(r)                    sk(r), pk(r)
       i                          r
       |     {i, n}pk(r)          |
       |------------------------->|
                             [secret n : INVALIDE]
```
N'importe qui connait pk(r) et peut chiffrer. Le n que r recoit pourrait venir de l'attaquant.

### Correction avec cle symetrique

```
     k(i,r)                   k(i,r)
       i                          r
       |     {i, n}k(i,r)        |
       |------------------------->|
     [secret n : VALIDE]    [secret n : VALIDE]
```
Seuls i et r connaissent k(i,r). Secret valide pour les deux.

---

## 10.8 Protocole Challenge-Response

```
     pk(p)                    pk(p), sk(p)
       r                          p
       |   nonce n                |
       |       n                  |
       |------------------------->|
       |     {n}sk(p)             |
       |<-------------------------|
     [auth p]
```

1. Le radar genere un nonce n et l'envoie a l'avion p
2. L'avion signe n avec sk(p) et renvoie {n}sk(p)
3. Le radar verifie avec pk(p)
4. Si OK, p est authentifie

---

## 10.9 Methode de resolution (DS)

```
1. Identifier les connaissances de chaque role
2. Identifier les connaissances de l'attaquant (Dolev-Yao)
3. Pour chaque message :
   - Qui peut le CREER ? (pas seulement l'emetteur prevu)
   - Qui peut le LIRE ? (pas seulement le destinataire prevu)
4. Verifier si la propriete de securite tient
5. Si non, decrire l'attaque avec un MSC
```

---

## CHEAT SHEET -- Cryptographie et protocoles

```
NOTATIONS :
  pk(i) = cle publique    sk(i) = cle privee
  {m}pk(i) = chiffrement   {m}sk(i) = signature
  k = cle symetrique       h(m) = hash
  nonce n = nombre unique

REGLES :
  {m}pk(i) + sk(i) --> m   (dechiffrement)
  {m}k + k --> m            (dechiffrement sym)
  pk(i) est PUBLIC --> n'importe qui peut chiffrer pour i
  sk(i) est PRIVE  --> seul i peut signer/dechiffrer

SECRET :
  Valide pour i si l'adversaire ne peut PAS deduire le message
  Asym : valide pour l'emetteur, PAS TOUJOURS pour le receveur
  Sym  : valide pour les deux

KERCKHOFFS : securite = secret de la CLE, pas de l'algorithme

PIEGES DS :
  - {m}pk(i) = chiffrement POUR i / {m}sk(i) = signature DE i
  - Chiffrer assure confidentialite, PAS integrite
  - pk(i) est publique : l'emetteur n'est PAS authentifie
  - "Secret pour i" =/= "secret pour r"
```
