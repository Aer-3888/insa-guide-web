---
title: "Chapitre 4 : Recursion en Prolog"
sidebar_position: 4
---

# Chapitre 4 : Recursion en Prolog

## 4.1 Schema recursif de base

En Prolog, il n'y a pas de boucles. Toute iteration se fait par **recursion**.

### Structure type

```prolog
% Cas de base : condition d'arret
predicat(cas_trivial, resultat_trivial).

% Cas recursif : decomposer, recurser, combiner
predicat(cas_general, resultat) :-
    decomposer(cas_general, partie, reste),
    predicat(reste, sous_resultat),
    combiner(partie, sous_resultat, resultat).
```

### Exemple : longueur d'une liste

```prolog
longueur([], 0).                    % base : liste vide -> 0
longueur([_ | R], N) :-             % recursif : ignorer la tete
    longueur(R, M),                 %   calculer la longueur du reste
    N is M + 1.                     %   ajouter 1
```

**Trace** : `longueur([a, b, c], N)`
```
longueur([a, b, c], N)
  longueur([b, c], M1)
    longueur([c], M2)
      longueur([], M3)
        M3 = 0                 % cas de base
      M2 is 0 + 1 = 1
    M1 is 1 + 1 = 2
  N is 2 + 1 = 3
```

## 4.2 Recursion sur les listes

### Pattern 1 : Parcours simple

```prolog
% Afficher tous les elements
afficher([]).
afficher([H | T]) :-
    write(H), nl,
    afficher(T).
```

### Pattern 2 : Filtrage (construction d'une nouvelle liste)

```prolog
% Garder les elements > N
filtrer(_, [], []).
filtrer(N, [H | T], [H | R]) :-   % garder H si H > N
    H > N,
    filtrer(N, T, R).
filtrer(N, [H | T], R) :-          % ignorer H sinon
    H =< N,
    filtrer(N, T, R).
```

### Pattern 3 : Transformation (mapper)

```prolog
% Doubler chaque element
doubler([], []).
doubler([H | T], [D | R]) :-
    D is H * 2,
    doubler(T, R).
```

### Pattern 4 : Reduction (fold)

```prolog
% Somme des elements
somme([], 0).
somme([H | T], S) :-
    somme(T, S1),
    S is S1 + H.

% Maximum
maxi([X], X).
maxi([X | L], X) :- maxi(L, Y), X >= Y.
maxi([X | L], Y) :- maxi(L, Y), X < Y.
```

## 4.3 Accumulateurs

Un **accumulateur** est un argument supplementaire qui accumule le resultat au fur et a mesure. Avantage : permet la **recursion terminale** (plus efficace).

### Sans accumulateur (O(n^2) pour renverser)

```prolog
% Renverser naif : append a chaque etape -> O(n^2)
renverser_naif([], []).
renverser_naif([H | T], R) :-
    renverser_naif(T, RT),
    append(RT, [H], R).
```

### Avec accumulateur (O(n))

```prolog
% Renverser avec accumulateur : O(n)
renverser(X, Y) :- renverser_acc(X, [], Y).

renverser_acc([], Acc, Acc).           % base : acc = resultat
renverser_acc([H | T], Acc, Res) :-    % recursif
    renverser_acc(T, [H | Acc], Res).  % ajouter H en tete de acc
```

**Trace** : `renverser([1, 2, 3], Y)`
```
renverser_acc([1, 2, 3], [], Y)
  renverser_acc([2, 3], [1], Y)
    renverser_acc([3], [2, 1], Y)
      renverser_acc([], [3, 2, 1], Y)
        Y = [3, 2, 1]              % l'accumulateur EST le resultat
```

### Accumulateur pour la somme

```prolog
somme(L, S) :- somme_acc(L, 0, S).

somme_acc([], Acc, Acc).
somme_acc([H | T], Acc, S) :-
    Acc1 is Acc + H,
    somme_acc(T, Acc1, S).
```

### Accumulateur pour compter

```prolog
% Nombre d'occurrences de A dans L
compte_acc(_, [], Acc, Acc).
compte_acc(A, [A | T], Acc, N) :-
    Acc1 is Acc + 1,
    compte_acc(A, T, Acc1, N).
compte_acc(A, [B | T], Acc, N) :-
    A \== B,
    compte_acc(A, T, Acc, N).
```

## 4.4 Recursion sur les arbres

Les arbres binaires sont representes par des termes composes :
```prolog
vide                              % arbre vide
arb_bin(Racine, Gauche, Droite)   % noeud
```

### Verification

```prolog
arbre_binaire(vide).
arbre_binaire(arb_bin(N, G, D)) :-
    integer(N),
    arbre_binaire(G),
    arbre_binaire(D).
```

### Recherche dans un arbre

```prolog
dans_arbre(E, arb_bin(E, _, _)).           % trouve a la racine
dans_arbre(E, arb_bin(N, G, _)) :-         % chercher a gauche
    E \== N,
    dans_arbre(E, G).
dans_arbre(E, arb_bin(N, _, D)) :-         % chercher a droite
    E \== N,
    dans_arbre(E, D).
```

### Parcours d'arbres

```prolog
% Infixe : Gauche, Racine, Droite
infixe(vide, []).
infixe(arb_bin(N, G, D), L) :-
    infixe(G, LG),
    infixe(D, LD),
    append(LG, [N | LD], L).

% Prefixe : Racine, Gauche, Droite
prefixe(vide, []).
prefixe(arb_bin(N, G, D), [N | L]) :-
    prefixe(G, LG),
    prefixe(D, LD),
    append(LG, LD, L).

% Postfixe : Gauche, Droite, Racine
postfixe(vide, []).
postfixe(arb_bin(N, G, D), L) :-
    postfixe(G, LG),
    postfixe(D, LD),
    append(LG, LD, LGD),
    append(LGD, [N], L).
```

**Trace** : `infixe` de l'arbre `arb_bin(1, arb_bin(2, arb_bin(6, vide, vide), vide), arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide)))`

```
         1
        / \
       2   3
      /   / \
     6   4   5

infixe -> [6, 2, 1, 4, 3, 5]
prefixe -> [1, 2, 6, 3, 4, 5]
postfixe -> [6, 2, 4, 5, 3, 1]
```

### Insertion dans un ABR

```prolog
% insertion_arbre_ordonne(+X, +B1, -B2) : insere X dans l'ABR B1
insertion_arbre_ordonne(X, vide, arb_bin(X, vide, vide)).
insertion_arbre_ordonne(X, arb_bin(N, G, D), arb_bin(N, G1, D)) :-
    X < N,
    insertion_arbre_ordonne(X, G, G1).
insertion_arbre_ordonne(X, arb_bin(N, G, D), arb_bin(N, G, D1)) :-
    X > N,
    insertion_arbre_ordonne(X, D, D1).
insertion_arbre_ordonne(X, arb_bin(X, G, D), arb_bin(X, G, D)).  % deja present
```

## 4.5 Recursion sur les relations (fermeture transitive)

```prolog
% ancetre(X, Y) : X est un ancetre de Y
ancetre(X, Y) :- parent(X, Y).                  % base : parent direct
ancetre(X, Y) :- parent(P, Y), ancetre(X, P).   % recursif : transitivite

% est_compose_de(C, U) : composition transitive
est_compose_de(C, U) :- assemblage(C, U, _).           % direct
est_compose_de(C, V) :- assemblage(C, U, _), est_compose_de(U, V).  % transitif
```

**Attention a l'ordre des clauses** : toujours mettre le cas de base AVANT le cas recursif pour eviter les boucles infinies.

## 4.6 Terminaison

Un predicat recursif **termine** si :
1. Le cas de base est **atteignable** (la taille du probleme diminue)
2. Les appels recursifs operent sur des **arguments strictement plus petits**
3. Il n'y a **pas de cycles** dans les donnees

### Piege classique : recursion gauche

```prolog
% BOUCLE INFINIE (recursion gauche) :
ancetre(X, Y) :- ancetre(X, P), parent(P, Y).  % DANGER !
ancetre(X, Y) :- parent(X, Y).

% CORRECT (cas de base d'abord, recursion dans le corps) :
ancetre(X, Y) :- parent(X, Y).
ancetre(X, Y) :- parent(P, Y), ancetre(X, P).
```

---

## CHEAT SHEET -- Recursion

```
SCHEMA RECURSIF
  pred(base_case, trivial_result).
  pred(general, result) :-
      decompose, pred(smaller, sub_result), combine.

LISTES
  pred([], base).                    % liste vide
  pred([H|T], r) :- ..., pred(T, r2), ... .  % traiter H, recurser sur T

ACCUMULATEUR
  pred(L, R) :- pred_acc(L, init, R).
  pred_acc([], Acc, Acc).            % acc EST le resultat
  pred_acc([H|T], Acc, R) :-
      NewAcc = ...(Acc, H),
      pred_acc(T, NewAcc, R).

ARBRES
  pred(vide, base).
  pred(arb_bin(N, G, D), r) :-
      pred(G, rg), pred(D, rd), combine(N, rg, rd, r).

FERMETURE TRANSITIVE
  rel(X, Y) :- base_rel(X, Y).
  rel(X, Y) :- base_rel(X, Z), rel(Z, Y).

TERMINAISON
  - Cas de base atteignable
  - Argument strictement plus petit a chaque appel
  - Pas de recursion gauche
  - Cas de base AVANT le cas recursif
```
