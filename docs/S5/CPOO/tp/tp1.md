---
title: "TP CPOO1 - UML to Java: Associations and Composition"
sidebar_position: 1
---

# TP CPOO1 - UML to Java: Associations and Composition

## Overview

This lab focuses on implementing UML class diagrams in Java, exploring different types of associations between objects: simple associations, bidirectional associations, and composition relationships.

## Learning Objectives

- Convert UML class diagrams to Java code
- Implement unidirectional and bidirectional associations
- Understand and implement composition relationships
- Maintain referential integrity in bidirectional associations
- Write comprehensive JUnit tests for object relationships
- Use IntelliJ IDEA for Java development

## Prerequisites

- Java 11 or higher
- IntelliJ IDEA configured for Java development
- JUnit 5 for testing

## Project Structure

```
tp1/
├── q1/          # Exercise 1: Simple unidirectional association (Velo → Guidon)
├── q2/          # Exercise 2: Bidirectional association with referential integrity
├── q3/          # Exercise 3: Removing bidirectional access (Guidon cannot access Velo)
├── q4/          # Exercise 4: One-to-many association (Velo → Roue[*])
├── q5/          # Exercise 5: Composition with bidirectional navigation (Velo ↔ Roue)
└── q6/          # Exercise 6: Running tests with Moodle test suite
```

## Exercises

### Q.1 - Simple Association (0..1)

**Objective**: Create a simple unidirectional association between `Velo` and `Guidon`.

**UML Diagram**:
```
┌─────────────┐         guidon    ┌─────────────┐
│    Velo     │ ──────────────────>│   Guidon    │
│─────────────│         0..1       │─────────────│
│             │                    │             │
│ getGuidon() │        velo        │ getVelo()   │
│ setGuidon() │         0..1       │ setVelo()   │
└─────────────┘                    └─────────────┘
```

**Implementation Details**:
- A `Velo` can have 0 or 1 `Guidon`
- A `Guidon` can be associated with 0 or 1 `Velo`
- Both classes have getters and setters

**File**: `q1/src/main/java/q1/Velo.java`, `q1/src/main/java/q1/Guidon.java`

### Q.2 - Bidirectional Association with Referential Integrity

**Objective**: Ensure referential integrity when adding a `Guidon` to a `Velo`.

**Key Concept**: When you add a `Guidon` to a `Velo`, the `Guidon` should automatically reference the `Velo` (principle of referential integrity).

**Implementation**:
- Copy classes from q1 to package q2
- Modify `setGuidon()` to maintain referential integrity
- When `velo.setGuidon(guidon)` is called, `guidon.setVelo(velo)` should be automatically called

**File**: `q2/src/main/java/q2/Velo.java`, `q2/src/main/java/q2/Guidon.java`

### Q.3 - Removing Bidirectional Access

**Objective**: Prevent `Guidon` from accessing its parent `Velo`.

**UML Diagram**:
```
┌─────────────┐         guidon    ┌─────────────┐
│    Velo     │ ──────────────────>│   Guidon    │
│─────────────│            1       │─────────────│
│ getGuidon() │                    │             │
│ setGuidon() │                    │             │
└─────────────┘                    └─────────────┘
```

**Implementation**:
- Copy classes from q2 to package q3
- Remove `velo` field and related methods from `Guidon`
- Update `Velo.setGuidon()` accordingly

**File**: `q3/src/main/java/q3/Velo.java`, `q3/src/main/java/q3/Guidon.java`

### Q.4 - One-to-Many Association

**Objective**: Implement a one-to-many association where a `Velo` has multiple `Roue` (wheels).

**UML Diagram**:
```
┌─────────────────┐      roues     ┌─────────────┐
│      Velo       │ ──────────────>│    Roue     │
│─────────────────│        0..*    │─────────────│
│ getRoues()      │                │             │
│ addRoue()       │                │             │
│ removeRoue()    │                │             │
└─────────────────┘                └─────────────┘
```

**Implementation**:
- Create `Velo` with a `List<Roue>` (using multiple association)
- Create `Roue` class
- Implement methods to add/remove wheels

**File**: `q4/src/main/java/q4/Velo.java`, `q4/src/main/java/q4/Roue.java`

### Q.5 - Composition with Bidirectional Navigation

**Objective**: Implement composition where `Roue` belongs to exactly one `Velo`, and `Velo` can access its wheels.

**UML Diagram**:
```
┌─────────────────┐       velo     ┌─────────────┐
│      Velo       │ ───────────────│    Roue     │
│─────────────────│ 0..1       0..*│─────────────│
│ getRoues()      │      roues     │ getVelo()   │
│ addRoue()       │ ───────────────>│ setVelo()   │
│ removeRoue()    │                │             │
└─────────────────┘                └─────────────┘
```

**Key Concept**: Respect referential integrity of the `roues` role in the composition.

**Implementation**:
- Copy classes from q4 to package q5
- Add bidirectional navigation
- Ensure when adding a `Roue` to a `Velo`, the `Roue` automatically references the `Velo`
- Handle removal properly (set `velo` to null when removed)

**File**: `q5/src/main/java/q5/Velo.java`, `q5/src/main/java/q5/Roue.java`

### Q.6 - Testing with Moodle Test Suite

**Objective**: Execute tests provided by Moodle and correct any issues.

**Steps**:
1. Download test archive from Moodle
2. Extract to `test/java2` directory
3. In IntelliJ: right-click on `java2` → "Mark directory as" → "Test Sources Root"
4. Run tests and fix any issues

## Compilation and Execution

### Compile All Exercises

```bash
# From tp1 directory
javac q1/src/main/java/q1/*.java
javac q2/src/main/java/q2/*.java
javac q3/src/main/java/q3/*.java
javac q4/src/main/java/q4/*.java
javac q5/src/main/java/q5/*.java
```

### Run Tests

```bash
# Using IntelliJ: Right-click on test class → Run
# Or use command line with JUnit:
java -cp .:junit-platform-console-standalone.jar org.junit.platform.console.ConsoleLauncher --scan-classpath
```

## Key OOP Concepts

### 1. Association
- Represents a "uses" or "has" relationship
- Can be unidirectional or bidirectional
- Multiplicity defines how many objects can be involved

### 2. Composition
- Strong form of aggregation
- Child object cannot exist without parent
- Parent has exclusive ownership

### 3. Referential Integrity
- Ensuring consistency in bidirectional relationships
- When object A references object B, B should reference A
- Critical for maintaining data consistency

### 4. Encapsulation
- Using private fields with public getters/setters
- Controlling access to internal state
- Validating data before modification

## Common Issues and Solutions

### Issue 1: ConcurrentModificationException in couperArbre()
```java
// WRONG: Modifying list while iterating
for (Arbre arbre : arbres) {
    if (condition) {
        arbres.remove(arbre); // ConcurrentModificationException!
    }
}

// CORRECT: Use iterator or index-based loop
for (int i = arbres.size() - 1; i >= 0; i--) {
    if (condition) {
        arbres.remove(i);
    }
}
```

### Issue 2: Forgetting Referential Integrity
```java
// WRONG: Only updating one side
velo.setGuidon(guidon); // guidon.velo is still null!

// CORRECT: Update both sides
public void setGuidon(Guidon guidon) {
    this.guidon = guidon;
    if (guidon != null) {
        guidon.setVelo(this);
    }
}
```

### Issue 3: Null Checks
```java
// Always check for null before operations
public Boolean addRoue(Roue r) {
    if (r == null || this.roues.contains(r)) {
        return false;
    }
    // ... rest of the code
}
```

## Testing Strategy

1. **Test Creation**: Write tests for each method
2. **Test Edge Cases**: null values, empty collections, duplicate entries
3. **Test Referential Integrity**: Verify bidirectional relationships are maintained
4. **Test State Changes**: Verify object state after operations

## Resources

- [Java Collections Framework](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [UML Class Diagrams](https://www.uml-diagrams.org/class-diagrams-overview.html)

## Author

INSA Rennes - Arnaud Blouin  
Course: CPOO (Conception et Programmation Orientee Objet) - 3rd Year CS
