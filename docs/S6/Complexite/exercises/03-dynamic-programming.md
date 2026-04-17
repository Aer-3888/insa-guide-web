---
title: "Exercices -- Programmation dynamique"
sidebar_position: 3
---

# Exercices -- Programmation dynamique

> Chaque table est remplie cellule par cellule. En DS, le probleme de prog. dyn. vaut 10 a 14 points. Les exercices suivent le tutorial "session 2 (dynamic programming and greedy)".

---

## Exercice 1 : Chemin minimal dans une matrice -- table complete (session 2)

**Enonce :** Matrice 4x4, aller de (0,0) a (3,3), droite ou bas uniquement. Minimiser la somme.

```
Matrice a :
1  3  1  2
1  5  1  1
4  2  1  3
2  1  4  1
```

### Recurrence

```
dp[0][0] = a[0][0]
dp[i][0] = dp[i-1][0] + a[i][0]          (premiere colonne : venir d'en haut)
dp[0][j] = dp[0][j-1] + a[0][j]          (premiere ligne : venir de la gauche)
dp[i][j] = a[i][j] + min(dp[i-1][j], dp[i][j-1])
```

### Remplissage cellule par cellule

**Premiere ligne (i=0) :**

```
dp[0][0] = 1
dp[0][1] = 1 + 3 = 4
dp[0][2] = 4 + 1 = 5
dp[0][3] = 5 + 2 = 7
```

**Premiere colonne (j=0) :**

```
dp[1][0] = 1 + 1 = 2
dp[2][0] = 2 + 4 = 6
dp[3][0] = 6 + 2 = 8
```

**Ligne 1 :**

```
dp[1][1] = 5 + min(4, 2) = 5 + 2 = 7
dp[1][2] = 1 + min(5, 7) = 1 + 5 = 6
dp[1][3] = 1 + min(7, 6) = 1 + 6 = 7
```

**Ligne 2 :**

```
dp[2][1] = 2 + min(7, 6) = 2 + 6 = 8
dp[2][2] = 1 + min(6, 8) = 1 + 6 = 7
dp[2][3] = 3 + min(7, 7) = 3 + 7 = 10
```

**Ligne 3 :**

```
dp[3][1] = 1 + min(8, 8) = 1 + 8 = 9
dp[3][2] = 4 + min(7, 9) = 4 + 7 = 11
dp[3][3] = 1 + min(10, 11) = 1 + 10 = 11
```

**Table dp complete :**

```
 1   4   5   7
 2   7   6   7
 6   8   7  10
 8   9  11  11
```

**Cout minimal = dp[3][3] = 11.**

### Reconstruction du chemin

```
(3,3) = 11 : vient de (2,3)=10 car 10 < 11
(2,3) = 10 : vient de (2,2)=7 car 7 = 7 (egalite, choix gauche)
(2,2) = 7  : vient de (1,2)=6 car 6 < 8
(1,2) = 6  : vient de (0,2)=5 car 5 < 7
(0,2) = 5  : vient de (0,1)=4
(0,1) = 4  : vient de (0,0)=1
```

Chemin : (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) -> (2,3) -> (3,3).

Verification : 1 + 3 + 1 + 1 + 1 + 3 + 1 = 11. Correct.

### Pourquoi le glouton n'est PAS optimal

Le glouton (toujours choisir la case adjacente de plus petite valeur) echoue :

```
Matrice :
1    1   100
1   100     1
1     1     1

Glouton : 1 + 1 + 100 + 1 + 1 = 104
Optimal : (0,0)->(1,0)->(2,0)->(2,1)->(2,2) = 1+1+1+1+1 = 5
```

Le glouton echoue car il ne "voit" pas que le premier pas vers le bas mene a un chemin globalement bien meilleur.

---

## Exercice 2 : Plus longue sous-sequence commune -- LCS (session 2, Q1)

**Enonce :** Trouver la LCS de A = "ABCBDAB" et B = "BDCAB". Complexite : O(n*m).

### Recurrence

```
c(i, 0) = 0, c(0, j) = 0
c(i, j) = c(i-1, j-1) + 1           si A[i] == B[j]
c(i, j) = max(c(i-1, j), c(i, j-1))  sinon
```

### Remplissage

```
        ""  B  D  C  A  B
   ""  [ 0  0  0  0  0  0 ]
    A  [ 0  0  0  0  1  1 ]
    B  [ 0  1  1  1  1  2 ]
    C  [ 0  1  1  2  2  2 ]
    B  [ 0  1  1  2  2  3 ]
    D  [ 0  1  2  2  2  3 ]
    A  [ 0  1  2  2  3  3 ]
    B  [ 0  1  2  2  3  4 ]
```

**LCS = c(7,5) = 4.**

### Reconstruction

On remonte depuis (7,5) :

```
(7,5) : A[7]=B, B[5]=B. Match! Inclure B. Aller a (6,4).
(6,4) : A[6]=A, B[4]=A. Match! Inclure A. Aller a (5,3).
(5,3) : A[5]=D, B[3]=C. Pas match. max(c(4,3), c(5,2)) = max(2,2). Aller a (4,3).
(4,3) : A[4]=B, B[3]=C. Pas match. max(c(3,3), c(4,2)) = max(2,1). Aller a (3,3).
(3,3) : A[3]=C, B[3]=C. Match! Inclure C. Aller a (2,2).
(2,2) : A[2]=B, B[2]=D. Pas match. max(c(1,2), c(2,1)) = max(0,1). Aller a (2,1).
(2,1) : A[2]=B, B[1]=B. Match! Inclure B. Aller a (1,0).
(1,0) : fin.
```

**LCS = "BCAB" (lu a l'envers : B, C, A, B).**

**Complexite :** O(n*m) en temps et espace. Optimisable a O(min(n,m)) en espace si on ne reconstruit pas.

---

## Exercice 3 : Plus longue sous-sequence croissante -- LIS (session 2, Q2)

**Enonce :** Trouver la LIS de la sequence S = [3, 1, 4, 1, 5, 9, 2, 6]. Complexite : O(n^2) puis O(n log n).

### Algorithme O(n^2)

```
dp[i] = longueur de la LIS se terminant a S[i]
dp[i] = 1 + max(dp[j] pour j < i tel que S[j] < S[i])
dp[i] = 1 si aucun tel j n'existe
```

**Deroulement :**

```
S  = [3, 1, 4, 1, 5, 9, 2, 6]
i=0 : S[0]=3. Aucun predecesseur. dp[0] = 1.
i=1 : S[1]=1. Aucun j < 1 avec S[j] < 1. dp[1] = 1.
i=2 : S[2]=4. S[0]=3 < 4 : dp[0]+1=2. S[1]=1 < 4 : dp[1]+1=2. dp[2] = 2.
i=3 : S[3]=1. Aucun j < 3 avec S[j] < 1. dp[3] = 1.
i=4 : S[4]=5. S[0]=3<5: dp[0]+1=2. S[1]=1<5: 2. S[2]=4<5: dp[2]+1=3. S[3]=1<5: 2. dp[4] = 3.
i=5 : S[5]=9. S[4]=5<9: dp[4]+1=4. dp[5] = 4.
i=6 : S[6]=2. S[1]=1<2: dp[1]+1=2. S[3]=1<2: 2. dp[6] = 2.
i=7 : S[7]=6. S[0]=3<6: 2. S[2]=4<6: 3. S[4]=5<6: dp[4]+1=4. S[6]=2<6: 3. dp[7] = 4.

dp = [1, 1, 2, 1, 3, 4, 2, 4]
```

**LIS de longueur 4.** Une LIS possible : [1, 4, 5, 9] ou [1, 4, 5, 6] ou [3, 4, 5, 9].

### Algorithme O(n log n) -- Patience Sorting

On maintient un tableau `tails` ou tails[i] = plus petit element terminal d'une sous-sequence croissante de longueur i+1.

```
S  = [3, 1, 4, 1, 5, 9, 2, 6]

Traitement 3 : tails = [3]                   (nouvelle LIS de longueur 1)
Traitement 1 : 1 < 3, remplace. tails = [1]  (LIS de longueur 1 peut terminer par 1)
Traitement 4 : 4 > 1, append. tails = [1, 4] (LIS de longueur 2)
Traitement 1 : 1 <= 1, remplace. tails = [1, 4] (pas de changement)
Traitement 5 : 5 > 4, append. tails = [1, 4, 5]
Traitement 9 : 9 > 5, append. tails = [1, 4, 5, 9]
Traitement 2 : 2 entre 1 et 4, remplace 4. tails = [1, 2, 5, 9]
Traitement 6 : 6 entre 5 et 9, remplace 9. tails = [1, 2, 5, 6]
```

**LIS = len(tails) = 4.** Chaque insertion utilise une recherche binaire : O(log n). Total : **O(n log n)**.

Note : tails ne donne PAS la LIS elle-meme, seulement sa longueur. Pour reconstruire, il faut garder les predecesseurs.

---

## Exercice 4 : Multiplication de n matrices -- table complete

**Enonce :** Matrices M1(10x30), M2(30x5), M3(5x60), M4(60x10). Trouver le parenthesage optimal.

### Donnees

p = [10, 30, 5, 60, 10]. Matrice Mi a dimensions p[i-1] x p[i].

Formule : m[i][j] = min_{k=i..j-1} { m[i][k] + m[k+1][j] + p[i-1]*p[k]*p[j] }

### Remplissage par diagonales

**Diagonale 0 (une seule matrice) :** m[i][i] = 0 pour tout i.

**Diagonale 1 (deux matrices) :**

```
m[1][2] = 0 + 0 + 10*30*5 = 1500
m[2][3] = 0 + 0 + 30*5*60 = 9000
m[3][4] = 0 + 0 + 5*60*10 = 3000
```

**Diagonale 2 (trois matrices) :**

```
m[1][3] : k=1: 0+9000+10*30*60=27000. k=2: 1500+0+10*5*60=4500. min = 4500 (k*=2).
m[2][4] : k=2: 0+3000+30*5*10=4500. k=3: 9000+0+30*60*10=27000. min = 4500 (k*=2).
```

**Diagonale 3 (quatre matrices) :**

```
m[1][4] : k=1: 0+4500+10*30*10=7500. k=2: 1500+3000+10*5*10=5000. k=3: 4500+0+10*60*10=10500.
          min = 5000 (k*=2).
```

**Table m complete :**

```
        j=1    j=2    j=3    j=4
i=1  [  0    1500   4500   5000 ]
i=2  [  -      0    9000   4500 ]
i=3  [  -      -       0   3000 ]
i=4  [  -      -       -      0 ]
```

**Parenthesage optimal :** (M1*M2) * (M3*M4). Cout = 1500 + 3000 + 500 = 5000.

Complexite de l'algorithme : O(n^3) en temps, O(n^2) en espace.

---

## Exercice 5 : Distance d'edition -- table complete

**Enonce :** Distance d'edition entre "BRUIT" et "BUT" avec couts unitaires.

### Table complete

```
          ""   B   U   T
    ""  [  0   1   2   3 ]
    B   [  1   0   1   2 ]
    R   [  2   1   1   2 ]
    U   [  3   2   1   2 ]
    I   [  4   3   2   2 ]
    T   [  5   4   3   2 ]
```

**Distance = c(5,3) = 2.** Operations : supprimer R, supprimer I. BRUIT -> BUIT -> BUT.

---

## Exercice 6 : Fibonacci -- arbre d'appels et redondances

### Arbre des appels pour fibo(5)

```
                         fibo(5)
                        /        \
                   fibo(4)        fibo(3)
                  /      \        /      \
             fibo(3)   fibo(2)  fibo(2)  fibo(1)
             /    \     /    \    /    \     |
         fibo(2) fibo(1) f(1) f(0) f(1) f(0)  1
          /  \     |
       f(1) f(0)   1
```

### Comptage des redondances

```
fibo(5) : 1 fois
fibo(4) : 1 fois
fibo(3) : 2 fois    (REDONDANT)
fibo(2) : 3 fois    (REDONDANT)
fibo(1) : 5 fois    (REDONDANT)
fibo(0) : 3 fois    (REDONDANT)

Total d'appels : 15
Appels uniques  :  6
Appels gaspilles: 9 (60% du travail est redondant)
```

Avec memoisation ou approche iterative : O(n).

---

## Schema type DS -- patron recurrent

```
Q1 (2 pts) : Comprendre le probleme, donner un exemple numerique
Q2 (3 pts) : Justifier la formule de recurrence, ecrire les cas de base
Q3 (2 pts) : Ecrire l'algorithme recursif naif
Q4 (2 pts) : Dessiner l'arbre des appels, entourer les redondances
Q5 (1 pt)  : Complexite de l'algo naif (exponentielle)
Q6 (3 pts) : Proposer l'algo bottom-up, donner sa complexite
Q7 (1 pt)  : (Bonus) Reconstituer la solution optimale
```
