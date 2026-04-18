---
title: "Preparation a l'examen ITI"
sidebar_position: 0
---

# Preparation a l'examen ITI

## Structure de l'examen

Depuis l'annee 2025-2026, le cours ITI est evalue par **un seul examen** qui regroupe les sujets auparavant repartis entre deux examens distincts (FUS pour la partie systemes/shell, et LDS pour la partie scripting/Python).

### Examen ITI (unique)
- **Duree** : ~2-3 heures
- **Format** : ecrit, sur papier
- **Sujets** : shell, Makefile, systemes de fichiers, debogage, regex, grep, Python, Qt, SQL, web scraping
- **Annales disponibles** : annales FUS (2012-2024) et LDS (2016-2025) pour s'entrainer, ITI 2026 pour le format actuel

> **Note historique :** Les annees precedentes, la matiere etait scindee en deux cours separes avec chacun son propre examen : **FUS** (Fondamentaux Unix et Systemes, en novembre) et **LDS** (Langages de Script, en janvier). Les annales de ces deux examens restent pertinentes pour reviser.

## Inventaire des annales

### Examens de novembre (FUS / Systemes)

| Annee | Sujet | Corrections disponibles |
|-------|-------|------------------------|
| 2012 | FUS 2012-2013 | Non |
| 2013 | FUS 2013-2014 | Oui (partielle, Ivan Leplumey) |
| 2014 | FUS 2014-2015 | Non |
| 2015 | FUS 2015-2016 | Oui (plusieurs corrections etudiantes) |
| 2016 | FUS 2016-2017 | Oui (correction etudiante) |
| 2017 | FUS 2017 | Oui (correction etudiante) |
| 2018 | FUS 2018 | Oui (correction etudiante) |
| 2019 | FUS 2019 | Oui (correction etudiante) |
| 2020 | FUS 2020 | Oui (correction etudiante) |
| 2021 | FUS 2021 | Oui (correction etudiante) |
| 2022 | FUS 2022 | Sujet uniquement |
| 2023 | FUS 2023 | Sujet uniquement |
| 2024 | FUS 2024 | Sujet uniquement |

### Examens de janvier (LDS / Scripting)

| Annee | Sujet | Corrections disponibles |
|-------|-------|------------------------|
| 2016 | LDS 2016 | Oui (correction etudiante) |
| 2017 | LDS 2017 | Oui (correction etudiante) |
| 2018 | LDS 2018 | Oui (corrections etudiantes) |
| 2019 | LDS 2019 | Oui (plusieurs corrections etudiantes) |
| 2020 | LDS 2020 | Oui (plusieurs corrections etudiantes) |
| 2022 | LDS 2022 | Oui (solution officielle) |
| 2023 | LDS 2023 | Oui (correction etudiante) |
| 2024 | LDS 2024 | Oui (correction etudiante) |
| 2025 | LDS 2025 | Sujet uniquement |
| 2026 | ITI 2026 | Oui (corrections etudiantes) |

## Analyse des sujets par examen

### Examen FUS/ITI (novembre) -- Types de questions typiques

D'apres l'analyse de 13 annees d'examens, les sujets les plus frequents sont :

#### 1. Commandes shell et scripting (present dans ~95% des examens)
- **Ecriture de scripts shell** : variables, boucles, conditionnelles, fonctions
- **Chaines de pipes** : combiner grep, sed, awk, sort, uniq, wc
- **Operations sur les fichiers** : tests avec `-f`, `-d`, `-r`, `-x`
- **Prediction de sortie de commande** : "Que produit cette commande ?"
- **Debogage de scripts** : "Trouvez l'erreur dans ce script"

**Format de question typique :**
> Ecrivez un script bash qui prend un repertoire en argument et liste tous les fichiers `.c`, en affichant le nombre de lignes de chacun.

#### 2. Expressions regulieres et grep (present dans ~90% des examens)
- **Ecriture de motifs** : "Ecrivez une regex qui correspond a..."
- **Construction de commandes grep** : utilisation des options `-i`, `-v`, `-c`, `-n`, `-E`
- **Substitution sed** : ecriture de commandes `sed 's/.../.../'`
- **Analyse de motifs** : "Quelles lignes cette commande grep selectionne-t-elle ?"

**Format de question typique :**
> Ecrivez une commande grep qui extrait toutes les lignes contenant une adresse email d'un fichier.

#### 3. Makefile (present dans ~80% des examens)
- **Ecriture de regles Makefile** : cible, dependances, commandes
- **Comprehension des variables automatiques** : `$@`, `$<`, `$^`
- **Determination de l'ordre de construction** : "Quels fichiers sont recompiles si X change ?"
- **Regles generiques** : `%.o: %.c`
- **Tabulation vs espaces** : comprehension de l'exigence de la TABULATION

**Format de question typique :**
> Etant donnes ces fichiers sources et leurs dependances, ecrivez un Makefile complet.

#### 4. Systemes de fichiers (present dans ~70% des examens)
- **Structure des inodes** : comment les fichiers sont stockes sur le disque
- **Table FAT** : parcours de la table d'allocation de fichiers
- **Liens physiques vs liens symboliques** : differences et implications sur les inodes
- **Structure des repertoires** : comment les repertoires referencent les inodes

**Format de question typique :**
> Etant donnee cette table FAT, tracez les blocs appartenant au fichier X.

#### 5. Compilation GCC (present dans ~60% des examens)
- **Phases de compilation** : preprocessing, compilation, assemblage, edition de liens
- **Signification des options** : `-c`, `-o`, `-g`, `-Wall`, `-O2`, `-pg`, `-E`
- **Analyse des dependances** : "Si on modifie header.h, que faut-il recompiler ?"

#### 6. Debogage GDB (present dans ~40% des examens)
- **Placement de points d'arret** : `break function`, `break file:line`
- **Avancement pas a pas** : `next`, `step`, `continue`, `finish`
- **Inspection de variables** : `print`, `info locals`, `backtrace`

### Examen LDS (janvier) -- Types de questions typiques

#### 1. Programmation Python (present dans ~100% des examens)
- **Definitions de classes** : `__init__`, methodes, `self`
- **Operations sur les listes** : comprehensions, tranches, tri
- **Entrees/Sorties fichiers** : lecture/ecriture de fichiers avec `open()`
- **Manipulation de chaines** : split, join, replace, format
- **Implementation d'algorithmes** : tri, recherche, traitement de donnees

#### 2. Requetes SQL (present dans ~80% des examens)
- **SELECT avec conditions** : WHERE, ORDER BY, LIMIT
- **Operations JOIN** : INNER JOIN, LEFT JOIN
- **Fonctions d'agregation** : COUNT, AVG, SUM, GROUP BY
- **INSERT, UPDATE, DELETE** : operations CRUD
- **Conception de schema** : CREATE TABLE avec contraintes

#### 3. Qt/PyQt (present dans ~60% des examens)
- **Hierarchie des widgets** : QWidget, QMainWindow, layouts
- **Signaux et slots** : `clicked.connect(function)`
- **Gestion d'images** : acces et manipulation des pixels QImage
- **QTableView avec QSqlTableModel** : afficher des donnees de base de donnees

#### 4. Web Scraping (present dans ~50% des examens)
- **BeautifulSoup** : find(), find_all(), get_text()
- **Selecteurs CSS** : selection par balise, classe, id
- **Comprehension de la structure HTML** : navigation dans l'arbre DOM
- **Motifs d'extraction de donnees** : tableaux, liens, formulaires

## Strategie d'examen

### Gestion du temps

- **Lire l'examen entier d'abord** (5 min)
- **Repondre a ce qu'on sait immediatement** -- questions shell et regex d'abord
- **Allouer le temps proportionnellement** aux valeurs en points
- **Garder du temps pour relire** (10 min)

### Repartition courante des points (examen FUS)

| Sujet | Poids approximatif |
|-------|-------------------|
| Scripting shell | 25-35% |
| Regex / grep | 20-25% |
| Makefile | 15-20% |
| Systemes de fichiers | 10-15% |
| GCC / Compilation | 5-10% |
| GDB / Debogage | 5-10% |

### Priorite de revision (FUS)

1. **HAUTE PRIORITE** : commandes shell, pipes, scripting, regex, grep
2. **PRIORITE MOYENNE** : Makefile, concepts de systemes de fichiers, options GCC
3. **PRIORITE BASSE** : commandes GDB, valgrind, gprof

### Priorite de revision (LDS)

1. **HAUTE PRIORITE** : classes Python, operations sur les listes, E/S fichiers
2. **PRIORITE MOYENNE** : requetes SQL (SELECT, JOIN, GROUP BY)
3. **PRIORITE BASSE** : widgets Qt, web scraping

### Conseils cles pour l'examen

1. **La syntaxe compte** : les examens exigent la syntaxe exacte des commandes (pas d'autocompletion IDE)
2. **Proteger vos variables** : toujours ecrire `"$var"` et non `$var` en shell
3. **TABulations dans les Makefiles** : le mentionner explicitement si on pose la question sur les regles Makefile
4. **Operateurs de test** : connaitre la difference entre `-eq` (numerique) et `=` (chaines)
5. **Echappement regex** : savoir quels caracteres necessite `\` pour etre pris litteralement
6. **Indentation Python** : cruciale sur papier -- utiliser une indentation coherente
7. **Points-virgules SQL** : terminer les instructions SQL par `;`
8. **Gestion des erreurs** : toujours mentionner la verification des erreurs (fichier existant, arguments valides)

## Reference rapide pour le jour de l'examen

Voir les aide-memoire a la fin de chaque guide thematique :
- [Aide-memoire Shell et Bash](/S5/ITI/guide/shell-bash#aide-memoire)
- [Aide-memoire Regex](/S5/ITI/guide/regex#aide-memoire)
- [Aide-memoire Outils de construction](/S5/ITI/guide/build-tools#aide-memoire)
- [Aide-memoire Debogage](/S5/ITI/guide/debugging#aide-memoire)
- [Aide-memoire Git](/S5/ITI/guide/git#aide-memoire)
- [Aide-memoire Python](/S5/ITI/guide/python-basics#aide-memoire)
- [Aide-memoire SQL](/S5/ITI/guide/sql-sqlite#aide-memoire)
- [Aide-memoire Qt GUI](/S5/ITI/guide/qt-gui#aide-memoire)
- [Aide-memoire Web Scraping](/S5/ITI/guide/web-scraping#aide-memoire)

## Approche de revision

### Pour l'examen FUS
1. Faire toutes les annales FUS de 2015 a 2024 (les plus pertinentes)
2. S'entrainer a ecrire des scripts shell sur papier (sans ordinateur)
3. Ecrire des commandes grep/sed/awk de memoire
4. Dessiner des arbres de dependances Makefile
5. Tracer des exercices d'inodes et de tables FAT

### Pour l'examen LDS
1. Faire toutes les annales LDS de 2018 a 2025
2. S'entrainer a ecrire des definitions de classes Python sur papier
3. Ecrire des requetes SQL sans les executer
4. Connaitre l'API BeautifulSoup : find, find_all, get_text, selecteurs CSS
5. S'entrainer a ecrire des connexions signal/slot Qt
