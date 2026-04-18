---
title: "Probabilites -- Guide de cours"
sidebar_position: 0
---

# Probabilites -- Guide de cours

> INSA Rennes 3e annee -- Departement Informatique
> Enseignants : Marie Babel, Laurence Roze, Caio Corro

## Structure du cours

Ce cours couvre la theorie des probabilites et les statistiques pour l'informatique, depuis les axiomes fondamentaux jusqu'aux intervalles de confiance, les tests d'hypotheses et les distributions multivariees. Le langage R est utilise tout au long du cours pour les calculs et les simulations.

**Evaluation** : DS (examen ecrit, 2 heures) -- beaucoup de calculs, formulaires non fournis.

## Navigation par chapitre

| # | Chapitre | Sujets cles | Fichier |
|---|---------|------------|------|
| 1 | [Fondements des probabilites](/S5/Probabilites/guide/01-probability-foundations) | Espaces probabilises, axiomes, probabilite conditionnelle, Bayes | `01-probability-foundations.md` |
| 2 | [Variables aleatoires discretes](/S5/Probabilites/guide/02-discrete-random-variables) | Loi de probabilite, CDF, Bernoulli, Binomiale, Poisson, Geometrique | `02-discrete-random-variables.md` |
| 3 | [Variables aleatoires continues](/S5/Probabilites/guide/03-continuous-random-variables) | Densite, CDF, Uniforme, Exponentielle, Normale, Gamma | `03-continuous-random-variables.md` |
| 4 | [Theoremes limites](/S5/Probabilites/guide/04-limit-theorems) | Loi des grands nombres, Theoreme central limite, Tchebychev | `04-limit-theorems.md` |
| 5 | [Intervalles de confiance](/S5/Probabilites/guide/05-confidence-intervals) | IC pour la moyenne, IC pour la variance, IC pour une proportion, Chi-deux, Student | `05-confidence-intervals.md` |
| 6 | [Tests d'hypotheses](/S5/Probabilites/guide/06-hypothesis-testing) | Conformite, Homogeneite, p-valeur, Puissance du test | `06-hypothesis-testing.md` |
| 7 | [Distributions jointes et vecteurs aleatoires](/S5/Probabilites/guide/07-joint-distributions) | Jointe/Marginale/Conditionnelle, Multinomiale, Vecteurs gaussiens | `07-joint-distributions.md` |
| 8 | [Programmation R pour les statistiques](/S5/Probabilites/guide/08-r-programming) | Syntaxe, distributions, graphiques, fonctions statistiques | `08-r-programming.md` |

## Comment utiliser ce guide

1. **Premiere lecture** : Lire la theorie et les formules cles de chaque chapitre
2. **Pratique** : Travailler les exemples corriges avec papier et crayon
3. **Travaux pratiques** : Croiser avec les [solutions des exercices](../exercises/) pour les implementations en R
4. **Preparation examen** : Utiliser les [fiches de formules](#fiches-de-formules) et les [materiaux de preparation a l'examen](../exam-prep/)

## Reference rapide des formules

### Tableau recapitulatif des distributions

| Distribution | Notation | PMF/PDF | $E[X]$ | $Var(X)$ | Prefixe R |
|---|---|---|---|---|---|
| Bernoulli | $\mathcal{B}(p)$ | $P(X=k) = p^k(1-p)^{1-k}$ | $p$ | $p(1-p)$ | `binom` (size=1) |
| Binomiale | $\mathcal{B}(n,p)$ | $\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ | `binom` |
| Poisson | $\mathcal{P}(\lambda)$ | $e^{-\lambda}\lambda^k / k!$ | $\lambda$ | $\lambda$ | `pois` |
| Geometrique | $\mathcal{G}(p)$ | $p(1-p)^{k-1}$ | $1/p$ | $(1-p)/p^2$ | `geom` |
| Uniforme (cont.) | $\mathcal{U}(a,b)$ | $\frac{1}{b-a}\mathbf{1}_{[a,b]}$ | $\frac{a+b}{2}$ | $\frac{(b-a)^2}{12}$ | `unif` |
| Exponentielle | $\mathcal{E}(\lambda)$ | $\lambda e^{-\lambda x}\mathbf{1}_{x\geq 0}$ | $1/\lambda$ | $1/\lambda^2$ | `exp` |
| Normale | $\mathcal{N}(\mu,\sigma)$ | $\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}$ | $\mu$ | $\sigma^2$ | `norm` |
| Chi-deux | $\chi^2_k$ | (voir Ch.5) | $k$ | $2k$ | `chisq` |
| Student | $t_k$ | (voir Ch.5) | $0$ (pour $k>1$) | $k/(k-2)$ (pour $k>2$) | `t` |

### Aide-memoire des intervalles de confiance

| Parametre | Condition | Variable pivot | Distribution | Formule de l'IC |
|---|---|---|---|---|
| $\mu$ | $\sigma$ connu | $Z = \frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | $\bar{X} \pm u_{1-\alpha/2} \frac{\sigma}{\sqrt{n}}$ |
| $\mu$ | $\sigma$ inconnu | $T = \frac{\bar{X}_n - \mu}{S'/\sqrt{n}}$ | $t_{n-1}$ | $\bar{X} \pm t_{n-1}(1-\alpha/2) \frac{S'}{\sqrt{n}}$ |
| $\sigma^2$ | -- | $\frac{(n-1)S'^2}{\sigma^2}$ | $\chi^2_{n-1}$ | $\left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$ |
| $p$ (proportion) | $n$ grand | $Z = \frac{X - np}{\sqrt{np(1-p)}}$ | $\mathcal{N}(0,1)$ | $\hat{p} \pm u_{1-\alpha/2} \frac{1}{2\sqrt{n}}$ |

### Aide-memoire des tests d'hypotheses

| Type de test | Contexte | Hypotheses | Statistique | Distribution sous $H_0$ |
|---|---|---|---|---|
| Conformite | $\sigma$ connu | $H_0: \mu=\mu_0$ | $Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ |
| Conformite | $\sigma$ inconnu | $H_0: \mu=\mu_0$ | $T = \frac{\bar{X}-\mu_0}{\hat{\sigma}/\sqrt{n}}$ | $t_{n-1}$ |
| Homogeneite | $\sigma_1=\sigma_2$ connus | $H_0: \mu_1=\mu_2$ | $Z = \frac{D}{\sigma_D}$ | $\mathcal{N}(0,1)$ |
| Homogeneite | $\sigma_1=\sigma_2$ inconnus | $H_0: \mu_1=\mu_2$ | $T = \frac{D}{\hat{\sigma}_D}$ | $t_{n_1+n_2-2}$ |
| Homogeneite | $\sigma_1 \neq \sigma_2$ inconnus | $H_0: \mu_1=\mu_2$ | $T = \frac{D}{\hat{\sigma}_D}$ | $t_\nu$ (Welch) |

## Convention de notation

**Important** : Dans ce cours, $\mathcal{N}(\mu, \sigma)$ designe une loi normale de moyenne $\mu$ et d'**ecart-type** $\sigma$ (et non la variance). Ceci est coherent avec la fonction R `rnorm(n, mean, sd)`. Verifiez toujours si un probleme donne $\sigma$ ou $\sigma^2$.

| Symbole | Signification |
|--------|---------|
| $\bar{X}_n$ | Moyenne empirique $\frac{1}{n}\sum X_i$ |
| $S^2$ | Variance empirique biaisee $\frac{1}{n}\sum(X_i - \bar{X})^2$ |
| $S'^2$ | Variance corrigee (non biaisee) $\frac{1}{n-1}\sum(X_i - \bar{X})^2$ |
| $u_p$ | Quantile d'ordre $p$ de $\mathcal{N}(0,1)$ |
| $t_k(p)$ | Quantile d'ordre $p$ de Student $t$ a $k$ ddl |
| $\chi^2_k(p)$ | Quantile d'ordre $p$ du Chi-deux a $k$ ddl |
| iid | Independantes et identiquement distribuees |
