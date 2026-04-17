---
title: "TP4 - Arbres binaires"
sidebar_position: 4
---

# TP4 - Arbres binaires

## Objectif

Manipuler des structures recursives binaires en Prolog. On represente les arbres
binaires d'entiers par des termes construits et on implemente des operations
classiques : parcours, sous-arbre, remplacement, isomorphisme, ABR.

## Fichiers

- `src/arbres.pl` -- Predicats sur les arbres binaires
- `src/tp_arbres_tests.pl` -- Tests automatises

## Representation

```prolog
% Arbre vide
vide

% Arbre non vide : arb_bin(Racine, SousArbreGauche, SousArbreDroit)
arb_bin(1,
    arb_bin(2, arb_bin(6, vide, vide), vide),
    arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide)))
```

## Exercices

| # | Predicat | Description |
|---|----------|-------------|
| Q1 | `arbre_binaire(+B)` | B est un arbre binaire d'entiers |
| Q2 | `dans_arbre_binaire(+E, +B)` | E est une etiquette de B |
| Q3 | `sous_arbre_binaire(+S, +B)` | S est un sous-arbre de B |
| Q4 | `remplacer(+SA1, +SA2, +B, -B1)` | Remplacer SA1 par SA2 dans B |
| Q5 | `isomorphes(+B1, +B2)` | B1 et B2 sont isomorphes (meme structure, branches permutees) |
| Q6 | `infixe(+B, -L)` | Parcours infixe (+ prefixe et postfixe) |
| Q7 | `insertion_arbre_ordonne(+X, +B1, -B2)` | Insertion dans un ABR |
| Q8 | `insertion_arbre_ordonne1(+X, +B)` | Insertion "en place" via variables libres |

## Points techniques

- **Cut (!)** : utilise avec parcimonie dans `remplacer` pour eviter les doublons
- **Isomorphisme** : deux arbres sont isomorphes si l'un peut etre obtenu par echange de branches de l'autre
- **ABR** : l'arbre ordonne place les valeurs inferieures a gauche et superieures a droite
- **Variables libres** : dans Q8, on remplace `vide` par des variables non instanciees et on utilise `free/1`

## Execution

```prolog
[eclipse 1]: ["arbres"].
[eclipse 2]: ["tp_arbres_tests"].
[eclipse 3]: tests.

% Parcours infixe de l'arbre exemple
[eclipse 4]: infixe(arb_bin(1, arb_bin(2, arb_bin(6,vide,vide), vide), arb_bin(3, arb_bin(4,vide,vide), arb_bin(5,vide,vide))), L).
% L = [6, 2, 1, 4, 3, 5]
```
