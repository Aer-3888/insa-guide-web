---
title: "Chapter 1: Data Preprocessing (Pretraitement des donnees)"
sidebar_position: 1
---

# Chapter 1: Data Preprocessing (Pretraitement des donnees)

## Overview

Data preprocessing is the first and most critical step in any data analysis or mining pipeline. Real-world data is almost never clean -- it contains missing values, outliers, inconsistencies, and biases. The quality of your analysis depends entirely on the quality of your preprocessing.

**French term**: Pretraitement des donnees

## 1. The Data Analysis Pipeline

```
Raw Data --> Preprocessing --> Analysis (PCA, Clustering) --> Interpretation --> Knowledge
```

The preprocessing stage includes:
1. Understanding the data (types, distributions, dimensions)
2. Handling missing values (valeurs manquantes)
3. Detecting and treating outliers (points aberrants / valeurs aberrantes)
4. Transforming variables (normalization, log transforms, encoding)
5. Selecting or extracting relevant variables (reduction de dimension)

## 2. Types of Variables

| Type | French | Examples | Operations |
|------|--------|----------|------------|
| **Quantitative continuous** | Quantitative continue | Temperature, height, price | Mean, std, correlation |
| **Quantitative discrete** | Quantitative discrete | Number of rooms, count | Mode, frequency |
| **Qualitative ordinal** | Qualitative ordinale | Quality rating (1-10), education level | Median, rank |
| **Qualitative nominal** | Qualitative nominale | Color, city, gender | Mode, frequency |

**Key point for exams**: Variables coded as integers (e.g., OverallQual = 1-10) may actually be categorical (qualitative), not numerical. Always check semantics, not just dtype.

## 3. Missing Values (Valeurs Manquantes)

### Detection

```python
# Count missing values per column
df.isnull().sum()

# Percentage of missing values
(df.isnull().sum() / len(df)) * 100

# Visualize missing patterns
import seaborn as sns
sns.heatmap(df.isnull(), cbar=True)
```

### Treatment Strategies

| Strategy | French | When to Use | Code |
|----------|--------|-------------|------|
| **Drop rows** | Suppression des lignes | Very few missing values (<5%) | `df.dropna()` |
| **Drop columns** | Suppression des colonnes | Column has >50% missing | `df.drop(columns=[...])` |
| **Mean imputation** | Imputation par la moyenne | Numerical, symmetric distribution | `SimpleImputer(strategy="mean")` |
| **Median imputation** | Imputation par la mediane | Numerical, skewed distribution | `SimpleImputer(strategy="median")` |
| **Mode imputation** | Imputation par le mode | Categorical variables | `SimpleImputer(strategy="most_frequent")` |
| **Constant imputation** | Imputation par constante | Specific domain logic | `SimpleImputer(strategy="constant", fill_value=0)` |

### Worked Example (from TP1)

The House Prices dataset has 81 variables. Missing value analysis reveals:

```
PoolQC         99.5%   --> Drop (too many missing)
MiscFeature    96.3%   --> Drop
Alley          93.8%   --> Drop
Fence          80.8%   --> Drop
MasVnrType     59.7%   --> Consider context
LotFrontage    17.7%   --> Impute with median
GarageYrBlt     5.5%   --> Impute with median
MasVnrArea      0.55%  --> Impute with median (only 8 values)
```

**Decision rule**: If a column has >50% missing values, it carries little information -- dropping is usually best. For numerical columns with <20% missing, median imputation is the standard approach.

```python
from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy="median")
df_imputed = pd.DataFrame(
    imputer.fit_transform(df_num),
    columns=df_num.columns,
    index=df_num.index
)
```

## 4. Outliers (Points Aberrants)

### Detection Methods

**1. Percentile-based (used in the course)**:
```python
q99 = df.quantile(0.99)
mask = (df <= q99).all(axis=1)
df_clean = df[mask]
```

**2. IQR (Interquartile Range)**:
```python
Q1 = df.quantile(0.25)
Q3 = df.quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
mask = ((df >= lower) & (df <= upper)).all(axis=1)
```

**3. Z-score**: Points with |z| > 3 are considered outliers.
```python
from scipy import stats
z_scores = np.abs(stats.zscore(df))
mask = (z_scores < 3).all(axis=1)
```

### Treatment

- **Remove**: When outliers are errors or extreme noise
- **Cap/Floor** (winsorize): Replace extreme values with the percentile boundary
- **Log transform**: Reduces the impact of extreme values

### Worked Example (from TP1)

Before removing outliers: 1460 observations
After removing 99th percentile outliers: 1326 observations (~9% removed)

Impact on linear regression:
- RMSE without cleaning: ~$39,280
- RMSE with cleaning: ~$32,393
- **Improvement: ~$6,888 reduction in prediction error**

## 5. Variable Transformations

### Standardization (Standardisation / Centrage-Reduction)

**Essential for PCA.** Centers data to mean=0 and scales to std=1.

Formula: `z = (x - mean) / std`

```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**When to use**: Always before PCA (ACP normee) and when variables have different units or scales.

### Log Transform (Transformation Logarithmique)

Used for right-skewed distributions (many small values, few large values).

```python
# log1p = log(1 + x), handles zeros
df_log = np.log1p(df[cols_to_log])
```

**Common use case**: Area variables (LotArea, GarageArea), price variables, count data.

**Pitfall**: Zero-inflated variables (like WoodDeckSF where 52% of values are 0) will have a spike at log(1) = 0 after transformation. This is normal but should be noted.

### Encoding Categorical Variables

| Method | Use Case | Example |
|--------|----------|---------|
| **One-hot encoding** | Nominal variables with few categories | `pd.get_dummies(df, columns=['Color'])` |
| **Label encoding** | Ordinal variables | `LabelEncoder().fit_transform(df['Quality'])` |
| **Target encoding** | High-cardinality categorical with target | Mean of target per category |

## 6. Variable Selection (Selection de Variables)

The course presents four families of methods:

### Filter Methods (Methodes a base de filtres)
- Independent of the learning algorithm
- Fast but moderate performance
- Examples: **Variance threshold**, **Correlation filter**, **Mutual Information**

### Wrapper Methods (Methodes enveloppantes)
- Depend on the learning model
- Expensive but good performance
- Examples: **Forward selection**, **Backward elimination**, **Exhaustive search**

### Embedded Methods (Methodes integrees)
- Selection happens during learning
- Compromise between speed and performance
- Examples: **Decision tree-based selection**, **Lasso**, **Ridge**, **Elastic Net**

### Hybrid Methods (Methodes hybrides)
- Combine filter + wrapper or filter + embedded
- Examples: **Permutation importance**, **Recursive Feature Elimination**

## 7. Variable Extraction (Extraction de Variables)

Instead of selecting existing variables, create new ones that summarize the data:

| Method | Description | Use Case |
|--------|-------------|----------|
| **PCA** | Linear projection maximizing variance | General-purpose, continuous data |
| **t-SNE** | Non-linear embedding for visualization | High-dimensional data visualization |

PCA is covered in detail in [Chapter 2](/S5/ADFD/guide/02-pca).

## Common Pitfalls

1. **Imputing before splitting train/test**: Imputation should be fit on training data only, then applied to test data to avoid data leakage.
2. **Forgetting to standardize before PCA**: PCA on non-standardized data will be dominated by variables with larger scales.
3. **Dropping too many rows**: If dropping NaN removes >10% of data, consider imputation instead.
4. **Treating integer-coded categoricals as numerical**: Always check the semantic meaning of variables.
5. **Applying log transform to zero or negative values**: Use `log1p` (log(1+x)) for data containing zeros.

---

## CHEAT SHEET

### Missing Values Quick Reference

| Situation | Action |
|-----------|--------|
| Column >50% missing | Drop column |
| Numerical, <20% missing | Impute with median |
| Categorical, <20% missing | Impute with mode |
| Few rows affected (<5%) | Drop rows |
| Structured pattern | Investigate cause first |

### Key Formulas

| Transform | Formula | Python |
|-----------|---------|--------|
| Standardize | z = (x - mu) / sigma | `StandardScaler()` |
| Min-Max | x' = (x - min) / (max - min) | `MinMaxScaler()` |
| Log | x' = log(1 + x) | `np.log1p(x)` |
| Z-score outlier | \|z\| > 3 is outlier | `stats.zscore(x)` |
| IQR outlier | x < Q1 - 1.5*IQR or x > Q3 + 1.5*IQR | Manual calculation |

### Preprocessing Pipeline

```python
# 1. Load
df = pd.read_csv("data.csv")

# 2. Explore
df.info()
df.describe()
df.isnull().sum()

# 3. Handle missing values
imputer = SimpleImputer(strategy="median")
df_imputed = imputer.fit_transform(df_num)

# 4. Remove outliers
q99 = df.quantile(0.99)
df_clean = df[(df <= q99).all(axis=1)]

# 5. Transform skewed variables
df_clean[cols] = np.log1p(df_clean[cols])

# 6. Standardize (for PCA)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df_clean)
```
