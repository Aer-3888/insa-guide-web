---
title: "Chapitre 5 : Intervalles de confiance"
sidebar_position: 5
---

# Chapitre 5 : Intervalles de confiance

## 5.1 Intuition

Un intervalle de confiance (IC) remplace une estimation ponctuelle par un intervalle ayant une probabilite connue de contenir la vraie valeur du parametre.

**Exemple** : Au lieu de dire « le temps de reponse moyen est de 207.5ms », on dit « on est a 95% confiant que le temps de reponse moyen est entre 181ms et 234ms ».

### Definition

Un **intervalle de confiance au niveau $1 - \alpha$** pour le parametre $\theta$ est un intervalle $[a, b]$ calcule a partir des donnees tel que :

$$P(\theta \in [a, b]) = 1 - \alpha$$

ou $\alpha$ est le **niveau de signification** (risque d'erreur). Valeurs courantes : $\alpha = 0.05$ (IC a 95%), $\alpha = 0.10$ (IC a 90%), $\alpha = 0.01$ (IC a 99%).

### Types d'intervalles

| Type | Formule | Cas d'utilisation |
|------|---------|----------|
| Bilateral (bilatere) | $[a, b]$ | Le plus courant ; symetrique autour de l'estimation |
| Unilateral a gauche | $[a, +\infty[$ | Garantir une valeur minimale |
| Unilateral a droite | $]-\infty, b]$ | Garantir une valeur maximale |

---

## 5.2 Quantiles

Un **quantile d'ordre $p$** est la valeur $q$ telle que $P(X < q) = p$.

En R :
- `qnorm(p, mean, sd)` -- Quantile normal
- `qt(p, df)` -- Quantile de Student
- `qchisq(p, df)` -- Quantile du Chi-deux
- `qbinom(p, size, prob)` -- Quantile binomial

**Exemple** : Pour $Z \sim \mathcal{N}(0,1)$ a 95% :
- $u_{0.025} = \text{qnorm}(0.025) \approx -1.96$
- $u_{0.975} = \text{qnorm}(0.975) \approx 1.96$
- Donc : $P(-1.96 < Z < 1.96) = 0.95$

---

## 5.3 Distributions utiles pour l'inference

### Loi du Chi-deux $\chi^2_k$

La somme des carres de $k$ variables normales centrees reduites independantes :

$$\text{Si } X_i \sim \mathcal{N}(0,1) \text{ iid, alors } \sum_{i=1}^k X_i^2 \sim \chi^2_k$$

| | Valeur |
|---|---|
| $E[\chi^2_k]$ | $k$ |
| $Var(\chi^2_k)$ | $2k$ |
| Forme | Asymetrique (queue a droite), devient plus symetrique quand $k$ augmente |

**R** : `dchisq(x, df)`, `pchisq(x, df)`, `qchisq(p, df)`, `rchisq(n, df)`

### Loi de Student $t_k$

Le rapport d'une loi normale centree reduite a la racine carree d'un chi-deux divise par ses degres de liberte :

$$\text{Si } Z \sim \mathcal{N}(0,1), U \sim \chi^2_k, \text{ independants, alors } T = \frac{Z}{\sqrt{U/k}} \sim t_k$$

| | Valeur |
|---|---|
| $E[t_k]$ | $0$ (pour $k > 1$) |
| $Var(t_k)$ | $k/(k-2)$ (pour $k > 2$) |
| Forme | Symetrique, queues plus lourdes que $\mathcal{N}(0,1)$ |

**Propriete cle** : Quand $k \to \infty$, $t_k \to \mathcal{N}(0,1)$. Pour $k \geq 30$, l'approximation est bonne.

| ddl | $t_k(0.975)$ |
|---|---|
| 1 | 12.71 |
| 3 | 3.182 |
| 5 | 2.571 |
| 10 | 2.228 |
| 30 | 2.042 |
| 100 | 1.984 |
| $\infty$ | 1.960 |

**R** : `dt(x, df)`, `pt(x, df)`, `qt(p, df)`, `rt(n, df)`

---

## 5.4 Estimation ponctuelle

### Estimation de la moyenne

La moyenne empirique $\bar{X}_n = \frac{1}{n}\sum X_i$ est un estimateur **sans biais** de $\mu$ :

$$E[\bar{X}_n] = \mu \qquad Var(\bar{X}_n) = \frac{\sigma^2}{n}$$

### Estimation de la variance

La variance empirique **biaisee** :

$$S^2 = \frac{1}{n}\sum_{i=1}^n (X_i - \bar{X})^2 \qquad E[S^2] = \frac{n-1}{n}\sigma^2 \neq \sigma^2$$

La variance empirique **non biaisee** (corrigee) :

$$S'^2 = \frac{1}{n-1}\sum_{i=1}^n (X_i - \bar{X})^2 = \frac{n}{n-1}S^2 \qquad E[S'^2] = \sigma^2$$

**Important** : Les fonctions R `var()` et `sd()` calculent les versions non biaisees (division par $n-1$).

**Exemple numerique** : Pour $x = (2, 4, 6)$, $\bar{x} = 4$ :
- Biaisee : $S^2 = ((2-4)^2 + (4-4)^2 + (6-4)^2)/3 = 8/3 \approx 2.67$
- Non biaisee : $S'^2 = ((2-4)^2 + (4-4)^2 + (6-4)^2)/2 = 4$ (c'est ce que R renvoie)

---

## 5.5 IC pour la moyenne -- $\sigma$ connu

Par le TCL : $\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)$

$$\boxed{\mu \in \left[\bar{X}_n - u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}},\ \bar{X}_n + u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}}\right]}$$

ou $u_{1-\alpha/2} = \text{qnorm}(1-\alpha/2)$.

### Exemple corrige

> Temps d'execution d'un programme sur 4 jours : 79, 79, 80, 82. Connu $\sigma = 1$. Trouver l'IC a 95% pour la moyenne.

$\bar{x} = 80$, $n = 4$, $\sigma = 1$, $u_{0.975} = 1.96$.

$$\mu \in \left[80 - 1.96 \cdot \frac{1}{2},\ 80 + 1.96 \cdot \frac{1}{2}\right] = [79.02, 80.98]$$

### Determiner la taille d'echantillon pour une precision ciblee

Pour obtenir une demi-largeur d'IC de $\delta$ :

$$u_{1-\alpha/2}\frac{\sigma}{\sqrt{n}} = \delta \implies n = \left(\frac{u_{1-\alpha/2} \cdot \sigma}{\delta}\right)^2$$

**Exemple** : Precision de 5 minutes, $\sigma = 10$, confiance a 95% :
$$n = \left(\frac{1.96 \times 10}{5}\right)^2 = (3.92)^2 \approx 16$$

---

## 5.6 IC pour la moyenne -- $\sigma$ inconnu

On remplace $\sigma$ par son estimation $S'$ et on utilise la loi de Student :

$$\frac{\bar{X}_n - \mu}{S'/\sqrt{n}} \sim t_{n-1}$$

$$\boxed{\mu \in \left[\bar{X}_n - t_{n-1}\left(1-\frac{\alpha}{2}\right)\frac{S'}{\sqrt{n}},\ \bar{X}_n + t_{n-1}\left(1-\frac{\alpha}{2}\right)\frac{S'}{\sqrt{n}}\right]}$$

### Exemple corrige

> Memes donnees : 79, 79, 80, 82. Cette fois $\sigma$ inconnu. Trouver l'IC a 95%.

$\bar{x} = 80$, $n = 4$, $S' = \sqrt{(1+1+0+4)/3} = \sqrt{2} \approx 1.41$.

$t_3(0.975) = 3.182$.

$$\mu \in \left[80 - 3.182 \cdot \frac{\sqrt{2}}{2},\ 80 + 3.182 \cdot \frac{\sqrt{2}}{2}\right] = [77.7, 82.3]$$

**Observation** : L'IC est plus large lorsque $\sigma$ est inconnu car :
1. $S'$ introduit une incertitude supplementaire
2. $t_{n-1}(0.975) > u_{0.975}$, surtout pour les petits $n$

---

## 5.7 IC pour la variance

La distribution de la variance empirique est liee au chi-deux :

$$\frac{(n-1)S'^2}{\sigma^2} \sim \chi^2_{n-1}$$

La loi du chi-deux est **asymetrique**, donc l'IC utilise des quantiles superieur et inferieur differents :

$$\boxed{\sigma^2 \in \left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]}$$

**Attention a l'inversion** : La borne inferieure de l'IC utilise le quantile **superieur**, et vice versa.

---

## 5.8 IC pour une proportion

Pour une proportion $p$ estimee a partir de $n$ observations avec $\hat{p} = x_n/n$ :

En utilisant l'approximation normale de la binomiale ($np \geq 5$, $n(1-p) \geq 5$, $n \geq 30$) :

$$\hat{p} \approx \mathcal{N}\left(p, \sqrt{\frac{p(1-p)}{n}}\right)$$

Comme $p$ apparait dans les bornes (probleme circulaire), on utilise la borne conservative $p(1-p) \leq 1/4$ :

$$\boxed{p \in \left[\hat{p} - u_{1-\alpha/2}\frac{1}{2\sqrt{n}},\ \hat{p} + u_{1-\alpha/2}\frac{1}{2\sqrt{n}}\right]}$$

### Exemple corrige : Ports USB

> 7.5% des machines n'ont pas de port USB. Echantillon de 100. Trouver l'IC a 90% pour le nombre sans USB.

$X \sim \mathcal{B}(100, 0.075)$. Par le TCL : $X \approx \mathcal{N}(7.5, \sqrt{100 \cdot 0.075 \cdot 0.925})$.

En utilisant la loi binomiale exacte : $[\text{qbinom}(0.05, 100, 0.075),\ \text{qbinom}(0.95, 100, 0.075)] = [3, 12]$.

En utilisant l'approximation normale : $[\text{qnorm}(0.05, 7.5, 2.63),\ \text{qnorm}(0.95, 7.5, 2.63)] \approx [3.2, 11.8]$.

---

## 5.9 Arbre de decision

```
Quel parametre estimez-vous ?
|
+-- Moyenne (mu)
|   |
|   +-- sigma connu ? --> N(0,1), utiliser qnorm
|   |
|   +-- sigma inconnu ? --> t(n-1), utiliser qt
|
+-- Variance (sigma^2)
|   |
|   +-- Toujours utiliser chi^2(n-1), utiliser qchisq
|
+-- Proportion (p)
    |
    +-- n grand ? --> N(0,1), utiliser qnorm avec borne conservative
```

---

## AIDE-MEMOIRE -- Intervalles de confiance

| Parametre | Pivot | Distribution | IC a $1-\alpha$ |
|---|---|---|---|
| $\mu$ ($\sigma$ connu) | $\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | $\bar{X} \pm u_{1-\alpha/2} \frac{\sigma}{\sqrt{n}}$ |
| $\mu$ ($\sigma$ inconnu) | $\frac{\bar{X}-\mu}{S'/\sqrt{n}}$ | $t_{n-1}$ | $\bar{X} \pm t_{n-1}(1-\alpha/2) \frac{S'}{\sqrt{n}}$ |
| $\sigma^2$ | $\frac{(n-1)S'^2}{\sigma^2}$ | $\chi^2_{n-1}$ | $\left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$ |
| $p$ | $\frac{X-np}{\sqrt{np(1-p)}}$ | $\mathcal{N}(0,1)$ | $\hat{p} \pm u_{1-\alpha/2}\frac{1}{2\sqrt{n}}$ |

**Estimateurs ponctuels** : $\bar{X}_n$ pour $\mu$ (sans biais) ; $\frac{n}{n-1}S^2 = S'^2$ pour $\sigma^2$ (sans biais) ; $\hat{p} = x_n/n$ pour $p$.

**R calcule la version non biaisee** : `var()` renvoie $S'^2$, `sd()` renvoie $S'$.
