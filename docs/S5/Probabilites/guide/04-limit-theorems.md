---
title: "Chapter 4: Limit Theorems"
sidebar_position: 4
---

# Chapter 4: Limit Theorems

## 4.1 Context and Setup

Consider a process where we repeat an experiment many times:

- Each realization is a draw from a random variable $X_i$
- The $X_i$ are **iid** (independent and identically distributed) with $E[X_i] = \mu$, $Var(X_i) = \sigma^2$

The **sample mean** is:

$$\bar{X}_n = \frac{1}{n}\sum_{i=1}^{n} X_i$$

Key properties of $\bar{X}_n$:

$$E[\bar{X}_n] = \mu \qquad Var(\bar{X}_n) = \frac{\sigma^2}{n}$$

**Insight**: Averaging reduces variability. The mean of $\bar{X}_n$ equals the mean of $X$, but its variance decreases as $1/n$.

---

## 4.2 Chebyshev's Inequality

For **any** distribution with finite mean and variance:

$$P(|X - E[X]| \geq a) \leq \frac{Var(X)}{a^2}$$

Equivalently, in terms of standard deviations:

$$P(|X - E[X]| < k\sigma) > 1 - \frac{1}{k^2}$$

| $k$ (std devs) | Lower bound on $P(|X - \mu| < k\sigma)$ |
|---|---|
| 2 | $\geq 75\%$ |
| 3 | $\geq 89\%$ |
| 4 | $\geq 93.75\%$ |

**Interpretation**: For any distribution, at least 75% of values fall within 2 standard deviations of the mean. This is a universal bound, but it is often very loose.

### Application to $\bar{X}_n$

Applying Chebyshev to the sample mean:

$$P(|\bar{X}_n - \mu| > k\sigma) \leq \frac{1}{nk^2}$$

The bound shrinks as $n$ increases -- this is the foundation for the LLN.

### Worked Example

> For $X \sim \mathcal{E}(1)$ ($\mu = 1$, $\sigma = 1$), compute exact $P(|X - 1| < k)$ for $k = 1, 2, 3$.

$$P(|X - 1| < k) = P(1-k < X < 1+k)$$

Since exponential density is zero for $x < 0$:

$$P(|X - 1| < k) = \int_0^{1+k} e^{-x}\, dx = 1 - e^{-(1+k)}$$

| $k$ | Chebyshev bound | Exact value |
|---|---|---|
| 1 | $\geq 0\%$ | 86% |
| 2 | $\geq 75\%$ | 95% |
| 3 | $\geq 89\%$ | 98% |

The exact values are much better than the Chebyshev bound, illustrating that the bound is universal but conservative.

---

## 4.3 Law of Large Numbers (LLN)

### Statement

Let $X_1, X_2, \ldots, X_n$ be iid with $E[X_i] = \mu$ and $Var(X_i) = \sigma^2 < \infty$. Then:

$$\forall \varepsilon > 0, \quad \lim_{n \to \infty} P(|\bar{X}_n - \mu| > \varepsilon) = 0$$

**In plain terms**: The sample mean converges to the population mean as $n \to \infty$.

### Proof Sketch (via Chebyshev)

$$P(|\bar{X}_n - \mu| > \varepsilon) \leq \frac{Var(\bar{X}_n)}{\varepsilon^2} = \frac{\sigma^2}{n\varepsilon^2} \xrightarrow{n \to \infty} 0$$

### Conditions

The LLN requires that $E[X]$ is **finite**. Counter-example: the Cauchy distribution has no finite mean, and $\bar{X}_n$ does NOT converge.

### Practical Consequences

1. **Estimating probabilities**: Use the indicator variable $Y_i = \mathbf{1}_{X_i \in C}$. Then $\bar{Y}_n \to P(X \in C)$ as $n \to \infty$.
2. **Estimating densities**: $f(a) \approx \bar{Y}_n / (2h)$ where $Y_i = \mathbf{1}_{X_i \in (a-h, a+h)}$.
3. **Monte Carlo methods**: Approximate integrals by sampling.

---

## 4.4 Central Limit Theorem (CLT)

### Statement

Let $X_1, \ldots, X_n$ be iid with $E[X_i] = \mu$ and $Var(X_i) = \sigma^2$. Define the standardized mean:

$$Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}}$$

Then as $n \to \infty$:

$$Z_n \xrightarrow{d} \mathcal{N}(0, 1)$$

Equivalently:

$$\bar{X}_n \underset{n \to \infty}{\sim} \mathcal{N}\left(\mu, \frac{\sigma}{\sqrt{n}}\right)$$

### Key Insight

The CLT tells us **the shape of the distribution** of $\bar{X}_n$ -- it is approximately normal, regardless of the original distribution of $X$.

| Theorem | What it gives |
|---------|---------------|
| LLN | A **value** (the mean) toward which $\bar{X}_n$ converges |
| CLT | A **distribution** ($\mathcal{N}$) that describes the fluctuations of $\bar{X}_n$ around $\mu$ |

### Visual Intuition

For any starting distribution (gamma, bimodal, uniform, etc.):
- $\bar{X}_1 = X_1$ follows the original distribution
- $\bar{X}_5$ starts looking bell-shaped
- $\bar{X}_{30}$ is very close to normal
- The spread decreases as $\sigma / \sqrt{n}$

### Standardization

To compare variables of different scales, standardize:

$$Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}}$$

Verify: $E[Z_n] = 0$, $Var(Z_n) = 1$.

---

## 4.5 Worked Examples

### Example 1: Gamma Distribution

> 500 draws from $\Gamma(2, 1)$ ($\mu = 2$, $\sigma^2 = 2$). After $n = 400$ draws: $\bar{X}_{400} = 1.99$. After $n = 500$ draws: $\bar{X}_{500} = 2.06$. Is $\bar{X}_{500} = 2.06$ unusual?

By CLT: $\bar{X}_{500} \sim \mathcal{N}\left(2, \frac{\sqrt{2}}{\sqrt{500}}\right)$.

$$P(\bar{X}_{500} \geq 2.06) = 1 - \text{pnorm}(2.06, \text{mean}=2, \text{sd}=\sqrt{2/500})$$

$$= 1 - \text{pnorm}(2.06, 2, 0.0632) \approx 0.171$$

17% chance of being above 2.06 -- not particularly unusual.

**Lesson**: Do not compare raw deviations without accounting for $n$. The deviation of 0.06 at $n=500$ is actually more "normal" than the deviation of 0.01 at $n=400$ suggests.

### Example 2: Rounding Errors

> 100 transactions rounded to nearest integer. Error $X_i \sim \mathcal{U}(-0.5, 0.5)$ with $\mu = 0$, $\sigma^2 = 1/12$. Find $P(|Y| > 10)$ where $Y = \sum_{i=1}^{100} X_i$.

Step 1: $\bar{X}_{100} \sim \mathcal{N}(0, \sqrt{1/1200})$ by CLT.

Step 2: $Y = 100\bar{X}_{100} \sim \mathcal{N}(0, \sqrt{100/12}) = \mathcal{N}(0, \sqrt{100 \cdot 1/12})$.

Step 3:
$$P(|Y| > 10) = P(Y < -10) + P(Y > 10)$$
$$= \text{pnorm}(-10, 0, \sqrt{100/12}) + 1 - \text{pnorm}(10, 0, \sqrt{100/12})$$
$$\approx 0.00053$$

---

## 4.6 Normal Approximation to Binomial

When $X \sim \mathcal{B}(n, p)$ with $n$ large:

$$X \approx \mathcal{N}(np, \sqrt{np(1-p)})$$

**Conditions** (rule of thumb): $n \geq 30$, $np \geq 5$, $n(1-p) \geq 5$.

### Continuity Correction

Since binomial is discrete and normal is continuous:

| Exact (Binomial) | Approximate (Normal) |
|---|---|
| $P(X = k)$ | $P(k - 0.5 < X < k + 0.5)$ |
| $P(X \geq k)$ | $P(X > k - 0.5)$ |
| $P(X \leq k)$ | $P(X < k + 0.5)$ |

---

## 4.7 Summary: LLN vs CLT

| | Law of Large Numbers | Central Limit Theorem |
|---|---|---|
| **Gives** | A value ($\mu$) | A distribution ($\mathcal{N}$) |
| **Statement** | $\bar{X}_n \to \mu$ | $\bar{X}_n \sim \mathcal{N}(\mu, \sigma/\sqrt{n})$ |
| **Requirement** | $E[X]$ finite | $E[X]$ and $Var(X)$ finite |
| **Use** | Justifies averaging | Quantifies uncertainty |

---

## CHEAT SHEET -- Limit Theorems

| Result | Formula |
|--------|---------|
| $E[\bar{X}_n]$ | $\mu$ |
| $Var(\bar{X}_n)$ | $\sigma^2/n$ |
| Chebyshev | $P(\|X - \mu\| \geq a) \leq Var(X)/a^2$ |
| LLN | $P(\|\bar{X}_n - \mu\| > \varepsilon) \leq \sigma^2/(n\varepsilon^2) \to 0$ |
| CLT | $Z_n = (\bar{X}_n - \mu)/(\sigma/\sqrt{n}) \to \mathcal{N}(0,1)$ |
| Standardize | $Z = (X - \mu)/\sigma$ |
| Binomial approx | $\mathcal{B}(n,p) \approx \mathcal{N}(np, \sqrt{np(1-p)})$ when $np\geq 5$, $n(1-p)\geq 5$ |
