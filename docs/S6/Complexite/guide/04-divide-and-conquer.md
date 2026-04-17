---
title: "Chapitre 4 -- Diviser pour regner"
sidebar_position: 4
---

# Chapitre 4 -- Diviser pour regner

> Pour resoudre un gros probleme, on le coupe en morceaux, on resout chaque morceau, puis on assemble les solutions.

---

## 1. Le schema general

Tout algorithme "diviser pour regner" (DPR) suit trois etapes :

1. **DIVISER** : decomposer le probleme de taille n en a sous-problemes de taille n/b
2. **RESOUDRE** : resoudre recursivement chaque sous-probleme
3. **COMBINER** : assembler les solutions des sous-problemes

### Deux variantes (cours de Maud Marchal)

| Variante | Division | Combinaison | Exemple |
|----------|---------|-------------|---------|
| Recursivite sur les donnees | O(1) | O(n) | Tri fusion |
| Recursivite sur les resultats | O(n) | O(1) | Tri rapide |

---

## 2. Analyse de complexite

### Recurrence generale

```
T(n) = a * T(n/b) + f(n)
```
- a = nombre de sous-problemes
- n/b = taille de chaque sous-probleme
- f(n) = cout de la division + recombinaison

### Theoreme maitre (version du cours)

Pour T(n) = a * T(n/b) + c*n, avec T(1) = C, a >= 1, b > 1, c > 0 :

```
a < b  =>  T(n) = O(n)             Racine domine (peu de sous-pbs)
a = b  =>  T(n) = O(n log n)       Chaque niveau coute pareil
a > b  =>  T(n) = O(n^{log_b(a)})  Feuilles dominent (explosion)
```

**Attention :** Cette version simplifiee suppose f(n) = c*n (lineaire).
Pour la recherche dichotomique (f(n) = O(1)) et Strassen (f(n) = O(n^2)),
il faut utiliser le theoreme maitre general (comparer f(n) a n^{log_b(a)}).

### Demonstration (idee de l'arbre de recursion)

```
Niveau 0 :  c*n                         1 pb de taille n
Niveau 1 :  a * c*(n/b) = cn*(a/b)      a pbs de taille n/b
Niveau 2 :  a^2 * c*(n/b^2) = cn*(a/b)^2
...
Niveau k :  cn * (a/b)^k                a^k pbs de taille n/b^k

Dernier niveau : n/b^k = 1  =>  k = log_b(n)

Cout total = cn * sum_{k=0}^{log_b(n)} (a/b)^k  +  a^{log_b(n)} * C
```

C'est une serie geometrique de raison a/b, d'ou les 3 cas.

### L'equilibrage est essentiel

- DPR equilibre (n/2, n/2) : O(n log n) -- ex : tri fusion
- DPR desequilibre (n-1, 1) : O(n^2) -- ex : tri insertion, quicksort pire cas

---

## 3. Exemples classiques

### 3.1 Tri par fusion

```
T(n) = 2T(n/2) + O(n)
a = 2, b = 2, a = b => O(n log n)
```

### 3.2 Recherche dichotomique

```python noexec
def recherche_dicho(T, x, debut, fin):
    if debut > fin:
        return -1
    mid = (debut + fin) // 2
    if T[mid] == x: return mid
    elif T[mid] > x: return recherche_dicho(T, x, debut, mid-1)
    else: return recherche_dicho(T, x, mid+1, fin)
```

```
T(n) = T(n/2) + O(1) => O(log n)
```

### 3.3 Multiplication de Karatsuba

Multiplier deux nombres de n chiffres. Methode naive : O(n^2).

Astuce : x = a*10^{n/2} + b, y = c*10^{n/2} + d
```
x*y = ac * 10^n + (ad + bc) * 10^{n/2} + bd
```

On calcule seulement 3 multiplications au lieu de 4 :
```
p1 = ac,  p2 = bd,  p3 = (a+b)(c+d)
ad + bc = p3 - p1 - p2
```

```
T(n) = 3T(n/2) + O(n)
a = 3, b = 2, a > b => O(n^{log_2(3)}) = O(n^{1.585})
```

### 3.4 Strassen (multiplication de matrices)

Matrices n x n. Methode naive : 8 multiplications => O(n^3).
Strassen : 7 multiplications => O(n^{2.807}).

```
T(n) = 7T(n/2) + O(n^2)
a = 7, b = 2, a > b => O(n^{log_2(7)}) = O(n^{2.807})
```

### 3.5 Multiplication de polynomes

Deux polynomes de degre n. Naive : O(n^2). DPR avec astuce Karatsuba : O(n^{1.585}).

---

## 4. Enveloppe convexe

### QuickHull
Similaire au quicksort. Moyen O(n log n), pire O(n^2).

### Marche de Jarvis
"Enroule" un fil autour des points. O(n*h) ou h = nb points sur l'enveloppe.

### Scan de Graham
1. Trier par angle polaire : O(n log n)
2. Parcourir avec une pile : O(n)
Total : O(n log n)

---

## 5. Table recapitulative

| Algorithme | Recurrence | a | b | Complexite |
|-----------|-----------|---|---|-----------|
| Recherche dichotomique | T(n) = T(n/2) + O(1) | 1 | 2 | O(log n) |
| Tri par fusion | T(n) = 2T(n/2) + O(n) | 2 | 2 | O(n log n) |
| Karatsuba | T(n) = 3T(n/2) + O(n) | 3 | 2 | O(n^{1.585}) |
| Strassen | T(n) = 7T(n/2) + O(n^2) | 7 | 2 | O(n^{2.807}) |
| Tri rapide (moyen) | T(n) = 2T(n/2) + O(n) | 2 | 2 | O(n log n) |
| Tri rapide (pire) | T(n) = T(n-1) + O(n) | -- | -- | O(n^2) |
| Tri insertion (vu DPR) | T(n) = T(n-1) + O(n) | -- | -- | O(n^2) |

---

## 6. Pieges classiques

1. **Confondre a et b** : a = nombre de sous-problemes, b = facteur de reduction de la taille. Si T(n) = 3T(n/4) + n, alors a = 3, b = 4 (pas a = 4).

2. **Appliquer le theoreme maitre au pire cas du quicksort** : T(n) = T(n-1) + O(n) n'est PAS de la forme a*T(n/b). Le theoreme maitre ne s'applique pas.

3. **Oublier le cas de base** : Tout DPR a besoin d'un cas de base (sinon boucle infinie).

4. **Confondre fusion et partitionnement** : Fusion = travail a la combinaison. Partitionnement = travail a la division.

---

## CHEAT SHEET -- Diviser pour regner

```
SCHEMA : Diviser -> Resoudre recursivement -> Combiner

RECURRENCE : T(n) = a * T(n/b) + f(n)
  a = nb sous-problemes
  b = facteur reduction
  f(n) = cout division + combinaison

THEOREME MAITRE SIMPLIFIE (T(n) = aT(n/b) + cn) :
  a < b => O(n)           Ex: un seul sous-pb (a=1, b=2)
  a = b => O(n log n)     Ex: tri fusion (a=2, b=2)
  a > b => O(n^{log_b a}) Ex: Karatsuba (a=3, b=2)

THEOREME MAITRE GENERAL (pour f(n) != cn) :
  Recherche dicho : T(n) = T(n/2) + O(1) => O(log n)
  Strassen : T(n) = 7T(n/2) + O(n^2) => O(n^{2.807})

DEUX VARIANTES :
  Donnees : division O(1), combinaison O(n) [fusion]
  Resultats : division O(n), combinaison O(1) [quicksort]

EQUILIBRAGE :
  Equilibre (n/2, n/2) => O(n log n)
  Desequilibre (n-1, 1) => O(n^2)

COMPLEXITES A RETENIR :
  Recherche dicho : O(log n)
  Tri fusion : O(n log n) toujours
  Karatsuba : O(n^{1.585})
  Strassen : O(n^{2.807})
```
