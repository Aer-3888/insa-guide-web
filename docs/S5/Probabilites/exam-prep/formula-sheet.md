---
title: "Fiche de formules -- Probabilites"
sidebar_position: 3
---

# Fiche de formules -- Probabilites

> Imprimez-la et etudiez-la. Vous n'aurez pas acces aux formules pendant l'examen.

---

## 1. Probabilites de base

$$P(\bar{A}) = 1 - P(A)$$

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

$$P(B) = \sum_i P(A_i) P(B \mid A_i) \quad \text{(probabilite totale)}$$

$$P(A_i \mid B) = \frac{P(B \mid A_i) P(A_i)}{\sum_j P(B \mid A_j) P(A_j)} \quad \text{(Bayes)}$$

Independance : $P(A \cap B) = P(A) P(B)$

---

## 2. Variables aleatoires

$$E[X] = \sum_x x P(X=x) = \int x f(x) dx$$

$$Var(X) = E[X^2] - (E[X])^2$$

$$E[aX+b] = aE[X]+b \qquad Var(aX+b) = a^2 Var(X)$$

$$Cov(X,Y) = E[XY] - E[X]E[Y]$$

$X,Y$ independantes $\implies Cov(X,Y)=0$, $Var(X+Y) = Var(X)+Var(Y)$

---

## 3. Tableau des distributions

### Discretes

| Distribution | $P(X=k)$ | $E[X]$ | $Var(X)$ |
|---|---|---|---|
| Bernoulli $\mathcal{B}(p)$ | $p^k(1-p)^{1-k}$ | $p$ | $p(1-p)$ |
| Binomiale $\mathcal{B}(n,p)$ | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Poisson $\mathcal{P}(\lambda)$ | $e^{-\lambda}\lambda^k/k!$ | $\lambda$ | $\lambda$ |
| Hypergeometrique | $\frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}$ | $nK/N$ | -- |

### Continues

| Distribution | Densite | $E[X]$ | $Var(X)$ |
|---|---|---|---|
| Uniforme $\mathcal{U}(a,b)$ | $\frac{1}{b-a}$ sur $[a,b]$ | $\frac{a+b}{2}$ | $\frac{(b-a)^2}{12}$ |
| Exponentielle $\mathcal{E}(\lambda)$ | $\lambda e^{-\lambda x}$, $x \geq 0$ | $1/\lambda$ | $1/\lambda^2$ |
| Normale $\mathcal{N}(\mu,\sigma)$ | $\frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}$ | $\mu$ | $\sigma^2$ |
| Gamma $\Gamma(p,\theta)$ | -- | $p/\theta$ | $p/\theta^2$ |

### Distributions pour l'inference

| Distribution | Definition | $E$ | $Var$ |
|---|---|---|---|
| $\chi^2_k$ | $\sum_{i=1}^k Z_i^2$, $Z_i \sim \mathcal{N}(0,1)$ iid | $k$ | $2k$ |
| $t_k$ (Student) | $Z/\sqrt{U/k}$, $Z \sim \mathcal{N}(0,1)$, $U \sim \chi^2_k$ | $0$ | $k/(k-2)$ |

### Multinomiale

$P(X_1=x_1,\ldots,X_k=x_k) = \frac{n!}{x_1!\cdots x_k!}p_1^{x_1}\cdots p_k^{x_k}$, avec $\sum x_i = n$.

$E[X_i] = np_i$, $Var(X_i) = np_i(1-p_i)$, $Cov(X_i,X_j) = -np_ip_j$.

---

## 4. Theoremes limites

**Tchebychev** : $P(|X - \mu| \geq a) \leq Var(X)/a^2$

**Loi des grands nombres** : $\bar{X}_n \to \mu$ lorsque $n \to \infty$ (necessite $E[X]$ finie)

**Theoreme central limite** : $\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0,1)$

**Approximation normale** : $\mathcal{B}(n,p) \approx \mathcal{N}(np, \sqrt{np(1-p)})$ lorsque $np \geq 5$, $n(1-p) \geq 5$

---

## 5. Estimation ponctuelle

$$\bar{X}_n = \frac{1}{n}\sum X_i \qquad E[\bar{X}_n] = \mu \quad (\text{sans biais})$$

$$S'^2 = \frac{1}{n-1}\sum(X_i - \bar{X})^2 \qquad E[S'^2] = \sigma^2 \quad (\text{sans biais})$$

$$S^2 = \frac{1}{n}\sum(X_i - \bar{X})^2 \qquad E[S^2] = \frac{n-1}{n}\sigma^2 \quad (\text{biaisee !})$$

**Retrouver a partir des sommes** : Etant donne $\sum x_i$ et $\sum x_i^2$ :

$$\bar{x} = \frac{\sum x_i}{n} \qquad S'^2 = \frac{1}{n-1}\left(\sum x_i^2 - n\bar{x}^2\right)$$

---

## 6. Intervalles de confiance

### IC pour la moyenne ($\sigma$ connu)

$$\mu \in \left[\bar{X} - u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}},\ \bar{X} + u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}}\right]$$

### IC pour la moyenne ($\sigma$ inconnu)

$$\mu \in \left[\bar{X} - t_{n-1}(1-\alpha/2)\frac{S'}{\sqrt{n}},\ \bar{X} + t_{n-1}(1-\alpha/2)\frac{S'}{\sqrt{n}}\right]$$

### IC pour la variance

$$\sigma^2 \in \left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$$

### IC pour une proportion (conservatif)

$$p \in \left[\hat{p} - u_{1-\alpha/2}\frac{1}{2\sqrt{n}},\ \hat{p} + u_{1-\alpha/2}\frac{1}{2\sqrt{n}}\right]$$

### Taille $n$ requise pour une precision $\delta$

$$n = \left(\frac{u_{1-\alpha/2} \cdot \sigma}{\delta}\right)^2$$

---

## 7. Tests d'hypotheses

### Conformite ($H_0: \mu = \mu_0$)

| Contexte | Statistique | Distribution | R |
|---|---|---|---|
| $\sigma$ connu | $Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | `z.test()` |
| $\sigma$ inconnu | $T = \frac{\bar{X}-\mu_0}{S'/\sqrt{n}}$ | $t_{n-1}$ | `t.test(x, mu=m0)` |

### Homogeneite ($H_0: \mu_1 = \mu_2$)

$D = \bar{X}_1 - \bar{X}_2$

| Contexte | $\sigma_D$ | Distribution |
|---|---|---|
| $\sigma$ connu, egal | $\sigma\sqrt{1/n_1 + 1/n_2}$ | $\mathcal{N}(0,1)$ |
| $\sigma$ inconnu, egal | $\hat{\sigma}\sqrt{1/n_1+1/n_2}$ avec $\hat{\sigma}^2 = \frac{(n_1-1)s_1'^2+(n_2-1)s_2'^2}{n_1+n_2-2}$ | $t_{n_1+n_2-2}$ |
| $\sigma$ inconnu, inegal | $\sqrt{s_1'^2/n_1 + s_2'^2/n_2}$ | $t_\nu$ (Welch) |

**ddl de Welch** : $\frac{1}{\nu} = \frac{1}{n_1-1}\left(\frac{s_1'^2/n_1}{\hat{\sigma}_D^2}\right)^2 + \frac{1}{n_2-1}\left(\frac{s_2'^2/n_2}{\hat{\sigma}_D^2}\right)^2$

### Decision

- **Methode de l'IC** : Rejeter $H_0$ si la statistique observee $\notin$ zone d'acceptation
- **Methode de la p-valeur** : Rejeter $H_0$ si p-valeur $< \alpha$

### Puissance

Puissance $= 1 - \beta = P(\text{rejeter } H_0 \mid H_1 \text{ vraie})$

---

## 8. Vecteurs aleatoires

$$\boldsymbol{\mu} = E[\mathbf{X}] = (E[X_1], \ldots, E[X_n])^T$$

$$\Sigma_{ij} = Cov(X_i, X_j) \qquad \text{(matrice de covariance)}$$

$$E[\mathbf{AX}+\mathbf{b}] = \mathbf{A}\boldsymbol{\mu}+\mathbf{b}$$

$$Var(\mathbf{AX}+\mathbf{b}) = \mathbf{A}\boldsymbol{\Sigma}\mathbf{A}^T$$

$$Var(\mathbf{a}^T\mathbf{X}) = \mathbf{a}^T\boldsymbol{\Sigma}\mathbf{a} \quad \text{(resultat scalaire)}$$

**Vecteur gaussien** : Toutes les combinaisons lineaires des composantes sont normales. Les composantes sont independantes ssi $\Sigma$ est diagonale.

---

## 9. Fonctions R essentielles

```
mean(x)              sd(x)               var(x)
qnorm(p)             qt(p, df)           qchisq(p, df)
pnorm(x)             pt(x, df)           pchisq(x, df)
dnorm(x)             dbinom(k, n, p)     dpois(k, lambda)
rnorm(n, m, s)       rbinom(n, size, p)  rexp(n, rate)
tapply(v, g, fun)    t.test(x, mu=m0)    shapiro.test(x)
dmultinom(x, prob)   rmultinom(n, size, prob)
```
