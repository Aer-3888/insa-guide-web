---
title: "TP03 - Geographic Database (Base de Donnees Geographique)"
sidebar_position: 3
---

# TP03 - Geographic Database (Base de Donnees Geographique)

## Objective

Apply the list and iterator patterns from TP01-TP02 to build a **geographic database** for storing and querying city information.

This TP demonstrates:
- Real-world application of abstract data structures
- Search and filtering operations
- Performance comparison between implementations

## Domain Model

### `Coordonnees` - Geographic Coordinates

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

### `Enregistrement` - City Record

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
    
    // Getters
    public String getCityName() { return cityName; }
    public Coordonnees getCoordinates() { return coordinates; }
    public int getPopulation() { return population; }
}
```

## Database Implementation

### `BdGeographique` - Geographic Database

Uses a generic `List<Enregistrement>` internally, allowing you to swap implementations:

```java
public class BdGeographique {
    private final List<Enregistrement> data;
    
    public BdGeographique() {
        // Option 1: Use Java standard library
        // this.data = new LinkedList<>();
        
        // Option 2: Use custom implementation from TP02
        this.data = new ListeEngine<>(new ListeDoubleChainee<>());
    }
    
    // ... methods
}
```

### Core Operations

#### 1. Add City

```java
public void ajouter(Enregistrement e) {
    if (!this.data.contains(e))
        this.data.add(e);
}
```

**Complexity**: O(n) for duplicate check + O(1) or O(n) for add (depending on list type)

#### 2. Remove City

```java
public void retirer(Enregistrement e) {
    this.data.remove(e);
}
```

**Complexity**: O(n) to find + O(1) or O(n) to remove

#### 3. Check Presence

```java
public boolean estPresent(Enregistrement e) {
    for (Enregistrement k : this.data) {
        if (k.equals(e))
            return true;
    }
    return false;
}
```

**Complexity**: O(n) linear search

#### 4. Search by Name

```java
public Enregistrement ville(String v) {
    for (Enregistrement k : this.data) {
        if (k == null) continue;
        if (k.getCityName().equals(v))
            return k;
    }
    return null;
}
```

**Complexity**: O(n) linear search

**Returns**: First matching city, or `null` if not found

#### 5. Search by Coordinates

```java
public Enregistrement coord(Coordonnees c) {
    for (Enregistrement k : this.data) {
        if (k == null) continue;
        if (c.equals(k.getCoordinates()))
            return k;
    }
    return null;
}
```

**Complexity**: O(n) linear search

#### 6. Remove All by Name

```java
public void retirerVille(String v) {
    Enregistrement k = this.ville(v);
    while (k != null) {
        this.retirer(k);
        k = this.ville(v);
    }
}
```

Removes **all** cities with the given name (handles duplicates).

**Complexity**: O(n²) in worst case (repeated searches after each deletion)

#### 7. Remove All by Coordinates

```java
public void retirerCoord(Coordonnees c) {
    Enregistrement k = this.coord(c);
    while (k != null) {
        this.retirer(k);
        k = this.coord(c);
    }
}
```

**Complexity**: O(n²) in worst case

#### 8. Total Population

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

**Complexity**: O(n)

**Returns**: Sum of all city populations in the database

#### 9. Clear Database

```java
public void vider() {
    this.data.clear();
}
```

**Complexity**: O(1) or O(n) depending on implementation

## Usage Example

```java
// Create database
BdGeographique bd = new BdGeographique();

// Add cities
Coordonnees paris = new Coordonnees(48.8566, 2.3522);
Enregistrement e1 = new Enregistrement("Paris", paris, 2148327);
bd.ajouter(e1);

Coordonnees rennes = new Coordonnees(48.1173, -1.6778);
Enregistrement e2 = new Enregistrement("Rennes", rennes, 220488);
bd.ajouter(e2);

Coordonnees lyon = new Coordonnees(45.7640, 4.8357);
Enregistrement e3 = new Enregistrement("Lyon", lyon, 513275);
bd.ajouter(e3);

// Search by name
Enregistrement found = bd.ville("Rennes");
System.out.println("Population: " + found.getPopulation());  // 220488

// Search by coordinates
Enregistrement found2 = bd.coord(paris);
System.out.println("City: " + found2.getCityName());  // Paris

// Total population
System.out.println("Total: " + bd.population());  // 2882090

// Remove city
bd.retirerVille("Lyon");
System.out.println("After removal: " + bd.population());  // 2368815

// Display all
System.out.println(bd);
```

## Performance Considerations

### Choice of Internal Data Structure

| Operation | ArrayList | LinkedList | HashSet | TreeSet |
|-----------|-----------|------------|---------|---------|
| Add | O(1) amortized | O(1) | O(1) | O(log n) |
| Remove | O(n) | O(n) | O(1) | O(log n) |
| Search by name | O(n) | O(n) | O(1)* | O(log n)* |
| Contains | O(n) | O(n) | O(1) | O(log n) |

*Only if using name as hash key / sort key

**Current Implementation** uses generic `List<Enregistrement>`:
- Simple, works with any list implementation
- All searches are O(n) linear scans
- Good for small datasets (< 1000 cities)
- Poor for large datasets

### Optimization Strategies

**1. Index by Name (HashMap)**

```java
private Map<String, List<Enregistrement>> nameIndex;

public void ajouter(Enregistrement e) {
    data.add(e);
    nameIndex.computeIfAbsent(e.getCityName(), k -> new ArrayList<>()).add(e);
}

public Enregistrement ville(String v) {
    List<Enregistrement> matches = nameIndex.get(v);
    return (matches != null && !matches.isEmpty()) ? matches.get(0) : null;
}
```

Now `ville()` is O(1) instead of O(n)!

**2. Index by Coordinates (HashMap)**

```java
private Map<Coordonnees, Enregistrement> coordIndex;

public Enregistrement coord(Coordonnees c) {
    return coordIndex.get(c);  // O(1)
}
```

**3. Spatial Index (Quadtree, R-tree)**

For geographic queries like "find all cities within 50km of point X", use spatial indexes (see TP07 for quadtrees).

## Testing

Test both implementations to verify behavior is identical:

```java
@Test
public void testWithArrayList() {
    BdGeographique bd = new BdGeographique();  // Uses ArrayList internally
    testCommonOperations(bd);
}

@Test
public void testWithLinkedList() {
    // Modify constructor to use LinkedList
    BdGeographique bd = new BdGeographique();
    testCommonOperations(bd);
}

private void testCommonOperations(BdGeographique bd) {
    Enregistrement e = new Enregistrement("Test", new Coordonnees(0, 0), 100);
    bd.ajouter(e);
    assertTrue(bd.estPresent(e));
    assertEquals(100, bd.population());
    bd.retirer(e);
    assertFalse(bd.estPresent(e));
}
```

## Adapter Pattern: ListeEngine

The `ListeEngine<T>` class adapts the custom `Liste` interface to Java's standard `List<T>` interface:

```java
public class ListeEngine<T> implements List<T> {
    private Liste liste;
    
    public ListeEngine(Liste liste) {
        this.liste = liste;
    }
    
    @Override
    public boolean add(T e) {
        Iterateur it = liste.iterateur();
        if (liste.estVide()) {
            it.entete();
        } else {
            it.enqueue();
        }
        liste.ajouterD(e);
        return true;
    }
    
    @Override
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            Iterateur it = liste.iterateur();
            { it.entete(); }  // Initialize at head
            
            public boolean hasNext() {
                return !it.estSorti();
            }
            
            public T next() {
                if (it.estSorti()) throw new NoSuchElementException();
                T val = (T) it.valec();
                it.succ();
                return val;
            }
        };
    }
    
    // Implement other List methods...
}
```

This allows using custom implementations with Java's for-each loops and stream API:

```java
Liste customList = new ListeDoubleChainee<>();
List<Enregistrement> standardList = new ListeEngine<>(customList);

// Now can use standard Java features
for (Enregistrement e : standardList) {
    System.out.println(e.getCityName());
}

standardList.stream()
    .filter(e -> e.getPopulation() > 100000)
    .forEach(System.out::println);
```

## Real-World Extensions

### 1. Range Queries

Find cities within a population range:

```java
public List<Enregistrement> citiesInPopulationRange(int min, int max) {
    List<Enregistrement> result = new ArrayList<>();
    for (Enregistrement e : data) {
        int pop = e.getPopulation();
        if (pop >= min && pop <= max) {
            result.add(e);
        }
    }
    return result;
}
```

### 2. Geographic Proximity

Find cities within radius of a point:

```java
public List<Enregistrement> citiesNear(Coordonnees center, double radiusKm) {
    List<Enregistrement> result = new ArrayList<>();
    for (Enregistrement e : data) {
        double distance = center.distanceTo(e.getCoordinates());
        if (distance <= radiusKm) {
            result.add(e);
        }
    }
    return result;
}
```

Requires implementing Haversine distance formula in `Coordonnees`:

```java
public double distanceTo(Coordonnees other) {
    double R = 6371; // Earth radius in km
    double dLat = Math.toRadians(other.latitude - this.latitude);
    double dLon = Math.toRadians(other.longitude - this.longitude);
    double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(Math.toRadians(this.latitude)) * 
               Math.cos(Math.toRadians(other.latitude)) *
               Math.sin(dLon/2) * Math.sin(dLon/2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
```

### 3. Sorting

Sort cities by population:

```java
public List<Enregistrement> citiesByPopulation() {
    List<Enregistrement> sorted = new ArrayList<>(data);
    sorted.sort(Comparator.comparingInt(Enregistrement::getPopulation).reversed());
    return sorted;
}
```

### 4. Statistics

```java
public class PopulationStats {
    public int min, max, mean, median;
    public double stdDev;
}

public PopulationStats getPopulationStats() {
    if (data.isEmpty()) return null;
    
    List<Integer> populations = data.stream()
        .map(Enregistrement::getPopulation)
        .sorted()
        .collect(Collectors.toList());
    
    PopulationStats stats = new PopulationStats();
    stats.min = populations.get(0);
    stats.max = populations.get(populations.size() - 1);
    stats.mean = (int) populations.stream().mapToInt(Integer::intValue).average().orElse(0);
    stats.median = populations.get(populations.size() / 2);
    // stdDev calculation...
    
    return stats;
}
```

## Exercises

1. Add `citiesWithPopulationAbove(int threshold)` method
2. Implement `nearestCity(Coordonnees point)` using distance
3. Add duplicate prevention for exact same name+coordinates
4. Implement pagination: `getCities(int page, int pageSize)`
5. Add `exportToCSV(String filename)` method
6. Create indexes for name and coordinates for O(1) lookup
7. Implement undo/redo for add/remove operations

## See Also

- **TP02**: Iterator pattern used internally
- **TP05**: Hash tables for efficient indexing
- **TP07**: Quadtrees for spatial indexing
- [Java Collections Framework](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/)
