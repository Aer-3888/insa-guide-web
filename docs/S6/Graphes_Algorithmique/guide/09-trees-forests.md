---
title: "Chapitre 09 -- Arbres et forets"
sidebar_position: 9
---

# Chapitre 09 -- Arbres et forets

> **Idee centrale :** Un arbre est un graphe connexe sans cycle, la structure la plus econome pour relier n sommets (exactement n-1 aretes). Les forets sont des unions d'arbres. Le tri topologique ordonne les sommets d'un DAG.

---

## 1. Definitions

### Arbre

Un **arbre** est un graphe connexe et acyclique.

### Foret

Une **foret** est un graphe acyclique (pas forcement connexe). C'est une union d'arbres.

```
Arbre :              Foret :
    A                  A       D --- E
   / \                 |
  B   C                B --- C     F
 / \
D   E

5 sommets, 4 aretes    6 sommets, 3 composantes, 3 aretes
```

---

## 2. Les 6 equivalences fondamentales

Pour un graphe G a n sommets, les propositions suivantes sont equivalentes :

```
1. G est connexe ET acyclique (definition d'arbre)
2. G est connexe ET a exactement n-1 aretes
3. G est acyclique ET a exactement n-1 aretes
4. Entre tout couple de sommets, il existe EXACTEMENT UN chemin
5. G est connexe ET supprimer n'importe quelle arete le deconnecte
6. G est acyclique ET ajouter n'importe quelle arete cree exactement un cycle
```

**Retenir :** 2 proprietes parmi {connexe, acyclique, n-1 aretes} suffisent pour prouver qu'un graphe est un arbre.

### Pourquoi n-1 aretes ?

- Moins de n-1 aretes : pas connexe
- Plus de n-1 aretes : forcement un cycle
- Exactement n-1 aretes : le juste milieu

---

## 3. Proprietes des arbres

### Feuilles

Une **feuille** est un sommet de degre 1.

**Propriete :** Tout arbre a au moins 2 sommets possede au moins 2 feuilles.

**Preuve :** Prendre le plus long chemin dans l'arbre. Ses deux extremites sont des feuilles (sinon on pourrait prolonger le chemin, contradiction).

### Degres dans un arbre

Par le theoreme des poignees de main : Somme d(v) = 2(n-1) = 2n-2.

Donc la moyenne des degres est (2n-2)/n < 2. Il y a forcement des sommets de degre 1.

### Suppression de feuille

Supprimer une feuille d'un arbre a n sommets donne un arbre a n-1 sommets. C'est la base des preuves par recurrence sur les arbres.

---

## 4. Arbres enracines

### Definition

Un **arbre enracine** est un arbre ou l'on designe un sommet comme **racine**.

### Vocabulaire

| Terme | Definition |
|-------|-----------|
| Racine | Sommet designe, profondeur 0 |
| Parent de v | Voisin de v sur le chemin vers la racine |
| Enfants de v | Voisins de v plus profonds que v |
| Feuilles | Sommets sans enfants |
| Profondeur de v | Distance (en aretes) de v a la racine |
| Hauteur de l'arbre | Profondeur maximale |
| Sous-arbre de v | Arbre enracine en v contenant v et ses descendants |

```
Arbre enracine en R :
        R (profondeur 0)
       / \
      A   B (profondeur 1)
     / \   \
    C   D   E (profondeur 2)
    |
    F (profondeur 3)

Hauteur = 3
Feuilles : D, E, F
Parent de C : A
Enfants de A : C, D
```

### Arbre binaire

Chaque sommet a au plus 2 enfants (gauche et droite).

**Proprietes de l'arbre binaire complet de hauteur h :**
- Nombre de sommets : 2^(h+1) - 1
- Nombre de feuilles : 2^h

---

## 5. Arbre couvrant (Spanning Tree)

### Definition

Un **arbre couvrant** de G est un sous-graphe qui contient TOUS les sommets de G et qui est un arbre.

### Existence

Tout graphe connexe possede au moins un arbre couvrant (preuve : supprimer des aretes de cycles jusqu'a ce qu'il n'y en ait plus).

### Nombre d'aretes

Un arbre couvrant d'un graphe a n sommets a exactement n-1 aretes.

### Construction par parcours

- **Arbre BFS** : arbre couvrant obtenu par parcours en largeur
- **Arbre DFS** : arbre couvrant obtenu par parcours en profondeur

```
Graphe original :         Arbre BFS (depuis A) :    Arbre DFS (depuis A) :
    A --- B                   A                         A
    |   / |                  / \                        |
    |  /  |                 B   C                       B
    C --- D                 |                          /
                            D                         C
                                                      |
                                                      D
```

---

## 6. Forets

### Proprietes

- Une foret a n sommets et p composantes : exactement n - p aretes
- Chaque composante est un arbre
- Toute foret est bipartie (pas de cycle impair, et meme aucun cycle)

### Exemple

```
Foret avec n=8, p=3 :
    A --- B --- C       D --- E       F       G --- H

Aretes : 2 + 1 + 0 + 1 = 4
Verification : n - p = 8 - 3 = 5... Hmm.

Recalculons : composante 1 = {A,B,C} (2 aretes),
composante 2 = {D,E} (1 arete), composante 3 = {F} (0 arete),
composante 4 = {G,H} (1 arete).
p = 4 composantes. Aretes = 2+1+0+1 = 4 = n - p = 8 - 4. Correct !
```

---

## 7. Tri topologique (DAG)

### Contexte

Un DAG (Directed Acyclic Graph) est un graphe oriente sans circuit. Il modelise des dependances : "la tache A doit etre faite avant B".

### Definition

Un tri topologique ordonne tous les sommets de sorte que pour chaque arc (u,v), u apparait avant v.

### Algorithme 1 : DFS post-order inverse

```
TriTopologique_DFS(G):
    L = liste vide
    Pour chaque sommet v : v.etat = NON_VISITE

    Pour chaque sommet v:
        Si v.etat == NON_VISITE:
            DFS_Topo(v, L)

    Retourner L (inverse)

DFS_Topo(v, L):
    v.etat = EN_COURS
    Pour chaque successeur w de v:
        Si w.etat == NON_VISITE:
            DFS_Topo(w, L)
        Si w.etat == EN_COURS:
            ERREUR : "Cycle !"
    v.etat = TERMINE
    Ajouter v au debut de L
```

### Algorithme 2 : Kahn (degres entrants)

```
Kahn(G):
    Calculer degre entrant de chaque sommet
    F = file des sommets de degre entrant 0
    L = liste vide

    Tant que F non vide:
        v = Defiler F
        Ajouter v a L
        Pour chaque successeur w de v:
            degre_entrant(w) -= 1
            Si degre_entrant(w) == 0:
                Enfiler w

    Si |L| < n : ERREUR "Cycle !"
    Retourner L
```

### Exemple

```
DAG :
    A --> C
    A --> D
    B --> D
    C --> E
    D --> E

Degres entrants : A:0, B:0, C:1, D:2, E:2

Kahn :
  File initiale : [A, B]
  Defiler A : L=[A]. Reduire C(0), D(1). Enfiler C.
  Defiler B : L=[A,B]. Reduire D(0). Enfiler D.
  Defiler C : L=[A,B,C]. Reduire E(1).
  Defiler D : L=[A,B,C,D]. Reduire E(0). Enfiler E.
  Defiler E : L=[A,B,C,D,E].

Tri topologique : A, B, C, D, E
Verification : tout arc va de gauche a droite. Correct !

Note : A, B, D, C, E serait aussi un tri topologique valide.
Le tri topologique n'est PAS unique en general.
```

### Complexite : O(n + m) pour les deux algorithmes

---

## 8. Ordonnancement (apercu)

Le tri topologique est a la base de l'ordonnancement (methode MPM) :

- Sommets = taches avec durees
- Arcs = contraintes de precedence
- Dates au plus tot (ES) : propagation avant, MAX des predecesseurs
- Dates au plus tard (LS) : propagation arriere, MIN des successeurs
- Marge totale MT = LS - ES
- Chemin critique : taches avec MT = 0

Voir le chapitre dédié dans les exercices pour des exemples complets.

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  ARBRES & FORETS -- RESUME                                      |
+------------------------------------------------------------------+
|                                                                  |
|  ARBRE = connexe + acyclique = connexe + n-1 aretes             |
|        = acyclique + n-1 aretes = chemin unique entre tout couple|
|                                                                  |
|  PROPRIETES :                                                    |
|    - n sommets, n-1 aretes                                       |
|    - Au moins 2 feuilles (n >= 2)                                |
|    - Supprimer une arete deconnecte                              |
|    - Ajouter une arete cree un cycle unique                      |
|                                                                  |
|  FORET :                                                         |
|    - Graphe acyclique = union d'arbres                           |
|    - n sommets, p composantes => n-p aretes                      |
|    - Toujours bipartie                                           |
|                                                                  |
|  ARBRE COUVRANT :                                                |
|    - Sous-graphe arbre contenant TOUS les sommets                |
|    - Existe pour tout graphe connexe                             |
|    - n-1 aretes                                                  |
|                                                                  |
|  TRI TOPOLOGIQUE (DAG) :                                         |
|    - DFS post-order inverse OU Kahn (degres entrants)            |
|    - O(n+m)                                                      |
|    - Existe ssi graphe est un DAG                                |
|    - Pas unique en general                                       |
|                                                                  |
|  ORDONNANCEMENT :                                                |
|    ES = MAX predecesseurs (propagation avant)                    |
|    LS = MIN successeurs (propagation arriere)                    |
|    MT = LS - ES. Critique si MT = 0.                             |
|    Chemin critique = plus long chemin dans le DAG                |
|                                                                  |
|  PIEGES :                                                        |
|    - Arbre = n-1 aretes (verifier systematiquement)              |
|    - Arbre couvrant : TOUS les sommets inclus                    |
|    - Tri topologique : seulement pour les DAG                    |
|    - Ordonnancement : ES = MAX (pas somme), LS = MIN             |
+------------------------------------------------------------------+
```
