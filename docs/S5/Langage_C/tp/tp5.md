---
title: "TP5 - Allocation Dynamique et Listes Chainees"
sidebar_position: 5
---

# TP5 - Allocation Dynamique et Listes Chainees

## Objectifs
- Comprendre l'allocation dynamique (`malloc()`, `calloc()`, `free()`)
- Implementer une liste chainee
- Manipuler des pointeurs de fonctions
- Trier des donnees avec des criteres personnalises
- Gerer la memoire dynamique correctement

## Concepts Cles

### Allocation Dynamique
```c noexec
/* Allocation avec malloc() */
int *ptr = (int*)malloc(10 * sizeof(int));

/* Allocation et initialisation avec calloc() */
Element *elem = (Element*)calloc(1, sizeof(Element));

/* Liberation de la memoire */
free(ptr);
```

### Liste Chainee
Une liste chainee est une structure de donnees ou chaque element pointe vers le suivant :

```
[Tache1|*]-->[Tache2|*]-->[Tache3|NULL]
```

**Avantages :**
- Taille dynamique (croit/decroit selon les besoins)
- Insertion/suppression efficace en debut de liste (O(1))

**Inconvenients :**
- Acces sequentiel uniquement (pas d'acces direct par indice)
- Surcout memoire (pointeur pour chaque element)

### Pointeurs de Fonctions
Permettent de passer des fonctions en parametre :

```c noexec
int (*comparateur)(Tache, Tache);
comparateur = &compareID;  /* ou simplement compareID */
int resultat = comparateur(t1, t2);
```

## Structure de Donnees

```c noexec
typedef struct struct_element {
    Tache t;                        /* La tache stockee */
    struct struct_element *suivant; /* Pointeur vers l'element suivant */
} Element;

typedef Element* Liste;  /* Une liste est un pointeur vers le premier element */
```

## Fonctions Implementees

### Manipulation de Base
- `ajoutdeb()` - Ajoute un element en debut de liste
- `nbelement()` - Compte le nombre d'elements
- `afficheListe()` - Affiche tous les elements

### Insertion Triee
- `ajouttrie()` - Insere un element en maintenant l'ordre (generique)
- `ajouttrield()` - Insere trie par ID (version specialisee)

### Fonctions de Comparaison
- `compareID()` - Compare par numero de tache
- `compareDuree()` - Compare par duree
- `compareNom()` - Compare par titre (ordre lexicographique)

### Allocation Dynamique pour Fichiers
- `lireTachesFichierDyn()` - Lit un nombre variable de taches avec allocation dynamique

## Compilation et Execution

```bash
cd tp5/src
make
./main
```

## Exemple d'Utilisation

```c noexec
Liste l = NULL;  /* Liste vide */

/* Ajout de taches triees par ID */
for (int i = 0; i < nb; i++) {
    ajouttrie(&l, taches[i], compareID);
}

/* Affichage de la liste */
afficheListe(l);

/* Liberation de la memoire (a implementer) */
/* libererListe(&l); */
```

## Format de Fichier avec Taille

```
7
1 5 0  Analyse des besoins
2 8 1 1  Conception architecture
...
```
La premiere ligne indique le nombre de taches.

## Points Importants

### 1. Allocation Dynamique
```c noexec
/* malloc() - alloue sans initialiser */
int *tab = (int*)malloc(n * sizeof(int));

/* calloc() - alloue et initialise a zero */
int *tab = (int*)calloc(n, sizeof(int));

/* Toujours verifier le resultat */
if (tab == NULL) {
    fprintf(stderr, "Erreur d'allocation\n");
    exit(1);
}

/* Liberer la memoire apres utilisation */
free(tab);
tab = NULL;  /* Bonne pratique */
```

### 2. Insertion en Debut de Liste
```c noexec
void ajoutdeb(Liste *l, Tache t) {
    Element *elem = (Element*)calloc(1, sizeof(Element));
    elem->t = t;
    elem->suivant = *l;  /* Pointe vers l'ancienne tete */
    *l = elem;           /* Le nouvel element devient la tete */
}
```

### 3. Parcours de Liste
```c noexec
Element *courant = liste;
while (courant != NULL) {
    /* Traitement de courant->t */
    courant = courant->suivant;
}
```

### 4. Pointeurs de Fonctions
```c noexec
/* Declaration */
int (*comparateur)(Tache, Tache);

/* Assignation */
comparateur = compareID;

/* Appel */
if (comparateur(t1, t2) > 0) {
    /* t1 > t2 selon le critere */
}
```

### 5. Passage de Pointeurs vers Pointeurs
```c noexec
void modifier(Liste *l) {
    *l = nouvel_element;  /* Modifie la liste originale */
}

/* Appel */
Liste ma_liste = NULL;
modifier(&ma_liste);  /* Passe l'adresse du pointeur */
```

## Fuites Memoire

**ATTENTION :** Le code actuel ne libere pas la memoire allouee !

A implementer :
```c noexec
void libererListe(Liste *l) {
    while (*l != NULL) {
        Element *temp = *l;
        *l = (*l)->suivant;
        free(temp);
    }
}
```

## Concepts C Abordes

- Allocation dynamique (`malloc()`, `calloc()`, `free()`)
- Listes chainees
- Pointeurs de fonctions
- Passage par reference de pointeurs (`Liste *l`)
- Structures auto-referentes (`struct struct_element *suivant`)
- Gestion de la memoire heap
- Algorithmes d'insertion triee

## Extensions Possibles

- Implementation de la suppression d'elements
- Liste doublement chainee
- Recherche dans la liste
- Fusion de deux listes triees
- Detection de cycles (si la liste est circulaire)
