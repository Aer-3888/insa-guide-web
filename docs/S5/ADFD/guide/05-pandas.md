---
title: "Chapter 5: Pandas & Data Manipulation"
sidebar_position: 5
---

# Chapter 5: Pandas & Data Manipulation

## Overview

Pandas is the Python library used throughout the ADFD course for data loading, exploration, cleaning, and transformation. Mastery of Pandas is essential for all TPs and for understanding the code in exam solutions.

This chapter is based on the `pandas_intro.ipynb` notebook provided in the course.

## 1. Core Data Structures

### DataFrame

A 2D tabular data structure with labeled rows (index) and columns.

```python
import pandas as pd
import numpy as np

# Create from dictionary
df = pd.DataFrame({
    'Region': ['core worlds', 'mid rim', 'outer rim'],
    'Moons': [4, 3, 0],
    'Diameter': [12.240, 12.765, 14.410]
}, index=['Coruscant', 'Kashyyyk', 'Dagobah'])
```

### Series

A 1D labeled array (equivalent to a single column of a DataFrame).

```python
s = pd.Series([1, 2, 3], index=['a', 'b', 'c'])
```

### Key Attributes

```python
df.index        # Row labels
df.columns      # Column names
df.shape        # (n_rows, n_columns)
df.dtypes       # Data types per column
len(df)         # Number of rows
```

## 2. Loading Data

### From CSV (the most common case in the course)

```python
# Basic load
df = pd.read_csv("flickrRennes.csv")

# With index column
df = pd.read_csv("temperatures.csv", index_col=0)

# Specifying separator
df = pd.read_csv("data.csv", sep=";")
```

### Exploration

```python
df.head()           # First 5 rows
df.head(10)         # First 10 rows
df.tail()           # Last 5 rows
df.info()           # Column types, non-null counts, memory usage
df.describe()       # Statistics for numerical columns (mean, std, min, max, quartiles)
df.shape            # (rows, columns)
```

## 3. Selecting Data

### Column Selection (Projection)

```python
# Single column --> returns Series
df["Region"]
df.Region          # Alternative syntax (only for simple column names)

# Multiple columns --> returns DataFrame
df[["Moons", "Diameter"]]
```

### Row Selection (Filtering)

```python
# Boolean mask
mask = df["Region"] == "outer rim"
df_outer = df[mask]

# Combined in one line
df_outer = df[df["Region"] == "outer rim"]

# Multiple conditions (use & for AND, | for OR, ~ for NOT)
df_filtered = df[(df["Moons"] > 2) & (df["Diameter"] < 15)]

# Complex predicates with apply
def keep(row):
    return row["Region"].endswith("rim")

mask = df.apply(keep, axis=1)
df_filtered = df[mask]
```

### Selecting by Position

```python
df.iloc[0]          # First row (by position)
df.iloc[0:3]        # First 3 rows
df.iloc[0, 1]       # Row 0, Column 1
df.loc["Coruscant"] # By label
```

## 4. Modifying Data

### Adding/Modifying Columns

```python
# Add new column
df["Random"] = np.random.randn(len(df))

# Modify existing column
df["Moons"] = df["Moons"] * 2

# Apply function to column
df["Log_Diameter"] = np.log1p(df["Diameter"])
```

### Handling Missing Values

```python
# Detect
df.isnull()                    # Boolean mask
df.isnull().sum()              # Count per column
df.isnull().sum() / len(df)    # Percentage per column

# Drop
df.dropna()                    # Drop rows with any NaN
df.dropna(subset=['lat'])      # Drop rows where 'lat' is NaN

# Fill
df.fillna(0)                   # Replace NaN with 0
df.fillna(df.mean())           # Replace with column mean
df["tags"].fillna("")          # Replace NaN in specific column
```

### Removing Duplicates

```python
# Remove exact duplicate rows
df = df.drop_duplicates()

# Remove duplicates based on specific columns
df = df.drop_duplicates(subset=['id_photo'])

# Keep first/last occurrence
df = df.drop_duplicates(subset=['user_id', 'date'], keep='first')
```

## 5. Aggregation and Grouping

### Unique Values and Counts

```python
# Number of unique values per column
df.nunique()

# Unique values in a column
df["Region"].unique()

# Count occurrences of each value
df["Region"].value_counts()
```

### GroupBy

The SQL-equivalent GROUP BY operation: split data into groups, apply a function, combine results.

```python
groups = df.groupby("Region")

# Aggregation functions
groups.size()          # Number of rows per group
groups.mean()          # Mean of each numeric column per group
groups.first()         # First row of each group
groups.count()         # Count non-null values per group
groups.sum()           # Sum per group
groups.agg(['mean', 'std'])  # Multiple aggregations

# Multiple grouping columns
photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

**The `as_index=False` parameter**: Prevents grouped columns from becoming the index (keeps them as regular columns).

## 6. Iteration

```python
# Iterate over column names
for col_name in df:
    print(col_name)

# Iterate over rows (slow -- use vectorized operations when possible)
for index, row in df.iterrows():
    print(index, row["Region"])

# Apply function to each row (faster than iterrows)
df.apply(lambda row: row["Moons"] * 2, axis=1)
```

## 7. Data Types

### Checking Types

```python
df.dtypes                          # Type of each column
df.select_dtypes(include=["object"])   # Only object (string) columns
df.select_dtypes(exclude=["object"])   # Only numeric columns
(df.dtypes != "object").sum()          # Count non-object columns
```

### Type Conversion

```python
df["Moons"] = df["Moons"].astype(float)
df["date"] = pd.to_datetime(df["date_taken"])
```

## 8. Visualization with Pandas

```python
# Histogram
df["Diameter"].hist(bins=30)

# Scatter plot
df.plot.scatter(x="GrLivArea", y="SalePrice")

# Box plot
df.boxplot(column="Diameter", by="Region")

# Bar chart
df["Region"].value_counts().plot.bar()
```

## 9. Common Patterns from the Course

### Pattern 1: Missing Value Analysis Table

```python
table_na = pd.DataFrame({
    'nb_na': df.isnull().sum(),
    'pct_na': (df.isnull().sum() / len(df)) * 100
})
table_na = table_na.sort_values('pct_na', ascending=False)
table_na.head(10)
```

### Pattern 2: Select Numeric Columns for PCA

```python
cols_numeric = ["LotArea", "MasVnrArea", "BsmtFinSF1", "TotalBsmtSF",
                "1stFlrSF", "GrLivArea", "GarageArea", "SalePrice"]
df_num = df[cols_numeric].copy()
```

### Pattern 3: Photo Album Effect Removal

```python
# Group by user + time, keep first photo per group
photos = photos.groupby(
    ['id_photographer', 'date_taken_year', 'date_taken_month',
     'date_taken_day', 'date_taken_hour'],
    as_index=False
).first()
```

### Pattern 4: Add Cluster Labels to DataFrame

```python
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(eps=0.00030, min_samples=7)
photos["cluster"] = dbscan.fit_predict(photos[["lat", "long"]])
```

### Pattern 5: Analyze Clusters

```python
for cluster_id in sorted(photos["cluster"].unique()):
    if cluster_id == -1:
        continue
    cluster_photos = photos[photos["cluster"] == cluster_id]
    print(f"Cluster {cluster_id}: {len(cluster_photos)} photos, "
          f"{cluster_photos['id_photographer'].nunique()} users")
```

## Common Pitfalls

1. **Modifying a slice vs. a copy**: `df[mask]["col"] = value` does NOT modify df. Use `df.loc[mask, "col"] = value` instead.
2. **Chained indexing warning**: `df["col1"]["col2"]` may produce SettingWithCopyWarning. Use `df.loc[:, "col"]` or `.copy()`.
3. **forgetting `as_index=False`** in groupby: Creates a MultiIndex that can be confusing.
4. **Using `==` with NaN**: `NaN == NaN` is False. Use `df.isnull()` or `pd.isna()`.
5. **Iterating with for loops** when vectorized operations exist: `df["col"] * 2` is 100x faster than a loop.

---

## CHEAT SHEET

### Loading and Exploring

```python
df = pd.read_csv("file.csv")          # Load
df.head()                               # First rows
df.info()                               # Structure
df.describe()                           # Statistics
df.shape                                # (rows, cols)
```

### Selecting

```python
df["col"]                    # Single column (Series)
df[["col1", "col2"]]        # Multiple columns (DataFrame)
df[df["col"] > 5]           # Filter rows
df.loc["label"]              # By row label
df.iloc[0]                   # By row position
```

### Cleaning

```python
df.isnull().sum()            # Count NaN
df.dropna()                  # Drop NaN rows
df.fillna(value)             # Fill NaN
df.drop_duplicates()         # Remove duplicates
df.drop(columns=["col"])     # Drop column
```

### Aggregating

```python
df.groupby("col").mean()     # Group and aggregate
df["col"].value_counts()     # Count values
df["col"].nunique()          # Count unique
df["col"].unique()           # List unique values
```

### Transforming

```python
df["new"] = df["old"] * 2               # New column
df["col"] = df["col"].astype(float)     # Type conversion
df["col"] = np.log1p(df["col"])         # Log transform
df.apply(func, axis=1)                  # Apply to rows
```

### Key Methods Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `head(n)` | DataFrame | First n rows |
| `describe()` | DataFrame | Summary statistics |
| `info()` | None (prints) | Column types and non-null counts |
| `isnull()` | DataFrame (bool) | NaN mask |
| `dropna()` | DataFrame | Without NaN rows |
| `fillna(v)` | DataFrame | NaN replaced by v |
| `drop_duplicates()` | DataFrame | Without duplicates |
| `groupby(col)` | GroupBy object | Grouped data |
| `value_counts()` | Series | Frequency of each value |
| `nunique()` | int or Series | Count of unique values |
| `unique()` | array | Unique values |
| `apply(f)` | Series/DataFrame | Apply function |
| `merge(df2)` | DataFrame | SQL-like join |
| `sort_values(col)` | DataFrame | Sorted by column |
