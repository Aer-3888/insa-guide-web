---
title: "Chapitre 8 -- Evaluation de modeles"
sidebar_position: 8
---

# Chapitre 8 -- Evaluation de modeles

Ce chapitre est fondamental pour l'examen : les metriques d'evaluation sont presentes dans quasiment tous les sujets.

---

## 1. Matrice de confusion

Pour un probleme binaire (2 classes) :

```
                    Prediction Positive    Prediction Negative
Reelle Positive     VP (True Positive)     FN (False Negative)
Reelle Negative     FP (False Positive)    VN (True Negative)
```

| Terme | Signification | Analogie |
|-------|-------------|---------|
| **VP** (TP) | Predit positif, est positif | Detecte un vrai malade |
| **VN** (TN) | Predit negatif, est negatif | Confirme une personne saine |
| **FP** (Type I) | Predit positif, est negatif | Fausse alarme |
| **FN** (Type II) | Predit negatif, est positif | Malade non detecte |

### Code Python

```python
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

cm = confusion_matrix(y_test, y_pred)
print(cm)

# Visualisation
disp = ConfusionMatrixDisplay(cm, display_labels=['Negatif', 'Positif'])
disp.plot(cmap='Blues')
plt.title('Matrice de confusion')
plt.show()
```

---

## 2. Metriques principales

### Accuracy (Precision globale)

$$\text{Accuracy} = \frac{VP + VN}{VP + VN + FP + FN} = \frac{\text{predictions correctes}}{\text{total}}$$

**Attention :** trompeuse si les classes sont desequilibrees. Si 95% des emails sont non-spam, un modele qui dit toujours "non-spam" a 95% d'accuracy mais est inutile.

### Precision

$$\text{Precision} = \frac{VP}{VP + FP}$$

"Parmi tout ce que j'ai predit positif, combien l'est vraiment ?"

**Quand la precision est importante :** quand les faux positifs sont couteux (ex : filtrage de spam -- on ne veut pas envoyer un email important dans le spam).

### Rappel (Recall / Sensibilite)

$$\text{Rappel} = \frac{VP}{VP + FN}$$

"Parmi tous les vrais positifs, combien ai-je detectes ?"

**Quand le rappel est important :** quand les faux negatifs sont couteux (ex : diagnostic medical -- on ne veut pas rater un malade).

### F1-Score

$$F_1 = 2 \cdot \frac{\text{Precision} \times \text{Rappel}}{\text{Precision} + \text{Rappel}}$$

Moyenne harmonique de precision et rappel. Utile quand on veut equilibrer les deux.

**Propriete :** $F_1$ est toujours entre $\min(\text{Precision}, \text{Rappel})$ et la moyenne arithmetique.

### Specificite

$$\text{Specificite} = \frac{VN}{VN + FP}$$

"Parmi tous les vrais negatifs, combien sont correctement identifies ?"

---

## 3. Exemple de calcul complet

Donnees : 100 patients, 30 malades, 70 sains.

| | Predit Malade | Predit Sain |
|---|---|---|
| **Reellement Malade** | VP = 25 | FN = 5 |
| **Reellement Sain** | FP = 10 | VN = 60 |

$$\text{Accuracy} = \frac{25 + 60}{100} = 85\%$$

$$\text{Precision} = \frac{25}{25 + 10} = \frac{25}{35} = 71.4\%$$

$$\text{Rappel} = \frac{25}{25 + 5} = \frac{25}{30} = 83.3\%$$

$$F_1 = 2 \cdot \frac{0.714 \times 0.833}{0.714 + 0.833} = 2 \cdot \frac{0.595}{1.547} = 76.9\%$$

### Code Python

```python
from sklearn.metrics import classification_report

print(classification_report(y_test, y_pred, target_names=['Sain', 'Malade']))
```

Sortie typique :
```
              precision    recall  f1-score   support
       Sain       0.92      0.86      0.89        70
     Malade       0.71      0.83      0.77        30
   accuracy                           0.85       100
  macro avg       0.82      0.85      0.83       100
weighted avg       0.86      0.85      0.85       100
```

---

## 4. Multiclasse

Pour $K > 2$ classes, la matrice de confusion est $K \times K$ :

```
               Pred A    Pred B    Pred C
Reelle A        15         2         3
Reelle B         1        18         1
Reelle C         2         3        15
```

Les metriques par classe se calculent en considerant chaque classe comme "positive" vs toutes les autres.

### Strategies de moyennage

| Strategie | Calcul | Quand l'utiliser |
|-----------|--------|-----------------|
| **macro** | Moyenne simple des scores par classe | Classes equilibrees |
| **weighted** | Moyenne ponderee par le support de chaque classe | Classes desequilibrees |
| **micro** | Calcul global (somme VP, FP, FN) | = Accuracy pour le multiclasse |

```python
from sklearn.metrics import f1_score

f1_macro = f1_score(y_test, y_pred, average='macro')
f1_weighted = f1_score(y_test, y_pred, average='weighted')
f1_micro = f1_score(y_test, y_pred, average='micro')
```

---

## 5. Courbe ROC et AUC

### Courbe ROC (Receiver Operating Characteristic)

La courbe ROC trace le **taux de vrais positifs** (rappel) en fonction du **taux de faux positifs** ($1 - \text{specificite}$) pour differents seuils de decision.

$$\text{TVP} = \frac{VP}{VP + FN} \quad \text{(rappel)}$$

$$\text{TFP} = \frac{FP}{FP + VN} \quad \text{(1 - specificite)}$$

### AUC (Area Under the Curve)

- **AUC = 1.0** : classifieur parfait.
- **AUC = 0.5** : pas mieux que le hasard (diagonale).
- **AUC < 0.5** : pire que le hasard (inverser les predictions !).

### Code Python

```python
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

# Probabilites (pas les predictions dures)
y_proba = clf.predict_proba(X_test)[:, 1]

# Courbe ROC
fpr, tpr, thresholds = roc_curve(y_test, y_proba)
auc = roc_auc_score(y_test, y_proba)

plt.plot(fpr, tpr, label=f'ROC (AUC = {auc:.3f})')
plt.plot([0, 1], [0, 1], 'k--', label='Hasard')
plt.xlabel('Taux de Faux Positifs')
plt.ylabel('Taux de Vrais Positifs (Rappel)')
plt.title('Courbe ROC')
plt.legend()
plt.show()
```

### Courbe Precision-Recall

Plus informative que ROC quand les classes sont tres desequilibrees :

```python
from sklearn.metrics import precision_recall_curve, average_precision_score

precision, recall, thresholds = precision_recall_curve(y_test, y_proba)
ap = average_precision_score(y_test, y_proba)

plt.plot(recall, precision, label=f'AP = {ap:.3f}')
plt.xlabel('Rappel')
plt.ylabel('Precision')
plt.title('Courbe Precision-Rappel')
plt.legend()
plt.show()
```

---

## 6. Comparaison des metriques par situation

| Situation | Metrique recommandee | Justification |
|-----------|---------------------|--------------|
| Classes equilibrees | Accuracy, F1 | Accuracy est fiable |
| Classes desequilibrees | F1, AUC, AP | Accuracy est trompeuse |
| Faux positifs couteux | Precision | Minimiser les fausses alarmes |
| Faux negatifs couteux | Rappel | Ne rater aucun positif |
| Comparaison de modeles | AUC | Independant du seuil |
| Multiclasse | F1 weighted | Tient compte du desequilibre |

---

## 7. Pieges classiques

- **Se fier uniquement a l'accuracy** : trompeuse avec des classes desequilibrees.
- **Confondre precision et rappel** : Precision = "parmi mes predictions positives". Rappel = "parmi les vrais positifs".
- **Oublier de specifier `average` en multiclasse** : `f1_score(y_test, y_pred)` sans `average` donne une erreur.
- **Comparer des modeles sur des metriques differentes** : toujours utiliser la meme metrique.
- **ROC sur classes desequilibrees** : la courbe ROC peut etre optimiste. Utiliser la courbe Precision-Recall.
- **Evaluer sur le train** : JAMAIS. Toujours sur un jeu de test ou par validation croisee.

---

## CHEAT SHEET

```
MATRICE DE CONFUSION (binaire)
              Pred+    Pred-
  Reel+       VP       FN
  Reel-       FP       VN

METRIQUES
  Accuracy  = (VP + VN) / (VP + VN + FP + FN)
  Precision = VP / (VP + FP)  -- parmi mes pred+, combien sont vrais ?
  Rappel    = VP / (VP + FN)  -- parmi les vrais+, combien detectes ?
  F1        = 2 * P * R / (P + R)
  Specificite = VN / (VN + FP)

ROC / AUC
  ROC : TPR (rappel) vs FPR (1-specificite) pour differents seuils
  AUC = 1.0 parfait, 0.5 hasard

MULTICLASSE
  macro    : moyenne simple par classe
  weighted : moyenne ponderee par support
  micro    : calcul global = accuracy

SKLEARN
  confusion_matrix(y_test, y_pred)
  classification_report(y_test, y_pred, target_names=[...])
  f1_score(y_test, y_pred, average='weighted')
  roc_auc_score(y_test, y_proba)
  roc_curve(y_test, y_proba)

QUAND UTILISER QUOI
  Classes equilibrees    => accuracy, F1
  Classes desequilibrees => F1 weighted, AUC, AP
  FP couteux            => precision
  FN couteux            => rappel
```
