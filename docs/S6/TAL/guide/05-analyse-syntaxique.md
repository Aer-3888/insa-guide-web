---
title: "Chapitre 5 -- Analyse Syntaxique (Parsing)"
sidebar_position: 5
---

# Chapitre 5 -- Analyse Syntaxique (Parsing)

## 5.1 Deux types d'analyse

```
  Analyse en CONSTITUANTS              Analyse en DEPENDANCES
  (arbres syntagmatiques)              (relations binaires)

       S                               regarde
      / \                             /    |    \
    NP    VP                       Paul  chien    noir
   / \   / \                              |
  Le chat mange                           le
           |
          NP
         / \
        la souris
```

## 5.2 Analyse en constituants

### Constituants (syntagmes)

| Type | Nom | Exemple |
|------|-----|---------|
| NP | Syntagme nominal | "le gros chat noir" |
| VP | Syntagme verbal | "mange la souris" |
| PP | Syntagme prepositionnel | "dans le jardin" |
| AP | Syntagme adjectival | "tres grand" |

### Grammaires hors-contexte (CFG)

G = (V_N, V_T, R, S) :
- V_N = non-terminaux {S, NP, VP, PP, Det, N, V, Prep...}
- V_T = terminaux {le, chat, mange...}
- R = regles de production
- S = symbole de depart

Exemple de grammaire :
```
S  --> NP VP
NP --> Det N | Det N PP | Pro
VP --> V | V NP | V NP PP
PP --> Prep NP
```

### Ambiguite syntaxique -- SUJET CLASSIQUE EN DS

"I saw the man with the telescope" (J'ai vu l'homme avec le telescope) admet 2 arbres :

**Arbre 1** : VP --> V NP PP (j'ai vu en utilisant le telescope)
```
       VP
      / | \
     V  NP  PP
```

**Arbre 2** : NP --> NP PP (l'homme qui a le telescope)
```
       VP
      / \
     V   NP
         / \
       NP   PP
```

## 5.3 Algorithme CKY (Cocke-Kasami-Younger)

### Prerequis : Forme Normale de Chomsky (CNF)

Toute regle doit etre :
- A --> B C (deux non-terminaux)
- A --> a (un seul terminal)

Transformations necessaires :
1. Eliminer les regles epsilon
2. Gerer les symboles mixtes
3. Eliminer les productions unitaires (A --> B)
4. Binariser les regles longues (A --> B C D --> A --> B X, X --> C D)

### Algorithme

```
Pour chaque position j (de 1 a n) :
    Pour chaque regle A --> w_j :
        table[j][j] += {A}

Pour chaque longueur l (de 2 a n) :
    Pour chaque debut i (de 1 a n-l+1) :
        Pour chaque coupure k (de i a i+l-1) :
            Pour chaque regle A --> B C :
                Si B in table[i][k] et C in table[k+1][i+l-1] :
                    table[i][i+l-1] += {A}

Si S in table[1][n] : phrase acceptee
```

**Complexite** : O(n^3 * |R|^2)
**Strategie** : bottom-up (mots --> S)

### Trace CKY -- Exemple

Grammaire en CNF :
```
S  --> NP VP      NP --> Det N      VP --> V NP
Det --> "le" | "la"
N  --> "chat" | "souris"
V  --> "mange"
```

Phrase : "le chat mange la souris"

```
Table (i = ligne, j = colonne) :

         le       chat     mange     la      souris
  [1,1]  {Det}
  [2,2]           {N}
  [3,3]                    {V}
  [4,4]                              {Det}
  [5,5]                                      {N}

  [1,2]  {NP}     (Det + N, regle NP --> Det N)
  [4,5]                              {NP}    (Det + N)

  [3,5]                    {VP}              (V + NP, regle VP --> V NP)
                           (k=3: V in [3,3], NP in [4,5])

  [1,5]  {S}                                 (NP + VP, regle S --> NP VP)
          (k=2: NP in [1,2], VP in [3,5])
```

S in table[1][5] --> phrase acceptee.

## 5.4 Grammaires probabilistes (PCFG)

### Motivation

Quand plusieurs arbres sont possibles, comment choisir ? On ajoute des probabilites.

### Definition

G = (V_N, V_T, R, S, P) avec la contrainte :
```
Pour chaque X : SUM P(X --> gamma) = 1
```

### Probabilite d'un arbre

```
P(arbre) = PRODUIT P(regle_i)
```

**PIEGE DS** : c'est un PRODUIT, pas une somme.

### Exemple type DS -- PCFG

Grammaire :
```
S  --> VP         [1.0]
VP --> V NP       [0.7]
VP --> V NP PP    [0.3]
NP --> NP PP      [0.3]
NP --> Det N      [0.7]
PP --> Prep N     [1.0]
```

Terminaux tous avec P = 0.1.

Phrase : "block the door with stones"

**Arbre 1** (VP --> V NP PP, NP --> Det N) :
```
P = P(S-->VP) * P(VP-->V NP PP) * P(V-->block) * P(NP-->Det N)
    * P(Det-->the) * P(N-->door) * P(PP-->Prep N) * P(Prep-->with) * P(N-->stones)
  = 1.0 * 0.3 * 0.1 * 0.7 * 0.1 * 0.1 * 1.0 * 0.1 * 0.1
  = 1.0 * 0.3 * 0.7 * 1.0 * 0.1^5
  = 0.21 * 10^{-5} = 2.1 * 10^{-6}
```

**Arbre 2** (VP --> V NP, NP --> NP PP) :
```
P = P(S-->VP) * P(VP-->V NP) * P(V-->block) * P(NP-->NP PP)
    * P(NP-->Det N) * P(Det-->the) * P(N-->door) * P(PP-->Prep N)
    * P(Prep-->with) * P(N-->stones)
  = 1.0 * 0.7 * 0.1 * 0.3 * 0.7 * 0.1 * 0.1 * 1.0 * 0.1 * 0.1
  = 1.0 * 0.7 * 0.3 * 0.7 * 1.0 * 0.1^5
  = 0.147 * 10^{-5} = 1.47 * 10^{-6}
```

Arbre 1 (P = 2.1e-6) > Arbre 2 (P = 1.47e-6) --> **Arbre 1 est plus probable**.

### Interet des PCFG (question classique DS)

> "Quel est l'interet des PCFG par rapport aux CFG ?"

Les probabilites permettent de **desambiguiser** les phrases ayant plusieurs arbres valides en choisissant l'arbre le plus probable. Elles permettent aussi de classer les analyses.

## 5.5 Analyse en dependances

### Principe

Relations **binaires dirigees** d'une **tete** (gouverneur) vers un **dependant**.

```
regarde --nsubj--> Paul
regarde --obj----> chien
chien   --det----> le
chien   --amod---> noir
```

### Types de relations principales

| Categorie | Exemples |
|-----------|----------|
| Clausales | nsubj (sujet), obj (objet), iobj (objet indirect) |
| Modification | amod (adjectif), advmod (adverbe) |
| Fonctionnelles | det (determinant), case (preposition), cc (conjonction) |

### Metriques d'evaluation

| Metrique | Signification |
|----------|---------------|
| **UAS** (Unlabeled Attachment Score) | Tete correcte (sans label) |
| **LAS** (Labeled Attachment Score) | Tete + relation correctes |

**UAS >= LAS toujours** (LAS est plus strict).

## 5.6 Parsing transition-based

### Composants

- **Pile** (sigma) : commence avec [ROOT]
- **Buffer** (beta) : commence avec [w_1, w_2, ..., w_n]
- **Arcs** (A) : commence vide

### Trois actions

| Action | Effet |
|--------|-------|
| **Shift (S)** | Deplacer le premier element du buffer vers la pile |
| **Left-Arc (G)** | Arc du sommet vers le second + retirer le second |
| **Right-Arc (D)** | Arc du second vers le sommet + retirer le sommet |

### Trace complete -- Exemple type DS (2023)

Phrase : "The lazy dog sleeps"
Arbre cible :
```
ROOT --> sleeps (root)
sleeps --> dog (nsubj)
dog --> The (det)
dog --> lazy (amod)
```

| Etape | Pile | Buffer | Action | Dependance |
|-------|------|--------|--------|-----------|
| 0 | [ROOT] | [The, lazy, dog, sleeps] | S | - |
| 1 | [ROOT, The] | [lazy, dog, sleeps] | S | - |
| 2 | [ROOT, The, lazy] | [dog, sleeps] | S | - |
| 3 | [ROOT, The, lazy, dog] | [sleeps] | G | dog --> lazy |
| 4 | [ROOT, The, dog] | [sleeps] | G | dog --> The |
| 5 | [ROOT, dog] | [sleeps] | S | - |
| 6 | [ROOT, dog, sleeps] | [] | G | sleeps --> dog |
| 7 | [ROOT, sleeps] | [] | D | ROOT --> sleeps |
| 8 | [ROOT] | [] | FIN | - |

**Explication pas a pas** :
- Etapes 0-2 : On empile The, lazy, dog (Shift)
- Etape 3 : dog est la tete de lazy (Left-Arc, arc dog-->lazy)
- Etape 4 : dog est la tete de The (Left-Arc, arc dog-->The)
- Etape 5 : On empile sleeps (Shift)
- Etape 6 : sleeps est la tete de dog (Left-Arc, arc sleeps-->dog)
- Etape 7 : ROOT est la tete de sleeps (Right-Arc, arc ROOT-->sleeps)

## 5.7 Segmentation en chunks (analyse partielle)

Les chunks sont des constituants **non-recursifs** (pas d'imbrication).

```
[NP Le vol AF210] [PP de] [NP Paris] [PP a] [NP New-York]
```

Annote avec le systeme IOB (= BIO) :
```
The    AF210   flight   from    Paris
B_NP   I_NP    I_NP     O      B_NP
```

---

## CHEAT SHEET -- Analyse Syntaxique

```
CFG : G = (V_N, V_T, R, S)
  Chomsky type 2 (un non-terminal a gauche)

CNF (Forme Normale de Chomsky) :
  A --> B C  ou  A --> a
  Necessaire pour CKY

CKY :
  Bottom-up, programmation dynamique
  Complexite : O(n^3 * |R|^2)
  Remplir table triangulaire

PCFG :
  P(arbre) = PRODUIT P(regle_i)   (PRODUIT, pas somme !)
  Interet : desambiguation

DEPENDANCES :
  Relations binaires tete --> dependant
  UAS = tete correcte, LAS = tete + label
  UAS >= LAS toujours

TRANSITION-BASED :
  Pile + Buffer + Arcs
  3 actions : Shift (S), Left-Arc (G), Right-Arc (D)
  Shift : buffer --> pile
  Left-Arc : arc sommet-->second, retirer second
  Right-Arc : arc second-->sommet, retirer sommet

PIEGES :
  - CKY necessite la CNF (pas toute CFG)
  - P(arbre PCFG) = PRODUIT, pas somme
  - UAS >= LAS (LAS plus strict)
  - Segmentation en chunks != analyse complete (pas recursif)
```
