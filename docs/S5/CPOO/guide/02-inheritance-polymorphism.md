---
title: "Inheritance and Polymorphism"
sidebar_position: 2
---

# Inheritance and Polymorphism

## Theory

### Inheritance (`extends`)

Inheritance creates an "is-a" relationship. A subclass inherits all non-private members of its parent class and can specialize or extend behavior.

```java
public abstract class Arbre {
    protected double age;
    protected double volume;

    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }

    public void vieillir() {
        this.age++;             // shared behavior
    }

    protected abstract double getPrixM3();    // must be implemented by subclasses
    public abstract double getAgeMinCoupe();
}

public class Chene extends Arbre {
    public Chene(double age, double volume) {
        super(age, volume);    // call parent constructor
    }

    @Override
    protected double getPrixM3() {
        return 1000;           // oak-specific price
    }

    @Override
    public double getAgeMinCoupe() {
        return 10;
    }
}

public class Pin extends Arbre {
    public Pin(double age, double volume) {
        super(age, volume);
    }

    @Override
    protected double getPrixM3() {
        return 500;            // pine-specific price
    }

    @Override
    public double getAgeMinCoupe() {
        return 5;
    }
}
```

### Abstract Classes

An abstract class **cannot be instantiated** directly. It may contain:
- Concrete methods (with implementation, e.g. `vieillir()`, `getPrix()`)
- Abstract methods (no body, must be overridden by subclasses)
- Constructors (called via `super()` from subclasses)
- Fields (including `protected` fields shared with subclasses)

```java
public abstract class Arbre {
    // Concrete method -- shared by all tree types
    public double getPrix() {
        return this.volume * this.getPrixM3();
    }

    // Concrete method -- same logic for all
    public boolean peutEtreCoupe() {
        return this.age >= this.getAgeMinCoupe();
    }

    // Abstract methods -- subclass-specific
    protected abstract double getPrixM3();
    public abstract double getAgeMinCoupe();
}
```

**When to use abstract classes vs interfaces**:

| Feature | Abstract Class | Interface |
|---------|---------------|-----------|
| Fields | Yes (any type) | Only `static final` constants |
| Constructors | Yes | No |
| Concrete methods | Yes | Yes (default methods since Java 8) |
| Multiple inheritance | No (single extends) | Yes (implement multiple) |
| Use when | Shared state + behavior | Contract / capability |

### Interfaces

An interface defines a contract -- a set of methods that implementing classes must provide.

```java
public interface Network {
    boolean ping(String address) throws NetworkException;
    void sendGetHTTPQuery(String address);
}

interface Service {
    int getLatency();
}

interface Pion {
    int getX();
    int getY();
}

public interface ITranslation {
    int getTx();
    int getTy();
}
```

Interfaces are central to **dependency inversion**: depend on abstractions, not concrete classes. This is what enables mocking in tests.

### Polymorphism

Polymorphism means "many forms." The same method call produces different behavior depending on the actual object type at runtime.

```java
// Reference type: Arbre     Actual type: Chene or Pin
List<Arbre> arbres = new ArrayList<>();
arbres.add(new Chene(15, 2.5));   // Chene is an Arbre
arbres.add(new Pin(8, 1.0));      // Pin is an Arbre

for (Arbre arbre : arbres) {
    // getPrix() calls the correct getPrixM3() depending on actual type
    System.out.println(arbre.getPrix());
    // Chene: 2.5 * 1000 = 2500
    // Pin:   1.0 * 500  = 500
}
```

### Dynamic Binding (Late Binding)

At compile time, Java checks that the **reference type** has the method. At runtime, Java dispatches to the **actual type's** implementation.

```java
Arbre tree = new Chene(15, 2.0);
tree.getPrix();          // Calls Chene's getPrixM3() at runtime
// Compiler checks: Arbre has getPrix()? Yes.
// Runtime dispatches: actual type is Chene, so Chene.getPrixM3() is called.
```

### The `instanceof` Operator

Runtime type checking -- use sparingly (it often signals a design issue, but the course explicitly teaches it).

```java
public int getNombreChenes() {
    int nombreChenes = 0;
    for (Arbre arbre : arbres) {
        if (arbre instanceof Chene) {   // runtime type check
            nombreChenes++;
        }
    }
    return nombreChenes;
}
```

### Method Overriding vs Overloading

**Overriding** (runtime polymorphism): subclass redefines a parent method with the same signature.
```java
@Override
public Gland produireFruit() {   // same name, covariant return type
    return new Gland();
}
```

**Overloading** (compile-time): same class defines multiple methods with the same name but different parameter lists.
```java
public void translate(double tx, double ty) { ... }
public void translate(ITranslation translation) { ... }
```

### The `@Override` Annotation

Always use `@Override` when overriding a method. It gives compile-time verification that you are actually overriding something (catches typos and signature mismatches).

```java
@Override
public void manger(Gland gland) {
    // correct override of Animal<Gland>.manger(Gland)
}
```

## Pattern: Template Method

The `Arbre` hierarchy uses the Template Method pattern: the base class defines the algorithm skeleton (`getPrix()` calls `getPrixM3()`) and subclasses fill in the varying steps.

```
Arbre.getPrix()  -->  calls this.getPrixM3()  -->  dispatched to Chene.getPrixM3() or Pin.getPrixM3()
     ^                                                              ^
     |                                                              |
 Algorithm skeleton                                        Variable step
```

## Common Pitfalls

1. **Forgetting `super()` in subclass constructors**: if the parent has no no-arg constructor, you MUST explicitly call `super(args)`.
2. **Casting without checking**: always use `instanceof` before casting: `if (arbre instanceof Chene c) { ... }`.
3. **Confusing reference type and actual type**: `Arbre a = new Chene(...)` -- `a` is typed as `Arbre` but behaves as `Chene` for overridden methods.
4. **Abstract method not implemented**: forgetting `@Override` and mistyping the method name creates a new method instead of overriding.

---

## CHEAT SHEET

```
INHERITANCE
  class Child extends Parent { ... }
  - Single inheritance only (one extends)
  - Can implement multiple interfaces
  - super() calls parent constructor (must be first line)
  - super.method() calls parent's version of an overridden method

ABSTRACT CLASSES
  abstract class X {
      abstract void doSomething();    // no body
      void concreteMethod() { ... }  // has body
  }
  - Cannot instantiate: new X() is illegal
  - Subclasses MUST implement all abstract methods (or also be abstract)

INTERFACES
  interface Y {
      void doSomething();            // implicitly public abstract
      default void helper() { ... }  // Java 8+ default method
  }
  - class Z implements Y, W { ... }  // multiple interfaces OK

POLYMORPHISM
  Parent ref = new Child();
  ref.method();  // dispatched to Child.method() at runtime

instanceof
  if (obj instanceof Type t) {
      // t is already cast to Type (Java 16+ pattern matching)
  }

@Override
  - Always use when overriding
  - Compile error if method does not actually override anything

OVERRIDING RULES
  - Same method name and parameter types
  - Return type can be covariant (more specific)
  - Access cannot be more restrictive
  - Cannot override private or static methods
```
