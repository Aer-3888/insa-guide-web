---
title: "TP3 - Listes"
sidebar_position: 3
---

# TP3 - Listes

> Following teacher instructions from: `S5/Programmation_Logique/data/moodle/tp/tp3/README.md`

---

## Partie 1 : Classiques sur les listes

### membre(?A, +X)

**A est element de la liste X.**

**Answer:**

```prolog
membre(A, [A | _]).
membre(A, [_ | R]) :- membre(A, R).
```

Deux cas suivant la structure inductive de la liste : A est la tete, ou A est dans le reste.

**Query test:**

```
?- membre(b, [a, b, c]).
true.

?- membre(X, [a, b, c]).
X = a ; X = b ; X = c ; false.

?- membre(0, [1, 2, 3]).
false.
```

---

### compte(+A, +X, ?N)

**N = nombre d'occurrences de A dans X.**

**Answer:**

```prolog
compte(_, [], 0).
compte(A, [A | R], N) :-
    compte(A, R, M),
    N is M + 1.
compte(A, [B | R], N) :-
    \==(A, B),
    compte(A, R, N).
```

Trois cas : liste vide (0), tete = A (incrementer), tete != A (continuer sans incrementer). Le `\==` dans la troisieme clause empeche le chevauchement avec la deuxieme.

**Query test:**

```
?- compte(a, [a, c, a, b, a, c, b], N).
N = 3.

?- compte(z, [a, b, c], N).
N = 0.
```

---

### renverser(+X, ?Y)

**Y est X a l'envers (accumulateur O(n)).**

**Answer:**

```prolog
renverser(X, Y) :- renverser_acc(X, [], Y).

renverser_acc([], Acc, Acc).
renverser_acc([X | R], Acc, Res) :-
    renverser_acc(R, [X | Acc], Res).
```

L'accumulateur construit le resultat en un seul parcours. A chaque etape, la tete de X est placee en tete de l'accumulateur.

**Query test:**

```
?- renverser([a, b, c], Y).
Y = [c, b, a].

?- renverser([1, 2, 2, 4], Y).
Y = [4, 2, 2, 1].
```

---

### palind(+X)

**X est un palindrome.**

**Answer:**

```prolog
palind(X) :- renverser(X, X).
```

L'unification verifie que X et son inverse sont la meme liste.

**Query test:**

```
?- palind([a, b, b, a]).
true.

?- palind([b, a, b, a]).
false.
```

---

### enieme(+N, +X, -A)

**A est le N-ieme element de X (indexe a partir de 1).**

**Answer:**

```prolog
enieme(1, [A | _], A).
enieme(N, [_ | X], Res) :-
    N > 1,
    M is N - 1,
    enieme(M, X, Res).
```

Mode (+, +, -) : on decremente N a chaque appel recursif et on avance dans la liste.

**Query test:**

```
?- enieme(3, [a, b, c, d], A).
A = c.

?- enieme(1, [a, b, a], A).
A = a.
```

---

### hors_de(+A, +X)

**A n'est pas dans X.**

**Answer:**

```prolog
hors_de(_, []).
hors_de(A, [Y | X]) :-
    \==(A, Y),
    hors_de(A, X).
```

Reussit si on parcourt toute la liste sans trouver A. La clause recursive verifie que la tete est differente de A avant de continuer.

**Query test:**

```
?- hors_de(d, [a, b, c]).
true.

?- hors_de(b, [a, b, c]).
false.
```

---

### tous_diff(+X)

**Tous les elements de X sont differents.**

**Answer:**

```prolog
tous_diff([]).
tous_diff([X | R]) :-
    hors_de(X, R),
    tous_diff(R).
```

Pour chaque element, on verifie qu'il n'apparait pas dans le reste de la liste.

**Query test:**

```
?- tous_diff([1, 2, 3, 4, 5, 9, 7]).
true.

?- tous_diff([1, 3, 4, 5, 3]).
false.
```

---

### conc3(+X, +Y, +Z, ?T)

**T = X ++ Y ++ Z.**

**Answer:**

```prolog
conc3([], [], Z, Z).
conc3([], [B | Y], Z, [B | Res]) :-
    conc3([], Y, Z, Res).
conc3([A | X], Y, Z, [A | Res]) :-
    conc3(X, Y, Z, Res).
```

On vide X puis Y dans le resultat, et Z est le reste. Trois clauses : X et Y vides (T=Z), X vide mais pas Y, et X non vide.

**Query test:**

```
?- conc3([1, 2], [3], [4, 5], T).
T = [1, 2, 3, 4, 5].

?- conc3([1, 2, 3, 4], [5, 6], [7, 8, 9, 10], T).
T = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
```

---

### debute_par(+X, ?Y)

**X commence par Y.**

**Answer:**

```prolog
debute_par(_, []).
debute_par([A | RX], [A | RY]) :- debute_par(RX, RY).
```

**Query test:**

```
?- debute_par([1, 2, 3, 4, 5, 6], [1, 2, 3]).
true.

?- debute_par([1, 2, 3], [1, 2, 3, 4, 5, 6]).
false.

?- debute_par([1, 2, 3, 4], X).
X = [] ; X = [1] ; X = [1, 2] ; X = [1, 2, 3] ; X = [1, 2, 3, 4] ; false.
```

---

### sous_liste(+X, ?Y)

**Y est une sous-liste contigue de X.**

**Answer:**

```prolog
sous_liste(_, []).
sous_liste([A | RX], [A | RY]) :- debute_par(RX, RY).
sous_liste([_ | RX], Y) :-
    Y = [_ | _],
    sous_liste(RX, Y).
```

Clause 1 : la liste vide est sous-liste de tout. Clause 2 : si les tetes correspondent, on verifie que le reste de Y est un debut de RX. Clause 3 : on avance dans X. La garde `Y = [_ | _]` empeche de trouver la liste vide en boucle.

**Query test:**

```
?- sous_liste([1, 2, 3, 4, 5, 6], [3, 4]).
true.

?- sous_liste([1, 2, 3, 4, 5, 6], [4, 3]).
false.

?- sous_liste([1, 2, 3, 4, 5, 6], [1, 6]).
false.
```

---

### elim(+X, -Y)

**Y = X sans doublons (garde la derniere occurrence).**

**Answer:**

```prolog
elim([], []).
elim([A | RX], [A | RY]) :-
    hors_de(A, RX),
    elim(RX, RY).
elim([X | RX], Y) :-
    membre(X, RX),
    elim(RX, Y).
```

Si A n'est plus dans le reste, on le garde. Sinon (A apparait encore plus loin), on le supprime.

**Query test:**

```
?- elim([a, b, a, b, a], Y).
Y = [b, a].    % garde la derniere occurrence de chaque element
```

---

### tri(+X, -Y)

**Y = tri par insertion de X.**

**Answer:**

```prolog
tri([], []).
tri([E | L1], L2) :-
    tri(L1, LP),
    inserer(E, LP, L2).

inserer(E, [], [E]).
inserer(E, [X | L1], [E, X | L1]) :- E =< X.
inserer(E, [X | L1], [X | L2]) :- E > X, inserer(E, L1, L2).
```

On trie recursivement le reste, puis on insere l'element courant a la bonne position dans la liste triee.

**Query test:**

```
?- tri([5, 3, 1, 4, 2], Y).
Y = [1, 2, 3, 4, 5].

?- tri([4, 1, 3, 2], Y).
Y = [1, 2, 3, 4].
```

---

## Partie 2 : Retour sur les modes

### enieme2(-N, +X, +A)

**Trouve le rang N de A dans X (mode inverse).**

**Answer:**

```prolog
enieme2(1, [A | _], A).
enieme2(N, [_ | R], A) :-
    enieme2(M, R, A),
    N is M + 1.
```

On parcourt la liste et quand on trouve A, on calcule N en remontant de la recursion. L'appel recursif qui calcule M est fait AVANT `N is M + 1` car `is` exige M instancie.

**Query test:**

```
?- enieme2(N, [p, a, p, a], a).
N = 2 ; N = 4 ; false.

?- enieme2(1, [a, b, a], a).
true.
```

---

### eniemefinal(?N, +X, ?A)

**Combine les deux modes (+,+,-) et (-,+,+).**

**Answer:**

```prolog
eniemefinal(N, X, A) :-
    nonvar(N), !,
    enieme(N, X, A).
eniemefinal(N, X, A) :-
    enieme2(N, X, A).
```

Si N est instancie (`nonvar(N)`), on utilise `enieme` (decompte direct). Sinon, `enieme2` (parcours). Le cut empeche d'essayer la deuxieme clause quand N est connu.

**Query test:**

```
?- eniemefinal(2, [a, b, c], A).
A = b.

?- eniemefinal(N, [p, a, p, a], a).
N = 2 ; N = 4 ; false.
```

---

### conc3final(?X, ?Y, ?Z, ?T)

**conc3 avec mode (-,-,-,+).**

**Answer:**

```prolog
conc3final(X, Y, Z, T) :-
    append(X, YZ, T),
    append(Y, Z, YZ).
```

Utilise `append/3` (qui supporte le mode inverse) en deux etapes : decouper T en X et YZ, puis decouper YZ en Y et Z.

**Query test:**

```
?- conc3final(X, Y, Z, [1, 2, 3]).
X = [], Y = [], Z = [1, 2, 3] ;
X = [], Y = [1], Z = [2, 3] ;
X = [], Y = [1, 2], Z = [3] ;
X = [], Y = [1, 2, 3], Z = [] ;
X = [1], Y = [], Z = [2, 3] ;
X = [1], Y = [2], Z = [3] ;
X = [1], Y = [2, 3], Z = [] ;
X = [1, 2], Y = [], Z = [3] ;
X = [1, 2], Y = [3], Z = [] ;
X = [1, 2, 3], Y = [], Z = [] ;
false.
```

---

### comptefinal(?A, +X, ?N)

**compte avec mode (-,+,-).**

**Answer:**

```prolog
comptefinal(A, X, N) :-
    nonvar(A), !,
    compte(A, X, N).
comptefinal(A, X, N) :-
    var(A),
    membre(A, X),
    compte(A, X, N).
```

Si A est connu : `compte` classique. Si A est inconnu : `membre(A, X)` genere chaque element possible de X, puis `compte` calcule son nombre d'occurrences.

**Query test:**

```
?- comptefinal(a, [a, c, a, b, a, c, b], N).
N = 3.

?- comptefinal(A, [a, c, a, b, a, c, b], 2).
A = c ; A = b ; ...
```

---

## Partie 3 : Modelisation des ensembles

Les ensembles sont representes par des listes sans doublons. On utilise uniquement `membre` et `hors_de` (+ recursivite).

### inclus(+X, +Y)

**Tous les elements de X sont dans Y.**

**Answer:**

```prolog
inclus([], _).
inclus([A | R], Y) :-
    membre(A, Y),
    inclus(R, Y).
```

**Query test:**

```
?- inclus([3, 2], [1, 2, 3, 4]).
true.

?- inclus([3, 55], [1, 2, 3, 4]).
false.
```

---

### non_inclus(+X, +Y)

**Au moins un element de X n'est pas dans Y.**

**Answer:**

```prolog
non_inclus([A | _], Y) :-
    hors_de(A, Y).
non_inclus([A | R], Y) :-
    membre(A, Y),
    non_inclus(R, Y).
```

On cherche un temoin : un element de X absent de Y. Si la tete est absente, c'est immediatement vrai. Sinon, on continue dans le reste.

**Query test:**

```
?- non_inclus([3, 55], [1, 2, 3, 4]).
true.

?- non_inclus([3, 2], [1, 2, 3, 4]).
false.
```

---

### union_ens(+X, +Y, ?Z)

**Z = union ensembliste de X et Y.**

**Answer:**

```prolog
union_ens([], Y, Y).
union_ens([A | R], Y, Z) :-
    membre(A, Y),
    union_ens(R, Y, Z).
union_ens([A | R], Y, [A | Z]) :-
    hors_de(A, Y),
    union_ens(R, Y, Z).
```

On parcourt X. Si un element est deja dans Y, on le saute. Sinon, on l'ajoute au resultat.

**Query test:**

```
?- union_ens([1, 2], [2, 3], Z).
Z = [1, 2, 3].

?- union_ens([1, 2], [3, 4], Z).
Z = [1, 2, 3, 4].
```

---

### inclus2(?X, +Y)

**Version de inclus supportant le mode (?, +) -- genere tous les sous-ensembles inclus dans Y.**

**Answer:**

```prolog
inclus2([], _).
inclus2([A | R], Y) :-
    membre(A, Y),
    inclus2(R, Y),
    hors_de(A, R).
```

`hors_de(A, R)` a la fin evite les doublons dans le sous-ensemble genere. Sans cette condition, `[a, a]` serait genere comme sous-ensemble de `[a, b]`.

**Query test:**

```
?- inclus2([3, 2], [1, 2, 3, 4]).
true.

?- inclus2([3, 55], [1, 2, 3, 4]).
false.

?- inclus2(X, [1, 2]).
X = [] ; X = [1] ; X = [1, 2] ; X = [2] ; X = [2, 1] ; false.
```
