---
title: "UML Diagrams"
sidebar_position: 4
---

# UML Diagrams

## Theory

UML (Unified Modeling Language) is a standardized visual language for specifying, constructing, and documenting software systems. The CPOO exam consistently asks you to draw class diagrams and, occasionally, use case diagrams and sequence diagrams.

---

## 1. Class Diagrams

### Basic Class Notation

```
+-------------------+
|    ClassName       |       <<abstract>>  or <<interface>>
+-------------------+
| - privateField    |       Visibility:
| # protectedField  |         - private
| + publicField     |         # protected
| ~ packageField    |         + public
+-------------------+         ~ package
| + publicMethod()  |
| # protectedMethod()|
| + abstractMethod()*|      * italic or {abstract}
+-------------------+
```

### Relationships

**Inheritance (generalization)**: solid line with hollow triangle arrowhead pointing to parent.
```
     Arbre              (parent)
       ^
       |                solid line + hollow triangle
       |
     Chene              (child: Chene extends Arbre)
```

**Interface implementation (realization)**: dashed line with hollow triangle.
```
  <<interface>>
    Network             (interface)
       ^
       :                dashed line + hollow triangle
       :
  NetworkImpl           (class implements Network)
```

**Association**: solid line, optionally with arrowhead for navigation direction.
```
  Velo ---------> Guidon         unidirectional (Velo knows Guidon)
        guidon
        0..1

  Velo <--------> Guidon         bidirectional (both know each other)
        guidon     velo
        0..1       0..1
```

**Aggregation** (weak "has-a"): solid line with hollow diamond on the "whole" side.
```
  Foret <>------> Arbre          Foret has Arbres
          arbres
          0..*
```

**Composition** (strong "has-a"): solid line with filled diamond. The part cannot exist without the whole.
```
  Velo <*>------> Roue           Roue cannot exist without Velo
          roues
          0..*
```

**Dependency**: dashed arrow. One class uses another temporarily (e.g., as a parameter).
```
  Client - - - -> Service        Client depends on Service
```

### Multiplicity

| Notation | Meaning |
|----------|---------|
| `1` | Exactly one |
| `0..1` | Zero or one (optional) |
| `0..*` or `*` | Zero or more |
| `1..*` | One or more |
| `2` | Exactly two |

### Abstract Classes and Interfaces in UML

```
+-------------------+           +-------------------+
|   <<abstract>>    |           |   <<interface>>   |
|      Arbre        |           |     Service       |
+-------------------+           +-------------------+
| # age: double     |           | + getLatency(): int|
| # volume: double  |           +-------------------+
+-------------------+
| + vieillir()      |
| + getPrix(): double|
| + getPrixM3()*    |     * = abstract method
+-------------------+
```

### Enumerations in UML

```
+-------------------+
|   <<enumeration>> |
|   UniteDeMesure   |
+-------------------+
|   ML              |
|   M2              |
|   U               |
+-------------------+
```

---

## 2. Worked Example: Forest System (TP2)

From the course text:

```
                      +-------------------+
                      |   <<abstract>>    |
                      |   Arbre<F>        |
                      +-------------------+
                      | # age: double     |
                      | # volume: double  |
                      +-------------------+
                      | + vieillir()      |
                      | + getPrix(): double|
                      | + peutEtreCoupe() |
                      | + produireFruit():F|
                      | # getPrixM3()*    |
                      | + getAgeMinCoupe()*|
                      +-------------------+
                            ^         ^
                            |         |
              +-------------+    +------------+
              |                               |
    +-------------------+          +-------------------+
    |   Chene<Gland>    |          |    Pin<Cone>      |
    +-------------------+          +-------------------+
    | + getPrixM3()     |          | + getPrixM3()     |
    | + getAgeMinCoupe()|          | + getAgeMinCoupe()|
    | + produireFruit() |          | + produireFruit() |
    +-------------------+          +-------------------+
              |                               |
           produces                        produces
              |                               |
    +-------------------+          +-------------------+
    |      Gland        |          |      Cone         |
    +-------------------+          +-------------------+
    (extends Fruit)                (extends Fruit)

    +-------------------+
    |      Foret        |
    +-------------------+
    | - arbres: List<Arbre>        |
    | - arbres_coupes: List<Arbre> |
    +-------------------+
    | + planterArbre()  |
    | + couperArbre()   |
    | + getPrixTotal()  |
    | + getNombreChenes()|
    +-------------------+
           <>
           | arbres 0..*
           v
         Arbre
```

---

## 3. Worked Example: Exam 2024-2025 (Devis System)

Text: "Un devis concerne un client et possede une date. Un client a un nom et une adresse. Un client peut etre une entreprise (avec un numero). Une tache a une designation, quantite, prix unitaire, et unite de mesure. Une tache fait reference a du materiel (au moins un). Un materiel est fourni par un ou plusieurs fournisseurs."

```
  +-------------------+     1    +-------------------+
  |      Devis        |--------->|     Client        |
  +-------------------+          +-------------------+
  | - date: String    |          | - nom: String     |
  +-------------------+          | - adresse: String |
         |                       +-------------------+
         | taches 1..*                    ^
         v                                |
  +-------------------+          +-------------------+
  |      Tache        |          |   Entreprise      |
  +-------------------+          +-------------------+
  | - designation: String|       | - numero: String  |
  | - quantite: double  |       +-------------------+
  | - prixUnitaire: double|
  +-------------------+
  | - unite: UniteDeMesure |
  +-------------------+
         |
         | materiels 1..*
         v
  +-------------------+     *     +-------------------+
  |     Materiel      |<--------->|   Fournisseur     |
  +-------------------+   1..*   +-------------------+
  | - designation: String|       | - nom: String     |
  +-------------------+          +-------------------+

  +-------------------+
  | <<enumeration>>   |
  |  UniteDeMesure    |
  +-------------------+
  |   ML              |
  |   M2              |
  |   U               |
  +-------------------+
```

---

## 4. Worked Example: Exam 2020-2021 (Arithmetic Formula)

Text describes a formula as a tree: root node is an operator, operands can be values, constant references, or other operators.

```
  +-------------------+          +-------------------+
  | FormuleArithmetique|-------->| <<interface>>     |
  +-------------------+ racine  |   Calculable      |
  | - constantes: Map  | 1      +-------------------+
  +-------------------+         | + calculer(): double|
  | + calculer(): double|       +-------------------+
  +-------------------+              ^    ^    ^
                                     |    |    |
                    +----------------+    |    +----------------+
                    |                     |                     |
          +-------------------+ +-------------------+ +-------------------+
          |     Valeur        | |  RefConstante     | |   <<abstract>>    |
          +-------------------+ +-------------------+ |   Operateur       |
          | - nombre: double  | | - ref: Constante  | +-------------------+
          +-------------------+ +-------------------+ | - gauche: Calculable|
          | + calculer()      | | + calculer()      | | - droite: Calculable|
          +-------------------+ +-------------------+ +-------------------+
                                                      | + calculer()      |
                                                      +-------------------+
                                                           ^         ^
                                                           |         |
                                                 +-----------+ +-----------+
                                                 |  Addition  | |Soustraction|
                                                 +-----------+ +-----------+

  +-------------------+
  |    Constante      |
  +-------------------+
  | - nom: String     |
  | - valeur: double  |
  +-------------------+
```

---

## 5. Use Case Diagrams

Use case diagrams show actors (stick figures) and the use cases (ovals) they interact with.

### Relationships in Use Case Diagrams

| Relationship | Notation | Meaning |
|-------------|----------|---------|
| Association | Solid line | Actor participates in use case |
| Include | Dashed arrow `<<include>>` | Use case always includes another |
| Extend | Dashed arrow `<<extend>>` | Use case optionally extends another |
| Generalization | Solid arrow with triangle | Specialized use case / actor inheritance |

### Worked Example: Restaurant (Exam 2020-2021)

```
   Client            Serveur           Cuisinier          Caissier
     |                  |                  |                  |
     +-- Passer --+     |                  |                  |
     |  commande  |-----+                  |                  |
     |            |     |                  |                  |
     | Commander  |     +-- Servir plat ---+                  |
     |   du vin --+     |                  |                  |
     | (specializes     +-- Servir vin     |                  |
     |  commande)       | (specializes     |                  |
     |                  |  servir plat)    |                  |
     |                  |                  +-- Cuisiner plat  |
     |                  |                  | <<include>>      |
     |                  |                  | passer commande  |
     |                  |                                     |
     +----------------------------------------- Encaisser ---+
                                             <<include>>
                                             passer commande
```

Note: "Serveur peut etre Caissier" = actor generalization (Serveur inherits from Caissier or vice versa).

---

## 6. Sequence Diagrams

Sequence diagrams show the order of method calls between objects over time.

### Worked Example: Addition.calculer()

```
  :Client         :Addition        :gauche           :droite
     |                |               |                  |
     | calculer()     |               |                  |
     |--------------->|               |                  |
     |                | calculer()    |                  |
     |                |-------------->|                  |
     |                |    valG       |                  |
     |                |<------------- |                  |
     |                |               | calculer()       |
     |                |---------------|----------------->|
     |                |               |     valD         |
     |                |<--------------|------------------|
     |                |               |                  |
     |  valG + valD   |               |                  |
     |<---------------|               |                  |
```

---

## Common Pitfalls

1. **Confusing aggregation and composition**: composition means the part cannot exist without the whole (filled diamond). Aggregation is weaker (hollow diamond).
2. **Missing multiplicity**: every association should show multiplicity on both ends.
3. **Forgetting abstract notation**: mark abstract classes with `<<abstract>>` or italicize the name.
4. **Wrong arrow direction**: the arrow points FROM the dependent TO the dependency. A `Velo` that knows its `Guidon` has the arrow FROM Velo TO Guidon.
5. **Mixing `<<include>>` and `<<extend>>`**: include is mandatory; extend is optional/conditional.

---

## CHEAT SHEET

```
CLASS DIAGRAM RELATIONSHIPS
  Inheritance:     solid line + hollow triangle pointing to parent
  Implementation:  dashed line + hollow triangle pointing to interface
  Association:     solid line (+ arrowhead for direction)
  Aggregation:     hollow diamond on "whole" side
  Composition:     filled diamond on "whole" side
  Dependency:      dashed arrow

MULTIPLICITY
  1     exactly one
  0..1  optional (zero or one)
  0..*  zero or more
  1..*  one or more

CLASS NOTATION
  + public   # protected   - private   ~ package
  <<abstract>>   <<interface>>   <<enumeration>>
  abstract method: italic or marked with {abstract}

USE CASE DIAGRAM
  Actor:          stick figure
  Use Case:       oval
  <<include>>:    dashed arrow, mandatory sub-behavior
  <<extend>>:     dashed arrow, optional sub-behavior
  Generalization: solid arrow + triangle (actor or use case inheritance)

SEQUENCE DIAGRAM
  Object:         box at top with lifeline (dashed vertical)
  Message:        solid arrow (synchronous) or dashed arrow (return)
  Activation:     thin rectangle on lifeline
  Self-call:      arrow looping back to same lifeline
```
