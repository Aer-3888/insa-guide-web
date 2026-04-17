---
title: "TP5 - Allocation Dynamique et Listes Chaînées"
sidebar_position: 5
---

# TP5 - Allocation Dynamique et Listes Chaînées

## Objectifs
- Comprendre l'allocation dynamique (`malloc()`, `calloc()`, `free()`)
- Implémenter une liste chaînée
- Manipuler des pointeurs de fonctions
- Trier des données avec des critères personnalisés
- Gérer la mémoire dynamique correctement

## Concepts Clés

### Allocation Dynamique
```c
/* Allocation avec malloc() */
int *ptr = (int*)malloc(10 * sizeof(int));

/* Allocation et initialisation avec calloc() */
Element *elem = (Element*)calloc(1, sizeof(Element));

/* Libération de la mémoire */
free(ptr);
```

### Liste Chaînée
Une liste chaînée est une structure de données où chaque élément pointe vers le suivant:

```
[Tache1|•]-->[Tache2|•]-->[Tache3|NULL]
```

**Avantages:**
- Taille dynamique (croît/décroît selon les besoins)
- Insertion/suppression efficace en début de liste (O(1))

**Inconvénients:**
- Accès séquentiel uniquement (pas d'accès direct par indice)
- Surcoût mémoire (pointeur pour chaque élément)

### Pointeurs de Fonctions
Permettent de passer des fonctions en paramètre:

```c
int (*comparateur)(Tache, Tache);
comparateur = &compareID;  /* ou simplement compareID */
int resultat = comparateur(t1, t2);
```

## Structure de Données

```c
typedef struct struct_element {
    Tache t;                        /* La tâche stockée */
    struct struct_element *suivant; /* Pointeur vers l'élément suivant */
} Element;

typedef Element* Liste;  /* Une liste est un pointeur vers le premier élément */
```

## Fonctions Implémentées

### Manipulation de Base
- `ajoutdeb()` - Ajoute un élément en début de liste
- `nbelement()` - Compte le nombre d'éléments
- `afficheListe()` - Affiche tous les éléments

### Insertion Triée
- `ajouttrie()` - Insère un élément en maintenant l'ordre (générique)
- `ajouttrield()` - Insère trié par ID (version spécialisée)

### Fonctions de Comparaison
- `compareID()` - Compare par numéro de tâche
- `compareDuree()` - Compare par durée
- `compareNom()` - Compare par titre (ordre lexicographique)

### Allocation Dynamique pour Fichiers
- `lireTachesFichierDyn()` - Lit un nombre variable de tâches avec allocation dynamique

## Compilation et Exécution

```bash
cd tp5/src
make
./main
```

## Exemple d'Utilisation

```c
Liste l = NULL;  /* Liste vide */

/* Ajout de tâches triées par ID */
for (int i = 0; i < nb; i++) {
    ajouttrie(&l, taches[i], compareID);
}

/* Affichage de la liste */
afficheListe(l);

/* Libération de la mémoire (à implémenter) */
/* libererListe(&l); */
```

## Format de Fichier avec Taille

```
7
1 5 0  Analyse des besoins
2 8 1 1  Conception architecture
...
```
La première ligne indique le nombre de tâches.

## Points Importants

### 1. Allocation Dynamique
```c
/* malloc() - alloue sans initialiser */
int *tab = (int*)malloc(n * sizeof(int));

/* calloc() - alloue et initialise à zéro */
int *tab = (int*)calloc(n, sizeof(int));

/* Toujours vérifier le résultat */
if (tab == NULL) {
    fprintf(stderr, "Erreur d'allocation\n");
    exit(1);
}

/* Libérer la mémoire après utilisation */
free(tab);
tab = NULL;  /* Bonne pratique */
```

### 2. Insertion en Début de Liste
```c
void ajoutdeb(Liste *l, Tache t) {
    Element *elem = (Element*)calloc(1, sizeof(Element));
    elem->t = t;
    elem->suivant = *l;  /* Pointe vers l'ancienne tête */
    *l = elem;           /* Le nouvel élément devient la tête */
}
```

### 3. Parcours de Liste
```c
Element *courant = liste;
while (courant != NULL) {
    /* Traitement de courant->t */
    courant = courant->suivant;
}
```

### 4. Pointeurs de Fonctions
```c
/* Déclaration */
int (*comparateur)(Tache, Tache);

/* Assignation */
comparateur = compareID;

/* Appel */
if (comparateur(t1, t2) > 0) {
    /* t1 > t2 selon le critère */
}
```

### 5. Passage de Pointeurs vers Pointeurs
```c
void modifier(Liste *l) {
    *l = nouvel_element;  /* Modifie la liste originale */
}

/* Appel */
Liste ma_liste = NULL;
modifier(&ma_liste);  /* Passe l'adresse du pointeur */
```

## Fuites Mémoire

**ATTENTION:** Le code actuel ne libère pas la mémoire allouée!

À implémenter:
```c
void libererListe(Liste *l) {
    while (*l != NULL) {
        Element *temp = *l;
        *l = (*l)->suivant;
        free(temp);
    }
}
```

## Concepts C Abordés

- Allocation dynamique (`malloc()`, `calloc()`, `free()`)
- Listes chaînées
- Pointeurs de fonctions
- Passage par référence de pointeurs (`Liste *l`)
- Structures auto-référentes (`struct struct_element *suivant`)
- Gestion de la mémoire heap
- Algorithmes d'insertion triée

## Extensions Possibles

- Implémentation de la suppression d'éléments
- Liste doublement chaînée
- Recherche dans la liste
- Fusion de deux listes triées
- Détection de cycles (si la liste est circulaire)
