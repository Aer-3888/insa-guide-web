---
title: "TP5 : Vecteurs aleatoires et distributions multivariees"
sidebar_position: 5
---

# TP5 : Vecteurs aleatoires et distributions multivariees

## Presentation
Introduction aux distributions de probabilite jointes, distributions marginales et conditionnelles, et distributions normales multivariees.

## Sujets abordes
1. **Distributions jointes** (discretes et continues)
2. **Distributions marginales**
3. **Distributions conditionnelles**
4. **Loi multinomiale**
5. **Loi normale multivariee**

## Concepts cles

### Probabilite jointe
Pour des variables aleatoires discretes X et Y :
- P(X=x, Y=y) = probabilite jointe
- La somme sur tous les (x,y) = 1

### Probabilite marginale
Probabilite d'une variable en ignorant l'autre :
- P(X=x) = Somme_y P(X=x, Y=y)
- En R : `apply(matrix, 1, sum)` (lignes) ou `apply(matrix, 2, sum)` (colonnes)

### Probabilite conditionnelle
P(X=x | Y=y) = P(X=x, Y=y) / P(Y=y)

### Loi multinomiale
Extension de la binomiale a k > 2 categories :
- n epreuves, k resultats
- Probabilites : (p_1, p_2, ..., p_k) ou Somme p_i = 1
- Fonction R : `dmultinom(x, prob)`

### Fonctions R

```r noexec
# Operations matricielles
apply(matrix, 1, fun)         # Appliquer aux lignes
apply(matrix, 2, fun)         # Appliquer aux colonnes
margin.table(table, margin)   # Sommes marginales

# Distributions multivariees
library(mvtnorm)
dmvnorm(x, mean, sigma)       # Densite normale multivariee
rmvnorm(n, mean, sigma)       # Generer des echantillons

# Multinomiale
dmultinom(x, prob=p)          # Probabilite
rmultinom(n, size, prob)      # Generer des echantillons

# Visualisation
scatterplot3d(x, y, z)        # Nuage de points 3D
```

## Exercices

### Ex 1 : Distribution jointe discrete
Etant donne un tableau de probabilite jointe pour (X, Y) :
- Calculer les marginales P(X) et P(Y)
- Calculer la conditionnelle P(X | Y=5)
- Utiliser `margin.table()` et `conditionTable()`

### Ex 2 : Modele multinomial de la roulette
12 tours, resultats : rouge (18/38), noir (18/38), vert (2/38)
- Modeliser par Multinomiale(12, p)
- Generer tous les resultats possibles
- Calculer les probabilites
- Visualiser en 3D

### Ex 3 : Loi normale bivariee
Explorer la distribution normale 2D avec correlation

## Points cles
1. Les probabilites marginales ignorent les autres variables
2. Les probabilites conditionnelles se restreignent a un sous-ensemble
3. Independance : P(X,Y) = P(X)P(Y)
4. La loi multinomiale generalise la binomiale
5. Correlation dans la loi normale multivariee
