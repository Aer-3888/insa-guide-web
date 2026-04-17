---
title: "Chapitre 02 -- Estimation statistique"
sidebar_position: 2
---

# Chapitre 02 -- Estimation statistique

> **Idee centrale :** On observe un **echantillon** (une partie) pour deviner les caracteristiques de la **population** (le tout).

**Prerequis :** [Statistiques descriptives](/S6/Statistiques_Descriptives/guide/01-descriptive-statistics)

---

## 1. Analogie : gouter la soupe

Tu prepares une grande marmite de soupe. Pour savoir si elle est assez salee, tu ne bois pas toute la marmite -- tu prends **une cuillere** (echantillon) et tu goutes. A partir de cette cuillere, tu devines le gout de toute la marmite (population).

L'estimation statistique, c'est exactement ca : utiliser un petit bout de donnees pour deviner les parametres de l'ensemble.

---

## 2. Population vs echantillon

| Concept | Population | Echantillon |
|---------|-----------|-------------|
| Taille | $N$ (grande, souvent inconnue) | $n$ (petite, connue) |
| Moyenne | $\mu$ (parametre, fixe, inconnu) | $\bar{x}$ (statistique, varie selon l'echantillon) |
| Variance | $\sigma^2$ (parametre, fixe, inconnu) | $s^2$ (statistique, varie) |
| Proportion | $p$ (parametre) | $\hat{p}$ (statistique) |

**Convention de notation :**
- Lettres **grecques** ($\mu, \sigma, p$) : parametres de la population (inconnus).
- Lettres **latines** ou avec **chapeau** ($\bar{x}, s^2, \hat{p}$) : estimateurs calcules sur l'echantillon.

---

## 3. Estimateurs ponctuels

### 3.1 La moyenne d'echantillon $\bar{X}$

$$\bar{X} = \frac{1}{n} \sum_{i=1}^{n} X_i$$

C'est l'estimateur de $\mu$. Il est **sans biais** : $E(\bar{X}) = \mu$.

### 3.2 La variance corrigee $S^2$

$$S^2 = \frac{1}{n-1} \sum_{i=1}^{n} (X_i - \bar{X})^2$$

C'est l'estimateur de $\sigma^2$. La division par $n-1$ (correction de Bessel) le rend **sans biais** : $E(S^2) = \sigma^2$.

**Pourquoi $n-1$ et pas $n$ ?** Si on divise par $n$, on sous-estime systematiquement $\sigma^2$ car $\bar{X}$ est plus proche des $X_i$ que $\mu$ ne l'est. On perd un "degre de liberte" en estimant $\bar{X}$.

### 3.3 La proportion $\hat{p}$

$$\hat{p} = \frac{\text{nombre de succes}}{n}$$

Estimateur de la proportion $p$ de la population. Sans biais : $E(\hat{p}) = p$.

---

## 4. Proprietes d'un bon estimateur

### 4.1 Sans biais (unbiased)

Un estimateur $\hat{\theta}$ est sans biais si $E(\hat{\theta}) = \theta$.

**Le biais** est : $\text{Biais}(\hat{\theta}) = E(\hat{\theta}) - \theta$.

### 4.2 Convergent (consistent)

Un estimateur est convergent si, quand $n \to \infty$, il converge vers la vraie valeur :

$$\hat{\theta}_n \xrightarrow{P} \theta$$

On peut le montrer avec l'**inegalite de Bienayme-Tchebychev** :

$$P(|\hat{\theta}_n - \theta| \geq \varepsilon) \leq \frac{\text{Var}(\hat{\theta}_n)}{\varepsilon^2}$$

Si $\text{Var}(\hat{\theta}_n) \to 0$, alors $\hat{\theta}_n \xrightarrow{P} \theta$.

### 4.3 Efficace (efficient)

Parmi tous les estimateurs sans biais de $\theta$, le plus **efficace** est celui qui a la plus petite variance.

### 4.4 Erreur quadratique moyenne (MSE)

Le MSE combine biais et variance :

$$\text{MSE}(\hat{\theta}) = E[(\hat{\theta} - \theta)^2] = \text{Var}(\hat{\theta}) + \text{Biais}(\hat{\theta})^2$$

Un estimateur biaise peut avoir un MSE plus faible qu'un estimateur sans biais (tradeoff biais-variance).

---

## 5. Theoreme Central Limite (TCL)

### 5.1 Enonce

Soient $X_1, \ldots, X_n$ des variables i.i.d. de moyenne $\mu$ et variance $\sigma^2$. Alors, quand $n$ est grand :

$$\bar{X}_n \overset{approx}{\sim} \mathcal{N}\left(\mu, \frac{\sigma^2}{n}\right)$$

Ou de facon equivalente :

$$\frac{\bar{X}_n - \mu}{\sigma / \sqrt{n}} \overset{d}{\longrightarrow} \mathcal{N}(0, 1)$$

### 5.2 Ce que ca veut dire

**Quelle que soit** la distribution de depart (meme si elle n'est pas normale !), la moyenne d'un echantillon de taille suffisante suit approximativement une loi normale. C'est le resultat le plus puissant de toute la statistique.

**Regle pratique :** le TCL s'applique raisonnablement quand $n \geq 30$.

### 5.3 Simulation en R

```r
# ── Illustration du TCL ─────────────────────────────────────
set.seed(42)

# Distribution d'origine : exponentielle (tres asymetrique !)
par(mfrow = c(2, 2))
for (n in c(1, 5, 30, 100)) {
  moyennes <- replicate(10000, mean(rexp(n, rate = 1)))
  hist(moyennes,
       breaks = 40, col = "steelblue",
       main = paste("n =", n),
       xlab = "Moyenne", probability = TRUE)
  # Superposer la densite normale theorique
  curve(dnorm(x, mean = 1, sd = 1/sqrt(n)),
        col = "red", lwd = 2, add = TRUE)
}
par(mfrow = c(1, 1))
# Observation : meme pour une exponentielle, des n=30 la distribution
# des moyennes est quasi normale
```

---

## 6. Intervalles de confiance (IC)

### 6.1 Intuition

Un estimateur ponctuel donne un seul nombre ($\bar{x} = 12.5$). Mais quelle est la **precision** de cette estimation ? L'IC donne une **fourchette** : "la vraie moyenne est probablement entre 11.2 et 13.8".

### 6.2 IC pour la moyenne $\mu$ ($\sigma$ inconnu)

C'est le cas le plus courant. On utilise la **loi de Student** :

$$\bar{X} \pm t_{n-1, 1-\alpha/2} \cdot \frac{S}{\sqrt{n}}$$

| Symbole | Signification |
|---------|---------------|
| $\bar{X}$ | Moyenne de l'echantillon |
| $S$ | Ecart-type de l'echantillon |
| $n$ | Taille de l'echantillon |
| $t_{n-1, 1-\alpha/2}$ | Quantile de la loi de Student a $n-1$ degres de liberte |
| $1-\alpha$ | Niveau de confiance (souvent 95%, donc $\alpha = 0.05$) |

```r
# ── IC pour la moyenne ──────────────────────────────────────
donnees <- c(12.1, 11.8, 12.5, 11.9, 12.3, 12.0, 12.4, 11.7)
n <- length(donnees)
alpha <- 0.05

moy <- mean(donnees)
s   <- sd(donnees)
t_crit <- qt(1 - alpha/2, df = n - 1)

ic_bas  <- moy - t_crit * s / sqrt(n)
ic_haut <- moy + t_crit * s / sqrt(n)

cat("Moyenne     :", moy, "\n")
cat("IC a 95%    : [", ic_bas, ",", ic_haut, "]\n")

# Ou directement avec t.test() :
t.test(donnees, conf.level = 0.95)$conf.int
```

### 6.3 IC pour la moyenne $\mu$ ($\sigma$ connu)

Si $\sigma$ est connu (rare en pratique), on utilise la loi normale :

$$\bar{X} \pm z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$$

Avec $z_{0.975} = 1.96$ pour un IC a 95%.

### 6.4 IC pour une proportion $p$

$$\hat{p} \pm z_{1-\alpha/2} \cdot \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$$

Condition d'application : $n\hat{p} \geq 5$ et $n(1-\hat{p}) \geq 5$.

```r
# ── IC pour une proportion ──────────────────────────────────
n_total <- 200
n_succes <- 68
p_hat <- n_succes / n_total
z <- qnorm(0.975)

ic_bas  <- p_hat - z * sqrt(p_hat * (1 - p_hat) / n_total)
ic_haut <- p_hat + z * sqrt(p_hat * (1 - p_hat) / n_total)

cat("Proportion  :", p_hat, "\n")
cat("IC a 95%    : [", ic_bas, ",", ic_haut, "]\n")

# Ou avec prop.test() :
prop.test(n_succes, n_total, conf.level = 0.95)$conf.int
```

### 6.5 Interpretation correcte de l'IC

**CORRECT :** "Si on repetait l'experience un grand nombre de fois, 95% des IC calcules contiendraient la vraie valeur $\mu$."

**INCORRECT :** "Il y a 95% de chances que $\mu$ soit dans cet intervalle." ($\mu$ est fixe, ce n'est pas aleatoire -- c'est l'intervalle qui est aleatoire.)

---

## 7. Methode des moments

### 7.1 Principe

Les **moments theoriques** d'une distribution dependent des parametres. Les **moments empiriques** se calculent sur l'echantillon. On egalise les deux pour estimer les parametres.

- Moment d'ordre 1 : $E(X) = \bar{X}$ (moyenne)
- Moment d'ordre 2 : $E(X^2) = \frac{1}{n}\sum X_i^2$

### 7.2 Exemple : loi exponentielle $\text{Exp}(\lambda)$

On sait que $E(X) = 1/\lambda$. Par la methode des moments :

$$\frac{1}{\hat{\lambda}} = \bar{X} \quad \Rightarrow \quad \hat{\lambda} = \frac{1}{\bar{X}}$$

### 7.3 Exemple : loi normale $\mathcal{N}(\mu, \sigma^2)$

- Moment 1 : $E(X) = \mu \Rightarrow \hat{\mu} = \bar{X}$
- Moment 2 : $\text{Var}(X) = E(X^2) - [E(X)]^2 = \sigma^2 \Rightarrow \hat{\sigma}^2 = \frac{1}{n}\sum(X_i - \bar{X})^2$

### 7.4 Exemple : loi de Bernoulli $\mathcal{B}(p)$

$$E(X) = p \quad \Rightarrow \quad \hat{p} = \bar{X} = \frac{\text{nombre de 1}}{n}$$

---

## 8. Maximum de vraisemblance (MLE)

### 8.1 Principe

La **vraisemblance** mesure "a quel point les donnees observees sont probables" pour une valeur donnee du parametre. Le MLE choisit la valeur du parametre qui **maximise** cette probabilite.

$$L(\theta) = \prod_{i=1}^{n} f(x_i \mid \theta)$$

En pratique, on maximise la **log-vraisemblance** (plus facile a deriver) :

$$\ell(\theta) = \sum_{i=1}^{n} \ln f(x_i \mid \theta)$$

### 8.2 Recette

1. Ecrire la vraisemblance $L(\theta)$.
2. Prendre le logarithme : $\ell(\theta) = \ln L(\theta)$.
3. Deriver par rapport a $\theta$ et egaliser a 0 : $\frac{d\ell}{d\theta} = 0$.
4. Verifier que c'est un maximum (derivee seconde negative).

### 8.3 Exemple : loi de Bernoulli

$f(x_i \mid p) = p^{x_i}(1-p)^{1-x_i}$

$$\ell(p) = \sum_{i=1}^{n} [x_i \ln p + (1-x_i) \ln(1-p)]$$

$$\frac{d\ell}{dp} = \frac{\sum x_i}{p} - \frac{n - \sum x_i}{1-p} = 0$$

$$\hat{p}_{MLE} = \frac{\sum x_i}{n} = \bar{X}$$

### 8.4 Exemple : loi exponentielle $\text{Exp}(\lambda)$

$f(x_i \mid \lambda) = \lambda e^{-\lambda x_i}$

$$\ell(\lambda) = n \ln \lambda - \lambda \sum x_i$$

$$\frac{d\ell}{d\lambda} = \frac{n}{\lambda} - \sum x_i = 0 \quad \Rightarrow \quad \hat{\lambda}_{MLE} = \frac{n}{\sum x_i} = \frac{1}{\bar{X}}$$

### 8.5 Exemple : loi normale $\mathcal{N}(\mu, \sigma^2)$

$$\hat{\mu}_{MLE} = \bar{X}, \quad \hat{\sigma}^2_{MLE} = \frac{1}{n} \sum_{i=1}^{n}(X_i - \bar{X})^2$$

**Attention :** le MLE de $\sigma^2$ divise par $n$ (pas $n-1$), il est donc **biaise**.

---

## 9. Methode delta (normalite asymptotique)

Si $\hat{\theta}_n$ est asymptotiquement normal et $g$ est une fonction derivable avec $g'(\theta) \neq 0$ :

$$\sqrt{n}(\hat{\theta}_n - \theta) \xrightarrow{d} \mathcal{N}(0, \sigma^2) \quad \Rightarrow \quad \sqrt{n}(g(\hat{\theta}_n) - g(\theta)) \xrightarrow{d} \mathcal{N}(0, [g'(\theta)]^2 \sigma^2)$$

**Utilite :** permet de construire des IC pour des fonctions de parametres (ex. IC pour $1/\lambda$ a partir de l'estimateur de $\lambda$).

---

## 10. Pieges classiques

### Piege 1 : Confondre IC et probabilite

L'IC a 95% ne veut **pas** dire que $\mu$ a 95% de chances d'etre dans l'intervalle. $\mu$ est fixe. C'est la methode de construction de l'IC qui garantit que 95% des IC couvriront $\mu$ sur le long terme.

### Piege 2 : Utiliser la loi normale quand $\sigma$ est inconnu

Si $\sigma$ est inconnu (quasiment toujours), on utilise la **loi de Student**, pas la loi normale. Avec $n$ grand, la difference est negligeable.

### Piege 3 : Oublier que le MLE de $\sigma^2$ est biaise

Le MLE divise par $n$, l'estimateur sans biais divise par $n-1$. `var()` en R utilise $n-1$.

### Piege 4 : Appliquer le TCL avec $n$ trop petit

Le TCL est asymptotique. Pour $n < 30$, l'approximation normale peut etre mauvaise, surtout si la distribution est tres asymetrique.

### Piege 5 : Confondre convergence en probabilite et convergence en moyenne

- **Convergence en probabilite** : $P(|\hat{\theta}_n - \theta| > \varepsilon) \to 0$
- **Convergence en moyenne quadratique** : $E[(\hat{\theta}_n - \theta)^2] \to 0$

La convergence en moyenne quadratique implique la convergence en probabilite, mais pas l'inverse.

---

## CHEAT SHEET

### Estimateurs classiques

| Parametre | Estimateur | Sans biais ? | Formule |
|-----------|-----------|-------------|---------|
| $\mu$ | $\bar{X}$ | Oui | $\frac{1}{n}\sum X_i$ |
| $\sigma^2$ | $S^2$ | Oui | $\frac{1}{n-1}\sum(X_i-\bar{X})^2$ |
| $\sigma^2$ | $\hat{\sigma}^2_{MLE}$ | **Non** (biaise par $\frac{n-1}{n}$) | $\frac{1}{n}\sum(X_i-\bar{X})^2$ |
| $p$ | $\hat{p}$ | Oui | $\frac{\text{succes}}{n}$ |
| $\lambda$ (Exp) | $1/\bar{X}$ | Approx. | MLE et moments |

### Intervalles de confiance

| Parametre | IC a $1-\alpha$ | Condition |
|-----------|----------------|-----------|
| $\mu$ ($\sigma$ inconnu) | $\bar{X} \pm t_{n-1,1-\alpha/2} \cdot \frac{S}{\sqrt{n}}$ | Normalite ou $n \geq 30$ |
| $\mu$ ($\sigma$ connu) | $\bar{X} \pm z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$ | Normalite ou $n \geq 30$ |
| $p$ (proportion) | $\hat{p} \pm z_{1-\alpha/2} \cdot \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$ | $n\hat{p} \geq 5$, $n(1-\hat{p}) \geq 5$ |

### Quantiles utiles

| Niveau $\alpha$ | $z_{1-\alpha/2}$ |
|-----------------|-------------------|
| 0.10 | 1.645 |
| 0.05 | 1.960 |
| 0.01 | 2.576 |

### Fonctions R

| Fonction | Usage |
|----------|-------|
| `t.test(x)$conf.int` | IC pour $\mu$ |
| `prop.test(x, n)$conf.int` | IC pour $p$ |
| `qnorm(p)` | Quantile de la loi normale |
| `qt(p, df)` | Quantile de la loi de Student |
| `dnorm()`, `pnorm()`, `rnorm()` | Densite, FDR, simulation |
