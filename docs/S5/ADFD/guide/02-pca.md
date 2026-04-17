---
title: "Chapter 2: PCA -- Principal Component Analysis (Analyse en Composantes Principales)"
sidebar_position: 2
---

# Chapter 2: PCA -- Principal Component Analysis (Analyse en Composantes Principales)

## Overview

PCA (ACP in French) is the central technique of the Data Analysis (AD) part of the course. It transforms a set of correlated variables into a smaller set of uncorrelated variables called **principal components** (composantes principales), while preserving as much variance (information) as possible.

**French term**: Analyse en Composantes Principales (ACP)

## 1. Why PCA?

| Problem | How PCA Helps |
|---------|--------------|
| Too many variables (curse of dimensionality) | Reduces to 2-3 meaningful dimensions |
| Correlated variables | Creates uncorrelated components |
| Hard to visualize high-dimensional data | Projects onto 2D factorial planes |
| Noise in data | Keeps signal (high-variance directions), discards noise (low-variance) |

**Key insight**: If variables are correlated, the effective dimensionality is lower than the number of variables. PCA finds this lower-dimensional structure.

## 2. Mathematical Foundation

### Step-by-Step Algorithm

**Input**: Data matrix X with n individuals (rows) and p variables (columns).

**Step 1 -- Center (and optionally reduce) the data**

ACP normee (normalized PCA) = center AND standardize. **Required when variables have different units.**

```
X_centered = X - mean(X)           # Centering (centrage)
X_scaled = X_centered / std(X)     # Reduction (reduction)
```

```python noexec
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**Step 2 -- Compute the correlation (or covariance) matrix**

For normalized PCA, this is the correlation matrix R:

```
R = (1/n) * X_scaled^T * X_scaled
```

R is a p x p symmetric matrix where R[i,j] = correlation between variable i and variable j.

**Note**: The `1/n` convention is standard in French data analysis textbooks (ACP normee). In practice, `sklearn.decomposition.PCA` uses `1/(n-1)` (the unbiased sample covariance estimator), but the difference is negligible for large n. For exam purposes, use `1/n`.

**Step 3 -- Compute eigenvalues and eigenvectors**

Solve: R * v = lambda * v

- **Eigenvalues** (valeurs propres) lambda_1 >= lambda_2 >= ... >= lambda_p
- **Eigenvectors** (vecteurs propres) v_1, v_2, ..., v_p

Each eigenvalue represents the variance captured by its corresponding eigenvector direction.

**Step 4 -- Select the number of components**

Keep the first k components that capture enough variance (typically 80-90%).

**Step 5 -- Project the data**

```
PC_scores = X_scaled * V_k    # V_k = matrix of first k eigenvectors
```

### Key Formulas

| Concept | Formula | Meaning |
|---------|---------|---------|
| **Eigenvalue** (valeur propre) | lambda_k | Variance explained by component k |
| **Total inertia** (inertie totale) | Sum of all eigenvalues = p (for normalized PCA) | Total variance in the data |
| **Explained variance ratio** | lambda_k / Sum(lambda_i) | % of information in component k |
| **Cumulative variance** | Sum(lambda_1..k) / Sum(lambda_i) | % of information in first k components |
| **Correlation variable-axis** | r(x_j, F_k) = v_jk * sqrt(lambda_k) | How strongly variable j relates to axis k |
| **Contribution of individual** | (coord_i^2) / (n * lambda_k) | How much individual i contributes to axis k |
| **Quality of representation** (cos^2) | coord_i^2 / Sum(coord_i^2 on all axes) | How well individual i is represented on the retained axes |

## 3. Choosing the Number of Components

Three common rules:

### Rule 1: 80% Variance Rule (most used in this course)
Keep the minimum number of components such that cumulative explained variance >= 80%.

### Rule 2: Kaiser Criterion
Keep components with eigenvalue > 1 (for normalized PCA). Rationale: a component should explain more variance than a single original variable.

### Rule 3: Scree Plot (Diagramme des valeurs propres)
Plot eigenvalues and look for an "elbow" -- a point where the decrease in eigenvalue slows significantly.

```python noexec
pca = PCA()
pca.fit(X_scaled)

# Scree plot
plt.bar(range(1, len(pca.explained_variance_ratio_)+1),
        pca.explained_variance_ratio_ * 100)
plt.xlabel('Component')
plt.ylabel('Explained Variance (%)')
plt.title('Scree Plot')
```

### Example (from TP1 -- City Temperatures)

| Component | Eigenvalue | Variance (%) | Cumulative (%) |
|-----------|-----------|--------------|----------------|
| PC1 | ~8.5 | ~70% | 70% |
| PC2 | ~2.0 | ~17% | 87% |
| PC3 | ~0.7 | ~6% | 93% |
| ... | ... | ... | ... |

**Decision**: 2 components capture ~87% of information -- sufficient for analysis.

## 4. Interpreting the Factorial Plane of Individuals (Plan Factoriel des Individus)

The factorial plane plots each individual (observation) as a point in the space defined by two principal components.

### Reading Rules

1. **Proximity = Similarity**: Individuals close together have similar profiles across all original variables.
2. **Distance from origin**: Individuals far from the center are "extreme" -- they strongly characterize the axes.
3. **Opposition**: Individuals on opposite sides of an axis have opposite behaviors on the variables that define that axis.
4. **Near the origin**: Individuals close to the center are "average" or poorly represented (check cos^2).

### Example (TP1: French Cities by Temperature)

```
                        PC2 (Amplitude thermique)
                         ^
    Grenoble, Lyon       |       Brest
    Strasbourg           |       Rennes, Nantes
    (continental)        |       (oceanique)
    ---------------------+----------------------> PC1 (Temperature moyenne)
    Lille                 |
    Vichy                 |
                          |       Marseille, Nice
                          |       Montpellier, Toulouse
                                  (mediterraneen)
```

**Interpretation**:
- **PC1 (Axis 1, ~70%)**: North-South gradient = average temperature. Cities on the right (Marseille, Nice) are warmer overall. Cities on the left (Lille, Strasbourg) are cooler.
- **PC2 (Axis 2, ~17%)**: East-West gradient = thermal amplitude. Cities at the top (Grenoble, Strasbourg) have large temperature differences between summer and winter. Cities at the bottom (Brest, Rennes) have mild, oceanic climates with small amplitude.

## 5. The Correlation Circle (Cercle des Correlations)

**This is the single most important visualization in the course and the most tested topic on exams.**

The correlation circle plots each original variable as a point within a unit circle. The coordinates are the correlations between the variable and each principal component.

### Reading Rules

1. **Close to the circle edge** (length close to 1): The variable is well represented on these two axes.
2. **Close to an axis**: The variable is strongly correlated with that component.
3. **Two variables close together**: They are positively correlated.
4. **Two variables diametrically opposite**: They are negatively correlated.
5. **Two variables at 90 degrees**: They are uncorrelated (independent).
6. **Close to the origin**: The variable is poorly represented on these axes -- look at other components.

### Computing Correlations (Loadings)

```python noexec
# Method 1: From pca.components_ (true correlation between variable and axis)
loadings = pca.components_.T * np.sqrt(pca.explained_variance_)

# Method 2: Direct correlation formula
# r(x_j, PC_k) = pca.components_[k, j] * sqrt(eigenvalue_k)
```

**Important note about the TP1 notebook**: The `correlation_circle_plotly` function provided in the TP uses `pcs[0, i]` and `pcs[1, i]` (i.e., `pca.components_[k, j]`) directly as coordinates, WITHOUT multiplying by `sqrt(eigenvalue_k)`. This means the arrows represent the eigenvector coordinates (weights in the principal component), not the true correlations. For exam interpretation purposes, use the formula with `sqrt(lambda_k)` for the actual correlation values.

### Drawing the Correlation Circle

```python noexec
fig, ax = plt.subplots(figsize=(8, 8))

# Unit circle
circle = plt.Circle((0, 0), 1, fill=False, color='gray', linestyle='--')
ax.add_patch(circle)

# Plot variables as arrows
for i, var_name in enumerate(variable_names):
    x = loadings[i, 0]  # Correlation with PC1
    y = loadings[i, 1]  # Correlation with PC2
    ax.arrow(0, 0, x, y, head_width=0.05, color='red')
    ax.text(x * 1.15, y * 1.15, var_name, fontsize=10)

ax.set_xlim(-1.2, 1.2)
ax.set_ylim(-1.2, 1.2)
ax.set_xlabel(f'PC1 ({var_explained[0]*100:.1f}%)')
ax.set_ylabel(f'PC2 ({var_explained[1]*100:.1f}%)')
ax.set_aspect('equal')
```

### Example (TP1: Temperature Months)

On the correlation circle for city temperatures:
- **All months point roughly in the same direction on PC1**: All temperatures are positively correlated (warmer cities are warmer in all months).
- **Summer months (Juin, Juillet) are angled toward PC2**: They contribute to the amplitude dimension.
- **Winter months (Decembre, Janvier) are angled away from PC2**: They highlight the oceanic vs continental distinction.
- **March and October sit very close to the PC1 axis**: They are the best "average temperature" proxies.

## 6. Contribution and Quality of Representation

### Contribution of an Individual to an Axis

```
CTR(i, k) = (F_ik)^2 / (n * lambda_k)
```

Where F_ik is the coordinate of individual i on axis k. If CTR > 1/n, the individual contributes more than average.

### Quality of Representation (cos^2)

```
cos^2(i, k) = (F_ik)^2 / sum_j(F_ij)^2
```

A high cos^2 means the individual is well represented on axis k. If cos^2 is low on both retained axes, the individual's position in the factorial plane is unreliable.

### Variable Contributions

For variables, the contribution to an axis is related to the squared correlation with that axis:

```
CTR(var_j, axis_k) = r(x_j, F_k)^2 / lambda_k
```

Since sum_j r(x_j, F_k)^2 = lambda_k (for normalized PCA), this gives a proportion that sums to 1 across all variables for a given axis. A variable contributes significantly if its contribution exceeds 1/p (where p is the number of variables).

**Note on the TP1 notebook**: The `loadings` DataFrame in the TP stores `pca.components_.T` (the eigenvector weights, not the correlations). Squaring these gives the squared weights, which are proportional to contributions since each eigenvector is unit-norm (components sum to 1).

```python noexec
loadings = pd.DataFrame(
    pca.components_.T,
    columns=[f'PC{i+1}' for i in range(n_components)],
    index=variable_names
)

# Contributions = squared loadings
contributions = loadings ** 2
```

## 7. Explaining Axes with Qualitative Variables

After PCA, you can color the factorial plane by a qualitative variable to see if it explains the axes:

```python noexec
# Color by SalePrice (quantitative)
plt.scatter(X_pca[:, 0], X_pca[:, 1], c=df['SalePrice'], cmap='viridis')

# Color by OverallQual (qualitative)
for qual_value in df['OverallQual'].unique():
    mask = df['OverallQual'] == qual_value
    plt.scatter(X_pca[mask, 0], X_pca[mask, 1], label=str(qual_value))
```

From TP1 (House Prices):
- **SalePrice** is correlated with PC2: higher prices appear on one side.
- **OverallQual**: Low quality (1-3) clusters on the left of PC1; high quality (8-10) on the right.
- **Neighborhood**: Does NOT structure the data on PC1/PC2 -- the axes capture surface/structure, not location.

## 8. Connecting PCA to Classification

PCA results can be used as input for clustering (CAH, K-means):

1. Run PCA, keep k components (e.g., 2)
2. Use the PC scores as new variables
3. Apply CAH or K-means on these reduced coordinates

This is the **CAH-MIXTE** method covered in TP2. See [Chapter 3: Clustering](/S5/ADFD/guide/03-clustering).

## Common Pitfalls

1. **Using non-normalized PCA when variables have different units**: Always use ACP normee (StandardScaler) unless all variables are in the same unit.
2. **Confusing PCA components with PCA loadings**: Components are the coordinates of individuals; loadings are the correlations of variables with axes.
3. **Reading the correlation circle for variables close to origin**: If a variable is near the center of the circle, it is NOT well represented on these axes -- do not interpret its position.
4. **Interpreting distance between an individual and a variable**: The factorial plane of individuals and the correlation circle are on different scales. Only compare individuals with individuals, and variables with variables.
5. **Forgetting that PC axes are arbitrary in sign**: The direction (positive/negative) of a PC axis is arbitrary. What matters is relative positioning.

---

## CHEAT SHEET

### PCA Pipeline

```python noexec
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# 1. Standardize
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Fit PCA
pca = PCA(n_components=2)  # or n_components=None for all
X_pca = pca.fit_transform(X_scaled)

# 3. Results
pca.explained_variance_ratio_    # % variance per component
pca.explained_variance_          # eigenvalues
pca.components_                  # eigenvectors (loadings matrix)
np.cumsum(pca.explained_variance_ratio_)  # cumulative variance
```

### Quick Reference Table

| What You Want | How to Get It |
|---------------|--------------|
| Eigenvalues | `pca.explained_variance_` |
| % variance per component | `pca.explained_variance_ratio_` |
| Cumulative variance | `np.cumsum(pca.explained_variance_ratio_)` |
| Individual coordinates on axes | `pca.transform(X_scaled)` or `X_pca` |
| Variable correlations with axes | `pca.components_.T * np.sqrt(pca.explained_variance_)` |
| Contribution of variable to axis k | `(pca.components_.T * np.sqrt(pca.explained_variance_))[:, k]**2` (squared correlations) |

### Key Numbers to Remember

| Rule | Value |
|------|-------|
| Minimum cumulative variance to keep | 80% |
| Kaiser criterion (eigenvalue threshold) | > 1 |
| Good quality of representation (cos^2) | > 0.5 |
| Significant contribution threshold | > 1/p (p = number of variables) |

### Correlation Circle Interpretation Quick Guide

| Position on Circle | Meaning |
|-------------------|---------|
| On the circle edge | Very well represented |
| Close to PC1 axis | Strongly correlated with PC1 |
| Close to PC2 axis | Strongly correlated with PC2 |
| Two variables near each other | Positively correlated |
| Two variables opposite | Negatively correlated |
| Two variables at 90 degrees | Uncorrelated |
| Near center | Poorly represented -- check other axes |

### Exam Keywords (French/English)

| French | English |
|--------|---------|
| Valeur propre | Eigenvalue |
| Vecteur propre | Eigenvector |
| Inertie | Variance / Inertia |
| Cercle des correlations | Correlation circle |
| Plan factoriel | Factorial plane |
| Composante principale | Principal component |
| ACP normee | Normalized PCA (with standardization) |
| Centrer-reduire | Center and scale (standardize) |
| Contribution | Contribution (importance to axis) |
| Qualite de representation | Quality of representation (cos^2) |
| Axe factoriel | Factorial axis / Principal component |
