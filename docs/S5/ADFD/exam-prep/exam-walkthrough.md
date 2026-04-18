---
title: "Methodologie d'examen : comment aborder chaque type de question"
sidebar_position: 2
---

# Methodologie d'examen : comment aborder chaque type de question

Ce document analyse les types de questions recurrents dans toutes les annales disponibles (2013-2025) et propose des strategies de resolution systematiques.

## Partie A : Types de questions Analyse de Donnees (AD)

### A1. Interpretation de l'ACP a partir de figures (frequence la plus elevee)

**Apparait dans** : 2015, 2016, 2017, 2019, 2020, 2021, 2023, 2025

**Ce qui vous est donne** : Un cercle des correlations et/ou un plan factoriel des individus, accompagne d'un tableau de donnees et d'un resume des valeurs propres.

**Ce que vous devez faire** :

#### Etape 1 : Determiner le nombre de composantes a conserver

Lire le tableau des valeurs propres. Calculer la variance cumulee. Indiquer quelles composantes depassent le seuil de 80%.

Exemple de reponse :
> "Les deux premieres composantes capturent respectivement 45% et 25% de la variance, soit 70% cumulee. En ajoutant la 3e composante (12%), on atteint 82%, ce qui depasse le seuil de 80%. On retient donc 3 composantes."

#### Etape 2 : Nommer les axes a partir du cercle des correlations

Regarder quelles variables sont les plus proches de chaque axe (correlation en valeur absolue la plus elevee).

Modele de reponse :
> "L'axe 1 est principalement lie aux variables [X, Y, Z] (correlations positives proches de 1) et negativement aux variables [A, B] (correlations proches de -1). Cet axe represente donc [interpretation metier]."

#### Etape 3 : Identifier les groupes de variables sur le cercle des correlations

- Variables proches : positivement correlees
- Variables opposees : negativement correlees
- Variables a 90 degres : independantes

Exemple :
> "Les variables Charbon et Gaz naturel sont proches sur le cercle, indiquant une correlation positive : les pays qui produisent beaucoup d'electricite au charbon en produisent aussi beaucoup au gaz. En revanche, Energies renouvelables est a l'oppose, indiquant une correlation negative."

#### Etape 4 : Interpreter les individus sur le plan factoriel

Identifier quels individus sont extremes (eloignes de l'origine) sur chaque axe. Relier leur position a l'interpretation des variables de l'etape 2.

Exemple :
> "La Chine et les USA sont situes a droite sur l'axe 1, ce qui correspond a une forte production d'electricite totale (coherent avec les variables Charbon et Gaz). La France est separee sur l'axe 2, coherent avec sa forte production nucleaire."

### A2. Questions sur la qualite de representation

**Apparait dans** : 2015, 2017, 2021, 2023

**Ce que vous devez calculer** : Les valeurs de cos^2 ou les contributions.

**Formule** : cos^2(i, k) = F_ik^2 / somme_j(F_ij^2)

**Strategie** :
1. Lire les coordonnees de l'individu sur chaque axe dans le tableau
2. Elever chaque coordonnee au carre
3. Diviser par la somme de toutes les coordonnees au carre
4. Un cos^2 eleve (> 0.5) signifie que l'individu est bien represente sur cet axe

Exemple de calcul :
> Le point A a les coordonnees (2.1, 0.3) sur PC1 et PC2.
> cos^2(A, PC1) = 2.1^2 / (2.1^2 + 0.3^2) = 4.41 / 4.50 = 0.98
> Le point A est tres bien represente sur le premier plan factoriel (98%).

### A3. "Pourquoi l'ACP normee ?" / "Quel type d'ACP ?"

**Apparait dans** : Presque chaque examen AD

**Reponse standard** :
> "On utilise l'ACP normee (centree-reduite) car les variables ont des unites differentes [ou des echelles differentes]. Sans standardisation, les variables avec les plus grandes valeurs numeriques domineraient l'analyse. L'ACP normee travaille sur la matrice de correlation plutot que la matrice de covariance."

**Quand NON normee** : Uniquement si toutes les variables sont dans la meme unite ET ont des ordres de grandeur comparables (rare aux examens).

### A4. Calcul de valeurs propres (matrice 2x2)

**Apparait dans** : 2015, 2017

**Methode** : Pour une matrice de correlation 2x2 :
```
R = | 1    r |
    | r    1 |

lambda_1 = 1 + r
lambda_2 = 1 - r
```

Pour le cas general, resoudre : det(R - lambda * I) = 0

### A5. Questions de pretraitement

**Apparait dans** : 2020, 2021, 2025

Questions courantes :
- "Comment traiteriez-vous les valeurs manquantes dans ce jeu de donnees ?"
- "Pourquoi la standardisation est-elle necessaire ?"
- "Quel est l'impact des valeurs aberrantes sur l'ACP ?"

**Strategie** : Etre specifique sur la methode ET justifier le choix en fonction des caracteristiques des donnees.

---

## Partie B : Types de questions Fouille de Donnees (FD)

### B1. Apriori a la main (frequence la plus elevee)

**Apparait dans** : 2013, 2016, 2019, 2021, 2023, 2024

**Donne** : Une base de transactions (5-10 transactions) et un seuil de support minimum.

**Modele de resolution pas a pas** :

```
ETAPE 1 : Compter le support de chaque item individuel
-------------------------------------------------
Item    | Comptage | Support | Frequent ?
--------|----------|---------|----------
A       | 7        | 7/10   | Oui (>= minsup)
B       | 3        | 3/10   | Non (< minsup)
...

L_1 = {A, C, D, E, ...}  (items avec support >= minsup)

ETAPE 2 : Generer C_2 (toutes les paires de L_1)
-------------------------------------------------
Candidat   | Comptage | Support | Frequent ?
-----------|----------|---------|----------
{A, C}     | 5        | 5/10   | Oui
{A, D}     | 3        | 3/10   | Non
...

L_2 = {{A,C}, {C,E}, ...}

ETAPE 3 : Generer C_3 (a partir de L_2, avec elagage par anti-monotonie)
-------------------------------------------------
Candidat     | Tous sous-ens. taille 2 dans L_2 ? | Comptage | Frequent ?
-------------|-------------------------------------|----------|----------
{A, C, E}   | {A,C}: Oui, {A,E}: Oui, {C,E}: Oui | 4       | Oui
{A, C, D}   | {A,C}: Oui, {A,D}: Non              | ELAGUE  | --
...
```

**CRITIQUE** : Toujours montrer l'etape d'elagage explicitement. Ecrire "Elague par anti-monotonie car {X,Y} absent de L_2."

### B2. Construction de l'arbre FP-Tree

**Apparait dans** : 2024

**Donne** : Une base de transactions et un support minimum.

**Pas a pas** :
1. Compter les frequences des items, supprimer les non frequents
2. Trier les items par frequence (decroissant) dans chaque transaction
3. Construire l'arbre en inserant les transactions une par une
4. Construire la base de motifs conditionnels pour chaque item (de bas en haut)
5. Construire les FP-trees conditionnels et extraire les itemsets frequents

**Conseil** : Dessiner l'arbre clairement avec les etiquettes des noeuds et les compteurs. Montrer le tableau d'en-tete avec les liens entre noeuds.

### B3. Classification DBSCAN (noyau/frontiere/bruit)

**Apparait dans** : 2016, 2019, 2023, 2024, 2025

**Donne** : Un ensemble de points 2D, une valeur eps et une valeur min_samples.

**Modele de resolution pas a pas** :

```
ETAPE 1 : Pour chaque point, lister les voisins dans le rayon eps
-------------------------------------------------
Point | Voisins (distance < eps) | Nombre | Type
------|--------------------------|--------|------
P1    | P2, P3, P5              | 3      | Noyau (>= min_samples=3)
P2    | P1, P3                  | 2      | Frontiere (< min_samples, mais voisin du noyau P1)
P3    | P1, P2, P4, P5          | 4      | Noyau
P6    | (aucun)                 | 0      | Bruit

ETAPE 2 : Former les clusters par connexite
-------------------------------------------------
Cluster 1 : P1, P2, P3, P4, P5 (connectes par les points noyaux)
Bruit : P6
```

**Conseil** : Dessiner les points sur du papier quadrille, tracer des cercles de rayon eps autour de chacun, et compter visuellement.

### B4. K-Means pas a pas

**Apparait dans** : 2016, 2019, 2025

**Donne** : Des centroides initiaux et des points de donnees.

**Pas a pas** :

```
Iteration 1 :
  Centroides : C1=(1,2), C2=(5,3)
  
  Point  | dist(C1) | dist(C2) | Assigne a
  -------|----------|----------|----------
  (0,1)  | 1.41     | 5.39     | C1
  (2,3)  | 1.41     | 3.00     | C1
  (6,4)  | 5.39     | 1.41     | C2
  
  Nouveaux centroides :
  C1 = moyenne de {(0,1), (2,3)} = (1, 2)
  C2 = moyenne de {(6,4)} = (6, 4)
  
Iteration 2 : ...
(Continuer jusqu'a ce que les centroides ne changent plus)
```

### B5. Comparer DBSCAN vs K-Means

**Apparait dans** : 2016, 2019, 2023, 2025

**Modele de reponse** (utiliser un tableau) :

| Critere | K-means | DBSCAN |
|---------|---------|--------|
| Parametre d'entree | K (nombre de clusters) | eps, min_samples |
| Forme des clusters | Convexe uniquement | Arbitraire |
| Gere le bruit | Non (tous les points assignes) | Oui (label = -1) |
| Deterministe | Non (depend de l'init) | Oui (pour noyau/bruit) |
| Complexite | O(nkd) - rapide | O(n log n) - modere |
| Ideal pour | Grandes donnees, K connu, clusters spheriques | Donnees spatiales, K inconnu, presence de bruit |

### B6. Regles d'association (confiance, lift)

**Apparait dans** : 2013, 2016, 2023

**Donne** : Des itemsets frequents avec leurs supports, on demande de calculer la confiance et le lift de regles specifiques.

**Formules** :
```
confiance(A -> B) = support(A union B) / support(A)
lift(A -> B) = confiance(A -> B) / support(B)
```

**Interpretation** :
- confiance = 0.8 signifie "80% des transactions contenant A contiennent aussi B"
- lift > 1 signifie "A et B apparaissent ensemble plus que ce que le hasard predit"
- lift = 1 signifie "A et B sont independants"

### B7. Analyse formelle de concepts (treillis de concepts)

**Apparait dans** : 2023, 2024

**Donne** : Un diagramme de treillis de concepts, on demande d'identifier les extensions et intensions.

**Definitions** :
- **Extension** d'un concept : l'ensemble des objets (individus) dans le concept
- **Intension** d'un concept : l'ensemble des attributs (proprietes) partages par tous les objets de l'extension

**Strategie** : Suivre les lignes dans le treillis. L'extension est l'union des objets en dessous du noeud. L'intension est l'intersection des attributs au-dessus du noeud.

### B8. Itemsets fermes vs maximaux

**Apparait dans** : 2024

**Definitions** :
- **Itemset ferme** : Un itemset frequent X tel qu'aucun sur-ensemble propre de X n'a le meme support. Equivalemment, X = fermeture(X).
- **Itemset maximal** : Un itemset frequent X tel qu'aucun sur-ensemble propre de X n'est frequent.

**Difference cle** :
> "Les motifs fermes conservent l'information de support (on peut retrouver le support de tout motif frequent a partir des motifs fermes). Les motifs maximaux ne conservent pas l'information de support mais sont moins nombreux. Les motifs fermes sont un compromis entre l'ensemble complet des motifs frequents (trop nombreux) et les motifs maximaux (perte d'information)."

### B9. Metriques de recherche d'information

**Apparait dans** : 2013

**Donne** : Une liste ordonnee de resultats de recherche avec des labels de pertinence (P/N).

**Formules** :
```
Precision a k = |pertinents dans les k premiers| / k
Rappel a k = |pertinents dans les k premiers| / |total pertinents|
MAP = moyenne des valeurs de precision a chaque position de document pertinent
R-Precision = Precision a R (ou R = nombre total de documents pertinents)
```

### B10. Questions de fouille de texte / NLP

**Apparait dans** : 2013

**Racinisation vs Lemmatisation** :
- **Racinisation** (stemming) : Troncature brute pour trouver la racine (porter -> port). Rapide mais imprecis.
- **Lemmatisation** : Reduction basee sur un dictionnaire vers le lemme (better -> good). Precis mais plus lent.

**Impact sur la precision** : La racinisation peut diminuer la precision en fusionnant des mots differents ayant des racines similaires (ex. "universite" et "univers" donnent tous deux la racine "univers").

---

## Partie C : Conseils specifiques par annee d'examen

### Examen 2025 (le plus recent)

- **Partie AD** : ACP sur un nouveau jeu de donnees. Attendre une interpretation du cercle des correlations, choix du nombre de composantes, plans factoriels individus/variables.
- **Partie FD** : Clustering + fouille de motifs. Attendre un deroulement de DBSCAN, des questions de comparaison et Apriori.

### Examen 2023

- **Partie AD (6 pages)** : Exercice complet d'ACP avec pretraitement.
- **Partie FD (8 pages)** : Analyse formelle de concepts (treillis), Apriori, et questions sur les tables de codes KRIMP.

### Examen 2024

- **Partie FD (10 pages)** : Treillis de concepts, itemsets fermes vs maximaux, construction FP-Tree, DBSCAN.

### Tendance historique

L'examen a ete remarquablement constant :
1. La partie AD inclut toujours un exercice d'interpretation d'ACP (cercle des correlations + plan factoriel)
2. La partie FD inclut toujours un exercice d'extraction d'itemsets (Apriori ou FP-Growth)
3. La partie FD inclut generalement un exercice de clustering (DBSCAN et/ou K-means)
4. Les examens recents (2023+) incluent des questions d'analyse formelle de concepts

## Checklist finale avant l'examen

### La veille
- [ ] Pratiquer la lecture d'un cercle des correlations d'une annale
- [ ] Derouler Apriori a la main sur un exemple a 5 transactions
- [ ] Derouler DBSCAN sur un exemple a 6 points
- [ ] Revoir les formules : support, confiance, lift, silhouette, cos^2, contribution
- [ ] Connaitre le tableau comparatif : CAH vs K-means vs DBSCAN

### Pendant l'examen
- [ ] Lire TOUTES les questions d'abord (5 minutes)
- [ ] Commencer par les questions de calcul mecanique (Apriori, deroulement DBSCAN)
- [ ] Pour les questions d'interpretation : toujours relier variables aux axes, puis individus aux axes
- [ ] Montrer toutes les etapes de calcul -- des points partiels sont attribues
- [ ] Pour les questions "justifiez" : donner la raison, pas seulement la reponse
- [ ] Verifier la variance cumulee lors du choix du nombre de composantes
