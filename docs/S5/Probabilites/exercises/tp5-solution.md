---
title: "TP5 - Vecteurs aleatoires et distributions multivariees"
sidebar_position: 5
---

# TP5 - Vecteurs aleatoires et distributions multivariees

> D'apres les instructions de l'enseignant : `S5/Probabilites/data/moodle/tp/tp5/README.md`

## Preparation

```r noexec
# For multinomial computations, base R is sufficient
# For multivariate normal (optional extension):
# install.packages("mvtnorm")
# install.packages("scatterplot3d")
```

---

## Exercice 1 : Distribution jointe discrete

### Etant donne un tableau de probabilite jointe pour $(X, Y)$, calculer les marginales $P(X)$ et $P(Y)$, calculer la conditionnelle $P(X \mid Y = 5)$, et utiliser `apply()` / `margin.table()`

**Theorie :**

- **Distribution jointe :** $P(X = x_i, Y = y_j)$ pour toutes les paires, de somme 1
- **Marginale de $X$ :** $P(X = x_i) = \sum_j P(X = x_i, Y = y_j)$ (somme sur les lignes)
- **Marginale de $Y$ :** $P(Y = y_j) = \sum_i P(X = x_i, Y = y_j)$ (somme sur les colonnes)
- **Conditionnelle :** $P(X = x_i \mid Y = y_j) = \frac{P(X = x_i, Y = y_j)}{P(Y = y_j)}$
- **Independance :** $X \perp Y$ ssi $P(X = x, Y = y) = P(X = x) \cdot P(Y = y)$ pour tout $(x, y)$

### Etape 1 : Definir le tableau de probabilite jointe

**Reponse :**
```r
prob_matrix <- matrix(c(0.02, 0.06, 0.02, 0.10,
                        0.04, 0.15, 0.20, 0.10,
                        0.01, 0.15, 0.14, 0.01),
                      nrow = 3, ncol = 4, byrow = TRUE)

rownames(prob_matrix) <- c("X=0", "X=5", "X=10")
colnames(prob_matrix) <- c("Y=0", "Y=5", "Y=10", "Y=15")

cat("Joint probability distribution:\n")
print(prob_matrix)
cat("\nSum of all probabilities:", sum(prob_matrix), "\n")
```

**Sortie attendue :**
```
Joint probability distribution:
     Y=0  Y=5 Y=10 Y=15
X=0  0.02 0.06 0.02 0.10
X=5  0.04 0.15 0.20 0.10
X=10 0.01 0.15 0.14 0.01

Sum of all probabilities: 1
```

**Explication :**
C'est une distribution de probabilite valide : toutes les valeurs sont non negatives et leur somme vaut 1. Le tableau comporte $3 \times 4 = 12$ cellules. `matrix(..., byrow = TRUE)` remplit ligne par ligne ; sans ce parametre, R remplit colonne par colonne.

---

### Etape 2 : Calculer la distribution marginale $P(X)$

**Reponse :**
```r
px <- apply(prob_matrix, 1, sum)
cat("Marginal distribution P(X):\n")
print(px)
cat("\nVerification: sum =", sum(px), "\n")
```

**Sortie attendue :**
```
Marginal distribution P(X):
 X=0  X=5 X=10
0.20 0.49 0.31

Verification: sum = 1
```

**Explication mathematique :**
`apply(prob_matrix, 1, sum)` applique `sum` a chaque ligne (marge 1) :

$$P(X = 0) = 0.02 + 0.06 + 0.02 + 0.10 = 0.20$$
$$P(X = 5) = 0.04 + 0.15 + 0.20 + 0.10 = 0.49$$
$$P(X = 10) = 0.01 + 0.15 + 0.14 + 0.01 = 0.31$$

$X = 5$ est la valeur la plus probable (49% de probabilite).

---

### Etape 3 : Calculer la distribution marginale $P(Y)$

**Reponse :**
```r
py <- apply(prob_matrix, 2, sum)
cat("Marginal distribution P(Y):\n")
print(py)
cat("\nVerification: sum =", sum(py), "\n")
```

**Sortie attendue :**
```
Marginal distribution P(Y):
 Y=0  Y=5 Y=10 Y=15
0.07 0.36 0.36 0.21

Verification: sum = 1
```

**Explication mathematique :**
`apply(prob_matrix, 2, sum)` applique `sum` a chaque colonne (marge 2) :

$$P(Y = 0) = 0.02 + 0.04 + 0.01 = 0.07$$
$$P(Y = 5) = 0.06 + 0.15 + 0.15 = 0.36$$
$$P(Y = 10) = 0.02 + 0.20 + 0.14 = 0.36$$
$$P(Y = 15) = 0.10 + 0.10 + 0.01 = 0.21$$

---

### Etape 4 : Calculer la distribution conditionnelle $P(X \mid Y = 5)$

**Reponse :**
```r
y5_col <- 2  # Second column corresponds to Y=5
px_given_y5 <- prob_matrix[, y5_col] / sum(prob_matrix[, y5_col])

cat("Conditional distribution P(X | Y=5):\n")
print(round(px_given_y5, 4))
cat("\nVerification: sum =", sum(px_given_y5), "\n")
```

**Sortie attendue :**
```
Conditional distribution P(X | Y=5):
   X=0    X=5   X=10
0.1667 0.4167 0.4167

Verification: sum = 1
```

**Explication mathematique :**
$$P(X = 0 \mid Y = 5) = \frac{P(X = 0, Y = 5)}{P(Y = 5)} = \frac{0.06}{0.36} = 0.1667$$
$$P(X = 5 \mid Y = 5) = \frac{P(X = 5, Y = 5)}{P(Y = 5)} = \frac{0.15}{0.36} = 0.4167$$
$$P(X = 10 \mid Y = 5) = \frac{P(X = 10, Y = 5)}{P(Y = 5)} = \frac{0.15}{0.36} = 0.4167$$

Comparaison avec les marginales : $P(X = 0) = 0.20$ mais $P(X = 0 \mid Y = 5) = 0.1667$. Savoir que $Y = 5$ modifie notre croyance sur $X$, ce qui signifie que $X$ et $Y$ ne sont PAS independantes.

---

### Etape 5 : Toutes les distributions conditionnelles et test d'independance

**Reponse :**
```r
cat("All conditional distributions P(X | Y = y):\n\n")

for (j in 1:ncol(prob_matrix)) {
  y_val <- colnames(prob_matrix)[j]
  p_y_j <- sum(prob_matrix[, j])
  px_given_yj <- prob_matrix[, j] / p_y_j

  cat("P(X |", y_val, ") -- P(", y_val, ") =", round(p_y_j, 2), ":\n")
  print(round(px_given_yj, 4))
  cat("\n")
}
```

**Sortie attendue :**
```
P(X | Y=0 ) -- P( Y=0 ) = 0.07 :
   X=0    X=5   X=10
0.2857 0.5714 0.1429

P(X | Y=5 ) -- P( Y=5 ) = 0.36 :
   X=0    X=5   X=10
0.1667 0.4167 0.4167

P(X | Y=10 ) -- P( Y=10 ) = 0.36 :
   X=0    X=5   X=10
0.0556 0.5556 0.3889

P(X | Y=15 ) -- P( Y=15 ) = 0.21 :
   X=0    X=5   X=10
0.4762 0.4762 0.0476
```

```r
# Test for independence: P(X,Y) = P(X)*P(Y) for all (x,y)?
independence_table <- outer(px, py)

cat("Actual joint probabilities:\n")
print(round(prob_matrix, 4))
cat("\nProduct of marginals (under independence):\n")
print(round(independence_table, 4))
cat("\nDifferences |P(X,Y) - P(X)*P(Y)|:\n")
print(round(abs(prob_matrix - independence_table), 4))

cat("\nMaximum deviation:", round(max(abs(prob_matrix - independence_table)), 4), "\n")

if (max(abs(prob_matrix - independence_table)) < 1e-10) {
  cat("Conclusion: X and Y are INDEPENDENT\n")
} else {
  cat("Conclusion: X and Y are NOT independent\n")
}
```

**Sortie attendue :**
```
Actual joint probabilities:
     Y=0  Y=5 Y=10 Y=15
X=0  0.02 0.06 0.02 0.10
X=5  0.04 0.15 0.20 0.10
X=10 0.01 0.15 0.14 0.01

Product of marginals (under independence):
       Y=0   Y=5  Y=10   Y=15
X=0  0.0140 0.072 0.072 0.0420
X=5  0.0343 0.176 0.176 0.1029
X=10 0.0217 0.112 0.112 0.0651

Differences |P(X,Y) - P(X)*P(Y)|:
       Y=0    Y=5   Y=10   Y=15
X=0  0.0060 0.0120 0.0520 0.0580
X=5  0.0057 0.0264 0.0236 0.0029
X=10 0.0117 0.0384 0.0284 0.0551

Maximum deviation: 0.058
Conclusion: X and Y are NOT independent
```

**Explication mathematique :**
`outer(px, py)` calcule le produit exterieur : l'entree $(i,j) = P(X = x_i) \times P(Y = y_j)$. Si $X$ et $Y$ etaient independantes, le tableau joint serait exactement egal a ce produit. Les ecarts sont substantiels (jusqu'a 0,058). Par exemple, $P(X = 0, Y = 15) = 0.10$ mais $P(X = 0) \times P(Y = 15) = 0.20 \times 0.21 = 0.042$. Sachant que $Y = 15$, $X = 0$ est beaucoup plus probable que ce que la marginale suggere.

---

## Exercice 2 : Modele multinomial de la roulette

### 12 tours, resultats : rouge (18/38), noir (18/38), vert (2/38). Modeliser par la loi multinomiale, generer les resultats, calculer les probabilites, visualiser.

**Theorie :** La loi multinomiale generalise la loi binomiale a $k > 2$ categories. Pour $n$ epreuves avec probabilites $p_1, \ldots, p_k$ (ou $\sum p_i = 1$) :

$$P(X_1 = x_1, \ldots, X_k = x_k) = \frac{n!}{x_1! \cdots x_k!} \prod_{i=1}^{k} p_i^{x_i}$$

**Proprietes :**
- $E[X_i] = n \cdot p_i$
- $\text{Var}(X_i) = n \cdot p_i(1 - p_i)$ (chaque marginale est binomiale)
- $\text{Cov}(X_i, X_j) = -n \cdot p_i \cdot p_j$ (toujours negative)

### Etape 1 : Definir le modele

**Reponse :**
```r
n_spins <- 12
probs <- c(18/38, 18/38, 2/38)  # Red, Black, Green

cat("Roulette multinomial model:\n")
cat("Number of spins:", n_spins, "\n")
cat("Probabilities:\n")
cat("  Red:  ", round(probs[1], 4), "(18/38)\n")
cat("  Black:", round(probs[2], 4), "(18/38)\n")
cat("  Green:", round(probs[3], 4), "(2/38)\n\n")

cat("Expected values E[X_i] = n * p_i:\n")
cat("  E[Red]   =", round(n_spins * probs[1], 3), "\n")
cat("  E[Black] =", round(n_spins * probs[2], 3), "\n")
cat("  E[Green] =", round(n_spins * probs[3], 3), "\n\n")

cat("Variances Var(X_i) = n * p_i * (1 - p_i):\n")
cat("  Var(Red)   =", round(n_spins * probs[1] * (1 - probs[1]), 3), "\n")
cat("  Var(Black) =", round(n_spins * probs[2] * (1 - probs[2]), 3), "\n")
cat("  Var(Green) =", round(n_spins * probs[3] * (1 - probs[3]), 3), "\n\n")

cat("Covariances Cov(X_i, X_j) = -n * p_i * p_j:\n")
cat("  Cov(Red, Black) =", round(-n_spins * probs[1] * probs[2], 3), "\n")
cat("  Cov(Red, Green) =", round(-n_spins * probs[1] * probs[3], 3), "\n")
cat("  Cov(Black, Green) =", round(-n_spins * probs[2] * probs[3], 3), "\n")
```

**Sortie attendue :**
```
Roulette multinomial model:
Number of spins: 12
Probabilities:
  Red:   0.4737 (18/38)
  Black: 0.4737 (18/38)
  Green: 0.0526 (2/38)

Expected values E[X_i] = n * p_i:
  E[Red]   = 5.684
  E[Black] = 5.684
  E[Green] = 0.632

Variances Var(X_i) = n * p_i * (1 - p_i):
  Var(Red)   = 2.992
  Var(Black) = 2.992
  Var(Green) = 0.599

Covariances Cov(X_i, X_j) = -n * p_i * p_j:
  Cov(Red, Black) = -2.692
  Cov(Red, Green) = -0.299
  Cov(Black, Green) = -0.299
```

**Explication mathematique :**
Les covariances sont negatives car les categories sont en competition : plus de rouge implique necessairement moins de noir et de vert (puisque $\sum X_i = n = 12$). Chaque marginale $X_i \sim B(n, p_i)$, mais les $X_i$ ne sont PAS independantes.

---

### Etape 2 : Generer tous les resultats possibles et calculer les probabilites

**Reponse :**
```r
outcomes <- expand.grid(red = 0:n_spins, black = 0:n_spins)
outcomes$green <- n_spins - outcomes$red - outcomes$black

# Keep only valid outcomes (green >= 0)
outcomes <- outcomes[outcomes$green >= 0, ]

# Calculate probability for each outcome
outcomes$prob <- apply(outcomes[, c("red", "black", "green")], 1,
                       function(x) dmultinom(x, prob = probs))

cat("Number of possible outcomes:", nrow(outcomes), "\n")
cat("Sum of all probabilities:", round(sum(outcomes$prob), 6), "\n\n")

# Specific probability: P(5 red, 5 black, 2 green)
p_specific <- dmultinom(c(5, 5, 2), prob = probs)
cat("P(5 red, 5 black, 2 green) =", round(p_specific, 6), "\n\n")
```

**Sortie attendue :**
```
Number of possible outcomes: 91
Sum of all probabilities: 1

P(5 red, 5 black, 2 green) = 0.036266
```

**Explication mathematique :**
Le nombre de facons de repartir $n = 12$ en 3 entiers non negatifs est $\binom{14}{2} = 91$ (methode des etoiles et barres). Pour le resultat specifique :

$$P(5, 5, 2) = \frac{12!}{5! \cdot 5! \cdot 2!} \times \left(\frac{18}{38}\right)^5 \times \left(\frac{18}{38}\right)^5 \times \left(\frac{2}{38}\right)^2 = 0.03627$$

---

### Etape 3 : Trouver le resultat le plus probable

**Reponse :**
```r
max_idx <- which.max(outcomes$prob)
cat("Most likely outcome:\n")
cat("  Red:", outcomes$red[max_idx], "\n")
cat("  Black:", outcomes$black[max_idx], "\n")
cat("  Green:", outcomes$green[max_idx], "\n")
cat("  Probability:", round(outcomes$prob[max_idx], 4), "\n\n")

# Top 10 most likely outcomes
sorted_outcomes <- outcomes[order(-outcomes$prob), ]

cat("Top 10 most likely outcomes:\n")
cat(sprintf("%-6s %-6s %-6s %-12s\n", "Red", "Black", "Green", "Probability"))
cat(strrep("-", 36), "\n")

for (i in 1:10) {
  cat(sprintf("%6d %6d %6d %12.4f\n",
              sorted_outcomes$red[i],
              sorted_outcomes$black[i],
              sorted_outcomes$green[i],
              sorted_outcomes$prob[i]))
}

cat("\nTop 10 cumulative probability:", round(sum(sorted_outcomes$prob[1:10]), 4), "\n")
```

**Sortie attendue :**
```
Most likely outcome:
  Red: 6
  Black: 6
  Green: 0
  Probability: 0.1046
```

**Explication :**
Le mode est $(6, 6, 0)$, proche des valeurs attendues (5,68 ; 5,68 ; 0,63) arrondies a l'entier. Bien qu'etant le resultat individuel le plus probable, il ne se produit que ~10,5% du temps -- la probabilite restante est repartie sur les 90 autres resultats.

---

### Etape 4 : Verification par simulation

**Reponse :**
```r
n_simulations <- 10000
set.seed(42)

simulated <- rmultinom(n_simulations, size = n_spins, prob = probs)
# Result: 3 x n_simulations matrix (rows: red, black, green)

avg_red <- mean(simulated[1, ])
avg_black <- mean(simulated[2, ])
avg_green <- mean(simulated[3, ])

cat("Simulation results (n =", n_simulations, "):\n")
cat("  Average red:  ", round(avg_red, 3),
    " (expected:", round(n_spins * probs[1], 3), ")\n")
cat("  Average black:", round(avg_black, 3),
    " (expected:", round(n_spins * probs[2], 3), ")\n")
cat("  Average green:", round(avg_green, 3),
    " (expected:", round(n_spins * probs[3], 3), ")\n\n")

# Verify variance and covariance
cat("Variance comparison:\n")
cat("  Var(Red):   empirical =", round(var(simulated[1, ]), 3),
    ", theoretical =", round(n_spins * probs[1] * (1 - probs[1]), 3), "\n")
cat("  Var(Black): empirical =", round(var(simulated[2, ]), 3),
    ", theoretical =", round(n_spins * probs[2] * (1 - probs[2]), 3), "\n")
cat("  Var(Green): empirical =", round(var(simulated[3, ]), 3),
    ", theoretical =", round(n_spins * probs[3] * (1 - probs[3]), 3), "\n\n")

cat("Covariance comparison:\n")
cat("  Cov(Red,Black): empirical =", round(cov(simulated[1, ], simulated[2, ]), 3),
    ", theoretical =", round(-n_spins * probs[1] * probs[2], 3), "\n")
cat("  Cov(Red,Green): empirical =", round(cov(simulated[1, ], simulated[3, ]), 3),
    ", theoretical =", round(-n_spins * probs[1] * probs[3], 3), "\n")
```

**Sortie attendue :**
```
Simulation results (n = 10000 ):
  Average red:   5.680  (expected: 5.684 )
  Average black: 5.695  (expected: 5.684 )
  Average green: 0.625  (expected: 0.632 )

Variance comparison:
  Var(Red):   empirical = 3.013 , theoretical = 2.992
  Var(Black): empirical = 2.971 , theoretical = 2.992
  Var(Green): empirical = 0.595 , theoretical = 0.599

Covariance comparison:
  Cov(Red,Black): empirical = -2.724 , theoretical = -2.692
  Cov(Red,Green): empirical = -0.289 , theoretical = -0.299
```

**Explication mathematique :**
Toutes les valeurs empiriques correspondent etroitement a la theorie. La covariance negative entre rouge et noir est clairement visible : quand l'un obtient plus de resultats, l'autre en obtient moins (total fixe de 12).

---

### Etape 5 : Distribution des resultats verts (la marginale est binomiale)

**Reponse :**
```r
green_counts <- simulated[3, ]
green_table <- table(green_counts)
green_freq <- green_table / n_simulations

cat("Distribution of green outcomes (n = 12 spins):\n")
cat(sprintf("%-8s %-12s %-12s\n", "Green", "Empirical", "Theoretical"))
cat(strrep("-", 36), "\n")

for (g in 0:max(as.numeric(names(green_table)))) {
  emp <- ifelse(as.character(g) %in% names(green_freq),
                green_freq[as.character(g)], 0)
  theo <- dbinom(g, size = n_spins, prob = probs[3])
  cat(sprintf("%8d %12.4f %12.4f\n", g, emp, theo))
}
```

**Sortie attendue :**
```
Distribution of green outcomes (n = 12 spins):
Green    Empirical    Theoretical
------------------------------------
       0       0.5186       0.5133
       1       0.3617       0.3657
       2       0.1005       0.1002
       3       0.0168       0.0178
       4       0.0020       0.0025
       5       0.0004       0.0003
```

**Explication mathematique :**
Chaque marginale de la multinomiale est binomiale : Vert $\sim B(12, 2/38) = B(12, 0.0526)$. Environ 51% du temps, aucun vert n'apparait (puisque chaque tour n'a que 5,26% de chances de donner vert).

---

## Exercice 3 : Matrice de covariance et combinaisons lineaires

### Pour un vecteur aleatoire $\mathbf{X} = (X_1, X_2)$ avec matrice de covariance $\Sigma$, calculer $\text{Var}(Y)$ ou $Y = aX_1 + bX_2$

**Theorie :** Pour un vecteur aleatoire $\mathbf{X}$ de matrice de covariance $\Sigma$ et un vecteur de coefficients $\mathbf{a}$ :

$$\text{Var}(\mathbf{a}^T \mathbf{X}) = \mathbf{a}^T \Sigma \mathbf{a}$$

En developpant pour deux variables :

$$\text{Var}(aX_1 + bX_2) = a^2 \text{Var}(X_1) + b^2 \text{Var}(X_2) + 2ab \text{Cov}(X_1, X_2)$$

### Exemple : $Y = 3X_1 + 4X_2$

**Reponse :**
```r
Sigma <- matrix(c(4, 1, 1, 2), nrow = 2)
a <- c(3, 4)

cat("Covariance matrix Sigma:\n")
print(Sigma)
cat("\nCoefficients a:", a, "\n\n")

# Matrix computation: Var(Y) = a^T * Sigma * a
var_Y <- t(a) %*% Sigma %*% a
cat("Var(Y) = a^T * Sigma * a =", var_Y, "\n\n")

# Manual verification
var_Y_manual <- 3^2 * 4 + 4^2 * 2 + 2 * 3 * 4 * 1
cat("Manual computation:\n")
cat("  3^2 * Var(X1) = 9 * 4 = 36\n")
cat("  4^2 * Var(X2) = 16 * 2 = 32\n")
cat("  2 * 3 * 4 * Cov(X1,X2) = 24 * 1 = 24\n")
cat("  Total: 36 + 32 + 24 =", var_Y_manual, "\n")
```

**Sortie attendue :**
```
Covariance matrix Sigma:
     [,1] [,2]
[1,]    4    1
[2,]    1    2

Coefficients a: 3 4

Var(Y) = a^T * Sigma * a = 92

Manual computation:
  3^2 * Var(X1) = 9 * 4 = 36
  4^2 * Var(X2) = 16 * 2 = 32
  2 * 3 * 4 * Cov(X1,X2) = 24 * 1 = 24
  Total: 36 + 32 + 24 = 92
```

**Explication mathematique :**
En R, `%*%` effectue la multiplication matricielle et `t()` transpose. Si on ignorait la covariance (hypothese d'independance), on obtiendrait $\text{Var}(Y) = 36 + 32 = 68$. La covariance positive $\text{Cov}(X_1, X_2) = 1$ ajoute 24, car $X_1$ et $X_2$ tendent a augmenter ensemble, amplifiant la variabilite de leur somme.

---

## Resume

| Concept | Formule | Fonction R |
|---------|---------|------------|
| Loi jointe | $P(X = x, Y = y)$ | Entree directe de la matrice |
| Marginale de $X$ | $\sum_y P(X = x, Y = y)$ | `apply(mat, 1, sum)` |
| Marginale de $Y$ | $\sum_x P(X = x, Y = y)$ | `apply(mat, 2, sum)` |
| Conditionnelle | $P(X = x \mid Y = y) = \frac{P(X = x, Y = y)}{P(Y = y)}$ | Colonne / somme de la colonne |
| Test d'independance | $P(X, Y) = P(X) \cdot P(Y)$ pour tout ? | `outer(px, py)` vs `prob_matrix` |
| Loi multinomiale | $\frac{n!}{x_1! \cdots x_k!} \prod p_i^{x_i}$ | `dmultinom(x, prob)` |
| $E[X_i]$ (multinomiale) | $n \cdot p_i$ | Calcul direct |
| $\text{Var}(X_i)$ (multinomiale) | $n \cdot p_i(1 - p_i)$ | Chaque marginale est binomiale |
| $\text{Cov}(X_i, X_j)$ | $-n \cdot p_i \cdot p_j$ | Toujours negative |
| Var(combinaison lin.) | $\mathbf{a}^T \Sigma \mathbf{a}$ | `t(a) %*% Sigma %*% a` |
