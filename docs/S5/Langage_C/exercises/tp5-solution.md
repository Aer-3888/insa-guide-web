---
title: "TP5 - Allocation Dynamique et Listes Chainees"
sidebar_position: 5
---

# TP5 - Allocation Dynamique et Listes Chainees

> Following teacher instructions from: `S5/Langage_C/data/moodle/tp/tp5/README.md`

## Contexte

Ce TP etend le TP4 (structure Tache) avec l'allocation dynamique et les listes chainees. Le fichier d'entree `tachesDyn.txt` contient le nombre de taches en premiere ligne, suivi des taches au format habituel.

**Fichier de donnees tachesDyn.txt :**
```
7
1 5 0  Analyse des besoins
2 8 1 1  Conception architecture
3 12 1 2  Developpement module A
4 10 1 2  Developpement module B
5 6 2 3 4  Tests d'integration
6 4 1 5  Documentation
7 3 1 6  Deploiement
```

**Difference avec TP4 :** La premiere ligne contient le nombre total de taches (7). Cela permet d'allouer dynamiquement un tableau de la bonne taille avec `malloc`.

---

## Exercice 1

### Structure de la liste chainee -- Definir la structure Element et le type Liste (Liste.h)

**Une liste chainee est une structure de donnees ou chaque element pointe vers le suivant :**
```
[Tache1|*]-->[Tache2|*]-->[Tache3|NULL]
```

**Answer:**

```c noexec
/*!
 * \file Liste.h
 * \brief Structure et prototypes pour la liste chainee de taches
 */

#ifndef TP4REDO_LISTE_H
#define TP4REDO_LISTE_H

#include "tache.h"

typedef struct struct_element {
    Tache t;                        /* La tache stockee */
    struct struct_element *suivant; /* Pointeur vers l'element suivant */
} Element;

typedef Element * Liste;  /* Une liste est un pointeur vers le premier element */

void ajoutdeb(Liste * l, Tache t);
int nbelement(Liste l);
void afficheListe(Liste l);
void ajouttrield(Liste *l, Tache t);
int compareDuree(Tache t, Tache c);
void ajouttrie(Liste *l, Tache t, int (*ptrfonc)(Tache, Tache));
int compareNom(Tache t, Tache c);
int compareID(Tache t, Tache c);

#endif /* TP4REDO_LISTE_H */
```

**Diagramme memoire d'une liste chainee :**

```
Liste l (pointeur vers le premier element)
  |
  v
+--------+--------+     +--------+--------+     +--------+--------+
| Tache1 | suiv --+---->| Tache2 | suiv --+---->| Tache3 |  NULL  |
+--------+--------+     +--------+--------+     +--------+--------+
  Element 1                Element 2                Element 3
  (sur le heap)            (sur le heap)            (sur le heap)
```

---

## Exercice 2

### Implementer la structure Tache avec allocation dynamique (tache.h et tache.c) -- Inclure `lireTachesFichierDyn()` pour lire un nombre variable de taches

**Answer pour tache.h :**

```c noexec
/*!
 * \file tache.h
 * \brief Module de definition des taches
 */

#ifndef TACHE_H_INC
#define TACHE_H_INC

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define LGMAX 64        /* longueur maximum du titre */
#define NMAXPRED 16     /* nombre maximum de predecesseurs */
#define MAXTACHES 64
#define T_MAX   1000

typedef struct {
    int no;              /* le numero de la tache */
    int duree;           /* la duree de la tache */
    int nbPred;          /* le nombre effectif de predecesseurs */
    int pred[NMAXPRED];  /* le tableau des predecesseurs */
    char titre[LGMAX];   /* le titre de la tache */
} Tache;

void saisieTache(Tache * t);
int lireTachesFichier(FILE * fichier, Tache *tab_t);
void afficheTache(Tache * t);
void afficheTabTaches(Tache * tab_t, int nbtaches);
int sommetotalduree(Tache * tab_t, int nbtch);
int ecrireTachesFichier(char * nomFichier, Tache *tab_t, int nbTaches);
Tache * lireTachesFichierDyn(char * nomFichier, int * nbtaches);

#endif
```

**Answer pour tache.c :**

```c noexec
#include "tache.h"
#include <string.h>

/*!
 * \brief Lit les taches depuis un fichier avec allocation dynamique
 *
 * Le fichier commence par le nombre de taches sur la premiere ligne,
 * puis les taches au format habituel.
 *
 * \param nomFichier Nom du fichier a lire
 * \param nbtaches Pointeur pour stocker le nombre de taches lues
 * \return Tableau de taches alloue dynamiquement (a liberer avec free())
 */
Tache * lireTachesFichierDyn(char * nomFichier, int * nbtaches) {
    FILE * ficher = (FILE *) NULL;
    if ((ficher = fopen(nomFichier, "r")) == (FILE *) NULL) {
        fprintf(stderr, "Erreur d'ouverture du fichier\n");
        exit(1);
    }

    /* Lecture du nombre de taches en premiere ligne */
    fscanf(ficher, "%d", nbtaches);
    Tache * tab;
    printf("Nombre de taches: %d\n", *nbtaches);

    /* Allocation dynamique du tableau de taches */
    tab = (Tache *)calloc(*nbtaches, sizeof(Tache));

    /* Lecture des taches */
    lireTachesFichier(ficher, tab);

    if (fclose(ficher)) {
        fprintf(stderr, "Erreur a la fermeture\n");
    }
    return tab;
}

void saisieTache(Tache * t) {
    printf("Insere le numero de la tache : ");
    scanf("%d", &t->no);

    printf("Insere la duree de la tache : ");
    scanf("%d", &t->duree);

    printf("Insere le titre de la tache : ");
    scanf("%s", t->titre);

    printf("nb predec :");
    scanf("%d", &t->nbPred);
    int i;
    for (i = 0; i < t->nbPred; i++) {
        printf("Met les predec : no %d ", i);
        scanf("%d", &t->pred[i]);
    }
}

void afficheTache(Tache * t) {
    printf("Numero tache : %d \n", t->no);
    printf("Duree tache : %d \n", t->duree);
    printf("Titre tache : %s\n", t->titre);
    printf("Nb de predec %d \n", t->nbPred);

    printf("Les predecesseurs sont : ");
    int i;
    for (i = 0; i < t->nbPred; i++) {
        printf("%d ", t->pred[i]);
    }
    printf("\n \n ");
}

int lireTachesFichier(FILE * fichier, Tache *tab_t) {
    int i, j;
    j = 0;
    i = 0;
    while (!feof(fichier) && i < MAXTACHES) {
        Tache t;
        fscanf(fichier, " %d %d %d ", &t.no, &t.duree, &t.nbPred);
        for (j = 0; j < t.nbPred; j++) {
            fscanf(fichier, " %d ", &t.pred[j]);
        }
        fgets(t.titre, LGMAX, fichier);
        tab_t[i] = t;
        i++;
    }
    return i;
}

void afficheTabTaches(Tache * tab_t, int nbtaches) {
    int i;
    for (i = 0; i < nbtaches; i++) {
        afficheTache(&tab_t[i]);
    }
}

int sommetotalduree(Tache * tab_t, int nbtch) {
    int i;
    int res = 0;
    for (i = 0; i < nbtch; i++)
        res = res + tab_t[i].duree;
    return res;
}

int ecrireTachesFichier(char * nomFichier, Tache *tab_t, int nbTaches) {
    FILE *fichier = (FILE *) NULL;
    if ((fichier = fopen(nomFichier, "w")) == (FILE *) NULL) {
        fprintf(stderr, "Erreur d'ouverture du fichier %s\n", nomFichier);
        return 0;
    }
    int i;
    for (i = 0; i < nbTaches; i++) {
        fprintf(fichier, "%d %d %d ", tab_t[i].no, tab_t[i].duree, tab_t[i].nbPred);
        int j;
        for (j = 0; j < tab_t[i].nbPred; j++) {
            fprintf(fichier, " %d ", tab_t[i].pred[j]);
        }
        fprintf(fichier, "%s\n", tab_t[i].titre);
    }

    if (fclose(fichier)) {
        fprintf(stderr, "Erreur a la fermeture du fichier %s\n", nomFichier);
        return 0;
    }
    return 1;
}
```

---

## Exercice 3

### Manipulation de base -- Implementer `ajoutdeb()` pour ajouter un element en debut de liste, `nbelement()` pour compter les elements, `afficheListe()` pour afficher la liste

**Answer:**

```c noexec
#include <string.h>
#include "Liste.h"

/*!
 * \brief Ajoute un element en debut de liste
 *
 * \param l Pointeur vers la tete de liste (Liste *)
 * \param t La tache a ajouter
 */
void ajoutdeb(Liste * l, Tache t) {
    Element * elem;
    elem = (Element *)calloc(1, sizeof(Element));
    elem->t = t;
    elem->suivant = (*l);   /* Pointe vers l'ancienne tete */
    *l = elem;              /* Le nouvel element devient la tete */
}

/*!
 * \brief Compte le nombre d'elements dans la liste
 *
 * \param l La liste a parcourir
 * \return Le nombre d'elements
 */
int nbelement(Liste l) {
    int res = 0;
    if (l == NULL) {
        return res;
    }
    while ((*l).suivant != NULL) {
        l = (*l).suivant;
        res++;
    }
    res++;
    return res;
}

/*!
 * \brief Affiche tous les elements de la liste
 *
 * \param l La liste a afficher
 */
void afficheListe(Liste l) {
    while (l != NULL) {
        afficheTache(&((*l).t));
        l = (*l).suivant;
    }
}
```

**Diagramme memoire pour ajoutdeb :**

```
Avant ajoutdeb(&l, t3) :
l --> [Tache1|*]-->[Tache2|NULL]

Apres calloc :
l --> [Tache1|*]-->[Tache2|NULL]
      [Tache3|???]  (nouveau, pas encore chaine)

Apres elem->suivant = *l :
l --> [Tache1|*]-->[Tache2|NULL]
  ^
  |
[Tache3|*]-----+

Apres *l = elem :
l --> [Tache3|*]-->[Tache1|*]-->[Tache2|NULL]
```

---

## Exercice 4

### Insertion triee par ID -- Implementer `ajouttrield()` pour inserer un element en maintenant l'ordre par numero de tache

**Answer:**

```c noexec
/*!
 * \brief Insere un element trie par ID (version specialisee)
 *
 * \param l Pointeur vers la tete de liste
 * \param t La tache a inserer
 */
void ajouttrield(Liste *l, Tache t) {
    if ((*l) == NULL) {
        ajoutdeb(l, t);
        return;
    }

    int id = t.no;
    Element * act = (*l);
    Element * pre;

    while (id > (((*act).t).no)) {
        pre = act;
        act = (*act).suivant;

        if (act == NULL) {
            /* Insertion en fin de liste */
            Element * elem = (Element *) calloc(1, sizeof(Element));
            elem->suivant = NULL;
            elem->t = t;
            (*pre).suivant = elem;
            return;
        }
    }

    /* Insertion avant l'element courant */
    Element * elem = (Element *) calloc(1, sizeof(Element));
    elem->suivant = act;
    elem->t = t;
    (*pre).suivant = elem;
}
```

---

## Exercice 5

### Insertion triee generique avec pointeurs de fonctions -- Implementer `ajouttrie()` avec un comparateur generique, et les fonctions `compareID()`, `compareDuree()`, `compareNom()`

Les pointeurs de fonctions permettent de passer des fonctions en parametre. Cela rend `ajouttrie()` generique : on peut trier par ID, duree ou nom sans changer le code d'insertion.

```c noexec
int (*comparateur)(Tache, Tache);  /* Declaration */
comparateur = &compareID;          /* Assignation */
int resultat = comparateur(t1, t2); /* Appel */
```

**Answer:**

```c noexec
/*!
 * \brief Insere un element en maintenant l'ordre selon un comparateur
 *
 * \param l Pointeur vers la tete de liste
 * \param t La tache a inserer
 * \param ptrfonc Pointeur vers la fonction de comparaison
 */
void ajouttrie(Liste *l, Tache t, int (*ptrfonc)(Tache, Tache)) {
    if ((*l) == NULL || (*ptrfonc)((*l)->t, t) < 0) {
        ajoutdeb(l, t);
        return;
    }
    Element * act = (*l);
    Element * pre;

    while ((*ptrfonc)((*act).t, t) > 0) {
        pre = act;
        act = (*act).suivant;
        if (act == NULL) {
            Element * elem = (Element *) calloc(1, sizeof(Element));
            elem->suivant = NULL;
            elem->t = t;
            (*pre).suivant = elem;
            return;
        }
    }

    Element * elem = (Element *) calloc(1, sizeof(Element));
    elem->suivant = act;
    elem->t = t;
    (*pre).suivant = elem;
}

/*!
 * \brief Compare deux taches par duree
 * Retourne positif si c est plus long que t
 */
int compareDuree(Tache t, Tache c) {
    return (c.duree) - (t.duree);
}

/*!
 * \brief Compare deux taches par ID
 */
int compareID(Tache t, Tache c) {
    return (c.no) - (t.no);
}

/*!
 * \brief Compare deux taches par nom (ordre lexicographique)
 */
int compareNom(Tache t, Tache c) {
    int k;
    k = strncmp((c.titre), (t.titre), 64);
    return k;
}
```

---

## Exercice 6

### Programme principal -- Lire les taches dynamiquement et les inserer triees dans une liste chainee

**Answer:**

```c noexec
#include <stdio.h>
#include "tache.h"
#include "Liste.h"

int main() {
    int nb;

    /* Lecture dynamique des taches depuis le fichier */
    Tache * tab = lireTachesFichierDyn("tachesDyn.txt", &nb);

    /* Creation de la liste chainee triee par ID */
    Liste l = NULL;
    int i;
    for (i = 0; i < nb; i++) {
        ajouttrie(&l, tab[i], &compareID);
    }

    /* Affichage de la liste triee */
    afficheListe(l);

    /* Liberer la memoire du tableau dynamique */
    free(tab);

    /* TODO: liberer la memoire de la liste chainee */
    /* libererListe(&l); */

    return 0;
}
```

**Makefile:**

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g

TARGET = main
SOURCES = main.c tache.c Liste.c
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
cd tp5/src
make
./main
```

**Expected output:**

```
Nombre de taches: 7
Numero tache : 1
Duree tache : 5
Titre tache : Analyse des besoins
Nb de predec 0
Les predecesseurs sont :

Numero tache : 2
Duree tache : 8
Titre tache : Conception architecture
Nb de predec 1
Les predecesseurs sont : 1
...
```

---

## Fuites memoire -- A implementer

Le code actuel ne libere pas la memoire de la liste chainee. Voici comment corriger cela :

```c noexec
void libererListe(Liste *l) {
    while (*l != NULL) {
        Element *temp = *l;
        *l = (*l)->suivant;
        free(temp);
    }
}
```

---

## Points importants

1. **Allocation dynamique :**
   - `malloc()` alloue sans initialiser
   - `calloc()` alloue et initialise a zero
   - Toujours verifier le retour (`NULL` = echec)
   - Toujours `free()` apres utilisation

2. **Insertion en debut de liste :** O(1) -- tres efficace

3. **Pointeurs de fonctions :** Permettent le tri generique sans dupliquer le code d'insertion

4. **Passage de pointeurs vers pointeurs :**
   ```c noexec
   void modifier(Liste *l) {
       *l = nouvel_element;  /* Modifie la liste originale */
   }
   /* Appel : modifier(&ma_liste); */
   ```
