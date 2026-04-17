---
title: "TP3: Régression linéaire multiple"
sidebar_position: 3
---

# TP3: Régression linéaire multiple

## Objectifs

Maîtriser la régression linéaire multiple et la sélection de variables:
- Régression avec plusieurs variables explicatives
- Analyse de corrélation
- Sélection automatique de variables (backward, forward)
- Critère AIC pour comparer des modèles
- Visualisation 3D
- Calcul matriciel manuel des coefficients

## Structure

```
TP3/
├── README.md                    # Ce fichier
├── Sujet TP3.pdf               # Énoncé officiel
├── src/
│   └── TP3_solutions.R         # Solutions commentées et nettoyées
├── TP3_Donnees/                # Jeux de données
│   ├── Advertising.csv
│   ├── lait.txt
│   └── eucalyptus.txt
└── (fichiers originaux)        # Déplacés vers _originals/
```

## Modèle linéaire multiple

**Équation:** Y = β₀ + β₁X₁ + β₂X₂ + ... + βₚXₚ + ε  
où ε ~ N(0, σ²)

**Forme matricielle:** Y = Xβ + ε  
**Estimation:** β̂ = (X'X)⁻¹X'Y

**Syntaxe R:** `lm(Y ~ X1 + X2 + X3, data=df)`

## Packages requis

```r
install.packages("rgl")     # Visualisation 3D
install.packages("car")     # Outils graphiques avancés

library(rgl)
library(car)
```

## Exercices

### Exercice 1: Publicité et ventes
Analyser l'impact de 3 médias publicitaires (TV, Radio, Journaux) sur les ventes.

**Données:** 200 entreprises avec budgets pub et ventes

**Workflow:**

#### 1. Analyse de corrélation
```r
cor(pub)  # Matrice de corrélation
```
- TV et Sales: corrélés positivement
- Identifier les colinéarités entre variables explicatives

#### 2. Régression simple (TV uniquement)
- R² moyen
- Résidus non homoscédastiques
- **Transformation log:** améliore l'homoscédasticité

#### 3. Tester les autres variables
- Radio vs TV: faible corrélation
- Newspaper vs TV: faible corrélation

#### 4. Régression multiple (3 variables)
```r
regm <- lm(Sales ~ TV + Radio + Newspaper)
```
- R² = 0.89 → 89% de variabilité expliquée
- **Test global (F-test):** p < 0.05 → au moins une variable significative
- **Tests individuels:**
  - TV: significatif (p < 0.05)
  - Radio: significatif (p < 0.05)
  - Newspaper: **NON** significatif (p > 0.05)

#### 5. Modèle réduit (TV + Radio)
```r
reg2 <- lm(Sales ~ TV + Radio)
```
- Radio a une influence plus forte que TV (coefficient plus élevé)
- Modèle plus parcimonieux sans perte de qualité

#### 6. Visualisation 3D
```r
scatter3d(Sales ~ TV + Radio, surface=TRUE)
```
- Plan de régression dans l'espace 3D
- Visualiser l'ajustement et les résidus

#### 7. Prédiction
Pour TV=100k$, Radio=20k$:
```r
predict(reg2, data.frame(TV=100, Radio=20), interval="prediction")
```

**Concepts clés:**
- Multicolinéarité: corrélation entre variables explicatives
- Test global vs tests individuels
- Parcimonie: préférer un modèle simple

### Exercice 2: Lait et rendement fromager
Prédire le rendement fromager à partir de la composition du lait (5 variables).

**Variables explicatives:**
- Densite, TxButy (taux butyrique), TxProt (taux protéique), TxCase (taux caséine), ExSec (extrait sec)

**Workflow:**

#### 1. Matrice de corrélation
```r
cor(lait[,1:5])
```
**Observations:**
- ExSec ~ Densite: corrélation 0.76
- TxCase ~ TxProt: très corrélés 0.96 → **redondance d'information**

**Implication:** Un modèle avec moins de variables peut fonctionner aussi bien

#### 2. Visualisations bivariées
- Densite vs Rendement: non linéaire
- TxButy, TxProt, TxCase, ExSec vs Rendement: linéaires

#### 3. Régression multiple complète
```r
reg <- lm(Rendement ~ Densite + TxButy + TxProt + TxCase + ExSec)
```
**Variables significatives (p < 0.05):**
- TxButy
- ExSec

Les autres variables ne sont pas significatives (multicolinéarité)

#### 4. Sélection automatique (backward)
```r
reg_backward <- step(reg, direction="backward")
```

**Algorithme step():**
1. Calcule l'AIC du modèle complet
2. Enlève une variable à la fois et recalcule l'AIC
3. Garde le modèle avec l'AIC le plus petit
4. Répète jusqu'à ce qu'aucune amélioration ne soit possible

**Résultat:** Densite + TxButy + TxProt + ExSec (enlève TxCase)

#### 5. Modèle sans intercept
```r
reg_no_intercept <- lm(Rendement ~ -1 + Densite + TxButy + TxProt + ExSec)
```
- `-1` ou `0` enlève l'ordonnée à l'origine
- Force le passage par (0,0)

#### 6. Comparaison des modèles
Critères:
- **AIC (Akaike Information Criterion):** plus petit = meilleur
- **R² ajusté:** pénalise le nombre de variables

```r
extractAIC(reg)
summary(reg)$adj.r.squared
```

**Décision:** Choisir le modèle avec le meilleur compromis AIC/R²

#### 7. Prédiction
Comparer deux vaches (Holstein vs Normande):
```r
predict(reg, newdata=df_vaches, interval="prediction")
```

**Concepts clés:**
- Sélection de variables: backward, forward, stepwise
- AIC pour comparer des modèles non emboîtés
- R² ajusté pour pénaliser la complexité
- Modèles sans intercept (cas particuliers)

### Exercice 3: Hauteur des eucalyptus (calcul matriciel)
Prédire la hauteur des arbres à partir de leur circonférence avec calcul matriciel manuel.

**Objectif pédagogique:** Comprendre les calculs matriciels derrière `lm()`

**Workflow:**

#### 1. Visualisation et régression simple
```r
plot(circ, ht)
reg_simple <- lm(ht ~ circ)
```
- Résidus non homoscédastiques → amélioration possible

#### 2. Modèle avec racine carrée
**Hypothèse:** ht = β₀ + β₁*circ + β₂*√circ + ε

#### 3. Calcul matriciel manuel

**a) Construction des matrices**
```r
Y <- ht                    # Vecteur réponse (n × 1)
X0 <- rep(1, length(circ)) # Intercept
X1 <- circ                 # Circonférence
X2 <- sqrt(circ)           # Racine carrée
X <- cbind(X0, X1, X2)     # Matrice de design (n × 3)
```

**b) Calcul des coefficients**
```r
B <- solve(t(X) %*% X) %*% t(X) %*% Y
```
- `t(X)`: transposée de X
- `%*%`: produit matriciel
- `solve()`: inverse de matrice

**Résultat:** B = [β₀, β₁, β₂]'

**c) Calcul de σ (écart-type résiduel)**
```r
y_fit <- X %*% B          # Valeurs ajustées
e <- Y - y_fit            # Résidus
n <- length(e)
p <- 2                    # Nombre de variables (sans intercept)
sigma <- sqrt(sum(e^2) / (n - p - 1))
```

**d) Écarts-types des coefficients**
```r
var_beta <- sigma^2 * solve(t(X) %*% X)
se_B0 <- sqrt(var_beta[1, 1])
se_B1 <- sqrt(var_beta[2, 2])
se_B2 <- sqrt(var_beta[3, 3])
```

**e) Test de significativité de β₂**
- **H₀:** β₂ = 0 (racine carrée n'a pas d'effet)
- **H₁:** β₂ ≠ 0 (racine carrée a un effet)

**Statistique de test:**
```r
T0 <- B[3] / se_B2
```
Sous H₀: T₀ ~ t(n-p-1)

**Région de rejet (α=5%):** ]-∞, -t_{n-p-1, 0.975}] ∪ [t_{n-p-1, 0.975}, +∞[

```r
t_critique <- qt(0.975, n-p-1)
if (abs(T0) > t_critique) {
  # Rejeter H₀
}
```

**f) Vérification avec lm()**
```r
reg_complet <- lm(ht ~ circ + sqrt(circ))
summary(reg_complet)
```
Vérifier que les coefficients correspondent

**g) Comparaison graphique**
- Tracer le modèle simple et le modèle avec √circ
- Visualiser l'amélioration

**Concepts clés:**
- Forme matricielle de la régression
- Calcul manuel de β̂, σ, SE(β̂)
- Tests d'hypothèse sur les coefficients
- Distributions t de Student
- Transformations de variables (√, log, etc.)

## Sélection de variables

### Méthodes

1. **Forward (ascendante):**
   - Commence avec aucune variable
   - Ajoute une variable à chaque étape
   - S'arrête quand aucune amélioration

2. **Backward (descendante):**
   - Commence avec toutes les variables
   - Enlève une variable à chaque étape
   - S'arrête quand aucune amélioration

3. **Stepwise (mixte):**
   - Combine forward et backward
   - Peut ajouter et enlever des variables

### Fonction step()

```r
step(reg, direction="backward")  # Backward
step(reg, direction="forward")   # Forward  
step(reg, direction="both")      # Stepwise
```

**Critère:** AIC (par défaut)

### Critères de comparaison

| Critère | Formule | Objectif |
|---------|---------|----------|
| AIC | -2log(L) + 2p | Minimiser |
| BIC | -2log(L) + p·log(n) | Minimiser |
| R² ajusté | 1 - (1-R²)(n-1)/(n-p-1) | Maximiser |

- L: vraisemblance
- p: nombre de paramètres
- n: nombre d'observations

## Visualisation 3D

```r
library(rgl)
library(car)

scatter3d(Y ~ X1 + X2, data=df,
          surface=TRUE,    # Afficher le plan de régression
          grid=TRUE,       # Grille
          ellipsoid=TRUE)  # Ellipsoïde de confiance
```

**Contrôles:**
- Souris pour faire tourner
- Molette pour zoomer
- Visualiser l'ajustement dans l'espace

## Multicolinéarité

### Problème
Lorsque deux variables explicatives sont très corrélées:
- Coefficients instables
- Erreurs standards élevées
- Tests non significatifs (alors que le modèle est bon)

### Détection
1. Matrice de corrélation: |r| > 0.8
2. VIF (Variance Inflation Factor):
```r
library(car)
vif(reg)  # VIF > 10 → problème
```

### Solutions
1. Enlever une des variables corrélées
2. Combiner les variables (ACP)
3. Régularisation (Ridge, Lasso)

## Commandes essentielles

```r
# Régression multiple
reg <- lm(Y ~ X1 + X2 + X3, data=df)
reg <- lm(Y ~ ., data=df)        # Toutes les colonnes sauf Y

# Sans intercept
reg <- lm(Y ~ -1 + X1 + X2)
reg <- lm(Y ~ 0 + X1 + X2)

# Interaction
reg <- lm(Y ~ X1 * X2)           # X1 + X2 + X1:X2
reg <- lm(Y ~ X1 + X2 + X1:X2)  # Équivalent

# Transformation
reg <- lm(Y ~ X + I(X^2))        # Polynomial
reg <- lm(log(Y) ~ X)            # Log
reg <- lm(Y ~ sqrt(X))           # Racine

# Sélection
step(reg, direction="backward")
step(reg, direction="forward", scope=~X1+X2+X3)

# Comparaison
extractAIC(reg1)
summary(reg)$adj.r.squared
AIC(reg1, reg2, reg3)

# Prédiction
predict(reg, newdata=df_new, interval="prediction")

# Matrice de corrélation
cor(df)
pairs(df)  # Scatter plot matrix

# Visualisation 3D
scatter3d(Y ~ X1 + X2, data=df)
```

## Interprétation des coefficients

### Régression simple
β₁: augmentation moyenne de Y quand X augmente de 1 unité

### Régression multiple
β₁: augmentation moyenne de Y quand X₁ augmente de 1 unité,  
**toutes les autres variables étant constantes**

### Attention
- Ne pas confondre significativité statistique et importance pratique
- Un coefficient peut être non significatif à cause de la multicolinéarité
- R² élevé ne garantit pas un bon modèle (vérifier les résidus !)

## Ressources

- `?lm` pour la documentation
- `?step` pour la sélection de variables
- `?cor` pour la corrélation
- Package `car`: outils diagnostiques avancés
- Package `rgl`: visualisation 3D interactive
