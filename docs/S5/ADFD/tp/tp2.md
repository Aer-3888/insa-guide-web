---
title: "TP 2: Classification Hiérarchique et Méthode CAH-MIXTE"
sidebar_position: 2
---

# TP 2: Classification Hiérarchique et Méthode CAH-MIXTE

## Objectif

Ce TP approfondit l'analyse des températures des villes françaises en utilisant la classification hiérarchique ascendante (CAH) sur les résultats de l'ACP normée du TP1. L'objectif est d'identifier des groupes de villes homogènes en termes de profil climatique.

## Contexte

Suite à l'ACP du TP1, on dispose de composantes principales qui résument l'information des 12 variables (mois). La classification hiérarchique permet de regrouper les villes en clusters homogènes basés sur ces composantes.

## Concepts clés

### 1. Classification Hiérarchique Ascendante (CAH)

Méthode de clustering qui construit une hiérarchie de partitions par fusions successives:

**Algorithme**:
1. Au départ, chaque individu forme un cluster
2. À chaque itération, on fusionne les deux clusters les plus proches
3. On continue jusqu'à n'avoir qu'un seul cluster
4. On coupe le dendrogramme au niveau souhaité

**Avantages**:
- Pas besoin de spécifier le nombre de clusters à l'avance
- Visualisation hiérarchique via dendrogramme
- Identifie la structure naturelle des données

### 2. Critères de liaison

**Ward** (critère d'inertie):
- Minimise la variance intra-cluster
- Tend à former des clusters de taille similaire
- Recommandé pour des données continues
- **Utilisé dans ce TP**

**Complete linkage**:
- Distance maximale entre deux clusters
- Tend à former des clusters compacts

**Average linkage**:
- Distance moyenne entre clusters
- Compromis entre single et complete

**Single linkage**:
- Distance minimale entre clusters
- Sensible aux outliers (effet chaîne)

### 3. Méthode DEFAC (Description Factorielle)

Interprétation des axes factoriels de l'ACP:

**Pour les variables** (mois):
- Identifier les variables les mieux représentées sur chaque axe
- Une variable est bien représentée si son cosinus carré est élevé
- Variables proches = fortement corrélées

**Pour les individus** (villes):
- Identifier les individus caractéristiques de chaque axe
- Coordonnées élevées (positives ou négatives) = forte contribution

### 4. Choix du nombre de clusters

**Méthodes**:
1. **Critère du coude**: Graphique de l'inertie vs nombre de clusters
2. **Interprétabilité**: Les clusters doivent avoir du sens métier
3. **Dendrogramme**: Observer les sauts de distance importants
4. **Silhouette score**: Mesure la qualité du clustering

## Travail effectué

### 1. Réalisation de l'ACP normée

Reprise du TP1:
- Standardisation des 12 variables (températures mensuelles)
- Calcul des composantes principales
- Conservation des 2 premières composantes (≈85-90% de variance)

### 2. Description des axes factoriels

#### Axe 1 (70-80% de variance)
**Zone centrale**:
- Avril, Septembre, Octobre, Moyenne (variables proches du centre)
- Contribution modérée

**Zone concentrée**:
- Latitude: Forte corrélation négative
- Mois d'automne et printemps bien représentés

**Individus caractéristiques**:
- **Positifs**: Bordeaux, Montpellier, Marseille, Nice (Sud)
- **Négatifs**: Lille, Strasbourg, Brest (Nord)

**Interprétation**: Axe Nord-Sud, gradient de température moyenne

#### Axe 2 (15-20% de variance)
**Corrélations**:
- Positivement corrélé: Juin, Juillet, Longitude, Amplitude
- Négativement corrélé: Janvier, Décembre, Février, Novembre

**Individus caractéristiques**:
- **Positifs**: Marseille, Grenoble, Lyon, Strasbourg (fortes amplitudes)
- **Négatifs**: Brest, Rennes, Nantes (faibles amplitudes, climat océanique)

**Interprétation**: Axe Est-Ouest, amplitude thermique et continentalité

### 3. Classification des villes

#### Classification avec 1ère composante uniquement
Deux grands groupes naturels:
- **Groupe 1**: Lille, Strasbourg, Brest, Vichy, Clermont-Ferrand, Grenoble, Rennes, Paris, Lyon, Nantes, Nice
- **Groupe 2**: Marseille, Montpellier, Toulouse, Bordeaux

#### Classification avec 2 composantes
Trois groupes identifiés:
1. **Cluster 1**: Strasbourg, Lille, Grenoble, Lyon, Vichy, Clermont-Ferrand, Paris
   - Caractéristiques: Nord et centre, climat continental
   
2. **Cluster 2**: Brest, Rennes, Nantes
   - Caractéristiques: Ouest, climat océanique, faible amplitude

3. **Cluster 3**: Nice, Marseille, Montpellier, Toulouse, Bordeaux
   - Caractéristiques: Sud, températures élevées

#### Classification avec toutes les composantes
Résultats similaires mais plus nuancés:
- Mêmes groupes principaux
- Séparation plus fine au sein des clusters

### 4. Choix de la meilleure classification

**Classification optimale: 2 composantes, 3 clusters**

**Justification**:
1. Les 2 premières composantes capturent 85-90% de l'information
2. 3 clusters correspondent aux grandes zones climatiques françaises:
   - Océanique (Ouest)
   - Continental (Nord/Centre)
   - Méditerranéen (Sud)
3. Séparation claire visible sur le plan factoriel
4. Bonne homogénéité intra-cluster
5. Bonne séparation inter-cluster

### 5. Coupure et identification des paragons

**Paragons** = individus les plus proches du centre de gravité du cluster (individus les plus représentatifs)

Pour chaque cluster:
- Calculer le barycentre (centre de gravité)
- Calculer la distance de chaque ville au barycentre
- Le paragon est la ville la plus proche

**Résultats**:
- **Cluster 1 (Continental)**: Vichy ou Clermont-Ferrand
- **Cluster 2 (Océanique)**: Rennes
- **Cluster 3 (Méditerranéen)**: Toulouse ou Montpellier

## Implémentation Python

### Bibliothèques utilisées

```python noexec
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
```

### Étapes principales

1. **Préparation des données**:
   ```python
   scaler = StandardScaler()
   scaled_data = scaler.fit_transform(data)
   ```

2. **ACP**:
   ```python
   pca = PCA(n_components=2)
   principal_components = pca.fit_transform(scaled_data)
   ```

3. **Classification hiérarchique**:
   ```python
   linkage_matrix = linkage(principal_components, method='ward')
   clusters = fcluster(linkage_matrix, n_clusters, criterion='maxclust')
   ```

4. **Visualisation**:
   ```python
   dendrogram(linkage_matrix, labels=city_names)
   ```

## Métriques d'évaluation

### 1. Inertie intra-cluster (Within-Cluster Sum of Squares)
Mesure la compacité des clusters:
- Plus faible = clusters plus homogènes
- Formule: Σ(distance²(point, centre))

### 2. Inertie inter-cluster (Between-Cluster Sum of Squares)
Mesure la séparation entre clusters:
- Plus élevée = clusters mieux séparés
- Formule: Σ(taille_cluster × distance²(centre_cluster, centre_global))

### 3. Silhouette score
Combine compacité et séparation:
- Score de -1 à 1
- > 0.5: bonne séparation
- Formule: (b - a) / max(a, b)
  - a = distance moyenne intra-cluster
  - b = distance moyenne au cluster le plus proche

### 4. Davies-Bouldin Index
Ratio de la dispersion intra-cluster à la séparation inter-cluster:
- Plus faible = meilleur clustering
- Minimum théorique: 0

## Comparaison CAH vs autres méthodes

| Méthode | Avantages | Inconvénients |
|---------|-----------|---------------|
| **CAH (Ward)** | Hiérarchie visible, pas de k fixé, stable | O(n³), sensible aux outliers |
| **K-means** | Rapide O(n), scalable | k fixé, sensible à l'initialisation |
| **DBSCAN** | Trouve clusters arbitraires, gère outliers | Paramètres difficiles, densité variable |
| **GMM** | Clusters probabilistes, flexible | Suppose distribution gaussienne |

## Applications pratiques

1. **Marketing**: Segmentation de clients
2. **Biologie**: Taxonomie, classification d'espèces
3. **Géographie**: Zonage climatique, régionalisation
4. **Finance**: Regroupement d'actifs similaires
5. **Santé**: Classification de patients, groupes à risque

## Points clés à retenir

1. **ACP avant CAH**: Réduit le bruit et la dimensionnalité
2. **Ward est optimal** pour données continues et clusters sphériques
3. **Dendrogramme** = outil de décision pour le nombre de clusters
4. **2 composantes suffisent** pour capturer l'essentiel (règle des 80%)
5. **Validation**: Toujours vérifier la cohérence métier des clusters
6. **Paragons**: Facilitent l'interprétation et la communication

## Extensions possibles

1. Clustering sur d'autres composantes (PC3, PC4)
2. Comparaison avec K-means
3. Analyse de stabilité des clusters (bootstrap)
4. Profiling détaillé de chaque cluster
5. Prédiction de l'appartenance de nouvelles villes
