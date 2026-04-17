---
title: "Preparation aux Examens - Langage C (ESM05)"
sidebar_position: 0
---

# Preparation aux Examens - Langage C (ESM05)

## Format typique de l'examen

L'examen de Langage C a INSA Rennes dure generalement 2h et comprend 2 a 3 exercices progressifs.

### Types de questions

| Type | Frequence | Difficulte | Points |
|------|-----------|-----------|--------|
| Correction de code (trouver les erreurs) | Tres frequent | Facile | 2-4 pts |
| Prediction de sortie (tracer l'execution) | Frequent | Moyen | 3-5 pts |
| Ecriture de types (enum, struct, typedef) | Tres frequent | Facile | 2-3 pts |
| Prototypes de fonctions | Tres frequent | Facile | 1-2 pts |
| Implementation de fonctions | Frequent | Moyen-Dur | 3-5 pts |
| Lecture/ecriture de fichiers | Frequent | Moyen | 3-5 pts |
| Pointeurs et passage par reference | Tres frequent | Dur | 3-5 pts |
| Allocation dynamique (malloc/free) | Occasionnel | Dur | 2-4 pts |

### Pattern recurrent des exercices

**Exercice 1 (facile - 5-6 pts) :**
- Corriger un code avec des erreurs de syntaxe
- Questions de comprehension (preprocesseur, types)

**Exercice 2 (moyen - 8-10 pts) :**
- Definir un type enum et une structure
- Ecrire des prototypes de fonctions
- Implementer des fonctions de manipulation de structures
- Lire/ecrire un fichier avec fscanf/fprintf

**Exercice 3 (difficile - 4-6 pts) :**
- Allocation dynamique
- Manipulation de chaines
- Questions de comprehension avancee

## Strategie de revision

### Priorite 1 : Structures et fichiers (50% de l'examen typique)
- typedef struct + enum
- Prototypes de fonctions (passage par valeur vs pointeur)
- Lecture/ecriture de fichiers (fopen, fscanf, fprintf, fclose)
- Gestion d'erreurs (NULL, feof)

### Priorite 2 : Pointeurs (30% de l'examen)
- Tracage de pointeurs (exercice quasi-systematique)
- Passage par reference
- Operateur -> pour les structures
- &(struct_var.champ) pour scanf

### Priorite 3 : Chaines et memoire (20% de l'examen)
- strcmp, strcpy, strlen
- malloc/free
- Buffer overflow

## Fichiers de preparation

| Fichier | Contenu |
|---------|---------|
| [annales-walkthrough.md](/S5/Langage_C/exam-prep/annales-walkthrough) | Corrige detaille des annales 2014-2020 |
| [pointer-exercises.md](/S5/Langage_C/exam-prep/pointer-exercises) | Exercices de tracage de pointeurs et memoire |

## Erreurs les plus courantes a l'examen

1. **Oublier le `&` dans scanf** : `scanf("%d", &n)` pas `scanf("%d", n)`
2. **Oublier le `->` avec les pointeurs de structure** : `ptr->champ` pas `ptr.champ`
3. **Ne pas verifier fopen** : toujours `if (fichier == NULL)`
4. **Confondre `=` et `==`** : `if (a == 5)` pas `if (a = 5)`
5. **Oublier `strcpy` pour copier des chaines** : `strcpy(dst, src)` pas `dst = src`
6. **Oublier le `\0` terminal** dans les tableaux de char
7. **Ne pas `free()` la memoire allouee**
8. **Passer une structure par valeur au lieu de par pointeur** quand modification necessaire
