---
title: "Chapitre 4 -- Fonctions d'ordre superieur"
sidebar_position: 4
---

# Chapitre 4 -- Fonctions d'ordre superieur

## Theorie

Une fonction d'ordre superieur (HOF) est une fonction qui prend une autre fonction en argument ou qui retourne une fonction. C'est le coeur de la programmation fonctionnelle.

### Fonctions comme valeurs

```ocaml
(* Une fonction est une valeur comme une autre *)
let f = fun x -> x + 1
(* val f : int -> int *)

(* On peut la stocker dans une structure *)
let paire_de_fonctions = (sin, cos)
(* val paire_de_fonctions : (float -> float) * (float -> float) *)

(* On peut la passer en argument *)
let appliquer f x = f x
(* val appliquer : ('a -> 'b) -> 'a -> 'b *)
```

### Currying (curryfication)

En OCaml, toute fonction a plusieurs parametres est en realite une chaine de fonctions a un seul parametre.

```ocaml
let add x y = x + y
(* est syntaxiquement equivalent a : *)
let add = fun x -> fun y -> x + y
(* val add : int -> int -> int *)

(* add 3 retourne une FONCTION qui ajoute 3 *)
let ajouter3 = add 3
(* val ajouter3 : int -> int *)
let _ = ajouter3 7  (* = 10 *)
```

### Application partielle

Appliquer une fonction a seulement certains de ses arguments :

```ocaml
let mul x y = x * y
let double = mul 2       (* application partielle *)
let triple = mul 3

let _ = double 5  (* = 10 *)
let _ = triple 5  (* = 15 *)

(* Utile avec les HOF *)
let _ = List.map (mul 2) [1; 2; 3]  (* = [2; 4; 6] *)
```

### Fonctions anonymes (lambda)

```ocaml
(* Syntaxe : fun param -> corps *)
let _ = (fun x -> x * x) 5      (* = 25 *)

(* Souvent utilisees avec les HOF *)
let _ = List.map (fun x -> x + 1) [1; 2; 3]  (* = [2; 3; 4] *)
let _ = List.filter (fun x -> x > 2) [1; 2; 3; 4]  (* = [3; 4] *)
```

### List.map

Applique une fonction a chaque element d'une liste.

```ocaml
(* val List.map : ('a -> 'b) -> 'a list -> 'b list *)

let _ = List.map (fun x -> x * 2) [1; 2; 3]
(* = [2; 4; 6] *)

let _ = List.map string_of_int [1; 2; 3]
(* = ["1"; "2"; "3"] *)

(* Implementation : *)
let rec map f l = match l with
  | [] -> []
  | e :: rest -> (f e) :: (map f rest)
```

### List.filter

Garde seulement les elements satisfaisant un predicat.

```ocaml
(* val List.filter : ('a -> bool) -> 'a list -> 'a list *)

let _ = List.filter (fun x -> x mod 2 = 0) [1; 2; 3; 4; 5; 6]
(* = [2; 4; 6] *)

(* Implementation : *)
let rec filter p l = match l with
  | [] -> []
  | e :: rest ->
    if p e then e :: (filter p rest)
    else filter p rest
```

### List.fold_right

Combine les elements d'une liste de droite a gauche.

```ocaml
(* val List.fold_right : ('a -> 'b -> 'b) -> 'a list -> 'b -> 'b *)
(* fold_right f [a; b; c] init = f a (f b (f c init)) *)

(* Somme *)
let _ = List.fold_right (fun x acc -> x + acc) [1; 2; 3] 0
(* = f 1 (f 2 (f 3 0))    ou f = fun x acc -> x + acc *)
(* = 1 + (2 + (3 + 0))                                 *)
(* = 6                                                  *)

(* Concatenation *)
let _ = List.fold_right (fun x acc -> x :: acc) [1; 2; 3] [4; 5]
(* = 1 :: (2 :: (3 :: [4; 5]))  *)
(* = [1; 2; 3; 4; 5]            *)
```

### List.fold_left

Combine les elements de gauche a droite (souvent plus efficace, recursion terminale).

```ocaml
(* val List.fold_left : ('b -> 'a -> 'b) -> 'b -> 'a list -> 'b *)
(* fold_left f init [a; b; c] = f (f (f init a) b) c *)

let _ = List.fold_left (fun acc x -> acc + x) 0 [1; 2; 3]
(* = ((0 + 1) + 2) + 3  *)
(* = 6                   *)

(* Trace detaillee : fold_left (+) 0 [1; 2; 3] *)
(* = fold_left (+) (0 + 1) [2; 3]               *)
(* = fold_left (+) 1 [2; 3]                      *)
(* = fold_left (+) (1 + 2) [3]                   *)
(* = fold_left (+) 3 [3]                          *)
(* = fold_left (+) (3 + 3) []                     *)
(* = fold_left (+) 6 []                            *)
(* = 6                                             *)
```

### Composition de fonctions

```ocaml
(* Composition manuelle *)
let compose f g x = f (g x)
(* val compose : ('b -> 'c) -> ('a -> 'b) -> 'a -> 'c *)

(* L'operateur |> (pipe) *)
let _ = 5 |> (fun x -> x + 1) |> (fun x -> x * 2)
(* = (5 + 1) * 2 = 12 *)

(* L'operateur @@ (application) *)
let _ = string_of_int @@ 3 + 4
(* = string_of_int 7 = "7" *)
```

### Generalisation avec HOF : sigma2, sigma3, sigma4

Le cours montre comment generaliser une sommation :

```ocaml
(* sigma2 : appliquer f avant de sommer *)
let rec sigma2 f (a, b) =
  if a > b then 0
  else f a + sigma2 f (succ a, b)
(* val sigma2 : (int -> int) -> int * int -> int *)

let _ = sigma2 (fun x -> 2 * x) (-2, 4)
(* = 2*(-2) + 2*(-1) + 2*0 + 2*1 + 2*2 + 2*3 + 2*4 *)
(* = -4 + -2 + 0 + 2 + 4 + 6 + 8 = 14 *)
```

### appliquepaire : HOF sur les paires

```ocaml
let appliquepaire f p = (f (fst p), f (snd p))
(* val appliquepaire : ('a -> 'b) -> 'a * 'a -> 'b * 'b *)

(* Incrementer les deux elements *)
let incrpaire2 p = appliquepaire (fun x -> x + 1) p
(* val incrpaire2 : int * int -> int * int *)

(* Trace : incrpaire2 (4, 18) *)
(* = appliquepaire (fun x -> x + 1) (4, 18) *)
(* = ((fun x -> x + 1) 4, (fun x -> x + 1) 18) *)
(* = (5, 19) *)
```

### rapport : HOF avec division

```ocaml
let rapport (f, g) x = f x /. g x
(* val rapport : (('a -> float) * ('a -> float)) -> 'a -> float *)

let mytan x = rapport (sin, cos) x
(* val mytan : float -> float *)

(* Trace : mytan 0. *)
(* = rapport (sin, cos) 0. *)
(* = sin 0. /. cos 0.      *)
(* = 0. /. 1.              *)
(* = 0.                    *)
```

### Conversion binaire avec fold_right (examen 2020)

```ocaml
type bit = B0 | B1
type bint = bit list

let int_of_bit b = match b with
  | B0 -> 0
  | B1 -> 1

let int_of_bint l =
  List.fold_right (fun x y -> int_of_bit x + 2 * y) l 0

(* Trace : int_of_bint [B1; B0; B1]  (= 5 en binaire) *)
(* = fold_right f [B1; B0; B1] 0 *)
(* = f B1 (f B0 (f B1 0))        *)
(* = f B1 (f B0 (1 + 2*0))       *)
(* = f B1 (f B0 1)               *)
(* = f B1 (0 + 2*1)              *)
(* = f B1 2                      *)
(* = 1 + 2*2                     *)
(* = 5                           *)
```

### Insert dans chaque sous-liste

```ocaml
let rec insert j ll = match ll with
  | [] -> []
  | l :: ll' -> (j :: l) :: (insert j ll')
(* val insert : 'a -> 'a list list -> 'a list list *)

(* Equivalent avec map : *)
let insert j ll = List.map (fun l -> j :: l) ll

(* Trace : insert 1 [[3; 5]; [7; 3; 9]; []; [6]] *)
(* = [1 :: [3; 5]; 1 :: [7; 3; 9]; 1 :: []; 1 :: [6]] *)
(* = [[1; 3; 5]; [1; 7; 3; 9]; [1]; [1; 6]] *)
```

---

## CHEAT SHEET -- Fonctions d'ordre superieur

```
FONCTIONS ANONYMES
  fun x -> expr               Lambda a 1 parametre
  fun x y -> expr             Lambda a 2 parametres

APPLICATION PARTIELLE
  let f x y = x + y
  let g = f 3                 g : int -> int, g y = 3 + y

CURRYING
  f : 'a -> 'b -> 'c         est en fait  f : 'a -> ('b -> 'c)
  f x : 'b -> 'c             application partielle

LIST.MAP
  List.map f [a; b; c] = [f a; f b; f c]
  Type : ('a -> 'b) -> 'a list -> 'b list

LIST.FILTER
  List.filter p [a; b; c] = elements ou p est true
  Type : ('a -> bool) -> 'a list -> 'a list

LIST.FOLD_RIGHT
  fold_right f [a; b; c] init = f a (f b (f c init))
  Type : ('a -> 'b -> 'b) -> 'a list -> 'b -> 'b
  Sens : droite -> gauche

LIST.FOLD_LEFT
  fold_left f init [a; b; c] = f (f (f init a) b) c
  Type : ('b -> 'a -> 'b) -> 'b -> 'a list -> 'b
  Sens : gauche -> droite (recursion terminale)

PIPE ET APPLICATION
  x |> f        = f x          Pipe (gauche a droite)
  f @@ x        = f x          Application (droite a gauche)
  x |> f |> g   = g (f x)      Chainee
```
