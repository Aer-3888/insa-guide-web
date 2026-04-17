---
title: "TP9 - Propositional Logic and Parsing"
sidebar_position: 9
---

# TP9 - Propositional Logic and Parsing

## Overview

Implementation of a propositional logic system with:
- Parser combinator library (Opal)
- Formula parsing and evaluation
- Tautology checking
- CNF conversion
- Knights and Knaves puzzles

## Data Types

```ocaml
type formula =
  | True | False
  | P of string                    (* Propositional variable *)
  | Not of formula
  | And of formula * formula
  | Or of formula * formula
  | Imp of formula * formula       (* Implication *)
  | Iff of formula * formula       (* Bi-implication *)

type valuation = (string * bool) list
```

## Exercises

### 1. Formula Parsing
Parse logical formulas from strings:
- Operators: `~` (not), `.` (and), `+` (or), `=>` (implies), `<=>` (iff)
- Precedence: Not > And > Or > Imp > Iff

**Concepts**: Parser combinators, operator precedence

### 2. Formula Evaluation (`eval`)
Evaluate a formula given a valuation.

**Concepts**: Recursive evaluation, pattern matching

### 3. Extract Atoms (`atoms`)
Find all propositional variables in a formula.

**Concepts**: Tree traversal, collecting elements

### 4. Tautology Checking (`tautology`)
Check if a formula is always true.

**Concepts**: Truth tables, exhaustive search

### 5. Find Truths (`find_truth`)
Find all valuations that make a formula true.

**Concepts**: Backtracking, solution enumeration

### 6. Normal Forms (`nnf`, `simplify`)
- `nnf`: Convert to Negation Normal Form
- `simplify`: Convert to simplified CNF

**Concepts**: Formula transformation, De Morgan's laws

### 7. Knights and Knaves
Solve logic puzzles using the system.

**Concepts**: Logic modeling, problem solving

## Key Algorithms

### Formula Evaluation
```ocaml
let rec eval fm v = match fm with
  | True -> true
  | False -> false
  | P s -> List.assoc s v
  | Not f -> not (eval f v)
  | And (f, g) -> (eval f v) && (eval g v)
  | Or (f, g) -> (eval f v) || (eval g v)
  | Imp (f, g) -> not (eval f v) || (eval g v)
  | Iff (f, g) -> (eval f v) = (eval g v)
```

### Tautology Checking
```ocaml noexec
let tautology fm =
  let rec check decided atoms_left = match atoms_left with
    | [] -> eval fm decided
    | head :: body ->
        check ((head, true) :: decided) body &&
        check ((head, false) :: decided) body
  in
  check [] (atoms fm)
```

### Negation Normal Form
```ocaml
let rec nnf fm = match fm with
  | Not (Not x) -> nnf x
  | Not (And (x, y)) -> nnf (Or (Not x, Not y))
  | Not (Or (x, y)) -> nnf (And (Not x, Not y))
  | Imp (x, y) -> nnf (Or (Not x, y))
  | Iff (x, y) -> nnf (Or (And (x, y), And (Not x, Not y)))
  | And (x, y) -> And (nnf x, nnf y)
  | Or (x, y) -> Or (nnf x, nnf y)
  | _ -> fm
```

## Knights and Knaves Puzzles

Example: "If I am a knight there is gold on the island"
```ocaml noexec
(* k: "I" is a knight, g: there is gold *)
let _ = find_truth print_valuation
  (string_to_formula "k <=> (k => g)")
(* Result: k=true, g=true *)
```

## Running the Code

```bash
ocaml
# #use "tp9.ml";;
```

Test functions:
```bash
# test_eval ();;
# test_atoms ();;
# test_tautology ();;
# test_find_truth ();;
# test_nnf ();;
```

## Expected Results

- `tautology "p => q => p"` → true
- `tautology "~(p . q) <=> ~p + ~q"` → true (De Morgan)
- `find_truth "p + q"` → 3 solutions
- `find_truth "p . ~p"` → 0 solutions
