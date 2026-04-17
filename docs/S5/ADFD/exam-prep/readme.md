---
title: "ADFD Exam Preparation Guide"
sidebar_position: 0
---

# ADFD Exam Preparation Guide

## Exam Format

The ADFD course typically has **two separate exams**:

| Exam | Name | Duration | Weight | Key Topics |
|------|------|----------|--------|------------|
| **DS AD** | Analyse de Donnees | ~1.5-2h | ~50% | PCA, Correlation Circle, Preprocessing, Dimensionality Reduction |
| **DS FD** | Fouille de Donnees | ~1.5-2h | ~50% | Clustering (DBSCAN, K-means, CAH), Apriori, Pattern Mining |

Some years combine both into a single **DS ADFD** exam.

**Allowed materials**: Generally no documents allowed (closed-book). Check with the professor.

## Available Past Exams

| Year | Part | File |
|------|------|------|
| 2025 | AD | `Analyse de donnees.pdf` |
| 2025 | FD | `Fouille de donnees.pdf` |
| 2024 | FD | `adfd_2024_fouille.pdf` |
| 2024 | Combined | `main24_final.pdf` |
| 2023 | AD | `Sujet AD.pdf` |
| 2023 | FD | `Sujet FD.pdf` |
| 2023 | Student copy | `Youenn ADFD.pdf` |
| 2021 | Combined | `Sujet 2021.pdf` |
| 2021 | Student copy | `Hugo DS 2021.pdf` |
| 2020 | AD | `Sujet AD 2020.pdf` |
| 2020 | Correction | `Exo1 Correction_.docx` |
| 2019 | Combined | `Sujet.pdf` |
| 2017 | AD | `Sujet AD 2017.pdf` + correction |
| 2016 | AD | `Sujet AD 2016.pdf` + student copy |
| 2016 | FD | `Sujet FD 2016.pdf` + corrections |
| 2015 | AD | `Sujet AD 2015.pdf` |
| 2013 | FD | `Sujet FD 2013.pdf` |

## Exam Strategy

### Time Management

| Exam Part | Recommended Strategy |
|-----------|---------------------|
| First 5 min | Read ALL questions, identify easy vs hard |
| Questions with data tables | Do these first -- they are mechanical and score-worthy |
| PCA interpretation | Spend time on the correlation circle -- this is where most points are |
| Apriori by hand | Follow the algorithm step by step, show your work |
| Short answer / justification | Be concise but precise -- 2-3 sentences max |

### What to Prioritize

**High-yield topics** (frequently tested, many points):

1. **Reading the correlation circle** -- Almost every AD exam includes this. Know how to:
   - Identify which variables are correlated with which axes
   - Explain what each axis "means" in domain terms
   - Identify correlated/anti-correlated/independent variable pairs
   - Assess quality of representation (how close to the circle edge)

2. **Apriori algorithm by hand** -- Every FD exam asks you to:
   - Compute support of given itemsets
   - Generate candidates and prune using anti-monotonicity
   - Find all frequent itemsets for a given minsup

3. **DBSCAN step-by-step** -- Many FD exams include:
   - Classifying points as core, border, or noise
   - Tracing the algorithm on a small 2D example
   - Comparing DBSCAN with K-means

4. **Eigenvalue / variance interpretation** -- Know how to:
   - Read a scree plot
   - Decide how many components to keep
   - Compute cumulative explained variance

### Common Question Types

#### Type 1: "Interpret this correlation circle"
Given a correlation circle plot, explain:
- What does each axis represent?
- Which variables contribute most to each axis?
- Are there correlated variables? Which ones?
- What about individual X -- where would it be on the factorial plane and why?

**Strategy**: Look at which variables are closest to each axis. Name the axis based on the domain meaning of those variables. Then look for variable clusters on the circle.

#### Type 2: "Apply Apriori to this dataset"
Given a small transaction database and minsup:
- Find L_1 (frequent 1-itemsets)
- Generate C_2, compute supports, find L_2
- Generate C_3 with anti-monotonicity pruning, find L_3
- List all frequent itemsets

**Strategy**: Use a systematic table approach. Show every candidate and its support count. Clearly indicate pruning steps.

#### Type 3: "Given these DBSCAN parameters, classify these points"
Given a set of 2D points, eps, and min_samples:
- For each point, list its neighbors
- Classify as core, border, or noise
- Form clusters
- Compare with K-means result

**Strategy**: Draw the points, draw circles of radius eps around each. Count neighbors methodically.

#### Type 4: "Explain the difference between..."
Comparison questions (CAH vs K-means, DBSCAN vs K-means, ACP normee vs non normee):

**Strategy**: Use a structured comparison table. Hit these points:
- When to use each
- Advantages and disadvantages
- Parameters required
- Type of clusters produced

#### Type 5: "How many components to keep?"
Given eigenvalues or a scree plot:
- Apply the 80% rule
- Apply the Kaiser criterion (eigenvalue > 1)
- Identify the elbow

**Strategy**: Show all three methods and state your conclusion. If they disagree, prioritize the 80% rule.

## Topic-by-Topic Exam Checklist

### PCA / ACP (Data Analysis Exam)

- [ ] Know when to use ACP normee vs. non normee
  - Normee: variables have different units or very different scales
  - Non normee: variables are homogeneous and comparable
- [ ] Be able to compute eigenvalues from a correlation matrix (2x2 case)
- [ ] Read scree plots and determine number of components
- [ ] Interpret correlation circle (most important skill)
- [ ] Interpret factorial plane of individuals
- [ ] Compute contributions and quality of representation
- [ ] Link axes to original variables using the circle
- [ ] Explain PCA to a non-expert in 2-3 sentences
- [ ] Know the mathematical steps: center, compute correlation matrix, eigendecompose, project

### Clustering (Data Mining Exam)

- [ ] Trace K-means algorithm step by step (2D, small example)
- [ ] Trace DBSCAN algorithm step by step
- [ ] Classify points as core/border/noise for DBSCAN
- [ ] Know Ward's criterion formula and meaning
- [ ] Read a dendrogram and choose number of clusters
- [ ] Compare CAH, K-means, DBSCAN (table format)
- [ ] Compute silhouette score for a simple example
- [ ] Know what inertia intra-classe and inter-classe mean
- [ ] Explain the elbow method for choosing K
- [ ] Know why DBSCAN is preferred for spatial data

### Frequent Itemsets (Data Mining Exam)

- [ ] Compute support by hand
- [ ] Apply Apriori step by step
- [ ] Use anti-monotonicity to prune candidates
- [ ] Compute confidence and lift of association rules
- [ ] Know the difference between closed, maximal, and frequent itemsets
- [ ] Know what minsup does and how to choose it

### Preprocessing

- [ ] Name strategies for handling missing values
- [ ] Know the difference between imputation methods (mean, median, mode)
- [ ] Explain why standardization is needed before PCA
- [ ] Know what log transform does and when to use it
- [ ] Explain the difference between normalization and standardization

## Critical Formulas

### PCA

```
Standardize:    z = (x - mean) / std
Correlation:    r(x_j, F_k) = v_jk * sqrt(lambda_k)
Variance %:     lambda_k / sum(lambda_i) * 100
Contribution:   CTR(i,k) = F_ik^2 / (n * lambda_k)
cos^2:          F_ik^2 / sum_j(F_ij^2)
```

### Clustering

```
Ward:           Delta(A,B) = (n_A*n_B)/(n_A+n_B) * ||c_A - c_B||^2
Silhouette:     s(i) = (b(i) - a(i)) / max(a(i), b(i))
K-means:        min sum_k sum_{i in C_k} ||x_i - c_k||^2
DBSCAN:         core point if |N_eps(p)| >= min_samples
```

### Apriori

```
Support:        sup(X) = |{T : X in T}| / |DB|
Confidence:     conf(X->Y) = sup(X union Y) / sup(X)
Lift:           lift(X->Y) = conf(X->Y) / sup(Y)
Anti-mono:      sup(X) < minsup => sup(X union Y) < minsup
```

## Common Mistakes to Avoid

1. **Confusing the correlation circle with the factorial plane**: The circle shows VARIABLES (months, features). The factorial plane shows INDIVIDUALS (cities, houses). Never mix them.

2. **Forgetting to justify DBSCAN over K-means**: When asked to choose an algorithm, always explain WHY. For spatial data with noise, the answer is almost always DBSCAN.

3. **Not showing pruning in Apriori**: Examiners want to see that you apply anti-monotonicity. Explicitly write "pruned because {A,C} not in L_2" when generating C_3.

4. **Misreading correlation circle variables near the origin**: If a variable's arrow is short (near center), it is NOT well represented -- do not interpret its position.

5. **Saying "PCA reduces noise"**: More precisely, PCA keeps the high-variance directions and discards low-variance ones. If noise is in low-variance directions, it is removed. But PCA does not "know" what noise is.

6. **Using DBSCAN on non-metric coordinates**: If given GPS coordinates, mention that conversion to meters is needed for eps to be meaningful.

7. **Forgetting that K-means is non-deterministic**: Different initializations give different results. Always mention `random_state` or `n_init`.

8. **Not computing cumulative variance**: When asked "how many components?", always show the cumulative variance reaching the 80% threshold.
