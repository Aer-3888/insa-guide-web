---
title: "TP4 - List Algorithms and Partitions"
sidebar_position: 4
---

# TP4 - List Algorithms and Partitions

## Overview

Advanced list algorithms including:
- Quicksort
- Bubble sort with fixed points
- List generation and manipulation
- Integer partitions

## Exercises

### 1. Quicksort (`split`, `qs`)
Implement the quicksort algorithm:
- `split v l`: Partition list around pivot value `v`
- `qs l`: Recursively sort the list

**Concepts**: Divide and conquer, list partitioning

### 2. Kth Element (`kieme`)
Extract the kth element from a list.

**Concepts**: List indexing, pattern matching

### 3. Fixed Point (`jqastable`)
Find the fixed point of a function through repeated application.

**Concepts**: Higher-order functions, convergence

### 4. Bubble Sort (`unebulle`, `tribulle`)
- `unebulle`: Perform one bubble pass
- `tribulle`: Repeat until sorted (fixed point)

**Concepts**: Iterative sorting, fixed points

### 5. List Utilities
- `merge`: Flatten a list of lists
- `create f k`: Create list by applying function
- `insert j ll`: Insert element at head of each sublist

**Concepts**: List transformations, map operations

### 6. Integer Partitions (`partition`)
Generate all partitions of an integer n.

**Concepts**: Combinatorics, recursive generation

## Key Algorithms

### Quicksort
```ocaml
let rec split v l = match l with
  | [] -> ([], [])
  | e :: l' ->
      if e < v then (e :: fst(split v l'), snd(split v l'))
      else (fst(split v l'), e :: snd(split v l'))

let rec qs l = match l with
  | [] | [_] -> l
  | e :: l' -> qs (fst(split e l')) @ (e :: qs (snd(split e l')))
```

### Fixed Point Iteration
```ocaml
let rec jqastable x f =
  if f x = x then x else jqastable (f x) f
```

### Integer Partitions
Generates all ways to write n as a sum of positive integers.

Example: `partition 5` generates:
- [5], [4;1], [3;2], [3;1;1], [2;2;1], [2;1;1;1], [1;1;1;1;1]

## Running the Code

```bash
ocaml
# #use "tp4.ml";;
```

## Expected Results

- `qs [4; 12; 27; -12; 7; 8; 1; 3; 6; 12; 42]` → [-12; 1; 3; 4; 6; 7; 8; 12; 12; 27; 42]
- `kieme 7 [4; 12; 27; -12; 7; 1; 8; 3; 6; 12; 42]` → 8
- `partition 5` → 7 different partitions
