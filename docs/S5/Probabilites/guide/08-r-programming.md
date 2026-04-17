---
title: "Chapter 8: R Programming for Statistics"
sidebar_position: 8
---

# Chapter 8: R Programming for Statistics

## 8.1 R Fundamentals

### Data Types and Conversion

```r
txt <- "33"
nbr <- as.integer(txt)       # String to integer
is.numeric(nbr)              # TRUE
is.integer(nbr)              # TRUE
```

### Special Values

| Value | Meaning | Example |
|---|---|---|
| `Inf` | Infinity | `3/0` |
| `-Inf` | Negative infinity | `-3/0` |
| `NA` | Missing / Not Available | Operations with NA return NA |
| `NaN` | Not a Number | `0/0` |

### String Operations

```r
paste("une", "petite", "phrase")     # "une petite phrase"
paste0("a", "b")                     # "ab" (no space)
nchar("hello")                       # 5
sprintf("n = %d, mean = %.3f", 10, 3.14)  # Formatted string
```

### Variables

```r
x <- 5               # Assignment (preferred)
x = 5                # Also works
rm(x)                # Remove variable
ls()                 # List all variables
```

---

## 8.2 Vectors

### Creation

```r
c(1, 3, 5, 7, 9)            # Explicit: c() combines elements
seq(0, 10, by=2)             # Sequence: 0, 2, 4, 6, 8, 10
0:10                         # Range: 0, 1, 2, ..., 10 (inclusive!)
rep(1:2, 5)                  # Repeat: 1, 2, 1, 2, 1, 2, 1, 2, 1, 2
```

**IMPORTANT**: R uses 1-based indexing, and ranges are inclusive on both ends. `1:10` includes both 1 and 10.

### Operations (Vectorized)

```r
x <- c(1, 2, 3)
x + 1                # c(2, 3, 4)      -- scalar broadcast
x * 2                # c(2, 4, 6)
x + c(10, 20, 30)    # c(11, 22, 33)   -- element-wise
sum(x)               # 6
cumsum(x)            # c(1, 3, 6)      -- cumulative sum
mean(x)              # 2
sd(x)                # 1 (corrected, divides by n-1)
var(x)               # 1 (corrected, divides by n-1)
length(x)            # 3
```

**Avoid loops when possible** -- use vectorized operations for speed and clarity.

---

## 8.3 Data Frames

```r
# Create
df <- data.frame(name=c("A","B","C"), height=c(175,182,165), age=c(19,18,21))

# Access
df$name              # Column by name
df[1, ]              # First row
df[, "height"]       # Column by string name
df[df$age > 19, ]    # Filter rows

# Info
names(df)            # Column names
str(df)              # Structure
summary(df)          # Summary statistics
nrow(df)             # Number of rows

# Export
write.table(df, "output.csv", sep=";", row.names=FALSE)

# Import
data <- read.csv2("data.csv")           # Semicolon separator
data <- read.table("data.txt", header=TRUE, sep="\t")
```

---

## 8.4 Apply Family (Avoid Loops!)

```r
# apply: for matrices
apply(matrix, 1, fun)       # Apply to each row
apply(matrix, 2, fun)       # Apply to each column

# tapply: grouped operations (THE most useful)
tapply(values, groups, function)
# Example: mean speed per experiment
tapply(data$Speed, data$Expt, mean)

# sapply/lapply: for lists/vectors
sapply(1:5, function(x) x^2)   # Returns vector: 1, 4, 9, 16, 25

# replicate: repeat an expression
replicate(1000, mean(rnorm(20)))  # 1000 sample means of size 20
```

---

## 8.5 Probability Distribution Functions

R uses a **consistent naming scheme**: `[d|p|q|r]distribution_name`.

| Prefix | Function Type | Returns | Example |
|---|---|---|---|
| `d` | Density/Mass (PDF/PMF) | $f(x)$ or $P(X=x)$ | `dnorm(0, 0, 1)` |
| `p` | CDF | $P(X \leq x)$ | `pnorm(1.96, 0, 1)` |
| `q` | Quantile (inverse CDF) | $x$ such that $P(X \leq x) = p$ | `qnorm(0.975, 0, 1)` |
| `r` | Random generation | Sample of size $n$ | `rnorm(100, 0, 1)` |

### Complete Distribution Reference

| Distribution | R name | Parameters |
|---|---|---|
| Normal | `norm` | `mean`, `sd` |
| Binomial | `binom` | `size` (n), `prob` (p) |
| Poisson | `pois` | `lambda` |
| Exponential | `exp` | `rate` ($\lambda$) |
| Uniform | `unif` | `min`, `max` |
| Geometric | `geom` | `prob` |
| Student t | `t` | `df` |
| Chi-squared | `chisq` | `df` |
| F | `f` | `df1`, `df2` |
| Hypergeometric | `hyper` | `m` (success), `n` (failure), `k` (draws) |
| Multinomial | `multinom` | `prob` vector |

### Common Usage Patterns

```r
# P(X <= 5) for X ~ Binomial(10, 0.25)
pbinom(5, size=10, prob=0.25)

# P(X >= 6) = 1 - P(X <= 5)
1 - pbinom(5, size=10, prob=0.25)

# 95th percentile of N(0,1)
qnorm(0.95)                           # 1.645 (one-sided)
qnorm(0.975)                          # 1.960 (two-sided, alpha=0.05)

# Generate 1000 exponential samples with lambda=2
rexp(1000, rate=2)

# Multinomial probability
dmultinom(c(5, 5, 2), prob=c(18/38, 18/38, 2/38))
```

---

## 8.6 Plotting

### Basic Plots

```r
# Scatter plot
plot(x, y, type="p", col="blue", pch=19, main="Title", xlab="X", ylab="Y")

# Line plot
plot(x, y, type="l", lwd=2, col="red")

# Both points and lines
plot(x, y, type="b")

# Function curve
curve(dnorm(x, 0, 1), from=-4, to=4, col="blue", lwd=2)
curve(dt(x, df=5), add=TRUE, col="red", lwd=2, lty=2)  # Overlay

# Histogram
hist(data, freq=FALSE, breaks=30, col="lightblue", border="white",
     main="Title", xlab="Value", ylab="Density")

# Bar plot
barplot(counts, names.arg=labels, col="steelblue")
```

### Customization

```r
# Legend
legend("topright", legend=c("Normal", "Student"), col=c("blue","red"),
       lwd=2, lty=c(1,2))

# Grid
grid()

# Reference lines
abline(h=0, col="gray", lty=2)       # Horizontal
abline(v=1.96, col="red", lty=3)     # Vertical

# Multiple plots
par(mfrow=c(2,2))                     # 2x2 grid
# ... four plots ...
par(mfrow=c(1,1))                     # Reset

# Segments
segments(x0, y0, x1, y1, col="blue", lwd=2)
```

---

## 8.7 Statistical Testing

```r
# One-sample t-test
t.test(x, mu=100, conf.level=0.95)

# Two-sample t-test
t.test(x, y, var.equal=TRUE)           # Pooled (equal variances)
t.test(x, y, var.equal=FALSE)          # Welch (unequal variances)

# z-test (sigma known)
library(TeachingDemos)
z.test(x, mu=100, stdev=10)

# Shapiro-Wilk normality test
shapiro.test(x)

# Kolmogorov-Smirnov test
ks.test(x, "pnorm", mean(x), sd(x))

# Accessing test results
result <- t.test(x, mu=100)
result$statistic                       # Test statistic
result$p.value                         # p-value
result$conf.int                        # Confidence interval
result$estimate                        # Estimated parameter
```

---

## 8.8 Sampling and Simulation

```r
set.seed(42)                           # Reproducibility

# Random sampling
sample(1:6, 10, replace=TRUE)          # Roll die 10 times
sample(c("R","N"), 5, replace=FALSE)   # Draw 5 balls without replacement

# Simulation pattern: repeat experiment many times
n_sim <- 10000
results <- replicate(n_sim, {
  data <- rnorm(20, mean=100, sd=15)
  mean(data)
})
hist(results, freq=FALSE)              # Distribution of sample means

# Multinomial simulation
rmultinom(1000, size=12, prob=c(18/38, 18/38, 2/38))
```

---

## 8.9 Key Pitfalls

| Pitfall | Correct Approach |
|---------|------------------|
| R divides by $n-1$ in `var()`/`sd()` | This is the unbiased estimator $S'^2$; if you need $S^2$, multiply by $(n-1)/n$ |
| `read.csv()` uses comma separator | Use `read.csv2()` for semicolons (European format) |
| `hist()` shows counts by default | Use `freq=FALSE` for density (required when overlaying theoretical curves) |
| Forgetting `add=TRUE` in `curve()` | Without it, a new plot is created instead of overlaying |
| `pnorm(x)` gives $P(X \leq x)$ | For $P(X > x)$, use `1 - pnorm(x)` or `pnorm(x, lower.tail=FALSE)` |
| `sample()` defaults to `replace=FALSE` | Specify `replace=TRUE` for sampling with replacement |

---

## CHEAT SHEET -- R Functions

| Task | Function |
|------|----------|
| Sample mean | `mean(x)` |
| Corrected SD | `sd(x)` ($S'$, divides by $n-1$) |
| Corrected variance | `var(x)` ($S'^2$, divides by $n-1$) |
| Cumulative sum | `cumsum(x)` |
| Cumulative mean | `cumsum(x) / (1:length(x))` |
| Grouped operation | `tapply(values, groups, function)` |
| Normal quantile | `qnorm(p, mean, sd)` |
| Student quantile | `qt(p, df)` |
| Chi-sq quantile | `qchisq(p, df)` |
| One-sample t-test | `t.test(x, mu=m0)` |
| Two-sample t-test | `t.test(x, y, var.equal=T/F)` |
| Normality test | `shapiro.test(x)` |
| Reproducibility | `set.seed(n)` |
