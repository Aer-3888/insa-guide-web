---
title: "Chapter 6: Hypothesis Testing"
sidebar_position: 6
---

# Chapter 6: Hypothesis Testing

## 6.1 Introduction

A **hypothesis test** is a statistical method that allows making decisions from data -- it determines whether observed results are **statistically significant** or could be due to chance.

**Warning**: A test is NOT a proof. It quantifies evidence against a null hypothesis.

---

## 6.2 Framework

### Hypotheses

| | Description |
|---|---|
| $H_0$ (null hypothesis) | Default assumption; what we assume is true |
| $H_1$ (alternative hypothesis) | What we want to show / detect |

**Convention**:
- **Ethical**: $H_1$ = what we hope to demonstrate
- **Practical**: $H_0$ = a well-defined, testable statement (e.g., $\mu = \mu_0$)

### Errors

| | $H_0$ is true | $H_1$ is true |
|---|---|---|
| **Accept $H_0$** | Correct | Type II error ($\beta$) |
| **Reject $H_0$** | Type I error ($\alpha$) | Correct (Power = $1-\beta$) |

- $\alpha = P(\text{reject } H_0 \mid H_0 \text{ true})$ -- **significance level**, set in advance (typically 0.05)
- $\beta = P(\text{accept } H_0 \mid H_1 \text{ true})$ -- depends on the true parameter value
- **Power** $= 1 - \beta = P(\text{reject } H_0 \mid H_1 \text{ true})$

---

## 6.3 Test Methodology

### General Procedure

1. **Define** $H_0$ and $H_1$
2. **Choose** the test statistic $S$ and determine its distribution under $H_0$
3. **Set** the significance level $\alpha$
4. **Compute** $s$ (the observed value of $S$ from data)
5. **Decide**: Is $s$ in the acceptance region (high probability zone) or rejection region?

### Two Resolution Methods

**Method 1: Confidence Interval Approach**
- Compute the acceptance region (interval of high probability under $H_0$)
- If observed statistic falls inside: accept $H_0$
- If outside: reject $H_0$

**Method 2: p-value Approach**
- Compute the p-value: the smallest $\alpha$ for which $H_0$ would be rejected
- If p-value $< \alpha$: reject $H_0$
- If p-value $> \alpha$: accept $H_0$

### p-value Interpretation

| p-value range | Strength of evidence against $H_0$ |
|---|---|
| $> 0.05$ | Not significant (accept $H_0$) |
| $[0.01, 0.05]$ | Significant |
| $[0.001, 0.01]$ | Very significant |
| $< 0.001$ | Highly significant |

For a two-tailed test with statistic $s$:

$$\text{p-value} = P(|S| \geq |s|) = 2 \cdot P(S \leq -|s|)$$

---

## 6.4 Conformity Tests (One-Sample)

Test whether a sample is consistent with a hypothesized parameter value.

### Conformity Test for Mean -- $\sigma$ Known

$$H_0: \mu = \mu_0 \qquad H_1: \mu \neq \mu_0$$

**Test statistic**: $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)$ under $H_0$

**Decision**: Reject $H_0$ if $|z| > u_{1-\alpha/2}$ (i.e., if $z \notin [-1.96, 1.96]$ for $\alpha = 0.05$).

**p-value**: $2 \cdot \text{pnorm}(-|z|)$

### Conformity Test for Mean -- $\sigma$ Unknown

$$H_0: \mu = \mu_0 \qquad H_1: \mu \neq \mu_0$$

**Test statistic**: $T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}} \sim t_{n-1}$ under $H_0$

**Decision**: Reject $H_0$ if $|t| > t_{n-1}(1-\alpha/2)$.

**p-value**: $2 \cdot \text{pt}(-|t|, \text{df}=n-1)$

### Worked Example: Insulating Pieces

> Supplier claims mean thickness = 7.3mm. Sample of 24 pieces: $\bar{x} = 7.126$, $\sigma = 0.38$ (known). Test at $\alpha = 0.05$.

$$z = \frac{7.126 - 7.3}{0.38/\sqrt{24}} = \frac{-0.174}{0.0776} = -2.24$$

Acceptance region: $[-1.96, 1.96]$. Since $-2.24 \notin [-1.96, 1.96]$, **reject $H_0$**.

p-value: $2 \times \text{pnorm}(-2.24) = 0.025 < 0.05$.

With $\sigma$ unknown ($s' = 0.395$): $t = \frac{7.126 - 7.3}{0.395/\sqrt{24}} = -2.157$. The acceptance region for $t_{23}$ at $\alpha = 0.05$ is $[-2.069, 2.069]$. Since $|-2.157| > 2.069$, still **reject $H_0$**.

---

## 6.5 Homogeneity Tests (Two-Sample)

Test whether two populations have the same mean.

### Setup

Two independent samples from $X_1 \sim \mathcal{N}(\mu_1, \sigma_1)$ and $X_2 \sim \mathcal{N}(\mu_2, \sigma_2)$.

$$H_0: \mu_1 = \mu_2 \qquad H_1: \mu_1 \neq \mu_2$$

Let $D = \bar{X}_1 - \bar{X}_2$. Under $H_0$: $E[D] = 0$.

### Case 1: $\sigma_1 = \sigma_2 = \sigma$ Known

$$\sigma_D^2 = \sigma^2\left(\frac{1}{n_1} + \frac{1}{n_2}\right)$$

$$Z = \frac{D}{\sigma_D} \sim \mathcal{N}(0,1)$$

### Case 2: $\sigma_1 = \sigma_2$ Unknown (Pooled t-Test)

Estimate $\sigma$ using the pooled variance:

$$\hat{\sigma}^2 = \frac{(n_1 - 1)s_1'^2 + (n_2 - 1)s_2'^2}{n_1 + n_2 - 2}$$

$$\hat{\sigma}_D^2 = \hat{\sigma}^2\left(\frac{1}{n_1} + \frac{1}{n_2}\right)$$

$$T = \frac{D}{\hat{\sigma}_D} \sim t_{n_1+n_2-2}$$

### Case 3: $\sigma_1 \neq \sigma_2$ Unknown (Welch's Test / Aspin-Welch)

$$\hat{\sigma}_D^2 = \frac{s_1'^2}{n_1} + \frac{s_2'^2}{n_2}$$

$$T = \frac{D}{\hat{\sigma}_D} \sim t_\nu$$

where degrees of freedom $\nu$ is computed by Satterthwaite's formula:

$$\frac{1}{\nu} = \frac{1}{n_1-1}\left(\frac{s_1'^2/n_1}{\hat{\sigma}_D^2}\right)^2 + \frac{1}{n_2-1}\left(\frac{s_2'^2/n_2}{\hat{\sigma}_D^2}\right)^2$$

### R Functions

```r noexec
# One-sample t-test (conformity)
t.test(x, mu=mu_0, conf.level=0.95)

# Two-sample t-test (homogeneity)
t.test(x, y, var.equal=TRUE)   # Equal variances (pooled)
t.test(x, y, var.equal=FALSE)  # Unequal variances (Welch)

# z-test (sigma known) -- requires TeachingDemos package
library(TeachingDemos)
z.test(x, mu=mu_0, stdev=sigma)
```

---

## 6.6 Power Analysis

### Concept

**Power** = $1 - \beta$ = probability of correctly rejecting $H_0$ when it is false.

Power depends on:
1. **Effect size**: how different the true parameter is from $H_0$
2. **Sample size** $n$: larger $n$ = higher power
3. **Significance level** $\alpha$: larger $\alpha$ = higher power (but more Type I errors)
4. **Variability** $\sigma$: smaller $\sigma$ = higher power

### Computing Power (Conformity, $\sigma$ Known)

Under $H_0$: $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)$.

Under $H_1$ ($\mu = \mu_1$): $Z \sim \mathcal{N}\left(\frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}}, 1\right)$.

$$\text{Power} = 1 - \text{pnorm}\left(u_{1-\alpha/2}, \text{mean} = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}}\right)$$

### Worked Example

> Milk bottles: $\sigma = 1$ml, $\mu_0 = 1000$ml, $n = 40$. Detect shift of 0.2ml.

Standardized effect: $\Delta = 0.2 / (1/\sqrt{40}) = 0.2 \times \sqrt{40} = 1.265$.

Power $= 1 - \text{pnorm}(1.96, \text{mean}=1.265) = 1 - 0.756 = 0.244$.

Only 24.4% power -- insufficient. For 90% power, need $n \approx 263$ bottles.

---

## 6.7 Normality Tests

Before applying parametric tests, verify that data is approximately normal.

### Graphical Methods

1. **Histogram vs normal curve**: visual overlay comparison
2. **Box plot**: check symmetry (median centered, equal whiskers)
3. **QQ-plot**: quantile-quantile plot against theoretical normal; points should fall on a straight line

### Formal Tests

| Test | R Function | Best for |
|------|-----------|----------|
| Shapiro-Wilk | `shapiro.test(x)` | $n \leq 50$ |
| Kolmogorov-Smirnov | `ks.test(x, "pnorm", mean, sd)` | Large samples |

Both test $H_0$: data is normally distributed. Reject if p-value $< \alpha$.

---

## 6.8 Complete Methodology Checklist

1. Define test type: **conformity** or **homogeneity**?
2. Define $H_0$ and $H_1$
3. Identify the test statistic and its distribution:
   - Conformity, $\sigma$ known: $Z \sim \mathcal{N}(0,1)$
   - Conformity, $\sigma$ unknown: $T \sim t_{n-1}$
   - Homogeneity, $\sigma$ known/equal: $Z \sim \mathcal{N}(0,1)$
   - Homogeneity, $\sigma$ equal unknown: $T \sim t_{n_1+n_2-2}$
   - Homogeneity, $\sigma$ unequal unknown: $T \sim t_\nu$ (Welch)
4. Compute the statistic from data
5. Determine acceptance region or p-value
6. Make decision and state conclusion

---

## CHEAT SHEET -- Hypothesis Testing

| Test | Statistic | Distribution under $H_0$ | Reject $H_0$ if |
|---|---|---|---|
| Conformity, $\sigma$ known | $Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | $\|Z\| > u_{1-\alpha/2}$ |
| Conformity, $\sigma$ unknown | $T = \frac{\bar{X}-\mu_0}{S'/\sqrt{n}}$ | $t_{n-1}$ | $\|T\| > t_{n-1}(1-\alpha/2)$ |
| Homogeneity, $\sigma$ known | $Z = D/\sigma_D$ | $\mathcal{N}(0,1)$ | $\|Z\| > u_{1-\alpha/2}$ |
| Homogeneity, $\sigma_1=\sigma_2$ unknown | $T = D/\hat{\sigma}_D$ | $t_{n_1+n_2-2}$ | $\|T\| > t_{df}(1-\alpha/2)$ |
| Homogeneity, $\sigma_1 \neq \sigma_2$ | $T = D/\hat{\sigma}_D$ | $t_\nu$ (Welch) | $\|T\| > t_\nu(1-\alpha/2)$ |

**p-value rule**: Reject $H_0$ if p-value $< \alpha$.

**Power**: $1 - \beta$. Increases with $n$, effect size, and $\alpha$. Decreases with $\sigma$.
