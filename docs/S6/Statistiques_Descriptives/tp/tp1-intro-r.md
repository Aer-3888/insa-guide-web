---
title: "TP1: Introduction au logiciel R"
sidebar_position: 1
---

# TP1: Introduction au logiciel R

## Objectifs

Introduction aux fondamentaux du langage R pour l'analyse statistique :
- Manipulation de vecteurs et matrices
- Calcul matriciel pour la regression multiple
- Importation et fusion de donnees
- Visualisation de distributions
- Manipulation de data frames complexes

## Structure

```
TP1/
├── README.md                    # Ce fichier
├── Sujet TP1.pdf               # Enonce officiel
├── src/
│   └── TP1_solutions.R         # Solutions commentees et nettoyees
├── Donnees_TP1/                # Jeux de donnees
│   ├── test1.csv, test2.csv, test3.csv
│   ├── etat1.csv, etat2.csv, etat3.csv
│   ├── Dommages.txt
│   ├── Mortalite.csv
│   └── Intensite.txt
└── (fichiers originaux)        # Deplaces vers _originals/
```

## Exercices

### Exercice 1 : Vecteurs
Creation et manipulation de vecteurs avec `rep()`, `seq()`, traitement des NA, transformations vectorielles.

**Concepts cles :**
- `rep()` pour repeter des sequences
- `is.na()` pour detecter les valeurs manquantes
- Vectorisation des operations
- Indexation conditionnelle

### Exercice 2 : Matrices
Creation de matrices, extraction de sous-ensembles, calcul du determinant et de l'inverse, fonctions sur colonnes/lignes.

**Concepts cles :**
- `cbind()` et `rbind()` pour construire des matrices
- `diag()`, `det()`, `solve()` pour les operations matricielles
- `apply()` pour appliquer des fonctions par dimension
- Produit matriciel `%*%`

### Exercice 3 : Regression multiple (calcul matriciel)
Calcul manuel des coefficients de regression multiple avec le jeu de donnees `mtcars`.

**Formule :** $\hat{\beta} = (X'X)^{-1}X'y$

**Concepts cles :**
- Construction de la matrice de design X
- Transposition `t()`
- Inverse avec `solve()`
- Verification avec `lm()`

### Exercice 4 : Importation et fusion de donnees
Lecture de fichiers avec differents formats (CSV, texte) et fusion de tables.

**Concepts cles :**
- `read.table()`, `read.csv()`, `read.csv2()` et leurs parametres (sep, dec, header)
- `merge()` pour fusionner sur une colonne commune
- `cbind()` et `rbind()` pour concatener
- Difference entre les fonctions de lecture

### Exercice 5 : Comparaison de distributions
Visualisation de la loi normale et de la loi de Student avec differents degres de liberte.

**Concepts cles :**
- `curve()` pour tracer des fonctions
- `dnorm()` et `dt()` pour les densites
- `add=TRUE` pour superposer des courbes
- `legend()` pour les legendes

### Exercice 6 : Fonctions par morceaux
Tracer plusieurs fonctions definies sur differents intervalles.

**Concepts cles :**
- Definition de domaines avec `from` et `to`
- Superposition de courbes
- Fonctions polynomiales et lineaires

### Exercice 7 : Etude des ouragans (cas pratique)
Analyse complete d'un jeu de donnees sur les ouragans : importation, nettoyage, fusion, categorisation, analyse descriptive.

**Donnees :**
- `Intensite.txt` : vitesse du vent (noeuds)
- `Dommages.txt` : couts des dommages
- `Mortalite.csv` : nombre de victimes

**Demarche :**
1. Importer les 3 fichiers
2. Filtrer les ouragans (noeuds >= 64)
3. Supprimer les lignes avec NA
4. Creer une variable categorielle (echelle de Saffir-Simpson)
5. Fusionner les tables
6. Trier par annee
7. Calculer le cout moyen par categorie
8. Visualiser la distribution temporelle

**Concepts cles :**
- `subset()` pour filtrer
- `apply(!is.na(), 1, all)` pour supprimer les NA
- Creation de facteurs avec conditions multiples
- `by()` pour calculer des statistiques par groupe
- `hist()` et `barplot()` pour la visualisation

## Execution

```r noexec
# Se placer dans le repertoire TP1
setwd("~/Documents/Project/Insa/S6/Statistiques_Descriptives/tp/TP1")

# Executer le script complet
source("src/TP1_solutions.R")

# Ou executer par exercice (sections separees par des commentaires)
```

## Notes importantes

- **Indexation R :** Les indices commencent a 1 (pas 0 comme en Python)
- **Selection :**
  - `df[1, ]` : ligne 1
  - `df[, 1]` : colonne 1
  - `df[-3]` : toutes les colonnes sauf la 3eme
- **Separateurs CSV :**
  - `read.csv()` : sep=","
  - `read.csv2()` : sep=";"
- **Fusion :**
  - `merge()` : fusion SQL-like sur colonne commune
  - `cbind()` : concatenation horizontale (meme nb de lignes)
  - `rbind()` : concatenation verticale (memes colonnes)

## Ressources

- Documentation R : `help(function_name)` ou `?function_name`
- Jeux de donnees integres : `data()` pour lister, `?mtcars` pour la doc
- RStudio : environnement de developpement recommande
