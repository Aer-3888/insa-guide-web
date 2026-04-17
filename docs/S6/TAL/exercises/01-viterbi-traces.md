---
title: "Exercices -- Algorithme de Viterbi : Traces completes"
sidebar_position: 1
---

# Exercices -- Algorithme de Viterbi : Traces completes

---

## Exercice 1 : Viterbi complet (POS tagging, 3 etats, 3 mots)

### Enonce

Soit un HMM avec 3 etats {D (determinant), N (nom), V (verbe)} et la phrase "le chat mange".

**Distribution initiale** pi :
```
pi(D) = 0.6, pi(N) = 0.2, pi(V) = 0.2
```

**Matrice de transition A** (A[i][j] = P(etat j | etat i)) :
```
        D     N     V
  D   0.1   0.7   0.2
  N   0.1   0.1   0.8
  V   0.3   0.5   0.2
```

**Matrice d'emission B** :
```
        "le"    "chat"  "mange"
  D     0.8     0.01    0.01
  N     0.01    0.60    0.05
  V     0.01    0.01    0.80
```

**Trouver la sequence d'etiquettes la plus probable avec Viterbi.**

### Rappel : formule de Viterbi

```
Initialisation :  H(i, 1) = pi(i) * b_i(w_1)
Recursion :       H(i, k) = max_j [H(j, k-1) * a(j,i) * b_i(w_k)]
Terminaison :     meilleur dernier etat = argmax_i H(i, n)
Backtracking :    remonter les pointeurs pour trouver la sequence
```

### Solution pas a pas

**Etape 1 : Initialisation (k=1, mot "le")**

```
H(D, 1) = pi(D) * b_D("le") = 0.6 * 0.8  = 0.4800
H(N, 1) = pi(N) * b_N("le") = 0.2 * 0.01 = 0.0020
H(V, 1) = pi(V) * b_V("le") = 0.2 * 0.01 = 0.0020
```

| Etat | H(etat, 1) | Backpointer |
|------|-----------|-------------|
| D | **0.4800** | init |
| N | 0.0020 | init |
| V | 0.0020 | init |

**Etape 2 : Recursion (k=2, mot "chat")**

Pour chaque etat cible, on calcule le score en venant de chaque etat source :

**H(D, 2)** :
```
via D : H(D,1) * a(D,D) * b_D("chat") = 0.4800 * 0.1 * 0.01 = 0.000480
via N : H(N,1) * a(N,D) * b_D("chat") = 0.0020 * 0.1 * 0.01 = 0.000002
via V : H(V,1) * a(V,D) * b_D("chat") = 0.0020 * 0.3 * 0.01 = 0.000006
H(D, 2) = max = 0.000480 (via D)
```

**H(N, 2)** :
```
via D : H(D,1) * a(D,N) * b_N("chat") = 0.4800 * 0.7 * 0.60 = 0.201600
via N : H(N,1) * a(N,N) * b_N("chat") = 0.0020 * 0.1 * 0.60 = 0.000120
via V : H(V,1) * a(V,N) * b_N("chat") = 0.0020 * 0.5 * 0.60 = 0.000600
H(N, 2) = max = 0.201600 (via D)
```

**H(V, 2)** :
```
via D : H(D,1) * a(D,V) * b_V("chat") = 0.4800 * 0.2 * 0.01 = 0.000960
via N : H(N,1) * a(N,V) * b_V("chat") = 0.0020 * 0.8 * 0.01 = 0.000016
via V : H(V,1) * a(V,V) * b_V("chat") = 0.0020 * 0.2 * 0.01 = 0.000004
H(V, 2) = max = 0.000960 (via D)
```

| Etat | H(etat, 2) | Backpointer |
|------|-----------|-------------|
| D | 0.000480 | D |
| N | **0.201600** | D |
| V | 0.000960 | D |

**Etape 3 : Recursion (k=3, mot "mange")**

**H(D, 3)** :
```
via D : 0.000480 * 0.1 * 0.01 = 4.80e-7
via N : 0.201600 * 0.1 * 0.01 = 2.016e-4
via V : 0.000960 * 0.3 * 0.01 = 2.88e-6
H(D, 3) = max = 2.016e-4 (via N)
```

**H(N, 3)** :
```
via D : 0.000480 * 0.7 * 0.05 = 1.680e-5
via N : 0.201600 * 0.1 * 0.05 = 1.008e-3
via V : 0.000960 * 0.5 * 0.05 = 2.400e-5
H(N, 3) = max = 1.008e-3 (via N)
```

**H(V, 3)** :
```
via D : 0.000480 * 0.2 * 0.80 = 7.680e-5
via N : 0.201600 * 0.8 * 0.80 = 1.290e-1
via V : 0.000960 * 0.2 * 0.80 = 1.536e-4
H(V, 3) = max = 1.290e-1 (via N)
```

| Etat | H(etat, 3) | Backpointer |
|------|-----------|-------------|
| D | 2.016e-4 | N |
| N | 1.008e-3 | N |
| V | **1.290e-1** | N |

**Etape 4 : Terminaison**

```
Meilleur etat final :
  H(D, 3) = 2.016e-4
  H(N, 3) = 1.008e-3
  H(V, 3) = 1.290e-1   <-- MAXIMUM
```

**Etape 5 : Backtracking**

```
Position 3 : V (meilleur etat final)
    Backpointer de V a position 3 --> N a position 2
Position 2 : N
    Backpointer de N a position 2 --> D a position 1
Position 1 : D
```

### Resultat final

```
"le"    -> D (determinant)   ✓
"chat"  -> N (nom)           ✓
"mange" -> V (verbe)         ✓
```

**Probabilite de la meilleure sequence** : P(D,N,V | "le chat mange") = 0.1290

### Table de Viterbi complete

```
         k=1 ("le")    k=2 ("chat")    k=3 ("mange")
    D    0.4800 [init]  0.000480 [D]    2.016e-4 [N]
    N    0.0020 [init]  0.201600 [D]    1.008e-3 [N]
    V    0.0020 [init]  0.000960 [D]    0.129024 [N]  <-- MAX
```

---

## Exercice 2 : Viterbi avec ambiguite reelle

### Enonce

Phrase "chat mange" (sans determinant). Distribution initiale : pi(D)=0.1, pi(N)=0.7, pi(V)=0.2

Memes matrices A et B que l'exercice 1.

### Solution

**Initialisation (k=1, "chat")** :
```
H(D, 1) = 0.1 * 0.01 = 0.001
H(N, 1) = 0.7 * 0.60 = 0.420
H(V, 1) = 0.2 * 0.01 = 0.002
```

**Recursion (k=2, "mange")** :

H(D, 2) :
```
via D : 0.001 * 0.1 * 0.01 = 1.00e-6
via N : 0.420 * 0.1 * 0.01 = 4.20e-4
via V : 0.002 * 0.3 * 0.01 = 6.00e-6
H(D, 2) = 4.20e-4 (via N)
```

H(N, 2) :
```
via D : 0.001 * 0.7 * 0.05 = 3.50e-5
via N : 0.420 * 0.1 * 0.05 = 2.10e-3
via V : 0.002 * 0.5 * 0.05 = 5.00e-5
H(N, 2) = 2.10e-3 (via N)
```

H(V, 2) :
```
via D : 0.001 * 0.2 * 0.80 = 1.60e-4
via N : 0.420 * 0.8 * 0.80 = 2.688e-1    <-- MAX GLOBAL
via V : 0.002 * 0.2 * 0.80 = 3.20e-4
H(V, 2) = 2.688e-1 (via N)
```

**Resultat** : "chat" = N, "mange" = V, P = 0.2688

---

## Exercice 3 : Viterbi avec 4 etats (type DS etendu)

### Enonce

4 etats : {D (det), A (adj), N (nom), V (verbe)}, phrase "le gros chat mange".

**pi** : D=0.7, A=0.05, N=0.15, V=0.10

**Transitions A** :
```
        D     A     N     V
  D   0.05  0.40  0.50  0.05
  A   0.05  0.10  0.80  0.05
  N   0.05  0.05  0.10  0.80
  V   0.30  0.10  0.50  0.10
```

**Emissions B** :
```
        "le"   "gros"  "chat"  "mange"
  D     0.70   0.01    0.01    0.01
  A     0.01   0.50    0.05    0.01
  N     0.01   0.10    0.60    0.02
  V     0.01   0.02    0.01    0.80
```

### Solution

**Initialisation (k=1, "le")** :
```
H(D,1) = 0.70 * 0.70 = 0.4900
H(A,1) = 0.05 * 0.01 = 0.0005
H(N,1) = 0.15 * 0.01 = 0.0015
H(V,1) = 0.10 * 0.01 = 0.0010
```

**Recursion (k=2, "gros")** -- on ne montre que le max par etat :
```
H(A,2) : via D = 0.4900 * 0.40 * 0.50 = 0.0980   <-- MAX pour A
H(N,2) : via D = 0.4900 * 0.50 * 0.10 = 0.0245   <-- MAX pour N
H(D,2) : via D = 0.4900 * 0.05 * 0.01 = 0.000245
H(V,2) : via D = 0.4900 * 0.05 * 0.02 = 0.000490
```

**Recursion (k=3, "chat")** :
```
H(N,3) : via A = 0.0980 * 0.80 * 0.60 = 0.04704   <-- MAX pour N
H(A,3) : via A = 0.0980 * 0.10 * 0.05 = 0.000490
H(V,3) : via N = 0.0245 * 0.80 * 0.01 = 0.000196
```

**Recursion (k=4, "mange")** :
```
H(V,4) : via N = 0.04704 * 0.80 * 0.80 = 0.030106   <-- MAX GLOBAL
H(N,4) : via N = 0.04704 * 0.10 * 0.02 = 9.408e-5
H(D,4) : via N = 0.04704 * 0.05 * 0.01 = 2.352e-5
H(A,4) : via N = 0.04704 * 0.05 * 0.01 = 2.352e-5
```

**Backtracking** : V <-- N <-- A <-- D

**Resultat** : "le"=D, "gros"=A, "chat"=N, "mange"=V, P = 0.0301

---

## Exercice 4 : Estimation des parametres HMM

### Enonce

Corpus annote d'entrainement :
```
Le/D chat/N mange/V la/D souris/N
La/D souris/N dort/V
Le/D chat/N dort/V
```

**Estimer les parametres A (transitions) et B (emissions).**

### Solution

**Comptages pour les transitions** :

| Transition | Comptage | Contexte |
|-----------|---------|---------|
| D -> N | 4 | (le chat, la souris, la souris, le chat) |
| N -> V | 3 | (chat mange, souris dort, chat dort) |
| N -> N | 0 | (aucun N suivi de N) |
| V -> D | 1 | (mange la) |
| D -> D | 0 | |
| V -> FIN | 2 | (dort, dort) |

Total depuis D : 4 (D->N=4, D->V=0, D->D=0)
Total depuis N : 3 (N->V=3, N->N=0, N->D=0)
Total depuis V : 3 (V->D=1, V->FIN=2, V->N=0)

**Probabilites de transition** :
```
P(N|D) = 4/4 = 1.00    P(V|D) = 0/4 = 0.00    P(D|D) = 0/4 = 0.00
P(V|N) = 3/3 = 1.00    P(N|N) = 0/3 = 0.00    P(D|N) = 0/3 = 0.00
P(D|V) = 1/3 = 0.33    P(N|V) = 0/3 = 0.00    P(FIN|V) = 2/3 = 0.67
```

**Comptages pour les emissions** :
```
D : le=2, la=2          --> P("le"|D) = 2/4 = 0.50, P("la"|D) = 2/4 = 0.50
N : chat=2, souris=2    --> P("chat"|N) = 2/4 = 0.50, P("souris"|N) = 2/4 = 0.50
V : mange=1, dort=2     --> P("mange"|V) = 1/3 = 0.33, P("dort"|V) = 2/3 = 0.67
```

**Probleme** : beaucoup de probabilites a 0 (P(V|D)=0, etc.). Sur un corpus plus grand, ces probabilites seraient non nulles. En pratique, on applique un lissage.

---

## Exercice 5 : Viterbi vs Forward -- question type DS

### Enonce

En reprenant les donnees de l'exercice 1 ("le chat mange"), calculer la probabilite Forward F(V, 3) et comparer avec la valeur Viterbi H(V, 3).

### Rappel : difference entre Viterbi et Forward

```
Viterbi :  H(i, k) = MAX_j  [H(j, k-1) * a(j,i) * b_i(w_k)]
Forward :  F(i, k) = SUM_j  [F(j, k-1) * a(j,i) * b_i(w_k)]

Viterbi --> meilleur chemin unique (MAX)
Forward --> somme sur TOUS les chemins (SUM)
```

### Solution

L'initialisation est identique pour les deux algorithmes :
```
F(D, 1) = H(D, 1) = 0.4800
F(N, 1) = H(N, 1) = 0.0020
F(V, 1) = H(V, 1) = 0.0020
```

A l'etape 2 ("chat"), au lieu de prendre le max on fait la somme :
```
F(N, 2) = SUM_j [F(j, 1) * a(j,N) * b_N("chat")]
         = 0.4800 * 0.7 * 0.60 + 0.0020 * 0.1 * 0.60 + 0.0020 * 0.5 * 0.60
         = 0.201600 + 0.000120 + 0.000600
         = 0.202320
```

Comparaison : H(N, 2) = 0.201600 (seul le meilleur chemin, via D).
F(N, 2) = 0.202320 (somme de tous les chemins). F >= H toujours.

A l'etape 3 ("mange") :
```
F(V, 3) = SUM_j [F(j, 2) * a(j,V) * b_V("mange")]

On a besoin de F(D, 2) et F(V, 2) aussi :
F(D, 2) = 0.4800*0.1*0.01 + 0.0020*0.1*0.01 + 0.0020*0.3*0.01
         = 0.000480 + 0.000002 + 0.000006 = 0.000488
F(V, 2) = 0.4800*0.2*0.01 + 0.0020*0.8*0.01 + 0.0020*0.2*0.01
         = 0.000960 + 0.000016 + 0.000004 = 0.000980

F(V, 3) = F(D, 2) * a(D,V) * b_V("mange")
         + F(N, 2) * a(N,V) * b_V("mange")
         + F(V, 2) * a(V,V) * b_V("mange")
         = 0.000488 * 0.2 * 0.80
         + 0.202320 * 0.8 * 0.80
         + 0.000980 * 0.2 * 0.80
         = 7.808e-5 + 0.129485 + 1.568e-4
         = 0.129720
```

### Comparaison

```
H(V, 3) = 0.129024   (probabilite du MEILLEUR chemin D-N-V)
F(V, 3) = 0.129720   (probabilite totale de TOUS les chemins finissant en V)

F(V, 3) - H(V, 3) = 0.000696 (contribution des chemins sous-optimaux)
```

La probabilite Forward est toujours superieure ou egale a la valeur Viterbi, car elle somme TOUS les chemins, pas seulement le meilleur.

**Application** : La probabilite totale de la phrase est P("le chat mange") = F(D, 3) + F(N, 3) + F(V, 3), en sommant sur tous les etats finaux possibles.

---

## Pieges courants

1. **Oublier le backtracking** : la valeur max a la fin ne donne que le dernier etat, il faut remonter les pointeurs pour avoir la sequence complete
2. **Confondre a(i,j)** : verifier la convention dans l'enonce : a(i,j) = P(etat j | etat i) ou P(etat i | etat j) ?
3. **Initialisation** : ne pas oublier de multiplier par pi(i) ET par b_i(w_1) a l'etape 1
4. **Precision numerique** : en DS, garder suffisamment de decimales pour distinguer les chemins proches
5. **Complexite** : Viterbi est O(n * |T|^2), pas O(|T|^n) -- c'est de la programmation dynamique
6. **Confusion avec Forward** : Viterbi utilise max, Forward utilise SUM -- ne pas confondre
7. **Forward >= Viterbi** : la valeur Forward est toujours >= la valeur Viterbi car elle inclut tous les chemins
