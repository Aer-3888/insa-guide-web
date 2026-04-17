---
title: "Annales Corrigees - Langage C"
sidebar_position: 2
---

# Annales Corrigees - Langage C

## DS 2020-2021 : Dates et Enumerations

### Exercice 1 : Correction de code

**Code a corriger (resume) :**
```c noexec
#include "stdio.h"    /* ERREUR 1 : guillemets au lieu de < > */
main() {              /* ERREUR 2 : manque le type de retour int */
    /* pas de int i; */ /* ERREUR 3 : i non declare */
    scanf("%d", i);   /* ERREUR 4 : manque le & */
    printf("%s\n", i) /* ERREUR 5 : %s au lieu de %d, manque le ; */
}
```

**Corrections :**
```c noexec
#include <stdio.h>     /* < > pour les bibliotheques standard */
int main() {           /* int main(), pas juste main() */
    int i;             /* Declarer la variable */
    scanf("%d", &i);   /* & obligatoire pour scanf */
    printf("%d\n", i); /* %d pour un entier, ; en fin de ligne */
    return 0;
}
```

### Exercice 2 : Structures et dates

**Q2 - Utiliser un enum :**
```c noexec
typedef enum {FALSE, TRUE} Booleen;

int main() {
    Booleen b = TRUE;
}
```

**Q3 - Enum des mois :**
```c noexec
typedef enum {
    JANVIER = 1, FEVRIER, MARS, AVRIL, MAI, JUIN,
    JUILLET, AOUT, SEPTEMBRE, OCTOBRE, NOVEMBRE, DECEMBRE
} Mois;
/* JANVIER=1, les suivants s'incrementent automatiquement */
```

**Q4 - Structure Date :**
```c noexec
typedef struct {
    int jour, annee;
    Mois mois;
} Date;
```

**Q5-Q6 - Setter avec pointeur :**
```c noexec
/* Pourquoi un pointeur ? Pour MODIFIER la structure originale */
void setMois(Date *d, Mois m) {
    d->mois = m;    /* -> car d est un pointeur */
}
```

**Q7 - Prediction de sortie :**
```c noexec
Date d;
d.mois = FEVRIER;
printf("%d", d.mois);  /* Affiche 2 (FEVRIER = 2) */
```

**Q8-Q9 - Getter par valeur :**
```c noexec
Mois getMois(Date d) {
    return d.mois;    /* . car d est une valeur (pas un pointeur) */
}
```

**Q10 - Saisie complete :**
```c noexec
void scanDate(Date *d) {
    printf("Jour: "); scanf("%d", &(d->jour));
    printf("Mois: "); scanf("%d", &(d->mois));
    printf("Annee: "); scanf("%d", &(d->annee));
    /* &(d->jour) : adresse du champ jour de la structure pointee par d */
}
```

**Q12 - Affichage avec mois en lettres (variable statique) :**
```c noexec
void printDateV2(Date d) {
    static char* nomMois[] = {
        "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
    };
    printf("Date: %d %s %d\n", d.jour, nomMois[d.mois - 1], d.annee);
    /* Pourquoi -1 ? Car JANVIER=1 mais l'indice du tableau commence a 0 */
}
```

**Q13 - Pourquoi static ?**
Le `static` evite de reinitialiser le tableau a chaque appel de la fonction. Le tableau est cree une seule fois en memoire et persiste.

**Q14 - Comparaison de dates :**
```c noexec
int equalDate(Date d1, Date d2) {
    return d1.jour == d2.jour && d1.mois == d2.mois && d1.annee == d2.annee;
}
```

**Q15 - Comparaison d'ordre :**
```c noexec
int compareDate(Date d1, Date d2) {
    /* 0 = d1 < d2, 1 = d1 == d2, 2 = d1 > d2 */
    if (equalDate(d1, d2)) return 1;
    if (d1.annee != d2.annee) return (d1.annee > d2.annee) ? 2 : 0;
    if (d1.mois != d2.mois) return (d1.mois > d2.mois) ? 2 : 0;
    return (d1.jour > d2.jour) ? 2 : 0;
}
```

**Q16 - Copie dynamique :**
```c noexec
Date* copyDate(Date d) {
    Date *res = (Date *)malloc(sizeof(Date));
    if (res == NULL) {
        fprintf(stderr, "Erreur d'allocation\n");
        exit(1);
    }
    res->jour = d.jour;
    res->mois = d.mois;
    res->annee = d.annee;
    return res;  /* L'appelant doit faire free() ! */
}
```

**Q17 - Recherche dans un tableau :**
```c noexec
Booleen searchBirthdayDate(Date aChercher, Date *tab, int nbDates) {
    for (int i = 0; i < nbDates; i++) {
        if (equalDate(aChercher, tab[i]))
            return TRUE;
    }
    return FALSE;
}
```

---

## DS 2016 : Batiments (exercice type structures + fichiers)

**Q1 - Enum :**
```c noexec
typedef enum {maison, immeuble, hopital, ecole, usine} NatureBat;
```

**Q2 - Constante :**
```c noexec
#define LG_MAX 63
```

**Q3 - Structure :**
```c noexec
typedef struct {
    int id;
    NatureBat nature;
    float hauteur;
    char ville[LG_MAX + 1];  /* +1 pour le '\0' (LG_MAX=63, donc 64 octets) */
} Batiment;
/* Note : dans la correction originale, le champ est char ville[LG_MAX] avec LG_MAX=63,
 * ce qui ne laisse que 62 caracteres utiles + '\0'. Utiliser LG_MAX+1 est plus robuste.
 */
```

**Q4-Q5 - Test de nature :**
```c noexec
int testUsine(Batiment bat) {
    return bat.nature == usine;
    /* Passage par valeur : bat est une COPIE, pas besoin de la modifier */
}
```

**Q6-Q7 - Modification de nature :**
```c noexec
void changeNature(Batiment *bat, NatureBat nat) {
    bat->nature = nat;
    /* Passage par POINTEUR car on MODIFIE la structure */
}
```

**Q8-Q9 - Modification de ville :**
```c noexec
void changeVille(Batiment *bat, char *nom) {
    strcpy(bat->ville, nom);
    /* ATTENTION : on ne peut PAS faire bat->ville = nom
     * car ville est un TABLEAU, pas un pointeur
     * Il faut utiliser strcpy pour copier les caracteres
     */
}
```

**Q10-Q11 - Ajout a un ensemble :**
```c noexec
typedef struct {
    int nbat;
    Batiment ens[NBATMAX];
} EnsBat;

int ajoutBatiment(EnsBat *bats, int id, NatureBat nat, float haut, char *ville) {
    if (bats->nbat >= NBATMAX) return 0;  /* Plus de place */
    
    Batiment b;
    b.id = id;
    b.nature = nat;
    b.hauteur = haut;
    strcpy(b.ville, ville);
    
    bats->ens[(bats->nbat)++] = b;  /* Ajoute et incremente */
    return 1;
}
```

**Q12-Q13 - Recherche par ville :**
```c noexec
void chercheDansVille(EnsBat ens, char *ville) {
    for (int i = 0; i < ens.nbat; i++) {
        if (!strcmp(ens.ens[i].ville, ville)) {
            /* strcmp retourne 0 si identiques -> !0 = vrai */
            printf("%d %f %s\n", ens.ens[i].id, ens.ens[i].hauteur, ens.ens[i].ville);
        }
    }
}
```

**Q14 - Difference EnsBat vs EnsBat2 :**
```c noexec
typedef struct { int nbat; Batiment ens[NBATMAX]; } EnsBat;   /* Taille fixe */
typedef struct { int nbat; Batiment *ens; } EnsBat2;          /* Taille dynamique */
/* EnsBat2 necessite malloc pour allouer ens, mais peut avoir n'importe quelle taille */
/* EnsBat est toujours de taille NBATMAX meme si on n'utilise qu'un batiment */
```

---

## DS 2014-2015 : Releves meteorologiques

**Structure de donnees :**
```c noexec
typedef struct {
    char nom[TAILLE_NOM_SITE];
    int min;
    int max;
} Releve;
```

**Ecriture dans un fichier :**
```c noexec
int enregistrerReleves(Releve tabRel[], int N, char *nomFichier) {
    FILE *f = fopen(nomFichier, "w");
    if (f == NULL) {
        fprintf(stderr, "Erreur d'ouverture %s\n", nomFichier);
        return 0;
    }
    
    for (int i = 0; i < N; i++) {
        fprintf(f, "%s %d %d\n", tabRel[i].nom, tabRel[i].min, tabRel[i].max);
    }
    
    fclose(f);
    return 1;
}
```

**Erreur dans la correction originale :** `fprintf("%s ...")` manque le descripteur de fichier. Le code correct est `fprintf(f, "%s %d %d\n", ...)`.

---

## Themes recurrents dans les annales

### 1. Toujours present : enum + struct + typedef
Chaque examen demande de definir un type enum et une structure. Savoir ecrire :
```c noexec
typedef enum { ... } NomEnum;
typedef struct { ... } NomStruct;
```

### 2. Toujours present : prototypes avec justification
Savoir quand utiliser un pointeur vs une valeur :
- **Valeur** (`void f(Struct s)`) : lecture seule, pas de modification
- **Pointeur** (`void f(Struct *s)`) : modification de la structure

### 3. Tres frequent : fscanf + fprintf
Pattern complet :
```c noexec
FILE *f = fopen(nom, "r");   /* ou "w" */
if (f == NULL) { fprintf(stderr, "Erreur\n"); return -1; }
/* ... fscanf/fprintf ... */
fclose(f);
```

### 4. Frequent : strcmp pour comparer des chaines
```c noexec
if (!strcmp(s1, s2)) { /* identiques */ }
/* OU */
if (strcmp(s1, s2) == 0) { /* identiques */ }
```

### 5. Frequent : malloc + free
```c noexec
Type *p = (Type *)malloc(n * sizeof(Type));
if (p == NULL) { /* erreur */ }
/* ... utilisation ... */
free(p);
```
