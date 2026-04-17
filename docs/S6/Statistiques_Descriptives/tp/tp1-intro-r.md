---
title: "TP1: Introduction au logiciel R"
sidebar_position: 1
---

# TP1: Introduction au logiciel R

## Objectifs

Introduction aux fondamentaux du langage R pour l'analyse statistique:
- Manipulation de vecteurs et matrices
- Calcul matriciel pour la régression multiple
- Importation et fusion de données
- Visualisation de distributions
- Manipulation de data frames complexes

## Structure

```
TP1/
├── README.md                    # Ce fichier
├── Sujet TP1.pdf               # Énoncé officiel
├── src/
│   └── TP1_solutions.R         # Solutions commentées et nettoyées
├── Donnees_TP1/                # Jeux de données
│   ├── test1.csv, test2.csv, test3.csv
│   ├── etat1.csv, etat2.csv, etat3.csv
│   ├── Dommages.txt
│   ├── Mortalite.csv
│   └── Intensite.txt
└── (fichiers originaux)        # Déplacés vers _originals/
```

## Exercices

### Exercice 1: Vecteurs
Création et manipulation de vecteurs avec `rep()`, `seq()`, traitement des NA, transformations vectorielles.

**Concepts clés:**
- `rep()` pour répéter des séquences
- `is.na()` pour détecter les valeurs manquantes
- Vectorisation des opérations
- Indexation conditionnelle

### Exercice 2: Matrices
Création de matrices, extraction de sous-ensembles, calcul du déterminant et de l'inverse, fonctions sur colonnes/lignes.

**Concepts clés:**
- `cbind()` et `rbind()` pour construire des matrices
- `diag()`, `det()`, `solve()` pour les opérations matricielles
- `apply()` pour appliquer des fonctions par dimension
- Produit matriciel `%*%`

### Exercice 3: Régression multiple (calcul matriciel)
Calcul manuel des coefficients de régression multiple avec le jeu de données `mtcars`.

**Formule:** β = (X'X)⁻¹X'y

**Concepts clés:**
- Construction de la matrice de design X
- Transposition `t()`
- Inverse avec `solve()`
- Vérification avec `lm()`

### Exercice 4: Importation et fusion de données
Lecture de fichiers avec différents formats (CSV, texte) et fusion de tables.

**Concepts clés:**
- `read.table()`, `read.csv()`, `read.csv2()` et leurs paramètres (sep, dec, header)
- `merge()` pour fusionner sur une colonne commune
- `cbind()` et `rbind()` pour concaténer
- Différence entre les fonctions de lecture

### Exercice 5: Comparaison de distributions
Visualisation de la loi normale et de la loi de Student avec différents degrés de liberté.

**Concepts clés:**
- `curve()` pour tracer des fonctions
- `dnorm()` et `dt()` pour les densités
- `add=TRUE` pour superposer des courbes
- `legend()` pour les légendes

### Exercice 6: Fonctions par morceaux
Tracer plusieurs fonctions définies sur différents intervalles.

**Concepts clés:**
- Définition de domaines avec `from` et `to`
- Superposition de courbes
- Fonctions polynomiales et linéaires

### Exercice 7: Étude des ouragans (cas pratique)
Analyse complète d'un jeu de données sur les ouragans: importation, nettoyage, fusion, catégorisation, analyse descriptive.

**Données:**
- `Intensite.txt`: vitesse du vent (noeuds)
- `Dommages.txt`: coûts des dommages
- `Mortalite.csv`: nombre de victimes

**Workflow:**
1. Importer les 3 fichiers
2. Filtrer les ouragans (noeuds >= 64)
3. Supprimer les lignes avec NA
4. Créer une variable catégorielle (échelle de Saffir-Simpson)
5. Fusionner les tables
6. Trier par année
7. Calculer le coût moyen par catégorie
8. Visualiser la distribution temporelle

**Concepts clés:**
- `subset()` pour filtrer
- `apply(!is.na(), 1, all)` pour supprimer les NA
- Création de facteurs avec conditions multiples
- `by()` pour calculer des statistiques par groupe
- `hist()` et `barplot()` pour la visualisation

## Exécution

```r
# Se placer dans le répertoire TP1
setwd("~/Documents/Project/Insa/S6/Statistiques_Descriptives/tp/TP1")

# Exécuter le script complet
source("src/TP1_solutions.R")

# Ou exécuter par exercice (sections séparées par des commentaires)
```

## Notes importantes

- **Indexation R:** Les indices commencent à 1 (pas 0 comme en Python)
- **Sélection:**
  - `df[1, ]` : ligne 1
  - `df[, 1]` : colonne 1
  - `df[-3]` : toutes les colonnes sauf la 3ème
- **Séparateurs CSV:**
  - `read.csv()` : sep=","
  - `read.csv2()` : sep=";"
- **Fusion:**
  - `merge()` : fusion SQL-like sur colonne commune
  - `cbind()` : concaténation horizontale (même nb de lignes)
  - `rbind()` : concaténation verticale (mêmes colonnes)

## Ressources

- Documentation R: `help(function_name)` ou `?function_name`
- Jeux de données intégrés: `data()` pour lister, `?mtcars` pour la doc
- RStudio: environnement de développement recommandé
