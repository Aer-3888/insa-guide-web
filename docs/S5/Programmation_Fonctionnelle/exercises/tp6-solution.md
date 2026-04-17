---
title: "TP6 - Binary Trees"
sidebar_position: 6
---

# TP6 - Binary Trees

> Following teacher instructions from: `data/moodle/tp/tp6/README.md`

---

## Type Definition

```ocaml
type 'a arbin =
  | Feuille of 'a
  | Noeud of 'a arbin * 'a * 'a arbin
```

---

## Exercise 1

### Tree construction: `feuille` and `noeud`

**Answer:**
```ocaml
(* Create a leaf node *)
let feuille v = Feuille v

(* Create a node with value v, left child g, right child d *)
let noeud v g d = Noeud (g, v, d)
```

**utop test:**
```
# feuille 42;;
- : int arbin = Feuille 42
# noeud 12 (feuille 5) (noeud 7 (feuille 6) (feuille 8));;
- : int arbin = Noeud (Feuille 5, 12, Noeud (Feuille 6, 7, Feuille 8))
```

---

## Exercise 2

### Count the number of leaf nodes in a tree (`compter`)

**Answer:**
```ocaml
let rec compter a = match a with
  | Feuille b -> 1
  | Noeud (g, _, d) -> compter g + compter d
```

**utop test:**
```
# let arbre_test = noeud 12 (feuille 5) (noeud 7 (feuille 6) (feuille 8));;
# compter arbre_test;;
- : int = 3
# compter (feuille 42);;
- : int = 1
```

---

## Exercise 3

### Convert tree to list using inorder traversal (`to_list`)

Inorder: left subtree, root, right subtree.

**Answer:**
```ocaml
let rec to_list a = match a with
  | Feuille b -> [b]
  | Noeud (g, c, d) -> to_list g @ [c] @ to_list d
```

**utop test:**
```
# to_list arbre_test;;
- : int list = [5; 12; 6; 7; 8]
# to_list (feuille 42);;
- : int list = [42]
```

---

## Exercise 4

### Binary search tree: `ajoutArbre` and `constr`

Insert elements maintaining BST property (left < root, right >= root). Construct BST from list.

**Answer:**
```ocaml
(* Insert element e into BST a *)
let rec ajoutArbre e a = match a with
  | Noeud (g, c, d) ->
      if e < c then Noeud (ajoutArbre e g, c, d)
      else Noeud (g, c, ajoutArbre e d)
  | Feuille b -> Noeud (Feuille "Nil", e, Feuille "Nil")

(* Construct BST from list *)
let rec constr l = match l with
  | [] -> Feuille "Nil"
  | e1 :: tl -> ajoutArbre e1 (constr tl)
```

**utop test:**
```
# let l = ["celeri"; "orge"; "mais"; "ble"; "tomate"; "soja"; "poisson"];;
# List.filter (fun s -> s <> "Nil") (to_list (constr l)) = List.sort compare l;;
- : bool = true
# List.filter (fun s -> s <> "Nil") (to_list (constr l));;
- : string list = ["ble"; "celeri"; "mais"; "orge"; "poisson"; "soja"; "tomate"]
```

---

## Exercise 5

### Assign (x, y) coordinates to each node for graphical display (`placer`)

Uses inorder traversal for x-coordinates and depth for y-coordinates.

**Answer:**
```ocaml
type coord = int * int
type 'a arbinp = (coord * 'a) arbin

let d = 5  (* Vertical spacing *)
let e = 4  (* Horizontal spacing *)

(* Count all nodes (leaves and internal) *)
let rec compterter a = match a with
  | Feuille f -> 1
  | Noeud (g, c, d) -> compterter g + compterter d + 1

(* Assign coordinates: x from inorder position, y from depth *)
let placer a =
  let rec aux a h l = match a with
    | Feuille v -> (Feuille ((l + e, h + d), v), l + e)
    | Noeud (g, v, dr) ->
        let (gauche, posg) = aux g (h + d) l in
        let (droite, posd) = aux dr (h + d) (posg + e) in
        (Noeud (gauche, ((posg + e, h + d), v), droite), posd)
  in
  let a, _ = aux a 0 0 in
  a
```

**utop test:**
```
# let t =
    noeud 'a'
      (feuille 'j')
      (noeud 'b'
         (noeud 'c'
            (noeud 'd' (feuille 'w') (feuille 'k'))
            (feuille 'z'))
         (feuille 'y'));;
# placer t = noeud ((8, 5), 'a')
     (feuille ((4, 10), 'j'))
     (noeud ((32, 10), 'b')
        (noeud ((24, 15), 'c')
           (noeud ((16, 20), 'd')
              (feuille ((12, 25), 'w'))
              (feuille ((20, 25), 'k')))
           (feuille ((28, 20), 'z')))
        (feuille ((36, 15), 'y')));;
- : bool = true
```
