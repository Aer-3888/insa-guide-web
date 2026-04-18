---
title: "Chapitre 7 : Distributions jointes et vecteurs aleatoires"
sidebar_position: 7
---

# Chapitre 7 : Distributions jointes et vecteurs aleatoires

## 7.1 Vecteurs aleatoires

Un **vecteur aleatoire** $\mathbf{X} = (X_1, X_2, \ldots, X_n)$ est un $n$-uplet de variables aleatoires definies sur le meme espace probabilise. Il associe les resultats $\omega \in \Omega$ a des elements de $\mathbb{R}^n$.

**Exemples** :
- Nombre de defauts dans $M$ regions d'une puce semiconductrice (discret)
- (Taille, Poids, Age) d'un etudiant choisi au hasard (continu)
- Valeurs RGB d'un pixel (dimensions mixtes)

---

## 7.2 Distribution jointe

### Cas discret

La **loi jointe** donne les probabilites pour toutes les combinaisons :

$$P(X_1 = x_1, X_2 = x_2, \ldots, X_n = x_n)$$

Dans le cas bivariate, cela peut s'ecrire sous forme de **tableau de probabilites** :

|  | $Y=0$ | $Y=5$ | $Y=10$ | $Y=15$ |
|---|---|---|---|---|
| $X=0$ | 0.02 | 0.06 | 0.02 | 0.10 |
| $X=5$ | 0.04 | 0.15 | 0.20 | 0.10 |
| $X=10$ | 0.01 | 0.15 | 0.14 | 0.01 |

Verification : toutes les valeurs somment a 1.

### Cas continu

La **densite jointe** satisfait :

$$P(\mathbf{X} \in A) = \int \cdots \int_A f(x_1, x_2, \ldots, x_n)\, dx_1\, dx_2 \cdots dx_n$$

avec $f \geq 0$ et $\int_{\mathbb{R}^n} f = 1$.

### Fonction de repartition jointe

$$F_{\mathbf{X}}(x_1, \ldots, x_n) = P(X_1 \leq x_1, X_2 \leq x_2, \ldots, X_n \leq x_n)$$

Pour les vecteurs continus : $f(x_1, \ldots, x_n) = \frac{\partial^n F}{\partial x_1 \cdots \partial x_n}$.

---

## 7.3 Distributions marginales

La **distribution marginale** de $X$ est obtenue en « sommant » (ou en integrant sur) les autres variables.

### Cas discret

$$P(X = x) = \sum_y P(X = x, Y = y)$$

En R : `apply(prob_matrix, 1, sum)` pour les marginales en ligne (X), `apply(prob_matrix, 2, sum)` pour les marginales en colonne (Y).

### Cas continu

$$f_X(x) = \int_{\mathbb{R}} f(x, y)\, dy$$

### Exemple corrige

A partir du tableau ci-dessus, marginale de $X$ :
- $P(X=0) = 0.02 + 0.06 + 0.02 + 0.10 = 0.20$
- $P(X=5) = 0.04 + 0.15 + 0.20 + 0.10 = 0.49$
- $P(X=10) = 0.01 + 0.15 + 0.14 + 0.01 = 0.31$

---

## 7.4 Distributions conditionnelles

### Cas discret

$$P(X = x_i \mid Y = y_k) = \frac{P(X = x_i, Y = y_k)}{P(Y = y_k)}$$

### Cas continu

$$f(x \mid y) = \frac{f(x, y)}{f_Y(y)}$$

### Exemple corrige

$P(X \mid Y = 5)$ : D'abord, $P(Y=5) = 0.06 + 0.15 + 0.15 = 0.36$.

- $P(X=0 \mid Y=5) = 0.06/0.36 = 1/6$
- $P(X=5 \mid Y=5) = 0.15/0.36 = 5/12$
- $P(X=10 \mid Y=5) = 0.15/0.36 = 5/12$

---

## 7.5 Independance

Les variables aleatoires $X_1, \ldots, X_n$ sont **independantes** si et seulement si :

$$f_{\mathbf{X}}(x_1, \ldots, x_n) = f_{X_1}(x_1) \cdots f_{X_n}(x_n)$$

De maniere equivalente : $F_{\mathbf{X}}(x_1, \ldots, x_n) = F_{X_1}(x_1) \cdots F_{X_n}(x_n)$.

**Convolution** : Si $X$ et $Y$ sont independantes, alors $Z = X + Y$ a pour densite :

$$g_Z(z) = \int_{-\infty}^{+\infty} f_X(z - y) f_Y(y)\, dy = (f_X * f_Y)(z)$$

---

## 7.6 Vecteur moyenne et matrice de covariance

### Vecteur moyenne

$$\boldsymbol{\mu}_{\mathbf{X}} = E[\mathbf{X}] = \begin{pmatrix} E[X_1] \\ \vdots \\ E[X_n] \end{pmatrix}$$

**Transformation lineaire** : $E[\mathbf{A}\mathbf{X} + \mathbf{b}] = \mathbf{A}E[\mathbf{X}] + \mathbf{b}$

### Matrice de covariance

$$\boldsymbol{\Sigma}_{\mathbf{X}} = Var(\mathbf{X}) = E[(\mathbf{X} - E[\mathbf{X}])(\mathbf{X} - E[\mathbf{X}])^T]$$

$$\boldsymbol{\Sigma}_{\mathbf{X}} = \begin{pmatrix} \sigma^2(X_1) & Cov(X_1, X_2) & \cdots & Cov(X_1, X_n) \\ Cov(X_2, X_1) & \sigma^2(X_2) & & \vdots \\ \vdots & & \ddots & \\ Cov(X_n, X_1) & \cdots & & \sigma^2(X_n) \end{pmatrix}$$

Proprietes :
- **Symetrique** : $\boldsymbol{\Sigma}^T = \boldsymbol{\Sigma}$
- **Semi-definie positive** : $\mathbf{y}^T \boldsymbol{\Sigma} \mathbf{y} \geq 0$ pour tout $\mathbf{y}$
- Si les variables sont mutuellement independantes, $\boldsymbol{\Sigma}$ est **diagonale**
- **Inverse** : matrice de precision (utilisee en regression)

**Transformation lineaire** : $Var(\mathbf{A}\mathbf{X} + \mathbf{b}) = \mathbf{A} \boldsymbol{\Sigma}_{\mathbf{X}} \mathbf{A}^T$

### Exemple corrige

> $\mathbf{X} = (X_1, X_2)$ avec matrice de covariance $\Sigma = \begin{pmatrix} 4 & 1 \\ 1 & 2 \end{pmatrix}$. Trouver $Var(Y)$ ou $Y = 3X_1 + 4X_2$.

$Y = \mathbf{a}^T \mathbf{X}$ avec $\mathbf{a} = (3, 4)^T$.

$$Var(Y) = \mathbf{a}^T \boldsymbol{\Sigma} \mathbf{a} = (3, 4) \begin{pmatrix} 4 & 1 \\ 1 & 2 \end{pmatrix} \begin{pmatrix} 3 \\ 4 \end{pmatrix}$$

$$= (3, 4) \begin{pmatrix} 16 \\ 11 \end{pmatrix} = 48 + 44 = 92$$

---

## 7.7 Loi multinomiale

Extension de la binomiale a $k > 2$ categories.

$n$ epreuves, chacune avec $k$ resultats possibles de probabilites $(p_1, \ldots, p_k)$, $\sum p_i = 1$.

$$P(X_1 = x_1, \ldots, X_k = x_k) = \frac{n!}{x_1! \cdots x_k!} p_1^{x_1} \cdots p_k^{x_k}$$

ou $\sum x_i = n$.

| Propriete | Valeur |
|----------|-------|
| $E[X_i]$ | $np_i$ |
| $Var(X_i)$ | $np_i(1 - p_i)$ |
| $Cov(X_i, X_j)$ | $-np_i p_j$ (pour $i \neq j$) |

**R** : `dmultinom(x, prob=p)` pour la probabilite, `rmultinom(n, size, prob)` pour la simulation.

### Exemple corrige : Roulette

> 12 tours : Rouge (18/38), Noir (18/38), Vert (2/38). Quelle est $P(5\text{ rouges}, 5\text{ noirs}, 2\text{ verts})$ ?

```r
dmultinom(c(5, 5, 2), prob = c(18/38, 18/38, 2/38))
```

---

## 7.8 Vecteurs gaussiens (normaux)

Un vecteur aleatoire $\mathbf{X}$ est **gaussien** si toute combinaison lineaire de ses composantes suit une loi normale.

### Densite normale multivariee

$\mathbf{X} \sim \mathcal{N}(\boldsymbol{\mu}, \boldsymbol{\Sigma})$ avec $\boldsymbol{\Sigma}$ inversible :

$$f(x_1, \ldots, x_n) = \frac{1}{(2\pi)^{n/2} |\boldsymbol{\Sigma}|^{1/2}} \exp\left(-\frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^T \boldsymbol{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})\right)$$

### Proprietes cles

1. **Les marginales sont gaussiennes** : Si $\mathbf{X}$ est gaussien, chaque $X_i$ suit une loi normale.
2. **Transformations lineaires** : $\mathbf{Y} = \mathbf{A}\mathbf{X} + \mathbf{b}$ est gaussien avec $E[\mathbf{Y}] = \mathbf{A}\boldsymbol{\mu} + \mathbf{b}$, $Var(\mathbf{Y}) = \mathbf{A}\boldsymbol{\Sigma}\mathbf{A}^T$.
3. **Independance = non-correlation** : Pour les vecteurs gaussiens, les composantes sont independantes si et seulement si $\boldsymbol{\Sigma}$ est diagonale (non correlees).
4. **Projections scalaires** : $\mathbf{a}^T \mathbf{X} = \sum a_i X_i \sim \mathcal{N}(\sum a_i \mu_i, \sum a_i^2 \sigma_i^2)$ (si les composantes sont independantes).

### TCL multivariate

Si $\mathbf{X}_1, \ldots, \mathbf{X}_N$ sont des vecteurs aleatoires iid dans $\mathbb{R}^n$ de moyenne $\mathbf{m}$ et de covariance $\boldsymbol{\Sigma}$ :

$$\sqrt{N}(\bar{\mathbf{X}}_N - \mathbf{m}) \xrightarrow{d} \mathcal{N}(\mathbf{0}, \boldsymbol{\Sigma})$$

---

## 7.9 Exemple de loi normale bivariee

> Trouver la marginale de $X$ a partir de $f_{X,Y}(x,y) = \frac{1}{2\pi}e^{-(x^2+y^2)/2}$.

$$f_X(x) = \int_{-\infty}^{+\infty} \frac{1}{2\pi}e^{-(x^2+y^2)/2}\, dy = \frac{1}{\sqrt{2\pi}}e^{-x^2/2} \cdot \underbrace{\int_{-\infty}^{+\infty} \frac{1}{\sqrt{2\pi}}e^{-y^2/2}\, dy}_{=1}$$

$$f_X(x) = \frac{1}{\sqrt{2\pi}}e^{-x^2/2}$$

Donc $X \sim \mathcal{N}(0, 1)$. Par symetrie, $Y \sim \mathcal{N}(0, 1)$.

Comme $f(x,y) = f_X(x) \cdot f_Y(y)$, $X$ et $Y$ sont **independantes**.

---

## AIDE-MEMOIRE -- Distributions jointes

| Concept | Discret | Continu |
|---------|----------|------------|
| Jointe | $P(X=x, Y=y)$ | $f_{X,Y}(x,y)$ |
| Marginale de $X$ | $\sum_y P(X=x, Y=y)$ | $\int f(x,y)\, dy$ |
| Conditionnelle | $P(X=x\mid Y=y) = \frac{P(X=x,Y=y)}{P(Y=y)}$ | $f(x\mid y) = \frac{f(x,y)}{f_Y(y)}$ |
| Independance | $P(X,Y) = P(X)P(Y)$ | $f(x,y) = f_X(x)f_Y(y)$ |

| Propriete du vecteur aleatoire | Formule |
|---|---|
| Vecteur moyenne | $\boldsymbol{\mu} = (E[X_1], \ldots, E[X_n])^T$ |
| Matrice de covariance | $\Sigma_{ij} = Cov(X_i, X_j)$ |
| Transf. lineaire (moyenne) | $E[\mathbf{AX}+\mathbf{b}] = \mathbf{A}\boldsymbol{\mu}+\mathbf{b}$ |
| Transf. lineaire (variance) | $Var(\mathbf{AX}+\mathbf{b}) = \mathbf{A}\boldsymbol{\Sigma}\mathbf{A}^T$ |
| $Var(\mathbf{a}^T\mathbf{X})$ | $\mathbf{a}^T\boldsymbol{\Sigma}\mathbf{a}$ |

| Propriete multinomiale | Formule |
|---|---|
| $E[X_i]$ | $np_i$ |
| $Var(X_i)$ | $np_i(1-p_i)$ |
| R : probabilite | `dmultinom(c(x1,...,xk), prob=c(p1,...,pk))` |
| R : simulation | `rmultinom(n, size, prob)` |
