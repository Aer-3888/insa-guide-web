---
title: "Chapter 3: Clustering Methods (Methodes de Classification Non Supervisee)"
sidebar_position: 3
---

# Chapter 3: Clustering Methods (Methodes de Classification Non Supervisee)

## Overview

Clustering is the task of grouping a set of objects so that objects within the same group (cluster) are more similar to each other than to objects in other groups. This chapter covers the three methods studied in the course: **CAH (Classification Ascendante Hierarchique)**, **K-means**, and **DBSCAN**.

**French terms**: Classification non supervisee, Clustering, Partitionnement

## 1. Hierarchical Agglomerative Clustering (CAH)

### Algorithm (Classification Ascendante Hierarchique)

The CAH builds a hierarchy of clusters by successively merging the two closest clusters.

```
1. Start: each individual is its own cluster (n clusters)
2. Compute distance between all pairs of clusters
3. Merge the two closest clusters
4. Recompute distances
5. Repeat steps 3-4 until only one cluster remains
6. Cut the dendrogram at the desired level
```

### Linkage Criteria (Criteres de Liaison)

The key decision is how to define the "distance" between two clusters:

| Criterion | French | Formula | Properties |
|-----------|--------|---------|------------|
| **Ward** | Critere de Ward | Minimizes increase in total within-cluster variance | Best for continuous data, forms compact clusters of similar size |
| **Complete** | Lien complet | Max distance between any two points in the two clusters | Forms compact clusters, sensitive to outliers |
| **Average** | Lien moyen | Average of all pairwise distances | Compromise between single and complete |
| **Single** | Lien simple | Min distance between any two points | Finds elongated clusters, suffers from "chaining effect" |

**Ward's criterion** (the one used in this course):

```
Delta(A, B) = (n_A * n_B) / (n_A + n_B) * ||center_A - center_B||^2
```

This measures the increase in total intra-cluster variance when merging clusters A and B.

### The Dendrogram (Dendrogramme)

A tree-like visualization of the merging process:
- **X-axis**: Individual labels
- **Y-axis**: Distance/dissimilarity at which merges occur
- **Height of merge**: The larger the height, the more dissimilar the merged clusters

**Reading a dendrogram**:
1. Large vertical jumps indicate natural cluster boundaries
2. A horizontal cut at any level produces a partition
3. The "right" number of clusters is where there are significant jumps

```python noexec
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster

# Compute linkage
Z = linkage(X, method='ward')

# Plot dendrogram
dendrogram(Z, labels=names, leaf_font_size=10)
plt.title('Dendrogramme - Methode de Ward')
plt.xlabel('Individus')
plt.ylabel('Distance')

# Cut to get n clusters
clusters = fcluster(Z, t=3, criterion='maxclust')
```

### CAH-MIXTE Method (from TP2)

This is the method taught in the course: combine PCA + CAH.

```
1. Run PCA on standardized data
2. Keep first k principal components (80-90% variance)
3. Apply CAH with Ward criterion on PC coordinates
4. Choose number of clusters from dendrogram
5. Identify paragons and interpret clusters
```

### Paragons (Parangons)

A **paragon** is the individual closest to the center of gravity (barycentre) of its cluster -- the most representative member.

```python noexec
from scipy.spatial.distance import cdist

for cluster_id in unique_clusters:
    cluster_points = X_pca[labels == cluster_id]
    centroid = cluster_points.mean(axis=0)
    distances = cdist(cluster_points, [centroid]).flatten()
    paragon_idx = np.argmin(distances)
    print(f"Cluster {cluster_id} paragon: {names[paragon_idx]}")
```

### Results from TP2 (French Cities)

**Optimal classification**: 3 clusters on 2 principal components

| Cluster | Climate Type | Cities | Paragon |
|---------|-------------|--------|---------|
| 1 | Continental (Centre/Nord) | Strasbourg, Lille, Grenoble, Lyon, Vichy, Clermont-Ferrand, Paris | Vichy |
| 2 | Oceanic (Ouest) | Brest, Rennes, Nantes | Rennes |
| 3 | Mediterranean (Sud) | Nice, Marseille, Montpellier, Toulouse, Bordeaux | Toulouse |

## 2. K-Means

### Algorithm

K-means partitions data into K clusters by minimizing within-cluster variance (inertie intra-classe).

```
1. Choose K (number of clusters)
2. Initialize K centroids randomly
3. Assign each point to the nearest centroid
4. Recompute centroids as the mean of assigned points
5. Repeat steps 3-4 until convergence (assignments don't change)
```

### Key Properties

| Property | Detail |
|----------|--------|
| **Complexity** | O(n * k * d * iterations) -- fast, linear |
| **Cluster shape** | Always convex (spherical/ellipsoidal) |
| **Requires** | K must be specified in advance |
| **Sensitivity** | Sensitive to initialization and outliers |
| **Determinism** | Different runs may give different results |

### Choosing K

**Elbow method (Methode du coude)**:
```python noexec
inertias = []
for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X)
    inertias.append(kmeans.inertia_)

plt.plot(range(2, 11), inertias, 'o-')
plt.xlabel('Number of clusters K')
plt.ylabel('Inertia (WCSS)')
plt.title('Elbow Method')
```

Look for the "elbow" where the rate of decrease slows.

### Implementation

```python noexec
from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = kmeans.fit_predict(X)

# Cluster centers
centers = kmeans.cluster_centers_

# Inertia (within-cluster sum of squares)
inertia = kmeans.inertia_
```

## 3. DBSCAN

### Algorithm (Density-Based Spatial Clustering of Applications with Noise)

DBSCAN finds clusters as regions of high point density separated by regions of low density.

**Parameters**:
- **eps (epsilon)**: Maximum distance between two points to be considered neighbors
- **min_samples (minPts)**: Minimum number of points to form a dense region (core point)

**Point types**:
| Type | Definition |
|------|-----------|
| **Core point** (point noyau) | Has >= min_samples neighbors within eps radius |
| **Border point** (point frontiere) | Within eps of a core point, but < min_samples own neighbors |
| **Noise point** (bruit) | Neither core nor border -- label = -1 |

### Step-by-step Algorithm

```
For each unvisited point p:
    1. Mark p as visited
    2. Find all neighbors N within eps radius
    3. If |N| < min_samples:
       - Mark p as noise (may be reassigned later)
    4. Else:
       - Create new cluster C
       - Add p to C
       - For each point q in N:
         - If q is unvisited:
           - Mark q as visited
           - Find q's neighbors N'
           - If |N'| >= min_samples: add N' to N
         - If q is not in any cluster: add q to C
```

### Choosing Parameters

**eps**: Use the k-distance graph:
1. For each point, compute distance to its k-th nearest neighbor (k = min_samples - 1)
2. Sort distances and plot
3. Choose eps at the "elbow" of the curve

```python noexec
from sklearn.neighbors import NearestNeighbors

neighbors = NearestNeighbors(n_neighbors=5)
neighbors.fit(coords)
distances, _ = neighbors.kneighbors(coords)
k_distances = np.sort(distances[:, -1])

plt.plot(k_distances)
plt.xlabel('Points (sorted)')
plt.ylabel('5th neighbor distance')
plt.title('K-Distance Graph')
```

**min_samples**: Rule of thumb is 2 * dimensions, or domain-specific (e.g., 7-10 for spatial photo data).

### Implementation

```python noexec
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.00030, min_samples=7)
labels = dbscan.fit_predict(coords)

# Number of clusters (excluding noise)
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)

# Number of noise points
n_noise = list(labels).count(-1)
```

### Key Properties

| Property | Detail |
|----------|--------|
| **Complexity** | O(n * log n) with spatial index, O(n^2) without |
| **Cluster shape** | Arbitrary -- any shape including concave |
| **Requires** | eps and min_samples (but NOT K) |
| **Handles noise** | Yes -- noise points labeled as -1 |
| **Determinism** | Deterministic for core and noise points (border points may vary) |

## 4. Comparison: CAH vs K-means vs DBSCAN

| Feature | CAH (Ward) | K-means | DBSCAN |
|---------|-----------|---------|--------|
| **Input parameter** | None (cut dendrogramme) | K (number of clusters) | eps, min_samples |
| **Cluster shape** | Compact, spherical | Convex, spherical | Arbitrary |
| **Handles noise** | No | No | Yes |
| **Scalability** | O(n^3) -- small data only | O(n) -- very scalable | O(n log n) -- medium |
| **Hierarchical** | Yes (dendrogram) | No | No |
| **Deterministic** | Yes | No (depends on init) | Mostly yes |
| **Best for** | Small data, hierarchical structure | Large data, known K | Spatial data with noise |

### When to Use What

- **CAH**: Small datasets (<1000 points), you want to explore different numbers of clusters, data has hierarchical structure. Used in TP1/TP2.
- **K-means**: Large datasets, roughly spherical clusters, K is known or can be estimated. Good as a baseline.
- **DBSCAN**: Spatial/geographic data, clusters of varying shapes, presence of noise/outliers. Used in TP3-4.

## 5. Evaluation Metrics

### Silhouette Score (Score de Silhouette)

Measures how similar an object is to its own cluster compared to other clusters.

For each point i:
```
a(i) = mean distance to other points in same cluster (cohesion)
b(i) = mean distance to points in nearest other cluster (separation)
s(i) = (b(i) - a(i)) / max(a(i), b(i))
```

| Score Range | Interpretation |
|------------|----------------|
| s close to 1 | Point is well-assigned |
| s close to 0 | Point is on the boundary between clusters |
| s < 0 | Point is probably mis-assigned |
| Average > 0.5 | Good clustering |
| Average 0.25-0.5 | Moderate clustering |
| Average < 0.25 | Poor clustering |

```python noexec
from sklearn.metrics import silhouette_score
score = silhouette_score(X, labels)
```

### Davies-Bouldin Index (Indice de Davies-Bouldin)

Ratio of within-cluster scatter to between-cluster separation.

```
DB = (1/K) * sum_i max_{j!=i} (sigma_i + sigma_j) / d(c_i, c_j)
```

- **Lower is better** (minimum = 0)
- Does not require ground truth

```python noexec
from sklearn.metrics import davies_bouldin_score
score = davies_bouldin_score(X, labels)
```

### Inertia / WCSS (Inertie Intra-Classe)

Within-Cluster Sum of Squares: sum of squared distances from each point to its cluster center.

```
WCSS = sum_k sum_{i in C_k} ||x_i - center_k||^2
```

- **Lower is better** for a fixed K
- Always decreases as K increases -- use elbow method

```python noexec
# For K-means
inertia = kmeans.inertia_

# Manual calculation
inertia = 0
for k in unique_clusters:
    cluster_points = X[labels == k]
    center = cluster_points.mean(axis=0)
    inertia += np.sum((cluster_points - center) ** 2)
```

## 6. Spatial Clustering Considerations (TP3-4)

### GPS to Cartesian Conversion

DBSCAN uses Euclidean distance, but GPS coordinates are not in meters. There are two approaches used in the course:

**Approach 1 (used in the TP notebook)**: Apply DBSCAN directly on raw GPS coordinates with a very small eps (e.g., 0.00030 degrees). This is an approximation that works for small regions but is not metrically precise.

**Approach 2 (used in the TP source code)**: Convert GPS to approximate Cartesian coordinates first:
```python noexec
# 1 degree latitude ~ 111 km
# 1 degree longitude ~ 71 km (at 48 degrees N, cos(48) ~ 0.67)
df['x'] = (df['longitude'] + 1.7) * 71000   # meters
df['y'] = (df['latitude'] - 48.0) * 111000   # meters
```

**Proper method** (Lambert 93):
```python noexec
from pyproj import Transformer
transformer = Transformer.from_crs("EPSG:4326", "EPSG:2154")
x, y = transformer.transform(lat, lon)
```

### "Album Photo" Effect

A single user taking many photos at the same location inflates density without indicating true interest. Solution:

```python noexec
# Keep only one photo per user per hour
photos = photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

This reduces the Flickr dataset from 29,541 rows to ~1,232.

## Common Pitfalls

1. **Using DBSCAN on raw GPS coordinates**: Always convert to meters first.
2. **Forgetting to remove noise when computing metrics**: Filter out label=-1 before silhouette_score.
3. **Comparing K-means with different K values using inertia**: Inertia always decreases with K -- compare using silhouette instead.
4. **Using CAH on large datasets**: Ward linkage is O(n^3) -- impractical for >5000 points.
5. **Choosing eps by trial-and-error**: Use the k-distance graph for a principled choice.
6. **Not standardizing before CAH**: If variables have different scales, standardize first (or use PCA coordinates).

---

## CHEAT SHEET

### Algorithm Comparison Quick Reference

```
Need hierarchical structure?     --> CAH
Large dataset, know K?           --> K-means
Spatial data with noise?         --> DBSCAN
Don't know number of clusters?   --> DBSCAN or CAH
Clusters of arbitrary shape?     --> DBSCAN
```

### Code Templates

**CAH**:
```python noexec
from scipy.cluster.hierarchy import linkage, fcluster, dendrogram
Z = linkage(X, method='ward')
labels = fcluster(Z, t=3, criterion='maxclust')
dendrogram(Z, labels=names)
```

**K-means**:
```python noexec
from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = km.fit_predict(X)
```

**DBSCAN**:
```python noexec
from sklearn.cluster import DBSCAN
db = DBSCAN(eps=100, min_samples=10)
labels = db.fit_predict(coords)
```

### Metrics Quick Reference

| Metric | Good Value | Python |
|--------|-----------|--------|
| Silhouette | > 0.5 | `silhouette_score(X, labels)` |
| Davies-Bouldin | < 1.0 | `davies_bouldin_score(X, labels)` |
| WCSS / Inertia | Use elbow | `kmeans.inertia_` |

### Key French Terms

| French | English |
|--------|---------|
| Classification ascendante hierarchique (CAH) | Hierarchical Agglomerative Clustering |
| Dendrogramme | Dendrogram |
| Critere de Ward | Ward's criterion |
| Inertie intra-classe | Within-cluster inertia (WCSS) |
| Inertie inter-classe | Between-cluster inertia |
| Parangon | Paragon (most representative individual) |
| Barycentre | Centroid / Center of gravity |
| Point noyau | Core point (DBSCAN) |
| Point frontiere | Border point (DBSCAN) |
| Bruit | Noise |
| Score de silhouette | Silhouette score |
