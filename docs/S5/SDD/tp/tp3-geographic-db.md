---
title: "TP03 - Base de Donnees Geographique"
sidebar_position: 3
---

# TP03 - Base de Donnees Geographique

## Objectif

Appliquer les patterns de listes et iterateurs des TP01-TP02 pour construire une **base de donnees geographique** permettant de stocker et interroger des informations sur les villes.

Ce TP demontre :
- L'application concrete des structures de donnees abstraites
- Les operations de recherche et de filtrage
- La comparaison de performance entre implementations

## Modele du Domaine

### `Coordonnees` - Coordonnees geographiques

```java
public class Coordonnees {
    private double latitude;
    private double longitude;
    
    public Coordonnees(double lat, double lon) {
        this.latitude = lat;
        this.longitude = lon;
    }
    
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Coordonnees)) return false;
        Coordonnees c = (Coordonnees) o;
        return latitude == c.latitude && longitude == c.longitude;
    }
}
```

### `Enregistrement` - Enregistrement de ville

```java
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
}
```

## Implementation de la Base de Donnees

### `BdGeographique` - Base de Donnees Geographique

Utilise un `List<Enregistrement>` generique en interne, permettant de changer d'implementation :

```java
public class BdGeographique {
    private final List<Enregistrement> data;
    
    public BdGeographique() {
        // Option 1 : bibliotheque standard Java
        // this.data = new LinkedList<>();
        
        // Option 2 : implementation personnalisee du TP02
        this.data = new ListeEngine<>(new ListeDoubleChainee<>());
    }
}
```

### Operations principales

#### 1. Ajouter une ville

```java
public void ajouter(Enregistrement e) {
    if (!this.data.contains(e))
        this.data.add(e);
}
```

**Complexite** : O(n) pour la verification des doublons + O(1) ou O(n) pour l'ajout (selon le type de liste)

#### 2. Retirer une ville

```java
public void retirer(Enregistrement e) {
    this.data.remove(e);
}
```

**Complexite** : O(n) pour trouver + O(1) ou O(n) pour supprimer

#### 3. Verifier la presence

```java
public boolean estPresent(Enregistrement e) {
    for (Enregistrement k : this.data) {
        if (k.equals(e)) return true;
    }
    return false;
}
```

**Complexite** : O(n) recherche lineaire

#### 4. Rechercher par nom

```java
public Enregistrement ville(String v) {
    for (Enregistrement k : this.data) {
        if (k == null) continue;
        if (k.getCityName().equals(v)) return k;
    }
    return null;
}
```

**Complexite** : O(n) recherche lineaire. **Retourne** la premiere ville correspondante, ou `null` si non trouvee.

#### 5. Rechercher par coordonnees

```java
public Enregistrement coord(Coordonnees c) {
    for (Enregistrement k : this.data) {
        if (k == null) continue;
        if (c.equals(k.getCoordinates())) return k;
    }
    return null;
}
```

#### 6. Retirer toutes les villes par nom

```java
public void retirerVille(String v) {
    Enregistrement k = this.ville(v);
    while (k != null) {
        this.retirer(k);
        k = this.ville(v);
    }
}
```

Supprime **toutes** les villes avec le nom donne (gere les doublons).

**Complexite** : O(n^2) dans le pire cas (recherches repetees apres chaque suppression)

#### 7. Population totale

```java
public int population() {
    int res = 0;
    for (Enregistrement k : this.data) {
        if (k == null) continue;
        res += k.getPopulation();
    }
    return res;
}
```

**Complexite** : O(n). **Retourne** la somme des populations de toutes les villes de la base.

## Exemple d'utilisation

```java
BdGeographique bd = new BdGeographique();

Coordonnees paris = new Coordonnees(48.8566, 2.3522);
Enregistrement e1 = new Enregistrement("Paris", paris, 2148327);
bd.ajouter(e1);

Coordonnees rennes = new Coordonnees(48.1173, -1.6778);
Enregistrement e2 = new Enregistrement("Rennes", rennes, 220488);
bd.ajouter(e2);

// Recherche par nom
Enregistrement found = bd.ville("Rennes");
System.out.println("Population: " + found.getPopulation());  // 220488

// Recherche par coordonnees
Enregistrement found2 = bd.coord(paris);
System.out.println("Ville: " + found2.getCityName());  // Paris

// Population totale
System.out.println("Total: " + bd.population());
```

## Considerations de performance

### Choix de la structure de donnees interne

| Operation | ArrayList | LinkedList | HashSet | TreeSet |
|-----------|-----------|------------|---------|---------|
| Ajout | O(1) amorti | O(1) | O(1) | O(log n) |
| Suppression | O(n) | O(n) | O(1) | O(log n) |
| Recherche par nom | O(n) | O(n) | O(1)* | O(log n)* |
| Contains | O(n) | O(n) | O(1) | O(log n) |

*Uniquement si on utilise le nom comme cle de hash / cle de tri

**Implementation actuelle** utilise un `List<Enregistrement>` generique :
- Simple, fonctionne avec n'importe quelle implementation de liste
- Toutes les recherches sont des scans lineaires O(n)
- Bon pour les petits jeux de donnees (< 1000 villes)
- Mauvais pour les grands jeux de donnees

### Strategies d'optimisation

**1. Index par nom (HashMap)**

```java
private Map<String, List<Enregistrement>> nameIndex;

public Enregistrement ville(String v) {
    List<Enregistrement> matches = nameIndex.get(v);
    return (matches != null && !matches.isEmpty()) ? matches.get(0) : null;
}
```

`ville()` devient O(1) au lieu de O(n).

**2. Index spatial (Quadtree, R-tree)**

Pour les requetes geographiques comme "trouver toutes les villes dans un rayon de 50km du point X", utiliser des index spatiaux (voir TP07 pour les quadtrees).

## Pattern Adapter : ListeEngine

La classe `ListeEngine<T>` adapte l'interface personnalisee `Liste` vers l'interface standard `List<T>` de Java :

```java
public class ListeEngine<T> implements List<T> {
    private Liste liste;
    
    public ListeEngine(Liste liste) { this.liste = liste; }
    
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

Cela permet d'utiliser les implementations personnalisees avec les boucles for-each et l'API Stream de Java.

## Voir aussi

- **TP02** : Pattern iterateur utilise en interne
- **TP05** : Tables de hachage pour l'indexation efficace
- **TP07** : Quadtrees pour l'indexation spatiale
