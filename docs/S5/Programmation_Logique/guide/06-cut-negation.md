---
title: "Chapitre 6 : Cut et Negation"
sidebar_position: 6
---

# Chapitre 6 : Cut et Negation

## 6.1 Le cut (!)

Le **cut** (`!`) est un predicat qui reussit toujours mais **supprime les points de choix** :
1. Il empeche le backtracking sur les clauses **precedentes** du meme predicat
2. Il empeche le backtracking sur les sous-buts **a gauche** du cut dans la meme clause

```prolog noexec
p(X) :- a(X), !, b(X).   % Si a(X) reussit et qu'on passe le cut,
                           % on ne reviendra JAMAIS aux autres clauses de p
                           % ni aux autres solutions de a(X)
p(X) :- c(X).             % Cette clause ne sera jamais essayee si le cut est atteint
```

### Effet du cut sur l'arbre de recherche

**Sans cut** :
```
p(X) :- a(X), b(X).
p(X) :- c(X).
a(1). a(2). a(3).
b(2). b(3).
c(4).

?- p(X).
     p(X)
    /     \
  clause1  clause2
  a(X),b(X)  c(X)
  /  |  \      |
 a1  a2  a3   c4
 |   |   |    X=4
b(1) b(2) b(3)
FAIL X=2  X=3

Solutions : X=2, X=3, X=4
```

**Avec cut** :
```
p(X) :- a(X), !, b(X).
p(X) :- c(X).

?- p(X).
     p(X)
    /     
  clause1  (clause2 coupee apres le cut)
  a(X),!,b(X)
  |
 a(1) -> ! (coupe les alternatives a(2), a(3) ET clause2)
 |
b(1) -> FAIL

Solutions : aucune !
```

Le cut a bloque a la premiere solution de `a(X)` (X=1), puis `b(1)` echoue, et le cut empeche le backtracking vers `a(2)` ou vers la clause 2.

## 6.2 Cut vert vs Cut rouge

### Cut vert (green cut) -- sans danger

Un cut **vert** ne change pas l'ensemble des solutions, il ameliore seulement les performances en evitant des calculs inutiles.

```prolog
% Sans cut : les deux clauses sont mutuellement exclusives
max(X, Y, X) :- X >= Y.
max(X, Y, Y) :- X < Y.

% Avec green cut : si la 1ere reussit, inutile de tester la 2eme
max(X, Y, X) :- X >= Y, !.
max(X, Y, Y).
```

Le cut est vert car `X >= Y` et `X < Y` sont mutuellement exclusifs. Le cut evite juste de tester `X < Y` quand on sait deja que `X >= Y`.

### Cut rouge (red cut) -- dangereux

Un cut **rouge** change les solutions du programme. Supprimer le cut donnerait des resultats differents.

```prolog
% Avec red cut : PAS de condition explicite dans la 2eme clause
max_rouge(X, Y, X) :- X >= Y, !.
max_rouge(_, Y, Y).  % DEPEND du cut pour etre correct !

% Si on enleve le cut :
% max_rouge(3, 1, 1) serait vrai ! (la 2eme clause matche toujours)
```

**Regle** : eviter les cuts rouges autant que possible. Toujours documenter clairement quand un cut est rouge.

## 6.3 Utilisations courantes du cut

### Determinisme force

```prolog
% S'arreter apres la premiere solution
premier_element(X, [X | _]) :- !.

% Equivalent de if-then-else
classify(X, positive) :- X > 0, !.
classify(0, zero) :- !.
classify(_, negative).
```

### Negation par cut-fail

Le schema `!, fail` est la base de la negation en Prolog :

```prolog noexec
% "Il n'existe pas de piece de Lyon que F ne fournit pas"
pas_fournisseur_reference(Nom, Ville) :-
    fournisseurReference(_, Nom, Ville),
    !, fail.                              % si on en trouve un -> echec
pas_fournisseur_reference(_, _).          % sinon -> succes

% Utilise pour la difference ensembliste (TP6)
difference(Nom, Ville) :-
    demandeFournisseur(Nom, Ville),
    pas_fournisseur_reference(Nom, Ville).
```

**Mecanisme detaille** :
1. On tente de prouver que le fournisseur existe dans `fournisseurReference`
2. Si oui : le cut (`!`) supprime le point de choix vers la clause 2, puis `fail` echoue
3. Si non (pas de match) : la clause 1 echoue, on passe a la clause 2 qui reussit

### Arret apres la premiere solution

```prolog
% Trouver UN element satisfaisant une condition
premier_pair(X, [X | _]) :- X mod 2 =:= 0, !.
premier_pair(X, [_ | T]) :- premier_pair(X, T).
```

## 6.4 Negation par echec (\+)

L'operateur `\+` (ou `not` dans certaines implementations) est la negation par echec. Il est defini en interne comme :

```prolog
% Implementation interne de \+
\+(Goal) :- Goal, !, fail.
\+(_).
```

**Semantique** : `\+(G)` reussit si et seulement si `G` echoue.

```prolog noexec
?- \+(membre(d, [a, b, c])).   % true (d n'est pas dans la liste)
?- \+(membre(a, [a, b, c])).   % false (a est dans la liste)

% Utilisation dans un predicat
travail(X) :-
    individu(X),
    \+(grippe(X)),
    \+(covid(X)).

% Division relationnelle (TP6) : double negation
division(F) :-
    fournisseurReference(F, _, _),
    \+(existe_piece_lyon_non_fournie(F)).

existe_piece_lyon_non_fournie(F) :-
    piece(P, _, lyon),
    \+(livraison(F, P, _)).
```

### Limitations de la negation par echec

**PIEGE MAJEUR** : la negation par echec NE FONCTIONNE PAS avec des variables libres.

```prolog noexec
?- \+(membre(X, [a, b, c])).
% false ! Parce que membre(X, [a,b,c]) REUSSIT (X=a)
% Donc \+ echoue.

% Ce qu'on voulait peut-etre :
% "trouver X qui n'est pas dans la liste" -> IMPOSSIBLE avec \+
```

**Regle** : `\+(Goal)` ne lie jamais de variables. Les variables dans Goal doivent etre **instanciees** avant l'appel.

```prolog noexec
% FAUX : X est libre -> \+ ne fonctionnera pas comme attendu
faux(X) :- \+(membre(X, [a, b, c])), humain(X).

% CORRECT : instancier X d'abord, puis tester
correct(X) :- humain(X), \+(membre(X, [a, b, c])).
```

## 6.5 Exemples d'examen : cut et negation

### Exercice type : quel est le resultat ?

```prolog
p(1).
p(2) :- !.
p(3).

?- p(X).
% X = 1 ;
% X = 2.         (le cut empeche d'atteindre p(3))
```

### Exercice type : corriger un predicat avec cut

```prolog noexec
% Version avec cut rouge (TP6 : pas_fournisseur_reference)
sans_eastwood(T) :-
    film(T, _, N1, _, _),
    N1 \== eastwood,
    \+(vedette(T, eastwood, _)).
```

### Exercice type : mystere avec cut (annale 2024)

```prolog
% Que fait ce predicat ?
mystere(L, E, R) :- tmp(L, E, R, []).

tmp([E|_], E, R, R) :- !.        % trouvee ! R est l'accumulateur
tmp([F|L], E, Rest, R) :-
    tmp(L, E, Rest, [F|R]).       % ajouter F a l'accumulateur

% mystere retourne dans R le debut de la liste L INVERSE,
% jusqu'a (mais excluant) la premiere occurrence de E.
% Ex: mystere([a,b,c,d], c, R) -> R = [b, a]
```

Le cut dans `tmp` empeche de continuer a chercher apres la premiere occurrence de E.

## 6.6 Erreurs frequentes avec le cut

```prolog noexec
% ERREUR 1 : cut trop tot (masque des solutions valides)
membre_faux(X, [X | _]) :- !.    % ne trouve que la 1ere occurrence
membre_faux(X, [_ | T]) :- membre_faux(X, T).
?- membre_faux(a, [a, b, a]).    % true une seule fois (devrait : 2 fois)

% ERREUR 2 : negation avec variable libre
faux(X) :- \+(mauvais(X)).       % Si X libre, echouera toujours si mauvais a une solution

% ERREUR 3 : oublier le fail apres le cut
pas_dans_v2(X, L) :-
    membre(X, L), !.              % MANQUE fail !
pas_dans_v2(_, _).
% Ceci retourne toujours true si membre reussit (car pas de fail)

% CORRECT :
pas_dans(X, L) :-
    membre(X, L), !, fail.
pas_dans(_, _).
```

---

## AIDE-MEMOIRE -- Cut et Negation

```
CUT (!)
  - Reussit toujours
  - Supprime les points de choix :
    * autres clauses du meme predicat
    * backtracking a gauche du cut
  - Cut vert : ne change pas les solutions
  - Cut rouge : change les solutions -> DANGEREUX

NEGATION PAR ECHEC
  \+(Goal)  ou  not(Goal)
  - Reussit si Goal echoue
  - Echoue si Goal reussit
  - NE LIE JAMAIS de variables
  - Toujours instancier les variables AVANT \+

SCHEMA CUT-FAIL (negation manuelle)
  pas_p(X) :- p(X), !, fail.
  pas_p(_).

IF-THEN-ELSE
  (Cond -> Then ; Else)
  Equivalent a :
    pred :- Cond, !, Then.
    pred :- Else.

ERREURS COMMUNES
  - \+ avec variable libre -> resultat inattendu
  - Cut rouge sans documentation -> maintenance impossible
  - Oublier fail apres cut -> predicat toujours vrai
  - Cut trop tot -> solutions manquantes

DOUBLE NEGATION (pour le quantificateur universel)
  "F fournit toutes les pieces de Lyon"
  = "il n'existe pas de piece de Lyon non fournie par F"
  division(F) :- fournisseur(F,_,_), \+(existe_non_fournie(F)).
  existe_non_fournie(F) :- piece(P,_,lyon), \+(livraison(F,P,_)).
```
