---
title: "TP1 : Introduction a R et distributions de probabilite"
sidebar_position: 1
---

# TP1 : Introduction a R et distributions de probabilite

## Presentation
Ce TP introduit les concepts fondamentaux de la programmation R et les fonctions de base des distributions de probabilite. Les etudiants apprennent la manipulation de donnees, la conversion de types et comment travailler avec les distributions de probabilite courantes.

## Objectifs pedagogiques
- Maitriser la syntaxe de base de R et les structures de donnees
- Comprendre la conversion de types et la manipulation de chaines
- Travailler avec les vecteurs et les data frames
- Appliquer les fonctions de distributions de probabilite (d*, p*, q*, r*)
- Visualiser les distributions exponentielles
- Simuler des processus aleatoires

## Concepts cles

### 1. Conversion de types et manipulation de chaines
- **Conversion de type** : Utiliser `as.integer()`, `as.numeric()`, etc. pour convertir entre types
- **Verification de type** : Utiliser `is.integer()`, `is.numeric()` pour verifier les types
- **Operations sur les chaines** : `paste()` pour la concatenation, `nchar()` pour la longueur de chaine

### 2. Valeurs speciales
- `Inf` : Resultat d'une division par zero (ex. `3/0`)
- `NA` : Non attribue / Non disponible - valeurs manquantes

### 3. Vecteurs
Quatre methodes principales pour creer des vecteurs :
- `c()` : Combiner des elements explicitement
- `seq(from, to, by)` : Generer des sequences avec un pas
- `start:end` : Generer des sequences d'entiers (bornes inclusives)
- `rep(values, times)` : Repeter des valeurs

**Important** : Les boucles R utilisent des bornes inclusives : `for(i in 1:10)` inclut a la fois 1 et 10.

### 4. Data frames
Structure essentielle pour l'analyse statistique :
- Creer avec `data.frame(colonne1=vecteur1, colonne2=vecteur2, ...)`
- Acceder aux colonnes : `df$nomColonne` ou `df[,"nomColonne"]`
- Obtenir les noms de colonnes : `names(df)`
- Exporter : `write.table(df, "fichier.csv", sep=";", row.names=FALSE, col.names=FALSE)`

### 5. Fonctions de distributions de probabilite

R utilise un schema de nommage coherent pour les distributions :

| Prefixe | Fonction | Description |
|--------|----------|-------------|
| `d*` | Densite | Fonction de densite/masse de probabilite |
| `p*` | Probabilite | Fonction de repartition (CDF) |
| `q*` | Quantile | CDF inverse (percentiles) |
| `r*` | Aleatoire | Generer des echantillons aleatoires |

**Distributions courantes** :
- `norm` : Loi normale
- `binom` : Loi binomiale
- `unif` : Loi uniforme
- `exp` : Loi exponentielle
- `pois` : Loi de Poisson
- `geom` : Loi geometrique
- `t` : Loi de Student
- `chisq` : Loi du chi-deux
- `f` : Loi de Fisher

**Exemple** : Pour la loi normale N(mu, sigma) :
```r noexec
dnorm(x, mean=μ, sd=σ)  # Densite en x
pnorm(x, mean=μ, sd=σ)  # P(X ≤ x)
qnorm(p, mean=μ, sd=σ)  # Valeur x ou P(X ≤ x) = p
rnorm(n, mean=μ, sd=σ)  # Generer n echantillons aleatoires
```

## Exercices

### Exercice 1 : Simulation de la loi exponentielle

**Theorie** : Loi exponentielle de parametre lambda :
- Moyenne : 1/lambda
- Ecart-type : 1/lambda
- Densite : f(x) = lambda*e^(-lambda*x) pour x >= 0

**Tache** : Visualiser les courbes exponentielles pour lambda = 0.5, 1, 2 et simuler des echantillons.

**Fonctions cles** :
- `curve()` : Tracer des fonctions mathematiques
- `rexp(n, rate=lambda)` : Generer des echantillons exponentiels aleatoires
- `hist()` : Creer des histogrammes
- `legend()` : Ajouter des legendes

### Exercice 2 : Probleme de l'urne

**Scenario** : Une urne contient p boules rouges et q boules noires. Tirer k boules sans remise.

**Concepts cles** :
- `rep(value, times)` : Repeter des elements pour creer l'urne
- `sample(x, size, replace=FALSE)` : Echantillonnage aleatoire
- `table()` : Compter les occurrences
- `barplot()` : Visualiser les frequences

### Exercice 3 : Frequence du de

**Theorie** : Loi des grands nombres - lorsque la taille de l'echantillon augmente, la frequence empirique converge vers la probabilite theorique.

**Tache** : Simuler des lancers de de et observer la convergence de la frequence vers 1/6.

## Reference des fonctions R

| Fonction | Objectif | Exemple |
|----------|---------|---------|
| `help(function)` | Obtenir la documentation | `help(curve)` |
| `curve(expr, from, to, add)` | Tracer une fonction | `curve(exp(x), 0, 5)` |
| `hist(x, freq, breaks)` | Histogramme | `hist(data, freq=FALSE)` |
| `plot(x, y, type, xlim, ylim)` | Graphique generique | `plot(x, y, type="l")` |
| `legend(position, legend, col)` | Ajouter une legende | `legend("topright", ...)` |
| `sample(x, size, replace)` | Echantillonnage aleatoire | `sample(1:6, 100, TRUE)` |
| `table(x)` | Tableau de frequences | `table(rolls)` |
| `barplot(height, names.arg)` | Diagramme en barres | `barplot(counts)` |

## Conseils et pieges courants

1. **Bornes des boucles** : Les boucles R sont inclusives aux deux bornes
2. **Data frames vs vecteurs** : Utiliser `$` pour les colonnes, `[]` pour les lignes
3. **Densite vs effectifs** : Mettre `freq=FALSE` dans `hist()` pour tracer la densite
4. **Ajouter a un graphique** : Utiliser `add=TRUE` dans `curve()` pour superposer sur un graphique existant
5. **Repertoire de travail** : Utiliser `setwd()` ou verifier le repertoire courant avec `getwd()`

## Pour aller plus loin

1. Essayer differentes distributions (binomiale, Poisson, uniforme)
2. Comparer distributions theoriques et empiriques avec des tailles d'echantillon croissantes
3. Explorer le theoreme central limite en sommant des variables aleatoires
4. Creer des fonctions personnalisees pour les taches repetitives

## Ressources

- Documentation R : `help(nom_fonction)` ou `?nom_fonction`
- Parametres des distributions : Consulter la page d'aide de chaque distribution
- Visualisation : Experimenter avec les parametres `col`, `lwd`, `lty` pour de meilleurs graphiques
