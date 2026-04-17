---
title: "Chapitre 3 : Listes en Prolog"
sidebar_position: 3
---

# Chapitre 3 : Listes en Prolog

## 3.1 Representation des listes

En Prolog, une liste est soit :
- La **liste vide** : `[]`
- Un element (la **tete**) suivi du reste (la **queue**) : `[H|T]`

```prolog
% Exemples
[]                  % liste vide
[a]                 % = [a | []]
[a, b]              % = [a | [b | []]]
[a, b, c]           % = [a | [b | [c | []]]]
[1, 2, 3, 4, 5]    % 5 elements

% Decomposition tete/queue
[H | T] = [1, 2, 3]    % H = 1, T = [2, 3]
[X, Y | Z] = [a, b, c, d]  % X = a, Y = b, Z = [c, d]
[A | _] = [hello, world]   % A = hello (on ignore le reste)
```

### Unification avec les listes

```
[X|Y] = [1, 2, 3]        -> X = 1, Y = [2, 3]
[X|Y] = [1]              -> X = 1, Y = []
[X|Y] = []               -> ECHEC (liste vide n'a pas de tete)
[X, Y] = [a, b, c]       -> ECHEC (longueur differente : 2 vs 3)
[X, X] = [a, a]          -> X = a
[X, X] = [a, b]          -> ECHEC (X ne peut etre a ET b)
[1|[2|[3|[]]]] = [1,2,3] -> OK (representations equivalentes)
```

## 3.2 Predicats fondamentaux

### membre/2 -- Appartenance

```prolog
% membre(?A, +X) : A est element de la liste X
membre(A, [A | _]).           % Cas de base : A est la tete
membre(A, [_ | R]) :-        % Cas recursif : A est dans le reste
    membre(A, R).
```

**Trace d'execution** : `membre(b, [a, b, c])`
```
Call: membre(b, [a, b, c])
  % Clause 1 : b unif a -> ECHEC
  % Clause 2 : _ = a, R = [b, c]
  Call: membre(b, [b, c])
    % Clause 1 : b unif b -> OK
  Exit: membre(b, [b, c])
Exit: membre(b, [a, b, c])
```

### Longueur d'une liste

```prolog
% longueur(+L, ?N) : N est la longueur de L
longueur([], 0).
longueur([_ | R], N) :-
    longueur(R, M),
    N is M + 1.
```

### append/3 -- Concatenation

```prolog
% append(?X, ?Y, ?Z) : Z est la concatenation de X et Y
append([], Y, Y).
append([A | X], Y, [A | Z]) :-
    append(X, Y, Z).
```

**Trace** : `append([1, 2], [3, 4], R)`
```
Call: append([1, 2], [3, 4], R)
  % Clause 2 : A=1, X=[2], Y=[3,4], R=[1|Z]
  Call: append([2], [3, 4], Z)
    % Clause 2 : A=2, X=[], Y=[3,4], Z=[2|Z2]
    Call: append([], [3, 4], Z2)
      % Clause 1 : Z2 = [3, 4]
    Exit: append([], [3, 4], [3, 4])
  Exit: append([2], [3, 4], [2, 3, 4])
Exit: append([1, 2], [3, 4], [1, 2, 3, 4])
% R = [1, 2, 3, 4]
```

**Utilisation multi-mode** de append :
```prolog
?- append([1, 2], [3], R).       % R = [1, 2, 3]      (concatenation)
?- append(X, [3], [1, 2, 3]).    % X = [1, 2]          (trouver le prefixe)
?- append([1], Y, [1, 2, 3]).    % Y = [2, 3]          (trouver le suffixe)
?- append(X, Y, [1, 2, 3]).      % X=[], Y=[1,2,3] ;   (toutes les decompositions)
                                  % X=[1], Y=[2,3] ;
                                  % X=[1,2], Y=[3] ;
                                  % X=[1,2,3], Y=[]
```

## 3.3 Operations classiques sur les listes

### Renverser (avec accumulateur)

```prolog
% renverser(+X, ?Y) : Y est X a l'envers
renverser(X, Y) :- renverser_acc(X, [], Y).

renverser_acc([], Acc, Acc).
renverser_acc([X | R], Acc, Res) :-
    renverser_acc(R, [X | Acc], Res).
```

**Trace** : `renverser([a, b, c], Y)`
```
renverser_acc([a, b, c], [], Y)
  renverser_acc([b, c], [a], Y)
    renverser_acc([c], [b, a], Y)
      renverser_acc([], [c, b, a], Y)
        Y = [c, b, a]   -- SUCCES
```

### Compter les occurrences

```prolog
% compte(+A, +X, ?N) : N occurrences de A dans X
compte(_, [], 0).
compte(A, [A | R], N) :-
    compte(A, R, M),
    N is M + 1.
compte(A, [B | R], N) :-
    A \== B,
    compte(A, R, N).
```

### Palindrome

```prolog
palind(X) :- renverser(X, X).

?- palind([a, b, b, a]).  % true
?- palind([a, b, c]).     % false
```

### N-ieme element

```prolog
% enieme(+N, +X, -A) : A est l'element de rang N
enieme(1, [A | _], A).
enieme(N, [_ | X], Res) :-
    N > 1,
    M is N - 1,
    enieme(M, X, Res).
```

### Hors-de (non-appartenance)

```prolog
% hors_de(+A, +X) : A n'est pas dans X
hors_de(_, []).
hors_de(A, [Y | X]) :-
    A \== Y,
    hors_de(A, X).
```

### Tous differents

```prolog
% tous_diff(+X) : tous les elements sont distincts
tous_diff([]).
tous_diff([X | R]) :-
    hors_de(X, R),
    tous_diff(R).
```

## 3.4 Operations avancees

### Debute par / Sous-liste

```prolog
% debute_par(+X, ?Y) : X commence par Y
debute_par(_, []).
debute_par([A | RX], [A | RY]) :-
    debute_par(RX, RY).

% sous_liste(+X, ?Y) : Y est sous-liste contigue de X
sous_liste(_, []).
sous_liste([A | RX], [A | RY]) :-
    debute_par(RX, RY).
sous_liste([_ | RX], Y) :-
    Y = [_ | _],          % Y non vide
    sous_liste(RX, Y).
```

### Elimination des doublons

```prolog
% elim(+X, -Y) : Y = X sans doublons (garde la derniere occurrence)
elim([], []).
elim([A | RX], [A | RY]) :-
    hors_de(A, RX),
    elim(RX, RY).
elim([X | RX], Y) :-
    membre(X, RX),
    elim(RX, Y).
```

### Tri par insertion

```prolog
tri([], []).
tri([E | L1], L2) :-
    tri(L1, LP),
    inserer(E, LP, L2).

inserer(E, [], [E]).
inserer(E, [X | L1], [E, X | L1]) :-
    E =< X.
inserer(E, [X | L1], [X | L2]) :-
    E > X,
    inserer(E, L1, L2).
```

### Concatenation triple

```prolog
% conc3(+X, +Y, +Z, ?T) : T = X ++ Y ++ Z
conc3([], [], Z, Z).
conc3([], [B | Y], Z, [B | Res]) :-
    conc3([], Y, Z, Res).
conc3([A | X], Y, Z, [A | Res]) :-
    conc3(X, Y, Z, Res).
```

## 3.5 Operations ensemblistes

Les ensembles sont representes par des listes sans doublons.

```prolog
% inclus(+X, +Y) : tous les elements de X sont dans Y
inclus([], _).
inclus([A | R], Y) :-
    membre(A, Y),
    inclus(R, Y).

% non_inclus(+X, +Y) : au moins un element de X pas dans Y
non_inclus([A | _], Y) :- hors_de(A, Y).
non_inclus([A | R], Y) :-
    membre(A, Y),
    non_inclus(R, Y).

% union_ens(+X, +Y, ?Z) : Z est l'union de X et Y
union_ens([], Y, Y).
union_ens([A | R], Y, Z) :-
    membre(A, Y),
    union_ens(R, Y, Z).
union_ens([A | R], Y, [A | Z]) :-
    hors_de(A, Y),
    union_ens(R, Y, Z).
```

## 3.6 Modes des predicats

Le **mode** indique quels arguments sont fournis (+) ou cherches (-) ou les deux (?).

```
membre(?A, +X)     % On peut chercher A ou verifier son appartenance
compte(+A, +X, ?N) % A et X donnes, N calcule ou verifie
append(?X, ?Y, ?Z) % N'importe quelle combinaison fonctionne
```

Pour supporter des modes differents, on peut ecrire des predicats alternatifs :

```prolog
% enieme(+N, +X, -A) : connait N et X, cherche A
enieme(1, [A | _], A).
enieme(N, [_ | X], Res) :- N > 1, M is N-1, enieme(M, X, Res).

% enieme2(-N, +X, +A) : connait X et A, cherche N
enieme2(1, [A | _], A).
enieme2(N, [_ | R], A) :- enieme2(M, R, A), N is M + 1.

% eniemefinal(?N, +X, ?A) : combine les deux modes
eniemefinal(N, X, A) :- nonvar(N), !, enieme(N, X, A).
eniemefinal(N, X, A) :- enieme2(N, X, A).
```

---

## CHEAT SHEET -- Listes

```
NOTATION
  []              liste vide
  [H|T]           tete H, queue T
  [a,b,c]         = [a|[b|[c|[]]]]
  [X,Y|Z]         2 premiers + reste

PREDICATS FONDAMENTAUX
  membre(A, L)          A dans L
  append(X, Y, Z)       Z = X ++ Y
  length(L, N)          longueur
  nth1(N, L, E)         N-ieme element (1-indexe)
  last(L, E)            dernier element
  reverse(L, R)         renverser
  msort(L, S)           trier
  flatten(L, F)         aplatir

PATTERNS RECURSIFS
  p([], ...).                      % cas de base : liste vide
  p([H|T], ...) :- ..., p(T, ...). % cas recursif : traiter H, recurser sur T

AVEC ACCUMULATEUR
  p(L, R) :- p_acc(L, [], R).
  p_acc([], Acc, Acc).
  p_acc([H|T], Acc, R) :- p_acc(T, [H|Acc], R).

OPERATIONS ENSEMBLISTES
  inclus(X, Y)           X sous-ensemble de Y
  union_ens(X, Y, Z)     Z = X union Y
  hors_de(A, L)          A pas dans L
  tous_diff(L)           tous elements distincts
  elim(L, R)             supprimer doublons
```
