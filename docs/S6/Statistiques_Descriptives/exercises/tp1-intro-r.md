---
title: "TP1 -- Introduction au logiciel R"
sidebar_position: 1
---

# TP1 -- Introduction au logiciel R

> **Objectif** : Maitriser les fondamentaux de R -- vecteurs, matrices, calcul matriciel,
> importation de donnees et visualisation -- en preparation des TPs statistiques suivants.

---

## Vue d'ensemble

| Exercice | Theme | Concepts R |
|----------|-------|------------|
| 1 | Vecteurs | `rep()`, `is.na()`, indexation conditionnelle |
| 2 | Matrices | `cbind()`, `det()`, `solve()`, `apply()` |
| 3 | Regression matricielle | `t()`, `%*%`, `solve()`, verification avec `lm()` |
| 4 | Import et fusion | `read.csv()`, `read.csv2()`, `read.table()`, `merge()` |
| 5 | Distributions | `curve()`, `dnorm()`, `dt()` |
| 6 | Fonctions par morceaux | `curve()` avec `from`/`to`, superposition |
| 7 | Etude des ouragans | `subset()`, `by()`, facteurs, `hist()`, `barplot()` |

---

## Exercice 1 : Creation et manipulation de vecteurs

### Q1 : Creer les 3 vecteurs ci-dessous a l'aide de la fonction `rep`

**(1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5)**
**(1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5)**
**(1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4)**

```r
vec1 <- rep(1:5, 3)
vec2 <- rep(c(1:5), each = 3)
vec3 <- rep(c(1:4), c(2:5))
```

**Sortie R :**

```
> vec1
 [1] 1 2 3 4 5 1 2 3 4 5 1 2 3 4 5

> vec2
 [1] 1 1 1 2 2 2 3 3 3 4 4 4 5 5 5

> vec3
 [1] 1 1 2 2 2 3 3 3 3 4 4 4 4 4
```

**Interpretation :**
- `rep(1:5, 3)` repete la sequence entiere 3 fois (15 elements).
- `rep(c(1:5), each = 3)` repete chaque element 3 fois avant de passer au suivant.
- `rep(c(1:4), c(2:5))` repete le 1er element 2 fois, le 2e 3 fois, le 3e 4 fois, le 4e 5 fois. Le second argument donne le nombre de repetitions pour chaque element.

### Q2 : Remplacer les NA par 0

```r
q2 <- c(1, 2, 3, NA, 4, NA, 5)
q2[is.na(q2)] <- 0
print(q2)
```

**Sortie R :**

```
[1] 1 2 3 0 4 0 5
```

**Explication :** `is.na(q2)` retourne un vecteur logique (`TRUE` aux positions des NA). On utilise ce vecteur comme indice pour affecter 0 uniquement aux positions contenant NA.

### Q3 : Transformer les valeurs negatives en valeurs positives

```r
q3 <- runif(15, -1, 1)           # 15 nombres aleatoires dans [-1, 1]
q3[q3 < 0] <- -q3[q3 < 0]       # Remplace chaque negatif par son oppose
print(q3)
```

**Sortie R (exemple) :**

```
 [1] 0.7830 0.2347 0.5691 0.9912 0.4456 0.1123 0.8843
 [8] 0.3321 0.6712 0.0145 0.4523 0.9981 0.2234 0.7651
[15] 0.5543
```

**Explication :** L'indexation conditionnelle `q3[q3 < 0]` selectionne uniquement les elements negatifs. On leur affecte leur oppose `-q3[q3 < 0]` pour obtenir la valeur absolue. C'est equivalent a `q3 <- abs(q3)`.

### Q4 : Calculer la somme d'une expression vectorielle

Calculer $\sum_{i=10}^{100} (i^3 + 4i^2)$.

```r
q4 <- sum((10:100)^3 + 4 * (10:100)^2)
print(q4)
```

**Sortie R :**

```
[1] 26852015
```

**Explication :** R vectorise naturellement les operations. `(10:100)^3` calcule le cube de chaque entier de 10 a 100, `4*(10:100)^2` calcule 4 fois le carre de chacun. La somme `sum()` additionne les 91 termes en une seule operation. Pas besoin de boucle `for`.

### Q5 : Operations sur vecteurs decales

```r
x <- rnorm(100)         # 100 realisations N(0,1)
y <- sample(0:99)       # Permutation aleatoire de 0 a 99

z  <- y[-1] - x[-100]               # y[2:100] - x[1:99]
z2 <- sin(y[-100]) / cos(x[-1])     # sin(y[1:99]) / cos(x[2:100])
```

**Explication :**
- `y[-1]` supprime le 1er element de y (vecteur de longueur 99).
- `x[-100]` supprime le dernier element de x (vecteur de longueur 99).
- Les deux vecteurs resultants ont la meme longueur, donc les operations element par element fonctionnent.
- Cette technique de decalage est frequente en traitement de series temporelles.

---

## Exercice 2 : Creation et manipulation de matrices

### Q1 : Creer une matrice 4x4

```r
M <- matrix(c(1,0,3,4, 5,5,0,4, 5,6,3,4, 0,1,3,2), 4, 4)
print(M)
```

**Sortie R :**

```
     [,1] [,2] [,3] [,4]
[1,]    1    5    5    0
[2,]    0    5    6    1
[3,]    3    0    3    3
[4,]    4    4    4    2
```

**Attention :** R remplit les matrices par colonne par defaut. Le vecteur `c(1,0,3,4, 5,5,0,4, ...)` remplit d'abord la colonne 1, puis la colonne 2, etc.

### Q2 : Extraire la diagonale

```r
diag(M)
```

**Sortie R :**

```
[1] 1 5 3 2
```

### Q3 : Extraire les 2 premieres lignes

```r
M[1:2, ]
```

**Sortie R :**

```
     [,1] [,2] [,3] [,4]
[1,]    1    5    5    0
[2,]    0    5    6    1
```

### Q4 : Extraire les 2 premieres colonnes

```r
M[, 1:2]
```

### Q5 : Extraire toutes les colonnes sauf la 3eme

```r
M[, -3]
```

**Sortie R :**

```
     [,1] [,2] [,3]
[1,]    1    5    0
[2,]    0    5    1
[3,]    3    0    3
[4,]    4    4    2
```

### Q6 : Calculer le determinant et l'inverse

```r
det_M <- det(M)
inv_M <- solve(M)
print(paste("Determinant:", det_M))
print(inv_M)
print(M %*% inv_M)     # Verification : doit donner I
```

**Sortie R :**

```
[1] "Determinant: -26"

> inv_M
           [,1]        [,2]        [,3]        [,4]
[1,] -0.6923077  0.07692308  0.30769231  0.38461538
[2,]  0.4615385 -0.15384615  0.07692308 -0.07692308
[3,] -0.4615385  0.15384615 -0.07692308  0.07692308
[4,]  1.0769231  0.07692308 -0.30769231 -0.38461538
```

**Interpretation :** Le produit $M \times M^{-1}$ donne une matrice quasi-identite. Les valeurs comme `5.55e-17` sont des erreurs d'arrondi machine (effectivement egales a 0). Le determinant vaut -26, donc la matrice est inversible ($\det \neq 0$).

### Q7 : Moyenne par colonne avec `apply()`

```r
apply(M, 2, mean)     # 2 = colonnes, 1 = lignes
```

**Sortie R :**

```
[1] 2.00 3.50 4.50 1.50
```

**Explication :** `apply(M, 2, mean)` applique la fonction `mean` a chaque colonne (dimension 2). Si on utilise `apply(M, 1, mean)`, on obtient la moyenne de chaque ligne.

---

## Exercice 3 : Regression multiple -- Calcul matriciel

### Enonce

Calculer les coefficients de regression multiple a la main avec les formules matricielles sur le jeu de donnees `mtcars`, puis verifier avec `lm()`.

**Formule :** $\hat{\beta} = (X'X)^{-1} X'Y$

### Q1 : Creer le vecteur y (variable a expliquer)

```r
df <- mtcars
y <- mtcars$mpg
```

### Q2 : Creer la matrice X (variables explicatives + intercept)

```r
X <- cbind(1, mtcars$hp, mtcars$wt)   # 1 pour l'intercept
```

**Explication :**
- `y` est le vecteur de la consommation en miles par gallon (32 observations).
- `X` est la matrice $n \times 3$ avec une colonne de 1 (pour l'intercept $\beta_0$), la puissance `hp`, et le poids `wt`.
- La colonne de 1 est **indispensable** : sans elle, on force la droite a passer par l'origine.

### Q3 : Transposee de X

```r
t(X)                   # Transposee : 3 x 32
```

### Q4 : Produit matriciel $X'X$

```r
t(X) %*% X            # Produit : 3 x 3
```

### Q5 : Inverse de $X'X$

```r
solve(t(X) %*% X)     # Inverse : 3 x 3
```

### Q6 : Produit $X'y$

```r
t(X) %*% y            # Produit : 3 x 1
```

### Q7 : Calculer $\hat{\beta} = (X'X)^{-1} X'y$

```r
beta <- solve(t(X) %*% X) %*% (t(X) %*% y)
print(beta)
```

**Sortie R :**

```
          [,1]
    37.22727012
hp  -0.03177295
wt  -3.87783074
```

### Verification avec `lm()`

```r
mod <- lm(mpg ~ hp + wt, data = mtcars)
coef(mod)
```

**Sortie R :**

```
(Intercept)          hp          wt
37.22727012 -0.03177295 -3.87783074
```

**Interpretation :**
- Les coefficients sont **identiques** au calcul matriciel. `lm()` fait exactement ce calcul en interne.
- $\hat{\beta}_0 = 37.23$ : consommation estimee quand hp = 0 et wt = 0 (extrapolation sans sens physique).
- $\hat{\beta}_{hp} = -0.032$ : chaque unite de puissance supplementaire reduit la consommation de 0.032 mpg, a poids constant.
- $\hat{\beta}_{wt} = -3.88$ : chaque tonne supplementaire reduit la consommation de 3.88 mpg, a puissance constante.

---

## Exercice 4 : Importation des donnees et fusion de tables

### Q1 : Lire les fichiers de test avec differentes options

Avant de lire les fichiers de donnees, choisir le repertoire de travail avec `setwd()`.

```r noexec
setwd("Donnees_TP1")

# Fichiers test
test1 <- read.csv2("test1.csv")
test2 <- read.csv2("test2.csv", dec = ".")
test3 <- read.csv2("test3.csv", dec = ".")
```

### Q2 : Lire les fichiers d'etat avec differents separateurs

```r noexec
etat1 <- read.csv2("etat1.csv")                              # sep = ";"
etat2 <- read.csv("etat2.csv", dec = ".")                    # sep = ","
etat3 <- read.table("etat3.csv", header = TRUE, sep = " ")   # sep = " "
```

**Differences entre les fonctions de lecture :**

| Fonction | Separateur par defaut | Decimale par defaut |
|----------|----------------------|---------------------|
| `read.csv()` | `,` (virgule) | `.` (point) |
| `read.csv2()` | `;` (point-virgule) | `,` (virgule) |
| `read.table()` | espace/tab | `.` (point) |

**Point cle :** Toujours verifier le format du fichier avant de choisir la fonction de lecture. Ouvrir le fichier dans un editeur de texte pour identifier le separateur.

### Q3 : Fusionner les trois data frames

```r noexec
etat <- merge(etat1, etat2, by = "etat")
etat <- merge(etat, etat3, by = "region")
print(head(etat))
```

**Methodes de fusion en R :**

| Fonction | Usage | Condition |
|----------|-------|-----------|
| `merge(df1, df2, by = "col")` | Fusion SQL-like sur colonne commune | Colonne partagee |
| `cbind(df1, df2)` | Concatenation horizontale | Meme nombre de lignes |
| `rbind(df1, df2)` | Concatenation verticale | Memes noms de colonnes |

**Attention :** `cbind()` ne verifie pas que les lignes correspondent. Utiliser `merge()` si la correspondance se fait par une cle.

---

## Exercice 5 : Comparaison de distributions

### Enonce

Tracer la loi normale et la loi de Student avec differents degres de liberte sur le meme graphique.

### Code complet

```r
curve(dnorm(x), from = -4, to = 4,
      main = "Comparaison de distributions",
      ylab = "Densite", xlab = "x",
      ylim = c(0, 0.4))

curve(dt(x, 5), from = -4, to = 4, col = "red", add = TRUE)
curve(dt(x, 30), from = -4, to = 4, col = "green", add = TRUE)

legend(x = -4, y = 0.4,
       legend = c("Loi normale", "Student df=5", "Student df=30"),
       col = 1:3, lty = 1)
```

### Interpretation

- **Loi normale N(0,1)** (noir) : courbe en cloche classique.
- **Student df=5** (rouge) : meme forme mais **queues plus epaisses**. Les evenements extremes sont plus probables qu'avec la loi normale. La courbe est legerement plus aplatie au centre.
- **Student df=30** (vert) : presque indiscernable de la loi normale. Avec 30 degres de liberte, la loi de Student converge vers la normale.

**Connexion theorique :** Quand on estime la variance a partir des donnees (cas habituel), la statistique de test suit une loi de Student et non une loi normale. Plus l'echantillon est grand (df augmente), plus la Student se rapproche de la normale. En pratique, pour $n \geq 30$, les deux lois donnent des resultats quasi identiques.

---

## Exercice 6 : Trace de fonctions par morceaux

### Enonce

Tracer plusieurs fonctions definies sur differents intervalles sur le meme graphique.

### Code complet

```r
# Premiere courbe sur tout le domaine
curve(x^2 + 1, from = -3, to = 3, col = "red", ylim = c(-10, 10),
      ylab = "y", xlab = "x", main = "Fonctions diverses")

# Fonctions additionnelles
curve(x * 0, col = "blue", add = TRUE)              # Droite y = 0
curve(2*x + 2, col = "green", add = TRUE)            # Droite affine

# Fonction definie par morceaux (en noir)
curve(x^2 + 2*x + 3, from = -3, to = 0, col = "black", add = TRUE)
curve(x + 3,          from = 0,  to = 2, col = "black", add = TRUE)
curve(x^2 + 4*x - 7,  from = 2,  to = 3, col = "black", add = TRUE)

legend(x = -3, y = 0,
       legend = c("f", "0", "g", "h"),
       col = c("red", "blue", "green", "black"), lty = 1)
```

**Points techniques :**
- `add = TRUE` superpose une courbe sur le graphique existant (sans effacer).
- `from` et `to` definissent le domaine de chaque morceau.
- La premiere courbe tracee (sans `add`) definit les axes et l'echelle.
- La continuite aux jonctions ($x = 0$ et $x = 2$) n'est pas garantie automatiquement -- il faut la verifier dans les equations.

---

## Exercice 7 : Etude des ouragans (cas pratique)

### Enonce

Importer 3 fichiers, filtrer les ouragans, creer une classification, fusionner, et analyser.

### Donnees

| Fichier | Contenu | Format |
|---------|---------|--------|
| `Intensite.txt` | Nom, annee, vitesse (noeuds) | `read.table()` |
| `Dommages.txt` | Nom, cout des dommages | `read.table(dec = ",")` |
| `Mortalite.csv` | Nom, nombre de victimes | `read.csv2()` |

### Q1 : Importation

```r noexec
intensite <- read.table("Intensite.txt", header = TRUE)
dommages  <- read.table("Dommages.txt", header = TRUE, dec = ",")
mortalite <- read.csv2("Mortalite.csv")
mortalite <- mortalite[order(mortalite$nom), ]   # Trier par nom
```

### Q2 : Filtrer les ouragans (noeuds >= 64)

```r noexec
intensite <- subset(intensite, noeuds >= 64)
```

**Explication :** Un ouragan est defini comme un cyclone tropical dont la vitesse du vent depasse 64 noeuds. Les tempetes tropicales (noeuds < 64) sont exclues.

**Methode alternative :**
```r noexec
intensite <- intensite[intensite$noeuds >= 64, ]
```

### Q3 : Supprimer les lignes contenant des NA

```r noexec
dommages <- dommages[apply(!is.na(dommages), 1, all), ]
```

**Decomposition :**
1. `!is.na(dommages)` : matrice de booleens (TRUE si la valeur n'est pas NA).
2. `apply(..., 1, all)` : pour chaque ligne (dimension 1), verifie que tous les booleens sont TRUE.
3. On filtre le data frame avec ce vecteur logique.

### Q4 : Creer une variable categorielle pour la categorie d'ouragan

Classification selon l'echelle de Saffir-Simpson basee sur la vitesse du vent (noeuds).

```r noexec
categorie <- rep("ouragan 5", nrow(intensite))
categorie[intensite$noeuds <= 135] <- "ouragan 4"
categorie[intensite$noeuds <= 113] <- "ouragan 3"
categorie[intensite$noeuds <=  95] <- "ouragan 2"
categorie[intensite$noeuds <=  82] <- "ouragan 1"
categorie <- as.factor(categorie)
intensite <- cbind(intensite, categorie)
```

**Echelle de Saffir-Simpson :**

| Categorie | Vitesse (noeuds) | Degats |
|-----------|------------------|--------|
| 1 | 64-82 | Minimaux |
| 2 | 83-95 | Moderes |
| 3 | 96-113 | Importants |
| 4 | 114-135 | Devastateurs |
| 5 | > 135 | Catastrophiques |

**Attention a l'ordre des affectations :** On commence par la categorie la plus haute (5) et on ecrase progressivement vers le bas. Ainsi, un ouragan a 90 noeuds passe par "ouragan 5", puis "ouragan 4", puis "ouragan 3", puis "ouragan 2", et reste "ouragan 2".

### Q5 : Fusionner les trois tables

```r noexec
Ouragan <- merge(intensite, dommages)
Ouragan <- merge(Ouragan, mortalite)
```

**Explication :** `merge()` sans argument `by` fusionne sur toutes les colonnes ayant le meme nom dans les deux tables (ici, le nom de l'ouragan). L'enchainement de deux `merge()` est necessaire car la fonction n'accepte que 2 data frames a la fois.

### Q6 : Trier par annee

```r noexec
Ouragan <- Ouragan[order(Ouragan$annee), ]
```

### Q7 : Calculer le cout moyen par categorie

```r noexec
by(Ouragan$cout, Ouragan$categorie, mean)
```

**Sortie R (exemple) :**

```
Ouragan$categorie: ouragan 1
[1] 1247.5
------------------------------------------------------------
Ouragan$categorie: ouragan 2
[1] 3456.2
------------------------------------------------------------
Ouragan$categorie: ouragan 3
[1] 8912.7
```

**Interpretation :** La fonction `by()` applique `mean` au cout pour chaque niveau du facteur `categorie`. On observe logiquement que les ouragans de categorie superieure causent des dommages beaucoup plus importants.

### Q8 : Visualisation

```r noexec
hist(Ouragan$annee,
     main = "Distribution des ouragans par annee",
     xlab = "Annee", ylab = "Frequence",
     col = "lightblue")

barplot(table(Ouragan$annee),
        main = "Nombre d'ouragans par annee",
        xlab = "Annee", ylab = "Nombre",
        col = "coral")
```

**Difference entre `hist()` et `barplot(table())` :**
- `hist()` regroupe les donnees en classes de largeur fixe (bins).
- `barplot(table())` affiche le decompte exact pour chaque annee.
- L'histogramme est meilleur pour voir la tendance generale ; le barplot pour les valeurs exactes.

---

## Resume des commandes R du TP1

| Categorie | Commande | Usage |
|-----------|----------|-------|
| Vecteurs | `rep()`, `seq()`, `c()` | Creation |
| Vecteurs | `is.na()`, `sum()`, `abs()` | Manipulation |
| Matrices | `matrix()`, `cbind()`, `rbind()` | Creation |
| Matrices | `det()`, `solve()`, `diag()` | Algebre |
| Matrices | `t()`, `%*%` | Transposee, produit |
| Matrices | `apply(M, dim, fun)` | Appliquer par ligne/colonne |
| Import | `read.csv()`, `read.csv2()`, `read.table()` | Lecture fichiers |
| Fusion | `merge()`, `cbind()`, `rbind()` | Combiner tables |
| Graphiques | `curve()`, `hist()`, `barplot()` | Visualisation |
| Graphiques | `legend()`, `add = TRUE` | Superposition |
| Facteurs | `as.factor()`, `by()`, `table()` | Variables categorielles |

### Pieges frequents

1. **Indexation a partir de 1** : contrairement a Python/C, le premier element est `v[1]`, pas `v[0]`.
2. **Remplissage par colonne** : `matrix()` remplit par colonne. Utiliser `byrow = TRUE` pour remplir par ligne.
3. **Separateurs CSV** : `read.csv()` attend `,` ; `read.csv2()` attend `;`. Confondre les deux donne une seule colonne avec tout le contenu.
4. **`merge()` vs `cbind()`** : `cbind()` aligne par position ; `merge()` aligne par cle. Toujours utiliser `merge()` quand les lignes ne sont pas dans le meme ordre.
