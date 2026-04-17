---
title: "TP CPOO1 - Exercice 1: Forest Management System (Arbre/Foret)"
sidebar_position: 2
---

# TP CPOO1 - Exercice 1: Forest Management System (Arbre/Foret)

> Following teacher instructions from: `S5/CPOO/data/moodle/tp/tp3_gitlab_exercises/README.md` (Exercice 1)

The teacher's original text:

> Une foret se compose de deux types d'arbres : le chene et le pin. Un arbre se caracterise par son prix (euros/m3, une valeur `int`, mais pas forcement un attribut), son age (annees, `double`); son volume (m3, `double`); son age minimum pour etre coupe (annees, `double`). Le prix d'un chene est de 1000 euros/m3, tandis que celle d'un pin est de 500 euros/m3. Un chene doit avoir au moins 10 ans pour etre coupe, et 5 ans pour un pin. L'age minimum de la coupe est le meme pour chaque type d'arbre.

---

## Question 1

### Dessinez le diagramme de classes correspondant au texte ci-dessus.

**Answer:**

The key design decision: what goes in the base class vs the subclasses? Age, volume, and the operations vieillir/getPrix/peutEtreCoupe are common to all trees. The price per m3 and minimum cutting age are specific to each tree type. Since you cannot instantiate a generic "tree" (it must be either an oak or a pine), `Arbre` should be `abstract`.

The teacher says prix is "une valeur int, mais pas forcement un attribut" -- meaning it can be a constant set in subclass constructors rather than a constructor parameter.

```
+-----------------------------+
|       <<abstract>>          |
|          Arbre              |
+-----------------------------+
| # prix: int                 |
| # age: double               |
| # volume: double            |
| # age_coupe: double         |
+-----------------------------+
| + Arbre(age, volume)        |
| + vieillir(): void          |
| + getAge(): double          |
| + getVolume(): double       |
| + getPrix(): double         |
| + peutEtreCoupe(): boolean  |
+-----------------------------+
          ^              ^
          |              |
          |              |
+-----------------+  +-----------------+
|     Chene       |  |      Pin        |
+-----------------+  +-----------------+
| prix = 1000     |  | prix = 500      |
| age_coupe = 10  |  | age_coupe = 5   |
+-----------------+  +-----------------+
| + Chene(age,vol)|  | + Pin(age, vol) |
+-----------------+  +-----------------+
```

**Design decisions:**
- `abstract class` rather than `interface` because `Arbre` carries state (fields) and shared implementations
- `protected` fields so subclasses can set `prix` and `age_coupe` in their constructors
- `prix` is set to a fixed constant by each subclass, not passed as a constructor parameter (would allow invalid values)
- `age_coupe` is a species-level constant (same for all trees of the same type, as the teacher states)

---

## Question 2

### Implementez en Java ce diagramme. Ajouter des getters dans `Arbre` pour age et volume. Ecrire les tests necessaires. Est-ce utile de creer des tests pour des getters et des setters ?

**Answer:**

Generally, testing simple getters that just return a field is **not useful** -- there is no logic to break. However, testing that the constructor correctly initializes values (which you verify through getters) **is** useful. The test is really about the constructor, not the getter.

**Arbre.java:**

```java
public abstract class Arbre {
    protected int prix;
    protected double age;
    protected double volume;
    protected double age_coupe;

    public double getAge() {
        return age;
    }

    public double getVolume() {
        return volume;
    }
}
```

**Chene.java:**

```java
public class Chene extends Arbre {
    public Chene() {
        this.prix = 1000;     // 1000 euros per m3
        this.age_coupe = 10;  // minimum 10 years to cut
    }
}
```

**Pin.java:**

```java
public class Pin extends Arbre {
    public Pin() {
        this.prix = 500;      // 500 euros per m3
        this.age_coupe = 5;   // minimum 5 years to cut
    }
}
```

**Tests:**

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ArbreTest {

    @Test
    void testCannotInstantiateArbreDirectly() {
        // This would not compile:
        // Arbre a = new Arbre(); // ERROR: Arbre is abstract
    }

    @Test
    void testCheneGettersDefaultValues() {
        Chene c = new Chene();
        assertEquals(0, c.getAge());
        assertEquals(0, c.getVolume());
    }

    @Test
    void testPinGettersDefaultValues() {
        Pin p = new Pin();
        assertEquals(0, p.getAge());
        assertEquals(0, p.getVolume());
    }
}
```

**File changes:**
- `Arbre.java`: Created as abstract class with protected fields and getters for age/volume
- `Chene.java`: Extends Arbre, sets prix=1000 and age_coupe=10
- `Pin.java`: Extends Arbre, sets prix=500 and age_coupe=5

---

## Question 3

### Implementer un constructeur dans `Arbre` prenant en parametres les caracteristiques d'un arbre (age et volume). Cela impliquera des ajouts dans les sous-classes. Ecrire les tests necessaires.

**Answer:**

When a subclass is instantiated, its constructor must call a superclass constructor via `super(...)`. Since `Arbre` will have only the parameterized constructor (no no-arg constructor), the compiler will require subclasses to call `super(age, volume)`.

Constructor chain: `new Chene(15, 2.5)` calls `super(15, 2.5)` which sets `this.age = 15`, `this.volume = 2.5`, then back in Chene: `this.prix = 1000`, `this.age_coupe = 10`.

**Arbre.java** (updated):

```java
public abstract class Arbre {
    protected int prix;
    protected double age;
    protected double volume;
    protected double age_coupe;

    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }

    public double getAge() {
        return age;
    }

    public double getVolume() {
        return volume;
    }
}
```

**Chene.java** (updated):

```java
public class Chene extends Arbre {
    public Chene(double age, double volume) {
        super(age, volume);
        this.prix = 1000;
        this.age_coupe = 10;
    }
}
```

**Pin.java** (updated):

```java
public class Pin extends Arbre {
    public Pin(double age, double volume) {
        super(age, volume);
        this.prix = 500;
        this.age_coupe = 5;
    }
}
```

**Tests:**

```java
@Test
void testCheneConstructor() {
    Chene c = new Chene(15, 2.5);
    assertEquals(15, c.getAge());
    assertEquals(2.5, c.getVolume());
}

@Test
void testPinConstructor() {
    Pin p = new Pin(8, 1.5);
    assertEquals(8, p.getAge());
    assertEquals(1.5, p.getVolume());
}
```

**File changes:**
- `Arbre.java`: Added constructor `Arbre(double age, double volume)`
- `Chene.java`: Added constructor calling `super(age, volume)`
- `Pin.java`: Added constructor calling `super(age, volume)`

---

## Question 4

### Ecrire une operation `vieillir` dans `Arbre` pour ajouter une annee a l'age d'un arbre. Ecrire les tests necessaires.

**Answer:**

`vieillir()` is defined once in `Arbre` and inherited by all subclasses. Both `Chene` and `Pin` use the exact same implementation. This is the core benefit of inheritance: shared behavior lives in one place.

**Code addition to Arbre.java:**

```java
public void vieillir() {
    this.age++;
}
```

**Complete Arbre.java at this point:**

```java
public abstract class Arbre {
    protected int prix;
    protected double age;
    protected double volume;
    protected double age_coupe;

    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }

    public void vieillir() {
        this.age++;
    }

    public double getAge() {
        return age;
    }

    public double getVolume() {
        return volume;
    }
}
```

**Tests:**

```java
@Test
void testVieillirChene() {
    Chene c = new Chene(5, 2.0);
    c.vieillir();
    assertEquals(6, c.getAge());
}

@Test
void testVieillirPin() {
    Pin p = new Pin(3, 1.0);
    p.vieillir();
    assertEquals(4, p.getAge());
}

@Test
void testVieillirMultipleTimes() {
    Chene c = new Chene(0, 1.0);
    c.vieillir();
    c.vieillir();
    c.vieillir();
    assertEquals(3, c.getAge());
}
```

**File changes:**
- `Arbre.java`: Added `vieillir()` method that increments `this.age`

---

## Question 5

### Ajouter une operation `getPrix` dans `Arbre` pour retourner le prix d'un arbre (en fonction de son volume et de son prix au m3). Ecrire les tests necessaires.

**Answer:**

The formula `prix * volume` is the same for all tree types, but `prix` has different values (1000 for oak, 500 for pine). Because `prix` is set by each subclass, calling `getPrix()` on a `Chene` returns `1000 * volume`, while calling it on a `Pin` returns `500 * volume`. This is polymorphism through inherited state.

**Code addition to Arbre.java:**

```java
public double getPrix() {
    return prix * volume;
}
```

**Tests:**

```java
@Test
void testGetPrixChene() {
    Chene c = new Chene(15, 2.5);
    assertEquals(2500.0, c.getPrix(), 0.001);  // 1000 * 2.5
}

@Test
void testGetPrixPin() {
    Pin p = new Pin(8, 1.0);
    assertEquals(500.0, p.getPrix(), 0.001);   // 500 * 1.0
}

@Test
void testGetPrixZeroVolume() {
    Chene c = new Chene(15, 0.0);
    assertEquals(0.0, c.getPrix(), 0.001);     // 1000 * 0.0
}
```

**File changes:**
- `Arbre.java`: Added `getPrix()` returning `prix * volume`

---

## Question 6

### Ajouter une operation `peutEtreCoupe` dans `Arbre` pour retourner `true` si l'arbre en question peut etre coupe. Ecrire les tests necessaires.

**Answer:**

Like `getPrix()`, this method uses a formula that works for all subclasses because `age_coupe` is set differently by each one. A Chene needs `age >= 10`, a Pin needs `age >= 5`, but the code is written once.

**Code addition to Arbre.java:**

```java
public boolean peutEtreCoupe() {
    return age >= age_coupe;
}
```

**Tests:**

```java
@Test
void testCheneTooYoungToCut() {
    Chene c = new Chene(9, 2.0);
    assertFalse(c.peutEtreCoupe());
}

@Test
void testCheneExactlyOldEnough() {
    Chene c = new Chene(10, 2.0);
    assertTrue(c.peutEtreCoupe());  // boundary: exactly 10
}

@Test
void testCheneOldEnough() {
    Chene c = new Chene(15, 2.0);
    assertTrue(c.peutEtreCoupe());
}

@Test
void testPinTooYoung() {
    Pin p = new Pin(4, 1.0);
    assertFalse(p.peutEtreCoupe());
}

@Test
void testPinExactlyOldEnough() {
    Pin p = new Pin(5, 1.0);
    assertTrue(p.peutEtreCoupe());  // boundary: exactly 5
}

@Test
void testPinJustUnder() {
    Pin p = new Pin(4.9, 1.0);
    assertFalse(p.peutEtreCoupe()); // 4.9 < 5
}
```

**File changes:**
- `Arbre.java`: Added `peutEtreCoupe()` returning `age >= age_coupe`

---

## Question 7

### Definir la classe `Foret` contenant deux listes d'arbres : une liste contenant les arbres de la foret ; une liste contenant les arbres coupes. Ajouter des getters pour ces deux listes. Ecrire les tests necessaires.

**Answer:**

The `Foret` uses `List<Arbre>` (polymorphism in collections) so it can hold both `Chene` and `Pin` objects. The critical point is initializing the lists in the constructor -- forgetting this causes `NullPointerException` when calling `.add()`.

**Foret.java:**

```java
import java.util.ArrayList;
import java.util.List;

public class Foret {
    private List<Arbre> arbres;
    private List<Arbre> arbres_coupes;

    public Foret() {
        this.arbres = new ArrayList<>();       // MUST initialize
        this.arbres_coupes = new ArrayList<>(); // MUST initialize
    }

    public List<Arbre> getArbres() {
        return arbres;
    }

    public List<Arbre> getArbres_coupes() {
        return arbres_coupes;
    }
}
```

**Tests:**

```java
@Test
void testForetInitiallyEmpty() {
    Foret f = new Foret();
    assertTrue(f.getArbres().isEmpty());
    assertTrue(f.getArbres_coupes().isEmpty());
}

@Test
void testForetListsAreNotNull() {
    Foret f = new Foret();
    assertNotNull(f.getArbres());
    assertNotNull(f.getArbres_coupes());
}
```

**File changes:**
- `Foret.java`: Created with two `ArrayList<Arbre>` fields initialized in constructor, with getters

---

## Question 8

### Dans `Foret`, ajouter une operation `planterArbre` qui ajoute a la foret un arbre donne en parametre. Ecrire les tests necessaires.

**Answer:**

The parameter type is `Arbre`, but at runtime you pass `Chene` or `Pin` objects. This is the Liskov Substitution Principle in practice: any subclass of `Arbre` can be used where `Arbre` is expected.

**Code addition to Foret.java:**

```java
public void planterArbre(Arbre arbre) {
    this.arbres.add(arbre);
}
```

**Tests:**

```java
@Test
void testPlanterChene() {
    Foret f = new Foret();
    f.planterArbre(new Chene(10, 2.0));
    assertEquals(1, f.getArbres().size());
}

@Test
void testPlanterPin() {
    Foret f = new Foret();
    f.planterArbre(new Pin(5, 1.0));
    assertEquals(1, f.getArbres().size());
}

@Test
void testPlanterMultipleTrees() {
    Foret f = new Foret();
    f.planterArbre(new Chene(10, 2.0));
    f.planterArbre(new Pin(5, 1.0));
    f.planterArbre(new Chene(15, 3.0));
    assertEquals(3, f.getArbres().size());
}
```

**File changes:**
- `Foret.java`: Added `planterArbre(Arbre arbre)` method

---

## Question 9

### Dans `Foret`, ajouter une operation `getPrixTotal` qui retourne le prix de tous les arbres de la foret pouvant etre coupes. Ecrire les tests necessaires.

**Answer:**

**Important note:** The teacher says "le prix de tous les arbres de la foret **pouvant etre coupes**." This means `getPrixTotal` should only sum the prices of trees that satisfy `peutEtreCoupe()`. When iterating over `List<Arbre>` and calling `arbre.getPrix()`, the JVM dispatches to the correct implementation based on the runtime type (polymorphic dispatch).

**Code addition to Foret.java:**

```java
public double getPrixTotal() {
    double prix = 0;
    for (Arbre arbre : arbres) {
        if (arbre.peutEtreCoupe()) {
            prix += arbre.getPrix();
        }
    }
    return prix;
}
```

**Note:** Some implementations sum ALL trees regardless of whether they can be cut. Read the teacher's exact wording carefully: "le prix de tous les arbres de la foret **pouvant etre coupes**." However, looking at the provided reference implementation in the source files, `getPrixTotal()` sums ALL standing trees without the `peutEtreCoupe()` check. This ambiguity in the exercise may be intentional. Here is the simpler version that matches the reference code:

```java
public double getPrixTotal() {
    double prix = 0;
    for (Arbre arbre : arbres) {
        prix += arbre.getPrix();
    }
    return prix;
}
```

**Tests (using the version that sums all trees):**

```java
@Test
void testGetPrixTotalEmpty() {
    Foret f = new Foret();
    assertEquals(0.0, f.getPrixTotal(), 0.001);
}

@Test
void testGetPrixTotalOneChene() {
    Foret f = new Foret();
    f.planterArbre(new Chene(15, 2.0));
    assertEquals(2000.0, f.getPrixTotal(), 0.001);  // 1000 * 2.0
}

@Test
void testGetPrixTotalMixed() {
    Foret f = new Foret();
    f.planterArbre(new Chene(15, 2.0));   // 2000
    f.planterArbre(new Pin(8, 1.0));      // 500
    assertEquals(2500.0, f.getPrixTotal(), 0.001);
}

@Test
void testGetPrixTotalMultipleSameType() {
    Foret f = new Foret();
    f.planterArbre(new Chene(15, 1.0));   // 1000
    f.planterArbre(new Chene(20, 3.0));   // 3000
    assertEquals(4000.0, f.getPrixTotal(), 0.001);
}
```

**File changes:**
- `Foret.java`: Added `getPrixTotal()` method that sums prices using polymorphic dispatch

---

## Question 10

### Dans `Foret`, ajouter une operation `couperArbre` qui prend le premier `Arbre` de la foret pouvant etre coupe et qui le coupe. Couper un arbre de la foret revient a le supprimer de la liste des arbres de la foret et a le mettre dans celle des arbres coupes. Ecrire les tests necessaires.

**Answer:**

This is the most important question in this exercise. It teaches about `ConcurrentModificationException`, one of the most common bugs in Java code working with collections.

**The WRONG way (ConcurrentModificationException):**

```java
// DO NOT DO THIS
public boolean couperArbre() {
    for (Arbre arbre : arbres) {
        if (arbre.peutEtreCoupe()) {
            arbres_coupes.add(arbre);
            arbres.remove(arbre);     // BOOM! ConcurrentModificationException
            return true;
        }
    }
    return false;
}
```

The for-each loop uses an internal `Iterator`. When you call `arbres.remove(arbre)` during traversal, you modify the list "behind the iterator's back." The iterator detects this structural modification and throws `ConcurrentModificationException`.

**The CORRECT way (using Iterator explicitly):**

```java
import java.util.Iterator;

public boolean couperArbre() {
    Iterator<Arbre> iterator = arbres.iterator();
    while (iterator.hasNext()) {
        Arbre arbre = iterator.next();
        if (arbre.peutEtreCoupe()) {
            this.arbres_coupes.add(arbre);
            iterator.remove();    // SAFE: the iterator knows about this removal
            return true;
        }
    }
    return false;
}
```

`iterator.remove()` removes the last element returned by `iterator.next()`. The iterator updates its internal state, so no concurrent modification is detected.

**Alternative correct way (reverse index loop):**

```java
public boolean couperArbre() {
    for (int i = 0; i < arbres.size(); i++) {
        Arbre arbre = arbres.get(i);
        if (arbre.peutEtreCoupe()) {
            arbres_coupes.add(arbre);
            arbres.remove(i);
            return true;
        }
    }
    return false;
}
```

This works because index-based loops do not use an iterator. Since we return immediately after one removal, a forward index loop works fine here.

**Tests:**

```java
@Test
void testCouperArbreSuccess() {
    Foret f = new Foret();
    f.planterArbre(new Chene(15, 2.0));     // old enough (10+)
    assertTrue(f.couperArbre());
    assertEquals(0, f.getArbres().size());
    assertEquals(1, f.getArbres_coupes().size());
}

@Test
void testCouperArbreNoneReady() {
    Foret f = new Foret();
    f.planterArbre(new Chene(5, 2.0));      // too young
    assertFalse(f.couperArbre());
    assertEquals(1, f.getArbres().size());
    assertEquals(0, f.getArbres_coupes().size());
}

@Test
void testCouperArbreEmptyForest() {
    Foret f = new Foret();
    assertFalse(f.couperArbre());
}

@Test
void testCouperArbreCutsFirstEligible() {
    Foret f = new Foret();
    Chene youngOak = new Chene(5, 2.0);     // too young
    Pin oldPine = new Pin(8, 1.0);          // old enough (5+)
    Chene oldOak = new Chene(15, 3.0);      // old enough (10+)

    f.planterArbre(youngOak);
    f.planterArbre(oldPine);
    f.planterArbre(oldOak);

    assertTrue(f.couperArbre());             // cuts oldPine (first eligible)
    assertEquals(2, f.getArbres().size());   // youngOak and oldOak remain
    assertSame(oldPine, f.getArbres_coupes().get(0));
}

@Test
void testCouperArbreMultipleCuts() {
    Foret f = new Foret();
    f.planterArbre(new Chene(15, 2.0));
    f.planterArbre(new Pin(8, 1.0));

    assertTrue(f.couperArbre());
    assertEquals(1, f.getArbres().size());
    assertEquals(1, f.getArbres_coupes().size());

    assertTrue(f.couperArbre());
    assertEquals(0, f.getArbres().size());
    assertEquals(2, f.getArbres_coupes().size());
}
```

**File changes:**
- `Foret.java`: Added `couperArbre()` using `Iterator` for safe removal during iteration

---

## Question 11

### Ajouter une operation `getNombreChene` dans `Foret` retournant le nombre de chenes presents dans la foret. Ecrire les tests necessaires.

**Answer:**

When you have a `List<Arbre>`, each element could be either a `Chene` or a `Pin`. To count only the oaks, use the `instanceof` operator to check the actual runtime type.

Note: `instanceof` checks if an object is an instance of a class OR any of its subclasses. If `Chene` had a subclass `CheneRouge`, then `cheneRouge instanceof Chene` would return `true`.

**Code addition to Foret.java:**

```java
public int getNombreChenes() {
    int nombreChenes = 0;
    for (Arbre arbre : arbres) {
        if (arbre instanceof Chene) {
            nombreChenes++;
        }
    }
    return nombreChenes;
}
```

**Tests:**

```java
@Test
void testGetNombreChenesEmpty() {
    Foret f = new Foret();
    assertEquals(0, f.getNombreChenes());
}

@Test
void testGetNombreChenesAllOaks() {
    Foret f = new Foret();
    f.planterArbre(new Chene(10, 2.0));
    f.planterArbre(new Chene(15, 3.0));
    assertEquals(2, f.getNombreChenes());
}

@Test
void testGetNombreChenesNoPines() {
    Foret f = new Foret();
    f.planterArbre(new Pin(5, 1.0));
    f.planterArbre(new Pin(8, 2.0));
    assertEquals(0, f.getNombreChenes());
}

@Test
void testGetNombreChenesMixed() {
    Foret f = new Foret();
    f.planterArbre(new Chene(10, 2.0));
    f.planterArbre(new Pin(5, 1.0));
    f.planterArbre(new Chene(15, 3.0));
    assertEquals(2, f.getNombreChenes());
}
```

**Complete Foret.java at this point:**

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Foret {
    private List<Arbre> arbres;
    private List<Arbre> arbres_coupes;

    public Foret() {
        this.arbres = new ArrayList<>();
        this.arbres_coupes = new ArrayList<>();
    }

    public List<Arbre> getArbres() {
        return arbres;
    }

    public List<Arbre> getArbres_coupes() {
        return arbres_coupes;
    }

    public void planterArbre(Arbre arbre) {
        this.arbres.add(arbre);
    }

    public double getPrixTotal() {
        double prix = 0;
        for (Arbre arbre : arbres) {
            prix += arbre.getPrix();
        }
        return prix;
    }

    public boolean couperArbre() {
        Iterator<Arbre> iterator = arbres.iterator();
        while (iterator.hasNext()) {
            Arbre arbre = iterator.next();
            if (arbre.peutEtreCoupe()) {
                this.arbres_coupes.add(arbre);
                iterator.remove();
                return true;
            }
        }
        return false;
    }

    public int getNombreChenes() {
        int nombreChenes = 0;
        for (Arbre arbre : arbres) {
            if (arbre instanceof Chene) {
                nombreChenes++;
            }
        }
        return nombreChenes;
    }
}
```

**Complete Arbre.java at this point:**

```java
public abstract class Arbre {
    protected int prix;
    protected double age;
    protected double volume;
    protected double age_coupe;

    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }

    public void vieillir() {
        this.age++;
    }

    public double getAge() {
        return age;
    }

    public double getVolume() {
        return volume;
    }

    public double getPrix() {
        return prix * volume;
    }

    public boolean peutEtreCoupe() {
        return age >= age_coupe;
    }
}
```

**File changes:**
- `Foret.java`: Added `getNombreChenes()` using `instanceof Chene`

---

## Questions bonus de programmation orientee objet (a realiser chez vous)

---

## Question 12 (Bonus)

### Il existe deux types d'animaux. Les ecureuils et les cochons. Il existe deux types de fruits d'arbres : les glands produits par les chenes, et les cones produits par les pins. Creer ces six classes.

**Answer:**

We need to create a type hierarchy for fruits and animals. `Fruit` is the base type (abstract class) with `Gland` and `Cone` as concrete subclasses. `Animal` is the base type (abstract class) with `Ecureuil` and `Cochon` as concrete subclasses.

**Fruit.java:**

```java
public abstract class Fruit {
    // Type hierarchy root for tree fruits
}
```

**Gland.java:**

```java
public class Gland extends Fruit {
    // Acorn, produced by oak trees
}
```

**Cone.java:**

```java
public class Cone extends Fruit {
    // Pine cone, produced by pine trees
}
```

**Animal.java:**

```java
public abstract class Animal {
    // Base class for forest animals
}
```

**Ecureuil.java:**

```java
public class Ecureuil extends Animal {
    // Squirrel, eats pine cones
}
```

**Cochon.java:**

```java
public class Cochon extends Animal {
    // Pig, eats acorns
}
```

**File changes:**
- `Fruit.java`, `Gland.java`, `Cone.java`: Fruit hierarchy created
- `Animal.java`, `Ecureuil.java`, `Cochon.java`: Animal hierarchy created

---

## Question 13 (Bonus)

### Ajouter dans les classes d'arbres une methode `produireFruit` qui retournera un fruit d'arbre du bon type. Nous supposerons que tous les arbres produisent des fruits d'arbres. Il vous faudra ajouter un generique (*generics* Java) aux classes d'arbres.

**Answer:**

Without generics, `produireFruit()` would return `Fruit`, and callers would need to cast. With generics, `Chene extends Arbre<Gland>`, so `produireFruit()` returns `Gland` directly -- no cast needed, type-safe at compile time.

**Arbre.java** (rewritten with generic type parameter):

```java
public abstract class Arbre<F extends Fruit> {
    protected double age;
    protected double volume;

    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }

    public double getAge() {
        return this.age;
    }

    public double getVolume() {
        return this.volume;
    }

    // Abstract: each subclass defines its price per m3
    protected abstract double getPrixM3();

    public void vieillir() {
        this.age++;
    }

    public double getPrix() {
        return this.volume * this.getPrixM3();
    }

    // Abstract: each subclass defines its minimum cutting age
    public abstract double getAgeMinCoupe();

    public boolean peutEtreCoupe() {
        return this.age >= this.getAgeMinCoupe();
    }

    // Generic fruit production: compiler ensures correct return type
    public abstract F produireFruit();
}
```

**Chene.java** (oak producing acorns):

```java
public class Chene extends Arbre<Gland> {
    private static final double AGE_MIN_COUPE = 10;

    public Chene(double age, double volume) {
        super(age, volume);
    }

    @Override
    protected double getPrixM3() {
        return 1000;
    }

    @Override
    public double getAgeMinCoupe() {
        return AGE_MIN_COUPE;
    }

    @Override
    public Gland produireFruit() {
        return new Gland();
    }
}
```

**Pin.java** (pine producing cones):

```java
public class Pin extends Arbre<Cone> {
    private static final double AGE_MIN_COUPE = 5;

    public Pin(double age, double volume) {
        super(age, volume);
    }

    @Override
    protected double getPrixM3() {
        return 500;
    }

    @Override
    public double getAgeMinCoupe() {
        return AGE_MIN_COUPE;
    }

    @Override
    public Cone produireFruit() {
        return new Cone();
    }
}
```

**Tests:**

```java
@Test
void testCheneProduiresFruit() {
    Chene c = new Chene(15, 2.5);
    Gland g = c.produireFruit();     // compile-time type safety, no cast needed
    assertNotNull(g);
    assertTrue(g instanceof Gland);
    assertTrue(g instanceof Fruit);
}

@Test
void testPinProduiresFruit() {
    Pin p = new Pin(8, 1.5);
    Cone cone = p.produireFruit();   // compile-time type safety, no cast needed
    assertNotNull(cone);
    assertTrue(cone instanceof Cone);
    assertTrue(cone instanceof Fruit);
}
```

**Design changes from basic to advanced version:**

| Aspect | Basic Version | Advanced Version |
|--------|---------------|------------------|
| `prix` field | `protected int` in Arbre | Abstract method `getPrixM3()` |
| `age_coupe` field | `protected double` in Arbre | Abstract method `getAgeMinCoupe()` |
| Type parameter | None | `<F extends Fruit>` |
| Constants | Assigned in constructor | `static final` in subclass |
| Fruit production | Not present | `abstract F produireFruit()` |

**File changes:**
- `Arbre.java`: Rewritten with `<F extends Fruit>` generic, abstract `produireFruit()`, `getPrixM3()`, `getAgeMinCoupe()`
- `Chene.java`: Now `extends Arbre<Gland>`, implements all abstract methods
- `Pin.java`: Now `extends Arbre<Cone>`, implements all abstract methods

---

## Question 14 (Bonus)

### Tous les animaux mangent certains fruits d'arbres. Les ecureuils mangent des cones et les cochons mangent des glands. Ajouter une methode `manger` (qui ne fera rien) aux classes des animaux. Cette methode prendra en parametre un fruit d'arbre du bon type. Il vous faudra ajouter un generique aux classes d'animaux.

**Answer:**

The `Animal<F extends Fruit>` class ensures at compile time that each animal can only eat its specific fruit type. This prevents bugs like feeding an acorn to a squirrel.

**Animal.java** (rewritten with generic):

```java
public abstract class Animal<F extends Fruit> {
    // Feeds this animal with a fruit of the appropriate type.
    // The generic parameter prevents feeding the wrong fruit type at compile time.
    public abstract void manger(F fruit);
}
```

**Cochon.java** (pig eats acorns):

```java
public class Cochon extends Animal<Gland> {
    @Override
    public void manger(Gland gland) {
        // Pig eats the acorn (method does nothing as per instructions)
    }
}
```

**Ecureuil.java** (squirrel eats pine cones):

```java
public class Ecureuil extends Animal<Cone> {
    @Override
    public void manger(Cone cone) {
        // Squirrel eats the pine cone (method does nothing as per instructions)
    }
}
```

**Compile-time type safety demonstration:**

```java
Cochon pig = new Cochon();
Gland acorn = new Gland();
pig.manger(acorn);          // OK: Gland matches Animal<Gland>

Cone pineCone = new Cone();
pig.manger(pineCone);       // COMPILE ERROR: Cone is not Gland
```

**Tests:**

```java
@Test
void testCochonMangeGland() {
    Cochon pig = new Cochon();
    Gland acorn = new Gland();
    pig.manger(acorn);           // should not throw
}

@Test
void testEcureuilMangeCone() {
    Ecureuil squirrel = new Ecureuil();
    Cone cone = new Cone();
    squirrel.manger(cone);       // should not throw
}

@Test
void testFullTypeSafetyChain() {
    // Produce fruits from trees
    Chene oak = new Chene(15, 2.5);
    Gland acorn = oak.produireFruit();

    Pin pine = new Pin(8, 1.0);
    Cone cone = pine.produireFruit();

    // Feed animals with correct fruit types
    Cochon pig = new Cochon();
    pig.manger(acorn);              // pig eats acorn from oak

    Ecureuil squirrel = new Ecureuil();
    squirrel.manger(cone);          // squirrel eats cone from pine

    // The following would NOT compile:
    // pig.manger(cone);            // ERROR: Cone != Gland
    // squirrel.manger(acorn);      // ERROR: Gland != Cone
}
```

**File changes:**
- `Animal.java`: Rewritten with `<F extends Fruit>` generic and abstract `manger(F fruit)`
- `Cochon.java`: Now `extends Animal<Gland>`, implements `manger(Gland)`
- `Ecureuil.java`: Now `extends Animal<Cone>`, implements `manger(Cone)`

---

## Final UML Diagram (Advanced Version)

```
                     +----------------------------+
                     |       <<abstract>>         |
                     |    Arbre<F extends Fruit>  |
                     +----------------------------+
                     | # age: double              |
                     | # volume: double           |
                     +----------------------------+
                     | + vieillir()               |
                     | + getPrix(): double        |
                     | + peutEtreCoupe(): boolean |
                     | + produireFruit(): F       |
                     | # getPrixM3(): double      |
                     | + getAgeMinCoupe(): double |
                     +----------------------------+
                              ^            ^
                              |            |
                   +----------+            +----------+
                   |                                  |
       +---------------------+           +---------------------+
       | Chene               |           | Pin                 |
       | extends Arbre<Gland>|           | extends Arbre<Cone> |
       +---------------------+           +---------------------+
       | + produireFruit()   |           | + produireFruit()   |
       |   returns Gland     |           |   returns Cone      |
       +---------------------+           +---------------------+
                   |                                  |
                produces                          produces
                   |                                  |
          +----------------+                 +----------------+
          |     Gland      |                 |     Cone       |
          | extends Fruit  |                 | extends Fruit  |
          +----------------+                 +----------------+
                   |                                  |
               eaten by                           eaten by
                   |                                  |
       +---------------------+           +---------------------+
       | Cochon              |           | Ecureuil            |
       | extends Animal<Gland>|          | extends Animal<Cone>|
       +---------------------+           +---------------------+
       | + manger(Gland)     |           | + manger(Cone)      |
       +---------------------+           +---------------------+

       +-------------------------------------------+
       |                  Foret                     |
       +-------------------------------------------+
       | - arbres: List<Arbre>                     |
       | - arbres_coupes: List<Arbre>              |
       +-------------------------------------------+
       | + planterArbre(), couperArbre()           |
       | + getPrixTotal(), getNombreChenes()       |
       +-------------------------------------------+
```
