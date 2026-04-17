---
title: "Collections and Generics"
sidebar_position: 5
---

# Collections and Generics

## Theory

### Java Collections Framework

The Collections Framework provides interfaces and implementations for storing and manipulating groups of objects.

```
              Iterable
                 |
            Collection
           /    |     \
         List  Set    Queue
          |     |
    ArrayList  HashSet
    LinkedList TreeSet
```

### List

Ordered collection (maintains insertion order), allows duplicates.

```java
List<Arbre> arbres = new ArrayList<>();       // most common
List<Arbre> linked = new LinkedList<>();      // better for frequent insertions/removals

// Common operations
arbres.add(new Chene(10, 2.0));               // add at end
arbres.get(0);                                 // access by index
arbres.size();                                 // number of elements
arbres.contains(someArbre);                   // membership check
arbres.remove(someArbre);                     // remove by object
arbres.remove(0);                              // remove by index
arbres.isEmpty();                              // check if empty
```

### Set

No duplicates, no guaranteed order (HashSet) or sorted order (TreeSet).

```java
Set<String> names = new HashSet<>();
names.add("Chene");
names.add("Chene");          // ignored, already present
// names.size() == 1
```

### Map

Key-value pairs. Each key maps to at most one value.

```java
Map<String, Integer> prices = new HashMap<>();
prices.put("Chene", 1000);
prices.put("Pin", 500);
int oakPrice = prices.get("Chene");    // 1000
```

### Iterating Collections

**For-each loop** (preferred for reading):
```java
for (Arbre arbre : arbres) {
    System.out.println(arbre.getPrix());
}
```

**Iterator** (required when modifying during iteration):
```java
Iterator<Arbre> iterator = arbres.iterator();
while (iterator.hasNext()) {
    Arbre arbre = iterator.next();
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        iterator.remove();           // SAFE removal
        return true;
    }
}
```

**Streams** (functional style):
```java
double total = arbres.stream()
    .mapToDouble(Arbre::getPrix)
    .sum();

int totalLatency = services.stream()
    .mapToInt(Service::getLatency)
    .sum();
```

### ConcurrentModificationException

This is the most commonly tested collection pitfall in CPOO exams.

**WRONG** -- modifying a list during for-each iteration:
```java
for (Arbre arbre : arbres) {
    if (arbre.peutEtreCoupe()) {
        arbres.remove(arbre);    // ConcurrentModificationException!
    }
}
```

**CORRECT** -- use Iterator.remove():
```java
Iterator<Arbre> it = arbres.iterator();
while (it.hasNext()) {
    Arbre arbre = it.next();
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        it.remove();             // safe
        return true;
    }
}
```

**CORRECT** -- use reverse index loop:
```java
for (int i = arbres.size() - 1; i >= 0; i--) {
    if (arbres.get(i).peutEtreCoupe()) {
        arbres_coupes.add(arbres.get(i));
        arbres.remove(i);
        return true;
    }
}
```

### Unmodifiable Collections

```java
private final List<Pion> pions;

public List<Pion> getPions() {
    return Collections.unmodifiableList(pions);   // read-only view
}
// Callers can read but cannot add/remove/clear
```

---

## Generics

### Why Generics?

Without generics, collections store `Object` and require casting:
```java
List arbres = new ArrayList();
arbres.add(new Chene(10, 2.0));
Chene c = (Chene) arbres.get(0);   // unsafe cast, may fail at runtime
```

With generics, the compiler enforces type safety:
```java
List<Arbre> arbres = new ArrayList<>();
arbres.add(new Chene(10, 2.0));
Arbre a = arbres.get(0);            // no cast needed, type-safe
```

### Generic Classes

```java
public abstract class Arbre<F extends Fruit> {
    public abstract F produireFruit();
}

public class Chene extends Arbre<Gland> {
    @Override
    public Gland produireFruit() {
        return new Gland();           // type-safe: returns Gland, not just Fruit
    }
}
```

The type parameter `<F extends Fruit>` means:
- `F` is a type variable
- `F` must be `Fruit` or a subclass of `Fruit`
- Concrete subclasses bind `F` to a specific type (e.g., `Gland`, `Cone`)

### Generic Interfaces

```java
public abstract class Animal<F extends Fruit> {
    public abstract void manger(F fruit);
}

public class Cochon extends Animal<Gland> {
    @Override
    public void manger(Gland gland) { /* eats acorns */ }
}

public class Ecureuil extends Animal<Cone> {
    @Override
    public void manger(Cone cone) { /* eats pine cones */ }
}
```

### Type Safety in Action

```java
Chene oak = new Chene(15, 2.5);
Gland acorn = oak.produireFruit();      // compile-time: returns Gland

Cochon pig = new Cochon();
pig.manger(acorn);                       // OK: Cochon eats Gland

Cone cone = new Cone();
pig.manger(cone);                        // COMPILE ERROR: Cochon expects Gland
```

### Wildcards (for reference)

```java
List<?> anything;                        // unknown type
List<? extends Arbre> trees;             // Arbre or any subclass
List<? super Chene> acceptsOaks;         // Chene or any superclass
```

### Raw Types (to avoid)

Using generic classes without type parameters creates raw types:
```java
List list = new ArrayList();             // raw type -- avoid!
List<Arbre> list = new ArrayList<>();    // correct -- type-safe
```

The diamond operator `<>` infers the type from context.

---

## Common Pitfalls

1. **ConcurrentModificationException**: never modify a collection inside a for-each loop. Use `Iterator.remove()` or index-based removal.
2. **Not initializing collections**: `private List<Arbre> arbres;` without initialization in the constructor causes `NullPointerException` on first use.
3. **Returning mutable internal state**: `return arbres;` lets callers modify your internal list. Use `Collections.unmodifiableList()`.
4. **Incorrect generic bounds**: `Arbre<Fruit>` is not the same as `Arbre<? extends Fruit>`. The first is a concrete type, the second is a wildcard.
5. **Using `instanceof` excessively**: if you find yourself doing `if (arbre instanceof Chene)` everywhere, consider redesigning with polymorphism.

---

## CHEAT SHEET

```
COLLECTION TYPES
  List<E>    = ordered, duplicates OK          -> ArrayList, LinkedList
  Set<E>     = no duplicates                    -> HashSet, TreeSet
  Map<K,V>   = key-value pairs                  -> HashMap, TreeMap
  Queue<E>   = FIFO                             -> LinkedList, ArrayDeque

COMMON OPERATIONS
  .add(e)     .remove(e)     .contains(e)     .size()     .isEmpty()
  .get(i)     .set(i, e)     .indexOf(e)      .clear()
  .stream()   .iterator()

SAFE REMOVAL DURING ITERATION
  Iterator<E> it = list.iterator();
  while (it.hasNext()) {
      E e = it.next();
      if (condition) it.remove();   // safe
  }

UNMODIFIABLE
  Collections.unmodifiableList(list)   // read-only view

GENERICS SYNTAX
  class MyClass<T> { ... }                  // generic class
  class MyClass<T extends Bound> { ... }    // bounded type
  <T> void method(T param) { ... }          // generic method
  ? extends Type                            // upper bound wildcard
  ? super Type                              // lower bound wildcard

DIAMOND OPERATOR
  List<Arbre> list = new ArrayList<>();     // infers <Arbre>
```
