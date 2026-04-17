---
title: "TP5 - Arithmetique"
sidebar_position: 5
---

# TP5 - Arithmetique

## Objectif

Implementer des operations arithmetiques en Prolog de trois manieres differentes :
arithmetique de Peano (entiers unaires), arithmetique binaire (listes de bits),
et arithmetique classique avec `is/2`.

## Fichier

- `src/arithmetic.ecl` -- Predicats arithmetiques et tests

## Partie 1 : Arithmetique de Peano

Les entiers sont representes en notation unaire :
- `zero` = 0
- `s(zero)` = 1
- `s(s(zero))` = 2
- etc.

| Predicat | Description |
|----------|-------------|
| `add1(+X, +Y, -Z)` | Z = X + Y |
| `sub1(+X, +Y, -Z)` | Z = X - Y |
| `prod1(+X, +Y, -Z)` | Z = X * Y |
| `factorial1(+N, -F)` | F = N! |

### Principe

- **Addition** : `0 + Y = Y` ; `s(X) + Y = s(X + Y)`
- **Soustraction** : `X - 0 = X` ; `s(X) - s(Y) = X - Y`
- **Produit** : `0 * Y = 0` ; `s(X) * Y = X*Y + Y`
- **Factorielle** : `0! = 1` ; `s(N)! = s(N) * N!`

## Partie 2 : Arithmetique binaire

Les entiers sont representes en binaire avec le bit de poids faible (LSB) en tete :
- `[1]` = 1, `[0,1]` = 2, `[1,1]` = 3, `[0,0,1]` = 4, etc.

Utilise une table `add_bit(Cin, B1, B2, Sum, Cout)` pour l'addition bit a bit.

| Predicat | Description |
|----------|-------------|
| `add2(+L1, +L2, -L)` | Addition binaire avec retenue |
| `sub2(+L1, +L2, -L)` | Soustraction (definie via `add2`) |
| `prod2(+X, +Y, -Res)` | Multiplication binaire |
| `factorial2(+X, -Res)` | Factorielle en binaire |

## Partie 3 : Factorielle classique

| Predicat | Description |
|----------|-------------|
| `factorial3(+N, -F)` | F = N! avec `is/2` |

## Execution

```prolog
[eclipse 1]: ["arithmetic"].
[eclipse 2]: tests.

% 3 + 4 en Peano
[eclipse 3]: add1(s(s(s(zero))), s(s(s(s(zero)))), Z).
% Z = s(s(s(s(s(s(s(zero)))))))

% 5 * 3 en binaire : [1,0,1] * [1,1] = [1,1,1,1]
[eclipse 4]: prod2([1,0,1], [1,1], Res).
```
