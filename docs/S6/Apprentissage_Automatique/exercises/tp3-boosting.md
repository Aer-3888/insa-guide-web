---
title: "TP3 - Decision Trees and Boosting with BonzaiBoost"
sidebar_position: 3
---

# TP3 - Decision Trees and Boosting with BonzaiBoost

> Following teacher instructions from: `data/moodle/tp/tp3_boosting/README.md` and `data/moodle/tp/tp3_boosting/TP3_but_4.pdf`

---

## Dataset: Adult Income (Census)

**Problem:** Predict whether a person earns more than $50K/year based on census data.

- `adult.data`: Training data (32,561 records)
- `adult.test`: Test data (16,281 records)
- `adult.names`: Dataset description and attribute definitions

**Attributes (14 features):**

| Feature | Type | Values |
|---------|------|--------|
| age | Continuous | Age of the person |
| workclass | Nominal | Private, Self-emp-not-inc, Federal-gov, etc. |
| fnlwgt | Ignore | Census weight (not used) |
| education | Nominal | Bachelors, Some-college, HS-grad, etc. |
| education-num | Continuous | Number of years of education |
| marital-status | Nominal | Married-civ-spouse, Divorced, Never-married, etc. |
| occupation | Nominal | Tech-support, Exec-managerial, Prof-specialty, etc. |
| relationship | Nominal | Wife, Own-child, Husband, etc. |
| race | Nominal | White, Asian-Pac-Islander, Black, etc. |
| sex | Nominal | Female, Male |
| capital-gain | Ignore | (not used) |
| capital-loss | Ignore | (not used) |
| hours-per-week | Continuous | Hours worked per week |
| native-country | Nominal | United-States, England, etc. (41 countries) |

**Target classes:**
- `sup50K` (~24%): Income > $50K/year
- `infeq50K` (~76%): Income <= $50K/year

---

## Exercise 1: Naive Baseline

### What is the training/test accuracy of the naive classifier?

The naive classifier predicts the majority class for all instances.

**Answer:**

```bash noexec
# Navigate to the dataset directory
cd adult/

# Generate the naive classifier (depth 0 = no questions = majority class)
../bonzaiboost -S adult -d 0

# Evaluate on training data
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluate on test data
../bonzaiboost -S adult -C < adult.test > /dev/null
```

**Expected output:**
- Training accuracy: ~75.9% (= proportion of `infeq50K` in adult.data)
- Test accuracy: ~76.1% (similar proportion in adult.test)

### Why might this be misleading?

**Answer:**

The naive classifier gives ~76% accuracy simply by predicting `infeq50K` (earns <= $50K) for everyone. This is misleading because:
- It correctly classifies 100% of the majority class but 0% of the minority class (`sup50K`).
- Any model that does not significantly exceed 76% is essentially useless.
- With imbalanced data (76% vs 24%), accuracy alone is deceptive. A model at 78% only improves by 2 points over the most trivial prediction possible.

**Explanation:** The baseline establishes the minimum performance threshold. A useful model should target well above 82-85% to justify the added complexity.

---

## Exercise 2: Manual Decision Tree (4 Leaves)

### Design a 4-leaf binary decision tree by intuition, then evaluate it.

**Answer:**

The file `arbre.txt` shows the format for manual rules:

```
racine=race White
no=sex Male yes=sup50K no=infeq50K
yes=native-country United-States yes=sup50K no=infeq50K
```

**Explanation of the structure:**
- Line 1: The root asks "race = White?"
- Line 2: Branch "no" (not White) -> asks "sex = Male?" -> if yes: `sup50K`, if no: `infeq50K`
- Line 3: Branch "yes" (White) -> asks "native-country = United-States?" -> if yes: `sup50K`, if no: `infeq50K`

### Procedure to build and evaluate your own tree

```bash noexec
# 1. Create your rules file (e.g., mon_arbre.txt)
#    Example: try using education or marital-status as root
#    racine=marital-status Married-civ-spouse
#    no=education Bachelors yes=sup50K no=infeq50K
#    yes=hours-per-week 40 yes=sup50K no=infeq50K

# 2. Convert to BonzaiBoost format
perl ../rules2tree.pl adult mon_arbre.txt

# 3. Evaluate on training data
../bonzaiboost -S adult -C < adult.data > /dev/null

# 4. Evaluate on test data
../bonzaiboost -S adult -C < adult.test > /dev/null
```

### Question 1: Does your manual tree outperform the naive classifier?

**Answer:** Probably not, or only barely. Human intuition is rarely better than data statistics for choosing the right splits and leaf predictions. The example tree in `arbre.txt` uses race and nationality, which are weak predictors of income compared to education level or marital status.

### Question 2: If you keep the rules but change leaf decisions to match training statistics, do results improve?

**Answer:** Yes, significantly. The splits (questions asked) are less important than the leaf predictions. Even with suboptimal splits, if the leaves predict the majority class among the training examples that reach them, the result improves. This demonstrates that a decision tree's accuracy depends heavily on correct leaf assignments.

---

## Exercise 3: Automatic Tree Construction

### 3a: Depth-limited tree (d=2, 4 leaves)

```bash noexec
# Build a depth-2 tree (4 leaves maximum)
../bonzaiboost -S adult -d 2

# Evaluate on training data
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluate on test data
../bonzaiboost -S adult -C < adult.test > /dev/null

# Visualize the tree
dot -Tpng adult.tree.dot > adult_d2.png
```

**Expected output:**
- Training accuracy: ~80-82%
- Test accuracy: ~79-81%
- Train/test gap: ~1-2 points (low overfitting)

### Does the automatic tree outperform your manual tree? Interpret it: which features did it choose? Why?

**Answer:**

The automatic depth-2 tree is significantly better than the naive baseline (+4-6 points) and almost certainly outperforms any manual tree. The automatically chosen features are typically:

- **marital-status** (being married significantly increases income probability)
- **education-num** (more years of education = higher income)
- **age** (35-55 year olds earn the most)

These features are chosen because they maximize information gain. The small train/test gap (~1-2 points) indicates **moderate underfitting**: the tree is too simple to capture all patterns.

### 3b: MDLPC stopping criterion

MDLPC (Minimum Description Length Principle for Classification) automatically determines the optimal tree size based on information theory. It stops growing the tree when adding a new node is not justified by the information gain relative to the added complexity.

```bash noexec
# Build tree with MDLPC
../bonzaiboost -S adult -mdlpc

# Evaluate on training data
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluate on test data
../bonzaiboost -S adult -C < adult.test > /dev/null

# Visualize
dot -Tpng adult.tree.dot > adult_mdlpc.png
```

**Expected output:**
- Training accuracy: ~83-85%
- Test accuracy: ~82-84%
- Train/test gap: ~1-2 points

### How does MDLPC compare to depth-limited? What is the overfitting gap?

**Answer:**

MDLPC produces a deeper tree than d=2 but not as deep as Tmax. Performance is better than the depth-limited tree (+2-3 points). The train/test gap remains small, indicating a good **bias-variance tradeoff**. MDLPC is a principled, automatic stopping criterion that avoids both underfitting and overfitting.

### 3c: Full tree (no stopping criterion)

```bash noexec
# Build full tree (verbose mode, no stopping)
../bonzaiboost -S adult -v

# Evaluate on training data
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluate on test data
../bonzaiboost -S adult -C < adult.test > /dev/null
```

**Expected output:**
- Training accuracy: **~100%**
- Test accuracy: ~82-84%
- Train/test gap: **~16-18 points** (severe overfitting)

### How do training vs test accuracies compare? What phenomenon occurs?

**Answer:**

The full tree achieves perfect training accuracy (100%) by memorizing every training example. However, the test accuracy (~82-84%) is no better than the MDLPC tree. This is the classic demonstration of **overfitting**: a model too complex that learns the noise of the training data instead of generalizable patterns. The tree has hundreds or thousands of nodes, making it also completely uninterpretable.

### Summary of Exercise 3

| Stopping Criterion | Train Acc | Test Acc | Gap | Diagnosis |
|-------------------|-----------|----------|-----|-----------|
| Depth 2 (4 leaves) | ~80-82% | ~79-81% | ~1-2% | Moderate underfitting |
| MDLPC (automatic) | ~83-85% | ~82-84% | ~1-2% | **Good tradeoff** |
| None (full tree) | ~100% | ~82-84% | ~16-18% | **Severe overfitting** |

**Key observation:** The full tree's test accuracy is NOT better than MDLPC despite 100% on training. Overfitting does not improve generalization.

---

## Exercise 4: AdaBoost

### Question 5: How do boosting results compare to single trees?

**Answer:**

```bash noexec
# Train AdaBoost with 100 iterations of stumps
../bonzaiboost -S adult -boost adamh -n 100

# Evaluate on training data
../bonzaiboost -S adult -boost adamh -C < adult.data > /dev/null

# Evaluate on test data
../bonzaiboost -S adult -boost adamh -C < adult.test > /dev/null
```

**Expected output:**
- Training accuracy: ~87-90%
- Test accuracy: **~85-87%**
- Train/test gap: ~2-3 points

AdaBoost (85-87% test) significantly outperforms:
- The naive classifier (+10-11 points)
- The depth-2 tree (+5-7 points)
- The MDLPC tree (+2-4 points)
- The full tree (+2-4 points on test, despite 100% train for the full tree)

**Explanation:** Boosting 100 stumps (very weak classifiers, barely better than random) produces a classifier more powerful than any single complex tree. This is the fundamental principle of boosting: combining weak learners produces a strong learner.

### Question 6: Error rate analysis -- Analyze the training/test error curves

```bash noexec
# Generate detailed HTML report with iteration-by-iteration results
../bonzaiboost -S adult -boost adamh -n 100 --info > adult.boost.log.html

# Open in a browser to see the curves
```

**Answer:**

| Curve Property | Observation |
|----------------|-------------|
| Training error | Decreases monotonically (or quasi-monotonically) with iterations |
| Test error | Decreases rapidly (iterations 1-20), then stabilizes or decreases slowly |
| Overfitting | Mild: the train/test gap increases with iterations but remains moderate |
| Convergence | Most of the gain comes in the first 20-50 iterations |
| Optimal iterations | ~50-100 (beyond that, marginal gains) |

**Explanation:** Unlike a single tree that overfits severely when complexity increases, boosting shows much more moderate overfitting. The test error continues to decrease (or stabilize) even after the training error reaches very low values. This is a remarkable property of AdaBoost, explained by the progressive increase in classification margins.

### Question 7: Feature importance -- Based on the boosting model, which features are most discriminative for predicting income > 50K?

**Answer:**

The HTML report indicates which features are used by the stumps at each iteration.

| Feature | Importance |
|---------|-----------|
| marital-status | Very high -- "Married-civ-spouse" is the best predictor |
| education / education-num | High -- more education = higher income |
| age | High -- 35-55 year olds earn the most |
| hours-per-week | Medium -- working > 40h/week increases probability |
| occupation | Medium -- "Exec-managerial" and "Prof-specialty" associated with >50K |
| workclass | Low to medium |
| relationship | Correlated with marital-status |

**Explanation:** The features selected by boosting align with intuitive socioeconomic factors. Marital status dominates because being married (especially "Married-civ-spouse") is a strong proxy for household income levels and economic stability.

---

## Overall Model Comparison

| Model | Train Acc | Test Acc | Gap | Complexity |
|-------|-----------|----------|-----|-----------|
| Naive (majority) | ~76% | ~76% | 0% | None |
| Manual tree (4 leaves) | Variable | Variable | Variable | Very low |
| Auto tree d=2 | ~80-82% | ~79-81% | ~1-2% | Low |
| MDLPC tree | ~83-85% | ~82-84% | ~1-2% | Medium |
| Full tree | ~100% | ~82-84% | ~16-18% | Very high |
| **AdaBoost (n=100)** | ~87-90% | **~85-87%** | ~2-3% | High (100 stumps) |

**Key takeaways:**

1. **Always establish a baseline.** A model at 78% on a dataset with 76% majority class adds almost nothing.
2. **Overfitting = train >> test.** The full tree has 100% train but ~83% test. MDLPC has ~84% train and ~83% test: better generalization with a much simpler model.
3. **MDLPC** is a good automatic stopping criterion based on the Minimum Description Length principle.
4. **Boosting outperforms single trees.** 100 stumps combined beat any single complex tree. Boosting reduces bias (underfitting) while controlling variance (overfitting).
5. **Diminishing returns.** Going from 1 to 20 stumps gains a lot; going from 50 to 100 gains little.

---

## AdaBoost Formulas (for exam reference)

### Weight of weak classifier t

```
alpha_t = (1/2) * ln((1 - epsilon_t) / epsilon_t)
```

- epsilon_t = weighted error of weak classifier t (between 0 and 0.5 for a useful classifier)
- If epsilon_t = 0.5 (no better than random), alpha_t = 0 (no contribution)
- If epsilon_t is close to 0, alpha_t is large (very reliable classifier)

### Weight update for examples

```
w_i^(t+1) = w_i^(t) * exp(-alpha_t * y_i * h_t(x_i)) / Z_t
```

- y_i = true class of example i (+1 or -1)
- h_t(x_i) = prediction of weak classifier t for example i (+1 or -1)
- If correct prediction (y_i * h_t(x_i) > 0): weight decreases
- If incorrect prediction (y_i * h_t(x_i) < 0): weight increases
- Z_t = normalization factor

### Final prediction (weighted vote)

```
H(x) = sign(sum_{t=1}^{T} alpha_t * h_t(x))
```

Sum the weighted votes of all T weak classifiers. The sign of the sum determines the predicted class.
