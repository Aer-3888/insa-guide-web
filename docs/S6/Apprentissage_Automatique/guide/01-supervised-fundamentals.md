---
title: "Chapitre 1 -- Fondamentaux de l'apprentissage supervise"
sidebar_position: 1
---

# Chapitre 1 -- Fondamentaux de l'apprentissage supervise

## 1. Qu'est-ce que l'apprentissage supervise ?

L'apprentissage supervise consiste a apprendre une fonction $f$ a partir de paires $(x_i, y_i)$ ou $x_i$ est un vecteur de features et $y_i$ est le label associe. L'objectif est que $f$ generalise correctement sur des donnees jamais vues.

**Deux taches principales :**

| Tache | Variable cible | Exemple |
|-------|---------------|---------|
| **Classification** | Categorie discrete | Spam / non-spam |
| **Regression** | Valeur continue | Prix d'une maison |

---

## 2. Le compromis biais-variance

C'est **le** concept central du ML. L'erreur de generalisation se decompose en trois termes :

$$\text{Erreur totale} = \text{Biais}^2 + \text{Variance} + \text{Bruit irreductible}$$

### Definitions

- **Biais** : erreur systematique du modele. Un modele a fort biais fait des hypotheses trop simplistes et rate les regularites dans les donnees (sous-apprentissage / underfitting).
- **Variance** : sensibilite du modele aux fluctuations du jeu d'entrainement. Un modele a forte variance memorise le bruit (sur-apprentissage / overfitting).
- **Bruit irreductible** : erreur intrinseque aux donnees, impossible a eliminer.

### Diagnostic

| Situation | Erreur train | Erreur test | Diagnostic |
|-----------|-------------|-------------|-----------|
| Biais fort | Elevee | Elevee | Sous-apprentissage |
| Variance forte | Faible | Elevee | Sur-apprentissage |
| Equilibre | Moderee | Moderee (proche du train) | Bon compromis |

### Comment lutter ?

**Contre le sous-apprentissage (biais) :**
- Utiliser un modele plus complexe
- Ajouter des features
- Reduire la regularisation

**Contre le sur-apprentissage (variance) :**
- Plus de donnees d'entrainement
- Regularisation (L1, L2)
- Elagage (arbres), early stopping (reseaux)
- Validation croisee pour detecter
- Methodes d'ensemble (bagging)

---

## 3. Separation train / test

**Regle d'or :** ne JAMAIS evaluer un modele sur les donnees d'entrainement.

### Split simple

```python noexec
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.3,       # 30% pour le test
    random_state=42,      # reproductibilite
    stratify=y            # meme distribution de classes dans train et test
)
```

### Repartitions courantes

| Split | Train | Validation | Test | Usage |
|-------|-------|-----------|------|-------|
| Simple | 70% | - | 30% | Prototypage rapide |
| Avec validation | 60% | 20% | 20% | Tuning d'hyperparametres |
| K-Fold | K-1 folds | 1 fold (rotation) | Separe | Evaluation robuste |

---

## 4. Validation croisee (K-Fold Cross-Validation)

La validation croisee K-Fold est la methode standard pour estimer la performance de maniere fiable :

1. Decouper les donnees en $K$ paquets (folds) de taille egale.
2. Pour chaque fold $k$ :
   - Entrainer sur les $K-1$ autres folds.
   - Evaluer sur le fold $k$.
3. Calculer la moyenne et l'ecart-type des $K$ scores.

$$\text{Score CV} = \frac{1}{K} \sum_{k=1}^{K} \text{Score}_k$$

### Choix de K

| K | Avantage | Inconvenient |
|---|----------|-------------|
| 5 | Rapide, bonne estimation | Variance du score plus elevee |
| 10 | Standard, bon compromis | Raisonnable en temps |
| N (LOOCV) | Biais minimal | Tres couteux en temps, haute variance |

### Code Python

```python noexec
from sklearn.model_selection import cross_val_score

scores = cross_val_score(clf, X, y, cv=10, scoring='accuracy')
print(f"Accuracy moyenne : {scores.mean():.3f} (+/- {scores.std():.3f})")
```

### Variantes

```python noexec
from sklearn.model_selection import StratifiedKFold, RepeatedStratifiedKFold

# Stratifie : meme distribution de classes dans chaque fold
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Repete : multiple runs pour reduire la variance de l'estimation
rskf = RepeatedStratifiedKFold(n_splits=5, n_repeats=10, random_state=42)
```

---

## 5. Overfitting : le detecter et le prevenir

### Signes d'overfitting

```
Score train:  98%    |    Gap important entre train et test
Score test:   65%    |    => Overfitting
```

### Courbes d'apprentissage

```python noexec
from sklearn.model_selection import learning_curve
import matplotlib.pyplot as plt
import numpy as np

train_sizes, train_scores, val_scores = learning_curve(
    clf, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    scoring='accuracy'
)

plt.plot(train_sizes, train_scores.mean(axis=1), label='Train')
plt.plot(train_sizes, val_scores.mean(axis=1), label='Validation')
plt.xlabel('Nombre d\'exemples d\'entrainement')
plt.ylabel('Score')
plt.legend()
plt.title('Courbe d\'apprentissage')
plt.show()
```

**Interpretation :**
- Si les deux courbes convergent vers un score bas : biais fort (augmenter complexite).
- Si grand ecart entre les courbes : variance forte (plus de donnees ou regularisation).
- Si les deux courbes convergent vers un score haut : bon modele.

---

## 6. Hyperparametres et selection de modele

### Parametres vs hyperparametres

| Parametres (appris) | Hyperparametres (fixes avant entrainement) |
|---------------------|-------------------------------------------|
| Poids d'un reseau de neurones | Taux d'apprentissage, nombre de couches |
| Seuils d'un arbre | Profondeur max, min samples par feuille |
| Coefficients de regression | Alpha de regularisation |

### GridSearchCV

```python noexec
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_neighbors': [1, 3, 5, 11, 17],
    'weights': ['uniform', 'distance'],
    'metric': ['euclidean', 'manhattan']
}

grid = GridSearchCV(
    estimator=KNeighborsClassifier(),
    param_grid=param_grid,
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1,
    verbose=1
)
grid.fit(X_train, y_train)

print(f"Meilleurs parametres : {grid.best_params_}")
print(f"Meilleur score CV : {grid.best_score_:.3f}")
print(f"Score test : {grid.score(X_test, y_test):.3f}")
```

---

## 7. Representation des donnees

### Types de features

| Type | Exemples | Encodage |
|------|----------|----------|
| **Numerique continu** | Temperature, age | Standardisation (z-score) |
| **Categoriel nominal** | Couleur, pays | One-hot encoding |
| **Categoriel ordinal** | Niveau d'etude | Ordinal encoding |
| **Texte** | Critiques de jeux | Bag of Words, TF-IDF |
| **Binaire** | Oui/Non | 0/1 |

### Standardisation

$$z = \frac{x - \mu}{\sigma}$$

```python noexec
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # ATTENTION: transform seulement, pas fit_transform
```

### Vectorisation de texte

```python noexec
# Sac de mots booleens
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer(lowercase=True, binary=True, max_df=0.8, min_df=10)
X_train = vec.fit_transform(textes_train)
X_test = vec.transform(textes_test)

# TF-IDF (meilleur pour la plupart des cas)
from sklearn.feature_extraction.text import TfidfVectorizer
vec = TfidfVectorizer(lowercase=True, ngram_range=(1,1), max_df=0.7, min_df=5)
X_train = vec.fit_transform(textes_train)
X_test = vec.transform(textes_test)
```

---

## 8. Pieges classiques

- **Evaluer sur le train** : donne une estimation trop optimiste. Toujours utiliser un jeu de test separe.
- **Fuite de donnees (data leakage)** : appliquer `fit_transform` sur tout le dataset au lieu de `fit` sur le train puis `transform` sur le test.
- **Ignorer le desequilibre de classes** : un modele qui predit toujours la classe majoritaire peut avoir une accuracy elevee mais etre inutile.
- **Oublier de melanger les donnees** : si les donnees sont triees par classe, un split sequentiel sera biaise.
- **Confondre correlation et causalite** : le ML detecte des correlations, pas des liens de cause a effet.

---

## CHEAT SHEET

```
BIAIS-VARIANCE
  Biais fort  = modele trop simple = underfitting = mauvais train ET test
  Variance forte = modele trop complexe = overfitting = bon train, mauvais test
  Remede biais : modele plus complexe, plus de features
  Remede variance : plus de donnees, regularisation, elagage

SEPARATION DES DONNEES
  train_test_split(X, y, test_size=0.3, stratify=y)
  cross_val_score(clf, X, y, cv=10)
  GridSearchCV(clf, param_grid, cv=5, scoring='f1_weighted')

PIPELINE STANDARD
  1. Charger les donnees
  2. Explorer / nettoyer
  3. Encoder les features (scaler, one-hot, TF-IDF)
  4. Separer train/test
  5. Entrainer le modele
  6. Evaluer (metriques, matrice de confusion)
  7. Tuner les hyperparametres (GridSearchCV)
  8. Evaluer le modele final sur le test

ATTENTION
  - Jamais fit_transform sur le test (seulement transform)
  - Stratifier le split si classes desequilibrees
  - Regarder precision/rappel/F1, pas seulement accuracy
```
