---
title: "TP2 - Cassandra"
sidebar_position: 7
---

# TP2 - Cassandra

> D'apres les instructions du sujet : S6/Bases_de_Donnees/data/moodle/tp/tp2_cassandra/sujet.pdf

---

## Section 2 : Modelisation, denormalisation, repartition selon cle, requetes simples

Contexte : une boite de production de courts-metrages veut creer un systeme de gestion des films. Elle emploie des artistes (realisateurs, acteurs). Les courts recoivent des avis de juges.

---

### Exercice 1

### Creer un KEYSPACE, s'y positionner. Comprendre les options de replication.

**Reponse :**
```sql noexec
CREATE KEYSPACE IF NOT EXISTS xyz
WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
};

USE xyz;
```

**Resultat attendu :**
Keyspace cree et selectionne.

**Explication :**
- `SimpleStrategy`: strategie de replication pour un seul datacenter. Chaque partition est repliquee sur les N noeuds suivants dans l'anneau de hachage.
- `replication_factor: 1`: chaque donnee existe sur 1 seul noeud (pas de copie). En production, on utilise typiquement 3.
- Autre strategie: `NetworkTopologyStrategy` pour des deployments multi-datacenter.
- Ref : https://cassandra.apache.org/doc/4.0/cassandra/cql/ddl.html

---

### Exercice 2

### Creer un type de donnees artiste et la table des courts-metrages cm.

**Reponse :**
```sql noexec
CREATE TYPE artiste (nom text, prenom text, date int);

CREATE TABLE cm (
    id_cm int,
    titre text,
    real frozen<artiste>,
    acteurs set<frozen<artiste>>,
    PRIMARY KEY (id_cm)
);
```

Insertions:

```sql noexec
INSERT INTO cm (id_cm, titre, real, acteurs) VALUES
(1, 'Syndrome', {nom: 'Rouge', prenom: 'Zulma', date: 1990},
{{nom: 'Suco', prenom: 'Sarah', date: 1981},
 {nom: 'Platel', prenom: 'Joffrey', date: 1977},
 {nom: 'Ribert', prenom: 'Carine', date: null}});

INSERT INTO cm (id_cm, titre, real, acteurs) VALUES
(2, 'Maman', {nom: 'Cournelle', prenom: 'Cecile', date: 1995},
{{nom: 'Herrera', prenom: 'Camille', date: 1993},
 {nom: 'Slama', prenom: 'Audrey', date: -1}});
```

**Resultat attendu :**
Table cm creee avec 2 courts-metrages.

**Explication :**
- `frozen<artiste>`: obligatoire pour imbriquer un type utilisateur. "Gele" signifie qu'on ne peut pas modifier un seul champ -- on remplace la valeur entiere.
- `set<frozen<artiste>>`: ensemble d'acteurs uniques et tries. Pas de doublons.
- Autres types de collections: `map` (paires cle/valeur triees), `list` (elements tries, doublons possibles, acces par position).
- `PRIMARY KEY (id_cm)`: la partition key est id_cm, donc les donnees sont distribuees par hash(id_cm).

---

### Exercice 3

### Quelques requetes simples

**Reponse :**
```sql noexec
-- Afficher tous les courts-metrages
SELECT * FROM cm;

-- Affichage plus lisible
EXPAND ON;
SELECT * FROM cm;

-- Filtrer par partition key
SELECT * FROM cm WHERE id_cm = 2;

-- Projection sur le titre uniquement
SELECT titre FROM cm;

-- Ajouter un acteur au court 2
UPDATE cm SET acteurs = acteurs + {{nom: 'Gaspar', prenom: 'James', date: 2003}}
WHERE id_cm = 2;

-- Inserer un court sans realisateur ni acteurs
INSERT INTO cm (id_cm, titre, real, acteurs) VALUES
(3, 'titre en attente', null, null);

-- Verifier
SELECT * FROM cm;
```

**Resultat attendu :**

```
@ Row 1
---------+---------------------------------------------------------
 id_cm   | 1
 titre   | Syndrome
 real    | {nom: 'Rouge', prenom: 'Zulma', date: 1990}
 acteurs | {{nom: 'Platel', prenom: 'Joffrey', date: 1977},
         |  {nom: 'Ribert', prenom: 'Carine', date: null},
         |  {nom: 'Suco', prenom: 'Sarah', date: 1981}}
```

**Explication :**
EXPAND ON affiche chaque ligne verticalement pour une meilleure lisibilite. L'operateur `+` sur un set ajoute un element. Les elements du set sont automatiquement tries.

---

### Exercice 4

### Executer SELECT * FROM cm WHERE id_cm = 3, puis re-inserer avec un titre different, puis regarder le contenu. Une insertion a-t-elle vraiment eu lieu ? Detruire l'enregistrement.

**Reponse :**
```sql noexec
SELECT * FROM cm WHERE id_cm = 3;
-- Resultat: id_cm=3, titre='titre en attente', real=null, acteurs=null

INSERT INTO cm (id_cm, titre, real, acteurs) VALUES
(3, 'on a trouve un titre', null, null);

SELECT * FROM cm WHERE id_cm = 3;
-- Resultat: id_cm=3, titre='on a trouve un titre', real=null, acteurs=null

-- Detruire cet enregistrement
DELETE FROM cm WHERE id_cm = 3;
```

**Resultat attendu :**
Le titre est passe de 'titre en attente' a 'on a trouve un titre'. Pas de nouvelle ligne creee.

**Explication :**
En Cassandra, INSERT est un **upsert**: si la cle primaire existe deja, les valeurs sont mises a jour. Il n'y a pas eu de "nouvelle insertion" mais une modification. C'est tres different du SQL ou un INSERT avec une cle dupliquee provoquerait une erreur.

---

### Exercice 5

### Audrey Slama a aussi tourne dans Syndrome. L'ajouter a la table cm. Verifier.

**Reponse :**
```sql noexec
UPDATE cm SET acteurs = acteurs + {{nom: 'Slama', prenom: 'Audrey', date: -1}}
WHERE id_cm = 1;

-- Verification
SELECT acteurs FROM cm WHERE id_cm = 1;
```

**Resultat attendu :**
```
 acteurs
------------------------------------------------------------
 {{nom: 'Platel', prenom: 'Joffrey', date: 1977},
  {nom: 'Ribert', prenom: 'Carine', date: null},
  {nom: 'Slama', prenom: 'Audrey', date: -1},
  {nom: 'Suco', prenom: 'Sarah', date: 1981}}
```

**Explication :**
L'operateur `+` sur un set ajoute l'element s'il n'existe pas deja. Les elements sont automatiquement tries dans le set.

---

### Exercice 6

### Affichez le nom et le prenom du realisateur des courts connus

**Reponse :**
```sql noexec
SELECT titre, real.nom, real.prenom FROM cm;
```

**Resultat attendu :**
```
 titre    | real.nom   | real.prenom
----------+------------+------------
 Syndrome | Rouge      | Zulma
 Maman    | Cournelle  | Cecile
```

**Explication :**
On accede aux champs d'un type imbrique (frozen) via la notation pointee: `real.nom`, `real.prenom`.

---

### Exercice 7

### Executer SELECT * FROM cm WHERE titre='Syndrome'. Cette requete ne fonctionne pas. Lire le message d'erreur. Comprendre et resoudre.

**Reponse :**
```sql noexec
-- Ceci echoue:
SELECT * FROM cm WHERE titre = 'Syndrome';
-- ERREUR: Cannot execute this query as it might involve data filtering
-- and thus may have unpredictable performance.
-- If you want to execute this query despite the performance
-- unpredictability, use ALLOW FILTERING

-- Solution: forcer le filtrage
SELECT * FROM cm WHERE titre = 'Syndrome' ALLOW FILTERING;
```

**Resultat attendu :**
La premiere requete echoue. La seconde retourne le court "Syndrome".

**Explication :**
La partition key de cm est `id_cm`, pas `titre`. Pour retrouver rapidement une information, Cassandra a besoin de savoir dans quel noeud elle est situee (les donnees sont partitionnees par hash de la partition key). Ici, le partitionnement se fait sur id_cm et non sur titre. Cassandra doit donc analyser toutes les partitions pour chercher les donnees desirees. Quand le WHERE s'applique sur la partition key, seule la partition concernee est exploree. `ALLOW FILTERING` force Cassandra a faire le scan complet -- a proscrire en production avec des milliards de lignes.

Avec cette modelisation, Cassandra ne permet pas de savoir quels sont tous les artistes employes, ni dans quels courts un artiste a participe. Il faut creer des tables supplementaires.

---

### Exercice 8

### Creer une table mes_artistes qui contient les noms et prenoms de tous les artistes connus, et une liste des courts auxquels ils ont participe (possiblement zero). La cle primaire est (nom, prenom). Inserer les donnees a partir de la table cm.

**Reponse :**
```sql noexec
CREATE TABLE mes_artistes (
    nom text,
    prenom text,
    courts list<text>,
    PRIMARY KEY (nom, prenom)
);

-- Insertions a partir des donnees visibles dans cm
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Rouge', 'Zulma', ['Syndrome']);
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Suco', 'Sarah', ['Syndrome']);
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Platel', 'Joffrey', ['Syndrome']);
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Ribert', 'Carine', ['Syndrome']);
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Slama', 'Audrey', ['Syndrome', 'Maman']);
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Cournelle', 'Cecile', ['Maman']);
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Herrera', 'Camille', ['Maman']);
INSERT INTO mes_artistes (nom, prenom, courts) VALUES ('Gaspar', 'James', ['Maman']);
```

**Resultat attendu :**
Table mes_artistes creee avec 8 artistes.

**Explication :**
- `PRIMARY KEY (nom, prenom)`: `nom` est la **partition key** et `prenom` est la **clustering key**.
- Tous les artistes avec le meme nom sont sur le meme noeud, tries par prenom.
- On peut faire `WHERE nom = 'Slama'` mais PAS `WHERE prenom = 'Audrey'` (sans ALLOW FILTERING).
- Les donnees sont dupliquees entre cm et mes_artistes -- c'est la norme en Cassandra (denormalisation).
- Cette table est la seule maniere d'employer un artiste n'ayant pas encore tourne de court.

---

### Exercice 9

### Affichez tous les artistes de la table, en basculant le mode de EXPAND de ON a OFF. Conservez celui que vous preferez.

**Reponse :**
```sql noexec
EXPAND OFF;
SELECT * FROM mes_artistes;
```

**Resultat attendu :**
```
 nom       | prenom  | courts
-----------+---------+---------------------------
 Gaspar    | James   | ['Maman']
 Rouge     | Zulma   | ['Syndrome']
 Suco      | Sarah   | ['Syndrome']
 Platel    | Joffrey | ['Syndrome']
 Ribert    | Carine  | ['Syndrome']
 Slama     | Audrey  | ['Syndrome', 'Maman']
 Cournelle | Cecile  | ['Maman']
 Herrera   | Camille | ['Maman']
```

**Explication :**
EXPAND ON affiche une ligne par attribut (vertical), EXPAND OFF affiche en mode tabulaire classique. Choisir selon la lisibilite souhaitee.

---

### Exercice 10

### Ecrivez la requete qui permet de compter le nombre d'artistes employes.

**Reponse :**
```sql noexec
SELECT COUNT(*) FROM mes_artistes;
```

**Resultat attendu :**
```
 count
-------
     8
```

**Explication :**
COUNT(*) retourne le nombre total de lignes dans la table. En Cassandra, cette operation peut etre couteuse sur de tres grandes tables car elle necessite un scan de toutes les partitions.

---

### Exercice 11

### Le titre du court Syndrome change et devient Le syndrome. Faites les mises a jour.

**Reponse :**
```sql noexec
-- Mise a jour dans la table cm
UPDATE cm SET titre = 'Le syndrome' WHERE id_cm = 1;

-- Mise a jour dans la table mes_artistes pour CHAQUE artiste concerne
UPDATE mes_artistes SET courts = ['Le syndrome'] WHERE nom = 'Rouge' AND prenom = 'Zulma';
UPDATE mes_artistes SET courts = ['Le syndrome'] WHERE nom = 'Suco' AND prenom = 'Sarah';
UPDATE mes_artistes SET courts = ['Le syndrome'] WHERE nom = 'Platel' AND prenom = 'Joffrey';
UPDATE mes_artistes SET courts = ['Le syndrome'] WHERE nom = 'Ribert' AND prenom = 'Carine';
UPDATE mes_artistes SET courts = ['Le syndrome', 'Maman'] WHERE nom = 'Slama' AND prenom = 'Audrey';
```

**Resultat attendu :**
Le titre est mis a jour dans toutes les tables.

**Explication :**
L'absence de jointures et la redondance des donnees rendent les mises a jour laborieuses. On doit mettre a jour CHAQUE table contenant la donnee modifiee. C'est le prix de la denormalisation. En relationnel, un seul UPDATE sur une table centralisee suffirait.

---

### Exercice 12

### Ecrivez la requete permettant de savoir quels sont les courts auxquels a participe l'artiste dont le nom est Slama (en utilisant que son nom), une autre pour l'artiste dont le prenom est Joffrey, et une troisieme pour l'artiste connu par James Gaspar. Pourquoi seul le nom suffit ? Pourquoi le prenom ne convient pas ?

**Reponse :**
```sql noexec
-- Par nom (partition key) : fonctionne directement
SELECT * FROM mes_artistes WHERE nom = 'Slama';
```

```
 nom   | prenom | courts
-------+--------+------------------------------
 Slama | Audrey | ['Le syndrome', 'Maman']
```

```sql noexec
-- Par prenom seul (clustering key) : REFUSE sans ALLOW FILTERING
SELECT * FROM mes_artistes WHERE prenom = 'Joffrey';
-- ERREUR: Cannot execute this query without ALLOW FILTERING

SELECT * FROM mes_artistes WHERE prenom = 'Joffrey' ALLOW FILTERING;
```

```
 nom    | prenom  | courts
--------+---------+----------------
 Platel | Joffrey | ['Le syndrome']
```

```sql noexec
-- Par nom ET prenom (partition + clustering key) : fonctionne directement
SELECT * FROM mes_artistes WHERE nom = 'Gaspar' AND prenom = 'James';
```

```
 nom    | prenom | courts
--------+--------+----------
 Gaspar | James  | ['Maman']
```

**Resultat attendu :**
Seul le nom suffit car c'est la partition key. Le prenom seul necessite ALLOW FILTERING.

**Explication :**
- `nom` est la **partition key**: Cassandra sait directement sur quel noeud chercher. Requete efficace.
- `prenom` est la **clustering key**: utilisable SEULEMENT en complement de la partition key. Seul, il necessite un scan complet de toutes les partitions.
- La regle: on DOIT fournir la partition key pour que la requete soit efficace. La clustering key est un filtre supplementaire optionnel au sein de la partition.

---

### Exercice 13

### Modifiez la table mes_artistes pour ajouter une colonne genre de type texte.

**Reponse :**
```sql noexec
ALTER TABLE mes_artistes ADD genre text;
```

**Resultat attendu :**
Colonne genre ajoutee. Les lignes existantes auront null pour cette colonne.

**Explication :**
ALTER TABLE ADD permet d'ajouter une colonne a une table existante. Ref : https://cassandra.apache.org/doc/stable/cassandra/cql/ddl.html#alter-table-statement

---

### Exercice 14

### Visualisez tout ce que contient cette table puis remplissez la colonne genre pour les artistes de votre choix.

**Reponse :**
```sql noexec
SELECT * FROM mes_artistes;

UPDATE mes_artistes SET genre = 'drame' WHERE nom = 'Rouge' AND prenom = 'Zulma';
UPDATE mes_artistes SET genre = 'comedie' WHERE nom = 'Gaspar' AND prenom = 'James';

SELECT * FROM mes_artistes;
```

**Resultat attendu :**
```
 nom    | prenom | courts           | genre
--------+--------+------------------+---------
 Rouge  | Zulma  | ['Le syndrome']  | drame
 Gaspar | James  | ['Maman']        | comedie
 Suco   | Sarah  | ['Le syndrome']  | null
 ...
```

**Explication :**
Les artistes non mis a jour ont null pour genre. En Cassandra, les colonnes non-cle n'ont pas de contrainte NOT NULL.

---

### Exercice 15

### Modeliser les avis sur les courts-metrages. Les avis sont ecrits par des juges identifies par leur pseudo. Un juge donne au plus un avis par court. La boite veut savoir efficacement (sans ALLOW FILTERING) : (1) les avis d'un court specifique par id_cm, (2) les avis d'un juge par pseudo. Creer les tables et inserer les donnees du tableau fourni.

**Reponse :**
```sql noexec
-- Table 1: avis par court (partition key = id_cm)
CREATE TABLE avis_par_court (
    id_cm int,
    pseudo text,
    avis text,
    PRIMARY KEY (id_cm, pseudo)
);

-- Table 2: avis par juge (partition key = pseudo)
CREATE TABLE avis_par_juge (
    pseudo text,
    id_cm int,
    avis text,
    PRIMARY KEY (pseudo, id_cm)
);

-- Insertions dans avis_par_court
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (2, 'p-ABCD', 'Rate');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (2, 'p-MNOP', 'Difficile');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (2, 'p-YZ', 'superbe');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (1, 'p-ABCD', 'Magnifique film');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (1, 'p-EFGH', 'un film superbe');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (1, 'p-IJKL', 'un court tres bien realise');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (1, 'p-MNOP', 'Court incomprehensible');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (1, 'p-QRST', 'une realisation superbe');
INSERT INTO avis_par_court (id_cm, pseudo, avis) VALUES (1, 'p-UVWX', 'nul');

-- Memes donnees dans avis_par_juge
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-ABCD', 2, 'Rate');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-MNOP', 2, 'Difficile');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-YZ', 2, 'superbe');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-ABCD', 1, 'Magnifique film');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-EFGH', 1, 'un film superbe');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-IJKL', 1, 'un court tres bien realise');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-MNOP', 1, 'Court incomprehensible');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-QRST', 1, 'une realisation superbe');
INSERT INTO avis_par_juge (pseudo, id_cm, avis) VALUES ('p-UVWX', 1, 'nul');
```

**Resultat attendu :**
Deux tables creees et peuplees avec les 9 avis.

**Explication :**
C'est le principe fondamental de la modelisation Cassandra : **une table par type de requete**.
- `avis_par_court`: partition key = `id_cm`. Tous les avis d'un court sont sur le meme noeud. `WHERE id_cm = 1` est efficace.
- `avis_par_juge`: partition key = `pseudo`. Tous les avis d'un juge sont sur le meme noeud. `WHERE pseudo = 'p-ABCD'` est efficace.
- Les MEMES donnees sont dupliquees dans les deux tables. C'est normal et encourage en Cassandra.

---

### Exercice 16

### Affichez tous les avis pour le court 1. Remarquez les couleurs sur les noms des attributs.

**Reponse :**
```sql noexec
SELECT * FROM avis_par_court WHERE id_cm = 1;
```

**Resultat attendu :**
```
 id_cm | pseudo | avis
-------+--------+------------------------------
     1 | p-ABCD | Magnifique film
     1 | p-EFGH | un film superbe
     1 | p-IJKL | un court tres bien realise
     1 | p-MNOP | Court incomprehensible
     1 | p-QRST | une realisation superbe
     1 | p-UVWX | nul
```

**Explication :**
Couleurs dans la console CQL:
- **Rouge**: `id_cm` -- cle de partitionnement et cle primaire
- **Vert**: `pseudo` -- reste de la cle primaire (clustering key)
- **Violet**: `avis` -- attribut classique

---

### Exercice 17

### Affichez tous les avis ecrits par 'p-ABCD' ou 'p-QRST'

**Reponse :**
```sql noexec
SELECT * FROM avis_par_juge WHERE pseudo IN ('p-ABCD', 'p-QRST');
```

**Resultat attendu :**
```
 pseudo | id_cm | avis
--------+-------+--------------------------
 p-ABCD |     1 | Magnifique film
 p-ABCD |     2 | Rate
 p-QRST |     1 | une realisation superbe
```

**Explication :**
On utilise `avis_par_juge` (pas `avis_par_court`) car la partition key est `pseudo`. L'operateur IN permet de chercher dans plusieurs partitions a la fois.

---

### Exercice 18

### Comptez le nombre d'avis ecrits pour chaque court puis le nombre d'avis ecrits par chaque juge.

**Reponse :**
```sql noexec
-- Nombre d'avis par court
SELECT id_cm, COUNT(*) AS nb_avis FROM avis_par_court GROUP BY id_cm;
```

```
 id_cm | nb_avis
-------+---------
     1 |       6
     2 |       3
```

```sql noexec
-- Nombre d'avis par juge
SELECT pseudo, COUNT(*) AS nb_avis FROM avis_par_juge GROUP BY pseudo;
```

```
 pseudo | nb_avis
--------+---------
 p-ABCD |       2
 p-EFGH |       1
 p-IJKL |       1
 p-MNOP |       1
 p-QRST |       1
 p-UVWX |       1
 p-YZ   |       1
```

**Explication :**
En Cassandra, GROUP BY ne fonctionne que sur la partition key ou sur la partition key + une partie de la clustering key. Ici ca fonctionne car on groupe par la partition key de chaque table respective.
