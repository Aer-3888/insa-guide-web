---
title: "Question Bank by Type"
sidebar_position: 3
---

# Question Bank by Type

All questions extracted from the 2019-2025 CPOO exams, organized by topic.

---

## Type 1: Write a Test Class

These questions give you a Java class + interface and ask you to write a complete test class with maximum coverage.

### Question Pattern

You receive:
- A class to test (with constructor, methods, possibly a static factory)
- An interface that the class depends on (must be mocked)
- Sometimes a custom exception class

You must write:
- `@BeforeEach` with mock setup
- Tests for constructor (including null input)
- Tests for each method (normal case, edge cases, exception paths)
- `verify()` calls where appropriate

### Examples from Past Exams

**2024-2025**: Test `Traitement` (Observateur interface, switch/case, defect to find)
**2021-2022**: Test `A` (B interface, AnException, private doSomething, static createA)
**2020-2021**: Test `Client` (Service interface, addService with validation, getTotalLatency)

### Template Answer

```java
@ExtendWith(MockitoExtension.class)
public class TestClassName {
    ClassName obj;
    InterfaceName mock;

    @BeforeEach
    void setUp() throws SomeException {
        mock = Mockito.mock(InterfaceName.class);
        Mockito.when(mock.someMethod()).thenReturn(someValue);
        obj = new ClassName(mock);
    }

    @Test void testConstructorNull() {
        assertThrows(IllegalArgumentException.class, () -> new ClassName(null));
    }

    @Test void testNormalCase() throws SomeException {
        assertEquals(expected, obj.method(args));
    }

    @Test void testExceptionCase() throws SomeException {
        InterfaceName badMock = Mockito.mock(InterfaceName.class);
        Mockito.when(badMock.someMethod()).thenThrow(new SomeException());
        ClassName badObj = new ClassName(badMock);
        assertThrows(SomeException.class, () -> badObj.method(args));
    }

    @Test void testVerifyCall() throws SomeException {
        obj.method(args);
        Mockito.verify(mock).someMethod();
    }
}
```

---

## Type 2: Fix Assertions / Rewrite Tests

### Common Fixes (appear every year)

| Wrong | Correct | Why |
|-------|---------|-----|
| `assertTrue(a.equals(b))` | `assertEquals(a, b)` | Better error message on failure |
| `assertFalse(!a.foo())` | `assertTrue(a.foo())` | Double negation is confusing |
| `assertTrue(a == b)` | `assertSame(a, b)` | Semantic clarity for reference equality |
| `assertFalse(a.equals(b))` | `assertNotEquals(a, b)` | Clearer intent |
| `assertTrue(!o.myMethod())` | `assertFalse(o.myMethod())` | Remove negation |

### try/catch Antipattern

```java
// WRONG
@Test void test1() {
    try {
        foobar.m(null);
        fail();
    } catch (MyException ex) {
        assertTrue(true);
    }
}

// CORRECT
@Test void test1() {
    assertThrows(MyException.class, () -> foobar.m(null));
}
```

### if/fail Antipattern

```java
// WRONG
@Test void testI() {
    final int i = foo.getI();
    if (i != 10) { fail(); }
}

// CORRECT
@Test void testI() {
    assertEquals(10, foo.getI());
}
```

### Duplicate Setup Antipattern

```java
// WRONG
@Test void testC1() { C c = new C(); assertEquals(12.12, c.getC1()); }
@Test void testC2() { C c = new C(); assertEquals("foo", c.getC2()); }

// CORRECT
C c;
@BeforeEach void setUp() { c = new C(); }
@Test void testC1() { assertEquals(12.12, c.getC1()); }
@Test void testC2() { assertEquals("foo", c.getC2()); }
```

---

## Type 3: UML Class Diagrams from Text

### Exam Instances

**2024-2025 (Devis)**: Devis, Client, Entreprise, Tache, UniteDeMesure (enum), Materiel, Fournisseur

**2021-2022 (Football)**: Championnat, Equipe, Joueur, Entraineur, Arbitre (3 types), Rencontre, events (Penalty, But, Carton, Remplacement, Expulsion)

**2020-2021 (Arithmetic)**: FormuleArithmetique, Constante, Noeud (interface/abstract), Valeur, RefConstante, Operateur (abstract), Addition, Soustraction -- Composite pattern

### Systematic Method

1. **List all nouns**: these are candidate classes or attributes
2. **Classify nouns**: standalone entity = class; descriptor = attribute; fixed set of values = enum
3. **Identify inheritance**: "X is a type of Y" or "X can be Y" = Y is parent
4. **Identify associations**: "X has Y" or "X contains Y"
5. **Determine multiplicity**: "one" = 1; "zero or more" = 0..*; "at least one" = 1..*; "optional" = 0..1
6. **Aggregation vs Composition**: "belongs to exactly one" or lifecycle dependency = composition; "can exist independently" = aggregation
7. **Add methods**: where behavior is described
8. **Mark abstract**: classes that should not be instantiated directly

### Common Mistakes

- Forgetting multiplicity on association ends
- Making everything a class (some things are just attributes)
- Missing the inheritance relationship when text says "X can be Y" or "X is a special kind of Y"
- Not recognizing enumerations ("is either A, B, or C")

---

## Type 4: Control Flow Graphs

### What to Draw

- **Nodes**: statements, conditions, loop headers
- **Edges**: control flow between nodes
- **Branch nodes**: `if`, `switch`, loop conditions

### Short-Circuit Operators

For `if (a || b)`:
```
  [a?] --true--> [then-body]
  |
  false
  v
  [b?] --true--> [then-body]
  |
  false
  v
  [else-body or next]
```

For `if (a && b)`:
```
  [a?] --false--> [else-body or next]
  |
  true
  v
  [b?] --false--> [else-body or next]
  |
  true
  v
  [then-body]
```

### Exam Instances

- **2024-2025**: `deplacerPoints` with two for-loops and `||` condition
- **2021-2022**: `addService` with `||` condition, `getTotalLatency` with for-each loop
- **2020-2021**: `foo` with `||` condition

---

## Type 5: Truth Tables

### Method

For `if (a || b)` with short-circuit:

| a | b | b evaluated? | Result |
|---|---|-------------|--------|
| T | - | No | T |
| F | T | Yes | T |
| F | F | Yes | F |

For `if (a && b)` with short-circuit:

| a | b | b evaluated? | Result |
|---|---|-------------|--------|
| F | - | No | F |
| T | F | Yes | F |
| T | T | Yes | T |

---

## Type 6: Equivalence Classes

### Method

1. Identify the input parameter
2. Identify conditions that partition the input space
3. Name each partition
4. Identify boundary values

### Example (positions in deplacerPoints, polygon with 3 points)

| Class | Range | Behavior |
|-------|-------|----------|
| Invalid low | position < 0 | return (exit method) |
| Valid | 0 <= position < 3 | translated |
| Invalid high | position >= 3 | return (exit method) |

Boundaries: -1, 0, 2, 3

---

## Type 7: QCM / Short Answer

### Recurring Topics

**Testing definitions**:
- Testing brings confidence, does not prove correctness
- Code coverage is dynamic analysis (code must run)
- Mocks test the code that USES the mock, not the mock itself
- Mutation testing evaluates test quality by introducing code changes

**OOP definitions**:
- Abstract classes can have constructors, concrete methods, and fields
- An interface defines a contract; multiple implementation is possible
- `final` on a reference: the reference cannot change, but the object can be mutated
- Polymorphism: same method call, different behavior based on actual type

**UML/Design definitions**:
- User stories capture requirements; class diagrams capture design
- Acceptance criteria/tests bridge requirements and verification

---

## Type 8: Coverage Analysis

### "Can you achieve 100% line/branch/condition coverage?"

Check for:
1. **Dead code**: code after `return` or `throw`
2. **Unreachable branches**: short-circuit preventing evaluation
3. **Private methods that change state**: e.g., `doSomething()` sets `str = "yolo"`, making the subsequent `str == null` branch dead
4. **Declared but unthrowable exceptions**: `throws SecurityException` but no code path throws it

### 2021-2022 Analysis of Class A

- `doSomething()` always sets `str = "yolo"` before the `if` check
- So `str == null` is always `false` in `al()` -- that sub-condition cannot be `true`
- `SecurityException` and `NumberFormatException` are declared but never thrown by `al()` itself
- Result: 100% **line** coverage IS achievable (all lines are reachable: `return 0` via `!value`, `return str.length() * b.getB1()` via `value == true`). But 100% **branch** and **condition** coverage are NOT achievable (`str == null` true-branch is dead)

---

## Type 9: Bonus Questions

### Mutation Testing (2024-2025)

Explain in a few sentences how mutation testing works and its value:

"Mutation testing automatically modifies the source code to create 'mutants' (e.g., changing `>` to `>=`, removing a method call, negating a condition). The test suite is then run against each mutant. If a test fails, the mutant is 'killed' (detected). If all tests pass, the mutant 'survives,' indicating a gap in the test suite. The mutation score (killed/total) measures the quality of tests -- a high score means the tests are effective at detecting code changes."
