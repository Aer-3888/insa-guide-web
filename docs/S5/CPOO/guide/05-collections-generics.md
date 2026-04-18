---
title: "Collections et generiques"
sidebar_position: 5
---

# Collections et generiques

## Theorie

### Le framework Collections de Java

Le framework Collections fournit des interfaces et des implementations pour stocker et manipuler des groupes d'objets.

```
              Iterable
                 |
            Collection
           /    |     \
         List  Set    Queue
          |     |
    ArrayList  HashSet
    LinkedList TreeSet
```

### List

Collection ordonnee (conserve l'ordre d'insertion), accepte les doublons.

```java
List<Arbre> arbres = new ArrayList<>();       // most common
List<Arbre> linked = new LinkedList<>();      // better for frequent insertions/removals

// Common operations
arbres.add(new Chene(10, 2.0));               // add at end
arbres.get(0);                                 // access by index
arbres.size();                                 // number of elements
arbres.contains(someArbre);                   // membership check
arbres.remove(someArbre);                     // remove by object
arbres.remove(0);                              // remove by index
arbres.isEmpty();                              // check if empty
```

### Set

Pas de doublons, pas d'ordre garanti (HashSet) ou ordre trie (TreeSet).

```java
Set<String> names = new HashSet<>();
names.add("Chene");
names.add("Chene");          // ignored, already present
// names.size() == 1
```

### Map

Paires cle-valeur. Chaque cle correspond a au plus une valeur.

```java
Map<String, Integer> prices = new HashMap<>();
prices.put("Chene", 1000);
prices.put("Pin", 500);
int oakPrice = prices.get("Chene");    // 1000
```

### Parcourir les collections

**Boucle for-each** (preferee pour la lecture) :
```java
for (Arbre arbre : arbres) {
    System.out.println(arbre.getPrix());
}
```

**Iterator** (necessaire lors de modifications pendant l'iteration) :
```java
Iterator<Arbre> iterator = arbres.iterator();
while (iterator.hasNext()) {
    Arbre arbre = iterator.next();
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        iterator.remove();           // SAFE removal
        return true;
    }
}
```

**Streams** (style fonctionnel) :
```java
double total = arbres.stream()
    .mapToDouble(Arbre::getPrix)
    .sum();

int totalLatency = services.stream()
    .mapToInt(Service::getLatency)
    .sum();
```

### ConcurrentModificationException

C'est le piege le plus frequemment teste dans les examens CPOO concernant les collections.

**INCORRECT** -- modifier une liste pendant une iteration for-each :
```java
for (Arbre arbre : arbres) {
    if (arbre.peutEtreCoupe()) {
        arbres.remove(arbre);    // ConcurrentModificationException!
    }
}
```

**CORRECT** -- utiliser Iterator.remove() :
```java
Iterator<Arbre> it = arbres.iterator();
while (it.hasNext()) {
    Arbre arbre = it.next();
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        it.remove();             // safe
        return true;
    }
}
```

**CORRECT** -- utiliser une boucle par indice inverse :
```java
for (int i = arbres.size() - 1; i >= 0; i--) {
    if (arbres.get(i).peutEtreCoupe()) {
        arbres_coupes.add(arbres.get(i));
        arbres.remove(i);
        return true;
    }
}
```

### Collections non modifiables

```java
private final List<Pion> pions;

public List<Pion> getPions() {
    return Collections.unmodifiableList(pions);   // read-only view
}
// Callers can read but cannot add/remove/clear
```

---

## Generiques

### Pourquoi les generiques ?

Sans generiques, les collections stockent des `Object` et necessitent un cast :
```java
List arbres = new ArrayList();
arbres.add(new Chene(10, 2.0));
Chene c = (Chene) arbres.get(0);   // unsafe cast, may fail at runtime
```

Avec les generiques, le compilateur assure la surete de type :
```java
List<Arbre> arbres = new ArrayList<>();
arbres.add(new Chene(10, 2.0));
Arbre a = arbres.get(0);            // no cast needed, type-safe
```

### Classes generiques

```java
public abstract class Arbre<F extends Fruit> {
    public abstract F produireFruit();
}

public class Chene extends Arbre<Gland> {
    @Override
    public Gland produireFruit() {
        return new Gland();           // type-safe: returns Gland, not just Fruit
    }
}
```

Le parametre de type `<F extends Fruit>` signifie :
- `F` est une variable de type
- `F` doit etre `Fruit` ou une sous-classe de `Fruit`
- Les sous-classes concretes lient `F` a un type specifique (par ex., `Gland`, `Cone`)

### Interfaces generiques

```java
public abstract class Animal<F extends Fruit> {
    public abstract void manger(F fruit);
}

public class Cochon extends Animal<Gland> {
    @Override
    public void manger(Gland gland) { /* eats acorns */ }
}

public class Ecureuil extends Animal<Cone> {
    @Override
    public void manger(Cone cone) { /* eats pine cones */ }
}
```

### Surete de type en action

```java
Chene oak = new Chene(15, 2.5);
Gland acorn = oak.produireFruit();      // compile-time: returns Gland

Cochon pig = new Cochon();
pig.manger(acorn);                       // OK: Cochon eats Gland

Cone cone = new Cone();
pig.manger(cone);                        // COMPILE ERROR: Cochon expects Gland
```

### Wildcards (pour reference)

```java
List<?> anything;                        // unknown type
List<? extends Arbre> trees;             // Arbre or any subclass
List<? super Chene> acceptsOaks;         // Chene or any superclass
```

### Types bruts (a eviter)

Utiliser des classes generiques sans parametres de type cree des types bruts :
```java
List list = new ArrayList();             // raw type -- avoid!
List<Arbre> list = new ArrayList<>();    // correct -- type-safe
```

L'operateur diamant `<>` infere le type depuis le contexte.

---

## Pieges courants

1. **ConcurrentModificationException** : ne jamais modifier une collection dans une boucle for-each. Utiliser `Iterator.remove()` ou le retrait par indice.
2. **Collections non initialisees** : `private List<Arbre> arbres;` sans initialisation dans le constructeur provoque un `NullPointerException` a la premiere utilisation.
3. **Retourner l'etat interne mutable** : `return arbres;` permet aux appelants de modifier votre liste interne. Utiliser `Collections.unmodifiableList()`.
4. **Bornes generiques incorrectes** : `Arbre<Fruit>` n'est pas la meme chose que `Arbre<? extends Fruit>`. Le premier est un type concret, le second est un wildcard.
5. **Utilisation excessive d'`instanceof`** : si vous vous retrouvez a faire `if (arbre instanceof Chene)` partout, envisagez de repenser avec le polymorphisme.

---

## AIDE-MEMOIRE

```
TYPES DE COLLECTIONS
  List<E>    = ordonnee, doublons OK          -> ArrayList, LinkedList
  Set<E>     = pas de doublons                 -> HashSet, TreeSet
  Map<K,V>   = paires cle-valeur              -> HashMap, TreeMap
  Queue<E>   = FIFO                            -> LinkedList, ArrayDeque

OPERATIONS COURANTES
  .add(e)     .remove(e)     .contains(e)     .size()     .isEmpty()
  .get(i)     .set(i, e)     .indexOf(e)      .clear()
  .stream()   .iterator()

RETRAIT SUR PENDANT L'ITERATION
  Iterator<E> it = list.iterator();
  while (it.hasNext()) {
      E e = it.next();
      if (condition) it.remove();   // safe
  }

NON MODIFIABLE
  Collections.unmodifiableList(list)   // read-only view

SYNTAXE DES GENERIQUES
  class MyClass<T> { ... }                  // classe generique
  class MyClass<T extends Bound> { ... }    // type borne
  <T> void method(T param) { ... }          // methode generique
  ? extends Type                            // wildcard borne superieure
  ? super Type                              // wildcard borne inferieure

OPERATEUR DIAMANT
  List<Arbre> list = new ArrayList<>();     // infere <Arbre>
```
