---
title: "TP5 - Operations sur les listes"
sidebar_position: 5
---

# TP5 - Operations sur les listes

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp5/README.md`

---

## Exercice 1

### Operations de base : `longueur`, `appartient`, `rang`, `rang_opt`

**Reponse :**
```ocaml
(* Longueur d'une liste *)
let rec longueur l = match l with
  | [] -> 0
  | e :: r -> 1 + longueur r

(* Verifier l'appartenance *)
let rec appartient e l = match l with
  | [] -> false
  | e1 :: tl -> if e1 = e then true else appartient e tl

(* Trouver l'indice, retourne 0 si non trouve *)
let rec rang e l = match l with
  | [] -> 0
  | e1 :: tl ->
      if e1 = e then 1
      else if rang e tl = 0 then 0
      else 1 + rang e tl

(* Type option pour l'indexation sure *)
type 'a option = None | Some of 'a

(* Trouver l'indice sous forme de type option *)
let rec rang_opt e l = match l with
  | [] -> None
  | e1 :: tl ->
      if e1 = e then Some 1
      else match rang_opt e tl with
        | None -> None
        | Some c -> Some (c + 1)
```

**Test utop :**
```
# longueur [1; 2; 3];;
- : int = 3
# longueur [];;
- : int = 0
# appartient 4 [1; 2; 3];;
- : bool = false
# appartient 2 [1; 2; 3];;
- : bool = true
# rang 2 [3; 2; 1];;
- : int = 2
# rang 5 [3; 2; 1];;
- : int = 0
# rang_opt 2 [3; 2; 1];;
- : int option = Some 2
# rang_opt 0 [3; 2; 1];;
- : int option = None
```

---

## Exercice 2

### Concatenation de listes (`concatl`)

**Reponse :**
```ocaml
let rec concatl l1 l2 = match l1, l2 with
  | [], l2 -> l2
  | l1, [] -> l1
  | e1 :: tl, l2 -> e1 :: (concatl tl l2)
```

**Test utop :**
```
# concatl [1; 2; 3] [4; 5; 6];;
- : int list = [1; 2; 3; 4; 5; 6]
# concatl [] [1; 2];;
- : int list = [1; 2]
# concatl [1; 2] [];;
- : int list = [1; 2]
```

---

## Exercice 3

### Decoupage de listes : `debliste` (n premiers elements) et `finliste` (n derniers elements)

**Reponse :**
```ocaml
(* Les n premiers elements *)
let rec debliste l n = match l, n with
  | [], _ -> l
  | _, 0 -> []
  | e1 :: tl, n -> e1 :: debliste tl (n - 1)

(* Les n derniers elements *)
let rec finliste l n = match l with
  | [] -> []
  | e :: tl ->
      if n >= longueur l then l
      else finliste tl n
```

**Test utop :**
```
# debliste [1; 2; 3; 4; 5; 6; 7] 3;;
- : int list = [1; 2; 3]
# finliste [1; 2; 3; 4; 5; 6; 7] 3;;
- : int list = [5; 6; 7]
# debliste [1; 2] 5;;
- : int list = [1; 2]
# finliste [] 3;;
- : int list = []
```

---

## Exercice 4

### Remplacer toutes les occurrences de `x` par `y` dans une liste (`remplace`)

**Reponse :**
```ocaml
let rec remplace x y l = match l with
  | [] -> []
  | e1 :: tl ->
      if e1 = x then y :: (remplace x y tl)
      else e1 :: (remplace x y tl)
```

**Test utop :**
```
# remplace 2 42 [1; 2; 3; 2; 5];;
- : int list = [1; 42; 3; 42; 5]
# remplace "a" "z" ["a"; "b"; "a"];;
- : string list = ["z"; "b"; "z"]
```

---

## Exercice 5

### Operations sur les sous-listes : `entete`, `sousliste`, `oter`

**Reponse :**
```ocaml
(* Verifier si l est un prefixe de l1 *)
let rec entete l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 then entete t1 t2 else false

(* Verifier si l apparait comme sous-liste contigue dans l1 *)
let rec sousliste l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 then
        if entete t1 t2 then true
        else sousliste l t2
      else sousliste l t2

(* Retirer le prefixe l de l1 si l est un prefixe *)
let oter l l1 =
  if entete l l1 then
    let rec hotter la lb = match la, lb with
      | [], lb -> lb
      | e1 :: t1, e2 :: t2 -> hotter t1 t2
      | _ -> failwith "Impossible case"
    in
    hotter l l1
  else l1
```

**Test utop :**
```
# entete [1; 2; 3] [1; 2; 3; 2; 5];;
- : bool = true
# entete [1; 2; 4] [1; 2; 3; 2; 5];;
- : bool = false
# sousliste [2; 3; 2] [2; 1; 2; 3; 2; 5];;
- : bool = true
# sousliste [1; 2; 1] [1; 1; 2; 1; 4; 5; 6];;
- : bool = true
# oter [1; 2; 3] [1; 2; 3; 2; 5];;
- : int list = [2; 5]
# oter [1; 2; 4] [1; 2; 3; 2; 5];;
- : int list = [1; 2; 3; 2; 5]
```

---

## Exercice 6

### Remplacement avance : `remplacel` et `supprimel`

`remplacel l1 l2 l` remplace toutes les occurrences de la sous-liste `l1` par `l2` dans `l`.
`supprimel l1 l` supprime toutes les occurrences de la sous-liste `l1` dans `l`.

**Reponse :**
```ocaml
(* Remplacer toutes les occurrences de la sous-liste l1 par l2 dans l *)
let rec remplacel l1 l2 l = match l with
  | [] -> []
  | e2 :: t2 ->
      if entete l1 l then
        concatl l2 (remplacel l1 l2 (oter l1 l))
      else e2 :: remplacel l1 l2 t2

(* Supprimer toutes les occurrences de la sous-liste l1 dans l *)
let supprimel l1 l = match l1 with
  | [] -> l
  | _ -> remplacel l1 [] l
```

**Test utop :**
```
# remplacel [1; 2; 1] [5; 6] [4; 1; 2; 1; 2; 1; 2; 1; 3; 8];;
- : int list = [4; 5; 6; 2; 5; 6; 2; 5; 6; 3; 8]
# supprimel [1; 2; 1] [4; 1; 2; 1; 2; 1; 3; 8];;
- : int list = [4; 2; 1; 3; 8]
# supprimel [] [1; 2; 3];;
- : int list = [1; 2; 3]
```
