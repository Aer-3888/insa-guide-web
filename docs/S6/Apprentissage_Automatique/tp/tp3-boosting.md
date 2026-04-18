---
title: "TP3 : Arbres de decision avec BonzaiBoost"
sidebar_position: 3
---

# TP3 : Arbres de decision avec BonzaiBoost

## Presentation
Ce TP utilise l'outil BonzaiBoost pour explorer l'apprentissage par arbres de decision, les algorithmes de boosting et les compromis entre differents criteres d'arret. L'accent est mis sur la comprehension de l'impact de la complexite de l'arbre sur les performances et sur l'interpretation des arbres de decision.

## Jeu de donnees : Adult Income
**Probleme** : Predire si une personne gagne plus de 50 000 $/an a partir de donnees de recensement.

### Fichiers
- `adult.data` : Donnees d'entrainement (32 561 enregistrements)
- `adult.test` : Donnees de test (16 281 enregistrements)
- `adult.names` : Description du jeu de donnees et definitions des attributs
- `adult.png` : Visualisation pre-generee de l'arbre de decision
- `arbre.txt` : Exemple de regles de decision
- `rules2tree.pl` : Script Perl pour convertir les regles au format BonzaiBoost

### Attributs (14 features)
Informations demographiques et professionnelles :
- age, workclass, education, marital-status, occupation, relationship
- race, sex, capital-gain, capital-loss, hours-per-week, native-country
- Cible : income (>50K, <=50K)

## Outil BonzaiBoost
Binaire pre-compile (`bonzaiboost`) pour l'apprentissage par arbres de decision et le boosting.

### Commandes principales
```bash noexec
# Generer un classifieur naif (label majoritaire)
bonzaiboost -S adult -d 0

# Evaluer sur les donnees d'entrainement
bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluer sur les donnees de test
bonzaiboost -S adult -C < adult.test > /dev/null

# Construire un arbre de decision avec limite de profondeur
bonzaiboost -S adult -d 2

# Construire un arbre avec le critere d'arret MDLPC
bonzaiboost -S adult -mdlpc

# Construire l'arbre complet (sans critere d'arret)
bonzaiboost -S adult -v

# Boosting avec AdaBoost
bonzaiboost -S adult -boost adamh -n 100

# Generer la visualisation de l'arbre
dot -Tpng adult.tree.dot > adult.png

# Generer un rapport de performance HTML
bonzaiboost -S adult -boost adamh -n 100 --info > adult.boost.log.html
```

## Exercices

### Exercice 1 : Reference naive
**Objectif** : Comprendre la performance de reference

Un classifieur naif predit la classe majoritaire pour toutes les instances. En classification binaire avec des classes desequilibrees, cela fournit une reference utile.

**Questions** :
1. Quelle est la precision sur le train/test du classifieur naif ?
2. Pourquoi cela peut-il etre trompeur (notamment avec des donnees desequilibrees) ?

**Resultats attendus** :
- Precision elevee si une classe domine (~75% si 75% gagnent <=50K)
- Mauvaise performance sur la classe minoritaire
- Illustre l'importance de regarder au-dela de la precision globale

### Exercice 2 : Construction manuelle d'un arbre de decision
**Objectif** : Concevoir un arbre binaire a 4 feuilles par intuition

**Tache** : Creer une structure d'arbre en utilisant des features qui separent intuitivement les hauts/bas revenus.

**Exemple d'arbre** (tire de arbre.txt) :
```
racine=age 35
├─ oui: native-country=England
│   ├─ yes=infeq50K, no=infeq50K
└─ non: race=Black
    ├─ yes=sup50K, no=infeq50K
```

**Etapes** :
1. Ecrire les regles de l'arbre dans un fichier texte
2. Convertir au format BonzaiBoost : `rules2tree.pl adult votrefichierderegles`
3. Evaluer : `bonzaiboost -S adult -C < adult.data > /dev/null`
4. Comparer avec la reference naive

**Questions** :
1. Votre arbre manuel surpasse-t-il le classifieur naif ?
2. Si vous gardez les regles mais changez les decisions des feuilles pour correspondre aux statistiques d'entrainement, les resultats s'ameliorent-ils ?

**Objectif pedagogique** : Comprendre que de bons splits importent, mais les predictions des feuilles doivent correspondre aux donnees.

### Exercice 3 : Construction automatique de l'arbre
**Objectif** : Comparer les criteres d'arret et la complexite de l'arbre

#### 3a. Arbre avec limite de profondeur (d=2, 4 feuilles)
```bash noexec
bonzaiboost -S adult -d 2
bonzaiboost -S adult -C < adult.data > /dev/null  # Precision sur le train
bonzaiboost -S adult -C < adult.test > /dev/null   # Precision sur le test
dot -Tpng adult.tree.dot > adult_d2.png
```

**Questions** :
1. L'arbre automatique surpasse-t-il votre arbre manuel ?
2. Interpretez l'arbre : quelles features a-t-il choisies ? Pourquoi ?

#### 3b. Critere d'arret MDLPC
MDLPC (Minimum Description Length Principle) determine automatiquement la taille optimale de l'arbre.

```bash noexec
bonzaiboost -S adult -mdlpc
bonzaiboost -S adult -C < adult.data > /dev/null
bonzaiboost -S adult -C < adult.test > /dev/null
```

**Questions** :
1. Comment la performance de MDLPC se compare-t-elle a celle de l'arbre a profondeur limitee ?
2. Quel est l'ecart entre la precision d'entrainement et de test (sur-apprentissage) ?

#### 3c. Arbre complet (sans arret)
```bash noexec
bonzaiboost -S adult -v
```

**Questions** :
3. Comment les precisions d'entrainement vs test se comparent-elles ?
4. Quel phenomene observe-t-on (sur-apprentissage) ?

**Observations attendues** :
- Profondeur limitee (d=2) : Sous-apprentissage, precisions train/test similaires
- MDLPC : Complexite equilibree, faible ecart train/test
- Arbre complet : Precision parfaite sur le train, forte baisse sur le test (sur-apprentissage)

### Exercice 4 : AdaBoost
**Objectif** : Explorer le boosting pour ameliorer les performances

AdaBoost combine plusieurs classifieurs faibles (stumps) en un ensemble puissant.

```bash noexec
# Entrainer un modele de boosting (100 iterations)
bonzaiboost -S adult -boost adamh -n 100

# Evaluer
bonzaiboost -S adult -boost adamh -C < adult.data > /dev/null
bonzaiboost -S adult -boost adamh -C < adult.test > /dev/null
```

**Questions** :
5. Comment les resultats du boosting se comparent-ils aux arbres individuels ?

#### Analyse du taux d'erreur
Generer les courbes d'apprentissage avec gnuplot :

```bash noexec
# Generer un rapport HTML avec les resultats iteration par iteration
bonzaiboost -S adult -boost adamh -n 100 --info > adult.boost.log.html

# Ouvrir dans un navigateur pour voir :
# - L'erreur d'entrainement en fonction des iterations
# - L'erreur de test en fonction des iterations
# - Le comportement de convergence
```

**Question 6** : Analysez les courbes :
- L'erreur d'entrainement diminue-t-elle de facon monotone ?
- L'erreur de test diminue-t-elle puis augmente-t-elle (sur-apprentissage) ?
- Quel est le nombre optimal d'iterations ?

#### Importance des features
Le rapport HTML montre quelles features chaque classifieur faible utilise.

**Question 7** : D'apres le modele de boosting, quelles features sont les plus discriminantes pour predire un revenu >50K ?

**Features importantes attendues** :
- Capital gain/loss (indicateurs economiques forts)
- Niveau d'education
- Age
- Heures par semaine
- Profession / classe de travail

### Exercice 5 : Machines a vecteurs de support (Bonus)
**Note** : Non inclus dans les materiaux originaux du TP3 mais mentionne dans la presentation du TP4.

Comparer les arbres de decision avec les SVM pour la reconnaissance de chiffres avec scikit-learn (voir TP4 pour la comparaison avec les CNN).

## Concepts cles

### Construction d'un arbre de decision
- **Algorithme glouton** : Selectionner le meilleur split a chaque noeud selon le gain d'information
- **Criteres d'arret** :
  - Limite de profondeur (simple mais arbitraire)
  - MDLPC (fonde sur un principe, automatique)
  - Aucun (risque de sur-apprentissage)

### Sur-apprentissage vs sous-apprentissage
- **Sous-apprentissage** : Arbre trop simple, biais eleve, erreurs train/test similaires
- **Sur-apprentissage** : Arbre trop complexe, variance elevee, train >> test en precision
- **Bon ajustement** : MDLPC equilibre le compromis biais-variance

### Intuition du boosting
- Combiner des classifieurs faibles (stumps, arbres a 2 feuilles)
- Re-ponderer les exemples mal classes a chaque iteration
- Prediction finale : vote pondere de tous les stumps
- Surpasse souvent un seul arbre complexe

### Interpretation de l'arbre
Chaque feuille indique :
- **P** : Nombre d'exemples d'entrainement atteignant cette feuille
- **Classe majoritaire** : Label predit
- **Probabilite** : Confiance dans la prediction (P(classe|feuille))

## Resume des resultats attendus

| Modele | Precision train | Precision test | Remarques |
|--------|----------------|----------------|-----------|
| Naif | ~75% | ~75% | Reference (classe majoritaire) |
| Arbre manuel | Variable | Variable | Depend du choix des features |
| Arbre auto (d=2) | ~80-82% | ~79-81% | Simple, faible variance |
| Arbre MDLPC | ~83-85% | ~82-84% | Complexite equilibree |
| Arbre complet | ~100% | ~82-84% | Sur-apprentissage severe |
| AdaBoost (n=100) | ~87-90% | ~85-87% | Meilleure performance |

## Fichiers
- `adult.data`, `adult.test`, `adult.names` : Fichiers du jeu de donnees
- `adult.png` : Exemple de visualisation d'arbre
- `arbre.txt` : Exemple de regles manuelles d'arbre
- `rules2tree.pl` : Script Perl de conversion
- `bonzaiboost` : Binaire pre-compile (Linux x86-64)

## Lancer les exercices
```bash noexec
cd TP3/adult/

# Exercice 1
bonzaiboost -S adult -d 0
bonzaiboost -S adult -C < adult.data > /dev/null

# Exercice 2
# 1. Creer vos regles dans mon_arbre.txt
# 2. Convertir et tester
rules2tree.pl adult mon_arbre.txt
bonzaiboost -S adult -C < adult.data > /dev/null

# Exercice 3
bonzaiboost -S adult -d 2
bonzaiboost -S adult -mdlpc
bonzaiboost -S adult -v

# Exercice 4
bonzaiboost -S adult -boost adamh -n 100
bonzaiboost -S adult -boost adamh -n 100 --info > results.html
```

## Configuration requise
- Linux x86-64 (le binaire est pre-compile)
- Graphviz pour la visualisation des arbres (commande `dot`)
- Perl pour le script rules2tree.pl
- Navigateur web moderne pour les rapports HTML

## Objectifs d'apprentissage
1. Comprendre l'importance de la reference et les limites de la precision
2. Experimenter la selection de features par intuition vs l'apprentissage automatique
3. Reconnaitre le sur-apprentissage et ses causes
4. Comparer l'efficacite des criteres d'arret
5. Apprecier le boosting pour ameliorer les classifieurs faibles
6. Interpreter les arbres de decision et l'importance des features
7. Utiliser les outils de visualisation pour l'analyse des modeles
