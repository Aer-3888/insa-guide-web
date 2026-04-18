---
title: "Guide de reconnaissance des distributions"
sidebar_position: 2
---

# Guide de reconnaissance des distributions

> Pendant l'examen, vous devez rapidement identifier quelle distribution s'applique a un probleme. Ce guide fournit des regles de correspondance par motifs.

---

## Tableau de reconnaissance rapide

| Si l'enonce dit... | Distribution | Parametres |
|---|---|---|
| « Succes/echec », « oui/non », epreuve unique | Bernoulli $\mathcal{B}(p)$ | $p$ = proba de succes |
| « $n$ epreuves independantes, compter les succes » | Binomiale $\mathcal{B}(n,p)$ | $n$ epreuves, $p$ proba de succes |
| « $k$ evenements dans le temps/l'espace avec taux moyen $\lambda$ » | Poisson $\mathcal{P}(\lambda)$ | $\lambda$ = nombre moyen |
| « Nombre d'epreuves jusqu'au premier succes » | Geometrique $\mathcal{G}(p)$ | $p$ = proba de succes |
| « Tirage sans remise dans une population finie » | Hypergeometrique | $N$ total, $K$ succes, $n$ tirages |
| « Toutes les valeurs equiprobables dans $[a,b]$ » | Uniforme $\mathcal{U}(a,b)$ | $a$ min, $b$ max |
| « Temps d'attente, duree de vie, temps entre evenements » | Exponentielle $\mathcal{E}(\lambda)$ | $\lambda$ = taux |
| « En forme de cloche », « approximativement normale », TCL | Normale $\mathcal{N}(\mu,\sigma)$ | $\mu$ moyenne, $\sigma$ ecart-type |
| « $n$ epreuves, $k$ categories, compter par categorie » | Multinomiale | $n$ epreuves, $p_1,\ldots,p_k$ |
| « Somme de carres de normales » | Chi-deux $\chi^2_k$ | $k$ degres de liberte |
| « Rapport : normale / sqrt(chi-deux/ddl) » | Student $t_k$ | $k$ degres de liberte |

---

## Quelle distribution d'inference utiliser

### Pour les intervalles de confiance et les tests

```
Estimer la MOYENNE :
  +-- sigma CONNU --> N(0,1) : utiliser qnorm()
  +-- sigma INCONNU --> t(n-1) : utiliser qt()

Estimer la VARIANCE :
  +-- Toujours chi^2(n-1) : utiliser qchisq()

Estimer une PROPORTION :
  +-- Grand n (np>=5, n(1-p)>=5) --> N(0,1) : utiliser qnorm()
  +-- Petit n --> Binomiale exacte : utiliser qbinom()
```

### Pour les approximations

```
Binomiale --> Normale :
  Lorsque np >= 5 ET n(1-p) >= 5
  B(n,p) ~ N(np, sqrt(np(1-p)))

Binomiale --> Poisson :
  Lorsque n grand ET p petit
  B(n,p) ~ P(np)

Student --> Normale :
  Lorsque ddl >= 30
  t(ddl) ~ N(0,1)
```

---

## Reconnaissance des motifs d'examen

### Motif 1 : « Donnees brutes, trouver l'IC pour la moyenne »

**Approche** :
1. Calculer $\bar{x}$ et $s'^2$ (ou $s'$)
2. $\sigma$ est-il donne ? (generalement NON en examen)
3. Utiliser la loi de Student $t_{n-1}$
4. $\mu \in [\bar{x} \pm t_{n-1}(1-\alpha/2) \cdot s'/\sqrt{n}]$

**Code R** :
```r noexec
xbar <- mean(data)
s_prime <- sd(data)
n <- length(data)
t_crit <- qt(1-alpha/2, df=n-1)
IC <- c(xbar - t_crit*s_prime/sqrt(n), xbar + t_crit*s_prime/sqrt(n))
```

### Motif 2 : « Statistiques resumees ($\sum x_i$, $\sum x_i^2$), trouver l'IC »

**Approche** :
1. $\bar{x} = \sum x_i / n$
2. $s'^2 = \frac{1}{n-1}(\sum x_i^2 - n\bar{x}^2)$
3. Continuer comme le Motif 1

**Exemple** (annale 2022) : $n=25$, $\sum x_i = 30000$, $\sum x_i^2 = 36.96 \times 10^6$

$$\bar{x} = 30000/25 = 1200$$
$$s'^2 = \frac{1}{24}(36960000 - 25 \times 1200^2) = \frac{1}{24}(36960000 - 36000000) = 40000$$
$$s' = 200$$

### Motif 3 : « Comparer deux groupes »

**Approche** :
1. Identifier : test d'homogeneite ($H_0: \mu_1 = \mu_2$)
2. Les variances sont-elles connues ? Egales ? Differentes ?
3. Choisir le test approprie (voir Ch.6)
4. Calculer $D = \bar{x}_1 - \bar{x}_2$ et $\hat{\sigma}_D$
5. Comparer $T = D/\hat{\sigma}_D$ a la valeur critique

### Motif 4 : « Cette valeur est-elle compatible avec les donnees ? »

**Approche** :
1. Identifier : test de conformite ($H_0: \mu = \mu_0$)
2. Verifier si $\mu_0$ tombe dans l'IC du Motif 1
3. OU calculer la statistique de test et comparer a la zone critique

### Motif 5 : « Multinomiale/vote/categories »

**Approche** :
1. Identifier la variable comme multinomiale
2. Utiliser `dmultinom()` pour les probabilites specifiques
3. Pour les proportions, une approximation normale pour l'IC peut etre necessaire

### Motif 6 : « Trouver la variance d'une combinaison lineaire »

**Approche** :
1. Ecrire $Y = \mathbf{a}^T\mathbf{X}$
2. $Var(Y) = \mathbf{a}^T\boldsymbol{\Sigma}\mathbf{a}$
3. Developper : $Var(\sum a_i X_i) = \sum a_i^2 Var(X_i) + 2\sum_{i<j} a_i a_j Cov(X_i, X_j)$

---

## Valeurs numeriques a connaitre

| Quantile | Valeur | Utilisation |
|---|---|---|
| $u_{0.975}$ | 1.960 | IC a 95%, $\sigma$ connu |
| $u_{0.995}$ | 2.576 | IC a 99%, $\sigma$ connu |
| $u_{0.95}$ | 1.645 | IC a 90% ou unilateral a 95% |
| $t_3(0.975)$ | 3.182 | $n=4$, $\sigma$ inconnu |
| $t_5(0.975)$ | 2.571 | $n=6$, $\sigma$ inconnu |
| $t_9(0.975)$ | 2.262 | $n=10$, $\sigma$ inconnu |
| $t_{23}(0.975)$ | 2.069 | $n=24$, $\sigma$ inconnu |

---

## Astuces de calcul

### Retrouver la variance a partir des sommes

$$S'^2 = \frac{1}{n-1}\left(\sum x_i^2 - \frac{(\sum x_i)^2}{n}\right)$$

### Estimations mentales rapides

- $\sqrt{2} \approx 1.414$
- $\sqrt{3} \approx 1.732$
- $\sqrt{5} \approx 2.236$
- $\sqrt{10} \approx 3.162$
- $\sqrt{20} \approx 4.472$

### Verifier votre reponse

- L'IC doit contenir l'estimation ponctuelle ($\bar{x}$ doit etre au milieu pour l'IC de la moyenne)
- Les bornes de l'IC de la variance doivent toutes etre positives
- La statistique t doit etre negative si $\bar{x} < \mu_0$, positive si $\bar{x} > \mu_0$
- La p-valeur doit etre entre 0 et 1
- Si p-valeur $< \alpha$, alors $\mu_0$ ne doit PAS etre dans l'IC (et vice versa)
