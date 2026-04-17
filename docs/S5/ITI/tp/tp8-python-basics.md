---
title: "LDS1 - Python Basics & Sorting Algorithms"
sidebar_position: 8
---

# LDS1 - Python Basics & Sorting Algorithms

## Learning Objectives

Introduction to Python programming with focus on data structures and algorithms:

- Python syntax and basic structures
- Lists and list comprehensions
- Functions and parameter passing
- Object-oriented programming (classes)
- Sorting algorithm implementation
- Performance measurement with time module

## Core Concepts

### 1. Python Basics

**Variables & Types**:
```python
x = 42                    # Integer
name = "Alice"            # String
values = [1, 2, 3]        # List
is_valid = True           # Boolean
```

**Functions**:
```python
def function_name(param1, param2):
    """Docstring describing function"""
    result = param1 + param2
    return result
```

**Lists**:
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

**List Comprehensions**:
```python
# Create list with expression
squares = [x**2 for x in range(10)]

# With condition
evens = [x for x in range(10) if x % 2 == 0]
```

### 2. Object-Oriented Programming

**Classes**:
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

**Key OOP Concepts**:
- `__init__`: Constructor method
- `self`: Reference to instance
- Instance variables: `self.variable`
- Methods: Functions belonging to class

### 3. Sorting Algorithms

#### Selection Sort
Find minimum in unsorted portion, swap with first unsorted element.

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

#### Insertion Sort
Build sorted portion by inserting each element in correct position.

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

#### Quicksort
Divide-and-conquer: partition around pivot, recursively sort partitions.

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

#### Merge Sort
Divide-and-conquer: split in half, recursively sort, merge sorted halves.

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

### 4. Performance Measurement

```python noexec
from time import time

start = time()
# ... code to measure ...
end = time()
elapsed = end - start
print(f"Elapsed time: {elapsed:.6f} seconds")
```

## Exercises Overview

### Exercise 1: Random Array Initialization
Create function to generate random arrays for testing.

**Concepts**: Functions, random module, list comprehensions

### Exercise 2: Implement Sorting Algorithms
Implement multiple sorting algorithms as class methods.

**Algorithms**:
- Selection sort
- Insertion sort
- Quicksort
- Merge sort

### Exercise 3: Performance Comparison
Measure execution time of different algorithms on various array sizes.

**Analysis**:
- Small arrays (n < 100)
- Medium arrays (n ~ 1000)
- Large arrays (n ~ 10000)

### Exercise 4: Visualization
Create simple visualization or statistics of sorting performance.

## Solutions

See `src/` directory for:
- `progimp.py` - Simple implementations
- `tableau_tri.py` - Complete class-based solution with all algorithms
- `performance_test.py` - Benchmark different algorithms

## Key Takeaways

1. **Python is concise** - List comprehensions, slicing, tuple unpacking
2. **OOP for organization** - Classes group related data and methods
3. **Algorithm complexity matters** - O(n²) vs O(n log n) significant for large data
4. **Python built-in sort is fast** - Uses Timsort (optimized merge/insertion hybrid)
5. **Profile before optimizing** - Measure actual performance

## Common Patterns

### Array Initialization
```python noexec
# Fixed size with zeros
arr = [0] * n

# Random values
import random
arr = [random.randint(min, max) for _ in range(n)]

# From existing data
arr = list(existing_data)
```

### In-Place vs New Array
```python noexec
# In-place (modifies original)
lst.sort()

# New array (returns sorted copy)
sorted_lst = sorted(lst)
```

### Swapping
```python noexec
# Python idiom (no temp variable needed)
a, b = b, a
lst[i], lst[j] = lst[j], lst[i]
```

## Common Pitfalls

1. **Forgetting self in methods** - Methods need `self` parameter
2. **Modifying list while iterating** - Creates unexpected behavior
3. **Not returning from functions** - Functions return None by default
4. **Shallow vs deep copy** - `lst.copy()` vs `copy.deepcopy(lst)`
5. **Range off-by-one errors** - `range(n)` goes 0 to n-1

## Further Reading

- Python Tutorial: https://docs.python.org/3/tutorial/
- Sorting algorithms: https://visualgo.net/en/sorting
- Time complexity: Big O notation
- Python's Timsort: https://en.wikipedia.org/wiki/Timsort

## Sorting Algorithm Comparison

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Python sort | O(n) | O(n log n) | O(n log n) | O(n) | Yes |

**When to use**:
- Selection: Educational, simple to understand
- Insertion: Small arrays, nearly-sorted data
- Quicksort: General purpose, in-place
- Merge Sort: Guaranteed O(n log n), stable
- Python sort: Production code (Timsort is optimized)
