---
title: "Listes Chainees"
sidebar_position: 1
---

# Listes Chainees

## Theorie

Une **liste chainee** est une structure de donnees lineaire ou les elements (noeuds) sont relies par des references (pointeurs). Contrairement aux tableaux, les elements ne sont pas stockes de maniere contigue en memoire.

### Liste Simplement Chainee

Chaque noeud contient une donnee et un pointeur vers le noeud suivant.

```
  [A|*]--->[B|*]--->[C|*]--->null
```

- Parcours : vers l'avant uniquement
- Insertion en tete : O(1)
- Suppression en tete : O(1)
- Acces au i-eme element : O(n)

### Liste Doublement Chainee

Chaque noeud contient une donnee, un pointeur vers le noeud suivant et un pointeur vers le noeud precedent.

```
  null<---[*|A|*]<--->[*|B|*]<--->[*|C|*]--->null
```

- Parcours : vers l'avant et vers l'arriere
- Insertion/suppression a une position connue : O(1)
- pred() est O(1) au lieu de O(n) comme en simple chainage

### Noeuds Sentinelles

Les sentinelles sont des noeuds fictifs qui simplifient les conditions aux limites. Le cours SDD de l'INSA utilise **deux sentinelles** (tete et queue) :

```
  head <---> [elem1] <---> [elem2] <---> [elem3] <---> tail
  (sentinelle)                                          (sentinelle)
```

Avantages :
- Pas de verification de null lors des insertions en debut/fin
- Liste vide = head.successor == tail
- Curseur sur une sentinelle = "hors liste" (estSorti)

### Patron Curseur

Le curseur est un pointeur interne vers l'element "courant". Toutes les operations agissent relativement au curseur.

```
  head <---> [A] <---> [B] <---> [C] <---> tail
                         ^
                       curseur
```

Operations :
- `entete()` -- curseur sur le premier element reel
- `enqueue()` -- curseur sur le dernier element reel
- `succ()` -- deplacer le curseur vers l'avant
- `pred()` -- deplacer le curseur vers l'arriere
- `valec()` -- valeur au curseur
- `ajouterD(x)` -- inserer x a droite du curseur, le curseur se deplace sur x
- `oterec()` -- supprimer l'element au curseur, le curseur se deplace sur le successeur
- `estSorti()` -- vrai si le curseur est sur une sentinelle
- `estVide()` -- vrai si head.successor == tail


## Implementation Java

### Interface (du TP1)

```java
public interface MyList<T> {
    void entete();          // cursor to head
    void succ();            // cursor forward
    void pred();            // cursor backward
    void ajouterD(T o);     // add right of cursor
    void oterec();          // remove at cursor
    T valec();              // value at cursor
    boolean estSorti();     // cursor out?
    boolean estVide();      // list empty?
}
```

### Liste Doublement Chainee avec Sentinelles (du TP1)

```java
public class ListeDoubleChainage implements MyList<Object> {
    static class Node {
        public Object value;
        public Node successor;
        public Node predecessor;
        public Node(Object o) { this.value = o; }
    }

    private final Node head;
    private Node cursor;
    private final Node tail;

    public ListeDoubleChainage() {
        head = cursor = new Node(null);    // sentinelle
        tail = new Node(null);             // sentinelle
        head.successor = tail;
    }
```

#### Insertion -- ajouterD(o)

```java
    public void ajouterD(Object o) {
        if (!this.estVide() && this.estSorti())
            throw new MyListOutOfBoundsException();
        if (this.estVide())
            this.cursor = head;

        Node nn = new Node(o);
        // 1. Link backwards
        nn.predecessor = this.cursor;
        this.cursor.successor.predecessor = nn;
        // 2. Link forward
        nn.successor = this.cursor.successor;
        this.cursor.successor = nn;
        // 3. Move cursor to new node
        this.cursor = nn;
    }
```

Etape par etape avec schema ASCII :

```
Avant : head <-> [A] <-> tail       curseur sur [A]

Etape 1 -- creer nn=[B], lier nn.pred = curseur
          head <-> [A] <-> tail
                    ^
              nn=[B]

Etape 2 -- nn.succ = cursor.succ (tail), tail.pred = nn
          head <-> [A]    [B] <-> tail
                    ^------^

Etape 3 -- cursor.succ = nn
          head <-> [A] <-> [B] <-> tail

Etape 4 -- cursor = nn
          head <-> [A] <-> [B] <-> tail
                            ^
                          curseur
```

#### Suppression -- oterec()

```java
    public void oterec() {
        if (this.estSorti())
            throw new MyListOutOfBoundsException();
        // Bypass current node
        this.cursor.predecessor.successor = this.cursor.successor;
        this.cursor.successor.predecessor = this.cursor.predecessor;
        // Move cursor to successor
        this.cursor = this.cursor.successor;
    }
```

```
Avant : head <-> [A] <-> [B] <-> [C] <-> tail
                          ^
                        curseur

Apres : head <-> [A] <---------> [C] <-> tail
                                  ^
                                curseur
         (B n'est plus reference, ramasse par le GC)
```


## Liste sur Tableau (ListeTabulee) -- du TP2

Une implementation alternative utilisant un tableau interne :

```java
public class ListeTabulee<T> implements Liste<T> {
    static final int TMAX = 1000;
    protected Object[] internal_tab;
    protected int occupation = 0;
    // ...
}
```

L'iterateur utilise un index entier au lieu d'un pointeur de noeud :

```java
public class ListeTabuleeIterateur<T> implements Iterateur<T> {
    private int index = -1;
    // succ() -> index++
    // pred() -> index--
    // ajouterD() -> shift elements right, insert at index+1
    // oterec() -> shift elements left
}
```

Difference clef : insertion/suppression necessite un decalage de O(n) elements.


## Comparaison de Complexite

| Operation | Double chainage (au curseur) | Tableau (au curseur) |
|-----------|--------------------------|--------------------------|
| entete() | O(1) | O(1) |
| succ() | O(1) | O(1) |
| pred() | O(1) | O(1) |
| ajouterD() | **O(1)** | **O(n)** (decalage) |
| oterec() | **O(1)** | **O(n)** (decalage) |
| valec() | O(1) | O(1) |
| estVide() | O(1) | O(1) |
| Acces par index | O(n) | **O(1)** |
| Surcharge memoire | 2 pointeurs/noeud | Aucune (contigu) |
| Localite de cache | Mauvaise | Excellente |


## Liste Circulaire

Une variante ou le dernier element pointe vers le premier :

```
  [A] ---> [B] ---> [C]
   ^                  |
   |__________________|
```

Non directement implementee dans les TP mais apparait parfois aux examens.


## Schemas Classiques d'Examen

1. **Implementer une operation** (ex. : inverser, fusionner, trier une liste chainee)
2. **Tracer l'execution** etape par etape sur une liste donnee
3. **Preuve de complexite** pour une operation donnee
4. **Comparer** les implementations chainee et tableau


## AIDE-MEMOIRE

```
LISTE DOUBLEMENT CHAINEE AVEC SENTINELLES
==========================================
Structure :  head <-> [e1] <-> [e2] <-> ... <-> [en] <-> tail
Sentinelles : head.value = null, tail.value = null
Vide :       head.successor == tail
Sorti :      cursor == head || cursor == tail

INSERTION DROITE (ajouterD) :     SUPPRESSION (oterec) :
  nn.pred = cursor                  cursor.pred.succ = cursor.succ
  cursor.succ.pred = nn             cursor.succ.pred = cursor.pred
  nn.succ = cursor.succ             cursor = cursor.succ
  cursor.succ = nn
  cursor = nn

TOUTES LES OPS CURSEUR : O(1)
RECHERCHE : O(n)          ACCES PAR INDEX : O(n)
```
