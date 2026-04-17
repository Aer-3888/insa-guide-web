---
title: "Chapitre 5 -- Types algebriques"
sidebar_position: 5
---

# Chapitre 5 -- Types algebriques

## Theorie

Les types algebriques sont la facon de definir ses propres types en OCaml. Ils se composent de **types somme** (variants) et de **types produit** (tuples/records). Combines, ils forment des types algebriques de donnees (ADT).

### Types somme (variants)

Un type somme enumere plusieurs alternatives possibles.

```ocaml
(* Enumeration simple *)
type coul = Coeur | Trefle | Pique | Carreau

(* Avec donnees associees *)
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As

(* Les constructeurs commencent par une majuscule *)
let c = Coeur        (* val c : coul = Coeur *)
let h = As            (* val h : haut = As *)
```

### Variants avec donnees

Les constructeurs peuvent porter des donnees :

```ocaml
(* Variant avec un tuple *)
type carte = Carte of haut * coul
let c = Carte (As, Coeur)
(* val c : carte *)

(* Extraction par pattern matching *)
let coul c = let Carte (_, col) = c in col
let haut c = let Carte (h, _) = c in h
```

### Records vs Variants avec tuples

Deux facons d'encoder une carte :

```ocaml
(* Approche TP3 : Record *)
type carte = {h : haut; c : coul}
let c = {h = As; c = Coeur}
let get_coul c = c.c

(* Approche TP8 : Variant *)
type carte = Carte of haut * coul
let c = Carte (As, Coeur)
let get_coul c = let Carte (_, col) = c in col

(* Les records sont plus lisibles (champs nommes) *)
(* Les variants sont plus puissants (plusieurs alternatives) *)
```

### Le type option

Le type `option` est le moyen sur de representer l'absence de valeur. C'est le remplacant de `null` / `None` dans d'autres langages.

```ocaml
(* Deja defini dans la bibliotheque standard *)
type 'a option = None | Some of 'a

(* Recherche sure dans une liste *)
let rec rang_opt e l = match l with
  | [] -> None
  | e1 :: tl ->
      if e1 = e then Some 1
      else match rang_opt e tl with
        | None -> None
        | Some c -> Some (c + 1)
(* val rang_opt : 'a -> 'a list -> int option *)

(* Utilisation *)
let _ = rang_opt 2 [3; 2; 1]  (* = Some 2 *)
let _ = rang_opt 0 [3; 2; 1]  (* = None *)
```

### Types polymorphes

Les parametres de type (variables de type) permettent de creer des types generiques.

```ocaml
(* 'a option : option parametree par un type quelconque *)
type 'a option = None | Some of 'a

(* 'a list : liste parametree *)
(* type 'a list = [] | (::) of 'a * 'a list *)

(* 'a arbin : arbre binaire generique *)
type 'a arbin =
  | Feuille of 'a
  | Noeud of 'a arbin * 'a * 'a arbin

(* On peut instancier avec n'importe quel type *)
let a1 : int arbin = Noeud (Feuille 1, 2, Feuille 3)
let a2 : string arbin = Feuille "hello"
```

### Types recursifs

Les types les plus puissants sont recursifs : ils se referent a eux-memes.

```ocaml
(* Arbre binaire *)
type 'a arbin =
  | Feuille of 'a
  | Noeud of 'a arbin * 'a * 'a arbin

(* Arbre n-aire *)
type 'a narbr =
  | Feuille of 'a
  | Noeud of 'a * 'a narbr list

(* Formule logique *)
type formula =
  | True
  | False
  | P of string
  | Not of formula
  | And of formula * formula
  | Or of formula * formula
  | Imp of formula * formula
  | Iff of formula * formula

(* Expression arithmetique *)
type 'a expr =
  | Cst of 'a
  | Var of string
  | Add of 'a expr * 'a expr
  | Mul of 'a expr * 'a expr
```

### Record avec fonctions : l'anneau (examen 2019)

```ocaml
(* Un anneau algebrique encode dans un record *)
type 'a anneau = {
  addition : 'a -> 'a -> 'a;
  multiplication : 'a -> 'a -> 'a;
  zero : 'a;
  one : 'a;
  equal : 'a -> 'a -> bool;
}

(* L'anneau des entiers *)
let int_anneau = {
  addition = ( + );
  multiplication = ( * );
  zero = 0;
  one = 1;
  equal = ( = );
}

(* Evaluation generique d'une expression dans un anneau *)
let rec eval_expr an f e = match e with
  | Cst c -> c
  | Var s -> f s
  | Add (p, q) -> an.addition (eval_expr an f p) (eval_expr an f q)
  | Mul (p, q) -> an.multiplication (eval_expr an f p) (eval_expr an f q)
```

### Expressions lineaires (examen 2019)

```ocaml
(* Expression lineaire : constante + somme de (coeff * variable) *)
type linexpr = {cst : int; coeffs : (int * string) list}

let e = {cst = 2; coeffs = [(7, "x"); (9, "y")]}
(* Represente 2 + 7x + 9y *)

(* Evaluation avec une fonction de valuation *)
let eval_lin f le =
  let rec eval_li l = match l with
    | [] -> 0
    | (a, b) :: rest -> a * (f b) + eval_li rest
  in
  le.cst + eval_li le.coeffs

(* Trace : eval_lin (fun v -> if v = "x" then 1 else 2) e *)
(* = 2 + eval_li [(7,"x"); (9,"y")]                       *)
(* = 2 + (7 * 1 + eval_li [(9,"y")])                      *)
(* = 2 + (7 + (9 * 2 + eval_li []))                       *)
(* = 2 + (7 + (18 + 0))                                   *)
(* = 27                                                    *)
```

### Ensembles binaires (examen 2020)

```ocaml
type bit = B0 | B1
type bint = bit list
type intset = Empty | Node of intset * bool * intset

(* L'arbre encode un ensemble d'entiers binaires *)
(* Node (gauche, present, droite) :               *)
(* - present : l'entier courant est dans l'ensemble *)
(* - gauche : sous-arbre pour le bit 0             *)
(* - droite : sous-arbre pour le bit 1             *)

let rec mem s x = match s, x with
  | Empty, _ -> false
  | Node (_, b, _), [] -> b
  | Node (g, _, d), e :: rest ->
      if e = B0 then mem g rest else mem d rest
```

### Type comparison (examen 2020)

```ocaml
type comparison = EQUAL | LESSTHAN | GREATERTHAN

let cmp_int i j =
  if i = j then EQUAL
  else if i < j then LESSTHAN
  else GREATERTHAN

(* Tri par insertion generique *)
let rec add_elt cmp e l = match l with
  | [] -> [e]
  | e1 :: rest ->
      if cmp e e1 = GREATERTHAN then e1 :: (add_elt cmp e rest)
      else e :: e1 :: rest
```

---

## CHEAT SHEET -- Types algebriques

```
TYPE SOMME (VARIANT)
  type couleur = Rouge | Vert | Bleu     Enumeration
  type forme =                            Avec donnees
    | Cercle of float
    | Rect of float * float

TYPE PRODUIT
  (int * string)                          Tuple
  type point = {x: float; y: float}       Record

TYPE OPTION
  type 'a option = None | Some of 'a
  None           : pas de valeur
  Some 42        : la valeur 42

TYPES POLYMORPHES
  'a             : variable de type (generique)
  'a list        : liste de n'importe quel type
  'a option      : option de n'importe quel type
  'a arbin       : arbre de n'importe quel type

TYPES RECURSIFS
  type 'a list = [] | (::) of 'a * 'a list
  type 'a arbin = Feuille of 'a
                | Noeud of 'a arbin * 'a * 'a arbin

RECORD AVEC FONCTIONS
  type 'a anneau = {
    addition : 'a -> 'a -> 'a;
    zero : 'a;
  }
  let r = {addition = (+); zero = 0}
  r.addition 3 4 = 7

PATTERN MATCHING SUR VARIANTS
  match expr with
  | Cercle r -> ...
  | Rect (w, h) -> ...

PATTERN MATCHING SUR OPTION
  match opt with
  | None -> ...
  | Some x -> ...
```
