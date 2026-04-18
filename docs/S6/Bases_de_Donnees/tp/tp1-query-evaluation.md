---
title: "TP : Evaluation de Requetes"
sidebar_position: 1
---

# TP : Evaluation de Requetes

**Cours** : Bases de Donnees  
**Etablissement** : INSA Rennes, 3e annee informatique  
**Annee universitaire** : 2017-2018

## Presentation

Ce TP explore la performance des requetes SQL, les strategies d'indexation et l'optimisation des requetes avec SQLite. Les etudiants apprennent a :
- Mesurer le temps d'execution des requetes
- Analyser les plans d'execution avec EXPLAIN QUERY PLAN
- Comprendre l'impact des index sur la performance
- Comparer differentes formulations de requetes SQL pour un meme probleme
- Optimiser les requetes avec des strategies d'indexation appropriees

## Objectifs pedagogiques

1. **Prise en main de SQLite** : maitriser les commandes essentielles de SQLite
2. **Mesure de performance** : utiliser `.timer ON` pour mesurer le temps d'execution
3. **Indexation** : comprendre les index B+ tree et leur impact sur la performance
4. **Plans d'execution** : analyser les strategies d'execution avec EXPLAIN QUERY PLAN
5. **Optimisation** : comparer les formulations de requetes et optimiser avec des index

## Structure du TP

### Partie 1 : Prise en main de SQLite (7.1)

**Fichiers** : `src/01_basic_queries.sql`, `src/02_create_tables.sql`

**Concepts cles** :
- Interface en ligne de commande SQLite
- Creation de tables pour etudiants, professeurs, cours et inscriptions
- Requetes SELECT de base avec WHERE et LIKE
- Produits cartesiens et jointures

**Schema de la base** :
```sql noexec
etudiant(etudId, nom, prenom)              -- Etudiants
professeur(profId, nom, prenom)            -- Professeurs
enseignement(ensId, sujet)                 -- Cours
enseignementSuivi(ensId, etudId, profId)   -- Relations etudiant-cours-professeur
```

**Exemples de requetes** :
- Lister tous les etudiants
- Trouver les professeurs dont le nom contient 'a'
- Produit cartesien etudiants-professeurs

### Partie 2 : Base de donnees volumineuse et indexation (7.2.2)

**Fichiers** : `src/03_index_analysis.sql`, `src/DBgenerator.java`

**Concepts cles** :
- Generation de bases de test volumineuses (1M+ lignes)
- Mesure de performance avec et sans index
- Comprehension de la structure d'index B+ tree
- Analyse des plans d'execution : SCAN vs SEARCH

**Resultats de performance** (1 million de lignes) :

| Type de requete | Sans index | Avec index | Acceleration |
|-----------------|-----------|------------|-------------|
| Valeur existante (=) | 0.1-0.2s | 0.0001s | 1000x |
| Valeur inexistante (=) | 0.05-0.08s | 0.0001s | 800x |
| Requete d'intervalle (>) | 5-7s | 0.0004s | 15000x |

**Changement du plan d'execution** :
```
Avant : SCAN TABLE demo                    (O(n) - parcours lineaire)
Apres : SEARCH TABLE demo USING INDEX      (O(log n) - recherche arborescente)
```

**Point cle** : les index transforment les parcours complets de table en recherches arborescentes efficaces, avec un gain de performance de 800 a 15000x.

### Partie 3 : Optimisation de requetes (7.2.3)

**Fichiers** : `src/04_query_optimization.sql`, `src/DBgenerator1.java`

**Concepts cles** :
- Comparaison de differentes formulations SQL pour un meme probleme
- Comprehension de la complexite des requetes (O(n), O(n*m), O(n+m))
- Sous-requetes vs jointures
- Index composites
- Surcout du NATURAL JOIN

**Probleme** : trouver les clients ayant des factures > 999 euros

**Base de donnees** :
- `facture(factureId, customerId, amount)` - 1M+ factures
- `customer(customerId, name)` - 1M+ clients

**Comparaison des requetes** :

| Requete | Strategie | Temps (sans index) | Temps (avec index) | Complexite |
|---------|----------|-------------------|-------------------|------------|
| 1. JOIN + WHERE | Jointure puis filtrage | 200s | 3s | O(n*m) |
| 2. Sous-requete + IN | Filtrage puis recherche | 0.996s | 0.787s | O(n+m) |
| 3. NATURAL JOIN | Jointure implicite | 283s | 4.5s | O(n*m) + surcout |
| 4. Sous-requete avec JOIN | Imbrication complexe | 219s | 5.3s | O(n*m) |

**Gagnante** : la requete 2 (sous-requete avec IN) -- 200x plus rapide que les autres approches !

**Pourquoi la requete 2 gagne** :
1. La sous-requete s'execute une seule fois et retourne l'ensemble des customerId
2. La requete principale fait un simple test d'appartenance (operateur IN)
3. Complexite lineaire O(n+m) au lieu de quadratique O(n*m)
4. Meme sans index, cette approche est optimale

**Strategie d'optimisation** :
```sql noexec
CREATE INDEX IamSpeeed ON facture(customerId, amount);
```
- L'index composite supporte a la fois le JOIN (customerId) et le filtrage (amount)
- Ameliore les requetes JOIN de 67x, mais la requete 2 etait deja optimale

## Fichiers

### Scripts SQL
- `01_basic_queries.sql` -- Requetes SELECT, WHERE, LIKE de base
- `02_create_tables.sql` -- Creation du schema de la base
- `03_index_analysis.sql` -- Demonstration de performance des index
- `04_query_optimization.sql` -- Comparaison et optimisation de requetes

### Generateurs Java
- `DBgenerator.java` -- Genere une table demo avec des codes entiers aleatoires
- `DBgenerator1.java` -- Genere des tables client/facture avec des donnees realistes

### Fichiers de donnees
- `etudiants.txt` -- Liste des etudiants (73 etudiants, format : E1,NOM,Prenom)
- `profs.txt` -- Liste des professeurs (25 professeurs, format : P1,NOM,Prenom)

## Points a retenir

### 1. Les index sont essentiels
- Sans index : parcours complet O(n)
- Avec index : recherche arborescente O(log n)
- Gain de performance : 800 a 15000x sur de grands jeux de donnees

### 2. La formulation de la requete compte
- Les sous-requetes avec IN peuvent etre plus efficaces que les JOIN
- Filtrer avant de joindre reduit la complexite
- Eviter le NATURAL JOIN a cause du surcout de resolution des noms de colonnes

### 3. EXPLAIN QUERY PLAN est votre allie
- Revele les strategies SCAN vs SEARCH
- Montre l'utilisation des index
- Aide a identifier les pistes d'optimisation

### 4. Index composites
- Peuvent optimiser plusieurs conditions simultanement
- Format : `CREATE INDEX nom ON table(col1, col2)`
- Utiles pour les JOIN avec des conditions WHERE supplementaires

### 5. Transactions pour les insertions en masse
- Encadrer les INSERT multiples avec BEGIN/COMMIT
- Beaucoup plus rapide que des commits individuels
- Indispensable pour generer de grandes bases de test

## Execution du TP

### Generer les bases de test


```bash
# Compiler les generateurs
javac DBgenerator.java DBgenerator1.java

# Generer une table demo avec 1 million de lignes
java DBgenerator 1000000

# Generer 1 million de paires client-facture
java DBgenerator1 1000000

# Importer dans SQLite
sqlite3 test.db < database.sql
sqlite3 test1.db < database1.sql
```

### Executer les requetes avec chronometrage
```bash
sqlite3 test.db
.timer ON
.read src/03_index_analysis.sql
```

### Analyser les plans d'execution
```bash
sqlite3 test1.db
EXPLAIN QUERY PLAN SELECT ... ;
```

## Reference des commandes SQLite

| Commande | Description |
|----------|-------------|
| `.echo ON\|OFF` | Afficher les commandes executees |
| `.exit` | Quitter SQLite |
| `.help` | Afficher toutes les commandes disponibles |
| `.import fichier table` | Importer des donnees CSV dans une table |
| `.mode csv\|column\|etc` | Definir le format de sortie |
| `.output fichier` | Rediriger la sortie vers un fichier |
| `.open base` | Ouvrir ou creer une base de donnees |
| `.print texte` | Afficher du texte a l'ecran |
| `.read fichier` | Executer du SQL depuis un fichier |
| `.stats ON\|OFF` | Afficher les statistiques memoire |
| `.tables` | Lister toutes les tables |
| `.tables %motif%` | Lister les tables correspondant au motif |
| `.timer ON\|OFF` | Chronometrer l'execution des requetes |
| `.schema table` | Afficher la structure d'une table |
| `.index` | Lister tous les index |

## Commandes PRAGMA

```sql noexec
PRAGMA page_size;              -- Afficher la taille de page/bloc (defaut : 4096 octets)
PRAGMA automatic_index = 0;    -- Desactiver la creation automatique d'index
PRAGMA journal_mode = OFF;     -- Desactiver la journalisation (plus rapide, moins fiable)
PRAGMA synchronous = OFF;      -- Desactiver les ecritures synchrones (plus rapide, moins fiable)
```

## Conseils de performance

1. **Toujours encadrer les insertions en masse dans une transaction**
   ```sql noexec
   BEGIN TRANSACTION;
   -- Instructions INSERT multiples
   COMMIT;
   ```

2. **Creer des index sur les colonnes frequemment interrogees**
   - Colonnes utilisees dans les JOIN
   - Colonnes presentes dans la clause WHERE
   - Colonnes utilisees dans ORDER BY

3. **Utiliser EXPLAIN QUERY PLAN pour verifier l'utilisation des index**
   - Chercher "SEARCH" au lieu de "SCAN"
   - Chercher "USING INDEX" dans le plan

4. **Preferer les sous-requetes avec IN pour filtrer avant de joindre**
   - Reduit la complexite de O(n*m) a O(n+m)
   - Particulierement efficace quand le filtrage reduit significativement le jeu de resultats

5. **Eviter le NATURAL JOIN**
   - Surcout lie a la resolution des noms de colonnes
   - Moins explicite, plus difficile a optimiser
   - Utiliser plutot un JOIN ... ON explicite

## Pour aller plus loin

- [Planificateur de requetes SQLite](https://www.sqlite.org/queryplanner.html)
- [Index SQLite](https://www.sqlite.org/lang_createindex.html)
- [EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html)
- [Optimisation des performances SQLite](https://www.sqlite.org/speed.html)

## Resume des resultats

Question 5(a) : tous les etudiants listes  
Question 5(b) : professeurs avec 'a' dans le nom (ex. : ARNALDI, GARCIA, MARCHAL)  
Question 5(c) : 73 etudiants x 25 professeurs = 1 825 combinaisons  
Question 6 : taille de page = 4096 octets  

Analyse des index :
- Creation d'index : `CREATE INDEX demoIDX ON demo(code);`
- Gain de performance : 800 a 15000x plus rapide avec index
- Plan d'execution : passage de SCAN a SEARCH USING INDEX

Optimisation des requetes :
- Meilleure requete : sous-requete avec IN (0.996s)
- Pire requete : NATURAL JOIN (283s)
- Optimisation par index : index composite sur (customerId, amount)
- Performance finale : la requete 2 reste la plus rapide a 0.787s
