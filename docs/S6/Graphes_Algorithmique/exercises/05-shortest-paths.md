---
title: "Exercices -- Warshall value et chemins optimaux (TD 5)"
sidebar_position: 5
---

# Exercices -- Warshall value et chemins optimaux (TD 5)

> Chaque algorithme est deroule avec toutes les matrices intermediaires. Chaque cellule modifiee est expliquee.

---

## Exercice 1 : Chemins de cout minimum (Warshall value)

**Enonce (TD 5) :** Adapter l'algorithme de Roy-Warshall pour la recherche d'un chemin de cout minimum entre tout couple de sommets avec routage.

L'algorithme modifie doit calculer deux matrices carrees :
- **V** : matrice des couts minimaux. V[i][j] = cout du plus court chemin de i a j.
- **R** : matrice de routage par successeurs. R[i][j] = premier sommet a emprunter pour aller de i a j par le chemin optimal.

### Principe de l'algorithme (Floyd-Warshall value)

**Initialisation :**

```
V(0)[i][j] = poids de l'arc (i,j)   si l'arc existe
V(0)[i][j] = +inf                    sinon
V(0)[i][i] = 0                       diagonale

R(0)[i][j] = j     si l'arc (i,j) existe
R(0)[i][j] = 0     sinon
```

**Iteration k :** Pour chaque couple (i, j), on verifie si passer par k ameliore :

```
SI V(k-1)[i][k] + V(k-1)[k][j] < V(k-1)[i][j] ALORS
    V(k)[i][j] = V(k-1)[i][k] + V(k-1)[k][j]
    R(k)[i][j] = R(k-1)[i][k]     // pour aller de i a j, d'abord aller vers k
SINON
    V(k)[i][j] = V(k-1)[i][j]
    R(k)[i][j] = R(k-1)[i][j]
```

### Application au graphe du TD 5

**Graphe (lu depuis la figure) :** 6 sommets, arcs values :

```
     1 ---5---> 3
     |         / \
     2        3   4
     |       /     \
     v      v       v
     2 <---1--- 4   5
     |           |
     7           2
     |           |
     v           v
     6 <---3---- 5
           
Arcs et poids :
  1 -> 2 : 2
  1 -> 3 : 5
  2 -> 6 : 7
  3 -> 4 : 3
  3 -> 5 : 4
  4 -> 2 : 1
  4 -> 5 : 2
  5 -> 6 : 3
```

### Matrice V(0) -- Initialisation

```
    1     2     3     4     5     6
1 [ 0     2     5    inf   inf   inf  ]
2 [ inf   0    inf   inf   inf    7   ]
3 [ inf  inf    0     3     4    inf  ]
4 [ inf   1    inf    0     2    inf  ]
5 [ inf  inf   inf   inf    0     3   ]
6 [ inf  inf   inf   inf   inf    0   ]
```

### Matrice R(0) -- Initialisation

```
    1  2  3  4  5  6
1 [ 0  2  3  0  0  0 ]
2 [ 0  0  0  0  0  6 ]
3 [ 0  0  0  4  5  0 ]
4 [ 0  2  0  0  5  0 ]
5 [ 0  0  0  0  0  6 ]
6 [ 0  0  0  0  0  0 ]
```

### Iteration k = 1 (pivot = sommet 1)

Quels sommets atteignent 1 ? Aucun (colonne 1 toute a inf sauf V[1][1]=0). Aucune modification.

**V(1) = V(0), R(1) = R(0).**

### Iteration k = 2 (pivot = sommet 2)

Quels sommets atteignent 2 ? V[1][2] = 2, V[4][2] = 1.
Successeurs de 2 : V[2][6] = 7.

```
Ligne 1 : V[1][2]+V[2][6] = 2+7 = 9 < V[1][6]=inf.
  V(2)[1][6] = 9, R(2)[1][6] = R[1][2] = 2.

Ligne 4 : V[4][2]+V[2][6] = 1+7 = 8 < V[4][6]=inf.
  V(2)[4][6] = 8, R(2)[4][6] = R[4][2] = 2.
```

**V(2) :**

```
    1     2     3     4     5     6
1 [ 0     2     5    inf   inf   *9   ]    <- 1->6 via 2, cout 9
2 [ inf   0    inf   inf   inf    7   ]
3 [ inf  inf    0     3     4    inf  ]
4 [ inf   1    inf    0     2    *8   ]    <- 4->6 via 2, cout 8
5 [ inf  inf   inf   inf    0     3   ]
6 [ inf  inf   inf   inf   inf    0   ]
```

### Iteration k = 3 (pivot = sommet 3)

Qui atteint 3 ? V[1][3] = 5.
Successeurs de 3 : V[3][4] = 3, V[3][5] = 4.

```
Ligne 1 : 
  V[1][3]+V[3][4] = 5+3 = 8 < V[1][4]=inf.  V(3)[1][4] = 8, R(3)[1][4] = R[1][3] = 3.
  V[1][3]+V[3][5] = 5+4 = 9 < V[1][5]=inf.  V(3)[1][5] = 9, R(3)[1][5] = R[1][3] = 3.
```

**V(3) :**

```
    1     2     3     4     5     6
1 [ 0     2     5    *8    *9     9   ]
2 [ inf   0    inf   inf   inf    7   ]
3 [ inf  inf    0     3     4    inf  ]
4 [ inf   1    inf    0     2     8   ]
5 [ inf  inf   inf   inf    0     3   ]
6 [ inf  inf   inf   inf   inf    0   ]
```

### Iteration k = 4 (pivot = sommet 4)

Qui atteint 4 ? V[1][4] = 8, V[3][4] = 3.
Successeurs de 4 : V[4][2] = 1, V[4][5] = 2, V[4][6] = 8.

```
Ligne 1 :
  V[1][4]+V[4][2] = 8+1 = 9 > V[1][2]=2. Pas de changement.
  V[1][4]+V[4][5] = 8+2 = 10 > V[1][5]=9. Pas de changement.
  V[1][4]+V[4][6] = 8+8 = 16 > V[1][6]=9. Pas de changement.

Ligne 3 :
  V[3][4]+V[4][2] = 3+1 = 4 < V[3][2]=inf.  V(4)[3][2] = 4, R(4)[3][2] = R[3][4] = 4.
  V[3][4]+V[4][5] = 3+2 = 5 > V[3][5]=4.   Pas de changement.
  V[3][4]+V[4][6] = 3+8 = 11 < V[3][6]=inf. V(4)[3][6] = 11, R(4)[3][6] = R[3][4] = 4.
```

**V(4) :**

```
    1     2     3     4     5     6
1 [ 0     2     5     8     9     9   ]
2 [ inf   0    inf   inf   inf    7   ]
3 [ inf  *4     0     3     4    *11  ]
4 [ inf   1    inf    0     2     8   ]
5 [ inf  inf   inf   inf    0     3   ]
6 [ inf  inf   inf   inf   inf    0   ]
```

### Iteration k = 5 (pivot = sommet 5)

Qui atteint 5 ? V[1][5]=9, V[3][5]=4, V[4][5]=2.
Successeurs de 5 : V[5][6]=3.

```
Ligne 1 : V[1][5]+V[5][6] = 9+3 = 12 > V[1][6]=9. Pas de changement.
Ligne 3 : V[3][5]+V[5][6] = 4+3 = 7 < V[3][6]=11. V(5)[3][6] = 7, R(5)[3][6] = R[3][5] = 5.
Ligne 4 : V[4][5]+V[5][6] = 2+3 = 5 < V[4][6]=8.  V(5)[4][6] = 5, R(5)[4][6] = R[4][5] = 5.
```

**V(5) :**

```
    1     2     3     4     5     6
1 [ 0     2     5     8     9     9   ]
2 [ inf   0    inf   inf   inf    7   ]
3 [ inf   4     0     3     4    *7   ]
4 [ inf   1    inf    0     2    *5   ]
5 [ inf  inf   inf   inf    0     3   ]
6 [ inf  inf   inf   inf   inf    0   ]
```

### Iteration k = 6 (pivot = sommet 6)

Qui atteint 6 ? V[1][6]=9, V[2][6]=7, V[3][6]=7, V[4][6]=5, V[5][6]=3.
Successeurs de 6 : aucun (ligne 6 toute a inf sauf diagonale). Aucune modification.

**V(6) = V(5). C'est la matrice finale.**

### Matrice finale des couts minimaux V*

```
    1     2     3     4     5     6
1 [ 0     2     5     8     9     9   ]
2 [ inf   0    inf   inf   inf    7   ]
3 [ inf   4     0     3     4     7   ]
4 [ inf   1    inf    0     2     5   ]
5 [ inf  inf   inf   inf    0     3   ]
6 [ inf  inf   inf   inf   inf    0   ]
```

### Matrice finale de routage R*

```
    1  2  3  4  5  6
1 [ 0  2  3  3  3  2 ]
2 [ 0  0  0  0  0  6 ]
3 [ 0  4  0  4  5  5 ]
4 [ 0  2  0  0  5  5 ]
5 [ 0  0  0  0  0  6 ]
6 [ 0  0  0  0  0  0 ]
```

### Reconstruction de chemins

```
Chemin de cout min de 1 a 6 (cout = 9) :
  R[1][6] = 2. Prochain = 2.
  R[2][6] = 6. Prochain = 6. ARRIVE.
  Chemin : 1 -> 2 -> 6 (cout : 2 + 7 = 9). OK.

Chemin de cout min de 1 a 5 (cout = 9) :
  R[1][5] = 3. Prochain = 3.
  R[3][5] = 5. Prochain = 5. ARRIVE.
  Chemin : 1 -> 3 -> 5 (cout : 5 + 4 = 9). OK.

Chemin de cout min de 3 a 6 (cout = 7) :
  R[3][6] = 5. Prochain = 5.
  R[5][6] = 6. Prochain = 6. ARRIVE.
  Chemin : 3 -> 5 -> 6 (cout : 4 + 3 = 7). OK.

Chemin de cout min de 1 a 4 (cout = 8) :
  R[1][4] = 3. Prochain = 3.
  R[3][4] = 4. Prochain = 4. ARRIVE.
  Chemin : 1 -> 3 -> 4 (cout : 5 + 3 = 8). OK.
```

---

## Exercice 2 : Generalisation a d'autres criteres

**Enonce (TD 5) :** Adapter l'algorithme de Roy-Warshall value aux problemes suivants :
- Chemins de **probabilite** minimale
- Chemins de **capacite maximale** (bottleneck)
- Chemins de **longueur minimale** (nombre d'arcs)

### 2a -- Probabilite minimale

**Contexte :** Chaque arc (i,j) a une probabilite p(i,j) dans [0,1]. La probabilite d'un chemin est le produit des probabilites. On cherche le chemin de probabilite maximale (ou minimale).

**Adaptation :** Remplacer l'addition par la multiplication et la comparaison min par max.

```
Initialisation :
  P[i][j] = p(i,j)    si l'arc existe
  P[i][j] = 0          sinon (probabilite 0 = pas de chemin)
  P[i][i] = 1          (probabilite d'etre sur soi-meme)

Iteration k :
  SI P[i][k] * P[k][j] > P[i][j] ALORS
      P[i][j] = P[i][k] * P[k][j]
```

### 2b -- Capacite maximale (bottleneck)

**Contexte :** Chaque arc (i,j) a une capacite c(i,j). La capacite d'un chemin est le minimum des capacites sur le chemin. On cherche le chemin de capacite maximale.

**Adaptation :** La "longueur" d'un chemin est le min des capacites. On veut maximiser ce min.

```
Initialisation :
  C[i][j] = c(i,j)    si l'arc existe
  C[i][j] = 0          sinon (aucune capacite)
  C[i][i] = +inf

Iteration k :
  SI min(C[i][k], C[k][j]) > C[i][j] ALORS
      C[i][j] = min(C[i][k], C[k][j])
```

### 2c -- Longueur minimale (nombre d'arcs)

**Adaptation :** Chaque arc a un poids de 1. C'est un cas particulier de Warshall value avec tous les poids a 1.

```
Initialisation :
  L[i][j] = 1     si l'arc existe
  L[i][j] = +inf  sinon
  L[i][i] = 0

Iteration k :
  SI L[i][k] + L[k][j] < L[i][j] ALORS
      L[i][j] = L[i][k] + L[k][j]
```

### Tableau recapitulatif des initialisations

| Critere | Operateur de chemin | Comparaison | Init diag | Init sans arc | Init avec arc |
|---------|-------------------|-------------|-----------|---------------|---------------|
| Cout min | + | < | 0 | +inf | poids |
| Probabilite max | * | > | 1 | 0 | p(i,j) |
| Capacite max | min | > | +inf | 0 | c(i,j) |
| Longueur min | + (poids=1) | < | 0 | +inf | 1 |

---

## Exercice 3 : Criteres en cascade

**Enonce (TD 5) :** Adapter l'algorithme pour combiner plusieurs criteres. Par exemple : trouver le chemin de cout minimum, et parmi ceux-ci, celui de longueur minimale (nombre d'arcs).

### Principe

On utilise un **critere lexicographique** : (cout, longueur). Le chemin (c1, l1) est meilleur que (c2, l2) si c1 < c2, ou si c1 = c2 et l1 < l2.

```
Initialisation :
  V[i][j] = (poids(i,j), 1)   si l'arc existe
  V[i][j] = (+inf, +inf)       sinon
  V[i][i] = (0, 0)

Iteration k :
  nouveau_cout = V[i][k].cout + V[k][j].cout
  nouvelle_longueur = V[i][k].longueur + V[k][j].longueur
  
  SI (nouveau_cout, nouvelle_longueur) < (V[i][j].cout, V[i][j].longueur) ALORS
      V[i][j] = (nouveau_cout, nouvelle_longueur)
      R[i][j] = R[i][k]
```

La comparaison est lexicographique : on compare d'abord les couts, puis en cas d'egalite les longueurs.

**Complexite :** Toujours O(n^3), les operations de comparaison sont O(1) (comparaison de paires).

---

## Resume des algorithmes

| Algorithme | Probleme | Complexite | Structure |
|-----------|---------|-----------|----------|
| Floyd-Warshall (Warshall value) | Tous les plus courts chemins | O(n^3) | 2 matrices V, R |
| Adaptation probabilite | Chemin le plus probable | O(n^3) | Multiplication |
| Adaptation capacite | Chemin de plus grande capacite | O(n^3) | Min-max |
| Cascade (lexicographique) | Multi-critere | O(n^3) | Paires |
| Dijkstra (rappel) | Plus court chemin depuis 1 source | O((n+m) log n) | File de priorite |
| Bellman-Ford (rappel) | Plus court chemin, poids negatifs | O(n*m) | Relaxation |
