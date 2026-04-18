---
title: "TP9 - Logique propositionnelle et analyse syntaxique"
sidebar_position: 9
---

# TP9 - Logique propositionnelle et analyse syntaxique

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp9/README.md`

---

## Definitions de types

```ocaml
type formula =
  | True
  | False
  | P of string                    (* Variable propositionnelle *)
  | Not of formula
  | And of formula * formula
  | Or of formula * formula
  | Imp of formula * formula       (* Implication *)
  | Iff of formula * formula       (* Bi-implication *)

type valuation = (string * bool) list
```

---

## Exercice 1

### Analyser des formules logiques a partir de chaines de caracteres

Operateurs : `~` (non), `.` (et), `+` (ou), `=>` (implique), `<=>` (equivalence).
Priorite : Non > Et > Ou > Imp > Iff.

L'analyseur syntaxique complet utilise la bibliotheque de combinateurs Opal. Voir le source du TP original pour l'implementation complete avec `string_to_formula`.

---

## Exercice 2

### Evaluer une formule etant donne une valuation (`eval`)

**Reponse :**
```ocaml
(* Rechercher la valeur d'une variable dans la valuation *)
let get_value (p : string) (v : valuation) : bool =
  List.assoc p v

(* Evaluer une formule sous une valuation *)
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

**Test utop :**
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

## Exercice 3

### Trouver toutes les variables propositionnelles dans une formule (`atoms`)

Collecte les noms de variables sans doublons en utilisant un accumulateur et `List.mem`.

**Reponse :**
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

**Test utop :**
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

## Exercice 4

### Verifier si une formule est toujours vraie (`tautology`)

Generation exhaustive de la table de verite : pour chaque variable, on teste vrai et faux, puis on combine avec `&&`.

**Reponse :**
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

**Test utop :**
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

## Exercice 5

### Trouver toutes les valuations qui rendent une formule vraie (`find_truth`)

Meme structure que `tautology` mais applique un callback `f` a chaque valuation satisfaisante. Utilise `;` pour enchainer les deux branches au lieu de `&&`.

**Reponse :**
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

**Test utop :**
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

## Exercice 6

### Convertir en forme normale de negation (`nnf`)

Regles de la NNF :
- Elimination de `Imp` : `p => q` devient `~p + q`
- Elimination de `Iff` : `p <=> q` devient `(p . q) + (~p . ~q)`
- Double negation : `~~p` devient `p`
- De Morgan : `~(p . q)` devient `~p + ~q`, `~(p + q)` devient `~p . ~q`

**Reponse :**
```ocaml
let rec nnf : formula -> formula = fun fm ->
  match fm with
  | True -> True
  | False -> False
  | P x -> P x
  (* Elimination des implications et bi-implications *)
  | Imp (x, y) -> nnf (Or (Not x, y))
  | Iff (x, y) -> nnf (Or (And (x, y), And (Not x, Not y)))
  (* Double negation *)
  | Not (Not x) -> nnf x
  (* Lois de De Morgan *)
  | Not (And (x, y)) -> nnf (Or (Not x, Not y))
  | Not (Or (x, y)) -> nnf (And (Not x, Not y))
  (* De Morgan pour les implications niees *)
  | Not (Imp (x, y)) -> nnf (And (x, Not y))
  | Not (Iff (x, y)) -> nnf (Or (And (x, Not y), And (Not x, y)))
  (* Recursion sur les sous-formules *)
  | And (x, y) -> And (nnf x, nnf y)
  | Or (x, y) -> Or (nnf x, nnf y)
  (* Negation d'un atome : deja en NNF *)
  | Not x -> Not (nnf x)
```

**Test utop :**
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

## Exercice 7

### Enigmes des chevaliers et des menteurs

Modele : `c` = vrai signifie que la personne est un chevalier (dit toujours la verite). Si la personne `c` fait la declaration `D`, alors `c <=> D` doit etre satisfait.

### Enigme 1 : "A1 affirme que A1 et A2 sont tous les deux des menteurs"

```ocaml
(* c1: A1 est un chevalier, c2: A2 est un chevalier *)
(* Declaration : ~c1 . ~c2 *)
(* Formule : c1 <=> (~c1 . ~c2) *)
let puzzle1 = Iff (P "c1", And (Not (P "c1"), Not (P "c2")))
```

**Test utop :**
```
# find_truth print_valuation puzzle1;;
c1=false c2=true
- : unit = ()
(* A1 est un menteur, A2 est un chevalier *)
```

### Enigme 2 : "Si je suis un chevalier, il y a de l'or sur l'ile"

```ocaml
(* k: chevalier, g: il y a de l'or *)
(* Declaration : k => g *)
(* Formule : k <=> (k => g) *)
let puzzle2 = Iff (P "k", Imp (P "k", P "g"))
```

**Test utop :**
```
# find_truth print_valuation puzzle2;;
k=true g=true
- : unit = ()
(* C'est un chevalier et il y a de l'or *)
```

### Enigme 3 : "Soit je suis un menteur, soit il y a de l'or"

```ocaml
(* c1: chevalier, g: il y a de l'or *)
(* Declaration : ~c1 + g *)
(* Formule : c1 <=> (~c1 + g) *)
let puzzle3 = Iff (P "c1", Or (Not (P "c1"), P "g"))
```

**Test utop :**
```
# find_truth print_valuation puzzle3;;
c1=true g=true
- : unit = ()
(* C'est un chevalier et il y a de l'or *)
```
