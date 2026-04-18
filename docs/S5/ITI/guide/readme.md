---
title: "ITI - Introduction aux Techniques de l'Ingenieur"
sidebar_position: 0
---

# ITI - Introduction aux Techniques de l'Ingenieur

## Apercu du cours

ITI (Introduction aux Techniques de l'Ingenieur) est un cours pratique d'ingenierie en 3e annee a l'INSA Rennes qui couvre les outils et techniques fondamentaux dont tout ingenieur informaticien a besoin. Le cours est divise en deux grandes parties :

- **FUS (Fonctions et Utilisation des Systemes)** -- Programmation systeme et outils Unix/Linux
- **LDS (Langages De Script)** -- Langages de script (Python) et developpement d'applications

Ce cours est tres pratique : presque chaque seance est un TP ou un TD guide. L'examen porte fortement sur les commandes shell, les expressions regulieres et le scripting.

## Structure du cours

### Serie FUS (Systemes et Outils) -- Semestre 1

| Seance | Sujet | Type | Competences cles |
|--------|-------|------|------------------|
| CM1 | Introduction a ITI | Cours | Presentation du cours, bases de Linux |
| CM2 | Scripting shell | Cours | Syntaxe Bash, commandes |
| CM3 | Systemes de construction et Makefile | Cours | Compilation, dependances |
| CM4 | Systemes de fichiers | Cours | Inodes, FAT, ext4 |
| CM5 | Processus | Cours | Gestion des processus, signaux |
| TD1 | Introduction Linux et Jupyter | TD | Navigation, commandes de base |
| TP1 | Bases du shell | TP | echo, cat, wc, grep, pipes |
| TP2 | Scripting shell avance | TP | Arguments, boucles, fonctions |
| TP3 | Makefile | TP | gcc, make, dependances |
| TP4 | Debogage (gdb, valgrind) | TP | Points d'arret, analyse memoire |
| TD5 | Bibliotheques et Makefile 2 | TD | Bibliotheques statiques/dynamiques |
| TD6 | Inodes et FAT | TD | Fonctionnement interne des systemes de fichiers |
| TP7 | Exploration du systeme de fichiers | TP | Manipulation du systeme de fichiers Linux |
| TD8 | grep et regex | TD | Expressions regulieres |
| Session Git 1 | Learn Git Branching | TP | Fondamentaux de Git |
| Session Git 2 | Pokemon Git et GitLab | TP | Travail collaboratif |

### Serie LDS (Scripting et Applications) -- Semestre 2

| Seance | Sujet | Competences cles |
|--------|-------|------------------|
| TP8 | Bases de Python et tri | Syntaxe, POO, algorithmes |
| TP9 | Programmation d'interface graphique Qt | PyQt5, signaux/slots, layouts |
| TP10 | Bases de donnees SQLite | SQL, Python sqlite3, CRUD |
| TP11 | Web scraping | BeautifulSoup, urllib, parsing HTML |
| TP12 | Automatisation de processus | E/S fichier, subprocess, argparse |

## Examens

Le cours comporte deux examens distincts :

1. **Examen de novembre (FUS/ITI)** -- Couvre le shell, Makefile, systemes de fichiers, debogage, grep/regex
2. **Examen de janvier (LDS)** -- Couvre Python, Qt, SQL, web scraping, automatisation

L'examen de novembre est particulierement axe sur les commandes shell et les expressions regulieres. L'examen de janvier porte sur le scripting Python avec des problemes appliques.

## Comment utiliser ce guide

| Section | Objectif |
|---------|----------|
| [Shell et Bash](/S5/ITI/guide/shell-bash) | Commandes, pipes, scripting -- l'essentiel de l'examen FUS |
| [Expressions regulieres](/S5/ITI/guide/regex) | Syntaxe, motifs, grep/sed/awk -- incontournable a l'examen |
| [Outils de construction](/S5/ITI/guide/build-tools) | Make, gcc, chaine de compilation |
| [Debogage](/S5/ITI/guide/debugging) | gdb, valgrind, profilage avec gprof |
| [Controle de version Git](/S5/ITI/guide/git) | Toutes les commandes et workflows Git |
| [Bases de Python](/S5/ITI/guide/python-basics) | Syntaxe, structures de donnees, POO, tri |
| [SQL et SQLite](/S5/ITI/guide/sql-sqlite) | Requetes, jointures, integration Python |
| [Programmation d'interface graphique Qt](/S5/ITI/guide/qt-gui) | Widgets PyQt5, signaux/slots, traitement d'images |
| [Web Scraping](/S5/ITI/guide/web-scraping) | BeautifulSoup, parsing HTML, automatisation |

## Sujets cles d'examen (par ordre de priorite)

1. **Commandes shell et scripting** -- Present dans quasiment tous les examens FUS
2. **Expressions regulieres** -- Motifs grep, substitutions sed
3. **Makefile** -- Ecriture de regles, comprehension des dependances
4. **Systemes de fichiers** -- Inodes, tables FAT, liens
5. **Python** -- Classes, tri, traitement de fichiers
6. **SQL** -- Requetes, jointures, conception de schemas
7. **Git** -- Branches, fusions, resolution de conflits
