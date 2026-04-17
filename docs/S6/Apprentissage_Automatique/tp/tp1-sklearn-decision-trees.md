---
title: "TP1: Introduction to scikit-learn, Decision Trees, and Bayesian Learning"
sidebar_position: 1
---

# TP1: Introduction to scikit-learn, Decision Trees, and Bayesian Learning

## Overview
This practical introduces fundamental machine learning concepts using scikit-learn, focusing on:
- Basic dataset manipulation and visualization
- k-Nearest Neighbors (kNN) classification
- Decision trees (construction, pruning, visualization)
- Naive Bayes classification with nominal and continuous features

## Datasets
- **iris**: Classic iris flower dataset (150 samples, 4 features, 3 classes)
- **heart.csv**: Heart disease prediction dataset
- **weather.csv**: Weather data with continuous features
- **weather.nominal.csv**: Weather data with categorical features

## Exercises Covered

### Part 1: scikit-learn Basics
- Loading and exploring datasets
- Understanding data representation issues
- Visualizing feature relationships
- Train/test splitting and cross-validation

### Part 2: k-Nearest Neighbors
- Implementing kNN classifier
- Understanding training vs test error
- Cross-fold validation techniques
- Evaluating accuracy with confusion matrices

### Part 3: Decision Trees
- Building decision trees with entropy criterion
- Visualizing trees with Graphviz
- Understanding tree parameters (max_depth, min_samples)
- Cost complexity pruning to prevent overfitting
- Finding optimal alpha parameter

### Part 4: Bayesian Learning
**Q16 Exercise**: Manual computation of posterior probabilities for weather data
- Understanding naive Bayes assumptions
- Computing likelihoods for nominal features (multinomial distribution)
- Computing likelihoods for continuous features (normal distribution)
- Applying Bayes' theorem: P(class|x) = P(class) * P(x|class) / P(x)

Example calculation for `x = ['sunny', 73, 81, 'TRUE']`:
- Compute prior probabilities: P(class=0) = 5/14, P(class=1) = 9/14
- Compute likelihoods for nominal features (outlook, windy)
- Compute likelihoods for continuous features (temperature, humidity) using normal distribution
- Combine using Bayes' rule and normalize

#### Handling Different Feature Types
- **Categorical features**: Use `CategoricalNB` with encoded features
- **Mixed features**: Scale continuous features into discrete categories

## Key Concepts

### Decision Tree Pruning
Cost complexity pruning balances tree accuracy with complexity:
- Generate alpha values using `cost_complexity_pruning_path`
- Train trees for each alpha
- Evaluate on validation set to find optimal alpha
- Best alpha typically around 0.02 for heart dataset

### Naive Bayes Assumptions
- Features are conditionally independent given the class
- Nominal features follow multinomial distributions
- Continuous features follow normal distributions with parameters estimated from training data

## Results Summary
- **kNN**: ~97% accuracy on iris (10-fold CV)
- **Decision Tree (pruned)**: ~80% validation accuracy on heart dataset
- **Naive Bayes**: ~93% training accuracy on weather dataset

## Files
- `TP1_complete.ipynb`: Original completed notebook with all exercises
- `heart.csv`: Heart disease dataset
- `weather.csv`: Weather dataset with continuous features
- `weather.nominal.csv`: Weather dataset with categorical features

## Running the Code
```bash
# Ensure dependencies are installed
pip install scikit-learn pandas numpy matplotlib graphviz dtreeviz

# Launch Jupyter notebook
jupyter notebook TP1_complete.ipynb
```

## Notes
- Graphviz must be installed system-wide for tree visualization
- dtreeviz provides enhanced decision tree visualizations with histograms
- Cross-validation helps estimate real error (generalization performance)
- Empirical error on training set typically underestimates real error
