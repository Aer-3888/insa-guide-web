---
title: "Chapitre 5 : Arithmetique en Prolog"
sidebar_position: 5
---

# Chapitre 5 : Arithmetique en Prolog

## 5.1 L'operateur is/2

En Prolog, l'arithmetique n'est **pas** geree par unification. L'operateur `is` **evalue** le cote droit et **unifie** avec le cote gauche.

```prolog
?- X is 3 + 4.       % X = 7 (evalue 3+4 puis unifie avec X)
?- 7 is 3 + 4.       % true  (evalue 3+4, unifie 7 avec 7)
?- 3 + 4 is 3 + 4.   % false ! (3+4 comme terme != 7)

?- X = 3 + 4.        % X = 3+4  (unification, PAS d'evaluation !)
?- X is Y + 1.       % ERREUR si Y n'est pas instancie !
```

**Regle fondamentale** : le cote droit de `is` doit etre **completement instancie** (pas de variables libres).

### Operations arithmetiques

| Operateur | Signification | Exemple |
|-----------|---------------|---------|
| `+` | Addition | `X is 3 + 4` -> 7 |
| `-` | Soustraction | `X is 10 - 3` -> 7 |
| `*` | Multiplication | `X is 3 * 4` -> 12 |
| `//` | Division entiere | `X is 7 // 2` -> 3 |
| `/` | Division reelle | `X is 7 / 2` -> 3.5 |
| `mod` | Modulo | `X is 7 mod 3` -> 1 |
| `**` | Puissance | `X is 2 ** 10` -> 1024 |
| `abs` | Valeur absolue | `X is abs(-5)` -> 5 |

### Operateurs de comparaison

| Operateur | Signification | Note |
|-----------|---------------|------|
| `X =:= Y` | Egalite arithmetique | evalue les deux cotes |
| `X =\= Y` | Difference arithmetique | evalue les deux cotes |
| `X < Y` | Inferieur strict | evalue les deux cotes |
| `X > Y` | Superieur strict | evalue les deux cotes |
| `X =< Y` | Inferieur ou egal | **attention : =< et non <=** |
| `X >= Y` | Superieur ou egal | evalue les deux cotes |

**Piege** : `=<` et non `<=` ! C'est une erreur tres frequente.

```prolog
?- 3 + 4 =:= 7.    % true (evalue les deux cotes)
?- 3 + 4 =:= 2 + 5. % true
?- 3 + 4 == 7.       % false ! (comparaison de termes, pas evaluation)
```

## 5.2 Arithmetique dans les predicats

### Factorielle classique

```prolog
factorial(0, 1).
factorial(N, F) :-
    N > 0,
    M is N - 1,
    factorial(M, F1),
    F is N * F1.
```

**Trace** : `factorial(4, F)`
```
factorial(4, F)
  M1 is 4-1 = 3, factorial(3, F1)
    M2 is 3-1 = 2, factorial(2, F2)
      M3 is 2-1 = 1, factorial(1, F3)
        M4 is 1-1 = 0, factorial(0, F4)
          F4 = 1
        F3 is 1 * 1 = 1
      F2 is 2 * 1 = 2
    F1 is 3 * 2 = 6
  F is 4 * 6 = 24
```

### Valeur calorique d'un repas (TP1)

```prolog noexec
val_cal(H, P, D, Total) :-
    repas(H, P, D),
    calories(H, CalH),
    calories(P, CalP),
    calories(D, CalD),
    Total is CalH + CalP + CalD.

repas_eq(H, P, D) :-
    val_cal(H, P, D, Cal),
    Cal =< 800.
```

### Filtrage par intervalle

```prolog noexec
% Plats entre 200 et 400 calories
plat200_400(P) :-
    plat(P),
    calories(P, Cal),
    Cal >= 200,
    Cal =< 400.
```

## 5.3 Arithmetique de Peano

Les entiers de Peano representent les nombres naturels avec :
- `zero` = 0
- `s(zero)` = 1
- `s(s(zero))` = 2
- `s(s(s(zero)))` = 3

L'avantage : on utilise l'**unification** plutot que `is/2`.

### Addition

```prolog
% add1(+X, +Y, -Z) : Z = X + Y
add1(zero, Y, Y).              % 0 + Y = Y
add1(s(X), Y, s(Z)) :-         % s(X) + Y = s(X + Y)
    add1(X, Y, Z).
```

**Trace** : `add1(s(s(zero)), s(zero), Z)` (2 + 1)
```
add1(s(s(zero)), s(zero), Z)
  % s(X1) + Y = s(Z1) avec X1=s(zero), Y=s(zero)
  Z = s(Z1)
  add1(s(zero), s(zero), Z1)
    % s(X2) + Y = s(Z2) avec X2=zero
    Z1 = s(Z2)
    add1(zero, s(zero), Z2)
      % 0 + Y = Y
      Z2 = s(zero)
    Z1 = s(s(zero))
  Z = s(s(s(zero)))     % = 3
```

### Soustraction, Multiplication, Factorielle

```prolog
% sub1(+X, +Y, -Z) : Z = X - Y
sub1(X, zero, X).
sub1(s(X), s(Y), Z) :- sub1(X, Y, Z).

% prod1(+X, +Y, -Z) : Z = X * Y
prod1(zero, _, zero).
prod1(s(X), Y, Z) :-
    prod1(X, Y, W),
    add1(W, Y, Z).         % s(X)*Y = X*Y + Y

% factorial1(+N, -F) : F = N!
factorial1(zero, s(zero)).  % 0! = 1
factorial1(s(N), F) :-
    factorial1(N, F1),
    prod1(s(N), F1, F).     % (N+1)! = (N+1) * N!
```

## 5.4 Arithmetique binaire

Les entiers sont representes en binaire avec le **LSB en tete** :
- `[1]` = 1
- `[0, 1]` = 2
- `[1, 1]` = 3
- `[0, 0, 1]` = 4
- `[1, 0, 1]` = 5

### Table d'addition bit a bit

```prolog
% add_bit(B1, B2, Cin, Sum, Cout)
add_bit(0, 0, 0, 0, 0).
add_bit(0, 0, 1, 1, 0).
add_bit(0, 1, 0, 1, 0).
add_bit(0, 1, 1, 0, 1).
add_bit(1, 0, 0, 1, 0).
add_bit(1, 0, 1, 0, 1).
add_bit(1, 1, 0, 0, 1).
add_bit(1, 1, 1, 1, 1).
```

### Addition binaire

```prolog
add2(L1, L2, L) :- addc(L1, L2, 0, L).

addc([], X, 0, X).
addc(X, [], 0, X).
addc([], X, 1, Res) :- addc([1], X, 0, Res).
addc(X, [], 1, Res) :- addc([1], X, 0, Res).
addc([B1 | R1], [B2 | R2], Cin, [Sum | Rest]) :-
    add_bit(B1, B2, Cin, Sum, Cout),
    addc(R1, R2, Cout, Rest).
```

**Trace** : `add2([1,1], [1], R)` (3 + 1 = 4)
```
addc([1,1], [1], 0, R)
  add_bit(1, 1, 0, 0, 1)  -> Sum=0, Cout=1
  R = [0 | Rest]
  addc([1], [], 1, Rest)
    % clause addc(X, [], 1, Res) :- addc([1], X, 0, Res).  X=[1]
    addc([1], [1], 0, Rest)
      add_bit(1, 1, 0, 0, 1)  -> Sum=0, Cout=1
      Rest = [0 | Rest2]
      addc([], [], 1, Rest2)
        % clause addc([], X, 1, Res) :- addc([1], X, 0, Res).  X=[]
        addc([1], [], 0, Rest2)
          % clause addc(X, [], 0, X).  X=[1]
          Rest2 = [1]
      Rest = [0, 1]
  R = [0, 0, 1]            % = 4 en LSB-first
```

### Soustraction et multiplication binaire

```prolog
% sub2 defini via add2 : L2 + L = L1 donc L = L1 - L2
sub2(L1, L2, L) :- add2(L2, L, L1).

% prod2 : multiplication par soustraction repetee
prod2([], _, []).                      % 0 * Y = 0
prod2(X, Y, Res) :-
    sub2(X, [1], R1),                  % X - 1
    prod2(R1, Y, R2),                  % (X-1) * Y
    add2(R2, Y, Res).                  % + Y
```

## 5.5 Erreurs frequentes

```prolog noexec
% ERREUR 1 : oublier is
mauvais(X, Y, Z) :- Z = X + Y.    % Z = le TERME +(X,Y), pas la somme !
bon(X, Y, Z) :- Z is X + Y.       % Z = la valeur numerique

% ERREUR 2 : variable libre dans is
mauvais2(X) :- Y is X + 1.        % ERREUR si X pas instancie !

% ERREUR 3 : =< vs <=
mauvais3(X) :- X <= 10.            % ERREUR de syntaxe !
bon3(X) :- X =< 10.               % Correct

% ERREUR 4 : comparer des atomes avec <
mauvais4 :- a < b.                 % ERREUR : < est pour les nombres
bon4 :- a @< b.                    % @< pour l'ordre des termes
```

---

## AIDE-MEMOIRE -- Arithmetique

```
EVALUATION
  X is Expr         Evalue Expr, unifie avec X
  Expr doit etre completement instancie !

OPERATIONS
  +  -  *  //  /  mod  **  abs

COMPARAISON (evalue les deux cotes)
  =:=    egalite numerique
  =\=    difference numerique
  <  >   inferieur/superieur strict
  =<     inferieur ou egal  (PAS <=)
  >=     superieur ou egal

PEANO (unification pure, pas de is)
  zero, s(zero), s(s(zero)), ...
  add1(zero, Y, Y).
  add1(s(X), Y, s(Z)) :- add1(X, Y, Z).

BINAIRE (LSB en tete)
  [1] = 1, [0,1] = 2, [1,1] = 3, [0,0,1] = 4
  add_bit(B1, B2, Cin, Sum, Cout) : table complete
  addc : additionneur avec propagation de retenue

PIEGES
  X = 3+4      -> X = +(3,4)   (terme, pas 7)
  X is 3+4     -> X = 7        (evaluation)
  X is Y+1     -> ERREUR si Y libre
  X <= 10      -> ERREUR syntaxe (utiliser =<)
```
