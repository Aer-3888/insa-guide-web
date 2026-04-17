---
title: "TP4: Neural Networks and CNNs with TensorFlow/Keras"
sidebar_position: 4
---

# TP4: Neural Networks and CNNs with TensorFlow/Keras

## Overview
This practical introduces neural networks and convolutional neural networks (CNNs) for image classification. Using the CIFAR-10 dataset, we compare simple perceptrons with deep CNNs to understand the power of deep learning for computer vision.

## Dataset: CIFAR-10
**Problem**: Classify 32x32 color images into 10 categories

### Dataset Specifications
- **Training samples**: 50,000 images
- **Test samples**: 10,000 images
- **Image dimensions**: 32×32 pixels, 3 color channels (RGB)
- **Classes** (10): airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck
- **Input representation**: 
  - Perceptron: Flattened vector (3072 values)
  - CNN: 3D tensor (32×32×3)

### Data Preprocessing
```python
# Load data
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()

# Normalize pixel values to [0, 1]
x_train = x_train / 255.0
x_test = x_test / 255.0

# Reshape for perceptron (flatten)
x_train_flat = x_train.reshape(50000, 3072)

# Reshape for CNN (preserve spatial structure)
x_train_cnn = x_train.reshape(50000, 32, 32, 3)
```

## Models Implemented

### 1. Simple Perceptron (Multi-Layer Perceptron)
**Architecture**:
```
Input (3072) → Dense(nbhidden, ReLU) → Dense(10, Softmax)
```

**Configuration**:
- Input: Flattened image (3072 pixels)
- Hidden layer: Variable size (e.g., 100, 1000, 10000 neurons)
- Output: 10 classes with softmax activation
- Loss: Sparse categorical crossentropy
- Optimizer: Adam

**Python Implementation**:
```python
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

**Training**:
```python
clf = perceptron(100000)
clf.fit(x_train, y_train, epochs=20, batch_size=51)
```

**Characteristics**:
- Treats image as unstructured vector
- No spatial awareness
- Fully connected (many parameters)
- Limited performance on visual tasks

**Expected Results**:
- Accuracy: ~45-55% (depending on hidden layer size)
- Struggles with spatial patterns
- Requires large hidden layers for decent performance

### 2. Convolutional Neural Network (CNN)
**Architecture**:
```
Input (32×32×3)
→ Conv2D(32, 5×5, ReLU) → MaxPool(2×2)
→ Conv2D(64, 5×5, ReLU) → MaxPool(2×2)
→ Conv2D(128, 5×5, ReLU) → MaxPool(2×2)
→ Dropout(0.37)
→ Flatten()
→ Dense(10000, ReLU)
→ Dense(10, Softmax)
```

**Configuration Details**:
- **Conv layers**: Extract spatial features
  - Layer 1: 32 filters, 5×5 kernels
  - Layer 2: 64 filters, 5×5 kernels
  - Layer 3: 128 filters, 5×5 kernels
- **MaxPooling**: Downsample feature maps (2×2)
- **Dropout**: Regularization (37% dropout rate)
- **Dense layers**: Classification head (10,000 → 10 neurons)

**Python Implementation**:
```python
def cnn():
    entree = tf.keras.Input(shape=(32,32,3))
    
    # First conv block
    layer = tf.keras.layers.Conv2D(32, kernel_size=(5,5), 
                                   strides=(1,1), activation='relu')(entree)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), 
                                         strides=(2,2))(layer)
    
    # Second conv block
    layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), 
                                   activation='relu')(layer)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2))(layer)
    
    # Third conv block
    layer = tf.keras.layers.Conv2D(128, kernel_size=(5,5), 
                                   activation='relu')(layer)
    layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), 
                                         strides=(2,2))(layer)
    
    # Regularization
    layer = tf.keras.layers.Dropout(0.37)(layer)
    
    # Classification head
    layer = tf.keras.layers.Flatten()(layer)
    layer = tf.keras.layers.Dense(10000, activation='relu')(layer)
    out = tf.keras.layers.Dense(10, activation='softmax')(layer)
    
    model = tf.keras.Model(inputs=entree, outputs=out)
    model.compile(loss='sparse_categorical_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])
    return model
```

**Training**:
```python
clf = cnn()
clf.fit(x_train, y_train, epochs=20, batch_size=51)
```

**Characteristics**:
- Preserves spatial structure
- Local connectivity (filters)
- Parameter sharing (fewer parameters than fully connected)
- Hierarchical feature learning (edges → textures → objects)

**Expected Results**:
- Accuracy: ~70-80% (significantly better than perceptron)
- Learns spatial patterns effectively
- More robust to translations and small distortions

## Key Concepts

### Why CNNs Outperform Perceptrons for Images

1. **Spatial Structure**:
   - Perceptron: Treats pixels as independent features
   - CNN: Preserves 2D structure, exploits local correlations

2. **Parameter Efficiency**:
   - Perceptron: O(width × height × channels × neurons) parameters
   - CNN: O(kernel_size² × channels × filters) parameters
   - Weight sharing reduces overfitting

3. **Translation Invariance**:
   - Convolution detects features regardless of position
   - MaxPooling provides robustness to small shifts

4. **Hierarchical Features**:
   - Layer 1: Edges, colors
   - Layer 2: Textures, patterns
   - Layer 3: Object parts
   - Dense layers: Full object recognition

### Convolutional Layer Mechanics
```
Input: 32×32×3 image
Conv2D(32 filters, 5×5): Produces 32 feature maps
Each filter learns a specific pattern (edge detector, color blob, etc.)
MaxPooling(2×2): Reduces spatial dimensions by 2× (16×16)
```

### Dropout Regularization
- Randomly deactivates 37% of neurons during training
- Prevents co-adaptation of features
- Reduces overfitting
- Not applied during inference

## GPU Memory Management
The code includes GPU memory growth configuration to prevent TensorFlow from reserving all GPU memory:

```python
import tensorflow as tf
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)
```

## Model Evaluation
```python
# Predict on test set
predictions = clf.predict(x_test).argmax(-1)

# Classification report (precision, recall, F1 per class)
print(classification_report(y_test, predictions))

# Overall accuracy
print('accuracy_score=', accuracy_score(y_test, predictions))
```

## Architecture Experiments

### Perceptron Variants
Try different hidden layer sizes:
```python
perceptron(100)       # Small: Fast but low accuracy
perceptron(1000)      # Medium: Balance
perceptron(100000)    # Large: Slow but better accuracy
```

### CNN Variants
**Original Architecture** (in code):
```
Conv2D(32, 5×5) → MaxPool → Conv2D(64, 5×5) → MaxPool → 
Conv2D(128, 5×5) → MaxPool → Dropout → Dense(10000) → Dense(10)
```

**Note**: There's a bug in the original code! Layer 2 and 3 incorrectly use `entree` instead of `layer`:
```python
# BUG (line 30, 32):
layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), 
                               activation='relu')(entree)  # Should be (layer)!
```

**Corrected Architecture**:
```python
# Layer 2 should take output from Layer 1
layer = tf.keras.layers.Conv2D(64, kernel_size=(5,5), 
                               activation='relu')(layer)  # Fixed!
```

### Commented Alternative
The code includes a commented 4-layer variant:
```python
# layer = tf.keras.layers.Conv2D(256, kernel_size=(3,3), 
#                                activation='relu')(layer)
# layer = tf.keras.layers.MaxPooling2D(pool_size=(2,2), 
#                                      strides=(2,2))(layer)
```

## Performance Comparison

| Model | Accuracy | Training Time | Parameters |
|-------|----------|---------------|------------|
| Perceptron (100) | ~45% | Fast | ~300K |
| Perceptron (10000) | ~50% | Medium | ~30M |
| CNN (3 conv layers) | ~75-80% | Slow (GPU: Fast) | ~5-10M |

**Key Takeaway**: CNNs achieve much better accuracy with fewer parameters due to structural assumptions about images.

## Files
- `tp_nn.py`: Complete implementation of perceptron and CNN models
- Dataset loaded automatically via `tf.keras.datasets.cifar10`

## Running the Code
```bash
# Install dependencies
pip install tensorflow numpy scikit-learn

# Run with CPU
python tp_nn.py

# Run with GPU (if available)
python tp_nn.py

# The script will:
# 1. Load CIFAR-10 dataset
# 2. Train CNN for 20 epochs
# 3. Print classification report
# 4. Print final accuracy
```

## Expected Output
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

## Exercises

### Exercise 1: Compare Architectures
1. Train perceptron with different hidden layer sizes
2. Train CNN with original architecture
3. Compare test accuracies

**Expected Finding**: CNN >> Perceptron even with massive hidden layers

### Exercise 2: Fix the Bug
1. Identify the bug in lines 30-32 (using `entree` instead of `layer`)
2. Fix it and retrain
3. Observe performance improvement

**Expected Improvement**: ~5-10% accuracy gain with corrected architecture

### Exercise 3: Hyperparameter Tuning
Experiment with:
- Number of filters (16, 32, 64, 128, 256)
- Kernel sizes (3×3, 5×5, 7×7)
- Dropout rate (0.2, 0.4, 0.5)
- Dense layer size (1000, 5000, 10000)
- Batch size (32, 64, 128)
- Learning rate (use `Adam(learning_rate=0.001)`)

### Exercise 4: Add Batch Normalization
Insert batch norm after convolutions:
```python
layer = tf.keras.layers.Conv2D(32, (5,5), activation='relu')(entree)
layer = tf.keras.layers.BatchNormalization()(layer)
layer = tf.keras.layers.MaxPooling2D((2,2))(layer)
```

**Expected**: Faster convergence, slight accuracy improvement

### Exercise 5: Data Augmentation
Add random transformations during training:
```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True
)

clf.fit(datagen.flow(x_train, y_train, batch_size=51), epochs=20)
```

**Expected**: Better generalization, higher test accuracy

## Common Issues

### GPU Out of Memory
- Reduce batch size
- Reduce dense layer size
- Enable memory growth (already in code)

### Slow Training on CPU
- Use GPU if available
- Reduce model size
- Reduce number of epochs

### Overfitting
- Add more dropout
- Reduce model capacity
- Use data augmentation
- Use early stopping

## Advanced Topics (Beyond Scope)
- ResNet (skip connections)
- Transfer learning (pre-trained models)
- Learning rate scheduling
- Advanced optimizers (SGD with momentum, RMSprop)
- Mixed precision training

## Learning Outcomes
1. Understand difference between perceptrons and CNNs
2. Implement and train deep learning models with Keras
3. Use TensorFlow/Keras functional API
4. Apply CNNs to image classification
5. Interpret convolutional layers and feature maps
6. Use dropout for regularization
7. Debug neural network architectures
8. Evaluate models with classification reports
