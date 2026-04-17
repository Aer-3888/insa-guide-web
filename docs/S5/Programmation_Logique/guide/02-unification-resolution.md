---
title: "Chapitre 2 : Unification et Resolution"
sidebar_position: 2
---

# Chapitre 2 : Unification et Resolution

## 2.1 Unification

L'**unification** est le mecanisme central de Prolog. Deux termes s'unifient s'il existe une **substitution** qui les rend identiques.

### Regles d'unification

1. Une **variable** s'unifie avec n'importe quel terme (et prend sa valeur)
2. Deux **atomes** identiques s'unifient
3. Deux **nombres** identiques s'unifient
4. Deux **termes composes** s'unifient si :
   - Ils ont le meme foncteur et la meme arite
   - Leurs arguments correspondants s'unifient deux a deux

### Exemples pas a pas

```
Unifier f(X, b) avec f(a, Y) :
  1. f/2 = f/2        -> OK (meme foncteur, meme arite)
  2. X unif a          -> {X = a}
  3. b unif Y          -> {Y = b}
  Resultat : {X = a, Y = b}

Unifier f(X, X) avec f(a, b) :
  1. f/2 = f/2         -> OK
  2. X unif a           -> {X = a}
  3. X unif b           -> X est deja lie a 'a', et a != b -> ECHEC
  Resultat : echec

Unifier g(X, f(X)) avec g(a, Y) :
  1. g/2 = g/2         -> OK
  2. X unif a           -> {X = a}
  3. f(X) unif Y        -> X est 'a', donc f(a) unif Y -> {Y = f(a)}
  Resultat : {X = a, Y = f(a)}

Unifier pere(X, charles_VI) avec pere(charles_V, Y) :
  1. pere/2 = pere/2   -> OK
  2. X unif charles_V   -> {X = charles_V}
  3. charles_VI unif Y  -> {Y = charles_VI}
  Resultat : {X = charles_V, Y = charles_VI}
```

### Unification de listes

Les listes sont des termes composes avec le foncteur `.` (point) :
- `[a, b, c]` est en realite `.(a, .(b, .(c, [])))`
- `[H|T]` unifie la tete H et la queue T

```
Unifier [X|Y] avec [1, 2, 3] :
  [X|Y] = [1 | [2, 3]]
  -> {X = 1, Y = [2, 3]}

Unifier [X, Y|Z] avec [a, b, c, d] :
  -> {X = a, Y = b, Z = [c, d]}

Unifier [X, 2, X] avec [1, 2, Y] :
  X unif 1 -> {X = 1}
  2 unif 2 -> OK
  X unif Y -> X est 1, donc {Y = 1}
  Resultat : {X = 1, Y = 1}

Unifier [X|Y] avec [] :
  -> ECHEC (liste non vide vs liste vide)
```

### Occurs check

Par defaut, Prolog ne fait **pas** le test d'occurrence (pour des raisons de performance). Cela signifie que `X = f(X)` reussit et cree un terme cyclique infini. En pratique, ce cas est rare.

## 2.2 Resolution SLD

**SLD** = Selection function, Linear resolution, Definite clauses.

### Principe

Pour resoudre une requete `?- G1, G2, ..., Gn.` :
1. **Selectionner** le premier sous-but G1 (strategie de gauche a droite)
2. **Chercher** une clause dans la base dont la tete s'unifie avec G1
3. **Remplacer** G1 par le corps de la clause (avec la substitution)
4. **Repeter** jusqu'a ce que tous les sous-buts soient resolus (succes) ou qu'il n'y ait plus de clause applicable (echec -> backtracking)

### Exemple detaille

Base :
```prolog
parent(tom, bob).
parent(tom, liz).
parent(bob, pat).

grand_parent(X, Z) :- parent(X, Y), parent(Y, Z).
```

Requete : `?- grand_parent(tom, W).`

```
Etape 1 : Resoudre grand_parent(tom, W)
  Clause : grand_parent(X, Z) :- parent(X, Y), parent(Y, Z).
  Unification : {X = tom, Z = W}
  Nouveau but : parent(tom, Y), parent(Y, W)

Etape 2 : Resoudre parent(tom, Y)
  Clause 1 : parent(tom, bob).  -> {Y = bob}
  Nouveau but : parent(bob, W)

Etape 3 : Resoudre parent(bob, W)
  Clause : parent(bob, pat).  -> {W = pat}
  Nouveau but : (vide)
  -> SUCCES : W = pat

Backtracking (demande de ; par l'utilisateur) :
  Retour a Etape 2 : parent(tom, Y)
  Clause 2 : parent(tom, liz).  -> {Y = liz}
  Nouveau but : parent(liz, W)

  Resoudre parent(liz, W)
  -> Aucune clause ne matche -> ECHEC
  -> Plus de clauses pour parent(tom, Y) -> ECHEC final
```

## 2.3 Backtracking

Le **backtracking** (retour arriere) est le mecanisme par lequel Prolog explore toutes les possibilites :

1. Quand un sous-but echoue, Prolog **defait** la derniere unification
2. Il tente la **clause suivante** pour le dernier point de choix
3. S'il n'y a plus de clause, il remonte au point de choix precedent

```
?- repas(H, P, D).

repas(H, P, D) :- hors_d_oeuvre(H), plat(P), dessert(D).

H = artichauts_Melanie
  P = bar_aux_algues      (plat via poisson)
    D = sorbet_aux_poires  -> Solution 1
    D = fraises_chantilly  -> Solution 2
    D = melon_en_surprise  -> Solution 3
  P = saumon_oseille       (plat via poisson)
    D = sorbet_aux_poires  -> Solution 4
    ...
  P = grillade_de_boeuf   (plat via viande)
    D = sorbet_aux_poires  -> Solution 7
    ...
H = truffes_sous_le_sel
  ...  (memes combinaisons pour P et D)
```

## 2.4 L'arbre de recherche SLD

L'arbre de recherche est une representation graphique de toutes les tentatives de resolution.

### Convention de dessin

```
          ?- but_initial.
         /        |        \
   clause1     clause2    clause3
      |           |          |
  sous-buts   sous-buts   ECHEC
     / \         |
  ...  ...    SUCCES
```

- Chaque **noeud** est un ensemble de sous-buts a resoudre
- Chaque **branche** correspond a une clause unifiable
- Les **feuilles** sont soit un SUCCES (plus de sous-buts) soit un ECHEC
- Le parcours est **en profondeur d'abord, de gauche a droite**

### Exemple : arbre pour `ancetre(X, louis_d_Orleans)`

```prolog
ancetre(X, Y) :- parent(X, Y).           % clause 1
ancetre(X, Y) :- parent(P, Y), ancetre(X, P).  % clause 2
```

```
?- ancetre(X, louis_d_Orleans).
|
+--- [clause 1] parent(X, louis_d_Orleans)
|    |
|    +--- pere(louis_d_Orleans, ...) non, c'est parent(X, l_d_O)
|    +--- {X = charles_V}  (pere(charles_V, louis_d_Orleans))  -> SUCCES
|    +--- {X = jeanne_de_Bourbon}  (mere(...))                 -> SUCCES
|
+--- [clause 2] parent(P, louis_d_Orleans), ancetre(X, P)
     |
     +--- {P = charles_V} -> ancetre(X, charles_V)
     |    |
     |    +--- [clause 1] parent(X, charles_V)
     |    |    -> {X = jean_II} (pere) SUCCES
     |    |    -> {X = bonne_de_luxembourg} (mere) SUCCES
     |    |
     |    +--- [clause 2] parent(P2, charles_V), ancetre(X, P2)
     |         -> ... (continue recursivement)
     |
     +--- {P = jeanne_de_Bourbon} -> ancetre(X, jeanne_de_Bourbon)
          -> ... (continue recursivement)
```

## 2.5 Les 4 ports du modele de trace

Le debugger Prolog utilise le **box model** avec 4 evenements :

```
        +---> Call  (entree dans le predicat)
        |
   +---------+
   |         | ---> Exit  (succes, solution trouvee)
   | Predicat|
   |         | <--- Redo  (demande d'une autre solution)
   +---------+
        |
        +---> Fail  (echec, pas de solution)
```

### Trace d'execution de `plat(X)`

```
   Call: plat(X)
      Call: poisson(X)
      Exit: poisson(bar_aux_algues)    {X = bar_aux_algues}
   Exit: plat(bar_aux_algues)
   Redo: plat(bar_aux_algues)
      Redo: poisson(bar_aux_algues)
      Exit: poisson(saumon_oseille)    {X = saumon_oseille}
   Exit: plat(saumon_oseille)
   Redo: plat(saumon_oseille)
      Redo: poisson(saumon_oseille)
      Fail: poisson(_)
      Call: viande(X)
      Exit: viande(grillade_de_boeuf)  {X = grillade_de_boeuf}
   Exit: plat(grillade_de_boeuf)
```

---

## CHEAT SHEET -- Unification et Resolution

```
UNIFICATION
  Variable = n'importe quoi     X = a         -> {X = a}
  Atome = meme atome            a = a         -> {}
  f(X,b) = f(a,Y)                             -> {X=a, Y=b}
  f(X,X) = f(a,b)                             -> ECHEC
  [H|T] = [1,2,3]                             -> {H=1, T=[2,3]}
  [X,Y|Z] = [a,b,c,d]                         -> {X=a, Y=b, Z=[c,d]}

RESOLUTION SLD
  1. Selectionner le 1er sous-but (gauche a droite)
  2. Chercher une clause unifiable (haut en bas)
  3. Remplacer le sous-but par le corps de la clause
  4. Repeter ou backtracker

ARBRE DE RECHERCHE
  - Racine = requete initiale
  - Branches = clauses unifiables
  - Feuilles = SUCCES (buts vides) ou ECHEC
  - Parcours en profondeur, gauche a droite

TRACE (4 ports)
  Call  : entree dans le predicat
  Exit  : succes (solution trouvee)
  Redo  : retour (demande d'autre solution)
  Fail  : echec (plus de clause)
```
