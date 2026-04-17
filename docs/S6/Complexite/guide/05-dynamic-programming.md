---
title: "Chapitre 5 -- Programmation dynamique"
sidebar_position: 5
---

# Chapitre 5 -- Programmation dynamique

> Quand un algorithme recursif recalcule les memes choses, on memorise les resultats pour ne jamais faire deux fois le meme calcul.

**Poids au DS : 10-14 points (probleme principal). C'est LE sujet du DS.**

---

## 1. Conditions d'application

Deux conditions doivent etre reunies :

### 1.1 Sous-structure optimale (Bellman)
La solution optimale du probleme contient les solutions optimales des sous-problemes.

### 1.2 Sous-problemes chevauches
Les memes sous-problemes apparaissent plusieurs fois dans l'arbre recursif.

**Difference fondamentale avec DPR :**
- DPR : sous-problemes **independants** => pas de redondance
- Prog. dyn. : sous-problemes **chevauches** => redondance a eliminer

---

## 2. Methodologie en 4 etapes (cours)

1. **Caracteriser** la structure d'une solution optimale (sous-structure)
2. **Definir recursivement** la valeur optimale (formule de recurrence)
3. **Calculer** la valeur en remontant progressivement (table)
4. **Construire** la solution optimale (optionnel, remonter dans la table)

---

## 3. Deux approches d'implementation

### Top-down (memoisation)
```python noexec
memo = {}
def f_dyn(params):
    if params in memo: return memo[params]
    if cas_de_base(params):
        resultat = valeur_base(params)
    else:
        resultat = combiner(f_dyn(sous_pbs))
    memo[params] = resultat
    return resultat
```
Avantage : facile a coder a partir du recursif naif.

### Bottom-up (iteratif)
```python noexec
def f_iter(n):
    table = initialiser_cas_de_base()
    for taille croissante:
        table[pb] = calculer(table[sous_pbs])
    return table[pb_principal]
```
Avantage : pas d'overhead recursif, optimisation memoire possible.

---

## 4. Patron recurrent en DS

Le probleme de prog. dyn. en DS suit **presque toujours** ce schema :

```
Q1 : Comprendre le probleme (exemple numerique)
Q2 : Justifier la formule de recurrence
Q3 : Ecrire l'algorithme recursif naif
Q4 : Montrer les calculs redondants (arbre des appels)
Q5 : Donner la complexite de l'algo naif (exponentielle)
Q6 : Proposer un algo de prog. dynamique + complexite
Q7 : (Bonus) Reconstituer la solution optimale
```

---

## 5. Exemples fondamentaux

### 5.1 Fibonacci

**Naif -- O(2^n) :**
```python
def fibo(n):
    if n <= 1: return n
    return fibo(n-1) + fibo(n-2)
```

**Memoisation -- O(n) :**
```python
memo = {}
def fibo_memo(n):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fibo_memo(n-1) + fibo_memo(n-2)
    return memo[n]
```

**Iteratif -- O(n) temps, O(1) memoire :**
```python
def fibo_iter(n):
    if n <= 1: return n
    a, b = 0, 1
    for i in range(2, n+1):
        a, b = b, a + b
    return b
```

### 5.2 Distance d'edition (Levenshtein) -- CTD4

**Probleme :** Cout minimal pour transformer A[1..n] en B[1..m] avec operations :
- Suppression : cout D(a)
- Insertion : cout I(b)
- Substitution : cout S(a, b) (0 si a = b)

**Recurrence :**
```
c(0, 0) = 0
c(i, 0) = c(i-1, 0) + D(a_i)
c(0, j) = c(0, j-1) + I(b_j)

c(i, j) = min {
    c(i-1, j)   + D(a_i),        -- suppression
    c(i, j-1)   + I(b_j),        -- insertion
    c(i-1, j-1) + S(a_i, b_j)    -- substitution
}
```

**Complexite :** O(n * m) en temps et espace.

**Visualisation (couts unitaires) :**
```
          ""  B  R  U  I  T
    ""  [  0  1  2  3  4  5 ]
    B   [  1  0  1  2  3  4 ]
    R   [  2  1  0  1  2  3 ]
    U   [  3  2  1  0  1  2 ]
    T   [  4  3  2  1  1  1 ]
```

### 5.3 Multiplication de n matrices -- CTD4

**Probleme :** Parentheser M1 * M2 * ... * Mn pour minimiser les operations scalaires.

**Recurrence :** Soit m(i,j) le cout minimal pour M_i * ... * M_j :
```
m(i, i) = 0
m(i, j) = min_{k=i..j-1} { m(i,k) + m(k+1,j) + p_{i-1}*p_k*p_j }
```

**Complexite :** O(n^3) en temps, O(n^2) en espace.

**Remplissage :** Par diagonales croissantes (longueur de sous-chaine).

### 5.4 Triangulation optimale d'un polygone -- DS 2017, 2021

**Probleme :** Trianguler un polygone convexe a n sommets en minimisant la somme des perimetres.

**Recurrence :**
```
t[i, j] = 0                                              si i = j
t[i, j] = min_{k=i..j-1} { t[i,k] + t[k+1,j] + W(v_{i-1}, v_k, v_j) }   si i < j
```

Solution : t[1, n-1]. Identique en structure a la multiplication de matrices.

### 5.5 Impression equilibree -- DS 2023

**Probleme :** Repartir n mots sur des lignes de largeur M en minimisant le cube des espaces restants.

**Recurrence :**
```
C(i) = 0                              si mots i a n tiennent sur une ligne
C(i) = min_j { f(i,j)^3 + C(j+1) }   sinon
  ou f(i,j) = M - (j-i) - sum_{k=i}^{j} l_k
```

### 5.6 Chemin de cout minimal dans une matrice -- Tutorial

**Recurrence :**
```
dp[0][0] = a[0][0]
dp[i][0] = dp[i-1][0] + a[i][0]
dp[0][j] = dp[0][j-1] + a[0][j]
dp[i][j] = a[i][j] + min(dp[i-1][j], dp[i][j-1])
```

**Complexite :** O(n^2).

### 5.7 Combinaisons C(n,p) -- Triangle de Pascal

```
C(n, p) = C(n-1, p) + C(n-1, p-1)
C(n, 0) = C(n, n) = 1
```
Recursif naif : exponentiel. Table : O(n*p).

---

## 6. Technique de la fenetre glissante

Quand seules les quelques valeurs precedentes sont necessaires, on ne garde en memoire que ce qui est utile :

- **Fibonacci :** O(1) memoire (2 variables au lieu de n)
- **Distance d'edition (cout seul) :** O(min(n,m)) memoire (2 lignes au lieu de n*m)

---

## 7. Comparaison des paradigmes

| Critere | DPR | Prog. dynamique | Glouton |
|---------|-----|-----------------|---------|
| Sous-problemes | Independants | Chevauches | Pas de decomposition |
| Exploration | Tout resolu | Tout explore, garde meilleur | Un seul choix |
| Retour arriere | Non | Non (mais tout explore) | Non |
| Complexite typique | O(n log n) | O(n^2) ou O(n^3) | O(n log n) |
| Optimalite | Toujours | Toujours (si correct) | A prouver |

---

## 8. Pieges classiques

1. **Confondre DPR et prog. dyn.** : Si les sous-problemes sont independants, pas besoin de memoiser. Si chevauches sans memoisation => exponentiel.

2. **Oublier l'initialisation de la table** : Les cas de base doivent etre remplis AVANT le remplissage.

3. **Mauvais ordre de remplissage** : En bottom-up, quand on calcule table[i][j], toutes les dependances doivent etre deja calculees.

4. **Confondre cout et solution** : La table donne le **cout** optimal. Pour la solution, il faut remonter ou garder les choix.

5. **Oublier l'optimisation memoire** : Si on ne veut que le cout, on peut souvent reduire l'espace.

---

## CHEAT SHEET -- Programmation dynamique

```
CONDITIONS :
  1. Sous-structure optimale (Bellman)
  2. Sous-problemes chevauches

METHODOLOGIE DS :
  Q1: Comprendre l'exemple
  Q2: Formule de recurrence
  Q3: Algo recursif naif
  Q4: Montrer les calculs redondants
  Q5: Complexite naive (exponentielle)
  Q6: Algo dynamique + complexite
  Q7: Reconstituer la solution

FORMULES RECURRENTES DES DS :
  Triangulation : t[i,j] = min_k { t[i,k] + t[k+1,j] + W(v_{i-1},v_k,v_j) }
  Impression eq. : C(i) = min_j { f(i,j)^3 + C(j+1) }
  Mult. matrices : m[i,j] = min_k { m[i,k] + m[k+1,j] + p_{i-1}*p_k*p_j }
  Distance edit. : c[i,j] = min(c[i-1,j]+D, c[i,j-1]+I, c[i-1,j-1]+S)
  Chemin matrice : dp[i][j] = a[i][j] + min(dp[i-1][j], dp[i][j-1])

COMPLEXITES :
  Fibonacci : naif O(2^n), dynamique O(n)
  Distance edition : O(n*m)
  Mult. matrices : O(n^3)
  Triangulation : O(n^3)
  Chemin matrice : O(n^2)

APPROCHES :
  Top-down : recursif + memo (dictionnaire)
  Bottom-up : iteratif + table (remplissage ordre croissant)
```
