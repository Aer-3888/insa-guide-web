---
title: "Bases de Python"
sidebar_position: 5
---

# Bases de Python

## Apercu

La partie LDS du cours ITI introduit Python comme langage de script. Les sujets abordes comprennent la syntaxe de base, les structures de donnees, la programmation orientee objet, les algorithmes de tri et les entrees/sorties fichiers. Python est evalue a l'examen de janvier (LDS).

## Fondamentaux de la syntaxe

### Variables et types
```python
# Typage dynamique -- pas de declarations de type necessaires
x = 42                     # int
pi = 3.14                  # float
name = "Alice"             # str
is_valid = True            # bool
nothing = None             # NoneType

# Verification de type
type(x)                    # <class 'int'>
isinstance(x, int)         # True
```

### Chaines de caracteres
```python noexec
s = "Hello, World!"
s = 'Les guillemets simples fonctionnent aussi'
s = """Chaine
multi-ligne"""

# Operations
len(s)                     # Longueur
s.upper()                  # "HELLO, WORLD!"
s.lower()                  # "hello, world!"
s.strip()                  # Supprimer les espaces en debut/fin
s.split(",")               # Decouper en liste : ["Hello", " World!"]
", ".join(["a", "b"])      # "a, b"
s.replace("old", "new")   # Remplacer une sous-chaine
s.startswith("Hello")      # True
s.find("World")            # Index de la sous-chaine (ou -1)

# Formatage
f"Name: {name}, Age: {age}"             # f-string (recommande)
"Name: {}, Age: {}".format(name, age)   # methode format
"Name: %s, Age: %d" % (name, age)       # Style C (plus ancien)
```

### Print
```python noexec
print("Hello")                          # Basique
print(f"x = {x}")                       # f-string
print(f"Pi: {pi:.2f}")                  # 2 decimales
print("a", "b", "c", sep=", ")         # Separateur personnalise
print("No newline", end="")            # Pas de retour a la ligne
```

## Structures de donnees

### Listes
```python
# Creation
lst = [1, 2, 3, 4, 5]
empty = []
mixed = [1, "two", 3.0, True]

# Acces
lst[0]                     # Premier element (1)
lst[-1]                    # Dernier element (5)
lst[1:3]                   # Tranche [2, 3] (index 1 a 2)
lst[:3]                    # 3 premiers : [1, 2, 3]
lst[2:]                    # A partir de l'index 2 : [3, 4, 5]
lst[::2]                   # Un sur deux : [1, 3, 5]
lst[::-1]                  # Inverse : [5, 4, 3, 2, 1]
len(lst)                   # Longueur (5)

# Modification
lst.append(6)              # Ajouter a la fin
lst.insert(0, 0)           # Inserer a une position
lst.extend([7, 8])         # Ajouter plusieurs elements
lst.pop()                  # Supprimer et retourner le dernier
lst.pop(0)                 # Supprimer et retourner a l'index
lst.remove(3)              # Supprimer la premiere occurrence de la valeur 3
del lst[0]                 # Supprimer a l'index

# Recherche et tri
3 in lst                   # True si 3 est dans la liste
lst.index(3)               # Index de la premiere occurrence
lst.count(3)               # Compter les occurrences
lst.sort()                 # Trier en place
sorted(lst)                # Retourner une copie triee (original inchange)
lst.reverse()              # Inverser en place
```

### Comprehensions de listes
```python
# Basique
squares = [x**2 for x in range(10)]

# Avec condition
evens = [x for x in range(20) if x % 2 == 0]

# Imbriquee
matrix = [[i*j for j in range(5)] for i in range(5)]

# Avec transformation
names = [name.upper() for name in ["alice", "bob"]]
```

### Tuples (listes immuables)
```python noexec
t = (1, 2, 3)
a, b, c = t                # Deballage
x, y = y, x                # Echanger des valeurs
```

### Dictionnaires
```python
d = {"name": "Alice", "age": 25}
d["name"]                  # Acces : "Alice"
d.get("email", "N/A")     # Acces securise avec valeur par defaut
d["email"] = "a@b.com"    # Ajouter/mettre a jour
del d["age"]               # Supprimer une cle
"name" in d                # Verifier l'existence d'une cle
d.keys()                   # Toutes les cles
d.values()                 # Toutes les valeurs
d.items()                  # Paires cle-valeur

# Iteration
for key, value in d.items():
    print(f"{key}: {value}")
```

### Ensembles
```python noexec
s = {1, 2, 3}
s.add(4)
s.remove(2)
s1 | s2                    # Union
s1 & s2                    # Intersection
s1 - s2                    # Difference
```

## Flux de controle

### Conditionnelles
```python noexec
if x > 0:
    print("Positive")
elif x == 0:
    print("Zero")
else:
    print("Negative")

# Ternaire
result = "even" if x % 2 == 0 else "odd"
```

### Boucles
```python noexec
# Boucle for
for item in [1, 2, 3]:
    print(item)

for i in range(10):        # 0 a 9
    print(i)

for i in range(2, 10, 2):  # 2, 4, 6, 8
    print(i)

for i, item in enumerate(lst):  # Avec index
    print(f"{i}: {item}")

# Boucle while
while condition:
    # ...
    if should_stop:
        break
    if should_skip:
        continue
```

## Fonctions

```python noexec
def greet(name, greeting="Hello"):
    """Saluer une personne (docstring)."""
    return f"{greeting}, {name}!"

# Appel
greet("Alice")                     # "Hello, Alice!"
greet("Bob", greeting="Hi")       # "Hi, Bob!"

# Valeurs de retour multiples
def min_max(lst):
    return min(lst), max(lst)

lo, hi = min_max([3, 1, 4, 1, 5])

# Lambda (fonction anonyme)
square = lambda x: x ** 2
sorted(lst, key=lambda x: x[1])   # Trier par le deuxieme element

# *args et **kwargs
def func(*args, **kwargs):
    print(args)      # Tuple d'arguments positionnels
    print(kwargs)    # Dictionnaire d'arguments nommes
```

## Programmation orientee objet

```python
class TableauTri:
    """Classe de tableau triable."""
    
    def __init__(self, taille=0):
        """Constructeur."""
        self.lst = [0] * taille    # Variable d'instance
        self.taille = taille
    
    def initialiser_aleatoire(self, vmin, vmax):
        """Remplir avec des valeurs aleatoires."""
        import random
        self.lst = [random.randint(vmin, vmax) for _ in range(self.taille)]
    
    def tri_selection(self):
        """Tri par selection."""
        n = len(self.lst)
        for i in range(n - 1):
            min_idx = i
            for j in range(i + 1, n):
                if self.lst[j] < self.lst[min_idx]:
                    min_idx = j
            if min_idx != i:
                self.lst[i], self.lst[min_idx] = self.lst[min_idx], self.lst[i]
    
    def __str__(self):
        """Representation sous forme de chaine."""
        return str(self.lst)

# Utilisation
tab = TableauTri(10)
tab.initialiser_aleatoire(0, 100)
print(tab)                         # Appelle __str__
tab.tri_selection()
print(tab)
```

### Concepts cles de la POO
- `__init__` : constructeur, appele lors de la creation d'une instance
- `self` : reference a l'instance courante (toujours premier parametre)
- Variables d'instance : `self.var` -- uniques a chaque instance
- Variables de classe : partagees entre toutes les instances
- `__str__` : appele par `print()` et `str()`
- `__repr__` : appele par `repr()` et en mode interactif

## Algorithmes de tri

### Tri par selection -- O(n^2)
Trouver le minimum dans la partie non triee, echanger avec le premier element non trie.
```python
def selection_sort(lst):
    n = len(lst)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if lst[j] < lst[min_idx]:
                min_idx = j
        if min_idx != i:
            lst[i], lst[min_idx] = lst[min_idx], lst[i]
    return lst
```

### Tri par insertion -- O(n^2), O(n) meilleur cas
Construire la partie triee en inserant chaque element a la bonne position.
```python
def insertion_sort(lst):
    for i in range(1, len(lst)):
        key = lst[i]
        j = i - 1
        while j >= 0 and lst[j] > key:
            lst[j + 1] = lst[j]
            j -= 1
        lst[j + 1] = key
    return lst
```

### Tri rapide (Quicksort) -- O(n log n) en moyenne
Diviser pour regner : partitionner autour d'un pivot, trier recursivement.
```python
def quicksort(lst):
    if len(lst) <= 1:
        return lst
    pivot = lst[len(lst) // 2]
    left = [x for x in lst if x < pivot]
    middle = [x for x in lst if x == pivot]
    right = [x for x in lst if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

### Tri fusion (Merge Sort) -- O(n log n) toujours
Diviser pour regner : couper en deux, trier recursivement, fusionner.
```python
def merge_sort(lst):
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    left = merge_sort(lst[:mid])
    right = merge_sort(lst[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

### Tableau comparatif

| Algorithme | Meilleur | Moyen | Pire | Espace | Stable |
|-----------|----------|-------|------|--------|--------|
| Selection | O(n^2) | O(n^2) | O(n^2) | O(1) | Non |
| Insertion | O(n) | O(n^2) | O(n^2) | O(1) | Oui |
| Quicksort | O(n log n) | O(n log n) | O(n^2) | O(log n) | Non |
| Tri fusion | O(n log n) | O(n log n) | O(n log n) | O(n) | Oui |
| sort Python | O(n) | O(n log n) | O(n log n) | O(n) | Oui |

## Entrees/Sorties fichiers

```python noexec
# Lecture
with open("file.txt", "r") as f:
    content = f.read()              # Fichier entier comme chaine
    
with open("file.txt", "r") as f:
    lines = f.readlines()           # Liste de lignes

with open("file.txt", "r") as f:
    for line in f:                  # Ligne par ligne (econome en memoire)
        line = line.strip()         # Supprimer le retour a la ligne
        print(line)

# Ecriture
with open("output.txt", "w") as f:
    f.write("Hello\n")
    f.writelines(["Line 1\n", "Line 2\n"])

# Ajout
with open("log.txt", "a") as f:
    f.write("New entry\n")

# CSV
import csv
with open("data.csv", "r") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# JSON
import json
with open("data.json", "r") as f:
    data = json.load(f)
with open("out.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Modules et imports

```python noexec
import os                          # Importer un module entier
from pathlib import Path           # Importer un element specifique
import random as rnd               # Importer avec un alias
from math import pi, sqrt          # Importer plusieurs elements

# Modules courants
import sys                         # Systeme (argv, exit)
import os                          # Operations systeme
import re                          # Expressions regulieres
import json                        # Gestion JSON
import csv                         # Gestion CSV
import random                      # Nombres aleatoires
import time                        # Fonctions de temps
import subprocess                  # Executer des commandes shell
import argparse                    # Arguments en ligne de commande
from pathlib import Path           # Manipulation de chemins
```

## Mesure de performance

```python noexec
from time import time

start = time()
# ... code a mesurer ...
end = time()
print(f"Temps ecoule : {end - start:.6f} secondes")
```

## Arguments en ligne de commande

```python noexec
import sys

# Simple : sys.argv
script_name = sys.argv[0]
if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <filename>")
    sys.exit(1)
filename = sys.argv[1]

# Avance : argparse
import argparse
parser = argparse.ArgumentParser(description="Process files")
parser.add_argument("input", help="Input file")
parser.add_argument("-v", "--verbose", action="store_true")
parser.add_argument("-n", "--number", type=int, default=10)
args = parser.parse_args()
```

---

## AIDE-MEMOIRE

### Types et operations
```
int, float, str, bool, list, dict, tuple, set, None
len(x), type(x), isinstance(x, int)
```

### Listes
```
lst[0], lst[-1], lst[1:3]      Acces/tranche
lst.append(x), lst.pop()       Ajouter/supprimer
sorted(lst), lst.sort()        Trier (copie vs en place)
[expr for x in iterable]       Comprehension de liste
```

### Chaines
```
s.upper(), s.lower(), s.strip()
s.split(sep), sep.join(lst)
s.replace(old, new), s.find(sub)
f"value: {var}"                 f-string
```

### Flux de controle
```
if/elif/else, for x in iterable, while cond
break, continue, pass
range(start, stop, step)
```

### Fonctions
```
def func(param, default=val):
    return result
lambda x: x * 2
```

### POO
```
class MyClass:
    def __init__(self):
        self.var = value
    def method(self):
        return self.var
```

### Entrees/Sorties fichiers
```
with open("file", "r") as f:
    content = f.read()
with open("file", "w") as f:
    f.write("text")
```

### Algorithmes de tri
```
Selection : O(n^2), trouver min et echanger
Insertion : O(n^2), inserer a la bonne place
Quicksort : O(n log n), partitionner autour du pivot
Tri fusion : O(n log n), diviser et fusionner
```
