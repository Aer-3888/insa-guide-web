---
title: "Formula Sheet -- Probabilites"
sidebar_position: 3
---

# Formula Sheet -- Probabilites

> Print this and study it. You will not have access to formulas during the exam.

---

## 1. Basic Probability

$$P(\bar{A}) = 1 - P(A)$$

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

$$P(B) = \sum_i P(A_i) P(B \mid A_i) \quad \text{(total probability)}$$

$$P(A_i \mid B) = \frac{P(B \mid A_i) P(A_i)}{\sum_j P(B \mid A_j) P(A_j)} \quad \text{(Bayes)}$$

Independence: $P(A \cap B) = P(A) P(B)$

---

## 2. Random Variables

$$E[X] = \sum_x x P(X=x) = \int x f(x) dx$$

$$Var(X) = E[X^2] - (E[X])^2$$

$$E[aX+b] = aE[X]+b \qquad Var(aX+b) = a^2 Var(X)$$

$$Cov(X,Y) = E[XY] - E[X]E[Y]$$

$X,Y$ independent $\implies Cov(X,Y)=0$, $Var(X+Y) = Var(X)+Var(Y)$

---

## 3. Distribution Table

### Discrete

| Distribution | $P(X=k)$ | $E[X]$ | $Var(X)$ |
|---|---|---|---|
| Bernoulli $\mathcal{B}(p)$ | $p^k(1-p)^{1-k}$ | $p$ | $p(1-p)$ |
| Binomial $\mathcal{B}(n,p)$ | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Poisson $\mathcal{P}(\lambda)$ | $e^{-\lambda}\lambda^k/k!$ | $\lambda$ | $\lambda$ |
| Hypergeometric | $\frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}$ | $nK/N$ | -- |

### Continuous

| Distribution | PDF | $E[X]$ | $Var(X)$ |
|---|---|---|---|
| Uniform $\mathcal{U}(a,b)$ | $\frac{1}{b-a}$ on $[a,b]$ | $\frac{a+b}{2}$ | $\frac{(b-a)^2}{12}$ |
| Exponential $\mathcal{E}(\lambda)$ | $\lambda e^{-\lambda x}$, $x \geq 0$ | $1/\lambda$ | $1/\lambda^2$ |
| Normal $\mathcal{N}(\mu,\sigma)$ | $\frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}$ | $\mu$ | $\sigma^2$ |
| Gamma $\Gamma(p,\theta)$ | -- | $p/\theta$ | $p/\theta^2$ |

### Inference Distributions

| Distribution | Definition | $E$ | $Var$ |
|---|---|---|---|
| $\chi^2_k$ | $\sum_{i=1}^k Z_i^2$, $Z_i \sim \mathcal{N}(0,1)$ iid | $k$ | $2k$ |
| $t_k$ (Student) | $Z/\sqrt{U/k}$, $Z \sim \mathcal{N}(0,1)$, $U \sim \chi^2_k$ | $0$ | $k/(k-2)$ |

### Multinomial

$P(X_1=x_1,\ldots,X_k=x_k) = \frac{n!}{x_1!\cdots x_k!}p_1^{x_1}\cdots p_k^{x_k}$, with $\sum x_i = n$.

$E[X_i] = np_i$, $Var(X_i) = np_i(1-p_i)$, $Cov(X_i,X_j) = -np_ip_j$.

---

## 4. Limit Theorems

**Chebyshev**: $P(|X - \mu| \geq a) \leq Var(X)/a^2$

**Law of Large Numbers**: $\bar{X}_n \to \mu$ as $n \to \infty$ (requires $E[X]$ finite)

**Central Limit Theorem**: $\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0,1)$

**Normal approximation**: $\mathcal{B}(n,p) \approx \mathcal{N}(np, \sqrt{np(1-p)})$ when $np \geq 5$, $n(1-p) \geq 5$

---

## 5. Point Estimation

$$\bar{X}_n = \frac{1}{n}\sum X_i \qquad E[\bar{X}_n] = \mu \quad (\text{unbiased})$$

$$S'^2 = \frac{1}{n-1}\sum(X_i - \bar{X})^2 \qquad E[S'^2] = \sigma^2 \quad (\text{unbiased})$$

$$S^2 = \frac{1}{n}\sum(X_i - \bar{X})^2 \qquad E[S^2] = \frac{n-1}{n}\sigma^2 \quad (\text{biased!})$$

**Recovering from sums**: Given $\sum x_i$ and $\sum x_i^2$:

$$\bar{x} = \frac{\sum x_i}{n} \qquad S'^2 = \frac{1}{n-1}\left(\sum x_i^2 - n\bar{x}^2\right)$$

---

## 6. Confidence Intervals

### Mean CI ($\sigma$ known)

$$\mu \in \left[\bar{X} - u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}},\ \bar{X} + u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}}\right]$$

### Mean CI ($\sigma$ unknown)

$$\mu \in \left[\bar{X} - t_{n-1}(1-\alpha/2)\frac{S'}{\sqrt{n}},\ \bar{X} + t_{n-1}(1-\alpha/2)\frac{S'}{\sqrt{n}}\right]$$

### Variance CI

$$\sigma^2 \in \left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$$

### Proportion CI (conservative)

$$p \in \left[\hat{p} - u_{1-\alpha/2}\frac{1}{2\sqrt{n}},\ \hat{p} + u_{1-\alpha/2}\frac{1}{2\sqrt{n}}\right]$$

### Required $n$ for Precision $\delta$

$$n = \left(\frac{u_{1-\alpha/2} \cdot \sigma}{\delta}\right)^2$$

---

## 7. Hypothesis Testing

### Conformity ($H_0: \mu = \mu_0$)

| Context | Statistic | Distribution | R |
|---|---|---|---|
| $\sigma$ known | $Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | `z.test()` |
| $\sigma$ unknown | $T = \frac{\bar{X}-\mu_0}{S'/\sqrt{n}}$ | $t_{n-1}$ | `t.test(x, mu=m0)` |

### Homogeneity ($H_0: \mu_1 = \mu_2$)

$D = \bar{X}_1 - \bar{X}_2$

| Context | $\sigma_D$ | Distribution |
|---|---|---|
| $\sigma$ known, equal | $\sigma\sqrt{1/n_1 + 1/n_2}$ | $\mathcal{N}(0,1)$ |
| $\sigma$ unknown, equal | $\hat{\sigma}\sqrt{1/n_1+1/n_2}$ with $\hat{\sigma}^2 = \frac{(n_1-1)s_1'^2+(n_2-1)s_2'^2}{n_1+n_2-2}$ | $t_{n_1+n_2-2}$ |
| $\sigma$ unknown, unequal | $\sqrt{s_1'^2/n_1 + s_2'^2/n_2}$ | $t_\nu$ (Welch) |

**Welch df**: $\frac{1}{\nu} = \frac{1}{n_1-1}\left(\frac{s_1'^2/n_1}{\hat{\sigma}_D^2}\right)^2 + \frac{1}{n_2-1}\left(\frac{s_2'^2/n_2}{\hat{\sigma}_D^2}\right)^2$

### Decision

- **CI method**: Reject $H_0$ if observed statistic $\notin$ acceptance region
- **p-value method**: Reject $H_0$ if p-value $< \alpha$

### Power

Power $= 1 - \beta = P(\text{reject } H_0 \mid H_1 \text{ true})$

---

## 8. Random Vectors

$$\boldsymbol{\mu} = E[\mathbf{X}] = (E[X_1], \ldots, E[X_n])^T$$

$$\Sigma_{ij} = Cov(X_i, X_j) \qquad \text{(covariance matrix)}$$

$$E[\mathbf{AX}+\mathbf{b}] = \mathbf{A}\boldsymbol{\mu}+\mathbf{b}$$

$$Var(\mathbf{AX}+\mathbf{b}) = \mathbf{A}\boldsymbol{\Sigma}\mathbf{A}^T$$

$$Var(\mathbf{a}^T\mathbf{X}) = \mathbf{a}^T\boldsymbol{\Sigma}\mathbf{a} \quad \text{(scalar result)}$$

**Gaussian vector**: All linear combinations of components are normal. Components independent iff $\Sigma$ diagonal.

---

## 9. Key R Functions

```
mean(x)              sd(x)               var(x)
qnorm(p)             qt(p, df)           qchisq(p, df)
pnorm(x)             pt(x, df)           pchisq(x, df)
dnorm(x)             dbinom(k, n, p)     dpois(k, lambda)
rnorm(n, m, s)       rbinom(n, size, p)  rexp(n, rate)
tapply(v, g, fun)    t.test(x, mu=m0)    shapiro.test(x)
dmultinom(x, prob)   rmultinom(n, size, prob)
```
