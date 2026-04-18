---
title: "TP7 - Arbres n-aires"
sidebar_position: 7
---

# TP7 - Arbres n-aires

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp7/README.md`

---

## Definition du type

```ocaml
type 'a narbr =
  | Feuille of 'a
  | Noeud of 'a * 'a narbr list
```

---

## Exercice 1

### Construction d'arbres et accesseurs : `feuille`, `noeud`, `valeur`, `sous_arbres`

**Reponse :**
```ocaml
(* Creer une feuille *)
let feuille v = Feuille v

(* Creer un noeud avec valeur et liste d'enfants *)
let noeud (v : 'a) (l : 'a narbr list) = Noeud (v, l)

(* Obtenir la valeur a la racine *)
let valeur a = match a with
  | Feuille d -> d
  | Noeud (c, d) -> c

(* Obtenir la liste des enfants *)
let sous_arbres a = match a with
  | Noeud (f, v) -> v
  | Feuille k -> []
```

**Test utop :**
```
# let a1 = feuille 4;;
# let a2 = noeud 3 [a1; a1];;
# valeur a1 = 4;;
- : bool = true
# valeur a2 = 3;;
- : bool = true
# sous_arbres a1 = [];;
- : bool = true
# sous_arbres a2 = [a1; a1];;
- : bool = true
```

---

## Exercice 2

### Compter le nombre total de noeuds dans l'arbre (`compter`)

Utilise la recursion mutuelle : `compteur` traite un noeud, `listeur` traite une liste d'enfants.

**Reponse :**
```ocaml
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

**Test utop :**
```
# compter a2;;
- : int = 2
# compter (feuille 42);;
- : int = 1
# let a3 = noeud 8 [a1; a2; a1];;
# compter a3;;
- : int = 4
```

---

## Exercice 3

### Trouver la longueur du plus long chemin de la racine a une feuille (`pluslongue`)

Utilise la recursion mutuelle avec `max` pour trouver la branche la plus profonde.

**Reponse :**
```ocaml
let rec pluslongue a =
  let rec arb a acc = match a with
    | Feuille f -> 1 + acc
    | Noeud (f, n) -> 1 + lis n acc
  and lis c acc = match c with
    | [] -> acc
    | e1 :: tl -> max (arb e1 acc) (lis tl acc)
  in
  arb a 0
```

**Test utop :**
```
# pluslongue a3;;
- : int = 3
# pluslongue (feuille 42);;
- : int = 1
# pluslongue a2;;
- : int = 2
```

---

## Exercice 4

### Lister tous les sous-arbres de l'arbre (`listsa`)

Collecte tous les sous-arbres (y compris la racine elle-meme) par recursion mutuelle.

**Reponse :**
```ocaml
let listsa a =
  let rec ads a = match a with
    | Feuille f -> [a]
    | Noeud (v, j) -> a :: (concat j)
  and concat e = match e with
    | [] -> []
    | e1 :: tl -> (ads e1) @ (concat tl)
  in
  ads a
```

**Test utop :**
```
# let f4 = feuille 4;;
# let f10 = feuille 10;;
# let f12 = feuille 12;;
# let f13 = feuille 13;;
# let f20 = feuille 20;;
# let f21 = feuille 21;;
# let n7 = noeud 7 [f10; f12; f13];;
# let n3 = noeud 3 [f4; n7; f20];;
# let n5 = noeud 5 [n3; f21];;
# List.sort compare (listsa n5) =
  List.sort compare [f4; f10; f12; f13; f20; f21; n7; n3; n5];;
- : bool = true
```

---

## Exercice 5

### Lister tous les chemins de la racine aux feuilles (`listbr`)

`ajout n l` ajoute la valeur `n` en tete de chaque liste de `l`. `listbr` genere tous les chemins de la racine aux feuilles.

**Reponse :**
```ocaml
(* Ajouter n en tete de chaque liste de l *)
let rec ajout n l = match l with
  | [] -> []
  | x :: reste -> [n :: x] @ (ajout n reste)

(* Tous les chemins racine-feuille *)
let listbr a =
  let rec arb a = match a with
    | Feuille f -> [[f]]
    | Noeud (v, j) -> ajout v (listeu j)
  and listeu l = match l with
    | [] -> []
    | e1 :: tl -> (arb e1) @ (listeu tl)
  in
  arb a
```

**Test utop :**
```
# listbr n5;;
- : int list list =
[[5; 3; 4]; [5; 3; 7; 10]; [5; 3; 7; 12]; [5; 3; 7; 13]; [5; 3; 20]; [5; 21]]
```

---

## Exercice 6

### Verifier si deux arbres sont structurellement egaux (`egal`)

Utilise la recursion mutuelle : `egala` compare deux arbres, `egalb` compare deux listes d'enfants.

**Reponse :**
```ocaml
let egal a b =
  let rec egala a b = match (a, b) with
    | Feuille f, Feuille slim -> if f = slim then true else false
    | Feuille f, Noeud (n, d) -> false
    | Noeud (n, d), Feuille slim -> false
    | Noeud (n, d), Noeud (v, w) ->
        if v = n then egalb d w else false
  and egalb d w = match (d, w) with
    | [], [] -> true
    | [], _ -> false
    | _, [] -> false
    | e1 :: t1, e2 :: t2 ->
        if egala e1 e2 then egalb t1 t2 else false
  in
  egala a b
```

**Test utop :**
```
# egal n5 n5;;
- : bool = true
# egal n5 n3;;
- : bool = false
# egal (feuille 4) (feuille 4);;
- : bool = true
# egal (feuille 4) (feuille 5);;
- : bool = false
```

---

## Exercice 7

### Remplacer toutes les occurrences d'un sous-arbre par un autre (`remplace`)

Utilise `egal` pour trouver les correspondances et `List.map` avec application partielle pour remplacer recursivement dans les enfants.

**Reponse :**
```ocaml
let rec remplace a1 a2 a =
  if egal a a1 then a2
  else match a with
    | Noeud (n, reste) -> Noeud (n, List.map (remplace a1 a2) reste)
    | _ -> a
```

**Test utop :**
```
# let n42 = noeud 42 [feuille 2048];;
# let expected = noeud 5 [(noeud 3 [f4; n42; f20]); f21];;
# remplace n7 n42 n5 = expected;;
- : bool = true
```
