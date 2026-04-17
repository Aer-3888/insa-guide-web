---
title: "TP6 - Analyse de Fichiers GEDCOM et Automates"
sidebar_position: 6
---

# TP6 - Analyse de Fichiers GEDCOM et Automates

## Objectifs
- Analyser des fichiers structurés (format GEDCOM)
- Implémenter un automate à états finis
- Utiliser des pointeurs de fonctions pour les transitions
- Parser des données généalogiques
- Gérer des variables statiques

## Contexte: Format GEDCOM

GEDCOM (GEnealogical Data COMmunication) est un format standard pour échanger des données généalogiques.

**Structure:**
- Chaque ligne contient une balise (INDI, NAME, BIRT, OCCU, etc.)
- Les données sont organisées hiérarchiquement
- Permet de retrouver les individus, leurs noms, professions, dates de naissance, etc.

**Exemple de fichier GEDCOM:**
```
0 @I1@ INDI
1 NAME Jean /Dupont/
1 BIRT
2 DATE 1 JAN 1950
1 OCCU Ingénieur
```

## Automate à États Finis

Un automate permet de parser le fichier ligne par ligne en changeant d'état selon les balises rencontrées.

**États:**
- `EINIT` : État initial (recherche d'individu)
- `EINDI` : Individu détecté (en attente du nom)
- `ENAME` : Nom détecté (peut aller vers profession)

**Transitions:**
```
EINIT --[INDI]--> EINDI
EINDI --[NAME]--> ENAME
ENAME --[OCCU]--> EINIT (affichage si condition remplie)
ENAME --[INDI]--> EINDI (nouvel individu)
```

## Structure de l'Automate

```c
/* États possibles */
typedef enum {EINIT, EINDI, ENAME, NBETAT} Etat;

/* Structure de l'automate */
typedef struct {
    Etat etat;      /* État courant */
    char nom[TMAX]; /* Mémorise le nom en cours */
} EtatAutomate;
```

## Fonctions Principales

### Recherche Simple
- `rechercheNomSabotiers()` - Trouve les individus dont la profession contient "sabot"

### Automate
- `int recherche(char *str, char *chIndi, char *extract, ...)` 
  - Fonction générique de recherche par automate
  - Utilise des pointeurs de fonction pour personnaliser les transitions

### Traitement des Balises
- Détection des balises: `INDI`, `NAME`, `OCCU`, `BIRT`, etc.
- Extraction des données utiles
- Variables statiques pour mémoriser l'état entre les appels

## Exercices du TP

1. **Compter les femmes/hommes** dans le fichier (balise SEX)
2. **Compter les naissances** (balise BIRT)
3. **Trouver les professions contenant un mot** (ex: "sabot")
4. **Identifier la variable mémorisant le nom** (variable statique dans l'automate)
5. **Comprendre les transitions programmées** dans le code fourni
6. **Créer automaton.h** et tester la fonction
7. **Afficher tous les individus** dont la profession contient un mot donné

## Compilation et Exécution

```bash
cd tp6/src

# Version simple (sans automate)
make simple
./simple

# Version complète (avec automate)
make gedcom
./gedcom fichier.ged
```

## Points Importants

### 1. Variables Statiques
```c
static EtatAutomate etatA = {EINIT, ""};
```
Une variable statique conserve sa valeur entre les appels de fonction (mémorisation de l'état).

### 2. Pointeurs de Fonctions
```c
int (*scanner)(char *str, char *chIndi, char *extract);
scanner = sscanf;  /* Fonction à utiliser pour l'extraction */
```

### 3. Lecture de Lignes
```c
char ligne[TMAX];
while (fgets(ligne, TMAX, fichier) != NULL) {
    /* Traitement de la ligne */
}
```

### 4. Switch sur Énumérations
```c
switch (etatA.etat) {
    case EINIT:
        /* Actions en état initial */
        break;
    case EINDI:
        /* Actions après détection d'individu */
        break;
    /* ... */
}
```

## Concepts C Abordés

- Automates à états finis
- Variables statiques (mémorisation d'état)
- Pointeurs de fonctions
- Énumérations (`enum`)
- Analyse de fichiers structurés
- `sscanf()` pour parser des chaînes
- `strstr()` pour rechercher des sous-chaînes
- Switch/case

## Extensions Possibles

- Parser toutes les informations GEDCOM (dates, lieux, relations)
- Construire un arbre généalogique en mémoire
- Exporter vers d'autres formats (JSON, XML)
- Recherches avancées (ancêtres, descendants)
- Statistiques sur les données généalogiques
