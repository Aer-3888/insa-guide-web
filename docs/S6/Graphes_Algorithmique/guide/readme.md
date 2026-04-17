---
title: "Graphes et Algorithmique -- Guide complet (S6, INSA Rennes 3A INFO)"
sidebar_position: 0
---

# Graphes et Algorithmique -- Guide complet (S6, INSA Rennes 3A INFO)

Ce guide couvre l'integralite du programme de Graphes et Algorithmique : des definitions de base jusqu'aux flots, en passant par la coloration, les arbres couvrants et l'ordonnancement. Chaque chapitre est autonome, avec theorie, diagrammes ASCII, pseudo-code, exemples detailles et une cheat sheet.

---

## Roadmap d'apprentissage

```
01 Fondamentaux
      |
      v
02 Parcours (BFS/DFS)
      |
      +------+------+
      v             v
03 Plus courts    04 Arbres couvrants
   chemins           minimaux
      |                   |
      v                   v
05 Flots          06 Euler & Hamilton
                        |
                        v
                  07 Coloration
                        |
                        v
                  08 Planarite
                        |
                        v
                  09 Arbres & Forets
```

Les fleches indiquent les dependances logiques. Les fondamentaux (01) sont le socle de tout. Les parcours (02) ouvrent vers les chemins (03) et les arbres couvrants (04). Les flots (05) s'appuient sur les deux. Euler/Hamilton (06), la coloration (07), la planarite (08) et les arbres (09) forment le volet structurel.

---

## Prerequis

- Savoir ce qu'est un ensemble (une collection d'elements sans doublons).
- Comprendre la notion de relation (si A est relie a B, ca forme un lien).
- Logique de base (si... alors..., ou, et, negation).
- Savoir lire un pseudo-code (si, tant que, pour...).

---

## Table des matieres

| # | Chapitre | Description |
|---|----------|-------------|
| 01 | [Fondamentaux des graphes](/S6/Graphes_Algorithmique/guide/01-graph-fundamentals) | Sommets, aretes, arcs, degres, representations (matrice/liste), graphes ponderes, types speciaux. |
| 02 | [Parcours de graphes](/S6/Graphes_Algorithmique/guide/02-graph-traversals) | BFS, DFS, proprietes, applications, composantes connexes, forte connexite. |
| 03 | [Plus courts chemins](/S6/Graphes_Algorithmique/guide/03-shortest-paths) | Dijkstra, Bellman-Ford, Floyd-Warshall, poids negatifs, circuits absorbants. |
| 04 | [Arbres couvrants minimaux](/S6/Graphes_Algorithmique/guide/04-minimum-spanning-trees) | Kruskal, Prim, propriete de coupe, propriete de cycle. |
| 05 | [Flots et reseaux](/S6/Graphes_Algorithmique/guide/05-network-flow) | Ford-Fulkerson, theoreme flot max / coupe min, couplage biparti. |
| 06 | [Euler et Hamilton](/S6/Graphes_Algorithmique/guide/06-euler-hamilton) | Cycles/chaines euleriens, chemins hamiltoniens, conditions, theoremes. |
| 07 | [Coloration de graphes](/S6/Graphes_Algorithmique/guide/07-graph-coloring) | Nombre chromatique, algorithme glouton, DSatur, theoremes de Brooks et des 4 couleurs. |
| 08 | [Planarite](/S6/Graphes_Algorithmique/guide/08-planarity) | Graphes planaires, formule d'Euler, theoreme de Kuratowski, K5, K3,3. |
| 09 | [Arbres et forets](/S6/Graphes_Algorithmique/guide/09-trees-forests) | Arbres couvrants, arbres enracines, forets, proprietes fondamentales, tri topologique. |

---

## Structure de chaque chapitre

| Section | Contenu |
|---------|---------|
| Theorie | Definitions formelles, theoremes, proprietes |
| Diagrammes ASCII | Visualisation de graphes sans outils externes |
| Pseudo-code | Algorithmes prets a etre deroules a la main |
| Exemple detaille | Trace pas a pas sur un graphe concret |
| CHEAT SHEET | Resume condense des formules, proprietes et pieges |

---

## Conseils d'utilisation

1. Lis dans l'ordre pour une progression naturelle, ou saute directement au chapitre qui t'interesse.
2. Dessine les graphes a la main en parallele. Les graphes s'apprennent en les manipulant.
3. Deroule les algorithmes pas a pas sur des petits exemples avant de passer a des cas complexes.
4. Ne memorise pas les algorithmes : comprends d'abord l'intuition et la logique.
5. Consulte la cheat sheet de chaque chapitre pour reviser rapidement avant le DS.
