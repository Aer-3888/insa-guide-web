---
title: "TP3 - Tableaux et Chaines de Caracteres"
sidebar_position: 3
---

# TP3 - Tableaux et Chaines de Caracteres

## Objectifs
- Manipuler les tableaux statiques
- Comprendre les chaines de caracteres en C
- Generer des nombres aleatoires
- Creer des histogrammes
- Manipuler les caracteres (`tolower()`, `toupper()`)

## Exercices

### Exercice 1 : Histogramme de Valeurs Aleatoires

Creer un programme qui :
1. Genere un tableau de valeurs aleatoires entre 0 et `VAL_MAX-1`
2. Calcule l'histogramme (compte les occurrences de chaque valeur)
3. Affiche l'histogramme sous forme graphique

**Concepts cles :**
- Generation de nombres aleatoires avec `rand()` et `srand()`
- Initialisation avec `srand(time(NULL))` pour avoir des valeurs differentes
- Utilisation d'un tableau comme compteur

**Algorithme de l'histogramme :**
```c noexec
Pour chaque valeur v dans le tableau source:
    dest[v]++  // Incremente le compteur de la valeur v
```

**Exemple de sortie :**
```
tab[0] = 5
tab[1] = 12
tab[2] = 7
tab[3] = 5
tab[4] = 18
=====================
0 : -----
1 : ------------
2 : -------
3 : -----
4 : ------------------
```

### Exercice 2 : Generation d'Identifiants

Creer des identifiants a partir d'un prenom et d'un nom :
- Format : premiere lettre du prenom + nom complet
- Version 2 : tout en minuscules

**Exemples :**
- Jean Dupont --> jdupont
- Marie MARTIN --> mmartin

**Points cles :**
- Les chaines C sont des tableaux de `char` termines par `'\0'`
- `tolower()` convertit un caractere en minuscule
- Attention aux depassements de buffer (taille max de l'ID)

## Structure des Fichiers

```
tp3/
├── README.md
└── src/
    ├── Makefile
    ├── histogram.c          # Programme d'histogramme
    ├── tableau.c            # Fonctions de manipulation de tableaux
    ├── tableau.h            # En-tetes
    ├── login_main.c         # Programme de generation d'ID
    ├── login.c              # Fonctions de generation d'ID
    └── login.h              # En-tetes
```

## Compilation et Execution

```bash
cd tp3/src
make

# Executer l'histogramme
./histogram

# Executer le generateur d'identifiants
./login
```

## Points Importants

### 1. Nombres Aleatoires en C
```c noexec
#include <stdlib.h>
#include <time.h>

srand(time(NULL));      // Initialiser le generateur (1 fois au debut)
int val = rand() % 20;  // Genere un nombre entre 0 et 19
```

### 2. Chaines de Caracteres
- Une chaine est un tableau de `char` termine par `'\0'`
- `scanf("%s", str)` lit jusqu'au premier espace
- Ne pas oublier de reserver de l'espace pour le `'\0'` final

### 3. Manipulation de Caracteres
```c noexec
#include <ctype.h>

char c = 'A';
char lower = tolower(c);  // 'a'
char upper = toupper(c);  // 'A'
int is_digit = isdigit(c); // 0 (faux)
```

### 4. Securite des Tableaux
- Toujours verifier les limites
- Ne pas ecrire au-dela de la taille du tableau
- Attention aux depassements de buffer

## Concepts C Abordes

- Tableaux statiques
- Chaines de caracteres (tableaux de `char`)
- Generation de nombres aleatoires (`rand()`, `srand()`)
- Manipulation de caracteres (`<ctype.h>`)
- Passage de tableaux aux fonctions (par reference)
- Terminateur de chaine (`'\0'`)
