---
title: "Graphes et Algorithme de Dijkstra"
sidebar_position: 7
---

# Graphes et Algorithme de Dijkstra

## Theorie

### Definitions

Un **graphe** G = (V, E) est compose de :
- **V** : ensemble de sommets
- **E** : ensemble d'aretes/arcs

Types :
- **Oriente** : les arcs ont une direction (u -> v)
- **Non oriente** : les aretes vont dans les deux sens
- **Pondere** : les aretes ont des couts/poids
- **Non pondere** : toutes les aretes ont un cout egal

```
Graphe oriente pondere :

    (0)---3--->(1)
     |         / |
    10       4   1
     |      /    |
     v    v      v
    (3)<-------(2)
     |
     3
     v
    (4)
```

### Representations

#### Liste d'adjacence

Chaque sommet stocke la liste de ses voisins.

```
0: [(1, 3), (3, 10)]      <- le sommet 0 a des arcs vers 1 (poids 3) et 3 (poids 10)
1: [(2, 4), (3, 1)]
2: []
3: [(4, 3)]
4: [(3, 2)]
```

- Espace : O(V + E)
- Verifier l'existence d'un arc : O(degre)
- Iterer sur les voisins : O(degre)

#### Matrice d'adjacence

Tableau 2D ou matrice[u][v] = poids de l'arc u->v (infini si pas d'arc).

```
     0    1    2    3    4
0  [ 0    3   inf  10  inf]
1  [inf   0    4    1  inf]
2  [inf  inf   0   inf inf]
3  [inf  inf  inf   0    3]
4  [inf  inf  inf   2    0]
```

- Espace : O(V^2)
- Verifier l'existence d'un arc : O(1)
- Iterer sur les voisins : O(V)


## Implementation Java (du TP8)

### Interface Graph

```java
public interface Graph<T> {
    int numberOfVertices();
    int numberOfEdges();
    void addVertex(T v);
    void addEdge(T u, T v, double weight);
    Iterable<VertexAndWeight<T>> neighbors(T u);
}
```

### IndexedGraph (liste d'adjacence avec sommets entiers)

```java
public class IndexedGraph implements Graph<Integer> {
    private final int numberOfVertices;
    private int numberOfEdges;
    private boolean oriented;
    private List<VertexAndWeight<Integer>>[] adjacency;

    public IndexedGraph(int numberOfVertices, boolean oriented) {
        this.numberOfVertices = numberOfVertices;
        this.oriented = oriented;
        adjacency = new ArrayList[numberOfVertices];
        for (int i = 0; i < numberOfVertices; i++)
            adjacency[i] = new ArrayList<>();
    }

    public void addEdge(Integer u, Integer v, double weight) {
        adjacency[u].add(new VertexAndWeight<>(v, weight));
        if (!oriented)
            adjacency[v].add(new VertexAndWeight<>(u, weight));
    }

    public Iterable<VertexAndWeight<Integer>> neighbors(Integer u) {
        return adjacency[u];
    }
}
```

### VertexAndWeight

```java
public class VertexAndWeight<T> {
    public final T vertex;
    public final double weight;

    public VertexAndWeight(T vertex, double weight) {
        this.vertex = vertex;
        this.weight = weight;
    }
}
```


## BFS et DFS

### BFS (Parcours en Largeur)

Utilise une **file**. Explore niveau par niveau.

```java
void bfs(Graph<T> g, T source) {
    Set<T> visited = new HashSet<>();
    Queue<T> queue = new ArrayDeque<>();
    queue.offer(source);
    visited.add(source);

    while (!queue.isEmpty()) {
        T u = queue.poll();
        process(u);
        for (VertexAndWeight<T> neighbor : g.neighbors(u)) {
            if (!visited.contains(neighbor.vertex)) {
                visited.add(neighbor.vertex);
                queue.offer(neighbor.vertex);
            }
        }
    }
}
```

Complexite : O(V + E)

### DFS (Parcours en Profondeur)

Utilise une **pile** (ou la recursion). Va en profondeur d'abord.

```java
void dfs(Graph<T> g, T source) {
    Set<T> visited = new HashSet<>();
    Deque<T> stack = new ArrayDeque<>();
    stack.push(source);

    while (!stack.isEmpty()) {
        T u = stack.pop();
        if (visited.contains(u)) continue;
        visited.add(u);
        process(u);
        for (VertexAndWeight<T> neighbor : g.neighbors(u))
            if (!visited.contains(neighbor.vertex))
                stack.push(neighbor.vertex);
    }
}
```

Complexite : O(V + E)


## Algorithme de Dijkstra

### Principe

Trouve le **plus court chemin** d'un sommet source vers tous les autres sommets dans un graphe pondere avec des **poids non negatifs**.

Utilise une **file de priorite** (tas min) pour toujours traiter le sommet non visite le plus proche.

### Algorithme (Lazy Dijkstra -- du TP8)

```
1. Inserer la source dans la PQ avec distance 0
2. Tant que la PQ n'est pas vide :
   3. Retirer le noeud n de plus petite distance
   4. Si n.sommet est deja dans 'cost' : ignorer (deja traite)
   5. Enregistrer n.sommet dans cost et prev
   6. Pour chaque voisin v de n.sommet :
      7. Ajouter un nouveau noeud (cout = n.cout + poids_arc) a la PQ
```

### Implementation Java (du TP8)

```java
public class Dijkstra<T> {
    private final PriorityQueue<DijkstraNode<T>> pq;
    private final Map<T, Double> cost = new HashMap<>();
    private final Map<T, T> prev = new HashMap<>();

    public Dijkstra(Graph<T> graph, T source,
                    PriorityQueue<DijkstraNode<T>> pq) {
        this.pq = pq;
        solve(graph, source);
    }

    private void solve(Graph<T> graph, T source) {
        // Step 1: insert source
        pq.add(new DijkstraNode<>(0.0, source));

        // Step 2: while PQ not empty
        while (!pq.isEmpty()) {
            // Step 3: pop minimum
            DijkstraNode<T> node = pq.poll();

            // Step 4: skip if already processed
            if (cost.containsKey(node.vertex)) continue;

            // Step 5: record cost and predecessor
            cost.put(node.vertex, node.cost);
            prev.put(node.vertex, node.prev);

            // Step 6: relax neighbors
            for (VertexAndWeight<T> neighbor : graph.neighbors(node.vertex)) {
                pq.add(new DijkstraNode<>(
                    neighbor.weight + node.cost,
                    neighbor.vertex,
                    node.vertex
                ));
            }
        }
    }

    // Reconstruct path from source to v
    public Deque<T> getPathTo(T v) {
        Deque<T> path = new ArrayDeque<>();
        path.push(v);
        T road = v;
        while (cost.get(road) != 0) {
            road = prev.get(road);
            path.push(road);
        }
        return path;
    }

    public double getCost(T v) {
        return cost.getOrDefault(v, Double.POSITIVE_INFINITY);
    }
}
```

### DijkstraNode

```java
public class DijkstraNode<T> implements Comparable<DijkstraNode<T>> {
    final Double cost;
    final T vertex;
    final T prev;

    @Override
    public int compareTo(DijkstraNode<T> node) {
        return Double.compare(cost, node.cost);
    }
}
```

### Exemple de Trace

```
Graphe (oriente, pondere) :
  (0)--3-->(1)--4-->(2)
   |        |
  10        1
   |        |
   v        v
  (3)-------(3 est la cible des deux arcs)
   |
   3
   v
  (4)--2-->(3)   [arc de 4 vers 3]

Arcs : 0->1 (p=3), 0->3 (p=10), 1->2 (p=4), 1->3 (p=1), 3->4 (p=3), 4->3 (p=2)

Dijkstra depuis 0 :

PQ : [(0, cout=0)]
  Defiler (0, 0). cout={0:0}. Ajouter voisins : (1,3), (3,10)
PQ : [(1, 3), (3, 10)]
  Defiler (1, 3). cout={0:0, 1:3}. Ajouter : (2, 3+4=7), (3, 3+1=4)
PQ : [(3, 4), (2, 7), (3, 10)]
  Defiler (3, 4). cout={0:0, 1:3, 3:4}. Ajouter : (4, 4+3=7)
PQ : [(2, 7), (4, 7), (3, 10)]
  Defiler (2, 7). cout={0:0, 1:3, 3:4, 2:7}. Pas d'arcs sortants de 2.
PQ : [(4, 7), (3, 10)]
  Defiler (4, 7). cout={0:0, 1:3, 3:4, 2:7, 4:7}. Ajouter : (3, 7+2=9)
PQ : [(3, 9), (3, 10)]
  Defiler (3, 9). Deja dans cout -> ignorer.
  Defiler (3, 10). Deja dans cout -> ignorer.
PQ vide. Termine !

Couts finaux : {0:0, 1:3, 2:7, 3:4, 4:7}
Chemin vers 4 : 0 -> 1 -> 3 -> 4
```


## Complexite

| Algorithme | Complexite temporelle | Espace |
|------------|----------------------|--------|
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |
| Dijkstra (tas binaire) | O((V + E) log V) | O(V) |
| Dijkstra (PQ tableau trie) | O(V^2 + E) | O(V) |
| Dijkstra (tas de Fibonacci) | O(V log V + E) | O(V) |

Note : Dijkstra exige des **poids non negatifs**. Pour les poids negatifs, utiliser Bellman-Ford.


## Applications dans le TP8

### Seam Carving (Recadrage intelligent)

Convertir la carte d'energie d'une image en graphe grille, utiliser Dijkstra pour trouver le chemin de moindre energie (seam), et le supprimer pour redimensionner l'image.

### Le Compte est Bon

Modeliser le jeu arithmetique comme un graphe ou les etats sont des piles de calcul (Notation Polonaise Inverse). Utiliser Dijkstra pour trouver la sequence optimale d'operations.


## AIDE-MEMOIRE

```
REPRESENTATIONS DE GRAPHE :
  Liste d'adjacence :  O(V+E) espace, O(degre) verif. arc
  Matrice d'adjacence : O(V^2) espace, O(1) verif. arc

PARCOURS :
  BFS : file, niveau par niveau, O(V+E)
  DFS : pile/recursion, en profondeur, O(V+E)

DIJKSTRA (avec tas min) :
  1. PQ.add(source, cout=0)
  2. Tant que PQ non vide :
     3. noeud = PQ.poll()
     4. Si noeud.sommet dans cout : ignorer
     5. cout[noeud.sommet] = noeud.cout
     6. Pour chaque voisin v :
        PQ.add(v, noeud.cout + poids(noeud, v))

  Temps : O((V+E) log V)
  Exige : poids non negatifs

RECONSTRUCTION DE CHEMIN :
  prev[v] = predecesseur de v sur le plus court chemin
  Suivre prev a rebours de la cible vers la source
```
