---
title: "TP1 : Introduction a scikit-learn, arbres de decision et apprentissage bayesien"
sidebar_position: 1
---

# TP1 : Introduction a scikit-learn, arbres de decision et apprentissage bayesien

## Presentation
Ce TP introduit les concepts fondamentaux de l'apprentissage automatique avec scikit-learn, en se concentrant sur :
- La manipulation et la visualisation de jeux de donnees
- La classification par k plus proches voisins (kNN)
- Les arbres de decision (construction, elagage, visualisation)
- La classification par Naive Bayes avec des features nominales et continues

## Jeux de donnees
- **iris** : Jeu de donnees classique des fleurs d'iris (150 echantillons, 4 features, 3 classes)
- **heart.csv** : Jeu de donnees de prediction de maladies cardiaques
- **weather.csv** : Donnees meteorologiques avec features continues
- **weather.nominal.csv** : Donnees meteorologiques avec features categorielles

## Exercices couverts

### Partie 1 : Les bases de scikit-learn
- Chargement et exploration des jeux de donnees
- Comprehension des problemes de representation des donnees
- Visualisation des relations entre features
- Separation train/test et validation croisee

### Partie 2 : k plus proches voisins
- Implementation du classifieur kNN
- Comprehension de l'erreur d'entrainement vs l'erreur de test
- Techniques de validation croisee K-Fold
- Evaluation de la precision avec les matrices de confusion

### Partie 3 : Arbres de decision
- Construction d'arbres de decision avec le critere d'entropie
- Visualisation des arbres avec Graphviz
- Comprehension des parametres de l'arbre (max_depth, min_samples)
- Elagage par complexite de cout (Cost Complexity Pruning) pour prevenir le sur-apprentissage
- Recherche du parametre alpha optimal

### Partie 4 : Apprentissage bayesien
**Exercice Q16** : Calcul manuel des probabilites a posteriori pour les donnees meteorologiques
- Comprehension des hypotheses du Naive Bayes
- Calcul des vraisemblances pour les features nominales (distribution multinomiale)
- Calcul des vraisemblances pour les features continues (distribution normale)
- Application du theoreme de Bayes : P(classe|x) = P(classe) * P(x|classe) / P(x)

Exemple de calcul pour `x = ['sunny', 73, 81, 'TRUE']` :
- Calculer les probabilites a priori : P(classe=0) = 5/14, P(classe=1) = 9/14
- Calculer les vraisemblances pour les features nominales (outlook, windy)
- Calculer les vraisemblances pour les features continues (temperature, humidity) avec la distribution normale
- Combiner avec la regle de Bayes et normaliser

#### Gestion des differents types de features
- **Features categorielles** : Utiliser `CategoricalNB` avec les features encodees
- **Features mixtes** : Discretiser les features continues en categories

## Concepts cles

### Elagage des arbres de decision
L'elagage par complexite de cout (CCP) equilibre la precision de l'arbre avec sa complexite :
- Generer les valeurs d'alpha avec `cost_complexity_pruning_path`
- Entrainer un arbre pour chaque alpha
- Evaluer sur un jeu de validation pour trouver l'alpha optimal
- Le meilleur alpha est generalement autour de 0.02 pour le jeu de donnees heart

### Hypotheses du Naive Bayes
- Les features sont conditionnellement independantes sachant la classe
- Les features nominales suivent des distributions multinomiales
- Les features continues suivent des distributions normales dont les parametres sont estimes a partir des donnees d'entrainement

## Resume des resultats
- **kNN** : ~97% de precision sur iris (validation croisee 10-fold)
- **Arbre de decision (elague)** : ~80% de precision en validation sur le jeu heart
- **Naive Bayes** : ~93% de precision sur le jeu d'entrainement weather

## Fichiers
- `TP1_complete.ipynb` : Notebook original avec tous les exercices
- `heart.csv` : Jeu de donnees de maladies cardiaques
- `weather.csv` : Jeu de donnees meteorologiques avec features continues
- `weather.nominal.csv` : Jeu de donnees meteorologiques avec features categorielles

## Lancer le code
```bash noexec
# Installer les dependances
pip install scikit-learn pandas numpy matplotlib graphviz dtreeviz

# Lancer le notebook Jupyter
jupyter notebook TP1_complete.ipynb
```

## Remarques
- Graphviz doit etre installe au niveau du systeme pour la visualisation des arbres
- dtreeviz fournit des visualisations ameliorees des arbres de decision avec des histogrammes
- La validation croisee permet d'estimer l'erreur reelle (performance de generalisation)
- L'erreur empirique sur le jeu d'entrainement sous-estime generalement l'erreur reelle
