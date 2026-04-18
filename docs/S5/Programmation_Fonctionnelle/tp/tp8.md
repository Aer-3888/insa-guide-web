---
title: "TP8 - Jeu de cartes (variante graphique)"
sidebar_position: 8
---

# TP8 - Jeu de cartes (variante graphique)

## Vue d'ensemble

Similaire au TP3 mais avec une implementation de type carte differente et un affichage graphique ameliore. Ce TP illustre :
- Definitions de types alternatives
- Utilisation de la bibliotheque graphique
- Gestion de l'etat du jeu
- Graphisme interactif

## Types de donnees

```ocaml
type coul = Coeur | Trefle | Pique | Carreau
type haut = Sept | Huit | Neuf | Dix | Valet | Dame | Roi | As
type carte = Carte of haut * coul  (* variant avec tuple au lieu de record *)
```

## Exercices

### 1. Construction de cartes
Definitions de types et fonctions de conversion similaires au TP3.

**Concepts** : Variants avec tuple vs records

### 2. Generation de cartes
Generation aleatoire de cartes sans doublons avec List.mem.

**Concepts** : Fonctions de la bibliotheque standard

### 3. Logique du jeu
Reduction de la reussite avec pattern matching sur les tuples de cartes.

**Concepts** : Pattern matching imbrique

### 4. Affichage graphique
- `draw_carte` : Dessiner une carte
- `draw_pile` : Dessiner une pile de cartes verticalement
- `draw_jeu` : Dessiner toutes les piles
- `draw_reussite` : Boucle de jeu interactive

**Concepts** : Primitives graphiques, boucle d'evenements

## Differences cles avec le TP3

### Definition du type
```ocaml noexec
(* TP3 *)
type carte = {h : haut; c : coul}

(* TP8 *)
type carte = Carte of haut * coul
```

### Pattern matching
```ocaml noexec
(* TP3 *)
let coul c = c.c

(* TP8 *)
let coul c = let Carte (_, col) = c in col
```

### Graphisme
Graphisme plus avance avec :
- Dessin de cartes a base de sprites
- Boucle de jeu interactive avec saisie clavier
- Visualisation des reductions en temps reel

## Execution du code

```bash
# Charger d'abord la bibliotheque graphique
ocaml
# #use "topfind";;
# #require "graphics";;
# #use "tp8.ml";;
```

Pour le graphique :
```bash
# draw_reussite ();;
# Appuyez sur 'q' pour quitter
```

## Interaction avec le jeu

La fonction `draw_reussite` :
1. Cree un jeu de 32 cartes
2. Les affiche sous forme de piles individuelles
3. Applique une reduction a chaque appui de touche
4. Continue jusqu'a l'appui sur 'q'
