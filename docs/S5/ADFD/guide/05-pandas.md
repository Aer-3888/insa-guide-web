---
title: "Chapitre 5 : Pandas et manipulation de donnees"
sidebar_position: 5
---

# Chapitre 5 : Pandas et manipulation de donnees

## Presentation

Pandas est la bibliotheque Python utilisee tout au long du cours ADFD pour le chargement, l'exploration, le nettoyage et la transformation des donnees. La maitrise de Pandas est indispensable pour tous les TP et pour comprendre le code des solutions d'examen.

Ce chapitre est base sur le notebook `pandas_intro.ipynb` fourni dans le cours.

## 1. Structures de donnees fondamentales

### DataFrame

Structure de donnees tabulaire 2D avec des lignes (index) et des colonnes etiquetees.

```python noexec
import pandas as pd
import numpy as np

# Creation a partir d'un dictionnaire
df = pd.DataFrame({
    'Region': ['core worlds', 'mid rim', 'outer rim'],
    'Moons': [4, 3, 0],
    'Diameter': [12.240, 12.765, 14.410]
}, index=['Coruscant', 'Kashyyyk', 'Dagobah'])
```

### Series

Tableau 1D etiquete (equivalent a une seule colonne d'un DataFrame).

```python noexec
s = pd.Series([1, 2, 3], index=['a', 'b', 'c'])
```

### Attributs cles

```python noexec
df.index        # Etiquettes des lignes
df.columns      # Noms des colonnes
df.shape        # (n_lignes, n_colonnes)
df.dtypes       # Types de donnees par colonne
len(df)         # Nombre de lignes
```

## 2. Chargement des donnees

### Depuis un CSV (le cas le plus courant dans le cours)

```python noexec
# Chargement basique
df = pd.read_csv("flickrRennes.csv")

# Avec colonne d'index
df = pd.read_csv("temperatures.csv", index_col=0)

# En specifiant le separateur
df = pd.read_csv("data.csv", sep=";")
```

### Exploration

```python noexec
df.head()           # 5 premieres lignes
df.head(10)         # 10 premieres lignes
df.tail()           # 5 dernieres lignes
df.info()           # Types de colonnes, comptage des non-null, memoire
df.describe()       # Statistiques pour les colonnes numeriques (moyenne, ecart-type, min, max, quartiles)
df.shape            # (lignes, colonnes)
```

## 3. Selection des donnees

### Selection de colonnes (projection)

```python noexec
# Colonne unique --> retourne une Series
df["Region"]
df.Region          # Syntaxe alternative (uniquement pour les noms de colonnes simples)

# Colonnes multiples --> retourne un DataFrame
df[["Moons", "Diameter"]]
```

### Selection de lignes (filtrage)

```python noexec
# Masque booleen
mask = df["Region"] == "outer rim"
df_outer = df[mask]

# Combine en une seule ligne
df_outer = df[df["Region"] == "outer rim"]

# Conditions multiples (utiliser & pour ET, | pour OU, ~ pour NON)
df_filtered = df[(df["Moons"] > 2) & (df["Diameter"] < 15)]

# Predicats complexes avec apply
def keep(row):
    return row["Region"].endswith("rim")

mask = df.apply(keep, axis=1)
df_filtered = df[mask]
```

### Selection par position

```python noexec
df.iloc[0]          # Premiere ligne (par position)
df.iloc[0:3]        # 3 premieres lignes
df.iloc[0, 1]       # Ligne 0, Colonne 1
df.loc["Coruscant"] # Par etiquette
```

## 4. Modification des donnees

### Ajout/Modification de colonnes

```python noexec
# Ajouter une nouvelle colonne
df["Random"] = np.random.randn(len(df))

# Modifier une colonne existante
df["Moons"] = df["Moons"] * 2

# Appliquer une fonction a une colonne
df["Log_Diameter"] = np.log1p(df["Diameter"])
```

### Gestion des valeurs manquantes

```python noexec
# Detecter
df.isnull()                    # Masque booleen
df.isnull().sum()              # Comptage par colonne
df.isnull().sum() / len(df)    # Pourcentage par colonne

# Supprimer
df.dropna()                    # Supprimer les lignes avec NaN
df.dropna(subset=['lat'])      # Supprimer les lignes ou 'lat' est NaN

# Remplir
df.fillna(0)                   # Remplacer NaN par 0
df.fillna(df.mean())           # Remplacer par la moyenne de la colonne
df["tags"].fillna("")          # Remplacer NaN dans une colonne specifique
```

### Suppression des doublons

```python noexec
# Supprimer les lignes en double exactes
df = df.drop_duplicates()

# Supprimer les doublons bases sur des colonnes specifiques
df = df.drop_duplicates(subset=['id_photo'])

# Garder la premiere/derniere occurrence
df = df.drop_duplicates(subset=['user_id', 'date'], keep='first')
```

## 5. Agregation et regroupement

### Valeurs uniques et comptages

```python noexec
# Nombre de valeurs uniques par colonne
df.nunique()

# Valeurs uniques d'une colonne
df["Region"].unique()

# Compter les occurrences de chaque valeur
df["Region"].value_counts()
```

### GroupBy

L'equivalent SQL de GROUP BY : decouper les donnees en groupes, appliquer une fonction, combiner les resultats.

```python noexec
groups = df.groupby("Region")

# Fonctions d'agregation
groups.size()          # Nombre de lignes par groupe
groups.mean()          # Moyenne de chaque colonne numerique par groupe
groups.first()         # Premiere ligne de chaque groupe
groups.count()         # Compter les valeurs non-null par groupe
groups.sum()           # Somme par groupe
groups.agg(['mean', 'std'])  # Agregations multiples

# Colonnes de regroupement multiples
photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

**Le parametre `as_index=False`** : Empeche les colonnes regroupees de devenir l'index (les conserve comme colonnes normales).

## 6. Iteration

```python noexec
# Iterer sur les noms de colonnes
for col_name in df:
    print(col_name)

# Iterer sur les lignes (lent -- utiliser les operations vectorisees quand c'est possible)
for index, row in df.iterrows():
    print(index, row["Region"])

# Appliquer une fonction a chaque ligne (plus rapide que iterrows)
df.apply(lambda row: row["Moons"] * 2, axis=1)
```

## 7. Types de donnees

### Verification des types

```python noexec
df.dtypes                          # Type de chaque colonne
df.select_dtypes(include=["object"])   # Colonnes de type object (chaines) uniquement
df.select_dtypes(exclude=["object"])   # Colonnes numeriques uniquement
(df.dtypes != "object").sum()          # Compter les colonnes non-object
```

### Conversion de types

```python noexec
df["Moons"] = df["Moons"].astype(float)
df["date"] = pd.to_datetime(df["date_taken"])
```

## 8. Visualisation avec Pandas

```python noexec
# Histogramme
df["Diameter"].hist(bins=30)

# Nuage de points
df.plot.scatter(x="GrLivArea", y="SalePrice")

# Boite a moustaches
df.boxplot(column="Diameter", by="Region")

# Diagramme en barres
df["Region"].value_counts().plot.bar()
```

## 9. Motifs courants du cours

### Motif 1 : Tableau d'analyse des valeurs manquantes

```python noexec
table_na = pd.DataFrame({
    'nb_na': df.isnull().sum(),
    'pct_na': (df.isnull().sum() / len(df)) * 100
})
table_na = table_na.sort_values('pct_na', ascending=False)
table_na.head(10)
```

### Motif 2 : Selectionner les colonnes numeriques pour l'ACP

```python noexec
cols_numeric = ["LotArea", "MasVnrArea", "BsmtFinSF1", "TotalBsmtSF",
                "1stFlrSF", "GrLivArea", "GarageArea", "SalePrice"]
df_num = df[cols_numeric].copy()
```

### Motif 3 : Suppression de l'effet album photo

```python noexec
# Regrouper par utilisateur + heure, garder la premiere photo par groupe
photos = photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

### Motif 4 : Ajouter les labels de cluster au DataFrame

```python noexec
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.00030, min_samples=7)
photos["cluster"] = dbscan.fit_predict(photos[["lat", "long"]])
```

### Motif 5 : Analyser les clusters

```python noexec
for cluster_id in sorted(photos["cluster"].unique()):
    if cluster_id == -1:
        continue
    cluster_photos = photos[photos["cluster"] == cluster_id]
    print(f"Cluster {cluster_id}: {len(cluster_photos)} photos, "
          f"{cluster_photos['id_photographer'].nunique()} utilisateurs")
```

## Pieges courants

1. **Modifier une tranche vs une copie** : `df[mask]["col"] = value` ne modifie PAS df. Utilisez `df.loc[mask, "col"] = value` a la place.
2. **Alerte d'indexation en chaine** : `df["col1"]["col2"]` peut produire un SettingWithCopyWarning. Utilisez `df.loc[:, "col"]` ou `.copy()`.
3. **Oublier `as_index=False`** dans groupby : Cree un MultiIndex qui peut etre deroutant.
4. **Utiliser `==` avec NaN** : `NaN == NaN` est False. Utilisez `df.isnull()` ou `pd.isna()`.
5. **Iterer avec des boucles for** quand des operations vectorisees existent : `df["col"] * 2` est 100x plus rapide qu'une boucle.

---

## AIDE-MEMOIRE

### Chargement et exploration

```python noexec
df = pd.read_csv("file.csv")          # Charger
df.head()                               # Premieres lignes
df.info()                               # Structure
df.describe()                           # Statistiques
df.shape                                # (lignes, colonnes)
```

### Selection

```python noexec
df["col"]                    # Colonne unique (Series)
df[["col1", "col2"]]        # Colonnes multiples (DataFrame)
df[df["col"] > 5]           # Filtrer les lignes
df.loc["label"]              # Par etiquette de ligne
df.iloc[0]                   # Par position de ligne
```

### Nettoyage

```python noexec
df.isnull().sum()            # Compter les NaN
df.dropna()                  # Supprimer les lignes NaN
df.fillna(value)             # Remplir les NaN
df.drop_duplicates()         # Supprimer les doublons
df.drop(columns=["col"])     # Supprimer une colonne
```

### Agregation

```python noexec
df.groupby("col").mean()     # Regrouper et agreger
df["col"].value_counts()     # Compter les valeurs
df["col"].nunique()          # Compter les uniques
df["col"].unique()           # Lister les valeurs uniques
```

### Transformation

```python noexec
df["new"] = df["old"] * 2               # Nouvelle colonne
df["col"] = df["col"].astype(float)     # Conversion de type
df["col"] = np.log1p(df["col"])         # Transformation log
df.apply(func, axis=1)                  # Appliquer aux lignes
```

### Reference des methodes cles

| Methode | Retour | Description |
|---------|--------|-------------|
| `head(n)` | DataFrame | n premieres lignes |
| `describe()` | DataFrame | Statistiques descriptives |
| `info()` | None (affiche) | Types de colonnes et comptage non-null |
| `isnull()` | DataFrame (bool) | Masque NaN |
| `dropna()` | DataFrame | Sans les lignes NaN |
| `fillna(v)` | DataFrame | NaN remplaces par v |
| `drop_duplicates()` | DataFrame | Sans les doublons |
| `groupby(col)` | Objet GroupBy | Donnees regroupees |
| `value_counts()` | Series | Frequence de chaque valeur |
| `nunique()` | int ou Series | Nombre de valeurs uniques |
| `unique()` | array | Valeurs uniques |
| `apply(f)` | Series/DataFrame | Appliquer une fonction |
| `merge(df2)` | DataFrame | Jointure de type SQL |
| `sort_values(col)` | DataFrame | Trie par colonne |
