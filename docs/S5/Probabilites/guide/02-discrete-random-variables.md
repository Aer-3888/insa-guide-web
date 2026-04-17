---
title: "Chapter 2: Discrete Random Variables"
sidebar_position: 2
---

# Chapter 2: Discrete Random Variables

## 2.1 Definition

A **random variable** $X$ is a function $X: \Omega \to \mathbb{R}$ that assigns a real number to each outcome of a random experiment. It is **discrete** if it takes a finite or countably infinite set of values.

### Probability Mass Function (PMF)

For discrete $X$ with values $\{x_1, x_2, \ldots\}$:

$$P(X = x_i) = p_i \quad \text{with} \quad \sum_i p_i = 1$$

The PMF completely determines the distribution: a list of all possible values with their probabilities.

### Cumulative Distribution Function (CDF)

$$F_X(x) = P(X \leq x) = \sum_{x_i \leq x} P(X = x_i)$$

Properties:
- $F$ is non-decreasing (staircase function for discrete r.v.)
- $\lim_{x \to -\infty} F(x) = 0$, $\lim_{x \to +\infty} F(x) = 1$
- $P(a < X \leq b) = F(b) - F(a)$

---

## 2.2 Expectation and Variance

### Expectation (Mean)

The **expected value** is the probability-weighted average:

$$E[X] = \sum_{x \in X(\Omega)} x \cdot P(X = x)$$

Properties of expectation:
- $E[aX + b] = aE[X] + b$ (linearity)
- $E[X + Y] = E[X] + E[Y]$ (always, even if dependent)
- $E[g(X)] = \sum_x g(x) P(X = x)$ (law of the unconscious statistician)

### Variance

**Variance** measures dispersion around the mean:

$$Var(X) = E\left[(X - E[X])^2\right] = E[X^2] - (E[X])^2$$

Properties:
- $Var(X) \geq 0$
- $Var(aX + b) = a^2 Var(X)$
- **Standard deviation**: $\sigma(X) = \sqrt{Var(X)}$

### Covariance

$$Cov(X, Y) = E[(X - E[X])(Y - E[Y])] = E[XY] - E[X]E[Y]$$

If $X$ and $Y$ are independent: $Cov(X,Y) = 0$ and $Var(X+Y) = Var(X) + Var(Y)$.

---

## 2.3 Common Discrete Distributions

### Bernoulli Distribution $\mathcal{B}(p)$

A binary random variable: success ($X=1$) with probability $p$, failure ($X=0$) with probability $1-p$.

$$P(X = k) = p^k (1-p)^{1-k}, \quad k \in \{0, 1\}$$

| | Value |
|---|---|
| $E[X]$ | $p$ |
| $Var(X)$ | $p(1-p)$ |

**Application**: Single trial with two outcomes (error in a model, coin flip, defect detection).

### Binomial Distribution $\mathcal{B}(n, p)$

Sum of $n$ independent Bernoulli trials: $X = \sum_{i=1}^n X_i$ where $X_i \sim \mathcal{B}(p)$.

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \quad k \in \{0, 1, \ldots, n\}$$

| | Value |
|---|---|
| $E[X]$ | $np$ |
| $Var(X)$ | $np(1-p)$ |

**Application**: Number of successes in $n$ independent trials (MCQ guessing, defective items in a batch).

### Poisson Distribution $\mathcal{P}(\lambda)$

Models the number of events in a fixed interval when events occur at constant average rate $\lambda$.

$$P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \quad k \in \{0, 1, 2, \ldots\}$$

| | Value |
|---|---|
| $E[X]$ | $\lambda$ |
| $Var(X)$ | $\lambda$ |

**Application**: Number of server requests per minute, radioactive decay events. Approximation: $\mathcal{B}(n,p) \approx \mathcal{P}(np)$ when $n$ large, $p$ small.

### Geometric Distribution $\mathcal{G}(p)$

Number of trials until the first success.

$$P(X = k) = p(1-p)^{k-1}, \quad k \in \{1, 2, 3, \ldots\}$$

| | Value |
|---|---|
| $E[X]$ | $1/p$ |
| $Var(X)$ | $(1-p)/p^2$ |

**Memoryless property**: $P(X > s + t \mid X > s) = P(X > t)$.

### Hypergeometric Distribution

Drawing without replacement from a finite population. Drawing $k$ items from a population of $N$ items containing $K$ successes.

$$P(X = x) = \frac{\binom{K}{x}\binom{N-K}{k-x}}{\binom{N}{k}}$$

| | Value |
|---|---|
| $E[X]$ | $k \cdot K/N$ |

**R function**: `dhyper(x, m=K, n=N-K, k)`.

When $N$ is large relative to $k$, the hypergeometric distribution approximates the binomial.

---

## 2.4 Worked Examples

### Example 1: MCQ Random Guessing

> A 10-question MCQ with 4 choices each. A student guesses randomly. What is $P(\text{pass})$ if pass requires $\geq 6$ correct?

$X \sim \mathcal{B}(10, 0.25)$.

$$P(X \geq 6) = 1 - P(X \leq 5) = 1 - \sum_{k=0}^{5} \binom{10}{k} (0.25)^k (0.75)^{10-k}$$

In R: `1 - pbinom(5, size=10, prob=0.25)` $\approx 0.0197$

Only about 2% chance of passing by guessing.

### Example 2: Urn Problem

> An urn has 8 red and 5 black balls. Draw 6 without replacement. Expected number of red balls?

$X \sim \text{Hypergeometric}(N=13, K=8, k=6)$.

$$E[X] = k \cdot \frac{K}{N} = 6 \cdot \frac{8}{13} \approx 3.69$$

In R: `sum(0:6 * dhyper(0:6, m=8, n=5, k=6))`.

---

## 2.5 Indicator Function

The **indicator function** of event $A$ is:

$$\mathbf{1}_A(\omega) = \begin{cases} 1 & \text{if } \omega \in A \\ 0 & \text{otherwise} \end{cases}$$

Useful property: $E[\mathbf{1}_A] = P(A)$ and $Var(\mathbf{1}_A) = P(A)(1-P(A))$.

---

## CHEAT SHEET -- Discrete Distributions

| Distribution | $P(X=k)$ | $E[X]$ | $Var(X)$ | R: `d*` |
|---|---|---|---|---|
| $\mathcal{B}(p)$ | $p^k(1-p)^{1-k}$ | $p$ | $p(1-p)$ | `dbinom(k,1,p)` |
| $\mathcal{B}(n,p)$ | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ | `dbinom(k,n,p)` |
| $\mathcal{P}(\lambda)$ | $e^{-\lambda}\lambda^k/k!$ | $\lambda$ | $\lambda$ | `dpois(k,lambda)` |
| $\mathcal{G}(p)$ | $p(1-p)^{k-1}$ | $1/p$ | $(1-p)/p^2$ | `dgeom(k-1,p)` |
| Hypergeometric | $\frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}$ | $nK/N$ | -- | `dhyper(k,K,N-K,n)` |

**Key approximations**:
- $\mathcal{B}(n,p) \approx \mathcal{P}(np)$ when $n$ large, $p$ small
- $\mathcal{B}(n,p) \approx \mathcal{N}(np, \sqrt{np(1-p)})$ when $np \geq 5$ and $n(1-p) \geq 5$
