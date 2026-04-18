---
title: "FUS2 - Scripting shell avance"
sidebar_position: 2
---

# FUS2 - Scripting shell avance

## Objectifs pedagogiques

Ce TP s'appuie sur FUS1 with more advanced shell scripting concepts:

- Travailler avec les arguments et parametres en ligne de commande
- Implementer la logique conditionnelle et les boucles
- Gerer les operations sur les fichiers de maniere programmatique
- Utiliser le traitement de texte avance avec les motifs grep
- Comprendre les techniques de debogage de scripts

## Concepts fondamentaux

### 1. Arguments en ligne de commande

Les scripts shell peuvent accepter des arguments passes en ligne de commande :

```bash
#!/bin/bash
# $0 = script name
# $1 = first argument
# $2 = second argument
# $# = number of arguments
# $@ = all arguments as separate words
# $* = all arguments as single string

echo "Script: $0"
echo "First arg: $1"
echo "Total args: $#"
```

### 2. Instructions conditionnelles

```bash
# if-then-else structure
if [ condition ]; then
    # commands
elif [ another_condition ]; then
    # commands
else
    # commands
fi

# Common conditions:
# [ $a -eq $b ]  # Equal (numeric)
# [ $a -ne $b ]  # Not equal (numeric)
# [ $a -lt $b ]  # Less than
# [ $a -gt $b ]  # Greater than
# [ "$s1" = "$s2" ]   # String equality
# [ -z "$str" ]  # String is empty
# [ -n "$str" ]  # String is not empty
```

### 3. Boucles

```bash
# For loop over items
for item in list of items; do
    echo $item
done

# For loop with counter
for i in {1..10}; do
    echo $i
done

# While loop
while [ condition ]; do
    # commands
done
```

### 4. Fonctions

```bash
# Define a function
function_name() {
    local var="local variable"  # Local to function
    echo "Function arg 1: $1"
    return 0  # Return status (0 = success)
}

# Call the function
function_name argument1 argument2
```

### 5. Traitement de texte avance

```bash
# grep with patterns
grep "^start"    # Lines starting with "start"
grep "end$"      # Lines ending with "end"
grep "[0-9]"     # Lines containing digits
grep -v "pattern" # Lines NOT matching pattern
grep -c "pattern" # Count matching lines
grep -n "pattern" # Show line numbers

# sed (stream editor)
sed 's/old/new/' file     # Replace first occurrence per line
sed 's/old/new/g' file    # Replace all occurrences

# awk (pattern scanning)
awk '{print $1}' file     # Print first column
awk -F: '{print $1}' file # Use : as delimiter
```

## Apercu des exercices

### Exercice 1 : Scripts avec variables
Create scripts that use variables and demonstrate variable expansion.

**Fichiers** : `exo01`
- Simple variable assignment and echo
- Understanding variable scope

### Exercice 2 : Boucle de traitement de fichiers
Write a script that processes multiple files, counting specific patterns.

**Fichiers** : `exo02`
- Loop through files
- Use conditionals to test file types
- Accumulate counts

## Solutions

Voir le repertoire `src/` pour les implementations commentees :
- `simple_variable.sh` - Utilisation basique des variables
- `file_processor.sh` - Traitement avance de fichiers avec boucles

## Points cles a retenir

1. **Toujours proteger les variables** - `"$var"` evite les problemes de decoupage de mots
2. **Tester le nombre d'arguments** - Verifier `$#` avant d'utiliser `$1`, `$2`, etc.
3. **Utiliser des variables locales dans les fonctions** - Evite la pollution de l'espace de noms
4. **Les codes de retour comptent** - `exit 0` pour le succes, non-zero pour les erreurs
5. **Debogage** : utiliser `set -x` pour tracer l'execution, `set -e` pour quitter en cas d'erreur

## Motifs courants

### Validation des arguments
```bash
if [ $# -lt 2 ]; then
    echo "Usage: $0 <arg1> <arg2>"
    exit 1
fi
```

### Operations securisees sur les fichiers
```bash
if [ ! -f "$filename" ]; then
    echo "Error: File $filename not found"
    exit 1
fi
```

### Valeurs par defaut
```bash
# Use default if variable is unset or empty
name=${name:-"default_value"}
```

## Pour aller plus loin

- Advanced bash scripting guide: https://tldp.org/LDP/abs/html/
- Shell parameter expansion: `man bash` (search for "Parameter Expansion")
- Regular expressions: `man grep`, `man regex`
- Best practices: ShellCheck (shellcheck.net)

## Erreurs courantes

1. **Ne pas proteger les variables avec espaces** - Toujours utiliser `"$var"`
2. **Utiliser `[ ]` vs `[[ ]]`** - `[[ ]]` est specifique a bash mais plus puissant
3. **Oublier les points-virgules** - `if [ test ]; then` necessite un point-virgule avant `then`
4. **Utiliser `=` dans les tests `[ ]`** - Doit etre `[ "$a" = "$b" ]`, pas `==` en sh
5. **Ne pas verifier les codes de retour** - Utiliser `$?` pour verifier le statut de la commande precedente
