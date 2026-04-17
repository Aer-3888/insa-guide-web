---
title: "Distribution Recognition Guide"
sidebar_position: 2
---

# Distribution Recognition Guide

> During the exam you must quickly identify which distribution applies to a problem. This guide provides pattern-matching rules.

---

## Quick Recognition Table

| If the problem says... | Distribution | Parameters |
|---|---|---|
| "Success/failure", "yes/no", single trial | Bernoulli $\mathcal{B}(p)$ | $p$ = success prob |
| "$n$ independent trials, count successes" | Binomial $\mathcal{B}(n,p)$ | $n$ trials, $p$ success prob |
| "$k$ events in time/space with avg rate $\lambda$" | Poisson $\mathcal{P}(\lambda)$ | $\lambda$ = mean count |
| "Number of trials until first success" | Geometric $\mathcal{G}(p)$ | $p$ = success prob |
| "Draw without replacement from finite population" | Hypergeometric | $N$ total, $K$ success, $n$ draws |
| "All values equally likely in $[a,b]$" | Uniform $\mathcal{U}(a,b)$ | $a$ min, $b$ max |
| "Waiting time, lifetime, time between events" | Exponential $\mathcal{E}(\lambda)$ | $\lambda$ = rate |
| "Bell-shaped", "approximately normal", CLT | Normal $\mathcal{N}(\mu,\sigma)$ | $\mu$ mean, $\sigma$ std dev |
| "$n$ trials, $k$ categories, count per category" | Multinomial | $n$ trials, $p_1,\ldots,p_k$ |
| "Sum of squared normals" | Chi-squared $\chi^2_k$ | $k$ degrees of freedom |
| "Ratio: normal / sqrt(chi-sq/df)" | Student $t_k$ | $k$ degrees of freedom |

---

## When to Use Which Inference Distribution

### For Confidence Intervals and Tests

```
Estimating MEAN:
  +-- sigma KNOWN --> N(0,1): use qnorm()
  +-- sigma UNKNOWN --> t(n-1): use qt()

Estimating VARIANCE:
  +-- Always chi^2(n-1): use qchisq()

Estimating PROPORTION:
  +-- Large n (np>=5, n(1-p)>=5) --> N(0,1): use qnorm()
  +-- Small n --> Exact binomial: use qbinom()
```

### For Approximations

```
Binomial --> Normal:
  When np >= 5 AND n(1-p) >= 5
  B(n,p) ~ N(np, sqrt(np(1-p)))

Binomial --> Poisson:
  When n large AND p small
  B(n,p) ~ P(np)

Student --> Normal:
  When df >= 30
  t(df) ~ N(0,1)
```

---

## Exam Problem Pattern Recognition

### Pattern 1: "Given raw data, find CI for mean"

**Approach**:
1. Compute $\bar{x}$ and $s'^2$ (or $s'$)
2. Is $\sigma$ given? (usually NO in exam)
3. Use Student's $t_{n-1}$
4. $\mu \in [\bar{x} \pm t_{n-1}(1-\alpha/2) \cdot s'/\sqrt{n}]$

**R code**:
```r
xbar <- mean(data)
s_prime <- sd(data)
n <- length(data)
t_crit <- qt(1-alpha/2, df=n-1)
IC <- c(xbar - t_crit*s_prime/sqrt(n), xbar + t_crit*s_prime/sqrt(n))
```

### Pattern 2: "Given summary statistics ($\sum x_i$, $\sum x_i^2$), find CI"

**Approach**:
1. $\bar{x} = \sum x_i / n$
2. $s'^2 = \frac{1}{n-1}(\sum x_i^2 - n\bar{x}^2)$
3. Continue as Pattern 1

**Example** (from 2022 exam): $n=25$, $\sum x_i = 30000$, $\sum x_i^2 = 36.96 \times 10^6$

$$\bar{x} = 30000/25 = 1200$$
$$s'^2 = \frac{1}{24}(36960000 - 25 \times 1200^2) = \frac{1}{24}(36960000 - 36000000) = 40000$$
$$s' = 200$$

### Pattern 3: "Compare two groups"

**Approach**:
1. Identify: homogeneity test ($H_0: \mu_1 = \mu_2$)
2. Are variances known? Equal? Different?
3. Select appropriate test (see Ch.6)
4. Compute $D = \bar{x}_1 - \bar{x}_2$ and $\hat{\sigma}_D$
5. Compare $T = D/\hat{\sigma}_D$ to critical value

### Pattern 4: "Is this value consistent with the data?"

**Approach**:
1. Identify: conformity test ($H_0: \mu = \mu_0$)
2. Check if $\mu_0$ falls in the CI from Pattern 1
3. OR compute test statistic and compare to critical region

### Pattern 5: "Multinomial/voting/categories"

**Approach**:
1. Identify variable as multinomial
2. Use `dmultinom()` for specific probabilities
3. For proportions, may need normal approximation for CI

### Pattern 6: "Find the variance of a linear combination"

**Approach**:
1. Write $Y = \mathbf{a}^T\mathbf{X}$
2. $Var(Y) = \mathbf{a}^T\boldsymbol{\Sigma}\mathbf{a}$
3. Expand: $Var(\sum a_i X_i) = \sum a_i^2 Var(X_i) + 2\sum_{i<j} a_i a_j Cov(X_i, X_j)$

---

## Numerical Values to Know

| Quantile | Value | Use |
|---|---|---|
| $u_{0.975}$ | 1.960 | 95% CI, $\sigma$ known |
| $u_{0.995}$ | 2.576 | 99% CI, $\sigma$ known |
| $u_{0.95}$ | 1.645 | 90% CI or one-sided 95% |
| $t_3(0.975)$ | 3.182 | $n=4$, $\sigma$ unknown |
| $t_5(0.975)$ | 2.571 | $n=6$, $\sigma$ unknown |
| $t_9(0.975)$ | 2.262 | $n=10$, $\sigma$ unknown |
| $t_{23}(0.975)$ | 2.069 | $n=24$, $\sigma$ unknown |

---

## Computation Tricks

### Recovering Variance from Sums

$$S'^2 = \frac{1}{n-1}\left(\sum x_i^2 - \frac{(\sum x_i)^2}{n}\right)$$

### Quick Mental Estimates

- $\sqrt{2} \approx 1.414$
- $\sqrt{3} \approx 1.732$
- $\sqrt{5} \approx 2.236$
- $\sqrt{10} \approx 3.162$
- $\sqrt{20} \approx 4.472$

### Checking Your Answer

- CI should contain the point estimate ($\bar{x}$ should be in the middle for mean CI)
- Variance CI bounds should both be positive
- t-statistic should be negative if $\bar{x} < \mu_0$, positive if $\bar{x} > \mu_0$
- p-value should be between 0 and 1
- If p-value $< \alpha$, then $\mu_0$ should NOT be in the CI (and vice versa)
