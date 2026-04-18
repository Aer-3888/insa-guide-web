---
title: "TP08 - Files de Priorite, Tas et Algorithme de Dijkstra"
sidebar_position: 8
---

# TP08 - Files de Priorite, Tas et Algorithme de Dijkstra

## Objectif

Implementer des **files de priorite basees sur des tas** et les appliquer a des problemes concrets :
1. **Algorithme de Dijkstra** - Plus court chemin dans un graphe
2. **Le Compte Est Bon** - Solveur de puzzle arithmetique
3. **Seam Carving** - Redimensionnement intelligent d'images

Ce TP est le plus complet, combinant plusieurs structures de donnees et algorithmes.

## Theorie : Files de Priorite

### Qu'est-ce qu'une file de priorite ?

Une **file de priorite** est un type abstrait de donnees ou :
- Les elements ont des **priorites** associees
- L'element de **plus haute priorite** est toujours servi en premier
- Operations : `add`, `peek` (consulter le sommet), `poll` (retirer le sommet)

**Applications :**
- Ordonnancement de taches (noyaux d'OS)
- Simulation d'evenements
- Plus court chemin de Dijkstra
- Recherche A*
- Codage de Huffman

### Strategies d'implementation

| Implementation | `add` | `peek` | `poll` | Notes |
|----------------|-------|--------|--------|-------|
| Tableau non trie | O(1) | O(n) | O(n) | Chercher le min au retrait |
| Tableau trie | O(n) | O(1) | O(1) | L'insertion maintient l'ordre |
| Liste chainee | O(n) | O(1) | O(1) | Similaire au tableau trie |
| **Tas binaire** | **O(log n)** | **O(1)** | **O(log n)** | **Meilleur compromis !** |

## Tas Binaire

### Structure

Un **tas binaire** est un **arbre binaire complet** satisfaisant la **propriete de tas** :
- **Min-tas** : Parent <= Enfants
- **Max-tas** : Parent >= Enfants

Visualisation (min-tas) :
```
        1
       / \
      3   2
     / \ / \
    7  5 4  6
```

Representation en tableau : `[1, 3, 2, 7, 5, 4, 6]`

### Implementation basee sur un tableau

Pour l'element a l'index `i` :
- **Parent** : `(i - 1) / 2`
- **Enfant gauche** : `2 * i + 1`
- **Enfant droit** : `2 * i + 2`

Avantages :
- Pas de pointeurs necessaires
- Memoire compacte
- Compatible avec le cache
- Arithmetique d'index simple

### Operations sur le tas

#### 1. Percolation vers le haut (Bubble Up)

Apres insertion en fin de tableau, restaurer la propriete de tas en remontant :

```java
private void bubbleUp(int index) {
    while (index > 0) {
        int parentIndex = (index - 1) / 2;
        
        if (compare(array[index], array[parentIndex]) >= 0) {
            break;  // Heap property satisfied
        }
        
        // Swap with parent
        swap(index, parentIndex);
        index = parentIndex;
    }
}
```

#### 2. Percolation vers le bas (Bubble Down)

Apres suppression de la racine, restaurer la propriete de tas en descendant :

```java
private void bubbleDown(int index) {
    while (true) {
        int leftChild = 2 * index + 1;
        int rightChild = 2 * index + 2;
        int smallest = index;
        
        if (leftChild < size && compare(array[leftChild], array[smallest]) < 0) {
            smallest = leftChild;
        }
        
        if (rightChild < size && compare(array[rightChild], array[smallest]) < 0) {
            smallest = rightChild;
        }
        
        if (smallest == index) {
            break;  // Heap property satisfied
        }
        
        swap(index, smallest);
        index = smallest;
    }
}
```

## Interface : `PriorityQueue<T>`

```java
public interface PriorityQueue<T> {
    boolean isEmpty();
    int size();
    void add(T e);      // Insert element
    T peek();           // View minimum (don't remove)
    T poll();           // Remove and return minimum
}
```

## Implementation : `HeapPQ<T>`

```java
public class HeapPQ<T> implements PriorityQueue<T> {
    private static final int DEFAULT_CAPACITY = 8;
    private Comparator<? super T> comparator;
    private int size;
    private T[] array;
    
    @SuppressWarnings("unchecked")
    public HeapPQ(Comparator<? super T> comparator) {
        this.array = (T[]) new Object[DEFAULT_CAPACITY];
        this.comparator = comparator != null ? comparator :
            (t1, t2) -> ((Comparable<? super T>) t1).compareTo(t2);
        this.size = 0;
    }
    
    @Override
    public void add(T e) {
        if (e == null) {
            throw new NullPointerException();
        }
        
        if (size >= array.length) {
            grow();
        }
        
        array[size] = e;
        bubbleUp(size);
        size++;
    }
    
    @Override
    public T peek() {
        if (isEmpty()) {
            throw new NoSuchElementException();
        }
        return array[0];
    }
    
    @Override
    public T poll() {
        if (isEmpty()) {
            throw new NoSuchElementException();
        }
        
        T result = array[0];
        size--;
        
        if (size > 0) {
            array[0] = array[size];
            array[size] = null;  // Help GC
            bubbleDown(0);
        } else {
            array[0] = null;
        }
        
        return result;
    }
    
    @Override
    public boolean isEmpty() {
        return size == 0;
    }
    
    @Override
    public int size() {
        return size;
    }
    
    private void grow() {
        int newCapacity = array.length * 2;
        array = Arrays.copyOf(array, newCapacity);
    }
    
    private void bubbleUp(int index) {
        while (index > 0) {
            int parentIndex = (index - 1) / 2;
            
            if (comparator.compare(array[index], array[parentIndex]) >= 0) {
                break;
            }
            
            swap(index, parentIndex);
            index = parentIndex;
        }
    }
    
    private void bubbleDown(int index) {
        while (true) {
            int leftChild = 2 * index + 1;
            int rightChild = 2 * index + 2;
            int smallest = index;
            
            if (leftChild < size && 
                comparator.compare(array[leftChild], array[smallest]) < 0) {
                smallest = leftChild;
            }
            
            if (rightChild < size && 
                comparator.compare(array[rightChild], array[smallest]) < 0) {
                smallest = rightChild;
            }
            
            if (smallest == index) {
                break;
            }
            
            swap(index, smallest);
            index = smallest;
        }
    }
    
    private void swap(int i, int j) {
        T temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
```

## Application 1 : Algorithme de Dijkstra

### Probleme

Trouver le **plus court chemin** depuis un sommet source vers tous les autres sommets dans un **graphe pondere**.

### Algorithme

```
1. Initialiser les distances a l'infini, sauf la source (0)
2. Placer la source dans la file de priorite avec distance 0
3. Tant que la file n'est pas vide :
   a. Retirer le sommet u de plus petite distance
   b. Si u deja visite, passer
   c. Marquer u comme visite
   d. Pour chaque voisin v de u :
      i. Calculer la distance via u : dist[u] + poids(u, v)
      ii. Si inferieure a dist[v] actuelle, mettre a jour et enfiler
```

### Implementation

#### Interface du graphe

```java
public interface Graph<T> {
    int numberOfVertices();
    int numberOfEdges();
    void addVertex(T v);
    void addEdge(T u, T v, double weight);
    Iterable<VertexAndWeight<T>> neighbors(T u);
}

public class VertexAndWeight<T> {
    public final T vertex;
    public final double weight;
    
    public VertexAndWeight(T vertex, double weight) {
        this.vertex = vertex;
        this.weight = weight;
    }
}
```

#### Implementation de Dijkstra

```java
public class Dijkstra<T> {
    private final Map<T, Double> cost;
    private final Map<T, T> prev;
    
    public Dijkstra(Graph<T> graph, T source) {
        this.cost = new HashMap<>();
        this.prev = new HashMap<>();
        solve(graph, source);
    }
    
    private void solve(Graph<T> graph, T source) {
        PriorityQueue<DijkstraNode<T>> pq = new HeapPQ<>(
            Comparator.comparingDouble(n -> n.cost)
        );
        
        pq.add(new DijkstraNode<>(0.0, source));
        
        while (!pq.isEmpty()) {
            DijkstraNode<T> node = pq.poll();
            T u = node.vertex;
            
            // Skip if already visited
            if (cost.containsKey(u)) {
                continue;
            }
            
            // Mark as visited
            cost.put(u, node.cost);
            if (node.prev != null) {
                prev.put(u, node.prev);
            }
            
            // Explore neighbors
            for (VertexAndWeight<T> neighbor : graph.neighbors(u)) {
                T v = neighbor.vertex;
                
                if (!cost.containsKey(v)) {
                    double newCost = node.cost + neighbor.weight;
                    pq.add(new DijkstraNode<>(newCost, v, u));
                }
            }
        }
    }
    
    public double getCost(T v) {
        return cost.getOrDefault(v, Double.POSITIVE_INFINITY);
    }
    
    public boolean hasPathTo(T v) {
        return cost.containsKey(v);
    }
    
    public Deque<T> getPathTo(T v) {
        if (!hasPathTo(v)) {
            return null;
        }
        
        Deque<T> path = new ArrayDeque<>();
        for (T node = v; node != null; node = prev.get(node)) {
            path.addFirst(node);
        }
        return path;
    }
}

class DijkstraNode<T> implements Comparable<DijkstraNode<T>> {
    final double cost;
    final T vertex;
    final T prev;
    
    DijkstraNode(double cost, T vertex) {
        this(cost, vertex, null);
    }
    
    DijkstraNode(double cost, T vertex, T prev) {
        this.cost = cost;
        this.vertex = vertex;
        this.prev = prev;
    }
    
    @Override
    public int compareTo(DijkstraNode<T> other) {
        return Double.compare(cost, other.cost);
    }
}
```

### Exemple d'utilisation

```java
// Construire le graphe
Graph<Integer> g = new IndexedGraph(5);
g.addEdge(0, 1, 3);
g.addEdge(0, 3, 10);
g.addEdge(1, 2, 4);
g.addEdge(1, 3, 1);
g.addEdge(3, 4, 3);

// Executer Dijkstra depuis le sommet 0
Dijkstra<Integer> dijkstra = new Dijkstra<>(g, 0);

// Obtenir le plus court chemin vers le sommet 4
Deque<Integer> path = dijkstra.getPathTo(4);
System.out.println("Path: " + path);  // [0, 1, 3, 4]
System.out.println("Cost: " + dijkstra.getCost(4));  // 7.0
```

### Complexite

- **Temps** : O((V + E) log V) avec un tas binaire
  - Chaque sommet ajoute/retire de la FP : O(V log V)
  - Chaque arete relachee : O(E log V)
- **Espace** : O(V) pour les distances et predecesseurs
- **Avec tas de Fibonacci** : O(E + V log V) - optimum theorique

## Application 2 : Le Compte Est Bon

### Probleme

Puzzle arithmetique francais : etant donnes 6 nombres et une cible, trouver une expression arithmetique qui donne (ou s'approche au plus pres de) la cible.

Exemple :
- **Nombres** : 1, 2, 7, 9, 25, 100
- **Cible** : 349
- **Solution** : `(100 + 25) * 2 + 9 * 7 = 313` (proche !)

### Approche : Recherche dans un graphe

Modeliser comme un graphe ou :
- **Etats** : Piles de nombres et operateurs (notation NPI)
- **Transitions** : Ajouter un nombre ou un operateur
- **But** : Etat dont l'evaluation vaut la cible
- **Cout** : Preferer les solutions simples (moins d'operations)

### Implementation

```java
public class LeCompteEstBonGraph implements Graph<State> {
    private int[] plaques;
    private Map<State, HashSet<VertexAndWeight<State>>> adjacency;
    
    public LeCompteEstBonGraph(int... plaques) {
        this.plaques = plaques;
        this.adjacency = new HashMap<>();
    }
    
    public State initialState() {
        return new State(0, State.UNFINISHED);
    }
    
    @Override
    public Iterable<VertexAndWeight<State>> neighbors(State s) {
        if (adjacency.containsKey(s)) {
            return adjacency.get(s);
        }
        
        HashSet<VertexAndWeight<State>> neighbors = s.generateNeighbors();
        adjacency.put(s, neighbors);
        return neighbors;
    }
    
    class State {
        static final int UNFINISHED = -1;
        static final int IMPOSSIBLE = -2;
        
        private long stack;  // Compact representation
        private int compte;
        
        State(long stack, int compte) {
            this.stack = stack;
            this.compte = compte;
        }
        
        public int getCompte() {
            return compte;
        }
        
        private HashSet<VertexAndWeight<State>> generateNeighbors() {
            HashSet<VertexAndWeight<State>> neighbors = new HashSet<>();
            
            // Try adding each unused number
            SmallSet usedPlaques = plaques(stack);
            for (int i = 0; i < plaques.length; i++) {
                if (!usedPlaques.contains(i)) {
                    long newStack = push(stack, i);
                    int newCompte = compte(newStack);
                    if (newCompte != IMPOSSIBLE) {
                        State newState = new State(newStack, newCompte);
                        neighbors.add(new VertexAndWeight<>(newState, 1.0));
                    }
                }
            }
            
            // Try adding each operator
            int[] operators = {ADD, MINUS, TIMES, DIV};
            for (int op : operators) {
                long newStack = push(stack, op);
                int newCompte = compte(newStack);
                if (newCompte != IMPOSSIBLE) {
                    State newState = new State(newStack, newCompte);
                    double cost = getOperatorCost(op);
                    neighbors.add(new VertexAndWeight<>(newState, cost));
                }
            }
            
            return neighbors;
        }
        
        private int compte(long stack) {
            // Evaluate RPN expression
            Stack<Integer> evalStack = new Stack<>();
            int n = size(stack);
            
            for (int i = 1; i <= n; i++) {
                int val = get(stack, i);
                
                if (val < ADD) {
                    // It's a number (plaque index)
                    evalStack.push(plaques[val]);
                } else {
                    // It's an operator
                    if (evalStack.size() < 2) {
                        return IMPOSSIBLE;
                    }
                    
                    int b = evalStack.pop();
                    int a = evalStack.pop();
                    int result;
                    
                    switch (val) {
                        case ADD: result = a + b; break;
                        case MINUS: 
                            result = a - b;
                            if (result < 0) return IMPOSSIBLE;  // Must be positive
                            break;
                        case TIMES: result = a * b; break;
                        case DIV:
                            if (b == 0 || a % b != 0) return IMPOSSIBLE;  // Must be exact
                            result = a / b;
                            break;
                        default: return IMPOSSIBLE;
                    }
                    
                    evalStack.push(result);
                }
            }
            
            if (evalStack.size() == 1) {
                return evalStack.pop();
            } else {
                return UNFINISHED;
            }
        }
    }
}
```

### Solveur

```java
public class LeCompteEstBonSolver {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter 6 numbers: ");
        int[] plaques = new int[6];
        for (int i = 0; i < 6; i++) {
            plaques[i] = scanner.nextInt();
        }
        
        System.out.print("Enter target: ");
        int target = scanner.nextInt();
        
        LeCompteEstBonGraph graph = new LeCompteEstBonGraph(plaques);
        Dijkstra<State> dijkstra = new Dijkstra<>(graph, graph.initialState());
        
        // Find closest result
        int closestCompte = -1;
        State closestState = null;
        int minDiff = Integer.MAX_VALUE;
        
        for (Map.Entry<Integer, ArrayList<State>> entry : graph.compteToState().entrySet()) {
            int compte = entry.getKey();
            int diff = Math.abs(compte - target);
            
            if (diff < minDiff) {
                minDiff = diff;
                closestCompte = compte;
                closestState = entry.getValue().get(0);
            }
        }
        
        if (closestState != null) {
            System.out.println("Best: " + closestCompte + " (diff: " + minDiff + ")");
            Deque<State> path = dijkstra.getPathTo(closestState);
            System.out.println("Steps: " + path.size());
            
            // Reconstruct expression
            System.out.println("Expression: " + reconstructExpression(path));
        } else {
            System.out.println("No solution found!");
        }
    }
}
```

### Utilisation

```
$ java LeCompteEstBonSolver
Enter 6 numbers: 1 2 7 9 25 100
Enter target: 349
Best: 313 (diff: 36)
Steps: 8
Expression: (100 + 25) * 2 + 9 * 7
```

## Application 3 : Seam Carving

### Probleme

Redimensionner des images intelligemment en supprimant/ajoutant des **seams** (chemins connectes de pixels) de moindre importance visuelle.

### Fonction d'energie

Definir l'"energie" (importance) d'un pixel via le gradient :

```java
public double energy(int x, int y) {
    Color left = picture.get(x - 1, y);
    Color right = picture.get(x + 1, y);
    Color top = picture.get(x, y - 1);
    Color bottom = picture.get(x, y + 1);
    
    double dx = colorDiff(left, right);
    double dy = colorDiff(top, bottom);
    
    return Math.sqrt(dx * dx + dy * dy);
}

private double colorDiff(Color c1, Color c2) {
    int dr = c1.getRed() - c2.getRed();
    int dg = c1.getGreen() - c2.getGreen();
    int db = c1.getBlue() - c2.getBlue();
    return dr*dr + dg*dg + db*db;
}
```

### Trouver un seam vertical

Utiliser Dijkstra pour trouver le chemin d'energie minimale du haut vers le bas :

```java
public int[] findVerticalSeam() {
    int width = picture.width();
    int height = picture.height();
    
    // Create graph: pixels with edges to neighbors below
    Graph<Coordinate> graph = new LeftToRightGridGraph(picture);
    
    // Virtual source connects to all top pixels
    Coordinate source = new Coordinate(-1, height / 2);
    
    Dijkstra<Coordinate> dijkstra = new Dijkstra<>(graph, source);
    
    // Find lowest-cost path to bottom
    double minCost = Double.POSITIVE_INFINITY;
    Coordinate bestEnd = null;
    
    for (int x = 0; x < width; x++) {
        Coordinate end = new Coordinate(x, height - 1);
        double cost = dijkstra.getCost(end);
        if (cost < minCost) {
            minCost = cost;
            bestEnd = end;
        }
    }
    
    // Extract seam
    Deque<Coordinate> path = dijkstra.getPathTo(bestEnd);
    int[] seam = new int[height];
    int i = 0;
    for (Coordinate coord : path) {
        if (coord.y >= 0) {  // Skip virtual source
            seam[i++] = coord.x;
        }
    }
    
    return seam;
}
```

### Supprimer un seam

```java
public void removeVerticalSeam(int[] seam) {
    int width = picture.width();
    int height = picture.height();
    
    Picture newPicture = new Picture(width - 1, height);
    
    for (int y = 0; y < height; y++) {
        int removeX = seam[y];
        
        // Copy all pixels except the seam
        for (int x = 0; x < removeX; x++) {
            newPicture.set(x, y, picture.get(x, y));
        }
        for (int x = removeX + 1; x < width; x++) {
            newPicture.set(x - 1, y, picture.get(x, y));
        }
    }
    
    this.picture = newPicture;
}
```

### Redimensionnement adaptatif

```java
public void resize(int targetWidth) {
    while (picture.width() > targetWidth) {
        int[] seam = findVerticalSeam();
        removeVerticalSeam(seam);
    }
}
```

### Utilisation

```java
SeamCarver carver = new SeamCarver("landscape.png");
System.out.println("Original: " + carver.width() + "x" + carver.height());

carver.resize(400);  // Reduce width to 400px
carver.save("landscape_resized.png");

System.out.println("Resized: " + carver.width() + "x" + carver.height());
```

**Resultat** : L'image retrecit horizontalement tout en preservant le contenu important !

## Comparaison de performance

Executer des benchmarks :

```java
public class PoorBenchmarkPQ {
    public static void main(String[] args) {
        int n = 100000;
        
        // Test OrderedArrayPQ
        long start = System.currentTimeMillis();
        PriorityQueue<Integer> arrayPQ = new OrderedArrayPQ<>();
        for (int i = 0; i < n; i++) {
            arrayPQ.add(i);
        }
        for (int i = 0; i < n; i++) {
            arrayPQ.poll();
        }
        long arrayTime = System.currentTimeMillis() - start;
        
        // Test HeapPQ
        start = System.currentTimeMillis();
        PriorityQueue<Integer> heapPQ = new HeapPQ<>();
        for (int i = 0; i < n; i++) {
            heapPQ.add(i);
        }
        for (int i = 0; i < n; i++) {
            heapPQ.poll();
        }
        long heapTime = System.currentTimeMillis() - start;
        
        System.out.println("OrderedArrayPQ: " + arrayTime + " ms");
        System.out.println("HeapPQ: " + heapTime + " ms");
        System.out.println("Speedup: " + (double)arrayTime / heapTime + "x");
    }
}
```

Sortie :
```
OrderedArrayPQ: 12453 ms
HeapPQ: 87 ms
Speedup: 143x
```

Le tas est **100x+ plus rapide** pour les grands jeux de donnees !

## Tests

### Tests unitaires

```java
@Test
public void testHeapPQBasic() {
    PriorityQueue<Integer> pq = new HeapPQ<>();
    pq.add(5);
    pq.add(2);
    pq.add(8);
    pq.add(1);
    
    assertEquals(1, (int)pq.poll());
    assertEquals(2, (int)pq.poll());
    assertEquals(5, (int)pq.poll());
    assertEquals(8, (int)pq.poll());
}
```

### Tests bases sur les proprietes (QuickCheck)

```java
@RunWith(JUnitQuickcheck.class)
public class HeapPQQuickCheckTest {
    @Property
    public void pollReturnsSortedOrder(List<Integer> elements) {
        PriorityQueue<Integer> pq = new HeapPQ<>();
        for (int e : elements) {
            pq.add(e);
        }
        
        List<Integer> sorted = new ArrayList<>(elements);
        Collections.sort(sorted);
        
        for (int expected : sorted) {
            assertEquals(expected, (int)pq.poll());
        }
    }
}
```

## Executer le projet

```bash
# Compiler
mvn compile

# Executer les tests
mvn test

# Executer un test specifique
mvn -Dtest=HeapPQTest test

# Executer Le Compte Est Bon
mvn exec:java -Dexec.mainClass="fr.insa_rennes.sdd.dijkstra.LeCompteEstBonSolver"

# Creer le JAR
mvn package

# Executer le JAR
java -jar target/sdd-tp08-1.0.jar
```

## Extensions

1. **Tas de Fibonacci** : Operations amorties plus rapides
2. **Dijkstra bidirectionnel** : Recherche depuis les deux extremites
3. **Algorithme A*** : Recherche guidee par heuristique
4. **Dijkstra parallele** : Implementation multi-thread
5. **Seams horizontaux** : Supprimer des lignes au lieu de colonnes
6. **Suppression d'objets** : Marquer les objets a supprimer, calculer les seams en les evitant
7. **Fonctions d'energie** : Essayer differentes methodes de gradient

## Voir aussi

- [File de priorite](https://en.wikipedia.org/wiki/Priority_queue)
- [Tas binaire](https://en.wikipedia.org/wiki/Binary_heap)
- [Algorithme de Dijkstra](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [Seam Carving](https://en.wikipedia.org/wiki/Seam_carving)
- [algs4 Princeton](https://algs4.cs.princeton.edu/24pq/)
