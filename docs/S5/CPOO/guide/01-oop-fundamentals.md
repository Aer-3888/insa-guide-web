---
title: "Fondamentaux de la POO"
sidebar_position: 1
---

# Fondamentaux de la POO

## Theorie

### Qu'est-ce que la programmation orientee objet ?

La POO organise le logiciel autour d'**objets** -- des ensembles de donnees (attributs) et de comportements (methodes) -- plutot qu'autour de fonctions et de logique. Les quatre piliers sont : l'encapsulation, l'abstraction, l'heritage et le polymorphisme.

### Classes et objets

Une **classe** est un plan de construction ; un **objet** (instance) est une realisation concrete de ce plan.

```java
// Definition de classe (plan de construction)
public class Velo {
    private Guidon guidon = null;   // attribute (field)

    public Guidon getGuidon() {     // method (behavior)
        return this.guidon;
    }

    public void setGuidon(Guidon gd) {
        this.guidon = gd;
    }
}

// Creation d'un objet (instance)
Velo monVelo = new Velo();
```

### Le mot-cle `this`

`this` fait reference a l'instance courante de l'objet. Il permet de lever l'ambiguite entre les noms de champs et les noms de parametres, et de passer l'objet courant a d'autres methodes.

```java
public void setGuidon(Guidon guidon) {
    this.guidon = guidon;          // this.guidon = field, guidon = parameter
}
```

### Constructeurs

Les constructeurs initialisent les objets. Si vous n'ecrivez aucun constructeur, Java fournit un constructeur par defaut sans argument. Des que vous ecrivez un constructeur, le constructeur par defaut disparait.

```java
public class Arbre {
    protected double age;
    protected double volume;

    // Parameterized constructor
    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }
}

// Subclass must call super()
public class Chene extends Arbre {
    public Chene(double age, double volume) {
        super(age, volume);       // MUST be first statement
        this.prix = 1000;
    }
}
```

**Chainage de constructeurs** avec `this()` :

```java
public class MyPoint {
    private double x;
    private double y;

    public MyPoint() {
        this(0, 0);               // calls the two-arg constructor
    }

    public MyPoint(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public MyPoint(MyPoint pt) {
        this(pt.x, pt.y);        // copy constructor
    }
}
```

### Encapsulation

L'encapsulation regroupe les donnees et les methodes qui les manipulent, et restreint l'acces direct a l'etat interne.

| Modificateur | Classe | Package | Sous-classe | Partout |
|--------------|--------|---------|-------------|---------|
| `private` | Oui | Non | Non | Non |
| (defaut) | Oui | Oui | Non | Non |
| `protected` | Oui | Oui | Oui | Non |
| `public` | Oui | Oui | Oui | Oui |

**Bonne pratique** : les champs sont `private`, accessibles via des getters/setters `public`. Les champs internes partages avec les sous-classes utilisent `protected`.

```java
public abstract class Arbre {
    protected int prix;              // accessible to Chene, Pin
    protected double age;
    protected double volume;
    protected double age_coupe;

    public double getAge() {         // public getter
        return age;
    }
}
```

### Associations (UML vers Java)

Les associations representent des relations "utilise" ou "possede" entre les classes.

**Association unidirectionnelle 0..1** :
```java
// Velo --guidon--> Guidon (0..1)
public class Velo {
    private Guidon guidon = null;    // null means no guidon

    public Guidon getGuidon() { return this.guidon; }
    public void setGuidon(Guidon gd) { this.guidon = gd; }
}
```

**Association bidirectionnelle 0..1 avec integrite referentielle** :
```java
// In Velo.java
public void setGuidon(Guidon gd) {
    if (gd != this.guidon) {         // avoid infinite recursion
        Guidon oldGuidon = this.guidon;
        if (gd == null && oldGuidon != null) {
            oldGuidon.setVelo(null); // clean up old link
        }
        this.guidon = gd;
        if (gd != null) {
            gd.setVelo(this);        // establish bidirectional link
        }
    }
}
```

**Association un-vers-plusieurs (0..\*)** :
```java
public class Velo {
    private List<Roue> roues;

    public Velo() {
        this.roues = new ArrayList<>();  // ALWAYS initialize in constructor
    }

    public Boolean addRoue(Roue r) {
        if (r == null || this.roues.contains(r)) {
            return false;                // reject null or duplicates
        }
        return this.roues.add(r);
    }

    public Boolean removeRoues(Roue r) {
        return this.roues.remove(r);
    }
}
```

**Composition avec navigation bidirectionnelle** :
```java
// In Velo.java -- the "whole"
public Boolean addRoue(Roue r) {
    if (r == null || this.roues.contains(r)) return false;
    this.roues.add(r);
    if (r.getVelo() != this) {
        r.setVelo(this);             // maintain referential integrity
    }
    return true;
}

// In Roue.java -- the "part"
public void setVelo(Velo vl) {
    if (this.velo == vl) return;     // avoid recursion
    if (this.velo != null) {
        Velo oldVelo = this.velo;
        this.velo = null;            // break old link first
        oldVelo.removeRoues(this);
    }
    this.velo = vl;
    if (vl != null && !vl.getRoues().contains(this)) {
        vl.addRoue(this);
    }
}
```

### Le mot-cle `final`

```java
public static final int SIZE = 5;       // constant: value cannot change

private final List<Pion> pions;          // reference cannot change, but
                                         // list contents CAN be modified
```

Distinction importante :
- `final` sur un **type primitif** : la valeur elle-meme ne peut pas changer
- `final` sur une **reference** : la reference ne peut pas pointer vers un autre objet, mais l'etat interne de l'objet peut toujours etre modifie

### Membres `static`

`static` appartient a la classe, pas aux instances.

```java
public class Chene extends Arbre<Gland> {
    private static final double AGE_MIN_COUPE = 10;  // shared across all Chene instances
}

// Static factory method
public static A create(final B b) {
    try {
        return new A(b);
    } catch (final IllegalArgumentException ex) {
        return null;
    }
}
```

## Pieges courants

1. **Oublier d'initialiser les collections** : `private List<Arbre> arbres;` sans `= new ArrayList<>()` dans le constructeur provoque un `NullPointerException`.
2. **Recursion infinie dans les setters bidirectionnels** : toujours verifier `if (gd != this.guidon)` avant d'appeler le setter de l'autre cote.
3. **Violation de l'integrite referentielle** : lors de la modification d'un cote d'une association bidirectionnelle, toujours mettre a jour l'autre cote.
4. **Exposition de l'etat interne mutable** : retourner `this.roues` directement permet aux appelants de modifier la liste. Envisagez `Collections.unmodifiableList(roues)`.

---

## AIDE-MEMOIRE

```
STRUCTURE D'UNE CLASSE
  public class ClassName {
      private Type field;                         // encapsulated field
      public ClassName() { ... }                  // constructor
      public Type getField() { return field; }    // getter
      public void setField(Type f) { field = f; } // setter
  }

REGLES DES CONSTRUCTEURS
  - Meme nom que la classe, pas de type de retour
  - super(...) doit etre la premiere ligne du constructeur de la sous-classe
  - this(...) chaine vers un autre constructeur de la meme classe
  - Aucun constructeur explicite => Java fournit un constructeur par defaut sans argument

PATRONS D'ASSOCIATION
  0..1   =>  private Type ref = null;
  1      =>  initialise dans le constructeur, rejeter null
  0..*   =>  private List<Type> refs = new ArrayList<>();
  Bidirectionnel => mettre a jour LES DEUX cotes, se premunir de la recursion

MODIFICATEURS D'ACCES
  private < (defaut) < protected < public

FINAL
  final primitif   => valeur constante
  final reference  => pointeur fixe, contenu mutable
  final methode    => ne peut pas etre redefinie
  final classe     => ne peut pas etre etendue

STATIC
  champ static     => partage entre toutes les instances (niveau classe)
  methode static   => appelee via ClassName.method(), pas de 'this'
```
