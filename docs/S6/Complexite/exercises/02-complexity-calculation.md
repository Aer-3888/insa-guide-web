---
title: "Exercices -- Calcul de complexite"
sidebar_position: 2
---

# Exercices -- Calcul de complexite

> Les exercices 1-2 suivent les TD du cours (Hugo TD 2). Les exercices 3-6 couvrent les techniques classiques de calcul de complexite.

---

## Exercice 1 : Complexite moyenne du tri rapide (Hugo TD 2, Ex 1)

**Enonce :** On considere le tri rapide (quicksort). On suppose que la permutation des n elements est aleatoire uniforme. Calculer la complexite moyenne C_n en nombre de comparaisons.

### Solution par series generatrices

**Etape 1 -- Recurrence.**

Soit C_n le nombre moyen de comparaisons pour trier n elements. Le pivot est choisi au hasard. Apres le partitionnement (n-1 comparaisons), le pivot est a sa position finale k (avec k allant de 1 a n equiprobablement). Les deux sous-problemes sont de tailles k-1 et n-k.

```
C_0 = C_1 = 0
C_n = (n - 1) + (1/n) * sum_{k=1}^{n} [C_{k-1} + C_{n-k}]
    = (n - 1) + (2/n) * sum_{k=0}^{n-1} C_k
```

La derniere egalite vient de la symetrie : sum_{k=1}^{n} C_{k-1} = sum_{k=1}^{n} C_{n-k}.

**Etape 2 -- Elimination de la somme.**

Multiplions par n :

```
n * C_n = n(n - 1) + 2 * sum_{k=0}^{n-1} C_k     ... (I)
```

Ecrivons la meme relation pour n-1 :

```
(n-1) * C_{n-1} = (n-1)(n-2) + 2 * sum_{k=0}^{n-2} C_k   ... (II)
```

(I) - (II) :

```
n*C_n - (n-1)*C_{n-1} = n(n-1) - (n-1)(n-2) + 2*C_{n-1}
n*C_n - (n-1)*C_{n-1} = (n-1)[n - (n-2)] + 2*C_{n-1}
n*C_n - (n-1)*C_{n-1} = 2(n-1) + 2*C_{n-1}
n*C_n = (n+1)*C_{n-1} + 2(n-1)
```

**Etape 3 -- Changement de variable.**

Posons D_n = C_n/(n+1). Alors C_n = (n+1)*D_n.

```
n*(n+1)*D_n = (n+1)*n*D_{n-1} + 2(n-1)
```

Divisons par n(n+1) :

```
D_n = D_{n-1} + 2(n-1)/[n(n+1)]
```

**Etape 4 -- Resolution par telescopage.**

```
D_n = D_1 + sum_{k=2}^{n} 2(k-1)/[k(k+1)]
```

Decomposons 2(k-1)/[k(k+1)] en fractions partielles :

```
2(k-1)/[k(k+1)] = 2(k-1)/[k(k+1)]
```

Posons : 2(k-1)/[k(k+1)] = A/k + B/(k+1).

```
2(k-1) = A(k+1) + Bk
k = 0 : -2 = A     => A = -2
k = -1 : -4 = -B   => B = 4
```

Donc : 2(k-1)/[k(k+1)] = -2/k + 4/(k+1).

```
D_n = D_1 + sum_{k=2}^{n} [-2/k + 4/(k+1)]
    = 0 + [-2 * sum_{k=2}^{n} 1/k] + [4 * sum_{k=2}^{n} 1/(k+1)]
    = -2 * (H_n - 1) + 4 * (H_{n+1} - 1 - 1/2)
    = -2*H_n + 2 + 4*H_{n+1} - 4 - 2
    = -2*H_n + 4*H_{n+1} - 4
    = -2*H_n + 4*(H_n + 1/(n+1)) - 4
    = 2*H_n + 4/(n+1) - 4
```

Donc :

```
C_n = (n+1)*D_n = (n+1)*(2*H_n + 4/(n+1) - 4)
    = 2(n+1)*H_n + 4 - 4(n+1)
    = 2(n+1)*H_n - 4n
```

**Resultat :**

```
C_n = 2(n+1)*H_{n+1} - 2(n+1) - 2n
```

Forme equivalente (en utilisant H_n = ln(n) + gamma + O(1/n)) :

```
C_n ~ 2n*ln(n) ~ 2n*log_2(n) * ln(2) ~ 1.386 * n * log_2(n)
```

**Complexite moyenne du tri rapide : O(n log n)**, avec une constante environ 1.39 (en base 2).

C'est meilleur que le pire cas O(n^2), et en pratique, les constantes sont plus petites que celles du tri fusion.

---

## Exercice 2 : Nombre d'arbres binaires a n noeuds -- nombres de Catalan (Hugo TD 2, Ex 2)

**Enonce :** Soit b_n le nombre d'arbres binaires distincts a n noeuds internes. Trouver une formule close pour b_n.

### Solution par series generatrices

**Etape 1 -- Recurrence.**

Un arbre binaire a n noeuds internes est compose d'une racine, d'un sous-arbre gauche a k noeuds, et d'un sous-arbre droit a n-1-k noeuds (k variant de 0 a n-1).

```
b_0 = 1  (l'arbre vide)
b_n = sum_{k=0}^{n-1} b_k * b_{n-1-k}    pour n >= 1
```

C'est un **produit de convolution**.

**Etape 2 -- Serie generatrice.**

```
B(x) = sum_{n>=0} b_n * x^n
```

La recurrence donne :

```
sum_{n>=1} b_n * x^n = sum_{n>=1} [sum_{k=0}^{n-1} b_k * b_{n-1-k}] * x^n
                     = x * sum_{n>=1} [sum_{k=0}^{n-1} b_k * b_{n-1-k}] * x^{n-1}
                     = x * B(x)^2
```

Donc :

```
B(x) - b_0 = x * B(x)^2
B(x) - 1 = x * B(x)^2
x * B(x)^2 - B(x) + 1 = 0
```

**Etape 3 -- Equation du second degre en B(x).**

```
B(x) = [1 +/- sqrt(1 - 4x)] / (2x)
```

On choisit le signe - car B(0) = b_0 = 1 (le signe + donnerait B(0) = +inf) :

```
B(x) = [1 - sqrt(1 - 4x)] / (2x)
```

**Etape 4 -- Developpement en serie de sqrt(1 - 4x).**

Utilisons le binome generalise :

```
(1 + u)^{1/2} = sum_{k>=0} C(1/2, k) * u^k
```

avec u = -4x :

```
sqrt(1 - 4x) = sum_{k>=0} C(1/2, k) * (-4x)^k
```

Le coefficient du binome generalise :

```
C(1/2, k) = (1/2)(1/2 - 1)(1/2 - 2)...(1/2 - k + 1) / k!
           = (1/2)(-1/2)(-3/2)...((3-2k)/2) / k!
```

Apres calcul (formule connue) :

```
C(1/2, k) = (-1)^{k-1} * C(2k-2, k-1) / (k * 2^{2k-1})
```

En reportant dans B(x) et en identifiant les coefficients de x^n :

```
b_n = C(2n, n) / (n + 1)
```

**C'est le n-ieme nombre de Catalan.**

**Etape 5 -- Forme alternative et valeurs.**

```
b_n = C(2n, n) / (n+1) = (2n)! / [n! * (n+1)!]
```

Premieres valeurs :

```
b_0 = 1
b_1 = 1
b_2 = 2
b_3 = 5
b_4 = 14
b_5 = 42
```

Verification b_3 : arbres a 3 noeuds internes. Les 5 formes :

```
    o         o       o         o           o
   / \       /       /           \         / \
  o   o     o       o             o       o   o
 /         / \       \           /             \
o         o   o       o         o               o
```

**Comportement asymptotique :** Par la formule de Stirling,

```
b_n ~ 4^n / (n^{3/2} * sqrt(pi))
```

Donc b_n croit exponentiellement en 4^n.

---

## Exercice 3 : Boucles imbriquees -- 6 variantes

### a) Trois boucles independantes

```python noexec
for i in range(n):          # n iterations
    for j in range(n):      # n iterations
        for k in range(n):  # n iterations
            x = x + 1       # O(1)
```

Total : n^3. **Complexite : O(n^3)**

### b) Boucle interne dependante

```python noexec
for i in range(n):       # i va de 0 a n-1
    for j in range(i):   # i iterations
        x = x + 1
```

```
Total = 0 + 1 + 2 + ... + (n-1) = n(n-1)/2
```

**Complexite : O(n^2)**

### c) Boucle avec division (logarithmique)

```python noexec
for i in range(n):         # n iterations
    j = n
    while j > 1:           # log_2(n) iterations
        j = j // 2
        x = x + 1
```

Total = n * log_2(n). **Complexite : O(n log n)**

### d) Boucle avec pas variable -- piege classique

```python noexec
for i in range(1, n+1):
    j = 1
    while j < n:
        j = j + i          # le pas est i, pas 1 !
        x = x + 1
```

Pour i donne, la boucle while execute ceil(n/i) iterations.

```
Total = sum_{i=1}^{n} n/i = n * H_n ~ n * ln(n)
```

**Complexite : O(n log n)**

Piege : on pourrait croire O(n^2) en voyant deux boucles imbriquees.

### e) Boucle dependante avec somme de carres

```python noexec
for i in range(1, n+1):           # i de 1 a n
    for j in range(1, i*i + 1):   # i^2 iterations
        x = x + 1
```

```
Total = sum_{i=1}^{n} i^2 = n(n+1)(2n+1)/6
```

**Complexite : O(n^3)**

---

## Exercice 4 : Complexite de fonctions recursives

### a) Le probleme valmax (du cours) -- O(2^n)

```c noexec
int valmax(int i) {
    if (i == 0) return T[0];
    if (T[i] > valmax(i-1))
        return T[i];
    else
        return valmax(i-1);   // 2eme appel !
}
```

Dans le pire cas : T(n) = 2*T(n-1) + O(1) = O(2^n).

Correction : stocker valmax(i-1) dans une variable => O(n).

### b) Fibonacci recursif naif

```python
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
```

T(n) = T(n-1) + T(n-2) + O(1). **Complexite : O(phi^n) = O(1.618^n).**

### c) Puissance rapide

```python
def puissance_rapide(x, n):
    if n == 0: return 1
    if n % 2 == 0:
        return puissance_rapide(x * x, n // 2)
    else:
        return x * puissance_rapide(x, n - 1)
```

T(n) = T(n/2) + O(1). **Complexite : O(log n).**

---

## Exercice 5 : Cout amorti -- compteur binaire

**Enonce :** Un compteur binaire sur k bits est incremente n fois. Montrer que le cout amorti par operation est O(1).

### Solution

```
Bit 0 : change a chaque increment       => n fois
Bit 1 : change tous les 2 increments     => n/2 fois
Bit j : change tous les 2^j increments   => n/2^j fois

T(n) = n + n/2 + n/4 + ... < 2n
```

**Cout amorti = 2n/n = 2 = O(1).**

---

## Exercice 6 : Complexite avec condition -- fonction mystery

```python
def mystery(n):
    if n <= 1: return 1
    if n % 2 == 0:
        return mystery(n // 2) + n
    else:
        return mystery(n - 1) + 1
```

Deux appels consecutifs (impair puis pair) divisent n par environ 2 avec un cout O(n).

T(n) = T(n/2) + O(n). Par le theoreme maitre (a=1, b=2) : **O(n).**

---

## Resume

| Methode | Quand l'utiliser | Resultat typique |
|---------|-----------------|------------------|
| Compter les iterations | Boucles imbriquees | Sommes de series |
| Serie harmonique | Pas variable (n/i) | O(n log n) |
| Deroulement | Recursion simple | Somme geometrique/telescopique |
| Theoreme maitre | T(n) = a*T(n/b) + f(n) | Comparer a et b^d |
| Series generatrices | Recurrences avec convolution | Nombres de Catalan, etc. |
