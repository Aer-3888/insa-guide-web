---
title: "Chapitre 2 : ACP -- Analyse en Composantes Principales"
sidebar_position: 2
---

# Chapitre 2 : ACP -- Analyse en Composantes Principales

## Presentation

L'ACP (PCA en anglais) est la technique centrale de la partie Analyse de Donnees (AD) du cours. Elle transforme un ensemble de variables correlees en un ensemble plus petit de variables non correlees appelees **composantes principales**, tout en preservant autant de variance (information) que possible.

## 1. Pourquoi l'ACP ?

| Probleme | Comment l'ACP aide |
|----------|--------------------|
| Trop de variables (fleau de la dimension) | Reduit a 2-3 dimensions significatives |
| Variables correlees | Cree des composantes non correlees |
| Difficulte a visualiser des donnees en haute dimension | Projette sur des plans factoriels 2D |
| Bruit dans les donnees | Conserve le signal (directions a forte variance), ecarte le bruit (faible variance) |

**Intuition cle** : Si les variables sont correlees, la dimensionnalite effective est inferieure au nombre de variables. L'ACP trouve cette structure de dimension reduite.

## 2. Fondements mathematiques

### Algorithme etape par etape

**Entree** : Matrice de donnees X avec n individus (lignes) et p variables (colonnes).

**Etape 1 -- Centrer (et eventuellement reduire) les donnees**

ACP normee = centrer ET standardiser. **Necessaire quand les variables ont des unites differentes.**

```
X_centre = X - moyenne(X)           # Centrage
X_reduit = X_centre / ecart_type(X) # Reduction
```

```python noexec
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**Etape 2 -- Calculer la matrice de correlation (ou de covariance)**

Pour l'ACP normee, c'est la matrice de correlation R :

```
R = (1/n) * X_reduit^T * X_reduit
```

R est une matrice symetrique p x p ou R[i,j] = correlation entre la variable i et la variable j.

**Note** : La convention `1/n` est standard dans les manuels francais d'analyse de donnees (ACP normee). En pratique, `sklearn.decomposition.PCA` utilise `1/(n-1)` (l'estimateur non biaise de la covariance), mais la difference est negligeable pour n grand. Pour les examens, utilisez `1/n`.

**Etape 3 -- Calculer les valeurs propres et vecteurs propres**

Resoudre : R * v = lambda * v

- **Valeurs propres** : lambda_1 >= lambda_2 >= ... >= lambda_p
- **Vecteurs propres** : v_1, v_2, ..., v_p

Chaque valeur propre represente la variance capturee par la direction de son vecteur propre correspondant.

**Etape 4 -- Choisir le nombre de composantes**

Conserver les k premieres composantes qui capturent suffisamment de variance (generalement 80-90%).

**Etape 5 -- Projeter les donnees**

```
Coordonnees_PC = X_reduit * V_k    # V_k = matrice des k premiers vecteurs propres
```

### Formules cles

| Concept | Formule | Signification |
|---------|---------|---------------|
| **Valeur propre** | lambda_k | Variance expliquee par la composante k |
| **Inertie totale** | Somme des valeurs propres = p (ACP normee) | Variance totale des donnees |
| **Ratio de variance expliquee** | lambda_k / Somme(lambda_i) | % d'information dans la composante k |
| **Variance cumulee** | Somme(lambda_1..k) / Somme(lambda_i) | % d'information dans les k premieres composantes |
| **Correlation variable-axe** | r(x_j, F_k) = v_jk * sqrt(lambda_k) | Intensite du lien entre la variable j et l'axe k |
| **Contribution d'un individu** | (coord_i^2) / (n * lambda_k) | Importance de l'individu i pour l'axe k |
| **Qualite de representation** (cos^2) | coord_i^2 / Somme(coord_i^2 sur tous les axes) | Qualite de la representation de l'individu i sur les axes retenus |

## 3. Choix du nombre de composantes

Trois regles courantes :

### Regle 1 : Regle des 80% de variance (la plus utilisee dans ce cours)
Conserver le nombre minimal de composantes tel que la variance cumulee expliquee >= 80%.

### Regle 2 : Critere de Kaiser
Conserver les composantes dont la valeur propre > 1 (pour l'ACP normee). Justification : une composante doit expliquer plus de variance qu'une seule variable originale.

### Regle 3 : Diagramme des valeurs propres (Scree plot)
Tracer les valeurs propres et chercher un "coude" -- un point ou la decroissance de la valeur propre ralentit significativement.

```python noexec
pca = PCA()
pca.fit(X_scaled)

# Diagramme des valeurs propres
plt.bar(range(1, len(pca.explained_variance_ratio_)+1),
        pca.explained_variance_ratio_ * 100)
plt.xlabel('Composante')
plt.ylabel('Variance expliquee (%)')
plt.title('Diagramme des valeurs propres')
```

### Exemple (issu du TP1 -- Temperatures des villes)

| Composante | Valeur propre | Variance (%) | Cumul (%) |
|------------|---------------|--------------|-----------|
| PC1 | ~8.5 | ~70% | 70% |
| PC2 | ~2.0 | ~17% | 87% |
| PC3 | ~0.7 | ~6% | 93% |
| ... | ... | ... | ... |

**Decision** : 2 composantes capturent ~87% de l'information -- suffisant pour l'analyse.

## 4. Interpretation du plan factoriel des individus

Le plan factoriel represente chaque individu (observation) comme un point dans l'espace defini par deux composantes principales.

### Regles de lecture

1. **Proximite = Similarite** : Les individus proches ont des profils similaires sur toutes les variables originales.
2. **Distance a l'origine** : Les individus eloignes du centre sont "extremes" -- ils caracterisent fortement les axes.
3. **Opposition** : Les individus de part et d'autre d'un axe ont des comportements opposes sur les variables qui definissent cet axe.
4. **Proches de l'origine** : Les individus proches du centre sont "moyens" ou mal representes (verifier le cos^2).

### Exemple (TP1 : Villes francaises par temperature)

```
                        PC2 (Amplitude thermique)
                         ^
    Grenoble, Lyon       |       Brest
    Strasbourg           |       Rennes, Nantes
    (continental)        |       (oceanique)
    ---------------------+----------------------> PC1 (Temperature moyenne)
    Lille                 |
    Vichy                 |
                          |       Marseille, Nice
                          |       Montpellier, Toulouse
                                  (mediterraneen)
```

**Interpretation** :
- **PC1 (Axe 1, ~70%)** : Gradient Nord-Sud = temperature moyenne. Les villes a droite (Marseille, Nice) sont plus chaudes globalement. Les villes a gauche (Lille, Strasbourg) sont plus fraiches.
- **PC2 (Axe 2, ~17%)** : Gradient Est-Ouest = amplitude thermique. Les villes en haut (Grenoble, Strasbourg) ont de grands ecarts de temperature entre ete et hiver. Les villes en bas (Brest, Rennes) ont des climats doux, oceaniques, avec une faible amplitude.

## 5. Le cercle des correlations

**C'est la visualisation la plus importante du cours et le sujet le plus teste aux examens.**

Le cercle des correlations represente chaque variable originale comme un point a l'interieur d'un cercle unite. Les coordonnees sont les correlations entre la variable et chaque composante principale.

### Regles de lecture

1. **Proche du bord du cercle** (longueur proche de 1) : La variable est bien representee sur ces deux axes.
2. **Proche d'un axe** : La variable est fortement correlee avec cette composante.
3. **Deux variables proches l'une de l'autre** : Elles sont positivement correlees.
4. **Deux variables diametralement opposees** : Elles sont negativement correlees.
5. **Deux variables a 90 degres** : Elles sont non correlees (independantes).
6. **Proche de l'origine** : La variable est mal representee sur ces axes -- examiner d'autres composantes.

### Calcul des correlations (loadings)

```python noexec
# Methode 1 : A partir de pca.components_ (vraie correlation entre variable et axe)
loadings = pca.components_.T * np.sqrt(pca.explained_variance_)

# Methode 2 : Formule directe de correlation
# r(x_j, PC_k) = pca.components_[k, j] * sqrt(valeur_propre_k)
```

**Note importante sur le notebook du TP1** : La fonction `correlation_circle_plotly` fournie dans le TP utilise `pcs[0, i]` et `pcs[1, i]` (c.-a-d. `pca.components_[k, j]`) directement comme coordonnees, SANS multiplier par `sqrt(valeur_propre_k)`. Cela signifie que les fleches representent les coordonnees des vecteurs propres (poids dans la composante principale), pas les vraies correlations. Pour l'interpretation aux examens, utilisez la formule avec `sqrt(lambda_k)` pour les valeurs de correlation reelles.

### Tracer le cercle des correlations

```python noexec
fig, ax = plt.subplots(figsize=(8, 8))

# Cercle unite
circle = plt.Circle((0, 0), 1, fill=False, color='gray', linestyle='--')
ax.add_patch(circle)

# Tracer les variables comme des fleches
for i, var_name in enumerate(variable_names):
    x = loadings[i, 0]  # Correlation avec PC1
    y = loadings[i, 1]  # Correlation avec PC2
    ax.arrow(0, 0, x, y, head_width=0.05, color='red')
    ax.text(x * 1.15, y * 1.15, var_name, fontsize=10)

ax.set_xlim(-1.2, 1.2)
ax.set_ylim(-1.2, 1.2)
ax.set_xlabel(f'PC1 ({var_explained[0]*100:.1f}%)')
ax.set_ylabel(f'PC2 ({var_explained[1]*100:.1f}%)')
ax.set_aspect('equal')
```

### Exemple (TP1 : Mois de temperature)

Sur le cercle des correlations des temperatures des villes :
- **Tous les mois pointent approximativement dans la meme direction sur PC1** : Toutes les temperatures sont positivement correlees (les villes chaudes sont chaudes tous les mois).
- **Les mois d'ete (Juin, Juillet) sont orientes vers PC2** : Ils contribuent a la dimension d'amplitude.
- **Les mois d'hiver (Decembre, Janvier) s'ecartent de PC2** : Ils mettent en evidence la distinction oceanique vs continental.
- **Mars et Octobre sont tres proches de l'axe PC1** : Ce sont les meilleurs indicateurs de la temperature moyenne.

## 6. Contribution et qualite de representation

### Contribution d'un individu a un axe

```
CTR(i, k) = (F_ik)^2 / (n * lambda_k)
```

Ou F_ik est la coordonnee de l'individu i sur l'axe k. Si CTR > 1/n, l'individu contribue plus que la moyenne.

### Qualite de representation (cos^2)

```
cos^2(i, k) = (F_ik)^2 / somme_j(F_ij)^2
```

Un cos^2 eleve signifie que l'individu est bien represente sur l'axe k. Si le cos^2 est faible sur les deux axes retenus, la position de l'individu dans le plan factoriel n'est pas fiable.

### Contributions des variables

Pour les variables, la contribution a un axe est liee au carre de la correlation avec cet axe :

```
CTR(var_j, axe_k) = r(x_j, F_k)^2 / lambda_k
```

Puisque somme_j r(x_j, F_k)^2 = lambda_k (pour l'ACP normee), cela donne une proportion qui somme a 1 pour toutes les variables d'un axe donne. Une variable contribue significativement si sa contribution depasse 1/p (ou p est le nombre de variables).

**Note sur le notebook du TP1** : Le DataFrame `loadings` du TP stocke `pca.components_.T` (les poids des vecteurs propres, pas les correlations). Les elever au carre donne les poids carres, qui sont proportionnels aux contributions puisque chaque vecteur propre est de norme unite (les composantes somment a 1).

```python noexec
loadings = pd.DataFrame(
    pca.components_.T,
    columns=[f'PC{i+1}' for i in range(n_components)],
    index=variable_names
)

# Contributions = loadings au carre
contributions = loadings ** 2
```

## 7. Explication des axes par des variables qualitatives

Apres l'ACP, on peut colorer le plan factoriel par une variable qualitative pour voir si elle explique les axes :

```python noexec
# Colorer par SalePrice (quantitative)
plt.scatter(X_pca[:, 0], X_pca[:, 1], c=df['SalePrice'], cmap='viridis')

# Colorer par OverallQual (qualitative)
for qual_value in df['OverallQual'].unique():
    mask = df['OverallQual'] == qual_value
    plt.scatter(X_pca[mask, 0], X_pca[mask, 1], label=str(qual_value))
```

Resultats du TP1 (House Prices) :
- **SalePrice** est correlee avec PC2 : les prix eleves apparaissent d'un cote.
- **OverallQual** : Les qualites basses (1-3) se regroupent a gauche de PC1 ; les qualites elevees (8-10) a droite.
- **Neighborhood** : Ne structure PAS les donnees sur PC1/PC2 -- les axes capturent les surfaces/structures, pas la localisation.

## 8. Lien entre ACP et classification

Les resultats de l'ACP peuvent servir d'entree au clustering (CAH, K-means) :

1. Effectuer l'ACP, garder k composantes (ex. 2)
2. Utiliser les coordonnees des PC comme nouvelles variables
3. Appliquer la CAH ou K-means sur ces coordonnees reduites

C'est la methode **CAH-MIXTE** traitee dans le TP2. Voir le [Chapitre 3 : Clustering](/S5/ADFD/guide/03-clustering).

## Pieges courants

1. **Utiliser l'ACP non normee quand les variables ont des unites differentes** : Utilisez toujours l'ACP normee (StandardScaler) sauf si toutes les variables sont dans la meme unite.
2. **Confondre composantes et loadings** : Les composantes sont les coordonnees des individus ; les loadings sont les correlations des variables avec les axes.
3. **Lire le cercle des correlations pour des variables proches de l'origine** : Si une variable est pres du centre du cercle, elle n'est PAS bien representee sur ces axes -- n'interpretez pas sa position.
4. **Interpreter la distance entre un individu et une variable** : Le plan factoriel des individus et le cercle des correlations sont a des echelles differentes. Ne comparez que individus entre eux, et variables entre elles.
5. **Oublier que le signe des axes de l'ACP est arbitraire** : La direction (positive/negative) d'un axe de PC est arbitraire. Ce qui compte, c'est le positionnement relatif.

---

## AIDE-MEMOIRE

### Pipeline ACP

```python noexec
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# 1. Standardiser
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 2. Ajuster l'ACP
pca = PCA(n_components=2)  # ou n_components=None pour toutes
X_pca = pca.fit_transform(X_scaled)

# 3. Resultats
pca.explained_variance_ratio_    # % variance par composante
pca.explained_variance_          # valeurs propres
pca.components_                  # vecteurs propres (matrice des loadings)
np.cumsum(pca.explained_variance_ratio_)  # variance cumulee
```

### Tableau de reference rapide

| Ce que vous voulez | Comment l'obtenir |
|--------------------|-------------------|
| Valeurs propres | `pca.explained_variance_` |
| % variance par composante | `pca.explained_variance_ratio_` |
| Variance cumulee | `np.cumsum(pca.explained_variance_ratio_)` |
| Coordonnees des individus sur les axes | `pca.transform(X_scaled)` ou `X_pca` |
| Correlations des variables avec les axes | `pca.components_.T * np.sqrt(pca.explained_variance_)` |
| Contribution d'une variable a l'axe k | `(pca.components_.T * np.sqrt(pca.explained_variance_))[:, k]**2` (correlations au carre) |

### Nombres cles a retenir

| Regle | Valeur |
|-------|--------|
| Variance cumulee minimale a conserver | 80% |
| Critere de Kaiser (seuil de valeur propre) | > 1 |
| Bonne qualite de representation (cos^2) | > 0.5 |
| Seuil de contribution significative | > 1/p (p = nombre de variables) |

### Guide rapide d'interpretation du cercle des correlations

| Position sur le cercle | Signification |
|------------------------|---------------|
| Sur le bord du cercle | Tres bien representee |
| Proche de l'axe PC1 | Fortement correlee avec PC1 |
| Proche de l'axe PC2 | Fortement correlee avec PC2 |
| Deux variables proches l'une de l'autre | Positivement correlees |
| Deux variables opposees | Negativement correlees |
| Deux variables a 90 degres | Non correlees |
| Proche du centre | Mal representee -- verifier d'autres axes |

### Vocabulaire d'examen (Francais/Anglais)

| Francais | Anglais |
|----------|---------|
| Valeur propre | Eigenvalue |
| Vecteur propre | Eigenvector |
| Inertie | Variance / Inertia |
| Cercle des correlations | Correlation circle |
| Plan factoriel | Factorial plane |
| Composante principale | Principal component |
| ACP normee | Normalized PCA (with standardization) |
| Centrer-reduire | Center and scale (standardize) |
| Contribution | Contribution (importance to axis) |
| Qualite de representation | Quality of representation (cos^2) |
| Axe factoriel | Factorial axis / Principal component |
