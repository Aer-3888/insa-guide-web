---
title: "TP4 - Hypothesis Testing"
sidebar_position: 4
---

# TP4 - Hypothesis Testing

> Following teacher instructions from: `S5/Probabilites/data/moodle/tp/tp4/README.md`

## Setup

```r
# No special packages needed
# All functions are from base R
```

---

## Exercise 1: Octopus Weights -- One-Sample t-Test (Conformity Test)

### 15 octopuses weighed. Is the mean weight 3000g? Calculate CI, perform conformity test using both manual and `t.test()` approaches.

**Theory:**

- $H_0$: $\mu = \mu_0$ (population mean equals hypothesized value)
- $H_1$: $\mu \neq \mu_0$ (two-sided alternative)
- Test statistic ($\sigma$ unknown): $T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}} \sim t(n-1)$ under $H_0$
- Decision: reject $H_0$ if $|T| > t_{n-1,\,\alpha/2}$ or if p-value $< \alpha$

### Step 1: Compute sample statistics

**Answer:**
```r
poids_poulpe <- c(1150, 1500, 1700, 1800, 1800, 1850, 2200, 2700,
                   2900, 3000, 3100, 3500, 3900, 4000, 5400)

n <- length(poids_poulpe)
alpha <- 0.10  # 90% confidence

mean_empirical <- mean(poids_poulpe)
sd_empirical <- sd(poids_poulpe)

cat("Octopus weight statistics:\n")
cat("Sample size:", n, "\n")
cat("Mean:", round(mean_empirical, 2), "g\n")
cat("SD:", round(sd_empirical, 2), "g\n\n")
```

**Expected output:**
```
Octopus weight statistics:
Sample size: 15
Mean: 2700 g
SD: 1158.39 g
```

**Explanation:**
The sample mean (2700g) is 300g below the hypothesized value (3000g). The hypothesis test determines whether this difference is statistically significant or just sampling variability.

---

### Step 2: Calculate CI for mean

**Answer:**
```r
t_crit <- qt(1 - alpha/2, df = n - 1)
se <- sd_empirical / sqrt(n)

CI_lower <- mean_empirical - t_crit * se
CI_upper <- mean_empirical + t_crit * se

cat("90% Confidence Interval for mean:\n")
cat("t critical value: qt(0.95, df=14) =", round(t_crit, 4), "\n")
cat("Standard error: S'/sqrt(n) =", round(se, 2), "\n")
cat("CI: [", round(CI_lower, 2), ",", round(CI_upper, 2), "]\n\n")
```

**Expected output:**
```
90% Confidence Interval for mean:
t critical value: qt(0.95, df=14) = 1.7613
Standard error: S'/sqrt(n) = 299.14
CI: [ 2173.15 , 3226.85 ]
```

**Mathematical explanation:**
$$\text{CI} = \left[\bar{X} - t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}},\; \bar{X} + t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}}\right]$$
$$= [2700 - 1.761 \times 299.14,\; 2700 + 1.761 \times 299.14] = [2173.15,\; 3226.85]$$

Since $\mu_0 = 3000$ falls INSIDE the 90% CI, we will NOT reject $H_0$ at $\alpha = 0.10$. There is a duality: reject $H_0$ at level $\alpha$ if and only if $\mu_0$ falls outside the $(1-\alpha)$ CI.

---

### Step 3: Perform conformity test (manual)

**Answer:**
```r
mu_0 <- 3000

# Compute test statistic
test_statistic <- (mean_empirical - mu_0) / (sd_empirical / sqrt(n))

# Critical region boundaries
critical_lower <- -qt(1 - alpha/2, df = n - 1)
critical_upper <- qt(1 - alpha/2, df = n - 1)

cat("Conformity test: H0: mu = 3000g\n")
cat("Test statistic: T =", round(test_statistic, 4), "\n")
cat("Critical region: (-inf,", round(critical_lower, 4), "] U [",
    round(critical_upper, 4), ", +inf)\n")
cat("|T| =", round(abs(test_statistic), 4), "\n")
cat("|T| > t_crit?", abs(test_statistic) > critical_upper, "\n")

if (abs(test_statistic) > critical_upper) {
  cat("Decision: REJECT H0\n")
} else {
  cat("Decision: FAIL TO REJECT H0\n")
}

# Manual p-value computation
p_value_manual <- 2 * pt(abs(test_statistic), df = n - 1, lower.tail = FALSE)
cat("\np-value:", round(p_value_manual, 4), "\n")
```

**Expected output:**
```
Conformity test: H0: mu = 3000g
Test statistic: T = -1.0029
Critical region: (-inf, -1.7613 ] U [ 1.7613 , +inf)
|T| = 1.0029
|T| > t_crit? FALSE
Decision: FAIL TO REJECT H0

p-value: 0.3328
```

**Mathematical explanation:**
$$T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}} = \frac{2700 - 3000}{1158.39 / \sqrt{15}} = \frac{-300}{299.14} = -1.003$$

Since $|T| = 1.003 < t_{14,\,0.05} = 1.761$, the test statistic falls in the acceptance region.

The p-value = 0.333 is $2 \times P(T > 1.003)$ where $T \sim t(14)$. Since p-value $= 0.333 > \alpha = 0.10$, we fail to reject $H_0$.

---

### Step 4: Use `t.test()` function

**Answer:**
```r
test_result <- t.test(poids_poulpe, mu = mu_0, conf.level = 1 - alpha)
cat("Using t.test():\n")
print(test_result)
```

**Expected output:**
```
Using t.test():

	One Sample t-test

data:  poids_poulpe
t = -1.0029, df = 14, p-value = 0.3328
alternative hypothesis: true mean is not equal to 3000
90 percent confidence interval:
 2173.149 3226.851
sample estimates:
mean of x
     2700
```

**Interpretation:**
- **t = -1.0029**: matches manual calculation
- **df = 14**: $n - 1 = 15 - 1 = 14$
- **p-value = 0.3328**: probability of data this extreme if $H_0$ true
- **90% CI = [2173.15, 3226.85]**: matches manual calculation
- **Decision**: p-value $= 0.333 > \alpha = 0.10$, FAIL TO REJECT $H_0$

"Fail to reject $H_0$" does NOT mean "$H_0$ is true." It means we lack sufficient evidence to disprove it. With only 15 octopuses and high variability ($S' = 1158$g), the test lacks power to detect a 300g difference.

---

## Exercise 2: Treatment Comparison -- Two-Sample t-Test (Homogeneity Test)

### Two groups (n=12, n=8) with different treatments. Test if means differ. Assumes equal variances.

**Theory:**

- $H_0$: $\mu_A = \mu_B$ (means are equal)
- $H_1$: $\mu_A \neq \mu_B$ (two-sided)
- Pooled variance: $S_p^2 = \frac{(n_A - 1)S_A'^2 + (n_B - 1)S_B'^2}{n_A + n_B - 2}$
- Test statistic: $T = \frac{\bar{X}_A - \bar{X}_B}{S_p\sqrt{1/n_A + 1/n_B}} \sim t(n_A + n_B - 2)$ under $H_0$

### Step 1: Compute pooled variance and test statistic

**Answer:**
```r
na <- 12
nb <- 8
mean_a <- 1.5
mean_b <- 2.35
sd_a <- 0.95
sd_b <- 1.35
alpha <- 0.05

# Pooled variance estimate
sp2 <- ((na - 1)*sd_a^2 + (nb - 1)*sd_b^2) / (na + nb - 2)
sp <- sqrt(sp2)

# Test statistic
diff_means <- mean_a - mean_b
se_diff <- sp * sqrt(1/na + 1/nb)
t_stat <- diff_means / se_diff

# Critical value
df <- na + nb - 2
t_critical <- qt(1 - alpha/2, df = df)

cat("Two-sample t-test (equal variances assumed):\n")
cat("Group A: n=", na, ", mean=", mean_a, ", sd=", sd_a, "\n", sep = "")
cat("Group B: n=", nb, ", mean=", mean_b, ", sd=", sd_b, "\n\n", sep = "")
cat("Pooled variance S_p^2:", round(sp2, 4), "\n")
cat("Pooled SD S_p:", round(sp, 4), "\n")
cat("Difference in means:", diff_means, "\n")
cat("Standard error:", round(se_diff, 4), "\n")
cat("Test statistic T:", round(t_stat, 4), "\n")
cat("Degrees of freedom:", df, "\n")
cat("Critical value t_{18, 0.025}:", round(t_critical, 4), "\n\n")

cat("|T| =", round(abs(t_stat), 4), "\n")
cat("|T| > t_crit?", abs(t_stat) > t_critical, "\n")

if (abs(t_stat) > t_critical) {
  cat("Decision: REJECT H0 (means are significantly different)\n")
} else {
  cat("Decision: FAIL TO REJECT H0 (no significant difference)\n")
}
```

**Expected output:**
```
Two-sample t-test (equal variances assumed):
Group A: n=12, mean=1.5, sd=0.95
Group B: n=8, mean=2.35, sd=1.35

Pooled variance S_p^2: 1.2614
Pooled SD S_p: 1.1231
Difference in means: -0.85
Standard error: 0.5125
Test statistic T: -1.6585
Degrees of freedom: 18
Critical value t_{18, 0.025}: 2.1009

|T| = 1.6585
|T| > t_crit? FALSE
Decision: FAIL TO REJECT H0 (no significant difference)
```

**Mathematical explanation:**
$$S_p^2 = \frac{11 \times 0.95^2 + 7 \times 1.35^2}{18} = \frac{9.9275 + 12.7575}{18} = 1.2614$$

$$T = \frac{1.5 - 2.35}{1.1231 \times \sqrt{1/12 + 1/8}} = \frac{-0.85}{0.5125} = -1.659$$

Since $|T| = 1.659 < 2.101$, we cannot reject $H_0$. The small samples ($n = 12$ and $n = 8$) combined with high variability prevent detecting the difference.

---

### Step 2: Examine effect of larger sample size (na=120, nb=80)

**Answer:**
```r
na_large <- 120
nb_large <- 80

sp2_large <- ((na_large - 1)*sd_a^2 + (nb_large - 1)*sd_b^2) / (na_large + nb_large - 2)
sp_large <- sqrt(sp2_large)
se_diff_large <- sp_large * sqrt(1/na_large + 1/nb_large)
t_stat_large <- diff_means / se_diff_large

df_large <- na_large + nb_large - 2
t_critical_large <- qt(1 - alpha/2, df = df_large)

cat("With larger samples (na=120, nb=80):\n")
cat("Pooled SD:", round(sp_large, 4), "\n")
cat("Standard error:", round(se_diff_large, 4), "\n")
cat("Test statistic T:", round(t_stat_large, 4), "\n")
cat("Critical value t_{198, 0.025}:", round(t_critical_large, 4), "\n")
cat("|T| > t_crit?", abs(t_stat_large) > t_critical_large, "\n")
cat("Decision:", ifelse(abs(t_stat_large) > t_critical_large,
                        "REJECT H0", "FAIL TO REJECT H0"), "\n")
```

**Expected output:**
```
With larger samples (na=120, nb=80):
Pooled SD: 1.1231
Standard error: 0.1625
Test statistic T: -5.2309
Critical value t_{198, 0.025}: 1.9720
|T| > t_crit? TRUE
Decision: REJECT H0
```

**Mathematical explanation:**
With 10x more data, the SAME means and SDs produce a significant result. The SE decreases by $\sqrt{10} \approx 3.16$: from 0.5125 to 0.1625. The test statistic jumps from $-1.66$ to $-5.23$.

Statistical significance depends on three factors:
1. **Effect size** (0.85 units) -- unchanged
2. **Variability** (pooled SD 1.12) -- unchanged
3. **Sample size** (200 vs 20) -- increased 10-fold

---

## Exercise 3: Milk Bottle Filling -- Power Analysis

### Known $\sigma = 1$ml, target $\mu = 1000$ml, $n = 40$ bottles. Test for calibration drift, calculate power for detecting 0.2ml shift, determine $n$ needed for 90% power.

**Theory:**

- **Power** $= 1 - \beta = P(\text{reject } H_0 \mid H_1 \text{ true})$
- **Type I error** ($\alpha$): rejecting $H_0$ when true (false positive)
- **Type II error** ($\beta$): failing to reject $H_0$ when $H_1$ true (false negative)

For a $z$-test ($\sigma$ known):
- Under $H_0$: $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} \sim \mathcal{N}(0, 1)$
- Under $H_1$ ($\mu = \mu_1$): $Z \sim \mathcal{N}(\delta, 1)$ where $\delta = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}}$
- Power $\approx 1 - \Phi(z_{\alpha/2} - \delta)$

### Step 1: Compute standardized effect and power

**Answer:**
```r
sigma <- 1
mu_0 <- 1000
n_bottles <- 40
alpha <- 0.05
effect <- 0.2   # Shift to detect: mu_1 = 1000.2
mu_1 <- mu_0 + effect

z_crit <- qnorm(1 - alpha/2)

# Standardized effect (non-centrality parameter)
z_effect <- effect / (sigma / sqrt(n_bottles))

# Power (right tail dominates when delta > 0)
power <- 1 - pnorm(z_crit, mean = z_effect, sd = 1)

cat("Power analysis setup:\n")
cat("H0: mu = 1000 ml\n")
cat("H1: mu = 1000.2 ml (0.2ml shift)\n")
cat("sigma =", sigma, "ml, n =", n_bottles, "bottles, alpha =", alpha, "\n\n")
cat("Critical value z_{0.025}:", round(z_crit, 4), "\n")
cat("Standard error sigma/sqrt(n):", round(sigma/sqrt(n_bottles), 4), "\n")
cat("Standardized effect delta:", round(z_effect, 4), "\n")
cat("Power (n=40):", round(power, 4), "\n")
cat("Interpretation:", round(power*100, 1), "% chance of detecting 0.2ml shift\n")
```

**Expected output:**
```
Power analysis setup:
H0: mu = 1000 ml
H1: mu = 1000.2 ml (0.2ml shift)
sigma = 1 ml, n = 40 bottles, alpha = 0.05

Critical value z_{0.025}: 1.9600
Standard error sigma/sqrt(n): 0.1581
Standardized effect delta: 1.2649
Power (n=40): 0.2445
Interpretation: 24.4 % chance of detecting 0.2ml shift
```

**Mathematical explanation:**
$$\delta = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}} = \frac{0.2}{1/\sqrt{40}} = 1.265$$

$$\text{Power} = 1 - \Phi(z_{\alpha/2} - \delta) = 1 - \Phi(1.96 - 1.265) = 1 - \Phi(0.695) = 0.244$$

Power of 24.4% is very poor -- the test will miss the shift about 3 out of 4 times. The effect size (0.2ml) is small relative to the noise ($\sigma = 1$ml).

---

### Step 2: Determine $n$ needed for 90% power

**Answer:**
```r
target_power <- 0.90
n_needed <- 40

while (TRUE) {
  z_eff_n <- effect / (sigma / sqrt(n_needed))
  power_n <- 1 - pnorm(z_crit, mean = z_eff_n, sd = 1)
  if (power_n >= target_power) break
  n_needed <- n_needed + 1
}

cat("Sample size for 90% power:", n_needed, "bottles\n")
cat("Verification: power at n =", n_needed, "is",
    round(1 - pnorm(z_crit, mean = effect / (sigma / sqrt(n_needed)), sd = 1), 4), "\n")
```

**Expected output:**
```
Sample size for 90% power: 263 bottles
Verification: power at n = 263 is 0.9003
```

**Mathematical explanation:**
Setting power $= 0.90$ and solving for $n$:

$$1 - \Phi(z_{\alpha/2} - \delta) = 0.90$$
$$z_{\alpha/2} - \delta = z_{0.10} = -1.282$$
$$1.96 - 0.2\sqrt{n} = -1.282$$
$$0.2\sqrt{n} = 3.242$$
$$\sqrt{n} = 16.21,\quad n = 263$$

---

### Step 3: Power curve

**Answer:**
```r
n_range <- seq(40, 300, by = 1)
powers <- numeric(length(n_range))

for (i in 1:length(n_range)) {
  z_eff <- effect / (sigma / sqrt(n_range[i]))
  powers[i] <- 1 - pnorm(z_crit, mean = z_eff, sd = 1)
}

plot(n_range, powers,
     type = "l", col = "blue", lwd = 2,
     xlab = "Sample size (n)", ylab = "Power",
     main = "Power Curve: Detecting 0.2ml Shift")

abline(h = 0.80, col = "orange", lwd = 2, lty = 2)
abline(h = 0.90, col = "red", lwd = 2, lty = 2)
abline(v = n_needed, col = "gray", lty = 3)

legend("bottomright",
       legend = c("Power curve", "80% power", "90% power", paste("n =", n_needed)),
       col = c("blue", "orange", "red", "gray"),
       lwd = c(2, 2, 2, 1), lty = c(1, 2, 2, 3))
grid()
```

**Expected output:**
S-shaped curve starting around 0.24 at $n = 40$, crossing 80% around $n = 197$, and reaching 90% at $n = 263$.

---

### Step 4: Power summary table

**Answer:**
```r
key_n <- c(40, 100, 150, 200, 263, 300, 400, 500)

cat("Power Summary Table:\n")
cat(sprintf("%-8s | %-20s | %-8s\n", "n", "Standardized effect", "Power"))
cat(strrep("-", 42), "\n")

for (n_val in key_n) {
  z_eff <- effect / (sigma / sqrt(n_val))
  pow <- 1 - pnorm(z_crit, mean = z_eff, sd = 1)
  cat(sprintf("%8d | %20.3f | %8.1f%%\n", n_val, z_eff, pow * 100))
}
```

**Expected output:**
```
Power Summary Table:
n        | Standardized effect  | Power
------------------------------------------
      40 |                1.265 |    24.4%
     100 |                2.000 |    51.6%
     150 |                2.449 |    69.4%
     200 |                2.828 |    80.7%
     263 |                3.243 |    90.0%
     300 |                3.464 |    93.4%
     400 |                4.000 |    97.9%
     500 |                4.472 |    99.4%
```

**Mathematical explanation:**
Required sample size scales as:

$$n = \left(\frac{z_{\alpha/2} + z_\beta}{\delta_{\text{raw}}/\sigma}\right)^2$$

where $\delta_{\text{raw}} = \mu_1 - \mu_0$ and $z_\beta$ is the quantile for the desired power. Power increases with: larger $n$, larger effect size, larger $\alpha$, smaller $\sigma$.

---

## Summary: Hypothesis Testing Decision Framework

### Test Procedure

1. State hypotheses: $H_0$: $\mu = \mu_0$ vs $H_1$: $\mu \neq \mu_0$
2. Choose $\alpha$ (typically 0.05 or 0.10)
3. Compute test statistic: $T = (\bar{X} - \mu_0) / (S'/\sqrt{n})$
4. Find critical value: $t_{n-1,\,\alpha/2}$ from `qt()`
5. Decision: reject $H_0$ if $|T| >$ critical value (equivalently, p-value $< \alpha$)
6. Interpret: state conclusion in context

### Common Mistakes

| Mistake | Correction |
|---------|-----------|
| "Accept $H_0$" | Say "Fail to reject $H_0$" |
| p-value $= P(H_0$ is true$)$ | p-value $= P(\text{data this extreme} \mid H_0$ true$)$ |
| Small p means large effect | Small p means unlikely under $H_0$; effect size is separate |
| Non-significant $=$ no difference | May just be underpowered (Type II error) |

### Formulas Reference

| Test | Statistic | Distribution under $H_0$ | R function |
|------|-----------|--------------------------|------------|
| One-sample ($\sigma$ known) | $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0, 1)$ | `pnorm()` |
| One-sample ($\sigma$ unknown) | $T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}}$ | $t(n-1)$ | `t.test(x, mu=mu_0)` |
| Two-sample (equal var) | $T = \frac{\bar{X}_A - \bar{X}_B}{S_p\sqrt{1/n_A + 1/n_B}}$ | $t(n_A + n_B - 2)$ | `t.test(x, y, var.equal=TRUE)` |
