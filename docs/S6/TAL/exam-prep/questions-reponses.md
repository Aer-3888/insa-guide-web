---
title: "Questions Types et Reponses Modeles"
sidebar_position: 4
---

# Questions Types et Reponses Modeles

> Questions les plus frequentes dans les DS TALEO 2016-2023,
> avec des reponses calibrees pour le format de l'examen (concis mais complet).

---

## SECTION 1 : Definitions et concepts

### Q : Qu'est-ce que l'IDF et a quoi sert-il ?

**R** : IDF = Inverse Document Frequency = log(|D| / df(w)). Il donne un poids eleve aux termes rares dans la collection et faible aux termes frequents partout (mots vides). Un mot present dans tous les documents a un IDF de 0 (non discriminant). Utilise dans TF-IDF pour ponderer les termes d'indexation.

### Q : Particularite du nDCG ?

**R** : Le nDCG utilise des jugements de pertinence **gradues** (pas seulement binaires comme MAP). Il penalise les documents pertinents mal classes grace a un discount logarithmique (1/log2(i+1)), et normalise par le classement ideal (IDCG) pour que nDCG soit dans [0,1].

### Q : Qu'est-ce qu'un lexeme et qu'est-ce qu'un mot-forme ?

**R** : Un **lexeme** est une unite abstraite regroupant toutes les formes flechies d'un meme mot. Exemples : le lexeme MANGER = {mange, manges, mangeons, mangeaient, mangera...}. Un **mot-forme** est une occurrence concrete d'un signe linguistique dans un texte. "mangeaient" est un mot-forme du lexeme MANGER.

### Q : Quelle est l'hypothese sous-jacente des embeddings (Word2Vec, GloVe) ?

**R** : L'hypothese distributionnelle : les mots qui apparaissent dans des contextes similaires ont des sens proches ("You shall know a word by the company it keeps" -- Firth, 1957). Word2Vec apprend des vecteurs tels que les mots avec des contextes similaires ont des representations proches dans l'espace vectoriel. On peut apprendre des embeddings sans cette hypothese avec des reseaux bout-en-bout (la couche d'embedding est un parametre appris dans le reseau pour la tache cible).

### Q : Quelle distance utiliser pour comparer des embeddings ?

**R** : La **similarite cosinus** : cos(x,y) = (x.y) / (||x|| * ||y||). Invariante a la norme des vecteurs. Vaut 1 pour des vecteurs identiques, 0 pour orthogonaux, -1 pour opposes.

### Q : Difference entre HMM et CRF ?

**R** : HMM = modele **generatif**, modelise p(w,t) = p(t) * p(w|t) avec des hypotheses fortes (Markov + independance conditionnelle). CRF = modele **discriminant**, modelise directement p(t|w) = (1/Z) * exp(SUM lambda*f) sans hypotheses restrictives, permettant des fonctions de caracteristiques arbitraires (contexte, forme du mot, etc.).

### Q : Fonctionnement d'un RNN comme modele de langue ?

**R** :
- **Entrees** : embedding du mot courant x_t + etat cache precedent h_{t-1}
- **Sortie** : nouvel etat cache h_t (resume de tout l'historique)
- **Prediction** : softmax(V * h_t) donne la distribution P(w_{t+1})
- **Apprentissage** : minimiser l'entropie croisee entre la prediction et le mot reel suivant (auto-supervise : le texte sert de label)

### Q : La technique de Laplace est-elle adaptee aux n-grammes ?

**R** : **Non**. Laplace redistribue trop de masse probabiliste vers les n-grammes non observes car |V|^n est enorme. Quand on augmente la constante de lissage, le modele tend vers une distribution uniforme, et la perplexite augmente (perte d'information). Des techniques comme Kneser-Ney ou l'interpolation sont bien plus adaptees.

### Q : Interet des PCFG par rapport aux CFG ?

**R** : Les probabilites permettent de **desambiguiser** les phrases ayant plusieurs arbres d'analyse valides en choisissant l'arbre le plus probable (P(arbre) = produit des P(regle)). Sans probabilites, une CFG ne peut pas choisir entre plusieurs derivations correctes.

---

## SECTION 2 : Calculs a maitriser

### Q : Calculer le TF-IDF

**Methode** :
```
1. tf(w, d) = occurrences de w dans d / total mots dans d
2. idf(w) = log(N / df(w))  [N = nb docs, df = nb docs contenant w]
3. tfidf(w, d) = tf * idf
```

### Q : Classifier avec Naive Bayes + Laplace

**Methode** :
```
1. N_c = total mots dans classe c
2. |V| = taille vocabulaire global
3. p(w|c) = (n(w,c) + 1) / (N_c + |V|)
4. p(c) = nb docs classe c / total docs
5. score(c) = p(c) * PRODUIT p(w_i|c)
6. Classe = argmax score(c)
```

### Q : Calculer P(arbre) avec PCFG

**Methode** :
```
1. Lister toutes les regles utilisees dans l'arbre
2. P(arbre) = PRODUIT de toutes les P(regle_i)
3. Inclure les regles lexicales (Det --> "le", N --> "chat", etc.)
```

### Q : Calculer la perplexite

**Methode** :
```
1. Calculer P(w_i | contexte) pour chaque mot de test
2. PP = 2^{-1/n * SUM log2(P(w_i))}
3. n = nombre de mots de test
4. PLUS BASSE = MEILLEUR
```

---

## SECTION 3 : Vrai/Faux frequents

| Enonce | Reponse | Explication |
|--------|---------|-------------|
| Perplexite elevee = bon modele | **FAUX** | Plus basse = meilleur |
| Lissage Laplace adapte aux n-grammes | **FAUX** | Redistribue trop de masse |
| CBOW predit le contexte | **FAUX** | CBOW predit le mot central |
| HMM modelise p(t\|w) | **FAUX** | HMM modelise p(w,t), CRF fait p(t\|w) |
| IDF eleve = mot frequent | **FAUX** | IDF eleve = mot rare |
| nDCG = jugements binaires | **FAUX** | nDCG = jugements gradues |
| UAS >= LAS toujours | **VRAI** | LAS plus strict (tete + label) |
| CKY sur toute CFG | **FAUX** | Necessite la CNF |
| P(arbre PCFG) = somme | **FAUX** | C'est le PRODUIT |
| Laplace : (c+1)/(N+1) | **FAUX** | C'est (c+1)/(N+\|V\|) |
| Grammaire reguliere = Type 3 | **VRAI** | Plus faible de Chomsky |
| RNN bidirectionnel pour generation | **FAUX** | Pas de futur pour generer |

---

## SECTION 4 : Analyse syntaxique

### Q : Dessiner l'analyse en dependances de "Paul regarde le chien noir"

```
regarde --nsubj--> Paul
regarde --obj----> chien
chien   --det----> le
chien   --amod---> noir
```

### Q : Qu'est-ce que la forme normale de Chomsky ?

**R** : Forme ou chaque regle de la grammaire est soit :
- A --> B C (exactement deux non-terminaux)
- A --> a (exactement un terminal)

Necessaire pour appliquer l'algorithme CKY. Toute CFG peut etre convertie en CNF par binarisation, elimination des epsilon et des productions unitaires.

### Q : Qu'est-ce que UAS et LAS ?

**R** :
- UAS (Unlabeled Attachment Score) : proportion d'arcs dont la tete est correcte (sans verifier le label)
- LAS (Labeled Attachment Score) : proportion d'arcs dont la tete ET le label sont corrects
- UAS >= LAS toujours (LAS est plus strict)
