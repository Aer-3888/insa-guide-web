---
title: "TD2 -- Tests statistiques"
sidebar_position: 3
---

# TD2 -- Tests statistiques

---

## Exercice 1 : Tests sur une loi normale

### 1a) Test bilateral sur la moyenne ($\sigma$ connu)

**Enonce :** $X_1, \ldots, X_{16} \sim \mathcal{N}(\mu, 4)$. On observe $\bar{x} = 7.2$. Tester $H_0: \mu = 7$ vs $H_1: \mu \neq 7$ au seuil $\alpha = 0.05$.

**Solution :**

$\sigma^2 = 4$ connu, donc $\sigma = 2$.

$$Z = \frac{\bar{x} - \mu_0}{\sigma / \sqrt{n}} = \frac{7.2 - 7}{2/\sqrt{16}} = \frac{0.2}{0.5} = 0.4$$

Region de rejet bilatérale : $|Z| > z_{0.975} = 1.96$.

$|0.4| = 0.4 < 1.96$ : **on ne rejette pas $H_0$**.

Au risque de 5%, on ne peut pas conclure que la moyenne differe de 7.

### 1b) Test unilateral a droite

**Enonce :** Tester $H_0: \mu \leq 7$ vs $H_1: \mu > 7$.

**Solution :**

Region de rejet : $Z > z_{0.95} = 1.645$.

$0.4 < 1.645$ : **on ne rejette pas $H_0$**.

### 1c) Test sur la variance

**Enonce :** On observe $s^2 = 5.1$. Tester $H_0: \sigma^2 = 4$ vs $H_1: \sigma^2 > 4$ au seuil 5%.

**Solution :**

$$\chi^2 = \frac{(n-1)s^2}{\sigma_0^2} = \frac{15 \times 5.1}{4} = 19.125$$

Region de rejet (unilateral a droite) : $\chi^2 > \chi^2_{15, 0.95} = 25.00$.

$19.125 < 25.00$ : **on ne rejette pas $H_0$**.

Au risque de 5%, on ne peut pas conclure que la variance est superieure a 4.

---

## Exercice 2 : Test sur une loi exponentielle

**Enonce :** $X_1, \ldots, X_{50} \sim \text{Exp}(\lambda)$. On observe $\bar{x} = 3.2$. Tester $H_0: \lambda = 1/3$ vs $H_1: \lambda \neq 1/3$ au seuil 5%.

**Solution :**

Sous $H_0$ : $E(X) = 1/\lambda = 3$, $\text{Var}(X) = 1/\lambda^2 = 9$.

Par le TCL ($n = 50$ assez grand) :

$$Z = \frac{\bar{X} - 1/\lambda_0}{\sqrt{1/(\lambda_0^2 n)}} = \frac{3.2 - 3}{\sqrt{9/50}} = \frac{0.2}{0.4243} = 0.471$$

Region de rejet : $|Z| > 1.96$.

$0.471 < 1.96$ : **on ne rejette pas $H_0$**.

---

## Exercice 3 : Comparaison de disques durs

**Enonce :** On compare la duree de vie (heures) de deux marques.

- Marque A (8 unites) : $\bar{x}_A = 1531, s_A = 11.2$
- Marque B (8 unites) : $\bar{x}_B = 1500.6, s_B = 10.5$

Peut-on conclure a une difference au seuil 5% ?

**Solution :**

**Etape 1 : Verifier l'egalite des variances (test F)**

$$F = \frac{s_A^2}{s_B^2} = \frac{11.2^2}{10.5^2} = \frac{125.44}{110.25} = 1.138$$

$F_{7,7,0.975} = 4.99$. Comme $1.138 < 4.99$, on ne rejette pas $H_0: \sigma_A^2 = \sigma_B^2$.

**Etape 2 : Test t (variances egales)**

Variance poolee :

$$S_p^2 = \frac{(n_A-1)s_A^2 + (n_B-1)s_B^2}{n_A + n_B - 2} = \frac{7 \times 125.44 + 7 \times 110.25}{14} = \frac{878.08 + 771.75}{14} = 117.85$$

$$T = \frac{\bar{x}_A - \bar{x}_B}{S_p\sqrt{1/n_A + 1/n_B}} = \frac{1531 - 1500.6}{\sqrt{117.85}\sqrt{1/8 + 1/8}} = \frac{30.4}{10.86 \times 0.5} = \frac{30.4}{5.43} = 5.60$$

$t_{14, 0.975} = 2.145$. Comme $5.60 > 2.145$, **on rejette $H_0$**.

Au risque de 5%, les durees de vie different significativement. La marque A dure plus longtemps.

**En R :**

```r
A <- c(1525, 1540, 1510, 1530, 1538, 1527, 1545, 1533)
B <- c(1480, 1512, 1500, 1495, 1508, 1502, 1510, 1498)

var.test(A, B)           # p > 0.05 → variances egales
t.test(A, B, var.equal = TRUE)  # p < 0.05 → difference significative
```

---

## Exercice 4 : Test de proportion (audit)

**Enonce :** Un auditeur affirme que 10% des factures contiennent des erreurs. Sur un echantillon de 200 factures, 28 contiennent des erreurs. Peut-on rejeter cette affirmation au seuil 5% ?

**Solution :**

$\hat{p} = 28/200 = 0.14$, $p_0 = 0.10$, $n = 200$.

$$Z = \frac{\hat{p} - p_0}{\sqrt{p_0(1-p_0)/n}} = \frac{0.14 - 0.10}{\sqrt{0.10 \times 0.90 / 200}} = \frac{0.04}{\sqrt{0.00045}} = \frac{0.04}{0.02121} = 1.886$$

Region de rejet bilateral : $|Z| > 1.96$.

$1.886 < 1.96$ : **on ne rejette pas $H_0$** (de justesse).

Au risque de 5%, on ne peut pas rejeter l'affirmation de l'auditeur.

**En R :**

```r
prop.test(28, 200, p = 0.10)
# p-value ≈ 0.06 > 0.05 → on ne rejette pas
```

---

## Exercice 5 : Pannes de machine (Poisson)

**Enonce :** Le nombre de pannes par mois suit une loi $\mathcal{P}(\lambda)$. Historiquement $\lambda = 3$. Sur 12 mois, on observe une moyenne de 4.2 pannes. Le taux de pannes a-t-il augmente ?

**Solution :**

$H_0: \lambda = 3$ vs $H_1: \lambda > 3$ (test unilateral).

Par le TCL, $\bar{X} \overset{approx}{\sim} \mathcal{N}(\lambda, \lambda/n)$ sous $H_0$.

$$Z = \frac{\bar{X} - \lambda_0}{\sqrt{\lambda_0/n}} = \frac{4.2 - 3}{\sqrt{3/12}} = \frac{1.2}{0.5} = 2.4$$

Region de rejet unilateral a droite : $Z > z_{0.95} = 1.645$.

$2.4 > 1.645$ : **on rejette $H_0$**.

Au risque de 5%, le taux de pannes a significativement augmente.

---

## Exercice 6 : Temps de gonflage d'airbags

### 6a) Test de conformite de la moyenne

**Enonce :** Le temps de gonflage doit etre de $\mu_0 = 40$ ms. Sur $n = 20$ airbags : $\bar{x} = 41.5$ ms, $s = 3.2$ ms.

**Solution :**

$$T = \frac{41.5 - 40}{3.2 / \sqrt{20}} = \frac{1.5}{0.7155} = 2.096$$

$t_{19, 0.975} = 2.093$.

$2.096 > 2.093$ : **on rejette $H_0$** (de justesse).

Au risque de 5%, le temps moyen de gonflage differe significativement de 40 ms.

### 6b) Comparaison de deux fournisseurs (test F)

**Enonce :** Fournisseur A ($n_A = 20$, $s_A = 3.2$) vs Fournisseur B ($n_B = 15$, $s_B = 2.1$). Les variances sont-elles egales ?

$$F = \frac{s_A^2}{s_B^2} = \frac{3.2^2}{2.1^2} = \frac{10.24}{4.41} = 2.322$$

$F_{19, 14, 0.975} \approx 2.86$.

$2.322 < 2.86$ : **on ne rejette pas** l'egalite des variances.

### 6c) Comparaison des moyennes

**Enonce :** Fournisseur A ($\bar{x}_A = 41.5$) vs Fournisseur B ($\bar{x}_B = 39.8$). Les moyennes different-elles ?

Comme les variances sont egales (6b), on utilise le t-test avec variances poolees :

$$S_p^2 = \frac{19 \times 10.24 + 14 \times 4.41}{33} = \frac{194.56 + 61.74}{33} = 7.766$$

$$T = \frac{41.5 - 39.8}{\sqrt{7.766 \times (1/20 + 1/15)}} = \frac{1.7}{\sqrt{7.766 \times 0.1167}} = \frac{1.7}{0.952} = 1.786$$

$t_{33, 0.975} \approx 2.035$.

$1.786 < 2.035$ : **on ne rejette pas $H_0$**.

Au risque de 5%, on ne peut pas conclure a une difference significative entre les moyennes.

**En R :**

```r
# Si on avait les donnees brutes :
# t.test(A, B, var.equal = TRUE)
```

---

## Exercice 7 : QCM -- Choix du test

| Situation | Test correct |
|-----------|-------------|
| Comparer la moyenne d'un echantillon a une valeur de reference | t-test 1 echantillon |
| Comparer les moyennes de deux groupes independants | t-test 2 echantillons |
| Comparer avant/apres sur les memes sujets | t-test apparie |
| Comparer les moyennes de 4 groupes | ANOVA |
| Tester si une proportion vaut 0.5 | Test Z de proportion |
| Tester l'independance de deux variables categorielles | Chi-deux d'independance |
| Tester si les donnees suivent une loi normale | Shapiro-Wilk |
| Comparer les variances de deux groupes | Test F |
