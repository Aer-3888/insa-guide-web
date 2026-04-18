---
title: "ADFD -- Analyse de Donnees et Fouille de Donnees"
sidebar_position: 0
---

# ADFD -- Analyse de Donnees et Fouille de Donnees

## Presentation du cours

ADFD est un cours de 3e annee (S5) a l'INSA Rennes, departement Informatique. Il couvre les fondements de l'analyse de donnees et de la fouille de donnees, du pretraitement des donnees aux methodes d'apprentissage non supervise pour la reduction de dimensionnalite, le clustering et l'extraction de motifs.

**Enseignants** : Peggy Cellier (INSA Rennes), avec des contributions TP de Francesco Bariatti, Ludovic Jean-Baptiste (Universite de Caen), Mehdi Kaytoue (INSA Lyon)

**Langue** : Les cours et examens sont en francais.

## Structure du cours

Le cours se divise en deux grandes parties :

| Partie | Nom | Sujets |
|--------|-----|--------|
| **AD** -- Analyse de Donnees | Analyse de Donnees | Pretraitement, ACP, Reduction de dimensionnalite |
| **FD** -- Fouille de Donnees | Fouille de Donnees | Clustering, Itemsets frequents, Fouille de motifs, NLP |

## Liste des chapitres

| # | Fichier | Sujet | Concepts cles |
|---|---------|-------|---------------|
| 1 | [01-preprocessing.md](/S5/ADFD/guide/01-preprocessing) | Pretraitement des donnees | Valeurs manquantes, valeurs aberrantes, normalisation, encodage |
| 2 | [02-pca.md](/S5/ADFD/guide/02-pca) | ACP (Analyse en Composantes Principales) | Valeurs propres, cercle des correlations, variance, plans factoriels |
| 3 | [03-clustering.md](/S5/ADFD/guide/03-clustering) | Methodes de clustering | CAH, K-means, DBSCAN, dendrogrammes, metriques |
| 4 | [04-data-mining-nlp.md](/S5/ADFD/guide/04-data-mining-nlp) | Fouille de donnees et NLP | Itemsets frequents, Apriori, pretraitement de texte, TF-IDF |
| 5 | [05-pandas.md](/S5/ADFD/guide/05-pandas) | Pandas et manipulation de donnees | DataFrames, groupby, filtrage, gestion de CSV |

## Concepts cles en un coup d'oeil

### Analyse de Donnees (AD)

- **Pretraitement** : Nettoyage des donnees avant analyse -- gestion des valeurs manquantes, des valeurs aberrantes (points aberrants), normalisation (standardisation) et encodage des variables categorielles.
- **ACP** (Analyse en Composantes Principales) : La technique centrale de la partie AD. Transforme des variables correlees en composantes principales non correlees qui maximisent la variance capturee. Produit le cercle des correlations et les plans factoriels.
- **Reduction de dimension** : Categorie plus large incluant la selection de variables (methodes a base de filtres, enveloppantes, integrees) et l'extraction de variables (ACP, t-SNE).

### Fouille de Donnees (FD)

- **Clustering** : Regroupement des observations en clusters homogenes. Methodes etudiees : CAH avec critere de Ward, K-means, DBSCAN.
- **Itemsets frequents** (Motifs frequents) : Algorithme Apriori pour l'extraction d'items co-occurrents au-dessus d'un seuil de support minimum.
- **Fouille de motifs** : Techniques avancees pour l'extraction de motifs sequentiels et de regles d'association.
- **Pretraitement NLP/Texte** : Suppression des mots vides, normalisation des accents, filtrage par expressions regulieres pour l'analyse de tags.

## Format des examens

Le cours comporte generalement deux examens distincts :

| Examen | Duree | Contenu |
|--------|-------|---------|
| **DS AD** (Analyse de Donnees) | ~2h | Interpretation de l'ACP, lecture du cercle des correlations, questions de pretraitement |
| **DS FD** (Fouille de Donnees) | ~2h | Clustering (DBSCAN, K-means, CAH), extraction d'itemsets, algorithme Apriori |

Certaines annees proposent un examen unique combine (ADFD).

## Bibliotheques Python utilisees

```python noexec
# Manipulation de donnees
import pandas as pd
import numpy as np

# Visualisation
import matplotlib.pyplot as plt
import seaborn as sns

# Machine Learning
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.cluster import DBSCAN, KMeans

# Clustering hierarchique
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from scipy.spatial.distance import cdist

# Metriques d'evaluation
from sklearn.metrics import silhouette_score, davies_bouldin_score

# Cartographie (pour TP3-4)
import folium

# Texte / NLP (pour TP3-4)
import nltk
from nltk.corpus import stopwords
from mlxtend.frequent_patterns import apriori
from mlxtend.preprocessing import TransactionEncoder
```

## Strategie de revision

1. **Maitriser l'interpretation de l'ACP en priorite** -- c'est le sujet le plus frequemment teste aux examens AD.
2. **Connaitre les algorithmes de clustering par coeur** -- etre capable de derouler DBSCAN et K-means pas a pas sur de petits exemples.
3. **Pratiquer Apriori a la main** -- les examens sur les itemsets frequents incluent toujours un calcul manuel.
4. **Comprendre quand utiliser quoi** -- les examens demandent souvent de justifier le choix de methode.
5. **Lire le cercle des correlations** -- c'est la competence la plus importante pour reussir l'examen.
