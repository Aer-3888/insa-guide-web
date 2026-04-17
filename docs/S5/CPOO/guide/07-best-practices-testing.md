---
title: "Java Best Practices and Testing"
sidebar_position: 7
---

# Java Best Practices and Testing

## SOLID Principles

### S -- Single Responsibility

Each class should have one reason to change. Example: `Foret` manages the collection of trees; `Arbre` manages its own price and age logic.

### O -- Open/Closed

Classes should be open for extension but closed for modification. The `Arbre` abstract class allows adding new tree types (open for extension) without modifying existing code (closed for modification).

### L -- Liskov Substitution

Objects of a superclass should be replaceable with objects of a subclass without breaking the program. `List<Arbre>` can contain both `Chene` and `Pin` objects, and all operations on `Arbre` work correctly regardless of the actual type.

### I -- Interface Segregation

Clients should not depend on interfaces they do not use. The course uses focused interfaces: `Service` has only `getLatency()`, `Network` has only `ping()` and `sendGetHTTPQuery()`.

### D -- Dependency Inversion

Depend on abstractions, not concretions. `Exo2` depends on the `Network` interface, not a concrete implementation. This enables testing with mocks.

```java
public class Exo2 {
    private final Network network;          // depends on interface

    public Exo2(Network network) {          // injected via constructor
        this.network = network;
    }
}
```

---

## Unit Testing with JUnit 5

### Test Structure (AAA Pattern)

```java
@Test
void testVieillir() {
    // Arrange
    Arbre arbre = new Chene(5, 2.0);

    // Act
    arbre.vieillir();

    // Assert
    assertEquals(6, arbre.getAge());
}
```

### Common Assertions

```java
assertEquals(expected, actual);                 // equality
assertEquals(expected, actual, 0.001);          // floating-point with delta
assertTrue(condition);
assertFalse(condition);
assertNull(object);
assertNotNull(object);
assertThrows(ExType.class, () -> code());       // exception expected
assertSame(obj1, obj2);                         // same reference (==)
```

### Lifecycle Annotations

```java
@BeforeEach
void setUp() {
    // runs before each test method
    mp = new MyPoint();
}

@AfterEach
void tearDown() {
    // runs after each test method (cleanup)
}

@BeforeAll
static void initAll() { /* once before all tests */ }

@AfterAll
static void cleanAll() { /* once after all tests */ }
```

### Parameterized Tests

```java
@ParameterizedTest
@ValueSource(strings = {"abc", "999.999.999.999", "", "1.2.3"})
void testInvalidIP(String address) {
    assertFalse(exo2.connectServer(address));
}

@ParameterizedTest
@CsvSource({"0, true", "-1, true", "5, true", "4, false"})
void testIsOut(int value, boolean expected) {
    assertEquals(expected, plateau.isOut(value));
}
```

### Common Testing Anti-Patterns (from the course)

**Anti-pattern 1: assertTrue(a.equals(b))** -- use `assertEquals(a, b)` instead.

**Anti-pattern 2: assertFalse(!a.foo())** -- use `assertTrue(a.foo())`.

**Anti-pattern 3: assertTrue(a == b)** -- use `assertSame(a, b)` for reference equality.

**Anti-pattern 4: try/catch with fail()** -- use `assertThrows()`.

```java
// WRONG
@Test
void test1() {
    try {
        foobar.m(null);
        fail();
    } catch (MyException ex) {
        assertTrue(true);       // meaningless
    }
}

// CORRECT
@Test
void test1() {
    assertThrows(MyException.class, () -> foobar.m(null));
}
```

**Anti-pattern 5: if/fail instead of assertEquals**:
```java
// WRONG
if (i != 10) { fail(); }

// CORRECT
assertEquals(10, foo.getI());
```

**Anti-pattern 6: Duplicate setup in each test**:
```java
// WRONG
@Test void testC1() { C c = new C(); assertEquals(12.12, c.getC1()); }
@Test void testC2() { C c = new C(); assertEquals("foo", c.getC2()); }

// CORRECT: use @BeforeEach
C c;
@BeforeEach void setUp() { c = new C(); }
@Test void testC1() { assertEquals(12.12, c.getC1()); }
@Test void testC2() { assertEquals("foo", c.getC2()); }
```

---

## Mocking with Mockito

### Why Mock?

When a class depends on an interface (e.g., `Network`, `Service`, `B`), you cannot test it without an implementation. Mocks simulate the interface behavior.

### Basic Mocking

```java
// Create a mock
Network network = Mockito.mock(Network.class);

// Define behavior
Mockito.when(network.ping("192.168.1.1")).thenReturn(true);

// Use in tests
Exo2 exo2 = new Exo2(network);
assertTrue(exo2.connectServer("192.168.1.1"));
```

### Mocking Exceptions

```java
B beh = Mockito.mock(B.class);
Mockito.when(beh.getB1()).thenThrow(new AnException("test"));

A a = new A(beh);
assertThrows(AnException.class, () -> a.al(true));
```

### Verifying Method Calls

```java
// Verify that sendGetHTTPQuery was called with the correct argument
Mockito.verify(network).sendGetHTTPQuery("192.168.1.1");

// Verify a method was never called
Mockito.verify(network, Mockito.never()).sendGetHTTPQuery("bad");
```

### Mocking Consecutive Returns

```java
Random random = Mockito.mock(Random.class);
Mockito.when(random.nextInt()).thenReturn(892, 190);

mp.setPoint(random, random);
assertEquals(892, mp.getX(), 1e-6);    // first call returns 892
assertEquals(190, mp.getY(), 1e-6);    // second call returns 190
```

### Mock Construction (Advanced -- Exo8)

When a class instantiates an object internally, you cannot inject a mock normally. Use `mockConstruction()`:

```java
@Test
void testUneFonctionInutile() {
    try (var mocked = Mockito.mockConstruction(Random.class,
            (mock, context) -> {
                Mockito.when(mock.nextRandom()).thenReturn(42);
            })) {
        Exo8 exo8 = new Exo8();           // constructor creates Random, gets mock
        assertEquals(42 * 5, exo8.uneFonctionInutile(5));
    }
}
```

### Mock Static Methods (Advanced -- Exo8)

When a class calls a static method directly:

```java
@Test
void testUneAutreFonctionInutile() {
    try (var mocked = Mockito.mockStatic(RandomGenerator.class)) {
        RandomGenerator mockGen = Mockito.mock(RandomGenerator.class);
        Mockito.when(mockGen.nextInt()).thenReturn(10);
        mocked.when(RandomGenerator::getDefault).thenReturn(mockGen);

        Exo8 exo8 = new Exo8();
        assertEquals(10 * 3, exo8.uneAutreFonctionInutile(3));
    }
}
```

---

## Code Coverage

### Types of Coverage

| Type | Description | Exam relevance |
|------|-------------|---------------|
| **Line coverage** | % of source lines executed | Commonly asked |
| **Branch coverage** | % of decision branches taken (true + false) | Commonly asked |
| **Condition coverage** | Each boolean sub-expression evaluated both true and false | Commonly asked |

### Short-Circuit Operators and Coverage

```java
if (s == null || services.contains(s))     // || short-circuits
```

Truth table for coverage:

| `s == null` | `services.contains(s)` | Evaluated? | Result |
|-------------|----------------------|-----------|--------|
| true | not evaluated | Only first | true |
| false | true | Both | true |
| false | false | Both | false |

To achieve **condition coverage**, you need tests where each sub-condition is true and false independently.

### Control Flow Graphs

For the `getTotalLatency` method:
```java
public double getTotalLatency() {    // A
    double sum = 0.0;                // B
    for (Service s : services) {     // C  (loop condition)
        sum += s.getLatency();       // D
    }
    return sum;                      // E
}
```

```
  A -> B -> C --(has next)--> D -> C
             |
             +--(no more)--> E
```

### Equivalence Classes

Group inputs that produce the same behavior:
```java
// For addService(Service s):
// Class 1: s == null            -> IllegalArgumentException
// Class 2: s already in list    -> IllegalArgumentException
// Class 3: s valid, not in list -> added successfully
```

For coordinates in `PlateauJeu` (SIZE = 5):
```
// Class 1: x < 0            -> isOut = true
// Class 2: 0 <= x < SIZE    -> isOut = false (valid)
// Class 3: x >= SIZE         -> isOut = true
// Boundary values: -1, 0, 4, 5
```

---

## Mutation Testing (Pitest)

### Concept

Mutation testing modifies your code (creates "mutants") and checks whether your tests detect the changes. If a test still passes after a mutation, the test is weak.

**Mutations include**:
- Changing `>` to `>=` or `<`
- Replacing `+` with `-`
- Removing method calls
- Changing return values
- Negating conditions

### Running Pitest

```bash
mvn clean install test org.pitest:pitest-maven:mutationCoverage
# Report: target/pit-reports/index.html
```

### The Three Problems with TestExo9

The original `TestExo9` has three issues:

1. **No assertion on `ajouterElement`**: the test calls `ajouterElement("foo")` but never verifies the element was actually added (no `assertFalse(exo9.estVide())` or `assertTrue(exo9.contient("foo"))`).

2. **No test for `estVide` returning false**: only tests the empty case (`assertTrue(exo9.estVide())`), never the non-empty case.

3. **Does not detect the off-by-one bug in `contient()`**: the test only calls `contient("bar")` which finds the element before hitting the boundary. It never tests `contient("notPresent")` which would trigger the `IndexOutOfBoundsException`.

### Fixed Tests (100% mutation score)

```java
@Test
void testIsEmpty() {
    assertTrue(exo9.estVide());
}

@Test
void testIsNotEmpty() {
    exo9.ajouterElement("foo");
    assertFalse(exo9.estVide());
}

@Test
void testAjouterElement() {
    exo9.ajouterElement("foo");
    assertFalse(exo9.estVide());
    assertTrue(exo9.contient("foo"));
}

@Test
void testContientPresent() {
    exo9.ajouterElement("bar");
    assertTrue(exo9.contient("bar"));
}

@Test
void testContientAbsent() {
    exo9.ajouterElement("bar");
    // After fixing the bug (i <= taille -> i < taille):
    assertFalse(exo9.contient("notHere"));
}
```

---

## Common Pitfalls

1. **Testing the mock instead of the system under test**: `assertEquals(vb, b.getB1())` tests the mock setup, not the actual class.
2. **Achieving 100% line coverage but weak assertions**: coverage measures execution, not correctness. Mutation testing catches this.
3. **Forgetting `@ExtendWith(MockitoExtension.class)`**: required for `@Mock` annotations to work.
4. **Not using `try-with-resources` for mock static/construction**: the mock scope must be closed properly.

---

## CHEAT SHEET

```
JUNIT 5 ANNOTATIONS
  @Test                              single test method
  @BeforeEach / @AfterEach          before/after each test
  @BeforeAll / @AfterAll            before/after all tests (static)
  @ParameterizedTest                 data-driven test
  @ValueSource / @CsvSource          data providers

ASSERTIONS
  assertEquals(expected, actual)
  assertEquals(expected, actual, delta)   // for doubles
  assertTrue / assertFalse
  assertNull / assertNotNull
  assertThrows(Exception.class, () -> ...)
  assertSame / assertNotSame             // reference equality

MOCKITO
  mock(Class.class)                      create mock
  when(mock.method()).thenReturn(val)     stub return value
  when(mock.method()).thenThrow(ex)       stub exception
  verify(mock).method()                  verify call
  verify(mock, never()).method()         verify no call
  verify(mock, times(n)).method()        verify call count
  mockConstruction(Class.class, ...)     mock new instances
  mockStatic(Class.class)               mock static methods

COVERAGE TYPES
  Line:      each source line executed
  Branch:    each if/else path taken
  Condition: each boolean sub-expression true AND false

MUTATION TESTING
  mvn clean install test org.pitest:pitest-maven:mutationCoverage
  Goal: 100% mutation score = all mutants killed by tests
```
