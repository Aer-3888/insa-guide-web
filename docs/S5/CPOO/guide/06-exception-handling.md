---
title: "Exception Handling"
sidebar_position: 6
---

# Exception Handling

## Theory

### Exception Hierarchy

```
             Throwable
            /         \
       Error         Exception
    (do not catch)    /        \
                RuntimeException  Checked Exceptions
                (unchecked)       (must be declared)
                  |                    |
          NullPointerException    IOException
          IllegalArgumentException NetworkException (custom)
          IndexOutOfBoundsException AnException (custom)
          SecurityException
          NumberFormatException
          ConcurrentModificationException
```

### Checked vs Unchecked Exceptions

| Type | Must declare (`throws`) | Must catch | Examples |
|------|------------------------|------------|----------|
| **Checked** | Yes | Yes (or declare) | `IOException`, `NetworkException`, `AnException` |
| **Unchecked** (RuntimeException) | No | No (optional) | `NullPointerException`, `IllegalArgumentException` |

### try/catch/finally

```java
public boolean connectServer(final String address) {
    if (!regex.matcher(address).matches()) {
        return false;                    // validation before try
    }

    try {
        boolean pingOK = network.ping(address);      // may throw NetworkException
        network.sendGetHTTPQuery(address);
        return pingOK;
    } catch (NetworkException ex) {
        return false;                    // handle checked exception
    }
}
```

### Throwing Exceptions

```java
public A(final B b) {
    if (b == null) {
        throw new IllegalArgumentException();    // input validation
    }
    this.b = b;
}
```

### Custom Exception Classes

```java
// Checked exception (extends Exception)
public class NetworkException extends Exception {
}

// Checked exception with message
public class AnException extends Exception {
    public AnException(String e) {
        super(e);
    }
}
```

### Declaring Exceptions with `throws`

When a method can throw a checked exception, it must declare it:

```java
public interface B {
    int getB1() throws AnException;        // declares checked exception
}

public int al(final boolean value) throws SecurityException, NumberFormatException, AnException {
    doSomething();
    if (str == null || !value) {
        return 0;
    }
    return str.length() * b.getB1();       // b.getB1() may throw AnException
}
```

### Static Factory Methods and Exception Handling

A common pattern is to wrap constructor exceptions in a factory method:

```java
public static A create(final B b) {
    try {
        return new A(b);                   // constructor throws if b is null
    } catch (final IllegalArgumentException ex) {
        return null;                       // return null instead of propagating
    }
}
```

### Exception Handling in Tests

**Testing that an exception is thrown**:
```java
@Test
void testConstructWithNull() {
    assertThrows(IllegalArgumentException.class, () -> {
        new A(null);
    });
}
```

**Testing that an exception is NOT thrown (normal flow)**:
```java
@Test
void testNormalFlow() throws AnException {
    // If al() throws, the test fails automatically
    assertEquals(0, at.al(false));
}
```

**Common exam mistake -- wrapping in try/catch instead of assertThrows**:
```java
// WRONG (verbose, error-prone)
@Test
void testBad() {
    try {
        foobar.m(null);
        fail();                            // easy to forget
    } catch (MyException ex) {
        assertTrue(true);                  // meaningless assertion
    }
}

// CORRECT
@Test
void testGood() {
    assertThrows(MyException.class, () -> foobar.m(null));
}
```

### The Bug in Exo9: IndexOutOfBoundsException

The course includes a deliberate bug to teach about exception boundaries:

```java
public boolean contient(String str) {
    final int taille = maListe.size();
    for (int i = 0; i <= taille; i++) {    // BUG: should be i < taille
        if (maListe.get(i).equals(str)) {
            return true;
        }
    }
    return false;
}
```

When `i == taille`, `maListe.get(i)` throws `IndexOutOfBoundsException`. The fix: change `<=` to `<`.

---

## Exception Patterns from Exams

### Pattern 1: Short-circuit evaluation and exceptions

```java
// In A.al():
if (str == null || !value) {
    return 0;
}
return str.length() * b.getB1();    // b.getB1() may throw AnException
```

The `||` operator short-circuits: if `str == null` is true, `!value` is not evaluated. Similarly, if `str != null` and `value == true`, then `str.length()` is safe (no NPE) and `b.getB1()` is called (may throw `AnException`).

### Pattern 2: Multiple exception types

```java
public int al(final boolean value) throws SecurityException, NumberFormatException, AnException {
    ...
}
```

A method can declare multiple exception types. In tests, you should verify which exceptions are actually reachable.

### Pattern 3: Exception from mocked objects

```java
B beh = Mockito.mock(B.class);
Mockito.when(beh.getB1()).thenThrow(new AnException("test"));

// Test that the exception propagates
assertThrows(AnException.class, () -> {
    A a = new A(beh);
    a.al(true);
});
```

---

## Common Pitfalls

1. **Catching too broadly**: `catch (Exception e)` hides specific errors. Catch the most specific exception type.
2. **Silently swallowing exceptions**: an empty `catch` block hides failures. At minimum, log the error.
3. **Off-by-one in loops**: `i <= size` instead of `i < size` causes `IndexOutOfBoundsException` (as in Exo9).
4. **Not testing exception paths**: achieving 100% coverage requires testing both normal and exception paths.
5. **Using `fail()` instead of `assertThrows()`**: the modern JUnit 5 way is `assertThrows()`, which is cleaner and less error-prone.

---

## CHEAT SHEET

```
EXCEPTION HIERARCHY
  Throwable > Exception > RuntimeException (unchecked)
  Throwable > Exception > [custom] (checked if extends Exception directly)
  Throwable > Error (do not catch: OutOfMemoryError, StackOverflowError)

CHECKED EXCEPTIONS
  Must declare: throws ExType in method signature
  Must handle: try/catch or propagate with throws
  Examples: IOException, custom exceptions extending Exception

UNCHECKED EXCEPTIONS (RuntimeException)
  No declaration required
  Examples: NullPointerException, IllegalArgumentException,
            IndexOutOfBoundsException, ClassCastException

SYNTAX
  throw new ExceptionType("message");     // throw an exception
  throws ExType1, ExType2                 // declare in signature

  try {
      riskyCode();
  } catch (SpecificException e) {
      handleIt();
  } finally {
      alwaysRuns();                        // cleanup code
  }

TESTING EXCEPTIONS (JUnit 5)
  assertThrows(ExType.class, () -> code());
  assertDoesNotThrow(() -> code());

CUSTOM EXCEPTION
  public class MyException extends Exception {      // checked
      public MyException(String msg) { super(msg); }
  }
  public class MyRTException extends RuntimeException { // unchecked
      ...
  }
```
