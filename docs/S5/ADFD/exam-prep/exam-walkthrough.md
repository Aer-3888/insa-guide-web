---
title: "Exam Walkthrough: How to Approach Each Question Type"
sidebar_position: 2
---

# Exam Walkthrough: How to Approach Each Question Type

This document analyzes recurring question patterns across all available past exams (2013-2025) and provides systematic solution strategies.

## Part A: Analyse de Donnees (AD) Question Types

### A1. PCA Interpretation from Figures (Highest Frequency)

**Appears in**: 2015, 2016, 2017, 2019, 2020, 2021, 2023, 2025

**What you are given**: A correlation circle and/or factorial plane of individuals, along with a data table and eigenvalue summary.

**What you must do**:

#### Step 1: Determine number of components to keep

Read the eigenvalue table. Compute cumulative variance. State which components exceed the 80% threshold.

Example answer:
> "Les deux premieres composantes capturent respectivement 45% et 25% de la variance, soit 70% cumulee. En ajoutant la 3e composante (12%), on atteint 82%, ce qui depasse le seuil de 80%. On retient donc 3 composantes."

#### Step 2: Name the axes from the correlation circle

Look at which variables are closest to each axis (highest absolute correlation).

Template answer:
> "L'axe 1 est principalement lie aux variables [X, Y, Z] (correlations positives proches de 1) et negativement aux variables [A, B] (correlations proches de -1). Cet axe represente donc [interpretation metier]."

#### Step 3: Identify variable groups on the correlation circle

- Variables close together: positively correlated
- Variables opposite: negatively correlated
- Variables at 90 degrees: independent

Example:
> "Les variables Charbon et Gaz naturel sont proches sur le cercle, indiquant une correlation positive: les pays qui produisent beaucoup d'electricite au charbon en produisent aussi beaucoup au gaz. En revanche, Energies renouvelables est a l'oppose, indiquant une correlation negative."

#### Step 4: Interpret individuals on the factorial plane

Identify which individuals are extreme (far from origin) on each axis. Link their position to the variable interpretation from Step 2.

Example:
> "La Chine et les USA sont situes a droite sur l'axe 1, ce qui correspond a une forte production d'electricite totale (coherent avec les variables Charbon et Gaz). La France est separee sur l'axe 2, coherent avec sa forte production nucleaire."

### A2. Quality of Representation Questions

**Appears in**: 2015, 2017, 2021, 2023

**What you must compute**: cos^2 values or contribution values.

**Formula**: cos^2(i, k) = F_ik^2 / sum_j(F_ij^2)

**Strategy**:
1. Read the individual's coordinates on each axis from the table
2. Square each coordinate
3. Divide by the sum of all squared coordinates
4. A high cos^2 (> 0.5) means the individual is well represented on that axis

Example computation:
> Point A has coordinates (2.1, 0.3) on PC1 and PC2.
> cos^2(A, PC1) = 2.1^2 / (2.1^2 + 0.3^2) = 4.41 / 4.50 = 0.98
> Point A is very well represented on the first factorial plane (98%).

### A3. "Why ACP normee?" / "What type of ACP?"

**Appears in**: Nearly every AD exam

**Standard answer**:
> "On utilise l'ACP normee (centree-reduite) car les variables ont des unites differentes [ou des echelles differentes]. Sans standardisation, les variables avec les plus grandes valeurs numeriques domineraient l'analyse. L'ACP normee travaille sur la matrice de correlation plutot que la matrice de covariance."

**When NON-normee**: Only if all variables are in the same unit AND have comparable magnitudes (rare in exams).

### A4. Eigenvalue Computation (2x2 Matrix)

**Appears in**: 2015, 2017

**Method**: For a 2x2 correlation matrix:
```
R = | 1    r |
    | r    1 |

lambda_1 = 1 + r
lambda_2 = 1 - r
```

For general case, solve: det(R - lambda * I) = 0

### A5. Preprocessing Questions

**Appears in**: 2020, 2021, 2025

Common questions:
- "How would you handle missing values in this dataset?"
- "Why is standardization necessary?"
- "What is the impact of outliers on PCA?"

**Strategy**: Be specific about the method AND justify the choice based on the data characteristics.

---

## Part B: Fouille de Donnees (FD) Question Types

### B1. Apriori by Hand (Highest Frequency)

**Appears in**: 2013, 2016, 2019, 2021, 2023, 2024

**Given**: A transaction database (5-10 transactions) and a minimum support threshold.

**Step-by-step solution template**:

```
STEP 1: Count support of each individual item
-------------------------------------------------
Item    | Count | Support | Frequent?
--------|-------|---------|----------
A       | 7     | 7/10    | Yes (>= minsup)
B       | 3     | 3/10    | No (< minsup)
...

L_1 = {A, C, D, E, ...}  (items with support >= minsup)

STEP 2: Generate C_2 (all pairs from L_1)
-------------------------------------------------
Candidate  | Count | Support | Frequent?
-----------|-------|---------|----------
{A, C}     | 5     | 5/10    | Yes
{A, D}     | 3     | 3/10    | No
...

L_2 = {{A,C}, {C,E}, ...}

STEP 3: Generate C_3 (from L_2, with anti-monotonicity pruning)
-------------------------------------------------
Candidate    | All 2-subsets in L_2? | Count | Frequent?
-------------|----------------------|-------|----------
{A, C, E}   | {A,C}: Yes, {A,E}: Yes, {C,E}: Yes | 4 | Yes
{A, C, D}   | {A,C}: Yes, {A,D}: No | PRUNED | --
...
```

**CRITICAL**: Always show the pruning step explicitly. Write "Pruned by anti-monotonicity because {X,Y} not in L_2."

### B2. FP-Tree Construction

**Appears in**: 2024

**Given**: A transaction database and minimum support.

**Step-by-step**:
1. Count item frequencies, remove infrequent items
2. Sort items by frequency (descending) in each transaction
3. Build the tree by inserting transactions one by one
4. Build the conditional pattern base for each item (bottom-up)
5. Build conditional FP-trees and extract frequent itemsets

**Tip**: Draw the tree clearly with node labels and counts. Show the header table with node links.

### B3. DBSCAN Classification (Core/Border/Noise)

**Appears in**: 2016, 2019, 2023, 2024, 2025

**Given**: A set of 2D points, eps value, min_samples value.

**Step-by-step solution**:

```
STEP 1: For each point, list neighbors within eps
-------------------------------------------------
Point | Neighbors (distance < eps) | Count | Type
------|---------------------------|-------|------
P1    | P2, P3, P5               | 3     | Core (>= min_samples=3)
P2    | P1, P3                   | 2     | Border (< min_samples, but neighbor of core P1)
P3    | P1, P2, P4, P5           | 4     | Core
P6    | (none)                   | 0     | Noise

STEP 2: Form clusters by connectivity
-------------------------------------------------
Cluster 1: P1, P2, P3, P4, P5 (connected through core points)
Noise: P6
```

**Tip**: Draw the points on graph paper, draw circles of radius eps around each, and count visually.

### B4. K-Means Step-by-Step

**Appears in**: 2016, 2019, 2025

**Given**: Initial centroids and data points.

**Step-by-step**:

```
Iteration 1:
  Centroids: C1=(1,2), C2=(5,3)
  
  Point | dist(C1) | dist(C2) | Assigned to
  ------|----------|----------|------------
  (0,1) | 1.41     | 5.39     | C1
  (2,3) | 1.41     | 3.00     | C1
  (6,4) | 5.39     | 1.41     | C2
  
  New centroids:
  C1 = mean of {(0,1), (2,3)} = (1, 2)
  C2 = mean of {(6,4)} = (6, 4)
  
Iteration 2: ...
(Continue until centroids don't change)
```

### B5. Compare DBSCAN vs K-Means

**Appears in**: 2016, 2019, 2023, 2025

**Template answer** (use a table):

| Criterion | K-means | DBSCAN |
|-----------|---------|--------|
| Input parameter | K (number of clusters) | eps, min_samples |
| Cluster shape | Convex only | Arbitrary |
| Handles noise | No (all points assigned) | Yes (label = -1) |
| Deterministic | No (depends on init) | Yes (for core/noise) |
| Complexity | O(nkd) - fast | O(n log n) - moderate |
| Best for | Large data, known K, spherical clusters | Spatial data, unknown K, noise present |

### B6. Association Rules (Confidence, Lift)

**Appears in**: 2013, 2016, 2023

**Given**: Frequent itemsets with supports, asked to compute confidence and lift of specific rules.

**Formulas**:
```
confidence(A -> B) = support(A union B) / support(A)
lift(A -> B) = confidence(A -> B) / support(B)
```

**Interpretation**:
- confidence = 0.8 means "80% of transactions containing A also contain B"
- lift > 1 means "A and B appear together more than expected by chance"
- lift = 1 means "A and B are independent"

### B7. Formal Concept Analysis (Treillis de Concepts)

**Appears in**: 2023, 2024

**Given**: A concept lattice diagram, asked to identify extensions and intensions.

**Definitions**:
- **Extension** of a concept: the set of objects (individuals) in the concept
- **Intension** of a concept: the set of attributes (properties) shared by all objects in the extension

**Strategy**: Follow the lines in the lattice. The extension is the union of objects below the node. The intension is the intersection of attributes above the node.

### B8. Closed vs Maximal Itemsets

**Appears in**: 2024

**Definitions**:
- **Closed itemset**: A frequent itemset X such that no proper superset of X has the same support. Equivalently, X = closure(X).
- **Maximal itemset**: A frequent itemset X such that no proper superset of X is frequent.

**Key difference**: 
> "Les motifs fermes conservent l'information de support (on peut retrouver le support de tout motif frequent a partir des motifs fermes). Les motifs maximaux ne conservent pas l'information de support mais sont moins nombreux. Les motifs fermes sont un compromis entre l'ensemble complet des motifs frequents (trop nombreux) et les motifs maximaux (perte d'information)."

### B9. Information Retrieval Metrics

**Appears in**: 2013

**Given**: A ranked list of search results with relevance labels (P/N).

**Formulas**:
```
Precision at k = |relevant in top k| / k
Recall at k = |relevant in top k| / |total relevant|
MAP = mean of precision values at each relevant document position
R-Precision = Precision at R (where R = total relevant documents)
```

### B10. Text Mining / NLP Questions

**Appears in**: 2013

**Stemming vs Lemmatization**:
- **Stemming**: Crude truncation to find the root (porter -> port). Fast but imprecise.
- **Lemmatization**: Dictionary-based reduction to the lemma (better -> good). Accurate but slower.

**Impact on precision**: Stemming can decrease precision by conflating different words with similar stems (e.g., "university" and "universe" both stem to "univers").

---

## Part C: Exam-Specific Tips by Year

### 2025 Exam (Most Recent)

- **AD part**: PCA on a new dataset. Expect correlation circle interpretation, number of components choice, individual/variable factorial planes.
- **FD part**: Clustering + pattern mining. Expect DBSCAN tracing, comparison questions, and Apriori.

### 2023 Exam

- **AD part (6 pages)**: Full PCA exercise with preprocessing.
- **FD part (8 pages)**: Formal concept analysis (treillis), Apriori, and KRIMP code table questions.

### 2024 Exam

- **FD part (10 pages)**: Concept lattice, closed vs maximal itemsets, FP-Tree construction, DBSCAN.

### Historical Pattern

The exam has been remarkably consistent:
1. AD always has a PCA interpretation exercise (correlation circle + factorial plane)
2. FD always has an itemset mining exercise (Apriori or FP-Growth)
3. FD usually has a clustering exercise (DBSCAN and/or K-means)
4. Newer exams (2023+) include formal concept analysis questions

## Final Checklist Before Exam

### Day Before
- [ ] Practice reading one correlation circle from a past exam
- [ ] Trace Apriori by hand on a 5-transaction example
- [ ] Trace DBSCAN on a 6-point example
- [ ] Review formulas: support, confidence, lift, silhouette, cos^2, contribution
- [ ] Know the comparison table: CAH vs K-means vs DBSCAN

### During the Exam
- [ ] Read ALL questions first (5 minutes)
- [ ] Start with mechanical computation questions (Apriori, DBSCAN tracing)
- [ ] For interpretation questions: always link variables to axes, then individuals to axes
- [ ] Show all computation steps -- partial credit is awarded
- [ ] For "justify" questions: give the reason, not just the answer
- [ ] Double-check cumulative variance when choosing number of components
