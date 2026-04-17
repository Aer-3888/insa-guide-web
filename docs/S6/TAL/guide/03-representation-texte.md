---
title: "Chapitre 3 -- Representation du Texte"
sidebar_position: 3
---

# Chapitre 3 -- Representation du Texte

## 3.1 Bag of Words (Sac de Mots)

### Principe

> L'ordre des mots n'a pas d'importance : seuls comptent les mots presents et leurs frequences.

```
Document : "Le chat mange la souris"
Sac de mots = { le:1, chat:1, mange:1, la:1, souris:1 }

"La souris mange le chat" --> meme sac de mots ! (mais sens different)
```

### Construction

1. Tokenisation et normalisation
2. Lemmatisation ou stemming (optionnel)
3. Suppression des mots vides
4. Attribution des poids (binaire, frequence, TF-IDF)

### Methodes de ponderation

| Methode | Formule | Cas d'usage |
|---------|---------|-------------|
| Binaire | 1 si w dans d, 0 sinon | Presence/absence |
| Frequence brute | n(w,d) | Importance locale |
| Frequence relative | n(w,d) / SUM_v n(v,d) | Normalise par longueur |
| **TF-IDF** | tf(w,d) * idf(w) | **Standard en RI** |

## 3.2 TF-IDF

### Idee intuitive

Un mot est important s'il apparait **souvent dans le document** (TF haut) mais est **rare dans la collection** (IDF haut).

```
Mot "le"      : TF eleve, IDF ~= 0  --> TF-IDF ~= 0  (non informatif)
Mot "syntaxe" : TF moyen, IDF eleve --> TF-IDF eleve  (discriminant)
```

### Formules

**TF (Term Frequency)** :
```
tf(w, d) = n(w, d) / SUM_{v} n(v, d)
```

**IDF (Inverse Document Frequency)** :
```
idf(w) = log(|D| / df(w))
```
df(w) = nombre de documents contenant w, |D| = taille de la collection.

**TF-IDF** :
```
tfidf(w, d) = tf(w, d) * idf(w)
```

### Exemple concret de calcul IDF

4 documents, vocabulaire = {aimer, manger, Paul, Virginie, je}

| Mot | df (docs contenant le mot) | IDF = log10(4/df) |
|-----|---------------------------|-------------------|
| aimer | 3 | log(4/3) = 0.125 |
| manger | 2 | log(4/2) = 0.301 |
| Paul | 1 | log(4/1) = 0.602 |
| Virginie | 2 | log(4/2) = 0.301 |
| je | 4 | log(4/4) = 0 |

**Observations** :
- "je" a IDF = 0 car present dans TOUS les documents (non discriminant)
- "Paul" a le plus fort IDF car present dans 1 seul document

### Exemple complet type DS (2023)

Corpus de 200 documents, 4 termes :

| terme | w1 | w2 | w3 | w4 |
|-------|----|----|----|----|
| n_t (docs contenant) | 75 | 2 | 10 | 20 |

IDF (base 10) :
```
idf(w1) = log10(200/75)  = log10(2.667)  = 0.426
idf(w2) = log10(200/2)   = log10(100)    = 2.000
idf(w3) = log10(200/10)  = log10(20)     = 1.301
idf(w4) = log10(200/20)  = log10(10)     = 1.000
```

Document d avec 20 tokens : 4 occurrences de w1, 1 de w2, 0 de w3, 3 de w4.

TF (probabilite d'occurrence) :
```
tf(w1, d) = 4/20  = 0.20
tf(w2, d) = 1/20  = 0.05
tf(w3, d) = 0/20  = 0.00
tf(w4, d) = 3/20  = 0.15
```

TF-IDF :
```
tfidf(w1, d) = 0.20 * 0.426 = 0.085
tfidf(w2, d) = 0.05 * 2.000 = 0.100
tfidf(w3, d) = 0.00 * 1.301 = 0.000
tfidf(w4, d) = 0.15 * 1.000 = 0.150
```

Vecteur TF-IDF de d = (0.085, 0.100, 0.000, 0.150)

## 3.3 Word Embeddings : Word2Vec

### Le concept

Au lieu d'examiner les co-occurrences explicitement, on apprend directement les vecteurs en entrainant un reseau de neurones simple.

### Deux variantes

```
CBOW                              Skip-gram
(Continuous Bag of Words)         (le plus utilise)

Contexte --> Mot central          Mot central --> Contexte

le [___] mange la souris          le chat [___] la souris
     |                                 |
  Predit "chat"                   Predit "le", "mange", "la", "souris"
```

| Variante | Entree | Sortie | Forces |
|----------|--------|--------|--------|
| **CBOW** | Mots du contexte | Mot central | Rapide, bon sur petits corpus |
| **Skip-gram** | Mot central | Mots du contexte | Precis, bon sur grands corpus |

### Objectif Skip-gram

```
J(theta) = SUM_t SUM_{j in [-m,m], j!=0} ln p(w_{t+j} | w_t)

p(o|c) = exp(u'_o . v_c) / SUM_{w in V} exp(u'_w . v_c)
```

Echantillonnage negatif pour eviter le softmax couteux sur tout V.

### Proprietes remarquables

```
vec("roi") - vec("homme") + vec("femme") ~= vec("reine")
vec("Paris") - vec("France") + vec("Allemagne") ~= vec("Berlin")
```

## 3.4 GloVe (Global Vectors)

Combine les avantages des approches locales (Word2Vec) et globales (matrice de co-occurrence).

```
J(theta) = 1/2 SUM_{i,j} f(P_ij) * (u'_i . v_j - ln P_ij)^2
```

| Critere | Word2Vec | GloVe |
|---------|----------|-------|
| Type | Predictif (local) | Comptage (global) |
| Donnees | Fenetre locale | Matrice globale |
| Corpus minimal | Grand | Plus petit suffit |

## 3.5 FastText et tokenisation sous-mot

### FastText

Decompose chaque mot en n-grammes de caracteres (n = 3 a 6).

```
"where" --> {<wh, whe, her, ere, re>, <where>}
Embedding("where") = SUM des embeddings de ses n-grammes
```

**Avantage majeur** : gere les mots inconnus (noms propres, neologismes, fautes).

### BPE (Byte Pair Encoding) -- utilise dans GPT

Algorithme :
1. Decomposer tous les mots en lettres individuelles
2. Compter les paires adjacentes les plus frequentes
3. Fusionner la paire la plus frequente
4. Repeter jusqu'a taille de vocabulaire voulue

Exemple :
```
Depart : ("h" "u" "g", 10), ("p" "u" "g", 5), ("p" "u" "n", 12), ("b" "u" "n", 4)
Etape 1 : paire "u"+"g" freq=15 --> fusion "ug"
Etape 2 : paire "u"+"n" freq=16 --> fusion "un"
Etape 3 : paire "h"+"ug" freq=10 --> fusion "hug"
```

### WordPiece -- utilise dans BERT

Similaire a BPE, prefixe `##` pour continuations.
```
"Using a Transformer network" --> ['Using', 'a', 'transform', '##er', 'network']
```

## 3.6 Similarite cosinus

Mesure standard entre vecteurs (embeddings ou TF-IDF) :

```
cos(x, y) = (x . y) / (||x|| * ||y||)
```

- cos = 1 : vecteurs identiques
- cos = 0 : vecteurs orthogonaux
- cos = -1 : vecteurs opposes
- Invariante a la norme des vecteurs (contrairement a la distance euclidienne)

## 3.7 Similarite WordNet : Wu-Palmer

```
Wu_Palmer(c1, c2) = 2 * depth(LCS(c1, c2)) / (depth(c1) + depth(c2))
```

LCS = Lowest Common Subsumer (ancetre commun le plus bas dans la hierarchie WordNet).

## 3.8 Embeddings de documents

### Moyenne des embeddings de mots

```
vec(document) = (1/n) * SUM embedding(w_i)
```

Simple mais perd l'ordre. Les mots frequents dominent.

### RNN pour documents

L'etat cache final h_n apres avoir lu tous les mots represente le document.

### LSTM vs GRU

| Modele | Portes | Complexite |
|--------|--------|-----------|
| LSTM | 3 : entree (i), oubli (f), sortie (o) | Plus complexe |
| GRU | 2 : mise a jour (z), reset (r) | Plus simple |

---

## CHEAT SHEET -- Representation du Texte

```
TF-IDF :
  tf(w,d) = n(w,d) / SUM n(v,d)
  idf(w) = log(|D| / df(w))
  tfidf = tf * idf
  IDF = 0 si mot dans TOUS les documents

SIMILARITE COSINUS :
  cos(x,y) = (x.y) / (||x|| * ||y||)
  Standard pour comparer embeddings et docs TF-IDF

WU-PALMER :
  sim(c1,c2) = 2 * depth(LCS) / (depth(c1) + depth(c2))

WORD2VEC :
  CBOW : contexte --> mot central (rapide)
  Skip-gram : mot central --> contexte (precis)
  p(o|c) = exp(u'_o . v_c) / SUM exp(u'_w . v_c)
  Echantillonnage negatif pour efficacite

GLOVE : combine co-occurrences globales et locales

FASTTEXT : n-grammes de caracteres --> gere mots inconnus
BPE : fusion iterative des paires frequentes (GPT)
WORDPIECE : variante BPE pour BERT (prefixe ##)

LSTM : 3 portes (entree, oubli, sortie)
GRU : 2 portes (mise a jour, reset)

PIEGES :
  - CBOW predit le mot CENTRAL (pas le contexte)
  - Skip-gram predit le CONTEXTE (pas le mot central)
  - Cosinus, pas euclidienne, pour les embeddings
  - IDF = 0 pour un mot present dans TOUS les docs
  - Laplace : (count+1)/(total+|V|), PAS (count+1)/(total+1)
```
