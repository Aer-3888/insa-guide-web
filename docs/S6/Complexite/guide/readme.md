---
title: "Complexite -- Guide Complet (S6 INSA Rennes)"
sidebar_position: 0
---

# Complexite -- Guide Complet (S6 INSA Rennes)

Guide de revision pour le cours de Complexite algorithmique, 3eme annee INFO, INSA Rennes. Couvre la partie Complexite (Maud Marchal) et la partie Evaluation de Performance (Nikos Parlavantzas).

---

## Structure du cours

Le cours se decompose en deux parties principales :

**Partie 1 -- Complexite algorithmique (Maud Marchal)**
- Notations asymptotiques et calcul de complexite
- Resolution de recurrences (equation caracteristique, series generatrices)
- Diviser pour regner et theoreme maitre
- Programmation dynamique
- Algorithmes gloutons
- Exploration d'arbres, backtracking, Branch & Bound

**Partie 2 -- Evaluation de performance (Nikos Parlavantzas)**
- Methodologie d'evaluation systematique
- Metriques, facteurs, charge de travail
- Techniques de mesure et profiling (gprof, gcov)
- Loi d'Amdahl et optimisation
- Presentation et analyse des donnees

---

## Table des matieres

| # | Chapitre | Points DS |
|---|----------|-----------|
| 01 | [Notations asymptotiques](/S6/Complexite/guide/01-asymptotic-notation) | 2-4 pts |
| 02 | [Recurrences](/S6/Complexite/guide/02-recurrences) | 6 pts |
| 03 | [Algorithmes de tri](/S6/Complexite/guide/03-sorting-algorithms) | 2-4 pts |
| 04 | [Diviser pour regner](/S6/Complexite/guide/04-divide-and-conquer) | 4-6 pts |
| 05 | [Programmation dynamique](/S6/Complexite/guide/05-dynamic-programming) | 10-14 pts |
| 06 | [Algorithmes gloutons](/S6/Complexite/guide/06-greedy-algorithms) | 2-4 pts |
| 07 | [Algorithmes de graphes](/S6/Complexite/guide/07-graph-algorithms) | 2-4 pts |
| 08 | [NP-completude](/S6/Complexite/guide/08-np-completeness) | 0-2 pts |
| 09 | [Analyse amortie](/S6/Complexite/guide/09-amortized-analysis) | 0-2 pts |
| 10 | [Evaluation de performance](/S6/Complexite/guide/10-performance-evaluation) | 4-6 pts (depuis 2024) |

---

## Roadmap d'apprentissage

```
Notations asymptotiques (01)
    |
    v
Recurrences (02) -----------> Diviser pour regner (04)
    |                              |
    v                              v
Algorithmes de tri (03)     Programmation dynamique (05)
                                   |
                                   v
                            Algorithmes gloutons (06)
                                   |
                                   +----> Algorithmes de graphes (07)
                                   |
                                   +----> NP-completude (08)
                                   |
                                   +----> Analyse amortie (09)

[Independant] Evaluation de performance (10)
```

---

## Structure typique du DS (2h)

D'apres l'analyse des annales 2017-2024 :

| Partie | Points | Contenu | Duree conseillee |
|--------|--------|---------|------------------|
| Exercice 1 | ~6 pts | Recurrences (eq. caract. + series generatrices) | 30 min |
| Exercice 2 | 4-6 pts | Calcul de complexite / DPR / Glouton / B&B | 20-30 min |
| Probleme | 10-14 pts | Programmation dynamique (recurrence, algo naif, redondances, algo iteratif) | 60-70 min |
| Peva (2024+) | 4-6 pts | Metriques, gprof, Amdahl | 15-20 min |

---

## Correspondance avec le cours de Maud Marchal

| Chapitre du guide | CTD INSA |
|-------------------|----------|
| 01 -- Notations asymptotiques | Cours 1 |
| 02 -- Recurrences | Cours 1-2 |
| 03 -- Tri | Cours 1-2 |
| 04 -- Diviser pour regner | CTD1 |
| 05 -- Programmation dynamique | CTD2-CTD4 |
| 06 -- Glouton | CTD4-CTD5 |
| 07 -- Graphes | CTD5-CTD6 |
| 08 -- NP-completude | CTD7-CTD8 |
| 10 -- Peva | Cours Peva (Parlavantzas) |
