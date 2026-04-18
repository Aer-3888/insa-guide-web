---
title: "Shell et scripting Bash"
sidebar_position: 8
---

# Shell et scripting Bash

## Apercu

Le shell est l'interface en ligne de commande du systeme d'exploitation. Bash (Bourne Again Shell) est le shell par defaut sur la plupart des distributions Linux. Maitriser le shell est essentiel pour l'examen FUS et pour le travail quotidien d'ingenieur.

## Types de shell

| Shell | Description | Shebang |
|-------|-------------|---------|
| `bash` | Bourne Again Shell, le plus courant | `#!/bin/bash` |
| `tcsh` | TENEX C Shell, syntaxe proche du C | `#!/bin/tcsh` |
| `sh` | Shell Bourne original, conforme POSIX | `#!/bin/sh` |
| `zsh` | Z Shell, fonctionnalites etendues de bash | `#!/bin/zsh` |

Le **shebang** (`#!`) sur la premiere ligne d'un script indique au systeme quel interpreteur utiliser.

## Navigation dans le systeme de fichiers

```bash
pwd                        # Afficher le repertoire courant
ls                         # Lister le contenu du repertoire
ls -l                      # Format long : permissions, taille, date
ls -la                     # Format long avec fichiers caches
ls -lh                     # Tailles de fichiers lisibles
cd /path/to/dir            # Changer de repertoire (chemin absolu)
cd ../                     # Remonter d'un niveau
cd ~                       # Aller au repertoire personnel
cd -                       # Aller au repertoire precedent
mkdir dirname              # Creer un repertoire
mkdir -p path/to/nested    # Creer des repertoires imbriques
rmdir dirname              # Supprimer un repertoire vide
rm -r dirname              # Supprimer un repertoire et son contenu (attention !)
```

## Operations sur les fichiers

```bash
cp source dest             # Copier un fichier
cp -r source/ dest/        # Copier un repertoire recursivement
mv source dest             # Deplacer/renommer un fichier
rm file                    # Supprimer un fichier
rm -f file                 # Suppression forcee (sans confirmation)
touch newfile              # Creer un fichier vide ou mettre a jour l'horodatage
cat file                   # Afficher le contenu d'un fichier
less file                  # Parcourir un fichier page par page (q pour quitter)
head -n 5 file             # Afficher les 5 premieres lignes
tail -n 5 file             # Afficher les 5 dernieres lignes
wc file                    # Comptage : lignes, mots, octets
wc -l file                 # Compter les lignes uniquement
wc -w file                 # Compter les mots uniquement
```

## Permissions de fichiers

```bash
chmod +x script.sh         # Rendre executable
chmod 755 file             # rwxr-xr-x
chmod 644 file             # rw-r--r--
chown user:group file      # Changer le proprietaire
```

Format des permissions : `rwxrwxrwx` (proprietaire/groupe/autres)
- `r` = lecture (4), `w` = ecriture (2), `x` = execution (1)

## Commandes de traitement de texte

### `echo` -- Afficher du texte
```bash
echo "Hello World"         # Afficher une chaine
echo $VAR                  # Afficher la valeur d'une variable
echo -n "No newline"       # Supprimer le retour a la ligne final
echo -e "Tab\there"        # Activer les sequences d'echappement
```

### `cat` -- Concatener et afficher
```bash
cat file.txt               # Afficher un fichier
cat file1 file2            # Concatener des fichiers
cat > newfile.txt          # Creer un fichier depuis stdin (Ctrl+D pour terminer)
cat >> file.txt            # Ajouter stdin a un fichier
```

### `grep` -- Rechercher des motifs
```bash
grep "pattern" file        # Lignes contenant le motif
grep -i "pattern" file     # Insensible a la casse
grep -v "pattern" file     # Lignes NE contenant PAS le motif
grep -c "pattern" file     # Compter les lignes correspondantes
grep -n "pattern" file     # Afficher les numeros de ligne
grep -r "pattern" dir/     # Recherche recursive dans un repertoire
grep -E "regex" file       # Regex etendue (egrep)
grep "^start" file         # Lignes commencant par "start"
grep "end$" file           # Lignes finissant par "end"
grep "[0-9]" file          # Lignes contenant des chiffres
```

### `sed` -- Editeur de flux
```bash
sed 's/old/new/' file      # Remplacer la premiere occurrence par ligne
sed 's/old/new/g' file     # Remplacer TOUTES les occurrences
sed -i 's/old/new/g' file  # Editer le fichier en place
sed -n '5,10p' file        # Afficher les lignes 5 a 10
sed '/pattern/d' file      # Supprimer les lignes correspondant au motif
sed 's/^/prefix/' file     # Ajouter un prefixe a chaque ligne
```

### `awk` -- Analyse et traitement de motifs
```bash
awk '{print $1}' file      # Afficher la premiere colonne (delimiteur espace)
awk -F: '{print $1}' file  # Afficher la premiere colonne (delimiteur deux-points)
awk '{print NR, $0}' file  # Afficher avec les numeros de ligne
awk '/pattern/' file       # Afficher les lignes correspondantes
awk '{sum+=$1} END {print sum}' file  # Sommer la premiere colonne
```

### `sort` et `uniq`
```bash
sort file                  # Trier les lignes alphabetiquement
sort -n file               # Trier numeriquement
sort -r file               # Tri inverse
sort -k2 file              # Trier par la 2e colonne
uniq file                  # Supprimer les doublons adjacents
sort file | uniq           # Supprimer tous les doublons
sort file | uniq -c        # Compter les occurrences
```

### `cut` -- Extraire des colonnes
```bash
cut -d: -f1 /etc/passwd    # Extraire le premier champ, delimiteur deux-points
cut -c1-10 file            # Extraire les caracteres 1 a 10
```

### `tr` -- Traduire des caracteres
```bash
echo "hello" | tr 'a-z' 'A-Z'    # Majuscules
echo "hello" | tr -d 'l'          # Supprimer les caracteres 'l'
echo "hello" | tr -s ' '          # Comprimer les espaces repetes
```

## Pipes et redirections

```bash
# Pipes : connecter la sortie standard d'une commande a l'entree d'une autre
command1 | command2        # Pipe
ls -l | grep ".txt"        # Lister, puis filtrer les fichiers .txt
cat file | sort | uniq     # Enchainer plusieurs commandes

# Redirections
command > file             # Rediriger stdout vers un fichier (ecrasement)
command >> file            # Rediriger stdout vers un fichier (ajout)
command 2> file            # Rediriger stderr vers un fichier
command 2>&1               # Rediriger stderr vers stdout
command > file 2>&1        # Rediriger stdout et stderr
command < file             # Rediriger un fichier vers stdin
command << EOF             # Here document (entree en ligne)
line1
line2
EOF
```

### Exemples pratiques de pipes (favoris d'examen)

```bash
# Compter les fichiers dans le repertoire courant
ls -l | grep "^-" | wc -l

# Compter les repertoires
ls -l | grep "^d" | wc -l

# Trouver les 10 mots les plus frequents
cat file | tr ' ' '\n' | sort | uniq -c | sort -rn | head -10

# Extraire les adresses IP uniques d'un journal
cat access.log | awk '{print $1}' | sort | uniq

# Trouver les plus gros fichiers
ls -lS | head -5
```

## Variables

```bash
# Affectation (PAS d'espaces autour du =)
name="Alice"
age=25
readonly CONST="immutable"

# Acces
echo $name
echo ${name}               # Forme plus sure
echo "${name} is ${age}"   # Dans une chaine

# Variables speciales
$0                         # Nom du script
$1, $2, ...                # Arguments positionnels
$#                         # Nombre d'arguments
$@                         # Tous les arguments comme mots separes
$*                         # Tous les arguments comme une seule chaine
$?                         # Code de retour de la derniere commande
$$                         # PID du processus courant

# Valeurs par defaut
name=${name:-"default"}    # Utiliser "default" si name est non defini/vide
name=${name:="default"}    # Definir et utiliser "default" si non defini/vide
```

## Instructions conditionnelles

```bash
# if-then-else de base
if [ condition ]; then
    # commandes
elif [ another_condition ]; then
    # commandes
else
    # commandes
fi

# Comparaisons numeriques
[ $a -eq $b ]              # Egal
[ $a -ne $b ]              # Different
[ $a -lt $b ]              # Inferieur a
[ $a -le $b ]              # Inferieur ou egal
[ $a -gt $b ]              # Superieur a
[ $a -ge $b ]              # Superieur ou egal

# Comparaisons de chaines
[ "$s1" = "$s2" ]          # Egal
[ "$s1" != "$s2" ]         # Different
[ -z "$str" ]              # Chaine vide
[ -n "$str" ]              # Chaine non vide

# Tests sur les fichiers
[ -f file ]                # Est un fichier regulier
[ -d dir ]                 # Est un repertoire
[ -e path ]                # Existe (tout type)
[ -r file ]                # Est lisible
[ -w file ]                # Est modifiable
[ -x file ]                # Est executable
[ -s file ]                # Fichier non vide

# Operateurs logiques
[ cond1 ] && [ cond2 ]     # ET
[ cond1 ] || [ cond2 ]     # OU
[ ! condition ]             # NON
```

## Boucles

```bash
# Boucle for sur une liste
for item in one two three; do
    echo "$item"
done

# Boucle for avec intervalle
for i in {1..10}; do
    echo "$i"
done

# Boucle for sur des fichiers
for file in *.txt; do
    echo "Processing $file"
done

# Boucle for style C
for ((i=0; i<10; i++)); do
    echo "$i"
done

# Boucle while
counter=0
while [ $counter -lt 10 ]; do
    echo $counter
    counter=$((counter + 1))
done

# Lire un fichier ligne par ligne
while IFS= read -r line; do
    echo "$line"
done < file.txt
```

## Fonctions

```bash
# Definir une fonction
greet() {
    local name=$1          # Variable locale
    echo "Hello, $name!"
    return 0               # Code de retour (0 = succes)
}

# Appeler une fonction
greet "Alice"

# Capturer la sortie d'une fonction
result=$(greet "Bob")
```

## Arithmetique

```bash
# Expansion arithmetique
result=$((3 + 5))
result=$((a * b))
result=$((10 / 3))        # Division entiere
result=$((10 % 3))        # Modulo

# Increment
count=$((count + 1))
((count++))                # Raccourci Bash

# expr (methode plus ancienne)
result=$(expr 3 + 5)
```

## Modele de structure de script

```bash
#!/bin/bash
# Description: What this script does
# Usage: ./script.sh <arg1> <arg2>

# Validate arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <arg1> <arg2>"
    exit 1
fi

# Assign arguments to named variables
input_file="$1"
output_file="$2"

# Validate input
if [ ! -f "$input_file" ]; then
    echo "Error: File $input_file not found"
    exit 1
fi

# Main logic
process_data() {
    local file="$1"
    while IFS= read -r line; do
        echo "$line"
    done < "$file"
}

# Execute
process_data "$input_file" > "$output_file"
echo "Done. Output written to $output_file"
exit 0
```

## Debogage de scripts shell

```bash
set -x                     # Afficher chaque commande avant execution
set -e                     # Quitter immediatement en cas d'erreur
set -u                     # Traiter les variables non definies comme erreur
set -o pipefail            # Un pipe echoue si une commande echoue

# Combiner en debut de script :
set -euo pipefail

# Tracer une section specifique
set -x
# ... commandes a tracer ...
set +x
```

---

## AIDE-MEMOIRE

### Navigation
| Commande | Action |
|----------|--------|
| `pwd` | Afficher le repertoire courant |
| `cd dir` | Changer de repertoire |
| `ls -la` | Lister tous les fichiers avec details |
| `tree` | Afficher l'arborescence |

### Manipulation de fichiers
| Commande | Action |
|----------|--------|
| `cp src dst` | Copier |
| `mv src dst` | Deplacer/renommer |
| `rm file` | Supprimer |
| `touch file` | Creer/mettre a jour l'horodatage |
| `chmod +x file` | Rendre executable |

### Traitement de texte
| Commande | Action |
|----------|--------|
| `cat file` | Afficher le contenu |
| `grep pattern file` | Rechercher un motif |
| `sed 's/a/b/g' file` | Remplacer tous les a par b |
| `awk '{print $1}' file` | Afficher la premiere colonne |
| `sort file` | Trier les lignes |
| `uniq` | Supprimer les doublons |
| `wc -l file` | Compter les lignes |
| `cut -d: -f1 file` | Extraire un champ |
| `tr 'a-z' 'A-Z'` | Traduire des caracteres |
| `head -n 5 file` | 5 premieres lignes |
| `tail -n 5 file` | 5 dernieres lignes |

### Redirections et pipes
| Syntaxe | Action |
|---------|--------|
| `cmd > file` | Stdout vers fichier (ecrasement) |
| `cmd >> file` | Stdout vers fichier (ajout) |
| `cmd 2> file` | Stderr vers fichier |
| `cmd < file` | Fichier vers stdin |
| `cmd1 \| cmd2` | Pipe stdout vers la commande suivante |

### Variables et arithmetique
| Syntaxe | Action |
|---------|--------|
| `VAR="value"` | Affecter (pas d'espaces !) |
| `$VAR` ou `${VAR}` | Lire une variable |
| `$((expr))` | Arithmetique |
| `$?` | Dernier code de retour |
| `$#` | Nombre d'arguments |
| `$1` | Premier argument |

### Tests
| Test | Signification |
|------|---------------|
| `-f file` | Est un fichier regulier |
| `-d dir` | Est un repertoire |
| `-e path` | Existe |
| `-z "$str"` | Chaine vide |
| `$a -eq $b` | Egalite numerique |
| `"$s1" = "$s2"` | Egalite de chaines |

### Structures de controle
```
if [ cond ]; then ... elif ... else ... fi
for x in list; do ... done
while [ cond ]; do ... done
```
