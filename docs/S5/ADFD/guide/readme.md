---
title: "ADFD -- Analyse de Donnees et Fouille de Donnees (Data Analysis & Data Mining)"
sidebar_position: 0
---

# ADFD -- Analyse de Donnees et Fouille de Donnees (Data Analysis & Data Mining)

## Course Overview

ADFD is a 3rd-year (S5) course at INSA Rennes, Department of Computer Science. It covers the foundations of data analysis and data mining, from data preprocessing to unsupervised learning methods for dimensionality reduction, clustering, and pattern extraction.

**Instructors**: Peggy Cellier (INSA Rennes), with TP contributions from Francesco Bariatti, Ludovic Jean-Baptiste (Universite de Caen), Mehdi Kaytoue (INSA Lyon)

**Language**: Lectures and exams are in French. This guide is written in English but preserves key French terminology.

## Course Structure

The course is split into two major parts:

| Part | French Name | Topics |
|------|-------------|--------|
| **AD** -- Analyse de Donnees | Data Analysis | Preprocessing, PCA, Dimensionality Reduction |
| **FD** -- Fouille de Donnees | Data Mining | Clustering, Frequent Itemsets, Pattern Mining, NLP |

## Chapter List

| # | Chapter File | Topic | Key Concepts |
|---|-------------|-------|--------------|
| 1 | [01-preprocessing.md](/S5/ADFD/guide/01-preprocessing) | Data Preprocessing | Missing values, outliers, normalization, encoding |
| 2 | [02-pca.md](/S5/ADFD/guide/02-pca) | PCA (Analyse en Composantes Principales) | Eigenvalues, correlation circle, variance, factorial planes |
| 3 | [03-clustering.md](/S5/ADFD/guide/03-clustering) | Clustering Methods | CAH, K-means, DBSCAN, dendrograms, metrics |
| 4 | [04-data-mining-nlp.md](/S5/ADFD/guide/04-data-mining-nlp) | Data Mining & NLP | Frequent itemsets, Apriori, text preprocessing, TF-IDF |
| 5 | [05-pandas.md](/S5/ADFD/guide/05-pandas) | Pandas & Data Manipulation | DataFrames, groupby, filtering, CSV handling |

## Key Concepts at a Glance

### Data Analysis (AD)

- **Preprocessing** (Pretraitement): Cleaning data before analysis -- handling missing values (valeurs manquantes), outliers (points aberrants), normalization (standardisation), and encoding categorical variables.
- **PCA / ACP** (Analyse en Composantes Principales): The central technique of the AD part. Transforms correlated variables into uncorrelated principal components that maximize captured variance. Produces the correlation circle (cercle des correlations) and factorial planes (plans factoriels).
- **Dimensionality Reduction** (Reduction de dimension): Broader category including variable selection (filter, wrapper, embedded methods) and variable extraction (PCA, t-SNE).

### Data Mining (FD)

- **Clustering**: Grouping observations into homogeneous clusters. Methods studied: CAH with Ward criterion, K-means, DBSCAN.
- **Frequent Itemsets** (Itemsets frequents): Apriori algorithm for mining co-occurring items above a minimum support threshold.
- **Pattern Mining** (Fouille de motifs): Advanced techniques for extracting sequential patterns and association rules.
- **NLP/Text Preprocessing**: Stopword removal, accent normalization, regex filtering for tag analysis.

## Exam Format

The course typically has two separate exams:

| Exam | Duration | Content |
|------|----------|---------|
| **DS AD** (Analyse de Donnees) | ~2h | PCA interpretation, correlation circle reading, preprocessing questions |
| **DS FD** (Fouille de Donnees) | ~2h | Clustering (DBSCAN, K-means, CAH), itemset mining, Apriori algorithm |

Some years have a single combined exam (ADFD).

## Python Libraries Used

```python noexec
# Data manipulation
import pandas as pd
import numpy as np

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns

# Machine Learning
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.cluster import DBSCAN, KMeans

# Hierarchical clustering
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from scipy.spatial.distance import cdist

# Evaluation metrics
from sklearn.metrics import silhouette_score, davies_bouldin_score

# Cartography (for TP3-4)
import folium

# Text / NLP (for TP3-4)
import nltk
from nltk.corpus import stopwords
from mlxtend.frequent_patterns import apriori
from mlxtend.preprocessing import TransactionEncoder
```

## Study Strategy

1. **Master PCA interpretation first** -- it is the most heavily tested topic in AD exams.
2. **Know the clustering algorithms by heart** -- be able to trace DBSCAN and K-means step-by-step on small examples.
3. **Practice Apriori by hand** -- frequent itemset exams always include manual computation.
4. **Understand when to use what** -- exams often ask you to justify your choice of method.
5. **Read the correlation circle** -- this is the single most important skill for exam success.
