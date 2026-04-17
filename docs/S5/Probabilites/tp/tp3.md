---
title: "TP3: Confidence Intervals"
sidebar_position: 3
---

# TP3: Confidence Intervals

## Overview
This lab covers confidence interval construction for means and variances using real-world data. Students learn to work with normal, Student's t, and Chi-squared distributions.

## Learning Objectives
- Calculate confidence intervals for population mean (σ known and unknown)
- Calculate confidence intervals for population variance
- Work with quantiles and critical values
- Apply Student's t-distribution
- Use Chi-squared distribution for variance inference
- Validate theoretical intervals with simulations

## Key Concepts

### 1. Confidence Interval for Mean (σ² Known)

When population variance σ² is known, use standard normal distribution:

**Formula**: X̄ ± z_(α/2) × (σ/√n)

Where:
- X̄ = sample mean
- z_(α/2) = quantile of N(0,1), e.g., qnorm(1-α/2)
- σ = known population standard deviation
- n = sample size
- α = significance level (e.g., 0.05 for 95% CI)

### 2. Confidence Interval for Mean (σ² Unknown)

When population variance is unknown, use Student's t-distribution:

**Formula**: X̄ ± t_(n-1, α/2) × (S'/√n)

Where:
- S' = sample standard deviation (unbiased estimator)
- t_(n-1, α/2) = quantile of t-distribution with n-1 degrees of freedom
- Use `qt(1-α/2, df=n-1)` in R

### 3. Confidence Interval for Variance

Based on Chi-squared distribution:

**Formula**: [(n-1)S'² / χ²_(n-1, α/2), (n-1)S'² / χ²_(n-1, 1-α/2)]

Where:
- (n-1)S'²/σ² ~ χ²_(n-1)
- χ²_(n-1, α/2) = `qchisq(1-α/2, df=n-1)`
- χ²_(n-1, 1-α/2) = `qchisq(α/2, df=n-1)`

Note: Lower bound uses upper quantile, upper bound uses lower quantile (inverted)

### 4. Key Distributions

| Distribution | Use Case | R Functions |
|--------------|----------|-------------|
| N(0, 1) | Mean CI, σ known | `qnorm()`, `pnorm()` |
| t(df) | Mean CI, σ unknown | `qt()`, `pt()` |
| χ²(df) | Variance CI | `qchisq()`, `pchisq()` |

## Exercises

### Exercise 1: Airline Overbooking (Quantiles)

Calculate how many tickets to sell while managing risk:
- Binomial distribution for passenger show-ups
- Use quantiles to find capacity limits
- Balance revenue vs refund costs

### Exercise 2: Software Execution Time (Mean CI, σ Known)

Dataset: `vitesse.csv` - 1000 weeks × 6 daily measurements
- Known: μ = 120s, σ² = 100
- Calculate weekly mean CIs
- Verify coverage rate (should be ~95% for α=0.05)

### Exercise 3: Variance Estimation (Chi-squared)

- Calculate variance for each week
- Build CI for variance using χ² distribution
- Compare with known variance (σ² = 100)

### Exercise 4: Student's t-distribution Application

When σ is estimated from data (not given), use t instead of normal.

## R Functions Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `qnorm(p, mean, sd)` | Normal quantile | `qnorm(0.975, 0, 1)` → 1.96 |
| `qt(p, df)` | t quantile | `qt(0.975, df=5)` → 2.571 |
| `qchisq(p, df)` | Chi-squared quantile | `qchisq(0.975, df=5)` → 12.83 |
| `qbinom(p, size, prob)` | Binomial quantile | `qbinom(0.95, 150, 0.75)` |
| `pbinom(q, size, prob)` | Binomial CDF | `pbinom(120, 150, 0.75)` |
| `tapply(X, INDEX, FUN)` | Group apply | `tapply(time, week, mean)` |
| `read.table()` / `read.csv2()` | Load data | `read.csv2("data.csv")` |

## Interpretation Guidelines

### Coverage Rate
For 95% confidence intervals:
- Theoretical: 95% of intervals contain true parameter
- Empirical check: ~95% of computed intervals should contain known value
- Small deviations expected due to sampling variability

### Interval Width
- Larger n → narrower intervals → more precision
- Higher confidence level → wider intervals
- Variance CI wider than mean CI (more variable)

### When to Use Which Distribution

```
Confidence Interval for Mean:
├── σ known? → Use Normal N(0,1)
└── σ unknown? → Use Student t(n-1)

Confidence Interval for Variance:
└── Always use Chi-squared χ²(n-1)
```

## Common Pitfalls

1. **Chi-squared bounds**: Upper CI bound uses LOWER quantile (inverted)
2. **Degrees of freedom**: n-1, not n
3. **Standard error**: σ/√n for mean, not just σ
4. **Unbiased estimator**: R's `var()` and `sd()` use n-1 denominator
5. **CSV delimiters**: Use `read.csv2()` for semicolon-separated files

## Key Insights

1. Confidence intervals quantify estimation uncertainty
2. Width decreases with √n (diminishing returns)
3. t-distribution accounts for estimating σ from data
4. Variance intervals are asymmetric (Chi-squared is skewed)
5. Coverage rate validates theoretical calculations

## Extensions

- Compare different confidence levels (90%, 95%, 99%)
- Bootstrap confidence intervals (non-parametric)
- One-sided vs two-sided intervals
- Prediction intervals vs confidence intervals
