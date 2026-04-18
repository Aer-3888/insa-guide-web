---
title: "TP8 - Jeu de cartes (variante graphique)"
sidebar_position: 8
---

# TP8 - Jeu de cartes (variante graphique)

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp8/README.md`

Similaire au TP3 mais avec un variant de type tuple `Carte of haut * coul` au lieu du record `{h: haut; c: coul}`.

---

## Definitions de types

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = Carte of haut * coul    (* variant avec tuple au lieu de record *)
```

---

## Exercice 1

### Construction de cartes avec variants de type tuple

Les accesseurs utilisent `let Carte (_, col) = c in col` au lieu de `c.c`.

**Reponse :**
```ocaml
(* Extraire la couleur d'une carte *)
let coul c = let Carte (_, col) = c in col

(* Extraire la hauteur d'une carte *)
let haut c = let Carte (h, _) = c in h
```

**Test utop :**
```
# coul (Carte (As, Coeur));;
- : coul = Coeur
# haut (Carte (Valet, Pique));;
- : haut = Valet
```

---

## Exercice 2

### Fonctions de conversion et constructeur de carte

**Reponse :**
```ocaml
(* Convertir un entier en hauteur de carte *)
let haut_of_int i = match i with
  | 7 -> Sept | 8 -> Huit | 9 -> Neuf | 10 -> Dix
  | 11 -> Valet | 12 -> Dame | 13 -> Roi | 14 -> As
  | _ -> failwith "Invalid card height"

(* Convertir une chaine en couleur de carte *)
let coul_of_string s = match s with
  | "Coeur" -> Coeur | "Trefle" -> Trefle
  | "Pique" -> Pique | "Carreau" -> Carreau
  | _ -> failwith "Invalid card suit"

(* Creer une carte avec le constructeur Carte *)
let carte i s = Carte (haut_of_int i, coul_of_string s)
```

**Test utop :**
```
# carte 8 "Trefle";;
- : carte = Carte (Huit, Trefle)
# haut (carte 8 "Trefle") = Huit;;
- : bool = true
# coul (carte 14 "Trefle") = Trefle;;
- : bool = true
```

---

## Exercice 3

### Logique du jeu de reussite avec pattern matching sur les tuples de cartes

`string_of_carte` fait du pattern matching directement sur `Carte (h, col)`. La generation aleatoire utilise `List.mem` au lieu de la fonction `exist` ecrite a la main.

**Reponse :**
```ocaml
(* Afficher une carte avec pattern matching sur Carte *)
let string_of_carte c = match c with
  | Carte (h, col) ->
      let hstring = match h with
        | Sept -> "Sept" | Huit -> "Huit" | Neuf -> "Neuf" | Dix -> "Dix"
        | Valet -> "Valet" | Dame -> "Dame" | Roi -> "Roi" | As -> "As"
      and cstring = match col with
        | Coeur -> "Coeur" | Pique -> "Pique"
        | Trefle -> "Trefle" | Carreau -> "Carreau"
      in
      hstring ^ " de " ^ cstring

(* Generer une carte aleatoire *)
let random_carte () =
  Carte (
    haut_of_int ((Random.int 8) + 7),
    match Random.int 4 with
    | 0 -> Coeur | 1 -> Trefle | 2 -> Carreau | 3 -> Pique
    | _ -> failwith "Invalid random suit"
  )

(* Ajouter une carte aleatoire unique avec List.mem *)
let rec ajtcarte l =
  if List.length l = 32 then l
  else
    let rouxscard = random_carte () in
    if List.mem rouxscard l then ajtcarte l
    else rouxscard :: l

(* Creer un jeu avec n cartes *)
let rec faitjeu n =
  if n > 32 then failwith "Maximum 32 cards"
  else if n < 0 then failwith "Negative card count"
  else if n = 0 then []
  else ajtcarte (faitjeu (n - 1))
```

**Test utop :**
```
# string_of_carte (carte 11 "Pique");;
- : string = "Valet de Pique"
# string_of_carte (carte 9 "Trefle");;
- : string = "Neuf de Trefle"
# let l1 = ajtcarte [];;
# let l2 = ajtcarte l1;;
# List.length l1, List.length l2;;
- : int * int = (1, 2)
```

---

## Exercice 4

### Reduction avec pattern matching profond sur le constructeur Carte

Le pattern matche directement dans `Carte (ah, ac)` au lieu d'extraire via les champs du record.

**Reponse :**
```ocaml
(* Une etape de reduction : pattern matching directement sur Carte (ah, ac) *)
let rec reduc l = match l with
  | (Carte (ah, ac) :: abody) :: bbody :: (Carte (ch, cc) :: cbody) :: rest_of_set ->
      if ah = ch || ac = cc then
        (bbody @ (Carte (ah, ac) :: abody)) ::
        (reduc ((Carte (ch, cc) :: cbody) :: rest_of_set))
      else
        (Carte (ah, ac) :: abody) ::
        (reduc (bbody :: (Carte (ch, cc) :: cbody) :: rest_of_set))
  | x -> x

(* Appliquer les reductions jusqu'a stabilite (comparer par longueur de liste) *)
let rec reussite l =
  let newl = reduc l in
  if List.length newl = List.length l then newl
  else reussite newl
```

**Test utop :**
```
# let p1 = [carte 14 "Trefle"; carte 10 "Coeur"];;
# let p2 = [carte 7 "Pique"; carte 11 "Carreau"];;
# let p3 = [carte 14 "Carreau"; carte 8 "Pique"];;
# let p4 = [carte 7 "Carreau"; carte 10 "Trefle"];;
# reduc [p1; p2; p3; p4] = [p2 @ p1; p3; p4];;
- : bool = true
# let p'1 = p2 @ p1;;
# let p''1 = p3 @ p'1;;
# reussite [p1; p2; p3; p4] = [p''1; p4];;
- : bool = true
```

---

## Affichage graphique (Optionnel)

Necessite la bibliotheque Graphics :
```ocaml noexec
#use "topfind";;
#require "graphics";;
open Graphics;;
```

Fonctions graphiques principales :
- `draw_carte` : dessine une carte a la position courante
- `draw_pile` : dessine une pile de cartes verticalement
- `draw_jeu` : dessine toutes les piles horizontalement
- `draw_reussite` : boucle de jeu interactive (appuyer sur 'q' pour quitter)
