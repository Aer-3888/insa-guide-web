---
title: "Piles et Files"
sidebar_position: 3
---

# Piles et Files

## Theorie

Les piles et files sont des structures de donnees a **acces restreint**. Elles sont utilisees intensivement dans le cours SDD comme briques de base pour les algorithmes (evaluation d'expressions, BFS, Dijkstra, notation polonaise inverse).

### Pile -- LIFO

**Dernier Entre, Premier Sorti.** Imaginez une pile d'assiettes.

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

Operations :
- `push(x)` -- ajouter au sommet : O(1)
- `pop()` -- retirer du sommet : O(1)
- `peek()` -- voir le sommet sans retirer : O(1)
- `isEmpty()` -- verifier si vide : O(1)

### File -- FIFO

**Premier Entre, Premier Sorti.** Imaginez une file d'attente dans un magasin.

```
  enqueue(A)  enqueue(B)  enqueue(C)  dequeue() -> A
  front                                front
   |                                    |
  [A]        [A][B]      [A][B][C]     [B][C]
```

Operations :
- `enqueue(x)` -- ajouter a l'arriere : O(1)
- `dequeue()` -- retirer de l'avant : O(1)
- `peek()` -- voir l'avant sans retirer : O(1)
- `isEmpty()` -- verifier si vide : O(1)


## Implementations

### Pile sur Tableau

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

### Pile sur Liste Chainee

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

### File avec Tableau Circulaire

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


## Applications en SDD

### 1. Notation Polonaise Inverse (NPI)

Utilisee dans le TP6 (ExprArith) et le TP8 (Le Compte est Bon). Une pile evalue les expressions postfixes.

```
Expression : (3 + 4) * 2
Postfixe :    3 4 + 2 *

Evaluation avec une pile :
  Lire 3  -> empiler 3       Pile : [3]
  Lire 4  -> empiler 4       Pile : [3, 4]
  Lire +  -> depiler 4, depiler 3  Pile : []
             empiler 3+4=7   Pile : [7]
  Lire 2  -> empiler 2       Pile : [7, 2]
  Lire *  -> depiler 2, depiler 7  Pile : []
             empiler 7*2=14  Pile : [14]
  Resultat : 14
```

Depuis ExprArith.evaluer() (TP6) -- evaluation recursive de l'arbre, pas NPI avec pile :
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

### 2. BFS (Parcours en Largeur) -- File

```
Graphe :  A --- B --- D
          |         |
          C --- E ---

BFS depuis A avec une file :
  File : [A]           Visites : {A}
  Defiler A, enfiler B,C
  File : [B, C]        Visites : {A, B, C}
  Defiler B, enfiler D
  File : [C, D]        Visites : {A, B, C, D}
  Defiler C, enfiler E
  File : [D, E]        Visites : {A, B, C, D, E}
  ...

Ordre : A, B, C, D, E  (niveau par niveau)
```

### 3. DFS (Parcours en Profondeur) -- Pile

```
DFS depuis A avec une pile :
  Pile : [A]           Visites : {A}
  Depiler A, empiler C, B
  Pile : [C, B]        Visites : {A}  -> visiter A
  Depiler B, empiler D
  Pile : [C, D]        Visites : {A, B}
  Depiler D, empiler E
  Pile : [C, E]        Visites : {A, B, D}
  Depiler E
  Pile : [C]           Visites : {A, B, D, E}
  Depiler C
  Pile : []            Visites : {A, B, D, E, C}

Ordre : A, B, D, E, C  (va en profondeur d'abord)
```

### 4. Dijkstra -- File de Priorite (voir Chapitres 6-7)

Dijkstra utilise une **file de priorite** (tas min) qui est une file specialisee ou le defiler retourne toujours l'element minimum.


## Bibliotheque Standard Java

| Structure | Classe Java | Methodes clefs |
|-----------|-----------|-------------|
| Pile | `java.util.ArrayDeque` | `push()`, `pop()`, `peek()` |
| File | `java.util.ArrayDeque` | `offer()`, `poll()`, `peek()` |
| File de Priorite | `java.util.PriorityQueue` | `add()`, `poll()`, `peek()` |

Note : `java.util.Stack` existe mais est obsolete. Preferer `ArrayDeque`.

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


## Complexite

| Operation | Pile Tableau | Pile Chainee | File Circulaire | File Chainee |
|-----------|------------|--------------|---------------|--------------|
| push/enqueue | O(1)* | O(1) | O(1) | O(1) |
| pop/dequeue | O(1) | O(1) | O(1) | O(1) |
| peek | O(1) | O(1) | O(1) | O(1) |
| isEmpty | O(1) | O(1) | O(1) | O(1) |
| Espace | O(n) | O(n) | O(n) | O(n) |

*O(1) amorti si le tableau doit etre redimensionne.


## AIDE-MEMOIRE

```
PILE (LIFO)                          FILE (FIFO)
============                         ============
push(x) : ajouter au sommet         enqueue(x) : ajouter a l'arriere
pop() :   retirer du sommet          dequeue() :  retirer de l'avant
peek() :  voir le sommet             peek() :     voir l'avant

APPLICATIONS :
  Pile : DFS, evaluation d'expressions, undo, simulation de recursion
  File : BFS, ordonnancement, mise en tampon
  File de Priorite : Dijkstra, tri par tas, ordonnancement de taches

EVALUATION POSTFIXE (pile) :
  Pour chaque token :
    nombre -> empiler
    operateur -> depiler 2, calculer, empiler le resultat
  Reponse finale = depiler

JAVA :
  Deque<T> stack = new ArrayDeque<>();   // push, pop, peek
  Deque<T> queue = new ArrayDeque<>();   // offer, poll, peek
```
