---
title: "Strategie d'examen -- Graphes et Algorithmique"
sidebar_position: 1
---

# Strategie d'examen -- Graphes et Algorithmique

---

## 1. Avant l'examen

### Checklist de revision

- [ ] Savoir derouler Dijkstra sur un graphe de 6-8 sommets (en < 5 min)
- [ ] Savoir derouler Kruskal sur un graphe de 6-8 sommets (en < 5 min)
- [ ] Savoir derouler Ford-Fulkerson sur un reseau de 5-7 sommets
- [ ] Connaitre les conditions d'Euler par coeur (degres pairs / d+ = d-)
- [ ] Connaitre les conditions de Dirac et Ore (suffisantes, pas necessaires)
- [ ] Savoir calculer ES, LS, MT pour l'ordonnancement
- [ ] Connaitre les bornes du nombre chromatique
- [ ] Connaitre la formule d'Euler (n - m + f = 2) et m <= 3n - 6
- [ ] Savoir prouver qu'un graphe est/n'est pas biparti
- [ ] Connaitre les 6 equivalences d'un arbre

### Ce qu'il faut memoriser

```
FORMULES :
  Somme d(v) = 2m                     (poignees de main)
  n - m + f = 2                       (Euler, planaire connexe)
  m <= 3n - 6                         (planaire simple)
  m <= 2n - 4                         (planaire biparti)
  omega(G) <= chi(G) <= Delta(G) + 1  (coloration)
  Arbre : n sommets <=> n-1 aretes (+ connexe ou + acyclique)

COMPLEXITES :
  BFS/DFS : O(n+m)
  Kruskal : O(m log m)
  Prim : O(m log n) ou O(n^2)
  Dijkstra : O(m log n) ou O(n^2)
  Bellman-Ford : O(nm)
  Floyd-Warshall : O(n^3)
  Edmonds-Karp : O(nm^2)
```

---

## 2. Pendant l'examen

### Gestion du temps (2h typique)

| Phase | Temps | Action |
|-------|-------|--------|
| Lecture | 10 min | Lire tout le sujet, reperer les questions faciles |
| Questions faciles | 30 min | Definitions, degres, representations, conditions d'Euler |
| Algorithmes | 50 min | Derouler Dijkstra, Kruskal, Ford-Fulkerson |
| Preuves | 20 min | Theoremes, proprietes |
| Relecture | 10 min | Verifier les tableaux, les comptages d'aretes |

### Methode pour derouler un algorithme

1. **Lire l'enonce :** quel graphe ? oriente ? pondere ? quel algorithme ?
2. **Dessiner le graphe** clairement avec les poids
3. **Initialiser** : tableau de distances, file, Union-Find, etc.
4. **Montrer CHAQUE etape** dans un tableau propre
5. **Verifier** a la fin :
   - ACM : n-1 aretes ?
   - Dijkstra : distances coherentes ?
   - Flot : conservation verifiee ?
6. **Conclure** : repondre a la question posee

### Format de tableau recommande

**Dijkstra :**

```
Etape | Sommet choisi | dist(A) | dist(B) | dist(C) | ...
------|--------------|---------|---------|---------|----
Init  |     --       |    0    |   inf   |   inf   |
  1   |     A        |  **0**  |    5    |    3    |
  2   |     C        |    0    |    4    |  **3**  |
  ...
```

**Kruskal :**

```
Etape | Arete | Poids | Action | Composantes
------|-------|-------|--------|------------
  1   | A-B   |   1   | Ajouter | ...
  2   | C-D   |   2   | Refuser | ...
```

**Ford-Fulkerson :**

```
Iteration | Chemin augmentant | Cap. residuelle | |f| apres
----------|-------------------|-----------------|----------
    1     | s -> A -> t       |       5         |     5
    2     | s -> B -> t       |       3         |     8
```

---

## 3. Erreurs les plus frequentes

### Top 10 des erreurs en DS (classees par frequence)

| # | Erreur | Comment l'eviter |
|---|--------|-----------------|
| 1 | Dijkstra avec poids negatifs | Verifier les poids AVANT de choisir l'algorithme |
| 2 | Oublier les arcs arriere (Ford-Fulkerson) | TOUJOURS dessiner le graphe residuel complet |
| 3 | Confondre eulerien (aretes) et hamiltonien (sommets) | Moyen mnemotechnique : Euler = Each Edge |
| 4 | Prendre MIN au lieu de MAX pour ES (ordonnancement) | ES = MAX (on attend TOUS les prerequis) |
| 5 | Boucle k en position interne (Floyd-Warshall) | Ordre : k (externe), i, j |
| 6 | Oublier que l'ACM a n-1 aretes | Compter les aretes a la fin de Kruskal/Prim |
| 7 | Compter les arcs T->S dans une coupe | Coupe = arcs S->T SEULEMENT |
| 8 | Appliquer Brooks a K_n ou cycle impair | Verifier les exceptions AVANT d'appliquer |
| 9 | Confondre chaine (non oriente) et chemin (oriente) | Verifier le type de graphe |
| 10 | Oublier la face exterieure dans Euler | n - m + f = 2, f inclut la face infinie |

### Erreurs subtiles

- Oublier de marquer un sommet comme visite dans Dijkstra (le revisiter)
- Dans Bellman-Ford, oublier la n-eme iteration de verification
- Dans Kruskal, oublier de verifier si les deux extremites sont dans la meme composante
- En coloration glouton, oublier de verifier TOUS les voisins deja colores
- En ordonnancement, confondre ES/EF et LS/LF

---

## 4. Strategies par type de question

### Question "Derouler un algorithme"

- Utiliser un tableau avec une colonne par sommet/variable
- Montrer explicitement chaque changement de valeur
- Marquer en gras le sommet choisi a chaque etape
- Verifier le resultat final (n-1 aretes, conservation du flot, etc.)

### Question "Prouver que..."

- Identifier le theoreme ou la propriete a utiliser
- Ecrire les hypotheses clairement
- Raisonner par contradiction si possible
- Pour les arbres : utiliser la recurrence sur n (supprimer une feuille)
- Pour la planarite : utiliser m <= 3n - 6

### Question "Modeliser en graphe"

- Identifier ce que representent les sommets
- Identifier ce que representent les aretes/arcs
- Preciser si oriente ou non, pondere ou non
- Formuler la question en termes de graphe (coloration, chemin, flot, etc.)

### Question "Donner le nombre chromatique"

1. Chercher la plus grande clique => borne inferieure
2. Trouver une coloration valide => borne superieure
3. Si les deux coincident => chi = omega
4. Sinon, raffiner (essayer de colorier avec omega+1 couleurs)

---

## 5. Template de reponse type

### Pour Dijkstra

```
Algorithme de Dijkstra depuis le sommet [source].
Poids tous positifs : Dijkstra est applicable.

[Tableau etape par etape]

Plus court chemin de [source] a [destination] : [chemin]
Cout : [valeur]
```

### Pour Kruskal

```
Algorithme de Kruskal.
Aretes triees par poids croissant : [liste]

[Tableau etape par etape]

ACM = {[aretes]}
Poids total = [valeur]
Verification : [n-1] aretes pour [n] sommets. Correct.
```

### Pour Ford-Fulkerson

```
Algorithme de Ford-Fulkerson (Edmonds-Karp, BFS).

[Iterations avec chemins augmentants]

Flot maximal = [valeur]
Coupe minimale : S = {[sommets]}, T = {[sommets]}
Capacite de la coupe = [valeur] = flot max. Verifie.
```
