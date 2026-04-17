---
title: "TP2 - Advanced Recursion and Numerical Methods"
sidebar_position: 2
---

# TP2 - Advanced Recursion and Numerical Methods

## Overview

This lab explores advanced recursive techniques including:
- Mutual recursion
- Higher-order functions with accumulation
- Numerical integration
- Function optimization

## Exercises

### 1. Mutual Recursion (`pair`, `impair`)
Determine if a number is even or odd using mutual recursion.

**Concepts**: Mutually recursive functions with `and` keyword

### 2. Summation (`sigma`)
Compute the sum of integers from `a` to `b`.

**Concepts**: Basic recursion with accumulation

### 3. Generalized Summation (`sigma2`)
Sum the results of applying a function to each integer in a range.

**Concepts**: Higher-order functions, function parameters

### 4. Parameterized Accumulation (`sigma3`)
Generic accumulation with custom function and combiner.

**Concepts**: Fold-like operations, flexible accumulation patterns

### 5. Predicate-Based Iteration (`sigma4`)
Iterate until a predicate is satisfied, with custom increment.

**Concepts**: Predicates, general iteration patterns

### 6. Numerical Summation (`cum`)
Cumulative sum over a floating-point interval.

**Concepts**: Floating-point arithmetic, numerical methods

### 7. Numerical Integration (`integre`)
Approximate definite integrals using the rectangle method.

**Concepts**: Calculus, numerical integration, dx precision

### 8. Function Maximization (`maxi`)
Find the maximum of a function over an interval using ternary search.

**Concepts**: Optimization algorithms, recursive search

## Key OCaml Concepts

### Mutual Recursion
```ocaml
let rec pair n = 
  if n = 0 then true else impair (pred n)
and impair n = 
  if n = 0 then false else pair (pred n)
```

### Higher-Order Accumulation
```ocaml
let rec sigma3 (f, fc) i acc (a, b) =
  if a > b then acc
  else fc (f a) (sigma3 (f, fc) i acc (a + i, b))
```

### Numerical Integration
```ocaml
let integre f (a, b, dx) = dx *. cum f (a, b) dx
```

### Ternary Search
```ocaml
let rec maxi f (a, b) p =
  if abs_float (a -. b) < p then f a
  else
    if f ((2. *. a +. b) /. 3.) > f ((a +. 2. *. b) /. 3.)
    then maxi f (a, (a +. 2. *. b) /. 3.) p
    else maxi f ((2. *. a +. b) /. 3., b) p
```

## Mathematical Background

### Numerical Integration
The rectangle method approximates:
```
∫[a,b] f(x)dx ≈ Σ f(xi) * dx
```

### Ternary Search
Finds the maximum of a unimodal function by dividing the search space into thirds and recursively searching the portion containing the maximum.

## Running the Code

```bash
ocaml
# #use "tp2.ml";;
```

## Expected Results

- `sigma (-2, 4)` → 7
- `sigma2 (fun x -> 2 * x) (-2, 4)` → 14
- `integre (fun x -> 1. /. x) (1., 2., 0.001)` → ~0.693 (ln(2))
- `maxi (fun x -> 1. -. (x *. x)) (0., 2.) 0.0001` → 1.0
