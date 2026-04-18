---
title: "Heritage et polymorphisme"
sidebar_position: 2
---

# Heritage et polymorphisme

## Theorie

### Heritage (`extends`)

L'heritage cree une relation "est-un". Une sous-classe herite de tous les membres non prives de sa classe parente et peut specialiser ou etendre le comportement.

```java
public abstract class Arbre {
    protected double age;
    protected double volume;

    public Arbre(double age, double volume) {
        this.age = age;
        this.volume = volume;
    }

    public void vieillir() {
        this.age++;             // shared behavior
    }

    protected abstract double getPrixM3();    // must be implemented by subclasses
    public abstract double getAgeMinCoupe();
}

public class Chene extends Arbre {
    public Chene(double age, double volume) {
        super(age, volume);    // call parent constructor
    }

    @Override
    protected double getPrixM3() {
        return 1000;           // oak-specific price
    }

    @Override
    public double getAgeMinCoupe() {
        return 10;
    }
}

public class Pin extends Arbre {
    public Pin(double age, double volume) {
        super(age, volume);
    }

    @Override
    protected double getPrixM3() {
        return 500;            // pine-specific price
    }

    @Override
    public double getAgeMinCoupe() {
        return 5;
    }
}
```

### Classes abstraites

Une classe abstraite **ne peut pas etre instanciee** directement. Elle peut contenir :
- Des methodes concretes (avec implementation, par ex. `vieillir()`, `getPrix()`)
- Des methodes abstraites (sans corps, devant etre redefinies par les sous-classes)
- Des constructeurs (appeles via `super()` depuis les sous-classes)
- Des champs (y compris des champs `protected` partages avec les sous-classes)

```java
public abstract class Arbre {
    // Methode concrete -- partagee par tous les types d'arbres
    public double getPrix() {
        return this.volume * this.getPrixM3();
    }

    // Methode concrete -- meme logique pour tous
    public boolean peutEtreCoupe() {
        return this.age >= this.getAgeMinCoupe();
    }

    // Methodes abstraites -- specifiques a chaque sous-classe
    protected abstract double getPrixM3();
    public abstract double getAgeMinCoupe();
}
```

**Quand utiliser une classe abstraite vs une interface** :

| Caracteristique | Classe abstraite | Interface |
|-----------------|-----------------|-----------|
| Champs | Oui (tout type) | Uniquement des constantes `static final` |
| Constructeurs | Oui | Non |
| Methodes concretes | Oui | Oui (methodes default depuis Java 8) |
| Heritage multiple | Non (un seul extends) | Oui (implements multiples) |
| A utiliser quand | Etat + comportement partages | Contrat / capacite |

### Interfaces

Une interface definit un contrat -- un ensemble de methodes que les classes implementantes doivent fournir.

```java
public interface Network {
    boolean ping(String address) throws NetworkException;
    void sendGetHTTPQuery(String address);
}

interface Service {
    int getLatency();
}

interface Pion {
    int getX();
    int getY();
}

public interface ITranslation {
    int getTx();
    int getTy();
}
```

Les interfaces sont centrales pour l'**inversion de dependances** : dependre des abstractions, pas des classes concretes. C'est ce qui permet le mocking dans les tests.

### Polymorphisme

Le polymorphisme signifie "plusieurs formes". Le meme appel de methode produit un comportement different selon le type reel de l'objet au moment de l'execution.

```java
// Reference type: Arbre     Actual type: Chene or Pin
List<Arbre> arbres = new ArrayList<>();
arbres.add(new Chene(15, 2.5));   // Chene is an Arbre
arbres.add(new Pin(8, 1.0));      // Pin is an Arbre

for (Arbre arbre : arbres) {
    // getPrix() calls the correct getPrixM3() depending on actual type
    System.out.println(arbre.getPrix());
    // Chene: 2.5 * 1000 = 2500
    // Pin:   1.0 * 500  = 500
}
```

### Liaison dynamique (liaison tardive)

A la compilation, Java verifie que le **type de la reference** possede la methode. A l'execution, Java dispatche vers l'implementation du **type reel**.

```java
Arbre tree = new Chene(15, 2.0);
tree.getPrix();          // Calls Chene's getPrixM3() at runtime
// Compilateur verifie : Arbre a getPrix() ? Oui.
// A l'execution : le type reel est Chene, donc Chene.getPrixM3() est appele.
```

### L'operateur `instanceof`

Verification de type a l'execution -- a utiliser avec parcimonie (cela indique souvent un probleme de conception, mais le cours l'enseigne explicitement).

```java
public int getNombreChenes() {
    int nombreChenes = 0;
    for (Arbre arbre : arbres) {
        if (arbre instanceof Chene) {   // runtime type check
            nombreChenes++;
        }
    }
    return nombreChenes;
}
```

### Redefinition vs surcharge de methodes

**Redefinition** (polymorphisme a l'execution) : une sous-classe redefinit une methode du parent avec la meme signature.
```java
@Override
public Gland produireFruit() {   // same name, covariant return type
    return new Gland();
}
```

**Surcharge** (a la compilation) : la meme classe definit plusieurs methodes avec le meme nom mais des listes de parametres differentes.
```java
public void translate(double tx, double ty) { ... }
public void translate(ITranslation translation) { ... }
```

### L'annotation `@Override`

Toujours utiliser `@Override` lors de la redefinition d'une methode. Cela fournit une verification a la compilation que vous redefinissez bien quelque chose (detecte les fautes de frappe et les erreurs de signature).

```java
@Override
public void manger(Gland gland) {
    // correct override of Animal<Gland>.manger(Gland)
}
```

## Patron : methode patron (Template Method)

La hierarchie `Arbre` utilise le patron Template Method : la classe de base definit le squelette de l'algorithme (`getPrix()` appelle `getPrixM3()`) et les sous-classes remplissent les etapes variables.

```
Arbre.getPrix()  -->  calls this.getPrixM3()  -->  dispatched to Chene.getPrixM3() or Pin.getPrixM3()
     ^                                                              ^
     |                                                              |
 Squelette de l'algorithme                                  Etape variable
```

## Pieges courants

1. **Oublier `super()` dans les constructeurs des sous-classes** : si le parent n'a pas de constructeur sans argument, vous DEVEZ appeler explicitement `super(args)`.
2. **Cast sans verification** : toujours utiliser `instanceof` avant un cast : `if (arbre instanceof Chene c) { ... }`.
3. **Confondre type de reference et type reel** : `Arbre a = new Chene(...)` -- `a` est type `Arbre` mais se comporte comme `Chene` pour les methodes redefinies.
4. **Methode abstraite non implementee** : oublier `@Override` et mal ecrire le nom de la methode cree une nouvelle methode au lieu de redefinir.

---

## AIDE-MEMOIRE

```
HERITAGE
  class Child extends Parent { ... }
  - Heritage simple uniquement (un seul extends)
  - Peut implementer plusieurs interfaces
  - super() appelle le constructeur parent (doit etre la premiere ligne)
  - super.method() appelle la version du parent d'une methode redefinie

CLASSES ABSTRAITES
  abstract class X {
      abstract void doSomething();    // no body
      void concreteMethod() { ... }  // has body
  }
  - Instanciation impossible : new X() est illegal
  - Les sous-classes DOIVENT implementer toutes les methodes abstraites (ou etre aussi abstraites)

INTERFACES
  interface Y {
      void doSomething();            // implicitly public abstract
      default void helper() { ... }  // Java 8+ default method
  }
  - class Z implements Y, W { ... }  // interfaces multiples OK

POLYMORPHISME
  Parent ref = new Child();
  ref.method();  // dispatche vers Child.method() a l'execution

instanceof
  if (obj instanceof Type t) {
      // t est deja caste en Type (Java 16+ pattern matching)
  }

@Override
  - Toujours utiliser lors d'une redefinition
  - Erreur de compilation si la methode ne redefinie rien

REGLES DE REDEFINITION
  - Meme nom de methode et memes types de parametres
  - Le type de retour peut etre covariant (plus specifique)
  - L'acces ne peut pas etre plus restrictif
  - Impossible de redefinir les methodes private ou static
```
