---
title: "Chapitre 03 -- SQL Avance"
sidebar_position: 3
---

# Chapitre 03 -- SQL Avance

> **Idee centrale :** SQL avance permet de structurer des requetes complexes de facon lisible (CTEs, vues), de faire des calculs fenetre par fenetre (window functions), et d'automatiser des actions dans la base (triggers, procedures stockees).

---

## 1. Vues

### Definition

Une vue est une **requete sauvegardee** sous un nom. Elle se comporte comme une table virtuelle.

```sql noexec
-- Creer une vue
CREATE VIEW vue_clients_totaux AS
SELECT c.customerId, c.name,
       COUNT(*) AS nb_factures,
       SUM(f.amount) AS total
FROM customer c
JOIN facture f ON c.customerId = f.customerId
GROUP BY c.customerId, c.name;

-- Utiliser la vue comme une table
SELECT name, total
FROM vue_clients_totaux
WHERE total > 10000
ORDER BY total DESC;

-- Supprimer une vue
DROP VIEW IF EXISTS vue_clients_totaux;
```

### Avantages

| Avantage | Explication |
|----------|-------------|
| Simplification | Cache la complexite des jointures et sous-requetes |
| Securite | Restreindre l'acces a certaines colonnes ou lignes |
| Abstraction | Le schema sous-jacent peut evoluer sans casser les requetes |
| Reutilisation | Eviter de dupliquer des sous-requetes complexes |

### Vue materialisee vs vue standard

| Aspect | Vue standard | Vue materialisee |
|--------|-------------|-----------------|
| Stockage | Pas de stockage (recalculee a chaque appel) | Donnees stockees physiquement |
| Performance | Comme la requete sous-jacente | Plus rapide (donnees pre-calculees) |
| Fraicheur | Toujours a jour | Necessite un rafraichissement |
| Support SQLite | Oui | Non (PostgreSQL, Oracle) |

---

## 2. CTEs (Common Table Expressions)

### Definition

Un CTE est une sous-requete **nommee** definie dans un bloc `WITH`. Le resultat est reutilisable dans la requete principale.

```sql noexec
-- CTE simple
WITH gros_clients AS (
    SELECT customerId, SUM(amount) AS total
    FROM facture
    GROUP BY customerId
    HAVING SUM(amount) > 10000
)
SELECT c.name, gc.total
FROM customer c
JOIN gros_clients gc ON c.customerId = gc.customerId
ORDER BY gc.total DESC;
```

### CTEs multiples

```sql noexec
WITH
totaux AS (
    SELECT customerId, SUM(amount) AS total, COUNT(*) AS nb
    FROM facture
    GROUP BY customerId
),
stats AS (
    SELECT AVG(total) AS moy_total, AVG(nb) AS moy_nb
    FROM totaux
)
SELECT c.name, t.total, t.nb
FROM customer c
JOIN totaux t ON c.customerId = t.customerId
CROSS JOIN stats s
WHERE t.total > s.moy_total;
```

### CTE recursif

Utile pour parcourir des hierarchies (employes, categories, arbres).

```sql noexec
-- Hierarchie d'employes
WITH RECURSIVE hierarchie AS (
    -- Cas de base : le PDG (pas de manager)
    SELECT employeId, nom, managerId, 0 AS niveau
    FROM employe
    WHERE managerId IS NULL

    UNION ALL

    -- Cas recursif : employes sous le niveau precedent
    SELECT e.employeId, e.nom, e.managerId, h.niveau + 1
    FROM employe e
    JOIN hierarchie h ON e.managerId = h.employeId
)
SELECT nom, niveau
FROM hierarchie
ORDER BY niveau, nom;
```

---

## 3. Fonctions fenetres (Window Functions)

### Concept

Les fonctions fenetres effectuent un calcul sur un **ensemble de lignes liees** a la ligne courante, sans regrouper les resultats (contrairement a GROUP BY).

```sql noexec
SELECT nom, departement, salaire,
       AVG(salaire) OVER (PARTITION BY departement) AS moy_dept,
       RANK() OVER (ORDER BY salaire DESC) AS rang_global
FROM employe;
```

### Syntaxe

```
fonction() OVER (
    [PARTITION BY col1, col2]    -- decoupe en groupes
    [ORDER BY col3 [ASC|DESC]]   -- ordre dans le groupe
    [ROWS BETWEEN ... AND ...]   -- fenetre de lignes
)
```

### Fonctions principales

| Fonction | Description | Exemple |
|----------|-------------|---------|
| `ROW_NUMBER()` | Numero de ligne sequentiel | 1, 2, 3, 4, 5 |
| `RANK()` | Rang (avec egalites et trous) | 1, 2, 2, 4, 5 |
| `DENSE_RANK()` | Rang (avec egalites, sans trous) | 1, 2, 2, 3, 4 |
| `NTILE(n)` | Divise en n groupes | NTILE(4) = quartiles |
| `LAG(col, n)` | Valeur de n lignes **avant** | Comparaison avec la ligne precedente |
| `LEAD(col, n)` | Valeur de n lignes **apres** | Comparaison avec la ligne suivante |
| `FIRST_VALUE(col)` | Premiere valeur de la fenetre | -- |
| `LAST_VALUE(col)` | Derniere valeur de la fenetre | -- |
| `SUM(col)` | Somme cumulee | Running total |
| `AVG(col)` | Moyenne mobile | Moving average |

### Exemples pratiques

```sql noexec
-- Top 3 des factures par client
WITH ranked AS (
    SELECT customerId, amount,
           ROW_NUMBER() OVER (
               PARTITION BY customerId
               ORDER BY amount DESC
           ) AS rang
    FROM facture
)
SELECT * FROM ranked WHERE rang <= 3;

-- Difference avec la facture precedente
SELECT factureId, amount,
       amount - LAG(amount, 1) OVER (ORDER BY factureId) AS diff
FROM facture;

-- Somme cumulative par date
SELECT dateFacture, amount,
       SUM(amount) OVER (ORDER BY dateFacture) AS cumul
FROM facture;

-- Moyenne mobile sur 3 lignes
SELECT dateFacture, amount,
       AVG(amount) OVER (
           ORDER BY dateFacture
           ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
       ) AS moyenne_mobile
FROM facture;
```

---

## 4. Procedures stockees

### Definition

Une procedure stockee est un **bloc de code SQL** sauvegarde sur le serveur, reutilisable et parametrable.

```sql noexec
-- PostgreSQL / MySQL
CREATE OR REPLACE PROCEDURE augmenter_prix(
    p_categorie VARCHAR,
    p_pourcentage REAL
)
LANGUAGE SQL
AS $$
    UPDATE produit
    SET prix = prix * (1 + p_pourcentage / 100)
    WHERE categorieId = (
        SELECT categorieId FROM categorie WHERE nom = p_categorie
    );
$$;

-- Appel
CALL augmenter_prix('Electronique', 5.0);
```

### Avantages

- **Performance** : code compile et optimise sur le serveur.
- **Securite** : les utilisateurs appellent la procedure sans acceder aux tables.
- **Reutilisation** : evite de dupliquer la logique metier.

> **Note :** SQLite ne supporte pas les procedures stockees. Elles sont disponibles dans PostgreSQL, MySQL, Oracle, SQL Server.

---

## 5. Triggers

### Definition

Un trigger est un **bloc de code execute automatiquement** lors d'un evenement (INSERT, UPDATE, DELETE) sur une table.

```sql noexec
-- SQLite : trigger qui empeche les prix negatifs
CREATE TRIGGER verifier_prix
BEFORE INSERT ON produit
FOR EACH ROW
WHEN NEW.prix < 0
BEGIN
    SELECT RAISE(ABORT, 'Le prix ne peut pas etre negatif');
END;

-- PostgreSQL : trigger qui log les modifications
CREATE OR REPLACE FUNCTION log_modification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log(table_name, operation, timestamp)
    VALUES (TG_TABLE_NAME, TG_OP, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_audit
AFTER INSERT OR UPDATE OR DELETE ON produit
FOR EACH ROW
EXECUTE FUNCTION log_modification();
```

### Types de triggers

| Type | Quand | Usage |
|------|-------|-------|
| `BEFORE INSERT` | Avant l'insertion | Validation, valeurs par defaut |
| `AFTER INSERT` | Apres l'insertion | Audit, notifications |
| `BEFORE UPDATE` | Avant la modification | Validation, historique |
| `AFTER UPDATE` | Apres la modification | Synchronisation |
| `BEFORE DELETE` | Avant la suppression | Protection, archivage |
| `AFTER DELETE` | Apres la suppression | Nettoyage |
| `INSTEAD OF` | A la place de l'operation | Vues modifiables |

---

## 6. CASE WHEN

```sql noexec
-- Classification conditionnelle
SELECT name, amount,
    CASE
        WHEN amount > 10000 THEN 'Premium'
        WHEN amount > 1000 THEN 'Standard'
        ELSE 'Basic'
    END AS categorie_client
FROM customer c
JOIN facture f ON c.customerId = f.customerId;
```

---

## 7. Pieges classiques

| Piege | Explication |
|-------|-------------|
| Vue modifiable | Toutes les vues ne sont pas modifiables (INSERT/UPDATE). Les vues avec JOIN, GROUP BY, DISTINCT ne le sont generalement pas. |
| CTE non materialise | Un CTE est recalcule a chaque reference dans certains SGBD. Preferer une table temporaire si le CTE est utilise plusieurs fois. |
| Window function dans WHERE | Impossible directement. Emballer dans un CTE ou sous-requete. |
| LAST_VALUE sans frame | Par defaut, la fenetre va jusqu'a la ligne courante. Ajouter `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`. |
| Trigger recursif | Un trigger qui modifie sa propre table peut boucler a l'infini. |

---

## CHEAT SHEET

```
VUE :
  CREATE VIEW nom AS SELECT ...;
  DROP VIEW IF EXISTS nom;

CTE :
  WITH nom AS (SELECT ...)
  SELECT ... FROM nom;

CTE RECURSIF :
  WITH RECURSIVE nom AS (
    SELECT ... -- cas de base
    UNION ALL
    SELECT ... JOIN nom ... -- cas recursif
  )
  SELECT ... FROM nom;

WINDOW FUNCTIONS :
  ROW_NUMBER() | RANK() | DENSE_RANK()
  LAG(col, n) | LEAD(col, n)
  SUM(col) | AVG(col) | COUNT(col)
  OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN ... AND ...)

TRIGGER :
  CREATE TRIGGER nom
  BEFORE|AFTER INSERT|UPDATE|DELETE ON table
  FOR EACH ROW
  BEGIN ... END;

CASE :
  CASE WHEN cond THEN val1 WHEN cond2 THEN val2 ELSE val3 END
```
