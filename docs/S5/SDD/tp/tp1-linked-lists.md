---
title: "TP01 - Listes Chainees"
sidebar_position: 1
---

# TP01 - Listes Chainees

## Objectif

Implementer et comprendre les structures de donnees fondamentales des listes chainees :
- Liste simplement chainee
- Liste doublement chainee avec noeuds sentinelles
- Pattern de navigation par curseur

## Theorie : Listes Chainees

### Qu'est-ce qu'une liste chainee ?

Une **liste chainee** est une structure de donnees lineaire ou les elements sont stockes dans des noeuds. Chaque noeud contient :
1. **Donnee** - la valeur reelle
2. **Reference(s)** - pointeur(s) vers le(s) noeud(s) suivant (et eventuellement precedent)

Contrairement aux tableaux, les listes chainees :
- Ne necessitent pas de memoire contigue
- Permettent l'insertion/suppression en O(1) a la position du curseur
- Necessitent un acces O(n) pour les elements arbitraires

### Simple vs. Double chainage

**Simple chainage** : Chaque noeud pointe uniquement vers le noeud **suivant**
```
[Data|Next] -> [Data|Next] -> [Data|Next] -> null
```

**Double chainage** : Chaque noeud pointe vers le **suivant** et le **precedent**
```
null <- [Prev|Data|Next] <-> [Prev|Data|Next] <-> [Prev|Data|Next] -> null
```

Avantages du double chainage :
- Parcours bidirectionnel
- Suppression plus simple (pas besoin de suivre le noeud precedent)
- Surcharge memoire legere (un pointeur supplementaire par noeud)

### Noeuds sentinelles

Un **noeud sentinelle** (ou noeud factice) est un noeud special qui :
- Ne contient pas de donnees reelles
- Simplifie les cas limites (liste vide, premier/dernier element)
- Sert de point de reference fixe

Cette implementation utilise **deux sentinelles** :
- **head** : Noeud permanent au debut (predecesseur du premier element reel)
- **tail** : Noeud permanent a la fin (successeur du dernier element reel)

```
head <-> [elem1] <-> [elem2] <-> [elem3] <-> tail
```

Avantages :
- Pas de verifications null pour le premier/dernier
- Logique d'insertion/suppression coherente
- Le curseur n'est jamais vraiment "null"

### Pattern Curseur

Le **curseur** est un pointeur vers le noeud "courant" dans la liste. Operations :
- `entete()` - Deplacer le curseur sur le premier element
- `succ()` - Avancer le curseur
- `pred()` - Reculer le curseur
- `valec()` - Obtenir la valeur au curseur
- `ajouterD()` - Ajouter un element a droite du curseur
- `oterec()` - Supprimer l'element au curseur
- `estSorti()` - Verifier si le curseur est hors-limites (sur une sentinelle)

## Implementation

### Interface : `MyList<T>`

Interface generique definissant les operations de la liste :

```java
public interface MyList<T> {
    void entete();           // Set cursor on first element
    void succ();             // Move to next
    void pred();             // Move to previous
    void ajouterD(T o);      // Add item to the right
    void oterec();           // Remove current item
    T valec();               // Current item value
    boolean estSorti();      // Is cursor out of bounds?
    boolean estVide();       // Is list empty?
}
```

### Classe : `ListeDoubleChainage`

Liste doublement chainee avec noeuds sentinelles.

#### Structure du Noeud

```java
static class Node {
    public Object value;
    public Node successor;
    public Node predecessor;
    public Node(Object o) { this.value = o; }
}
```

#### Attributs principaux

- `head` - Noeud sentinelle au debut
- `tail` - Noeud sentinelle a la fin
- `cursor` - Position courante dans la liste

#### Constructeur

```java
public ListeDoubleChainage() {
    head = cursor = new Node(null);
    tail = new Node(null);
    head.successor = tail;
}
```

Etat initial :
```
head <-> tail
 ^
cursor
```

#### Operations principales

**1. Navigation**

```java
public void entete() {
    this.cursor = this.head.successor;
}

public void succ() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to get successor from tail");
    }
    this.cursor = this.cursor.successor;
}

public void pred() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to get predecessor from head");
    }
    this.cursor = this.cursor.predecessor;
}
```

**2. Insertion (ajouterD)**

Ajoute un nouvel element a **droite** du curseur :

```java
public void ajouterD(Object o) {
    // Check bounds
    if (!this.estVide() && this.estSorti()) {
        throw new MyListOutOfBoundsException();
    }
    
    if (this.estVide())
        this.cursor = head;
    
    // Create new node
    Node nn = new Node(o);
    
    // Link backwards
    nn.predecessor = this.cursor;
    this.cursor.successor.predecessor = nn;
    
    // Link forward
    nn.successor = this.cursor.successor;
    this.cursor.successor = nn;
    
    // Move cursor to new node
    this.cursor = nn;
}
```

Exemple visuel :
```
Avant : head <-> [A] <-> tail
                  ^
                curseur

Apres : head <-> [A] <-> [B] <-> tail
                          ^
                        curseur
```

**3. Suppression (oterec)**

Supprime l'element au curseur :

```java
public void oterec() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to remove from out of space");
    }
    
    // Bypass current node
    this.cursor.predecessor.successor = this.cursor.successor;
    this.cursor.successor.predecessor = this.cursor.predecessor;
    
    // Move cursor to successor
    this.cursor = this.cursor.successor;
}
```

Exemple visuel :
```
Avant : head <-> [A] <-> [B] <-> [C] <-> tail
                          ^
                        curseur

Apres : head <-> [A] <-> [C] <-> tail
                          ^
                        curseur
```

**4. Verifications d'etat**

```java
public boolean estSorti() {
    // Out if on head or tail sentinel
    return this.cursor == this.head || this.cursor == this.tail;
}

public boolean estVide() {
    // Empty if head points directly to tail
    return this.head.successor == this.tail;
}

public Object valec() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to get something from nothing");
    }
    return this.cursor.value;
}
```

## Analyse de Complexite

| Operation | Complexite temps | Notes |
|-----------|----------------|-------|
| `entete()` | O(1) | Affectation directe de pointeur |
| `succ()` | O(1) | Suivre le pointeur suivant |
| `pred()` | O(1) | Suivre le pointeur precedent (avantage du double chainage) |
| `ajouterD()` | O(1) | Insertion a la position du curseur |
| `oterec()` | O(1) | Suppression a la position du curseur |
| `valec()` | O(1) | Acces direct |
| `estVide()` | O(1) | Verification de head.successor |
| `estSorti()` | O(1) | Comparaison du curseur aux sentinelles |

**Toutes les operations sont en O(1)** -- c'est l'avantage principal du pattern curseur !

Note : Trouver une valeur specifique necessite un parcours O(n), mais une fois a la bonne position, les modifications sont en temps constant.

## Exemple d'utilisation

```java
MyList<Object> list = new ListeDoubleChainage();

// Add elements
list.entete();           // Move to head
list.ajouterD("Alice");  // head <-> [Alice] <-> tail
list.ajouterD("Bob");    // head <-> [Alice] <-> [Bob] <-> tail
                         //                        ^

// Navigate
list.entete();           // Cursor on "Alice"
System.out.println(list.valec()); // "Alice"
list.succ();             // Cursor on "Bob"
System.out.println(list.valec()); // "Bob"

// Remove
list.oterec();           // Remove "Bob", cursor moves to tail
list.entete();           // Back to "Alice"
list.oterec();           // Remove "Alice"
System.out.println(list.estVide()); // true
```

## Exceptions

### `MyListOutOfBoundsException`

Lancee quand :
- On essaie de depasser les limites de la liste
- On tente d'acceder/modifier quand le curseur est hors-limites
- On appelle `oterec()` sur une sentinelle

```java
public class MyListOutOfBoundsException extends RuntimeException {
    public MyListOutOfBoundsException() { super(); }
    public MyListOutOfBoundsException(String message) { super(message); }
}
```

### `MyListEmptyException`

Lancee quand des operations necessitent une liste non vide :

```java
public class MyListEmptyException extends RuntimeException {
    public MyListEmptyException() { super(); }
    public MyListEmptyException(String message) { super(message); }
}
```

## Tests

Le fichier de tests fourni `ListeDoubleChainageTest.java` verifie :
- Le constructeur initialise une liste vide
- `ajouterD()` insere correctement les elements
- `oterec()` supprime correctement les elements
- Les methodes de navigation (`entete`, `succ`, `pred`) fonctionnent correctement
- Les exceptions sont lancees pour les operations invalides
- Les cas limites (liste vide, element unique, conditions aux bornes)

Lancer les tests :
```bash
# IntelliJ: Clic droit sur ListeDoubleChainageTest.java > Run
# Ou compiler manuellement :
javac -cp .:junit.jar src/test/ListeDoubleChainageTest.java
java -cp .:junit.jar org.junit.runner.JUnitCore test.ListeDoubleChainageTest
```

## Comparaison : Tableau vs. Liste Chainee

| Caracteristique | Tableau | Liste Chainee |
|---------|-------|-------------|
| Acces par index | O(1) | O(n) |
| Insertion au curseur | O(n) (decalage) | O(1) |
| Suppression au curseur | O(n) (decalage) | O(1) |
| Memoire | Contigue | Dispersee |
| Localite de cache | Excellente | Mauvaise |
| Surcharge | Aucune | Pointeur par element |

**Utiliser les listes chainees quand** :
- Insertions/suppressions frequentes a des positions arbitraires
- Taille inconnue ou tres variable
- L'acces sequentiel est suffisant

**Utiliser les tableaux quand** :
- Acces aleatoire necessaire
- La disposition memoire compte (cache)
- La taille est fixe ou change rarement

## Extensions (non implementees)

Ameliorations possibles :
1. **Typage generique** : Faire `ListeDoubleChainage<T>` au lieu d'utiliser `Object`
2. **Interface Iterator** : Implementer `Iterable<T>` pour les boucles for-each
3. **Operations supplementaires** : `length()`, `contains()`, `indexOf()`, `reverse()`
4. **Liste circulaire** : Faire tail.successor = head
5. **Liste chainee XOR** : Variante doublement chainee economique en espace

## Pieges courants

1. **Oublier les verifications de sentinelles** : Toujours verifier `estSorti()` avant les operations
2. **Acces pointeur null** : Se produit si on n'initialise pas head/tail correctement
3. **Ordre de chainage incorrect** : Lors de l'insertion, chainer en arriere d'abord, puis en avant
4. **Position du curseur apres suppression** : Retenir que le curseur se deplace sur le successeur
5. **Fuites memoire** (dans les langages comme C) : En Java, le GC s'en charge, mais en C/C++ il faut liberer les noeuds supprimes

## Voir aussi

- **TP02** : Iterateurs (separation des preoccupations)
- **TP03** : Application de base de donnees geographique
- [Java LinkedList](https://docs.oracle.com/javase/8/docs/api/java/util/LinkedList.html) - Implementation de la bibliotheque standard
