---
title: "Hash Tables (Tables de Hachage)"
sidebar_position: 4
---

# Hash Tables (Tables de Hachage)

## Theory

A **hash table** maps keys to values using a **hash function** that computes an index into an array of buckets.

```
  Key: "hello"  --->  hashCode("hello") = 42  --->  table[42] = value
```

### Hash Function

A hash function `h(key)` must satisfy:
1. **Deterministic**: same key always gives same hash
2. **Uniform**: keys spread evenly across the table
3. **Fast**: O(1) computation

### Collision Resolution

When two keys hash to the same index:

#### 1. Chaining (Chainage) -- Used in SDD TPs

Each bucket stores a linked list of entries that hash to that index.

```
  Index:
  [0] -> null
  [1] -> ("hello","bonjour") -> ("hi","salut") -> null
  [2] -> null
  [3] -> ("bye","au revoir") -> null
  [4] -> null
```

- Insert: O(1) (add to head of chain)
- Search: O(k) where k = chain length
- Average case: O(1) if load factor is small

#### 2. Open Addressing (Adressage ouvert)

If bucket is occupied, probe for next free slot.

**Linear probing**: try index+1, index+2, ...
**Quadratic probing**: try index+1, index+4, index+9, ...
**Double hashing**: use a second hash function for step size

```
  h("hello") = 3, h("world") = 3 (collision!)

  Linear probing:
  [0]      [1]      [2]      [3]       [4]
  empty    empty    empty    "hello"   "world"  <- placed at 3+1
```

### Load Factor

**alpha = n / m** where n = number of entries, m = table size

| alpha | Performance | Action |
|-------|-------------|--------|
| < 0.5 | Excellent | -- |
| 0.5-0.75 | Good | -- |
| 0.75-1.0 | Degrading | Consider resize |
| > 1.0 | Bad (chaining only) | Must resize |

### Rehashing

When load factor exceeds threshold:
1. Create new table of larger size (typically 2x)
2. Recompute hash for every existing entry
3. Insert into new table

Amortized cost of n insertions with doubling: O(n) total, O(1) amortized per insert.


## Java Implementation (from TP4-5)

### Custom Hash Function (Word class, TP5)

```java
public class Word {
    private final String word;

    public Word(String s) {
        if (s == null || s.equals(""))
            throw new IllegalArgumentException();
        this.word = s.toLowerCase();
    }

    @Override
    public boolean equals(Object o) {
        if (o == null) return false;
        if (o.getClass() != this.getClass()) return false;
        Word wo = (Word) o;
        return wo.word.equals(this.word);
    }

    @Override
    public int hashCode() {
        // Uses first 2 characters for a simple hash
        if (this.word.length() > 2)
            return this.word.charAt(0) * 26 + this.word.charAt(1);
        else
            return this.word.charAt(0) * 26;
    }
}
```

**Important contract**: If `a.equals(b)` then `a.hashCode() == b.hashCode()`.
The reverse is not required (two different objects can have the same hash -- that is a collision).

### Hash Table with Chaining (TableCouples, TP5)

```java
public class TableCouples {
    private final List<Couple>[] lists;

    public TableCouples() {
        this.lists = new ArrayList[256 * 26 + 256];  // fixed size
    }

    public boolean ajouter(Word w, Word t) {
        int hashcode = w.hashCode();
        if (this.lists[hashcode] == null)
            this.lists[hashcode] = new ArrayList<>();

        Couple new_couple = new Couple(w, t);
        // Check if key already exists -> update
        for (int idx = 0; idx < this.lists[hashcode].size(); idx++) {
            Word old = this.lists[hashcode].get(idx).compCoupleMot(w);
            if (old != null) {
                this.lists[hashcode].set(idx, new_couple);
                return !old.equals(t);  // true if translation changed
            }
        }
        return this.lists[hashcode].add(new_couple);
    }

    public Word traduire(Word w) {
        int hashcode = w.hashCode();
        if (this.lists[hashcode] == null) return null;
        for (Couple c : this.lists[hashcode]) {
            Word answer = c.compCoupleMot(w);
            if (answer != null) return answer;
        }
        return null;
    }
}
```

### Using java.util.HashMap (TP4 -- TimeTable)

```java
public class TimeTable {
    // teacher -> (schedule -> courseName)
    private final Map<String, Map<Schedule, String>> data;

    public TimeTable(List<String> teachers) {
        this.data = new HashMap<>();
        for (String teacher : teachers)
            this.data.put(teacher, new HashMap<>());
    }

    public boolean addCourse(String teacher, DayOfWeek dow,
                             int startHour, String courseName) {
        // putIfAbsent returns null if key was absent (success)
        return this.data.get(teacher)
            .putIfAbsent(new Schedule(dow, startHour), courseName) == null;
    }
}
```

### Proper equals/hashCode (Schedule, TP4)

```java
public class Schedule {
    private final DayOfWeek dow;
    private final int start_hour;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        if (this.getClass() != o.getClass()) return false;
        Schedule sch = (Schedule) o;
        return this.dow.equals(sch.dow) && this.start_hour == sch.start_hour;
    }

    @Override
    public int hashCode() {
        return this.dow.hashCode() * 31 + this.start_hour;
    }
}
```

**Rule of thumb for hashCode**: multiply by a prime (31 is standard in Java), combine fields.


## ASCII Visualization: Chaining

```
TableCouples with words "ab", "ac", "ba", "bb":

h("ab") = 'a'*26 + 'b' = 97*26 + 98 = 2620
h("ac") = 'a'*26 + 'c' = 97*26 + 99 = 2621
h("ba") = 'b'*26 + 'a' = 98*26 + 97 = 2645
h("bb") = 'b'*26 + 'b' = 98*26 + 98 = 2646

Table:
  [2620] -> [("ab", trad_ab)]
  [2621] -> [("ac", trad_ac)]
  ...
  [2645] -> [("ba", trad_ba)]
  [2646] -> [("bb", trad_bb)]

No collisions! Good hash function.

Now suppose h("xy") = h("xz") = same_index (collision):
  [same_index] -> [("xy", trad_xy)] -> [("xz", trad_xz)]
```


## Complexity

| Operation | Average Case | Worst Case | Notes |
|-----------|-------------|------------|-------|
| Insert (chaining) | O(1) | O(n) | Worst: all keys collide |
| Search (chaining) | O(1) | O(n) | Average depends on alpha |
| Delete (chaining) | O(1) | O(n) | Same as search |
| Insert (open addr.) | O(1) | O(n) | Degrades as alpha -> 1 |
| Rehash | O(n) | O(n) | Must reinsert all entries |

### Amortized Analysis with Rehashing

If we double the table when alpha > threshold:
- n insertions cost O(n) total (geometric series: n + n/2 + n/4 + ...)
- Amortized cost per insertion: O(1)


## Common Exam Patterns

1. **Implement hashCode** for a given class
2. **Trace insertion** into a hash table (show chaining or probing)
3. **Compute load factor** and decide whether to rehash
4. **Compare** hash table vs. BST for a given use case


## CHEAT SHEET

```
HASH TABLE
==========
h(key) -> index into array of buckets

CHAINING:                    OPEN ADDRESSING:
  bucket[i] = linked list      bucket[i] = single entry
  alpha can be > 1             alpha must be < 1
  no clustering                clustering problems

LOAD FACTOR: alpha = n/m     (n entries, m buckets)
  alpha < 0.75 -> good       alpha -> 1 -> bad

REHASH: new table 2x size, reinsert all entries

equals/hashCode CONTRACT:
  a.equals(b) => a.hashCode() == b.hashCode()
  a.hashCode() == b.hashCode() does NOT imply a.equals(b)

JAVA:
  HashMap<K,V>  -- unordered, O(1) avg
  TreeMap<K,V>  -- sorted by key, O(log n)
  HashSet<T>    -- unordered set, O(1) avg
  TreeSet<T>    -- sorted set, O(log n)
```
