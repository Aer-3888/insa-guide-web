---
title: "TP2 - Listes avec Iterateurs (Lists with Iterators)"
sidebar_position: 2
---

# TP2 - Listes avec Iterateurs (Lists with Iterators)

> Following teacher instructions from: `S5/SDD/data/moodle/tp/tp2_iterators/README.md`

## Objectif pedagogique

**Separer la logique de parcours de l'implementation du conteneur** en utilisant le pattern Iterateur.

- **Conteneur** (`Liste`) = structure de stockage des donnees
- **Iterateur** (`Iterateur`) = mecanisme de parcours

Dans le TP1, `MyList` melait ces deux preoccupations. Maintenant on les separe pour permettre de changer d'implementation de maniere transparente.

## Fichiers

| Fichier | Role | Statut |
|---------|------|--------|
| `src/main/Liste.java` | Interface conteneur | **A definir** |
| `src/main/Iterateur.java` | Interface parcours | **A definir** |
| `src/main/ListeDoubleChainee.java` | Conteneur avec chainage double | **A ecrire** |
| `src/main/ListeDoubleChaineeIterateur.java` | Iterateur pour chainage double | **A ecrire** |
| `src/main/ListeTabulee.java` | Conteneur avec tableau | **A ecrire** |
| `src/main/ListeTabuleeIterateur.java` | Iterateur pour tableau | **A ecrire** |
| `src/main/DebordementException.java` | Exception de debordement (tableau) | Fourni |
| `test/test/ListeTest.java` | Tests abstraits de base | Fourni |
| `test/test/ListeDoubleChaineeTest.java` | Tests concrets pour chainage | Fourni |
| `test/test/ListeTabuleeTest.java` | Tests concrets pour tableau | Fourni |

## Principe de conception

```
Liste<T>                          Iterateur<T>
  estVide()                         entete(), enqueue()
  vider()                           succ(), pred()
  iterateur() --> cree -->          valec(), modifec()
                                    estSorti()
                                    ajouterD(), ajouterG()
                                    oterec()
```

La liste possede les donnees. L'iterateur detient une position (curseur) et effectue toute la navigation et modification a travers ce curseur.

---

## Exercice 1

### Definir l'interface Iterateur -- quelles operations le curseur de parcours necessite-t-il ?

**Answer:**

```java
package main;

public interface Iterateur<T> {
    void entete();              // Aller au premier element
    void enqueue();             // Aller au dernier element
    void succ();                // Avancer
    void pred();                // Reculer
    boolean estSorti();         // Curseur hors-limites ?
    T valec();                  // Valeur au curseur
    void modifec(T o);          // Modifier la valeur au curseur
    void ajouterD(T o);         // Ajouter a droite du curseur
    void ajouterG(T o);         // Ajouter a gauche du curseur
    void oterec();              // Supprimer au curseur
}
```

**How the code works:**
L'iterateur rassemble toutes les operations de navigation et de modification positionnelle. Les operations `ajouterG()` et `modifec()` sont nouvelles par rapport au TP1.

---

## Exercice 2

### Definir l'interface Liste -- quelles operations le conteneur a-t-il besoin (separement du parcours) ?

**Answer:**

```java
package main;

public interface Liste<T> {
    boolean estVide();          // La liste est-elle vide ?
    void vider();               // Vider la liste
    Iterateur<T> iterateur();   // Creer/obtenir un iterateur
}
```

**How the code works:**
La liste ne connait rien de la position du curseur. L'iterateur connait sa liste et la parcourt. Le code client obtient un iterateur via `liste.iterateur()` et effectue toutes les operations a travers lui.

---

## Exercice 3

### Implementer ListeDoubleChainee -- le conteneur avec chainage double et sentinelles

Reprendre le pattern du TP1 avec sentinelles, mais sans aucune logique de curseur.

**Answer:**

```java
package main;

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

**How the code works:**
- Difference clef avec le TP1 : la liste n'a pas de champ `cursor`. Elle ne gere que la structure sentinelle.
- La classe interne `Link` utilise `pred`/`succ` au lieu de `predecessor`/`successor`.
- Les champs sont `protected` pour que l'iterateur puisse y acceder.
- `vider()` dans le constructeur initialise `head.succ = tail` et `tail.pred = head`.

---

## Exercice 4

### Implementer ListeDoubleChaineeIterateur -- le parcours par curseur sur la liste chainee

**Answer:**

```java
package main;

public class ListeDoubleChaineeIterateur<T> implements Iterateur<T> {
    private final ListeDoubleChainee<T> l;
    private ListeDoubleChainee.Link<T> cursor;

    public ListeDoubleChaineeIterateur(ListeDoubleChainee<T> lst) {
        this.l = lst;
        this.cursor = l.head;
    }

    public boolean estSorti() {
        return this.cursor.pred == null || this.cursor.succ == null;
    }

    public void entete() {
        this.cursor = this.l.head.succ;
    }

    public void enqueue() {
        this.cursor = this.l.tail.pred;
    }

    public void pred() {
        if (this.estSorti())
            throw new ListeDehorsException("Precedent sur sortie");
        this.cursor = this.cursor.pred;
    }

    public void succ() {
        if (this.estSorti())
            throw new ListeDehorsException("Successeur sur sortie");
        this.cursor = this.cursor.succ;
    }

    public void ajouterD(T o) {
        if (!this.l.estVide() && this.estSorti())
            throw new ListeDehorsException("Ajout droit sorti");
        if (this.l.estVide())
            this.cursor = this.l.head;

        ListeDoubleChainee.Link<T> nlink = new ListeDoubleChainee.Link<T>();
        nlink.value = o;
        nlink.pred = this.cursor;
        nlink.succ = this.cursor.succ;
        nlink.succ.pred = nlink;
        this.cursor.succ = nlink;
        this.cursor = nlink;
    }

    public void ajouterG(T o) {
        if (!this.l.estVide() && this.estSorti())
            throw new ListeDehorsException("Ajout gauche sorti");
        if (this.l.estVide())
            this.cursor = this.l.tail;

        ListeDoubleChainee.Link<T> nlink = new ListeDoubleChainee.Link<T>();
        nlink.value = o;
        nlink.pred = this.cursor.pred;
        nlink.succ = this.cursor;
        nlink.pred.succ = nlink;
        this.cursor.pred = nlink;
        this.cursor = nlink;
    }

    public void oterec() {
        if (this.estSorti())
            throw new ListeDehorsException("Oter sur sortie");
        this.cursor.pred.succ = this.cursor.succ;
        this.cursor.succ.pred = this.cursor.pred;
        this.cursor = this.cursor.succ;
    }

    public void modifec(T o) {
        if (this.estSorti())
            throw new ListeDehorsException("Modification sur sortie");
        this.cursor.value = o;
    }

    public T valec() {
        if (this.estSorti())
            throw new ListeDehorsException("Valeur actuelle sur sortie");
        return this.cursor.value;
    }
}
```

**How the code works:**
- `estSorti()` detecte les sentinelles en verifiant `cursor.pred == null` (sentinelle head) ou `cursor.succ == null` (sentinelle tail).
- `ajouterG()` est nouveau : insere a *gauche* du curseur. La logique de chainage est le miroir de `ajouterD()`. Quand la liste est vide, on ancre sur `tail` au lieu de `head`.
- Toutes les insertions/suppressions sont O(1) grace au chainage double.

---

## Exercice 5

### Implementer ListeTabulee -- le conteneur avec tableau

Implementer la meme interface `Liste<T>` en utilisant un tableau au lieu de pointeurs.

**Answer:**

```java
package main;

public class ListeTabulee<T> implements Liste<T> {
    static final int TMAX = 1000;
    protected Object internal_tab[];
    protected int occupation = 0;

    public ListeTabulee() {
        internal_tab = new Object[ListeTabulee.TMAX];
    }

    public void vider() {
        while (this.occupation > 0) {
            this.internal_tab[this.occupation - 1] = null;
            this.occupation--;
        }
    }

    public boolean estVide() {
        return this.occupation == 0;
    }

    public Iterateur<T> iterateur() {
        return new ListeTabuleeIterateur<T>(this);
    }
}
```

**How the code works:**
- Taille maximale fixe (`TMAX = 1000`). Depasser lance `DebordementException`.
- `occupation` compte le nombre de cases utilisees.
- `internal_tab` et `occupation` sont `protected` pour que l'iterateur puisse y acceder.

---

## Exercice 6

### Implementer ListeTabuleeIterateur -- le parcours par index dans le tableau

**Answer:**

```java
package main;

public class ListeTabuleeIterateur<T> implements Iterateur<T> {
    private final ListeTabulee<T> l;
    private int index = -1;

    public ListeTabuleeIterateur(ListeTabulee<T> lst) {
        this.l = lst;
    }

    public void entete() {
        this.index = 0;
    }

    public void enqueue() {
        this.index = this.l.occupation - 1;
    }

    public void succ() {
        if (this.estSorti())
            throw new ListeDehorsException("Suivant depuis la fin");
        this.index++;
    }

    public void pred() {
        if (this.estSorti())
            throw new ListeDehorsException("Precedent de la tete");
        this.index--;
    }

    public void ajouterD(Object o) {
        if (!this.l.estVide() && this.estSorti())
            throw new ListeDehorsException();
        if (this.l.occupation >= ListeTabulee.TMAX)
            throw new DebordementException("Impossible d'ajouter");

        // Decaler tous les elements a droite de index d'une position
        for (int tmpcursor = this.l.occupation;
             tmpcursor - 1 > this.index; tmpcursor--)
            this.l.internal_tab[tmpcursor] = this.l.internal_tab[tmpcursor - 1];

        this.index++;
        this.l.internal_tab[this.index] = o;
        this.l.occupation++;
    }

    public void ajouterG(T o) {
        if (!this.l.estVide() && this.estSorti())
            throw new ListeDehorsException();
        if (this.l.occupation >= ListeTabulee.TMAX)
            throw new DebordementException("Impossible d'ajouter");

        if (this.index < 0)
            this.index = 0;
        // Decaler l'element courant et les suivants d'une position
        for (int tmpcursor = this.l.occupation;
             tmpcursor > this.index; tmpcursor--)
            this.l.internal_tab[tmpcursor] = this.l.internal_tab[tmpcursor - 1];

        this.l.internal_tab[this.index] = o;
        this.l.occupation++;
    }

    public void oterec() {
        if (this.estSorti())
            throw new ListeDehorsException("Oter sur sortie");
        // Decaler tous les elements vers la gauche
        for (int tmpcursor = this.index;
             tmpcursor < this.l.occupation - 1; tmpcursor++)
            this.l.internal_tab[tmpcursor] = this.l.internal_tab[tmpcursor + 1];
        this.l.occupation--;
    }

    public T valec() {
        if (this.estSorti())
            throw new ListeDehorsException("Courant sur sortie");
        return (T) this.l.internal_tab[this.index];
    }

    public void modifec(T o) {
        if (this.estSorti())
            throw new ListeDehorsException("Remplacement sur sortie");
        this.l.internal_tab[this.index] = o;
    }

    public boolean estSorti() {
        return this.index < 0 || this.index >= this.l.occupation;
    }
}
```

**How the code works:**
- Difference critique avec la version chainee : `ajouterD()` et `oterec()` necessitent des decalages O(n) car les elements du tableau doivent etre contigus.
- `index` commence a -1 (hors-limites). Apres `entete()` il vaut 0. Apres ajout d'un element et `succ()`, l'index vaut `occupation`, donc `estSorti()` retourne `true`.

---

## Exercice 7

### Verifier avec le framework de tests

Le framework de tests utilise un pattern de classe de base abstraite :

**Answer:**

Les deux implementations doivent passer les *memes* tests, ce qui prouve qu'elles sont interchangeables via les interfaces `Liste`/`Iterateur`.

```java
// Classe abstraite avec toute la logique de test
public abstract class ListeTest {
    Liste l = null;
    Iterateur it = null;

    @Test
    public void isNewEmpty() { assertTrue(l.estVide()); }

    @Test
    public void isEmptiedEmpty() {
        it.ajouterD(54);
        it.ajouterD(2738);
        l.vider();
        assertTrue(l.estVide());
    }
}

// Les classes concretes connectent l'implementation specifique
public class ListeDoubleChaineeTest extends ListeTest {
    @BeforeEach void setup() {
        l = new ListeDoubleChainee<>();
        it = l.iterateur();
    }
}

public class ListeTabuleeTest extends ListeTest {
    @BeforeEach void setup() {
        l = new ListeTabulee<>();
        it = l.iterateur();
    }
}
```

**How the code works:**
Le pattern Template Method : la classe de base definit les tests, les sous-classes fournissent la factory. Si les deux implementations passent les memes tests, elles respectent le meme contrat.

---

## Comparaison de complexite

| Operation | Tableau (ListeTabulee) | Chainage (ListeDoubleChainee) |
|-----------|----------------------|-------------------------------|
| `entete()` | O(1) | O(1) |
| `succ()` / `pred()` | O(1) | O(1) |
| `valec()` | O(1) | O(1) |
| `ajouterD()` | **O(n)** -- decalage | **O(1)** |
| `ajouterG()` | **O(n)** -- decalage | **O(1)** |
| `oterec()` | **O(n)** -- decalage | **O(1)** |
| `vider()` | O(n) | O(1) |

L'implementation chainee gagne pour les insertions/suppressions frequentes. L'implementation tableau a une meilleure localite de cache pour les lectures sequentielles.
