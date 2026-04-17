---
title: "Sujets types par theme -- Graphes et Algorithmique"
sidebar_position: 2
---

# Sujets types par theme -- Graphes et Algorithmique

Exercices representatifs de ce qui tombe en DS, avec solutions completes.

---

## Type 1 : Definitions et proprietes (15-20%)

### Probleme type

Soit G un graphe simple a 7 sommets. On sait que la sequence des degres est [4, 3, 3, 3, 2, 2, 1].

a) Combien d'aretes a G ?
b) G est-il connexe ? Justifier.
c) G peut-il etre biparti ? Justifier.
d) G est-il planaire ?

### Solution

**a)** Somme des degres = 4+3+3+3+2+2+1 = 18. Donc m = 18/2 = **9 aretes**.

**b)** Pas forcement. Un graphe a 7 sommets et 9 aretes peut etre connexe ou non. Par exemple, K_4 (6 aretes, 4 sommets) plus un triangle (3 aretes, 3 sommets) donne 7 sommets et 9 aretes mais n'est pas connexe.

Cependant, la sequence de degres est specifique. Le sommet de degre 4 est relie a 4 autres sommets, et le sommet de degre 1 est relie a 1 sommet. On ne peut pas conclure sans plus d'information sur la structure exacte.

Si on suppose que G est connexe (n sommets, au moins n-1 aretes necessaires = 6, et on a 9 >= 6), c'est possible mais pas garanti.

**c)** Verifier : un graphe biparti n'a pas de cycle impair. Avec la sequence donnee, G pourrait contenir un triangle (cycle de longueur 3), ce qui le rendrait non biparti. Sans connaitre la structure exacte, on ne peut pas conclure. Mais si G contient un K_4 (4 sommets de degre >= 3, dont un de degre 4), il contient des triangles et n'est **pas biparti**.

**d)** Test : m <= 3n - 6 ? 9 <= 3(7) - 6 = 15. OUI, le test ne l'exclut pas.
G **pourrait etre planaire** (le test est necessaire, pas suffisant).

---

## Type 2 : Euler et Hamilton (15-20%)

### Probleme type (annales 2016-2024)

Soit G le graphe suivant :

```
    1 --- 2 --- 3
    |   / | \   |
    |  /  |  \  |
    5 --- 4 --- 6
```

Aretes : 1-2, 1-5, 2-3, 2-4, 2-5, 2-6, 3-6, 4-5, 4-6.

a) G admet-il un cycle eulerien ? une chaine eulerienne ?
b) G admet-il un cycle hamiltonien ? Justifier.

### Solution

**a)** Degres :
- d(1) = 2, d(2) = 5, d(3) = 2, d(4) = 3, d(5) = 3, d(6) = 3

Sommets de degre impair : {2, 4, 5, 6} => 4 sommets.
4 != 0 => pas de cycle eulerien.
4 != 2 => **pas de chaine eulerienne non plus**.

**b)** n = 6. Dirac : d_min = 2, n/2 = 3. 2 < 3 => Dirac ne s'applique pas.

Cherchons par backtracking :
- 1-2-3-6-4-5-1 : arete 5-1 existe ? Oui. **Cycle hamiltonien : 1-2-3-6-4-5-1.**

Verification : 1, 2, 3, 6, 4, 5 => 6 sommets distincts, retour a 1.
Aretes : 1-2, 2-3, 3-6, 6-4, 4-5, 5-1 => toutes dans G. **Correct.**

---

## Type 3 : Plus courts chemins (15-20%)

### Probleme type (present dans 7/8 annales)

Graphe oriente pondere :

```
    A --3--> B --1--> D
    |        ^        |
    2        4        6
    |        |        |
    v        |        v
    C --5--> B'  E <--+
    |                  ^
    +--------7---------+
```

Arcs : A->B(3), A->C(2), B->D(1), C->B(4), C->E(7), D->E(6).

Derouler Dijkstra depuis A.

### Solution

```
Poids tous >= 0 : Dijkstra applicable.

Initialisation : dist(A)=0, dist(B)=inf, dist(C)=inf, dist(D)=inf, dist(E)=inf.

Etape | Choisi | dist(A) | dist(B) | dist(C) | dist(D) | dist(E)
------|--------|---------|---------|---------|---------|--------
Init  |   --   |    0    |   inf   |   inf   |   inf   |   inf
  1   |   A    |  **0**  |    3    |    2    |   inf   |   inf
  2   |   C    |    0    |    3    |  **2**  |   inf   |    9
  3   |   B    |    0    |  **3**  |    2    |    4    |    9

Explication etape 2 : C choisi (dist=2). Voisins : B (2+4=6 > 3, pas d'amelioration), E (2+7=9).
Hmm, C->B(4) : dist(B) = min(3, 2+4) = min(3, 6) = 3. Pas d'amelioration.
C->E(7) : dist(E) = min(inf, 2+7) = 9.

  4   |   D    |    0    |    3    |    2    |  **4**  |    9

Explication etape 4 : D choisi (dist=4). Voisins : E (4+6=10 > 9, pas d'amelioration).

  5   |   E    |    0    |    3    |    2    |    4    |  **9**

Resultats finaux :
  dist = {A:0, B:3, C:2, D:4, E:9}

Plus courts chemins :
  A -> B : A->B (cout 3)
  A -> C : A->C (cout 2)
  A -> D : A->B->D (cout 3+1=4)
  A -> E : A->C->E (cout 2+7=9)
```

---

## Type 4 : Arbre couvrant minimal (10-15%)

### Probleme type

Graphe pondere non oriente a 6 sommets :

```
    A --2-- B --6-- C
    |     / |     / |
    4   3   1   5   7
    |  /    | /     |
    D --8-- E --3-- F
```

Aretes : A-B(2), A-D(4), B-D(3), B-C(6), B-E(1), C-E(5), C-F(7), D-E(8), E-F(3).

Derouler Kruskal.

### Solution

```
Aretes triees : B-E(1), A-B(2), B-D(3), E-F(3), A-D(4), C-E(5),
                B-C(6), C-F(7), D-E(8).

Etape | Arete | Poids | Action               | Composantes
------|-------|-------|----------------------|---------------------------
  1   | B-E   |   1   | Ajouter              | {A},{B,E},{C},{D},{F}
  2   | A-B   |   2   | Ajouter              | {A,B,E},{C},{D},{F}
  3   | B-D   |   3   | Ajouter              | {A,B,D,E},{C},{F}
  4   | E-F   |   3   | Ajouter              | {A,B,D,E,F},{C}
  5   | A-D   |   4   | REFUSER (meme comp.) |
  6   | C-E   |   5   | Ajouter              | {A,B,C,D,E,F}

n-1 = 5 aretes. STOP.

ACM = {B-E(1), A-B(2), B-D(3), E-F(3), C-E(5)}
Poids total = 1 + 2 + 3 + 3 + 5 = 14

    A --2-- B --1-- E --3-- F
            |       |
            3       5
            |       |
            D       C
```

---

## Type 5 : Flots (10-15%)

### Probleme type

Reseau avec source s, puits t :

```
    s --8--> A --5--> t
    |        |        ^
    6        3        |
    |        |        7
    v        v        |
    B --4--> C -------+
```

Arcs : s->A(8), s->B(6), A->C(3), A->t(5), B->C(4), C->t(7).

Trouver le flot maximal et la coupe minimale.

### Solution

```
ITERATION 1 : BFS : s -> A -> t
  Capacite residuelle : min(8, 5) = 5. |f| = 5.
  Flot : s->A:5, A->t:5.

ITERATION 2 : BFS : s -> B -> C -> t
  Capacite residuelle : min(6, 4, 7) = 4. |f| = 9.
  Flot : s->B:4, B->C:4, C->t:4.

ITERATION 3 : BFS : s -> A -> C -> t
  Residuel : s->A(3), A->C(3), C->t(3).
  Capacite residuelle : min(3, 3, 3) = 3. |f| = 12.
  Flot : s->A:8, A->t:5, A->C:3, s->B:4, B->C:4, C->t:7.

ITERATION 4 : BFS : s -> B -> C -> t
  Residuel : s->B(2), B->C(0). Impasse sur B->C.
  s -> A : s->A(0). Impasse.
  
  Pas de chemin augmentant. FLOT MAXIMAL = 12.

Flot final :
  s->A : 8/8 (sature)
  s->B : 4/6
  A->t : 5/5 (sature)
  A->C : 3/3 (sature)
  B->C : 4/4 (sature)
  C->t : 7/7 (sature)

Verification conservation :
  A : entrant 8, sortant 5+3=8. OK.
  B : entrant 4, sortant 4. OK.
  C : entrant 3+4=7, sortant 7. OK.

COUPE MINIMALE :
  Residuel final : s->A(0), s->B(2), A->C(0), B->C(0), ...
  Accessible depuis s : s -> B (via s->B cr=2). B -> ? B->C(0), B->s(4).
  S = {s, B}.
  T = {A, C, t}.
  
  Arcs S -> T : s->A(cap 8), B->C(cap 4).
  Capacite coupe = 8 + 4 = 12 = flot max. Verifie !
```

---

## Type 6 : Ordonnancement (10-15%)

### Probleme type

| Tache | Duree | Predecesseurs |
|-------|-------|---------------|
| A | 4 | -- |
| B | 3 | -- |
| C | 2 | A |
| D | 5 | A, B |
| E | 1 | C |
| F | 3 | D, E |

### Solution

```
Dates au plus tot :
  A : ES=0
  B : ES=0
  C : ES=0+4=4
  D : ES=max(0+4, 0+3)=4
  E : ES=4+2=6
  F : ES=max(4+5, 6+1)=max(9,7)=9

Duree projet = 9+3 = 12.

Dates au plus tard :
  F : LS=12-3=9
  E : LS=9-1=8
  D : LS=9-5=4
  C : LS=min(8-2)=6... Hmm, C est predecesseur de E seulement.
      LS(C) = LS(E) - duree(C) = 8 - 2 = 6.
  A : LS=min(LS(C)-4, LS(D)-4) = min(6-4, 4-4) = min(2, 0) = 0.
  B : LS=LS(D)-3 = 4-3 = 1.

Tableau :
  Tache | Duree | ES | LS | MT | Critique?
  ------|-------|----|----|----|---------
    A   |   4   |  0 |  0 |  0 |  OUI
    B   |   3   |  0 |  1 |  1 |  Non
    C   |   2   |  4 |  6 |  2 |  Non
    D   |   5   |  4 |  4 |  0 |  OUI
    E   |   1   |  6 |  8 |  2 |  Non
    F   |   3   |  9 |  9 |  0 |  OUI

Chemin critique : A -> D -> F
Duree = 4 + 5 + 3 = 12. Verifie !
```
