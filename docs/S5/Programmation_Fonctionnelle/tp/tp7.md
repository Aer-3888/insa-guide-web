---
title: "TP7 - Arbres n-aires"
sidebar_position: 7
---

# TP7 - Arbres n-aires

## Vue d'ensemble

Structures de donnees d'arbres n-aires (arbres ou chaque noeud peut avoir un nombre quelconque d'enfants) :
- Construction d'arbres et accesseurs
- Parcours d'arbres
- Enumeration de chemins
- Egalite et remplacement d'arbres

## Type de donnees

```ocaml
type 'a narbr = 
  | Feuille of 'a 
  | Noeud of 'a * 'a narbr list
```

## Exercices

### 1. Construction d'arbres
- `feuille v` : Creer une feuille
- `noeud v l` : Creer un noeud avec valeur et liste d'enfants
- `valeur a` : Obtenir la valeur du noeud
- `sous_arbres a` : Obtenir la liste des enfants

**Concepts** : Structure d'arbre n-aire, types polymorphes

### 2. Comptage de noeuds (`compter`)
Compter le nombre total de noeuds dans l'arbre.

**Concepts** : Recursion mutuelle pour le parcours d'arbre et de liste

### 3. Plus long chemin (`pluslongue`)
Trouver la longueur du plus long chemin de la racine a une feuille.

**Concepts** : Hauteur d'arbre, calcul de maximum

### 4. Enumeration des noeuds (`listsa`)
Lister tous les noeuds (sous-arbres) de l'arbre.

**Concepts** : Collecte de tous les sous-arbres

### 5. Enumeration des branches (`listbr`)
Lister tous les chemins de la racine aux feuilles sous forme de listes.

**Concepts** : Generation de chemins, accumulation dans des listes

### 6. Egalite d'arbres (`egal`)
Verifier si deux arbres sont structurellement egaux.

**Concepts** : Egalite structurelle, recursion mutuelle

### 7. Remplacement de sous-arbre (`remplace`)
Remplacer toutes les occurrences d'un sous-arbre par un autre.

**Concepts** : Transformation d'arbres, List.map

## Algorithmes cles

### Recursion mutuelle
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

### Generation de chemins
```ocaml noexec
let rec ajout n l = match l with
  | [] -> []
  | x :: reste -> [n :: x] @ (ajout n reste)

let rec listbr a = match a with
  | Feuille f -> [[f]]
  | Noeud (v, j) -> ajout v (listeu j)
```

### Egalite d'arbres
```ocaml noexec
let rec egal a b = match (a, b) with
  | Feuille f, Feuille slim -> f = slim
  | Noeud (n, d), Noeud (v, w) ->
      if v = n then egalb d w else false
  | _ -> false
```

## Execution du code

```bash
ocaml
# #use "tp7.ml";;
```

## Resultats attendus

Pour un arbre de test avec le noeud 5 en racine, enfants 3 et 21 :
- `compter` → nombre total de noeuds
- `pluslongue` → distance maximale de la racine a une feuille
- `listbr` → tous les chemins sous forme de listes imbriquees
