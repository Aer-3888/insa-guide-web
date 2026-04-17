---
title: "TP3 -- Regression lineaire multiple"
sidebar_position: 3
---

# TP3 -- Regression lineaire multiple

> **Objectif** : Etendre la regression a plusieurs variables explicatives, analyser les correlations,
> selectionner les variables pertinentes (backward/AIC), et comprendre les calculs matriciels
> derriere `lm()`.

---

## Vue d'ensemble

| Exercice | Donnees | n | Variables | Themes |
|----------|---------|---|-----------|--------|
| 1 -- Publicite | Advertising.csv | 200 | TV, Radio, Newspaper, Sales | Regression multiple, test global vs individuel |
| 2 -- Lait | lait.txt | 85 | 5 var. + Rendement | Multicolinearite, selection backward, AIC |
| 3 -- Eucalyptus | eucalyptus.txt | ~1429 | circ, ht | Calcul matriciel manuel, test t |

### Rappel theorique

**Equation :** $Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \cdots + \beta_p X_p + \varepsilon$

**Forme matricielle :** $Y = X\beta + \varepsilon$, avec $\varepsilon \sim \mathcal{N}(0, \sigma^2 I)$

**Estimation :** $\hat{\beta} = (X'X)^{-1} X'Y$

### Packages requis

```r
install.packages("rgl")     # Visualisation 3D
install.packages("car")     # Outils graphiques
library(rgl)
library(car)
```

---

## Exercice 1 : Effet de la publicite sur les ventes d'un produit

### Enonce

Vous etes consultant pour un client qui souhaite savoir comment accroitre les ventes d'un produit. Vous disposez des ventes de ce produit dans 200 entreprises differentes ainsi que les budgets alloues a la publicite sur 3 medias : TV, Radio, Journaux. Votre but est de developper un modele pour predire les ventes en fonction des budgets alloues aux 3 medias.

### Q1 : Lire les donnees

```r
pub <- read.csv("Advertising.csv")
attach(pub)
```

### Q2 : Matrice de correlation

Determiner la matrice de correlation entre les 4 variables. Commenter.

```r
cor(pub)
```

**Sortie R :**

```
               TV      Radio  Newspaper    Sales
TV         1.0000    0.0548    0.0566    0.7822
Radio      0.0548    1.0000    0.3541    0.5762
Newspaper  0.0566    0.3541    1.0000    0.2283
Sales      0.7822    0.5762    0.2283    1.0000
```

**Interpretation :**
- **TV - Sales : r = 0.78** : correlation positive moderee a forte.
- **Radio - Sales : r = 0.58** : correlation positive moderee.
- **Newspaper - Sales : r = 0.23** : correlation faible.
- **TV - Radio : r = 0.05** : quasi independants (pas de colinearite).
- **Radio - Newspaper : r = 0.35** : correlation moderee (important pour la suite).

### Q3 : Regression simple Sales ~ TV

Effectuer la regression lineaire simple de Sales sur TV. Le modele est-il bien ajuste ? Le budget TV a-t-il une influence sur les ventes ?

```r
plot(TV, Sales, main = "Ventes vs Publicite TV",
     xlab = "Budget TV (k$)", ylab = "Ventes (k unites)", pch = 19)

reg_tv <- lm(Sales ~ TV, data = pub)
resume <- summary(reg_tv)
print(resume)
lines(TV, predict(reg_tv), col = "blue", lwd = 3)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept) 7.032594   0.457843  15.36   <2e-16 ***
TV          0.047537   0.002691  17.67   <2e-16 ***
---
Multiple R-squared:  0.6119
```

**Interpretation :** $R^2 = 0.61$ : la TV seule explique **61%** de la variabilite des ventes. Le budget TV a une influence significative ($p < 2 \times 10^{-16}$).

**Analyse des residus :**

```r
plot(reg_tv$fitted.values, reg_tv$residuals,
     main = "Residus du modele Sales ~ TV",
     xlab = "Valeurs ajustees", ylab = "Residus")
abline(h = 0, col = "blue")
abline(h = -2 * resume$sigma, col = "red")
abline(h =  2 * resume$sigma, col = "red")
```

**Diagnostic :** Heteroscedasticite visible (dispersion croissante). Transformation log :

```r
reg_tv_log <- lm(log(Sales) ~ TV, data = pub)
resume_log <- summary(reg_tv_log)
```

Les residus sont plus homogenes apres transformation log.

### Q4 : Reprendre avec Radio, puis avec Newspaper

```r
# Radio vs TV
reg_radio_tv <- lm(Radio ~ TV, data = pub)
summary(reg_radio_tv)     # R^2 tres faible -> quasi independants

# Newspaper vs TV
reg_news_tv <- lm(Newspaper ~ TV, data = pub)
summary(reg_news_tv)      # R^2 tres faible -> quasi independants
```

**Interpretation :** Les budgets TV, Radio et Journaux sont quasiment independants les uns des autres.

### Q5 : Regression multiple avec 3 variables

$\forall i \in \{1, \ldots, 200\}, \quad \text{Sales}_i = \beta_0 + \beta_1 \text{TV}_i + \beta_2 \text{Radio}_i + \beta_3 \text{Newspaper}_i + \varepsilon_i$ avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

Estimer les parametres. Que represente concretement $\hat{\beta}_0$ ? Quel pourcentage de la variabilite des ventes est explique par le modele ?

```r
regm <- lm(Sales ~ TV + Radio + Newspaper, data = pub)
resume_mult <- summary(regm)
print(resume_mult)
```

**Sortie R :**

```
Coefficients:
             Estimate Std. Error t value Pr(>|t|)
(Intercept)  2.938889   0.311908   9.422   <2e-16 ***
TV           0.045765   0.001395  32.809   <2e-16 ***
Radio        0.188530   0.008611  21.893   <2e-16 ***
Newspaper   -0.001037   0.005871  -0.177     0.86
---
Multiple R-squared:  0.8972,  Adjusted R-squared:  0.8956
F-statistic: 570.3 on 3 and 196 DF,  p-value: < 2.2e-16
```

**Interpretation :**
- $\hat{\beta}_0 = 2.94$ : ventes de base sans aucune publicite (en milliers d'unites).
- $R^2 = 0.897$ : les 3 variables expliquent **89.7%** de la variabilite des ventes.

### Q6 : Test global (test F)

Peut-on affirmer, au risque de 5%, qu'au moins une des variables explicatives a une influence sur les ventes ?

1. **Hypotheses :** $H_0 : \beta_1 = \beta_2 = \beta_3 = 0$ vs $H_1 :$ au moins un $\beta_j \neq 0$
2. **Statistique de test :** $F = 570.3$
3. **Distribution sous $H_0$ :** $F \sim F(3, 196)$
4. **p-value :** $< 2.2 \times 10^{-16}$
5. **Decision :** On **rejette $H_0$**. Au moins un media a une influence significative sur les ventes.

### Q7 : Tests individuels (tests t)

Peut-on affirmer, au risque de 5%, que chaque variable a une influence sur les ventes ?

| Variable | t value | p-value | Significatif a 5% ? |
|----------|---------|---------|---------------------|
| TV | 32.81 | $< 2 \times 10^{-16}$ | **Oui** |
| Radio | 21.89 | $< 2 \times 10^{-16}$ | **Oui** |
| Newspaper | -0.18 | 0.86 | **Non** |

**Pourquoi Newspaper n'est pas significatif malgre sa correlation bivariee avec Sales (r = 0.23) ?** Newspaper est correle avec Radio (r = 0.35). Quand Radio est deja dans le modele, Newspaper n'apporte pas d'information **supplementaire**. Son effet apparent en bivarie etait du a sa correlation avec Radio.

### Q8 : Modele reduit (variables significatives uniquement)

On decide de ne conserver que les variables ayant une influence sur les ventes.

```r
reg2 <- lm(Sales ~ TV + Radio, data = pub)
resume2 <- summary(reg2)
print(resume2)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept) 2.921100   0.294490   9.919   <2e-16 ***
TV          0.045755   0.001395  32.799   <2e-16 ***
Radio       0.187994   0.008042  23.382   <2e-16 ***
---
Multiple R-squared:  0.8972,  Adjusted R-squared:  0.8962
```

**Interpretation :** $R^2$ ajuste quasi identique (0.8962 vs 0.8956). La Radio a un coefficient plus eleve que la TV (0.188 vs 0.046) : a budget egal, la Radio est **~4 fois plus efficace** que la TV. Pour un investissement de 10 000$ supplementaires, investir dans la Radio.

### Q9 : Visualisation 3D et equation de prevision

```r
library(rgl)
library(car)
scatter3d(Sales ~ TV + Radio, data = pub,
          surface = TRUE, grid = TRUE, ellipsoid = TRUE)
```

**Equation de prevision :** $\widehat{\text{Sales}} = 2.92 + 0.046 \times \text{TV} + 0.188 \times \text{Radio}$

### Q10 : Prediction pour TV = 100, Radio = 20

Le client investit 100 000$ pour la TV et 20 000$ pour la Radio. Determiner le nombre moyen de produits vendus avec l'intervalle de prevision a 95%.

```r
x0 <- data.frame(TV = 100, Radio = 20)
pred <- predict(reg2, newdata = x0, interval = "prediction")
print(pred)
```

**Sortie R :**

```
       fit      lwr      upr
1 11.2563   8.0754  14.4372
```

**Interpretation :** On predit des ventes de **11 256 unites**, avec un intervalle de prevision a 95% de [8 075 ; 14 437].

```r
detach(pub)
```

---

## Exercice 2 : Composition du lait et rendement fromager

### Enonce

On souhaite etudier l'impact de la composition du lait sur le rendement fromager (kg de fromage pour 100 litres de lait). 5 variables explicatives : Densite, TxButy, TxProt, TxCase, ExSec.

### Q1 : Importer les donnees

```r
lait <- read.table("lait.txt", header = TRUE)
attach(lait)
```

### Q2 : Matrice de correlation entre les variables explicatives

Quelles variables sont tres correlees ? Quel impact sur la suite ?

```r
cor(lait[, 1:5])
```

**Sortie R :**

```
         Densite  TxButy  TxProt  TxCase   ExSec
Densite   1.0000  0.4277  0.5685  0.5459  0.7595
TxButy    0.4277  1.0000  0.2927  0.2632  0.6506
TxProt    0.5685  0.2927  1.0000  0.9624  0.5993
TxCase    0.5459  0.2632  0.9624  1.0000  0.5384
ExSec     0.7595  0.6506  0.5993  0.5384  1.0000
```

**Interpretation :**
- **TxCase - TxProt : r = 0.96** -- Correlation **tres forte**. La caseine est une proteine du lait : **multicolinearite**.
- **ExSec - Densite : r = 0.76** -- Correlation forte.
- **Consequence :** Un modele avec toutes les variables sera instable. Certains coefficients seront non significatifs a cause de la redondance.

### Q3 : Representer Rendement en fonction des variables explicatives

```r
par(mfrow = c(2, 3))
plot(Densite, Rendement, main = "Rendement vs Densite", pch = 19)
plot(TxButy, Rendement, main = "Rendement vs Taux Butyrique", pch = 19)
plot(TxProt, Rendement, main = "Rendement vs Taux Proteique", pch = 19)
plot(TxCase, Rendement, main = "Rendement vs Taux Caseine", pch = 19)
plot(ExSec, Rendement, main = "Rendement vs Extrait Sec", pch = 19)
par(mfrow = c(1, 1))
```

**Observations :** TxButy, TxProt, TxCase, ExSec vs Rendement : relations lineaires positives. Densite vs Rendement : relation non lineaire.

### Q4 : Modele complet

$\forall i \in \{1, \ldots, 85\}, \quad \text{Rendement}_i = \beta_0 + \beta_1 \text{Densite}_i + \beta_2 \text{TxButy}_i + \beta_3 \text{TxProt}_i + \beta_4 \text{TxCase}_i + \beta_5 \text{ExSec}_i + \varepsilon_i$ avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

#### Q4a : Estimer les parametres

```r
reg_complet <- lm(Rendement ~ Densite + TxButy + TxProt + TxCase + ExSec,
                  data = lait)
resume_complet <- summary(reg_complet)
print(resume_complet)
```

**Sortie R :**

```
Coefficients:
             Estimate Std. Error t value Pr(>|t|)
(Intercept) -30.3521    18.5463  -1.637  0.10570
Densite      34.8419    18.7521   1.858  0.06693 .
TxButy        0.0702     0.0216   3.253  0.00169 **
TxProt        0.0563     0.0757   0.744  0.45890
TxCase       -0.0389     0.0810  -0.480  0.63282
ExSec         0.0306     0.0127   2.409  0.01838 *
---
Multiple R-squared:  0.6157,  Adjusted R-squared:  0.5913
```

#### Q4b : Variables ayant un effet significatif au risque de 5%

| Variable | p-value | Significatif a 5% ? |
|----------|---------|---------------------|
| Densite | 0.067 | Non (mais proche) |
| TxButy | **0.0017** | **Oui** |
| TxProt | 0.459 | Non |
| TxCase | 0.633 | Non |
| ExSec | **0.018** | **Oui** |

Si l'eleveur augmente le taux butyrique et le taux proteique de 5 pour mille tout en diminuant de 2 pour mille le taux de caseine :

```r
delta <- 5 * coef(reg_complet)["TxButy"] + 5 * coef(reg_complet)["TxProt"] - 2 * coef(reg_complet)["TxCase"]
cat("Variation du rendement :", delta, "kg/100L\n")
```

$R^2 = 0.616$ : 61.6% de la variabilite du rendement est expliquee par les variables.

#### Q4c : Graphe des residus

```r
par(mfrow = c(2, 2))
plot(reg_complet)
par(mfrow = c(1, 1))
```

Les residus sont repartis aleatoirement autour de 0. Pas de structure evidente. Les hypotheses sont raisonnablement satisfaites.

### Q5 : Selection backward avec `step()`

Realiser une selection automatique de variables par procedure descendante (backward).

```r
reg_backward <- step(reg_complet, direction = "backward")
```

**Parcours de l'algorithme :**

```
Start:  AIC=-448.87
Rendement ~ Densite + TxButy + TxProt + TxCase + ExSec

Step:  AIC=-450.63
Rendement ~ Densite + TxButy + TxProt + ExSec
```

**Modele retenu :** `Rendement ~ Densite + TxButy + TxProt + ExSec`. La variable TxCase est retiree (la plus redondante avec TxProt).

### Q6 : Modele sans intercept

```r
mod3 <- lm(Rendement ~ -1 + Densite + TxButy + TxProt + ExSec, data = lait)
```

**Explication :** `-1` dans la formule supprime l'ordonnee a l'origine. Le modele est force a passer par l'origine ($\beta_0 = 0$).

### Q7 : Comparaison des modeles (AIC et $R^2$)

Quel est le meilleur modele en terme d'AIC ? En terme de $R^2$ ? Quel modele retenez-vous ?

```r
cat("Modele complet :\n")
cat("  AIC =", extractAIC(reg_complet)[2], "\n")
cat("  R^2 ajuste =", summary(reg_complet)$adj.r.squared, "\n")

cat("Modele backward :\n")
cat("  AIC =", extractAIC(reg_backward)[2], "\n")
cat("  R^2 ajuste =", summary(reg_backward)$adj.r.squared, "\n")

cat("Modele sans intercept :\n")
cat("  AIC =", extractAIC(mod3)[2], "\n")
cat("  R^2 ajuste =", summary(mod3)$adj.r.squared, "\n")
```

**Sortie R :**

```
Modele complet :    AIC = -448.87    R^2 ajuste = 0.5913
Modele backward :   AIC = -450.63    R^2 ajuste = 0.5928
Modele sans int. :  AIC = -449.12    R^2 ajuste = 0.9998
```

**Interpretation :**
- Le modele backward a le **meilleur AIC** (le plus bas).
- Le $R^2$ ajuste du modele sans intercept est artificiellement eleve car la definition de $R^2$ change sans intercept.
- On retient le modele sans intercept pour les predictions (meilleur $R^2$) ou le modele backward (meilleur AIC selon le critere principal).

### Q8 : Prediction pour deux vaches

Donner une prediction du rendement fromager moyen d'une vache Prim'Holstein et d'une Normande.
- Holstein : Densite = 1.032, TxButy = 39.7, TxProt = 31.9, ExSec = 130
- Normande : Densite = 1.032, TxButy = 42.8, TxProt = 34.5, ExSec = 130

```r
df_vaches <- data.frame(
  rbind(
    c(Densite = 1.032, TxButy = 39.7, TxProt = 31.9, ExSec = 130),
    c(Densite = 1.032, TxButy = 42.8, TxProt = 34.5, ExSec = 130)
  )
)

pred_vaches <- predict(mod3, newdata = df_vaches, interval = "prediction")
cat("Vache Holstein :\n")
print(pred_vaches[1, ])
cat("\nVache Normande :\n")
print(pred_vaches[2, ])
```

**Sortie R :**

```
       fit      lwr      upr
1  14.621  14.046  15.197    # Holstein
2  15.134  14.548  15.720    # Normande
```

**Interpretation :** La vache Normande (fit = 15.13 L/100L) donne un **meilleur rendement** fromager que la Holstein (fit = 14.62 L/100L). La difference s'explique par les taux butyrique et proteique plus eleves.

```r
detach(lait)
```

---

## Exercice 3 : Hauteur des eucalyptus (calcul matriciel)

### Enonce

On dispose de mesures sur n = 1429 eucalyptus : hauteur (ht) et circonference a 1.30 m (circ). On souhaite elaborer un modele de prevision de la hauteur a partir de la circonference.

### Q1 : Importer les donnees

```r
eucal <- read.table("eucalyptus.txt", header = TRUE)
attach(eucal)
```

### Q2 : Nuage de points

```r
plot(circ, ht,
     main = "Hauteur vs Circonference des eucalyptus",
     xlab = "Circonference (cm)", ylab = "Hauteur (m)",
     pch = 19, col = "darkgreen")
```

### Q3 : Regression simple

Rappeler le modele et les hypotheses, puis estimer les parametres.

$\forall i \in \{1, \ldots, n\}, \quad \text{ht}_i = \beta_0 + \beta_1 \text{circ}_i + \varepsilon_i$ avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

```r
reg_simple <- lm(ht ~ circ, data = eucal)
resume_simple <- summary(reg_simple)
print(resume_simple)
```

### Q4 : Droite des moindres carres et graphe des residus

```r
lines(circ, predict(reg_simple), col = "red", lwd = 3)

plot(reg_simple$fitted.values, reg_simple$residuals,
     ylim = c(-10, 10),
     main = "Residus du modele simple",
     xlab = "Valeurs ajustees", ylab = "Residus")
abline(h = 0, col = "blue")
abline(h = -2 * resume_simple$sigma, col = "red")
abline(h =  2 * resume_simple$sigma, col = "red")
```

**Observation :** Les residus montrent de l'**heteroscedasticite**. Le modele simple n'est pas optimal.

### Q5 : Modele avec racine carree de la circonference

$\forall i \in \{1, \ldots, n\}, \quad \text{ht}_i = \beta_0 + \beta_1 \text{circ}_i + \beta_2 \sqrt{\text{circ}_i} + \varepsilon_i$ avec $\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$.

#### Q5a : Ecriture matricielle

Donner l'ecriture matricielle $Y = X\beta + E$ en precisant chaque element.

$$Y = \begin{pmatrix} \text{ht}_1 \\ \vdots \\ \text{ht}_n \end{pmatrix}, \quad X = \begin{pmatrix} 1 & \text{circ}_1 & \sqrt{\text{circ}_1} \\ \vdots & \vdots & \vdots \\ 1 & \text{circ}_n & \sqrt{\text{circ}_n} \end{pmatrix}, \quad \beta = \begin{pmatrix} \beta_0 \\ \beta_1 \\ \beta_2 \end{pmatrix}, \quad E = \begin{pmatrix} \varepsilon_1 \\ \vdots \\ \varepsilon_n \end{pmatrix}$$

```r
Y  <- ht
X0 <- rep(1, length(circ))
X1 <- circ
X2 <- sqrt(circ)
X  <- cbind(X0, X1, X2)
```

#### Q5b : Estimer les parametres $\beta_0, \beta_1, \beta_2$ sans `lm()`

$\hat{\beta} = (X'X)^{-1} X'Y$

```r
B <- solve(t(X) %*% X) %*% t(X) %*% Y
cat("beta_0 =", B[1], "\n")
cat("beta_1 =", B[2], "\n")
cat("beta_2 =", B[3], "\n")
```

**Sortie R :**

```
beta_0 = -4.6851
beta_1 = -0.0425
beta_2 =  5.8903
```

#### Q5c : Estimer la variance residuelle $\sigma^2$ sans `lm()`

$$\hat{\sigma}^2 = \frac{\text{SCR}}{n - p - 1} = \frac{\sum_{i=1}^n e_i^2}{n - p - 1}$$

```r
y_fit <- B[1] + B[2] * circ + B[3] * sqrt(circ)
e     <- ht - y_fit
n     <- length(e)
p     <- 2                                  # Nombre de variables (sans intercept)
sigma <- sqrt(sum(e^2) / (n - p - 1))
cat("sigma =", sigma, "\n")
```

#### Q5d : Estimer l'ecart-type de $\hat{\beta}_0, \hat{\beta}_1, \hat{\beta}_2$ sans `lm()`

$$\text{Var}(\hat{\beta}) = \sigma^2 (X'X)^{-1}$$

```r
var_beta <- sigma^2 * solve(t(X) %*% X)
se_B0 <- sqrt(var_beta[1, 1])
se_B1 <- sqrt(var_beta[2, 2])
se_B2 <- sqrt(var_beta[3, 3])

cat("SE(beta_0) =", se_B0, "\n")
cat("SE(beta_1) =", se_B1, "\n")
cat("SE(beta_2) =", se_B2, "\n")
```

#### Q5e : Test de significativite de $\beta_2$ sans `lm()`

Peut-on affirmer, au risque de 5%, que la racine carree de la circonference a une influence sur la hauteur ?

1. **Hypotheses :** $H_0 : \beta_2 = 0$ vs $H_1 : \beta_2 \neq 0$

2. **Statistique de test :** $T_0 = \hat{\beta}_2 / SE(\hat{\beta}_2)$

3. **Distribution sous $H_0$ :** $T_0 \sim t_{n-p-1}$

4. **Region de rejet ($\alpha = 5\%$) :** $]-\infty, -t_{n-p-1, 0.975}] \cup [t_{n-p-1, 0.975}, +\infty[$

```r
T0 <- B[3] / se_B2
ddl <- n - p - 1
t_critique <- qt(0.975, ddl)

cat("T0 =", T0, "\n")
cat("t_critique =", t_critique, "\n")

if (abs(T0) > t_critique) {
  cat("On REJETTE H0 : sqrt(circ) a un effet significatif sur la hauteur\n")
} else {
  cat("On ne rejette pas H0\n")
}
```

**Resultat :** $|T_0| > t_{\text{critique}}$, donc on **rejette $H_0$** avec un risque de 5%. La racine carree de la circonference a un effet significatif sur la hauteur.

#### Q5f : Verification avec `lm()`

```r
eucal2 <- cbind.data.frame(eucal, rcirc = sqrt(eucal[, "circ"]))
regmult <- lm(ht ~ circ + rcirc, data = eucal2)
resume_complet <- summary(regmult)
print(resume_complet)
```

**Comparaison :**

| Parametre | Calcul manuel | `lm()` | Identique ? |
|-----------|--------------|--------|-------------|
| $\beta_0$ | -4.6851 | -4.6851 | Oui |
| $\beta_1$ | -0.0425 | -0.0425 | Oui |
| $\beta_2$ | 5.8903 | 5.8903 | Oui |

Les resultats sont **strictement identiques**. C'est exactement ce que fait `lm()` en interne.

#### Q5g : Comparaison graphique

Superposer la courbe du modele au nuage de points et a la droite des moindres carres.

```r
plot(circ, ht,
     main = "Comparaison modele simple vs modele avec sqrt(circ)",
     xlab = "Circonference (cm)", ylab = "Hauteur (m)",
     pch = 19, col = "darkgreen")

# Modele simple (droite rouge pointillee)
lines(circ, predict(reg_simple), col = "red", lwd = 3, lty = 2)

# Modele avec sqrt(circ) (courbe bleue)
x_seq <- seq(min(circ), max(circ), length = 100)
result <- B[1] + B[2] * x_seq + B[3] * sqrt(x_seq)
lines(x_seq, result, col = "blue", lwd = 3)

legend("topleft",
       legend = c("Modele simple", "Modele avec sqrt(circ)"),
       col = c("red", "blue"), lwd = 3, lty = c(2, 1))
```

**Interpretation :** La courbe bleue (modele avec $\sqrt{\text{circ}}$) epouse mieux les donnees, surtout pour les petites et grandes circonferences. Le modele simple (droite rouge) sous-estime les petits arbres et surestime les grands.

```r
detach(eucal)
```

---

## Resume : concepts cles de la regression multiple

### Multicolinearite

| Symptome | Detection | Solution |
|----------|-----------|----------|
| Coefficients non significatifs malgre bon $R^2$ | cor(X) > 0.8 ou VIF > 10 | Retirer une variable |
| Coefficients instables | `cor(df)` | Selection de variables |
| Erreurs standards elevees | `vif(reg)` (package `car`) | ACP ou regularisation |

### Selection de variables

| Methode | Depart | Algorithme | Commande R |
|---------|--------|-----------|-----------|
| Backward | Modele complet | Retirer une variable a chaque etape | `step(reg, direction = "backward")` |
| Forward | Modele vide | Ajouter une variable a chaque etape | `step(reg, direction = "forward")` |
| Stepwise | Variable | Ajouter ou retirer a chaque etape | `step(reg, direction = "both")` |
