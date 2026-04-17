---
title: "LDS3 - SQLite Database Management"
sidebar_position: 10
---

# LDS3 - SQLite Database Management

## Learning Objectives

Database integration with Python and Qt:

- Understand relational database concepts
- Work with SQLite databases
- Execute SQL queries from Python
- Integrate databases with Qt GUI
- Implement CRUD operations (Create, Read, Update, Delete)
- Use Qt's Model-View architecture

## Core Concepts

### 1. SQLite Basics

**SQLite**: Lightweight, file-based relational database
- No server required
- Single file storage
- SQL standard support
- Perfect for desktop applications

```python noexec
import sqlite3

# Connect to database (creates if doesn't exist)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Execute SQL
cursor.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
cursor.execute("INSERT INTO users (name) VALUES (?)", ("Alice",))
conn.commit()

# Query
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()

# Close
conn.close()
```

### 2. SQL Fundamentals

**CREATE TABLE**:
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    grade REAL
);
```

**INSERT**:
```sql noexec
INSERT INTO students (name, age, grade) VALUES ('Alice', 20, 15.5);
```

**SELECT**:
```sql noexec
SELECT * FROM students;
SELECT name, grade FROM students WHERE age > 18;
SELECT * FROM students ORDER BY grade DESC;
```

**UPDATE**:
```sql noexec
UPDATE students SET grade = 16.0 WHERE id = 1;
```

**DELETE**:
```sql noexec
DELETE FROM students WHERE id = 1;
```

**JOIN**:
```sql noexec
SELECT students.name, courses.title
FROM students
JOIN enrollments ON students.id = enrollments.student_id
JOIN courses ON enrollments.course_id = courses.id;
```

### 3. Python SQLite Module

```python noexec
import sqlite3

class Database:
    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()
    
    def create_tables(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY,
                name TEXT,
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
    
    def get_all(self):
        self.cursor.execute("SELECT * FROM items")
        return self.cursor.fetchall()
    
    def close(self):
        self.conn.close()
```

### 4. Qt Database Integration

```python noexec
from PyQt5.QtSql import QSqlDatabase, QSqlQuery, QSqlTableModel

# Connect to database
db = QSqlDatabase.addDatabase('QSQLITE')
db.setDatabaseName('database.db')
if not db.open():
    print("Error opening database")

# Execute query
query = QSqlQuery()
query.exec_("SELECT * FROM students")
while query.next():
    id = query.value(0)
    name = query.value(1)
    print(f"{id}: {name}")

# Table model for views
model = QSqlTableModel()
model.setTable('students')
model.select()
table_view.setModel(model)
```

### 5. Model-View Architecture

**Model**: Manages data (QSqlTableModel, QSqlQueryModel)
**View**: Displays data (QTableView, QListView)
**Controller**: Handles user input

```python noexec
# Create model
model = QSqlTableModel()
model.setTable('students')
model.setEditStrategy(QSqlTableModel.OnFieldChange)
model.select()

# Set headers
model.setHeaderData(0, Qt.Horizontal, "ID")
model.setHeaderData(1, Qt.Horizontal, "Name")
model.setHeaderData(2, Qt.Horizontal, "Age")

# Create view
view = QTableView()
view.setModel(model)
view.hideColumn(0)  # Hide ID column
```

### 6. Parameterized Queries

**Always use parameterized queries** to prevent SQL injection:

```python noexec
# WRONG (SQL injection vulnerable)
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# CORRECT (safe)
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))
```

## Exercises Overview

### Exercise 1: Database Creation
Create SQLite database with tables for student registry.

**Schema**:
- Students table (id, name, birth_date, etc.)
- Courses table
- Enrollments table (many-to-many relationship)

### Exercise 2: CRUD Operations
Implement complete CRUD interface:
- Create new records
- Read/display records
- Update existing records
- Delete records

### Exercise 3: Qt Integration
Build Qt application with database backend.

**Features**:
- Table view displaying database content
- Forms for adding/editing records
- Search and filter functionality
- Data validation

### Exercise 4: Reports and Queries
Generate reports from database:
- Student lists
- Grade statistics
- Course enrollments

## Solutions

See `src/` directory and original files:
- `gestionBD.py` - Database management class
- `SqliteQt.py` - Qt integration example
- `principalSqlite.py` - Main application
- `BDRegMat.py` - Student registry database

## Key Takeaways

1. **SQLite is perfect for desktop apps** - No server, no configuration
2. **Always use parameterized queries** - Prevents SQL injection
3. **Commit after writes** - Changes aren't saved until commit()
4. **Close connections** - Use context managers or finally blocks
5. **Model-View separates concerns** - Clean architecture

## Common Patterns

### Context Manager Pattern
```python noexec
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

### Repository Pattern
```python noexec
class StudentRepository:
    def __init__(self, db_connection):
        self.conn = db_connection
    
    def find_by_id(self, student_id):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
        return cursor.fetchone()
    
    def find_all(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM students")
        return cursor.fetchall()
    
    def save(self, student):
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO students (name, age) VALUES (?, ?)",
            (student['name'], student['age'])
        )
        self.conn.commit()
        return cursor.lastrowid
```

## Common Pitfalls

1. **Not committing changes** - Writes need conn.commit()
2. **SQL injection** - Use parameterized queries
3. **Forgetting to close connections** - Causes lock issues
4. **Mixing string formatting with SQL** - Use ? placeholders
5. **Not handling exceptions** - Database errors need error handling
6. **Inefficient queries** - Use indexes, avoid SELECT *

## Further Reading

- SQLite Documentation: https://www.sqlite.org/docs.html
- SQL Tutorial: https://www.sqlitetutorial.net/
- Qt SQL Module: https://doc.qt.io/qt-5/qtsql-index.html
- Database design: Normalization, foreign keys, indexes
- ORM libraries: SQLAlchemy, Peewee (alternatives to raw SQL)

## Database Design Tips

1. **Primary keys** - Use INTEGER PRIMARY KEY AUTOINCREMENT
2. **Foreign keys** - Enforce referential integrity
3. **Indexes** - Speed up queries on frequently searched columns
4. **Normalization** - Avoid data duplication
5. **Data types** - INTEGER, TEXT, REAL, BLOB
6. **Constraints** - NOT NULL, UNIQUE, CHECK

## SQL Best Practices

1. **Use transactions** - Group related operations
2. **Handle errors** - Check return values, catch exceptions
3. **Validate input** - Before inserting into database
4. **Use indexes wisely** - Speed up reads, slow down writes
5. **Backup regularly** - SQLite files can be copied
