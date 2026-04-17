---
title: "TP CPOO1 - Exercise 2: Forest Management System (Arbre/Foret)"
sidebar_position: 2
---

# TP CPOO1 - Exercise 2: Forest Management System (Arbre/Foret)

## Overview

This lab focuses on implementing an object-oriented forest management system using inheritance, polymorphism, collections, and generics. Students learn to model real-world hierarchies using abstract classes and concrete implementations.

## Learning Objectives

- Design and implement class hierarchies using inheritance
- Use abstract classes and methods for common behavior
- Implement polymorphism for specialized behavior
- Work with Java Collections (ArrayList)
- Use the `instanceof` operator for runtime type checking
- Apply generics for type-safe fruit production
- Handle iterators correctly to avoid ConcurrentModificationException

## Project Structure

```
tp2/
├── basic/          # Basic version without generics (Q.7-Q.17)
│   └── src/
│       ├── main/java/
│       │   ├── Arbre.java
│       │   ├── Chene.java
│       │   ├── Pin.java
│       │   └── Foret.java
│       └── test/java/
└── advanced/       # Advanced version with generics and animals (Q.18-Q.20)
    └── src/
        ├── main/java/
        │   ├── Arbre.java      (with generics)
        │   ├── Chene.java
        │   ├── Pin.java
        │   ├── Foret.java
        │   ├── Fruit.java      (interface)
        │   ├── Gland.java
        │   ├── Cone.java
        │   ├── Animal.java     (interface)
        │   ├── Ecureuil.java
        │   └── Cochon.java
        └── test/java/
```

## Problem Description

A forest consists of two types of trees: oak trees (chêne) and pine trees (pin). Each tree has:
- **Price**: per cubic meter (€/m³)
  - Oak: €1000/m³, must be at least 10 years old to cut
  - Pine: €500/m³, must be at least 5 years old to cut
- **Age**: in years (increases with `vieillir()`)
- **Volume**: in cubic meters (m³)

The price of a tree is calculated as: `price_per_m3 × volume`.

## Exercises

### Q.7 - Draw UML Class Diagram

Design a UML class diagram representing the inheritance hierarchy:
- Abstract class `Arbre` with common attributes and methods
- Concrete classes `Chene` and `Pin` extending `Arbre`

**Key Design Decisions:**
- Use inheritance to avoid code duplication
- Abstract class for shared behavior
- Concrete classes for specialized behavior

### Q.8 - Implement Basic Tree Classes

Implement the class diagram in Java:

**Arbre.java** (abstract):
- `protected int prix` - price per cubic meter
- `protected double age` - age in years
- `protected double volume` - volume in m³
- `protected double age_coupe` - minimum age to cut
- `public Arbre(double age, double volume)` - constructor
- `public void vieillir()` - increment age
- `public double getAge()` - get age
- `public double getVolume()` - get volume
- `public double getPrix()` - calculate total price
- `public boolean peutEtreCoupe()` - check if tree can be cut

### Q.9 - Constructor with Parameters

Add a constructor to `Arbre` that takes `age` and `volume` as parameters.
Update subclass constructors to call `super(age, volume)`.

### Q.10 - Add `vieillir()` Method

Implement `vieillir()` to increment the tree's age by one year.

### Q.11 - Add `getPrix()` Method

Implement `getPrix()` to return the total price: `prix * volume`.

### Q.12 - Add `peutEtreCoupe()` Method

Implement `peutEtreCoupe()` to return `true` if the tree is old enough to be cut.

### Q.13 - Implement Foret Class

Create a `Foret` class to manage a collection of trees:

**Foret.java**:
- `private List<Arbre> arbres` - trees in the forest
- `private List<Arbre> arbres_coupes` - trees that have been cut
- `public Foret()` - constructor initializing empty lists
- `public List<Arbre> getArbres()` - get standing trees
- `public List<Arbre> getArbres_coupes()` - get cut trees

Use `ArrayList<Arbre>` for the collections. Include getters for both lists.

### Q.14 - Add `planterArbre()` Method

Add a method to plant a tree:
```java
public void planterArbre(Arbre arbre)
```

This adds the tree to the `arbres` list.

### Q.15 - Add `getPrixTotal()` Method

Add a method to calculate the total value of all standing trees:
```java
public double getPrixTotal()
```

Use a loop to sum the prices of all trees in the forest.

### Q.16 - Add `couperArbre()` Method

Add a method to cut a tree from the forest:
```java
public boolean couperArbre()
```

This should:
1. Find the first tree that can be cut (`peutEtreCoupe()`)
2. Move it from `arbres` to `arbres_coupes`
3. Return `true` if a tree was cut, `false` otherwise

**⚠️ Warning**: Avoid `ConcurrentModificationException`!

**Problem**:
```java
// WRONG: Modifying list while iterating
for (Arbre arbre : arbres) {
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        arbres.remove(arbre);  // ConcurrentModificationException!
        return true;
    }
}
```

**Solution 1: Use Iterator**:
```java
Iterator<Arbre> iterator = arbres.iterator();
while (iterator.hasNext()) {
    Arbre arbre = iterator.next();
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        iterator.remove();  // Safe removal
        return true;
    }
}
```

**Solution 2: Use Index-Based Loop (Reverse Order)**:
```java
for (int i = arbres.size() - 1; i >= 0; i--) {
    Arbre arbre = arbres.get(i);
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        arbres.remove(i);
        return true;
    }
}
```

### Q.17 - Add `getNombreChenes()` Method

Add a method to count oak trees in the forest:
```java
public int getNombreChenes()
```

Use the `instanceof` operator:
```java
if (arbre instanceof Chene) {
    nombreChenes++;
}
```

## Advanced Version (with Generics and Animals)

### Q.18 - Add Fruit Production (Generics)

Trees produce different types of fruits:
- Oak trees (`Chene`) produce acorns (`Gland`)
- Pine trees (`Pin`) produce pine cones (`Cone`)

**Implementation**:
1. Create `Fruit` interface
2. Create `Gland` and `Cone` classes implementing `Fruit`
3. Modify `Arbre` to use generics: `Arbre<F extends Fruit>`
4. Add abstract method: `public abstract F produireFruit()`

**Arbre.java** (with generics):
```java
public abstract class Arbre<F extends Fruit> {
    // ... existing code ...
    public abstract F produireFruit();
}
```

**Chene.java**:
```java
public class Chene extends Arbre<Gland> {
    @Override
    public Gland produireFruit() {
        return new Gland();
    }
}
```

### Q.19 - Add Animal Classes

Animals live in the forest and eat specific fruits:
- Squirrels (`Ecureuil`) eat pine cones
- Pigs (`Cochon`) eat acorns

**Implementation**:
1. Create `Animal` interface with `manger(Fruit fruit)` method
2. Create `Ecureuil` and `Cochon` classes implementing `Animal`
3. Each animal should only eat its preferred fruit type

**Generic Method in Animal**:
```java
public interface Animal<F extends Fruit> {
    void manger(F fruit);
}
```

### Q.20 - Test the Complete System

Write comprehensive tests:
1. Create a forest with different trees
2. Age the trees
3. Harvest fruits from trees
4. Feed animals with appropriate fruits
5. Cut trees and calculate total value

## Key OOP Concepts

### 1. Inheritance
- Reuse common code in base class
- Specialize behavior in subclasses
- `extends` keyword establishes "is-a" relationship

### 2. Abstract Classes and Methods
- Cannot instantiate abstract classes
- Abstract methods must be implemented by subclasses
- Mix of concrete and abstract methods allowed

### 3. Polymorphism
- Reference type vs. actual object type
- Method dispatch based on actual type
- `instanceof` for runtime type checking

### 4. Collections
- `List<E>` interface for ordered collections
- `ArrayList<E>` for dynamic array implementation
- Avoid `ConcurrentModificationException`

### 5. Generics
- Type-safe collections and methods
- Bounded type parameters: `<F extends Fruit>`
- Compile-time type checking

## Common Issues and Solutions

### Issue 1: ConcurrentModificationException
**Problem**: Modifying a collection while iterating with foreach loop.
**Solution**: Use Iterator.remove() or index-based reverse loop.

### Issue 2: Null Pointer Exception
**Problem**: Not initializing collections in constructor.
**Solution**: Always initialize collections: `this.arbres = new ArrayList<>();`

### Issue 3: Wrong instanceof Usage
**Problem**: Using `instanceof` after type cast.
**Solution**: Check type before casting: `if (obj instanceof Type) { Type t = (Type) obj; }`

### Issue 4: Missing Abstract Method Implementation
**Problem**: Forgetting to implement abstract methods in concrete classes.
**Solution**: Use `@Override` annotation and let IDE show errors.

### Issue 5: Incorrect Generic Bounds
**Problem**: `Arbre<Fruit>` instead of `Arbre<F extends Fruit>`.
**Solution**: Use bounded type parameter in class declaration.

## Compilation and Execution

### Compile Basic Version
```bash
cd tp2/basic/src
javac main/java/*.java
```

### Compile Advanced Version
```bash
cd tp2/advanced/src
javac main/java/*.java
```

### Run Tests
```bash
# Using IntelliJ: Right-click on test class → Run
# Or compile and run manually:
javac -cp .:junit-5.jar test/java/*.java
java -cp .:junit-5.jar org.junit.platform.console.ConsoleLauncher --scan-classpath
```

## Testing Strategy

1. **Test Constructors**: Verify initial state
2. **Test Aging**: Verify `vieillir()` increments age
3. **Test Price Calculation**: Verify `getPrix()` formula
4. **Test Cutting Logic**: Verify age threshold
5. **Test Forest Operations**: Plant, cut, count trees
6. **Test Type Checking**: Verify `instanceof` works correctly
7. **Test Generics**: Verify type safety for fruits and animals

## UML Diagram (Advanced Version)

```
                    ┌─────────────────┐
                    │     <<abstract>> │
                    │      Arbre<F>    │
                    ├─────────────────┤
                    │ #age: double     │
                    │ #volume: double  │
                    ├─────────────────┤
                    │ +getAge()        │
                    │ +getVolume()     │
                    │ +vieillir()      │
                    │ +getPrix()       │
                    │ +peutEtreCoupe() │
                    │ +produireFruit():F│
                    └─────────────────┘
                            ▲
                            │
                   ┌────────┴────────┐
                   │                 │
          ┌────────────────┐  ┌─────────────┐
          │ Chene<Gland>   │  │  Pin<Cone>  │
          ├────────────────┤  ├─────────────┤
          │ -prix: int     │  │ -prix: int  │
          │ -age_coupe: dbl│  │ -age_coupe  │
          ├────────────────┤  ├─────────────┤
          │ +produireFruit()│ │+produireFruit()│
          └────────────────┘  └─────────────┘
                   │                 │
                   produces          produces
                   │                 │
          ┌────────────────┐  ┌─────────────┐
          │     Gland      │  │    Cone     │
          │  implements    │  │ implements  │
          │     Fruit      │  │   Fruit     │
          └────────────────┘  └─────────────┘
                   │                 │
                 eaten by          eaten by
                   │                 │
          ┌────────────────┐  ┌─────────────┐
          │    Cochon      │  │  Ecureuil   │
          │  implements    │  │ implements  │
          │  Animal<Gland> │  │Animal<Cone> │
          └────────────────┘  └─────────────┘
```

## Resources

- [Java Inheritance](https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html)
- [Abstract Classes](https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html)
- [Java Generics](https://docs.oracle.com/javase/tutorial/java/generics/)
- [ConcurrentModificationException](https://docs.oracle.com/javase/8/docs/api/java/util/ConcurrentModificationException.html)

## Author

INSA Rennes - Arnaud Blouin  
Course: CPOO (Conception et Programmation Orientee Objet) - 3rd Year CS
