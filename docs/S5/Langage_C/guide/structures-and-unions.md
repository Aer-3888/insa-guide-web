---
title: "Chapitre 5 : Structures, Enumerations et Unions"
sidebar_position: 9
---

# Chapitre 5 : Structures, Enumerations et Unions

## 5.1 Structures (struct)

Une structure regroupe des variables de types differents sous un meme nom.

### Declaration et typedef

```c noexec
/* Methode 1 : struct seul */
struct Batiment {
    int id;
    float hauteur;
    char ville[64];
};
struct Batiment b;  /* Doit ecrire "struct" a chaque utilisation */

/* Methode 2 : typedef (recommandee, utilisee dans le cours) */
typedef struct {
    int no;
    int duree;
    int nbPred;
    int pred[NMAXPRED];
    char titre[LGMAX];
} Tache;
Tache t;  /* Plus besoin de "struct" */

/* Methode 3 : typedef avec nom de struct (pour auto-reference) */
typedef struct struct_element {
    Tache t;
    struct struct_element *suivant;  /* Auto-reference : besoin du nom struct */
} Element;
```

### Initialisation et acces aux champs

```c noexec
/* Initialisation a la declaration */
Tache t = {1, 5, 0, {0}, "Analyse des besoins"};

/* Initialisation champ par champ */
Tache t;
t.no = 1;
t.duree = 5;
t.nbPred = 0;
strcpy(t.titre, "Analyse des besoins");

/* Initialisation designee (C99+) */
Tache t = {.no = 1, .duree = 5, .titre = "Analyse"};
```

### Acces aux champs : `.` vs `->`

```c noexec
Tache t;
Tache *ptr = &t;

/* Acces direct (variable) : operateur point . */
t.no = 1;
t.duree = 5;
printf("%s\n", t.titre);

/* Acces via pointeur : operateur fleche -> */
ptr->no = 1;          /* Equivalent a (*ptr).no = 1 */
ptr->duree = 5;       /* Equivalent a (*ptr).duree = 5 */
printf("%s\n", ptr->titre);

/* IMPORTANT : -> est un raccourci pour (*ptr). */
/* ptr->champ  ==  (*ptr).champ */
```

**Diagramme memoire d'une structure Tache :**
```
Tache t :
+--------+---------+----------+-----------------+--------------------+
| no (4) | duree(4)| nbPred(4)| pred[16] (64)   | titre[64] (64)     |
+--------+---------+----------+-----------------+--------------------+
|   1    |    5    |    0     | 0,0,0,...       | "Analyse des b..." |
+--------+---------+----------+-----------------+--------------------+
                                                Total : ~140 octets
```

## 5.2 Structures et fonctions

### Passage par valeur (lecture seule)

```c noexec
/* La structure est COPIEE -> pas de modification possible */
void afficherReleve(Releve r) {
    printf("Nom: %s -> min=%d, max=%d\n", r.nom, r.min, r.max);
}

int testUsine(Batiment bat) {
    return bat.nature == usine;
}
```

### Passage par pointeur (modification possible)

```c noexec
/* On passe l'ADRESSE -> modification possible */
void saisirReleve(Releve *r) {
    printf("Nom du site: ");
    scanf("%s", r->nom);       /* r->nom car r est un pointeur */
    printf("Temperature min: ");
    scanf("%d", &(r->min));    /* &(r->min) : adresse du champ min */
    printf("Temperature max: ");
    scanf("%d", &(r->max));
}

void changeNature(Batiment *bat, NatureBat nat) {
    bat->nature = nat;
}

void changeVille(Batiment *bat, char *nom) {
    strcpy(bat->ville, nom);  /* Copie la chaine dans le champ */
}
```

**Quand utiliser quoi :**
- Passage par **valeur** : lecture seule, petites structures
- Passage par **pointeur** : modification, grosses structures (evite la copie)

## 5.3 Tableaux de structures

```c noexec
#define MAXTACHES 64
Tache tabTaches[MAXTACHES];

/* Acces a un element */
tabTaches[0].no = 1;
tabTaches[0].duree = 5;

/* Passage a une fonction */
void afficheTabTaches(Tache *tab_t, int nbtaches) {
    for (int i = 0; i < nbtaches; i++) {
        afficheTache(&tab_t[i]);  /* Passe l'adresse de chaque tache */
    }
}

/* Ensemble de structures (DS 2016) */
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
    
    bats->ens[(bats->nbat)++] = b;  /* Ajoute et incremente le compteur */
    return 1;
}
```

## 5.4 Enumerations (enum)

```c noexec
/* Definition */
typedef enum {maison, immeuble, hopital, ecole, usine} NatureBat;
/* maison=0, immeuble=1, hopital=2, ecole=3, usine=4 */

/* Avec valeurs explicites */
typedef enum {
    JANVIER = 1, FEVRIER, MARS, AVRIL, MAI, JUIN,
    JUILLET, AOUT, SEPTEMBRE, OCTOBRE, NOVEMBRE, DECEMBRE
} Mois;
/* JANVIER=1, FEVRIER=2, ..., DECEMBRE=12 */

/* Utilisation */
NatureBat n = usine;
if (n == usine) { ... }

/* Enum pour les etats d'un automate (TP6) */
typedef enum {EINIT, EINDI, ENAME} Etat;

/* Enum pour les statuts memoire (TP7) */
typedef enum {LIBRE, OCCUPE} Statut_memoire;

/* Enum pour les booleens (DS 2020) */
typedef enum {FALSE, TRUE} Booleen;
```

**Astuce examen : affichage enum avec tableau de chaines :**
```c noexec
/* DS 2020 - Question 12 */
void printDateV2(Date d) {
    static char* nomMois[] = {
        "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
    };
    printf("Date: %d %s %d\n", d.jour, nomMois[d.mois - 1], d.annee);
}
/* Le tableau static evite la reinitialisation a chaque appel */
```

## 5.5 Structures auto-referentes

Une structure qui contient un pointeur vers elle-meme. Essentielle pour les listes chainees.

```c noexec
typedef struct struct_element {
    Tache t;                           /* Donnee stockee */
    struct struct_element *suivant;    /* Pointeur vers le suivant */
} Element;

typedef Element* Liste;  /* Une liste = pointeur vers le 1er element */
```

**IMPORTANT : on ne peut PAS ecrire :**
```c noexec
typedef struct {
    int data;
    Element *suivant;  /* ERREUR : Element n'est pas encore defini ! */
} Element;
```

**Il faut utiliser le nom struct :**
```c noexec
typedef struct struct_element {
    int data;
    struct struct_element *suivant;  /* OK : struct struct_element est defini */
} Element;
```

## 5.6 Descripteur de bloc memoire (TP7)

```c noexec
typedef struct descript {
    size_t size;              /* Taille du bloc en octets */
    Statut_memoire statut;    /* LIBRE ou OCCUPE */
    struct descript *suiv;    /* Chainage vers le bloc suivant */
} Descript_mem;
```

**Layout memoire du tas :**
```
|--- Descript_mem ---|--------- Donnees utiles ----------|--- Descript_mem ---|
[size=400|OCCUPE|*] [400 octets de donnees utilisateur ] [size=999200|LIBRE|NULL]
^                    ^                                    ^
|                    |                                    |
liste_bloc_mem       pointeur retourne par malloc         bloc_suivant
```

## 5.7 Structures de comptage (TP6)

Structure utilisee pour parametriser les fonctions de comptage dans le TP6 GEDCOM :

```c noexec
typedef struct {
    char* modele;           /* Motif sscanf pour la detection */
    char* message;          /* Message d'affichage du resultat */
    unsigned int compteur;  /* Compteur d'occurrences */
} Comptage;

/* Utilisation avec une variable statique */
int compterFemmes(char* str) {
    static Comptage param = {
        " 1 SEX F%[ \r\n]",              /* Motif de detection */
        "Nombre de femmes trouvees: %d\n", /* Message */
        0                                  /* Compteur initial */
    };
    return compter(&param, str);
}
```

---

## CHEAT SHEET - Structures et Enumerations

```
DECLARATION :
  typedef struct { int x; int y; } Point;       /* Sans auto-reference */
  typedef struct node { int val; struct node *next; } Node;  /* Avec auto-ref */

ACCES :
  variable.champ       /* Acces direct */
  pointeur->champ      /* Acces via pointeur = (*pointeur).champ */

PASSAGE A FONCTION :
  f(Struct s)           /* Par valeur (copie, lecture seule) */
  f(Struct *s)          /* Par pointeur (modification possible) */

ENUM :
  typedef enum {A, B, C} Nom;   /* A=0, B=1, C=2 */
  typedef enum {A=1, B, C} Nom; /* A=1, B=2, C=3 */

TABLEAU DE STRUCT :
  Tache tab[64];
  tab[0].no = 1;
  afficheTache(&tab[0]);

SIZEOF :
  sizeof(struct) >= somme des sizeof(champs)  /* A cause du padding */
  Le compilateur peut inserer des octets de padding pour l'alignement

INITIALISATION :
  Tache t = {1, 5, 0, {0}, "titre"};          /* Dans l'ordre */
  Tache t = {.no = 1, .duree = 5};            /* Par nom (C99) */
```
