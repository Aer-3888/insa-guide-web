---
title: "Chapitre 4 : Theoremes limites"
sidebar_position: 4
---

# Chapitre 4 : Theoremes limites

## 4.1 Contexte et mise en place

Considerons un processus ou l'on repete une experience un grand nombre de fois :

- Chaque realisation est un tirage d'une variable aleatoire $X_i$
- Les $X_i$ sont **iid** (independantes et identiquement distribuees) avec $E[X_i] = \mu$, $Var(X_i) = \sigma^2$

La **moyenne empirique** est :

$$\bar{X}_n = \frac{1}{n}\sum_{i=1}^{n} X_i$$

Proprietes cles de $\bar{X}_n$ :

$$E[\bar{X}_n] = \mu \qquad Var(\bar{X}_n) = \frac{\sigma^2}{n}$$

**Intuition** : Moyenner reduit la variabilite. La moyenne de $\bar{X}_n$ est egale a la moyenne de $X$, mais sa variance decroit en $1/n$.

---

## 4.2 Inegalite de Tchebychev

Pour **toute** distribution ayant une moyenne et une variance finies :

$$P(|X - E[X]| \geq a) \leq \frac{Var(X)}{a^2}$$

De maniere equivalente, en termes d'ecarts-types :

$$P(|X - E[X]| < k\sigma) > 1 - \frac{1}{k^2}$$

| $k$ (ecarts-types) | Borne inferieure de $P(|X - \mu| < k\sigma)$ |
|---|---|
| 2 | $\geq 75\%$ |
| 3 | $\geq 89\%$ |
| 4 | $\geq 93.75\%$ |

**Interpretation** : Pour toute distribution, au moins 75% des valeurs se trouvent dans un intervalle de 2 ecarts-types autour de la moyenne. C'est une borne universelle, mais souvent tres lache.

### Application a $\bar{X}_n$

En appliquant Tchebychev a la moyenne empirique :

$$P(|\bar{X}_n - \mu| > k\sigma) \leq \frac{1}{nk^2}$$

La borne diminue lorsque $n$ augmente -- c'est le fondement de la LGN.

### Exemple corrige

> Pour $X \sim \mathcal{E}(1)$ ($\mu = 1$, $\sigma = 1$), calculer la valeur exacte de $P(|X - 1| < k)$ pour $k = 1, 2, 3$.

$$P(|X - 1| < k) = P(1-k < X < 1+k)$$

Comme la densite exponentielle est nulle pour $x < 0$ :

$$P(|X - 1| < k) = \int_0^{1+k} e^{-x}\, dx = 1 - e^{-(1+k)}$$

| $k$ | Borne de Tchebychev | Valeur exacte |
|---|---|---|
| 1 | $\geq 0\%$ | 86% |
| 2 | $\geq 75\%$ | 95% |
| 3 | $\geq 89\%$ | 98% |

Les valeurs exactes sont bien meilleures que la borne de Tchebychev, ce qui illustre que la borne est universelle mais conservative.

---

## 4.3 Loi des grands nombres (LGN)

### Enonce

Soit $X_1, X_2, \ldots, X_n$ des v.a. iid avec $E[X_i] = \mu$ et $Var(X_i) = \sigma^2 < \infty$. Alors :

$$\forall \varepsilon > 0, \quad \lim_{n \to \infty} P(|\bar{X}_n - \mu| > \varepsilon) = 0$$

**En termes simples** : La moyenne empirique converge vers la moyenne theorique lorsque $n \to \infty$.

### Esquisse de preuve (via Tchebychev)

$$P(|\bar{X}_n - \mu| > \varepsilon) \leq \frac{Var(\bar{X}_n)}{\varepsilon^2} = \frac{\sigma^2}{n\varepsilon^2} \xrightarrow{n \to \infty} 0$$

### Conditions

La LGN necessite que $E[X]$ soit **finie**. Contre-exemple : la loi de Cauchy n'a pas de moyenne finie, et $\bar{X}_n$ NE converge PAS.

### Consequences pratiques

1. **Estimer des probabilites** : Utiliser la variable indicatrice $Y_i = \mathbf{1}_{X_i \in C}$. Alors $\bar{Y}_n \to P(X \in C)$ lorsque $n \to \infty$.
2. **Estimer des densites** : $f(a) \approx \bar{Y}_n / (2h)$ ou $Y_i = \mathbf{1}_{X_i \in (a-h, a+h)}$.
3. **Methodes de Monte-Carlo** : Approximer des integrales par echantillonnage.

---

## 4.4 Theoreme central limite (TCL)

### Enonce

Soit $X_1, \ldots, X_n$ des v.a. iid avec $E[X_i] = \mu$ et $Var(X_i) = \sigma^2$. On definit la moyenne centree reduite :

$$Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}}$$

Alors lorsque $n \to \infty$ :

$$Z_n \xrightarrow{d} \mathcal{N}(0, 1)$$

De maniere equivalente :

$$\bar{X}_n \underset{n \to \infty}{\sim} \mathcal{N}\left(\mu, \frac{\sigma}{\sqrt{n}}\right)$$

### Idee cle

Le TCL nous indique **la forme de la distribution** de $\bar{X}_n$ -- elle est approximativement normale, quelle que soit la distribution d'origine de $X$.

| Theoreme | Ce qu'il donne |
|---------|---------------|
| LGN | Une **valeur** (la moyenne) vers laquelle $\bar{X}_n$ converge |
| TCL | Une **distribution** ($\mathcal{N}$) qui decrit les fluctuations de $\bar{X}_n$ autour de $\mu$ |

### Intuition visuelle

Pour toute distribution de depart (gamma, bimodale, uniforme, etc.) :
- $\bar{X}_1 = X_1$ suit la distribution d'origine
- $\bar{X}_5$ commence a avoir une forme de cloche
- $\bar{X}_{30}$ est tres proche d'une normale
- La dispersion diminue comme $\sigma / \sqrt{n}$

### Centrage-reduction

Pour comparer des variables de differentes echelles, on centre et reduit :

$$Z_n = \frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}}$$

Verification : $E[Z_n] = 0$, $Var(Z_n) = 1$.

---

## 4.5 Exemples corriges

### Exemple 1 : Loi Gamma

> 500 tirages de $\Gamma(2, 1)$ ($\mu = 2$, $\sigma^2 = 2$). Apres $n = 400$ tirages : $\bar{X}_{400} = 1.99$. Apres $n = 500$ tirages : $\bar{X}_{500} = 2.06$. La valeur $\bar{X}_{500} = 2.06$ est-elle inhabituelle ?

Par le TCL : $\bar{X}_{500} \sim \mathcal{N}\left(2, \frac{\sqrt{2}}{\sqrt{500}}\right)$.

$$P(\bar{X}_{500} \geq 2.06) = 1 - \text{pnorm}(2.06, \text{mean}=2, \text{sd}=\sqrt{2/500})$$

$$= 1 - \text{pnorm}(2.06, 2, 0.0632) \approx 0.171$$

17% de chances d'etre au-dessus de 2.06 -- rien de particulierement inhabituel.

**Lecon** : Ne pas comparer les ecarts bruts sans tenir compte de $n$. L'ecart de 0.06 a $n=500$ est en realite plus « normal » que ce que l'ecart de 0.01 a $n=400$ suggere.

### Exemple 2 : Erreurs d'arrondi

> 100 transactions arrondies a l'entier le plus proche. Erreur $X_i \sim \mathcal{U}(-0.5, 0.5)$ avec $\mu = 0$, $\sigma^2 = 1/12$. Trouver $P(|Y| > 10)$ ou $Y = \sum_{i=1}^{100} X_i$.

Etape 1 : $\bar{X}_{100} \sim \mathcal{N}(0, \sqrt{1/1200})$ par le TCL.

Etape 2 : $Y = 100\bar{X}_{100} \sim \mathcal{N}(0, \sqrt{100/12}) = \mathcal{N}(0, \sqrt{100 \cdot 1/12})$.

Etape 3 :
$$P(|Y| > 10) = P(Y < -10) + P(Y > 10)$$
$$= \text{pnorm}(-10, 0, \sqrt{100/12}) + 1 - \text{pnorm}(10, 0, \sqrt{100/12})$$
$$\approx 0.00053$$

---

## 4.6 Approximation normale de la loi binomiale

Lorsque $X \sim \mathcal{B}(n, p)$ avec $n$ grand :

$$X \approx \mathcal{N}(np, \sqrt{np(1-p)})$$

**Conditions** (regle empirique) : $n \geq 30$, $np \geq 5$, $n(1-p) \geq 5$.

### Correction de continuite

Comme la binomiale est discrete et la normale est continue :

| Exacte (Binomiale) | Approximation (Normale) |
|---|---|
| $P(X = k)$ | $P(k - 0.5 < X < k + 0.5)$ |
| $P(X \geq k)$ | $P(X > k - 0.5)$ |
| $P(X \leq k)$ | $P(X < k + 0.5)$ |

---

## 4.7 Resume : LGN vs TCL

| | Loi des grands nombres | Theoreme central limite |
|---|---|---|
| **Donne** | Une valeur ($\mu$) | Une distribution ($\mathcal{N}$) |
| **Enonce** | $\bar{X}_n \to \mu$ | $\bar{X}_n \sim \mathcal{N}(\mu, \sigma/\sqrt{n})$ |
| **Condition** | $E[X]$ finie | $E[X]$ et $Var(X)$ finies |
| **Utilite** | Justifie le calcul de moyennes | Quantifie l'incertitude |

---

## AIDE-MEMOIRE -- Theoremes limites

| Resultat | Formule |
|--------|---------|
| $E[\bar{X}_n]$ | $\mu$ |
| $Var(\bar{X}_n)$ | $\sigma^2/n$ |
| Tchebychev | $P(\|X - \mu\| \geq a) \leq Var(X)/a^2$ |
| LGN | $P(\|\bar{X}_n - \mu\| > \varepsilon) \leq \sigma^2/(n\varepsilon^2) \to 0$ |
| TCL | $Z_n = (\bar{X}_n - \mu)/(\sigma/\sqrt{n}) \to \mathcal{N}(0,1)$ |
| Centrer-reduire | $Z = (X - \mu)/\sigma$ |
| Approx. binomiale | $\mathcal{B}(n,p) \approx \mathcal{N}(np, \sqrt{np(1-p)})$ lorsque $np\geq 5$, $n(1-p)\geq 5$ |
