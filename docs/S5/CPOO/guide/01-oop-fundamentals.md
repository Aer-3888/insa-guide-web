---
title: "OOP Fundamentals"
sidebar_position: 1
---

# OOP Fundamentals

## Theory

### What is Object-Oriented Programming?

OOP organizes software around **objects** -- bundles of data (attributes) and behavior (methods) -- rather than around functions and logic. The four pillars are: encapsulation, abstraction, inheritance, and polymorphism.

### Classes and Objects

A **class** is a blueprint; an **object** (instance) is a concrete realization of that blueprint.

```java
// Class definition (blueprint)
public class Velo {
    private Guidon guidon = null;   // attribute (field)

    public Guidon getGuidon() {     // method (behavior)
        return this.guidon;
    }

    public void setGuidon(Guidon gd) {
        this.guidon = gd;
    }
}

// Creating an object (instance)
Velo monVelo = new Velo();
```

### The `this` Keyword

`this` refers to the current object instance. It disambiguates between field names and parameter names and allows passing the current object to other methods.

```java
public void setGuidon(Guidon guidon) {
    this.guidon = guidon;          // this.guidon = field, guidon = parameter
}
```

### Constructors

Constructors initialize objects. If you write no constructor, Java provides a default no-arg constructor. Once you write any constructor, the default disappears.

```java
public class Arbre {
    protected double age;
    protected double volume;

    // Parameterized constructor
    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }
}

// Subclass must call super()
public class Chene extends Arbre {
    public Chene(double age, double volume) {
        super(age, volume);       // MUST be first statement
        this.prix = 1000;
    }
}
```

**Constructor chaining** with `this()`:

```java
public class MyPoint {
    private double x;
    private double y;

    public MyPoint() {
        this(0, 0);               // calls the two-arg constructor
    }

    public MyPoint(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public MyPoint(MyPoint pt) {
        this(pt.x, pt.y);        // copy constructor
    }
}
```

### Encapsulation

Encapsulation bundles data with the methods that operate on it, and restricts direct access to the internal state.

| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| `private` | Yes | No | No | No |
| (default) | Yes | Yes | No | No |
| `protected` | Yes | Yes | Yes | No |
| `public` | Yes | Yes | Yes | Yes |

**Best practice**: fields are `private`, accessed through `public` getters/setters. Internal fields shared with subclasses use `protected`.

```java
public abstract class Arbre {
    protected int prix;              // accessible to Chene, Pin
    protected double age;
    protected double volume;
    protected double age_coupe;

    public double getAge() {         // public getter
        return age;
    }
}
```

### Associations (UML to Java)

Associations represent "uses" or "has" relationships between classes.

**Unidirectional 0..1 association**:
```java
// Velo --guidon--> Guidon (0..1)
public class Velo {
    private Guidon guidon = null;    // null means no guidon

    public Guidon getGuidon() { return this.guidon; }
    public void setGuidon(Guidon gd) { this.guidon = gd; }
}
```

**Bidirectional 0..1 association with referential integrity**:
```java
// In Velo.java
public void setGuidon(Guidon gd) {
    if (gd != this.guidon) {         // avoid infinite recursion
        Guidon oldGuidon = this.guidon;
        if (gd == null && oldGuidon != null) {
            oldGuidon.setVelo(null); // clean up old link
        }
        this.guidon = gd;
        if (gd != null) {
            gd.setVelo(this);        // establish bidirectional link
        }
    }
}
```

**One-to-many association (0..\*)**:
```java
public class Velo {
    private List<Roue> roues;

    public Velo() {
        this.roues = new ArrayList<>();  // ALWAYS initialize in constructor
    }

    public Boolean addRoue(Roue r) {
        if (r == null || this.roues.contains(r)) {
            return false;                // reject null or duplicates
        }
        return this.roues.add(r);
    }

    public Boolean removeRoues(Roue r) {
        return this.roues.remove(r);
    }
}
```

**Composition with bidirectional navigation**:
```java
// In Velo.java -- the "whole"
public Boolean addRoue(Roue r) {
    if (r == null || this.roues.contains(r)) return false;
    this.roues.add(r);
    if (r.getVelo() != this) {
        r.setVelo(this);             // maintain referential integrity
    }
    return true;
}

// In Roue.java -- the "part"
public void setVelo(Velo vl) {
    if (this.velo == vl) return;     // avoid recursion
    if (this.velo != null) {
        Velo oldVelo = this.velo;
        this.velo = null;            // break old link first
        oldVelo.removeRoues(this);
    }
    this.velo = vl;
    if (vl != null && !vl.getRoues().contains(this)) {
        vl.addRoue(this);
    }
}
```

### The `final` Keyword

```java
public static final int SIZE = 5;       // constant: value cannot change

private final List<Pion> pions;          // reference cannot change, but
                                         // list contents CAN be modified
```

Key distinction:
- `final` on a **primitive**: the value itself cannot change
- `final` on a **reference**: the reference cannot point to a different object, but the object's internal state can still be modified

### `static` Members

`static` belongs to the class, not to instances.

```java
public class Chene extends Arbre<Gland> {
    private static final double AGE_MIN_COUPE = 10;  // shared across all Chene instances
}

// Static factory method
public static A create(final B b) {
    try {
        return new A(b);
    } catch (final IllegalArgumentException ex) {
        return null;
    }
}
```

## Common Pitfalls

1. **Forgetting to initialize collections**: `private List<Arbre> arbres;` without `= new ArrayList<>()` in the constructor causes `NullPointerException`.
2. **Infinite recursion in bidirectional setters**: always check `if (gd != this.guidon)` before calling the other side's setter.
3. **Breaking referential integrity**: when setting one side of a bidirectional association, always update the other side.
4. **Exposing mutable internal state**: returning `this.roues` directly allows callers to modify the list. Consider `Collections.unmodifiableList(roues)`.

---

## CHEAT SHEET

```
CLASS STRUCTURE
  public class ClassName {
      private Type field;                         // encapsulated field
      public ClassName() { ... }                  // constructor
      public Type getField() { return field; }    // getter
      public void setField(Type f) { field = f; } // setter
  }

CONSTRUCTOR RULES
  - Same name as class, no return type
  - super(...) must be first line in subclass constructor
  - this(...) chains to another constructor in same class
  - No explicit constructor => Java provides default no-arg

ASSOCIATION PATTERNS
  0..1   =>  private Type ref = null;
  1      =>  set in constructor, reject null
  0..*   =>  private List<Type> refs = new ArrayList<>();
  Bidirectional => update BOTH sides, guard against recursion

ACCESS MODIFIERS
  private < (default) < protected < public

FINAL
  final primitive  => constant value
  final reference  => fixed pointer, mutable contents
  final method     => cannot be overridden
  final class      => cannot be extended

STATIC
  static field     => shared across all instances (class-level)
  static method    => called via ClassName.method(), no 'this'
```
