---
title: "Chapitre 08 -- Programmation R"
sidebar_position: 8
---

# Chapitre 08 -- Programmation R

> **Idee centrale :** R est la boite a outils pour tout le cours. Ce chapitre est une reference pratique couvrant tout ce dont tu as besoin.

---

## 1. Les bases

### 1.1 Types de donnees

```r
# Numerique
x <- 3.14
class(x)  # "numeric"

# Entier
n <- 5L   # Le L force le type entier
class(n)  # "integer"

# Caractere
nom <- "Alice"
class(nom)  # "character"

# Logique
vrai <- TRUE
faux <- FALSE
class(vrai)  # "logical"

# Facteur (variable categorielle)
categorie <- factor(c("A", "B", "A", "C"))
levels(categorie)  # "A" "B" "C"
```

### 1.2 Vecteurs

```r
# Creation
v <- c(1, 4, 7, 2, 9)
w <- 1:10          # sequence de 1 a 10
s <- seq(0, 1, by = 0.1)  # 0.0, 0.1, 0.2, ..., 1.0
r <- rep(0, 5)     # 5 zeros
r2 <- rep(c(1, 2), times = 3)  # 1 2 1 2 1 2
r3 <- rep(c(1, 2), each = 3)   # 1 1 1 2 2 2

# Indexation (commence a 1 en R !)
v[1]        # premier element
v[c(1, 3)]  # elements 1 et 3
v[-2]       # tout sauf le 2eme
v[v > 5]    # filtrage logique

# Operations vectorisees
v + 10      # ajoute 10 a chaque element
v * 2       # multiplie chaque element par 2
sum(v)      # somme
length(v)   # nombre d'elements
```

### 1.3 Gestion des NA

```r
x <- c(5, NA, 3, NA, 7)
is.na(x)       # FALSE TRUE FALSE TRUE FALSE
sum(x)          # NA (par defaut)
sum(x, na.rm = TRUE)  # 15 (ignore les NA)
mean(x, na.rm = TRUE) # 5
x[!is.na(x)]   # 5 3 7 (supprimer les NA)
```

---

## 2. Matrices

```r
# Creation
M <- matrix(1:12, nrow = 3, ncol = 4)
M <- matrix(1:12, nrow = 3, byrow = TRUE)  # remplir par ligne

# Indexation
M[1, ]    # 1ere ligne
M[, 2]    # 2eme colonne
M[2, 3]   # element (2, 3)

# Operations
t(M)            # transposee
M %*% N         # produit matriciel
solve(A)        # inverse de A
det(A)          # determinant
diag(A)         # diagonale

# Construire la matrice X pour la regression
X <- cbind(1, x1, x2)  # 1 pour l'intercept
# IMPORTANT : ne jamais oublier la colonne de 1 !

# Regression matricielle
B_hat <- solve(t(X) %*% X) %*% t(X) %*% Y
```

---

## 3. Data frames

```r
# Creation
df <- data.frame(
  nom    = c("Alice", "Bob", "Charlie"),
  age    = c(22, 25, 21),
  note   = c(14.5, 12.0, 16.5)
)

# Acces aux colonnes
df$nom         # vecteur des noms
df[, "age"]    # colonne age
df[["note"]]   # colonne note

# Filtrage
df[df$age > 22, ]          # lignes ou age > 22
subset(df, note >= 14)      # equivalent

# Ajout de colonne
df$mention <- ifelse(df$note >= 14, "Bien", "AB")

# Resume
str(df)       # structure
summary(df)   # resume statistique
head(df, 3)   # 3 premieres lignes
nrow(df)      # nombre de lignes
ncol(df)      # nombre de colonnes

# attach / detach (utiliser les colonnes directement)
attach(df)
mean(note)    # au lieu de mean(df$note)
detach(df)
```

---

## 4. Import de donnees

```r
# CSV avec separateur virgule et point decimal
df <- read.csv("fichier.csv")

# CSV francais (separateur point-virgule, virgule decimale)
df <- read.csv2("fichier.csv")

# Fichier texte (separateur espace ou tabulation)
df <- read.table("fichier.txt", header = TRUE)

# Specifier le separateur
df <- read.table("fichier.txt", header = TRUE, sep = "\t")

# Fusionner deux tables
merged <- merge(df1, df2, by = "colonne_commune")

# Verifier l'import
head(df)
str(df)
summary(df)
```

---

## 5. Graphiques de base

### 5.1 Nuage de points

```r
plot(x, y,
     main = "Titre",
     xlab = "Axe X",
     ylab = "Axe Y",
     pch  = 19,           # type de point (19 = rond plein)
     col  = "steelblue",  # couleur
     cex  = 1.5)          # taille des points
```

### 5.2 Histogramme

```r
hist(x,
     breaks = 20,         # nombre de barres
     col    = "steelblue",
     main   = "Distribution",
     xlab   = "Valeur",
     probability = TRUE)  # densite au lieu d'effectifs
# Superposer une courbe
curve(dnorm(x, mean(x), sd(x)), add = TRUE, col = "red", lwd = 2)
```

### 5.3 Boxplot

```r
# Simple
boxplot(x, col = "lightgreen", main = "Boxplot")

# Par groupe
boxplot(valeur ~ groupe, data = df,
        col = c("red", "blue", "green"),
        main = "Comparaison par groupe")
abline(h = mean(df$valeur), col = "red", lwd = 2)  # ligne de la moyenne
```

### 5.4 Barplot

```r
barplot(table(categorie),
        col  = "coral",
        main = "Frequences",
        ylab = "Effectif")
```

### 5.5 Disposition multiple

```r
par(mfrow = c(2, 2))   # grille 2x2
plot(...)
hist(...)
boxplot(...)
barplot(...)
par(mfrow = c(1, 1))   # revenir a 1 seul
```

### 5.6 Ajouter des elements

```r
plot(x, y)
abline(modele, col = "red", lwd = 2)        # droite de regression
abline(h = 0, col = "blue", lty = 2)         # ligne horizontale
abline(v = 5, col = "green", lty = 3)        # ligne verticale
lines(x_new, y_new, col = "purple", lwd = 2) # courbe
points(x2, y2, col = "orange", pch = 17)     # ajouter des points
legend("topleft",
       legend = c("Regression", "Seuil"),
       col = c("red", "blue"),
       lty = c(1, 2), lwd = 2)
```

---

## 6. Distributions statistiques

R utilise un systeme de prefixes coherent pour toutes les distributions :

| Prefixe | Fonction | Description |
|---------|---------|-------------|
| `d` | `dnorm(x, mean, sd)` | Densite $f(x)$ |
| `p` | `pnorm(q, mean, sd)` | Fonction de repartition $P(X \leq q)$ |
| `q` | `qnorm(p, mean, sd)` | Quantile : $q$ tel que $P(X \leq q) = p$ |
| `r` | `rnorm(n, mean, sd)` | Simulation de $n$ valeurs aleatoires |

### Distributions disponibles

| Loi | Suffixe | Parametres | Exemple |
|-----|---------|-----------|---------|
| Normale | `norm` | `mean`, `sd` | `qnorm(0.975)` = 1.96 |
| Student | `t` | `df` | `qt(0.975, df = 10)` |
| Chi-deux | `chisq` | `df` | `qchisq(0.95, df = 5)` |
| Fisher | `f` | `df1`, `df2` | `qf(0.95, df1 = 3, df2 = 20)` |
| Exponentielle | `exp` | `rate` | `rexp(100, rate = 2)` |
| Uniforme | `unif` | `min`, `max` | `runif(100, 0, 1)` |
| Binomiale | `binom` | `size`, `prob` | `dbinom(3, size = 10, prob = 0.5)` |
| Poisson | `pois` | `lambda` | `rpois(100, lambda = 3)` |

### Exemples courants

```r
# Quantile a 97.5% de la loi normale standard
qnorm(0.975)  # 1.959964

# P(X <= 1.96) pour X ~ N(0,1)
pnorm(1.96)   # 0.975

# Quantile de Student
qt(0.975, df = 15)  # 2.131

# Quantile du chi-deux
qchisq(0.95, df = 10)  # 18.307

# Simuler 1000 valeurs N(0,1)
set.seed(42)
x <- rnorm(1000, mean = 0, sd = 1)
hist(x, breaks = 30, probability = TRUE)
curve(dnorm(x), add = TRUE, col = "red", lwd = 2)
```

---

## 7. Fonctions statistiques essentielles

### 7.1 Regression lineaire

```r
# Regression simple
mod <- lm(Y ~ X, data = df)

# Regression multiple
mod <- lm(Y ~ X1 + X2 + X3, data = df)

# Toutes les variables
mod <- lm(Y ~ ., data = df)

# Sans intercept
mod <- lm(Y ~ -1 + X, data = df)

# Resume
summary(mod)

# Table ANOVA
anova(mod)

# Coefficients
coef(mod)

# IC des coefficients
confint(mod)

# Prediction
predict(mod, newdata = data.frame(X = 5))
predict(mod, newdata = data.frame(X = 5), interval = "confidence")
predict(mod, newdata = data.frame(X = 5), interval = "prediction")

# Residus et valeurs ajustees
residuals(mod)
fitted(mod)

# Diagnostics
par(mfrow = c(2, 2)); plot(mod); par(mfrow = c(1, 1))

# Selection de variables
step(mod, direction = "backward")

# AIC
extractAIC(mod)

# VIF
library(car); vif(mod)
```

### 7.2 Tests statistiques

```r
# t-test
t.test(x, mu = 10)                  # 1 echantillon
t.test(x, y)                         # 2 echantillons (Welch)
t.test(x, y, var.equal = TRUE)       # 2 echantillons (Student)
t.test(x, y, paired = TRUE)          # apparie

# Test de proportion
prop.test(x = 45, n = 100, p = 0.5)

# Chi-deux
chisq.test(tableau)                   # independance
chisq.test(observe, p = theorique)    # adequation

# F-test (2 variances)
var.test(x, y)

# Bartlett (k variances)
bartlett.test(valeur ~ groupe, data = df)

# Shapiro-Wilk (normalite)
shapiro.test(x)

# Wilcoxon
wilcox.test(x, mu = 10)              # 1 echantillon
wilcox.test(x, y, paired = TRUE)      # apparie
wilcox.test(x, y)                     # 2 independants

# Kruskal-Wallis
kruskal.test(valeur ~ groupe, data = df)
```

### 7.3 ANOVA

```r
# ANOVA 1 facteur
mod <- lm(Y ~ Facteur, data = df)
anova(mod)

# ANOVA 2 facteurs sans interaction
mod <- lm(Y ~ A + B, data = df)

# ANOVA 2 facteurs avec interaction
mod <- lm(Y ~ A * B, data = df)

# Comparaisons multiples
TukeyHSD(aov(Y ~ Facteur, data = df))

library(emmeans)
emmeans(mod, pairwise ~ Facteur, adjust = "bonferroni")
```

---

## 8. Ecrire des fonctions

```r
# Fonction simple
calcul_ic <- function(donnees, alpha = 0.05) {
  n      <- length(donnees)
  moy    <- mean(donnees)
  s      <- sd(donnees)
  t_crit <- qt(1 - alpha/2, df = n - 1)
  marge  <- t_crit * s / sqrt(n)
  
  return(c(borne_inf = moy - marge,
           moyenne   = moy,
           borne_sup = moy + marge))
}

# Utilisation
notes <- c(12, 14, 11, 15, 13, 14, 12, 16)
calcul_ic(notes)
calcul_ic(notes, alpha = 0.01)  # IC a 99%
```

---

## 9. Astuces et bonnes pratiques

### 9.1 Reproductibilite

```r
set.seed(42)  # fixer la graine pour des resultats reproductibles
```

### 9.2 Repertoire de travail

```r
setwd("/chemin/vers/donnees")  # definir le repertoire
getwd()                         # verifier le repertoire actuel
```

### 9.3 Installer et charger des packages

```r
install.packages("car")   # installer une fois
library(car)               # charger a chaque session

# Packages utiles pour le cours
# car       : VIF, Anova type III
# emmeans   : comparaisons multiples
# rgl       : graphiques 3D
```

---

## CHEAT SHEET

### Aide-memoire rapide

| Tache | Code R |
|-------|--------|
| Lire un CSV | `read.csv("f.csv")` |
| Lire un CSV francais | `read.csv2("f.csv")` |
| Lire un TXT | `read.table("f.txt", header=T)` |
| Moyenne | `mean(x)` |
| Ecart-type | `sd(x)` |
| Variance | `var(x)` |
| Correlation | `cor(x, y)` |
| Resume | `summary(x)` |
| Regression | `lm(Y ~ X)` |
| ANOVA | `anova(lm(Y ~ G))` |
| t-test | `t.test(x, mu=)` |
| Chi-deux | `chisq.test(tab)` |
| Normalite | `shapiro.test(x)` |
| Prediction | `predict(mod, newdata=)` |
| Nuage | `plot(x, y)` |
| Histogramme | `hist(x)` |
| Boxplot | `boxplot(y ~ g)` |
| Quantile normal | `qnorm(0.975)` = 1.96 |
| Quantile Student | `qt(0.975, df=)` |

### Formule R pour les modeles

| Syntaxe | Signification |
|---------|--------------|
| `Y ~ X` | $Y = \beta_0 + \beta_1 X$ |
| `Y ~ X1 + X2` | $Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2$ |
| `Y ~ .` | $Y$ en fonction de toutes les autres colonnes |
| `Y ~ -1 + X` | Sans intercept |
| `Y ~ A * B` | $A + B + A:B$ (interaction) |
| `Y ~ A + B` | Effets principaux seulement |
| `Y ~ poly(X, 2)` | $Y = \beta_0 + \beta_1 X + \beta_2 X^2$ |
| `Y ~ log(X)` | $Y = \beta_0 + \beta_1 \ln(X)$ |
| `log(Y) ~ X` | $\ln(Y) = \beta_0 + \beta_1 X$ |
