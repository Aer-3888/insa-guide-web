---
title: "TP2 - Manipulation de termes construits (Poker)"
sidebar_position: 2
---

# TP2 - Manipulation de termes construits (Poker)

> D'apres les consignes de l'enseignant : `S5/Programmation_Logique/data/moodle/tp/tp2/README.md`

---

### Faits fournis

```prolog
% 13 hauteurs
hauteur(deux).  hauteur(trois).  hauteur(quatre). hauteur(cinq).
hauteur(six).   hauteur(sept).   hauteur(huit).   hauteur(neuf).
hauteur(dix).   hauteur(valet).  hauteur(dame).   hauteur(roi).
hauteur(as).

% 4 couleurs
couleur(trefle). couleur(carreau). couleur(coeur). couleur(pique).

% Successeurs de hauteurs
succ_hauteur(deux, trois).   succ_hauteur(trois, quatre).
succ_hauteur(quatre, cinq).  succ_hauteur(cinq, six).
succ_hauteur(six, sept).     succ_hauteur(sept, huit).
succ_hauteur(huit, neuf).    succ_hauteur(neuf, dix).
succ_hauteur(dix, valet).    succ_hauteur(valet, dame).
succ_hauteur(dame, roi).     succ_hauteur(roi, as).

% Successeurs de couleurs
succ_couleur(trefle, carreau).
succ_couleur(carreau, coeur).
succ_couleur(coeur, pique).
```

---

## Exercice 1

### est_carte/1 : verifie qu'un terme est une carte valide (52 cartes au total)

**Reponse :**

```prolog
est_carte(carte(Hauteur, Couleur)) :-
    hauteur(Hauteur),
    couleur(Couleur).
```

L'unification decompose le terme `carte(H, C)` pour extraire H et C. On verifie ensuite que H est une hauteur valide et C une couleur valide. 13 x 4 = 52 cartes.

**Test :**

```
?- est_carte(carte(sept, trefle)).
true.

?- est_carte(carte(7, trefle)).
false.    % 7 n'est pas un atome hauteur

?- est_carte(carte(sept, t)).
false.    % t n'est pas une couleur

?- est_carte(sept).
false.    % sept n'est pas un terme carte/2
```

---

## Exercice 2

### est_main/1 : verifie qu'un terme est une main de 5 cartes toutes differentes

**Reponse :**

```prolog
est_main(main(C1, C2, C3, C4, C5)) :-
    est_carte(C1), est_carte(C2), est_carte(C3),
    est_carte(C4), est_carte(C5),
    C1 \== C2, C1 \== C3, C1 \== C4, C1 \== C5,
    C2 \== C3, C2 \== C4, C2 \== C5,
    C3 \== C4, C3 \== C5,
    C4 \== C5.
```

L'unification avec `main(C1, C2, C3, C4, C5)` verifie la structure (exactement 5 arguments). On valide chaque carte puis on verifie C(5,2) = 10 paires de non-egalite. On utilise `\==` (non-identite structurelle) plutot que `\=` qui tente l'unification.

**Test :**

```
?- est_main(main(carte(sept,trefle), carte(valet,coeur), carte(dame,carreau),
                 carte(dame,pique), carte(roi,pique))).
true.

?- est_main(main(carte(sep,trefle), carte(sept,coeur), carte(dame,pique),
                 carte(as,trefle))).
false.    % seulement 4 cartes (arite 4 vs 5)
```

---

## Exercice 3

### inf_carte/2 : ordre total sur les cartes (d'abord par hauteur, puis par couleur)

Utilise `inf_hauteur/2` et `inf_couleur/2` definis recursivement via `succ_hauteur` et `succ_couleur`.

**Reponse :**

```prolog
% inf_hauteur(H1, H2) : H1 est strictement inferieure a H2
% Cas de base : H1 est le predecesseur direct de H2.
% Cas recursif : transitivite via un intermediaire.
inf_hauteur(H1, H2) :-
    hauteur(H1), hauteur(H2),
    succ_hauteur(H1, H2).
inf_hauteur(H1, H2) :-
    hauteur(H1), hauteur(H2),
    succ_hauteur(HTemp, H2),
    inf_hauteur(H1, HTemp).

% inf_couleur(C1, C2) : C1 est strictement inferieure a C2
inf_couleur(C1, C2) :- succ_couleur(C1, C2).
inf_couleur(C1, C2) :-
    succ_couleur(CTemp, C2),
    inf_couleur(C1, CTemp).

% inf_carte(C1, C2) : C1 < C2
% Hauteurs differentes : on compare par hauteur
inf_carte(carte(H1, _), carte(H2, _)) :-
    inf_hauteur(H1, H2).
% Meme hauteur : on departage par couleur
inf_carte(carte(H, C1), carte(H, C2)) :-
    inf_couleur(C1, C2).
```

L'ordre est defini par les faits `succ_hauteur` et `succ_couleur`, pas par l'arithmetique. La transitivite est obtenue par recursion : on descend vers le predecesseur de H2 jusqu'a atteindre H1.

**Test :**

```
?- inf_carte(carte(quatre, pique), carte(cinq, coeur)).
true.    % quatre < cinq (hauteurs differentes, couleurs ignorees)

?- inf_carte(carte(cinq, trefle), carte(cinq, coeur)).
true.    % meme hauteur, trefle < coeur

?- inf_carte(carte(as, pique), carte(deux, trefle)).
false.   % as est la plus haute hauteur
```

---

## Exercice 4

### est_main_triee/1 : la main est une main valide dont les cartes sont en ordre croissant

**Reponse :**

```prolog
est_main_triee(main(C1, C2, C3, C4, C5)) :-
    est_main(main(C1, C2, C3, C4, C5)),
    inf_carte(C1, C2),
    inf_carte(C2, C3),
    inf_carte(C3, C4),
    inf_carte(C4, C5).
```

On verifie que la main est valide puis que chaque paire de cartes consecutives respecte l'ordre strict.

**Test :**

```
?- est_main_triee(main(carte(sept,trefle), carte(valet,coeur),
                        carte(dame,carreau), carte(dame,pique),
                        carte(roi,pique))).
true.

?- est_main_triee(main(carte(roi,pique), carte(dame,pique),
                        carte(dame,carreau), carte(valet,coeur),
                        carte(sept,trefle))).
false.    % ordre decroissant
```

---

## Exercice 5

### une_paire/1 : la main contient au moins 2 cartes de meme hauteur (consecutives en main triee)

**Reponse :**

```prolog
une_paire(main(carte(H,_), carte(H,_), carte(_,_), carte(_,_), carte(_,_))).
une_paire(main(carte(_,_), carte(H,_), carte(H,_), carte(_,_), carte(_,_))).
une_paire(main(carte(_,_), carte(_,_), carte(H,_), carte(H,_), carte(_,_))).
une_paire(main(carte(_,_), carte(_,_), carte(_,_), carte(H,_), carte(H,_))).
```

Dans une main triee, deux cartes de meme hauteur sont forcement adjacentes. On enumere les 4 positions possibles. La variable `H` partagee entre deux positions force l'egalite des hauteurs par unification. Chaque `_` est une variable independante.

**Test :**

```
?- une_paire(main(carte(sept,trefle), carte(valet,coeur),
                  carte(dame,carreau), carte(dame,pique),
                  carte(roi,pique))).
true.    % paire de dames en positions 3-4

?- une_paire(main(carte(sept,trefle), carte(huit,pique),
                  carte(neuf,coeur), carte(dix,carreau),
                  carte(valet,carreau))).
false.   % aucune paire (c'est une suite)
```

---

## Exercice 6

### deux_paires/1 : la main contient au moins 2 paires distinctes

**Reponse :**

```prolog
deux_paires(main(carte(H,_), carte(H,_), carte(K,_), carte(K,_), carte(_,_))).
deux_paires(main(carte(H,_), carte(H,_), carte(_,_), carte(K,_), carte(K,_))).
deux_paires(main(carte(_,_), carte(H,_), carte(H,_), carte(K,_), carte(K,_))).
```

Trois dispositions possibles dans une main triee de 5 cartes :
- Positions 1-2 et 3-4 : `PPQQX`
- Positions 1-2 et 4-5 : `PPXQQ`
- Positions 2-3 et 4-5 : `XPPQQ`

**Test :**

```
?- deux_paires(main(carte(valet,trefle), carte(valet,coeur),
                    carte(dame,carreau), carte(roi,coeur),
                    carte(roi,pique))).
true.    % paire de valets + paire de rois
```

---

## Exercice 7

### brelan/1 : 3 cartes consecutives de meme hauteur

**Reponse :**

```prolog
brelan(main(carte(H,_), carte(H,_), carte(H,_), carte(_,_), carte(_,_))).
brelan(main(carte(_,_), carte(H,_), carte(H,_), carte(H,_), carte(_,_))).
brelan(main(carte(_,_), carte(_,_), carte(H,_), carte(H,_), carte(H,_))).
```

3 positions possibles dans une main triee : `BBBXX`, `XBBBX`, `XXBBB`.

**Test :**

```
?- brelan(main(carte(sept,trefle), carte(dame,carreau),
              carte(dame,coeur), carte(dame,pique),
              carte(roi,pique))).
true.    % brelan de dames en positions 2-3-4
```

---

## Exercice 8

### suite/1 : 5 hauteurs consecutives (utilise `succ_hauteur`)

**Reponse :**

```prolog
suite(main(carte(H1,_), carte(H2,_), carte(H3,_), carte(H4,_), carte(H5,_))) :-
    succ_hauteur(H1, H2),
    succ_hauteur(H2, H3),
    succ_hauteur(H3, H4),
    succ_hauteur(H4, H5).
```

On verifie que chaque paire de hauteurs consecutives dans la main est liee par `succ_hauteur`. Pas de recursion necessaire : on teste directement les 4 paires adjacentes.

**Test :**

```
?- suite(main(carte(sept,trefle), carte(huit,pique),
             carte(neuf,coeur), carte(dix,carreau),
             carte(valet,carreau))).
true.

?- suite(main(carte(sept,trefle), carte(huit,pique),
             carte(dix,coeur), carte(valet,carreau),
             carte(dame,carreau))).
false.    % huit -> dix n'est pas un successeur direct
```

---

## Exercice 9

### full/1 : une paire + un brelan (hauteurs differentes)

**Reponse :**

```prolog
full(main(carte(H,_), carte(H,_), carte(P,_), carte(P,_), carte(P,_))) :-
    P \== H.
full(main(carte(P,_), carte(P,_), carte(P,_), carte(H,_), carte(H,_))) :-
    P \== H.
```

Dans une main triee, un full a deux dispositions : `PPBBB` ou `BBBPP`. La condition `P \== H` garantit que la paire et le brelan sont de hauteurs differentes.

**Test :**

```
?- full(main(carte(deux,coeur), carte(deux,pique), carte(quatre,trefle),
            carte(quatre,coeur), carte(quatre,pique))).
true.    % paire de deux + brelan de quatre

?- full(main(carte(sept,trefle), carte(valet,coeur),
            carte(dame,carreau), carte(dame,pique),
            carte(roi,pique))).
false.   % seulement une paire, pas de brelan
```
