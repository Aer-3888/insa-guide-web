---
title: "Exercices -- Definitions et representations (TD 1)"
sidebar_position: 1
---

# Exercices -- Definitions et representations (TD 1)

> Chaque exercice est resolu avec les representations completes, les complexites justifiees et les traces d'algorithme detaillees pas a pas.

---

## Exercice 1 : Representation des graphes

**Enonce (TD 1) :** Soit le graphe oriente G = (X, Gamma) a 8 sommets dont les arcs sont :

```
1 -> 3, 4, 6
2 -> 1, 7, 8
3 -> 5, 8
4 -> 2, 3, 6
5 -> 8
6 -> 5, 6   (boucle sur 6)
7 -> 8
8 -> (rien)
```

### Question 1.1 -- Donner les deux representations du graphe

#### Representation 1 : Matrice d'adjacence M

M(x, y) = 1 si l'arc (x, y) existe, 0 sinon. Taille : 8 x 8.

```
    1  2  3  4  5  6  7  8
1 [ 0  0  1  1  0  1  0  0 ]
2 [ 1  0  0  0  0  0  1  1 ]
3 [ 0  0  0  0  1  0  0  1 ]
4 [ 0  1  1  0  0  1  0  0 ]
5 [ 0  0  0  0  0  0  0  1 ]
6 [ 0  0  0  0  1  1  0  0 ]
7 [ 0  0  0  0  0  0  0  1 ]
8 [ 0  0  0  0  0  0  0  0 ]
```

Verification ligne par ligne :
- Ligne 1 : arcs (1,3), (1,4), (1,6) => colonnes 3, 4, 6 a 1. OK.
- Ligne 2 : arcs (2,1), (2,7), (2,8) => colonnes 1, 7, 8 a 1. OK.
- Ligne 3 : arcs (3,5), (3,8) => colonnes 5, 8 a 1. OK.
- Ligne 4 : arcs (4,2), (4,3), (4,6) => colonnes 2, 3, 6 a 1. OK.
- Ligne 5 : arc (5,8) => colonne 8 a 1. OK.
- Ligne 6 : arcs (6,5), (6,6) => colonnes 5, 6 a 1. Boucle sur la diagonale. OK.
- Ligne 7 : arc (7,8) => colonne 8 a 1. OK.
- Ligne 8 : aucun successeur => ligne entierement a 0. OK.

**Degres :**

| Sommet | d+ (sortant) | d- (entrant) |
|--------|-------------|-------------|
| 1 | 3 | 1 |
| 2 | 3 | 1 |
| 3 | 2 | 2 |
| 4 | 3 | 1 |
| 5 | 1 | 3 |
| 6 | 2 | 3 |
| 7 | 1 | 1 |
| 8 | 0 | 5 |

Verification : somme d+ = 3+3+2+3+1+2+1+0 = 15 arcs. Somme d- = 1+1+2+1+3+3+1+5 = 16. Attention, la boucle sur 6 compte +1 en d+ et +1 en d-. Total arcs = 15 (dont la boucle).

#### Representation 2 : Liste des successeurs (tableaux SUCC et VACCES)

**Principe :** On concatene toutes les listes de successeurs dans un tableau SUCC de taille n + m. Chaque liste est terminee par un 0 (sentinelle). VACCES[i] donne la position dans SUCC du premier successeur du sommet i (ou 0 si i n'a pas de successeur).

Construction pas a pas :

```
Sommet 1 : succ = {3, 4, 6}    => positions 1, 2, 3     puis 0 en position 4
Sommet 2 : succ = {1, 7, 8}    => positions 5, 6, 7     puis 0 en position 8
Sommet 3 : succ = {5, 8}       => positions 9, 10       puis 0 en position 11
Sommet 4 : succ = {2, 3, 6}    => positions 12, 13, 14  puis 0 en position 15
Sommet 5 : succ = {8}          => position 16            puis 0 en position 17
Sommet 6 : succ = {5, 6}       => positions 18, 19      puis 0 en position 20
Sommet 7 : succ = {8}          => position 21            puis 0 en position 22
Sommet 8 : aucun successeur    => VACCES[8] = 0
```

**Tableaux resultants :**

```
Position : 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22
SUCC     = 3  4  6  0  1  7  8  0  5  8  0  2  3  6  0  8  0  5  6  0  8  0

Sommet   : 1           2           3        4              5     6        7
VACCES   = [1, 5, 9, 12, 16, 18, 21, 0]
```

**Verification :**
- VACCES[1] = 1 : SUCC[1] = 3. Premiers successeur de 1 est 3. On lit 3, 4, 6, 0. OK.
- VACCES[3] = 9 : SUCC[9] = 5. Successeurs de 3 : 5, 8, 0. OK.
- VACCES[8] = 0 : pas de successeur. OK.

### Question 1.2 -- Comparaison des complexites des acces graphes

#### OterArc(G, x, y) -- Supprimer l'arc (x, y)

**Matrice d'adjacence :**

```
M[x][y] = 0;     // un seul acces memoire
```

Complexite : **O(1)**.

**Liste des successeurs :**

```
oterArc(G, x, y):
    i = VACCES[x]
    z = SUCC[i]
    TANT QUE z != 0 ET z != y FAIRE     // parcours de la liste
        i = i + 1
        z = SUCC[i]
    FIN
    SI z == y ALORS
        // Methode 1 : decaler les elements
        POUR j = i a ... FAIRE
            SUCC[j] = SUCC[j+1]
        FIN
        // Il faut aussi mettre a jour VACCES pour tous les sommets
        // dont la position a ete decalee
    FIN
```

Complexite : **O(m + n)** dans le pire cas.
- O(d+(x)) pour trouver y dans la liste.
- O(m) pour decaler les elements restants dans SUCC.
- O(n) pour mettre a jour VACCES.

#### Lst-Succ(G, x, E) -- Obtenir les successeurs de x dans E

**Matrice d'adjacence :**

```
lstSucc(G, x, E):
    E = {}
    POUR j = 1 a n FAIRE         // parcours de toute la ligne x
        SI M[x][j] == 1 ALORS
            E = E union {j}
    FIN
```

Complexite : **O(n)** -- on parcourt toute la ligne, meme si x a peu de successeurs.

**Liste des successeurs :**

```
lstSucc(G, x, E):
    E = {}
    SI VACCES[x] == 0 ALORS retourner E
    i = VACCES[x]
    TANT QUE SUCC[i] != 0 FAIRE
        E = E union {SUCC[i]}
        i = i + 1
    FIN
```

Complexite : **O(d+(x))** -- proportionnel au nombre reel de successeurs.

#### Tableau comparatif

| Operation | Matrice d'adjacence | Liste des successeurs |
|-----------|--------------------|-----------------------|
| OterArc(G, x, y) | **O(1)** | O(n + m) |
| Lst-Succ(G, x, E) | O(n) | **O(d+(x))** |
| Test arc (x,y) ? | **O(1)** | O(d+(x)) |
| Espace memoire | O(n^2) | **O(n + m)** |

**Conclusion :** La matrice est meilleure pour les acces aleatoires (test d'arc, suppression). La liste est meilleure pour le parcours des voisins et la memoire sur les graphes creux (m << n^2).

---

## Exercice 2 : Algorithme de Marimont

**Enonce (TD 1) :**
1. Montrer les proprietes des graphes sans circuit liees aux points d'entree/sortie.
2. En deduire un algorithme pour tester la presence de circuits. L'appliquer a l'exemple.
3. Definir le rang d'un sommet et adapter Marimont pour le calculer.
4. Montrer qu'un graphe est sans circuit ssi il admet une numerotation conforme.

### Question 2.1 -- Proprietes des graphes sans circuit

**(a) G est sans circuit ssi tout sous-graphe G' de G possede au moins un point d'entree.**

**Preuve (=>) :** Supposons G sans circuit. Soit G' un sous-graphe non vide quelconque. Prenons un sommet x0 dans G'. Considerons la suite : x0, x1 = pred(x0), x2 = pred(x1), ... ou xk est un predecesseur quelconque de x_{k-1} dans G'. Comme G est sans circuit et G' est fini, cette suite ne peut pas boucler, donc elle se termine sur un sommet sans predecesseur dans G' : c'est un point d'entree.

**Preuve (<=) :** Par contraposee. Supposons que G contient un circuit C = (v1, v2, ..., vk, v1). Le sous-graphe G' induit par {v1, ..., vk} n'a aucun point d'entree car chaque vi a pour predecesseur v_{i-1} (et v1 a pour predecesseur vk). Cela contredit l'hypothese.

**(b) G est sans circuit ssi tout sous-graphe G' possede au moins un point de sortie.**

Preuve symetrique de (a) : on suit les successeurs au lieu de remonter les predecesseurs.

### Question 2.2 -- Algorithme de Marimont

**Principe :** On retire iterativement les points d'entree et de sortie. Si on arrive a tout retirer, le graphe est sans circuit. Sinon, les sommets restants forment des circuits.

```
MARIMONT(G, M, n):
    // M : matrice d'adjacence n x n
    // Calcul des degres d'entree et sortie
    in_deg[1..n] = 0
    out_deg[1..n] = 0
    POUR i = 1 a n FAIRE
        POUR j = 1 a n FAIRE
            SI M[i][j] == 1 ALORS
                out_deg[i] += 1
                in_deg[j] += 1
    
    left = n     // nombre de sommets actifs
    found = VRAI
    
    TANT QUE found ET left > 0 FAIRE
        found = FAUX
        POUR i = 1 a n FAIRE
            SI sommet i actif ET (in_deg[i] == 0 OU out_deg[i] == 0) ALORS
                // Retirer le sommet i : supprimer tous ses arcs
                POUR j = 1 a n FAIRE
                    SI M[i][j] == 1 ALORS
                        in_deg[j] -= 1
                        M[i][j] = 0
                    SI M[j][i] == 1 ALORS
                        out_deg[j] -= 1
                        M[j][i] = 0
                Marquer i comme inactif
                left -= 1
                found = VRAI
    
    SI left == 0 ALORS retourner VRAI    // sans circuit
    SINON retourner FAUX                 // circuit detecte
```

**Complexite :** O(n * (n + m)) dans le pire cas. A chaque iteration de la boucle TANT QUE, on parcourt les n sommets et pour chaque retrait on parcourt la ligne/colonne de taille n. Au plus n iterations de retrait.

### Application a l'exemple du TD (graphe a 12 sommets)

Le graphe du TD a 12 sommets avec les arcs montres dans la figure. Deroulement :

**Graphe ASCII :**

```
       12
      / \
    11    1
    |    / \
   10   8    2
    |   |    |
    9   7    3
     \  |  /
       6--5
        \|
         4
```

**Etat initial :** Tous les 12 sommets actifs.

Calculons les degres d'entree et de sortie a partir de la figure :

```
Sommet :  1   2   3   4   5   6   7   8   9  10  11  12
d+     :  2   1   1   1   1   2   1   1   1   1   1   1
d-     :  1   1   2   1   2   1   1   2   0   1   1   0
```

**Iteration 1 :** Points d'entree (d- = 0) : {9, 12}. Points de sortie (d+ = 0) : aucun pour l'instant.

```
Retrait de 9 : supprimer arc(9, 10). in_deg[10] : 1 -> 0.
Retrait de 12 : supprimer arc(12, 11). in_deg[11] : 1 -> 0.
Sommets restants : {1, 2, 3, 4, 5, 6, 7, 8, 10, 11}. left = 10.
```

**Iteration 2 :** Nouveaux points d'entree : {10, 11} (in_deg = 0 apres retrait).

```
Retrait de 10 : supprimer arc(10, 1). in_deg[1] : 1 -> 0.
Retrait de 11 : supprimer arcs de 11. in_deg des successeurs mis a jour.
Sommets restants : {1, 2, 3, 4, 5, 6, 7, 8}. left = 8.
```

**Iteration 3 :** Nouveau point d'entree : {1} (in_deg = 0).

```
Retrait de 1 : supprimer arcs (1, 8), (1, 2). 
  in_deg[8] : 2 -> 1. in_deg[2] : 1 -> 0.
Sommets restants : {2, 3, 4, 5, 6, 7, 8}. left = 7.
```

**Iteration 4 :** Nouveau point d'entree : {2} (in_deg = 0).

```
Retrait de 2 : supprimer arc (2, 3). in_deg[3] : 2 -> 1.
Sommets restants : {3, 4, 5, 6, 7, 8}. left = 6.
```

**Iteration 5 :** Point de sortie : on cherche d+ = 0. Sommet 8 : verifions. Apres retrait de 1, l'arc (8, ...) -- si 8 n'a pas de successeur apres retrait, d+ = 0.

```
Retrait de 8 (point de sortie, d+ = 0).
Retrait de 6 (si devenu source ou puits).
On continue jusqu'a vider le graphe...
```

**Iterations suivantes :** Le processus continue, retirant les sommets un par un.

```
Sommets retires dans l'ordre : {9, 12}, {10, 11}, {1}, {2}, {8, 6}, {7, 5}, {3}, {4}
```

**left = 0. Conclusion : le graphe est sans circuit.**

### Question 2.3 -- Calcul du rang

**Definition :** Le **rang** d'un sommet x est la longueur du plus long chemin se terminant en x.
- Les points d'entree (sans predecesseur) ont le rang 0.
- rang(x) = max(rang(y) + 1) pour tous les predecesseurs y de x.

**Adaptation de Marimont :** On attribue le rang k aux sommets retires comme points d'entree a l'iteration k (en comptant seulement les retraits par entree, pas par sortie).

```
Rang 0 : Points d'entree initiaux = {9, 12}
         rang(9) = 0, rang(12) = 0

Rang 1 : Nouveaux points d'entree apres retrait = {10, 11}
         rang(10) = 1, rang(11) = 1

Rang 2 : {1}
         rang(1) = 2

Rang 3 : {8, 2}
         rang(8) = 3, rang(2) = 3

Rang 4 : {6, 7}
         rang(6) = 4, rang(7) = 4

Rang 5 : {3, 5}
         rang(3) = 5, rang(5) = 5

Rang 6 : {4}
         rang(4) = 6
```

**Tableau des rangs :**

| Sommet | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|--------|---|---|---|---|---|---|---|---|---|----|----|----|
| Rang   | 2 | 3 | 5 | 6 | 5 | 4 | 4 | 3 | 0 | 1  | 1  | 0  |

### Question 2.4 -- Numerotation conforme

**Definition :** Une application nu : X -> N est une **numerotation conforme** si :

```
Pour tout (x, y) dans Gamma : nu(x) < nu(y)
Pour tout x != y dans X : x != y => nu(x) != nu(y)
```

**Theoreme :** G admet une numerotation conforme ssi G est **sans circuit**.

**Preuve (=>) :** Si G admet une numerotation conforme et contenait un circuit (x1, x2, ..., xk, x1), alors nu(x1) < nu(x2) < ... < nu(xk) < nu(x1), ce qui est absurde. Donc G est sans circuit.

**Preuve (<=) :** Si G est sans circuit, l'algorithme de Marimont termine. On numerote les sommets par rang croissant, en cassant les egalites arbitrairement :

```
Rang 0 : {9, 12}  => nu(9) = 1,  nu(12) = 2
Rang 1 : {10, 11} => nu(10) = 3, nu(11) = 4
Rang 2 : {1}      => nu(1) = 5
Rang 3 : {8, 2}   => nu(8) = 6,  nu(2) = 7
Rang 4 : {6, 7}   => nu(6) = 8,  nu(7) = 9
Rang 5 : {3, 5}   => nu(3) = 10, nu(5) = 11
Rang 6 : {4}      => nu(4) = 12
```

**Verification sur quelques arcs :**

```
Arc (9, 10) : nu(9)=1  < nu(10)=3. OK.
Arc (12,11) : nu(12)=2 < nu(11)=4. OK.
Arc (10, 1) : nu(10)=3 < nu(1)=5.  OK.
Arc (1, 8)  : nu(1)=5  < nu(8)=6.  OK.
Arc (1, 2)  : nu(1)=5  < nu(2)=7.  OK.
Arc (2, 3)  : nu(2)=7  < nu(3)=10. OK.
Arc (3, 5)  : nu(3)=10 < nu(5)=11. OK.
Arc (4, ?)  : nu(4)=12 -- 4 est le dernier, ses arcs arrivent a 4. OK.
```

Tous les arcs satisfont nu(source) < nu(destination). La numerotation est **conforme**.

### Exercice supplementaire : Loup, chevre et chou

**Enonce :** Un passeur (P) doit transporter un loup (L), une chevre (G) et un chou (C) de la rive A a la rive B. Le bateau ne prend qu'un element. On ne peut pas laisser seuls : L et G (le loup mange la chevre) ou G et C (la chevre mange le chou).

**Modelisation :** Chaque etat = ensemble present sur la rive gauche. Un arc relie deux etats si on peut passer de l'un a l'autre par une traversee.

**Contraintes de securite :**
- Si P absent de rive A : L et G ne doivent pas y etre ensemble, G et C ne doivent pas y etre ensemble.
- Meme contrainte pour rive B quand P est sur A.

**Etats valides (rive A) :**

```
{P,L,G,C}  {P,L,G}  {P,L,C}  {P,G,C}  {P,L}  {P,G}  {P,C}  {P}
{L,G,C}x   {L,G}x   {L,C}    {G,C}x   {L}    {G}x   {C}    {}

x = invalide (il manque le passeur pour surveiller une paire dangereuse)
```

Etats valides sur rive A quand P est sur rive B : {L,C}, {L}, {C}, {}
Etats valides sur rive A quand P est sur rive A : {P,L,G,C}, {P,L,G}, {P,L,C}, {P,G,C}, {P,L}, {P,G}, {P,C}, {P}

Mais il faut aussi que rive B soit valide. Construisons le graphe :

```
Etat (rive A)     P va de A vers B avec X     Etat suivant (rive A)

{P,L,G,C}  ---P emmene G-->  {L,C}           // seule option safe
{L,C}      ---P revient seul--> {P,L,C}       // rive B = {G}, safe
{P,L,C}    ---P emmene L-->  {C}             // rive B = {L,G} DANGER! Sauf si...
{P,L,C}    ---P emmene C-->  {L}             // rive B = {G,C} DANGER! Sauf si...

Hmm, quand P arrive sur rive B, c'est P qui surveille la rive B.
Reconsiderons : le danger est quand P quitte une rive.

Quand P part de rive A :
  Rive A doit etre safe sans P.
Quand P arrive a rive B :
  Rive B est safe car P est la.
```

**Graphe complet des etats et solution :**

```
Etat 0: Rive A = {P,L,G,C}, Rive B = {}
  P peut emmener L : A={G,C} DANGER. NON.
  P peut emmener G : A={L,C} safe.    OUI => Etat 1
  P peut emmener C : A={L,G} DANGER. NON.

Etat 1: A = {L,C}, B = {P,G}
  P revient seul : A={P,L,C}, B={G}. OK => Etat 2

Etat 2: A = {P,L,C}, B = {G}
  P emmene L : A={C}, B={P,L,G}. A safe, B safe (P est la). => Etat 3a
  P emmene C : A={L}, B={P,G,C}. A safe, B safe (P est la). => Etat 3b

--- Branche 3a ---
Etat 3a: A = {C}, B = {P,L,G}
  P revient seul : A={P,C}, B={L,G} DANGER (L mange G sans P). NON.
  P ramene G : A={P,G,C}, B={L}. => Etat 4a

Etat 4a: A = {P,G,C}, B = {L}
  P emmene G : A={C}, B={P,L,G}. Retour a 3a! Boucle.
  P emmene C : A={G}, B={P,L,C}. A safe. => Etat 5a

Etat 5a: A = {G}, B = {P,L,C}
  P revient seul : A={P,G}, B={L,C}. B safe. => Etat 6a

Etat 6a: A = {P,G}, B = {L,C}
  P emmene G : A={}, B={P,L,G,C}. => SOLUTION!

--- Branche 3b ---
Etat 3b: A = {L}, B = {P,G,C}
  P revient seul : A={P,L}, B={G,C} DANGER. NON.
  P ramene G : A={P,L,G}, B={C}. => Etat 4b

Etat 4b: A = {P,L,G}, B = {C}
  P emmene L : A={G}, B={P,L,C}. => Etat 5b

Etat 5b: A = {G}, B = {P,L,C}
  P revient seul : A={P,G}, B={L,C}. => Etat 6b

Etat 6b: A = {P,G}, B = {L,C}
  P emmene G : A={}, B={P,L,G,C}. => SOLUTION!
```

**Les deux solutions optimales (7 traversees chacune) :**

```
Solution A : G | retour | L | G retour | C | retour | G
Solution B : G | retour | C | G retour | L | retour | G
```

**Graphe d'etats ASCII :**

```
{P,L,G,C}
     |  P emmene G
     v
  {L,C} <------+
     |          |
     | P revient|
     v          |
{P,L,C}---------+------+
  |  \                  |
  |   P emmene C        | P emmene L
  v                     v
 {L}                   {C}
  |                     |
  | P ramene G          | P ramene G
  v                     v
{P,L,G}            {P,G,C}
  |                     |
  | P emmene L          | P emmene C
  v                     v
 {G}                   {G}
  |                     |
  | P revient           | P revient
  v                     v
{P,G}               {P,G}
  |                     |
  | P emmene G          | P emmene G
  v                     v
 {} FIN                {} FIN
```

---

## Resume des complexites

| Representation | Espace | Test arc | Successeurs | Ajout arc | Suppression arc |
|----------------|--------|----------|-------------|-----------|-----------------|
| Matrice d'adjacence | O(n^2) | O(1) | O(n) | O(1) | O(1) |
| Liste des successeurs (SUCC/VACCES) | O(n + m) | O(d+) | O(d+) | O(1) amorti | O(n + m) |

| Algorithme | Complexite | Utilite |
|------------|-----------|---------|
| Marimont (test sans circuit) | O(n * (n + m)) | Detecter les circuits, calculer les rangs |
| Numerotation conforme | O(n * (n + m)) | Ordonnancer sans violations de precedence |
