---
title: "Formulaire -- Statistiques Descriptives"
sidebar_position: 3
---

# Formulaire -- Statistiques Descriptives

---

## 1. Statistiques descriptives

| Formule | Expression |
|---------|-----------|
| Moyenne | $\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i$ |
| Variance (echantillon) | $s^2 = \frac{1}{n-1}\sum_{i=1}^n(x_i - \bar{x})^2$ |
| Ecart-type | $s = \sqrt{s^2}$ |
| Coefficient de variation | $CV = s/\bar{x}$ |
| Covariance | $\text{Cov}(X,Y) = \frac{1}{n-1}\sum(x_i-\bar{x})(y_i-\bar{y})$ |
| Correlation de Pearson | $r = \frac{\text{Cov}(X,Y)}{s_X \cdot s_Y}$ |
| IQR | $Q_3 - Q_1$ |
| Outlier (boxplot) | Au-dela de $Q_1 - 1.5 \cdot IQR$ ou $Q_3 + 1.5 \cdot IQR$ |

---

## 2. Estimation

### Estimateurs ponctuels

| Parametre | Estimateur | Biais |
|-----------|-----------|-------|
| $\mu$ | $\bar{X} = \frac{1}{n}\sum X_i$ | Sans biais |
| $\sigma^2$ | $S^2 = \frac{1}{n-1}\sum(X_i-\bar{X})^2$ | Sans biais |
| $\sigma^2$ (MLE) | $\hat{\sigma}^2 = \frac{1}{n}\sum(X_i-\bar{X})^2$ | Biaise |
| $p$ | $\hat{p} = \frac{k}{n}$ | Sans biais |

### Proprietes

| Propriete | Definition |
|-----------|-----------|
| Sans biais | $E(\hat{\theta}) = \theta$ |
| Convergent | $\hat{\theta}_n \xrightarrow{P} \theta$ |
| Efficace | Variance minimale parmi les estimateurs sans biais |
| MSE | $\text{MSE} = \text{Var}(\hat{\theta}) + \text{Biais}^2$ |

### Theoreme Central Limite

$$\frac{\bar{X}_n - \mu}{\sigma/\sqrt{n}} \xrightarrow{d} \mathcal{N}(0,1) \quad \text{quand } n \to \infty$$

### Intervalles de confiance

| Parametre | IC a $1-\alpha$ | Condition |
|-----------|----------------|-----------|
| $\mu$ ($\sigma$ inconnu) | $\bar{X} \pm t_{n-1,1-\alpha/2} \cdot \frac{S}{\sqrt{n}}$ | Normalite ou $n \geq 30$ |
| $\mu$ ($\sigma$ connu) | $\bar{X} \pm z_{1-\alpha/2} \cdot \frac{\sigma}{\sqrt{n}}$ | Normalite ou $n \geq 30$ |
| $p$ | $\hat{p} \pm z_{1-\alpha/2} \cdot \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$ | $n\hat{p} \geq 5$, $n(1-\hat{p}) \geq 5$ |

---

## 3. Tests d'hypothese

### Statistiques de test

| Test | Statistique | Loi sous $H_0$ |
|------|------------|----------------|
| Z-test (1 moy, $\sigma$ connu) | $Z = \frac{\bar{X}-\mu_0}{\sigma/\sqrt{n}}$ | $\mathcal{N}(0,1)$ |
| t-test (1 moy, $\sigma$ inconnu) | $T = \frac{\bar{X}-\mu_0}{S/\sqrt{n}}$ | $t_{n-1}$ |
| t-test (2 moy, var. egales) | $T = \frac{\bar{X}_1-\bar{X}_2}{S_p\sqrt{1/n_1+1/n_2}}$ | $t_{n_1+n_2-2}$ |
| Variance poolee | $S_p^2 = \frac{(n_1-1)S_1^2+(n_2-1)S_2^2}{n_1+n_2-2}$ | |
| t-test (2 moy, Welch) | $T = \frac{\bar{X}_1-\bar{X}_2}{\sqrt{S_1^2/n_1+S_2^2/n_2}}$ | $t_\nu$ (Welch-Satterthwaite) |
| t-test apparie | $T = \frac{\bar{d}}{S_d/\sqrt{n}}$ | $t_{n-1}$ |
| Test F (2 variances) | $F = S_1^2/S_2^2$ | $F_{n_1-1,n_2-1}$ |
| Chi-deux (1 variance) | $\chi^2 = \frac{(n-1)S^2}{\sigma_0^2}$ | $\chi^2_{n-1}$ |
| Chi-deux (independance) | $\chi^2 = \sum\frac{(O_{ij}-E_{ij})^2}{E_{ij}}$ | $\chi^2_{(r-1)(c-1)}$ |
| Proportion (Z) | $Z = \frac{\hat{p}-p_0}{\sqrt{p_0(1-p_0)/n}}$ | $\mathcal{N}(0,1)$ |

### Regions de rejet (seuil $\alpha$)

| Type | Condition de rejet |
|------|-------------------|
| Bilateral | $|T| > t_{n-1, 1-\alpha/2}$ |
| Unilateral droit | $T > t_{n-1, 1-\alpha}$ |
| Unilateral gauche | $T < -t_{n-1, 1-\alpha}$ |

### Regle de decision par p-value

$$\boxed{p\text{-value} < \alpha \Rightarrow \text{Rejeter } H_0}$$

---

## 4. Regression lineaire simple

| Formule | Expression |
|---------|-----------|
| Modele | $Y_i = \beta_0 + \beta_1 X_i + \varepsilon_i$ |
| Pente | $\hat{\beta}_1 = \frac{\text{Cov}(X,Y)}{\text{Var}(X)}$ |
| Intercept | $\hat{\beta}_0 = \bar{y} - \hat{\beta}_1\bar{x}$ |
| SCT | $\sum(y_i - \bar{y})^2$ |
| SCE | $\sum(\hat{y}_i - \bar{y})^2$ |
| SCR | $\sum(y_i - \hat{y}_i)^2$ |
| Decomposition | $SCT = SCE + SCR$ |
| $R^2$ | $1 - SCR/SCT = SCE/SCT$ |
| $\hat{\sigma}^2$ | $SCR/(n-2)$ |
| Test sur $\beta_1$ | $T = \hat{\beta}_1/SE(\hat{\beta}_1) \sim t_{n-2}$ |
| Lien $R^2$/correlation | $R^2 = r_{XY}^2$ (en simple) |

---

## 5. Regression lineaire multiple

| Formule | Expression |
|---------|-----------|
| Modele | $\mathbf{Y} = \mathbf{X}\boldsymbol{\beta} + \boldsymbol{\varepsilon}$ |
| Estimateur MCO | $\hat{\boldsymbol{\beta}} = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^T\mathbf{Y}$ |
| Variance | $\text{Var}(\hat{\boldsymbol{\beta}}) = \sigma^2(\mathbf{X}^T\mathbf{X})^{-1}$ |
| $\hat{\sigma}^2$ | $SCR/(n-p-1)$ |
| $R^2$ ajuste | $1 - \frac{n-1}{n-p-1}(1-R^2)$ |
| Test sur $\beta_j$ | $T = \hat{\beta}_j/SE(\hat{\beta}_j) \sim t_{n-p-1}$ |
| Test F global | $F = \frac{SCE/p}{SCR/(n-p-1)} \sim F_{p,n-p-1}$ |
| VIF | $VIF_j = 1/(1-R_j^2)$ |

---

## 6. ANOVA

### ANOVA 1 facteur ($J$ groupes, $n$ total)

| Formule | Expression |
|---------|-----------|
| Modele | $Y_{ij} = \mu + \alpha_i + \varepsilon_{ij}$ |
| $SCE$ (inter) | $\sum_i n_i(\bar{Y}_{i\cdot} - \bar{Y}_{\cdot\cdot})^2$ |
| $SCR$ (intra) | $\sum_{i,j}(Y_{ij} - \bar{Y}_{i\cdot})^2$ |
| $CME$ | $SCE/(J-1)$ |
| $CMR$ | $SCR/(n-J)$ |
| $F$ | $CME/CMR \sim F_{J-1, n-J}$ |
| $\eta^2$ | $SCE/SCT$ |

### ANOVA 2 facteurs ($I \times J$)

| Source | ddl |
|--------|-----|
| Facteur A | $I-1$ |
| Facteur B | $J-1$ |
| Interaction A:B | $(I-1)(J-1)$ |
| Residus | $n - IJ$ |

### Formules R

| Modele | Syntaxe |
|--------|---------|
| ANOVA 1 facteur | `anova(lm(Y ~ G))` |
| ANOVA 2 facteurs (additif) | `anova(lm(Y ~ A + B))` |
| ANOVA 2 facteurs (interaction) | `anova(lm(Y ~ A * B))` |

---

## 7. Tests non parametriques

| Situation | Test | R |
|-----------|------|---|
| 1 ech. | Wilcoxon signe | `wilcox.test(x, mu=)` |
| 2 ech. apparies | Wilcoxon signe | `wilcox.test(x, y, paired=T)` |
| 2 ech. indep. | Mann-Whitney | `wilcox.test(x, y)` |
| $k$ ech. | Kruskal-Wallis | `kruskal.test(Y ~ G)` |

---

## 8. Quantiles de reference ($\alpha = 0.05$)

### Loi normale $\mathcal{N}(0,1)$

| $P(Z \leq z)$ | $z$ |
|----------------|-----|
| 0.90 | 1.282 |
| 0.95 | 1.645 |
| 0.975 | 1.960 |
| 0.99 | 2.326 |
| 0.995 | 2.576 |

### Loi de Student $t_\nu$

| $\nu$ | $t_{0.975}$ | $t_{0.95}$ |
|-------|-------------|------------|
| 5 | 2.571 | 2.015 |
| 10 | 2.228 | 1.812 |
| 15 | 2.131 | 1.753 |
| 20 | 2.086 | 1.725 |
| 25 | 2.060 | 1.708 |
| 30 | 2.042 | 1.697 |
| 50 | 2.009 | 1.676 |
| 100 | 1.984 | 1.660 |
| $\infty$ | 1.960 | 1.645 |

### Loi du chi-deux $\chi^2_\nu$

| $\nu$ | $\chi^2_{0.95}$ | $\chi^2_{0.975}$ | $\chi^2_{0.025}$ |
|-------|-----------------|-------------------|-------------------|
| 5 | 11.07 | 12.83 | 0.831 |
| 10 | 18.31 | 20.48 | 3.247 |
| 15 | 25.00 | 27.49 | 6.262 |
| 20 | 31.41 | 34.17 | 9.591 |
| 30 | 43.77 | 46.98 | 16.79 |

### Loi de Fisher $F_{\nu_1, \nu_2}$ (quantile 0.95)

| $\nu_1 \backslash \nu_2$ | 5 | 10 | 15 | 20 | 30 |
|---|---|---|---|---|---|
| 1 | 6.61 | 4.96 | 4.54 | 4.35 | 4.17 |
| 2 | 5.79 | 4.10 | 3.68 | 3.49 | 3.32 |
| 3 | 5.41 | 3.71 | 3.29 | 3.10 | 2.92 |
| 5 | 5.05 | 3.33 | 2.90 | 2.71 | 2.53 |
| 10 | 4.74 | 2.98 | 2.54 | 2.35 | 2.16 |

---

## 9. Fonctions R essentielles (aide-memoire)

```r noexec
# ── Import ───────────────────────
read.csv("f.csv")
read.csv2("f.csv")       # format francais
read.table("f.txt", header = TRUE)

# ── Descriptives ─────────────────
mean(x); median(x); sd(x); var(x)
summary(x); quantile(x); IQR(x); cor(x, y)

# ── Visualisation ────────────────
plot(x, y); hist(x); boxplot(y ~ g)
par(mfrow = c(2,2)); plot(mod)

# ── Regression ───────────────────
mod <- lm(Y ~ X)
summary(mod); anova(mod); coef(mod); confint(mod)
predict(mod, newdata, interval = "prediction")
residuals(mod); fitted(mod)
step(mod, direction = "backward")
extractAIC(mod)

# ── Tests ────────────────────────
t.test(x, mu = ); t.test(x, y); t.test(x, y, paired = TRUE)
var.test(x, y); bartlett.test(y ~ g)
prop.test(x, n, p = ); chisq.test(tab)
shapiro.test(x); wilcox.test(x, y); kruskal.test(y ~ g)

# ── ANOVA ────────────────────────
anova(lm(Y ~ G))
TukeyHSD(aov(Y ~ G))
library(emmeans); emmeans(mod, pairwise ~ G, adjust = "bonferroni")

# ── Distributions ────────────────
qnorm(0.975)       # 1.96
qt(0.975, df = 10) # 2.228
qchisq(0.95, df = 10)
qf(0.95, df1 = 2, df2 = 30)

# ── Matrices ─────────────────────
X <- cbind(1, x1, x2)
B <- solve(t(X) %*% X) %*% t(X) %*% Y
```
