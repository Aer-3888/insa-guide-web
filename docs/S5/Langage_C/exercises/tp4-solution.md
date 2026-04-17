---
title: "TP4 - Structures et Entrees/Sorties Fichier"
sidebar_position: 4
---

# TP4 - Structures et Entrees/Sorties Fichier

> Following teacher instructions from: `S5/Langage_C/data/moodle/tp/tp4/README.md`

## Contexte

Ce TP implemente un systeme de gestion de taches pour la planification de projets.
Chaque tache a un numero d'identification, une duree (en heures), des predecesseurs (taches a terminer avant), et un titre descriptif.

**Format de fichier -- chaque ligne represente une tache :**
```
<no> <duree> <nbPred> [<pred1> <pred2> ...] <titre>
```

**Fichier de donnees taches.txt :**
```
1 5 0  Analyse des besoins
2 8 1 1  Conception architecture
3 12 1 2  Developpement module A
4 10 1 2  Developpement module B
5 6 2 3 4  Tests d'integration
6 4 1 5  Documentation
7 3 1 6  Deploiement
```

---

## Exercice 1

### Definir la structure Tache et les prototypes (tache.h)

**Answer:**

```c noexec
/*!
 * \file tache.h
 * \brief Module de gestion de taches pour la planification de projets
 * \author ESM05 - Langage C
 * \date 2021
 */

#ifndef TACHE_H
#define TACHE_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define LGMAX 64        /* Longueur maximum du titre */
#define NMAXPRED 16     /* Nombre maximum de predecesseurs */
#define MAXTACHES 64    /* Nombre maximum de taches */

/*!
 * \struct Tache
 * \brief Structure representant une tache de projet
 */
typedef struct {
    int no;              /* Numero d'identification de la tache */
    int duree;           /* Duree de la tache (en heures) */
    int nbPred;          /* Nombre effectif de predecesseurs */
    int pred[NMAXPRED];  /* Tableau des numeros de predecesseurs */
    char titre[LGMAX];   /* Titre/description de la tache */
} Tache;

void saisieTache(Tache *t, FILE *f);
void afficheTache(Tache *t);
int lireTachesFichier(char *nomFichier, Tache *tab);
void afficheTabTaches(Tache *tab_t, int nbtaches);
int sommeDureeTotale(Tache *tab_t, int nbtaches);
int ecrireTachesFichier(char *nomFichier, Tache *tab_t, int nbTaches);

#endif /* TACHE_H */
```

**Diagramme memoire d'une structure Tache :**

```
+------------------+----------------------------+
| Champ            | Taille     | Offset        |
+------------------+----------------------------+
| t.no             | 4 octets   | +0            |
| t.duree          | 4 octets   | +4            |
| t.nbPred         | 4 octets   | +8            |
| t.pred[0..15]    | 64 octets  | +12           |  (16 int x 4 octets)
| t.titre[0..63]   | 64 octets  | +76           |
+------------------+----------------------------+
Total :             ~140 octets (+ padding eventuel)
```

---

## Exercice 2

### Lecture/Ecriture -- Implementer `saisieTache()` pour lire une tache depuis un fichier

**Answer:**

```c noexec
/*!
 * \file tache.c
 * \brief Implementation des fonctions de gestion de taches
 * \author ESM05 - Langage C
 * \date 2021
 */

#include "tache.h"

void saisieTache(Tache *t, FILE *f) {
    /* Lecture des attributs principaux */
    fscanf(f, "%d %d %d", &(t->no), &(t->duree), &(t->nbPred));

    /* Lecture des predecesseurs */
    for (int i = 0; i < t->nbPred; i++) {
        fscanf(f, "%d", &(t->pred[i]));
    }

    /* Lecture du titre (jusqu'au saut de ligne) */
    /* %[^\n] lit tous les caracteres jusqu'au \n (non inclus) */
    fscanf(f, " %[^\n]", t->titre);  /* Espace initial consomme les blancs */
}
```

**Trace de lecture pour la ligne `5 6 2 3 4  Tests d'integration` :**

```
Apres fscanf(f, "%d %d %d", ...) :
  t->no = 5, t->duree = 6, t->nbPred = 2

Boucle i=0 : fscanf(f, "%d", &t->pred[0]) --> t->pred[0] = 3
Boucle i=1 : fscanf(f, "%d", &t->pred[1]) --> t->pred[1] = 4

fscanf(f, " %[^\n]", t->titre) :
  L'espace consomme les blancs avant "Tests"
  %[^\n] lit "Tests d'integration"
```

---

## Exercice 3

### Affichage -- Implementer `afficheTache()` et `afficheTabTaches()`

**Answer:**

```c noexec
void afficheTache(Tache *t) {
    printf("=========================\n");
    printf("Tache n%d: %s\n", t->no, t->titre);
    printf("Duree: %d heures\n", t->duree);
    printf("Nombre de predecesseurs: %d\n", t->nbPred);

    if (t->nbPred > 0) {
        printf("Predecesseurs: ");
        for (int i = 0; i < t->nbPred; i++) {
            printf("%d", t->pred[i]);
            if (i < t->nbPred - 1) {
                printf(", ");
            }
        }
        printf("\n");
    }
}

void afficheTabTaches(Tache *tab_t, int nbtaches) {
    printf("\n========== LISTE DES TACHES ==========\n");
    for (int i = 0; i < nbtaches; i++) {
        afficheTache(&tab_t[i]);
    }
    printf("======================================\n");
}
```

---

## Exercice 4

### Implementer `lireTachesFichier()` pour lire toutes les taches d'un fichier

**Answer:**

```c noexec
int lireTachesFichier(char *nomFichier, Tache *tab) {
    FILE *fichier;

    /* Ouverture du fichier en lecture */
    if ((fichier = fopen(nomFichier, "r")) == NULL) {
        fprintf(stderr, "Erreur d'ouverture du fichier %s\n", nomFichier);
        exit(1);
    }

    int i = 0;
    /* Lecture jusqu'a MAXTACHES ou fin de fichier */
    while (i < MAXTACHES && !feof(fichier)) {
        Tache t;
        saisieTache(&t, fichier);

        /* Verification que la lecture a reussi */
        if (!feof(fichier)) {
            tab[i] = t;
            i++;
        }
    }

    /* Fermeture du fichier */
    if (fclose(fichier)) {
        fprintf(stderr, "Erreur a la fermeture du fichier\n");
    }

    return i;  /* Retourne le nombre de taches lues */
}
```

---

## Exercice 5

### Calculs -- Implementer `sommeDureeTotale()` pour calculer la duree totale de toutes les taches

**Answer:**

```c noexec
int sommeDureeTotale(Tache *tab_t, int nbtaches) {
    int res = 0;
    for (int i = 0; i < nbtaches; i++) {
        res += tab_t[i].duree;
    }
    return res;
    /* Pour taches.txt : 5 + 8 + 12 + 10 + 6 + 4 + 3 = 48 heures */
}
```

---

## Exercice 6

### Implementer `ecrireTachesFichier()` pour ecrire les taches dans un fichier

**Answer:**

```c noexec
int ecrireTachesFichier(char *nomFichier, Tache *tab_t, int nbTaches) {
    FILE *fichier;

    /* Ouverture du fichier en ecriture */
    if ((fichier = fopen(nomFichier, "w")) == NULL) {
        fprintf(stderr, "Erreur d'ouverture du fichier %s\n", nomFichier);
        return 0;
    }

    /* Ecriture de chaque tache */
    for (int i = 0; i < nbTaches; i++) {
        /* Ecriture des attributs principaux */
        fprintf(fichier, "%d %d %d ", tab_t[i].no, tab_t[i].duree, tab_t[i].nbPred);

        /* Ecriture des predecesseurs */
        for (int j = 0; j < tab_t[i].nbPred; j++) {
            fprintf(fichier, "%d ", tab_t[i].pred[j]);
        }

        /* Ecriture du titre */
        fprintf(fichier, " %s\n", tab_t[i].titre);
    }

    /* Fermeture du fichier */
    if (fclose(fichier)) {
        fprintf(stderr, "Erreur a la fermeture du fichier\n");
        return 0;
    }

    return 1;  /* Succes */
}
```

---

## Exercice 7

### Programme principal complet (main.c) -- Lire les taches, les afficher, calculer la duree, ecrire dans un nouveau fichier

**Answer:**

```c noexec
/*!
 * \file main.c
 * \brief Programme principal de gestion de taches
 * \author ESM05 - Langage C
 * \date 2021
 */

#include <stdio.h>
#include "tache.h"

int main() {
    Tache tabTaches[MAXTACHES];
    int nbLignes;

    char monfichier[] = "taches.txt";
    char monfichierDest[] = "taches_out.txt";

    /* Lecture des taches depuis le fichier */
    printf("Lecture du fichier %s...\n", monfichier);
    nbLignes = lireTachesFichier(monfichier, tabTaches);
    printf("Nombre de taches lues: %d\n", nbLignes);

    /* Affichage des taches */
    afficheTabTaches(tabTaches, nbLignes);

    /* Calcul de la duree totale */
    int dureeTotal = sommeDureeTotale(tabTaches, nbLignes);
    printf("\nDuree totale: %d heures\n", dureeTotal);

    /* Ecriture dans un nouveau fichier */
    printf("\nEcriture dans %s...\n", monfichierDest);
    if (ecrireTachesFichier(monfichierDest, tabTaches, nbLignes)) {
        printf("Ecriture reussie!\n");
    } else {
        printf("Erreur lors de l'ecriture.\n");
    }

    return 0;
}
```

**Makefile:**

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g

TARGET = main
SOURCES = main.c tache.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c tache.h
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f $(OBJECTS) $(TARGET) taches_out.txt

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
```

**Compilation:**

```bash
cd tp4/src
make
./main
```

**Expected output:**

```
Lecture du fichier taches.txt...
Nombre de taches lues: 7

========== LISTE DES TACHES ==========
=========================
Tache n1: Analyse des besoins
Duree: 5 heures
Nombre de predecesseurs: 0
=========================
Tache n2: Conception architecture
Duree: 8 heures
Nombre de predecesseurs: 1
Predecesseurs: 1
...
======================================

Duree totale: 48 heures

Ecriture dans taches_out.txt...
Ecriture reussie!
```

---

## Points importants

1. **Ouverture de fichiers :**
   - `"r"` : Lecture (le fichier doit exister)
   - `"w"` : Ecriture (cree ou ecrase le fichier)
   - `"a"` : Ajout (ecrit a la fin)

2. **Lecture formatee avec `fscanf()` :**
   - `%[^\n]` lit tous les caracteres jusqu'au newline
   - L'espace avant `%[^\n]` consomme les blancs

3. **Acces aux champs de structure :**
   - `t.no` avec une variable directe
   - `t->no` avec un pointeur (equivalent a `(*t).no`)

4. **Fermeture de fichier :** Toujours verifier le retour de `fclose()`.
