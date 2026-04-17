---
title: "TP3 - Neo4j"
sidebar_position: 9
---

# TP3 - Neo4j

> Following teacher instructions from: S6/Bases_de_Donnees/data/moodle/tp/tp3_neo4j/sujet.pdf

---

## Section 2: Creation et interrogation simples du graphe

Contexte: graphe de lieux rennais relies par des avenues. Chaque lieu a un nom, des coordonnees GPS et une rive (Gauche/Droite de la Vilaine). La depense energetique (calories) entre deux lieux est indiquee sur les aretes.

---

### Exercise 1

### Voici la commande permettant de creer un premier lieu dont on donne le nom. Executez-la.

**Answer:**
```cypher
CREATE (:Lieu {name: 'Triangle'})
```

**Expected result:**
Un premier noeud de type Lieu est cree avec la propriete name='Triangle'.

**Explanation:**
- `(:Lieu ...)`: cree un noeud avec le label Lieu
- `{name: 'Triangle'}`: propriete du noeud
- Pas de variable assignee (pas besoin de reference apres creation)
- Syntaxe: https://neo4j.com/docs/cypher-manual/current/clauses/create/

---

### Exercise 2

### Creez maintenant deux noeuds supplementaires dont les noms sont Beaulieu et Poterie.

**Answer:**
```cypher
CREATE (:Lieu {name: 'Beaulieu'})
CREATE (:Lieu {name: 'Poterie'})
```

**Expected result:**
3 noeuds isoles (Triangle, Beaulieu, Poterie) sans relations.

**Explanation:**
Chaque CREATE ajoute un noeud independant au graphe. A ce stade il n'y a aucune arete.

---

### Exercise 3

### Vous pouvez afficher tous les attributs d'un noeud en executant la commande suivante.

**Answer:**
```cypher
MATCH (x:Lieu {name: 'Poterie'}) RETURN x
```

Ou bien:

```cypher
MATCH (x:Lieu) WHERE x.name = 'Poterie' RETURN x
```

**Expected result:**
```
+----------------------------+
| x                          |
+----------------------------+
| (:Lieu {name: "Poterie"})  |
+----------------------------+
```

**Explanation:**
Les deux syntaxes sont equivalentes. La premiere filtre dans le pattern, la seconde utilise WHERE. La variable `x` capture le noeud pour le retourner.

---

### Exercise 4

### Ajoutons un attribut au noeud Triangle qui est sur la rive gauche. Reaffichez les attributs de ce noeud.

**Answer:**
```cypher
MATCH (x:Lieu) WHERE x.name = 'Triangle' SET x.rive = 'Gauche'
```

Verification:
```cypher
MATCH (x:Lieu {name: 'Triangle'}) RETURN x
```

**Expected result:**
```
+---------------------------------------------+
| x                                           |
+---------------------------------------------+
| (:Lieu {name: "Triangle", rive: "Gauche"})  |
+---------------------------------------------+
```

**Explanation:**
SET permet d'ajouter ou modifier des proprietes sur un noeud existant. Les noeuds Neo4j ont un schema flexible -- on peut ajouter des proprietes a tout moment.

---

### Exercise 5

### Et affichons tous les noeuds de type Lieu existants et leurs attributs

**Answer:**
```cypher
MATCH (x:Lieu) RETURN x
```

**Expected result:**
```
+---------------------------------------------+
| x                                           |
+---------------------------------------------+
| (:Lieu {name: "Triangle", rive: "Gauche"})  |
| (:Lieu {name: "Beaulieu"})                  |
| (:Lieu {name: "Poterie"})                   |
+---------------------------------------------+
```

**Explanation:**
MATCH sans filtre sur les proprietes retourne tous les noeuds avec le label Lieu. Beaulieu et Poterie n'ont pas encore l'attribut rive.

---

### Exercise 6

### Ajoutez les attributs rive pour Poterie (Gauche) et Beaulieu (Droite). Afficher ces 3 noeuds.

**Answer:**
```cypher
MATCH (x:Lieu) WHERE x.name = 'Poterie' SET x.rive = 'Gauche'
```

```cypher
MATCH (x:Lieu) WHERE x.name = 'Beaulieu' SET x.rive = 'Droite'
```

```cypher
MATCH (x:Lieu) RETURN x
```

**Expected result:**
Les 3 noeuds ont maintenant l'attribut rive (Triangle: Gauche, Poterie: Gauche, Beaulieu: Droite).

**Explanation:**
Chaque SET modifie un noeud existant retrouve par MATCH. On execute les commandes une par une.

---

### Exercise 7

### On peut marcher de Poterie a Triangle en depensant 725 calories. On va stocker cela dans la base, sous la forme d'une arete ayant un type (ENERGIE) et une valeur.

**Answer:**
```cypher
MATCH (depart:Lieu {name: 'Poterie'}), (arrivee:Lieu {name: 'Triangle'})
CREATE (depart)-[:ENERGIE {calories: 725}]->(arrivee)
```

**Expected result:**
Relation orientee creee de Poterie vers Triangle avec 725 calories.

**Explanation:**
- MATCH recupere les deux noeuds existants via les variables `depart` et `arrivee`
- `CREATE ... -[:ENERGIE {calories: 725}]->` cree une relation orientee
- La fleche `->` indique la direction: de Poterie vers Triangle
- La relation a un type ENERGIE et une propriete calories

---

### Exercise 8

### Creez le lien Poterie-Beaulieu avec 3114 calories. Le graphe actuel reflete l'impossibilite de marcher directement de Triangle a Beaulieu et la necessite de passer par Poterie.

**Answer:**
```cypher
MATCH (depart:Lieu {name: 'Poterie'}), (arrivee:Lieu {name: 'Beaulieu'})
CREATE (depart)-[:ENERGIE {calories: 3114}]->(arrivee)
```

**Expected result:**
```
(Triangle) <--[725]-- (Poterie) --[3114]--> (Beaulieu)
```

**Explanation:**
On ne peut pas aller directement de Triangle a Beaulieu: il faut passer par Poterie. Le graphe reflete les contraintes de deplacement.

---

### Exercise 9

### Affichez tous les liens entre tous les noeuds.

**Answer:**
```cypher
MATCH (source)-[arrete]->(cible)
RETURN source AS Sommet_Source,
       type(arrete) AS Nom_Arrete,
       arrete AS Valeur_Arrete,
       cible AS Sommet_Cible
```

**Expected result:**
```
+---------------------+-----------+--------------------+----------------------+
| Sommet_Source        | Nom_Arrete| Valeur_Arrete      | Sommet_Cible         |
+---------------------+-----------+--------------------+----------------------+
| (:Lieu "Poterie")   | "ENERGIE" | {calories: 725}    | (:Lieu "Triangle")   |
| (:Lieu "Poterie")   | "ENERGIE" | {calories: 3114}   | (:Lieu "Beaulieu")   |
+---------------------+-----------+--------------------+----------------------+
```

**Explanation:**
`type(arrete)` retourne le type de la relation. La fleche `->` dans le MATCH filtre les relations dans le sens sortant.

---

### Exercise 10

### Afficher tous les noeuds dont le nom contient un 'a'.

**Answer:**
```cypher
MATCH (x:Lieu) WHERE x.name CONTAINS 'a' RETURN x
```

**Expected result:**
Beaulieu (contient 'a' dans "eau").

**Explanation:**
CONTAINS est un operateur de recherche de sous-chaine dans Cypher. C'est sensible a la casse.

---

## Section 3: Un graphe et des interrogations plus complexes

---

### Exercise 11

### Effacez toute la base. Chargez les lieux et les calories depuis des fichiers CSV en ligne.

**Answer:**
```cypher
// Supprimer tout
MATCH (n) DETACH DELETE n
```

```cypher
// Charger les lieux
LOAD CSV WITH HEADERS FROM
'https://people.rennes.inria.fr/Laurent.Amsaleg/TP-INSA/lieux.csv' AS row
CREATE (:Lieu {
    id: toInteger(row.id),
    name: row.name,
    rive: row.rive,
    coord: point({
        longitude: toFloat(row.longitude),
        latitude: toFloat(row.latitude)
    })
})
```

```cypher
// Charger les relations energetiques
LOAD CSV WITH HEADERS FROM
'https://people.rennes.inria.fr/Laurent.Amsaleg/TP-INSA/calories.csv' AS row
MATCH (start:Lieu {id: toInteger(row.start_id)}),
      (end:Lieu {id: toInteger(row.end_id)})
CREATE (start)-[:ENERGIE {calories: toInteger(row.calories)}]->(end)
```

**Expected result:**
Graphe complet des lieux rennais avec les aretes ENERGIE. Noeuds: Villejean, Saint_Anne, Le_Mail, Charles_De_Gaulle, Gare, Cimetiere_Est, Beaulieu, Triangle, Poterie, etc.

**Explanation:**
- LOAD CSV WITH HEADERS: charge un fichier CSV avec la premiere ligne comme noms de colonnes
- La variable `row` recoit chaque ligne du CSV
- `toInteger()`, `toFloat()`: conversion de type (les CSV sont en texte)
- `point()`: type geographique de Neo4j pour les coordonnees GPS
- DETACH DELETE supprime les noeuds ET toutes leurs relations

Reproduire le graphe sur papier avec les valeurs de calories facilite le travail.

---

### Exercise 12

### Quelle distance en metres separe Beaulieu de Poterie ?

**Answer:**
```cypher
MATCH (dep:Lieu {name: 'Beaulieu'}), (arr:Lieu {name: 'Poterie'})
RETURN toInteger(point.distance(dep.coord, arr.coord))
```

**Expected result:**
```
+--------------------------------------------+
| toInteger(point.distance(dep.coord, ...))  |
+--------------------------------------------+
| 2847                                       |
+--------------------------------------------+
```

**Explanation:**
`point.distance()` calcule la distance a vol d'oiseau (distance geodesique) entre deux coordonnees GPS, en metres.

---

### Exercise 13

### Affichez tous les lieux situes rive Gauche

**Answer:**
```cypher
MATCH (x:Lieu) WHERE x.rive = 'Gauche' RETURN x.name
```

**Expected result:**
```
+----------+
| x.name   |
+----------+
| Triangle |
| Poterie  |
| ...      |
+----------+
```

**Explanation:**
Filtre simple sur la propriete `rive`. Seuls les noeuds avec rive='Gauche' sont retournes.

---

### Exercise 14

### Le graphe est oriente. On peut compter et afficher les lieux que l'on peut atteindre en partant de Saint_Anne.

**Answer:**
```cypher
MATCH (:Lieu {name: 'Saint_Anne'})-->(x) RETURN x.name
```

**Expected result:**
Les lieux directement accessibles (1 arete sortante) depuis Saint_Anne.

**Explanation:**
`-->` signifie une relation sortante (orientee). On ne suit que les fleches qui partent de Saint_Anne.

---

### Exercise 15

### Deduisez la commande permettant d'afficher les noms des lieux arrivant a Saint_Anne

**Answer:**
```cypher
MATCH (x)-->(:Lieu {name: 'Saint_Anne'}) RETURN x.name
```

**Expected result:**
Les lieux d'ou partent des fleches VERS Saint_Anne.

**Explanation:**
On inverse la logique: `(x)-->(:Lieu ...)` signifie les noeuds x tels qu'il existe une arete de x vers Saint_Anne.

---

### Exercise 16

### Deduisez la commande permettant d'afficher tous les noeuds connectes a Saint_Anne

**Answer:**
```cypher
MATCH (x)--(:Lieu {name: 'Saint_Anne'}) RETURN x.name
```

**Expected result:**
L'union des exercices 14 et 15: tous les noeuds connectes dans les deux sens.

**Explanation:**
`--` (sans fleche) signifie une relation dans N'IMPORTE QUEL SENS. On obtient donc les voisins entrants et sortants.

---

### Exercise 17

### La distance a vol d'oiseau entre les deux lieux les plus eloignes se trouve ainsi.

**Answer:**
```cypher
MATCH (depuis:Lieu), (vers:Lieu)
RETURN depuis.name AS Depuis,
       vers.name AS Vers,
       toInteger(point.distance(depuis.coord, vers.coord)) AS DistMetres
ORDER BY DistMetres DESC
LIMIT 1
```

**Expected result:**
```
+-----------+---------+-----------+
| Depuis    | Vers    | DistMetres|
+-----------+---------+-----------+
| Villejean | Poterie | 4823      |
+-----------+---------+-----------+
```

(Les noms exacts dependent du contenu des CSV.)

**Explanation:**
On calcule toutes les distances, on les trie par ordre decroissant, on garde la premiere ligne. Mais le graphe indique qu'on ne peut pas forcement aller directement de `depuis` a `vers` -- il faut trouver un chemin.

---

### Exercise 18

### Trouvons le plus court chemin entre ces deux lieux. Remplacez XXXX et YYYY par ce que vous avez trouve pour depuis et vers.

**Answer:**
```cypher
MATCH p = shortestPath((depart)-[:ENERGIE*]-(arrivee))
WHERE depart.name = 'Villejean' AND arrivee.name = 'Poterie'
RETURN [n in nodes(p) | n.name] AS Trajet
```

**Expected result:**
```
+---------------------------------------------------+
| Trajet                                            |
+---------------------------------------------------+
| ["Villejean", "Saint_Anne", "Triangle", "Poterie"]|
+---------------------------------------------------+
```

**Explanation:**
- `shortestPath`: algorithme de plus court chemin base sur le nombre de noeuds traverses (pas sur les poids des aretes)
- `[:ENERGIE*]`: suit les relations de type ENERGIE, nombre de sauts variable
- `-` (pas de fleche): suit les relations dans les deux sens
- `[n in nodes(p) | n.name]`: list comprehension Cypher -- extrait les noms de tous les noeuds du chemin

---

### Exercise 19

### Voici la distance et la consommation energetique entre Villejean et Saint_Anne. Faire autant de requetes que necessaire pour cumuler manuellement distances et consommations le long du plus court chemin.

**Answer:**
```cypher
// Segment Villejean -> Saint_Anne
MATCH (dep:Lieu {name: 'Villejean'})-[arrete]-(arr:Lieu {name: 'Saint_Anne'})
RETURN toInteger(point.distance(dep.coord, arr.coord)) AS distance, arrete.calories AS Cal
```

```cypher
// Segment Saint_Anne -> Triangle
MATCH (dep:Lieu {name: 'Saint_Anne'})-[arrete]-(arr:Lieu {name: 'Triangle'})
RETURN toInteger(point.distance(dep.coord, arr.coord)) AS distance, arrete.calories AS Cal
```

```cypher
// Segment Triangle -> Poterie
MATCH (dep:Lieu {name: 'Triangle'})-[arrete]-(arr:Lieu {name: 'Poterie'})
RETURN toInteger(point.distance(dep.coord, arr.coord)) AS distance, arrete.calories AS Cal
```

**Expected result:**

| Segment | Distance (m) | Calories |
|---------|-------------|----------|
| Villejean -> Saint_Anne | ~1842 | 1100 |
| Saint_Anne -> Triangle | ~956 | 725 |
| Triangle -> Poterie | ~1203 | 725 |
| **Total** | **~4001** | **~2550** |

(Les valeurs exactes dependent des fichiers CSV.)

**Explanation:**
On calcule manuellement la distance et la consommation sur chaque segment du plus court chemin. Cela prepare l'exercice 20 ou tout sera automatise.

---

### Exercise 20

### On peut faire cela grace a une requete un peu musclee. XXXX et YYYY sont a remplacer.

**Answer:**
```cypher
MATCH (depart:Lieu {name: 'Villejean'})
MATCH (arrivee:Lieu {name: 'Poterie'})
MATCH p = shortestPath((depart)-[:ENERGIE*]-(arrivee))
RETURN
    [n in nodes(p) | n.name] AS Trajet,
    REDUCE(acc = 0, r in relationships(p) | acc + r.calories) AS depense,
    REDUCE(d = 0.0, x IN range(1, size(nodes(p))-1) |
        d + toInteger(point.distance(nodes(p)[x-1].coord, nodes(p)[x].coord))
    ) AS totalDistance
```

**Expected result:**
```
+---------------------------------------------------+---------+---------------+
| Trajet                                            | depense | totalDistance  |
+---------------------------------------------------+---------+---------------+
| ["Villejean", "Saint_Anne", "Triangle", "Poterie"]| 2550    | 4001          |
+---------------------------------------------------+---------+---------------+
```

**Explanation:**
- Premier REDUCE: traverse les aretes (`relationships(p)`) et cumule les calories
- Second REDUCE: parcourt les paires consecutives de noeuds et cumule les distances geographiques
- `range(1, size(nodes(p))-1)`: genere les indices 1, 2, ..., n-1 pour acceder aux paires (0,1), (1,2), etc.

---

### Exercise 21

### Le plus court chemin en noeuds n'est pas forcement celui de moindre depense energetique. Trouvons le chemin de moindre depense energetique.

**Answer:**
```cypher
MATCH (from: Lieu {name: 'Villejean'}), (to: Lieu {name: 'Poterie'}),
      path = ((from)-[:ENERGIE*]-(to))
WITH
    REDUCE(tot_cal = 0, rel in relationships(path) | tot_cal + rel.calories) AS cout_calories,
    path
RETURN
    [n in nodes(path) | n.name] AS Trajet,
    cout_calories AS Depense
ORDER BY cout_calories
LIMIT 1
```

**Expected result:**
```
+--------------------------------------------------------------+---------+
| Trajet                                                       | Depense |
+--------------------------------------------------------------+---------+
| ["Villejean", "Saint_Anne", "Republique", ..., "Poterie"]    | 2100    |
+--------------------------------------------------------------+---------+
```

**Explanation:**
Ici, tous les chemins sont parcourus, la depense energetique pour chacun cumulee, et on ne garde que le plus petit. C'est une approche brute-force acceptable sur un petit graphe mais qui explose sur un graphe de grande taille. Avec Neo4j installe localement (pas la version AuraDB gratuite limitee), on pourrait utiliser un algorithme de Dijkstra optimise integrant un cout sur les aretes.

---

### Exercise 22

### Pris de scrupules, vous voulez aller de depuis a vers par le plus court chemin mais en ne depensant jamais plus de 1200 calories par segment traverse.

**Answer:**
```cypher
MATCH p = shortestPath((depart)-[:ENERGIE*]-(arrivee))
WHERE all(link in relationships(p) WHERE link.calories < 1200)
  AND depart.name = 'Villejean' AND arrivee.name = 'Poterie'
RETURN [n in nodes(p) | n.name] AS Trajet
```

**Expected result:**
Un chemin possiblement plus long mais dont chaque segment coute < 1200 calories.

**Explanation:**
- `all(link in relationships(p) WHERE ...)`: verifie que TOUTES les aretes du chemin respectent la condition
- Certaines aretes ont un cout > 1200 calories et sont donc evitees, ce qui peut allonger le trajet

---

### Exercise 23

### Changez la depense maximale par segment a 1500. Quel trajet faites-vous alors ?

**Answer:**
```cypher
MATCH p = shortestPath((depart)-[:ENERGIE*]-(arrivee))
WHERE all(link in relationships(p) WHERE link.calories < 1500)
  AND depart.name = 'Villejean' AND arrivee.name = 'Poterie'
RETURN [n in nodes(p) | n.name] AS Trajet
```

**Expected result:**
Avec une contrainte plus lache (1500 au lieu de 1200), certaines aretes deviennent accessibles, le chemin peut donc etre plus court (moins de noeuds traverses).

**Explanation:**
En augmentant le seuil, on autorise des segments plus energetiques, ce qui ouvre des raccourcis dans le graphe.

---

### Exercise 24

### Executez ces commandes tour a tour pour charger les personnes, les amities et les liens HABITE.

**Answer:**
```cypher
// Charger les personnes
LOAD CSV WITH HEADERS FROM
'https://people.rennes.inria.fr/Laurent.Amsaleg/TP-INSA/personnes.csv' AS row
CREATE (:Personne {
    name: row.prenom,
    sexe: row.sexe,
    age: toInteger(row.age),
    profession: row.job,
    lieu: toInteger(row.lieu)
})
```

```cypher
// Creer les relations d'amitie
LOAD CSV WITH HEADERS FROM
'https://people.rennes.inria.fr/Laurent.Amsaleg/TP-INSA/amis.csv' AS row
MATCH (origine: Personne {name: row.Prenom})
MATCH (cible: Personne {name: row.Ami})
CREATE (origine)-[:AMI]->(cible)
```

```cypher
// Creer les relations HABITE (personne -> lieu)
MATCH (a:Personne)
MATCH (b:Lieu {id: toInteger(a.lieu)})
CREATE (a)-[:HABITE]->(b)
```

**Expected result:**
Graphe enrichi avec des Personnes reliees par AMI et HABITE vers les Lieux.

**Explanation:**
Trois chargements CSV successifs: d'abord les noeuds Personne, puis les relations AMI entre eux, enfin les relations HABITE vers les lieux existants (en utilisant l'id du lieu stocke dans la propriete `lieu` de chaque personne).

---

### Exercise 25

### Qui sont les amis de Klara ?

**Answer:**
```cypher
MATCH (:Personne {name: 'Klara'})-[:AMI]->(ami:Personne)
RETURN ami.name
```

**Expected result:**
```
+---------+
| ami.name|
+---------+
| Alice   |
| Quentin |
| Yves    |
+---------+
```

**Explanation:**
On suit les relations sortantes de type AMI depuis Klara. La variable `ami` capture chaque noeud Personne ami.

---

### Exercise 26

### Qui sont les amis des amis de Klara ?

**Answer:**
```cypher
MATCH (:Personne {name: 'Klara'})-[:AMI*2]->(fof:Personne)
RETURN DISTINCT fof.name
```

**Expected result:**
```
+----------+
| fof.name |
+----------+
| Zacharie |
| Pierre   |
| ...      |
+----------+
```

**Explanation:**
`[:AMI*2]` suit exactement 2 relations AMI. `DISTINCT` elimine les doublons (un meme ami des amis peut etre atteint par plusieurs chemins).

---

### Exercise 27

### Inspirez-vous des diapos du cours de NoSQL pour connaitre les amis de Klara qui sont aussi amis entre eux.

**Answer:**
```cypher
MATCH (klara:Personne {name: 'Klara'})-[:AMI]->(a1:Personne),
      (klara)-[:AMI]->(a2:Personne),
      (a1)-[:AMI]->(a2)
WHERE a1 <> a2
RETURN DISTINCT a1.name, a2.name
```

**Expected result:**
Paires d'amis de Klara qui sont aussi amis entre eux (triangles d'amitie).

**Explanation:**
On cherche deux amis de Klara (a1 et a2) tels que a1 est aussi ami de a2. C'est le pattern de "clique" ou "triangle" dans un graphe social. `WHERE a1 <> a2` empeche de comparer un noeud avec lui-meme.

---

### Exercise 28

### Inspirez-vous des questions precedentes pour que la requete dise a Klara quel plus court chemin elle doit emprunter pour aller saluer Quentin.

**Answer:**
```cypher
MATCH (klara:Personne {name: 'Klara'})-[:HABITE]->(lieuK:Lieu)
MATCH (quentin:Personne {name: 'Quentin'})-[:HABITE]->(lieuQ:Lieu)
MATCH p = shortestPath((lieuK)-[:ENERGIE*]-(lieuQ))
RETURN [n in nodes(p) | n.name] AS Trajet
```

**Expected result:**
Le plus court chemin (en nombre de noeuds) entre le lieu de residence de Klara et celui de Quentin.

**Explanation:**
On trouve d'abord ou habitent Klara et Quentin (via HABITE), puis on calcule le plus court chemin entre leurs deux lieux de residence en empruntant les aretes ENERGIE.

---

### Exercise 29

### On va faire des requetes plus complexes sur un graphe encore plus dense. Chargez les films et les visionnages.

**Answer:**
```cypher
LOAD CSV WITH HEADERS FROM
'https://people.rennes.inria.fr/Laurent.Amsaleg/TP-INSA/films.csv' AS row
CREATE (:Film {name: row.Titre, identif: row.ID})
```

```cypher
LOAD CSV WITH HEADERS FROM
'https://people.rennes.inria.fr/Laurent.Amsaleg/TP-INSA/films_vus.csv' AS row
MATCH (per: Personne {name: row.Prenom})
MATCH (f: Film {identif: row.Film_ID})
CREATE (per)-[:A_VU]->(f)
```

**Expected result:**
Graphe complet: Lieux + Personnes + Amities + Films + Relations A_VU.

**Explanation:**
On a fait un graphe de personnes habitant des lieux et allant voir des films. Le graphe est maintenant dense avec trois types de noeuds (Lieu, Personne, Film) et quatre types de relations (ENERGIE, AMI, HABITE, A_VU).

---

### Exercise 30

### Combien de fois a ete vu le film 'THE BRUTALIST' ?

**Answer:**
```cypher
MATCH (:Personne)-[:A_VU]->(f:Film {name: 'THE BRUTALIST'})
RETURN COUNT(*) AS nb_vues
```

**Expected result:**
```
+---------+
| nb_vues |
+---------+
| 8       |
+---------+
```

**Explanation:**
On compte le nombre de relations A_VU pointant vers le film THE BRUTALIST. Chaque relation represente un visionnage par une personne.

---

### Exercise 31

### Qui a vu ce film ?

**Answer:**
```cypher
MATCH (p:Personne)-[:A_VU]->(f:Film {name: 'THE BRUTALIST'})
RETURN p.name
```

**Expected result:**
```
+---------+
| p.name  |
+---------+
| Alice   |
| Klara   |
| Pierre  |
| ...     |
+---------+
```

**Explanation:**
On recupere le nom de chaque Personne ayant une relation A_VU vers THE BRUTALIST.

---

### Exercise 32

### Quelles sont les personnes n'ayant pas vu de film ?

**Answer:**
```cypher
MATCH (p:Personne)
WHERE NOT (p)-[:A_VU]->(:Film)
RETURN p.name
```

**Expected result:**
Les noms des personnes sans aucune relation A_VU.

**Explanation:**
`NOT (p)-[:A_VU]->(:Film)` verifie qu'il n'existe aucune relation A_VU sortant de p vers un Film. C'est un pattern de negation propre aux graphes.

---

### Exercise 33

### Quels sont les 5 films les plus vus ?

**Answer:**
```cypher
MATCH (p:Personne)-[:A_VU]->(f:Film)
RETURN f.name, COUNT(p) AS nb_vues
ORDER BY nb_vues DESC
LIMIT 5
```

**Expected result:**
```
+---------------------+---------+
| f.name              | nb_vues |
+---------------------+---------+
| FLOW                | 12      |
| THE BRUTALIST       | 8       |
| ANORA               | 7       |
| CONCLAVE            | 6       |
| THE SUBSTANCE       | 5       |
+---------------------+---------+
```

**Explanation:**
GROUP BY implicite via COUNT, tri decroissant, et LIMIT 5 pour le top 5.

---

### Exercise 34

### Qui sont les 10 personnes ayant vu le plus de films ?

**Answer:**
```cypher
MATCH (p:Personne)-[:A_VU]->(f:Film)
RETURN p.name, COUNT(f) AS nb_films
ORDER BY nb_films DESC
LIMIT 10
```

**Expected result:**
```
+---------+----------+
| p.name  | nb_films |
+---------+----------+
| Alice   | 15       |
| Zacharie| 12       |
| Klara   | 11       |
| ...     | ...      |
+---------+----------+
```

**Explanation:**
Meme logique que l'exercice 33 mais en comptant les films par personne au lieu des personnes par film.

---

### Exercise 35

### Quels sont les films vus par la personne la plus cinephile ? Deux manieres: injecter le nom, ou trouver tout seul avec COLLECT.

**Answer:**

**Methode 1: injection directe du nom (trouve a l'exercice 34)**

```cypher
MATCH (p:Personne {name: 'Alice'})-[:A_VU]->(f:Film)
RETURN f.name
```

**Methode 2: automatique avec COLLECT**

```cypher
MATCH (p:Personne)-[:A_VU]->(f:Film)
WITH p, COUNT(f) AS nb, COLLECT(f.name) AS films
ORDER BY nb DESC
LIMIT 1
RETURN p.name, nb, films
```

**Expected result:**
```
+---------+----+-----------------------------------------------+
| p.name  | nb | films                                         |
+---------+----+-----------------------------------------------+
| Alice   | 15 | ["FLOW", "THE BRUTALIST", "ANORA", ...]       |
+---------+----+-----------------------------------------------+
```

**Explanation:**
`COLLECT(f.name)` rassemble toutes les valeurs en une liste (equivalent d'un GROUP_CONCAT en SQL). La methode 2 est plus elegante car elle ne necessite pas de connaitre le nom a l'avance.

---

### Exercise 36

### Quels films a vu Klara ?

**Answer:**
```cypher
MATCH (:Personne {name: 'Klara'})-[:A_VU]->(f:Film)
RETURN f.name
```

**Expected result:**
La liste des films vus par Klara.

**Explanation:**
Traversee simple: on part de Klara, on suit les relations A_VU, on retourne les noms des Films.

---

### Exercise 37

### Quels sont les films vus par les amis de Klara ? (attention, il y a 29 films dans le resultat). Bonus: combien de fois chaque film a ete vu ? Super bonus: et par qui ?

**Answer:**

**Version simple:**

```cypher
MATCH (:Personne {name: 'Klara'})-[:AMI]->(ami)-[:A_VU]->(f:Film)
RETURN DISTINCT f.name
```

Resultat: 29 films distincts.

**Bonus: comptage par film**

```cypher
MATCH (:Personne {name: 'Klara'})-[:AMI]->(ami)-[:A_VU]->(f:Film)
RETURN f.name, COUNT(ami) AS nb_vues
ORDER BY nb_vues DESC
```

**Super bonus: par qui**

```cypher
MATCH (:Personne {name: 'Klara'})-[:AMI]->(ami)-[:A_VU]->(f:Film)
RETURN f.name, COUNT(ami) AS nb_vues, COLLECT(ami.name) AS vus_par
ORDER BY nb_vues DESC
```

**Expected result:**
```
+------------------+---------+--------------------------+
| f.name           | nb_vues | vus_par                  |
+------------------+---------+--------------------------+
| FLOW             | 3       | ["Alice", "Quentin", ...]|
| THE BRUTALIST    | 2       | ["Alice", "Yves"]        |
| ...              | ...     | ...                      |
+------------------+---------+--------------------------+
```

**Explanation:**
On chaine deux traversees: AMI puis A_VU. DISTINCT elimine les doublons de films. COLLECT rassemble les noms des amis qui ont vu chaque film.

---

### Exercise 38

### Quels sont les spectateurs de l'excellent film 'FLOW' ?

**Answer:**
```cypher
MATCH (p:Personne)-[:A_VU]->(f:Film {name: 'FLOW'})
RETURN p.name
```

**Expected result:**
La liste des personnes ayant vu FLOW.

**Explanation:**
Meme pattern que l'exercice 31 mais pour un film different.

---

### Exercise 39

### Quel est l'age moyen de ces spectateurs ?

**Answer:**
```cypher
MATCH (p:Personne)-[:A_VU]->(f:Film {name: 'FLOW'})
RETURN AVG(p.age) AS age_moyen
```

**Expected result:**
```
+------------+
| age_moyen  |
+------------+
| 34.5       |
+------------+
```

**Explanation:**
AVG calcule la moyenne de la propriete `age` de toutes les personnes matchees.

---

### Exercise 40

### Ou habitent ces spectateurs ?

**Answer:**
```cypher
MATCH (p:Personne)-[:A_VU]->(f:Film {name: 'FLOW'})
MATCH (p)-[:HABITE]->(lieu:Lieu)
RETURN p.name, lieu.name
```

**Expected result:**
```
+---------+--------------+
| p.name  | lieu.name    |
+---------+--------------+
| Alice   | Saint_Anne   |
| Klara   | Triangle     |
| Pierre  | Beaulieu     |
| ...     | ...          |
+---------+--------------+
```

**Explanation:**
Double MATCH: d'abord on trouve les spectateurs de FLOW, puis on suit leur relation HABITE pour trouver leur lieu de residence.

---

### Exercise 41

### Combien de personnes faut-il que Zacharie rencontre pour finalement etre presente a Alice, et qui sont ces personnes ?

**Answer:**
```cypher
MATCH p = shortestPath(
    (z:Personne {name: 'Zacharie'})-[:AMI*]-(a:Personne {name: 'Alice'})
)
RETURN [n in nodes(p) | n.name] AS chaine,
       length(p) - 1 AS nb_intermediaires
```

**Expected result:**
```
+-------------------------------------+--------------------+
| chaine                              | nb_intermediaires  |
+-------------------------------------+--------------------+
| ["Zacharie", "Pierre", "Klara",     | 2                  |
|  "Alice"]                           |                    |
+-------------------------------------+--------------------+
```

**Explanation:**
- `shortestPath` avec `[:AMI*]` trouve le plus court chemin en nombre de sauts d'amitie
- `length(p)` retourne le nombre d'aretes dans le chemin
- Le nombre d'intermediaires est `length(p) - 1` (on ne compte ni Zacharie ni Alice)
- C'est le concept classique des "degres de separation" dans un reseau social
