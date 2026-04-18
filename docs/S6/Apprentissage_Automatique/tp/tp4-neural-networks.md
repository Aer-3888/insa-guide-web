---
title: "TP4 : Reseaux de neurones et CNN avec TensorFlow/Keras"
sidebar_position: 4
---

# TP4 : Reseaux de neurones et CNN avec TensorFlow/Keras

## Presentation
Ce TP introduit les reseaux de neurones et les reseaux de neurones convolutifs (CNN) pour la classification d'images. En utilisant le jeu de donnees CIFAR-10, on compare des perceptrons simples avec des CNN profonds pour comprendre la puissance du deep learning en vision par ordinateur.

## Jeu de donnees : CIFAR-10
**Probleme** : Classer des images couleur 32x32 en 10 categories

### Specifications du jeu de donnees
- **Echantillons d'entrainement** : 50 000 images
- **Echantillons de test** : 10 000 images
- **Dimensions des images** : 32x32 pixels, 3 canaux couleur (RVB)
- **Classes** (10) : airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck
- **Representation de l'entree** :
  - Perceptron : Vecteur aplati (3072 valeurs)
  - CNN : Tenseur 3D (32x32x3)

### Preprocessing des donnees
```python noexec
# Charger les donnees
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()

# Normaliser les valeurs des pixels dans [0, 1]
x_train = x_train / 255.0
x_test = x_test / 255.0

# Reformater pour le perceptron (aplatir)
x_train_flat = x_train.reshape(50000, 3072)

# Reformater pour le CNN (preserver la structure spatiale)
x_train_cnn = x_train.reshape(50000, 32, 32, 3)
```

## Modeles implementes

### 1. Perceptron simple (Perceptron multi-couches)
**Architecture** :
```
Entree (3072) -> Dense(nbhidden, ReLU) -> Dense(10, Softmax)
```

**Configuration** :
- Entree : Image aplatie (3072 pixels)
- Couche cachee : Taille variable (ex : 100, 1000, 10000 neurones)
- Sortie : 10 classes avec activation softmax
- Cout : Sparse categorical crossentropy
- Optimiseur : Adam

**Implementation Python** :
```python noexec
def perceptron(nbhidden=1):
    entree = tf.keras.Input(shape=(3072,))
    hidden = tf.keras.layers.Dense(units=nbhidden, activation='relu')(entree)
    sortie = tf.keras.layers.Dense(units=10, activation='softmax')(hidden)
    
    model = tf.keras.Model(inputs=entree, outputs=sortie)
    model.compile(loss='sparse_categorical_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])
    return model
```

**Entrainement** :
```python noexec
clf = perceptron(100000)
clf.fit(x_train, y_train, epochs=20, batch_size=51)
```

**Caracteristiques** :
- Traite l'image comme un vecteur non structure
- Pas de conscience spatiale
- Entierement connecte (beaucoup de parametres)
- Performance limitee sur les taches visuelles

**Resultats attendus** :
- Precision : ~45-55% (selon la taille de la couche cachee)
- Difficulte avec les motifs spatiaux
- Necessite de grandes couches cachees pour une performance acceptable

### 2. Reseau de neurones convolutif (CNN)
**Architecture** :
```
Entree (32x32x3)
-> Conv2D(32, 5x5, ReLU) -> MaxPool(2x2)
-> Conv2D(64, 5x5, ReLU) -> MaxPool(2x2)
-> Conv2D(128, 5x5, ReLU) -> MaxPool(2x2)
-> Dropout(0.37)
-> Flatten()
-> Dense(10000, ReLU)
-> Dense(10, Softmax)
```

**Details de configuration** :
- **Couches conv** : Extraction de features spatiales
  - Couche 1 : 32 filtres, noyaux 5x5
  - Couche 2 : 64 filtres, noyaux 5x5
  - Couche 3 : 128 filtres, noyaux 5x5
- **MaxPooling** : Sous-echantillonnage des cartes de features (2x2)
- **Dropout** : Regularisation (taux de dropout de 37%)
- **Couches denses** : Tete de classification (10 000 -> 10 neurones)

**Implementation Python** :
```python noexec
def cnn():
    entree = tf.keras.Input(shape=(32,32,3))
    
    # Premier bloc conv
    layer = tf.keras.layers.Conv2D(32, kernel_size=(5,5), 
                                   strides=(1,1), activation='relu')(entree)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), 
                                         strides=(2,2))(layer)
    
    # Deuxieme bloc conv
    layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), 
                                   activation='relu')(layer)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2))(layer)
    
    # Troisieme bloc conv
    layer = tf.keras.layers.Conv2D(128, kernel_size=(5,5), 
                                   activation='relu')(layer)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), 
                                         strides=(2,2))(layer)
    
    # Regularisation
    layer = tf.keras.layers.Dropout(0.37)(layer)
    
    # Tete de classification
    layer = tf.keras.layers.Flatten()(layer)
    layer = tf.keras.layers.Dense(10000, activation='relu')(layer)
    out = tf.keras.layers.Dense(10, activation='softmax')(layer)
    
    model = tf.keras.Model(inputs=entree, outputs=out)
    model.compile(loss='sparse_categorical_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])
    return model
```

**Entrainement** :
```python noexec
clf = cnn()
clf.fit(x_train, y_train, epochs=20, batch_size=51)
```

**Caracteristiques** :
- Preserve la structure spatiale
- Connectivite locale (filtres)
- Partage de parametres (moins de parametres qu'un reseau entierement connecte)
- Apprentissage hierarchique de features (bords -> textures -> objets)

**Resultats attendus** :
- Precision : ~70-80% (significativement meilleur que le perceptron)
- Apprend les motifs spatiaux efficacement
- Plus robuste aux translations et petites distorsions

## Concepts cles

### Pourquoi les CNN surpassent les perceptrons pour les images

1. **Structure spatiale** :
   - Perceptron : Traite les pixels comme des features independantes
   - CNN : Preserve la structure 2D, exploite les correlations locales

2. **Efficacite parametrique** :
   - Perceptron : O(largeur x hauteur x canaux x neurones) parametres
   - CNN : O(taille_noyau^2 x canaux x filtres) parametres
   - Le partage de poids reduit le sur-apprentissage

3. **Invariance par translation** :
   - La convolution detecte les features quelle que soit leur position
   - Le MaxPooling apporte une robustesse aux petits decalages

4. **Features hierarchiques** :
   - Couche 1 : Bords, couleurs
   - Couche 2 : Textures, motifs
   - Couche 3 : Parties d'objets
   - Couches denses : Reconnaissance complete d'objets

### Mecanique de la couche convolutive
```
Entree : image 32x32x3
Conv2D(32 filtres, 5x5) : Produit 32 cartes de features
Chaque filtre apprend un motif specifique (detecteur de bord, tache de couleur, etc.)
MaxPooling(2x2) : Reduit les dimensions spatiales par 2 (16x16)
```

### Regularisation par Dropout
- Desactive aleatoirement 37% des neurones pendant l'entrainement
- Empeche la co-adaptation des features
- Reduit le sur-apprentissage
- Non applique pendant l'inference

## Gestion de la memoire GPU
Le code inclut une configuration de croissance memoire GPU pour empecher TensorFlow de reserver toute la memoire GPU :

```python noexec
import tensorflow as tf
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)
```

## Evaluation du modele
```python noexec
# Predire sur le jeu de test
predictions = clf.predict(x_test).argmax(-1)

# Rapport de classification (precision, rappel, F1 par classe)
print(classification_report(y_test, predictions))

# Precision globale
print('accuracy_score=', accuracy_score(y_test, predictions))
```

## Experiences d'architecture

### Variantes du perceptron
Essayer differentes tailles de couche cachee :
```python noexec
perceptron(100)       # Petit : Rapide mais faible precision
perceptron(1000)      # Moyen : Equilibre
perceptron(100000)    # Grand : Lent mais meilleure precision
```

### Variantes du CNN
**Architecture originale** (dans le code) :
```
Conv2D(32, 5x5) -> MaxPool -> Conv2D(64, 5x5) -> MaxPool -> 
Conv2D(128, 5x5) -> MaxPool -> Dropout -> Dense(10000) -> Dense(10)
```

**Note** : Il y a un bug dans le code original ! Les couches 2 et 3 utilisent incorrectement `entree` au lieu de `layer` :
```python noexec
# BUG (ligne 30, 32) :
layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), 
                               activation='relu')(entree)  # Devrait etre (layer) !
```

**Architecture corrigee** :
```python noexec
# La couche 2 doit prendre la sortie de la couche 1
layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), 
                               activation='relu')(layer)  # Corrige !
```

### Variante alternative commentee
Le code inclut une variante a 4 couches commentee :
```python noexec
# layer = tf.keras.layers.Conv2D(256, kernel_size=(3,3), 
#                                activation='relu')(layer)
# layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), 
#                                      strides=(2,2))(layer)
```

## Comparaison des performances

| Modele | Precision | Temps d'entrainement | Parametres |
|--------|-----------|---------------------|-----------|
| Perceptron (100) | ~45% | Rapide | ~300K |
| Perceptron (10000) | ~50% | Moyen | ~30M |
| CNN (3 couches conv) | ~75-80% | Lent (GPU : Rapide) | ~5-10M |

**Point cle** : Les CNN atteignent une bien meilleure precision avec moins de parametres grace aux hypotheses structurelles sur les images.

## Fichiers
- `tp_nn.py` : Implementation complete des modeles perceptron et CNN
- Jeu de donnees charge automatiquement via `tf.keras.datasets.cifar10`

## Lancer le code
```bash noexec
# Installer les dependances
pip install tensorflow numpy scikit-learn

# Lancer avec CPU
python tp_nn.py

# Lancer avec GPU (si disponible)
python tp_nn.py

# Le script va :
# 1. Charger le jeu de donnees CIFAR-10
# 2. Entrainer le CNN pendant 20 epoques
# 3. Afficher le rapport de classification
# 4. Afficher la precision finale
```

## Sortie attendue
```
x_train.shape= (50000, 32, 32, 3)
x_test.shape= (10000, 32, 32, 3)

Epoch 1/20
981/981 [...] - loss: 1.5234 - accuracy: 0.4532
Epoch 2/20
981/981 [...] - loss: 1.2145 - accuracy: 0.5678
...
Epoch 20/20
981/981 [...] - loss: 0.3456 - accuracy: 0.8234

              precision    recall  f1-score   support
           0       0.78      0.82      0.80      1000
           1       0.85      0.88      0.86      1000
           ...
    accuracy                           0.79     10000
```

## Exercices

### Exercice 1 : Comparer les architectures
1. Entrainer le perceptron avec differentes tailles de couche cachee
2. Entrainer le CNN avec l'architecture originale
3. Comparer les precisions sur le test

**Resultat attendu** : CNN >> Perceptron meme avec des couches cachees massives

### Exercice 2 : Corriger le bug
1. Identifier le bug aux lignes 30-32 (utilisation de `entree` au lieu de `layer`)
2. Le corriger et re-entrainer
3. Observer l'amelioration de la performance

**Amelioration attendue** : ~5-10% de gain de precision avec l'architecture corrigee

### Exercice 3 : Reglage des hyperparametres
Experimenter avec :
- Nombre de filtres (16, 32, 64, 128, 256)
- Taille des noyaux (3x3, 5x5, 7x7)
- Taux de dropout (0.2, 0.4, 0.5)
- Taille de la couche dense (1000, 5000, 10000)
- Taille de batch (32, 64, 128)
- Taux d'apprentissage (utiliser `Adam(learning_rate=0.001)`)

### Exercice 4 : Ajouter la normalisation par batch
Inserer une batch normalization apres les convolutions :
```python noexec
layer = tf.keras.layers.Conv2D(32, (5,5), activation='relu')(entree)
layer = tf.keras.layers.BatchNormalization()(layer)
layer = tf.keras.layers.MaxPooling2D((2,2))(layer)
```

**Attendu** : Convergence plus rapide, legere amelioration de la precision

### Exercice 5 : Augmentation de donnees
Ajouter des transformations aleatoires pendant l'entrainement :
```python noexec
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True
)

clf.fit(datagen.flow(x_train, y_train, batch_size=51), epochs=20)
```

**Attendu** : Meilleure generalisation, precision de test plus elevee

## Problemes courants

### Memoire GPU insuffisante
- Reduire la taille de batch
- Reduire la taille de la couche dense
- Activer la croissance memoire (deja dans le code)

### Entrainement lent sur CPU
- Utiliser un GPU si disponible
- Reduire la taille du modele
- Reduire le nombre d'epoques

### Sur-apprentissage
- Ajouter plus de dropout
- Reduire la capacite du modele
- Utiliser l'augmentation de donnees
- Utiliser l'early stopping

## Sujets avances (hors programme)
- ResNet (connexions residuelles)
- Transfer learning (modeles pre-entraines)
- Planification du taux d'apprentissage
- Optimiseurs avances (SGD avec momentum, RMSprop)
- Entrainement en precision mixte

## Objectifs d'apprentissage
1. Comprendre la difference entre perceptrons et CNN
2. Implementer et entrainer des modeles de deep learning avec Keras
3. Utiliser l'API fonctionnelle de TensorFlow/Keras
4. Appliquer les CNN a la classification d'images
5. Interpreter les couches convolutives et les cartes de features
6. Utiliser le dropout pour la regularisation
7. Debugger les architectures de reseaux de neurones
8. Evaluer les modeles avec des rapports de classification
