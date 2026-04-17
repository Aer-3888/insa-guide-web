---
title: "TP2 - Advanced Recursion and Numerical Methods"
sidebar_position: 2
---

# TP2 - Advanced Recursion and Numerical Methods

> Following teacher instructions from: `data/moodle/tp/tp2/README.md`

---

## Exercise 1

### Mutual recursion: determine if a number is even or odd (`pair`, `impair`)

Use mutually recursive functions with the `and` keyword, without using `mod`.

**Answer:**
```ocaml
let rec pair n =
  if n = 0 then true else impair (pred n)

and impair n =
  if n = 0 then false else pair (pred n)
```

**utop test:**
```
# pair 12;;
- : bool = true
# impair 12;;
- : bool = false
# pair 7;;
- : bool = false
# impair 7;;
- : bool = true
```

---

## Exercise 2

### Compute the sum of integers from `a` to `b` (`sigma`)

**Answer:**
```ocaml
let rec sigma (a, b) =
  if a > b then 0
  else a + sigma (succ a, b)
```

**utop test:**
```
# sigma (-2, 4);;
- : int = 7
# sigma (1, 10);;
- : int = 55
# sigma (5, 3);;
- : int = 0
```

---

## Exercise 3

### Sum the results of applying a function to each integer in a range (`sigma2`)

Generalization of `sigma`: instead of summing `a`, sum `f(a)`.

**Answer:**
```ocaml
let rec sigma2 f (a, b) =
  if a > b then 0
  else f a + sigma2 f (succ a, b)
```

**utop test:**
```
# sigma2 (fun x -> 2 * x) (-2, 4);;
- : int = 14
# sigma2 (fun x -> x * x) (1, 4);;
- : int = 30
# sigma2 (fun x -> 1) (1, 10);;
- : int = 10
```

---

## Exercise 4

### Generic accumulation with custom function and combiner (`sigma3`)

Generalizes `sigma2` with:
- `f`: transformation applied to each value
- `fc`: combiner function (replaces `+`)
- `i`: increment step (replaces `1`)
- `acc`: initial accumulator value (replaces `0`)

**Answer:**
```ocaml
let rec sigma3 (f, fc) i acc (a, b) =
  if a > b then acc
  else fc (f a) (sigma3 (f, fc) i acc (a + i, b))
```

**utop test:**
```
# sigma3 ((fun x -> 2 * x), fun v acc -> v + acc) 2 0 (2, 6);;
- : int = 24
# sigma3 ((fun x -> x * x), fun x acc -> x :: acc) 2 [] (0, 10);;
- : int list = [0; 4; 16; 36; 64; 100]
# sigma3 ((fun x -> x), fun x acc -> x * acc) 1 1 (1, 5);;
- : int = 120
```

---

## Exercise 5

### Iterate until a predicate is satisfied, with custom increment (`sigma4`)

Final generalization: replaces the bound `b` and step `i` with a stopping predicate `p` and an increment function `fi`.

**Answer:**
```ocaml
let rec sigma4 (f, fc) (p, fi) acc a =
  if p a then acc
  else fc (f a) (sigma4 (f, fc) (p, fi) acc (fi a))
```

**utop test:**
```
# sigma4 ((fun x -> 2 * x), fun v acc -> v + acc)
         ((fun v -> v > 6), fun v -> v + 2) 0 2;;
- : int = 24
# sigma4 ((fun x -> x), fun v a -> v + a)
         ((fun v -> v > 10), fun v -> v + 1) 0 1;;
- : int = 55
```

---

## Exercise 6

### Cumulative sum over a floating-point interval (`cum`)

Instantiation of `sigma4` for floating-point numerical summation.

**Answer:**
```ocaml
let cum f (a, b) dx =
  sigma4 (f, fun a b -> a +. b)
         ((fun a -> a > b), fun v -> v +. dx)
         0.
         a
```

**utop test:**
```
# cum (fun x -> 2. *. x) (0.2, 0.7) 0.2;;
- : float = 2.4
```

---

## Exercise 7

### Approximate definite integrals using the rectangle method (`integre`)

Multiplies the cumulative sum by `dx` (rectangle method: integral of f from a to b is approximately dx * sum of f(x_i)).

**Answer:**
```ocaml
let integre f (a, b, dx) = dx *. cum f (a, b) dx
```

**utop test:**
```
# integre (fun x -> 1. /. x) (1., 2., 0.001);;
- : float = 0.693897243059959257
# integre (fun x -> x *. x) (0., 1., 0.001);;
- : float = 0.332833499999...
```

---

## Exercise 8

### Find the maximum of a function over an interval using ternary search (`maxi`)

Divides the interval into thirds. Compares f at the two third-points and eliminates the portion that cannot contain the maximum. Works for unimodal functions.

**Answer:**
```ocaml
let rec maxi f (a, b) p =
  if abs_float (a -. b) < p then f a
  else
    let m1 = (2. *. a +. b) /. 3. in
    let m2 = (a +. 2. *. b) /. 3. in
    if f m1 > f m2
    then maxi f (a, m2) p
    else maxi f (m1, b) p
```

**utop test:**
```
# maxi (fun x -> 1. -. (x *. x)) (0., 2.) 0.0001;;
- : float = 0.999999999...
# maxi sin (0., Float.pi) 0.0001;;
- : float = 0.999999999...
```
