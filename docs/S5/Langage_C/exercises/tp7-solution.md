---
title: "TP7 - Gestionnaire de Memoire Dynamique Personnalise"
sidebar_position: 7
---

# TP7 - Gestionnaire de Memoire Dynamique Personnalise

> Following teacher instructions from: `S5/Langage_C/data/moodle/tp/tp7/README.md`

## Contexte

Ce TP implemente un allocateur de memoire personnalise qui remplace `malloc()` et `free()` pour comprendre leur fonctionnement interne. Le tas est simule par un tableau de caracteres de 1 000 000 octets.

**Principe :**
```
[Heap de 1 000 000 octets]
|
+--[Descripteur1]--[Donnees1]--[Descripteur2]--[Donnees2]--[Libre]--+
```

Chaque bloc alloue a :
- Un **descripteur** contenant : taille, statut (LIBRE/OCCUPE), pointeur vers le suivant
- Une **zone de donnees** de la taille demandee

---

## Exercice 1

### Definir les structures de donnees -- myalloc.h avec le descripteur de bloc, les macros de remplacement et les prototypes

**Answer:**

```c noexec
#include <stdio.h>
#include <stddef.h>

#ifndef MYALLOC_H
#define MYALLOC_H

/*
 * Parametrage du module
 */
/* Commenter cette ligne pour ne plus afficher les messages de debug */
#define DEBUG

/* Commenter cette ligne pour utiliser les fonctions d'allocation standard du C */
#define ALLOC_PERSO

#ifdef ALLOC_PERSO
#define malloc(size) Mon_malloc(size)
#define free(ptr) Mon_free(ptr)
#define calloc(n,size) Mon_calloc(n,size)
#define realloc(ptr,new_size) Mon_realloc(ptr,new_size)
#endif

/*
 * Taille du tas en octets
 */
#define MAX_MEMORY 1000000

/*
 * Nature occupee ou libre d'une zone memoire
 */
typedef enum { LIBRE, OCCUPE } Statut_memoire;

/*
 * Structure de descripteur de bloc memoire
 */
typedef struct descript {
    size_t size;           /* sa taille en octets           */
    Statut_memoire statut; /* il est libre ou occupe        */
    struct descript *suiv;  /* chainage vers le bloc suivant */
} Descript_mem;

/* Si diagnostic ptr NULL on arrete (exit) ou on continue */
typedef enum { ARRET, CONTINUER } Diag_ptr;

/*
 * Prototypes des fonctions exportables
 */
void test_pointeur(void * t, Diag_ptr d);
void stat_memoire_dyn();
void *Mon_malloc(size_t nb_octets);
void Mon_free(void* ptr);
void *Mon_calloc(size_t count, size_t size);
void *Mon_realloc(void* ptr, size_t size);

#endif /* MYALLOC_H */
```

**Diagramme memoire du tas :**

```
mon_tas[0]                                              mon_tas[999999]
|                                                              |
v                                                              v
+------------+------------------+------------+------------------+
| Descript_1 |   Donnees_1      | Descript_2 |   Donnees_2      |
| size=100   |   (100 octets)   | size=Rest  |   (Libre)        |
| OCCUPE     |                  | LIBRE      |                  |
| suiv=Desc2 |                  | suiv=NULL  |                  |
+------------+------------------+------------+------------------+
```

---

## Exercice 2

### Implementer `Mon_malloc()` -- Algorithme first-fit pour trouver un bloc libre suffisant

**Algorithme First-Fit :**
```
Pour chaque bloc du heap:
    Si bloc.statut == LIBRE ET bloc.size >= taille_demandee:
        Si bloc.size > taille_demandee + taille_min:
            Decouper le bloc en deux (alloue + reste libre)
        Marquer le bloc comme OCCUPE
        Retourner pointeur vers les donnees
Echec: plus de memoire disponible
```

**Answer:**

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stddef.h>
#include <stdarg.h>

#include "myalloc.h"

/*
 * Espace memoire reserve pour l'allocation dynamique
 * Declare en static pour eviter tout acces hors des fonctions du module
 */
static char mon_tas[MAX_MEMORY];
static Descript_mem *liste_bloc_mem = (Descript_mem *) mon_tas;

/* Fonctions static de service */
static int statut_zone(Descript_mem *zone, Statut_memoire statut);
static int indice_ptr(char *ptr);
static void init_memoire_dyn();
static void decoupe_bloc(Descript_mem *bloc_courant, size_t nb_octets);
static void etend_bloc(Descript_mem *bloc_courant, size_t nb_octets);
static void regroupement_libre();
static int est_dans_tas(void* ptr);
static Descript_mem *ptr_descripteur(void *ptr_data);

/*
 * Fonction variadique pour n'afficher les messages de debug
 * que si DEBUG est defini
 */
void debug_print(char *format, ...) {
#ifdef DEBUG
    va_list args;
    va_start(args, format);
    vfprintf(stdout, format, args);
    va_end(args);
#endif
}

/*
 * Cartographie memoire -- affiche l'etat de chaque zone du tas
 */
void stat_memoire_dyn() {
    Descript_mem *curr;
    int cpt = 0;
    long taille_totale = 0;
    curr = liste_bloc_mem;
#ifdef ALLOC_PERSO
    debug_print("debut statistique !\n");
    fprintf(stdout, "----------------------------------------------------\n");
    fprintf(stdout, "!          debut cartographie memoire              !\n");
    fprintf(stdout, "----------------------------------------------------\n");
    while (curr != NULL) {
        fprintf(stdout, "zone n%d\n", cpt++);
        fprintf(stdout, "\tla zone est %s\n",
                ((statut_zone(curr, LIBRE)) ? "LIBRE" : "OCCUPE"));
        fprintf(stdout, "\ttaille de la zone utile : %ld octets\n", curr->size);
        fprintf(stdout, "\ttaille de la zone avec service : %ld octets\n",
                curr->size + sizeof(Descript_mem));
        fprintf(stdout, "\tindice zone memoire [%d, %d]\n",
                indice_ptr((char *) (curr + 1)),
                indice_ptr(((char *) (curr + 1)) + curr->size - 1));
        taille_totale += sizeof(Descript_mem) + curr->size;
        curr = curr->suiv;
    }
    fprintf(stdout, "taille totale de la memoire dynamique : %ld octets\n",
            taille_totale);
    debug_print("fin statistique !\n");
#endif
}

static int statut_zone(Descript_mem *zone, Statut_memoire statut) {
    return (zone->statut == statut);
}

static int indice_ptr(char *ptr) {
    int result = -1;
    if (ptr != (char *) NULL) {
        result = (int) (ptr - mon_tas);
        if ((result < 0) || (result >= MAX_MEMORY))
            result = -1;
    }
    return (result);
}

/*
 * Initialisation de la structure du 1er grand bloc libre
 */
static void init_memoire_dyn() {
    liste_bloc_mem->size = MAX_MEMORY - sizeof(Descript_mem);
    liste_bloc_mem->statut = LIBRE;
    liste_bloc_mem->suiv = (Descript_mem *)NULL;
    debug_print("initialisation memoire dynamique effectuee !\n");
}

/*
 * Decoupe un bloc libre en 2 :
 *  - le premier sera un bloc de nb_octets utiles avec statut OCCUPE
 *  - le 2eme sera un bloc de la taille du reste avec statut LIBRE
 */
static void decoupe_bloc(Descript_mem *bloc_courant, size_t nb_octets) {
    size_t nb_octet_total = nb_octets + sizeof(Descript_mem);

    /* Creation du nouveau bloc place derriere le bloc_courant */
    /* Cast en (char *) pour l'arithmetique en octets */
    Descript_mem *nouveau_bloc =
        (Descript_mem *)((char *)bloc_courant + nb_octet_total);
    debug_print("decoupage d'un bloc en 2 : %d et %d!\n",
                (int)nb_octets,
                (int)((bloc_courant->size) - nb_octets - sizeof(Descript_mem)));

    /* Initialisation du nouveau bloc (libre) */
    nouveau_bloc->size =
        (bloc_courant->size) - nb_octets - sizeof(Descript_mem);
    nouveau_bloc->statut = LIBRE;
    nouveau_bloc->suiv = bloc_courant->suiv;

    /* Mise a jour du bloc courant (occupe) */
    bloc_courant->size = nb_octets;
    bloc_courant->statut = OCCUPE;
    bloc_courant->suiv = nouveau_bloc;
}

/*
 * Mon_malloc -- remplace malloc de la stdlib
 */
void *Mon_malloc(size_t nb_octets) {
    void *resultat;
    Descript_mem *curr, *prev;
    static int cpt = 0;

    if (!cpt) {
        /* 1ere allocation dynamique => initialisation du tas */
        init_memoire_dyn();
        cpt++;
    }
    if (nb_octets == 0)
        resultat = (void *) NULL;
    else {
        /* Parcours de la liste chainee des descripteurs */
        curr = liste_bloc_mem;

        /* Recherche d'une zone libre de taille suffisante (first-fit) */
        while (((curr->size) < nb_octets || statut_zone(curr, OCCUPE))
               && (curr->suiv != NULL)) {
            prev = curr;
            curr = curr->suiv;
        }
        debug_print("Mon_alloc : on veut %d octets, bloc libre de %ld octets\n",
                    (int) nb_octets, curr->size);

        /* Zone trouvee ou plus de place */
        if ((curr->size) == nb_octets) {
            /* Zone de taille exacte */
            curr->statut = OCCUPE;
            resultat = (void *) (++curr);
            debug_print("Mon_alloc : taille exacte\n");
        } else if ((curr->size) > (nb_octets + sizeof(Descript_mem))) {
            /* Bloc plus grand => decoupe */
            decoupe_bloc(curr, nb_octets);
            resultat = (void *) (++curr);
            debug_print("Mon_alloc : bloc decoupe en 2\n");
        } else {
            /* Plus assez d'espace */
            resultat = NULL;
            debug_print("Mon_alloc() : plus assez d'espace\n");
        }
    }
    return (resultat);
}
```

**Arithmetique de pointeurs cle :**

```c noexec
/* Calculer l'adresse des donnees apres le descripteur */
void *donnees = (void*)((char*)descripteur + sizeof(Descript_mem));

/* Equivalent plus simple : */
void *donnees = (void*)(descripteur + 1);
/* Car descripteur+1 avance de sizeof(Descript_mem) octets */
```

---

## Exercice 3

### Implementer `Mon_free()` -- Liberer un bloc et fusionner les blocs libres adjacents (coalescence)

**Algorithme :**
```
Marquer le bloc comme LIBRE
Parcourir le tas pour fusionner les blocs libres adjacents
```

**Answer:**

```c noexec
/*
 * Verifie si un pointeur est dans la zone du tas
 */
static int est_dans_tas(void* ptr) {
    return (((void*)mon_tas <= ptr) && (ptr < (void*)(mon_tas + MAX_MEMORY)));
}

/*
 * Retrouve le descripteur a partir du pointeur vers les donnees
 * Le descripteur est juste AVANT la zone de donnees
 */
static Descript_mem *ptr_descripteur(void *ptr_data) {
    Descript_mem* resultat = (Descript_mem*) ptr_data;
    --resultat;  /* Recule de sizeof(Descript_mem) octets */
    return (resultat);
}

/*
 * Regroupement des blocs libres adjacents (coalescence)
 */
static void regroupement_libre() {
    Descript_mem *curr, *prev;
    curr = liste_bloc_mem;
    debug_print("debut regroupement !\n");

    while ((curr->suiv) != NULL) {
        if ((statut_zone(curr, LIBRE)) && (statut_zone(curr->suiv, LIBRE))) {
            debug_print("regroupement zones (%ld + %ld + %ld = %ld octets)\n",
                    curr->size, curr->suiv->size, sizeof(Descript_mem),
                    curr->size + curr->suiv->size + sizeof(Descript_mem));
            /* Fusionne : ajoute taille du suivant + taille du descripteur */
            curr->size += (curr->suiv->size) + sizeof(Descript_mem);
            curr->suiv = curr->suiv->suiv;
        } else {
            /* On ne progresse que si on n'a pas fusionne
             * (car apres fusion, le suivant pourrait aussi etre libre) */
            if (curr->suiv != NULL) {
                prev = curr;
                curr = curr->suiv;
            }
        }
    }
    debug_print("fin regroupement !\n");
}

/*
 * Mon_free -- remplace free de la stdlib
 */
void Mon_free(void* ptr) {
    Descript_mem* descriptor = NULL;

    debug_print("Mon_free() : debut free\n");

    /* free(NULL) est valide et ne fait rien */
    if (ptr == NULL) {
        debug_print("Mon_free() : Pointer is null.");
        return;
    }

    /* Verifie que le pointeur est bien dans le tas */
    if (!est_dans_tas(ptr)) {
        debug_print("Mon_free() : Pointer not on heap. Abort.");
        return;
    }

    /* Recupere le descripteur */
    descriptor = ptr_descripteur(ptr);
    if (descriptor == NULL) {
        debug_print("Mon_free() : Could not get descriptor. Abort.");
        return;
    }

    /* Verifie que la zone n'est pas deja libre */
    if (statut_zone(descriptor, LIBRE)) {
        debug_print("Mon_free() : Area already free. Abort.");
        return;
    }

    /* Libere la zone */
    descriptor->statut = LIBRE;

    /* Fusionne les blocs libres adjacents */
    regroupement_libre();

    debug_print("Mon_free() : fin free\n");
}
```

**Diagramme de coalescence :**

```
Avant free(p2) :
+----------+------+----------+------+----------+------+
| Desc1    | Data1| Desc2    | Data2| Desc3    | Data3|
| OCCUPE   |      | OCCUPE   |      | LIBRE    |      |
+----------+------+----------+------+----------+------+

Apres free(p2) :
+----------+------+----------+------+----------+------+
| Desc1    | Data1| Desc2    | Data2| Desc3    | Data3|
| OCCUPE   |      | LIBRE    |      | LIBRE    |      |
+----------+------+----------+------+----------+------+

Apres regroupement_libre() :
+----------+------+----------+-------------------------------+
| Desc1    | Data1| Desc2    | Data2 + Data3 (fusionnes)     |
| OCCUPE   |      | LIBRE    | size = old_size2 + desc3 + size3 |
+----------+------+----------+-------------------------------+
```

---

## Exercice 4

### Implementer `Mon_calloc()` -- Allouer et initialiser a zero

**Answer:**

```c noexec
/*
 * Mon_calloc -- remplace calloc de la stdlib
 * Alloue count*size octets et les initialise a zero
 */
void *Mon_calloc(size_t count, size_t size) {
    void *resultat = (void *) NULL;
    char* manipulation_pointer = (char*) NULL;
    unsigned int scan_index = 0;

    debug_print("Mon_calloc() : debut calloc\n");

    /* Verifie si count ou size est nul */
    if (count * size == 0) {
        debug_print("Mon_calloc() : count or size is null.");
        return NULL;
    }

    /* Alloue avec Mon_malloc */
    resultat = Mon_malloc(count * size);
    if (resultat == NULL) {
        debug_print("Mon_calloc() : underlying malloc failed. Abort.");
        return NULL;
    }

    /* Initialise a zero */
    manipulation_pointer = (char*)resultat;
    for (scan_index = 0; scan_index < count * size; scan_index++)
        *(manipulation_pointer + scan_index) = 0;

    debug_print("Mon_calloc() : fin calloc\n");

    return (resultat);
}
```

---

## Exercice 5

### Implementer `Mon_realloc()` -- Reallouer avec une nouvelle taille

**Cas a gerer :**
1. `ptr == NULL` : se comporte comme `malloc(newsize)`
2. `newsize == 0` : se comporte comme `free(ptr)`
3. `newsize < size` : decouper le bloc
4. `newsize > size` et le bloc suivant est libre et suffisant : etendre
5. `newsize > size` sinon : allouer nouveau, copier, liberer ancien

**Answer:**

```c noexec
/*
 * Extension d'un bloc occupe en utilisant le bloc libre suivant
 */
static void etend_bloc(Descript_mem *bloc_courant, size_t nb_octets) {
    size_t taille_suiv = bloc_courant->suiv->size;
    Descript_mem *bloc_suiv = bloc_courant->suiv->suiv;

    if (nb_octets == bloc_courant->suiv->size) {
        /* Cas particulier : taille exacte */
        bloc_courant->size += nb_octets + sizeof(Descript_mem);
        bloc_courant->statut = OCCUPE;
        bloc_courant->suiv = bloc_suiv;
    } else {
        /* Creation d'un nouveau bloc libre reduit */
        Descript_mem *nouveau_bloc =
            (Descript_mem *) ((char *) bloc_courant->suiv + nb_octets);
        debug_print("extension d'un bloc de %d a %d!\n",
                    (int)bloc_courant->size,
                    (int)(bloc_courant->size + nb_octets));

        nouveau_bloc->size = taille_suiv - nb_octets;
        nouveau_bloc->statut = LIBRE;
        nouveau_bloc->suiv = bloc_suiv;

        bloc_courant->size += nb_octets;
        bloc_courant->statut = OCCUPE;
        bloc_courant->suiv = nouveau_bloc;
    }
}

/*
 * Mon_realloc -- remplace realloc de la stdlib
 */
void *Mon_realloc(void *ptr, size_t newsize) {
    void *resultat = (void *) NULL;
    Descript_mem* descriptor = NULL;
    unsigned int scan_index = 0;

    debug_print("Mon_realloc() : debut realloc\n");

    /* Si ptr est NULL, faire un simple malloc */
    if (ptr == NULL) {
        debug_print("Mon_realloc() : ptr is null, doing malloc");
        return Mon_malloc(newsize);
    }

    /* Si size est 0 et ptr non NULL, liberer */
    if (newsize == 0 && ptr != NULL) {
        debug_print("Mon_realloc() : size is null. Free.");
        Mon_free(ptr);
        return NULL;
    }

    /* Verifie que le pointeur est dans le tas */
    if (!est_dans_tas(ptr)) {
        debug_print("Mon_realloc() : pointer not in heap. Abort.");
        return NULL;
    }

    /* Recupere le descripteur */
    descriptor = ptr_descripteur(ptr);
    if (descriptor == NULL) {
        debug_print("Mon_realloc() : could not get descriptor. Abort.");
        return NULL;
    }

    /* Si la zone est libre, erreur */
    if (statut_zone(descriptor, LIBRE)) {
        debug_print("Mon_realloc() : area was marked as free. Abort.");
        return NULL;
    }

    if (newsize < descriptor->size) {
        /* Reduire le bloc par decoupage */
        debug_print("Mon_realloc() : splitting to reduce");
        decoupe_bloc(descriptor, newsize);
        regroupement_libre();
        resultat = ptr;
    } else {
        /* Augmenter le bloc */
        debug_print("Mon_realloc() : extending...");

        if (descriptor->suiv == NULL
            || descriptor->suiv->statut == OCCUPE
            || descriptor->suiv->size < (newsize - descriptor->size)) {
            /* Pas de bloc libre adjacent suffisant : nouvelle allocation */
            debug_print("Mon_realloc() : ...by new allocation");
            resultat = Mon_malloc(newsize);
            if (resultat == NULL) {
                debug_print("Mon_realloc() : Underlying malloc failed.");
                return NULL;
            }

            /* Copie les anciennes donnees */
            for (scan_index = 0; scan_index < descriptor->size; scan_index++)
                *(((int*)resultat) + scan_index) =
                    *(((int*)ptr) + scan_index);

            /* Libere l'ancien bloc */
            free(ptr);
            regroupement_libre();
        } else {
            /* Extension en fusionnant avec le bloc libre suivant */
            debug_print("Mon_realloc() : ...by merging");
            descriptor->statut = LIBRE;
            regroupement_libre();
            descriptor->statut = OCCUPE;
            resultat = ptr;
        }
    }

    debug_print("Mon_realloc() : fin realloc\n");

    return (resultat);
}
```

---

## Exercice 6

### Fonctions de test et programme principal

**Answer pour test.h :**

```c noexec
#include <stdio.h>
#include <stddef.h>

#ifndef TEST_H
#define TEST_H

typedef enum { MALLOC, CALLOC, REALLOC } Type_test;

void procedure_test(Type_test t, int nb);

#endif /* TEST_H */
```

**Answer pour test.c (extraits des procedures de test) :**

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include "myalloc.h"
#include "test.h"

/*
 * Test 1 : allocations et liberations multiples
 */
static void test_malloc_1() {
    int * p, *r, *k;
    char *q, *w;

    p = (int *)malloc(100 * sizeof(int));
    test_pointeur((void *) p, CONTINUER);
    stat_memoire_dyn();

    q = (char *)malloc(250 * sizeof(char));
    test_pointeur((void *) q, CONTINUER);
    stat_memoire_dyn();

    r = (int *)malloc(1000 * sizeof(int));
    test_pointeur((void *) r, CONTINUER);
    stat_memoire_dyn();

    free(p);
    stat_memoire_dyn();

    w = (char *)malloc(700);
    test_pointeur((void *) w, CONTINUER);
    stat_memoire_dyn();

    free(r);
    stat_memoire_dyn();

    k = (int *)malloc(1000 * sizeof(int));
    test_pointeur((void *) k, CONTINUER);
    stat_memoire_dyn();

    free(q);
    stat_memoire_dyn();

    free(w);
    stat_memoire_dyn();

    free(k);
    stat_memoire_dyn();
    printf("Allocations et deallocations reussies!");
}

/*
 * Test 2 : depassement de la taille allouable
 */
static void test_malloc_2() {
    char *q, *w;

    printf("Premier MALLOC\n");
    q = (char *)malloc((MAX_MEMORY / 2) * sizeof(char));
    test_pointeur((void *) q, CONTINUER);
    stat_memoire_dyn();

    printf("Deuxieme MALLOC\n");
    w = (char *)malloc((MAX_MEMORY / 2) * sizeof(char));
    test_pointeur((void *) w, CONTINUER);
    stat_memoire_dyn();

    printf("Freeing Malloc\n");
    free(q);
    stat_memoire_dyn();

    printf("Allocations et deallocations reussies!\n");
}

/* ... (test_calloc_1, test_calloc_2, test_realloc_1..4 similaires) ... */

void procedure_test(Type_test t, int nb) {
    switch (t) {
        case MALLOC:
            switch (nb) {
                case 1: test_malloc_1(); break;
                case 2: test_malloc_2(); break;
            }
            break;
        case CALLOC:
            switch (nb) {
                case 1: test_calloc_1(); break;
                case 2: test_calloc_2(); break;
            }
            break;
        case REALLOC:
            switch (nb) {
                case 1: test_realloc_1(); break;
                case 2: test_realloc_2(); break;
                case 3: test_realloc_3(); break;
                case 4: test_realloc_4(); break;
            }
            break;
    }
}
```

**Answer pour main.c :**

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include "myalloc.h"
#include "test.h"

int main() {
    /* MALLOC 1, 2 */
    /* CALLOC 1, 2 */
    /* REALLOC 1, 2, 3, 4 */
    procedure_test(MALLOC, 1);
    procedure_test(MALLOC, 2);
    procedure_test(CALLOC, 1);
    procedure_test(CALLOC, 2);
    procedure_test(REALLOC, 1);
    procedure_test(REALLOC, 2);
    procedure_test(REALLOC, 3);
    procedure_test(REALLOC, 4);
    exit(1);
}
```

**Makefile:**

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g

TARGET = main
SOURCES = main.c myalloc.c test.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f $(OBJECTS) $(TARGET)

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
```

**Compilation:**

```bash
cd tp7/src
make
./main
```

**Expected output (extrait, avec DEBUG active) :**

```
initialisation memoire dynamique effectuee !
Mon_alloc : on veut 400 octets, bloc libre de 999976 octets
decoupage d'un bloc en 2 : 400 et 999552!
Mon_alloc : bloc decoupe en 2
----------------------------------------------------
!          debut cartographie memoire              !
----------------------------------------------------
zone n0
	la zone est OCCUPE
	taille de la zone utile : 400 octets
zone n1
	la zone est LIBRE
	taille de la zone utile : 999552 octets
...
```

---

## Mode debug

Le fichier `myalloc.h` contient des flags de compilation conditionnelle :

```c noexec
#define DEBUG           /* Affiche les messages de debogage */
#define ALLOC_PERSO     /* Utilise Mon_malloc au lieu de malloc */
```

- Commenter `DEBUG` pour desactiver les messages de debogage
- Commenter `ALLOC_PERSO` pour utiliser les fonctions standard du C

---

## Tests a effectuer

1. **Allocation simple :** `malloc(100)`, verifier l'etat avec `stat_memoire_dyn()`
2. **Allocations multiples :** plusieurs `malloc()` successifs
3. **Liberation :** `free()` et verifier la coalescence
4. **Reallocation :** `realloc()` avec taille plus grande/petite
5. **Cas limites :** allocation de 0, liberation de NULL
6. **Depassement :** allouer plus que `MAX_MEMORY`

---

## Points importants

1. **Arithmetique de pointeurs :**
   ```c noexec
   /* Retrouver le descripteur depuis un pointeur utilisateur */
   Descript_mem *desc = (Descript_mem*)ptr - 1;
   /* Equivalent a : (Descript_mem*)((char*)ptr - sizeof(Descript_mem)) */
   ```

2. **Coalescence :** Apres chaque `free()`, fusionner les blocs libres adjacents pour eviter la fragmentation

3. **Compilation conditionnelle :** `#ifdef DEBUG` permet d'activer/desactiver le debogage sans modifier le code

4. **Macros de remplacement :** `#define malloc(size) Mon_malloc(size)` redirige transparentement tous les appels a `malloc` vers notre implementation

5. **Fragmentation :** Sans coalescence, le tas se fragmenterait en petits blocs libres non contigus, rendant impossible l'allocation de gros blocs meme si la memoire totale libre est suffisante
