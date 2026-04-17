---
title: "TP1: Introduction to R and Probability Distributions"
sidebar_position: 1
---

# TP1: Introduction to R and Probability Distributions

## Overview
This lab introduces fundamental R programming concepts and basic probability distribution functions. Students learn data manipulation, type conversion, and how to work with common probability distributions.

## Learning Objectives
- Master R basic syntax and data structures
- Understand type conversion and string manipulation
- Work with vectors and data frames
- Apply probability distribution functions (d*, p*, q*, r*)
- Visualize exponential distributions
- Simulate random processes

## Key Concepts

### 1. Type Conversion and String Manipulation
- **Type Conversion**: Use `as.integer()`, `as.numeric()`, etc. to convert between types
- **Type Checking**: Use `is.integer()`, `is.numeric()` to verify types
- **String Operations**: `paste()` for concatenation, `nchar()` for string length

### 2. Special Values
- `Inf`: Result of division by zero (e.g., `3/0`)
- `NA`: Not Assigned/Not Available - missing values

### 3. Vectors
Four main ways to create vectors:
- `c()`: Combine elements explicitly
- `seq(from, to, by)`: Generate sequences with step
- `start:end`: Generate integer sequences (inclusive bounds)
- `rep(values, times)`: Repeat values

**Important**: R loops use inclusive bounds: `for(i in 1:10)` includes both 1 and 10.

### 4. Data Frames
Essential structure for statistical analysis:
- Create with `data.frame(column1=vector1, column2=vector2, ...)`
- Access columns: `df$columnName` or `df[,"columnName"]`
- Get column names: `names(df)`
- Export: `write.table(df, "file.csv", sep=";", row.names=FALSE, col.names=FALSE)`

### 5. Probability Distribution Functions

R uses a consistent naming scheme for distributions:

| Prefix | Function | Description |
|--------|----------|-------------|
| `d*` | Density | Probability density/mass function |
| `p*` | Probability | Cumulative distribution function (CDF) |
| `q*` | Quantile | Inverse CDF (percentiles) |
| `r*` | Random | Generate random samples |

**Common distributions**:
- `norm`: Normal distribution
- `binom`: Binomial distribution
- `unif`: Uniform distribution
- `exp`: Exponential distribution
- `pois`: Poisson distribution
- `geom`: Geometric distribution
- `t`: Student's t-distribution
- `chisq`: Chi-squared distribution
- `f`: F distribution

**Example**: For normal distribution N(μ, σ):
```r noexec
dnorm(x, mean=μ, sd=σ)  # Density at x
pnorm(x, mean=μ, sd=σ)  # P(X ≤ x)
qnorm(p, mean=μ, sd=σ)  # Value x where P(X ≤ x) = p
rnorm(n, mean=μ, sd=σ)  # Generate n random samples
```

## Exercises

### Exercise 1: Exponential Distribution Simulation

**Theory**: Exponential distribution with parameter λ:
- Mean: 1/λ
- Standard deviation: 1/λ
- PDF: f(x) = λe^(-λx) for x ≥ 0

**Task**: Visualize exponential curves for λ = 0.5, 1, 2 and simulate samples.

**Key Functions**:
- `curve()`: Plot mathematical functions
- `rexp(n, rate=λ)`: Generate exponential random samples
- `hist()`: Create histograms
- `legend()`: Add plot legends

### Exercise 2: Urn Problem

**Scenario**: An urn contains p red balls and q black balls. Draw k balls without replacement.

**Key Concepts**:
- `rep(value, times)`: Repeat elements to create urn
- `sample(x, size, replace=FALSE)`: Random sampling
- `table()`: Count occurrences
- `barplot()`: Visualize frequencies

### Exercise 3: Dice Frequency

**Theory**: Law of Large Numbers - as sample size increases, empirical frequency converges to theoretical probability.

**Task**: Simulate dice rolls and observe convergence of frequency to 1/6.

## R Functions Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `help(function)` | Get documentation | `help(curve)` |
| `curve(expr, from, to, add)` | Plot function | `curve(exp(x), 0, 5)` |
| `hist(x, freq, breaks)` | Histogram | `hist(data, freq=FALSE)` |
| `plot(x, y, type, xlim, ylim)` | Generic plotting | `plot(x, y, type="l")` |
| `legend(position, legend, col)` | Add legend | `legend("topright", ...)` |
| `sample(x, size, replace)` | Random sampling | `sample(1:6, 100, TRUE)` |
| `table(x)` | Frequency table | `table(rolls)` |
| `barplot(height, names.arg)` | Bar plot | `barplot(counts)` |

## Tips and Common Pitfalls

1. **Loop Bounds**: Remember R loops are inclusive on both ends
2. **Data Frames vs Vectors**: Use `$` for columns, `[]` for rows
3. **Density vs Frequency**: Set `freq=FALSE` in `hist()` to plot density
4. **Adding to Plots**: Use `add=TRUE` in `curve()` to overlay on existing plot
5. **Working Directory**: Use `setwd()` or check current directory with `getwd()`

## Further Practice

1. Try different distributions (binomial, Poisson, uniform)
2. Compare theoretical vs empirical distributions with increasing sample sizes
3. Explore the Central Limit Theorem by summing random variables
4. Create custom functions for repeated tasks

## Resources

- R Documentation: `help(function_name)` or `?function_name`
- Distribution parameters: Check each distribution's help page
- Visualization: Experiment with `col`, `lwd`, `lty` parameters for better plots
