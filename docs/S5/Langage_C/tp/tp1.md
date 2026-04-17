---
title: "TP1 - Introduction au C: Pointeurs et Fonctions"
sidebar_position: 1
---

# TP1 - Introduction au C: Pointeurs et Fonctions

## Objectifs
- Comprendre les bases de la syntaxe C
- Manipuler les pointeurs
- Passer des arguments par référence
- Utiliser les fonctions mathématiques de la bibliothèque standard

## Exercices

### Exercice 1: Fonction Carré avec Pointeur
Implémenter une fonction `carre()` qui:
- Prend un pointeur vers un `double` en paramètre
- Élève la valeur au carré **en place** (modifie la valeur pointée)
- Retourne le résultat

**Concepts clés:**
- Déréférencement de pointeur (`*ptr`)
- Modification par référence
- Opérateur d'assignation composée (`*=`)

### Exercice 2: Calcul de la Norme d'un Vecteur
Implémenter une fonction `norme()` qui:
- Prend deux `double` (coordonnées x, y) en paramètre
- Calcule et retourne la norme euclidienne: √(x² + y²)
- Utilise la fonction `sqrt()` de `<math.h>`

**Formule:**
```
norme(x, y) = √(x² + y²)
```

## Compilation et Exécution

```bash
cd tp1/src
make
./main
```

## Compilation manuelle

```bash
gcc -Wall -Wextra -std=c11 -o main main.c -lm
```

**Note:** L'option `-lm` lie la bibliothèque mathématique (nécessaire pour `sqrt()`).

## Exemple d'Exécution

```
Nombre a elever au carre : 
5
Resultat 
25.000000
 
Vector 
3 4
5.000000
```

## Points Importants

1. **Pointeurs vs Valeurs:**
   - `carre()` utilise un pointeur pour modifier la variable en place
   - `norme()` prend des valeurs et retourne un résultat

2. **Bibliothèque Mathématique:**
   - `#include <math.h>` pour les fonctions mathématiques
   - Lier avec `-lm` lors de la compilation

3. **Format d'Entrée/Sortie:**
   - `%lf` pour lire/écrire des `double`
   - `scanf()` prend toujours des adresses (`&variable`)
   - `printf()` prend des valeurs directement

## Concepts C Abordés

- Pointeurs et déréférencement
- Passage par référence vs passage par valeur
- Fonctions mathématiques (`sqrt()`, opérateurs arithmétiques)
- Entrée/sortie standard (`scanf()`, `printf()`)
- Spécificateurs de format (`%lf`)
