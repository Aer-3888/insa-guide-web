---
title: "TP4 - Algorithmes sur les listes et partitions"
sidebar_position: 4
---

# TP4 - Algorithmes sur les listes et partitions

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp4/README.md`

---

## Exercice 1

### Tri rapide (quicksort) : `split` et `qs`

`split v l` partitionne la liste `l` en elements inferieurs a `v` et elements superieurs ou egaux a `v`.

`qs l` trie recursivement la liste par tri rapide (pivot = premier element).

**Reponse :**
```ocaml
(* Partitionner la liste autour du pivot v *)
let rec split v l = match l with
  | [] -> ([], [])
  | e :: l' ->
      if e < v then
        (e :: fst(split v l'), snd(split v l'))
      else
        (fst(split v l'), e :: snd(split v l'))

(* Tri rapide *)
let rec qs l = match l with
  | [] -> []
  | [e] -> [e]
  | e :: l' ->
      (qs (fst(split e l'))) @ (e :: (qs (snd(split e l'))))
```

**Test utop :**
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

## Exercice 2

### Extraire le k-ieme element d'une liste (`kieme`)

Indexe a partir de 1. Leve une exception si l'indice est hors limites.

**Reponse :**
```ocaml
let rec kieme k l = match (k, l) with
  | (1, a :: l') -> a
  | (n, e :: l') -> kieme (n - 1) l'
  | (n, []) -> failwith "Index out of bounds"
```

**Test utop :**
```
# kieme 7 [4; 12; 27; -12; 7; 1; 8; 3; 6; 12; 42];;
- : int = 8
# kieme 1 [42; 1; 2];;
- : int = 42
# kieme 5 [1; 2; 3];;
Exception: Failure "Index out of bounds".
```

---

## Exercice 3

### Trouver le point fixe d'une fonction (`jqastable`)

Applique `f` a `x` de maniere repetee jusqu'a ce que `f(x) = x`.

**Reponse :**
```ocaml
let rec jqastable x f =
  if f x = x then x else jqastable (f x) f
```

**Test utop :**
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

## Exercice 4

### Tri a bulle : `unebulle` et `tribulle`

`unebulle` effectue une passe du tri a bulle. `tribulle` repete jusqu'a ce que la liste soit triee (point fixe de `unebulle`).

**Reponse :**
```ocaml
(* Une passe du tri a bulle *)
let rec unebulle l = match l with
  | [] -> l
  | [a] -> l
  | e1 :: e2 :: l' ->
      if e1 < e2 then e1 :: (unebulle (e2 :: l'))
      else e2 :: (unebulle (e1 :: l'))

(* Tri a bulle complet = point fixe de unebulle *)
let tribulle l = jqastable l unebulle
```

**Test utop :**
```
# unebulle [4; 12; 27; -12; 7; 8; 1; 3; 6; 42; 12];;
- : int list = [4; 12; -12; 7; 8; 1; 3; 6; 27; 12; 42]
# tribulle [4; 12; 27; -12; 7; 8; 1; 3; 6; 12; 42];;
- : int list = [-12; 1; 3; 4; 6; 7; 8; 12; 12; 27; 42]
```

---

## Exercice 5

### Utilitaires sur les listes : `merge`, `create`, `insert`

**Reponse :**
```ocaml
(* Aplatir une liste de listes *)
let rec merge ll = match ll with
  | [] -> []
  | l :: ll' -> l @ (merge ll')

(* Creer la liste [f 1; f 2; ...; f k] *)
let rec create f k =
  if k = 1 then [f 1]
  else (create f (k - 1)) @ [f k]

(* Inserer l'element j en tete de chaque sous-liste *)
let rec insert j ll = match ll with
  | [] -> []
  | l :: ll' -> (j :: l) :: (insert j ll')
```

**Test utop :**
```
# merge [[1]; [2; 3]; [5]];;
- : int list = [1; 2; 3; 5]
# create (fun x -> x + 1) 4;;
- : int list = [2; 3; 4; 5]
# insert 1 [[3; 5]; [7; 3; 9]; []; [6]];;
- : int list list = [[1; 3; 5]; [1; 7; 3; 9]; [1]; [1; 6]]
```

---

## Exercice 6

### Generer toutes les partitions d'un entier (`partition`)

Une partition de `n` est une decomposition en somme d'entiers positifs en ordre decroissant. Utilise une fonction auxiliaire `partition_faible m k` qui genere les partitions de `m` avec des parts <= `k`.

**Reponse :**
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

**Test utop :**
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
