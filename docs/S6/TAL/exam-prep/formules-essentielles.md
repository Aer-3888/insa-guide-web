---
title: "Formules Essentielles TALEO -- A Memoriser"
sidebar_position: 3
---

# Formules Essentielles TALEO -- A Memoriser

> Fiche recapitulative de TOUTES les formules necessaires pour le DS.
> 1h, sans document, calculatrice autorisee.

---

## 1. REPRESENTATION DES MOTS

### Similarite cosinus
```
cos(x, y) = (x . y) / (||x|| * ||y||)
```

### Wu-Palmer (similarite WordNet)
```
sim(c1, c2) = 2 * depth(LCS) / (depth(c1) + depth(c2))
```

### Word2Vec Skip-gram
```
J = SUM_t SUM_j log p(w_{t+j} | w_t)
p(o|c) = exp(u'_o . v_c) / SUM_w exp(u'_w . v_c)
```

---

## 2. REPRESENTATION DES DOCUMENTS

### TF-IDF
```
tf(w, d) = n(w, d) / SUM_v n(v, d)
idf(w) = log(|D| / df(w))
tfidf(w, d) = tf(w, d) * idf(w)
```

### Naive Bayes
```
c_hat = argmax_c  p(c) * PRODUIT p(w_i | c)
```

### Lissage de Laplace
```
p(w|c) = (n(w,c) + 1) / (N_c + |V|)

n(w,c) = occurrences de w dans classe c
N_c = total mots dans classe c
|V| = taille vocabulaire
```

---

## 3. RECHERCHE D'INFORMATION

### Precision, Rappel, F1
```
P = |pertinents recuperes| / |recuperes|
R = |pertinents recuperes| / |pertinents totaux|
F1 = 2 * P * R / (P + R)
```

### BM25
```
BM25(q,d) = SUM idf(t) * [tf(t,d)*(k1+1)] / [tf(t,d) + k1*(1-b+b*|d|/avgdl)]
k1 = 1.2, b = 0.75
```

### PageRank
```
PR(u) = (1-d)/N + d * SUM_{v in B_u} PR(v) / L(v)
d ~= 0.85
```

### nDCG
```
DCG(k) = SUM_{i=1}^{k} (2^{rel(i)} - 1) / log2(i + 1)
nDCG(k) = DCG(k) / IDCG(k)
```

### Rocchio
```
q1 = alpha*q0 + beta*(1/|Dr|)*SUM d - gamma*(1/|Dnr|)*SUM d
```

---

## 4. MODELES DE LANGAGE

### N-gramme
```
P[w_i | w_{i-n+1},...,w_{i-1}]
Bigramme : P[w | w_{i-1}]
Trigramme : P[w | w_{i-2}, w_{i-1}]
```

### Estimation ML
```
P[w|h] = C(hw) / C(h)
```

### Lissage Laplace
```
P[w|h] = (C(hw) + 1) / (C(h) + |V|)
```

### Perplexite
```
PP = 2^{-1/n * SUM_{i=1}^{n} log2 P(w_i | contexte)}
PLUS BASSE = MEILLEUR
```

### Interpolation
```
P_I = lambda_0*P_uni + lambda_1*P_bi + lambda_2*P_tri
SUM lambda_i = 1
```

---

## 5. ETIQUETAGE DE SEQUENCES

### HMM
```
p(w,t) = p(t_1) * p(w_1|t_1) * PRODUIT p(t_i|t_{i-1}) * p(w_i|t_i)
Parametres : A (transitions), B (emissions), pi (init)
```

### Viterbi
```
H(i, 1) = pi_i * b_i(w_1)
H(i, k) = max_j [H(j, k-1) * a_{ji} * b_i(w_k)]
Complexite : O(n * |T|^2)
```

### CRF
```
P(t|w) = (1/Z(w)) * exp(SUM lambda_k * f_k(t, w))
```

---

## 6. ANALYSE SYNTAXIQUE

### PCFG
```
P(arbre) = PRODUIT P(regle_i)
Pour chaque X : SUM P(X --> gamma) = 1
```

### CKY
```
Complexite : O(n^3 * |R|^2)
Necessite CNF : A --> B C  ou  A --> a
```

### UAS / LAS
```
UAS = arcs avec tete correcte / total arcs
LAS = arcs avec tete + label corrects / total arcs
UAS >= LAS
```

### Transition-based parser
```
Shift : buffer --> pile
Left-Arc : arc sommet --> second, retirer second
Right-Arc : arc second --> sommet, retirer sommet
```

---

## 7. SYSTEME BIO (NER)
```
B = Beginning (debut d'entite)
I = Inside (interieur)
O = Outside (hors entite)
n types --> 2n + 1 etiquettes
```

---

## AIDE-MEMOIRE SIGLES

| Sigle | Signification |
|-------|---------------|
| TAL/NLP | Traitement Automatique des Langues |
| RI/IR | Recherche d'Information |
| BoW | Bag of Words |
| TF-IDF | Term Frequency - Inverse Document Frequency |
| HMM | Hidden Markov Model |
| CRF | Conditional Random Field |
| RNN | Recurrent Neural Network |
| LSTM | Long Short-Term Memory |
| GRU | Gated Recurrent Unit |
| CFG | Context-Free Grammar |
| PCFG | Probabilistic CFG |
| CKY | Cocke-Kasami-Younger |
| CNF | Chomsky Normal Form |
| POS | Part of Speech |
| NER | Named Entity Recognition |
| BIO | Begin-Inside-Outside |
| UAS | Unlabeled Attachment Score |
| LAS | Labeled Attachment Score |
| MAP | Mean Average Precision |
| nDCG | Normalized Discounted Cumulative Gain |
| BM25 | Best Matching 25 |
| BPE | Byte Pair Encoding |
| PP | Perplexite |

---

## PIEGES FREQUENTS -- CHECK-LIST FINALE

| Piege | Correction |
|-------|-----------|
| Perplexite elevee = bon | **FAUX** : plus basse = meilleur |
| Laplace pour n-grammes | **INADAPTE** : redistribue trop |
| CBOW predit le contexte | **FAUX** : CBOW predit le mot central |
| HMM modelise p(t\|w) | **FAUX** : HMM fait p(w,t), CRF fait p(t\|w) |
| IDF eleve = mot frequent | **FAUX** : IDF eleve = mot rare |
| nDCG = jugements binaires | **FAUX** : nDCG = jugements gradues |
| CKY sur toute CFG | **FAUX** : necessite CNF |
| P(arbre) = somme | **FAUX** : c'est le PRODUIT |
| Laplace : (c+1)/(N+1) | **FAUX** : c'est (c+1)/(N+\|V\|) |
