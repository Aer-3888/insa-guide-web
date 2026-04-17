---
title: "TP7 - Gestionnaire de Mémoire Dynamique Personnalisé"
sidebar_position: 7
---

# TP7 - Gestionnaire de Mémoire Dynamique Personnalisé

## Objectifs
- Comprendre le fonctionnement interne de `malloc()` et `free()`
- Implémenter un allocateur de mémoire personnalisé
- Gérer un tas (heap) avec des descripteurs de blocs
- Manipuler des listes chaînées de zones mémoire
- Déboguer les fuites et corruptions mémoire

## Concept: Allocateur de Mémoire

Les fonctions `malloc()` et `free()` gèrent l'allocation dynamique de mémoire.
Ce TP implémente ces fonctions pour comprendre leur fonctionnement.

### Principe
```
[Heap de 1 000 000 octets]
|
+--[Descripteur1]--[Données1]--[Descripteur2]--[Données2]--[Libre]--+
```

Chaque bloc alloué a:
- Un **descripteur** contenant: taille, statut (LIBRE/OCCUPE), pointeur vers le suivant
- Une **zone de données** de la taille demandée

## Structure de Données

```c
typedef enum {LIBRE, OCCUPE} Statut_memoire;

typedef struct descript {
    size_t size;              /* Taille du bloc en octets */
    Statut_memoire statut;    /* Libre ou occupé */
    struct descript *suiv;    /* Chaînage vers le bloc suivant */
} Descript_mem;
```

## Fonctions à Implémenter

### Allocation
- `Mon_malloc(size)` - Alloue un bloc de taille donnée
  - Cherche un bloc libre suffisant (first-fit)
  - Découpe le bloc si nécessaire
  - Marque le bloc comme OCCUPE
  - Retourne un pointeur vers la zone de données

### Libération
- `Mon_free(ptr)` - Libère un bloc alloué
  - Marque le bloc comme LIBRE
  - Fusionne avec les blocs libres adjacents (coalescence)

### Autres Fonctions
- `Mon_calloc(count, size)` - Alloue et initialise à zéro
- `Mon_realloc(ptr, new_size)` - Réalloue avec une nouvelle taille
- `stat_memoire_dyn()` - Affiche la cartographie mémoire (débogage)

## Algorithmes

### First-Fit (Mon_malloc)
```
Pour chaque bloc du heap:
    Si bloc.statut == LIBRE ET bloc.size >= taille_demandée:
        Si bloc.size > taille_demandée + taille_min:
            Découper le bloc en deux (alloué + reste libre)
        Marquer le bloc comme OCCUPE
        Retourner pointeur vers les données
Échec: plus de mémoire disponible
```

### Coalescence (Mon_free)
```
Marquer le bloc comme LIBRE
Si le bloc suivant est LIBRE:
    Fusionner les deux blocs (additionner les tailles)
Parcourir pour fusionner avec le précédent si LIBRE
```

## Compilation et Exécution

```bash
cd tp7/src
make
./main
```

## Mode Débogage

Le fichier `myalloc.h` contient des flags:

```c
#define DEBUG           /* Affiche les messages de débogage */
#define ALLOC_PERSO     /* Utilise Mon_malloc au lieu de malloc */
```

Décommenter `DEBUG` pour voir les opérations d'allocation/libération.

## Exemple d'Utilisation

```c
#include "myalloc.h"

int main() {
    /* malloc est automatiquement remplacé par Mon_malloc */
    int *tab = malloc(10 * sizeof(int));
    
    /* Afficher l'état du tas */
    stat_memoire_dyn();
    
    /* Libération */
    free(tab);
    
    return 0;
}
```

## Points Importants

### 1. Pointeur Arithmétique
```c
/* Calculer l'adresse des données après le descripteur */
void *donnees = (void*)((char*)descripteur + sizeof(Descript_mem));
```

### 2. Retrouver le Descripteur depuis un Pointeur
```c
/* L'utilisateur a un pointeur vers les données */
/* Le descripteur est juste avant */
Descript_mem *desc = (Descript_mem*)((char*)ptr - sizeof(Descript_mem));
```

### 3. Coalescence de Blocs
```c
if (bloc->suiv != NULL && bloc->suiv->statut == LIBRE) {
    bloc->size += sizeof(Descript_mem) + bloc->suiv->size;
    bloc->suiv = bloc->suiv->suiv;
}
```

### 4. Fragmentation
La mémoire peut se fragmenter (plein de petits blocs libres non contigus).
Solutions: coalescence, compactage (non implémenté ici).

## Tests à Effectuer

1. **Allocation simple:** `malloc(100)`, vérifier l'état
2. **Allocations multiples:** plusieurs `malloc()` successifs
3. **Libération:** `free()` et vérifier la coalescence
4. **Réallocation:** `realloc()` avec taille plus grande/petite
5. **Cas limites:** allocation de 0, libération de NULL
6. **Fuites mémoire:** oublier `free()` et observer

## Concepts C Abordés

- Gestion du tas (heap)
- Arithmétique de pointeurs
- Structures chaînées
- Macros de remplacement (`#define malloc Mon_malloc`)
- Compilation conditionnelle (`#ifdef DEBUG`)
- `size_t` (type pour les tailles)
- Cast de pointeurs génériques (`void*`)

## Problèmes Courants

1. **Corruption de tas:** écriture hors limites
2. **Double free:** libérer deux fois le même pointeur
3. **Fuite mémoire:** ne pas libérer la mémoire allouée
4. **Fragmentation:** tas fragmenté sans grand bloc disponible

## Extensions Possibles

- Algorithme best-fit (chercher le plus petit bloc suffisant)
- Compactage du tas (défragmentation)
- Pools de mémoire (blocs de taille fixe)
- Garbage collector simple
- Statistiques d'utilisation mémoire
