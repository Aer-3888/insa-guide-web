---
title: "Exam Preparation -- Probabilites"
sidebar_position: 0
---

# Exam Preparation -- Probabilites

## Exam Format

- **Duration**: 2 hours
- **Type**: Written (DS -- Devoir Surveille)
- **Material allowed**: None (no formula sheets, no calculators unless specified)
- **Structure**: 3-4 exercises, typically 20 points total
- **Language**: French

## Exam Structure (Based on 2021-2026 Past Exams)

The exam consistently follows this pattern:

| Exercise | Topic | Points | Frequency |
|---|---|---|---|
| 1 | **Confidence Intervals** | 4-5 pts | Every year |
| 2 | **Hypothesis Testing** (conformity or homogeneity) | 5-6 pts | Every year |
| 3 | **Distribution Problem** (power analysis, multinomial, or specific distribution) | 5-6 pts | Every year |
| 4 | **Random Vectors** / Joint distributions | 4-5 pts | Most years |

## Topic Frequency Analysis (2022-2026)

| Topic | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| Point estimation (mean, variance) | x | x | x | x | x |
| CI for mean ($\sigma$ unknown, Student) | x | x | x | x | x |
| CI for variance (Chi-squared) | x | | x | | |
| Conformity test (one-sample) | x | | | | |
| Homogeneity test (two-sample) | x | x | x | | |
| p-value computation | x | x | x | | |
| Power analysis | | x | | | |
| Multinomial distribution | | | x | | |
| Proportion CI | | | x | | |
| R code writing | x | x | x | x | x |
| Random vectors / covariance matrix | | | x | | |

## Exam Strategy

### Time Management

| Phase | Time | What to do |
|---|---|---|
| Read-through | 5 min | Read all exercises, identify easy wins |
| Exercise 1 (CI) | 25 min | Usually straightforward formulas |
| Exercise 2 (Test) | 30 min | Most detailed; methodical approach |
| Exercise 3 (Distribution) | 25 min | Often requires R code |
| Exercise 4 (Vectors) | 25 min | Theory-heavy |
| Review | 10 min | Check calculations, sign of statistics |

### Key Skills Required

1. **Compute from raw data**: Given $\sum x_i$ and $\sum x_i^2$, recover $\bar{x}$, $S^2$, $S'^2$
2. **Write R code**: `mean()`, `sd()`, `qt()`, `qnorm()`, `qchisq()`, `t.test()`
3. **Identify the correct test/CI**: See the decision flowchart below
4. **Show formulas with numeric values**: Professors want to see you substitute numbers, even if you cannot compute the final value (quantile values from tables or R)

### Critical Formulas to Memorize

These appear in **every exam**:

$$\bar{X} = \frac{1}{n}\sum X_i \qquad S'^2 = \frac{1}{n-1}\sum(X_i - \bar{X})^2$$

$$\text{CI for } \mu \text{ (}\sigma\text{ unknown)}: \bar{X} \pm t_{n-1}(1-\alpha/2)\frac{S'}{\sqrt{n}}$$

$$\text{CI for } \sigma^2: \left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$$

---

## Decision Flowchart: Which Test/CI?

```
What are you asked to do?
|
+-- ESTIMATE a parameter (Confidence Interval)
|   |
|   +-- Mean?
|   |   +-- sigma known? --> Z = (Xbar-mu)/(sigma/sqrt(n)), use qnorm()
|   |   +-- sigma unknown? --> T = (Xbar-mu)/(S'/sqrt(n)), use qt(df=n-1)
|   |
|   +-- Variance?
|   |   +-- (n-1)S'^2/sigma^2 ~ chi^2(n-1), use qchisq(df=n-1)
|   |
|   +-- Proportion?
|       +-- Large n? --> Normal approx, use qnorm()
|
+-- TEST a hypothesis
    |
    +-- One population vs reference value (CONFORMITY)
    |   +-- sigma known? --> Z ~ N(0,1)
    |   +-- sigma unknown? --> T ~ t(n-1)
    |
    +-- Two populations (HOMOGENEITY)
        +-- sigma1=sigma2 known? --> Z ~ N(0,1)
        +-- sigma1=sigma2 unknown? --> pooled T ~ t(n1+n2-2)
        +-- sigma1!=sigma2 unknown? --> Welch T ~ t(nu)
```

## Common Exam Traps

1. **Biased vs unbiased variance**: $S^2$ (divide by $n$) is biased. $S'^2$ (divide by $n-1$) is unbiased. R uses $n-1$. Always use $S'^2$ for CI and tests.

2. **Chi-squared CI bounds are inverted**: Lower bound of $\sigma^2$ CI uses the UPPER chi-squared quantile.

3. **Student vs Normal**: Only use $\mathcal{N}(0,1)$ when $\sigma$ is explicitly KNOWN. If estimated from data, use Student's $t$.

4. **Notation $\mathcal{N}(\mu, \sigma)$ vs $\mathcal{N}(\mu, \sigma^2)$**: This course uses $\sigma$ (std dev), consistent with R. Some problems give variance directly -- take the square root.

5. **R's `sd()` returns $S'$**: It divides by $n-1$, not $n$. Do not "correct" it again.

6. **Forgetting $\sqrt{n}$**: The standard error is $\sigma/\sqrt{n}$, not $\sigma$.

7. **Two-tailed vs one-tailed**: Default is two-tailed ($H_1: \mu \neq \mu_0$). For one-tailed, adjust the quantile and p-value.

8. **Writing the conclusion**: Always state "Reject $H_0$" or "Fail to reject $H_0$" with the interpretation in context.

## Past Exam Walkthrough References

- See [formula-sheet.md](/S5/Probabilites/exam-prep/formula-sheet) for the complete formula reference
- See [distribution-recognition.md](/S5/Probabilites/exam-prep/distribution-recognition) for quick distribution identification
