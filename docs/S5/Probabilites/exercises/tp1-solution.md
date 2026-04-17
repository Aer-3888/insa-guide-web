---
title: "TP1 - Introduction to R and Probability Distributions"
sidebar_position: 1
---

# TP1 - Introduction to R and Probability Distributions

> Following teacher instructions from: `S5/Probabilites/data/moodle/tp/tp1/README.md`

## Part 1: Type Conversion and String Manipulation

### 1.1 Convert a string to integer and verify the type

**Answer:**
```r
txt <- "33"
nbr <- as.integer(txt)

print(is.numeric(nbr))
print(is.integer(nbr))
```

**Expected output:**
```
[1] TRUE
[1] TRUE
```

**Explanation:**
`as.integer()` converts the string `"33"` to integer 33. In R, integers are a subtype of numeric, so both `is.numeric()` and `is.integer()` return TRUE. Type conversion is essential when loading data from CSV files where numeric columns may be read as strings.

---

### 1.2 Concatenate strings with `paste()` and count characters with `nchar()`

**Answer:**
```r
mot <- "petite"
text1 <- paste("une", mot, "phrase")
print(text1)

text2 <- paste(text1, "compte", nchar(text1), "lettres")
print(text2)
```

**Expected output:**
```
[1] "une petite phrase"
[1] "une petite phrase compte 17 lettres"
```

**Explanation:**
`paste()` concatenates its arguments with a space separator by default. `nchar()` returns the number of characters including spaces: `"une petite phrase"` has 17 characters.

---

### 1.3 Variable management with `rm()` and `ls()`

**Answer:**
```r
pipo <- "une var texte"
nombre <- 3

rm(pipo)

variables <- ls()
print("Les variables sont :")
print(variables)
```

**Expected output:**
```
[1] "Les variables sont :"
[1] "nombre" "text1" "text2" "txt" "nbr" "mot" "variables"
```

**Explanation:**
`rm()` removes a variable from the environment. After removing `pipo`, it no longer appears in `ls()`. The exact list depends on what variables exist in the current session.

---

### 1.4 Special values: `Inf` and `NA`

**Answer:**
```r
tmp <- 3/0
print(tmp)

nsp <- NA

resultat <- paste(tmp, tmp+1, tmp+nsp)
print(resultat)
```

**Expected output:**
```
[1] Inf
[1] "Inf Inf NA"
```

**Explanation:**
Division by zero produces `Inf` (infinity). `Inf + 1` remains `Inf`. Any arithmetic involving `NA` (missing value) produces `NA`. This propagation behavior is critical in real data analysis -- one missing value can invalidate an entire computation unless handled with `na.rm = TRUE`.

---

## Part 2: Vectors

### Four construction methods for vectors

**Answer:**
```r
# Method 1: Explicit construction with c()
vecteur1 <- c(1, 3, 5, 7, 9)

# Method 2: Sequence with step
vecteur2 <- seq(from=0, to=10, by=2)

# Method 3: Range operator (inclusive on both ends)
vecteur3 <- 0:10

# Method 4: Repeat pattern
vecteur4 <- rep(1:2, 5)

print(vecteur1)
print(vecteur2)
print(vecteur3)
print(vecteur4)
```

**Expected output:**
```
[1] 1 3 5 7 9
[1]  0  2  4  6  8 10
[1]  0  1  2  3  4  5  6  7  8  9 10
[1] 1 2 1 2 1 2 1 2 1 2
```

**Mathematical explanation:**
R's `:` operator generates inclusive sequences: `0:10` produces 11 elements (0 through 10). This differs from Python's `range()` which excludes the upper bound. R's `for(i in 1:10)` loops include both endpoints.

---

## Part 3: Data Frames

### Create a data frame with named columns, access data, and export

**Answer:**
```r noexec
v1 <- c(175, 182, 165, 187, 158)  # Heights
v2 <- c(19, 18, 21, 22, 20)       # Ages
v3 <- c("Louis", "Paule", "Pierre", "Remi", "Claude")  # Names

tableau <- data.frame(prenom=v3, taille=v1, age=v2)

print(names(tableau))
print(tableau$prenom)
print(tableau[1, ])
print(tableau[, "taille"])

# Export to CSV
write.table(tableau, "sortie.csv", sep=";", row.names=FALSE, col.names=FALSE)

str(tableau)
summary(tableau)
```

**Expected output:**
```
[1] "prenom" "taille" "age"
[1] "Louis"  "Paule"  "Pierre" "Remi"   "Claude"
  prenom taille age
1  Louis    175  19
[1] 175 182 165 187 158

'data.frame':	5 obs. of  3 variables:
 $ prenom: chr  "Louis" "Paule" "Pierre" "Remi" ...
 $ taille: num  175 182 165 187 158
 $ age   : num  19 18 21 22 20

    prenom              taille          age
 Length:5           Min.   :158.0   Min.   :18.0
 Class :character   1st Qu.:165.0   1st Qu.:19.0
 Mode  :character   Median :175.0   Median :20.0
                    Mean   :173.4   Mean   :20.0
                    3rd Qu.:182.0   3rd Qu.:21.0
                    Max.   :187.0   Max.   :22.0
```

**Explanation:**
Data frames are R's primary structure for tabular data. `$` accesses columns by name, `[row, col]` uses positional indexing. `summary()` provides the five-number summary plus mean for numeric columns.

---

## Part 4: Probability Distribution Functions

### Understand R's d/p/q/r naming convention

R uses a systematic naming scheme for all distributions:

| Prefix | Mathematical meaning | Formula |
|--------|---------------------|---------|
| `d*` | Density/mass function | $f(x)$ or $P(X = x)$ |
| `p*` | Cumulative distribution function | $F(x) = P(X \leq x)$ |
| `q*` | Quantile (inverse CDF) | $F^{-1}(p) = \inf\{x : F(x) \geq p\}$ |
| `r*` | Random sample generation | Draw from the distribution |

### 4.1 Normal distribution density and visualization

**Answer:**
```r
# Density at specific points for N(1, 0.2)
densities <- dnorm(c(0.8, 1, 1.2), mean=1, sd=0.2)
print(densities)

# Visualize two normal distributions
curve(dnorm(x, mean=1, sd=0.4),
      from=-3, to=7,
      xlab="x", ylab="Density",
      main="Normal Distribution Comparison",
      col="blue", lwd=2)

curve(dnorm(x, mean=4, sd=3.4),
      add=TRUE,
      col="red", lwd=2)

legend("topright",
       legend=c("N(1, 0.4)", "N(4, 3.4)"),
       col=c("blue", "red"),
       lwd=2)
```

**Expected output:**
```
[1] 0.1209854 1.9947114 0.1209854
```

**Mathematical explanation:**
For $X \sim \mathcal{N}(\mu=1, \sigma=0.2)$, the PDF is:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$

At $x = 1$ (the mean), density is maximal: $f(1) = \frac{1}{0.2\sqrt{2\pi}} \approx 1.9947$. At $x = 0.8$ and $x = 1.2$ (symmetric about the mean), densities are equal at 0.1210, confirming bell curve symmetry.

### 4.2 Binomial distribution

**Answer:**
```r
x <- 0:10
y <- dbinom(x, size=10, prob=0.2)

plot(x, y,
     type='h', lwd=30, lend="square",
     ylab="P(X=x)", xlab="Number of successes",
     main="Binomial Distribution B(10, 0.2)",
     col="darkgreen")
points(x, y, pch=19, col="darkgreen", cex=1.5)
```

**Expected output:**
Plot showing vertical bars at each integer 0 to 10. Right-skewed distribution with mode at $x = 2$.

**Mathematical explanation:**
For $X \sim B(n=10, p=0.2)$:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$

Example: $P(X = 2) = \binom{10}{2} \times 0.2^2 \times 0.8^8 = 45 \times 0.04 \times 0.1678 = 0.3020$.

### 4.3 CDF and quantile computations

**Answer:**
```r
# P(X <= 5) for X ~ B(10, 0.2)
prob_at_most_5 <- pbinom(5, size=10, prob=0.2)
print(paste("P(X <= 5) =", round(prob_at_most_5, 4)))

# P(X >= 6) = 1 - P(X <= 5)
prob_at_least_6 <- 1 - pbinom(5, size=10, prob=0.2)
print(paste("P(X >= 6) =", round(prob_at_least_6, 4)))

# Quantiles of N(0,1)
median_std_normal <- qnorm(0.5, mean=0, sd=1)
print(paste("Median of N(0,1):", median_std_normal))

q95_std_normal <- qnorm(0.95, mean=0, sd=1)
print(paste("95th percentile of N(0,1):", round(q95_std_normal, 3)))
```

**Expected output:**
```
[1] "P(X <= 5) = 0.9936"
[1] "P(X >= 6) = 0.0064"
[1] "Median of N(0,1): 0"
[1] "95th percentile of N(0,1): 1.645"
```

**Mathematical explanation:**
The quantile function is the inverse CDF: $q_p = F^{-1}(p) = \inf\{x : F(x) \geq p\}$. For the symmetric $\mathcal{N}(0,1)$, the median is exactly 0. The value 1.645 is the critical value used in one-sided hypothesis tests at $\alpha = 0.05$.

### 4.4 Random generation and histogram overlay

**Answer:**
```r
set.seed(42)
normal_samples <- rnorm(1000, mean=100, sd=15)

hist(normal_samples,
     freq=FALSE, breaks=30,
     col="lightblue", border="white",
     main="Normal Samples vs Theoretical Density",
     xlab="Value", ylab="Density")

curve(dnorm(x, mean=100, sd=15),
      add=TRUE, col="red", lwd=2)

legend("topright",
       legend=c("Empirical", "Theoretical"),
       fill=c("lightblue", NA),
       border=c("black", NA),
       col=c(NA, "red"),
       lwd=c(NA, 2))
```

**Expected output:**
Histogram of 1000 samples centered around 100 with the red $\mathcal{N}(100, 15)$ density curve overlaid. Setting `freq=FALSE` normalizes the histogram to density (area = 1), enabling direct comparison with the theoretical PDF.

---

## Exercise 1: Exponential Distribution Simulation

### Visualize exponential curves for $\lambda = 0.5, 1, 2$ and simulate samples

**Theory:** The exponential distribution $\text{Exp}(\lambda)$ has:
- PDF: $f(x) = \lambda e^{-\lambda x}$ for $x \geq 0$
- Mean: $E[X] = 1/\lambda$
- Variance: $\text{Var}(X) = 1/\lambda^2$
- Standard deviation: $\sigma = 1/\lambda$

**Answer:**
```r
# Part 1: Plot density curves for different lambda values
plot(NULL,
     xlim = c(0, 5), ylim = c(0, 2),
     xlab = "x", ylab = "f(x) = lambda * exp(-lambda * x)",
     main = "Exponential Distribution Density Functions")

lambdas <- c(0.5, 1, 2)
colors <- c("green", "red", "blue")

for (i in 1:length(lambdas)) {
  lambda <- lambdas[i]
  curve(lambda * exp(-lambda * x),
        from = 0, to = 5, add = TRUE,
        col = colors[i], lwd = 2)
}

legend("topright",
       legend = c("lambda = 0.5", "lambda = 1", "lambda = 2"),
       col = colors, lwd = 2)
grid()
```

**Expected output:**
Three exponential decay curves:
- Blue ($\lambda = 2$): starts at $f(0) = 2$, decays fastest, mean = 0.5
- Red ($\lambda = 1$): starts at $f(0) = 1$, standard exponential, mean = 1
- Green ($\lambda = 0.5$): starts at $f(0) = 0.5$, decays slowest, mean = 2

```r
# Part 2: Generate 80 samples from Exp(2) and compare statistics
set.seed(123)
n_samples <- 80
lambda <- 2
samples <- rexp(n_samples, rate = lambda)

theoretical_mean <- 1 / lambda      # 0.5
theoretical_sd <- 1 / lambda        # 0.5
empirical_mean <- mean(samples)
empirical_sd <- sd(samples)

cat("Exponential Distribution with lambda = 2:\n")
cat("Theoretical mean:", theoretical_mean, "\n")
cat("Empirical mean:", round(empirical_mean, 3), "\n")
cat("Theoretical SD:", theoretical_sd, "\n")
cat("Empirical SD:", round(empirical_sd, 3), "\n")
```

**Expected output:**
```
Exponential Distribution with lambda = 2:
Theoretical mean: 0.5
Empirical mean: 0.482
Theoretical SD: 0.5
Empirical SD: 0.467
```

```r
# Part 3: Histogram vs theoretical density
hist(samples,
     freq = FALSE, breaks = 10,
     main = "Exponential Samples vs Theoretical Density (lambda=2, n=80)",
     xlab = "x", ylab = "Density",
     col = "lightblue", border = "black")

curve(lambda * exp(-lambda * x),
      from = 0, to = max(samples),
      add = TRUE, col = "red", lwd = 2)

legend("topright",
       legend = c("Empirical samples", "Theoretical density"),
       fill = c("lightblue", NA),
       border = c("black", NA),
       col = c(NA, "red"), lwd = c(NA, 2))
```

**Expected output:**
Right-skewed histogram with tallest bar near 0, overlaid by the red $f(x) = 2e^{-2x}$ curve.

**Mathematical explanation:**
With 80 samples, the empirical mean (0.482) is close to $E[X] = 1/\lambda = 0.5$ but not exact. The Law of Large Numbers guarantees convergence as $n \to \infty$. The standard error is $\text{SE} = \sigma/\sqrt{n} = 0.5/\sqrt{80} \approx 0.056$.

---

## Exercise 2: Urn Problem

### An urn contains $p$ red balls and $q$ black balls. Draw $k$ balls without replacement.

**Theory:** Drawing without replacement follows the **hypergeometric distribution** $H(N, K, n)$:

$$P(X = x) = \frac{\binom{K}{x}\binom{N-K}{n-x}}{\binom{N}{n}}$$

With $N = p + q$, $K = p$ (red balls), $n = k$ (draws):
- $E[X] = n \cdot K/N = k \cdot p/(p+q)$
- $\text{Var}(X) = n \cdot \frac{K}{N} \cdot \frac{N-K}{N} \cdot \frac{N-n}{N-1}$

**Answer:**
```r
# Define the urn function
Urne <- function(k, p, q) {
  urne <- c(rep("Rouge", p), rep("Noire", q))
  tirages <- sample(urne, k, replace = FALSE)
  return(tirages)
}

# Parameters
set.seed(42)
k <- 6   # Number of balls to draw
p <- 8   # Red balls
q <- 5   # Black balls

# Single draw
single_draw <- Urne(k, p, q)
print("Single draw result:")
print(single_draw)

counts <- table(single_draw)
print("Counts:")
print(counts)
```

**Expected output:**
```
[1] "Single draw result:"
[1] "Noire" "Rouge" "Rouge" "Noire" "Rouge" "Rouge"
[1] "Counts:"
single_draw
Noire Rouge
    2     4
```

```r
# Simulate 1000 experiments
n_experiments <- 1000
red_counts <- numeric(n_experiments)

set.seed(123)
for (i in 1:n_experiments) {
  draw <- Urne(k, p, q)
  red_counts[i] <- sum(draw == "Rouge")
}

theoretical_mean <- k * p / (p + q)

cat("Statistics for", n_experiments, "draws:\n")
cat("Empirical mean:", round(mean(red_counts), 3), "\n")
cat("Theoretical mean:", round(theoretical_mean, 3), "\n")
cat("Empirical SD:", round(sd(red_counts), 3), "\n")
```

**Expected output:**
```
Statistics for 1000 draws:
Empirical mean: 3.681
Theoretical mean: 3.692
Empirical SD: 0.909
```

```r
# Compare empirical vs theoretical (hypergeometric) distribution
N <- p + q   # 13
K <- p       # 8
n <- k       # 6
max_red <- min(k, p)
possible_values <- 0:max_red

theoretical_probs <- dhyper(possible_values, m = K, n = N - K, k = n)
empirical_probs <- table(red_counts) / n_experiments

barplot(rbind(theoretical_probs, empirical_probs[as.character(possible_values)]),
        beside = TRUE,
        col = c("steelblue", "lightcoral"),
        names.arg = possible_values,
        main = "Theoretical vs Empirical Distribution",
        xlab = "Number of red balls drawn",
        ylab = "Probability",
        legend.text = c("Theoretical (Hypergeometric)", "Empirical"),
        args.legend = list(x = "topright"))
```

**Expected output:**
Paired bar chart showing close agreement between theoretical hypergeometric and empirical probabilities. Distribution peaks around 3-4 red balls.

| Red balls drawn | $P(X = x)$ theoretical | Empirical approximation |
|----------------|------------------------|------------------------|
| 0 | 0.0006 | ~0.001 |
| 1 | 0.0175 | ~0.017 |
| 2 | 0.1224 | ~0.120 |
| 3 | 0.3147 | ~0.318 |
| 4 | 0.3497 | ~0.348 |
| 5 | 0.1632 | ~0.162 |
| 6 | 0.0326 | ~0.034 |

**Mathematical explanation:**
`dhyper(x, m, n, k)` computes $P(X = x) = \frac{\binom{m}{x}\binom{n}{k-x}}{\binom{m+n}{k}}$. The expected number of red balls is $E[X] = k \cdot p/(p+q) = 6 \times 8/13 \approx 3.692$, matching the empirical result.

---

## Exercise 3: Dice Frequency (Law of Large Numbers)

### Roll a fair die repeatedly and observe convergence of frequency to $1/6$

**Theory:** For a fair die, each face has probability $p = 1/6$. The LLN predicts that as $n$ increases, the empirical frequency $\hat{f}_n$ converges to $p$. The standard error is:

$$\text{SE}(\hat{f}_n) = \sqrt{\frac{p(1-p)}{n}} = \sqrt{\frac{5}{36n}}$$

**Answer:**
```r
# Define frequency function
Freq <- function(n, cible) {
  de <- 1:6
  tirages <- sample(de, n, replace = TRUE)
  frequence <- sum(tirages == cible) / n
  return(frequence)
}

# Test with different sample sizes
experience <- c(10, 100, 1000, 10000)
cible <- 5

set.seed(42)

cat("Observing frequency of rolling a", cible, ":\n")
cat("Theoretical probability: 1/6 =", round(1/6, 4), "\n\n")

for (n in experience) {
  freq <- Freq(n, cible)
  error <- abs(freq - 1/6)
  cat(sprintf("n = %5d rolls: frequency = %.4f (error: %.4f)\n", n, freq, error))
}
```

**Expected output:**
```
Observing frequency of rolling a 5 :
Theoretical probability: 1/6 = 0.1667

n =    10 rolls: frequency = 0.1000 (error: 0.0667)
n =   100 rolls: frequency = 0.1700 (error: 0.0033)
n =  1000 rolls: frequency = 0.1690 (error: 0.0023)
n = 10000 rolls: frequency = 0.1651 (error: 0.0015)
```

```r
# Visualize cumulative frequency convergence
max_rolls <- 1000
cible <- 1

set.seed(123)
tirages <- sample(1:6, max_rolls, replace = TRUE)

is_cible <- (tirages == cible)
cumulative_successes <- cumsum(is_cible)
cumulative_frequency <- cumulative_successes / (1:max_rolls)

plot(1:max_rolls, cumulative_frequency,
     type = "l", col = "blue", lwd = 2,
     xlab = "Number of rolls (n)",
     ylab = "Frequency of target outcome",
     main = paste("Law of Large Numbers: Frequency of rolling", cible),
     ylim = c(0, 0.5))

abline(h = 1/6, col = "red", lwd = 2, lty = 2)

# 95% confidence bands
p <- 1/6
n_seq <- 1:max_rolls
se <- sqrt(p * (1 - p) / n_seq)
lines(n_seq, rep(p, max_rolls) + 1.96 * se, col = "gray", lty = 3)
lines(n_seq, rep(p, max_rolls) - 1.96 * se, col = "gray", lty = 3)

legend("topright",
       legend = c("Empirical frequency", "Theoretical probability (1/6)",
                  "95% confidence band"),
       col = c("blue", "red", "gray"),
       lty = c(1, 2, 3), lwd = c(2, 2, 1))
grid()
```

**Expected output:**
Blue line starting with wild fluctuations, gradually settling toward the red dashed line at $1/6 \approx 0.1667$. Gray confidence bands form a funnel shape that narrows as $n$ increases.

```r
# Multiple independent experiments
n_experiments <- 10
max_rolls <- 500
cible <- 3

set.seed(456)

plot(NULL,
     xlim = c(1, max_rolls), ylim = c(0, 0.5),
     xlab = "Number of rolls (n)",
     ylab = "Cumulative frequency",
     main = paste(n_experiments, "Independent Experiments: Convergence to 1/6"))

for (exp in 1:n_experiments) {
  tirages <- sample(1:6, max_rolls, replace = TRUE)
  is_cible <- (tirages == cible)
  cumulative_freq <- cumsum(is_cible) / (1:max_rolls)
  lines(1:max_rolls, cumulative_freq,
        col = rainbow(n_experiments)[exp], lwd = 1.5)
}

abline(h = 1/6, col = "black", lwd = 3, lty = 2)
legend("topright",
       legend = c("Individual experiments", "Theoretical (1/6)"),
       col = c(rainbow(n_experiments)[1], "black"),
       lwd = c(1.5, 3), lty = c(1, 2))
grid()
```

**Expected output:**
10 colored lines all converging toward the black dashed line at $1/6$, demonstrating that the LLN holds for every realization.

```r
# All faces frequency distribution
max_rolls <- 10000
set.seed(789)
tirages <- sample(1:6, max_rolls, replace = TRUE)

face_counts <- table(tirages)
face_frequencies <- face_counts / max_rolls

barplot(face_frequencies,
        main = paste("Frequency Distribution of Dice Rolls (n =", max_rolls, ")"),
        xlab = "Die face", ylab = "Frequency",
        col = rainbow(6), ylim = c(0, 0.25), border = "white")
abline(h = 1/6, col = "black", lwd = 2, lty = 2)

cat("Frequency distribution after", max_rolls, "rolls:\n")
for (face in 1:6) {
  freq <- face_frequencies[as.character(face)]
  error <- abs(freq - 1/6)
  cat(sprintf("Face %d: %.4f (error: %.4f)\n", face, freq, error))
}
cat("\nMax deviation from 1/6:", round(max(abs(face_frequencies - 1/6)), 4), "\n")
```

**Expected output:**
```
Frequency distribution after 10000 rolls:
Face 1: 0.1686 (error: 0.0019)
Face 2: 0.1698 (error: 0.0031)
Face 3: 0.1622 (error: 0.0045)
Face 4: 0.1637 (error: 0.0030)
Face 5: 0.1697 (error: 0.0030)
Face 6: 0.1660 (error: 0.0007)

Max deviation from 1/6: 0.0045
```

**Mathematical explanation:**
The **Law of Large Numbers** states that for i.i.d. random variables $X_1, \ldots, X_n$ with $E[X_i] = \mu$:

$$\bar{X}_n = \frac{1}{n}\sum_{i=1}^n X_i \xrightarrow{P} \mu \quad \text{as } n \to \infty$$

The standard error $\text{SE} = \sqrt{p(1-p)/n}$ decreases as $1/\sqrt{n}$. At $n = 10000$, $\text{SE} = \sqrt{5/(36 \times 10000)} \approx 0.0037$, so all deviations are within 1--2 standard errors.

---

## Summary

| Exercise | Concept | Key result |
|----------|---------|------------|
| Part 2 | d/p/q/r system | Complete access to any distribution in R |
| Exercise 1 | Exponential distribution | Mean = $1/\lambda$, empirical matches theoretical |
| Exercise 1 | Law of Large Numbers | Empirical mean converges to $E[X]$ as $n$ grows |
| Exercise 2 | Hypergeometric distribution | Drawing without replacement modeled by `dhyper()` |
| Exercise 3 | Law of Large Numbers | Empirical frequency converges to $P(\text{event}) = 1/6$ |
| Exercise 3 | Standard error | SE decreases as $1/\sqrt{n}$, creating funnel-shaped confidence bands |
