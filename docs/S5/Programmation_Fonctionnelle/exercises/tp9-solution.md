---
title: "TP9 - Propositional Logic and Parsing"
sidebar_position: 9
---

# TP9 - Propositional Logic and Parsing

> Following teacher instructions from: `data/moodle/tp/tp9/README.md`

---

## Type Definitions

```ocaml
type formula =
  | True
  | False
  | P of string                    (* Propositional variable *)
  | Not of formula
  | And of formula * formula
  | Or of formula * formula
  | Imp of formula * formula       (* Implication *)
  | Iff of formula * formula       (* Bi-implication *)

type valuation = (string * bool) list
```

---

## Exercise 1

### Parse logical formulas from strings

Operators: `~` (not), `.` (and), `+` (or), `=>` (implies), `<=>` (iff).
Precedence: Not > And > Or > Imp > Iff.

The full parser uses the Opal parser combinator library. See the original TP source for the complete implementation with `string_to_formula`.

---

## Exercise 2

### Evaluate a formula given a valuation (`eval`)

**Answer:**
```ocaml
(* Look up variable value in valuation *)
let get_value (p : string) (v : valuation) : bool =
  List.assoc p v

(* Evaluate formula under a valuation *)
let rec eval (fm : formula) (v : valuation) : bool =
  match fm with
  | True -> true
  | False -> false
  | P s -> get_value s v
  | Not f -> not (eval f v)
  | And (f, g) -> (eval f v) && (eval g v)
  | Or (f, g) -> (eval f v) || (eval g v)
  | Imp (f, g) -> not (eval f v) || (eval g v)
  | Iff (f, g) -> (eval f v) = (eval g v)
```

**utop test:**
```
# eval (Imp (P "p", P "q")) [("p", true); ("q", false)];;
- : bool = false
# eval (Or (P "p", Not (P "p"))) [("p", true)];;
- : bool = true
# eval (Iff (P "a", P "b")) [("a", true); ("b", true)];;
- : bool = true
# eval (Iff (P "a", P "b")) [("a", true); ("b", false)];;
- : bool = false
# eval (And (P "a", P "b")) [("a", true); ("b", false)];;
- : bool = false
```

---

## Exercise 3

### Find all propositional variables in a formula (`atoms`)

Collects variable names without duplicates using an accumulator and `List.mem`.

**Answer:**
```ocaml
let atoms (fm : formula) : string list =
  let rec atoms_internal (fm : formula) (curlist : string list) : string list =
    match fm with
    | True | False -> curlist
    | P x -> if List.mem x curlist then curlist else x :: curlist
    | Not f -> atoms_internal f curlist
    | Or (f, g) | And (f, g) | Imp (f, g) | Iff (f, g) ->
        atoms_internal g (atoms_internal f curlist)
  in
  atoms_internal fm []
```

**utop test:**
```
# atoms (And (P "p", Or (P "q", P "p")));;
- : string list = ["q"; "p"]
# atoms (Imp (P "a", P "b"));;
- : string list = ["b"; "a"]
# atoms True;;
- : string list = []
# atoms (Not (P "x"));;
- : string list = ["x"]
```

---

## Exercise 4

### Check if a formula is always true (`tautology`)

Exhaustive truth table generation: for each variable, try both true and false, combine with `&&`.

**Answer:**
```ocaml
let tautology (fm : formula) : bool =
  let rec tautology_atomic_descent
      (decided : valuation)
      (atoms_to_be_decided : string list) : bool =
    match atoms_to_be_decided with
    | [] -> eval fm decided
    | head :: body ->
        tautology_atomic_descent ((head, true) :: decided) body &&
        tautology_atomic_descent ((head, false) :: decided) body
  in
  tautology_atomic_descent [] (atoms fm)
```

**utop test:**
```
# tautology (Or (P "p", Not (P "p")));;
- : bool = true
# tautology (Imp (P "p", P "q"));;
- : bool = false
# tautology (Imp (P "p", Imp (P "q", P "p")));;
- : bool = true
# tautology (Iff (Not (And (P "p", P "q")), Or (Not (P "p"), Not (P "q"))));;
- : bool = true
# tautology (Iff (Not (Not (P "p")), P "p"));;
- : bool = true
```

---

## Exercise 5

### Find all valuations that make a formula true (`find_truth`)

Same structure as `tautology` but applies a callback `f` to each satisfying valuation. Uses `;` to sequence both branches instead of `&&`.

**Answer:**
```ocaml
let find_truth (f : valuation -> unit) (fm : formula) : unit =
  let rec truth_in_depth (v : valuation) (undecided : string list) : unit =
    match undecided with
    | [] -> if eval fm v then f v else ()
    | head :: body ->
        truth_in_depth ((head, true) :: v) body;
        truth_in_depth ((head, false) :: v) body
  in
  truth_in_depth [] (atoms fm)
```

**utop test:**
```
# let print_valuation v =
    List.iter (fun (k, b) -> Printf.printf "%s=%b " k b) v;
    print_newline ();;

# find_truth print_valuation (Or (P "p", P "q"));;
p=true q=true
p=false q=true
p=true q=false
- : unit = ()

# find_truth print_valuation (And (P "p", Not (P "p")));;
- : unit = ()
```

---

## Exercise 6

### Convert to Negation Normal Form (`nnf`)

NNF rules:
- Eliminate `Imp`: `p => q` becomes `~p + q`
- Eliminate `Iff`: `p <=> q` becomes `(p . q) + (~p . ~q)`
- Double negation: `~~p` becomes `p`
- De Morgan: `~(p . q)` becomes `~p + ~q`, `~(p + q)` becomes `~p . ~q`

**Answer:**
```ocaml
let rec nnf : formula -> formula = fun fm ->
  match fm with
  | True -> True
  | False -> False
  | P x -> P x
  (* Eliminate implications and bi-implications *)
  | Imp (x, y) -> nnf (Or (Not x, y))
  | Iff (x, y) -> nnf (Or (And (x, y), And (Not x, Not y)))
  (* Double negation *)
  | Not (Not x) -> nnf x
  (* De Morgan's laws *)
  | Not (And (x, y)) -> nnf (Or (Not x, Not y))
  | Not (Or (x, y)) -> nnf (And (Not x, Not y))
  (* De Morgan for negated implications *)
  | Not (Imp (x, y)) -> nnf (And (x, Not y))
  | Not (Iff (x, y)) -> nnf (Or (And (x, Not y), And (Not x, y)))
  (* Recurse on subformulas *)
  | And (x, y) -> And (nnf x, nnf y)
  | Or (x, y) -> Or (nnf x, nnf y)
  (* Negation of an atom: already in NNF *)
  | Not x -> Not (nnf x)
```

**utop test:**
```
# nnf (Imp (P "p", P "q"));;
- : formula = Or (Not (P "p"), P "q")
# nnf (Not (And (P "p", P "q")));;
- : formula = Or (Not (P "p"), Not (P "q"))
# nnf (Not (Not (P "x")));;
- : formula = P "x"
# tautology (Iff (Imp (P "p", P "q"), nnf (Imp (P "p", P "q"))));;
- : bool = true
```

---

## Exercise 7

### Knights and Knaves puzzles

Model: `c` = true means the person is a knight (always tells truth). If person `c` says declaration `D`, then `c <=> D` must hold.

### Puzzle 1: "A1 asserts that A1 and A2 are both knaves"

```ocaml
(* c1: A1 is a knight, c2: A2 is a knight *)
(* Declaration: ~c1 . ~c2 *)
(* Formula: c1 <=> (~c1 . ~c2) *)
let puzzle1 = Iff (P "c1", And (Not (P "c1"), Not (P "c2")))
```

**utop test:**
```
# find_truth print_valuation puzzle1;;
c1=false c2=true
- : unit = ()
(* A1 is a knave, A2 is a knight *)
```

### Puzzle 2: "If I am a knight there is gold on the island"

```ocaml
(* k: knight, g: gold *)
(* Declaration: k => g *)
(* Formula: k <=> (k => g) *)
let puzzle2 = Iff (P "k", Imp (P "k", P "g"))
```

**utop test:**
```
# find_truth print_valuation puzzle2;;
k=true g=true
- : unit = ()
(* Is a knight and there is gold *)
```

### Puzzle 3: "Either I am a knave or there is gold"

```ocaml
(* c1: knight, g: gold *)
(* Declaration: ~c1 + g *)
(* Formula: c1 <=> (~c1 + g) *)
let puzzle3 = Iff (P "c1", Or (Not (P "c1"), P "g"))
```

**utop test:**
```
# find_truth print_valuation puzzle3;;
c1=true g=true
- : unit = ()
(* Is a knight and there is gold *)
```
