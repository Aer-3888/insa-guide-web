---
title: "Chapitre 2 -- Modeles de Langage"
sidebar_position: 2
---

# Chapitre 2 -- Modeles de Langage

## 2.1 Definition

Un modele de langage definit une distribution de probabilite sur les phrases d'un vocabulaire V.

```
P["Cette phrase est tres probable"]       --> probabilite ELEVEE
P["Phrase cette pas tres probable est"]   --> probabilite FAIBLE
```

Applications : identification de langue, reconnaissance vocale, traduction automatique, correction orthographique, prediction de texte, generation (GPT).

## 2.2 L'approximation n-gramme

### Le probleme

La probabilite d'une phrase se decompose par la regle de la chaine :
```
P["Jean aime Marie"] = P[Jean] * P[aime | Jean] * P[Marie | Jean aime]
```

P[w_i | w_1,...,w_{i-1}] est impossible a estimer pour un long historique.

### La solution

On ne garde que les **n-1 derniers mots** :
```
P[w_i | w_1,...,w_{i-1}]  ~=  P[w_i | w_{i-n+1},...,w_{i-1}]
```

| Nom | n | Historique | Formule |
|-----|---|-----------|---------|
| Unigramme | 1 | Rien | P[w_i] |
| **Bigramme** | 2 | 1 mot | P[w_i \| w_{i-1}] |
| **Trigramme** | 3 | 2 mots | P[w_i \| w_{i-2}, w_{i-1}] |

### Estimation par maximum de vraisemblance (ML)

```
P_ML[w | h] = C(h w) / C(h)
```

ou C(.) = nombre d'occurrences dans le corpus d'entrainement.

### Exemple concret -- Bigramme

Corpus : "le chat mange la souris le chat dort"

```
P(chat | le)   = C("le chat") / C("le") = 2 / 2 = 1.0
P(mange | chat) = C("chat mange") / C("chat") = 1 / 2 = 0.5
P(dort | chat)  = C("chat dort") / C("chat") = 1 / 2 = 0.5
```

## 2.3 Perplexite -- Mesure de qualite

### Formule

```
PP(q, w) = 2^{-1/n * SUM_{i=1}^{n} log2(q(w_i | historique))}
```

### Interpretation

- **Plus la perplexite est BASSE, meilleur est le modele**
- PP = 1 : prediction parfaite
- PP = |V| : pas mieux que le hasard
- Interprete comme le "nombre moyen de choix" pour predire le mot suivant
- TOUJOURS mesuree sur un corpus de TEST (pas d'entrainement)

### Exemple de calcul

Soit un bigramme et la phrase test "le chat mange" (3 mots, n=3).

```
PP = 2^{-1/3 * [log2(P(le|<s>)) + log2(P(chat|le)) + log2(P(mange|chat))]}

Si P(le|<s>) = 0.5, P(chat|le) = 1.0, P(mange|chat) = 0.5 :
PP = 2^{-1/3 * [log2(0.5) + log2(1.0) + log2(0.5)]}
   = 2^{-1/3 * [-1 + 0 + (-1)]}
   = 2^{-1/3 * (-2)}
   = 2^{2/3}
   = 1.587
```

## 2.4 Techniques de lissage (Smoothing)

### Pourquoi lisser ?

Enormement de n-grammes ont une probabilite estimee a 0 (loi de Zipf : les evenements rares sont frequents). Un seul zero annule tout le produit.

### Lissage de Laplace (Add-One)

```
P[w | h] = (C(hw) + 1) / (C(h) + |V|)
```

**PIEGE DS** : La formule est (count + 1) / (total + |V|), PAS (count + 1) / (total + 1).

**Laplace est-il adapte aux n-grammes ?** --> **NON**.
- Redistribue trop de masse vers les n-grammes non vus car |V|^n est enorme
- Quand on augmente la constante, le modele tend vers une distribution uniforme
- La perplexite AUGMENTE avec la constante de lissage (perte d'information)
- Preferer Kneser-Ney ou interpolation

### Lissage Dirichlet

```
P[w | h] = (C(hw) + lambda * P[w]) / (C(h) + lambda)
```

### Discounting absolu

```
P*[w | h] = max(C(hw) - delta, 0) / SUM_v C(hv)
```

### Kneser-Ney -- LE PLUS PERFORMANT

Raffinement du discounting absolu : redistribution utilise la diversite contextuelle des mots rares.

### Good-Turing

```
C*(hw) = (C(hw) + 1) * N_{C(hw)+1} / N_{C(hw)}
```
N_c = nombre de n-grammes apparaissant exactement c fois.

## 2.5 Interpolation et Back-off

### Interpolation lineaire

Combiner des n-grammes de differents ordres :
```
P_I[w | h_n] = lambda_0 * P_ML[w]
             + lambda_1 * P_ML[w | h_1]
             + ...
             + lambda_n * P_ML[w | h_n]

Contrainte : SUM lambda_i = 1
```

### Back-off

Utiliser l'estimation de plus haut ordre si fiable, sinon reculer :
```
P_bo[w | h_n] = | C*(h_n w) / C(h_n)           si C(h_n w) > 0
                | alpha(h_n) * P_bo[w | h_{n-1}] sinon
```

## 2.6 Modeles de langage neuronaux

### Modele Feed-Forward (Bengio, 2003)

```
w_{i-n+1},...,w_{i-1}  --> [embedding] --> [MLP + tanh] --> [softmax] --> P[w_i]
```

Premier modele neuronal pour le langage. Ameliore les n-grammes car les embeddings partagent de l'information entre mots similaires.

### Modele RNN

```
  w1        w2        w3
  |         |         |
  [embed]   [embed]   [embed]
  |         |         |
  h1 -----> h2 -----> h3
  |         |         |
  P(w2)    P(w3)     P(w4)
```

- Historique de longueur variable (pas limite a n-1 mots)
- h_t resume tout l'historique w_1,...,w_t
- Prediction : softmax(V * h_t) donne la distribution sur le mot suivant
- Entrainement **auto-supervise** : le texte sert de label

### Question type DS : Fonctionnement d'un RNN comme modele de langue

**Entrees** : embedding du mot courant x_t + etat cache precedent h_{t-1}
**Sortie** : nouvel etat cache h_t (resume de tout l'historique)
**Prediction** : softmax(V * h_t) donne P(w_{t+1})
**Apprentissage** : minimiser l'entropie croisee entre la prediction et le mot reel suivant

### Markov Models

Un modele de Markov d'ordre 1 est equivalent a un bigramme :
- L'etat courant ne depend que de l'etat precedent
- Chaque transition a une probabilite
- La matrice de transition A encode toutes les probabilites P(etat_i | etat_{i-1})

---

## CHEAT SHEET -- Modeles de Langage

```
N-GRAMME : P[w_i | w_{i-n+1},...,w_{i-1}]
  Bigramme : P[w|w_{i-1}], Trigramme : P[w|w_{i-2},w_{i-1}]

ESTIMATION ML : P[w|h] = C(hw) / C(h)

LISSAGE LAPLACE : P[w|h] = (C(hw) + 1) / (C(h) + |V|)
  PIEGE : denominateur = C(h) + |V|, PAS C(h) + 1
  INADAPTE pour n-grammes (redistribue trop de masse)

PERPLEXITE : PP = 2^{-1/n * SUM log2 P(w_i)}
  PLUS BASSE = MEILLEUR
  PP = 1 parfait, PP = |V| hasard
  Mesuree sur corpus de TEST

INTERPOLATION : P_I = SUM lambda_i * P_ML[w|h_i],  SUM lambda = 1

BACK-OFF : utiliser le plus haut ordre possible, sinon reculer

KNESER-NEY : meilleur lissage (diversite contextuelle)

RNN pour modele de langue :
  Entrees : x_t (embedding) + h_{t-1} (etat cache)
  Sortie : h_t = resume de l'historique
  Prediction : softmax(V * h_t) --> P(w_{t+1})
  Objectif : minimiser entropie croisee (auto-supervise)

PIEGES :
  - Perplexite elevee = bon --> FAUX (plus basse = meilleur)
  - Laplace adapte aux n-grammes --> FAUX
  - Bigramme a n=2 mais regarde 1 seul mot d'historique
  - RNN bidirectionnel pour GENERATION --> IMPOSSIBLE (pas de futur)
```
