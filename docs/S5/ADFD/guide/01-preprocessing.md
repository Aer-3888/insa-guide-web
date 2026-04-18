---
title: "Chapitre 1 : Pretraitement des donnees"
sidebar_position: 1
---

# Chapitre 1 : Pretraitement des donnees

## Presentation

Le pretraitement des donnees est la premiere etape -- et la plus critique -- de toute pipeline d'analyse ou de fouille de donnees. Les donnees reelles ne sont presque jamais propres : elles contiennent des valeurs manquantes, des valeurs aberrantes, des incoherences et des biais. La qualite de votre analyse depend entierement de la qualite de votre pretraitement.

## 1. La pipeline d'analyse de donnees

```
Donnees brutes --> Pretraitement --> Analyse (ACP, Clustering) --> Interpretation --> Connaissance
```

L'etape de pretraitement comprend :
1. Comprendre les donnees (types, distributions, dimensions)
2. Traiter les valeurs manquantes
3. Detecter et traiter les valeurs aberrantes (points aberrants)
4. Transformer les variables (normalisation, transformations log, encodage)
5. Selectionner ou extraire les variables pertinentes (reduction de dimension)

## 2. Types de variables

| Type | Exemples | Operations |
|------|----------|------------|
| **Quantitative continue** | Temperature, taille, prix | Moyenne, ecart-type, correlation |
| **Quantitative discrete** | Nombre de pieces, comptage | Mode, frequence |
| **Qualitative ordinale** | Note de qualite (1-10), niveau d'etudes | Mediane, rang |
| **Qualitative nominale** | Couleur, ville, sexe | Mode, frequence |

**Point cle pour les examens** : Les variables codees en entiers (ex. OverallQual = 1-10) peuvent en realite etre categorielles (qualitatives) et non numeriques. Verifiez toujours la semantique, pas seulement le dtype.

## 3. Valeurs manquantes

### Detection

```python noexec
# Compter les valeurs manquantes par colonne
df.isnull().sum()

# Pourcentage de valeurs manquantes
(df.isnull().sum() / len(df)) * 100

# Visualiser les patterns de valeurs manquantes
import seaborn as sns
sns.heatmap(df.isnull(), cbar=True)
```

### Strategies de traitement

| Strategie | Quand l'utiliser | Code |
|-----------|-----------------|------|
| **Suppression des lignes** | Tres peu de valeurs manquantes (<5%) | `df.dropna()` |
| **Suppression des colonnes** | Colonne avec >50% de manquants | `df.drop(columns=[...])` |
| **Imputation par la moyenne** | Numerique, distribution symetrique | `SimpleImputer(strategy="mean")` |
| **Imputation par la mediane** | Numerique, distribution asymetrique | `SimpleImputer(strategy="median")` |
| **Imputation par le mode** | Variables categorielles | `SimpleImputer(strategy="most_frequent")` |
| **Imputation par constante** | Logique specifique au domaine | `SimpleImputer(strategy="constant", fill_value=0)` |

### Exemple concret (issu du TP1)

Le jeu de donnees House Prices contient 81 variables. L'analyse des valeurs manquantes revele :

```
PoolQC         99.5%   --> Supprimer (trop de manquants)
MiscFeature    96.3%   --> Supprimer
Alley          93.8%   --> Supprimer
Fence          80.8%   --> Supprimer
MasVnrType     59.7%   --> Considerer le contexte
LotFrontage    17.7%   --> Imputer par la mediane
GarageYrBlt     5.5%   --> Imputer par la mediane
MasVnrArea      0.55%  --> Imputer par la mediane (seulement 8 valeurs)
```

**Regle de decision** : Si une colonne a >50% de valeurs manquantes, elle contient peu d'information -- la suppression est generalement la meilleure option. Pour les colonnes numeriques avec <20% de manquants, l'imputation par la mediane est l'approche standard.

```python noexec
from sklearn.impute import SimpleImputer

imputer = SimpleImputer(strategy="median")
df_imputed = pd.DataFrame(
    imputer.fit_transform(df_num),
    columns=df_num.columns,
    index=df_num.index
)
```

## 4. Valeurs aberrantes (points aberrants)

### Methodes de detection

**1. Basee sur les percentiles (utilisee dans le cours)** :
```python noexec
q99 = df.quantile(0.99)
mask = (df <= q99).all(axis=1)
df_clean = df[mask]
```

**2. IQR (ecart interquartile)** :
```python noexec
Q1 = df.quantile(0.25)
Q3 = df.quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
mask = ((df >= lower) & (df <= upper)).all(axis=1)
```

**3. Z-score** : Les points avec |z| > 3 sont consideres comme aberrants.
```python noexec
from scipy import stats
z_scores = np.abs(stats.zscore(df))
mask = (z_scores < 3).all(axis=1)
```

### Traitement

- **Supprimer** : Quand les valeurs aberrantes sont des erreurs ou du bruit extreme
- **Ecreter/Borner** (winsorize) : Remplacer les valeurs extremes par la borne du percentile
- **Transformation log** : Reduit l'impact des valeurs extremes

### Exemple concret (issu du TP1)

Avant suppression des valeurs aberrantes : 1460 observations
Apres suppression au 99e percentile : 1326 observations (~9% supprimees)

Impact sur la regression lineaire :
- RMSE sans nettoyage : ~39 280 $
- RMSE avec nettoyage : ~32 393 $
- **Amelioration : ~6 888 $ de reduction de l'erreur de prediction**

## 5. Transformations de variables

### Standardisation (centrage-reduction)

**Indispensable pour l'ACP.** Centre les donnees a moyenne=0 et met a l'echelle ecart-type=1.

Formule : `z = (x - moyenne) / ecart-type`

```python noexec
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**Quand l'utiliser** : Toujours avant l'ACP (ACP normee) et quand les variables ont des unites ou des echelles differentes.

### Transformation logarithmique

Utilisee pour les distributions asymetriques a droite (beaucoup de petites valeurs, peu de grandes valeurs).

```python noexec
# log1p = log(1 + x), gere les zeros
df_log = np.log1p(df[cols_to_log])
```

**Cas d'usage courant** : Variables de surface (LotArea, GarageArea), variables de prix, donnees de comptage.

**Piege** : Les variables inflationees de zeros (comme WoodDeckSF ou 52% des valeurs sont 0) auront un pic a log(1) = 0 apres transformation. C'est normal mais doit etre note.

### Encodage des variables categorielles

| Methode | Cas d'usage | Exemple |
|---------|-------------|---------|
| **One-hot encoding** | Variables nominales avec peu de categories | `pd.get_dummies(df, columns=['Color'])` |
| **Label encoding** | Variables ordinales | `LabelEncoder().fit_transform(df['Quality'])` |
| **Target encoding** | Categorielle a forte cardinalite avec variable cible | Moyenne de la cible par categorie |

## 6. Selection de variables

Le cours presente quatre familles de methodes :

### Methodes a base de filtres
- Independantes de l'algorithme d'apprentissage
- Rapides mais performance moderee
- Exemples : **Seuil de variance**, **Filtre de correlation**, **Information mutuelle**

### Methodes enveloppantes (wrapper)
- Dependent du modele d'apprentissage
- Couteuses mais bonne performance
- Exemples : **Selection progressive (forward)**, **Elimination regressive (backward)**, **Recherche exhaustive**

### Methodes integrees (embedded)
- La selection se fait pendant l'apprentissage
- Compromis entre vitesse et performance
- Exemples : **Selection par arbres de decision**, **Lasso**, **Ridge**, **Elastic Net**

### Methodes hybrides
- Combinent filtre + wrapper ou filtre + embedded
- Exemples : **Importance par permutation**, **Elimination recursive de variables**

## 7. Extraction de variables

Au lieu de selectionner des variables existantes, on en cree de nouvelles qui resument les donnees :

| Methode | Description | Cas d'usage |
|---------|-------------|-------------|
| **ACP** | Projection lineaire maximisant la variance | Usage general, donnees continues |
| **t-SNE** | Plongement non lineaire pour la visualisation | Visualisation de donnees en haute dimension |

L'ACP est traitee en detail dans le [Chapitre 2](/S5/ADFD/guide/02-pca).

## Pieges courants

1. **Imputer avant la separation train/test** : L'imputation doit etre ajustee sur les donnees d'entrainement uniquement, puis appliquee aux donnees de test pour eviter les fuites de donnees (data leakage).
2. **Oublier de standardiser avant l'ACP** : L'ACP sur des donnees non standardisees sera dominee par les variables ayant les plus grandes echelles.
3. **Supprimer trop de lignes** : Si la suppression des NaN enleve >10% des donnees, envisagez l'imputation.
4. **Traiter des categorielles codees en entiers comme numeriques** : Verifiez toujours la signification semantique des variables.
5. **Appliquer le log a des valeurs nulles ou negatives** : Utilisez `log1p` (log(1+x)) pour les donnees contenant des zeros.

---

## AIDE-MEMOIRE

### Reference rapide valeurs manquantes

| Situation | Action |
|-----------|--------|
| Colonne >50% manquante | Supprimer la colonne |
| Numerique, <20% manquant | Imputer par la mediane |
| Categorielle, <20% manquant | Imputer par le mode |
| Peu de lignes affectees (<5%) | Supprimer les lignes |
| Pattern structure | Investiguer la cause d'abord |

### Formules cles

| Transformation | Formule | Python |
|----------------|---------|--------|
| Standardiser | z = (x - mu) / sigma | `StandardScaler()` |
| Min-Max | x' = (x - min) / (max - min) | `MinMaxScaler()` |
| Log | x' = log(1 + x) | `np.log1p(x)` |
| Aberrant par Z-score | \|z\| > 3 est aberrant | `stats.zscore(x)` |
| Aberrant par IQR | x < Q1 - 1.5*IQR ou x > Q3 + 1.5*IQR | Calcul manuel |

### Pipeline de pretraitement

```python noexec
# 1. Charger
df = pd.read_csv("data.csv")

# 2. Explorer
df.info()
df.describe()
df.isnull().sum()

# 3. Traiter les valeurs manquantes
imputer = SimpleImputer(strategy="median")
df_imputed = imputer.fit_transform(df_num)

# 4. Supprimer les valeurs aberrantes
q99 = df.quantile(0.99)
df_clean = df[(df <= q99).all(axis=1)]

# 5. Transformer les variables asymetriques
df_clean[cols] = np.log1p(df_clean[cols])

# 6. Standardiser (pour l'ACP)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df_clean)
```
