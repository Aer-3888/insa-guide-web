---
title: "TP7 - N-ary Trees"
sidebar_position: 7
---

# TP7 - N-ary Trees

> Following teacher instructions from: `data/moodle/tp/tp7/README.md`

---

## Type Definition

```ocaml
type 'a narbr =
  | Feuille of 'a
  | Noeud of 'a * 'a narbr list
```

---

## Exercise 1

### Tree construction and accessors: `feuille`, `noeud`, `valeur`, `sous_arbres`

**Answer:**
```ocaml
(* Create a leaf *)
let feuille v = Feuille v

(* Create a node with value and list of children *)
let noeud (v : 'a) (l : 'a narbr list) = Noeud (v, l)

(* Get the value at the root *)
let valeur a = match a with
  | Feuille d -> d
  | Noeud (c, d) -> c

(* Get the list of children *)
let sous_arbres a = match a with
  | Noeud (f, v) -> v
  | Feuille k -> []
```

**utop test:**
```
# let a1 = feuille 4;;
# let a2 = noeud 3 [a1; a1];;
# valeur a1 = 4;;
- : bool = true
# valeur a2 = 3;;
- : bool = true
# sous_arbres a1 = [];;
- : bool = true
# sous_arbres a2 = [a1; a1];;
- : bool = true
```

---

## Exercise 2

### Count total nodes in the tree (`compter`)

Uses mutual recursion: `compteur` handles a single node, `listeur` handles a list of children.

**Answer:**
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

**utop test:**
```
# compter a2;;
- : int = 2
# compter (feuille 42);;
- : int = 1
# let a3 = noeud 8 [a1; a2; a1];;
# compter a3;;
- : int = 4
```

---

## Exercise 3

### Find the length of the longest path from root to leaf (`pluslongue`)

Uses mutual recursion with `max` to find the deepest branch.

**Answer:**
```ocaml
let rec pluslongue a =
  let rec arb a acc = match a with
    | Feuille f -> 1 + acc
    | Noeud (f, n) -> 1 + lis n acc
  and lis c acc = match c with
    | [] -> acc
    | e1 :: tl -> max (arb e1 acc) (lis tl acc)
  in
  arb a 0
```

**utop test:**
```
# pluslongue a3;;
- : int = 3
# pluslongue (feuille 42);;
- : int = 1
# pluslongue a2;;
- : int = 2
```

---

## Exercise 4

### List all subtrees in the tree (`listsa`)

Collects all subtrees (including the root itself) using mutual recursion.

**Answer:**
```ocaml
let listsa a =
  let rec ads a = match a with
    | Feuille f -> [a]
    | Noeud (v, j) -> a :: (concat j)
  and concat e = match e with
    | [] -> []
    | e1 :: tl -> (ads e1) @ (concat tl)
  in
  ads a
```

**utop test:**
```
# let f4 = feuille 4;;
# let f10 = feuille 10;;
# let f12 = feuille 12;;
# let f13 = feuille 13;;
# let f20 = feuille 20;;
# let f21 = feuille 21;;
# let n7 = noeud 7 [f10; f12; f13];;
# let n3 = noeud 3 [f4; n7; f20];;
# let n5 = noeud 5 [n3; f21];;
# List.sort compare (listsa n5) =
  List.sort compare [f4; f10; f12; f13; f20; f21; n7; n3; n5];;
- : bool = true
```

---

## Exercise 5

### List all root-to-leaf paths (`listbr`)

`ajout n l` prepends value `n` to each list in `l`. `listbr` generates all paths from root to leaves.

**Answer:**
```ocaml
(* Prepend n to each list in l *)
let rec ajout n l = match l with
  | [] -> []
  | x :: reste -> [n :: x] @ (ajout n reste)

(* All root-to-leaf paths *)
let listbr a =
  let rec arb a = match a with
    | Feuille f -> [[f]]
    | Noeud (v, j) -> ajout v (listeu j)
  and listeu l = match l with
    | [] -> []
    | e1 :: tl -> (arb e1) @ (listeu tl)
  in
  arb a
```

**utop test:**
```
# listbr n5;;
- : int list list =
[[5; 3; 4]; [5; 3; 7; 10]; [5; 3; 7; 12]; [5; 3; 7; 13]; [5; 3; 20]; [5; 21]]
```

---

## Exercise 6

### Check if two trees are structurally equal (`egal`)

Uses mutual recursion: `egala` compares two trees, `egalb` compares two lists of children.

**Answer:**
```ocaml
let egal a b =
  let rec egala a b = match (a, b) with
    | Feuille f, Feuille slim -> if f = slim then true else false
    | Feuille f, Noeud (n, d) -> false
    | Noeud (n, d), Feuille slim -> false
    | Noeud (n, d), Noeud (v, w) ->
        if v = n then egalb d w else false
  and egalb d w = match (d, w) with
    | [], [] -> true
    | [], _ -> false
    | _, [] -> false
    | e1 :: t1, e2 :: t2 ->
        if egala e1 e2 then egalb t1 t2 else false
  in
  egala a b
```

**utop test:**
```
# egal n5 n5;;
- : bool = true
# egal n5 n3;;
- : bool = false
# egal (feuille 4) (feuille 4);;
- : bool = true
# egal (feuille 4) (feuille 5);;
- : bool = false
```

---

## Exercise 7

### Replace all occurrences of one subtree with another (`remplace`)

Uses `egal` to find matches and `List.map` with partial application to recursively replace in children.

**Answer:**
```ocaml
let rec remplace a1 a2 a =
  if egal a a1 then a2
  else match a with
    | Noeud (n, reste) -> Noeud (n, List.map (remplace a1 a2) reste)
    | _ -> a
```

**utop test:**
```
# let n42 = noeud 42 [feuille 2048];;
# let expected = noeud 5 [(noeud 3 [f4; n42; f20]); f21];;
# remplace n7 n42 n5 = expected;;
- : bool = true
```
