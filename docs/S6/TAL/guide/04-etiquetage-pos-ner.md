---
title: "Chapitre 4 -- Etiquetage POS et Algorithme de Viterbi"
sidebar_position: 4
---

# Chapitre 4 -- Etiquetage POS et Algorithme de Viterbi

## 4.1 Etiquetage morpho-syntaxique (POS Tagging)

L'etiquetage morpho-syntaxique consiste a assigner une categorie grammaticale a chaque token.

```
"Le   chat  mange  la   souris  noire"
 DET  NOUN  VERB   DET  NOUN    ADJ
```

### Categories grammaticales

| Classe | Type | Exemples |
|--------|------|----------|
| Ouverte (lexicale) | Nom, Verbe, Adjectif, Adverbe | chat, manger, noir, rapidement |
| Fermee (fonctionnelle) | Determinant, Pronom, Preposition, Conjonction | le, il, dans, et |

### Difficulte : ambiguite lexicale

- "book" : nom ("a book") ou verbe ("book a flight")
- "ferme" : nom, verbe, ou adjectif
- 85-86% des mots sont non ambigus, mais 55-67% des **tokens** sont ambigus

## 4.2 Modeles de Markov Caches (HMM)

### Intuition

Un HMM suppose que la phrase observee est **generee** par une sequence d'etats caches (les etiquettes POS).

```
  Etats caches     DET -----> NOUN -----> VERB -----> NOUN
  (etiquettes)      |          |           |           |
                    v          v           v           v
  Observations    "Le"       "chat"     "mange"     "souris"
  (mots)
```

### Deux hypotheses simplificatrices

1. **Hypothese de Markov** : P(t_i | t_1,...,t_{i-1}) = P(t_i | t_{i-1})
2. **Independance conditionnelle** : P(w_i | t_1,...,t_n, w_1,...) = P(w_i | t_i)

### Expression du modele

```
p(w, t) = p(t_1) * p(w_1|t_1) * PRODUIT_{i=2}^{n} p(t_i|t_{i-1}) * p(w_i|t_i)
```

### Parametres : lambda = (A, B, pi)

| Parametre | Notation | Signification |
|-----------|----------|---------------|
| **A** | a_{ij} = P(t_j \| t_i) | Matrice de transition entre etats |
| **B** | b_k(w) = P(w \| t_k) | Matrice d'emission (mot sachant etat) |
| **pi** | pi_i = P(t_1 = i) | Distribution initiale |

### Estimation des parametres (par comptage sur corpus annote)

```
P(t_j | t_i) = C(t_i, t_j) / C(t_i)    [transitions]
P(w | t)      = C(t, w) / C(t)          [emissions]
```

## 4.3 Algorithme de Viterbi -- ALGORITHME CLE

### Objectif

Trouver la sequence d'etiquettes la plus probable :
```
t_hat = argmax_t  p(w, t)
```

### Pourquoi pas l'enumeration ?

Pour n mots et |T| etiquettes, il y a |T|^n sequences possibles --> explosion exponentielle.

### Principe : Programmation dynamique

```
H(i, k) = meilleure probabilite pour etre dans l'etat i a la position k
```

**Initialisation** :
```
H(i, 1) = pi_i * b_i(w_1)    pour chaque etat i
```

**Recursion** :
```
H(i, k) = max_{j} [H(j, k-1) * a_{ji} * b_i(w_k)]
```

**Terminaison** :
```
meilleur etat final = argmax_i H(i, n)
```

**Backtracking** : remonter pour trouver la sequence complete.

**Complexite** : O(n * |T|^2) au lieu de O(|T|^n).

### Trace complete de Viterbi -- Exemple

**Donnees** :
- Phrase : "il mange" (2 mots)
- Etats : {N (nom), V (verbe), P (pronom)}
- pi : P(N)=0.3, P(V)=0.1, P(P)=0.6

Transitions A :
```
        N     V     P
  N   0.1   0.5   0.4
  V   0.6   0.1   0.3
  P   0.4   0.5   0.1
```

Emissions B :
```
        "il"    "mange"
  N     0.01    0.01
  V     0.01    0.80
  P     0.90    0.01
```

**Etape 1 : Initialisation (k=1, mot "il")**
```
H(N, 1) = pi(N) * b_N("il") = 0.3 * 0.01 = 0.003
H(V, 1) = pi(V) * b_V("il") = 0.1 * 0.01 = 0.001
H(P, 1) = pi(P) * b_P("il") = 0.6 * 0.90 = 0.540   <-- max
```

**Etape 2 : Recursion (k=2, mot "mange")**
```
H(N, 2) = max(
  H(N,1)*a_NN*b_N("mange") = 0.003 * 0.1 * 0.01 = 0.000003,
  H(V,1)*a_VN*b_N("mange") = 0.001 * 0.6 * 0.01 = 0.000006,
  H(P,1)*a_PN*b_N("mange") = 0.540 * 0.4 * 0.01 = 0.00216   <-- max via P
) = 0.00216

H(V, 2) = max(
  H(N,1)*a_NV*b_V("mange") = 0.003 * 0.5 * 0.80 = 0.0012,
  H(V,1)*a_VV*b_V("mange") = 0.001 * 0.1 * 0.80 = 0.00008,
  H(P,1)*a_PV*b_V("mange") = 0.540 * 0.5 * 0.80 = 0.216    <-- max via P
) = 0.216

H(P, 2) = max(
  H(N,1)*a_NP*b_P("mange") = 0.003 * 0.4 * 0.01 = 0.000012,
  H(V,1)*a_VP*b_P("mange") = 0.001 * 0.3 * 0.01 = 0.000003,
  H(P,1)*a_PP*b_P("mange") = 0.540 * 0.1 * 0.01 = 0.00054  <-- max via P
) = 0.00054
```

**Etape 3 : Terminaison**
```
max_i H(i, 2) = H(V, 2) = 0.216
```

**Backtracking** :
- Position 2 : V (via P a position 1)
- Position 1 : P

**Resultat** : "il" = P (pronom), "mange" = V (verbe)

## 4.4 CRF (Champs Aleatoires Conditionnels)

### Motivation

Les CRF resolvent les limitations des HMM en modelisant directement P(t|w) au lieu de P(w,t).

### Formulation

```
P(t | w) = (1/Z(w)) * exp(SUM_k lambda_k * f_k(t, w))
```

- Z(w) = fonction de partition (normalisation)
- lambda_k = poids appris
- f_k = fonctions de caracteristiques (binaires, arbitraires)

### Fonctions de caracteristiques (exemples)

| Fonction | Description |
|----------|-------------|
| delta(t_{s-1}=DET, t_s=NOUN) | Transition DET --> NOUN |
| delta(t_s=VERB, w_s="mange") | Mot "mange" avec etiquette VERB |
| delta(t_s=NP, w_s commence par majuscule) | Forme du mot |

### HMM vs CRF

| Critere | HMM | CRF |
|---------|-----|-----|
| Type | Generatif | Discriminant |
| Modelise | p(w,t) | p(t\|w) |
| Hypotheses | Markov + indep. conditionnelle | Aucune hypothese restrictive |
| Caracteristiques | Limitees (mot, transition) | Arbitraires (contexte, forme) |
| Lien | HMM est un cas particulier de CRF |

## 4.5 RNN pour l'etiquetage

### Architecture

```
  w1        w2        w3
  |         |         |
  [embed]   [embed]   [embed]
  |         |         |
  h1 -----> h2 -----> h3
  |         |         |
  softmax   softmax   softmax
  |         |         |
  y1_hat    y2_hat    y3_hat
```

### RNN bidirectionnel

Chaque mot a acces a son contexte **passe et futur** :
```
  -->  h1 --> h2 --> h3     (gauche-droite)
  <--  h'1 <-- h'2 <-- h'3  (droite-gauche)
  Representation de w2 = [h2 ; h'2]
```

### LSTM-CRF (etat de l'art)

Combine BiLSTM (predictions riches) + couche CRF (coherence entre etiquettes).

## 4.6 Comparaison des trois approches

| Critere | HMM | CRF | RNN |
|---------|-----|-----|-----|
| Type | Generatif | Discriminant | Discriminant |
| Hypotheses fortes | Oui | Non | Non |
| Dependances longues | Non | Partiellement | Oui |
| Caracteristiques manuelles | Non | Oui | Non (apprises) |
| Besoin de donnees | Faible | Moyen | Eleve |
| Interpretabilite | Bonne | Bonne | Faible |
| Performance POS | ~97% | ~97% | ~97%+ |

---

## CHEAT SHEET -- Etiquetage POS et Viterbi

```
HMM :
  p(w,t) = pi(t_1) * b(t_1,w_1) * PROD p(t_i|t_{i-1}) * p(w_i|t_i)
  Parametres : A (transitions), B (emissions), pi (init)
  Hypotheses : Markov + independance conditionnelle
  Type : GENERATIF (modelise p(w,t))

VITERBI :
  H(i,1) = pi_i * b_i(w_1)
  H(i,k) = max_j [H(j,k-1) * a_ji * b_i(w_k)]
  Complexite : O(n * |T|^2)
  Backtracking pour la sequence complete

CRF :
  P(t|w) = (1/Z(w)) * exp(SUM lambda_k * f_k(t,w))
  Type : DISCRIMINANT (modelise p(t|w))
  Pas d'hypothese restrictive
  Fonctions de caracteristiques arbitraires

COMPARAISON :
  HMM = generatif, hypotheses fortes, peu de donnees
  CRF = discriminant, caracteristiques manuelles, flexible
  RNN = discriminant, caracteristiques apprises, beaucoup de donnees
  LSTM-CRF = etat de l'art

PIEGES :
  - HMM modelise p(w,t), PAS p(t|w)
  - CRF modelise p(t|w) directement
  - Viterbi = programmation dynamique, PAS enumeration
  - HMM est un cas particulier de CRF
```
