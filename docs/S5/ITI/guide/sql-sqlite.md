---
title: "SQL & SQLite"
sidebar_position: 9
---

# SQL & SQLite

## Overview

SQLite is a lightweight, file-based relational database. The LDS course uses it to teach database concepts and Python integration. Unlike MySQL or PostgreSQL, SQLite requires no server -- the entire database is a single file.

## SQL Fundamentals

### Data Types in SQLite

| Type | Description | Example |
|------|-------------|---------|
| `INTEGER` | Whole numbers | 42, -7, 0 |
| `REAL` | Floating point | 3.14, -0.5 |
| `TEXT` | String | 'Alice', "hello" |
| `BLOB` | Binary data | Images, files |
| `NULL` | No value | NULL |

### CREATE TABLE

```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    grade REAL,
    email TEXT UNIQUE,
    enrolled_date TEXT DEFAULT CURRENT_DATE
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    credits INTEGER CHECK(credits > 0)
);

-- Many-to-many relationship table
CREATE TABLE enrollments (
    student_id INTEGER,
    course_id INTEGER,
    grade REAL,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Create only if not exists
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT
);
```

### Constraints

| Constraint | Purpose |
|-----------|---------|
| `PRIMARY KEY` | Unique identifier for each row |
| `AUTOINCREMENT` | Auto-generate sequential IDs |
| `NOT NULL` | Value required |
| `UNIQUE` | No duplicates allowed |
| `DEFAULT value` | Default value if not specified |
| `CHECK(expr)` | Validate value against expression |
| `FOREIGN KEY` | Reference to another table |

### INSERT

```sql
INSERT INTO students (name, age, grade)
VALUES ('Alice', 20, 15.5);

INSERT INTO students (name, age, grade)
VALUES ('Bob', 21, 12.0), ('Carol', 19, 17.0);

-- Insert from another query
INSERT INTO archive_students
SELECT * FROM students WHERE grade < 10;
```

### SELECT

```sql
-- Basic
SELECT * FROM students;
SELECT name, grade FROM students;

-- Filtering
SELECT * FROM students WHERE age > 18;
SELECT * FROM students WHERE name LIKE 'A%';       -- Starts with A
SELECT * FROM students WHERE name LIKE '%son';      -- Ends with son
SELECT * FROM students WHERE grade BETWEEN 10 AND 15;
SELECT * FROM students WHERE age IN (19, 20, 21);
SELECT * FROM students WHERE email IS NOT NULL;

-- Sorting
SELECT * FROM students ORDER BY grade DESC;
SELECT * FROM students ORDER BY name ASC, grade DESC;

-- Limiting
SELECT * FROM students LIMIT 10;
SELECT * FROM students LIMIT 10 OFFSET 20;         -- Pagination

-- Distinct
SELECT DISTINCT age FROM students;

-- Aliases
SELECT name AS student_name, grade AS note FROM students;
```

### Aggregate Functions

```sql
SELECT COUNT(*) FROM students;                      -- Count rows
SELECT COUNT(DISTINCT age) FROM students;           -- Count unique ages
SELECT AVG(grade) FROM students;                    -- Average
SELECT SUM(grade) FROM students;                    -- Sum
SELECT MIN(grade), MAX(grade) FROM students;        -- Min/Max
SELECT ROUND(AVG(grade), 2) FROM students;          -- Rounded average

-- GROUP BY
SELECT age, COUNT(*), AVG(grade)
FROM students
GROUP BY age;

-- HAVING (filter after grouping)
SELECT age, AVG(grade) as avg_grade
FROM students
GROUP BY age
HAVING avg_grade > 14;
```

### UPDATE

```sql
UPDATE students SET grade = 16.0 WHERE id = 1;
UPDATE students SET grade = grade + 1 WHERE grade < 10;
UPDATE students SET age = age + 1;                  -- All rows
```

### DELETE

```sql
DELETE FROM students WHERE id = 1;
DELETE FROM students WHERE grade < 5;
DELETE FROM students;                               -- Delete ALL rows
```

### JOIN

```sql
-- INNER JOIN: Only matching rows from both tables
SELECT students.name, courses.title, enrollments.grade
FROM students
INNER JOIN enrollments ON students.id = enrollments.student_id
INNER JOIN courses ON enrollments.course_id = courses.id;

-- LEFT JOIN: All rows from left table, matching from right
SELECT students.name, enrollments.course_id
FROM students
LEFT JOIN enrollments ON students.id = enrollments.student_id;

-- Shorthand with aliases
SELECT s.name, c.title, e.grade
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE e.grade > 14
ORDER BY e.grade DESC;
```

### Subqueries

```sql
-- Subquery in WHERE
SELECT name FROM students
WHERE grade > (SELECT AVG(grade) FROM students);

-- Subquery in FROM
SELECT avg_by_age.age, avg_by_age.avg_grade
FROM (
    SELECT age, AVG(grade) as avg_grade
    FROM students
    GROUP BY age
) AS avg_by_age
WHERE avg_by_age.avg_grade > 14;
```

### ALTER TABLE and DROP

```sql
ALTER TABLE students ADD COLUMN phone TEXT;
ALTER TABLE students RENAME TO alumni;
DROP TABLE IF EXISTS temp_data;
```

### Indexes

```sql
CREATE INDEX idx_student_name ON students(name);
CREATE UNIQUE INDEX idx_student_email ON students(email);
DROP INDEX idx_student_name;
```

## Python sqlite3 Module

### Basic Connection

```python
import sqlite3

# Connect (creates file if doesn't exist)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Execute SQL
cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE
    )
""")

# Insert data (ALWAYS use parameterized queries)
cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)",
               ("Alice", "alice@example.com"))

# Commit changes (required for writes)
conn.commit()

# Query data
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()         # List of tuples
for row in rows:
    print(f"ID: {row[0]}, Name: {row[1]}, Email: {row[2]}")

# Single row
cursor.execute("SELECT * FROM users WHERE id = ?", (1,))
user = cursor.fetchone()         # Single tuple or None

# Close connection
conn.close()
```

### Parameterized Queries (CRITICAL)

```python
# WRONG -- vulnerable to SQL injection
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# CORRECT -- safe, parameterized
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))

# Multiple parameters
cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)",
               (name, email))

# Execute many rows
data = [("Alice", "a@b.com"), ("Bob", "b@b.com")]
cursor.executemany("INSERT INTO users (name, email) VALUES (?, ?)", data)
```

### Database Class Pattern

```python
import sqlite3

class Database:
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()
    
    def create_tables(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                value REAL
            )
        """)
        self.conn.commit()
    
    def insert(self, name, value):
        self.cursor.execute(
            "INSERT INTO items (name, value) VALUES (?, ?)",
            (name, value)
        )
        self.conn.commit()
        return self.cursor.lastrowid
    
    def get_all(self):
        self.cursor.execute("SELECT * FROM items")
        return self.cursor.fetchall()
    
    def get_by_id(self, item_id):
        self.cursor.execute("SELECT * FROM items WHERE id = ?", (item_id,))
        return self.cursor.fetchone()
    
    def update(self, item_id, name, value):
        self.cursor.execute(
            "UPDATE items SET name = ?, value = ? WHERE id = ?",
            (name, value, item_id)
        )
        self.conn.commit()
    
    def delete(self, item_id):
        self.cursor.execute("DELETE FROM items WHERE id = ?", (item_id,))
        self.conn.commit()
    
    def close(self):
        self.conn.close()
```

### Context Manager Pattern

```python
import sqlite3

class Database:
    def __init__(self, db_file):
        self.db_file = db_file
    
    def __enter__(self):
        self.conn = sqlite3.connect(self.db_file)
        return self.conn.cursor()
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.conn.commit()
        self.conn.close()

# Usage
with Database('db.sqlite') as cursor:
    cursor.execute("SELECT * FROM items")
    rows = cursor.fetchall()
```

## Qt Database Integration

```python
from PyQt5.QtSql import QSqlDatabase, QSqlQuery, QSqlTableModel
from PyQt5.QtCore import Qt

# Connect
db = QSqlDatabase.addDatabase('QSQLITE')
db.setDatabaseName('database.db')
if not db.open():
    print("Error opening database")

# Execute query
query = QSqlQuery()
query.exec_("SELECT * FROM students")
while query.next():
    print(f"{query.value(0)}: {query.value(1)}")

# Table model for QTableView
model = QSqlTableModel()
model.setTable('students')
model.setEditStrategy(QSqlTableModel.OnFieldChange)
model.select()

# Set column headers
model.setHeaderData(0, Qt.Horizontal, "ID")
model.setHeaderData(1, Qt.Horizontal, "Name")

# Connect to view
table_view.setModel(model)
table_view.hideColumn(0)    # Hide ID column
```

## Database Design

### Normalization Rules

1. **1NF**: Each column contains atomic values (no lists)
2. **2NF**: No partial dependency on composite key
3. **3NF**: No transitive dependencies (non-key depends on non-key)

### Design Tips

- Every table should have a PRIMARY KEY
- Use AUTOINCREMENT for surrogate keys
- Use FOREIGN KEYs to enforce relationships
- Create indexes on frequently queried columns
- Avoid storing calculated values (compute them with queries)

---

## CHEAT SHEET

### SQL Quick Reference
```sql
CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO t (name) VALUES ('val');
SELECT * FROM t WHERE condition;
UPDATE t SET col = val WHERE condition;
DELETE FROM t WHERE condition;
SELECT a.col, b.col FROM a JOIN b ON a.id = b.a_id;
SELECT col, COUNT(*) FROM t GROUP BY col HAVING COUNT(*) > 1;
```

### Python sqlite3
```python
conn = sqlite3.connect('db.db')
cursor = conn.cursor()
cursor.execute("SQL", (params,))     # ALWAYS use ? params
conn.commit()                         # After writes
rows = cursor.fetchall()              # Get results
conn.close()                          # Clean up
```

### Key Rules
- ALWAYS use parameterized queries (? placeholders)
- ALWAYS commit after INSERT/UPDATE/DELETE
- ALWAYS close connections
- Use `with` statements for safety
- Create indexes on columns used in WHERE clauses
