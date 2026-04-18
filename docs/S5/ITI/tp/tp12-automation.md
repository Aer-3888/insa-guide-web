---
title: "LDS5 - Automatisation de processus et scripting"
sidebar_position: 12
---

# LDS5 - Automatisation de processus et scripting

## Objectifs pedagogiques

Automatiser des taches avec des scripts Python :

- Executer des commandes systeme depuis Python
- Traiter des fichiers et des repertoires
- Analyser des donnees structurees (fichiers genealogiques GEDCOM)
- Generer des rapports et des fichiers de sortie
- Construire des outils en ligne de commande
- Integrer plusieurs technologies (E/S fichier, bases de donnees, web)

## Concepts fondamentaux

### 1. Executer des commandes systeme

```python noexec
import subprocess

# Run command and capture output
result = subprocess.run(['ls', '-l'], capture_output=True, text=True)
print(result.stdout)
print(result.returncode)  # 0 = success

# Run shell command
result = subprocess.run('echo "Hello"', shell=True, capture_output=True, text=True)

# Check for errors
try:
    subprocess.run(['command'], check=True)
except subprocess.CalledProcessError as e:
    print(f"Command failed: {e}")
```

### 2. Operations sur les fichiers et repertoires

```python noexec
import os
import shutil
from pathlib import Path

# Check existence
if os.path.exists('file.txt'):
    print("File exists")

# Directory operations
os.mkdir('newdir')
os.makedirs('path/to/dir', exist_ok=True)
os.listdir('.')  # List files
os.walk('.')     # Recursive traversal

# File operations
shutil.copy('src.txt', 'dst.txt')
shutil.move('old.txt', 'new.txt')
os.remove('file.txt')

# Path manipulation (pathlib - recommended)
path = Path('folder/file.txt')
print(path.name)        # 'file.txt'
print(path.stem)        # 'file'
print(path.suffix)      # '.txt'
print(path.parent)      # 'folder'
print(path.exists())    # True/False

# Read directory
for file in Path('.').glob('*.txt'):
    print(file)
```

### 3. Lire et ecrire des fichiers

```python noexec
# Reading
with open('file.txt', 'r') as f:
    content = f.read()              # Entire file
    lines = f.readlines()           # List of lines
    for line in f:                  # Line by line
        process(line)

# Writing
with open('output.txt', 'w') as f:
    f.write('Hello\n')
    f.writelines(['Line 1\n', 'Line 2\n'])

# Appending
with open('log.txt', 'a') as f:
    f.write('New entry\n')

# Binary files
with open('image.jpg', 'rb') as f:
    data = f.read()
```

### 4. Analyser des donnees structurees

**Fichiers CSV** :
```python noexec
import csv

# Reading CSV
with open('data.csv', 'r') as f:
    reader = csv.reader(f)
    headers = next(reader)  # First row
    for row in reader:
        print(row)

# Writing CSV
with open('output.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Age'])
    writer.writerow(['Alice', 25])
```

**Fichiers JSON** :
```python noexec
import json

# Reading JSON
with open('data.json', 'r') as f:
    data = json.load(f)

# Writing JSON
with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### 5. Arguments en ligne de commande

```python noexec
import sys
import argparse

# Simple: sys.argv
if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <filename>")
    sys.exit(1)

filename = sys.argv[1]

# Advanced: argparse
parser = argparse.ArgumentParser(description='Process some files')
parser.add_argument('input', help='Input file')
parser.add_argument('output', help='Output file')
parser.add_argument('-v', '--verbose', action='store_true',
                    help='Verbose output')
parser.add_argument('-n', '--number', type=int, default=10,
                    help='Number of items')

args = parser.parse_args()
print(f"Input: {args.input}")
print(f"Verbose: {args.verbose}")
```

### 6. Expressions regulieres

```python
import re

# Match pattern
if re.match(r'^\d{3}$', '123'):
    print("Three digits")

# Search for pattern
match = re.search(r'\d+', 'Order 12345')
if match:
    print(match.group())  # '12345'

# Find all matches
numbers = re.findall(r'\d+', 'Numbers: 1, 2, 3')

# Replace
result = re.sub(r'\d+', 'X', 'Replace 123 and 456')

# Split
parts = re.split(r'\s+', 'Split  on   whitespace')
```

## Apercu des exercices

### Exercice 1 : Traitement de fichiers GEDCOM
Analyser des donnees genealogiques au format GEDCOM (voir FUS4 pour les details du format).

**Taches** :
- Read GEDCOM file
- Extract person records
- Build family tree structure
- Generate reports

**Fichiers** : `sabotiers.ged`

### Exercice 2 : Generation automatisee de rapports
Generer des rapports HTML ou texte a partir des donnees GEDCOM.

**Fonctionnalites** :
- List of all individuals
- Family groups
- Statistics (births, deaths, marriages by year)
- Formatted output

### Exercice 3 : Chaine de traitement de fichiers
Construire un script qui traite plusieurs fichiers :
- Read input files
- Transform data
- Generate output files
- Handle errors gracefully

### Exercice 4 : Validation des donnees
Valider les fichiers GEDCOM :
- Check format correctness
- Verify referenced IDs exist
- Validate dates
- Report inconsistencies

### Exercice 5 : Projet d'integration
Combiner les concepts precedents :
- File processing
- Database storage
- Web scraping (if needed)
- GUI or CLI interface

## Solutions

See `src/` directory and original files:
- `Q1.py` - Solution question 1
- `Q2.py` - Solution question 2
- `Q4.py` - Solution question 4
- `Q6.py` - Solution question 6

## Points cles a retenir

1. **Automatiser les taches repetitives** - Les scripts font gagner du temps sur les operations repetees
2. **La gestion des erreurs est critique** - Les fichiers peuvent ne pas exister, les permissions peuvent echouer
3. **Tester d'abord avec de petites donnees** - Deboguer sur de petits fichiers avant de traiter de grands jeux de donnees
4. **Modulariser le code** - Separer l'analyse, le traitement et la sortie
5. **Documenter les scripts** - Ajouter des instructions d'utilisation et des exemples

## Motifs courants

### Modele de traitement de fichier
```python noexec
import sys
from pathlib import Path

def process_file(input_path, output_path):
    """Process input file and write to output file"""
    try:
        with open(input_path, 'r') as f_in:
            with open(output_path, 'w') as f_out:
                for line in f_in:
                    # Process line
                    result = transform(line)
                    f_out.write(result)
    except FileNotFoundError:
        print(f"Error: File {input_path} not found")
        return False
    except Exception as e:
        print(f"Error processing file: {e}")
        return False
    return True

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <input> <output>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if process_file(input_file, output_file):
        print("Processing completed successfully")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
```

### Traitement par lots
```python noexec
from pathlib import Path

def process_directory(input_dir, output_dir):
    """Process all files in directory"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    for file in input_path.glob('*.txt'):
        output_file = output_path / file.name
        process_file(file, output_file)
        print(f"Processed: {file.name}")
```

### Rapport de progression
```python noexec
def process_with_progress(items):
    total = len(items)
    for i, item in enumerate(items, 1):
        process(item)
        percent = (i / total) * 100
        print(f"Progress: {i}/{total} ({percent:.1f}%)")
```

## Erreurs courantes

1. **Ne pas utiliser les gestionnaires de contexte (with)** - Les fichiers peuvent ne pas se fermer correctement
2. **Coder en dur les chemins** - Utiliser les objets Path, accepter des arguments
3. **Ne pas valider les entrees** - Verifier l'existence des fichiers, les permissions
4. **Ignorer les erreurs** - Entourer les operations risquees de try-except
5. **Ne pas tester les cas limites** - Fichiers vides, donnees malformees
6. **Code specifique a la plateforme** - Utiliser Path au lieu de la concatenation de chaines

## Pour aller plus loin

- Pathlib documentation: https://docs.python.org/3/library/pathlib.html
- Subprocess module: https://docs.python.org/3/library/subprocess.html
- Argparse tutorial: https://docs.python.org/3/howto/argparse.html
- "Automate the Boring Stuff with Python" book
- Python's standard library: csv, json, configparser, logging

## Organisation du script

```python noexec
#!/usr/bin/env python3
"""
Script description and usage
"""

import sys
import argparse
from pathlib import Path

def parse_args():
    """Parse command-line arguments"""
    parser = argparse.ArgumentParser(description='...')
    # Add arguments
    return parser.parse_args()

def main():
    """Main entry point"""
    args = parse_args()
    # Main logic
    
if __name__ == '__main__':
    main()
```

## Bonnes pratiques

1. **Ligne shebang** - `#!/usr/bin/env python3` pour les scripts executables
2. **Docstrings** - Documenter les fonctions et les modules
3. **Type hints** - Aider a detecter les erreurs tot
4. **Logging** - Utiliser le module logging au lieu de print
5. **Fichiers de configuration** - Separer la configuration du code
6. **Codes de retour** - Utiliser sys.exit(0) pour le succes, non-zero pour les erreurs

## Conseils pour le traitement GEDCOM

- Utiliser une machine a etats pour analyser les structures imbriquees
- Suivre les changements de niveau pour fermer les balises
- Construire un dictionnaire associant les ID aux enregistrements
- Valider les references apres l'analyse
- Gerer les champs manquants proprement
