---
title: "TP3 : Intervalles de confiance"
sidebar_position: 3
---

# TP3 : Intervalles de confiance

## Presentation
Ce TP traite de la construction d'intervalles de confiance pour les moyennes et les variances a partir de donnees reelles. Les etudiants apprennent a travailler avec les distributions normale, de Student et du chi-deux.

## Objectifs pedagogiques
- Calculer des intervalles de confiance pour la moyenne (sigma connu et inconnu)
- Calculer des intervalles de confiance pour la variance
- Travailler avec les quantiles et les valeurs critiques
- Appliquer la loi de Student
- Utiliser la distribution du chi-deux pour l'inference sur la variance
- Valider les intervalles theoriques par des simulations

## Concepts cles

### 1. Intervalle de confiance pour la moyenne (sigma^2 connu)

Lorsque la variance sigma^2 de la population est connue, utiliser la loi normale :

**Formule** : X_bar +/- z_(alpha/2) x (sigma/sqrt(n))

Ou :
- X_bar = moyenne empirique
- z_(alpha/2) = quantile de N(0,1), ex. qnorm(1-alpha/2)
- sigma = ecart-type connu de la population
- n = taille de l'echantillon
- alpha = niveau de signification (ex. 0.05 pour un IC a 95%)

### 2. Intervalle de confiance pour la moyenne (sigma^2 inconnu)

Lorsque la variance est inconnue, utiliser la loi de Student :

**Formule** : X_bar +/- t_(n-1, alpha/2) x (S'/sqrt(n))

Ou :
- S' = ecart-type empirique (estimateur non biaise)
- t_(n-1, alpha/2) = quantile de la loi de Student a n-1 degres de liberte
- Utiliser `qt(1-alpha/2, df=n-1)` en R

### 3. Intervalle de confiance pour la variance

Base sur la distribution du chi-deux :

**Formule** : [(n-1)S'^2 / chi^2_(n-1, alpha/2), (n-1)S'^2 / chi^2_(n-1, 1-alpha/2)]

Ou :
- (n-1)S'^2/sigma^2 ~ chi^2_(n-1)
- chi^2_(n-1, alpha/2) = `qchisq(1-alpha/2, df=n-1)`
- chi^2_(n-1, 1-alpha/2) = `qchisq(alpha/2, df=n-1)`

Remarque : La borne inferieure utilise le quantile superieur, la borne superieure utilise le quantile inferieur (inversion)

### 4. Distributions cles

| Distribution | Cas d'utilisation | Fonctions R |
|--------------|----------|-------------|
| N(0, 1) | IC pour la moyenne, sigma connu | `qnorm()`, `pnorm()` |
| t(ddl) | IC pour la moyenne, sigma inconnu | `qt()`, `pt()` |
| chi^2(ddl) | IC pour la variance | `qchisq()`, `pchisq()` |

## Exercices

### Exercice 1 : Surreservation aerienne (quantiles)

Calculer combien de billets vendre tout en gerant le risque :
- Distribution binomiale pour les passagers presents
- Utiliser les quantiles pour trouver les limites de capacite
- Equilibrer revenus et couts de remboursement

### Exercice 2 : Temps d'execution d'un logiciel (IC pour la moyenne, sigma connu)

Jeu de donnees : `vitesse.csv` - 1000 semaines x 6 mesures quotidiennes
- Connu : mu = 120s, sigma^2 = 100
- Calculer les IC hebdomadaires pour la moyenne
- Verifier le taux de couverture (devrait etre ~95% pour alpha=0.05)

### Exercice 3 : Estimation de la variance (chi-deux)

- Calculer la variance pour chaque semaine
- Construire l'IC pour la variance avec la distribution chi^2
- Comparer avec la variance connue (sigma^2 = 100)

### Exercice 4 : Application de la loi de Student

Quand sigma est estime a partir des donnees (non donne), utiliser t au lieu de la loi normale.

## Reference des fonctions R

| Fonction | Objectif | Exemple |
|----------|---------|---------|
| `qnorm(p, mean, sd)` | Quantile normal | `qnorm(0.975, 0, 1)` -> 1.96 |
| `qt(p, df)` | Quantile de Student | `qt(0.975, df=5)` -> 2.571 |
| `qchisq(p, df)` | Quantile du chi-deux | `qchisq(0.975, df=5)` -> 12.83 |
| `qbinom(p, size, prob)` | Quantile binomial | `qbinom(0.95, 150, 0.75)` |
| `pbinom(q, size, prob)` | CDF binomiale | `pbinom(120, 150, 0.75)` |
| `tapply(X, INDEX, FUN)` | Appliquer par groupe | `tapply(time, week, mean)` |
| `read.table()` / `read.csv2()` | Charger des donnees | `read.csv2("data.csv")` |

## Guides d'interpretation

### Taux de couverture
Pour des intervalles de confiance a 95% :
- Theorique : 95% des intervalles contiennent le vrai parametre
- Verification empirique : ~95% des intervalles calcules devraient contenir la valeur connue
- De petites deviations sont attendues en raison de la variabilite d'echantillonnage

### Largeur de l'intervalle
- Plus grand n -> intervalles plus etroits -> plus de precision
- Niveau de confiance plus eleve -> intervalles plus larges
- L'IC de la variance est plus large que l'IC de la moyenne (plus variable)

### Quand utiliser quelle distribution

```
Intervalle de confiance pour la moyenne :
+-- sigma connu ? -> Utiliser la loi normale N(0,1)
+-- sigma inconnu ? -> Utiliser la loi de Student t(n-1)

Intervalle de confiance pour la variance :
+-- Toujours utiliser le chi-deux chi^2(n-1)
```

## Pieges courants

1. **Bornes du chi-deux** : La borne superieure de l'IC utilise le quantile INFERIEUR (inversion)
2. **Degres de liberte** : n-1, pas n
3. **Erreur standard** : sigma/sqrt(n) pour la moyenne, pas simplement sigma
4. **Estimateur non biaise** : Les fonctions R `var()` et `sd()` utilisent n-1 au denominateur
5. **Delimiteurs CSV** : Utiliser `read.csv2()` pour les fichiers separes par des points-virgules

## Points cles

1. Les intervalles de confiance quantifient l'incertitude de l'estimation
2. La largeur diminue en sqrt(n) (rendements decroissants)
3. La loi de Student tient compte de l'estimation de sigma a partir des donnees
4. Les intervalles de variance sont asymetriques (le chi-deux est asymetrique)
5. Le taux de couverture valide les calculs theoriques

## Extensions

- Comparer differents niveaux de confiance (90%, 95%, 99%)
- Intervalles de confiance par bootstrap (non parametrique)
- Intervalles unilateraux vs bilateraux
- Intervalles de prediction vs intervalles de confiance
