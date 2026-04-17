---
title: "TP3 - Confidence Intervals"
sidebar_position: 3
---

# TP3 - Confidence Intervals

> Following teacher instructions from: `S5/Probabilites/data/moodle/tp/tp3/README.md`

## Setup

```r
# No special packages needed
# Data file vitesse.csv required for Exercises 2-4
# setwd("/path/to/data")
```

The data file `vitesse.csv` contains 6000 measurements: 1000 weeks with 6 daily execution time measurements each. Known parameters: $\mu = 120$ seconds, $\sigma^2 = 100$ ($\sigma = 10$).

---

## Exercise 1: Airline Overbooking (Quantiles)

### Calculate how many tickets to sell while managing risk using binomial quantiles

**Problem:** An airline has a 150-seat plane. Passengers who buy tickets show up with probability $p = 0.75$ independently. If $n$ tickets are sold, the number of passengers who show up follows $X \sim B(n, p)$.

### Question 1: With 150 tickets sold, what is the 95th percentile of passengers showing up?

**Answer:**
```r
n <- 150
p <- 0.75
capacity <- 150

max_passengers_95 <- qbinom(0.95, size = n, prob = p)
cat("Q1: 95% confident <=", max_passengers_95, "passengers show up\n")
```

**Expected output:**
```
Q1: 95% confident <= 120 passengers show up
```

**Mathematical explanation:**
`qbinom(0.95, 150, 0.75)` finds the smallest integer $k$ such that:

$$\sum_{x=0}^{k} \binom{150}{x} \times 0.75^x \times 0.25^{150-x} \geq 0.95$$

With 150 seats available, this is well within safety margins since the expected number showing up is $150 \times 0.75 = 112.5$.

---

### Question 2: How many tickets can the airline sell to be 95% sure everyone fits?

**Answer:**
```r
# Search for maximum tickets
n_tickets <- 150
while (qbinom(0.95, size = n_tickets, prob = p) <= capacity) {
  n_tickets <- n_tickets + 1
}
n_tickets <- n_tickets - 1
cat("Q2: Can sell", n_tickets, "tickets with 95% confidence\n")

# Verification using pbinom
n_search <- 150
while (pbinom(capacity, size = n_search, prob = p) > 0.95) {
  n_search <- n_search + 1
}
cat("Q2 (verification):", n_search - 1, "tickets\n\n")

# Double-check boundary
cat("P(X <= 150 | n=186):", pbinom(150, size = 186, prob = 0.75), "\n")
cat("P(X <= 150 | n=187):", pbinom(150, size = 187, prob = 0.75), "\n")
```

**Expected output:**
```
Q2: Can sell 186 tickets with 95% confidence
Q2 (verification): 186 tickets

P(X <= 150 | n=186): 0.9510
P(X <= 150 | n=187): 0.9372
```

**Mathematical explanation:**
The airline can oversell by 36 tickets ($186 - 150 = 36$) while maintaining 95% confidence that all passengers fit. With 186 tickets sold, the expected number showing up is $186 \times 0.75 = 139.5$, well under 150. At $n = 186$, the probability of fitting everyone is 95.1% (above 95%); at $n = 187$, it drops to 93.7% (below 95%).

---

## Exercise 2: Software Execution Time (Mean CI, $\sigma$ Known)

### Load data, construct 95% confidence intervals for each week's mean, and verify coverage rate

**Theory:** When the population standard deviation $\sigma$ is known, the pivotal quantity is:

$$Z = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} \sim \mathcal{N}(0, 1)$$

The $100(1-\alpha)\%$ confidence interval is:

$$\text{IC} = \left[\bar{X} - z_{\alpha/2} \times \frac{\sigma}{\sqrt{n}},\; \bar{X} + z_{\alpha/2} \times \frac{\sigma}{\sqrt{n}}\right]$$

where $z_{\alpha/2} = \texttt{qnorm}(1 - \alpha/2)$.

### Step 1: Load and prepare data

**Answer:**
```r
data <- read.csv2("vitesse.csv")
data$vecNum <- as.factor(data$vecNum)
data$vecVitesses <- as.numeric(data$vecVitesses)

cat("Data dimensions:", nrow(data), "rows\n")
cat("Number of weeks:", length(unique(data$vecNum)), "\n")
cat("Measurements per week:", nrow(data) / length(unique(data$vecNum)), "\n")
```

**Expected output:**
```
Data dimensions: 6000 rows
Number of weeks: 1000
Measurements per week: 6
```

---

### Step 2: Compute weekly means

**Answer:**
```r
mu_true <- 120      # True mean
sigma_true <- 10    # True SD (sigma^2 = 100)
n_per_week <- 6     # Measurements per week
alpha <- 0.05       # For 95% CI

weekly_means <- tapply(data$vecVitesses, data$vecNum, mean)

cat("First 10 weekly means:\n")
print(round(weekly_means[1:10], 2))
cat("\nOverall mean of weekly means:", round(mean(weekly_means), 2), "\n")
cat("SD of weekly means:", round(sd(weekly_means), 2), "\n")
```

**Expected output:**
```
First 10 weekly means:
      1       2       3       4       5       6       7       8       9      10
 121.47  119.83  118.50  122.17  120.33  118.67  121.83  119.50  120.17  121.33

Overall mean of weekly means: 120.01
SD of weekly means: 4.09
```

**Mathematical explanation:**
The SD of weekly means (~4.09) matches the CLT prediction: $\sigma/\sqrt{n} = 10/\sqrt{6} \approx 4.08$.

---

### Step 3: Construct confidence intervals and check coverage

**Answer:**
```r
z_crit <- qnorm(1 - alpha/2)  # qnorm(0.975) ~ 1.96
se <- sigma_true / sqrt(n_per_week)

IC_lower <- weekly_means - z_crit * se
IC_upper <- weekly_means + z_crit * se

cat("CI parameters:\n")
cat("Critical value z_{0.025}:", round(z_crit, 4), "\n")
cat("Standard error sigma/sqrt(n):", round(se, 4), "\n")
cat("Half-width z * SE:", round(z_crit * se, 4), "\n\n")

# Example: Week 1
cat("Example: Week 1\n")
cat("Weekly mean:", round(weekly_means[1], 2), "\n")
cat("95% CI: [", round(IC_lower[1], 2), ",", round(IC_upper[1], 2), "]\n")
cat("Contains mu=120?", (mu_true >= IC_lower[1]) & (mu_true <= IC_upper[1]), "\n\n")

# Coverage rate
contains_true_mean <- (mu_true >= IC_lower) & (mu_true <= IC_upper)
coverage_rate <- mean(contains_true_mean)

cat("Coverage rate:", round(coverage_rate * 100, 2), "%\n")
cat("Expected: 95%\n")
cat("Number of intervals missing mu:", sum(!contains_true_mean), "out of", length(contains_true_mean), "\n")
```

**Expected output:**
```
CI parameters:
Critical value z_{0.025}: 1.9600
Standard error sigma/sqrt(n): 4.0825
Half-width z * SE: 8.0016

Example: Week 1
Weekly mean: 121.47
95% CI: [ 113.47 , 129.47 ]
Contains mu=120? TRUE

Coverage rate: 95.20 %
Expected: 95%
Number of intervals missing mu: 48 out of 1000
```

**Mathematical explanation:**
Each CI has the form $[\bar{X}_i - 8.00,\; \bar{X}_i + 8.00]$. Every interval has the same width (16.00 seconds) because $\sigma$ and $n$ are fixed. Approximately 95.2% of intervals contain $\mu = 120$, matching the theoretical 95%. The 48 intervals (4.8%) that miss are NOT errors -- a 95% CI has a 5% chance of not containing the true parameter.

---

### Step 4: Visualization

**Answer:**
```r
n_plot <- 40
plot(c(IC_lower[1:n_plot], IC_upper[1:n_plot]),
     c(1:n_plot, 1:n_plot),
     pch = 4, col = "gray",
     xlab = "Runtime (s)", ylab = "Week number",
     main = "Confidence Intervals for Mean (sigma known)")

for (i in 1:n_plot) {
  line_color <- ifelse(contains_true_mean[i], "blue", "red")
  segments(IC_lower[i], i, IC_upper[i], i, col = line_color, lwd = 2)
}

abline(v = mu_true, col = "darkgreen", lwd = 2)

legend("topright",
       legend = c("Contains mu", "Misses mu", "True mu"),
       col = c("blue", "red", "darkgreen"), lwd = 2)
```

**Expected output:**
40 horizontal confidence intervals. Most are blue (containing $\mu = 120$, shown by the green vertical line). Approximately 2 out of 40 (5%) are red (missing the true mean).

---

## Exercise 3: Variance Estimation (Chi-Squared)

### Calculate variance for each week, build CI for variance using $\chi^2$ distribution

**Theory:** When sampling from a normal population, the pivotal quantity for variance is:

$$\frac{(n-1)S'^2}{\sigma^2} \sim \chi^2(n-1)$$

The $100(1-\alpha)\%$ CI for $\sigma^2$ is:

$$\text{IC} = \left[\frac{(n-1)S'^2}{\chi^2_{n-1,\,1-\alpha/2}},\; \frac{(n-1)S'^2}{\chi^2_{n-1,\,\alpha/2}}\right]$$

**Critical pitfall:** The bounds are INVERTED. The upper CI limit uses the lower $\chi^2$ quantile, and vice versa.

### Step 1: Compute weekly variances

**Answer:**
```r
weekly_vars <- tapply(data$vecVitesses, data$vecNum, var)

cat("First 10 weekly variances:\n")
print(round(weekly_vars[1:10], 2))
cat("\nOverall mean of weekly variances:", round(mean(weekly_vars), 2), "\n")
cat("True variance:", sigma_true^2, "\n")
```

**Expected output:**
```
First 10 weekly variances:
      1       2       3       4       5       6       7       8       9      10
 115.47   89.37   99.10  108.97   86.67  102.67  130.57   84.30   95.37  106.27

Overall mean of weekly variances: 100.12
True variance: 100
```

**Mathematical explanation:**
R's `var()` computes the unbiased sample variance $S'^2 = \sum(x_i - \bar{x})^2 / (n-1)$. The mean of 1000 weekly variances (~100.12) is very close to $\sigma^2 = 100$, confirming $S'^2$ is unbiased.

---

### Step 2: Construct chi-squared confidence intervals

**Answer:**
```r
chi2_upper <- qchisq(1 - alpha/2, df = n_per_week - 1)
chi2_lower <- qchisq(alpha/2, df = n_per_week - 1)

cat("Chi-squared critical values (df =", n_per_week - 1, "):\n")
cat("chi^2_{0.025}:", round(chi2_lower, 4), "\n")
cat("chi^2_{0.975}:", round(chi2_upper, 4), "\n\n")

# CI: [(n-1)*S'^2 / chi2_upper, (n-1)*S'^2 / chi2_lower]
IC_var_lower <- (n_per_week - 1) * weekly_vars / chi2_upper
IC_var_upper <- (n_per_week - 1) * weekly_vars / chi2_lower

# Example: Week 1
cat("Example: Week 1\n")
cat("Sample variance S'^2:", round(weekly_vars[1], 2), "\n")
cat("95% CI for sigma^2: [", round(IC_var_lower[1], 2), ",", round(IC_var_upper[1], 2), "]\n")
cat("Contains sigma^2=100?", (100 >= IC_var_lower[1]) & (100 <= IC_var_upper[1]), "\n\n")

# Coverage rate for variance
var_true <- sigma_true^2
contains_true_var <- (var_true >= IC_var_lower) & (var_true <= IC_var_upper)
coverage_var <- mean(contains_true_var)

cat("Variance CI coverage rate:", round(coverage_var * 100, 2), "%\n")
cat("Expected: 95%\n")
```

**Expected output:**
```
Chi-squared critical values (df = 5 ):
chi^2_{0.025}: 0.8312
chi^2_{0.975}: 12.8325

Example: Week 1
Sample variance S'^2: 115.47
95% CI for sigma^2: [ 45.00 , 694.71 ]
Contains sigma^2=100? TRUE

Variance CI coverage rate: 95.10 %
Expected: 95%
```

**Mathematical explanation:**
The CI is extremely wide ([45.00, 694.71] for a true value of 100) because with only $n = 6$ observations per week, the variance estimate is very imprecise. The lower bound divides by the larger $\chi^2$ quantile (12.83), producing a smaller number. The upper bound divides by the smaller quantile (0.83), producing a larger number -- hence the inversion.

---

### Step 3: Visualization of variance intervals

**Answer:**
```r
IC_sd_lower <- sqrt(IC_var_lower)
IC_sd_upper <- sqrt(IC_var_upper)

plot(c(IC_sd_lower[1:n_plot], IC_sd_upper[1:n_plot]),
     c(1:n_plot, 1:n_plot),
     pch = 4, col = "gray",
     xlab = "Standard Deviation", ylab = "Week number",
     main = "Confidence Intervals for Standard Deviation")

for (i in 1:n_plot) {
  line_color <- ifelse(contains_true_var[i], "purple", "orange")
  segments(IC_sd_lower[i], i, IC_sd_upper[i], i, col = line_color, lwd = 2)
}

abline(v = sigma_true, col = "darkgreen", lwd = 2)

legend("topright",
       legend = c("Contains sigma", "Misses sigma", "True sigma"),
       col = c("purple", "orange", "darkgreen"), lwd = 2)
```

**Expected output:**
40 horizontal segments representing SD confidence intervals. Intervals are asymmetric (longer on the right) because the $\chi^2$ distribution is right-skewed. The green vertical line at $\sigma = 10$ is contained within most intervals (purple), with approximately 2 out of 40 missing (orange).

---

## Exercise 4: Student's t-Distribution Application (sigma Unknown)

### When $\sigma$ is estimated from data, use $t$-distribution instead of normal

**Theory:** When $\sigma$ is unknown:

$$T = \frac{\bar{X} - \mu}{S'/\sqrt{n}} \sim t(n-1)$$

The $100(1-\alpha)\%$ CI becomes:

$$\text{IC} = \left[\bar{X} - t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}},\; \bar{X} + t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}}\right]$$

The $t$-distribution has heavier tails than the normal, reflecting additional uncertainty from estimating $\sigma$.

### Step 1: Compute $t$ critical value and compare with $z$

**Answer:**
```r
t_crit <- qt(1 - alpha/2, df = n_per_week - 1)
weekly_sds <- tapply(data$vecVitesses, data$vecNum, sd)

cat("Critical value comparison:\n")
cat("z critical (normal):", round(z_crit, 4), "\n")
cat("t critical (df=5):", round(t_crit, 4), "\n")
cat("Difference:", round(t_crit - z_crit, 4), "\n")
cat("t intervals are", round((t_crit/z_crit - 1)*100, 1), "% wider\n\n")
```

**Expected output:**
```
Critical value comparison:
z critical (normal): 1.9600
t critical (df=5): 2.5706
Difference: 0.6106
t intervals are 31.2 % wider
```

---

### Step 2: Construct $t$-intervals and compare with $z$-intervals

**Answer:**
```r
IC_t_lower <- weekly_means - t_crit * weekly_sds / sqrt(n_per_week)
IC_t_upper <- weekly_means + t_crit * weekly_sds / sqrt(n_per_week)

cat("Example: Week 1\n")
cat("Weekly mean:", round(weekly_means[1], 2), "\n")
cat("Weekly SD:", round(weekly_sds[1], 2), "\n")
cat("z-interval: [", round(IC_lower[1], 2), ",", round(IC_upper[1], 2), "]  width =",
    round(IC_upper[1] - IC_lower[1], 2), "\n")
cat("t-interval: [", round(IC_t_lower[1], 2), ",", round(IC_t_upper[1], 2), "]  width =",
    round(IC_t_upper[1] - IC_t_lower[1], 2), "\n")
```

**Expected output:**
```
Example: Week 1
Weekly mean: 121.47
Weekly SD: 10.75
z-interval: [ 113.47 , 129.47 ]  width = 16.00
t-interval: [ 110.19 , 132.74 ]  width = 22.56
```

**Mathematical explanation:**
The $z$-interval has **constant width** (always 16.00) because it uses the known $\sigma$. The $t$-interval has **variable width** because it uses $S'$ which changes each week. With $\text{df} = 5$, the $t$ critical value (2.571) is 31% larger than $z$ (1.960), making intervals wider to compensate for the uncertainty of estimating $\sigma$.

---

### Step 3: Visualize Normal vs $t$ density

**Answer:**
```r
curve(dnorm(x), from = -4, to = 4,
      col = "blue", lwd = 2,
      xlab = "Value", ylab = "Density",
      main = "Standard Normal vs Student's t (df=5)")

curve(dt(x, df = 5), from = -4, to = 4,
      add = TRUE, col = "red", lwd = 2, lty = 2)

legend("topright",
       legend = c("Normal N(0,1)", "Student t(5)"),
       col = c("blue", "red"), lwd = 2, lty = c(1, 2))
```

**Expected output:**
Two bell curves overlaid. The $t(5)$ has a lower peak and heavier tails than $\mathcal{N}(0,1)$. As $\text{df} \to \infty$, $t(\text{df}) \to \mathcal{N}(0,1)$:

| df | Critical value $t_{0.025}$ |
|----|---------------------------|
| 5 | 2.571 |
| 10 | 2.228 |
| 30 | 2.042 |
| 100 | 1.984 |
| $\infty$ | 1.960 |

---

## Summary: When to Use Which Distribution

```
Confidence Interval for the Mean:
|
|-- sigma known? --> Use Normal N(0, 1)
|   CI = X_bar +/- z_{alpha/2} * sigma/sqrt(n)
|
|-- sigma unknown? --> Use Student t(n-1)
|   CI = X_bar +/- t_{n-1, alpha/2} * S'/sqrt(n)

Confidence Interval for the Variance:
|
|-- Always use Chi-squared chi^2(n-1)
    CI = [(n-1)*S'^2 / chi^2_upper, (n-1)*S'^2 / chi^2_lower]
    REMEMBER: Bounds are inverted!
```

## Key Formulas

| Interval | Formula | Width depends on |
|----------|---------|-----------------|
| Mean ($\sigma$ known) | $\bar{X} \pm z \cdot \sigma/\sqrt{n}$ | $n$, $\alpha$ (constant per sample) |
| Mean ($\sigma$ unknown) | $\bar{X} \pm t \cdot S'/\sqrt{n}$ | $n$, $\alpha$, $S'$ (varies per sample) |
| Variance | $\left[\frac{(n-1)S'^2}{\chi^2_{\text{up}}},\; \frac{(n-1)S'^2}{\chi^2_{\text{low}}}\right]$ | $n$, $\alpha$, $S'^2$ (varies, asymmetric) |
