---
title: "Chapitre 7 -- Modules et Foncteurs"
sidebar_position: 7
---

# Chapitre 7 -- Modules et Foncteurs

## Theorie

Les modules permettent d'organiser le code en unites logiques avec des interfaces claires. Les foncteurs sont des "fonctions sur les modules" : ils prennent un module en parametre et produisent un module.

### Modules de base

Un module regroupe des types et des fonctions :

```ocaml
(* Declaration d'un module *)
module MathUtils = struct
  let pi = 3.14159
  let square x = x *. x
  let circle_area r = pi *. square r
end

(* Utilisation *)
let _ = MathUtils.pi            (* 3.14159 *)
let _ = MathUtils.circle_area 2. (* 12.566... *)

(* Ouvrir un module pour acceder directement *)
open MathUtils
let _ = circle_area 2.
```

### Signatures (interfaces)

Une signature declare ce qu'un module expose, sans les details d'implementation :

```ocaml
(* Signature : ce qui est visible de l'exterieur *)
module type STACK = sig
  type 'a t
  val empty : 'a t
  val push : 'a -> 'a t -> 'a t
  val pop : 'a t -> ('a * 'a t) option
  val is_empty : 'a t -> bool
end

(* Implementation *)
module ListStack : STACK = struct
  type 'a t = 'a list
  let empty = []
  let push x s = x :: s
  let pop = function
    | [] -> None
    | x :: rest -> Some (x, rest)
  let is_empty s = (s = [])
end
```

Le type `'a t` est **abstrait** dans la signature : les utilisateurs ne savent pas que c'est une liste.

### Foncteurs

Un foncteur prend un module en parametre et produit un nouveau module :

```ocaml
(* Module type pour les elements comparables *)
module type ORDERED = sig
  type t
  val compare : t -> t -> int
end

(* Foncteur qui cree un ensemble trie *)
module MakeSet (Elt : ORDERED) = struct
  type t = Elt.t list

  let empty = []

  let rec add x = function
    | [] -> [x]
    | h :: rest as l ->
        let c = Elt.compare x h in
        if c = 0 then l
        else if c < 0 then x :: l
        else h :: add x rest

  let rec mem x = function
    | [] -> false
    | h :: rest ->
        let c = Elt.compare x h in
        if c = 0 then true
        else if c < 0 then false
        else mem x rest
end

(* Instantiation du foncteur *)
module IntSet = MakeSet(struct
  type t = int
  let compare = compare
end)

let s = IntSet.add 3 (IntSet.add 1 (IntSet.add 2 IntSet.empty))
(* s contient {1; 2; 3} *)
```

### Modules dans le cours : l'anneau algebrique

L'examen 2019 utilise un pattern similaire avec des records de fonctions (une alternative legere aux foncteurs) :

```ocaml noexec
(* Au lieu d'un foncteur, on utilise un record *)
type 'a anneau = {
  addition : 'a -> 'a -> 'a;
  multiplication : 'a -> 'a -> 'a;
  zero : 'a;
  one : 'a;
  equal : 'a -> 'a -> bool;
}

let int_anneau = {
  addition = ( + );
  multiplication = ( * );
  zero = 0;
  one = 1;
  equal = ( = );
}

(* On parametrise les fonctions par l'anneau *)
let rec eval_expr an f e = match e with
  | Cst c -> c
  | Var s -> f s
  | Add (e1, e2) -> an.addition (eval_expr an f e1) (eval_expr an f e2)
  | Mul (e1, e2) -> an.multiplication (eval_expr an f e1) (eval_expr an f e2)
```

### Modules standard utiles

```ocaml noexec
(* List : operations sur les listes *)
List.map, List.filter, List.fold_left, List.fold_right
List.sort, List.mem, List.assoc, List.length
List.rev, List.concat, List.for_all, List.exists

(* String : operations sur les chaines *)
String.length, String.sub, String.concat
String.make, String.get

(* Printf : affichage formate *)
Printf.printf "x = %d, y = %s\n" 42 "hello"
Printf.sprintf "resultat: %f" 3.14  (* retourne un string *)

(* Random : nombres aleatoires *)
Random.int 10    (* entier entre 0 et 9 *)
Random.float 1.0 (* flottant entre 0. et 1. *)
```

### include pour etendre un module

```ocaml
module ExtendedList = struct
  include List  (* importe tout de List *)

  (* Ajouter de nouvelles fonctions *)
  let sum l = fold_left ( + ) 0 l
  let product l = fold_left ( * ) 1 l
end
```

---

## CHEAT SHEET -- Modules et Foncteurs

```
MODULE
  module M = struct          Declaration
    let x = 42
    type t = ...
  end
  M.x                        Acces qualifie
  open M                     Ouvrir (tout importer)

SIGNATURE
  module type S = sig        Interface
    type t
    val f : t -> t
  end
  module M : S = struct      Implementation contrainte
    type t = int
    let f x = x + 1
  end

FONCTEUR
  module F (X : S) = struct  Foncteur
    ...utilise X.t, X.f...
  end
  module M = F(MonModule)    Instanciation

INCLUDE
  include M                  Importer tout un module

ALTERNATIVE AUX FONCTEURS
  type 'a ops = {             Record de fonctions
    zero : 'a;
    add : 'a -> 'a -> 'a;
  }
  Plus simple, souvent suffisant

MODULES STANDARD
  List     : map, filter, fold, sort, mem, assoc
  String   : length, sub, concat, make
  Printf   : printf, sprintf
  Random   : int, float
```
