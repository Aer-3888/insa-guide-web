---
title: "Chapitre 6 : Tests d'hypotheses"
sidebar_position: 6
---

# Chapitre 6 : Tests d'hypotheses

## 6.1 Introduction

Un **test d'hypothese** est une methode statistique permettant de prendre des decisions a partir de donnees -- il determine si les resultats observes sont **statistiquement significatifs** ou s'ils pourraient etre dus au hasard.

**Attention** : Un test n'est PAS une preuve. Il quantifie les preuves contre une hypothese nulle.

---

## 6.2 Cadre general

### Hypotheses

| | Description |
|---|---|
| $H_0$ (hypothese nulle) | Hypothese par defaut ; ce que l'on suppose vrai |
| $H_1$ (hypothese alternative) | Ce que l'on cherche a montrer / detecter |

**Convention** :
- **Ethique** : $H_1$ = ce que l'on espere demontrer
- **Pratique** : $H_0$ = un enonce bien defini et testable (ex. $\mu = \mu_0$)

### Erreurs

| | $H_0$ est vraie | $H_1$ est vraie |
|---|---|---|
| **Accepter $H_0$** | Correct | Erreur de type II ($\beta$) |
| **Rejeter $H_0$** | Erreur de type I ($\alpha$) | Correct (Puissance = $1-\beta$) |

- $\alpha = P(\text{rejeter } H_0 \mid H_0 \text{ vraie})$ -- **niveau de signification**, fixe a l'avance (typiquement 0.05)
- $\beta = P(\text{accepter } H_0 \mid H_1 \text{ vraie})$ -- depend de la vraie valeur du parametre
- **Puissance** $= 1 - \beta = P(\text{rejeter } H_0 \mid H_1 \text{ vraie})$

---

## 6.3 Methodologie des tests

### Procedure generale

1. **Definir** $H_0$ et $H_1$
2. **Choisir** la statistique de test $S$ et determiner sa distribution sous $H_0$
3. **Fixer** le niveau de signification $\alpha$
4. **Calculer** $s$ (la valeur observee de $S$ a partir des donnees)
5. **Decider** : $s$ est-il dans la zone d'acceptation (zone de forte probabilite) ou dans la zone de rejet ?

### Deux methodes de resolution

**Methode 1 : Approche par intervalle de confiance**
- Calculer la region d'acceptation (intervalle de forte probabilite sous $H_0$)
- Si la statistique observee tombe a l'interieur : accepter $H_0$
- Si a l'exterieur : rejeter $H_0$

**Methode 2 : Approche par la p-valeur**
- Calculer la p-valeur : le plus petit $\alpha$ pour lequel $H_0$ serait rejetee
- Si p-valeur $< \alpha$ : rejeter $H_0$
- Si p-valeur $> \alpha$ : accepter $H_0$

### Interpretation de la p-valeur

| Plage de p-valeur | Force de la preuve contre $H_0$ |
|---|---|
| $> 0.05$ | Non significatif (accepter $H_0$) |
| $[0.01, 0.05]$ | Significatif |
| $[0.001, 0.01]$ | Tres significatif |
| $< 0.001$ | Hautement significatif |

Pour un test bilatere avec la statistique $s$ :

$$\text{p-valeur} = P(|S| \geq |s|) = 2 \cdot P(S \leq -|s|)$$

---

## 6.4 Tests de conformite (un echantillon)

Tester si un echantillon est compatible avec une valeur hypothetique du parametre.

### Test de conformite pour la moyenne -- $\sigma$ connu

$$H_0: \mu = \mu_0 \qquad H_1: \mu \neq \mu_0$$

**Statistique de test** : $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)$ sous $H_0$

**Decision** : Rejeter $H_0$ si $|z| > u_{1-\alpha/2}$ (c.-a-d. si $z \notin [-1.96, 1.96]$ pour $\alpha = 0.05$).

**p-valeur** : $2 \cdot \text{pnorm}(-|z|)$

### Test de conformite pour la moyenne -- $\sigma$ inconnu

$$H_0: \mu = \mu_0 \qquad H_1: \mu \neq \mu_0$$

**Statistique de test** : $T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}} \sim t_{n-1}$ sous $H_0$

**Decision** : Rejeter $H_0$ si $|t| > t_{n-1}(1-\alpha/2)$.

**p-valeur** : $2 \cdot \text{pt}(-|t|, \text{df}=n-1)$

### Exemple corrige : Pieces isolantes

> Un fournisseur affirme que l'epaisseur moyenne = 7.3mm. Echantillon de 24 pieces : $\bar{x} = 7.126$, $\sigma = 0.38$ (connu). Tester a $\alpha = 0.05$.

$$z = \frac{7.126 - 7.3}{0.38/\sqrt{24}} = \frac{-0.174}{0.0776} = -2.24$$

Zone d'acceptation : $[-1.96, 1.96]$. Comme $-2.24 \notin [-1.96, 1.96]$, **rejeter $H_0$**.

p-valeur : $2 \times \text{pnorm}(-2.24) = 0.025 < 0.05$.

Avec $\sigma$ inconnu ($s' = 0.395$) : $t = \frac{7.126 - 7.3}{0.395/\sqrt{24}} = -2.157$. La zone d'acceptation pour $t_{23}$ a $\alpha = 0.05$ est $[-2.069, 2.069]$. Comme $|-2.157| > 2.069$, on **rejette $H_0$** egalement.

---

## 6.5 Tests d'homogeneite (deux echantillons)

Tester si deux populations ont la meme moyenne.

### Mise en place

Deux echantillons independants de $X_1 \sim \mathcal{N}(\mu_1, \sigma_1)$ et $X_2 \sim \mathcal{N}(\mu_2, \sigma_2)$.

$$H_0: \mu_1 = \mu_2 \qquad H_1: \mu_1 \neq \mu_2$$

Soit $D = \bar{X}_1 - \bar{X}_2$. Sous $H_0$ : $E[D] = 0$.

### Cas 1 : $\sigma_1 = \sigma_2 = \sigma$ connu

$$\sigma_D^2 = \sigma^2\left(\frac{1}{n_1} + \frac{1}{n_2}\right)$$

$$Z = \frac{D}{\sigma_D} \sim \mathcal{N}(0,1)$$

### Cas 2 : $\sigma_1 = \sigma_2$ inconnu (test t groupe)

Estimer $\sigma$ par la variance combinee :

$$\hat{\sigma}^2 = \frac{(n_1 - 1)s_1'^2 + (n_2 - 1)s_2'^2}{n_1 + n_2 - 2}$$

$$\hat{\sigma}_D^2 = \hat{\sigma}^2\left(\frac{1}{n_1} + \frac{1}{n_2}\right)$$

$$T = \frac{D}{\hat{\sigma}_D} \sim t_{n_1+n_2-2}$$

### Cas 3 : $\sigma_1 \neq \sigma_2$ inconnus (test de Welch / Aspin-Welch)

$$\hat{\sigma}_D^2 = \frac{s_1'^2}{n_1} + \frac{s_2'^2}{n_2}$$

$$T = \frac{D}{\hat{\sigma}_D} \sim t_\nu$$

ou les degres de liberte $\nu$ sont calcules par la formule de Satterthwaite :

$$\frac{1}{\nu} = \frac{1}{n_1-1}\left(\frac{s_1'^2/n_1}{\hat{\sigma}_D^2}\right)^2 + \frac{1}{n_2-1}\left(\frac{s_2'^2/n_2}{\hat{\sigma}_D^2}\right)^2$$

### Fonctions R

```r noexec
# Test t a un echantillon (conformite)
t.test(x, mu=mu_0, conf.level=0.95)

# Test t a deux echantillons (homogeneite)
t.test(x, y, var.equal=TRUE)   # Variances egales (groupe)
t.test(x, y, var.equal=FALSE)  # Variances inegales (Welch)

# Test z (sigma connu) -- necessite le package TeachingDemos
library(TeachingDemos)
z.test(x, mu=mu_0, stdev=sigma)
```

---

## 6.6 Analyse de puissance

### Concept

**Puissance** = $1 - \beta$ = probabilite de rejeter correctement $H_0$ lorsqu'elle est fausse.

La puissance depend de :
1. **Taille de l'effet** : a quel point le vrai parametre differe de $H_0$
2. **Taille de l'echantillon** $n$ : plus grand $n$ = plus grande puissance
3. **Niveau de signification** $\alpha$ : plus grand $\alpha$ = plus grande puissance (mais plus d'erreurs de type I)
4. **Variabilite** $\sigma$ : plus petit $\sigma$ = plus grande puissance

### Calcul de la puissance (conformite, $\sigma$ connu)

Sous $H_0$ : $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} \sim \mathcal{N}(0,1)$.

Sous $H_1$ ($\mu = \mu_1$) : $Z \sim \mathcal{N}\left(\frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}}, 1\right)$.

$$\text{Puissance} = 1 - \text{pnorm}\left(u_{1-\alpha/2}, \text{mean} = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}}\right)$$

### Exemple corrige

> Bouteilles de lait : $\sigma = 1$ml, $\mu_0 = 1000$ml, $n = 40$. Detecter un ecart de 0.2ml.

Effet standardise : $\Delta = 0.2 / (1/\sqrt{40}) = 0.2 \times \sqrt{40} = 1.265$.

Puissance $= 1 - \text{pnorm}(1.96, \text{mean}=1.265) = 1 - 0.756 = 0.244$.

Seulement 24.4% de puissance -- insuffisant. Pour 90% de puissance, il faut $n \approx 263$ bouteilles.

---

## 6.7 Tests de normalite

Avant d'appliquer des tests parametriques, verifier que les donnees sont approximativement normales.

### Methodes graphiques

1. **Histogramme vs courbe normale** : comparaison visuelle par superposition
2. **Boite a moustaches** : verifier la symetrie (mediane centree, moustaches egales)
3. **QQ-plot** : graphique quantile-quantile par rapport a la loi normale theorique ; les points doivent etre sur une droite

### Tests formels

| Test | Fonction R | Meilleur pour |
|------|-----------|----------|
| Shapiro-Wilk | `shapiro.test(x)` | $n \leq 50$ |
| Kolmogorov-Smirnov | `ks.test(x, "pnorm", mean, sd)` | Grands echantillons |

Les deux testent $H_0$ : les donnees suivent une loi normale. Rejeter si p-valeur $< \alpha$.

---

## 6.8 Liste de controle methodologique complete

1. Definir le type de test : **conformite** ou **homogeneite** ?
2. Definir $H_0$ et $H_1$
3. Identifier la statistique de test et sa distribution :
   - Conformite, $\sigma$ connu : $Z \sim \mathcal{N}(0,1)$
   - Conformite, $\sigma$ inconnu : $T \sim t_{n-1}$
   - Homogeneite, $\sigma$ connu/egal : $Z \sim \mathcal{N}(0,1)$
   - Homogeneite, $\sigma$ egal inconnu : $T \sim t_{n_1+n_2-2}$
   - Homogeneite, $\sigma$ inegal inconnu : $T \sim t_\nu$ (Welch)
4. Calculer la statistique a partir des donnees
5. Determiner la zone d'acceptation ou la p-valeur
6. Prendre la decision et enoncer la conclusion

---

## AIDE-MEMOIRE -- Tests d'hypotheses

| Test | Statistique | Distribution sous $H_0$ | Rejeter $H_0$ si |
|---|---|---|---|
| Conformite, $\sigma$ connu | $Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ | $\|Z\| > u_{1-\alpha/2}$ |
| Conformite, $\sigma$ inconnu | $T = \frac{\bar{X}-\mu_0}{S'/\sqrt{n}}$ | $t_{n-1}$ | $\|T\| > t_{n-1}(1-\alpha/2)$ |
| Homogeneite, $\sigma$ connu | $Z = D/\sigma_D$ | $\mathcal{N}(0,1)$ | $\|Z\| > u_{1-\alpha/2}$ |
| Homogeneite, $\sigma_1=\sigma_2$ inconnu | $T = D/\hat{\sigma}_D$ | $t_{n_1+n_2-2}$ | $\|T\| > t_{df}(1-\alpha/2)$ |
| Homogeneite, $\sigma_1 \neq \sigma_2$ | $T = D/\hat{\sigma}_D$ | $t_\nu$ (Welch) | $\|T\| > t_\nu(1-\alpha/2)$ |

**Regle de la p-valeur** : Rejeter $H_0$ si p-valeur $< \alpha$.

**Puissance** : $1 - \beta$. Augmente avec $n$, la taille de l'effet et $\alpha$. Diminue avec $\sigma$.
