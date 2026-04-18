---
title: "Debogage -- GDB, Valgrind et profilage"
sidebar_position: 3
---

# Debogage -- GDB, Valgrind et profilage

## Apercu

Le debogage est le processus de recherche et de correction des erreurs dans les programmes. Le cours ITI couvre trois outils essentiels :
- **gdb** -- Debogueur interactif pour les bugs logiques et les plantages
- **valgrind** -- Detecteur d'erreurs memoire (fuites, acces invalides)
- **gprof** -- Profileur de performance (trouver les goulots d'etranglement)

## GDB (GNU Debugger)

### Preparation

Toujours compiler avec l'option `-g` pour inclure les symboles de debogage :
```bash
gcc -g -Wall -o program program.c
```

### Lancer GDB

```bash
gdb ./program                      # Demarrer le debogage
gdb --args ./program arg1 arg2     # Demarrer avec des arguments
gdb -x commands.gdb ./program      # Executer un script de commandes
```

### Commandes essentielles

#### Controle de l'execution
```gdb
run (r)                            # Demarrer le programme
run arg1 arg2                      # Demarrer avec des arguments
continue (c)                       # Continuer jusqu'au prochain point d'arret
next (n)                           # Pas a pas (sans entrer dans les fonctions)
step (s)                           # Pas a pas (en entrant dans les fonctions)
finish                             # Executer jusqu'au retour de la fonction courante
until 50                           # Executer jusqu'a la ligne 50
quit (q)                           # Quitter gdb
```

#### Points d'arret
```gdb
break main (b main)                # Point d'arret a l'entree d'une fonction
break file.c:42                    # Point d'arret a une ligne specifique
break main if argc > 2             # Point d'arret conditionnel
info breakpoints                   # Lister tous les points d'arret
delete 1                           # Supprimer le point d'arret #1
disable 1                          # Desactiver temporairement
enable 1                           # Reactiver
clear file.c:42                    # Supprimer le point d'arret a cet emplacement
```

#### Points de surveillance
```gdb
watch variable                     # S'arreter quand la variable change
watch *0x12345678                  # Surveiller une adresse memoire
rwatch variable                    # S'arreter quand la variable est lue
awatch variable                    # S'arreter en lecture ou ecriture
```

#### Inspection
```gdb
print variable (p variable)        # Afficher la valeur
print *pointer                     # Dereferencement de pointeur
print array[0]@10                  # Afficher 10 elements du tableau
print/x variable                   # Afficher en hexadecimal
print/d variable                   # Afficher en decimal
print/t variable                   # Afficher en binaire
display variable                   # Affichage automatique a chaque pas
undisplay 1                        # Arreter l'affichage automatique
info locals                        # Afficher toutes les variables locales
info args                          # Afficher les arguments de la fonction
whatis variable                    # Afficher le type
ptype struct_name                  # Afficher la definition de la structure
```

#### Pile d'appels
```gdb
backtrace (bt)                     # Afficher la pile d'appels complete
frame 0                            # Basculer vers le cadre de pile 0
up                                 # Remonter d'un cadre
down                               # Descendre d'un cadre
info frame                         # Details du cadre courant
```

#### Code source
```gdb
list (l)                           # Afficher le source autour de la ligne courante
list main                          # Afficher le source d'une fonction
list 40,50                         # Afficher les lignes 40 a 50
list file.c:30                     # Afficher autour de la ligne 30 de file.c
```

### Methode de debogage avec GDB

```
1. Compiler avec -g :          gcc -g -Wall -o prog prog.c
2. Demarrer gdb :              gdb ./prog
3. Placer un point d'arret :   break main
4. Executer :                  run
5. Avancer pas a pas :         next / step
6. Inspecter les variables :   print var / info locals
7. Trouver le bug :            backtrace / print suspicious_var
8. Corriger et recompiler :    (quitter gdb, editer, recompiler)
```

### Scripts de commandes GDB

Sauvegarder des commandes repetitives dans un fichier :

```
# commands.gdb
break main
run
print argc
print argv[0]
continue
```

Executer avec : `gdb -x commands.gdb ./program`

### Commandes personnalisees

```gdb
define print_array
    set $i = 0
    while $i < $arg0
        print array[$i]
        set $i = $i + 1
    end
end
```

### Mode TUI

GDB dispose d'une interface texte affichant le code source :
```
Ctrl+X A                           # Basculer le mode TUI
Ctrl+X 2                           # Afficher l'assembleur en parallele
```

### Analyse de core dump

```bash
# Activer les core dumps
ulimit -c unlimited

# Apres un plantage, analyser
gdb ./program core
backtrace                          # Voir ou le programme a plante
print variable                     # Inspecter l'etat au moment du plantage
```

## Valgrind

Valgrind detecte les erreurs memoire invisibles pour le compilateur.

### Utilisation de base

```bash
# Compiler avec -g (sans optimisation)
gcc -g -O0 -o program program.c

# Executer avec valgrind
valgrind ./program
valgrind --leak-check=full ./program
valgrind --leak-check=full --show-leak-kinds=all ./program
valgrind --track-origins=yes ./program
```

### Ce que Valgrind detecte

| Type d'erreur | Description | Exemple |
|---------------|-------------|---------|
| Lecture/ecriture invalide | Acces a de la memoire liberee ou hors limites | `array[100]` sur un tableau de taille 10 |
| Utilisation non initialisee | Lecture d'une variable avant affectation | `int x; if (x > 0)` |
| Fuite memoire | malloc sans free | `malloc(100)` jamais libere |
| Double liberation | Liberer la memoire deux fois | `free(p); free(p);` |
| Liberation incompatible | Mauvaise fonction de desallocation | `malloc` + `delete` |

### Lire la sortie de Valgrind

```
==12345== Invalid read of size 4
==12345==    at 0x4005E8: main (program.c:10)
==12345==  Address 0x51f9068 is 0 bytes after a block of size 40 alloc'd
==12345==    at 0x4C2B6CD: malloc (in /usr/lib/valgrind/...)
==12345==    by 0x4005C1: main (program.c:5)
```

Informations cles :
- **Type d'erreur** : "Invalid read of size 4"
- **Emplacement** : `program.c:10`
- **Contexte** : "0 bytes after a block of size 40" = lecture juste apres la fin du tableau

### Resume des fuites memoire

```
==12345== HEAP SUMMARY:
==12345==     in use at exit: 100 bytes in 1 blocks
==12345==   total heap usage: 3 allocs, 2 frees, 200 bytes allocated
==12345==
==12345== LEAK SUMMARY:
==12345==    definitely lost: 100 bytes in 1 blocks
==12345==    indirectly lost: 0 bytes in 0 blocks
==12345==    possibly lost: 0 bytes in 0 blocks
==12345==    still reachable: 0 bytes in 0 blocks
```

## Gprof (GNU Profiler)

Gprof identifie les goulots d'etranglement de performance -- quelles fonctions consomment le plus de temps.

### Methode de travail

```bash
# 1. Compiler avec le profilage active
gcc -pg -o program program.c

# 2. Executer le programme (genere gmon.out automatiquement)
./program

# 3. Analyser
gprof program gmon.out > analysis.txt
less analysis.txt
```

### Lire le profil plat

```
  %   cumulative   self              self     total
 time   seconds   seconds    calls  s/call   s/call  name
 44.5      0.44     0.44 1394467004   0.00     0.00  getValeur
 24.2      0.68     0.24        1   0.24     0.68  inverseValeurs
```

| Colonne | Signification |
|---------|---------------|
| % time | Pourcentage du temps total d'execution |
| cumulative seconds | Total cumule du temps |
| self seconds | Temps dans cette fonction uniquement (hors sous-fonctions) |
| calls | Nombre d'invocations |
| self s/call | Temps moyen par appel (cette fonction) |
| total s/call | Temps moyen par appel (sous-fonctions incluses) |

### Lire le graphe d'appels

Montre les relations appelant-appele :
- Quelles fonctions appellent lesquelles
- Combien de temps est attribue a chaque appelant
- La profondeur de la chaine d'appels

### Strategie d'optimisation

1. **Profiler d'abord** -- Ne jamais deviner ou se trouve le goulot d'etranglement
2. **Se concentrer sur les points chauds** -- Les 3 a 5 premieres fonctions par % de temps
3. **L'algorithme avant la micro-optimisation** -- Un meilleur algorithme bat un code plus rapide
4. **Mesurer a nouveau** -- Verifier les ameliorations avec un nouveau profil
5. **Comparer les niveaux d'optimisation** -- Construire avec `-O0` et `-O3`, profiler les deux

### Comparer les niveaux d'optimisation

```bash
# Non optimise
gcc -pg -O0 -o prog_O0 program.c
./prog_O0
gprof prog_O0 gmon.out > profile_O0.txt

# Optimise
gcc -pg -O3 -o prog_O3 program.c
./prog_O3
gprof prog_O3 gmon.out > profile_O3.txt

# Comparer
diff profile_O0.txt profile_O3.txt
```

## Strategies de debogage

### Categories de bugs courants

| Categorie | Symptomes | Outil |
|-----------|-----------|-------|
| Erreur logique | Sortie incorrecte, pas de plantage | gdb (points d'arret, print) |
| Segfault | Le programme plante | gdb (backtrace), valgrind |
| Fuite memoire | Utilisation memoire croissante | valgrind --leak-check=full |
| Depassement de tampon | Donnees corrompues, plantages | valgrind, -fsanitize=address |
| Boucle infinie | Le programme ne repond plus | gdb (Ctrl+C, backtrace) |
| Erreur de bornes | Mauvaise limite | gdb (print des variables de boucle) |

### Processus de debogage systematique

1. **Reproduire** -- Faire apparaitre le bug de maniere consistante
2. **Isoler** -- Trouver la plus petite entree qui le declenche
3. **Localiser** -- Utiliser les points d'arret gdb pour cerner la ligne
4. **Comprendre** -- Pourquoi le code fait-il la mauvaise chose ?
5. **Corriger** -- Faire le changement minimal pour corriger le comportement
6. **Verifier** -- Confirmer que la correction fonctionne et que rien d'autre n'est casse

---

## AIDE-MEMOIRE

### Commandes GDB
```
run / r                  Demarrer le programme
break func / b func      Placer un point d'arret
continue / c             Continuer l'execution
next / n                 Pas a pas (sans entrer)
step / s                 Pas a pas (en entrant)
finish                   Executer jusqu'au retour
print var / p var        Afficher une variable
backtrace / bt           Afficher la pile d'appels
info locals              Variables locales
info breakpoints         Lister les points d'arret
quit / q                 Quitter
```

### Valgrind
```
valgrind ./program                    Verification de base
valgrind --leak-check=full ./prog     Verification complete des fuites
valgrind --track-origins=yes ./prog   Tracer les valeurs non initialisees
```

### Gprof
```
gcc -pg -o prog prog.c    Compiler avec profilage
./prog                     Executer (genere gmon.out)
gprof prog gmon.out        Analyser le profil
```

### Compilation pour le debogage
```
gcc -g -Wall -O0 prog.c        Construction debogage
gcc -g -Wall -pg prog.c        Construction profilage
gcc -g -Wall -fsanitize=address  Sanitizer d'adresses
```
