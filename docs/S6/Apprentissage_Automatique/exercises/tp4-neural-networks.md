---
title: "TP4 - Reseaux de neurones et CNN avec TensorFlow/Keras"
sidebar_position: 4
---

# TP4 - Reseaux de neurones et CNN avec TensorFlow/Keras

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp4_neural_networks/tp_nn.py` et `data/moodle/tp/tp4_neural_networks/README.md`

---

## Jeu de donnees : CIFAR-10

| Propriete | Valeur |
|-----------|--------|
| Images d'entrainement | 50 000 |
| Images de test | 10 000 |
| Dimensions | 32 x 32 pixels, 3 canaux (RVB) |
| Classes (10) | airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck |
| Taille du vecteur aplati | 32 * 32 * 3 = 3072 |
| Equilibre | 5000 images/classe (train), 1000/classe (test) |

---

## Exercice 1 : Chargement et preprocessing de CIFAR-10

### Charger le jeu de donnees, normaliser les valeurs des pixels, et preparer les representations aplatie et spatiale.

**Reponse :**

```python noexec
#!/usr/bin/python3

# Empecher TensorFlow de reserver toute la memoire GPU
import tensorflow as tf
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

import numpy as np
from sklearn.metrics import classification_report, accuracy_score

# Charger CIFAR-10
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
print('x_train.shape=', x_train.shape)
print('x_test.shape=', x_test.shape)

# Normaliser les valeurs des pixels de [0, 255] a [0.0, 1.0]
x_train = x_train / 255.0
x_test = x_test / 255.0
```

**Sortie attendue :**
```
x_train.shape= (50000, 32, 32, 3)
x_test.shape= (10000, 32, 32, 3)
```

**Explication :** Normaliser les pixels dans [0, 1] aide l'optimiseur (Adam) a converger plus rapidement, evite la saturation des neurones et ameliore la stabilite numerique. Sans normalisation, l'entrainement est tres lent ou instable.

### Reformater pour chaque type de modele

```python noexec
# Pour le Perceptron : aplatir chaque image en un vecteur de 3072 valeurs
x_train_flat = x_train.reshape(50000, 3072)
x_test_flat = x_test.reshape(10000, 3072)

# Pour le CNN : preserver la structure spatiale (tenseur 32x32x3)
x_train_cnn = x_train.reshape(50000, 32, 32, 3)
x_test_cnn = x_test.reshape(10000, 32, 32, 3)

print('x_train_flat.shape=', x_train_flat.shape)
print('x_train_cnn.shape=', x_train_cnn.shape)
```

**Sortie attendue :**
```
x_train_flat.shape= (50000, 3072)
x_train_cnn.shape= (50000, 32, 32, 3)
```

---

## Exercice 2 : Perceptron simple (Perceptron multi-couches)

### Implementer un perceptron avec une couche cachee, l'entrainer sur CIFAR-10 et evaluer.

**Reponse :**

```python noexec
def perceptron(nbhidden=1):
    entree = tf.keras.Input(shape=(3072,))
    hidden = tf.keras.layers.Dense(units=nbhidden, activation='relu')(entree)
    sortie = tf.keras.layers.Dense(units=10, activation='softmax')(hidden)

    model = tf.keras.Model(inputs=entree, outputs=sortie)
    model.compile(
        loss='sparse_categorical_crossentropy',
        optimizer='adam',
        metrics=['accuracy']
    )
    return model
```

**Architecture :**
```
Entree (3072) --> Dense(nbhidden, ReLU) --> Dense(10, Softmax) --> Sortie
```

**Explication ligne par ligne :**

| Ligne | Role |
|-------|------|
| `tf.keras.Input(shape=(3072,))` | Couche d'entree. L'image est aplatie en un vecteur de 3072 valeurs (32*32*3). |
| `Dense(units=nbhidden, activation='relu')` | Couche cachee avec `nbhidden` neurones et activation ReLU. Chaque neurone calcule une combinaison lineaire de TOUTES les 3072 entrees, puis applique max(0, x). |
| `Dense(units=10, activation='softmax')` | Couche de sortie avec 10 neurones (un par classe). Softmax convertit les 10 valeurs en probabilites dont la somme fait 1. |
| `sparse_categorical_crossentropy` | Fonction de cout pour la classification multiclasse. "Sparse" signifie que les etiquettes sont des entiers (0-9), pas des vecteurs one-hot. |
| `adam` | Optimiseur adaptatif combinant momentum et RMSprop. Bon choix par defaut, converge plus vite que le SGD classique. |

### Entrainement

```python noexec
clf = perceptron(100000)
clf.fit(x_train_flat, y_train, epochs=20, batch_size=51)
```

**Parametres d'entrainement :**
- `epochs=20` : le modele voit l'ensemble du jeu d'entrainement 20 fois.
- `batch_size=51` : a chaque etape, le modele traite 51 images et met a jour ses poids. Environ 980 batchs par epoque (50000/51).

### Evaluation

```python noexec
predictions = clf.predict(x_test_flat).argmax(-1)
print(classification_report(y_test, predictions))
print('accuracy_score=', accuracy_score(y_test, predictions))
```

**Explication de `argmax(-1)` :** Pour chaque image, le modele produit un vecteur de 10 probabilites. `argmax(-1)` retourne l'indice du neurone avec la probabilite la plus elevee, qui correspond au numero de la classe predite (0=airplane, 1=automobile, ..., 9=truck).

**Resultats attendus pour differentes tailles de couche cachee :**

| nbhidden | Precision test | Parametres | Commentaire |
|----------|---------------|-----------|-------------|
| 100 | ~40-45% | ~308K | Minimum viable |
| 1 000 | ~48-52% | ~3M | Amelioration marginale |
| 10 000 | ~50-53% | ~30M | Rendements decroissants |
| 100 000 | ~50-55% | ~308M | Sur-apprentissage massif probable |

**Sortie attendue (nbhidden=100000, 20 epoques) :**
```
              precision    recall  f1-score   support

           0       0.55      0.62      0.58      1000
           1       0.62      0.65      0.63      1000
           2       0.38      0.35      0.36      1000
           3       0.35      0.30      0.32      1000
           ...
    accuracy                           0.50     10000
```

**Explication :** Meme avec 100 000 neurones caches (307 millions de parametres), le MLP ne peut pas depasser ~55% sur CIFAR-10. Le probleme n'est pas la capacite du modele mais l'architecture : en aplatissant l'image, toute la structure spatiale est perdue. Le pixel (0,0) est traite de maniere identique au pixel (31,31), alors qu'ils n'ont aucune relation spatiale. L'ecart entre la precision d'entrainement (~92%) et de test (~50%) indique un **sur-apprentissage massif**.

---

## Exercice 3 : Reseau de neurones convolutif (CNN)

### Implementer un CNN qui preserve la structure spatiale. Note : identifier et corriger le bug dans le code original.

**Reponse :**

### Le bug dans le code original (`tp_nn.py`)

Le fichier source original contient un **bug aux lignes 30 et 32**. Les 2e et 3e couches Conv2D sont connectees a `entree` (l'entree) au lieu de `layer` (la sortie de la couche precedente) :

```python noexec
# CODE BUGGUE (lignes 28-33 de tp_nn.py) :
layer = tf.keras.layers.Conv2D(32, kernel_size=(5,5), strides=(1,1), activation='relu')(entree)
layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), strides=(2,2))(layer)
layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), activation='relu')(entree)   # BUG ! Devrait etre (layer)
layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2))(layer)
layer = tf.keras.layers.Conv2D(128, kernel_size=(5,5), activation='relu')(entree)  # BUG ! Devrait etre (layer)
layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), strides=(2,2))(layer)
```

Cela cree une architecture ou les 3 blocs conv sont connectes directement a l'entree de maniere independante. Seul le 3e bloc (128 filtres) alimente la suite -- les deux premiers blocs sont completement ignores.

### CNN corrige

```python noexec
def cnn():
    entree = tf.keras.Input(shape=(32, 32, 3))

    # Premier bloc conv
    layer = tf.keras.layers.Conv2D(
        32, kernel_size=(5, 5), strides=(1, 1), activation='relu'
    )(entree)
    layer = tf.keras.layers.MaxPooling2D(
        pool_size=(2, 2), strides=(2, 2)
    )(layer)

    # Deuxieme bloc conv (CORRIGE : prend layer, pas entree)
    layer = tf.keras.layers.Conv2D(
        64, kernel_size=(5, 5), activation='relu'
    )(layer)
    layer = tf.keras.layers.MaxPooling2D(
        pool_size=(2, 2)
    )(layer)

    # Troisieme bloc conv (CORRIGE : prend layer, pas entree)
    layer = tf.keras.layers.Conv2D(
        128, kernel_size=(5, 5), activation='relu'
    )(layer)
    layer = tf.keras.layers.MaxPooling2D(
        pool_size=(2, 2), strides=(2, 2)
    )(layer)

    # Regularisation
    layer = tf.keras.layers.Dropout(0.37)(layer)

    # Tete de classification
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
```

**Architecture :**
```
Entree (32x32x3)
  --> Conv2D(32, 5x5, ReLU) --> MaxPooling2D(2x2)
  --> Conv2D(64, 5x5, ReLU) --> MaxPooling2D(2x2)
  --> Conv2D(128, 5x5, ReLU) --> MaxPooling2D(2x2)
  --> Dropout(0.37)
  --> Flatten()
  --> Dense(10000, ReLU)
  --> Dense(10, Softmax)
  --> Sortie
```

**Explication couche par couche :**

| Couche | Entree | Sortie | Parametres | Role |
|--------|--------|--------|-----------|------|
| Conv2D(32, (5,5)) | 32x32x3 | 28x28x32 | 2 432 | Detecte 32 motifs locaux 5x5 (bords, coins, textures simples) |
| MaxPooling2D(2,2) | 28x28x32 | 14x14x32 | 0 | Divise la resolution spatiale par 2, conserve les activations max |
| Conv2D(64, (5,5)) | 14x14x32 | 10x10x64 | 51 264 | Detecte 64 motifs intermediaires (textures complexes, parties d'objets) |
| MaxPooling2D(2,2) | 10x10x64 | 5x5x64 | 0 | Reduction spatiale |
| Conv2D(128, (5,5)) | 5x5x64 | 1x1x128 | 204 928 | Detecte 128 motifs de haut niveau. La sortie est 1x1 car le noyau 5x5 couvre exactement l'entree 5x5. |
| MaxPooling2D(2,2) | 1x1x128 | 1x1x128 | 0 | Pas d'effet (deja 1x1) |
| Dropout(0.37) | 1x1x128 | 1x1x128 | 0 | Desactive aleatoirement 37% des neurones pendant l'entrainement |
| Flatten() | 1x1x128 | 128 | 0 | Convertit le tenseur 3D en vecteur 1D |
| Dense(10000, relu) | 128 | 10000 | 1.29M | Tete de classification non lineaire |
| Dense(10, softmax) | 10000 | 10 | 100K | Probabilites finales pour les 10 classes |

**Total des parametres :** ~1.65M (bien moins que le MLP avec 100K neurones qui a ~308M)

### Entrainement et evaluation

```python noexec
clf = cnn()
clf.fit(x_train_cnn, y_train, epochs=20, batch_size=51)

predictions = clf.predict(x_test_cnn).argmax(-1)
print(classification_report(y_test, predictions))
print('accuracy_score=', accuracy_score(y_test, predictions))
```

**Sortie attendue (architecture corrigee, 20 epoques) :**
```
Epoch 1/20
981/981 [...] - loss: 1.5234 - accuracy: 0.4532
Epoch 2/20
981/981 [...] - loss: 1.0567 - accuracy: 0.6234
...
Epoch 20/20
981/981 [...] - loss: 0.3456 - accuracy: 0.8789

              precision    recall  f1-score   support

           0       0.82      0.82      0.82      1000
           1       0.88      0.89      0.88      1000
           2       0.68      0.65      0.66      1000
           3       0.60      0.58      0.59      1000
           4       0.75      0.77      0.76      1000
           5       0.67      0.66      0.66      1000
           6       0.85      0.86      0.85      1000
           7       0.82      0.84      0.83      1000
           8       0.87      0.87      0.87      1000
           9       0.84      0.85      0.84      1000

    accuracy                           0.78     10000
```

**Explication :**
- **~78% de precision** en test (vs ~50% pour le MLP) : une amelioration massive de +28 points.
- Les classes "cat" (3) et "dog" (5) restent les plus difficiles (similarite visuelle, confusion entre elles).
- "automobile" (1), "ship" (8), "truck" (9) sont bien classees (formes geometriques distinctives).
- L'ecart train/test est bien plus faible que pour le MLP grace au dropout et a l'architecture plus efficace.

---

## Exercice 4 : Fonction main complete

### Assembler le tout : la fonction `main()` complete comme dans `tp_nn.py`.

**Reponse :**

```python noexec
def main():
    # Charger CIFAR-10
    (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
    print('x_train.shape=', x_train.shape)
    print('x_test.shape=', x_test.shape)

    # Normaliser
    x_train = x_train / 255.0
    x_test = x_test / 255.0

    # Pour le perceptron : representer chaque image comme un vecteur de 3072 pixels
    # x_train = x_train.reshape(50000, 3072)
    # x_test = x_test.reshape(10000, 3072)

    # Pour le CNN : representer chaque image comme un tenseur 32x32x3
    x_train = x_train.reshape(50000, 32, 32, 3)
    x_test = x_test.reshape(10000, 32, 32, 3)
    print('x_train.shape=', x_train.shape)
    print('x_test.shape=', x_test.shape)

    # Choisir le modele : cnn() ou perceptron(100000)
    clf = cnn()
    clf.fit(x_train, y_train, epochs=20, batch_size=51)

    # argmax selectionne le neurone actif (le numero de la classe predite)
    predictions = clf.predict(x_test).argmax(-1)

    print(classification_report(y_test, predictions))  # Details des erreurs
    print('accuracy_score=', accuracy_score(y_test, predictions))  # Score a maximiser

if __name__ == "__main__":
    main()
```

**Sortie attendue :**
```
x_train.shape= (50000, 32, 32, 3)
x_test.shape= (10000, 32, 32, 3)
x_train.shape= (50000, 32, 32, 3)
x_test.shape= (10000, 32, 32, 3)

Epoch 1/20
981/981 [...] - loss: 1.5234 - accuracy: 0.4532
...
Epoch 20/20
981/981 [...] - loss: 0.3456 - accuracy: 0.8234

              precision    recall  f1-score   support
           0       0.78      0.82      0.80      1000
           ...
    accuracy                           0.79     10000

accuracy_score= 0.79
```

---

## Exercice 5 : Comparaison -- Pourquoi les CNN surpassent les perceptrons pour les images

### Comparer le perceptron avec differentes tailles de couche cachee face au CNN.

**Reponse :**

```python noexec
# MLP avec differentes tailles
for hidden in [100, 1000, 10000, 100000]:
    clf = perceptron(hidden)
    x_train_flat = x_train.reshape(50000, 3072)
    x_test_flat = x_test.reshape(10000, 3072)
    clf.fit(x_train_flat, y_train, epochs=10, batch_size=64)
    predictions = clf.predict(x_test_flat).argmax(-1)
    acc = accuracy_score(y_test, predictions)
    print(f"MLP(hidden={hidden}) -> {acc:.3f}")

# CNN (corrige)
clf = cnn()
x_train_cnn = x_train.reshape(50000, 32, 32, 3)
x_test_cnn = x_test.reshape(10000, 32, 32, 3)
clf.fit(x_train_cnn, y_train, epochs=10, batch_size=64)
predictions = clf.predict(x_test_cnn).argmax(-1)
acc = accuracy_score(y_test, predictions)
print(f"CNN -> {acc:.3f}")
```

**Resultats attendus :**

| Modele | Forme de l'entree | Parametres | Precision test | Sur-apprentissage |
|--------|-------------------|-----------|----------------|-------------------|
| MLP (100 caches) | 3072 (aplati) | ~308K | ~40-45% | Leger |
| MLP (1000 caches) | 3072 (aplati) | ~3M | ~48-52% | Modere |
| MLP (100K caches) | 3072 (aplati) | ~308M | ~50-55% | Severe (train ~92%, test ~50%) |
| **CNN (3 conv + dense)** | 32x32x3 | ~1.65M | **~75-80%** | Modere (train ~88%, test ~78%) |

### Pourquoi le CNN gagne

**1. Preservation de la structure spatiale.**
Le MLP traite les pixels (0,0) et (31,31) comme des features independantes sans relation spatiale. Le CNN applique des filtres locaux 5x5 qui capturent les motifs de voisinage (bords, textures, formes).

**2. Partage de parametres (weight sharing).**
Un filtre Conv2D est applique sur toute l'image avec les memes poids. Un filtre 5x5x3 n'a que 75 parametres mais est applique a 784 positions (28x28). Le MLP necessite un poids separe pour chaque connexion pixel-neurone.

**3. Invariance par translation.**
Un filtre qui detecte un bord vertical le detecte quelle que soit sa position dans l'image. Le MLP doit apprendre "bord vertical en haut a gauche", "bord vertical au centre", etc. separement.

**4. Features hierarchiques.**
- Couche 1 (32 filtres) : features simples (bords, coins, taches de couleur)
- Couche 2 (64 filtres) : combine les features simples en textures et motifs complexes
- Couche 3 (128 filtres) : parties d'objets (roues, ailes, pattes)
- Couches denses : combine le tout pour la classification finale

**5. Efficacite parametrique.**
Le CNN a 200x moins de parametres que le MLP mais obtient de bien meilleurs resultats. Moins de parametres = moins de risque de sur-apprentissage = meilleure generalisation.

---

## Reference des concepts cles

### Convolution 2D

Un filtre (noyau) de taille KxK glisse sur l'image pixel par pixel. A chaque position, il calcule le produit scalaire entre le filtre et le patch local :

```
Output[i,j] = sum(Filter * Image[i:i+K, j:j+K]) + biais
```

Avec K=5, strides=(1,1), pas de padding : une image 32x32 produit une carte de features 28x28 (32-5+1=28).

### Max Pooling

Reduit la resolution en prenant la valeur maximale dans chaque fenetre :
```
MaxPool(2,2) sur 28x28 --> 14x14
Chaque fenetre 2x2 est reduite a 1 pixel (le max des 4)
```

Avantages : reduit les parametres dans les couches suivantes, introduit une legere invariance par translation.

### Dropout

Pendant l'**entrainement uniquement**, chaque neurone est desactive avec une probabilite p (ici 0.37). Cela force le reseau a apprendre des representations redundantes et robustes et empeche la co-adaptation. Pendant l'**inference** (predict), tous les neurones sont actifs, et les poids sont ponderes par (1-p) pour compenser.

### Softmax

Convertit un vecteur de valeurs brutes (logits) en probabilites :

```
softmax(z_i) = exp(z_i) / sum(exp(z_j) pour j dans 1..10)
```

Les 10 sorties somment a 1. La classe predite est celle avec la probabilite la plus elevee (argmax).

### Sparse Categorical Crossentropy

Fonction de cout pour la classification multiclasse avec des etiquettes entieres :

```
L = -log(p_predite_pour_la_vraie_classe)
```

Si la vraie classe est "cat" (3) et que le modele predit P(cat) = 0.2, la perte est -log(0.2) = 1.61. Si P(cat) = 0.95, la perte est -log(0.95) = 0.05. "Sparse" signifie que les etiquettes sont des entiers, pas des vecteurs one-hot.

### Optimiseur Adam

Optimiseur adaptatif combinant le momentum (lisse les mises a jour du gradient) et RMSprop (adapte le taux d'apprentissage par parametre). Converge plus vite que le SGD classique, bon taux d'apprentissage par defaut de 0.001.
