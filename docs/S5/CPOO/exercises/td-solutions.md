---
title: "Solutions TD - Tutoriels (MyPoint, Line, UML)"
sidebar_position: 1
---

# Solutions TD - Tutoriels (MyPoint, Line, UML)

> D'apres les instructions de l'enseignant dans : `S5/CPOO/data/moodle/tp/tp3_gitlab_exercises/` (exemples du cours)

Ces exercices de TD couvrent les fondamentaux des tests unitaires, le mocking et l'interpretation des diagrammes UML. Ils servent de preparation aux exercices de TP.

---

## TD : Tests de Line (cours)

### Code a tester

La classe `Line` represente une droite 2D definie par deux points. Elle calcule la pente (a) et l'ordonnee a l'origine (b) de l'equation `y = ax + b`.

**Line.java** (`cpoo1/cours/`) :

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

**TranslationVector.java :**

```java
package cpoo1.cours;

public interface TranslationVector {
    int getTx();
    int getTy();
}
```

### Test existant (fourni par l'enseignant)

**LineTest.java :**

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
        // pente = (2-4)/(1-3) = -2/-2 = 1
        assertEquals(1, line.getA(), 0.001);
    }

    @Test
    void testB() {
        // b = y1 - a*x1 = 2 - 1*1 = 1
        assertEquals(1, line.getB(), 0.001);
    }
}
```

### Solution de test complete

Les tests existants ne couvrent que le cas normal (droite non verticale). Pour une couverture complete, il faut tester les droites verticales, horizontales et les cas limites.

```java
package cpoo1.cours;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class LineTestComplete {

    @Test
    void testNonVerticalSlope() {
        Line line = new Line(1, 2, 3, 4);
        // pente = (2-4)/(1-3) = -2/-2 = 1
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
        assertEquals(0, line.getA(), 0.001);  // pente = 0
        assertEquals(5, line.getB(), 0.001);  // ordonnee a l'origine = 5
    }

    @Test
    void testNonVerticalLine() {
        Line line = new Line(1, 2, 3, 4);
        assertFalse(line.isVertical());
    }

    @Test
    void testNegativeSlope() {
        Line line = new Line(0, 10, 5, 0);
        // pente = (10-0)/(0-5) = 10/-5 = -2
        assertEquals(-2, line.getA(), 0.001);
        // b = y1 - a*x1 = 10 - (-2)*0 = 10
        assertEquals(10, line.getB(), 0.001);
    }

    @Test
    void testAlmostVerticalLine() {
        // Deux valeurs de x dans la tolerance de 0.000001
        Line line = new Line(5, 1, 5.0000001, 10);
        assertTrue(line.isVertical());
    }
}
```

---

## TD : Tests de MyPoint

### Code a tester (structure supposee)

`MyPoint` est une classe de point 2D basique utilisee pour enseigner les tests unitaires, le mocking et la conception basee sur les interfaces.

### Solutions des tests

#### Getters et setters

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

#### Constructeurs

```java
// Constructeur par defaut : (0, 0)
@Test
void testDefaultConstructor() {
    MyPoint mp = new MyPoint();
    assertEquals(0, mp.getX(), 1e-6);
    assertEquals(0, mp.getY(), 1e-6);
}

// Constructeur parametre
@Test
void testParameterizedConstructor() {
    MyPoint mp = new MyPoint(192.168, 42.1);
    assertEquals(192.168, mp.getX(), 1e-6);
    assertEquals(42.1, mp.getY(), 1e-6);
}

// Constructeur de copie
@Test
void testCopyConstructor() {
    MyPoint original = new MyPoint(192.168, 42.1);
    MyPoint copy = new MyPoint(original);
    assertEquals(192.168, copy.getX(), 1e-6);
    assertEquals(42.1, copy.getY(), 1e-6);
}
```

#### Scale (mise a l'echelle)

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

Note : `scale` retourne un NOUVEAU point (immutabilite) -- l'original n'est pas modifie.

#### Symetrie horizontale

```java
@Test
void testHorizontalSymmetry() {
    MyPoint mp = new MyPoint(128.0, 17.0);
    MyPoint result = mp.horizontalSymmetry(new MyPoint(100.0, 100.0));
    assertEquals(72.0, result.getX(), 1e-6);   // 2 * 100 - 128 = 72
    assertEquals(17.0, result.getY(), 1e-6);   // Y inchange
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

Note : `translate` modifie le point sur place (mutation), contrairement a `scale` qui retourne un nouveau point.

#### Mocker Random

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

Point cle : `Random.nextInt()` est non-deterministe par nature. Le mocking rend les tests deterministes.

#### Mocker l'interface ITranslation

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

Point cle : le cast `(ITranslation) null` est necessaire pour lever l'ambiguite entre les deux surcharges de `translate` (`translate(double, double)` vs `translate(ITranslation)`).

---

## TD UML -- Exercices cles sur les diagrammes

### Approche pour les exercices de diagramme de classes UML

Les exercices de TD UML vous demandent de convertir des descriptions textuelles en diagrammes de classes. L'approche systematique est :

1. **Identifier les noms** -- ils deviennent des classes ou des attributs
2. **Identifier les verbes** -- ils deviennent des methodes ou des associations
3. **Identifier les relations** :
   - "est un" = heritage (`extends`)
   - "possede" = association/composition
   - "utilise" = dependance
4. **Determiner la multiplicite** :
   - "un" = `1`
   - "zero ou un" = `0..1`
   - "zero ou plusieurs" = `0..*`
   - "au moins un" = `1..*`
5. **Identifier les contraintes** -- "doit", "ne peut pas", "au plus"

### Approche pas a pas pour les questions UML d'examen

1. Lire le texte deux fois -- souligner les noms (classes) et les verbes (methodes)
2. Dessiner d'abord les classes (boites avec noms et attributs)
3. Ajouter les relations (lignes avec fleches, losanges, triangles)
4. Ajouter la multiplicite a chaque extremite de relation
5. Marquer les classes abstraites et les interfaces
6. Ajouter les methodes la ou le texte specifie un comportement
7. Relecture : chaque nom du texte apparait-il dans le diagramme ?

### Resume de la notation UML

| Symbole | Signification |
|---------|---------------|
| Fleche pleine (`-->`) | Association unidirectionnelle |
| Ligne avec fleches aux deux bouts (`<-->`) | Association bidirectionnelle |
| Losange plein (`<>---`) | Composition (possession forte) |
| Losange creux (`<>---`) | Agregation (possession faible) |
| Triangle creux (`--triangleup>`) | Heritage (`extends`) |
| Fleche en pointilles (`-->`) | Dependance / Implementation (`implements`) |
| Prefixe `+` | Visibilite publique |
| Prefixe `-` | Visibilite privee |
| Prefixe `#` | Visibilite protegee |
| *italique* | Classe/methode abstraite |

### Relations courantes en CPOO

**Heritage** (Arbre/Chene/Pin de l'Exercice 1) :
```
Arbre <|-- Chene
Arbre <|-- Pin
```

**Composition** (Velo/Roue du TP1 Q5) :
```
Velo *-- Roue : 0..*
```

**Association** (Velo/Guidon du TP1 Q1) :
```
Velo -- Guidon : 0..1
```

**Generique/Parametre** (Arbre<F> de l'Exercice 1 bonus) :
```
Arbre<F extends Fruit> <|-- Chene (extends Arbre<Gland>)
```
