---
title: "Chapitre 8 : Sujets Avances"
sidebar_position: 2
---

# Chapitre 8 : Sujets Avances

## 8.1 Pointeurs de fonctions

Un pointeur de fonction stocke l'adresse d'une fonction et permet de l'appeler indirectement.

### Declaration et utilisation

```c noexec
/* Declaration : int (*nom)(TypeParam1, TypeParam2) */
int (*comparateur)(Tache, Tache);

/* Assignation */
comparateur = compareID;       /* Nom de fonction = adresse */
comparateur = &compareID;      /* Equivalent (le & est optionnel) */

/* Appel */
int resultat = comparateur(t1, t2);
int resultat = (*comparateur)(t1, t2);  /* Notation explicite, equivalente */
```

### Fonctions de comparaison (TP5)

```c noexec
/* Comparaison par numero d'ID */
int compareID(Tache t, Tache c) {
    return (c.no) - (t.no);
}

/* Comparaison par duree */
int compareDuree(Tache t, Tache c) {
    return (c.duree) - (t.duree);
}

/* Comparaison par nom (lexicographique) */
int compareNom(Tache t, Tache c) {
    return strncmp(c.titre, t.titre, 64);
}
```

### Insertion triee generique (TP5)

Le meme code d'insertion fonctionne avec n'importe quel critere de tri :

```c noexec
void ajouttrie(Liste *l, Tache t, int (*ptrfonc)(Tache, Tache)) {
    /* Liste vide ou nouvel element doit etre en tete */
    if ((*l) == NULL || (*ptrfonc)((*l)->t, t) < 0) {
        ajoutdeb(l, t);
        return;
    }
    
    Element *act = (*l);
    Element *pre;
    
    /* Cherche la bonne position */
    while ((*ptrfonc)(act->t, t) > 0) {
        pre = act;
        act = act->suivant;
        if (act == NULL) {
            /* Inserer a la fin */
            Element *elem = (Element *)calloc(1, sizeof(Element));
            elem->suivant = NULL;
            elem->t = t;
            pre->suivant = elem;
            return;
        }
    }
    
    /* Inserer entre pre et act */
    Element *elem = (Element *)calloc(1, sizeof(Element));
    elem->suivant = act;
    elem->t = t;
    pre->suivant = elem;
}

/* Appels : meme fonction, criteres differents ! */
ajouttrie(&l, tache, compareID);     /* Tri par ID */
ajouttrie(&l, tache, compareDuree);  /* Tri par duree */
ajouttrie(&l, tache, compareNom);    /* Tri par nom */
```

### Pointeur de fonction comme parametre (TP6)

```c noexec
/* Appliquer un traitement a chaque ligne d'un fichier */
int traiterLignesFichier(FILE *f, int (*ptFonction)(char *)) {
    int cpt = 0;
    char tampon[TMAX];
    
    rewind(f);
    while (fgets(tampon, TMAX, f) != NULL) {
        cpt++;
        if (ptFonction != NULL)
            (*ptFonction)(tampon);
        else
            printf("%s", tampon);
    }
    return cpt;
}

/* Differents traitements, meme fonction de parcours */
traiterLignesFichier(pFile, rechercheNomSabotiers);  /* Cherche les sabotiers */
traiterLignesFichier(pFile, lireNom);                 /* Extrait les noms */
traiterLignesFichier(pFile, compterFemmes);           /* Compte les femmes */
traiterLignesFichier(pFile, NULL);                    /* Affiche tout */
```

## 8.2 Listes chainees

### Structure de base

```c noexec
typedef struct struct_element {
    Tache t;                           /* Donnee */
    struct struct_element *suivant;    /* Lien vers le suivant */
} Element;

typedef Element* Liste;  /* Liste = pointeur vers le premier element */
```

**Representation :**
```
Liste l :

l ----> [Tache1 | *] ----> [Tache2 | *] ----> [Tache3 | NULL]
         Element 1           Element 2           Element 3
```

### Operations fondamentales

#### Ajout en debut (O(1))

```c noexec
void ajoutdeb(Liste *l, Tache t) {
    Element *elem = (Element *)calloc(1, sizeof(Element));
    elem->t = t;
    elem->suivant = *l;   /* Le nouveau pointe vers l'ancienne tete */
    *l = elem;            /* Le nouveau devient la tete */
}
```

**Diagramme :**
```
AVANT :  l --> [B|*] --> [C|NULL]
AJOUT de A :
         elem --> [A|*] --> [B|*] --> [C|NULL]
         l = elem
APRES :  l --> [A|*] --> [B|*] --> [C|NULL]
```

#### Comptage des elements

```c noexec
int nbelement(Liste l) {
    int res = 0;
    while (l != NULL) {
        res++;
        l = l->suivant;
    }
    return res;
}
```

#### Parcours et affichage

```c noexec
void afficheListe(Liste l) {
    while (l != NULL) {
        afficheTache(&(l->t));
        l = l->suivant;
    }
}
```

#### Liberation de la liste (ESSENTIEL)

```c noexec
void libererListe(Liste *l) {
    while (*l != NULL) {
        Element *temp = *l;        /* Sauvegarde le noeud courant */
        *l = (*l)->suivant;        /* Avance au suivant */
        free(temp);                /* Libere le noeud sauvegarde */
    }
    /* *l est maintenant NULL */
}
```

### Insertion triee

```c noexec
void ajouttrield(Liste *l, Tache t) {
    /* Cas 1 : liste vide */
    if (*l == NULL) {
        ajoutdeb(l, t);
        return;
    }
    
    int id = t.no;
    Element *act = *l;
    Element *pre = NULL;
    
    /* Cherche la position d'insertion */
    while (id > act->t.no) {
        pre = act;
        act = act->suivant;
        
        /* Cas 2 : inserer a la fin */
        if (act == NULL) {
            Element *elem = (Element *)calloc(1, sizeof(Element));
            elem->suivant = NULL;
            elem->t = t;
            pre->suivant = elem;
            return;
        }
    }
    
    /* Cas 3 : inserer au milieu */
    Element *elem = (Element *)calloc(1, sizeof(Element));
    elem->suivant = act;
    elem->t = t;
    if (pre == NULL) {
        *l = elem;     /* Inserer en tete */
    } else {
        pre->suivant = elem;
    }
}
```

**Diagramme d'insertion triee (inserer ID=3) :**
```
AVANT :  l --> [1|*] --> [2|*] --> [5|*] --> [7|NULL]
                          pre       act

APRES :  l --> [1|*] --> [2|*] --> [3|*] --> [5|*] --> [7|NULL]
                          pre       elem      act
```

### Recherche dans une liste (cours - villes)

```c noexec
int recherche(Liste l, Ville v, int (*comp)(Ville, Ville)) {
    Liste tp = l;
    int nb = 0;
    while (tp != NULL) {
        if (comp(v, tp->v)) {
            return nb;   /* Retourne l'indice */
        }
        nb++;
        tp = tp->suivant;
    }
    return 0;  /* Non trouve */
}
```

## 8.3 Automates a etats finis (TP6)

Un automate permet de parser des fichiers structures en changeant d'etat selon les donnees lues.

### Structure de l'automate

```c noexec
typedef enum {EINIT, EINDI, ENAME} Etat;

typedef struct {
    Etat etat;          /* Etat courant */
    char nom[TMAX];     /* Memorise le nom en cours */
} EtatAutomate;
```

### Diagramme de transitions

```
                   [INDI]
    EINIT -----------------------> EINDI
      ^                              |
      |                              | [NAME]
      |                              v
      +------------ [OCCU] ------ ENAME
      |   (si condition remplie)     |
      |                              | [INDI]
      +------------------------------+
            (nouvel individu)
```

### Implementation

```c noexec
int rechercheNomSabotiers(char* str) {
    static EtatAutomate etatA = {EINIT, ""};   /* Variable STATIQUE */
    char trash[TMAX], extract[TMAX];
    int res;
    
    switch (etatA.etat) {
        case EINIT:
            /* Cherche un individu (balise INDI) */
            res = sscanf(str, " 0 @%*[^@]@ INDI%[ \r\n ]", trash);
            if (res == 1)
                etatA.etat = EINDI;
            break;
            
        case EINDI:
            /* Cherche le nom (balise NAME) */
            res = sscanf(str, " 1 NAME %*[^/\r\n]/%[^/]/%[ \r\n]", extract, trash);
            if (res == 2) {
                etatA.etat = ENAME;
                strncpy(etatA.nom, extract, TMAX);  /* Memorise le nom */
            }
            break;
            
        case ENAME:
            /* Cherche un nouvel individu ou une profession */
            res = sscanf(str, " 0 @%*[^@]@ INDI%[ \r\n ]", trash);
            if (res == 1) {
                etatA.etat = EINDI;  /* Nouvel individu */
            } else {
                /* Cherche la profession */
                res = sscanf(str, " 1 OCCU %[^\r\n]%[ \r\n]", extract, trash);
                if (res == 2 && strstr(extract, "sabotier") != NULL) {
                    printf("%s\n", etatA.nom);  /* Affiche le nom */
                    etatA.etat = EINIT;
                }
            }
            break;
    }
}
```

**Points cles :**
- La variable `static EtatAutomate etatA` conserve l'etat entre les appels
- `sscanf` avec des formats avances pour valider et extraire les donnees
- `strstr` pour la recherche de sous-chaine dans la profession

## 8.4 Nombres aleatoires (cours)

### Evolution des exemples du cours

```c noexec
/* Version A : sans seed -> toujours les memes valeurs */
#include <stdio.h>
#include <stdlib.h>

int main() {
    int a = rand();      /* Meme valeur a chaque execution */
    int b = rand();
    printf("a = %d; b = %d\n", a, b);
}
```

```c noexec
/* Version B : avec seed basee sur l'heure */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    srand(time(NULL));   /* Initialise le generateur (1 SEULE FOIS) */
    int a = rand();
    int b = rand();
    printf("a = %d; b = %d\n", a, b);
}
```

```c noexec
/* Version C : valeurs dans un intervalle */
int main() {
    srand(time(NULL));
    int a = rand() % 10;   /* Valeur entre 0 et 9 */
    int b = rand() % 10;
    printf("a = %d; b = %d\n", a, b);
}
```

**PIEGE : ne pas appeler srand() dans une boucle !**
```c noexec
/* MAUVAIS : les valeurs sont identiques si la boucle est rapide */
for (int i = 0; i < 10; i++) {
    srand(time(NULL));  /* Meme seed car time change toutes les secondes */
    printf("%d\n", rand());
}

/* BON : un seul srand() avant la boucle */
srand(time(NULL));
for (int i = 0; i < 10; i++) {
    printf("%d\n", rand());
}
```

## 8.5 Variables statiques et leur role

```c noexec
/* 1. Variable locale statique : persiste entre les appels */
void compteur() {
    static int n = 0;  /* Initialise UNE SEULE FOIS */
    n++;
    printf("Appel numero %d\n", n);
}
/* compteur() -> "Appel numero 1" */
/* compteur() -> "Appel numero 2" */
/* compteur() -> "Appel numero 3" */

/* 2. Fonction statique : visible uniquement dans le fichier */
static int fonctionPrivee(int x) {
    return x * 2;
}
/* Ne peut pas etre appelee depuis un autre fichier .c */

/* 3. Variable globale statique : visible uniquement dans le fichier */
static char mon_tas[MAX_MEMORY];
/* Protege la variable de l'acces externe */
```

## 8.6 Programmation generique en C

### Pattern : fonctions parametrees par pointeur de fonction

```c noexec
/* Comptage generique (TP6) */
typedef struct {
    char* modele;           /* Motif sscanf */
    char* message;          /* Message de resultat */
    unsigned int compteur;
} Comptage;

static int compter(Comptage* param, char *str) {
    if (str == NULL) {
        int cpts = param->compteur;  /* Sauvegarde AVANT la remise a zero */
        printf(param->message, param->compteur);
        param->compteur = 0;
        return cpts;  /* Retourne le compte sauvegarde */
    }
    char reste[TMAX];
    int res = sscanf(str, param->modele, reste);
    if (res == 1) param->compteur++;
    return res;
}

/* Instanciations : changent seulement le motif */
int compterIndividu(char *str) {
    static Comptage param = {
        " 0 @%*[^@]@ INDI%[ \r\n]",
        "Nombre d'individus: %d\n", 0
    };
    return compter(&param, str);
}

int compterFemmes(char *str) {
    static Comptage param = {
        " 1 SEX F%[ \r\n]",
        "Nombre de femmes trouvees: %d\n", 0
    };
    return compter(&param, str);
}
```

### Pattern : allocateur generique (TP7)

```c noexec
/* Mon_malloc retourne void* -> utilisable pour n'importe quel type */
void *Mon_malloc(size_t nb_octets);

/* L'appelant caste vers le type voulu */
int *tab_int = (int *)malloc(10 * sizeof(int));
double *tab_double = (double *)malloc(10 * sizeof(double));
Tache *tab_tache = (Tache *)calloc(7, sizeof(Tache));
```

---

## CHEAT SHEET - Sujets Avances

```
POINTEUR DE FONCTION :
  Declaration :  int (*cmp)(Tache, Tache);
  Assignation :  cmp = compareID;
  Appel :        cmp(t1, t2);
  En parametre : void f(int (*cmp)(Tache, Tache));

LISTE CHAINEE :
  Structure :    typedef struct node { int val; struct node *next; } Node;
  Ajout debut :  elem->suivant = *l; *l = elem;
  Parcours :     while (l != NULL) { ... l = l->suivant; }
  Liberation :   while (*l != NULL) { tmp = *l; *l = (*l)->suivant; free(tmp); }

AUTOMATE :
  static EtatAutomate etat = {INITIAL, ""};   /* Etat persistant */
  switch (etat.etat) { case ETAT1: ... break; case ETAT2: ... }

ALEATOIRE :
  srand(time(NULL));    /* 1 seule fois */
  rand() % N;           /* Valeur dans [0, N-1] */

STATIC :
  Variable locale static -> persiste entre les appels
  Fonction static -> visible dans le fichier seulement
  Variable globale static -> visible dans le fichier seulement

GENERIQUE :
  void* pour les types -> cast a l'utilisation
  int (*f)(...) pour le comportement -> polymorphisme
```
