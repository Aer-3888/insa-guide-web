---
title: "Chapitre 3 : Gestion Memoire Dynamique"
sidebar_position: 4
---

# Chapitre 3 : Gestion Memoire Dynamique

## 3.1 Stack vs Heap

```
MEMOIRE D'UN PROGRAMME C (adresses basses en haut)
+---------------------------+
|     Code (text segment)   |   Instructions du programme
+---------------------------+
|   Donnees statiques/      |   Variables globales, static
|   globales                |
+---------------------------+
|         HEAP              |   Allocation dynamique (malloc/free)
|  (croit vers adresses     |   Taille variable, geree manuellement
|         hautes)           |
|           |               |
|           v               |
|                           |
|           ^               |
|           |               |
|         STACK             |   Variables locales, parametres
|  (croit vers adresses     |   Taille fixe, gestion automatique
|         basses)           |
+---------------------------+
```

| | Stack (pile) | Heap (tas) |
|---|---|---|
| **Allocation** | Automatique | Manuelle (malloc/free) |
| **Duree de vie** | Fin du bloc/fonction | Jusqu'a free() |
| **Taille** | Limitee (quelques Mo) | Grande (memoire disponible) |
| **Vitesse** | Tres rapide | Plus lent |
| **Fragmentation** | Non | Oui |

## 3.2 malloc - Allocation basique

```c noexec
#include <stdlib.h>

/* Syntaxe : void* malloc(size_t taille_en_octets) */

/* Allouer un entier */
int *ptr = (int *)malloc(sizeof(int));

/* Allouer un tableau de n entiers */
int *tab = (int *)malloc(n * sizeof(int));

/* TOUJOURS verifier le retour de malloc */
if (tab == NULL) {
    fprintf(stderr, "Erreur d'allocation memoire\n");
    exit(1);
}

/* Utilisation */
tab[0] = 10;
tab[1] = 20;

/* Liberation OBLIGATOIRE */
free(tab);
tab = NULL;  /* Bonne pratique : evite les pointeurs dangling */
```

**ATTENTION : malloc n'initialise PAS la memoire !**
```c noexec
int *tab = (int *)malloc(5 * sizeof(int));
/* tab[0], tab[1], ... contiennent des valeurs ALEATOIRES */
```

## 3.3 calloc - Allocation avec initialisation a zero

```c noexec
/* Syntaxe : void* calloc(size_t nombre, size_t taille_element) */

/* Allouer et initialiser a zero */
int *tab = (int *)calloc(n, sizeof(int));
/* tab[0] = 0, tab[1] = 0, ..., tab[n-1] = 0 */

/* Utilise dans TP5 pour les elements de liste */
Element *elem = (Element *)calloc(1, sizeof(Element));
/* Tous les champs sont initialises a 0/NULL */
```

**Difference malloc vs calloc :**
```c noexec
/* Ces deux lignes sont QUASI-equivalentes : */
int *a = (int *)malloc(n * sizeof(int));    /* Non initialise */
int *b = (int *)calloc(n, sizeof(int));     /* Initialise a 0 */

/* calloc = malloc + memset(0) en une seule operation */
```

## 3.4 realloc - Redimensionnement

```c noexec
/* Syntaxe : void* realloc(void *ptr, size_t nouvelle_taille) */

int *tab = (int *)malloc(10 * sizeof(int));
/* tab a 10 cases */

tab = (int *)realloc(tab, 20 * sizeof(int));
/* tab a maintenant 20 cases, les 10 premieres conservees */

/* Cas speciaux (implementes dans TP7) : */
realloc(NULL, taille);    /* Equivalent a malloc(taille) */
realloc(ptr, 0);          /* Equivalent a free(ptr) */
```

**PIEGE avec realloc :**
```c noexec
/* MAUVAIS : si realloc echoue, on perd le pointeur original ! */
tab = realloc(tab, nouvelle_taille);
if (tab == NULL) {
    /* L'ancien tab est perdu -> FUITE MEMOIRE */
}

/* BON : utiliser un pointeur temporaire */
int *tmp = realloc(tab, nouvelle_taille);
if (tmp == NULL) {
    /* tab est toujours valide, on peut le liberer proprement */
    free(tab);
    exit(1);
}
tab = tmp;
```

## 3.5 free - Liberation de memoire

```c noexec
/* Syntaxe : void free(void *ptr) */

int *tab = (int *)malloc(10 * sizeof(int));
/* ... utilisation ... */
free(tab);
tab = NULL;  /* BONNE PRATIQUE : empeche le "dangling pointer" */
```

**Regles absolues :**
1. Tout `malloc`/`calloc` doit avoir un `free` correspondant
2. Ne jamais faire `free()` deux fois sur le meme pointeur (double free)
3. Ne jamais utiliser un pointeur apres `free()` (use-after-free)
4. `free(NULL)` est valide et ne fait rien

## 3.6 Allocation dynamique pour fichiers (TP5)

Quand on ne connait pas la taille a l'avance, on lit d'abord le nombre d'elements :

```c noexec
Tache *lireTachesFichierDyn(char *nomFichier, int *nbtaches) {
    FILE *fichier = fopen(nomFichier, "r");
    if (fichier == NULL) {
        fprintf(stderr, "Erreur d'ouverture\n");
        exit(1);
    }

    /* Le fichier commence par le nombre de taches */
    fscanf(fichier, "%d", nbtaches);

    /* Allocation dynamique exactement a la bonne taille */
    Tache *tab = (Tache *)calloc(*nbtaches, sizeof(Tache));

    /* Lecture des taches */
    lireTachesFichier(fichier, tab);

    fclose(fichier);
    return tab;  /* L'appelant devra faire free(tab) ! */
}
```

**Format du fichier avec taille dynamique :**
```
7                              <-- nombre de taches
1 5 0  Analyse des besoins    <-- tache 1
2 8 1 1  Conception            <-- tache 2
...
```

## 3.7 Fuites memoire et detection

### Qu'est-ce qu'une fuite memoire ?

```c noexec
void fuite() {
    int *tab = (int *)malloc(100 * sizeof(int));
    /* ... utilisation ... */
    return;  /* tab est perdu ! La memoire n'est JAMAIS liberee */
}
/* A chaque appel de fuite(), 400 octets sont perdus definitivement */
```

### Cas courants de fuites

```c noexec
/* 1. Oubli de free */
int *p = malloc(100);
/* ... pas de free(p) ... */

/* 2. Ecrasement de pointeur */
int *p = malloc(100);
p = malloc(200);     /* L'ancien bloc de 100 est perdu ! */
free(p);             /* Ne libere que les 200 */

/* 3. Return premature */
int *p = malloc(100);
if (erreur) {
    return -1;       /* p n'est jamais libere ! */
}
free(p);

/* 4. Oubli dans une liste chainee */
/* Il faut liberer CHAQUE element de la liste ! */
```

### Liberation d'une liste chainee (TP5)

```c noexec
void libererListe(Liste *l) {
    while (*l != NULL) {
        Element *temp = *l;     /* Sauvegarde le noeud courant */
        *l = (*l)->suivant;     /* Avance au suivant */
        free(temp);             /* Libere le noeud sauvegarde */
    }
}
```

**Diagramme de liberation :**
```
Etat initial :
l --> [A] --> [B] --> [C] --> NULL

Iteration 1 : temp=[A], l pointe vers [B], free(A)
l --> [B] --> [C] --> NULL

Iteration 2 : temp=[B], l pointe vers [C], free(B)
l --> [C] --> NULL

Iteration 3 : temp=[C], l pointe vers NULL, free(C)
l --> NULL
```

## 3.8 Detection avec Valgrind

```bash
# Compiler avec les symboles de debug
gcc -g -o programme programme.c

# Lancer avec valgrind
valgrind --leak-check=full ./programme
```

**Sortie typique :**
```
==12345== HEAP SUMMARY:
==12345==     in use at exit: 400 bytes in 1 blocks
==12345==   total heap usage: 3 allocs, 2 frees, 1,200 bytes allocated
==12345==
==12345== 400 bytes in 1 blocks are definitely lost in loss record 1 of 1
==12345==    at 0x4C2AB80: malloc (...)
==12345==    by 0x400600: main (programme.c:10)
==12345==
==12345== LEAK SUMMARY:
==12345==   definitely lost: 400 bytes in 1 blocks  <-- A corriger !
==12345==   indirectly lost: 0 bytes in 0 blocks
==12345==   possibly lost: 0 bytes in 0 blocks
==12345==   still reachable: 0 bytes in 0 blocks
```

## 3.9 Fonctionnement interne de malloc/free (TP7)

Le TP7 implemente un allocateur memoire personnalise. Voici le principe :

### Structure du tas

```c noexec
/* Le tas est un grand tableau de char */
static char mon_tas[MAX_MEMORY];  /* 1 000 000 octets */

/* Statut d'une zone memoire */
typedef enum {LIBRE, OCCUPE} Statut_memoire;

/* Chaque bloc a un descripteur suivi de donnees */
typedef struct descript {
    size_t size;              /* Taille du bloc utile en octets */
    Statut_memoire statut;    /* LIBRE ou OCCUPE */
    struct descript *suiv;    /* Pointeur vers le bloc suivant */
} Descript_mem;
```

**Organisation en memoire :**
```
|<-- Descripteur -->|<--- Donnees utiles --->|<-- Descripteur -->|<--- Donnees --->|
[size|stat|suiv]    [......................] [size|stat|suiv]    [................]
 ^                   ^
 |                   |
 Descript_mem*       void* retourne par malloc
```

### Algorithme First-Fit (Mon_malloc)

```
1. Parcourir la liste des blocs
2. Trouver le premier bloc LIBRE de taille >= demandee
3. Si le bloc est beaucoup plus grand : le decouper en deux
4. Marquer le bloc comme OCCUPE
5. Retourner un pointeur APRES le descripteur
```

### Algorithme de Coalescence (Mon_free)

```
1. Retrouver le descripteur (juste avant le pointeur)
2. Marquer le bloc comme LIBRE
3. Fusionner avec les blocs libres adjacents
   - Si le suivant est LIBRE : additionner les tailles
   - Parcourir pour fusionner aussi avec le precedent
```

### Macros de redirection

```c noexec
/* Le trick de TP7 : remplacer malloc/free par nos fonctions */
#ifdef ALLOC_PERSO
#define malloc(size)       Mon_malloc(size)
#define free(ptr)          Mon_free(ptr)
#define calloc(n,size)     Mon_calloc(n,size)
#define realloc(ptr,size)  Mon_realloc(ptr,size)
#endif

/* Tout code qui appelle malloc() utilise en fait Mon_malloc() */
```

---

## CHEAT SHEET - Memoire Dynamique

```
MALLOC :    ptr = (type*)malloc(n * sizeof(type));    /* Non initialise */
CALLOC :    ptr = (type*)calloc(n, sizeof(type));     /* Initialise a 0 */
REALLOC :   ptr = (type*)realloc(ptr, new_size);      /* Redimensionne */
FREE :      free(ptr); ptr = NULL;                     /* Libere + securise */

VERIFIER :  if (ptr == NULL) { /* erreur */ }

REGLE D'OR : tout malloc/calloc doit avoir un free correspondant

VALGRIND :  gcc -g -o prog prog.c
            valgrind --leak-check=full ./prog

ERREURS COURANTES :
  - Oubli de free              -> fuite memoire
  - Double free                -> corruption du tas
  - Use after free             -> comportement indefini
  - Ecriture hors limites      -> corruption des blocs adjacents
  - Ecrasement de pointeur     -> fuite (perte de l'ancien bloc)
  - Realloc sans temporaire    -> perte si echec

SIZEOF :    sizeof(int) = 4    sizeof(double) = 8    sizeof(char) = 1
            sizeof(pointeur) = 4 (32-bit) ou 8 (64-bit)
```
