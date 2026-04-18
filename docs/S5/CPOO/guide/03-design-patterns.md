---
title: "Patrons de conception"
sidebar_position: 3
---

# Patrons de conception

## Theorie

Les patrons de conception sont des solutions reutilisables a des problemes recurrents en conception logicielle. Le cours CPOO se concentre sur les patrons qui apparaissent dans les hierarchies de classes POO et les questions d'examen.

---

## 1. Patron Strategy

**Intention** : definir une famille d'algorithmes, encapsuler chacun d'eux, et les rendre interchangeables. Le code client depend de l'interface, pas de l'implementation concrete.

**Structure** :
```
  +-----------+          +------------------+
  |  Context  |--------->|  <<interface>>   |
  |-----------|          |    Strategy      |
  | - strategy|          +------------------+
  | + execute()|         | + algorithm()    |
  +-----------+          +------------------+
                              ^         ^
                              |         |
                  +-----------+    +----------+
                  | ConcreteA |    | ConcreteB|
                  +-----------+    +----------+
```

**Exemple du cours** : `Animal<F extends Fruit>` utilise les generiques comme une strategie type-safe pour manger differents types de fruits.

```java
public abstract class Animal<F extends Fruit> {
    public abstract void manger(F fruit);   // strategy: what to eat
}

public class Cochon extends Animal<Gland> {
    @Override
    public void manger(Gland gland) { /* pig eats acorns */ }
}

public class Ecureuil extends Animal<Cone> {
    @Override
    public void manger(Cone cone) { /* squirrel eats pine cones */ }
}
```

**Quand l'utiliser** : lorsque vous avez plusieurs facons d'effectuer une operation et que vous voulez les interchanger sans modifier le code client.

---

## 2. Patron Observer

**Intention** : definir une dependance un-vers-plusieurs de sorte que lorsqu'un objet (le sujet) change d'etat, tous ses dependants (observateurs) soient notifies automatiquement.

**Structure** :
```
  +-------------+          +------------------+
  |   Subject   |--------->|  <<interface>>   |
  |-------------|  0..*    |    Observer       |
  | + attach()  |          +------------------+
  | + notify()  |          | + update()       |
  +-------------+          +------------------+
                                   ^
                                   |
                           +-------+-------+
                           | ConcreteObs   |
                           +---------------+
```

**Exemple d'examen (2024-2025)** : la classe `Traitement` utilise une interface `Observateur` pour notifier les observateurs en fonction de l'entree.

```java
public interface Observateur {
    void a();
    void b(String str);
}

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
```

**Quand l'utiliser** : systemes d'evenements, mises a jour d'interface, scenarios editeur/abonne.

---

## 3. Patron Factory

**Intention** : fournir une interface pour creer des objets sans specifier leur classe exacte. Laisser les sous-classes ou une methode fabrique decider quelle classe instancier.

### Methode fabrique simple

```java
public class A {
    // Static factory method -- returns A or null
    public static A create(final B b) {
        try {
            return new A(b);
        } catch (final IllegalArgumentException ex) {
            return null;
        }
    }
}

// Usage
A obj = A.create(someB);   // cleaner than try/catch at call site
```

### Fabrique avec selection de sous-classe

```java
public abstract class Arbre<F extends Fruit> {
    public abstract F produireFruit();   // each subclass produces its own fruit type
}

// Each tree "factory-produces" its specific fruit
Chene oak = new Chene(15, 2.5);
Gland acorn = oak.produireFruit();       // factory method returns Gland

Pin pine = new Pin(8, 1.0);
Cone cone = pine.produireFruit();        // factory method returns Cone
```

**Quand l'utiliser** : lorsque la logique de creation d'objets est complexe, lorsque vous voulez decoupler le client des classes specifiques, ou lorsque la construction peut echouer.

---

## 4. Patron Singleton

**Intention** : garantir qu'une classe n'a qu'une seule instance et fournir un point d'acces global a celle-ci.

```java
public class Registry {
    private static final Registry INSTANCE = new Registry();

    private Registry() { }                  // private constructor

    public static Registry getInstance() {
        return INSTANCE;
    }
}
```

**Attention** : les singletons rendent les tests difficiles car ils introduisent un etat global. Preferez l'injection de dependances quand c'est possible.

---

## 5. MVC (Modele-Vue-Controleur)

**Intention** : separer une application en trois composants interconnectes pour separer les responsabilites.

```
  +-------+     met a jour    +------+     affiche      +------+
  | Model | <---------------- | Ctrl | --------------> | View |
  +-------+                   +------+                 +------+
      |                         ^                        |
      |      notifie            |     entree utilisateur |
      +-------------------------+------------------------+
```

- **Modele** : donnees et logique metier (par ex., les classes `Arbre`, `Foret`)
- **Vue** : couche de presentation (affiche les donnees a l'utilisateur)
- **Controleur** : gere les entrees utilisateur, met a jour le modele, selectionne la vue

Dans le contexte du cours CPOO, le code TP suit un MVC simplifie ou les classes du domaine (Modele) sont testees independamment de toute interface graphique.

---

## 6. Patron Decorator

**Intention** : attacher dynamiquement des responsabilites supplementaires a un objet. Les decorateurs offrent une alternative flexible au sous-classement.

```
  +------------------+
  |  <<interface>>   |
  |    Component     |
  +------------------+
  | + operation()    |
  +------------------+
        ^         ^
        |         |
  +----------+  +-----------+
  | Concrete |  | Decorator |-----> Component
  +----------+  +-----------+
                | + operation()|
                +-----------+
```

```java
// Conceptual example
interface Boisson {
    double prix();
    String description();
}

class Cafe implements Boisson {
    public double prix() { return 1.50; }
    public String description() { return "Cafe"; }
}

class AvecLait implements Boisson {
    private final Boisson boisson;
    public AvecLait(Boisson b) { this.boisson = b; }
    public double prix() { return boisson.prix() + 0.30; }
    public String description() { return boisson.description() + " + Lait"; }
}

// Usage: new AvecLait(new Cafe()).prix() => 1.80
```

---

## 7. Patron Composite

**Intention** : composer des objets en structures arborescentes pour representer des hierarchies tout-partie. Les clients traitent uniformement les objets individuels et les compositions.

```
  +------------------+
  |  <<interface>>   |
  |    Component     |
  +------------------+
  | + operation()    |
  +------------------+
        ^         ^
        |         |
  +----------+  +-------------+
  |   Leaf   |  |  Composite  |----> 0..* Component
  +----------+  +-------------+
                | + add()      |
                | + remove()   |
                +-------------+
```

**Exemple d'examen (2020-2021)** : arbre de formule arithmetique ou un noeud est soit une valeur litterale, une reference a une constante, ou un operateur (addition/soustraction) avec deux operandes (gauche et droite). La formule et tous les noeuds sont "calculables" -- ils implementent une methode `calculer(): double`.

```
  +------------------+
  |  <<interface>>   |
  |   Calculable     |
  +------------------+
  | + calculer(): double |
  +------------------+
        ^    ^    ^
        |    |    |
  +-------+ +--------+ +-----------+
  | Valeur| |  Ref   | | Operateur |
  +-------+ +--------+ +-----------+
                            ^    ^
                            |    |
                     +--------+ +--------+
                     |Addition| |Soustraction|
                     +--------+ +--------+
```

---

## Patrons dans le materiel de cours

| Patron | Ou il apparait |
|--------|----------------|
| Template Method | `Arbre.getPrix()` appelle l'abstraite `getPrixM3()` |
| Strategy (via generiques) | `Animal<F>` / `Arbre<F>` avec comportement specifique au type |
| Factory Method | `A.create(B b)` methode fabrique statique |
| Observer | Examen 2024-2025 `Traitement`/`Observateur` |
| Composite | Examen 2020-2021 arbre de formule arithmetique |

## Pieges courants

1. **Sur-ingenierie** : ne pas appliquer de patrons la ou une solution simple suffit.
2. **Confondre Strategy et Template Method** : Strategy utilise la composition (l'objet detient une reference vers une strategie) ; Template Method utilise l'heritage (la sous-classe redefinie les etapes).
3. **Abus du Singleton** : dans les tests, les singletons rendent le mocking tres difficile. Le cours enseigne `mockConstruction` et `mockStatic` pour contourner cela.
4. **Ne pas reconnaitre le patron dans les questions d'examen** : lisez attentivement le texte UML pour des mots-cles comme "compose de", "est-un", "possede differents types de" pour identifier le patron qui convient.

---

## AIDE-MEMOIRE

```
STRATEGY        = interface + implementations multiples, le contexte detient une reference
OBSERVER        = le sujet notifie les observateurs lors d'un changement d'etat (1-vers-plusieurs)
FACTORY         = methode statique ou classe separee qui cree des objets
SINGLETON       = constructeur prive + getInstance() statique
MVC             = Modele (donnees) + Vue (affichage) + Controleur (logique)
DECORATOR       = enveloppe un objet, ajoute du comportement, meme interface
COMPOSITE       = structure arborescente, feuille et composite partagent la meme interface
TEMPLATE METHOD = algorithme dans la classe de base, les sous-classes redefinissent les etapes

MOTS-CLES D'EXAMEN -> CORRESPONDANCE PATRON :
  "differents types de X"        -> Heritage / Strategy
  "compose de / contient"        -> Composite / Agregation
  "notifier / mettre a jour"     -> Observer
  "creer / fabrique"             -> Factory Method
  "structure arborescente / recursif" -> Composite
  "enveloppe / ajoute du comportement" -> Decorator
```
