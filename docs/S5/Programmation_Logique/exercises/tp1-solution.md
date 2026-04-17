---
title: "TP1 - Interrogation style base de donnees"
sidebar_position: 1
---

# TP1 - Interrogation style base de donnees

> Following teacher instructions from: `S5/Programmation_Logique/data/moodle/tp/tp1/README.md`

---

## Partie 1 : Base Menu (`basemenu.pl`)

### Faits fournis

```prolog
hors_d_oeuvre(artichauts_Melanie).
hors_d_oeuvre(truffes_sous_le_sel).
hors_d_oeuvre(cresson_oeuf_poche).

viande(grillade_de_boeuf).
viande(poulet_au_tilleul).

poisson(bar_aux_algues).
poisson(saumon_oseille).

dessert(sorbet_aux_poires).
dessert(fraises_chantilly).
dessert(melon_en_surprise).

calories(artichauts_Melanie, 150).
calories(truffes_sous_le_sel, 202).
calories(cresson_oeuf_poche, 212).
calories(grillade_de_boeuf, 532).
calories(poulet_au_tilleul, 400).
calories(bar_aux_algues, 292).
calories(saumon_oseille, 254).
calories(sorbet_aux_poires, 223).
calories(fraises_chantilly, 289).
calories(melon_en_surprise, 122).
```

---

## Exercise 1

### plat/1 : un plat de resistance est une viande ou un poisson

**Answer:**

```prolog
plat(P) :- poisson(P).
plat(P) :- viande(P).
```

Un plat est defini par deux clauses : P est un plat s'il est un poisson, ou s'il est une viande. Le "ou" logique se traduit par deux clauses distinctes.

**Query test:**

```
?- plat(grillade_de_boeuf).
true.

?- plat(artichauts_Melanie).
false.

?- plat(X).
X = bar_aux_algues ;
X = saumon_oseille ;
X = grillade_de_boeuf ;
X = poulet_au_tilleul.
```

---

## Exercise 2

### repas/3 : un repas = hors d'oeuvre + plat + dessert

**Answer:**

```prolog
repas(HorsOeuvre, Plat, Dessert) :-
    hors_d_oeuvre(HorsOeuvre),
    plat(Plat),
    dessert(Dessert).
```

Un repas est la conjonction de trois proprietes : un hors d'oeuvre valide, un plat valide et un dessert valide. Prolog genere toutes les combinaisons par backtracking (3 x 4 x 3 = 36 repas).

**Query test:**

```
?- repas(cresson_oeuf_poche, poulet_au_tilleul, fraises_chantilly).
true.

?- repas(melon_en_surprise, poulet_au_tilleul, fraises_chantilly).
false.

?- repas(H, P, D).
H = artichauts_Melanie, P = bar_aux_algues, D = sorbet_aux_poires ;
H = artichauts_Melanie, P = bar_aux_algues, D = fraises_chantilly ;
H = artichauts_Melanie, P = bar_aux_algues, D = melon_en_surprise ;
...    % 36 combinaisons au total
```

---

## Exercise 3

### plat200_400/1 : plats entre 200 et 400 calories

**Answer:**

```prolog
plat200_400(Plat) :-
    plat(Plat),
    calories(Plat, Cal),
    Cal >= 200,
    Cal =< 400.
```

On filtre les plats par une condition arithmetique. Les comparaisons `>=` et `=<` evaluent leurs operandes. Attention : c'est `=<` et non `<=` en Prolog.

**Query test:**

```
?- plat200_400(X).
X = bar_aux_algues ;      % 292 cal
X = saumon_oseille ;       % 254 cal
X = poulet_au_tilleul.     % 400 cal
```

---

## Exercise 4

### plat_bar/1 : plats plus caloriques que le bar aux algues

**Answer:**

```prolog
plat_bar(Plat) :-
    plat(Plat),
    calories(bar_aux_algues, CalBar),
    calories(Plat, CalPlat),
    CalPlat > CalBar.
```

On interroge la base pour obtenir la valeur calorique du bar (292), puis on compare chaque plat a cette valeur avec une comparaison stricte `>`.

**Query test:**

```
?- plat_bar(X).
X = grillade_de_boeuf ;   % 532 > 292
X = poulet_au_tilleul.     % 400 > 292
```

---

## Exercise 5

### val_cal/4 : valeur calorique totale d'un repas

**Answer:**

```prolog
val_cal(HorsOeuvre, Plat, Dessert, TotalCal) :-
    repas(HorsOeuvre, Plat, Dessert),
    calories(HorsOeuvre, CalH),
    calories(Plat, CalP),
    calories(Dessert, CalD),
    TotalCal is CalH + CalP + CalD.
```

On reutilise `repas/3` pour valider la combinaison, puis on recupere les calories de chaque element et on calcule le total avec `is`. Note : `is` evalue l'expression a droite, contrairement a `=` qui unifierait avec le terme compose `+(+(CalH,CalP),CalD)`.

**Query test:**

```
?- val_cal(cresson_oeuf_poche, poulet_au_tilleul, fraises_chantilly, T).
T = 901.

?- val_cal(artichauts_Melanie, saumon_oseille, melon_en_surprise, T).
T = 526.
```

---

## Exercise 6

### repas_eq/3 : repas equilibre (total <= 800 cal)

**Answer:**

```prolog
repas_eq(HorsOeuvre, Plat, Dessert) :-
    val_cal(HorsOeuvre, Plat, Dessert, Cal),
    Cal =< 800.
```

On compose `val_cal/4` avec un filtrage sur le total calorique.

**Query test:**

```
?- repas_eq(artichauts_Melanie, saumon_oseille, fraises_chantilly).
true.    % 150 + 254 + 289 = 693 =< 800

?- repas_eq(truffes_sous_le_sel, grillade_de_boeuf, sorbet_aux_poires).
false.   % 202 + 532 + 223 = 957 > 800

?- repas_eq(H, P, D).
H = artichauts_Melanie, P = bar_aux_algues, D = sorbet_aux_poires ;
H = artichauts_Melanie, P = bar_aux_algues, D = fraises_chantilly ;
H = artichauts_Melanie, P = bar_aux_algues, D = melon_en_surprise ;
H = artichauts_Melanie, P = saumon_oseille, D = sorbet_aux_poires ;
H = artichauts_Melanie, P = saumon_oseille, D = fraises_chantilly ;
H = artichauts_Melanie, P = saumon_oseille, D = melon_en_surprise ;
H = artichauts_Melanie, P = poulet_au_tilleul, D = melon_en_surprise ;
...
```

---

## Partie 2 : Base Valois (`basevalois.pl`)

### Faits fournis

```prolog
homme(charles_V).    homme(charles_VI).    homme(charles_VII).
homme(louis_XI).     homme(charles_VIII).  homme(louis_XII).
homme(francois_I).   homme(henri_II).      homme(francois_II).
homme(charles_IX).   homme(henri_III).     homme(jean_II).
homme(philippe_VI).  homme(charles_d_Orleans). homme(charles_de_Valois).
homme(louis_d_Orleans). homme(jean_d_angouleme). homme(charles_d_angouleme).

femme(anne_de_cleves).  femme(louise_de_Savoie).   femme(claude_de_france).
femme(anne_de_Bretagne). femme(catherine_de_medicis). femme(charlotte_de_Savoie).
femme(marie_d_anjou).   femme(isabeau_de_Baviere). femme(valentine_de_milan).
femme(jeanne_de_Bourbon). femme(bonne_de_luxembourg). femme(jeanne_de_Bourgogne).
femme(marie_Stuart).    femme(elisabeth_d_autriche). femme(louise_de_lorraine).
femme(marguerite_de_Rohan).

pere(louis_XII, claude_de_france).
pere(charles_de_Valois, philippe_VI).
pere(philippe_VI, jean_II).
pere(jean_II, charles_V).
pere(charles_V, charles_VI).
pere(charles_VI, charles_VII).
pere(charles_VII, louis_XI).
pere(charles_d_Orleans, louis_XII).
pere(charles_d_angouleme, francois_I).
pere(francois_I, henri_II).
pere(henri_II, francois_II).
pere(henri_II, charles_IX).
pere(henri_II, henri_III).
pere(louis_d_Orleans, charles_d_Orleans).
pere(charles_V, louis_d_Orleans).
pere(jean_d_angouleme, charles_d_angouleme).
pere(louis_d_Orleans, jean_d_angouleme).

mere(marguerite_de_Rohan, charles_d_angouleme).
mere(jeanne_de_Bourgogne, jean_II).
mere(bonne_de_luxembourg, charles_V).
mere(jeanne_de_Bourbon, charles_VI).
mere(jeanne_de_Bourbon, louis_d_Orleans).
mere(valentine_de_milan, charles_d_Orleans).
mere(valentine_de_milan, jean_d_angouleme).
mere(isabeau_de_Baviere, charles_VII).
mere(marie_d_anjou, louis_XI).
mere(charlotte_de_Savoie, charles_VIII).
mere(anne_de_Bretagne, claude_de_france).
mere(claude_de_france, henri_II).
mere(anne_de_cleves, louis_XII).
mere(louise_de_Savoie, francois_I).
mere(catherine_de_medicis, francois_II).
mere(catherine_de_medicis, charles_IX).
mere(catherine_de_medicis, henri_III).

roi(charles_V, le_sage, 1364, 1380).
roi(charles_VI, le_bien_aime, 1380, 1422).
roi(charles_VII, xx, 1422, 1461).
roi(louis_XI, xx, 1461, 1483).
roi(charles_VIII, xx, 1483, 1498).
roi(louis_XII, le_pere_du_peuple, 1498, 1515).
roi(francois_I, xx, 1515, 1547).
roi(henri_II, xx, 1547, 1559).
roi(francois_II, xx, 1559, 1560).
roi(charles_IX, xx, 1560, 1574).
roi(henri_III, xx, 1574, 1589).
roi(jean_II, le_bon, 1350, 1364).
roi(philippe_VI, de_valois, 1328, 1350).
```

---

## Exercise 1

### enfant/2 : E est enfant de P (via `pere` ou `mere`)

**Answer:**

```prolog
enfant(Enfant, Parent) :- pere(Parent, Enfant).
enfant(Enfant, Parent) :- mere(Parent, Enfant).
```

La relation "etre enfant de" est l'inverse de "etre pere de" et "etre mere de". Deux clauses couvrent les deux cas.

**Query test:**

```
?- enfant(claude_de_france, louis_XII).
true.

?- enfant(charles_VII, charles_VI).
true.

?- enfant(charles_VIII, charles_VI).
false.

?- enfant(X, charles_V).
X = charles_VI ;
X = louis_d_Orleans ;
false.
```

---

## Exercise 2

### parent/2 : inverse de `enfant`

**Answer:**

```prolog
parent(Parent, Enfant) :- enfant(Enfant, Parent).
```

**Query test:**

```
?- parent(louis_XII, claude_de_france).
true.

?- parent(anne_de_Bretagne, francois_I).
false.

?- parent(P, louis_d_Orleans).
P = charles_V ;
P = jeanne_de_Bourbon ;
false.
```

---

## Exercise 3

### grand_pere/2 : G est un homme, parent d'un parent de E

**Answer:**

```prolog
grand_pere(GrandPere, Enfant) :-
    homme(GrandPere),
    parent(GrandPere, ParentIntermediaire),
    parent(ParentIntermediaire, Enfant).
```

Un grand-pere est un homme qui est parent d'un parent de E. On enchaine deux applications de `parent/2` via un intermediaire. Le test `homme(G)` garantit que G est un homme.

**Query test:**

```
?- grand_pere(louis_d_Orleans, charles_d_angouleme).
true.

?- grand_pere(louis_XI, charles_d_angouleme).
false.

?- grand_pere(louis_d_Orleans, E).
E = charles_d_angouleme ;
E = louis_XII ;
false.
```

---

## Exercise 4

### frere/2 : meme pere et meme mere, personnes differentes

**Answer:**

```prolog
frere(Frere, Enfant) :-
    homme(Frere),
    pere(P, Frere),
    pere(P, Enfant),
    mere(M, Frere),
    mere(M, Enfant),
    \==(Enfant, Frere).
```

Deux individus sont freres s'ils sont des hommes differents partageant le meme pere ET la meme mere. Le `\==` verifie la non-identite structurelle. La verification de la mere empeche que des demi-freres soient consideres comme freres.

**Query test:**

```
?- frere(francois_II, charles_IX).
true.

?- frere(charles_IX, F).
F = francois_II ;
F = henri_III ;
false.
```

---

## Exercise 5

### oncle/2 : frere du pere

**Answer:**

```prolog
oncle(Oncle, Neveu) :-
    homme(Oncle),
    pere(P, Neveu),
    frere(Oncle, P).
```

**Query test:**

```
?- oncle(charles_VI, jean_d_angouleme).
true.

?- oncle(louis_d_Orleans, louis_XII).
false.

?- oncle(charles_VI, N).
N = charles_d_Orleans ;
N = jean_d_angouleme ;
false.
```

---

## Exercise 6

### cousin/2 : fils d'un oncle

**Answer:**

```prolog
cousin(Cousin, Enfant) :-
    homme(Cousin),
    oncle(Oncle, Enfant),
    parent(Oncle, Cousin).
```

**Query test:**

```
?- cousin(charles_VII, C).
C = charles_d_Orleans ;
C = jean_d_angouleme ;
false.

?- cousin(charles_IX, henri_III).
false.    % ils sont freres, pas cousins

?- cousin(charles_d_Orleans, louis_d_Orleans).
false.    % ils sont freres
```

---

## Exercise 7

### le_roi_est_mort_vive_le_roi/3 : succession royale a une date

**Answer:**

```prolog
le_roi_est_mort_vive_le_roi(Roi1, Date, Roi2) :-
    roi(Roi1, _, _, Date),
    roi(Roi2, _, Date, _).
```

On cherche un roi dont le regne finit a la date D, et un autre dont le regne commence a cette meme date. C'est une jointure sur la date.

**Query test:**

```
?- le_roi_est_mort_vive_le_roi(charles_VI, 1422, charles_VII).
true.

?- le_roi_est_mort_vive_le_roi(charles_VI, 1421, charles_VII).
false.

?- le_roi_est_mort_vive_le_roi(R, 1515, Succ).
R = louis_XII, Succ = francois_I.
```

---

## Exercise 8

### ancetre/2 : relation transitive de parente (recursif)

**Answer:**

```prolog
ancetre(X, Y) :- parent(X, Y).
ancetre(X, Y) :-
    parent(P, Y),
    ancetre(X, P).
```

Cas de base : X est un parent direct de Y. Cas recursif : X est un ancetre d'un parent de Y. L'ordre est crucial : le cas de base doit etre avant le cas recursif pour garantir la terminaison. Le sous-but `parent(P, Y)` instancie P avant l'appel recursif, ce qui evite une recursion infinie.

**Query test:**

```
?- ancetre(jean_II, louis_d_Orleans).
true.    % jean_II -> charles_V -> louis_d_Orleans

?- ancetre(A, louis_d_Orleans).
A = charles_V ;
A = jeanne_de_Bourbon ;
A = jean_II ;
A = bonne_de_luxembourg ;
A = philippe_VI ;
A = jeanne_de_Bourgogne ;
A = charles_de_Valois ;
false.
```
