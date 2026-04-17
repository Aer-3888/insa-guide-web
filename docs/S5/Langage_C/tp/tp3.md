---
title: "TP3 - Tableaux et Chaînes de Caractères"
sidebar_position: 3
---

# TP3 - Tableaux et Chaînes de Caractères

## Objectifs
- Manipuler les tableaux statiques
- Comprendre les chaînes de caractères en C
- Générer des nombres aléatoires
- Créer des histogrammes
- Manipuler les caractères (`tolower()`, `toupper()`)

## Exercices

### Exercice 1: Histogramme de Valeurs Aléatoires

Créer un programme qui:
1. Génère un tableau de valeurs aléatoires entre 0 et `VAL_MAX-1`
2. Calcule l'histogramme (compte les occurrences de chaque valeur)
3. Affiche l'histogramme sous forme graphique

**Concepts clés:**
- Génération de nombres aléatoires avec `rand()` et `srand()`
- Initialisation avec `srand(time(NULL))` pour avoir des valeurs différentes
- Utilisation d'un tableau comme compteur

**Algorithme de l'histogramme:**
```c
Pour chaque valeur v dans le tableau source:
    dest[v]++  // Incrémente le compteur de la valeur v
```

**Exemple de sortie:**
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

### Exercice 2: Génération d'Identifiants

Créer des identifiants à partir d'un prénom et d'un nom:
- Format: première lettre du prénom + nom complet
- Version 2: tout en minuscules

**Exemples:**
- Jean Dupont → jdupont
- Marie MARTIN → mmartin

**Points clés:**
- Les chaînes C sont des tableaux de `char` terminés par `'\0'`
- `tolower()` convertit un caractère en minuscule
- Attention aux dépassements de buffer (taille max de l'ID)

## Structure des Fichiers

```
tp3/
├── README.md
└── src/
    ├── Makefile
    ├── histogram.c          # Programme d'histogramme
    ├── tableau.c            # Fonctions de manipulation de tableaux
    ├── tableau.h            # En-têtes
    ├── login_main.c         # Programme de génération d'ID
    ├── login.c              # Fonctions de génération d'ID
    └── login.h              # En-têtes
```

## Compilation et Exécution

```bash
cd tp3/src
make

# Exécuter l'histogramme
./histogram

# Exécuter le générateur d'identifiants
./login
```

## Points Importants

### 1. Nombres Aléatoires en C
```c
#include <stdlib.h>
#include <time.h>

srand(time(NULL));      // Initialiser le générateur (1 fois au début)
int val = rand() % 20;  // Génère un nombre entre 0 et 19
```

### 2. Chaînes de Caractères
- Une chaîne est un tableau de `char` terminé par `'\0'`
- `scanf("%s", str)` lit jusqu'au premier espace
- Ne pas oublier de réserver de l'espace pour le `'\0'` final

### 3. Manipulation de Caractères
```c
#include <ctype.h>

char c = 'A';
char lower = tolower(c);  // 'a'
char upper = toupper(c);  // 'A'
int is_digit = isdigit(c); // 0 (faux)
```

### 4. Sécurité des Tableaux
- Toujours vérifier les limites
- Ne pas écrire au-delà de la taille du tableau
- Attention aux dépassements de buffer

## Concepts C Abordés

- Tableaux statiques
- Chaînes de caractères (tableaux de `char`)
- Génération de nombres aléatoires (`rand()`, `srand()`)
- Manipulation de caractères (`<ctype.h>`)
- Passage de tableaux aux fonctions (par référence)
- Terminateur de chaîne (`'\0'`)
