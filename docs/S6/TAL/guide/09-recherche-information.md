---
title: "Chapitre 9 -- Recherche d'Information (RI)"
sidebar_position: 9
---

# Chapitre 9 -- Recherche d'Information (RI)

## 9.1 Definition

> "Trouver des documents de nature non structuree qui satisfont un besoin d'information au sein de grandes collections." -- Manning

```
Utilisateur --> requete --> Systeme de RI --> resultats classes
                                |
                          Collection de documents
```

## 9.2 Indexation

### Index inverse

Au lieu de stocker les termes par document, on stocke les documents par terme :

```
Index direct :                    Index inverse :
doc1 -> {chat, mange, souris}    chat -> {doc1, doc4}
doc2 -> {chien, dort}            mange -> {doc1, doc3}
doc3 -> {souris, mange}          souris -> {doc1, doc3}
```

Acces direct aux documents pertinents sans parcourir toute la collection.

### Ponderation generale des termes

```
w_{d,i} = l_i * g_i * n_i
```
- l_i : ponderation locale (frequence dans le document)
- g_i : ponderation globale (rarete dans la collection = IDF)
- n_i : normalisation (taille du document)

## 9.3 Modeles de RI

### Modele Booleen

Requete = formule logique, document = ensemble de termes.

```
q = t1 AND t2  --> intersection
q = t1 OR t2   --> union
q = NOT t1     --> complement
```

| Avantages | Inconvenients |
|-----------|--------------|
| Simple | Pas de classement |
| Correspondance exacte | Requetes difficiles a formuler |

### Modele Vectoriel (VSM)

Documents et requetes sont des vecteurs dans le meme espace. Comparaison par similarite cosinus.

```
cos(D, Q) = (D . Q) / (||D|| * ||Q||)
```

### Question type DS (2023) : Booleen vs Vectoriel

**Q** : Un moteur booleen donne-t-il necessairement le meme score aux 2 documents d1 et d2 pour une requete d'un seul mot "bonjour" ?
**R** : Oui, car les deux documents contiennent le mot "bonjour" donc les deux sont retournes avec le meme statut (pertinent/non-pertinent). Le modele booleen ne fait pas de classement.

**Q** : Un moteur vectoriel avec produit scalaire et representation binaire ?
**R** : Non necessairement. Meme si les deux documents contiennent "bonjour", leurs vecteurs contiennent d'autres termes. Le produit scalaire depend de TOUS les termes communs avec la requete, et la normalisation par cosinus tient compte de la longueur du document.

### BM25 (Okapi)

```
BM25(q, d) = SUM_{t in q} idf(t) * [tf(t,d) * (k1+1)] / [tf(t,d) + k1*(1-b+b*|d|/avgdl)]
```

Parametres : k1=1.2, b=0.75, k3=1000.

C'est la **baseline standard** en RI, encore difficile a battre meme par le deep learning.

## 9.4 Mesures d'evaluation

### Resultats non classes

**Precision** :
```
P = |pertinents recuperes| / |recuperes|
```

**Rappel** :
```
R = |pertinents recuperes| / |pertinents totaux|
```

**F1** :
```
F1 = 2 * P * R / (P + R)
```

### Resultats classes (ranked)

**P@k** : precision sur les k premiers resultats.

**MAP (Mean Average Precision)** :
```
AveP(q) = moyenne des precisions aux rangs des documents pertinents
MAP = moyenne des AveP sur toutes les requetes
```

**nDCG (Normalized Discounted Cumulative Gain)** :
```
DCG(k) = SUM_{i=1}^{k} (2^{rel(i)} - 1) / log2(i + 1)
nDCG(k) = DCG(k) / IDCG(k)
```

### Particularite du nDCG (question classique DS)

- Utilise des jugements de pertinence **gradues** (pas seulement 0/1)
- Penalise les documents pertinents mal classes (discount logarithmique)
- Normalise par le classement ideal (IDCG)

## 9.5 Expansion de requetes

### Rocchio (1971)

```
q1 = alpha * q0 + beta * (1/|Dr|) * SUM_{d in Dr} d - gamma * (1/|Dnr|) * SUM_{d in Dnr} d
```

- Dr = documents pertinents, Dnr = non pertinents
- alpha=1, beta=0.75, gamma=0.15 (valeurs typiques)
- Deplace le vecteur requete vers les documents pertinents

### Pseudo Retour de Pertinence

On considere les k premiers documents comme pertinents (sans retour utilisateur).

## 9.6 PageRank

### Idee

Un surfeur aleatoire clique sur des liens au hasard. Les pages les plus visitees sont les plus "importantes".

### Formule

```
PR(u) = (1-d)/N + d * SUM_{v in B_u} PR(v) / L(v)
```

- B_u = pages pointant vers u
- L(v) = liens sortants de v
- d = facteur d'amortissement (~0.85)
- N = nombre total de pages
- Teleportation (1-d) : evite les culs-de-sac

## 9.7 Learning to Rank (L2R)

| Approche | Entree | Methode | Limite |
|----------|--------|---------|--------|
| **Pointwise** | Paire (q,d) | Score par document | Ignore l'ordre relatif |
| **Pairwise** | Paire (d1,d2) | d1 meilleur que d2 ? | Pas de position absolue |
| **Listwise** | Liste complete | Optimise MAP/nDCG | Complexe |

## 9.8 RI et Deep Learning

### Modeles bases representation (siamois)

Requete et document representes **independamment**, compares par cosinus.
- Avantage : representations de documents calculables offline
- Exemple : DSSM

### Modeles bases interaction

Matrice de similarite entre termes de q et d.
- Exemple : DRMM (premier a battre BM25)

### MonoBERT

```
Entree : [CLS] requete [SEP] document [SEP]
         --> BERT --> [CLS] --> score de pertinence
```

Tres performant mais couteux. Applique en re-classement sur top-1000 de BM25.

---

## CHEAT SHEET -- Recherche d'Information

```
TF-IDF : tf(w,d) * log(|D|/df(w))
  IDF = 0 si mot dans tous les docs

MODELES DE RI :
  Booleen : AND/OR/NOT, pas de classement
  Vectoriel : cosinus, classement par score
  BM25 : baseline standard, parametres k1=1.2, b=0.75

EVALUATION :
  Precision = pertinents parmi recuperes
  Rappel = recuperes parmi pertinents
  F1 = 2PR/(P+R)
  MAP = moyenne des precisions aux rangs pertinents
  nDCG = jugements GRADUES + discount log + normalisation IDCG

PAGERANK :
  PR(u) = (1-d)/N + d * SUM PR(v)/L(v)
  d ~= 0.85, teleportation evite les impasses

ROCCHIO :
  q1 = alpha*q0 + beta*moyenne(Dr) - gamma*moyenne(Dnr)

L2R : Pointwise < Pairwise < Listwise

DEEP LEARNING RI :
  DSSM (siamois), DRMM (interaction), MonoBERT (re-ranking)

PIEGES :
  - nDCG utilise jugements GRADUES (pas binaires comme MAP)
  - BM25 n'est PAS obsolete (baseline tres solide)
  - MonoBERT en re-classement seulement (pas sur toute la collection)
  - Precision et Rappel : ne pas confondre numerateur/denominateur
  - IDF eleve = mot RARE (discriminant), pas frequent
```
