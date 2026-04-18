---
title: "SDD -- Structures de Donnees"
sidebar_position: 0
---

# SDD -- Structures de Donnees

## Presentation du cours

SDD est le cours fondamental de structures de donnees a l'INSA Rennes (3e annee, Semestre 5). Il couvre la conception, l'implementation et l'analyse des structures de donnees fondamentales en Java, avec un accent sur les types abstraits de donnees, la separation interface/implementation et la complexite algorithmique.

**Langage :** Java (generiques, interfaces, iterateurs, framework collections)
**Evaluation :** Examen ecrit (DS) -- implementer des operations, tracer des algorithmes, prouver des complexites

## Sujets

| # | Sujet | Guide | Concepts cles |
|---|-------|-------|---------------|
| 1 | [Listes Chainees](/S5/SDD/guide/01-linked-lists) | Simple/double chainage, sentinelles, patron curseur | O(1) insertion/suppression au curseur |
| 2 | [Iterateurs et Patrons de Conception](/S5/SDD/guide/02-iterators) | Patron iterateur, Iterator/Iterable Java, patron adaptateur | Separation des preoccupations |
| 3 | [Piles et Files](/S5/SDD/guide/03-stacks-queues) | LIFO/FIFO, implementations tableau/chainage | Evaluation d'expressions, BFS |
| 4 | [Tables de Hachage](/S5/SDD/guide/04-hash-tables) | Fonctions de hachage, chainage, adressage ouvert, facteur de charge | O(1) recherche en moyenne |
| 5 | [Arbres Binaires](/S5/SDD/guide/05-binary-trees) | ABR, AVL, rotations, parcours | O(log n) operations equilibrees |
| 6 | [Tas et Files de Priorite](/S5/SDD/guide/06-heaps-priority-queues) | Tas min/max, heapify, tri par tas | O(log n) insertion/extraction-min |
| 7 | [Graphes et Dijkstra](/S5/SDD/guide/07-graphs-dijkstra) | Liste/matrice d'adjacence, BFS, DFS, Dijkstra | Plus courts chemins |
| 8 | [Quadtrees](/S5/SDD/guide/08-quadtrees) | Structures de donnees spatiales, quadtrees de region, elagage | Compression d'images |
| 9 | [Analyse de Complexite](/S5/SDD/guide/09-complexity) | Grand-O, Theta, Omega, analyse amortie | Techniques de preuve |

## Tableau de Complexite Synthetique

| Structure de donnees | Acces | Recherche | Insertion | Suppression | Espace | Notes |
|---------------------|-------|-----------|-----------|-------------|--------|-------|
| Tableau | O(1) | O(n) | O(n) | O(n) | O(n) | O(log n) recherche si trie |
| Liste Chainee (au curseur) | O(n) | O(n) | O(1) | O(1) | O(n) | O(1) operations a position connue |
| Liste sur Tableau | O(1) | O(n) | O(n) | O(n) | O(n) | O(1) amorti en ajout a la fin |
| Pile | O(n) | O(n) | O(1) | O(1) | O(n) | Acces LIFO uniquement |
| File | O(n) | O(n) | O(1) | O(1) | O(n) | Acces FIFO uniquement |
| Table de Hachage | -- | O(1)* | O(1)* | O(1)* | O(n) | *Cas moyen ; O(n) au pire |
| ABR (equilibre) | O(log n) | O(log n) | O(log n) | O(log n) | O(n) | Degenere en O(n) si desequilibre |
| Arbre AVL | O(log n) | O(log n) | O(log n) | O(log n) | O(n) | Equilibre garanti |
| Tas Min/Max | O(1)** | O(n) | O(log n) | O(log n) | O(n) | **Peek uniquement ; pas d'acces arbitraire |
| File de Priorite (tas) | -- | -- | O(log n) | O(log n) | O(n) | add + poll |
| File de Priorite (tableau trie) | -- | -- | O(n) | O(n) | O(n) | add par recherche binaire + decalage ; poll decale tous les elements |
| Quadtree | -- | O(log n)*** | O(log n)*** | O(log n)*** | O(n) | ***Pour les requetes spatiales |
| Graphe (liste adj.) | -- | O(V+E) | O(1) | O(E) | O(V+E) | Operations sur les aretes |
| Graphe (matrice adj.) | -- | O(1) | O(1) | O(1) | O(V^2) | Couteux en espace |

## Patrons Java Utilises dans ce Cours

### 1. Separation Interface / Implementation
```
Liste<T>  (interface)
  |-- ListeDoubleChainee<T>  (implementation chainee)
  |-- ListeTabulee<T>         (implementation tableau)
```

### 2. Patron Iterateur
```
Liste<T> --cree--> Iterateur<T>
  |                      |
  |-- ListeDoubleChainee |-- ListeDoubleChaineeIterateur
  |-- ListeTabulee       |-- ListeTabuleeIterateur
```

### 3. Patron Adaptateur
```
Liste<T> --adapte par--> ListeEngine<T> implements java.util.List<T>
Iterateur<T> --adapte par--> IterateurEngine<T> implements java.util.Iterator<T>
```

### 4. Generiques
```java
public class ListeDoubleChainee<T> implements Liste<T> { ... }
public class HeapPQ<T> implements PriorityQueue<T> { ... }
public class Dijkstra<T> { ... }
```

## Comment Utiliser ce Guide

1. **Avant un TP** : Lire le guide du sujet correspondant pour la theorie
2. **Pendant les revisions** : Utiliser les aide-memoire a la fin de chaque sujet
3. **Avant l'examen** : Se concentrer sur la section [Preparation Examen](/S5/SDD/exam-prep/readme)
4. **Pour s'entrainer** : Travailler les [Solutions des Exercices](../exercises/) avec le code source des TP

## Fichiers Importants a Connaitre

| Fichier | Role |
|---------|------|
| `MyList<T>` | Interface de liste originale (TP1) |
| `Liste<T>` / `Iterateur<T>` | Interfaces raffinees separant liste et iterateur (TP2-3) |
| `ListeEngine<T>` / `IterateurEngine<T>` | Adaptateurs reliant les listes personnalisees a `java.util.List` (TP3) |
| `Arbre` | Interface d'arbre binaire (TP6) |
| `TreeTwo` | Implementation d'arbre binaire avec parcours postfixe (TP6) |
| `ExprArith` | Evaluateur d'expressions arithmetiques (TP6) |
| `QuadTree` / `Tree` | Interface et implementation de quadtree pour les images (TP7) |
| `PriorityQueue<T>` / `HeapPQ<T>` | File de priorite avec tas binaire (TP8) |
| `Graph<T>` / `IndexedGraph` | Interface de graphe et implementation par liste d'adjacence (TP8) |
| `Dijkstra<T>` | Algorithme de plus court chemin (TP8) |
