---
title: "Preparation a l'examen -- Programmation Fonctionnelle"
sidebar_position: 0
---

# Preparation a l'examen -- Programmation Fonctionnelle

## Format des examens

Les examens OCaml a l'INSA Rennes comportent typiquement :

| Epreuve | Duree | Format | Poids |
|---------|-------|--------|-------|
| TP note | 1h30 | Sur machine, fichier .ml a completer | ~30% |
| DS (mi-semestre) | 2h | Ecrit, papier | ~30% |
| Examen final | 2h | Ecrit ou sur machine | ~40% |

## Types de questions recurrentes

### 1. Inference de types (presente dans CHAQUE examen)
On vous donne une expression et vous devez donner son type.

### 2. Ecrire une fonction
On vous donne la signature et le comportement attendu. Vous devez ecrire le code OCaml.

### 3. Tracer l'evaluation
On vous donne une expression et vous devez montrer les etapes d'evaluation.

### 4. Manipuler des structures de donnees
Listes, arbres, ensembles, formules logiques.

## Analyse des annales par annee

| Annee | Theme principal | Structures cles |
|-------|-----------------|-----------------|
| 2024 | Caracteres riches, texte, rope | ADT, records mutables, fold, arbre |
| 2023 | Mots, expressions regulieres, programmes | Regexp, AST, evaluateur, compilateur |
| 2022 | Mots (trie/dictionnaire) | Files, listes assoc, arbre de mots |
| 2021 | Files, listes d'association, dictionnaire | Queue, assoc, trie |
| 2020 | Representation binaire, ensembles | bit/bint, intset (arbre), fold_right |
| 2019 | Expressions lineaires, anneaux | Records, expressions, simplification |

## Corrections detaillees des examens

- [exam-2019.md](/S5/Programmation_Fonctionnelle/exam-prep/exam-2019) -- Expressions lineaires et anneaux
- [exam-2020.md](/S5/Programmation_Fonctionnelle/exam-prep/exam-2020) -- Representation binaire et ensembles
- [exam-2023.md](/S5/Programmation_Fonctionnelle/exam-prep/exam-2023) -- Mots, regex, programmes

## Strategie d'examen

### Avant l'examen

1. **Maitriser l'inference de types** : c'est la base. Savoir deduire le type de n'importe quelle expression.
2. **Pratiquer les traces d'evaluation** : fold_left, fold_right, recursion.
3. **Reviser les patterns cles** : recursion sur listes, recursion mutuelle sur arbres, point fixe.
4. **Connaitre par coeur** : List.map, List.filter, List.fold_left, List.fold_right et leurs types.

### Pendant l'examen

1. **Lire tout le sujet** avant de commencer. Les questions s'enchainent souvent.
2. **Commencer par les types** : ecrire la signature avant le code.
3. **Tester mentalement** avec un exemple simple.
4. **Ne pas paniquer sur les types complexes** : decomposer etape par etape.
5. **Utiliser le pattern matching** des que possible -- c'est plus propre et le correcteur l'apprecie.

### Erreurs frequentes

- Oublier `rec` pour les fonctions recursives
- Confondre `=` (egalite) et `<-` (mutation)
- Melanger les operateurs int (`+`) et float (`+.`)
- Oublier le cas de base dans la recursion
- Ecrire `[a, b, c]` au lieu de `[a; b; c]` (virgule vs point-virgule)
- Oublier `()` pour les fonctions `unit -> 'a`
