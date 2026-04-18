---
title: "TP1 - Introduction au C : Pointeurs et Fonctions"
sidebar_position: 1
---

# TP1 - Introduction au C : Pointeurs et Fonctions

## Objectifs
- Comprendre les bases de la syntaxe C
- Manipuler les pointeurs
- Passer des arguments par reference
- Utiliser les fonctions mathematiques de la bibliotheque standard

## Exercices

### Exercice 1 : Fonction Carre avec Pointeur
Implementer une fonction `carre()` qui :
- Prend un pointeur vers un `double` en parametre
- Eleve la valeur au carre **en place** (modifie la valeur pointee)
- Retourne le resultat

**Concepts cles :**
- Dereferencement de pointeur (`*ptr`)
- Modification par reference
- Operateur d'assignation composee (`*=`)

### Exercice 2 : Calcul de la Norme d'un Vecteur
Implementer une fonction `norme()` qui :
- Prend deux `double` (coordonnees x, y) en parametre
- Calcule et retourne la norme euclidienne : sqrt(x^2 + y^2)
- Utilise la fonction `sqrt()` de `<math.h>`

**Formule :**
```
norme(x, y) = sqrt(x^2 + y^2)
```

## Compilation et Execution

```bash
cd tp1/src
make
./main
```

## Compilation manuelle

```bash
gcc -Wall -Wextra -std=c11 -o main main.c -lm
```

**Note :** L'option `-lm` lie la bibliotheque mathematique (necessaire pour `sqrt()`).

## Exemple d'Execution

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

1. **Pointeurs vs Valeurs :**
   - `carre()` utilise un pointeur pour modifier la variable en place
   - `norme()` prend des valeurs et retourne un resultat

2. **Bibliotheque Mathematique :**
   - `#include <math.h>` pour les fonctions mathematiques
   - Lier avec `-lm` lors de la compilation

3. **Format d'Entree/Sortie :**
   - `%lf` pour lire/ecrire des `double`
   - `scanf()` prend toujours des adresses (`&variable`)
   - `printf()` prend des valeurs directement

## Concepts C Abordes

- Pointeurs et dereferencement
- Passage par reference vs passage par valeur
- Fonctions mathematiques (`sqrt()`, operateurs arithmetiques)
- Entree/sortie standard (`scanf()`, `printf()`)
- Specificateurs de format (`%lf`)
