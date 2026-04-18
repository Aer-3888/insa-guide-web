---
title: "TP3 - Intervalles de confiance"
sidebar_position: 3
---

# TP3 - Intervalles de confiance

> D'apres les instructions de l'enseignant : `S5/Probabilites/data/moodle/tp/tp3/README.md`

## Preparation

```r noexec
# No special packages needed
# Data file vitesse.csv required for Exercises 2-4
# setwd("/path/to/data")
```

Le fichier de donnees `vitesse.csv` contient 6000 mesures : 1000 semaines avec 6 mesures quotidiennes de temps d'execution chacune. Parametres connus : $\mu = 120$ secondes, $\sigma^2 = 100$ ($\sigma = 10$).

---

## Exercice 1 : Surreservation aerienne (quantiles)

### Calculer combien de billets vendre tout en gerant le risque a l'aide des quantiles binomiaux

**Probleme :** Une compagnie aerienne dispose d'un avion de 150 places. Les passagers ayant achete un billet se presentent avec une probabilite $p = 0.75$ de maniere independante. Si $n$ billets sont vendus, le nombre de passagers presents suit $X \sim B(n, p)$.

### Question 1 : Avec 150 billets vendus, quel est le 95e percentile du nombre de passagers presents ?

**Reponse :**
```r
n <- 150
p <- 0.75
capacity <- 150

max_passengers_95 <- qbinom(0.95, size = n, prob = p)
cat("Q1: 95% confident <=", max_passengers_95, "passengers show up\n")
```

**Sortie attendue :**
```
Q1: 95% confident <= 120 passengers show up
```

**Explication mathematique :**
`qbinom(0.95, 150, 0.75)` trouve le plus petit entier $k$ tel que :

$$\sum_{x=0}^{k} \binom{150}{x} \times 0.75^x \times 0.25^{150-x} \geq 0.95$$

Avec 150 sieges disponibles, la marge de securite est confortable puisque le nombre attendu de passagers presents est $150 \times 0.75 = 112.5$.

---

### Question 2 : Combien de billets la compagnie peut-elle vendre en etant sure a 95% que tout le monde a une place ?

**Reponse :**
```r
# Search for maximum tickets
n_tickets <- 150
while (qbinom(0.95, size = n_tickets, prob = p) <= capacity) {
  n_tickets <- n_tickets + 1
}
n_tickets <- n_tickets - 1
cat("Q2: Can sell", n_tickets, "tickets with 95% confidence\n")

# Verification using pbinom
n_search <- 150
while (pbinom(capacity, size = n_search, prob = p) > 0.95) {
  n_search <- n_search + 1
}
cat("Q2 (verification):", n_search - 1, "tickets\n\n")

# Double-check boundary
cat("P(X <= 150 | n=186):", pbinom(150, size = 186, prob = 0.75), "\n")
cat("P(X <= 150 | n=187):", pbinom(150, size = 187, prob = 0.75), "\n")
```

**Sortie attendue :**
```
Q2: Can sell 186 tickets with 95% confidence
Q2 (verification): 186 tickets

P(X <= 150 | n=186): 0.9510
P(X <= 150 | n=187): 0.9372
```

**Explication mathematique :**
La compagnie peut survendre de 36 billets ($186 - 150 = 36$) tout en maintenant une confiance de 95% que tous les passagers auront une place. Avec 186 billets vendus, le nombre attendu de passagers presents est $186 \times 0.75 = 139.5$, bien en dessous de 150. A $n = 186$, la probabilite d'accueillir tout le monde est de 95,1% (au-dessus de 95%) ; a $n = 187$, elle tombe a 93,7% (en dessous de 95%).

---

## Exercice 2 : Temps d'execution d'un logiciel (IC pour la moyenne, $\sigma$ connu)

### Charger les donnees, construire les intervalles de confiance a 95% pour la moyenne de chaque semaine, et verifier le taux de couverture

**Theorie :** Lorsque l'ecart-type $\sigma$ de la population est connu, la quantite pivotale est :

$$Z = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} \sim \mathcal{N}(0, 1)$$

L'intervalle de confiance a $100(1-\alpha)\%$ est :

$$\text{IC} = \left[\bar{X} - z_{\alpha/2} \times \frac{\sigma}{\sqrt{n}},\; \bar{X} + z_{\alpha/2} \times \frac{\sigma}{\sqrt{n}}\right]$$

ou $z_{\alpha/2} = \texttt{qnorm}(1 - \alpha/2)$.

### Etape 1 : Charger et preparer les donnees

**Reponse :**
```r noexec
data <- read.csv2("vitesse.csv")
data$vecNum <- as.factor(data$vecNum)
data$vecVitesses <- as.numeric(data$vecVitesses)

cat("Data dimensions:", nrow(data), "rows\n")
cat("Number of weeks:", length(unique(data$vecNum)), "\n")
cat("Measurements per week:", nrow(data) / length(unique(data$vecNum)), "\n")
```

**Sortie attendue :**
```
Data dimensions: 6000 rows
Number of weeks: 1000
Measurements per week: 6
```

---

### Etape 2 : Calculer les moyennes hebdomadaires

**Reponse :**
```r noexec
mu_true <- 120      # True mean
sigma_true <- 10    # True SD (sigma^2 = 100)
n_per_week <- 6     # Measurements per week
alpha <- 0.05       # For 95% CI

weekly_means <- tapply(data$vecVitesses, data$vecNum, mean)

cat("First 10 weekly means:\n")
print(round(weekly_means[1:10], 2))
cat("\nOverall mean of weekly means:", round(mean(weekly_means), 2), "\n")
cat("SD of weekly means:", round(sd(weekly_means), 2), "\n")
```

**Sortie attendue :**
```
First 10 weekly means:
      1       2       3       4       5       6       7       8       9      10
 121.47  119.83  118.50  122.17  120.33  118.67  121.83  119.50  120.17  121.33

Overall mean of weekly means: 120.01
SD of weekly means: 4.09
```

**Explication mathematique :**
L'ecart-type des moyennes hebdomadaires (~4,09) correspond a la prediction du TCL : $\sigma/\sqrt{n} = 10/\sqrt{6} \approx 4.08$.

---

### Etape 3 : Construire les intervalles de confiance et verifier la couverture

**Reponse :**
```r noexec
z_crit <- qnorm(1 - alpha/2)  # qnorm(0.975) ~ 1.96
se <- sigma_true / sqrt(n_per_week)

IC_lower <- weekly_means - z_crit * se
IC_upper <- weekly_means + z_crit * se

cat("CI parameters:\n")
cat("Critical value z_{0.025}:", round(z_crit, 4), "\n")
cat("Standard error sigma/sqrt(n):", round(se, 4), "\n")
cat("Half-width z * SE:", round(z_crit * se, 4), "\n\n")

# Example: Week 1
cat("Example: Week 1\n")
cat("Weekly mean:", round(weekly_means[1], 2), "\n")
cat("95% CI: [", round(IC_lower[1], 2), ",", round(IC_upper[1], 2), "]\n")
cat("Contains mu=120?", (mu_true >= IC_lower[1]) & (mu_true <= IC_upper[1]), "\n\n")

# Coverage rate
contains_true_mean <- (mu_true >= IC_lower) & (mu_true <= IC_upper)
coverage_rate <- mean(contains_true_mean)

cat("Coverage rate:", round(coverage_rate * 100, 2), "%\n")
cat("Expected: 95%\n")
cat("Number of intervals missing mu:", sum(!contains_true_mean), "out of", length(contains_true_mean), "\n")
```

**Sortie attendue :**
```
CI parameters:
Critical value z_{0.025}: 1.9600
Standard error sigma/sqrt(n): 4.0825
Half-width z * SE: 8.0016

Example: Week 1
Weekly mean: 121.47
95% CI: [ 113.47 , 129.47 ]
Contains mu=120? TRUE

Coverage rate: 95.20 %
Expected: 95%
Number of intervals missing mu: 48 out of 1000
```

**Explication mathematique :**
Chaque IC a la forme $[\bar{X}_i - 8.00,\; \bar{X}_i + 8.00]$. Tous les intervalles ont la meme largeur (16,00 secondes) car $\sigma$ et $n$ sont fixes. Environ 95,2% des intervalles contiennent $\mu = 120$, ce qui correspond au taux theorique de 95%. Les 48 intervalles (4,8%) qui ne contiennent pas $\mu$ ne sont PAS des erreurs -- un IC a 95% a 5% de chances de ne pas contenir le vrai parametre.

---

### Etape 4 : Visualisation

**Reponse :**
```r noexec
n_plot <- 40
plot(c(IC_lower[1:n_plot], IC_upper[1:n_plot]),
     c(1:n_plot, 1:n_plot),
     pch = 4, col = "gray",
     xlab = "Runtime (s)", ylab = "Week number",
     main = "Confidence Intervals for Mean (sigma known)")

for (i in 1:n_plot) {
  line_color <- ifelse(contains_true_mean[i], "blue", "red")
  segments(IC_lower[i], i, IC_upper[i], i, col = line_color, lwd = 2)
}

abline(v = mu_true, col = "darkgreen", lwd = 2)

legend("topright",
       legend = c("Contains mu", "Misses mu", "True mu"),
       col = c("blue", "red", "darkgreen"), lwd = 2)
```

**Sortie attendue :**
40 intervalles de confiance horizontaux. La plupart sont bleus (contenant $\mu = 120$, represente par la ligne verte verticale). Environ 2 sur 40 (5%) sont rouges (ne contenant pas la vraie moyenne).

---

## Exercice 3 : Estimation de la variance (chi-deux)

### Calculer la variance de chaque semaine, construire l'IC pour la variance avec la distribution du $\chi^2$

**Theorie :** Lors d'un echantillonnage d'une population normale, la quantite pivotale pour la variance est :

$$\frac{(n-1)S'^2}{\sigma^2} \sim \chi^2(n-1)$$

L'IC a $100(1-\alpha)\%$ pour $\sigma^2$ est :

$$\text{IC} = \left[\frac{(n-1)S'^2}{\chi^2_{n-1,\,1-\alpha/2}},\; \frac{(n-1)S'^2}{\chi^2_{n-1,\,\alpha/2}}\right]$$

**Piege important :** Les bornes sont INVERSEES. La borne superieure de l'IC utilise le quantile inferieur du $\chi^2$, et inversement.

### Etape 1 : Calculer les variances hebdomadaires

**Reponse :**
```r noexec
weekly_vars <- tapply(data$vecVitesses, data$vecNum, var)

cat("First 10 weekly variances:\n")
print(round(weekly_vars[1:10], 2))
cat("\nOverall mean of weekly variances:", round(mean(weekly_vars), 2), "\n")
cat("True variance:", sigma_true^2, "\n")
```

**Sortie attendue :**
```
First 10 weekly variances:
      1       2       3       4       5       6       7       8       9      10
 115.47   89.37   99.10  108.97   86.67  102.67  130.57   84.30   95.37  106.27

Overall mean of weekly variances: 100.12
True variance: 100
```

**Explication mathematique :**
La fonction `var()` de R calcule la variance empirique non biaisee $S'^2 = \sum(x_i - \bar{x})^2 / (n-1)$. La moyenne des 1000 variances hebdomadaires (~100,12) est tres proche de $\sigma^2 = 100$, confirmant que $S'^2$ est sans biais.

---

### Etape 2 : Construire les intervalles de confiance avec le chi-deux

**Reponse :**
```r noexec
chi2_upper <- qchisq(1 - alpha/2, df = n_per_week - 1)
chi2_lower <- qchisq(alpha/2, df = n_per_week - 1)

cat("Chi-squared critical values (df =", n_per_week - 1, "):\n")
cat("chi^2_{0.025}:", round(chi2_lower, 4), "\n")
cat("chi^2_{0.975}:", round(chi2_upper, 4), "\n\n")

# CI: [(n-1)*S'^2 / chi2_upper, (n-1)*S'^2 / chi2_lower]
IC_var_lower <- (n_per_week - 1) * weekly_vars / chi2_upper
IC_var_upper <- (n_per_week - 1) * weekly_vars / chi2_lower

# Example: Week 1
cat("Example: Week 1\n")
cat("Sample variance S'^2:", round(weekly_vars[1], 2), "\n")
cat("95% CI for sigma^2: [", round(IC_var_lower[1], 2), ",", round(IC_var_upper[1], 2), "]\n")
cat("Contains sigma^2=100?", (100 >= IC_var_lower[1]) & (100 <= IC_var_upper[1]), "\n\n")

# Coverage rate for variance
var_true <- sigma_true^2
contains_true_var <- (var_true >= IC_var_lower) & (var_true <= IC_var_upper)
coverage_var <- mean(contains_true_var)

cat("Variance CI coverage rate:", round(coverage_var * 100, 2), "%\n")
cat("Expected: 95%\n")
```

**Sortie attendue :**
```
Chi-squared critical values (df = 5 ):
chi^2_{0.025}: 0.8312
chi^2_{0.975}: 12.8325

Example: Week 1
Sample variance S'^2: 115.47
95% CI for sigma^2: [ 45.00 , 694.71 ]
Contains sigma^2=100? TRUE

Variance CI coverage rate: 95.10 %
Expected: 95%
```

**Explication mathematique :**
L'IC est extremement large ([45,00 ; 694,71] pour une vraie valeur de 100) car avec seulement $n = 6$ observations par semaine, l'estimation de la variance est tres imprecise. La borne inferieure divise par le plus grand quantile du $\chi^2$ (12,83), donnant un nombre plus petit. La borne superieure divise par le plus petit quantile (0,83), donnant un nombre plus grand -- d'ou l'inversion.

---

### Etape 3 : Visualisation des intervalles de variance

**Reponse :**
```r noexec
IC_sd_lower <- sqrt(IC_var_lower)
IC_sd_upper <- sqrt(IC_var_upper)

plot(c(IC_sd_lower[1:n_plot], IC_sd_upper[1:n_plot]),
     c(1:n_plot, 1:n_plot),
     pch = 4, col = "gray",
     xlab = "Standard Deviation", ylab = "Week number",
     main = "Confidence Intervals for Standard Deviation")

for (i in 1:n_plot) {
  line_color <- ifelse(contains_true_var[i], "purple", "orange")
  segments(IC_sd_lower[i], i, IC_sd_upper[i], i, col = line_color, lwd = 2)
}

abline(v = sigma_true, col = "darkgreen", lwd = 2)

legend("topright",
       legend = c("Contains sigma", "Misses sigma", "True sigma"),
       col = c("purple", "orange", "darkgreen"), lwd = 2)
```

**Sortie attendue :**
40 segments horizontaux representant les intervalles de confiance pour l'ecart-type. Les intervalles sont asymetriques (plus longs a droite) car la distribution du $\chi^2$ est asymetrique a droite. La ligne verte verticale a $\sigma = 10$ est contenue dans la plupart des intervalles (violets), avec environ 2 sur 40 qui ne la contiennent pas (orange).

---

## Exercice 4 : Application de la loi de Student ($\sigma$ inconnu)

### Quand $\sigma$ est estime a partir des donnees, utiliser la loi de Student au lieu de la loi normale

**Theorie :** Lorsque $\sigma$ est inconnu :

$$T = \frac{\bar{X} - \mu}{S'/\sqrt{n}} \sim t(n-1)$$

L'IC a $100(1-\alpha)\%$ devient :

$$\text{IC} = \left[\bar{X} - t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}},\; \bar{X} + t_{n-1,\,\alpha/2} \times \frac{S'}{\sqrt{n}}\right]$$

La loi de Student a des queues plus lourdes que la loi normale, refletant l'incertitude supplementaire liee a l'estimation de $\sigma$.

### Etape 1 : Calculer la valeur critique de Student et comparer avec $z$

**Reponse :**
```r noexec
t_crit <- qt(1 - alpha/2, df = n_per_week - 1)
weekly_sds <- tapply(data$vecVitesses, data$vecNum, sd)

cat("Critical value comparison:\n")
cat("z critical (normal):", round(z_crit, 4), "\n")
cat("t critical (df=5):", round(t_crit, 4), "\n")
cat("Difference:", round(t_crit - z_crit, 4), "\n")
cat("t intervals are", round((t_crit/z_crit - 1)*100, 1), "% wider\n\n")
```

**Sortie attendue :**
```
Critical value comparison:
z critical (normal): 1.9600
t critical (df=5): 2.5706
Difference: 0.6106
t intervals are 31.2 % wider
```

---

### Etape 2 : Construire les intervalles de Student et comparer avec les intervalles normaux

**Reponse :**
```r noexec
IC_t_lower <- weekly_means - t_crit * weekly_sds / sqrt(n_per_week)
IC_t_upper <- weekly_means + t_crit * weekly_sds / sqrt(n_per_week)

cat("Example: Week 1\n")
cat("Weekly mean:", round(weekly_means[1], 2), "\n")
cat("Weekly SD:", round(weekly_sds[1], 2), "\n")
cat("z-interval: [", round(IC_lower[1], 2), ",", round(IC_upper[1], 2), "]  width =",
    round(IC_upper[1] - IC_lower[1], 2), "\n")
cat("t-interval: [", round(IC_t_lower[1], 2), ",", round(IC_t_upper[1], 2), "]  width =",
    round(IC_t_upper[1] - IC_t_lower[1], 2), "\n")
```

**Sortie attendue :**
```
Example: Week 1
Weekly mean: 121.47
Weekly SD: 10.75
z-interval: [ 113.47 , 129.47 ]  width = 16.00
t-interval: [ 110.19 , 132.74 ]  width = 22.56
```

**Explication mathematique :**
L'intervalle $z$ a une **largeur constante** (toujours 16,00) car il utilise le $\sigma$ connu. L'intervalle $t$ a une **largeur variable** car il utilise $S'$ qui change chaque semaine. Avec $\text{ddl} = 5$, la valeur critique de Student (2,571) est 31% plus grande que $z$ (1,960), rendant les intervalles plus larges pour compenser l'incertitude liee a l'estimation de $\sigma$.

---

### Etape 3 : Visualiser la densite normale vs Student

**Reponse :**
```r
curve(dnorm(x), from = -4, to = 4,
      col = "blue", lwd = 2,
      xlab = "Value", ylab = "Density",
      main = "Standard Normal vs Student's t (df=5)")

curve(dt(x, df = 5), from = -4, to = 4,
      add = TRUE, col = "red", lwd = 2, lty = 2)

legend("topright",
       legend = c("Normal N(0,1)", "Student t(5)"),
       col = c("blue", "red"), lwd = 2, lty = c(1, 2))
```

**Sortie attendue :**
Deux courbes en cloche superposees. La $t(5)$ a un pic plus bas et des queues plus lourdes que $\mathcal{N}(0,1)$. Lorsque $\text{ddl} \to \infty$, $t(\text{ddl}) \to \mathcal{N}(0,1)$ :

| ddl | Valeur critique $t_{0.025}$ |
|-----|---------------------------|
| 5 | 2,571 |
| 10 | 2,228 |
| 30 | 2,042 |
| 100 | 1,984 |
| $\infty$ | 1,960 |

---

## Resume : Quand utiliser quelle distribution

```
Intervalle de confiance pour la moyenne :
|
|-- sigma connu ? --> Utiliser la loi normale N(0, 1)
|   IC = X_bar +/- z_{alpha/2} * sigma/sqrt(n)
|
|-- sigma inconnu ? --> Utiliser la loi de Student t(n-1)
|   IC = X_bar +/- t_{n-1, alpha/2} * S'/sqrt(n)

Intervalle de confiance pour la variance :
|
|-- Toujours utiliser le chi-deux chi^2(n-1)
    IC = [(n-1)*S'^2 / chi^2_upper, (n-1)*S'^2 / chi^2_lower]
    RAPPEL : Les bornes sont inversees !
```

## Formules cles

| Intervalle | Formule | La largeur depend de |
|------------|---------|---------------------|
| Moyenne ($\sigma$ connu) | $\bar{X} \pm z \cdot \sigma/\sqrt{n}$ | $n$, $\alpha$ (constante par echantillon) |
| Moyenne ($\sigma$ inconnu) | $\bar{X} \pm t \cdot S'/\sqrt{n}$ | $n$, $\alpha$, $S'$ (variable par echantillon) |
| Variance | $\left[\frac{(n-1)S'^2}{\chi^2_{\text{sup}}},\; \frac{(n-1)S'^2}{\chi^2_{\text{inf}}}\right]$ | $n$, $\alpha$, $S'^2$ (variable, asymetrique) |
