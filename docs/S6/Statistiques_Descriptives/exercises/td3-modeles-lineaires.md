---
title: "TD3 -- Modeles lineaires"
sidebar_position: 4
---

# TD3 -- Modeles lineaires

---

## Exercice 1 : Regression multiple (calcul matriciel)

**Enonce :** On dispose de $n = 20$ observations, 2 variables explicatives ($X_1, X_2$), et la matrice $(\mathbf{X}^T\mathbf{X})^{-1}$ est donnee.

### 1a) Estimation des coefficients

**Solution :**

$$\hat{\boldsymbol{\beta}} = (\mathbf{X}^T\mathbf{X})^{-1} \mathbf{X}^T \mathbf{Y}$$

Avec les valeurs numeriques fournies :

$$\hat{\boldsymbol{\beta}} = \begin{pmatrix} \hat{\beta}_0 \\ \hat{\beta}_1 \\ \hat{\beta}_2 \end{pmatrix}$$

**En R :**

```r
# Construire la matrice X (avec colonne de 1 pour l'intercept)
X <- cbind(1, x1, x2)

# Calcul des coefficients
B_hat <- solve(t(X) %*% X) %*% t(X) %*% Y

# Verification avec lm()
mod <- lm(Y ~ X1 + X2)
coef(mod)  # Doit donner les memes valeurs
```

### 1b) Estimation de $\sigma^2$

$$\hat{\sigma}^2 = \frac{SCR}{n - p - 1} = \frac{\sum(y_i - \hat{y}_i)^2}{n - 3}$$

```r
# Valeurs ajustees
y_hat <- X %*% B_hat

# Residus
residus <- Y - y_hat

# Variance residuelle
n <- length(Y)
p <- 2  # nombre de variables explicatives (sans intercept)
sigma2_hat <- sum(residus^2) / (n - p - 1)

cat("sigma^2_hat =", sigma2_hat, "\n")
```

### 1c) Test de significativite de $\beta_2$

$H_0: \beta_2 = 0$ vs $H_1: \beta_2 \neq 0$

$$T_0 = \frac{\hat{\beta}_2}{SE(\hat{\beta}_2)} \sim t_{n-p-1}$$

ou $SE(\hat{\beta}_2) = \sqrt{\hat{\sigma}^2 \cdot [(\mathbf{X}^T\mathbf{X})^{-1}]_{33}}$ (element diagonal correspondant).

```r
# Variance des coefficients
Var_B <- sigma2_hat * solve(t(X) %*% X)
SE_B2 <- sqrt(Var_B[3, 3])

# Statistique de test
T0 <- B_hat[3] / SE_B2

# Valeur critique
t_crit <- qt(0.975, df = n - p - 1)

cat("T0 =", T0, "\n")
cat("t_critique =", t_crit, "\n")

if (abs(T0) > t_crit) {
  cat("On rejette H0 : beta_2 est significativement different de 0\n")
} else {
  cat("On ne rejette pas H0\n")
}
```

### 1d) Intervalle de confiance pour $\beta_2$

$$IC_{95\%}(\beta_2) = \hat{\beta}_2 \pm t_{n-p-1, 0.975} \cdot SE(\hat{\beta}_2)$$

```r
ic_low <- B_hat[3] - t_crit * SE_B2
ic_up  <- B_hat[3] + t_crit * SE_B2
cat("IC 95% pour beta_2 : [", ic_low, ",", ic_up, "]\n")

# Verification
confint(mod)
```

---

## Exercice 2 : ANOVA a un facteur -- Completer la table

**Enonce :** On a $J = 3$ traitements, $n_j = 11$ observations par traitement ($n = 33$). On donne $SCT = 150$ et $SCR = 90$. Completer la table d'ANOVA et conclure au seuil 5%.

### Solution detaillee

**Etape 1 : Calculer $SCE$**

$$SCT = SCE + SCR \quad \Rightarrow \quad SCE = SCT - SCR = 150 - 90 = 60$$

**Etape 2 : Degres de liberte**

| Source | ddl |
|--------|-----|
| Facteur (inter) | $J - 1 = 3 - 1 = 2$ |
| Residus (intra) | $n - J = 33 - 3 = 30$ |
| Total | $n - 1 = 32$ |

**Etape 3 : Carres moyens**

$$CME = \frac{SCE}{J-1} = \frac{60}{2} = 30$$

$$CMR = \frac{SCR}{n-J} = \frac{90}{30} = 3$$

**Etape 4 : Statistique F**

$$F = \frac{CME}{CMR} = \frac{30}{3} = 10$$

**Etape 5 : Decision**

$F_{2, 30, 0.95} = 3.32$ (table de Fisher).

$F_{obs} = 10 > 3.32$ : **on rejette $H_0$**.

**Table ANOVA complete :**

| Source | ddl | SC | CM | F | Decision |
|--------|-----|-----|-----|---|----------|
| Facteur | 2 | 60 | 30 | 10 | Rejet de $H_0$ |
| Residus | 30 | 90 | 3 | | |
| Total | 32 | 150 | | | |

**Conclusion :** Au risque de 5%, le traitement a un effet significatif.

**Taille d'effet :**

$$\eta^2 = \frac{SCE}{SCT} = \frac{60}{150} = 0.40$$

Effet de grande taille ($\eta^2 > 0.14$).

**En R :**

```r
# Si on avait les donnees brutes :
mod <- lm(Y ~ Traitement, data = df)
anova(mod)

# Eta^2
anova_tab <- anova(mod)
eta_sq <- anova_tab["Traitement", "Sum Sq"] / sum(anova_tab[, "Sum Sq"])
cat("eta^2 =", eta_sq, "\n")
```
