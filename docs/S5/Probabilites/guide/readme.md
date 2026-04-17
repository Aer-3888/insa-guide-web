---
title: "Probabilites -- Course Guide"
sidebar_position: 0
---

# Probabilites -- Course Guide

> INSA Rennes 3e annee -- Departement Informatique
> Enseignants : Marie Babel, Laurence Roze, Caio Corro

## Course Structure

This course covers probability theory and statistics for computer science, from foundational axioms through confidence intervals, hypothesis testing, and multivariate distributions. The R programming language is used throughout for computation and simulation.

**Grading**: DS (written exam, 2 hours) -- calculation-heavy, formula sheets not provided.

## Chapter Navigation

| # | Chapter | Key Topics | File |
|---|---------|------------|------|
| 1 | [Probability Foundations](/S5/Probabilites/guide/01-probability-foundations) | Sample spaces, axioms, conditional probability, Bayes | `01-probability-foundations.md` |
| 2 | [Discrete Random Variables](/S5/Probabilites/guide/02-discrete-random-variables) | PMF, CDF, Bernoulli, Binomial, Poisson, Geometric | `02-discrete-random-variables.md` |
| 3 | [Continuous Random Variables](/S5/Probabilites/guide/03-continuous-random-variables) | PDF, CDF, Uniform, Exponential, Normal, Gamma | `03-continuous-random-variables.md` |
| 4 | [Limit Theorems](/S5/Probabilites/guide/04-limit-theorems) | Law of Large Numbers, Central Limit Theorem, Chebyshev | `04-limit-theorems.md` |
| 5 | [Confidence Intervals](/S5/Probabilites/guide/05-confidence-intervals) | Mean CI, Variance CI, Proportion CI, Chi-squared, Student | `05-confidence-intervals.md` |
| 6 | [Hypothesis Testing](/S5/Probabilites/guide/06-hypothesis-testing) | Conformity, Homogeneity, p-value, Power analysis | `06-hypothesis-testing.md` |
| 7 | [Joint Distributions and Random Vectors](/S5/Probabilites/guide/07-joint-distributions) | Joint/Marginal/Conditional, Multinomial, Gaussian vectors | `07-joint-distributions.md` |
| 8 | [R Programming for Statistics](/S5/Probabilites/guide/08-r-programming) | Syntax, distributions, plotting, statistical functions | `08-r-programming.md` |

## How to Use This Guide

1. **First pass**: Read each chapter's theory section and key formulas
2. **Practice**: Work through the worked examples with pen and paper
3. **Lab work**: Cross-reference with the [exercise solutions](../exercises/) for R implementations
4. **Exam prep**: Use the [cheat sheets](#cheat-sheets) and [exam prep materials](../exam-prep/)

## Quick Formula Reference

### Distribution Summary Table

| Distribution | Notation | PMF/PDF | $E[X]$ | $Var(X)$ | R prefix |
|---|---|---|---|---|---|
| Bernoulli | $\mathcal{B}(p)$ | $P(X=k) = p^k(1-p)^{1-k}$ | $p$ | $p(1-p)$ | `binom` (size=1) |
| Binomial | $\mathcal{B}(n,p)$ | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ | `binom` |
| Poisson | $\mathcal{P}(\lambda)$ | $e^{-\lambda}\lambda^k / k!$ | $\lambda$ | $\lambda$ | `pois` |
| Geometric | $\mathcal{G}(p)$ | $p(1-p)^{k-1}$ | $1/p$ | $(1-p)/p^2$ | `geom` |
| Uniform (cont.) | $\mathcal{U}(a,b)$ | $\frac{1}{b-a}\mathbf{1}_{[a,b]}$ | $\frac{a+b}{2}$ | $\frac{(b-a)^2}{12}$ | `unif` |
| Exponential | $\mathcal{E}(\lambda)$ | $\lambda e^{-\lambda x}\mathbf{1}_{x\geq 0}$ | $1/\lambda$ | $1/\lambda^2$ | `exp` |
| Normal | $\mathcal{N}(\mu,\sigma)$ | $\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}$ | $\mu$ | $\sigma^2$ | `norm` |
| Chi-squared | $\chi^2_k$ | (see Ch.5) | $k$ | $2k$ | `chisq` |
| Student | $t_k$ | (see Ch.5) | $0$ (for $k>1$) | $k/(k-2)$ (for $k>2$) | `t` |

### Confidence Interval Cheat Sheet

| Parameter | Condition | Pivot Variable | Distribution | CI Formula |
|---|---|---|---|---|
| $\mu$ | $\sigma$ known | $Z = \frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | $\bar{X} \pm u_{1-\alpha/2} \frac{\sigma}{\sqrt{n}}$ |
| $\mu$ | $\sigma$ unknown | $T = \frac{\bar{X}_n - \mu}{S'/\sqrt{n}}$ | $t_{n-1}$ | $\bar{X} \pm t_{n-1}(1-\alpha/2) \frac{S'}{\sqrt{n}}$ |
| $\sigma^2$ | -- | $\frac{(n-1)S'^2}{\sigma^2}$ | $\chi^2_{n-1}$ | $\left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$ |
| $p$ (proportion) | $n$ large | $Z = \frac{X - np}{\sqrt{np(1-p)}}$ | $\mathcal{N}(0,1)$ | $\hat{p} \pm u_{1-\alpha/2} \frac{1}{2\sqrt{n}}$ |

### Hypothesis Testing Cheat Sheet

| Test Type | Context | Hypotheses | Statistic | Distribution under $H_0$ |
|---|---|---|---|---|
| Conformity | $\sigma$ known | $H_0: \mu=\mu_0$ | $Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ |
| Conformity | $\sigma$ unknown | $H_0: \mu=\mu_0$ | $T = \frac{\bar{X}-\mu_0}{\hat{\sigma}/\sqrt{n}}$ | $t_{n-1}$ |
| Homogeneity | $\sigma_1=\sigma_2$ known | $H_0: \mu_1=\mu_2$ | $Z = \frac{D}{\sigma_D}$ | $\mathcal{N}(0,1)$ |
| Homogeneity | $\sigma_1=\sigma_2$ unknown | $H_0: \mu_1=\mu_2$ | $T = \frac{D}{\hat{\sigma}_D}$ | $t_{n_1+n_2-2}$ |
| Homogeneity | $\sigma_1 \neq \sigma_2$ unknown | $H_0: \mu_1=\mu_2$ | $T = \frac{D}{\hat{\sigma}_D}$ | $t_\nu$ (Welch) |

## Notation Convention

**Important**: In this course, $\mathcal{N}(\mu, \sigma)$ denotes a normal distribution with mean $\mu$ and **standard deviation** $\sigma$ (not variance). This is consistent with R's `rnorm(n, mean, sd)`. Always check whether a problem gives $\sigma$ or $\sigma^2$.

| Symbol | Meaning |
|--------|---------|
| $\bar{X}_n$ | Sample mean $\frac{1}{n}\sum X_i$ |
| $S^2$ | Biased sample variance $\frac{1}{n}\sum(X_i - \bar{X})^2$ |
| $S'^2$ | Unbiased (corrected) variance $\frac{1}{n-1}\sum(X_i - \bar{X})^2$ |
| $u_p$ | Quantile of order $p$ of $\mathcal{N}(0,1)$ |
| $t_k(p)$ | Quantile of order $p$ of Student $t$ with $k$ df |
| $\chi^2_k(p)$ | Quantile of order $p$ of Chi-squared with $k$ df |
| iid | Independent and identically distributed |
