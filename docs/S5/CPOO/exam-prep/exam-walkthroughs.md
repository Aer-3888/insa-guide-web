---
title: "Exam Walkthroughs"
sidebar_position: 2
---

# Exam Walkthroughs

## Exam 2024-2025 (cpoo1-2024-2025.pdf)

### Exercise 1 (~5 points) -- Testing Traitement

**Given code**:
```java
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

public interface Observateur {
    void a();
    void b(String str);
}
```

**Task**: Write `TestTraitement`. A defect is present in the code, and you must write a test that exposes it.

**The defect**: the constructor does not validate `obs`. If `obs` is `null`, calling `analyser()` will throw a `NullPointerException` instead of a proper error at construction time.

**Solution**:

```java
@ExtendWith(MockitoExtension.class)
public class TestTraitement {
    Traitement traitement;
    Observateur obs;

    @BeforeEach
    void setUp() {
        obs = Mockito.mock(Observateur.class);
        traitement = new Traitement(obs);
    }

    // Test case "a" -> calls obs.a()
    @Test
    void testAnalyserA() {
        traitement.analyser("a");
        Mockito.verify(obs).a();
    }

    // Test case "b" -> calls obs.b(str)
    @Test
    void testAnalyserB() {
        traitement.analyser("b");
        Mockito.verify(obs).b("b");
    }

    // Test default -> throws IllegalArgumentException
    @Test
    void testAnalyserDefault() {
        assertThrows(IllegalArgumentException.class,
            () -> traitement.analyser("xyz"));
    }

    // Test the DEFECT: constructor accepts null
    @Test
    void testConstructorWithNull() {
        Traitement t = new Traitement(null);
        // This should throw or be prevented, but the constructor allows it
        // Calling analyser will cause NullPointerException
        assertThrows(NullPointerException.class, () -> t.analyser("a"));
    }
}
```

### Exercise 2 (~5 points) -- QCM and Questions

**Q.2**: Testing code is: **"apporter de la confiance vis-a-vis du code developpe"** (bring confidence about the developed code). Testing does NOT prove absence of bugs; it increases confidence.

**Q.3**: Executing tests to measure code coverage is a technique of: **"analyse dynamique"** (dynamic analysis). The code must actually run to measure coverage.

**Q.4**: A "mock" allows... the FALSE statement is: **"tester le fonctionnement de l'objet mocke"** (test the functioning of the mocked object). Mocks simulate dependencies; they test the code that USES the mock, not the mock itself.

**Q.5**: User stories and class diagrams are useful because: user stories capture requirements from the user's perspective and define acceptance criteria; class diagrams model the system's structure, relationships, and responsibilities. Together, they bridge the gap between what the system should do (stories) and how it is designed (diagrams).

**Q.6**: Acceptance tests in Agile and software testing: in Agile, a user story includes acceptance criteria that define "done." These criteria translate directly into acceptance tests. The term "test" has the same meaning in both contexts: a verifiable condition that, when met, confirms the feature works as specified.

**Q.7**: "A class abstract... possede que des methodes abstraites" is FALSE. An abstract class can have both abstract and concrete methods. (Interfaces in Java also had only abstract methods before Java 8, but abstract classes have always allowed concrete methods.)

### Exercise 3 (~5 points) -- UML Class Diagram (Devis)

**Text summary**: A devis (quote) concerns a client and has a date. A client has a name and address. A client can be an enterprise (with a number). A task has a designation, quantity, unit price, and unit of measure (ML, M2, U). A task references materials (at least one). A material has a designation and is supplied by one or more suppliers. A supplier has a name.

**Solution diagram**:

```
  +-------------------+     1    +-------------------+
  |      Devis        |--------->|     Client        |
  +-------------------+          +-------------------+
  | - date: String    |          | - nom: String     |
  +-------------------+          | - adresse: String |
         |                       +-------------------+
         | taches 1..*                    ^
         v                                | (extends)
  +-------------------+          +-------------------+
  |      Tache        |          |   Entreprise      |
  +-------------------+          +-------------------+
  | - designation: String   |    | - numero: String  |
  | - quantite: double      |   +-------------------+
  | - prixUnitaire: double  |
  | - unite: UniteDeMesure  |
  +-------------------+
         |
         | materiels 1..*
         v
  +-------------------+     *     +-------------------+
  |     Materiel      |<--------->|   Fournisseur     |
  +-------------------+   1..*   +-------------------+
  | - designation: String|       | - nom: String     |
  +-------------------+          +-------------------+

  +-------------------+
  | <<enumeration>>   |
  |  UniteDeMesure    |
  +-------------------+
  | ML                |
  | M2                |
  | U                 |
  +-------------------+
```

Key decisions:
- `UniteDeMesure` is an enumeration (three fixed values)
- `Entreprise extends Client` (inheritance: "un client peut etre une entreprise")
- `Materiel <-> Fournisseur` is many-to-many (1..* on both sides)
- `Devis -> Tache` is 1..* (at least one task)

### Exercise 4 (~5 points) -- Polygone Control Flow

**Given code**:
```java
public void deplacerPoints(List<Integer> positions, double vecteurTranslation) {
    for(int position : positions) {                    // A
        if(position < 0 || position >= points.size()) { // B, a: position<0, b: position>=size
            return;                                     // C
        }
    }
    for(int position: positions) {                     // D
        points.get(position).translation(vecteurTranslation); // E
    }
    System.out.println("deplacement fait");            // F
}
```

**Q.9 -- Truth table for line B**:

| a: `position < 0` | b: `position >= points.size()` | Evaluated? | Result |
|---|---|---|---|
| true | not evaluated (short-circuit) | Only a | true (return) |
| false | true | Both | true (return) |
| false | false | Both | false (continue) |

**Q.10 -- Control flow graph**:

```
  A (for loop: has next position?) ---no---> D
  |
  yes
  v
  a (position < 0?) ---true---> C (return)
  |
  false
  v
  b (position >= points.size()?) ---true---> C (return)
  |
  false
  v
  A (loop back)

  D (for loop: has next position?) ---no---> F (println)
  |
  yes
  v
  E (translation)
  |
  v
  D (loop back)

  F -> [end]
```

**Q.11 -- Equivalence classes for `position`**:

Given a polygon with 3 points (indices 0, 1, 2):
- Class 1: `position < 0` (e.g., -1) -- invalid, causes return
- Class 2: `0 <= position < 3` (e.g., 0, 1, 2) -- valid
- Class 3: `position >= 3` (e.g., 3, 4) -- invalid, causes return

Boundary values: -1, 0, 2, 3

**Q.12 -- Values for 100% line coverage** (polygon with 3 points):

Test 1: `positions = [-1]` -- covers A, B (a=true), C (return)
Test 2: `positions = [0, 1, 2]` -- covers A, B (a=false, b=false), D, E, F

**Q.13 -- Values for 100% condition coverage**:

Need each sub-condition true and false:
- `a` true: position = -1
- `a` false, `b` true: position = 3
- `a` false, `b` false: position = 0

Tests: `[-1]`, `[3]`, `[0, 1, 2]`

### Exercise 5 (Bonus ~1 point) -- Mutation Testing

Mutation testing modifies the source code (creates "mutants") and reruns the test suite. If tests still pass after a mutation, the tests are too weak to detect that change. A good test suite should "kill" all mutants (every mutation causes at least one test to fail). The mutation score = (killed mutants / total mutants) * 100%. A high score indicates robust tests.

---

## Exam 2021-2022 (DS-CPOO1-2021-2022.pdf)

### Exercise 1 -- Testing Class A

**Given code**: Class `A` with constructor validation, `getB()`, `getStr()`, `al(boolean value)`, `doSomething()` (private), and `create(B b)` (static factory).

**Q.1 -- Maximum coverage analysis**:

1. **Line coverage 100%?** Analyze: `doSomething()` sets `str = "yolo"`. After calling `al()`, `str` is always `"yolo"` (never null). All lines of `al()` are still reachable: `return 0` is triggered when `!value` is true; `return str.length() * b.getB1()` is triggered when `value` is true. The `throws SecurityException, NumberFormatException` are only declared in the signature -- they add no coverable lines. **100% line coverage IS achievable**.

2. **Branch coverage 100%?** The condition `str == null || !value` after `doSomething()` runs: `str` is always `"yolo"`, so `str == null` is always `false`. The short-circuit means we enter the branch only when `!value` is true. We can never cover the branch where `str == null` is true (since `doSomething()` always runs first).

3. **Condition coverage 100%?** `str == null` is always `false` after `doSomething()`, so we cannot make it `true`.

**Solution test class**:

```java
public class TestA {
    A a;
    B b;

    @BeforeEach
    void setUp() throws AnException {
        b = Mockito.mock(B.class);
        Mockito.when(b.getB1()).thenReturn(1);
        a = new A(b);
    }

    @Test void testConstructorNull() {
        assertThrows(IllegalArgumentException.class, () -> new A(null));
    }

    @Test void testGetB() {
        assertSame(b, a.getB());
    }

    @Test void testGetStrInitiallyNull() {
        assertNull(a.getStr());
    }

    @Test void testAlFalse() throws Exception {
        assertEquals(0, a.al(false));
        // After al(), str is "yolo" (doSomething was called)
    }

    @Test void testAlTrue() throws Exception {
        // "yolo".length() = 4, b.getB1() = 1
        assertEquals(4, a.al(true));
    }

    @Test void testAlThrowsAnException() throws AnException {
        B badB = Mockito.mock(B.class);
        Mockito.when(badB.getB1()).thenThrow(new AnException("test"));
        A badA = new A(badB);
        assertThrows(AnException.class, () -> badA.al(true));
    }

    @Test void testCreateWithNull() {
        assertNull(A.create(null));
    }

    @Test void testCreateWithValid() {
        A created = A.create(b);
        assertNotNull(created);
        assertSame(b, created.getB());
    }
}
```

**Q.2 -- Additional test for create**: verify that `create` returns a NEW instance each time (not a singleton):

```java
@Test void testCreateReturnsNewInstance() {
    A a1 = A.create(b);
    A a2 = A.create(b);
    assertNotSame(a1, a2);
}
```

**Q.3 -- Tests that do not increase coverage but are necessary**: testing that `getStr()` returns `"yolo"` after `al()` is called (verifying the side effect of `doSomething()`):

```java
@Test void testStrAfterAl() throws Exception {
    a.al(false);
    assertEquals("yolo", a.getStr());
}
```

### Exercise 2 -- UML Football Championship

This is a complex class diagram exercise. Key classes:
- `Championnat`, `Equipe`, `Joueur`, `Entraineur`, `Arbitre`, `Rencontre`
- Event types: `Penalty`, `Carton`, `But`, `Remplacement`, `Expulsion`
- Arbitre specializations: `ArbitreCentral`, `ArbitreTouche`, `ArbitreVideo`

Key relationships:
- `Rencontre` belongs to exactly 1 `Championnat`
- `Equipe` can be in multiple `Championnat`s
- `Rencontre` involves 2 `Equipe` (local + visiteur)
- `Carton` has a color (enum: JAUNE, ROUGE) and targets a `Joueur` or `Entraineur`
- `ArbitreCentral` can do everything `ArbitreTouche` and `ArbitreVideo` can, plus more

---

## Exam 2020-2021 (DS-CPOO1-2020-2021.pdf)

### Exercise 1 -- Control Flow of Foo

```java
public int foo(int i, int j) {
    if (i < 0 || j > 0) {
        return i + j;
    }
    return i * j;
}
```

**Q.1**: Minimum tests for 100% control flow coverage: **2 tests** (one for the `true` branch, one for the `false` branch).

**Q.2**: Test values:
- Test 1 (true branch): `i < 0` (e.g., i=-1, j=0) OR `j > 0` (e.g., i=0, j=1)
- Test 2 (false branch): `i >= 0 AND j <= 0` (e.g., i=1, j=0 or i=0, j=-1)

For condition coverage (each sub-condition true and false): need 3 tests.

**Q.3**: Control flow graph:
```
  [entry: line 2]
  |
  v
  [i<0?] --true--> [return i+j: line 4]
  |
  false
  v
  [j>0?] --true--> [return i+j: line 4]
  |
  false
  v
  [return i*j: line 6]
```

### Exercise 2 -- Assertion Fixes

| Wrong | Correct |
|-------|---------|
| `assertTrue(a.equals(b))` | `assertEquals(a, b)` |
| `assertFalse(!a.foo())` | `assertTrue(a.foo())` |
| try/catch with `fail()` | `assertThrows(VeryBadException.class, () -> foobar.m())` followed by `assertEquals(1, foobar.m())` for the normal case |

### Exercise 3 -- UML Arithmetic Formula

See the worked example in [04-uml-diagrams.md](/S5/CPOO/guide/04-uml-diagrams). Key: identify the Composite pattern where `Noeud` (node) is either a `Valeur`, `RefConstante`, or `Operateur` (with `Addition` and `Soustraction` as subtypes).
