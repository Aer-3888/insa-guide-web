---
title: "TP6 - Analyse de Fichiers GEDCOM et Automates"
sidebar_position: 6
---

# TP6 - Analyse de Fichiers GEDCOM et Automates

> Following teacher instructions from: `S5/Langage_C/data/moodle/tp/tp6/README.md`

## Contexte : Format GEDCOM

GEDCOM (GEnealogical Data COMmunication) est un format standard pour echanger des donnees genealogiques. Chaque ligne contient une balise (INDI, NAME, BIRT, OCCU, etc.) et les donnees sont organisees hierarchiquement.

**Exemple de fichier GEDCOM (exemple.ged) :**
```
0 @I1@ INDI
1 NAME Jean/PERONNE/
1 SEX M
1 BIRT
2 DATE 30 JAN 1738
2 PLAC Le Mesnil-Garnier,...
1 OCCU menuisier, sabotier (1757-1768), boiseron (1760)
```

---

## Exercice 1

### Mise en place des fonctions utilitaires fichier -- Implementer les fonctions `ouvrirFichier()`, `fermerFichier()`, `lireLigneFichier()`, et `traiterLignesFichier()`

**Answer pour fichier.h :**

```c
#ifndef FICHIER_H_INCLUDED
#define FICHIER_H_INCLUDED

#include <stdlib.h>
#include <stdio.h>

#include "commun.h" /* definition de TMAX */

typedef enum { ARRET, RETOUR } TypeRetour;

FILE *ouvrirFichier(char *nom, char *mode, TypeRetour t);
void fermerFichier(FILE *f);
char *lireLigneFichier(FILE *f, char *tampon, int taille);
int traiterLignesFichier(FILE *f, int (*ptFonction)(char *));

#endif /* FICHIER_H_INCLUDED */
```

**Answer pour commun.h :**

```c
#ifndef COMMUN_H_INCLUDED
#define COMMUN_H_INCLUDED

#define TMAX 500

#endif /* COMMUN_H_INCLUDED */
```

**Answer pour fichier.c :**

```c
#include "fichier.h"

FILE *ouvrirFichier(char *nom, char *mode, TypeRetour t) {
    FILE * pFile = NULL; /* Descripteur du fichier */

    pFile = fopen(nom, mode);
    if (pFile == NULL) {
        perror(nom);
        /* Gestion de la fin de la fonction */
        if (t == ARRET)
            exit(EXIT_FAILURE);
    }
    return pFile;
}

void fermerFichier(FILE *f) {
    fclose(f);
}

char *lireLigneFichier(FILE *f, char *tampon, int taille) {
    return fgets(tampon, taille, f);
}

/*!
 * \brief Traite chaque ligne du fichier avec une fonction passee en parametre
 *
 * Utilise un pointeur de fonction pour appliquer un traitement
 * personnalise a chaque ligne du fichier.
 *
 * \param f Fichier ouvert
 * \param ptFonction Pointeur vers la fonction de traitement (ou NULL pour affichage)
 * \return Le nombre de lignes traitees
 */
int traiterLignesFichier(FILE *f, int (*ptFonction)(char *)) {
    int cpt = 0;         /* Compteur du nombre de lignes */
    char tampon[TMAX];   /* Tampon de lecture d'une ligne */

    rewind(f);           /* Remise en debut du fichier */

    /* Boucle de lecture des lignes */
    while (lireLigneFichier(f, tampon, TMAX)) {
        cpt++;
        if (ptFonction != NULL)
            (*ptFonction)(tampon); /* Application d'un traitement a chaque ligne */
        else
            printf("%s", tampon);  /* Traitement par defaut */
    }

    printf("Nombre de lignes: %d\n", cpt);
    return cpt;
}
```

---

## Exercice 2

### Extraction des noms et des professions -- Implementer `lireNom()` et `lireOccu()` avec des variables statiques pour compter les detections

**Answer pour traitement.h :**

```c
#ifndef TRAITEMENT_H_INCLUDED
#define TRAITEMENT_H_INCLUDED

int lireNom(char * str);
int lireOccu(char * str);

#endif /* TRAITEMENT_H_INCLUDED */
```

**Answer pour traitement.c :**

```c
#include <stdio.h>
#include <string.h>
#include "traitement.h"
#include "fichier.h"
#include "commun.h"

/*!
 * \brief Extrait les noms depuis les lignes GEDCOM
 *
 * Utilise une variable statique pour compter les noms detectes.
 * Appeler avec str=NULL pour obtenir le compteur et le reinitialiser.
 *
 * Format attendu : " 1 NAME prenom/NOM/"
 */
int lireNom(char * str) {
    static int cpt = 0;
    int res;
    char nom[TMAX];     /* Variable de recuperation d'un nom */
    char reste[TMAX];   /* Variable de recuperation des fins de ligne */

    /* Gestion du nombre de noms detectes */
    if (str == NULL) {
        int cpts = cpt;
        printf("Nombre de noms detectes: %d\n", cpt);
        cpt = 0;
        return cpts;
    }

    /* Verification du format de la ligne et extraction des noms */
    res = sscanf(str, " 1 NAME %*[^/\r\n]/%[^/]/%[ \r\n]", nom, reste);
    if (res == 2) {
        cpt++;
        printf("Nom : %s\n", nom);
    } else {
        res = 0;
    }
    return res;
}

/*!
 * \brief Extrait les professions depuis les lignes GEDCOM
 *
 * Utilise une variable statique pour compter les professions detectees.
 * Appeler avec str=NULL pour obtenir le compteur et le reinitialiser.
 *
 * Format attendu : " 1 OCCU profession"
 */
int lireOccu(char * str) {
    static int cpt = 0;
    int res;
    char occu[TMAX];    /* Variable de recuperation d'un occu */
    char reste[TMAX];   /* Variable de recuperation des fins de ligne */

    /* Gestion du nombre de occus detectes */
    if (str == NULL) {
        int cpts = cpt;
        printf("Nombre de occus detectes: %d\n", cpt);
        cpt = 0;
        return cpts;
    }

    /* Verification du format de la ligne et extraction des occus */
    res = sscanf(str, " 1 OCCU %[^/\r\n]%[ \r\n]", occu, reste);
    if (res == 2) {
        cpt++;
        printf("Occupation(s) : %s\n", occu);
    } else {
        res = 0;
    }
    return res;
}
```

---

## Exercice 3

### Compter les femmes/hommes et les naissances -- Implementer des fonctions de comptage generiques avec une structure Comptage

**Answer pour traitementOpt.h :**

```c
#ifndef TRAITEMENTOPT_H_INCLUDED
#define TRAITEMENTOPT_H_INCLUDED

#include <stdio.h>
#include <stdlib.h>

#include "commun.h"

/* Structure de comptage generique */
typedef struct {
    char* modele;       /* Format sscanf pour detecter la balise */
    char* message;      /* Message de sortie avec %d */
    unsigned int compteur;
} Comptage;

int compterIndividu(char* str);
int compterSex(char* str);
int compterFemmes(char* str);
int compterNaissances(char* str);

#endif
```

**Answer pour traitementOpt.c :**

```c
#include "traitementOpt.h"
#include "commun.h"
#include <stdlib.h>
#include <stdio.h>

/*!
 * \brief Fonction generique de comptage (statique, interne au module)
 *
 * Utilise la structure Comptage pour parametrer le modele de recherche
 * et le message d'affichage. La variable statique dans chaque fonction
 * appelante conserve le compteur entre les appels.
 */
static int compter(Comptage* param, char * str) {
    int res;
    char reste[TMAX];

    /* Gestion du nombre de detections */
    if (str == NULL) {
        int cpts = param->compteur;
        printf(param->message, param->compteur);
        param->compteur = 0;
        return cpts;
    }
    /* Verification du format de la ligne */
    res = sscanf(str, param->modele, reste);
    if (res == 1) {
        param->compteur++;
    }
    return res;
}

/* Compte le nombre d'individus (balise INDI) */
int compterIndividu(char * str) {
    static Comptage param = {" 0 @%*[^@]@ INDI%[ \r\n]",
                             "Nombre d'individus detectes: %d\n", 0};
    return compter(&param, str);
}

/* Compte le nombre de balises SEX */
int compterSex(char* str) {
    static Comptage param = {" 1 SEX %*[MFX]%[ \r\n]",
                             "Nombre de balises SEX detectees: %d\n", 0};
    return compter(&param, str);
}

/* Compte le nombre de femmes (SEX F) */
int compterFemmes(char* str) {
    static Comptage param = {" 1 SEX F%[ \r\n]",
                             "Nombre de femmes trouvees: %d\n", 0};
    return compter(&param, str);
}

/* Compte le nombre de naissances (balise BIRT) */
int compterNaissances(char* str) {
    static Comptage param = {" 1 BIRT%[ \r\n]",
                             "Nombre de naissances: %d\n", 0};
    return compter(&param, str);
}
```

---

## Exercice 4

### Question 24 : Quel est le nom complet de la variable qui memorise le nom d'un individu dans l'automate ?

**Answer:**

C'est `etatA.nom` (de type `char[TMAX]` au sein d'une structure de type `EtatAutomate`). Cette variable est declaree comme `static` dans la fonction `rechercheNomSabotiers()`, ce qui lui permet de conserver sa valeur entre les appels successifs de la fonction.

---

## Exercice 5

### Question 25 : Quelles transitions d'etats sont deja programmees dans le code fourni ?

**Answer:**

Avec le code fourni, les transitions suivantes sont deja programmees :
- **EINIT --> EINDI** : Quand on detecte une balise INDI (un individu)
- **ENAME --> EINDI** : Quand on est en etat ENAME (nom trouve) et qu'on detecte un nouvel individu INDI

Les transitions manquantes a completer sont :
- **EINDI --> ENAME** : Quand on detecte une balise NAME apres avoir trouve un individu
- **ENAME --> EINIT** : Quand on detecte une balise OCCU contenant "sabotier" (affichage du nom puis retour a l'etat initial)

**Diagramme de l'automate :**
```
EINIT --[INDI]--> EINDI
EINDI --[NAME]--> ENAME
ENAME --[OCCU contient "sabotier"]--> EINIT (affiche le nom)
ENAME --[INDI]--> EINDI (nouvel individu)
```

---

## Exercice 6

### Question 26 : Creer automaton.h et modifier principal.c pour tester la fonction `rechercheNomSabotiers()`

**Answer pour automaton.h :**

```c
#ifndef AUTOMATON_H
#define AUTOMATON_H

#include "commun.h"

/* Les etats finis de l'automate */
typedef enum {
    EINIT,   /* Etat initial (recherche d'individu) */
    EINDI,   /* Individu detecte (en attente du nom) */
    ENAME    /* Nom detecte (peut aller vers profession) */
} Etat;

/* Structure de l'automate */
typedef struct {
    Etat etat;       /* Etat courant */
    char nom[TMAX];  /* Memorise le nom en cours */
} EtatAutomate;

/* Fonction de recherche par automate */
int rechercheNomSabotiers(char* str);

#endif
```

---

## Exercice 7

### Question 27 : Completer le code pour afficher le nom des personnes dont le titre de profession contient le mot 'sabotier'

**Answer pour automaton.c :**

```c
#include "automaton.h"
#include <stdio.h>
#include <string.h>

/* Constantes pour les formats sscanf */
const char* chIndi = " 0 @%*[^@]@ INDI%[ \r\n ]";
const char* chName = " 1 NAME %*[^/\r\n]/%[^/]/%[ \r\n]";
const char* chSabo = " 1 OCCU %[^\r\n]%[ \r\n]";
const char* needle = "sabotier";

/*!
 * \brief Automate pour rechercher les sabotiers dans un fichier GEDCOM
 *
 * Utilise une variable statique pour conserver l'etat entre les appels.
 * Transitions :
 *   EINIT --[INDI]--> EINDI
 *   EINDI --[NAME]--> ENAME
 *   ENAME --[OCCU contient "sabotier"]--> EINIT (affiche le nom)
 *   ENAME --[INDI]--> EINDI (nouvel individu)
 *
 * \param str La ligne GEDCOM a traiter
 * \return resultat de sscanf
 */
int rechercheNomSabotiers(char* str) {
    static EtatAutomate etatA = {EINIT, ""};
    static int cpt = 0;

    int res;
    char trash[TMAX];     /* stockage des fins de lignes */
    char extract[TMAX];   /* stockage des donnees utiles */

    switch (etatA.etat) {
        case EINIT: {
                /* Detection des individus */
                res = sscanf(str, chIndi, trash);
                if (res == 1) {
                    etatA.etat = EINDI;
                }
                break;
            }
        case EINDI: {
                /* Depuis EINDI, la seule sortie est de trouver un nom */
                res = sscanf(str, chName, extract, trash);
                if (res == 2) {
                    etatA.etat = ENAME;
                    /* Copie au maximum TMAX chars pour eviter un buffer overflow */
                    strncpy(etatA.nom, extract, TMAX);
                }
                break;
            }
        case ENAME: {
                /* Essai de trouver un nouvel individu */
                res = sscanf(str, chIndi, trash);
                if (res == 1) {
                    etatA.etat = EINDI;
                } else {
                    /* Essai de trouver une balise OCCU */
                    res = sscanf(str, chSabo, extract, trash);
                    if (res == 2 && strstr(extract, needle) != NULL) {
                        /* On a trouve un sabotier ! */
                        printf("%s\n", etatA.nom);
                        etatA.etat = EINIT;
                    }
                }
                break;
            }
    }
}
```

---

## Programme principal (principal.c)

**Answer:**

```c
#include <stdio.h>
#include <string.h>
#include "fichier.h"
#include "traitement.h"
#include "traitementOpt.h"
#include "automaton.h"

int affichage(char* str) {
    return printf("%s", str);
}

int affichage2(char* str) {
    static unsigned int counter = 0;
    return printf("%d[%lu]\t: %s", counter++, strlen(str), str);
}

int main() {
    FILE * pFile = NULL;

    pFile = ouvrirFichier("exemple.ged", "r", ARRET);

    /* Recherche des sabotiers via l'automate */
    traiterLignesFichier(pFile, rechercheNomSabotiers);

    /* Pour compter les individus, decommenter :
     * traiterLignesFichier(pFile, compterIndividu);
     * compterIndividu(NULL);
     */

    /* Pour compter les femmes, decommenter :
     * traiterLignesFichier(pFile, compterFemmes);
     * compterFemmes(NULL);
     */

    /* Pour compter les naissances, decommenter :
     * traiterLignesFichier(pFile, compterNaissances);
     * compterNaissances(NULL);
     */

    fermerFichier(pFile);
    return 0;
}
```

**Makefile:**

```makefile
CC=gcc
FLAGS=--std=c90 -Wall -Wextra -pedantic-errors
SOURCES=traitement.c principal.c traitementOpt.c automaton.c fichier.c
OBJECTS=obj/traitement.o obj/automaton.o obj/principal.o obj/traitementOpt.o obj/fichier.o

gedcom: $(OBJECTS)
	${CC} ${FLAGS} $^ -o $@

obj:
	mkdir obj

obj/fichier.o: fichier.c fichier.h commun.h obj
	${CC} ${FLAGS} -c fichier.c -o obj/fichier.o
obj/traitement.o: traitement.c traitement.h fichier.h commun.h obj
	${CC} ${FLAGS} -c traitement.c -o obj/traitement.o
obj/principal.o: principal.c fichier.h traitement.h commun.h traitementOpt.h obj
	${CC} ${FLAGS} -c principal.c -o obj/principal.o
obj/traitementOpt.o: traitementOpt.c traitementOpt.h commun.h
	${CC} ${FLAGS} -c traitementOpt.c -o obj/traitementOpt.o
obj/automaton.o: commun.h automaton.c obj
	${CC} ${FLAGS} -c automaton.c -o obj/automaton.o

clean:
	rm -f obj/*.o
	rmdir obj
	rm -f gedcom
```

**Compilation:**

```bash
cd tp6/src
make
./gedcom
```

**Expected output (avec exemple.ged contenant un sabotier) :**

```
PERONNE
Nombre de lignes: 36
```

---

## Points importants

1. **Variables statiques :**
   ```c
   static EtatAutomate etatA = {EINIT, ""};
   ```
   Une variable statique conserve sa valeur entre les appels de fonction. C'est essentiel pour l'automate qui doit memoriser son etat.

2. **Pointeurs de fonctions dans `traiterLignesFichier()` :**
   ```c
   int traiterLignesFichier(FILE *f, int (*ptFonction)(char *));
   ```
   Permet d'appliquer differents traitements a chaque ligne du fichier sans modifier la boucle de lecture.

3. **Formats sscanf avances :**
   - `%*[^@]` : lit et IGNORE des caracteres qui ne sont pas `@`
   - `%[^/]` : lit des caracteres jusqu'a `/` (non inclus)
   - `%[ \r\n]` : lit uniquement des espaces et retours a la ligne

4. **`strstr()` pour la recherche de sous-chaines :**
   ```c
   if (strstr(extract, "sabotier") != NULL) {
       /* La sous-chaine "sabotier" a ete trouvee */
   }
   ```

5. **Automate a etats finis :** Permet de parser un fichier ligne par ligne en changeant d'etat selon les balises rencontrees, memorisant les informations necessaires via la variable statique.
