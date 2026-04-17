---
title: "Chapitre 6 -- Reseaux de neurones"
sidebar_position: 6
---

# Chapitre 6 -- Reseaux de neurones

## 1. Le Perceptron

### Neurone artificiel

Un neurone calcule une somme ponderee des entrees, ajoute un biais, puis applique une fonction d'activation :

$$z = \mathbf{w}^T \mathbf{x} + b, \quad a = g(z)$$

### Perceptron simple (Rosenblatt, 1958)

Le perceptron est un classifieur binaire lineaire :

$$\hat{y} = \begin{cases} 1 & \text{si } \mathbf{w}^T \mathbf{x} + b \geq 0 \\ 0 & \text{sinon} \end{cases}$$

**Regle d'apprentissage du perceptron :**

$$\mathbf{w} \leftarrow \mathbf{w} + \eta (y_i - \hat{y}_i) \mathbf{x}_i$$

**Limitation :** le perceptron ne peut resoudre que des problemes lineairement separables (pas le XOR).

---

## 2. Perceptron multi-couches (MLP)

### Architecture

Un MLP est compose de :
- **Couche d'entree** : $p$ neurones (un par feature).
- **Couche(s) cachee(s)** : $n_h$ neurones avec fonctions d'activation non lineaires.
- **Couche de sortie** : $K$ neurones (un par classe en classification, 1 en regression).

### Propagation avant (Forward Pass)

Pour un MLP a une couche cachee :

$$\mathbf{h} = g_1(\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1)$$
$$\hat{\mathbf{y}} = g_2(\mathbf{W}_2 \mathbf{h} + \mathbf{b}_2)$$

- $\mathbf{W}_1$ : matrice de poids entree -> cache (taille $n_h \times p$).
- $\mathbf{W}_2$ : matrice de poids cache -> sortie (taille $K \times n_h$).
- $g_1, g_2$ : fonctions d'activation.

---

## 3. Fonctions d'activation

| Fonction | Formule | Plage | Usage |
|----------|---------|-------|-------|
| **Sigmoide** | $\sigma(z) = \frac{1}{1+e^{-z}}$ | $(0, 1)$ | Sortie binaire |
| **Tanh** | $\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}$ | $(-1, 1)$ | Couches cachees (ancien) |
| **ReLU** | $\text{ReLU}(z) = \max(0, z)$ | $[0, +\infty)$ | Couches cachees (standard) |
| **Leaky ReLU** | $\max(\alpha z, z)$ avec $\alpha = 0.01$ | $(-\infty, +\infty)$ | Evite "dying ReLU" |
| **Softmax** | $\frac{e^{z_k}}{\sum_j e^{z_j}}$ | $(0, 1)$, somme = 1 | Sortie multiclasse |

### Pourquoi ReLU est standard

- Calcul rapide (pas d'exponentielle).
- Pas de probleme de gradient qui s'evanouit (contrairement a sigmoide/tanh).
- Sparsity naturelle (certains neurones a 0).

---

## 4. Retropropagation (Backpropagation)

### Principe

La retropropagation calcule le gradient de la fonction de cout par rapport a chaque poids en utilisant la **regle de la chaine**, de la couche de sortie vers la couche d'entree.

### Pour la couche de sortie

$$\frac{\partial J}{\partial \mathbf{W}_2} = \frac{\partial J}{\partial \hat{\mathbf{y}}} \cdot \frac{\partial \hat{\mathbf{y}}}{\partial \mathbf{z}_2} \cdot \frac{\partial \mathbf{z}_2}{\partial \mathbf{W}_2}$$

### Pour la couche cachee

$$\frac{\partial J}{\partial \mathbf{W}_1} = \frac{\partial J}{\partial \hat{\mathbf{y}}} \cdot \frac{\partial \hat{\mathbf{y}}}{\partial \mathbf{h}} \cdot \frac{\partial \mathbf{h}}{\partial \mathbf{z}_1} \cdot \frac{\partial \mathbf{z}_1}{\partial \mathbf{W}_1}$$

### Mise a jour

$$\mathbf{W} \leftarrow \mathbf{W} - \eta \frac{\partial J}{\partial \mathbf{W}}$$

---

## 5. Entrainement en pratique

### Hyperparametres principaux

| Hyperparametre | Valeurs typiques | Effet |
|---------------|------------------|-------|
| **Learning rate** $\eta$ | 0.001 a 0.01 | Trop grand: diverge. Trop petit: lent. |
| **Nb couches cachees** | 1 a 3 | Plus = plus expressif mais plus lent |
| **Nb neurones par couche** | 32, 64, 128, 256 | Plus = plus expressif mais overfitting |
| **Batch size** | 32, 64, 128 | Plus grand = plus stable mais plus lent |
| **Epochs** | 10 a 100+ | Plus = meilleur fit, risque overfitting |

### Techniques de regularisation

- **Dropout** : desactiver aleatoirement une fraction des neurones pendant l'entrainement.
- **Early stopping** : arreter quand l'erreur de validation commence a augmenter.
- **L2 regularisation** : penaliser les grands poids.
- **Batch normalization** : normaliser les activations entre couches.

### Optimiseurs

| Optimiseur | Avantage |
|-----------|----------|
| **SGD** | Simple, facile a comprendre |
| **SGD + Momentum** | Accelere la convergence |
| **Adam** | Adaptatif, bon par defaut |
| **RMSprop** | Bon pour les RNN |

---

## 6. Code Python -- MLP avec scikit-learn

```python
from sklearn.neural_network import MLPClassifier
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# 1. Charger
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.3, random_state=42
)

# 2. Pipeline
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('mlp', MLPClassifier(
        hidden_layer_sizes=(100,),     # une couche cachee de 100 neurones
        activation='relu',
        solver='adam',
        max_iter=500,
        random_state=42
    ))
])

# 3. Entrainer et evaluer
pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)
print(classification_report(y_test, y_pred, target_names=data.target_names))
```

---

## 7. Code Python -- CNN avec TensorFlow/Keras (TP4 du cours)

Le TP4 du cours utilise TensorFlow pour la reconnaissance d'images (CIFAR-10) :

```python
import tensorflow as tf
from sklearn.metrics import classification_report, accuracy_score

# Perceptron simple
def perceptron(nbhidden=100):
    entree = tf.keras.Input(shape=(3072,))  # 32*32*3 pixels aplatis
    hidden = tf.keras.layers.Dense(units=nbhidden, activation='relu')(entree)
    sortie = tf.keras.layers.Dense(units=10, activation='softmax')(hidden)
    model = tf.keras.Model(inputs=entree, outputs=sortie)
    model.compile(
        loss='sparse_categorical_crossentropy',
        optimizer='adam',
        metrics=['accuracy']
    )
    return model

# CNN (Convolutional Neural Network)
def cnn():
    entree = tf.keras.Input(shape=(32, 32, 3))
    layer = tf.keras.layers.Conv2D(32, kernel_size=(5,5), activation='relu')(entree)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2))(layer)
    layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), activation='relu')(layer)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2))(layer)
    layer = tf.keras.layers.Dropout(0.37)(layer)
    layer = tf.keras.layers.Flatten()(layer)
    layer = tf.keras.layers.Dense(10000, activation='relu')(layer)
    out = tf.keras.layers.Dense(10, activation='softmax')(layer)
    model = tf.keras.Model(inputs=entree, outputs=out)
    model.compile(
        loss='sparse_categorical_crossentropy',
        optimizer='adam',
        metrics=['accuracy']
    )
    return model

# Entrainement
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
x_train, x_test = x_train / 255.0, x_test / 255.0  # normalisation [0,1]

clf = cnn()
clf.fit(x_train, y_train, epochs=20, batch_size=51)
predictions = clf.predict(x_test).argmax(-1)
print(f"Accuracy : {accuracy_score(y_test, predictions):.3f}")
```

### Architecture du CNN (TP)

**Note :** le code source du TP (`tp_nn.py`) contient en realite 3 couches Conv2D (32, 64, 128 filtres), mais avec un bug ou les couches 2 et 3 sont connectees a `entree` au lieu de `layer`. La version ci-dessous corrige ce bug et correspond a une architecture sequentielle standard avec 2 couches convolutives.

| Couche | Type | Sortie | Parametres |
|--------|------|--------|-----------|
| Entree | Input | 32x32x3 | - |
| Conv2D | Convolution | 28x28x32 | kernel 5x5, 32 filtres |
| MaxPool | Pooling | 14x14x32 | pool 2x2 |
| Conv2D | Convolution | 10x10x64 | kernel 5x5, 64 filtres |
| MaxPool | Pooling | 5x5x64 | pool 2x2 |
| Dropout | Regularisation | 5x5x64 | p=0.37 |
| Flatten | Aplatir | 1600 | - |
| Dense | Fully connected | 10000 | ReLU |
| Dense | Sortie | 10 | Softmax |

---

## 8. Pieges classiques

- **Oublier de normaliser les entrees** : les reseaux de neurones sont tres sensibles a l'echelle. Toujours normaliser entre [0,1] ou standardiser.
- **Trop de neurones/couches** : overfitting rapide. Commencer simple et augmenter progressivement.
- **Learning rate mal choisi** : commencer avec 0.001 (defaut Adam), ajuster si necessaire.
- **Ne pas utiliser de validation** : surveiller la loss de validation pour detecter l'overfitting.
- **Confondre MLP et CNN** : MLP traite des vecteurs 1D, CNN traite des grilles 2D/3D (images).
- **Sigmoide en couche cachee** : utiliser ReLU (sigmoide cause le vanishing gradient).

---

## CHEAT SHEET

```
PERCEPTRON
  y = g(w^T x + b)
  Mise a jour : w = w + eta * (y - y_hat) * x

MLP
  h = relu(W1 @ x + b1)
  y_hat = softmax(W2 @ h + b2)
  Entrainement : backpropagation + descente de gradient

ACTIVATIONS
  ReLU    : max(0, z)     -- couches cachees (standard)
  Sigmoide : 1/(1+exp(-z)) -- sortie binaire
  Softmax  : exp(zk)/sum(exp(zj)) -- sortie multiclasse

BACKPROPAGATION
  1. Forward : calculer les sorties couche par couche
  2. Backward : calculer les gradients de la sortie vers l'entree
  3. Update : w = w - eta * dJ/dw

REGULARISATION
  Dropout : desactiver p% des neurones (ex: 0.2 a 0.5)
  Early stopping : arreter quand val_loss augmente
  L2 : penaliser ||w||^2

SKLEARN
  MLPClassifier(hidden_layer_sizes=(100,), activation='relu', solver='adam')

TENSORFLOW/KERAS
  Dense(units, activation='relu')
  Conv2D(filters, kernel_size, activation='relu')
  MaxPooling2D(pool_size)
  Dropout(rate)
  model.compile(loss='sparse_categorical_crossentropy', optimizer='adam')
  model.fit(x_train, y_train, epochs=20, batch_size=64)
```
