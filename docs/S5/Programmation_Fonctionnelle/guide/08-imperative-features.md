---
title: "Chapitre 8 -- Traits imperatifs"
sidebar_position: 8
---

# Chapitre 8 -- Traits imperatifs

## Theorie

OCaml est principalement fonctionnel mais offre des traits imperatifs pour les cas ou la mutation est necessaire ou plus pratique : references, tableaux, boucles, E/S.

### References (variables mutables)

```ocaml
(* Creer une reference *)
let x = ref 0
(* val x : int ref = {contents = 0} *)

(* Lire la valeur *)
let v = !x      (* v = 0 *)

(* Modifier la valeur *)
x := 42          (* x contient maintenant 42 *)
let v2 = !x      (* v2 = 42 *)

(* Equivalent a une cellule mutable *)
(* type 'a ref = {mutable contents : 'a} *)
```

### Records mutables

```ocaml
type point = {mutable x : float; mutable y : float}

let p = {x = 1.0; y = 2.0}
let _ = p.x        (* 1.0 *)
p.x <- 3.0         (* mutation *)
let _ = p.x        (* 3.0 *)
```

### Sequences d'effets

L'operateur `;` enchaine des expressions en executant la premiere pour ses effets et retournant la seconde.

```ocaml
let _ =
  print_string "hello ";
  print_string "world";
  print_newline ()
(* Affiche : hello world *)

(* Avec une reference *)
let compteur () =
  let n = ref 0 in
  fun () ->
    n := !n + 1;
    !n
(* val compteur : unit -> unit -> int *)
```

### Boucles

```ocaml
(* Boucle for *)
for i = 1 to 5 do
  Printf.printf "%d " i
done
(* Affiche : 1 2 3 4 5 *)

(* Boucle while *)
let n = ref 10
while !n > 0 do
  Printf.printf "%d " !n;
  n := !n - 1
done
(* Affiche : 10 9 8 7 6 5 4 3 2 1 *)
```

### Tableaux (arrays)

```ocaml
(* Creation *)
let a = [|1; 2; 3; 4; 5|]
(* val a : int array *)

let b = Array.make 10 0    (* 10 elements a 0 *)
let c = Array.init 5 (fun i -> i * i)  (* [|0; 1; 4; 9; 16|] *)

(* Acces : O(1) *)
let x = a.(0)     (* x = 1 *)

(* Modification : O(1) *)
a.(0) <- 42       (* a = [|42; 2; 3; 4; 5|] *)

(* Longueur *)
let n = Array.length a   (* n = 5 *)
```

### Exceptions

Les exceptions sont le mecanisme d'erreur en OCaml.

```ocaml
(* Declarer une exception *)
exception FileVide
exception Erreur of string

(* Lever une exception *)
let dequeue = function
  | [] -> raise FileVide
  | e :: r -> (e, r)

(* Attraper une exception *)
let safe_dequeue l =
  try
    let (e, r) = dequeue l in
    Some (e, r)
  with FileVide -> None

(* failwith est un raccourci *)
let _ = failwith "message"
(* equivalent a : raise (Failure "message") *)
```

### Exemples du cours

#### Compteur d'occurrences (examen 2021)

```ocaml
(* Compter et supprimer un element *)
let rec count_and_remove x = function
  | [] -> ([], 0)
  | e :: r ->
    let file, n = count_and_remove x r in
    ((if e = x then [] else [e]) @ file,
     (if e = x then 1 else 0) + n)

let _ = count_and_remove 'A' ['A';'B';'A';'A';'C';'B']
(* = (['B';'C';'B'], 3) *)
```

#### File d'attente avec effets (examen 2021)

```ocaml
type 'a file = 'a list

let enqueue x file = file @ [x]

exception FileVide
let dequeue = function
  | [] -> raise FileVide
  | e :: r -> e, r

let nb_elem file =
  List.fold_right (fun _ acc -> 1 + acc) file 0
```

#### Evaluation d'un programme (examen 2023)

```ocaml noexec
type state = (qname * int) list

let rec get st q = match st with
  | [] -> None
  | (hx, hy) :: t -> if hx = q then Some hy else get t q

let rec set st q i = match st with
  | [] -> [(q, i)]
  | (hx, hy) :: t ->
      if hx = q then (hx, i) :: t
      else (hx, hy) :: (set t q i)

(* L'etat est immutable -- on cree un nouvel etat a chaque fois *)
let rec eprog st p = match p with
  | Skip -> Some st
  | Assign (x, exp) ->
      (match eexpr st exp with
       | None -> None
       | Some y -> Some (set st x y))
  | If (exp, p1, p2) ->
      (match eexpr st exp with
       | None -> None
       | Some x -> if x = 0 then eprog st p2 else eprog st p1)
  | Seq (p1, p2) ->
      (match eprog st p1 with
       | None -> None
       | Some newSt -> eprog newSt p2)
```

### Quand utiliser l'imperatif

| Situation | Fonctionnel | Imperatif |
|-----------|-------------|-----------|
| Transformation de donnees | map, filter, fold | Non necessaire |
| Compteur/accumulateur | Accumulateur dans la recursion | ref |
| Affichage | Printf a la fin | Printf au fur et a mesure |
| Aleatoire | Random.int | Random.int (identique) |
| Performance critique | Parfois insuffisant | Tableaux mutables |
| Graphisme | Non applicable | Necessaire |

En general : **preferer le fonctionnel** sauf pour les entrees/sorties et les cas ou la performance l'exige.

---

## CHEAT SHEET -- Traits imperatifs

```
REFERENCES
  let x = ref 0         Creer
  !x                     Lire    (= x.contents)
  x := 42               Ecrire  (= x.contents <- 42)

RECORDS MUTABLES
  type t = {mutable x: int}
  let r = {x = 0}
  r.x <- 42             Mutation de champ

SEQUENCES
  e1; e2                 Executer e1, retourner e2
  begin e1; e2 end       Bloc de sequences

BOUCLES
  for i = a to b do ... done     Boucle for croissante
  for i = b downto a do ... done Boucle for decroissante
  while cond do ... done         Boucle while

TABLEAUX
  [|1; 2; 3|]           Creation litterale
  Array.make n v         Creation (n elements valant v)
  Array.init n f         Creation (f(0), f(1), ..., f(n-1))
  a.(i)                  Acces en O(1)
  a.(i) <- v             Modification en O(1)
  Array.length a         Longueur

EXCEPTIONS
  exception E            Declaration
  exception E of string  Avec donnee
  raise E                Lever
  raise (E "msg")        Lever avec donnee
  try ... with E -> ...  Attraper
  failwith "msg"         Raccourci pour raise (Failure "msg")

AFFICHAGE
  print_int n            Afficher un entier
  print_string s         Afficher une chaine
  print_newline ()       Saut de ligne
  Printf.printf "%d %s" n s  Affichage formate
```
