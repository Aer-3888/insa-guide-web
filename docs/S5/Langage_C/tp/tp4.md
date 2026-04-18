---
title: "TP4 - Structures et Entrees/Sorties Fichier"
sidebar_position: 4
---

# TP4 - Structures et Entrees/Sorties Fichier

## Objectifs
- Definir et manipuler des structures (`struct`)
- Lire et ecrire dans des fichiers texte
- Utiliser `fscanf()` et `fprintf()` pour les E/S formatees
- Gerer les erreurs d'ouverture/fermeture de fichiers
- Manipuler des tableaux de structures

## Contexte

Ce TP implemente un systeme de gestion de taches pour la planification de projets.
Chaque tache a :
- Un numero d'identification
- Une duree (en heures)
- Des predecesseurs (taches a terminer avant)
- Un titre descriptif

## Structure de Donnees

```c noexec
typedef struct {
    int no;                 /* Numero de la tache */
    int duree;              /* Duree en heures */
    int nbPred;             /* Nombre de predecesseurs */
    int pred[NMAXPRED];     /* Tableau des numeros de predecesseurs */
    char titre[LGMAX];      /* Titre de la tache */
} Tache;
```

## Format de Fichier

Chaque ligne du fichier represente une tache :
```
<no> <duree> <nbPred> [<pred1> <pred2> ...] <titre>
```

**Exemple :**
```
1 5 0  Analyse des besoins
2 8 1 1  Conception architecture
3 12 1 2  Developpement module A
4 10 2 2 3  Tests d'integration
```

## Fonctions Implementees

### Lecture/Ecriture
- `saisieTache()` - Lit une tache depuis un fichier
- `lireTachesFichier()` - Lit toutes les taches d'un fichier
- `ecrireTachesFichier()` - Ecrit les taches dans un fichier

### Affichage
- `afficheTache()` - Affiche une tache
- `afficheTabTaches()` - Affiche un tableau de taches

### Calculs
- `sommeDureeTotale()` - Calcule la duree totale du projet

## Compilation et Execution

```bash
cd tp4/src
make
./main
```

## Exemple de Fichier d'Entree (taches.txt)

```
1 5 0  Analyse des besoins
2 8 1 1  Conception
3 12 2 1 2  Developpement
4 6 1 3  Tests
```

## Points Importants

### 1. Ouverture de Fichiers
```c noexec
FILE *fichier = fopen("nom.txt", "r");  /* Lecture */
if (fichier == NULL) {
    fprintf(stderr, "Erreur d'ouverture\n");
    exit(1);
}
```

Modes :
- `"r"` - Lecture (le fichier doit exister)
- `"w"` - Ecriture (cree ou ecrase le fichier)
- `"a"` - Ajout (ecrit a la fin)

### 2. Lecture Formatee avec fscanf()
```c noexec
fscanf(f, "%d %d %d", &t->no, &t->duree, &t->nbPred);
fscanf(f, "%[^\n]s", t->titre);  /* Lit jusqu'au \n */
```

### 3. Ecriture Formatee avec fprintf()
```c noexec
fprintf(f, "%d %d %d ", t->no, t->duree, t->nbPred);
fprintf(f, "%s\n", t->titre);
```

### 4. Fermeture de Fichier
```c noexec
if (fclose(fichier)) {
    fprintf(stderr, "Erreur a la fermeture\n");
}
```
**Important :** Toujours fermer les fichiers ouverts !

### 5. Detection de Fin de Fichier
```c noexec
while (!feof(fichier)) {
    /* Lecture... */
}
```

## Concepts C Abordes

- Structures (`typedef struct`)
- Pointeurs vers structures (`t->membre` ou `(*t).membre`)
- E/S fichier (`fopen()`, `fclose()`, `fscanf()`, `fprintf()`)
- Gestion d'erreurs (verification de `NULL`, code retour)
- Tableaux de structures
- Formats de lecture avances (`%[^\n]` pour lire jusqu'au newline)

## Extensions Possibles

- Tri des taches par duree
- Calcul du chemin critique (PERT/CPM)
- Detection de cycles dans les dependances
- Export vers d'autres formats (JSON, CSV)
