---
title: "TP1 - Introduction a OCaml"
sidebar_position: 1
---

# TP1 - Introduction a OCaml

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp1/README.md`

---

## Exercice 1

### Multiplier un nombre par 2 (`mul2`)

**Reponse :**
```ocaml
let mul2 n = 2 * n
```

**Test utop :**
```
# mul2 21;;
- : int = 42
# mul2 0;;
- : int = 0
# mul2 (-3);;
- : int = -6
```

---

## Exercice 2

### Calculer la valeur absolue d'un entier (`vabs`)

**Reponse :**
```ocaml
let vabs n = if n > 0 then n else -n
```

**Test utop :**
```
# vabs (-5);;
- : int = 5
# vabs 12;;
- : int = 12
# vabs 0;;
- : int = 0
```

---

## Exercice 3

### `test1` : Verifier si un nombre est dans l'intervalle [12, 29]

**Reponse :**
```ocaml
let test1 n = n >= 12 && n <= 29
```

**Test utop :**
```
# test1 25;;
- : bool = true
# test1 (-8);;
- : bool = false
# test1 12;;
- : bool = true
# test1 29;;
- : bool = true
```

### `test2` : Verifier si un nombre vaut 2, 5, 9 ou 23

**Reponse :**
```ocaml
let test2 n = n = 2 || n = 5 || n = 9 || n = 23
```

**Test utop :**
```
# test2 5;;
- : bool = true
# test2 6;;
- : bool = false
```

---

## Exercice 4

### Tester si le premier element d'une paire vaut 12 (`test3`)

**Reponse :**
```ocaml
let test3 p = fst p = 12
```

**Test utop :**
```
# test3 (12, "foo");;
- : bool = true
# test3 (12, 42);;
- : bool = true
# test3 (13, true);;
- : bool = false
```

---

## Exercice 5

### Determiner si une annee est bissextile (`bissext`)

Regles des annees bissextiles : divisible par 400, OU divisible par 4 mais pas par 100.

**Reponse :**
```ocaml
let bissext y =
  if y mod 400 = 0 then true
  else if y mod 100 = 0 then false
  else if y mod 4 = 0 then true
  else false
```

**Test utop :**
```
# bissext 2000;;
- : bool = true
# bissext 1900;;
- : bool = false
# bissext 2016;;
- : bool = true
# bissext 2017;;
- : bool = false
```

---

## Exercice 6

### Extraire des elements de triplets (`proj1`, `proj23`)

**Reponse :**
```ocaml
(* proj1 : premier element d'un triplet *)
let proj1 (a, b, c) = a

(* proj23 : deuxieme et troisieme elements sous forme de paire *)
let proj23 (a, b, c) = (b, c)
```

**Test utop :**
```
# proj1 (1, "foo", true);;
- : int = 1
# proj23 (1, "foo", true);;
- : string * bool = ("foo", true)
```

---

## Exercice 7

### Extraire et permuter des elements de paires imbriquees (`inv2`)

**Reponse :**
```ocaml
let inv2 ((a, b), (c, d)) = (d, c)
```

**Test utop :**
```
# inv2 ((true, 'a'), (1, "un"));;
- : string * int = ("un", 1)
```

---

## Exercice 8

### Incrementer les deux elements d'une paire (`incrpaire`)

**Reponse :**
```ocaml
let incrpaire p = (fst p + 1, snd p + 1)
```

**Test utop :**
```
# incrpaire (12, 42);;
- : int * int = (13, 43)
```

---

## Exercice 9

### Appliquer une fonction aux deux elements d'une paire (`appliquepaire`, `incrpaire2`)

**Reponse :**
```ocaml
(* appliquepaire : appliquer f aux deux elements d'une paire *)
let appliquepaire f p = (f (fst p), f (snd p))

(* incrpaire2 : incrementer en utilisant appliquepaire *)
let incrpaire2 p = appliquepaire (fun x -> x + 1) p
```

**Test utop :**
```
# appliquepaire (fun x -> not x) (false, true);;
- : bool * bool = (true, false)
# incrpaire2 (4, 18);;
- : int * int = (5, 19)
# appliquepaire String.length ("hello", "hi");;
- : int * int = (5, 2)
```

---

## Exercice 10

### Calculer le rapport de deux fonctions et implementer la tangente (`rapport`, `mytan`)

**Reponse :**
```ocaml
(* rapport : f(x) / g(x) *)
let rapport (f, g) x = f x /. g x

(* mytan : tangente en utilisant sin et cos *)
let mytan x = rapport (sin, cos) x
```

**Test utop :**
```
# rapport ((fun x -> x +. 1.), (fun x -> x -. 1.)) 2.;;
- : float = 3.
# mytan 0.;;
- : float = 0.
```

---

## Exercice 11

### Verifier si un nombre est premier (`premier`)

Utilise la division par essai jusqu'a sqrt(n). Fonction locale recursive imbriquee avec `let rec ... in`.

**Reponse :**
```ocaml
let premier n =
  if n = 1 then false
  else
    let rec estpremier x n =
      if x * x > n then true
      else if n mod x = 0 then false
      else estpremier (x + 1) n
    in
    estpremier 2 n
```

**Test utop :**
```
# premier 1;;
- : bool = false
# premier 2;;
- : bool = true
# premier 6;;
- : bool = false
# premier 13;;
- : bool = true
# premier 97;;
- : bool = true
```

---

## Exercice 12

### Trouver le n-ieme nombre premier (`n_premier`)

Combine `premier` avec une fonction auxiliaire de comptage.

**Reponse :**
```ocaml
let n_premier n =
  let rec xnpremier n x i =
    if premier x && i < n then xnpremier n (x + 1) (i + 1)
    else if premier x && i = n then x
    else xnpremier n (x + 1) i
  in
  xnpremier n 2 1
```

**Test utop :**
```
# n_premier 1;;
- : int = 2
# n_premier 4;;
- : int = 7
# n_premier 10;;
- : int = 29
# n_premier 100;;
- : int = 541
```
