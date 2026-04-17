---
title: "TP8 - Card Game (Graphics Variant)"
sidebar_position: 8
---

# TP8 - Card Game (Graphics Variant)

> Following teacher instructions from: `data/moodle/tp/tp8/README.md`

Similar to TP3 but with tuple variant `Carte of haut * coul` instead of record `{h: haut; c: coul}`.

---

## Type Definitions

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = Carte of haut * coul    (* tuple variant instead of record *)
```

---

## Exercise 1

### Card construction with tuple variants

Accessors use `let Carte (_, col) = c in col` instead of `c.c`.

**Answer:**
```ocaml
(* Extract suit from card *)
let coul c = let Carte (_, col) = c in col

(* Extract height from card *)
let haut c = let Carte (h, _) = c in h
```

**utop test:**
```
# coul (Carte (As, Coeur));;
- : coul = Coeur
# haut (Carte (Valet, Pique));;
- : haut = Valet
```

---

## Exercise 2

### Conversion functions and card constructor

**Answer:**
```ocaml
(* Convert integer to card height *)
let haut_of_int i = match i with
  | 7 -> Sept | 8 -> Huit | 9 -> Neuf | 10 -> Dix
  | 11 -> Valet | 12 -> Dame | 13 -> Roi | 14 -> As
  | _ -> failwith "Invalid card height"

(* Convert string to card suit *)
let coul_of_string s = match s with
  | "Coeur" -> Coeur | "Trefle" -> Trefle
  | "Pique" -> Pique | "Carreau" -> Carreau
  | _ -> failwith "Invalid card suit"

(* Create a card using Carte constructor *)
let carte i s = Carte (haut_of_int i, coul_of_string s)
```

**utop test:**
```
# carte 8 "Trefle";;
- : carte = Carte (Huit, Trefle)
# haut (carte 8 "Trefle") = Huit;;
- : bool = true
# coul (carte 14 "Trefle") = Trefle;;
- : bool = true
```

---

## Exercise 3

### Solitaire game logic with pattern matching on card tuples

`string_of_carte` matches directly on `Carte (h, col)`. Random generation uses `List.mem` instead of hand-written `exist`.

**Answer:**
```ocaml
(* Pretty-print a card using pattern matching on Carte *)
let string_of_carte c = match c with
  | Carte (h, col) ->
      let hstring = match h with
        | Sept -> "Sept" | Huit -> "Huit" | Neuf -> "Neuf" | Dix -> "Dix"
        | Valet -> "Valet" | Dame -> "Dame" | Roi -> "Roi" | As -> "As"
      and cstring = match col with
        | Coeur -> "Coeur" | Pique -> "Pique"
        | Trefle -> "Trefle" | Carreau -> "Carreau"
      in
      hstring ^ " de " ^ cstring

(* Generate a random card *)
let random_carte () =
  Carte (
    haut_of_int ((Random.int 8) + 7),
    match Random.int 4 with
    | 0 -> Coeur | 1 -> Trefle | 2 -> Carreau | 3 -> Pique
    | _ -> failwith "Invalid random suit"
  )

(* Add a unique random card using List.mem *)
let rec ajtcarte l =
  if List.length l = 32 then l
  else
    let rouxscard = random_carte () in
    if List.mem rouxscard l then ajtcarte l
    else rouxscard :: l

(* Create a deck with n cards *)
let rec faitjeu n =
  if n > 32 then failwith "Maximum 32 cards"
  else if n < 0 then failwith "Negative card count"
  else if n = 0 then []
  else ajtcarte (faitjeu (n - 1))
```

**utop test:**
```
# string_of_carte (carte 11 "Pique");;
- : string = "Valet de Pique"
# string_of_carte (carte 9 "Trefle");;
- : string = "Neuf de Trefle"
# let l1 = ajtcarte [];;
# let l2 = ajtcarte l1;;
# List.length l1, List.length l2;;
- : int * int = (1, 2)
```

---

## Exercise 4

### Reduction with deep pattern matching on Carte constructor

The pattern matches directly into `Carte (ah, ac)` instead of extracting via record fields.

**Answer:**
```ocaml
(* One reduction step: pattern matches Carte (ah, ac) directly *)
let rec reduc l = match l with
  | (Carte (ah, ac) :: abody) :: bbody :: (Carte (ch, cc) :: cbody) :: rest_of_set ->
      if ah = ch || ac = cc then
        (bbody @ (Carte (ah, ac) :: abody)) ::
        (reduc ((Carte (ch, cc) :: cbody) :: rest_of_set))
      else
        (Carte (ah, ac) :: abody) ::
        (reduc (bbody :: (Carte (ch, cc) :: cbody) :: rest_of_set))
  | x -> x

(* Apply reductions until stable (compare by list length) *)
let rec reussite l =
  let newl = reduc l in
  if List.length newl = List.length l then newl
  else reussite newl
```

**utop test:**
```
# let p1 = [carte 14 "Trefle"; carte 10 "Coeur"];;
# let p2 = [carte 7 "Pique"; carte 11 "Carreau"];;
# let p3 = [carte 14 "Carreau"; carte 8 "Pique"];;
# let p4 = [carte 7 "Carreau"; carte 10 "Trefle"];;
# reduc [p1; p2; p3; p4] = [p2 @ p1; p3; p4];;
- : bool = true
# let p'1 = p2 @ p1;;
# let p''1 = p3 @ p'1;;
# reussite [p1; p2; p3; p4] = [p''1; p4];;
- : bool = true
```

---

## Graphics Display (Optional)

Requires the Graphics library:
```ocaml
#use "topfind";;
#require "graphics";;
open Graphics;;
```

Key graphics functions:
- `draw_carte`: draws a single card at current position
- `draw_pile`: draws a vertical pile of cards
- `draw_jeu`: draws all piles horizontally
- `draw_reussite`: interactive game loop (press 'q' to quit)
