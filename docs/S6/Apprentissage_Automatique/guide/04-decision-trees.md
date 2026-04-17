---
title: "Chapitre 4 -- Arbres de decision & Random Forests"
sidebar_position: 4
---

# Chapitre 4 -- Arbres de decision & Random Forests

Ce chapitre est le plus important pour l'examen. Les arbres de decision sont presents dans quasiment toutes les annales.

---

## 1. Principe

Un arbre de decision classe un exemple en posant des questions successives sur les attributs, de la racine aux feuilles. Chaque noeud interne teste un attribut, chaque branche correspond a une valeur, et chaque feuille donne la classe predite.

---

## 2. Entropie : mesurer le desordre

L'entropie de Shannon mesure l'incertitude dans un ensemble de donnees :

$$H(S) = -\sum_{i=1}^{C} p_i \log_2(p_i)$$

ou $p_i$ est la proportion d'exemples de la classe $i$ dans l'ensemble $S$.

**Convention :** $0 \cdot \log_2(0) = 0$

### Valeurs de reference

| Distribution | Entropie | Interpretation |
|-------------|----------|---------------|
| 100% / 0% (pur) | $H = 0$ | Certitude totale |
| 50% / 50% | $H = 1$ | Incertitude maximale (2 classes) |
| 33% / 33% / 33% | $H = \log_2(3) \approx 1.585$ | Incertitude maximale (3 classes) |
| 75% / 25% | $H \approx 0.811$ | Incertitude moderee |

### Exemple de calcul

Un ensemble de 8 exemples : 5 "oui" et 3 "non" :

$$H(S) = -\frac{5}{8}\log_2\frac{5}{8} - \frac{3}{8}\log_2\frac{3}{8} = -0.625 \times (-0.678) - 0.375 \times (-1.415) = 0.954$$

---

## 3. Gain d'information

Le gain mesure la reduction d'entropie apportee par un attribut $A$ :

$$\text{Gain}(S, A) = H(S) - \sum_{v \in \text{valeurs}(A)} \frac{|S_v|}{|S|} \cdot H(S_v)$$

**En une phrase :** Gain = entropie avant la question - entropie moyenne apres la question.

### Exemple detaille : dataset du gouter

| # | devoirs | maman | beau | gouter | jouer |
|---|---------|-------|------|--------|-------|
| 1 | faits | non | oui | non | OUI |
| 2 | pas_faits | oui | non | oui | OUI |
| 3 | faits | oui | oui | non | OUI |
| 4 | faits | non | oui | oui | OUI |
| 5 | pas_faits | oui | oui | oui | NON |
| 6 | pas_faits | oui | non | non | NON |
| 7 | faits | non | non | oui | NON |
| 8 | faits | oui | non | non | NON |

**Etape 1 :** Entropie initiale (4 oui, 4 non) :
$$H(S) = -\frac{4}{8}\log_2\frac{4}{8} - \frac{4}{8}\log_2\frac{4}{8} = 1.0$$

**Etape 2 :** Gain pour "devoirs" :
- devoirs = faits : {1,3,4,7,8} => 3 oui, 2 non => $H = 0.971$
- devoirs = pas_faits : {2,5,6} => 1 oui, 2 non => $H = 0.918$

$$\text{Gain}(\text{devoirs}) = 1.0 - \left(\frac{5}{8} \times 0.971 + \frac{3}{8} \times 0.918\right) = 1.0 - 0.951 = 0.049$$

**Etape 3 :** Calculer le gain pour chaque attribut et choisir celui avec le gain maximum comme racine.

---

## 4. Indice de Gini (alternative a l'entropie)

$$\text{Gini}(S) = 1 - \sum_{i=1}^{C} p_i^2$$

| Distribution | Gini | Entropie |
|-------------|------|----------|
| 100% / 0% | 0 | 0 |
| 50% / 50% | 0.5 | 1.0 |
| 75% / 25% | 0.375 | 0.811 |

Gini est le critere utilise par CART (scikit-learn par defaut). Il est plus rapide a calculer (pas de logarithme) et donne des resultats similaires a l'entropie.

---

## 5. Algorithmes de construction

| Algorithme | Attributs | Critere | Splits | Particularites |
|-----------|-----------|---------|--------|---------------|
| **ID3** | Nominaux | Gain d'information | Multi-voies | L'original |
| **C4.5** | Nominaux + numeriques | Ratio de gain | Multi-voies | Gere valeurs manquantes |
| **CART** | Tous types | Gini | **Binaires** | Utilise par sklearn |

### Pseudo-code (ID3)

```
ConstruireArbre(S, attributs):
    si tous les exemples de S ont la meme classe c:
        retourner Feuille(c)
    si attributs est vide:
        retourner Feuille(classe_majoritaire(S))
    
    A* = argmax_A Gain(S, A)
    creer Noeud(A*)
    
    pour chaque valeur v de A*:
        S_v = {x in S | x.A* = v}
        si S_v est vide:
            ajouter Feuille(classe_majoritaire(S))
        sinon:
            ajouter ConstruireArbre(S_v, attributs \ {A*})
```

### Attributs numeriques

Pour un attribut numerique, on teste tous les seuils possibles (milieu entre deux valeurs consecutives triees) et on choisit celui qui maximise le gain. Le split est binaire : $x_j \leq \text{seuil}$ vs $x_j > \text{seuil}$.

---

## 6. Elagage (Pruning)

Un arbre non elague (Tmax) a 100% de precision sur le train mais generalise mal (overfitting).

### Pre-elagage (pre-pruning)

Arreter la construction quand un critere est atteint :
- `max_depth` : profondeur maximale.
- `min_samples_split` : nombre minimum d'exemples pour subdiviser.
- `min_samples_leaf` : nombre minimum d'exemples par feuille.

### Post-elagage (post-pruning) -- Cost Complexity Pruning (CCP)

Construire Tmax puis couper les branches qui n'ameliorent pas la performance :

$$\text{Cout} = \text{Erreur} + \alpha \times \text{Nombre de feuilles}$$

Plus $\alpha$ est grand, plus l'arbre est elague.

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score
import numpy as np

# 1. Construire Tmax
clf = DecisionTreeClassifier(criterion='entropy', max_depth=20)
clf.fit(X_train, y_train)

# 2. Obtenir les alphas possibles
path = clf.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas = path.ccp_alphas[:-1]

# 3. Tester chaque alpha
train_acc, val_acc = [], []
for alpha in ccp_alphas:
    c = DecisionTreeClassifier(ccp_alpha=alpha, random_state=0)
    c.fit(X_train, y_train)
    train_acc.append(accuracy_score(y_train, c.predict(X_train)))
    val_acc.append(accuracy_score(y_val, c.predict(X_val)))

# 4. Choisir le meilleur alpha
best_alpha = ccp_alphas[np.argmax(val_acc)]
clf_best = DecisionTreeClassifier(ccp_alpha=best_alpha, random_state=0)
clf_best.fit(X_train, y_train)
print(f"Meilleur alpha : {best_alpha:.4f}")
print(f"Feuilles : {clf_best.get_n_leaves()}, Profondeur : {clf_best.get_depth()}")
```

**Resultats du TP (dataset heart) :**
- Tmax : 100% train, ~54% test (overfitting severe)
- Alpha optimal (~0.02) : ~86% train, ~80% test (bon compromis)

---

## 7. Methodes d'ensemble

### Bagging (Bootstrap Aggregating)

Entrainer $B$ arbres sur des sous-echantillons bootstrap (tirage avec remise) et voter :

$$H(\mathbf{x}) = \text{vote majoritaire de } h_1(\mathbf{x}), h_2(\mathbf{x}), \ldots, h_B(\mathbf{x})$$

### Random Forest = Bagging + sous-ensemble aleatoire de features

A chaque noeud de chaque arbre, on ne considere qu'un sous-ensemble aleatoire de $m$ features :
- Classification : $m = \sqrt{p}$ typiquement.
- Regression : $m = p/3$ typiquement.

```python
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=100,       # nombre d'arbres
    max_features='sqrt',    # sqrt(p) features par noeud
    max_depth=None,         # arbres profonds
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)
print(f"Accuracy : {rf.score(X_test, y_test):.3f}")

# Importance des features
importances = rf.feature_importances_
for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f"  {name}: {imp:.3f}")
```

### AdaBoost (Adaptive Boosting)

Construction **sequentielle** : chaque classifieur corrige les erreurs du precedent via un systeme de poids.

**Algorithme :**
1. Initialiser $w_i = 1/n$ pour chaque exemple.
2. Pour $t = 1, \ldots, T$ :
   - Entrainer un classifieur faible $h_t$ avec les poids $w$.
   - Calculer l'erreur ponderee : $\epsilon_t = \sum_{h_t(x_i) \neq y_i} w_i$
   - Calculer le poids de vote : $\alpha_t = \frac{1}{2} \ln\frac{1 - \epsilon_t}{\epsilon_t}$
   - Mettre a jour : $w_i \leftarrow w_i \cdot e^{-\alpha_t y_i h_t(x_i)} / Z_t$
   - Normaliser : $Z_t = 2\sqrt{\epsilon_t(1-\epsilon_t)}$
3. Prediction : $H(\mathbf{x}) = \text{signe}\left(\sum_{t=1}^{T} \alpha_t h_t(\mathbf{x})\right)$

```python
from sklearn.ensemble import AdaBoostClassifier

ada = AdaBoostClassifier(
    estimator=DecisionTreeClassifier(max_depth=1),  # stumps
    n_estimators=50,
    learning_rate=1.0,
    random_state=42
)
ada.fit(X_train, y_train)
print(f"Accuracy : {ada.score(X_test, y_test):.3f}")
```

### Comparaison

| Methode | Construction | Diversite | Overfitting |
|---------|-------------|-----------|-------------|
| **Bagging** | Parallele | Donnees differentes | Reduit variance |
| **Random Forest** | Parallele | Donnees + features | Reduit variance ++ |
| **Boosting** | Sequentiel | Focus sur erreurs | Relativement resistant |

---

## 8. Visualisation d'arbres

```python
from sklearn.tree import plot_tree, export_graphviz
import matplotlib.pyplot as plt

plt.figure(figsize=(25, 10))
plot_tree(
    clf,
    feature_names=feature_names,
    class_names=class_names,
    filled=True,
    rounded=True,
    fontsize=10
)
plt.title("Arbre de decision")
plt.show()
```

### Ce que montrent les noeuds (sklearn)

| Champ | Signification |
|-------|-------------|
| `feature <= seuil` | La question posee a ce noeud |
| `entropy` (ou `gini`) | Entropie/Gini des exemples a ce noeud |
| `samples` | Nombre d'exemples atteignant ce noeud |
| `value` | Distribution des classes [n_classe0, n_classe1, ...] |
| `class` | Classe majoritaire |

---

## 9. Pieges classiques

- **Arbre trop profond = overfitting.** Toujours limiter avec `max_depth` ou utiliser le CCP.
- **Attribut a beaucoup de valeurs** : le gain d'information favorise les attributs avec beaucoup de valeurs (ex : identifiant unique). C4.5 corrige avec le ratio de gain.
- **Confondre entropie et Gini en examen** : verifier quel critere est demande. Le cours utilise typiquement l'entropie ($\log_2$).
- **Oublier la convention du log** : $\log_2$ (bits) en ML, pas $\ln$.
- **Ne pas comprendre la recursivite** : l'algorithme applique la meme logique a chaque sous-ensemble.
- **AdaBoost avec classifieur fort** : utiliser des stumps (profondeur 1), pas des arbres profonds.

---

## CHEAT SHEET

```
ENTROPIE
  H(S) = -sum(pi * log2(pi))
  Pur: H=0 | 50/50: H=1 | 3 classes equi: H=1.585

GINI
  Gini(S) = 1 - sum(pi^2)
  Pur: 0 | 50/50: 0.5

GAIN D'INFORMATION
  Gain(S,A) = H(S) - sum( |Sv|/|S| * H(Sv) )

ALGORITHME ID3
  1. Si pur => feuille
  2. Si plus d'attributs => feuille(majoritaire)
  3. Choisir A* = argmax Gain
  4. Creer noeud, recurser sur chaque valeur

ELAGAGE
  Pre-pruning : max_depth, min_samples_leaf
  Post-pruning : CCP avec alpha
  Cout = Erreur + alpha * |feuilles|

ADABOOST
  alpha_t = (1/2) * ln((1-epsilon)/epsilon)
  w_i = w_i * exp(-alpha * yi * ht(xi)) / Zt
  Zt = 2 * sqrt(epsilon * (1-epsilon))
  Prediction : signe(sum(alpha_t * ht(x)))

RANDOM FOREST
  Bagging + sqrt(p) features par noeud
  n_estimators=100, max_features='sqrt'

SKLEARN
  DecisionTreeClassifier(criterion='entropy', max_depth=20, ccp_alpha=0.02)
  RandomForestClassifier(n_estimators=100)
  AdaBoostClassifier(n_estimators=50, estimator=DecisionTreeClassifier(max_depth=1))
```
