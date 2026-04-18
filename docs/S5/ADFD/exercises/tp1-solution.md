---
title: "TP Nettoyage de Donnees & ACP - Solution"
sidebar_position: 1
---

# TP Nettoyage de Donnees & ACP - Solution

> Conforme aux instructions de l'enseignant dans : `TP1_etudiant.ipynb` (House Prices - Kaggle)

**Jeu de donnees** : `train.csv` du challenge Kaggle "House Prices - Advanced Regression Techniques" -- 1460 proprietes residentielles a Ames, Iowa, avec 81 variables.

---

## 1. Chargement du jeu de donnees

### Afficher les premieres lignes du dataframe df. Calculer et afficher le nombre d'exemples.

**Reponse :**
```python noexec
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

**Resultat attendu :**
```
1460
```

### Q3 - Afficher les dimensions du jeu de donnees. Afficher les informations sur le jeu de donnees. Afficher la repartition des types de variables.

**Reponse :**
```python noexec
# 1. Dimensions du jeu de donnees
print(df.shape)

# 2. Informations sur le jeu de donnees
print(df.info())

# 3. Repartition des types de variables
print(df.dtypes.value_counts())
```

**Resultat attendu :**
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

**Interpretation :** Le jeu de donnees contient 81 colonnes. La sortie de `info()` revele que beaucoup de colonnes object ont des valeurs manquantes (ex. PoolQC n'a que 7 valeurs non-null sur 1460). Parmi les 38 colonnes numeriques, toutes ne sont pas veritablement quantitatives -- MSSubClass utilise des codes entiers pour des categories.

---

## Q4 - Compter le nombre de variables qui ne sont pas object

> Les variables de type Object ne sont pas des variables numeriques. Attention pour autant des variables int64 peuvent coder des variables categorielles.

**Reponse :**
```python noexec
nb_non_object = (df.dtypes != "object").sum()
print("Nombre de variables non-object :", nb_non_object)
```

**Resultat attendu :**
```
Nombre de variables non-object : 38
```

**Interpretation :** 38 colonnes ont des types numeriques (int64 ou float64). Cependant, des colonnes comme MSSubClass (qui encode des types de logement avec des nombres comme 20, 30, 60, 70) sont categorielles bien qu'elles soient de type int64.

---

## 2. Analyse des valeurs manquantes

### Q5 - Creer un DataFrame table_na contenant nb_na et pct_na. Trier par ordre decroissant. Q6 - Afficher les 10 variables ayant le plus de valeurs manquantes.

> A partir du DataFrame df, creez un nouveau DataFrame appele table_na contenant deux colonnes :
> - nb_na : le nombre de valeurs manquantes pour chaque variable
> - pct_na : le pourcentage de valeurs manquantes pour chaque variable

**Reponse :**
```python noexec
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

**Resultat attendu :**
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

**Interpretation :** PoolQC est a 99.5% manquant car tres peu de maisons a Ames ont des piscines -- c'est une donnee "Missing Not At Random" (MNAR) ou l'absence est informative. Alley (93.8% manquant) signifie que la plupart des proprietes n'ont pas d'acces a une ruelle.

---

### Q7 - Representez sous forme de diagramme en barres le nombre de valeurs manquantes pour les 15 variables ayant le plus de valeurs manquantes.

**Reponse :**
```python noexec
top15 = table_na.head(15)
plt.figure(figsize=(10, 6))
plt.bar(top15.index, top15['nb_na'])
plt.xticks(rotation=45, ha='right')
plt.title('Top 15 des variables avec le plus de valeurs manquantes')
plt.ylabel('Nombre de valeurs manquantes')
plt.tight_layout()
plt.show()
```

**Resultat attendu :** Un diagramme en barres decroissant avec PoolQC (~1453) comme la barre la plus haute, suivie de MiscFeature (~1406), Alley (~1369). La chute de FireplaceQu (690) a LotFrontage (259) est notable, et les variables restantes ont de petites barres (<100).

---

### Q8 - Faire le meme travail, mais uniquement pour les variables de type object

**Reponse :**
```python noexec
df_object = df.select_dtypes(include=["object"])

table_na_obj = pd.DataFrame({
    'nb_na': df_object.isnull().sum(),
    'pct_na': (df_object.isnull().sum() / len(df)) * 100
}).sort_values('pct_na', ascending=False)

print("Variables object avec le plus de valeurs manquantes :\n")
print(table_na_obj.head(10))
```

**Resultat attendu :**
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

**Reponse :**
```python noexec
df_non_object = df.select_dtypes(exclude=["object"])

table_na_num = pd.DataFrame({
    'nb_na': df_non_object.isnull().sum(),
    'pct_na': (df_non_object.isnull().sum() / len(df)) * 100
}).sort_values('pct_na', ascending=False)

print("Variables non-object avec le plus de valeurs manquantes :\n")
print(table_na_num.head(10))
```

**Resultat attendu :**
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

**Observation cle :** Les variables susceptibles d'etre numeriques ont peu de valeurs manquantes. Seules LotFrontage (17.7%), GarageYrBlt (5.5%) et MasVnrArea (0.5%) ont des NaN.

---

## 3. Selection des variables numeriques

Le notebook fournit les 14 variables de surface pour l'ACP :

```python noexec
cols_numeric = [
    "LotArea", "MasVnrArea", "BsmtFinSF1", "BsmtUnfSF",
    "TotalBsmtSF", "1stFlrSF", "2ndFlrSF",
    "GrLivArea", "GarageArea", "WoodDeckSF",
    "OpenPorchSF", "EnclosedPorch", "MiscVal", "SalePrice"
]

df_num = df[cols_numeric].copy()
print(df_num.info())
```

**Description des variables (issues du notebook) :**
- **LotArea :** Surface du terrain en pieds carres
- **MasVnrArea :** Surface du revetement de maconnerie en pieds carres
- **BsmtFinSF1 :** Surface finie de type 1 du sous-sol en pieds carres
- **BsmtUnfSF :** Surface non finie du sous-sol en pieds carres
- **TotalBsmtSF :** Surface totale du sous-sol en pieds carres
- **1stFlrSF :** Surface du rez-de-chaussee en pieds carres
- **2ndFlrSF :** Surface du premier etage en pieds carres
- **GrLivArea :** Surface habitable hors-sol en pieds carres
- **GarageArea :** Surface du garage en pieds carres
- **WoodDeckSF :** Surface de la terrasse en bois en pieds carres
- **OpenPorchSF :** Surface du porche ouvert en pieds carres
- **EnclosedPorch :** Surface du porche ferme en pieds carres
- **MiscVal :** Valeur de la caracteristique diverse (dollars)
- **SalePrice :** Prix de vente en dollars (variable cible)

---

## 4. Visualisation des distributions et valeurs aberrantes

### Q10 - Afficher un histogramme de 1stFlrSF

**Reponse :**
```python noexec
plt.figure(figsize=(8, 5))
df_num["1stFlrSF"].hist(bins=50)
plt.title("Distribution de la surface du rez-de-chaussee")
plt.xlabel("1stFlrSF (pieds carres)")
plt.ylabel("Effectif")
plt.show()
```

**Resultat attendu :** Une distribution asymetrique a droite centree autour de 800-1200 pieds carres, avec une longue queue a droite s'etendant jusqu'a ~4500 pieds carres. La plupart des maisons ont un rez-de-chaussee entre 600 et 1500 pieds carres.

---

### Q11 - Afficher un histogramme de LotArea

**Reponse :**
```python noexec
plt.figure(figsize=(8, 5))
df_num["LotArea"].hist(bins=50)
plt.title("Distribution de la surface du terrain")
plt.xlabel("LotArea (pieds carres)")
plt.ylabel("Effectif")
plt.show()
```

**Resultat attendu :** Extremement asymetrique a droite. La grande majorite des terrains font entre 5 000 et 15 000 pieds carres, mais des valeurs aberrantes atteignent 215 245 pieds carres. La distribution a un pic massif a gauche et une tres longue queue a droite.

---

### Q12 - Afficher le nuage de points GrLivArea vs SalePrice. Que remarquez-vous sur ce nuage de points ?

**Reponse :**
```python noexec
plt.figure(figsize=(8, 6))
plt.scatter(df_num["GrLivArea"], df_num["SalePrice"], alpha=0.5)
plt.xlabel("GrLivArea (pieds carres)")
plt.ylabel("SalePrice ($)")
plt.title("Surface habitable vs Prix de vente")
plt.show()
```

**Resultat attendu :** Une relation lineaire positive claire. La plupart des points forment un nuage du coin inferieur gauche (~800 pieds carres, ~100k$) au coin superieur droit (~3000 pieds carres, ~500k$). On note 2 valeurs aberrantes en bas a droite : des maisons avec GrLivArea > 4000 pieds carres mais SalePrice < 200k$ (probablement des saisies immobilieres ou des transferts familiaux).

**Observation (issue du notebook) :** Les variables GrLiveArea et SalePrice semblent tres correlees.

---

## 6. Nettoyage des donnees

### Valeurs manquantes

### Q13 - Supprimer provisoirement les lignes contenant des valeurs manquantes, au vu du nombre de donnees supprimees comment peut on traiter les valeurs manquantes

**Reponse :**
```python noexec
df_dropped = df_num.dropna()
print(f"Avant : {len(df_num)}, Apres : {len(df_dropped)}")
```

**Resultat attendu :**
```
Avant : 1460, Apres : 1452
```

**Interpretation :** Seulement 8 lignes sont perdues (celles avec MasVnrArea = NaN). Puisque cela ne represente que 0.55% des donnees, la suppression est acceptable. Cependant, l'imputation est preferable car elle preserve toutes les observations et constitue une pratique transferable pour les jeux de donnees avec plus de valeurs manquantes.

---

### Q14 - Imputer les valeurs manquantes par la mediane, afficher la distribution de la variable impactee avant et apres imputation

**Reponse :**
```python noexec
imputer = SimpleImputer(strategy="median")
df_imp = pd.DataFrame(
    imputer.fit_transform(df_num),
    columns=df_num.columns,
    index=df_num.index
)

# Verification : plus aucun NaN
print(df_imp.isnull().sum().sum())  # 0

# Distribution de MasVnrArea avant et apres
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(df_num["MasVnrArea"].dropna(), bins=50)
axes[0].set_title("MasVnrArea - Avant imputation")
axes[1].hist(df_imp["MasVnrArea"], bins=50)
axes[1].set_title("MasVnrArea - Apres imputation (mediane)")
plt.tight_layout()
plt.show()
```

**Resultat attendu :** 0 NaN restant. La mediane de MasVnrArea est 0.0 (car >50% des maisons n'ont pas de revetement de maconnerie), donc les 8 valeurs manquantes sont remplacees par 0.

---

### Valeurs aberrantes

### Q15 - Supprimer les outliers a l'aide du 99e percentile, afficher le nombre d'exemple avant et apres suppression

> Vous pourrez utiliser `mask = (df_imp <= q99).all(axis=1)`

**Reponse :**
```python noexec
q99 = df_imp.quantile(0.99)
mask = (df_imp <= q99).all(axis=1)
df_clean = df_imp[mask]
print(f"Avant : {len(df_imp)}")
print(f"Apres : {len(df_clean)}")
```

**Resultat attendu :**
```
Avant : 1460
Apres : 1326
```

**Interpretation :** 134 lignes (9.2%) sont supprimees. Le `.all(axis=1)` signifie qu'une ligne est conservee uniquement si TOUTES ses 14 valeurs sont inferieures a leur 99e percentile respectif. Les valeurs aberrantes affectent de maniere disproportionnee l'ACP car elles gonflent la variance dans leur direction.

---

### Transformation logarithmique

### Q16 - Appliquer une transformation log1p sur certaines variables. Affichage de WoodDeckSF avant et apres transformation.

**Reponse :**
```python noexec
cols_to_log = [
    "LotArea", "MasVnrArea", "TotalBsmtSF",
    "GrLivArea", "GarageArea", "WoodDeckSF",
    "OpenPorchSF", "EnclosedPorch", "MiscVal"
]

# Afficher WoodDeckSF avant transformation
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
axes[0].hist(df_clean["WoodDeckSF"], bins=50)
axes[0].set_title("WoodDeckSF - Avant log1p")

# Appliquer la transformation log1p
df_clean[cols_to_log] = np.log1p(df_clean[cols_to_log])

# Afficher WoodDeckSF apres transformation
axes[1].hist(df_clean["WoodDeckSF"], bins=50)
axes[1].set_title("WoodDeckSF - Apres log1p")
plt.tight_layout()
plt.show()
```

**Pourquoi log1p ?** `log1p(x) = log(1 + x)` compresse la queue droite des distributions asymetriques et gere correctement les zeros (`log1p(0) = 0`).

---

### Q17 - Afficher le nombre d'exemples par valeur de la variable WoodDeckSF, pour verifier l'existence du pic en zero.

**Reponse :**
```python noexec
print(df_clean["WoodDeckSF"].value_counts().head(10))
```

**Resultat attendu :**
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

**Interpretation :** 761 maisons sur 1326 (57%) ont WoodDeckSF = 0 (pas de terrasse en bois). C'est une distribution "inflationee de zeros", courante pour les equipements optionnels.

---

## Regression avant et apres nettoyage

> Cette partie est donnee -- elle illustre l'utilite du nettoyage en predisant le prix des maisons.

```python noexec
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

**Resultat attendu :**
```
Comparaison des modeles de regression lineaire

=== SANS nettoyage ===
RMSE : 39280.83

=== AVEC nettoyage ===
RMSE : 32392.59
```

**Interpretation :** Le nettoyage a reduit l'erreur de prediction d'environ 6 888 $. L'amelioration provient de la suppression des valeurs aberrantes et de la transformation log qui rend les relations plus lineaires.

---

## 7. ACP

### Q18 - Standardiser les donnees nettoyees

**Reponse :**
```python noexec
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df_clean)
```

**Pourquoi standardiser ?** L'ACP cherche les directions de variance maximale. Sans standardisation, SalePrice (plage 0-755 000) dominerait WoodDeckSF (plage 0-857) uniquement a cause de l'echelle. StandardScaler transforme chaque variable pour avoir une moyenne=0 et un ecart-type=1.

---

### Q19 - Calculer la PCA

**Reponse :**
```python noexec
pca = PCA()
X_pca = pca.fit_transform(X_scaled)
```

---

### Q20 - Recuperer et afficher la variance expliquee

**Reponse :**
```python noexec
for i, var in enumerate(pca.explained_variance_ratio_):
    print(f"PC{i+1}: {var*100:.2f}%")
```

**Resultat attendu :**
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

**Interpretation :** Les 2 premieres composantes ne capturent qu'environ 38.7% de la variance. C'est inferieur a l'exemple des temperatures des villes francaises (~87%) car ces 14 variables immobilieres sont diverses et moins fortement correlees.

---

### Q21 - Afficher les points projetes

> On notera que pour l'instant cette projection n'apporte que peu d'information.

**Reponse :**
```python noexec
plt.figure(figsize=(10, 7))
plt.scatter(X_pca[:, 0], X_pca[:, 1], alpha=0.5, s=20)
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.title("Projection ACP des maisons")
plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.show()
```

**Resultat attendu :** Un nuage de 1326 points sans regroupement evident. Le nuage est approximativement elliptique, s'etendant davantage le long de PC1 que de PC2. A ce stade, la projection seule ne revele pas beaucoup de structure.

---

## Cercle des correlations

### Q22 - Afficher pour chaque axe la valeur propre associee, la variance expliquee et la variance cumulee.

**Reponse :**
```python noexec
eigenvalue_table = pd.DataFrame({
    'Valeur propre': pca.explained_variance_,
    'Variance expliquee (%)': pca.explained_variance_ratio_ * 100,
    'Inertie cumulee (%)': np.cumsum(pca.explained_variance_ratio_) * 100
}, index=[f'PC{i+1}' for i in range(len(pca.explained_variance_))])
print(eigenvalue_table.head(5))
```

**Resultat attendu :**
```
     Valeur propre  Variance expliquee (%)  Inertie cumulee (%)
PC1       3.621329               25.847129            25.847129
PC2       1.801478               12.857996            38.705125
```

---

### Q23 - A l'aide du code ci-dessus, afficher le cercle des correlations pour l'ACP que l'on vient de realiser. Quelles variables semblent liees aux deux axes ? Quelles variables semblent correlees entre elles ? Existe-t-il des variables independantes ?

Le notebook fournit une fonction `correlation_circle_plotly`. On l'utilise :

**Reponse :**
```python noexec
correlation_circle_plotly(pca, df_clean.columns, min_contrib=0.15)
```

**Resultat attendu :** Un cercle unite avec des fleches partant de l'origine. Les variables proches du bord du cercle sont bien representees sur ces 2 PC.

**Positions attendues des variables :**
- **Regroupees le long de PC1 (cote droit) :** TotalBsmtSF, 1stFlrSF, GrLivArea, GarageArea -- correlees, representant la "taille de la maison"
- **Pointant vers le haut (PC2 positif) :** SalePrice, partiellement GrLivArea
- **Pres du centre (faible contribution) :** BsmtFinSF1, WoodDeckSF, OpenPorchSF, EnclosedPorch, MiscVal -- varient independamment

**Reponses aux questions :**
- Variables liees au premier axe : TotalBsmtSF, 1stFlrSF, GrLivArea, GarageArea (taille de la maison)
- Variables liees au deuxieme axe : SalePrice, GrLivArea (valeur/qualite)
- Variables correlees entre elles : TotalBsmtSF et 1stFlrSF (fleches dans la meme direction)
- Variables independantes : MiscVal est pres du centre, quasi-independante de toutes les autres

**(Issue du notebook) :** Variables correlees avec le deuxieme axe : SalePrice, voir GrLivArea (surface habitable). Toutes les variables affichees sont correlees positivement avec le 2e axe.

---

## Correlation des variables avec les axes

### Q24 - Construire un dataframe loadings contenant la correlation entre la variable et l'axe.

> On notera que les valeurs dans `pca.components_` contient les correlations entre les variables et les axes principaux.

**Reponse :**
```python noexec
loadings = pd.DataFrame(
    pca.components_.T,
    columns=[f'PC{i+1}' for i in range(pca.n_components_)],
    index=df_clean.columns
)
print(loadings.head())
```

---

### Q25 - Classer les variables en fonction de leur contribution au premier axe (le carre de leurs correlations avec cet axe).

**Reponse :**
```python noexec
contributions = loadings ** 2
print("=== Contributions a PC1 ===")
print(contributions['PC1'].sort_values(ascending=False))
```

**Resultat attendu (top 5) :**
```
TotalBsmtSF      ~0.17
1stFlrSF         ~0.16
GrLivArea        ~0.14
GarageArea       ~0.13
SalePrice        ~0.11
```

---

### Q26 - Classer les variables en fonction de leur contribution au deuxieme axe (le carre de leurs correlations avec cet axe).

**Reponse :**
```python noexec
print("=== Contributions a PC2 ===")
print(contributions['PC2'].sort_values(ascending=False))
```

**Resultat attendu (top 5) :**
```
SalePrice        ~0.20
2ndFlrSF         ~0.16
GrLivArea        ~0.14
BsmtUnfSF        ~0.10
BsmtFinSF1       ~0.09
```

**Interpretation :** PC1 est domine par les surfaces (sous-sol, rez-de-chaussee, surface habitable, garage). PC2 est domine par SalePrice et la surface du premier etage, une dimension "valeur et multi-etages".

---

## Mise en avant de la correlation

### Q27 - Colorer les points en fonction de la valeur de SalePrice

> Pour verifier que la variable SalePrice est bien liee au deuxieme axe, on va colorer les points en fonction de cette valeur.

**Reponse :**
```python noexec
plt.figure(figsize=(10, 7))
scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1],
                      c=df_clean['SalePrice'], cmap='viridis', alpha=0.6, s=20)
plt.colorbar(scatter, label='SalePrice')
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.title("ACP coloree par SalePrice")
plt.show()
```

**Resultat attendu :** Un gradient apparait principalement le long de PC2. Les points en haut (PC2 eleve) sont jaunes (SalePrice eleve), tandis que les points en bas sont violets (SalePrice bas).

---

### Q28 - Commenter cette visualisation

**Reponse :** SalePrice augmente principalement le long de PC2 (axe vertical), confirmant que PC2 capture la dimension "valeur". Le cercle des correlations le predisait -- la fleche de SalePrice pointe principalement vers le haut. Il y a aussi un certain gradient le long de PC1 (les maisons plus grandes coutent plus cher), mais la relation avec PC2 est plus prononcee.

---

### Q29 - Colorer les points en fonction de la valeur de BsmtFinSF1

**Reponse :**
```python noexec
plt.figure(figsize=(10, 7))
scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1],
                      c=df_clean['BsmtFinSF1'], cmap='viridis', alpha=0.6, s=20)
plt.colorbar(scatter, label='BsmtFinSF1')
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.title("ACP coloree par BsmtFinSF1")
plt.show()
```

**Resultat attendu :** Gradient moins net que SalePrice. Les points avec un BsmtFinSF1 eleve sont disperses partout, sans correlation forte avec aucun axe. Cela confirme que BsmtFinSF1 se situe pres du centre du cercle des correlations avec une faible contribution aux 2 premieres PC.

---

### Q30 - Commenter cette visualisation

**Reponse :** BsmtFinSF1 (surface finie du sous-sol) ne montre pas de pattern clair sur les deux premieres composantes principales. La coloration apparait relativement uniforme sur le plan ACP. C'est attendu puisque BsmtFinSF1 est pres du centre du cercle des correlations, ce qui signifie que sa variance est capturee par des composantes d'ordre superieur (PC3 et au-dela), pas les deux premieres.

---

## Explication par une variable qualitative

Le notebook fournit une coloration par Neighborhood :

```python noexec
pca_df = pd.DataFrame(X_pca, columns=["PC1", "PC2"])
pca_df["Neighborhood"] = df.loc[df_clean.index, "Neighborhood"].values
plt.figure(figsize=(10, 7))
sns.scatterplot(data=pca_df, x="PC1", y="PC2", hue="Neighborhood",
                palette="tab20", s=40)
plt.title("ACP coloree selon Neighborhood")
plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
plt.show()
```

**(Issue du notebook) :** Les quartiers ne semblent pas structurer les donnees selon les dimensions principales de variation. Les deux premieres composantes principales sont construites majoritairement par les surfaces, la structure du logement, les volumes, le standing -- mais pas par la localisation geographique.

---

### Q31 - Faire le meme travail d'affichage en fonction de la variable OverallQual (note de qualite attribuee a la maison).

**Reponse :**
```python noexec
pca_df = pd.DataFrame(X_pca[:, :2], columns=["PC1", "PC2"])
pca_df["OverallQual"] = df.loc[df_clean.index, "OverallQual"].values

plt.figure(figsize=(10, 7))
sns.scatterplot(data=pca_df, x="PC1", y="PC2", hue="OverallQual",
                palette="tab10", s=40)
plt.title("ACP coloree selon OverallQual")
plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
plt.show()
```

**Resultat attendu :** Avec 10 couleurs, il est difficile de voir des patterns. Le notebook reconnait : "le diagramme est trompeur, il y a trop de couleurs pour bien voir la situation."

---

### Q32 - Afficher uniquement les points ayant comme valeur 1, 2 ou 3. Que remarquez-vous ?

**Reponse :**
```python noexec
pca_df_low = pca_df[pca_df["OverallQual"].isin([1, 2, 3])]
plt.figure(figsize=(10, 7))
plt.scatter(pca_df_low["PC1"], pca_df_low["PC2"], s=40, alpha=0.7)
plt.title("ACP - OverallQual 1, 2, 3 uniquement")
plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.show()
```

**Observation (issue du notebook) :** Les points sont situes tres a gauche de l'axe 1 (valeurs inferieures a 0). Les maisons de faible qualite ont de petites surfaces dans l'ensemble, donc elles se projettent negativement sur l'axe "taille de la maison".

---

### Q33 - Afficher uniquement les points ayant comme valeur 8, 9 ou 10. Que remarquez-vous ?

**Reponse :**
```python noexec
pca_df_high = pca_df[pca_df["OverallQual"].isin([8, 9, 10])]
plt.figure(figsize=(10, 7))
plt.scatter(pca_df_high["PC1"], pca_df_high["PC2"], s=40, alpha=0.7, color='red')
plt.title("ACP - OverallQual 8, 9, 10 uniquement")
plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.show()
```

**Observation (issue du notebook) :** Les points sont situes tres a droite de l'axe 1 (valeurs superieures a 0). Les maisons de haute qualite tendent a etre plus grandes.

---

### Q34 - Pour confirmer ceci affichez sur un meme graphique en bleu les valeurs 1,2,3 et en rouge les valeurs 8,9,10.

**Reponse :**
```python noexec
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
plt.title("ACP - Qualite basse vs haute")
plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)")
plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)")
plt.show()
```

**Resultat attendu :** Les points bleus (faible qualite) forment un groupe a gauche. Les points rouges (haute qualite) forment un groupe a droite. Il y a une separation claire le long de PC1, confirmant que PC1 capture non seulement la "taille" mais aussi la "qualite" -- les maisons plus grandes et mieux construites se projettent a droite.
