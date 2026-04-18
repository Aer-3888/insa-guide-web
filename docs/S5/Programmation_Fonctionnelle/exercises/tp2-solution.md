---
title: "TP2 - Recursion avancee et methodes numeriques"
sidebar_position: 2
---

# TP2 - Recursion avancee et methodes numeriques

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp2/README.md`

---

## Exercice 1

### Recursion mutuelle : determiner si un nombre est pair ou impair (`pair`, `impair`)

Utilisation de fonctions mutuellement recursives avec le mot-cle `and`, sans utiliser `mod`.

**Reponse :**
```ocaml
let rec pair n =
  if n = 0 then true else impair (pred n)

and impair n =
  if n = 0 then false else pair (pred n)
```

**Test utop :**
```
# pair 12;;
- : bool = true
# impair 12;;
- : bool = false
# pair 7;;
- : bool = false
# impair 7;;
- : bool = true
```

---

## Exercice 2

### Calculer la somme des entiers de `a` a `b` (`sigma`)

**Reponse :**
```ocaml
let rec sigma (a, b) =
  if a > b then 0
  else a + sigma (succ a, b)
```

**Test utop :**
```
# sigma (-2, 4);;
- : int = 7
# sigma (1, 10);;
- : int = 55
# sigma (5, 3);;
- : int = 0
```

---

## Exercice 3

### Sommer les resultats de l'application d'une fonction a chaque entier d'un intervalle (`sigma2`)

Generalisation de `sigma` : au lieu de sommer `a`, on somme `f(a)`.

**Reponse :**
```ocaml
let rec sigma2 f (a, b) =
  if a > b then 0
  else f a + sigma2 f (succ a, b)
```

**Test utop :**
```
# sigma2 (fun x -> 2 * x) (-2, 4);;
- : int = 14
# sigma2 (fun x -> x * x) (1, 4);;
- : int = 30
# sigma2 (fun x -> 1) (1, 10);;
- : int = 10
```

---

## Exercice 4

### Accumulation generique avec fonction et combinateur personnalises (`sigma3`)

Generalise `sigma2` avec :
- `f` : transformation appliquee a chaque valeur
- `fc` : fonction combinatrice (remplace `+`)
- `i` : pas d'increment (remplace `1`)
- `acc` : valeur initiale de l'accumulateur (remplace `0`)

**Reponse :**
```ocaml
let rec sigma3 (f, fc) i acc (a, b) =
  if a > b then acc
  else fc (f a) (sigma3 (f, fc) i acc (a + i, b))
```

**Test utop :**
```
# sigma3 ((fun x -> 2 * x), fun v acc -> v + acc) 2 0 (2, 6);;
- : int = 24
# sigma3 ((fun x -> x * x), fun x acc -> x :: acc) 2 [] (0, 10);;
- : int list = [0; 4; 16; 36; 64; 100]
# sigma3 ((fun x -> x), fun x acc -> x * acc) 1 1 (1, 5);;
- : int = 120
```

---

## Exercice 5

### Iterer jusqu'a satisfaire un predicat, avec increment personnalise (`sigma4`)

Derniere generalisation : remplace la borne `b` et le pas `i` par un predicat d'arret `p` et une fonction d'increment `fi`.

**Reponse :**
```ocaml
let rec sigma4 (f, fc) (p, fi) acc a =
  if p a then acc
  else fc (f a) (sigma4 (f, fc) (p, fi) acc (fi a))
```

**Test utop :**
```
# sigma4 ((fun x -> 2 * x), fun v acc -> v + acc)
         ((fun v -> v > 6), fun v -> v + 2) 0 2;;
- : int = 24
# sigma4 ((fun x -> x), fun v a -> v + a)
         ((fun v -> v > 10), fun v -> v + 1) 0 1;;
- : int = 55
```

---

## Exercice 6

### Somme cumulative sur un intervalle en virgule flottante (`cum`)

Instanciation de `sigma4` pour la sommation numerique en virgule flottante.

**Reponse :**
```ocaml
let cum f (a, b) dx =
  sigma4 (f, fun a b -> a +. b)
         ((fun a -> a > b), fun v -> v +. dx)
         0.
         a
```

**Test utop :**
```
# cum (fun x -> 2. *. x) (0.2, 0.7) 0.2;;
- : float = 2.4
```

---

## Exercice 7

### Approximation d'integrales definies par la methode des rectangles (`integre`)

Multiplie la somme cumulative par `dx` (methode des rectangles : l'integrale de f de a a b est approximativement dx * somme des f(x_i)).

**Reponse :**
```ocaml
let integre f (a, b, dx) = dx *. cum f (a, b) dx
```

**Test utop :**
```
# integre (fun x -> 1. /. x) (1., 2., 0.001);;
- : float = 0.693897243059959257
# integre (fun x -> x *. x) (0., 1., 0.001);;
- : float = 0.332833499999...
```

---

## Exercice 8

### Trouver le maximum d'une fonction sur un intervalle par recherche ternaire (`maxi`)

Divise l'intervalle en tiers. Compare f aux deux points tiers et elimine la portion qui ne peut pas contenir le maximum. Fonctionne pour les fonctions unimodales.

**Reponse :**
```ocaml
let rec maxi f (a, b) p =
  if abs_float (a -. b) < p then f a
  else
    let m1 = (2. *. a +. b) /. 3. in
    let m2 = (a +. 2. *. b) /. 3. in
    if f m1 > f m2
    then maxi f (a, m2) p
    else maxi f (m1, b) p
```

**Test utop :**
```
# maxi (fun x -> 1. -. (x *. x)) (0., 2.) 0.0001;;
- : float = 0.999999999...
# maxi sin (0., Float.pi) 0.0001;;
- : float = 0.999999999...
```
