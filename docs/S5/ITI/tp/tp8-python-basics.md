---
title: "LDS1 - Bases de Python et algorithmes de tri"
sidebar_position: 8
---

# LDS1 - Bases de Python et algorithmes de tri

## Objectifs pedagogiques

Introduction a la programmation Python avec un accent sur les structures de donnees et les algorithmes :

- Syntaxe Python et structures de base
- Listes et comprehensions de listes
- Fonctions et passage de parametres
- Programmation orientee objet (classes)
- Implementation d'algorithmes de tri
- Mesure de performance avec le module time

## Concepts fondamentaux

### 1. Bases de Python

**Variables et types** :
```python
x = 42                    # Integer
name = "Alice"            # String
values = [1, 2, 3]        # List
is_valid = True           # Boolean
```

**Fonctions** :
```python
def function_name(param1, param2):
    """Docstring describing function"""
    result = param1 + param2
    return result
```

**Listes** :
```python
# Creation
lst = [1, 2, 3, 4, 5]
empty = []

# Access
first = lst[0]
last = lst[-1]
length = len(lst)

# Modification
lst.append(6)              # Add to end
lst.insert(0, 0)           # Insert at position
lst.pop()                  # Remove last
lst.remove(3)              # Remove value 3

# Slicing
sublst = lst[1:4]          # Elements 1,2,3
```

**Comprehensions de listes** :
```python
# Create list with expression
squares = [x**2 for x in range(10)]

# With condition
evens = [x for x in range(10) if x % 2 == 0]
```

### 2. Programmation orientee objet

**Classes** :
```python noexec
class TableauTri:
    """Class for sortable array"""
    
    def __init__(self, taille=0):
        """Constructor"""
        self.lst = [0] * taille
    
    def initialiser_aleatoire(self, vmin, vmax):
        """Initialize with random values"""
        for i in range(len(self.lst)):
            self.lst[i] = random.randint(vmin, vmax)
    
    def tri_selection(self):
        """Selection sort algorithm"""
        # Implementation here
        pass
```

**Concepts cles de la POO** :
- `__init__`: Constructor method
- `self`: Reference to instance
- Instance variables: `self.variable`
- Methods: Functions belonging to class

### 3. Algorithmes de tri

#### Tri par selection
Trouver le minimum dans la partie non triee, echanger avec le premier element non trie.

**Complexity**: O(n²)

```python
def selection_sort(lst):
    n = len(lst)
    for i in range(n-1):
        min_idx = i
        for j in range(i+1, n):
            if lst[j] < lst[min_idx]:
                min_idx = j
        if min_idx != i:
            lst[i], lst[min_idx] = lst[min_idx], lst[i]
    return lst
```

#### Tri par insertion
Construire la partie triee en inserant chaque element a la bonne position.

**Complexity**: O(n²), but efficient for nearly-sorted data

```python
def insertion_sort(lst):
    for i in range(1, len(lst)):
        key = lst[i]
        j = i - 1
        while j >= 0 and lst[j] > key:
            lst[j+1] = lst[j]
            j -= 1
        lst[j+1] = key
    return lst
```

#### Tri rapide (Quicksort)
Diviser pour regner : partitionner autour d'un pivot, trier recursivement les partitions.

**Complexity**: O(n log n) average, O(n²) worst case

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

#### Tri fusion (Merge Sort)
Diviser pour regner : couper en deux, trier recursivement, fusionner les moities triees.

**Complexity**: O(n log n), stable

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

### 4. Mesure de performance

```python noexec
from time import time

start = time()
# ... code to measure ...
end = time()
elapsed = end - start
print(f"Elapsed time: {elapsed:.6f} seconds")
```

## Apercu des exercices

### Exercice 1 : Initialisation de tableaux aleatoires
Creer une fonction pour generer des tableaux aleatoires pour les tests.

**Concepts** : Functions, random module, list comprehensions

### Exercice 2 : Implementer les algorithmes de tri
Implementer plusieurs algorithmes de tri comme methodes de classe.

**Algorithmes** :
- Selection sort
- Insertion sort
- Quicksort
- Merge sort

### Exercice 3 : Comparaison de performances
Mesurer le temps d'execution des differents algorithmes sur des tableaux de tailles variees.

**Analyse** :
- Small arrays (n < 100)
- Medium arrays (n ~ 1000)
- Large arrays (n ~ 10000)

### Exercice 4 : Visualisation
Creer une visualisation simple ou des statistiques de performance des algorithmes de tri.

## Solutions

Voir le repertoire `src/` pour:
- `progimp.py` - Implementations simples
- `tableau_tri.py` - Solution complete basee sur les classes avec tous les algorithmes
- `performance_test.py` - Benchmark des differents algorithmes

## Points cles a retenir

1. **Python est concis** - Comprehensions de listes, tranches, deballage de tuples
2. **La POO pour l'organisation** - Les classes regroupent donnees et methodes liees
3. **Algorithm complexity matters** - O(n²) vs O(n log n) significant for large data
4. **Le tri integre de Python est rapide** - Utilise Timsort (hybride fusion/insertion optimise)
5. **Profiler avant d'optimiser** - Mesurer les performances reelles

## Motifs courants

### Initialisation de tableaux
```python noexec
# Fixed size with zeros
arr = [0] * n

# Random values
import random
arr = [random.randint(min, max) for _ in range(n)]

# From existing data
arr = list(existing_data)
```

### En place vs nouveau tableau
```python noexec
# In-place (modifies original)
lst.sort()

# New array (returns sorted copy)
sorted_lst = sorted(lst)
```

### Echange
```python noexec
# Python idiom (no temp variable needed)
a, b = b, a
lst[i], lst[j] = lst[j], lst[i]
```

## Erreurs courantes

1. **Oublier self dans les methodes** - Les methodes necessitent le parametre `self`
2. **Modifier une liste pendant l'iteration** - Cree un comportement inattendu
3. **Ne pas retourner depuis les fonctions** - Les fonctions retournent None par defaut
4. **Copie superficielle vs profonde** - `lst.copy()` vs `copy.deepcopy(lst)`
5. **Erreurs de bornes avec range** - `range(n)` va de 0 a n-1

## Pour aller plus loin

- Python Tutorial: https://docs.python.org/3/tutorial/
- Sorting algorithms: https://visualgo.net/en/sorting
- Time complexity: Big O notation
- Python's Timsort: https://en.wikipedia.org/wiki/Timsort

## Comparaison des algorithmes de tri

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Python sort | O(n) | O(n log n) | O(n log n) | O(n) | Yes |

**Quand utiliser** :
- Selection : educatif, simple a comprendre
- Insertion : petits tableaux, donnees presque triees
- Quicksort : usage general, en place
- Tri fusion : O(n log n) garanti, stable
- sort Python : code de production (Timsort est optimise)
