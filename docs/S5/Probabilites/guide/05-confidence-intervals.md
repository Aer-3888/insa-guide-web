---
title: "Chapter 5: Confidence Intervals"
sidebar_position: 5
---

# Chapter 5: Confidence Intervals

## 5.1 Intuition

A confidence interval (CI) replaces a single-point estimate with a range that has a known probability of containing the true parameter value.

**Example**: Instead of saying "the mean response time is 207.5ms", we say "we are 95% confident the mean response time is between 181ms and 234ms."

### Definition

A **confidence interval at level $1 - \alpha$** for parameter $\theta$ is an interval $[a, b]$ computed from the data such that:

$$P(\theta \in [a, b]) = 1 - \alpha$$

where $\alpha$ is the **significance level** (error risk). Common values: $\alpha = 0.05$ (95% CI), $\alpha = 0.10$ (90% CI), $\alpha = 0.01$ (99% CI).

### Types of Intervals

| Type | Formula | Use case |
|------|---------|----------|
| Bilateral (two-sided) | $[a, b]$ | Most common; symmetric around estimate |
| Left one-sided | $[a, +\infty[$ | Guarantee a minimum value |
| Right one-sided | $]-\infty, b]$ | Guarantee a maximum value |

---

## 5.2 Quantiles

A **quantile of order $p$** is the value $q$ such that $P(X < q) = p$.

In R:
- `qnorm(p, mean, sd)` -- Normal quantile
- `qt(p, df)` -- Student's t quantile
- `qchisq(p, df)` -- Chi-squared quantile
- `qbinom(p, size, prob)` -- Binomial quantile

**Example**: For $Z \sim \mathcal{N}(0,1)$ at 95% CI:
- $u_{0.025} = \text{qnorm}(0.025) \approx -1.96$
- $u_{0.975} = \text{qnorm}(0.975) \approx 1.96$
- So: $P(-1.96 < Z < 1.96) = 0.95$

---

## 5.3 Useful Distributions for Inference

### Chi-Squared Distribution $\chi^2_k$

The sum of squares of $k$ independent standard normal variables:

$$\text{If } X_i \sim \mathcal{N}(0,1) \text{ iid, then } \sum_{i=1}^k X_i^2 \sim \chi^2_k$$

| | Value |
|---|---|
| $E[\chi^2_k]$ | $k$ |
| $Var(\chi^2_k)$ | $2k$ |
| Shape | Asymmetric (right-skewed), becomes more symmetric as $k$ increases |

**R**: `dchisq(x, df)`, `pchisq(x, df)`, `qchisq(p, df)`, `rchisq(n, df)`

### Student's t-Distribution $t_k$

The ratio of a standard normal to the square root of a chi-squared divided by its degrees of freedom:

$$\text{If } Z \sim \mathcal{N}(0,1), U \sim \chi^2_k, \text{ independent, then } T = \frac{Z}{\sqrt{U/k}} \sim t_k$$

| | Value |
|---|---|
| $E[t_k]$ | $0$ (for $k > 1$) |
| $Var(t_k)$ | $k/(k-2)$ (for $k > 2$) |
| Shape | Symmetric, heavier tails than $\mathcal{N}(0,1)$ |

**Key property**: As $k \to \infty$, $t_k \to \mathcal{N}(0,1)$. For $k \geq 30$, the approximation is good.

| df | $t_k(0.975)$ |
|---|---|
| 1 | 12.71 |
| 3 | 3.182 |
| 5 | 2.571 |
| 10 | 2.228 |
| 30 | 2.042 |
| 100 | 1.984 |
| $\infty$ | 1.960 |

**R**: `dt(x, df)`, `pt(x, df)`, `qt(p, df)`, `rt(n, df)`

---

## 5.4 Point Estimation

### Estimating the Mean

The sample mean $\bar{X}_n = \frac{1}{n}\sum X_i$ is an **unbiased** estimator of $\mu$:

$$E[\bar{X}_n] = \mu \qquad Var(\bar{X}_n) = \frac{\sigma^2}{n}$$

### Estimating the Variance

The **biased** sample variance:

$$S^2 = \frac{1}{n}\sum_{i=1}^n (X_i - \bar{X})^2 \qquad E[S^2] = \frac{n-1}{n}\sigma^2 \neq \sigma^2$$

The **unbiased** (corrected) sample variance:

$$S'^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2 = \frac{n}{n-1}S^2 \qquad E[S'^2] = \sigma^2$$

**Important**: R's `var()` and `sd()` compute the unbiased versions (dividing by $n-1$).

**Numerical example**: For $x = (2, 4, 6)$, $\bar{x} = 4$:
- Biased: $S^2 = ((2-4)^2 + (4-4)^2 + (6-4)^2)/3 = 8/3 \approx 2.67$
- Unbiased: $S'^2 = ((2-4)^2 + (4-4)^2 + (6-4)^2)/2 = 4$ (this is what R returns)

---

## 5.5 CI for Mean -- $\sigma$ Known

By CLT: $\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)$

$$\boxed{\mu \in \left[\bar{X}_n - u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}},\ \bar{X}_n + u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}}\right]}$$

where $u_{1-\alpha/2} = \text{qnorm}(1-\alpha/2)$.

### Worked Example

> Program execution times over 4 days: 79, 79, 80, 82. Known $\sigma = 1$. Find 95% CI for mean.

$\bar{x} = 80$, $n = 4$, $\sigma = 1$, $u_{0.975} = 1.96$.

$$\mu \in \left[80 - 1.96 \cdot \frac{1}{2},\ 80 + 1.96 \cdot \frac{1}{2}\right] = [79.02, 80.98]$$

### Determining Sample Size for Target Precision

To achieve a CI half-width of $\delta$:

$$u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}} = \delta \implies n = \left(\frac{u_{1-\alpha/2} \cdot \sigma}{\delta}\right)^2$$

**Example**: Precision of 5 minutes, $\sigma = 10$, 95% confidence:
$$n = \left(\frac{1.96 \times 10}{5}\right)^2 = (3.92)^2 \approx 16$$

---

## 5.6 CI for Mean -- $\sigma$ Unknown

Replace $\sigma$ by its estimate $S'$ and use the Student's t-distribution:

$$\frac{\bar{X}_n - \mu}{S'/\sqrt{n}} \sim t_{n-1}$$

$$\boxed{\mu \in \left[\bar{X}_n - t_{n-1}\left(1-\frac{\alpha}{2}\right)\frac{S'}{\sqrt{n}},\ \bar{X}_n + t_{n-1}\left(1-\frac{\alpha}{2}\right)\frac{S'}{\sqrt{n}}\right]}$$

### Worked Example

> Same data: 79, 79, 80, 82. Now $\sigma$ unknown. Find 95% CI.

$\bar{x} = 80$, $n = 4$, $S' = \sqrt{(1+1+0+4)/3} = \sqrt{2} \approx 1.41$.

$t_3(0.975) = 3.182$.

$$\mu \in \left[80 - 3.182 \cdot \frac{\sqrt{2}}{2},\ 80 + 3.182 \cdot \frac{\sqrt{2}}{2}\right] = [77.7, 82.3]$$

**Observation**: The CI is wider when $\sigma$ is unknown because:
1. $S'$ introduces additional uncertainty
2. $t_{n-1}(0.975) > u_{0.975}$, especially for small $n$

---

## 5.7 CI for Variance

The distribution of the sample variance is related to chi-squared:

$$\frac{(n-1)S'^2}{\sigma^2} \sim \chi^2_{n-1}$$

The chi-squared distribution is **asymmetric**, so the CI uses different upper and lower quantiles:

$$\boxed{\sigma^2 \in \left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]}$$

**Watch the inversion**: The lower CI bound uses the **upper** quantile, and vice versa.

---

## 5.8 CI for a Proportion

For a proportion $p$ estimated from $n$ observations with $\hat{p} = x_n/n$:

Using the binomial-to-normal approximation ($np \geq 5$, $n(1-p) \geq 5$, $n \geq 30$):

$$\hat{p} \approx \mathcal{N}\left(p, \sqrt{\frac{p(1-p)}{n}}\right)$$

Since $p$ appears in the bounds (circular), use the conservative bound $p(1-p) \leq 1/4$:

$$\boxed{p \in \left[\hat{p} - u_{1-\alpha/2}\frac{1}{2\sqrt{n}},\ \hat{p} + u_{1-\alpha/2}\frac{1}{2\sqrt{n}}\right]}$$

### Worked Example: USB Ports

> 7.5% of machines lack USB. Sample of 100. Find 90% CI for number without USB.

$X \sim \mathcal{B}(100, 0.075)$. By CLT: $X \approx \mathcal{N}(7.5, \sqrt{100 \cdot 0.075 \cdot 0.925})$.

Using exact binomial: $[\text{qbinom}(0.05, 100, 0.075),\ \text{qbinom}(0.95, 100, 0.075)] = [3, 12]$.

Using normal approximation: $[\text{qnorm}(0.05, 7.5, 2.63),\ \text{qnorm}(0.95, 7.5, 2.63)] \approx [3.2, 11.8]$.

---

## 5.9 Decision Flowchart

```
What parameter are you estimating?
|
+-- Mean (mu)
|   |
|   +-- sigma known? --> N(0,1), use qnorm
|   |
|   +-- sigma unknown? --> t(n-1), use qt
|
+-- Variance (sigma^2)
|   |
|   +-- Always use chi^2(n-1), use qchisq
|
+-- Proportion (p)
    |
    +-- n large? --> N(0,1), use qnorm with conservative bound
```

---

## CHEAT SHEET -- Confidence Intervals

| Parameter | Pivot | Distribution | CI at $1-\alpha$ |
|---|---|---|---|
| $\mu$ ($\sigma$ known) | $\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | $\bar{X} \pm u_{1-\alpha/2} \frac{\sigma}{\sqrt{n}}$ |
| $\mu$ ($\sigma$ unknown) | $\frac{\bar{X}-\mu}{S'/\sqrt{n}}$ | $t_{n-1}$ | $\bar{X} \pm t_{n-1}(1-\alpha/2) \frac{S'}{\sqrt{n}}$ |
| $\sigma^2$ | $\frac{(n-1)S'^2}{\sigma^2}$ | $\chi^2_{n-1}$ | $\left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$ |
| $p$ | $\frac{X-np}{\sqrt{np(1-p)}}$ | $\mathcal{N}(0,1)$ | $\hat{p} \pm u_{1-\alpha/2}\frac{1}{2\sqrt{n}}$ |

**Point estimators**: $\bar{X}_n$ for $\mu$ (unbiased); $\frac{n}{n-1}S^2 = S'^2$ for $\sigma^2$ (unbiased); $\hat{p} = x_n/n$ for $p$.

**R computes unbiased**: `var()` returns $S'^2$, `sd()` returns $S'$.
