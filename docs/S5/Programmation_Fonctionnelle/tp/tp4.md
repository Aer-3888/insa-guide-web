---
title: "TP4 - Algorithmes sur les listes et partitions"
sidebar_position: 4
---

# TP4 - Algorithmes sur les listes et partitions

## Vue d'ensemble

Algorithmes avances sur les listes :
- Tri rapide (quicksort)
- Tri a bulle avec point fixe
- Generation et manipulation de listes
- Partitions d'entiers

## Exercices

### 1. Tri rapide (`split`, `qs`)
Implementer l'algorithme de tri rapide :
- `split v l` : Partitionner la liste autour du pivot `v`
- `qs l` : Trier recursivement la liste

**Concepts** : Diviser pour regner, partitionnement de listes

### 2. K-ieme element (`kieme`)
Extraire le k-ieme element d'une liste.

**Concepts** : Indexation de listes, pattern matching

### 3. Point fixe (`jqastable`)
Trouver le point fixe d'une fonction par application repetee.

**Concepts** : Fonctions d'ordre superieur, convergence

### 4. Tri a bulle (`unebulle`, `tribulle`)
- `unebulle` : Effectuer une passe du tri a bulle
- `tribulle` : Repeter jusqu'au tri complet (point fixe)

**Concepts** : Tri iteratif, points fixes

### 5. Utilitaires sur les listes
- `merge` : Aplatir une liste de listes
- `create f k` : Creer une liste par application de fonction
- `insert j ll` : Inserer un element en tete de chaque sous-liste

**Concepts** : Transformations de listes, operations de type map

### 6. Partitions d'entiers (`partition`)
Generer toutes les partitions d'un entier n.

**Concepts** : Combinatoire, generation recursive

## Algorithmes cles

### Tri rapide
```ocaml
let rec split v l = match l with
  | [] -> ([], [])
  | e :: l' ->
      if e < v then (e :: fst(split v l'), snd(split v l'))
      else (fst(split v l'), e :: snd(split v l'))

let rec qs l = match l with
  | [] | [_] -> l
  | e :: l' -> qs (fst(split e l')) @ (e :: qs (snd(split e l')))
```

### Iteration par point fixe
```ocaml
let rec jqastable x f =
  if f x = x then x else jqastable (f x) f
```

### Partitions d'entiers
Genere toutes les facons d'ecrire n comme somme d'entiers positifs.

Exemple : `partition 5` genere :
- [5], [4;1], [3;2], [3;1;1], [2;2;1], [2;1;1;1], [1;1;1;1;1]

## Execution du code

```bash
ocaml
# #use "tp4.ml";;
```

## Resultats attendus

- `qs [4; 12; 27; -12; 7; 8; 1; 3; 6; 12; 42]` → [-12; 1; 3; 4; 6; 7; 8; 12; 12; 27; 42]
- `kieme 7 [4; 12; 27; -12; 7; 1; 8; 3; 6; 12; 42]` → 8
- `partition 5` → 7 partitions differentes
