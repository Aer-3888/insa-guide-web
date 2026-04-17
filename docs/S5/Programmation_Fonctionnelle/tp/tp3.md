---
title: "TP3 - Card Game with Types and Graphics"
sidebar_position: 3
---

# TP3 - Card Game with Types and Graphics

## Overview

Implementation of a solitaire card game using:
- Custom algebraic data types
- Pattern matching
- List operations
- Graphics library

## Data Types

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = {h : haut; c : coul}
```

## Exercises

### 1. Type Constructors
Define card types and accessor functions.

**Concepts**: Variant types, record types

### 2. Conversion Functions
- `haut_of_int`: Convert integer to card height
- `coul_of_string`: Convert string to card suit
- `string_of_carte`: Pretty-print cards

**Concepts**: Pattern matching on integers and strings

### 3. Random Card Generation
Generate random cards without duplicates.

**Concepts**: Random module, list membership testing

### 4. Game Logic
Implement solitaire reduction rules:
- Cards can be folded if they match suit or height
- Middle pile gets merged with outer piles

**Concepts**: Complex pattern matching on lists

### 5. Graphics (Optional)
Display cards using the Graphics module.

**Concepts**: 2D graphics, drawing sprites

## Game Rules

The solitaire works with piles of cards:
1. If pile A and pile C have matching top cards (same suit or height)
2. Then pile B is placed on top of pile A
3. The process repeats until no more reductions are possible

## Key OCaml Concepts

### Variant Types
```ocaml
type coul = Coeur | Trefle | Pique | Carreau
```

### Records
```ocaml
type carte = {h : haut; c : coul}
let c = {h = As; c = Coeur}
```

### Complex Pattern Matching
```ocaml
let rec reduc l = match l with
  | (e1::l1')::(l2)::(e3::l3')::l' ->
      if e1.c = e3.c || e1.h = e3.h then ...
  | _ -> l
```

## Running the Code

```bash
ocaml
# #use "tp3.ml";;
```

For graphics:
```bash
# #load "graphics.cma";;
# open Graphics;;
# open_graph "";;
```
