---
title: "TP3 - Listes"
sidebar_position: 3
---

# TP3 - Listes

## Objectif

Se familiariser avec les listes Prolog, maitriser les modes des predicats et
implementer des operations ensemblistes.

## Fichiers

- `src/listes.pl` -- Tous les predicats de manipulation de listes
- `src/tp_listes_tests.ecl` -- Tests automatises

## Partie 1 : Classiques sur les listes

| Predicat | Mode | Description |
|----------|------|-------------|
| `membre(?A, +X)` | (?A, +X) | A est element de la liste X |
| `compte(+A, +X, ?N)` | (+, +, ?) | N = nombre d'occurrences de A dans X |
| `renverser(+X, ?Y)` | (+, ?) | Y est X a l'envers (accumulateur O(n)) |
| `palind(+X)` | (+) | X est un palindrome |
| `enieme(+N, +X, -A)` | (+, +, -) | A est le N-ieme element de X |
| `hors_de(+A, +X)` | (+, +) | A n'est pas dans X |
| `tous_diff(+X)` | (+) | Tous les elements de X sont differents |
| `conc3(+X, +Y, +Z, ?T)` | (+, +, +, ?) | T = X ++ Y ++ Z |
| `debute_par(+X, ?Y)` | (+, ?) | X commence par Y |
| `sous_liste(+X, ?Y)` | (+, ?) | Y est une sous-liste contigue de X |
| `elim(+X, -Y)` | (+, -) | Y = X sans doublons |
| `tri(+X, -Y)` | (+, -) | Y = tri par insertion de X |

## Partie 2 : Retour sur les modes

| Predicat | Mode | Description |
|----------|------|-------------|
| `enieme2(-N, +X, +A)` | (-, +, +) | Trouve le rang N de A dans X |
| `eniemefinal(?N, +X, ?A)` | (?, +, ?) | Combine les deux modes |
| `conc3final(?X, ?Y, ?Z, ?T)` | (?, ?, ?, ?) | conc3 avec mode (-, -, -, +) |
| `comptefinal(?A, +X, ?N)` | (?, +, ?) | compte avec mode (-, +, -) |

## Partie 3 : Modelisation des ensembles

Les ensembles sont representes par des listes sans doublons.
On utilise uniquement `membre` et `hors_de` (+ recursivite).

| Predicat | Description |
|----------|-------------|
| `inclus(+X, +Y)` | Tous les elements de X sont dans Y |
| `non_inclus(+X, +Y)` | Au moins un element de X n'est pas dans Y |
| `union_ens(+X, +Y, ?Z)` | Z = union ensembliste de X et Y |
| `inclus2(?X, +Y)` | Version de inclus supportant le mode (?, +) |

## Execution

```prolog noexec
[eclipse 1]: ["listes"].
[eclipse 2]: ["tp_listes_tests"].
[eclipse 3]: tests.

% Exemples
[eclipse 4]: tri([5,3,1,4,2], Y).
[eclipse 5]: conc3final(X, Y, Z, [1,2,3]).
```
