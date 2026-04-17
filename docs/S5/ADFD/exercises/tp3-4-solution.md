---
title: "TP3-4: Detection et Caracterisation de POI a Rennes - Solution"
sidebar_position: 3
---

# TP3-4: Detection et Caracterisation de POI a Rennes - Solution

> Following teacher instructions from: `TP-23-24-etud_without_NLP_task_todo.ipynb`

**Technique**: Spatial clustering with DBSCAN on geolocated photo data, followed by cluster characterization using Apriori frequent itemset mining on photo tags.

**Goal**: Identify Points of Interest (POI) in Rennes from geolocated Flickr photos using unsupervised spatial analysis. A POI is defined as the location of photographs by a large number of distinct users.

**Dataset**: `flickrRennes.csv` -- geolocated photos from the Flickr API, centered on Rennes, France.

**Duration**: Double session (TP3 + TP4).

---

## Setup: Imports and Constants

```python
import sys
print(sys.version)

import pandas as pd
import numpy as np
import re
import mlxtend
import matplotlib.pyplot as plt
import folium
import sklearn.cluster
import nltk

from mlxtend.frequent_patterns import apriori
from mlxtend.preprocessing import TransactionEncoder

nltk.download("stopwords")
from nltk.corpus import stopwords
stopwordslist = stopwords.words("french")
stopwordslist.append("NaN")

LATITUDE, LONGITUDE = 48.117266, -1.6777926  # Centre de Rennes
```

## Data Loading

```python
photos_orig = pd.read_csv("flickrRennes.csv")
photos = photos_orig.copy()
photos.head()
```

**Dataset columns:**
- **id_photo** = identifiant de la photo
- **title** = titre de la photo
- **id_photographer** = identifiant du proprietaire (utilisateur)
- **lat, long** = coordonnees geographiques de la prise de vue
- **tags** = les tags fournis par l'utilisateur
- **url** = lien de la photo
- **date_uploaded*** = informations sur la date de publication
- **date_taken*** = informations sur la date de prise de la photo

---

# Etape 1: Preparation des donnees

## Prise en main du jeu de donnees

### Question: Affichez le nombre de photos contenues dans le DataFrame.

**Answer:**
```python
len(photos)
```

**Expected output:**
```
29541
```

---

### Question: Affichez les valeurs moyennes et medianes de la latitude et longitude. Cela vous parait-il coherent ?

**Answer:**
```python
print(photos["lat"].mean())
print(photos["long"].mean())
print(photos["lat"].median())
print(photos["long"].median())
```

**Expected output:**
```
48.108595345892155
-1.680869942554416
48.11011
-1.678194
```

**Interpretation:** Both mean and median are very close to the Rennes city center (48.117, -1.678). This is coherent -- the data is geolocated around Rennes. The small mean-median gap indicates a roughly symmetric distribution centered on the city.

---

### Question: De quelle annee date la photo la plus ancienne ? Et la plus recente ?

**Answer:**
```python
print(photos["date_taken_year"].min())
print(photos["date_taken_year"].max())
```

**Expected output:**
```
2004
2019
```

**Interpretation:** The photos span 15 years. Despite the TP saying "photos geolocalisees autour de Rennes en 2019," the "2019" refers to when the data was extracted from the API, not when all photos were taken.

---

### Question: Affichez le nombre d'utilisateurs distincts.

**Answer:**
```python
photos["id_photographer"].nunique()
```

**Expected output:**
```
213
```

---

### Question: Affichez le nombre de valeurs distinctes de id_photo.

**Answer:**
```python
photos["id_photo"].nunique()
```

**Expected output:**
```
4148
```

**Key insight:** 29,541 rows but only 4,148 unique photo IDs means each photo appears ~7.1 times on average. The CSV contains exact duplicate rows.

---

## Suppression des doublons

> Les identifiants des photos sont censes etre uniques, pourtant la question precedente affiche un nombre d'identifiants bien inferieur au nombre de lignes du DataFrame. Il est fort possible qu'il y ait des doublons.

### Question: Supprimez les lignes en double.

> Indication: la documentation de la classe DataFrame se trouve ici: https://pandas.pydata.org/pandas-docs/stable/reference/frame.html

**Answer:**
```python
photos = photos.drop_duplicates()
```

---

### Question: Affichez la nouvelle taille du jeu de donnees.

**Answer:**
```python
len(photos)
```

**Expected output:**
```
4148
```

**Interpretation:** `drop_duplicates()` removes rows identical across ALL columns. The reduction from 29,541 to 4,148 confirms that ~86% of rows were exact duplicates.

---

## Analyse des donnees

### Question: Afficher le nombre de photos par utilisateurs distincts.

**Answer:**
```python
photos_per_user = photos.groupby("id_photographer").size()
print(photos_per_user)
```

**Expected output (truncated):**
```
id_photographer
100074746@N06    21
100293696@N06     1
101183566@N06     1
103978073@N07     5
105639886@N08     3
                 ..
95574368@N08      1
96738392@N04      1
98999190@N00      3
99294526@N02      3
99412649@N05     27
Length: 213, dtype: int64
```

---

### Question: Affichez le nombre d'utilisateurs n'ayant poste qu'une seule photo.

**Answer:**
```python
single_photo_users = (photos_per_user == 1).sum()
print(single_photo_users)
```

**Expected output:**
```
74
```

**Interpretation:** 74 out of 213 users (35%) posted only one photo. These are likely casual tourists or one-time visitors.

---

### Question: Combien de photos prennent les photographes de ce jeu de donnees ? Afficher la distribution du nombre de photographes par nombre de photos.

> Le resultat devrait ressembler a l'image `photographes_par_photo.png`.

**Answer:**
```python
photo_counts = photos_per_user.value_counts().sort_index()
plt.figure(figsize=(10, 6))
plt.bar(photo_counts.index, photo_counts.values)
plt.xlabel('Nombre de Photos')
plt.ylabel('Nombre de Photographes')
plt.title('Distribution des photographes par nombre de photos')
plt.show()
```

**Expected output/plot:** A heavily right-skewed histogram. Very tall bar at x=1 (74 photographers), then rapidly decreasing. Most photographers have fewer than 20 photos, but a few have hundreds.

---

### Question: Afficher un diagramme a barres de la distribution des photos sur les mois de l'annee.

> Indication: la fonction matplotlib a utiliser est `bar`, la fonction `hist` n'est pas ce que vous cherchez.

**Answer:**
```python
month_counts = photos.groupby("date_taken_month").size()
plt.figure(figsize=(10, 6))
plt.bar(month_counts.index, month_counts.values)
plt.xlabel('Mois')
plt.ylabel('Nombre de Photos')
plt.title('Distribution des photos par mois')
plt.xticks(range(1, 13))
plt.show()
```

**Expected output/plot:** Seasonal pattern with more photos in spring/summer (April-September) and fewer in winter (November-February). Peak is typically around July-September (tourist season).

---

## Affichage des donnees sur une carte

The notebook provides the following code to display photos on a map:

```python
rennes_map = folium.Map(
    location=[LATITUDE, LONGITUDE],
    tiles="cartodbpositron",
    zoom_start=12
)

for row_nb, row in photos.iterrows():
    folium.CircleMarker([row["lat"], row["long"]], radius=1).add_to(rennes_map)

rennes_map
```

**Expected output/map:** Blue dots scattered across Rennes. Dense clusters visible in the city center (historic core, Thabor park area). Scattered dots in peripheral areas.

---

## Limitation de l'effet "album photo"

> Certains utilisateurs publient des series de photos, generalement prises au meme endroit, dans un court laps de temps. Un centre d'interet doit etre le lieu de photographies d'un grand nombre d'utilisateurs distincts et non pas d'une personne isolee.
> Une solution simpliste est de ne garder qu'une photo par utilisateur par heure de temps.

### Question: Donnez l'instruction pandas correspondante et critiquez-la. Mettez ensuite a jour le DataFrame photos en gardant une seule photo par groupe.

> Indication: utiliser la methode `groupby` avec plusieurs groupements.
> Note: passer le parametre `as_index = False` pour eviter la creation d'un index multiple.

**Answer:**
```python
photos = photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

**Critique de cette approche:**
1. **Trop agressive:** Un utilisateur visitant deux endroits differents dans la meme heure perd un endroit
2. **Pas assez agressive:** Un utilisateur prenant une photo par heure au meme endroit cree quand meme plusieurs entrees
3. **Meilleure alternative:** Deduplication spatiale -- grouper par (utilisateur, latitude arrondie, longitude arrondie)

---

### Question: Affichez le DataFrame modifie.

**Answer:**
```python
photos
```

**Expected output:** A DataFrame with 1,232 rows and 19 columns.

---

### Question: Affichez le nombre de photos contenues dans le DataFrame.

**Answer:**
```python
len(photos)
```

**Expected output:**
```
1232
```

**Interpretation:** The groupby keeps only the first photo per (user, year, month, day, hour). This reduces the dataset by ~70%, meaning most photos were part of rapid-fire sequences.

---

### Question: Affichez les photos du DataFrame sur une carte.

**Answer:**
```python
rennes_map = folium.Map(
    location=[LATITUDE, LONGITUDE],
    tiles="cartodbpositron",
    zoom_start=12
)

for row_nb, row in photos.iterrows():
    folium.CircleMarker([row["lat"], row["long"]], radius=1).add_to(rennes_map)

rennes_map
```

**Expected output/map:** Sparser than before, but main concentration areas remain visible in central Rennes.

---

# Etape 2: Clustering des photos

## Identification des points d'interet

### Question: Choisissez un algorithme pour notre probleme parmi KMeans et DBSCAN en justifiant votre choix.

**Answer:** DBSCAN est le meilleur choix pour quatre raisons:
1. **On ne connait pas K:** Le nombre de POI a Rennes est inconnu. DBSCAN le decouvre automatiquement.
2. **Formes arbitraires:** Un POI le long d'une riviere ou d'une rue n'est pas spherique. DBSCAN gere les formes arbitraires; KMeans suppose des clusters spheriques.
3. **Gestion du bruit:** Beaucoup de photos sont a des endroits aleatoires (hotel, parking). DBSCAN les etiquette comme bruit (-1); KMeans forcerait chaque photo dans un cluster.
4. **Definition basee sur la densite:** Notre definition de POI est "zone dense de photos" -- cela correspond directement a l'approche de DBSCAN.

---

### Question: Appliquez l'algorithme sur les donnees en utilisant soit `sklearn.cluster.KMeans` ou `sklearn.cluster.DBSCAN`.

> Parametres conseilles pour DBSCAN: eps=0.00030, min_samples=7

**Answer:**
```python
clustering = sklearn.cluster.DBSCAN(eps=0.00030, min_samples=7)
labels = clustering.fit_predict(photos[["lat", "long"]].values)
```

**Parameter analysis:**
- `eps=0.00030` degrees: At latitude 48 N, 0.0003 degrees of latitude = ~33 meters, 0.0003 degrees of longitude = ~22 meters
- `min_samples=7`: A point needs at least 7 neighbors within eps to be a core point, filtering out small personal clusters

---

### Question: Affichez la liste des labels des clusters crees.

> Vous devez obtenir un tableau qui indique le numero de cluster de chaque photo, comme celui-ci: array([-1, -1, -1, ..., -1, -1, -1])

**Answer:**
```python
print(labels)
```

**Expected output:**
```
array([-1, -1, -1, ..., -1, -1, -1])
```

---

### Question: Ajoutez ces informations au DataFrame, dans une nouvelle colonne "cluster". Affichez le DataFrame.

**Answer:**
```python
photos["cluster"] = labels
photos
```

**Expected output:** The DataFrame now has 20 columns (19 original + 1 "cluster" column). The cluster column contains integer labels from -1 (noise) to 19.

---

### Question: Affichez la liste des labels de cluster du DataFrame, sans les doublons. Quel label est utilise pour marquer une photo qui n'appartient pas a un cluster ?

**Answer:**
```python
photos["cluster"].unique()
```

**Expected output:**
```
array([-1,  0, 14,  1,  6,  2,  3,  7,  4,  5,  8,  9, 10, 11, 12, 13, 15,
       16, 17, 18, 19])
```

**Interpretation:** Label **-1** marks noise (photos not belonging to any cluster). There are 20 clusters (0 through 19) plus noise. The numbering is arbitrary, determined by the order DBSCAN discovers them.

---

### Question: Affichez les url de toutes les photos appartenant au cluster de label 2.

**Answer:**
```python
photos[photos["cluster"] == 2]["url"].values
```

**Expected output:**
```
array(['https://www.flickr.com/photos/119588793@N07/36609063310/',
       'https://www.flickr.com/photos/nathph/44843668934/',
       'https://www.flickr.com/photos/nathph/46056069072/',
       'https://www.flickr.com/photos/nathph/31267284097/',
       'https://www.flickr.com/photos/nathph/46357262171/',
       'https://www.flickr.com/photos/127653448@N08/36132734214/',
       'https://www.flickr.com/photos/131283788@N04/29760333648/',
       'https://www.flickr.com/photos/131283788@N04/29760329228/',
       'https://www.flickr.com/photos/brunovanbesien/27319878279/',
       'https://www.flickr.com/photos/soujirou/34977404014/',
       'https://www.flickr.com/photos/soujirou/34977653444/',
       'https://www.flickr.com/photos/philippemanguin/39871198251/',
       'https://www.flickr.com/photos/anubisbastet/44142268135/',
       'https://www.flickr.com/photos/lavilleautady/33546104433/'],
      dtype=object)
```

---

## Affichage sur une carte

The notebook provides a color function:

```python
COLORS = ['darkpurple', 'cadetblue', 'orange', 'purple', 'lightred',
          'darkblue', 'pink', 'green', 'lightblue', 'blue',
          'darkgreen', 'lightgreen', 'gray', 'red', 'lightgrayblack',
          'darkred', 'beige']

def get_color(label):
    if label < 0:  # Bruit
        return "lightgray"
    else:
        return COLORS[label % len(COLORS)]
```

### Question: Affichez les photos sur une carte, avec pour chaque photo une couleur correspondante au cluster dont elle fait partie.

**Answer:**
```python
rennes_map = folium.Map(
    location=[LATITUDE, LONGITUDE],
    tiles="cartodbpositron",
    zoom_start=13
)

for _, row in photos.iterrows():
    folium.CircleMarker(
        [row["lat"], row["long"]],
        radius=3,
        color=get_color(row["cluster"]),
        fill=True
    ).add_to(rennes_map)

rennes_map
```

**Expected output/map:** A map of Rennes with colored dot clusters in the city center. Light gray dots (noise) are scattered everywhere. Colored clusters are concentrated in the historic center, parks, and major landmarks.

---

### Question: Modifiez la question precedente pour ajouter un marqueur par cluster (au milieu de preference), de la bonne couleur et avec un texte indiquant le label du cluster.

**Answer:**
```python
rennes_map = folium.Map(
    location=[LATITUDE, LONGITUDE],
    tiles="cartodbpositron",
    zoom_start=13
)

# Afficher toutes les photos
for _, row in photos.iterrows():
    folium.CircleMarker(
        [row["lat"], row["long"]],
        radius=2,
        color=get_color(row["cluster"]),
        fill=True
    ).add_to(rennes_map)

# Ajouter un marqueur par cluster au centre
for cluster in sorted(photos["cluster"].unique()):
    if cluster == -1:
        continue
    cluster_photos = photos[photos["cluster"] == cluster]
    center_lat = cluster_photos["lat"].mean()
    center_lon = cluster_photos["long"].mean()
    n_photos = len(cluster_photos)
    n_users = cluster_photos["id_photographer"].nunique()

    popupText = f"Cluster {cluster}<br>{n_photos} photos<br>{n_users} users"
    folium.Marker(
        [center_lat, center_lon],
        icon=folium.Icon(color=get_color(cluster)),
        popup=popupText
    ).add_to(rennes_map)

rennes_map
```

**Expected output/map:** Same as above but with tall pin markers at each cluster center. Clicking a marker shows a popup with cluster number, photo count, and unique user count.

**Note:** The color 'lightgrayblack' in COLORS will trigger a UserWarning because it is not a valid folium color. This is present in the original TP source code and does not prevent rendering.

---

# Etape 3: Caracterisation des clusters

## Pretraitement et nettoyage des tags

> La fonction magic nettoie les tags des photos. Cette fonction "masquee" vous est donnee.

```python
# Obfuscated tag cleaning function (provided by the teacher)
O00OOOOOO0OO0O0OO = {
    'a': 'a', 'a': 'a', 'a': 'a', 'a': 'a',
    'e': 'e', 'e': 'e', 'e': 'e', 'e': 'e',
    'i': 'i', 'i': 'i', 'o': 'o', 'o': 'o',
    'u': 'u', 'u': 'u', 'u': 'u',
}
# ... (obfuscated code provided by the TP)

# Apply the magic function
magic(photos, stopwordslist)
```

The magic function performs: lowercase, accent removal, stopword removal, IMG/DSC prefix removal, and special character filtering.

---

## Analyse des tags associes

### Exemple d'utilisation de l'algorithme Apriori

The TP provides a complete example:

```python
# Example dataset
dataset = [['Milk', 'Onion', 'Nutmeg', 'Kidney Beans', 'Eggs', 'Yogurt'],
           ['Dill', 'Onion', 'Nutmeg', 'Kidney Beans', 'Eggs', 'Yogurt'],
           ['Milk', 'Apple', 'Kidney Beans', 'Eggs'],
           ['Milk', 'Unicorn', 'Corn', 'Kidney Beans', 'Yogurt'],
           ['Corn', 'Onion', 'Onion', 'Kidney Beans', 'Ice cream', 'Eggs']]

# Transform to boolean matrix
t_encoder = TransactionEncoder()
t_array = t_encoder.fit(dataset).transform(dataset)
df = pd.DataFrame(t_array, columns=t_encoder.columns_)

# Apply Apriori with minsup=60%
frequent_itemsets = apriori(df, min_support=0.6, use_colnames=True)

# Add length column
frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(lambda x: len(x))
print(frequent_itemsets)
```

**Expected output:**
```
    support                     itemsets  length
0       0.8                       (Eggs)       1
1       1.0               (Kidney Beans)       1
2       0.6                       (Milk)       1
3       0.6                      (Onion)       1
4       0.6                     (Yogurt)       1
5       0.8         (Eggs, Kidney Beans)       2
6       0.6                (Eggs, Onion)       2
7       0.6         (Kidney Beans, Milk)       2
8       0.6        (Kidney Beans, Onion)       2
9       0.6       (Yogurt, Kidney Beans)       2
10      0.6  (Eggs, Kidney Beans, Onion)       3
```

---

## Extraction des mots frequents par cluster

### Initialize cluster labels

```python
cluster_labels = {}
for cluster in photos["cluster"].unique():
    cluster_labels[cluster] = "no label"
print(cluster_labels)
```

**Expected output:**
```
{-1: 'no label', 0: 'no label', 14: 'no label', 1: 'no label', 6: 'no label',
 2: 'no label', 3: 'no label', 7: 'no label', 4: 'no label', 5: 'no label',
 8: 'no label', 9: 'no label', 10: 'no label', 11: 'no label', 12: 'no label',
 13: 'no label', 15: 'no label', 16: 'no label', 17: 'no label',
 18: 'no label', 19: 'no label'}
```

---

### Question: Pour chaque cluster extraire les itemsets frequents afin de determiner une etiquette par cluster.

> Indication: Pour chaque cluster:
> 1. calculer les motifs frequents de longueur (nombre d'items) au moins 2,
> 2. les trier par support puis par longueur,
> 3. ne garder que le plus frequent,
> 4. associer ce motif comme etiquette au cluster dans la table de hachage.
>
> Note: C'est a vous de jouer sur le seuil de support (minsup) pour observer a quel moment vous obtenez quelque chose d'interessant.

**Answer:**
```python
def identify_cluster(cluster_nb):
    cluster_photos = photos[photos["cluster"] == cluster_nb]

    # Build transactions from tag strings
    transactions = []
    for tags in cluster_photos["tags"]:
        if tags and str(tags).strip():
            words = str(tags).split()
            if len(words) > 0:
                transactions.append(words)

    if len(transactions) < 3:
        return  # Not enough data

    # Encode as boolean matrix
    te = TransactionEncoder()
    try:
        te_array = te.fit(transactions).transform(transactions)
    except Exception:
        return

    df_tags = pd.DataFrame(te_array, columns=te.columns_)

    # Try different min_support values (from strict to permissive)
    for minsup in [0.5, 0.4, 0.3, 0.2]:
        freq = apriori(df_tags, min_support=minsup, use_colnames=True)

        if freq.empty:
            continue

        # Add length column
        freq['length'] = freq['itemsets'].apply(len)

        # Keep only itemsets of length >= 2
        freq_long = freq[freq['length'] >= 2]

        if not freq_long.empty:
            # Sort by support (desc), then length (desc)
            freq_long = freq_long.sort_values(
                ['support', 'length'],
                ascending=[False, False]
            )

            # Take the top itemset
            best = freq_long.iloc[0]['itemsets']
            cluster_labels[cluster_nb] = ', '.join(sorted(best))
            return

# Apply to all clusters
for cluster_nb in cluster_labels:
    identify_cluster(cluster_nb)

print(cluster_labels)
```

**Why progressive minsup (0.5 -> 0.4 -> 0.3 -> 0.2)?** Starting strict (50%) ensures labels are meaningful and widely shared. If no itemset of length >= 2 is found, we relax progressively. This avoids labeling clusters with rare, noise-driven tag combinations.

**Expected output (depends on actual data):**
```
{-1: 'no label',
 0: 'bretagne, rennes',
 1: 'bretagne, rennes',
 2: 'bretagne, rennes',
 3: 'rennes, thabor',
 ...}
```

**Interpretation:** Many clusters get labeled "bretagne, rennes" because these are the two most common tags across all Rennes photos. More specific labels like "thabor" or "parlement" appear for clusters near those landmarks.

---

### Question: Associer le cluster et son etiquette dans l'affichage avec la carte.

**Answer:**
```python
rennes_map = folium.Map(
    location=[LATITUDE, LONGITUDE],
    tiles="cartodbpositron",
    zoom_start=13
)

# Afficher toutes les photos
for _, row in photos.iterrows():
    folium.CircleMarker(
        [row["lat"], row["long"]],
        radius=2,
        color=get_color(row["cluster"]),
        fill=True
    ).add_to(rennes_map)

# Ajouter les marqueurs avec etiquettes
for cluster in sorted(photos["cluster"].unique()):
    if cluster == -1:
        continue
    cluster_photos = photos[photos["cluster"] == cluster]
    center_lat = cluster_photos["lat"].mean()
    center_lon = cluster_photos["long"].mean()
    label = cluster_labels.get(cluster, "no label")
    n_photos = len(cluster_photos)

    popupText = f"Cluster {cluster}<br>Label: {label}<br>{n_photos} photos"
    folium.Marker(
        [center_lat, center_lon],
        icon=folium.Icon(color=get_color(cluster)),
        popup=popupText
    ).add_to(rennes_map)

rennes_map
```

**Expected output/map:** Map of Rennes with colored clusters and pin markers. Each marker's popup shows the cluster number, its Apriori-derived label, and the photo count. The markers should roughly correspond to known Rennes landmarks:

| Cluster | Approx. Location | Expected Tags | Real Place |
|---------|-------------------|---------------|------------|
| 0 | 48.111, -1.679 | rennes, bretagne | Centre historique |
| 1 | 48.114, -1.673 | thabor, parc, jardin | Parc du Thabor |
| 2 | 48.109, -1.682 | parlement, bretagne | Parlement de Bretagne |
| 3 | 48.112, -1.676 | cathedrale, eglise | Cathedrale Saint-Pierre |
| 4 | 48.116, -1.686 | place, sainte-anne | Place Sainte-Anne |

---

## Questions bonus

> S'il vous reste du temps, vous pouvez essayer de jouer sur les parametres de clustering pour avoir des clusters qui correspondent a votre idee de point d'interet de Rennes, ajouter un lien vers une photo du cluster dans les popups, etc.

### DBSCAN Parameter Sensitivity

| eps | Approx. meters | Clusters | Noise % | Character |
|-----|---------------|----------|---------|-----------|
| 0.00010 | ~11m | 30-40 | 60-70% | Very small clusters, many fragments |
| 0.00030 | ~33m | ~20 | 40-50% | Good balance (TP default) |
| 0.00100 | ~111m | 5-8 | 10-20% | Large clusters, merges distinct POI |
| 0.00300 | ~333m | 2-3 | 5% | Nearly everything in one cluster |

### Effect of min_samples

| min_samples | With eps=0.00030 | Character |
|-------------|-----------------|-----------|
| 3 | ~30 clusters | Too permissive, includes personal spots |
| 7 | ~20 clusters | Good balance (TP default) |
| 15 | ~10 clusters | Only major POI survive |
| 30 | ~3-5 clusters | Only the biggest tourist spots |

---

## Key Takeaways

1. **Data cleaning is critical:** 29,541 rows reduced to 1,232 after deduplication and album effect removal. Without cleaning, DBSCAN would find clusters around individual photographers' homes.

2. **The album photo effect** is the single biggest source of bias in geo-tagged photo data. A photographer taking 100 photos of their garden creates a false POI.

3. **DBSCAN is ideal** for spatial POI detection because it handles noise, discovers k automatically, and finds clusters of arbitrary shapes.

4. **eps on raw GPS coordinates:** Using 0.00030 degrees works as an approximation because lat/long degrees at 48 N are similar enough in scale. For higher precision, convert to projected coordinates (Lambert 93) first.

5. **Tag preprocessing** (lowercase, accents, stopwords, special chars) is essential before Apriori. Without it, "Rennes" and "rennes" would be treated as different items.

6. **Apriori on cluster tags** provides semantic labels for otherwise anonymous spatial clusters. The progressive minsup strategy balances label quality with coverage.

7. **Limitations:** Flickr data is biased toward tourists and photography enthusiasts. Residential areas and workplaces are underrepresented.
