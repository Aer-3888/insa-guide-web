---
title: "TP5 - List Operations"
sidebar_position: 5
---

# TP5 - List Operations

> Following teacher instructions from: `data/moodle/tp/tp5/README.md`

---

## Exercise 1

### Basic operations: `longueur`, `appartient`, `rang`, `rang_opt`

**Answer:**
```ocaml
(* List length *)
let rec longueur l = match l with
  | [] -> 0
  | e :: r -> 1 + longueur r

(* Check membership *)
let rec appartient e l = match l with
  | [] -> false
  | e1 :: tl -> if e1 = e then true else appartient e tl

(* Find index, returns 0 if not found *)
let rec rang e l = match l with
  | [] -> 0
  | e1 :: tl ->
      if e1 = e then 1
      else if rang e tl = 0 then 0
      else 1 + rang e tl

(* Option type for safe indexing *)
type 'a option = None | Some of 'a

(* Find index as option type *)
let rec rang_opt e l = match l with
  | [] -> None
  | e1 :: tl ->
      if e1 = e then Some 1
      else match rang_opt e tl with
        | None -> None
        | Some c -> Some (c + 1)
```

**utop test:**
```
# longueur [1; 2; 3];;
- : int = 3
# longueur [];;
- : int = 0
# appartient 4 [1; 2; 3];;
- : bool = false
# appartient 2 [1; 2; 3];;
- : bool = true
# rang 2 [3; 2; 1];;
- : int = 2
# rang 5 [3; 2; 1];;
- : int = 0
# rang_opt 2 [3; 2; 1];;
- : int option = Some 2
# rang_opt 0 [3; 2; 1];;
- : int option = None
```

---

## Exercise 2

### List concatenation (`concatl`)

**Answer:**
```ocaml
let rec concatl l1 l2 = match l1, l2 with
  | [], l2 -> l2
  | l1, [] -> l1
  | e1 :: tl, l2 -> e1 :: (concatl tl l2)
```

**utop test:**
```
# concatl [1; 2; 3] [4; 5; 6];;
- : int list = [1; 2; 3; 4; 5; 6]
# concatl [] [1; 2];;
- : int list = [1; 2]
# concatl [1; 2] [];;
- : int list = [1; 2]
```

---

## Exercise 3

### List slicing: `debliste` (first n elements) and `finliste` (last n elements)

**Answer:**
```ocaml
(* First n elements *)
let rec debliste l n = match l, n with
  | [], _ -> l
  | _, 0 -> []
  | e1 :: tl, n -> e1 :: debliste tl (n - 1)

(* Last n elements *)
let rec finliste l n = match l with
  | [] -> []
  | e :: tl ->
      if n >= longueur l then l
      else finliste tl n
```

**utop test:**
```
# debliste [1; 2; 3; 4; 5; 6; 7] 3;;
- : int list = [1; 2; 3]
# finliste [1; 2; 3; 4; 5; 6; 7] 3;;
- : int list = [5; 6; 7]
# debliste [1; 2] 5;;
- : int list = [1; 2]
# finliste [] 3;;
- : int list = []
```

---

## Exercise 4

### Replace all occurrences of `x` with `y` in a list (`remplace`)

**Answer:**
```ocaml
let rec remplace x y l = match l with
  | [] -> []
  | e1 :: tl ->
      if e1 = x then y :: (remplace x y tl)
      else e1 :: (remplace x y tl)
```

**utop test:**
```
# remplace 2 42 [1; 2; 3; 2; 5];;
- : int list = [1; 42; 3; 42; 5]
# remplace "a" "z" ["a"; "b"; "a"];;
- : string list = ["z"; "b"; "z"]
```

---

## Exercise 5

### Sublist operations: `entete`, `sousliste`, `oter`

**Answer:**
```ocaml
(* Check if l is a prefix of l1 *)
let rec entete l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 then entete t1 t2 else false

(* Check if l appears as a contiguous sublist in l1 *)
let rec sousliste l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 then
        if entete t1 t2 then true
        else sousliste l t2
      else sousliste l t2

(* Remove prefix l from l1 if l is a prefix *)
let oter l l1 =
  if entete l l1 then
    let rec hotter la lb = match la, lb with
      | [], lb -> lb
      | e1 :: t1, e2 :: t2 -> hotter t1 t2
      | _ -> failwith "Impossible case"
    in
    hotter l l1
  else l1
```

**utop test:**
```
# entete [1; 2; 3] [1; 2; 3; 2; 5];;
- : bool = true
# entete [1; 2; 4] [1; 2; 3; 2; 5];;
- : bool = false
# sousliste [2; 3; 2] [2; 1; 2; 3; 2; 5];;
- : bool = true
# sousliste [1; 2; 1] [1; 1; 2; 1; 4; 5; 6];;
- : bool = true
# oter [1; 2; 3] [1; 2; 3; 2; 5];;
- : int list = [2; 5]
# oter [1; 2; 4] [1; 2; 3; 2; 5];;
- : int list = [1; 2; 3; 2; 5]
```

---

## Exercise 6

### Advanced replacement: `remplacel` and `supprimel`

`remplacel l1 l2 l` replaces all occurrences of sublist `l1` with `l2` in `l`.
`supprimel l1 l` removes all occurrences of sublist `l1` from `l`.

**Answer:**
```ocaml
(* Replace all occurrences of sublist l1 with l2 in l *)
let rec remplacel l1 l2 l = match l with
  | [] -> []
  | e2 :: t2 ->
      if entete l1 l then
        concatl l2 (remplacel l1 l2 (oter l1 l))
      else e2 :: remplacel l1 l2 t2

(* Remove all occurrences of sublist l1 from l *)
let supprimel l1 l = match l1 with
  | [] -> l
  | _ -> remplacel l1 [] l
```

**utop test:**
```
# remplacel [1; 2; 1] [5; 6] [4; 1; 2; 1; 2; 1; 2; 1; 3; 8];;
- : int list = [4; 5; 6; 2; 5; 6; 2; 5; 6; 3; 8]
# supprimel [1; 2; 1] [4; 1; 2; 1; 2; 1; 3; 8];;
- : int list = [4; 2; 1; 3; 8]
# supprimel [] [1; 2; 3];;
- : int list = [1; 2; 3]
```
