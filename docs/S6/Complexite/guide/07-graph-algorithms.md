---
title: "Chapitre 7 -- Algorithmes de graphes"
sidebar_position: 7
---

# Chapitre 7 -- Algorithmes de graphes

> Les graphes sont la structure de donnees qui unifie de nombreux problemes : plus courts chemins, arbres couvrants, ordonnancement, etc.

---

## 1. Parcours de graphes

### 1.1 Recherche en profondeur (DFS)

Explore aussi loin que possible avant de revenir en arriere.

```python noexec
def dfs(graphe, sommet, visite=None):
    if visite is None: visite = set()
    visite.add(sommet)
    for voisin in graphe[sommet]:
        if voisin not in visite:
            dfs(graphe, voisin, visite)
    return visite
```

**Proprietes :**
- Complexite : O(V + E) avec listes d'adjacence
- Utilise une pile (implicite via la recursion)
- Ordre de visite : depend de l'ordre des voisins
- Applications : detection de cycles, tri topologique, composantes connexes, SCC

### 1.2 Recherche en largeur (BFS)

Explore par niveaux de distance croissante.

```python noexec
from collections import deque

def bfs(graphe, depart):
    visite = {depart}
    file = deque([depart])
    while file:
        sommet = file.popleft()
        for voisin in graphe[sommet]:
            if voisin not in visite:
                visite.add(voisin)
                file.append(voisin)
    return visite
```

**Proprietes :**
- Complexite : O(V + E)
- Utilise une file (FIFO)
- Trouve le plus court chemin en nombre d'aretes
- Complet : trouve la solution si elle existe

### Comparaison DFS vs BFS

| Critere | DFS | BFS |
|---------|-----|-----|
| Structure | Pile (recursion) | File (FIFO) |
| Memoire | O(profondeur) | O(largeur) |
| Plus court chemin | Non garanti | Oui (nb aretes) |
| Complet | Oui (si fini) | Oui |
| Complexite | O(V+E) | O(V+E) |

---

## 2. Tri topologique

Pour un graphe oriente acyclique (DAG), ordonne les sommets tel que pour toute arete (u,v), u apparait avant v.

**Algorithme :** DFS, inserer chaque sommet en tete de la liste quand tous ses successeurs sont visites.

**Complexite :** O(V + E)

**Application :** Ordonnancement de taches avec dependances.

---

## 3. Composantes fortement connexes (SCC)

Sous-ensemble maximal de sommets tel que tout sommet est accessible depuis tout autre.

**Algorithme de Kosaraju :**
1. DFS sur le graphe => pile de fin de visite
2. Transposer le graphe (inverser les aretes)
3. DFS sur le graphe transpose dans l'ordre de la pile

**Complexite :** O(V + E)

---

## 4. Arbres couvrants minimaux (MST)

### 4.1 Kruskal

```
Trier aretes par poids croissant
Pour chaque arete (u,v) :
    Si u et v dans des composantes differentes :
        Ajouter l'arete
        Union(u, v)
```

**Complexite :** O(E log E) -- domine par le tri.
Structure Union-Find avec compression de chemins et union par rang.

### 4.2 Prim

```
Partir d'un sommet s
Repeter V-1 fois :
    Ajouter l'arete de poids minimal qui relie
    un sommet de l'arbre a un sommet hors de l'arbre
```

**Complexite :** O(E log V) avec tas binaire, O(V^2) avec tableau.

### Quand utiliser lequel ?

| Critere | Kruskal | Prim |
|---------|---------|------|
| Graphe creux (E ~ V) | Preferable | -- |
| Graphe dense (E ~ V^2) | -- | Preferable |
| Implementation | Union-Find | Tas binaire |

---

## 5. Plus courts chemins

### 5.1 Dijkstra (source unique, poids positifs)

```
dist[source] = 0, dist[autres] = infini
Repeter :
    u = sommet non visite avec dist minimale
    Pour chaque voisin v de u :
        Si dist[u] + poids(u,v) < dist[v] :
            dist[v] = dist[u] + poids(u,v)
```

**Complexite :** O(V^2) avec tableau, O((V+E) log V) avec tas.
**Restriction :** Poids tous >= 0.

### 5.2 Bellman-Ford (source unique, poids quelconques)

```
Repeter V-1 fois :
    Pour chaque arete (u,v,w) :
        Si dist[u] + w < dist[v] :
            dist[v] = dist[u] + w
```

**Complexite :** O(V * E).
Detecte les cycles de poids negatif (une iteration supplementaire modifie encore les distances).

### 5.3 Floyd-Warshall (toutes paires)

```
Pour k de 1 a V :
    Pour i de 1 a V :
        Pour j de 1 a V :
            dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

**Complexite :** O(V^3).

### Table recapitulative

| Algorithme | Type | Poids | Complexite |
|-----------|------|-------|-----------|
| Dijkstra | Source unique | >= 0 | O((V+E) log V) |
| Bellman-Ford | Source unique | Quelconques | O(V*E) |
| Floyd-Warshall | Toutes paires | Quelconques | O(V^3) |

---

## 6. Pieges classiques

1. **Dijkstra avec poids negatifs** : Ne fonctionne PAS. Utiliser Bellman-Ford.

2. **Oublier de marquer les visites en BFS/DFS** : Boucle infinie sur un graphe avec cycles.

3. **Confondre graphe oriente et non oriente** : SCC n'a de sens que sur un graphe oriente.

4. **Compter E comme V^2** : Un graphe peut etre creux (E ~ V) ou dense (E ~ V^2). La complexite depend de cette distinction.

---

## CHEAT SHEET -- Algorithmes de graphes

```
PARCOURS :
  DFS : pile/recursion, O(V+E), cycles, SCC, tri topo
  BFS : file FIFO, O(V+E), plus court chemin (nb aretes)

MST :
  Kruskal : trier aretes + Union-Find, O(E log E)
  Prim    : tas + extension, O(E log V)

PLUS COURTS CHEMINS :
  Dijkstra     : source unique, poids >= 0, O((V+E) log V)
  Bellman-Ford : source unique, poids qqc., O(V*E)
  Floyd-Warshall : toutes paires, O(V^3)

APPLICATIONS DFS :
  Detection de cycles
  Tri topologique (DAG)
  Composantes fortement connexes (Kosaraju)
  Composantes connexes (non oriente)
```
