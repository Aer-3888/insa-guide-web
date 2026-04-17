---
title: "TP1 - Introduction to OCaml"
sidebar_position: 1
---

# TP1 - Introduction to OCaml

> Following teacher instructions from: `data/moodle/tp/tp1/README.md`

---

## Exercise 1

### Multiply a number by 2 (`mul2`)

**Answer:**
```ocaml
let mul2 n = 2 * n
```

**utop test:**
```
# mul2 21;;
- : int = 42
# mul2 0;;
- : int = 0
# mul2 (-3);;
- : int = -6
```

---

## Exercise 2

### Calculate the absolute value of an integer (`vabs`)

**Answer:**
```ocaml
let vabs n = if n > 0 then n else -n
```

**utop test:**
```
# vabs (-5);;
- : int = 5
# vabs 12;;
- : int = 12
# vabs 0;;
- : int = 0
```

---

## Exercise 3

### `test1`: Check if a number is in range [12, 29]

**Answer:**
```ocaml
let test1 n = n >= 12 && n <= 29
```

**utop test:**
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

### `test2`: Check if a number equals 2, 5, 9, or 23

**Answer:**
```ocaml
let test2 n = n = 2 || n = 5 || n = 9 || n = 23
```

**utop test:**
```
# test2 5;;
- : bool = true
# test2 6;;
- : bool = false
```

---

## Exercise 4

### Test if the first element of a pair equals 12 (`test3`)

**Answer:**
```ocaml
let test3 p = fst p = 12
```

**utop test:**
```
# test3 (12, "foo");;
- : bool = true
# test3 (12, 42);;
- : bool = true
# test3 (13, true);;
- : bool = false
```

---

## Exercise 5

### Determine if a year is a leap year (`bissext`)

Leap year rules: divisible by 400, OR divisible by 4 but not by 100.

**Answer:**
```ocaml
let bissext y =
  if y mod 400 = 0 then true
  else if y mod 100 = 0 then false
  else if y mod 4 = 0 then true
  else false
```

**utop test:**
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

## Exercise 6

### Extract elements from 3-tuples (`proj1`, `proj23`)

**Answer:**
```ocaml
(* proj1: first element of a 3-tuple *)
let proj1 (a, b, c) = a

(* proj23: second and third elements as a pair *)
let proj23 (a, b, c) = (b, c)
```

**utop test:**
```
# proj1 (1, "foo", true);;
- : int = 1
# proj23 (1, "foo", true);;
- : string * bool = ("foo", true)
```

---

## Exercise 7

### Extract and swap elements from nested pairs (`inv2`)

**Answer:**
```ocaml
let inv2 ((a, b), (c, d)) = (d, c)
```

**utop test:**
```
# inv2 ((true, 'a'), (1, "un"));;
- : string * int = ("un", 1)
```

---

## Exercise 8

### Increment both elements of a pair (`incrpaire`)

**Answer:**
```ocaml
let incrpaire p = (fst p + 1, snd p + 1)
```

**utop test:**
```
# incrpaire (12, 42);;
- : int * int = (13, 43)
```

---

## Exercise 9

### Apply a function to both elements of a pair (`appliquepaire`, `incrpaire2`)

**Answer:**
```ocaml
(* appliquepaire: apply f to both elements of a pair *)
let appliquepaire f p = (f (fst p), f (snd p))

(* incrpaire2: increment using appliquepaire *)
let incrpaire2 p = appliquepaire (fun x -> x + 1) p
```

**utop test:**
```
# appliquepaire (fun x -> not x) (false, true);;
- : bool * bool = (true, false)
# incrpaire2 (4, 18);;
- : int * int = (5, 19)
# appliquepaire String.length ("hello", "hi");;
- : int * int = (5, 2)
```

---

## Exercise 10

### Compute the ratio of two functions and implement tangent (`rapport`, `mytan`)

**Answer:**
```ocaml
(* rapport: f(x) / g(x) *)
let rapport (f, g) x = f x /. g x

(* mytan: tangent using sin and cos *)
let mytan x = rapport (sin, cos) x
```

**utop test:**
```
# rapport ((fun x -> x +. 1.), (fun x -> x -. 1.)) 2.;;
- : float = 3.
# mytan 0.;;
- : float = 0.
```

---

## Exercise 11

### Check if a number is prime (`premier`)

Uses trial division up to sqrt(n). Nested recursive local function with `let rec ... in`.

**Answer:**
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

**utop test:**
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

## Exercise 12

### Find the nth prime number (`n_premier`)

Combines `premier` with a counting auxiliary function.

**Answer:**
```ocaml
let n_premier n =
  let rec xnpremier n x i =
    if premier x && i < n then xnpremier n (x + 1) (i + 1)
    else if premier x && i = n then x
    else xnpremier n (x + 1) i
  in
  xnpremier n 2 1
```

**utop test:**
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
