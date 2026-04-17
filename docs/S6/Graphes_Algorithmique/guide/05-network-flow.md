---
title: "Chapitre 05 -- Flots et reseaux"
sidebar_position: 5
---

# Chapitre 05 -- Flots et reseaux

> **Idee centrale :** Un flot est une quantite qui circule dans un reseau en respectant les capacites. Ford-Fulkerson trouve le flot maximal en cherchant des chemins augmentants. Le theoreme flot max = coupe min relie le debit maximal au goulot d'etranglement.

---

## 1. Definitions

### Reseau de transport

Graphe oriente G = (S, A) avec :
- Source s (origine du flot)
- Puits t (destination du flot)
- Capacite c(u,v) >= 0 pour chaque arc

### Flot

Fonction f : A -> R+ respectant :

**Contrainte de capacite :** 0 <= f(u,v) <= c(u,v)

**Conservation (Kirchhoff) :** Pour tout v different de s et t :
```
Somme f(u,v) entrant = Somme f(v,w) sortant
```

### Valeur du flot

```
|f| = Somme f(s,v) sortant de s - Somme f(u,s) entrant dans s
```

---

## 2. Graphe residuel

Pour chaque arc (u,v) avec capacite c et flot f :

```
Arc original : u --(c=10, f=6)--> v

Graphe residuel :
  Arc avant  : u --(cr=4)--> v    (capacite restante : 10-6=4)
  Arc arriere : v --(cr=6)--> u   (flot annulable : 6)
```

Les arcs arriere permettent de "defaire" un mauvais choix de flot.

---

## 3. Chemin augmentant

Un chemin de s a t dans le graphe residuel.

Capacite residuelle du chemin = min des capacites residuelles sur le chemin (goulot d'etranglement).

Pour augmenter le flot le long du chemin :
- Arc avant (u,v) : f(u,v) += c_f(P)
- Arc arriere (v,u) : f(u,v) -= c_f(P)

---

## 4. Algorithme de Ford-Fulkerson

### Pseudo-code

```
FordFulkerson(G, s, t):
    Pour chaque arc (u,v) : f(u,v) = 0

    Tant qu'il existe un chemin augmentant P de s a t dans G_f:
        c_f(P) = min { c_f(u,v) : (u,v) dans P }

        Pour chaque arc (u,v) dans P:
            Si arc avant : f(u,v) += c_f(P)
            Si arc arriere : f(v,u) -= c_f(P)

    Retourner f
```

Avec BFS pour trouver le chemin = **Edmonds-Karp**, complexite O(n * m^2).

---

## 5. Exemple complet pas a pas

```
Reseau :
    s --10--> A --8--> C --10--> t
    |         |        ^         ^
    10        4        9         10
    |         |        |         |
    v         v        |         |
    B --------+--------+    D ---+
    |                        ^
    +----------6------------>+

Arcs : s->A(10), s->B(10), A->B(4), A->C(8), B->C(9), B->D(6), C->t(10), D->t(10)

ITERATION 1 : Chemin s -> A -> C -> t (BFS)
  Capacite residuelle : min(10, 8, 10) = 8
  Flot : f(s,A)=8, f(A,C)=8, f(C,t)=8
  |f| = 8

  Graphe residuel apres :
    s->A(2), A->s(8), s->B(10), A->B(4), A->C(0), C->A(8),
    B->C(9), B->D(6), C->t(2), t->C(8), D->t(10)

ITERATION 2 : Chemin s -> B -> C -> t (BFS)
  Capacite residuelle : min(10, 9, 2) = 2
  Flot : f(s,B)=2, f(B,C)=2, f(C,t)=10
  |f| = 10

ITERATION 3 : Chemin s -> B -> D -> t (BFS)
  Residuel : s->B(8), B->D(6), D->t(10)
  Capacite residuelle : min(8, 6, 10) = 6
  Flot : f(s,B)=8, f(B,D)=6, f(D,t)=6
  |f| = 16

ITERATION 4 : Chercher chemin s -> ... -> t dans residuel
  Residuel : s->A(2), s->B(2), A->B(4), B->C(7), B->D(0), ...
  s->A(2)->B(4)->C(7)... mais C->t(0). Impasse.
  s->B(2)->C(7)... C->t(0). Impasse.
  Pas de chemin de s a t.

FLOT MAXIMAL = 16

Flot final sur chaque arc :
  s->A : 8/10
  s->B : 8/10
  A->B : 0/4
  A->C : 8/8
  B->C : 2/9
  B->D : 6/6
  C->t : 10/10
  D->t : 6/10

Verification conservation :
  A : entrant 8, sortant 0+8 = 8  (OK)
  B : entrant 8+0, sortant 2+6 = 8  (OK)
  C : entrant 8+2, sortant 10  (OK)
  D : entrant 6, sortant 6  (OK)
```

---

## 6. Theoreme flot max = coupe min

### Coupe

Partition (S, T) des sommets avec s dans S et t dans T.

Capacite de la coupe = somme des capacites des arcs de S vers T UNIQUEMENT.

```
Coupe (S, T) avec S={s,A,B,C}, T={D,t} :

  Arcs S -> T : B->D(cap 6), C->t(cap 10)
  Capacite = 6 + 10 = 16 = flot max   (Verifie !)

  Les arcs T -> S ne comptent PAS dans la capacite.
```

### Theoreme

```
max |f| = min c(S,T)

Le flot maximal = la capacite de la coupe minimale
```

### Trouver la coupe min

1. Construire le graphe residuel final (quand plus de chemin augmentant)
2. S = sommets accessibles depuis s dans le residuel
3. T = S \ S
4. La coupe (S, T) est la coupe minimale

---

## 7. Couplage biparti maximum

### Reduction au flot max

```
Graphe biparti :
  Groupe 1 : {A, B, C}
  Groupe 2 : {X, Y, Z}
  Aretes : A-X, A-Y, B-Y, C-Z

Reseau de flot :
  s --1--> A --1--> X --1--> t
  s --1--> B --1--> Y --1--> t
  s --1--> C --1--> Z --1--> t
                A --1--> Y

Toutes les capacites = 1
Flot maximal = taille du couplage maximum
```

### Theoreme de Konig

Dans un graphe biparti : taille du couplage maximum = taille de la couverture minimale par sommets.

---

## 8. Variantes

| Variante | Technique |
|----------|----------|
| Capacites sur les sommets | Dedoubler v en v_in, v_out avec arc (v_in, v_out, c(v)) |
| Sources/puits multiples | Super-source S reliee a chaque si, super-puits T relie depuis chaque ti |
| Flot a cout minimal | Minimiser cout total a valeur de flot donnee |

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  FLOTS ET RESEAUX -- RESUME                                     |
+------------------------------------------------------------------+
|                                                                  |
|  RESEAU : graphe oriente + source s + puits t + capacites        |
|  FLOT : 0 <= f(u,v) <= c(u,v) + conservation                    |
|                                                                  |
|  GRAPHE RESIDUEL :                                               |
|    Arc avant  u->v : cr = c(u,v) - f(u,v)                       |
|    Arc arriere v->u : cr = f(u,v)                                |
|                                                                  |
|  FORD-FULKERSON / EDMONDS-KARP :                                 |
|    1. Flot = 0 partout                                           |
|    2. Chercher chemin augmentant s->t dans residuel (BFS)        |
|    3. Augmenter flot de min(capacites residuelles)               |
|    4. Repeter jusqu'a plus de chemin                             |
|    Complexite : O(nm^2) avec BFS                                 |
|                                                                  |
|  FLOT MAX = COUPE MIN :                                          |
|    Coupe = partition (S,T) avec s dans S, t dans T               |
|    Capacite = arcs S->T SEULEMENT (pas T->S !)                  |
|    Coupe min : sommets accessibles depuis s dans residuel final  |
|                                                                  |
|  COUPLAGE BIPARTI :                                              |
|    Ajouter s, t avec capacites 1. Flot max = couplage max.      |
|    Konig : couplage max = couverture min (biparti)               |
|                                                                  |
|  PIEGES :                                                        |
|    - Oublier les arcs arriere (blocage sous-optimal)             |
|    - Compter les arcs T->S dans la coupe                         |
|    - Confondre capacite et flot dans le residuel                 |
|    - Oublier la conservation du flot                             |
|    - Arc arriere = REDUIRE le flot, pas l'augmenter              |
+------------------------------------------------------------------+
```
