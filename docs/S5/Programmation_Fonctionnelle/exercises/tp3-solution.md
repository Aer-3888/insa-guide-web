---
title: "TP3 - Card Game with Types and Graphics"
sidebar_position: 3
---

# TP3 - Card Game with Types and Graphics

> Following teacher instructions from: `data/moodle/tp/tp3/README.md`

---

## Type Definitions

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = {h : haut; c : coul}
```

---

## Exercise 1

### Define card types and accessor functions

**Answer:**
```ocaml
(* Accessor: get the suit of a card *)
let coul c = c.c

(* Accessor: get the height of a card *)
let haut c = c.h
```

**utop test:**
```
# let c = {h = As; c = Coeur};;
val c : carte = {h = As; c = Coeur}
# coul c;;
- : coul = Coeur
# haut c;;
- : haut = As
```

---

## Exercise 2

### Conversion functions: `haut_of_int`, `coul_of_string`, `carte` constructor, `string_of_carte`

**Answer:**
```ocaml
(* Convert integer to card height *)
let haut_of_int i = match i with
  | 7 -> Sept
  | 8 -> Huit
  | 9 -> Neuf
  | 10 -> Dix
  | 11 -> Valet
  | 12 -> Dame
  | 13 -> Roi
  | 14 -> As
  | _ -> failwith "Invalid card height"

(* Convert string to card suit *)
let coul_of_string s = match s with
  | "Coeur" -> Coeur
  | "Trefle" -> Trefle
  | "Carreau" -> Carreau
  | "Pique" -> Pique
  | _ -> failwith "Invalid card suit"

(* Create a card from integer height and string suit *)
let carte i s = {c = coul_of_string s; h = haut_of_int i}

(* Convert card height to string *)
let string_of_haut h = match h with
  | Sept -> "Sept"
  | Huit -> "Huit"
  | Neuf -> "Neuf"
  | Dix -> "Dix"
  | Valet -> "Valet"
  | Dame -> "Dame"
  | Roi -> "Roi"
  | As -> "As"

(* Convert card suit to string *)
let string_of_coul c = match c with
  | Coeur -> "Coeur"
  | Trefle -> "Trefle"
  | Carreau -> "Carreau"
  | Pique -> "Pique"

(* Pretty-print a card *)
let string_of_carte c = (string_of_haut c.h) ^ " de " ^ (string_of_coul c.c)
```

**utop test:**
```
# haut_of_int 12;;
- : haut = Dame
# coul_of_string "Pique";;
- : coul = Pique
# carte 8 "Trefle";;
- : carte = {h = Huit; c = Trefle}
# (haut (carte 8 "Trefle")) = Huit;;
- : bool = true
# (coul (carte 14 "Trefle")) = Trefle;;
- : bool = true
# string_of_carte (carte 11 "Pique");;
- : string = "Valet de Pique"
# string_of_carte (carte 9 "Trefle");;
- : string = "Neuf de Trefle"
```

---

## Exercise 3

### Random card generation without duplicates

**Answer:**
```ocaml
(* Convert integer to suit *)
let coul_of_int a = match a with
  | 0 -> Coeur
  | 1 -> Trefle
  | 2 -> Carreau
  | 3 -> Pique
  | _ -> failwith "Invalid suit number"

(* Generate a random card *)
let random_carte () =
  {c = coul_of_int (Random.int 4);
   h = haut_of_int ((Random.int 8) + 7)}

(* Check if a card exists in a list *)
let rec exist c l = match l with
  | [] -> false
  | x :: l' -> if c = x then true else exist c l'

(* Add a new unique random card to the list *)
let rec ajtcarte l =
  let c = random_carte () in
  if not (exist c l) then c :: l else ajtcarte l

(* Create a game with n unique cards, each as a single-card pile *)
let rec faitjeu n =
  if n = 0 then [] else ajtcarte (faitjeu (n - 1))
```

**utop test:**
```
# random_carte ();;
- : carte = {h = Neuf; c = Carreau}
# exist {h=As; c=Coeur} [{h=Roi; c=Pique}; {h=As; c=Coeur}];;
- : bool = true
# exist {h=Dame; c=Trefle} [{h=Roi; c=Pique}];;
- : bool = false
# let l1 = ajtcarte [] in
  let l2 = ajtcarte l1 in
  List.length l1, List.length l2;;
- : int * int = (1, 2)
```

---

## Exercise 4

### Solitaire game logic: reduction rules

Rules: examine piles 3 by 3 (A, B, C). If the top card of A and top card of C have the same suit or same height, pile B is placed on top of A (B @ A), and the 3 piles become 2.

**Answer:**
```ocaml
(* One reduction step on the list of card piles *)
let rec reduc l = match l with
  | (e1 :: l1') :: l2 :: (e3 :: l3') :: l' ->
      if e1.c = e3.c || e1.h = e3.h then
        (l2 @ (e1 :: l1')) :: (e3 :: l3') :: l'
      else
        (e1 :: l1') :: (reduc (l2 :: (e3 :: l3') :: l'))
  | _ -> l

(* Apply reductions until no more are possible (fixed point) *)
let rec reussite l =
  let l' = reduc l in
  if l = l' then l else reussite l'
```

**utop test:**
```
# let p1 = [carte 14 "Trefle";  carte 10 "Coeur"];;
# let p2 = [carte 7 "Pique";    carte 11 "Carreau"];;
# let p3 = [carte 14 "Carreau"; carte 8 "Pique"];;
# let p4 = [carte 7 "Carreau";  carte 10 "Trefle"];;
# let p'1 = p2 @ p1;;
# reduc [p1; p2; p3; p4] = [p'1; p3; p4];;
- : bool = true
# let p''1 = p3 @ p'1;;
# reussite [p1; p2; p3; p4] = [p''1; p4];;
- : bool = true
```

---

## Exercise 5 (Optional)

### Display cards using the Graphics module

Requires the Graphics library:
```ocaml
#load "graphics.cma";;
open Graphics;;
open_graph "";;
```

This exercise involves drawing card sprites and implementing an interactive game display. See the original TP source for complete graphics code.
