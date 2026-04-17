---
title: "Chapter 4: Data Mining & NLP (Fouille de Donnees et Traitement du Langage)"
sidebar_position: 4
---

# Chapter 4: Data Mining & NLP (Fouille de Donnees et Traitement du Langage)

## Overview

The Data Mining (Fouille de Donnees / FD) part of the course covers unsupervised pattern extraction from data: frequent itemset mining using the Apriori algorithm, association rules, and basic NLP preprocessing for text mining. These techniques are applied in TP3-4 to characterize POI clusters using photo tags.

## 1. Frequent Itemset Mining (Extraction de Motifs Frequents)

### Definitions

| Term | French | Definition |
|------|--------|-----------|
| **Item** | Item | A single element (e.g., "Milk", "rennes", a product) |
| **Itemset** | Motif / Itemset | A set of items (e.g., {Milk, Eggs}) |
| **Transaction** | Transaction | A record containing a set of items (e.g., a shopping basket) |
| **Support** | Support | Fraction of transactions containing the itemset |
| **Frequent itemset** | Motif frequent | An itemset with support >= minimum support threshold |
| **Minimum support** (minsup) | Support minimum | User-defined threshold |

### Support Formula

```
support(X) = |{T in DB : X is subset of T}| / |DB|
```

Where DB is the database of transactions and T is an individual transaction.

**Example**: If 3 out of 5 transactions contain {Eggs, Kidney Beans}, then:
```
support({Eggs, Kidney Beans}) = 3/5 = 0.6 = 60%
```

### Anti-Monotonicity Property (Propriete d'Anti-Monotonie)

**Key theorem**: If an itemset is infrequent, all its supersets are also infrequent.

Contrapositive: If an itemset is frequent, all its subsets are also frequent.

This is the foundation of the Apriori algorithm -- it allows pruning the search space.

## 2. The Apriori Algorithm

### Algorithm Overview

Apriori finds all frequent itemsets by iteratively generating candidates of increasing size and pruning infrequent ones.

```
1. L_1 = {frequent 1-itemsets}  (scan database, count, filter by minsup)
2. For k = 2, 3, ...
   a. C_k = generate candidates from L_{k-1}  (join + prune)
   b. Scan database, count support of each candidate in C_k
   c. L_k = {candidates in C_k with support >= minsup}
   d. If L_k is empty, stop
3. Return union of all L_k
```

### Candidate Generation (Step 2a)

**Join step**: Merge two itemsets from L_{k-1} that share the first k-2 items.

**Prune step**: Remove any candidate that has a (k-1)-subset not in L_{k-1} (by anti-monotonicity, it cannot be frequent).

### Worked Example

**Database**:

| Transaction | Items |
|-------------|-------|
| T1 | Milk, Onion, Nutmeg, Kidney Beans, Eggs, Yogurt |
| T2 | Dill, Onion, Nutmeg, Kidney Beans, Eggs, Yogurt |
| T3 | Milk, Apple, Kidney Beans, Eggs |
| T4 | Milk, Unicorn, Corn, Kidney Beans, Yogurt |
| T5 | Corn, Onion, Kidney Beans, Ice cream, Eggs |

**minsup = 60% (= 3 transactions)**

**Step 1: Frequent 1-itemsets (L_1)**

| Item | Count | Support | Frequent? |
|------|-------|---------|-----------|
| Eggs | 4 | 80% | Yes |
| Kidney Beans | 5 | 100% | Yes |
| Milk | 3 | 60% | Yes |
| Onion | 3 | 60% | Yes |
| Yogurt | 3 | 60% | Yes |
| Corn | 2 | 40% | No |
| Nutmeg | 2 | 40% | No |
| Apple | 1 | 20% | No |
| Dill | 1 | 20% | No |
| Ice cream | 1 | 20% | No |
| Unicorn | 1 | 20% | No |

L_1 = {Eggs, Kidney Beans, Milk, Onion, Yogurt}

**Step 2: Frequent 2-itemsets (L_2)**

Generate all pairs from L_1, count support:

| Itemset | Support | Frequent? |
|---------|---------|-----------|
| {Eggs, Kidney Beans} | 4/5 = 80% | Yes |
| {Eggs, Onion} | 3/5 = 60% | Yes |
| {Kidney Beans, Milk} | 3/5 = 60% | Yes |
| {Kidney Beans, Onion} | 3/5 = 60% | Yes |
| {Yogurt, Kidney Beans} | 3/5 = 60% | Yes |
| {Eggs, Milk} | 2/5 = 40% | No |
| {Eggs, Yogurt} | 2/5 = 40% | No |
| {Milk, Onion} | 1/5 = 20% | No |
| {Milk, Yogurt} | 2/5 = 40% | No |
| {Onion, Yogurt} | 2/5 = 40% | No |

**Step 3: Frequent 3-itemsets (L_3)**

From L_2, candidates must have all 2-subsets in L_2.

| Candidate | All 2-subsets frequent? | Support | Frequent? |
|-----------|------------------------|---------|-----------|
| {Eggs, Kidney Beans, Onion} | EK:Yes, EO:Yes, KO:Yes | 3/5=60% | Yes |
| {Eggs, Kidney Beans, Milk} | EK:Yes, EM:No | -- | Pruned |
| {Eggs, Kidney Beans, Yogurt} | EK:Yes, EY:No | -- | Pruned |
| ... | ... | ... | ... |

L_3 = {{Eggs, Kidney Beans, Onion}}

**Final result**: All frequent itemsets = L_1 union L_2 union L_3

### Python Implementation

```python
from mlxtend.frequent_patterns import apriori
from mlxtend.preprocessing import TransactionEncoder

# Transform transactions to boolean matrix
te = TransactionEncoder()
te_array = te.fit(dataset).transform(dataset)
df = pd.DataFrame(te_array, columns=te.columns_)

# Run Apriori
frequent_itemsets = apriori(df, min_support=0.6, use_colnames=True)

# Add length column
frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(len)

# Filter by length
long_itemsets = frequent_itemsets[frequent_itemsets['length'] >= 2]
```

## 3. Association Rules (Regles d'Association)

### Definitions

An association rule has the form: X --> Y (if X then Y), where X and Y are disjoint itemsets.

| Metric | Formula | Meaning |
|--------|---------|---------|
| **Support** | support(X union Y) | How often X and Y appear together |
| **Confidence** | support(X union Y) / support(X) | P(Y \| X) -- probability of Y given X |
| **Lift** | confidence(X->Y) / support(Y) | How much more likely Y is given X vs. random |

### Interpretation

| Lift Value | Meaning |
|-----------|---------|
| lift > 1 | Positive association (X and Y appear together more than expected) |
| lift = 1 | Independent (no association) |
| lift < 1 | Negative association (X and Y avoid each other) |

### Example

From the previous data:
- Rule: {Onion, Kidney Beans} --> {Eggs}
- support({Onion, KB, Eggs}) = 60%
- confidence = 60% / 60% = 100%
- lift = 100% / 80% = 1.25

Interpretation: If a basket contains Onion and Kidney Beans, it always contains Eggs. The lift of 1.25 means this combination is 25% more likely than random.

## 4. Text Preprocessing for NLP (Pretraitement de Texte)

In TP3-4, tags from Flickr photos are preprocessed before mining. The pipeline:

### Step 1: Lowercase Conversion

```python
def lowerCase(tags):
    return tags.lower()
```

### Step 2: Accent Removal (Suppression des Accents)

```python
def supprimeAccent(tags):
    # Maps accented characters to their unaccented equivalents
    # e.g., 'e' with acute -> 'e', 'a' with grave -> 'a', etc.
    # Note: The actual accented keys (e.g., unicode chars) may not render
    # correctly in all editors. The principle is a character-by-character map.
    accent_map = {
        '\u00e0': 'a', '\u00e2': 'a', '\u00e4': 'a',  # a grave, circumflex, diaeresis
        '\u00e9': 'e', '\u00e8': 'e', '\u00ea': 'e', '\u00eb': 'e',  # e acute, grave, circumflex, diaeresis
        '\u00ee': 'i', '\u00ef': 'i',  # i circumflex, diaeresis
        '\u00f4': 'o', '\u00f6': 'o',  # o circumflex, diaeresis
        '\u00f9': 'u', '\u00fb': 'u', '\u00fc': 'u',  # u grave, circumflex, diaeresis
    }
    result = []
    for char in tags:
        result.append(accent_map.get(char, char))
    return ''.join(result)
```

More robust approach (recommended):
```python
import unicodedata
def remove_accents(text):
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd if not unicodedata.combining(c))
```

### Step 3: Stopword Removal (Suppression des Mots Vides)

Stopwords are common words that carry no semantic meaning (le, la, de, des, un, une, etc.).

```python
from nltk.corpus import stopwords
stopwordslist = stopwords.words("french")

def supprimeStopwords(tags):
    words = tags.split()
    return ' '.join(w for w in words if w not in stopwordslist)
```

### Step 4: Remove Photo Identifiers

Tags like "IMG_7719" or "DSC_2692" are camera-generated and carry no meaning.

```python
import re

def supprimeIdentPhoto(tags):
    regex_img = re.compile(r'^img_', re.IGNORECASE)
    regex_dsc = re.compile(r'^dsc_', re.IGNORECASE)
    words = tags.split()
    return ' '.join(w for w in words
                    if not regex_img.match(w) and not regex_dsc.match(w))
```

### Step 5: Keep Only Alphanumeric Words

Remove words containing special characters (URLs, emojis, punctuation).

```python
def supprimeCarSpeciaux(tags):
    pattern = re.compile(r'^[\w-]+$')
    words = tags.split()
    return ' '.join(w for w in words if pattern.match(w))
```

### Complete Pipeline

```python
photos["tags"] = photos["tags"].fillna("")
for idx, row in photos.iterrows():
    tags = row["tags"]
    tags = lowerCase(tags)
    tags = supprimeAccent(tags)
    tags = supprimeStopwords(tags)
    tags = supprimeIdentPhoto(tags)
    tags = supprimeCarSpeciaux(tags)
    photos.at[idx, "tags"] = tags
```

## 5. Cluster Labeling with Apriori (from TP3-4)

After clustering photos with DBSCAN, use Apriori on the tags of each cluster to find its most characteristic label:

```python
def identify_cluster(cluster_nb, photos, cluster_labels):
    # Get photos in this cluster
    cluster_photos = photos[photos['cluster'] == cluster_nb]
    
    # Build transaction list from tags
    transactions = []
    for tags in cluster_photos['tags']:
        if tags and tags.strip():
            transactions.append(tags.split())
    
    if not transactions:
        return
    
    # Encode as boolean matrix
    te = TransactionEncoder()
    te_array = te.fit(transactions).transform(transactions)
    df_tags = pd.DataFrame(te_array, columns=te.columns_)
    
    # Apply Apriori (play with min_support: 0.3-0.6)
    freq = apriori(df_tags, min_support=0.3, use_colnames=True)
    
    if freq.empty:
        return
    
    # Keep itemsets of length >= 2
    freq['length'] = freq['itemsets'].apply(len)
    freq = freq[freq['length'] >= 2]
    
    if freq.empty:
        return
    
    # Sort by support (descending), then by length (descending)
    freq = freq.sort_values(['support', 'length'], ascending=[False, False])
    
    # Take the top itemset as the cluster label
    best = freq.iloc[0]['itemsets']
    cluster_labels[cluster_nb] = ', '.join(sorted(best))
```

## 6. Advanced Pattern Mining (Lecture Content)

The course also covers (in lecture7 and lecture10):

### Sequential Pattern Mining
Finding ordered sequences of itemsets that appear frequently in a sequence database.

Example: {Bread, Butter} --> {Milk} --> {Eggs} (customers who buy bread and butter, then buy milk, then buy eggs)

### Closed and Maximal Itemsets
- **Closed itemset**: Frequent itemset with no proper superset having the same support
- **Maximal itemset**: Frequent itemset with no frequent proper superset

These reduce the number of patterns while preserving all information.

## Common Pitfalls

1. **Setting minsup too low**: Produces exponentially many itemsets, most of which are uninteresting.
2. **Setting minsup too high**: Misses important patterns. Start around 0.3-0.5 and adjust.
3. **Confusing support and confidence**: Support is about frequency of the entire itemset; confidence is the conditional probability.
4. **Not handling empty tags**: Always check for NaN/empty strings before Apriori.
5. **Forgetting to remove stopwords**: Common words like "rennes" or "france" will dominate all clusters if not handled properly.

---

## CHEAT SHEET

### Apriori Step-by-Step (for exam)

```
1. Count support of all single items --> L_1
2. Generate pairs from L_1 --> C_2
3. Count support of C_2 --> keep frequent --> L_2
4. Generate triples from L_2 (prune by anti-monotonicity) --> C_3
5. Count support of C_3 --> keep frequent --> L_3
6. Continue until L_k is empty
```

### Anti-Monotonicity Rules

```
{A} infrequent  -->  {A, B}, {A, C}, {A, B, C}, ... all infrequent
{A, B} frequent  -->  {A} and {B} must be frequent
```

### Key Formulas

| Metric | Formula |
|--------|---------|
| support(X) | count(X in DB) / \|DB\| |
| confidence(X -> Y) | support(X union Y) / support(X) |
| lift(X -> Y) | confidence(X -> Y) / support(Y) |

### NLP Preprocessing Pipeline

```
Raw tags --> lowercase --> remove accents --> remove stopwords
         --> remove IMG/DSC --> remove special chars --> clean tags
```

### Python Quick Reference

```python
# Apriori
from mlxtend.frequent_patterns import apriori
from mlxtend.preprocessing import TransactionEncoder

te = TransactionEncoder()
df = pd.DataFrame(te.fit(data).transform(data), columns=te.columns_)
freq = apriori(df, min_support=0.6, use_colnames=True)

# Association rules
from mlxtend.frequent_patterns import association_rules
rules = association_rules(freq, metric="confidence", min_threshold=0.7)
```

### French Exam Vocabulary

| French | English |
|--------|---------|
| Motif frequent | Frequent itemset |
| Support minimal | Minimum support |
| Regle d'association | Association rule |
| Confiance | Confidence |
| Anti-monotonie | Anti-monotonicity (downward closure) |
| Elagage | Pruning |
| Candidat | Candidate itemset |
| Mots vides | Stopwords |
| Pretraitement | Preprocessing |
