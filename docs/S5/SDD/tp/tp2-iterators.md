---
title: "TP02 - Listes avec Iterateurs"
sidebar_position: 2
---

# TP02 - Listes avec Iterateurs

## Objectif pedagogique

**Separer la logique de parcours de l'implementation du conteneur** en utilisant le pattern Iterateur.

Ce TP introduit le concept que :
- **Conteneur** (Liste) = Structure de stockage des donnees
- **Iterateur** (Iterateur) = Mecanisme de parcours

Avant ce TP : les operations de liste et la navigation etaient etroitement couplees.
Apres ce TP : une separation propre permet de changer les implementations independamment.

## Theorie : Pattern Iterateur

### Le probleme

Dans le TP01, `MyList` melangeait deux preoccupations :
1. **Stockage** : Comment les elements sont stockes (tableau, liste chainee, arbre...)
2. **Parcours** : Comment naviguer dans les elements (curseur, index, etc.)

Ce couplage etroit rend difficile de :
- Changer l'implementation de stockage
- Supporter plusieurs strategies de parcours
- Utiliser les fonctionnalites standard du langage (boucles for-each)

### La solution

Le **pattern Iterateur** separe ces preoccupations :

```
  Liste                       Iterateur
  + iterateur()  -- cree -->  + succ()
  + vider()                   + pred()
  + estVide()                 + valec()
                              + estSorti()
```

### Avantages

1. **Separation des preoccupations** : Stockage vs. parcours
2. **Iterateurs multiples** : Plusieurs parcours simultanement sur la meme liste
3. **Polymorphisme** : Le code client fonctionne avec n'importe quelle implementation de `Liste`
4. **Extensibilite** : Facile d'ajouter de nouveaux types de stockage
5. **Conformite standard** : Peut implementer l'interface `Iterator` de Java

## Interfaces

### `Liste` - Interface Conteneur

Represente la structure de donnees elle-meme :

```java
public interface Liste {
    Iterateur iterateur();
    void ajouterD(Object objet);
    void ajouterG(Object objet);
    void oterec();
    void vider();
    boolean estVide();
    boolean estSorti();
    Object valec();
    void modifec(Object objet);
}
```

### `Iterateur` - Interface de Parcours

Represente une position et un mecanisme de parcours :

```java
public interface Iterateur {
    void entete();
    void enqueue();
    void succ();
    void pred();
    boolean estSorti();
    Object valec();
}
```

## Principe de conception clef

**L'iterateur connait la liste, mais les operations de la liste utilisent la position de l'iterateur :**

```java
// L'iterateur navigue
Iterateur it = list.iterateur();
it.entete();
it.succ();

// La liste modifie a la position de l'iterateur
list.ajouterD(42);
list.oterec();
```

## Implementations

### 1. Implementation par tableau

**`ListeTabulee`** - Liste basee sur un tableau avec iterateur

```java
public class ListeTabulee implements Liste {
    private Object[] elements;
    private int size;
    private int capacity;
    private ListeTabuleeIterateur iterateur;
    
    public Iterateur iterateur() {
        if (iterateur == null) {
            iterateur = new ListeTabuleeIterateur(this);
        }
        return iterateur;
    }
}
```

**`ListeTabuleeIterateur`** - Parcours par index

```java
public class ListeTabuleeIterateur implements Iterateur {
    private ListeTabulee liste;
    private int index;
    
    public void succ() { index++; }
    public void pred() { index--; }
    
    public boolean estSorti() {
        return index < 0 || index >= liste.size();
    }
}
```

**Avantages :**
- Acces aleatoire O(1) par index
- Respect du cache (memoire contigue)
- Implementation simple

**Inconvenients :**
- Insertion/suppression O(n) (decalage des elements)
- Capacite fixe (ou redimensionnement couteux)

### 2. Implementation par double chainage

**`ListeDoubleChainee`** - Liste chainee avec sentinelles

```java
public class ListeDoubleChainee implements Liste {
    static class Node {
        Object value;
        Node next;
        Node prev;
    }
    
    private Node head;
    private Node tail;
    private ListeDoubleChaineeIterateur iterateur;
    
    public Iterateur iterateur() {
        if (iterateur == null) {
            iterateur = new ListeDoubleChaineeIterateur(this);
        }
        return iterateur;
    }
}
```

**`ListeDoubleChaineeIterateur`** - Parcours par noeud

```java
public class ListeDoubleChaineeIterateur implements Iterateur {
    private ListeDoubleChainee liste;
    private Node current;
    
    public void succ() { current = current.next; }
    public void pred() { current = current.prev; }
    
    public boolean estSorti() {
        return current == liste.head || current == liste.tail;
    }
}
```

**Avantages :**
- Insertion/suppression O(1) a la position de l'iterateur
- Pas de limite de capacite
- Pas d'espace gaspille

**Inconvenients :**
- Acces O(n) par index
- Surcharge de pointeurs (2 par noeud)
- Mauvaise localite de cache

## Exemple d'utilisation

```java
// Creer la liste (on peut changer d'implementation facilement)
Liste liste = new ListeDoubleChainee();
// ou : Liste liste = new ListeTabulee();

Iterateur it = liste.iterateur();

// Ajouter des elements
it.entete();
liste.ajouterD("Alice");
liste.ajouterD("Bob");
liste.ajouterD("Charlie");

// Naviguer et acceder
it.entete();
System.out.println(it.valec());  // "Alice"

it.succ();
System.out.println(it.valec());  // "Bob"

// Modifier
liste.modifec("Bobby");

// Supprimer
liste.oterec();

// Parcourir toute la liste
it.entete();
while (!it.estSorti()) {
    System.out.println(it.valec());
    it.succ();
}
```

## Adaptation aux Collections Java

On peut wrapper ces structures dans un adaptateur pour les utiliser avec l'interface standard `List<T>` de Java :

```java
public class ListeEngine<T> implements List<T> {
    private Liste liste;
    
    public ListeEngine(Liste liste) {
        this.liste = liste;
    }
    
    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            Iterateur it = liste.iterateur();
            { it.entete(); }
            
            public boolean hasNext() { return !it.estSorti(); }
            
            public T next() {
                T val = (T) it.valec();
                it.succ();
                return val;
            }
        };
    }
}
```

Puis utiliser dans des boucles for-each :

```java
Liste internalList = new ListeDoubleChainee<>();
List<String> list = new ListeEngine<>(internalList);

list.add("A");
list.add("B");

for (String s : list) {
    System.out.println(s);
}
```

## Strategie de tests

### Classe de test de base

Creer une classe de test abstraite avec toute la logique de test :

```java
public abstract class ListeTestBase {
    protected abstract Liste createListe();
    
    @Test
    public void testAjouterD() {
        Liste liste = createListe();
        Iterateur it = liste.iterateur();
        it.entete();
        liste.ajouterD("first");
        assertEquals("first", it.valec());
    }
}
```

### Classes de test concretes

Chaque implementation etend la base avec une methode factory :

```java
public class ListeTabuleeTest extends ListeTestBase {
    protected Liste createListe() { return new ListeTabulee(); }
}

public class ListeDoubleChaineeTest extends ListeTestBase {
    protected Liste createListe() { return new ListeDoubleChainee(); }
}
```

Cela garantit que **les deux implementations** passent **les memes tests** -- prouvant qu'elles sont interchangeables.

## Comparaison de complexite

| Operation | Tableau (ListeTabulee) | Chainage (ListeDoubleChainee) |
|-----------|---------------------|----------------------------|
| Creer iterateur | O(1) | O(1) |
| `entete()` | O(1) | O(1) |
| `succ()` | O(1) | O(1) |
| `pred()` | O(1) | O(1) |
| `valec()` | O(1) | O(1) |
| `ajouterD()` | O(n) (decalage) | O(1) |
| `ajouterG()` | O(n) (decalage) | O(1) |
| `oterec()` | O(n) (decalage) | O(1) |
| `vider()` | O(1) | O(n) (ou O(1) avec GC) |

**Point clef** : Pour les insertions/suppressions frequentes, la liste chainee gagne. Pour les charges de travail en lecture avec peu de modifications, le tableau est souvent plus rapide (localite de cache).

## Variantes du Pattern

### 1. Iterateur unique vs. multiples

**Conception actuelle** (iterateur unique) :
```java
public Iterateur iterateur() {
    if (iterateur == null)
        iterateur = new ListeTabuleeIterateur(this);
    return iterateur;  // Retourne toujours la meme instance
}
```

**Alternative** (iterateurs multiples) :
```java
public Iterateur iterateur() {
    return new ListeTabuleeIterateur(this);  // Nouvelle instance a chaque fois
}
```

Avantages iterateur unique : Les operations de la liste travaillent avec "l'unique" iterateur.
Avantages iterateurs multiples : Parcours independants, plus sur en multi-thread.

### 2. Iterateurs internes vs. externes

**Interne** : L'iterateur controle la boucle
```java
liste.forEach(element -> System.out.println(element));
```

**Externe** (conception actuelle) : Le client controle la boucle
```java
Iterateur it = liste.iterateur();
while (!it.estSorti()) {
    System.out.println(it.valec());
    it.succ();
}
```

L'externe donne plus de controle ; l'interne est plus concis.

## Erreurs courantes

1. **Modifier pendant l'iteration sans suivi d'etat**
2. **Oublier de verifier `estSorti()` avant l'acces**
3. **Melanger des iterateurs de listes differentes**

## Voir aussi

- **TP01** : Implementation de base des listes chainees
- **TP03** : Base de donnees geographique utilisant ces listes
- [Java Iterator Pattern](https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html)
- [Design Patterns : Iterator](https://refactoring.guru/design-patterns/iterator)
