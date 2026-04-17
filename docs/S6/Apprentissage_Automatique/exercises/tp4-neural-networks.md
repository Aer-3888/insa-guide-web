---
title: "TP4 - Neural Networks and CNNs with TensorFlow/Keras"
sidebar_position: 4
---

# TP4 - Neural Networks and CNNs with TensorFlow/Keras

> Following teacher instructions from: `data/moodle/tp/tp4_neural_networks/tp_nn.py` and `data/moodle/tp/tp4_neural_networks/README.md`

---

## Dataset: CIFAR-10

| Property | Value |
|----------|-------|
| Training images | 50,000 |
| Test images | 10,000 |
| Dimensions | 32 x 32 pixels, 3 channels (RGB) |
| Classes (10) | airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck |
| Flattened vector size | 32 * 32 * 3 = 3072 |
| Balance | 5000 images/class (train), 1000/class (test) |

---

## Exercise 1: Loading and Preprocessing CIFAR-10

### Load the dataset, normalize pixel values, and prepare both flat and spatial representations.

**Answer:**

```python
#!/usr/bin/python3

# Prevent TensorFlow from reserving all GPU memory
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

# Load CIFAR-10
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
print('x_train.shape=', x_train.shape)
print('x_test.shape=', x_test.shape)

# Normalize pixel values from [0, 255] to [0.0, 1.0]
x_train = x_train / 255.0
x_test = x_test / 255.0
```

**Expected output:**
```
x_train.shape= (50000, 32, 32, 3)
x_test.shape= (10000, 32, 32, 3)
```

**Explanation:** Normalizing pixels to [0, 1] helps the optimizer (Adam) converge faster, prevents neuron saturation, and improves numerical stability. Without normalization, training is very slow or unstable.

### Reshape for each model type

```python
# For the Perceptron: flatten each image into a vector of 3072 values
x_train_flat = x_train.reshape(50000, 3072)
x_test_flat = x_test.reshape(10000, 3072)

# For the CNN: preserve the spatial structure (32x32x3 tensor)
x_train_cnn = x_train.reshape(50000, 32, 32, 3)
x_test_cnn = x_test.reshape(10000, 32, 32, 3)

print('x_train_flat.shape=', x_train_flat.shape)
print('x_train_cnn.shape=', x_train_cnn.shape)
```

**Expected output:**
```
x_train_flat.shape= (50000, 3072)
x_train_cnn.shape= (50000, 32, 32, 3)
```

---

## Exercise 2: Simple Perceptron (Multi-Layer Perceptron)

### Implement a perceptron with one hidden layer, train it on CIFAR-10, and evaluate.

**Answer:**

```python
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

**Architecture:**
```
Input (3072) --> Dense(nbhidden, ReLU) --> Dense(10, Softmax) --> Output
```

**Line-by-line explanation:**

| Line | Role |
|------|------|
| `tf.keras.Input(shape=(3072,))` | Input layer. The image is flattened into a vector of 3072 values (32*32*3). |
| `Dense(units=nbhidden, activation='relu')` | Hidden layer with `nbhidden` neurons and ReLU activation. Each neuron computes a linear combination of ALL 3072 inputs, then applies max(0, x). |
| `Dense(units=10, activation='softmax')` | Output layer with 10 neurons (one per class). Softmax converts the 10 values into probabilities summing to 1. |
| `sparse_categorical_crossentropy` | Loss function for multiclass classification. "Sparse" means labels are integers (0-9), not one-hot vectors. |
| `adam` | Adaptive optimizer combining momentum and RMSprop. Good default, converges faster than plain SGD. |

### Training

```python
clf = perceptron(100000)
clf.fit(x_train_flat, y_train, epochs=20, batch_size=51)
```

**Training parameters:**
- `epochs=20`: the model sees the entire training set 20 times.
- `batch_size=51`: at each step, the model processes 51 images and updates its weights. About 980 batches per epoch (50000/51).

### Evaluation

```python
predictions = clf.predict(x_test_flat).argmax(-1)
print(classification_report(y_test, predictions))
print('accuracy_score=', accuracy_score(y_test, predictions))
```

**`argmax(-1)` explained:** For each image, the model outputs a vector of 10 probabilities. `argmax(-1)` returns the index of the neuron with the highest probability, which corresponds to the predicted class number (0=airplane, 1=automobile, ..., 9=truck).

**Expected results for different hidden layer sizes:**

| nbhidden | Test Accuracy | Parameters | Comment |
|----------|--------------|------------|---------|
| 100 | ~40-45% | ~308K | Minimum viable |
| 1,000 | ~48-52% | ~3M | Marginal improvement |
| 10,000 | ~50-53% | ~30M | Diminishing returns |
| 100,000 | ~50-55% | ~308M | Massive overfitting likely |

**Expected output (nbhidden=100000, 20 epochs):**
```
              precision    recall  f1-score   support

           0       0.55      0.62      0.58      1000
           1       0.62      0.65      0.63      1000
           2       0.38      0.35      0.36      1000
           3       0.35      0.30      0.32      1000
           ...
    accuracy                           0.50     10000
```

**Explanation:** Even with 100,000 hidden neurons (307 million parameters), the MLP cannot exceed ~55% on CIFAR-10. The problem is not model capacity but architecture: by flattening the image, all spatial structure is lost. Pixel (0,0) is treated identically to pixel (31,31), even though they have no spatial relationship. The gap between train accuracy (~92%) and test accuracy (~50%) indicates **massive overfitting**.

---

## Exercise 3: Convolutional Neural Network (CNN)

### Implement a CNN that preserves spatial structure. Note: identify and fix the bug in the original code.

**Answer:**

### The bug in the original code (`tp_nn.py`)

The original source file contains a **bug on lines 30 and 32**. The 2nd and 3rd Conv2D layers are connected to `entree` (the input) instead of `layer` (the previous layer's output):

```python
# BUGGY CODE (lines 28-33 of tp_nn.py):
layer = tf.keras.layers.Conv2D(32, kernel_size=(5,5), strides=(1,1), activation='relu')(entree)
layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), strides=(2,2))(layer)
layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), activation='relu')(entree)   # BUG! Should be (layer)
layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2))(layer)
layer = tf.keras.layers.Conv2D(128, kernel_size=(5,5), activation='relu')(entree)  # BUG! Should be (layer)
layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), strides=(2,2))(layer)
```

This creates an architecture where all 3 conv blocks are connected directly to the input independently. Only the 3rd block (128 filters) feeds into the rest -- the first two blocks are completely ignored.

### Corrected CNN

```python
def cnn():
    entree = tf.keras.Input(shape=(32, 32, 3))

    # First conv block
    layer = tf.keras.layers.Conv2D(
        32, kernel_size=(5, 5), strides=(1, 1), activation='relu'
    )(entree)
    layer = tf.keras.layers.MaxPooling2D(
        pool_size=(2, 2), strides=(2, 2)
    )(layer)

    # Second conv block (FIXED: takes layer, not entree)
    layer = tf.keras.layers.Conv2D(
        64, kernel_size=(5, 5), activation='relu'
    )(layer)
    layer = tf.keras.layers.MaxPooling2D(
        pool_size=(2, 2)
    )(layer)

    # Third conv block (FIXED: takes layer, not entree)
    layer = tf.keras.layers.Conv2D(
        128, kernel_size=(5, 5), activation='relu'
    )(layer)
    layer = tf.keras.layers.MaxPooling2D(
        pool_size=(2, 2), strides=(2, 2)
    )(layer)

    # Regularization
    layer = tf.keras.layers.Dropout(0.37)(layer)

    # Classification head
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

**Architecture:**
```
Input (32x32x3)
  --> Conv2D(32, 5x5, ReLU) --> MaxPooling2D(2x2)
  --> Conv2D(64, 5x5, ReLU) --> MaxPooling2D(2x2)
  --> Conv2D(128, 5x5, ReLU) --> MaxPooling2D(2x2)
  --> Dropout(0.37)
  --> Flatten()
  --> Dense(10000, ReLU)
  --> Dense(10, Softmax)
  --> Output
```

**Layer-by-layer explanation:**

| Layer | Input | Output | Parameters | Role |
|-------|-------|--------|-----------|------|
| Conv2D(32, (5,5)) | 32x32x3 | 28x28x32 | 2,432 | Detects 32 local 5x5 patterns (edges, corners, simple textures) |
| MaxPooling2D(2,2) | 28x28x32 | 14x14x32 | 0 | Halves spatial resolution, keeps max activations |
| Conv2D(64, (5,5)) | 14x14x32 | 10x10x64 | 51,264 | Detects 64 intermediate patterns (complex textures, object parts) |
| MaxPooling2D(2,2) | 10x10x64 | 5x5x64 | 0 | Spatial reduction |
| Conv2D(128, (5,5)) | 5x5x64 | 1x1x128 | 204,928 | Detects 128 high-level patterns. Output is 1x1 because 5x5 kernel exactly covers 5x5 input. |
| MaxPooling2D(2,2) | 1x1x128 | 1x1x128 | 0 | No effect (already 1x1) |
| Dropout(0.37) | 1x1x128 | 1x1x128 | 0 | Randomly disables 37% of neurons during training |
| Flatten() | 1x1x128 | 128 | 0 | Converts 3D tensor to 1D vector |
| Dense(10000, relu) | 128 | 10000 | 1.29M | Non-linear classification head |
| Dense(10, softmax) | 10000 | 10 | 100K | Final probabilities for 10 classes |

**Total parameters:** ~1.65M (much less than the MLP with 100K neurons which has ~308M)

### Training and evaluation

```python
clf = cnn()
clf.fit(x_train_cnn, y_train, epochs=20, batch_size=51)

predictions = clf.predict(x_test_cnn).argmax(-1)
print(classification_report(y_test, predictions))
print('accuracy_score=', accuracy_score(y_test, predictions))
```

**Expected output (corrected architecture, 20 epochs):**
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

**Explanation:**
- **~78% accuracy** on test (vs ~50% for MLP): a massive +28 point improvement.
- Classes "cat" (3) and "dog" (5) remain the hardest (visual similarity, confusion between them).
- "automobile" (1), "ship" (8), "truck" (9) are well classified (distinctive geometric shapes).
- The train/test gap is much smaller than for the MLP thanks to dropout and the more efficient architecture.

---

## Exercise 4: Complete Main Function

### Putting it all together: the complete `main()` function as in `tp_nn.py`.

**Answer:**

```python
def main():
    # Load CIFAR-10
    (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
    print('x_train.shape=', x_train.shape)
    print('x_test.shape=', x_test.shape)

    # Normalize
    x_train = x_train / 255.0
    x_test = x_test / 255.0

    # For perceptron: represent each image as a vector of 3072 pixels
    # x_train = x_train.reshape(50000, 3072)
    # x_test = x_test.reshape(10000, 3072)

    # For CNN: represent each image as a 32x32x3 tensor
    x_train = x_train.reshape(50000, 32, 32, 3)
    x_test = x_test.reshape(10000, 32, 32, 3)
    print('x_train.shape=', x_train.shape)
    print('x_test.shape=', x_test.shape)

    # Choose the model: cnn() or perceptron(100000)
    clf = cnn()
    clf.fit(x_train, y_train, epochs=20, batch_size=51)

    # argmax picks the active neuron (the predicted class number)
    predictions = clf.predict(x_test).argmax(-1)

    print(classification_report(y_test, predictions))  # Error details
    print('accuracy_score=', accuracy_score(y_test, predictions))  # Score to maximize

if __name__ == "__main__":
    main()
```

**Expected output:**
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

## Exercise 5: Comparison -- Why CNNs Outperform Perceptrons for Images

### Compare the perceptron with different hidden layer sizes against the CNN.

**Answer:**

```python
# MLP with different sizes
for hidden in [100, 1000, 10000, 100000]:
    clf = perceptron(hidden)
    x_train_flat = x_train.reshape(50000, 3072)
    x_test_flat = x_test.reshape(10000, 3072)
    clf.fit(x_train_flat, y_train, epochs=10, batch_size=64)
    predictions = clf.predict(x_test_flat).argmax(-1)
    acc = accuracy_score(y_test, predictions)
    print(f"MLP(hidden={hidden}) -> {acc:.3f}")

# CNN (corrected)
clf = cnn()
x_train_cnn = x_train.reshape(50000, 32, 32, 3)
x_test_cnn = x_test.reshape(10000, 32, 32, 3)
clf.fit(x_train_cnn, y_train, epochs=10, batch_size=64)
predictions = clf.predict(x_test_cnn).argmax(-1)
acc = accuracy_score(y_test, predictions)
print(f"CNN -> {acc:.3f}")
```

**Expected results:**

| Model | Input Shape | Parameters | Test Accuracy | Overfitting |
|-------|-------------|-----------|---------------|-------------|
| MLP (100 hidden) | 3072 (flat) | ~308K | ~40-45% | Mild |
| MLP (1000 hidden) | 3072 (flat) | ~3M | ~48-52% | Moderate |
| MLP (100K hidden) | 3072 (flat) | ~308M | ~50-55% | Severe (train ~92%, test ~50%) |
| **CNN (3 conv + dense)** | 32x32x3 | ~1.65M | **~75-80%** | Moderate (train ~88%, test ~78%) |

### Why the CNN wins

**1. Spatial structure preservation.**
The MLP treats pixel (0,0) and pixel (31,31) as independent features with no spatial relationship. The CNN applies local 5x5 filters that capture neighborhood patterns (edges, textures, shapes).

**2. Parameter sharing (weight sharing).**
A Conv2D filter is applied across the entire image with the same weights. A 5x5x3 filter has only 75 parameters but is applied at 784 positions (28x28). The MLP needs a separate weight for every pixel-to-neuron connection.

**3. Translation invariance.**
A filter that detects a vertical edge detects it regardless of its position in the image. The MLP must learn "vertical edge at top-left", "vertical edge at center", etc. separately.

**4. Hierarchical features.**
- Layer 1 (32 filters): simple features (edges, corners, color blobs)
- Layer 2 (64 filters): combines simple features into textures and complex patterns
- Layer 3 (128 filters): object parts (wheels, wings, legs)
- Dense layers: combines everything for final classification

**5. Parameter efficiency.**
The CNN has 200x fewer parameters than the MLP but achieves much better results. Fewer parameters = less overfitting risk = better generalization.

---

## Key Concepts Reference

### Convolution 2D

A filter (kernel) of size KxK slides over the image pixel by pixel. At each position, it computes the dot product between the filter and the local patch:

```
Output[i,j] = sum(Filter * Image[i:i+K, j:j+K]) + bias
```

With K=5, strides=(1,1), no padding: a 32x32 image produces a 28x28 feature map (32-5+1=28).

### Max Pooling

Reduces resolution by taking the maximum value in each window:
```
MaxPool(2,2) on 28x28 --> 14x14
Each 2x2 window is reduced to 1 pixel (the max of 4)
```

Advantages: reduces parameters in subsequent layers, introduces slight translation invariance.

### Dropout

During **training only**, each neuron is deactivated with probability p (here 0.37). This forces the network to learn redundant, robust representations and prevents co-adaptation. During **inference** (predict), all neurons are active, and weights are scaled by (1-p) to compensate.

### Softmax

Converts a vector of raw values (logits) into probabilities:

```
softmax(z_i) = exp(z_i) / sum(exp(z_j) for j in 1..10)
```

The 10 outputs sum to 1. The predicted class is the one with the highest probability (argmax).

### Sparse Categorical Crossentropy

Loss function for multiclass classification with integer labels:

```
L = -log(p_predicted_for_true_class)
```

If the true class is "cat" (3) and the model predicts P(cat) = 0.2, the loss is -log(0.2) = 1.61. If P(cat) = 0.95, the loss is -log(0.95) = 0.05. "Sparse" means labels are integers, not one-hot vectors.

### Adam Optimizer

Adaptive optimizer combining momentum (smooths gradient updates) and RMSprop (adapts learning rate per parameter). Converges faster than plain SGD, good default learning rate of 0.001.
