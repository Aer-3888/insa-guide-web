---
title: "TP05 - Hash Tables and Dictionaries"
sidebar_position: 5
---

# TP05 - Hash Tables and Dictionaries

## Objective

Implement a **bilingual dictionary** using hash tables to achieve O(1) average lookup time.

## Domain Model

### `Word` - Dictionary Word

```java
public class Word {
    private String text;
    private String language;
    
    public Word(String text, String lang) {
        this.text = text;
        this.language = lang;
    }
    
    @Override
    public int hashCode() {
        // Custom hash function (see below)
    }
    
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Word)) return false;
        Word w = (Word) o;
        return text.equals(w.text) && language.equals(w.language);
    }
}
```

### `Couple` - Translation Pair

```java
public class Couple {
    private Word source;
    private Word translation;
    
    public Couple(Word src, Word trans) {
        this.source = src;
        this.translation = trans;
    }
    
    // Check if this couple contains given word, return its translation
    public Word compCoupleMot(Word w) {
        if (source.equals(w)) return translation;
        if (translation.equals(w)) return source;
        return null;
    }
}
```

### `TableCouples` - Dictionary

```java
public class TableCouples {
    private List<Couple>[] lists;  // Array of collision chains
    
    public TableCouples() {
        // Size formula: 256 * 26 + 256 = 6912 slots
        // (covers letter combinations + single chars)
        this.lists = new ArrayList[256 * 26 + 256];
    }
    
    public boolean ajouter(Word w, Word t) { ... }
    public Word traduire(Word w) { ... }
}
```

## Hash Function Design

### Goals of a Good Hash Function

1. **Uniform distribution**: Spread keys evenly across table
2. **Deterministic**: Same input always gives same hash
3. **Fast to compute**: O(1) time
4. **Minimize collisions**: Different inputs rarely collide

### Implementation for `Word`

```java
@Override
public int hashCode() {
    int hash = 0;
    String key = text + language;  // Combine text and language
    
    for (int i = 0; i < Math.min(key.length(), 2); i++) {
        hash = hash * 31 + key.charAt(i);
    }
    
    return Math.abs(hash) % (256 * 26 + 256);
}
```

**Explanation:**
- Use first 2 characters of combined string
- Multiply by prime (31) for better distribution
- Modulo by table size to fit in array bounds
- `Math.abs()` handles negative hashes

### Alternative: Java's Default

```java
@Override
public int hashCode() {
    return Objects.hash(text, language);
}
```

Java's `Objects.hash()` provides good default distribution.

## Implementation

### Add Translation

```java
public boolean ajouter(Word w, Word t) {
    if (w == null || t == null) {
        throw new IllegalArgumentException("Words cannot be null");
    }
    
    int hashcode = w.hashCode();
    
    // Initialize chain if needed
    if (this.lists[hashcode] == null) {
        this.lists[hashcode] = new ArrayList<>();
    }
    
    Couple newCouple = new Couple(w, t);
    
    // Check if word already exists, update translation
    for (int idx = 0; idx < this.lists[hashcode].size(); idx++) {
        Word oldTranslation = this.lists[hashcode].get(idx).compCoupleMot(w);
        if (oldTranslation != null) {
            this.lists[hashcode].set(idx, newCouple);
            return !oldTranslation.equals(t);  // true if translation changed
        }
    }
    
    // Word doesn't exist, add new entry
    return this.lists[hashcode].add(newCouple);
}
```

**Complexity:**
- Hash computation: O(1)
- Find in chain: O(k) where k = chain length (typically small)
- **Average**: O(1) with good hash function

### Translate Word

```java
public Word traduire(Word w) {
    // Linear search through all chains (inefficient!)
    for (List<Couple> lst : this.lists) {
        if (lst == null) continue;
        for (Couple attempt : lst) {
            Word answer = attempt.compCoupleMot(w);
            if (answer != null) {
                return answer;
            }
        }
    }
    return null;
}
```

**Problem**: This implementation searches ALL chains, not just the correct one!

**Optimized version:**

```java
public Word traduire(Word w) {
    int hashcode = w.hashCode();
    List<Couple> chain = this.lists[hashcode];
    
    if (chain == null) return null;
    
    for (Couple c : chain) {
        Word translation = c.compCoupleMot(w);
        if (translation != null) {
            return translation;
        }
    }
    
    return null;
}
```

**Complexity:** O(1) average, O(k) worst case (k = chain length)

## Collision Handling: Chaining

When multiple keys hash to the same index, store them in a **linked list** (or `ArrayList`):

```
Index:  Value:
[0]  -> null
[1]  -> [("hello","bonjour")] -> [("hi","salut")] -> null
[2]  -> null
[3]  -> [("bye","au revoir")] -> null
```

### Load Factor

**Load factor α = n / m** where:
- n = number of entries
- m = table size

- α < 0.7: Good performance
- α > 0.9: Many collisions, consider resizing
- α > 1: More entries than slots (chaining required)

### Dynamic Resizing

```java
private void resize() {
    List<Couple>[] oldLists = this.lists;
    int newSize = lists.length * 2;
    this.lists = new ArrayList[newSize];
    
    // Rehash all entries
    for (List<Couple> chain : oldLists) {
        if (chain == null) continue;
        for (Couple c : chain) {
            // Re-add with new hash (due to new table size)
            ajouter(c.getSource(), c.getTranslation());
        }
    }
}

public boolean ajouter(Word w, Word t) {
    // Check load factor
    if ((double) numEntries / lists.length > 0.75) {
        resize();
    }
    
    // ... rest of add logic
}
```

## Usage Example

```java
TableCouples dict = new TableCouples();

// Add English -> French translations
dict.ajouter(new Word("hello", "en"), new Word("bonjour", "fr"));
dict.ajouter(new Word("goodbye", "en"), new Word("au revoir", "fr"));
dict.ajouter(new Word("cat", "en"), new Word("chat", "fr"));
dict.ajouter(new Word("dog", "en"), new Word("chien", "fr"));

// Translate English to French
Word translation = dict.traduire(new Word("hello", "en"));
System.out.println(translation.getText());  // "bonjour"

// Translate French to English (bidirectional)
Word reverse = dict.traduire(new Word("chat", "fr"));
System.out.println(reverse.getText());  // "cat"

// Update translation
dict.ajouter(new Word("hello", "en"), new Word("salut", "fr"));
// Now "hello" translates to "salut" instead of "bonjour"

// Unknown word
Word unknown = dict.traduire(new Word("computer", "en"));
System.out.println(unknown);  // null
```

## Performance Analysis

### Time Complexity

| Operation | Average | Worst Case | Notes |
|-----------|---------|------------|-------|
| Add | O(1) | O(n) | Worst: all keys collide |
| Translate | O(1) | O(n) | Worst: long chain |
| Update | O(1) | O(n) | Same as add |

### Space Complexity

O(n + m) where:
- n = number of entries
- m = table size

**Trade-off**: Larger m = fewer collisions but more memory

### Comparison with Other Structures

| Structure | Search | Insert | Delete | Ordered? |
|-----------|--------|--------|--------|----------|
| Array (unsorted) | O(n) | O(1) | O(n) | No |
| Array (sorted) | O(log n) | O(n) | O(n) | Yes |
| Linked List | O(n) | O(1) | O(n) | No |
| **Hash Table** | **O(1)** | **O(1)** | **O(1)** | **No** |
| BST | O(log n) | O(log n) | O(log n) | Yes |

Hash tables win for **fast lookup**, but don't maintain order.

## Testing

```java
@Test
public void testAddAndTranslate() {
    TableCouples dict = new TableCouples();
    Word en = new Word("hello", "en");
    Word fr = new Word("bonjour", "fr");
    
    dict.ajouter(en, fr);
    
    Word translated = dict.traduire(en);
    assertEquals("bonjour", translated.getText());
    assertEquals("fr", translated.getLanguage());
}

@Test
public void testBidirectional() {
    TableCouples dict = new TableCouples();
    Word en = new Word("cat", "en");
    Word fr = new Word("chat", "fr");
    
    dict.ajouter(en, fr);
    
    assertEquals("chat", dict.traduire(en).getText());
    assertEquals("cat", dict.traduire(fr).getText());
}

@Test
public void testUpdateTranslation() {
    TableCouples dict = new TableCouples();
    Word en = new Word("hello", "en");
    Word fr1 = new Word("bonjour", "fr");
    Word fr2 = new Word("salut", "fr");
    
    dict.ajouter(en, fr1);
    dict.ajouter(en, fr2);  // Update
    
    Word translated = dict.traduire(en);
    assertEquals("salut", translated.getText());
}

@Test
public void testCollisions() {
    // Add words that hash to same index
    // Verify both can be retrieved correctly
}
```

## Extensions

### 1. Multiple Translations

Some words have multiple translations:

```java
public class TableCouples {
    private Map<Word, List<Word>> translations;
    
    public void ajouter(Word w, Word t) {
        translations.computeIfAbsent(w, k -> new ArrayList<>()).add(t);
    }
    
    public List<Word> traduireAll(Word w) {
        return translations.getOrDefault(w, Collections.emptyList());
    }
}
```

### 2. Context-Aware Translation

```java
public Word traduire(Word w, String context) {
    List<Word> candidates = traduireAll(w);
    return candidates.stream()
        .filter(t -> t.getContext().equals(context))
        .findFirst()
        .orElse(null);
}
```

### 3. Fuzzy Matching

```java
public List<Word> findSimilar(Word w) {
    // Use edit distance (Levenshtein)
    // Return words within distance threshold
}
```

### 4. Statistics

```java
public Map<String, Integer> getLanguageStats() {
    Map<String, Integer> stats = new HashMap<>();
    for (List<Couple> chain : lists) {
        if (chain == null) continue;
        for (Couple c : chain) {
            String lang = c.getSource().getLanguage();
            stats.put(lang, stats.getOrDefault(lang, 0) + 1);
        }
    }
    return stats;
}
```

## Common Pitfalls

1. **Poor hash function**: Causes many collisions
   ```java
   // BAD: Always returns same hash
   public int hashCode() { return 0; }
   
   // GOOD: Distributes well
   public int hashCode() { return Objects.hash(text, language); }
   ```

2. **Forgetting to override `equals()`**: Hash table needs both
   ```java
   @Override
   public boolean equals(Object o) {
       // Must implement!
   }
   ```

3. **Not handling null**: Causes `NullPointerException`
   ```java
   public boolean ajouter(Word w, Word t) {
       if (w == null || t == null) {
           throw new IllegalArgumentException();
       }
       // ...
   }
   ```

4. **Searching all chains**: Defeats purpose of hashing
   ```java
   // BAD: O(n) search
   for (List<Couple> chain : lists) {
       // search all...
   }
   
   // GOOD: O(1) direct access
   List<Couple> chain = lists[w.hashCode()];
   ```

## See Also

- **TP04**: Hash tables for scheduling
- [Java HashMap](https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html)
- [Hash Function Design](https://en.wikipedia.org/wiki/Hash_function)
- [Load Factor & Rehashing](https://en.wikipedia.org/wiki/Hash_table#Key_statistics)
