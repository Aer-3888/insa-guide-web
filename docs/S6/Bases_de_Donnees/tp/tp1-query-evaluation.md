---
title: "TP: Evaluation de Requetes (Query Evaluation)"
sidebar_position: 1
---

# TP: Evaluation de Requetes (Query Evaluation)

**Course**: Bases de Donnees (Databases)  
**Institution**: INSA Rennes, 3rd year CS  
**Academic Year**: 2017-2018

## Overview

This lab explores SQL query performance, indexing strategies, and query optimization using SQLite. Students learn to:
- Measure query execution time
- Analyze query execution plans with EXPLAIN QUERY PLAN
- Understand the impact of indexes on performance
- Compare different SQL query structures for the same problem
- Optimize queries using appropriate indexing strategies

## Learning Objectives

1. **SQLite Basics**: Master essential SQLite commands and operations
2. **Performance Measurement**: Use `.timer ON` to measure query execution time
3. **Indexing**: Understand B+ tree indexes and their dramatic performance impact
4. **Query Plans**: Analyze execution strategies with EXPLAIN QUERY PLAN
5. **Query Optimization**: Compare query structures and optimize with indexes

## Lab Structure

### Part 1: Introduction to SQLite (7.1)

**Files**: `src/01_basic_queries.sql`, `src/02_create_tables.sql`

**Key Concepts**:
- SQLite command-line interface
- Creating tables for students, professors, courses, and enrollments
- Basic SELECT queries with WHERE and LIKE operators
- Cartesian products and joins

**Database Schema**:
```sql
etudiant(etudId, nom, prenom)              -- Students
professeur(profId, nom, prenom)            -- Professors
enseignement(ensId, sujet)                 -- Courses
enseignementSuivi(ensId, etudId, profId)   -- Student-Course-Professor relationships
```

**Sample Queries**:
- List all students
- Find professors with 'a' in their name
- Cartesian product of students and professors

### Part 2: Large Database and Indexing (7.2.2)

**Files**: `src/03_index_analysis.sql`, `src/DBgenerator.java`

**Key Concepts**:
- Generating large test databases (1M+ rows)
- Measuring query performance with and without indexes
- Understanding B+ tree index structure
- Analyzing execution plans: SCAN vs SEARCH

**Performance Results** (1 million rows):

| Query Type | Without Index | With Index | Speedup |
|------------|--------------|------------|---------|
| Existing value (=) | 0.1-0.2s | 0.0001s | 1000x |
| Non-existing value (=) | 0.05-0.08s | 0.0001s | 800x |
| Range query (>) | 5-7s | 0.0004s | 15000x |

**Execution Plan Changes**:
```
Before: SCAN TABLE demo                    (O(n) - linear scan)
After:  SEARCH TABLE demo USING INDEX      (O(log n) - binary search)
```

**Key Insight**: Indexes transform full table scans into efficient tree searches, providing 800-15000x performance improvement.

### Part 3: Query Optimization (7.2.3)

**Files**: `src/04_query_optimization.sql`, `src/DBgenerator1.java`

**Key Concepts**:
- Comparing different SQL approaches to the same problem
- Understanding query complexity (O(n), O(n*m), O(n+m))
- Subqueries vs. JOINs
- Composite indexes
- Natural joins overhead

**Problem**: Find customers with invoices > 999 euros

**Database**:
- `facture(factureId, customerId, amount)` - 1M+ invoices
- `customer(customerId, name)` - 1M+ customers

**Query Comparison**:

| Query | Strategy | Time (no index) | Time (with index) | Complexity |
|-------|----------|-----------------|-------------------|------------|
| 1. JOIN + WHERE | Join then filter | 200s | 3s | O(n*m) |
| 2. Subquery + IN | Filter then lookup | 0.996s | 0.787s | O(n+m) |
| 3. NATURAL JOIN | Implicit join | 283s | 4.5s | O(n*m) + overhead |
| 4. Subquery with JOIN | Complex nesting | 219s | 5.3s | O(n*m) |

**Winner**: Query 2 (Subquery with IN) - 200x faster than other approaches!

**Why Query 2 Wins**:
1. Subquery executes once, returns set of customerIds
2. Main query does simple set membership lookup (IN operator)
3. Linear complexity O(n+m) instead of quadratic O(n*m)
4. Even without index, this approach is optimal

**Optimization Strategy**:
```sql
CREATE INDEX IamSpeeed ON facture(customerId, amount);
```
- Composite index supports both JOIN (customerId) and filtering (amount)
- Improves JOIN queries by 67x, but Query 2 was already optimal

## Files

### SQL Scripts
- `01_basic_queries.sql` - Basic SELECT, WHERE, LIKE queries
- `02_create_tables.sql` - Database schema creation
- `03_index_analysis.sql` - Index performance demonstration
- `04_query_optimization.sql` - Query comparison and optimization

### Java Generators
- `DBgenerator.java` - Generates demo table with random integer codes
- `DBgenerator1.java` - Generates customer/invoice tables with realistic data

### Data Files
- `etudiants.txt` - Student list (73 students, format: E1,LASTNAME,Firstname)
- `profs.txt` - Professor list (25 professors, format: P1,LASTNAME,Firstname)

## Key Takeaways

### 1. Indexes Are Critical
- Without indexes: O(n) full table scans
- With indexes: O(log n) tree searches
- Performance improvement: 800-15000x on large datasets

### 2. Query Structure Matters
- Subqueries with IN can be more efficient than JOINs
- Filtering before joining reduces complexity
- Avoid NATURAL JOIN due to column resolution overhead

### 3. EXPLAIN QUERY PLAN Is Your Friend
- Reveals SCAN vs SEARCH strategies
- Shows index usage
- Helps identify optimization opportunities

### 4. Composite Indexes
- Can optimize multiple conditions simultaneously
- Format: `CREATE INDEX name ON table(col1, col2)`
- Useful for JOINs with additional WHERE conditions

### 5. Transactions for Bulk Inserts
- Wrap multiple INSERTs in BEGIN/COMMIT
- Dramatically faster than individual commits
- Essential for generating large test databases

## Running the Lab

### Generate Test Databases
```bash
# Compile Java generators
javac DBgenerator.java DBgenerator1.java

# Generate 1 million row demo table
java DBgenerator 1000000

# Generate 1 million customer/invoice pairs
java DBgenerator1 1000000

# Load into SQLite
sqlite3 test.db < database.sql
sqlite3 test1.db < database1.sql
```

### Execute Queries with Timing
```bash
sqlite3 test.db
.timer ON
.read src/03_index_analysis.sql
```

### Analyze Query Plans
```bash
sqlite3 test1.db
EXPLAIN QUERY PLAN SELECT ... ;
```

## SQLite Commands Reference

| Command | Description |
|---------|-------------|
| `.echo ON\|OFF` | Display executed commands |
| `.exit` | Exit SQLite |
| `.help` | Show all commands |
| `.import file table` | Import CSV data into table |
| `.mode csv\|column\|etc` | Set output format |
| `.output file` | Redirect output to file |
| `.open database` | Open/create database |
| `.print text` | Print text to screen |
| `.read file` | Execute SQL from file |
| `.stats ON\|OFF` | Show memory statistics |
| `.tables` | List all tables |
| `.tables %pattern%` | List tables matching pattern |
| `.timer ON\|OFF` | Measure query execution time |
| `.schema table` | Show table structure |
| `.index` | List all indexes |

## PRAGMA Commands

```sql
PRAGMA page_size;              -- Show page/block size (default: 4096 bytes)
PRAGMA automatic_index = 0;    -- Disable automatic index creation
PRAGMA journal_mode = OFF;     -- Disable journaling (faster, less safe)
PRAGMA synchronous = OFF;      -- Disable synchronous writes (faster, less safe)
```

## Performance Tips

1. **Always use transactions for bulk inserts**
   ```sql
   BEGIN TRANSACTION;
   -- Multiple INSERT statements
   COMMIT;
   ```

2. **Create indexes on frequently queried columns**
   - JOIN columns
   - WHERE clause columns
   - ORDER BY columns

3. **Use EXPLAIN QUERY PLAN to verify index usage**
   - Look for "SEARCH" instead of "SCAN"
   - Look for "USING INDEX" in the plan

4. **Prefer subqueries with IN for filtering before joining**
   - Reduces complexity from O(n*m) to O(n+m)
   - Especially effective when filtering significantly reduces result set

5. **Avoid NATURAL JOIN**
   - Has overhead from column name resolution
   - Less explicit, harder to optimize
   - Use explicit JOIN ... ON instead

## Further Reading

- [SQLite Query Planner](https://www.sqlite.org/queryplanner.html)
- [SQLite Indexes](https://www.sqlite.org/lang_createindex.html)
- [EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html)
- [SQLite Performance Tuning](https://www.sqlite.org/speed.html)

## Results Summary

Question 5(a): All students listed  
Question 5(b): Professors with 'a' in name (e.g., ARNALDI, GARCIA, MARCHAL)  
Question 5(c): 73 students × 25 professors = 1,825 combinations  
Question 6: Page size = 4096 bytes  

Index Analysis:
- Index creation: `CREATE INDEX demoIDX ON demo(code);`
- Performance boost: 800-15000x faster with index
- Execution plan: Changed from SCAN to SEARCH USING INDEX

Query Optimization:
- Best query: Subquery with IN (0.996s)
- Worst query: NATURAL JOIN (283s)
- Index optimization: Composite index on (customerId, amount)
- Final performance: Query 2 remains fastest at 0.787s
