---
title: "TP8 - LDS1: Python Basics & Sorting Algorithms"
sidebar_position: 6
---

# TP8 - LDS1: Python Basics & Sorting Algorithms

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp8_python_basics/README.md

## Exercise 1

### Random Array Initialization: create a function to generate random arrays of integers for testing sorting algorithms

**1a. Interactive exploration**

**Answer:**

```python noexec
>>> import random
>>> random.randint(0, 100)
42

>>> [random.randint(0, 100) for _ in range(10)]
[23, 67, 12, 89, 45, 3, 56, 78, 34, 91]
```

---

**1b. Initialization function**

**Answer:**

```python
import random
from time import time


def generate_random_array(n, vmin=0, vmax=100):
    """Generate array of n random integers in [vmin, vmax]."""
    return [random.randint(vmin, vmax) for _ in range(n)]


if __name__ == "__main__":
    arr = generate_random_array(20, 0, 1000)
    print(f"Array of 20 elements: {arr}")
    print(f"Length: {len(arr)}")
    print(f"Min: {min(arr)}, Max: {max(arr)}")
```

**Expected output (values differ due to randomness):**
```
Array of 20 elements: [234, 891, 45, 672, 123, 999, 567, 12, ...]
Length: 20
Min: 12, Max: 999
```

---

## Exercise 2

### Implement Sorting Algorithms: selection sort, insertion sort, quicksort, merge sort as class methods

**2a. Selection sort**

**Answer:**

```python
def selection_sort(lst):
    """
    Selection Sort: Find minimum in unsorted portion, swap to front.
    Complexity: O(n^2) always.
    """
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

**Step-by-step trace on `[64, 25, 12, 22, 11]`:**
```
i=0: Scan [64, 25, 12, 22, 11] -> min is 11 at index 4
     Swap arr[0] and arr[4]: [11, 25, 12, 22, 64]

i=1: Scan [25, 12, 22, 64] -> min is 12 at index 2
     Swap arr[1] and arr[2]: [11, 12, 25, 22, 64]

i=2: Scan [25, 22, 64] -> min is 22 at index 3
     Swap arr[2] and arr[3]: [11, 12, 22, 25, 64]

i=3: Scan [25, 64] -> min is 25, already in position

Result: [11, 12, 22, 25, 64]
```

---

**2b. Insertion sort**

**Answer:**

```python
def insertion_sort(lst):
    """
    Insertion Sort: Build sorted portion by inserting each element.
    Complexity: O(n^2) worst, O(n) best (nearly sorted).
    """
    for i in range(1, len(lst)):
        key = lst[i]
        j = i - 1
        while j >= 0 and lst[j] > key:
            lst[j + 1] = lst[j]
            j -= 1
        lst[j + 1] = key
    return lst
```

**Trace on `[12, 11, 13, 5, 6]`:**
```
i=1: key=11, shift 12 right -> Insert at 0: [11, 12, 13, 5, 6]
i=2: key=13, 12 < 13 stop   -> [11, 12, 13, 5, 6]
i=3: key=5, shift 13,12,11  -> Insert at 0: [5, 11, 12, 13, 6]
i=4: key=6, shift 13,12,11  -> Insert at 1: [5, 6, 11, 12, 13]
```

---

**2c. Quicksort**

**Answer:**

```python
def quicksort(lst):
    """
    Quicksort: Divide around pivot, recursively sort partitions.
    Complexity: O(n log n) average, O(n^2) worst case.
    """
    if len(lst) <= 1:
        return lst
    pivot = lst[len(lst) // 2]
    left = [x for x in lst if x < pivot]
    middle = [x for x in lst if x == pivot]
    right = [x for x in lst if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

**Trace on `[3, 6, 8, 10, 1, 2, 1]`:**
```
quicksort([3, 6, 8, 10, 1, 2, 1])
  pivot=10, left=[3,6,8,1,2,1], middle=[10], right=[]
  quicksort([3, 6, 8, 1, 2, 1])
    pivot=1, left=[], middle=[1,1], right=[3,6,8,2]
    quicksort([3, 6, 8, 2])
      pivot=8, left=[3,6,2], middle=[8], right=[]
      quicksort([3, 6, 2])
        pivot=6, left=[3,2], middle=[6], right=[]
        quicksort([3, 2])
          pivot=2, left=[], middle=[2], right=[3]
          Return: [2, 3]
        Return: [2, 3, 6]
      Return: [2, 3, 6, 8]
    Return: [1, 1, 2, 3, 6, 8]
  Return: [1, 1, 2, 3, 6, 8, 10]
```

---

**2d. Merge sort**

**Answer:**

```python
def merge_sort(lst):
    """
    Merge Sort: Split in half, recursively sort, merge sorted halves.
    Complexity: O(n log n) always, stable sort.
    """
    if len(lst) <= 1:
        return lst
    mid = len(lst) // 2
    left = merge_sort(lst[:mid])
    right = merge_sort(lst[mid:])
    return merge(left, right)


def merge(left, right):
    """Merge two sorted lists into one sorted list."""
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

---

## Exercise 3

### Class-Based Implementation: encapsulate sorting algorithms in a `TableauTri` class with initialization, copying, sorting methods, and a sorted-check method

**Answer:**

```python noexec
class TableauTri:
    """Sortable array class for comparing sorting algorithms."""

    def __init__(self, taille=0):
        self.lst = [0] * taille
        self.taille = taille

    def initialiser_aleatoire(self, vmin, vmax):
        """Fill with random values."""
        self.lst = [random.randint(vmin, vmax) for _ in range(self.taille)]

    def copie(self):
        """Return a deep copy (for fair comparison)."""
        t = TableauTri(self.taille)
        t.lst = self.lst.copy()
        return t

    def tri_selection(self):
        """Selection sort."""
        n = self.taille
        for i in range(n - 1):
            min_idx = i
            for j in range(i + 1, n):
                if self.lst[j] < self.lst[min_idx]:
                    min_idx = j
            if min_idx != i:
                self.lst[i], self.lst[min_idx] = self.lst[min_idx], self.lst[i]

    def tri_insertion(self):
        """Insertion sort."""
        for i in range(1, self.taille):
            key = self.lst[i]
            j = i - 1
            while j >= 0 and self.lst[j] > key:
                self.lst[j + 1] = self.lst[j]
                j -= 1
            self.lst[j + 1] = key

    def tri_rapide(self):
        """Quicksort (wrapper)."""
        self.lst = self._quicksort(self.lst)

    def _quicksort(self, lst):
        if len(lst) <= 1:
            return lst
        pivot = lst[len(lst) // 2]
        left = [x for x in lst if x < pivot]
        middle = [x for x in lst if x == pivot]
        right = [x for x in lst if x > pivot]
        return self._quicksort(left) + middle + self._quicksort(right)

    def est_trie(self):
        """Check if array is sorted."""
        for i in range(self.taille - 1):
            if self.lst[i] > self.lst[i + 1]:
                return False
        return True

    def __str__(self):
        return str(self.lst)
```

**Test:**

```python noexec
tab = TableauTri(10)
tab.initialiser_aleatoire(0, 100)
print(f"Original: {tab}")
print(f"Sorted? {tab.est_trie()}")

tab2 = tab.copie()
tab2.tri_selection()
print(f"After selection sort: {tab2}")
print(f"Sorted? {tab2.est_trie()}")
print(f"Original still: {tab}")
```

**Expected output:**
```
Original: [45, 23, 78, 12, 56, 89, 34, 67, 1, 90]
Sorted? False
After selection sort: [1, 12, 23, 34, 45, 56, 67, 78, 89, 90]
Sorted? True
Original still: [45, 23, 78, 12, 56, 89, 34, 67, 1, 90]
```

---

## Exercise 4

### Performance Comparison: measure execution time of each sorting algorithm on arrays of increasing size

**Answer:**

```python noexec
def benchmark_sorting():
    """Compare sorting algorithm performance."""
    sizes = [100, 500, 1000, 5000, 10000]

    for size in sizes:
        print(f"\n--- Array size: {size} ---")
        base = TableauTri(size)
        base.initialiser_aleatoire(0, 100000)

        # Selection sort
        tab = base.copie()
        start = time()
        tab.tri_selection()
        elapsed = time() - start
        assert tab.est_trie(), "Selection sort failed!"
        print(f"Selection: {elapsed:.4f}s")

        # Insertion sort
        tab = base.copie()
        start = time()
        tab.tri_insertion()
        elapsed = time() - start
        assert tab.est_trie(), "Insertion sort failed!"
        print(f"Insertion: {elapsed:.4f}s")

        # Quicksort
        tab = base.copie()
        start = time()
        tab.tri_rapide()
        elapsed = time() - start
        assert tab.est_trie(), "Quicksort failed!"
        print(f"Quicksort: {elapsed:.4f}s")

        # Python built-in (Timsort)
        tab = base.copie()
        start = time()
        tab.lst.sort()
        elapsed = time() - start
        assert tab.est_trie(), "Built-in sort failed!"
        print(f"Built-in:  {elapsed:.4f}s")


if __name__ == "__main__":
    benchmark_sorting()
```

**Expected output (times vary by machine):**
```
--- Array size: 100 ---
Selection: 0.0005s
Insertion: 0.0003s
Quicksort: 0.0001s
Built-in:  0.0000s

--- Array size: 1000 ---
Selection: 0.0400s
Insertion: 0.0250s
Quicksort: 0.0020s
Built-in:  0.0001s

--- Array size: 10000 ---
Selection: 4.0000s
Insertion: 2.5000s
Quicksort: 0.0300s
Built-in:  0.0020s
```

**Complexity comparison:**

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Selection | O(n^2) | O(n^2) | O(n^2) | O(1) | No |
| Insertion | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| Quicksort | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Timsort | O(n) | O(n log n) | O(n log n) | O(n) | Yes |

**Key observations:**
- O(n^2) algorithms become impractical above ~5000 elements
- Quadrupling size roughly quadruples time for O(n^2), only doubles for O(n log n)
- Python's built-in `sort()` (Timsort, C implementation) is ~15x faster than Python quicksort
- Insertion sort is faster than selection sort on average (early exit when elements are ordered)
