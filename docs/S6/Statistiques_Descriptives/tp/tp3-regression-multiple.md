---
title: "TP3: Regression lineaire multiple"
sidebar_position: 3
---

# TP3: Regression lineaire multiple

## Objectifs

Maitriser la regression lineaire multiple et la selection de variables :
- Regression avec plusieurs variables explicatives
- Analyse de correlation
- Selection automatique de variables (backward, forward)
- Critere AIC pour comparer des modeles
- Visualisation 3D
- Calcul matriciel manuel des coefficients

## Structure

```
TP3/
├── README.md                    # Ce fichier
├── Sujet TP3.pdf               # Enonce officiel
├── src/
│   └── TP3_solutions.R         # Solutions commentees et nettoyees
├── TP3_Donnees/                # Jeux de donnees
│   ├── Advertising.csv
│   ├── lait.txt
│   └── eucalyptus.txt
└── (fichiers originaux)        # Deplaces vers _originals/
```

## Modele lineaire multiple

**Equation :** $Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \cdots + \beta_p X_p + \varepsilon$
ou $\varepsilon \sim \mathcal{N}(0, \sigma^2)$

**Forme matricielle :** $Y = X\beta + \varepsilon$
**Estimation :** $\hat{\beta} = (X'X)^{-1}X'Y$

**Syntaxe R :** `lm(Y ~ X1 + X2 + X3, data=df)`

## Packages requis

```r noexec
install.packages("rgl")     # Visualisation 3D
install.packages("car")     # Outils graphiques avances

library(rgl)
library(car)
```

## Exercices

### Exercice 1 : Publicite et ventes
Analyser l'impact de 3 medias publicitaires (TV, Radio, Journaux) sur les ventes.

**Donnees :** 200 entreprises avec budgets pub et ventes

**Demarche :**

#### 1. Analyse de correlation
```r noexec
cor(pub)  # Matrice de correlation
```
- TV et Sales : correles positivement
- Identifier les colinearites entre variables explicatives

#### 2. Regression simple (TV uniquement)
- $R^2$ moyen
- Residus non homoscedastiques
- **Transformation log :** ameliore l'homoscedasticite

#### 3. Tester les autres variables
- Radio vs TV : faible correlation
- Newspaper vs TV : faible correlation

#### 4. Regression multiple (3 variables)
```r noexec
regm <- lm(Sales ~ TV + Radio + Newspaper)
```
- $R^2 = 0.89$ -- 89% de variabilite expliquee
- **Test global (test F) :** $p < 0.05$ -- au moins une variable significative
- **Tests individuels :**
  - TV : significatif ($p < 0.05$)
  - Radio : significatif ($p < 0.05$)
  - Newspaper : **NON** significatif ($p > 0.05$)

#### 5. Modele reduit (TV + Radio)
```r noexec
reg2 <- lm(Sales ~ TV + Radio)
```
- Radio a une influence plus forte que TV (coefficient plus eleve)
- Modele plus parcimonieux sans perte de qualite

#### 6. Visualisation 3D
```r noexec
scatter3d(Sales ~ TV + Radio, surface=TRUE)
```
- Plan de regression dans l'espace 3D
- Visualiser l'ajustement et les residus

#### 7. Prediction
Pour TV = 100 k$, Radio = 20 k$ :
```r noexec
predict(reg2, data.frame(TV=100, Radio=20), interval="prediction")
```

**Concepts cles :**
- Multicolinearite : correlation entre variables explicatives
- Test global vs tests individuels
- Parcimonie : preferer un modele simple

### Exercice 2 : Lait et rendement fromager
Predire le rendement fromager a partir de la composition du lait (5 variables).

**Variables explicatives :**
- Densite, TxButy (taux butyrique), TxProt (taux proteique), TxCase (taux caseine), ExSec (extrait sec)

**Demarche :**

#### 1. Matrice de correlation
```r noexec
cor(lait[,1:5])
```
**Observations :**
- ExSec ~ Densite : correlation 0.76
- TxCase ~ TxProt : tres correles 0.96 -- **redondance d'information**

**Implication :** Un modele avec moins de variables peut fonctionner aussi bien

#### 2. Visualisations bivariees
- Densite vs Rendement : non lineaire
- TxButy, TxProt, TxCase, ExSec vs Rendement : lineaires

#### 3. Regression multiple complete
```r noexec
reg <- lm(Rendement ~ Densite + TxButy + TxProt + TxCase + ExSec)
```
**Variables significatives ($p < 0.05$) :**
- TxButy
- ExSec

Les autres variables ne sont pas significatives (multicolinearite)

#### 4. Selection automatique (backward)
```r noexec
reg_backward <- step(reg, direction="backward")
```

**Algorithme `step()` :**
1. Calcule l'AIC du modele complet
2. Enleve une variable a la fois et recalcule l'AIC
3. Garde le modele avec l'AIC le plus petit
4. Repete jusqu'a ce qu'aucune amelioration ne soit possible

**Resultat :** Densite + TxButy + TxProt + ExSec (enleve TxCase)

#### 5. Modele sans intercept
```r noexec
reg_no_intercept <- lm(Rendement ~ -1 + Densite + TxButy + TxProt + ExSec)
```
- `-1` ou `0` enleve l'ordonnee a l'origine
- Force le passage par (0,0)

#### 6. Comparaison des modeles
Criteres :
- **AIC (Akaike Information Criterion) :** plus petit = meilleur
- **$R^2$ ajuste :** penalise le nombre de variables

```r noexec
extractAIC(reg)
summary(reg)$adj.r.squared
```

**Decision :** Choisir le modele avec le meilleur compromis AIC/$R^2$

#### 7. Prediction
Comparer deux vaches (Holstein vs Normande) :
```r noexec
predict(reg, newdata=df_vaches, interval="prediction")
```

**Concepts cles :**
- Selection de variables : backward, forward, stepwise
- AIC pour comparer des modeles non emboites
- $R^2$ ajuste pour penaliser la complexite
- Modeles sans intercept (cas particuliers)

### Exercice 3 : Hauteur des eucalyptus (calcul matriciel)
Predire la hauteur des arbres a partir de leur circonference avec calcul matriciel manuel.

**Objectif pedagogique :** Comprendre les calculs matriciels derriere `lm()`

**Demarche :**

#### 1. Visualisation et regression simple
```r noexec
plot(circ, ht)
reg_simple <- lm(ht ~ circ)
```
- Residus non homoscedastiques -- amelioration possible

#### 2. Modele avec racine carree
**Hypothese :** $\text{ht} = \beta_0 + \beta_1 \cdot \text{circ} + \beta_2 \cdot \sqrt{\text{circ}} + \varepsilon$

#### 3. Calcul matriciel manuel

**a) Construction des matrices**
```r noexec
Y <- ht                    # Vecteur reponse (n x 1)
X0 <- rep(1, length(circ)) # Intercept
X1 <- circ                 # Circonference
X2 <- sqrt(circ)           # Racine carree
X <- cbind(X0, X1, X2)     # Matrice de design (n x 3)
```

**b) Calcul des coefficients**
```r noexec
B <- solve(t(X) %*% X) %*% t(X) %*% Y
```
- `t(X)` : transposee de X
- `%*%` : produit matriciel
- `solve()` : inverse de matrice

**Resultat :** $B = (\hat{\beta}_0, \hat{\beta}_1, \hat{\beta}_2)^T$

**c) Calcul de $\sigma$ (ecart-type residuel)**
```r noexec
y_fit <- X %*% B          # Valeurs ajustees
e <- Y - y_fit            # Residus
n <- length(e)
p <- 2                    # Nombre de variables (sans intercept)
sigma <- sqrt(sum(e^2) / (n - p - 1))
```

**d) Ecarts-types des coefficients**
```r noexec
var_beta <- sigma^2 * solve(t(X) %*% X)
se_B0 <- sqrt(var_beta[1, 1])
se_B1 <- sqrt(var_beta[2, 2])
se_B2 <- sqrt(var_beta[3, 3])
```

**e) Test de significativite de $\beta_2$**
- **$H_0$ :** $\beta_2 = 0$ (la racine carree n'a pas d'effet)
- **$H_1$ :** $\beta_2 \neq 0$ (la racine carree a un effet)

**Statistique de test :**
```r noexec
T0 <- B[3] / se_B2
```
Sous $H_0$ : $T_0 \sim t_{n-p-1}$

**Region de rejet ($\alpha = 5\%$) :** $]-\infty, -t_{n-p-1, 0.975}] \cup [t_{n-p-1, 0.975}, +\infty[$

```r noexec
t_critique <- qt(0.975, n-p-1)
if (abs(T0) > t_critique) {
  # Rejeter H0
}
```

**f) Verification avec `lm()`**
```r noexec
reg_complet <- lm(ht ~ circ + sqrt(circ))
summary(reg_complet)
```
Verifier que les coefficients correspondent

**g) Comparaison graphique**
- Tracer le modele simple et le modele avec $\sqrt{\text{circ}}$
- Visualiser l'amelioration

**Concepts cles :**
- Forme matricielle de la regression
- Calcul manuel de $\hat{\beta}$, $\sigma$, $SE(\hat{\beta})$
- Tests d'hypothese sur les coefficients
- Distributions t de Student
- Transformations de variables ($\sqrt{}$, log, etc.)

## Selection de variables

### Methodes

1. **Forward (ascendante) :**
   - Commence avec aucune variable
   - Ajoute une variable a chaque etape
   - S'arrete quand aucune amelioration

2. **Backward (descendante) :**
   - Commence avec toutes les variables
   - Enleve une variable a chaque etape
   - S'arrete quand aucune amelioration

3. **Stepwise (mixte) :**
   - Combine forward et backward
   - Peut ajouter et enlever des variables

### Fonction `step()`

```r noexec
step(reg, direction="backward")  # Backward
step(reg, direction="forward")   # Forward
step(reg, direction="both")      # Stepwise
```

**Critere :** AIC (par defaut)

### Criteres de comparaison

| Critere | Formule | Objectif |
|---------|---------|----------|
| AIC | $-2\ln(L) + 2p$ | Minimiser |
| BIC | $-2\ln(L) + p \cdot \ln(n)$ | Minimiser |
| $R^2$ ajuste | $1 - (1-R^2)(n-1)/(n-p-1)$ | Maximiser |

- $L$ : vraisemblance
- $p$ : nombre de parametres
- $n$ : nombre d'observations

## Visualisation 3D

```r noexec
library(rgl)
library(car)

scatter3d(Y ~ X1 + X2, data=df,
          surface=TRUE,    # Afficher le plan de regression
          grid=TRUE,       # Grille
          ellipsoid=TRUE)  # Ellipsoide de confiance
```

**Controles :**
- Souris pour faire tourner
- Molette pour zoomer
- Visualiser l'ajustement dans l'espace

## Multicolinearite

### Probleme
Lorsque deux variables explicatives sont tres correlees :
- Coefficients instables
- Erreurs standards elevees
- Tests non significatifs (alors que le modele est bon)

### Detection
1. Matrice de correlation : $|r| > 0.8$
2. VIF (Variance Inflation Factor) :
```r noexec
library(car)
vif(reg)  # VIF > 10 → probleme
```

### Solutions
1. Retirer une des variables correlees
2. Combiner les variables (ACP)
3. Regularisation (Ridge, Lasso)

## Commandes essentielles

```r noexec
# Regression multiple
reg <- lm(Y ~ X1 + X2 + X3, data=df)
reg <- lm(Y ~ ., data=df)        # Toutes les colonnes sauf Y

# Sans intercept
reg <- lm(Y ~ -1 + X1 + X2)
reg <- lm(Y ~ 0 + X1 + X2)

# Interaction
reg <- lm(Y ~ X1 * X2)           # X1 + X2 + X1:X2
reg <- lm(Y ~ X1 + X2 + X1:X2)  # Equivalent

# Transformation
reg <- lm(Y ~ X + I(X^2))        # Polynomial
reg <- lm(log(Y) ~ X)            # Log
reg <- lm(Y ~ sqrt(X))           # Racine

# Selection
step(reg, direction="backward")
step(reg, direction="forward", scope=~X1+X2+X3)

# Comparaison
extractAIC(reg1)
summary(reg)$adj.r.squared
AIC(reg1, reg2, reg3)

# Prediction
predict(reg, newdata=df_new, interval="prediction")

# Matrice de correlation
cor(df)
pairs(df)  # Matrice de nuages de points

# Visualisation 3D
scatter3d(Y ~ X1 + X2, data=df)
```

## Interpretation des coefficients

### Regression simple
$\beta_1$ : augmentation moyenne de Y quand X augmente de 1 unite

### Regression multiple
$\beta_1$ : augmentation moyenne de Y quand $X_1$ augmente de 1 unite,
**toutes les autres variables etant constantes**

### Attention
- Ne pas confondre significativite statistique et importance pratique
- Un coefficient peut etre non significatif a cause de la multicolinearite
- Un $R^2$ eleve ne garantit pas un bon modele (verifier les residus !)

## Ressources

- `?lm` pour la documentation
- `?step` pour la selection de variables
- `?cor` pour la correlation
- Package `car` : outils diagnostiques avances
- Package `rgl` : visualisation 3D interactive
