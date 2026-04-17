---
title: "TP3: Decision Trees with BonzaiBoost"
sidebar_position: 3
---

# TP3: Decision Trees with BonzaiBoost

## Overview
This practical uses the BonzaiBoost toolkit to explore decision tree learning, boosting algorithms, and the trade-offs between different stopping criteria. The focus is on understanding how tree complexity affects performance and learning to interpret decision trees.

## Dataset: Adult Income
**Problem**: Predict whether a person earns more than $50K/year based on census data.

### Files
- `adult.data`: Training data (32,561 records)
- `adult.test`: Test data (16,281 records)
- `adult.names`: Dataset description and attribute definitions
- `adult.png`: Pre-generated decision tree visualization
- `arbre.txt`: Example decision rules
- `rules2tree.pl`: Perl script to convert rules to BonzaiBoost tree format

### Attributes (14 features)
Demographic and employment information:
- age, workclass, education, marital-status, occupation, relationship
- race, sex, capital-gain, capital-loss, hours-per-week, native-country
- Target: income (>50K, <=50K)

## BonzaiBoost Toolkit
Pre-compiled binary (`bonzaiboost`) for decision tree learning and boosting.

### Key Commands
```bash noexec
# Generate naive classifier (majority label)
bonzaiboost -S adult -d 0

# Evaluate on training data
bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluate on test data
bonzaiboost -S adult -C < adult.test > /dev/null

# Build decision tree with depth limit
bonzaiboost -S adult -d 2

# Build tree with MDLPC stopping criterion
bonzaiboost -S adult -mdlpc

# Build full tree (no stopping criterion)
bonzaiboost -S adult -v

# Boosting with AdaBoost
bonzaiboost -S adult -boost adamh -n 100

# Generate tree visualization
dot -Tpng adult.tree.dot > adult.png

# Generate HTML performance report
bonzaiboost -S adult -boost adamh -n 100 --info > adult.boost.log.html
```

## Exercises

### Exercise 1: Naive Baseline
**Objective**: Understand baseline performance

A naive classifier predicts the majority class for all instances. In binary classification with imbalanced classes, this provides a useful baseline.

**Questions**:
1. What is the training/test accuracy of the naive classifier?
2. Why might this be misleading in Brittany (or with imbalanced data)?

**Expected Results**:
- High accuracy if one class dominates (~75% if 75% earn <=50K)
- Poor performance on minority class
- Illustrates importance of looking beyond overall accuracy

### Exercise 2: Manual Decision Tree Design
**Objective**: Design a 4-leaf binary decision tree by intuition

**Task**: Create a tree structure using features that intuitively separate high/low earners.

**Example Tree** (from arbre.txt):
```
racine=age 35
├─ oui: native-country=England
│   ├─ yes=infeq50K, no=infeq50K
└─ non: race=Black
    ├─ yes=sup50K, no=infeq50K
```

**Steps**:
1. Write tree rules in text file
2. Convert to BonzaiBoost format: `rules2tree.pl adult votrefichierderegles`
3. Evaluate: `bonzaiboost -S adult -C < adult.data > /dev/null`
4. Compare with naive baseline

**Questions**:
1. Does your manual tree outperform the naive classifier?
2. If you keep the rules but change leaf decisions to match training statistics, do results improve?

**Learning Goal**: Understand that good splits matter, but leaf predictions must align with data.

### Exercise 3: Automatic Tree Construction
**Objective**: Compare stopping criteria and tree complexity

#### 3a. Depth-Limited Tree (d=2, 4 leaves)
```bash noexec
bonzaiboost -S adult -d 2
bonzaiboost -S adult -C < adult.data > /dev/null  # Training accuracy
bonzaiboost -S adult -C < adult.test > /dev/null   # Test accuracy
dot -Tpng adult.tree.dot > adult_d2.png
```

**Questions**:
1. Does the automatic tree outperform your manual tree?
2. Interpret the tree: which features did it choose? Why?

#### 3b. MDLPC Stopping Criterion
MDLPC (Minimum Description Length Principle) automatically determines optimal tree size.

```bash noexec
bonzaiboost -S adult -mdlpc
bonzaiboost -S adult -C < adult.data > /dev/null
bonzaiboost -S adult -C < adult.test > /dev/null
```

**Questions**:
1. How does MDLPC performance compare to depth-limited tree?
2. What is the gap between training and test accuracy (overfitting)?

#### 3c. Full Tree (no stopping)
```bash noexec
bonzaiboost -S adult -v
```

**Questions**:
3. How do training vs test accuracies compare?
4. What phenomenon occurs (overfitting)?

**Expected Observations**:
- Depth-limited (d=2): Underfits, similar train/test accuracy
- MDLPC: Balanced complexity, small train/test gap
- Full tree: Perfect training accuracy, large test accuracy drop (overfitting)

### Exercise 4: AdaBoost
**Objective**: Explore boosting to improve performance

AdaBoost combines multiple weak learners (stumps) into a strong ensemble.

```bash noexec
# Train boosting model (100 iterations)
bonzaiboost -S adult -boost adamh -n 100

# Evaluate
bonzaiboost -S adult -boost adamh -C < adult.data > /dev/null
bonzaiboost -S adult -boost adamh -C < adult.test > /dev/null
```

**Questions**:
5. How do boosting results compare to single trees?

#### Error Rate Analysis
Generate learning curves with gnuplot:

```bash noexec
# Generate HTML report with iteration-by-iteration results
bonzaiboost -S adult -boost adamh -n 100 --info > adult.boost.log.html

# View in browser to see:
# - Training error vs iterations
# - Test error vs iterations
# - Convergence behavior
```

**Question 6**: Analyze the curves:
- Does training error decrease monotonically?
- Does test error decrease then increase (overfitting)?
- What is the optimal number of iterations?

#### Feature Importance
The HTML report shows which features each weak learner uses.

**Question 7**: Based on the boosting model, which features are most discriminative for predicting income >50K?

**Expected Important Features**:
- Capital gain/loss (strong economic indicators)
- Education level
- Age
- Hours per week
- Occupation/work class

### Exercise 5: Support Vector Machines (Bonus)
**Note**: Not included in original TP3 materials but mentioned in TP4 overview.

Compare decision trees with SVM for digit recognition using scikit-learn (see TP4 for CNN comparison).

## Key Concepts

### Decision Tree Construction
- **Greedy algorithm**: Select best split at each node based on information gain
- **Stopping criteria**: 
  - Depth limit (simple but arbitrary)
  - MDLPC (principled, automatic)
  - None (risks overfitting)

### Overfitting vs Underfitting
- **Underfitting**: Tree too simple, high bias, similar train/test error
- **Overfitting**: Tree too complex, high variance, train >> test accuracy
- **Good fit**: MDLPC balances bias-variance trade-off

### Boosting Intuition
- Combine weak learners (stumps, 2-leaf trees)
- Re-weight misclassified examples each iteration
- Final prediction: weighted vote of all stumps
- Often outperforms single complex tree

### Tree Interpretation
Each leaf shows:
- **P**: Number of training samples reaching this leaf
- **Majority class**: Predicted label
- **Probability**: Confidence in prediction (P(class|leaf))

## Expected Results Summary

| Model | Training Acc | Test Acc | Notes |
|-------|-------------|----------|-------|
| Naive | ~75% | ~75% | Baseline (majority class) |
| Manual Tree | Variable | Variable | Depends on feature selection |
| Auto Tree (d=2) | ~80-82% | ~79-81% | Simple, low variance |
| MDLPC Tree | ~83-85% | ~82-84% | Balanced complexity |
| Full Tree | ~100% | ~82-84% | Severe overfitting |
| AdaBoost (n=100) | ~87-90% | ~85-87% | Best performance |

## Files
- `adult.data`, `adult.test`, `adult.names`: Dataset files
- `adult.png`: Example tree visualization
- `arbre.txt`: Example manual tree rules
- `rules2tree.pl`: Perl converter script
- `bonzaiboost`: Pre-compiled binary (Linux x86-64)

## Running the Exercises
```bash noexec
cd TP3/adult/

# Exercise 1
bonzaiboost -S adult -d 0
bonzaiboost -S adult -C < adult.data > /dev/null

# Exercise 2
# 1. Create your tree rules in my_tree.txt
# 2. Convert and test
rules2tree.pl adult my_tree.txt
bonzaiboost -S adult -C < adult.data > /dev/null

# Exercise 3
bonzaiboost -S adult -d 2
bonzaiboost -S adult -mdlpc
bonzaiboost -S adult -v

# Exercise 4
bonzaiboost -S adult -boost adamh -n 100
bonzaiboost -S adult -boost adamh -n 100 --info > results.html
```

## System Requirements
- Linux x86-64 (binary is pre-compiled)
- Graphviz for tree visualization (`dot` command)
- Perl for rules2tree.pl script
- Modern web browser for HTML reports

## Learning Outcomes
1. Understand baseline importance and accuracy limitations
2. Experience feature selection intuition vs automatic learning
3. Recognize overfitting and its causes
4. Compare stopping criteria effectiveness
5. Appreciate boosting for improving weak learners
6. Interpret decision trees and feature importance
7. Use visualization tools for model analysis
