---
title: "Chapter 3: Continuous Random Variables"
sidebar_position: 3
---

# Chapter 3: Continuous Random Variables

## 3.1 Definitions

A random variable $X$ is **continuous** if it can take any value in an interval of $\mathbb{R}$.

### Probability Density Function (PDF)

A function $f: \mathbb{R} \to \mathbb{R}^+$ is a PDF of $X$ if:

$$P(a \leq X \leq b) = \int_a^b f(x)\, dx$$

Properties:
- $f(x) \geq 0$ for all $x$
- $\int_{-\infty}^{+\infty} f(x)\, dx = 1$
- **Important**: $P(X = a) = \int_a^a f(x)\, dx = 0$ for any specific value $a$

### Cumulative Distribution Function (CDF)

$$F_X(x) = P(X \leq x) = \int_{-\infty}^{x} f(t)\, dt$$

Properties:
- $F'(x) = f(x)$ (PDF is the derivative of CDF)
- $\lim_{x \to -\infty} F(x) = 0$, $\lim_{x \to +\infty} F(x) = 1$
- $P(a \leq X \leq b) = F(b) - F(a)$

---

## 3.2 Expectation and Variance (Continuous Case)

### Expectation

$$E[X] = \int_{-\infty}^{+\infty} x \cdot f(x)\, dx$$

**Transfer theorem**: $E[g(X)] = \int_{-\infty}^{+\infty} g(x) \cdot f(x)\, dx$

### Variance

$$Var(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2$$

$$Var(X) = \int_{-\infty}^{+\infty} (x - \mu)^2 f(x)\, dx = \int_{-\infty}^{+\infty} x^2 f(x)\, dx - \mu^2$$

### Higher Moments

| Moment | Definition | Interpretation |
|--------|-----------|----------------|
| $\mu_k = E[(X-E[X])^k]$ | Centered moment of order $k$ | -- |
| $\gamma_1 = \mu_3 / \sigma^3$ | Skewness | Asymmetry of the distribution |
| $\gamma_2 = \mu_4 / \sigma^4$ | Kurtosis | "Peakedness" of the distribution |

For a normal distribution: $\gamma_1 = 0$ (symmetric) and $\gamma_2 = 3$ (or excess kurtosis = 0).

---

## 3.3 Common Continuous Distributions

### Uniform Distribution $\mathcal{U}(a, b)$

The distribution of "no information" -- all values equally likely.

$$f(x) = \frac{1}{b-a} \mathbf{1}_{[a,b]}(x)$$

$$F(x) = \begin{cases} 0 & x < a \\ \frac{x-a}{b-a} & a \leq x \leq b \\ 1 & x > b \end{cases}$$

| | Value |
|---|---|
| $E[X]$ | $(a+b)/2$ |
| $Var(X)$ | $(b-a)^2/12$ |

**R**: `dunif(x, min=a, max=b)`, `punif(x, min, max)`, `runif(n, min, max)`

### Exponential Distribution $\mathcal{E}(\lambda)$

Models waiting times, durations until first failure, time between events.

$$f(x) = \lambda e^{-\lambda x} \mathbf{1}_{x \geq 0}$$

$$F(x) = 1 - e^{-\lambda x} \quad \text{for } x \geq 0$$

| | Value |
|---|---|
| $E[X]$ | $1/\lambda$ |
| $Var(X)$ | $1/\lambda^2$ |
| $\sigma(X)$ | $1/\lambda$ |

**Memoryless property**: $P(X > s + t \mid X > s) = P(X > t)$

**Derivation of $E[X]$** (integration by parts):

$$E[X] = \int_0^{+\infty} x \lambda e^{-\lambda x}\, dx$$

Let $u = x$, $v' = \lambda e^{-\lambda x}$, so $u' = 1$, $v = -e^{-\lambda x}$:

$$E[X] = \left[-x e^{-\lambda x}\right]_0^{+\infty} + \int_0^{+\infty} e^{-\lambda x}\, dx = 0 + \frac{1}{\lambda} = \frac{1}{\lambda}$$

**R**: `dexp(x, rate=lambda)`, `pexp(x, rate)`, `rexp(n, rate)`

**Note on parametrization**: Higher $\lambda$ means more concentrated near 0 (faster decay). Lower $\lambda$ means more spread out. The mean equals the standard deviation ($1/\lambda$).

### Normal (Gaussian) Distribution $\mathcal{N}(\mu, \sigma)$

THE fundamental distribution. Central role in statistics through the CLT.

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$

| | Value |
|---|---|
| $E[X]$ | $\mu$ |
| $Var(X)$ | $\sigma^2$ |
| Mode | $\mu$ |
| Skewness | $0$ (symmetric) |

**Standard normal** $\mathcal{N}(0, 1)$: $\mu = 0$, $\sigma = 1$.

**Standardization**: If $X \sim \mathcal{N}(\mu, \sigma)$, then $Z = \frac{X - \mu}{\sigma} \sim \mathcal{N}(0, 1)$.

**Key quantiles of $\mathcal{N}(0,1)$**:

| Probability $P(|Z| < z)$ | $z$ value |
|---|---|
| 90% | 1.645 |
| 95% | 1.960 |
| 99% | 2.576 |

**Properties**:
- $aX + b \sim \mathcal{N}(a\mu + b, |a|\sigma)$
- If $X_1 \sim \mathcal{N}(\mu_1, \sigma_1)$ and $X_2 \sim \mathcal{N}(\mu_2, \sigma_2)$ are independent, then $X_1 + X_2 \sim \mathcal{N}(\mu_1 + \mu_2, \sqrt{\sigma_1^2 + \sigma_2^2})$

**R**: `dnorm(x, mean, sd)`, `pnorm(x, mean, sd)`, `qnorm(p, mean, sd)`, `rnorm(n, mean, sd)`

**WARNING**: In this course, $\mathcal{N}(\mu, \sigma)$ uses the **standard deviation** $\sigma$, not the variance $\sigma^2$. R also takes `sd`, not variance. Some textbooks use $\mathcal{N}(\mu, \sigma^2)$. Always verify which convention is in use.

### Gamma Distribution $\Gamma(p, \theta)$

Generalization of the exponential. The exponential is $\Gamma(1, \lambda)$.

| | Value |
|---|---|
| $E[X]$ | $p/\theta$ |
| $Var(X)$ | $p/\theta^2$ |

Useful for: sum of $p$ independent exponential r.v. with parameter $\theta$.

### Cauchy Distribution (Lorentz)

$$f(x) = \frac{1}{\pi a} \cdot \frac{1}{1 + \left(\frac{x - x_0}{a}\right)^2}$$

**Critical property**: The Cauchy distribution has **no finite mean and no finite variance**. The Law of Large Numbers does NOT apply -- the sample mean does not converge.

Used in spectroscopy for emission lines. Important as a cautionary example: always verify that $E[X]$ exists before applying LLN/CLT.

---

## 3.4 Worked Examples

### Example 1: Exponential CDF

> For $X \sim \mathcal{E}(\lambda)$, compute $P(X > s + t \mid X > s)$.

$$P(X > s+t \mid X > s) = \frac{P(X > s+t)}{P(X > s)} = \frac{e^{-\lambda(s+t)}}{e^{-\lambda s}} = e^{-\lambda t} = P(X > t)$$

This is the **memoryless property**: the probability of surviving an additional $t$ units does not depend on the time $s$ already survived.

### Example 2: Distance to Origin

> $(X, Y)$ uniformly distributed on $[0,1]^2$. Compute $P(\sqrt{X^2 + Y^2} \leq 1)$.

The event $\sqrt{X^2 + Y^2} \leq 1$ is the quarter disk of radius 1 inside the unit square.

$$P = \frac{\text{Area of quarter disk}}{\text{Area of square}} = \frac{\pi/4}{1} = \frac{\pi}{4} \approx 0.785$$

---

## CHEAT SHEET -- Continuous Distributions

| Distribution | PDF | $E[X]$ | $Var(X)$ | R prefix |
|---|---|---|---|---|
| $\mathcal{U}(a,b)$ | $\frac{1}{b-a}\mathbf{1}_{[a,b]}$ | $\frac{a+b}{2}$ | $\frac{(b-a)^2}{12}$ | `unif` |
| $\mathcal{E}(\lambda)$ | $\lambda e^{-\lambda x}\mathbf{1}_{x\geq 0}$ | $1/\lambda$ | $1/\lambda^2$ | `exp` |
| $\mathcal{N}(\mu,\sigma)$ | $\frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}$ | $\mu$ | $\sigma^2$ | `norm` |
| $\Gamma(p,\theta)$ | -- | $p/\theta$ | $p/\theta^2$ | `gamma` |
| Cauchy$(x_0,a)$ | $\frac{1}{\pi a(1+((x-x_0)/a)^2)}$ | undefined | undefined | `cauchy` |

**Key relationships**:
- $\mathcal{E}(\lambda) = \Gamma(1, \lambda)$
- $\mathcal{N}(\mu,\sigma) \xrightarrow{\text{standardize}} \mathcal{N}(0,1)$ via $Z = (X-\mu)/\sigma$
- Exponential is memoryless: $P(X > s+t \mid X > s) = P(X > t)$
