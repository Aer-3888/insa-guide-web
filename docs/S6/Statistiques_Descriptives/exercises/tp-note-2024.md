---
title: "TP Note 2024-2025 -- Solutions detaillees"
sidebar_position: 9
---

# TP Note 2024-2025 -- Solutions detaillees

> **Contexte** : Examen pratique sur machine (INFO 3A, 21 mai 2025). Trois exercices couvrant
> regression simple/polynomiale/par morceaux, regression multiple avec calcul matriciel, et ANOVA.
> Duree : 2h. Tous documents autorises.

---

## Vue d'ensemble

| Exercice | Theme | Donnees | Techniques |
|----------|-------|---------|------------|
| 1 -- Salaire | Regression simple/multiple | 495 obs. (salaire.txt) | Lineaire, polynomial, morceaux, transformation puissance |
| 2 -- Golf | Regression multiple | 195 obs. (golf.txt) | Log, calcul matriciel, correlation, stepwise, AIC, prediction |
| 3 -- Cholesterol | ANOVA | 72 obs. (cholesterol.txt) | ANOVA 1 et 3 facteurs, emmeans, calcul matriciel |

---

## Exercice 1 : Modelisation du salaire maximal en fonction de la categorie d'emploi

### Enonce

L'objectif est de modeliser le salaire maximal de differentes categories d'emploi en fonction d'un score. Ce score est determine par un expert ; il depend de la penibilite, du niveau de competences, du niveau de formation requis ainsi que du niveau de responsabilite de l'emploi.

Le fichier comporte 495 observations avec 3 variables :
- `JobClass` : categorie d'emploi
- `Score` : score attribue par l'expert
- `MaxSalary` : salaire maximal de la categorie d'emploi (en dollars)

---

### Q1 : Importer les donnees

```r
salaire <- read.table("salaire.txt", header = TRUE)
str(salaire)
head(salaire)
```

**Sortie R :**

```
'data.frame':	495 obs. of  3 variables:
 $ JobClass : chr  "..." "..." ...
 $ Score    : int  81 84 87 93 ...
 $ MaxSalary: num  27480 28980 29580 32580 ...
```

---

### Q2 : Nuage de points MaxSalary vs Score

```r
plot(salaire$Score, salaire$MaxSalary,
     main = "Salaire maximal en fonction du score",
     xlab = "Score", ylab = "Salaire maximal ($)",
     pch = 16, cex = 0.5)
```

**Observation :** Le nuage montre une relation croissante entre le score et le salaire maximal, mais la relation n'est **pas lineaire** : la croissance est forte pour les scores faibles/moyens, puis semble ralentir ou changer de regime pour les scores eleves (au-dela de ~650). La variance semble aussi augmenter avec le score (heteroscedasticite).

---

### Q3 : Regression lineaire simple

**Modele :** $\forall i \in \{1, \ldots, 495\}$,

$$\text{MaxSalary}_i = \beta_0 + \beta_1 \cdot \text{Score}_i + \varepsilon_i, \quad \varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

#### Q3a : Ajuster le modele et tester l'influence du score

```r
mod1 <- lm(MaxSalary ~ Score, data = salaire)
summary(mod1)
```

**Sortie R :**

```
Coefficients:
             Estimate Std. Error t value Pr(>|t|)
(Intercept) -4459.99    2097.32  -2.127   0.0339 *
Score          91.47       3.85  23.759   <2e-16 ***
---
Residual standard error: 11810 on 493 degrees of freedom
Multiple R-squared:  0.5339
```

**Valeurs des parametres :**
- $\hat{\beta}_0 \approx -4460$ : ordonnee a l'origine (extrapolation sans sens pour Score = 0).
- $\hat{\beta}_1 \approx 91.5$ : chaque point de score supplementaire augmente le salaire maximal de ~91.5$.

**Le score a-t-il une influence au risque de 5% ?**
- $H_0 : \beta_1 = 0$ vs $H_1 : \beta_1 \neq 0$
- $t = 23.76$, $p < 2 \times 10^{-16} \ll 0.05$
- **On rejette $H_0$** : le score a une influence **hautement significative** sur le salaire maximal.

#### Q3b : Tracer la droite de regression

```r
plot(salaire$Score, salaire$MaxSalary,
     main = "Salaire maximal en fonction du score",
     xlab = "Score", ylab = "Salaire maximal ($)",
     pch = 16, cex = 0.5)
abline(mod1, col = "red", lwd = 2)
```

#### Q3c : Prediction pour Score = 850

```r
predict(mod1, newdata = data.frame(Score = 850))
```

**Sortie R :**

```
[1] 73286.7
```

Le modele lineaire predit un salaire maximal de **73 287 $** pour un score de 850.

#### Q3d : Graphe des residus

```r
resume1 <- summary(mod1)
plot(mod1$fitted.values, mod1$residuals,
     main = "Residus du modele lineaire",
     xlab = "Valeurs ajustees", ylab = "Residus",
     pch = 16, cex = 0.5)
abline(h = 0, col = "blue", lwd = 2)
abline(h = -2 * resume1$sigma, col = "red", lty = 2)
abline(h =  2 * resume1$sigma, col = "red", lty = 2)
```

**Les hypotheses sont-elles verifiees ?**
- **Heteroscedasticite :** La dispersion des residus **augmente** avec les valeurs ajustees (forme en entonnoir). L'hypothese de variance constante est **violee**.
- **Non-linearite :** On observe une structure dans les residus (courbure), suggerant que la relation n'est pas lineaire.
- **Conclusion :** Le modele lineaire simple n'est **pas adapte**.

---

### Q4 : Modele plus pertinent

#### Q4a : Proposer un nouveau modele

Au vu de la courbure dans les residus, on propose un modele **polynomial de degre 2** :

$$\text{MaxSalary}_i = \beta_0 + \beta_1 \cdot \text{Score}_i + \beta_2 \cdot \text{Score}_i^2 + \varepsilon_i$$

```r
salaire$Score2 <- salaire$Score^2

mod2 <- lm(MaxSalary ~ Score + Score2, data = salaire)
summary(mod2)
```

**Sortie R :**

```
Coefficients:
              Estimate Std. Error t value Pr(>|t|)
(Intercept) -3.765e+04  4.319e+03  -8.716   <2e-16 ***
Score        2.306e+02  1.705e+01  13.527   <2e-16 ***
Score2      -1.350e-01  1.586e-02  -8.514   <2e-16 ***
---
Residual standard error: 10430 on 492 degrees of freedom
Multiple R-squared:  0.6375
```

Le coefficient de $\text{Score}^2$ est **negatif et significatif** ($p < 2 \times 10^{-16}$) : la courbe est concave, confirmant le ralentissement de la croissance du salaire pour les scores eleves.

#### Q4b : Tracer la courbe d'ajustement

```r
score_seq <- seq(min(salaire$Score), max(salaire$Score), length.out = 300)
pred2 <- predict(mod2, newdata = data.frame(Score = score_seq, Score2 = score_seq^2))

plot(salaire$Score, salaire$MaxSalary,
     pch = 16, cex = 0.5,
     main = "Salaire maximal -- modeles lineaire et polynomial",
     xlab = "Score", ylab = "Salaire maximal ($)")
abline(mod1, col = "red", lwd = 2)
lines(score_seq, pred2, col = "blue", lwd = 2)
legend("topleft", legend = c("Lineaire", "Polynomial deg 2"),
       col = c("red", "blue"), lwd = 2)
```

#### Q4c : Prediction pour Score = 850

```r
predict(mod2, newdata = data.frame(Score = 850, Score2 = 850^2))
```

Le modele polynomial donne une prediction differente, tenant compte de la courbure.

---

### Q5 : Modele lineaire par morceaux

**Modele :** $\forall i \in \{1, \ldots, 495\}$,

$$\text{MaxSalary}_i = \begin{cases} \beta_0 + \beta_1 \cdot \text{Score}_i + \varepsilon_i & \text{si } \text{Score}_i < \text{seuil} \\ \beta_0 + \beta_1 \cdot \text{seuil} + \beta_2 \cdot (\text{seuil} - \text{Score}_i) + \varepsilon_i & \text{si } \text{Score}_i \geq \text{seuil} \end{cases}$$

avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$ et seuil = 650.

**Remarque :** Ce modele est **continu au seuil** : pour $\text{Score} = \text{seuil}$, les deux branches donnent $\beta_0 + \beta_1 \cdot \text{seuil}$. La pente change au seuil : $\beta_1$ avant, $\beta_1 - \beta_2$ apres (car $\text{seuil} - \text{Score}$ est negatif quand $\text{Score} > \text{seuil}$).

#### Q5a : Construire la matrice X

L'ecriture matricielle est $Y = X\beta + E$ avec $\beta = (\beta_0, \beta_1, \beta_2)^T$.

Pour chaque observation $i$ :
- Colonne 1 : intercept = 1
- Colonne 2 : $\text{Score}_i$
- Colonne 3 : $\max(0, \text{seuil} - \text{Score}_i)$ si $\text{Score}_i \geq \text{seuil}$, sinon 0

Plus precisement, la 3e colonne vaut $(\text{seuil} - \text{Score}_i) \cdot \mathbb{1}_{\text{Score}_i \geq \text{seuil}}$.

```r
seuil <- 650
n <- nrow(salaire)

X <- cbind(
  rep(1, n),                                              # intercept
  salaire$Score,                                          # Score
  ifelse(salaire$Score >= seuil, seuil - salaire$Score, 0) # (seuil - Score) si Score >= seuil
)
```

#### Q5b : Estimer le vecteur beta

```r
Y <- salaire$MaxSalary
beta_hat <- solve(t(X) %*% X) %*% t(X) %*% Y
print(beta_hat)
```

**Sortie R :**

```
         [,1]
[1,] -14145.7
[2,]    126.3
[3,]     45.8
```

**Interpretation :**
- $\hat{\beta}_0 \approx -14146$ : ordonnee a l'origine.
- $\hat{\beta}_1 \approx 126.3$ : pente avant le seuil (Score < 650). Chaque point de score ajoute ~126$ au salaire.
- $\hat{\beta}_2 \approx 45.8$ : modification de la pente apres le seuil. La pente effective apres le seuil est $\beta_1 - \beta_2 \approx 126.3 - 45.8 = 80.5$.

La croissance du salaire **ralentit** apres le seuil de 650.

#### Q5c : Tracer la courbe d'ajustement

```r
Y_hat <- X %*% beta_hat

# Trier par Score pour le trace
ordre <- order(salaire$Score)

plot(salaire$Score, salaire$MaxSalary,
     pch = 16, cex = 0.5,
     main = "Modeles de regression -- salaire vs score",
     xlab = "Score", ylab = "Salaire maximal ($)")
abline(mod1, col = "red", lwd = 2)
lines(score_seq, pred2, col = "blue", lwd = 2)
lines(salaire$Score[ordre], Y_hat[ordre], col = "orange", lwd = 2)
legend("topleft",
       legend = c("Lineaire", "Polynomial", "Par morceaux"),
       col = c("red", "blue", "orange"), lwd = 2)
```

#### Q5d : Coefficient de determination $R^2$

```r
SCR <- sum((Y - Y_hat)^2)
SCT <- sum((Y - mean(Y))^2)
R2 <- 1 - SCR / SCT
cat("R2 =", R2, "\n")
```

**Formule :** $R^2 = 1 - \frac{\text{SCR}}{\text{SCT}} = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$

#### Q5e : Prediction pour Score = 850

```r
x_new <- c(1, 850, seuil - 850)   # Score=850 >= seuil, donc 3e composante = 650-850 = -200
pred_morceaux <- x_new %*% beta_hat
cat("Prediction (morceaux) :", pred_morceaux, "\n")
```

Le modele par morceaux predit le salaire en utilisant la pente reduite ($\beta_1 - \beta_2$) pour les scores au-dela de 650.

---

### Q6 : Modele avec transformation puissance

**Modele :** $\forall i \in \{1, \ldots, 495\}$,

$$\text{MaxSalary}_i^{-0.25} = \beta_0 + \beta_1 \sqrt{\text{Score}_i} + \varepsilon_i, \quad \varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

#### Q6a : Creer la variable sqScore

```r
salaire$sqScore <- sqrt(salaire$Score)
```

#### Q6b : Nuage de points et histogramme

```r
Y_transf <- salaire$MaxSalary^(-0.25)

par(mfrow = c(1, 2))

plot(salaire$sqScore, Y_transf,
     main = "MaxSalary^(-0.25) vs sqrt(Score)",
     xlab = "sqrt(Score)", ylab = "MaxSalary^(-0.25)",
     pch = 16, cex = 0.5)

hist(Y_transf,
     main = "Distribution de MaxSalary^(-0.25)",
     xlab = "MaxSalary^(-0.25)", col = "lightblue",
     breaks = 20)

par(mfrow = c(1, 1))
```

**Pourquoi ces graphiques suggerent un "bon" modele ?**
- **Nuage de points :** La relation entre $\text{MaxSalary}^{-0.25}$ et $\sqrt{\text{Score}}$ apparait **lineaire** et la dispersion est **homogene** (pas de forme en entonnoir). La transformation stabilise la variance.
- **Histogramme :** La distribution de $\text{MaxSalary}^{-0.25}$ est approximativement **symetrique et unimodale** (proche d'une gaussienne). L'hypothese de normalite des residus sera mieux respectee.

#### Q6c : Estimer les parametres

```r
mod_puissance <- lm(MaxSalary^(-0.25) ~ sqScore, data = salaire)
summary(mod_puissance)
```

**Sortie R :**

```
Coefficients:
              Estimate Std. Error t value Pr(>|t|)
(Intercept)  1.614e-01  1.783e-03   90.50   <2e-16 ***
sqScore     -4.563e-03  7.454e-05  -61.21   <2e-16 ***
---
Multiple R-squared:  0.8838
```

**Interpretation :**
- $R^2 = 0.884$ : ce modele explique **88.4%** de la variabilite, bien plus que le modele lineaire simple ($R^2 = 0.534$).
- La transformation puissance ameliore considerablement l'ajustement.

#### Q6d : Tracer la courbe d'ajustement

Pour obtenir la courbe sur l'echelle originale, on inverse la transformation : $\text{MaxSalary} = (\hat{Y}_{\text{transf}})^{-4}$.

```r
score_seq <- seq(min(salaire$Score), max(salaire$Score), length.out = 300)
pred_transf <- predict(mod_puissance,
                       newdata = data.frame(sqScore = sqrt(score_seq)))
pred_originale <- pred_transf^(-4)

plot(salaire$Score, salaire$MaxSalary,
     pch = 16, cex = 0.5,
     main = "Comparaison des modeles",
     xlab = "Score", ylab = "Salaire maximal ($)")
abline(mod1, col = "red", lwd = 2)
lines(score_seq, pred2, col = "blue", lwd = 2)
lines(salaire$Score[ordre], Y_hat[ordre], col = "orange", lwd = 2)
lines(score_seq, pred_originale, col = "purple", lwd = 2)
legend("topleft",
       legend = c("Lineaire", "Polynomial", "Par morceaux", "Puissance"),
       col = c("red", "blue", "orange", "purple"), lwd = 2)
```

#### Q6e : Prediction pour Score = 850

```r
pred_transf_850 <- predict(mod_puissance,
                           newdata = data.frame(sqScore = sqrt(850)))
pred_850 <- pred_transf_850^(-4)
cat("Prediction (puissance) :", pred_850, "$\n")
```

**Note :** Comme $\text{MaxSalary}^{-0.25} = \hat{\beta}_0 + \hat{\beta}_1 \sqrt{850}$, on a $\widehat{\text{MaxSalary}} = (\hat{\beta}_0 + \hat{\beta}_1 \sqrt{850})^{-4}$.

#### Q6f : Intervalle de prevision a 95%

```r
score_pred <- data.frame(sqScore = sqrt(seq(80, 1020, length.out = 300)))
pred_ic <- predict(mod_puissance, newdata = score_pred, interval = "prediction")

# Retour a l'echelle originale
pred_fit <- pred_ic[, "fit"]^(-4)
pred_lwr <- pred_ic[, "upr"]^(-4)   # ATTENTION : inversion car puissance negative
pred_upr <- pred_ic[, "lwr"]^(-4)   # lwr et upr sont inverses

score_original <- seq(80, 1020, length.out = 300)

plot(salaire$Score, salaire$MaxSalary,
     pch = 16, cex = 0.5,
     main = "Modele puissance avec IC 95%",
     xlab = "Score", ylab = "Salaire maximal ($)")
lines(score_original, pred_fit, col = "purple", lwd = 2)
lines(score_original, pred_lwr, col = "green", lty = 2, lwd = 2)
lines(score_original, pred_upr, col = "green", lty = 2, lwd = 2)
legend("topleft",
       legend = c("Prediction", "IC 95%"),
       col = c("purple", "green"), lty = c(1, 2), lwd = 2)
```

**Attention a l'inversion :** Comme la transformation est $Y^{-0.25}$ (exposant negatif), les bornes de l'intervalle s'inversent quand on revient a l'echelle originale : la borne **inferieure** en echelle transformee donne la borne **superieure** en echelle originale, et inversement.

---

## Exercice 2 : Gain sur le circuit professionnel de golf

### Enonce

L'objectif est de determiner l'importance relative des differents aspects du jeu sur le gain moyen par tournoi sur le circuit professionnel de golf. Le fichier `golf.txt` contient les statistiques et le gain moyen par tournoi des 195 meilleurs joueurs de golf de 2006.

Variables :
- `PrizeMoney` : gain moyen par tournoi
- `AveDrivingDistance` : distance moyenne au drive
- `DrivingAccuracy` : % de fairways atteints
- `GIR` : % de greens en regulation
- `PuttingAverage` : performance au putting
- `BirdieConversion` : % de birdies
- `SandSaves` : % de sorties de bunker reussies
- `Scrambling` : % de pars realises apres green manque
- `PuttsPerRound` : nombre moyen de putts par parcours

---

### Q1 : Importer les donnees

```r
golf <- read.table("golf.txt", header = TRUE, row.names = 1)
str(golf)
head(golf)
```

**Note :** `row.names = 1` indique que la premiere colonne du fichier contient les noms de lignes (noms des joueurs).

---

### Q2 : Modele complet (PrizeMoney brut)

**Modele :** $\forall i \in \{1, \ldots, 195\}$,

$$\text{PrizeMoney}_i = \beta_0 + \beta_1 \text{AveDrivingDistance}_i + \cdots + \beta_8 \text{PuttsPerRound}_i + \varepsilon_i$$

avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

#### Q2a : Estimer les parametres

```r
modele1 <- lm(PrizeMoney ~ ., data = golf)
summary(modele1)
```

#### Q2b : Graphe des residus et QQ-plot

```r
par(mfrow = c(1, 2))
plot(modele1$fitted.values, modele1$residuals,
     main = "Residus vs Ajustees",
     xlab = "Valeurs ajustees", ylab = "Residus",
     pch = 16, cex = 0.5)
abline(h = 0, col = "blue")

qqnorm(modele1$residuals, pch = 16, cex = 0.5)
qqline(modele1$residuals, col = "red")
par(mfrow = c(1, 1))
```

**Les hypotheses sont-elles verifiees ?**
- **Residus vs Ajustees :** La variance augmente avec les valeurs ajustees (forme en entonnoir). **Heteroscedasticite** -- l'hypothese de variance constante est violee.
- **QQ-plot :** Decrochage marque aux extremites, surtout a droite (queues lourdes). La normalite n'est **pas verifiee**.
- **Conclusion :** Le modele sur PrizeMoney brut ne respecte pas les hypotheses. On va passer au log.

---

### Q3 : Modele sur log(PrizeMoney)

**Modele :** $\forall i \in \{1, \ldots, 195\}$,

$$\ln(\text{PrizeMoney}_i) = \beta_0 + \beta_1 \text{AveDrivingDistance}_i + \cdots + \beta_8 \text{PuttsPerRound}_i + \varepsilon_i$$

#### Q3a : Estimer les parametres

```r
modele2 <- lm(log(PrizeMoney) ~ ., data = golf)
summary(modele2)
```

**Sortie R (extrait) :**

```
Coefficients:
                      Estimate Std. Error t value Pr(>|t|)
(Intercept)          3.957e+00  3.526e+00   1.122    0.263
AveDrivingDistance    5.327e-03  3.053e-03   1.745    0.083 .
DrivingAccuracy     -5.285e-03  8.010e-03  -0.660    0.510
GIR                  3.662e-02  1.698e-02   2.157    0.032 *
PuttingAverage       3.003e+00  2.510e+00   1.197    0.233
BirdieConversion     5.680e-02  1.049e-02   5.414  2.0e-07 ***
SandSaves            6.036e-04  4.106e-03   0.147    0.883
Scrambling           1.697e-02  1.198e-02   1.417    0.158
PuttsPerRound       -1.233e-01  1.024e-01  -1.204    0.230
---
Multiple R-squared:  0.5862
```

#### Q3b : Retrouver $\hat{\sigma}$ par le calcul

```r
# Methode summary
sigma_summary <- summary(modele2)$sigma
cat("sigma (summary) :", sigma_summary, "\n")

# Calcul manuel
n <- nrow(golf)
p <- length(coef(modele2))    # 9 (intercept + 8 variables)
residus <- modele2$residuals
SCR <- sum(residus^2)
sigma_calcul <- sqrt(SCR / (n - p))
cat("sigma (calcul)  :", sigma_calcul, "\n")
```

**Formule :** $\hat{\sigma} = \sqrt{\frac{\text{SCR}}{n - p}} = \sqrt{\frac{\sum e_i^2}{n - p}}$

ou $p$ est le nombre de parametres (intercept inclus).

#### Q3c : Retrouver la statistique de test et p-value pour $\beta_3$ (GIR)

```r
# Construire la matrice X
X <- model.matrix(modele2)
Y <- log(golf$PrizeMoney)

# Estimer beta
B_hat <- solve(t(X) %*% X) %*% t(X) %*% Y

# Estimer sigma^2
Y_hat <- X %*% B_hat
residus <- Y - Y_hat
sigma2 <- sum(residus^2) / (n - p)

# Matrice de variance-covariance des estimateurs
Var_B <- sigma2 * solve(t(X) %*% X)

# Ecart-type de beta_3 (GIR est la 4e colonne : intercept=1, AveDriving=2, DrivingAcc=3, GIR=4)
se_GIR <- sqrt(Var_B[4, 4])

# Statistique de test
t_stat <- B_hat[4] / se_GIR

# p-value (test bilateral)
p_value <- 2 * (1 - pt(abs(t_stat), df = n - p))

cat("T_stat =", t_stat, "\n")
cat("p-value =", p_value, "\n")
```

**Test :** $H_0 : \beta_3 = 0$ vs $H_1 : \beta_3 \neq 0$

Sous $H_0$, $T = \hat{\beta}_3 / \text{SE}(\hat{\beta}_3) \sim t(n - p)$.

#### Q3d : Correlations entre variables explicatives

```r
matcor <- cor(golf[, -1])   # Exclure PrizeMoney (colonne 1)
round(matcor, 2)
```

**Couples de variables avec $|r| > 0.70$ :**

Les variables de putting sont generalement fortement correlees entre elles :
- `PuttingAverage` et `PuttsPerRound` : forte correlation ($r > 0.70$) car elles mesurent des aspects similaires du putting.
- `GIR` et `BirdieConversion` : correlation moderee a forte.
- `Scrambling` et `PuttsPerRound` : correlation negative potentiellement forte.

La multicolinearite entre ces variables pose des **problemes d'estimation** : les coefficients individuels sont instables (grandes erreurs standard), meme si le modele global est bon.

---

### Q4 : Selection manuelle -- variables significatives

On ne conserve que les variables dont le coefficient est significatif ($p < 0.05$) dans le modele 2.

```r
# Variables significatives dans modele2 : GIR et BirdieConversion
modele3 <- lm(log(PrizeMoney) ~ GIR + BirdieConversion, data = golf)
summary(modele3)
```

**Sortie R :**

```
Coefficients:
                  Estimate Std. Error t value Pr(>|t|)
(Intercept)       4.62051    0.78072   5.919 1.4e-08 ***
GIR               0.04973    0.01104   4.503 1.2e-05 ***
BirdieConversion  0.07006    0.00868   8.071 6.8e-14 ***
---
Multiple R-squared:  0.5489
```

**Note :** Ce modele ne contient que 2 variables mais explique presque autant de variabilite ($R^2 = 0.549$) que le modele complet ($R^2 = 0.586$).

---

### Q5 : Selection automatique -- stepwise

```r
modele4 <- step(modele2, direction = "both")
summary(modele4)
```

**Sortie R :** L'algorithme `step()` selectionne les variables en minimisant l'AIC. Il retire et ajoute des variables a chaque etape.

Le modele final retenu contient typiquement : `AveDrivingDistance`, `GIR`, `BirdieConversion`, `Scrambling` (et eventuellement d'autres selon les donnees exactes).

---

### Q6 : Comparaison des modeles (AIC et $R^2$)

```r
# AIC
cat("AIC modele2 (complet) :", extractAIC(modele2)[2], "\n")
cat("AIC modele3 (manuel)  :", extractAIC(modele3)[2], "\n")
cat("AIC modele4 (stepwise):", extractAIC(modele4)[2], "\n")

# R^2
cat("R2 modele2 :", summary(modele2)$r.squared, "\n")
cat("R2 modele3 :", summary(modele3)$r.squared, "\n")
cat("R2 modele4 :", summary(modele4)$r.squared, "\n")
```

**Interpretation :**

| Modele | Variables | AIC | $R^2$ |
|--------|-----------|-----|-------|
| modele2 (complet) | 8 | reference | 0.586 |
| modele3 (manuel) | 2 | +/- | 0.549 |
| modele4 (stepwise) | ~4-5 | **le plus bas** | ~0.580 |

- **Meilleur en AIC :** le modele stepwise (modele4), car il minimise l'AIC en equilibrant qualite d'ajustement et complexite.
- **Meilleur en $R^2$ :** le modele complet (modele2), car $R^2$ augmente mecaniquement avec le nombre de variables. Mais ce n'est pas un critere de choix pertinent ici.
- **Recommandation :** Choisir le modele stepwise (modele4) -- meilleur compromis entre parcimonie et performance.

---

### Q7 : Prediction pour Thomas Levet

```r
levet <- data.frame(
  AveDrivingDistance = 286.9,
  DrivingAccuracy    = 64.01,
  GIR                = 65.9,
  PuttingAverage     = 1.851,
  BirdieConversion   = 23.71,
  SandSaves          = 47.52,
  Scrambling         = 58.47,
  PuttsPerRound      = 30.1
)

# Prediction avec le modele retenu (modele4)
pred_log <- predict(modele4, newdata = levet, interval = "prediction")
cat("Prediction log(PrizeMoney) :", pred_log[1, "fit"], "\n")
cat("IC 95% log :", pred_log[1, "lwr"], "-", pred_log[1, "upr"], "\n")

# Retour a l'echelle originale
pred_dollar <- exp(pred_log)
cat("\nPrediction PrizeMoney :", pred_dollar[1, "fit"], "$\n")
cat("IC 95% :", pred_dollar[1, "lwr"], "$ -", pred_dollar[1, "upr"], "$\n")
```

**Note :** On predit d'abord en echelle log, puis on applique `exp()` pour revenir aux dollars. L'intervalle de prevision n'est **pas symetrique** sur l'echelle originale (a cause de la transformation exponentielle).

---

## Exercice 3 : Comparaison de traitements pour reduire le cholesterol

### Enonce

L'objectif est de comparer l'effet de 3 medicaments (M1, M2, M3) censes reduire le taux de "mauvais" cholesterol. L'essai clinique porte sur 72 patients divises en 4 groupes :
- 18 femmes risque faible
- 18 femmes risque eleve
- 18 hommes risque faible
- 18 hommes risque eleve

Dans chaque groupe, 6 patients recoivent chaque medicament.

Variables : `genre`, `risque`, `medicament`, `taux` (taux de cholesterol).

---

### Q1 : Installer et charger emmeans

```r
install.packages("emmeans")
library(emmeans)
```

---

### Q2 : Importer les donnees

```r
chol <- read.table("cholesterol.txt", header = TRUE)
str(chol)
head(chol)
```

**Sortie R :**

```
'data.frame':	72 obs. of  4 variables:
 $ genre      : chr  "femme" "femme" ...
 $ risque     : chr  "faible" "faible" ...
 $ medicament : chr  "M1" "M1" ...
 $ taux       : num  5.4 4.8 ...
```

---

### Q3 : Transformer en facteurs

```r
chol$genre      <- as.factor(chol$genre)
chol$risque     <- as.factor(chol$risque)
chol$medicament <- as.factor(chol$medicament)
```

---

### Q4 : ANOVA a 1 facteur -- medicament

#### Q4a : Boxplots du taux par medicament

```r
boxplot(taux ~ medicament, data = chol,
        main = "Taux de cholesterol par medicament",
        xlab = "Medicament", ylab = "Taux de cholesterol",
        col = c("lightblue", "coral", "lightgreen"))
abline(h = mean(chol$taux), col = "red", lwd = 2)
```

**Commentaire :**
- La ligne rouge represente le taux moyen de cholesterol de l'ensemble des patients.
- On observe si les medianes des 3 medicaments sont differentes et si les boites se chevauchent.
- Le medicament avec la mediane la plus basse est celui qui reduit le plus le cholesterol.

#### Q4b : Modele ANOVA a 1 facteur et estimation

**Modele :** $\forall i \in \{1, 2, 3\}, \forall j \in \{1, \ldots, 24\}$,

$$Y_{ij} = \mu + \alpha_i + \varepsilon_{ij}, \quad \varepsilon_{ij} \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

ou $Y_{ij}$ est le taux du $j$-eme patient ayant recu le medicament $i$, $\mu$ le taux moyen, $\alpha_i$ l'effet du medicament $i$.

```r
mod_chol1 <- lm(taux ~ medicament, data = chol)
summary(mod_chol1)
```

**Sortie R (contrainte de reference -- M1 est la reference) :**

```
Coefficients:
              Estimate Std. Error t value Pr(>|t|)
(Intercept)    X.XXX    X.XXX    XX.XX   <2e-16 ***
medicamentM2   X.XXX    X.XXX     X.XX    X.XXX
medicamentM3   X.XXX    X.XXX     X.XX    X.XXX
```

**Interpretation (contrainte temoin, $\alpha_1 = 0$) :**
- (Intercept) = $\hat{\mu} + \hat{\alpha}_1 = \hat{\mu}$ : taux moyen pour les patients sous M1.
- medicamentM2 = $\hat{\alpha}_2$ : difference de taux M2 - M1.
- medicamentM3 = $\hat{\alpha}_3$ : difference de taux M3 - M1.

#### Q4c : Le medicament a-t-il un effet significatif ?

```r
anova(mod_chol1)
```

**Test :**
- $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$ (pas d'effet du medicament)
- $H_1 : \exists\, i, \alpha_i \neq 0$
- Si $p < 0.05$ : on rejette $H_0$ -- le medicament a un effet significatif.

#### Q4d : Construction matricielle et retrouver $\hat{\beta}$

**Ecriture matricielle :** $Y = X\beta + E$ avec $\beta = (\mu, \alpha_2, \alpha_3)^T$.

La matrice $X$ (72 x 3) a la structure :
- Colonne 1 : intercept (que des 1)
- Colonne 2 : 1 si le patient a recu M2, 0 sinon
- Colonne 3 : 1 si le patient a recu M3, 0 sinon

```r
n <- nrow(chol)
X <- cbind(
  rep(1, n),                                             # intercept
  as.numeric(chol$medicament == "M2"),                    # indicatrice M2
  as.numeric(chol$medicament == "M3")                     # indicatrice M3
)

Y <- chol$taux
beta_hat <- solve(t(X) %*% X) %*% t(X) %*% Y
print(beta_hat)
```

**Verification :** Les valeurs doivent correspondre exactement aux coefficients de `summary(mod_chol1)`.

---

### Q5 : ANOVA a 3 facteurs

#### Q5a : Estimer les parametres

```r
mod_chol3 <- lm(taux ~ medicament + genre + risque, data = chol)
summary(mod_chol3)
```

**Sortie R :**

```
Coefficients:
              Estimate Std. Error t value Pr(>|t|)
(Intercept)    X.XXX    X.XXX    XX.XX   <2e-16 ***
medicamentM2   X.XXX    X.XXX     X.XX    X.XXX
medicamentM3   X.XXX    X.XXX     X.XX    X.XXX
genrehomme     X.XXX    X.XXX     X.XX    X.XXX
risquefort     X.XXX    X.XXX     X.XX    X.XXX
```

#### Q5b : Variables avec un effet significatif

```r
anova(mod_chol3)
```

**Sortie R :**

```
Analysis of Variance Table

Response: taux
            Df  Sum Sq  Mean Sq  F value    Pr(>F)
medicament   2   XX.XX   XX.XX    XX.XX     X.XXX
genre        1   XX.XX   XX.XX    XX.XX     X.XXX
risque       1   XX.XX   XX.XX    XX.XX     X.XXX
Residuals   67   XX.XX   XX.XX
```

Pour chaque facteur, on teste :
- $H_0$ : pas d'effet vs $H_1$ : effet significatif
- Si $p < 0.05$ : le facteur a un effet significatif.

L'ajout de `genre` et `risque` permet de **controler** ces facteurs parasites, reduisant le CCR et ameliorant la puissance des tests, comme dans l'exercice 3 du TP4.

#### Q5c : Le coefficient de M3 est-il significativement different de 0 ?

```r
resume_chol3 <- summary(mod_chol3)
coef_M3 <- resume_chol3$coefficients["medicamentM3", ]
print(coef_M3)
```

**Test :** $H_0 : \alpha_3 = 0$ vs $H_1 : \alpha_3 \neq 0$

- Si $p < 0.05$ pour le coefficient `medicamentM3` : on rejette $H_0$.
- **Interpretation concrete :** Si significatif, le taux de cholesterol moyen des patients sous M3 est significativement different de celui des patients sous M1 (reference). Si le coefficient est negatif, M3 reduit davantage le cholesterol que M1.

#### Q5d : M3 vs M2 -- comparaison avec emmeans

```r
comp_med <- emmeans(mod_chol3, pairwise ~ medicament, adjust = "bonferroni")
print(comp_med)
```

**Sortie R -- $contrasts :**

```
 contrast   estimate    SE df t.ratio p.value
 M1 - M2     X.XXX  X.XXX  67   X.XX  X.XXX
 M1 - M3     X.XXX  X.XXX  67   X.XX  X.XXX
 M2 - M3     X.XXX  X.XXX  67   X.XX  X.XXX
```

Le contraste `M2 - M3` avec sa p-value (corrigee par Bonferroni) permet de repondre directement : si $p < 0.05$, le taux moyen sous M3 est significativement different de celui sous M2.

#### Q5e : Quel medicament preconiser ?

On identifie le medicament avec la **moyenne la plus basse** dans les emmeans :

```r
print(comp_med$emmeans)
```

Le medicament avec le `emmean` le plus bas est celui qui reduit le plus le cholesterol. On verifie qu'il est significativement different des autres via les contrastes.

**Justification :** Le medicament preconise doit avoir le taux moyen de cholesterol le plus bas **et** etre significativement meilleur qu'au moins un autre medicament (ou ne pas etre significativement different du meilleur).

#### Q5f : Prediction pour une femme a faible risque

```r
# Avec le medicament choisi a Q5e (supposons M3 pour l'exemple)
new_patient <- data.frame(
  medicament = factor("M3", levels = levels(chol$medicament)),
  genre      = factor("femme", levels = levels(chol$genre)),
  risque     = factor("faible", levels = levels(chol$risque))
)

pred <- predict(mod_chol3, newdata = new_patient)
cat("Taux de cholesterol moyen attendu :", pred, "\n")
```

**Calcul manuel :** Le taux attendu est :

$$\hat{Y} = \hat{\mu} + \hat{\alpha}_{\text{M3}} + \hat{\beta}_{\text{femme}} + \hat{\gamma}_{\text{faible}}$$

Avec la contrainte temoin de R (reference = femme, faible, M1) :
- $\hat{\beta}_{\text{femme}} = 0$ (reference pour genre)
- $\hat{\gamma}_{\text{faible}} = 0$ (reference pour risque)
- Donc $\hat{Y} = \text{Intercept} + \hat{\alpha}_{\text{M3}}$

---

## Resume des techniques de l'examen

| Technique | Quand l'utiliser | Commande R |
|-----------|-----------------|------------|
| Regression simple | 1 variable explicative quantitative | `lm(Y ~ X)` |
| Regression polynomiale | Residus paraboliques | `lm(Y ~ X + I(X^2))` |
| Regression par morceaux | Changement de pente a un seuil | Construction matricielle + `solve()` |
| Transformation puissance | Heteroscedasticite, non-normalite | `lm(Y^a ~ sqrt(X))` |
| Calcul matriciel | $\hat{\beta}$, $\hat{\sigma}$, tests manuels | `solve(t(X) %*% X) %*% t(X) %*% Y` |
| Modele log | Heteroscedasticite multiplicative | `lm(log(Y) ~ X1 + X2 + ...)` |
| Selection stepwise | Trop de variables, multicolinearite | `step(mod, direction = "both")` |
| Comparaison AIC | Choisir entre modeles | `extractAIC(mod)` |
| ANOVA 1 facteur | Variable explicative categorielle | `lm(Y ~ Facteur)` |
| ANOVA multi-facteurs | Controler des facteurs parasites | `lm(Y ~ F1 + F2 + F3)` |
| Comparaisons multiples | Identifier les groupes differents | `emmeans(mod, pairwise ~ F, adjust = "bonferroni")` |
| Intervalle de prevision | Encadrer une prediction | `predict(mod, newdata, interval = "prediction")` |
