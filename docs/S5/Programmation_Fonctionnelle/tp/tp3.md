---
title: "TP3 - Jeu de cartes avec types et graphique"
sidebar_position: 3
---

# TP3 - Jeu de cartes avec types et graphique

## Vue d'ensemble

Implementation d'un jeu de reussite (solitaire) utilisant :
- Types algebriques personnalises
- Pattern matching
- Operations sur les listes
- Bibliotheque graphique

## Types de donnees

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = {h : haut; c : coul}
```

## Exercices

### 1. Constructeurs de types
Definir les types de cartes et les fonctions d'acces.

**Concepts** : Types variants, types records

### 2. Fonctions de conversion
- `haut_of_int` : Convertir un entier en hauteur de carte
- `coul_of_string` : Convertir une chaine en couleur de carte
- `string_of_carte` : Afficher les cartes sous forme lisible

**Concepts** : Pattern matching sur entiers et chaines

### 3. Generation aleatoire de cartes
Generer des cartes aleatoires sans doublons.

**Concepts** : Module Random, test d'appartenance a une liste

### 4. Logique du jeu
Implementer les regles de reduction de la reussite :
- Les cartes peuvent etre regroupees si elles correspondent en couleur ou en hauteur
- La pile du milieu est fusionnee avec les piles exterieures

**Concepts** : Pattern matching complexe sur les listes

### 5. Graphique (Optionnel)
Afficher les cartes avec le module Graphics.

**Concepts** : Graphisme 2D, dessin de sprites

## Regles du jeu

La reussite fonctionne avec des piles de cartes :
1. Si la pile A et la pile C ont des cartes au sommet correspondantes (meme couleur ou meme hauteur)
2. Alors la pile B est placee au-dessus de la pile A
3. Le processus se repete jusqu'a ce qu'aucune reduction ne soit plus possible

## Concepts cles OCaml

### Types variants
```ocaml
type coul = Coeur | Trefle | Pique | Carreau
```

### Records
```ocaml
type carte = {h : haut; c : coul}
let c = {h = As; c = Coeur}
```

### Pattern matching complexe
```ocaml noexec
let rec reduc l = match l with
  | (e1::l1')::(l2)::(e3::l3')::l' ->
      if e1.c = e3.c || e1.h = e3.h then ...
  | _ -> l
```

## Execution du code

```bash
ocaml
# #use "tp3.ml";;
```

Pour le graphique :
```bash
# #load "graphics.cma";;
# open Graphics;;
# open_graph "";;
```
