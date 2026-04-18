---
title: "TP2 - Recursion avancee et methodes numeriques"
sidebar_position: 2
---

# TP2 - Recursion avancee et methodes numeriques

## Vue d'ensemble

Ce TP explore des techniques de recursion avancees :
- Recursion mutuelle
- Fonctions d'ordre superieur avec accumulation
- Integration numerique
- Optimisation de fonctions

## Exercices

### 1. Recursion mutuelle (`pair`, `impair`)
Determiner si un nombre est pair ou impair par recursion mutuelle.

**Concepts** : Fonctions mutuellement recursives avec le mot-cle `and`

### 2. Sommation (`sigma`)
Calculer la somme des entiers de `a` a `b`.

**Concepts** : Recursion simple avec accumulation

### 3. Sommation generalisee (`sigma2`)
Sommer les resultats de l'application d'une fonction a chaque entier d'un intervalle.

**Concepts** : Fonctions d'ordre superieur, fonctions en parametre

### 4. Accumulation parametre (`sigma3`)
Accumulation generique avec fonction et combinateur personnalises.

**Concepts** : Operations de type fold, patterns d'accumulation flexibles

### 5. Iteration basee sur un predicat (`sigma4`)
Iterer jusqu'a satisfaire un predicat, avec increment personnalise.

**Concepts** : Predicats, patterns d'iteration generaux

### 6. Sommation numerique (`cum`)
Somme cumulative sur un intervalle en virgule flottante.

**Concepts** : Arithmetique en virgule flottante, methodes numeriques

### 7. Integration numerique (`integre`)
Approximer des integrales definies par la methode des rectangles.

**Concepts** : Calcul integral, integration numerique, precision dx

### 8. Maximisation de fonction (`maxi`)
Trouver le maximum d'une fonction sur un intervalle par recherche ternaire.

**Concepts** : Algorithmes d'optimisation, recherche recursive

## Concepts cles OCaml

### Recursion mutuelle
```ocaml
let rec pair n = 
  if n = 0 then true else impair (pred n)
and impair n = 
  if n = 0 then false else pair (pred n)
```

### Accumulation d'ordre superieur
```ocaml
let rec sigma3 (f, fc) i acc (a, b) =
  if a > b then acc
  else fc (f a) (sigma3 (f, fc) i acc (a + i, b))
```

### Integration numerique
```ocaml noexec
let integre f (a, b, dx) = dx *. cum f (a, b) dx
```

### Recherche ternaire
```ocaml
let rec maxi f (a, b) p =
  if abs_float (a -. b) < p then f a
  else
    if f ((2. *. a +. b) /. 3.) > f ((a +. 2. *. b) /. 3.)
    then maxi f (a, (a +. 2. *. b) /. 3.) p
    else maxi f ((2. *. a +. b) /. 3., b) p
```

## Contexte mathematique

### Integration numerique
La methode des rectangles approxime :
```
∫[a,b] f(x)dx ≈ Σ f(xi) * dx
```

### Recherche ternaire
Trouve le maximum d'une fonction unimodale en divisant l'espace de recherche en tiers et en cherchant recursivement dans la portion contenant le maximum.

## Execution du code

```bash
ocaml
# #use "tp2.ml";;
```

## Resultats attendus

- `sigma (-2, 4)` → 7
- `sigma2 (fun x -> 2 * x) (-2, 4)` → 14
- `integre (fun x -> 1. /. x) (1., 2., 0.001)` → ~0.693 (ln(2))
- `maxi (fun x -> 1. -. (x *. x)) (0., 2.) 0.0001` → 1.0
