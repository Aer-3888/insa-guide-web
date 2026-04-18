---
title: "TP3 - Jeu de cartes avec types et graphique"
sidebar_position: 3
---

# TP3 - Jeu de cartes avec types et graphique

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp3/README.md`

---

## Definitions de types

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = {h : haut; c : coul}
```

---

## Exercice 1

### Definir les types de cartes et les fonctions d'acces

**Reponse :**
```ocaml
(* Accesseur : obtenir la couleur d'une carte *)
let coul c = c.c

(* Accesseur : obtenir la hauteur d'une carte *)
let haut c = c.h
```

**Test utop :**
```
# let c = {h = As; c = Coeur};;
val c : carte = {h = As; c = Coeur}
# coul c;;
- : coul = Coeur
# haut c;;
- : haut = As
```

---

## Exercice 2

### Fonctions de conversion : `haut_of_int`, `coul_of_string`, constructeur `carte`, `string_of_carte`

**Reponse :**
```ocaml
(* Convertir un entier en hauteur de carte *)
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

(* Convertir une chaine en couleur de carte *)
let coul_of_string s = match s with
  | "Coeur" -> Coeur
  | "Trefle" -> Trefle
  | "Carreau" -> Carreau
  | "Pique" -> Pique
  | _ -> failwith "Invalid card suit"

(* Creer une carte a partir d'un entier (hauteur) et d'une chaine (couleur) *)
let carte i s = {c = coul_of_string s; h = haut_of_int i}

(* Convertir une hauteur de carte en chaine *)
let string_of_haut h = match h with
  | Sept -> "Sept"
  | Huit -> "Huit"
  | Neuf -> "Neuf"
  | Dix -> "Dix"
  | Valet -> "Valet"
  | Dame -> "Dame"
  | Roi -> "Roi"
  | As -> "As"

(* Convertir une couleur de carte en chaine *)
let string_of_coul c = match c with
  | Coeur -> "Coeur"
  | Trefle -> "Trefle"
  | Carreau -> "Carreau"
  | Pique -> "Pique"

(* Afficher une carte sous forme lisible *)
let string_of_carte c = (string_of_haut c.h) ^ " de " ^ (string_of_coul c.c)
```

**Test utop :**
```
# haut_of_int 12;;
- : haut = Dame
# coul_of_string "Pique";;
- : coul = Pique
# carte 8 "Trefle";;
- : carte = {h = Huit; c = Trefle}
# (haut (carte 8 "Trefle")) = Huit;;
- : bool = true
# (coul (carte 14 "Trefle")) = Trefle;;
- : bool = true
# string_of_carte (carte 11 "Pique");;
- : string = "Valet de Pique"
# string_of_carte (carte 9 "Trefle");;
- : string = "Neuf de Trefle"
```

---

## Exercice 3

### Generation aleatoire de cartes sans doublons

**Reponse :**
```ocaml
(* Convertir un entier en couleur *)
let coul_of_int a = match a with
  | 0 -> Coeur
  | 1 -> Trefle
  | 2 -> Carreau
  | 3 -> Pique
  | _ -> failwith "Invalid suit number"

(* Generer une carte aleatoire *)
let random_carte () =
  {c = coul_of_int (Random.int 4);
   h = haut_of_int ((Random.int 8) + 7)}

(* Verifier si une carte existe dans une liste *)
let rec exist c l = match l with
  | [] -> false
  | x :: l' -> if c = x then true else exist c l'

(* Ajouter une nouvelle carte aleatoire unique a la liste *)
let rec ajtcarte l =
  let c = random_carte () in
  if not (exist c l) then c :: l else ajtcarte l

(* Creer un jeu avec n cartes uniques, chacune formant une pile individuelle *)
let rec faitjeu n =
  if n = 0 then [] else ajtcarte (faitjeu (n - 1))
```

**Test utop :**
```
# random_carte ();;
- : carte = {h = Neuf; c = Carreau}
# exist {h=As; c=Coeur} [{h=Roi; c=Pique}; {h=As; c=Coeur}];;
- : bool = true
# exist {h=Dame; c=Trefle} [{h=Roi; c=Pique}];;
- : bool = false
# let l1 = ajtcarte [] in
  let l2 = ajtcarte l1 in
  List.length l1, List.length l2;;
- : int * int = (1, 2)
```

---

## Exercice 4

### Logique du jeu de reussite : regles de reduction

Regles : on examine les piles 3 par 3 (A, B, C). Si la carte au sommet de A et la carte au sommet de C ont la meme couleur ou la meme hauteur, la pile B est placee au-dessus de A (B @ A), et les 3 piles deviennent 2.

**Reponse :**
```ocaml
(* Une etape de reduction sur la liste de piles de cartes *)
let rec reduc l = match l with
  | (e1 :: l1') :: l2 :: (e3 :: l3') :: l' ->
      if e1.c = e3.c || e1.h = e3.h then
        (l2 @ (e1 :: l1')) :: (e3 :: l3') :: l'
      else
        (e1 :: l1') :: (reduc (l2 :: (e3 :: l3') :: l'))
  | _ -> l

(* Appliquer les reductions jusqu'a ce qu'il n'y en ait plus (point fixe) *)
let rec reussite l =
  let l' = reduc l in
  if l = l' then l else reussite l'
```

**Test utop :**
```
# let p1 = [carte 14 "Trefle";  carte 10 "Coeur"];;
# let p2 = [carte 7 "Pique";    carte 11 "Carreau"];;
# let p3 = [carte 14 "Carreau"; carte 8 "Pique"];;
# let p4 = [carte 7 "Carreau";  carte 10 "Trefle"];;
# let p'1 = p2 @ p1;;
# reduc [p1; p2; p3; p4] = [p'1; p3; p4];;
- : bool = true
# let p''1 = p3 @ p'1;;
# reussite [p1; p2; p3; p4] = [p''1; p4];;
- : bool = true
```

---

## Exercice 5 (Optionnel)

### Afficher les cartes avec le module Graphics

Necessite la bibliotheque Graphics :
```ocaml noexec
#load "graphics.cma";;
open Graphics;;
open_graph "";;
```

Cet exercice consiste a dessiner des sprites de cartes et a implementer un affichage interactif du jeu. Voir le source du TP original pour le code graphique complet.
