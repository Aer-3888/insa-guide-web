---
title: "TP8 - Puzzle des dominos"
sidebar_position: 8
---

# TP8 - Puzzle des dominos

> Following teacher instructions from: `S5/Programmation_Logique/data/moodle/tp/tp8/README.md`

---

## Representation

```prolog noexec
% Un domino : stone(A, B)
stone(2, 4)    % domino [2:4]

% Une chaine : chain(L1, L2)
% La chaine complete est : reverse(L2) ++ L1
chain([2, 4, 6], [3, 1])  % represente [1:3:2:4:6]

% Cas special : domino double isole
chain([X], [double])
```

## Donnees de test

```prolog
stones1([stone(2, 2), stone(4, 6), stone(1, 2), stone(2, 4), stone(6, 2)]).

stones2([stone(2, 2), stone(4, 6), stone(1, 2), stone(2, 4), stone(6, 2),
         stone(5, 1), stone(5, 5), stone(4, 5), stone(2, 3), stone(3, 6)]).

stones3([stone(6, 6), stone(6, 5), stone(6, 4), stone(6, 3), stone(6, 2),
         stone(6, 1), stone(6, 0),
         stone(5, 5), stone(5, 4), stone(5, 3), stone(5, 2), stone(5, 1),
         stone(5, 0),
         stone(4, 4), stone(4, 3), stone(4, 2), stone(4, 1), stone(4, 0),
         stone(3, 3), stone(3, 2), stone(3, 1), stone(3, 0),
         stone(2, 2), stone(2, 1), stone(2, 0),
         stone(1, 1), stone(1, 0),
         stone(0, 0)]).
```

---

## Affichage des chaines

```prolog noexec
print_chains([]).
print_chains([C | Rest]) :-
    print1chain(C),
    print_chains(Rest).

print1chain(chain(L1, L2)) :-
    reverse(L2, L2R),
    append(L1, L2R, L),
    print1list(L),
    writeln("").

print1list([A, B]) :-
    print1domino(A, B).
print1list([A, B, C | Rest]) :-
    print1domino(A, B),
    print1list([B, C | Rest]).

print1domino(A, B) :-
    printf("[%w:%w]", [A, B]).
```

---

## Exercise 1

### choose(+List, -Elt, -Rest) : Choisit un element dans une liste et retourne le reste

**Answer:**

```prolog
choose([E | R], E, R).
choose([E1 | R], E, [E1 | L]) :-
    choose(R, E, L).
```

`choose` est non-deterministe : il produit autant de solutions qu'il y a d'elements dans la liste. La clause 1 choisit la tete, la clause 2 garde la tete et choisit dans le reste.

**Query test:**

```
?- choose([1, 2, 3], E, R).
E = 1, R = [2, 3] ;
E = 2, R = [1, 3] ;
E = 3, R = [1, 2] ;
false.

?- choose([], E, R).
false.    % liste vide, aucun choix possible
```

---

## Exercise 2

### chains(+Stones, +Partial, -Chains) : Construit les chaines a partir des dominos restants

**Answer:**

```prolog
chains([], Acc, Acc).
chains(Stones, Acc, Res) :-
    choose(Stones, Stone, RestStones),
    chainsAux(Stone, Acc, AccRes),
    chains(RestStones, AccRes, Res).
```

Quand il n'y a plus de dominos, l'accumulateur est la solution. Sinon, on choisit un domino avec `choose`, on l'ajoute a une chaine existante avec `chainsAux`, puis on continue recursivement. Le backtracking de Prolog explore toutes les possibilites.

**Query test:**

```
% chains est utilise en interne par domino/2, pas directement
```

---

## Exercise 3

### chainsAux(+Stone, +Chains, -NewChains) : Ajoute un domino a une chaine existante

**Answer:**

```prolog
% Connecter stone(E,F) a gauche : F = debut de la chaine gauche
chainsAux(stone(E, F), [chain([F | R1], R2) | R],
                        [chain([E, F | R1], R2) | R]).

% Connecter stone(E,F) a gauche : E = debut (en retournant le domino)
chainsAux(stone(E, F), [chain([E | R1], R2) | R],
                        [chain([F, E | R1], R2) | R]).

% Connecter stone(E,F) a droite : E = debut de la chaine droite
chainsAux(stone(E, F), [chain(R1, [E | R2]) | R],
                        [chain(R1, [F, E | R2]) | R]).

% Connecter stone(E,F) a droite : F = debut de la chaine droite (en retournant)
chainsAux(stone(E, F), [chain(R1, [F | R2]) | R],
                        [chain(R1, [E, F | R2]) | R]).

% Double connecte a gauche : cree une chaine double supplementaire
chainsAux(stone(E, E), [chain([E | R1], R2) | R],
                        [chain([E, E | R1], R2), chain([E], [double]) | R]).

% Double connecte a droite : cree une chaine double supplementaire
chainsAux(stone(E, E), [chain(R1, [E | R2]) | R],
                        [chain(R1, [E, E | R2]), chain([E], [double]) | R]).

% Passer a la chaine suivante si le domino ne se connecte pas ici
chainsAux(S, [D | R], [D | Res]) :-
    chainsAux(S, R, Res).
```

Un domino `stone(E,F)` peut se connecter a gauche ou a droite d'une chaine, dans un sens ou l'autre. Les dominos doubles (`stone(E,E)`) creent aussi une chaine `[double]` supplementaire. Si le domino ne se connecte pas a la chaine courante, on passe a la suivante.

**Query test:**

```
% chainsAux est utilise en interne par chains/3
```

---

## Exercise 4

### domino(+Stones, -Chains) : Point d'entree -- resout le puzzle

**Answer:**

```prolog
domino([stone(A, A) | R], Res) :-
    chains(R, [chain([A], [A]), chain([A], [double])], Res).
domino([stone(A, B) | R], Res) :-
    A \= B,
    chains(R, [chain([A], [B])], Res).
```

Le premier domino initialise les chaines partielles :
- Domino double `stone(A,A)` : cree deux chaines, une normale `chain([A],[A])` et une double `chain([A],[double])`
- Domino normal `stone(A,B)` : cree une seule chaine `chain([A],[B])`

Ensuite `chains/3` construit la solution incrementalement par generer-et-tester avec backtracking.

**Query test:**

```
% Resoudre pour stones1 (5 dominos)
?- stones1(S), domino(S, R), print_chains(R).
% Affiche les chaines solution

% Resoudre pour stones2 (10 dominos)
?- stones2(S), domino(S, R), print_chains(R).
% Affiche les chaines solution

% Resoudre pour stones3 (jeu complet 0-6, 28 dominos)
?- stones3(S), domino(S, R), print_chains(R).
% Affiche les chaines solution

% Test : deux dominos deconnectes echouent
?- domino([stone(2, 3), stone(1, 5)], _).
false.

% Test : petit exemple avec double
?- domino([stone(2, 2), stone(1, 2)], R).
R = [chain([1, 2], [2]), chain([2], [double])].
```

---

## Algorithme complet

L'approche est "generer et tester" avec backtracking :

1. **Initialisation** (`domino/2`) : le premier domino cree la premiere chaine partielle

2. **Construction** (`chains/3`) : pour chaque domino restant, `choose` le selectionne non-deterministiquement et `chainsAux` tente de l'ajouter a une chaine existante

3. **Ajout** (`chainsAux/3`) : un domino peut se connecter a gauche ou a droite d'une chaine (dans un sens ou l'autre). Les doubles creent des chaines supplementaires

4. **Backtracking** : si un placement ne mene pas a une solution complete, Prolog revient automatiquement en arriere et essaie un autre choix

Les dominos doubles sont traites specialement car ils peuvent creer des branches isolees dans la solution.
