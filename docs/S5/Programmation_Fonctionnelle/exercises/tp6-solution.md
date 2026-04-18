---
title: "TP6 - Arbres binaires"
sidebar_position: 6
---

# TP6 - Arbres binaires

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp6/README.md`

---

## Definition du type

```ocaml
type 'a arbin =
  | Feuille of 'a
  | Noeud of 'a arbin * 'a * 'a arbin
```

---

## Exercice 1

### Construction d'arbres : `feuille` et `noeud`

**Reponse :**
```ocaml
(* Creer un noeud feuille *)
let feuille v = Feuille v

(* Creer un noeud avec valeur v, fils gauche g, fils droit d *)
let noeud v g d = Noeud (g, v, d)
```

**Test utop :**
```
# feuille 42;;
- : int arbin = Feuille 42
# noeud 12 (feuille 5) (noeud 7 (feuille 6) (feuille 8));;
- : int arbin = Noeud (Feuille 5, 12, Noeud (Feuille 6, 7, Feuille 8))
```

---

## Exercice 2

### Compter le nombre de noeuds feuilles dans un arbre (`compter`)

**Reponse :**
```ocaml
let rec compter a = match a with
  | Feuille b -> 1
  | Noeud (g, _, d) -> compter g + compter d
```

**Test utop :**
```
# let arbre_test = noeud 12 (feuille 5) (noeud 7 (feuille 6) (feuille 8));;
# compter arbre_test;;
- : int = 3
# compter (feuille 42);;
- : int = 1
```

---

## Exercice 3

### Convertir un arbre en liste par parcours infixe (`to_list`)

Parcours infixe : sous-arbre gauche, racine, sous-arbre droit.

**Reponse :**
```ocaml
let rec to_list a = match a with
  | Feuille b -> [b]
  | Noeud (g, c, d) -> to_list g @ [c] @ to_list d
```

**Test utop :**
```
# to_list arbre_test;;
- : int list = [5; 12; 6; 7; 8]
# to_list (feuille 42);;
- : int list = [42]
```

---

## Exercice 4

### Arbre binaire de recherche : `ajoutArbre` et `constr`

Inserer des elements en maintenant la propriete d'ABR (gauche < racine, droite >= racine). Construire un ABR a partir d'une liste.

**Reponse :**
```ocaml
(* Inserer l'element e dans l'ABR a *)
let rec ajoutArbre e a = match a with
  | Noeud (g, c, d) ->
      if e < c then Noeud (ajoutArbre e g, c, d)
      else Noeud (g, c, ajoutArbre e d)
  | Feuille b -> Noeud (Feuille "Nil", e, Feuille "Nil")

(* Construire un ABR a partir d'une liste *)
let rec constr l = match l with
  | [] -> Feuille "Nil"
  | e1 :: tl -> ajoutArbre e1 (constr tl)
```

**Test utop :**
```
# let l = ["celeri"; "orge"; "mais"; "ble"; "tomate"; "soja"; "poisson"];;
# List.filter (fun s -> s <> "Nil") (to_list (constr l)) = List.sort compare l;;
- : bool = true
# List.filter (fun s -> s <> "Nil") (to_list (constr l));;
- : string list = ["ble"; "celeri"; "mais"; "orge"; "poisson"; "soja"; "tomate"]
```

---

## Exercice 5

### Assigner des coordonnees (x, y) a chaque noeud pour l'affichage graphique (`placer`)

Utilise le parcours infixe pour les coordonnees x et la profondeur pour les coordonnees y.

**Reponse :**
```ocaml
type coord = int * int
type 'a arbinp = (coord * 'a) arbin

let d = 5  (* Espacement vertical *)
let e = 4  (* Espacement horizontal *)

(* Compter tous les noeuds (feuilles et internes) *)
let rec compterter a = match a with
  | Feuille f -> 1
  | Noeud (g, c, d) -> compterter g + compterter d + 1

(* Assigner les coordonnees : x depuis la position infixe, y depuis la profondeur *)
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

**Test utop :**
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
