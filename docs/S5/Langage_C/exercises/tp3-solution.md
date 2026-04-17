---
title: "TP3 - Tableaux et Chaines de Caracteres"
sidebar_position: 3
---

# TP3 - Tableaux et Chaines de Caracteres

> Following teacher instructions from: `S5/Langage_C/data/moodle/tp/tp3/README.md`

## Exercice 1

### Histogramme de valeurs aleatoires -- Generer un tableau de valeurs aleatoires entre 0 et `VAL_MAX-1`, calculer l'histogramme (compter les occurrences de chaque valeur), afficher l'histogramme sous forme graphique

**Concepts cles :**
- Generation de nombres aleatoires avec `rand()` et `srand()`
- Initialisation avec `srand(time(NULL))` pour avoir des valeurs differentes
- Utilisation d'un tableau comme compteur

**Algorithme de l'histogramme :**
```c noexec
Pour chaque valeur v dans le tableau source:
    dest[v]++  // Incremente le compteur de la valeur v
```

### Etape 1 : Le fichier d'en-tete tableau.h

**Answer:**

```c noexec
/*!
 * \file tableau.h
 * \brief Module de manipulation de tableaux et histogrammes
 * \author ESM05 - Langage C
 * \date 2021
 */

#ifndef TABLEAU_H
#define TABLEAU_H

#define DIM_TAB 50   /* Taille du tableau source */
#define VAL_MAX 20   /* Valeurs entre 0 et VAL_MAX-1 */

/*!
 * \brief Initialise un tableau avec des valeurs aleatoires
 *
 * Remplit le tableau avec des valeurs aleatoires entre 0 et VAL_MAX-1.
 *
 * \param tab Le tableau a remplir
 * \param taille La taille du tableau
 */
void init_alea_tab(int tab[], int taille);

/*!
 * \brief Affiche le contenu d'un tableau
 *
 * \param tab Le tableau a afficher
 * \param taille La taille du tableau
 */
void affiche_tab(int tab[], int taille);

/*!
 * \brief Calcule l'histogramme d'un tableau
 *
 * Pour chaque valeur v dans le tableau source,
 * incremente dest[v] (compte les occurrences).
 *
 * \param src Le tableau source
 * \param dest Le tableau destination (histogramme)
 * \param tailleSrc Taille du tableau source
 * \param tailleDest Taille du tableau destination (= VAL_MAX)
 */
void histo(int src[], int dest[], int tailleSrc, int tailleDest);

/*!
 * \brief Affiche l'histogramme sous forme graphique
 *
 * \param tab Le tableau histogramme
 * \param taille La taille du tableau
 * \param showZ Si 1, affiche aussi les valeurs a zero
 */
void affiche_histo(int tab[], int taille, int showZ);

#endif /* TABLEAU_H */
```

### Etape 2 : Implementation tableau.c

**Answer:**

```c noexec
/*!
 * \file tableau.c
 * \brief Implementation des fonctions de manipulation de tableaux
 * \author ESM05 - Langage C
 * \date 2021
 */

#include "tableau.h"
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

void init_alea_tab(int tab[], int taille) {
    /* Initialisation du generateur aleatoire avec l'heure actuelle */
    srand(time(NULL));
    /* time(NULL) retourne le nombre de secondes depuis le 1er janvier 1970.
     * Cela donne un "seed" different a chaque execution.
     * Sans srand(), rand() retournerait toujours la meme sequence.
     */

    for (int i = 0; i < taille; i++) {
        /* Genere une valeur entre 0 et VAL_MAX-1 */
        tab[i] = rand() % VAL_MAX;
    }
}

void affiche_tab(int tab[], int taille) {
    for (int i = 0; i < taille; i++) {
        printf("tab[%d] = %d\n", i, tab[i]);
    }
    printf("=====================\n");
}

void histo(int src[], int dest[], int tailleSrc, int tailleDest) {
    /* Initialisation du tableau destination a zero */
    for (int i = 0; i < tailleDest; i++) {
        dest[i] = 0;
    }

    /* Comptage des occurrences */
    for (int i = 0; i < tailleSrc; i++) {
        /* src[i] contient une valeur entre 0 et VAL_MAX-1 */
        /* On l'utilise comme indice pour incrementer le compteur */
        dest[src[i]]++;
    }
}

void affiche_histo(int tab[], int taille, int showZ) {
    printf("\nHistogramme:\n");
    for (int i = 0; i < taille; i++) {
        /* Si showZ est 0, on saute les valeurs nulles */
        if (!showZ && tab[i] == 0) {
            continue;
        }

        /* Affiche la valeur */
        printf("%2d : ", i);

        /* Affiche un tiret par occurrence */
        for (int j = 0; j < tab[i]; j++) {
            printf("-");
        }
        printf("\n");
    }
}
```

### Etape 3 : Programme principal histogram.c

**Answer:**

```c noexec
/*!
 * \file histogram.c
 * \brief Programme principal pour generer et afficher un histogramme
 * \author ESM05 - Langage C
 * \date 2021
 */

#include <stdio.h>
#include <stdlib.h>
#include "tableau.h"

int main() {
    int tabSrc[DIM_TAB];      /* Tableau source (valeurs aleatoires) */
    int tabDest[VAL_MAX];     /* Tableau destination (histogramme) */

    /* Genere des valeurs aleatoires */
    printf("Generation de %d valeurs aleatoires entre 0 et %d:\n\n",
           DIM_TAB, VAL_MAX - 1);
    init_alea_tab(tabSrc, DIM_TAB);

    /* Affiche le tableau source */
    affiche_tab(tabSrc, DIM_TAB);

    /* Calcule l'histogramme */
    histo(tabSrc, tabDest, DIM_TAB, VAL_MAX);

    /* Affiche l'histogramme (sans les valeurs a zero) */
    affiche_histo(tabDest, VAL_MAX, 0);

    printf("\n(Les valeurs a 0 occurrences ne sont pas affichees)\n");

    return 0;
}
```

**Compilation:**

```bash
cd tp3/src
make histogram
./histogram
```

**Expected output:**

```
Generation de 50 valeurs aleatoires entre 0 et 19:

tab[0] = 5
tab[1] = 12
tab[2] = 7
tab[3] = 5
tab[4] = 18
=====================
0 : -----
1 : ------------
2 : -------
3 : -----
4 : ------------------
...
```

**Diagramme memoire : passage de tableau**

```
main() :
+-----------+-----------+-----------+-----+-----------+
| tabSrc[0] | tabSrc[1] | tabSrc[2] | ... | tabSrc[49]|
+-----------+-----------+-----------+-----+-----------+
   0x3000      0x3004      0x3008           0x30C4

Appel : init_alea_tab(tabSrc, 50)

init_alea_tab() :
+------+---------+
| tab  | 0x3000  |  <-- pointe vers tabSrc[0] dans main
+------+---------+
| taille|  50    |
+------+---------+

tab[i] est en fait tabSrc[i] dans main !
C'est le MEME tableau, pas une copie.
```

---

## Exercice 2

### Generation d'identifiants -- Creer des identifiants a partir d'un prenom et d'un nom, format: premiere lettre du prenom + nom complet. Version 2: tout en minuscules

**Exemples :**
- Jean Dupont --> JDupont (version 1) / jdupont (version 2)
- Marie MARTIN --> MMartin (version 1) / mmartin (version 2)

**Points cles :**
- Les chaines C sont des tableaux de `char` termines par `'\0'`
- `tolower()` convertit un caractere en minuscule
- Attention aux depassements de buffer (taille max de l'ID)

### Etape 1 : Le fichier d'en-tete login.h

**Answer:**

```c noexec
/*!
 * \file login.h
 * \brief Module de generation d'identifiants
 * \author ESM05 - Langage C
 * \date 2021
 */

#ifndef LOGIN_H
#define LOGIN_H

#include <ctype.h>

#define MAX_NOM 255  /* Taille maximale pour nom/prenom */
#define MAX_ID 10    /* Taille maximale pour l'identifiant */

/*!
 * \brief Genere un identifiant: premiere lettre du prenom + nom
 *
 * Format: Pnom (ex: Jean Dupont --> JDupont)
 * Respecte la casse originale.
 *
 * \param prenom Le prenom
 * \param nom Le nom de famille
 * \param id Le tableau pour stocker l'identifiant (sortie)
 */
void identifiant(char prenom[], char nom[], char id[]);

/*!
 * \brief Genere un identifiant en minuscules
 *
 * Format: pnom (ex: Jean Dupont --> jdupont)
 * Convertit tout en minuscules.
 *
 * \param prenom Le prenom
 * \param nom Le nom de famille
 * \param id Le tableau pour stocker l'identifiant (sortie)
 */
void identifiant2(char prenom[], char nom[], char id[]);

#endif /* LOGIN_H */
```

### Etape 2 : Implementation login.c

**Answer:**

```c noexec
/*!
 * \file login.c
 * \brief Implementation des fonctions de generation d'identifiants
 * \author ESM05 - Langage C
 * \date 2021
 */

#include "login.h"

void identifiant(char *prenom, char *nom, char *id) {
    /* Premiere lettre du prenom */
    id[0] = prenom[0];

    /* Copie le nom apres la premiere lettre */
    int i;
    for (i = 0; i < MAX_ID - 1; i++) {
        id[i + 1] = nom[i];
        /* Arret si fin de chaine */
        if (nom[i] == '\0') {
            break;
        }
    }

    /* Assure la terminaison si le nom est trop long */
    if (i == MAX_ID - 1) {
        id[MAX_ID - 1] = '\0';
    }
}

void identifiant2(char *prenom, char *nom, char *id) {
    /* Premiere lettre du prenom en minuscule */
    id[0] = tolower(prenom[0]);

    /* Copie le nom en minuscules */
    int i;
    for (i = 0; i < MAX_ID - 1; i++) {
        id[i + 1] = tolower(nom[i]);
        /* Arret si fin de chaine */
        if (nom[i] == '\0') {
            break;
        }
    }

    /* Assure la terminaison si le nom est trop long */
    if (i == MAX_ID - 1) {
        id[MAX_ID - 1] = '\0';
    }
}
```

### Etape 3 : Programme principal login_main.c

**Answer:**

```c noexec
/*!
 * \file login_main.c
 * \brief Programme principal pour generer des identifiants
 * \author ESM05 - Langage C
 * \date 2021
 */

#include <stdio.h>
#include "login.h"

int main() {
    char nom[MAX_NOM];
    char prenom[MAX_NOM];
    char id[MAX_ID];

    /* Saisie du nom et du prenom */
    printf("Entrez un nom : \n");
    scanf("%s", nom);

    printf("Entrez un prenom : \n");
    scanf("%s", prenom);

    /* Generation de l'identifiant en minuscules */
    identifiant2(prenom, nom, id);

    printf("Voici votre ID : %s\n", id);

    /* Test de la version avec casse originale */
    char id_original[MAX_ID];
    identifiant(prenom, nom, id_original);
    printf("Version avec casse originale : %s\n", id_original);

    return 0;
}
```

**Compilation:**

```bash
make login
./login
```

**Expected output:**

```
Entrez un nom : 
Dupont
Entrez un prenom : 
Jean
Voici votre ID : jdupont
Version avec casse originale : JDupont
```

**Diagramme memoire : chaine de caracteres**

```
La chaine "Jean" en memoire :

+-----+-----+-----+-----+------+
| 'J' | 'e' | 'a' | 'n' | '\0' |
+-----+-----+-----+-----+------+
  [0]   [1]   [2]   [3]   [4]

Le '\0' marque la FIN de la chaine.
Sans lui, printf ne saurait pas ou s'arreter !
```

---

## Makefile complet pour TP3

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g

TARGETS = histogram login

all: $(TARGETS)

histogram: histogram.o tableau.o
	$(CC) $(CFLAGS) -o $@ $^

login: login_main.o login.o
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f *.o $(TARGETS)

.PHONY: all clean
```

## Points importants

1. **Nombres aleatoires en C :**
   - `srand(time(NULL))` une seule fois au debut pour initialiser le generateur
   - `rand() % VAL_MAX` donne un nombre entre 0 et VAL_MAX-1

2. **Chaines de caracteres :**
   - Un tableau de `char` termine par `'\0'`
   - `scanf("%s", str)` lit jusqu'au premier espace
   - Ne pas oublier de reserver de l'espace pour le `'\0'` final

3. **Manipulation de caracteres :**
   - `tolower()` et `toupper()` de `<ctype.h>`
   - Prennent un `int` et retournent un `int`

4. **Securite des tableaux :**
   - Toujours verifier les limites pour eviter les debordements de buffer
   - Forcer le `'\0'` final si le nom est tronque
