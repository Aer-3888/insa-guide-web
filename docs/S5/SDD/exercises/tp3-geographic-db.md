---
title: "TP3 - Base de Donnees Geographique"
sidebar_position: 3
---

# TP3 - Base de Donnees Geographique

> D'apres les consignes de l'enseignant : `S5/SDD/data/moodle/tp/tp3_geographic_db/README.md`

## Objectif

Appliquer les patterns de listes et iterateurs des TP1-TP2 pour construire une base de donnees geographique. Adapter les structures de donnees personnalisees a `java.util.List` en utilisant le pattern Adapter.

## Fichiers

| Fichier | Role | Statut |
|---------|------|--------|
| `src/main/Liste.java` | Interface liste personnalisee (du TP2) | Fourni |
| `src/main/Iterateur.java` | Interface iterateur personnalise (du TP2) | Fourni |
| `src/main/ListeDoubleChainee.java` | Liste doublement chainee (du TP2) | Fourni |
| `src/main/ListeDoubleChaineeIterateur.java` | Iterateur pour chainage (du TP2) | Fourni |
| `src/main/ListeTabulee.java` | Liste avec tableau (du TP2) | Fourni |
| `src/main/ListeTabuleeIterateur.java` | Iterateur pour tableau (du TP2) | Fourni |
| `src/main/IterateurEngine.java` | Adaptateur : Iterateur vers java.util.Iterator | **A ecrire** |
| `src/main/ListeEngine.java` | Adaptateur : Liste vers java.util.List | **A ecrire** |
| `src/main/Coordonnees.java` | Classe valeur coordonnees GPS | **A ecrire** |
| `src/main/Enregistrement.java` | Enregistrement ville (nom, coords, population) | **A ecrire** |
| `src/main/BdGeographique.java` | Base de donnees geographique | **A ecrire** |

## Architecture

```
java.util.List<T>           java.util.Iterator<T>
       ^                            ^
       |  implements                |  implements
  ListeEngine<T>             IterateurEngine<T>
       |                            |
       | wraps                      | wraps
       v                            v
  Liste<T>                    Iterateur<T>
       ^                            ^
       |  implements                |  implements
  ListeDoubleChainee<T>    ListeDoubleChaineeIterateur<T>
  ListeTabulee<T>           ListeTabuleeIterateur<T>
```

Le pattern Adapter permet d'utiliser les structures du TP2 avec les API standard Java (boucles for-each, methodes `java.util.List`) sans modifier les originaux.

---

## Exercice 1

### Implementer IterateurEngine -- adapter Iterateur\<T\> vers java.util.Iterator\<T\>

**Reponse :**

```java
package main;

import java.util.Iterator;

public class IterateurEngine<T> implements Iterator<T> {
    private final Iterateur<T> it;

    public IterateurEngine(Liste<T> dt) {
        this.it = dt.iterateur();
        this.it.entete();  // Positionner le curseur sur le premier element reel
    }

    @Override
    public boolean hasNext() {
        return !this.it.estSorti();
    }

    @Override
    public T next() {
        T ret = this.it.valec();
        this.it.succ();
        return ret;
    }
}
```

**Fonctionnement du code :**
- `entete()` dans le constructeur deplace le curseur de la sentinelle head au premier element reel.
- `hasNext()` correspond a `!estSorti()`.
- `next()` combine `valec()` (obtenir la valeur) et `succ()` (avancer).

---

## Exercice 2

### Implementer ListeEngine -- adapter Liste\<T\> vers java.util.List\<T\>

Wrapper qui expose une interface `java.util.List<T>`, permettant les operations standard Java (`add()`, `remove()`, `contains()`, `size()`) et les boucles for-each.

**Reponse :**

```java
package main;

import java.util.*;

public class ListeEngine<T> implements List<T> {
    private final Liste<T> lst;

    public ListeEngine(Liste<T> lst) {
        this.lst = lst;
    }

    @Override
    public Iterator<T> iterator() {
        return new IterateurEngine<>(this.lst);
    }

    @Override
    public boolean add(T e) {
        Iterateur<T> it = this.lst.iterateur();
        it.enqueue();       // Aller au dernier element
        it.ajouterD(e);     // Inserer apres (a la fin)
        return true;
    }

    @Override
    public boolean remove(Object o) {
        Iterateur<T> it = this.lst.iterateur();
        it.entete();
        while (!it.estSorti()) {
            if (it.valec() == o) {
                it.oterec();
                return true;
            } else {
                it.succ();
            }
        }
        return false;
    }

    @Override
    public boolean contains(Object o) {
        Iterateur<T> it = this.lst.iterateur();
        it.entete();
        while (!it.estSorti()) {
            if (it.valec() == o) return true;
            it.succ();
        }
        return false;
    }

    @Override
    public int size() {
        int ret = 0;
        for (Object k : this) ret++;
        return ret;
    }

    @Override
    public boolean isEmpty() {
        return this.lst.estVide();
    }

    @Override
    public void clear() {
        this.lst.vider();
    }

    @Override
    public T get(int i) {
        Iterateur<T> it = this.lst.iterateur();
        it.entete();
        for (; i > 0; i--) it.succ();
        return it.valec();
    }

    // --- Operations optionnelles non supportees ---
    @Override public Object[] toArray() { throw new UnsupportedOperationException(); }
    @Override public <E> E[] toArray(E[] a) { throw new UnsupportedOperationException(); }
    @Override public boolean containsAll(Collection<?> c) { throw new UnsupportedOperationException(); }
    @Override public boolean addAll(Collection<? extends T> c) { throw new UnsupportedOperationException(); }
    @Override public boolean addAll(int index, Collection<? extends T> c) { throw new UnsupportedOperationException(); }
    @Override public boolean removeAll(Collection<?> c) { throw new UnsupportedOperationException(); }
    @Override public boolean retainAll(Collection<?> c) { throw new UnsupportedOperationException(); }
    @Override public T set(int index, T element) { throw new UnsupportedOperationException(); }
    @Override public void add(int index, T element) { throw new UnsupportedOperationException(); }
    @Override public T remove(int index) { throw new UnsupportedOperationException(); }
    @Override public int indexOf(Object o) { throw new UnsupportedOperationException(); }
    @Override public int lastIndexOf(Object o) { throw new UnsupportedOperationException(); }
    @Override public ListIterator<T> listIterator() { throw new UnsupportedOperationException(); }
    @Override public ListIterator<T> listIterator(int index) { throw new UnsupportedOperationException(); }
    @Override public List<T> subList(int fromIndex, int toIndex) { throw new UnsupportedOperationException(); }
}
```

**Fonctionnement du code :**
- `add(T e)` navigue jusqu'a la queue avant d'inserer : `enqueue()` positionne le curseur sur le dernier element reel, puis `ajouterD(e)` insere apres.
- `remove(Object o)` utilise `==` (identite) et non `.equals()` -- c'est une limitation connue de l'implementation de l'etudiant.
- `size()` est O(n) car la `Liste` sous-jacente ne maintient pas de compteur.
- `get(int i)` est O(i) -- acces sequentiel depuis le debut.

---

## Exercice 3

### Implementer Coordonnees -- coordonnees geographiques

Classe valeur representant des coordonnees GPS (latitude, longitude) avec `equals()` correct pour les recherches.

**Reponse :**

```java
package main;

public class Coordonnees {
    private double latitude;
    private double longitude;

    public Coordonnees(double lat, double lon) {
        this.latitude = lat;
        this.longitude = lon;
    }

    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }

    @Override
    public String toString() {
        return "(" + latitude + ", " + longitude + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Coordonnees)) return false;
        Coordonnees c = (Coordonnees) o;
        return latitude == c.latitude && longitude == c.longitude;
    }

    @Override
    public int hashCode() {
        return Double.hashCode(latitude) * 31 + Double.hashCode(longitude);
    }
}
```

**Fonctionnement du code :**
`equals()` est essentiel car `BdGeographique.coord()` cherche par coordonnees. Sans `equals()`, deux objets `Coordonnees` avec les memes latitude/longitude ne correspondraient pas.

---

## Exercice 4

### Implementer Enregistrement -- enregistrement de ville

Stocker le nom d'une ville, ses coordonnees GPS et sa population.

**Reponse :**

```java
package main;

public class Enregistrement {
    private String cityName;
    private Coordonnees coordinates;
    private int population;

    public Enregistrement(String name, Coordonnees coords, int pop) {
        this.cityName = name;
        this.coordinates = coords;
        this.population = pop;
    }

    public String getCityName() { return cityName; }
    public Coordonnees getCoordinates() { return coordinates; }
    public int getPopulation() { return population; }

    @Override
    public String toString() {
        return cityName + " " + coordinates + " pop=" + population;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Enregistrement)) return false;
        Enregistrement e = (Enregistrement) o;
        return cityName.equals(e.cityName)
            && coordinates.equals(e.coordinates)
            && population == e.population;
    }

    @Override
    public int hashCode() {
        return cityName.hashCode() * 31 * 31
            + coordinates.hashCode() * 31
            + population;
    }
}
```

**Fonctionnement du code :**
`equals()` compare les trois champs. Deux enregistrements sont egaux seulement si le nom, les coordonnees et la population correspondent tous.

---

## Exercice 5

### Implementer BdGeographique -- la base de donnees geographique

Construire une base de donnees d'enregistrements de villes utilisant `ListeEngine` pour wrapper une `ListeDoubleChainee`. Implementer ajouter, retirer, rechercher et agreger.

**Reponse :**

```java
package main;

import java.util.List;

public class BdGeographique {
    private final List<Enregistrement> data;

    public BdGeographique() {
        // Wrapper la liste personnalisee dans l'adaptateur pour compatibilite java.util.List
        this.data = new ListeEngine<>(new ListeDoubleChainee<>());
    }

    // --- Ajouter une ville (empecher les doublons) ---
    public void ajouter(Enregistrement e) {
        if (!this.data.contains(e))
            this.data.add(e);
    }

    // --- Retirer une ville ---
    public void retirer(Enregistrement e) {
        this.data.remove(e);
    }

    // --- Verifier si une ville existe ---
    public boolean estPresent(Enregistrement e) {
        for (Enregistrement k : this.data) {
            if (k.equals(e))
                return true;
        }
        return false;
    }

    // --- Rechercher par nom ---
    public Enregistrement ville(String v) {
        for (Enregistrement k : this.data) {
            if (k == null) continue;
            if (k.getCityName().equals(v))
                return k;
        }
        return null;
    }

    // --- Rechercher par coordonnees ---
    public Enregistrement coord(Coordonnees c) {
        for (Enregistrement k : this.data) {
            if (k == null) continue;
            if (c.equals(k.getCoordinates()))
                return k;
        }
        return null;
    }

    // --- Retirer toutes les villes avec un nom donne ---
    public void retirerVille(String v) {
        Enregistrement k = this.ville(v);
        while (k != null) {
            this.retirer(k);
            k = this.ville(v);
        }
    }

    // --- Retirer toutes les villes aux coordonnees donnees ---
    public void retirerCoord(Coordonnees c) {
        Enregistrement k = this.coord(c);
        while (k != null) {
            this.retirer(k);
            k = this.coord(c);
        }
    }

    // --- Somme des populations ---
    public int population() {
        int res = 0;
        for (Enregistrement k : this.data) {
            if (k == null) continue;
            res += k.getPopulation();
        }
        return res;
    }

    // --- Vider la base ---
    public void vider() {
        this.data.clear();
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("BdGeographique:\n");
        for (Enregistrement k : this.data) {
            sb.append("  ").append(k).append("\n");
        }
        return sb.toString();
    }
}
```

**Fonctionnement du code :**
- La ligne clef est `new ListeEngine<>(new ListeDoubleChainee<>())` : `BdGeographique` ne voit qu'un `java.util.List<Enregistrement>`, mais les donnees sont stockees dans la liste doublement chainee du TP2.
- `retirerVille` utilise une boucle car un nom peut apparaitre plusieurs fois.
- Toutes les recherches sont des scans lineaires O(n). Pour de meilleurs performances, il faudrait des tables de hachage (TP5) ou des structures spatiales (TP7).

---

## Exercice 6

### Changer l'implementation sous-jacente

Comment utiliser une liste tableau au lieu d'une liste chainee ?

**Reponse :**

Le changement est une seule ligne dans le constructeur :

```java
// Avant : liste chainee
this.data = new ListeEngine<>(new ListeDoubleChainee<>());

// Apres : liste tableau
this.data = new ListeEngine<>(new ListeTabulee<>());

// Alternative : liste Java standard (pas besoin d'adaptateur)
this.data = new java.util.LinkedList<>();

// Alternative : ArrayList Java standard
this.data = new java.util.ArrayList<>();
```

**Fonctionnement du code :**
Les quatre options produisent un comportement identique pour `BdGeographique`. Les seules differences sont les caracteristiques de performance et les limites de capacite (`ListeTabulee` a TMAX=1000).

---

## Analyse de complexite

| Operation | Temps | Note |
|-----------|-------|------|
| `ajouter` | O(n) | Verification des doublons O(n) + ajout O(1) |
| `retirer` | O(n) | Recherche lineaire + suppression O(1) |
| `estPresent` | O(n) | Scan lineaire |
| `ville(nom)` | O(n) | Scan lineaire, retourne la premiere correspondance |
| `coord(coords)` | O(n) | Scan lineaire, retourne la premiere correspondance |
| `retirerVille(nom)` | O(n^2) | Recherche-et-suppression repetee |
| `population()` | O(n) | Parcours unique |
| `vider()` | O(1) | Relie les sentinelles |

## Erreurs courantes

1. **Ne pas appeler `entete()` dans le constructeur de IterateurEngine** -- Sans cela, l'iterateur commence sur la sentinelle et `hasNext()` retourne false immediatement sur une liste non vide.
2. **Utiliser `==` au lieu de `.equals()` dans `ListeEngine.remove()`** -- L'implementation etudiant utilise la comparaison par identite. Cela signifie que `remove(new Enregistrement("Paris", ...))` ne trouvera PAS un enregistrement correspondant sauf si on passe exactement la meme reference objet.
3. **Assumer que `size()` est O(1)** -- La `Liste` sous-jacente ne maintient pas de compteur. Appeler `size()` dans une boucle produit un comportement O(n^2).
