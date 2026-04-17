---
title: "TP6 - Binary Trees"
sidebar_position: 6
---

# TP6 - Binary Trees

## Overview

Binary tree data structures and operations:
- Tree definition and construction
- Tree traversals
- Binary search trees
- Tree positioning for graphical display

## Data Type

```ocaml
type 'a arbin = 
  | Feuille of 'a 
  | Noeud of 'a arbin * 'a * 'a arbin
```

## Exercises

### 1. Tree Construction
- `feuille v`: Create a leaf node
- `noeud v g d`: Create a node with left and right children

**Concepts**: Algebraic data types, tree constructors

### 2. Tree Counting (`compter`)
Count the number of nodes in a tree.

**Concepts**: Structural recursion on trees

### 3. Tree to List (`to_list`)
Convert tree to list using inorder traversal.

**Concepts**: Tree traversal (left-root-right)

### 4. Binary Search Tree (`ajoutArbre`, `constr`)
- Insert elements maintaining BST property
- Construct BST from list

**Concepts**: Binary search tree invariants

### 5. Tree Positioning (`placer`)
Assign (x, y) coordinates to each node for graphical display.

**Concepts**: Tree layout algorithms, accumulator pattern

## Key Algorithms

### Inorder Traversal
```ocaml
let rec to_list a = match a with
  | Feuille b -> [b]
  | Noeud (g, c, d) -> to_list g @ [c] @ to_list d
```

### BST Insertion
```ocaml
let rec ajoutArbre e a = match a with
  | Noeud (g, c, d) ->
      if e < c then Noeud (ajoutArbre e g, c, d)
      else Noeud (g, c, ajoutArbre e d)
  | Feuille _ -> Noeud (Feuille "Nil", e, Feuille "Nil")
```

### Tree Positioning
Computes (x, y) coordinates for each node:
- Inorder traversal determines x-coordinates
- Depth determines y-coordinates

## Running the Code

```bash
ocaml
# #use "tp6.ml";;
```

## Expected Results

For tree: `noeud 12 (feuille 5) (noeud 7 (feuille 6) (feuille 8))`
- `compter` → 3 (leaf nodes)
- `to_list` → [5; 12; 6; 7; 8]
