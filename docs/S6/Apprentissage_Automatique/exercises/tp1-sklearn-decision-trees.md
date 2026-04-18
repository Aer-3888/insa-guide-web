---
title: "TP1 - Introduction a scikit-learn, arbres de decision et apprentissage bayesien"
sidebar_position: 1
---

# TP1 - Introduction a scikit-learn, arbres de decision et apprentissage bayesien

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp1_sklearn_decision_trees/TP1_complete.ipynb`

---

## Partie 1 : Chargement de donnees pre-formatees (Iris)

### Q1 : Quel type de probleme d'apprentissage automatique est-ce ?

**Reponse :**

Classification (apprentissage supervise). On dispose d'exemples etiquetes avec 3 classes (setosa, versicolor, virginica) et on cherche a predire la classe d'un nouvel exemple a partir de ses features.

```python noexec
from sklearn.datasets import load_iris

irisData = load_iris()
X = irisData.data
y = irisData.target
print(irisData.target)
print(irisData.target_names)
print(irisData.feature_names)
```

**Sortie attendue :**
```
[0 0 0 ... 2 2 2]
['setosa' 'versicolor' 'virginica']
['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']
```

---

### Q2 : Combien y a-t-il de features ? De quel type sont-elles ?

**Reponse :**

Quatre features numeriques continues :
- sepal length (cm)
- sepal width (cm)
- petal length (cm)
- petal width (cm)

---

### Q3 : Voyez-vous un probleme avec la facon dont les donnees sont preparees ?

**Reponse :**

Les features (`irisData.data`) et les etiquettes de classe (`irisData.target`) sont stockees dans des structures de donnees separees. Le seul lien entre elles est l'ordre (l'indice). Si l'on trie ou melange l'une des structures sans appliquer la meme operation a l'autre, toutes les associations sont detruites et le modele apprendra a partir de donnees incorrectes.

---

## Partie 2 : Visualisation d'une partie des donnees

```python noexec
%matplotlib inline
from matplotlib import pyplot as plt

X = irisData.data
y = irisData.target
xi = 0
yi = 1

colors = ["red", "green", "blue"]
for num_label in range(3):
    plt.scatter(
        X[y == num_label][:, xi],
        X[y == num_label][:, yi],
        color=colors[num_label],
        label=irisData.target_names[num_label]
    )
plt.legend()
plt.xlabel(irisData.feature_names[xi])
plt.ylabel(irisData.feature_names[yi])
plt.title("Iris Data - size of the sepals only")
plt.show()
```

**Sortie attendue :** Un nuage de points avec 150 points colores par classe. Setosa (rouge) forme un cluster bien separe en bas a droite. Versicolor (vert) et virginica (bleu) se chevauchent fortement dans la region centrale.

### Q4 : D'apres la visualisation precedente, que pouvez-vous predire sur la difficulte de ce jeu de donnees ?

**Reponse :**

En ne regardant que la longueur et la largeur des sepales, setosa est facilement separable des deux autres classes. Cependant, versicolor et virginica se chevauchent fortement pour les valeurs moyennes de ces deux features. Un classifieur utilisant uniquement ces deux dimensions aura du mal a distinguer ces deux classes. L'utilisation des 4 features (la longueur et la largeur des petales sont bien plus discriminantes) ameliorerait la separation.

---

## Partie 3 : Classification avec kNN

```python noexec
from sklearn import neighbors

nb_neighb = 15
clf = neighbors.KNeighborsClassifier(nb_neighb)

clf.fit(X, y)  # entrainement
print('accuracy on X is', clf.score(X, y))

# Predire sur un exemple specifique
print('class predicted is', clf.predict([[5.4, 3.2, 1.6, 0.4]]))
print('proba of each class is', clf.predict_proba([[5.4, 3.2, 1.6, 0.4]]))

y_pred = clf.predict(X)
print('misclassified training examples are:', X[y_pred != y])
```

**Sortie attendue :**
```
accuracy on X is 0.98
class predicted is [0]
proba of each class is [[1. 0. 0.]]
misclassified training examples are: [quelques cas limites versicolor/virginica]
```

### Q5 : Quel probleme voyez-vous avec cette evaluation ?

**Reponse :**

La precision est mesuree sur le jeu d'entrainement lui-meme, ce qui donne l'erreur empirique (ou apparente). Comme le modele a deja vu ces donnees, il obtient necessairement un meilleur score que sur des donnees nouvelles, jamais vues -- il peut etre en sur-apprentissage. Avec K=1, on obtiendrait 100% car chaque point est son propre plus proche voisin. Cela n'est pas representatif de la capacite de generalisation du modele. Il faut evaluer sur un jeu de test separe pour estimer l'erreur reelle (erreur de generalisation).

---

## Partie 4 : Jeux d'entrainement et de test

### Separation train/test et matrice de confusion

```python noexec
from sklearn.model_selection import train_test_split
import random
from sklearn.metrics import confusion_matrix, accuracy_score

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=random.seed()
)
print('size of train / test =', len(X_train), len(X_test))
print('nb of training data with class 0/1/2 =',
      len(X_train[y_train == 0]),
      len(X_train[y_train == 1]),
      len(X_train[y_train == 2]))

clf = clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)

cm = confusion_matrix(y_test, y_pred)
print('Confusion matrix\n', cm)
```

**Sortie attendue (varie selon la graine aleatoire) :**
```
size of train / test = 105 45
nb of training data with class 0/1/2 = 35 35 35
Confusion matrix
 [[15  0  0]
  [ 0 14  1]
  [ 0  1 14]]
```

### Q6 : Que contient la diagonale de la matrice de confusion ?

**Reponse :**

La diagonale contient le nombre de predictions correctes pour chaque classe : `confusion_matrix[i][i]` = nombre d'exemples de la classe `i` correctement predits comme classe `i`. Les elements hors diagonale sont les erreurs de classification.

### Q7 : Quelle est l'erreur reelle (donnez les details) ?

**Reponse :**

L'erreur reelle (ou erreur de generalisation) est la probabilite que notre modele classe incorrectement un exemple tire aleatoirement de la vraie distribution des donnees. Elle est definie comme l'erreur attendue sur des donnees jamais vues. On peut l'estimer ainsi :

```
Estimation de l'erreur reelle = nombre d'exemples mal classes sur le jeu de test / nombre total d'exemples de test
```

Lorsqu'il y a sur-apprentissage, l'erreur reelle est significativement plus elevee que l'erreur empirique (mesuree sur le jeu d'entrainement). L'utilisation d'une separation train/test ou de la validation croisee fournit une meilleure estimation de l'erreur reelle.

---

## Partie 5 : Validation croisee K-Fold

### K-Fold manuel

```python noexec
from sklearn.model_selection import KFold
from sklearn.metrics import accuracy_score

nb_folds = 10
kf = KFold(n_splits=nb_folds, shuffle=True)
score = 0

for training_ind, test_ind in kf.split(X):
    X_train = X[training_ind]
    y_train = y[training_ind]
    clf.fit(X_train, y_train)
    X_test = X[test_ind]
    y_test = y[test_ind]
    y_pred = clf.predict(X_test)
    score = score + accuracy_score(y_pred, y_test)

print('average accuracy:', score / nb_folds)
```

**Sortie attendue :**
```
average accuracy: ~0.9733
```

### En une ligne avec cross_val_score

```python noexec
from sklearn.model_selection import cross_val_score

t_scores = cross_val_score(clf, X, y, cv=10)
print(t_scores.mean())
```

**Sortie attendue :**
```
0.9733333333333334
```

**Explication :** KNN avec K=15 atteint environ 97% de precision en validation croisee 10-fold sur Iris. Chaque fold utilise 135 exemples pour l'entrainement et 15 pour le test. Tous les exemples sont utilises exactement une fois comme test. La validation croisee donne une meilleure estimation de l'erreur reelle qu'une simple separation train/test.

---

## Partie 6 : Arbre de decision (jeu de donnees Heart)

### Chargement du jeu de donnees

```python noexec
import pandas as pd
from sklearn.model_selection import train_test_split

data = 'heart.csv'
df = pd.read_csv(data)

X = df.drop(columns=['target'])
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y)

features = X.columns
classes = ['Not heart disease', 'heart disease']

print(features)
df.head()
```

**Sortie attendue :**
```
Index(['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach',
       'exang', 'oldpeak', 'slope', 'ca', 'thal'],
      dtype='object')
```

### Construction de Tmax et visualisation

```python noexec
from sklearn import tree
from graphviz import Source

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.3, random_state=42)

clf = tree.DecisionTreeClassifier(max_depth=20, criterion='entropy')
clf.fit(X_train, y_train)

graph = Source(tree.export_graphviz(
    clf, out_file=None,
    feature_names=features,
    class_names=classes,
    filled=True, rounded=True
))
graph
```

**Sortie attendue :** Un arbre de decision complet avec de nombreux noeuds et feuilles. Chaque noeud interne affiche la question de separation, l'entropie, le nombre d'echantillons et la distribution des classes. Les feuilles sont colorees en orange (maladie cardiaque) ou en bleu (pas de maladie).

### Q8 : Expliquez chaque ligne affichee dans les noeuds/feuilles de l'arbre.

**Reponse :**

| Champ | Signification |
|-------|-------------|
| `feature <= seuil` | La question posee a ce noeud pour separer les donnees (ex : `ca <= 0.5`) |
| `entropy` | Entropie de Shannon des classes a ce noeud (0 = pur, 1 = equilibre binaire) |
| `samples` | Nombre d'echantillons d'entrainement atteignant ce noeud |
| `value` | Distribution [n_classe0, n_classe1] des echantillons a ce noeud |
| `class` | Classe majoritaire a ce noeud (la prediction si c'etait une feuille) |

Dans les feuilles, l'entropie est toujours 0 (ou proche de 0) car Tmax decoupe les donnees jusqu'a la purete totale. La classe d'une feuille est la prediction finale pour tous les exemples qui l'atteignent.

### Q9 : Quel est le nom de cet arbre de decision d'apres le cours ?

**Reponse :**

Cet arbre s'appelle **Tmax** (l'arbre maximal). Il est obtenu en posant recursivement des questions et en decoupant jusqu'a ce que chaque feuille corresponde parfaitement a une seule classe. Tmax atteint 100% de precision sur le jeu d'entrainement mais fait du sur-apprentissage -- il memorise les donnees d'entrainement plutot que d'apprendre des regularites generalisables.

---

### Visualisation alternative avec dtreeviz

```python noexec
from dtreeviz.trees import dtreeviz

graph = dtreeviz(
    clf, X_train, y_train,
    target_name="target",
    feature_names=features,
    class_names=classes
)
graph
```

### Q10 : Expliquez ce que representent les histogrammes affiches.

**Reponse :**

Chaque histogramme a un noeud represente la distribution de la feature utilisee pour la separation, coloree par classe cible. La valeur du seuil choisie pour la separation est indiquee par un pointeur sous l'axe des valeurs (ex : 0.50 pour la feature `ca` au noeud racine). Cela permet d'evaluer visuellement si la separation separe bien les classes : une bonne separation montre des distributions de couleurs differentes de chaque cote du seuil.

### Q11 : D'apres le manuel de sklearn, expliquez l'effet de max_depth ou min_samples sur l'arbre de decision. Si le temps le permet, montrez les effets experimentalement.

**Reponse :**

- `max_depth` : Fixe une profondeur maximale pour l'arbre. Si l'arbre tente d'aller au-dela de cette profondeur, il cree simplement une feuille pour les individus restants au lieu de continuer a decouper.
- `min_samples_leaf` : Nombre minimum d'echantillons requis dans chaque feuille. Empeche les feuilles tres specifiques avec seulement 1-2 exemples.
- `min_samples_split` : Nombre minimum d'echantillons requis pour decouper un noeud. Si un noeud a moins d'echantillons que ce seuil, il devient une feuille.

Remarque : `min_samples` n'existe plus en tant que parametre. Les deux parametres `min_samples_leaf` et `min_samples_split` l'ont remplace.

Ces trois parametres controlent la complexite de l'arbre. Des valeurs restrictives (faible profondeur, grands min_samples) produisent des arbres plus simples qui generalisent mieux mais risquent le sous-apprentissage. Des valeurs permissives produisent des arbres complexes qui risquent le sur-apprentissage.

---

## Partie 7 : Elagage de Tmax (Cost Complexity Pruning)

### Etape 1 : Obtenir les valeurs d'alpha

```python noexec
path = clf.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas, impurities = path.ccp_alphas, path.impurities
print(ccp_alphas)
```

**Sortie attendue :**
```
[0.         0.0085133  0.01144989 0.01299475 0.01299475 0.01421593
 0.01508121 0.01530713 0.01750056 0.01788634 0.01800819 0.01839686
 0.01916411 0.02095474 0.02367712 0.02849288 0.02973473 0.03477861
 0.03913504 0.04860676 0.08661577 0.12325037 0.19175318]
```

Chaque valeur d'alpha correspond a un niveau d'elagage. Alpha=0 donne Tmax, le dernier alpha donne un arbre trivial a un seul noeud.

### Etape 2 : Entrainer un arbre pour chaque alpha et tracer les courbes

```python noexec
from sklearn.metrics import accuracy_score

# Entrainer un arbre pour chaque alpha
t_clf = []
for ccp_alpha in ccp_alphas:
    c = tree.DecisionTreeClassifier(random_state=0, ccp_alpha=ccp_alpha)
    c.fit(X_train, y_train)
    t_clf.append(c)

# Supprimer le dernier (arbre trivial a un seul noeud)
t_clf = t_clf[:-1]
ccp_alphas = ccp_alphas[:-1]

# --- Graphique 1 : Complexite de l'arbre vs alpha ---
node_counts = [c.tree_.node_count for c in t_clf]
depth = [c.tree_.max_depth for c in t_clf]

plt.scatter(ccp_alphas, node_counts)
plt.scatter(ccp_alphas, depth)
plt.plot(ccp_alphas, node_counts, label='no of nodes', drawstyle="steps-post")
plt.plot(ccp_alphas, depth, label='depth', drawstyle="steps-post")
plt.legend()
plt.title('Tree complexity vs alpha')
plt.show()

# --- Graphique 2 : Precision vs alpha ---
train_acc = []
val_acc = []
for c in t_clf:
    y_train_pred = c.predict(X_train)
    y_val_pred = c.predict(X_val)
    train_acc.append(accuracy_score(y_train_pred, y_train))
    val_acc.append(accuracy_score(y_val_pred, y_val))

plt.scatter(ccp_alphas, train_acc)
plt.scatter(ccp_alphas, val_acc)
plt.plot(ccp_alphas, train_acc, label='train_accuracy', drawstyle="steps-post")
plt.plot(ccp_alphas, val_acc, label='val_accuracy', drawstyle="steps-post")
plt.legend()
plt.title('Accuracy vs alpha')
plt.show()
```

**Sortie attendue :**
- Graphique 1 : Deux courbes en escalier decroissantes. A mesure qu'alpha augmente, le nombre de noeuds et la profondeur diminuent.
- Graphique 2 : `train_accuracy` commence a 100% (alpha=0, Tmax) et diminue. `val_accuracy` commence plus bas, atteint un pic autour d'alpha=0.02, puis diminue. L'ecart entre les deux courbes montre le sur-apprentissage pour les petits alpha et le sous-apprentissage pour les grands alpha.

### Q12 : D'apres le graphique ci-dessus, quelle est la meilleure valeur d'alpha ?

**Reponse :**

Le meilleur alpha est approximativement **0.020**. Il donne la meilleure precision sur le jeu de validation (`val_accuracy`) tout en limitant le sur-apprentissage (l'ecart entre `train_accuracy` et `val_accuracy`).

- Alpha trop petit (< 0.01) : arbre trop complexe, sur-apprentissage (train >> val).
- Alpha optimal (~0.02) : bon compromis biais-variance.
- Alpha trop grand (> 0.05) : arbre trop simple, sous-apprentissage (les deux courbes sont basses).

### Arbre elague avec le meilleur alpha

```python noexec
best_alpha = 0.020
clf_ = tree.DecisionTreeClassifier(random_state=0, ccp_alpha=best_alpha)
clf_.fit(X_train, y_train)

y_train_pred = clf_.predict(X_train)
y_val_pred = clf_.predict(X_val)

print(f'Train score {accuracy_score(y_train_pred, y_train)}')
print(confusion_matrix(y_train_pred, y_train))

print(f'Validation score {accuracy_score(y_val_pred, y_val)}')
print(confusion_matrix(y_val_pred, y_val))
```

**Sortie attendue :**
```
Train score 0.8632075471698113
[[ 75   7]
 [ 22 108]]
Validation score 0.8021978021978022
[[31  8]
 [10 42]]
```

**Explication :** Avec alpha=0.02, l'arbre elague obtient 86% sur le train et 80% en validation. L'ecart de 6 points indique un leger sur-apprentissage residuel, mais c'est bien mieux que Tmax qui obtenait 100% en train mais seulement ~80% en validation. L'arbre elague a environ 5-7 noeuds au lieu de 35+, ce qui le rend beaucoup plus interpretable.

---

## Partie 8 : Apprentissage bayesien

### Chargement du jeu de donnees weather.nominal.csv

```python noexec
data = 'weather.nominal.csv'
df = pd.read_csv(data)
df.head()
```

**Sortie attendue :**
```
    outlook temperature humidity  windy  play
0     sunny         hot     high  False     0
1     sunny         hot     high   True     0
2  overcast         hot     high  False     1
3     rainy        mild     high  False     1
4     rainy        cool   normal  False     1
```

### Q13 : Considerons le jeu de donnees weather_nominal. Quel est le type de chaque feature ?

**Reponse :**

| Feature | Type |
|---------|------|
| `outlook` | Nominale (sunny, overcast, rainy) |
| `temperature` | Nominale (hot, mild, cool) |
| `humidity` | Nominale / booleenne (high, normal) |
| `windy` | Booleenne (True, False) |
| `play` | Booleenne / cible (0, 1) |

### Entrainement d'un Naive Bayes categoriel

```python noexec
from sklearn.preprocessing import OrdinalEncoder
from sklearn.naive_bayes import CategoricalNB

X_train = df.drop(columns=['play'])
y_train = df['play']

features = X_train.columns
classes = ['no play', 'play']

# Convertir les features nominales en entiers
enc = OrdinalEncoder()
X_train = enc.fit_transform(X_train)

# Entrainement
clf = CategoricalNB().fit(X_train, y_train)

y_train_pred = clf.predict(X_train)

print(f'Train score {accuracy_score(y_train_pred, y_train)}')
print(confusion_matrix(y_train_pred, y_train))
```

**Sortie attendue :**
```
Train score 0.9285714285714286
[[4 0]
 [1 9]]
```

**Explication :** Le modele classe correctement 13/14 exemples d'entrainement. Un seul cas "play" est mal classe comme "no play".

---

### Q14 : Expliquez ce qu'affichent `clf.class_log_prior_` et `clf.feature_log_prob_` et faites le lien avec ce que vous avez vu en cours. Ces chiffres correspondent-ils a ce que vous obtenez en calculant a la main (expliquez) ?

```python noexec
from math import exp, log

print(clf.class_log_prior_)
print(clf.feature_log_prob_)
```

**Sortie attendue :**
```
[-1.02961942 -0.44183275]
[array([[-2.07944154, -0.98082925, -0.69314718],
       [-0.87546874, -1.09861229, -1.38629436]]),
 array([[-1.38629436, -0.98082925, -0.98082925],
       [-1.09861229, -1.38629436, -0.87546874]]),
 array([[-0.33647224, -1.25276297],
       [-1.01160091, -0.45198512]]),
 array([[-0.84729786, -0.55961579],
       [-0.45198512, -1.01160091]])]
```

**Reponse :**

`class_log_prior_` contient le logarithme neperien des probabilites a priori P(classe) :
- P(no play) = 5/14 => ln(5/14) = -1.030
- P(play) = 9/14 => ln(9/14) = -0.442

`feature_log_prob_` contient le logarithme neperien des vraisemblances P(feature=v | classe), organise en une liste de tableaux par feature. Chaque tableau a les dimensions [n_classes, n_valeurs_pour_cette_feature].

L'OrdinalEncoder attribue les valeurs ordinales suivantes :

| Feature | 0 | 1 | 2 |
|---------|---|---|---|
| Outlook | "overcast" | "rainy" | "sunny" |
| Temperature | "cool" | "hot" | "mild" |
| Humidity | "high" | "normal" | -- |
| Windy | False | True | -- |

Calcul manuel des vraisemblances (exemple pour Outlook, classe=0 / no play, 5 exemples) :

| | overcast (0) | rainy (1) | sunny (2) |
|---|---|---|---|
| no play (5 ex.) | 0/5 | 2/5 | 3/5 |
| play (9 ex.) | 4/9 | 2/9 | 2/9 |

Les valeurs de sklearn ne correspondent pas exactement car sklearn applique le **lissage de Laplace** (alpha=1 par defaut) pour eviter les probabilites nulles. Avec lissage :
- P(overcast | no play) = (0+1)/(5+3) = 1/8 => ln(1/8) = -2.079 (correspond)
- P(rainy | no play) = (2+1)/(5+3) = 3/8 => ln(3/8) = -0.981 (correspond)

```python noexec
# Verification
print([log(x / 14) for x in [5, 9]])
print("Outlook = 2 for class = 1")
print("CLF:", clf.feature_log_prob_[0][1][2])
print("Me:", log(2 / 9))
print("Humidity = 1 for class = 0")
print("CLF:", clf.feature_log_prob_[2][0][1])
print("Me:", log(1 / 5))
```

**Sortie attendue :**
```
[-1.0296194171811581, -0.4418327522790392]
Outlook = 2 for class = 1
CLF: -1.3862943611198906
Me: -1.5040773967762742
Humidity = 1 for class = 0
CLF: -1.252762968495368
Me: -1.6094379124341003
```

La difference vient du lissage de Laplace : sklearn calcule (2+1)/(9+3) = 3/12 = 0.25 => ln(0.25) = -1.386, tandis que le calcul naif donne 2/9 => ln(2/9) = -1.504.

---

### Q15 : Considerons maintenant le jeu de donnees weather.csv. Quelle est la difference avec le precedent ?

**Reponse :**

Le premier jeu de donnees (`weather.nominal.csv`) etait nominalise : les valeurs originales des features continues (Temperature, Humidity) avaient ete regroupees en categories discretes (hot/mild/cool, high/normal). Dans `weather.csv`, Temperature et Humidity sont des features **numeriques continues** (ex : temperature=85, humidity=90).

Pour les features continues sous l'hypothese bayesienne naive, on suppose qu'elles suivent une loi de probabilite continue -- typiquement une **distribution normale (gaussienne)**. On estime les parametres (moyenne mu et ecart-type sigma) a partir des donnees d'entrainement par classe, et on utilise la fonction de densite de la loi normale pour calculer les vraisemblances.

---

### Q16 : Calculez "a la main" la probabilite a posteriori de chaque classe pour l'echantillon suivant : `x = ['sunny', 73, 81, 'TRUE']`

**Reponse :**

En utilisant la loi de Bayes : P(classe|x) = P(classe) * P(x|classe) / P(x)

Sous l'hypothese naive : P(x|classe) = P(x1|classe) * P(x2|classe) * ... * P(xn|classe)

#### Etape 1 : Charger les donnees et calculer les probabilites a priori

```python noexec
import pandas as pd
from math import sqrt, log

data = 'weather.csv'
df = pd.read_csv(data)

X_train = df.drop(columns=['play'])
Y_train = df['play']
classes = ['no play', 'play']

X_test, y_test = [['sunny', 73, 81, 'TRUE']], [0]

# Probabilites a priori
a_priori_prob = [
    len(Y_train[Y_train == y].index) / len(Y_train.index)
    for y in [0, 1]
]
print("A priori probabilities:", a_priori_prob)
# P(no play) = 5/14 = 0.357
# P(play)    = 9/14 = 0.643
```

#### Etape 2 : Vraisemblances pour les features nominales

```python noexec
# Vraisemblances pour Outlook
likeli_outlook = [
    dict([
        (val, len(df[(df["play"] == y) & (df["outlook"] == val)].index)
             / len(df[df["play"] == y].index))
        for val in df["outlook"].unique()
    ])
    for y in [0, 1]
]
print("Outlook likelihoods:", likeli_outlook)
# no play: {'sunny': 0.6, 'overcast': 0.0, 'rainy': 0.4}
# play:    {'sunny': 0.222, 'overcast': 0.444, 'rainy': 0.333}

# Vraisemblances pour Windy
likeli_windy = [
    dict([
        (val, len(df[(df["play"] == y) & (df["windy"] == val)].index)
             / len(df[df["play"] == y].index))
        for val in df["windy"].unique()
    ])
    for y in [0, 1]
]
print("Windy likelihoods:", likeli_windy)
# no play: {False: 0.4, True: 0.6}
# play:    {False: 0.667, True: 0.333}
```

#### Etape 3 : Vraisemblances pour les features continues (distribution normale)

```python noexec
# Temperature : calcul de la moyenne et de l'ecart-type par classe
temp_mu = [
    sum(df[df["play"] == y]["temperature"]) / len(df[df["play"] == y].index)
    for y in [0, 1]
]
print("Expected values for temperature:", temp_mu)  # [74.6, 73.0]

temp_sigma = [
    sqrt(sum(
        (x - temp_mu[y]) ** 2
        for x in df[df["play"] == y]["temperature"]
    ) / len(df[df["play"] == y].index))
    for y in [0, 1]
]
print("Standard deviation for temperature:", temp_sigma)  # [7.06, 5.81]

# En utilisant un calculateur de loi normale pour P(72 <= T <= 74) :
likeli_temp_73 = [0.1098, 0.1366]
print("P(temperature in 73 +/- 1):", likeli_temp_73)

# Humidity : meme approche
hum_mu = [
    sum(df[df["play"] == y]["humidity"]) / len(df[df["play"] == y].index)
    for y in [0, 1]
]
print("Expected values for humidity:", hum_mu)  # [86.2, 79.11]

hum_sigma = [
    sqrt(sum(
        (x - hum_mu[y]) ** 2
        for x in df[df["play"] == y]["humidity"]
    ) / len(df[df["play"] == y].index))
    for y in [0, 1]
]
print("Standard deviation for humidity:", hum_sigma)  # [8.70, 9.63]

# En utilisant un calculateur de loi normale pour P(80 <= H <= 82) :
likeli_hum_81 = [0.0766, 0.0811]
print("P(humidity in 81 +/- 1):", likeli_hum_81)
```

**Parametres des distributions normales :**

| Feature | Classe | mu | sigma |
|---------|--------|------|-------|
| Temperature | no play | 74.6 | 7.06 |
| Temperature | play | 73.0 | 5.81 |
| Humidity | no play | 86.2 | 8.70 |
| Humidity | play | 79.11 | 9.63 |

#### Etape 4 : Combiner avec le theoreme de Bayes

```python noexec
# Vraisemblance = produit de toutes les vraisemblances individuelles (hypothese naive)
likelihood = [
    likeli_hum_81[y] * likeli_temp_73[y]
    * likeli_windy[y][X_test[0][3] == 'TRUE']
    * likeli_outlook[y][X_test[0][0]]
    for y in [0, 1]
]
print("Likelihood:", likelihood)
# no play: 0.0766 * 0.1098 * 0.6 * 0.6 = 0.003028
# play:    0.0811 * 0.1366 * 0.333 * 0.222 = 0.000821

# A posteriori = prior * vraisemblance
proba = [likelihood[y] * a_priori_prob[y] for y in [0, 1]]

# Normaliser par P(x) = somme des produits
# Puisque {play=0, play=1} est une partition, P(x) = P(x|0)*P(0) + P(x|1)*P(1)
proba = [val / sum(proba) for val in proba]
print("A posteriori probabilities:", proba)
print("Prediction:", classes[proba.index(max(proba))])
```

**Sortie attendue :**
```
Outlook likelihoods: [{'sunny': 0.6, 'overcast': 0.0, 'rainy': 0.4}, {'sunny': 0.222, 'overcast': 0.444, 'rainy': 0.333}]
Windy likelihoods: [{False: 0.4, True: 0.6}, {False: 0.667, True: 0.333}]
Expected values for temperature: [74.6, 73.0]
Standard deviation for temperature: [7.06, 5.81]
Expected values for humidity: [86.2, 79.11]
Standard deviation for humidity: [8.70, 9.63]
Likelihood: [0.0030278448, 0.0008206118518518518]
A priori probabilities: [0.357, 0.643]
A posteriori probabilities: [0.672, 0.328]
The testing example will be classified as: no play
```

**Explication :**
- Bien que la probabilite a priori favorise "play" (64.3% vs 35.7%), les vraisemblances inversent la prediction.
- La combinaison "sunny" + "windy=TRUE" est fortement associee a "no play" (P=0.6 chacun vs 0.222 et 0.333 pour "play").
- La temperature (73) est proche de la moyenne des deux classes, donc peu discriminante.
- L'humidite (81) est plus proche de la moyenne "play" (79) que de la moyenne "no play" (86), mais cet effet est domine par les features nominales.
- Le ratio final P(no play)/P(play) = 0.672/0.328 ~ 2:1, la prediction est donc assez confiante.
- La prediction ("no play") est correcte selon l'etiquette de test.
