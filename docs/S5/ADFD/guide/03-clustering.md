---
title: "Chapitre 3 : Methodes de clustering (classification non supervisee)"
sidebar_position: 3
---

# Chapitre 3 : Methodes de clustering (classification non supervisee)

## Presentation

Le clustering est la tache consistant a regrouper un ensemble d'objets de sorte que les objets d'un meme groupe (cluster) soient plus similaires entre eux qu'avec les objets des autres groupes. Ce chapitre couvre les trois methodes etudiees dans le cours : **CAH (Classification Ascendante Hierarchique)**, **K-means** et **DBSCAN**.

## 1. Classification Ascendante Hierarchique (CAH)

### Algorithme

La CAH construit une hierarchie de clusters en fusionnant successivement les deux clusters les plus proches.

```
1. Depart : chaque individu forme son propre cluster (n clusters)
2. Calculer la distance entre toutes les paires de clusters
3. Fusionner les deux clusters les plus proches
4. Recalculer les distances
5. Repeter les etapes 3-4 jusqu'a n'avoir qu'un seul cluster
6. Couper le dendrogramme au niveau souhaite
```

### Criteres de liaison

La decision cle est la definition de la "distance" entre deux clusters :

| Critere | Formule | Proprietes |
|---------|---------|------------|
| **Ward** (critere de Ward) | Minimise l'augmentation de la variance intra-cluster totale | Ideal pour donnees continues, forme des clusters compacts de taille similaire |
| **Lien complet** (complete) | Distance max entre deux points des deux clusters | Forme des clusters compacts, sensible aux valeurs aberrantes |
| **Lien moyen** (average) | Moyenne de toutes les distances deux a deux | Compromis entre lien simple et complet |
| **Lien simple** (single) | Distance min entre deux points | Trouve des clusters allonges, souffre de l'"effet chaine" |

**Critere de Ward** (celui utilise dans ce cours) :

```
Delta(A, B) = (n_A * n_B) / (n_A + n_B) * ||centre_A - centre_B||^2
```

Ceci mesure l'augmentation de la variance intra-cluster totale lors de la fusion des clusters A et B.

### Le dendrogramme

Visualisation arborescente du processus de fusion :
- **Axe X** : Noms des individus
- **Axe Y** : Distance/dissimilarite a laquelle les fusions ont lieu
- **Hauteur de fusion** : Plus la hauteur est grande, plus les clusters fusionnes sont dissimilaires

**Lecture d'un dendrogramme** :
1. Les grands sauts verticaux indiquent des frontieres naturelles de clusters
2. Une coupe horizontale a n'importe quel niveau produit une partition
3. Le "bon" nombre de clusters se situe la ou il y a des sauts significatifs

```python noexec
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster

# Calculer le linkage
Z = linkage(X, method='ward')

# Tracer le dendrogramme
dendrogram(Z, labels=names, leaf_font_size=10)
plt.title('Dendrogramme - Methode de Ward')
plt.xlabel('Individus')
plt.ylabel('Distance')

# Couper pour obtenir n clusters
clusters = fcluster(Z, t=3, criterion='maxclust')
```

### Methode CAH-MIXTE (issue du TP2)

C'est la methode enseignee dans le cours : combiner ACP + CAH.

```
1. Effectuer l'ACP sur les donnees standardisees
2. Garder les k premieres composantes principales (80-90% de variance)
3. Appliquer la CAH avec critere de Ward sur les coordonnees des PC
4. Choisir le nombre de clusters a partir du dendrogramme
5. Identifier les parangons et interpreter les clusters
```

### Parangons

Un **parangon** est l'individu le plus proche du centre de gravite (barycentre) de son cluster -- le membre le plus representatif.

```python noexec
from scipy.spatial.distance import cdist

for cluster_id in unique_clusters:
    cluster_points = X_pca[labels == cluster_id]
    centroid = cluster_points.mean(axis=0)
    distances = cdist(cluster_points, [centroid]).flatten()
    paragon_idx = np.argmin(distances)
    print(f"Cluster {cluster_id} parangon : {names[paragon_idx]}")
```

### Resultats du TP2 (Villes francaises)

**Classification optimale** : 3 clusters sur 2 composantes principales

| Cluster | Type climatique | Villes | Parangon |
|---------|----------------|--------|----------|
| 1 | Continental (Centre/Nord) | Strasbourg, Lille, Grenoble, Lyon, Vichy, Clermont-Ferrand, Paris | Vichy |
| 2 | Oceanique (Ouest) | Brest, Rennes, Nantes | Rennes |
| 3 | Mediterraneen (Sud) | Nice, Marseille, Montpellier, Toulouse, Bordeaux | Toulouse |

## 2. K-Means

### Algorithme

K-means partitionne les donnees en K clusters en minimisant la variance intra-cluster (inertie intra-classe).

```
1. Choisir K (nombre de clusters)
2. Initialiser K centroides aleatoirement
3. Assigner chaque point au centroide le plus proche
4. Recalculer les centroides comme la moyenne des points assignes
5. Repeter les etapes 3-4 jusqu'a convergence (les assignations ne changent plus)
```

### Proprietes cles

| Propriete | Detail |
|-----------|--------|
| **Complexite** | O(n * k * d * iterations) -- rapide, lineaire |
| **Forme des clusters** | Toujours convexe (spherique/ellipsoidal) |
| **Necessite** | K doit etre specifie a l'avance |
| **Sensibilite** | Sensible a l'initialisation et aux valeurs aberrantes |
| **Determinisme** | Differentes executions peuvent donner des resultats differents |

### Choix de K

**Methode du coude** :
```python noexec
inertias = []
for k in range(2, 11):
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(X)
    inertias.append(kmeans.inertia_)

plt.plot(range(2, 11), inertias, 'o-')
plt.xlabel('Nombre de clusters K')
plt.ylabel('Inertie (WCSS)')
plt.title('Methode du coude')
```

Chercher le "coude" ou le taux de decroissance ralentit.

### Implementation

```python noexec
from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = kmeans.fit_predict(X)

# Centres des clusters
centers = kmeans.cluster_centers_

# Inertie (somme des carres intra-cluster)
inertia = kmeans.inertia_
```

## 3. DBSCAN

### Algorithme (Density-Based Spatial Clustering of Applications with Noise)

DBSCAN trouve des clusters comme des regions de forte densite de points separees par des regions de faible densite.

**Parametres** :
- **eps (epsilon)** : Distance maximale entre deux points pour etre consideres voisins
- **min_samples (minPts)** : Nombre minimum de points pour former une region dense (point noyau)

**Types de points** :
| Type | Definition |
|------|-----------|
| **Point noyau** (core point) | A >= min_samples voisins dans un rayon eps |
| **Point frontiere** (border point) | Dans le rayon eps d'un point noyau, mais < min_samples propres voisins |
| **Point bruit** (noise) | Ni noyau ni frontiere -- label = -1 |

### Algorithme pas a pas

```
Pour chaque point non visite p :
    1. Marquer p comme visite
    2. Trouver tous les voisins N dans le rayon eps
    3. Si |N| < min_samples :
       - Marquer p comme bruit (peut etre reassigne plus tard)
    4. Sinon :
       - Creer un nouveau cluster C
       - Ajouter p a C
       - Pour chaque point q dans N :
         - Si q n'est pas visite :
           - Marquer q comme visite
           - Trouver les voisins N' de q
           - Si |N'| >= min_samples : ajouter N' a N
         - Si q n'est dans aucun cluster : ajouter q a C
```

### Choix des parametres

**eps** : Utiliser le graphe des k-distances :
1. Pour chaque point, calculer la distance a son k-ieme plus proche voisin (k = min_samples - 1)
2. Trier les distances et tracer le graphe
3. Choisir eps au "coude" de la courbe

```python noexec
from sklearn.neighbors import NearestNeighbors

neighbors = NearestNeighbors(n_neighbors=5)
neighbors.fit(coords)
distances, _ = neighbors.kneighbors(coords)
k_distances = np.sort(distances[:, -1])

plt.plot(k_distances)
plt.xlabel('Points (tries)')
plt.ylabel('Distance au 5e voisin')
plt.title('Graphe des k-distances')
```

**min_samples** : En regle generale, 2 * dimensions, ou specifique au domaine (ex. 7-10 pour des donnees spatiales de photos).

### Implementation

```python noexec
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.00030, min_samples=7)
labels = dbscan.fit_predict(coords)

# Nombre de clusters (hors bruit)
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)

# Nombre de points de bruit
n_noise = list(labels).count(-1)
```

### Proprietes cles

| Propriete | Detail |
|-----------|--------|
| **Complexite** | O(n * log n) avec index spatial, O(n^2) sans |
| **Forme des clusters** | Arbitraire -- toute forme y compris concave |
| **Necessite** | eps et min_samples (mais PAS K) |
| **Gere le bruit** | Oui -- points de bruit etiquetes -1 |
| **Determinisme** | Deterministe pour les points noyaux et bruit (les points frontieres peuvent varier) |

## 4. Comparaison : CAH vs K-means vs DBSCAN

| Caracteristique | CAH (Ward) | K-means | DBSCAN |
|-----------------|-----------|---------|--------|
| **Parametre d'entree** | Aucun (coupe du dendrogramme) | K (nombre de clusters) | eps, min_samples |
| **Forme des clusters** | Compacte, spherique | Convexe, spherique | Arbitraire |
| **Gere le bruit** | Non | Non | Oui |
| **Scalabilite** | O(n^3) -- petites donnees uniquement | O(n) -- tres scalable | O(n log n) -- moyen |
| **Hierarchique** | Oui (dendrogramme) | Non | Non |
| **Deterministe** | Oui | Non (depend de l'init) | Principalement oui |
| **Ideal pour** | Petites donnees, structure hierarchique | Grandes donnees, K connu | Donnees spatiales avec bruit |

### Quand utiliser quoi

- **CAH** : Petits jeux de donnees (<1000 points), on veut explorer differents nombres de clusters, les donnees ont une structure hierarchique. Utilisee dans les TP1/TP2.
- **K-means** : Grands jeux de donnees, clusters approximativement spheriques, K est connu ou estimable. Bon comme reference de base.
- **DBSCAN** : Donnees spatiales/geographiques, clusters de formes variees, presence de bruit/valeurs aberrantes. Utilise dans les TP3-4.

## 5. Metriques d'evaluation

### Score de silhouette

Mesure la similarite d'un objet a son propre cluster par rapport aux autres clusters.

Pour chaque point i :
```
a(i) = distance moyenne aux autres points du meme cluster (cohesion)
b(i) = distance moyenne aux points du cluster voisin le plus proche (separation)
s(i) = (b(i) - a(i)) / max(a(i), b(i))
```

| Plage de score | Interpretation |
|----------------|----------------|
| s proche de 1 | Point bien assigne |
| s proche de 0 | Point a la frontiere entre clusters |
| s < 0 | Point probablement mal assigne |
| Moyenne > 0.5 | Bon clustering |
| Moyenne 0.25-0.5 | Clustering modere |
| Moyenne < 0.25 | Clustering mediocre |

```python noexec
from sklearn.metrics import silhouette_score
score = silhouette_score(X, labels)
```

### Indice de Davies-Bouldin

Ratio de la dispersion intra-cluster a la separation inter-cluster.

```
DB = (1/K) * somme_i max_{j!=i} (sigma_i + sigma_j) / d(c_i, c_j)
```

- **Plus faible = meilleur** (minimum = 0)
- Ne necessite pas de verite terrain

```python noexec
from sklearn.metrics import davies_bouldin_score
score = davies_bouldin_score(X, labels)
```

### Inertie / WCSS (inertie intra-classe)

Somme des carres intra-cluster : somme des distances au carre de chaque point au centre de son cluster.

```
WCSS = somme_k somme_{i dans C_k} ||x_i - centre_k||^2
```

- **Plus faible = meilleur** pour un K fixe
- Decroit toujours quand K augmente -- utiliser la methode du coude

```python noexec
# Pour K-means
inertia = kmeans.inertia_

# Calcul manuel
inertia = 0
for k in unique_clusters:
    cluster_points = X[labels == k]
    center = cluster_points.mean(axis=0)
    inertia += np.sum((cluster_points - center) ** 2)
```

## 6. Considerations pour le clustering spatial (TP3-4)

### Conversion GPS vers cartesien

DBSCAN utilise la distance euclidienne, mais les coordonnees GPS ne sont pas en metres. Deux approches sont utilisees dans le cours :

**Approche 1 (utilisee dans le notebook du TP)** : Appliquer DBSCAN directement sur les coordonnees GPS brutes avec un eps tres petit (ex. 0.00030 degres). C'est une approximation qui fonctionne pour de petites regions mais n'est pas metriquement precise.

**Approche 2 (utilisee dans le code source du TP)** : Convertir les GPS en coordonnees cartesiennes approximatives d'abord :
```python noexec
# 1 degre de latitude ~ 111 km
# 1 degre de longitude ~ 71 km (a 48 degres N, cos(48) ~ 0.67)
df['x'] = (df['longitude'] + 1.7) * 71000   # metres
df['y'] = (df['latitude'] - 48.0) * 111000   # metres
```

**Methode correcte** (Lambert 93) :
```python noexec
from pyproj import Transformer
transformer = Transformer.from_crs("EPSG:4326", "EPSG:2154")
x, y = transformer.transform(lat, lon)
```

### Effet "album photo"

Un seul utilisateur prenant beaucoup de photos au meme endroit gonfle la densite sans indiquer un reel interet. Solution :

```python noexec
# Garder une seule photo par utilisateur par heure
photos = photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

Cela reduit le jeu de donnees Flickr de 29 541 lignes a ~1 232.

## Pieges courants

1. **Utiliser DBSCAN sur des coordonnees GPS brutes** : Convertissez toujours en metres d'abord.
2. **Oublier de supprimer le bruit pour le calcul des metriques** : Filtrez les label=-1 avant silhouette_score.
3. **Comparer des K-means avec differents K en utilisant l'inertie** : L'inertie decroit toujours avec K -- comparez plutot avec le score de silhouette.
4. **Utiliser la CAH sur de grands jeux de donnees** : Le linkage de Ward est en O(n^3) -- impraticable pour >5000 points.
5. **Choisir eps par tatonnement** : Utilisez le graphe des k-distances pour un choix raisonne.
6. **Ne pas standardiser avant la CAH** : Si les variables ont des echelles differentes, standardisez d'abord (ou utilisez les coordonnees de l'ACP).

---

## AIDE-MEMOIRE

### Reference rapide de comparaison des algorithmes

```
Besoin d'une structure hierarchique ?  --> CAH
Grand jeu de donnees, K connu ?        --> K-means
Donnees spatiales avec bruit ?         --> DBSCAN
Nombre de clusters inconnu ?           --> DBSCAN ou CAH
Clusters de forme arbitraire ?         --> DBSCAN
```

### Modeles de code

**CAH** :
```python noexec
from scipy.cluster.hierarchy import linkage, fcluster, dendrogram
Z = linkage(X, method='ward')
labels = fcluster(Z, t=3, criterion='maxclust')
dendrogram(Z, labels=names)
```

**K-means** :
```python noexec
from sklearn.cluster import KMeans
km = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = km.fit_predict(X)
```

**DBSCAN** :
```python noexec
from sklearn.cluster import DBSCAN
db = DBSCAN(eps=100, min_samples=10)
labels = db.fit_predict(coords)
```

### Reference rapide des metriques

| Metrique | Bonne valeur | Python |
|----------|-------------|--------|
| Silhouette | > 0.5 | `silhouette_score(X, labels)` |
| Davies-Bouldin | < 1.0 | `davies_bouldin_score(X, labels)` |
| WCSS / Inertie | Utiliser le coude | `kmeans.inertia_` |

### Termes cles (Francais/Anglais)

| Francais | Anglais |
|----------|---------|
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
