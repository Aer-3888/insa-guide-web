---
title: "TP CPOO1 - UML to Java: Associations and Composition (Velo/Guidon/Roue)"
sidebar_position: 1
---

# TP CPOO1 - UML to Java: Associations and Composition (Velo/Guidon/Roue)

> Following teacher instructions from: `S5/CPOO/data/moodle/tp/tp1/README.md`

This TP covers how to translate UML class diagrams into Java code. It progresses from simple unidirectional associations through bidirectional referential integrity to composition with one-to-many relationships.

---

## Q.1 - Simple Association (0..1)

### Create a simple unidirectional association between `Velo` and `Guidon`. A `Velo` can have 0 or 1 `Guidon`. A `Guidon` can be associated with 0 or 1 `Velo`. Both classes have getters and setters.

**Answer:**

A 0..1 multiplicity in UML means the reference is optional (can be null). In Java, this is implemented as a nullable field. Both `Velo` and `Guidon` hold a reference to each other, but there is no automatic synchronization -- setting one side does not update the other.

**UML Diagram:**

```
+-----------------+         guidon     +-----------------+
|      Velo       | -----------------> |     Guidon      |
+-----------------+       0..1         +-----------------+
| - guidon: Guidon|                    | - velo: Velo    |
+-----------------+                    +-----------------+
| + getGuidon()   |       velo         | + getVelo()     |
| + setGuidon()   | <----------------- | + setVelo()     |
+-----------------+       0..1         +-----------------+
```

**Velo.java:**

```java
package q1;

public class Velo {
    private Guidon guidon = null;

    public Guidon getGuidon() {
        return this.guidon;
    }

    public void setGuidon(Guidon gd) {
        this.guidon = gd;
    }
}
```

**Guidon.java:**

```java
package q1;

public class Guidon {
    private Velo velo = null;

    public Velo getVelo() {
        return this.velo;
    }

    public void setVelo(Velo vl) {
        this.velo = vl;
    }
}
```

**Tests:**

```java
package q1;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloTest {

    @Test
    void testInitialGuidonIsNull() {
        Velo v = new Velo();
        assertNull(v.getGuidon());
    }

    @Test
    void testSetAndGetGuidon() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        assertSame(g, v.getGuidon());
    }

    @Test
    void testSetGuidonToNull() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        v.setGuidon(null);
        assertNull(v.getGuidon());
    }
}

class GuidonTest {

    @Test
    void testInitialVeloIsNull() {
        Guidon g = new Guidon();
        assertNull(g.getVelo());
    }

    @Test
    void testSetAndGetVelo() {
        Guidon g = new Guidon();
        Velo v = new Velo();
        g.setVelo(v);
        assertSame(v, g.getVelo());
    }
}
```

**The problem with Q.1:** There is no automatic synchronization between the two sides. After `v.setGuidon(g)`, calling `g.getVelo()` still returns null. The programmer must manually call both sides, which is error-prone. This motivates Q.2.

**File changes:**
- `q1/Velo.java`: Created with a `Guidon` field, getter, and setter
- `q1/Guidon.java`: Created with a `Velo` field, getter, and setter

---

## Q.2 - Bidirectional Association with Referential Integrity

### Ensure referential integrity when adding a `Guidon` to a `Velo`. When `velo.setGuidon(guidon)` is called, `guidon.setVelo(velo)` should be automatically called.

**Answer:**

Referential integrity means both sides of a bidirectional association are always consistent. The solution is to designate one class as the "master" (Velo) that manages the relationship. The other class (Guidon) has a simple setter. The key challenge is avoiding infinite recursion: if `setGuidon` calls `setVelo` and `setVelo` calls `setGuidon`, you get a stack overflow. The guard clause `if (gd != this.guidon)` prevents this.

**UML Diagram:**

```
+-----------------+        guidon      +-----------------+
|      Velo       | =================> |     Guidon      |
+-----------------+       0..1         +-----------------+
| - guidon: Guidon|   referential      | - velo: Velo    |
+-----------------+   integrity        +-----------------+
| + getGuidon()   |                    | + getVelo()     |
| + setGuidon()   | <================= | + setVelo()     |
+-----------------+       0..1         +-----------------+
```

**Velo.java** (master side -- manages the relationship):

```java
package q2;

public class Velo {
    private Guidon guidon = null;

    public Guidon getGuidon() {
        return this.guidon;
    }

    public void setGuidon(Guidon gd) {
        // Guard: if same object, do nothing (prevents infinite recursion)
        if (gd != this.guidon) {
            Guidon oldGuidon = this.guidon;

            // If removing the handlebar, notify the old one
            if (gd == null && oldGuidon != null) {
                oldGuidon.setVelo(null);
            }

            // Set the new handlebar
            this.guidon = gd;

            // Establish back-reference on the new handlebar
            if (gd != null) {
                gd.setVelo(this);
            }
        }
    }
}
```

**Guidon.java** (passive side -- simple setter):

```java
package q2;

public class Guidon {
    private Velo velo = null;

    public Velo getVelo() {
        return this.velo;
    }

    // Simple setter. The Velo side manages referential integrity.
    // This method does NOT call back to Velo.setGuidon() to avoid infinite recursion.
    public void setVelo(Velo vl) {
        this.velo = vl;
    }
}
```

**How infinite recursion is prevented:**

```
v.setGuidon(g)
  |-- gd != this.guidon? YES (guidon was null, gd is g)
  |-- this.guidon = g
  |-- g.setVelo(v)              // Guidon.setVelo is a simple setter
  |     |-- this.velo = v       // Done. No callback.
  |-- Done.
```

If `Guidon.setVelo` called back `v.setGuidon(g)`, the guard `gd != this.guidon` would evaluate to FALSE (because `this.guidon` is already `g`), and the method would return immediately.

**Tests:**

```java
package q2;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloGuidonTest {

    @Test
    void testReferentialIntegrityOnSet() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        assertSame(g, v.getGuidon());
        assertSame(v, g.getVelo());     // automatic back-reference
    }

    @Test
    void testReplaceGuidonUpdatesOldAndNew() {
        Velo v = new Velo();
        Guidon g1 = new Guidon();
        Guidon g2 = new Guidon();
        v.setGuidon(g1);
        v.setGuidon(g2);
        assertSame(g2, v.getGuidon());
        assertSame(v, g2.getVelo());    // new guidon linked
    }

    @Test
    void testRemoveGuidonCleansUp() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        v.setGuidon(null);
        assertNull(v.getGuidon());
        assertNull(g.getVelo());        // old back-reference cleared
    }

    @Test
    void testSetSameGuidonTwice() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        v.setGuidon(g);                 // no change
        assertSame(g, v.getGuidon());
        assertSame(v, g.getVelo());
    }

    @Test
    void testInitialStateIsNull() {
        Velo v = new Velo();
        assertNull(v.getGuidon());
    }
}
```

**File changes:**
- `q2/Velo.java`: Copied from q1, modified `setGuidon()` to maintain referential integrity with a guard clause and back-reference update
- `q2/Guidon.java`: Copied from q1, unchanged (passive side)

---

## Q.3 - Removing Bidirectional Access

### Prevent `Guidon` from accessing its parent `Velo`. The association is strictly unidirectional with multiplicity 1 (a Velo MUST have a Guidon).

**Answer:**

When navigation is only needed in one direction, the design is simpler. The `Guidon` becomes a pure component with no knowledge of who owns it. The multiplicity changes from 0..1 to 1, meaning null is rejected.

**UML Diagram:**

```
+-----------------+        guidon      +-----------------+
|      Velo       | -----------------> |     Guidon      |
+-----------------+          1         +-----------------+
| - guidon: Guidon|                    |                 |
+-----------------+                    +-----------------+
| + Velo()        |   NO back-reference.
| + Velo(Guidon)  |   Multiplicity is 1 (not 0..1).
| + getGuidon()   |
| + setGuidon()   |
+-----------------+
```

**Velo.java:**

```java
package q3;

public class Velo {
    private Guidon guidon;

    public Velo() {
        // guidon is null by default
    }

    // Constructor enforcing multiplicity-1 constraint
    public Velo(Guidon gd) {
        if (gd == null) {
            throw new IllegalArgumentException("Guidon cannot be null");
        }
        this.guidon = gd;
    }

    public Guidon getGuidon() {
        return this.guidon;
    }

    // Rejects null to enforce multiplicity 1. If null is passed, no-op.
    public void setGuidon(Guidon gd) {
        if (gd != null) {
            this.guidon = gd;
        }
    }
}
```

**Guidon.java:**

```java
package q3;

// Simple handlebar with no reference to any bicycle.
public class Guidon {
    public Guidon() {
        // Empty constructor
    }
}
```

**Tests:**

```java
package q3;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloTest {

    @Test
    void testConstructorWithValidGuidon() {
        Guidon g = new Guidon();
        Velo v = new Velo(g);
        assertSame(g, v.getGuidon());
    }

    @Test
    void testConstructorWithNullThrows() {
        assertThrows(IllegalArgumentException.class, () -> new Velo(null));
    }

    @Test
    void testDefaultConstructorHasNullGuidon() {
        Velo v = new Velo();
        assertNull(v.getGuidon());
    }

    @Test
    void testSetGuidonWithValidGuidon() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        assertSame(g, v.getGuidon());
    }

    @Test
    void testSetGuidonWithNullDoesNothing() {
        Guidon g = new Guidon();
        Velo v = new Velo(g);
        v.setGuidon(null);
        assertSame(g, v.getGuidon()); // unchanged
    }

    @Test
    void testReplaceGuidon() {
        Guidon g1 = new Guidon();
        Guidon g2 = new Guidon();
        Velo v = new Velo(g1);
        v.setGuidon(g2);
        assertSame(g2, v.getGuidon());
    }
}
```

**File changes:**
- `q3/Velo.java`: Copied from q2, removed referential integrity logic, added constructor with null validation, setGuidon rejects null
- `q3/Guidon.java`: Removed `velo` field, `getVelo()`, and `setVelo()` entirely

---

## Q.4 - One-to-Many Association (0..*)

### Implement a one-to-many association where a `Velo` has multiple `Roue` (wheels). The association is unidirectional.

**Answer:**

A 0..* multiplicity means "zero or more," which maps to a `List<Roue>` in Java. The collection must be initialized in the constructor (otherwise `NullPointerException`). Null and duplicate wheels are rejected.

**UML Diagram:**

```
+---------------------+       roues      +-------------+
|       Velo          | ---------------> |    Roue     |
+---------------------+      0..*        +-------------+
| - roues: List<Roue> |                  |             |
+---------------------+                  +-------------+
| + Velo()            |                  | + Roue()    |
| + getRoues()        |                  +-------------+
| + addRoue(Roue)     |
| + removeRoues(Roue) |
+---------------------+
```

**Velo.java:**

```java
package q4;

import java.util.ArrayList;
import java.util.List;

public class Velo {
    private List<Roue> roues;

    public Velo() {
        this.roues = new ArrayList<>();
    }

    public List<Roue> getRoues() {
        return this.roues;
    }

    // Adds a wheel. Rejects null and duplicate wheels.
    public Boolean addRoue(Roue r) {
        if (r == null || this.roues.contains(r)) {
            return false;
        }
        return this.roues.add(r);
    }

    // Removes a wheel from this bicycle.
    public Boolean removeRoues(Roue r) {
        return this.roues.remove(r);
    }
}
```

**Roue.java:**

```java
package q4;

// Simple wheel with no knowledge of which bicycle it belongs to.
public class Roue {
    public Roue() {
        // Empty constructor
    }
}
```

**Tests:**

```java
package q4;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloRoueTest {
    private Velo velo;

    @BeforeEach
    void setUp() {
        velo = new Velo();
    }

    @Test
    void testInitiallyNoWheels() {
        assertTrue(velo.getRoues().isEmpty());
    }

    @Test
    void testAddOneWheel() {
        Roue r = new Roue();
        assertTrue(velo.addRoue(r));
        assertEquals(1, velo.getRoues().size());
        assertSame(r, velo.getRoues().get(0));
    }

    @Test
    void testAddMultipleWheels() {
        Roue r1 = new Roue();
        Roue r2 = new Roue();
        assertTrue(velo.addRoue(r1));
        assertTrue(velo.addRoue(r2));
        assertEquals(2, velo.getRoues().size());
    }

    @Test
    void testAddNullRejected() {
        assertFalse(velo.addRoue(null));
        assertEquals(0, velo.getRoues().size());
    }

    @Test
    void testAddDuplicateRejected() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertFalse(velo.addRoue(r));
        assertEquals(1, velo.getRoues().size());
    }

    @Test
    void testRemoveWheel() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertTrue(velo.removeRoues(r));
        assertEquals(0, velo.getRoues().size());
    }

    @Test
    void testRemoveNonexistentWheel() {
        Roue r = new Roue();
        assertFalse(velo.removeRoues(r));
    }
}
```

**File changes:**
- `q4/Velo.java`: Created with `List<Roue>` field, `addRoue()` with null/duplicate guards, `removeRoues()`
- `q4/Roue.java`: Created as a simple empty class

---

## Q.5 - Composition with Bidirectional Navigation

### Implement composition where `Roue` belongs to exactly one `Velo`, and `Velo` can access its wheels. Respect referential integrity of the `roues` role in the composition.

**Answer:**

Composition is a strong form of association where the "part" (Roue) belongs to exactly one "whole" (Velo) at a time. Adding a Roue to a Velo sets `roue.getVelo()` automatically. Removing a Roue clears it. Moving a Roue from one Velo to another removes it from the first. The infinite recursion prevention is more complex here because both `addRoue` and `setVelo` call each other.

**UML Diagram:**

```
+---------------------+       roues      +------------------+
|       Velo          |<>=============>  |      Roue        |
+---------------------+      0..*        +------------------+
| - roues: List<Roue> |                  | - velo: Velo     |
+---------------------+      velo        +------------------+
| + Velo()            | <=============== | + getVelo()      |
| + getRoues()        |      0..1        | + setVelo(Velo)  |
| + addRoue(Roue)     |                  +------------------+
| + removeRoues(Roue) |
+---------------------+
```

**Velo.java:**

```java
package q5;

import java.util.ArrayList;
import java.util.List;

public class Velo {
    private List<Roue> roues;

    public Velo() {
        this.roues = new ArrayList<>();
    }

    public List<Roue> getRoues() {
        return this.roues;
    }

    // Adds a wheel with referential integrity.
    // 1. Reject null and duplicates
    // 2. Add to collection
    // 3. If wheel does not already reference us, set it (prevents recursion)
    public Boolean addRoue(Roue r) {
        if (r == null || this.roues.contains(r)) {
            return false;
        }

        this.roues.add(r);

        // Establish back-reference (guard prevents recursion)
        if (r.getVelo() != this) {
            r.setVelo(this);
        }

        return true;
    }

    // Removes a wheel with referential integrity.
    // 1. Reject null
    // 2. If wheel is in collection, clear its back-reference, then remove
    public Boolean removeRoues(Roue r) {
        if (r == null) {
            return false;
        }

        if (this.roues.contains(r)) {
            if (r.getVelo() == this) {
                r.setVelo(null);
            }
            this.roues.remove(r);
            return true;
        }

        return false;
    }
}
```

**Roue.java:**

```java
package q5;

public class Roue {
    private Velo velo = null;

    public Velo getVelo() {
        return this.velo;
    }

    // Sets the bicycle this wheel belongs to with referential integrity.
    // 1. If already set to this bike, do nothing (recursion guard)
    // 2. If currently on another bike, remove from that bike first
    //    (clear reference BEFORE calling removeRoues to prevent recursion)
    // 3. Set the new bike reference
    // 4. If new bike does not already contain us, add us
    public void setVelo(Velo vl) {
        if (this.velo == vl) {
            return;
        }

        // Remove from old bike (if any)
        if (this.velo != null) {
            Velo oldVelo = this.velo;
            this.velo = null;          // clear BEFORE calling remove
            oldVelo.removeRoues(this);
        }

        // Set new bike
        this.velo = vl;

        // Add to new bike's collection (if not already there)
        if (vl != null && !vl.getRoues().contains(this)) {
            vl.addRoue(this);
        }
    }
}
```

**How infinite recursion is prevented for a normal add:**

```
bike.addRoue(wheel)
  |-- wheel not null, not in list --> add to list
  |-- wheel.getVelo() != bike --> call wheel.setVelo(bike)
  |     |-- this.velo != bike? YES (was null)
  |     |-- this.velo is null, so skip "remove from old bike"
  |     |-- this.velo = bike
  |     |-- bike.getRoues().contains(this)? YES (just added above)
  |     |-- skip addRoue (already in collection)
  |-- DONE
```

**How moving a wheel between bikes works:**

```
wheel.setVelo(bike2)
  |-- this.velo != bike2? YES (was bike1)
  |-- oldVelo = bike1
  |-- this.velo = null          <-- break link BEFORE callback
  |-- bike1.removeRoues(wheel)
  |     |-- wheel is in bike1's list
  |     |-- wheel.getVelo() == bike1? NO (we set it to null)
  |     |-- skip setVelo(null) call
  |     |-- remove from list
  |-- this.velo = bike2
  |-- bike2 does not contain wheel --> bike2.addRoue(wheel)
  |     |-- wheel not null, not in list --> add to list
  |     |-- wheel.getVelo() == bike2? YES (just set above)
  |     |-- skip setVelo call
  |-- DONE
```

**Tests:**

```java
package q5;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CompositionTest {
    private Velo velo;

    @BeforeEach
    void setUp() {
        velo = new Velo();
    }

    @Test
    void testAddRoueSetsBackReference() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertSame(velo, r.getVelo());
    }

    @Test
    void testAddRoueAppearsInList() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertEquals(1, velo.getRoues().size());
        assertSame(r, velo.getRoues().get(0));
    }

    @Test
    void testAddNullRejected() {
        assertFalse(velo.addRoue(null));
    }

    @Test
    void testAddDuplicateRejected() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertFalse(velo.addRoue(r));
        assertEquals(1, velo.getRoues().size());
    }

    @Test
    void testRemoveRoueClearsBackReference() {
        Roue r = new Roue();
        velo.addRoue(r);
        velo.removeRoues(r);
        assertNull(r.getVelo());
    }

    @Test
    void testRemoveRoueRemovesFromList() {
        Roue r = new Roue();
        velo.addRoue(r);
        velo.removeRoues(r);
        assertTrue(velo.getRoues().isEmpty());
    }

    @Test
    void testRemoveNullReturnsFalse() {
        assertFalse(velo.removeRoues(null));
    }

    @Test
    void testRemoveNonexistentReturnsFalse() {
        assertFalse(velo.removeRoues(new Roue()));
    }

    @Test
    void testMoveWheelViaSetVelo() {
        Velo v1 = new Velo();
        Velo v2 = new Velo();
        Roue r = new Roue();

        v1.addRoue(r);
        assertSame(v1, r.getVelo());
        assertEquals(1, v1.getRoues().size());

        r.setVelo(v2);     // move wheel to v2

        assertFalse(v1.getRoues().contains(r));   // removed from v1
        assertTrue(v2.getRoues().contains(r));     // added to v2
        assertSame(v2, r.getVelo());               // back-reference updated
    }

    @Test
    void testDetachWheel() {
        Roue r = new Roue();
        velo.addRoue(r);
        r.setVelo(null);
        assertNull(r.getVelo());
        assertFalse(velo.getRoues().contains(r));
    }

    @Test
    void testSetVeloDirectlyAddsToList() {
        Roue r = new Roue();
        r.setVelo(velo);    // set from the Roue side
        assertTrue(velo.getRoues().contains(r));
        assertSame(velo, r.getVelo());
    }

    @Test
    void testSetVeloSameBikeNoOp() {
        Roue r = new Roue();
        velo.addRoue(r);
        r.setVelo(velo);    // already set
        assertEquals(1, velo.getRoues().size());
        assertSame(velo, r.getVelo());
    }
}
```

**File changes:**
- `q5/Velo.java`: Copied from q4, added referential integrity in `addRoue()` and `removeRoues()` with back-reference management
- `q5/Roue.java`: Added `velo` field with `getVelo()` and `setVelo()` that handles moving between bikes with break-before-callback recursion prevention

---

## Q.6 - Testing with Moodle Test Suite

### Execute tests provided by Moodle and correct any issues.

**Answer:**

This step validates the implementation against the teacher's official test suite.

**Steps:**

1. Download the test archive from Moodle
2. Extract it to `test/java2` directory in your project
3. In IntelliJ: right-click on `java2` folder, select "Mark directory as" then "Test Sources Root"
4. Run all tests using right-click on the test class, then "Run"
5. Fix any failing tests by correcting your implementation in q1 through q5

**Common issues found by the Moodle test suite:**

- Forgetting to check for null in `addRoue()`
- Not handling the case where `removeRoues()` is called with a wheel not in the list
- Infinite recursion in bidirectional associations due to missing guard clauses
- Not clearing old back-references when replacing a Guidon in Q.2

If a test fails, read the assertion message carefully. It tells you which expected value did not match the actual value. Trace through your code with the test's inputs to find the discrepancy.

---

## Summary Table

| Question | Classes | Relationship | Key Concept |
|----------|---------|-------------|-------------|
| Q.1 | Velo, Guidon | 0..1 bidirectional, no sync | Simple association |
| Q.2 | Velo, Guidon | 0..1 bidirectional, with integrity | Referential integrity, guard clauses |
| Q.3 | Velo, Guidon | 1 unidirectional | Remove back-reference, reject null |
| Q.4 | Velo, Roue | 0..* unidirectional | One-to-many with List |
| Q.5 | Velo, Roue | 0..* composition with integrity | Composition, break-before-callback |
| Q.6 | All | All | Validate against Moodle tests |
