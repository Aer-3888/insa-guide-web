---
title: "Chapitre 2 -- Pattern Matching"
sidebar_position: 2
---

# Chapitre 2 -- Pattern Matching

## Theorie

Le pattern matching est l'outil central d'OCaml. Il permet de deconstructeur une valeur pour en extraire les composants et d'agir differemment selon la forme de la donnee.

### Syntaxe de base

```ocaml
match expression with
| motif1 -> resultat1
| motif2 -> resultat2
| ...
```

### Patterns sur les types de base

```ocaml
(* Match sur un entier *)
let jour_semaine n = match n with
  | 1 -> "lundi"
  | 2 -> "mardi"
  | 3 -> "mercredi"
  | 4 -> "jeudi"
  | 5 -> "vendredi"
  | 6 -> "samedi"
  | 7 -> "dimanche"
  | _ -> "invalide"
(* val jour_semaine : int -> string *)

(* _ est le wildcard : il capture tout sans lier de variable *)
```

### Patterns sur les tuples

```ocaml
(* Deconstruire un tuple *)
let inv2 ((a, b), (c, d)) = (d, c)
(* val inv2 : ('a * 'b) * ('c * 'd) -> 'd * 'c *)

(* Trace d'evaluation : *)
(* inv2 ((true, 'a'), (1, "un")) *)
(* -> ((a, b), (c, d)) = ((true, 'a'), (1, "un")) *)
(* -> a = true, b = 'a', c = 1, d = "un" *)
(* -> (d, c) = ("un", 1) *)
```

### Patterns sur les variants (types somme)

```ocaml
type coul = Coeur | Trefle | Pique | Carreau

let string_of_coul c = match c with
  | Coeur -> "Coeur"
  | Trefle -> "Trefle"
  | Carreau -> "Carreau"
  | Pique -> "Pique"
(* val string_of_coul : coul -> string *)

type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As

let haut_of_int i = match i with
  | 7 -> Sept
  | 8 -> Huit
  | 9 -> Neuf
  | 10 -> Dix
  | 11 -> Valet
  | 12 -> Dame
  | 13 -> Roi
  | 14 -> As
  | _ -> failwith "Invalid card height"
(* val haut_of_int : int -> haut *)
```

### Patterns sur les records

```ocaml
type carte = {h : haut; c : coul}

(* Acces par champ *)
let coul_carte ca = ca.c

(* Acces par pattern matching *)
let string_of_carte ca = match ca with
  | {h = hauteur; c = couleur} ->
    (string_of_haut hauteur) ^ " de " ^ (string_of_coul couleur)
```

### Patterns sur les listes

Les listes sont construites avec `::` (cons) et `[]` (liste vide).

```ocaml
(* Patterns courants sur les listes *)
let describe l = match l with
  | [] -> "vide"
  | [x] -> "un element"           (* = x :: [] *)
  | [x; y] -> "deux elements"     (* = x :: y :: [] *)
  | x :: rest -> "au moins un"    (* tete :: queue *)

(* Longueur d'une liste *)
let rec longueur l = match l with
  | [] -> 0
  | e :: r -> 1 + longueur r
(* val longueur : 'a list -> int *)

(* Trace : longueur [1; 2; 3] *)
(* = 1 + longueur [2; 3]      *)
(* = 1 + 1 + longueur [3]     *)
(* = 1 + 1 + 1 + longueur []  *)
(* = 1 + 1 + 1 + 0            *)
(* = 3                         *)
```

### Patterns imbriques

On peut imbriquer les patterns pour decrire des structures complexes.

```ocaml
(* Tri bulle : comparer deux elements consecutifs *)
let rec unebulle l = match l with
  | [] -> l
  | [a] -> l
  | e1 :: e2 :: l' ->
      if e1 < e2 then e1 :: (unebulle (e2 :: l'))
      else e2 :: (unebulle (e1 :: l'))
(* val unebulle : 'a list -> 'a list *)

(* Pattern tres imbrique : jeu de reussite *)
(* Match sur une liste de listes de cartes *)
let rec reduc l = match l with
  | (e1 :: l1') :: l2 :: (e3 :: l3') :: l' ->
      if e1.c = e3.c || e1.h = e3.h then
        (l2 @ (e1 :: l1')) :: (e3 :: l3') :: l'
      else
        (e1 :: l1') :: (reduc (l2 :: (e3 :: l3') :: l'))
  | _ -> l
(* Ici on matche 3 piles consecutives et on examine *)
(* les cartes au sommet de la 1ere et 3eme pile *)
```

### Exhaustivite

Le compilateur verifie que tous les cas sont couverts. S'il manque un cas, on obtient un warning.

```ocaml
(* Warning : pattern non exhaustif *)
let tete l = match l with
  | e :: _ -> e
(* Warning 8: this pattern-matching is not exhaustive. *)
(* Cas manquant : [] *)

(* Correct : gerer tous les cas *)
let tete l = match l with
  | e :: _ -> e
  | [] -> failwith "Liste vide"
```

### Guards (when)

On peut ajouter des conditions aux patterns :

```ocaml
let rec rang e l = match l with
  | [] -> 0
  | e1 :: tl when e1 = e -> 1
  | e1 :: tl ->
      let r = rang e tl in
      if r = 0 then 0 else 1 + r
(* val rang : 'a -> 'a list -> int *)
```

### Le type option

Le type `option` est fondamental pour representer l'absence de valeur (comme `null` mais sur).

```ocaml
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

(* Trace : rang_opt 2 [3; 2; 1] *)
(* = if 3 = 2 then Some 1 else match rang_opt 2 [2; 1] with ... *)
(* rang_opt 2 [2; 1] = Some 1 (car 2 = 2)                       *)
(* = match Some 1 with Some c -> Some (c + 1)                    *)
(* = Some (1 + 1) = Some 2                                       *)
```

### Patterns sur les arbres

```ocaml
type 'a arbin =
  | Feuille of 'a
  | Noeud of 'a arbin * 'a * 'a arbin

(* Parcours infixe *)
let rec to_list a = match a with
  | Feuille b -> [b]
  | Noeud (g, c, d) -> to_list g @ [c] @ to_list d
(* val to_list : 'a arbin -> 'a list *)
```

### Match sur plusieurs valeurs

On peut matcher sur des tuples de valeurs :

```ocaml
let rec concatl l1 l2 = match l1, l2 with
  | [], l2 -> l2
  | l1, [] -> l1
  | e1 :: tl, l2 -> e1 :: (concatl tl l2)
(* val concatl : 'a list -> 'a list -> 'a list *)

(* Utile pour debliste : prendre les n premiers elements *)
let rec debliste l n = match l, n with
  | [], _ -> l
  | _, 0 -> []
  | e1 :: tl, n -> e1 :: debliste tl (n - 1)
(* val debliste : 'a list -> int -> 'a list *)
```

---

## CHEAT SHEET -- Pattern Matching

```
SYNTAXE
  match expr with
  | pattern1 -> result1
  | pattern2 -> result2
  | _ -> default                 Wildcard (attrape tout)

PATTERNS COURANTS
  42                              Constante
  x                               Variable (lie la valeur)
  _                               Wildcard (ignore la valeur)
  (a, b)                          Tuple
  (a, b, c)                       Triplet
  {champ = valeur}                Record
  Constructeur                    Variant simple
  Constructeur (x, y)             Variant avec donnees
  []                              Liste vide
  x :: rest                       Tete :: Queue
  [x]                             Liste a 1 element (= x :: [])
  [x; y]                          Liste a 2 elements
  x :: y :: rest                  Au moins 2 elements
  Some x                          Option avec valeur
  None                            Option vide

REGLES
  - Les patterns sont testes de haut en bas
  - Le premier qui matche est choisi
  - _ matche tout sans lier de variable
  - Le compilateur verifie l'exhaustivite (warning si incomplet)
  - when permet d'ajouter des gardes

ERREURS COURANTES
  | n -> ...     capture tout (comme _) car n est une nouvelle variable
  | 0 -> ...     matche seulement 0 (constante)

IDENTIKIT D'UN MATCH SUR LISTE
  let rec f l = match l with
  | [] -> cas_de_base
  | e :: rest -> ... f rest ...
```
