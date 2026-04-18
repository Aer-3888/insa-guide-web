---
title: "Exercices TAL -- Solutions et Traces d'Algorithmes"
sidebar_position: 0
---

# Exercices TAL -- Solutions et Traces d'Algorithmes

> Exercices types bases sur les annales 2016-2023 et les TPs.
> Objectif : traces d'algorithmes pas a pas, calculs de probabilites, questions conceptuelles.
> Chaque exercice inclut toutes les etapes intermediaires et les verifications.

## Organisation

| Fichier | Contenu | Exercices |
|---------|---------|-----------|
| [01_viterbi_traces.md](/S6/TAL/exercises/01-viterbi-traces) | Traces completes de l'algorithme de Viterbi | 3 etats/3 mots, ambiguite, 4 etats, estimation de parametres HMM |
| [02_cky_traces.md](/S6/TAL/exercises/02-cky-traces) | Traces completes de l'algorithme CKY et PCFG | CKY 5 mots, CKY avec PP, PCFG 2 arbres, CNF, ambiguite d'attachement PP |
| [03_naive_bayes_calculs.md](/S6/TAL/exercises/03-naive-bayes-calculs) | Calculs Naive Bayes avec lissage de Laplace | Classification sentiment, TF-IDF + cosinus, Laplace, a priori desequilibre, binaire vs frequentiel |
| [04_tfidf_calculs.md](/S6/TAL/exercises/04-tfidf-calculs) | TF-IDF, cosinus, BM25, evaluation | TF-IDF complet, IDF, booleen vs vectoriel, BM25, MAP, nDCG, PageRank, index inverse |
| [05_ngram_perplexite.md](/S6/TAL/exercises/05-ngram-perplexite) | N-grammes et perplexite | Bigramme ML, perplexite, Laplace, interpolation, perplexite comparative, trigramme |
| [06_transition_parser.md](/S6/TAL/exercises/06-transition-parser) | Traces du parser transition-based | 4 phrases completes, Left-Arc vs Right-Arc, relations UD, UAS/LAS |

## Comment utiliser ces exercices

1. Essayer de resoudre l'exercice AVANT de regarder la solution
2. Comparer sa demarche etape par etape (chaque calcul intermediaire est montre)
3. Identifier les erreurs courantes dans la section "Pieges" de chaque fichier
4. Refaire les exercices a la main avec une calculatrice
5. Les formules essentielles sont resumees en fin de chaque fichier

## Couverture par sujet de DS

| Theme DS | Fichier(s) |
|----------|-----------|
| Viterbi (POS tagging) | 01_viterbi_traces.md |
| HMM parametres | 01_viterbi_traces.md (Ex4) |
| CKY (analyse syntaxique) | 02_cky_traces.md |
| PCFG (probabilites d'arbres) | 02_cky_traces.md (Ex3, Ex5-6) |
| Conversion CNF | 02_cky_traces.md (Ex4) |
| Naive Bayes + Laplace | 03_naive_bayes_calculs.md |
| TF-IDF + cosinus | 03_naive_bayes_calculs.md (Ex3), 04_tfidf_calculs.md |
| BM25 | 04_tfidf_calculs.md (Ex4) |
| MAP et nDCG | 04_tfidf_calculs.md (Ex5) |
| PageRank | 04_tfidf_calculs.md (Ex6) |
| N-grammes et perplexite | 05_ngram_perplexite.md |
| Lissage (Laplace, interpolation) | 05_ngram_perplexite.md (Ex2-4) |
| Parsing en dependances | 06_transition_parser.md |
| Relations UD et UAS/LAS | 06_transition_parser.md (Ex5-6) |
| Booleen vs vectoriel | 04_tfidf_calculs.md (Ex3) |
