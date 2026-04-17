---
title: "Iterators & Design Patterns"
sidebar_position: 2
---

# Iterators & Design Patterns

## Theory

### The Iterator Pattern

The **Iterator pattern** separates traversal logic from the data structure itself. This allows:
- Multiple simultaneous traversals (multiple iterators on one list)
- Different traversal strategies (forward, backward, filtered)
- Clean interface: the list creates iterators, iterators navigate

```
  Liste<T>  ----------creates----------> Iterateur<T>
     |                                       |
     | implements                            | implements
     v                                       v
  ListeDoubleChainee<T>              ListeDoubleChaineeIterateur<T>
  ListeTabulee<T>                    ListeTabuleeIterateur<T>
```

### Why Separate List and Iterator?

With the TP1 approach (`MyList` has cursor built in):
- Only one cursor per list
- Cannot iterate and modify simultaneously
- Cannot have two independent traversals

With the TP2 approach (separate `Iterateur`):
- Create multiple iterators: `Iterateur<T> it1 = list.iterateur(); Iterateur<T> it2 = list.iterateur();`
- Each has its own cursor
- The list itself has no cursor


## Java Interfaces (from TP2-3)

### Liste<T> -- The List Interface

```java
public interface Liste<T> {
    void vider();              // empty the list
    boolean estVide();         // is the list empty?
    Iterateur<T> iterateur();  // factory: create an iterator
}
```

### Iterateur<T> -- The Iterator Interface

```java
public interface Iterateur<T> {
    void entete();          // cursor to first element
    void enqueue();         // cursor to last element
    void succ();            // move forward
    void pred();            // move backward
    void ajouterD(T o);     // insert right of cursor
    void ajouterG(T o);     // insert left of cursor
    void oterec();          // remove at cursor
    T valec();              // value at cursor
    void modifec(T o);      // modify value at cursor
    boolean estSorti();     // cursor out?
}
```


## Implementation: ListeDoubleChainee with Separate Iterator (TP2)

### The List Class (no cursor)

```java
public class ListeDoubleChainee<T> implements Liste<T> {
    protected static class Link<T> {
        T value = null;
        Link pred = null;
        Link succ = null;
    }
    protected Link head = null;
    protected Link tail = null;

    public ListeDoubleChainee() {
        this.head = new Link<T>();
        this.tail = new Link<T>();
        this.vider();
    }

    public void vider() {
        this.head.succ = this.tail;
        this.tail.pred = this.head;
    }

    public boolean estVide() {
        return this.head.succ == this.tail && this.tail.pred == this.head;
    }

    public Iterateur<T> iterateur() {
        return new ListeDoubleChaineeIterateur<T>(this);
    }
}
```

### The Iterator Class (has cursor)

```java
public class ListeDoubleChaineeIterateur<T> implements Iterateur<T> {
    private final ListeDoubleChainee<T> l;
    private ListeDoubleChainee.Link<T> cursor;

    public ListeDoubleChaineeIterateur(ListeDoubleChainee<T> lst) {
        this.l = lst;
        this.cursor = l.head;  // starts on sentinel
    }

    public boolean estSorti() {
        return this.cursor.pred == null || this.cursor.succ == null;
    }

    public void entete() { this.cursor = this.l.head.succ; }
    public void enqueue() { this.cursor = this.l.tail.pred; }

    public void succ() {
        if (this.estSorti()) throw new ListeDehorsException();
        this.cursor = this.cursor.succ;
    }

    public void ajouterD(T o) {
        if (!this.l.estVide() && this.estSorti())
            throw new ListeDehorsException();
        if (this.l.estVide()) this.cursor = this.l.head;

        ListeDoubleChainee.Link<T> nlink = new ListeDoubleChainee.Link<T>();
        nlink.value = o;
        nlink.pred = this.cursor;
        nlink.succ = this.cursor.succ;
        nlink.succ.pred = nlink;
        this.cursor.succ = nlink;
        this.cursor = nlink;
    }
    // ... (oterec, modifec, valec similar to TP1)
}
```


## Adapter Pattern: Bridging to java.util (TP3)

### Problem

The course uses custom `Liste<T>` / `Iterateur<T>` interfaces, but Java's standard library uses `java.util.List<T>` / `java.util.Iterator<T>`. To use for-each loops and standard APIs, we need adapters.

### IterateurEngine -- Adapts Iterateur to java.util.Iterator

```java
public class IterateurEngine<T> implements java.util.Iterator<T> {
    private final Iterateur<T> it;

    public IterateurEngine(Liste<T> dt) {
        this.it = dt.iterateur();
        this.it.entete();  // start at first element
    }

    public boolean hasNext() {
        return !this.it.estSorti();
    }

    public T next() {
        T ret = this.it.valec();
        this.it.succ();
        return ret;
    }
}
```

### ListeEngine -- Adapts Liste to java.util.List

```java
public class ListeEngine<T> implements java.util.List<T> {
    private final Liste<T> lst;

    public ListeEngine(Liste<T> ls) { this.lst = ls; }

    public java.util.Iterator<T> iterator() {
        return new IterateurEngine<>(this.lst);
    }

    public boolean add(T e) {
        Iterateur<T> it = this.lst.iterateur();
        it.enqueue();
        it.ajouterD(e);
        return true;
    }

    public int size() {
        int ret = 0;
        for (Object k : this) ret++;  // uses for-each via iterator()
        return ret;
    }
    // ... (get, set, remove, indexOf, etc.)
}
```

### Usage -- Geographic Database (TP3)

```java
public class BdGeographique {
    private final List<Enregistrement> data;

    public BdGeographique() {
        // Custom list wrapped in adapter -- usable with for-each!
        this.data = new ListeEngine<>(new ListeDoubleChainee<>());
    }

    public boolean estPresent(Enregistrement e) {
        for (Enregistrement k : this.data) {  // for-each works!
            if (k.equals(e)) return true;
        }
        return false;
    }
}
```


## Comparison: Custom vs. Java Standard Iterators

| Feature | Iterateur<T> (custom) | java.util.Iterator<T> |
|---------|----------------------|----------------------|
| Forward | succ() | next() (returns value too) |
| Backward | pred() | Not supported |
| Value | valec() | Built into next() |
| Insert | ajouterD(), ajouterG() | Not supported |
| Remove | oterec() | remove() (optional) |
| Check end | estSorti() | hasNext() |
| Start | entete() / enqueue() | Created fresh |
| Multiple passes | Yes (entete() resets) | No (one pass only) |

### Java Iterable/Iterator Protocol

```java
// To use for-each, a class must implement Iterable<T>
public interface Iterable<T> {
    Iterator<T> iterator();
}

// Then you can write:
for (T item : myCollection) { ... }

// Which is syntactic sugar for:
Iterator<T> it = myCollection.iterator();
while (it.hasNext()) {
    T item = it.next();
    // ...
}
```


## Complexity

All iterator operations on a doubly-linked list remain O(1):

| Operation | ListeDoubleChaineeIterateur | ListeTabuleeIterateur |
|-----------|---------------------------|----------------------|
| entete() | O(1) | O(1) |
| enqueue() | O(1) | O(1) |
| succ() | O(1) | O(1) |
| pred() | O(1) | O(1) |
| ajouterD() | O(1) | **O(n)** -- shift |
| ajouterG() | O(1) | **O(n)** -- shift |
| oterec() | O(1) | **O(n)** -- shift |
| valec() | O(1) | O(1) |

The adapter methods (ListeEngine) add overhead for index-based access: `get(i)` is O(i) on a linked list.


## CHEAT SHEET

```
ITERATOR PATTERN
=================
Liste<T>  --creates-->  Iterateur<T>   (factory method: iterateur())
  |                        |
  +-- no cursor            +-- has cursor
  +-- vider(), estVide()   +-- entete(), succ(), pred(), enqueue()
                           +-- ajouterD(), ajouterG(), oterec()
                           +-- valec(), modifec(), estSorti()

ADAPTER PATTERN
===============
Custom                Java Standard
------                -------------
Liste<T>        -->   java.util.List<T>      via ListeEngine<T>
Iterateur<T>    -->   java.util.Iterator<T>  via IterateurEngine<T>

IterateurEngine.hasNext()  =  !it.estSorti()
IterateurEngine.next()     =  val = it.valec(); it.succ(); return val;

FOR-EACH LOOP:
  for (T item : listeEngine) { ... }
  == Iterator<T> it = listeEngine.iterator();
     while (it.hasNext()) { T item = it.next(); ... }
```
