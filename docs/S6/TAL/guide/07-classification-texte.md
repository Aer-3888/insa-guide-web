---
title: "Chapitre 7 -- Classification de Texte"
sidebar_position: 7
---

# Chapitre 7 -- Classification de Texte

## 7.1 Naive Bayes -- Algorithme central du cours

### Principe theorique

On veut classifier un document d dans une classe c. Par le theoreme de Bayes :

```
p(c|d) = p(d|c) * p(c) / p(d)
```

Comme p(d) est constant, on maximise :
```
c_hat = argmax_c  p(d|c) * p(c)
```

### Hypothese naive

Les mots sont **independants** conditionnellement a la classe :
```
p(d|c) = PRODUIT_{i=1}^{n} p(w_i | c)
```

### Estimation des probabilites

**A priori** (probabilite a priori de la classe) :
```
p(c) = nombre de docs de classe c / nombre total de docs
```

**Vraisemblance** (probabilite d'un mot dans une classe) :
```
p(w|c) = SUM_d n(w,d) / SUM_v SUM_d n(v,d)
```

## 7.2 Lissage de Laplace pour Naive Bayes -- TRES IMPORTANT

### Le probleme des zeros

Si un mot n'a jamais ete vu dans une classe, sa probabilite est 0, et tout le produit tombe a 0.

### La solution

```
p(w|c) = (n(w,c) + 1) / (N_c + |V|)
```

- n(w,c) = nombre d'occurrences de w dans les documents de classe c
- N_c = nombre total de mots dans la classe c (SUM de tous les comptages)
- |V| = taille du vocabulaire (nombre de mots distincts)

**PIEGE DS** : denominateur = N_c + |V|, PAS N_c + 1.

## 7.3 Exercice complet type DS -- Naive Bayes avec Laplace

### Donnees

| Classe | bien | super | fantastique | decevant | mauvais | nul |
|--------|------|-------|-------------|----------|---------|-----|
| positif | 4 | 2 | 1 | 2 | 0 | 0 |
| negatif | 1 | 3 | 0 | 3 | 4 | 7 |

**Calculs preliminaires** :
```
N_positif = 4+2+1+2+0+0 = 9
N_negatif = 1+3+0+3+4+7 = 18
|V| = 6 (6 mots distincts)
p(positif) = 0.5   (hypothese : classes equiprobables)
p(negatif) = 0.5
```

### Avec lissage de Laplace

```
p(bien|positif)         = (4 + 1) / (9 + 6)  = 5/15 = 1/3
p(bien|negatif)         = (1 + 1) / (18 + 6) = 2/24 = 1/12
p(super|positif)        = (2 + 1) / (9 + 6)  = 3/15 = 1/5
p(super|negatif)        = (3 + 1) / (18 + 6) = 4/24 = 1/6
p(fantastique|positif)  = (1 + 1) / (9 + 6)  = 2/15
p(fantastique|negatif)  = (0 + 1) / (18 + 6) = 1/24
p(decevant|positif)     = (2 + 1) / (9 + 6)  = 3/15 = 1/5
p(decevant|negatif)     = (3 + 1) / (18 + 6) = 4/24 = 1/6
p(mauvais|positif)      = (0 + 1) / (9 + 6)  = 1/15
p(mauvais|negatif)      = (4 + 1) / (18 + 6) = 5/24
p(nul|positif)          = (0 + 1) / (9 + 6)  = 1/15
p(nul|negatif)          = (7 + 1) / (18 + 6) = 8/24 = 1/3
```

### Classification du document "fantastique mais decevant"

On ignore "mais" (hors vocabulaire).

```
score(positif) = p(positif) * p(fantastique|positif) * p(decevant|positif)
               = 0.5 * 2/15 * 3/15
               = 0.5 * 6/225
               = 3/225
               = 0.01333

score(negatif) = p(negatif) * p(fantastique|negatif) * p(decevant|negatif)
               = 0.5 * 1/24 * 4/24
               = 0.5 * 4/576
               = 2/576
               = 0.00347
```

score(positif) = 0.01333 > score(negatif) = 0.00347

**Classification : POSITIF**

## 7.4 SVM pour la classification de texte

### Principe

Les SVM (Machines a Vecteurs de Support) trouvent l'hyperplan de separation optimale entre les classes dans l'espace des caracteristiques.

### Application au texte

- Chaque document est represente comme un vecteur TF-IDF
- Le SVM trouve l'hyperplan qui maximise la marge entre les classes
- Performant meme en haute dimension (vocabulaire large)

## 7.5 Analyse de sentiment

### Definition

Determiner la polarite d'un texte : positif, negatif, ou neutre.

### Approches

| Approche | Methode | Avantages |
|----------|---------|-----------|
| Lexiques | SentiWordNet, listes de mots | Simple, pas d'entrainement |
| Apprentissage | Naive Bayes, SVM, RNN | Performant, adaptatif |
| Deep Learning | LSTM, BERT | Etat de l'art |

## 7.6 Maximum d'entropie (Regression logistique)

Au lieu de modeliser p(d|c) puis Bayes, on modelise **directement** p(c|d) :

```
P[C = k | d] = exp(lambda_0^(k) + SUM_i lambda_i^(k) * x_i)
               / SUM_j exp(lambda_0^(j) + SUM_i lambda_i^(j) * x_i)
```

C'est une **regression logistique multinomiale** (softmax).

Avantage : pas d'hypothese d'independance entre les caracteristiques.

## 7.7 Loi de Zipf

> "Les evenements frequents sont rares et les evenements rares sont frequents"

```
rang(w) * freq(w) = constante
```

Consequence : enormement de mots n'apparaissent qu'une fois (hapax). Le lissage est donc **indispensable**.

---

## CHEAT SHEET -- Classification de Texte

```
NAIVE BAYES :
  c_hat = argmax_c  p(c) * PRODUIT p(w_i|c)
  Hypothese : mots independants donnee la classe

LISSAGE LAPLACE :
  p(w|c) = (n(w,c) + 1) / (N_c + |V|)
  n(w,c) = occurrences de w dans classe c
  N_c = total mots dans classe c
  |V| = taille vocabulaire
  PIEGE : denominateur = N_c + |V|, PAS N_c + 1

PROCEDURE COMPLETE :
  1. Calculer N_c pour chaque classe
  2. Calculer |V| (mots distincts dans tout le corpus)
  3. Pour chaque mot et classe : p(w|c) = (n(w,c)+1)/(N_c+|V|)
  4. p(c) = nb docs classe c / nb total docs
  5. score(c) = p(c) * PRODUIT p(w_i|c)
  6. Choisir la classe avec le score max

MOTS HORS VOCABULAIRE :
  Ignorer les mots non presents dans le vocabulaire d'entrainement

SVM : hyperplan de separation dans espace TF-IDF
  Bon en haute dimension

MAX ENTROPIE = regression logistique multinomiale
  Modelise directement p(c|d)

LOI DE ZIPF : rang * freq = constante
  Beaucoup d'hapax --> lissage indispensable

PIEGES :
  - Laplace : (count+1)/(total+|V|), PAS (count+1)/(total+1)
  - Naive Bayes : independance fausse en pratique, mais marche bien
  - Sans lissage, un seul zero annule tout le produit
```
