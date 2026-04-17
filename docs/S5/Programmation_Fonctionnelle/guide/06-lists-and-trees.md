---
title: "Chapitre 6 -- Listes et Arbres"
sidebar_position: 6
---

# Chapitre 6 -- Listes et Arbres

## Theorie

Les listes et les arbres sont les structures de donnees centrales en OCaml. Ils sont immutables : chaque operation cree une nouvelle structure.

## Listes

### Construction et notation

```ocaml
(* Liste vide *)
let l0 = []                 (* 'a list *)

(* Cons : ajouter en tete *)
let l1 = 1 :: []            (* [1] *)
let l2 = 1 :: 2 :: 3 :: []  (* [1; 2; 3] *)

(* Notation syntaxique equivalente *)
let l3 = [1; 2; 3]          (* = 1 :: 2 :: 3 :: [] *)

(* Concatenation *)
let l4 = [1; 2] @ [3; 4]    (* [1; 2; 3; 4] *)
(* ATTENTION : @ est O(n) sur la longueur de la premiere liste *)
(* :: est O(1) *)
```

### Operations fondamentales (TP5)

```ocaml
(* Longueur *)
let rec longueur l = match l with
  | [] -> 0
  | e :: r -> 1 + longueur r
(* val longueur : 'a list -> int *)

(* Appartenance *)
let rec appartient e l = match l with
  | [] -> false
  | e1 :: tl -> if e1 = e then true else appartient e tl
(* val appartient : 'a -> 'a list -> bool *)

(* Rang (position 1-indexee) *)
let rec rang e l = match l with
  | [] -> 0
  | e1 :: tl ->
      if e1 = e then 1
      else if rang e tl = 0 then 0
      else 1 + rang e tl
(* val rang : 'a -> 'a list -> int *)

(* Kieme element (1-indexe) *)
let rec kieme k l = match (k, l) with
  | (1, a :: _) -> a
  | (n, _ :: l') -> kieme (n - 1) l'
  | (_, []) -> failwith "Index out of bounds"
(* val kieme : int -> 'a list -> 'a *)
```

### Sous-listes et remplacement (TP5)

```ocaml
(* Debut de liste : n premiers elements *)
let rec debliste l n = match l, n with
  | [], _ -> l
  | _, 0 -> []
  | e1 :: tl, n -> e1 :: debliste tl (n - 1)
(* val debliste : 'a list -> int -> 'a list *)

(* Test de prefixe *)
let rec entete l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 -> e1 = e2 && entete t1 t2
(* val entete : 'a list -> 'a list -> bool *)

(* Recherche de sous-liste *)
let rec sousliste l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 && entete t1 t2 then true
      else sousliste l t2
(* val sousliste : 'a list -> 'a list -> bool *)

(* Remplacement dans une liste *)
let rec remplace x y l = match l with
  | [] -> []
  | e1 :: tl ->
      if e1 = x then y :: (remplace x y tl)
      else e1 :: (remplace x y tl)
(* val remplace : 'a -> 'a -> 'a list -> 'a list *)
```

### Tri par quicksort (TP4)

```ocaml
(* Partition *)
let rec split v l = match l with
  | [] -> ([], [])
  | e :: l' ->
      if e < v then
        (e :: fst (split v l'), snd (split v l'))
      else
        (fst (split v l'), e :: snd (split v l'))
(* val split : 'a -> 'a list -> 'a list * 'a list *)

(* Quicksort *)
let rec qs l = match l with
  | [] -> []
  | [e] -> [e]
  | e :: l' ->
      (qs (fst (split e l'))) @ (e :: (qs (snd (split e l'))))
(* val qs : 'a list -> 'a list *)

(* Trace : qs [3; 1; 4; 2]   *)
(* pivot = 3                   *)
(* split 3 [1; 4; 2] = ([1; 2], [4]) *)
(* = (qs [1; 2]) @ [3] @ (qs [4])    *)
(* = [1; 2] @ [3] @ [4]              *)
(* = [1; 2; 3; 4]                    *)
```

### Partitions d'entiers (TP4)

```ocaml
(* Generer toutes les partitions de n *)
let partition n =
  let rec partition_faible m k = match (m, k) with
    | (0, 0) -> [[]]
    | (_, 0) -> []
    | (a, b) ->
        if b > a then partition_faible a a
        else merge (create (fun c ->
          insert c (partition_faible (a - c) c)) b)
  in
  partition_faible n n

(* partition 4 = [[4]; [3;1]; [2;2]; [2;1;1]; [1;1;1;1]] *)
```

## Arbres binaires

### Definition et construction (TP6)

```ocaml
type 'a arbin =
  | Feuille of 'a
  | Noeud of 'a arbin * 'a * 'a arbin

let feuille v = Feuille v
let noeud v g d = Noeud (g, v, d)

(* Exemple *)
let arbre_test = noeud 12 (feuille 5) (noeud 7 (feuille 6) (feuille 8))
(*       12       *)
(*      /  \      *)
(*     5    7     *)
(*         / \    *)
(*        6   8   *)
```

### Parcours d'arbres

```ocaml
(* Compter les feuilles *)
let rec compter a = match a with
  | Feuille _ -> 1
  | Noeud (g, _, d) -> compter g + compter d
(* val compter : 'a arbin -> int *)

(* Parcours infixe (gauche, racine, droite) *)
let rec to_list a = match a with
  | Feuille b -> [b]
  | Noeud (g, c, d) -> to_list g @ [c] @ to_list d
(* val to_list : 'a arbin -> 'a list *)

(* Trace : to_list arbre_test *)
(* = to_list (feuille 5) @ [12] @ to_list (noeud 7 ...) *)
(* = [5] @ [12] @ ([6] @ [7] @ [8])                      *)
(* = [5; 12; 6; 7; 8]                                    *)
```

### Arbre binaire de recherche (ABR)

```ocaml
(* Insertion dans un ABR *)
let rec ajoutArbre e a = match a with
  | Noeud (g, c, d) ->
      if e < c then Noeud (ajoutArbre e g, c, d)
      else Noeud (g, c, ajoutArbre e d)
  | Feuille _ -> Noeud (Feuille "Nil", e, Feuille "Nil")
(* val ajoutArbre : string -> string arbin -> string arbin *)

(* Construction d'un ABR a partir d'une liste *)
let rec constr l = match l with
  | [] -> Feuille "Nil"
  | e1 :: tl -> ajoutArbre e1 (constr tl)

(* Propriete : le parcours infixe d'un ABR donne les elements tries *)
let l = ["celeri"; "orge"; "mais"; "ble"; "tomate"; "soja"; "poisson"]
let _ = List.filter (fun s -> s <> "Nil") (to_list (constr l))
        = List.sort compare l  (* true *)
```

### Positionnement d'arbre (TP6)

```ocaml
type coord = int * int
type 'a arbinp = (coord * 'a) arbin

(* Placer un arbre pour l'affichage *)
let placer a =
  let rec aux a h l = match a with
    | Feuille v -> (Feuille ((l + e, h + d), v), l + e)
    | Noeud (g, v, dr) ->
        let (gauche, posg) = aux g (h + d) l in
        let (droite, posd) = aux dr (h + d) (posg + e) in
        (Noeud (gauche, ((posg + e, h + d), v), droite), posd)
  in
  let a, _ = aux a 0 0 in a
(* Utilise le parcours infixe pour les x, la profondeur pour les y *)
```

## Arbres n-aires

### Definition (TP7)

```ocaml
type 'a narbr =
  | Feuille of 'a
  | Noeud of 'a * 'a narbr list

let feuille v = Feuille v
let noeud v l = Noeud (v, l)

(* Exemple *)
let n5 = noeud 5 [noeud 3 [feuille 4; noeud 7 [feuille 10; feuille 12; feuille 13]; feuille 20]; feuille 21]
(*       5           *)
(*      / \          *)
(*     3   21        *)
(*    /|\            *)
(*   4  7  20        *)
(*     /|\           *)
(*   10 12 13        *)
```

### Operations sur arbres n-aires

```ocaml
(* Plus long chemin *)
let rec pluslongue a =
  let rec arb a acc = match a with
    | Feuille _ -> 1 + acc
    | Noeud (_, n) -> 1 + lis n acc
  and lis c acc = match c with
    | [] -> acc
    | e1 :: tl -> max (arb e1 acc) (lis tl acc)
  in
  arb a 0
(* val pluslongue : 'a narbr -> int *)

(* Tous les chemins racine -> feuille *)
let listbr a =
  let rec arb a = match a with
    | Feuille f -> [[f]]
    | Noeud (v, j) -> ajout v (listeu j)
  and listeu l = match l with
    | [] -> []
    | e1 :: tl -> (arb e1) @ (listeu tl)
  in arb a

(* listbr n5 = [[5;3;4]; [5;3;7;10]; [5;3;7;12]; *)
(*              [5;3;7;13]; [5;3;20]; [5;21]]      *)

(* Egalite structurelle *)
let egal a b =
  let rec egala a b = match (a, b) with
    | Feuille f, Feuille g -> f = g
    | Noeud (n, d), Noeud (v, w) -> n = v && egalb d w
    | _ -> false
  and egalb d w = match (d, w) with
    | [], [] -> true
    | e1 :: t1, e2 :: t2 -> egala e1 e2 && egalb t1 t2
    | _ -> false
  in egala a b

(* Remplacement de sous-arbre *)
let rec remplace a1 a2 a =
  if egal a a1 then a2
  else match a with
    | Noeud (n, reste) -> Noeud (n, List.map (remplace a1 a2) reste)
    | _ -> a
```

---

## CHEAT SHEET -- Listes et Arbres

```
LISTES
  []                 Liste vide
  e :: l             Cons (ajout en tete, O(1))
  [1; 2; 3]         Notation syntaxique
  l1 @ l2            Concatenation (O(n) sur l1)
  List.length l      Longueur
  List.mem e l       Appartenance
  List.nth l i       i-eme element (0-indexe)
  List.rev l         Inverser
  List.sort cmp l    Trier
  List.assoc k l     Chercher dans liste d'association

SCHEMA RECURSIF SUR LISTE
  let rec f l = match l with
  | [] -> base
  | e :: rest -> ... e ... f rest ...

ARBRE BINAIRE
  type 'a arbin =
    | Feuille of 'a
    | Noeud of 'a arbin * 'a * 'a arbin

  Parcours infixe  : gauche, racine, droite
  Parcours prefixe : racine, gauche, droite
  Parcours postfixe: gauche, droite, racine

ABR (ARBRE BINAIRE DE RECHERCHE)
  - Gauche < Racine < Droite
  - Parcours infixe = liste triee
  - Insertion : comparer et descendre

ARBRE N-AIRE
  type 'a narbr =
    | Feuille of 'a
    | Noeud of 'a * 'a narbr list

  Recursion mutuelle :
    f_noeud traite un noeud
    f_liste traite la liste d'enfants

COMPLEXITE
  :: (cons)       O(1)
  @ (concat)      O(n)
  List.length     O(n)
  List.nth        O(n)
  List.rev        O(n)
  List.sort       O(n log n)
```
