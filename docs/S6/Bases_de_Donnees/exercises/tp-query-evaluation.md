---
title: "TP1 - Evaluation de Requetes (Query Evaluation)"
sidebar_position: 10
---

# TP1 - Evaluation de Requetes (Query Evaluation)

> D'apres les instructions du sujet : S6/Bases_de_Donnees/data/moodle/tp/tp1_query_evaluation/README.md
> Fichiers SQL sources : 01_basic_queries.sql, 02_create_tables.sql, 03_index_analysis.sql, 04_query_optimization.sql

---

## Partie 1 : Prise en main de SQLite (Section 7.1)

Schema de la base :

```sql
CREATE TABLE etudiant (
    etudId VARCHAR(3),
    nom VARCHAR(30),
    prenom VARCHAR(30)
);

CREATE TABLE professeur (
    profId VARCHAR(3),
    nom VARCHAR(30),
    prenom VARCHAR(30)
);

CREATE TABLE enseignement (
    ensId VARCHAR(3),
    sujet VARCHAR(50)
);

CREATE TABLE enseignementSuivi (
    ensId VARCHAR(3),
    etudId VARCHAR(3),
    profId VARCHAR(3)
);
```

Donnees : 73 etudiants (etudiants.txt), 25 professeurs (profs.txt).

---

### Exercice 5(a)

### Liste des prenoms et noms des etudiants

**Reponse :**
```sql noexec
SELECT nom, prenom
FROM etudiant;
```

**Resultat attendu :**

| nom | prenom |
|-----|--------|
| DUPONT | Alice |
| MARTIN | Bob |
| ... | ... |

73 lignes retournees.

**Explication :**
SELECT simple sans filtre retournant toutes les lignes de la table etudiant. La projection se fait sur nom et prenom uniquement.

---

### Exercice 5(b)

### Liste des professeurs dont le nom contient la lettre 'a'

**Reponse :**
```sql noexec
SELECT nom, prenom
FROM professeur
WHERE nom LIKE '%a%';
```

**Resultat attendu :**

| nom | prenom |
|-----|--------|
| ARNALDI | Bruno |
| GARCIA | Luis |
| MARCHAL | Pierre |

**Explication :**
L'operateur LIKE avec le motif '%a%' fait de la recherche par motif. Le caractere '%' remplace 0 ou N caracteres. La recherche est sensible a la casse par defaut dans SQLite ('a' ne correspond pas a 'A').

---

### Exercice 5(c)

### Liste des associations possibles (produit cartesien) professeur et etudiant

**Reponse :**
```sql noexec
SELECT etudId, profId
FROM etudiant, professeur;
```

**Resultat attendu :**

| etudId | profId |
|--------|--------|
| E1 | P1 |
| E1 | P2 |
| ... | ... |
| E73 | P25 |

73 x 25 = 1825 lignes retournees.

**Explication :**
Sans clause WHERE, le FROM sur deux tables genere le produit cartesien : chaque ligne de etudiant est combinee avec chaque ligne de professeur. C'est rarement utile en pratique mais illustre le concept fondamental du produit cartesien.

---

### Exercice 6

### Quelle est la taille de page (taille de bloc) de SQLite ?

**Reponse :**
```sql noexec
PRAGMA page_size;
```

**Resultat attendu :**
```
4096
```

**Explication :**
SQLite organise ses donnees en pages de 4096 octets (4 Ko). C'est l'unite minimale de lecture/ecriture sur le disque. Chaque noeud d'un index B+ tree occupe une page.

---

## Partie 2 : Base de donnees volumineuse et indexation (Section 7.2.2)

Prerequis : generer une table `demo` avec 1 million de lignes via `DBgenerator.java` :

```bash
javac DBgenerator.java
java DBgenerator 1000000
sqlite3 test_demo.db < database.sql
```

Schema genere :
```sql noexec
CREATE TABLE demo(id INTEGER PRIMARY KEY, code INTEGER);
-- 1 000 000 lignes avec code aleatoire dans [0, 100 000 000[
```

Activer le chronometre :
```sql noexec
.timer ON
```

---

### Exercice Q1

### Recherche d'un code existant dans la base

**Reponse :**
```sql noexec
SELECT *
FROM demo
WHERE code = 62518937;
```

**Resultat attendu :**
```
id          code
----------  ----------
42          62518937
Run Time: real 0.156 user 0.140 sys 0.016
```

Temps : ~0.1 a 0.2 secondes.

**Explication :**
Sans index, SQLite effectue un parcours sequentiel (SCAN TABLE) de toutes les lignes. Il lit les 1 million de lignes une par une. Complexite : O(n).

---

### Exercice Q2

### Recherche d'un code inexistant dans la base

**Reponse :**
```sql noexec
SELECT *
FROM demo
WHERE code = 99999999;
```

**Resultat attendu :**
```
Run Time: real 0.072 user 0.064 sys 0.008
```

Temps : ~0.05 a 0.08 secondes (aucune ligne retournee).

**Explication :**
Legerement plus rapide que Q1 car il n'y a pas de ligne a formatter/retourner, mais le parcours complet est tout de meme effectue.

---

### Exercice Q3

### Recherche avec un code inexistant et condition impossible (>)

**Reponse :**
```sql noexec
SELECT *
FROM demo
WHERE code > 999999999;
```

**Resultat attendu :**
```
Run Time: real 6.234 user 5.890 sys 0.340
```

Temps : ~5 a 7 secondes (aucune ligne retournee, car max = 100 000 000).

**Explication :**
La comparaison '>' est plus couteuse que '=' car SQLite ne peut pas s'arreter des qu'il trouve une valeur : il doit verifier CHAQUE ligne. Le parcours complet de table est inevitable sans index.

---

### Exercice Q4

### Analyser les plans d'execution avant creation d'index (EXPLAIN QUERY PLAN)

**Reponse :**
```sql noexec
EXPLAIN QUERY PLAN SELECT * FROM demo WHERE code = 62518937;
-- Result: SCAN TABLE demo

EXPLAIN QUERY PLAN SELECT * FROM demo WHERE code = 99999999;
-- Result: SCAN TABLE demo

EXPLAIN QUERY PLAN SELECT * FROM demo WHERE code > 999999999;
-- Result: SCAN TABLE demo
```

**Resultat attendu :**
```
QUERY PLAN
`--SCAN TABLE demo
```

Pour les trois requetes, le plan est identique : SCAN TABLE = parcours lineaire O(n).

**Explication :**
EXPLAIN QUERY PLAN revele la strategie d'execution de SQLite. "SCAN TABLE" signifie un parcours complet de toutes les lignes -- c'est inefficace sur une grande table.

---

### Exercice Q5

### Creer un index sur la colonne code

**Reponse :**
```sql noexec
CREATE INDEX demoIDX ON demo(code);
```

**Resultat attendu :**
Index B+ tree cree sur la colonne code.

**Explication :**
SQLite construit un arbre B+ tree sur les valeurs de la colonne code. L'arbre a une profondeur d'environ 20 niveaux pour 1M lignes (log2(1000000) ~= 20). Chaque noeud occupe une page de 4096 octets. Les feuilles contiennent les valeurs de code et les rowid correspondants.

---

### Exercice Q6

### Re-executer les memes requetes AVEC l'index et comparer les temps d'execution

**Reponse :**
```sql noexec
-- Q1 avec index (valeur existante)
SELECT * FROM demo WHERE code = 62518937;
-- Temps: ~0.0001s (acceleration x1000)

-- Q2 avec index (valeur inexistante)
SELECT * FROM demo WHERE code = 99999999;
-- Temps: ~0.0001s (acceleration x800)

-- Q3 avec index (intervalle)
SELECT * FROM demo WHERE code > 999999999;
-- Temps: ~0.0004s (acceleration x15000)
```

**Resultat attendu :**

| Requete | Sans index | Avec index | Acceleration | Plan sans index | Plan avec index |
|---------|-----------|------------|-------------|-----------------|-----------------|
| code = 62518937 (existe) | 0.1-0.2s | 0.0001s | x1000 | SCAN TABLE | SEARCH USING COVERING INDEX (code=?) |
| code = 99999999 (n'existe pas) | 0.05-0.08s | 0.0001s | x800 | SCAN TABLE | SEARCH USING COVERING INDEX (code=?) |
| code > 999999999 (intervalle) | 5-7s | 0.0004s | x15000 | SCAN TABLE | SEARCH USING COVERING INDEX (code>?) |

Plans d'execution apres creation de l'index :

```sql noexec
EXPLAIN QUERY PLAN SELECT * FROM demo WHERE code = 62518937;
-- SEARCH TABLE demo USING COVERING INDEX demoIDX (code=?)

EXPLAIN QUERY PLAN SELECT * FROM demo WHERE code = 99999999;
-- SEARCH TABLE demo USING COVERING INDEX demoIDX (code=?)

EXPLAIN QUERY PLAN SELECT * FROM demo WHERE code > 999999999;
-- SEARCH TABLE demo USING COVERING INDEX demoIDX (code>?)
```

**Explication :**
L'index transforme le plan de SCAN (O(n)) en SEARCH (O(log n)). "COVERING INDEX" signifie que toutes les colonnes demandees (id et code) sont dans l'index lui-meme -- pas besoin d'acceder a la table. C'est le cas le plus performant.

---

## Partie 3 : Comprendre le temps d'execution des requetes (Section 7.2.3)

Prerequis : generer les tables facture et customer via `DBgenerator1.java` :

```bash
javac DBgenerator1.java
java DBgenerator1 1000000
sqlite3 test_facture.db < database1.sql
```

Schema genere :
```sql noexec
CREATE TABLE facture (factureId INTEGER, customerId TEXT, amount REAL);
CREATE TABLE customer (customerId TEXT, name TEXT);
-- 1 000 000 lignes chacune, montants dans [0, 1000.01] euros
```

Probleme : trouver les noms des clients ayant au moins une facture > 999 euros.

---

### Exercice Q7

### Predire les temps d'execution puis executer les 4 variantes de requete

**Reponse :**

**Requete 1 : JOIN avec WHERE**
```sql noexec
SELECT c.name
FROM customer c, facture f
WHERE f.customerId = c.customerId AND f.amount > 999;
```
Temps : ~200 secondes. Complexite : O(n*m) -- boucle imbriquee (nested loop).

**Requete 2 : Sous-requete avec IN (LA PLUS RAPIDE)**
```sql noexec
SELECT name
FROM customer
WHERE customerId IN (
    SELECT f.customerId
    FROM facture f
    WHERE amount > 999
);
```
Temps : ~0.996 secondes. Complexite : O(n+m) -- deux parcours lineaires sequentiels.

**Requete 3 : NATURAL JOIN avec WHERE**
```sql noexec
SELECT name
FROM (customer NATURAL JOIN facture)
WHERE amount > 999;
```
Temps : ~283 secondes (LA PLUS LENTE). Complexite : O(n*m) + surcout de resolution des noms de colonnes.

**Requete 4 : Sous-requete avec IN et JOIN interne**
```sql noexec
SELECT name
FROM customer
WHERE customerId IN (
    SELECT c.customerId
    FROM customer c, facture f
    WHERE c.customerId = f.customerId AND f.amount > 999
);
```
Temps : ~219 secondes. Complexite : O(n*m) -- le JOIN dans la sous-requete annule l'avantage du IN.

**Resultat attendu :**

| Requete | Strategie | Temps sans index | Complexite |
|-------|----------|-----------------|------------|
| 1 | JOIN + WHERE | 200s | O(n*m) |
| 2 | Sous-requete + IN | 0.996s | O(n+m) |
| 3 | NATURAL JOIN | 283s | O(n*m) + surcout |
| 4 | Sous-requete + JOIN | 219s | O(n*m) |

Classement : Requete 2 >> Requete 1 > Requete 4 > Requete 3

**Explication :**
La requete 2 est 200x plus rapide car : (1) la sous-requete parcourt facture UNE SEULE FOIS et collecte les ~1000 customerId avec amount > 999 ; (2) la requete principale parcourt customer UNE SEULE FOIS et verifie l'appartenance via IN. Pas de produit cartesien.

---

### Exercice Q8

### Desactiver l'index automatique et re-mesurer les temps

**Reponse :**
```sql noexec
PRAGMA automatic_index = 0;
```

**Resultat attendu :**
Les temps refletent maintenant la performance brute sans l'aide d'index temporaires crees automatiquement par SQLite.

**Explication :**
Quand automatic_index est active (par defaut), SQLite peut creer des index temporaires pendant l'execution. En le desactivant, on mesure la performance pure de chaque structure de requete.

---

### Exercice Q9

### Analyser les plans d'execution des 4 requetes (EXPLAIN QUERY PLAN)

**Reponse :**
```sql noexec
-- Requete 1
EXPLAIN QUERY PLAN
SELECT c.name FROM customer c, facture f
WHERE f.customerId = c.customerId AND f.amount > 999;
-- SCAN facture, SCAN customer (nested loop join)

-- Requete 2
EXPLAIN QUERY PLAN
SELECT name FROM customer
WHERE customerId IN (SELECT f.customerId FROM facture f WHERE amount > 999);
-- SCAN facture (subquery), SCAN customer with IN lookup

-- Requete 3
EXPLAIN QUERY PLAN
SELECT name FROM (customer NATURAL JOIN facture) WHERE amount > 999;
-- SCAN facture, SCAN customer (implicit join)

-- Requete 4
EXPLAIN QUERY PLAN
SELECT name FROM customer
WHERE customerId IN (
    SELECT c.customerId FROM customer c, facture f
    WHERE c.customerId = f.customerId AND f.amount > 999
);
-- SCAN facture and customer in subquery, then SCAN customer again
```

**Resultat attendu :**
Les plans confirment pourquoi la requete 2 est plus rapide : elle effectue deux parcours lineaires sequentiels (O(n+m)) tandis que les autres font des boucles imbriquees (O(n*m)).

**Explication :**
EXPLAIN QUERY PLAN permet de comprendre la strategie sans executer la requete. On identifie les SCAN (parcours complet) et on peut prevoir la complexite.

---

### Exercice Q10

### Creer un index composite et re-mesurer les 4 variantes

**Reponse :**
```sql noexec
CREATE INDEX IamSpeeed ON facture(customerId, amount);
```

**Resultat attendu :**

| Requete | Sans index | Avec index | Acceleration |
|---------|-----------|------------|-------------|
| 1. JOIN + WHERE | 200s | 3s | x67 |
| 2. Sous-requete + IN | 0.996s | 0.787s | x1.3 |
| 3. NATURAL JOIN | 283s | 4.5s | x63 |
| 4. Sous-requete + JOIN | 219s | 5.3s | x41 |

**Explication :**
L'index composite (customerId, amount) optimise a la fois les JOIN sur customerId et le filtrage sur amount. Observations cles :
- L'index accelere enormement les JOIN (x41 a x67) en transformant les SCAN en SEARCH.
- La requete 2 etait deja quasi-optimale sans index -- l'index n'apporte que x1.3.
- Meme avec index, la requete 2 reste la plus rapide (0.8s vs 3s).
- La structure de la requete est plus importante que l'index : optimiser la requete d'abord, ajouter des index ensuite.
- NATURAL JOIN a un surcout de resolution des noms de colonnes -- toujours preferer un JOIN explicite.
