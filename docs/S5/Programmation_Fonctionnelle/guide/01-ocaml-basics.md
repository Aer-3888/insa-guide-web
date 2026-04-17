---
title: "Chapitre 1 -- Bases d'OCaml"
sidebar_position: 1
---

# Chapitre 1 -- Bases d'OCaml

## Theorie

OCaml est un langage fonctionnel fortement type avec inference de types. Contrairement a C ou Java, on n'ecrit presque jamais les types explicitement : le compilateur les deduit automatiquement.

### Expressions vs Instructions

En OCaml, tout est une **expression** qui produit une valeur. Il n'y a pas de "statements" comme en C.

```ocaml
(* En C : instruction sans valeur *)
(* int x = 5; *)

(* En OCaml : expression avec valeur *)
let x = 5        (* x : int = 5 *)
let y = x + 3    (* y : int = 8 *)
```

### Let bindings

`let` lie un nom a une valeur. C'est **immutable** : on ne peut pas modifier `x` apres.

```ocaml
(* Liaison globale *)
let pi = 3.14159
(* val pi : float = 3.14159 *)

(* Liaison locale avec let...in *)
let aire_cercle r =
  let pi = 3.14159 in
  pi *. r *. r
(* val aire_cercle : float -> float *)
```

### Types primitifs

| Type | Exemples | Operateurs |
|------|----------|------------|
| `int` | `0`, `42`, `-7` | `+`, `-`, `*`, `/`, `mod` |
| `float` | `0.`, `3.14`, `-2.5` | `+.`, `-.`, `*.`, `/.` |
| `bool` | `true`, `false` | `&&`, `\|\|`, `not` |
| `char` | `'a'`, `'Z'`, `'0'` | |
| `string` | `"hello"`, `""` | `^` (concatenation) |
| `unit` | `()` | |

**Attention** : les operateurs arithmetiques sont **differents** pour `int` et `float`. Pas de conversion implicite.

```ocaml
let a = 3 + 4       (* int : 7 *)
let b = 3.0 +. 4.0  (* float : 7.0 *)
(* let c = 3 + 4.0  -- ERREUR de type! *)
let d = float_of_int 3 +. 4.0  (* float : 7.0 *)
```

### Inference de types

Le compilateur deduit les types a partir de l'utilisation :

```ocaml
let f x = x + 1
(* Le compilateur voit (+) qui est int -> int -> int *)
(* Donc x : int et f : int -> int *)

let g x = x +. 1.0
(* Le compilateur voit (+.) qui est float -> float -> float *)
(* Donc x : float et g : float -> float *)

let h x = if x then "oui" else "non"
(* if requiert un bool, les branches retournent string *)
(* Donc h : bool -> string *)
```

### Conditionnels

`if...then...else` est une **expression** qui retourne une valeur. Les deux branches doivent avoir le meme type.

```ocaml
let vabs n = if n > 0 then n else -n
(* val vabs : int -> int *)

(* Trace d'evaluation : *)
(* vabs (-5)           *)
(* = if -5 > 0 then -5 else -(-5) *)
(* = if false then -5 else 5      *)
(* = 5                              *)

let test1 n = n >= 12 && n <= 29
(* val test1 : int -> bool *)

let test2 n = n = 2 || n = 5 || n = 9 || n = 23
(* val test2 : int -> bool *)
```

### Fonctions

Les fonctions sont des valeurs comme les autres. Plusieurs syntaxes equivalentes :

```ocaml
(* Syntaxe standard *)
let mul2 n = 2 * n
(* val mul2 : int -> int *)

(* Syntaxe avec fun (lambda) *)
let mul2 = fun n -> 2 * n
(* val mul2 : int -> int *)

(* Fonction a plusieurs parametres *)
let add x y = x + y
(* val add : int -> int -> int *)

(* Equivalent a : *)
let add = fun x -> fun y -> x + y
(* C'est le currying : une fonction qui retourne une fonction *)
```

### Tuples

Les tuples regroupent des valeurs de types potentiellement differents.

```ocaml
let p = (1, "hello", true)
(* val p : int * string * bool *)

(* Extraction avec fst/snd (seulement pour les paires) *)
let x = fst (1, 2)   (* x : int = 1 *)
let y = snd (1, 2)   (* y : int = 2 *)

(* Extraction par pattern matching (pour tout tuple) *)
let proj1 (a, b, c) = a
(* val proj1 : 'a * 'b * 'c -> 'a *)

let proj23 (a, b, c) = (b, c)
(* val proj23 : 'a * 'b * 'c -> 'b * 'c *)
```

Note sur le polymorphisme : `'a`, `'b`, `'c` sont des **variables de type**. `proj1` fonctionne pour n'importe quel type de triplet.

### Records

Les records sont des tuples nommes.

```ocaml noexec
(* Declaration du type *)
type carte = {h : haut; c : coul}

(* Creation d'une valeur *)
let c = {h = As; c = Coeur}

(* Acces aux champs *)
let hauteur = c.h    (* As *)
let couleur = c.c    (* Coeur *)
```

### Fonctions comme arguments

Les fonctions sont des valeurs et peuvent etre passees en argument.

```ocaml
let appliquepaire f p = (f (fst p), f (snd p))
(* val appliquepaire : ('a -> 'b) -> 'a * 'a -> 'b * 'b *)

(* Utilisation : *)
let _ = appliquepaire (fun x -> x + 1) (4, 18)
(* = ((fun x -> x + 1) 4, (fun x -> x + 1) 18) *)
(* = (5, 19) *)

let _ = appliquepaire (fun x -> not x) (false, true)
(* = (true, false) *)
```

### Annee bissextile -- Exemple complet

```ocaml
let bissext y =
  if y mod 400 = 0 then true
  else if y mod 100 = 0 then false
  else if y mod 4 = 0 then true
  else false
(* val bissext : int -> bool *)

(* Trace : bissext 2000 *)
(* = if 2000 mod 400 = 0 then true else ... *)
(* = if 0 = 0 then true else ...             *)
(* = if true then true else ...               *)
(* = true                                     *)

(* Trace : bissext 1900 *)
(* = if 1900 mod 400 = 0 then true else ...   *)
(* = if 300 = 0 then true else ...             *)
(* = if false then true else                   *)
(*   if 1900 mod 100 = 0 then false else ...   *)
(* = if 0 = 0 then false else ...              *)
(* = false                                     *)
```

## Regles d'inference de types -- Methode

Pour inferer le type d'une expression :

1. **Identifier les operateurs** : `+` force `int`, `+.` force `float`, `^` force `string`, `&&` force `bool`
2. **Propager les contraintes** : si `f x` retourne `int` et `x` est l'argument de `g`, alors `g` prend un `int`
3. **Les variables libres deviennent polymorphes** : si rien ne contraint le type, c'est `'a`

```ocaml
(* Exercice : quel est le type de h ? *)
let h f g x = f x /. g x

(* Raisonnement : *)
(* /. : float -> float -> float *)
(* Donc f x : float et g x : float *)
(* Donc f : 'a -> float et g : 'a -> float *)
(* x : 'a (meme argument passe aux deux) *)
(* Resultat : *)
(* val h : ('a -> float) -> ('a -> float) -> 'a -> float *)
```

---

## CHEAT SHEET -- Bases OCaml

```
TYPES PRIMITIFS
  int     : 42, -3          Ops: + - * / mod
  float   : 3.14, -2.5      Ops: +. -. *. /.
  bool    : true, false      Ops: && || not
  char    : 'a', 'Z'
  string  : "hello"          Ops: ^
  unit    : ()

LET BINDINGS
  let x = expr               Global binding
  let x = expr in body       Local binding
  let f x y = expr           Function definition
  let f = fun x -> expr      Lambda (equivalent)

TUPLES
  (1, "a", true)              Type: int * string * bool
  fst (a, b) = a              Seulement pour paires
  snd (a, b) = b              Seulement pour paires
  let (a, b, c) = triplet     Destructuration

RECORDS
  type t = {x: int; y: int}   Declaration
  let p = {x=1; y=2}          Creation
  p.x                         Acces au champ

CONDITIONNELS
  if cond then e1 else e2     Expression (pas statement!)
  e1 et e2 doivent avoir le meme type

INFERENCE DE TYPES
  + force int,  +. force float
  ^ force string,  && force bool
  Variable libre = polymorphe ('a)

CONVERSIONS
  float_of_int : int -> float
  int_of_float : float -> int
  string_of_int : int -> string
  int_of_string : string -> int
```
