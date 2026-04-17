---
title: "Chapitre 05 -- Regression lineaire (simple et multiple)"
sidebar_position: 5
---

# Chapitre 05 -- Regression lineaire (simple et multiple)

> **Idee centrale :** Trouver la meilleure droite (ou hyperplan) pour predire $Y$ a partir d'une ou plusieurs variables $X$.

**Prerequis :** [Tests courants](/S6/Statistiques_Descriptives/guide/04-common-tests)

---

## PARTIE A : Regression lineaire simple

---

## 1. Le modele

$$Y_i = \beta_0 + \beta_1 X_i + \varepsilon_i, \quad i = 1, \ldots, n$$

| Terme | Nom | Role |
|-------|-----|------|
| $Y$ | Variable reponse | Ce qu'on predit |
| $X$ | Variable explicative | Ce qu'on utilise pour predire |
| $\beta_0$ | Intercept | Valeur de $Y$ quand $X = 0$ |
| $\beta_1$ | Pente | Effet d'une unite de $X$ sur $Y$ |
| $\varepsilon$ | Erreur | Tout ce que le modele ne capture pas |

**Hypotheses sur $\varepsilon$ :**
$\varepsilon_i \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$ (c'est l'acronyme **LINE** : Linearite, Independance, Normalite, Egalite des variances).

---

## 2. Methode des Moindres Carres Ordinaires (MCO)

On cherche $\hat{\beta}_0$ et $\hat{\beta}_1$ qui minimisent :

$$\sum_{i=1}^{n} (y_i - \beta_0 - \beta_1 x_i)^2$$

**Formules :**

$$\hat{\beta}_1 = \frac{\text{Cov}(X, Y)}{\text{Var}(X)} = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}$$

$$\hat{\beta}_0 = \bar{y} - \hat{\beta}_1 \bar{x}$$

**Propriete :** la droite de regression passe toujours par le point $(\bar{x}, \bar{y})$.

---

## 3. Coefficient de determination $R^2$

### Decomposition de la variance

$$\underbrace{\sum(y_i - \bar{y})^2}_{SCT} = \underbrace{\sum(\hat{y}_i - \bar{y})^2}_{SCE} + \underbrace{\sum(y_i - \hat{y}_i)^2}_{SCR}$$

| Terme | Nom | Interpretation |
|-------|-----|---------------|
| $SCT$ | Somme des Carres Totale | Variabilite totale de $Y$ |
| $SCE$ | Somme des Carres Expliquee | Variabilite expliquee par le modele |
| $SCR$ | Somme des Carres Residuelle | Variabilite non expliquee |

$$R^2 = \frac{SCE}{SCT} = 1 - \frac{SCR}{SCT} \in [0, 1]$$

En regression simple : $R^2 = r_{XY}^2$ (carre du coefficient de correlation).

### $R^2$ ajuste (regression multiple)

$$R^2_{adj} = 1 - \frac{SCR/(n-p-1)}{SCT/(n-1)} = 1 - \frac{n-1}{n-p-1}(1 - R^2)$$

Le $R^2_{adj}$ penalise l'ajout de variables inutiles. Contrairement au $R^2$, il peut diminuer quand on ajoute une variable non informative.

---

## 4. Interpreter `summary(modele)`

```r noexec
modele <- lm(Sales ~ TV, data = pub)
resume <- summary(modele)
```

| Section | Que regarder |
|---------|-------------|
| `Coefficients: Estimate` | Valeurs de $\hat{\beta}_0$ et $\hat{\beta}_1$ |
| `Coefficients: Pr(>|t|)` | p-value du test $H_0: \beta_i = 0$. Si $p < 0.05$, la variable est significative |
| `Residual standard error` | Estimation de $\sigma$ (precision des predictions) |
| `Multiple R-squared` | Proportion de variabilite expliquee |
| `Adjusted R-squared` | $R^2$ corrige pour le nombre de variables |
| `F-statistic` | Test global : au moins un $\beta_i \neq 0$ ? |

**Codes de signification :** `***` ($p<0.001$), `**` ($p<0.01$), `*` ($p<0.05$), `.` ($p<0.1$)

---

## 5. Diagnostics (hypotheses LINE)

```r noexec
par(mfrow = c(2, 2))
plot(modele)
par(mfrow = c(1, 1))
```

| Graphique | Verifie | On veut voir |
|-----------|---------|-------------|
| Residuals vs Fitted | Linearite + Homoscedasticite | Nuage aleatoire, pas de structure |
| Normal Q-Q | Normalite des residus | Points sur la diagonale |
| Scale-Location | Homoscedasticite | Ligne rouge horizontale |
| Residuals vs Leverage | Points influents | Aucun point au-dela des lignes de Cook |

```r noexec
# Test de normalite des residus
shapiro.test(residuals(modele))
```

---

## 6. Prediction

```r noexec
nouvelles <- data.frame(TV = c(100, 200, 300))

# Intervalle de confiance (pour la MOYENNE de Y)
predict(modele, newdata = nouvelles, interval = "confidence")

# Intervalle de prediction (pour un INDIVIDU)
predict(modele, newdata = nouvelles, interval = "prediction")
```

**L'IP est toujours plus large que l'IC** car il inclut la variabilite individuelle $\varepsilon$.

---

## 7. Exemple du cours : Old Faithful

```r
data(faithful)
modele <- lm(eruptions ~ waiting, data = faithful)
summary(modele)
# R² = 0.8115 → 81% de la variabilite expliquee
# beta1 = 0.0756, p < 2e-16 → significatif

# Table ANOVA
anova(modele)
# F = 1162.06, p < 2e-16

# Prediction pour waiting = 70
predict(modele, newdata = data.frame(waiting = 70), interval = "prediction")
```

---

## PARTIE B : Regression lineaire multiple

---

## 8. Le modele matriciel

$$\mathbf{Y} = \mathbf{X} \boldsymbol{\beta} + \boldsymbol{\varepsilon}$$

| Matrice | Dimension | Contenu |
|---------|-----------|---------|
| $\mathbf{Y}$ | $n \times 1$ | Vecteur des reponses |
| $\mathbf{X}$ | $n \times (p+1)$ | Matrice du plan d'experience (1ere colonne = 1 pour l'intercept) |
| $\boldsymbol{\beta}$ | $(p+1) \times 1$ | Vecteur des parametres |
| $\boldsymbol{\varepsilon}$ | $n \times 1$ | Vecteur des erreurs, $\boldsymbol{\varepsilon} \sim \mathcal{N}(\mathbf{0}, \sigma^2 \mathbf{I}_n)$ |

### Estimateur MCO

$$\hat{\boldsymbol{\beta}} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}$$

### Variance des estimateurs

$$\text{Var}(\hat{\boldsymbol{\beta}}) = \sigma^2 (\mathbf{X}^T \mathbf{X})^{-1}$$

### Estimation de $\sigma^2$

$$\hat{\sigma}^2 = \frac{SCR}{n - p - 1} = \frac{\sum(y_i - \hat{y}_i)^2}{n - p - 1}$$

---

## 9. Calcul matriciel en R

```r noexec
# Construction manuelle
Y <- donnees$Rendement
X <- cbind(1, donnees$Densite, donnees$TxButy, donnees$TxProt)  # 1 pour l'intercept

# Coefficients
B_hat <- solve(t(X) %*% X) %*% t(X) %*% Y
# Equivalent a : coef(lm(Rendement ~ Densite + TxButy + TxProt))

# Valeurs ajustees et residus
y_hat <- X %*% B_hat
residus <- Y - y_hat

# Variance residuelle
n <- nrow(X)
p <- ncol(X) - 1  # nombre de variables (sans intercept)
sigma2 <- sum(residus^2) / (n - p - 1)

# Ecart-type des coefficients
Var_B <- sigma2 * solve(t(X) %*% X)
SE_B <- sqrt(diag(Var_B))

# Statistique de test pour chaque coefficient
T_stat <- B_hat / SE_B
```

---

## 10. Multicolinearite et VIF

Quand deux variables explicatives sont tres correlees, les estimations deviennent instables.

**VIF (Variance Inflation Factor) :**

$$VIF_j = \frac{1}{1 - R_j^2}$$

ou $R_j^2$ est le $R^2$ de la regression de $X_j$ sur toutes les autres variables.

| VIF | Interpretation |
|-----|---------------|
| $< 5$ | Pas de probleme |
| $5 - 10$ | Multicolinearite moderee |
| $> 10$ | Multicolinearite severe -- a traiter |

```r noexec
library(car)
vif(modele_multiple)
```

---

## 11. Selection de variables

### 11.1 Le critere AIC

$$AIC = n \ln(SCR/n) + 2(p+1)$$

L'AIC penalise la complexite du modele. On cherche le modele avec le **plus petit AIC**.

### 11.2 Selection pas a pas (stepwise)

```r
# Modele complet
modele_complet <- lm(Y ~ X1 + X2 + X3 + X4 + X5, data = df)

# Selection backward (enlever des variables une par une)
modele_final <- step(modele_complet, direction = "backward")

# Selection forward (ajouter des variables une par une)
modele_vide <- lm(Y ~ 1, data = df)
modele_final <- step(modele_vide, direction = "forward",
                     scope = formula(modele_complet))

# Selection both (ajouter et enlever)
modele_final <- step(modele_complet, direction = "both")

# Comparer les AIC
extractAIC(modele_complet)
extractAIC(modele_final)
```

---

## 12. Exemple du TP3 : Publicite et ventes

```r noexec
pub <- read.csv("Advertising.csv")

# Modele complet
reg <- lm(Sales ~ TV + Radio + Newspaper, data = pub)
summary(reg)
# R² = 0.89
# TV et Radio significatifs, Newspaper NON significatif

# Modele reduit
reg2 <- lm(Sales ~ TV + Radio, data = pub)
summary(reg2)
# R² ajuste quasi identique

# Prediction
predict(reg2, newdata = data.frame(TV = 100, Radio = 20),
        interval = "prediction")
```

### Exemple du TP3 : Eucalyptus (calcul matriciel)

```r noexec
# Y = beta0 + beta1*circ + beta2*sqrt(circ) + epsilon
Y <- eucal$ht
X <- cbind(1, eucal$circ, sqrt(eucal$circ))

B <- solve(t(X) %*% X) %*% t(X) %*% Y
# B[1] = beta0, B[2] = beta1, B[3] = beta2

# Verification avec lm()
eucal2 <- cbind.data.frame(eucal, rcirc = sqrt(eucal$circ))
summary(lm(ht ~ circ + rcirc, data = eucal2))
# Les coefficients sont identiques
```

---

## 13. Pieges classiques

### Piege 1 : Comparer des coefficients de variables sur des echelles differentes

$\hat{\beta}_1 = 0.05$ pour la TV et $\hat{\beta}_2 = 0.19$ pour la Radio ne veut **pas** dire que Radio a plus d'effet si les echelles sont differentes. Il faut **standardiser** les variables pour comparer.

### Piege 2 : Confondre $R^2$ et $R^2_{adj}$

$R^2$ augmente toujours quand on ajoute une variable. Seul $R^2_{adj}$ penalise la complexite.

### Piege 3 : Extrapoler

Ne jamais predire en dehors de la plage des donnees.

### Piege 4 : Ignorer la multicolinearite

Deux variables tres correlees rendent les coefficients instables et les tests peu fiables.

### Piege 5 : Oublier la colonne de 1 dans X

En calcul matriciel, la matrice $\mathbf{X}$ doit avoir une **premiere colonne de 1** pour l'intercept.

### Piege 6 : Correlation $\neq$ causalite

Un $R^2$ eleve ne prouve pas une relation causale.

---

## CHEAT SHEET

### Formules cles

| Formule | Expression |
|---------|-----------|
| Pente (simple) | $\hat{\beta}_1 = \text{Cov}(X,Y) / \text{Var}(X)$ |
| Intercept (simple) | $\hat{\beta}_0 = \bar{y} - \hat{\beta}_1 \bar{x}$ |
| MCO (multiple) | $\hat{\boldsymbol{\beta}} = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\mathbf{Y}$ |
| Variance estimateurs | $\text{Var}(\hat{\boldsymbol{\beta}}) = \hat{\sigma}^2 (\mathbf{X}^T\mathbf{X})^{-1}$ |
| $\hat{\sigma}^2$ | $SCR / (n - p - 1)$ |
| $R^2$ | $1 - SCR/SCT$ |
| $R^2_{adj}$ | $1 - \frac{n-1}{n-p-1}(1-R^2)$ |
| $SCT = SCE + SCR$ | Toujours |
| Test t sur $\beta_j$ | $T = \hat{\beta}_j / SE(\hat{\beta}_j) \sim t_{n-p-1}$ |
| Test F global | $F = \frac{SCE/p}{SCR/(n-p-1)} \sim F_{p, n-p-1}$ |

### Fonctions R

| Fonction | Usage |
|----------|-------|
| `lm(Y ~ X)` | Regression simple |
| `lm(Y ~ X1 + X2 + X3)` | Regression multiple |
| `lm(Y ~ ., data = df)` | Toutes les variables |
| `lm(Y ~ -1 + X)` | Sans intercept |
| `summary(mod)` | Resume complet |
| `anova(mod)` | Table ANOVA de la regression |
| `coef(mod)` | Coefficients |
| `confint(mod)` | IC des coefficients |
| `predict(mod, newdata, interval)` | Prediction avec IC/IP |
| `residuals(mod)` | Residus |
| `fitted(mod)` | Valeurs ajustees |
| `step(mod, direction)` | Selection de variables |
| `extractAIC(mod)` | Critere AIC |
| `vif(mod)` | VIF (package `car`) |
| `plot(mod)` | 4 diagnostics |
| `cooks.distance(mod)` | Points influents |
| `cor(df)` | Matrice de correlation |

### Workflow regression

1. **Visualiser** : `plot(X, Y)` ou `pairs(df)`
2. **Correler** : `cor(df)` -- reperer les multicolinearites
3. **Ajuster** : `lm(Y ~ X1 + X2 + ...)`
4. **Diagnostiquer** : `plot(modele)`, `shapiro.test(residuals(modele))`
5. **Selectionner** : `step(modele, direction = "backward")` si trop de variables
6. **Predire** : `predict(modele, newdata = ..., interval = "prediction")`
7. **Conclure** : interpreter les coefficients, le $R^2_{adj}$, les p-values
