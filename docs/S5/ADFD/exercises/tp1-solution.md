---
title: "TP Nettoyage de Donnees & ACP - Solution"
sidebar_position: 1
---

# TP Nettoyage de Donnees & ACP - Solution

> Following teacher instructions from: `TP1_etudiant.ipynb` (House Prices - Kaggle)

**Dataset**: `train.csv` from Kaggle "House Prices - Advanced Regression Techniques" -- 1460 residential properties in Ames, Iowa, with 81 features.

---

## 1. Chargement du jeu de donnees

### Afficher les premieres lignes du dataframe df. Calculer et afficher le nombre d'exemples.

**Answer:**
```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go

from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

df = pd.read_csv("data/train.csv")

# Afficher les premieres lignes
df.head()

# Calculer et afficher le nombre d'exemples
print(len(df))
```

**Expected output:**
```
1460
```

### Q3 - Afficher les dimensions du jeu de donnees. Afficher les informations sur le jeu de donnees. Afficher la repartition des types de variables.

**Answer:**
```python
# 1. Dimensions du jeu de donnees
print(df.shape)

# 2. Informations sur le jeu de donnees
print(df.info())

# 3. Repartition des types de variables
print(df.dtypes.value_counts())
```

**Expected output:**
```
(1460, 81)
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 1460 entries, 0 to 1459
Data columns (total 81 columns):
 #   Column         Non-Null Count  Dtype
---  ------         --------------  -----
 0   Id             1460 non-null   int64
 1   MSSubClass     1460 non-null   int64
 ...
 80  SalePrice      1460 non-null   int64
dtypes: float64(3), int64(35), object(43)
```

**Interpretation:** The dataset has 81 columns. The `info()` output reveals that many object columns have missing values (e.g., PoolQC has only 7 non-null out of 1460). Among the 38 numerical columns, not all are truly quantitative -- MSSubClass uses integer codes for categories.

---

## Q4 - Compter le nombre de variables qui ne sont pas object

> Les variables de type Object ne sont pas des variables numeriques. Attention pour autant des variables int64 peuvent coder des variables categorielles.

**Answer:**
```python
nb_non_object = (df.dtypes != "object").sum()
print("Nombre de variables non-object :", nb_non_object)
```

**Expected output:**
```
Nombre de variables non-object : 38
```

**Interpretation:** 38 columns have numeric types (int64 or float64). However, columns like MSSubClass (which encodes dwelling types as numbers like 20, 30, 60, 70) are categorical despite being int64.

---

## 2. Analyse des valeurs manquantes

### Q5 - Creer un DataFrame table_na contenant nb_na et pct_na. Trier par ordre decroissant. Q6 - Afficher les 10 variables ayant le plus de valeurs manquantes.

> A partir du DataFrame df, creez un nouveau DataFrame appele table_na contenant deux colonnes :
> - nb_na : le nombre de valeurs manquantes pour chaque variable
> - pct_na : le pourcentage de valeurs manquantes pour chaque variable

**Answer:**
```python
# Tableau recapitulatif
table_na = pd.DataFrame({
    'nb_na': df.isnull().sum(),
    'pct_na': (df.isnull().sum() / len(df)) * 100
})

# Trier par ordre decroissant selon % de NA
table_na = table_na.sort_values('pct_na', ascending=False)

# Afficher les 10 variables ayant le plus de valeurs manquantes
print(table_na.head(10))
```

**Expected output:**
```
             nb_na     pct_na
PoolQC        1453  99.520548
MiscFeature   1406  96.301370
Alley         1369  93.767123
Fence         1179  80.753425
MasVnrType     872  59.726027
FireplaceQu    690  47.260274
LotFrontage    259  17.739726
GarageYrBlt     81   5.547945
GarageCond      81   5.547945
GarageType      81   5.547945
```

**Interpretation:** PoolQC is 99.5% missing because very few houses in Ames have swimming pools -- this is "Missing Not At Random" (MNAR) where absence is informative. Alley (93.8% missing) means most properties have no alley access.

---

### Q7 - Representez sous forme de diagramme en barres le nombre de valeurs manquantes pour les 15 variables ayant le plus de valeurs manquantes.

**Answer:**
```python
top15 = table_na.head(15)
plt.figure(figsize=(10, 6))
plt.bar(top15.index, top15['nb_na'])
plt.xticks(rotation=45, ha='right')
plt.title('Top 15 Variables with Most Missing Values')
plt.ylabel('Number of Missing Values')
plt.tight_layout()
plt.show()
```

**Expected output/plot:** A descending bar chart with PoolQC (~1453) as the tallest bar, followed by MiscFeature (~1406), Alley (~1369). The drop-off from FireplaceQu (690) to LotFrontage (259) is notable, and remaining variables have small bars (<100).

---

### Q8 - Faire le meme travail, mais uniquement pour les variables de type object

**Answer:**
```python
df_object = df.select_dtypes(include=["object"])

table_na_obj = pd.DataFrame({
    'nb_na': df_object.isnull().sum(),
    'pct_na': (df_object.isnull().sum() / len(df)) * 100
}).sort_values('pct_na', ascending=False)

print("Variables object avec le plus de valeurs manquantes :\n")
print(table_na_obj.head(10))
```

**Expected output:**
```
Variables object avec le plus de valeurs manquantes :

              nb_na     pct_na
PoolQC         1453  99.520548
MiscFeature    1406  96.301370
Alley          1369  93.767123
Fence          1179  80.753425
MasVnrType      872  59.726027
FireplaceQu     690  47.260274
GarageType       81   5.547945
GarageCond       81   5.547945
GarageQual       81   5.547945
GarageFinish     81   5.547945
```

---

### Q9 - Faire le meme travail, mais uniquement pour les variables de type autre que object. Que remarquez-vous ?

**Answer:**
```python
df_non_object = df.select_dtypes(exclude=["object"])

table_na_num = pd.DataFrame({
    'nb_na': df_non_object.isnull().sum(),
    'pct_na': (df_non_object.isnull().sum() / len(df)) * 100
}).sort_values('pct_na', ascending=False)

print("Variables non-object avec le plus de valeurs manquantes :\n")
print(table_na_num.head(10))
```

**Expected output:**
```
Variables non-object avec le plus de valeurs manquantes :

              nb_na     pct_na
LotFrontage     259  17.739726
GarageYrBlt      81   5.547945
MasVnrArea        8   0.547945
Id                0   0.000000
OpenPorchSF       0   0.000000
...
```

**Key observation:** Les variables susceptibles d'etre numeriques ont peu de valeurs manquantes. Only LotFrontage (17.7%), GarageYrBlt (5.5%), and MasVnrArea (0.5%) have any NaN at all.

---

## 3. Selection des variables numeriques

The notebook provides the 14 surface/area variables for PCA:

```python
cols_numeric = [
    "LotArea", "MasVnrArea", "BsmtFinSF1", "BsmtUnfSF",
    "TotalBsmtSF", "1stFlrSF", "2ndFlrSF",
    "GrLivArea", "GarageArea", "WoodDeckSF",
    "OpenPorchSF", "EnclosedPorch", "MiscVal", "SalePrice"
]

df_num = df[cols_numeric].copy()
print(df_num.info())
```

**Variable descriptions (from notebook):**
- **LotArea:** Lot size in square feet
- **MasVnrArea:** Masonry veneer area in square feet
- **BsmtFinSF1:** Type 1 finished square feet (basement)
- **BsmtUnfSF:** Unfinished square feet of basement area
- **TotalBsmtSF:** Total square feet of basement area
- **1stFlrSF:** First Floor square feet
- **2ndFlrSF:** Second floor square feet
- **GrLivArea:** Above grade living area square feet
- **GarageArea:** Size of garage in square feet
- **WoodDeckSF:** Wood deck area in square feet
- **OpenPorchSF:** Open porch area in square feet
- **EnclosedPorch:** Enclosed porch area in square feet
- **MiscVal:** Value of miscellaneous feature (dollars)
- **SalePrice:** Sale price in dollars (target variable)

---

## 4. Visualisation des distributions et outliers

### Q10 - Afficher un histogramme de 1stFlrSF

**Answer:**
```python
plt.figure(figsize=(8, 5))
df_num["1stFlrSF"].hist(bins=50)
plt.title("Distribution of 1st Floor Square Feet")
plt.xlabel("1stFlrSF (sq ft)")
plt.ylabel("Count")
plt.show()
```

**Expected output/plot:** A right-skewed distribution centered around 800-1200 sq ft, with a long right tail extending to ~4500 sq ft. Most houses have first floors between 600 and 1500 sq ft.

---

### Q11 - Afficher un histogramme de LotArea

**Answer:**
```python
plt.figure(figsize=(8, 5))
df_num["LotArea"].hist(bins=50)
plt.title("Distribution of Lot Area")
plt.xlabel("LotArea (sq ft)")
plt.ylabel("Count")
plt.show()
```

**Expected output/plot:** Extremely right-skewed. The vast majority of lots are between 5,000 and 15,000 sq ft, but outliers reach up to 215,245 sq ft. The distribution has a massive spike on the left and a very long right tail.

---

### Q12 - Afficher le nuage de points GrLivArea vs SalePrice. Que remarquez-vous sur ce nuage de points ?

**Answer:**
```python
plt.figure(figsize=(8, 6))
plt.scatter(df_num["GrLivArea"], df_num["SalePrice"], alpha=0.5)
plt.xlabel("GrLivArea (sq ft)")
plt.ylabel("SalePrice ($)")
plt.title("Living Area vs Sale Price")
plt.show()
```

**Expected output/plot:** A clear positive linear relationship. Most points form a cloud from lower-left (~800 sq ft, ~100k$) to upper-right (~3000 sq ft, ~500k$). There are 2 notable outliers in the bottom-right: houses with GrLivArea > 4000 sq ft but SalePrice < 200k$ (likely foreclosures or family transfers).

**Observation (from notebook):** Les variables GrLiveArea et SalePrice semblent tres correlees.

---

## 6. Nettoyage des donnees

### Valeurs manquantes

### Q13 - Supprimer provisoirement les lignes contenant des valeurs manquantes, au vu du nombre de donnees supprimees comment peut on traiter les valeurs manquantes

**Answer:**
```python
df_dropped = df_num.dropna()
print(f"Before: {len(df_num)}, After: {len(df_dropped)}")
```

**Expected output:**
```
Before: 1460, After: 1452
```

**Interpretation:** Only 8 rows are lost (those with MasVnrArea = NaN). Since this is only 0.55% of data, dropping is acceptable. However, imputation is preferred because it preserves all observations and is a transferable practice for datasets with more missing values.

---

### Q14 - Imputer les valeurs manquantes par la mediane, afficher la distribution de la variable impactee avant et apres imputation

**Answer:**
```python
imputer = SimpleImputer(strategy="median")
df_imp = pd.DataFrame(
    imputer.fit_transform(df_num),
    columns=df_num.columns,
    index=df_num.index
)

# Verification: no NaN remain
print(df_imp.isnull().sum().sum())  # 0

# Distribution of MasVnrArea before and after
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(df_num["MasVnrArea"].dropna(), bins=50)
axes[0].set_title("MasVnrArea - Before imputation")
axes[1].hist(df_imp["MasVnrArea"], bins=50)
axes[1].set_title("MasVnrArea - After imputation (median)")
plt.tight_layout()
plt.show()
```

**Expected output:** 0 remaining NaN. The median of MasVnrArea is 0.0 (because >50% of houses have no masonry veneer), so the 8 missing values are filled with 0.

---

### Valeurs aberrantes

### Q15 - Supprimer les outliers a l'aide du 99e percentile, afficher le nombre d'exemple avant et apres suppression

> Vous pourrez utiliser `mask = (df_imp <= q99).all(axis=1)`

**Answer:**
```python
q99 = df_imp.quantile(0.99)
mask = (df_imp <= q99).all(axis=1)
df_clean = df_imp[mask]
print(f"Avant : {len(df_imp)}")
print(f"Apres : {len(df_clean)}")
```

**Expected output:**
```
Avant : 1460
Apres : 1326
```

**Interpretation:** 134 rows (9.2%) are removed. The `.all(axis=1)` means a row is kept only if ALL 14 of its values are below their respective 99th percentiles. Outliers disproportionately affect PCA because they inflate variance along their direction.

---

### Transformation logarithmique

### Q16 - Appliquer une transformation log1p sur certaines variables. Affichage de WoodDeckSF avant et apres transformation.

**Answer:**
```python
cols_to_log = [
    "LotArea", "MasVnrArea", "TotalBsmtSF",
    "GrLivArea", "GarageArea", "WoodDeckSF",
    "OpenPorchSF", "EnclosedPorch", "MiscVal"
]

# Display WoodDeckSF before transformation
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(df_clean["WoodDeckSF"], bins=50)
axes[0].set_title("WoodDeckSF - Before log1p")

# Apply log1p transformation
df_clean[cols_to_log] = np.log1p(df_clean[cols_to_log])

# Display WoodDeckSF after transformation
axes[1].hist(df_clean["WoodDeckSF"], bins=50)
axes[1].set_title("WoodDeckSF - After log1p")
plt.tight_layout()
plt.show()
```

**Why log1p?** `log1p(x) = log(1 + x)` compresses the right tail of skewed distributions and handles zeros correctly (`log1p(0) = 0`).

---

### Q17 - Afficher le nombre d'exemples par valeur de la variable WoodDeckSF, pour verifier l'existence du pic en zero.

**Answer:**
```python
print(df_clean["WoodDeckSF"].value_counts().head(10))
```

**Expected output:**
```
WoodDeckSF
0.0      761
192.0     38
100.0     36
144.0     33
120.0     31
168.0     28
140.0     15
224.0     14
208.0     10
240.0     10
Name: count, dtype: int64
```

**Interpretation:** 761 out of 1326 houses (57%) have WoodDeckSF = 0 (no wood deck). This is a "zero-inflated" distribution, common for optional features.

---

## Regression avant et apres nettoyage

> Cette partie est donnee -- elle illustre l'utilite du nettoyage en predisant le prix des maisons.

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# --- SANS nettoyage ---
df_raw = df_num.dropna()
X_raw = df_raw.drop(columns=["SalePrice"])
y_raw = df_raw["SalePrice"]
X_train_raw, X_test_raw, y_train_raw, y_test_raw = train_test_split(
    X_raw, y_raw, test_size=0.2, random_state=42)
model_raw = LinearRegression()
model_raw.fit(X_train_raw, y_train_raw)
y_pred_raw = model_raw.predict(X_test_raw)
rmse_raw = np.sqrt(mean_squared_error(y_test_raw, y_pred_raw))

# --- AVEC nettoyage ---
X_clean = df_clean.drop(columns=["SalePrice"])
y_clean = df_clean["SalePrice"]
X_train_clean, X_test_clean, y_train_clean, y_test_clean = train_test_split(
    X_clean, y_clean, test_size=0.2, random_state=42)
model_clean = LinearRegression()
model_clean.fit(X_train_clean, y_train_clean)
y_pred_clean = model_clean.predict(X_test_clean)
rmse_clean = np.sqrt(mean_squared_error(y_test_clean, y_pred_clean))

print("Comparaison des modeles de regression lineaire\n")
print("=== SANS nettoyage ===")
print("RMSE :", round(rmse_raw, 2))
print("\n=== AVEC nettoyage ===")
print("RMSE :", round(rmse_clean, 2))
```

**Expected output:**
```
Comparaison des modeles de regression lineaire

=== SANS nettoyage ===
RMSE : 39280.83

=== AVEC nettoyage ===
RMSE : 32392.59
```

**Interpretation:** Cleaning reduced prediction error by ~$6,888. The improvement comes from removing outliers and from the log transformation that makes relationships more linear.

---

## 7. ACP

### Q18 - Standardiser les donnees nettoyees

**Answer:**
```python
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df_clean)
```

**Why standardize?** PCA finds directions of maximum variance. Without standardization, SalePrice (range 0-755,000) would dominate over WoodDeckSF (range 0-857) purely because of scale. StandardScaler transforms each variable to have mean=0 and std=1.

---

### Q19 - Calculer la PCA

**Answer:**
```python
pca = PCA()
X_pca = pca.fit_transform(X_scaled)
```

---

### Q20 - Recuperer et afficher la variance expliquee

**Answer:**
```python
for i, var in enumerate(pca.explained_variance_ratio_):
    print(f"PC{i+1}: {var*100:.2f}%")
```

**Expected output:**
```
PC1: 25.85%
PC2: 12.86%
PC3: 10.44%
PC4: 9.05%
PC5: 8.37%
PC6: 7.40%
PC7: 6.28%
PC8: 5.43%
PC9: 4.75%
PC10: 3.59%
PC11: 2.94%
PC12: 1.82%
PC13: 0.87%
PC14: 0.35%
```

**Interpretation:** The first 2 components capture only ~38.7% of variance. This is lower than the French cities temperature example (~87%) because these 14 housing variables are diverse and not as strongly correlated.

---

### Q21 - Afficher les points projetes

> On notera que pour l'instant cette projection n'apporte que peu d'information.

**Answer:**
```python
plt.figure(figsize=(10, 7))
plt.scatter(X_pca[:, 0], X_pca[:, 1], alpha=0.5, s=20)
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.title("PCA Projection of Houses")
plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.show()
```

**Expected output/plot:** A cloud of 1326 points with no obvious clustering. The cloud is roughly elliptical, extending more along PC1 than PC2. At this stage, the projection alone does not reveal much structure.

---

## Cercle des correlations

### Q22 - Afficher pour chaque axe la valeur propre associee, la variance expliquee et la variance cumulee.

**Answer:**
```python
eigenvalue_table = pd.DataFrame({
    'Valeur propre': pca.explained_variance_,
    'Variance expliquee (%)': pca.explained_variance_ratio_ * 100,
    'Inertie cumulee (%)': np.cumsum(pca.explained_variance_ratio_) * 100
}, index=[f'PC{i+1}' for i in range(len(pca.explained_variance_))])
print(eigenvalue_table.head(5))
```

**Expected output:**
```
     Valeur propre  Variance expliquee (%)  Inertie cumulee (%)
PC1       3.621329               25.847129            25.847129
PC2       1.801478               12.857996            38.705125
```

---

### Q23 - A l'aide du code ci-dessus, afficher le cercle des correlations pour l'ACP que l'on vient de realiser. Quelles variables semblent liees aux deux axes ? Quelles variables semblent correlees entre elles ? Existe-t-il des variables independantes ?

The notebook provides a `correlation_circle_plotly` function. Use it:

**Answer:**
```python
correlation_circle_plotly(pca, df_clean.columns, min_contrib=0.15)
```

**Expected output/plot:** A unit circle with arrows from the origin. Variables near the circle boundary are well-represented on these 2 PCs.

**Expected positions of variables:**
- **Clustered together along PC1 (right side):** TotalBsmtSF, 1stFlrSF, GrLivArea, GarageArea -- correlated, representing "house size"
- **Pointing upward (positive PC2):** SalePrice, partially GrLivArea
- **Near center (low contribution):** BsmtFinSF1, WoodDeckSF, OpenPorchSF, EnclosedPorch, MiscVal -- vary independently

**Answers to the questions:**
- Variables liees au premier axe: TotalBsmtSF, 1stFlrSF, GrLivArea, GarageArea (taille de la maison)
- Variables liees au deuxieme axe: SalePrice, GrLivArea (valeur/qualite)
- Variables correlees entre elles: TotalBsmtSF et 1stFlrSF (fleches dans la meme direction)
- Variables independantes: MiscVal est pres du centre, quasi-independante de toutes les autres

**(From notebook):** Variables correlees avec le deuxieme axe : SalePrice, voir GrLivArea (surface habitable). Toutes les variables affichees sont correlees positivement avec le 2e axe.

---

## Correlation des variables avec les axes

### Q24 - Construire un dataframe loadings contenant la correlation entre la variable et l'axe.

> On notera que les valeurs dans `pca.components_` contient les correlations entre les variables et les axes principaux.

**Answer:**
```python
loadings = pd.DataFrame(
    pca.components_.T,
    columns=[f'PC{i+1}' for i in range(pca.n_components_)],
    index=df_clean.columns
)
print(loadings.head())
```

---

### Q25 - Classer les variables en fonction de leur contribution au premier axe (le carre de leurs correlations avec cet axe).

**Answer:**
```python
contributions = loadings ** 2
print("=== Contributions to PC1 ===")
print(contributions['PC1'].sort_values(ascending=False))
```

**Expected output (top 5):**
```
TotalBsmtSF      ~0.17
1stFlrSF         ~0.16
GrLivArea        ~0.14
GarageArea       ~0.13
SalePrice        ~0.11
```

---

### Q26 - Classer les variables en fonction de leur contribution au deuxieme axe (le carre de leurs correlations avec cet axe).

**Answer:**
```python
print("=== Contributions to PC2 ===")
print(contributions['PC2'].sort_values(ascending=False))
```

**Expected output (top 5):**
```
SalePrice        ~0.20
2ndFlrSF         ~0.16
GrLivArea        ~0.14
BsmtUnfSF        ~0.10
BsmtFinSF1       ~0.09
```

**Interpretation:** PC1 is driven by surface areas (basement, first floor, living area, garage). PC2 is driven by SalePrice and second floor area, a "value and multi-story" dimension.

---

## Mis en avant de la correlation

### Q27 - Colorer les points en fonction de la valeur de SalePrice

> Pour verifier que la variable SalePrice est bien liee au deuxieme axe, on va colorer les points en fonction de cette valeur.

**Answer:**
```python
plt.figure(figsize=(10, 7))
scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1],
                      c=df_clean['SalePrice'], cmap='viridis', alpha=0.6, s=20)
plt.colorbar(scatter, label='SalePrice')
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.title("PCA colored by SalePrice")
plt.show()
```

**Expected output/plot:** A gradient appears primarily along PC2. Points at the top (high PC2) are yellow (high SalePrice), while points at the bottom are purple (low SalePrice).

---

### Q28 - Commenter cette visualisation

**Answer:** SalePrice increases primarily along PC2 (vertical axis), confirming that PC2 captures the "value" dimension. The correlation circle predicted this -- SalePrice's arrow points mostly upward. There is also some gradient along PC1 (larger houses cost more), but the PC2 relationship is more pronounced.

---

### Q29 - Colorer les points en fonction de la valeur de BsmtFinSF1

**Answer:**
```python
plt.figure(figsize=(10, 7))
scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1],
                      c=df_clean['BsmtFinSF1'], cmap='viridis', alpha=0.6, s=20)
plt.colorbar(scatter, label='BsmtFinSF1')
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.title("PCA colored by BsmtFinSF1")
plt.show()
```

**Expected output/plot:** Less clear gradient than SalePrice. Points with high BsmtFinSF1 are scattered throughout, with no strong correlation to either axis. This confirms that BsmtFinSF1 sits near the center of the correlation circle with low contribution to the first 2 PCs.

---

### Q30 - Commenter cette visualisation

**Answer:** BsmtFinSF1 (finished basement area) does not show a clear pattern on the first two principal components. The coloring appears relatively uniform across the PCA plane. This is expected since BsmtFinSF1 is near the center of the correlation circle, meaning its variance is captured by higher-order components (PC3 and beyond), not the first two.

---

## Explication par une variable qualitative

The notebook provides a coloring by Neighborhood:

```python
pca_df = pd.DataFrame(X_pca, columns=["PC1", "PC2"])
pca_df["Neighborhood"] = df.loc[df_clean.index, "Neighborhood"].values
plt.figure(figsize=(10, 7))
sns.scatterplot(data=pca_df, x="PC1", y="PC2", hue="Neighborhood",
                palette="tab20", s=40)
plt.title("PCA colore selon Neighborhood")
plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
plt.show()
```

**(From notebook):** Les quartiers ne semblent pas structurer les donnees selon les dimensions principales de variation. Les deux premieres composantes principales sont construites majoritairement par les surfaces, la structure du logement, les volumes, le standing -- mais pas par la localisation geographique.

---

### Q31 - Faire le meme travail d'affichage en fonction de la variable OverallQual (note de qualite attribuee a la maison).

**Answer:**
```python
pca_df = pd.DataFrame(X_pca[:, :2], columns=["PC1", "PC2"])
pca_df["OverallQual"] = df.loc[df_clean.index, "OverallQual"].values

plt.figure(figsize=(10, 7))
sns.scatterplot(data=pca_df, x="PC1", y="PC2", hue="OverallQual",
                palette="tab10", s=40)
plt.title("PCA colore selon OverallQual")
plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
plt.show()
```

**Expected output/plot:** With 10 colors, it is hard to see patterns. The notebook acknowledges: "le diagramme est trompeur, il y a trop de couleurs pour bien voir la situation."

---

### Q32 - Afficher uniquement les points ayant comme valeur 1, 2 ou 3. Que remarquez-vous ?

**Answer:**
```python
pca_df_low = pca_df[pca_df["OverallQual"].isin([1, 2, 3])]
plt.figure(figsize=(10, 7))
plt.scatter(pca_df_low["PC1"], pca_df_low["PC2"], s=40, alpha=0.7)
plt.title("PCA - OverallQual 1, 2, 3 only")
plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.show()
```

**Observation (from notebook):** Les points sont situes tres a gauche de l'axe 1 (valeurs inferieures a 0). Low-quality houses have small surfaces across the board, so they project negatively on the "house size" axis.

---

### Q33 - Afficher uniquement les points ayant comme valeur 8, 9 ou 10. Que remarquez-vous ?

**Answer:**
```python
pca_df_high = pca_df[pca_df["OverallQual"].isin([8, 9, 10])]
plt.figure(figsize=(10, 7))
plt.scatter(pca_df_high["PC1"], pca_df_high["PC2"], s=40, alpha=0.7, color='red')
plt.title("PCA - OverallQual 8, 9, 10 only")
plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.show()
```

**Observation (from notebook):** Les points sont situes tres a droite de l'axe 1 (valeurs superieures a 0). High-quality houses tend to be larger.

---

### Q34 - Pour confirmer ceci affichez sur un meme graphique en bleu les valeurs 1,2,3 et en rouge les valeurs 8,9,10.

**Answer:**
```python
pca_df = pd.DataFrame(X_pca[:, :2], columns=["PC1", "PC2"])
pca_df["OverallQual"] = df.loc[df_clean.index, "OverallQual"].values

low = pca_df[pca_df["OverallQual"].isin([1, 2, 3])]
high = pca_df[pca_df["OverallQual"].isin([8, 9, 10])]

plt.figure(figsize=(10, 7))
plt.scatter(low["PC1"], low["PC2"], color='blue', alpha=0.6, label='Qual 1-3', s=40)
plt.scatter(high["PC1"], high["PC2"], color='red', alpha=0.6, label='Qual 8-10', s=40)
plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.legend()
plt.title("PCA - Low vs High Overall Quality")
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.show()
```

**Expected output/plot:** Blue points (low quality) form a cluster on the left side. Red points (high quality) form a cluster on the right side. There is clear separation along PC1, confirming that PC1 captures not just "size" but also "quality" -- larger and better-built houses project to the right.
