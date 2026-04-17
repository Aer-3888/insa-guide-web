---
title: "TP5: Random Vectors and Multivariate Distributions"
sidebar_position: 5
---

# TP5: Random Vectors and Multivariate Distributions

## Overview
Introduction to joint probability distributions, marginal and conditional distributions, and multivariate normal distributions.

## Topics Covered
1. **Joint distributions** (discrete and continuous)
2. **Marginal distributions**
3. **Conditional distributions**
4. **Multinomial distribution**
5. **Multivariate normal distribution**

## Key Concepts

### Joint Probability
For discrete random variables X and Y:
- P(X=x, Y=y) = joint probability
- Sum over all (x,y) = 1

### Marginal Probability
Probability of one variable ignoring the other:
- P(X=x) = Σ_y P(X=x, Y=y)
- In R: `apply(matrix, 1, sum)` (rows) or `apply(matrix, 2, sum)` (columns)

### Conditional Probability
P(X=x | Y=y) = P(X=x, Y=y) / P(Y=y)

### Multinomial Distribution
Extension of binomial to k > 2 categories:
- n trials, k outcomes
- Probabilities: (p₁, p₂, ..., p_k) where Σp_i = 1
- R function: `dmultinom(x, prob)`

### R Functions

```r
# Matrix operations
apply(matrix, 1, fun)         # Apply to rows
apply(matrix, 2, fun)         # Apply to columns
margin.table(table, margin)   # Marginal sums

# Multivariate distributions
library(mvtnorm)
dmvnorm(x, mean, sigma)       # Multivariate normal PDF
rmvnorm(n, mean, sigma)       # Generate samples

# Multinomial
dmultinom(x, prob=p)          # Probability
rmultinom(n, size, prob)      # Generate samples

# Visualization
scatterplot3d(x, y, z)        # 3D scatter plot
```

## Exercises

### Ex 1: Discrete Joint Distribution
Given joint probability table for (X, Y):
- Calculate marginal P(X) and P(Y)
- Calculate conditional P(X | Y=5)
- Use `margin.table()` and `conditionTable()`

### Ex 2: Roulette Multinomial Model
12 spins, outcomes: red (18/38), black (18/38), green (2/38)
- Model as Multinomial(12, p)
- Generate all possible outcomes
- Calculate probabilities
- Visualize in 3D

### Ex 3: Bivariate Normal
Explore 2D normal distribution with correlation

## Key Insights
1. Marginal probabilities ignore other variables
2. Conditional probabilities restrict to subset
3. Independence: P(X,Y) = P(X)P(Y)
4. Multinomial generalizes binomial
5. Correlation in multivariate normal
