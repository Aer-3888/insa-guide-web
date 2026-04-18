---
title: "TP5 - Arithmetique"
sidebar_position: 5
---

# TP5 - Arithmetique

> D'apres les consignes de l'enseignant : `S5/Programmation_Logique/data/moodle/tp/tp5/README.md`

---

## Partie 1 : Arithmetique de Peano

Les entiers sont representes en notation unaire :
- `zero` = 0
- `s(zero)` = 1
- `s(s(zero))` = 2
- `s(s(s(zero)))` = 3, etc.

---

### add1(+X, +Y, -Z) : Z = X + Y

**Principe** : 0 + Y = Y ; s(X) + Y = s(X + Y)

**Reponse :**

```prolog
add1(zero, X, X).
add1(s(X), Y, s(Res)) :-
    add1(X, Y, Res).
```

L'addition se reduit a l'unification structurelle. Aucune operation arithmetique native n'est utilisee. La multi-directionnalite est un avantage majeur de Peano.

**Test :**

```
?- add1(s(s(zero)), s(s(s(zero))), Z).
Z = s(s(s(s(s(zero))))).    % 2 + 3 = 5

?- add1(zero, s(s(zero)), Z).
Z = s(s(zero)).              % 0 + 2 = 2

% Mode inverse (-,-,+) : decomposition
?- add1(X, Y, s(s(s(zero)))).
X = zero, Y = s(s(s(zero))) ;     % 0 + 3
X = s(zero), Y = s(s(zero)) ;     % 1 + 2
X = s(s(zero)), Y = s(zero) ;     % 2 + 1
X = s(s(s(zero))), Y = zero ;     % 3 + 0
false.
```

---

### sub1(+X, +Y, -Z) : Z = X - Y

**Principe** : X - 0 = X ; s(X) - s(Y) = X - Y

**Reponse :**

```prolog
sub1(X, zero, X).
sub1(s(X), s(Y), Res) :-
    sub1(X, Y, Res).
```

On "epluche" un `s` de chaque cote simultanement. Quand Y atteint `zero`, ce qui reste de X est le resultat.

**Test :**

```
?- sub1(s(s(s(zero))), s(zero), Z).
Z = s(s(zero)).    % 3 - 1 = 2

?- sub1(s(s(zero)), s(s(zero)), Z).
Z = zero.          % 2 - 2 = 0
```

---

### prod1(+X, +Y, -Z) : Z = X * Y

**Principe** : 0 * Y = 0 ; s(X) * Y = X*Y + Y

**Reponse :**

```prolog
prod1(zero, _, zero).
prod1(s(X), Y, Res) :-
    prod1(X, Y, Z),
    add1(Z, Y, Res).
```

Reduction a l'addition : chaque appel recursif effectue une addition de Y.

**Test :**

```
?- prod1(s(s(zero)), s(s(s(zero))), Z).
Z = s(s(s(s(s(s(zero)))))).    % 2 * 3 = 6

?- prod1(s(s(s(zero))), s(s(s(s(s(zero))))), Z).
Z = s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(zero))))))))))))))).    % 3 * 5 = 15

?- prod1(zero, s(s(zero)), Z).
Z = zero.    % 0 * 2 = 0
```

---

### factorial1(+N, -F) : F = N!

**Principe** : 0! = 1 = s(zero) ; s(N)! = s(N) * N!

**Reponse :**

```prolog
factorial1(zero, s(zero)).
factorial1(s(X), Res) :-
    factorial1(X, Y),
    prod1(s(X), Y, Res).
```

**Test :**

```
?- factorial1(zero, F).
F = s(zero).    % 0! = 1

?- factorial1(s(s(s(zero))), F).
F = s(s(s(s(s(s(zero)))))).    % 3! = 6

?- factorial1(s(s(s(s(zero)))), F).
F = s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(s(zero)))))))))))))))))))))))).    % 4! = 24
```

---

## Partie 2 : Arithmetique binaire

Les entiers sont en binaire avec le bit de poids faible (LSB) en tete :
- `[1]` = 1, `[0,1]` = 2, `[1,1]` = 3, `[0,0,1]` = 4, `[1,0,1]` = 5, etc.
- `[]` = 0

### Table add_bit/5

```prolog
% add_bit(Cin, B1, B2, Sum, Cout)
add_bit(0, 0, 0, 0, 0).
add_bit(0, 0, 1, 1, 0).
add_bit(0, 1, 0, 1, 0).
add_bit(0, 1, 1, 0, 1).
add_bit(1, 0, 0, 1, 0).
add_bit(1, 0, 1, 0, 1).
add_bit(1, 1, 0, 0, 1).
add_bit(1, 1, 1, 1, 1).
```

---

### add2(+L1, +L2, -L) : Addition binaire avec retenue

**Reponse :**

```prolog
add2(L1, L2, L) :- addc(L1, L2, 0, L).

addc([], X, 0, X).
addc(X, [], 0, X).
addc([], X, 1, Res) :- addc([1], X, 0, Res).
addc(X, [], 1, Res) :- addc([1], X, 0, Res).
addc([E1 | R1], [E2 | R2], Cin, [Res | End]) :-
    add_bit(E1, E2, Cin, Res, Cout),
    addc(R1, R2, Cout, End).
```

L'additionneur `addc` traite les bits un par un en propageant la retenue. Si un operande est vide sans retenue, l'autre est le resultat. Si retenue avec un operande vide, on transforme la retenue en `[1]`.

**Test :**

```
?- add2([1,1], [1], R).
R = [0, 0, 1].    % 3 + 1 = 4 = [0,0,1]

?- add2([1,1,1,1,1], [1], R).
R = [0, 0, 0, 0, 0, 1].    % 31 + 1 = 32

?- add2([0,1,1,0,1], [1,0,1,1,1,1,1,1,1], R).
R = [1, 1, 0, 0, 1, 0, 0, 0, 0, 1].    % 22 + 510 = 532
```

---

### sub2(+L1, +L2, -L) : Soustraction (definie via `add2`)

**Reponse :**

```prolog
sub2(L1, L2, L) :- add2(L2, L, L1).
```

Defini par reduction a l'addition : L2 + L = L1. L'unification multi-directionnelle de `add2` trouve L. Aucune logique de soustraction n'est implementee.

**Test :**

```
?- sub2([0,0,0,0,0,0,1], [1], Res).
Res = [1, 1, 1, 1, 1, 1].    % 64 - 1 = 63

?- sub2([1,1,0,0,1,1], [1,1,0,0,1,1], Res).
Res = [].    % N - N = 0
```

---

### prod2(+X, +Y, -Res) : Multiplication binaire

**Reponse :**

```prolog
prod2([], _, []).
prod2(X, Y, Res) :-
    sub2(X, [1], R1),
    prod2(R1, Y, R2),
    add2(R2, Y, Res).
```

`0 * Y = 0`. `X * Y = (X-1)*Y + Y`. On decremente X par 1 et on accumule Y a chaque etape.

**Test :**

```
?- prod2([1,0,1], [1,1], Res).
Res = [1, 1, 1, 1].    % 5 * 3 = 15

?- prod2([1,0,1], [1,0,0,1], Res).
Res = [1, 0, 1, 1, 0, 1].    % 5 * 9 = 45
```

---

### factorial2(+X, -Res) : Factorielle en binaire

**Reponse :**

```prolog
factorial2([], [1]).
factorial2(X, Res) :-
    sub2(X, [1], XRes),
    factorial2(XRes, YRes),
    prod2(X, YRes, Res).
```

`0! = 1 = [1]`. `X! = X * (X-1)!`.

**Test :**

```
?- factorial2([1,1], Res).
Res = [0, 1, 1].    % 3! = 6 = 110 en binaire

?- factorial2([0,0,1], Res).
Res = [0, 0, 0, 1, 1].    % 4! = 24 = 11000 en binaire

?- factorial2([1,0,1], Res).
Res = [0, 0, 0, 1, 1, 1, 1].    % 5! = 120 = 1111000 en binaire
```

---

## Partie 3 : Factorielle classique

### factorial3(+N, -F) : F = N! avec `is/2`

**Reponse :**

```prolog
factorial3(0, 1).
factorial3(N, Fact) :-
    N > 0,
    M is N - 1,
    factorial3(M, Res),
    Fact is N * Res.
```

`is/2` exige que le cote droit soit entierement instancie. Le mode est (+, -) uniquement -- on ne peut PAS utiliser `factorial3` pour trouver N etant donne Fact (contrairement a Peano).

**Test :**

```
?- factorial3(0, F).
F = 1.

?- factorial3(3, F).
F = 6.

?- factorial3(4, F).
F = 24.

?- factorial3(5, F).
F = 120.
```

---

## Comparaison des 3 approches

| Aspect | Peano | Binaire | Classique |
|--------|-------|---------|-----------|
| Representation de 5 | `s(s(s(s(s(zero)))))` | `[1, 0, 1]` | `5` |
| Multi-directionnalite | Oui | Oui | Non (`is` exige +) |
| Taille memoire | O(n) | O(log n) | O(1) |
| Performance de l'addition | O(n) | O(log n) | O(1) |
