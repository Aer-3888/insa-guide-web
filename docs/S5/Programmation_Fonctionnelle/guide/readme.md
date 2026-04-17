---
title: "Programmation Fonctionnelle -- Guide de cours"
sidebar_position: 0
---

# Programmation Fonctionnelle -- Guide de cours

## Vue d'ensemble

Ce cours couvre la programmation fonctionnelle en OCaml, langage developpe a l'INRIA. Le paradigme fonctionnel repose sur trois principes fondamentaux : les fonctions comme valeurs de premiere classe, l'immutabilite des donnees, et l'evaluation d'expressions plutot que l'execution d'instructions.

## Organisation du cours

| Semaine | Sujet | TP |
|---------|-------|----|
| 1-2 | Noyau fonctionnel : let, types, tuples, conditionnels | TP1 : Decouverte |
| 3-4 | Recursion, fonctions d'ordre superieur, recursion mutuelle | TP2 : Fonctions recursives |
| 5-6 | Types algebriques, records, variants, pattern matching | TP3 : Jeu de cartes (Reussite) |
| 7-8 | Listes, algorithmes de tri, partitions | TP4-TP5 : Tris et listes |
| 9-10 | Arbres binaires, ABR, positionnement | TP6 : Arbres binaires |
| 11-12 | Arbres n-aires, parcours, egalite structurelle | TP7 : Arbres n-aires |
| 13-14 | Types avances, Graphics, modules | TP8 : Jeu de cartes (graphique) |
| 15-16 | Logique propositionnelle, parseurs, NNF, CNF | TP9 : Logique |

## Chapitres du guide

| Fichier | Sujet |
|---------|-------|
| [01-ocaml-basics.md](/S5/Programmation_Fonctionnelle/guide/01-ocaml-basics) | Bases OCaml : let, types, inference, tuples, records |
| [02-pattern-matching.md](/S5/Programmation_Fonctionnelle/guide/02-pattern-matching) | Pattern matching : match, wildcards, exhaustivite |
| [03-recursion.md](/S5/Programmation_Fonctionnelle/guide/03-recursion) | Recursion : recursive, terminale, accumulateurs |
| [04-higher-order-functions.md](/S5/Programmation_Fonctionnelle/guide/04-higher-order-functions) | Fonctions d'ordre superieur : map, fold, filter, curryfication |
| [05-algebraic-data-types.md](/S5/Programmation_Fonctionnelle/guide/05-algebraic-data-types) | Types algebriques : variants, option, polymorphisme |
| [06-lists-and-trees.md](/S5/Programmation_Fonctionnelle/guide/06-lists-and-trees) | Listes et arbres : operations, parcours, ABR |
| [07-modules-and-functors.md](/S5/Programmation_Fonctionnelle/guide/07-modules-and-functors) | Modules et foncteurs : signatures, implementations |
| [08-imperative-features.md](/S5/Programmation_Fonctionnelle/guide/08-imperative-features) | Traits imperatifs : refs, tableaux, boucles |

## Evaluation

- **TP note** (octobre) : examen pratique sur machine, 1h30
- **DS** (mi-semestre) : examen ecrit, 2h
- **Examen final** (janvier) : examen ecrit, 2h

Les examens testent principalement :
1. L'inference de types (donner le type d'une expression)
2. L'ecriture de fonctions (recursion, pattern matching, HOF)
3. Le trace d'evaluation (derouler l'execution pas a pas)
4. La manipulation de structures de donnees (listes, arbres, ensembles)

## Ressources

- [OCaml Manual](https://ocaml.org/manual/)
- [Real World OCaml](https://dev.realworldocaml.org/)
- Cours PDF : `noyau_fct.pdf`, `types.pdf`, `arbres.pdf`
- Cheat sheet : `cheat_sheet.pdf`
