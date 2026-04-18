---
title: "Chapitre 7 : Sujets avances"
sidebar_position: 7
---

# Chapitre 7 : Sujets avances

## 7.1 Collecte de solutions : findall, bagof, setof

### findall/3

`findall(Template, Goal, List)` collecte **toutes** les solutions de Goal dans une liste.

```prolog noexec
?- findall(X, membre(X, [a, b, c]), L).
% L = [a, b, c]

?- findall(P, plat(P), Plats).
% Plats = [bar_aux_algues, saumon_oseille, grillade_de_boeuf, poulet_au_tilleul]

% Si aucune solution : retourne []
?- findall(X, (membre(X, [1,2,3]), X > 10), L).
% L = []

% Template peut etre un terme compose
?- findall([Nom, Cal], (plat(Nom), calories(Nom, Cal)), L).
% L = [[bar_aux_algues, 292], [saumon_oseille, 254], ...]

% Compter le nombre de solutions
count(Goal, N) :-
    findall(_, Goal, R),
    length(R, N).
```

### bagof/3 et setof/3

`bagof` est comme findall mais :
- **Echoue** s'il n'y a aucune solution (au lieu de retourner [])
- **Groupe** par les variables non-mentionnees dans le modele (Template)

`setof` est comme bagof mais **trie** et **elimine les doublons**.

```prolog noexec
?- setof(P, plat(P), L).
% L = [bar_aux_algues, grillade_de_boeuf, poulet_au_tilleul, saumon_oseille]

% L'operateur ^ ("il existe") ignore les variables pour le groupement
?- bagof(Nom, Lieu^piece(_, Nom, Lieu), L).
% L contient tous les noms de pieces sans grouper par lieu
```

### Utilisation dans les TPs

```prolog noexec
% TP1 : lister les plats entre 200 et 400 cal
test_plat200_400 :-
    test(sortedof(P, plat200_400(P),
         [bar_aux_algues, poulet_au_tilleul, saumon_oseille])).

sortedof(Term, Goal, SortedList) :-
    findall(Term, Goal, List),
    msort(List, SortedList).

% TP6 : total des pieces livrees par fournisseur
total_pieces_livrees_fournisseur(F, Total) :-
    fournisseurReference(F, _, _),
    findall(Qte, livraison(F, _, Qte), ListeQtes),
    somme_liste(ListeQtes, Total).
```

## 7.2 Modification dynamique : assert/retract

Prolog permet de modifier la base de faits pendant l'execution.

```prolog noexec
% Ajouter un fait
?- assert(aime(jean, pizza)).
% ou assertz (a la fin) / asserta (au debut)

% Supprimer un fait
?- retract(aime(jean, pizza)).

% Supprimer TOUS les faits correspondants
?- retractall(aime(jean, _)).
```

**Attention** : les predicats dynamiques doivent etre declares :
```prolog noexec
:- dynamic aime/2.
```

**Utilisation dans le TP4** : insertion "en place" dans un arbre via variables libres :
```prolog noexec
% Utilise free/1 (ECLiPSe) pour detecter les variables non instanciees
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

## 7.3 Bases de donnees deductives

Le TP6 montre comment Prolog peut simuler des operations relationnelles SQL.

### Operations de base

```prolog noexec
% SELECTION (WHERE)
selection_lyon(Num, Nom) :- piece(Num, Nom, lyon).

% PROJECTION (SELECT colonnes)
projection(Nom, Lieu) :- piece(_, Nom, Lieu).

% JOINTURE (JOIN)
jointure(NumF, Nom, Ville, Piece, Qte) :-
    fournisseurReference(NumF, Nom, Ville),
    livraison(NumF, Piece, Qte).

% PRODUIT CARTESIEN (CROSS JOIN)
produit_cartesien(F1, Nom, Ville, F2, Piece, Qte) :-
    fournisseurReference(F1, Nom, Ville),
    livraison(F2, Piece, Qte).
```

### Operations ensemblistes avec cut-fail

```prolog noexec
% INTERSECTION : present dans les deux tables
intersection(Nom, Ville) :-
    demandeFournisseur(Nom, Ville),
    fournisseurReference(_, Nom, Ville).

% DIFFERENCE : dans A mais pas dans B
difference(Nom, Ville) :-
    demandeFournisseur(Nom, Ville),
    pas_fournisseur_reference(Nom, Ville).

pas_fournisseur_reference(Nom, Ville) :-
    fournisseurReference(_, Nom, Ville), !, fail.
pas_fournisseur_reference(_, _).

% UNION : dans A ou dans B (sans doublons)
union(Nom, Ville) :-
    demandeFournisseur(Nom, Ville).
union(Nom, Ville) :-
    fournisseurReference(_, Nom, Ville),
    pas_demande_fournisseur(Nom, Ville).
```

### Division relationnelle (double negation)

La **division** est l'operation la plus complexe : "trouver les F qui fournissent TOUTES les pieces de Lyon".

Logique : F fournit toutes les pieces de Lyon = il n'existe PAS de piece de Lyon que F ne fournit PAS.

```prolog noexec
division(F) :-
    fournisseurReference(F, _, _),
    \+(existe_piece_lyon_non_fournie(F)).

existe_piece_lyon_non_fournie(F) :-
    piece(P, _, lyon),
    \+(livraison(F, P, _)).
```

### Requetes recursives (au-dela du SQL)

```prolog noexec
% Composition transitive : quels composants faut-il pour une voiture ?
est_compose_de(C, U) :- assemblage(C, U, _).
est_compose_de(C, V) :- assemblage(C, U, _), est_compose_de(U, V).

% Quantites totales de pieces de base
nb_pieces_tot(Comp, Piece, Qte) :-
    assemblage(Comp, Piece, Qte),
    \+(assemblage(Piece, _, _)).          % piece de base (pas d'assemblage)
nb_pieces_tot(Comp, Piece, Qte) :-
    assemblage(Comp, Inter, Q1),
    nb_pieces_tot(Inter, Piece, Q2),
    Qte is Q1 * Q2.

% Combien de voitures peut-on construire ?
nb_voiture(Nb) :-
    findall(NbPoss, nb_voitures_par_piece(NbPoss), Liste),
    min_liste(Liste, Nb).

nb_voitures_par_piece(NbPoss) :-
    nb_pieces_tot(voiture, NomPiece, QteNecessaire),
    findall(Q, (piece(NumP, NomPiece, _), livraison(_, NumP, Q)), LQ),
    somme_liste(LQ, QteDispo),
    NbPoss is QteDispo // QteNecessaire.
```

## 7.4 Generer et tester

Schema tres courant en Prolog : generer toutes les possibilites, puis filtrer.

```prolog noexec
% Trouver un repas equilibre
repas_equilibre(H, P, D) :-
    repas(H, P, D),          % GENERER : enumerer tous les repas
    val_cal(H, P, D, Cal),
    Cal =< 800.              % TESTER : filtrer par calories

% Puzzle des dominos (TP8)
domino([stone(A,B) | R], Res) :-
    A \= B,
    chains(R, [chain([A], [B])], Res).  % generer les chaines, backtracker si echec
```

### choose/3 : selection non-deterministe

```prolog
% Choisir un element dans une liste (retourne aussi le reste)
choose([E | R], E, R).
choose([E1 | R], E, [E1 | L]) :-
    choose(R, E, L).

?- choose([a, b, c], E, Rest).
% E=a, Rest=[b,c] ;
% E=b, Rest=[a,c] ;
% E=c, Rest=[a,b]
```

## 7.5 Sommation et min/max sur listes

```prolog
% Somme d'une liste
somme_liste([], 0).
somme_liste([E | R], Res) :-
    somme_liste(R, Res1),
    Res is E + Res1.

% Minimum d'une liste
min_liste([X], X).
min_liste([X, Y | R], Min) :- X =< Y, min_liste([X | R], Min).
min_liste([X, Y | R], Min) :- X > Y, min_liste([Y | R], Min).
```

---

## AIDE-MEMOIRE -- Sujets avances

```
COLLECTE DE SOLUTIONS
  findall(T, Goal, L)     Toutes les solutions dans L ([] si aucune)
  bagof(T, Goal, L)       Groupees par variables libres (fail si aucune)
  setof(T, Goal, L)       Comme bagof mais triee et sans doublons
  Var^Goal                 "il existe Var" (pour bagof/setof)

MODIFICATION DYNAMIQUE
  :- dynamic pred/arite.
  assert(fait).            Ajouter un fait
  retract(fait).           Supprimer un fait
  retractall(pattern).     Supprimer tous les faits correspondants

BDD DEDUCTIVES (SQL -> Prolog)
  SELECT col WHERE cond    pred(col) :- table(..., cond, ...).
  JOIN ON t1.x = t2.x     pred :- table1(X,...), table2(X,...).
  CROSS JOIN               pred :- table1(...), table2(...).
  NOT EXISTS               \+(Goal)  ou  cut-fail
  DIVISION (pour tout)     double negation : \+( ... \+(...) )

GENERER ET TESTER
  solution(X) :- generer(X), tester(X).

CHOOSE (selection non-deterministe)
  choose([E|R], E, R).
  choose([E1|R], E, [E1|L]) :- choose(R, E, L).

AGREGATION
  somme : findall(V, goal, L), somme_liste(L, S).
  compte : findall(_, goal, L), length(L, N).
  min/max : findall(V, goal, L), min_liste(L, M).
```
