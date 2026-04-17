---
title: "TD1 -- Estimation"
sidebar_position: 2
---

# TD1 -- Estimation

---

## Exercice 1 : Methode des moments (Geometrique, Gamma, Uniforme)

### 1a) Loi geometrique $\mathcal{G}(p)$

**Enonce :** Trouver l'estimateur de $p$ par la methode des moments.

**Solution :**

La loi geometrique a pour esperance $E(X) = 1/p$.

Par la methode des moments, on egalise le moment theorique au moment empirique :

$$E(X) = \bar{X} \quad \Rightarrow \quad \frac{1}{p} = \bar{X} \quad \Rightarrow \quad \boxed{\hat{p}_{MM} = \frac{1}{\bar{X}}}$$

---

### 1b) Loi Gamma $\Gamma(\alpha, \beta)$

**Enonce :** Trouver les estimateurs de $\alpha$ et $\beta$ par la methode des moments.

**Solution :**

On a $E(X) = \alpha\beta$ et $\text{Var}(X) = \alpha\beta^2$.

Moment 1 : $\alpha\beta = \bar{X}$

Moment 2 : $E(X^2) = \text{Var}(X) + [E(X)]^2 = \alpha\beta^2 + \alpha^2\beta^2$

On a aussi $\text{Var}(X) = \alpha\beta^2 = \frac{1}{n}\sum X_i^2 - \bar{X}^2 = S_n^2$ (variance empirique non corrigee).

$$\hat{\beta}_{MM} = \frac{S_n^2}{\bar{X}}, \quad \hat{\alpha}_{MM} = \frac{\bar{X}}{\hat{\beta}} = \frac{\bar{X}^2}{S_n^2}$$

---

### 1c) Loi uniforme $\mathcal{U}[0, \theta]$

**Enonce :** Trouver l'estimateur de $\theta$ par la methode des moments.

**Solution :**

$E(X) = \theta/2$.

$$\frac{\theta}{2} = \bar{X} \quad \Rightarrow \quad \boxed{\hat{\theta}_{MM} = 2\bar{X}}$$

---

## Exercice 2 : Maximum de vraisemblance

### 2a) Loi geometrique $\mathcal{G}(p)$

**Enonce :** Trouver le MLE de $p$.

**Solution :**

$f(x \mid p) = p(1-p)^{x-1}$ pour $x = 1, 2, 3, \ldots$

$$L(p) = \prod_{i=1}^n p(1-p)^{x_i - 1} = p^n (1-p)^{\sum x_i - n}$$

$$\ell(p) = n \ln p + \left(\sum x_i - n\right) \ln(1-p)$$

$$\frac{d\ell}{dp} = \frac{n}{p} - \frac{\sum x_i - n}{1-p} = 0$$

$$\frac{n}{p} = \frac{\sum x_i - n}{1-p} \quad \Rightarrow \quad n(1-p) = p(\sum x_i - n) \quad \Rightarrow \quad n = p \sum x_i$$

$$\boxed{\hat{p}_{MLE} = \frac{n}{\sum x_i} = \frac{1}{\bar{X}}}$$

Le MLE coincide avec l'estimateur des moments.

### 2b) Loi gaussienne $\mathcal{N}(\mu, \sigma^2)$

$$\ell(\mu, \sigma^2) = -\frac{n}{2}\ln(2\pi) - \frac{n}{2}\ln(\sigma^2) - \frac{1}{2\sigma^2}\sum(x_i - \mu)^2$$

En derivant par rapport a $\mu$ :

$$\frac{\partial \ell}{\partial \mu} = \frac{1}{\sigma^2}\sum(x_i - \mu) = 0 \quad \Rightarrow \quad \hat{\mu}_{MLE} = \bar{X}$$

En derivant par rapport a $\sigma^2$ :

$$\frac{\partial \ell}{\partial \sigma^2} = -\frac{n}{2\sigma^2} + \frac{1}{2\sigma^4}\sum(x_i - \mu)^2 = 0 \quad \Rightarrow \quad \hat{\sigma}^2_{MLE} = \frac{1}{n}\sum(x_i - \bar{x})^2$$

**Attention :** $\hat{\sigma}^2_{MLE}$ divise par $n$, c'est un estimateur **biaise** de $\sigma^2$.

---

## Exercice 3 : Accidents de Poisson

**Enonce :** Le nombre d'accidents par jour suit une loi de Poisson $\mathcal{P}(\lambda)$. Sur 100 jours, on observe la distribution suivante :

| Nb accidents | 0 | 1 | 2 | 3 | 4 | 5+ |
|---|---|---|---|---|---|---|
| Nb jours | 30 | 35 | 20 | 10 | 4 | 1 |

Estimer $\lambda$.

**Solution :**

Pour une loi de Poisson, $E(X) = \lambda$. Par la methode des moments :

$$\hat{\lambda} = \bar{X} = \frac{0 \times 30 + 1 \times 35 + 2 \times 20 + 3 \times 10 + 4 \times 4 + 5 \times 1}{100}$$

$$\hat{\lambda} = \frac{0 + 35 + 40 + 30 + 16 + 5}{100} = \frac{126}{100} = 1.26$$

**Verification en R :**

```r
# Donnees
nb_accidents <- c(rep(0, 30), rep(1, 35), rep(2, 20),
                  rep(3, 10), rep(4, 4), rep(5, 1))
lambda_hat <- mean(nb_accidents)
cat("lambda_hat =", lambda_hat, "\n")  # 1.26
```

---

## Exercice 4 : Methode delta

**Enonce :** Soit $X_1, \ldots, X_n \sim \text{Exp}(\lambda)$. On sait que $\hat{\lambda} = 1/\bar{X}$ et que $\bar{X} \sim \mathcal{N}(1/\lambda, 1/(n\lambda^2))$ asymptotiquement. Construire un IC asymptotique pour $\theta = 1/\lambda = E(X)$.

**Solution :**

On pose $g(\lambda) = 1/\lambda$. On a $g'(\lambda) = -1/\lambda^2$.

Par la methode delta :

$$\sqrt{n}(g(\hat{\lambda}) - g(\lambda)) \xrightarrow{d} \mathcal{N}\left(0, [g'(\lambda)]^2 \cdot \text{Var}(\hat{\lambda}) \cdot n\right)$$

On sait que $\text{Var}(\bar{X}) = 1/(n\lambda^2)$, donc asymptotiquement :

$$\bar{X} \overset{approx}{\sim} \mathcal{N}\left(\frac{1}{\lambda}, \frac{1}{n\lambda^2}\right)$$

L'IC a 95% pour $\theta = 1/\lambda$ est :

$$\bar{X} \pm 1.96 \cdot \frac{1}{\hat{\lambda}\sqrt{n}} = \bar{X} \pm 1.96 \cdot \frac{\bar{X}}{\sqrt{n}}$$

---

## Exercice 5 : Comparaison d'estimateurs (Exponentielle)

**Enonce :** Soit $X_1, \ldots, X_n \sim \text{Exp}(\lambda)$. Comparer les estimateurs $\hat{\lambda}_1 = 1/\bar{X}$ et $\hat{\lambda}_2 = (n-1)/(n\bar{X})$ en termes de biais et MSE.

**Solution :**

**Estimateur $\hat{\lambda}_1 = 1/\bar{X}$ (MLE) :**

Pour $n$ grand, $E(1/\bar{X}) \approx \lambda + \lambda/n$ (biaise). Le biais est $\approx \lambda/n$.

**Estimateur $\hat{\lambda}_2 = (n-1)/(n\bar{X})$ :**

$\hat{\lambda}_2 = \frac{n-1}{n} \hat{\lambda}_1$. Pour $n$ grand, $E(\hat{\lambda}_2) \approx \lambda$ (sans biais).

**Conclusion :** $\hat{\lambda}_2$ est sans biais asymptotiquement, mais les deux convergent vers $\lambda$ quand $n \to \infty$.

---

## Exercice 6 : Loi uniforme $U[k\theta, (k+1)\theta]$

**Enonce :** Soit $X_1, \ldots, X_n \sim U[k\theta, (k+1)\theta]$ avec $k$ connu. Estimer $\theta$.

**Solution :**

$E(X) = \frac{k\theta + (k+1)\theta}{2} = \frac{(2k+1)\theta}{2}$

Par la methode des moments :

$$\bar{X} = \frac{(2k+1)\theta}{2} \quad \Rightarrow \quad \boxed{\hat{\theta} = \frac{2\bar{X}}{2k+1}}$$
