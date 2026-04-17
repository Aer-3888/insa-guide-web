---
title: "TP2: Law of Large Numbers and Central Limit Theorem"
sidebar_position: 2
---

# TP2: Law of Large Numbers and Central Limit Theorem

## Overview
This lab explores two fundamental theorems in probability theory: the Law of Large Numbers (LLN) and the Central Limit Theorem (CLT). Students analyze real experimental data (Michelson's speed of light measurements) and simulate discrete probability distributions.

## Learning Objectives
- Apply the Law of Large Numbers to real data
- Understand and verify the Central Limit Theorem
- Work with the MASS library dataset
- Use `tapply()` for grouped operations
- Compare theoretical vs empirical distributions
- Simulate binomial processes and their normal approximation

## Key Concepts

### 1. Law of Large Numbers (LLN)
The empirical mean of independent, identically distributed (i.i.d.) random variables converges to the theoretical mean as sample size increases.

**Mathematical Statement**:
For X₁, X₂, ..., Xₙ ~ i.i.d. with E(Xᵢ) = μ:

```
X̄ₙ = (X₁ + X₂ + ... + Xₙ)/n → μ as n → ∞
```

**Practical Interpretation**:
- Small samples: empirical mean varies significantly
- Large samples: empirical mean stabilizes near theoretical mean
- Convergence is NOT monotonic (fluctuates but trend is clear)

### 2. Central Limit Theorem (CLT)
The distribution of sample means approaches a normal distribution as sample size increases, regardless of the original distribution.

**Mathematical Statement**:
For X₁, X₂, ..., Xₙ ~ i.i.d. with E(Xᵢ) = μ and Var(Xᵢ) = σ²:

```
(X̄ₙ - μ)/(σ/√n) → N(0, 1) as n → ∞
```

Or equivalently: X̄ₙ ~ N(μ, σ²/n) approximately

**Practical Interpretation**:
- Sum or average of many random variables → approximately normal
- Works even if original distribution is NOT normal
- Enables normal approximation for large samples

### 3. Key R Functions

#### Data Loading and Summary
```r
library(MASS)           # Load package with datasets
summary(data)           # Summary statistics
head(data)              # First few rows
mean(data$column)       # Column mean
sd(data$column)         # Standard deviation
var(data$column)        # Variance
```

#### Grouped Operations
```r
tapply(values, groups, function)
# Apply function to values grouped by groups
# Example: tapply(speed, experiment, mean)
#   → calculates mean speed for each experiment
```

#### Cumulative Operations
```r
cumsum(x)               # Cumulative sum
cumsum(x) / (1:length(x))  # Cumulative mean
```

#### Random Generation
```r
rbinom(n, size, prob)   # Generate binomial random variables
# n = number of experiments
# size = number of trials per experiment
# prob = success probability
```

## Exercises

### Exercise 1: Michelson's Speed of Light Data

**Context**: In 1879, Albert Michelson measured the speed of light in 5 experiments with 20 measurements each (100 total measurements).

**Tasks**:
1. Load and explore the `michelson` dataset from MASS library
2. Calculate mean and standard deviation
3. Visualize convergence using cumulative mean (Law of Large Numbers)
4. Create histogram with theoretical normal overlay (Central Limit Theorem)
5. Group by experiment and compare distributions

**Key Insights**:
- Empirical mean converges to a stable value
- Distribution of all measurements appears normal
- Averages of grouped measurements (n=20) have smaller variance

### Exercise 2: Multiple Choice Question (MCQ) Simulation

**Scenario**: 
- 10 questions, 4 choices each, only 1 correct
- Student answers randomly
- Pass requires ≥ 6 correct answers

**Probability Model**:
- Single question: Bernoulli(p = 0.25)
- Total correct: X ~ Binomial(n = 10, p = 0.25)
- Pass event: P(X ≥ 6)

**Tasks**:
1. Calculate exact probability: P(X ≥ 6) = 1 - P(X ≤ 5)
2. Simulate 5000 exams using `rbinom()`
3. Verify Law of Large Numbers for pass rate
4. Apply CLT: approximate with normal distribution
5. Compare exact vs approximate probabilities

**Key Insights**:
- Exact calculation: use `pbinom()` for binomial CDF
- For discrete → continuous approximation, consider continuity correction
- CLT approximation quality depends on n and p
- When np < 5 or n(1-p) < 5, normal approximation may be poor

## Theoretical Background

### When to Use Normal Approximation

**Binomial → Normal Approximation**:
- X ~ Binomial(n, p)
- Approximate with: X ~ N(μ = np, σ² = np(1-p))
- Rule of thumb: works well when np ≥ 5 AND n(1-p) ≥ 5

**For Sample Proportions**:
- p̂ = X/n (sample proportion)
- p̂ ~ N(p, p(1-p)/n) approximately

**Standard Error**:
```
SE(X̄) = σ/√n
```

### Continuity Correction
When approximating discrete with continuous distribution:
- P(X = k) → P(k - 0.5 < X < k + 0.5)
- P(X ≥ k) → P(X > k - 0.5)
- P(X ≤ k) → P(X < k + 0.5)

## R Functions Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `library(package)` | Load package | `library(MASS)` |
| `tapply(X, INDEX, FUN)` | Apply function by group | `tapply(speed, exp, mean)` |
| `cumsum(x)` | Cumulative sum | `cumsum(c(1,2,3))` → [1,3,6] |
| `rbinom(n, size, prob)` | Binomial random samples | `rbinom(100, 10, 0.25)` |
| `pbinom(q, size, prob)` | Binomial CDF P(X ≤ q) | `pbinom(5, 10, 0.25)` |
| `dbinom(x, size, prob)` | Binomial PMF P(X = x) | `dbinom(6, 10, 0.25)` |
| `pnorm(q, mean, sd)` | Normal CDF P(X ≤ q) | `pnorm(0.6, 0.25, 0.137)` |
| `dnorm(x, mean, sd)` | Normal PDF f(x) | `dnorm(0.5, 0.25, 0.137)` |

## Tips and Common Pitfalls

1. **tapply() syntax**: `tapply(DATA, GROUPING_VARIABLE, FUNCTION)`
2. **Cumulative mean**: Use `cumsum(x) / (1:length(x))` not `cumsum(x) / length(x)`
3. **Probability notation**: 
   - P(X ≤ k): use `pbinom(k, ...)`
   - P(X ≥ k): use `1 - pbinom(k-1, ...)` or `pbinom(k-1, ..., lower.tail=FALSE)`
4. **Histogram density**: Use `freq=FALSE` to plot density (required for overlay with theoretical curves)
5. **CLT limitations**: Normal approximation can be poor for extreme probabilities or small n

## Extensions and Further Practice

1. Test different success probabilities (p = 0.1, 0.3, 0.5)
2. Vary sample sizes to see CLT convergence rate
3. Compare different distributions (Poisson, exponential) and verify CLT
4. Implement continuity correction and compare results
5. Calculate approximation error for different parameter values

## Resources

- `help(tapply)` - Grouped operations
- `help(Distributions)` - List of all probability distributions
- MASS package documentation: `help(package="MASS")`
