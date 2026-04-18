---
title: "Guide de preparation aux examens ADFD"
sidebar_position: 0
---

# Guide de preparation aux examens ADFD

## Format des examens

Le cours ADFD comporte generalement **deux examens distincts** :

| Examen | Nom | Duree | Poids | Sujets cles |
|--------|-----|-------|-------|-------------|
| **DS AD** | Analyse de Donnees | ~1.5-2h | ~50% | ACP, Cercle des correlations, Pretraitement, Reduction de dimension |
| **DS FD** | Fouille de Donnees | ~1.5-2h | ~50% | Clustering (DBSCAN, K-means, CAH), Apriori, Fouille de motifs |

Certaines annees combinent les deux en un seul **DS ADFD**.

**Documents autorises** : Generalement aucun document autorise (examen sans document). Verifiez aupres de l'enseignant.

## Annales disponibles

| Annee | Partie | Fichier |
|-------|--------|---------|
| 2025 | AD | `Analyse de donnees.pdf` |
| 2025 | FD | `Fouille de donnees.pdf` |
| 2024 | FD | `adfd_2024_fouille.pdf` |
| 2024 | Combine | `main24_final.pdf` |
| 2023 | AD | `Sujet AD.pdf` |
| 2023 | FD | `Sujet FD.pdf` |
| 2023 | Copie etudiant | `Youenn ADFD.pdf` |
| 2021 | Combine | `Sujet 2021.pdf` |
| 2021 | Copie etudiant | `Hugo DS 2021.pdf` |
| 2020 | AD | `Sujet AD 2020.pdf` |
| 2020 | Correction | `Exo1 Correction_.docx` |
| 2019 | Combine | `Sujet.pdf` |
| 2017 | AD | `Sujet AD 2017.pdf` + correction |
| 2016 | AD | `Sujet AD 2016.pdf` + copie etudiant |
| 2016 | FD | `Sujet FD 2016.pdf` + corrections |
| 2015 | AD | `Sujet AD 2015.pdf` |
| 2013 | FD | `Sujet FD 2013.pdf` |

## Strategie d'examen

### Gestion du temps

| Partie d'examen | Strategie recommandee |
|-----------------|----------------------|
| 5 premieres minutes | Lire TOUTES les questions, identifier les faciles et les difficiles |
| Questions avec tableaux de donnees | Les faire en premier -- elles sont mecaniques et rapportent des points |
| Interpretation de l'ACP | Passer du temps sur le cercle des correlations -- c'est la ou se trouvent la plupart des points |
| Apriori a la main | Suivre l'algorithme etape par etape, montrer le travail |
| Reponse courte / justification | Etre concis mais precis -- 2-3 phrases maximum |

### Ce qu'il faut prioriser

**Sujets a haut rendement** (frequemment testes, beaucoup de points) :

1. **Lecture du cercle des correlations** -- Presque chaque examen AD l'inclut. Savoir :
   - Identifier quelles variables sont correlees avec quels axes
   - Expliquer ce que chaque axe "signifie" en termes du domaine
   - Identifier les paires de variables correlees/anti-correlees/independantes
   - Evaluer la qualite de representation (proximite du bord du cercle)

2. **Algorithme Apriori a la main** -- Chaque examen FD demande de :
   - Calculer le support d'itemsets donnes
   - Generer les candidats et elaguer par anti-monotonie
   - Trouver tous les itemsets frequents pour un minsup donne

3. **DBSCAN pas a pas** -- Beaucoup d'examens FD incluent :
   - Classifier les points en noyau, frontiere ou bruit
   - Derouler l'algorithme sur un petit exemple 2D
   - Comparer DBSCAN avec K-means

4. **Interpretation des valeurs propres / variance** -- Savoir :
   - Lire un diagramme des valeurs propres
   - Decider combien de composantes garder
   - Calculer la variance cumulee expliquee

### Types de questions courants

#### Type 1 : "Interpretez ce cercle des correlations"
A partir d'un trace du cercle des correlations, expliquer :
- Que represente chaque axe ?
- Quelles variables contribuent le plus a chaque axe ?
- Y a-t-il des variables correlees ? Lesquelles ?
- Qu'en est-il de l'individu X -- ou serait-il sur le plan factoriel et pourquoi ?

**Strategie** : Regarder quelles variables sont les plus proches de chaque axe. Nommer l'axe en fonction de la signification dans le domaine de ces variables. Puis chercher les groupes de variables sur le cercle.

#### Type 2 : "Appliquer Apriori a ce jeu de donnees"
A partir d'une petite base de transactions et d'un minsup :
- Trouver L_1 (itemsets frequents de taille 1)
- Generer C_2, calculer les supports, trouver L_2
- Generer C_3 avec elagage par anti-monotonie, trouver L_3
- Lister tous les itemsets frequents

**Strategie** : Utiliser une approche systematique par tableaux. Montrer chaque candidat et son comptage de support. Indiquer clairement les etapes d'elagage.

#### Type 3 : "Avec ces parametres DBSCAN, classifiez ces points"
A partir d'un ensemble de points 2D, eps et min_samples :
- Pour chaque point, lister ses voisins
- Classifier en noyau, frontiere ou bruit
- Former les clusters
- Comparer avec le resultat K-means

**Strategie** : Dessiner les points, tracer des cercles de rayon eps autour de chacun. Compter les voisins methodiquement.

#### Type 4 : "Expliquer la difference entre..."
Questions de comparaison (CAH vs K-means, DBSCAN vs K-means, ACP normee vs non normee) :

**Strategie** : Utiliser un tableau de comparaison structure. Aborder ces points :
- Quand utiliser chacun
- Avantages et inconvenients
- Parametres requis
- Type de clusters produits

#### Type 5 : "Combien de composantes garder ?"
A partir de valeurs propres ou d'un diagramme :
- Appliquer la regle des 80%
- Appliquer le critere de Kaiser (valeur propre > 1)
- Identifier le coude

**Strategie** : Montrer les trois methodes et enoncer votre conclusion. En cas de desaccord, privilegier la regle des 80%.

## Checklist sujet par sujet

### ACP (examen Analyse de Donnees)

- [ ] Savoir quand utiliser l'ACP normee vs non normee
  - Normee : variables avec des unites ou des echelles tres differentes
  - Non normee : variables homogenes et comparables
- [ ] Savoir calculer les valeurs propres d'une matrice de correlation (cas 2x2)
- [ ] Lire un diagramme des valeurs propres et determiner le nombre de composantes
- [ ] Interpreter le cercle des correlations (competence la plus importante)
- [ ] Interpreter le plan factoriel des individus
- [ ] Calculer les contributions et la qualite de representation
- [ ] Relier les axes aux variables originales via le cercle
- [ ] Expliquer l'ACP a un non-expert en 2-3 phrases
- [ ] Connaitre les etapes mathematiques : centrer, calculer la matrice de correlation, decomposition en valeurs propres, projeter

### Clustering (examen Fouille de Donnees)

- [ ] Derouler l'algorithme K-means pas a pas (2D, petit exemple)
- [ ] Derouler l'algorithme DBSCAN pas a pas
- [ ] Classifier les points en noyau/frontiere/bruit pour DBSCAN
- [ ] Connaitre la formule et la signification du critere de Ward
- [ ] Lire un dendrogramme et choisir le nombre de clusters
- [ ] Comparer CAH, K-means, DBSCAN (format tableau)
- [ ] Calculer le score de silhouette sur un exemple simple
- [ ] Savoir ce que signifient inertie intra-classe et inter-classe
- [ ] Expliquer la methode du coude pour choisir K
- [ ] Savoir pourquoi DBSCAN est prefere pour les donnees spatiales

### Itemsets frequents (examen Fouille de Donnees)

- [ ] Calculer le support a la main
- [ ] Appliquer Apriori etape par etape
- [ ] Utiliser l'anti-monotonie pour elaguer les candidats
- [ ] Calculer la confiance et le lift des regles d'association
- [ ] Connaitre la difference entre itemsets fermes, maximaux et frequents
- [ ] Savoir ce que fait le minsup et comment le choisir

### Pretraitement

- [ ] Nommer les strategies de traitement des valeurs manquantes
- [ ] Connaitre la difference entre les methodes d'imputation (moyenne, mediane, mode)
- [ ] Expliquer pourquoi la standardisation est necessaire avant l'ACP
- [ ] Savoir ce que fait la transformation log et quand l'utiliser
- [ ] Expliquer la difference entre normalisation et standardisation

## Formules critiques

### ACP

```
Standardiser :    z = (x - moyenne) / ecart-type
Correlation :     r(x_j, F_k) = v_jk * sqrt(lambda_k)
Variance % :      lambda_k / somme(lambda_i) * 100
Contribution :    CTR(i,k) = F_ik^2 / (n * lambda_k)
cos^2 :           F_ik^2 / somme_j(F_ij^2)
```

### Clustering

```
Ward :            Delta(A,B) = (n_A*n_B)/(n_A+n_B) * ||c_A - c_B||^2
Silhouette :      s(i) = (b(i) - a(i)) / max(a(i), b(i))
K-means :         min somme_k somme_{i dans C_k} ||x_i - c_k||^2
DBSCAN :          point noyau si |N_eps(p)| >= min_samples
```

### Apriori

```
Support :         sup(X) = |{T : X dans T}| / |DB|
Confiance :       conf(X->Y) = sup(X union Y) / sup(X)
Lift :            lift(X->Y) = conf(X->Y) / sup(Y)
Anti-mono :       sup(X) < minsup => sup(X union Y) < minsup
```

## Erreurs courantes a eviter

1. **Confondre le cercle des correlations et le plan factoriel** : Le cercle montre les VARIABLES (mois, caracteristiques). Le plan factoriel montre les INDIVIDUS (villes, maisons). Ne les melangez jamais.

2. **Oublier de justifier DBSCAN plutot que K-means** : Quand on vous demande de choisir un algorithme, expliquez toujours POURQUOI. Pour des donnees spatiales avec bruit, la reponse est presque toujours DBSCAN.

3. **Ne pas montrer l'elagage dans Apriori** : Les correcteurs veulent voir que vous appliquez l'anti-monotonie. Ecrivez explicitement "elague car {A,C} absent de L_2" lors de la generation de C_3.

4. **Mal lire les variables proches de l'origine sur le cercle des correlations** : Si la fleche d'une variable est courte (pres du centre), elle n'est PAS bien representee -- n'interpretez pas sa position.

5. **Dire "l'ACP reduit le bruit"** : Plus precisement, l'ACP conserve les directions a forte variance et ecarte celles a faible variance. Si le bruit est dans les directions a faible variance, il est elimine. Mais l'ACP ne "sait" pas ce qu'est le bruit.

6. **Utiliser DBSCAN sur des coordonnees non metriques** : Si on vous donne des coordonnees GPS, mentionnez que la conversion en metres est necessaire pour que eps soit significatif.

7. **Oublier que K-means est non deterministe** : Differentes initialisations donnent des resultats differents. Mentionnez toujours `random_state` ou `n_init`.

8. **Ne pas calculer la variance cumulee** : Quand on demande "combien de composantes ?", montrez toujours la variance cumulee atteignant le seuil de 80%.
