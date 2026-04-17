---
title: "TP4: Hypothesis Testing"
sidebar_position: 4
---

# TP4: Hypothesis Testing

## Overview
Statistical hypothesis testing to make decisions about population parameters based on sample data.

## Topics Covered
1. **Conformity tests** (one-sample tests)
2. **Homogeneity tests** (two-sample comparisons)
3. **Test power** and sample size calculations

## Key Concepts

### Hypothesis Test Framework

**Null hypothesis (H₀)**: Default assumption (e.g., μ = μ₀)
**Alternative hypothesis (H₁)**: What we're testing for (e.g., μ ≠ μ₀)

**Test statistic**: Computed from data, follows known distribution under H₀
**p-value**: P(observing data as extreme | H₀ is true)
**Significance level (α)**: Threshold for rejection (typically 0.05)

**Decision**: Reject H₀ if p-value < α or test statistic in rejection region

### One-Sample t-Test (Conformity)

Test if population mean equals hypothesized value:
- H₀: μ = μ₀ vs H₁: μ ≠ μ₀
- Test statistic: T = (X̄ - μ₀)/(S'/√n) ~ t(n-1)
- R function: `t.test(x, mu=μ₀)`

### Two-Sample t-Test (Homogeneity)

Compare means of two populations:
- H₀: μ₁ = μ₂ vs H₁: μ₁ ≠ μ₂
- Equal variances: pooled t-test
- Unequal variances: Welch's t-test
- R function: `t.test(x, y, var.equal=TRUE/FALSE)`

### Test Power

**Power = 1 - β** = P(reject H₀ | H₁ is true)
- β = Type II error (false negative)
- Larger sample → higher power
- Effect size impacts power

## Exercises

### Ex 1: Octopus Weights (One-Sample t-Test)
15 octopuses weighed. Is mean 3000g?
- Calculate CI for mean
- Perform conformity test
- Use both manual and `t.test()` approaches

### Ex 2: Treatment Comparison (Two-Sample t-Test)
Two groups (n=12, n=8) with different treatments.
- Test if means differ
- Assumes equal variances (pooled t-test)
- Examine effect of sample size

### Ex 3: Milk Bottle Filling (Power Analysis)
Known σ = 1ml, target μ = 1000ml, n = 40 bottles.
- Test for calibration drift
- Calculate power for detecting 0.2ml shift
- Determine n needed for 90% power

## R Functions

```r
t.test(x, mu=μ₀, conf.level=0.95)              # One-sample
t.test(x, y, var.equal=TRUE, conf.level=0.95)  # Two-sample
qt(p, df)                                        # t quantile
pt(q, df)                                        # t CDF
pnorm(q, mean, sd)                              # Normal CDF
```

## Test Decision Rules

**Two-tailed test** (H₁: μ ≠ μ₀):
- Reject H₀ if |T| > t_(α/2, df)
- Or if p-value < α

**One-tailed test** (H₁: μ > μ₀):
- Reject H₀ if T > t_(α, df)

## Key Insights
1. p-value > α → fail to reject H₀ (not "accept")
2. Larger n → more power, narrower CI
3. Practical vs statistical significance
4. Equal variance assumption affects test choice
