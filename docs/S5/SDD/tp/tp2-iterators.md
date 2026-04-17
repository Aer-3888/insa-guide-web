---
title: "TP02 - Lists with Iterators (Listes avec Iterateurs)"
sidebar_position: 2
---

# TP02 - Lists with Iterators (Listes avec Iterateurs)

## Pedagogical Objective

**Separate traversal logic from container implementation** using the Iterator design pattern.

This TP introduces the concept that:
- **Container** (Liste) = Data storage structure
- **Iterator** (Iterateur) = Traversal mechanism

Before this TP: list operations and navigation were tightly coupled  
After this TP: clean separation allows swapping implementations independently

## Theory: Iterator Pattern

### The Problem

In TP01, `MyList` mixed two concerns:
1. **Storage**: How elements are stored (array, linked list, tree...)
2. **Traversal**: How to navigate through elements (cursor, index, etc.)

This tight coupling makes it hard to:
- Swap storage implementations
- Support multiple traversal strategies
- Use standard language features (for-each loops)

### The Solution

**Iterator Pattern** separates these concerns:

```
┌──────────────┐         ┌───────────────────┐
│   Liste      │ creates │   Iterateur       │
│              │────────>│                   │
│ + iterateur()│         │ + succ()          │
│ + ajouterD() │         │ + pred()          │
│ + oterec()   │         │ + valec()         │
│ + vider()    │         │ + estSorti()      │
└──────────────┘         └───────────────────┘
```

### Benefits

1. **Separation of Concerns**: Storage vs. traversal
2. **Multiple Iterators**: Many traversals on same list simultaneously
3. **Polymorphism**: Client code works with any `Liste` implementation
4. **Extensibility**: Easy to add new storage types
5. **Standard Compliance**: Can implement Java's `Iterator` interface

## Interfaces

### `Liste` - Container Interface

Represents the data structure itself:

```java
public interface Liste {
    // Create an iterator for this list
    Iterateur iterateur();
    
    // List operations
    void ajouterD(Object objet);  // Add element right of cursor
    void ajouterG(Object objet);  // Add element left of cursor
    void oterec();                // Remove current element
    void vider();                 // Clear the list
    
    // State queries
    boolean estVide();            // Is empty?
    boolean estSorti();           // Is iterator out?
    
    // Value access
    Object valec();               // Get current value
    void modifec(Object objet);   // Modify current value
}
```

### `Iterateur` - Traversal Interface

Represents a position and traversal mechanism:

```java
public interface Iterateur {
    // Navigation
    void entete();     // Go to first element
    void enqueue();    // Go to last element
    void succ();       // Move forward
    void pred();       // Move backward
    
    // State queries
    boolean estSorti(); // Is out of bounds?
    
    // Value access
    Object valec();     // Get current value
}
```

## Key Design Principle

**The iterator knows the list, but list operations use the iterator's position:**

```java
// Iterator navigates
Iterateur it = list.iterateur();
it.entete();         // Iterator moves to first
it.succ();           // Iterator moves forward

// List modifies at iterator's position
list.ajouterD(42);   // List adds at iterator's current position
list.oterec();       // List removes at iterator's position
```

## Implementations

### 1. Array-Based Implementation

**`ListeTabulee`** - Array-backed list with iterator

```java
public class ListeTabulee implements Liste {
    private Object[] elements;
    private int size;
    private int capacity;
    private ListeTabuleeIterateur iterateur;
    
    public Iterateur iterateur() {
        if (iterateur == null) {
            iterateur = new ListeTabuleeIterateur(this);
        }
        return iterateur;
    }
    // ... implementation
}
```

**`ListeTabuleeIterateur`** - Index-based traversal

```java
public class ListeTabuleeIterateur implements Iterateur {
    private ListeTabulee liste;
    private int index;  // Current position
    
    public void succ() {
        index++;
    }
    
    public void pred() {
        index--;
    }
    
    public boolean estSorti() {
        return index < 0 || index >= liste.size();
    }
    // ... implementation
}
```

**Advantages:**
- O(1) random access by index
- Cache-friendly (contiguous memory)
- Simple implementation

**Disadvantages:**
- O(n) insertion/deletion (must shift elements)
- Fixed capacity (or expensive resizing)

### 2. Doubly-Linked Implementation

**`ListeDoubleChainee`** - Linked list with sentinels

```java
public class ListeDoubleChainee implements Liste {
    static class Node {
        Object value;
        Node next;
        Node prev;
    }
    
    private Node head;  // Sentinel
    private Node tail;  // Sentinel
    private ListeDoubleChaineeIterateur iterateur;
    
    public Iterateur iterateur() {
        if (iterateur == null) {
            iterateur = new ListeDoubleChaineeIterateur(this);
        }
        return iterateur;
    }
    // ... implementation
}
```

**`ListeDoubleChaineeIterateur`** - Node-based traversal

```java
public class ListeDoubleChaineeIterateur implements Iterateur {
    private ListeDoubleChainee liste;
    private Node current;  // Current node
    
    public void succ() {
        current = current.next;
    }
    
    public void pred() {
        current = current.prev;
    }
    
    public boolean estSorti() {
        return current == liste.head || current == liste.tail;
    }
    // ... implementation
}
```

**Advantages:**
- O(1) insertion/deletion at iterator position
- No capacity limit
- No wasted space

**Disadvantages:**
- O(n) access by index
- Pointer overhead (2 pointers per node)
- Poor cache locality

## Usage Example

```java
// Create list (can swap implementations easily)
Liste liste = new ListeDoubleChainee();
// or: Liste liste = new ListeTabulee();

// Get iterator
Iterateur it = liste.iterateur();

// Add elements
it.entete();
liste.ajouterD("Alice");   // ["Alice"]
liste.ajouterD("Bob");     // ["Alice", "Bob"]
liste.ajouterD("Charlie"); // ["Alice", "Bob", "Charlie"]

// Navigate and access
it.entete();
System.out.println(it.valec());  // "Alice"

it.succ();
System.out.println(it.valec());  // "Bob"

// Modify
liste.modifec("Bobby");          // ["Alice", "Bobby", "Charlie"]

// Remove
liste.oterec();                  // ["Alice", "Charlie"]

// Traverse entire list
it.entete();
while (!it.estSorti()) {
    System.out.println(it.valec());
    it.succ();
}
```

## Adapter to Java Collections

You can wrap these in an adapter to use with Java's standard `List` interface:

```java
public class ListeEngine<T> implements List<T> {
    private Liste liste;
    
    public ListeEngine(Liste liste) {
        this.liste = liste;
    }
    
    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            Iterateur it = liste.iterateur();
            
            public boolean hasNext() {
                // Peek ahead
                it.succ();
                boolean result = !it.estSorti();
                it.pred();
                return result;
            }
            
            public T next() {
                it.succ();
                return (T) it.valec();
            }
        };
    }
    
    // Implement other List methods...
}
```

Then use in for-each loops:

```java
Liste internalList = new ListeDoubleChainee();
List<String> list = new ListeEngine<>(internalList);

list.add("A");
list.add("B");
list.add("C");

for (String s : list) {
    System.out.println(s);
}
```

## Testing Strategy

### Base Test Class

Create an abstract test class with all test logic:

```java
public abstract class ListeTestBase {
    protected abstract Liste createListe();
    
    @Test
    public void testAjouterD() {
        Liste liste = createListe();
        Iterateur it = liste.iterateur();
        
        it.entete();
        liste.ajouterD("first");
        assertEquals("first", it.valec());
        
        liste.ajouterD("second");
        assertEquals("second", it.valec());
    }
    
    // ... more tests
}
```

### Concrete Test Classes

Each implementation extends the base with a factory method:

```java
public class ListeTabuleeTest extends ListeTestBase {
    @Override
    protected Liste createListe() {
        return new ListeTabulee();
    }
}

public class ListeDoubleChaineeTest extends ListeTestBase {
    @Override
    protected Liste createListe() {
        return new ListeDoubleChainee();
    }
}
```

This ensures **both implementations** pass **the same tests** - proving they're interchangeable!

## Complexity Comparison

| Operation | Array (ListeTabulee) | Linked (ListeDoubleChainee) |
|-----------|---------------------|----------------------------|
| Create iterator | O(1) | O(1) |
| `entete()` | O(1) | O(1) |
| `succ()` | O(1) | O(1) |
| `pred()` | O(1) | O(1) |
| `valec()` | O(1) | O(1) |
| `ajouterD()` | O(n) (shift) | O(1) |
| `ajouterG()` | O(n) (shift) | O(1) |
| `oterec()` | O(n) (shift) | O(1) |
| `vider()` | O(1) | O(n) (or O(1) if GC) |

**Key Insight**: For frequent insertions/deletions, linked list wins. For read-heavy workloads with little modification, array is often faster (cache locality).

## Design Pattern Variations

### 1. Single vs. Multiple Iterators

**Current Design** (Single Iterator):
```java
private ListeTabuleeIterateur iterateur;

public Iterateur iterateur() {
    if (iterateur == null) {
        iterateur = new ListeTabuleeIterateur(this);
    }
    return iterateur;  // Always returns same instance
}
```

**Alternative** (Multiple Iterators):
```java
public Iterateur iterateur() {
    return new ListeTabuleeIterateur(this);  // New instance each time
}
```

Pros of single: List operations work with "the" iterator  
Pros of multiple: Independent traversals, thread-safer

### 2. Internal vs. External Iterators

**Internal**: Iterator controls the loop

```java
liste.forEach(element -> {
    System.out.println(element);
});
```

**External** (current design): Client controls the loop

```java
Iterateur it = liste.iterateur();
while (!it.estSorti()) {
    System.out.println(it.valec());
    it.succ();
}
```

External gives more control; internal is more concise.

### 3. Fail-Fast Iterators

Java's standard iterators throw `ConcurrentModificationException` if the list is modified during iteration.

Implementation:
```java
class Liste {
    private int modCount = 0;  // Incremented on each modification
    
    void ajouterD(Object o) {
        // ... add logic
        modCount++;
    }
}

class Iterateur {
    private int expectedModCount;
    
    Iterateur(Liste liste) {
        this.expectedModCount = liste.modCount;
    }
    
    void succ() {
        if (expectedModCount != liste.modCount) {
            throw new ConcurrentModificationException();
        }
        // ... move logic
    }
}
```

## Common Mistakes

1. **Modifying during iteration without tracking state**
   ```java
   // Dangerous!
   Iterateur it = liste.iterateur();
   it.entete();
   while (!it.estSorti()) {
       if (shouldRemove(it.valec())) {
           liste.oterec();  // Iterator position may be invalid now!
       }
       it.succ();
   }
   ```

2. **Forgetting to check `estSorti()` before access**
   ```java
   it.entete();
   it.pred();  // Out of bounds!
   it.valec(); // May throw exception
   ```

3. **Mixing iterators from different lists**
   ```java
   Liste list1 = new ListeDoubleChainee();
   Liste list2 = new ListeDoubleChainee();
   Iterateur it1 = list1.iterateur();
   it1.entete();
   list2.oterec();  // Wrong list! Should be list1
   ```

## Real-World Applications

This pattern is fundamental in:
- **Java Collections**: `List.iterator()`, `Set.iterator()`
- **C++ STL**: `vector::iterator`, `list::iterator`
- **Python**: `iter(list)`, generators
- **Databases**: Result set cursors
- **File systems**: Directory iterators

## Extensions

1. **Bidirectional Iterator**: Already implemented (`pred()`)
2. **Random Access Iterator**: Add `jumpTo(int index)`
3. **Reverse Iterator**: Iterate from end to beginning
4. **Filtered Iterator**: Skip elements not matching predicate
5. **Composite Iterator**: Iterate over multiple lists as one

## Exercises

1. Implement `contains(Object o)` using the iterator
2. Implement `indexOf(Object o)` returning element position
3. Create a reverse iterator that traverses backward
4. Add `forEach(Consumer<Object> action)` method
5. Implement fail-fast modification detection
6. Create a filtered view that only shows certain elements

## See Also

- **TP01**: Basic linked list implementation
- **TP03**: Geographic database using these lists
- [Java Iterator Pattern](https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html)
- [Design Patterns: Iterator](https://refactoring.guru/design-patterns/iterator)
