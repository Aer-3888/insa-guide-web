---
title: "TP6 - Bases de donnees deductives"
sidebar_position: 6
---

# TP6 - Bases de donnees deductives

> D'apres les consignes de l'enseignant : `S5/Programmation_Logique/data/moodle/tp/tp6/README.md`

---

## Section 1 : Base de donnees

### 5 tables representees par des faits Prolog

```prolog
% assemblage(Composant, ComposeDe, Quantite)
assemblage(voiture, porte, 4).
assemblage(voiture, roue, 4).
assemblage(voiture, moteur, 1).
assemblage(roue, jante, 1).
assemblage(porte, tole, 1).
assemblage(porte, vitre, 1).
assemblage(roue, pneu, 1).
assemblage(moteur, piston, 4).
assemblage(moteur, soupape, 16).

% piece(NumPiece, Nom, LieuFabrication)
piece(p1, tole, lyon).
piece(p2, jante, lyon).
piece(p3, jante, marseille).
piece(p4, pneu, clermontFerrand).
piece(p5, piston, toulouse).
piece(p6, soupape, lille).
piece(p7, vitre, nancy).
piece(p8, tole, marseille).
piece(p9, vitre, marseille).

% demandeFournisseur(Nom, Ville)
demandeFournisseur(dupont, lyon).
demandeFournisseur(michel, clermontFerrand).
demandeFournisseur(durand, lille).
demandeFournisseur(dupond, lille).
demandeFournisseur(martin, rennes).
demandeFournisseur(smith, paris).
demandeFournisseur(brown, marseille).

% fournisseurReference(NumF, Nom, Ville)
fournisseurReference(f1, dupont, lyon).
fournisseurReference(f2, durand, lille).
fournisseurReference(f3, martin, rennes).
fournisseurReference(f4, michel, clermontFerrand).
fournisseurReference(f5, smith, paris).
fournisseurReference(f6, brown, marseille).

% livraison(NumFournisseur, Piece, Quantite)
livraison(f1, p1, 300).
livraison(f2, p2, 200).
livraison(f3, p3, 200).
livraison(f4, p4, 400).
livraison(f6, p5, 500).
livraison(f6, p6, 1000).
livraison(f6, p7, 300).
livraison(f1, p2, 300).
livraison(f4, p2, 300).
livraison(f4, p1, 300).
```

---

## Section 2 : Operations relationnelles

---

## Exercice Q2.1

### Selection : `selection_lyon/2` -- Pieces fabriquees a Lyon

**Reponse :**

```prolog
selection_lyon(NumPiece, Nom) :-
    piece(NumPiece, Nom, lyon).
```

Equivalent SQL : `SELECT NumPiece, Nom FROM piece WHERE Lieu = 'lyon'`. L'unification avec la constante `lyon` realise le filtrage.

**Test :**

```
?- selection_lyon(N, P).
N = p1, P = tole ;
N = p2, P = jante ;
false.
```

---

## Exercice Q2.2

### Projection : `projection/2` -- Noms et lieux des pieces

**Reponse :**

```prolog
projection(Nom, Lieu) :-
    piece(_, Nom, Lieu).
```

Equivalent SQL : `SELECT Nom, Lieu FROM piece`. Le `_` ignore les colonnes non desirees.

**Test :**

```
?- projection(Nom, Lieu).
Nom = tole, Lieu = lyon ;
Nom = jante, Lieu = lyon ;
Nom = jante, Lieu = marseille ;
Nom = pneu, Lieu = clermontFerrand ;
Nom = piston, Lieu = toulouse ;
Nom = soupape, Lieu = lille ;
Nom = vitre, Lieu = nancy ;
Nom = tole, Lieu = marseille ;
Nom = vitre, Lieu = marseille ;
false.
```

---

## Exercice Q2.3

### Union : `union/2` -- Union de demande et reference

**Reponse :**

```prolog
union(Nom, Ville) :-
    demandeFournisseur(Nom, Ville).
union(Nom, Ville) :-
    fournisseurReference(_, Nom, Ville),
    pas_demande_fournisseur(Nom, Ville).

pas_demande_fournisseur(Nom, Ville) :-
    demandeFournisseur(Nom, Ville),
    !, fail.
pas_demande_fournisseur(_, _).
```

L'union = tout ce qui est dans A, plus ce qui est dans B mais pas dans A. La clause 2 evite les doublons via le schema cut-fail.

**Test :**

```
?- union(Nom, Ville).
Nom = dupont, Ville = lyon ;
Nom = michel, Ville = clermontFerrand ;
Nom = durand, Ville = lille ;
Nom = dupond, Ville = lille ;
Nom = martin, Ville = rennes ;
Nom = smith, Ville = paris ;
Nom = brown, Ville = marseille ;
false.
```

---

### Intersection : `intersection/2` -- Intersection des deux

**Reponse :**

```prolog
intersection(Nom, Ville) :-
    demandeFournisseur(Nom, Ville),
    fournisseurReference(_, Nom, Ville).
```

La conjonction de deux sous-buts realise l'intersection.

**Test :**

```
?- intersection(Nom, Ville).
Nom = dupont, Ville = lyon ;
Nom = michel, Ville = clermontFerrand ;
Nom = durand, Ville = lille ;
Nom = martin, Ville = rennes ;
Nom = smith, Ville = paris ;
Nom = brown, Ville = marseille ;
false.
```

---

### Difference : `difference/2` -- Dans demande mais pas reference

**Reponse :**

```prolog
difference(Nom, Ville) :-
    demandeFournisseur(Nom, Ville),
    pas_fournisseur_reference(Nom, Ville).

pas_fournisseur_reference(Nom, Ville) :-
    fournisseurReference(_, Nom, Ville),
    !, fail.
pas_fournisseur_reference(_, _).
```

Schema cut-fail pour simuler `NOT EXISTS` : si on trouve le fournisseur dans la reference, le cut empeche de backtracker vers la clause 2 et fail force l'echec. Si on ne le trouve pas, la clause attrape-tout reussit.

**Test :**

```
?- difference(Nom, Ville).
Nom = dupond, Ville = lille ;
false.
```

---

## Exercice Q2.4

### Produit cartesien : `produit_cartesien/6` -- Fournisseurs x Livraisons

**Reponse :**

```prolog
produit_cartesien(NumF1, Nom, Ville, NumF2, Piece, Qte) :-
    fournisseurReference(NumF1, Nom, Ville),
    livraison(NumF2, Piece, Qte).
```

Equivalent SQL : `SELECT * FROM fournisseurReference CROSS JOIN livraison`. Deux sous-buts independants : Prolog genere toutes les combinaisons (6 x 10 = 60 resultats).

**Test :**

```
?- produit_cartesien(f1, dupont, lyon, NumF2, Piece, Qte).
NumF2 = f1, Piece = p1, Qte = 300 ;
NumF2 = f2, Piece = p2, Qte = 200 ;
NumF2 = f3, Piece = p3, Qte = 200 ;
...    % 10 resultats pour f1
```

---

## Exercice Q2.5

### Jointure : `jointure/5` -- Fournisseurs avec leurs livraisons

**Reponse :**

```prolog
jointure(NumF, Nom, Ville, Piece, Qte) :-
    fournisseurReference(NumF, Nom, Ville),
    livraison(NumF, Piece, Qte).
```

La variable `NumF` partagee entre les deux sous-buts realise la condition de jointure (JOIN ON).

**Test :**

```
?- jointure(NumF, Nom, Ville, Piece, Qte).
NumF = f1, Nom = dupont, Ville = lyon, Piece = p1, Qte = 300 ;
NumF = f1, Nom = dupont, Ville = lyon, Piece = p2, Qte = 300 ;
NumF = f2, Nom = durand, Ville = lille, Piece = p2, Qte = 200 ;
NumF = f3, Nom = martin, Ville = rennes, Piece = p3, Qte = 200 ;
NumF = f4, Nom = michel, Ville = clermontFerrand, Piece = p4, Qte = 400 ;
NumF = f4, Nom = michel, Ville = clermontFerrand, Piece = p2, Qte = 300 ;
NumF = f4, Nom = michel, Ville = clermontFerrand, Piece = p1, Qte = 300 ;
NumF = f6, Nom = brown, Ville = marseille, Piece = p5, Qte = 500 ;
NumF = f6, Nom = brown, Ville = marseille, Piece = p6, Qte = 1000 ;
NumF = f6, Nom = brown, Ville = marseille, Piece = p7, Qte = 300 ;
false.
```

---

### Jointure sup : `jointure_sup/5` -- Livraisons > 350

**Reponse :**

```prolog
jointure_sup(NumF, Nom, Ville, Piece, Qte) :-
    fournisseurReference(NumF, Nom, Ville),
    livraison(NumF, Piece, Qte),
    Qte >= 350.
```

**Test :**

```
?- jointure_sup(NumF, Nom, Ville, Piece, Qte).
NumF = f4, Nom = michel, Ville = clermontFerrand, Piece = p4, Qte = 400 ;
NumF = f6, Nom = brown, Ville = marseille, Piece = p5, Qte = 500 ;
NumF = f6, Nom = brown, Ville = marseille, Piece = p6, Qte = 1000 ;
false.
```

---

## Exercice Q2.6

### Division : `division/1` -- Fournisseurs livrant toutes les pieces de Lyon

**Reponse :**

```prolog
division(F) :-
    fournisseurReference(F, _, _),
    not(existe_piece_lyon_non_fournie(F)).

existe_piece_lyon_non_fournie(F) :-
    piece(P, _, lyon),
    not(livraison(F, P, _)).
```

Logique en double negation : F fournit toutes les pieces de Lyon = il n'existe PAS de piece de Lyon que F ne fournit PAS. Les pieces de Lyon sont p1 (tole) et p2 (jante).

**Test :**

```
?- division(F).
F = f1 ;    % dupont : livre p1 et p2
F = f4 ;    % michel : livre p1 et p2
false.
```

---

## Exercice Q2.7

### Agregation : `total_pieces_livrees_fournisseur/2` -- Total livraisons par fournisseur

**Reponse :**

```prolog
total_pieces_livrees_fournisseur(F, Total) :-
    fournisseurReference(F, _, _),
    findall(Qte, livraison(F, _, Qte), ListeQtes),
    somme_liste(ListeQtes, Total).

somme_liste([], 0).
somme_liste([E | R], Res) :-
    somme_liste(R, Res1),
    Res is E + Res1.
```

`findall/3` collecte toutes les quantites livrees par F, puis `somme_liste` les additionne. Si F ne livre rien, `findall` retourne `[]` et la somme est 0.

**Test :**

```
?- total_pieces_livrees_fournisseur(F, Total).
F = f1, Total = 600 ;
F = f2, Total = 200 ;
F = f3, Total = 200 ;
F = f4, Total = 1000 ;
F = f5, Total = 0 ;       % f5 ne livre rien
F = f6, Total = 1800 ;
false.
```

---

## Section 3 : Au-dela de l'algebre relationnelle

---

## Exercice Q3.1

### est_compose_de/2 : Composants et pieces necessaires (transitif)

**Reponse :**

```prolog
est_compose_de(C, U) :- assemblage(C, U, _).
est_compose_de(C, V) :- assemblage(C, U, _), est_compose_de(U, V).
```

Fermeture transitive de la relation `assemblage`. Le cas direct utilise assemblage, le cas recursif compose transitivement. Ce type de requete est impossible en SQL standard (sans CTE RECURSIVE).

**Test :**

```
?- est_compose_de(voiture, X).
X = porte ;
X = roue ;
X = moteur ;
X = tole ;       % via porte
X = vitre ;      % via porte
X = jante ;      % via roue
X = pneu ;       % via roue
X = piston ;     % via moteur
X = soupape ;    % via moteur
false.

?- est_compose_de(moteur, X).
X = piston ;
X = soupape ;
false.

?- est_compose_de(jante, _).
false.    % jante est une piece de base
```

---

## Exercice Q3.2

### nb_pieces_tot/3 : Nombre total de pieces de base par composant

**Reponse :**

```prolog
nb_pieces_tot(Composant, Piece, Qte) :-
    assemblage(Composant, Piece, Qte),
    not(assemblage(Piece, _, _)).
nb_pieces_tot(Composant, Piece, Qte) :-
    assemblage(Composant, Intermediaire, Qte1),
    nb_pieces_tot(Intermediaire, Piece, Qte2),
    Qte is Qte1 * Qte2.
```

Clause 1 : lien direct vers une piece de base (pas de sous-assemblage). Clause 2 : passage par un intermediaire avec multiplication des quantites. Les pieces de base sont identifiees par `not(assemblage(Piece, _, _))` (feuilles du graphe).

**Test :**

```
?- nb_pieces_tot(voiture, Piece, Qte).
Piece = tole, Qte = 4 ;       % 4 portes x 1 tole
Piece = vitre, Qte = 4 ;      % 4 portes x 1 vitre
Piece = jante, Qte = 4 ;      % 4 roues x 1 jante
Piece = pneu, Qte = 4 ;       % 4 roues x 1 pneu
Piece = piston, Qte = 4 ;     % 1 moteur x 4 pistons
Piece = soupape, Qte = 16 ;   % 1 moteur x 16 soupapes
false.

?- nb_pieces_tot(moteur, Piece, Qte).
Piece = piston, Qte = 4 ;
Piece = soupape, Qte = 16 ;
false.
```

---

## Exercice Q3.3

### nb_voiture/1 : Nombre de voitures constructibles avec les livraisons

**Reponse :**

```prolog
nb_voiture(Nb) :-
    findall(NbPossible, nb_voitures_par_piece(NbPossible), Liste),
    min_liste(Liste, Nb).

nb_voitures_par_piece(NbPossible) :-
    nb_pieces_tot(voiture, NomPiece, QteNecessaire),
    findall(Q, (piece(NumP, NomPiece, _), livraison(_, NumP, Q)), ListeQ),
    somme_liste(ListeQ, QteDispo),
    NbPossible is QteDispo // QteNecessaire.

min_liste([X], X).
min_liste([X, Y | R], Min) :- X =< Y, min_liste([X | R], Min).
min_liste([X, Y | R], Min) :- X > Y, min_liste([Y | R], Min).
```

Pour chaque type de piece de base, on calcule combien de voitures cette piece permet de construire (quantite disponible / quantite necessaire par division entiere `//`). Le minimum donne le nombre maximal. Le goulot d'etranglement est la soupape : 1000 // 16 = 62.

**Test :**

```
?- nb_voiture(Nb).
Nb = 62.
```

Detail par piece :
- tole : 600 dispo / 4 = 150
- vitre : 300 dispo / 4 = 75
- jante : 1000 dispo / 4 = 250
- pneu : 400 dispo / 4 = 100
- piston : 500 dispo / 4 = 125
- soupape : 1000 dispo / 16 = 62 (minimum)
