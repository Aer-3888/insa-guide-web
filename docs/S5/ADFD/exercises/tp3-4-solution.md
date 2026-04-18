---
title: "TP3-4 : Detection et Caracterisation de POI a Rennes - Solution"
sidebar_position: 3
---

# TP3-4 : Detection et Caracterisation de POI a Rennes - Solution

> Conforme aux instructions de l'enseignant dans : `TP-23-24-etud_without_NLP_task_todo.ipynb`

**Technique** : Clustering spatial avec DBSCAN sur des donnees de photos geolocalisees, suivi de la caracterisation des clusters par extraction d'itemsets frequents avec Apriori sur les tags des photos.

**Objectif** : Identifier les points d'interet (POI) de Rennes a partir de photos Flickr geolocalisees en utilisant l'analyse spatiale non supervisee. Un POI est defini comme le lieu de photographies prises par un grand nombre d'utilisateurs distincts.

**Jeu de donnees** : `flickrRennes.csv` -- photos geolocalisees issues de l'API Flickr, centrees sur Rennes, France.

**Duree** : Double seance (TP3 + TP4).

---

## Preparation : Imports et constantes

```python noexec
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

## Chargement des donnees

```python noexec
photos_orig = pd.read_csv("flickrRennes.csv")
photos = photos_orig.copy()
photos.head()
```

**Colonnes du jeu de donnees :**
- **id_photo** = identifiant de la photo
- **title** = titre de la photo
- **id_photographer** = identifiant du proprietaire (utilisateur)
- **lat, long** = coordonnees geographiques de la prise de vue
- **tags** = les tags fournis par l'utilisateur
- **url** = lien de la photo
- **date_uploaded*** = informations sur la date de publication
- **date_taken*** = informations sur la date de prise de la photo

---

# Etape 1 : Preparation des donnees

## Prise en main du jeu de donnees

### Question : Affichez le nombre de photos contenues dans le DataFrame.

**Reponse :**
```python noexec
len(photos)
```

**Resultat attendu :**
```
29541
```

---

### Question : Affichez les valeurs moyennes et medianes de la latitude et longitude. Cela vous parait-il coherent ?

**Reponse :**
```python noexec
print(photos["lat"].mean())
print(photos["long"].mean())
print(photos["lat"].median())
print(photos["long"].median())
```

**Resultat attendu :**
```
48.108595345892155
-1.680869942554416
48.11011
-1.678194
```

**Interpretation :** La moyenne et la mediane sont tres proches du centre-ville de Rennes (48.117, -1.678). C'est coherent -- les donnees sont geolocalisees autour de Rennes. Le faible ecart moyenne-mediane indique une distribution a peu pres symetrique centree sur la ville.

---

### Question : De quelle annee date la photo la plus ancienne ? Et la plus recente ?

**Reponse :**
```python noexec
print(photos["date_taken_year"].min())
print(photos["date_taken_year"].max())
```

**Resultat attendu :**
```
2004
2019
```

**Interpretation :** Les photos couvrent 15 ans. Malgre l'enonce du TP disant "photos geolocalisees autour de Rennes en 2019", le "2019" fait reference a la date d'extraction des donnees de l'API, pas a la date de prise de toutes les photos.

---

### Question : Affichez le nombre d'utilisateurs distincts.

**Reponse :**
```python noexec
photos["id_photographer"].nunique()
```

**Resultat attendu :**
```
213
```

---

### Question : Affichez le nombre de valeurs distinctes de id_photo.

**Reponse :**
```python noexec
photos["id_photo"].nunique()
```

**Resultat attendu :**
```
4148
```

**Observation cle :** 29 541 lignes mais seulement 4 148 identifiants de photos uniques signifie que chaque photo apparait ~7.1 fois en moyenne. Le CSV contient des lignes exactement en double.

---

## Suppression des doublons

> Les identifiants des photos sont censes etre uniques, pourtant la question precedente affiche un nombre d'identifiants bien inferieur au nombre de lignes du DataFrame. Il est fort possible qu'il y ait des doublons.

### Question : Supprimez les lignes en double.

> Indication : la documentation de la classe DataFrame se trouve ici : https://pandas.pydata.org/pandas-docs/stable/reference/frame.html

**Reponse :**
```python noexec
photos = photos.drop_duplicates()
```

---

### Question : Affichez la nouvelle taille du jeu de donnees.

**Reponse :**
```python noexec
len(photos)
```

**Resultat attendu :**
```
4148
```

**Interpretation :** `drop_duplicates()` supprime les lignes identiques sur TOUTES les colonnes. La reduction de 29 541 a 4 148 confirme qu'environ 86% des lignes etaient des doublons exacts.

---

## Analyse des donnees

### Question : Afficher le nombre de photos par utilisateurs distincts.

**Reponse :**
```python noexec
photos_per_user = photos.groupby("id_photographer").size()
print(photos_per_user)
```

**Resultat attendu (tronque) :**
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

### Question : Affichez le nombre d'utilisateurs n'ayant poste qu'une seule photo.

**Reponse :**
```python noexec
single_photo_users = (photos_per_user == 1).sum()
print(single_photo_users)
```

**Resultat attendu :**
```
74
```

**Interpretation :** 74 des 213 utilisateurs (35%) n'ont poste qu'une seule photo. Ce sont probablement des touristes occasionnels ou des visiteurs ponctuels.

---

### Question : Combien de photos prennent les photographes de ce jeu de donnees ? Afficher la distribution du nombre de photographes par nombre de photos.

> Le resultat devrait ressembler a l'image `photographes_par_photo.png`.

**Reponse :**
```python noexec
photo_counts = photos_per_user.value_counts().sort_index()
plt.figure(figsize=(10, 6))
plt.bar(photo_counts.index, photo_counts.values)
plt.xlabel('Nombre de photos')
plt.ylabel('Nombre de photographes')
plt.title('Distribution des photographes par nombre de photos')
plt.show()
```

**Resultat attendu :** Un histogramme fortement asymetrique a droite. Tres grande barre a x=1 (74 photographes), puis decroissance rapide. La plupart des photographes ont moins de 20 photos, mais quelques-uns en ont des centaines.

---

### Question : Afficher un diagramme a barres de la distribution des photos sur les mois de l'annee.

> Indication : la fonction matplotlib a utiliser est `bar`, la fonction `hist` n'est pas ce que vous cherchez.

**Reponse :**
```python noexec
month_counts = photos.groupby("date_taken_month").size()
plt.figure(figsize=(10, 6))
plt.bar(month_counts.index, month_counts.values)
plt.xlabel('Mois')
plt.ylabel('Nombre de photos')
plt.title('Distribution des photos par mois')
plt.xticks(range(1, 13))
plt.show()
```

**Resultat attendu :** Pattern saisonnier avec plus de photos au printemps/ete (avril-septembre) et moins en hiver (novembre-fevrier). Le pic est generalement autour de juillet-septembre (saison touristique).

---

## Affichage des donnees sur une carte

Le notebook fournit le code suivant pour afficher les photos sur une carte :

```python noexec
rennes_map = folium.Map(
    location=[LATITUDE, LONGITUDE],
    tiles="cartodbpositron",
    zoom_start=12
)

for row_nb, row in photos.iterrows():
    folium.CircleMarker([row["lat"], row["long"]], radius=1).add_to(rennes_map)

rennes_map
```

**Resultat attendu :** Des points bleus disperses sur Rennes. Des clusters denses visibles dans le centre-ville (coeur historique, quartier du parc du Thabor). Des points eparpilles en peripherie.

---

## Limitation de l'effet "album photo"

> Certains utilisateurs publient des series de photos, generalement prises au meme endroit, dans un court laps de temps. Un centre d'interet doit etre le lieu de photographies d'un grand nombre d'utilisateurs distincts et non pas d'une personne isolee.
> Une solution simpliste est de ne garder qu'une photo par utilisateur par heure de temps.

### Question : Donnez l'instruction pandas correspondante et critiquez-la. Mettez ensuite a jour le DataFrame photos en gardant une seule photo par groupe.

> Indication : utiliser la methode `groupby` avec plusieurs groupements.
> Note : passer le parametre `as_index = False` pour eviter la creation d'un index multiple.

**Reponse :**
```python noexec
photos = photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

**Critique de cette approche :**
1. **Trop agressive :** Un utilisateur visitant deux endroits differents dans la meme heure perd un endroit
2. **Pas assez agressive :** Un utilisateur prenant une photo par heure au meme endroit cree quand meme plusieurs entrees
3. **Meilleure alternative :** Deduplication spatiale -- grouper par (utilisateur, latitude arrondie, longitude arrondie)

---

### Question : Affichez le DataFrame modifie.

**Reponse :**
```python noexec
photos
```

**Resultat attendu :** Un DataFrame avec 1 232 lignes et 19 colonnes.

---

### Question : Affichez le nombre de photos contenues dans le DataFrame.

**Reponse :**
```python noexec
len(photos)
```

**Resultat attendu :**
```
1232
```

**Interpretation :** Le groupby ne garde que la premiere photo par (utilisateur, annee, mois, jour, heure). Cela reduit le jeu de donnees d'environ 70%, ce qui signifie que la plupart des photos faisaient partie de series rapides.

---

### Question : Affichez les photos du DataFrame sur une carte.

**Reponse :**
```python noexec
rennes_map = folium.Map(
    location=[LATITUDE, LONGITUDE],
    tiles="cartodbpositron",
    zoom_start=12
)

for row_nb, row in photos.iterrows():
    folium.CircleMarker([row["lat"], row["long"]], radius=1).add_to(rennes_map)

rennes_map
```

**Resultat attendu :** Plus eparpille qu'avant, mais les zones de concentration principales restent visibles dans le centre de Rennes.

---

# Etape 2 : Clustering des photos

## Identification des points d'interet

### Question : Choisissez un algorithme pour notre probleme parmi KMeans et DBSCAN en justifiant votre choix.

**Reponse :** DBSCAN est le meilleur choix pour quatre raisons :
1. **On ne connait pas K :** Le nombre de POI a Rennes est inconnu. DBSCAN le decouvre automatiquement.
2. **Formes arbitraires :** Un POI le long d'une riviere ou d'une rue n'est pas spherique. DBSCAN gere les formes arbitraires ; KMeans suppose des clusters spheriques.
3. **Gestion du bruit :** Beaucoup de photos sont a des endroits aleatoires (hotel, parking). DBSCAN les etiquette comme bruit (-1) ; KMeans forcerait chaque photo dans un cluster.
4. **Definition basee sur la densite :** Notre definition de POI est "zone dense de photos" -- cela correspond directement a l'approche de DBSCAN.

---

### Question : Appliquez l'algorithme sur les donnees en utilisant soit `sklearn.cluster.KMeans` ou `sklearn.cluster.DBSCAN`.

> Parametres conseilles pour DBSCAN : eps=0.00030, min_samples=7

**Reponse :**
```python noexec
clustering = sklearn.cluster.DBSCAN(eps=0.00030, min_samples=7)
labels = clustering.fit_predict(photos[["lat", "long"]].values)
```

**Analyse des parametres :**
- `eps=0.00030` degres : A la latitude 48 N, 0.0003 degre de latitude = ~33 metres, 0.0003 degre de longitude = ~22 metres
- `min_samples=7` : Un point a besoin d'au moins 7 voisins dans le rayon eps pour etre un point noyau, filtrant les petits clusters personnels

---

### Question : Affichez la liste des labels des clusters crees.

> Vous devez obtenir un tableau qui indique le numero de cluster de chaque photo, comme celui-ci : array([-1, -1, -1, ..., -1, -1, -1])

**Reponse :**
```python noexec
print(labels)
```

**Resultat attendu :**
```
array([-1, -1, -1, ..., -1, -1, -1])
```

---

### Question : Ajoutez ces informations au DataFrame, dans une nouvelle colonne "cluster". Affichez le DataFrame.

**Reponse :**
```python noexec
photos["cluster"] = labels
photos
```

**Resultat attendu :** Le DataFrame a maintenant 20 colonnes (19 originales + 1 colonne "cluster"). La colonne cluster contient des etiquettes entieres de -1 (bruit) a 19.

---

### Question : Affichez la liste des labels de cluster du DataFrame, sans les doublons. Quel label est utilise pour marquer une photo qui n'appartient pas a un cluster ?

**Reponse :**
```python noexec
photos["cluster"].unique()
```

**Resultat attendu :**
```
array([-1,  0, 14,  1,  6,  2,  3,  7,  4,  5,  8,  9, 10, 11, 12, 13, 15,
       16, 17, 18, 19])
```

**Interpretation :** Le label **-1** marque le bruit (photos n'appartenant a aucun cluster). Il y a 20 clusters (0 a 19) plus le bruit. La numerotation est arbitraire, determinee par l'ordre de decouverte de DBSCAN.

---

### Question : Affichez les url de toutes les photos appartenant au cluster de label 2.

**Reponse :**
```python noexec
photos[photos["cluster"] == 2]["url"].values
```

**Resultat attendu :**
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

Le notebook fournit une fonction de couleur :

```python noexec
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

### Question : Affichez les photos sur une carte, avec pour chaque photo une couleur correspondante au cluster dont elle fait partie.

**Reponse :**
```python noexec
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

**Resultat attendu :** Une carte de Rennes avec des points colores regroupes en clusters dans le centre-ville. Des points gris clair (bruit) sont disperses partout. Les clusters colores sont concentres dans le centre historique, les parcs et les monuments principaux.

---

### Question : Modifiez la question precedente pour ajouter un marqueur par cluster (au milieu de preference), de la bonne couleur et avec un texte indiquant le label du cluster.

**Reponse :**
```python noexec
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

    popupText = f"Cluster {cluster}<br>{n_photos} photos<br>{n_users} utilisateurs"
    folium.Marker(
        [center_lat, center_lon],
        icon=folium.Icon(color=get_color(cluster)),
        popup=popupText
    ).add_to(rennes_map)

rennes_map
```

**Resultat attendu :** Meme carte mais avec des marqueurs epingle au centre de chaque cluster. Un clic sur un marqueur affiche un popup avec le numero du cluster, le nombre de photos et le nombre d'utilisateurs uniques.

**Note :** La couleur 'lightgrayblack' dans COLORS declenchera un UserWarning car ce n'est pas une couleur valide pour folium. Cela est present dans le code source original du TP et n'empeche pas le rendu.

---

# Etape 3 : Caracterisation des clusters

## Pretraitement et nettoyage des tags

> La fonction magic nettoie les tags des photos. Cette fonction "masquee" vous est donnee.

```python noexec
# Fonction de nettoyage de tags obfusquee (fournie par l'enseignant)
O00OOOOOO0OO0O0OO = {
    'a': 'a', 'a': 'a', 'a': 'a', 'a': 'a',
    'e': 'e', 'e': 'e', 'e': 'e', 'e': 'e',
    'i': 'i', 'i': 'i', 'o': 'o', 'o': 'o',
    'u': 'u', 'u': 'u', 'u': 'u',
}
# ... (code obfusque fourni par le TP)

# Appliquer la fonction magic
magic(photos, stopwordslist)
```

La fonction magic effectue : passage en minuscules, suppression des accents, suppression des mots vides, suppression des prefixes IMG/DSC et filtrage des caracteres speciaux.

---

## Analyse des tags associes

### Exemple d'utilisation de l'algorithme Apriori

Le TP fournit un exemple complet :

```python noexec
# Jeu de donnees exemple
dataset = [['Milk', 'Onion', 'Nutmeg', 'Kidney Beans', 'Eggs', 'Yogurt'],
           ['Dill', 'Onion', 'Nutmeg', 'Kidney Beans', 'Eggs', 'Yogurt'],
           ['Milk', 'Apple', 'Kidney Beans', 'Eggs'],
           ['Milk', 'Unicorn', 'Corn', 'Kidney Beans', 'Yogurt'],
           ['Corn', 'Onion', 'Onion', 'Kidney Beans', 'Ice cream', 'Eggs']]

# Transformer en matrice booleenne
t_encoder = TransactionEncoder()
t_array = t_encoder.fit(dataset).transform(dataset)
df = pd.DataFrame(t_array, columns=t_encoder.columns_)

# Appliquer Apriori avec minsup=60%
frequent_itemsets = apriori(df, min_support=0.6, use_colnames=True)

# Ajouter une colonne longueur
frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(lambda x: len(x))
print(frequent_itemsets)
```

**Resultat attendu :**
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

### Initialisation des etiquettes de cluster

```python noexec
cluster_labels = {}
for cluster in photos["cluster"].unique():
    cluster_labels[cluster] = "no label"
print(cluster_labels)
```

**Resultat attendu :**
```
{-1: 'no label', 0: 'no label', 14: 'no label', 1: 'no label', 6: 'no label',
 2: 'no label', 3: 'no label', 7: 'no label', 4: 'no label', 5: 'no label',
 8: 'no label', 9: 'no label', 10: 'no label', 11: 'no label', 12: 'no label',
 13: 'no label', 15: 'no label', 16: 'no label', 17: 'no label',
 18: 'no label', 19: 'no label'}
```

---

### Question : Pour chaque cluster extraire les itemsets frequents afin de determiner une etiquette par cluster.

> Indication : Pour chaque cluster :
> 1. calculer les motifs frequents de longueur (nombre d'items) au moins 2,
> 2. les trier par support puis par longueur,
> 3. ne garder que le plus frequent,
> 4. associer ce motif comme etiquette au cluster dans la table de hachage.
>
> Note : C'est a vous de jouer sur le seuil de support (minsup) pour observer a quel moment vous obtenez quelque chose d'interessant.

**Reponse :**
```python noexec
def identify_cluster(cluster_nb):
    cluster_photos = photos[photos["cluster"] == cluster_nb]

    # Construire les transactions a partir des chaines de tags
    transactions = []
    for tags in cluster_photos["tags"]:
        if tags and str(tags).strip():
            words = str(tags).split()
            if len(words) > 0:
                transactions.append(words)

    if len(transactions) < 3:
        return  # Pas assez de donnees

    # Encoder en matrice booleenne
    te = TransactionEncoder()
    try:
        te_array = te.fit(transactions).transform(transactions)
    except Exception:
        return

    df_tags = pd.DataFrame(te_array, columns=te.columns_)

    # Essayer differentes valeurs de min_support (du plus strict au plus permissif)
    for minsup in [0.5, 0.4, 0.3, 0.2]:
        freq = apriori(df_tags, min_support=minsup, use_colnames=True)

        if freq.empty:
            continue

        # Ajouter une colonne longueur
        freq['length'] = freq['itemsets'].apply(len)

        # Garder uniquement les itemsets de longueur >= 2
        freq_long = freq[freq['length'] >= 2]

        if not freq_long.empty:
            # Trier par support (decroissant), puis longueur (decroissant)
            freq_long = freq_long.sort_values(
                ['support', 'length'],
                ascending=[False, False]
            )

            # Prendre le meilleur itemset
            best = freq_long.iloc[0]['itemsets']
            cluster_labels[cluster_nb] = ', '.join(sorted(best))
            return

# Appliquer a tous les clusters
for cluster_nb in cluster_labels:
    identify_cluster(cluster_nb)

print(cluster_labels)
```

**Pourquoi un minsup progressif (0.5 -> 0.4 -> 0.3 -> 0.2) ?** Commencer strict (50%) assure que les etiquettes sont significatives et largement partagees. Si aucun itemset de longueur >= 2 n'est trouve, on relache progressivement. Cela evite d'etiqueter les clusters avec des combinaisons de tags rares et bruitees.

**Resultat attendu (depend des donnees reelles) :**
```
{-1: 'no label',
 0: 'bretagne, rennes',
 1: 'bretagne, rennes',
 2: 'bretagne, rennes',
 3: 'rennes, thabor',
 ...}
```

**Interpretation :** Beaucoup de clusters recoivent l'etiquette "bretagne, rennes" car ce sont les deux tags les plus courants dans toutes les photos de Rennes. Des etiquettes plus specifiques comme "thabor" ou "parlement" apparaissent pour les clusters proches de ces monuments.

---

### Question : Associer le cluster et son etiquette dans l'affichage avec la carte.

**Reponse :**
```python noexec
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

    popupText = f"Cluster {cluster}<br>Etiquette : {label}<br>{n_photos} photos"
    folium.Marker(
        [center_lat, center_lon],
        icon=folium.Icon(color=get_color(cluster)),
        popup=popupText
    ).add_to(rennes_map)

rennes_map
```

**Resultat attendu :** Carte de Rennes avec des clusters colores et des marqueurs epingle. Le popup de chaque marqueur affiche le numero du cluster, son etiquette derivee d'Apriori et le nombre de photos. Les marqueurs devraient correspondre approximativement aux monuments connus de Rennes :

| Cluster | Localisation approx. | Tags attendus | Lieu reel |
|---------|---------------------|---------------|-----------|
| 0 | 48.111, -1.679 | rennes, bretagne | Centre historique |
| 1 | 48.114, -1.673 | thabor, parc, jardin | Parc du Thabor |
| 2 | 48.109, -1.682 | parlement, bretagne | Parlement de Bretagne |
| 3 | 48.112, -1.676 | cathedrale, eglise | Cathedrale Saint-Pierre |
| 4 | 48.116, -1.686 | place, sainte-anne | Place Sainte-Anne |

---

## Questions bonus

> S'il vous reste du temps, vous pouvez essayer de jouer sur les parametres de clustering pour avoir des clusters qui correspondent a votre idee de point d'interet de Rennes, ajouter un lien vers une photo du cluster dans les popups, etc.

### Sensibilite des parametres DBSCAN

| eps | Metres approx. | Clusters | Bruit % | Caractere |
|-----|----------------|----------|---------|-----------|
| 0.00010 | ~11m | 30-40 | 60-70% | Tres petits clusters, beaucoup de fragments |
| 0.00030 | ~33m | ~20 | 40-50% | Bon equilibre (defaut du TP) |
| 0.00100 | ~111m | 5-8 | 10-20% | Grands clusters, fusionne des POI distincts |
| 0.00300 | ~333m | 2-3 | 5% | Presque tout dans un seul cluster |

### Effet de min_samples

| min_samples | Avec eps=0.00030 | Caractere |
|-------------|-----------------|-----------|
| 3 | ~30 clusters | Trop permissif, inclut des lieux personnels |
| 7 | ~20 clusters | Bon equilibre (defaut du TP) |
| 15 | ~10 clusters | Seuls les POI majeurs survivent |
| 30 | ~3-5 clusters | Seulement les plus grands sites touristiques |

---

## Points cles a retenir

1. **Le nettoyage des donnees est critique :** 29 541 lignes reduites a 1 232 apres deduplication et suppression de l'effet album. Sans nettoyage, DBSCAN trouverait des clusters autour des domiciles des photographes individuels.

2. **L'effet album photo** est la plus grande source de biais dans les donnees de photos geotaggees. Un photographe prenant 100 photos de son jardin cree un faux POI.

3. **DBSCAN est ideal** pour la detection spatiale de POI car il gere le bruit, decouvre k automatiquement et trouve des clusters de formes arbitraires.

4. **eps sur coordonnees GPS brutes :** Utiliser 0.00030 degres fonctionne en approximation car les degres lat/lon a 48 N ont des echelles suffisamment similaires. Pour plus de precision, convertir d'abord en coordonnees projetees (Lambert 93).

5. **Le pretraitement des tags** (minuscules, accents, mots vides, caracteres speciaux) est essentiel avant Apriori. Sans cela, "Rennes" et "rennes" seraient traites comme des items differents.

6. **Apriori sur les tags de clusters** fournit des etiquettes semantiques pour des clusters spatiaux autrement anonymes. La strategie de minsup progressif equilibre qualite des etiquettes et couverture.

7. **Limitations :** Les donnees Flickr sont biaisees vers les touristes et les passionnes de photographie. Les zones residentielles et les lieux de travail sont sous-representes.
