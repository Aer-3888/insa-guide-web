---
title: "Annale 2024 -- Correction detaillee"
sidebar_position: 3
---

# Annale 2024 -- Correction detaillee

## Exercice 1 : Base de films

Base de faits donnee :
```prolog noexec
film(Titre, Annee, NomRealisateur, Genre, Budget).
acteur(Nom, Prenom, Nationalite, DateNaissance, Genre).
vedette(Titre, NomActeur, Role).
```

### Q1 : real_acteur(N, P, T)

"N est un realisateur de prenom P qui a aussi joue en tant que vedette dans le film T qu'il a realise."

```prolog noexec
real_acteur(N, P, T) :-
    film(T, _, N, _, _),           % N est realisateur du film T
    acteur(N, P, _, _, _),         % N a le prenom P
    vedette(T, N, _).              % N est vedette dans T
```

**Unification** : le nom `N` et le titre `T` lient les trois predicats.

### Q2 : trois_vedettes(T, A)

"T est un film de l'annee A ayant au moins 3 vedettes."

```prolog noexec
trois_vedettes(T, A) :-
    film(T, A, _, _, _),
    vedette(T, N1, _),
    vedette(T, N2, _),
    vedette(T, N3, _),
    N1 \== N2,
    N2 \== N3,
    N1 \== N3.
```

Point cle : les trois `\==` assurent que les trois vedettes sont des personnes **differentes**.

### Q3 : sans_eastwood(T)

"T est un film qui n'est ni realise ni joue par Eastwood."

```prolog noexec
sans_eastwood(T) :-
    film(T, _, R, _, _),
    R \== eastwood,                 % pas realise par Eastwood
    \+(vedette(T, eastwood, _)).    % Eastwood n'est pas vedette
```

Note : `\+` est necessaire pour la negation complete ("il n'existe pas de role d'Eastwood dans T"). Le `\==` suffit pour le realisateur car il n'y en a qu'un par film.

### Q4 : genre_stable(N)

"N est un realisateur qui a toujours realise des films du meme genre."

```prolog noexec
% D'abord definir genre_instable
genre_instable(N) :-
    film(T1, _, N, G1, _),
    film(T2, _, N, G2, _),
    G1 \== G2.                      % deux films de genres differents

% genre_stable = realisateur qui N'EST PAS genre_instable
genre_stable(N) :-
    film(_, _, N, _, _),             % N est un realisateur
    \+(genre_instable(N)).
```

Pattern important : definir la propriete **negative** d'abord, puis utiliser `\+` pour obtenir la positive.

---

## Exercice 2 : Predicat mystere

### Q5 : Arbre de resolution

(Dessiner l'arbre SLD pour le predicat donne -- voir le sujet PDF pour les details)

### Q6 : Que fait mystere/3 ?

```prolog
mystere(L, E, R) :- tmp(L, E, R, []).
tmp([E|_], E, R, R) :- !.
tmp([F|L], E, Rest, Acc) :- tmp(L, E, Rest, [F|Acc]).
```

**Trace** : `mystere([a, b, c, d], c, R)`
```
tmp([a,b,c,d], c, R, [])
  a \= c -> clause 2 : F=a, L=[b,c,d], Acc=[a]
  tmp([b,c,d], c, R, [a])
    b \= c -> clause 2 : F=b, L=[c,d], Acc=[b,a]
    tmp([c,d], c, R, [b,a])
      clause 1 : E=c, R=[b,a], !
R = [b, a]
```

**Reponse** : `mystere(L, E, R)` retourne dans R le **debut de la liste L en ordre inverse**, jusqu'a la premiere occurrence de E (exclu).

### Q7 : Modifier pour retourner dans l'ordre original

On supprime la clause 2 intermediaire et on modifie la clause de base pour directement unifier l'accumulateur avec le resultat :

```prolog noexec
tmp([E|_], E, R, R) :- !.
```

L'accumulateur accumule les elements dans l'ordre inverse. Pour obtenir l'ordre original, il suffit de modifier le predicat initial pour renverser l'accumulateur a la fin, ou changer la strategie d'accumulation.

---

## Exercice 3 : Interpreteur de langage a pile

Un interpreteur pour un langage a pile : `interpreter(Programme, Pile, Environnement, Resultat)`.

La pile stocke les valeurs temporaires. Le programme est une liste d'instructions.

### Q8 : add

```prolog noexec
interpreter([add | Prog], [Op2, Op1 | Stack], Env, Res) :-
    X is Op1 + Op2,
    interpreter(Prog, [X | Stack], Env, Res).
```

L'instruction `add` depile deux operandes, les additionne, et empile le resultat.
Note : Op1 est **en dessous** de Op2 sur la pile (LIFO).

### Q9 : minus

```prolog noexec
interpreter([minus | Prog], [Op2, Op1 | Stack], Env, Res) :-
    X is Op1 - Op2,
    interpreter(Prog, [X | Stack], Env, Res).
```

### Q10 : mul

```prolog noexec
interpreter([mul | Prog], [Op2, Op1 | Stack], Env, Res) :-
    X is Op1 * Op2,
    interpreter(Prog, [X | Stack], Env, Res).
```

### Q11 : neq (not equal)

```prolog noexec
interpreter([neq | Prog], [Op2, Op1 | Stack], Env, Res) :-
    Op1 == Op2,
    interpreter(Prog, [0 | Stack], Env, Res).     % egaux -> 0 (faux)
interpreter([neq | Prog], [Op2, Op1 | Stack], Env, Res) :-
    Op1 \== Op2,
    interpreter(Prog, [1 | Stack], Env, Res).     % differents -> 1 (vrai)
```

Deux clauses : une pour le cas "egaux" (push 0), une pour "differents" (push 1).

### Q12 : if(Cond, Then, Else)

```prolog noexec
interpreter([if(Cond, Then, _Else) | Prog], Stack, Env, Res) :-
    interpreter(Cond, [], Env, 1),                 % evaluer la condition
    append(Then, Prog, NewProg),                    % concatener Then avec la suite
    interpreter(NewProg, Stack, Env, Res).
interpreter([if(Cond, _Then, Else) | Prog], Stack, Env, Res) :-
    interpreter(Cond, [], Env, 0),
    append(Else, Prog, NewProg),
    interpreter(NewProg, Stack, Env, Res).
```

La condition est evaluee sur une **pile vide**. Le resultat (0 ou 1) determine la branche.

### Q13 : assoc_set (mise a jour de l'environnement)

```prolog
assoc_set(Id, Val, [], [(Id, Val)]).                           % cle absente -> ajouter
assoc_set(Id, Val, [(Id, _) | R], [(Id, Val) | R]).            % cle trouvee -> remplacer
assoc_set(Id, Val, [(I, V) | R], [(I, V) | R1]) :-
    Id \== I,
    assoc_set(Id, Val, R, R1).                                  % continuer la recherche
```

L'environnement est une liste d'association `[(id1, val1), (id2, val2), ...]`.

### Q14 : setvar

```prolog noexec
interpreter([setvar(Id) | Prog], [V | Stack], Env, Res) :-
    assoc_set(Id, V, Env, NewEnv),
    interpreter(Prog, Stack, NewEnv, Res).
```

Depile une valeur et l'associe a la variable `Id` dans l'environnement.

### Q15 : loadvar

```prolog noexec
interpreter([loadvar(Id) | Prog], Stack, Env, Res) :-
    assoc_find(Id, Env, Val),
    interpreter(Prog, [Val | Stack], Env, Res).
```

Cherche la valeur de `Id` dans l'environnement et l'empile.

### Q16 : while(Cond, Body)

```prolog noexec
interpreter([while(Cond, Body) | Prog], Stack, Env, Res) :-
    interpreter(Cond, [], Env, 1),                           % condition vraie
    append(Body, [while(Cond, Body) | Prog], NewProg),       % re-empiler le while
    interpreter(NewProg, Stack, Env, Res).
interpreter([while(Cond, _Body) | Prog], Stack, Env, Res) :-
    interpreter(Cond, [], Env, 0),                           % condition fausse
    interpreter(Prog, Stack, Env, Res).                       % continuer
```

Point cle : quand la condition est vraie, on concatene le body avec `[while(Cond,Body)|Prog]`, ce qui cree une boucle naturelle via la recursion de Prolog.
