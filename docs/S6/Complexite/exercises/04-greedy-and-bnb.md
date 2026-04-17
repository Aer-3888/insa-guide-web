---
title: "Exercices -- Algorithmes gloutons et Branch & Bound"
sidebar_position: 4
---

# Exercices -- Algorithmes gloutons et Branch & Bound

> Chaque preuve d'optimalite est detaillee pas a pas. Chaque arbre B&B montre les bornes et elagages.

---

## Exercice 1 : Rendu de monnaie -- glouton vs optimal

**Enonce :** Pieces de 6, 4, et 1 centime. Rendre 8 centimes avec un minimum de pieces.

### Glouton (plus grosse piece d'abord)

```
8 centimes : plus grosse piece possible = 6. Reste 2.
2 centimes : plus grosse piece possible = 1. Reste 1.
1 centime  : plus grosse piece possible = 1. Reste 0.

Glouton : 6 + 1 + 1 = 3 pieces
```

### Solution optimale

```
4 + 4 = 2 pieces
```

Le glouton donne 3 pieces, l'optimal est 2. Le glouton echoue car la denomination 4 n'est pas un diviseur de 6, creant un "piege".

**Regle :** Le glouton est optimal pour le systeme euro/US (1, 2, 5, 10, 20, 50, 100, 200) mais PAS pour des systemes arbitraires.

---

## Exercice 2 : Reservation de salles -- deroulement complet

**Enonce :** 6 activites :

| Activite | Debut | Fin |
|----------|-------|-----|
| A | 1 | 4 |
| B | 3 | 5 |
| C | 0 | 6 |
| D | 5 | 7 |
| E | 3 | 9 |
| F | 5 | 9 |

### Etape 1 -- Trier par heure de fin croissante

```
A [1, 4], B [3, 5], C [0, 6], D [5, 7], E [3, 9], F [5, 9]
```

### Etape 2 -- Selection gloutonne

```
i=1 : A [1, 4] => pas d'activite selectionnee avant.
      debut(A)=1 >= -inf. SELECTIONNER A. derniere_fin = 4.

i=2 : B [3, 5] => debut(B)=3 < derniere_fin=4. INCOMPATIBLE. Sauter.

i=3 : C [0, 6] => debut(C)=0 < derniere_fin=4. INCOMPATIBLE. Sauter.

i=4 : D [5, 7] => debut(D)=5 >= derniere_fin=4. SELECTIONNER D. derniere_fin = 7.

i=5 : E [3, 9] => debut(E)=3 < derniere_fin=7. INCOMPATIBLE. Sauter.

i=6 : F [5, 9] => debut(F)=5 < derniere_fin=7. INCOMPATIBLE. Sauter.
```

**Resultat : {A, D} = 2 activites.**

---

## Exercice 3 : Preuve d'optimalite par echange (reservation de salles)

**Theoreme :** Le glouton "fin la plus tot" donne le nombre maximal d'activites compatibles.

### Preuve complete

Soit G = {g_1, g_2, ..., g_k} la solution gloutonne, triee par fin croissante.
Soit O = {o_1, o_2, ..., o_m} une solution optimale quelconque, triee par fin croissante.
Supposons par l'absurde que m > k.

**Lemme (invariant) :** Pour tout i de 1 a k, fin(g_i) <= fin(o_i).

Preuve du lemme par recurrence sur i :

**Base (i = 1) :** g_1 est l'activite de fin la plus precoce parmi toutes les activites (c'est le choix glouton). Donc fin(g_1) <= fin(o_1), quelle que soit o_1.

**Pas inductif :** Supposons fin(g_i) <= fin(o_i). Montrons fin(g_{i+1}) <= fin(o_{i+1}).

```
o_{i+1} est compatible avec o_1, ..., o_i, donc debut(o_{i+1}) >= fin(o_i).
Or fin(o_i) >= fin(g_i) (hypothese de recurrence).
Donc debut(o_{i+1}) >= fin(g_i).
Donc o_{i+1} est compatible avec g_1, ..., g_i.
Le glouton, a l'etape i+1, choisit l'activite compatible de fin la plus precoce.
Donc fin(g_{i+1}) <= fin(o_{i+1}).  QED pour le lemme.
```

**Conclusion :** Puisque fin(g_k) <= fin(o_k), et que O contient o_{k+1} avec debut(o_{k+1}) >= fin(o_k) >= fin(g_k), l'activite o_{k+1} est compatible avec g_1, ..., g_k. Le glouton l'aurait selectionnee, donc la solution gloutonne contiendrait au moins k+1 elements. Contradiction avec |G| = k.

Donc m <= k, et puisque G est une solution valide et O est optimale, m = k. Le glouton est optimal.

---

## Exercice 4 : Ordonnancement de taches (SJF) -- preuve par echange

**Enonce :** n taches de durees d_1, ..., d_n. Minimiser le temps d'attente moyen. Prouver que "plus courte d'abord" (SJF) est optimal.

### Preuve

Considerons un ordonnancement O quelconque. Si deux taches adjacentes i et j (dans cet ordre, j juste apres i) sont telles que d_i > d_j, montrons qu'echanger i et j ameliore le cout.

**Avant echange :** ... i, j, ...

Contribution de i et j au temps d'attente total :

```
- Tache i commence a t. Elle se termine a t + d_i. Toutes les taches apres i attendent d_i.
- Tache j commence a t + d_i. Elle se termine a t + d_i + d_j.
- Contribution combinee au temps total : contribution des taches qui attendaient i et j.
```

Concretement, si on note W le nombre de taches restantes apres j :

```
Cout(i avant j) = (nombre de taches apres i) * d_i + (nombre de taches apres j) * d_j
```

En echangeant i et j (j avant i) :

```
Cout(j avant i) = (nombre de taches apres j) * d_j + (nombre de taches apres i, = nb apres j + 1) * d_i
```

Hmm, simplifions. Pour deux taches adjacentes, l'impact de l'echange concerne seulement l'attente de j causee par i et vice-versa.

```
Si i est avant j : j attend d_i (mais i n'attend pas d_j)
Si j est avant i : i attend d_j (mais j n'attend pas d_i)

Difference = d_i - d_j.
Si d_i > d_j, la configuration "j avant i" fait moins attendre (on attend d_j au lieu de d_i).
```

Donc, tant qu'il existe deux taches adjacentes dans le mauvais ordre (longue avant courte), on peut ameliorer. Le seul ordre qu'on ne peut plus ameliorer est l'ordre croissant des durees : SJF.

---

## Exercice 5 : Sac a dos par Branch & Bound (type DS 2020)

**Enonce :** Capacite C = 130. 4 produits :

| Produit | Volume | Valeur | Ratio valeur/volume |
|---------|--------|--------|---------------------|
| P1 | 33 | 4 | 0.121 |
| P2 | 49 | 5 | 0.102 |
| P3 | 60 | 6 | 0.100 |
| P4 | 32 | 2 | 0.063 |

### Etape 1 -- Solution gloutonne initiale

Tri par ratio decroissant : P1, P2, P3, P4.

```
Prendre P1 : volume = 33,  reste = 97, valeur = 4
Prendre P2 : volume = 82,  reste = 48, valeur = 9
Prendre P4 : volume = 114, reste = 16, valeur = 11
P3 ne rentre pas (60 > 16). Stop.

Solution gloutonne : {P1, P2, P4}, valeur = 11, volume = 114.
nbopt = 11
```

### Etape 2 -- Borne superieure (relaxation continue)

Pour chaque noeud, la borne superieure est : valeur actuelle + somme des valeurs des objets restants qui rentrent + fraction du prochain objet.

### Etape 3 -- Arbre de Branch & Bound

On explore en decidant pour chaque produit : prendre ou ne pas prendre.

```
Racine : vol=0, val=0
Borne = borne_sup(tous les objets) = 4+5+6+2 = 17 (borne triviale)
nbopt = 11 (du glouton)

Niveau 1 : P1
|
+-- P1 = OUI (vol=33, val=4)
|   Borne = 4 + relaxation(P2,P3,P4 dans 97 restant)
|   P2(49): rentre, +5. Reste 48. P3(60): ne rentre pas entierement.
|   Fraction de P3 : 48/60 * 6 = 4.8
|   Borne = 4 + 5 + 4.8 + 0 = 13.8 > 11 => EXPLORER
|   |
|   +-- P2 = OUI (vol=82, val=9)
|   |   Borne = 9 + relaxation(P3,P4 dans 48 restant)
|   |   P3(60): ne rentre pas. Fraction: 48/60*6=4.8. P4: ignore (apres P3).
|   |   Borne = 9 + 4.8 = 13.8 > 11 => EXPLORER
|   |   |
|   |   +-- P3 = OUI (vol=142 > 130) => INFAISABLE
|   |   |
|   |   +-- P3 = NON (vol=82, val=9)
|   |       Borne = 9 + relaxation(P4 dans 48 restant) = 9 + 2 = 11 >= 11 => EXPLORER (egalite)
|   |       |
|   |       +-- P4 = OUI (vol=114, val=11) => FEUILLE, val=11 = nbopt. Pas d'amelioration.
|   |       |
|   |       +-- P4 = NON (vol=82, val=9) => FEUILLE, val=9 < 11. Rejeter.
|   |
|   +-- P2 = NON (vol=33, val=4)
|       Borne = 4 + relaxation(P3,P4 dans 97 restant)
|       P3(60): rentre, +6. Reste 37. P4(32): rentre, +2. Reste 5.
|       Borne = 4 + 6 + 2 = 12 > 11 => EXPLORER
|       |
|       +-- P3 = OUI (vol=93, val=10)
|       |   Borne = 10 + relaxation(P4 dans 37 restant) = 10 + 2 = 12 > 11 => EXPLORER
|       |   |
|       |   +-- P4 = OUI (vol=125, val=12) => 125 <= 130. FEUILLE.
|       |   |   val=12 > nbopt=11. NOUVEAU nbopt = 12. Meilleure solution = {P1, P3, P4}.
|       |   |
|       |   +-- P4 = NON (vol=93, val=10) => FEUILLE, 10 < 12. Rejeter.
|       |
|       +-- P3 = NON (vol=33, val=4)
|           Borne = 4 + relaxation(P4 dans 97 restant) = 4 + 2 = 6 < 12 => ELAGUER
|
+-- P1 = NON (vol=0, val=0)
    Borne = relaxation(P2,P3,P4 dans 130)
    P2(49)+P3(60)+P4(32) = 141 > 130. P2+P3 = 109, reste 21. Fraction P4 : 21/32*2 = 1.3.
    Borne = 5 + 6 + 1.3 = 12.3 > 12 => EXPLORER
    |
    +-- P2 = OUI (vol=49, val=5)
    |   Borne = 5 + relaxation(P3,P4 dans 81)
    |   P3(60): rentre, +6. Reste 21. P4(32): fraction 21/32*2=1.3.
    |   Borne = 5 + 6 + 1.3 = 12.3 > 12 => EXPLORER
    |   |
    |   +-- P3 = OUI (vol=109, val=11)
    |   |   Borne = 11 + relaxation(P4 dans 21) = 11 + 21/32*2 = 11 + 1.3 = 12.3 > 12
    |   |   +-- P4 = OUI (vol=141 > 130) => INFAISABLE
    |   |   +-- P4 = NON (vol=109, val=11) => 11 < 12. Rejeter.
    |   |
    |   +-- P3 = NON (vol=49, val=5)
    |       Borne = 5 + 2 = 7 < 12 => ELAGUER
    |
    +-- P2 = NON (vol=0, val=0)
        Borne = relaxation(P3,P4 dans 130) = 6 + 2 = 8 < 12 => ELAGUER
```

**Solution optimale : {P1, P3, P4}, valeur = 12, volume = 125.**

Le glouton donnait 11 ; le Branch & Bound trouve 12 (meilleur). L'elagage a elimine plusieurs branches grace a la borne initiale du glouton et aux bornes superieures.

---

## Exercice 6 : Traversee de matrice -- comparaison des heuristiques B&B

### Les 4 heuristiques du cours (pour minimisation)

Soit c_ij le nombre de cases restantes a parcourir depuis (i,j) et D_ij le sous-tableau depuis (i,j).

```
d1(i,j) = c_ij * (plus petite valeur non nulle du tableau entier)
d2(i,j) = c_ij * (plus petite valeur non nulle de D_ij)
d3(i,j) = somme des c_ij plus petites valeurs non nulles de D_ij
d4(i,j) = somme des minimums par anti-diagonale de D_ij
```

**Precision croissante :** d1 <= d2 <= d3 <= d4 (comme minorants).

Plus l'heuristique est precise (donne un grand minorant), plus on elague de branches.

**Regle d'elagage :** Si epd(N) = e(N) + d(N) >= nbopt, couper la branche.

Toujours initialiser nbopt avec la solution gloutonne avant de lancer le B&B.
