---
title: "TP1 - Listes Chainees"
sidebar_position: 1
---

# TP1 - Listes Chainees

> D'apres les consignes de l'enseignant : `S5/SDD/data/moodle/tp/tp1_linked_lists/README.md`

## Objectif

Implementer une liste doublement chainee avec des noeuds sentinelles et un curseur de navigation. Toutes les operations de la liste doivent s'effectuer en O(1) au niveau du curseur.

## Fichiers fournis

| Fichier | Role | Statut |
|---------|------|--------|
| `src/main/MyList.java` | Interface definissant les operations | Fourni - ne pas modifier |
| `src/main/MyListOutOfBoundsException.java` | Exception pour acces hors-limites | Fourni |
| `src/main/MyListEmptyException.java` | Exception pour liste vide | Fourni |
| `src/main/ListeDoubleChainage.java` | Implementation liste doublement chainee | **A ecrire** |
| `src/test/ListeDoubleChainageTest.java` | Tests JUnit 5 | Fourni - lancer pour verifier |

## Interface MyList\<T\>

```java
public interface MyList<T> {
    public void entete();           // Positionner le curseur sur le premier element
    public void succ();             // Avancer le curseur
    public void pred();             // Reculer le curseur
    public void ajouterD(T o);      // Ajouter un element a droite du curseur
    public void oterec();           // Supprimer l'element courant
    public T valec();               // Obtenir la valeur au curseur
    public boolean estSorti();      // Le curseur est-il hors limites ?
    public boolean estVide();       // La liste est-elle vide ?
}
```

---

## Exercice 1

### Definir la structure interne Node et les attributs de la liste

La liste doublement chainee utilise deux noeuds sentinelles (`head` et `tail`) qui ne contiennent pas de donnees reelles. Le curseur pointe sur l'element courant.

**Reponse :**

```java
package main;

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
        head = cursor = new Node(null);
        tail = new Node(null);
        head.successor = tail;
    }
}
```

**Fonctionnement du code :**
- `head` et `tail` sont des noeuds sentinelles permanents qui encadrent les elements reels.
- Le constructeur cree une liste vide : `head <-> tail`, avec le curseur sur `head`.
- `head.successor = tail` etablit le lien initial. Les elements seront inseres entre `head` et `tail`.

---

## Exercice 2

### Implementer estVide() et estSorti()

Determiner si la liste est vide (rien entre les sentinelles) et si le curseur est sur une position valide.

**Reponse :**

```java
public boolean estVide() {
    return this.head.successor == this.tail;
}

public boolean estSorti() {
    return this.cursor == this.head || this.cursor == this.tail;
}
```

**Fonctionnement du code :**
- `estVide()` : la liste est vide quand `head` pointe directement sur `tail` sans element intermediaire.
- `estSorti()` : le curseur est hors-limites quand il se trouve sur l'une des sentinelles. La comparaison par identite (`==`) est correcte car les sentinelles sont des instances fixes.

---

## Exercice 3

### Implementer entete() -- positionner le curseur sur le premier element

**Reponse :**

```java
public void entete() {
    this.cursor = this.head.successor;
}
```

**Fonctionnement du code :**
Le premier element reel est `head.successor`. Si la liste est vide, `head.successor == tail`, donc `estSorti()` retournera `true` apres l'appel.

---

## Exercice 4

### Implementer succ() et pred() -- navigation du curseur

Avancer ou reculer le curseur. Si le curseur est deja hors-limites, lancer une exception.

**Reponse :**

```java
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

**Fonctionnement du code :**
- On verifie d'abord que le curseur est sur un element valide (pas sur une sentinelle).
- Apres `succ()` ou `pred()`, le curseur peut atterrir sur une sentinelle -- c'est normal, cela signifie simplement que `estSorti()` retournera `true`.
- L'exception n'est lancee que si on essaie de se deplacer *alors qu'on est deja* sur une sentinelle.

---

## Exercice 5

### Implementer valec() -- obtenir la valeur au curseur

**Reponse :**

```java
public Object valec() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to get something from nothing");
    }
    return this.cursor.value;
}
```

**Fonctionnement du code :**
Verification des bornes, puis retour de la valeur du noeud courant. Simple et O(1).

---

## Exercice 6

### Implementer ajouterD() -- inserer un element a droite du curseur

Ajouter un nouvel element a droite du curseur, puis deplacer le curseur sur le nouvel element. Cas special : si la liste est vide, on ancre le curseur sur `head` avant l'insertion.

**Reponse :**

```java
public void ajouterD(Object o) {
    // On ne peut pas ajouter dans une liste non vide si le curseur est hors-limites
    if (!this.estVide() && this.estSorti()) {
        throw new MyListOutOfBoundsException();
    }

    // Si la liste est vide, ancrer sur la sentinelle head
    if (this.estVide())
        this.cursor = head;

    // Creer le nouveau noeud et le chainer
    Node nn = new Node(o);
    nn.predecessor = this.cursor;
    this.cursor.successor.predecessor = nn;
    nn.successor = this.cursor.successor;
    this.cursor.successor = nn;

    // Le curseur se deplace sur le nouveau noeud
    this.cursor = nn;
}
```

**Fonctionnement du code :**
L'ordre de chainage est critique :
1. `nn.predecessor = cursor` -- le nouveau noeud pointe en arriere vers le curseur
2. `cursor.successor.predecessor = nn` -- l'ancien successeur pointe en arriere vers le nouveau noeud
3. `nn.successor = cursor.successor` -- le nouveau noeud pointe en avant vers l'ancien successeur
4. `cursor.successor = nn` -- le curseur pointe en avant vers le nouveau noeud

Piege classique : si on ecrit `cursor.successor = nn` avant `nn.successor = cursor.successor`, on perd la reference vers l'ancien successeur.

Illustration :
```
Avant :  head <-> [A] <-> tail       curseur sur A
Apres :  head <-> [A] <-> [B] <-> tail     curseur sur B
```

---

## Exercice 7

### Implementer oterec() -- supprimer l'element au curseur

Supprimer l'element courant et deplacer le curseur sur le successeur.

**Reponse :**

```java
public void oterec() {
    if (this.estSorti()) {
        throw new MyListOutOfBoundsException("Trying to remove from out of space");
    }

    // Court-circuiter le noeud courant
    this.cursor.predecessor.successor = this.cursor.successor;
    this.cursor.successor.predecessor = this.cursor.predecessor;

    // Le curseur avance sur le successeur
    this.cursor = this.cursor.successor;
}
```

**Fonctionnement du code :**
On fait pointer le predecesseur et le successeur du noeud courant directement l'un vers l'autre, en sautant le noeud a supprimer. Le curseur se deplace ensuite sur le successeur.

Illustration :
```
Avant :  head <-> [A] <-> [B] <-> [C] <-> tail    curseur sur B
Apres :  head <-> [A] <-> [C] <-> tail             curseur sur C
```

---

## Code complet -- ListeDoubleChainage.java

```java
package main;

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
        head = cursor = new Node(null);
        tail = new Node(null);
        head.successor = tail;
    }

    public void entete() {
        this.cursor = this.head.successor;
    }

    public boolean estSorti() {
        return this.cursor == this.head || this.cursor == this.tail;
    }

    public boolean estVide() {
        return this.head.successor == this.tail;
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

    public void ajouterD(Object o) {
        if (!this.estVide() && this.estSorti()) {
            throw new MyListOutOfBoundsException();
        }
        if (this.estVide())
            this.cursor = head;

        Node nn = new Node(o);
        nn.predecessor = this.cursor;
        this.cursor.successor.predecessor = nn;
        nn.successor = this.cursor.successor;
        this.cursor.successor = nn;
        this.cursor = nn;
    }

    public void oterec() {
        if (this.estSorti()) {
            throw new MyListOutOfBoundsException("Trying to remove from out of space");
        }
        this.cursor.predecessor.successor = this.cursor.successor;
        this.cursor.successor.predecessor = this.cursor.predecessor;
        this.cursor = this.cursor.successor;
    }

    public Object valec() {
        if (this.estSorti()) {
            throw new MyListOutOfBoundsException("Trying to get something from nothing");
        }
        return this.cursor.value;
    }
}
```

## Analyse de complexite

| Operation | Complexite temps | Note |
|-----------|-----------------|------|
| `entete()` | O(1) | Affectation directe |
| `succ()` / `pred()` | O(1) | Suivre un pointeur |
| `ajouterD()` | O(1) | Insertion au curseur |
| `oterec()` | O(1) | Suppression au curseur |
| `valec()` | O(1) | Acces direct |
| `estVide()` / `estSorti()` | O(1) | Comparaison de references |

Toutes les operations sont en temps constant. C'est l'avantage principal du pattern liste-chainee-avec-curseur.
