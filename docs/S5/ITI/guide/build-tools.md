---
title: "Outils de construction -- Make, GCC et compilation"
sidebar_position: 2
---

# Outils de construction -- Make, GCC et compilation

## Apercu

Les outils de construction automatisent le processus de compilation et d'edition de liens des programmes. La partie FUS du cours ITI se concentre sur `gcc` (GNU Compiler Collection) et `make` (automatisation de la construction). Comprendre le fonctionnement de la compilation et savoir ecrire des Makefiles est un sujet fondamental a l'examen.

## Chaine de compilation GCC

La compilation d'un programme C se deroule en quatre phases :

```
Source (.c) --> Preprocesseur --> Compilateur --> Assembleur --> Editeur de liens --> Executable
              (-E, .i)         (-S, .s)       (-c, .o)       (link)
```

### Phase par phase

| Phase | Option | Entree | Sortie | Description |
|-------|--------|--------|--------|-------------|
| Preprocessing | `-E` | `.c` | `.i` | Expansion des macros, inclusion des headers, suppression des commentaires |
| Compilation | `-S` | `.i` | `.s` | Traduction du C en langage assembleur |
| Assemblage | `-c` | `.s` | `.o` | Conversion de l'assembleur en code machine (fichier objet) |
| Edition de liens | (aucune) | `.o` | executable | Combinaison des fichiers objets, resolution des symboles |

### Options GCC importantes

```bash
# Controle de la compilation
gcc -c file.c              # Compiler uniquement, produire .o (pas d'edition de liens)
gcc -o output file.c       # Specifier le nom du fichier de sortie
gcc -E file.c              # S'arreter apres le preprocessing
gcc -S file.c              # S'arreter apres la compilation (produire .s)

# Avertissements
gcc -Wall file.c           # Activer tous les avertissements courants
gcc -Werror file.c         # Traiter les avertissements comme des erreurs
gcc -Wextra file.c         # Avertissements supplementaires

# Debogage
gcc -g file.c              # Inclure les symboles de debogage (pour gdb)

# Optimisation
gcc -O0 file.c             # Pas d'optimisation (par defaut)
gcc -O1 file.c             # Optimisation basique
gcc -O2 file.c             # Optimisation recommandee
gcc -O3 file.c             # Optimisation agressive
gcc -Os file.c             # Optimisation en taille
gcc -Og file.c             # Optimisation pour le debogage

# Profilage
gcc -pg file.c             # Activer le profilage (pour gprof)

# Definitions du preprocesseur
gcc -DDEBUG file.c         # Definir la macro DEBUG
gcc -DSIZE=100 file.c      # Definir SIZE a 100

# Chemins d'inclusion et de bibliotheques
gcc -I/path/to/headers     # Ajouter un chemin de recherche d'includes
gcc -L/path/to/libs        # Ajouter un chemin de recherche de bibliotheques
gcc -lm                    # Lier avec la bibliotheque mathematique

# Dependances
gcc -MM file.c             # Generer les regles de dependance pour Make
```

### Comparaison des niveaux d'optimisation

| Niveau | Vitesse | Temps de compilation | Debogage | Taille du code |
|--------|---------|---------------------|----------|----------------|
| `-O0` | Reference | Rapide | Facile | Normale |
| `-O1` | Plus rapide | Modere | Plus difficile | Normale |
| `-O2` | Rapide | Lent | Plus difficile | Normale |
| `-O3` | Le plus rapide | Le plus lent | Tres difficile | Plus grande |
| `-Os` | Bonne | Modere | Plus difficile | La plus petite |

La **regle des 80-20** : 80% du temps d'execution est passe dans 20% du code. Profiler d'abord, optimiser ensuite.

## Make et Makefiles

### Pourquoi Make ?

Sans make, il faut tout recompiler apres chaque modification :
```bash
gcc -c file1.c && gcc -c file2.c && gcc -c file3.c && gcc -o program file1.o file2.o file3.o
```

Avec make, seuls les fichiers modifies sont recompiles, en se basant sur les horodatages des fichiers.

### Syntaxe du Makefile

```makefile
# Format d'une regle :
target: dependencies
	command          # DOIT etre indente avec une TABULATION (pas des espaces !)

# Exemple :
program: main.o utils.o
	gcc -o program main.o utils.o

main.o: main.c main.h
	gcc -c main.c

utils.o: utils.c utils.h main.h
	gcc -c utils.c
```

**Regle fondamentale** : les commandes DOIVENT commencer par un caractere TABULATION, pas des espaces. C'est l'erreur la plus courante dans les Makefiles.

### Variables

```makefile
# Variables definies par l'utilisateur
CC = gcc
CFLAGS = -Wall -g
LDFLAGS = -lm
SOURCES = main.c utils.c
OBJECTS = $(SOURCES:.c=.o)    # Remplacer .c par .o
TARGET = program

# Utilisation des variables
$(TARGET): $(OBJECTS)
	$(CC) -o $@ $^ $(LDFLAGS)
```

### Variables automatiques

| Variable | Signification | Exemple |
|----------|---------------|---------|
| `$@` | Nom de la cible | `program` |
| `$<` | Premiere dependance | `main.c` |
| `$^` | Toutes les dependances | `main.o utils.o` |
| `$?` | Dependances plus recentes que la cible | Fichiers modifies |

### Regles generiques

```makefile
# Regle generique : compiler tout .c en .o
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Cela remplace les regles individuelles pour chaque fichier .c
```

### Cibles factices

```makefile
# Cibles qui ne produisent pas de fichiers
.PHONY: all clean

all: $(TARGET)

clean:
	rm -f $(OBJECTS) $(TARGET)
```

### Modele de Makefile complet

```makefile
# Configuration du compilateur
CC = gcc
CFLAGS = -Wall -g
LDFLAGS =

# Fichiers
SOURCES = principal.c tableau.c
OBJECTS = $(SOURCES:.c=.o)
TARGET = principal

# Cible par defaut
all: $(TARGET)

# Edition de liens de l'executable
$(TARGET): $(OBJECTS)
	$(CC) -o $@ $^ $(LDFLAGS)

# Regle generique pour les fichiers objets
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Dependances explicites (issues de gcc -MM)
principal.o: principal.c commun.h tableau.h
tableau.o: tableau.c commun.h tableau.h

# Construction avec profilage
profile: CFLAGS += -pg
profile: LDFLAGS += -pg
profile: clean $(TARGET)

# Construction optimisee
optimized: CFLAGS += -O3
optimized: clean $(TARGET)

# Nettoyage des artefacts de construction
clean:
	rm -f $(OBJECTS) $(TARGET) gmon.out

# Afficher les dependances
deps:
	$(CC) -MM $(SOURCES)

# Generer la sortie preprocessee
%.i: %.c
	$(CC) -E $< -o $@

# Generer la sortie assembleur
%.s: %.c
	$(CC) $(CFLAGS) -S $< -o $@

.PHONY: all clean profile optimized deps
```

### Comment Make decide quoi construire

1. Verifier si la cible existe
2. Si la cible existe, comparer les horodatages avec les dependances
3. Si une dependance est plus recente que la cible, reconstruire
4. Verifier recursivement les dependances

### Invocations courantes de Make

```bash
make                       # Construire la cible par defaut (premiere cible, generalement 'all')
make clean                 # Executer la cible clean
make -n                    # Execution a blanc (afficher les commandes sans les executer)
make -f MyMakefile         # Utiliser un makefile specifique
make -j4                   # Construire avec 4 taches paralleles
make CC=clang              # Surcharger une variable en ligne de commande
```

## Bibliotheques

### Bibliotheques statiques (.a)

```bash
# Creer les fichiers objets
gcc -c file1.c file2.c

# Creer la bibliotheque statique
ar rcs libmylib.a file1.o file2.o

# Utiliser la bibliotheque statique
gcc -o program main.c -L. -lmylib
```

### Bibliotheques dynamiques (.so)

```bash
# Creer les fichiers objets independants de la position
gcc -fPIC -c file1.c file2.c

# Creer la bibliotheque partagee
gcc -shared -o libmylib.so file1.o file2.o

# Utiliser la bibliotheque partagee
gcc -o program main.c -L. -lmylib

# Definir le chemin de la bibliotheque a l'execution
export LD_LIBRARY_PATH=.
```

### Makefile pour les bibliotheques

```makefile
# Bibliotheque statique
libmylib.a: file1.o file2.o
	ar rcs $@ $^

# Bibliotheque dynamique
libmylib.so: file1.o file2.o
	gcc -shared -o $@ $^
```

## Generation des dependances

```bash
# Generer les lignes de dependance pour le Makefile
gcc -MM main.c
# Sortie : main.o: main.c main.h utils.h

# Inclure les dependances auto-generees dans le Makefile
-include $(SOURCES:.c=.d)

%.d: %.c
	$(CC) -MM $< > $@
```

---

## AIDE-MEMOIRE

### Options GCC
| Option | Objectif |
|--------|----------|
| `-c` | Compiler uniquement (pas d'edition de liens) |
| `-o name` | Nom du fichier de sortie |
| `-Wall` | Tous les avertissements |
| `-g` | Symboles de debogage |
| `-O0/O2/O3` | Niveau d'optimisation |
| `-pg` | Profilage (gprof) |
| `-E` | Preprocessing uniquement |
| `-S` | Compiler en assembleur |
| `-MM` | Afficher les dependances |
| `-DNAME` | Definir une macro |
| `-I dir` | Chemin d'inclusion |
| `-L dir` | Chemin de bibliotheque |
| `-l lib` | Lier une bibliotheque |

### Essentiels du Makefile
```
target: deps           Definition de regle
	command            Commande (indentee par TAB !)
$@                     Nom de la cible
$<                     Premiere dependance
$^                     Toutes les dependances
$(VAR)                 Reference de variable
%.o: %.c               Regle generique
.PHONY: target         Cible sans fichier
```

### Commandes de compilation
```
gcc -Wall -g -c file.c       Compiler en fichier objet
gcc -o prog file1.o file2.o  Lier en executable
gcc -MM file.c               Afficher les dependances
make                         Construire la cible par defaut
make clean                   Nettoyer les artefacts
make -n                      Execution a blanc
```
