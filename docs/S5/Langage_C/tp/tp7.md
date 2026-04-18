---
title: "TP7 - Gestionnaire de Memoire Dynamique Personnalise"
sidebar_position: 7
---

# TP7 - Gestionnaire de Memoire Dynamique Personnalise

## Objectifs
- Comprendre le fonctionnement interne de `malloc()` et `free()`
- Implementer un allocateur de memoire personnalise
- Gerer un tas (heap) avec des descripteurs de blocs
- Manipuler des listes chainees de zones memoire
- Deboguer les fuites et corruptions memoire

## Concept : Allocateur de Memoire

Les fonctions `malloc()` et `free()` gerent l'allocation dynamique de memoire.
Ce TP implemente ces fonctions pour comprendre leur fonctionnement.

### Principe
```
[Heap de 1 000 000 octets]
|
+--[Descripteur1]--[Donnees1]--[Descripteur2]--[Donnees2]--[Libre]--+
```

Chaque bloc alloue a :
- Un **descripteur** contenant : taille, statut (LIBRE/OCCUPE), pointeur vers le suivant
- Une **zone de donnees** de la taille demandee

## Structure de Donnees

```c noexec
typedef enum {LIBRE, OCCUPE} Statut_memoire;

typedef struct descript {
    size_t size;              /* Taille du bloc en octets */
    Statut_memoire statut;    /* Libre ou occupe */
    struct descript *suiv;    /* Chainage vers le bloc suivant */
} Descript_mem;
```

## Fonctions a Implementer

### Allocation
- `Mon_malloc(size)` - Alloue un bloc de taille donnee
  - Cherche un bloc libre suffisant (first-fit)
  - Decoupe le bloc si necessaire
  - Marque le bloc comme OCCUPE
  - Retourne un pointeur vers la zone de donnees

### Liberation
- `Mon_free(ptr)` - Libere un bloc alloue
  - Marque le bloc comme LIBRE
  - Fusionne avec les blocs libres adjacents (coalescence)

### Autres Fonctions
- `Mon_calloc(count, size)` - Alloue et initialise a zero
- `Mon_realloc(ptr, new_size)` - Realloue avec une nouvelle taille
- `stat_memoire_dyn()` - Affiche la cartographie memoire (debogage)

## Algorithmes

### First-Fit (Mon_malloc)
```
Pour chaque bloc du heap:
    Si bloc.statut == LIBRE ET bloc.size >= taille_demandee:
        Si bloc.size > taille_demandee + taille_min:
            Decouper le bloc en deux (alloue + reste libre)
        Marquer le bloc comme OCCUPE
        Retourner pointeur vers les donnees
Echec: plus de memoire disponible
```

### Coalescence (Mon_free)
```
Marquer le bloc comme LIBRE
Si le bloc suivant est LIBRE:
    Fusionner les deux blocs (additionner les tailles)
Parcourir pour fusionner avec le precedent si LIBRE
```

## Compilation et Execution

```bash
cd tp7/src
make
./main
```

## Mode Debogage

Le fichier `myalloc.h` contient des flags :

```c noexec
#define DEBUG           /* Affiche les messages de debogage */
#define ALLOC_PERSO     /* Utilise Mon_malloc au lieu de malloc */
```

Decommenter `DEBUG` pour voir les operations d'allocation/liberation.

## Exemple d'Utilisation

```c noexec
#include "myalloc.h"

int main() {
    /* malloc est automatiquement remplace par Mon_malloc */
    int *tab = malloc(10 * sizeof(int));
    
    /* Afficher l'etat du tas */
    stat_memoire_dyn();
    
    /* Liberation */
    free(tab);
    
    return 0;
}
```

## Points Importants

### 1. Arithmetique de Pointeurs
```c noexec
/* Calculer l'adresse des donnees apres le descripteur */
void *donnees = (void*)((char*)descripteur + sizeof(Descript_mem));
```

### 2. Retrouver le Descripteur depuis un Pointeur
```c noexec
/* L'utilisateur a un pointeur vers les donnees */
/* Le descripteur est juste avant */
Descript_mem *desc = (Descript_mem*)((char*)ptr - sizeof(Descript_mem));
```

### 3. Coalescence de Blocs
```c noexec
if (bloc->suiv != NULL && bloc->suiv->statut == LIBRE) {
    bloc->size += sizeof(Descript_mem) + bloc->suiv->size;
    bloc->suiv = bloc->suiv->suiv;
}
```

### 4. Fragmentation
La memoire peut se fragmenter (plein de petits blocs libres non contigus).
Solutions : coalescence, compactage (non implemente ici).

## Tests a Effectuer

1. **Allocation simple :** `malloc(100)`, verifier l'etat
2. **Allocations multiples :** plusieurs `malloc()` successifs
3. **Liberation :** `free()` et verifier la coalescence
4. **Reallocation :** `realloc()` avec taille plus grande/petite
5. **Cas limites :** allocation de 0, liberation de NULL
6. **Fuites memoire :** oublier `free()` et observer

## Concepts C Abordes

- Gestion du tas (heap)
- Arithmetique de pointeurs
- Structures chainees
- Macros de remplacement (`#define malloc Mon_malloc`)
- Compilation conditionnelle (`#ifdef DEBUG`)
- `size_t` (type pour les tailles)
- Cast de pointeurs generiques (`void*`)

## Problemes Courants

1. **Corruption de tas :** ecriture hors limites
2. **Double free :** liberer deux fois le meme pointeur
3. **Fuite memoire :** ne pas liberer la memoire allouee
4. **Fragmentation :** tas fragmente sans grand bloc disponible

## Extensions Possibles

- Algorithme best-fit (chercher le plus petit bloc suffisant)
- Compactage du tas (defragmentation)
- Pools de memoire (blocs de taille fixe)
- Garbage collector simple
- Statistiques d'utilisation memoire
