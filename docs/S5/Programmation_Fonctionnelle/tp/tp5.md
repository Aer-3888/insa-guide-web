---
title: "TP5 - Operations sur les listes"
sidebar_position: 5
---

# TP5 - Operations sur les listes

## Vue d'ensemble

Fonctions fondamentales de manipulation de listes en OCaml :
- Operations de base (longueur, appartenance, indexation)
- Transformations de listes
- Operations sur les sous-listes
- Recherche et remplacement de motifs

## Exercices

### 1. Operations de base
- `longueur l` : Longueur de la liste
- `appartient e l` : Verifier l'appartenance
- `rang e l` : Trouver l'indice (0 si non trouve)
- `rang_opt e l` : Trouver l'indice sous forme de type option

**Concepts** : Recursion, types option

### 2. Concatenation de listes
- `concatl l1 l2` : Concatener deux listes

**Concepts** : Recursion structurelle sur les listes

### 3. Decoupage de listes
- `debliste l n` : Les n premiers elements
- `finliste l n` : Les n derniers elements

**Concepts** : Parcours de listes

### 4. Remplacement d'elements
- `remplace x y l` : Remplacer toutes les occurrences de x par y

**Concepts** : Transformation de listes

### 5. Operations sur les sous-listes
- `entete l l1` : Verifier si l est un prefixe de l1
- `sousliste l l1` : Verifier si l est une sous-liste contigue de l1
- `oter l l1` : Retirer le prefixe l de l1

**Concepts** : Pattern matching, verification de prefixes

### 6. Remplacement avance
- `remplacel l1 l2 l` : Remplacer toutes les occurrences de la sous-liste l1 par l2
- `supprimel l1 l` : Supprimer toutes les occurrences de la sous-liste l1

**Concepts** : Recherche et remplacement de sous-listes

## Concepts cles OCaml

### Type option
```ocaml
type 'a option = None | Some of 'a

let rec rang_opt e l = match l with
  | [] -> None
  | e1 :: tl ->
      if e1 = e then Some 1
      else match rang_opt e tl with
        | None -> None
        | Some c -> Some (c + 1)
```

### Verification de prefixe
```ocaml
let rec entete l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 then entete t1 t2 else false
```

### Recherche de sous-liste
```ocaml
let rec sousliste l l1 = match l, l1 with
  | [], _ -> true
  | _, [] -> false
  | e1 :: t1, e2 :: t2 ->
      if e1 = e2 && entete t1 t2 then true
      else sousliste l t2
```

## Execution du code

```bash
ocaml
# #use "tp5.ml";;
```

## Resultats attendus

- `longueur [1;2;3]` → 3
- `rang_opt 2 [3;2;1]` → Some 2
- `remplacel [1;2;1] [5;6] [4;1;2;1;2;1;3;8]` → [4;5;6;2;5;6;3;8]
