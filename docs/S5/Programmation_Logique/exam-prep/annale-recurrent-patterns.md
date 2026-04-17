---
title: "Patterns recurrents dans les annales (2015-2026)"
sidebar_position: 4
---

# Patterns recurrents dans les annales (2015-2026)

## Pattern 1 : Base de faits + regles deductives

Apparait dans **presque chaque annale**. On donne une base de faits thematique et on demande d'ecrire des regles.

### Themes rencontres

| Annee | Theme | Faits | Regles demandees |
|-------|-------|-------|------------------|
| 2024 | Cinema | film, acteur, vedette | real_acteur, trois_vedettes, sans_eastwood, genre_stable |
| 2023 | COVID | collegues, temperature, toux, odorat, gout | individu, fievre, covid, grippe, travail, contagion |
| 2022 | Grilles | grid | dimension, slice, sub_grid, constant_grid, to_quadtree |
| 2020 | Tennis | arbitre, joueur, match, victoire | arbitre_ok, prog_lundi, tout_perdu, tous_les_jours |
| TP1 | Restaurant | hors_d_oeuvre, plat, calories | repas, val_cal, repas_eq |
| TP1 | Famille royale | pere, mere, homme, femme, roi | enfant, parent, grand_pere, frere, oncle, ancetre |

### Technique de resolution

```prolog
% Schema general pour une requete type "selection"
resultat(Args) :-
    fait1(X, Y, ...),          % selectionner depuis une table
    fait2(Y, Z, ...),          % joindre avec une autre table
    condition(Z, ...).          % filtrer

% Schema general pour "il n'existe pas"
propriete_negative(X) :-
    ... , !, fail.
propriete_negative(_).
% OU avec \+ :
propriete(X) :- \+(propriete_negative(X)).

% Schema pour "pour tout" (double negation)
pour_tout(X) :-
    source(X),
    \+(existe_contre_exemple(X)).
```

---

## Pattern 2 : Predicats sur les listes

Apparait dans **2 annales sur 3** au minimum.

### Predicats frequemment demandes

| Predicat | Frequence | Difficulte |
|----------|-----------|------------|
| Tri (insertion, fusion) | Tres frequent | Moyenne |
| Filtrage (garder/supprimer selon condition) | Tres frequent | Facile |
| Comptage (occurrences, longueur) | Frequent | Facile |
| Fusion de listes triees | Frequent | Moyenne |
| Permutation | Moyen | Elevee |
| Sous-liste, prefixe | Moyen | Moyenne |

### Solutions de reference

```prolog
% Filtrer les elements satisfaisant une condition
filtrer(_, [], []).
filtrer(Cond, [H|T], [H|R]) :- call(Cond, H), filtrer(Cond, T, R).
filtrer(Cond, [H|T], R) :- \+(call(Cond, H)), filtrer(Cond, T, R).

% Retirer les N premiers elements (annale 2020)
oter_n_prem(0, L, L) :- !.
oter_n_prem(M, [_|L], R) :- M > 0, N is M-1, oter_n_prem(N, L, R).

% Elements de L1 pas dans L2 (annale 2020)
pas_dans([], _, []).
pas_dans([X|L1], L2, R) :- membre(X, L2), !, pas_dans(L1, L2, R).
pas_dans([X|L1], L2, [X|R]) :- pas_dans(L1, L2, R).

% Maximum d'une liste (annale 2020)
maxi([X], X).
maxi([X|L], Y) :- maxi(L, Y), X < Y, !.
maxi([X|_], X).

% Multiples de 5 (annale 2019)
multiples([], []).
multiples([X|L], [X|R]) :- X mod 5 =:= 0, !, multiples(L, R).
multiples([_|L], R) :- multiples(L, R).

% Meme taille (annale 2019)
meme_taille([], []).
meme_taille([_|L1], [_|L2]) :- meme_taille(L1, L2).

% Somme element par element (annale 2019)
liste_somme([], [], []).
liste_somme([X1|L1], [X2|L2], [X3|L3]) :-
    meme_taille(L1, L2),
    X3 is X1 + X2,
    liste_somme(L1, L2, L3).
```

---

## Pattern 3 : Predicat mystere (comprehension)

Apparait dans **la moitie des annales**. On donne un predicat et on demande :
- Que retourne-t-il pour tel appel ?
- Que fait-il en general ?
- Comment le modifier ?

### Methode

1. **Identifier** les arguments (entrees/sorties) et le cas de base
2. **Tracer** sur l'exemple donne
3. **Generaliser** : formuler en une phrase

### Exemples rencontres

**Mystere 2024** (debut de liste inverse avant un element) :
```prolog
mystere(L, E, R) :- tmp(L, E, R, []).
tmp([E|_], E, R, R) :- !.
tmp([F|L], E, Rest, Acc) :- tmp(L, E, Rest, [F|Acc]).
```

**Technique d'accumulateur inverse** : l'accumulateur `[F|Acc]` accumule les elements en tete, ce qui les **inverse**. C'est le pattern le plus frequent dans les predicats mystere.

---

## Pattern 4 : Arbre de resolution / Trace

Apparait dans **la moitie des annales**.

### Ce qu'on vous demande

1. Dessiner l'**arbre de recherche SLD** complet
2. Donner la **trace d'execution** (Call/Exit/Redo/Fail)
3. Identifier les **solutions** et leur **ordre**
4. Montrer l'impact du **cut**

### Technique

- Toujours **renommer les variables** a chaque utilisation de clause
- Utiliser des **numeros de clause** (C1, C2, ...)
- Annoter chaque branche avec la **substitution**
- Marquer clairement SUCCES et ECHEC
- Pour le cut : **barrer** les branches coupees

---

## Pattern 5 : Cut et negation

### Questions types

1. "Que se passe-t-il si on ajoute un cut ?"
2. "Que se passe-t-il si on enleve le cut ?"
3. "Le cut est-il vert ou rouge ?"
4. "Implementer la negation avec cut-fail"

### Solutions de reference

```prolog
% Negation manuelle (cut-fail)
not_member(X, L) :- member(X, L), !, fail.
not_member(_, _).

% Division relationnelle (double negation)
pour_tout_satisfait(X) :-
    source(X),
    \+(existe_exception(X)).
existe_exception(X) :-
    domaine(Y),
    \+(verifie(X, Y)).

% If-then-else avec cut
classify(X, positive) :- X > 0, !.
classify(0, zero) :- !.
classify(_, negative).
```

---

## Pattern 6 : Recursion transitive

Apparait dans les TPs et parfois aux examens.

```prolog
% Fermeture transitive (ancetre, composition)
rel_transitive(X, Y) :- rel_directe(X, Y).
rel_transitive(X, Y) :- rel_directe(X, Z), rel_transitive(Z, Y).

% Avec accumulation de quantite (nb_pieces_tot)
rel_quantifiee(X, Y, Q) :- rel_directe(X, Y, Q), feuille(Y).
rel_quantifiee(X, Y, Q) :-
    rel_directe(X, Z, Q1),
    rel_quantifiee(Z, Y, Q2),
    Q is Q1 * Q2.
```

---

## Pattern 7 : findall + agregation

```prolog
% Compter
nombre_solutions(Goal, N) :-
    findall(_, Goal, L), length(L, N).

% Sommer
total(Goal, Template, Sum) :-
    findall(Template, Goal, L), somme_liste(L, Sum).

% Minimum / Maximum
meilleur(Goal, Template, Best) :-
    findall(Template, Goal, L), min_liste(L, Best).

% Collecter et trier (sans doublons)
solutions_uniques(Goal, Template, L) :-
    findall(Template, Goal, L1), sort(L1, L).
```

---

## Recapitulatif : que reviser en priorite

```
INDISPENSABLE (chaque examen)
  [x] Ecrire des predicats a partir de faits donnes
  [x] Predicats sur les listes (filtrer, trier, compter)
  [x] Unification de termes (y compris listes)
  [x] Negation (\+ et cut-fail)

TRES IMPORTANT (1 examen sur 2)
  [x] Trace d'execution (4 ports)
  [x] Arbre de resolution SLD
  [x] Predicat mystere (comprehension)
  [x] Cut (green vs red, impact sur les solutions)

IMPORTANT (1 examen sur 3)
  [x] findall / bagof / setof
  [x] Accumulateurs
  [x] Recursion transitive
  [x] Arithmetique (is, =<, etc.)

BON A CONNAITRE
  [x] Peano / binaire
  [x] Arbres (parcours, ABR)
  [x] Termes construits (poker, dominos)
  [x] BDD deductives (division, jointure)
```
