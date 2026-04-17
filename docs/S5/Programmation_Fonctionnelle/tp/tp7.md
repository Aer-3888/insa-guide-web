---
title: "TP7 - N-ary Trees"
sidebar_position: 7
---

# TP7 - N-ary Trees

## Overview

N-ary tree data structures (trees where each node can have any number of children):
- Tree construction and accessors
- Tree traversals
- Path enumeration
- Tree equality and replacement

## Data Type

```ocaml
type 'a narbr = 
  | Feuille of 'a 
  | Noeud of 'a * 'a narbr list
```

## Exercises

### 1. Tree Construction
- `feuille v`: Create a leaf
- `noeud v l`: Create a node with value and list of children
- `valeur a`: Get node value
- `sous_arbres a`: Get list of children

**Concepts**: N-ary tree structure, polymorphic types

### 2. Node Counting (`compter`)
Count total nodes in the tree.

**Concepts**: Mutual recursion for tree and list traversal

### 3. Longest Path (`pluslongue`)
Find the length of the longest path from root to leaf.

**Concepts**: Tree height, maximum computation

### 4. Node Enumeration (`listsa`)
List all nodes (subtrees) in the tree.

**Concepts**: Collecting all subtrees

### 5. Branch Enumeration (`listbr`)
List all root-to-leaf paths as lists.

**Concepts**: Path generation, list accumulation

### 6. Tree Equality (`egal`)
Check if two trees are structurally equal.

**Concepts**: Structural equality, mutual recursion

### 7. Subtree Replacement (`remplace`)
Replace all occurrences of one subtree with another.

**Concepts**: Tree transformation, List.map

## Key Algorithms

### Mutual Recursion
```ocaml
let rec compter a =
  let rec compteur a acc = match a with
    | Feuille c -> 1 + acc
    | Noeud (c, d) -> listeur d acc
  and listeur l acc = match l with
    | [] -> acc
    | e1 :: tl -> compter e1 + listeur tl acc
  in
  compteur a 0
```

### Path Generation
```ocaml noexec
let rec ajout n l = match l with
  | [] -> []
  | x :: reste -> [n :: x] @ (ajout n reste)

let rec listbr a = match a with
  | Feuille f -> [[f]]
  | Noeud (v, j) -> ajout v (listeu j)
```

### Tree Equality
```ocaml noexec
let rec egal a b = match (a, b) with
  | Feuille f, Feuille slim -> f = slim
  | Noeud (n, d), Noeud (v, w) ->
      if v = n then egalb d w else false
  | _ -> false
```

## Running the Code

```bash
ocaml
# #use "tp7.ml";;
```

## Expected Results

For a test tree with nodes 5 at root, children 3 and 21:
- `compter` → total node count
- `pluslongue` → longest root-to-leaf distance
- `listbr` → all paths as nested lists
