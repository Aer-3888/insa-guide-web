---
title: "TP5 - List Operations"
sidebar_position: 5
---

# TP5 - List Operations

## Overview

Fundamental list manipulation functions in OCaml:
- Basic operations (length, membership, indexing)
- List transformations
- Sublist operations
- Pattern searching and replacement

## Exercises

### 1. Basic Operations
- `longueur l`: List length
- `appartient e l`: Check membership
- `rang e l`: Find index (0 if not found)
- `rang_opt e l`: Find index as option type

**Concepts**: Recursion, option types

### 2. List Concatenation
- `concatl l1 l2`: Append two lists

**Concepts**: Structural recursion on lists

### 3. List Slicing
- `debliste l n`: First n elements
- `finliste l n`: Last n elements

**Concepts**: List traversal

### 4. Element Replacement
- `remplace x y l`: Replace all x with y

**Concepts**: List transformation

### 5. Sublist Operations
- `entete l l1`: Check if l is prefix of l1
- `sousliste l l1`: Check if l is sublist of l1
- `oter l l1`: Remove prefix l from l1

**Concepts**: Pattern matching, prefix checking

### 6. Advanced Replacement
- `remplacel l1 l2 l`: Replace all occurrences of sublist l1 with l2
- `supprimel l1 l`: Remove all occurrences of sublist l1

**Concepts**: Sublist search and replace

## Key OCaml Concepts

### Option Type
```ocaml
type 'a option = None | Some of 'a

let rec rang_opt e l = match l with
  | [] -> None
  | e1 :: tl ->
      if e1 = e then Some 1
      else match rang_opt e tl with
        | None -> None
        | Some c -> Some (c + 1)
```

### Prefix Checking
```ocaml
let rec entete l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 then entete t1 t2 else false
```

### Sublist Search
```ocaml
let rec sousliste l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 && entete t1 t2 then true
      else sousliste l t2
```

## Running the Code

```bash
ocaml
# #use "tp5.ml";;
```

## Expected Results

- `longueur [1;2;3]` → 3
- `rang_opt 2 [3;2;1]` → Some 2
- `remplacel [1;2;1] [5;6] [4;1;2;1;2;1;3;8]` → [4;5;6;2;5;6;3;8]
