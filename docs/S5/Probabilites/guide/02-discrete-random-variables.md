---
title: "Chapitre 2 : Variables aleatoires discretes"
sidebar_position: 2
---

# Chapitre 2 : Variables aleatoires discretes

## 2.1 Definition

Une **variable aleatoire** $X$ est une fonction $X: \Omega \to \mathbb{R}$ qui associe un nombre reel a chaque resultat d'une experience aleatoire. Elle est **discrete** si elle prend un ensemble fini ou denombrable de valeurs.

### Loi de probabilite (PMF)

Pour une variable $X$ discrete de valeurs $\{x_1, x_2, \ldots\}$ :

$$P(X = x_i) = p_i \quad \text{avec} \quad \sum_i p_i = 1$$

La loi de probabilite determine entierement la distribution : une liste de toutes les valeurs possibles avec leurs probabilites.

### Fonction de repartition (CDF)

$$F_X(x) = P(X \leq x) = \sum_{x_i \leq x} P(X = x_i)$$

Proprietes :
- $F$ est croissante (fonction en escalier pour une v.a. discrete)
- $\lim_{x \to -\infty} F(x) = 0$, $\lim_{x \to +\infty} F(x) = 1$
- $P(a < X \leq b) = F(b) - F(a)$

---

## 2.2 Esperance et variance

### Esperance (moyenne)

L'**esperance** est la moyenne ponderee par les probabilites :

$$E[X] = \sum_{x \in X(\Omega)} x \cdot P(X = x)$$

Proprietes de l'esperance :
- $E[aX + b] = aE[X] + b$ (linearite)
- $E[X + Y] = E[X] + E[Y]$ (toujours, meme si dependantes)
- $E[g(X)] = \sum_x g(x) P(X = x)$ (formule de transfert)

### Variance

La **variance** mesure la dispersion autour de la moyenne :

$$Var(X) = E\left[(X - E[X])^2\right] = E[X^2] - (E[X])^2$$

Proprietes :
- $Var(X) \geq 0$
- $Var(aX + b) = a^2 Var(X)$
- **Ecart-type** : $\sigma(X) = \sqrt{Var(X)}$

### Covariance

$$Cov(X, Y) = E[(X - E[X])(Y - E[Y])] = E[XY] - E[X]E[Y]$$

Si $X$ et $Y$ sont independantes : $Cov(X,Y) = 0$ et $Var(X+Y) = Var(X) + Var(Y)$.

---

## 2.3 Lois discretes classiques

### Loi de Bernoulli $\mathcal{B}(p)$

Variable aleatoire binaire : succes ($X=1$) avec probabilite $p$, echec ($X=0$) avec probabilite $1-p$.

$$P(X = k) = p^k (1-p)^{1-k}, \quad k \in \{0, 1\}$$

| | Valeur |
|---|---|
| $E[X]$ | $p$ |
| $Var(X)$ | $p(1-p)$ |

**Application** : Epreuve unique a deux issues (erreur dans un modele, lancer de piece, detection de defaut).

### Loi binomiale $\mathcal{B}(n, p)$

Somme de $n$ epreuves de Bernoulli independantes : $X = \sum_{i=1}^n X_i$ ou $X_i \sim \mathcal{B}(p)$.

$$P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}, \quad k \in \{0, 1, \ldots, n\}$$

| | Valeur |
|---|---|
| $E[X]$ | $np$ |
| $Var(X)$ | $np(1-p)$ |

**Application** : Nombre de succes en $n$ epreuves independantes (QCM au hasard, articles defectueux dans un lot).

### Loi de Poisson $\mathcal{P}(\lambda)$

Modelise le nombre d'evenements dans un intervalle fixe lorsque les evenements se produisent a un taux moyen constant $\lambda$.

$$P(X = k) = \frac{e^{-\lambda} \lambda^k}{k!}, \quad k \in \{0, 1, 2, \ldots\}$$

| | Valeur |
|---|---|
| $E[X]$ | $\lambda$ |
| $Var(X)$ | $\lambda$ |

**Application** : Nombre de requetes serveur par minute, desintegrations radioactives. Approximation : $\mathcal{B}(n,p) \approx \mathcal{P}(np)$ lorsque $n$ grand, $p$ petit.

### Loi geometrique $\mathcal{G}(p)$

Nombre d'epreuves jusqu'au premier succes.

$$P(X = k) = p(1-p)^{k-1}, \quad k \in \{1, 2, 3, \ldots\}$$

| | Valeur |
|---|---|
| $E[X]$ | $1/p$ |
| $Var(X)$ | $(1-p)/p^2$ |

**Propriete d'absence de memoire** : $P(X > s + t \mid X > s) = P(X > t)$.

### Loi hypergeometrique

Tirage sans remise dans une population finie. On tire $k$ elements d'une population de $N$ elements contenant $K$ succes.

$$P(X = x) = \frac{\binom{K}{x}\binom{N-K}{k-x}}{\binom{N}{k}}$$

| | Valeur |
|---|---|
| $E[X]$ | $k \cdot K/N$ |

**Fonction R** : `dhyper(x, m=K, n=N-K, k)`.

Lorsque $N$ est grand par rapport a $k$, la loi hypergeometrique s'approche de la loi binomiale.

---

## 2.4 Exemples corriges

### Exemple 1 : QCM au hasard

> Un QCM de 10 questions avec 4 choix chacune. Un etudiant repond au hasard. Quelle est $P(\text{reussir})$ si la reussite exige $\geq 6$ bonnes reponses ?

$X \sim \mathcal{B}(10, 0.25)$.

$$P(X \geq 6) = 1 - P(X \leq 5) = 1 - \sum_{k=0}^{5} \binom{10}{k} (0.25)^k (0.75)^{10-k}$$

En R : `1 - pbinom(5, size=10, prob=0.25)` $\approx 0.0197$

Seulement environ 2% de chances de reussir en repondant au hasard.

### Exemple 2 : Probleme de l'urne

> Une urne contient 8 boules rouges et 5 boules noires. On tire 6 boules sans remise. Nombre moyen de boules rouges ?

$X \sim \text{Hypergeometrique}(N=13, K=8, k=6)$.

$$E[X] = k \cdot \frac{K}{N} = 6 \cdot \frac{8}{13} \approx 3.69$$

En R : `sum(0:6 * dhyper(0:6, m=8, n=5, k=6))`.

---

## 2.5 Fonction indicatrice

La **fonction indicatrice** de l'evenement $A$ est :

$$\mathbf{1}_A(\omega) = \begin{cases} 1 & \text{si } \omega \in A \\ 0 & \text{sinon} \end{cases}$$

Propriete utile : $E[\mathbf{1}_A] = P(A)$ et $Var(\mathbf{1}_A) = P(A)(1-P(A))$.

---

## AIDE-MEMOIRE -- Distributions discretes

| Distribution | $P(X=k)$ | $E[X]$ | $Var(X)$ | R : `d*` |
|---|---|---|---|---|
| $\mathcal{B}(p)$ | $p^k(1-p)^{1-k}$ | $p$ | $p(1-p)$ | `dbinom(k,1,p)` |
| $\mathcal{B}(n,p)$ | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ | `dbinom(k,n,p)` |
| $\mathcal{P}(\lambda)$ | $e^{-\lambda}\lambda^k/k!$ | $\lambda$ | $\lambda$ | `dpois(k,lambda)` |
| $\mathcal{G}(p)$ | $p(1-p)^{k-1}$ | $1/p$ | $(1-p)/p^2$ | `dgeom(k-1,p)` |
| Hypergeometrique | $\frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}$ | $nK/N$ | -- | `dhyper(k,K,N-K,n)` |

**Approximations cles** :
- $\mathcal{B}(n,p) \approx \mathcal{P}(np)$ lorsque $n$ grand, $p$ petit
- $\mathcal{B}(n,p) \approx \mathcal{N}(np, \sqrt{np(1-p)})$ lorsque $np \geq 5$ et $n(1-p) \geq 5$
