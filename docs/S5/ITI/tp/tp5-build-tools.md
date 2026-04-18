---
title: "FUS5 - Outils de construction (make, gdb, gprof)"
sidebar_position: 5
---

# FUS5 - Outils de construction (make, gdb, gprof)

## Objectifs pedagogiques

Ce TP introduit essential development tools for C programming:

- Automatiser les constructions avec **make** et les Makefiles
- Deboguer les programmes avec **gdb** (GNU Debugger)
- Profiler les performances avec **gprof** (GNU Profiler)
- Comprendre les options du compilateur et les niveaux d'optimisation
- Gerer les dependances dans les projets multi-fichiers

## Concepts fondamentaux

### 1. Make - Automatisation de la construction

**make** est un outil d'automatisation de la construction qui gere les dependances entre les fichiers sources et les produits de la construction.

#### Pourquoi Make ?
Sans make, reconstruire apres des modifications necessite de tout recompiler :
```bash
gcc -c file1.c
gcc -c file2.c
gcc -c file3.c
gcc -o program file1.o file2.o file3.o
```

Avec make, seuls les fichiers modifies sont recompiles automatiquement.

#### Structure du Makefile

```makefile
# Target: dependencies
target: dependency1 dependency2
	command to build target

# Example: Build object file from source
file.o: file.c file.h
	gcc -c file.c

# Example: Link executable
program: file1.o file2.o
	gcc -o program file1.o file2.o
```

**Regles cles** :
- Les cibles sont les fichiers a construire
- Les dependances sont les fichiers necessaires pour construire la cible
- Les commandes doivent etre indentees avec une **TABULATION** (pas des espaces !)
- Make verifie les horodatages des fichiers pour determiner ce qui doit etre reconstruit

#### Variables speciales

```makefile
CC = gcc              # Compiler
CFLAGS = -Wall -g     # Compiler flags
LDFLAGS = -lm         # Linker flags

# Automatic variables
$@    # Target name
$<    # First dependency
$^    # All dependencies
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
```

#### Cibles courantes

```makefile
all: program          # Default target (builds everything)

clean:                # Remove generated files
	rm -f *.o program

.PHONY: all clean     # Declare non-file targets
```

### 2. Options du compilateur GCC

#### Phases de compilation

1. **Preprocessing** (`-E`): Expand macros, include headers
2. **Compilation** (`-S`): Translate C to assembly
3. **Assembly** (`-c`): Convert assembly to object code
4. **Linking**: Combine object files into executable

#### Options importantes

```bash
-c           # Compile only (don't link), produces .o files
-o file      # Specify output filename
-E           # Stop after preprocessing
-S           # Stop after compilation (produces .s assembly)
-Wall        # Enable all warnings
-g           # Include debugging symbols (for gdb)
-O0          # No optimization (default, fastest compile)
-O1, -O2, -O3 # Increasing optimization levels
-pg          # Enable profiling (for gprof)
-MM          # Generate dependency rules for make
-I dir       # Add directory to include search path
-L dir       # Add directory to library search path
-l library   # Link with library
```

#### Niveaux d'optimisation

- **-O0**: No optimization, fastest compilation, easiest debugging
- **-O1**: Basic optimization, moderate compile time
- **-O2**: Recommended optimization level (faster code, longer compile)
- **-O3**: Aggressive optimization, may increase code size
- **-Os**: Optimize for size
- **-Og**: Optimize for debugging experience

**Regle des 80-20** : 80% du temps d'execution est passe dans 20% du code. Optimiser avec precaution !

### 3. GDB - GNU Debugger

**gdb** est un debogueur interactif pour trouver les bugs et comprendre le comportement des programmes.

#### Utilisation de base

```bash
# Compile with debugging symbols
gcc -g program.c -o program

# Start gdb
gdb ./program

# Start with arguments
gdb --args ./program arg1 arg2
```

#### Commandes GDB essentielles

```gdb
run (r)                    # Start program execution
break function (b)         # Set breakpoint at function
break file.c:42            # Set breakpoint at line 42 of file.c
continue (c)               # Continue execution after breakpoint
next (n)                   # Step over (execute next line)
step (s)                   # Step into (enter function calls)
finish                     # Run until current function returns
print var (p)              # Print variable value
print *ptr                 # Print value pointed to
display var                # Auto-print var after each step
info locals                # Show local variables
info args                  # Show function arguments
backtrace (bt)             # Show call stack
frame n                    # Switch to stack frame n
list (l)                   # Show source code
quit (q)                   # Exit gdb
```

#### Types de points d'arret

```gdb
break main                 # Break at function entry
break 42                   # Break at line 42 (current file)
break file.c:42            # Break at specific file:line
break main if argc > 2     # Conditional breakpoint
watch variable             # Break when variable changes
```

#### Fichiers de script GDB

Save commands in a file and execute:
```bash
# commands.gdb
break main
run
print argc
continue
```

```bash
gdb -x commands.gdb ./program
```

#### Core Dumps

Quand un programme plante :
```bash
# Enable core dumps
ulimit -c unlimited

# After crash, analyze core file
gdb ./program core
backtrace  # See where it crashed
```

### 4. Gprof - GNU Profiler

**gprof** analyse ou votre programme passe son temps, identifiant les goulots d'etranglement de performance.

#### Methode d'utilisation

```bash
# 1. Compile with profiling enabled
gcc -pg -o program program.c

# 2. Run program (generates gmon.out)
./program

# 3. Analyze profile data
gprof program gmon.out > analysis.txt

# 4. View results
less analysis.txt
```

#### Lire la sortie de Gprof

**Flat Profile**: Shows time spent in each function
```
  %   cumulative   self              self     total
 time   seconds   seconds    calls  s/call   s/call  name
 44.5      0.44     0.44 1394467004   0.00     0.00  getValeur
 24.2      0.68     0.24        1   0.24     0.68  inverseValeurs
```

- **% time**: Percentage of total time
- **cumulative seconds**: Total time up to this function
- **self seconds**: Time in this function only (excluding callees)
- **calls**: Number of times called
- **self s/call**: Average time per call (this function only)
- **total s/call**: Average time per call (including callees)

**Call Graph**: Shows caller-callee relationships
```
[4]  58.5   10.85   3.43 1394467004           getValeur [4]
                    3.43 1394467004/1394625405     lireValeur [3]
```

#### Interpretation

- Functions with high **self seconds** are CPU-intensive
- Functions with high **calls** might benefit from optimization or caching
- **total s/call >> self s/call** means time is in callees, not the function itself

#### Strategie d'optimisation

1. **Profile first** - Don't guess where the bottleneck is
2. **Optimize hotspots** - Focus on top 3-5 functions
3. **Measure again** - Verify improvements with new profile
4. **Don't over-optimize** - Stop when performance is acceptable

### 5. Gestion des dependances

#### Generation automatique des dependances

```bash
# Generate dependencies for file.c
gcc -MM file.c

# Output:
# file.o: file.c file.h common.h
```

#### Inclure les dependances dans le Makefile

```makefile
# Generate and include dependencies
DEPS = $(SOURCES:.c=.d)

%.d: %.c
	$(CC) -MM $< > $@

-include $(DEPS)
```

## Apercu des exercices

### Exercice 1 : Comprendre l'application
Analyser un programme C multi-modules :
- `tableau.c/h` - Array data structure
- `principal.c` - Main program

**Taches** :
1. Read `commun.h` and `setValeur` function
2. Compile with `-E` flag to see preprocessed output
3. Compile without modifying sources using `-D` flags

### Exercice 2 : Voir les dependances
Use `gcc -MM` to see file dependencies for the Makefile.

### Exercice 3 : Creer le Makefile
Construire un Makefile qui :
- Generates object files (.o) from source files (.c)
- Manages dependencies between .o and .h files
- Links objects into executable
- Supports `clean` target
- Measures compilation time with `time` command
- Uses variables (CC, SOURCES, OBJETS)
- Defines compilation rules using pattern rules (`%.o: %.c`)

### Exercice 4 : Debogage avec GDB
Utiliser gdb pour deboguer l'application :
- Set breakpoints
- Step through code
- Inspect variables
- Analyze function calls

### Exercice 5 : Profilage de performance
Profiler l'application avec gprof :
- Compile with `-pg` flag
- Run program (generates `gmon.out`)
- Analyze profile with `gprof program gmon.out`
- Identify performance bottlenecks
- Compare optimized vs unoptimized builds

### Exercice 6 : Optimisation
Construire avec differents niveaux d'optimisation et comparer :
- Non-optimized (`-O0`)
- Optimized (`-O3`)
- Profile both versions and compare performance

## Solutions

Voir le repertoire `src/` pour:
- `Makefile` - Makefile complet avec toutes les cibles
- `README_gdb.txt` - Reference des commandes GDB
- `README_profiling.txt` - Methode de profilage et interpretation

## Points cles a retenir

1. **make fait gagner du temps** - Ne reconstruit que ce qui a change
2. **Les dependances comptent** - Des dependances incorrectes causent des bugs subtils
3. **Les symboles de debogage sont essentiels** - Toujours compiler avec `-g` en developpement
4. **Profiler avant d'optimiser** - Mesurer, ne pas deviner
5. **L'optimisation a des compromis** - Compilation plus lente, debogage plus difficile, parfois performances moins bonnes

## Motifs courants

### Modele de Makefile basique

```makefile
CC = gcc
CFLAGS = -Wall -g
TARGET = program
SOURCES = main.c util.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET)

.PHONY: all clean
```

### Methode de debogage

1. Compile with `-g`
2. Run in gdb: `gdb ./program`
3. Set breakpoint: `break main`
4. Run: `run`
5. Step through: `next`, `step`
6. Inspect: `print var`, `backtrace`

### Methode de profilage

1. Compile with `-pg`
2. Run program normally
3. Analyze: `gprof program gmon.out | less`
4. Focus on high % time functions
5. Optimize and re-profile

## Erreurs courantes

1. **Utiliser des espaces au lieu de tabulations dans les Makefiles** - Les commandes doivent commencer par TAB
2. **Oublier l'option -g** - Impossible de deboguer sans symboles
3. **Ne pas nettoyer avant de reconstruire** - Les anciens fichiers objets causent des problemes
4. **Optimiser trop tot** - Profiler d'abord, optimiser ensuite
5. **Ignorer les avertissements** - `-Wall` detecte beaucoup de bugs
6. **Dependances circulaires** - Make signalera une erreur
7. **Oublier .PHONY** - Les cibles sans fichier de sortie necessitent .PHONY

## Pour aller plus loin

- GNU Make Manual: https://www.gnu.org/software/make/manual/
- GDB Manual: https://www.gnu.org/software/gdb/documentation/
- Gprof Manual: https://sourceware.org/binutils/docs/gprof/
- GCC Optimization Options: https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html
- "The Art of Debugging with GDB, DDD, and Eclipse"
- Donald Knuth: "Premature optimization is the root of all evil"

## Regles d'optimisation des performances

1. **Profiler d'abord** - Ne pas optimiser sans donnees
2. **Se concentrer sur les goulots d'etranglement** - La regle des 80-20 s'applique
3. **Mesurer l'impact** - Verifier que les optimisations aident
4. **Algorithme > Micro-optimisations** - Un meilleur algorithme bat un code plus rapide
5. **La lisibilite compte** - Ne pas sacrifier la maintenabilite pour 5% de vitesse
