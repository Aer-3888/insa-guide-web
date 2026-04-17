---
title: "Exercices -- Algorithme CKY et PCFG : Traces completes"
sidebar_position: 2
---

# Exercices -- Algorithme CKY et PCFG : Traces completes

---

## Exercice 1 : CKY simple -- "le chat mange la souris"

### Enonce

Grammaire en CNF :
```
S  --> NP VP
NP --> Det N
NP --> NP PP
VP --> V NP
VP --> V PP
PP --> P NP
Det --> "le" | "la"
N  --> "chat" | "souris" | "jardin"
V  --> "mange" | "dort"
P  --> "dans"
```

Phrase : "le chat mange la souris"

Construire la table CKY et verifier si la phrase est acceptee.

### Rappel : algorithme CKY

```
CKY travaille bottom-up, de la diagonale vers le coin superieur :

1. Remplir la diagonale : pour chaque mot, trouver les regles A --> mot
2. Pour chaque longueur l de 2 a n :
     Pour chaque debut i :
       Pour chaque coupure k :
         Si A --> B C et B in table[i,k] et C in table[k+1, i+l-1] :
           Ajouter A a table[i, i+l-1]
3. La phrase est acceptee si S in table[1, n]
```

### Solution pas a pas

**Etape 1 : Remplir la diagonale (longueur 1)**

```
Position :   1       2        3         4        5
Mot :       "le"    "chat"   "mange"   "la"     "souris"

table[1,1] = {Det}      (regle Det --> "le")
table[2,2] = {N}        (regle N --> "chat")
table[3,3] = {V}        (regle V --> "mange")
table[4,4] = {Det}      (regle Det --> "la")
table[5,5] = {N}        (regle N --> "souris")
```

**Etape 2 : Longueur 2**

table[1,2] : mots "le chat", coupure k=1
```
  table[1,1] x table[2,2] = {Det} x {N}
  Regle NP --> Det N ? OUI
  table[1,2] = {NP}
```

table[2,3] : mots "chat mange", coupure k=2
```
  table[2,2] x table[3,3] = {N} x {V}
  Existe-t-il une regle A --> N V ? NON
  table[2,3] = {}
```

table[3,4] : mots "mange la", coupure k=3
```
  table[3,3] x table[4,4] = {V} x {Det}
  Existe-t-il une regle A --> V Det ? NON
  table[3,4] = {}
```

table[4,5] : mots "la souris", coupure k=4
```
  table[4,4] x table[5,5] = {Det} x {N}
  Regle NP --> Det N ? OUI
  table[4,5] = {NP}
```

**Etape 3 : Longueur 3**

table[1,3] : mots "le chat mange", coupures k=1 et k=2
```
  k=1 : table[1,1] x table[2,3] = {Det} x {}  --> rien
  k=2 : table[1,2] x table[3,3] = {NP} x {V}  --> existe A --> NP V ? NON
  table[1,3] = {}
```

table[2,4] : mots "chat mange la", coupures k=2 et k=3
```
  k=2 : table[2,2] x table[3,4] = {N} x {}    --> rien
  k=3 : table[2,3] x table[4,4] = {} x {Det}  --> rien
  table[2,4] = {}
```

table[3,5] : mots "mange la souris", coupures k=3 et k=4
```
  k=3 : table[3,3] x table[4,5] = {V} x {NP}  --> VP --> V NP ? OUI
  k=4 : table[3,4] x table[5,5] = {} x {N}    --> rien
  table[3,5] = {VP}
```

**Etape 4 : Longueur 4**

table[1,4] : mots "le chat mange la", coupures k=1, k=2, k=3
```
  k=1 : table[1,1] x table[2,4] = {Det} x {}    --> rien
  k=2 : table[1,2] x table[3,4] = {NP} x {}     --> rien
  k=3 : table[1,3] x table[4,4] = {} x {Det}    --> rien
  table[1,4] = {}
```

table[2,5] : mots "chat mange la souris", coupures k=2, k=3, k=4
```
  k=2 : table[2,2] x table[3,5] = {N} x {VP}    --> existe A --> N VP ? NON
  k=3 : table[2,3] x table[4,5] = {} x {NP}     --> rien
  k=4 : table[2,4] x table[5,5] = {} x {N}      --> rien
  table[2,5] = {}
```

**Etape 5 : Longueur 5 (phrase complete)**

table[1,5] : mots "le chat mange la souris", coupures k=1, k=2, k=3, k=4
```
  k=1 : table[1,1] x table[2,5] = {Det} x {}    --> rien
  k=2 : table[1,2] x table[3,5] = {NP} x {VP}   --> S --> NP VP ? OUI
  k=3 : table[1,3] x table[4,5] = {} x {NP}     --> rien
  k=4 : table[1,4] x table[5,5] = {} x {N}      --> rien
  table[1,5] = {S}
```

### Table CKY complete

```
       col 1       col 2       col 3       col 4       col 5
       "le"        "chat"      "mange"     "la"        "souris"

[1,5]  {S}
[1,4]  {}          [2,5] {}
[1,3]  {}          [2,4] {}    [3,5] {VP}
[1,2]  {NP}        [2,3] {}    [3,4] {}    [4,5] {NP}
[1,1]  {Det}       [2,2] {N}   [3,3] {V}   [4,4] {Det} [5,5] {N}
```

**S in table[1,5] --> Phrase ACCEPTEE.**

### Arbre d'analyse derive

```
          S [1,5]
         / \
   NP [1,2]  VP [3,5]
      / \      / \
 Det   N    V    NP [4,5]
  |    |    |    / \
 le   chat mange Det  N
                  |    |
                 la  souris
```

---

## Exercice 2 : CKY avec ambiguite PP -- "le chat mange dans le jardin"

### Enonce

Meme grammaire que l'exercice 1. Phrase : "le chat mange dans le jardin"

### Solution

**Diagonale (longueur 1)** :
```
table[1,1] = {Det}    ("le")
table[2,2] = {N}      ("chat")
table[3,3] = {V}      ("mange")
table[4,4] = {P}      ("dans")
table[5,5] = {Det}    ("le")
table[6,6] = {N}      ("jardin")
```

**Longueur 2** :
```
table[1,2] = {NP}     (Det N --> NP)
table[2,3] = {}       (N V --> rien)
table[3,4] = {}       (V P --> rien)
table[4,5] = {}       (P Det --> rien)
table[5,6] = {NP}     (Det N --> NP)
```

**Longueur 3** :
```
table[1,3] = {}
  k=1: Det x {} = rien
  k=2: NP x V = rien (pas de regle NP V --> A)

table[2,4] = {}
  k=2: N x {} = rien
  k=3: {} x P = rien

table[3,5] = {}
  k=3: V x {} = rien
  k=4: {} x Det = rien

table[4,6] = {PP}
  k=4: P x NP[5,6] = PP --> P NP ? OUI
  k=5: {} x N = rien
```

**Longueur 4** :
```
table[1,4] = {}
  k=1: Det x {} = rien
  k=2: NP x {} = rien
  k=3: {} x P = rien

table[2,5] = {}
  k=2: N x {} = rien
  k=3: {} x {} = rien
  k=4: {} x Det = rien

table[3,6] = {VP}
  k=3: V[3,3] x PP[4,6] = VP --> V PP ? OUI
  k=4: {} x NP[5,6] = rien
  k=5: {} x N = rien
```

**Longueur 5** :
```
table[1,5] = {}
  k=1: Det x {} = rien
  k=2: NP x {} = rien
  k=3: {} x {} = rien
  k=4: {} x Det = rien

table[2,6] = {}
  k=2: N x VP[3,6] = rien
  k=3: {} x PP[4,6] = rien
  k=4: {} x NP[5,6] = rien
  k=5: {} x N = rien
```

**Longueur 6 (phrase complete)** :
```
table[1,6] :
  k=1: Det x {} = rien
  k=2: NP[1,2] x VP[3,6] = S --> NP VP ? OUI
  k=3: {} x PP[4,6] = rien
  k=4: {} x NP[5,6] = rien
  k=5: {} x N = rien
  table[1,6] = {S}
```

**Phrase ACCEPTEE.** Arbre unique : le chat [mange dans le jardin].

### Arbre d'analyse

```
            S [1,6]
           / \
     NP [1,2]  VP [3,6]
        / \      / \
   Det   N    V    PP [4,6]
    |    |    |    / \
   le  chat mange P   NP [5,6]
                  |   / \
                dans Det  N
                      |   |
                     le jardin
```

---

## Exercice 3 : PCFG -- Calcul de probabilites d'arbres

### Enonce

Grammaire PCFG :
```
S  --> NP VP       [1.0]
VP --> V NP        [0.6]
VP --> V NP PP     [0.4]     (ATTENTION : pas en CNF, binariser d'abord)
NP --> Det N       [0.7]
NP --> NP PP       [0.3]
PP --> P NP        [1.0]
```

Lexique :
```
Det --> "le" [0.5] | "la" [0.5]
N --> "homme" [0.3] | "telescope" [0.3] | "parc" [0.4]
V --> "regarde" [1.0]
P --> "avec" [0.5] | "dans" [0.5]
```

Phrase : "le homme regarde la femme avec le telescope"
(On suppose N --> "femme" [0.3] dans le lexique.)

### Rappel : P(arbre) = PRODUIT des P(regles)

### Solution

**Arbre 1 : VP --> V NP PP** (il regarde [la femme] [avec le telescope])

```
S --> NP VP                            P = 1.0
  NP --> Det N                         P = 0.7
    Det --> "le"                        P = 0.5
    N --> "homme"                       P = 0.3
  VP --> V NP PP                       P = 0.4
    V --> "regarde"                     P = 1.0
    NP --> Det N                       P = 0.7
      Det --> "la"                      P = 0.5
      N --> "femme"                     P = 0.3
    PP --> P NP                        P = 1.0
      P --> "avec"                      P = 0.5
      NP --> Det N                     P = 0.7
        Det --> "le"                    P = 0.5
        N --> "telescope"               P = 0.3
```

```
P(arbre1) = 1.0 * 0.7 * 0.5 * 0.3
          * 0.4 * 1.0
          * 0.7 * 0.5 * 0.3
          * 1.0 * 0.5
          * 0.7 * 0.5 * 0.3

Regroupons :
= 1.0 * (0.7)^3 * (0.5)^4 * (0.3)^3 * 0.4 * 1.0 * 1.0
= 1.0 * 0.343 * 0.0625 * 0.027 * 0.4
= 0.343 * 0.0625 = 0.021438
  0.021438 * 0.027 = 5.788e-4
  5.788e-4 * 0.4 = 2.315e-4

P(arbre1) = 2.315 * 10^{-4}
```

**Arbre 2 : NP --> NP PP** (il regarde [la femme avec le telescope])

```
S --> NP VP                            P = 1.0
  NP --> Det N                         P = 0.7
    Det --> "le"                        P = 0.5
    N --> "homme"                       P = 0.3
  VP --> V NP                          P = 0.6
    V --> "regarde"                     P = 1.0
    NP --> NP PP                       P = 0.3
      NP --> Det N                     P = 0.7
        Det --> "la"                    P = 0.5
        N --> "femme"                   P = 0.3
      PP --> P NP                      P = 1.0
        P --> "avec"                    P = 0.5
        NP --> Det N                   P = 0.7
          Det --> "le"                  P = 0.5
          N --> "telescope"             P = 0.3
```

```
P(arbre2) = 1.0 * 0.7 * 0.5 * 0.3
          * 0.6 * 1.0
          * 0.3
          * 0.7 * 0.5 * 0.3
          * 1.0 * 0.5
          * 0.7 * 0.5 * 0.3

= 1.0 * (0.7)^3 * (0.5)^4 * (0.3)^3 * 0.6 * 0.3
= 0.343 * 0.0625 * 0.027 * 0.18
= 0.021438 * 0.027 = 5.788e-4
  5.788e-4 * 0.18 = 1.042e-4

P(arbre2) = 1.042 * 10^{-4}
```

### Comparaison

```
P(arbre1) = 2.315e-4  (VP --> V NP PP)
P(arbre2) = 1.042e-4  (NP --> NP PP)

Rapport : 2.315e-4 / 1.042e-4 = 2.22

Arbre 1 est 2.2 fois plus probable que l'arbre 2.
```

**Interpretation** : la PCFG prefere l'attachement du PP au VP (le PP modifie le verbe, pas le NP). Cela signifie "il regarde la femme en utilisant le telescope" plutot que "il regarde [la femme qui a un telescope]".

**Difference cle entre les deux arbres** :
```
Arbre 1 : VP --> V NP PP  --> P(VP) = 0.4
Arbre 2 : VP --> V NP     --> P(VP) = 0.6  MAIS  NP --> NP PP  --> P(NP) = 0.3

Arbre 1 : 0.4 * 0.7 (NP simple) = 0.28
Arbre 2 : 0.6 * 0.3 (NP complexe) = 0.18

0.28 > 0.18 --> arbre 1 plus probable
```

---

## Exercice 4 : Conversion en CNF

### Enonce

Convertir cette grammaire en forme normale de Chomsky :
```
S  --> NP VP
VP --> V NP PP
VP --> V NP
NP --> Det N
PP --> Prep NP
```

### Solution

**Regles deja en CNF** :
```
S  --> NP VP       (A --> B C)   OK
VP --> V NP        (A --> B C)   OK
NP --> Det N       (A --> B C)   OK
PP --> Prep NP     (A --> B C)   OK
```

**Regle a binariser** :
```
VP --> V NP PP     (A --> B C D)  PAS EN CNF (3 symboles a droite)
```

**Binarisation** : introduire un non-terminal intermediaire
```
VP  --> V VP'      (A --> B C)   OK
VP' --> NP PP      (A --> B C)   OK
```

**Grammaire finale en CNF** :
```
S   --> NP VP
VP  --> V VP'
VP' --> NP PP
VP  --> V NP
NP  --> Det N
PP  --> Prep NP
```

**Verification** : toutes les regles sont soit A --> B C (deux non-terminaux) soit A --> a (un terminal).

### Regles de conversion CNF (rappel general)

| Cas | Probleme | Solution |
|-----|---------|---------|
| A --> B C D | Plus de 2 symboles a droite | Binariser : A --> B X, X --> C D |
| A --> a B | Terminal melange avec non-terminal | Introduire A' --> a, puis A --> A' B |
| A --> B | Production unitaire | Eliminer en substituant |
| A --> epsilon | Production vide | Eliminer (sauf si S --> epsilon) |

---

## Exercice 5 : CKY probabiliste -- "le chat mange la souris"

### Enonce

PCFG :
```
S  --> NP VP       [1.0]
NP --> Det N       [1.0]
VP --> V NP        [1.0]
Det --> "le" [0.6] | "la" [0.4]
N --> "chat" [0.5] | "souris" [0.5]
V --> "mange" [1.0]
```

Calculer P(arbre | "le chat mange la souris").

### Solution

**Arbre unique** (pas d'ambiguite dans cette grammaire) :

```
S --> NP VP                            P = 1.0
  NP --> Det N                         P = 1.0
    Det --> "le"                        P = 0.6
    N --> "chat"                        P = 0.5
  VP --> V NP                          P = 1.0
    V --> "mange"                       P = 1.0
    NP --> Det N                       P = 1.0
      Det --> "la"                      P = 0.4
      N --> "souris"                    P = 0.5

P(arbre) = 1.0 * 1.0 * 0.6 * 0.5 * 1.0 * 1.0 * 1.0 * 0.4 * 0.5
         = 0.6 * 0.5 * 0.4 * 0.5
         = 0.3 * 0.2
         = 0.06
```

**Verification** : les regles syntaxiques ont P=1.0 (pas d'ambiguite structurelle), donc la probabilite est entierement determinee par les choix lexicaux.

---

## Exercice 6 : Ambiguite d'attachement PP (question type DS exam 2022)

### Enonce

PCFG :
```
S  --> VP           [1.0]
VP --> V NP         [0.7]
VP --> V NP PP      [0.3]        (a binariser pour CKY)
NP --> NP PP        [0.3]
NP --> Det N        [0.7]
PP --> Prep N       [1.0]
```

Terminaux tous avec P = 0.1 :
```
Det --> "the" [0.1]    V --> "block" [0.1]
N --> "door" [0.1]     N --> "stones" [0.1]
Prep --> "with" [0.1]
```

Phrase : "block the door with stones"

### Solution

**Arbre 1 : VP --> V NP PP** (bloquer la porte avec des pierres)
```
S --> VP                                P = 1.0
  VP --> V NP PP                        P = 0.3
    V --> "block"                        P = 0.1
    NP --> Det N                        P = 0.7
      Det --> "the"                      P = 0.1
      N --> "door"                       P = 0.1
    PP --> Prep N                       P = 1.0
      Prep --> "with"                    P = 0.1
      N --> "stones"                     P = 0.1

P(arbre1) = 1.0 * 0.3 * 0.1 * (0.7 * 0.1 * 0.1) * (1.0 * 0.1 * 0.1)
          = 0.3 * 0.1 * 0.007 * 0.01
          = 0.3 * 0.1 * 7e-5
          = 2.1e-6
```

**Arbre 2 : NP --> NP PP** (la porte avec des pierres)
```
S --> VP                                P = 1.0
  VP --> V NP                           P = 0.7
    V --> "block"                        P = 0.1
    NP --> NP PP                        P = 0.3
      NP --> Det N                      P = 0.7
        Det --> "the"                    P = 0.1
        N --> "door"                     P = 0.1
      PP --> Prep N                     P = 1.0
        Prep --> "with"                  P = 0.1
        N --> "stones"                   P = 0.1

P(arbre2) = 1.0 * 0.7 * 0.1 * 0.3 * (0.7 * 0.1 * 0.1) * (1.0 * 0.1 * 0.1)
          = 0.7 * 0.1 * 0.3 * 0.007 * 0.01
          = 0.7 * 0.1 * 0.3 * 7e-5
          = 1.47e-6
```

**Comparaison** :
```
P(arbre1) = 2.10e-6   (VP --> V NP PP)
P(arbre2) = 1.47e-6   (VP --> V NP, NP --> NP PP)

Ratio : 2.10e-6 / 1.47e-6 = 1.43

Arbre 1 est 1.43 fois plus probable.
```

**Facteur discriminant** :

La difference entre les deux arbres porte sur la structure du VP et du NP complement :

```
Arbre 1 (VP --> V NP PP) :
  VP utilise la regle VP --> V NP PP avec P(VP) = 0.3
  Le NP complement est simple : NP --> Det N avec P(NP) = 0.7
  Produit des facteurs structurels distincts : 0.3 * 0.7 = 0.21

Arbre 2 (VP --> V NP avec NP --> NP PP) :
  VP utilise la regle VP --> V NP avec P(VP) = 0.7
  Le NP objet est complexe : NP --> NP PP avec P(NP) = 0.3
    A l'interieur, le sous-NP est NP --> Det N avec P(NP) = 0.7
  Produit des facteurs structurels distincts : 0.7 * 0.3 * 0.7 = 0.147
```

L'arbre 2 fait intervenir un NP supplementaire (NP --> Det N pour "the door" a l'interieur du NP complexe), ce qui ajoute un facteur 0.7 en plus. Cela rend le produit plus petit (0.147 < 0.21), expliquant pourquoi l'arbre 1 est plus probable malgre une regle VP moins probable (0.3 vs 0.7).

---

## Exercice 7 : Interet des PCFG (question DS)

### Enonce

"Quel est l'interet des PCFG par rapport aux CFG ?"

### Reponse type complete

**1. Desambiguation** :
Les CFG acceptent ou rejettent une phrase, mais ne choisissent pas entre plusieurs arbres valides. Les PCFG attribuent une probabilite a chaque arbre, permettant de selectionner l'arbre le plus probable.

**2. Classement** :
Pour une phrase ambigue (ex: "I saw the man with the telescope"), la PCFG classe les analyses par probabilite decroissante.

**3. Calcul** :
```
P(arbre) = PRODUIT P(regle_i)

Meilleur arbre = argmax_{arbre} P(arbre)
```

**4. Apprentissage** :
Les probabilites sont estimees a partir de corpus annotes (treebanks) :
```
P(NP --> Det N) = C(NP --> Det N) / C(NP --> ...)
```
C'est une estimation par maximum de vraisemblance (ML).

**5. Limites** (a mentionner aussi) :
- Invariance positionnelle : un NP en position sujet a les memes probabilites qu'en position objet
- Les mots eux-memes ne sont pas pris en compte (seules les POS comptent)
- Solution : grammaires lexicalisees

---

## Resume des formules essentielles

```
CKY :
  Complexite : O(n^3 * |R|^2) pour n mots et |R| regles
  CNF obligatoire : A --> B C  ou  A --> a
  Binarisation : A --> B C D  devient  A --> B X, X --> C D

PCFG :
  P(arbre) = PRODUIT_{regle utilisee} P(regle)
  Meilleur arbre = argmax P(arbre)
  Estimation ML : P(A --> alpha) = C(A --> alpha) / SUM_beta C(A --> beta)
```

---

## Pieges courants en DS

1. **Oublier la CNF** : CKY necessite que TOUTES les regles soient en forme A --> B C ou A --> a
2. **PCFG = PRODUIT** : P(arbre) est le PRODUIT des probabilites, pas la somme
3. **Oublier les regles lexicales** : dans le calcul de P(arbre), inclure P(Det-->"le"), P(N-->"chat"), etc.
4. **Table CKY** : attention a la convention d'indexation (i,j) -- verifier si c'est (debut, fin) ou (debut, longueur)
5. **Binarisation** : ne pas oublier de binariser les regles longues AVANT d'appliquer CKY
6. **Ambiguite PP** : c'est LE sujet classique en DS -- "I saw the man with the telescope"
7. **CKY bottom-up** : on part des mots (diagonale) et on remonte vers S (coin superieur)
8. **Cellule vide = pas de constituant** : si table[i,j] = {}, aucun constituant ne couvre les mots i a j
