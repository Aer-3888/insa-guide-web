---
title: "TP4 - Tests d'hypotheses"
sidebar_position: 4
---

# TP4 - Tests d'hypotheses

> D'apres les instructions de l'enseignant : `S5/Probabilites/data/moodle/tp/tp4/README.md`

## Preparation

```r
# No special packages needed
# All functions are from base R
```

---

## Exercice 1 : Poids de poulpes -- Test t a un echantillon (test de conformite)

### 15 poulpes peses. La moyenne est-elle de 3000g ? Calculer l'IC, effectuer le test de conformite par les approches manuelle et `t.test()`.

**Theorie :**

- $H_0$ : $\mu = \mu_0$ (la moyenne de la population est egale a la valeur hypothetique)
- $H_1$ : $\mu \neq \mu_0$ (alternative bilaterale)
- Statistique de test ($\sigma$ inconnu) : $T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}} \sim t(n-1)$ sous $H_0$
- Decision : rejeter $H_0$ si $|T| > t_{n-1,\,\alpha/2}$ ou si p-valeur $< \alpha$

### Etape 1 : Calculer les statistiques descriptives

**Reponse :**
```r
poids_poulpe <- c(1150, 1500, 1700, 1800, 1800, 1850, 2200, 2700,
                   2900, 3000, 3100, 3500, 3900, 4000, 5400)

n <- length(poids_poulpe)
alpha <- 0.10  # 90% confidence

mean_empirical <- mean(poids_poulpe)
sd_empirical <- sd(poids_poulpe)

cat("Octopus weight statistics:\n")
cat("Sample size:", n, "\n")
cat("Mean:", round(mean_empirical, 2), "g\n")
cat("SD:", round(sd_empirical, 2), "g\n\n")
```

**Sortie attendue :**
```
Octopus weight statistics:
Sample size: 15
Mean: 2700 g
SD: 1158.39 g
```

**Explication :**
La moyenne empirique (2700g) est 300g en dessous de la valeur hypothetique (3000g). Le test d'hypothese determine si cette difference est statistiquement significative ou simplement due a la variabilite d'echantillonnage.

---

### Etape 2 : Calculer l'IC pour la moyenne

**Reponse :**
```r
t_crit <- qt(1 - alpha/2, df = n - 1)
se <- sd_empirical / sqrt(n)

CI_lower <- mean_empirical - t_crit * se
CI_upper <- mean_empirical + t_crit * se

cat("90% Confidence Interval for mean:\n")
cat("t critical value: qt(0.95, df=14) =", round(t_crit, 4), "\n")
cat("Standard error: S'/sqrt(n) =", round(se, 2), "\n")
cat("CI: [", round(CI_lower, 2), ",", round(CI_upper, 2), "]\n\n")
```

**Sortie attendue :**
```
90% Confidence Interval for mean:
t critical value: qt(0.95, df=14) = 1.7613
Standard error: S'/sqrt(n) = 299.14
CI: [ 2173.15 , 3226.85 ]
```

**Explication mathematique :**
$$\text{IC} = \left[\bar{X} - t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}},\; \bar{X} + t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}}\right]$$
$$= [2700 - 1.761 \times 299.14,\; 2700 + 1.761 \times 299.14] = [2173.15,\; 3226.85]$$

Puisque $\mu_0 = 3000$ tombe A L'INTERIEUR de l'IC a 90%, on ne rejettera PAS $H_0$ au niveau $\alpha = 0.10$. Il existe une dualite : on rejette $H_0$ au niveau $\alpha$ si et seulement si $\mu_0$ tombe en dehors de l'IC a $(1-\alpha)$.

---

### Etape 3 : Effectuer le test de conformite (methode manuelle)

**Reponse :**
```r
mu_0 <- 3000

# Compute test statistic
test_statistic <- (mean_empirical - mu_0) / (sd_empirical / sqrt(n))

# Critical region boundaries
critical_lower <- -qt(1 - alpha/2, df = n - 1)
critical_upper <- qt(1 - alpha/2, df = n - 1)

cat("Conformity test: H0: mu = 3000g\n")
cat("Test statistic: T =", round(test_statistic, 4), "\n")
cat("Critical region: (-inf,", round(critical_lower, 4), "] U [",
    round(critical_upper, 4), ", +inf)\n")
cat("|T| =", round(abs(test_statistic), 4), "\n")
cat("|T| > t_crit?", abs(test_statistic) > critical_upper, "\n")

if (abs(test_statistic) > critical_upper) {
  cat("Decision: REJECT H0\n")
} else {
  cat("Decision: FAIL TO REJECT H0\n")
}

# Manual p-value computation
p_value_manual <- 2 * pt(abs(test_statistic), df = n - 1, lower.tail = FALSE)
cat("\np-value:", round(p_value_manual, 4), "\n")
```

**Sortie attendue :**
```
Conformity test: H0: mu = 3000g
Test statistic: T = -1.0029
Critical region: (-inf, -1.7613 ] U [ 1.7613 , +inf)
|T| = 1.0029
|T| > t_crit? FALSE
Decision: FAIL TO REJECT H0

p-value: 0.3328
```

**Explication mathematique :**
$$T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}} = \frac{2700 - 3000}{1158.39 / \sqrt{15}} = \frac{-300}{299.14} = -1.003$$

Puisque $|T| = 1.003 < t_{14,\,0.05} = 1.761$, la statistique de test tombe dans la zone d'acceptation.

La p-valeur = 0,333 est $2 \times P(T > 1.003)$ ou $T \sim t(14)$. Puisque la p-valeur $= 0.333 > \alpha = 0.10$, on ne rejette pas $H_0$.

---

### Etape 4 : Utiliser la fonction `t.test()`

**Reponse :**
```r
test_result <- t.test(poids_poulpe, mu = mu_0, conf.level = 1 - alpha)
cat("Using t.test():\n")
print(test_result)
```

**Sortie attendue :**
```
Using t.test():

	One Sample t-test

data:  poids_poulpe
t = -1.0029, df = 14, p-value = 0.3328
alternative hypothesis: true mean is not equal to 3000
90 percent confidence interval:
 2173.149 3226.851
sample estimates:
mean of x
     2700
```

**Interpretation :**
- **t = -1,0029** : correspond au calcul manuel
- **df = 14** : $n - 1 = 15 - 1 = 14$
- **p-valeur = 0,3328** : probabilite d'observer des donnees aussi extremes si $H_0$ est vraie
- **IC a 90% = [2173,15 ; 3226,85]** : correspond au calcul manuel
- **Decision** : p-valeur $= 0.333 > \alpha = 0.10$, on NE REJETTE PAS $H_0$

« Ne pas rejeter $H_0$ » ne signifie PAS que « $H_0$ est vraie ». Cela signifie que nous n'avons pas suffisamment de preuves pour l'infirmer. Avec seulement 15 poulpes et une forte variabilite ($S' = 1158$g), le test manque de puissance pour detecter une difference de 300g.

---

## Exercice 2 : Comparaison de traitements -- Test t a deux echantillons (test d'homogeneite)

### Deux groupes (n=12, n=8) avec differents traitements. Tester si les moyennes different. Hypothese de variances egales.

**Theorie :**

- $H_0$ : $\mu_A = \mu_B$ (les moyennes sont egales)
- $H_1$ : $\mu_A \neq \mu_B$ (alternative bilaterale)
- Variance poolee : $S_p^2 = \frac{(n_A - 1)S_A'^2 + (n_B - 1)S_B'^2}{n_A + n_B - 2}$
- Statistique de test : $T = \frac{\bar{X}_A - \bar{X}_B}{S_p\sqrt{1/n_A + 1/n_B}} \sim t(n_A + n_B - 2)$ sous $H_0$

### Etape 1 : Calculer la variance poolee et la statistique de test

**Reponse :**
```r
na <- 12
nb <- 8
mean_a <- 1.5
mean_b <- 2.35
sd_a <- 0.95
sd_b <- 1.35
alpha <- 0.05

# Pooled variance estimate
sp2 <- ((na - 1)*sd_a^2 + (nb - 1)*sd_b^2) / (na + nb - 2)
sp <- sqrt(sp2)

# Test statistic
diff_means <- mean_a - mean_b
se_diff <- sp * sqrt(1/na + 1/nb)
t_stat <- diff_means / se_diff

# Critical value
df <- na + nb - 2
t_critical <- qt(1 - alpha/2, df = df)

cat("Two-sample t-test (equal variances assumed):\n")
cat("Group A: n=", na, ", mean=", mean_a, ", sd=", sd_a, "\n", sep = "")
cat("Group B: n=", nb, ", mean=", mean_b, ", sd=", sd_b, "\n\n", sep = "")
cat("Pooled variance S_p^2:", round(sp2, 4), "\n")
cat("Pooled SD S_p:", round(sp, 4), "\n")
cat("Difference in means:", diff_means, "\n")
cat("Standard error:", round(se_diff, 4), "\n")
cat("Test statistic T:", round(t_stat, 4), "\n")
cat("Degrees of freedom:", df, "\n")
cat("Critical value t_{18, 0.025}:", round(t_critical, 4), "\n\n")

cat("|T| =", round(abs(t_stat), 4), "\n")
cat("|T| > t_crit?", abs(t_stat) > t_critical, "\n")

if (abs(t_stat) > t_critical) {
  cat("Decision: REJECT H0 (means are significantly different)\n")
} else {
  cat("Decision: FAIL TO REJECT H0 (no significant difference)\n")
}
```

**Sortie attendue :**
```
Two-sample t-test (equal variances assumed):
Group A: n=12, mean=1.5, sd=0.95
Group B: n=8, mean=2.35, sd=1.35

Pooled variance S_p^2: 1.2614
Pooled SD S_p: 1.1231
Difference in means: -0.85
Standard error: 0.5125
Test statistic T: -1.6585
Degrees of freedom: 18
Critical value t_{18, 0.025}: 2.1009

|T| = 1.6585
|T| > t_crit? FALSE
Decision: FAIL TO REJECT H0 (no significant difference)
```

**Explication mathematique :**
$$S_p^2 = \frac{11 \times 0.95^2 + 7 \times 1.35^2}{18} = \frac{9.9275 + 12.7575}{18} = 1.2614$$

$$T = \frac{1.5 - 2.35}{1.1231 \times \sqrt{1/12 + 1/8}} = \frac{-0.85}{0.5125} = -1.659$$

Puisque $|T| = 1.659 < 2.101$, on ne peut pas rejeter $H_0$. Les petits echantillons ($n = 12$ et $n = 8$) combines a une forte variabilite empechent de detecter la difference.

---

### Etape 2 : Examiner l'effet d'un echantillon plus grand (na=120, nb=80)

**Reponse :**
```r
na_large <- 120
nb_large <- 80

sp2_large <- ((na_large - 1)*sd_a^2 + (nb_large - 1)*sd_b^2) / (na_large + nb_large - 2)
sp_large <- sqrt(sp2_large)
se_diff_large <- sp_large * sqrt(1/na_large + 1/nb_large)
t_stat_large <- diff_means / se_diff_large

df_large <- na_large + nb_large - 2
t_critical_large <- qt(1 - alpha/2, df = df_large)

cat("With larger samples (na=120, nb=80):\n")
cat("Pooled SD:", round(sp_large, 4), "\n")
cat("Standard error:", round(se_diff_large, 4), "\n")
cat("Test statistic T:", round(t_stat_large, 4), "\n")
cat("Critical value t_{198, 0.025}:", round(t_critical_large, 4), "\n")
cat("|T| > t_crit?", abs(t_stat_large) > t_critical_large, "\n")
cat("Decision:", ifelse(abs(t_stat_large) > t_critical_large,
                        "REJECT H0", "FAIL TO REJECT H0"), "\n")
```

**Sortie attendue :**
```
With larger samples (na=120, nb=80):
Pooled SD: 1.1231
Standard error: 0.1625
Test statistic T: -5.2309
Critical value t_{198, 0.025}: 1.9720
|T| > t_crit? TRUE
Decision: REJECT H0
```

**Explication mathematique :**
Avec 10 fois plus de donnees, les MEMES moyennes et ecarts-types produisent un resultat significatif. L'erreur standard diminue d'un facteur $\sqrt{10} \approx 3.16$ : de 0,5125 a 0,1625. La statistique de test passe de $-1.66$ a $-5.23$.

La significativite statistique depend de trois facteurs :
1. **Taille de l'effet** (0,85 unites) -- inchangee
2. **Variabilite** (ecart-type poolee 1,12) -- inchangee
3. **Taille de l'echantillon** (200 vs 20) -- multipliee par 10

---

## Exercice 3 : Remplissage de bouteilles de lait -- Analyse de puissance

### $\sigma = 1$ ml connu, objectif $\mu = 1000$ ml, $n = 40$ bouteilles. Tester la derive de calibrage, calculer la puissance pour detecter un ecart de 0,2 ml, determiner le $n$ necessaire pour 90% de puissance.

**Theorie :**

- **Puissance** $= 1 - \beta = P(\text{rejeter } H_0 \mid H_1 \text{ vraie})$
- **Erreur de type I** ($\alpha$) : rejeter $H_0$ a tort (faux positif)
- **Erreur de type II** ($\beta$) : ne pas rejeter $H_0$ alors que $H_1$ est vraie (faux negatif)

Pour un test $z$ ($\sigma$ connu) :
- Sous $H_0$ : $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}} \sim \mathcal{N}(0, 1)$
- Sous $H_1$ ($\mu = \mu_1$) : $Z \sim \mathcal{N}(\delta, 1)$ ou $\delta = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}}$
- Puissance $\approx 1 - \Phi(z_{\alpha/2} - \delta)$

### Etape 1 : Calculer l'effet standardise et la puissance

**Reponse :**
```r
sigma <- 1
mu_0 <- 1000
n_bottles <- 40
alpha <- 0.05
effect <- 0.2   # Shift to detect: mu_1 = 1000.2
mu_1 <- mu_0 + effect

z_crit <- qnorm(1 - alpha/2)

# Standardized effect (non-centrality parameter)
z_effect <- effect / (sigma / sqrt(n_bottles))

# Power (right tail dominates when delta > 0)
power <- 1 - pnorm(z_crit, mean = z_effect, sd = 1)

cat("Power analysis setup:\n")
cat("H0: mu = 1000 ml\n")
cat("H1: mu = 1000.2 ml (0.2ml shift)\n")
cat("sigma =", sigma, "ml, n =", n_bottles, "bottles, alpha =", alpha, "\n\n")
cat("Critical value z_{0.025}:", round(z_crit, 4), "\n")
cat("Standard error sigma/sqrt(n):", round(sigma/sqrt(n_bottles), 4), "\n")
cat("Standardized effect delta:", round(z_effect, 4), "\n")
cat("Power (n=40):", round(power, 4), "\n")
cat("Interpretation:", round(power*100, 1), "% chance of detecting 0.2ml shift\n")
```

**Sortie attendue :**
```
Power analysis setup:
H0: mu = 1000 ml
H1: mu = 1000.2 ml (0.2ml shift)
sigma = 1 ml, n = 40 bottles, alpha = 0.05

Critical value z_{0.025}: 1.9600
Standard error sigma/sqrt(n): 0.1581
Standardized effect delta: 1.2649
Power (n=40): 0.2445
Interpretation: 24.4 % chance of detecting 0.2ml shift
```

**Explication mathematique :**
$$\delta = \frac{\mu_1 - \mu_0}{\sigma/\sqrt{n}} = \frac{0.2}{1/\sqrt{40}} = 1.265$$

$$\text{Puissance} = 1 - \Phi(z_{\alpha/2} - \delta) = 1 - \Phi(1.96 - 1.265) = 1 - \Phi(0.695) = 0.244$$

Une puissance de 24,4% est tres faible -- le test ne detectera pas la derive environ 3 fois sur 4. La taille de l'effet (0,2 ml) est faible par rapport au bruit ($\sigma = 1$ ml).

---

### Etape 2 : Determiner le $n$ necessaire pour 90% de puissance

**Reponse :**
```r
target_power <- 0.90
n_needed <- 40

while (TRUE) {
  z_eff_n <- effect / (sigma / sqrt(n_needed))
  power_n <- 1 - pnorm(z_crit, mean = z_eff_n, sd = 1)
  if (power_n >= target_power) break
  n_needed <- n_needed + 1
}

cat("Sample size for 90% power:", n_needed, "bottles\n")
cat("Verification: power at n =", n_needed, "is",
    round(1 - pnorm(z_crit, mean = effect / (sigma / sqrt(n_needed)), sd = 1), 4), "\n")
```

**Sortie attendue :**
```
Sample size for 90% power: 263 bottles
Verification: power at n = 263 is 0.9003
```

**Explication mathematique :**
En fixant la puissance $= 0.90$ et en resolvant pour $n$ :

$$1 - \Phi(z_{\alpha/2} - \delta) = 0.90$$
$$z_{\alpha/2} - \delta = z_{0.10} = -1.282$$
$$1.96 - 0.2\sqrt{n} = -1.282$$
$$0.2\sqrt{n} = 3.242$$
$$\sqrt{n} = 16.21,\quad n = 263$$

---

### Etape 3 : Courbe de puissance

**Reponse :**
```r
n_range <- seq(40, 300, by = 1)
powers <- numeric(length(n_range))

for (i in 1:length(n_range)) {
  z_eff <- effect / (sigma / sqrt(n_range[i]))
  powers[i] <- 1 - pnorm(z_crit, mean = z_eff, sd = 1)
}

plot(n_range, powers,
     type = "l", col = "blue", lwd = 2,
     xlab = "Sample size (n)", ylab = "Power",
     main = "Power Curve: Detecting 0.2ml Shift")

abline(h = 0.80, col = "orange", lwd = 2, lty = 2)
abline(h = 0.90, col = "red", lwd = 2, lty = 2)
abline(v = n_needed, col = "gray", lty = 3)

legend("bottomright",
       legend = c("Power curve", "80% power", "90% power", paste("n =", n_needed)),
       col = c("blue", "orange", "red", "gray"),
       lwd = c(2, 2, 2, 1), lty = c(1, 2, 2, 3))
grid()
```

**Sortie attendue :**
Courbe en forme de S partant d'environ 0,24 a $n = 40$, franchissant 80% vers $n = 197$, et atteignant 90% a $n = 263$.

---

### Etape 4 : Tableau recapitulatif de puissance

**Reponse :**
```r
key_n <- c(40, 100, 150, 200, 263, 300, 400, 500)

cat("Power Summary Table:\n")
cat(sprintf("%-8s | %-20s | %-8s\n", "n", "Standardized effect", "Power"))
cat(strrep("-", 42), "\n")

for (n_val in key_n) {
  z_eff <- effect / (sigma / sqrt(n_val))
  pow <- 1 - pnorm(z_crit, mean = z_eff, sd = 1)
  cat(sprintf("%8d | %20.3f | %8.1f%%\n", n_val, z_eff, pow * 100))
}
```

**Sortie attendue :**
```
Power Summary Table:
n        | Standardized effect  | Power
------------------------------------------
      40 |                1.265 |    24.4%
     100 |                2.000 |    51.6%
     150 |                2.449 |    69.4%
     200 |                2.828 |    80.7%
     263 |                3.243 |    90.0%
     300 |                3.464 |    93.4%
     400 |                4.000 |    97.9%
     500 |                4.472 |    99.4%
```

**Explication mathematique :**
La taille d'echantillon requise evolue selon :

$$n = \left(\frac{z_{\alpha/2} + z_\beta}{\delta_{\text{brut}}/\sigma}\right)^2$$

ou $\delta_{\text{brut}} = \mu_1 - \mu_0$ et $z_\beta$ est le quantile correspondant a la puissance souhaitee. La puissance augmente avec : un $n$ plus grand, une taille d'effet plus grande, un $\alpha$ plus grand, un $\sigma$ plus petit.

---

## Resume : Cadre de decision pour les tests d'hypotheses

### Procedure de test

1. Enoncer les hypotheses : $H_0$ : $\mu = \mu_0$ vs $H_1$ : $\mu \neq \mu_0$
2. Choisir $\alpha$ (typiquement 0,05 ou 0,10)
3. Calculer la statistique de test : $T = (\bar{X} - \mu_0) / (S'/\sqrt{n})$
4. Trouver la valeur critique : $t_{n-1,\,\alpha/2}$ avec `qt()`
5. Decision : rejeter $H_0$ si $|T| >$ valeur critique (de maniere equivalente, p-valeur $< \alpha$)
6. Interpreter : formuler la conclusion dans le contexte du probleme

### Erreurs courantes

| Erreur | Correction |
|--------|-----------|
| « Accepter $H_0$ » | Dire « Ne pas rejeter $H_0$ » |
| p-valeur $= P(H_0$ est vraie$)$ | p-valeur $= P(\text{donnees aussi extremes} \mid H_0$ vraie$)$ |
| Petite p-valeur = grand effet | Petite p-valeur = improbable sous $H_0$ ; la taille de l'effet est independante |
| Non significatif = pas de difference | Peut simplement manquer de puissance (erreur de type II) |

### Reference des formules

| Test | Statistique | Distribution sous $H_0$ | Fonction R |
|------|-------------|--------------------------|------------|
| Un echantillon ($\sigma$ connu) | $Z = \frac{\bar{X} - \mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0, 1)$ | `pnorm()` |
| Un echantillon ($\sigma$ inconnu) | $T = \frac{\bar{X} - \mu_0}{S'/\sqrt{n}}$ | $t(n-1)$ | `t.test(x, mu=mu_0)` |
| Deux echantillons (var. egales) | $T = \frac{\bar{X}_A - \bar{X}_B}{S_p\sqrt{1/n_A + 1/n_B}}$ | $t(n_A + n_B - 2)$ | `t.test(x, y, var.equal=TRUE)` |
