---
title: "Chapitre 03 -- Plus courts chemins"
sidebar_position: 3
---

# Chapitre 03 -- Plus courts chemins

> **Idee centrale :** Trouver le chemin de poids minimal entre deux sommets. Dijkstra pour les poids positifs, Bellman-Ford pour les poids quelconques, Floyd-Warshall pour tous les couples.

---

## 1. Definitions

### Poids d'un chemin

```
w(P) = w(v0,v1) + w(v1,v2) + ... + w(v_{k-1},vk)
```

### Distance ponderee

```
delta(u, v) = min { w(P) : P chemin de u a v }
delta(u, v) = infini si pas de chemin
```

### Sous-structure optimale

Tout sous-chemin d'un plus court chemin est lui-meme un plus court chemin.

### Circuits de poids negatif

Si un circuit de poids negatif existe et est accessible, delta(u,v) = -infini.

```
    A --1--> B ---(-3)---> C --1--> A

Circuit A->B->C->A de poids 1+(-3)+1 = -1
Chaque tour reduit le cout => pas de plus court chemin
```

---

## 2. Algorithme de Dijkstra

### Hypothese : tous les poids >= 0

### Principe

Explorer les sommets par ordre de distance croissante depuis la source. A chaque etape, prendre le sommet non visite le plus proche et mettre a jour ses voisins.

### Pseudo-code

```
Dijkstra(G, s):
    Pour chaque sommet v:
        dist(v) = infini
        pred(v) = null
        visite(v) = false
    dist(s) = 0

    Repeter n fois:
        u = sommet non visite avec dist(u) minimale
        visite(u) = true

        Pour chaque voisin v de u:
            Si dist(u) + w(u,v) < dist(v):
                dist(v) = dist(u) + w(u,v)
                pred(v) = u

    Retourner dist, pred
```

### Exemple pas a pas

```
Graphe :
    A --4--> B --3--> D
    |        ^        ^
    2        1        5
    |        |        |
    v        |        |
    C -------+--------+
    |
    1
    v
    E --2--> D

Source : A

Etape | Choisi | dist(A) | dist(B) | dist(C) | dist(D) | dist(E)
------|--------|---------|---------|---------|---------|--------
Init  |   --   |    0    |   inf   |   inf   |   inf   |   inf
  1   |   A    |  **0**  |    4    |    2    |   inf   |   inf
  2   |   C    |    0    |    3    |  **2**  |    7    |    3
  3   |   B    |    0    |  **3**  |    2    |    6    |    3
  4   |   E    |    0    |    3    |    2    |    5    |  **3**
  5   |   D    |    0    |    3    |    2    |  **5**  |    3

Resultats : dist = {A:0, B:3, C:2, D:5, E:3}

Plus court chemin A->D : A->C->E->D (cout 2+1+2 = 5)
Reconstruction via pred : D<-E<-C<-A
```

### Complexite

| Implementation | Complexite |
|----------------|-----------|
| Tableau simple | O(n^2) |
| Tas binaire | O((n + m) log n) |
| Tas de Fibonacci | O(m + n log n) |

### Pourquoi Dijkstra echoue avec les poids negatifs

```
    A --1--> B --(-10)--> D
    |                     ^
    2                     |
    |                     3
    v                     |
    C --------------------+

Arcs : A->B(1), A->C(2), B->D(-10), C->D(3)

Dijkstra :
  Init : dist(A)=0, dist(B)=inf, dist(C)=inf, dist(D)=inf
  Etape 1 : Choisir A. dist(B)=1, dist(C)=2.
  Etape 2 : Choisir B (dist=1). Marquer B visite.
            dist(D) = min(inf, 1+(-10)) = -9.
  Etape 3 : Choisir D (dist=-9). Marquer D visite.
  Etape 4 : Choisir C (dist=2). dist(D) = min(-9, 2+3) = -9.
            D deja visite, pas de mise a jour.

Resultat Dijkstra : dist(D) = -9. Correct ici.

Mais si le graphe est :
    A --1--> B --2--> C
    |                 ^
    10              -8
    |                 |
    v                 |
    D ----------------+

Arcs : A->B(1), A->D(10), B->C(2), D->C(-8)

Dijkstra :
  Etape 1 : Choisir A. dist(B)=1, dist(D)=10.
  Etape 2 : Choisir B (dist=1). Marquer B visite. dist(C)=3.
  Etape 3 : Choisir C (dist=3). Marquer C visite.
  Etape 4 : Choisir D (dist=10). dist(C) = min(3, 10+(-8)) = min(3, 2) = 2.
            Mais C est DEJA VISITE => pas de mise a jour !

Resultat Dijkstra : dist(C) = 3.  FAUX !
Vrai plus court chemin : A->D->C = 10+(-8) = 2.

Le probleme : Dijkstra a valide C avec dist=3 trop tot.
Le chemin via D (plus long en nombre d'arcs) est en fait moins cher
grace au poids negatif, mais C etait deja visite.
```

---

## 3. Algorithme de Bellman-Ford

### Accepte les poids negatifs, detecte les circuits negatifs

### Principe

Relaxer toutes les aretes, n-1 fois. Un plus court chemin utilise au plus n-1 arcs.

### Relaxation

```
Si dist(u) + w(u,v) < dist(v):
    dist(v) = dist(u) + w(u,v)
    pred(v) = u
```

### Pseudo-code

```
BellmanFord(G, s):
    Pour chaque sommet v:
        dist(v) = infini
        pred(v) = null
    dist(s) = 0

    -- Relaxation : n-1 iterations
    Pour i de 1 a n-1:
        Pour chaque arc (u, v) du graphe:
            Si dist(u) + w(u,v) < dist(v):
                dist(v) = dist(u) + w(u,v)
                pred(v) = u

    -- Detection circuit negatif : n-eme iteration
    Pour chaque arc (u, v):
        Si dist(u) + w(u,v) < dist(v):
            ERREUR : "Circuit de poids negatif !"

    Retourner dist, pred
```

### Exemple pas a pas

```
Graphe :
    A --6--> B
    |        |  \
    7       -4   5
    |        |    \
    v        v     v
    C <-(-3)- D <--2-- B'(=B)
              ^
              |
              2
              |
              D --2--> B  (arc retour)

Simplifions : A->B(6), A->C(7), B->C(5), B->D(-4), C->D(-3), D->B(2)
Source : A.  n=4 sommets, 3 iterations.

Arcs : (A,B), (A,C), (B,C), (B,D), (C,D), (D,B)

Iteration 1 :
  Arc    | dist avant | Calcul       | dist apres
  (A,B)  | B: inf     | 0+6=6 < inf  | B: 6
  (A,C)  | C: inf     | 0+7=7 < inf  | C: 7
  (B,C)  | C: 7       | 6+5=11 > 7   | C: 7
  (B,D)  | D: inf     | 6+(-4)=2     | D: 2
  (C,D)  | D: 2       | 7+(-3)=4 > 2 | D: 2
  (D,B)  | B: 6       | 2+2=4 < 6    | B: 4

Iteration 2 :
  (A,B)  | B: 4       | 0+6=6 > 4    | B: 4
  (A,C)  | C: 7       | 0+7=7        | C: 7
  (B,C)  | C: 7       | 4+5=9 > 7    | C: 7
  (B,D)  | D: 2       | 4+(-4)=0 < 2 | D: 0
  (C,D)  | D: 0       | 7+(-3)=4 > 0 | D: 0
  (D,B)  | B: 4       | 0+2=2 < 4    | B: 2

Iteration 3 :
  (B,D)  | D: 0       | 2+(-4)=-2<0  | D: -2
  (D,B)  | B: 2       | (-2)+2=0 < 2 | B: 0

Verification (iteration 4) :
  (B,D)  | 0+(-4)=-4 < -2 => AMELIORATION => CIRCUIT NEGATIF !

Circuit negatif : B->D->B de poids (-4)+2 = -2 < 0
```

### Complexite : O(n * m)

---

## 4. Algorithme de Floyd-Warshall

### Tous les couples de sommets, programmation dynamique

### Principe

Considerer les sommets un par un comme intermediaires. A l'etape k, on a les plus courts chemins utilisant {1,...,k} comme intermediaires.

### Pseudo-code

```
FloydWarshall(G):
    -- Initialisation
    Pour i de 1 a n:
        Pour j de 1 a n:
            Si i == j : dist[i][j] = 0
            Sinon si arc (i,j) : dist[i][j] = w(i,j)
            Sinon : dist[i][j] = infini

    -- BOUCLE k EXTERNE (crucial !)
    Pour k de 1 a n:
        Pour i de 1 a n:
            Pour j de 1 a n:
                Si dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    Retourner dist
```

### Exemple pas a pas

```
Graphe : A->B(3), A->C(8), B->C(2), C->A(5), B->A(-4)

Matrice initiale :
      A    B    C
A [   0    3    8  ]
B [  -4    0    2  ]
C [   5   inf   0  ]

k=A (intermediaire A) :
  dist[B][C] = min(2, -4+8) = min(2, 4) = 2   (pas de changement)
  dist[C][B] = min(inf, 5+3) = 8               (amelioration !)

      A    B    C
A [   0    3    8  ]
B [  -4    0    2  ]
C [   5    8    0  ]

k=B (intermediaire B) :
  dist[A][C] = min(8, 3+2) = 5                 (amelioration !)
  dist[C][A] = min(5, 8+(-4)) = min(5, 4) = 4  (amelioration !)

      A    B    C
A [   0    3    5  ]
B [  -4    0    2  ]
C [   4    8    0  ]

k=C (intermediaire C) :
  dist[A][B] = min(3, 5+8) = 3   (pas de changement)
  dist[B][A] = min(-4, 2+4) = -4 (pas de changement)

Resultat final :
      A    B    C
A [   0    3    5  ]
B [  -4    0    2  ]
C [   4    8    0  ]

Diagonale : 0, 0, 0 => pas de circuit negatif.
```

### Detection de circuits negatifs

Si dist[i][i] < 0 apres execution, il existe un circuit negatif passant par i.

### Complexite : O(n^3) temps, O(n^2) espace

---

## 5. Cas particulier : DAG

Pour un graphe oriente acyclique, plus courts chemins en O(n + m) :

```
PlusCourtCheminDAG(G, s):
    Tri topologique de G
    dist(v) = infini pour tout v, dist(s) = 0

    Pour chaque sommet u dans l'ordre topologique:
        Pour chaque successeur v de u:
            Si dist(u) + w(u,v) < dist(v):
                dist(v) = dist(u) + w(u,v)

    Retourner dist
```

---

## 6. Guide de choix

| Situation | Algorithme | Complexite |
|-----------|-----------|-----------|
| Poids >= 0, source unique | **Dijkstra** | O(m log n) |
| Poids quelconques, source unique | **Bellman-Ford** | O(nm) |
| Tous les couples | **Floyd-Warshall** | O(n^3) |
| DAG, source unique | Tri topo + relaxation | O(n+m) |
| Non pondere | **BFS** | O(n+m) |

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  PLUS COURTS CHEMINS -- RESUME                                   |
+------------------------------------------------------------------+
|                                                                  |
|  DIJKSTRA (poids >= 0) :                                         |
|    1. dist(s)=0, dist(v)=inf                                     |
|    2. Repeter n fois : choisir u non visite de dist min          |
|    3. Pour chaque voisin v : relaxer si dist(u)+w(u,v) < dist(v)|
|    Complexite : O(n^2) tableau, O(m log n) tas                   |
|                                                                  |
|  BELLMAN-FORD (poids quelconques) :                              |
|    1. dist(s)=0, dist(v)=inf                                     |
|    2. n-1 iterations : relaxer TOUS les arcs                     |
|    3. n-eme iteration : si amelioration => circuit negatif       |
|    Complexite : O(nm)                                            |
|                                                                  |
|  FLOYD-WARSHALL (tous les couples) :                             |
|    Pour k, i, j : dist[i][j] = min(dist[i][j], dist[i][k]+...)  |
|    BOUCLE k = EXTERNE (crucial !)                                |
|    Circuit negatif si dist[i][i] < 0                             |
|    Complexite : O(n^3)                                           |
|                                                                  |
|  PIEGES :                                                        |
|    - Dijkstra + poids negatifs = FAUX                            |
|    - Oublier dist(s)=0 a l'init                                  |
|    - Floyd-Warshall : k en boucle INTERNE = FAUX                 |
|    - Confondre ACM et plus court chemin                          |
|    - Oublier la detection de circuit negatif (Bellman-Ford)      |
+------------------------------------------------------------------+
```
