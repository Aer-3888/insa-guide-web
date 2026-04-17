---
title: "Complexity Analysis (Analyse de Complexite)"
sidebar_position: 9
---

# Complexity Analysis (Analyse de Complexite)

## Asymptotic Notation

### Big-O: O(f(n)) -- Upper Bound

f(n) = O(g(n)) means there exist constants c > 0 and n0 such that:
  f(n) <= c * g(n) for all n >= n0

"f grows no faster than g"

### Big-Omega: Omega(f(n)) -- Lower Bound

f(n) = Omega(g(n)) means there exist constants c > 0 and n0 such that:
  f(n) >= c * g(n) for all n >= n0

"f grows at least as fast as g"

### Big-Theta: Theta(f(n)) -- Tight Bound

f(n) = Theta(g(n)) means f(n) = O(g(n)) AND f(n) = Omega(g(n))

"f grows at the same rate as g"


## Common Complexity Classes

```
O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)

n=1000:
  O(1)        = 1
  O(log n)    = ~10
  O(n)        = 1,000
  O(n log n)  = ~10,000
  O(n^2)      = 1,000,000
  O(n^3)      = 1,000,000,000
  O(2^n)      = (astronomically large)
```


## Complexity of SDD Data Structures

### Linked List

| Operation | Singly Linked | Doubly Linked (at cursor) |
|-----------|--------------|---------------------------|
| Access i-th | O(n) | O(n) |
| Insert at cursor | O(1) | O(1) |
| Delete at cursor | O(n)* | O(1) |
| Search | O(n) | O(n) |
| Insert at head | O(1) | O(1) |
| Insert at tail | O(n)** | O(1) |

*Need predecessor for singly linked.
**O(1) if you maintain a tail pointer.

### Hash Table

| Operation | Average | Worst Case |
|-----------|---------|------------|
| Insert | O(1) | O(n) |
| Search | O(1) | O(n) |
| Delete | O(1) | O(n) |

Worst case: all keys hash to same bucket.
Average case assumes uniform hashing and load factor alpha < 1.

### Binary Search Tree

| Operation | Balanced (AVL) | Worst (degenerate) |
|-----------|---------------|-------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| Traversal | O(n) | O(n) |

### Heap / Priority Queue

| Operation | Binary Heap |
|-----------|------------|
| Insert (add) | O(log n) |
| Extract min/max (poll) | O(log n) |
| Peek | O(1) |
| Build heap (heapify) | O(n) |
| Heap sort | O(n log n) |

### Graph Algorithms

| Algorithm | Time | Space |
|-----------|------|-------|
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |
| Dijkstra (heap) | O((V + E) log V) | O(V + E) |


## Amortized Analysis

### Concept

Some operations are expensive occasionally but cheap most of the time. Amortized analysis gives the **average cost per operation** over a worst-case sequence.

### Example: Dynamic Array (ArrayList)

When the array is full, double its capacity (copy all elements).

```
Operation costs for n insertions:
  Insert 1:  cost 1
  Insert 2:  cost 1 + 2 (copy)  = 3
  Insert 3:  cost 1
  Insert 4:  cost 1 + 4 (copy)  = 5
  Insert 5:  cost 1
  ...
  Insert 8:  cost 1 + 8 (copy)  = 9

Total for n insertions: n + (1 + 2 + 4 + ... + n) = n + 2n - 1 < 3n
Amortized cost per insertion: O(3n/n) = O(1)
```

### Example: Hash Table Rehashing

When load factor exceeds threshold, create 2x larger table and rehash all entries.

```
n insertions with doubling at alpha = 1:
  Total work: n + (1 + 2 + 4 + ... + n) = O(n)
  Amortized per insert: O(1)
```


## Proof Techniques

### Proving O(f(n))

1. Find constants c and n0 such that T(n) <= c * f(n) for all n >= n0
2. Often: identify the dominant term and show it bounds T(n)

**Example**: T(n) = 3n^2 + 5n + 7 is O(n^2)

Proof: For n >= 1: 3n^2 + 5n + 7 <= 3n^2 + 5n^2 + 7n^2 = 15n^2
So c = 15, n0 = 1.

### Proving Theta(f(n))

Must prove both O(f(n)) and Omega(f(n)).

**Example**: T(n) = 3n^2 + 5n + 7 is Theta(n^2)

Upper: shown above, O(n^2)
Lower: For n >= 1: 3n^2 + 5n + 7 >= 3n^2, so Omega(n^2) with c = 3.

### Recurrence Relations

Many tree algorithms have recurrences:

**Binary search**: T(n) = T(n/2) + O(1) -> T(n) = O(log n)
**Merge sort**: T(n) = 2T(n/2) + O(n) -> T(n) = O(n log n)
**Tree traversal**: T(n) = T(k) + T(n-1-k) + O(1) -> T(n) = O(n)

### Master Theorem

For T(n) = aT(n/b) + O(n^d):

| Condition | Result |
|-----------|--------|
| d > log_b(a) | T(n) = O(n^d) |
| d = log_b(a) | T(n) = O(n^d * log n) |
| d < log_b(a) | T(n) = O(n^(log_b(a))) |


## Sorting Algorithms Comparison

| Algorithm | Best | Average | Worst | Space | Stable? |
|-----------|------|---------|-------|-------|---------|
| Bubble sort | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| Selection sort | O(n^2) | O(n^2) | O(n^2) | O(1) | No |
| Insertion sort | O(n) | O(n^2) | O(n^2) | O(1) | Yes |
| Merge sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick sort | O(n log n) | O(n log n) | O(n^2) | O(log n) | No |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting sort | O(n+k) | O(n+k) | O(n+k) | O(k) | Yes |

Lower bound for comparison-based sorting: Omega(n log n).


## Common Mistakes

1. **Confusing O and Theta**: O(n^2) does NOT mean exactly n^2 steps
2. **Dropping constants too early**: 100n is O(n) but matters in practice
3. **Ignoring amortization**: ArrayList.add is O(1) amortized, not worst case
4. **Wrong recurrence**: counting only recursive calls, forgetting the work at each level
5. **Assuming balanced BST**: unbalanced BST can be O(n) for all operations


## CHEAT SHEET

```
NOTATION:
  O(f)     : upper bound  (at most)
  Omega(f) : lower bound  (at least)
  Theta(f) : tight bound  (exactly)

GROWTH RATES:
  1 < log n < sqrt(n) < n < n log n < n^2 < n^3 < 2^n < n!

KEY COMPLEXITIES:
  Hash table:     O(1) avg, O(n) worst
  BST balanced:   O(log n) all ops
  Heap add/poll:  O(log n)
  Heap build:     O(n)
  Dijkstra:       O((V+E) log V)
  BFS/DFS:        O(V+E)
  Sorting lower:  Omega(n log n) comparison-based

AMORTIZED:
  Dynamic array append: O(1) amortized (doubling strategy)
  Hash table insert with rehash: O(1) amortized

MASTER THEOREM: T(n) = aT(n/b) + O(n^d)
  d > log_b(a) => O(n^d)
  d = log_b(a) => O(n^d log n)
  d < log_b(a) => O(n^(log_b a))
```
