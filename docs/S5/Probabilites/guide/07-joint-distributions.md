---
title: "Chapter 7: Joint Distributions and Random Vectors"
sidebar_position: 7
---

# Chapter 7: Joint Distributions and Random Vectors

## 7.1 Random Vectors

A **random vector** $\mathbf{X} = (X_1, X_2, \ldots, X_n)$ is an $n$-tuple of random variables defined on the same probability space. It maps outcomes $\omega \in \Omega$ to $\mathbb{R}^n$.

**Examples**:
- Defect counts across $M$ regions of a semiconductor chip (discrete)
- (Height, Weight, Age) of a randomly selected student (continuous)
- RGB values of a pixel (mixed dimensions)

---

## 7.2 Joint Distribution

### Discrete Case

The **joint PMF** gives probabilities for all combinations:

$$P(X_1 = x_1, X_2 = x_2, \ldots, X_n = x_n)$$

For a bivariate case, this can be written as a **probability table**:

|  | $Y=0$ | $Y=5$ | $Y=10$ | $Y=15$ |
|---|---|---|---|---|
| $X=0$ | 0.02 | 0.06 | 0.02 | 0.10 |
| $X=5$ | 0.04 | 0.15 | 0.20 | 0.10 |
| $X=10$ | 0.01 | 0.15 | 0.14 | 0.01 |

Verification: all entries sum to 1.

### Continuous Case

The **joint PDF** satisfies:

$$P(\mathbf{X} \in A) = \int \cdots \int_A f(x_1, x_2, \ldots, x_n)\, dx_1\, dx_2 \cdots dx_n$$

with $f \geq 0$ and $\int_{\mathbb{R}^n} f = 1$.

### Joint CDF

$$F_{\mathbf{X}}(x_1, \ldots, x_n) = P(X_1 \leq x_1, X_2 \leq x_2, \ldots, X_n \leq x_n)$$

For continuous vectors: $f(x_1, \ldots, x_n) = \frac{\partial^n F}{\partial x_1 \cdots \partial x_n}$.

---

## 7.3 Marginal Distributions

The **marginal distribution** of $X$ is obtained by "summing out" (or integrating over) the other variable(s).

### Discrete Case

$$P(X = x) = \sum_y P(X = x, Y = y)$$

In R: `apply(prob_matrix, 1, sum)` for row marginals (X), `apply(prob_matrix, 2, sum)` for column marginals (Y).

### Continuous Case

$$f_X(x) = \int_{\mathbb{R}} f(x, y)\, dy$$

### Worked Example

From the table above, marginal of $X$:
- $P(X=0) = 0.02 + 0.06 + 0.02 + 0.10 = 0.20$
- $P(X=5) = 0.04 + 0.15 + 0.20 + 0.10 = 0.49$
- $P(X=10) = 0.01 + 0.15 + 0.14 + 0.01 = 0.31$

---

## 7.4 Conditional Distributions

### Discrete Case

$$P(X = x_i \mid Y = y_k) = \frac{P(X = x_i, Y = y_k)}{P(Y = y_k)}$$

### Continuous Case

$$f(x \mid y) = \frac{f(x, y)}{f_Y(y)}$$

### Worked Example

$P(X \mid Y = 5)$: First, $P(Y=5) = 0.06 + 0.15 + 0.15 = 0.36$.

- $P(X=0 \mid Y=5) = 0.06/0.36 = 1/6$
- $P(X=5 \mid Y=5) = 0.15/0.36 = 5/12$
- $P(X=10 \mid Y=5) = 0.15/0.36 = 5/12$

---

## 7.5 Independence

Random variables $X_1, \ldots, X_n$ are **independent** if and only if:

$$f_{\mathbf{X}}(x_1, \ldots, x_n) = f_{X_1}(x_1) \cdots f_{X_n}(x_n)$$

Equivalently: $F_{\mathbf{X}}(x_1, \ldots, x_n) = F_{X_1}(x_1) \cdots F_{X_n}(x_n)$.

**Convolution**: If $X$ and $Y$ are independent, then $Z = X + Y$ has density:

$$g_Z(z) = \int_{-\infty}^{+\infty} f_X(z - y) f_Y(y)\, dy = (f_X * f_Y)(z)$$

---

## 7.6 Mean Vector and Covariance Matrix

### Mean Vector

$$\boldsymbol{\mu}_{\mathbf{X}} = E[\mathbf{X}] = \begin{pmatrix} E[X_1] \\ \vdots \\ E[X_n] \end{pmatrix}$$

**Linear transformation**: $E[\mathbf{A}\mathbf{X} + \mathbf{b}] = \mathbf{A}E[\mathbf{X}] + \mathbf{b}$

### Covariance Matrix

$$\boldsymbol{\Sigma}_{\mathbf{X}} = Var(\mathbf{X}) = E[(\mathbf{X} - E[\mathbf{X}])(\mathbf{X} - E[\mathbf{X}])^T]$$

$$\boldsymbol{\Sigma}_{\mathbf{X}} = \begin{pmatrix} \sigma^2(X_1) & Cov(X_1, X_2) & \cdots & Cov(X_1, X_n) \\ Cov(X_2, X_1) & \sigma^2(X_2) & & \vdots \\ \vdots & & \ddots & \\ Cov(X_n, X_1) & \cdots & & \sigma^2(X_n) \end{pmatrix}$$

Properties:
- **Symmetric**: $\boldsymbol{\Sigma}^T = \boldsymbol{\Sigma}$
- **Positive semi-definite**: $\mathbf{y}^T \boldsymbol{\Sigma} \mathbf{y} \geq 0$ for all $\mathbf{y}$
- If variables are mutually independent, $\boldsymbol{\Sigma}$ is **diagonal**
- **Inverse**: precision matrix (used in regression)

**Linear transformation**: $Var(\mathbf{A}\mathbf{X} + \mathbf{b}) = \mathbf{A} \boldsymbol{\Sigma}_{\mathbf{X}} \mathbf{A}^T$

### Worked Example

> $\mathbf{X} = (X_1, X_2)$ with covariance matrix $\Sigma = \begin{pmatrix} 4 & 1 \\ 1 & 2 \end{pmatrix}$. Find $Var(Y)$ where $Y = 3X_1 + 4X_2$.

$Y = \mathbf{a}^T \mathbf{X}$ with $\mathbf{a} = (3, 4)^T$.

$$Var(Y) = \mathbf{a}^T \boldsymbol{\Sigma} \mathbf{a} = (3, 4) \begin{pmatrix} 4 & 1 \\ 1 & 2 \end{pmatrix} \begin{pmatrix} 3 \\ 4 \end{pmatrix}$$

$$= (3, 4) \begin{pmatrix} 16 \\ 11 \end{pmatrix} = 48 + 44 = 92$$

---

## 7.7 Multinomial Distribution

Extension of the binomial to $k > 2$ categories.

$n$ trials, each with $k$ possible outcomes with probabilities $(p_1, \ldots, p_k)$, $\sum p_i = 1$.

$$P(X_1 = x_1, \ldots, X_k = x_k) = \frac{n!}{x_1! \cdots x_k!} p_1^{x_1} \cdots p_k^{x_k}$$

where $\sum x_i = n$.

| Property | Value |
|----------|-------|
| $E[X_i]$ | $np_i$ |
| $Var(X_i)$ | $np_i(1 - p_i)$ |
| $Cov(X_i, X_j)$ | $-np_i p_j$ (for $i \neq j$) |

**R**: `dmultinom(x, prob=p)` for probability, `rmultinom(n, size, prob)` for simulation.

### Worked Example: Roulette

> 12 spins: Red (18/38), Black (18/38), Green (2/38). What is $P(5\text{ red}, 5\text{ black}, 2\text{ green})$?

```r
dmultinom(c(5, 5, 2), prob = c(18/38, 18/38, 2/38))
```

---

## 7.8 Gaussian (Normal) Vectors

A random vector $\mathbf{X}$ is **Gaussian** if every linear combination of its components follows a normal distribution.

### Multivariate Normal Density

$\mathbf{X} \sim \mathcal{N}(\boldsymbol{\mu}, \boldsymbol{\Sigma})$ with invertible $\boldsymbol{\Sigma}$:

$$f(x_1, \ldots, x_n) = \frac{1}{(2\pi)^{n/2} |\boldsymbol{\Sigma}|^{1/2}} \exp\left(-\frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^T \boldsymbol{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})\right)$$

### Key Properties

1. **Marginals are Gaussian**: If $\mathbf{X}$ is Gaussian, each $X_i$ is normally distributed.
2. **Linear transformations**: $\mathbf{Y} = \mathbf{A}\mathbf{X} + \mathbf{b}$ is Gaussian with $E[\mathbf{Y}] = \mathbf{A}\boldsymbol{\mu} + \mathbf{b}$, $Var(\mathbf{Y}) = \mathbf{A}\boldsymbol{\Sigma}\mathbf{A}^T$.
3. **Independence = uncorrelation**: For Gaussian vectors, components are independent if and only if $\boldsymbol{\Sigma}$ is diagonal (uncorrelated).
4. **Scalar projections**: $\mathbf{a}^T \mathbf{X} = \sum a_i X_i \sim \mathcal{N}(\sum a_i \mu_i, \sum a_i^2 \sigma_i^2)$ (if components are independent).

### Multivariate CLT

If $\mathbf{X}_1, \ldots, \mathbf{X}_N$ are iid random vectors in $\mathbb{R}^n$ with mean $\mathbf{m}$ and covariance $\boldsymbol{\Sigma}$:

$$\sqrt{N}(\bar{\mathbf{X}}_N - \mathbf{m}) \xrightarrow{d} \mathcal{N}(\mathbf{0}, \boldsymbol{\Sigma})$$

---

## 7.9 Bivariate Normal Example

> Find the marginal of $X$ from $f_{X,Y}(x,y) = \frac{1}{2\pi}e^{-(x^2+y^2)/2}$.

$$f_X(x) = \int_{-\infty}^{+\infty} \frac{1}{2\pi}e^{-(x^2+y^2)/2}\, dy = \frac{1}{\sqrt{2\pi}}e^{-x^2/2} \cdot \underbrace{\int_{-\infty}^{+\infty} \frac{1}{\sqrt{2\pi}}e^{-y^2/2}\, dy}_{=1}$$

$$f_X(x) = \frac{1}{\sqrt{2\pi}}e^{-x^2/2}$$

So $X \sim \mathcal{N}(0, 1)$. By symmetry, $Y \sim \mathcal{N}(0, 1)$.

Since $f(x,y) = f_X(x) \cdot f_Y(y)$, $X$ and $Y$ are **independent**.

---

## CHEAT SHEET -- Joint Distributions

| Concept | Discrete | Continuous |
|---------|----------|------------|
| Joint | $P(X=x, Y=y)$ | $f_{X,Y}(x,y)$ |
| Marginal of $X$ | $\sum_y P(X=x, Y=y)$ | $\int f(x,y)\, dy$ |
| Conditional | $P(X=x\mid Y=y) = \frac{P(X=x,Y=y)}{P(Y=y)}$ | $f(x\mid y) = \frac{f(x,y)}{f_Y(y)}$ |
| Independence | $P(X,Y) = P(X)P(Y)$ | $f(x,y) = f_X(x)f_Y(y)$ |

| Random Vector Property | Formula |
|---|---|
| Mean vector | $\boldsymbol{\mu} = (E[X_1], \ldots, E[X_n])^T$ |
| Covariance matrix | $\Sigma_{ij} = Cov(X_i, X_j)$ |
| Linear transform mean | $E[\mathbf{AX}+\mathbf{b}] = \mathbf{A}\boldsymbol{\mu}+\mathbf{b}$ |
| Linear transform var | $Var(\mathbf{AX}+\mathbf{b}) = \mathbf{A}\boldsymbol{\Sigma}\mathbf{A}^T$ |
| $Var(\mathbf{a}^T\mathbf{X})$ | $\mathbf{a}^T\boldsymbol{\Sigma}\mathbf{a}$ |

| Multinomial Property | Formula |
|---|---|
| $E[X_i]$ | $np_i$ |
| $Var(X_i)$ | $np_i(1-p_i)$ |
| R: probability | `dmultinom(c(x1,...,xk), prob=c(p1,...,pk))` |
| R: simulation | `rmultinom(n, size, prob)` |
