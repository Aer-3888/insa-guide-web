---
title: "Chapitre 8 : Arbres de resolution"
sidebar_position: 8
---

# Chapitre 8 : Arbres de resolution

## 8.1 Importance pour l'examen

Dessiner des arbres de resolution est un exercice **recurrent** aux examens. Il faut maitriser :
- La construction de l'arbre SLD complet
- Le marquage des substitutions a chaque branche
- L'identification des feuilles SUCCES et ECHEC
- L'impact du cut sur l'elagage de l'arbre

## 8.2 Methode de construction

### Etape par etape

1. **Ecrire la requete** comme racine de l'arbre
2. **Selectionner** le premier sous-but (le plus a gauche)
3. Pour chaque **clause unifiable** (parcourir de haut en bas) :
   - Creer une branche avec la substitution
   - Ecrire les nouveaux sous-buts (corps de la clause avec substitution)
4. **Repeter** pour chaque noeud non resolu
5. Marquer les feuilles : SUCCES (buts vides) ou ECHEC (aucune clause)

### Notation

```
?- but1, but2, ..., butn.        <-- racine
      |
      | clause: tete :- corps.   <-- annotation de la branche
      | {Subst}                   <-- substitution
      v
?- corps_subst, but2_subst, ..., butn_subst.  <-- nouveau noeud
```

## 8.3 Exemple complet : ancetre

```prolog
parent(a, b).
parent(b, c).
parent(c, d).

ancetre(X, Y) :- parent(X, Y).                    % C1
ancetre(X, Y) :- parent(Z, Y), ancetre(X, Z).     % C2
```

**Requete** : `?- ancetre(X, c).`

```
?- ancetre(X, c).
|
+--[C1] parent(X, c).
|  {Y=c}
|  |
|  +-- parent(b, c) : {X=b} -> SUCCES  X=b
|
+--[C2] parent(Z, c), ancetre(X, Z).
   {Y=c}
   |
   +-- parent(b, c) : {Z=b}
       ?- ancetre(X, b).
       |
       +--[C1] parent(X, b).
       |  |
       |  +-- parent(a, b) : {X=a} -> SUCCES  X=a
       |
       +--[C2] parent(Z2, b), ancetre(X, Z2).
          |
          +-- parent(a, b) : {Z2=a}
              ?- ancetre(X, a).
              |
              +--[C1] parent(X, a).
              |  |
              |  +-- aucun fait -> ECHEC
              |
              +--[C2] parent(Z3, a), ancetre(X, Z3).
                 |
                 +-- aucun fait pour parent(_, a) -> ECHEC
```

**Solutions** : X=b, X=a (dans cet ordre).

## 8.4 Exemple avec cut

```prolog
p(X, Y) :- q(X), !, r(Y).     % C1
p(0, 0).                        % C2

q(1). q(2).
r(a). r(b).
```

**Requete** : `?- p(X, Y).`

### Sans cut (pour comparaison)

```
?- p(X, Y).
|
+--[C1] q(X), r(Y).
|  |
|  +-- q(1) : {X=1}
|  |   ?- r(Y).
|  |   +-- r(a) : {Y=a} -> SUCCES  X=1, Y=a
|  |   +-- r(b) : {Y=b} -> SUCCES  X=1, Y=b
|  |
|  +-- q(2) : {X=2}
|      ?- r(Y).
|      +-- r(a) : {Y=a} -> SUCCES  X=2, Y=a
|      +-- r(b) : {Y=b} -> SUCCES  X=2, Y=b
|
+--[C2] {X=0, Y=0} -> SUCCES  X=0, Y=0

Solutions : (1,a), (1,b), (2,a), (2,b), (0,0)
```

### Avec cut

```
?- p(X, Y).
|
+--[C1] q(X), !, r(Y).
|  |
|  +-- q(1) : {X=1}
|      ?- !, r(Y).
|      |
|      +-- ! reussit -> COUPE :
|          * plus de backtrack vers q(2)
|          * plus de backtrack vers C2
|          ?- r(Y).
|          +-- r(a) : {Y=a} -> SUCCES  X=1, Y=a
|          +-- r(b) : {Y=b} -> SUCCES  X=1, Y=b
|
+--[C2] COUPE par le !  (inaccessible)

Solutions : (1,a), (1,b) seulement
```

Le cut a supprime :
- Les alternatives de `q` (q(2) n'est jamais essaye)
- La clause C2 (p(0,0) n'est jamais essaye)
- Mais le backtracking sur `r(Y)` (apres le cut) reste possible

## 8.5 Exemple avec negation

```prolog
bon(jean).
bon(marie).
mauvais(pierre).

gentil(X) :- bon(X), \+(mauvais(X)).
```

**Requete** : `?- gentil(X).`

```
?- gentil(X).
|
+-- bon(X), \+(mauvais(X))
    |
    +-- bon(jean) : {X=jean}
    |   ?- \+(mauvais(jean)).
    |   |
    |   +-- mauvais(jean) -> ECHEC (pas de fait)
    |       donc \+(mauvais(jean)) -> SUCCES
    |   -> SUCCES  X=jean
    |
    +-- bon(marie) : {X=marie}
        ?- \+(mauvais(marie)).
        |
        +-- mauvais(marie) -> ECHEC
            donc \+(mauvais(marie)) -> SUCCES
        -> SUCCES  X=marie

Solutions : X=jean, X=marie
```

## 8.6 Exercice d'examen type : trace d'execution

Predicat mystere de l'annale 2024 :

```prolog
mystere(L, E, R) :- tmp(L, E, R, []).

tmp([E|_], E, R, R) :- !.
tmp([F|L], E, Rest, Acc) :- tmp(L, E, Rest, [F|Acc]).
```

**Trace** : `mystere([a, b, c, d], c, R)`

```
mystere([a,b,c,d], c, R)
  tmp([a,b,c,d], c, R, [])
    % [a|...], a \= c (pas d'unification avec E=c dans clause 1)
    % Clause 2 : F=a, L=[b,c,d], Acc=[a]
    tmp([b,c,d], c, R, [a])
      % [b|...], b \= c
      % Clause 2 : F=b, L=[c,d], Acc=[b,a]
      tmp([c,d], c, R, [b,a])
        % Clause 1 : [c|_], E=c, R=[b,a]
        % ! -> coupe les alternatives
        R = [b, a]

Resultat : R = [b, a]
% mystere retourne le debut de la liste (avant E), en ordre inverse
```

## 8.7 Exercice d'examen type : arbre de recherche d'un predicat sur listes

```prolog
membre(X, [X|_]).
membre(X, [_|T]) :- membre(X, T).
```

**Arbre** : `?- membre(X, [a, b]).`

```
?- membre(X, [a, b]).
|
+--[C1] {X=a}  -> SUCCES  X=a
|
+--[C2] membre(X, [b]).
   |
   +--[C1] {X=b}  -> SUCCES  X=b
   |
   +--[C2] membre(X, []).
      |
      +-- aucune clause -> ECHEC
```

## 8.8 Conseils pour l'examen

1. **Renommer les variables** a chaque application de clause pour eviter les confusions
   - Clause 1 utilisee au niveau 1 : X1, Y1
   - Clause 1 utilisee au niveau 2 : X2, Y2
   
2. **Annoter chaque branche** avec :
   - Le numero de la clause utilisee
   - La substitution appliquee
   
3. **Marquer clairement** les succes et echecs
   - SUCCES : noter la solution trouvee
   - ECHEC : noter pourquoi (aucune clause, condition fausse)
   
4. **Pour le cut** : barrer visuellement les branches coupees avec une croix
   
5. **Verifier** : le nombre de solutions trouvees dans l'arbre doit correspondre au comportement du programme

---

## AIDE-MEMOIRE -- Arbres de resolution

```
CONSTRUCTION
  1. Requete = racine
  2. Pour chaque sous-but (gauche a droite) :
     - Trouver toutes les clauses unifiables (haut en bas)
     - Creer une branche par clause avec substitution
  3. Repeter jusqu'aux feuilles (SUCCES ou ECHEC)

NOTATION
  ?- buts...            Noeud (buts a resoudre)
  [C_i] {Subst}         Branche (clause i, substitution)
  SUCCES                 Feuille (plus de buts)
  ECHEC                  Feuille (aucune clause applicable)

IMPACT DU CUT
  ! supprime :
  - les clauses alternatives du meme predicat (en dessous)
  - les alternatives des buts a gauche du ! dans la clause
  - MAIS PAS les buts a droite du !

TRACE (4 ports)
  Call(but)   -> entree
  Exit(but)   -> succes
  Redo(but)   -> retour
  Fail(but)   -> echec

NEGATION DANS L'ARBRE
  \+(G) :
  - Tenter G en sous-arbre
  - Si G SUCCES -> \+(G) = ECHEC
  - Si G ECHEC  -> \+(G) = SUCCES

RENOMMAGE
  A chaque utilisation d'une clause, renommer les variables :
  Clause: p(X) :- q(X).
  Usage 1 : p(X1) :- q(X1).
  Usage 2 : p(X2) :- q(X2).
```
