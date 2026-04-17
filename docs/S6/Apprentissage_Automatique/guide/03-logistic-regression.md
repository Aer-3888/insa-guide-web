---
title: "Chapitre 3 -- Regression logistique & Classification"
sidebar_position: 3
---

# Chapitre 3 -- Regression logistique & Classification

## 1. De la regression a la classification

La regression lineaire predit une valeur continue. Pour la classification, on a besoin d'une sortie entre 0 et 1 (probabilite d'appartenance a une classe). La **regression logistique** utilise la fonction sigmoide pour transformer la sortie lineaire en probabilite.

---

## 2. La fonction sigmoide

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

**Proprietes :**
- $\sigma(z) \in (0, 1)$ pour tout $z \in \mathbb{R}$
- $\sigma(0) = 0.5$
- $\sigma(z) \to 1$ quand $z \to +\infty$
- $\sigma(z) \to 0$ quand $z \to -\infty$
- $\sigma'(z) = \sigma(z)(1 - \sigma(z))$ (derivee elegante, utile pour le gradient)

### Modele de regression logistique

$$P(y = 1 | \mathbf{x}) = \sigma(\mathbf{w}^T \mathbf{x} + w_0) = \frac{1}{1 + e^{-(\mathbf{w}^T \mathbf{x} + w_0)}}$$

Le modele calcule la **log-cote** (log-odds) :

$$\log \frac{P(y=1|\mathbf{x})}{P(y=0|\mathbf{x})} = \mathbf{w}^T \mathbf{x} + w_0$$

---

## 3. Frontiere de decision

La frontiere de decision est l'ensemble des points ou $P(y=1|\mathbf{x}) = 0.5$, soit :

$$\mathbf{w}^T \mathbf{x} + w_0 = 0$$

C'est un **hyperplan** dans l'espace des features :
- En 2D : une droite.
- En 3D : un plan.
- En dimension $p$ : un hyperplan de dimension $p-1$.

### Seuil de decision

Par defaut, on predit la classe 1 si $P(y=1|\mathbf{x}) \geq 0.5$, mais ce seuil peut etre ajuste :
- Seuil bas (ex : 0.3) : plus de vrais positifs (meilleur rappel), mais plus de faux positifs.
- Seuil haut (ex : 0.7) : moins de faux positifs (meilleure precision), mais plus de faux negatifs.

---

## 4. Fonction de cout : entropie croisee binaire (log-loss)

On ne peut pas utiliser la MSE pour la regression logistique car la fonction de cout serait non-convexe. On utilise la **log-loss** (cross-entropy) :

$$J(\mathbf{w}) = -\frac{1}{n} \sum_{i=1}^{n} \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$

ou $\hat{y}_i = \sigma(\mathbf{w}^T \mathbf{x}_i)$.

**Intuition :**
- Si $y_i = 1$ et $\hat{y}_i \approx 1$ : $-\log(1) = 0$ (pas de penalite).
- Si $y_i = 1$ et $\hat{y}_i \approx 0$ : $-\log(0) \to +\infty$ (forte penalite).

### Gradient

$$\nabla J(\mathbf{w}) = \frac{1}{n} \mathbf{X}^T (\hat{\mathbf{y}} - \mathbf{y})$$

Meme forme que pour la regression lineaire, mais avec $\hat{y}_i = \sigma(\mathbf{w}^T \mathbf{x}_i)$.

---

## 5. Classification multiclasse

### Strategie One-vs-Rest (OvR)

Pour $K$ classes, entrainer $K$ classifieurs binaires. Le classifieur $k$ apprend a separer la classe $k$ de toutes les autres. Prediction : la classe avec la probabilite la plus elevee.

### Strategie One-vs-One (OvO)

Entrainer $\binom{K}{2} = K(K-1)/2$ classifieurs, un pour chaque paire de classes. Prediction : vote majoritaire.

### Softmax (Regression logistique multinomiale)

Generalisation directe de la sigmoide a $K$ classes :

$$P(y = k | \mathbf{x}) = \frac{e^{\mathbf{w}_k^T \mathbf{x}}}{\sum_{j=1}^{K} e^{\mathbf{w}_j^T \mathbf{x}}}$$

**Proprietes :**
- $\sum_{k=1}^{K} P(y=k|\mathbf{x}) = 1$
- $P(y=k|\mathbf{x}) > 0$ pour tout $k$
- Quand $K=2$, softmax se reduit a la sigmoide.

### Fonction de cout : entropie croisee categorielle

$$J = -\frac{1}{n} \sum_{i=1}^{n} \sum_{k=1}^{K} \mathbb{1}[y_i = k] \log P(y_i = k | \mathbf{x}_i)$$

---

## 6. Regularisation dans la regression logistique

Comme pour la regression lineaire, on peut ajouter une penalite L1 ou L2 :

$$J_{\text{reg}} = J + \alpha \cdot \text{penalite}$$

Dans scikit-learn, le parametre `C` est l'inverse de la force de regularisation : $C = 1/\alpha$.

- **Grand C** : peu de regularisation (modele complexe, risque d'overfitting).
- **Petit C** : forte regularisation (modele simple, risque d'underfitting).

---

## 7. Code Python complet

```python noexec
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# 1. Charger les donnees
data = load_breast_cancer()
X, y = data.data, data.target

# 2. Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)

# 3. Pipeline avec standardisation
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', LogisticRegression(max_iter=1000))
])

# 4. Grid search
param_grid = {
    'clf__C': [0.001, 0.01, 0.1, 1, 10, 100],
    'clf__penalty': ['l1', 'l2'],
    'clf__solver': ['liblinear']
}
grid = GridSearchCV(pipe, param_grid, cv=5, scoring='f1', n_jobs=-1)
grid.fit(X_train, y_train)

print(f"Meilleurs parametres : {grid.best_params_}")
print(f"Score CV : {grid.best_score_:.3f}")

# 5. Evaluation
y_pred = grid.predict(X_test)
print(classification_report(y_test, y_pred, target_names=data.target_names))

# 6. Probabilites
y_proba = grid.predict_proba(X_test)
print(f"Proba pour le premier exemple : {y_proba[0]}")
```

### Classification multiclasse (Iris)

```python noexec
from sklearn.datasets import load_iris

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.3, random_state=42
)

# multi_class='multinomial' utilise softmax
clf = LogisticRegression(
    multi_class='multinomial',
    solver='lbfgs',
    max_iter=1000,
    C=1.0
)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred, target_names=iris.target_names))

# Probabilites softmax
print(f"Probas : {clf.predict_proba(X_test[:3])}")
```

---

## 8. Comparaison avec le Naive Bayes

| Critere | Regression logistique | Naive Bayes |
|---------|----------------------|-------------|
| **Approche** | Discriminative (modele $P(y|x)$ directement) | Generative (modele $P(x|y)$ puis Bayes) |
| **Hypothese** | Frontiere de decision lineaire | Independence des features |
| **Nombre de parametres** | $p \times K$ | Moins si independence respectee |
| **Donnees textuelles** | Bon avec TF-IDF | Tres bon avec bag of words |
| **Regularisation** | L1, L2 integrees | Lissage de Laplace |
| **Interpretabilite** | Coefficients interpretables | Probabilites par classe |

---

## 9. Pieges classiques

- **Oublier de standardiser** : la regression logistique est sensible a l'echelle des features, surtout avec regularisation.
- **Ignorer le parametre C** : le C par defaut (1.0) n'est pas toujours optimal. Toujours tuner avec GridSearchCV.
- **Frontiere lineaire inadaptee** : si les classes ne sont pas separables lineairement, la regression logistique echouera. Envisager des features polynomiales ou un noyau SVM.
- **Confondre sigmoide et softmax** : la sigmoide est pour la classification binaire, le softmax pour le multiclasse.
- **Convergence** : augmenter `max_iter` si sklearn affiche un warning de convergence.

---

## CHEAT SHEET

```
SIGMOIDE
  sigma(z) = 1 / (1 + exp(-z))
  P(y=1|x) = sigma(w^T x + w0)
  Frontiere : w^T x + w0 = 0

COUT (LOG-LOSS)
  J = -(1/n) * sum[ yi*log(y_hat) + (1-yi)*log(1-y_hat) ]
  Gradient = (1/n) * X^T * (y_hat - y)

SOFTMAX (MULTICLASSE)
  P(y=k|x) = exp(wk^T x) / sum_j exp(wj^T x)

REGULARISATION
  C = 1/alpha  (sklearn)
  Grand C = peu de regularisation
  Petit C = forte regularisation

SKLEARN
  LogisticRegression(C=1.0, penalty='l2', solver='lbfgs', max_iter=1000)
  Multi-classe : multi_class='multinomial'
  Pipeline : StandardScaler() -> LogisticRegression()
```
