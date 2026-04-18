---
title: "Chapitre 4 : Fouille de donnees et NLP (traitement du langage naturel)"
sidebar_position: 4
---

# Chapitre 4 : Fouille de donnees et NLP (traitement du langage naturel)

## Presentation

La partie Fouille de Donnees (FD) du cours couvre l'extraction non supervisee de motifs a partir de donnees : l'extraction d'itemsets frequents avec l'algorithme Apriori, les regles d'association et le pretraitement NLP de base pour la fouille de texte. Ces techniques sont appliquees dans les TP3-4 pour caracteriser les clusters de POI a l'aide de tags de photos.

## 1. Extraction d'itemsets frequents (motifs frequents)

### Definitions

| Terme | Definition |
|-------|-----------|
| **Item** | Un element unique (ex. "Lait", "rennes", un produit) |
| **Itemset** (motif) | Un ensemble d'items (ex. {Lait, Oeufs}) |
| **Transaction** | Un enregistrement contenant un ensemble d'items (ex. un panier d'achat) |
| **Support** | Fraction des transactions contenant l'itemset |
| **Itemset frequent** (motif frequent) | Un itemset dont le support >= seuil de support minimum |
| **Support minimum** (minsup) | Seuil defini par l'utilisateur |

### Formule du support

```
support(X) = |{T dans DB : X est sous-ensemble de T}| / |DB|
```

Ou DB est la base de transactions et T une transaction individuelle.

**Exemple** : Si 3 transactions sur 5 contiennent {Oeufs, Haricots Rouges}, alors :
```
support({Oeufs, Haricots Rouges}) = 3/5 = 0.6 = 60%
```

### Propriete d'anti-monotonie

**Theoreme cle** : Si un itemset est non frequent, tous ses sur-ensembles sont aussi non frequents.

Contraposee : Si un itemset est frequent, tous ses sous-ensembles sont aussi frequents.

C'est le fondement de l'algorithme Apriori -- il permet d'elaguer l'espace de recherche.

## 2. L'algorithme Apriori

### Presentation de l'algorithme

Apriori trouve tous les itemsets frequents en generant iterativement des candidats de taille croissante et en elaguant les non frequents.

```
1. L_1 = {itemsets frequents de taille 1}  (scanner la base, compter, filtrer par minsup)
2. Pour k = 2, 3, ...
   a. C_k = generer les candidats a partir de L_{k-1}  (jointure + elagage)
   b. Scanner la base, compter le support de chaque candidat de C_k
   c. L_k = {candidats de C_k avec support >= minsup}
   d. Si L_k est vide, arreter
3. Retourner l'union de tous les L_k
```

### Generation des candidats (etape 2a)

**Etape de jointure** : Fusionner deux itemsets de L_{k-1} qui partagent les k-2 premiers items.

**Etape d'elagage** : Supprimer tout candidat ayant un sous-ensemble de taille (k-1) absent de L_{k-1} (par anti-monotonie, il ne peut pas etre frequent).

### Exemple detaille

**Base de donnees** :

| Transaction | Items |
|-------------|-------|
| T1 | Milk, Onion, Nutmeg, Kidney Beans, Eggs, Yogurt |
| T2 | Dill, Onion, Nutmeg, Kidney Beans, Eggs, Yogurt |
| T3 | Milk, Apple, Kidney Beans, Eggs |
| T4 | Milk, Unicorn, Corn, Kidney Beans, Yogurt |
| T5 | Corn, Onion, Kidney Beans, Ice cream, Eggs |

**minsup = 60% (= 3 transactions)**

**Etape 1 : Itemsets frequents de taille 1 (L_1)**

| Item | Comptage | Support | Frequent ? |
|------|----------|---------|------------|
| Eggs | 4 | 80% | Oui |
| Kidney Beans | 5 | 100% | Oui |
| Milk | 3 | 60% | Oui |
| Onion | 3 | 60% | Oui |
| Yogurt | 3 | 60% | Oui |
| Corn | 2 | 40% | Non |
| Nutmeg | 2 | 40% | Non |
| Apple | 1 | 20% | Non |
| Dill | 1 | 20% | Non |
| Ice cream | 1 | 20% | Non |
| Unicorn | 1 | 20% | Non |

L_1 = {Eggs, Kidney Beans, Milk, Onion, Yogurt}

**Etape 2 : Itemsets frequents de taille 2 (L_2)**

Generer toutes les paires de L_1, compter le support :

| Itemset | Support | Frequent ? |
|---------|---------|------------|
| {Eggs, Kidney Beans} | 4/5 = 80% | Oui |
| {Eggs, Onion} | 3/5 = 60% | Oui |
| {Kidney Beans, Milk} | 3/5 = 60% | Oui |
| {Kidney Beans, Onion} | 3/5 = 60% | Oui |
| {Yogurt, Kidney Beans} | 3/5 = 60% | Oui |
| {Eggs, Milk} | 2/5 = 40% | Non |
| {Eggs, Yogurt} | 2/5 = 40% | Non |
| {Milk, Onion} | 1/5 = 20% | Non |
| {Milk, Yogurt} | 2/5 = 40% | Non |
| {Onion, Yogurt} | 2/5 = 40% | Non |

**Etape 3 : Itemsets frequents de taille 3 (L_3)**

A partir de L_2, les candidats doivent avoir tous leurs sous-ensembles de taille 2 dans L_2.

| Candidat | Tous les sous-ensembles de taille 2 frequents ? | Support | Frequent ? |
|----------|------------------------------------------------|---------|------------|
| {Eggs, Kidney Beans, Onion} | EK:Oui, EO:Oui, KO:Oui | 3/5=60% | Oui |
| {Eggs, Kidney Beans, Milk} | EK:Oui, EM:Non | -- | Elague |
| {Eggs, Kidney Beans, Yogurt} | EK:Oui, EY:Non | -- | Elague |
| ... | ... | ... | ... |

L_3 = {{Eggs, Kidney Beans, Onion}}

**Resultat final** : Tous les itemsets frequents = L_1 union L_2 union L_3

### Implementation Python

```python noexec
from mlxtend.frequent_patterns import apriori
from mlxtend.preprocessing import TransactionEncoder

# Transformer les transactions en matrice booleenne
te = TransactionEncoder()
te_array = te.fit(dataset).transform(dataset)
df = pd.DataFrame(te_array, columns=te.columns_)

# Executer Apriori
frequent_itemsets = apriori(df, min_support=0.6, use_colnames=True)

# Ajouter une colonne longueur
frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(len)

# Filtrer par longueur
long_itemsets = frequent_itemsets[frequent_itemsets['length'] >= 2]
```

## 3. Regles d'association

### Definitions

Une regle d'association a la forme : X --> Y (si X alors Y), ou X et Y sont des itemsets disjoints.

| Metrique | Formule | Signification |
|----------|---------|---------------|
| **Support** | support(X union Y) | Frequence a laquelle X et Y apparaissent ensemble |
| **Confiance** | support(X union Y) / support(X) | P(Y \| X) -- probabilite de Y sachant X |
| **Lift** | confiance(X->Y) / support(Y) | Combien Y est plus probable etant donne X par rapport au hasard |

### Interpretation

| Valeur du lift | Signification |
|----------------|---------------|
| lift > 1 | Association positive (X et Y apparaissent ensemble plus que prevu) |
| lift = 1 | Independants (pas d'association) |
| lift < 1 | Association negative (X et Y s'evitent) |

### Exemple

A partir des donnees precedentes :
- Regle : {Onion, Kidney Beans} --> {Eggs}
- support({Onion, KB, Eggs}) = 60%
- confiance = 60% / 60% = 100%
- lift = 100% / 80% = 1.25

Interpretation : Si un panier contient Onion et Kidney Beans, il contient toujours des Eggs. Le lift de 1.25 signifie que cette combinaison est 25% plus probable que le hasard.

## 4. Pretraitement de texte pour le NLP

Dans les TP3-4, les tags des photos Flickr sont pretraites avant l'extraction de motifs. La pipeline :

### Etape 1 : Conversion en minuscules

```python noexec
def lowerCase(tags):
    return tags.lower()
```

### Etape 2 : Suppression des accents

```python noexec
def supprimeAccent(tags):
    # Associe les caracteres accentues a leurs equivalents non accentues
    # ex. 'e' accent aigu -> 'e', 'a' accent grave -> 'a', etc.
    # Note : Les cles accentuees (caracteres unicode) peuvent ne pas s'afficher
    # correctement dans tous les editeurs. Le principe est une correspondance caractere par caractere.
    accent_map = {
        '\u00e0': 'a', '\u00e2': 'a', '\u00e4': 'a',  # a grave, circonflexe, trema
        '\u00e9': 'e', '\u00e8': 'e', '\u00ea': 'e', '\u00eb': 'e',  # e aigu, grave, circonflexe, trema
        '\u00ee': 'i', '\u00ef': 'i',  # i circonflexe, trema
        '\u00f4': 'o', '\u00f6': 'o',  # o circonflexe, trema
        '\u00f9': 'u', '\u00fb': 'u', '\u00fc': 'u',  # u grave, circonflexe, trema
    }
    result = []
    for char in tags:
        result.append(accent_map.get(char, char))
    return ''.join(result)
```

Approche plus robuste (recommandee) :
```python noexec
import unicodedata
def remove_accents(text):
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd if not unicodedata.combining(c))
```

### Etape 3 : Suppression des mots vides (stopwords)

Les mots vides sont des mots courants sans signification semantique (le, la, de, des, un, une, etc.).

```python noexec
from nltk.corpus import stopwords
stopwordslist = stopwords.words("french")

def supprimeStopwords(tags):
    words = tags.split()
    return ' '.join(w for w in words if w not in stopwordslist)
```

### Etape 4 : Suppression des identifiants de photos

Les tags comme "IMG_7719" ou "DSC_2692" sont generes par l'appareil photo et ne portent aucune signification.

```python noexec
import re

def supprimeIdentPhoto(tags):
    regex_img = re.compile(r'^img_', re.IGNORECASE)
    regex_dsc = re.compile(r'^dsc_', re.IGNORECASE)
    words = tags.split()
    return ' '.join(w for w in words
                    if not regex_img.match(w) and not regex_dsc.match(w))
```

### Etape 5 : Ne garder que les mots alphanumeriques

Supprimer les mots contenant des caracteres speciaux (URLs, emojis, ponctuation).

```python noexec
def supprimeCarSpeciaux(tags):
    pattern = re.compile(r'^[\w-]+$')
    words = tags.split()
    return ' '.join(w for w in words if pattern.match(w))
```

### Pipeline complete

```python noexec
photos["tags"] = photos["tags"].fillna("")
for idx, row in photos.iterrows():
    tags = row["tags"]
    tags = lowerCase(tags)
    tags = supprimeAccent(tags)
    tags = supprimeStopwords(tags)
    tags = supprimeIdentPhoto(tags)
    tags = supprimeCarSpeciaux(tags)
    photos.at[idx, "tags"] = tags
```

## 5. Etiquetage des clusters avec Apriori (issu des TP3-4)

Apres le clustering des photos avec DBSCAN, on utilise Apriori sur les tags de chaque cluster pour trouver son etiquette la plus caracteristique :

```python noexec
def identify_cluster(cluster_nb, photos, cluster_labels):
    # Obtenir les photos de ce cluster
    cluster_photos = photos[photos['cluster'] == cluster_nb]
    
    # Construire la liste des transactions a partir des tags
    transactions = []
    for tags in cluster_photos['tags']:
        if tags and tags.strip():
            transactions.append(tags.split())
    
    if not transactions:
        return
    
    # Encoder en matrice booleenne
    te = TransactionEncoder()
    te_array = te.fit(transactions).transform(transactions)
    df_tags = pd.DataFrame(te_array, columns=te.columns_)
    
    # Appliquer Apriori (jouer avec min_support : 0.3-0.6)
    freq = apriori(df_tags, min_support=0.3, use_colnames=True)
    
    if freq.empty:
        return
    
    # Garder les itemsets de longueur >= 2
    freq['length'] = freq['itemsets'].apply(len)
    freq = freq[freq['length'] >= 2]
    
    if freq.empty:
        return
    
    # Trier par support (decroissant), puis par longueur (decroissant)
    freq = freq.sort_values(['support', 'length'], ascending=[False, False])
    
    # Prendre le meilleur itemset comme etiquette du cluster
    best = freq.iloc[0]['itemsets']
    cluster_labels[cluster_nb] = ', '.join(sorted(best))
```

## 6. Fouille de motifs avancee (contenu du cours)

Le cours couvre egalement (dans les cours 7 et 10) :

### Fouille de motifs sequentiels
Trouver des sequences ordonnees d'itemsets qui apparaissent frequemment dans une base de sequences.

Exemple : {Pain, Beurre} --> {Lait} --> {Oeufs} (les clients qui achetent du pain et du beurre, puis du lait, puis des oeufs)

### Itemsets fermes et maximaux
- **Itemset ferme** : Itemset frequent sans sur-ensemble propre ayant le meme support
- **Itemset maximal** : Itemset frequent sans sur-ensemble propre frequent

Ces notions reduisent le nombre de motifs tout en preservant toute l'information.

## Pieges courants

1. **Definir minsup trop bas** : Produit un nombre exponentiel d'itemsets, dont la plupart ne sont pas interessants.
2. **Definir minsup trop haut** : Rate des motifs importants. Commencez autour de 0.3-0.5 et ajustez.
3. **Confondre support et confiance** : Le support concerne la frequence de l'itemset entier ; la confiance est la probabilite conditionnelle.
4. **Ne pas gerer les tags vides** : Verifiez toujours les NaN/chaines vides avant Apriori.
5. **Oublier de supprimer les mots vides** : Les mots courants comme "rennes" ou "france" domineront tous les clusters s'ils ne sont pas traites.

---

## AIDE-MEMOIRE

### Apriori pas a pas (pour l'examen)

```
1. Compter le support de tous les items individuels --> L_1
2. Generer les paires a partir de L_1 --> C_2
3. Compter le support de C_2 --> garder les frequents --> L_2
4. Generer les triplets a partir de L_2 (elagage par anti-monotonie) --> C_3
5. Compter le support de C_3 --> garder les frequents --> L_3
6. Continuer jusqu'a ce que L_k soit vide
```

### Regles d'anti-monotonie

```
{A} non frequent  -->  {A, B}, {A, C}, {A, B, C}, ... tous non frequents
{A, B} frequent   -->  {A} et {B} doivent etre frequents
```

### Formules cles

| Metrique | Formule |
|----------|---------|
| support(X) | comptage(X dans DB) / \|DB\| |
| confiance(X -> Y) | support(X union Y) / support(X) |
| lift(X -> Y) | confiance(X -> Y) / support(Y) |

### Pipeline de pretraitement NLP

```
Tags bruts --> minuscules --> supprimer accents --> supprimer mots vides
           --> supprimer IMG/DSC --> supprimer caracteres speciaux --> tags propres
```

### Reference rapide Python

```python noexec
# Apriori
from mlxtend.frequent_patterns import apriori
from mlxtend.preprocessing import TransactionEncoder

te = TransactionEncoder()
df = pd.DataFrame(te.fit(data).transform(data), columns=te.columns_)
freq = apriori(df, min_support=0.6, use_colnames=True)

# Regles d'association
from mlxtend.frequent_patterns import association_rules
rules = association_rules(freq, metric="confidence", min_threshold=0.7)
```

### Vocabulaire d'examen (Francais/Anglais)

| Francais | Anglais |
|----------|---------|
| Motif frequent | Frequent itemset |
| Support minimal | Minimum support |
| Regle d'association | Association rule |
| Confiance | Confidence |
| Anti-monotonie | Anti-monotonicity (downward closure) |
| Elagage | Pruning |
| Candidat | Candidate itemset |
| Mots vides | Stopwords |
| Pretraitement | Preprocessing |
