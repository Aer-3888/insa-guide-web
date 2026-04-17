---
title: "Chapitre 7 : Preprocesseur et Compilation"
sidebar_position: 7
---

# Chapitre 7 : Preprocesseur et Compilation

## 7.1 Directives du preprocesseur

Le preprocesseur transforme le code AVANT la compilation. Ses directives commencent par `#`.

### #include - Inclusion de fichiers

```c noexec
#include <stdio.h>     /* Bibliotheque standard (repertoires systeme) */
#include <stdlib.h>    /* malloc, free, exit, rand, ... */
#include <string.h>    /* strlen, strcpy, strcmp, ... */
#include <math.h>      /* sqrt, pow, sin, cos, ... (compiler avec -lm) */
#include <limits.h>    /* INT_MAX, INT_MIN, ... */
#include <time.h>      /* time, pour srand */
#include <ctype.h>     /* tolower, toupper, isdigit, ... */
#include <stddef.h>    /* size_t, ptrdiff_t */
#include <stdarg.h>    /* va_list, va_start, va_end (fonctions variadiques) */

#include "tache.h"     /* Fichier local (repertoire courant) */
#include "Liste.h"     /* Les guillemets cherchent dans le projet d'abord */
```

### #define - Constantes et macros

```c noexec
/* Constantes symboliques */
#define LGMAX 64
#define NMAXPRED 16
#define MAXTACHES 64
#define MAX_MEMORY 1000000
#define TMAX 500

/* Macros avec parametres */
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define CARRE(x) ((x) * (x))

/* PIEGE : toujours parentheser les arguments ! */
#define MAUVAIS(x) x * x
MAUVAIS(2 + 3)  /* Se developpe en : 2 + 3 * 2 + 3 = 11 (pas 25 !) */

#define BON(x) ((x) * (x))
BON(2 + 3)      /* Se developpe en : ((2 + 3) * (2 + 3)) = 25 */
```

### Macros de redirection (TP7)

```c noexec
/* Remplacer les fonctions standard par des versions personnalisees */
#ifdef ALLOC_PERSO
#define malloc(size)        Mon_malloc(size)
#define free(ptr)           Mon_free(ptr)
#define calloc(n, size)     Mon_calloc(n, size)
#define realloc(ptr, size)  Mon_realloc(ptr, size)
#endif

/* Tout code qui appelle malloc() appelle en fait Mon_malloc() */
```

### Compilation conditionnelle

```c noexec
/* Activer/desactiver des fonctionnalites */
#define DEBUG

#ifdef DEBUG
    printf("Variable x = %d\n", x);  /* Compile uniquement si DEBUG est defini */
#endif

/* Fonction de debug variadique (TP7) */
void debug_print(char *format, ...) {
#ifdef DEBUG
    va_list args;
    va_start(args, format);
    vfprintf(stdout, format, args);
    va_end(args);
#endif
}
```

### Protection contre les inclusions multiples

```c noexec
/* TOUJOURS dans les fichiers .h */
#ifndef TACHE_H
#define TACHE_H

/* Contenu du fichier d'en-tete */
typedef struct { ... } Tache;
void afficheTache(Tache *t);

#endif /* TACHE_H */

/* Sans cette protection, inclure tache.h deux fois causerait des erreurs
   de redefinition de type */
```

### Constantes mathematiques (portabilite)

```c noexec
/* Necessaire sur Windows pour M_PI et M_E */
#define _USE_MATH_DEFINES
#include <math.h>

/* Securite supplementaire */
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

#ifndef M_E
#define M_E 2.71828182845904523536
#endif
```

## 7.2 Compilation separee

### Principe : separer declaration et implementation

```
tache.h        tache.c         main.c
+-----------+  +------------+  +------------+
| typedef   |  | #include   |  | #include   |
| struct    |  | "tache.h"  |  | "tache.h"  |
| Tache;    |  |            |  |            |
|           |  | void saisie|  | int main() |
| void      |  | Tache(...) |  | {          |
| saisie    |  | {          |  |   Tache t; |
| Tache();  |  |   /* ... */|  |   saisie   |
|           |  | }          |  |   Tache(&t)|
| void      |  |            |  | }          |
| affiche   |  | void       |  +------------+
| Tache();  |  | affiche    |
+-----------+  | Tache(...) |
               | {          |
               |   /* ... */|
               | }          |
               +------------+
```

**Avantages :**
1. Compilation incrementale (recompile seulement ce qui a change)
2. Reutilisation du code (modules independants)
3. Separation interface / implementation
4. Travail en equipe (chacun son module)

### Fichier .h (interface)

```c noexec
/* tache.h - NE contient QUE : */
/* - Protection d'inclusion */
/* - #include necessaires */
/* - #define (constantes) */
/* - typedef (types) */
/* - Prototypes de fonctions */

#ifndef TACHE_H
#define TACHE_H

#include <stdio.h>
#include <stdlib.h>

#define LGMAX 64
#define NMAXPRED 16
#define MAXTACHES 64

typedef struct {
    int no;
    int duree;
    int nbPred;
    int pred[NMAXPRED];
    char titre[LGMAX];
} Tache;

/* Prototypes */
void saisieTache(Tache *t, FILE *f);
void afficheTache(Tache *t);
int lireTachesFichier(char *nomFichier, Tache *tab);
int ecrireTachesFichier(char *nomFichier, Tache *tab_t, int nbTaches);

#endif
```

### Fichier .c (implementation)

```c noexec
/* tache.c - Contient l'implementation */
#include "tache.h"  /* Inclut ses propres declarations */

void saisieTache(Tache *t, FILE *f) {
    fscanf(f, "%d %d %d", &(t->no), &(t->duree), &(t->nbPred));
    /* ... */
}

void afficheTache(Tache *t) {
    printf("Tache n%d: %s\n", t->no, t->titre);
    /* ... */
}
```

### Etapes de compilation

```
Source (.c)  -->  Preprocesseur  -->  Compilateur  -->  Assembleur  -->  Linker
                  (#include,          code objet        .o files        executable
                   #define)           (instructions)
```

```bash
# Etape par etape :
gcc -E tache.c > tache.i          # Preprocesseur seulement
gcc -S tache.c                     # Compile en assembleur (.s)
gcc -c tache.c                     # Compile en objet (.o)
gcc -c main.c                      # Compile en objet (.o)
gcc -o programme main.o tache.o    # Edition de liens (linker)

# En une commande :
gcc -Wall -Wextra -std=c11 -g -o programme main.c tache.c -lm
```

## 7.3 Makefiles

### Structure d'un Makefile

```makefile
# Variables
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g
LDFLAGS = -lm

TARGET = main
SOURCES = main.c tache.c
OBJECTS = $(SOURCES:.c=.o)    # Remplace .c par .o : main.o tache.o

# Cible par defaut
all: $(TARGET)

# Regle de construction de l'executable
$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

# Regle generique : .c -> .o
%.o: %.c
	$(CC) $(CFLAGS) -c $<

# Nettoyage
clean:
	rm -f $(OBJECTS) $(TARGET)

# Compilation + execution
run: $(TARGET)
	./$(TARGET)

# Ces cibles ne sont pas des fichiers
.PHONY: all clean run
```

### Variables automatiques

| Variable | Signification |
|----------|---------------|
| `$@` | Nom de la cible |
| `$^` | Toutes les dependances |
| `$<` | Premiere dependance |
| `$*` | Partie matchee par `%` |

### Makefile TP6 (multi-cibles complexe)

```makefile
CC = gcc
FLAGS = --std=c90 -Wall -Wextra -pedantic-errors
SOURCES = traitement.c principal.c traitementOpt.c automaton.c fichier.c
OBJECTS = obj/traitement.o obj/automaton.o obj/principal.o obj/traitementOpt.o obj/fichier.o

gedcom: $(OBJECTS)
	$(CC) $(FLAGS) $^ -o $@

obj:
	mkdir obj

obj/fichier.o: fichier.c fichier.h commun.h obj
	$(CC) $(FLAGS) -c fichier.c -o obj/fichier.o

obj/principal.o: principal.c fichier.h traitement.h commun.h traitementOpt.h obj
	$(CC) $(FLAGS) -c principal.c -o obj/principal.o

clean:
	rm -f obj/*.o
	rmdir obj
	rm -f gedcom
```

**Remarque :** Le TP6 utilise `--std=c90` (norme C90), alors que les autres TPs utilisent `--std=c11`.

## 7.4 Options de compilation gcc

### Options essentielles

| Option | Signification |
|--------|---------------|
| `-Wall` | Active la plupart des warnings |
| `-Wextra` | Warnings supplementaires |
| `-std=c11` | Utilise le standard C11 |
| `-g` | Inclut les symboles de debug (pour gdb/valgrind) |
| `-o nom` | Nom de l'executable de sortie |
| `-c` | Compile en .o sans lier |
| `-lm` | Lie la bibliotheque mathematique |
| `-pedantic` | Warnings pour les extensions non standard |
| `-O2` | Optimisation niveau 2 |

### Compilation recommandee

```bash
# Developpement (avec debug)
gcc -Wall -Wextra -std=c11 -g -o programme fichier.c -lm

# Production (avec optimisation)
gcc -Wall -Wextra -std=c11 -O2 -o programme fichier.c -lm
```

---

## CHEAT SHEET - Preprocesseur et Compilation

```
PREPROCESSEUR :
  #include <lib.h>        Bibliotheque standard
  #include "mon.h"        Fichier local
  #define NOM valeur       Constante
  #define MACRO(x) ((x)+1) Macro (parentheser les args !)
  #ifdef / #ifndef / #endif  Compilation conditionnelle

FICHIER .H :
  #ifndef GUARD_H          Protection inclusion
  #define GUARD_H
  /* typedef, struct, prototypes */
  #endif

GCC :
  gcc -Wall -Wextra -std=c11 -g -o prog main.c lib.c -lm
  gcc -c fichier.c         Compile en .o (sans lier)
  gcc -o prog *.o -lm      Lie les .o en executable

MAKEFILE :
  make             Compile (cible par defaut)
  make clean       Nettoie les fichiers generes
  make run         Compile et execute

VARIABLES AUTO :
  $@  = cible      $^  = toutes les dependances
  $<  = premiere dependance

ETAPES :
  .c -> preprocesseur -> compilateur -> .o -> linker -> executable
```
