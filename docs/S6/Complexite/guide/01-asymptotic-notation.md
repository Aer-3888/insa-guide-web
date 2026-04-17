---
title: "Chapitre 1 -- Notations asymptotiques"
sidebar_position: 1
---

# Chapitre 1 -- Notations asymptotiques

> On ne compte pas le temps exact d'un algorithme -- on mesure comment ce temps evolue quand la taille du probleme grandit.

---

## 1. Definitions formelles

### O (grand O) -- borne superieure

```
f(n) = O(g(n))  ssi  il existe c > 0, n0 >= 0 tels que
    pour tout n >= n0 : 0 <= f(n) <= c * g(n)
```

Signification : f ne grandit pas plus vite que g. "Au pire, c'est ca."

### Omega -- borne inferieure

```
f(n) = Omega(g(n))  ssi  il existe c > 0, n0 >= 0 tels que
    pour tout n >= n0 : f(n) >= c * g(n) >= 0
```

Signification : f grandit au moins aussi vite que g. "Au minimum, c'est ca."

### Theta -- encadrement exact

```
f(n) = Theta(g(n))  ssi  f(n) = O(g(n)) ET f(n) = Omega(g(n))

Autrement dit : il existe c1, c2 > 0, n0 tels que
    pour tout n >= n0 : c1 * g(n) <= f(n) <= c2 * g(n)
```

Signification : f grandit a la meme vitesse que g, a constante pres.

### petit-o -- strictement plus lent

```
f(n) = o(g(n))  ssi  lim(n->inf) f(n)/g(n) = 0
```

Signification : f grandit strictement plus lentement que g. Exemple : n = o(n^2).

---

## 2. Proprietes et regles de calcul

### Regle des constantes
```
O(c * f(n)) = O(f(n))     pour toute constante c > 0
```

### Regle du terme dominant
```
O(f(n) + g(n)) = O(max(f(n), g(n)))
```

Exemples :
```
O(n^2 + n) = O(n^2)
O(n^3 + 1000*n^2) = O(n^3)
O(2^n + n^100) = O(2^n)
```

### Operations sur les complexites
```
O(f) + O(g) = O(max(f, g))       -- instructions sequentielles
O(f) * O(g) = O(f * g)           -- boucles imbriquees
```

### Transitivite
```
Si f = O(g) et g = O(h), alors f = O(h)
```

### Propriete sur les logarithmes
```
O(log_a(n)) = O(log_b(n))  pour tous a, b > 1
```
La base du logarithme ne change pas la classe de complexite (facteur constant).

---

## 3. Hierarchie des complexites

Du plus rapide au plus lent :

```
O(1) < O(log n) < O(sqrt(n)) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)
```

| Complexite | Nom | Exemple | n=10 | n=100 | n=1000 |
|-----------|-----|---------|------|-------|--------|
| O(1) | Constante | Acces tableau | 1 | 1 | 1 |
| O(log n) | Logarithmique | Recherche dicho | 3 | 7 | 10 |
| O(n) | Lineaire | Parcours tableau | 10 | 100 | 1000 |
| O(n log n) | Quasi-lineaire | Tri fusion | 33 | 664 | 9966 |
| O(n^2) | Quadratique | Tri insertion (pire) | 100 | 10^4 | 10^6 |
| O(n^3) | Cubique | Mult. matrices naive | 1000 | 10^6 | 10^9 |
| O(2^n) | Exponentielle | Sous-ensembles | 1024 | 10^30 | 10^301 |
| O(n!) | Factorielle | Permutations | 3.6M | astronomique | -- |

**Regle pratique :** Un ordinateur fait ~10^8-10^9 operations/seconde. Un O(n^2) avec n=10^9 prendrait ~30 ans.

---

## 4. Calculer la complexite d'un code

### Boucle simple : O(n)
```python
for i in range(n):
    x = x + 1              # O(1) repete n fois
```

### Boucles imbriquees independantes : O(n^2)
```python
for i in range(n):
    for j in range(n):
        x = x + 1          # O(1) repete n*n fois
```

### Boucles imbriquees dependantes : O(n^2)
```python
for i in range(n):
    for j in range(i):     # j va de 0 a i-1
        x = x + 1
# Total = 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n^2)
```

### Boucle logarithmique : O(log n)
```python
i = n
while i > 0:
    i = i // 2             # Divise par 2 a chaque iteration
```

### Boucle combinee : O(n log n)
```python
for i in range(n):          # n fois
    j = n
    while j > 0:
        j = j // 2          # log(n) fois
```

### Conditionnelle : prendre le pire cas
```python
if condition:
    # O(n)
else:
    # O(n^2)
# => complexite = O(n^2) (pire cas)
```

Si la condition divise en 2 : O(log n) ou O(n log n).

---

## 5. Trois cas d'un algorithme

Pour un meme algorithme, la complexite peut varier selon les donnees :

- **Cas meilleur** : donnees les plus favorables (ex : tableau deja trie pour tri par insertion => O(n))
- **Cas pire** : donnees les plus defavorables (ex : tableau inverse pour tri par insertion => O(n^2))
- **Cas moyen** : esperance sur toutes les entrees possibles (ex : tri par insertion => O(n^2))

**Convention :** On analyse presque toujours le **pire cas**, sauf mention contraire.

---

## 6. Cout moyen vs cout amorti

### Cout moyen
Necessite une distribution de probabilite sur les entrees.

Exemple -- recherche sequentielle, x dans le tableau avec probabilite p :
```
E[cout] = p * (n+1)/2 + (1-p) * n
```

### Cout amorti
Cout moyen par operation sur une **sequence** d'operations (sans hypothese probabiliste).

Exemple -- compteur binaire (incrementer) :
- Pire cas d'un increment : O(k) bits changes
- Cout amorti : O(1) par increment, car sur n increments :
  ```
  bit 0 change n fois + bit 1 change n/2 fois + ... < 2n total
  ```

---

## 7. Theoreme maitre (version simplifiee du cours)

Pour T(n) = a * T(n/b) + c*n, avec T(1) = C, a >= 1, b > 1 :

```
a < b  =>  T(n) = O(n)             Le travail domine a la racine
a = b  =>  T(n) = O(n * log(n))    Chaque niveau coute n
a > b  =>  T(n) = O(n^(log_b(a)))  Le travail domine aux feuilles
```

Exemples :
| Algorithme | Recurrence | a | b | Resultat |
|-----------|-----------|---|---|---------|
| Recherche dicho | T(n) = T(n/2) + O(1) | 1 | 2 | O(log n) |
| Tri fusion | T(n) = 2T(n/2) + O(n) | 2 | 2 | O(n log n) |
| Karatsuba | T(n) = 3T(n/2) + O(n) | 3 | 2 | O(n^1.585) |
| Strassen | T(n) = 7T(n/2) + O(n^2) | 7 | 2 | O(n^2.807) |

**Note :** La version simplifiee ci-dessus suppose f(n) = c*n. Recherche dicho (f(n) = O(1))
et Strassen (f(n) = O(n^2)) relevent du theoreme maitre general, mais le resultat
O(n^{log_b(a)}) reste correct ici car dans les deux cas f(n) = O(n^{log_b(a) - epsilon}).

---

## 8. Preuves par definition

### Patron pour prouver f(n) = O(g(n))

1. Ecrire f(n)
2. Majorer chaque terme par un multiple de g(n)
3. Factoriser pour obtenir f(n) <= c * g(n) a partir d'un certain n0
4. Conclure avec les valeurs de c et n0

**Exemple :** Montrer que 3n^2 + 5n + 2 = O(n^2)

```
Pour n >= 1 :
    3n^2 + 5n + 2 <= 3n^2 + 5n^2 + 2n^2 = 10n^2
Donc avec c = 10 et n0 = 1 : f(n) <= 10 * n^2
QED : f(n) = O(n^2)
```

### Patron pour prouver f(n) = Omega(g(n))

1. Minorer f(n) par un multiple positif de g(n)

**Exemple :** Montrer que 3n^2 + 5n + 2 = Omega(n^2)

```
Pour tout n >= 0 : 3n^2 + 5n + 2 >= 3n^2
Donc avec c = 3 et n0 = 0 : f(n) >= 3 * n^2
QED : f(n) = Omega(n^2)
```

---

## 9. Pieges classiques

1. **Confondre O et Theta** : O est une borne sup, Theta est un encadrement exact. Dire O(n^2) ne signifie pas que l'algo est toujours quadratique.

2. **Oublier que O cache des constantes** : O(n) peut signifier n ou 1000n. Pour de petites tailles, un O(n^2) peut battre un O(n log n).

3. **Confondre log2 et log10** : En complexite, la base est sans importance (facteur constant).

4. **Boucles dependantes** : sum(i=0..n-1) i = n(n-1)/2 = O(n^2), pas O(n^2/2).

5. **Oublier le cout des appels recursifs** : Un appel recursif coute son propre travail PLUS le travail de ses appels enfants.

---

## CHEAT SHEET -- Notations asymptotiques

```
DEFINITIONS :
  O(g)     : f <= c*g        (borne sup)
  Omega(g) : f >= c*g        (borne inf)
  Theta(g) : c1*g <= f <= c2*g  (encadrement)
  o(g)     : lim f/g = 0    (strict)

REGLES :
  Constantes disparaissent : O(5n) = O(n)
  Terme dominant gagne     : O(n^2 + n) = O(n^2)
  Sequences s'additionnent : O(f) + O(g) = O(max(f,g))
  Boucles se multiplient   : O(f) * O(g) = O(f*g)

HIERARCHIE :
  1 < log n < sqrt(n) < n < n log n < n^2 < n^3 < 2^n < n!

THEOREME MAITRE (simplifie) :
  T(n) = a*T(n/b) + cn
  a < b => O(n)  |  a = b => O(n log n)  |  a > b => O(n^{log_b(a)})

FORMULES UTILES :
  1 + 2 + ... + n = n(n+1)/2
  1 + 2 + 4 + ... + 2^k = 2^{k+1} - 1
  log_2(10^6) ~ 20, log_2(10^9) ~ 30
```
