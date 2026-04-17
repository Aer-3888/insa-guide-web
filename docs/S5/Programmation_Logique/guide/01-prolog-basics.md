---
title: "Chapitre 1 : Bases de Prolog"
sidebar_position: 1
---

# Chapitre 1 : Bases de Prolog

## 1.1 Le paradigme logique

Prolog (PROgrammation en LOGique) est un langage **declaratif** :
- On declare des **faits** (ce qui est vrai)
- On declare des **regles** (comment deduire de nouvelles verites)
- On pose des **requetes** (questions au systeme)

Prolog trouve les reponses par **unification** et **backtracking**.

## 1.2 Faits

Un fait est une assertion inconditionnelle. C'est la brique de base.

```prolog
% Syntaxe : predicat(arg1, arg2, ...).
% Un fait se termine TOUJOURS par un point.

homme(charles_V).
femme(isabeau_de_Baviere).
pere(charles_V, charles_VI).
mere(isabeau_de_Baviere, charles_VII).
roi(charles_V, le_sage, 1364, 1380).

% Base de donnees d'un restaurant
hors_d_oeuvre(artichauts_Melanie).
viande(grillade_de_boeuf).
poisson(bar_aux_algues).
dessert(sorbet_aux_poires).
calories(grillade_de_boeuf, 532).
```

**Regles de nommage** :
- Les **atomes** commencent par une minuscule ou sont entre guillemets simples : `charles_V`, `'Bonjour'`
- Les **variables** commencent par une majuscule ou un underscore : `X`, `Parent`, `_Temp`
- La **variable anonyme** `_` ne retient pas de valeur (chaque `_` est independant)
- Les **nombres** sont des constantes : `42`, `3.14`

## 1.3 Regles

Une regle deduit un fait a partir d'autres faits. Syntaxe : `Tete :- Corps.`

```prolog
% "P est un plat s'il est un poisson"
plat(P) :- poisson(P).
% "P est un plat s'il est une viande"
plat(P) :- viande(P).

% "E est enfant de P si P est le pere de E"
enfant(E, P) :- pere(P, E).
% "E est enfant de P si P est la mere de E"
enfant(E, P) :- mere(P, E).

% "Un repas est compose d'un hors d'oeuvre, un plat et un dessert"
repas(H, P, D) :-
    hors_d_oeuvre(H),
    plat(P),
    dessert(D).
```

La **virgule** (`,`) signifie **ET** (conjonction).
Le **point-virgule** (`;`) signifie **OU** (disjonction), mais on prefere utiliser des clauses multiples.

## 1.4 Requetes (Queries)

On interroge la base de connaissances :

```prolog
?- homme(charles_V).
% -> true.

?- homme(isabeau_de_Baviere).
% -> false.

?- pere(charles_V, X).
% -> X = charles_VI.

?- enfant(X, charles_V).
% -> X = charles_VI ;
%    X = louis_d_Orleans.

% Lister tous les plats
?- plat(P).
% -> P = bar_aux_algues ;
%    P = saumon_oseille ;
%    P = grillade_de_boeuf ;
%    P = poulet_au_tilleul.
```

**Mecanisme** : Prolog parcourt les clauses de haut en bas, tente l'unification, et propose des solutions. On tape `;` pour demander la suivante (backtracking).

## 1.5 Atomes, termes et structures

### Types de termes

| Type | Exemples | Description |
|------|----------|-------------|
| Atome | `charles_V`, `bar_aux_algues`, `trefle` | Constante symbolique |
| Nombre | `42`, `3.14`, `0` | Constante numerique |
| Variable | `X`, `Plat`, `_` | Inconnue a resoudre |
| Terme compose | `pere(charles_V, charles_VI)` | Foncteur + arguments |

### Termes composes (structures)

Un terme compose a un **foncteur** et une **arite** :

```prolog noexec
% carte/2 : foncteur 'carte', arite 2
carte(sept, trefle)

% main/5 : foncteur 'main', arite 5
main(carte(sept, trefle), carte(valet, coeur), carte(dame, carreau),
     carte(dame, pique), carte(roi, pique))

% arb_bin/3 : foncteur 'arb_bin', arite 3
arb_bin(1, arb_bin(2, vide, vide), arb_bin(3, vide, vide))
```

Les termes composes permettent de representer des **donnees structurees** sans avoir besoin de classes ou de types : arbres, cartes, paires, etc.

## 1.6 Variables et variable anonyme

```prolog
% Variable nommee : meme nom = meme valeur dans la clause
frere(F, E) :-
    homme(F),
    pere(P, F),    % P est le meme dans les deux sous-buts
    pere(P, E),
    mere(M, F),    % M est le meme dans les deux sous-buts
    mere(M, E),
    F \== E.

% Variable anonyme _ : chaque _ est independant
plat_quelconque :- plat(_).    % on ne se soucie pas du nom
roi_existe :- roi(_, _, _, _). % on ne se soucie d'aucun argument
```

**Piege frequent** : utiliser `_` quand on devrait utiliser une variable nommee.

```prolog
% FAUX : les deux _ sont independants, pas la meme personne !
grand_pere_faux(G, E) :-
    pere(G, _),
    pere(_, E).

% CORRECT : P lie les deux appels
grand_pere(G, E) :-
    pere(G, P),
    pere(P, E).
```

## 1.7 Operateurs de comparaison

| Operateur | Signification | Exemple |
|-----------|---------------|---------|
| `=` | Unification | `X = 3` (lie X a 3) |
| `\=` | Non-unification | `X \= Y` (X et Y ne s'unifient pas) |
| `==` | Identite structurelle | `X == Y` (X et Y sont le meme terme) |
| `\==` | Non-identite | `X \== Y` (X et Y ne sont pas identiques) |
| `is` | Evaluation arithmetique | `X is 3 + 4` (X = 7) |

**Attention** : `=` et `==` sont differents !

```prolog
?- X = 3.        % true, X est lie a 3
?- X == 3.       % false si X n'est pas encore lie a 3
?- 3 == 3.       % true
?- f(X) = f(3).  % true, X = 3 (unification)
?- f(X) == f(3). % false si X est libre (identite stricte)
```

---

## CHEAT SHEET -- Bases de Prolog

```
FAIT        predicat(args).                     % assertion vraie
REGLE       tete :- corps1, corps2.             % tete est vraie si corps1 ET corps2
REQUETE     ?- predicat(args).                  % question posee a Prolog

ATOME       minuscule, 'entre guillemets'       % constante symbolique
VARIABLE    Majuscule, _anonyme                 % inconnue
NOMBRE      42, 3.14                            % constante numerique
STRUCTURE   foncteur(arg1, arg2)                % terme compose

,           ET (conjonction)
;           OU (disjonction, eviter)
.           fin de clause
:-          "si" (implication inverse)
\==         different (identite)
\=          non-unifiable
=           unification
==          identite stricte
is          evaluation arithmetique

CHARGER     [fichier].  ou  consult(fichier).
TRACE       trace.      notrace.
SPY         spy predicat/arite.
```
