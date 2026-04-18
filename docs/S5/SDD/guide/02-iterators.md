---
title: "Iterateurs et Patrons de Conception"
sidebar_position: 2
---

# Iterateurs et Patrons de Conception

## Theorie

### Le Patron Iterateur

Le **patron Iterateur** separe la logique de parcours de la structure de donnees elle-meme. Cela permet :
- Des parcours simultanes multiples (plusieurs iterateurs sur une seule liste)
- Differentes strategies de parcours (avant, arriere, filtre)
- Une interface propre : la liste cree des iterateurs, les iterateurs naviguent

```
  Liste<T>  ----------cree----------> Iterateur<T>
     |                                       |
     | implemente                           | implemente
     v                                       v
  ListeDoubleChainee<T>              ListeDoubleChaineeIterateur<T>
  ListeTabulee<T>                    ListeTabuleeIterateur<T>
```

### Pourquoi Separer Liste et Iterateur ?

Avec l'approche du TP1 (`MyList` avec curseur integre) :
- Un seul curseur par liste
- Impossible d'iterer et modifier simultanement
- Impossible d'avoir deux parcours independants

Avec l'approche du TP2 (`Iterateur` separe) :
- Creer plusieurs iterateurs : `Iterateur<T> it1 = list.iterateur(); Iterateur<T> it2 = list.iterateur();`
- Chacun a son propre curseur
- La liste elle-meme n'a pas de curseur


## Interfaces Java (des TP2-3)

### Liste<T> -- L'Interface de Liste

```java
public interface Liste<T> {
    void vider();              // empty the list
    boolean estVide();         // is the list empty?
    Iterateur<T> iterateur();  // factory: create an iterator
}
```

### Iterateur<T> -- L'Interface Iterateur

```java
public interface Iterateur<T> {
    void entete();          // cursor to first element
    void enqueue();         // cursor to last element
    void succ();            // move forward
    void pred();            // move backward
    void ajouterD(T o);     // insert right of cursor
    void ajouterG(T o);     // insert left of cursor
    void oterec();          // remove at cursor
    T valec();              // value at cursor
    void modifec(T o);      // modify value at cursor
    boolean estSorti();     // cursor out?
}
```


## Implementation : ListeDoubleChainee avec Iterateur Separe (TP2)

### La Classe Liste (sans curseur)

```java
public class ListeDoubleChainee<T> implements Liste<T> {
    protected static class Link<T> {
        T value = null;
        Link pred = null;
        Link succ = null;
    }
    protected Link head = null;
    protected Link tail = null;

    public ListeDoubleChainee() {
        this.head = new Link<T>();
        this.tail = new Link<T>();
        this.vider();
    }

    public void vider() {
        this.head.succ = this.tail;
        this.tail.pred = this.head;
    }

    public boolean estVide() {
        return this.head.succ == this.tail && this.tail.pred == this.head;
    }

    public Iterateur<T> iterateur() {
        return new ListeDoubleChaineeIterateur<T>(this);
    }
}
```

### La Classe Iterateur (possede un curseur)

```java
public class ListeDoubleChaineeIterateur<T> implements Iterateur<T> {
    private final ListeDoubleChainee<T> l;
    private ListeDoubleChainee.Link<T> cursor;

    public ListeDoubleChaineeIterateur(ListeDoubleChainee<T> lst) {
        this.l = lst;
        this.cursor = l.head;  // starts on sentinel
    }

    public boolean estSorti() {
        return this.cursor.pred == null || this.cursor.succ == null;
    }

    public void entete() { this.cursor = this.l.head.succ; }
    public void enqueue() { this.cursor = this.l.tail.pred; }

    public void succ() {
        if (this.estSorti()) throw new ListeDehorsException();
        this.cursor = this.cursor.succ;
    }

    public void ajouterD(T o) {
        if (!this.l.estVide() && this.estSorti())
            throw new ListeDehorsException();
        if (this.l.estVide()) this.cursor = this.l.head;

        ListeDoubleChainee.Link<T> nlink = new ListeDoubleChainee.Link<T>();
        nlink.value = o;
        nlink.pred = this.cursor;
        nlink.succ = this.cursor.succ;
        nlink.succ.pred = nlink;
        this.cursor.succ = nlink;
        this.cursor = nlink;
    }
    // ... (oterec, modifec, valec similaires au TP1)
}
```


## Patron Adaptateur : Pont vers java.util (TP3)

### Probleme

Le cours utilise des interfaces personnalisees `Liste<T>` / `Iterateur<T>`, mais la bibliotheque standard Java utilise `java.util.List<T>` / `java.util.Iterator<T>`. Pour utiliser les boucles for-each et les API standard, nous avons besoin d'adaptateurs.

### IterateurEngine -- Adapte Iterateur vers java.util.Iterator

```java
public class IterateurEngine<T> implements java.util.Iterator<T> {
    private final Iterateur<T> it;

    public IterateurEngine(Liste<T> dt) {
        this.it = dt.iterateur();
        this.it.entete();  // start at first element
    }

    public boolean hasNext() {
        return !this.it.estSorti();
    }

    public T next() {
        T ret = this.it.valec();
        this.it.succ();
        return ret;
    }
}
```

### ListeEngine -- Adapte Liste vers java.util.List

```java
public class ListeEngine<T> implements java.util.List<T> {
    private final Liste<T> lst;

    public ListeEngine(Liste<T> ls) { this.lst = ls; }

    public java.util.Iterator<T> iterator() {
        return new IterateurEngine<>(this.lst);
    }

    public boolean add(T e) {
        Iterateur<T> it = this.lst.iterateur();
        it.enqueue();
        it.ajouterD(e);
        return true;
    }

    public int size() {
        int ret = 0;
        for (Object k : this) ret++;  // uses for-each via iterator()
        return ret;
    }
    // ... (get, set, remove, indexOf, etc.)
}
```

### Utilisation -- Base de Donnees Geographique (TP3)

```java
public class BdGeographique {
    private final List<Enregistrement> data;

    public BdGeographique() {
        // Liste personnalisee encapsulee dans l'adaptateur -- utilisable avec for-each !
        this.data = new ListeEngine<>(new ListeDoubleChainee<>());
    }

    public boolean estPresent(Enregistrement e) {
        for (Enregistrement k : this.data) {  // for-each fonctionne !
            if (k.equals(e)) return true;
        }
        return false;
    }
}
```


## Comparaison : Iterateurs Personnalises vs. Standard Java

| Fonctionnalite | Iterateur<T> (personnalise) | java.util.Iterator<T> |
|---------|----------------------|----------------------|
| Avancer | succ() | next() (retourne aussi la valeur) |
| Reculer | pred() | Non supporte |
| Valeur | valec() | Integre dans next() |
| Inserer | ajouterD(), ajouterG() | Non supporte |
| Supprimer | oterec() | remove() (optionnel) |
| Tester la fin | estSorti() | hasNext() |
| Debut | entete() / enqueue() | Cree a neuf |
| Passes multiples | Oui (entete() reinitialise) | Non (une seule passe) |

### Protocole Iterable/Iterator Java

```java
// To use for-each, a class must implement Iterable<T>
public interface Iterable<T> {
    Iterator<T> iterator();
}

// Then you can write:
for (T item : myCollection) { ... }

// Which is syntactic sugar for:
Iterator<T> it = myCollection.iterator();
while (it.hasNext()) {
    T item = it.next();
    // ...
}
```


## Complexite

Toutes les operations de l'iterateur sur une liste doublement chainee restent O(1) :

| Operation | ListeDoubleChaineeIterateur | ListeTabuleeIterateur |
|-----------|---------------------------|----------------------|
| entete() | O(1) | O(1) |
| enqueue() | O(1) | O(1) |
| succ() | O(1) | O(1) |
| pred() | O(1) | O(1) |
| ajouterD() | O(1) | **O(n)** -- decalage |
| ajouterG() | O(1) | **O(n)** -- decalage |
| oterec() | O(1) | **O(n)** -- decalage |
| valec() | O(1) | O(1) |

Les methodes de l'adaptateur (ListeEngine) ajoutent un surcout pour l'acces par index : `get(i)` est O(i) sur une liste chainee.


## AIDE-MEMOIRE

```
PATRON ITERATEUR
=================
Liste<T>  --cree-->  Iterateur<T>   (methode fabrique : iterateur())
  |                        |
  +-- pas de curseur       +-- possede un curseur
  +-- vider(), estVide()   +-- entete(), succ(), pred(), enqueue()
                           +-- ajouterD(), ajouterG(), oterec()
                           +-- valec(), modifec(), estSorti()

PATRON ADAPTATEUR
=================
Personnalise          Standard Java
----------            -------------
Liste<T>        -->   java.util.List<T>      via ListeEngine<T>
Iterateur<T>    -->   java.util.Iterator<T>  via IterateurEngine<T>

IterateurEngine.hasNext()  =  !it.estSorti()
IterateurEngine.next()     =  val = it.valec(); it.succ(); return val;

BOUCLE FOR-EACH :
  for (T item : listeEngine) { ... }
  == Iterator<T> it = listeEngine.iterator();
     while (it.hasNext()) { T item = it.next(); ... }
```
