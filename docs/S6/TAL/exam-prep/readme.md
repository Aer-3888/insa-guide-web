---
title: "Preparation au DS TALEO"
sidebar_position: 0
---

# Preparation au DS TALEO

> DS : 1 heure, sans document, calculatrice autorisee
> 4 pages, questions independantes, ~20 points

## Structure du DS (basee sur annales 2016-2023)

L'examen suit un schema tres stable d'annee en annee. Voici la repartition typique :

### Section 1 : Recherche d'Information (2-3 pts)
- Modele booleen vs vectoriel
- Produit scalaire vs cosinus
- Role de l'IDF
- Calcul de similarite

### Section 2 : Analyse syntaxique (2-4 pts)
- Trace d'un parser transition-based (Shift/Left-Arc/Right-Arc)
- Dessin d'arbre de dependances
- Construction d'arbres de constituants avec PCFG
- Calcul de P(arbre)

### Section 3 : Questions de cours (3-4 pts)
- Definitions (lexeme, mot-forme, IDF, nDCG, embeddings)
- Hypothese distributionnelle
- Difference HMM vs CRF
- Fonctionnement d'un RNN
- Lissage de Laplace adapte ?

### Section 4 : Classification / TF-IDF (5-7 pts)
- Calcul TF-IDF complet
- Naive Bayes avec lissage de Laplace
- Classification d'un nouveau document
- Comparaison de methodes

### Section 5 : Modeles de langue (3-4 pts)
- Architecture d'un RNN pour modele de langue
- Perplexite et son interpretation
- Lissage adapte aux n-grammes ?

## Fichiers de preparation

| Fichier | Contenu |
|---------|---------|
| [analyse_annales.md](/S6/TAL/exam-prep/analyse-annales) | Analyse des patterns dans les 6 annees d'examen |
| [questions_reponses.md](/S6/TAL/exam-prep/questions-reponses) | Questions types et reponses modeles |
| [formules_essentielles.md](/S6/TAL/exam-prep/formules-essentielles) | Toutes les formules a memoriser |

## Strategie de revision

### 3 jours avant le DS

1. Relire le guide chapitre par chapitre (chapitres 1-9)
2. Faire les exercices de traces d'algorithmes (Viterbi, CKY, transition parser)
3. Refaire les calculs Naive Bayes et TF-IDF

### La veille du DS

1. Relire les cheat sheets de chaque chapitre
2. Relire la fiche de formules essentielles
3. Verifier qu'on sait calculer :
   - TF-IDF pour un mot dans un document
   - Naive Bayes avec Laplace
   - P(arbre) avec PCFG
   - Perplexite d'un bigramme

### Le jour du DS

- Calculatrice chargee
- Commencer par les questions les plus faciles (questions de cours)
- Garder du temps pour les calculs (Naive Bayes, TF-IDF)
- Verifier les unites et les conventions (log base 10 vs base 2)
