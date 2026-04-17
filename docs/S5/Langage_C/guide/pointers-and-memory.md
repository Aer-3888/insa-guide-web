---
title: "Chapitre 2 : Pointeurs et Memoire"
sidebar_position: 6
---

# Chapitre 2 : Pointeurs et Memoire

## 2.1 Qu'est-ce qu'un pointeur ?

Un pointeur est une variable qui contient l'**adresse memoire** d'une autre variable.

```c
int a = 42;
int *ptr = &a;   /* ptr contient l'adresse de a */

printf("%d\n", a);     /* 42 - la valeur */
printf("%p\n", &a);    /* 0x7ffc... - l'adresse de a */
printf("%p\n", ptr);   /* 0x7ffc... - meme adresse (ptr stocke &a) */
printf("%d\n", *ptr);  /* 42 - dereferencement : lit la valeur a l'adresse */
```

**Diagramme memoire :**
```
Variable    Adresse       Valeur
+--------+-----------+-----------+
|   a    | 0x1000    |    42     |
+--------+-----------+-----------+
|  ptr   | 0x1008    |  0x1000   |---> pointe vers a
+--------+-----------+-----------+
```

## 2.2 Les trois operations fondamentales

### 1. Declaration

```c
int *ptr;       /* Pointeur vers un int */
double *dptr;   /* Pointeur vers un double */
char *cptr;     /* Pointeur vers un char (ou une chaine) */
void *vptr;     /* Pointeur generique (n'importe quel type) */

/* PIEGE : ou placer l'etoile ? */
int* a, b;      /* ATTENTION : seul a est un pointeur, b est un int ! */
int *a, *b;     /* Correct : a et b sont des pointeurs */
```

### 2. Prise d'adresse (&)

```c
int a = 42;
int *ptr = &a;  /* & = "adresse de" */

/* Utilisation avec scanf */
scanf("%d", &a);      /* scanf a BESOIN de l'adresse pour ecrire */
scanf("%d", ptr);     /* Equivalent si ptr = &a */
```

### 3. Dereferencement (*)

```c
int a = 42;
int *ptr = &a;

*ptr = 100;           /* Modifie a via le pointeur : a vaut maintenant 100 */
int b = *ptr;         /* Lit a via le pointeur : b vaut 100 */

printf("%d\n", a);    /* 100 */
```

## 2.3 Exercice de tracage de pointeurs (TD2)

Cet exercice est **typique des examens**. Il faut tracer l'etat des variables ligne par ligne.

```c
void main() {
    int a = 1;
    int b = 2;
    int c = 3;
    int *ptr1, *ptr2;
    
    ptr1 = &a;
    /* a=1  b=2  c=3  ptr1=&a  ptr2=? */
    
    ptr2 = &c;
    /* a=1  b=2  c=3  ptr1=&a  ptr2=&c */
    
    *ptr1 = (*ptr2) + 1;
    /* *ptr1 = a, *ptr2 = c = 3, donc a = 3+1 = 4 */
    /* a=4  b=2  c=3  ptr1=&a  ptr2=&c */
    
    ptr1 = ptr2;
    /* ptr1 pointe maintenant vers c (comme ptr2) */
    /* a=4  b=2  c=3  ptr1=&c  ptr2=&c */
    
    ptr2 = &b;
    /* a=4  b=2  c=3  ptr1=&c  ptr2=&b */
    
    *ptr1 -= *ptr2;
    /* *ptr1 = c, *ptr2 = b, donc c = c - b = 3 - 2 = 1 */
    /* a=4  b=2  c=1  ptr1=&c  ptr2=&b */
    
    *ptr1 *= *ptr2;
    /* c = c * b = 1 * 2 = 2 */
    /* a=4  b=2  c=2  ptr1=&c  ptr2=&b */
}
```

**Methode de tracage pour l'examen :**
```
Etape  | a  | b  | c  | ptr1 | ptr2 | Explication
-------|----|----|----+------+------+----------------------------------
init   | 1  | 2  | 3  | ?    | ?    | Declaration
L1     | 1  | 2  | 3  | &a   | ?    | ptr1 = &a
L2     | 1  | 2  | 3  | &a   | &c   | ptr2 = &c
L3     | 4  | 2  | 3  | &a   | &c   | *ptr1(=a) = *ptr2(=c)+1 = 4
L4     | 4  | 2  | 3  | &c   | &c   | ptr1 = ptr2 (les 2 pointent c)
L5     | 4  | 2  | 3  | &c   | &b   | ptr2 = &b
L6     | 4  | 2  | 1  | &c   | &b   | *ptr1(=c) -= *ptr2(=b) -> 3-2=1
L7     | 4  | 2  | 2  | &c   | &b   | *ptr1(=c) *= *ptr2(=b) -> 1*2=2
```

## 2.4 Pointeurs et tableaux

En C, un nom de tableau est **un pointeur constant** vers le premier element.

```c
int tab[5] = {10, 20, 30, 40, 50};

/* Les expressions suivantes sont equivalentes : */
tab[0]    ==  *tab           /* 10 */
tab[1]    ==  *(tab + 1)     /* 20 */
tab[i]    ==  *(tab + i)     /* element a l'indice i */
&tab[0]   ==  tab            /* adresse du premier element */
&tab[i]   ==  tab + i        /* adresse de l'element i */
```

**Diagramme memoire d'un tableau :**
```
tab = 0x1000 (adresse du premier element)

Indice :    [0]      [1]      [2]      [3]      [4]
Adresse : 0x1000   0x1004   0x1008   0x100C   0x1010
Valeur :    10       20       30       40       50
            ^
            |
         tab (= &tab[0])

tab + 1 = 0x1004 (avance de sizeof(int) = 4 octets)
tab + 2 = 0x1008
```

### Passage de tableaux aux fonctions

```c
/* Un tableau passe a une fonction se decompose en pointeur */
void affiche_tab(int tab[], int taille) {
    /* tab est en realite un int* ici */
    for (int i = 0; i < taille; i++) {
        printf("tab[%d] = %d\n", i, tab[i]);
    }
}

/* Ces deux prototypes sont EQUIVALENTS : */
void f(int tab[]);
void f(int *tab);

/* Le tableau est modifiable dans la fonction (pas de copie) ! */
void doubler(int tab[], int taille) {
    for (int i = 0; i < taille; i++) {
        tab[i] *= 2;  /* Modifie le tableau original */
    }
}
```

## 2.5 Arithmetique des pointeurs

L'arithmetique des pointeurs tient compte de la **taille du type pointe**.

```c
int tab[5] = {10, 20, 30, 40, 50};
int *p = tab;

p + 1    /* Avance de sizeof(int) = 4 octets -> pointe tab[1] */
p + 2    /* Avance de 2 * sizeof(int) = 8 octets -> pointe tab[2] */
p++      /* p pointe maintenant tab[1] */
p--      /* p pointe de nouveau tab[0] */

/* Difference entre pointeurs = nombre d'elements entre eux */
int *debut = &tab[0];
int *fin = &tab[4];
ptrdiff_t diff = fin - debut;  /* 4 (elements, pas octets) */
```

**Arithmetique avec cast (TP7 - allocateur memoire) :**
```c
/* Pour calculer en OCTETS, caster en char* */
Descript_mem *nouveau_bloc = (Descript_mem *)((char *)bloc_courant + nb_octet_total);
/*                                          ^^^^^^^^
 *                              Cast en char* pour avancer en octets
 *                              (car sizeof(char) = 1)
 */

/* Retrouver le descripteur depuis un pointeur de donnees */
Descript_mem *desc = (Descript_mem *)((char *)ptr - sizeof(Descript_mem));
/* ou de maniere equivalente : */
Descript_mem *desc = (Descript_mem *)ptr;
--desc;  /* Recule d'un sizeof(Descript_mem) */
```

## 2.6 Pointeur NULL et verification

```c
int *ptr = NULL;  /* Pointeur qui ne pointe nulle part */

/* TOUJOURS verifier avant de dereferencer */
if (ptr != NULL) {
    *ptr = 42;  /* OK */
} else {
    printf("Pointeur NULL !\n");
}

/* Dereferencer NULL = Segmentation Fault */
*ptr = 42;  /* CRASH : Segmentation fault */
```

## 2.7 Pointeurs void*

Un `void*` est un pointeur **generique** qui peut pointer vers n'importe quel type.

```c
void *ptr;

int a = 42;
ptr = &a;  /* OK : void* accepte n'importe quelle adresse */

/* Mais on ne peut pas dereferencer directement */
/* *ptr = 10;  // ERREUR : le compilateur ne connait pas le type */

/* Il faut caster avant de dereferencer */
*(int*)ptr = 10;  /* Cast en int* puis dereference */
```

**Utilise dans TP7 pour Mon_malloc :**
```c
void *Mon_malloc(size_t nb_octets) {
    /* ... recherche d'un bloc libre ... */
    Descript_mem *curr = liste_bloc_mem;
    /* ... */
    resultat = (void *)(++curr);  /* Retourne un void* */
    return resultat;
}

/* L'appelant caste vers le type voulu : */
int *tab = (int *)malloc(10 * sizeof(int));
char *str = (char *)malloc(100 * sizeof(char));
```

## 2.8 Pointeurs de pointeurs (double indirection)

Necessaire quand une fonction doit modifier un **pointeur** (pas la valeur pointee).

```c
/* Pour modifier un int dans une fonction : on passe int* */
void modifier_valeur(int *ptr) {
    *ptr = 42;
}

/* Pour modifier un pointeur dans une fonction : on passe int** */
void modifier_pointeur(int **pptr) {
    *pptr = malloc(sizeof(int));  /* Modifie le pointeur original */
    **pptr = 42;                  /* Modifie la valeur pointee */
}
```

**Utilise dans TP5 pour l'insertion en liste chainee :**
```c
typedef Element* Liste;  /* Liste = pointeur vers Element */

void ajoutdeb(Liste *l, Tache t) {
    /* l est un pointeur vers un pointeur (Liste = Element*) */
    Element *elem = (Element *)calloc(1, sizeof(Element));
    elem->t = t;
    elem->suivant = *l;  /* Le nouveau pointe vers l'ancienne tete */
    *l = elem;           /* La tete de liste est maintenant le nouveau */
}

/* Appel : */
Liste ma_liste = NULL;
ajoutdeb(&ma_liste, tache);  /* Passe l'adresse du pointeur */
```

**Diagramme memoire de l'insertion en debut :**
```
AVANT ajoutdeb(&l, t) :
l = NULL

APRES ajoutdeb(&l, t) :
l ----> [elem] ----> NULL
        | t   |
        | suiv|

APRES 2eme ajoutdeb(&l, t2) :
l ----> [elem2] ----> [elem] ----> NULL
        | t2   |      | t   |
        | suiv |      | suiv|
```

---

## CHEAT SHEET - Pointeurs et Memoire

```
DECLARATION :   int *ptr;          /* Pointeur vers un int */
ADRESSE :       ptr = &variable;   /* & = "adresse de" */
DEREFERENCE :   *ptr = valeur;     /* * = "valeur pointee par" */
NULL :          ptr = NULL;        /* Ne pointe nulle part */

TABLEAUX :      tab[i] == *(tab + i)          /* Equivalence */
                &tab[i] == tab + i             /* Equivalence */
                sizeof(tab) != sizeof(ptr)     /* tab = taille totale, ptr = taille pointeur */

ARITHMETIQUE :  p + 1 avance de sizeof(*p) octets (pas 1 octet !)
                (char*)p + 1 avance de 1 octet (car sizeof(char) = 1)

PASSAGE :       f(int *p)   -> modifie la valeur pointee (*p = ...)
                f(int **pp) -> modifie le pointeur lui-meme (*pp = ...)

VOID* :         Pointeur generique, doit etre caste avant dereferencement
                void *ptr = malloc(...); int *tab = (int*)ptr;

PIEGE :         int* a, b;  -> a est pointeur, b est int !
                int *a, *b; -> les deux sont pointeurs
```
