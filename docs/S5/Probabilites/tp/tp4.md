---
title: "TP4 : Tests d'hypotheses"
sidebar_position: 4
---

# TP4 : Tests d'hypotheses

## Presentation
Tests d'hypotheses statistiques pour prendre des decisions sur les parametres de la population a partir de donnees d'echantillons.

## Sujets abordes
1. **Tests de conformite** (tests a un echantillon)
2. **Tests d'homogeneite** (comparaison de deux echantillons)
3. **Puissance du test** et calculs de taille d'echantillon

## Concepts cles

### Cadre des tests d'hypotheses

**Hypothese nulle (H_0)** : Hypothese par defaut (ex. mu = mu_0)
**Hypothese alternative (H_1)** : Ce que l'on cherche a tester (ex. mu != mu_0)

**Statistique de test** : Calculee a partir des donnees, suit une distribution connue sous H_0
**p-valeur** : P(observer des donnees aussi extremes | H_0 vraie)
**Niveau de signification (alpha)** : Seuil de rejet (typiquement 0.05)

**Decision** : Rejeter H_0 si p-valeur < alpha ou si la statistique de test est dans la zone de rejet

### Test t a un echantillon (conformite)

Tester si la moyenne de la population est egale a une valeur hypothetique :
- H_0 : mu = mu_0 vs H_1 : mu != mu_0
- Statistique de test : T = (X_bar - mu_0)/(S'/sqrt(n)) ~ t(n-1)
- Fonction R : `t.test(x, mu=mu_0)`

### Test t a deux echantillons (homogeneite)

Comparer les moyennes de deux populations :
- H_0 : mu_1 = mu_2 vs H_1 : mu_1 != mu_2
- Variances egales : test t groupe
- Variances inegales : test de Welch
- Fonction R : `t.test(x, y, var.equal=TRUE/FALSE)`

### Puissance du test

**Puissance = 1 - beta** = P(rejeter H_0 | H_1 vraie)
- beta = erreur de type II (faux negatif)
- Plus grand echantillon -> plus grande puissance
- La taille de l'effet influence la puissance

## Exercices

### Ex 1 : Poids de poulpes (test t a un echantillon)
15 poulpes peses. La moyenne est-elle de 3000g ?
- Calculer l'IC pour la moyenne
- Effectuer le test de conformite
- Utiliser les approches manuelle et `t.test()`

### Ex 2 : Comparaison de traitements (test t a deux echantillons)
Deux groupes (n=12, n=8) avec differents traitements.
- Tester si les moyennes different
- Hypothese de variances egales (test t groupe)
- Examiner l'effet de la taille d'echantillon

### Ex 3 : Remplissage de bouteilles de lait (analyse de puissance)
sigma connu = 1ml, mu cible = 1000ml, n = 40 bouteilles.
- Tester la derive de calibrage
- Calculer la puissance pour detecter un ecart de 0.2ml
- Determiner le n necessaire pour 90% de puissance

## Fonctions R

```r noexec
t.test(x, mu=μ₀, conf.level=0.95)              # Un echantillon
t.test(x, y, var.equal=TRUE, conf.level=0.95)  # Deux echantillons
qt(p, df)                                        # Quantile de Student
pt(q, df)                                        # CDF de Student
pnorm(q, mean, sd)                              # CDF normale
```

## Regles de decision

**Test bilatere** (H_1 : mu != mu_0) :
- Rejeter H_0 si |T| > t_(alpha/2, ddl)
- Ou si p-valeur < alpha

**Test unilateral** (H_1 : mu > mu_0) :
- Rejeter H_0 si T > t_(alpha, ddl)

## Points cles
1. p-valeur > alpha -> ne pas rejeter H_0 (et non « accepter »)
2. Plus grand n -> plus de puissance, IC plus etroit
3. Significativite pratique vs significativite statistique
4. L'hypothese d'egalite des variances influence le choix du test
