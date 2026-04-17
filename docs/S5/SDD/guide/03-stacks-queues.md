---
title: "Stacks & Queues"
sidebar_position: 3
---

# Stacks & Queues

## Theory

Stacks and queues are **restricted-access** data structures. They are used extensively in the SDD course as building blocks for algorithms (expression evaluation, BFS, Dijkstra, reverse Polish notation).

### Stack (Pile) -- LIFO

**Last In, First Out.** Think of a stack of plates.

```
  push(C)    push(D)    pop() -> D    pop() -> C
  +---+      +---+      +---+         +---+
  | C |      | D |      | C |         | B |
  +---+      +---+      +---+         +---+
  | B |      | C |      | B |         | A |
  +---+      +---+      +---+         +---+
  | A |      | B |      | A |
  +---+      +---+      +---+
             | A |
             +---+
```

Operations:
- `push(x)` -- add to top: O(1)
- `pop()` -- remove from top: O(1)
- `peek()` -- see top without removing: O(1)
- `isEmpty()` -- check if empty: O(1)

### Queue (File) -- FIFO

**First In, First Out.** Think of a queue at a shop.

```
  enqueue(A)  enqueue(B)  enqueue(C)  dequeue() -> A
  front                                front
   |                                    |
  [A]        [A][B]      [A][B][C]     [B][C]
```

Operations:
- `enqueue(x)` -- add to back: O(1)
- `dequeue()` -- remove from front: O(1)
- `peek()` -- see front without removing: O(1)
- `isEmpty()` -- check if empty: O(1)


## Implementations

### Array-Based Stack

```java
public class StackArray<T> {
    private Object[] data;
    private int top = -1;

    public StackArray(int capacity) {
        data = new Object[capacity];
    }

    public void push(T item) {
        if (top == data.length - 1) throw new StackOverflowError();
        data[++top] = item;
    }

    @SuppressWarnings("unchecked")
    public T pop() {
        if (top == -1) throw new EmptyStackException();
        T item = (T) data[top];
        data[top--] = null;
        return item;
    }

    @SuppressWarnings("unchecked")
    public T peek() {
        if (top == -1) throw new EmptyStackException();
        return (T) data[top];
    }

    public boolean isEmpty() { return top == -1; }
}
```

### Linked-List-Based Stack

```java
public class StackLinked<T> {
    private static class Node<T> {
        T value;
        Node<T> next;
        Node(T v, Node<T> n) { value = v; next = n; }
    }

    private Node<T> top = null;

    public void push(T item) {
        top = new Node<>(item, top);  // new node points to old top
    }

    public T pop() {
        if (top == null) throw new EmptyStackException();
        T val = top.value;
        top = top.next;
        return val;
    }

    public T peek() {
        if (top == null) throw new EmptyStackException();
        return top.value;
    }

    public boolean isEmpty() { return top == null; }
}
```

### Queue with Circular Array

```java
public class QueueCircular<T> {
    private Object[] data;
    private int front = 0, rear = 0, size = 0;

    public QueueCircular(int capacity) {
        data = new Object[capacity];
    }

    public void enqueue(T item) {
        if (size == data.length) throw new RuntimeException("Full");
        data[rear] = item;
        rear = (rear + 1) % data.length;
        size++;
    }

    @SuppressWarnings("unchecked")
    public T dequeue() {
        if (size == 0) throw new RuntimeException("Empty");
        T item = (T) data[front];
        data[front] = null;
        front = (front + 1) % data.length;
        size--;
        return item;
    }

    public boolean isEmpty() { return size == 0; }
}
```


## Applications in SDD

### 1. Reverse Polish Notation (Notation Polonaise Inverse)

Used in TP6 (ExprArith) and TP8 (Le Compte est Bon). A stack evaluates postfix expressions.

```
Expression: (3 + 4) * 2
Postfix:     3 4 + 2 *

Evaluation with stack:
  Read 3  -> push 3        Stack: [3]
  Read 4  -> push 4        Stack: [3, 4]
  Read +  -> pop 4, pop 3  Stack: []
             push 3+4=7    Stack: [7]
  Read 2  -> push 2        Stack: [7, 2]
  Read *  -> pop 2, pop 7  Stack: []
             push 7*2=14   Stack: [14]
  Result: 14
```

From ExprArith.evaluer() (TP6) -- recursive tree evaluation, not stack-based RPN:
```java
private double recursiveEvaluation(Arbre root) {
    Arbre gauche = root.arbreG();
    Arbre droit = root.arbreD();
    String renter = (String) root.racine();

    if (gauche.estVide() || droit.estVide()) {
        // Leaf: return numeric value or variable
        try { return Double.parseDouble(renter); }
        catch (NumberFormatException e) {}
        return this.valeur(renter);
    } else {
        double dgauche = recursiveEvaluation(gauche);
        double ddroite = recursiveEvaluation(droit);
        switch (renter) {
            case "+": return dgauche + ddroite;
            case "-": return dgauche - ddroite;
            case "*": return dgauche * ddroite;
            case "/": return dgauche / ddroite;
            default: throw new IllegalArgumentException("UNKNOWN OPERATION");
        }
    }
}
```

### 2. BFS (Breadth-First Search) -- Queue

```
Graph:  A --- B --- D
        |         |
        C --- E ---

BFS from A using a queue:
  Queue: [A]           Visited: {A}
  Dequeue A, enqueue B,C
  Queue: [B, C]        Visited: {A, B, C}
  Dequeue B, enqueue D
  Queue: [C, D]        Visited: {A, B, C, D}
  Dequeue C, enqueue E
  Queue: [D, E]        Visited: {A, B, C, D, E}
  ...

Order: A, B, C, D, E  (level by level)
```

### 3. DFS (Depth-First Search) -- Stack

```
DFS from A using a stack:
  Stack: [A]           Visited: {A}
  Pop A, push C, B
  Stack: [C, B]        Visited: {A}  -> visit A
  Pop B, push D
  Stack: [C, D]        Visited: {A, B}
  Pop D, push E
  Stack: [C, E]        Visited: {A, B, D}
  Pop E
  Stack: [C]           Visited: {A, B, D, E}
  Pop C
  Stack: []            Visited: {A, B, D, E, C}

Order: A, B, D, E, C  (goes deep first)
```

### 4. Dijkstra -- Priority Queue (see Chapter 6-7)

Dijkstra uses a **priority queue** (min-heap) which is a specialized queue where dequeue always returns the minimum element.


## Java Standard Library

| Structure | Java Class | Key Methods |
|-----------|-----------|-------------|
| Stack | `java.util.ArrayDeque` | `push()`, `pop()`, `peek()` |
| Queue | `java.util.ArrayDeque` | `offer()`, `poll()`, `peek()` |
| Priority Queue | `java.util.PriorityQueue` | `add()`, `poll()`, `peek()` |

Note: `java.util.Stack` exists but is legacy. Prefer `ArrayDeque`.

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);  // add to top
stack.push(2);
int top = stack.pop();  // 2

Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1);  // add to back
queue.offer(2);
int front = queue.poll();  // 1
```


## Complexity

| Operation | Array Stack | Linked Stack | Circular Queue | Linked Queue |
|-----------|------------|--------------|---------------|--------------|
| push/enqueue | O(1)* | O(1) | O(1) | O(1) |
| pop/dequeue | O(1) | O(1) | O(1) | O(1) |
| peek | O(1) | O(1) | O(1) | O(1) |
| isEmpty | O(1) | O(1) | O(1) | O(1) |
| Space | O(n) | O(n) | O(n) | O(n) |

*Amortized O(1) if array needs resizing.


## CHEAT SHEET

```
STACK (LIFO)                         QUEUE (FIFO)
============                         ============
push(x): add to top                  enqueue(x): add to back
pop():   remove from top             dequeue():  remove from front
peek():  see top                     peek():     see front

APPLICATIONS:
  Stack: DFS, expression eval, undo, recursion simulation
  Queue: BFS, scheduling, buffering
  PriorityQueue: Dijkstra, heap sort, task scheduling

POSTFIX EVALUATION (stack):
  For each token:
    number -> push
    operator -> pop 2, compute, push result
  Final answer = pop

JAVA:
  Deque<T> stack = new ArrayDeque<>();   // push, pop, peek
  Deque<T> queue = new ArrayDeque<>();   // offer, poll, peek
```
