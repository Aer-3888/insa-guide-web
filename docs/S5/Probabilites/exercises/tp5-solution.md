---
title: "TP5 - Random Vectors and Multivariate Distributions"
sidebar_position: 5
---

# TP5 - Random Vectors and Multivariate Distributions

> Following teacher instructions from: `S5/Probabilites/data/moodle/tp/tp5/README.md`

## Setup

```r noexec
# For multinomial computations, base R is sufficient
# For multivariate normal (optional extension):
# install.packages("mvtnorm")
# install.packages("scatterplot3d")
```

---

## Exercise 1: Discrete Joint Distribution

### Given a joint probability table for $(X, Y)$, calculate marginal $P(X)$ and $P(Y)$, calculate conditional $P(X \mid Y = 5)$, and use `apply()` / `margin.table()`

**Theory:**

- **Joint distribution:** $P(X = x_i, Y = y_j)$ for all pairs, summing to 1
- **Marginal of $X$:** $P(X = x_i) = \sum_j P(X = x_i, Y = y_j)$ (sum across rows)
- **Marginal of $Y$:** $P(Y = y_j) = \sum_i P(X = x_i, Y = y_j)$ (sum down columns)
- **Conditional:** $P(X = x_i \mid Y = y_j) = \frac{P(X = x_i, Y = y_j)}{P(Y = y_j)}$
- **Independence:** $X \perp Y$ iff $P(X = x, Y = y) = P(X = x) \cdot P(Y = y)$ for all $(x, y)$

### Step 1: Define the joint probability table

**Answer:**
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

**Expected output:**
```
Joint probability distribution:
     Y=0  Y=5 Y=10 Y=15
X=0  0.02 0.06 0.02 0.10
X=5  0.04 0.15 0.20 0.10
X=10 0.01 0.15 0.14 0.01

Sum of all probabilities: 1
```

**Explanation:**
This is a valid probability distribution: all values are non-negative and sum to 1. The table has $3 \times 4 = 12$ cells. `matrix(..., byrow = TRUE)` fills row by row; without this flag R fills column by column.

---

### Step 2: Calculate marginal distribution $P(X)$

**Answer:**
```r
px <- apply(prob_matrix, 1, sum)
cat("Marginal distribution P(X):\n")
print(px)
cat("\nVerification: sum =", sum(px), "\n")
```

**Expected output:**
```
Marginal distribution P(X):
 X=0  X=5 X=10
0.20 0.49 0.31

Verification: sum = 1
```

**Mathematical explanation:**
`apply(prob_matrix, 1, sum)` applies `sum` to each row (margin 1):

$$P(X = 0) = 0.02 + 0.06 + 0.02 + 0.10 = 0.20$$
$$P(X = 5) = 0.04 + 0.15 + 0.20 + 0.10 = 0.49$$
$$P(X = 10) = 0.01 + 0.15 + 0.14 + 0.01 = 0.31$$

$X = 5$ is the most likely value (49% probability).

---

### Step 3: Calculate marginal distribution $P(Y)$

**Answer:**
```r
py <- apply(prob_matrix, 2, sum)
cat("Marginal distribution P(Y):\n")
print(py)
cat("\nVerification: sum =", sum(py), "\n")
```

**Expected output:**
```
Marginal distribution P(Y):
 Y=0  Y=5 Y=10 Y=15
0.07 0.36 0.36 0.21

Verification: sum = 1
```

**Mathematical explanation:**
`apply(prob_matrix, 2, sum)` applies `sum` to each column (margin 2):

$$P(Y = 0) = 0.02 + 0.04 + 0.01 = 0.07$$
$$P(Y = 5) = 0.06 + 0.15 + 0.15 = 0.36$$
$$P(Y = 10) = 0.02 + 0.20 + 0.14 = 0.36$$
$$P(Y = 15) = 0.10 + 0.10 + 0.01 = 0.21$$

---

### Step 4: Calculate conditional distribution $P(X \mid Y = 5)$

**Answer:**
```r
y5_col <- 2  # Second column corresponds to Y=5
px_given_y5 <- prob_matrix[, y5_col] / sum(prob_matrix[, y5_col])

cat("Conditional distribution P(X | Y=5):\n")
print(round(px_given_y5, 4))
cat("\nVerification: sum =", sum(px_given_y5), "\n")
```

**Expected output:**
```
Conditional distribution P(X | Y=5):
   X=0    X=5   X=10
0.1667 0.4167 0.4167

Verification: sum = 1
```

**Mathematical explanation:**
$$P(X = 0 \mid Y = 5) = \frac{P(X = 0, Y = 5)}{P(Y = 5)} = \frac{0.06}{0.36} = 0.1667$$
$$P(X = 5 \mid Y = 5) = \frac{P(X = 5, Y = 5)}{P(Y = 5)} = \frac{0.15}{0.36} = 0.4167$$
$$P(X = 10 \mid Y = 5) = \frac{P(X = 10, Y = 5)}{P(Y = 5)} = \frac{0.15}{0.36} = 0.4167$$

Compare with the marginals: $P(X = 0) = 0.20$ but $P(X = 0 \mid Y = 5) = 0.1667$. Knowing $Y = 5$ changes our belief about $X$, which means $X$ and $Y$ are NOT independent.

---

### Step 5: All conditional distributions and independence test

**Answer:**
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

**Expected output:**
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

**Expected output:**
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

**Mathematical explanation:**
`outer(px, py)` computes the outer product: entry $(i,j) = P(X = x_i) \times P(Y = y_j)$. If $X$ and $Y$ were independent, the joint table would exactly equal this product. The deviations are substantial (up to 0.058). For example, $P(X = 0, Y = 15) = 0.10$ but $P(X = 0) \times P(Y = 15) = 0.20 \times 0.21 = 0.042$. Given $Y = 15$, $X = 0$ is much more likely than the marginal suggests.

---

## Exercise 2: Roulette Multinomial Model

### 12 spins, outcomes: red (18/38), black (18/38), green (2/38). Model as Multinomial, generate outcomes, calculate probabilities, visualize.

**Theory:** The multinomial distribution generalizes the binomial to $k > 2$ categories. For $n$ trials with probabilities $p_1, \ldots, p_k$ (where $\sum p_i = 1$):

$$P(X_1 = x_1, \ldots, X_k = x_k) = \frac{n!}{x_1! \cdots x_k!} \prod_{i=1}^{k} p_i^{x_i}$$

**Properties:**
- $E[X_i] = n \cdot p_i$
- $\text{Var}(X_i) = n \cdot p_i(1 - p_i)$ (each marginal is binomial)
- $\text{Cov}(X_i, X_j) = -n \cdot p_i \cdot p_j$ (always negative)

### Step 1: Define the model

**Answer:**
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

**Expected output:**
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

**Mathematical explanation:**
Covariances are negative because categories compete: more red necessarily means fewer black and green (since $\sum X_i = n = 12$). Each marginal $X_i \sim B(n, p_i)$, but the $X_i$ are NOT independent.

---

### Step 2: Generate all possible outcomes and calculate probabilities

**Answer:**
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

**Expected output:**
```
Number of possible outcomes: 91
Sum of all probabilities: 1

P(5 red, 5 black, 2 green) = 0.036266
```

**Mathematical explanation:**
The number of ways to partition $n = 12$ into 3 non-negative integers is $\binom{14}{2} = 91$ (stars and bars). For the specific outcome:

$$P(5, 5, 2) = \frac{12!}{5! \cdot 5! \cdot 2!} \times \left(\frac{18}{38}\right)^5 \times \left(\frac{18}{38}\right)^5 \times \left(\frac{2}{38}\right)^2 = 0.03627$$

---

### Step 3: Find the most likely outcome

**Answer:**
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

**Expected output:**
```
Most likely outcome:
  Red: 6
  Black: 6
  Green: 0
  Probability: 0.1046
```

**Explanation:**
The mode is $(6, 6, 0)$, close to the expected values (5.68, 5.68, 0.63) rounded to integers. Despite being the most likely single outcome, it only occurs ~10.5% of the time -- the remaining probability is spread across 90 other outcomes.

---

### Step 4: Simulation verification

**Answer:**
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

**Expected output:**
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

**Mathematical explanation:**
All empirical values closely match the theory. The negative covariance between Red and Black is clearly visible: when one gets more outcomes, the other gets fewer (fixed total of 12).

---

### Step 5: Distribution of green outcomes (marginal is binomial)

**Answer:**
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

**Expected output:**
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

**Mathematical explanation:**
Each marginal of the multinomial is binomial: Green $\sim B(12, 2/38) = B(12, 0.0526)$. About 51% of the time, no green appears at all (since each spin has only 5.26% chance of green).

---

## Exercise 3: Covariance Matrix and Linear Combinations

### For a random vector $\mathbf{X} = (X_1, X_2)$ with covariance matrix $\Sigma$, compute $\text{Var}(Y)$ where $Y = aX_1 + bX_2$

**Theory:** For random vector $\mathbf{X}$ with covariance matrix $\Sigma$ and coefficient vector $\mathbf{a}$:

$$\text{Var}(\mathbf{a}^T \mathbf{X}) = \mathbf{a}^T \Sigma \mathbf{a}$$

Expanded for two variables:

$$\text{Var}(aX_1 + bX_2) = a^2 \text{Var}(X_1) + b^2 \text{Var}(X_2) + 2ab \text{Cov}(X_1, X_2)$$

### Example: $Y = 3X_1 + 4X_2$

**Answer:**
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

**Expected output:**
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

**Mathematical explanation:**
In R, `%*%` performs matrix multiplication and `t()` transposes. If we ignored the covariance (assumed independence), we would get $\text{Var}(Y) = 36 + 32 = 68$. The positive covariance $\text{Cov}(X_1, X_2) = 1$ adds 24, because $X_1$ and $X_2$ tend to increase together, amplifying the variability of their sum.

---

## Summary

| Concept | Formula | R Function |
|---------|---------|------------|
| Joint PMF | $P(X = x, Y = y)$ | Direct matrix entry |
| Marginal of $X$ | $\sum_y P(X = x, Y = y)$ | `apply(mat, 1, sum)` |
| Marginal of $Y$ | $\sum_x P(X = x, Y = y)$ | `apply(mat, 2, sum)` |
| Conditional | $P(X = x \mid Y = y) = \frac{P(X = x, Y = y)}{P(Y = y)}$ | Column / column sum |
| Independence test | $P(X, Y) = P(X) \cdot P(Y)$ for all? | `outer(px, py)` vs `prob_matrix` |
| Multinomial PMF | $\frac{n!}{x_1! \cdots x_k!} \prod p_i^{x_i}$ | `dmultinom(x, prob)` |
| $E[X_i]$ (multinomial) | $n \cdot p_i$ | Direct computation |
| $\text{Var}(X_i)$ (multinomial) | $n \cdot p_i(1 - p_i)$ | Each marginal is binomial |
| $\text{Cov}(X_i, X_j)$ | $-n \cdot p_i \cdot p_j$ | Always negative |
| Var(linear combo) | $\mathbf{a}^T \Sigma \mathbf{a}$ | `t(a) %*% Sigma %*% a` |
