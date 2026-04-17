---
title: "TP1 - Introduction to scikit-learn, Decision Trees, and Bayesian Learning"
sidebar_position: 1
---

# TP1 - Introduction to scikit-learn, Decision Trees, and Bayesian Learning

> Following teacher instructions from: `data/moodle/tp/tp1_sklearn_decision_trees/TP1_complete.ipynb`

---

## Part 1: Loading Pre-formatted Data (Iris)

### Q1: What type of machine learning problem is that?

**Answer:**

Classification (supervised learning). We have labeled examples with 3 classes (setosa, versicolor, virginica) and we seek to predict the class of a new example from its features.

```python noexec
from sklearn.datasets import load_iris

irisData = load_iris()
X = irisData.data
y = irisData.target
print(irisData.target)
print(irisData.target_names)
print(irisData.feature_names)
```

**Expected output:**
```
[0 0 0 ... 2 2 2]
['setosa' 'versicolor' 'virginica']
['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']
```

---

### Q2: How many features are there? What kind of features?

**Answer:**

Four numeric continuous features:
- sepal length (cm)
- sepal width (cm)
- petal length (cm)
- petal width (cm)

---

### Q3: Can you see a problem with the way the data are prepared?

**Answer:**

The features (`irisData.data`) and class labels (`irisData.target`) are stored in separate data structures. The only link between them is the ordering (index). If you sort or shuffle one structure without applying the same operation to the other, all associations are broken and the model will learn from incorrect data.

---

## Part 2: Plotting Parts of the Data

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

**Expected output:** A scatter plot with 150 points colored by class. Setosa (red) forms a well-separated cluster in the lower right. Versicolor (green) and virginica (blue) overlap strongly in the central region.

### Q4: From the previous visualisation, what can you predict about the difficulty of this dataset?

**Answer:**

Looking only at sepal length and sepal width, setosa is easily separable from the other two classes. However, versicolor and virginica overlap heavily for average values of these two features. A classifier using only these two dimensions will struggle to distinguish those two classes. Using all 4 features (petal length and petal width are much more discriminating) would improve separation.

---

## Part 3: Classifying with kNN

```python noexec
from sklearn import neighbors

nb_neighb = 15
clf = neighbors.KNeighborsClassifier(nb_neighb)

clf.fit(X, y)  # training
print('accuracy on X is', clf.score(X, y))

# Predict on a specific example
print('class predicted is', clf.predict([[5.4, 3.2, 1.6, 0.4]]))
print('proba of each class is', clf.predict_proba([[5.4, 3.2, 1.6, 0.4]]))

y_pred = clf.predict(X)
print('misclassified training examples are:', X[y_pred != y])
```

**Expected output:**
```
accuracy on X is 0.98
class predicted is [0]
proba of each class is [[1. 0. 0.]]
misclassified training examples are: [a few versicolor/virginica border cases]
```

### Q5: What kind of problem do you see with the evaluation?

**Answer:**

The accuracy is measured on the training set itself, which gives the empirical (or apparent) error. Since the model has already seen these data, it will necessarily have a better score than on new, unseen data -- it might be overfitting. With K=1, we would get 100% since each point is its own nearest neighbor. This is not representative of the model's generalization ability. We must evaluate on a separate test set to estimate the real error (generalization error).

---

## Part 4: About Training and Test Sets

### Train/test split and confusion matrix

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

**Expected output (varies with random seed):**
```
size of train / test = 105 45
nb of training data with class 0/1/2 = 35 35 35
Confusion matrix
 [[15  0  0]
  [ 0 14  1]
  [ 0  1 14]]
```

### Q6: What is on the diagonal of the confusion matrix?

**Answer:**

The diagonal contains the number of correct predictions for each class: `confusion_matrix[i][i]` = number of examples of class `i` that were correctly predicted as class `i`. Off-diagonal elements are classification errors.

### Q7: What is the real error rate (give details)?

**Answer:**

The real error (or generalization error) is the probability that our model misclassifies an example randomly drawn from the true data distribution. It is defined as the expected error on unseen data. We can estimate it as:

```
Real error estimate = number of misclassified examples on the test set / total number of test examples
```

Whenever we overfit, the real error is significantly higher than the empirical error (measured on the training set). Using a train/test split or cross-validation provides a better estimate of the real error.

---

## Part 5: Cross-fold Validation

### Manual K-Fold

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

**Expected output:**
```
average accuracy: ~0.9733
```

### One-liner with cross_val_score

```python noexec
from sklearn.model_selection import cross_val_score

t_scores = cross_val_score(clf, X, y, cv=10)
print(t_scores.mean())
```

**Expected output:**
```
0.9733333333333334
```

**Explanation:** KNN with K=15 achieves about 97% accuracy in 10-fold cross-validation on Iris. Each fold uses 135 examples for training and 15 for testing. All examples are used exactly once as test. Cross-validation gives a better estimate of the real error than a single train/test split.

---

## Part 6: Decision Tree (Heart Dataset)

### Loading the dataset

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

**Expected output:**
```
Index(['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach',
       'exang', 'oldpeak', 'slope', 'ca', 'thal'],
      dtype='object')
```

### Building Tmax and visualizing it

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

**Expected output:** A complete decision tree with many nodes and leaves. Each internal node shows the split question, entropy, sample count, and class distribution. Leaves are colored orange (heart disease) or blue (not).

### Q8: Explain each line displayed in the nodes/leaves of the tree.

**Answer:**

| Label | Meaning |
|-------|---------|
| `feature <= threshold` | The question asked at this node to split the data (e.g., `ca <= 0.5`) |
| `entropy` | Shannon entropy of the classes at this node (0 = pure, 1 = balanced binary) |
| `samples` | How many training samples reach this node |
| `value` | Distribution [n_class0, n_class1] of samples at this node |
| `class` | The majority class at this node (the prediction if it were a leaf) |

In the leaves, entropy is always 0 (or close to 0) because Tmax splits data until total purity. The class of a leaf is the final prediction for all examples reaching that leaf.

### Q9: What is the name of this decision tree according to the course?

**Answer:**

This tree is called **Tmax** (the maximum tree). It is obtained by recursively asking questions and splitting until every single leaf perfectly matches one class and one class only. Tmax achieves 100% accuracy on the training set but overfits -- it memorizes the training data rather than learning generalizable patterns.

---

### Alternative visualization with dtreeviz

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

### Q10: Explain what are the histograms displayed.

**Answer:**

Each histogram at a node represents the distribution of the feature used for that split, colored by target class. The threshold value chosen for the split is indicated by a pointer under the value axis (e.g., 0.50 for feature `ca` on the root node). This lets you visually assess whether the split separates the classes well: a good split shows different color distributions on each side of the threshold.

### Q11: From the sklearn manual, explain what effect max_depth or min_samples will have on the decision tree. If time permits, show the effects experimentally.

**Answer:**

- `max_depth`: Sets a maximum depth for the tree. If the tree tries to go beyond that depth, it simply creates a leaf for the remaining individuals instead of splitting further.
- `min_samples_leaf`: Minimum number of samples required in each leaf. Prevents very specific leaves with only 1-2 examples.
- `min_samples_split`: Minimum number of samples required to split a node. If a node has fewer samples than this threshold, it becomes a leaf.

Note: `min_samples` no longer exists as a parameter. The two parameters `min_samples_leaf` and `min_samples_split` replaced it.

All three parameters control tree complexity. Restrictive values (small depth, large min_samples) produce simpler trees that generalize better but risk underfitting. Permissive values produce complex trees that risk overfitting.

---

## Part 7: Pruning Tmax (Cost Complexity Pruning)

### Step 1: Get alpha values

```python noexec
path = clf.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas, impurities = path.ccp_alphas, path.impurities
print(ccp_alphas)
```

**Expected output:**
```
[0.         0.0085133  0.01144989 0.01299475 0.01299475 0.01421593
 0.01508121 0.01530713 0.01750056 0.01788634 0.01800819 0.01839686
 0.01916411 0.02095474 0.02367712 0.02849288 0.02973473 0.03477861
 0.03913504 0.04860676 0.08661577 0.12325037 0.19175318]
```

Each alpha value corresponds to a pruning level. Alpha=0 gives Tmax, the last alpha gives a trivial tree with a single node.

### Step 2: Train a tree for each alpha and plot the curves

```python noexec
from sklearn.metrics import accuracy_score

# Train a tree for each alpha
t_clf = []
for ccp_alpha in ccp_alphas:
    c = tree.DecisionTreeClassifier(random_state=0, ccp_alpha=ccp_alpha)
    c.fit(X_train, y_train)
    t_clf.append(c)

# Remove the last (trivial single-node tree)
t_clf = t_clf[:-1]
ccp_alphas = ccp_alphas[:-1]

# --- Plot 1: Tree complexity vs alpha ---
node_counts = [c.tree_.node_count for c in t_clf]
depth = [c.tree_.max_depth for c in t_clf]

plt.scatter(ccp_alphas, node_counts)
plt.scatter(ccp_alphas, depth)
plt.plot(ccp_alphas, node_counts, label='no of nodes', drawstyle="steps-post")
plt.plot(ccp_alphas, depth, label='depth', drawstyle="steps-post")
plt.legend()
plt.title('Tree complexity vs alpha')
plt.show()

# --- Plot 2: Accuracy vs alpha ---
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

**Expected output:**
- Plot 1: Two decreasing staircase curves. As alpha increases, node count and depth decrease.
- Plot 2: `train_accuracy` starts at 100% (alpha=0, Tmax) and decreases. `val_accuracy` starts lower, peaks around alpha=0.02, then decreases. The gap between the two curves shows overfitting for small alpha and underfitting for large alpha.

### Q12: From the graph above, what is the best value for alpha.

**Answer:**

The best alpha is approximately **0.020**. It gives the best accuracy on the validation set (`val_accuracy`) while limiting overfitting (the gap between `train_accuracy` and `val_accuracy`).

- Alpha too small (< 0.01): tree is too complex, overfitting (train >> val).
- Alpha optimal (~0.02): good bias-variance tradeoff.
- Alpha too large (> 0.05): tree is too simple, underfitting (both curves are low).

### Pruned tree with best alpha

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

**Expected output:**
```
Train score 0.8632075471698113
[[ 75   7]
 [ 22 108]]
Validation score 0.8021978021978022
[[31  8]
 [10 42]]
```

**Explanation:** With alpha=0.02, the pruned tree gets 86% on train and 80% on validation. The 6-point gap indicates slight residual overfitting, but is much better than Tmax which got 100% train but only ~80% validation. The pruned tree has ~5-7 nodes instead of 35+, making it far more interpretable.

---

## Part 8: Bayesian Learning

### Loading the weather.nominal.csv dataset

```python noexec
data = 'weather.nominal.csv'
df = pd.read_csv(data)
df.head()
```

**Expected output:**
```
    outlook temperature humidity  windy  play
0     sunny         hot     high  False     0
1     sunny         hot     high   True     0
2  overcast         hot     high  False     1
3     rainy        mild     high  False     1
4     rainy        cool   normal  False     1
```

### Q13: Let us consider the weather_nominal dataset. What is the type of each feature?

**Answer:**

| Feature | Type |
|---------|------|
| `outlook` | Nominal (sunny, overcast, rainy) |
| `temperature` | Nominal (hot, mild, cool) |
| `humidity` | Nominal / boolean (high, normal) |
| `windy` | Boolean (True, False) |
| `play` | Boolean / target (0, 1) |

### Training a Categorical Naive Bayes

```python noexec
from sklearn.preprocessing import OrdinalEncoder
from sklearn.naive_bayes import CategoricalNB

X_train = df.drop(columns=['play'])
y_train = df['play']

features = X_train.columns
classes = ['no play', 'play']

# Convert nominal features to integers
enc = OrdinalEncoder()
X_train = enc.fit_transform(X_train)

# Train
clf = CategoricalNB().fit(X_train, y_train)

y_train_pred = clf.predict(X_train)

print(f'Train score {accuracy_score(y_train_pred, y_train)}')
print(confusion_matrix(y_train_pred, y_train))
```

**Expected output:**
```
Train score 0.9285714285714286
[[4 0]
 [1 9]]
```

**Explanation:** The model correctly classifies 13/14 training examples. Only one "play" case is misclassified as "no play".

---

### Q14: Explain what is displayed by `clf.class_log_prior_` and `clf.feature_log_prob_` and link that with what you've seen during the course. Do these figures correspond to what you get when doing it by yourself (explain)?

```python noexec
from math import exp, log

print(clf.class_log_prior_)
print(clf.feature_log_prob_)
```

**Expected output:**
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

**Answer:**

`class_log_prior_` contains the natural log of the prior probabilities P(class):
- P(no play) = 5/14 => ln(5/14) = -1.030
- P(play) = 9/14 => ln(9/14) = -0.442

`feature_log_prob_` contains the natural log of the likelihoods P(feature=v | class), organized as a list of arrays per feature. Each array has dimensions [n_classes, n_values_for_that_feature].

The OrdinalEncoder assigns the following ordinal values:

| Feature | 0 | 1 | 2 |
|---------|---|---|---|
| Outlook | "overcast" | "rainy" | "sunny" |
| Temperature | "cool" | "hot" | "mild" |
| Humidity | "high" | "normal" | -- |
| Windy | False | True | -- |

Manual computation of likelihoods (example for Outlook, class=0 / no play, 5 examples):

| | overcast (0) | rainy (1) | sunny (2) |
|---|---|---|---|
| no play (5 ex.) | 0/5 | 2/5 | 3/5 |
| play (9 ex.) | 4/9 | 2/9 | 2/9 |

The sklearn values do not match exactly because sklearn applies **Laplace smoothing** (alpha=1 by default) to avoid zero probabilities. With smoothing:
- P(overcast | no play) = (0+1)/(5+3) = 1/8 => ln(1/8) = -2.079 (matches)
- P(rainy | no play) = (2+1)/(5+3) = 3/8 => ln(3/8) = -0.981 (matches)

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

**Expected output:**
```
[-1.0296194171811581, -0.4418327522790392]
Outlook = 2 for class = 1
CLF: -1.3862943611198906
Me: -1.5040773967762742
Humidity = 1 for class = 0
CLF: -1.252762968495368
Me: -1.6094379124341003
```

The difference comes from Laplace smoothing: sklearn computes (2+1)/(9+3) = 3/12 = 0.25 => ln(0.25) = -1.386, while the naive calculation gives 2/9 => ln(2/9) = -1.504.

---

### Q15: Let's consider the weather.csv dataset now. Explain what is the difference with the previous one.

**Answer:**

The first dataset (`weather.nominal.csv`) was nominalized: the original values for its continuous features (Temperature, Humidity) were merged into discrete categories (hot/mild/cool, high/normal). In `weather.csv`, Temperature and Humidity are **continuous numeric** features (e.g., temperature=85, humidity=90).

For continuous features under the naive Bayesian hypothesis, we assume they follow a continuous probability law -- typically a **normal (Gaussian) distribution**. We estimate the parameters (mean mu and standard deviation sigma) from the training data per class, and use the Gaussian probability density function to compute likelihoods.

---

### Q16: Compute 'by hand' the a posteriori probability of each class for the following data sample: `x = ['sunny', 73, 81, 'TRUE']`

**Answer:**

Using Bayes' law: P(class|x) = P(class) * P(x|class) / P(x)

Under the naive hypothesis: P(x|class) = P(x1|class) * P(x2|class) * ... * P(xn|class)

#### Step 1: Load the data and compute prior probabilities

```python noexec
import pandas as pd
from math import sqrt, log

data = 'weather.csv'
df = pd.read_csv(data)

X_train = df.drop(columns=['play'])
Y_train = df['play']
classes = ['no play', 'play']

X_test, y_test = [['sunny', 73, 81, 'TRUE']], [0]

# Prior probabilities
a_priori_prob = [
    len(Y_train[Y_train == y].index) / len(Y_train.index)
    for y in [0, 1]
]
print("A priori probabilities:", a_priori_prob)
# P(no play) = 5/14 = 0.357
# P(play)    = 9/14 = 0.643
```

#### Step 2: Likelihoods for nominal features

```python noexec
# Outlook likelihoods
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

# Windy likelihoods
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

#### Step 3: Likelihoods for continuous features (Normal distribution)

```python noexec
# Temperature: compute mean and standard deviation per class
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

# Using a normal distribution calculator for P(72 <= T <= 74):
likeli_temp_73 = [0.1098, 0.1366]
print("P(temperature in 73 +/- 1):", likeli_temp_73)

# Humidity: same approach
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

# Using a normal distribution calculator for P(80 <= H <= 82):
likeli_hum_81 = [0.0766, 0.0811]
print("P(humidity in 81 +/- 1):", likeli_hum_81)
```

**Parameters of the normal distributions:**

| Feature | Class | mu | sigma |
|---------|-------|------|-------|
| Temperature | no play | 74.6 | 7.06 |
| Temperature | play | 73.0 | 5.81 |
| Humidity | no play | 86.2 | 8.70 |
| Humidity | play | 79.11 | 9.63 |

#### Step 4: Combine with Bayes' theorem

```python noexec
# Likelihood = product of all individual likelihoods (naive hypothesis)
likelihood = [
    likeli_hum_81[y] * likeli_temp_73[y]
    * likeli_windy[y][X_test[0][3] == 'TRUE']
    * likeli_outlook[y][X_test[0][0]]
    for y in [0, 1]
]
print("Likelihood:", likelihood)
# no play: 0.0766 * 0.1098 * 0.6 * 0.6 = 0.003028
# play:    0.0811 * 0.1366 * 0.333 * 0.222 = 0.000821

# A posteriori = prior * likelihood
proba = [likelihood[y] * a_priori_prob[y] for y in [0, 1]]

# Normalize by P(x) = sum of products
# Since {play=0, play=1} is a partition, P(x) = P(x|0)*P(0) + P(x|1)*P(1)
proba = [val / sum(proba) for val in proba]
print("A posteriori probabilities:", proba)
print("Prediction:", classes[proba.index(max(proba))])
```

**Expected output:**
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

**Explanation:**
- Although the prior probability favors "play" (64.3% vs 35.7%), the likelihoods reverse the prediction.
- The combination "sunny" + "windy=TRUE" is strongly associated with "no play" (P=0.6 each vs 0.222 and 0.333 for "play").
- Temperature (73) is close to the mean of both classes, so not very discriminating.
- Humidity (81) is closer to the "play" mean (79) than "no play" mean (86), but this effect is dominated by the nominal features.
- Final ratio P(no play)/P(play) = 0.672/0.328 ~ 2:1, so the prediction is fairly confident.
- The prediction ("no play") is correct according to the test label.
