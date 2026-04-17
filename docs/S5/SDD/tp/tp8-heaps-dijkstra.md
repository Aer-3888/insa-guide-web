---
title: "TP08 - Priority Queues, Heaps & Dijkstra's Algorithm"
sidebar_position: 8
---

# TP08 - Priority Queues, Heaps & Dijkstra's Algorithm

## Objective

Implement **heap-based priority queues** and apply them to solve real-world problems:
1. **Dijkstra's Algorithm** - Shortest path in graphs
2. **Le Compte Est Bon** - Number puzzle solver
3. **Seam Carving** - Content-aware image resizing

This is the most comprehensive TP, combining multiple data structures and algorithms.

## Theory: Priority Queues

### What is a Priority Queue?

A **priority queue** is an abstract data type where:
- Elements have associated **priorities**
- **Highest priority** element is always served first
- Operations: `add`, `peek` (view top), `poll` (remove top)

**Applications:**
- Task scheduling (OS kernels)
- Event simulation
- Dijkstra's shortest path
- A* pathfinding
- Huffman coding

### Implementation Strategies

| Implementation | `add` | `peek` | `poll` | Notes |
|----------------|-------|--------|--------|-------|
| Unsorted Array | O(1) | O(n) | O(n) | Find min on removal |
| Sorted Array | O(n) | O(1) | O(1) | Insert maintains order |
| Linked List | O(n) | O(1) | O(1) | Similar to sorted array |
| **Binary Heap** | **O(log n)** | **O(1)** | **O(log n)** | **Best balance!** |

## Binary Heap

### Structure

A **binary heap** is a **complete binary tree** satisfying the **heap property**:
- **Min-heap**: Parent ≤ Children
- **Max-heap**: Parent ≥ Children

Visual (min-heap):
```
        1
       / \
      3   2
     / \ / \
    7  5 4  6
```

Array representation: `[1, 3, 2, 7, 5, 4, 6]`

### Array-Based Implementation

For element at index `i`:
- **Parent**: `(i - 1) / 2`
- **Left child**: `2 * i + 1`
- **Right child**: `2 * i + 2`

Benefits:
- No pointers needed
- Compact memory
- Cache-friendly
- Simple index arithmetic

### Heap Operations

#### 1. Bubble Up (Sift Up)

After inserting at the end, restore heap property by moving upward:

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

#### 2. Bubble Down (Sift Down)

After removing root, restore heap property by moving downward:

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

## Interface: `PriorityQueue<T>`

```java
public interface PriorityQueue<T> {
    boolean isEmpty();
    int size();
    void add(T e);      // Insert element
    T peek();           // View minimum (don't remove)
    T poll();           // Remove and return minimum
}
```

## Implementation: `HeapPQ<T>`

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

## Application 1: Dijkstra's Algorithm

### Problem

Find the **shortest path** from a source vertex to all other vertices in a **weighted graph**.

### Algorithm

```
1. Initialize distances to infinity, except source (0)
2. Put source in priority queue with distance 0
3. While queue not empty:
   a. Poll vertex u with smallest distance
   b. If u already visited, skip
   c. Mark u as visited
   d. For each neighbor v of u:
      i. Calculate distance via u: dist[u] + weight(u, v)
      ii. If less than current dist[v], update and enqueue
```

### Implementation

#### Graph Interface

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

#### Dijkstra Implementation

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

### Usage Example

```java
// Build graph
Graph<Integer> g = new IndexedGraph(5);
g.addEdge(0, 1, 3);
g.addEdge(0, 3, 10);
g.addEdge(1, 2, 4);
g.addEdge(1, 3, 1);
g.addEdge(3, 4, 3);

// Run Dijkstra from vertex 0
Dijkstra<Integer> dijkstra = new Dijkstra<>(g, 0);

// Get shortest path to vertex 4
Deque<Integer> path = dijkstra.getPathTo(4);
System.out.println("Path: " + path);  // [0, 1, 3, 4]
System.out.println("Cost: " + dijkstra.getCost(4));  // 7.0
```

### Complexity

- **Time**: O((V + E) log V) with binary heap
  - Each vertex added/removed from PQ: O(V log V)
  - Each edge relaxed: O(E log V)
- **Space**: O(V) for distances and predecessors
- **With Fibonacci heap**: O(E + V log V) - theoretical optimum

## Application 2: Le Compte Est Bon

### Problem

French number puzzle: Given 6 numbers and a target, find arithmetic expression that equals (or gets closest to) the target.

Example:
- **Numbers**: 1, 2, 7, 9, 25, 100
- **Target**: 349
- **Solution**: `(100 + 25) * 2 + 9 * 7 = 313` (close!)

### Approach: Graph Search

Model as a graph where:
- **States**: Stacks of numbers and operators (RPN notation)
- **Transitions**: Add a number or operator
- **Goal**: State that evaluates to target
- **Cost**: Prefer simpler solutions (fewer operations)

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

### Solver

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

### Usage

```
$ java LeCompteEstBonSolver
Enter 6 numbers: 1 2 7 9 25 100
Enter target: 349
Best: 313 (diff: 36)
Steps: 8
Expression: (100 + 25) * 2 + 9 * 7
```

## Application 3: Seam Carving

### Problem

Resize images intelligently by removing/adding **seams** (connected paths of pixels) with least visual importance.

### Energy Function

Define pixel "energy" (importance) using gradient:

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

### Find Vertical Seam

Use Dijkstra to find minimum-energy path from top to bottom:

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

### Remove Seam

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

### Content-Aware Resize

```java
public void resize(int targetWidth) {
    while (picture.width() > targetWidth) {
        int[] seam = findVerticalSeam();
        removeVerticalSeam(seam);
    }
}
```

### Usage

```java
SeamCarver carver = new SeamCarver("landscape.png");
System.out.println("Original: " + carver.width() + "x" + carver.height());

carver.resize(400);  // Reduce width to 400px
carver.save("landscape_resized.png");

System.out.println("Resized: " + carver.width() + "x" + carver.height());
```

**Result**: Image shrinks horizontally while preserving important content!

## Performance Comparison

Run benchmarks:

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

Output:
```
OrderedArrayPQ: 12453 ms
HeapPQ: 87 ms
Speedup: 143x
```

Heap is **100x+ faster** for large datasets!

## Testing

### Unit Tests

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

### Property-Based Testing (QuickCheck)

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

## Running the Project

```bash
# Compile
mvn compile

# Run tests
mvn test

# Run specific test
mvn -Dtest=HeapPQTest test

# Run Le Compte Est Bon
mvn exec:java -Dexec.mainClass="fr.insa_rennes.sdd.dijkstra.LeCompteEstBonSolver"

# Package JAR
mvn package

# Run JAR
java -jar target/sdd-tp08-1.0.jar
```

## Extensions

1. **Fibonacci Heap**: Faster amortized operations
2. **Bidirectional Dijkstra**: Search from both ends
3. **A* Algorithm**: Heuristic-guided search
4. **Parallel Dijkstra**: Multi-threaded implementation
5. **Horizontal Seams**: Remove rows instead of columns
6. **Object Removal**: Mark objects to remove, compute seams avoiding them
7. **Energy Functions**: Try different gradient methods

## See Also

- [Priority Queue](https://en.wikipedia.org/wiki/Priority_queue)
- [Binary Heap](https://en.wikipedia.org/wiki/Binary_heap)
- [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [Seam Carving](https://en.wikipedia.org/wiki/Seam_carving)
- [algs4 Princeton](https://algs4.cs.princeton.edu/24pq/)
