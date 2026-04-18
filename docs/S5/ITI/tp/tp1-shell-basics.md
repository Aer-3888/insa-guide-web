---
title: "FUS1 - Bases du shell et traitement de texte"
sidebar_position: 1
---

# FUS1 - Bases du shell et traitement de texte

## Objectifs pedagogiques

Ce TP introduit les concepts fondamentaux du shell Unix et les utilitaires de manipulation de texte. Vous apprendrez a :

- Naviguer dans le systeme de fichiers Unix en ligne de commande
- Comprendre les bases du shell (syntaxe bash vs tcsh)
- Travailler avec les flux d'E/S standard (stdin, stdout, stderr)
- Utiliser les outils de traitement de texte fondamentaux (cat, echo, wc, grep)
- Ecrire des scripts shell simples avec des variables et des structures de controle

## Concepts fondamentaux

### 1. Types de shell

Les systemes Unix supportent plusieurs interpreteurs de commandes :

- **bash** (Bourne Again Shell) - Le plus courant, par defaut sous Linux
- **tcsh** (TENEX C Shell) - Syntaxe proche du C, courant sur les anciens systemes
- **sh** (Bourne Shell) - Shell Unix original, minimal mais portable

Le shebang (`#!/bin/bash`) au debut d'un script indique quel interpreteur utiliser.

### 2. Commandes de traitement de texte

#### `cat` - Concatener et afficher des fichiers
```bash
cat file.txt           # Display file contents
cat file1 file2        # Concatenate multiple files
cat > newfile.txt      # Create file from stdin (Ctrl+D to end)
```

#### `echo` - Afficher du texte sur stdout
```bash
echo "Hello World"     # Print string
echo $VAR              # Print variable value
echo -n "No newline"   # Suppress newline
```

#### `wc` - Comptage de mots
```bash
wc file.txt            # Show lines, words, bytes
wc -l file.txt         # Count lines only
wc -w file.txt         # Count words only
```

#### `grep` - Recherche de motifs
```bash
grep "pattern" file    # Find lines containing pattern
grep -i "pattern" file # Case-insensitive search
grep -v "pattern" file # Invert match (lines NOT containing pattern)
```

### 3. Navigation dans le systeme de fichiers

```bash
ls                     # List directory contents
ls -l                  # Long format (permissions, size, date)
ls -a                  # Show hidden files (.file)
pwd                    # Print working directory
cd /path/to/dir        # Change directory
```

### 4. Test de type de fichier

Dans les scripts bash, vous pouvez tester les proprietes des fichiers :

```bash
if [ -f filename ]; then    # Is it a regular file?
    echo "It's a file"
fi

if [ -d dirname ]; then     # Is it a directory?
    echo "It's a directory"
fi
```

Operateurs de test courants :
- `-f` : Regular file
- `-d` : Directory
- `-e` : Exists (any type)
- `-r` : Readable
- `-w` : Writable
- `-x` : Executable

### 5. Pipes et redirections

```bash
command1 | command2    # Pipe: stdout of command1 → stdin of command2
command > file         # Redirect stdout to file (overwrite)
command >> file        # Redirect stdout to file (append)
command 2> file        # Redirect stderr to file
command < file         # Redirect file to stdin
```

## Apercu des exercices

### Exercice 1 : Scripts simples
Creer des scripts shell de base qui affichent des messages et manipulent des variables.

**Concepts cles** : shebang, variables, echo

### Exercice 2 : Script de comptage de fichiers
Compter le nombre de fichiers et de repertoires dans le repertoire courant en utilisant `ls`, `grep` et `wc`.

**Concepts cles** : pipes, motifs grep (`^-` pour les fichiers, `^d` pour les repertoires), wc -l

**Deux approches** :
1. **Version tcsh** : utilise les pipes et le traitement de texte
   ```bash
   ls -l | grep "^-" | wc -l    # Count files
   ls -l | grep "^d" | wc -l    # Count directories
   ```

2. **Version bash** : utilise les boucles et les tests de fichiers
   ```bash
   for e in $(ls); do
       if [ -f $e ]; then nbfic=$((nbfic+1)); fi
       if [ -d $e ]; then nbdir=$((nbdir+1)); fi
   done
   ```

### Exercice 3 : Comprendre les pages man
Apprendre a lire les pages de manuel Unix (man cat, man echo, man wc) pour comprendre les options et l'utilisation des commandes.

## Solutions

Voir le repertoire `src/` pour les implementations commentees :
- `bonjour.sh` - Script de salutation basique
- `cat_simulator.sh` - Demontre le fonctionnement de cat
- `count_files_tcsh.sh` - Compteur de fichiers avec pipes (tcsh)
- `count_files_bash.sh` - Compteur de fichiers avec boucles (bash)

## Points cles a retenir

1. **Les scripts shell sont interpretes ligne par ligne** - Pas de compilation necessaire
2. **Les differents shells ont des syntaxes differentes** - Toujours specifier le shebang
3. **Les pipes sont puissants** - Combiner des outils simples pour resoudre des problemes complexes
4. **Les operations sur le systeme de fichiers sont fondamentales** - Comprendre ls, cd, pwd est essentiel
5. **Tester les types de fichiers est important** - Utiliser les operateurs de test appropries

## Pour aller plus loin

- Guide du scripting Bash : `man bash`
- Traitement de texte : grep, sed, awk avances
- Bonnes pratiques de scripting shell : protection des variables, gestion des erreurs
- Conformite POSIX pour des scripts portables

## Erreurs courantes

1. **Oublier le shebang** - Le script peut s'executer dans le mauvais shell
2. **Ne pas proteger les variables** - `"$var"` vs `$var` fait une difference avec les espaces
3. **Utiliser la syntaxe bash dans sh** - `[[ ]]` ne fonctionne pas en POSIX sh
4. **Oublier de rendre les scripts executables** - `chmod +x script.sh`
5. **Coder en dur les chemins** - Utiliser `pwd`, `dirname` ou des chemins relatifs
