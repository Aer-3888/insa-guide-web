---
title: "TD Solutions - Langage C"
sidebar_position: 1
---

# TD Solutions - Langage C

## TD 1 : Fondamentaux du C

### Exercice 1 : Test de multiples

```c
#include <stdio.h>

int main() {
    int a = 5, b = 2;
    scanf("%d %d", &a, &b);
    
    int est_un_multiple = a % b == 0;   /* 1 si a est multiple de b, 0 sinon */
    if (est_un_multiple) {
        printf("%d est un multiple de %d", a, b);
    } else {
        printf("%d n'est pas un multiple de %d", a, b);
    }
    return 0;
}
```

**Points cles :**
- `a % b` : modulo, retourne le reste de la division entiere
- `a % b == 0` : vrai si a est divisible par b

### Exercice 2 : Somme des n premiers entiers

```c
#include <stdio.h>

int main() {
    int i, n, somme;
    
    printf("entrez la valeur de n : ");
    scanf("%d", &n);
    
    /* Version for */
    somme = 0;
    for (i = 1; i <= n; i++) {
        somme += i;
    }
    
    /* Version while */
    somme = 0;
    i = 1;
    while (i <= n) {
        somme += i;
        i++;
    }
    
    /* Version do-while */
    somme = 0;
    i = 0;
    do {
        somme += i;
        i++;
    } while (i <= n);   /* ATTENTION : point-virgule apres while ! */
    
    printf("Somme des %d premiers entiers vaut: %d\n", n, somme);
    return 0;
}
```

**Note sur l'erreur dans le code original :** Il manque un `;` apres le `while` du do-while.

### Exercice 3 : Nombres premiers

```c noexec
/* Q1 : Test d'un nombre premier */
int main() {
    int n, estPremier = 1;
    printf("Entrez la valeur de n : ");
    scanf("%d", &n);
    
    for (int i = 2; i < n; i++) {   /* CORRECTION : ; au lieu de , */
        if (n % i == 0) {
            estPremier = 0;
        }
    }
    
    if (estPremier)
        printf("Le nombre %d est premier", n);
    else
        printf("Le nombre %d n'est pas premier", n);
    return 0;
}

/* Q2 : Version fonction */
int estPremier(int n) {
    for (int i = 2; i < n; i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}

/* Q3 : Fonction de divisibilite */
int estDivisible(int a, int b) {
    return a % b == 0;
}

/* Q2 modifiee avec estDivisible */
int estPremier(int n) {
    for (int i = 2; i < n; i++) {
        if (estDivisible(n, i)) return 0;
    }
    return 1;
}

/* Q4 : Optimisation avec sqrt (on ne teste que jusqu'a racine de n) */
#include <math.h>
int estPremierOptimise(int n) {
    if (n < 2) return 0;
    int limite = (int)floor(sqrt((double)n));
    for (int i = 2; i <= limite; i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}
```

**Erreur dans le code original :** `for(i=2,i<n,i++)` utilise des virgules au lieu de points-virgules. La syntaxe correcte est `for(i=2; i<n; i++)`.

### Exercice 4 : Recherche dans un tableau

```c noexec
/* Q1 : Recherche lineaire */
#define MYMAXSIZE 20

int main() {
    int tab[MYMAXSIZE] = {0, 4, 7, 8, 9, 5};
    int nb = 6, n, indice = -1;
    
    printf("La valeur de n est : ");
    scanf("%d", &n);
    
    for (int i = 0; i < nb; i++) {
        if (tab[i] == n) {
            indice = i;
        }
    }
    
    if (indice != -1)
        printf("Le nombre %d est a l'indice %d dans le tableau", n, indice);
    else
        printf("Le nombre %d n'est pas dans le tableau", n);
    
    return 0;
}

/* Q2 : Remplissage de tableau */
int remplirTableau(int tab[], int tailleMax) {
    int nb;
    printf("Taille voulue du tableau: ");
    scanf("%d", &nb);
    if (nb > tailleMax) nb = tailleMax;   /* Protection ! */
    for (int i = 0; i < nb; i++) {
        printf("Valeur en position %d: ", i);
        scanf("%d", &tab[i]);
    }
    return nb;
}

/* Q3 : Recherche dichotomique (tableau trie) */
int rechercheDichotomique(int tab[], int nb, int n) {
    int debut = 0, fin = nb - 1;
    while (debut <= fin) {
        int milieu = (debut + fin) / 2;
        if (tab[milieu] == n) return milieu;       /* Trouve ! */
        else if (tab[milieu] < n) debut = milieu + 1;  /* Chercher a droite */
        else fin = milieu - 1;                          /* Chercher a gauche */
    }
    return -1;  /* Non trouve */
}
```

**Erreur dans le code original :** `est_trouve==1` (comparaison au lieu d'affectation). Le code correct est `est_trouve = 1`.

---

## TD 2 : Pointeurs, Structures, Fichiers

### Exercice : Tracage de pointeurs

```c noexec
void main() {
    int a = 1, b = 2, c = 3;
    int *ptr1, *ptr2;
    
    ptr1 = &a;                 /* ptr1 -> a */
    ptr2 = &c;                 /* ptr2 -> c */
    *ptr1 = (*ptr2) + 1;      /* a = c + 1 = 4 */
    ptr1 = ptr2;               /* ptr1 -> c */
    ptr2 = &b;                 /* ptr2 -> b */
    *ptr1 -= *ptr2;            /* c = c - b = 3 - 2 = 1 */
    *ptr1 *= *ptr2;            /* c = c * b = 1 * 2 = 2 */
}
/* Resultat final : a=4, b=2, c=2 */
```

### Exercice : Passage par valeur vs reference

```c noexec
/* PASSAGE PAR VALEUR */
int fonct(int a, int b) {
    a = 2 * a;    /* Modifie la COPIE locale */
    b = 2 * b;
    printf("a=%d b=%d\n", a, b);    /* a=4 b=6 */
    return a + b;
}
int main() {
    int x = 2, y = 3;
    int z = fonct(x, y);
    printf("x=%d y=%d z=%d\n", x, y, z);  /* x=2 y=3 z=10 */
    /* x et y INCHANGES car passage par valeur */
}

/* PASSAGE PAR REFERENCE */
int fonct(int *a, int *b) {
    *a = 2 * (*a);   /* Modifie la variable ORIGINALE */
    *b = 2 * (*b);
    printf("*a=%d *b=%d\n", *a, *b);      /* *a=4 *b=6 */
    return *a + *b;
}
int main() {
    int x = 2, y = 3;
    int z = fonct(&x, &y);
    printf("x=%d y=%d z=%d\n", x, y, z);  /* x=4 y=6 z=10 */
    /* x et y MODIFIES car passage par reference */
}
```

### Exercice : Robot mobile (struct + enum)

```c noexec
typedef enum {AVANCER, TOURNERG, TOURNERD} Action;
typedef enum {NORD, OUEST, SUD, EST} Direction;

typedef struct {
    int pos_i, pos_j;
    Direction dir;
} Mobile;

int avancer(Mobile *p_m) {
    switch (p_m->dir) {
        case NORD:  if (p_m->pos_i > 0) { p_m->pos_i--; return 1; } break;
        case SUD:   if (p_m->pos_i < N-1) { p_m->pos_i++; return 1; } break;
        case EST:   if (p_m->pos_j < N-1) { p_m->pos_j++; return 1; } break;
        case OUEST: if (p_m->pos_j > 0) { p_m->pos_j--; return 1; } break;
    }
    return 0;  /* Hors limites */
}

int tournerGauche(Mobile *m) {
    switch (m->dir) {
        case NORD: m->dir = OUEST; break;
        case OUEST: m->dir = SUD; break;
        case SUD: m->dir = EST; break;
        case EST: m->dir = NORD; break;
    }
    return 1;
}
```

**Point cle :** La fleche `->` est utilisee pour acceder aux champs d'une structure via un pointeur. `p_m->dir` est equivalent a `(*p_m).dir`.

### Exercice : Concatenation de chaines (allocation dynamique)

```c noexec
/* Version dynamique avec realloc si le buffer est trop petit */
char* concatdyn(char* s1, char* s2, char* s3, unsigned int bufflen) {
    unsigned int len1 = strlen(s1);
    unsigned int len2 = strlen(s2);
    
    if (len1 + len2 >= bufflen) {
        /* Buffer trop petit : reallouer */
        s3 = (char*)realloc(s3, len1 + len2 + 1);  /* +1 pour '\0' */
        if (s3 == NULL) return NULL;
    }
    
    /* Copie de s1 puis s2 */
    unsigned int i;
    for (i = 0; i < len1; i++) s3[i] = s1[i];
    for ( ; i - len1 < len2; i++) s3[i] = s2[i - len1];
    s3[i] = '\0';
    
    return s3;
}
```

**Lecon :** La version statique tronque si le buffer est trop petit. La version dynamique utilise `realloc` pour agrandir automatiquement. Toujours penser au `+1` pour le `'\0'` final.
