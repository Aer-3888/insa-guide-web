---
title: "TP2 - Law of Large Numbers and Central Limit Theorem"
sidebar_position: 2
---

# TP2 - Law of Large Numbers and Central Limit Theorem

> Following teacher instructions from: `S5/Probabilites/data/moodle/tp/tp2/README.md`

## Setup

```r
# Install MASS package if not already installed
# install.packages("MASS")
library(MASS)
```

The `MASS` package provides the `michelson` dataset containing Michelson's 1879 speed of light measurements: 100 measurements across 5 experiments of 20 runs each.

---

## Exercise 1: Michelson's Speed of Light Data -- Law of Large Numbers

### 1. Load and explore the `michelson` dataset from MASS library

**Answer:**
```r
library(MASS)

summary(michelson)
head(michelson)

cat("Dataset structure:\n")
str(michelson)

cat("\nNumber of measurements:", nrow(michelson), "\n")
cat("Number of experiments:", length(unique(michelson$Expt)), "\n")
```

**Expected output:**
```
      Expt          Run            Speed
 Min.   :1    Min.   : 1.00   Min.   : 620
 1st Qu.:2    1st Qu.: 5.75   1st Qu.: 850
 Median :3    Median :10.50   Median : 850
 Mean   :3    Mean   :10.50   Mean   : 852.4
 3rd Qu.:4    3rd Qu.:15.25   3rd Qu.: 870
 Max.   :5    Max.   :20.00   Max.   :1070

  Expt Run Speed
1    1   1   850
2    1   2   740
3    1   3   900
4    1   4  1070
5    1   5   930
6    1   6   850

Dataset structure:
'data.frame':	100 obs. of  3 variables:
 $ Expt : int  1 1 1 1 1 1 1 1 1 1 ...
 $ Run  : int  1 2 3 4 5 6 7 8 9 10 ...
 $ Speed: int  850 740 900 1070 930 850 950 980 980 880 ...

Number of measurements: 100
Number of experiments: 5
```

**Explanation:**
Speed values are in km/s with 299,000 subtracted (so 850 means 299,850 km/s). The actual speed of light is 299,792.458 km/s, so in these units the "true" value would be 792.458 -- Michelson's measurements systematically overestimate.

---

### 2. Calculate mean and standard deviation

**Answer:**
```r
mu <- mean(michelson$Speed)
sigma <- sd(michelson$Speed)
n <- length(michelson$Speed)

cat("Overall statistics:\n")
cat("Mean speed:", round(mu, 2), "\n")
cat("Standard deviation:", round(sigma, 2), "\n")
cat("Variance:", round(var(michelson$Speed), 2), "\n")
```

**Expected output:**
```
Overall statistics:
Mean speed: 852.4
Standard deviation: 79.01
Variance: 6242.67
```

**Mathematical explanation:**
R's `sd()` computes the sample standard deviation with Bessel's correction (divides by $n-1$):

$$S' = \sqrt{\frac{1}{n-1}\sum_{i=1}^{n}(X_i - \bar{X})^2}$$

This gives an unbiased estimator of the population variance. With $n = 100$, the difference between dividing by 99 vs 100 is small.

---

### 3. Visualize convergence using cumulative mean (Law of Large Numbers)

**Theory:** For $X_1, X_2, \ldots, X_n$ i.i.d. with $E[X_i] = \mu$:

$$\bar{X}_n = \frac{1}{n}\sum_{i=1}^n X_i \xrightarrow{P} \mu \quad \text{as } n \to \infty$$

**Answer:**
```r
# Calculate cumulative mean using cumsum
cumulative_means <- cumsum(michelson$Speed) / (1:n)

plot(1:n, cumulative_means,
     type = "l", col = "blue", lwd = 2,
     xlab = "Number of measurements used (n)",
     ylab = "Cumulative mean",
     main = "Law of Large Numbers: Convergence of Empirical Mean",
     ylim = range(c(cumulative_means, mu)))

abline(h = mu, col = "red", lwd = 2, lty = 2)
grid()
legend("topright",
       legend = c("Cumulative mean", "Final mean (all 100 measurements)"),
       col = c("blue", "red"), lty = c(1, 2), lwd = 2)
```

**Expected output:**
Blue line starting at the first measurement (850), fluctuating significantly for the first ~20 measurements, then progressively stabilizing toward the final mean 852.4 (red dashed line). The path zigzags but the trend is convergent.

```r
# Convergence at key points
key_points <- c(1, 5, 10, 20, 50, 100)

cat("Convergence of empirical mean:\n")
cat(sprintf("%-6s | %-12s | %-10s\n", "n", "Emp. Mean", "Error"))
cat(strrep("-", 35), "\n")

for (i in key_points) {
  emp_mean <- cumulative_means[i]
  error <- abs(emp_mean - mu)
  cat(sprintf("%6d | %12.3f | %10.3f\n", i, emp_mean, error))
}
```

**Expected output:**
```
Convergence of empirical mean:
n      | Emp. Mean    | Error
-----------------------------------
     1 |      850.000 |      2.400
     5 |      898.000 |     45.600
    10 |      892.000 |     39.600
    20 |      881.500 |     29.100
    50 |      856.000 |      3.600
   100 |      852.400 |      0.000
```

**Mathematical explanation:**
The standard error $\text{SE} = \sigma/\sqrt{n}$ governs the rate of convergence:

$$\text{Var}(\bar{X}_n) = \frac{\sigma^2}{n}, \quad \text{SD}(\bar{X}_n) = \frac{\sigma}{\sqrt{n}}$$

```r
# Visualize with standard error bands
standard_errors <- sigma / sqrt(1:n)

plot(1:n, cumulative_means,
     type = "l", col = "darkblue", lwd = 2,
     xlab = "Number of measurements (n)",
     ylab = "Cumulative mean +/- 1 SE",
     main = "Convergence with Standard Error Bands",
     ylim = c(min(cumulative_means - standard_errors),
              max(cumulative_means + standard_errors)))

lines(1:n, cumulative_means + standard_errors, col = "gray", lty = 3)
lines(1:n, cumulative_means - standard_errors, col = "gray", lty = 3)
abline(h = mu, col = "red", lwd = 2, lty = 2)

legend("topright",
       legend = c("Cumulative mean", "True mean", "+/- 1 SE"),
       col = c("darkblue", "red", "gray"), lty = c(1, 2, 3), lwd = c(2, 2, 1))
grid()
```

**Expected output:**
Funnel-shaped confidence envelope that narrows as $n$ increases. At $n = 1$, $\text{SE} = 79.01$. At $n = 100$, $\text{SE} = 79.01/10 = 7.90$.

---

### 4. Create histogram with theoretical normal overlay (Central Limit Theorem)

**Answer:**
```r
hist(michelson$Speed,
     freq = FALSE, breaks = 25,
     col = "lightblue", border = "white",
     xlab = "Speed (km/s - 299000)", ylab = "Density",
     main = "Distribution of All Measurements (n=100)")

curve(dnorm(x, mean = mu, sd = sigma),
      from = min(michelson$Speed), to = max(michelson$Speed),
      add = TRUE, col = "red", lwd = 2)

legend("topright",
       legend = c("Empirical distribution", "Normal N(mu, sigma)"),
       fill = c("lightblue", NA), border = c("black", NA),
       col = c(NA, "red"), lwd = c(NA, 2))
```

**Expected output:**
Roughly bell-shaped histogram of 100 measurements with the red $\mathcal{N}(852.4, 79.01)$ curve overlaid. Distribution ranges from about 620 to 1070.

---

### 5. Group by experiment and compare distributions

**Answer:**
```r
# Calculate mean for each experiment using tapply()
experiment_means <- tapply(michelson$Speed, michelson$Expt, mean)

cat("Experiment means (n=20 each):\n")
print(experiment_means)

# CLT prediction for distribution of means
mu_xbar <- mu
sigma_xbar <- sigma / sqrt(20)

cat("\nCentral Limit Theorem prediction:\n")
cat("Mean of X_bar_20:", round(mu_xbar, 2), "\n")
cat("SD of X_bar_20 (SE):", round(sigma_xbar, 2), "\n")

cat("\nEmpirical (from 5 experiments):\n")
cat("Mean of experiment means:", round(mean(experiment_means), 2), "\n")
cat("SD of experiment means:", round(sd(experiment_means), 2), "\n")
```

**Expected output:**
```
Experiment means (n=20 each):
    1     2     3     4     5
909.0 856.0 845.0 820.5 831.5

Central Limit Theorem prediction:
Mean of X_bar_20: 852.4
SD of X_bar_20 (SE): 17.67

Empirical (from 5 experiments):
Mean of experiment means: 852.4
SD of experiment means: 34.28
```

**Mathematical explanation:**
By the CLT, the distribution of sample means approaches:

$$\bar{X}_n \sim \mathcal{N}\left(\mu, \frac{\sigma^2}{n}\right) \quad \text{approximately}$$

The `tapply(VALUES, GROUPS, FUNCTION)` function applies a function to data grouped by a factor. The empirical SD (34.28) is higher than the predicted SE (17.67), but with only 5 data points the estimate is very unreliable.

```r
# Bootstrap simulation to demonstrate CLT more clearly
n_simulations <- 1000
sample_size <- 20

set.seed(42)
simulated_means <- replicate(n_simulations, {
  sample_data <- sample(michelson$Speed, sample_size, replace = TRUE)
  mean(sample_data)
})

hist(simulated_means,
     freq = FALSE, breaks = 30,
     col = "lightgreen", border = "white",
     xlab = "Sample mean", ylab = "Density",
     main = paste("CLT: Distribution of", n_simulations, "Sample Means (n=20)"))

curve(dnorm(x, mean = mu, sd = sigma/sqrt(sample_size)),
      from = min(simulated_means), to = max(simulated_means),
      add = TRUE, col = "darkgreen", lwd = 3)

points(experiment_means, rep(0, length(experiment_means)),
       pch = 19, col = "red", cex = 1.5)

legend("topright",
       legend = c("Simulated means", "Theoretical N(mu, sigma^2/n)",
                  "Actual experiment means"),
       fill = c("lightgreen", NA, NA),
       border = c("black", NA, NA),
       col = c(NA, "darkgreen", "red"),
       lwd = c(NA, 3, NA), pch = c(NA, NA, 19))
```

**Expected output:**
Bell-shaped histogram of 1000 simulated means, narrower than the original data distribution. The green $\mathcal{N}(852.4, 17.67)$ curve fits well. Red dots mark actual experiment means.

```r
# Compare different sample sizes
sample_sizes <- c(5, 10, 20, 50)
par(mfrow = c(2, 2))

for (n_sample in sample_sizes) {
  set.seed(123)
  means_n <- replicate(1000, mean(sample(michelson$Speed, n_sample, replace = TRUE)))
  se_n <- sigma / sqrt(n_sample)

  hist(means_n, freq = FALSE, breaks = 30,
       col = "skyblue", border = "white",
       main = paste("Sample size n =", n_sample),
       xlab = "Sample mean", ylab = "Density",
       xlim = c(mu - 4*sigma/sqrt(5), mu + 4*sigma/sqrt(5)))

  curve(dnorm(x, mean = mu, sd = se_n),
        add = TRUE, col = "red", lwd = 2)
}

par(mfrow = c(1, 1))
```

**Expected output:**
Four panels showing increasingly narrow, more normal distributions of means:
- $n = 5$: SE = 35.3, wide, somewhat irregular
- $n = 10$: SE = 25.0, narrower, more bell-shaped
- $n = 20$: SE = 17.7, good normal fit
- $n = 50$: SE = 11.2, very narrow, excellent normal fit

---

## Exercise 2: Multiple Choice Question (MCQ) Simulation

### Problem setup

- 10 questions, 4 choices each, only 1 correct
- Student answers randomly: $p = 1/4 = 0.25$
- Pass requires $\geq 6$ correct answers
- Model: $X \sim B(n = 10, p = 0.25)$

### 1. Calculate exact probability: $P(X \geq 6) = 1 - P(X \leq 5)$

**Answer:**
```r
n_questions <- 10
p_correct <- 0.25
pass_threshold <- 6

# Method 1: Using binomial CDF
prob_pass_exact <- 1 - pbinom(pass_threshold - 1, size = n_questions, prob = p_correct)

cat("Exact probability calculation:\n")
cat("P(pass) = P(X >= 6) =", round(prob_pass_exact, 5), "\n")
cat("P(fail) = P(X < 6) =", round(1 - prob_pass_exact, 5), "\n\n")

# Method 2: Summing individual probabilities
prob_pass_sum <- sum(dbinom(6:10, size = n_questions, prob = p_correct))
cat("Verification by summing P(X=k) for k=6..10:", round(prob_pass_sum, 5), "\n\n")

# Complete probability distribution
x_values <- 0:n_questions
prob_values <- dbinom(x_values, size = n_questions, prob = p_correct)

cat("Complete probability distribution:\n")
for (i in 1:length(x_values)) {
  cat(sprintf("P(X = %2d) = %.5f %s\n",
              x_values[i], prob_values[i],
              ifelse(x_values[i] >= pass_threshold, "<-- PASS", "")))
}
```

**Expected output:**
```
Exact probability calculation:
P(pass) = P(X >= 6) = 0.01973
P(fail) = P(X < 6) = 0.98027

Verification by summing P(X=k) for k=6..10: 0.01973

Complete probability distribution:
P(X =  0) = 0.05631
P(X =  1) = 0.18771
P(X =  2) = 0.28157
P(X =  3) = 0.25028
P(X =  4) = 0.14600
P(X =  5) = 0.05840
P(X =  6) = 0.01622 <-- PASS
P(X =  7) = 0.00309 <-- PASS
P(X =  8) = 0.00039 <-- PASS
P(X =  9) = 0.00003 <-- PASS
P(X = 10) = 0.00000 <-- PASS
```

**Mathematical explanation:**
For $X \sim B(n = 10, p = 0.25)$:

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$$

$E[X] = np = 2.5$, $\text{Var}(X) = np(1-p) = 1.875$, $\sigma = 1.369$.

A student guessing randomly has only a 1.97% chance of passing. The expected score is only 2.5 out of 10.

---

### 2. Simulate 5000 exams using `rbinom()`

**Answer:**
```r
n_simulations <- 5000
set.seed(42)

exam_scores <- rbinom(n_simulations, size = n_questions, prob = p_correct)
exam_passed <- (exam_scores >= pass_threshold)
n_passed <- sum(exam_passed)
empirical_pass_rate <- n_passed / n_simulations

cat("Simulation results (", n_simulations, " exams):\n", sep = "")
cat("Number passed:", n_passed, "\n")
cat("Empirical pass rate:", round(empirical_pass_rate, 5), "\n")
cat("Exact pass rate:", round(prob_pass_exact, 5), "\n")
cat("Difference:", round(abs(empirical_pass_rate - prob_pass_exact), 5), "\n")
```

**Expected output:**
```
Simulation results (5000 exams):
Number passed: 103
Empirical pass rate: 0.02060
Exact pass rate: 0.01973
Difference: 0.00087
```

---

### 3. Verify Law of Large Numbers for pass rate

**Answer:**
```r
cumulative_passes <- cumsum(exam_passed)
cumulative_pass_rate <- cumulative_passes / (1:n_simulations)

plot(1:n_simulations, cumulative_pass_rate,
     type = "l", col = "blue", lwd = 2,
     xlab = "Number of simulated exams",
     ylab = "Pass rate",
     main = "Law of Large Numbers: Convergence to Theoretical Pass Rate",
     ylim = c(0, max(cumulative_pass_rate) * 1.1))

abline(h = prob_pass_exact, col = "red", lwd = 2, lty = 2)
legend("topright",
       legend = c("Empirical pass rate", "Theoretical pass rate"),
       col = c("blue", "red"), lty = c(1, 2), lwd = 2)
grid()
```

**Expected output:**
Blue cumulative pass rate line with large initial jumps, progressively converging toward the red dashed line at 0.01973.

```r
# Score distribution: empirical vs theoretical
hist(exam_scores,
     breaks = -0.5:(n_questions + 0.5),
     freq = FALSE, col = "lightblue", border = "white",
     xlab = "Number of correct answers", ylab = "Probability",
     main = paste("Score Distribution:", n_simulations, "Simulated Exams"))

points(x_values, prob_values, pch = 19, col = "red", cex = 1.5)
lines(x_values, prob_values, col = "red", lwd = 2)
abline(v = pass_threshold - 0.5, col = "darkgreen", lwd = 2, lty = 3)

legend("topright",
       legend = c("Empirical (simulated)", "Theoretical (binomial)", "Pass threshold"),
       col = c("lightblue", "red", "darkgreen"),
       lwd = c(10, 2, 2), lty = c(1, 1, 3), pch = c(NA, 19, NA))
```

**Expected output:**
Histogram bars and red dots align closely. Almost all mass is in the fail region (left of the green threshold line).

---

### 4. Apply CLT: approximate with normal distribution

**Answer:**
```r
# Check approximation suitability
np <- n_questions * p_correct
n_1_minus_p <- n_questions * (1 - p_correct)

cat("Normal approximation suitability check:\n")
cat("np =", np, "(should be >= 5)\n")
cat("n(1-p) =", n_1_minus_p, "(should be >= 5)\n")

if (np < 5 || n_1_minus_p < 5) {
  cat("\nWARNING: Normal approximation may not be accurate!\n")
  cat("np = 2.5 < 5, so the condition is NOT satisfied.\n\n")
}

# Normal approximation parameters
mu_X <- n_questions * p_correct                          # 2.5
sigma_X <- sqrt(n_questions * p_correct * (1 - p_correct))  # 1.369

# Without continuity correction
prob_pass_normal_no_cc <- 1 - pnorm(pass_threshold, mean = mu_X, sd = sigma_X)

cat("Probability P(X >= 6):\n")
cat("Exact (binomial):", round(prob_pass_exact, 6), "\n")
cat("Normal approx (no correction):", round(prob_pass_normal_no_cc, 6), "\n")
cat("Error:", round(abs(prob_pass_exact - prob_pass_normal_no_cc), 6), "\n")
cat("Relative error:", round(abs(prob_pass_exact - prob_pass_normal_no_cc) / prob_pass_exact * 100, 2), "%\n")
```

**Expected output:**
```
Normal approximation suitability check:
np = 2.5 (should be >= 5)
n(1-p) = 7.5 (should be >= 5)

WARNING: Normal approximation may not be accurate!
np = 2.5 < 5, so the condition is NOT satisfied.

Probability P(X >= 6):
Exact (binomial): 0.019734
Normal approx (no correction): 0.005334
Error: 0.014400
Relative error: 72.97 %
```

**Mathematical explanation:**
For $X \sim B(n, p)$, the CLT gives $X \approx \mathcal{N}(\mu = np, \sigma^2 = np(1-p))$.

Without continuity correction: $P(X \geq 6) \approx P\left(Z \geq \frac{6 - 2.5}{1.369}\right) = P(Z \geq 2.556) = 0.0053$.

The 73% relative error shows the approximation is very poor when $np < 5$.

---

### 5. Compare exact vs approximate probabilities (with continuity correction)

**Answer:**
```r
# With continuity correction: P(X >= 6) ~ P(Y > 5.5)
prob_pass_normal_cc <- 1 - pnorm(pass_threshold - 0.5, mean = mu_X, sd = sigma_X)

cat("With continuity correction:\n")
cat("Normal approx (with CC):", round(prob_pass_normal_cc, 6), "\n")
cat("Error:", round(abs(prob_pass_exact - prob_pass_normal_cc), 6), "\n")
cat("Relative error:", round(abs(prob_pass_exact - prob_pass_normal_cc) / prob_pass_exact * 100, 2), "%\n\n")

# Using proportions
p_threshold <- pass_threshold / n_questions  # 0.6
mu_p <- p_correct                            # 0.25
sigma_p <- sqrt(p_correct * (1 - p_correct) / n_questions)  # 0.1369

cat("Using sample proportions:\n")
cat("Pass threshold:", p_threshold, "(60% correct)\n")
cat("Mean proportion:", mu_p, "\n")
cat("SD of proportion:", round(sigma_p, 4), "\n\n")

prob_pass_prop_no_cc <- 1 - pnorm(p_threshold, mean = mu_p, sd = sigma_p)
prob_pass_prop_cc <- 1 - pnorm((pass_threshold - 0.5) / n_questions, mean = mu_p, sd = sigma_p)

cat("P(proportion >= 0.6):\n")
cat("No CC:", round(prob_pass_prop_no_cc, 6), "\n")
cat("With CC:", round(prob_pass_prop_cc, 6), "\n")
cat("Exact:", round(prob_pass_exact, 6), "\n")
```

**Expected output:**
```
With continuity correction:
Normal approx (with CC): 0.014209
Error: 0.005526
Relative error: 28.00 %

Using sample proportions:
Pass threshold: 0.6 (60% correct)
Mean proportion: 0.25
SD of proportion: 0.1369

P(proportion >= 0.6):
No CC: 0.005334
With CC: 0.014209
Exact: 0.019734
```

**Mathematical explanation:**
The **continuity correction** accounts for the discrete-to-continuous mismatch:
- $P(X \geq k) \approx P(Y > k - 0.5)$ where $Y \sim \mathcal{N}(np, np(1-p))$

This shifts the boundary from 6 to 5.5, recovering probability mass from the "step" at $X = 6$. Error drops from 73% to 28%.

```r
# Visualization: Binomial vs Normal
x_discrete <- 0:n_questions
x_continuous <- seq(-1, n_questions + 1, length.out = 300)

pmf_binomial <- dbinom(x_discrete, size = n_questions, prob = p_correct)
pdf_normal <- dnorm(x_continuous, mean = mu_X, sd = sigma_X)

plot(x_continuous, pdf_normal,
     type = "l", col = "red", lwd = 2,
     xlab = "Number of correct answers", ylab = "Probability / Density",
     main = "Binomial Distribution vs Normal Approximation",
     ylim = c(0, max(c(pmf_binomial, pdf_normal)) * 1.1))

for (i in 1:length(x_discrete)) {
  segments(x_discrete[i], 0, x_discrete[i], pmf_binomial[i], col = "blue", lwd = 5)
}
points(x_discrete, pmf_binomial, pch = 19, col = "blue", cex = 1.2)

abline(v = pass_threshold - 0.5, col = "darkgreen", lwd = 2, lty = 3)

legend("topright",
       legend = c("Binomial (exact)", "Normal approximation", "Pass threshold (with CC)"),
       col = c("blue", "red", "darkgreen"), lwd = c(5, 2, 2), lty = c(1, 1, 3))
grid()
```

**Expected output:**
Blue vertical bars (exact binomial) with red smooth curve (normal approximation). Visible mismatch: binomial is right-skewed, normal is symmetric. The normal underestimates the right tail.

```r
# Show improvement with larger n
par(mfrow = c(2, 2))
n_values <- c(10, 20, 50, 100)

for (n in n_values) {
  mu_n <- n * p_correct
  sigma_n <- sqrt(n * p_correct * (1 - p_correct))
  x_n <- 0:n
  pmf_n <- dbinom(x_n, size = n, prob = p_correct)

  plot(x_n, pmf_n, type = "h", lwd = 2, col = "blue",
       xlab = "Number correct", ylab = "Probability",
       main = paste("n =", n, " (np =", n * p_correct, ")"))

  curve(dnorm(x, mean = mu_n, sd = sigma_n),
        from = 0, to = n, add = TRUE, col = "red", lwd = 2)
}
par(mfrow = c(1, 1))
```

**Expected output:**
Four panels with improving fit: $n = 10$ (poor), $n = 20$ (better at threshold), $n = 50$ (very good), $n = 100$ (excellent). The rule of thumb $np \geq 5$ marks where the approximation becomes visually acceptable.

---

## Summary Comparison Table

| Method | $P(X \geq 6)$ for $B(10, 0.25)$ | Error vs exact |
|--------|----------------------------------|----------------|
| Exact binomial | 0.019734 | -- |
| Normal, no CC | 0.005334 | 73.0% relative error |
| Normal, with CC | 0.014209 | 28.0% relative error |
| Simulation (5000) | ~0.0206 | ~4.4% relative error |

**Key takeaway:** For this problem ($n = 10$, $p = 0.25$), always use the exact binomial. The normal approximation is inadequate because $np = 2.5 < 5$. For larger $n$ ($\geq 20$ with $p = 0.25$), the normal approximation becomes acceptable, especially with continuity correction.
