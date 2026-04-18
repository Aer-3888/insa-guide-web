---
title: "CLP -- Conception Logique des Processeurs"
sidebar_position: 0
---

# CLP -- Conception Logique des Processeurs

## Apercu du cours

CLP (Conception Logique des Processeurs) est un cours de 3e annee a l'INSA Rennes qui couvre l'ensemble de la conception de systemes numeriques : de l'algebre de Boole et des portes logiques jusqu'a l'architecture des processeurs et la programmation en assembleur ARM. Le cours est divise en deux grandes parties :

1. **Logique numerique** (Logique) -- conception de circuits combinatoires et sequentiels, machines a etats, chemin de donnees et unite de commande du processeur
2. **Assembleur ARM** (Assembleur) -- jeu d'instructions ARM, gestion de la pile, appels de fonctions, structures de donnees en assembleur

---

## Navigation des chapitres

### Partie I -- Logique numerique

| Chapitre | Fichier | Sujets principaux |
|----------|---------|-------------------|
| 1. Logique combinatoire | [combinational-logic.md](/S5/CLP/guide/combinational-logic) | Portes logiques, algebre de Boole, tableaux de Karnaugh, transcodeurs, multiplexeurs, decodeurs |
| 2. Logique sequentielle | [sequential-logic.md](/S5/CLP/guide/sequential-logic) | Bascules (D, T, JK, RS), registres, compteurs, machines a etats (Moore/Mealy) |
| 3. Architecture processeur | [processor-architecture.md](/S5/CLP/guide/processor-architecture) | Chemin de donnees (UT), Unite de commande (UC), UAL, microcode, sequenceur, memoire |
| 4. Circuits Logisim | [logisim-circuits.md](/S5/CLP/guide/logisim-circuits) | Methodologie de conception de circuits, reference des fichiers Logisim, techniques de simulation |
| 5. PGCD / Circuits arithmetiques | [pgcd-arithmetic.md](/S5/CLP/guide/pgcd-arithmetic) | Algorithme du PGCD en materiel, integration UC+UT, machine de Fibonacci |

### Partie II -- Assembleur ARM

| Chapitre | Fichier | Sujets principaux |
|----------|---------|-------------------|
| 6. Langage assembleur ARM | [assembly-arm.md](/S5/CLP/guide/assembly-arm) | Jeu d'instructions ARM, modes d'adressage, pile, procedures, structures de donnees, GPIO |

---

## Comment utiliser ce guide

1. **Premiere lecture** : Lisez les chapitres 1 a 3 dans l'ordre -- ils s'enchainent. La logique combinatoire alimente la logique sequentielle, qui alimente l'architecture processeur.
2. **Pratique** : Travaillez les exercices dans `../exercises/` apres chaque chapitre. Les corrections de TD sont organisees par theme.
3. **Assembleur** : Le chapitre 6 est autonome. Commencez par les instructions de base, puis abordez les appels de fonctions et la recursivite.
4. **Preparation aux examens** : Utilisez `../exam-prep/` pour des exercices chronometres et la methodologie.

---

## Structure des examens

Le cours CLP comporte **deux examens distincts** :

| Examen | Contenu | Format |
|--------|---------|--------|
| DS Logique | Logique combinatoire + sequentielle, machines a etats, UC/UT | Ecrit, conception de circuits, tables de verite, tableaux de Karnaugh |
| DS Assembleur | Programmation en assembleur ARM | Ecrit, lecture/ecriture de code, trace de pile |

---

## Ressources cles

- **Circuits Logisim** : Tous les fichiers `.circ` dans `../data/moodle/cours/` et `../data/moodle/td/Logique/`
- **Aide-memoire ARM** : `../data/moodle/cours/ARM/arm-cheatsheet.pdf`
- **Synthese du cours** : `../data/moodle/cours/CPL-Cours-2020-2021-synthese.pdf`
- **Diapositives du cours ARM** : `../data/moodle/cours/AssembleurARM - 2023-2024 - version etudiant.pdf`
- **Annales** : `../data/annales/` (organisees par Assembleur et Logique)
