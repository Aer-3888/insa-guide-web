---
title: "Gestion des exceptions"
sidebar_position: 6
---

# Gestion des exceptions

## Theorie

### Hierarchie des exceptions

```
             Throwable
            /         \
       Error         Exception
    (ne pas attraper) /        \
                RuntimeException  Exceptions verifiees
                (non verifiees)   (doivent etre declarees)
                  |                    |
          NullPointerException    IOException
          IllegalArgumentException NetworkException (personnalisee)
          IndexOutOfBoundsException AnException (personnalisee)
          SecurityException
          NumberFormatException
          ConcurrentModificationException
```

### Exceptions verifiees vs non verifiees

| Type | Doit declarer (`throws`) | Doit attraper | Exemples |
|------|--------------------------|---------------|----------|
| **Verifiee** | Oui | Oui (ou declarer) | `IOException`, `NetworkException`, `AnException` |
| **Non verifiee** (RuntimeException) | Non | Non (optionnel) | `NullPointerException`, `IllegalArgumentException` |

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

### Lancer des exceptions

```java
public A(final B b) {
    if (b == null) {
        throw new IllegalArgumentException();    // input validation
    }
    this.b = b;
}
```

### Classes d'exceptions personnalisees

```java
// Exception verifiee (etend Exception)
public class NetworkException extends Exception {
}

// Exception verifiee avec message
public class AnException extends Exception {
    public AnException(String e) {
        super(e);
    }
}
```

### Declarer des exceptions avec `throws`

Lorsqu'une methode peut lancer une exception verifiee, elle doit la declarer :

```java
public interface B {
    int getB1() throws AnException;        // declare une exception verifiee
}

public int al(final boolean value) throws SecurityException, NumberFormatException, AnException {
    doSomething();
    if (str == null || !value) {
        return 0;
    }
    return str.length() * b.getB1();       // b.getB1() peut lancer AnException
}
```

### Methodes fabriques statiques et gestion des exceptions

Un patron courant consiste a encapsuler les exceptions du constructeur dans une methode fabrique :

```java
public static A create(final B b) {
    try {
        return new A(b);                   // constructor throws if b is null
    } catch (final IllegalArgumentException ex) {
        return null;                       // return null instead of propagating
    }
}
```

### Gestion des exceptions dans les tests

**Tester qu'une exception est lancee** :
```java
@Test
void testConstructWithNull() {
    assertThrows(IllegalArgumentException.class, () -> {
        new A(null);
    });
}
```

**Tester qu'une exception n'est PAS lancee (flux normal)** :
```java
@Test
void testNormalFlow() throws AnException {
    // If al() throws, the test fails automatically
    assertEquals(0, at.al(false));
}
```

**Erreur courante d'examen -- encapsuler dans try/catch au lieu d'utiliser assertThrows** :
```java
// INCORRECT (verbeux, source d'erreurs)
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

### Le bug de l'Exo9 : IndexOutOfBoundsException

Le cours inclut un bug delibere pour enseigner les limites d'indices :

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

Quand `i == taille`, `maListe.get(i)` lance un `IndexOutOfBoundsException`. La correction : remplacer `<=` par `<`.

---

## Patrons d'exceptions tires des examens

### Patron 1 : evaluation en court-circuit et exceptions

```java
// In A.al():
if (str == null || !value) {
    return 0;
}
return str.length() * b.getB1();    // b.getB1() may throw AnException
```

L'operateur `||` effectue un court-circuit : si `str == null` est vrai, `!value` n'est pas evalue. De meme, si `str != null` et `value == true`, alors `str.length()` est sur (pas de NPE) et `b.getB1()` est appele (peut lancer `AnException`).

### Patron 2 : types d'exceptions multiples

```java
public int al(final boolean value) throws SecurityException, NumberFormatException, AnException {
    ...
}
```

Une methode peut declarer plusieurs types d'exceptions. Dans les tests, vous devez verifier quelles exceptions sont effectivement atteignables.

### Patron 3 : exception depuis des objets mockes

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

## Pieges courants

1. **Attraper trop largement** : `catch (Exception e)` masque les erreurs specifiques. Attrapez le type d'exception le plus precis.
2. **Avaler silencieusement les exceptions** : un bloc `catch` vide cache les defaillances. Au minimum, tracez l'erreur dans les logs.
3. **Erreur de un (off-by-one) dans les boucles** : `i <= size` au lieu de `i < size` provoque un `IndexOutOfBoundsException` (comme dans l'Exo9).
4. **Ne pas tester les chemins d'exception** : atteindre 100% de couverture necessite de tester les chemins normaux et les chemins d'exception.
5. **Utiliser `fail()` au lieu de `assertThrows()`** : la maniere moderne avec JUnit 5 est `assertThrows()`, plus propre et moins sujette aux erreurs.

---

## AIDE-MEMOIRE

```
HIERARCHIE DES EXCEPTIONS
  Throwable > Exception > RuntimeException (non verifiee)
  Throwable > Exception > [personnalisee] (verifiee si etend directement Exception)
  Throwable > Error (ne pas attraper : OutOfMemoryError, StackOverflowError)

EXCEPTIONS VERIFIEES
  Doit declarer : throws ExType dans la signature de la methode
  Doit gerer : try/catch ou propager avec throws
  Exemples : IOException, exceptions personnalisees etendant Exception

EXCEPTIONS NON VERIFIEES (RuntimeException)
  Aucune declaration requise
  Exemples : NullPointerException, IllegalArgumentException,
            IndexOutOfBoundsException, ClassCastException

SYNTAXE
  throw new ExceptionType("message");     // lancer une exception
  throws ExType1, ExType2                 // declarer dans la signature

  try {
      riskyCode();
  } catch (SpecificException e) {
      handleIt();
  } finally {
      alwaysRuns();                        // code de nettoyage
  }

TESTER LES EXCEPTIONS (JUnit 5)
  assertThrows(ExType.class, () -> code());
  assertDoesNotThrow(() -> code());

EXCEPTION PERSONNALISEE
  public class MyException extends Exception {      // verifiee
      public MyException(String msg) { super(msg); }
  }
  public class MyRTException extends RuntimeException { // non verifiee
      ...
  }
```
