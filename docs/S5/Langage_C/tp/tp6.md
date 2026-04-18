---
title: "TP6 - Analyse de Fichiers GEDCOM et Automates"
sidebar_position: 6
---

# TP6 - Analyse de Fichiers GEDCOM et Automates

## Objectifs
- Analyser des fichiers structures (format GEDCOM)
- Implementer un automate a etats finis
- Utiliser des pointeurs de fonctions pour les transitions
- Parser des donnees genealogiques
- Gerer des variables statiques

## Contexte : Format GEDCOM

GEDCOM (GEnealogical Data COMmunication) est un format standard pour echanger des donnees genealogiques.

**Structure :**
- Chaque ligne contient une balise (INDI, NAME, BIRT, OCCU, etc.)
- Les donnees sont organisees hierarchiquement
- Permet de retrouver les individus, leurs noms, professions, dates de naissance, etc.

**Exemple de fichier GEDCOM :**
```
0 @I1@ INDI
1 NAME Jean /Dupont/
1 BIRT
2 DATE 1 JAN 1950
1 OCCU Ingenieur
```

## Automate a Etats Finis

Un automate permet de parser le fichier ligne par ligne en changeant d'etat selon les balises rencontrees.

**Etats :**
- `EINIT` : Etat initial (recherche d'individu)
- `EINDI` : Individu detecte (en attente du nom)
- `ENAME` : Nom detecte (peut aller vers profession)

**Transitions :**
```
EINIT --[INDI]--> EINDI
EINDI --[NAME]--> ENAME
ENAME --[OCCU]--> EINIT (affichage si condition remplie)
ENAME --[INDI]--> EINDI (nouvel individu)
```

## Structure de l'Automate

```c noexec
/* Etats possibles */
typedef enum {EINIT, EINDI, ENAME, NBETAT} Etat;

/* Structure de l'automate */
typedef struct {
    Etat etat;      /* Etat courant */
    char nom[TMAX]; /* Memorise le nom en cours */
} EtatAutomate;
```

## Fonctions Principales

### Recherche Simple
- `rechercheNomSabotiers()` - Trouve les individus dont la profession contient "sabot"

### Automate
- `int recherche(char *str, char *chIndi, char *extract, ...)` 
  - Fonction generique de recherche par automate
  - Utilise des pointeurs de fonction pour personnaliser les transitions

### Traitement des Balises
- Detection des balises : `INDI`, `NAME`, `OCCU`, `BIRT`, etc.
- Extraction des donnees utiles
- Variables statiques pour memoriser l'etat entre les appels

## Exercices du TP

1. **Compter les femmes/hommes** dans le fichier (balise SEX)
2. **Compter les naissances** (balise BIRT)
3. **Trouver les professions contenant un mot** (ex : "sabot")
4. **Identifier la variable memorisant le nom** (variable statique dans l'automate)
5. **Comprendre les transitions programmees** dans le code fourni
6. **Creer automaton.h** et tester la fonction
7. **Afficher tous les individus** dont la profession contient un mot donne

## Compilation et Execution

```bash
cd tp6/src

# Version simple (sans automate)
make simple
./simple

# Version complete (avec automate)
make gedcom
./gedcom fichier.ged
```

## Points Importants

### 1. Variables Statiques
```c noexec
static EtatAutomate etatA = {EINIT, ""};
```
Une variable statique conserve sa valeur entre les appels de fonction (memorisation de l'etat).

### 2. Pointeurs de Fonctions
```c noexec
int (*scanner)(char *str, char *chIndi, char *extract);
scanner = sscanf;  /* Fonction a utiliser pour l'extraction */
```

### 3. Lecture de Lignes
```c noexec
char ligne[TMAX];
while (fgets(ligne, TMAX, fichier) != NULL) {
    /* Traitement de la ligne */
}
```

### 4. Switch sur Enumerations
```c noexec
switch (etatA.etat) {
    case EINIT:
        /* Actions en etat initial */
        break;
    case EINDI:
        /* Actions apres detection d'individu */
        break;
    /* ... */
}
```

## Concepts C Abordes

- Automates a etats finis
- Variables statiques (memorisation d'etat)
- Pointeurs de fonctions
- Enumerations (`enum`)
- Analyse de fichiers structures
- `sscanf()` pour parser des chaines
- `strstr()` pour rechercher des sous-chaines
- Switch/case

## Extensions Possibles

- Parser toutes les informations GEDCOM (dates, lieux, relations)
- Construire un arbre genealogique en memoire
- Exporter vers d'autres formats (JSON, XML)
- Recherches avancees (ancetres, descendants)
- Statistiques sur les donnees genealogiques
