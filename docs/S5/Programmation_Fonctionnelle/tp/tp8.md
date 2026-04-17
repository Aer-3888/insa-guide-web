---
title: "TP8 - Card Game (Graphics Variant)"
sidebar_position: 8
---

# TP8 - Card Game (Graphics Variant)

## Overview

Similar to TP3 but with different card type implementation and enhanced graphics display. This lab demonstrates:
- Alternative type definitions
- Graphics library usage
- Game state management
- Interactive graphics

## Data Types

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = Carte of haut * coul  (* tuple variant instead of record *)
```

## Exercises

### 1. Card Construction
Type definitions and conversion functions similar to TP3.

**Concepts**: Tuple variants vs records

### 2. Card Generation
Random card generation without duplicates using List.mem.

**Concepts**: Standard library functions

### 3. Game Logic
Solitaire reduction with pattern matching on card tuples.

**Concepts**: Nested pattern matching

### 4. Graphics Display
- `draw_carte`: Draw a single card
- `draw_pile`: Draw a pile of cards vertically
- `draw_jeu`: Draw all piles
- `draw_reussite`: Interactive game loop

**Concepts**: Graphics primitives, event loop

## Key Differences from TP3

### Type Definition
```ocaml
(* TP3 *)
type carte = {h : haut; c : coul}

(* TP8 *)
type carte = Carte of haut * coul
```

### Pattern Matching
```ocaml
(* TP3 *)
let coul c = c.c

(* TP8 *)
let coul c = let Carte (_, col) = c in col
```

### Graphics
More sophisticated graphics with:
- Sprite-based card drawing
- Interactive game loop with keyboard input
- Real-time reduction visualization

## Running the Code

```bash
# Load graphics library first
ocaml
# #use "topfind";;
# #require "graphics";;
# #use "tp8.ml";;
```

For graphics:
```bash
# draw_reussite ();;
# Press 'q' to quit
```

## Game Interaction

The `draw_reussite` function:
1. Creates a deck of 32 cards
2. Displays them as individual piles
3. Applies reduction on each keypress
4. Continues until 'q' is pressed
