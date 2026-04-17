---
title: "Traces d'algorithmes -- Graphes et Algorithmique"
sidebar_position: 3
---

# Traces d'algorithmes -- Graphes et Algorithmique

Traces completes sur des graphes de taille realiste (similaire a ce qui tombe en DS).

---

## 1. Dijkstra -- Trace complete

### Graphe

```
    A --2--> B --3--> E
    |        |        ^
    5        1        2
    |        v        |
    v        C --4--> D
    F --6--> D
```

Arcs : A->B(2), A->F(5), B->C(1), B->E(3), C->D(4), D->E(2), F->D(6).
Source : A.

### Trace

```
n = 6 sommets.

Etape | Choisi | dist(A) | dist(B) | dist(C) | dist(D) | dist(E) | dist(F)
------|--------|---------|---------|---------|---------|---------|--------
Init  |   --   |    0    |   inf   |   inf   |   inf   |   inf   |   inf
  1   |   A    |  **0**  |    2    |   inf   |   inf   |   inf   |    5
  2   |   B    |    0    |  **2**  |    3    |   inf   |    5    |    5
  3   |   C    |    0    |    2    |  **3**  |    7    |    5    |    5
  4   |   E    |    0    |    2    |    3    |    7    |  **5**  |    5
  5   |   F    |    0    |    2    |    3    |    7    |    5    |  **5**

Hmm, etape 4 : E(5) et F(5) sont a egalite. Choisissons E.
  Depuis E : pas d'arc sortant (E est un puits). Pas de mise a jour.

Etape 5 : F(5). Depuis F : F->D(6). dist(D) = min(7, 5+6) = min(7, 11) = 7.

  6   |   D    |    0    |    2    |    3    |  **7**  |    5    |    5

Depuis D : D->E(2). dist(E) = min(5, 7+2) = min(5, 9) = 5. Pas d'amelioration.

Resultat final : dist = {A:0, B:2, C:3, D:7, E:5, F:5}

Plus courts chemins (reconstruction via pred) :
  A->B : A->B (2)
  A->C : A->B->C (2+1=3)
  A->D : A->B->C->D (2+1+4=7)
  A->E : A->B->E (2+3=5)
  A->F : A->F (5)
```

---

## 2. Bellman-Ford -- Trace complete

### Graphe (avec poids negatifs)

```
    A --4--> B --(-2)--> D
    |        ^           |
    3        |           1
    |        6           |
    v        |           v
    C --(-1)-> B'(=B)    E

Arcs : A->B(4), A->C(3), C->B(-1), B->D(-2), D->E(1)
Source : A. n=5.
```

### Trace

```
Arcs dans l'ordre : (A,B), (A,C), (C,B), (B,D), (D,E).
4 iterations (n-1 = 4).

Init : dist = {A:0, B:inf, C:inf, D:inf, E:inf}

ITERATION 1 :
  Arc    | dist avant | Calcul       | dist apres
  (A,B)  | B:inf      | 0+4=4 < inf  | B:4
  (A,C)  | C:inf      | 0+3=3 < inf  | C:3
  (C,B)  | B:4        | 3+(-1)=2 < 4 | B:2
  (B,D)  | D:inf      | 2+(-2)=0     | D:0
  (D,E)  | E:inf      | 0+1=1        | E:1

dist = {A:0, B:2, C:3, D:0, E:1}

ITERATION 2 :
  (A,B)  | B:2  | 0+4=4 > 2    | B:2
  (A,C)  | C:3  | 0+3=3        | C:3
  (C,B)  | B:2  | 3+(-1)=2     | B:2
  (B,D)  | D:0  | 2+(-2)=0     | D:0
  (D,E)  | E:1  | 0+1=1        | E:1

Aucune amelioration. On peut s'arreter tot (optimisation).

dist = {A:0, B:2, C:3, D:0, E:1}

ITERATION 3 et 4 : idem, aucune amelioration.

VERIFICATION (iteration n=5) :
  Aucun arc ne permet d'amelioration.
  => PAS de circuit de poids negatif.

Resultat : dist = {A:0, B:2, C:3, D:0, E:1}

Plus courts chemins :
  A->C : A->C (3)
  A->B : A->C->B (3+(-1)=2)
  A->D : A->C->B->D (3+(-1)+(-2)=0)
  A->E : A->C->B->D->E (3+(-1)+(-2)+1=1)
```

---

## 3. Floyd-Warshall -- Trace complete

### Graphe

```
3 sommets : 1, 2, 3.
Arcs : 1->2(4), 1->3(11), 2->1(6), 2->3(2), 3->1(3)
```

### Trace

```
Matrice initiale :
       1    2    3
1 [    0    4   11  ]
2 [    6    0    2  ]
3 [    3   inf   0  ]

k=1 (intermediaire = sommet 1) :
  dist[2][3] = min(2, dist[2][1]+dist[1][3]) = min(2, 6+11) = min(2, 17) = 2.
  dist[3][2] = min(inf, dist[3][1]+dist[1][2]) = min(inf, 3+4) = 7.

       1    2    3
1 [    0    4   11  ]
2 [    6    0    2  ]
3 [    3    7    0  ]

k=2 (intermediaire = sommet 2) :
  dist[1][3] = min(11, dist[1][2]+dist[2][3]) = min(11, 4+2) = 6. Amelioration!
  dist[3][1] = min(3, dist[3][2]+dist[2][1]) = min(3, 7+6) = 3. Pas de changement.

       1    2    3
1 [    0    4    6  ]
2 [    6    0    2  ]
3 [    3    7    0  ]

k=3 (intermediaire = sommet 3) :
  dist[1][2] = min(4, dist[1][3]+dist[3][2]) = min(4, 6+7) = 4. Pas de changement.
  dist[2][1] = min(6, dist[2][3]+dist[3][1]) = min(6, 2+3) = 5. Amelioration!

       1    2    3
1 [    0    4    6  ]
2 [    5    0    2  ]
3 [    3    7    0  ]

Diagonale : 0, 0, 0. Pas de circuit negatif.

Resultats :
  1->2 : 4 (direct)
  1->3 : 6 (via 1->2->3 : 4+2=6)
  2->1 : 5 (via 2->3->1 : 2+3=5)
  2->3 : 2 (direct)
  3->1 : 3 (direct)
  3->2 : 7 (via 3->1->2 : 3+4=7)
```

---

## 4. Kruskal -- Trace complete

### Graphe

```
7 sommets : A,B,C,D,E,F,G
Aretes : A-B(7), A-D(5), B-C(8), B-D(9), B-E(7), C-E(5),
         D-E(15), D-F(6), E-F(8), E-G(9), F-G(11)
```

### Trace

```
Aretes triees : A-D(5), C-E(5), D-F(6), A-B(7), B-E(7), B-C(8),
                E-F(8), B-D(9), E-G(9), F-G(11), D-E(15)

Etape | Arete | Poids | Action          | Composantes
------|-------|-------|-----------------|-----------------------------------
  1   | A-D   |   5   | Ajouter         | {A,D},{B},{C},{E},{F},{G}
  2   | C-E   |   5   | Ajouter         | {A,D},{B},{C,E},{F},{G}
  3   | D-F   |   6   | Ajouter         | {A,D,F},{B},{C,E},{G}
  4   | A-B   |   7   | Ajouter         | {A,B,D,F},{C,E},{G}
  5   | B-E   |   7   | Ajouter         | {A,B,C,D,E,F},{G}
  6   | B-C   |   8   | REFUSER         |
  7   | E-F   |   8   | REFUSER         |
  8   | B-D   |   9   | REFUSER         |
  9   | E-G   |   9   | Ajouter         | {A,B,C,D,E,F,G}

n-1 = 6 aretes. STOP.

ACM = {A-D(5), C-E(5), D-F(6), A-B(7), B-E(7), E-G(9)}
Poids total = 5 + 5 + 6 + 7 + 7 + 9 = 39

ACM :
    A --5-- D --6-- F
    |
    7
    |
    B --7-- E --5-- C
            |
            9
            |
            G
```

---

## 5. Ford-Fulkerson -- Trace complete

### Reseau

```
    s --16--> A --12--> t
    |         |   \     ^
    13        |    4    |
    |         9    \    20
    v         |     v   |
    B --14--> D --7--> t
    |         ^
    4         |
    v         |
    C --10----+
```

Arcs : s->A(16), s->B(13), A->B(4)... Simplifions.

Prenons un reseau classique :
s->A(10), s->B(10), A->B(2), A->C(8), A->D(4), B->D(9), C->t(10), D->t(6), D->C(6).

### Trace

```
ITERATION 1 : BFS : s -> A -> C -> t
  cr = min(10, 8, 10) = 8. |f| = 8.

ITERATION 2 : BFS : s -> B -> D -> t
  cr = min(10, 9, 6) = 6. |f| = 14.

ITERATION 3 :
  Residuel : s->A(2), s->B(4), A->B(2), A->C(0), A->D(4),
             B->D(3), C->t(2), D->t(0), D->C(6),
             + arcs arriere...
  
  BFS : s -> A -> D -> C -> t
  cr = min(2, 4, 6, 2) = 2. |f| = 16.

ITERATION 4 :
  Residuel : s->A(0), s->B(4), A->B(2), A->D(2),
             B->D(3), D->C(4), C->t(0), ...
  
  BFS : s -> B -> D -> C -> t
  Hmm, C->t a cr=0. D->C(4), C->t(0). Impasse via C.
  
  s -> B -> D -> t : D->t a cr=0. Impasse.
  
  Pas de chemin augmentant. FLOT MAX = 16.
```

---

## 6. Ordonnancement MPM -- Trace complete

### Donnees

| Tache | Duree | Pred |
|-------|-------|------|
| A | 5 | -- |
| B | 3 | -- |
| C | 6 | A |
| D | 2 | A |
| E | 4 | B, D |
| F | 3 | C |
| G | 2 | E, F |

### Trace

```
DATES AU PLUS TOT (avant, MAX) :

Tache | ES calcul                              | ES
------|----------------------------------------|----
  A   | 0                                      |  0
  B   | 0                                      |  0
  C   | ES(A)+dur(A) = 0+5 = 5                |  5
  D   | ES(A)+dur(A) = 0+5 = 5                |  5
  E   | max(ES(B)+dur(B), ES(D)+dur(D))       |
      | = max(0+3, 5+2) = max(3, 7) = 7       |  7
  F   | ES(C)+dur(C) = 5+6 = 11               | 11
  G   | max(ES(E)+dur(E), ES(F)+dur(F))       |
      | = max(7+4, 11+3) = max(11, 14) = 14   | 14

Duree projet = ES(G) + dur(G) = 14 + 2 = 16.

DATES AU PLUS TARD (arriere, MIN) :

Tache | LS calcul                              | LS
------|----------------------------------------|----
  G   | 16 - 2 = 14                           | 14
  F   | LS(G) - dur(F) = 14 - 3 = 11          | 11
  E   | LS(G) - dur(E) = 14 - 4 = 10          | 10
  C   | LS(F) - dur(C) = 11 - 6 = 5           |  5
  D   | LS(E) - dur(D) = 10 - 2 = 8           |  8
  B   | LS(E) - dur(B) = 10 - 3 = 7           |  7
  A   | min(LS(C)-dur(A), LS(D)-dur(A))       |
      | = min(5-5, 8-5) = min(0, 3) = 0       |  0

TABLEAU DE SYNTHESE :

Tache | Duree | ES | LS | MT=LS-ES | Critique?
------|-------|----|----|----------|----------
  A   |   5   |  0 |  0 |    0     |  OUI
  B   |   3   |  0 |  7 |    7     |  Non
  C   |   6   |  5 |  5 |    0     |  OUI
  D   |   2   |  5 |  8 |    3     |  Non
  E   |   4   |  7 | 10 |    3     |  Non
  F   |   3   | 11 | 11 |    0     |  OUI
  G   |   2   | 14 | 14 |    0     |  OUI

CHEMIN CRITIQUE : A -> C -> F -> G
Duree = 5 + 6 + 3 + 2 = 16. Verifie !
```
