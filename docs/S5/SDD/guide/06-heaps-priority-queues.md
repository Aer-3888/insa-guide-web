---
title: "Tas et Files de Priorite"
sidebar_position: 6
---

# Tas et Files de Priorite

## Theorie

### File de Priorite

Une **file de priorite** est un type abstrait de donnees ou chaque element a une priorite. L'element de plus haute priorite (plus petite valeur pour un tas min) est defile en premier.

Operations :
- `add(e)` -- inserer un element avec sa priorite
- `poll()` -- retirer et retourner l'element de plus haute priorite
- `peek()` -- retourner l'element de plus haute priorite sans le retirer
- `isEmpty()` / `size()`

### Tas Binaire

Un **tas binaire** est l'implementation standard d'une file de priorite.

Proprietes :
1. **Arbre binaire complet** : tous les niveaux sont pleins sauf possiblement le dernier, rempli de gauche a droite
2. **Propriete de tas** :
   - **Tas min** : parent <= enfants (la racine est le minimum)
   - **Tas max** : parent >= enfants (la racine est le maximum)

```
Tas min :
           [1]              Correspondance des indices (base 0) :
          /   \             parent(i) = (i-1)/2
        [3]   [2]           gauche(i) = 2*i + 1
        / \   /             droit(i)  = 2*i + 2
      [5] [4][6]

Representation tableau : [1, 3, 2, 5, 4, 6]
Index :                    0  1  2  3  4  5
```

### Representation par Tableau

Un arbre binaire complet se projette parfaitement dans un tableau :

```
Arbre :        [10]                Tableau : [10, 20, 30, 40, 50]
              /    \               Index :    0   1   2   3   4
           [20]    [30]
           /  \
        [40]  [50]

parent(1) = (1-1)/2 = 0  -> tableau[0] = 10  (correct)
gauche(0) = 2*0+1   = 1  -> tableau[1] = 20  (correct)
droit(0)  = 2*0+2   = 2  -> tableau[2] = 30  (correct)
gauche(1) = 2*1+1   = 3  -> tableau[3] = 40  (correct)
```


## Operations

### ShiftUp (Percolation vers le haut)

Apres insertion a la fin, remonter pour restaurer la propriete de tas.

```
Insertion de 1 dans un tas min :

Etape 0 : [3, 5, 4, 7, 6, 8, 1]    1 insere a la fin
                                      parent(6) = 2, tableau[2]=4 > 1 -> echanger

Etape 1 : [3, 5, 1, 7, 6, 8, 4]    parent(2) = 0, tableau[0]=3 > 1 -> echanger

Etape 2 : [1, 5, 3, 7, 6, 8, 4]    a la racine, termine !
```

```java
private void shiftUp(int i) {
    while (i > 0 && compare_at(parent(i), i) > 0) {
        swap(parent(i), i);
        i = parent(i);
    }
}
```

### ShiftDown (Percolation vers le bas)

Apres suppression de la racine (remplacee par le dernier element), descendre.

```
Poll depuis le tas min [1, 3, 2, 5, 4, 6] :

Etape 0 : Retirer 1, remplacer par le dernier :
          [6, 3, 2, 5, 4]          6 a la racine
          gauche(0)=1 (val 3), droit(0)=2 (val 2)
          enfant min = 2, 6 > 2 -> echanger

Etape 1 : [2, 3, 6, 5, 4]          6 a l'index 2
          gauche(2)=5 (val ?), droit(2)=6 (val ?)
          plus d'enfants en dessous -> termine !
```

```java
private void shiftDown(int i) {
    boolean finish = false;
    int k = i;
    while (k < size / 2 && !finish) {
        int index = leftChild(k);
        // Pick the smaller child (if right child exists and is smaller)
        if (index < size && compare_at(index, rightChild(k)) > 0) {
            index = rightChild(k);
        }
        // If the smaller child is still >= current, heap property holds
        if (compare_at(index, k) > 0) {
            finish = true;
        } else {
            swap(k, index);
            k = index;
        }
    }
}
```

Note : La condition `compare_at(index, rightChild(k)) > 0` verifie si enfantGauche > enfantDroit. La garde `index < size` devrait techniquement etre `rightChild(k) < size` pour verifier l'existence de l'enfant droit. Dans le code source du TP8, cette verification est `index < size` ce qui peut acceder a `heap[rightChild(k)]` meme quand rightChild(k) >= size. Cela fonctionne car les tableaux Java sont initialises a zero et le comparateur gere null, mais c'est un probleme de bornes latent.


## Implementation Java (du TP8)

### Interface

```java
public interface PriorityQueue<T> {
    boolean isEmpty();
    int size();
    void add(T e);
    T peek();
    T poll();
}
```

### HeapPQ -- File de Priorite basee sur un Tas

```java
public class HeapPQ<T> implements PriorityQueue<T> {
    private Comparator<? super T> comparator;
    private int size;
    T[] heap;

    @SuppressWarnings("unchecked")
    public HeapPQ(int initialCapacity, Comparator<? super T> comparator) {
        heap = (T[]) new Object[initialCapacity];
        this.comparator = comparator == null
            ? (t1, t2) -> ((Comparable<? super T>) t1).compareTo(t2)
            : comparator;
    }

    // Index calculations
    private int parent(int i)     { return (i - 1) / 2; }
    private int leftChild(int i)  { return 2 * i + 1; }
    private int rightChild(int i) { return 2 * i + 2; }

    @Override
    public void add(T e) {
        if (e == null) throw new NullPointerException();
        if (size >= heap.length) grow();  // resize array
        heap[size] = e;
        shiftUp(size);
        size++;
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

    @Override
    public T peek() {
        return (size == 0) ? null : heap[0];
    }
}
```

### OrderedArrayPQ -- Alternative avec Tableau Trie

```java
public class OrderedArrayPQ<T> implements PriorityQueue<T> {
    // Keeps array sorted at all times
    // add: binary search for position, shift right, insert -> O(n)
    // poll: return first element, shift left -> O(n)
    // peek: return first element -> O(1)
}
```


## Comparaison : Tas vs. Tableau Trie

| Operation | HeapPQ | OrderedArrayPQ |
|-----------|--------|----------------|
| add | **O(log n)** | O(n) |
| poll | **O(log n)** | O(n) |
| peek | O(1) | O(1) |
| isEmpty | O(1) | O(1) |
| Construction depuis n elements | **O(n)** | O(n log n) |

Le tas est nettement plus rapide pour l'algorithme de Dijkstra.


## Tri par Tas

1. Construire un tas max a partir du tableau : O(n)
2. Extraire le max de maniere repetee et le placer a la fin : O(n log n)

```
Tableau : [4, 1, 3, 2, 5]

Construction du tas max : [5, 4, 3, 2, 1]

Extraction du max :
  [5, 4, 3, 2, 1] -> echanger 5 avec 1 -> [1, 4, 3, 2 | 5]
  heapify -> [4, 2, 3, 1 | 5]
  echanger 4 avec 1 -> [1, 2, 3 | 4, 5]
  heapify -> [3, 2, 1 | 4, 5]
  echanger 3 avec 1 -> [1, 2 | 3, 4, 5]
  heapify -> [2, 1 | 3, 4, 5]
  echanger 2 avec 1 -> [1 | 2, 3, 4, 5]

Resultat : [1, 2, 3, 4, 5]
```

**Complexite** : O(n log n) en temps, O(1) en espace supplementaire (en place).


## Heapify (Construction du Tas)

Pour construire un tas a partir d'un tableau non trie en O(n) :
- Commencer depuis le dernier noeud interne (index n/2 - 1)
- Appliquer shiftDown a chaque noeud en remontant vers la racine

```java
for (int i = size / 2 - 1; i >= 0; i--) {
    shiftDown(i);
}
```

Pourquoi O(n) et non O(n log n) ?
- La plupart des noeuds sont pres du bas et necessitent peu d'echanges
- Somme : n/4 * 1 + n/8 * 2 + n/16 * 3 + ... = O(n)


## AIDE-MEMOIRE

```
TAS BINAIRE (TAS MIN)
======================
Tableau :  [min, ..., ..., ...]
Index :     0    1    2    3   4   5   6

PARENT(i) = (i-1)/2
GAUCHE(i) = 2*i + 1
DROIT(i)  = 2*i + 2

ADD :   placer a la fin, shiftUp         -> O(log n)
POLL :  echanger racine avec dernier, shiftDown -> O(log n)
PEEK :  retourner la racine              -> O(1)
BUILD : shiftDown de n/2-1 a 0           -> O(n)

SHIFT UP :   tant que parent > courant : echanger, aller au parent
SHIFT DOWN : tant que courant > enfant min : echanger, aller a l'enfant min

TRI PAR TAS : construire tas max O(n), extraire n fois O(n log n)
              Total : O(n log n), en place

JAVA :
  PriorityQueue<Integer> pq = new PriorityQueue<>();  // tas min
  PriorityQueue<Integer> maxPQ = new PriorityQueue<>(Comparator.reverseOrder());
```
