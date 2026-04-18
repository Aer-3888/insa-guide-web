---
title: "TP9 - Logique propositionnelle et analyse syntaxique"
sidebar_position: 9
---

# TP9 - Logique propositionnelle et analyse syntaxique

## Vue d'ensemble

Implementation d'un systeme de logique propositionnelle avec :
- Bibliotheque de combinateurs d'analyse syntaxique (Opal)
- Analyse et evaluation de formules
- Verification de tautologies
- Conversion en CNF
- Enigmes des chevaliers et des menteurs

## Types de donnees

```ocaml
type formula =
  | True | False
  | P of string                    (* Variable propositionnelle *)
  | Not of formula
  | And of formula * formula
  | Or of formula * formula
  | Imp of formula * formula       (* Implication *)
  | Iff of formula * formula       (* Bi-implication *)

type valuation = (string * bool) list
```

## Exercices

### 1. Analyse syntaxique de formules
Analyser des formules logiques a partir de chaines de caracteres :
- Operateurs : `~` (non), `.` (et), `+` (ou), `=>` (implique), `<=>` (equivalence)
- Priorite : Non > Et > Ou > Imp > Iff

**Concepts** : Combinateurs d'analyse syntaxique, priorite des operateurs

### 2. Evaluation de formules (`eval`)
Evaluer une formule etant donne une valuation.

**Concepts** : Evaluation recursive, pattern matching

### 3. Extraction des atomes (`atoms`)
Trouver toutes les variables propositionnelles dans une formule.

**Concepts** : Parcours d'arbre, collecte d'elements

### 4. Verification de tautologie (`tautology`)
Verifier si une formule est toujours vraie.

**Concepts** : Tables de verite, recherche exhaustive

### 5. Recherche de solutions (`find_truth`)
Trouver toutes les valuations qui rendent une formule vraie.

**Concepts** : Retour sur trace (backtracking), enumeration de solutions

### 6. Formes normales (`nnf`, `simplify`)
- `nnf` : Convertir en forme normale de negation
- `simplify` : Convertir en CNF simplifiee

**Concepts** : Transformation de formules, lois de De Morgan

### 7. Chevaliers et menteurs
Resoudre des enigmes logiques avec le systeme.

**Concepts** : Modelisation logique, resolution de problemes

## Algorithmes cles

### Evaluation de formules
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

### Verification de tautologie
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

### Forme normale de negation
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

## Enigmes des chevaliers et des menteurs

Exemple : "Si je suis un chevalier, il y a de l'or sur l'ile"
```ocaml noexec
(* k: "je" suis un chevalier, g: il y a de l'or *)
let _ = find_truth print_valuation
  (string_to_formula "k <=> (k => g)")
(* Resultat : k=true, g=true *)
```

## Execution du code

```bash
ocaml
# #use "tp9.ml";;
```

Fonctions de test :
```bash
# test_eval ();;
# test_atoms ();;
# test_tautology ();;
# test_find_truth ();;
# test_nnf ();;
```

## Resultats attendus

- `tautology "p => q => p"` → true
- `tautology "~(p . q) <=> ~p + ~q"` → true (De Morgan)
- `find_truth "p + q"` → 3 solutions
- `find_truth "p . ~p"` → 0 solutions
