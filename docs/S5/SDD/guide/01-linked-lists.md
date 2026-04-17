---
title: "Linked Lists (Listes Chainees)"
sidebar_position: 1
---

# Linked Lists (Listes Chainees)

## Theory

A **linked list** is a linear data structure where elements (nodes) are connected via references (pointers). Unlike arrays, elements are not stored contiguously in memory.

### Singly Linked List

Each node holds data and a pointer to the next node.

```
  [A|*]--->[B|*]--->[C|*]--->null
```

- Traversal: forward only
- Insert at head: O(1)
- Delete at head: O(1)
- Access i-th element: O(n)

### Doubly Linked List

Each node holds data, a pointer to the next node, and a pointer to the previous node.

```
  null<---[*|A|*]<--->[*|B|*]<--->[*|C|*]--->null
```

- Traversal: forward and backward
- Insert/delete at known position: O(1)
- pred() is O(1) instead of O(n) as in singly linked

### Sentinel Nodes (Noeuds Sentinelles)

Sentinels are dummy nodes that simplify boundary conditions. The INSA SDD course uses **two sentinels** (head and tail):

```
  head <---> [elem1] <---> [elem2] <---> [elem3] <---> tail
  (sentinel)                                          (sentinel)
```

Benefits:
- No null checks when inserting at front/back
- Empty list = head.successor == tail
- Cursor on sentinel = "out of list" (estSorti)

### Cursor Pattern (Patron Curseur)

The cursor is an internal pointer to the "current" element. All operations act relative to the cursor.

```
  head <---> [A] <---> [B] <---> [C] <---> tail
                         ^
                       cursor
```

Operations:
- `entete()` -- cursor on first real element
- `enqueue()` -- cursor on last real element
- `succ()` -- move cursor forward
- `pred()` -- move cursor backward
- `valec()` -- value at cursor
- `ajouterD(x)` -- insert x to the right of cursor, cursor moves to x
- `oterec()` -- remove element at cursor, cursor moves to successor
- `estSorti()` -- true if cursor is on a sentinel
- `estVide()` -- true if head.successor == tail


## Java Implementation

### Interface (from TP1)

```java
public interface MyList<T> {
    void entete();          // cursor to head
    void succ();            // cursor forward
    void pred();            // cursor backward
    void ajouterD(T o);     // add right of cursor
    void oterec();          // remove at cursor
    T valec();              // value at cursor
    boolean estSorti();     // cursor out?
    boolean estVide();      // list empty?
}
```

### Doubly Linked List with Sentinels (from TP1)

```java
public class ListeDoubleChainage implements MyList<Object> {
    static class Node {
        public Object value;
        public Node successor;
        public Node predecessor;
        public Node(Object o) { this.value = o; }
    }

    private final Node head;
    private Node cursor;
    private final Node tail;

    public ListeDoubleChainage() {
        head = cursor = new Node(null);    // sentinel
        tail = new Node(null);             // sentinel
        head.successor = tail;
    }
```

#### Insertion -- ajouterD(o)

```java
    public void ajouterD(Object o) {
        if (!this.estVide() && this.estSorti())
            throw new MyListOutOfBoundsException();
        if (this.estVide())
            this.cursor = head;

        Node nn = new Node(o);
        // 1. Link backwards
        nn.predecessor = this.cursor;
        this.cursor.successor.predecessor = nn;
        // 2. Link forward
        nn.successor = this.cursor.successor;
        this.cursor.successor = nn;
        // 3. Move cursor to new node
        this.cursor = nn;
    }
```

Step by step with ASCII art:

```
Before: head <-> [A] <-> tail       cursor on [A]

Step 1 -- create nn=[B], link nn.pred = cursor
          head <-> [A] <-> tail
                    ^
              nn=[B]

Step 2 -- nn.succ = cursor.succ (tail), tail.pred = nn
          head <-> [A]    [B] <-> tail
                    ^------^

Step 3 -- cursor.succ = nn
          head <-> [A] <-> [B] <-> tail

Step 4 -- cursor = nn
          head <-> [A] <-> [B] <-> tail
                            ^
                          cursor
```

#### Deletion -- oterec()

```java
    public void oterec() {
        if (this.estSorti())
            throw new MyListOutOfBoundsException();
        // Bypass current node
        this.cursor.predecessor.successor = this.cursor.successor;
        this.cursor.successor.predecessor = this.cursor.predecessor;
        // Move cursor to successor
        this.cursor = this.cursor.successor;
    }
```

```
Before: head <-> [A] <-> [B] <-> [C] <-> tail
                          ^
                        cursor

After:  head <-> [A] <---------> [C] <-> tail
                                  ^
                                cursor
         (B is now unreferenced, garbage collected)
```


## Array-Backed List (ListeTabulee) -- from TP2

An alternative implementation using an internal array:

```java
public class ListeTabulee<T> implements Liste<T> {
    static final int TMAX = 1000;
    protected Object[] internal_tab;
    protected int occupation = 0;
    // ...
}
```

The iterator for this uses an integer index instead of a node pointer:

```java
public class ListeTabuleeIterateur<T> implements Iterateur<T> {
    private int index = -1;
    // succ() -> index++
    // pred() -> index--
    // ajouterD() -> shift elements right, insert at index+1
    // oterec() -> shift elements left
}
```

Key difference: insert/delete requires shifting O(n) elements.


## Complexity Comparison

| Operation | Doubly Linked (at cursor) | Array-backed (at cursor) |
|-----------|--------------------------|--------------------------|
| entete() | O(1) | O(1) |
| succ() | O(1) | O(1) |
| pred() | O(1) | O(1) |
| ajouterD() | **O(1)** | **O(n)** (shift) |
| oterec() | **O(1)** | **O(n)** (shift) |
| valec() | O(1) | O(1) |
| estVide() | O(1) | O(1) |
| Access by index | O(n) | **O(1)** |
| Memory overhead | 2 pointers/node | None (contiguous) |
| Cache locality | Poor | Excellent |


## Circular Linked List

A variant where the last element points back to the first:

```
  [A] ---> [B] ---> [C]
   ^                  |
   |__________________|
```

Not directly implemented in the TPs but sometimes appears in exams.


## Common Exam Patterns

1. **Implement an operation** (e.g., reverse, merge, sort a linked list)
2. **Trace execution** step by step on a given list
3. **Complexity proof** for a given operation
4. **Compare** linked vs. array-backed implementation


## CHEAT SHEET

```
DOUBLY LINKED LIST WITH SENTINELS
==================================
Structure:  head <-> [e1] <-> [e2] <-> ... <-> [en] <-> tail
Sentinels:  head.value = null, tail.value = null
Empty:      head.successor == tail
Out:        cursor == head || cursor == tail

INSERT RIGHT (ajouterD):          DELETE (oterec):
  nn.pred = cursor                  cursor.pred.succ = cursor.succ
  cursor.succ.pred = nn             cursor.succ.pred = cursor.pred
  nn.succ = cursor.succ             cursor = cursor.succ
  cursor.succ = nn
  cursor = nn

ALL CURSOR OPS: O(1)
SEARCH: O(n)          ACCESS BY INDEX: O(n)
```
