---
title: "TP2: Building a Complete ML Pipeline"
sidebar_position: 2
---

# TP2: Building a Complete ML Pipeline

## Overview
This practical demonstrates building an end-to-end machine learning pipeline for a real-world classification problem: predicting medical appointment no-shows. The lab covers data preprocessing, feature engineering, model selection, and hyperparameter tuning.

## Problem Statement
Predict whether a patient will miss a medical appointment based on demographic information, health conditions, and appointment details.

## Dataset: No-Show Appointments
- **Source**: Kaggle dataset with 110,527 medical appointments
- **Target**: Binary classification (show/no-show)
- **Features**: 14 attributes including patient demographics, health conditions, scheduling information

### Attributes
| Attribute | Type | Description |
|-----------|------|-------------|
| PatientId | Numeric | Unique patient identifier |
| AppointmentID | Numeric | Unique appointment identifier |
| Gender | Binary | Patient gender (F/M) |
| ScheduledDay | Datetime | When appointment was scheduled |
| AppointmentDay | Datetime | Date of appointment |
| Age | Numeric | Patient age |
| Neighbourhood | Categorical | Patient neighborhood (81 unique values) |
| Scholarship | Binary | Has scholarship (0/1) |
| Hipertension | Binary | Has hypertension (0/1) |
| Diabetes | Binary | Has diabetes (0/1) |
| Alcoholism | Binary | Has alcoholism (0/1) |
| Handcap | Binary | Has disability (0/1) |
| SMS_received | Binary | Received SMS reminder (0/1) |
| No-show | Binary | Target variable (Yes/No) |

## Data Preprocessing

### Feature Engineering
**Created Feature**: `AppointmentDelay` (days between scheduling and appointment)
- Computed as: `(AppointmentDay - ScheduledDay) / 86400`
- Handles same-day appointments (negative values set to 0)
- Most important feature (26.32% importance in Random Forest)

### Data Transformations
1. **Encoding**: Convert categorical variables (Gender, Neighbourhood) to numeric labels
2. **Date Processing**: Convert datetime strings to Unix timestamps
3. **Feature Extraction**: Extract day-of-year from AppointmentDay
4. **Target Encoding**: Convert "Yes"/"No" to 1/0

### Train/Test Split
- Training: 82,895 samples (75%)
- Testing: 27,632 samples (25%)
- Random state based on current timestamp for reproducibility

## Models Implemented

### 1. Random Forest (Baseline)
**Purpose**: Benchmark classifier with feature importance analysis

**Configuration**:
- 100 trees (default)
- 4-fold cross-validation

**Results**:
- Accuracy: 78.06% (CV), 79.8% (test)
- Training time: ~45 seconds

**Feature Importance** (top 5):
1. AppointmentDelay: 26.32%
2. ScheduledDay: 24.66%
3. Age: 17.22%
4. Neighbourhood: 15.82%
5. AppointmentDay: 9.37%

### 2. k-Nearest Neighbors (kNN)
**Hyperparameter Tuning**: Grid search over k values

**Search Range**:
- [1, 2, 3, 5, 10, 15, 20-190 (step 10), 200-295 (step 5), 300, 400, 500, 1000]

**Methodology**:
- Split training into fit/validation (75/25)
- Evaluate each k on validation set
- Select k with best validation score

**Results**:
- Best k: 60-70 (performance plateau)
- Accuracy: 79.77% (test)
- Slightly better than Random Forest

**Observations**:
- Performance plateaus after k ≈ 60
- Smooth, well-defined validation curve
- Consistent results with fixed train/val/test splits

### 3. Naive Bayes
**Challenge**: sklearn naive Bayes requires uniform feature types

**Approach 1: Remove Numeric Features**
- Keep only categorical: Gender, Neighbourhood, Scholarship, Hipertension, Diabetes, Alcoholism, Handcap, SMS_received
- Use `CategoricalNB`
- **Accuracy**: 79.76% (test)

**Approach 2: Scale Continuous Features**
Age categories:
- 0-12: child
- 13-19: teen
- 20-30: youth
- 31-50: adult
- 51-65: middle-aged
- 66-80: old-aged
- 81+: elderly

AppointmentDelay categories:
- 0: today
- 1-6: week
- 7-14: two_weeks
- 15-31: month
- 32-62: two_months
- 63+: later

Datetime features:
- Extract day of week (0-6) from ScheduledDay and AppointmentDay

**Results**:
- Accuracy: 79.08% (4-fold CV average)
- Slightly worse than kNN but comparable to Random Forest

### 4. AdaBoost (Stump Boosting)
**Configuration**: Boosting with decision tree stumps

**Hyperparameter Search**: Number of estimators
- Range: [1, 2-48 (step 2), 50-450 (step 50)]

**Results**:
- Best n_estimators: Variable (1-100, chaotic validation curve)
- Accuracy: ~79-80% (never consistently exceeds 80%)
- Performance similar to other models

**Observations**:
- Validation curve more erratic than kNN
- No significant performance gain over simpler models
- Computational overhead not justified

## Key Findings

### Model Comparison
| Model | Accuracy | Notes |
|-------|----------|-------|
| Random Forest | 79.8% | Good baseline, interpretable feature importance |
| kNN (k=60) | 79.77% | Best performing, simple, efficient |
| Naive Bayes | 79.08-79.76% | Fast, requires feature engineering |
| AdaBoost | ~79-80% | No improvement over simpler models |

### Best Model: kNN
- Highest test accuracy
- Simple and interpretable
- Efficient prediction time
- Robust with proper k selection

### Important Insights
1. **Feature Engineering Critical**: AppointmentDelay (engineered feature) is most important
2. **Diminishing Returns**: Complex models don't significantly outperform simple ones
3. **Data Quality**: All models struggle to exceed 80% accuracy, suggesting:
   - Missing important features
   - Inherent unpredictability in human behavior
   - Class imbalance issues

## Visualizations

### Pairplot Analysis
Examined feature correlations on 5% sample:
- Gender, SMS_received, Age, ScheduledDay, AppointmentDay, AppointmentDelay
- Notable clustering in AppointmentDay/AppointmentDelay and AppointmentDelay/Age

### Hyperparameter Curves
- kNN: Smooth validation curve, clear plateau
- AdaBoost: Erratic, no clear optimal value

## Files
- `TP2_no_show_complete.ipynb`: Complete pipeline implementation
- `no_show.csv`: Medical appointments dataset (110,527 records)
- `music_genre.csv`: Alternative dataset (Hugo's work)

## Running the Code
```bash noexec
# Install dependencies
pip install scikit-learn pandas numpy matplotlib seaborn

# Launch Jupyter notebook
jupyter notebook TP2_no_show_complete.ipynb
```

## Lessons Learned
1. **Always engineer features**: Domain knowledge improves models
2. **Baseline first**: Random Forest provides quick feature importance insights
3. **Hyperparameter tuning matters**: kNN with k=1 vs k=60 shows significant difference
4. **Visualize validation curves**: Helps identify optimal parameters and overfitting
5. **Simple can be best**: kNN outperforms complex ensemble methods here
6. **Use consistent splits**: Fixed train/val/test splits enable fair comparisons
