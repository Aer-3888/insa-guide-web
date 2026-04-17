---
title: "Chapitre 5 -- Support Vector Machines (SVM)"
sidebar_position: 5
---

# Chapitre 5 -- Support Vector Machines (SVM)

## 1. Principe fondamental

Un SVM cherche l'**hyperplan** qui separe les classes avec la **marge maximale**. La marge est la distance entre l'hyperplan et les exemples les plus proches de chaque classe (les **vecteurs de support**).

### Intuition geometrique

En 2D, il existe une infinite de droites separant deux classes lineairement separables. Le SVM choisit celle qui maximise la distance aux exemples les plus proches, ce qui donne la meilleure generalisation.

---

## 2. Formulation mathematique

### Hyperplan separateur

$$\mathbf{w}^T \mathbf{x} + b = 0$$

- $\mathbf{w}$ : vecteur normal a l'hyperplan (direction perpendiculaire).
- $b$ : biais (offset).
- La distance d'un point $\mathbf{x}_i$ a l'hyperplan est $\frac{|\mathbf{w}^T \mathbf{x}_i + b|}{||\mathbf{w}||}$.

### Marge

La marge est la distance entre les deux hyperplans paralleles $\mathbf{w}^T \mathbf{x} + b = +1$ et $\mathbf{w}^T \mathbf{x} + b = -1$ :

$$\text{marge} = \frac{2}{||\mathbf{w}||}$$

### Probleme d'optimisation

On veut maximiser la marge tout en classant correctement tous les exemples :

$$\min_{\mathbf{w}, b} \frac{1}{2} ||\mathbf{w}||^2 \quad \text{sous contrainte} \quad y_i (\mathbf{w}^T \mathbf{x}_i + b) \geq 1 \quad \forall i$$

**Vecteurs de support** : les exemples sur les hyperplans de marge ($y_i (\mathbf{w}^T \mathbf{x}_i + b) = 1$). Seuls ces exemples determinent l'hyperplan. Retirer les autres exemples ne change rien au modele.

---

## 3. SVM a marge souple (Soft Margin)

En pratique, les donnees ne sont souvent pas lineairement separables. On autorise des violations de la marge en introduisant des **variables de relachement** $\xi_i \geq 0$ :

$$\min_{\mathbf{w}, b, \xi} \frac{1}{2} ||\mathbf{w}||^2 + C \sum_{i=1}^{n} \xi_i$$

sous contrainte : $y_i (\mathbf{w}^T \mathbf{x}_i + b) \geq 1 - \xi_i$, $\xi_i \geq 0$

Le parametre **C** controle le compromis :
- **Grand C** : peu de violations tolerees => marge etroite, risque d'overfitting.
- **Petit C** : plus de violations tolerees => marge large, risque d'underfitting.

---

## 4. L'astuce du noyau (Kernel Trick)

### Le probleme

Quand les donnees ne sont pas lineairement separables, on peut les projeter dans un espace de dimension superieure ou elles le deviennent.

### Le trick

Au lieu de calculer explicitement la transformation $\phi(\mathbf{x})$, on utilise une **fonction noyau** $K(\mathbf{x}_i, \mathbf{x}_j) = \phi(\mathbf{x}_i)^T \phi(\mathbf{x}_j)$ qui calcule le produit scalaire dans l'espace de haute dimension sans jamais y aller explicitement.

### Noyaux courants

| Noyau | Formule | Utilisation |
|-------|---------|------------|
| **Lineaire** | $K(\mathbf{x}, \mathbf{y}) = \mathbf{x}^T \mathbf{y}$ | Donnees lineairement separables |
| **Polynomial** | $K(\mathbf{x}, \mathbf{y}) = (\gamma \mathbf{x}^T \mathbf{y} + r)^d$ | Relations polynomiales |
| **RBF (Gaussien)** | $K(\mathbf{x}, \mathbf{y}) = \exp(-\gamma ||\mathbf{x} - \mathbf{y}||^2)$ | Le plus utilise, tres flexible |
| **Sigmoid** | $K(\mathbf{x}, \mathbf{y}) = \tanh(\gamma \mathbf{x}^T \mathbf{y} + r)$ | Similaire a un reseau de neurones |

### Parametres du noyau RBF

- $\gamma$ (gamma) : controle la "portee" de chaque vecteur de support.
  - **Grand gamma** : chaque vecteur de support n'influence que son voisinage immediat => frontiere complexe, overfitting.
  - **Petit gamma** : chaque vecteur de support influence une grande zone => frontiere lisse, underfitting.

---

## 5. SVM pour la classification

### Binaire

```python noexec
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(kernel='rbf'))
])

param_grid = {
    'svm__C': [0.1, 1, 10, 100],
    'svm__gamma': ['scale', 'auto', 0.01, 0.1, 1]
}

grid = GridSearchCV(pipe, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid.fit(X_train, y_train)

print(f"Meilleurs params : {grid.best_params_}")
print(f"Score test : {grid.score(X_test, y_test):.3f}")
```

### Multiclasse

Scikit-learn gere automatiquement le multiclasse par **One-vs-One** (par defaut pour SVC) :
- $K$ classes => $K(K-1)/2$ classifieurs binaires.
- Prediction par vote majoritaire.

```python noexec
from sklearn.svm import SVC

clf = SVC(kernel='rbf', C=10, gamma='scale', decision_function_shape='ovr')
clf.fit(X_train, y_train)
```

---

## 6. SVM lineaire pour les gros datasets

Pour les gros datasets, `SVC` est lent ($O(n^2)$ a $O(n^3)$). Utiliser `LinearSVC` qui est beaucoup plus rapide :

```python noexec
from sklearn.svm import LinearSVC

clf = LinearSVC(C=1.0, max_iter=10000)
clf.fit(X_train, y_train)
```

---

## 7. Avantages et inconvenients

| Avantages | Inconvenients |
|-----------|--------------|
| Efficace en haute dimension | Lent sur gros datasets ($O(n^2)$ a $O(n^3)$) |
| Robuste a l'overfitting (max marge) | Choix du noyau et hyperparametres delicat |
| Fonctionne meme si $p > n$ | Pas de probabilites directes (utiliser `probability=True` pour calibration) |
| Kernel trick tres puissant | Difficile a interpreter (boite noire avec noyaux non lineaires) |
| Seulement les vecteurs de support comptent | Sensible a l'echelle des features |

---

## 8. Exemple complet

```python noexec
import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# 1. Charger
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.3, random_state=42, stratify=data.target
)

# 2. Pipeline
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('svm', SVC(kernel='rbf'))
])

# 3. GridSearch
param_grid = {
    'svm__C': [0.1, 1, 10, 100],
    'svm__gamma': ['scale', 0.001, 0.01, 0.1]
}
grid = GridSearchCV(pipe, param_grid, cv=5, scoring='f1', n_jobs=-1)
grid.fit(X_train, y_train)

# 4. Evaluation
y_pred = grid.predict(X_test)
print(f"Meilleurs params : {grid.best_params_}")
print(classification_report(y_test, y_pred, target_names=data.target_names))
```

---

## 9. Pieges classiques

- **Oublier de standardiser** : le SVM est tres sensible a l'echelle des features. Toujours standardiser.
- **Utiliser SVC sur un gros dataset** : utiliser `LinearSVC` ou `SGDClassifier(loss='hinge')` pour les datasets de plus de ~10k exemples.
- **Ignorer le tuning de C et gamma** : les valeurs par defaut ne sont presque jamais optimales. Grid search obligatoire.
- **Confondre marge dure et souple** : en pratique, on utilise toujours la marge souple (parametre C).
- **Kernel RBF partout** : parfois un noyau lineaire suffit (donnees deja separables), et il est beaucoup plus rapide.

---

## CHEAT SHEET

```
HYPERPLAN
  w^T x + b = 0
  Marge = 2 / ||w||
  Objectif : min (1/2)||w||^2 s.c. yi(w^T xi + b) >= 1

MARGE SOUPLE
  min (1/2)||w||^2 + C * sum(xi_i)
  Grand C = marge etroite (moins de violations)
  Petit C = marge large (plus de violations)

NOYAUX
  Lineaire : K(x,y) = x^T y
  RBF      : K(x,y) = exp(-gamma * ||x-y||^2)
  Poly     : K(x,y) = (gamma * x^T y + r)^d

HYPERPARAMETRES
  C     : compromis marge/violations
  gamma : portee des vecteurs de support (RBF)
  Grand gamma = frontiere complexe = overfitting
  Petit gamma = frontiere lisse = underfitting

SKLEARN
  SVC(kernel='rbf', C=10, gamma='scale')    # petit dataset
  LinearSVC(C=1.0)                           # gros dataset
  Pipeline : StandardScaler() -> SVC()
  Toujours standardiser !
```
