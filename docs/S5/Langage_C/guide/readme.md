---
title: "Langage C (ESM05) - Guide de Cours Complet"
sidebar_position: 0
---

# Langage C (ESM05) - Guide de Cours Complet

**INSA Rennes - 3eme annee Informatique (S5)**

## Vue d'ensemble du cours

Le module Langage C (ESM05) couvre la programmation C de A a Z : des bases du langage aux concepts avances comme les allocateurs memoire personnalises. Le cours met un accent particulier sur les **pointeurs**, la **gestion memoire**, et la **compilation separee**.

## Organisation du guide

| Chapitre | Fichier | Themes |
|----------|---------|--------|
| 1 | [c-fundamentals.md](/S5/Langage_C/guide/c-fundamentals) | Types, variables, operateurs, flux de controle, fonctions |
| 2 | [pointers-and-memory.md](/S5/Langage_C/guide/pointers-and-memory) | Arithmetique des pointeurs, dereferencement, tableaux vs pointeurs, void* |
| 3 | [dynamic-memory.md](/S5/Langage_C/guide/dynamic-memory) | malloc, calloc, realloc, free, fuites memoire, valgrind |
| 4 | [strings.md](/S5/Langage_C/guide/strings) | Tableaux de char, fonctions string.h, debordements de buffer |
| 5 | [structures-and-unions.md](/S5/Langage_C/guide/structures-and-unions) | struct, typedef, unions, champs de bits, enums |
| 6 | [file-io.md](/S5/Langage_C/guide/file-io) | fopen, fread, fwrite, fprintf, fichiers binaires vs texte |
| 7 | [preprocessor-and-compilation.md](/S5/Langage_C/guide/preprocessor-and-compilation) | #include, #define, macros, flags gcc, Makefiles |
| 8 | [advanced-topics.md](/S5/Langage_C/guide/advanced-topics) | Pointeurs de fonctions, listes chainees, programmation generique |

## Progression pedagogique du cours

```
Phase 1: Fondamentaux (TP1-TP2)
    Syntaxe de base, pointeurs, fonctions mathematiques
    |
    v
Phase 2: Structures de donnees (TP3-TP4)
    Tableaux, chaines, structures, E/S fichiers
    |
    v
Phase 3: Gestion memoire avancee (TP5-TP7)
    Allocation dynamique, listes chainees, allocateur memoire
```

## Ressources associees

- [Exercices resolus](../exercises/) - Solutions commentees des TP et TD
- [Preparation examens](../exam-prep/) - Annales corrigees et strategies

## Outils de developpement

| Outil | Usage |
|-------|-------|
| **gcc** | Compilateur C (toujours avec `-Wall -Wextra -std=c11 -g`) |
| **make** | Automatisation de la compilation |
| **gdb** | Debogueur pas a pas |
| **valgrind** | Detection de fuites memoire |
| **CLion** | IDE recommande (licence gratuite etudiants JetBrains) |

## Compilation type

```bash
# Compilation simple
gcc -Wall -Wextra -std=c11 -g -o programme fichier.c -lm

# Avec Makefile
make          # Compile
make clean    # Nettoie
make run      # Compile et execute

# Debogage
gcc -g programme.c -o programme
gdb ./programme

# Detection fuites memoire
valgrind --leak-check=full ./programme
```
