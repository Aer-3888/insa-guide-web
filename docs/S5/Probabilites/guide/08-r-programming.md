---
title: "Chapitre 8 : Programmation R pour les statistiques"
sidebar_position: 8
---

# Chapitre 8 : Programmation R pour les statistiques

## 8.1 Bases de R

### Types de donnees et conversion

```r
txt <- "33"
nbr <- as.integer(txt)       # Chaine vers entier
is.numeric(nbr)              # TRUE
is.integer(nbr)              # TRUE
```

### Valeurs speciales

| Valeur | Signification | Exemple |
|---|---|---|
| `Inf` | Infini | `3/0` |
| `-Inf` | Infini negatif | `-3/0` |
| `NA` | Manquant / Non disponible | Les operations avec NA renvoient NA |
| `NaN` | Not a Number (pas un nombre) | `0/0` |

### Operations sur les chaines

```r
paste("une", "petite", "phrase")     # "une petite phrase"
paste0("a", "b")                     # "ab" (sans espace)
nchar("hello")                       # 5
sprintf("n = %d, mean = %.3f", 10, 3.14)  # Chaine formatee
```

### Variables

```r
x <- 5               # Affectation (prefere)
x = 5                # Fonctionne aussi
rm(x)                # Supprimer une variable
ls()                 # Lister toutes les variables
```

---

## 8.2 Vecteurs

### Creation

```r
c(1, 3, 5, 7, 9)            # Explicite : c() combine les elements
seq(0, 10, by=2)             # Sequence : 0, 2, 4, 6, 8, 10
0:10                         # Intervalle : 0, 1, 2, ..., 10 (inclus !)
rep(1:2, 5)                  # Repetition : 1, 2, 1, 2, 1, 2, 1, 2, 1, 2
```

**IMPORTANT** : R utilise l'indexation a partir de 1, et les intervalles sont inclusifs aux deux bornes. `1:10` inclut a la fois 1 et 10.

### Operations (vectorisees)

```r
x <- c(1, 2, 3)
x + 1                # c(2, 3, 4)      -- diffusion scalaire
x * 2                # c(2, 4, 6)
x + c(10, 20, 30)    # c(11, 22, 33)   -- element par element
sum(x)               # 6
cumsum(x)            # c(1, 3, 6)      -- somme cumulee
mean(x)              # 2
sd(x)                # 1 (corrigee, divise par n-1)
var(x)               # 1 (corrigee, divise par n-1)
length(x)            # 3
```

**Eviter les boucles quand c'est possible** -- utiliser les operations vectorisees pour la rapidite et la clarte.

---

## 8.3 Data frames

```r noexec
# Creer
df <- data.frame(name=c("A","B","C"), height=c(175,182,165), age=c(19,18,21))

# Acceder
df$name              # Colonne par nom
df[1, ]              # Premiere ligne
df[, "height"]       # Colonne par nom (chaine)
df[df$age > 19, ]    # Filtrer les lignes

# Informations
names(df)            # Noms des colonnes
str(df)              # Structure
summary(df)          # Statistiques descriptives
nrow(df)             # Nombre de lignes

# Exporter
write.table(df, "output.csv", sep=";", row.names=FALSE)

# Importer
data <- read.csv2("data.csv")           # Separateur point-virgule
data <- read.table("data.txt", header=TRUE, sep="\t")
```

---

## 8.4 Famille apply (eviter les boucles !)

```r noexec
# apply : pour les matrices
apply(matrix, 1, fun)       # Appliquer a chaque ligne
apply(matrix, 2, fun)       # Appliquer a chaque colonne

# tapply : operations par groupe (LA plus utile)
tapply(values, groups, function)
# Exemple : vitesse moyenne par experience
tapply(data$Speed, data$Expt, mean)

# sapply/lapply : pour les listes/vecteurs
sapply(1:5, function(x) x^2)   # Renvoie un vecteur : 1, 4, 9, 16, 25

# replicate : repeter une expression
replicate(1000, mean(rnorm(20)))  # 1000 moyennes d'echantillons de taille 20
```

---

## 8.5 Fonctions de distributions de probabilite

R utilise un **schema de nommage coherent** : `[d|p|q|r]nom_distribution`.

| Prefixe | Type de fonction | Renvoie | Exemple |
|---|---|---|---|
| `d` | Densite/Masse (PDF/PMF) | $f(x)$ ou $P(X=x)$ | `dnorm(0, 0, 1)` |
| `p` | CDF | $P(X \leq x)$ | `pnorm(1.96, 0, 1)` |
| `q` | Quantile (CDF inverse) | $x$ tel que $P(X \leq x) = p$ | `qnorm(0.975, 0, 1)` |
| `r` | Generation aleatoire | Echantillon de taille $n$ | `rnorm(100, 0, 1)` |

### Reference complete des distributions

| Distribution | Nom R | Parametres |
|---|---|---|
| Normale | `norm` | `mean`, `sd` |
| Binomiale | `binom` | `size` (n), `prob` (p) |
| Poisson | `pois` | `lambda` |
| Exponentielle | `exp` | `rate` ($\lambda$) |
| Uniforme | `unif` | `min`, `max` |
| Geometrique | `geom` | `prob` |
| Student t | `t` | `df` |
| Chi-deux | `chisq` | `df` |
| F | `f` | `df1`, `df2` |
| Hypergeometrique | `hyper` | `m` (succes), `n` (echecs), `k` (tirages) |
| Multinomiale | `multinom` | vecteur `prob` |

### Patrons d'utilisation courants

```r
# P(X <= 5) pour X ~ Binomiale(10, 0.25)
pbinom(5, size=10, prob=0.25)

# P(X >= 6) = 1 - P(X <= 5)
1 - pbinom(5, size=10, prob=0.25)

# 95e percentile de N(0,1)
qnorm(0.95)                           # 1.645 (unilateral)
qnorm(0.975)                          # 1.960 (bilateral, alpha=0.05)

# Generer 1000 echantillons exponentiels avec lambda=2
rexp(1000, rate=2)

# Probabilite multinomiale
dmultinom(c(5, 5, 2), prob=c(18/38, 18/38, 2/38))
```

---

## 8.6 Graphiques

### Graphiques de base

```r noexec
# Nuage de points
plot(x, y, type="p", col="blue", pch=19, main="Titre", xlab="X", ylab="Y")

# Courbe
plot(x, y, type="l", lwd=2, col="red")

# Points et lignes
plot(x, y, type="b")

# Courbe de fonction
curve(dnorm(x, 0, 1), from=-4, to=4, col="blue", lwd=2)
curve(dt(x, df=5), add=TRUE, col="red", lwd=2, lty=2)  # Superposer

# Histogramme
hist(data, freq=FALSE, breaks=30, col="lightblue", border="white",
     main="Titre", xlab="Valeur", ylab="Densite")

# Diagramme en barres
barplot(counts, names.arg=labels, col="steelblue")
```

### Personnalisation

```r noexec
# Legende
legend("topright", legend=c("Normale", "Student"), col=c("blue","red"),
       lwd=2, lty=c(1,2))

# Grille
grid()

# Lignes de reference
abline(h=0, col="gray", lty=2)       # Horizontale
abline(v=1.96, col="red", lty=3)     # Verticale

# Graphiques multiples
par(mfrow=c(2,2))                     # Grille 2x2
# ... quatre graphiques ...
par(mfrow=c(1,1))                     # Reinitialiser

# Segments
segments(x0, y0, x1, y1, col="blue", lwd=2)
```

---

## 8.7 Tests statistiques

```r noexec
# Test t a un echantillon
t.test(x, mu=100, conf.level=0.95)

# Test t a deux echantillons
t.test(x, y, var.equal=TRUE)           # Groupe (variances egales)
t.test(x, y, var.equal=FALSE)          # Welch (variances inegales)

# Test z (sigma connu)
library(TeachingDemos)
z.test(x, mu=100, stdev=10)

# Test de normalite de Shapiro-Wilk
shapiro.test(x)

# Test de Kolmogorov-Smirnov
ks.test(x, "pnorm", mean(x), sd(x))

# Acceder aux resultats du test
result <- t.test(x, mu=100)
result$statistic                       # Statistique de test
result$p.value                         # p-valeur
result$conf.int                        # Intervalle de confiance
result$estimate                        # Parametre estime
```

---

## 8.8 Echantillonnage et simulation

```r
set.seed(42)                           # Reproductibilite

# Echantillonnage aleatoire
sample(1:6, 10, replace=TRUE)          # Lancer un de 10 fois
sample(c("R","N"), 5, replace=FALSE)   # Tirer 5 boules sans remise

# Patron de simulation : repeter l'experience de nombreuses fois
n_sim <- 10000
results <- replicate(n_sim, {
  data <- rnorm(20, mean=100, sd=15)
  mean(data)
})
hist(results, freq=FALSE)              # Distribution des moyennes

# Simulation multinomiale
rmultinom(1000, size=12, prob=c(18/38, 18/38, 2/38))
```

---

## 8.9 Pieges courants

| Piege | Approche correcte |
|---------|------------------|
| R divise par $n-1$ dans `var()`/`sd()` | C'est l'estimateur non biaise $S'^2$ ; si vous avez besoin de $S^2$, multipliez par $(n-1)/n$ |
| `read.csv()` utilise la virgule comme separateur | Utilisez `read.csv2()` pour les points-virgules (format europeen) |
| `hist()` affiche les effectifs par defaut | Utilisez `freq=FALSE` pour la densite (necessaire pour superposer des courbes theoriques) |
| Oublier `add=TRUE` dans `curve()` | Sans cela, un nouveau graphique est cree au lieu de superposer |
| `pnorm(x)` donne $P(X \leq x)$ | Pour $P(X > x)$, utilisez `1 - pnorm(x)` ou `pnorm(x, lower.tail=FALSE)` |
| `sample()` est par defaut `replace=FALSE` | Specifiez `replace=TRUE` pour l'echantillonnage avec remise |

---

## AIDE-MEMOIRE -- Fonctions R

| Tache | Fonction |
|------|----------|
| Moyenne empirique | `mean(x)` |
| Ecart-type corrige | `sd(x)` ($S'$, divise par $n-1$) |
| Variance corrigee | `var(x)` ($S'^2$, divise par $n-1$) |
| Somme cumulee | `cumsum(x)` |
| Moyenne cumulee | `cumsum(x) / (1:length(x))` |
| Operation par groupe | `tapply(values, groups, function)` |
| Quantile normal | `qnorm(p, mean, sd)` |
| Quantile Student | `qt(p, df)` |
| Quantile chi-deux | `qchisq(p, df)` |
| Test t a un echantillon | `t.test(x, mu=m0)` |
| Test t a deux echantillons | `t.test(x, y, var.equal=T/F)` |
| Test de normalite | `shapiro.test(x)` |
| Reproductibilite | `set.seed(n)` |
