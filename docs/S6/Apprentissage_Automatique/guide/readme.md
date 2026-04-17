---
title: "Guide -- Apprentissage Automatique / Machine Learning (S6)"
sidebar_position: 0
---

# Guide -- Apprentissage Automatique / Machine Learning (S6)

Guide de revision complet pour le cours d'Apprentissage Automatique de 3e annee INSA Rennes. Chaque chapitre couvre la theorie detaillee, les formules mathematiques, des exemples pratiques et du code Python exploitable.

---

## Roadmap d'apprentissage

```
Fondamentaux supervises (01)
    |
    +---> Regression lineaire (02)
    +---> Regression logistique & Classification (03)
    +---> Arbres de decision & Random Forests (04)
    +---> Support Vector Machines (05)
    +---> Reseaux de neurones (06)
    |
Apprentissage non supervise (07)
    |
Evaluation de modeles (08)
    |
Scikit-learn & Python ML (09)
```

---

## Table des matieres

| # | Chapitre | Fichier | Description |
|---|----------|---------|-------------|
| 01 | [Fondamentaux de l'apprentissage supervise](/S6/Apprentissage_Automatique/guide/01-supervised-fundamentals) | `01_supervised_fundamentals.md` | Biais-variance, overfitting, validation croisee, separation train/test |
| 02 | [Regression lineaire](/S6/Apprentissage_Automatique/guide/02-linear-regression) | `02_linear_regression.md` | Moindres carres, descente de gradient, Ridge, Lasso |
| 03 | [Regression logistique & Classification](/S6/Apprentissage_Automatique/guide/03-logistic-regression) | `03_logistic_regression.md` | Sigmoide, frontiere de decision, multiclasse, softmax |
| 04 | [Arbres de decision & Random Forests](/S6/Apprentissage_Automatique/guide/04-decision-trees) | `04_decision_trees.md` | Entropie, gain d'information, Gini, elagage, bagging, boosting |
| 05 | [Support Vector Machines](/S6/Apprentissage_Automatique/guide/05-svm) | `05_svm.md` | Hyperplans, marges, astuce du noyau, classification SVM |
| 06 | [Reseaux de neurones](/S6/Apprentissage_Automatique/guide/06-neural-networks) | `06_neural_networks.md` | Perceptron, MLP, retropropagation, fonctions d'activation |
| 07 | [Apprentissage non supervise](/S6/Apprentissage_Automatique/guide/07-unsupervised) | `07_unsupervised.md` | K-means, clustering hierarchique, PCA, reduction de dimension |
| 08 | [Evaluation de modeles](/S6/Apprentissage_Automatique/guide/08-model-evaluation) | `08_model_evaluation.md` | Accuracy, precision, rappel, F1, ROC/AUC, matrice de confusion |
| 09 | [Scikit-learn & Python ML](/S6/Apprentissage_Automatique/guide/09-sklearn-python) | `09_sklearn_python.md` | Pipelines, preprocessing, selection de modele, GridSearchCV |

---

## Prerequis

- **Probabilites** : lois de base, theoreme de Bayes, distributions.
- **Algebre lineaire** : vecteurs, matrices, produit scalaire, transposees.
- **Python** : variables, boucles, fonctions, numpy, pandas.
- **Calcul** : derivees, derivees partielles, gradient.

---

## Comment utiliser ce guide

1. **Lis les chapitres dans l'ordre** pour une progression naturelle, ou saute directement a celui qui t'interesse.
2. **Reproduis le code** dans un Jupyter Notebook ou Google Colab.
3. **Utilise les cheat sheets** en fin de chaque chapitre pour des revisions rapides avant l'examen.
4. **Consulte les exercices** (`../exercises/`) et la preparation d'examen (`../exam-prep/`) pour t'entrainer.

---

## Structure de chaque chapitre

| Section | Contenu |
|---------|---------|
| **Concepts cles** | Theorie fondamentale et intuitions |
| **Formules mathematiques** | Equations en LaTeX avec explications |
| **Exemple detaille** | Calculs pas a pas sur des donnees concretes |
| **Code Python** | Implementation complete avec scikit-learn |
| **Pieges classiques** | Erreurs frequentes a eviter |
| **Cheat Sheet** | Resume condense pour revision rapide |
