---
title: "Chapitre 9 -- Scikit-learn & Python ML"
sidebar_position: 9
---

# Chapitre 9 -- Scikit-learn & Python ML

## 1. Architecture de scikit-learn

Tous les estimateurs suivent la meme API :

```python noexec
estimator.fit(X_train, y_train)       # entrainer
estimator.predict(X_test)              # predire
estimator.score(X_test, y_test)        # evaluer
estimator.get_params()                 # voir les hyperparametres
```

### Types d'estimateurs

| Type | Methodes | Exemples |
|------|----------|---------|
| **Classifieur** | fit, predict, predict_proba, score | KNeighborsClassifier, DecisionTreeClassifier |
| **Regresseur** | fit, predict, score | LinearRegression, Ridge |
| **Transformer** | fit, transform, fit_transform | StandardScaler, PCA |
| **Pipeline** | fit, predict, score | Pipeline([...]) |

---

## 2. Preprocessing

### StandardScaler (z-score)

$$z = \frac{x - \mu}{\sigma}$$

```python noexec
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # fit + transform sur le train
X_test_scaled = scaler.transform(X_test)          # SEULEMENT transform sur le test
```

### MinMaxScaler (normalisation [0, 1])

$$x_{\text{norm}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$

```python noexec
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
```

### Encodage des variables categorielles

```python noexec
# One-Hot Encoding (pour features nominales non ordonnees)
from sklearn.preprocessing import OneHotEncoder
enc = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_encoded = enc.fit_transform(X_categorical)

# Ordinal Encoding (pour features ordonnees)
from sklearn.preprocessing import OrdinalEncoder
enc = OrdinalEncoder()
X_encoded = enc.fit_transform(X_categorical)

# Label Encoding (pour la variable cible)
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y_encoded = le.fit_transform(y)
```

### Vectorisation de texte

```python noexec
# Bag of Words
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer(
    lowercase=True,
    analyzer='word',
    ngram_range=(1, 1),   # unigrammes
    binary=True,           # 1/0 presence
    max_df=0.8,            # ignorer mots dans > 80% des docs
    min_df=10              # ignorer mots dans < 10 docs
)
X_train = vec.fit_transform(textes_train)
X_test = vec.transform(textes_test)

# TF-IDF (souvent meilleur)
from sklearn.feature_extraction.text import TfidfVectorizer
vec = TfidfVectorizer(
    lowercase=True,
    ngram_range=(1, 1),
    max_df=0.7,
    min_df=5
)
```

---

## 3. Pipelines

Les pipelines chainent preprocessing et modele en un seul objet coherent, evitant les fuites de donnees :

```python noexec
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=0.95)),
    ('clf', KNeighborsClassifier(n_neighbors=5))
])

# Tout en une fois : fit, predict, score
pipe.fit(X_train, y_train)
print(f"Score : {pipe.score(X_test, y_test):.3f}")
```

### ColumnTransformer (features mixtes)

```python noexec
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# Colonnes numeriques vs categorielles
numeric_features = ['age', 'salary']
categorical_features = ['gender', 'city']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ]
)

pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('clf', LogisticRegression())
])
```

---

## 4. Selection de modele

### GridSearchCV

Teste toutes les combinaisons d'hyperparametres :

```python noexec
from sklearn.model_selection import GridSearchCV

param_grid = {
    'clf__n_neighbors': [1, 3, 5, 11, 17],
    'clf__weights': ['uniform', 'distance']
}

grid = GridSearchCV(
    pipe,
    param_grid,
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1,
    verbose=1,
    return_train_score=True
)
grid.fit(X_train, y_train)

# Resultats
print(f"Meilleurs params : {grid.best_params_}")
print(f"Meilleur score CV : {grid.best_score_:.3f}")
print(f"Score test : {grid.score(X_test, y_test):.3f}")

# Tableau complet des resultats
import pandas as pd
results = pd.DataFrame(grid.cv_results_)
print(results[['params', 'mean_test_score', 'std_test_score', 'rank_test_score']])
```

### RandomizedSearchCV (plus rapide)

Pour un grand espace d'hyperparametres, tester un nombre fixe de combinaisons aleatoires :

```python noexec
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import uniform, randint

param_dist = {
    'clf__n_estimators': randint(50, 500),
    'clf__max_depth': randint(3, 20),
    'clf__min_samples_leaf': randint(1, 20)
}

random_search = RandomizedSearchCV(
    pipe,
    param_dist,
    n_iter=50,           # 50 combinaisons aleatoires
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1,
    random_state=42
)
random_search.fit(X_train, y_train)
```

### Scoring metrics disponibles

| Nom sklearn | Metrique |
|------------|---------|
| `'accuracy'` | Accuracy |
| `'f1'` | F1 binaire |
| `'f1_weighted'` | F1 pondere |
| `'f1_macro'` | F1 macro |
| `'precision'` | Precision |
| `'recall'` | Rappel |
| `'roc_auc'` | AUC-ROC |

---

## 5. Comparaison de modeles

### Pipeline complet avec plusieurs modeles

```python noexec
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import MultinomialNB, GaussianNB
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

models = {
    'KNN (K=5)': KNeighborsClassifier(n_neighbors=5),
    'Decision Tree': DecisionTreeClassifier(max_depth=10),
    'Naive Bayes': GaussianNB(),
    'Random Forest': RandomForestClassifier(n_estimators=100),
    'AdaBoost': AdaBoostClassifier(n_estimators=50),
    'SVM (RBF)': SVC(kernel='rbf', C=1.0),
    'Logistic Regression': LogisticRegression(max_iter=1000),
}

for name, model in models.items():
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    print(f"{name:25s} : F1 = {scores.mean():.3f} (+/- {scores.std():.3f})")
```

---

## 6. Recettes par type de donnees

### Donnees numeriques (ex : heart.csv, iris)

```python noexec
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', RandomForestClassifier(n_estimators=100))
])
```

### Donnees textuelles (ex : jv.data, imdb)

```python noexec
pipe = Pipeline([
    ('vec', TfidfVectorizer(max_df=0.7, min_df=5)),
    ('clf', MultinomialNB())
])
```

### Donnees categorielles (ex : weather.nominal.csv)

```python noexec
from sklearn.naive_bayes import CategoricalNB

pipe = Pipeline([
    ('enc', OrdinalEncoder()),
    ('clf', CategoricalNB())
])
```

### Donnees mixtes (ex : no_show.csv)

```python noexec
preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numeric_cols),
    ('cat', OrdinalEncoder(), categorical_cols)
])
pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('clf', RandomForestClassifier(n_estimators=100))
])
```

---

## 7. Sauvegarde et chargement de modeles

```python noexec
import joblib

# Sauvegarder
joblib.dump(pipe, 'model.joblib')

# Charger
loaded_pipe = joblib.load('model.joblib')
y_pred = loaded_pipe.predict(X_test)
```

---

## 8. Pieges classiques

- **fit_transform sur le test** : c'est une fuite de donnees. Le test ne doit jamais influencer le preprocessing. Utiliser un Pipeline pour eviter cette erreur.
- **GridSearchCV sur tout le dataset** : il faut garder un jeu de test completement separe. GridSearchCV ne fait la validation croisee que sur le train.
- **Oublier n_jobs=-1** : ralentit inutilement le grid search.
- **Comparer des modeles sur des splits differents** : utiliser le meme random_state ou cross_val_score pour des comparaisons equitables.
- **Ignorer les warnings de convergence** : augmenter max_iter ou ajuster le learning rate.

---

## CHEAT SHEET

```
API SKLEARN
  fit(X_train, y_train)  -> entrainer
  predict(X_test)         -> predire
  score(X_test, y_test)   -> evaluer
  transform(X)            -> transformer (preprocessing)

PREPROCESSING
  StandardScaler()        -> z-score
  MinMaxScaler()          -> [0, 1]
  OneHotEncoder()         -> variables categorielles
  OrdinalEncoder()        -> variables ordinales
  CountVectorizer()       -> bag of words
  TfidfVectorizer()       -> TF-IDF

PIPELINE
  Pipeline([('scaler', StandardScaler()), ('clf', SVC())])
  ColumnTransformer([('num', scaler, num_cols), ('cat', encoder, cat_cols)])

SELECTION DE MODELE
  GridSearchCV(pipe, param_grid, cv=5, scoring='f1_weighted', n_jobs=-1)
  RandomizedSearchCV(pipe, param_dist, n_iter=50, cv=5)
  cross_val_score(clf, X, y, cv=10, scoring='accuracy')

MODELES PRINCIPAUX
  KNeighborsClassifier(n_neighbors=5)
  DecisionTreeClassifier(criterion='entropy', max_depth=10)
  MultinomialNB() / GaussianNB() / CategoricalNB()
  RandomForestClassifier(n_estimators=100, max_features='sqrt')
  AdaBoostClassifier(n_estimators=50)
  SVC(kernel='rbf', C=1.0) / LinearSVC()
  LogisticRegression(C=1.0, max_iter=1000)
  MLPClassifier(hidden_layer_sizes=(100,), activation='relu')
```
