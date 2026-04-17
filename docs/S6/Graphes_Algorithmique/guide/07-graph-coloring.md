---
title: "Chapitre 07 -- Coloration de graphes"
sidebar_position: 7
---

# Chapitre 07 -- Coloration de graphes

> **Idee centrale :** Attribuer une couleur a chaque sommet de sorte que deux sommets adjacents aient des couleurs differentes, en minimisant le nombre de couleurs (nombre chromatique).

---

## 1. Definitions

### Coloration propre

Fonction c : S -> {1, 2, ..., k} telle que pour toute arete {u,v} : c(u) != c(v).

### Nombre chromatique chi(G)

Plus petit k tel que G admet une k-coloration.

### Exemples immediats

```
Triangle K_3 :              Carre C_4 :
    A(1)                      A(1) --- B(2)
   / \                        |         |
  B(2)-C(3)                   D(2) --- C(1)

chi(K_3) = 3                 chi(C_4) = 2
```

---

## 2. Bornes du nombre chromatique

### Borne inferieure : clique

```
omega(G) <= chi(G)
```

omega(G) = taille de la plus grande clique. Chaque sommet de la clique necessite une couleur distincte.

### Borne superieure : degre maximum

```
chi(G) <= Delta(G) + 1
```

Delta(G) = degre maximal. L'algorithme glouton ne depasse jamais Delta+1 couleurs.

### Valeurs classiques

| Graphe | chi(G) |
|--------|--------|
| Sommets isoles | 1 |
| Arbre (n >= 2) | 2 |
| Graphe biparti | 2 |
| Cycle pair C_{2k} | 2 |
| Cycle impair C_{2k+1} | 3 |
| Graphe complet K_n | n |
| Graphe planaire | <= 4 |

---

## 3. Theoremes fondamentaux

### Theoreme de Brooks (1941)

Pour tout graphe connexe G qui n'est ni K_n ni un cycle impair :

```
chi(G) <= Delta(G)
```

Exceptions (ou chi = Delta + 1) : graphes complets K_n et cycles impairs.

### Theoreme des 4 couleurs (1976)

Tout graphe planaire est 4-colorable : chi(G) <= 4.

Premier theoreme majeur prouve par ordinateur (Appel & Haken, 1976).

### Biparti et coloration

Un graphe (avec au moins une arete) est 2-colorable ssi il est biparti ssi il n'a pas de cycle impair.

### Polynome chromatique P(G, k)

Nombre de k-colorations propres du graphe G.

- P(K_n, k) = k(k-1)(k-2)...(k-n+1)
- P(arbre a n sommets, k) = k * (k-1)^(n-1)
- chi(G) = plus petit k tel que P(G,k) > 0

---

## 4. Algorithme glouton de coloration

### Pseudo-code

```
ColorationGlouton(G, ordre):
    Pour chaque sommet v dans l'ordre:
        Couleurs_interdites = {c(w) : w voisin de v et w deja colore}
        c(v) = plus petit entier >= 1 pas dans Couleurs_interdites

    Retourner c
```

### Exemple pas a pas

```
Graphe :
    A --- B
    |   / |
    |  /  |
    C --- D

Aretes : A-B, A-C, B-C, B-D, C-D

Ordre : A, B, C, D

Etape | Sommet | Voisins colores | Interdites | Couleur
------|--------|-----------------|------------|--------
  1   |   A    | aucun           | {}         |   1
  2   |   B    | A(1)            | {1}        |   2
  3   |   C    | A(1), B(2)      | {1, 2}     |   3
  4   |   D    | B(2), C(3)      | {2, 3}     |   1

Resultat : 3 couleurs. Optimal ? A-B-C est un triangle => chi >= 3. Oui !

Coloration :
    A(1) --- B(2)
    |      / |
    |     /  |
    C(3)--- D(1)
```

### L'ordre compte !

L'algorithme glouton ne donne pas toujours chi(G). Le resultat depend de l'ordre des sommets.

**Bons ordres heuristiques :**
- Plus grand degre d'abord
- DSatur : choisir le sommet de plus grande saturation

---

## 5. Algorithme DSatur

### Principe

A chaque etape, choisir le sommet non colore ayant le plus de couleurs differentes parmi ses voisins (saturation maximale). En cas d'egalite, prendre celui de plus grand degre.

### Pseudo-code

```
DSatur(G):
    Pour chaque sommet v:
        saturation(v) = 0
        c(v) = indefini

    Repeter n fois:
        v = sommet non colore avec saturation max
            (egalite : plus grand degre)
        c(v) = plus petite couleur non utilisee par voisins de v
        Mettre a jour saturation des voisins non colores de v

    Retourner c
```

### Exemple

```
Meme graphe : A-B, A-C, B-C, B-D, C-D
Degres : d(A)=2, d(B)=3, d(C)=3, d(D)=2

Etape 1 : Tous sat=0. Plus grand degre : B ou C. Choisissons B.
  c(B) = 1. Sat de A, C, D augmente.

Etape 2 : sat(A)=1, sat(C)=1, sat(D)=1. Egalite : C (degre 3).
  Voisins colores de C : B(1). Interdites : {1}. c(C) = 2.

Etape 3 : sat(A)=2 (voisins B(1),C(2)), sat(D)=2 (voisins B(1),C(2)).
  Egalite : choisissons A (ou D). A : interdites {1,2}. c(A) = 3.

Etape 4 : D. Interdites {1,2}. c(D) = 3.

Resultat : 3 couleurs. Meme resultat optimal.
```

DSatur est exact pour les graphes bipartis et donne de bons resultats en general.

---

## 6. Coloration d'aretes

Colorier les aretes : deux aretes partageant un sommet ont des couleurs differentes.

**Indice chromatique** chi'(G) = minimum de couleurs pour les aretes.

### Theoreme de Vizing (1964)

```
Delta(G) <= chi'(G) <= Delta(G) + 1
```

- Classe 1 : chi'(G) = Delta
- Classe 2 : chi'(G) = Delta + 1

---

## 7. Applications

| Application | Sommets | Aretes | Couleurs |
|-------------|---------|--------|----------|
| Emplois du temps | Examens | Conflits (meme etudiant) | Creneaux |
| Allocation de registres | Variables | Utilisees en meme temps | Registres CPU |
| Frequences radio | Antennes | Trop proches | Frequences |

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  COLORATION DE GRAPHES -- RESUME                                 |
+------------------------------------------------------------------+
|                                                                  |
|  BORNES :                                                        |
|    omega(G) <= chi(G) <= Delta(G) + 1                            |
|                                                                  |
|  THEOREMES :                                                     |
|    Brooks : chi <= Delta, SAUF K_n et cycles impairs             |
|    4 couleurs : tout planaire est 4-colorable                    |
|    Biparti = 2-colorable = pas de cycle impair                   |
|    Vizing (aretes) : Delta <= chi' <= Delta + 1                  |
|                                                                  |
|  VALEURS CLASSIQUES :                                            |
|    Arbre : 2     Cycle pair : 2     Cycle impair : 3             |
|    K_n : n       Biparti : 2        Planaire : <= 4              |
|                                                                  |
|  ALGORITHME GLOUTON :                                            |
|    Parcourir sommets, attribuer plus petite couleur libre        |
|    Resultat depend de l'ordre ! Pas toujours optimal             |
|    DSatur : choisir sommet de plus grande saturation             |
|                                                                  |
|  POLYNOME CHROMATIQUE :                                          |
|    P(K_n, k) = k(k-1)...(k-n+1)                                 |
|    P(arbre n sommets, k) = k(k-1)^(n-1)                         |
|                                                                  |
|  PIEGES :                                                        |
|    - chi >= omega, mais chi peut etre >> omega                   |
|    - Brooks : ne pas appliquer a K_n ou cycles impairs           |
|    - Glouton ne donne pas toujours chi                           |
|    - 4 couleurs : SEULEMENT pour les planaires                   |
|    - Coloration de sommets != coloration d'aretes                |
+------------------------------------------------------------------+
```
