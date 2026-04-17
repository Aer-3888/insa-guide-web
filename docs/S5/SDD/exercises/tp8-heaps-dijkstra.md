---
title: "TP8 - Files de Priorite, Dijkstra, Le Compte Est Bon et Seam Carving"
sidebar_position: 8
---

# TP8 - Files de Priorite, Dijkstra, Le Compte Est Bon et Seam Carving

> Following teacher instructions from: `S5/SDD/data/moodle/tp/tp_final_project/README.md`

Il y a 4 parties dans ce TP : implementation de files de priorite, algorithme de Dijkstra, solveur du jeu "Le Compte Est Bon", et recadrage intelligent (Seam Carving).

## Preparation

Le projet est realise avec Maven. Commandes utiles :
```bash
mvn test                                    # Lancer tous les tests
mvn -Dtest=HeapPQTest test                  # Lancer un test specifique
mvn package                                 # Construire le JAR
mvn exec:java -Dexec.mainClass="fr.insa_rennes.sdd.dijkstra.LeCompteEstBonSolver"
```

## Fichiers

| Fichier | Package | Statut |
|---------|---------|--------|
| `PriorityQueue.java` | priority_queue | Fourni -- interface |
| `OrderedArrayPQ.java` | priority_queue | Fourni -- implementation O(n) de reference |
| `HeapPQ.java` | priority_queue | **A completer** |
| `Graph.java` | graph | Fourni -- interface |
| `IndexedGraph.java` | graph | Fourni -- implementation avec sommets entiers |
| `VertexAndWeight.java` | graph | Fourni -- couple (sommet, poids) |
| `Coordinate.java` | graph | Fourni -- (row, col) avec singletons Left/Right/Top/Bottom |
| `LeftToRightGridGraph.java` | graph | Fourni -- graphe grille pour seams horizontaux |
| `TopToBottomGridGraph.java` | graph | Fourni -- graphe grille pour seams verticaux |
| `DijkstraNode.java` | dijkstra | Fourni -- (cost, vertex, prev) |
| `FactoryPQ.java` | dijkstra | Fourni -- cree une PQ par nom |
| `Dijkstra.java` | dijkstra | **Completer solve() et getPathTo()** |
| `LeCompteEstBonGraph.java` | graph | **Completer compte() et neighbors()** |
| `LeCompteEstBonSolver.java` | dijkstra | Fourni -- programme principal |
| `SeamCarver.java` | seam_carving | Fourni -- base abstraite avec energie |
| `SeamCarverDijkstra.java` | seam_carving | **Completer les 3 methodes** |
| `SeamCarverDP.java` | seam_carving | **Completer les 3 methodes** |

---

## I. Files de priorite

L'interface des files de priorite se trouve dans le package `fr.insa_rennes.sdd.priority_queue` :

```java
public interface PriorityQueue<T> {
  boolean isEmpty();
  int size();
  void add(T e);
  T peek();
  T poll();
}
```

On fournit une implementation peu efficace dans la classe `OrderedArrayPQ<T>`. Deux points importants a reutiliser :

1) Le comparateur Java (ligne 3) qui permet d'ordonner les elements. L'utilisateur peut le fournir au constructeur, sinon on utilise l'ordre naturel du type `T` (pour les `Comparable`).

2) La methode `grow` (ligne 25) pour redimensionner le tableau si celui-ci devient trop petit.

### Exercice I.1

### Completer la classe HeapPQ pour implementer une file de priorite efficace en utilisant un tas

Votre implementation devrait avoir une complexite en O(log n) pour les methodes `add` et `poll` (contre O(n) pour `OrderedArrayPQ`).

**Answer:**

```java
package fr.insa_rennes.sdd.priority_queue;

import fr.insa_rennes.sdd.util.ArraySupport;
import java.util.Arrays;
import java.util.Comparator;

public class HeapPQ<T> implements PriorityQueue<T> {
    private static final int DEFAULT_INITIAL_CAPACITY = 8;
    private Comparator<? super T> comparator;
    private int size;
    T[] heap;

    public HeapPQ() { this(DEFAULT_INITIAL_CAPACITY, null); }
    public HeapPQ(int initialCapacity) { this(initialCapacity, null); }
    public HeapPQ(Comparator<? super T> comparator) {
        this(DEFAULT_INITIAL_CAPACITY, comparator);
    }

    @SuppressWarnings("unchecked")
    public HeapPQ(int initialCapacity, Comparator<? super T> comparator) {
        if (initialCapacity < 1) throw new IllegalArgumentException();
        heap = (T[]) new Object[initialCapacity];
        this.comparator = comparator == null
            ? (t1, t2) -> ((Comparable<? super T>) t1).compareTo(t2)
            : comparator;
    }

    // --- Arithmetique des indices ---
    private int parent(int i) { return (i - 1) / 2; }
    private int leftChild(int i) { return 2 * i + 1; }
    private int rightChild(int i) { return 2 * i + 2; }

    private void swap(int i, int j) {
        T tmp = heap[i]; heap[i] = heap[j]; heap[j] = tmp;
    }

    private int compare_at(int i, int j) {
        return comparator.compare(heap[i], heap[j]);
    }

    // --- Operations du tas ---
    private void shiftUp(int i) {
        while (i > 0 && compare_at(parent(i), i) > 0) {
            swap(parent(i), i);
            i = parent(i);
        }
    }

    private void shiftDown(int i) {
        boolean finish = false;
        int k = i;
        while (k < size / 2 && !finish) {
            int index = leftChild(k);
            if (rightChild(k) < size && compare_at(index, rightChild(k)) > 0)
                index = rightChild(k);
            if (compare_at(index, k) > 0)
                finish = true;
            else {
                swap(k, index);
                k = index;
            }
        }
    }

    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public int size() { return size; }

    @Override
    public void add(T e) {
        if (e == null) throw new NullPointerException();
        if (size >= heap.length) grow();
        heap[size] = e;
        shiftUp(size);
        size++;
    }

    @Override
    public T peek() {
        return (size == 0) ? null : heap[0];
    }

    @Override
    public T poll() {
        if (size == 0) return null;
        T result = heap[0];
        heap[0] = heap[size - 1];
        size--;
        shiftDown(0);
        return result;
    }

    private void grow() {
        int oldLength = heap.length;
        heap = Arrays.copyOf(heap,
            ArraySupport.newLength(oldLength, oldLength + 1, oldLength << 1));
    }
}
```

**How the code works:**
- **shiftUp (remonter)** : Apres insertion a la fin, comparer avec le parent et echanger vers le haut jusqu'a restaurer la propriete de tas. O(log n).
- **shiftDown (descendre)** : Apres suppression de la racine (remplacee par le dernier element), comparer avec les enfants et echanger vers le bas. Toujours echanger avec l'enfant le *plus petit*. O(log n).

Tester dans l'ordre : `HeapPQTest`, `HeapPQQuickCheckTest`, `AllPQQuickCheckTest`.

Executer le benchmark `PoorBenchmarkPQ` pour comparer : HeapPQ est 100x+ plus rapide que OrderedArrayPQ pour 100 000 elements.

---

## II. Dijkstra

L'interface `Graph<T>` du package `fr.insa_rennes.sdd.graph` :

```java
public interface Graph<T> {
    int numberOfVertices();
    int numberOfEdges();
    void addVertex(T v);
    void addEdge(T u, T v, double weight);
    Iterable<VertexAndWeight<T>> neighbors(T u);
}
```

Exemple de graphe :
```java
Graph<Integer> g = new IndexedGraph(5);
g.addEdge(0, 1, 3);
g.addEdge(0, 3, 10);
g.addEdge(1, 2, 4);
g.addEdge(1, 3, 1);
g.addEdge(3, 4, 3);
g.addEdge(4, 3, 2);
```

La classe `Dijkstra<T>` a completer :

```java
public class Dijkstra<T> {
    private final PriorityQueue<DijkstraNode<T>> pq;
    private final Map<T, Double> cost = new HashMap<>();
    private final Map<T, T> prev = new HashMap<>();

    public Dijkstra(Graph<T> graph, T source) {
        this(graph, source, FactoryPQ.newInstance("HeapPQ"));
    }

    public Dijkstra(Graph<T> graph, T source, PriorityQueue<DijkstraNode<T>> pq) {
        this.pq = pq;
        solve(graph, source);
    }

    private void solve(Graph<T> graph, T source) {
      // TO DO
    }

    public Deque<T> getPathTo(T v) {
      // TO DO
    }

    public double getCost(T v) {
        return cost.getOrDefault(v, Double.POSITIVE_INFINITY);
    }

    public boolean hasPathTo(T v) {
        return getCost(v) != Double.POSITIVE_INFINITY;
    }
}
```

L'algorithme de Dijkstra avec une file de priorite :

1. Initialement, on met dans `pq` la source avec une distance de 0.
2. Tant que `pq` n'est pas vide,
   3. On retire le premier `DijkstraNode n` de la file.
   4. On regarde si le sommet `n.vertex` a deja ete traite (present dans `cost`). Si oui, on va en 2, sinon on continue.
   5. On met a jour les tables `cost` et `prev` grace a `n`.
   6. Pour chaque voisin `v` de `n.vertex`,
      7. On calcule la distance a `v` et on ajoute un nouveau `DijkstraNode` a `pq`.

### Exercice II.1

### Implementer la methode solve() de Dijkstra

**Answer:**

```java
private void solve(Graph<T> graph, T source) {
    if (graph == null) throw new IllegalArgumentException("Null graph");
    if (source == null) throw new IllegalArgumentException("Null source");

    // Etape 1 : inserer la source
    this.pq.add(new DijkstraNode<T>(0.0, source));

    // Etape 2 : boucle principale
    while (!this.pq.isEmpty()) {
        // Etape 3 : retirer le minimum
        DijkstraNode<T> node = this.pq.poll();

        // Etape 4 : ignorer si deja visite
        if (this.cost.containsKey(node.vertex)) continue;

        // Etape 5 : enregistrer
        this.cost.put(node.vertex, node.cost);
        this.prev.put(node.vertex, node.prev);

        // Etape 6 : relacher les voisins
        for (VertexAndWeight<T> neighbor : graph.neighbors(node.vertex)) {
            // Etape 7 : calculer la distance et ajouter a pq
            this.pq.add(new DijkstraNode<T>(
                neighbor.weight + node.cost,
                neighbor.vertex,
                node.vertex));
        }
    }
}
```

**How the code works:**
C'est l'implementation "LazyDijkstra" : on peut ajouter le meme sommet plusieurs fois dans la PQ avec des couts differents. L'etape 4 (`if (cost.containsKey(node.vertex)) continue`) ignore les doublons. C'est plus simple qu'une approche "decrease-key" et fonctionne bien avec notre tas.

### Exercice II.2

### Implementer la methode getPathTo() de Dijkstra

`Deque<T> getPathTo(T v)` rend une collection qui donne le chemin pour aller de la source vers le sommet `v`. Grace a la table `prev`, on peut connaitre le predecesseur de `v`, puis le predecesseur du predecesseur et ainsi de suite, jusqu'a retomber sur le sommet source.

**Answer:**

```java
public Deque<T> getPathTo(T v) {
    if (v == null) throw new IllegalArgumentException("Null target");
    Deque<T> path = new ArrayDeque<T>();
    path.push(v);
    T road = v;
    while (this.cost.get(road) != 0) {
        road = this.prev.get(road);
        path.push(road);
    }
    return path;
}
```

**How the code works:**
Partir de la cible, suivre les pointeurs `prev` en arriere vers la source (qui a un cout de 0). Chaque etape ajoute au debut du deque, donc le resultat final est ordonne source-vers-cible.

Tester : `mvn -Dtest=DijkstraTest test`

---

## III. Le Compte Est Bon

On va utiliser l'algorithme de Dijkstra pour realiser un solveur du jeu "Le Compte Est Bon". Le code du solveur est donne dans `LeCompteEstBonSolver`. Il reste a creer le graphe qui represente l'espace de recherche.

La classe `LeCompteEstBonGraph` :
- `plaques` : les 6 plaques du jeu (ex: `{1, 2, 7, 9, 25, 100}`)
- `operatorsCost` : le cout des operateurs `+`, `-`, `*`, `/` (defaut: 1, 1, 2, 6)
- Constantes : `ADD=6`, `MINUS=7`, `TIMES=8`, `DIV=9`
- La classe `State` represente les calculs en notation polonaise inverse (NPI)

La pile `stack` est representee dans un `long` pour l'efficacite. Exemple pour `plaques = {1, 3, 7, 10, 25, 100}` et le calcul `10 25 3 + *` :
```
             +-------+
           5 | TIMES |
             +-------+
           4 |  ADD  |
             +-------+
           3 |   1   |     <- indice de 3 dans plaques
             +-------+
           2 |   4   |     <- indice de 25 dans plaques
             +-------+
           1 |   3   |     <- indice de 10 dans plaques
             +-------+
           0 |   5   |     <- taille de la pile
             +-------+
```

Les methodes utilitaires : `get(stack, index)`, `size(stack)`, `push(stack, v)`.

### Exercice III.1

### Completer la methode `int compte(long stack)` dans la classe State

Cette methode prend une pile de calcul en parametre et rend le resultat du calcul. Si la pile ne represente pas un calcul valide, rend `IMPOSSIBLE`. Si le calcul n'est pas encore termine, retourne `UNFINISHED`.

**Answer:**

```java
private int compte(long stack) {
    Deque<Integer> calc = new ArrayDeque<>();
    for (int idx = 1; idx <= this.size(stack); idx++) {
        int data = this.get(stack, idx);
        switch (data) {
            case TIMES: {
                if (calc.size() < 2) return IMPOSSIBLE;
                calc.push(calc.pop() * calc.pop());
                break;
            }
            case MINUS: {
                if (calc.size() < 2) return IMPOSSIBLE;
                int potres = -calc.pop() + calc.pop();
                if (potres < 0) return IMPOSSIBLE;  // Resultat doit etre positif
                calc.push(potres);
                break;
            }
            case ADD: {
                if (calc.size() < 2) return IMPOSSIBLE;
                calc.push(calc.pop() + calc.pop());
                break;
            }
            case DIV: {
                if (calc.size() < 2) return IMPOSSIBLE;
                int opa = calc.pop();
                int opb = calc.pop();
                int potres = opb / opa;
                if (potres * opa != opb) return IMPOSSIBLE;  // Division entiere
                calc.push(potres);
                break;
            }
            default: {
                calc.push(plaques[data]);  // C'est un indice de plaque
            }
        }
    }
    if (calc.size() > 1) return UNFINISHED;
    if (calc.size() == 1) return calc.pop();
    return UNFINISHED;
}
```

**How the code works:**
Regles du jeu appliquees :
- La soustraction doit donner un resultat positif (`potres < 0` => IMPOSSIBLE)
- La division doit etre entiere (`potres * opa != opb` => IMPOSSIBLE)
- Si la pile a >1 nombre restant, le calcul est UNFINISHED

Tester : `mvn -Dtest=LeCompteEstBonGraphTest#testCompte test`

### Exercice III.2

### Completer la methode `HashSet<VertexAndWeight<State>> neighbors()` dans la classe State

La methode `neighbors` genere tous les etats possibles successeurs de l'etat courant. On essaie d'ajouter chaque plaque non utilisee ou chaque operateur a l'etat courant.

Dans le jeu, on ne peut utiliser qu'une seule fois une plaque donnee.

Exemple : si `plaques = {1, 3, 7, 10, 25, 100}` et l'etat courant a la pile `[4, 3, 4, 1, ADD]` (compte: UNFINISHED), les voisins seront les etats obtenus en poussant : ADD, TIMES, la plaque 0 (indice de 1), la plaque 2 (indice de 7), la plaque 5 (indice de 100).

**Answer:**

```java
private HashSet<VertexAndWeight<State>> neighbors() {
    HashSet<VertexAndWeight<State>> res = new HashSet<>();
    // Determiner les plaques deja utilisees et calculer le cout courant
    HashSet<Integer> haveplaques = new HashSet<>();
    int cost = 0;
    for (int idx = 1; idx <= this.size(this.stack); idx++) {
        int data = this.get(this.stack, idx);
        try {
            cost += getOperatorCost(data);
        } catch (ArrayIndexOutOfBoundsException e) {
            haveplaques.add(data);
            cost += 1;
        }
    }

    // Essayer chaque operateur
    int[] ops = {ADD, MINUS, DIV, TIMES};
    for (int op : ops) {
        long opstack = this.push(stack, op);
        State opstate = new State(opstack, this.compte(opstack));
        if (opstate.compte == IMPOSSIBLE) continue;
        res.add(new VertexAndWeight<>(opstate,
            cost + getOperatorCost(op)));
    }

    // Essayer chaque plaque non utilisee
    for (int pl = 0; pl < plaques.length; pl++) {
        if (haveplaques.contains(pl)) continue;
        long nstack = this.push(stack, pl);
        State nstate = new State(nstack, this.compte(nstack));
        if (nstate.compte == IMPOSSIBLE) continue;
        res.add(new VertexAndWeight<>(nstate, cost + 1));
    }

    return res;
}
```

**How the code works:**
- Les plaques sont suivies par index (0-5 dans le tableau `plaques`), pas par valeur. Cela permet la detection efficace des doublons.
- Modele de cout : chaque plaque coute 1. Les operateurs ont des couts configurables (defaut : `+`=1, `-`=1, `*`=2, `/`=6). Les operateurs couteux sont evites par Dijkstra, preferant les solutions plus simples.

Tester : `mvn -Dtest=LeCompteEstBonGraphTest#testNeighbors test`

Lancer l'application :
```bash
mvn package
mvn exec:java -Dexec.mainClass="fr.insa_rennes.sdd.dijkstra.LeCompteEstBonSolver"
```

---

## IV. Recadrage intelligent (Seam Carving)

Le recadrage intelligent utilise une recherche de plus court chemin pour trouver les pixels a supprimer dans l'image. La methode `energyMap()` calcule l'energie de chaque pixel (importance basee sur les differences d'intensite avec les voisins).

Pour reduire verticalement, on considere la matrice d'energie comme un graphe avec des sommets supplementaires `Left` et `Right`. Pour reduire horizontalement, on utilise `Top` et `Bottom`.

Les classes `LeftToRightGridGraph` et `TopToBottomGridGraph` construisent ces graphes a partir de la matrice d'energie.

### Exercice IV.1

### Completer la classe SeamCarverDijkstra

Completer les methodes `horizontalSeam()`, `verticalSeam()` et `reduceToSize()`.

- `Deque<Coordinate> horizontalSeam()` rend les coordonnees du plus court chemin entre `Left` et `Right` (sans Left et Right).
- `Deque<Coordinate> verticalSeam()` rend les coordonnees du plus court chemin entre `Top` et `Bottom` (sans Top et Bottom).
- `void reduceToSize(int width, int height)` reduit l'image aux dimensions `width x height`. Utiliser `cropHorizontal` et `cropVertical`.

**Answer:**

```java
package fr.insa_rennes.sdd.seam_carving;

import java.util.Deque;
import java.util.function.BiFunction;
import fr.insa_rennes.sdd.dijkstra.Dijkstra;
import fr.insa_rennes.sdd.graph.Coordinate;
import fr.insa_rennes.sdd.graph.LeftToRightGridGraph;
import fr.insa_rennes.sdd.graph.TopToBottomGridGraph;

public class SeamCarverDijkstra extends SeamCarver {

    public SeamCarverDijkstra(Picture picture) { super(picture); }
    public SeamCarverDijkstra(Picture picture,
            BiFunction<Double, Double, Double> energyFunction) {
        super(picture, energyFunction);
    }

    @Override
    public Deque<Coordinate> horizontalSeam() {
        double[][] energy = energyMap();
        LeftToRightGridGraph graph = new LeftToRightGridGraph(energy);
        Dijkstra<Coordinate> dijkstra =
            new Dijkstra<>(graph, Coordinate.LEFT);
        Deque<Coordinate> path = dijkstra.getPathTo(Coordinate.RIGHT);
        // Retirer les noeuds virtuels Left et Right
        path.removeFirst();
        path.removeLast();
        return path;
    }

    @Override
    public Deque<Coordinate> verticalSeam() {
        double[][] energy = energyMap();
        TopToBottomGridGraph graph = new TopToBottomGridGraph(energy);
        Dijkstra<Coordinate> dijkstra =
            new Dijkstra<>(graph, Coordinate.TOP);
        Deque<Coordinate> path = dijkstra.getPathTo(Coordinate.BOTTOM);
        // Retirer les noeuds virtuels Top et Bottom
        path.removeFirst();
        path.removeLast();
        return path;
    }

    @Override
    public void reduceToSize(int width, int height) {
        // Reduire la largeur d'abord
        while (picture.width() > width) {
            Deque<Coordinate> seam = verticalSeam();
            cropVertical(seam);
        }
        // Puis reduire la hauteur
        while (picture.height() > height) {
            Deque<Coordinate> seam = horizontalSeam();
            cropHorizontal(seam);
        }
    }
}
```

**How the code works:**
1. Calculer la carte d'energie (importance de chaque pixel)
2. Construire un graphe grille ou les poids des arcs sont les energies des pixels d'arrivee
3. Les noeuds virtuels `Left`/`Right` (ou `Top`/`Bottom`) se connectent a tous les pixels du bord
4. Dijkstra trouve le chemin de moindre energie
5. Retirer le seam (chemin de pixels) pour reduire l'image d'une ligne/colonne
6. Repeter jusqu'a la taille souhaitee

Tester : `mvn javafx:run` -- charger `src/main/ressources/demo.jpg`, utiliser les options du menu `Action`.

### Exercice IV.2

### Recadrage intelligent en utilisant la programmation dynamique -- completer SeamCarverDP

L'algorithme de Dijkstra est en O((V + E) * log V). En exploitant la structure du graphe (arcs uniquement de gauche a droite), on peut calculer le plus court chemin en une seule passe en O(V + E).

On remplit une matrice colonne par colonne (de gauche a droite) pour `horizontalSeam`, ou ligne par ligne (de haut en bas) pour `verticalSeam`. Puis on reconstruit le chemin a rebours.

**Answer:**

```java
package fr.insa_rennes.sdd.seam_carving;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.function.BiFunction;
import fr.insa_rennes.sdd.graph.Coordinate;

public class SeamCarverDP extends SeamCarver {

    public SeamCarverDP(Picture picture) { super(picture); }
    public SeamCarverDP(Picture picture,
            BiFunction<Double, Double, Double> energyFunction) {
        super(picture, energyFunction);
    }

    @Override
    public Deque<Coordinate> horizontalSeam() {
        double[][] energy = energyMap();
        int h = energy.length;
        int w = energy[0].length;
        double[][] dp = new double[h][w];
        int[][] from = new int[h][w];  // trace la ligne d'origine

        // Initialiser la premiere colonne
        for (int row = 0; row < h; row++) {
            dp[row][0] = energy[row][0];
        }

        // Remplir colonne par colonne, de gauche a droite
        for (int col = 1; col < w; col++) {
            for (int row = 0; row < h; row++) {
                double best = dp[row][col - 1];
                int bestRow = row;
                if (row > 0 && dp[row - 1][col - 1] < best) {
                    best = dp[row - 1][col - 1];
                    bestRow = row - 1;
                }
                if (row < h - 1 && dp[row + 1][col - 1] < best) {
                    best = dp[row + 1][col - 1];
                    bestRow = row + 1;
                }
                dp[row][col] = best + energy[row][col];
                from[row][col] = bestRow;
            }
        }

        // Trouver le minimum dans la derniere colonne
        int minRow = 0;
        for (int row = 1; row < h; row++) {
            if (dp[row][w - 1] < dp[minRow][w - 1]) minRow = row;
        }

        // Reconstruire le seam a rebours
        Deque<Coordinate> seam = new ArrayDeque<>();
        int row = minRow;
        for (int col = w - 1; col >= 0; col--) {
            seam.addFirst(new Coordinate(row, col));
            if (col > 0) row = from[row][col];
        }
        return seam;
    }

    @Override
    public Deque<Coordinate> verticalSeam() {
        double[][] energy = energyMap();
        int h = energy.length;
        int w = energy[0].length;
        double[][] dp = new double[h][w];
        int[][] from = new int[h][w];  // trace la colonne d'origine

        // Initialiser la premiere ligne
        for (int col = 0; col < w; col++) {
            dp[0][col] = energy[0][col];
        }

        // Remplir ligne par ligne, de haut en bas
        for (int row = 1; row < h; row++) {
            for (int col = 0; col < w; col++) {
                double best = dp[row - 1][col];
                int bestCol = col;
                if (col > 0 && dp[row - 1][col - 1] < best) {
                    best = dp[row - 1][col - 1];
                    bestCol = col - 1;
                }
                if (col < w - 1 && dp[row - 1][col + 1] < best) {
                    best = dp[row - 1][col + 1];
                    bestCol = col + 1;
                }
                dp[row][col] = best + energy[row][col];
                from[row][col] = bestCol;
            }
        }

        // Trouver le minimum dans la derniere ligne
        int minCol = 0;
        for (int col = 1; col < w; col++) {
            if (dp[h - 1][col] < dp[h - 1][minCol]) minCol = col;
        }

        // Reconstruire a rebours
        Deque<Coordinate> seam = new ArrayDeque<>();
        int col = minCol;
        for (int row = h - 1; row >= 0; row--) {
            seam.addFirst(new Coordinate(row, col));
            if (row > 0) col = from[row][col];
        }
        return seam;
    }

    @Override
    public void reduceToSize(int width, int height) {
        while (picture.width() > width) {
            cropVertical(verticalSeam());
        }
        while (picture.height() > height) {
            cropHorizontal(horizontalSeam());
        }
    }
}
```

**How the code works:**
- **Complexite** : Dijkstra = O((V + E) log V), DP = O(V + E) = O(V) -- pas de facteur log, beaucoup plus rapide.
- Pour tester : dans `Controller.java`, remplacer `SeamCarverDijkstra` par `SeamCarverDP` a la ligne 7 de `loadImage()`, puis `mvn javafx:run`. Le redimensionnement devrait etre plus reactif.

---

## Erreurs courantes

1. **shiftDown choisissant le mauvais enfant** -- Toujours echanger avec l'enfant le *plus petit*, pas juste le gauche.
2. **Dijkstra n'ignorant pas les sommets visites** -- L'etape 4 est essentielle. Sans elle, l'algorithme peut ne pas terminer ou donner des resultats incorrects.
3. **Le Compte Est Bon : oublier les regles du jeu** -- La soustraction doit donner un resultat positif ; la division doit etre entiere. Sans ces verifications, des etats invalides sont generes.
4. **Seam Carving : ne pas retirer les noeuds virtuels** -- Le chemin de Dijkstra inclut `Left`/`Right` ou `Top`/`Bottom`. Ils doivent etre retires avant de passer a `cropVertical`/`cropHorizontal`.
5. **DP : mauvaise direction** -- Les seams horizontaux vont de gauche a droite ; les seams verticaux de haut en bas. Les confondre produit des seams incorrects.
