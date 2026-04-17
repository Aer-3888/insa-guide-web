---
title: "TP10 - LDS3: SQLite Database Management"
sidebar_position: 11
---

# TP10 - LDS3: SQLite Database Management

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp10_sqlite/README.md

## Exercise 1

### Database Creation: create an SQLite database with tables for a student registry -- students, courses, and enrollments (many-to-many relationship)

**Answer:**

```python
import sqlite3


def create_database(db_file):
    """Create the student registry database."""
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Students table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            first_name TEXT NOT NULL,
            birth_date TEXT,
            email TEXT UNIQUE
        )
    """)

    # Courses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            credits INTEGER CHECK(credits > 0),
            teacher TEXT
        )
    """)

    # Enrollments (many-to-many)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enrollments (
            student_id INTEGER,
            course_id INTEGER,
            grade REAL,
            PRIMARY KEY (student_id, course_id),
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    """)

    conn.commit()
    conn.close()
    print(f"Database {db_file} created successfully")


create_database("student_registry.db")
```

**Expected output:**
```
Database student_registry.db created successfully
```

**Verify with sqlite3 CLI:**

```bash
sqlite3 student_registry.db ".tables"
```

**Expected output:**
```
courses      enrollments  students
```

```bash
sqlite3 student_registry.db ".schema students"
```

**Expected output:**
```sql
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    birth_date TEXT,
    email TEXT UNIQUE
);
```

---

## Exercise 2

### CRUD Operations: implement a Python class with Create, Read, Update, and Delete operations for the student registry

**Answer (gestionBD.py / BDRegMat.py):**

```python
import sqlite3


class StudentDB:
    """Database manager for student registry."""

    def __init__(self, db_file):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()

    # ---- CREATE ----

    def add_student(self, name, first_name, birth_date=None, email=None):
        """Insert a new student. Returns the new ID."""
        self.cursor.execute(
            "INSERT INTO students (name, first_name, birth_date, email) "
            "VALUES (?, ?, ?, ?)",
            (name, first_name, birth_date, email),
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def add_course(self, title, credits, teacher=None):
        """Insert a new course. Returns the new ID."""
        self.cursor.execute(
            "INSERT INTO courses (title, credits, teacher) VALUES (?, ?, ?)",
            (title, credits, teacher),
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def enroll_student(self, student_id, course_id):
        """Enroll a student in a course."""
        self.cursor.execute(
            "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
            (student_id, course_id),
        )
        self.conn.commit()

    # ---- READ ----

    def get_all_students(self):
        self.cursor.execute("SELECT * FROM students ORDER BY name")
        return self.cursor.fetchall()

    def get_student_by_id(self, student_id):
        self.cursor.execute(
            "SELECT * FROM students WHERE id = ?", (student_id,)
        )
        return self.cursor.fetchone()

    def search_students(self, name_pattern):
        self.cursor.execute(
            "SELECT * FROM students WHERE name LIKE ? OR first_name LIKE ?",
            (f"%{name_pattern}%", f"%{name_pattern}%"),
        )
        return self.cursor.fetchall()

    def get_student_courses(self, student_id):
        """Get all courses for a student with grades."""
        self.cursor.execute("""
            SELECT c.title, c.credits, e.grade
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = ?
            ORDER BY c.title
        """, (student_id,))
        return self.cursor.fetchall()

    # ---- UPDATE ----

    def update_student(self, student_id, name, first_name, email):
        self.cursor.execute(
            "UPDATE students SET name = ?, first_name = ?, email = ? "
            "WHERE id = ?",
            (name, first_name, email, student_id),
        )
        self.conn.commit()

    def set_grade(self, student_id, course_id, grade):
        self.cursor.execute(
            "UPDATE enrollments SET grade = ? "
            "WHERE student_id = ? AND course_id = ?",
            (grade, student_id, course_id),
        )
        self.conn.commit()

    # ---- DELETE ----

    def delete_student(self, student_id):
        self.cursor.execute(
            "DELETE FROM enrollments WHERE student_id = ?", (student_id,)
        )
        self.cursor.execute(
            "DELETE FROM students WHERE id = ?", (student_id,)
        )
        self.conn.commit()

    # ---- REPORTS ----

    def get_course_statistics(self, course_id):
        self.cursor.execute("""
            SELECT COUNT(*), ROUND(AVG(grade), 2), MIN(grade), MAX(grade)
            FROM enrollments
            WHERE course_id = ? AND grade IS NOT NULL
        """, (course_id,))
        return self.cursor.fetchone()

    def close(self):
        self.conn.close()
```

**Test the CRUD operations:**

```python
from student_db import StudentDB

db = StudentDB("student_registry.db")

# CREATE
sid1 = db.add_student("Dupont", "Alice", "2003-05-15", "alice@insa.fr")
sid2 = db.add_student("Martin", "Bob", "2003-09-20", "bob@insa.fr")
sid3 = db.add_student("Durand", "Charlie", "2004-01-10", "charlie@insa.fr")
cid1 = db.add_course("ITI", 4, "Prof. Dupuis")
cid2 = db.add_course("Mathematiques", 6, "Prof. Legrand")
db.enroll_student(sid1, cid1)
db.enroll_student(sid1, cid2)
db.enroll_student(sid2, cid1)
db.set_grade(sid1, cid1, 15.5)
db.set_grade(sid1, cid2, 13.0)
db.set_grade(sid2, cid1, 12.0)

# READ
print("=== All students ===")
for s in db.get_all_students():
    print(f"  {s}")

print("\n=== Alice's courses ===")
for c in db.get_student_courses(sid1):
    print(f"  {c[0]}: credits={c[1]}, grade={c[2]}")

print("\n=== ITI statistics ===")
stats = db.get_course_statistics(cid1)
print(f"  Enrolled: {stats[0]}, Avg: {stats[1]}, Min: {stats[2]}, Max: {stats[3]}")

# UPDATE
db.update_student(sid2, "Martin", "Bob", "bob.martin@insa.fr")
print(f"\n=== Updated Bob: {db.get_student_by_id(sid2)} ===")

# DELETE
db.delete_student(sid3)
print(f"\n=== Remaining: {len(db.get_all_students())} students ===")

db.close()
```

**Expected output:**
```
=== All students ===
  (1, 'Dupont', 'Alice', '2003-05-15', 'alice@insa.fr')
  (3, 'Durand', 'Charlie', '2004-01-10', 'charlie@insa.fr')
  (2, 'Martin', 'Bob', '2003-09-20', 'bob@insa.fr')

=== Alice's courses ===
  ITI: credits=4, grade=15.5
  Mathematiques: credits=6, grade=13.0

=== ITI statistics ===
  Enrolled: 2, Avg: 13.75, Min: 12.0, Max: 15.5

=== Updated Bob: (2, 'Martin', 'Bob', '2003-09-20', 'bob.martin@insa.fr') ===

=== Remaining: 2 students ===
```

---

## Exercise 3

### Qt Database Integration: build a Qt application with a table view displaying database content, forms for adding/editing, search and filter, data validation (SqliteQt.py / principalSqlite.py)

**Answer:**

```python
import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLineEdit, QLabel, QTableView, QHeaderView,
)
from PyQt5.QtSql import QSqlDatabase, QSqlTableModel
from PyQt5.QtCore import Qt


class StudentGUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Student Registry")
        self.setGeometry(100, 100, 800, 600)
        self.setup_database()
        self.init_ui()

    def setup_database(self):
        self.db = QSqlDatabase.addDatabase("QSQLITE")
        self.db.setDatabaseName("student_registry.db")
        if not self.db.open():
            print("Error: Cannot open database")

    def init_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Search bar
        search_row = QHBoxLayout()
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search by name...")
        search_btn = QPushButton("Search")
        search_row.addWidget(self.search_input)
        search_row.addWidget(search_btn)

        # Table view with SQL model
        self.table_view = QTableView()
        self.model = QSqlTableModel()
        self.model.setTable("students")
        self.model.setEditStrategy(QSqlTableModel.OnFieldChange)
        self.model.select()

        self.model.setHeaderData(0, Qt.Horizontal, "ID")
        self.model.setHeaderData(1, Qt.Horizontal, "Name")
        self.model.setHeaderData(2, Qt.Horizontal, "First Name")
        self.model.setHeaderData(3, Qt.Horizontal, "Birth Date")
        self.model.setHeaderData(4, Qt.Horizontal, "Email")

        self.table_view.setModel(self.model)
        self.table_view.hideColumn(0)
        self.table_view.horizontalHeader().setSectionResizeMode(
            QHeaderView.Stretch
        )

        # Buttons
        btn_row = QHBoxLayout()
        add_btn = QPushButton("Add Student")
        delete_btn = QPushButton("Delete Selected")
        refresh_btn = QPushButton("Refresh")
        btn_row.addWidget(add_btn)
        btn_row.addWidget(delete_btn)
        btn_row.addWidget(refresh_btn)

        layout.addLayout(search_row)
        layout.addWidget(self.table_view)
        layout.addLayout(btn_row)

        # Connect signals
        search_btn.clicked.connect(self.search)
        self.search_input.returnPressed.connect(self.search)
        add_btn.clicked.connect(self.add_student)
        delete_btn.clicked.connect(self.delete_student)
        refresh_btn.clicked.connect(self.refresh)

    def search(self):
        text = self.search_input.text()
        if text:
            self.model.setFilter(
                f"name LIKE '%{text}%' OR first_name LIKE '%{text}%'"
            )
        else:
            self.model.setFilter("")
        self.model.select()

    def add_student(self):
        row = self.model.rowCount()
        self.model.insertRow(row)

    def delete_student(self):
        index = self.table_view.currentIndex()
        if index.isValid():
            self.model.removeRow(index.row())
            self.model.select()

    def refresh(self):
        self.model.setFilter("")
        self.search_input.clear()
        self.model.select()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = StudentGUI()
    window.show()
    sys.exit(app.exec_())
```

**Expected behavior:**
1. Initial: table shows all students, columns: Name, First Name, Birth Date, Email
2. Type "dup" and Search: only "Dupont Alice" shown
3. Click Refresh: all students, search cleared
4. Click Add Student: empty row at bottom, click cells to type
5. Select row and Delete Selected: row removed
6. Double-click a cell: cell becomes editable (OnFieldChange saves immediately)

---

## Exercise 4

### Reports and Queries: generate reports using aggregate SQL queries -- student lists, grade statistics, course enrollments

**Answer:**

```python
import sqlite3


def generate_reports(db_file):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Report 1: Student list with average grades
    print("=== Student Report ===")
    cursor.execute("""
        SELECT s.name, s.first_name,
               ROUND(AVG(e.grade), 2) as avg_grade,
               COUNT(e.course_id) as courses
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id
        GROUP BY s.id
        ORDER BY s.name
    """)
    print(f"{'Name':<15} {'First':<10} {'Avg Grade':<12} {'Courses':<8}")
    print("-" * 45)
    for row in cursor.fetchall():
        avg = row[2] if row[2] is not None else "N/A"
        print(f"{row[0]:<15} {row[1]:<10} {str(avg):<12} {row[3]:<8}")

    # Report 2: Course enrollment statistics
    print("\n=== Course Statistics ===")
    cursor.execute("""
        SELECT c.title,
               COUNT(e.student_id) as enrolled,
               ROUND(AVG(e.grade), 2) as avg_grade,
               MIN(e.grade) as min_grade,
               MAX(e.grade) as max_grade
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id
        ORDER BY c.title
    """)
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} students, "
              f"avg={row[2]}, range=[{row[3]}, {row[4]}]")

    conn.close()


generate_reports("student_registry.db")
```

**Expected output:**
```
=== Student Report ===
Name            First      Avg Grade    Courses 
---------------------------------------------
Dupont          Alice      14.25        2       
Martin          Bob        12.0         1       

=== Course Statistics ===
  ITI: 2 students, avg=13.75, range=[12.0, 15.5]
  Mathematiques: 1 students, avg=13.0, range=[13.0, 13.0]
```

**SQL concepts:**
- `LEFT JOIN` ensures students with no enrollments still appear (NULL grades)
- `GROUP BY s.id` aggregates per student
- `ROUND(AVG(e.grade), 2)` computes average rounded to 2 decimals
- Always use `?` placeholders for parameterized queries to prevent SQL injection
