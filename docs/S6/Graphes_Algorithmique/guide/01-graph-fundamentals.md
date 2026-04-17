---
title: "Chapitre 01 -- Fondamentaux des graphes"
sidebar_position: 1
---

# Chapitre 01 -- Fondamentaux des graphes

> **Idee centrale :** Un graphe est un ensemble de points (sommets) relies par des liens (aretes ou arcs). C'est la structure mathematique qui modelise toute relation entre objets.

---

## 1. Graphe non oriente

### Definition formelle

Un graphe non oriente G = (S, A) ou :
- S = ensemble fini de sommets (vertices)
- A = ensemble de paires non ordonnees de sommets, appelees aretes (edges)

```
Exemple : G = ({A, B, C, D}, {{A,B}, {A,C}, {B,D}, {C,D}})

    A --- B
    |     |
    C --- D
```

Proprietes :
- Pas de direction : {A,B} = {B,A}
- Pas de boucle (graphe simple) : un sommet n'est pas relie a lui-meme
- Pas d'aretes multiples : entre deux sommets, au plus une arete

---

## 2. Graphe oriente (digraphe)

### Definition formelle

Un graphe oriente G = (S, A) ou :
- S = ensemble fini de sommets
- A = ensemble de couples ordonnes de sommets, appeles arcs

```
Exemple : G = ({A, B, C, D}, {(A,B), (A,C), (B,D), (C,D), (D,A)})

    A ---> B
    |      |
    v      v
    C ---> D
    ^      |
    +------+
    (D,A)
```

Difference cle : un arc (u,v) va de u vers v. (A,B) est different de (B,A).

---

## 3. Vocabulaire essentiel

| Terme | Definition |
|-------|-----------|
| Adjacents | Deux sommets relies par une arete/arc |
| Voisinage N(v) | Ensemble des sommets adjacents a v |
| Incidence | Une arete est incidente a un sommet si elle le touche |
| Sous-graphe | G' = (S', A') avec S' inclus dans S, A' inclus dans A, coherent |
| Sous-graphe induit | On choisit S', on garde TOUTES les aretes entre sommets de S' |

---

## 4. Degres

### Graphe non oriente : d(v)

Le degre d(v) = nombre d'aretes incidentes a v = nombre de voisins.

```
    A --- B
    |   / |
    C     D

d(A) = 2  (relie a B, C)
d(B) = 3  (relie a A, C, D)
d(C) = 2  (relie a A, B)
d(D) = 1  (relie a B)
```

### Graphe oriente : degre entrant / sortant

- d-(v) = degre entrant = nombre d'arcs arrivant a v
- d+(v) = degre sortant = nombre d'arcs partant de v
- d(v) = d-(v) + d+(v)

```
    A --> B --> C
    ^         |
    +---------+

d+(A) = 1, d-(A) = 1
d+(B) = 1, d-(B) = 1
d+(C) = 1, d-(C) = 1
```

---

## 5. Theoremes fondamentaux sur les degres

### Theoreme des poignees de main (Handshaking Lemma)

```
Somme de d(v) pour tout v dans S = 2 * |A|
```

Chaque arete contribue a exactement 2 degres. Consequences :
- La somme de tous les degres est toujours paire
- Le nombre de sommets de degre impair est toujours pair

### Version orientee

```
Somme d+(v) = Somme d-(v) = |A|
```

Chaque arc contribue a exactement 1 degre sortant et 1 degre entrant.

---

## 6. Representations d'un graphe

### 6.1 Matrice d'adjacence

Matrice n x n ou M[i][j] = 1 si l'arete/arc (i,j) existe, 0 sinon.

```
Graphe : A-B, A-C, B-C, B-D

    A  B  C  D
A [ 0  1  1  0 ]
B [ 1  0  1  1 ]
C [ 1  1  0  0 ]
D [ 0  1  0  0 ]
```

- Non oriente : matrice symetrique
- Oriente : pas forcement symetrique

### 6.2 Listes d'adjacence

Chaque sommet pointe vers la liste de ses voisins.

```
A : [B, C]
B : [A, C, D]
C : [A, B]
D : [B]
```

### 6.3 Matrice d'incidence

Matrice n x m (n sommets, m aretes).
- Non oriente : M[i][j] = 1 si le sommet i est une extremite de l'arete j
- Oriente : M[i][j] = -1 si l'arc j part de i, +1 si l'arc j arrive a i

### Comparaison

| Representation | Espace | Adjacence ? | Voisins de v | Quand l'utiliser |
|----------------|--------|-------------|--------------|------------------|
| Matrice adjacence | O(n^2) | O(1) | O(n) | Graphes denses, acces frequent |
| Liste adjacence | O(n+m) | O(deg(v)) | O(deg(v)) | Graphes creux, parcours |
| Matrice incidence | O(n*m) | O(m) | O(m) | Usage theorique |

---

## 7. Graphes ponderes (values)

Un graphe pondere G = (S, A, w) ou w : A -> R est une fonction de poids.

```
    A --5--> B
    |        |
    3        2
    |        |
    v        v
    C --7--> D --1--> E

Matrice d'adjacence ponderee :
      A    B    C    D    E
A [   0    5    3   inf  inf ]
B [ inf    0   inf   2   inf ]
C [ inf  inf    0    7   inf ]
D [ inf  inf   inf   0    1  ]
E [ inf  inf   inf  inf   0  ]
```

---

## 8. Types particuliers de graphes

### Graphe complet K_n

Tous les sommets sont relies entre eux.
- K_n a n sommets et n(n-1)/2 aretes
- Chaque sommet a degre n-1

```
K_4 :
    A --- B
    |\ /| 
    | X  |
    |/ \|
    C --- D

4 sommets, 6 aretes
```

### Graphe biparti

Sommets separes en deux groupes, aretes uniquement entre groupes.

```
Groupe 1: {A, B, C}    Groupe 2: {D, E}

    A --- D
    A --- E
    B --- D
    C --- E
```

**Propriete fondamentale :** Un graphe est biparti ssi il ne contient aucun cycle de longueur impaire.

### Graphe biparti complet K_{p,q}

Chaque sommet du groupe 1 relie a chaque sommet du groupe 2.
K_{p,q} a p+q sommets et p*q aretes.

### Graphe planaire

Peut etre dessine dans le plan sans croisement d'aretes.

**Formule d'Euler :** n - m + f = 2 (graphe planaire connexe)
- n = sommets, m = aretes, f = faces (y compris face exterieure)
- Consequence : m <= 3n - 6 pour n >= 3

### Graphe regulier

Un graphe k-regulier : tous les sommets ont degre k.
- 0-regulier : sommets isoles
- 2-regulier : union de cycles
- 3-regulier : graphe cubique

---

## 9. Isomorphisme de graphes

Deux graphes G1 et G2 sont isomorphes s'il existe une bijection f : S1 -> S2 qui preserve les aretes.

Pour prouver que deux graphes ne sont PAS isomorphes, comparer :
1. Nombre de sommets
2. Nombre d'aretes
3. Sequence de degres (liste triee)
4. Nombre de cycles de longueur k

**Attention :** Ces conditions sont necessaires mais PAS suffisantes.

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  FONDAMENTAUX DES GRAPHES -- RESUME                              |
+------------------------------------------------------------------+
|                                                                  |
|  FORMULES CLES :                                                 |
|    Somme d(v) = 2m          (poignees de main, non oriente)      |
|    Somme d+(v) = Somme d-(v) = m  (oriente)                     |
|    Nb sommets degre impair = pair                                |
|    K_n : m = n(n-1)/2       K_{p,q} : m = p*q                   |
|    Planaire connexe : n - m + f = 2                              |
|    Planaire simple : m <= 3n - 6   (n >= 3)                      |
|                                                                  |
|  REPRESENTATIONS :                                               |
|    Matrice adjacence : O(n^2) espace, O(1) test adjacence       |
|    Liste adjacence   : O(n+m) espace, O(deg) test adjacence     |
|                                                                  |
|  TYPES SPECIAUX :                                                |
|    Biparti = pas de cycle impair = 2-colorable                   |
|    Complet K_n : tout sommet relie a tout autre                  |
|    Planaire : dessinable sans croisement                         |
|                                                                  |
|  PIEGES :                                                        |
|    - {A,B} = {B,A} en non oriente (pas de double comptage)      |
|    - (A,B) != (B,A) en oriente                                  |
|    - Face exterieure COMPTE dans Euler                           |
|    - Isomorphisme : conditions necessaires != suffisantes        |
+------------------------------------------------------------------+
```
