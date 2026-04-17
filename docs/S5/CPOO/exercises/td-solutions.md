---
title: "TD Solutions - Tutorials (MyPoint, Line, UML)"
sidebar_position: 1
---

# TD Solutions - Tutorials (MyPoint, Line, UML)

> Following teacher instructions from: `S5/CPOO/data/moodle/tp/tp3_gitlab_exercises/` (cours examples)

These TD exercises cover unit testing fundamentals, mocking, and UML diagram interpretation. They serve as preparation for the TP exercises.

---

## TD: Line Testing (cours)

### Code Under Test

The `Line` class represents a 2D line defined by two points. It computes the slope (a) and y-intercept (b) of the equation `y = ax + b`.

**Line.java** (`cpoo1/cours/`):

```java
package cpoo1.cours;

class Line {
    private Point p1;
    private Point p2;

    public Line(double x1, double y1, double x2, double y2) {
       p1 = new Point(x1, y1);
       p2 = new Point(x2, y2);
    }

    public boolean isVertical() {
        double res = p1.x() - p2.x();
        return Math.abs(res) <= 0.000001;
    }

    public double getA() {
       if(isVertical()) {
          return Double.NaN;
       }
       return (p1.y() - p2.y()) / (p1.x() - p2.x());
    }

    public double getB() {
       return isVertical() ? Double.NaN : p1.y() - getA() * p1.x();
    }
}

record Point(double x, double y) {}
```

**TranslationVector.java:**

```java
package cpoo1.cours;

public interface TranslationVector {
    int getTx();
    int getTy();
}
```

### Existing Test (provided by teacher)

**LineTest.java:**

```java
package cpoo1.cours;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LineTest {
    Line line;

    @BeforeEach
    void setup() {
        line = new Line(1, 2, 3, 4);
    }

    @Test
    void testA() {
        // slope = (2-4)/(1-3) = -2/-2 = 1
        assertEquals(1, line.getA(), 0.001);
    }

    @Test
    void testB() {
        // b = y1 - a*x1 = 2 - 1*1 = 1
        assertEquals(1, line.getB(), 0.001);
    }
}
```

### Complete Test Solution

The existing tests only cover the normal case (non-vertical line). For full coverage, we need to test vertical lines, horizontal lines, and edge cases.

```java
package cpoo1.cours;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class LineTestComplete {

    @Test
    void testNonVerticalSlope() {
        Line line = new Line(1, 2, 3, 4);
        // slope = (2-4)/(1-3) = -2/-2 = 1
        assertEquals(1, line.getA(), 0.001);
    }

    @Test
    void testNonVerticalIntercept() {
        Line line = new Line(1, 2, 3, 4);
        // b = y1 - a*x1 = 2 - 1*1 = 1
        assertEquals(1, line.getB(), 0.001);
    }

    @Test
    void testVerticalLine() {
        Line line = new Line(5, 1, 5, 10);
        assertTrue(line.isVertical());
        assertTrue(Double.isNaN(line.getA()));
        assertTrue(Double.isNaN(line.getB()));
    }

    @Test
    void testHorizontalLine() {
        Line line = new Line(1, 5, 10, 5);
        assertFalse(line.isVertical());
        assertEquals(0, line.getA(), 0.001);  // slope = 0
        assertEquals(5, line.getB(), 0.001);  // intercept = 5
    }

    @Test
    void testNonVerticalLine() {
        Line line = new Line(1, 2, 3, 4);
        assertFalse(line.isVertical());
    }

    @Test
    void testNegativeSlope() {
        Line line = new Line(0, 10, 5, 0);
        // slope = (10-0)/(0-5) = 10/-5 = -2
        assertEquals(-2, line.getA(), 0.001);
        // b = y1 - a*x1 = 10 - (-2)*0 = 10
        assertEquals(10, line.getB(), 0.001);
    }

    @Test
    void testAlmostVerticalLine() {
        // Two x values within the 0.000001 tolerance
        Line line = new Line(5, 1, 5.0000001, 10);
        assertTrue(line.isVertical());
    }
}
```

---

## TD: MyPoint Testing

### Code Under Test (assumed structure)

`MyPoint` is a basic 2D point class used to teach unit testing, mocking, and interface-based design.

### Test Solutions

#### Getters and Setters

```java
@Test
void testGetSetX() {
    MyPoint mp = new MyPoint();
    mp.setX(4.0);
    assertEquals(4.0, mp.getX(), 1e-4);
}

@Test
void testGetSetY() {
    MyPoint mp = new MyPoint();
    mp.setY(4.0);
    assertEquals(4.0, mp.getY(), 1e-4);
}
```

#### Constructors

```java
// Default constructor: (0, 0)
@Test
void testDefaultConstructor() {
    MyPoint mp = new MyPoint();
    assertEquals(0, mp.getX(), 1e-6);
    assertEquals(0, mp.getY(), 1e-6);
}

// Parameterized constructor
@Test
void testParameterizedConstructor() {
    MyPoint mp = new MyPoint(192.168, 42.1);
    assertEquals(192.168, mp.getX(), 1e-6);
    assertEquals(42.1, mp.getY(), 1e-6);
}

// Copy constructor
@Test
void testCopyConstructor() {
    MyPoint original = new MyPoint(192.168, 42.1);
    MyPoint copy = new MyPoint(original);
    assertEquals(192.168, copy.getX(), 1e-6);
    assertEquals(42.1, copy.getY(), 1e-6);
}
```

#### Scale

```java
@Test
void testScale() {
    MyPoint mp = new MyPoint(192.168, 42.1);
    MyPoint scaled = mp.scale(1000.0);
    assertEquals(192168.0, scaled.getX(), 1e-6);
    assertEquals(42100.0, scaled.getY(), 1e-6);
}

@Test
void testScaleByZero() {
    MyPoint mp = new MyPoint(192.168, 42.1);
    MyPoint scaled = mp.scale(0);
    assertEquals(0.0, scaled.getX(), 1e-6);
    assertEquals(0.0, scaled.getY(), 1e-6);
}
```

Note: `scale` returns a NEW point (immutability) -- the original is unchanged.

#### Horizontal Symmetry

```java
@Test
void testHorizontalSymmetry() {
    MyPoint mp = new MyPoint(128.0, 17.0);
    MyPoint result = mp.horizontalSymmetry(new MyPoint(100.0, 100.0));
    assertEquals(72.0, result.getX(), 1e-6);   // 2 * 100 - 128 = 72
    assertEquals(17.0, result.getY(), 1e-6);   // Y unchanged
}

@Test
void testHorizontalSymmetryNull() {
    MyPoint mp = new MyPoint();
    assertThrows(IllegalArgumentException.class, () -> mp.horizontalSymmetry(null));
}
```

#### Translation

```java
@Test
void testTranslation() {
    MyPoint mp = new MyPoint(192.168, 42.1);
    mp.translate(100.2, -40.2);
    assertEquals(292.368, mp.getX(), 1e-6);
    assertEquals(1.9, mp.getY(), 1e-6);
}
```

Note: `translate` modifies the point in place (mutation), unlike `scale` which returns a new point.

#### Mocking Random

```java
@Test
void testSetPointRandom() {
    MyPoint mp = new MyPoint();
    Random random = Mockito.mock(Random.class);
    Mockito.when(random.nextInt()).thenReturn(892, 190);

    mp.setPoint(random, random);
    assertEquals(892, mp.getX(), 1e-6);
    assertEquals(190, mp.getY(), 1e-6);
}
```

Key point: `Random.nextInt()` is non-deterministic by nature. Mocking makes tests deterministic.

#### Mocking ITranslation Interface

```java
@Test
void testITranslation() {
    MyPoint mp = new MyPoint();
    ITranslation it = Mockito.mock(ITranslation.class);
    Mockito.when(it.getTx()).thenReturn(29);
    Mockito.when(it.getTy()).thenReturn(863);

    mp.translate(it);
    assertEquals(29, mp.getX(), 1e-6);
    assertEquals(863, mp.getY(), 1e-6);
}

@Test
void testNullITranslation() {
    MyPoint mp = new MyPoint();
    assertThrows(IllegalArgumentException.class, () -> mp.translate((ITranslation) null));
}
```

Key point: the cast `(ITranslation) null` is needed to disambiguate between the two `translate` overloads (`translate(double, double)` vs `translate(ITranslation)`).

---

## TD UML -- Key Diagram Exercises

### Approach for UML Class Diagram Exercises

UML TD exercises ask you to convert textual descriptions to class diagrams. The systematic approach is:

1. **Identify nouns** -- these become classes or attributes
2. **Identify verbs** -- these become methods or associations
3. **Identify relationships**:
   - "is a" = inheritance (`extends`)
   - "has" = association/composition
   - "uses" = dependency
4. **Determine multiplicity**:
   - "one" = `1`
   - "zero or one" = `0..1`
   - "zero or more" = `0..*`
   - "at least one" = `1..*`
5. **Identify constraints** -- "must," "cannot," "at most"

### Step-by-Step Approach for Exam UML Questions

1. Read the text twice -- underline nouns (classes) and verbs (methods)
2. Draw classes first (boxes with names and attributes)
3. Add relationships (lines with arrows, diamonds, triangles)
4. Add multiplicity to every relationship end
5. Mark abstract classes and interfaces
6. Add methods where the text specifies behavior
7. Review: does every noun in the text appear in the diagram?

### UML Notation Summary

| Symbol | Meaning |
|--------|---------|
| Solid arrow (`-->`) | Unidirectional association |
| Line with arrows both ends (`<-->`) | Bidirectional association |
| Filled diamond (`<>---`) | Composition (strong ownership) |
| Empty diamond (`<>---`) | Aggregation (weak ownership) |
| Hollow triangle (`--triangleup>`) | Inheritance (`extends`) |
| Dashed arrow (`-->`) | Dependency / Implementation (`implements`) |
| `+` prefix | Public visibility |
| `-` prefix | Private visibility |
| `#` prefix | Protected visibility |
| *italics* | Abstract class/method |

### Common Relationships in CPOO

**Inheritance** (Arbre/Chene/Pin from Exercice 1):
```
Arbre <|-- Chene
Arbre <|-- Pin
```

**Composition** (Velo/Roue from TP1 Q5):
```
Velo *-- Roue : 0..*
```

**Association** (Velo/Guidon from TP1 Q1):
```
Velo -- Guidon : 0..1
```

**Generic/Parameterized** (Arbre<F> from Exercice 1 bonus):
```
Arbre<F extends Fruit> <|-- Chene (extends Arbre<Gland>)
```
