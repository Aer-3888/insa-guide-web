---
title: "Chapitre 7 -- Apprentissage non supervise"
sidebar_position: 7
---

# Chapitre 7 -- Apprentissage non supervise

## 1. Principe

En apprentissage non supervise, il n'y a **pas de labels**. L'objectif est de decouvrir des **structures cachees** dans les donnees : groupes, dimensions principales, anomalies.

### Applications

| Tache | Description | Algorithmes |
|-------|------------|------------|
| **Clustering** | Regrouper les exemples similaires | K-means, hierarchique, DBSCAN |
| **Reduction de dimension** | Projeter en moins de dimensions | PCA, t-SNE, UMAP |
| **Detection d'anomalies** | Identifier les points aberrants | Isolation Forest, LOF |

---

## 2. K-Means

### Algorithme

1. Choisir $K$ centres (centroides) aleatoirement.
2. **Affectation** : assigner chaque point au centroide le plus proche.
3. **Mise a jour** : recalculer chaque centroide comme la moyenne de ses points.
4. Repeter 2-3 jusqu'a convergence.

### Formule : inertie (fonction de cout)

$$J = \sum_{k=1}^{K} \sum_{\mathbf{x}_i \in C_k} ||\mathbf{x}_i - \boldsymbol{\mu}_k||^2$$

ou $\boldsymbol{\mu}_k$ est le centroide du cluster $C_k$.

### Choix de K : methode du coude (Elbow method)

Tracer l'inertie en fonction de $K$ et chercher le "coude" ou l'inertie commence a diminuer lentement.

```python noexec
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

inertias = []
K_range = range(1, 11)
for k in K_range:
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    km.fit(X)
    inertias.append(km.inertia_)

plt.plot(K_range, inertias, marker='o')
plt.xlabel('Nombre de clusters K')
plt.ylabel('Inertie')
plt.title('Methode du coude')
plt.show()
```

### Choix de K : score silhouette

Le score silhouette mesure la qualite du clustering :

$$s_i = \frac{b_i - a_i}{\max(a_i, b_i)}$$

- $a_i$ : distance moyenne intra-cluster (cohesion).
- $b_i$ : distance moyenne au cluster le plus proche (separation).
- $s_i \in [-1, 1]$ : 1 = bien classe, 0 = frontiere, -1 = mal classe.

```python noexec
from sklearn.metrics import silhouette_score

for k in range(2, 11):
    km = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = km.fit_predict(X)
    score = silhouette_score(X, labels)
    print(f"K={k}: silhouette = {score:.3f}")
```

### Avantages et limites

| Avantages | Limites |
|-----------|---------|
| Simple et rapide | Doit fixer K a l'avance |
| Scalable | Sensible a l'initialisation (utiliser n_init) |
| Fonctionne bien pour clusters spheriques | Ne detecte pas les formes irregulieres |
| | Sensible aux outliers |

---

## 3. Clustering hierarchique

### Principe

Construire une hierarchie de clusters, representee par un **dendrogramme**.

### Deux approches

| Approche | Principe | Complexite |
|----------|---------|-----------|
| **Agglomerative** (bottom-up) | Chaque point est un cluster, on fusionne les plus proches | $O(n^3)$ |
| **Divisive** (top-down) | Tous les points dans un cluster, on divise | Moins courant |

### Criteres de liaison (linkage)

| Critere | Distance entre clusters |
|---------|----------------------|
| **Single** | Distance minimale entre paires | 
| **Complete** | Distance maximale entre paires |
| **Average** | Distance moyenne entre paires |
| **Ward** | Minimise l'augmentation de variance (le plus utilise) |

### Code Python

```python noexec
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# Dendrogramme
Z = linkage(X, method='ward')
plt.figure(figsize=(12, 5))
dendrogram(Z, truncate_mode='level', p=5)
plt.xlabel('Echantillons')
plt.ylabel('Distance')
plt.title('Dendrogramme (Ward)')
plt.show()

# Clustering
agg = AgglomerativeClustering(n_clusters=3, linkage='ward')
labels = agg.fit_predict(X)
```

---

## 4. PCA (Analyse en Composantes Principales)

### Principe

PCA projette les donnees sur les axes de variance maximale. C'est la methode de reference pour la **reduction de dimension**.

### Mathematiquement

1. Centrer les donnees : $\mathbf{X}_c = \mathbf{X} - \bar{\mathbf{X}}$.
2. Calculer la matrice de covariance : $\mathbf{C} = \frac{1}{n-1} \mathbf{X}_c^T \mathbf{X}_c$.
3. Calculer les valeurs propres $\lambda_1 \geq \lambda_2 \geq \cdots \geq \lambda_p$ et vecteurs propres.
4. Projeter sur les $d$ premiers vecteurs propres.

### Variance expliquee

$$\text{Variance expliquee par la composante } k = \frac{\lambda_k}{\sum_{j=1}^{p} \lambda_j}$$

La variance cumulee aide a choisir le nombre de composantes.

### Code Python

```python noexec
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# PCA avec 2 composantes (pour visualisation)
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)

print(f"Variance expliquee : {pca.explained_variance_ratio_}")
print(f"Variance cumulee : {pca.explained_variance_ratio_.sum():.3f}")

# Visualisation
plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap='viridis', alpha=0.7)
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%})')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%})')
plt.colorbar(label='Classe')
plt.title('PCA - 2 composantes')
plt.show()

# Choisir le nombre de composantes
pca_full = PCA()
pca_full.fit(X)
cumvar = pca_full.explained_variance_ratio_.cumsum()
n_components_95 = (cumvar < 0.95).sum() + 1
print(f"Composantes pour 95% de variance : {n_components_95}")

plt.plot(range(1, len(cumvar)+1), cumvar, marker='o')
plt.axhline(y=0.95, color='r', linestyle='--', label='95%')
plt.xlabel('Nombre de composantes')
plt.ylabel('Variance cumulee')
plt.legend()
plt.show()
```

### PCA pour le preprocessing

La PCA est souvent utilisee avant un classifieur pour :
- Reduire le bruit.
- Accelerer l'entrainement.
- Combattre la malediction de la dimensionnalite.

```python noexec
from sklearn.pipeline import Pipeline
from sklearn.decomposition import PCA
from sklearn.neighbors import KNeighborsClassifier

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=0.95)),  # garder 95% de variance
    ('knn', KNeighborsClassifier(n_neighbors=5))
])
pipe.fit(X_train, y_train)
```

---

## 5. Autres methodes de reduction de dimension

### t-SNE

Methode non lineaire pour la **visualisation** en 2D/3D :

```python noexec
from sklearn.manifold import TSNE

tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X)
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='viridis', alpha=0.7)
plt.title('t-SNE')
plt.show()
```

**Attention :** t-SNE est pour la visualisation uniquement. Ne pas l'utiliser pour le preprocessing car elle ne preserve pas les distances globales.

---

## 6. Pieges classiques

- **K-means avec des clusters non spheriques** : K-means assume des clusters convexes. Utiliser DBSCAN pour des formes arbitraires.
- **Oublier de standardiser avant PCA** : PCA est sensible a l'echelle. Toujours centrer (et souvent standardiser) les donnees.
- **Interpreter t-SNE comme des distances** : les distances dans l'espace t-SNE ne sont pas fiables.
- **Choisir K arbitrairement** : toujours utiliser le coude ou la silhouette.
- **PCA sur des features deja peu correlees** : PCA est peu utile si les features sont deja independantes.

---

## CHEAT SHEET

```
K-MEANS
  1. Initialiser K centroides
  2. Affecter chaque point au plus proche centroide
  3. Recalculer les centroides
  4. Repeter 2-3
  Inertie = sum ||xi - mu_k||^2
  Choix de K : coude, silhouette

HIERARCHIQUE
  Agglomeratif : bottom-up, fusion progressive
  Linkage : single, complete, average, ward
  Dendrogramme pour visualiser

PCA
  1. Centrer les donnees
  2. Matrice de covariance
  3. Valeurs/vecteurs propres
  4. Projeter sur les d premiers axes
  Variance expliquee = lambda_k / sum(lambda)

SKLEARN
  KMeans(n_clusters=3, n_init=10)
  AgglomerativeClustering(n_clusters=3, linkage='ward')
  PCA(n_components=2) ou PCA(n_components=0.95)
  TSNE(n_components=2, perplexity=30)
  silhouette_score(X, labels)
```
