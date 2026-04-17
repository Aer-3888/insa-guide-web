---
title: "Chapitre 04 -- Arbres couvrants minimaux"
sidebar_position: 4
---

# Chapitre 04 -- Arbres couvrants minimaux

> **Idee centrale :** Relier tous les sommets d'un graphe pondere avec le cout total minimal, sans creer de cycle. Kruskal trie les aretes globalement, Prim fait grossir l'arbre localement.

---

## 1. Definitions

### Arbre couvrant

Sous-graphe T = (S, A') de G = (S, A) qui contient tous les sommets, est connexe et acyclique. Il a exactement n-1 aretes.

### Arbre couvrant minimal (ACM / MST)

L'arbre couvrant dont la somme des poids des aretes est minimale.

- Existe pour tout graphe connexe pondere.
- Unique si tous les poids sont distincts.

---

## 2. Proprietes fondamentales

### Propriete de coupe (Cut Property)

Pour toute coupe du graphe, l'arete de poids minimal traversant cette coupe appartient a un ACM.

```
Coupe entre {A,B} et {C,D,E} :

    A ---3--- C
    |         |
    B ---1--- D ---5--- E
    |         |
    +---4-----+

L'arete B-D (poids 1) est la plus legere traversant la coupe
=> B-D est dans l'ACM
```

### Propriete de cycle (Cycle Property)

Pour tout cycle, l'arete de poids strictement maximal dans ce cycle n'appartient a aucun ACM.

---

## 3. Algorithme de Kruskal

### Principe

Trier toutes les aretes par poids croissant. Les ajouter une par une en sautant celles qui creeraient un cycle.

### Pseudo-code

```
Kruskal(G):
    Trier les aretes par poids croissant
    T = ensemble vide (aretes de l'ACM)

    Pour chaque arete {u, v} (ordre croissant de poids):
        Si u et v ne sont pas dans la meme composante (Union-Find):
            Ajouter {u, v} a T
            Union(u, v)

    Retourner T
```

### Structure Union-Find

- Find(x) : retourne le representant de la composante de x
- Union(x, y) : fusionne les composantes de x et y
- Avec compression de chemin + union par rang : quasi O(1) par operation

### Exemple pas a pas

```
Graphe :
    A ---4--- B
    |       / |
    2     1   5
    |   /     |
    C ---3--- D ---2--- E
    |                   |
    +--------6----------+

Aretes triees : B-C(1), A-C(2), D-E(2), C-D(3), A-B(4), B-D(5), C-E(6)

Etape | Arete | Poids | Action                  | Composantes
------|-------|-------|-------------------------|---------------------------
  1   | B-C   |   1   | Ajouter (B,C separes)   | {A}, {B,C}, {D}, {E}
  2   | A-C   |   2   | Ajouter (A,{B,C} sep.)  | {A,B,C}, {D}, {E}
  3   | D-E   |   2   | Ajouter (D,E separes)   | {A,B,C}, {D,E}
  4   | C-D   |   3   | Ajouter (ABC,DE sep.)   | {A,B,C,D,E}
  5   | A-B   |   4   | REFUSER (meme comp.)    |
  6   | B-D   |   5   | REFUSER (meme comp.)    |
  7   | C-E   |   6   | REFUSER (meme comp.)    |

ACM : {B-C, A-C, D-E, C-D}
Poids total : 1 + 2 + 2 + 3 = 8
Verification : 4 aretes = n-1 = 5-1 = 4  (correct)

ACM :
    A ---2--- C ---1--- B
              |
              3
              |
              D ---2--- E
```

### Complexite : O(m log m) = O(m log n)

---

## 4. Algorithme de Prim

### Principe

Partir d'un sommet et faire grossir l'arbre. A chaque etape, ajouter l'arete la plus legere reliant l'arbre a un nouveau sommet.

### Pseudo-code

```
Prim(G, s):
    T = {s}
    Aretes_ACM = vide

    Tant que |T| < n:
        Trouver l'arete {u, v} de poids minimal
            avec u dans T et v hors de T
        Ajouter v a T
        Ajouter {u, v} a Aretes_ACM

    Retourner Aretes_ACM
```

### Exemple pas a pas (meme graphe, depart A)

```
Etape | T (dans l'arbre) | Aretes candidates           | Choisie | Poids
------|------------------|-----------------------------|---------|------
  0   | {A}              | A-B(4), A-C(2)              | A-C     |  2
  1   | {A,C}            | A-B(4), C-B(1), C-D(3),    | C-B     |  1
      |                  | C-E(6)                      |         |
  2   | {A,C,B}          | B-D(5), C-D(3), C-E(6)     | C-D     |  3
  3   | {A,C,B,D}        | D-E(2), C-E(6)              | D-E     |  2
  4   | {A,C,B,D,E}      | Termine                      |  --     |  --

ACM : {A-C, C-B, C-D, D-E}
Poids total : 2 + 1 + 3 + 2 = 8  (meme resultat que Kruskal)
```

### Complexite

| Implementation | Complexite |
|----------------|-----------|
| Recherche lineaire | O(n^2) |
| Tas binaire | O(m log n) |
| Tas de Fibonacci | O(m + n log n) |

---

## 5. Comparaison Kruskal vs Prim

| Critere | Kruskal | Prim |
|---------|---------|------|
| Approche | Globale (toutes les aretes) | Locale (depuis un sommet) |
| Structure cle | Union-Find | File de priorite |
| Complexite | O(m log m) | O(m log n) avec tas |
| Meilleur pour | Graphes creux (m petit) | Graphes denses (m grand) |
| En DS | Tres pratique (tri + parcours) | Demande quand depart fixe |

---

## 6. Correction des algorithmes

**Kruskal :** A chaque ajout, l'arete relie deux composantes differentes. C'est l'arete la plus legere traversant la coupe entre ces composantes. Par la propriete de coupe, elle est dans un ACM.

**Prim :** A chaque etape, l'arete ajoutee est la plus legere traversant la coupe entre T et S\T. Par la propriete de coupe, elle est dans un ACM.

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  ARBRES COUVRANTS MINIMAUX -- RESUME                             |
+------------------------------------------------------------------+
|                                                                  |
|  ACM = arbre couvrant de poids minimal                           |
|    - n-1 aretes, connexe, acyclique                              |
|    - Unique si poids tous distincts                              |
|                                                                  |
|  PROPRIETE DE COUPE :                                            |
|    Arete la plus legere d'une coupe => dans un ACM               |
|                                                                  |
|  PROPRIETE DE CYCLE :                                            |
|    Arete la plus lourde d'un cycle => PAS dans un ACM            |
|                                                                  |
|  KRUSKAL :                                                       |
|    1. Trier aretes par poids croissant                           |
|    2. Ajouter si pas de cycle (Union-Find)                       |
|    3. Arreter quand n-1 aretes                                   |
|    O(m log m). Graphes creux.                                    |
|                                                                  |
|  PRIM :                                                          |
|    1. Partir d'un sommet                                         |
|    2. Ajouter l'arete la plus legere vers un nouveau sommet      |
|    3. Arreter quand tous les sommets inclus                      |
|    O(m log n) avec tas. Graphes denses.                          |
|                                                                  |
|  VERIFICATION :                                                  |
|    - Exactement n-1 aretes dans l'ACM                            |
|    - Tous les sommets inclus                                     |
|    - Pas de cycle                                                |
|                                                                  |
|  PIEGES :                                                        |
|    - Oublier de verifier l'absence de cycle (Kruskal)            |
|    - Ajouter une arete entre deux sommets deja dans T (Prim)     |
|    - Confondre ACM et plus court chemin                          |
|    - Croire que l'ACM est toujours unique                        |
+------------------------------------------------------------------+
```
