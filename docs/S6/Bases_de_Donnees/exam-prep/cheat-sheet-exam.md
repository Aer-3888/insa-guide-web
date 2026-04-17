---
title: "Cheat Sheet pour le DS -- Bases de Donnees"
sidebar_position: 3
---

# Cheat Sheet pour le DS -- Bases de Donnees

> Tout ce qu'il faut savoir par coeur le jour du DS. A imprimer (si autorise) ou a reviser la veille.

---

## 1. Dependances fonctionnelles

### Axiomes d'Armstrong

```
Reflexivite  : Y dans X  =>  X -> Y
Augmentation : X -> Y    =>  XZ -> YZ
Transitivite : X -> Y et Y -> Z  =>  X -> Z
```

### Regles derivees

```
Union        : X -> Y et X -> Z  =>  X -> YZ
Decomposition: X -> YZ           =>  X -> Y et X -> Z
```

### Algorithme de fermeture X+

```
resultat = X
REPETER :
  Pour chaque DF (A -> B) :
    Si A dans resultat : resultat = resultat U B
JUSQU'A stabilite
```

### Cles candidates

```
1. Attributs JAMAIS en partie droite = obligatoires dans toute cle
2. Calculer fermeture de ces attributs
3. Si = tous les attributs -> cle candidate
4. Sinon ajouter des attributs et recalculer
```

### Couverture minimale

```
1. DECOMPOSER  : 1 attribut en partie droite
2. REDUIRE     : tester si attribut superflu en partie gauche
3. SUPPRIMER   : tester si DF redondante
```

---

## 2. Formes normales

| Forme | Condition | Elimine |
|-------|-----------|---------|
| **1NF** | Valeurs atomiques | Attributs multivalues |
| **2NF** | 1NF + pas de DP partielle | Dependance d'un sous-ensemble de la cle |
| **3NF** | 2NF + pas de DP transitive | Dependance entre attributs non-cles |
| **BCNF** | Tout determinant est super-cle | Toute anomalie DF |

### Decomposition 3NF (synthese Bernstein)

```
1. Couverture minimale
2. Pour chaque partie gauche X : creer R_X = X U {attributs determines}
3. Si aucune relation ne contient une cle candidate : en ajouter une
4. Supprimer les relations incluses dans d'autres
```

### Decomposition BCNF

```
1. Trouver X -> Y violant BCNF (X pas super-cle)
2. R1 = X+    R2 = X U (R - X+)
3. Recursion
ATTENTION : peut perdre des DF !
```

---

## 3. SQL

### Ordre d'execution

```
FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT
```

### Syntaxe de base

```sql
SELECT [DISTINCT] col1, AGG(col2)
FROM t1
[INNER|LEFT|RIGHT|CROSS] JOIN t2 ON condition
WHERE condition_lignes
GROUP BY col1
HAVING condition_groupes
ORDER BY col1 [ASC|DESC]
LIMIT n OFFSET m;
```

### Fonctions d'agregation

```
COUNT(*) | COUNT(col) | COUNT(DISTINCT col)
SUM(col) | AVG(col) | MIN(col) | MAX(col)
```

### Division (double NOT EXISTS)

```sql
SELECT x FROM T1
WHERE NOT EXISTS (
    SELECT y FROM T2
    WHERE NOT EXISTS (
        SELECT * FROM T3
        WHERE T3.x = T1.x AND T3.y = T2.y
    )
)
```

Lecture : "Les x pour lesquels il n'existe pas de y sans correspondance."

### Pieges NULL

```sql
WHERE col IS NULL          -- pas WHERE col = NULL
NOT IN + NULL = vide       -- ajouter WHERE col IS NOT NULL
```

---

## 4. Algebre relationnelle

```
sigma_{cond}(R)         ->  SELECT * FROM R WHERE cond
pi_{cols}(R)            ->  SELECT DISTINCT cols FROM R
R1 x R2                 ->  CROSS JOIN
R1 |x|_{cond} R2       ->  JOIN ... ON cond
R1 U R2                 ->  UNION
R1 - R2                 ->  EXCEPT
R1 ∩ R2                 ->  INTERSECT
R1 div R2               ->  NOT EXISTS (NOT EXISTS ...)
```

---

## 5. XML / XQuery

### DTD

```xml
<!ELEMENT parent (enfant+)>     -- 1 ou plusieurs
<!ELEMENT enfant (#PCDATA)>     -- texte
<!ATTLIST parent id ID #REQUIRED>
<!ATTLIST ref cible IDREF #REQUIRED>
```

| Symbole | Signification |
|---------|---------------|
| `+` | 1 ou plusieurs |
| `*` | 0 ou plusieurs |
| `?` | 0 ou 1 |
| `ID` | Identifiant unique |
| `IDREF` | Reference |

### XPath

```
/a/b          enfant direct
//b           descendant (n'importe ou)
@attr         attribut
[cond]        predicat
[1]           premier element
[last()]      dernier element
```

### XQuery FLWOR

```xquery
for $x in doc("f.xml")//elem
let $y := $x/sous
where $x/@attr > valeur
order by $x/critere descending
return <res>{ $x/champ/text() }</res>
```

**Ne pas oublier :** `text()` pour le contenu, `{ }` pour evaluer les expressions.

---

## 6. OLAP

### Schema en etoile

```
                    DIMENSION_1
                       |
DIMENSION_2 --- TABLE_DE_FAITS --- DIMENSION_3
                       |
                    DIMENSION_4

Faits = mesures (montant, quantite)
Dimensions = axes d'analyse (temps, produit, lieu)
```

### ROLLUP vs CUBE

| | ROLLUP(A, B) | CUBE(A, B) |
|---|---|---|
| (A, B) | Oui | Oui |
| (A) | Oui | Oui |
| (B) | **Non** | Oui |
| () total | Oui | Oui |

ROLLUP = hierarchique (n+1 niveaux)
CUBE = toutes combinaisons (2^n niveaux)

---

## 7. NoSQL

### 4 familles

```
Cle-Valeur  : Redis        GET/SET, O(1)
Colonnes    : Cassandra     CQL, partitions
Documents   : MongoDB       JSON, find(), aggregate()
Graphes     : Neo4j         Cypher, MATCH
```

### Theoreme CAP

```
CP : MongoDB, Neo4j    (coherent, peut bloquer)
AP : Cassandra          (disponible, coherence eventuelle)
CA : PostgreSQL         (pas distribue)
```

### Cassandra

```sql
CREATE TABLE t (pk TEXT, ck INT, val TEXT, PRIMARY KEY ((pk), ck));
SELECT * FROM t WHERE pk = 'x' AND ck > 10;
-- TOUJOURS filtrer par partition key
```

### Neo4j (Cypher)

```cypher
MATCH (n:Label {prop: val})-[:REL]->(m)
WHERE n.prop > val
RETURN n.prop, COUNT(m)
```

### MongoDB

```javascript
db.col.find({ champ: { $gt: val } })
db.col.aggregate([
    { $match: { champ: val } },
    { $group: { _id: "$champ", total: { $sum: "$val" } } },
    { $sort: { total: -1 } }
])
```

### ACID vs BASE

```
ACID : Atomicite, Coherence, Isolation, Durabilite    (SQL)
BASE : Basically Available, Soft state, Eventually consistent  (NoSQL)
```

---

## 8. Index et performance

```sql
CREATE INDEX idx ON table(col);        -- B-tree (defaut)
CREATE INDEX idx ON table(col1, col2); -- composite

EXPLAIN QUERY PLAN SELECT ...;
  SCAN = O(n)  mauvais
  SEARCH USING INDEX = O(log n)  bon
```

Regle du prefixe gauche : index (A, B, C) utile pour (A), (A,B), (A,B,C) mais PAS (B) ou (C) seul.

---

## Derniere verification avant le DS

- [ ] Fermeture X+ : algorithme iteratif, montrer chaque etape
- [ ] Cles candidates : attributs jamais a droite = obligatoires
- [ ] Couverture minimale : decomposer -> reduire -> supprimer
- [ ] 3NF synthese : couverture min -> relations par partie gauche -> cle
- [ ] BCNF : tout determinant est super-cle, attention perte de DF
- [ ] SQL : WHERE vs HAVING, IS NULL pas = NULL, NOT IN + NULL
- [ ] Division : double NOT EXISTS
- [ ] DTD : ID/IDREF, +/*/?
- [ ] XQuery : text(), accolades { }, FLWOR
- [ ] OLAP : etoile/flocon, ROLLUP vs CUBE
- [ ] NoSQL : CAP, ACID vs BASE, 4 familles
