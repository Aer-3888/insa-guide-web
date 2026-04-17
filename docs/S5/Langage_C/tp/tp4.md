---
title: "TP4 - Structures et Entrées/Sorties Fichier"
sidebar_position: 4
---

# TP4 - Structures et Entrées/Sorties Fichier

## Objectifs
- Définir et manipuler des structures (`struct`)
- Lire et écrire dans des fichiers texte
- Utiliser `fscanf()` et `fprintf()` pour les E/S formatées
- Gérer les erreurs d'ouverture/fermeture de fichiers
- Manipuler des tableaux de structures

## Contexte

Ce TP implémente un système de gestion de tâches pour la planification de projets.
Chaque tâche a:
- Un numéro d'identification
- Une durée (en heures)
- Des prédécesseurs (tâches à terminer avant)
- Un titre descriptif

## Structure de Données

```c
typedef struct {
    int no;                 /* Numéro de la tâche */
    int duree;              /* Durée en heures */
    int nbPred;             /* Nombre de prédécesseurs */
    int pred[NMAXPRED];     /* Tableau des numéros de prédécesseurs */
    char titre[LGMAX];      /* Titre de la tâche */
} Tache;
```

## Format de Fichier

Chaque ligne du fichier représente une tâche:
```
<no> <duree> <nbPred> [<pred1> <pred2> ...] <titre>
```

**Exemple:**
```
1 5 0  Analyse des besoins
2 8 1 1  Conception architecture
3 12 1 2  Développement module A
4 10 2 2 3  Tests d'intégration
```

## Fonctions Implémentées

### Lecture/Écriture
- `saisieTache()` - Lit une tâche depuis un fichier
- `lireTachesFichier()` - Lit toutes les tâches d'un fichier
- `ecrireTachesFichier()` - Écrit les tâches dans un fichier

### Affichage
- `afficheTache()` - Affiche une tâche
- `afficheTabTaches()` - Affiche un tableau de tâches

### Calculs
- `sommeDureeTotale()` - Calcule la durée totale du projet

## Compilation et Exécution

```bash
cd tp4/src
make
./main
```

## Exemple de Fichier d'Entrée (taches.txt)

```
1 5 0  Analyse des besoins
2 8 1 1  Conception
3 12 2 1 2  Développement
4 6 1 3  Tests
```

## Points Importants

### 1. Ouverture de Fichiers
```c
FILE *fichier = fopen("nom.txt", "r");  /* Lecture */
if (fichier == NULL) {
    fprintf(stderr, "Erreur d'ouverture\n");
    exit(1);
}
```

Modes:
- `"r"` - Lecture (le fichier doit exister)
- `"w"` - Écriture (crée ou écrase le fichier)
- `"a"` - Ajout (écrit à la fin)

### 2. Lecture Formatée avec fscanf()
```c
fscanf(f, "%d %d %d", &t->no, &t->duree, &t->nbPred);
fscanf(f, "%[^\n]s", t->titre);  /* Lit jusqu'au \n */
```

### 3. Écriture Formatée avec fprintf()
```c
fprintf(f, "%d %d %d ", t->no, t->duree, t->nbPred);
fprintf(f, "%s\n", t->titre);
```

### 4. Fermeture de Fichier
```c
if (fclose(fichier)) {
    fprintf(stderr, "Erreur à la fermeture\n");
}
```
**Important:** Toujours fermer les fichiers ouverts!

### 5. Détection de Fin de Fichier
```c
while (!feof(fichier)) {
    /* Lecture... */
}
```

## Concepts C Abordés

- Structures (`typedef struct`)
- Pointeurs vers structures (`t->membre` ou `(*t).membre`)
- E/S fichier (`fopen()`, `fclose()`, `fscanf()`, `fprintf()`)
- Gestion d'erreurs (vérification de `NULL`, code retour)
- Tableaux de structures
- Formats de lecture avancés (`%[^\n]` pour lire jusqu'au newline)

## Extension Possible

- Tri des tâches par durée
- Calcul du chemin critique (PERT/CPM)
- Détection de cycles dans les dépendances
- Export vers d'autres formats (JSON, CSV)
