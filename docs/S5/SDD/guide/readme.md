---
title: "SDD -- Structures de Donnees (Data Structures)"
sidebar_position: 0
---

# SDD -- Structures de Donnees (Data Structures)

## Course Overview

SDD is the core data structures course at INSA Rennes (3rd year, Semester 5). It covers the design, implementation, and analysis of fundamental data structures in Java, with emphasis on abstract data types, interface/implementation separation, and algorithmic complexity.

**Language:** Java (generics, interfaces, iterators, collections framework)
**Assessment:** Written exam (DS) -- implement operations, trace algorithms, prove complexities

## Topics

| # | Topic | Guide | Key Concepts |
|---|-------|-------|--------------|
| 1 | [Linked Lists](/S5/SDD/guide/01-linked-lists) | Singly/doubly linked, sentinels, cursor pattern | O(1) insert/delete at cursor |
| 2 | [Iterators & Design Patterns](/S5/SDD/guide/02-iterators) | Iterator pattern, Java Iterator/Iterable, adapter pattern | Separation of concerns |
| 3 | [Stacks & Queues](/S5/SDD/guide/03-stacks-queues) | LIFO/FIFO, array/linked implementations | Expression evaluation, BFS |
| 4 | [Hash Tables](/S5/SDD/guide/04-hash-tables) | Hash functions, chaining, open addressing, load factor | O(1) average lookup |
| 5 | [Binary Trees](/S5/SDD/guide/05-binary-trees) | BST, AVL, rotations, traversals | O(log n) balanced operations |
| 6 | [Heaps & Priority Queues](/S5/SDD/guide/06-heaps-priority-queues) | Min/max heap, heapify, heap sort | O(log n) insert/extract-min |
| 7 | [Graphs & Dijkstra](/S5/SDD/guide/07-graphs-dijkstra) | Adjacency list/matrix, BFS, DFS, Dijkstra | Shortest paths |
| 8 | [Quadtrees](/S5/SDD/guide/08-quadtrees) | Spatial data structures, region quadtrees, pruning | Image compression |
| 9 | [Complexity Analysis](/S5/SDD/guide/09-complexity) | Big-O, Theta, Omega, amortized analysis | Proof techniques |

## Master Complexity Table

| Data Structure | Access | Search | Insert | Delete | Space | Notes |
|---------------|--------|--------|--------|--------|-------|-------|
| Array | O(1) | O(n) | O(n) | O(n) | O(n) | O(log n) search if sorted |
| Linked List (at cursor) | O(n) | O(n) | O(1) | O(1) | O(n) | O(1) ops at known position |
| Array-backed List | O(1) | O(n) | O(n) | O(n) | O(n) | Amortized O(1) append |
| Stack | O(n) | O(n) | O(1) | O(1) | O(n) | LIFO access only |
| Queue | O(n) | O(n) | O(1) | O(1) | O(n) | FIFO access only |
| Hash Table | -- | O(1)* | O(1)* | O(1)* | O(n) | *Average case; O(n) worst |
| BST (balanced) | O(log n) | O(log n) | O(log n) | O(log n) | O(n) | Degenerates to O(n) if unbalanced |
| AVL Tree | O(log n) | O(log n) | O(log n) | O(log n) | O(n) | Guaranteed balance |
| Min/Max Heap | O(1)** | O(n) | O(log n) | O(log n) | O(n) | **Peek only; no arbitrary access |
| Priority Queue (heap) | -- | -- | O(log n) | O(log n) | O(n) | add + poll |
| Priority Queue (sorted array) | -- | -- | O(n) | O(n) | O(n) | add uses binary search + shift; poll shifts all elements |
| Quadtree | -- | O(log n)*** | O(log n)*** | O(log n)*** | O(n) | ***For spatial queries |
| Graph (adj. list) | -- | O(V+E) | O(1) | O(E) | O(V+E) | Edge operations |
| Graph (adj. matrix) | -- | O(1) | O(1) | O(1) | O(V^2) | Space-expensive |

## Java Patterns Used in This Course

### 1. Interface / Implementation Separation
```
Liste<T>  (interface)
  |-- ListeDoubleChainee<T>  (linked implementation)
  |-- ListeTabulee<T>         (array implementation)
```

### 2. Iterator Pattern
```
Liste<T> --creates--> Iterateur<T>
  |                      |
  |-- ListeDoubleChainee |-- ListeDoubleChaineeIterateur
  |-- ListeTabulee       |-- ListeTabuleeIterateur
```

### 3. Adapter Pattern
```
Liste<T> --adapted by--> ListeEngine<T> implements java.util.List<T>
Iterateur<T> --adapted by--> IterateurEngine<T> implements java.util.Iterator<T>
```

### 4. Generics
```java
public class ListeDoubleChainee<T> implements Liste<T> { ... }
public class HeapPQ<T> implements PriorityQueue<T> { ... }
public class Dijkstra<T> { ... }
```

## How to Use This Guide

1. **Before a TP**: Read the corresponding topic guide for theory
2. **During study**: Use the cheat sheets at the end of each topic
3. **Before the exam**: Focus on the [Exam Prep](/S5/SDD/exam-prep/readme) section
4. **For practice**: Work through the [Exercise Solutions](../exercises/) with the TP source code

## Key Files to Know

| File | Role |
|------|------|
| `MyList<T>` | Original list interface (TP1) |
| `Liste<T>` / `Iterateur<T>` | Refined interfaces separating list from iterator (TP2-3) |
| `ListeEngine<T>` / `IterateurEngine<T>` | Adapters bridging custom lists to `java.util.List` (TP3) |
| `Arbre` | Binary tree interface (TP6) |
| `TreeTwo` | Binary tree implementation with postfix traversal (TP6) |
| `ExprArith` | Arithmetic expression tree evaluator (TP6) |
| `QuadTree` / `Tree` | Quadtree interface and implementation for images (TP7) |
| `PriorityQueue<T>` / `HeapPQ<T>` | Priority queue with binary heap (TP8) |
| `Graph<T>` / `IndexedGraph` | Graph interface and adjacency list implementation (TP8) |
| `Dijkstra<T>` | Shortest path algorithm (TP8) |
