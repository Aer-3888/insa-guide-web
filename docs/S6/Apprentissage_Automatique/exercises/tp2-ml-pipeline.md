---
title: "TP2 - Build-a-ML-Pipeline: No-Show Appointments"
sidebar_position: 2
---

# TP2 - Build-a-ML-Pipeline: No-Show Appointments

> Following teacher instructions from: `data/moodle/tp/tp2_ml_pipeline/TP2_complete.ipynb`

---

## Exercise 1: Describing the Data

### Load the dataset and examine its structure.

**Answer:**

```python
import pandas as pd
import numpy as np

dataset_name = 'no_show.csv'
df = pd.read_csv(dataset_name)
print(f"Number of entries: {len(df)}")
df.head()
```

**Expected output:**
```
Number of entries: 110527
```

The dataset contains 14 columns with the following attributes:

| Attribute | Type | Meaning |
|-----------|------|---------|
| PatientId | Numeric | Unique patient identifier |
| AppointmentID | Numeric | Unique appointment identifier |
| Gender | Nominal (binary) | Gender of the individual (F/M) |
| ScheduledDay | Datetime | Date and time when the appointment was scheduled |
| AppointmentDay | Datetime | Date of the scheduled appointment |
| Age | Numeric | Age of the individual |
| Neighbourhood | Nominal | Neighbourhood of the individual (81 unique values) |
| Scholarship | Binary | 1 if the individual received a scholarship |
| Hipertension | Binary | 1 if the individual has hypertension |
| Diabetes | Binary | 1 if the individual has diabetes |
| Alcoholism | Binary | 1 if the individual has alcoholism |
| Handcap | Binary | 1 if the individual is disabled |
| SMS_received | Binary | 1 if the individual received a SMS reminder |
| No-show | Binary | Whether or not the individual showed up |

### Observe key statistics

```python
print("Number of individuals:", len(df['PatientId'].unique()), "unique out of", len(df))
print("Number of appointments:", len(df['AppointmentID'].unique()), "unique out of", len(df))
print("These people live in neighbourhoods such as", df['Neighbourhood'].unique())
```

**Expected output:**
```
Number of individuals: 62299 unique out of 110527
Number of appointments: 110527 unique out of 110527
These people live in neighbourhoods such as ['JARDIM DA PENHA' 'MATA DA PRAIA' ... 'PARQUE INDUSTRIAL']
```

**Explanation:** 62,299 unique patients for 110,527 appointments means some patients have multiple appointments. Each appointment has a unique ID. There are 81 distinct neighbourhoods (high cardinality feature).

---

## Exercise 2: Formatting the Data Correctly

### Pre-process the data: encode categoricals, handle dates, create the AppointmentDelay feature.

**Answer:**

```python
proc_df = df.copy()
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
# Gender: F=0, M=1
proc_df['Gender'] = le.fit_transform(df['Gender'])
# Neighbourhood: encode to integers (0 to 80)
proc_df['Neighbourhood'] = le.fit_transform(df['Neighbourhood'])
# No-show: "No"=0 (showed up), "Yes"=1 (absent)
proc_df['No-show'] = df['No-show'].apply(lambda x: int(x == 'Yes'))

# Convert dates to floating point unix timestamps
import time
converter = lambda x: time.mktime(time.strptime(x, "%Y-%m-%dT%H:%M:%SZ"))
proc_df['ScheduledDay'] = df['ScheduledDay'].apply(converter)
proc_df['AppointmentDay'] = df['AppointmentDay'].apply(converter)

# Create AppointmentDelay: number of days between scheduling and appointment
proc_df['AppointmentDelay'] = proc_df['AppointmentDay'] - proc_df['ScheduledDay']
# Same-day appointments may be negative (AppointmentDay has no hour); fix that
# Also divide by 86400 to convert seconds to days
proc_df['AppointmentDelay'] = proc_df['AppointmentDelay'].apply(
    lambda x: max(x, 0) / 86400
)
# Convert AppointmentDay to day-of-year for readability
proc_df['AppointmentDay'] = proc_df['AppointmentDay'].apply(
    lambda x: int(time.strftime("%j", time.localtime(x)))
)

proc_df.head()
```

**Expected output:** A DataFrame with all numeric columns including the new `AppointmentDelay` column showing the delay in days (0.0 for same-day appointments).

**Explanation:** The `AppointmentDelay` feature is created by computing the difference between the appointment date and the scheduling date, converting to days, and clamping negatives to 0. This is the key feature engineering step of this TP -- it ends up being the most important feature.

---

## Exercise 3: Isolating Testing and Training Sets

### Build train/test sets that will be reused for all models.

**Answer:**

```python
from sklearn.model_selection import train_test_split

# Remove PatientId and AppointmentID: identifiers, not features
Xframe = proc_df.drop(columns=['No-show', 'PatientId', 'AppointmentID'])
Yframe = proc_df['No-show']

# Build training and testing sets
x_train, x_test, y_train, y_test = train_test_split(
    Xframe, Yframe,
    random_state=int(time.time()),
    test_size=0.25
)
print(len(y_train), "entries in the training set")
print(len(y_test), "entries in the testing set")
```

**Expected output:**
```
82895 entries in the training set
27632 entries in the testing set
```

**Explanation:** The same train/test split is reused for ALL models in this TP to guarantee a fair comparison. PatientId and AppointmentID are removed because they are identifiers, not predictive features.

---

## Exercise 4: Random Forest Classifier (Benchmark)

### Use a Random Forest as a benchmark with cross-validation, then analyze feature importance.

**Answer:**

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

the_rand_forest = RandomForestClassifier()  # Default: 100 trees
before = time.time()
t_scores = cross_val_score(the_rand_forest, Xframe, Yframe, cv=4)
duration = time.time() - before
print("Test Accuracy: {}%".format(round(t_scores.mean() * 100, 2)))
print("Cross-fold validation took {} seconds".format(round(duration)))
```

**Expected output:**
```
Test Accuracy: 78.06%
Cross-fold validation took 45 seconds
```

### What are the most significant features?

```python
# Fit once on train to get feature importances
the_rand_forest.fit(x_train, y_train)
print("Fitted")
print("Accuracy: {}%".format(round(the_rand_forest.score(x_test, y_test) * 100, 2)))

# Feature importances
precision = the_rand_forest.feature_importances_
importances = sorted(zip(Xframe.columns, precision), key=lambda v: -v[1])
for colname, prec in importances:
    print("{} : {}%".format(colname, round(prec * 100, 2)))
```

**Expected output:**
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

**Explanation:** The engineered feature `AppointmentDelay` (26.32%) is the most important. The longer the delay between scheduling and the appointment date, the more likely a patient is to miss it. Medical features (Hipertension, Diabetes, etc.) each contribute less than 1% -- they are poor predictors of no-shows.

### Correlation analysis (Pairplot)

```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.set_style('whitegrid')
# Get a random 5% sample for visualization speed
_, x, _, y = train_test_split(Xframe, Yframe, test_size=0.05, random_state=40)
x['No-show'] = y
sns.pairplot(
    x[['Gender', 'SMS_received', 'Age', 'ScheduledDay',
       'AppointmentDay', 'AppointmentDelay', 'No-show']],
    hue="No-show", diag_kind='hist', height=5
)
plt.show()
```

**Expected output:** A matrix of scatter plots crossed for the most important features, colored by class (show vs no-show). Notable clustering appears in `AppointmentDay/AppointmentDelay` and `AppointmentDelay/Age`.

---

## Exercise 5: K Nearest Neighbours

### 5a: First approach with a fixed K

```python
from sklearn import neighbors

nb_neighb = 70
clf = neighbors.KNeighborsClassifier(nb_neighb)
clf.fit(x_train, y_train)
print('accuracy on testing is {}%'.format(round(100 * clf.score(x_test, y_test), 2)))
```

**Expected output:**
```
accuracy on testing is 79.76%
```

### 5b: Visualize the two most significant features

```python
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

**Expected output:** The "Show" (green) and "No-show" (red) points are heavily mixed. There is no clear decision boundary in 2D, confirming the difficulty of this dataset.

### 5c: Tuning the meta-parameter K

```python
results = []
possible_neighbours_parameters = (
    [1, 2, 3, 5, 10, 15]
    + list(range(20, 200, 10))
    + list(range(200, 300, 5))
    + [300, 400, 500, 1000]
)

print("Changing meta-parameter :")
# Split training into fit/validation (75/25)
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

**Expected output:**
```
Best performance: k=60
```

### 5d: Plot the validation curve

```python
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

**Expected output:** The validation curve rises rapidly from K=1 (~72%) to K=20 (~79%), then forms a plateau around 79.7-79.8% for K between 50 and 200. The curve is smooth and well-defined thanks to the fixed fit/validation split.

### 5e: Final test with best K

```python
clf = neighbors.KNeighborsClassifier(best_k)
clf.fit(x_train, y_train)
print("The final testing score for k={} is {}% .".format(
    best_k, round(100 * clf.score(x_test, y_test), 2)
))
```

**Expected output:**
```
The final testing score for k=60 is 79.77% .
```

**Explanation:** KNN with K=60 slightly outperforms the Random Forest benchmark. The validation curve has a clear plateau, indicating robust performance. Initially, with changing train/validation splits per fit, the curves were wobbly -- using a fixed split produces much cleaner results.

---

## Exercise 6: Naive Bayesian Classification

### 6a: Choosing the model -- the problem with mixed features

The problem with `sklearn.naive_bayes` is that it only offers models capable of handling one kind of feature, not combinations. Two strategies are explored.

### 6b: Approach 1 -- Removing numeric variables

Keep only the 8 categorical/binary features and use `CategoricalNB`.

```python
from sklearn.naive_bayes import CategoricalNB

# Restrict to categorical features only
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

**Expected output:**
```
Test Accuracy: 79.76%
```

**Explanation:** Despite losing the most important features (AppointmentDelay, ScheduledDay, Age), CategoricalNB achieves 79.76% -- nearly identical to KNN. This suggests the categorical/binary features carry sufficient information for this problem.

### 6c: Approach 2 -- Scaling continuous features into categories

Scale Age, AppointmentDelay, ScheduledDay, and AppointmentDay into discrete categories.

| Age | Category | Code |
|-----|----------|------|
| 0-12 | child | 0 |
| 13-19 | teen | 1 |
| 20-30 | youth | 2 |
| 31-50 | adult | 3 |
| 51-65 | middle-aged | 4 |
| 66-80 | old-aged | 5 |
| 81+ | elderly | 6 |

| AppointmentDelay | Category | Code |
|------------------|----------|------|
| 0 | today | 0 |
| 1-6 | week | 1 |
| 7-14 | two_weeks | 2 |
| 15-31 | month | 3 |
| 32-62 | two_months | 4 |
| 63+ | later | 5 |

For ScheduledDay and AppointmentDay: extract the day of the week (0-6).

```python
x_scal_train = x_train.copy()
x_scal_test = x_test.copy()

def select_fun_age(age):
    if age < 13:
        return 0  # child
    elif 13 <= age <= 19:
        return 1  # teen
    elif 20 <= age <= 30:
        return 2  # youth
    elif 31 <= age <= 50:
        return 3  # adult
    elif 51 <= age <= 65:
        return 4  # middle-aged
    elif 66 <= age <= 80:
        return 5  # old-aged
    else:
        return 6  # elderly

def select_fun_apd(apd):
    if apd == 0:
        return 0  # today
    elif 1 <= apd <= 6:
        return 1  # week
    elif 7 <= apd <= 14:
        return 2  # two_weeks
    elif 15 <= apd <= 31:
        return 3  # month
    elif 32 <= apd <= 62:
        return 4  # two_months
    else:
        return 5  # later

# Apply transformations
x_scal_train['Age'] = x_train['Age'].apply(select_fun_age)
x_scal_test['Age'] = x_test['Age'].apply(select_fun_age)

x_scal_train['AppointmentDelay'] = x_train['AppointmentDelay'].apply(select_fun_apd)
x_scal_test['AppointmentDelay'] = x_test['AppointmentDelay'].apply(select_fun_apd)

# ScheduledDay: day of week (%u gives 1-7, subtract 1 for 0-6)
x_scal_train['ScheduledDay'] = x_train['ScheduledDay'].apply(
    lambda x: int(time.strftime("%u", time.localtime(x))) - 1
)
x_scal_test['ScheduledDay'] = x_test['ScheduledDay'].apply(
    lambda x: int(time.strftime("%u", time.localtime(x))) - 1
)

# AppointmentDay: day of week (Jan 1 2016 was a Friday = day 5)
x_scal_train['AppointmentDay'] = x_train['AppointmentDay'].apply(
    lambda x: (x - 1 + 4) % 7 + 1
)
x_scal_test['AppointmentDay'] = x_test['AppointmentDay'].apply(
    lambda x: (x - 1 + 4) % 7 + 1
)

x_scal_train.head()
```

### Train and evaluate with scaled data

```python
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

**Expected output:**
```
Average test Accuracy: 79.08%
```

**Explanation:** Discretization lets us use all features with CategoricalNB, but the score (79.08%) is slightly lower than Approach 1 (79.76%). The loss of information from binning continuous features into coarse categories is not compensated by the gain from having more features.

---

## Exercise 7: Stump Boosting (AdaBoost)

### 7a: Tuning the number of estimators

```python
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

**Expected output (variable):**
```
Best performance: n=1
```

The best number of estimators varies across runs (1, 7, 50, 100...).

### 7b: Plot the validation curve

```python
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

**Expected output:** Unlike the smooth KNN curve, the AdaBoost validation curve is **chaotic and erratic**. The score oscillates between 79% and 80% with no clear trend. There is no obvious optimal number of estimators.

### 7c: Final test

```python
clf = AdaBoostClassifier(n_estimators=best_nbe)
clf.fit(x_train, y_train)
print("Accuracy of AdaBoostClassifier: {}%".format(
    round(clf.score(x_test, y_test) * 100, 2)
))
```

**Expected output:** ~79-80%

**Explanation:** Boosting does not offer any significant performance gain on this dataset. The validation curve is chaotic, meaning there is no stable optimal value for the number of estimators. The accuracy never consistently exceeds 80%.

---

## Exercise 8: Conclusion

### Final model comparison

| Model | Configuration | Test Accuracy | Notes |
|-------|--------------|---------------|-------|
| Random Forest | 100 trees, CV=4 | 78.06% (CV) / 79.8% (test) | Good benchmark, feature importance |
| KNN | K=60 | 79.77% | Best model, clear plateau |
| Naive Bayes (categorical) | CategoricalNB | 79.76% | Surprisingly good despite missing features |
| Naive Bayes (scaled) | CategoricalNB + binning | 79.08% | Discretization loses information |
| AdaBoost | n_estimators variable | ~79-80% | No significant gain, chaotic curve |

**Key findings:**

1. **Feature engineering is critical.** The engineered feature `AppointmentDelay` is the most important predictor (26.32% importance in Random Forest). Domain knowledge improves all models.

2. **Simple models can outperform complex ones.** KNN with K=60 is the best model despite being one of the simplest approaches.

3. **Why no model exceeds 80%.** The no-show rate itself is about 20%, meaning a naive classifier that always predicts "show" already achieves ~80%. All models are barely beating this baseline, suggesting the available features are weakly predictive and important factors (personal motivation, emergencies, forgetfulness) are not captured in the data.

4. **Consistent train/test splits matter.** Using the same split for all models ensures fair comparison. Using the same fit/validation split within KNN tuning produces cleaner, more reproducible validation curves.
