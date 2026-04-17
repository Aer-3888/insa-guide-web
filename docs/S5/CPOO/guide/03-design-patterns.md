---
title: "Design Patterns"
sidebar_position: 3
---

# Design Patterns

## Theory

Design patterns are reusable solutions to commonly occurring problems in software design. The CPOO course focuses on patterns that appear in OOP class hierarchies and exam questions.

---

## 1. Strategy Pattern

**Intent**: Define a family of algorithms, encapsulate each one, and make them interchangeable. The client code depends on the interface, not the concrete implementation.

**Structure**:
```
  +-----------+          +------------------+
  |  Context  |--------->|  <<interface>>   |
  |-----------|          |    Strategy      |
  | - strategy|          +------------------+
  | + execute()|         | + algorithm()    |
  +-----------+          +------------------+
                              ^         ^
                              |         |
                  +-----------+    +----------+
                  | ConcreteA |    | ConcreteB|
                  +-----------+    +----------+
```

**Course example**: `Animal<F extends Fruit>` uses generics as a type-safe strategy for eating different fruit types.

```java
public abstract class Animal<F extends Fruit> {
    public abstract void manger(F fruit);   // strategy: what to eat
}

public class Cochon extends Animal<Gland> {
    @Override
    public void manger(Gland gland) { /* pig eats acorns */ }
}

public class Ecureuil extends Animal<Cone> {
    @Override
    public void manger(Cone cone) { /* squirrel eats pine cones */ }
}
```

**When to use**: when you have multiple ways to perform an operation and want to swap them without changing client code.

---

## 2. Observer Pattern

**Intent**: Define a one-to-many dependency so that when one object (the subject) changes state, all its dependents (observers) are notified automatically.

**Structure**:
```
  +-------------+          +------------------+
  |   Subject   |--------->|  <<interface>>   |
  |-------------|  0..*    |    Observer       |
  | + attach()  |          +------------------+
  | + notify()  |          | + update()       |
  +-------------+          +------------------+
                                   ^
                                   |
                           +-------+-------+
                           | ConcreteObs   |
                           +---------------+
```

**Exam example (2024-2025)**: The `Traitement` class uses an `Observateur` interface to notify observers based on input.

```java
public interface Observateur {
    void a();
    void b(String str);
}

public class Traitement {
    private final Observateur obs;

    public Traitement(Observateur obs) {
        this.obs = obs;
    }

    public void analyser(String str) {
        switch(str) {
            case "a" -> obs.a();
            case "b" -> obs.b(str);
            default -> throw new IllegalArgumentException();
        }
    }
}
```

**When to use**: event systems, UI updates, publisher/subscriber scenarios.

---

## 3. Factory Pattern

**Intent**: Provide an interface for creating objects without specifying their exact class. Let subclasses or a factory method decide which class to instantiate.

### Simple Factory Method

```java
public class A {
    // Static factory method -- returns A or null
    public static A create(final B b) {
        try {
            return new A(b);
        } catch (final IllegalArgumentException ex) {
            return null;
        }
    }
}

// Usage
A obj = A.create(someB);   // cleaner than try/catch at call site
```

### Factory with Subclass Selection

```java
public abstract class Arbre<F extends Fruit> {
    public abstract F produireFruit();   // each subclass produces its own fruit type
}

// Each tree "factory-produces" its specific fruit
Chene oak = new Chene(15, 2.5);
Gland acorn = oak.produireFruit();       // factory method returns Gland

Pin pine = new Pin(8, 1.0);
Cone cone = pine.produireFruit();        // factory method returns Cone
```

**When to use**: when object creation logic is complex, when you want to decouple the client from specific classes, or when construction may fail.

---

## 4. Singleton Pattern

**Intent**: Ensure a class has exactly one instance and provide a global point of access to it.

```java
public class Registry {
    private static final Registry INSTANCE = new Registry();

    private Registry() { }                  // private constructor

    public static Registry getInstance() {
        return INSTANCE;
    }
}
```

**Caution**: Singletons make testing difficult because they introduce global state. Prefer dependency injection where possible.

---

## 5. MVC (Model-View-Controller)

**Intent**: Separate an application into three interconnected components to separate concerns.

```
  +-------+     updates     +------+     renders     +------+
  | Model | <-------------- | Ctrl | --------------> | View |
  +-------+                 +------+                 +------+
      |                         ^                        |
      |      notifies           |       user input       |
      +-------------------------+------------------------+
```

- **Model**: data and business logic (e.g., `Arbre`, `Foret` classes)
- **View**: presentation layer (displays data to user)
- **Controller**: handles user input, updates model, selects view

In the CPOO course context, the TP code follows a simplified MVC where domain classes (Model) are tested independently of any UI.

---

## 6. Decorator Pattern

**Intent**: Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing.

```
  +------------------+
  |  <<interface>>   |
  |    Component     |
  +------------------+
  | + operation()    |
  +------------------+
        ^         ^
        |         |
  +----------+  +-----------+
  | Concrete |  | Decorator |-----> Component
  +----------+  +-----------+
                | + operation()|
                +-----------+
```

```java
// Conceptual example
interface Boisson {
    double prix();
    String description();
}

class Cafe implements Boisson {
    public double prix() { return 1.50; }
    public String description() { return "Cafe"; }
}

class AvecLait implements Boisson {
    private final Boisson boisson;
    public AvecLait(Boisson b) { this.boisson = b; }
    public double prix() { return boisson.prix() + 0.30; }
    public String description() { return boisson.description() + " + Lait"; }
}

// Usage: new AvecLait(new Cafe()).prix() => 1.80
```

---

## 7. Composite Pattern

**Intent**: Compose objects into tree structures to represent part-whole hierarchies. Clients treat individual objects and compositions uniformly.

```
  +------------------+
  |  <<interface>>   |
  |    Component     |
  +------------------+
  | + operation()    |
  +------------------+
        ^         ^
        |         |
  +----------+  +-------------+
  |   Leaf   |  |  Composite  |----> 0..* Component
  +----------+  +-------------+
                | + add()      |
                | + remove()   |
                +-------------+
```

**Exam example (2020-2021)**: Arithmetic formula tree where a node is either a literal value, a constant reference, or an operator (addition/subtraction) with two operands (left and right). The formula and all nodes are "calculable" -- they implement a `calculer(): double` method.

```
  +------------------+
  |  <<interface>>   |
  |   Calculable     |
  +------------------+
  | + calculer(): double |
  +------------------+
        ^    ^    ^
        |    |    |
  +-------+ +--------+ +-----------+
  | Valeur| |  Ref   | | Operateur |
  +-------+ +--------+ +-----------+
                            ^    ^
                            |    |
                     +--------+ +--------+
                     |Addition| |Soustraction|
                     +--------+ +--------+
```

---

## Patterns in the Course Material

| Pattern | Where It Appears |
|---------|-----------------|
| Template Method | `Arbre.getPrix()` calls abstract `getPrixM3()` |
| Strategy (via generics) | `Animal<F>` / `Arbre<F>` with type-specific behavior |
| Factory Method | `A.create(B b)` static factory |
| Observer | Exam 2024-2025 `Traitement`/`Observateur` |
| Composite | Exam 2020-2021 arithmetic formula tree |

## Common Pitfalls

1. **Over-engineering**: do not apply patterns where a simple solution suffices.
2. **Confusing Strategy and Template Method**: Strategy uses composition (object holds a strategy reference); Template Method uses inheritance (subclass overrides steps).
3. **Singleton abuse**: in tests, singletons make mocking very difficult. The course teaches `mockConstruction` and `mockStatic` to work around this.
4. **Missing the pattern in exam questions**: read UML text carefully for keywords like "composed of," "is-a," "has different types of" to identify which pattern fits.

---

## CHEAT SHEET

```
STRATEGY        = interface + multiple implementations, context holds reference
OBSERVER        = subject notifies observers on state change (1-to-many)
FACTORY         = static method or separate class creates objects
SINGLETON       = private constructor + static getInstance()
MVC             = Model (data) + View (display) + Controller (logic)
DECORATOR       = wraps an object, adds behavior, same interface
COMPOSITE       = tree structure, leaf and composite share interface
TEMPLATE METHOD = base class algorithm, subclasses override steps

EXAM KEYWORDS TO PATTERN MAPPING:
  "different types of X"        -> Inheritance / Strategy
  "composed of / contains"      -> Composite / Aggregation
  "notify / update"             -> Observer
  "create / factory"            -> Factory Method
  "tree structure / recursive"  -> Composite
  "wraps / adds behavior"       -> Decorator
```
