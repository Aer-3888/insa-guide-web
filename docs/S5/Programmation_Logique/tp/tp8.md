---
title: "TP8 - Puzzle des dominos"
sidebar_position: 8
---

# TP8 - Puzzle des dominos

## Objectif

Resoudre un puzzle de dominos en Prolog en utilisant l'approche "generer et tester"
avec backtracking. Etant donne un ensemble de dominos, les organiser en chaines
ou chaque domino est connecte au suivant par des valeurs identiques.

## Fichiers

- `src/tp_dominos.ecl` -- Predicats de resolution du puzzle
- `src/tp_dominos_tests.ecl` -- Tests automatises

## Representation

```prolog
% Un domino : stone(A, B)
stone(2, 4)    % domino [2:4]

% Une chaine : chain(L1, L2)
% La chaine complete est : reverse(L2) ++ L1
chain([2, 4, 6], [3, 1])  % represente [1:3:2:4:6]

% Cas special : domino double isole
chain([X], [double])
```

## Predicats

| Predicat | Description |
|----------|-------------|
| `choose(+List, -Elt, -Rest)` | Choisit un element dans une liste et retourne le reste |
| `chains(+Stones, +Partial, -Chains)` | Construit les chaines a partir des dominos restants |
| `chainsAux(+Stone, +Chains, -NewChains)` | Ajoute un domino a une chaine existante |
| `domino(+Stones, -Chains)` | Point d'entree : resout le puzzle |

## Algorithme

1. **Initialisation** (`domino/2`) : le premier domino cree la premiere chaine partielle
   - Domino double `stone(A,A)` : cree `chain([A],[A])` + `chain([A],[double])`
   - Domino normal `stone(A,B)` : cree `chain([A],[B])`

2. **Construction** (`chains/3`) : pour chaque domino restant, on le choisit et on
   tente de l'ajouter a une chaine existante

3. **Ajout** (`chainsAux/3`) : un domino `stone(E,F)` peut se connecter :
   - A gauche d'une chaine (si E ou F correspond au debut)
   - A droite d'une chaine (si E ou F correspond a la fin)
   - Si c'est un double, il cree aussi une chaine `[double]` supplementaire
   - S'il ne se connecte pas a la chaine courante, on passe a la suivante

4. **Backtracking** : Prolog explore toutes les possibilites via le non-determinisme

## Donnees de test

- `stones1` : 5 dominos (petit exemple)
- `stones2` : 10 dominos (exemple moyen)
- `stones3` : 28 dominos (jeu complet de dominos 0-6)

## Execution

```prolog
[eclipse 1]: ["tp_dominos"].

% Resoudre pour stones1
[eclipse 2]: stones1(S), domino(S, R), print_chains(R).

% Resoudre pour le jeu complet
[eclipse 3]: stones3(S), domino(S, R), print_chains(R).

% Lancer les tests
[eclipse 4]: ["tp_dominos_tests"].
[eclipse 5]: tests.
```
