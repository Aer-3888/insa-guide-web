---
title: "Exercices -- Roy-Warshall et routage (TD 2)"
sidebar_position: 2
---

# Exercices -- Roy-Warshall et routage (TD 2)

> Chaque iteration de l'algorithme est montree avec la matrice complete. Chaque cellule modifiee est justifiee.

---

## Exercice 1 : Algorithme de Roy-Warshall

**Enonce (TD 2) :** Soit le graphe G suivant a 7 sommets. Derouler l'algorithme de Roy-Warshall sur ce graphe represente par sa matrice d'adjacence.

**Graphe (lu depuis la figure du TD) :**

```
    1 -----> 3
    |       / \
    v      v   v
    2 <-- 4 --> 5
    |           |
    v           v
    6 <-------- 7
         ^
         |
    (1 -> 2, 1 -> 3)
    (2 -> 4)
    (3 -> 5)
    (4 -> 3, 4 -> 5)
    (5 -> 6, 5 -> 7)
    (6 -> (rien))
    (7 -> 6)
```

Arcs exacts du graphe du TD (7 sommets) :

```
1 -> 3, 4
2 -> 1, 7
3 -> 5
4 -> 2, 3
5 -> (rien)
6 -> 5
7 -> 6
```

### Matrice d'adjacence initiale M(0)

```
    1  2  3  4  5  6  7
1 [ 0  0  1  1  0  0  0 ]
2 [ 1  0  0  0  0  0  1 ]
3 [ 0  0  0  0  1  0  0 ]
4 [ 0  1  1  0  0  0  0 ]
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  1  0  0 ]
7 [ 0  0  0  0  0  1  0 ]
```

### Principe de Roy-Warshall

A l'iteration k, on calcule M(k) : M(k)[i][j] = 1 ssi il existe un chemin de i a j passant uniquement par des sommets intermediaires dans {1, 2, ..., k}.

**Regle :** M(k)[i][j] = M(k-1)[i][j] OU (M(k-1)[i][k] ET M(k-1)[k][j])

En mots : "il existe un chemin de i a j via {1..k}" si soit "il existait deja via {1..k-1}", soit "on peut aller de i a k via {1..k-1} puis de k a j via {1..k-1}".

### Iteration k = 1 (pivot = sommet 1)

Pour chaque (i, j) : M(1)[i][j] = M(0)[i][j] OU (M(0)[i][1] ET M(0)[1][j])

Quels sommets ont un arc vers 1 ? Colonne 1 : M(0)[2][1] = 1. Donc seule la ligne 2 peut etre modifiee.

Successeurs de 1 : M(0)[1][3] = 1, M(0)[1][4] = 1.

```
Ligne 2 : M(0)[2][1]=1, donc on ajoute les successeurs de 1 :
  M(1)[2][3] = M(0)[2][3] OU (M(0)[2][1] AND M(0)[1][3]) = 0 OU (1 AND 1) = 1  <- NOUVEAU
  M(1)[2][4] = M(0)[2][4] OU (M(0)[2][1] AND M(0)[1][4]) = 0 OU (1 AND 1) = 1  <- NOUVEAU
```

**M(1) :** (modifications en majuscules)

```
    1  2  3  4  5  6  7
1 [ 0  0  1  1  0  0  0 ]
2 [ 1  0 *1 *1  0  0  1 ]    <- 2 atteint 3 et 4 via 1
3 [ 0  0  0  0  1  0  0 ]
4 [ 0  1  1  0  0  0  0 ]
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  1  0  0 ]
7 [ 0  0  0  0  0  1  0 ]
```

### Iteration k = 2 (pivot = sommet 2)

Predecesseurs de 2 : M(1)[4][2] = 1. Ligne 4 modifiee.
Successeurs de 2 (ligne 2 de M(1)) : 1, 3, 4, 7.

```
Ligne 4 : M(1)[4][2]=1
  M(2)[4][1] = 0 OU (1 AND M(1)[2][1]) = 0 OU 1 = 1  <- NOUVEAU
  M(2)[4][3] = 1 OU ... = 1 (deja)
  M(2)[4][4] = 0 OU (1 AND M(1)[2][4]) = 0 OU 1 = 1  <- NOUVEAU (boucle)
  M(2)[4][7] = 0 OU (1 AND M(1)[2][7]) = 0 OU 1 = 1  <- NOUVEAU
```

**M(2) :**

```
    1  2  3  4  5  6  7
1 [ 0  0  1  1  0  0  0 ]
2 [ 1  0  1  1  0  0  1 ]
3 [ 0  0  0  0  1  0  0 ]
4 [*1  1  1 *1  0  0 *1 ]    <- 4 atteint 1, se boucle, atteint 7 via 2
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  1  0  0 ]
7 [ 0  0  0  0  0  1  0 ]
```

### Iteration k = 3 (pivot = sommet 3)

Predecesseurs de 3 : M(2)[1][3]=1, M(2)[2][3]=1, M(2)[4][3]=1. Lignes 1, 2, 4.
Successeurs de 3 : M(2)[3][5]=1.

```
Ligne 1 : M(2)[1][3]=1
  M(3)[1][5] = 0 OU (1 AND 1) = 1  <- NOUVEAU

Ligne 2 : M(2)[2][3]=1
  M(3)[2][5] = 0 OU (1 AND 1) = 1  <- NOUVEAU

Ligne 4 : M(2)[4][3]=1
  M(3)[4][5] = 0 OU (1 AND 1) = 1  <- NOUVEAU
```

**M(3) :**

```
    1  2  3  4  5  6  7
1 [ 0  0  1  1 *1  0  0 ]    <- 1 atteint 5 via 3
2 [ 1  0  1  1 *1  0  1 ]    <- 2 atteint 5 via 3
3 [ 0  0  0  0  1  0  0 ]
4 [ 1  1  1  1 *1  0  1 ]    <- 4 atteint 5 via 3
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  1  0  0 ]
7 [ 0  0  0  0  0  1  0 ]
```

### Iteration k = 4 (pivot = sommet 4)

Predecesseurs de 4 : M(3)[1][4]=1, M(3)[2][4]=1, M(3)[4][4]=1. Lignes 1, 2.
Successeurs de 4 (ligne 4) : 1, 2, 3, 4, 5, 7.

```
Ligne 1 : M(3)[1][4]=1. Ajout des successeurs de 4 :
  M(4)[1][1] = 0 OU 1 = 1  <- boucle NOUVEAU
  M(4)[1][2] = 0 OU 1 = 1  <- NOUVEAU
  M(4)[1][7] = 0 OU 1 = 1  <- NOUVEAU

Ligne 2 : M(3)[2][4]=1
  M(4)[2][2] = 0 OU 1 = 1  <- boucle NOUVEAU
```

**M(4) :**

```
    1  2  3  4  5  6  7
1 [*1 *1  1  1  1  0 *1 ]    <- 1 atteint 2, se boucle, atteint 7 via 4
2 [ 1 *1  1  1  1  0  1 ]    <- 2 boucle via 4
3 [ 0  0  0  0  1  0  0 ]
4 [ 1  1  1  1  1  0  1 ]
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  1  0  0 ]
7 [ 0  0  0  0  0  1  0 ]
```

### Iteration k = 5 (pivot = sommet 5)

Predecesseurs de 5 : M(4)[1][5]=1, M(4)[2][5]=1, M(4)[3][5]=1, M(4)[4][5]=1, M(4)[6][5]=1.
Successeurs de 5 : aucun (ligne 5 toute a 0 sauf M[5][5]=0).

Aucune modification. M(5) = M(4).

### Iteration k = 6 (pivot = sommet 6)

Predecesseurs de 6 : M(5)[7][6]=1.
Successeurs de 6 : M(5)[6][5]=1.

```
Ligne 7 : M(5)[7][6]=1
  M(6)[7][5] = 0 OU (1 AND M(5)[6][5]) = 0 OU 1 = 1  <- NOUVEAU
```

**M(6) :**

```
    1  2  3  4  5  6  7
1 [ 1  1  1  1  1  0  1 ]
2 [ 1  1  1  1  1  0  1 ]
3 [ 0  0  0  0  1  0  0 ]
4 [ 1  1  1  1  1  0  1 ]
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  1  0  0 ]
7 [ 0  0  0  0 *1  1  0 ]    <- 7 atteint 5 via 6
```

### Iteration k = 7 (pivot = sommet 7)

Predecesseurs de 7 : M(6)[1][7]=1, M(6)[2][7]=1, M(6)[4][7]=1.
Successeurs de 7 : M(6)[7][5]=1, M(6)[7][6]=1.

```
Ligne 1 : ajout 5 (deja), 6
  M(7)[1][6] = 0 OU (1 AND 1) = 1  <- NOUVEAU

Ligne 2 : ajout 5 (deja), 6
  M(7)[2][6] = 0 OU (1 AND 1) = 1  <- NOUVEAU

Ligne 4 : ajout 5 (deja), 6
  M(7)[4][6] = 0 OU (1 AND 1) = 1  <- NOUVEAU
```

### Matrice de fermeture transitive M* = M(7)

```
    1  2  3  4  5  6  7
1 [ 1  1  1  1  1 *1  1 ]    <- 1 atteint tout le monde
2 [ 1  1  1  1  1 *1  1 ]    <- 2 atteint tout le monde
3 [ 0  0  0  0  1  0  0 ]    <- 3 n'atteint que 5
4 [ 1  1  1  1  1 *1  1 ]    <- 4 atteint tout le monde
5 [ 0  0  0  0  0  0  0 ]    <- 5 n'atteint personne
6 [ 0  0  0  0  1  0  0 ]    <- 6 n'atteint que 5
7 [ 0  0  0  0  1  1  0 ]    <- 7 atteint 5 et 6
```

**Interpretation :** Depuis les sommets {1, 2, 4}, on peut atteindre tous les autres sommets. Les sommets 3, 5, 6, 7 sont des "culs-de-sac" partiels.

---

## Exercice 2 : Numerotation conforme

**Enonce (TD 2) :** Soit un graphe G sans circuit, avec une numerotation conforme. Montrer qu'on peut tirer parti de cette numerotation pour simplifier les operations Q de l'algorithme de Roy-Warshall. Donner la complexite.

### Solution

Si G est sans circuit et a une numerotation conforme, alors pour tout arc (x, y) : nu(x) < nu(y).

**Consequence pour Roy-Warshall :** Dans une numerotation conforme, si on renummerote les sommets selon nu, la matrice d'adjacence est **triangulaire superieure** (tous les 1 sont au-dessus de la diagonale).

**Simplification :** A l'iteration k (pivot k), on cherche i tel que M[i][k]=1 et j tel que M[k][j]=1. Avec la numerotation conforme :
- M[i][k] = 1 => i < k (arc de i vers k)
- M[k][j] = 1 => k < j (arc de k vers j)

Donc a l'iteration k :
- On ne modifie que les lignes i < k
- On ne modifie que les colonnes j > k
- Pas de boucles possibles (la diagonale reste a 0)

**Complexite amelioree :** L'algorithme ne considere que les paires (i, j) avec i < k < j. Cela divise environ par 4 le nombre d'operations (on travaille sur un quart de la matrice au lieu de toute la matrice).

La complexite reste O(n^3) dans le pire cas, mais avec un facteur constant plus petit.

---

## Exercice 3 : Routage avec Roy-Warshall

**Enonce (TD 2) :** La fermeture transitive traduit l'existence de chemins elementaires dans le graphe. On veut maintenant savoir lequel. Adapter l'algorithme de Roy-Warshall pour qu'il calcule une **matrice de routage** R qui permettra de construire un chemin elementaire entre deux sommets quelconques.

### Principe du routage

Au lieu de stocker juste 0/1 (existence d'un chemin), on stocke **par ou passer** pour aller de i a j.

**Deux variantes :**

#### Variante 1 : Routage par etapes intermediaires

R1[i][j] = dernier sommet intermediaire k utilise pour etablir le chemin de i a j.

**Initialisation :**

```
SI M[i][j] == 1 ALORS R1[i][j] = j    // arc direct, aller directement a j
SINON R1[i][j] = -1                    // pas de chemin connu
```

**Mise a jour (iteration k) :** Quand on decouvre un nouveau chemin i -> k -> j :

```
SI M(k-1)[i][j] == 0 ET M(k-1)[i][k] == 1 ET M(k-1)[k][j] == 1 ALORS
    M(k)[i][j] = 1
    R1[i][j] = k    // passer par k
```

**Reconstruction du chemin de i a j :**

```
chemin(i, j):
    SI R1[i][j] == j ALORS retourner (i, j)    // arc direct
    k = R1[i][j]
    retourner chemin(i, k) + chemin(k, j)       // concatener
```

#### Variante 2 : Routage par successeurs

R2[i][j] = premier sommet a emprunter pour aller de i a j.

**Initialisation :**

```
SI M[i][j] == 1 ALORS R2[i][j] = j    // arc direct
SINON R2[i][j] = 0                     // pas de chemin connu
```

**Mise a jour (iteration k) :**

```
SI M(k-1)[i][j] == 0 ET M(k-1)[i][k] == 1 ET M(k-1)[k][j] == 1 ALORS
    M(k)[i][j] = 1
    R2[i][j] = R2[i][k]    // pour aller de i a j, d'abord aller vers k
                            // en utilisant le meme premier pas que pour i->k
```

**Reconstruction du chemin de i a j :**

```
chemin(i, j):
    resultat = [i]
    courant = i
    TANT QUE courant != j FAIRE
        courant = R2[courant][j]
        resultat.append(courant)
    retourner resultat
```

### Application au graphe de l'exercice 1

**Initialisation de R2 (routage par successeurs) :**

```
    1  2  3  4  5  6  7
1 [ 0  0  3  4  0  0  0 ]
2 [ 1  0  0  0  0  0  7 ]
3 [ 0  0  0  0  5  0  0 ]
4 [ 0  2  3  0  0  0  0 ]
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  5  0  0 ]
7 [ 0  0  0  0  0  6  0 ]
```

**Apres Roy-Warshall complet -- Matrice R2 finale :**

Deroulement iteration par iteration :

```
k=1: Ligne 2 recoit les routes de 1. R2[2][3]=1, R2[2][4]=1.
k=2: Ligne 4 recoit les routes de 2. R2[4][1]=2, R2[4][7]=2.
k=3: Lignes 1,2,4 recoivent route vers 5 via 3. R2[1][5]=3, R2[2][5]=1, R2[4][5]=2.
k=4: Lignes 1,2 recoivent routes via 4. R2[1][2]=4, R2[1][7]=4.
k=5: pas de modif (5 n'a pas de successeur).
k=6: R2[7][5]=6.
k=7: R2[1][6]=4, R2[2][6]=1, R2[4][6]=2.
```

**R2 final :**

```
    1  2  3  4  5  6  7
1 [ 0  4  3  4  3  4  4 ]
2 [ 1  0  1  1  1  1  7 ]
3 [ 0  0  0  0  5  0  0 ]
4 [ 2  2  3  0  3  2  2 ]
5 [ 0  0  0  0  0  0  0 ]
6 [ 0  0  0  0  5  0  0 ]
7 [ 0  0  0  0  6  6  0 ]
```

**Exemples de reconstruction de chemins :**

```
Chemin de 1 a 6 :
  R2[1][6] = 4. Prochain = 4.
  R2[4][6] = 2. Prochain = 2.
  R2[2][6] = 7. Prochain = 7.
  R2[7][6] = 6. Prochain = 6. ARRIVE.
  
  Chemin : 1 -> 4 -> 2 -> 7 -> 6
  Verification : arcs (1,4), (4,2), (2,7), (7,6). Tous dans le graphe. OK.

Chemin de 2 a 5 :
  R2[2][5] = 1. Prochain = 1.
  R2[1][5] = 3. Prochain = 3.
  R2[3][5] = 5. Prochain = 5. ARRIVE.
  
  Chemin : 2 -> 1 -> 3 -> 5
  Verification : arcs (2,1), (1,3), (3,5). Tous dans le graphe. OK.

Chemin de 4 a 5 :
  R2[4][5] = 3. Prochain = 3.
  R2[3][5] = 5. ARRIVE.
  
  Chemin : 4 -> 3 -> 5
  Verification : arcs (4,3), (3,5). Tous dans le graphe. OK.
```

**Tous les chemins reconstruits sont des chemins elementaires dans le graphe original.**

---

## Tableau recapitulatif des algorithmes

| Algorithme | Entree | Sortie | Complexite |
|-----------|--------|--------|-----------|
| Roy-Warshall (existence) | M adjacence | M* fermeture transitive | O(n^3) |
| Roy-Warshall + routage intermediaire | M adjacence | M*, R1 | O(n^3) |
| Roy-Warshall + routage successeurs | M adjacence | M*, R2 | O(n^3) |
| Reconstruction chemin | R2, (i, j) | chemin i -> j | O(longueur chemin) |
| Version conforme | M triangulaire | M* | O(n^3) mais facteur /4 |
