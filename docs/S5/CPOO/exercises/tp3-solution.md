---
title: "TP CPOO1 - Exercices 2 to 6: Testing with JUnit 5, Mockito, and Pitest"
sidebar_position: 3
---

# TP CPOO1 - Exercices 2 to 6: Testing with JUnit 5, Mockito, and Pitest

> Following teacher instructions from: `S5/CPOO/data/moodle/tp/tp3_gitlab_exercises/README.md` (Exercices 2-6)

These exercises work with pre-existing classes. You write tests, analyze control flow, and evaluate test quality. The code is in the `tp-CPOO1` gitlab project, folder structure matching `src/main/java/cpoo1/exoN/`.

---

## Exercice 2 - Testing Exo2 (IP Validation and Network)

The teacher's original text:

> Vous devez tester la classe `Exo2` (la classe de tests est deja creee).

### Code Under Test

**Exo2.java** (`cpoo1/exo2/`):

```java
package cpoo1.exo2;

import java.util.regex.Pattern;

public class Exo2 {
    private final Network network;
    private final Pattern regex;

    public Exo2(Network network) {
        this.network = network;
        regex = Pattern.compile("^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$");
    }

    public boolean connectServer(final String address) {
        if (!regex.matcher(address).matches()) {
            return false;
        }
        try {
            boolean pingOK = network.ping(address);
            network.sendGetHTTPQuery(address);
            return pingOK;
        } catch (NetworkException ex) {
            return false;
        }
    }
}
```

**Network.java:**

```java
package cpoo1.exo2;

public interface Network {
    boolean ping(String address) throws NetworkException;
    void sendGetHTTPQuery(String address);
}
```

**NetworkException.java:**

```java
package cpoo1.exo2;

public class NetworkException extends Exception { }
```

**TestExo2.java** (skeleton provided by teacher):

```java
package cpoo1.exo2;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestExo2 {
    Exo2 exo2;
    Network network;
}
```

---

### Question 1

### Tester comme dans l'exercice precedent.

**Answer:**

`Exo2` depends on `Network`, which is an interface. We cannot use a real network in tests. We create a **mock**: a fake object that simulates `Network` behavior. Mockito creates mocks that return default values (false for booleans, null for objects) unless configured with `when().thenReturn()`.

There are 4 distinct paths through `connectServer`:
1. Invalid IP format --> return false
2. Valid IP, ping returns true, no exception --> return true
3. Valid IP, ping returns false, no exception --> return false
4. Valid IP, ping throws NetworkException --> return false

```java
package cpoo1.exo2;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestExo2 {
    Exo2 exo2;
    Network network;

    @BeforeEach
    void setUp() {
        network = Mockito.mock(Network.class);
        exo2 = new Exo2(network);
    }

    // Path 2: Valid IP, ping succeeds
    @Test
    void testValidIPPingSucceeds() throws NetworkException {
        Mockito.when(network.ping("192.168.1.1")).thenReturn(true);
        assertTrue(exo2.connectServer("192.168.1.1"));
    }

    // Path 3: Valid IP, ping fails
    @Test
    void testValidIPPingFails() throws NetworkException {
        Mockito.when(network.ping("10.0.0.1")).thenReturn(false);
        assertFalse(exo2.connectServer("10.0.0.1"));
    }

    // Path 4: Valid IP, NetworkException thrown
    @Test
    void testValidIPNetworkException() throws NetworkException {
        Mockito.when(network.ping("10.0.0.1")).thenThrow(new NetworkException());
        assertFalse(exo2.connectServer("10.0.0.1"));
    }
}
```

**File changes:**
- `TestExo2.java`: Added `@BeforeEach` setup with mock Network, added tests for paths 2, 3, and 4

---

### Question 2

### Utiliser des tests parametres pour tester le `if(!regex.matcher(address).matches())`. Attention, le(s) test(s) utilisant une mauvaise adresse IP doivent echouer parce que le format de l'IP n'est pas bon (et non pas parce que `network.ping(address)` retourne `false` par defaut). Dans ce cas, il vous faut donc configurer `network.ping(address)` pour qu'elle retourne `true`.

**Answer:**

The teacher explicitly warns: tests for invalid IPs must fail **because the IP format is wrong**, not because `network.ping` returns false (which is the mock's default). So we must configure `network.ping(address)` to return `true`. That way the only reason `connectServer` returns `false` is the regex check.

```java
    // Path 1: Invalid IP formats (parameterized)
    @ParameterizedTest
    @ValueSource(strings = {
        "abc",                    // not an IP at all
        "999.999.999.999",        // octets > 255
        "",                       // empty string
        "1.2.3",                  // only 3 octets
        "256.1.1.1",              // first octet > 255
        "1.2.3.4.5",              // 5 octets
        "192.168.1",              // missing last octet
        "hello.world.foo.bar"     // words instead of numbers
    })
    void testInvalidIPFormat(String address) throws NetworkException {
        // CRITICAL: configure ping to return true
        // so the failure comes from the REGEX, not from ping
        Mockito.when(network.ping(address)).thenReturn(true);

        assertFalse(exo2.connectServer(address));
    }
```

**File changes:**
- `TestExo2.java`: Added `@ParameterizedTest` with `@ValueSource` for invalid IP addresses, with `network.ping` configured to return `true`

---

### Question 3

### Meme si vous avez une couverture de 100%, un de vos tests doit verifier que la methode `sendGetHTTPQuery` est bien appelee avec la valeur `address`.

**Answer:**

Code coverage tells you which lines were executed, but not whether the right methods were called with the right arguments. `Mockito.verify()` checks that a mock's method was called with specific arguments.

```java
    // Verify sendGetHTTPQuery is called with the correct address
    @Test
    void testSendGetHTTPQueryCalledWithAddress() throws NetworkException {
        String address = "122.154.198.1";
        Mockito.when(network.ping(address)).thenReturn(true);

        exo2.connectServer(address);

        // Verify that sendGetHTTPQuery was called exactly once with this address
        Mockito.verify(network).sendGetHTTPQuery(address);
    }

    // Bonus: verify sendGetHTTPQuery is NOT called on invalid IP
    @Test
    void testSendGetHTTPQueryNotCalledOnInvalidIP() throws NetworkException {
        exo2.connectServer("invalid");

        // sendGetHTTPQuery should never be called because the regex check fails first
        Mockito.verify(network, Mockito.never()).sendGetHTTPQuery(Mockito.anyString());
    }
```

**File changes:**
- `TestExo2.java`: Added `verify()` test to confirm `sendGetHTTPQuery` is called with the correct address value

---

## Exercice 3 - Client and Services (Control Flow Analysis)

The teacher's original text:

> Le code de cet exercice se trouve dans le dossier `exo4`. Il concerne une classe `Client` qui utilise des objets `Service`. Pour rappel, une latence est le temps entre une demande et la reponse.

### Code Under Test

**Client.java** (`cpoo1/exo4/`):

```java
package cpoo1.exo4;

import java.util.ArrayList;
import java.util.List;

interface Service {
    int getLatency();
}

public class Client {
    private final List<Service> services;

    public Client() {
        services = new ArrayList<>();
    }

    public void addService(Service s) {
        if(s==null || services.contains(s)) throw new IllegalArgumentException(); // line 23
        services.add(s);
    }

    public List<Service> getServices() {
        return services;
    }

    public double getTotalLatency() { // A
        double sum = 0.0; // B
        for(Service s : services) { // C
            sum += s.getLatency(); // D
        }
        return sum; // E
    }
}
```

---

### Question 1

### Quelle est la difference entre les operateurs `&&` et `&` (idem pour `||` et `|`) ? Exemple ligne 23.

**Answer:**

**Short-circuit operators (`&&`, `||`):**
- `&&`: if the left side is `false`, the right side is **not evaluated** (result is already `false`)
- `||`: if the left side is `true`, the right side is **not evaluated** (result is already `true`)

**Non-short-circuit operators (`&`, `|`):**
- `&`: both sides are **always evaluated**, regardless of the left side's value
- `|`: both sides are **always evaluated**, regardless of the left side's value

**Line 23 uses `||` (short-circuit):**
```java
if (s == null || services.contains(s))
```
If `s == null` is `true`, then `services.contains(s)` is not evaluated. This means:
1. Performance: no need to search the list if s is null
2. For testing: you only need to cover the specific combinations that actually execute

---

### Question 2

### En tenant compte de la question precedente, donner la table de verite effective de la condition ligne 23. Pourquoi est-ce utile lors de l'ecriture de tests ?

**Answer:**

Because `||` short-circuits, not all combinations of the two sub-conditions are reachable:

| `s == null` | `services.contains(s)` | Evaluated? | Result |
|:-----------:|:---------------------:|:----------:|:------:|
| true | -- (not evaluated) | Short-circuit | throws `IllegalArgumentException` |
| false | true | Both evaluated | throws `IllegalArgumentException` |
| false | false | Both evaluated | `services.add(s)` succeeds |

**Only 3 rows instead of 4.** The combination `s == null` AND `services.contains(s) == false` would exist with `|` but not with `||`. This means you need exactly **3 test cases** to cover all condition/branch combinations.

This is useful when writing tests because it tells you the minimum number of test cases needed for full condition/branch coverage.

---

### Question 3

### En utilisant cette table de verite, donner maintenant le graphe de flot de controles de la methode `addService`.

**Answer:**

With short-circuit `||`, the graph has two separate decision nodes, not one combined node:

```
    [entry: s]
        |
        v
    [s == null?] ----true----> [throw IllegalArgumentException]
        |
       false (short-circuit: s is not null, so evaluate right side)
        |
        v
    [services.contains(s)?] ----true----> [throw IllegalArgumentException]
        |
       false
        |
        v
    [services.add(s)]
        |
        v
    [return]
```

For branch coverage, you need to test both the `s == null` branch and the `services.contains(s)` branch independently.

---

### Question 4

### En lien avec la question precedente, quelles sont les classes d'equivalence du parametre `s` de la methode `addService` ?

**Answer:**

An equivalence class is a set of inputs that produce the same behavior:

| Class | Description | Representative Input | Expected Outcome |
|:-----:|-------------|---------------------|:----------------:|
| 1 | `s` is null | `null` | throws `IllegalArgumentException` |
| 2 | `s` is a valid Service already in the list | a Service already added | throws `IllegalArgumentException` |
| 3 | `s` is a valid Service NOT in the list | a fresh Service mock | `s` is added to the list |

---

### Question 5

### Donner le graphe de flot de controle representant le code de la methode `getTotalLatency`. Utilisez les lettres mises en commentaires pour nommer les noeuds.

**Answer:**

```
    A (method entry)
    |
    v
    B (double sum = 0.0)
    |
    v
    C (for loop: has next service?) ----NO----> E (return sum)
    |
   YES
    |
    v
    D (sum += s.getLatency())
    |
    +----> back to C
```

Paths through the graph:
1. **Empty list:** A -> B -> C -> E (loop body never executes)
2. **One service:** A -> B -> C -> D -> C -> E
3. **Two services:** A -> B -> C -> D -> C -> D -> C -> E

To achieve full branch coverage, you need at least paths 1 and 2 (one test with empty list, one with at least one service).

---

### Question 6

### Donner le code Java d'une classe de tests unitaires `ClientTest` testant la classe `Client` avec une couverture de conditions et de branches de 100 %. Vous ne disposez pas d'implementations de l'interface `Service`.

**Answer:**

Since `Service` is an interface with no implementation provided, we must **mock** it. Mockito creates a fake `Service` whose `getLatency()` returns a configured value.

```java
package cpoo1.exo4;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

public class ClientTest {
    private Client client;

    @BeforeEach
    void setUp() {
        client = new Client();
    }

    // ========== addService tests ==========

    // Equivalence class 1: s is null
    @Test
    void testAddServiceNullThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> client.addService(null));
    }

    // Equivalence class 2: s is already in the list (duplicate)
    @Test
    void testAddServiceDuplicateThrows() {
        Service s = Mockito.mock(Service.class);
        client.addService(s);
        assertThrows(IllegalArgumentException.class,
            () -> client.addService(s));
    }

    // Equivalence class 3: s is a valid new Service
    @Test
    void testAddServiceValid() {
        Service s = Mockito.mock(Service.class);
        client.addService(s);
        assertEquals(1, client.getServices().size());
        assertSame(s, client.getServices().get(0));
    }

    // ========== getServices tests ==========

    @Test
    void testGetServicesInitiallyEmpty() {
        assertTrue(client.getServices().isEmpty());
    }

    @Test
    void testGetServicesAfterAdding() {
        Service s1 = Mockito.mock(Service.class);
        Service s2 = Mockito.mock(Service.class);
        client.addService(s1);
        client.addService(s2);
        assertEquals(2, client.getServices().size());
    }

    // ========== getTotalLatency tests ==========

    // Path A -> B -> C -> E (empty list)
    @Test
    void testGetTotalLatencyEmptyList() {
        assertEquals(0.0, client.getTotalLatency(), 0.001);
    }

    // Path A -> B -> C -> D -> C -> E (one service)
    @Test
    void testGetTotalLatencyOneService() {
        Service s = Mockito.mock(Service.class);
        Mockito.when(s.getLatency()).thenReturn(100);
        client.addService(s);
        assertEquals(100.0, client.getTotalLatency(), 0.001);
    }

    // Path A -> B -> C -> D -> C -> D -> C -> E (multiple services)
    @Test
    void testGetTotalLatencyMultipleServices() {
        Service s1 = Mockito.mock(Service.class);
        Service s2 = Mockito.mock(Service.class);
        Service s3 = Mockito.mock(Service.class);
        Mockito.when(s1.getLatency()).thenReturn(100);
        Mockito.when(s2.getLatency()).thenReturn(200);
        Mockito.when(s3.getLatency()).thenReturn(50);
        client.addService(s1);
        client.addService(s2);
        client.addService(s3);
        assertEquals(350.0, client.getTotalLatency(), 0.001);
    }
}
```

**File changes:**
- `ClientTest.java`: Created from scratch with mock Services, covers all 3 equivalence classes of `addService` plus all branches of `getTotalLatency`

---

## Exercice 4 - PlateauJeu (Game Board with Parameterized Tests)

The teacher's original text:

> Le code de cet exercice se trouve dans le dossier `exo5`. Il concerne une classe `PlateauJeu` qui utilise des objets `Pion`.

### Code Under Test

**PlateauJeu.java** (`cpoo1/exo5/`):

```java
package cpoo1.exo5;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

interface Pion {
    int getX();
    int getY();
}

public class PlateauJeu {
    public static final int SIZE = 5;
    private final List<Pion> pions;

    public PlateauJeu() {
        pions = new ArrayList<>();
    }

    public List<Pion> getPions() {
        return Collections.unmodifiableList(pions);
    }

    public boolean isFree(final int x, final int y) {
        if(isOut(x) || isOut(y)) {
            return false;
        }
        for (final Pion pion : pions) {
            if (pion.getX() == x && pion.getY() == y) {
                return false;
            }
        }
        return true;
    }

    public boolean addPion(final Pion p) {
        if (p == null || !isFree(p.getX(), p.getY())) {
            return false;
        }
        pions.add(p);
        return true;
    }

    private boolean isOut(final int value) {
        return value < 0 || value >= SIZE;
    }
}
```

---

### Question 1

### En Java, que signifie le mot-cle `final` pose sur l'attribut `pions` ? Quelle est la difference entre un attribut de type primitif *final* (exemple `SIZE`) et un attribut de type complexe (exemple `pions`) ?

**Answer:**

**`public static final int SIZE = 5;`**
- `SIZE` is a constant. The value `5` can never change.
- `static` means it belongs to the class, not to an instance.
- This is a true immutable constant.

**`private final List<Pion> pions;`**
- The **reference** `pions` always points to the same `ArrayList` object after construction. You cannot write `pions = new ArrayList<>()` after the constructor.
- BUT the **contents** of the list can still change. `pions.add(...)`, `pions.remove(...)`, `pions.clear()` all work.
- `final` on a complex type means "the variable always points to the same object," NOT "the object itself is immutable."

The `Collections.unmodifiableList()` in `getPions()` is separate from `final`. It returns a **view** that throws `UnsupportedOperationException` if you try to modify it. `final` prevents reassigning the variable; `unmodifiableList()` prevents modifying the contents through the returned view.

---

### Question 2

### Etudier le code de la classe `PlateauJeu` et inferez quelles sont les classes d'equivalence de la coordonnee `x` (idem pour `y`) d'un pion ?

**Answer:**

Given `SIZE = 5` and `isOut(value)` returns `value < 0 || value >= SIZE`:

| Class | Range | `isOut` result | Description |
|:-----:|:-----:|:--------------:|-------------|
| 1 | x < 0 | true | Below valid range |
| 2 | 0 <= x < 5 | false | Valid range [0, 4] |
| 3 | x >= 5 | true | Above valid range |

**Boundary values** (most likely to reveal bugs): `-1, 0, 4, 5`

- `-1`: last invalid value below 0
- `0`: first valid value
- `4`: last valid value (SIZE - 1)
- `5`: first invalid value at SIZE

---

### Question 3

### Donner le graphe de flot de controle de la methode `isFree`.

**Answer:**

```
    [entry: x, y]
         |
         v
    [isOut(x)?] ----true----> [return false]
         |
        false
         |
         v
    [isOut(y)?] ----true----> [return false]
         |
        false
         |
         v
    [for pion in pions: has next?] ----NO----> [return true]
         |
        YES
         |
         v
    [pion.getX()==x && pion.getY()==y?] ----true----> [return false]
         |
        false
         |
         +----> back to loop
```

To achieve full branch coverage:
- One test where `isOut(x)` is true
- One test where `isOut(y)` is true (but `isOut(x)` is false)
- One test where coordinates are valid and no pion occupies the position (return true)
- One test where coordinates are valid and a pion occupies the position (return false)

---

### Question 4

### Tester la methode `isOut` en utilisant des tests parametres.

**Answer:**

Since `isOut` is `private`, we test it indirectly through `isFree`. If `isOut(x)` returns true, then `isFree(x, validY)` returns false.

```java
package cpoo1.exo5;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

public class PlateauJeuTest {
    private PlateauJeu plateau;

    @BeforeEach
    void setUp() {
        plateau = new PlateauJeu();
    }

    // Test x values that are out of bounds (y = 2, a valid value)
    @ParameterizedTest
    @ValueSource(ints = {-100, -1, 5, 6, 100})
    void testIsOutXOutOfBounds(int x) {
        assertFalse(plateau.isFree(x, 2));
    }

    // Test y values that are out of bounds (x = 2, a valid value)
    @ParameterizedTest
    @ValueSource(ints = {-100, -1, 5, 6, 100})
    void testIsOutYOutOfBounds(int y) {
        assertFalse(plateau.isFree(2, y));
    }

    // Test valid x coordinates (with valid y = 2)
    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2, 3, 4})
    void testIsOutXInBounds(int x) {
        assertTrue(plateau.isFree(x, 2));
    }

    // Test valid y coordinates (with valid x = 2)
    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2, 3, 4})
    void testIsOutYInBounds(int y) {
        assertTrue(plateau.isFree(2, y));
    }

    // ========== Additional tests for full coverage ==========

    @Test
    void testIsFreeEmptyBoard() {
        assertTrue(plateau.isFree(2, 3));
    }

    @Test
    void testIsFreeOccupiedPosition() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(2);
        Mockito.when(p.getY()).thenReturn(3);
        plateau.addPion(p);

        assertFalse(plateau.isFree(2, 3));  // occupied
    }

    @Test
    void testIsFreeAdjacentToOccupied() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(2);
        Mockito.when(p.getY()).thenReturn(3);
        plateau.addPion(p);

        assertTrue(plateau.isFree(2, 2));   // same x, different y
        assertTrue(plateau.isFree(3, 3));   // different x, same y
    }

    @Test
    void testAddPionNull() {
        assertFalse(plateau.addPion(null));
    }

    @Test
    void testAddPionValid() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(0);
        Mockito.when(p.getY()).thenReturn(0);

        assertTrue(plateau.addPion(p));
        assertEquals(1, plateau.getPions().size());
    }

    @Test
    void testAddPionOutOfBounds() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(-1);
        Mockito.when(p.getY()).thenReturn(0);

        assertFalse(plateau.addPion(p));
    }

    @Test
    void testAddPionDuplicatePosition() {
        Pion p1 = Mockito.mock(Pion.class);
        Mockito.when(p1.getX()).thenReturn(2);
        Mockito.when(p1.getY()).thenReturn(3);
        plateau.addPion(p1);

        Pion p2 = Mockito.mock(Pion.class);
        Mockito.when(p2.getX()).thenReturn(2);
        Mockito.when(p2.getY()).thenReturn(3);

        assertFalse(plateau.addPion(p2));  // same position
        assertEquals(1, plateau.getPions().size());
    }

    @Test
    void testGetPionsReturnsUnmodifiableList() {
        assertThrows(UnsupportedOperationException.class,
            () -> plateau.getPions().clear());
    }

    @Test
    void testGetPionsInitiallyEmpty() {
        assertTrue(plateau.getPions().isEmpty());
    }
}
```

**File changes:**
- `PlateauJeuTest.java`: Created with parameterized tests for `isOut` (via `isFree`), plus tests for `addPion`, `isFree` with occupants, and `getPions`

---

## Exercice 5 - Mocking Random (Exo8)

The teacher's original text:

> La classe `Exo8` presente deux problemes pour tester ses methodes.

### Code Under Test

**Exo8.java** (`cpoo1/exo8/`):

```java
package cpoo1.exo8;

import java.util.random.RandomGenerator;

class Random {
    public int nextRandom() {
        return RandomGenerator.getDefault().nextInt();
    }
}

public class Exo8 {
    private final Random rand;

    public Exo8() {
        rand = new Random();
    }

    public int uneFonctionInutile(int coeff) {
        return rand.nextRandom() * coeff;
    }

    public int uneAutreFonctionInutile(int coeff) {
        return RandomGenerator.getDefault().nextInt() * coeff;
    }
}
```

---

### Question 1

### Cette classe instancie dans son constructeur l'objet `Random`. Nous ne pouvons donc pas "mocker" un `Random` et le donner a l'objet `Exo8`. Utilisez cette technique pour pallier ce probleme et tester la methode `uneFonctionInutile`. https://javadoc.io/static/org.mockito/mockito-core/5.20.0/org.mockito/org/mockito/Mockito.html#49

**Answer:**

The problem is that `Exo8` creates `Random` internally -- we cannot inject a mock through the constructor. The solution is `Mockito.mockConstruction(Class)`, which intercepts `new Class()` calls. Every time `new Random()` is called within the `try` block, Mockito replaces the newly created object with a mock.

```java
package cpoo1.exo8;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

class Exo8Test {

    @Test
    void testUneFonctionInutile() {
        // mockConstruction intercepts "new Random()" inside the try block
        try (var mocked = Mockito.mockConstruction(Random.class,
                (mock, context) -> {
                    // Configure the mock: nextRandom() returns 42
                    Mockito.when(mock.nextRandom()).thenReturn(42);
                })) {

            // When Exo8() calls "new Random()", it gets our mock
            Exo8 exo8 = new Exo8();

            // uneFonctionInutile(5) = mock.nextRandom() * 5 = 42 * 5 = 210
            assertEquals(210, exo8.uneFonctionInutile(5));
        }
        // After the try block, construction mocking is deactivated
    }

    @Test
    void testUneFonctionInutileWithZero() {
        try (var mocked = Mockito.mockConstruction(Random.class,
                (mock, context) -> {
                    Mockito.when(mock.nextRandom()).thenReturn(7);
                })) {
            Exo8 exo8 = new Exo8();
            assertEquals(0, exo8.uneFonctionInutile(0));  // 7 * 0 = 0
        }
    }
}
```

**How it works step by step:**

```
1. Mockito.mockConstruction(Random.class, ...) activates construction interception
2. new Exo8() is called
3. Inside Exo8(), "rand = new Random()" is intercepted
4. Instead of a real Random, a mock Random is assigned to rand
5. The callback configures mock.nextRandom() to return 42
6. exo8.uneFonctionInutile(5) calls rand.nextRandom() which returns 42
7. 42 * 5 = 210
```

**File changes:**
- `Exo8Test.java`: Created with `mockConstruction` tests for `uneFonctionInutile`

---

### Question 2

### L'autre methode de la classe `Exo8`, `uneAutreFonctionInutile`, utilise directement une methode statique de la classe `RandomGenerator`. Utilisez cette autre technique pour pallier ce nouveau probleme : https://javadoc.io/static/org.mockito/mockito-core/5.20.0/org.mockito/org/mockito/Mockito.html#48

**Answer:**

Static methods cannot be mocked with regular `mock()` because they belong to the class, not to an instance. `Mockito.mockStatic()` creates a scoped override: within the `try` block, calls to the static method return whatever you configure.

```java
    @Test
    void testUneAutreFonctionInutile() {
        import java.util.random.RandomGenerator;

        // mockStatic intercepts static calls on RandomGenerator
        try (var mockedStatic = Mockito.mockStatic(RandomGenerator.class)) {
            // Create a mock RandomGenerator
            RandomGenerator mockGen = Mockito.mock(RandomGenerator.class);
            Mockito.when(mockGen.nextInt()).thenReturn(10);

            // When RandomGenerator.getDefault() is called, return our mock
            mockedStatic.when(RandomGenerator::getDefault).thenReturn(mockGen);

            // Must create Exo8 INSIDE the try block (after static mock is active)
            Exo8 exo8 = new Exo8();

            // uneAutreFonctionInutile(3) = RandomGenerator.getDefault().nextInt() * 3
            // = mockGen.nextInt() * 3 = 10 * 3 = 30
            assertEquals(30, exo8.uneAutreFonctionInutile(3));
        }
    }

    @Test
    void testUneAutreFonctionInutileNegativeCoeff() {
        try (var mockedStatic = Mockito.mockStatic(RandomGenerator.class)) {
            RandomGenerator mockGen = Mockito.mock(RandomGenerator.class);
            Mockito.when(mockGen.nextInt()).thenReturn(5);
            mockedStatic.when(RandomGenerator::getDefault).thenReturn(mockGen);

            Exo8 exo8 = new Exo8();
            assertEquals(-15, exo8.uneAutreFonctionInutile(-3)); // 5 * -3 = -15
        }
    }
```

**How it works step by step:**

```
1. Mockito.mockStatic(RandomGenerator.class) activates static interception
2. mockedStatic.when(RandomGenerator::getDefault).thenReturn(mockGen) configures it
3. exo8.uneAutreFonctionInutile(3) is called
4. Inside: RandomGenerator.getDefault() is intercepted, returns mockGen
5. mockGen.nextInt() returns 10 (configured)
6. 10 * 3 = 30
```

**IMPORTANT:** Both `mockConstruction` and `mockStatic` use `try-with-resources`. The mock is only active within the `try` block. After the block closes, normal behavior is restored.

**File changes:**
- `Exo8Test.java`: Added `mockStatic` tests for `uneAutreFonctionInutile`

---

## Exercice 6 - Mutation Testing (Exo9)

The teacher's original text:

> Etudier le code de la classe `Exo9` ainsi que celui de sa classe de test `TestExo9`. Cette derniere teste tres mal la classe `Exo9`.

### Code Under Test (with Bug)

**Exo9.java** (`cpoo1/exo9/`):

```java
package cpoo1.exo9;

import java.util.ArrayList;
import java.util.List;

public class Exo9 {
    private final List<String> maListe;

    public Exo9() {
        maListe = new ArrayList<>();
    }

    public void ajouterElement(String elt) {
        maListe.add(elt);
    }

    public boolean estVide() {
        return maListe.isEmpty();
    }

    public boolean contient(String str) {
        final int taille = maListe.size();

        for (int i = 0; i <= taille; i++) {    // BUG: <= should be <
            if(maListe.get(i).equals(str)) {
                return true;
            }
        }
        return false;
    }
}
```

**TestExo9.java** (intentionally weak tests provided by teacher):

```java
package cpoo1.exo9;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class TestExo9 {
    Exo9 exo9;

    @BeforeEach
    void setUp() {
        exo9 = new Exo9();
    }

    @Test
    void testIsEmpty() {
        assertTrue(exo9.estVide());
    }

    @Test
    void testAjouterElement() {
        exo9.ajouterElement("foo");
    }

    @Test
    void testContient() {
        exo9.ajouterElement("bar");
        assertTrue(exo9.contient("bar"));
    }
}
```

---

### Question 1

### Quelles sont les trois raisons ? La premiere est assez evidente, les deux autres moins.

**Answer:**

**Problem 1 (obvious): `testAjouterElement` has NO assertion.**

```java
@Test
void testAjouterElement() {
    exo9.ajouterElement("foo");
    // No assertion! We never verify that "foo" was actually added.
    // You could delete the body of ajouterElement() and this test would still pass.
}
```

**Problem 2 (subtle): `testIsEmpty` only tests the `true` case.**

```java
@Test
void testIsEmpty() {
    assertTrue(exo9.estVide());
    // Never tests that estVide() returns FALSE after adding an element.
    // You could replace the method body with "return true;" and this test still passes.
}
```

**Problem 3 (subtle): `testContient` never tests the case where the element is NOT found.**

```java
@Test
void testContient() {
    exo9.ajouterElement("bar");
    assertTrue(exo9.contient("bar"));
    // Never tests contient("notHere") which should return false.
    // Also: "bar" is found at index 0, so the loop never reaches
    // the off-by-one bug at index == taille.
}
```

The bug in `contient` is `i <= taille` instead of `i < taille`. When the element IS in the list, it is found before reaching the invalid index. The bug only triggers when the element is NOT found (the loop goes one index too far and throws `IndexOutOfBoundsException`).

---

### Question 2

### Pour trouver les trois problemes : commenter le contenu des trois methodes, et pour `estVide`, ecrivez `return true;`. Reexecuter les tests. Essayez de comprendre pourquoi le fait de changer le code et que la suite de tests passe toujours est un probleme.

**Answer:**

If you modify the production code and the tests still pass, the tests are not verifying the behavior. This is a **weak test suite**:

- `estVide()` always returns `true` --> `testIsEmpty` still passes (only checks `true`)
- `ajouterElement()` does nothing --> `testAjouterElement` still passes (no assertion)
- `contient()` always returns `true` --> `testContient` still passes (only asserts `true`)

A good test suite should **fail when the implementation changes**. Tests that pass regardless of the implementation provide a false sense of security. This is precisely what mutation testing detects.

---

### Question 3

### En ligne de commande, executez Pitest : `mvn clean install test org.pitest:pitest-maven:mutationCoverage` puis ouvrez le fichier `index.html` se trouvant dans `target/pi-reports`. Pitest est un outil de score de *mutation testing*. Essayez de comprendre le principe a partir des resultats.

**Answer:**

**What Pitest does:**

1. Runs your tests to make sure they all pass (baseline)
2. Creates **mutants**: copies of your code with small changes:
   - Replacing `<=` with `<` (boundary mutant)
   - Replacing `return true` with `return false`
   - Removing method calls
   - Changing `+` to `-`
3. Runs your tests against each mutant
4. If a test fails (detects the mutation), the mutant is **killed** (good)
5. If all tests pass (mutation undetected), the mutant **survives** (bad)
6. **Mutation score** = killed mutants / total mutants * 100%

With the original weak tests, many mutants survive because:
- Changing `i <= taille` to `i < taille` --> tests still pass (the bug fix is undetected!)
- Removing `maListe.add(elt)` --> `testAjouterElement` still passes (no assertion)
- Changing `return maListe.isEmpty()` to `return true` --> `testIsEmpty` still passes

---

### Question 4

### Concernant le *mutation testing*, modifier la suite de tests de `TestExo9` pour arriver a un score de mutation de 100% (corrigez egalement les eventuels defauts presents dans la classe `Exo9`).

**Answer:**

**Step 1: Fix the bug in `Exo9.contient()`**

The bug is on line 24: `i <= taille` should be `i < taille`. If the list has 3 elements, `taille = 3`, valid indices are 0, 1, 2. With `i <= 3`, the loop tries `maListe.get(3)`, which throws `IndexOutOfBoundsException`.

**Fixed Exo9.java:**

```java
package cpoo1.exo9;

import java.util.ArrayList;
import java.util.List;

public class Exo9 {
    private final List<String> maListe;

    public Exo9() {
        maListe = new ArrayList<>();
    }

    public void ajouterElement(String elt) {
        maListe.add(elt);
    }

    public boolean estVide() {
        return maListe.isEmpty();
    }

    public boolean contient(String str) {
        final int taille = maListe.size();

        for (int i = 0; i < taille; i++) {    // FIXED: < instead of <=
            if (maListe.get(i).equals(str)) {
                return true;
            }
        }
        return false;
    }
}
```

**Step 2: Write comprehensive tests for 100% mutation score**

To achieve 100% mutation score, every possible mutation must cause at least one test to fail:

```java
package cpoo1.exo9;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class TestExo9 {
    Exo9 exo9;

    @BeforeEach
    void setUp() {
        exo9 = new Exo9();
    }

    // ========== estVide tests ==========

    @Test
    void testEstVideTrue() {
        assertTrue(exo9.estVide());
    }

    @Test
    void testEstVideFalse() {
        exo9.ajouterElement("foo");
        assertFalse(exo9.estVide());  // kills "return true" mutant
    }

    // ========== ajouterElement tests ==========

    @Test
    void testAjouterElementAddsToList() {
        exo9.ajouterElement("foo");
        assertFalse(exo9.estVide());      // kills "remove add()" mutant
        assertTrue(exo9.contient("foo")); // verifies element was actually added
    }

    @Test
    void testAjouterMultipleElements() {
        exo9.ajouterElement("a");
        exo9.ajouterElement("b");
        assertTrue(exo9.contient("a"));
        assertTrue(exo9.contient("b"));
    }

    // ========== contient tests ==========

    @Test
    void testContientPresent() {
        exo9.ajouterElement("bar");
        assertTrue(exo9.contient("bar"));  // kills "return false" mutant in loop
    }

    @Test
    void testContientAbsent() {
        exo9.ajouterElement("bar");
        assertFalse(exo9.contient("notHere"));  // kills "return true" mutant at end
        // Also catches the i <= taille bug (would throw IndexOutOfBoundsException)
    }

    @Test
    void testContientEmptyList() {
        assertFalse(exo9.contient("anything"));  // loop body never executes
    }

    @Test
    void testContientMultipleElementsFoundLast() {
        exo9.ajouterElement("a");
        exo9.ajouterElement("b");
        exo9.ajouterElement("c");
        assertTrue(exo9.contient("c"));  // exercises the loop fully
    }

    @Test
    void testContientMultipleElementsNotFound() {
        exo9.ajouterElement("a");
        exo9.ajouterElement("b");
        assertFalse(exo9.contient("z"));  // loop runs through all elements
    }
}
```

**Why each test kills specific mutants:**

| Mutant | Killed By |
|--------|-----------|
| Remove `maListe.add(elt)` in `ajouterElement` | `testAjouterElementAddsToList` (assertFalse on estVide fails) |
| Change `return maListe.isEmpty()` to `return true` | `testEstVideFalse` (assertFalse fails) |
| Change `return maListe.isEmpty()` to `return false` | `testEstVideTrue` (assertTrue fails) |
| Change `i < taille` to `i <= taille` | `testContientAbsent` (throws IndexOutOfBoundsException) |
| Change `return true` to `return false` in contient loop | `testContientPresent` (assertTrue fails) |
| Change `return false` to `return true` at end of contient | `testContientAbsent` (assertFalse fails) |
| Remove the `equals` check | `testContientAbsent` (would return true for any string) |
| Negate the `equals` check | `testContientPresent` (would not find "bar") |

**File changes:**
- `Exo9.java`: Fixed bug `i <= taille` to `i < taille` on line 24
- `TestExo9.java`: Rewritten with comprehensive assertions covering both true and false returns for every method
