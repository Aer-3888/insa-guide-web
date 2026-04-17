---
title: "Chapitre 02 -- Parcours de graphes"
sidebar_position: 2
---

# Chapitre 02 -- Parcours de graphes

> **Idee centrale :** BFS explore couche par couche (file), DFS explore en profondeur (pile/recursion). Les deux servent a decouvrir la structure d'un graphe : composantes connexes, distances, cycles, forte connexite.

---

## 1. Parcours en largeur (BFS -- Breadth-First Search)

### Principe

Explorer le graphe couche par couche depuis un sommet source. On visite d'abord tous les voisins directs, puis les voisins des voisins, etc.

**Structure de donnees :** File (FIFO -- First In, First Out).

### Pseudo-code

```
BFS(G, s):
    Creer une file F
    Marquer s comme visite, dist(s) = 0
    Enfiler s dans F

    Tant que F n'est pas vide:
        v = Defiler F
        Pour chaque voisin w de v:
            Si w n'est pas visite:
                Marquer w comme visite
                dist(w) = dist(v) + 1
                pred(w) = v
                Enfiler w dans F
```

### Exemple pas a pas

```
Graphe :
    A --- B --- E
    |     |
    C --- D --- F

BFS depuis A :

Etape  | File           | Visite         | dist
-------|----------------|----------------|-----
Init   | [A]            | {A}            | A:0
1      | [B, C]         | {A,B,C}        | B:1, C:1
2      | [C, E, D]      | {A,B,C,E,D}    | E:2, D:2
3      | [E, D]         | (C deja traite) |
4      | [D]            | (E n'a plus de non-visites) |
5      | [F]            | {A,B,C,E,D,F}  | F:3
6      | []             | Termine         |

Ordre de visite : A, B, C, E, D, F
Arbre BFS :
    A
   / \
  B   C
 / \
E   D
    |
    F
```

### Proprietes cles

- Complexite : O(n + m) avec listes d'adjacence
- Donne les distances (en nombre d'aretes) depuis la source
- L'arbre BFS contient les plus courts chemins (non ponderes)
- Peut detecter si le graphe est biparti (2-coloration couche par couche)

---

## 2. Parcours en profondeur (DFS -- Depth-First Search)

### Principe

Explorer le graphe en allant le plus loin possible dans une direction, puis revenir en arriere (backtrack) quand on est bloque.

**Structure de donnees :** Pile (LIFO) ou recursion.

### Pseudo-code (recursif)

```
DFS(G, s):
    Marquer s comme visite
    debut(s) = temps++
    Pour chaque voisin w de s:
        Si w n'est pas visite:
            pred(w) = s
            DFS(G, w)
    fin(s) = temps++
```

### Exemple pas a pas

```
Graphe :
    A --- B --- E
    |     |
    C --- D --- F

DFS depuis A (voisins traites par ordre alphabetique) :

Appel           | Pile implicite  | Visite
----------------|-----------------|--------
DFS(A)          | [A]             | {A}
  DFS(B)        | [A, B]          | {A, B}
    DFS(D)      | [A, B, D]       | {A, B, D}
      DFS(C)    | [A, B, D, C]    | {A, B, D, C}
      retour C  | [A, B, D]       |
      DFS(F)    | [A, B, D, F]    | {A, B, D, C, F}
      retour F  | [A, B, D]       |
    retour D    | [A, B]          |
    DFS(E)      | [A, B, E]       | {A, B, D, C, F, E}
    retour E    | [A, B]          |
  retour B      | [A]             |
retour A        | []              | Termine

Ordre de visite : A, B, D, C, F, E
Arbre DFS :
    A
    |
    B
   / \
  D   E
 / \
C   F
```

### Proprietes cles

- Complexite : O(n + m) avec listes d'adjacence
- Detecte les cycles
- Calcule les composantes connexes
- Permet le tri topologique (graphes orientes acycliques)
- Les timestamps debut/fin permettent de classifier les aretes

---

## 3. Comparaison BFS vs DFS

| Critere | BFS | DFS |
|---------|-----|-----|
| Structure | File (FIFO) | Pile/Recursion (LIFO) |
| Exploration | Couche par couche | En profondeur |
| Distance | Plus court chemin (non pondere) | Non |
| Detection de cycles | Possible | Oui (plus naturel) |
| Tri topologique | Non (sauf Kahn) | Oui |
| Composantes connexes | Oui | Oui |
| Espace memoire | O(n) pire cas | O(n) pire cas |

---

## 4. Composantes connexes (graphe non oriente)

### Algorithme

```
CompConnexes(G):
    Marquer tous les sommets comme non visites
    num_composante = 0

    Pour chaque sommet v de G:
        Si v n'est pas visite:
            num_composante = num_composante + 1
            BFS(G, v)   -- ou DFS(G, v)
            -- Tous les sommets visites forment la composante

    Retourner num_composante
```

Complexite : O(n + m)

### Exemple

```
Graphe :
    A --- B       D --- E       F

    C

Composante 1 : {A, B}
Composante 2 : {D, E}
Composante 3 : {C}
Composante 4 : {F}
```

### Proprietes

- Graphe connexe = exactement 1 composante
- n sommets, p composantes => au moins n - p aretes
- Ajouter une arete entre deux composantes reduit le nombre de composantes de 1

---

## 5. Forte connexite (graphe oriente)

### Composantes fortement connexes (CFC)

Un graphe oriente est fortement connexe si pour tout couple (u,v), il existe un chemin de u a v ET un chemin de v a u.

Une CFC est un sous-ensemble maximal de sommets mutuellement accessibles dans les deux sens.

```
    A --> B --> C --> A       (CFC : {A, B, C})
                |
                v
          D <-> E             (CFC : {D, E})

Le graphe quotient des CFC est un DAG :
    {A,B,C} --> {D,E}
```

### Algorithme de Tarjan (O(n + m))

```
Tarjan(G):
    index_courant = 0
    Pile P = vide

    Pour chaque sommet v non visite:
        Tarjan_DFS(v)

Tarjan_DFS(v):
    v.index = index_courant
    v.lowlink = index_courant
    index_courant++
    Empiler v dans P
    v.sur_pile = true

    Pour chaque successeur w de v:
        Si w n'a pas d'index:
            Tarjan_DFS(w)
            v.lowlink = min(v.lowlink, w.lowlink)
        Sinon si w.sur_pile:
            v.lowlink = min(v.lowlink, w.index)

    Si v.lowlink == v.index:
        -- v est racine d'une CFC
        Repeter:
            w = Depiler P
            w.sur_pile = false
            Ajouter w a la CFC
        Tant que w != v
```

---

## 6. Points d'articulation et isthmes

### Point d'articulation

Sommet dont la suppression augmente le nombre de composantes connexes.

### Isthme (pont)

Arete dont la suppression augmente le nombre de composantes connexes.

```
    A --- B --- C --- D
          |           |
          E --- F --- G

Suppression de C deconnecte {A,B,E,F} et {D,G}
=> C est un point d'articulation
=> L'arete B-C ou C-D pourrait etre un isthme

Proprietes :
- Un isthme n'appartient a aucun cycle
- Un sommet de degre 1 n'est JAMAIS un point d'articulation
```

### Graphe 2-connexe (biconnexe)

Connexe et sans point d'articulation. Reste connexe apres suppression de n'importe quel sommet.

---

## 7. Distance, diametre, excentricite

| Concept | Definition |
|---------|-----------|
| Distance d(u,v) | Longueur de la plus courte chaine (en aretes) |
| Excentricite e(v) | max_{u} d(v, u) |
| Diametre diam(G) | max_{v} e(v) = plus grande distance |
| Rayon rad(G) | min_{v} e(v) = plus petite excentricite |
| Centre | Sommets d'excentricite = rayon |

### Exemple

```
    A --- B --- C --- D

Distances :
       A  B  C  D
  A [  0  1  2  3 ]
  B [  1  0  1  2 ]
  C [  2  1  0  1 ]
  D [  3  2  1  0 ]

e(A) = 3, e(B) = 2, e(C) = 2, e(D) = 3
Diametre = 3
Rayon = 2
Centre = {B, C}
```

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  PARCOURS DE GRAPHES -- RESUME                                   |
+------------------------------------------------------------------+
|                                                                  |
|  BFS :                                                           |
|    Structure : File (FIFO)                                       |
|    Donne : distances, plus courts chemins non ponderes           |
|    Complexite : O(n + m)                                         |
|    Test biparti : 2-colorer par couches                          |
|                                                                  |
|  DFS :                                                           |
|    Structure : Pile/Recursion (LIFO)                             |
|    Donne : cycles, composantes, tri topologique                  |
|    Complexite : O(n + m)                                         |
|    3 etats pour oriente : NON_VISITE, EN_COURS, TERMINE          |
|                                                                  |
|  COMPOSANTES :                                                   |
|    Non oriente : BFS/DFS, O(n+m)                                 |
|    Oriente : Tarjan pour CFC, O(n+m)                             |
|    Graphe quotient des CFC = DAG                                 |
|                                                                  |
|  CONNEXITE :                                                     |
|    Connexe : chaine entre tout couple                            |
|    Fortement connexe : chemin dans les DEUX sens                 |
|    Point d'articulation : suppression deconnecte                 |
|    Isthme : arete hors de tout cycle                             |
|    Menger : nb chemins disjoints = nb min sommets a couper       |
|                                                                  |
|  PIEGES :                                                        |
|    - Chaine (non oriente) vs chemin (oriente)                    |
|    - Distance = nb aretes, PAS nb sommets                        |
|    - Fortement connexe != faiblement connexe                     |
|    - Sommet degre 1 = JAMAIS point d'articulation                |
+------------------------------------------------------------------+
```
