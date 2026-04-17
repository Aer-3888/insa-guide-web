---
title: "TP01 - Linked Lists (Listes Chainees)"
sidebar_position: 1
---

# TP01 - Linked Lists (Listes Chainees)

## Objective

Implement and understand fundamental linked list data structures:
- Simple linked list (singly-linked)
- Doubly-linked list with sentinel nodes
- Cursor-based navigation pattern

## Theory: Linked Lists

### What is a Linked List?

A **linked list** is a linear data structure where elements are stored in nodes. Each node contains:
1. **Data** - the actual value
2. **Reference(s)** - pointer(s) to next (and possibly previous) node(s)

Unlike arrays, linked lists:
- Don't require contiguous memory
- Allow O(1) insertion/deletion at cursor position
- Require O(n) access to arbitrary elements

### Singly vs. Doubly Linked

**Singly-Linked**: Each node points only to the **next** node
```
[Data|Next] -> [Data|Next] -> [Data|Next] -> null
```

**Doubly-Linked**: Each node points to **both** next and previous
```
null <- [Prev|Data|Next] <-> [Prev|Data|Next] <-> [Prev|Data|Next] -> null
```

Advantages of doubly-linked:
- Bidirectional traversal
- Easier deletion (no need to track previous node)
- Slightly more memory overhead (extra pointer per node)

### Sentinel Nodes

A **sentinel node** (or dummy node) is a special node that:
- Doesn't contain actual data
- Simplifies edge cases (empty list, first/last element)
- Acts as a fixed reference point

This implementation uses **two sentinels**:
- **head**: Permanent first node (predecessor of first real element)
- **tail**: Permanent last node (successor of last real element)

```
head <-> [elem1] <-> [elem2] <-> [elem3] <-> tail
```

Benefits:
- No null checks for first/last
- Consistent insertion/deletion logic
- Cursor never truly "null"

### Cursor Pattern

The **cursor** is a pointer to the "current" node in the list. Operations:
- `entete()` - Move cursor to first element
- `succ()` - Move cursor forward
- `pred()` - Move cursor backward
- `valec()` - Get value at cursor
- `ajouterD()` - Add element to the right of cursor
- `oterec()` - Remove element at cursor
- `estSorti()` - Check if cursor is out of bounds (on sentinel)

## Implementation

### Interface: `MyList<T>`

Generic interface defining list operations:

```java
public interface MyList<T> {
    void entete();           // Set cursor on first element
    void succ();             // Move to next
    void pred();             // Move to previous
    void ajouterD(T o);      // Add item to the right
    void oterec();           // Remove current item
    T valec();               // Current item value
    boolean estSorti();      // Is cursor out of bounds?
    boolean estVide();       // Is list empty?
}
```

### Class: `ListeDoubleChainage`

Doubly-linked list with sentinel nodes.

#### Node Structure

```java
static class Node {
    public Object value;
    public Node successor;
    public Node predecessor;
    public Node(Object o) { this.value = o; }
}
```

#### Key Attributes

- `head` - Sentinel node at the beginning
- `tail` - Sentinel node at the end
- `cursor` - Current position in the list

#### Constructor

```java
public ListeDoubleChainage() {
    head = cursor = new Node(null);
    tail = new Node(null);
    head.successor = tail;
}
```

Initially:
```
head <-> tail
 ^
cursor
```

#### Core Operations

**1. Navigation**

```java
public void entete() {
    this.cursor = this.head.successor;
}

public void succ() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to get successor from tail");
    }
    this.cursor = this.cursor.successor;
}

public void pred() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to get predecessor from head");
    }
    this.cursor = this.cursor.predecessor;
}
```

**2. Insertion (ajouterD)**

Adds a new element to the **right** of the cursor:

```java
public void ajouterD(Object o) {
    // Check bounds
    if (!this.estVide() && this.estSorti()) {
        throw new MyListOutOfBoundsException();
    }
    
    if (this.estVide())
        this.cursor = head;
    
    // Create new node
    Node nn = new Node(o);
    
    // Link backwards
    nn.predecessor = this.cursor;
    this.cursor.successor.predecessor = nn;
    
    // Link forward
    nn.successor = this.cursor.successor;
    this.cursor.successor = nn;
    
    // Move cursor to new node
    this.cursor = nn;
}
```

Visual example:
```
Before: head <-> [A] <-> tail
                  ^
                cursor

After:  head <-> [A] <-> [B] <-> tail
                          ^
                        cursor
```

**3. Deletion (oterec)**

Removes the element at cursor:

```java
public void oterec() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to remove from out of space");
    }
    
    // Bypass current node
    this.cursor.predecessor.successor = this.cursor.successor;
    this.cursor.successor.predecessor = this.cursor.predecessor;
    
    // Move cursor to successor
    this.cursor = this.cursor.successor;
}
```

Visual example:
```
Before: head <-> [A] <-> [B] <-> [C] <-> tail
                          ^
                        cursor

After:  head <-> [A] <-> [C] <-> tail
                          ^
                        cursor
```

**4. State Checks**

```java
public boolean estSorti() {
    // Out if on head or tail sentinel
    return this.cursor == this.head || this.cursor == this.tail;
}

public boolean estVide() {
    // Empty if head points directly to tail
    return this.head.successor == this.tail;
}

public Object valec() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to get something from nothing");
    }
    return this.cursor.value;
}
```

## Complexity Analysis

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| `entete()` | O(1) | Direct pointer assignment |
| `succ()` | O(1) | Follow next pointer |
| `pred()` | O(1) | Follow previous pointer (doubly-linked advantage) |
| `ajouterD()` | O(1) | Insert at cursor position |
| `oterec()` | O(1) | Delete at cursor position |
| `valec()` | O(1) | Direct access |
| `estVide()` | O(1) | Check head.successor |
| `estSorti()` | O(1) | Compare cursor to sentinels |

**All operations are O(1)** - this is the key advantage of the cursor pattern!

Note: Finding a specific value requires O(n) traversal, but once at the right position, modifications are constant time.

## Usage Example

```java
MyList<Object> list = new ListeDoubleChainage();

// Add elements
list.entete();           // Move to head
list.ajouterD("Alice");  // head <-> [Alice] <-> tail
list.ajouterD("Bob");    // head <-> [Alice] <-> [Bob] <-> tail
                         //                        ^

// Navigate
list.entete();           // Cursor on "Alice"
System.out.println(list.valec()); // "Alice"
list.succ();             // Cursor on "Bob"
System.out.println(list.valec()); // "Bob"

// Remove
list.oterec();           // Remove "Bob", cursor moves to tail
list.entete();           // Back to "Alice"
list.oterec();           // Remove "Alice"
System.out.println(list.estVide()); // true
```

## Exceptions

### `MyListOutOfBoundsException`

Thrown when:
- Trying to move past list boundaries
- Attempting to access/modify when cursor is out of bounds
- Calling `oterec()` on sentinel

```java
public class MyListOutOfBoundsException extends RuntimeException {
    public MyListOutOfBoundsException() { super(); }
    public MyListOutOfBoundsException(String message) { super(message); }
}
```

### `MyListEmptyException`

Thrown when operations require a non-empty list:

```java
public class MyListEmptyException extends RuntimeException {
    public MyListEmptyException() { super(); }
    public MyListEmptyException(String message) { super(message); }
}
```

## Testing

The included test file `ListeDoubleChainageTest.java` verifies:
- Constructor initializes empty list
- `ajouterD()` correctly inserts elements
- `oterec()` correctly removes elements
- Navigation methods (`entete`, `succ`, `pred`) work correctly
- Exceptions are thrown for invalid operations
- Edge cases (empty list, single element, boundary conditions)

Run tests:
```bash
# IntelliJ: Right-click ListeDoubleChainageTest.java > Run
# Or compile manually:
javac -cp .:junit.jar src/test/ListeDoubleChainageTest.java
java -cp .:junit.jar org.junit.runner.JUnitCore test.ListeDoubleChainageTest
```

## Comparison: Array vs. Linked List

| Feature | Array | Linked List |
|---------|-------|-------------|
| Access by index | O(1) | O(n) |
| Insert at cursor | O(n) (shift) | O(1) |
| Delete at cursor | O(n) (shift) | O(1) |
| Memory | Contiguous | Scattered |
| Cache locality | Excellent | Poor |
| Overhead | None | Pointer per element |

**Use linked lists when**:
- Frequent insertions/deletions at arbitrary positions
- Size unknown or highly variable
- Sequential access is sufficient

**Use arrays when**:
- Random access needed
- Memory layout matters (cache)
- Size is fixed or rarely changes

## Extensions (Not Implemented)

Possible enhancements:
1. **Generic typing**: Make `ListeDoubleChainage<T>` instead of using `Object`
2. **Iterator interface**: Implement `Iterable<T>` for for-each loops
3. **Additional operations**: `length()`, `contains()`, `indexOf()`, `reverse()`
4. **Circular list**: Make tail.successor = head
5. **XOR linked list**: Space-efficient doubly-linked variant

## Common Pitfalls

1. **Forgetting sentinel checks**: Always check `estSorti()` before operations
2. **Null pointer access**: Happens if you don't initialize head/tail properly
3. **Incorrect linking order**: When inserting, link backwards first, then forward
4. **Cursor position after deletion**: Remember cursor moves to successor
5. **Memory leaks** (in languages like C): In Java, GC handles it, but in C/C++ you must free deleted nodes

## See Also

- **TP02**: Iterators (separation of concerns)
- **TP03**: Geographic database application
- [Java LinkedList](https://docs.oracle.com/javase/8/docs/api/java/util/LinkedList.html) - Standard library implementation
