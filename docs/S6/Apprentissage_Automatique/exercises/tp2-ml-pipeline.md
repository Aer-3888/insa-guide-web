---
title: "TP2 - Construction d'un pipeline ML : absences aux rendez-vous"
sidebar_position: 2
---

# TP2 - Construction d'un pipeline ML : absences aux rendez-vous

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp2_ml_pipeline/TP2_complete.ipynb`

---

## Exercice 1 : Description des donnees

### Charger le jeu de donnees et examiner sa structure.

**Reponse :**

```python noexec
import pandas as pd
import numpy as np

dataset_name = 'no_show.csv'
df = pd.read_csv(dataset_name)
print(f"Number of entries: {len(df)}")
df.head()
```

**Sortie attendue :**
```
Number of entries: 110527
```

Le jeu de donnees contient 14 colonnes avec les attributs suivants :

| Attribut | Type | Signification |
|----------|------|---------------|
| PatientId | Numerique | Identifiant unique du patient |
| AppointmentID | Numerique | Identifiant unique du rendez-vous |
| Gender | Nominal (binaire) | Genre de l'individu (F/M) |
| ScheduledDay | Date/heure | Date et heure de la prise de rendez-vous |
| AppointmentDay | Date/heure | Date du rendez-vous prevu |
| Age | Numerique | Age de l'individu |
| Neighbourhood | Nominal | Quartier de l'individu (81 valeurs uniques) |
| Scholarship | Binaire | 1 si l'individu beneficie d'une bourse |
| Hipertension | Binaire | 1 si l'individu souffre d'hypertension |
| Diabetes | Binaire | 1 si l'individu souffre de diabete |
| Alcoholism | Binaire | 1 si l'individu souffre d'alcoolisme |
| Handcap | Binaire | 1 si l'individu presente un handicap |
| SMS_received | Binaire | 1 si l'individu a recu un rappel par SMS |
| No-show | Binaire | Si l'individu s'est presente ou non |

### Observer les statistiques cles

```python noexec
print("Number of individuals:", len(df['PatientId'].unique()), "unique out of", len(df))
print("Number of appointments:", len(df['AppointmentID'].unique()), "unique out of", len(df))
print("These people live in neighbourhoods such as", df['Neighbourhood'].unique())
```

**Sortie attendue :**
```
Number of individuals: 62299 unique out of 110527
Number of appointments: 110527 unique out of 110527
These people live in neighbourhoods such as ['JARDIM DA PENHA' 'MATA DA PRAIA' ... 'PARQUE INDUSTRIAL']
```

**Explication :** 62 299 patients uniques pour 110 527 rendez-vous signifie que certains patients ont plusieurs rendez-vous. Chaque rendez-vous a un identifiant unique. Il y a 81 quartiers distincts (feature a haute cardinalite).

---

## Exercice 2 : Formatage correct des donnees

### Pre-traiter les donnees : encoder les variables categorielles, gerer les dates, creer la feature AppointmentDelay.

**Reponse :**

```python noexec
proc_df = df.copy()
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
# Gender : F=0, M=1
proc_df['Gender'] = le.fit_transform(df['Gender'])
# Neighbourhood : encoder en entiers (0 a 80)
proc_df['Neighbourhood'] = le.fit_transform(df['Neighbourhood'])
# No-show : "No"=0 (present), "Yes"=1 (absent)
proc_df['No-show'] = df['No-show'].apply(lambda x: int(x == 'Yes'))

# Convertir les dates en timestamps Unix flottants
import time
converter = lambda x: time.mktime(time.strptime(x, "%Y-%m-%dT%H:%M:%SZ"))
proc_df['ScheduledDay'] = df['ScheduledDay'].apply(converter)
proc_df['AppointmentDay'] = df['AppointmentDay'].apply(converter)

# Creer AppointmentDelay : nombre de jours entre la prise de rendez-vous et le rendez-vous
proc_df['AppointmentDelay'] = proc_df['AppointmentDay'] - proc_df['ScheduledDay']
# Les rendez-vous le jour meme peuvent etre negatifs (AppointmentDay n'a pas d'heure) ; corriger cela
# Diviser aussi par 86400 pour convertir les secondes en jours
proc_df['AppointmentDelay'] = proc_df['AppointmentDelay'].apply(
    lambda x: max(x, 0) / 86400
)
# Convertir AppointmentDay en jour de l'annee pour la lisibilite
proc_df['AppointmentDay'] = proc_df['AppointmentDay'].apply(
    lambda x: int(time.strftime("%j", time.localtime(x)))
)

proc_df.head()
```

**Sortie attendue :** Un DataFrame avec toutes les colonnes numeriques incluant la nouvelle colonne `AppointmentDelay` montrant le delai en jours (0.0 pour les rendez-vous le jour meme).

**Explication :** La feature `AppointmentDelay` est creee en calculant la difference entre la date du rendez-vous et la date de prise de rendez-vous, en convertissant en jours, et en mettant les valeurs negatives a 0. C'est l'etape d'ingenierie de features cle de ce TP -- elle s'avere etre la feature la plus importante.

---

## Exercice 3 : Isolation des jeux d'entrainement et de test

### Construire les jeux train/test qui seront reutilises pour tous les modeles.

**Reponse :**

```python noexec
from sklearn.model_selection import train_test_split

# Supprimer PatientId et AppointmentID : identifiants, pas des features
Xframe = proc_df.drop(columns=['No-show', 'PatientId', 'AppointmentID'])
Yframe = proc_df['No-show']

# Construire les jeux d'entrainement et de test
x_train, x_test, y_train, y_test = train_test_split(
    Xframe, Yframe,
    random_state=int(time.time()),
    test_size=0.25
)
print(len(y_train), "entries in the training set")
print(len(y_test), "entries in the testing set")
```

**Sortie attendue :**
```
82895 entries in the training set
27632 entries in the testing set
```

**Explication :** La meme separation train/test est reutilisee pour TOUS les modeles de ce TP afin de garantir une comparaison equitable. PatientId et AppointmentID sont supprimes car ce sont des identifiants, pas des features predictives.

---

## Exercice 4 : Classifieur Random Forest (reference)

### Utiliser un Random Forest comme reference avec validation croisee, puis analyser l'importance des features.

**Reponse :**

```python noexec
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

the_rand_forest = RandomForestClassifier()  # Defaut : 100 arbres
before = time.time()
t_scores = cross_val_score(the_rand_forest, Xframe, Yframe, cv=4)
duration = time.time() - before
print("Test Accuracy: {}%".format(round(t_scores.mean() * 100, 2)))
print("Cross-fold validation took {} seconds".format(round(duration)))
```

**Sortie attendue :**
```
Test Accuracy: 78.06%
Cross-fold validation took 45 seconds
```

### Quelles sont les features les plus significatives ?

```python noexec
# Entrainer une fois sur le train pour obtenir l'importance des features
the_rand_forest.fit(x_train, y_train)
print("Fitted")
print("Accuracy: {}%".format(round(the_rand_forest.score(x_test, y_test) * 100, 2)))

# Importance des features
precision = the_rand_forest.feature_importances_
importances = sorted(zip(Xframe.columns, precision), key=lambda v: -v[1])
for colname, prec in importances:
    print("{} : {}%".format(colname, round(prec * 100, 2)))
```

**Sortie attendue :**
```
Accuracy: 79.8%
AppointmentDelay : 26.32%
ScheduledDay     : 24.66%
Age              : 17.22%
Neighbourhood    : 15.82%
AppointmentDay   : 9.37%
Gender           : 1.92%
SMS_received     : 1.27%
Scholarship      : 0.89%
Hipertension     : 0.83%
Diabetes         : 0.67%
Handcap          : 0.52%
Alcoholism       : 0.51%
```

**Explication :** La feature ingenieree `AppointmentDelay` (26.32%) est la plus importante. Plus le delai entre la prise de rendez-vous et la date du rendez-vous est long, plus il est probable que le patient le manque. Les features medicales (Hipertension, Diabetes, etc.) contribuent chacune a moins de 1% -- ce sont de mauvais predicteurs d'absence.

### Analyse de correlation (Pairplot)

```python noexec
import seaborn as sns
import matplotlib.pyplot as plt

sns.set_style('whitegrid')
# Prendre un echantillon aleatoire de 5% pour la vitesse de visualisation
_, x, _, y = train_test_split(Xframe, Yframe, test_size=0.05, random_state=40)
x['No-show'] = y
sns.pairplot(
    x[['Gender', 'SMS_received', 'Age', 'ScheduledDay',
       'AppointmentDay', 'AppointmentDelay', 'No-show']],
    hue="No-show", diag_kind='hist', height=5
)
plt.show()
```

**Sortie attendue :** Une matrice de nuages de points croises pour les features les plus importantes, colores par classe (present vs absent). Des regroupements notables apparaissent dans `AppointmentDay/AppointmentDelay` et `AppointmentDelay/Age`.

---

## Exercice 5 : K plus proches voisins

### 5a : Premiere approche avec un K fixe

```python noexec
from sklearn import neighbors

nb_neighb = 70
clf = neighbors.KNeighborsClassifier(nb_neighb)
clf.fit(x_train, y_train)
print('accuracy on testing is {}%'.format(round(100 * clf.score(x_test, y_test), 2)))
```

**Sortie attendue :**
```
accuracy on testing is 79.76%
```

### 5b : Visualiser les deux features les plus significatives

```python noexec
%matplotlib inline
x = Xframe
y = Yframe
xi = "AppointmentDelay"
yi = "ScheduledDay"

colors = ["green", "red"]
for num_label in range(2):
    plt.scatter(
        x[y == num_label][xi],
        x[y == num_label][yi],
        marker=".",
        color=colors[num_label],
        label=["Show", "No-show"][num_label]
    )
plt.legend()
plt.xlabel(xi)
plt.ylabel(yi)
plt.title(f"No Show Data Set - {xi} / {yi}")
plt.show()
```

**Sortie attendue :** Les points "Show" (vert) et "No-show" (rouge) sont fortement melanges. Il n'y a pas de frontiere de decision claire en 2D, ce qui confirme la difficulte de ce jeu de donnees.

### 5c : Reglage du meta-parametre K

```python noexec
results = []
possible_neighbours_parameters = (
    [1, 2, 3, 5, 10, 15]
    + list(range(20, 200, 10))
    + list(range(200, 300, 5))
    + [300, 400, 500, 1000]
)

print("Changing meta-parameter :")
# Separer l'entrainement en fit/validation (75/25)
xfit, xvalidate, yfit, yvalidate = train_test_split(
    x_train, y_train, test_size=0.25
)

for nb_neighb in possible_neighbours_parameters:
    clf = neighbors.KNeighborsClassifier(nb_neighb)
    print(f" {nb_neighb}", end="", flush=True)
    clf.fit(xfit, yfit)
    print(" ok", end="", flush=True)
    results.append(100 * clf.score(xvalidate, yvalidate))
    print(" ok", end="", flush=True)

print(" Done")
best_k = possible_neighbours_parameters[results.index(max(results))]
print("Best performance: k={}".format(best_k))
```

**Sortie attendue :**
```
Best performance: k=60
```

### 5d : Tracer la courbe de validation

```python noexec
%matplotlib inline
best_valid = max(results)
plt.axline(
    (min(possible_neighbours_parameters), best_valid),
    (max(possible_neighbours_parameters), best_valid),
    color="green", label="best validation score"
)
plt.scatter(
    possible_neighbours_parameters,
    results,
    marker=".",
    color="red",
    label="Validation score"
)
plt.legend()
plt.xlabel("Value for number of neighbours")
plt.ylabel("Validation score result (%)")
plt.title("No Show Data Set - validation on KNN number of neighbours")
plt.show()
```

**Sortie attendue :** La courbe de validation monte rapidement de K=1 (~72%) a K=20 (~79%), puis forme un plateau autour de 79.7-79.8% pour K entre 50 et 200. La courbe est lisse et bien definie grace a la separation fit/validation fixe.

### 5e : Test final avec le meilleur K

```python noexec
clf = neighbors.KNeighborsClassifier(best_k)
clf.fit(x_train, y_train)
print("The final testing score for k={} is {}% .".format(
    best_k, round(100 * clf.score(x_test, y_test), 2)
))
```

**Sortie attendue :**
```
The final testing score for k=60 is 79.77% .
```

**Explication :** KNN avec K=60 surpasse legerement la reference Random Forest. La courbe de validation presente un plateau clair, indiquant une performance robuste. Initialement, avec des separations train/validation changeantes a chaque entrainement, les courbes etaient instables -- utiliser une separation fixe produit des resultats bien plus propres.

---

## Exercice 6 : Classification par Naive Bayes

### 6a : Choix du modele -- le probleme des features mixtes

Le probleme avec `sklearn.naive_bayes` est qu'il ne propose que des modeles capables de gerer un seul type de feature, pas des combinaisons. Deux strategies sont explorees.

### 6b : Approche 1 -- Supprimer les variables numeriques

Garder uniquement les 8 features categorielles/binaires et utiliser `CategoricalNB`.

```python noexec
from sklearn.naive_bayes import CategoricalNB

# Restreindre aux features categorielles uniquement
categorical_cols = ['Gender', 'Neighbourhood', 'Scholarship', 'Hipertension',
                    'Diabetes', 'Alcoholism', 'Handcap', 'SMS_received']

x_cat_train = pd.DataFrame()
x_cat_test = pd.DataFrame()
for col in categorical_cols:
    x_cat_train[col] = x_train[col].copy()
    x_cat_test[col] = x_test[col].copy()

clf = CategoricalNB()
clf.fit(x_cat_train, y_train)
print("Test Accuracy: {}%".format(round(clf.score(x_cat_test, y_test) * 100, 2)))
```

**Sortie attendue :**
```
Test Accuracy: 79.76%
```

**Explication :** Malgre la perte des features les plus importantes (AppointmentDelay, ScheduledDay, Age), CategoricalNB atteint 79.76% -- quasiment identique a KNN. Cela suggere que les features categorielles/binaires portent suffisamment d'information pour ce probleme.

### 6c : Approche 2 -- Discretiser les features continues en categories

Transformer Age, AppointmentDelay, ScheduledDay et AppointmentDay en categories discretes.

| Age | Categorie | Code |
|-----|-----------|------|
| 0-12 | enfant | 0 |
| 13-19 | adolescent | 1 |
| 20-30 | jeune | 2 |
| 31-50 | adulte | 3 |
| 51-65 | senior | 4 |
| 66-80 | age | 5 |
| 81+ | tres age | 6 |

| AppointmentDelay | Categorie | Code |
|------------------|-----------|------|
| 0 | aujourd'hui | 0 |
| 1-6 | semaine | 1 |
| 7-14 | deux semaines | 2 |
| 15-31 | mois | 3 |
| 32-62 | deux mois | 4 |
| 63+ | plus tard | 5 |

Pour ScheduledDay et AppointmentDay : extraire le jour de la semaine (0-6).

```python noexec
x_scal_train = x_train.copy()
x_scal_test = x_test.copy()

def select_fun_age(age):
    if age < 13:
        return 0  # enfant
    elif 13 <= age <= 19:
        return 1  # adolescent
    elif 20 <= age <= 30:
        return 2  # jeune
    elif 31 <= age <= 50:
        return 3  # adulte
    elif 51 <= age <= 65:
        return 4  # senior
    elif 66 <= age <= 80:
        return 5  # age
    else:
        return 6  # tres age

def select_fun_apd(apd):
    if apd == 0:
        return 0  # aujourd'hui
    elif 1 <= apd <= 6:
        return 1  # semaine
    elif 7 <= apd <= 14:
        return 2  # deux semaines
    elif 15 <= apd <= 31:
        return 3  # mois
    elif 32 <= apd <= 62:
        return 4  # deux mois
    else:
        return 5  # plus tard

# Appliquer les transformations
x_scal_train['Age'] = x_train['Age'].apply(select_fun_age)
x_scal_test['Age'] = x_test['Age'].apply(select_fun_age)

x_scal_train['AppointmentDelay'] = x_train['AppointmentDelay'].apply(select_fun_apd)
x_scal_test['AppointmentDelay'] = x_test['AppointmentDelay'].apply(select_fun_apd)

# ScheduledDay : jour de la semaine (%u donne 1-7, soustraire 1 pour 0-6)
x_scal_train['ScheduledDay'] = x_train['ScheduledDay'].apply(
    lambda x: int(time.strftime("%u", time.localtime(x))) - 1
)
x_scal_test['ScheduledDay'] = x_test['ScheduledDay'].apply(
    lambda x: int(time.strftime("%u", time.localtime(x))) - 1
)

# AppointmentDay : jour de la semaine (1er janvier 2016 etait un vendredi = jour 5)
x_scal_train['AppointmentDay'] = x_train['AppointmentDay'].apply(
    lambda x: (x - 1 + 4) % 7 + 1
)
x_scal_test['AppointmentDay'] = x_test['AppointmentDay'].apply(
    lambda x: (x - 1 + 4) % 7 + 1
)

x_scal_train.head()
```

### Entrainer et evaluer avec les donnees discretisees

```python noexec
results = []
fold_num = 4
for _ in range(fold_num):
    clf = CategoricalNB()
    xfit, xvalid, yfit, yvalid = train_test_split(
        x_scal_train, y_train, test_size=1 / fold_num
    )
    clf.fit(xfit, yfit)
    results.append(clf.score(xvalid, yvalid) * 100)

print("Average test Accuracy: {}%".format(round(sum(results) / fold_num, 2)))
```

**Sortie attendue :**
```
Average test Accuracy: 79.08%
```

**Explication :** La discretisation permet d'utiliser toutes les features avec CategoricalNB, mais le score (79.08%) est legerement inferieur a l'Approche 1 (79.76%). La perte d'information liee au regroupement des features continues en categories grossieres n'est pas compensee par le gain d'avoir plus de features.

---

## Exercice 7 : Boosting de stumps (AdaBoost)

### 7a : Reglage du nombre d'estimateurs

```python noexec
from sklearn.ensemble import AdaBoostClassifier

possible_nbes = [1] + list(range(2, 50, 2)) + list(range(50, 500, 50))
xfit, xvalid, yfit, yvalid = train_test_split(x_train, y_train, test_size=0.25)

results = []
for nbe in possible_nbes:
    clf = AdaBoostClassifier(n_estimators=nbe)
    print(f" {nbe}", end="", flush=True)
    clf.fit(xfit, yfit)
    print(" ok", end="", flush=True)
    results.append(100 * clf.score(xvalid, yvalid))
    print(" ok", end="", flush=True)

print(" Done")
best_nbe = possible_nbes[results.index(max(results))]
print("Best performance: n={}".format(best_nbe))
```

**Sortie attendue (variable) :**
```
Best performance: n=1
```

Le meilleur nombre d'estimateurs varie d'une execution a l'autre (1, 7, 50, 100...).

### 7b : Tracer la courbe de validation

```python noexec
%matplotlib inline
best_valid = max(results)
plt.axline(
    (min(possible_nbes), best_valid),
    (max(possible_nbes), best_valid),
    color="green", label="best validation score"
)
plt.scatter(
    possible_nbes,
    results,
    marker=".",
    color="red",
    label="Validation score"
)
plt.legend()
plt.xlabel("Value for number of estimators in the boost")
plt.ylabel("Validation score result (%)")
plt.title("No Show Data Set - validation on boost number estimators")
plt.show()
```

**Sortie attendue :** Contrairement a la courbe lisse du KNN, la courbe de validation d'AdaBoost est **chaotique et erratique**. Le score oscille entre 79% et 80% sans tendance claire. Il n'y a pas de nombre optimal evident d'estimateurs.

### 7c : Test final

```python noexec
clf = AdaBoostClassifier(n_estimators=best_nbe)
clf.fit(x_train, y_train)
print("Accuracy of AdaBoostClassifier: {}%".format(
    round(clf.score(x_test, y_test) * 100, 2)
))
```

**Sortie attendue :** ~79-80%

**Explication :** Le boosting n'apporte aucun gain significatif de performance sur ce jeu de donnees. La courbe de validation est chaotique, ce qui signifie qu'il n'y a pas de valeur optimale stable pour le nombre d'estimateurs. La precision ne depasse jamais 80% de maniere consistante.

---

## Exercice 8 : Conclusion

### Comparaison finale des modeles

| Modele | Configuration | Precision test | Remarques |
|--------|--------------|----------------|-----------|
| Random Forest | 100 arbres, CV=4 | 78.06% (CV) / 79.8% (test) | Bonne reference, importance des features |
| KNN | K=60 | 79.77% | Meilleur modele, plateau clair |
| Naive Bayes (categoriel) | CategoricalNB | 79.76% | Etonnamment bon malgre des features manquantes |
| Naive Bayes (discretise) | CategoricalNB + discretisation | 79.08% | La discretisation perd de l'information |
| AdaBoost | n_estimators variable | ~79-80% | Pas de gain significatif, courbe chaotique |

**Conclusions cles :**

1. **L'ingenierie de features est cruciale.** La feature ingenieree `AppointmentDelay` est le meilleur predicteur (26.32% d'importance dans le Random Forest). La connaissance du domaine ameliore tous les modeles.

2. **Les modeles simples peuvent surpasser les complexes.** KNN avec K=60 est le meilleur modele malgre sa simplicite.

3. **Pourquoi aucun modele ne depasse 80%.** Le taux d'absence est d'environ 20%, ce qui signifie qu'un classifieur naif qui predit toujours "present" atteint deja ~80%. Tous les modeles depassent a peine cette reference, ce qui suggere que les features disponibles sont faiblement predictives et que des facteurs importants (motivation personnelle, urgences, oubli) ne sont pas captures dans les donnees.

4. **Des separations train/test coherentes comptent.** Utiliser la meme separation pour tous les modeles garantit une comparaison equitable. Utiliser la meme separation fit/validation au sein du reglage KNN produit des courbes de validation plus propres et reproductibles.
