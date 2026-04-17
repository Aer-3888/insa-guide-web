---
title: "Chapitre 3 -- Recursion"
sidebar_position: 3
---

# Chapitre 3 -- Recursion

## Theorie

En OCaml, les boucles `for`/`while` existent mais on utilise presque exclusivement la recursion. Une fonction recursive s'appelle elle-meme avec un sous-probleme plus petit jusqu'a atteindre un cas de base.

### Recursion simple

Le mot-cle `rec` est obligatoire pour les fonctions recursives.

```ocaml
(* Factorielle *)
let rec fact n =
  if n = 0 then 1
  else n * fact (n - 1)
(* val fact : int -> int *)

(* Trace : fact 4 *)
(* = 4 * fact 3           *)
(* = 4 * (3 * fact 2)     *)
(* = 4 * (3 * (2 * fact 1)) *)
(* = 4 * (3 * (2 * (1 * fact 0))) *)
(* = 4 * (3 * (2 * (1 * 1)))      *)
(* = 4 * (3 * (2 * 1))            *)
(* = 4 * (3 * 2)                   *)
(* = 4 * 6                         *)
(* = 24                            *)
```

### Schema recursif sur les listes

La plupart des fonctions sur les listes suivent le meme schema :

```ocaml noexec
let rec f l = match l with
  | [] -> valeur_de_base          (* Cas de base *)
  | e :: rest -> ... f rest ...   (* Cas recursif *)
```

Exemples du cours :

```ocaml
(* Somme des elements *)
let rec sigma (a, b) =
  if a > b then 0
  else a + sigma (succ a, b)
(* val sigma : int * int -> int *)

(* Trace : sigma (-2, 2) *)
(* = -2 + sigma (-1, 2)  *)
(* = -2 + (-1 + sigma (0, 2))  *)
(* = -2 + (-1 + (0 + sigma (1, 2)))  *)
(* = -2 + (-1 + (0 + (1 + sigma (2, 2))))  *)
(* = -2 + (-1 + (0 + (1 + (2 + sigma (3, 2)))))  *)
(* = -2 + (-1 + (0 + (1 + (2 + 0))))  *)
(* = 0 *)

(* Appartenance a une liste *)
let rec appartient e l = match l with
  | [] -> false
  | e1 :: tl -> if e1 = e then true else appartient e tl
(* val appartient : 'a -> 'a list -> bool *)

(* Concatenation de deux listes *)
let rec concatl l1 l2 = match l1, l2 with
  | [], l2 -> l2
  | l1, [] -> l1
  | e1 :: tl, l2 -> e1 :: (concatl tl l2)
(* val concatl : 'a list -> 'a list -> 'a list *)
```

### Recursion terminale (tail recursion)

Une fonction est en **recursion terminale** si l'appel recursif est la **derniere operation**. C'est important car OCaml optimise ces appels en evitant l'empilement de frames sur la pile.

```ocaml
(* NON terminale : on fait n * (appel recursif) *)
let rec fact n =
  if n = 0 then 1
  else n * fact (n - 1)   (* multiplication APRES l'appel *)

(* TERMINALE avec accumulateur *)
let fact n =
  let rec aux n acc =
    if n = 0 then acc
    else aux (n - 1) (n * acc)  (* appel recursif = derniere op *)
  in
  aux n 1
(* val fact : int -> int *)

(* Trace : fact 4            *)
(* = aux 4 1                 *)
(* = aux 3 4     (4 * 1)     *)
(* = aux 2 12    (3 * 4)     *)
(* = aux 1 24    (2 * 12)    *)
(* = aux 0 24    (1 * 24)    *)
(* = 24                      *)
```

### Pattern accumulateur

Le pattern classique pour transformer une recursion non-terminale en terminale :

```ocaml
(* Non terminale *)
let rec longueur l = match l with
  | [] -> 0
  | e :: r -> 1 + longueur r

(* Terminale avec accumulateur *)
let longueur l =
  let rec aux l acc = match l with
    | [] -> acc
    | e :: r -> aux r (acc + 1)
  in
  aux l 0
```

### Recursion mutuelle

Deux fonctions qui s'appellent mutuellement. On utilise `and` pour les lier.

```ocaml
let rec pair n =
  if n = 0 then true else impair (pred n)
and impair n =
  if n = 0 then false else pair (pred n)
(* val pair : int -> bool *)
(* val impair : int -> bool *)

(* Trace : pair 3          *)
(* = impair 2              *)
(* = pair 1                *)
(* = impair 0              *)
(* = false                 *)
```

Ce pattern est tres utilise pour les arbres n-aires ou on a une fonction sur le noeud et une fonction sur la liste d'enfants :

```ocaml
type 'a narbr =
  | Feuille of 'a
  | Noeud of 'a * 'a narbr list

let rec compter a =
  let rec compteur a acc = match a with
    | Feuille c -> 1 + acc
    | Noeud (c, d) -> listeur d acc
  and listeur l acc = match l with
    | [] -> acc
    | e1 :: tl -> compter e1 + listeur tl acc
  in
  compteur a 0
```

### Structures de donnees recursives

Les types recursivement definis sont l'illustration naturelle de la recursion :

```ocaml
(* Liste = type recursif *)
(* type 'a list = [] | (::) of 'a * 'a list *)

(* Arbre binaire = type recursif *)
type 'a arbin =
  | Feuille of 'a
  | Noeud of 'a arbin * 'a * 'a arbin

(* La recursion sur les arbres suit la structure du type *)
let rec compter a = match a with
  | Feuille _ -> 1
  | Noeud (g, _, d) -> compter g + compter d
```

### Recursion generalisee : sigma

Le cours presente une generalisation progressive de la sommation :

```ocaml
(* sigma : somme simple *)
let rec sigma (a, b) =
  if a > b then 0
  else a + sigma (succ a, b)

(* sigma2 : avec transformation f *)
let rec sigma2 f (a, b) =
  if a > b then 0
  else f a + sigma2 f (succ a, b)

(* sigma3 : avec combinateur, pas, accumulateur *)
let rec sigma3 (f, fc) i acc (a, b) =
  if a > b then acc
  else fc (f a) (sigma3 (f, fc) i acc (a + i, b))

(* sigma4 : avec predicat d'arret et increment general *)
let rec sigma4 (f, fc) (p, fi) acc a =
  if p a then acc
  else fc (f a) (sigma4 (f, fc) (p, fi) acc (fi a))
```

Trace detaillee :

```ocaml noexec
(* sigma3 ((fun x -> 2*x), (+)) 2 0 (2, 6)   *)
(* = (+) (2*2) (sigma3 ... (4, 6))             *)
(* = (+) 4 ((+) (2*4) (sigma3 ... (6, 6)))     *)
(* = (+) 4 ((+) 8 ((+) (2*6) (sigma3 ... (8, 6)))) *)
(* = (+) 4 ((+) 8 ((+) 12 0))                  *)
(* = (+) 4 ((+) 8 12)                           *)
(* = (+) 4 20                                    *)
(* = 24                                          *)
```

### Point fixe (jqastable)

Une technique puissante : appliquer une fonction jusqu'a obtenir un point fixe.

```ocaml noexec
let rec jqastable x f =
  if f x = x then x else jqastable (f x) f
(* val jqastable : 'a -> ('a -> 'a) -> 'a *)

(* Application : tri bulle *)
let tribulle l = jqastable l unebulle
(* On applique unebulle jusqu'a ce que la liste ne change plus *)

(* Application : conjecture de Collatz *)
let _ = jqastable 13 (fun x ->
  if x = 1 then 1
  else if x mod 2 = 1 then 3 * x + 1
  else x / 2)
(* = 1 *)
```

### Integration numerique (application)

```ocaml noexec
(* Methode des rectangles *)
let integre f (a, b, dx) = dx *. cum f (a, b) dx

(* Trace : integre (fun x -> 1. /. x) (1., 2., 0.001) *)
(* Approxime l'integrale de 1/x de 1 a 2 *)
(* ≈ ln(2) ≈ 0.693 *)
```

---

## CHEAT SHEET -- Recursion

```
SCHEMA RECURSIF DE BASE
  let rec f x = match x with
  | cas_base -> valeur
  | cas_recursif -> ... f (sous_probleme) ...

RECURSION TERMINALE (avec accumulateur)
  let f x =
    let rec aux x acc = match x with
    | cas_base -> acc
    | cas_recursif -> aux (sous_probleme) (mise_a_jour acc)
    in
    aux x valeur_initiale

RECURSION MUTUELLE
  let rec f x = ... g ... 
  and g y = ... f ...

RECURSION SUR LISTES
  | [] -> base
  | e :: rest -> ... f rest ...

RECURSION SUR ARBRES BINAIRES
  | Feuille v -> base
  | Noeud (g, v, d) -> ... f g ... f d ...

RECURSION SUR ARBRES N-AIRES
  let rec f_arbre a = match a with
    | Feuille v -> ...
    | Noeud (v, enfants) -> ... f_liste enfants ...
  and f_liste l = match l with
    | [] -> ...
    | e :: rest -> ... f_arbre e ... f_liste rest ...

POINT FIXE
  let rec jqastable x f =
    if f x = x then x else jqastable (f x) f

PIEGE CLASSIQUE
  let rec f n = f (n-1) + 1   -- boucle infinie si pas de cas de base!
  Toujours verifier : le cas de base est-il atteignable?
```
