---
title: "TP4 - List Algorithms and Partitions"
sidebar_position: 4
---

# TP4 - List Algorithms and Partitions

> Following teacher instructions from: `data/moodle/tp/tp4/README.md`

---

## Exercise 1

### Quicksort: `split` and `qs`

`split v l` partitions list `l` into elements less than `v` and elements greater than or equal to `v`.

`qs l` recursively sorts the list using quicksort (pivot = first element).

**Answer:**
```ocaml
(* Partition list around pivot v *)
let rec split v l = match l with
  | [] -> ([], [])
  | e :: l' ->
      if e < v then
        (e :: fst(split v l'), snd(split v l'))
      else
        (fst(split v l'), e :: snd(split v l'))

(* Quicksort *)
let rec qs l = match l with
  | [] -> []
  | [e] -> [e]
  | e :: l' ->
      (qs (fst(split e l'))) @ (e :: (qs (snd(split e l'))))
```

**utop test:**
```
# split 4 [12; 27; -12; 7; 8; 1; 3; 6; 12; 42];;
- : int list * int list = ([-12; 1; 3], [12; 27; 7; 8; 6; 12; 42])
# qs [4; 12; 27; -12; 7; 8; 1; 3; 6; 12; 42];;
- : int list = [-12; 1; 3; 4; 6; 7; 8; 12; 12; 27; 42]
# qs [];;
- : 'a list = []
# qs [3; 2; 1];;
- : int list = [1; 2; 3]
```

---

## Exercise 2

### Extract the kth element from a list (`kieme`)

1-indexed. Raises an exception if the index is out of bounds.

**Answer:**
```ocaml
let rec kieme k l = match (k, l) with
  | (1, a :: l') -> a
  | (n, e :: l') -> kieme (n - 1) l'
  | (n, []) -> failwith "Index out of bounds"
```

**utop test:**
```
# kieme 7 [4; 12; 27; -12; 7; 1; 8; 3; 6; 12; 42];;
- : int = 8
# kieme 1 [42; 1; 2];;
- : int = 42
# kieme 5 [1; 2; 3];;
Exception: Failure "Index out of bounds".
```

---

## Exercise 3

### Find the fixed point of a function (`jqastable`)

Repeatedly applies `f` to `x` until `f(x) = x`.

**Answer:**
```ocaml
let rec jqastable x f =
  if f x = x then x else jqastable (f x) f
```

**utop test:**
```
# jqastable 13 (fun x ->
    if x = 1 then 1
    else if x mod 2 = 1 then 3 * x + 1
    else x / 2);;
- : int = 1
# jqastable 5 (fun x -> x);;
- : int = 5
# jqastable 100 (fun x -> x / 2);;
- : int = 0
```

---

## Exercise 4

### Bubble sort: `unebulle` and `tribulle`

`unebulle` performs one pass of bubble sort. `tribulle` repeats until the list is sorted (fixed point of `unebulle`).

**Answer:**
```ocaml
(* One pass of bubble sort *)
let rec unebulle l = match l with
  | [] -> l
  | [a] -> l
  | e1 :: e2 :: l' ->
      if e1 < e2 then e1 :: (unebulle (e2 :: l'))
      else e2 :: (unebulle (e1 :: l'))

(* Full bubble sort = fixed point of unebulle *)
let tribulle l = jqastable l unebulle
```

**utop test:**
```
# unebulle [4; 12; 27; -12; 7; 8; 1; 3; 6; 42; 12];;
- : int list = [4; 12; -12; 7; 8; 1; 3; 6; 27; 12; 42]
# tribulle [4; 12; 27; -12; 7; 8; 1; 3; 6; 12; 42];;
- : int list = [-12; 1; 3; 4; 6; 7; 8; 12; 12; 27; 42]
```

---

## Exercise 5

### List utilities: `merge`, `create`, `insert`

**Answer:**
```ocaml
(* Flatten a list of lists *)
let rec merge ll = match ll with
  | [] -> []
  | l :: ll' -> l @ (merge ll')

(* Create list [f 1; f 2; ...; f k] *)
let rec create f k =
  if k = 1 then [f 1]
  else (create f (k - 1)) @ [f k]

(* Insert element j at the head of each sublist *)
let rec insert j ll = match ll with
  | [] -> []
  | l :: ll' -> (j :: l) :: (insert j ll')
```

**utop test:**
```
# merge [[1]; [2; 3]; [5]];;
- : int list = [1; 2; 3; 5]
# create (fun x -> x + 1) 4;;
- : int list = [2; 3; 4; 5]
# insert 1 [[3; 5]; [7; 3; 9]; []; [6]];;
- : int list list = [[1; 3; 5]; [1; 7; 3; 9]; [1]; [1; 6]]
```

---

## Exercise 6

### Generate all integer partitions (`partition`)

A partition of `n` is a decomposition into a sum of positive integers in descending order. Uses an auxiliary `partition_faible m k` that generates partitions of `m` with parts <= `k`.

**Answer:**
```ocaml
let partition n =
  let rec partition_faible m k =
    match (m, k) with
    | (0, 0) -> [[]]
    | (_, 0) -> []
    | (a, b) ->
        if b > a then partition_faible a a
        else merge (create (fun c ->
          insert c (partition_faible (a - c) c)) b)
  in
  partition_faible n n
```

**utop test:**
```
# partition 5;;
- : int list list =
[[1; 1; 1; 1; 1]; [2; 1; 1; 1]; [2; 2; 1]; [3; 1; 1]; [3; 2]; [4; 1]; [5]]
# List.length (partition 5);;
- : int = 7
# partition 1;;
- : int list list = [[1]]
# partition 0;;
- : int list list = [[]]
```
