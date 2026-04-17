---
title: "Python Basics"
sidebar_position: 5
---

# Python Basics

## Overview

The LDS part of the ITI course introduces Python as a scripting language. Topics include basic syntax, data structures, object-oriented programming, sorting algorithms, and file I/O. Python is tested in the January (LDS) exam.

## Syntax Fundamentals

### Variables and Types
```python
# Dynamic typing -- no type declarations needed
x = 42                     # int
pi = 3.14                  # float
name = "Alice"             # str
is_valid = True            # bool
nothing = None             # NoneType

# Type checking
type(x)                    # <class 'int'>
isinstance(x, int)         # True
```

### Strings
```python
s = "Hello, World!"
s = 'Single quotes work too'
s = """Multi-line
string"""

# Operations
len(s)                     # Length
s.upper()                  # "HELLO, WORLD!"
s.lower()                  # "hello, world!"
s.strip()                  # Remove leading/trailing whitespace
s.split(",")               # Split into list: ["Hello", " World!"]
", ".join(["a", "b"])      # "a, b"
s.replace("old", "new")   # Replace substring
s.startswith("Hello")      # True
s.find("World")            # Index of substring (or -1)

# Formatting
f"Name: {name}, Age: {age}"             # f-string (recommended)
"Name: {}, Age: {}".format(name, age)   # format method
"Name: %s, Age: %d" % (name, age)       # C-style (older)
```

### Print
```python
print("Hello")                          # Basic
print(f"x = {x}")                       # f-string
print(f"Pi: {pi:.2f}")                  # 2 decimal places
print("a", "b", "c", sep=", ")         # Custom separator
print("No newline", end="")            # No trailing newline
```

## Data Structures

### Lists
```python
# Creation
lst = [1, 2, 3, 4, 5]
empty = []
mixed = [1, "two", 3.0, True]

# Access
lst[0]                     # First element (1)
lst[-1]                    # Last element (5)
lst[1:3]                   # Slice [2, 3] (index 1 to 2)
lst[:3]                    # First 3: [1, 2, 3]
lst[2:]                    # From index 2: [3, 4, 5]
lst[::2]                   # Every 2nd: [1, 3, 5]
lst[::-1]                  # Reversed: [5, 4, 3, 2, 1]
len(lst)                   # Length (5)

# Modification
lst.append(6)              # Add to end
lst.insert(0, 0)           # Insert at position
lst.extend([7, 8])         # Add multiple items
lst.pop()                  # Remove and return last
lst.pop(0)                 # Remove and return at index
lst.remove(3)              # Remove first occurrence of value 3
del lst[0]                 # Delete at index

# Searching and sorting
3 in lst                   # True if 3 is in list
lst.index(3)               # Index of first occurrence
lst.count(3)               # Count occurrences
lst.sort()                 # Sort in-place
sorted(lst)                # Return sorted copy (original unchanged)
lst.reverse()              # Reverse in-place
```

### List Comprehensions
```python
# Basic
squares = [x**2 for x in range(10)]

# With condition
evens = [x for x in range(20) if x % 2 == 0]

# Nested
matrix = [[i*j for j in range(5)] for i in range(5)]

# With transformation
names = [name.upper() for name in ["alice", "bob"]]
```

### Tuples (immutable lists)
```python
t = (1, 2, 3)
a, b, c = t                # Unpacking
x, y = y, x                # Swap values
```

### Dictionaries
```python
d = {"name": "Alice", "age": 25}
d["name"]                  # Access: "Alice"
d.get("email", "N/A")     # Safe access with default
d["email"] = "a@b.com"    # Add/update
del d["age"]               # Delete key
"name" in d                # Check key exists
d.keys()                   # All keys
d.values()                 # All values
d.items()                  # Key-value pairs

# Iteration
for key, value in d.items():
    print(f"{key}: {value}")
```

### Sets
```python
s = {1, 2, 3}
s.add(4)
s.remove(2)
s1 | s2                    # Union
s1 & s2                    # Intersection
s1 - s2                    # Difference
```

## Control Flow

### Conditionals
```python
if x > 0:
    print("Positive")
elif x == 0:
    print("Zero")
else:
    print("Negative")

# Ternary
result = "even" if x % 2 == 0 else "odd"
```

### Loops
```python
# For loop
for item in [1, 2, 3]:
    print(item)

for i in range(10):        # 0 to 9
    print(i)

for i in range(2, 10, 2):  # 2, 4, 6, 8
    print(i)

for i, item in enumerate(lst):  # With index
    print(f"{i}: {item}")

# While loop
while condition:
    # ...
    if should_stop:
        break
    if should_skip:
        continue
```

## Functions

```python
def greet(name, greeting="Hello"):
    """Greet a person (docstring)."""
    return f"{greeting}, {name}!"

# Call
greet("Alice")                     # "Hello, Alice!"
greet("Bob", greeting="Hi")       # "Hi, Bob!"

# Multiple return values
def min_max(lst):
    return min(lst), max(lst)

lo, hi = min_max([3, 1, 4, 1, 5])

# Lambda (anonymous function)
square = lambda x: x ** 2
sorted(lst, key=lambda x: x[1])   # Sort by second element

# *args and **kwargs
def func(*args, **kwargs):
    print(args)      # Tuple of positional args
    print(kwargs)    # Dict of keyword args
```

## Object-Oriented Programming

```python
class TableauTri:
    """Sortable array class."""
    
    def __init__(self, taille=0):
        """Constructor."""
        self.lst = [0] * taille    # Instance variable
        self.taille = taille
    
    def initialiser_aleatoire(self, vmin, vmax):
        """Fill with random values."""
        import random
        self.lst = [random.randint(vmin, vmax) for _ in range(self.taille)]
    
    def tri_selection(self):
        """Selection sort."""
        n = len(self.lst)
        for i in range(n - 1):
            min_idx = i
            for j in range(i + 1, n):
                if self.lst[j] < self.lst[min_idx]:
                    min_idx = j
            if min_idx != i:
                self.lst[i], self.lst[min_idx] = self.lst[min_idx], self.lst[i]
    
    def __str__(self):
        """String representation."""
        return str(self.lst)

# Usage
tab = TableauTri(10)
tab.initialiser_aleatoire(0, 100)
print(tab)                         # Calls __str__
tab.tri_selection()
print(tab)
```

### Key OOP Concepts
- `__init__`: Constructor, called when creating instance
- `self`: Reference to the current instance (always first parameter)
- Instance variables: `self.var` -- unique to each instance
- Class variables: Shared across all instances
- `__str__`: Called by `print()` and `str()`
- `__repr__`: Called by `repr()` and in interactive mode

## Sorting Algorithms

### Selection Sort -- O(n^2)
Find minimum in unsorted portion, swap with first unsorted element.
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

### Insertion Sort -- O(n^2), O(n) best case
Build sorted portion by inserting each element in correct position.
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

### Quicksort -- O(n log n) average
Divide-and-conquer: partition around pivot, recursively sort.
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

### Merge Sort -- O(n log n) always
Divide-and-conquer: split in half, recursively sort, merge.
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

### Comparison Table

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Selection | O(n^2) | O(n^2) | O(n^2) | O(1) | No |
| Insertion | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| Quicksort | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Python sort | O(n) | O(n log n) | O(n log n) | O(n) | Yes |

## File I/O

```python
# Reading
with open("file.txt", "r") as f:
    content = f.read()              # Entire file as string
    
with open("file.txt", "r") as f:
    lines = f.readlines()           # List of lines

with open("file.txt", "r") as f:
    for line in f:                  # Line by line (memory efficient)
        line = line.strip()         # Remove newline
        print(line)

# Writing
with open("output.txt", "w") as f:
    f.write("Hello\n")
    f.writelines(["Line 1\n", "Line 2\n"])

# Appending
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

## Modules and Imports

```python
import os                          # Import entire module
from pathlib import Path           # Import specific item
import random as rnd               # Import with alias
from math import pi, sqrt          # Import multiple items

# Common modules
import sys                         # System (argv, exit)
import os                          # OS operations
import re                          # Regular expressions
import json                        # JSON handling
import csv                         # CSV handling
import random                      # Random numbers
import time                        # Time functions
import subprocess                  # Run shell commands
import argparse                    # CLI arguments
from pathlib import Path           # Path manipulation
```

## Performance Measurement

```python
from time import time

start = time()
# ... code to measure ...
end = time()
print(f"Elapsed: {end - start:.6f} seconds")
```

## Command-Line Arguments

```python
import sys

# Simple: sys.argv
script_name = sys.argv[0]
if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <filename>")
    sys.exit(1)
filename = sys.argv[1]

# Advanced: argparse
import argparse
parser = argparse.ArgumentParser(description="Process files")
parser.add_argument("input", help="Input file")
parser.add_argument("-v", "--verbose", action="store_true")
parser.add_argument("-n", "--number", type=int, default=10)
args = parser.parse_args()
```

---

## CHEAT SHEET

### Types & Operations
```
int, float, str, bool, list, dict, tuple, set, None
len(x), type(x), isinstance(x, int)
```

### Lists
```
lst[0], lst[-1], lst[1:3]      Access/slice
lst.append(x), lst.pop()       Add/remove
sorted(lst), lst.sort()        Sort (copy vs in-place)
[expr for x in iterable]       List comprehension
```

### Strings
```
s.upper(), s.lower(), s.strip()
s.split(sep), sep.join(lst)
s.replace(old, new), s.find(sub)
f"value: {var}"                 f-string
```

### Control Flow
```
if/elif/else, for x in iterable, while cond
break, continue, pass
range(start, stop, step)
```

### Functions
```
def func(param, default=val):
    return result
lambda x: x * 2
```

### OOP
```
class MyClass:
    def __init__(self):
        self.var = value
    def method(self):
        return self.var
```

### File I/O
```
with open("file", "r") as f:
    content = f.read()
with open("file", "w") as f:
    f.write("text")
```

### Sorting Algorithms
```
Selection: O(n^2), find min swap
Insertion: O(n^2), insert in place
Quicksort: O(n log n), pivot partition
Merge sort: O(n log n), split and merge
```
