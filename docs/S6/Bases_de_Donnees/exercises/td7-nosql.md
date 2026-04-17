---
title: "TD7 -- NoSQL"
sidebar_position: 6
---

# TD7 -- NoSQL

> Source : TD7.pdf
> Cassandra, Neo4j, MongoDB, theoreme CAP, comparaison avec SQL.

---

## Exercice 1 : Theoreme CAP

### Q1 : Expliquer le theoreme CAP

Dans un systeme distribue, on ne peut pas garantir simultanement :
- **C** (Consistency) : tous les noeuds voient les memes donnees.
- **A** (Availability) : chaque requete obtient une reponse.
- **P** (Partition tolerance) : le systeme fonctionne malgre une coupure reseau.

En cas de partition reseau (P est impose), on doit choisir entre C et A.

### Q2 : Classifier les systemes

| Systeme | Choix CAP | Justification |
|---------|-----------|---------------|
| PostgreSQL | CA | Un seul serveur, pas de partition |
| Cassandra | AP | Disponible meme avec incoherences temporaires |
| MongoDB | CP | Coherent mais peut refuser les ecritures lors d'une election |
| Neo4j | CP | Coherence forte, replicas en lecture |

### Q3 : ACID vs BASE

| ACID | BASE |
|------|------|
| Atomicity | Basically Available |
| Consistency | Soft state |
| Isolation | Eventually consistent |
| Durability | -- |

ACID : coherence forte, tout ou rien. Pour les donnees critiques (banque).
BASE : coherence eventuelle, priorite a la disponibilite. Pour les donnees massives.

---

## Exercice 2 : Cassandra (CQL)

### Schema pour un systeme de logs web

```sql
CREATE KEYSPACE monitoring
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3};

USE monitoring;

CREATE TABLE web_logs (
    site TEXT,
    date_log DATE,
    heure TIMESTAMP,
    url TEXT,
    code_reponse INT,
    temps_reponse DOUBLE,
    PRIMARY KEY ((site, date_log), heure)
);
-- Partition key : (site, date_log) -> les logs d'un site pour un jour sont sur le meme noeud
-- Clustering key : heure -> tries chronologiquement dans la partition
```

### Requetes autorisees

```sql
-- OK : filtre sur la partition key complete
SELECT * FROM web_logs WHERE site = 'insa.fr' AND date_log = '2024-03-15';

-- OK : partition key + clustering key
SELECT * FROM web_logs
WHERE site = 'insa.fr' AND date_log = '2024-03-15'
AND heure > '2024-03-15 08:00:00';

-- INTERDIT : pas de partition key
-- SELECT * FROM web_logs WHERE code_reponse = 500;
-- => Error: filtering requires ALLOW FILTERING (deconseille en production)
```

### Modelisation par les requetes

| Requete prevue | Table dediee | Partition key | Clustering key |
|---|---|---|---|
| Logs d'un site par jour | web_logs | (site, date_log) | heure |
| Erreurs 500 par site | erreurs_par_site | (site, code_reponse) | heure |
| Temps de reponse moyen par URL | perf_par_url | (url) | date_log |

**Regle fondamentale :** en Cassandra, on cree une table par requete. La denormalisation et la duplication sont la norme.

---

## Exercice 3 : Neo4j (Cypher)

### Schema : reseau social universitaire

```cypher
// Creation des noeuds
CREATE (alice:Etudiant {nom: "Alice", age: 22, filiere: "Info"})
CREATE (bob:Etudiant {nom: "Bob", age: 23, filiere: "Info"})
CREATE (charlie:Etudiant {nom: "Charlie", age: 21, filiere: "Maths"})
CREATE (bd:Cours {nom: "Bases de Donnees", credits: 4})
CREATE (algo:Cours {nom: "Algorithmique", credits: 3})
CREATE (dupont:Prof {nom: "Dupont", departement: "Info"})

// Creation des relations
CREATE (alice)-[:INSCRIT_A {note: 15}]->(bd)
CREATE (bob)-[:INSCRIT_A {note: 12}]->(bd)
CREATE (charlie)-[:INSCRIT_A {note: 18}]->(bd)
CREATE (alice)-[:INSCRIT_A {note: 14}]->(algo)
CREATE (dupont)-[:ENSEIGNE]->(bd)
CREATE (alice)-[:AMI_DE]->(bob)
CREATE (bob)-[:AMI_DE]->(charlie)
```

### Requetes

```cypher
// Q1 : Etudiants inscrits en BD
MATCH (e:Etudiant)-[:INSCRIT_A]->(c:Cours {nom: "Bases de Donnees"})
RETURN e.nom, e.filiere

// Q2 : Amis d'Alice
MATCH (alice:Etudiant {nom: "Alice"})-[:AMI_DE]-(ami:Etudiant)
RETURN ami.nom
// Note : pas de fleche -> pour chercher dans les deux sens

// Q3 : Amis des amis d'Alice (profondeur 2)
MATCH (alice:Etudiant {nom: "Alice"})-[:AMI_DE*2]-(fof:Etudiant)
WHERE fof <> alice
RETURN DISTINCT fof.nom

// Q4 : Moyenne des notes par cours
MATCH (e:Etudiant)-[i:INSCRIT_A]->(c:Cours)
RETURN c.nom, AVG(i.note) AS moyenne, COUNT(e) AS nb_inscrits
ORDER BY moyenne DESC

// Q5 : Chemin le plus court entre Alice et Charlie
MATCH p = shortestPath(
    (a:Etudiant {nom: "Alice"})-[*]-(b:Etudiant {nom: "Charlie"})
)
RETURN p, length(p)

// Q6 : Recommandation : cours suivis par les amis d'Alice mais pas par Alice
MATCH (alice:Etudiant {nom: "Alice"})-[:AMI_DE]-(ami)-[:INSCRIT_A]->(c:Cours)
WHERE NOT (alice)-[:INSCRIT_A]->(c)
RETURN DISTINCT c.nom
```

---

## Exercice 4 : MongoDB

### Collection etudiants

```javascript
// Inserer des documents
db.etudiants.insertMany([
    {
        nom: "Alice Dupont", age: 22,
        cours: ["BD", "Algo", "Reseaux"],
        adresse: { ville: "Rennes", cp: "35000" },
        notes: { BD: 15, Algo: 14, Reseaux: 16 }
    },
    {
        nom: "Bob Martin", age: 23,
        cours: ["BD", "Systemes"],
        adresse: { ville: "Rennes", cp: "35000" },
        notes: { BD: 12, Systemes: 14 }
    },
    {
        nom: "Charlie Petit", age: 21,
        cours: ["BD", "Maths"],
        adresse: { ville: "Paris", cp: "75005" },
        notes: { BD: 18, Maths: 16 },
        stage: { entreprise: "Google", duree: "6 mois" }
    }
])
```

### Requetes de base

```javascript
// Q1 : Etudiants de plus de 21 ans
db.etudiants.find({ age: { $gt: 21 } })

// Q2 : Etudiants de Rennes
db.etudiants.find({ "adresse.ville": "Rennes" })

// Q3 : Etudiants inscrits en BD
db.etudiants.find({ cours: "BD" })

// Q4 : Nom et age seulement (projection)
db.etudiants.find({}, { nom: 1, age: 1, _id: 0 })

// Q5 : Etudiants avec un stage
db.etudiants.find({ stage: { $exists: true } })

// Q6 : Etudiants de Rennes OU de plus de 22 ans
db.etudiants.find({
    $or: [
        { "adresse.ville": "Rennes" },
        { age: { $gt: 22 } }
    ]
})
```

### Pipeline d'agregation

```javascript
// Q7 : Nombre d'etudiants par ville
db.etudiants.aggregate([
    { $group: {
        _id: "$adresse.ville",
        nb: { $sum: 1 },
        age_moyen: { $avg: "$age" }
    }},
    { $sort: { nb: -1 } }
])

// Q8 : Note moyenne en BD
db.etudiants.aggregate([
    { $match: { "notes.BD": { $exists: true } } },
    { $group: {
        _id: null,
        moyenne_BD: { $avg: "$notes.BD" },
        nb: { $sum: 1 }
    }}
])

// Q9 : Etudiants avec plus de 2 cours
db.etudiants.aggregate([
    { $project: { nom: 1, nb_cours: { $size: "$cours" } } },
    { $match: { nb_cours: { $gt: 2 } } }
])
```

---

## Exercice 5 : SQL vs NoSQL -- quand utiliser quoi ?

| Scenario | Choix | Justification |
|----------|-------|---------------|
| Application bancaire avec virements | **SQL (PostgreSQL)** | Transactions ACID indispensables |
| Logs de serveurs web (millions/jour) | **Cassandra** | Ecriture massive, scalable, series temporelles |
| Reseau social (amis, recommandations) | **Neo4j** | Traversees de graphe performantes |
| Catalogue produits e-commerce | **MongoDB** | Documents flexibles, produits heterogenes |
| Reporting RH (salaires, departements) | **SQL (PostgreSQL)** | Donnees structurees, jointures |
| Cache de sessions utilisateurs | **Redis** | Acces O(1) par cle, volatil |

---

## Points cles a retenir

- CAP : on choisit 2 sur 3 en cas de partition reseau.
- Cassandra : modeliser PAR les requetes, partition key obligatoire dans WHERE.
- Neo4j : Cypher utilise de l'art ASCII `(n)-[:REL]->(m)`.
- MongoDB : documents JSON flexibles, pipeline d'agregation pour GROUP BY.
- Le choix SQL vs NoSQL depend du cas d'usage, pas de la tendance.
