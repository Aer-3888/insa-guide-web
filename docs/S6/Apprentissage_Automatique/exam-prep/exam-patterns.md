---
title: "Patterns d'examen et walkthroughs"
sidebar_position: 2
---

# Patterns d'examen et walkthroughs

## Type 1 : Calcul d'entropie et construction d'arbre (quasi-systematique)

### Enonce type

"On dispose du dataset suivant avec 4 attributs et une classe binaire. Calculer l'entropie initiale, le gain d'information pour chaque attribut, et construire l'arbre de decision complet."

### Walkthrough

**Donnees :** 10 exemples, 3 attributs (A, B, C), 2 classes (+, -)

| # | A | B | C | Classe |
|---|---|---|---|--------|
| 1 | a1 | b1 | c1 | + |
| 2 | a1 | b2 | c1 | + |
| 3 | a2 | b1 | c2 | + |
| 4 | a2 | b1 | c1 | - |
| 5 | a1 | b1 | c2 | + |
| 6 | a2 | b2 | c1 | - |
| 7 | a1 | b2 | c2 | - |
| 8 | a2 | b2 | c2 | - |
| 9 | a1 | b1 | c1 | + |
| 10 | a2 | b1 | c2 | - |

**Etape 1 : Entropie initiale**

5 positifs, 5 negatifs sur 10 :
$$H(S) = -\frac{5}{10}\log_2\frac{5}{10} - \frac{5}{10}\log_2\frac{5}{10} = -0.5 \times (-1) - 0.5 \times (-1) = 1.0$$

**Etape 2 : Gain pour l'attribut A**

A = a1 : exemples {1,2,5,7,9} => 4+, 1- :
$$H(S_{a1}) = -\frac{4}{5}\log_2\frac{4}{5} - \frac{1}{5}\log_2\frac{1}{5} = 0.722$$

A = a2 : exemples {3,4,6,8,10} => 1+, 4- :
$$H(S_{a2}) = -\frac{1}{5}\log_2\frac{1}{5} - \frac{4}{5}\log_2\frac{4}{5} = 0.722$$

$$\text{Gain}(A) = 1.0 - \left(\frac{5}{10} \times 0.722 + \frac{5}{10} \times 0.722\right) = 1.0 - 0.722 = 0.278$$

**Etape 3 : Gain pour B et C** (meme methode)

**Etape 4 : Choisir l'attribut avec le gain maximal comme racine.**

**Etape 5 : Pour chaque valeur de l'attribut choisi, recurser sur le sous-ensemble correspondant.**

### Astuces pour le calcul rapide

Valeurs de $-p\log_2(p)$ a connaitre :

| $p$ | $-p\log_2(p)$ |
|-----|---------------|
| 0.0 | 0.000 |
| 0.1 | 0.332 |
| 0.2 | 0.464 |
| 0.25 | 0.500 |
| 0.3 | 0.521 |
| 1/3 | 0.528 |
| 0.4 | 0.529 |
| 0.5 | 0.500 |
| 0.6 | 0.442 |
| 2/3 | 0.390 |
| 0.7 | 0.361 |
| 0.75 | 0.311 |
| 0.8 | 0.258 |
| 0.9 | 0.137 |
| 1.0 | 0.000 |

---

## Type 2 : Classification Naive Bayes (tres frequent)

### Enonce type

"Calculer la classification d'un nouvel exemple par Naive Bayes. Donner les probabilites a posteriori de chaque classe."

### Walkthrough

**Donnees d'entrainement :** 14 exemples, 4 attributs, 2 classes (play=oui/non).

**Nouvel exemple :** outlook=sunny, temperature=cool, humidity=high, windy=TRUE

**Etape 1 : Probabilites a priori**
$$P(\text{oui}) = \frac{9}{14} \approx 0.643, \quad P(\text{non}) = \frac{5}{14} \approx 0.357$$

**Etape 2 : Vraisemblances**

| Feature | $P(v | \text{oui})$ | $P(v | \text{non})$ |
|---------|-------------------|-------------------|
| outlook=sunny | 2/9 = 0.222 | 3/5 = 0.600 |
| temperature=cool | 3/9 = 0.333 | 1/5 = 0.200 |
| humidity=high | 3/9 = 0.333 | 4/5 = 0.800 |
| windy=TRUE | 3/9 = 0.333 | 3/5 = 0.600 |

**Etape 3 : Calcul (hypothese naive)**

$$P(\text{oui} | x) \propto P(\text{oui}) \times \prod P(x_i | \text{oui})$$
$$= 0.643 \times 0.222 \times 0.333 \times 0.333 \times 0.333 = 0.00529$$

$$P(\text{non} | x) \propto P(\text{non}) \times \prod P(x_i | \text{non})$$
$$= 0.357 \times 0.600 \times 0.200 \times 0.800 \times 0.600 = 0.02057$$

**Etape 4 : Normalisation**

$$P(\text{oui} | x) = \frac{0.00529}{0.00529 + 0.02057} = 0.205 = 20.5\%$$
$$P(\text{non} | x) = \frac{0.02057}{0.00529 + 0.02057} = 0.795 = 79.5\%$$

**Prediction : NON (ne pas jouer)**

### Points de vigilance

- **Lissage de Laplace** : si une probabilite est 0 (un mot jamais vu dans une classe), tout le produit tombe a 0. Ajouter 1 au numerateur : $P(v|c) = \frac{\text{count}(v,c) + 1}{\text{count}(c) + |\text{vocabulaire}|}$
- **Log-probabilites** : en pratique, on travaille en log pour eviter les underflows : $\log P(c|x) = \log P(c) + \sum \log P(x_i|c)$

---

## Type 3 : KNN -- classification et influence de K (frequent)

### Enonce type

"On donne les 8 exemples suivants en 2D. Classifier le point (3, 4) avec K=1, K=3 et K=5."

### Walkthrough

**Etape 1 : Calculer les distances euclidiennes**

Pour chaque exemple $x_i$ : $d = \sqrt{(x_1 - 3)^2 + (x_2 - 4)^2}$

| Exemple | Position | Distance | Classe |
|---------|----------|----------|--------|
| 1 | (2, 3) | 1.41 | A |
| 2 | (3, 5) | 1.00 | B |
| 3 | (4, 4) | 1.00 | A |
| 4 | (1, 1) | 3.61 | B |
| 5 | (3, 3) | 1.00 | A |
| 6 | (5, 5) | 2.24 | B |
| 7 | (2, 5) | 1.41 | B |
| 8 | (4, 3) | 1.41 | A |

**Etape 2 : Trier par distance**

Ordre : {2, 3, 5} (d=1.00), {1, 7, 8} (d=1.41), {6} (d=2.24), {4} (d=3.61)

**Etape 3 : Voter**

- K=1 : voisin {2} = B => **Prediction B**
- K=3 : voisins {2, 3, 5} = 1B + 2A => **Prediction A**
- K=5 : voisins {2, 3, 5, 1, 7} = 2B + 3A => **Prediction A** (ex aequo pour les distances 1.41, on prend les 5 premiers apres tri)

**Observation :** K=1 et K=3 donnent des predictions differentes. K petit = sensible au bruit.

---

## Type 4 : AdaBoost -- calcul d'une iteration (occasionnel)

### Enonce type

"Effectuer une iteration d'AdaBoost sur les donnees suivantes avec le stump sur l'attribut X."

### Walkthrough

**Donnees :** 6 exemples, poids uniformes $w_i = 1/6$.

Le stump predit : exemples {1, 2, 3} corrects, exemples {4, 5} incorrects, exemple {6} correct.

**Etape 1 : Erreur ponderee**
$$\epsilon = w_4 + w_5 = \frac{1}{6} + \frac{1}{6} = \frac{2}{6} = 0.333$$

**Etape 2 : Poids de vote**
$$\alpha = \frac{1}{2} \ln\frac{1 - 0.333}{0.333} = \frac{1}{2} \ln(2) = 0.347$$

**Etape 3 : Mise a jour des poids**

Bien classes ($y_i \cdot h(x_i) = +1$) :
$$w_i' = \frac{1}{6} \times e^{-0.347} = \frac{1}{6} \times 0.707 = 0.118$$

Mal classes ($y_i \cdot h(x_i) = -1$) :
$$w_i' = \frac{1}{6} \times e^{+0.347} = \frac{1}{6} \times 1.414 = 0.236$$

**Etape 4 : Normalisation**
$$Z = 2\sqrt{0.333 \times 0.667} = 2 \times 0.471 = 0.943$$

$$w_{\text{bien}} = \frac{0.118}{0.943} = 0.125, \quad w_{\text{mal}} = \frac{0.236}{0.943} = 0.250$$

Verification : $4 \times 0.125 + 2 \times 0.250 = 0.500 + 0.500 = 1.0$ (OK)

---

## Type 5 : Questions de cours (toujours present)

### Questions recurrentes et reponses attendues

**Q: Expliquer la difference entre biais et variance.**
R: Le biais est l'erreur systematique due aux hypotheses du modele (trop simple = underfitting). La variance est la sensibilite du modele aux fluctuations du jeu d'entrainement (trop complexe = overfitting). Le compromis biais-variance est central en ML.

**Q: Pourquoi ne doit-on pas evaluer sur le jeu d'entrainement ?**
R: Parce que le modele a deja vu ces donnees. Il peut les avoir memorisees (surtout si modele complexe) et donner une estimation trop optimiste de sa performance. L'erreur d'entrainement sous-estime l'erreur de generalisation.

**Q: Quelle est l'hypothese du Naive Bayes ?**
R: L'independance conditionnelle des features sachant la classe : $P(x_1, ..., x_n | c) = \prod_i P(x_i | c)$. Cette hypothese est presque toujours fausse mais le modele fonctionne quand meme car on cherche l'argmax, pas les probabilites exactes.

**Q: Pourquoi K=1 donne 100% sur le train en KNN ?**
R: Car chaque point est son propre voisin le plus proche. Il se classe donc toujours correctement. C'est de l'overfitting pur.

**Q: Expliquer la difference entre bagging et boosting.**
R: Le bagging (ex: Random Forest) construit les classifieurs en parallele sur des sous-echantillons aleatoires. Le boosting (ex: AdaBoost) les construit sequentiellement, chaque nouveau classifieur corrigeant les erreurs du precedent via un systeme de poids.

---

## Formules a connaitre absolument

```
Entropie         : H(S) = -sum(pi * log2(pi))
Gini             : Gini(S) = 1 - sum(pi^2)
Gain info        : Gain(S,A) = H(S) - sum(|Sv|/|S| * H(Sv))
Bayes            : P(C|X) = P(X|C) * P(C) / P(X)
Naive Bayes      : P(x1,...,xn|C) = prod P(xi|C)
Distance eucl.   : d(x,y) = sqrt(sum (xi-yi)^2)
AdaBoost alpha   : alpha = (1/2) * ln((1-eps)/eps)
AdaBoost poids   : wi = wi * exp(-alpha * yi * ht(xi)) / Zt
AdaBoost Zt      : Zt = 2 * sqrt(eps * (1-eps))
AdaBoost pred    : H(x) = signe(sum alpha_t * ht(x))
Accuracy         : (VP+VN) / (VP+VN+FP+FN)
Precision        : VP / (VP+FP)
Rappel           : VP / (VP+FN)
F1               : 2*P*R / (P+R)
```

---

## Checklist finale de revision

### Theorie
- [ ] Apprentissage supervise vs non supervise vs renforcement
- [ ] Biais-variance : definition, diagnostic, remedes
- [ ] Sur-apprentissage : cause, detection, prevention
- [ ] Validation croisee K-fold : principe et implementation

### Arbres de decision
- [ ] Calculer l'entropie / Gini
- [ ] Calculer le gain d'information
- [ ] Construire un arbre ID3 complet
- [ ] Elagage : pre/post, CCP, alpha

### Naive Bayes
- [ ] Theoreme de Bayes : formule et calcul
- [ ] Hypothese naive : definition et justification
- [ ] Lissage de Laplace : pourquoi et comment
- [ ] MultinomialNB vs GaussianNB vs CategoricalNB

### KNN
- [ ] Distance euclidienne
- [ ] Influence de K (biais-variance)
- [ ] Malediction de la dimensionnalite

### Evaluation
- [ ] Matrice de confusion : VP, VN, FP, FN
- [ ] Accuracy, precision, rappel, F1
- [ ] Quand utiliser quelle metrique

### Boosting (si au programme)
- [ ] AdaBoost : alpha, mise a jour des poids, prediction
- [ ] Decision stump

### Code sklearn
- [ ] train_test_split, cross_val_score, GridSearchCV
- [ ] DecisionTreeClassifier, KNeighborsClassifier, MultinomialNB
- [ ] classification_report, confusion_matrix
- [ ] cost_complexity_pruning_path (CCP)
