---
title: "TP1 - Introduction a OCaml"
sidebar_position: 1
---

# TP1 - Introduction a OCaml

## Vue d'ensemble

Ce TP introduit les concepts fondamentaux d'OCaml :
- Fonctions et expressions de base
- Expressions conditionnelles
- Tuples et pattern matching
- Fonctions d'ordre superieur
- Recursion

## Exercices

### 1. Arithmetique de base (`mul2`)
Multiplier un nombre par 2.

**Concepts** : Definition de fonction simple, operations arithmetiques

### 2. Valeur absolue (`vabs`)
Calculer la valeur absolue d'un entier.

**Concepts** : Expressions conditionnelles (`if-then-else`)

### 3. Tests d'intervalle (`test1`, `test2`)
- `test1` : Verifier si un nombre est dans l'intervalle [12, 29]
- `test2` : Verifier si un nombre vaut 2, 5, 9 ou 23

**Concepts** : Operateurs booleens (`&&`, `||`), operateurs de comparaison

### 4. Operations sur les tuples (`test3`)
Tester si le premier element d'une paire vaut 12.

**Concepts** : Acces aux tuples avec `fst` et `snd`

### 5. Annee bissextile (`bissext`)
Determiner si une annee est bissextile selon les regles du calendrier gregorien.

**Concepts** : Operateur modulo, logique booleenne complexe

### 6. Projections de tuples (`proj1`, `proj23`)
Extraire des elements de triplets.

**Concepts** : Pattern matching sur les tuples

### 7. Operations sur tuples imbriques (`inv2`)
Extraire et permuter des elements de paires imbriquees.

**Concepts** : Pattern matching imbrique

### 8. Increment de paire (`incrpaire`)
Incrementer les deux elements d'une paire.

**Concepts** : Construction de tuples

### 9. Fonctions d'ordre superieur (`appliquepaire`, `incrpaire2`)
Appliquer une fonction aux deux elements d'une paire.

**Concepts** : Fonctions comme valeurs de premiere classe, fonctions en parametre

### 10. Composition de fonctions (`rapport`, `mytan`)
Calculer le rapport de deux fonctions et implementer la tangente.

**Concepts** : Fonctions retournant des fonctions, fermetures (closures)

### 11. Test de primalite (`premier`)
Verifier si un nombre est premier par division par essai.

**Concepts** : Fonctions recursives imbriquees, definitions locales

### 12. N-ieme nombre premier (`n_premier`)
Trouver le n-ieme nombre premier.

**Concepts** : Combinaison de plusieurs fonctions recursives

## Concepts cles OCaml

### Pattern Matching
```ocaml
let proj1 (a, b, c) = a
```

### Fonctions d'ordre superieur
```ocaml
let appliquepaire f p = (f (fst p), f (snd p))
```

### Fonctions imbriquees
```ocaml
let premier n =
  let rec estpremier x n =
    if x * x > n then true
    else if n mod x == 0 then false
    else estpremier (x + 1) n
  in
  estpremier 2 n
```

## Execution du code

Charger le fichier dans le toplevel OCaml :
```bash
ocaml
# #use "tp1.ml";;
```

Ou compiler et executer :
```bash
ocamlc -o tp1 tp1.ml
./tp1
```
