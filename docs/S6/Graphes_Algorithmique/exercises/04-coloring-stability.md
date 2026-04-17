---
title: "Exercices -- Stabilite, coloration, absorption (TD 4)"
sidebar_position: 4
---

# Exercices -- Stabilite, coloration, absorption (TD 4)

> Chaque probleme est modelise en graphe, puis resolu avec les algorithmes de coloration et de stable/absorbant detailles.

---

## Exercice 1 : Planification d'examens

**Enonce (TD 4) :** On doit organiser une session d'examens ecrits. On desire que chaque etudiant ait au plus un examen par jour. On souhaite organiser la session en un nombre minimum de jours.

7 etudiants inscrits aux examens suivants :

| Etudiant | Examens |
|----------|---------|
| E1 | A, B |
| E2 | A, C, D |
| E3 | B, E |
| E4 | C, E |
| E5 | D, E |
| E6 | A, D |
| E7 | B, C |

### Question 1.1 -- Modelisation en probleme de coloration

**Principe :** Deux examens ne peuvent pas avoir lieu le meme jour s'il existe un etudiant inscrit aux deux.

- **Sommets** = examens : {A, B, C, D, E}
- **Aretes** = conflits : deux examens sont relies s'ils partagent au moins un etudiant.

Construction des aretes :
```
E1 inscrit a A et B      =>  arete A-B
E2 inscrit a A, C, D     =>  aretes A-C, A-D, C-D
E3 inscrit a B et E      =>  arete B-E
E4 inscrit a C et E      =>  arete C-E
E5 inscrit a D et E      =>  arete D-E
E6 inscrit a A et D      =>  arete A-D (deja)
E7 inscrit a B et C      =>  arete B-C
```

**Aretes du graphe des conflits :**

```
A-B, A-C, A-D, B-C, B-E, C-D, C-E, D-E
```

**Graphe ASCII :**

```
        A
       /|\
      / | \
     B  |  D
     |\ | /|
     | \|/ |
     |  C  |
     | / \ |
     |/   \|
     E-----+
```

Plus clairement :
```
      A
     /|\ 
    B | D
    |\ /|
    | C |
    |/ \|
    +--E-+
    
Aretes : A-B, A-C, A-D, B-C, B-E, C-D, C-E, D-E
```

**Degres :**

| Sommet | Voisins | Degre |
|--------|---------|-------|
| A | B, C, D | 3 |
| B | A, C, E | 3 |
| C | A, B, D, E | 4 |
| D | A, C, E | 3 |
| E | B, C, D | 3 |

### Question 1.2 -- Le nombre chromatique

**Observation :** C est adjacent a tous les autres sommets sauf... A et B ne sont pas adjacents a E directement ? Verifions : B-E existe. A-E n'existe pas !

Correction des aretes :
```
A-B (E1), A-C (E2), A-D (E2,E6), B-C (E7), B-E (E3), C-D (E2), C-E (E4), D-E (E5)
```

A n'est PAS adjacent a E. Degre de A = 3 (B, C, D). Degre de E = 3 (B, C, D).

A et E ne sont pas adjacents => ils peuvent etre le meme jour.

**Borne inferieure :** La clique maximale. Cherchons des cliques :
- {A, C, D} : A-C, A-D, C-D. Clique de taille 3.
- {B, C, E} : B-C, B-E, C-E. Clique de taille 3.
- {C, D, E} : C-D, C-E, D-E. Clique de taille 3.

Peut-on trouver une clique de taille 4 ? Testons {A, B, C, D} : A-B existe, A-C existe, A-D existe, B-C existe, mais B-D ? B n'est pas adjacent a D. Donc pas une clique de 4.

**Borne inferieure : chi(G) >= 3.**

**Coloration gloutonne :**

Ordre par degre decroissant : C(4), A(3), B(3), D(3), E(3).

```
Etape 1 : C reçoit couleur 1 (jour 1).

Etape 2 : A adjacent a C(1). A reçoit couleur 2 (jour 2).

Etape 3 : B adjacent a A(2), C(1). B reçoit couleur 3 (jour 3).

Etape 4 : D adjacent a A(2), C(1), E(?). D pas adjacent a B(3).
          D reçoit couleur 3 (jour 3). Mais D-E sera un probleme ?
          D pas adjacent a B : OK pour couleur 3.
          
Etape 5 : E adjacent a B(3), C(1), D(3). E ne peut pas prendre 1, 3.
          E reçoit couleur 2 (jour 2).
```

**Resultat :**

| Jour (couleur) | Examens |
|-----------------|---------|
| Jour 1 | C |
| Jour 2 | A, E |
| Jour 3 | B, D |

**Verification des conflits :**
- Jour 2 : A et E le meme jour. A-E pas dans les aretes. OK : aucun etudiant n'a a la fois A et E.
- Jour 3 : B et D le meme jour. B-D pas dans les aretes. OK : aucun etudiant n'a a la fois B et D.

**chi(G) = 3. La session dure 3 jours au minimum.**

### Question 1.3 -- Application : quel est le nombre chromatique maximal dans un graphe ?

**Regle :** chi(G) >= omega(G) (taille de la plus grande clique).
**Regle :** chi(G) <= Delta(G) + 1 (theoreme de Brooks, avec egalite seulement pour les cliques et cycles impairs).

Ici : omega(G) = 3, Delta(G) = 4. Donc 3 <= chi(G) <= 5.
On a trouve une 3-coloration, donc chi(G) = 3. Optimal.

---

## Exercice 2 : Surveillance d'un reseau

**Enonce (TD 4) :** On veut surveiller un reseau de communication represente par un graphe G = (X, Gamma) non oriente. La communication entre x et y est possible ssi il existe une chaine entre x et y. La communication entre x et y est consideree surveillee si au moins un sommet de la chaine est surveille.

1. Quel est le rapport entre "surveillance" et la notion d'absorption ?
2. Application : trouver l'ensemble minimum de points a surveiller.

### Question 2.1 -- Lien avec l'absorption

**Definition :** Un ensemble S est un **stable** (ou ensemble independant) de G si aucune paire de sommets de S n'est adjacente.

**Definition :** Un ensemble D est un **ensemble absorbant** (ou ensemble dominant) de G si tout sommet de G est dans D ou adjacent a au moins un sommet de D.

Pour la surveillance :
- k(x) = 1 si x est surveille, 0 sinon.
- k est un ensemble absorbant : tout sommet est surveille ou adjacent a un sommet surveille.
- On cherche l'ensemble absorbant de **taille minimale** : c'est le **nombre de domination** gamma(G).

**Nombre minimal de sommets a surveiller = gamma(G).**

### Question 2.2 -- Application au graphe de l'exercice 3

**Graphe du TD (10 sommets) :**

```
         1
        / \
       2   3
      /     \
     4       5
    / \     / \
   6   7   8   9
        \ /
         10
```

Aretes lues depuis la figure du TD :
```
1-2, 1-3, 2-4, 3-5, 4-6, 4-7, 5-8, 5-9, 7-10, 8-10
et aretes supplementaires : 3-6, 6-7, 7-8
```

**Degres :**

| Sommet | Voisins | Degre |
|--------|---------|-------|
| 1 | 2, 3 | 2 |
| 2 | 1, 4 | 2 |
| 3 | 1, 5, 6 | 3 |
| 4 | 2, 6, 7 | 3 |
| 5 | 3, 8, 9 | 3 |
| 6 | 3, 4, 7 | 3 |
| 7 | 4, 6, 8, 10 | 4 |
| 8 | 5, 7, 10 | 3 |
| 9 | 5 | 1 |
| 10 | 7, 8 | 2 |

**Recherche de l'ensemble absorbant minimal :**

**Essai avec 2 sommets :** Peut-on dominer tous les sommets avec 2 points de surveillance ?

Le sommet 7 a le plus grand degre (4). Si on surveille 7 : sommets domines = {4, 6, 7, 8, 10}.
Sommets non domines = {1, 2, 3, 5, 9}.

Pour dominer {1, 2, 3, 5, 9}, on a besoin d'un sommet adjacent a tous ceux-ci. 
- 3 domine {1, 3, 5, 6} mais pas {2, 9}.
- 5 domine {3, 5, 8, 9} mais pas {1, 2}.

Avec 2 sommets, on ne peut pas tout dominer (9 n'est adjacent qu'a 5).

**Essai avec 3 sommets :**

D = {3, 7, 5} :
- 3 domine {1, 3, 5, 6}
- 7 domine {4, 6, 7, 8, 10}
- 5 domine {3, 5, 8, 9}
- Union : {1, 3, 4, 5, 6, 7, 8, 9, 10}. Manque {2} !

D = {3, 7, 2} :
- 3 domine {1, 3, 5, 6}
- 7 domine {4, 6, 7, 8, 10}
- 2 domine {1, 2, 4}
- Union : {1, 2, 3, 4, 5, 6, 7, 8, 10}. Manque {9} !

D = {5, 7, 2} :
- 5 domine {3, 5, 8, 9}
- 7 domine {4, 6, 7, 8, 10}
- 2 domine {1, 2, 4}
- Union : {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}. Tous domines !

**Ensemble absorbant minimal : D = {2, 5, 7}, taille = 3.**

Verification que 2 sommets ne suffisent pas : 9 n'est adjacent qu'a 5, donc 5 doit etre dans D ou 9 doit l'etre. 1 n'est adjacent qu'a {2, 3}. Avec seulement 2 sommets, couvrir {1, 9} requiert un sommet dans N[1] = {1,2,3} et un dans N[9] = {5,9}. Mais les 2 sommets doivent aussi couvrir les 8 autres. Impossible avec 2.

**gamma(G) = 3. Il faut surveiller au minimum 3 points : par exemple {2, 5, 7}.**

---

## Exercice 3 : Coloration d'un graphe specifique

**Enonce (TD 4, Application) :** Colorier le graphe suivant avec un nombre minimum de couleurs.

**Graphe du TD :**

```
     1 ---- 2
     |      |
     4 ---- 3
      \    /
       \  /
     5 --+-- 6
     |       |
     7 ---- 8
      \    /
       \  /
     9 -+- 10
```

Aretes :
```
1-2, 2-3, 3-4, 4-1, 3-5, 3-6, 5-6, 5-7, 6-8, 7-8, 7-9, 8-10, 9-10
```

**Degres :**

| Sommet | Degre |
|--------|-------|
| 1 | 2 |
| 2 | 2 |
| 3 | 4 |
| 4 | 2 |
| 5 | 3 |
| 6 | 3 |
| 7 | 3 |
| 8 | 3 |
| 9 | 2 |
| 10 | 2 |

### Algorithme DSatur

**Principe :** A chaque etape, colorier le sommet de plus haut degre de saturation (nombre de couleurs differentes parmi ses voisins deja colories). En cas d'egalite, prendre le sommet de plus haut degre.

```
Etape 1 : Aucun sommet colorie. Choisir le sommet de plus haut degre : 3 (degre 4).
          Colorer 3 avec couleur 1.
          Saturation : 1->0, 2->1, 3->-, 4->1, 5->1, 6->1, 7->0, 8->0, 9->0, 10->0

Etape 2 : Plus haute saturation = 1 pour {2, 4, 5, 6}. Plus haut degre parmi eux : 5 ou 6 (degre 3).
          Choisir 5. Voisins colories : 3(1). Couleur 1 interdite. Colorer 5 avec couleur 2.
          Saturation : 6->2, 7->1

Etape 3 : Plus haute saturation = 2 pour {6}. 
          Voisins colories : 3(1), 5(2). Couleurs 1,2 interdites. Colorer 6 avec couleur 3.
          Saturation : 8->1

Etape 4 : Plus haute saturation = 1 pour {2, 4, 7, 8}. Plus haut degre : 7 ou 8 (degre 3).
          Choisir 7. Voisins colories : 5(2). Couleur 2 interdite. Colorer 7 avec couleur 1.
          Saturation : 9->1

Etape 5 : Plus haute saturation = 1 pour {2, 4, 8, 9}. Plus haut degre : 8 (degre 3).
          Voisins colories : 6(3), 7(1). Couleurs 1,3 interdites. Colorer 8 avec couleur 2.
          Saturation : 10->1

Etape 6 : Plus haute saturation = 1 pour {2, 4, 9, 10}. Degre egal (2). Choisir 2.
          Voisins colories : 3(1). Couleur 1 interdite. Colorer 2 avec couleur 2.

Etape 7 : Choisir 4. Voisins colories : 1(?), 3(1). Couleur 1 interdite.
          1 pas encore colorie. Colorer 4 avec couleur 2.

Etape 8 : Choisir 9. Voisins colories : 7(1), 10(?). Couleur 1 interdite. 
          Colorer 9 avec couleur 2.

Etape 9 : Choisir 10. Voisins colories : 8(2), 9(2). Couleur 2 interdite.
          Colorer 10 avec couleur 1.

Etape 10 : Choisir 1. Voisins colories : 2(2), 4(2). Couleur 2 interdite.
           Colorer 1 avec couleur 1.
```

**Resultat de la coloration DSatur :**

| Sommet | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|--------|---|---|---|---|---|---|---|---|---|----|
| Couleur | 1 | 2 | 1 | 2 | 2 | 3 | 1 | 2 | 2 | 1  |

**3 couleurs utilisees.**

**Verification :** Pour chaque arete, les deux extremites ont des couleurs differentes :
```
1-2 : 1 vs 2. OK.    2-3 : 2 vs 1. OK.    3-4 : 1 vs 2. OK.
4-1 : 2 vs 1. OK.    3-5 : 1 vs 2. OK.    3-6 : 1 vs 3. OK.
5-6 : 2 vs 3. OK.    5-7 : 2 vs 1. OK.    6-8 : 3 vs 2. OK.
7-8 : 1 vs 2. OK.    7-9 : 1 vs 2. OK.    8-10: 2 vs 1. OK.
9-10: 2 vs 1. OK.
```

**Le graphe est ici 3-coloriable. chi(G) = 3** (car il contient un cycle impair de longueur 3 : {3, 5, 6} avec aretes 3-5, 5-6, 3-6, donc chi >= 3).

---

## Resume des concepts

| Concept | Definition | Nombre |
|---------|-----------|--------|
| Stable (independant) | Ensemble sans aretes internes | alpha(G) = taille max |
| Absorbant (dominant) | Chaque sommet est dans D ou adjacent a D | gamma(G) = taille min |
| Coloration | Couleurs aux sommets, voisins de couleurs differentes | chi(G) = nb min de couleurs |
| Clique | Sous-graphe complet | omega(G) = taille max |

**Relations fondamentales :**
- omega(G) <= chi(G) <= Delta(G) + 1
- alpha(G) + gamma(G) <= n (pas toujours egalite)
- alpha(G) * chi(G) >= n (chaque classe de couleur est un stable)
