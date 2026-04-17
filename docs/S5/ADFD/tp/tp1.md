---
title: "TP 1: Analyse en Composantes Principales (PCA)"
sidebar_position: 1
---

# TP 1: Analyse en Composantes Principales (PCA)

## Objectif

Ce TP introduit l'Analyse en Composantes Principales (ACP), une technique de réduction de dimensionnalité qui permet de visualiser et d'analyser des données multidimensionnelles en projetant les variables sur un espace de dimension réduite tout en conservant le maximum d'information.

## Contexte

Étude des températures mensuelles moyennes de 17 villes françaises sur une année complète (12 mois). L'objectif est d'identifier des groupes de villes ayant des profils climatiques similaires et de comprendre quelles variables (mois) contribuent le plus à ces différences.

## Concepts clés

### 1. Analyse en Composantes Principales (ACP/PCA)

L'ACP est une méthode d'analyse de données qui permet de:
- Réduire la dimensionnalité (12 variables → 2-3 composantes principales)
- Visualiser les données dans un espace 2D
- Identifier les corrélations entre variables
- Regrouper des individus similaires

### 2. Composantes Principales

Les composantes principales (ou axes factoriels) sont des combinaisons linéaires des variables originales qui capturent le maximum de variance:
- **Axe 1**: Capture la plus grande variance (ici ~70-80%)
- **Axe 2**: Capture la deuxième plus grande variance (ici ~15-20%)
- Les axes sont orthogonaux (non corrélés)

### 3. Interprétation des résultats

#### Plan factoriel des individus
- Visualise la projection des villes sur les deux premiers axes
- Les villes proches ont des profils de température similaires
- Les villes éloignées ont des profils différents

#### Plan factoriel des variables
- Visualise la contribution de chaque mois aux axes
- Les variables proches sont corrélées
- L'angle avec un axe indique la contribution à cet axe
- Les variables opposées sont négativement corrélées

### 4. Qualité de représentation

- **Inertie**: Pourcentage de variance expliquée par chaque axe
- **Contribution**: Importance d'un individu/variable pour un axe
- **Qualité de représentation**: Pourcentage de l'information d'un individu préservée sur les axes retenus

## Travail à effectuer

### A. Analyse des individus (villes)

1. **Statistiques descriptives** (Question 4a)
   - Températures moyennes plus élevées entre Juin et Septembre
   - Plus basse fluctuation entre Décembre et Avril
   - Plus forte fluctuation entre Mars et Mai
   
2. **Corrélation entre variables** (Question 4b)
   - Mois proches fortement corrélés
   - Mois d'été (Juin, Juillet, Août) et automne (Septembre, Octobre, Novembre) corrélés positivement
   - Hiver vs été négativement corrélés

3. **Projection sur le plan factoriel** (Question 5a)
   - Premier axe (70%): Représente les villes de Bret, Montpellier et Strasbourg
   - Deuxième axe (15-20%): Brest domine avec 49% de contribution
   
4. **Groupes de villes identifiés**:
   - **Groupe 1**: Bret, Nice, Lille, Nantes et Rennes (nord-ouest)
   - **Groupe 2**: Toulouse, Bordeaux, Montpellier et Marseille (sud)
   - **Groupe 3**: Grenoble et Lyon (centre)
   - **Groupe 4**: Vichy, Paris et Clermont-Ferrand (centre-nord)

### B. Analyse des variables (mois)

1. **Représentation des mois** (Question 5b)
   - Mars, Avril, Août à Novembre: Mieux représentés par l'axe 1
   - Juin, Juillet, Hiver (Décembre, Janvier): Mieux représentés par l'axe 2
   
2. **Interprétation des axes**:
   - **Axe 1**: Relié à la latitude (Nord-Sud) et à la température moyenne
   - **Axe 2**: Relié à la longitude (Est-Ouest) et à l'amplitude thermique

3. **Contribution des variables**:
   - Une variable contribue significativement si sa valeur-test > 2
   - La qualité de représentation se calcule via le tableau des corrélations

## Classification hiérarchique (CAH-MIXTE)

### Méthode

1. Utiliser les 2 premières composantes (suffisantes pour 85-90% de l'information)
2. Choisir une coupure pour obtenir 2 ou 3 groupes
3. Identifier les paragons (individus les plus proches du centre de chaque groupe)

### Résultats

#### Classification en 2 classes
- **Classe 1**: Villes du Nord et de l'Ouest (températures plus basses)
- **Classe 2**: Villes du Sud (températures plus élevées)

#### Classification en 3 classes
- **Classe 1**: Montpellier et Bordeaux
- **Classe 2**: Rennes et Nantes
- **Classe 3**: Vichy et Clermont-Ferrand

Les paragons de chaque classe sont les villes les plus représentatives du groupe.

## Outils et bibliothèques Python

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.cluster.hierarchy import fcluster
```

## Points clés à retenir

1. **ACP normalée**: Nécessaire quand les variables ont des échelles différentes (ici, utilisation obligatoire)
2. **Nombre de composantes**: Garder les composantes qui totalisent 80-90% de la variance
3. **Interprétation géométrique**: 
   - Distance entre individus = similarité
   - Angle entre variables = corrélation
4. **Cloud des individus vs cloud des variables**: Deux visualisations complémentaires
5. **Classification post-ACP**: Utiliser les composantes principales comme nouvelles variables pour la classification

## Applications pratiques

- Segmentation de clients en marketing
- Analyse de profils génétiques en biologie
- Compression d'images
- Analyse de données climatiques
- Réduction de dimensionnalité avant classification supervisée
