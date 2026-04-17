---
title: "Chapitre 4 : Chaines de Caracteres"
sidebar_position: 8
---

# Chapitre 4 : Chaines de Caracteres

## 4.1 Representation en memoire

En C, une chaine est un **tableau de `char`** termine par le caractere nul `'\0'`.

```c
char nom[] = "Hello";
/* Equivalent a : */
char nom[] = {'H', 'e', 'l', 'l', 'o', '\0'};
/* Taille du tableau : 6 (5 caracteres + '\0') */
```

**Diagramme memoire :**
```
Indice :  [0]  [1]  [2]  [3]  [4]  [5]
Valeur :  'H'  'e'  'l'  'l'  'o'  '\0'
ASCII :   72   101  108  108  111   0
```

### Declaration de chaines

```c
/* 1. Tableau de char (taille fixe) - MODIFIABLE */
char str1[20] = "Hello";          /* 20 octets reserves, 6 utilises */
char str2[] = "World";            /* Taille calculee : 6 octets */

/* 2. Pointeur vers une chaine litterale - NON MODIFIABLE */
char *str3 = "Hello";             /* Pointe vers une zone en lecture seule */
/* str3[0] = 'X';  // ERREUR : Segmentation fault ! */

/* 3. Allocation dynamique - MODIFIABLE */
char *str4 = (char *)malloc(20 * sizeof(char));
strcpy(str4, "Hello");
/* str4[0] = 'X';  // OK */
```

## 4.2 Lecture et ecriture de chaines

```c
char nom[256];

/* Lecture d'un mot (s'arrete au premier espace) */
scanf("%s", nom);          /* PAS de & pour les tableaux ! */

/* Lecture d'une ligne entiere (avec espaces) */
fgets(nom, 256, stdin);   /* Lit au maximum 255 caracteres + '\0' */
/* ATTENTION : fgets inclut le '\n' final ! */

/* Lecture formatee (jusqu'a un caractere specifique) */
scanf("%[^\n]", nom);     /* Lit tout jusqu'au saut de ligne */
scanf(" %[^\n]", nom);   /* L'espace initial consomme les blancs */

/* Ecriture */
printf("%s\n", nom);       /* Affiche la chaine */
printf("%.5s\n", nom);    /* Affiche les 5 premiers caracteres */
```

## 4.3 Fonctions de string.h

```c
#include <string.h>

char src[] = "Hello";
char dst[20];
```

### strlen - Longueur

```c
size_t len = strlen(src);  /* 5 (ne compte PAS le '\0') */

/* PIEGE : strlen parcourt jusqu'a '\0' -> O(n) a chaque appel */
/* MAUVAIS : */
for (int i = 0; i < strlen(str); i++) { ... }  /* strlen recalcule a chaque tour ! */
/* BON : */
int len = strlen(str);
for (int i = 0; i < len; i++) { ... }
```

### strcpy / strncpy - Copie

```c
strcpy(dst, src);           /* Copie src dans dst */
/* DANGER : pas de verification de taille ! Buffer overflow possible */

strncpy(dst, src, 19);     /* Copie au maximum 19 caracteres */
dst[19] = '\0';            /* IMPORTANT : strncpy ne garantit PAS le '\0' ! */
```

**Utilise dans TP6 (automate) :**
```c
strncpy(etatA.nom, extract, TMAX);  /* Copie securisee */
```

### strcmp / strncmp - Comparaison

```c
int res = strcmp("abc", "abd");
/* res < 0 : "abc" < "abd" (lexicographiquement) */
/* res == 0 : chaines identiques */
/* res > 0 : premiere chaine > seconde */

strncmp(s1, s2, n);        /* Compare les n premiers caracteres */
```

**Utilise dans les examens (2016, 2020) :**
```c
/* Chercher des batiments dans une ville */
if (!strcmp(b.ville, ville)) {   /* strcmp retourne 0 si identiques */
    printf("Trouve !\n");
}
```

### strcat / strncat - Concatenation

```c
char result[50] = "Hello";
strcat(result, " World");     /* result = "Hello World" */
/* DANGER : pas de verification de taille ! */

strncat(result, " !", 3);    /* Ajoute au maximum 3 caracteres */
```

### strstr - Recherche de sous-chaine

```c
char *pos = strstr("Hello World", "World");
/* pos pointe vers "World" dans la chaine originale */
/* pos == NULL si non trouve */

/* Utilise dans TP6 pour chercher "sabotier" */
if (strstr(extract, needle) != NULL) {
    printf("%s\n", etatA.nom);  /* La profession contient le mot */
}
```

### sscanf - Analyse de chaine

```c
char ligne[] = "42 3.14 hello";
int n;
double d;
char mot[20];

sscanf(ligne, "%d %lf %s", &n, &d, mot);
/* n = 42, d = 3.14, mot = "hello" */

/* Format avance utilise dans TP6 (GEDCOM) : */
sscanf(str, " 1 NAME %*[^/\r\n]/%[^/]/%[ \r\n]", nom, reste);
/* %*[^/] : lit et JETTE les caracteres qui ne sont pas '/' */
/* %[^/]  : lit les caracteres qui ne sont pas '/' dans nom */
```

## 4.4 Manipulation de caracteres (ctype.h)

```c
#include <ctype.h>

tolower('A')    /* 'a' */
toupper('a')    /* 'A' */
isdigit('5')    /* Non-zero (vrai) */
isalpha('A')    /* Non-zero (vrai) */
isspace(' ')    /* Non-zero (vrai) */
```

**Utilise dans TP3 (generation d'identifiants) :**
```c
void identifiant2(char *prenom, char *nom, char *id) {
    id[0] = tolower(prenom[0]);     /* Premiere lettre du prenom en minuscule */
    int i;
    for (i = 0; i < MAX_ID - 1; i++) {
        id[i + 1] = tolower(nom[i]); /* Nom en minuscules */
        if (nom[i] == '\0') break;
    }
    if (i == MAX_ID - 1) {
        id[MAX_ID - 1] = '\0';      /* Assure la terminaison */
    }
}
/* "Jean" + "Dupont" -> "jdupont" */
```

## 4.5 Buffer overflow - Le danger principal

```c
char buffer[10];

/* DANGER : pas de controle de taille */
scanf("%s", buffer);        /* Si l'utilisateur tape plus de 9 caracteres -> overflow */
strcpy(buffer, "Tres long texte qui depasse"); /* Overflow ! */
strcat(buffer, " encore plus"); /* Overflow ! */

/* SOLUTION : limiter la taille */
scanf("%9s", buffer);                    /* Lit au maximum 9 caracteres */
fgets(buffer, 10, stdin);               /* Lit au maximum 9 caracteres + '\0' */
strncpy(buffer, source, 9);             /* Copie au maximum 9 caracteres */
buffer[9] = '\0';                        /* Assure la terminaison */
```

## 4.6 Concatenation statique vs dynamique (TD2)

```c
/* VERSION STATIQUE : buffer fixe, risque de troncature */
char* concatstat(char* s1, char* s2, char* s3, unsigned int bufflen) {
    unsigned int len1 = strlen(s1);
    unsigned int len2 = strlen(s2);
    unsigned int i = 0;
    for (i = 0; i < bufflen && i < len1; i++)
        s3[i] = s1[i];
    for ( ; i < bufflen && i - len1 < len2; i++)
        s3[i] = s2[i - len1];
    if (i < bufflen)
        s3[i] = '\0';
    return s3;
}

/* VERSION DYNAMIQUE : realloc si necessaire */
char* concatdyn(char* s1, char* s2, char* s3, unsigned int bufflen) {
    unsigned int len1 = strlen(s1);
    unsigned int len2 = strlen(s2);
    if (len1 + len2 >= bufflen) {
        s3 = (char*)realloc(s3, len1 + len2 + 1);  /* +1 pour '\0' */
        if (s3 == NULL) return NULL;
    }
    /* ... copie ... */
    return s3;
}
```

---

## CHEAT SHEET - Chaines de Caracteres

```
DECLARATION :   char str[20] = "Hello";     /* Modifiable, 20 octets */
                char str[] = "Hello";        /* Modifiable, 6 octets auto */
                char *str = "Hello";         /* NON modifiable (litteral) */

TERMINAISON :   Toujours '\0' a la fin. strlen("abc") = 3, sizeof = 4

STRING.H :
  strlen(s)              Longueur (sans '\0')
  strcpy(dst, src)       Copie (DANGER: pas de limite)
  strncpy(dst, src, n)   Copie securisee (n max)
  strcmp(s1, s2)          Compare (0 = egal, <0 = s1<s2, >0 = s1>s2)
  strncmp(s1, s2, n)     Compare n premiers chars
  strcat(dst, src)        Concatene (DANGER: pas de limite)
  strstr(haystack, needle) Recherche sous-chaine (NULL si absent)
  sscanf(str, fmt, ...)   Parse une chaine

CTYPE.H :
  tolower('A') -> 'a'    toupper('a') -> 'A'
  isdigit('5') -> vrai    isalpha('A') -> vrai

SCANF :     scanf("%s", str);           /* PAS de & (tableau=pointeur) */
            scanf("%9s", str);          /* Limite a 9 chars */
            scanf(" %[^\n]", str);      /* Lit une ligne entiere */
            fgets(str, taille, stdin);  /* Securise (inclut '\n') */

PIEGES :
  - Oublier '\0' -> strlen/printf lisent au-dela du buffer
  - strcpy sans verifier la taille -> buffer overflow
  - scanf("%s") sans limite -> buffer overflow
  - char *s = "hello"; s[0]='H'; -> CRASH (litteral = lecture seule)
```
