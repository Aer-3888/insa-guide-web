---
title: "Annale 2023 -- Correction detaillee"
sidebar_position: 2
---

# Annale 2023 -- Correction detaillee

## Exercice 1 : Operations sur les listes

### Q1 : is_sorted/1

Verifie qu'une liste d'entiers est triee en ordre croissant.

```prolog
is_sorted([]).
is_sorted([_]) :- !.                     % liste de 1 element -> triee
is_sorted([X, Y | L]) :-
    X =< Y,
    is_sorted([Y | L]).
```

**Trace** : `is_sorted([1, 3, 5])`
```
is_sorted([1, 3, 5])
  1 =< 3 -> OK
  is_sorted([3, 5])
    3 =< 5 -> OK
    is_sorted([5])
      clause 2 : ! -> SUCCES
```

**Trace** : `is_sorted([1, 5, 3])`
```
is_sorted([1, 5, 3])
  1 =< 5 -> OK
  is_sorted([5, 3])
    5 =< 3 -> ECHEC
  ECHEC
```

### Q2 : merge/3

Fusionne deux listes triees en une seule liste triee.

```prolog
merge2([], L, L).
merge2(L, [], L).
merge2([X1 | L1], [X2 | L2], [X1 | L3]) :-
    X1 =< X2,
    merge2(L1, [X2 | L2], L3).
merge2([X1 | L1], [X2 | L2], [X2 | L3]) :-
    X1 >= X2,
    merge2([X1 | L1], L2, L3).
```

**Trace** : `merge2([1, 4], [2, 3], R)`
```
merge2([1, 4], [2, 3], R)
  1 =< 2 -> R = [1 | R1]
  merge2([4], [2, 3], R1)
    4 >= 2 -> R1 = [2 | R2]
    merge2([4], [3], R2)
      4 >= 3 -> R2 = [3 | R3]
      merge2([4], [], R3)
        R3 = [4]
      R2 = [3, 4]
    R1 = [2, 3, 4]
  R = [1, 2, 3, 4]
```

### Q3 : zip/3

Combine deux listes element par element en paires.

```prolog
zip([], [], []).
zip([X1 | L1], [X2 | L2], [pair(X1, X2) | L3]) :-
    zip(L1, L2, L3).
```

```prolog
?- zip([a, b, c], [1, 2, 3], R).
% R = [pair(a, 1), pair(b, 2), pair(c, 3)]
```

### Q4 : unzip/3

Separe une liste de paires en deux listes -- defini via zip en mode inverse.

```prolog
unzip(L3, L1, L2) :- zip(L1, L2, L3).
```

L'unification fait tout le travail : zip est suffisamment general pour fonctionner dans les deux sens.

### Q5 : insert/3

Insere un element a toutes les positions possibles (non-deterministe).

```prolog
insert(X, L, [X | L]).                        % inserer en tete
insert(X, [Y | L], [Y | Res]) :-
    insert(X, L, Res).                          % inserer plus loin
```

```prolog
?- insert(x, [a, b], R).
% R = [x, a, b] ;
% R = [a, x, b] ;
% R = [a, b, x]
```

### Q6 : permutation/2

Genere toutes les permutations d'une liste.

```prolog
permutation([], []).
permutation([X | S], Y) :-
    permutation(S, Z),
    permutation_aux(X, Z, Y).

permutation_aux(X, S, [X | S]).                % inserer en tete
permutation_aux(X, [Y | T], [Y | S]) :-
    permutation_aux(X, T, S).                    % inserer plus loin
```

**Mecanisme** : on retire le premier element, on permute le reste, puis on insere l'element a toutes les positions possibles.

---

## Exercice 2 : Base COVID

Base de faits donnee :
```prolog
femme(laurence).
homme(bertrand). homme(yann).
collegues(laurence, yann). collegues(yann, bertrand). ...
temperature(pascal, 37). temperature(yann, 38). temperature(bertrand, 39).
toux(bertrand).
odorat(eric, oui). odorat(yann, non).
gout(laurence, moyen). gout(yann, non).
```

### Q10 : individu/1

"X est un individu connu dans la base (apparait dans au moins un fait)."

```prolog
individu(X) :- femme(X).
individu(X) :- homme(X).
individu(X) :- toux(X).
individu(X) :- odorat(X, _).
individu(X) :- gout(X, _).
individu(X) :- collegues(X, _).
individu(X) :- collegues(_, X).
individu(X) :- temperature(X, _).
```

Note : un individu peut apparaitre dans plusieurs faits. Ce predicat est non-deterministe (plusieurs clauses peuvent reussir pour le meme X).

### Q11 : fievre/1

```prolog
fievre(X) :- temperature(X, T), T >= 38.
```

Resultats : `yann` (38), `bertrand` (39).

### Q12 : covid/1, grippe/1

```prolog
covid(X) :- fievre(X).
covid(X) :- toux(X).
covid(X) :- gout(X, non), odorat(X, non).

grippe(X) :- fievre(X), toux(X).
```

- `covid(yann)` : fievre (38>=38) -> SUCCES ; aussi gout(non) + odorat(non)
- `covid(bertrand)` : fievre (39>=38) -> SUCCES ; aussi toux
- `grippe(bertrand)` : fievre(39>=38) ET toux -> SUCCES
- `grippe(yann)` : fievre(38>=38) mais pas toux -> ECHEC

### Q13 : travail/1, travaillent/1

"X peut travailler s'il n'a ni la grippe ni le COVID."

```prolog
travail(X) :-
    individu(X),
    \+(grippe(X)),
    \+(covid(X)).

travaillent(L) :-
    findall(X, travail(X), L2),
    sort(L2, L).                    % sort elimine les doublons et trie
```

L'ordre est important : `individu(X)` instancie X **avant** les `\+`.

### Q14 : contagion/3

"Trouver toutes les personnes potentiellement contaminees par X en N etapes."

```prolog
contagion(X, N, L) :-
    findall(Y, contamine(N, X, Y), L1),
    sort(L1, L).

contamine(N, X, Y) :- N >= 1, collegues(X, Y).        % contact direct (->)
contamine(N, X, Y) :- N >= 1, collegues(Y, X).        % contact direct (<-)
contamine(N, X, Y) :-
    N > 1,
    M is N - 1,
    collegues(X, Z),
    contamine(M, Z, Y).                                 % propagation transitive
```

**Trace** : `contagion(yann, 2, L)` (contamination en 2 etapes max)
```
N=2 : collegues(yann, bertrand), collegues(bertrand, yann) (direct)
       + collegues(yann, X), puis collegues(X, Y) pour N-1=1
         collegues(yann, bertrand) -> contamine(1, bertrand, Y)
           collegues(bertrand, eric) -> Y=eric
         collegues(yann, pascal) -> contamine(1, pascal, Y)
           collegues de pascal -> ...

L = [bertrand, eric, laurence, pascal, ...] (selon la base)
```

---

## Points cles de cette annale

1. **Predicats multi-clauses** : `individu/1` montre qu'un predicat peut avoir de nombreuses clauses alternatives
2. **Negation** : `\+(grippe(X))` doit etre appele APRES que X soit instancie par `individu(X)`
3. **findall + sort** : pattern classique pour collecter et dedupliquer
4. **Recursion sur un compteur** : `contamine` utilise N comme compteur de profondeur
5. **zip/unzip** : exploite le multi-mode de Prolog (un seul predicat pour les deux directions)
