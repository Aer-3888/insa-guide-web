---
title: "TP1 - Introduction to OCaml"
sidebar_position: 1
---

# TP1 - Introduction to OCaml

## Overview

This lab introduces fundamental OCaml concepts including:
- Basic functions and expressions
- Conditional expressions
- Tuples and pattern matching
- Higher-order functions
- Recursion

## Exercises

### 1. Basic Arithmetic (`mul2`)
Multiply a number by 2.

**Concepts**: Simple function definition, arithmetic operations

### 2. Absolute Value (`vabs`)
Calculate the absolute value of an integer.

**Concepts**: Conditional expressions (`if-then-else`)

### 3. Range Testing (`test1`, `test2`)
- `test1`: Check if a number is in range [12, 29]
- `test2`: Check if a number equals 2, 5, 9, or 23

**Concepts**: Boolean operators (`&&`, `||`), comparison operators

### 4. Tuple Operations (`test3`)
Test if the first element of a pair equals 12.

**Concepts**: Tuple access with `fst` and `snd`

### 5. Leap Year (`bissext`)
Determine if a year is a leap year using the Gregorian calendar rules.

**Concepts**: Modulo operator, complex boolean logic

### 6. Tuple Projections (`proj1`, `proj23`)
Extract elements from 3-tuples.

**Concepts**: Pattern matching on tuples

### 7. Nested Tuple Operations (`inv2`)
Extract and swap elements from nested pairs.

**Concepts**: Nested pattern matching

### 8. Pair Increment (`incrpaire`)
Increment both elements of a pair.

**Concepts**: Tuple construction

### 9. Higher-Order Functions (`appliquepaire`, `incrpaire2`)
Apply a function to both elements of a pair.

**Concepts**: Functions as first-class values, function parameters

### 10. Function Composition (`rapport`, `mytan`)
Compute the ratio of two functions and implement tangent.

**Concepts**: Functions returning functions, closures

### 11. Primality Testing (`premier`)
Check if a number is prime using trial division.

**Concepts**: Nested recursive functions, local definitions

### 12. Nth Prime (`n_premier`)
Find the nth prime number.

**Concepts**: Combining multiple recursive functions

## Key OCaml Concepts

### Pattern Matching
```ocaml
let proj1 (a, b, c) = a
```

### Higher-Order Functions
```ocaml
let appliquepaire f p = (f (fst p), f (snd p))
```

### Nested Functions
```ocaml
let premier n =
  let rec estpremier x n =
    if x * x > n then true
    else if n mod x == 0 then false
    else estpremier (x + 1) n
  in
  estpremier 2 n
```

## Running the Code

Load the file in OCaml toplevel:
```bash
ocaml
# #use "tp1.ml";;
```

Or compile and run:
```bash
ocamlc -o tp1 tp1.ml
./tp1
```
