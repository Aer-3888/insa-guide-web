---
title: "SDD -- Preparation a l'Examen"
sidebar_position: 0
---

# SDD -- Preparation a l'Examen

## Format de l'Examen

L'examen SDD (DS) est une epreuve ecrite, generalement de 2 a 3 heures. D'apres l'analyse des examens passes de 2013 a 2025, les sujets testent de maniere constante :

1. **Types Abstraits de Donnees (TAD)** -- specifications formelles avec SORTE, FONCTIONS, AXIOMES
2. **Arbres Binaires de Recherche** -- insertion, suppression, parcours, analyse de hauteur
3. **Implementation d'algorithmes** -- ecrire du code Java sur papier
4. **Analyse de complexite** -- prouver des bornes en O, comparer des structures de donnees
5. **Conception de structures de donnees** -- structures nouvelles combinant des primitives connues

## Frequence des Sujets dans les Examens Passes

| Sujet | Frequence | Questions typiques |
|-------|-----------|-------------------|
| Arbres binaires / ABR | Tres elevee | Insertion, suppression, parcours, hauteur, equilibrage |
| Types Abstraits de Donnees | Tres elevee | Definir un TAD avec axiomes, prouver des theoremes |
| Analyse de complexite | Elevee | Prouver O/Theta, comparer des implementations |
| Listes chainees | Moyenne | Implementer des operations, navigation par curseur |
| Tables de hachage | Moyenne | Conception de fonction de hachage, analyse des collisions |
| Tas | Moyenne | Operations HeapPQ, tracer heapify |
| Graphes / Dijkstra | Faible-Moyenne | Tracer l'algorithme, reconstruction de chemin |
| Structures avancees | Variable | Filtres de Bloom (2021), Arbres de segments (2022), Sommes d'intervalles |

## Strategie d'Examen

### Gestion du Temps (examen de 2h)

1. **Lire l'examen entier** (5 min) -- identifier les questions faciles et difficiles
2. **Questions TAD / Theorie** (30 min) -- rapide si on connait le formalisme
3. **Implementation Arbre / ABR** (30 min) -- plus frequent, plus de points
4. **Analyse de complexite** (20 min) -- prouver les bornes soigneusement
5. **Questions d'implementation** (25 min) -- ecrire du code Java propre
6. **Relecture** (10 min) -- verifier les cas limites, erreurs de bornes

### Ecrire du Java sur Papier

- Ecrire des **signatures de methodes claires** avec les types de retour
- Gerer les **cas limites en premier** (null, vide, element unique)
- Utiliser des **retours anticipes** pour reduire l'imbrication
- Dessiner des **schemas ASCII** avant et apres les operations
- **Indiquer la complexite** a cote de chaque methode

## Analyse des Examens Passes

### Examen 2020 -- Accent sur les ABR

**Exercice 1 : TAD et ABR**
- Q1 : Distinguer axiome et theoreme dans une specification formelle
- Q2 : Definir le TAD Booleen avec axiomes pour vrai/faux/non/et/ou
- Q3 : Prouver les lois de De Morgan a partir des axiomes (par analyse de cas)
- Q4 : Tracer l'insertion ABR de la sequence [7, 3, 10, 1, 6, 14, 4, 7]
- Q5 : Implementer `placer(int i)` -- insertion dans un ABR
- Q6 : Expliquer la suppression avec 2 enfants (remplacement par le max du sous-arbre gauche)
- Q7 : Implementer `oterPlusGrandInf()` -- trouver et supprimer le max du sous-arbre gauche
- Q8 : Implementer `supprimerEc()` -- suppression complete dans un ABR

**Point clef de la solution etudiante** : La suppression ABR avec 2 enfants necessite de trouver le noeud le plus a droite du sous-arbre gauche (le predecesseur infixe), pas n'importe quel noeud.

**Exercice 2 : Parcours d'arbre (Exercice 3 dans l'examen)**
- Q9 : Etant donne un arbre, produire differents parcours et reconstruire a partir d'un parcours

### Examen 2021 -- Filtres de Bloom

**Structure nouvelle** : Filtre de Bloom (test d'appartenance probabiliste)
- Utilise BitSet + plusieurs fonctions de hachage
- `add()` : mettre k bits a 1 en utilisant k fonctions de hachage
- `contains()` : verifier si tous les k bits sont a 1
- Faux positifs possibles, faux negatifs impossibles

### Examen 2022 -- Arbres de Segments et Sommes d'Intervalles

**IntervalSum** : tableau de sommes prefixes pour des requetes O(1) sur des intervalles, mise a jour O(n)
**SegmentTree** : arbre binaire equilibre pour des requetes O(log n) sur des intervalles ET mise a jour O(log n)

Methodes clefs :
- `rsq(from, to)` -- requete de somme sur intervalle
- `rMinQ(from, to)` -- requete de minimum sur intervalle
- `update(i, value)` -- mise a jour ponctuelle

### Examens 2023-2025

Disponibles en PDF, poursuivant les schemas habituels d'operations ABR, formalisme TAD et analyse de complexite.

## Problemes d'Entrainement

### Probleme 1 : Trace d'Insertion ABR

Inserer les valeurs suivantes dans un ABR vide : 15, 8, 23, 4, 12, 18, 30, 6

```
Solution :
           [15]
          /    \
        [8]    [23]
        / \    /  \
      [4] [12][18][30]
        \
        [6]
```

### Probleme 2 : Suppression dans un ABR

Supprimer 15 de l'arbre ci-dessus (la racine a 2 enfants) :
1. Trouver le max du sous-arbre gauche : 12
2. Remplacer 15 par 12
3. Supprimer l'ancien noeud 12 (sans enfants)

```
           [12]
          /    \
        [8]    [23]
        /      /  \
      [4]   [18] [30]
        \
        [6]
```

### Probleme 3 : Operations sur un Tas

Tas min donne sous forme de tableau : [2, 5, 3, 8, 7, 6, 4]

Dessiner l'arbre :
```
           [2]
          /   \
        [5]   [3]
        / \   / \
      [8] [7][6] [4]
```

Apres `poll()` (retirer 2) :
1. Remplacer la racine par le dernier : [4, 5, 3, 8, 7, 6]
2. ShiftDown de 4 : comparer avec min(5,3)=3, echanger
3. [3, 5, 4, 8, 7, 6] : comparer 4 avec min(6)=6, 4 < 6, termine

```
           [3]
          /   \
        [5]   [4]
        / \   /
      [8] [7][6]
```

Apres `add(1)` :
1. Placer a la fin : [3, 5, 4, 8, 7, 6, 1]
2. ShiftUp de 1 : parent(6)=2, heap[2]=4 > 1, echanger
3. [3, 5, 1, 8, 7, 6, 4] : parent(2)=0, heap[0]=3 > 1, echanger
4. [1, 5, 3, 8, 7, 6, 4]

### Probleme 4 : Trace de Dijkstra

```
Graphe :
  A --2--> B --3--> D
  |        |
  5        1
  |        |
  v        v
  C --4--> E

Dijkstra depuis A :

Etape  PQ                          cout              prev
0      [(A,0)]                     {}                {}
1      [(B,2),(C,5)]               {A:0}             {A:null}
2      [(C,5),(E,3),(D,5)]         {A:0,B:2}         {A:null,B:A}
3      [(C,5),(D,5)]               {A:0,B:2,E:3}     {...,E:B}
4      [(D,5)]                     {A:0,B:2,E:3,C:5} {...,C:A}
5      []                          {...,D:5}          {...,D:B}

Plus court chemin A->E : A -> B -> E (cout 3)
Plus court chemin A->D : A -> B -> D (cout 5)
```

### Probleme 5 : Complexite

Prouver que la methode `size()` de ListeEngine est O(n) :

```java
public int size() {
    int ret = 0;
    for (Object k : this) ret++;
    return ret;
}
```

**Preuve** : La boucle for-each appelle `iterator()`, puis `hasNext()`/`next()` pour chaque element. Avec n elements dans la liste :
- `hasNext()` est O(1) (verifie estSorti)
- `next()` est O(1) (valec + succ)
- La boucle s'execute n fois
- Total : n * O(1) = O(n)

### Probleme 6 : TAD Booleen

Definir le TAD Booleen :
```
SORTE Boolean
UTILISE
FONCTIONS
    vrai : -> Boolean
    faux : -> Boolean
    non  : Boolean -> Boolean
    et   : Boolean x Boolean -> Boolean
    ou   : Boolean x Boolean -> Boolean
AXIOMES
    non(vrai) = faux
    non(faux) = vrai
    et(vrai, vrai) = vrai
    et(vrai, faux) = faux
    et(faux, vrai) = faux
    et(faux, faux) = faux
    ou(vrai, vrai) = vrai
    ou(vrai, faux) = vrai
    ou(faux, vrai) = vrai
    ou(faux, faux) = faux
```

Prouver De Morgan : non(et(x,y)) = ou(non(x), non(y))
Methode : enumerer les 4 cas (x,y) dans {vrai,faux}^2.

## Liste de Revision

- [ ] Savoir dessiner un ABR apres une sequence d'insertions
- [ ] Savoir supprimer d'un ABR (cas 0, 1 et 2 enfants)
- [ ] Savoir ecrire des specifications TAD avec axiomes
- [ ] Savoir prouver des theoremes a partir d'axiomes par analyse de cas
- [ ] Savoir tracer Dijkstra etape par etape
- [ ] Savoir tracer add/poll sur un tas avec shiftUp/shiftDown
- [ ] Savoir calculer la complexite d'un code donne
- [ ] Savoir prouver O/Theta en utilisant la definition (trouver c, n0)
- [ ] Savoir implementer des operations de liste chainee sur papier
- [ ] Savoir concevoir des fonctions de hachage et analyser les collisions
- [ ] Connaitre la complexite de toutes les structures de donnees principales (voir le tableau dans guide/README.md)
