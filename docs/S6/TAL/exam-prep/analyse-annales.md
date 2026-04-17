---
title: "Analyse des Annales TALEO (2016-2023)"
sidebar_position: 2
---

# Analyse des Annales TALEO (2016-2023)

## Vue d'ensemble

6 annees d'examen disponibles (2016, 2018, 2019, 2021, 2022, 2023), toutes avec le meme format : 1h, sans document, calculatrice autorisee, 4 pages, ~20 points.

## Themes recurrents par section

### Frequence d'apparition des themes

| Theme | 2016 | 2018 | 2019 | 2021 | 2022 | 2023 | Frequence |
|-------|------|------|------|------|------|------|-----------|
| Classification Naive Bayes/TF-IDF | x | x | x | x | x | x | 6/6 |
| Analyse syntaxique (arbres/PCFG) | x | x | x | x | x | x | 6/6 |
| Questions de cours (definitions) | x | x | x | x | x | x | 6/6 |
| Modeles de langue (RNN/perplexite) | | x | x | x | x | x | 5/6 |
| Recherche d'information | | x | | x | x | x | 4/6 |
| Etiquetage (HMM/Viterbi) | x | | x | | | | 2/6 |
| Embeddings (Word2Vec/GloVe) | | | x | | | x | 2/6 |

### Themes GARANTIS (present chaque annee)

1. **Calcul numerique** : TF-IDF ou Naive Bayes avec Laplace
2. **Analyse syntaxique** : arbre de constituants, PCFG, ou dependances
3. **Questions conceptuelles** : definitions et explications

### Themes TRES PROBABLES (4+ annees)

4. **Modeles de langue** : RNN, perplexite, lissage
5. **Recherche d'information** : modeles, evaluation, PageRank

## Analyse detaillee par annee

### DS 2023 (4 pages, 20 pts)

| Section | Points | Contenu |
|---------|--------|---------|
| 1. RI | 3 pts | Booleen vs vectoriel, produit scalaire vs cosinus |
| 2. Dependances | 2 pts | Trace transition-based (Shift/Left-Arc/Right-Arc) |
| 3. Questions cours | 4 pts | Lexeme/mot-forme, hypothese distributionnelle |
| 4. Classification | 7 pts | IDF, calcul TF-IDF, similarite cosinus, classification |
| 5. Modeles langue | 4 pts | RNN (y_t, L_t), evaluation perplexite |

**Observations 2023** :
- La section classification est la plus lourde (7 pts)
- Le parser transition-based demande une trace complete en tableau
- Les questions de cours sont courtes mais comptent 4 pts

### DS 2022

| Section | Contenu |
|---------|---------|
| Analyse syntaxique | PCFG, dessiner 2 arbres, calculer P(arbre), interet PCFG |
| Questions cours | Precision/rappel, nDCG, IDF, dependances, cosinus |
| Classification | Naive Bayes avec Laplace (calcul complet) |
| Modeles langue | Lissage Laplace adapte ?, RNN pour modele de langue |

### Constantes observees

- Le calcul Naive Bayes avec Laplace revient CHAQUE annee
- La question "Laplace adapte aux n-grammes ?" revient regulierement
- Les arbres de dependances ou constituants sont toujours demandes
- Le format 4 pages est stable

## Points-cles par type de question

### Calculs (assurer les points)

Ces questions ont des reponses objectives -- il faut les avoir justes :
- **TF-IDF** : tf = freq/total, idf = log(N/df), tfidf = tf*idf
- **Naive Bayes Laplace** : (count+1)/(total+|V|)
- **P(arbre PCFG)** : produit des P(regle)
- **Cosinus** : (a.b)/(||a||*||b||)
- **Perplexite** : 2^{-1/n * SUM log2 P}

### Questions de cours (definitions rapides)

Reponses attendues en 2-3 lignes maximum :
- **IDF** : log(|D|/df), poids eleve aux termes rares, nul pour les termes omnipresents
- **nDCG** : jugements gradues + discount log + normalisation IDCG
- **Lexeme** : ensemble des formes flechies d'un mot. Mot-forme = occurrence concrete
- **Hypothese distributionnelle** : mots dans contextes similaires ont sens proches
- **HMM vs CRF** : HMM generatif p(w,t), CRF discriminant p(t|w)

### Traces d'algorithmes (methodique)

- **Viterbi** : table H(etat, position), max sur les etats precedents, backtracking
- **CKY** : table triangulaire, remplir diagonale puis longueurs croissantes
- **Transition parser** : tableau etape/pile/buffer/action/dependance

## Questions qui reviennent le plus souvent

### TOP 5 des questions

1. **Calcul Naive Bayes avec Laplace** (6/6 annees)
   --> Maitriser la formule (count+1)/(total+|V|)

2. **Arbre syntaxique avec PCFG** (6/6 annees)
   --> Savoir dessiner l'arbre ET calculer sa probabilite

3. **Definition de l'IDF** (4/6 annees)
   --> log(N/df), penalise les mots frequents

4. **Modele de langue RNN** (4/6 annees)
   --> x_t + h_{t-1} --> h_t --> softmax --> P(w_{t+1})

5. **Laplace adapte aux n-grammes ?** (3/6 annees)
   --> Non, redistribue trop, preferer Kneser-Ney

## Repartition des points

D'apres les annales, la repartition typique est :

```
Classification / TF-IDF :  7 pts (35%)  <-- priorite 1
Questions de cours :        4 pts (20%)  <-- priorite 2
Modeles de langue :         4 pts (20%)  <-- priorite 3
Analyse syntaxique :        3 pts (15%)  <-- priorite 4
RI / Evaluation :           2 pts (10%)  <-- priorite 5
```

**Conclusion** : maitriser les calculs Naive Bayes/TF-IDF rapporte le plus de points.
