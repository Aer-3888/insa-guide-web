---
title: "TP2 -- Regression lineaire simple"
sidebar_position: 2
---

# TP2 -- Regression lineaire simple

> **Objectif** : Ajuster un modele lineaire, valider les hypotheses par l'analyse des residus,
> interpreter $R^2$ et les p-values, calculer des predictions, et corriger les problemes courants
> (non-linearite, outliers, heteroscedasticite).

---

## Vue d'ensemble

| Exercice | Donnees | Probleme rencontre | Solution |
|----------|---------|-------------------|----------|
| 1 -- Courrier | 21 obs., poids vs lettres | Aucun (cas ideal) | Regression simple |
| 2 -- Anscombe | 16 obs., X vs Y1-Y4 | Non-linearite, outlier, levier | Polynome, suppression, log |
| 3 -- Freinage | 11 obs., vitesse vs distance | Residus paraboliques | Ajout de Vitesse^2 |
| 4 -- Porcs | 19 obs., ingestion vs gain | Plafonnement | Modele polynomial + seuil |

### Rappel theorique : le modele lineaire simple

**Equation :** $Y = \beta_0 + \beta_1 X + \varepsilon$, avec $\varepsilon \sim \mathcal{N}(0, \sigma^2)$ iid

**Hypotheses a verifier :**
1. **Linearite** : relation lineaire entre X et Y (scatter plot)
2. **Independance** : erreurs non correlees
3. **Homoscedasticite** : variance constante des erreurs (graphe des residus)
4. **Normalite** : erreurs normalement distribuees (QQ-plot)

---

## Exercice 1 : Nombre de lettres et poids du courrier

### Enonce

Un etablissement de vente par correspondance recoit chaque jour un courrier de poids $x_i$ (en tonnes) consistant en $y_i$ milliers de lettres. Le responsable souhaite prevoir le nombre de lettres a trier a partir du poids du courrier. Il dispose de $n = 21$ releves.

### Q1 : Lecture des donnees

```r noexec
courrier <- read.table("Courrier.txt", header = TRUE)
attach(courrier)
```

### Q2 : Representer les donnees

Graphiquement, un modele lineaire semble-t-il justifie ?

```r noexec
plot(Poids, Nb_lettres,
     xlab = "Poids du courrier (t)",
     ylab = "Nombre de lettres",
     pch = 19, xlim = c(9, 39), ylim = c(700, 2500),
     main = "Relation entre poids et nombre de lettres")
```

**Observation :** Les points s'alignent clairement le long d'une droite croissante. Un modele lineaire semble justifie.

### Q3 : Ajuster un modele de regression simple

Ecrire un modele de regression simple permettant d'etudier la relation entre le nombre de lettres et le poids du courrier.

**Modele :** $\forall i \in \{1, \ldots, 21\}, \quad \text{Nb\_lettres}_i = \beta_0 + \beta_1 \text{Poids}_i + \varepsilon_i$ avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

```r noexec
reg <- lm(Nb_lettres ~ Poids, data = courrier)
resume <- summary(reg)
print(resume)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  198.0       75.3    2.63   0.0170 *
Poids         57.7        3.3   17.48  2.56e-12 ***
---
Residual standard error: 124.8 on 18 degrees of freedom
Multiple R-squared:  0.9444,  Adjusted R-squared:  0.9413
F-statistic: 305.6 on 1 and 18 DF,  p-value: 2.558e-12
```

**Parametres estimes :** $\hat{\beta}_0 = 198.0$, $\hat{\beta}_1 = 57.7$.

### Q4 : Tracer la droite de regression

Superposer la droite des moindres carres aux donnees.

```r noexec
x <- c(min(Poids), max(Poids))
y <- 198 + 57.7 * x
lines(x, y, col = "blue", lwd = 3)
```

### Q5 : Coefficient de determination $R^2$

Que vaut le coefficient de determination $R^2$ ? Programmer avec R le calcul de ce coefficient.

```r noexec
cat("R^2 =", resume$r.squared, "\n")
```

```
R^2 = 0.9444
```

**Interpretation :** $R^2 = 0.94$ signifie que **94.4%** de la variabilite du nombre de lettres est expliquee par le poids. Les 5.6% restants correspondent a la variabilite residuelle.

### Q6 : Graphe des residus

Tracer le graphe des residus avec les droites $y = 0$, $y = -2\hat{\sigma}$ et $y = 2\hat{\sigma}$. Commenter.

```r noexec
plot(reg$fitted.values, reg$residuals,
     xlab = "Valeurs ajustees", ylab = "Residus",
     main = "Analyse des residus")
abline(h = 0, col = "blue", lwd = 2)
abline(h = -2 * resume$sigma, col = "red", lty = 2)
abline(h =  2 * resume$sigma, col = "red", lty = 2)
```

**Interpretation :** Les residus sont **uniformement repartis** autour de 0, dans une bande horizontale. Aucune structure visible. Les hypotheses de linearite et d'homoscedasticite sont **validees**.

### Q7 : Test de significativite de $\beta_1$

Tester l'hypothese de nullite du parametre $\beta_1$. Le modele propose est-il interessant ?

**Procedure en 5 etapes :**

1. **Hypotheses :**
   - $H_0 : \beta_1 = 0$ (le poids n'a pas d'influence)
   - $H_1 : \beta_1 \neq 0$ (le poids a une influence)

2. **Statistique de test :** $T = \hat{\beta}_1 / SE(\hat{\beta}_1) = 57.7 / 3.3 = 17.48$

3. **Distribution sous $H_0$ :** $T \sim t_{n-2} = t_{19}$

4. **Region de rejet ($\alpha = 5\%$) :** $|T| > t_{19, 0.975} \approx 2.093$

5. **Decision :** $|17.48| > 2.093$, on **rejette $H_0$**. Le poids influence significativement le nombre de lettres. Le modele est interessant.

### Q8 : Prediction ponctuelle pour Poids = 27.5

Prevoir le nombre de lettres a trier lorsque le poids du courrier est egal a $x_{n+1} = 27.5$ par un calcul direct, puis en utilisant la fonction `predict`.

```r noexec
# Calcul direct
pred_manuelle <- 198 + 57.7 * 27.5
cat("Prediction manuelle :", pred_manuelle, "\n")

# Avec predict()
pred_ponctuelle <- predict(reg, data.frame(Poids = 27.5))
cat("Prediction avec predict() :", pred_ponctuelle, "\n")
```

```
Prediction manuelle : 1784.75
Prediction avec predict() : 1784.749
```

### Q9 : Intervalle de prevision a 95%

Le modele lineaire simple stipule que $Y_{n+1} = \beta_0 + \beta_1 x_{n+1} + \varepsilon_{n+1}$. On peut montrer que :

$$\frac{Y_{n+1} - \hat{y}_{n+1}}{\hat{\sigma}\sqrt{1 + \frac{1}{n} + \frac{(x_{n+1} - \bar{x})^2}{\sum_{i=1}^n (x_i - \bar{x})^2}}} \sim t_{n-2}$$

Determiner les bornes de l'intervalle de confiance $IC_{95\%}(Y_{n+1})$.

```r noexec
pred_intervalle <- predict(reg, data.frame(Poids = 27.5), interval = "prediction")
print(pred_intervalle)
```

```
       fit      lwr      upr
1 1784.749 1515.839 2053.659
```

**Interpretation :** Pour un sac de 27.5 tonnes, on predit entre **1516 et 2054 lettres** avec 95% de confiance. La prediction ponctuelle est 1785.

**Difference intervalle de confiance vs intervalle de prevision :**
- **IC (confidence)** : encadre la **moyenne** de Y pour X donne -- plus etroit.
- **IP (prediction)** : encadre une **nouvelle observation** individuelle -- plus large car inclut la variabilite individuelle.

### Q10 : Tracer les intervalles de prevision

A l'aide de la fonction `predict`, tracer les courbes des bornes inferieures et superieures de l'intervalle de prevision de niveau 95%, pour un poids compris entre 0 et 40.

```r noexec
I <- predict(reg, data.frame(Poids = 0:40), interval = "prediction")
plot(Poids, Nb_lettres,
     xlab = "Poids (t)", ylab = "Nombre de lettres",
     main = "Regression avec intervalles de prevision")
lines(0:40, I[, "lwr"], col = "red", lty = 2)
lines(0:40, I[, "upr"], col = "red", lty = 2)
lines(0:40, I[, "fit"], col = "blue", lwd = 2)
```

```r noexec
detach(courrier)
```

---

## Exercice 2 : Les dangers de la regression simple

### Enonce

Lire le fichier `tomassone.txt` contenant une variable explicative X et 4 variables a expliquer Y1, ..., Y4. Pour chacune des variables $Y_i$, effectuer la regression de $Y_i$ sur X. La regression effectuee semble-t-elle correcte ? Si ce n'est pas le cas, identifier le probleme et proposer une solution.

**Indication :** Pour chacune des regressions, tracer le nuage de points et le graphe des residus.

```r noexec
tomassone <- read.table("tomassone.txt", header = TRUE)
attach(tomassone)
```

---

### Y1 : Cas ideal -- le modele lineaire fonctionne

```r noexec
plot(X, Y1, main = "Y1 vs X", pch = 19)
reg1 <- lm(Y1 ~ X, data = tomassone)
resume1 <- summary(reg1)
print(resume1)
abline(reg1, col = "blue", lwd = 3)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  1.1266     2.2407   0.503    0.623
X            0.7880     0.1574   5.007  0.000202 ***
---
Multiple R-squared:  0.6416
```

**Graphe des residus :**

```r noexec
plot(reg1$fitted.values, reg1$residuals,
     main = "Residus de Y1",
     xlab = "Valeurs ajustees", ylab = "Residus")
abline(h = 0, col = "blue")
```

**Diagnostic :** Les points sont repartis **uniformement et aleatoirement** autour de 0. Pas de structure. Le modele lineaire est **adapte**.

---

### Y2 : Non-linearite -- relation parabolique

```r noexec
plot(X, Y2, main = "Y2 vs X", pch = 19)
reg2 <- lm(Y2 ~ X, data = tomassone)
resume2 <- summary(reg2)
print(resume2)
abline(reg2, col = "red", lwd = 3)
```

```
Multiple R-squared:  0.6199
```

**Graphe des residus :**

```r noexec
plot(reg2$fitted.values, reg2$residuals,
     main = "Residus de Y2",
     xlab = "Valeurs ajustees", ylab = "Residus")
abline(h = 0, col = "blue")
```

**Diagnostic :** Les residus dessinent une **parabole** (U inverse). La relation est non-lineaire. Le modele lineaire capture mal la courbure.

**Solution : ajouter $X^2$**

```r noexec
X2 <- tomassone[, "X"]^2
tomassone2 <- cbind(tomassone, X2)
reg2_poly <- lm(Y2 ~ X + X2, data = tomassone2)
resume2_poly <- summary(reg2_poly)
print(resume2_poly)
```

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept) -21.5589     2.2661  -9.512 3.82e-07 ***
X             3.8978     0.3229  12.071 1.73e-08 ***
X2           -0.1069     0.0109  -9.790 2.75e-07 ***
---
Multiple R-squared:  0.9701
```

**Interpretation :** $R^2$ passe de 0.62 a **0.97** -- le modele polynomial est largement superieur. Le terme $X^2$ est hautement significatif ($p = 2.75 \times 10^{-7}$).

```r noexec
plot(X, Y2, main = "Y2 avec modele polynomial", pch = 19)
lines(X, predict(reg2_poly), col = "blue", lwd = 3)
```

---

### Y3 : Valeur aberrante (outlier)

```r noexec
plot(X, Y3, main = "Y3 vs X", pch = 19)
reg3 <- lm(Y3 ~ X, data = tomassone)
resume3 <- summary(reg3)
print(resume3)
abline(reg3, col = "green", lwd = 3)
```

**Graphe des residus avec bandes a $\pm 2\hat{\sigma}$ :**

```r noexec
plot(reg3$fitted.values, reg3$residuals,
     ylim = c(-10, 10),
     main = "Residus de Y3",
     xlab = "Valeurs ajustees", ylab = "Residus")
abline(h = 0, col = "blue")
abline(h = -2 * resume3$sigma, col = "red")
abline(h =  2 * resume3$sigma, col = "red")
```

**Diagnostic :** Un point (observation 16, X=23, Y3=29.43) a un residu qui **depasse largement** la bande a $\pm 2\sigma$. C'est une valeur aberrante qui tire la droite de regression vers le haut.

**Solution : supprimer l'outlier et recalculer**

```r noexec
tomassone3 <- tomassone[-16, ]
reg3_clean <- lm(Y3 ~ X, data = tomassone3)
resume3_clean <- summary(reg3_clean)
print(resume3_clean)
```

```
Multiple R-squared:  0.9972
```

**Interpretation :** $R^2$ passe de ~0.67 a **0.997**. Sans l'outlier, la relation est presque parfaitement lineaire. Les residus du modele nettoye sont tous dans la bande a $\pm 2\sigma$.

**Attention :** Supprimer un outlier doit toujours etre justifie (erreur de mesure, donnee aberrante). Ne jamais supprimer un point juste pour ameliorer $R^2$.

---

### Y4 : Transformation logarithmique necessaire

```r noexec
plot(X, Y4, main = "Y4 vs X", pch = 19)
reg4 <- lm(Y4 ~ X, data = tomassone)
resume4 <- summary(reg4)
print(resume4)
abline(reg4, col = "purple", lwd = 3)
```

**Graphe des residus :**

```r noexec
plot(reg4$fitted.values, reg4$residuals,
     ylim = c(-8, 8), main = "Residus de Y4")
abline(h = 0, col = "blue")
abline(h = -2 * resume4$sigma, col = "red")
abline(h =  2 * resume4$sigma, col = "red")
```

**Diagnostic :** Les residus montrent une structure non aleatoire. La variance n'est pas constante.

**Solution : transformation $\log(Y4)$ + modele polynomial**

```r noexec
reg4_log <- lm(log(Y4) ~ X, data = tomassone)

X2 <- tomassone[, "X"]^2
tomassone4 <- cbind(tomassone, X2)
reg4_poly <- lm(log(Y4) ~ X + X2, data = tomassone4)
resume4_poly <- summary(reg4_poly)
print(resume4_poly)
```

```r noexec
plot(X, log(Y4), main = "log(Y4) avec modele polynomial", pch = 19)
lines(X, predict(reg4_poly), col = "blue", lwd = 3)
```

**Verification des residus :**

```r noexec
plot(reg4_poly$fitted.values, reg4_poly$residuals,
     ylim = c(-0.5, 0.5),
     main = "Residus du modele polynomial sur log(Y4)")
abline(h = 0, col = "blue")
abline(h = -2 * resume4_poly$sigma, col = "red")
abline(h =  2 * resume4_poly$sigma, col = "red")
```

**Interpretation :** Les residus du modele log-polynomial sont maintenant aleatoires et homoscedastiques. La combinaison transformation log + terme quadratique corrige a la fois la non-linearite et l'heteroscedasticite.

```r noexec
detach(tomassone)
```

### Bilan de l'exercice 2 : Arbre de decision diagnostique

```
1. Tracer Y vs X
   -> Relation lineaire visible ? -> Ajuster lm(Y ~ X)

2. Analyser les residus
   -> Residus aleatoires autour de 0 ? -> Modele valide
   -> Forme parabolique ?              -> Ajouter X^2 : lm(Y ~ X + I(X^2))
   -> Point isole > 2*sigma ?          -> Verifier et supprimer l'outlier
   -> Variance croissante (entonnoir) ? -> Transformer : lm(log(Y) ~ X)
```

---

## Exercice 3 : Distance d'arret et distance de freinage

### Enonce

La distance d'arret d'un vehicule est egale a la distance de reaction augmentee de la distance de freinage. On se propose de modeliser la distance de freinage en fonction de la vitesse du vehicule.

### Q1 : Importer les donnees

```r noexec
freinage <- read.table("freinage.txt", header = TRUE)
attach(freinage)
```

### Q2 : Representer le nuage de points

```r noexec
plot(Vitesse, Dist,
     main = "Distance de freinage vs Vitesse",
     xlab = "Vitesse (km/h)", ylab = "Distance d'arret (m)",
     pch = 19)
```

**Observation :** Les points montrent une tendance croissante, mais la courbure est visible -- la distance augmente plus que proportionnellement avec la vitesse.

### Q3 : Regression lineaire simple

Ajuster le modele : $\forall i \in \{1, \ldots, 11\}, \quad \text{Dist}_i = \beta_0 + \beta_1 \text{Vitesse}_i + \varepsilon_i$ avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

```r noexec
reg <- lm(Dist ~ Vitesse, data = freinage)
resume <- summary(reg)
print(resume)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept) -41.1727     4.9107  -8.386 1.64e-05 ***
Vitesse       1.0536     0.0508  20.737 3.61e-09 ***
---
Multiple R-squared:  0.9796,  Adjusted R-squared:  0.9773
```

**Interpretation :**
- $\hat{\beta}_0 = -41.17$, $\hat{\beta}_1 = 1.054$.
- $R^2 = 0.98$ : 98% de la variabilite de la distance est expliquee par la vitesse.
- $p\text{-value} = 3.61 \times 10^{-9} \ll 0.05$ : on peut affirmer au risque de 5% que la vitesse a une influence sur la distance de freinage.

### Q4 : Tracer la droite de regression en rouge

```r noexec
lines(Vitesse, predict(reg), col = "red", lwd = 3)
```

### Q5 : Graphe des residus -- les hypotheses sont-elles verifiees ?

```r noexec
plot(reg$fitted.values, reg$residuals,
     ylim = c(-10, 10),
     main = "Residus du modele lineaire",
     xlab = "Valeurs ajustees", ylab = "Residus")
abline(h = 0, col = "blue")
abline(h = -2 * resume$sigma, col = "red")
abline(h =  2 * resume$sigma, col = "red")
```

**Diagnostic :** Malgre un $R^2$ de 0.98, les residus montrent une **allure parabolique** (negatifs aux extremites, positifs au centre). Les hypotheses d'application du modele ne sont **pas verifiees**.

**Connexion physique :** La distance de freinage depend du **carre** de la vitesse (energie cinetique = $\frac{1}{2}mv^2$). Un modele polynomial est physiquement justifie.

**Nouveau modele :** $\text{Dist}_i = \beta_0 + \beta_1 \text{Vitesse}_i + \beta_2 \text{Vitesse}_i^2 + \varepsilon_i$

```r noexec
Vitesse2 <- freinage[, "Vitesse"]^2
freinage2 <- cbind(freinage, Vitesse2)

reg2 <- lm(Dist ~ Vitesse + Vitesse2, data = freinage2)
resume2 <- summary(reg2)
print(resume2)
```

**Sortie R :**

```
Coefficients:
              Estimate Std. Error t value Pr(>|t|)
(Intercept)  7.413e+00  8.011e+00   0.925    0.382
Vitesse     -4.847e-01  1.908e-01  -2.540    0.035 *
Vitesse2     8.569e-03  1.048e-03   8.176 3.94e-05 ***
---
Multiple R-squared:  0.9977
```

**Interpretation :** $R^2 = 0.9977$ : amelioration nette. Le coefficient de $\text{Vitesse}^2$ est hautement significatif ($p = 3.94 \times 10^{-5}$). Les residus du modele polynomial sont maintenant **aleatoires et homoscedastiques**.

```r noexec
plot(reg2$fitted.values, reg2$residuals,
     ylim = c(-10, 10),
     main = "Residus du modele polynomial")
abline(h = 0, col = "blue")
abline(h = -2 * resume2$sigma, col = "red")
abline(h =  2 * resume2$sigma, col = "red")
```

### Q6 : Prediction de la distance d'arret pour 85 km/h

Vous roulez a 85 km/h avec un temps de reaction de 2 secondes. Distance d'arret = distance de reaction + distance de freinage.

```r noexec
p1 <- predict(reg, data.frame(Vitesse = 85))
p2 <- predict(reg2, data.frame(Vitesse = 85, Vitesse2 = 85^2))

# Conversion : 85 km/h = 85/3.6 = 23.61 m/s
# Distance de reaction = 23.61 * 2 = 47.22 m

Da1 <- p1 + (85/3.6) * 2
Da2 <- p2 + (85/3.6) * 2

cat("Distance de freinage (lineaire)     :", p1, "m\n")
cat("Distance de freinage (polynomial)   :", p2, "m\n")
cat("Distance totale d'arret (lineaire)  :", Da1, "m\n")
cat("Distance totale d'arret (polynomial):", Da2, "m\n")
```

**Sortie R :**

```
Distance de freinage (lineaire)     : 48.38 m
Distance de freinage (polynomial)   : 52.53 m
Distance totale d'arret (lineaire)  : 95.60 m
Distance totale d'arret (polynomial): 99.75 m
```

**Interpretation :** Le modele polynomial predit une distance de freinage legerement plus grande. A 85 km/h, la distance totale d'arret est d'environ **100 metres** (incluant 2 secondes de temps de reaction). Le modele polynomial est plus fiable car il respecte la physique du freinage.

```r noexec
detach(freinage)
```

---

## Exercice 4 : Modelisation du depot de proteines chez les porcs

### Enonce

On cherche a modeliser la relation entre le gain journalier en proteines et l'ingestion journaliere. 19 porcs en croissance dans des conditions controlees.

### Q1 : Importer les donnees

```r noexec
porcs <- read.csv2("porcs.csv")   # csv2 car format francais (sep = ";", dec = ",")
attach(porcs)
```

### Q2 : Representer le nuage de points

```r noexec
plot(ingestion, gain,
     main = "Gain en proteines vs Ingestion",
     xlab = "Ingestion journaliere (MJ/jour)",
     ylab = "Gain journalier en proteines (g/jour)",
     pch = 19)
```

**Observation :** Le gain augmente avec l'ingestion jusqu'a environ 28, puis semble **plafonner**. La relation n'est pas lineaire sur tout le domaine.

### Q3 : Regression lineaire simple

$\forall i \in \{1, \ldots, 19\}, \quad \text{gain}_i = \beta_0 + \beta_1 \text{ingestion}_i + \varepsilon_i$ avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

```r noexec
reg <- lm(gain ~ ingestion, data = porcs)
resume <- summary(reg)
print(resume)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)   69.01     21.45    3.22   0.00506 **
ingestion      3.34      0.74    4.50   0.00033 ***
---
Multiple R-squared:  0.5434
```

**Interpretation :**
- $\hat{\beta}_0 = 69.01$, $\hat{\beta}_1 = 3.34$.
- $R^2 = 0.54$ : seulement **54%** de la variabilite expliquee. C'est **moyen**.
- $p\text{-value} = 0.00033 < 0.05$ : on peut affirmer que l'ingestion journaliere a un effet significatif sur le gain journalier en proteines au risque de 5%.

### Q4 : Tracer la droite de regression en rouge

```r noexec
lines(ingestion, predict(reg), col = "red", lwd = 3)
```

### Q5 : Graphe des residus

```r noexec
plot(reg$fitted.values, reg$residuals,
     ylim = c(-50, 50),
     main = "Residus du modele lineaire",
     xlab = "Valeurs ajustees", ylab = "Residus")
abline(h = 0, col = "blue")
abline(h = -2 * resume$sigma, col = "red")
abline(h =  2 * resume$sigma, col = "red")
```

**Diagnostic :** Les residus montrent une **forme parabolique** (negatifs aux extremites, positifs au centre). Les hypotheses d'application du modele ne sont **pas verifiees**.

**Solution : modele polynomial avec $\text{ingestion}^2$**

```r noexec
ingestion2 <- porcs[, "ingestion"]^2
porcs2 <- cbind(porcs, ingestion2)

reg2 <- lm(gain ~ ingestion + ingestion2, data = porcs2)
resume2 <- summary(reg2)
print(resume2)
```

**Sortie R :**

```
Coefficients:
             Estimate Std. Error t value Pr(>|t|)
(Intercept) -469.25    178.95   -2.623   0.0186 *
ingestion     42.67     12.82    3.328   0.0043 **
ingestion2    -0.70      0.23   -3.087   0.0072 **
---
Multiple R-squared:  0.7121
```

**Interpretation :** $R^2$ passe de 0.54 a **0.71**. Le coefficient de $\text{ingestion}^2$ est significatif et **negatif**, confirmant la courbure concave (plafonnement).

### Q6 : Modele avec seuil (contrainte de continuite)

Apres avoir bien examine le nuage de points, on propose d'ajuster les donnees par une fonction de la forme :

$$y = \begin{cases} \beta_0 + \beta_1 x & \text{si } x \leq 28 \\ \beta_2 & \text{si } x > 28 \end{cases}$$

continue au point $x = 28$.

#### Q6a : Eliminer le parametre $\beta_2$ par la contrainte de continuite

La continuite en $x = 28$ impose : $\beta_0 + \beta_1 \times 28 = \beta_2$. Donc $\beta_2 = \beta_0 + 28\beta_1$. Le modele se reecrit avec seulement 2 parametres.

#### Q6b : Construire la matrice X

L'ecriture matricielle du modele est $Y = X\beta + E$ avec :

$$X_i = \begin{cases} (1, \text{ingestion}_i) & \text{si ingestion}_i \leq 28 \\ (1, 28) & \text{si ingestion}_i > 28 \end{cases}$$

```r noexec
n <- nrow(porcs)
X <- cbind(rep(1, n), pmin(ingestion, 28))
```

#### Q6c : Estimer $\hat{\beta}_0$ et $\hat{\beta}_1$

On peut utiliser `lm()` sur les donnees filtrees :

```r noexec
porcs_inf28 <- porcs[ingestion <= 28, ]
reg3 <- lm(gain ~ ingestion, data = porcs_inf28)
resume3 <- summary(reg3)
print(resume3)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  -41.69     56.78   -0.734    0.482
ingestion      7.97      2.23    3.572    0.005 **
---
Multiple R-squared:  0.5609
```

$\hat{\beta}_0 = -41.69$, $\hat{\beta}_1 = 7.97$.

#### Q6d : Tracer la courbe d'ajustement en bleu

```r noexec
plot(ingestion, gain,
     main = "Modele avec seuil a ingestion = 28",
     pch = 19)

# Partie lineaire (ingestion <= 28)
lines(porcs_inf28$ingestion, predict(reg3), col = "blue", lwd = 3)

# Partie constante (ingestion > 28) : valeur predite au seuil
x_sup28 <- porcs[ingestion > 28, ]$ingestion
y_sup28 <- rep(predict(reg3, data.frame(ingestion = 28)), length(x_sup28))
lines(x_sup28, y_sup28, col = "blue", lwd = 3)
```

**Interpretation :** Le modele predit une augmentation lineaire du gain jusqu'a ingestion = 28, puis un plateau a environ $(-41.69) + 7.97 \times 28 \approx 181.5$ g/jour. Ce modele est coherent avec la biologie : au-dela d'un certain apport, l'organisme sature.

#### Q6e : Coefficient de determination $R^2$

```r noexec
y_pred <- ifelse(ingestion <= 28,
                 coef(reg3)[1] + coef(reg3)[2] * ingestion,
                 coef(reg3)[1] + coef(reg3)[2] * 28)
SCR <- sum((gain - y_pred)^2)
SCT <- sum((gain - mean(gain))^2)
R2 <- 1 - SCR / SCT
cat("R^2 du modele avec seuil :", R2, "\n")
```

```r noexec
detach(porcs)
```

---

## Resume : arbre de diagnostic pour la regression simple

```
Etape 1 : VISUALISER (plot X, Y)
  |
  +--> Relation lineaire visible ? --> lm(Y ~ X)
  +--> Courbure visible ? --> Envisager X^2 ou log
  +--> Pas de relation ? --> Regression inutile
  |
Etape 2 : AJUSTER le modele --> summary(reg)
  |
  +--> R^2 > 0.7 ? --> OK en premiere approche
  +--> p-value de beta_1 < 0.05 ? --> Significatif
  |
Etape 3 : VERIFIER les residus (plot fitted vs residuals)
  |
  +--> Aleatoires autour de 0 ? --> Modele valide
  +--> Parabole ? --> Ajouter X^2
  +--> Entonnoir ? --> log(Y)
  +--> Point isole > 2*sigma ? --> Verifier, supprimer si justifie
  |
Etape 4 : PREDIRE --> predict(reg, newdata, interval = "prediction")
```
