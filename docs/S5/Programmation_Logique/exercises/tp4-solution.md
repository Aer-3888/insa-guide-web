---
title: "TP4 - Arbres binaires"
sidebar_position: 4
---

# TP4 - Arbres binaires

> D'apres les consignes de l'enseignant : `S5/Programmation_Logique/data/moodle/tp/tp4/README.md`

---

### Representation

```prolog noexec
% Arbre vide
vide

% Arbre non vide : arb_bin(Racine, SousArbreGauche, SousArbreDroit)
%
%        1
%       / \
%      2   3
%     /   / \
%    6   4   5
%
arb_bin(1,
    arb_bin(2, arb_bin(6, vide, vide), vide),
    arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide)))
```

---

## Exercice Q1

### arbre_binaire(+B) : B est un arbre binaire d'entiers

**Reponse :**

```prolog
arbre_binaire(vide).
arbre_binaire(arb_bin(N, G, D)) :-
    integer(N),
    arbre_binaire(G),
    arbre_binaire(D).
```

Verification recursive. Un arbre est soit `vide` (cas de base), soit un noeud dont la racine est un entier et les sous-arbres sont des arbres binaires.

**Test :**

```
?- arbre_binaire(arb_bin(1, arb_bin(2, arb_bin(6, vide, vide), vide),
                           arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide)))).
true.

?- arbre_binaire(arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, 7, vide))).
false.    % 7 n'est pas un terme arb_bin ou vide
```

---

## Exercice Q2

### dans_arbre_binaire(+E, +B) : E est une etiquette de B

**Reponse :**

```prolog
dans_arbre_binaire(E, arb_bin(E, _, _)).
dans_arbre_binaire(E, arb_bin(N, G, _)) :-
    \==(E, N),
    dans_arbre_binaire(E, G).
dans_arbre_binaire(E, arb_bin(N, _, D)) :-
    \==(E, N),
    dans_arbre_binaire(E, D).
```

Recherche en profondeur. Trois cas : l'element est a la racine, dans le sous-arbre gauche, ou dans le droit. Le test `\==(E, N)` evite la redondance avec la clause 1.

**Test :**

```
?- dans_arbre_binaire(4, arb_bin(1, arb_bin(2, arb_bin(6, vide, vide), vide),
                                   arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide)))).
true.

?- dans_arbre_binaire(12, arb_bin(1, arb_bin(2, arb_bin(6, vide, vide), vide),
                                    arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide)))).
false.
```

---

## Exercice Q3

### sous_arbre_binaire(+S, +B) : S est un sous-arbre de B

**Reponse :**

```prolog
sous_arbre_binaire(S, S) :-
    arbre_binaire(S),
    S \== vide.
sous_arbre_binaire(S, arb_bin(_, G, _)) :-
    sous_arbre_binaire(S, G).
sous_arbre_binaire(S, arb_bin(_, _, D)) :-
    sous_arbre_binaire(S, D).
```

Un arbre est sous-arbre de lui-meme (clause 1 avec reflexivite), ou sous-arbre d'un de ses fils (clauses 2 et 3). On exclut `vide` comme sous-arbre pour eviter les faux positifs.

**Test :**

```
?- sous_arbre_binaire(arb_bin(4, vide, vide),
     arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, arb_bin(7, vide, vide), vide))).
true.

?- sous_arbre_binaire(arb_bin(2, arb_bin(1, vide, vide), arb_bin(4, vide, vide)),
     arb_bin(6, arb_bin(2, arb_bin(1, vide, vide), arb_bin(4, vide, vide)),
              arb_bin(8, arb_bin(2, arb_bin(1, vide, vide), arb_bin(4, vide, vide)),
                        arb_bin(10, vide, vide)))).
true.
```

---

## Exercice Q4

### remplacer(+SA1, +SA2, +B, -B1) : Remplacer SA1 par SA2 dans B

**Reponse :**

```prolog
remplacer(_, _, vide, vide).
remplacer(SA1, SA2, SA1, SA2) :- arbre_binaire(SA1), !.
remplacer(SA1, SA2, arb_bin(N, BG, BD), arb_bin(N, B1G, B1D)) :-
    remplacer(SA1, SA2, BG, B1G),
    remplacer(SA1, SA2, BD, B1D).
```

Si l'arbre courant est `vide`, le resultat est `vide`. Si l'arbre courant est egal a SA1, on le remplace par SA2 (avec cut pour eviter les doublons). Sinon, on recurse dans les sous-arbres. Le cut dans la clause 2 empeche le backtracking vers la clause 3 apres remplacement -- c'est un cut rouge qui change la semantique.

**Test :**

```
?- remplacer(arb_bin(4, vide, vide), arb_bin(7, arb_bin(5, vide, vide), vide),
     arb_bin(6, arb_bin(2, arb_bin(1, vide, vide), arb_bin(4, vide, vide)),
              arb_bin(8, arb_bin(2, arb_bin(1, vide, vide), arb_bin(4, vide, vide)),
                        arb_bin(10, vide, vide))),
     B).
B = arb_bin(6, arb_bin(2, arb_bin(1, vide, vide), arb_bin(7, arb_bin(5, vide, vide), vide)),
             arb_bin(8, arb_bin(2, arb_bin(1, vide, vide), arb_bin(7, arb_bin(5, vide, vide), vide)),
                       arb_bin(10, vide, vide))).
```

---

## Exercice Q5

### isomorphes(+B1, +B2) : B1 et B2 sont isomorphes (meme structure, branches permutees)

**Reponse :**

```prolog
isomorphes(vide, vide).
isomorphes(arb_bin(_, B1G, B1D), arb_bin(_, B2G, B2D)) :-
    isomorphes(B1G, B2G),
    isomorphes(B1D, B2D).
isomorphes(arb_bin(_, B1G, B1D), arb_bin(_, B2G, B2D)) :-
    isomorphes(B1G, B2D),
    isomorphes(B1D, B2G).
```

Deux arbres vides sont isomorphes. Pour les noeuds, les sous-arbres peuvent etre dans le meme ordre (clause 2) ou permutes (clause 3). On ne compare PAS les etiquettes (les `_`), seule la structure compte.

**Test :**

```
?- isomorphes(arb_bin(3, arb_bin(4, vide, vide),
                        arb_bin(5, arb_bin(6, vide, vide), arb_bin(7, vide, vide))),
              arb_bin(3, arb_bin(5, arb_bin(6, vide, vide), arb_bin(7, vide, vide)),
                        arb_bin(4, vide, vide))).
true.    % branches permutees au premier niveau

?- isomorphes(arb_bin(3, arb_bin(4, vide, vide),
                        arb_bin(5, arb_bin(6, vide, vide), arb_bin(7, vide, vide))),
              arb_bin(3, arb_bin(6, vide, vide),
                        arb_bin(5, arb_bin(4, vide, vide), arb_bin(7, vide, vide)))).
false.   % structures differentes
```

---

## Exercice Q6

### infixe(+B, -L) : Parcours infixe (+ prefixe et postfixe)

**Reponse :**

```prolog
% Infixe : Gauche - Racine - Droite
infixe(vide, []).
infixe(arb_bin(N, G, D), L) :-
    infixe(G, LG),
    infixe(D, LD),
    append(LG, [N | LD], L).

% Prefixe : Racine - Gauche - Droite
prefixe(vide, []).
prefixe(arb_bin(N, G, D), [N | L]) :-
    prefixe(G, LG),
    prefixe(D, LD),
    append(LG, LD, L).

% Postfixe : Gauche - Droite - Racine
postfixe(vide, []).
postfixe(arb_bin(N, G, D), L) :-
    postfixe(G, LG),
    postfixe(D, LD),
    append(LG, LD, LGD),
    append(LGD, [N], L).
```

**Test :**

```
%        1
%       / \
%      2   3
%     /   / \
%    6   4   5

?- infixe(arb_bin(1, arb_bin(2, arb_bin(6, vide, vide), vide),
                     arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide))), L).
L = [6, 2, 1, 4, 3, 5].

?- prefixe(arb_bin(1, arb_bin(2, arb_bin(6, vide, vide), vide),
                      arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide))), L).
L = [1, 2, 6, 3, 4, 5].

?- postfixe(arb_bin(1, arb_bin(2, arb_bin(6, vide, vide), vide),
                       arb_bin(3, arb_bin(4, vide, vide), arb_bin(5, vide, vide))), L).
L = [6, 2, 4, 5, 3, 1].
```

---

## Exercice Q7

### insertion_arbre_ordonne(+X, +B1, -B2) : Insertion dans un ABR

**Reponse :**

```prolog
insertion_arbre_ordonne(X, vide, arb_bin(X, vide, vide)).
insertion_arbre_ordonne(X, arb_bin(N, G, D), arb_bin(N, G1, D)) :-
    X < N,
    insertion_arbre_ordonne(X, G, G1).
insertion_arbre_ordonne(X, arb_bin(N, G, D), arb_bin(N, G, D1)) :-
    X > N,
    insertion_arbre_ordonne(X, D, D1).
insertion_arbre_ordonne(X, arb_bin(X, G, D), arb_bin(X, G, D)).
```

L'ABR place les valeurs inferieures a gauche et superieures a droite. Si l'arbre est vide, on cree une feuille. Si X < N, on insere a gauche. Si X > N, a droite. Si X = N, l'arbre est retourne inchange (pas de doublons).

**Test :**

```
%        8
%       / \
%      4   12
%     / \   /
%    2   6 10

?- insertion_arbre_ordonne(9,
     arb_bin(8, arb_bin(4, arb_bin(2, vide, vide), arb_bin(6, vide, vide)),
               arb_bin(12, arb_bin(10, vide, vide), vide)), B).
B = arb_bin(8, arb_bin(4, arb_bin(2, vide, vide), arb_bin(6, vide, vide)),
             arb_bin(12, arb_bin(10, arb_bin(9, vide, vide), vide), vide)).
```

---

## Exercice Q8

### insertion_arbre_ordonne1(+X, +B) : Insertion "en place" via variables libres

**Reponse :**

```prolog noexec
insertion_arbre_ordonne1(X, B) :-
    free(B), !,
    B = arb_bin(X, _, _).
insertion_arbre_ordonne1(X, arb_bin(N, G, _)) :-
    X < N, !,
    insertion_arbre_ordonne1(X, G).
insertion_arbre_ordonne1(X, arb_bin(N, _, D)) :-
    X > N, !,
    insertion_arbre_ordonne1(X, D).
insertion_arbre_ordonne1(X, arb_bin(X, _, _)).
```

Au lieu de representer les feuilles par `vide`, on utilise des variables non instanciees. `free/1` (ECLiPSe) ou `var/1` (SWI-Prolog) teste si un terme est une variable libre. L'insertion instancie directement la variable au lieu de copier l'arbre. Les cuts sont necessaires pour empecher le backtracking une fois la decision prise.

**Test :**

```
% Construire un ABR incrementalement
?- insertion_arbre_ordonne1(5, B),
   insertion_arbre_ordonne1(3, B),
   insertion_arbre_ordonne1(7, B).
B = arb_bin(5, arb_bin(3, _, _), arb_bin(7, _, _)).
```
