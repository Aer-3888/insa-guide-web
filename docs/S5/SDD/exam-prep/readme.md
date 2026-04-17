---
title: "SDD -- Exam Preparation"
sidebar_position: 0
---

# SDD -- Exam Preparation

## Exam Format

The SDD exam (DS) is a written exam, typically 2-3 hours. Based on analysis of past exams from 2013-2025, the exam consistently tests:

1. **Abstract Data Types (TAD)** -- formal specifications with SORTE, FONCTIONS, AXIOMES
2. **Binary Search Trees** -- insertion, deletion, traversal, height analysis
3. **Algorithm implementation** -- write Java code on paper
4. **Complexity analysis** -- prove Big-O, compare data structures
5. **Data structure design** -- novel structures combining known primitives

## Topic Frequency Across Past Exams

| Topic | Frequency | Typical Questions |
|-------|-----------|-------------------|
| Binary Trees / BST | Very high | Insert, delete, traversal, height, balance |
| Abstract Data Types | Very high | Define TAD with axioms, prove theorems |
| Complexity Analysis | High | Prove O/Theta, compare implementations |
| Linked Lists | Medium | Implement operations, cursor navigation |
| Hash Tables | Medium | Hash function design, collision analysis |
| Heaps | Medium | HeapPQ operations, trace heapify |
| Graphs / Dijkstra | Low-Medium | Trace algorithm, path reconstruction |
| Advanced structures | Variable | Bloom filters (2021), Segment trees (2022), Interval sums |

## Exam Strategy

### Time Allocation (2h exam)

1. **Read entire exam first** (5 min) -- identify easy vs. hard questions
2. **TAD / Theory questions** (30 min) -- quick if you know the formalism
3. **Tree / BST implementation** (30 min) -- most frequent, most points
4. **Complexity analysis** (20 min) -- prove bounds carefully
5. **Implementation questions** (25 min) -- write clean Java code
6. **Review** (10 min) -- check edge cases, off-by-one errors

### Writing Java on Paper

- Write **clear method signatures** with return types
- Handle **edge cases first** (null, empty, single element)
- Use **early returns** to reduce nesting
- Draw **ASCII diagrams** before and after operations
- **State complexity** next to each method

## Past Exam Analysis

### 2020 Exam -- BST Focus

**Exercise 1: TAD and BST**
- Q1: Distinguish axiom vs. theorem in formal specification
- Q2: Define TAD Boolean with axioms for vrai/faux/non/et/ou
- Q3: Prove De Morgan's laws from axioms (by case analysis)
- Q4: Trace BST insertion of sequence [7, 3, 10, 1, 6, 14, 4, 7]
- Q5: Implement `placer(int i)` -- BST insertion
- Q6: Explain deletion with 2 children (replace with max of left subtree)
- Q7: Implement `oterPlusGrandInf()` -- find and remove max in left subtree
- Q8: Implement `supprimerEc()` -- full BST deletion

**Key insight from student solution**: The BST deletion with 2 children requires finding the rightmost node in the left subtree (the in-order predecessor), not just any node.

**Exercise 2: Tree Traversal (Exercise 3 in exam)**
- Q9: Given a tree, produce different traversals and reconstruct from traversal

### 2021 Exam -- Bloom Filters

**Novel structure**: Bloom filter (probabilistic set membership)
- Uses BitSet + multiple hash functions
- `add()`: set k bits using k hash functions
- `contains()`: check if all k bits are set
- False positives possible, false negatives impossible

### 2022 Exam -- Segment Trees & Interval Sums

**IntervalSum**: prefix sum array for O(1) range queries, O(n) update
**SegmentTree**: balanced binary tree for O(log n) range queries AND O(log n) update

Key methods:
- `rsq(from, to)` -- range sum query
- `rMinQ(from, to)` -- range minimum query
- `update(i, value)` -- point update

### 2023-2025 Exams

Available as PDF, continuing patterns of BST operations, TAD formalism, and complexity analysis.

## Practice Problems

### Problem 1: BST Insertion Trace

Insert the following values into an empty BST: 15, 8, 23, 4, 12, 18, 30, 6

```
Solution:
           [15]
          /    \
        [8]    [23]
        / \    /  \
      [4] [12][18][30]
        \
        [6]
```

### Problem 2: BST Deletion

Delete 15 from the tree above (root has 2 children):
1. Find max in left subtree: 12
2. Replace 15 with 12
3. Delete old 12 node (has no children)

```
           [12]
          /    \
        [8]    [23]
        /      /  \
      [4]   [18] [30]
        \
        [6]
```

### Problem 3: Heap Operations

Given min-heap array: [2, 5, 3, 8, 7, 6, 4]

Draw the tree:
```
           [2]
          /   \
        [5]   [3]
        / \   / \
      [8] [7][6] [4]
```

After `poll()` (remove 2):
1. Replace root with last: [4, 5, 3, 8, 7, 6]
2. ShiftDown 4: compare with min(5,3)=3, swap
3. [3, 5, 4, 8, 7, 6]: compare 4 with min(6)=6, 4 < 6, done

```
           [3]
          /   \
        [5]   [4]
        / \   /
      [8] [7][6]
```

After `add(1)`:
1. Place at end: [3, 5, 4, 8, 7, 6, 1]
2. ShiftUp 1: parent(6)=2, heap[2]=4 > 1, swap
3. [3, 5, 1, 8, 7, 6, 4]: parent(2)=0, heap[0]=3 > 1, swap
4. [1, 5, 3, 8, 7, 6, 4]

### Problem 4: Dijkstra Trace

```
Graph:
  A --2--> B --3--> D
  |        |
  5        1
  |        |
  v        v
  C --4--> E

Dijkstra from A:

Step  PQ                          cost              prev
0     [(A,0)]                     {}                {}
1     [(B,2),(C,5)]               {A:0}             {A:null}
2     [(C,5),(E,3),(D,5)]         {A:0,B:2}         {A:null,B:A}
3     [(C,5),(D,5)]               {A:0,B:2,E:3}     {...,E:B}
4     [(D,5)]                     {A:0,B:2,E:3,C:5} {...,C:A}
5     []                          {...,D:5}          {...,D:B}

Shortest path A->E: A -> B -> E (cost 3)
Shortest path A->D: A -> B -> D (cost 5)
```

### Problem 5: Complexity

Prove that the `size()` method of ListeEngine is O(n):

```java
public int size() {
    int ret = 0;
    for (Object k : this) ret++;
    return ret;
}
```

**Proof**: The for-each loop calls `iterator()`, then `hasNext()`/`next()` for each element. With n elements in the list:
- `hasNext()` is O(1) (checks estSorti)
- `next()` is O(1) (valec + succ)
- Loop executes n times
- Total: n * O(1) = O(n)

### Problem 6: TAD Boolean

Define TAD Boolean:
```
SORTE Boolean
UTILISE
FONCTIONS
    vrai : -> Boolean
    faux : -> Boolean
    non  : Boolean -> Boolean
    et   : Boolean x Boolean -> Boolean
    ou   : Boolean x Boolean -> Boolean
AXIOMES
    non(vrai) = faux
    non(faux) = vrai
    et(vrai, vrai) = vrai
    et(vrai, faux) = faux
    et(faux, vrai) = faux
    et(faux, faux) = faux
    ou(vrai, vrai) = vrai
    ou(vrai, faux) = vrai
    ou(faux, vrai) = vrai
    ou(faux, faux) = faux
```

Prove De Morgan: non(et(x,y)) = ou(non(x), non(y))
Method: enumerate all 4 cases (x,y) in {vrai,faux}^2.

## Revision Checklist

- [ ] Can draw BST after sequence of insertions
- [ ] Can delete from BST (0, 1, and 2 children cases)
- [ ] Can write TAD specifications with axioms
- [ ] Can prove theorems from axioms by case analysis
- [ ] Can trace Dijkstra step by step
- [ ] Can trace heap add/poll with shiftUp/shiftDown
- [ ] Can compute complexity of given code
- [ ] Can prove O/Theta using definition (find c, n0)
- [ ] Can implement linked list operations on paper
- [ ] Can design hash functions and analyze collisions
- [ ] Know the complexity of all major data structures (see guide/README.md table)
