---
title: "SQL et SQLite"
sidebar_position: 9
---

# SQL et SQLite

## Apercu

SQLite est une base de donnees relationnelle legere, basee sur un fichier. Le cours LDS l'utilise pour enseigner les concepts de bases de donnees et l'integration avec Python. Contrairement a MySQL ou PostgreSQL, SQLite ne necessite pas de serveur -- la base de donnees entiere est un seul fichier.

## Fondamentaux du SQL

### Types de donnees en SQLite

| Type | Description | Exemple |
|------|-------------|---------|
| `INTEGER` | Nombres entiers | 42, -7, 0 |
| `REAL` | Nombres a virgule flottante | 3.14, -0.5 |
| `TEXT` | Chaine de caracteres | 'Alice', "hello" |
| `BLOB` | Donnees binaires | Images, fichiers |
| `NULL` | Pas de valeur | NULL |

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

-- Table de relation plusieurs-a-plusieurs
CREATE TABLE enrollments (
    student_id INTEGER,
    course_id INTEGER,
    grade REAL,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Creer seulement si elle n'existe pas
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT
);
```

### Contraintes

| Contrainte | Objectif |
|-----------|----------|
| `PRIMARY KEY` | Identifiant unique pour chaque ligne |
| `AUTOINCREMENT` | Generation automatique d'ID sequentiels |
| `NOT NULL` | Valeur obligatoire |
| `UNIQUE` | Pas de doublons autorises |
| `DEFAULT value` | Valeur par defaut si non specifiee |
| `CHECK(expr)` | Valider la valeur selon une expression |
| `FOREIGN KEY` | Reference vers une autre table |

### INSERT

```sql noexec
INSERT INTO students (name, age, grade)
VALUES ('Alice', 20, 15.5);

INSERT INTO students (name, age, grade)
VALUES ('Bob', 21, 12.0), ('Carol', 19, 17.0);

-- Inserer depuis une autre requete
INSERT INTO archive_students
SELECT * FROM students WHERE grade < 10;
```

### SELECT

```sql noexec
-- Basique
SELECT * FROM students;
SELECT name, grade FROM students;

-- Filtrage
SELECT * FROM students WHERE age > 18;
SELECT * FROM students WHERE name LIKE 'A%';       -- Commence par A
SELECT * FROM students WHERE name LIKE '%son';      -- Finit par son
SELECT * FROM students WHERE grade BETWEEN 10 AND 15;
SELECT * FROM students WHERE age IN (19, 20, 21);
SELECT * FROM students WHERE email IS NOT NULL;

-- Tri
SELECT * FROM students ORDER BY grade DESC;
SELECT * FROM students ORDER BY name ASC, grade DESC;

-- Limitation
SELECT * FROM students LIMIT 10;
SELECT * FROM students LIMIT 10 OFFSET 20;         -- Pagination

-- Distinct
SELECT DISTINCT age FROM students;

-- Alias
SELECT name AS student_name, grade AS note FROM students;
```

### Fonctions d'agregation

```sql noexec
SELECT COUNT(*) FROM students;                      -- Compter les lignes
SELECT COUNT(DISTINCT age) FROM students;           -- Compter les ages uniques
SELECT AVG(grade) FROM students;                    -- Moyenne
SELECT SUM(grade) FROM students;                    -- Somme
SELECT MIN(grade), MAX(grade) FROM students;        -- Min/Max
SELECT ROUND(AVG(grade), 2) FROM students;          -- Moyenne arrondie

-- GROUP BY
SELECT age, COUNT(*), AVG(grade)
FROM students
GROUP BY age;

-- HAVING (filtrer apres le regroupement)
SELECT age, AVG(grade) as avg_grade
FROM students
GROUP BY age
HAVING avg_grade > 14;
```

### UPDATE

```sql noexec
UPDATE students SET grade = 16.0 WHERE id = 1;
UPDATE students SET grade = grade + 1 WHERE grade < 10;
UPDATE students SET age = age + 1;                  -- Toutes les lignes
```

### DELETE

```sql noexec
DELETE FROM students WHERE id = 1;
DELETE FROM students WHERE grade < 5;
DELETE FROM students;                               -- Supprimer TOUTES les lignes
```

### JOIN

```sql noexec
-- INNER JOIN : uniquement les lignes correspondantes des deux tables
SELECT students.name, courses.title, enrollments.grade
FROM students
INNER JOIN enrollments ON students.id = enrollments.student_id
INNER JOIN courses ON enrollments.course_id = courses.id;

-- LEFT JOIN : toutes les lignes de la table de gauche, correspondances de la droite
SELECT students.name, enrollments.course_id
FROM students
LEFT JOIN enrollments ON students.id = enrollments.student_id;

-- Raccourci avec alias
SELECT s.name, c.title, e.grade
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE e.grade > 14
ORDER BY e.grade DESC;
```

### Sous-requetes

```sql noexec
-- Sous-requete dans WHERE
SELECT name FROM students
WHERE grade > (SELECT AVG(grade) FROM students);

-- Sous-requete dans FROM
SELECT avg_by_age.age, avg_by_age.avg_grade
FROM (
    SELECT age, AVG(grade) as avg_grade
    FROM students
    GROUP BY age
) AS avg_by_age
WHERE avg_by_age.avg_grade > 14;
```

### ALTER TABLE et DROP

```sql noexec
ALTER TABLE students ADD COLUMN phone TEXT;
ALTER TABLE students RENAME TO alumni;
DROP TABLE IF EXISTS temp_data;
```

### Index

```sql noexec
CREATE INDEX idx_student_name ON students(name);
CREATE UNIQUE INDEX idx_student_email ON students(email);
DROP INDEX idx_student_name;
```

## Module sqlite3 de Python

### Connexion de base

```python noexec
import sqlite3

# Se connecter (cree le fichier s'il n'existe pas)
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Executer du SQL
cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE
    )
""")

# Inserer des donnees (TOUJOURS utiliser des requetes parametrees)
cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)",
               ("Alice", "alice@example.com"))

# Valider les modifications (obligatoire pour les ecritures)
conn.commit()

# Interroger les donnees
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()         # Liste de tuples
for row in rows:
    print(f"ID: {row[0]}, Name: {row[1]}, Email: {row[2]}")

# Une seule ligne
cursor.execute("SELECT * FROM users WHERE id = ?", (1,))
user = cursor.fetchone()         # Un seul tuple ou None

# Fermer la connexion
conn.close()
```

### Requetes parametrees (ESSENTIEL)

```python noexec
# FAUX -- vulnerable a l'injection SQL
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# CORRECT -- securise, parametre
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))

# Plusieurs parametres
cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)",
               (name, email))

# Executer pour plusieurs lignes
data = [("Alice", "a@b.com"), ("Bob", "b@b.com")]
cursor.executemany("INSERT INTO users (name, email) VALUES (?, ?)", data)
```

### Patron de classe Database

```python noexec
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

### Patron gestionnaire de contexte

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

# Utilisation
with Database('db.sqlite') as cursor:
    cursor.execute("SELECT * FROM items")
    rows = cursor.fetchall()
```

## Integration Qt avec les bases de donnees

```python noexec
from PyQt5.QtSql import QSqlDatabase, QSqlQuery, QSqlTableModel
from PyQt5.QtCore import Qt

# Connexion
db = QSqlDatabase.addDatabase('QSQLITE')
db.setDatabaseName('database.db')
if not db.open():
    print("Error opening database")

# Executer une requete
query = QSqlQuery()
query.exec_("SELECT * FROM students")
while query.next():
    print(f"{query.value(0)}: {query.value(1)}")

# Modele de table pour QTableView
model = QSqlTableModel()
model.setTable('students')
model.setEditStrategy(QSqlTableModel.OnFieldChange)
model.select()

# Definir les en-tetes de colonnes
model.setHeaderData(0, Qt.Horizontal, "ID")
model.setHeaderData(1, Qt.Horizontal, "Name")

# Connecter a la vue
table_view.setModel(model)
table_view.hideColumn(0)    # Masquer la colonne ID
```

## Conception de bases de donnees

### Regles de normalisation

1. **1NF** : chaque colonne contient des valeurs atomiques (pas de listes)
2. **2NF** : pas de dependance partielle sur une cle composite
3. **3NF** : pas de dependances transitives (un non-cle depend d'un autre non-cle)

### Conseils de conception

- Chaque table doit avoir une PRIMARY KEY
- Utiliser AUTOINCREMENT pour les cles de substitution
- Utiliser des FOREIGN KEYs pour imposer les relations
- Creer des index sur les colonnes frequemment interrogees
- Eviter de stocker des valeurs calculees (les calculer avec des requetes)

---

## AIDE-MEMOIRE

### Reference rapide SQL
```sql noexec
CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO t (name) VALUES ('val');
SELECT * FROM t WHERE condition;
UPDATE t SET col = val WHERE condition;
DELETE FROM t WHERE condition;
SELECT a.col, b.col FROM a JOIN b ON a.id = b.a_id;
SELECT col, COUNT(*) FROM t GROUP BY col HAVING COUNT(*) > 1;
```

### Python sqlite3
```python noexec
conn = sqlite3.connect('db.db')
cursor = conn.cursor()
cursor.execute("SQL", (params,))     # TOUJOURS utiliser les parametres ?
conn.commit()                         # Apres les ecritures
rows = cursor.fetchall()              # Obtenir les resultats
conn.close()                          # Nettoyer
```

### Regles cles
- TOUJOURS utiliser des requetes parametrees (marqueurs ?)
- TOUJOURS valider apres INSERT/UPDATE/DELETE
- TOUJOURS fermer les connexions
- Utiliser les instructions `with` pour la securite
- Creer des index sur les colonnes utilisees dans les clauses WHERE
