---
title: "LDS3 - Gestion de bases de donnees SQLite"
sidebar_position: 10
---

# LDS3 - Gestion de bases de donnees SQLite

## Objectifs pedagogiques

Integration de bases de donnees avec Python et Qt :

- Comprendre les concepts de bases de donnees relationnelles
- Travailler avec les bases de donnees SQLite
- Executer des requetes SQL depuis Python
- Integrer des bases de donnees avec l'interface Qt
- Implementer les operations CRUD (Create, Read, Update, Delete)
- Utiliser l'architecture Modele-Vue de Qt

## Concepts fondamentaux

### 1. Bases de SQLite

**SQLite** : base de donnees relationnelle legere basee sur un fichier
- Pas de serveur necessaire
- Stockage dans un seul fichier
- Support du standard SQL
- Parfait pour les applications de bureau

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

### 2. Fondamentaux du SQL

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

### 3. Module SQLite de Python

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

### 4. Integration Qt avec les bases de donnees

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

### 5. Architecture Modele-Vue

**Modele** : gere les donnees (QSqlTableModel, QSqlQueryModel)
**Vue** : affiche les donnees (QTableView, QListView)
**Controleur** : gere les entrees utilisateur

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

### 6. Requetes parametrees

**Toujours utiliser des requetes parametrees** pour prevenir l'injection SQL :

```python noexec
# WRONG (SQL injection vulnerable)
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# CORRECT (safe)
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))
```

## Apercu des exercices

### Exercice 1 : Creation de base de donnees
Creer une base de donnees SQLite avec des tables pour un registre d'etudiants.

**Schema** :
- Students table (id, name, birth_date, etc.)
- Courses table
- Enrollments table (many-to-many relationship)

### Exercice 2 : Operations CRUD
Implementer une interface CRUD complete :
- Create new records
- Read/display records
- Update existing records
- Delete records

### Exercice 3 : Integration Qt
Construire une application Qt avec une base de donnees en backend.

**Fonctionnalites** :
- Table view displaying database content
- Forms for adding/editing records
- Search and filter functionality
- Data validation

### Exercice 4 : Rapports et requetes
Generer des rapports depuis la base de donnees :
- Student lists
- Grade statistics
- Course enrollments

## Solutions

See `src/` directory et les fichiers originaux :
- `gestionBD.py` - Classe de gestion de base de donnees
- `SqliteQt.py` - Exemple d'integration Qt
- `principalSqlite.py` - Application principale
- `BDRegMat.py` - Base de donnees du registre etudiant

## Points cles a retenir

1. **SQLite est parfait pour les applications de bureau** - Pas de serveur, pas de configuration
2. **Toujours utiliser des requetes parametrees** - Previent l'injection SQL
3. **Valider apres les ecritures** - Les modifications ne sont pas sauvegardees avant commit()
4. **Fermer les connexions** - Utiliser les gestionnaires de contexte ou les blocs finally
5. **Modele-Vue separe les responsabilites** - Architecture propre

## Motifs courants

### Patron de gestionnaire de contexte
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

### Patron de depot
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

## Erreurs courantes

1. **Ne pas valider les modifications** - Les ecritures necessitent conn.commit()
2. **Injection SQL** - Utiliser des requetes parametrees
3. **Oublier de fermer les connexions** - Cause des problemes de verrouillage
4. **Melanger le formatage de chaines avec le SQL** - Utiliser les marqueurs ?
5. **Ne pas gerer les exceptions** - Les erreurs de base de donnees necessitent une gestion d'erreurs
6. **Requetes inefficaces** - Utiliser des index, eviter SELECT *

## Pour aller plus loin

- SQLite Documentation: https://www.sqlite.org/docs.html
- SQL Tutorial: https://www.sqlitetutorial.net/
- Qt SQL Module: https://doc.qt.io/qt-5/qtsql-index.html
- Database design: Normalization, foreign keys, indexes
- ORM libraries: SQLAlchemy, Peewee (alternatives to raw SQL)

## Conseils de conception de bases de donnees

1. **Cles primaires** - Utiliser INTEGER PRIMARY KEY AUTOINCREMENT
2. **Cles etrangeres** - Imposer l'integrite referentielle
3. **Index** - Accelerer les requetes sur les colonnes frequemment recherchees
4. **Normalisation** - Eviter la duplication des donnees
5. **Types de donnees** - INTEGER, TEXT, REAL, BLOB
6. **Contraintes** - NOT NULL, UNIQUE, CHECK

## Bonnes pratiques SQL

1. **Utiliser les transactions** - Regrouper les operations liees
2. **Gerer les erreurs** - Verifier les valeurs de retour, attraper les exceptions
3. **Valider les entrees** - Avant d'inserer dans la base de donnees
4. **Utiliser les index judicieusement** - Accelere les lectures, ralentit les ecritures
5. **Sauvegarder regulierement** - Les fichiers SQLite peuvent etre copies
