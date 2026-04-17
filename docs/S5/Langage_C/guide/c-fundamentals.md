---
title: "Chapitre 1 : Fondamentaux du C"
sidebar_position: 3
---

# Chapitre 1 : Fondamentaux du C

## 1.1 Types de donnees

### Types primitifs

| Type | Taille (typique) | Plage | Format printf/scanf |
|------|-------------------|-------|---------------------|
| `char` | 1 octet | -128 a 127 | `%c` (caractere), `%d` (entier) |
| `int` | 4 octets | -2^31 a 2^31-1 | `%d` |
| `long` | 4 ou 8 octets | depend de la plateforme | `%ld` |
| `float` | 4 octets | ~6 decimales | `%f` |
| `double` | 8 octets | ~15 decimales | `%lf` (scanf), `%f` ou `%lf` (printf) |
| `size_t` | 4 ou 8 octets | 0 a 2^32-1 ou 2^64-1 | `%zu` ou `%ld` |

### Limites des types (limits.h)

```c
#include <limits.h>

INT_MAX    /* 2147483647 - maximum d'un int */
INT_MIN    /* -2147483648 - minimum d'un int */
CHAR_MAX   /* 127 */
CHAR_MIN   /* -128 */
```

**Piege classique (TP2 - Factorielle) :**
```c
/* La factorielle depasse INT_MAX a partir de n=13 */
int myfact(int n) {
    if (n < 0) return -1;
    int fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

/* Verification du depassement AVANT le calcul */
int rang() {
    int i = 0;
    while (myfact(i) < INT_MAX / (i + 1)) {
        i++;
    }
    return i;  /* Retourne 12 : dernier n calculable */
}
```

## 1.2 Variables et declarations

```c
int a = 5;          /* Declaration + initialisation */
int b;              /* Declaration seule (valeur indeterminee !) */
const int MAX = 100; /* Constante (non modifiable) */

/* PIEGE : variable non initialisee = comportement indefini */
int x;
printf("%d", x);  /* DANGER : valeur aleatoire ! */
```

### Portee des variables

```c
int globale = 42;  /* Accessible partout dans le fichier */

void fonction() {
    int locale = 10;        /* Accessible uniquement dans la fonction */
    static int compteur = 0; /* Conserve sa valeur entre les appels */
    compteur++;
}
```

**Les variables `static` sont essentielles dans le TP6 (automates) :**
```c
/* La variable statique conserve l'etat de l'automate entre les appels */
int rechercheNomSabotiers(char* str) {
    static EtatAutomate etatA = {EINIT, ""};
    static int cpt = 0;
    /* etatA et cpt conservent leur valeur d'un appel a l'autre */
}
```

## 1.3 Operateurs

### Operateurs arithmetiques et d'affectation

```c
int a = 10, b = 3;
a + b    /* 13 */
a - b    /* 7  */
a * b    /* 30 */
a / b    /* 3  (division entiere !) */
a % b    /* 1  (modulo) */

a += 5;  /* a = a + 5  -> a vaut 15 */
a -= 3;  /* a = a - 3  -> a vaut 12 */
a *= 2;  /* a = a * 2  -> a vaut 24 */
a /= 4;  /* a = a / 4  -> a vaut 6 */
a %= 5;  /* a = a % 5  -> a vaut 1 */

/* Attention : *= avec pointeurs (TP1) */
double carre(double* a) {
    return (*a) *= (*a);  /* *a = *a * *a; return *a; */
}
```

### Operateurs de comparaison et logiques

```c
a == b   /* Egalite (ATTENTION : pas = !) */
a != b   /* Difference */
a < b    /* Inferieur strict */
a <= b   /* Inferieur ou egal */
a > b    /* Superieur strict */
a >= b   /* Superieur ou egal */

a && b   /* ET logique */
a || b   /* OU logique */
!a       /* NON logique */

/* PIEGE CLASSIQUE D'EXAMEN : */
if (a = 5) { ... }  /* AFFECTATION, pas comparaison ! Toujours vrai. */
if (a == 5) { ... } /* COMPARAISON : correct */
```

### Operateurs d'incrementation

```c
i++   /* Post-incrementation : utilise i, puis incremente */
++i   /* Pre-incrementation : incremente, puis utilise i */
i--   /* Post-decrementation */
--i   /* Pre-decrementation */
```

## 1.4 Flux de controle

### Conditions

```c
/* if / else if / else */
if (n < 0) {
    printf("Negatif\n");
} else if (n == 0) {
    printf("Zero\n");
} else {
    printf("Positif\n");
}

/* switch/case (utilise dans TP6 pour l'automate, TD2 pour le robot) */
switch (etatA.etat) {
    case EINIT:
        /* Actions en etat initial */
        break;        /* IMPORTANT : sans break, execution continue ! */
    case EINDI:
        /* Actions apres detection d'individu */
        break;
    default:
        /* Cas par defaut */
        break;
}
```

### Boucles

```c
/* for - quand on connait le nombre d'iterations */
for (int i = 0; i < n; i++) {
    printf("%d ", i);
}

/* while - quand on ne connait pas le nombre d'iterations */
while (condition) {
    /* corps de boucle */
}

/* do-while - au moins une execution */
do {
    /* corps de boucle */
} while (condition);  /* ATTENTION : point-virgule obligatoire */

/* Exemple TD1 : somme des n premiers entiers */
/* Version for */
int somme = 0;
for (int i = 1; i <= n; i++) {
    somme += i;
}

/* Version while */
int i = 1;
while (i <= n) {
    somme += i;
    i++;
}
```

## 1.5 Fonctions

### Declaration et definition

```c
/* Prototype (declaration) - en haut du fichier ou dans un .h */
double norme(double x, double y);

/* Definition (implementation) */
double norme(double x, double y) {
    return sqrt(x * x + y * y);  /* Necessite -lm a la compilation */
}
```

### Passage par valeur vs passage par reference

```c
/* PASSAGE PAR VALEUR : la fonction recoit une COPIE */
int fonct(int a, int b) {
    a = 2 * a;   /* Modifie la copie locale, pas l'original */
    b = 2 * b;
    return a + b;
}

int main() {
    int x = 2, y = 3;
    int z = fonct(x, y);
    /* x vaut toujours 2, y vaut toujours 3, z vaut 10 */
}
```

```c
/* PASSAGE PAR REFERENCE : la fonction recoit l'ADRESSE */
int fonct(int *a, int *b) {
    *a = 2 * (*a);  /* Modifie la variable originale via le pointeur */
    *b = 2 * (*b);
    return *a + *b;
}

int main() {
    int x = 2, y = 3;
    int z = fonct(&x, &y);   /* On passe les ADRESSES de x et y */
    /* x vaut 4, y vaut 6, z vaut 10 */
}
```

**Diagramme memoire (passage par valeur) :**
```
Avant fonct(x, y) :          Dans fonct(a, b) :         Apres fonct() :
+-----+------+               +-----+------+             +-----+------+
| x   |   2  |               | a   |   2->4  (copie)    | x   |   2  | (inchange)
+-----+------+               +-----+------+             +-----+------+
| y   |   3  |               | b   |   3->6  (copie)    | y   |   3  | (inchange)
+-----+------+               +-----+------+             +-----+------+
```

**Diagramme memoire (passage par reference) :**
```
Avant fonct(&x, &y) :        Dans fonct(a, b) :         Apres fonct() :
+-----+------+               +-----+------+             +-----+------+
| x   |   2  | <-----+       | a   | &x   |------+     | x   |   4  | (modifie !)
+-----+------+       |       +-----+------+      |     +-----+------+
| y   |   3  | <--+  |       | b   | &y   |---+  |     | y   |   6  | (modifie !)
+-----+------+    |  |       +-----+------+   |  |     +-----+------+
                   |  +--- *a modifie x -------+  |
                   +------ *b modifie y -----------+
```

### Fonctions recursives (TP2)

```c
/* Suite recurrente u_0 = e-1, u_n = e - n*u_(n-1) */
/* VERSION INSTABLE (erreurs amplifiees) */
double suite(int n, int verbose) {
    if (n == 0) {
        return M_E - 1;            /* Cas de base */
    } else {
        double res = M_E - n * suite(n - 1, verbose);  /* Appel recursif */
        return res;
    }
}

/* VERSION STABLE (erreurs attenuees) */
double suiteDecroissante() {
    double res = 0;  /* u_50 ~ 0 */
    for (int i = 50; i > 0; i--) {
        res = (M_E - res) / i;   /* Division = attenuation des erreurs */
    }
    return res;
}
```

## 1.6 Entrees/Sorties standard

```c
#include <stdio.h>

/* Ecriture */
printf("Entier: %d\n", 42);
printf("Double: %lf\n", 3.14);
printf("Chaine: %s\n", "hello");
printf("Caractere: %c\n", 'A');
printf("Avec precision: %.2f\n", 3.14159);  /* Affiche 3.14 */

/* Lecture */
int n;
scanf("%d", &n);       /* ATTENTION : &n (adresse) obligatoire ! */

double x;
scanf("%lf", &x);      /* %lf pour lire un double */

char str[100];
scanf("%s", str);       /* PAS de & pour les tableaux (deja un pointeur) */

/* Lire une ligne entiere (avec espaces) */
char ligne[256];
fgets(ligne, 256, stdin);
```

## 1.7 Constantes mathematiques (math.h)

```c
#define _USE_MATH_DEFINES  /* Necessaire sur Windows AVANT #include */
#include <math.h>

M_PI   /* 3.14159265358979... */
M_E    /* 2.71828182845904... */

sqrt(x)     /* Racine carree */
pow(x, n)   /* x^n */
sin(x)      /* Sinus (x en radians) */
cos(x)      /* Cosinus */
fmod(x, y)  /* Modulo pour les flottants */
floor(x)    /* Arrondi inferieur */
ceil(x)     /* Arrondi superieur */
fabs(x)     /* Valeur absolue (double) */
abs(n)      /* Valeur absolue (int, dans stdlib.h) */
```

**Compilation obligatoire avec `-lm` :**
```bash
gcc -Wall -Wextra -std=c11 -g -o programme programme.c -lm
```

---

## CHEAT SHEET - Fondamentaux du C

```
TYPES :        int (4o)  |  double (8o)  |  char (1o)  |  size_t (unsigned)
FORMATS :      %d (int)  |  %lf (double) |  %c (char)  |  %s (string) | %zu (size_t)

SCANF :        scanf("%d", &variable);   /* TOUJOURS avec & sauf tableaux */
PRINTF :       printf("format", valeur); /* SANS & */

OPERATEURS :   == (egal)  |  != (diff)  |  && (ET)  |  || (OU)  |  ! (NON)
PIEGE :        = (affectation) vs == (comparaison)

PASSAGE :      par valeur -> copie (lecture seule)
               par reference -> pointeur (modification possible)

MATH :         #include <math.h>  +  compiler avec -lm
               sqrt(), pow(), sin(), cos(), fabs(), floor(), ceil()

LIMITES :      INT_MAX = 2147483647  |  13! depasse INT_MAX

STATIC :       conserve sa valeur entre les appels de fonction
```
