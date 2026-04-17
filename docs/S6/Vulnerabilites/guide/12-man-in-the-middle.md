---
title: "Chapitre 12 -- Attaques Man-in-the-Middle"
sidebar_position: 12
---

# Chapitre 12 -- Attaques Man-in-the-Middle

> Source : intro_mim-annotated.pdf
> Objectif : comprendre les attaques MitM, le protocole NSPK, l'attaque de Lowe, et la correction NSPKL

---

## 12.1 Concept du Man-in-the-Middle

> Attaque ou l'adversaire intercepte et modifie les communications entre deux parties qui pensent communiquer directement.

### Analogie du cours : echecs par correspondance

```
Kasparov                Trump (MitM)                 Karpov
    |   e2-e4              |   e2-e4                    |
    |--------------------->|--------------------------->|
    |   d7-d5              |   d7-d5                    |
    |<---------------------|<---------------------------|
```

Trump relaie les coups sans savoir jouer. Point cle : l'attaquant MitM n'a pas besoin de casser la cryptographie.

---

## 12.2 Le protocole NSPK (Needham-Schroeder Public Key)

### Historique

- Propose en **1978** par Needham et Schroeder
- "Prouve" correct avec la logique BAN
- Utilise pendant **17 ans**
- Attaque decouverte par **Gavin Lowe en 1995/1996**

### Description

```
     pk(r), sk(i)               pk(i), sk(r)
          i                          r
          |  nonce n                 |
          |   {(n, i)}pk(r)          |   Message 1
          |------------------------->|
          |                          |  nonce m
          |   {(n, m)}pk(i)          |   Message 2
          |<-------------------------|
          |   {m}pk(r)               |   Message 3
          |------------------------->|
```

1. i envoie nonce n + identite, chiffre pour r
2. r repond avec n (preuve de reception) + nouveau nonce m, chiffre pour i
3. i renvoie m, chiffre pour r

---

## 12.3 L'attaque de Lowe

### Deroulement complet

```
     Bob                    Eve                      Alice
     (pense parler          (MitM)                   (pense parler
      a Eve)                                          a Bob)

          |  {(n, Bob)}pk(Eve)    |                        |
    (1)   |---------------------->|                        |
          |                       | {(n, Bob)}pk(Alice)    |
          |                  (1') |----------------------->|
          |                       |                        | nonce m
          |                       | {(n, m)}pk(Bob)        |
          |                  (2') |<-----------------------|
          | {(n, m)}pk(Bob)       |                        |
    (2)   |<----------------------|                        |
          | {m}pk(Eve)            |                        |
    (3)   |---------------------->|                        |
          |                       | {m}pk(Alice)           |
          |                  (3') |----------------------->|
```

### Pas a pas

1. Bob initie une session avec Eve (scenario normal)
2. Eve dechiffre (elle a sk(Eve)), obtient n, et ouvre une session avec Alice en se faisant passer pour Bob
3. Alice repond {(n, m)}pk(Bob) -- Eve ne peut PAS lire (chiffre pour Bob)
4. Eve relaie a Bob dans la session originale -- Bob dechiffre, trouve n et m
5. Bob repond {m}pk(Eve) -- Eve dechiffre et obtient m
6. Eve transmet {m}pk(Alice) -- Alice est convaincue de parler a Bob

**Consequence** : Alice pense communiquer avec Bob, mais Eve controle l'echange. Scenario bancaire : Eve s'authentifie aupres de la banque en se faisant passer pour le client.

---

## 12.4 La correction de Lowe : NSPKL

### Le probleme

Dans le message 2 `{(n, m)}pk(i)`, rien n'indique **qui** a genere m.

### La correction

Ajouter l'identite du repondeur r dans le message 2 :

```
     pk(r), sk(i)               pk(i), sk(r)
          i                          r
          |  nonce n                 |
          |   {(n, i)}pk(r)          |   Message 1
          |------------------------->|
          |                          |  nonce m
          |   {(n, m, r)}pk(i)       |   Message 2 (CORRIGE)
          |<-------------------------|
          |   {m}pk(r)               |   Message 3
          |------------------------->|
```

### Pourquoi ca marche

Dans l'attaque de Lowe :
- Eve relaie le message 2 d'Alice : `{(n, m, Alice)}pk(Bob)`
- Bob dechiffre et trouve `r = Alice` au lieu de `r = Eve`
- Bob detecte l'incoherence --> attaque echoue

### Verification

NSPKL satisfait : non-injective synchronization + secret de n et m. Verifie par l'outil **Scyther**.

---

## 12.5 Lecons fondamentales

```
FAUX : "Notre application est securisee car nous utilisons
        les algorithmes cryptographiques les plus recents."
  --> La crypto parfaite n'empeche pas les attaques sur les protocoles

FAUX : "Nos ingenieurs ont examine le protocole."
  --> NSPK a ete utilise 17 ans avant la decouverte de l'attaque

FAUX : "Nous avons trouve ce protocole dans la litterature."
  --> En 2008, Google a deploye un protocole avec une faille similaire
```

---

## 12.6 Scyther (verification automatique)

```
protocol auth-mim(r, p) {
    role r {
        fresh n: Nonce;
        send_1(r, p, n);
        recv_2(p, r, {n}sk(p));
        claim_3(r, Weakagree);
    }
    role p {
        var v: Nonce;
        recv_1(r, p, v);
        send_2(p, r, {v}sk(p));
    }
}
```

Scyther trouve automatiquement les attaques en quelques secondes.

---

## CHEAT SHEET -- Man-in-the-Middle

```
NSPK (vulnerable) :
  Msg 1 : {(n, i)}pk(r)
  Msg 2 : {(n, m)}pk(i)      <-- PAS d'identite de r
  Msg 3 : {m}pk(r)

NSPKL (corrige) :
  Msg 1 : {(n, i)}pk(r)
  Msg 2 : {(n, m, r)}pk(i)   <-- identite de r ajoutee
  Msg 3 : {m}pk(r)

ATTAQUE DE LOWE :
  Eve initie session parallele
  Eve relaie nonces entre Bob et Alice
  Alice croit parler a Bob (FAUX)
  Corrige en ajoutant r dans Msg 2

LECONS :
  La crypto parfaite ne suffit PAS
  17 ans d'utilisation sans detection
  Verification formelle indispensable (Scyther)

PIEGES DS :
  - Le chiffrement n'empeche PAS le MitM (Eve relaie sans lire)
  - L'attaquant peut initier des sessions (Dolev-Yao)
  - L'attaque utilise DEUX sessions paralleles
  - NSPK est vulnerable, NSPKL est corrige
  - Correction = UNE seule info ajoutee (identite de r)
```
