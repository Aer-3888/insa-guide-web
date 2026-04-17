---
title: "Chapitre 2 -- Regression lineaire"
sidebar_position: 2
---

# Chapitre 2 -- Regression lineaire

## 1. Principe fondamental

La regression lineaire modelise la relation entre une variable cible $y$ et un vecteur de features $\mathbf{x} = (x_1, x_2, \ldots, x_p)$ par une fonction lineaire :

$$\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + \cdots + w_p x_p = \mathbf{w}^T \mathbf{x} + w_0$$

Ou de maniere matricielle, en ajoutant une colonne de 1 pour le biais :

$$\hat{\mathbf{y}} = \mathbf{X} \mathbf{w}$$

- $\mathbf{w} = (w_0, w_1, \ldots, w_p)^T$ : vecteur de poids (coefficients)
- $\mathbf{X}$ : matrice de features de taille $n \times (p+1)$

---

## 2. Regression lineaire simple ($p = 1$)

Une seule feature $x$ :

$$\hat{y} = w_0 + w_1 x$$

- $w_0$ : ordonnee a l'origine (intercept)
- $w_1$ : pente (slope)

### Interpretation

- Si $w_1 > 0$ : relation positive (quand $x$ augmente, $y$ augmente).
- Si $w_1 < 0$ : relation negative.
- $|w_1|$ : amplitude de l'effet de $x$ sur $y$.

### Exemple du cours : distance de freinage

Le cours utilise le dataset des distances de freinage de voitures en fonction de la vitesse :

$$\text{distance} = w_0 + w_1 \times \text{vitesse}$$

---

## 3. Methode des moindres carres (Ordinary Least Squares)

### Fonction de cout

On cherche les poids $\mathbf{w}$ qui minimisent la somme des carres des residus :

$$J(\mathbf{w}) = \frac{1}{2n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2 = \frac{1}{2n} ||\mathbf{y} - \mathbf{X}\mathbf{w}||^2$$

Cette fonction est aussi appelee **MSE** (Mean Squared Error) a un facteur pres.

### Solution analytique (equation normale)

En derivant $J$ par rapport a $\mathbf{w}$ et en egalant a zero :

$$\mathbf{w}^* = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{y}$$

**Conditions :**
- $\mathbf{X}^T \mathbf{X}$ doit etre inversible (pas de multicolinearite parfaite).
- Cout en $O(p^3)$ pour l'inversion : problematique si $p$ est grand.

### Code Python

```python
from sklearn.linear_model import LinearRegression
import numpy as np

# Donnees
X = np.array([[1], [2], [3], [4], [5]])  # vitesse
y = np.array([2, 4, 5, 4, 5])            # distance de freinage

# Entrainement
reg = LinearRegression()
reg.fit(X, y)

print(f"Intercept (w0) : {reg.intercept_:.3f}")
print(f"Coefficient (w1) : {reg.coef_[0]:.3f}")
print(f"R^2 score : {reg.score(X, y):.3f}")

# Prediction
X_new = np.array([[6]])
y_pred = reg.predict(X_new)
print(f"Prediction pour x=6 : {y_pred[0]:.3f}")
```

---

## 4. Descente de gradient

Quand la solution analytique est trop couteuse (grand $p$ ou grand $n$), on utilise la descente de gradient.

### Principe

On met a jour iterativement les poids dans la direction opposee au gradient de la fonction de cout :

$$\mathbf{w}_{t+1} = \mathbf{w}_t - \eta \nabla J(\mathbf{w}_t)$$

ou $\eta$ est le **taux d'apprentissage** (learning rate).

### Gradient de la MSE

$$\nabla J(\mathbf{w}) = -\frac{1}{n} \mathbf{X}^T (\mathbf{y} - \mathbf{X}\mathbf{w})$$

### Variantes

| Variante | Donnees utilisees par iteration | Vitesse | Stabilite |
|----------|--------------------------------|---------|-----------|
| **Batch GD** | Tout le dataset | Lent | Stable |
| **Stochastic GD (SGD)** | 1 seul exemple | Rapide | Bruyant |
| **Mini-batch GD** | Un sous-ensemble (32, 64, 128) | Compromis | Compromis |

### Code : descente de gradient manuelle

```python
import numpy as np

def gradient_descent(X, y, lr=0.01, n_iter=1000):
    n, p = X.shape
    w = np.zeros(p)
    
    for _ in range(n_iter):
        y_pred = X @ w
        gradient = -(1/n) * X.T @ (y - y_pred)
        w = w - lr * gradient
    
    return w

# Avec sklearn
from sklearn.linear_model import SGDRegressor

sgd = SGDRegressor(max_iter=1000, tol=1e-3, eta0=0.01, learning_rate='invscaling')
sgd.fit(X_train, y_train)
```

### Choix du taux d'apprentissage

- **Trop grand** : la descente diverge (le cout oscille ou explose).
- **Trop petit** : convergence tres lente.
- **Astuce** : commencer avec $\eta = 0.01$ et ajuster, ou utiliser un schedule adaptatif (Adam, RMSprop).

---

## 5. Regression multiple ($p > 1$)

$$\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + \cdots + w_p x_p$$

### Importance de la standardisation

Quand les features ont des echelles differentes (ex : age en annees vs salaire en euros), il est essentiel de standardiser avant la regression pour :
- Permettre au gradient de converger uniformement.
- Rendre les coefficients comparables.

```python
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('regressor', LinearRegression())
])
pipe.fit(X_train, y_train)
```

### Coefficient de determination $R^2$

$$R^2 = 1 - \frac{\sum_{i=1}^{n} (y_i - \hat{y}_i)^2}{\sum_{i=1}^{n} (y_i - \bar{y})^2}$$

- $R^2 = 1$ : le modele explique toute la variance.
- $R^2 = 0$ : le modele ne fait pas mieux que la moyenne.
- $R^2 < 0$ : le modele fait pire que la moyenne (possible sur le test).

---

## 6. Regularisation

La regularisation ajoute un terme de penalite a la fonction de cout pour limiter la complexite du modele et combattre l'overfitting.

### Ridge (L2)

$$J_{\text{Ridge}}(\mathbf{w}) = \frac{1}{2n} ||\mathbf{y} - \mathbf{X}\mathbf{w}||^2 + \alpha ||\mathbf{w}||_2^2$$

- Penalise les grands coefficients mais ne les met **pas** a zero.
- Solution analytique : $\mathbf{w}^* = (\mathbf{X}^T\mathbf{X} + \alpha \mathbf{I})^{-1} \mathbf{X}^T \mathbf{y}$
- Toujours inversible (meme si $\mathbf{X}^T\mathbf{X}$ ne l'est pas).

```python
from sklearn.linear_model import Ridge

ridge = Ridge(alpha=1.0)
ridge.fit(X_train, y_train)
print(f"R^2 test : {ridge.score(X_test, y_test):.3f}")
```

### Lasso (L1)

$$J_{\text{Lasso}}(\mathbf{w}) = \frac{1}{2n} ||\mathbf{y} - \mathbf{X}\mathbf{w}||^2 + \alpha ||\mathbf{w}||_1$$

- Peut mettre certains coefficients **exactement a zero** : selection automatique de features.
- Utile quand beaucoup de features sont irrelevantes.
- Pas de solution analytique (resolution par algorithme iteratif).

```python
from sklearn.linear_model import Lasso

lasso = Lasso(alpha=0.1)
lasso.fit(X_train, y_train)
print(f"Coefficients non nuls : {np.sum(lasso.coef_ != 0)}/{len(lasso.coef_)}")
```

### ElasticNet (L1 + L2)

$$J_{\text{ElasticNet}}(\mathbf{w}) = \frac{1}{2n} ||\mathbf{y} - \mathbf{X}\mathbf{w}||^2 + \alpha \left( \rho ||\mathbf{w}||_1 + \frac{1-\rho}{2} ||\mathbf{w}||_2^2 \right)$$

Combine les avantages de Ridge (stabilite) et Lasso (selection de features).

### Comparaison

| Methode | Penalite | Met des coefs a 0 ? | Selection de features | Quand l'utiliser |
|---------|---------|---------------------|----------------------|-----------------|
| **OLS** | Aucune | Non | Non | Peu de features, pas d'overfitting |
| **Ridge** | $L_2$ | Non | Non | Multicolinearite, regularisation douce |
| **Lasso** | $L_1$ | Oui | Oui | Beaucoup de features, sparsity souhaitee |
| **ElasticNet** | $L_1 + L_2$ | Oui | Oui | Features correlees + selection |

### Tuning de alpha

```python
from sklearn.linear_model import RidgeCV, LassoCV

# Ridge avec validation croisee automatique
ridge_cv = RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0, 100.0], cv=5)
ridge_cv.fit(X_train, y_train)
print(f"Meilleur alpha : {ridge_cv.alpha_}")

# Lasso avec validation croisee
lasso_cv = LassoCV(cv=5, random_state=42)
lasso_cv.fit(X_train, y_train)
print(f"Meilleur alpha : {lasso_cv.alpha_:.4f}")
```

---

## 7. Metriques de regression

| Metrique | Formule | Interpretation |
|----------|---------|---------------|
| **MSE** | $\frac{1}{n}\sum(y_i - \hat{y}_i)^2$ | Erreur quadratique moyenne |
| **RMSE** | $\sqrt{\text{MSE}}$ | Meme unite que $y$ |
| **MAE** | $\frac{1}{n}\sum|y_i - \hat{y}_i|$ | Moins sensible aux outliers |
| **$R^2$** | $1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}$ | Proportion de variance expliquee |

```python
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, root_mean_squared_error

y_pred = model.predict(X_test)
print(f"MSE  : {mean_squared_error(y_test, y_pred):.3f}")
print(f"RMSE : {root_mean_squared_error(y_test, y_pred):.3f}")
print(f"MAE  : {mean_absolute_error(y_test, y_pred):.3f}")
print(f"R^2  : {r2_score(y_test, y_pred):.3f}")
```

---

## 8. Exemple complet : regression lineaire sur les distances de freinage

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import PolynomialFeatures
import matplotlib.pyplot as plt

# Charger les donnees
df = pd.read_csv('Speed_and_Stopping_Distances_of_Cars_357_90.csv')
X = df[['speed']].values
y = df['dist'].values

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Regression lineaire simple
lr = LinearRegression()
lr.fit(X_train, y_train)
y_pred_lr = lr.predict(X_test)
print(f"Lineaire - R^2: {r2_score(y_test, y_pred_lr):.3f}")

# Regression polynomiale (degre 2)
poly = PolynomialFeatures(degree=2, include_bias=False)
X_train_poly = poly.fit_transform(X_train)
X_test_poly = poly.transform(X_test)

lr_poly = LinearRegression()
lr_poly.fit(X_train_poly, y_train)
y_pred_poly = lr_poly.predict(X_test_poly)
print(f"Polynomiale (deg=2) - R^2: {r2_score(y_test, y_pred_poly):.3f}")

# Ridge avec regularisation
ridge = Ridge(alpha=1.0)
ridge.fit(X_train_poly, y_train)
y_pred_ridge = ridge.predict(X_test_poly)
print(f"Ridge - R^2: {r2_score(y_test, y_pred_ridge):.3f}")
```

---

## 9. Pieges classiques

- **Oublier de standardiser** : la descente de gradient converge mal si les features ont des echelles differentes.
- **Ignorer la multicolinearite** : si deux features sont tres correlees, les coefficients OLS deviennent instables. Ridge corrige ce probleme.
- **Utiliser OLS avec beaucoup de features** : risque d'overfitting. Toujours envisager la regularisation.
- **Confondre $R^2$ eleve avec un bon modele** : $R^2$ augmente mecaniquement avec le nombre de features, meme si elles sont inutiles. Utiliser le $R^2$ ajuste ou la validation croisee.
- **Extrapoler** : un modele lineaire n'est fiable que dans la plage des donnees d'entrainement.

---

## CHEAT SHEET

```
REGRESSION LINEAIRE
  y_hat = w0 + w1*x1 + ... + wp*xp
  OLS solution : w* = (X^T X)^{-1} X^T y
  Cout : MSE = (1/n) * sum((yi - y_hat_i)^2)

DESCENTE DE GRADIENT
  w = w - eta * gradient
  gradient = -(1/n) * X^T (y - Xw)
  Learning rate eta : 0.001 a 0.1 typiquement

REGULARISATION
  Ridge (L2) : MSE + alpha * ||w||^2   => coefficients petits
  Lasso (L1) : MSE + alpha * ||w||_1   => coefficients a zero (selection)
  ElasticNet  : MSE + alpha * (rho*L1 + (1-rho)*L2)

SKLEARN
  LinearRegression()        # OLS
  Ridge(alpha=1.0)          # L2
  Lasso(alpha=0.1)          # L1
  RidgeCV(alphas=..., cv=5) # tuning automatique
  PolynomialFeatures(degree=2) # regression polynomiale

METRIQUES
  R^2 = 1 - SS_res / SS_tot
  MSE, RMSE, MAE
```
