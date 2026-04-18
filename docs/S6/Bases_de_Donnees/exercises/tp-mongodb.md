---
title: "TP4 - MongoDB"
sidebar_position: 8
---

# TP4 - MongoDB

> D'apres les instructions du sujet : S6/Bases_de_Donnees/data/moodle/tp/tp4_mongodb/sujet.pdf
> (Auteur original : Nicolas Travers, CNAM)

---

## Section 2 : Visualisation du contenu

La collection `paris` contient des lieux parisiens agreges sur tourPedia. Document type :

```json
{
    "_id": 455674,
    "name": "Bibliotheque du Cnam",
    "category": "poi",
    "location": {
        "coord": { "coordinates": [2.354878, 48.866599], "type": "Point" },
        "address": "292 Rue Saint-Martin, Paris, France",
        "city": "Paris"
    },
    "reviews": [],
    "contact": {
        "website": "http://bibliotheque.cnam.fr",
        "GooglePlaces": "https://plus.google.com/...",
        "phone": "+33 1 40 27 27 03",
        "foursquare": "",
        "Booking": "",
        "Facebook": ""
    },
    "description": "",
    "services": []
}
```

Categories : poi (points d'interet), restaurant, accommodation (logements), attraction.

---

## Section 3 : Quelques requetes de recherche pour demarrer

---

### Exercice 1

### Recherchez toutes les informations a propos des lieux dont la categorie est "accommodation".

**Reponse :**
```javascript noexec
db.paris.find({"category": "accommodation"});
```

**Resultat attendu :**
Tous les documents avec category = "accommodation".

**Explication :**
`find()` avec un seul argument (le filtre) retourne tous les champs de chaque document correspondant.

---

### Exercice 2

### Donner juste le nom des lieux dont la categorie est "accommodation"

**Reponse :**
```javascript noexec
db.paris.find({"category": "accommodation"}, {name: 1});
```

Ou avec des variables pour plus de souplesse:

```javascript noexec
match = {"category": "accommodation"};
project = {name: 1};
db.paris.find(match, project).pretty();
```

**Resultat attendu :**
```json
{ "_id": 123, "name": "Hotel de Ville" }
{ "_id": 456, "name": "Auberge de Jeunesse" }
...
```

**Explication :**
Le second argument de `find()` est la projection. `{name: 1}` = inclure le champ name. `_id` est inclus par defaut (il faut explicitement `{_id: 0}` pour l'exclure).

---

### Exercice 3

### Affichez toutes les informations sur les lieux dont la categorie est "accommodation" mais en n'affichant ni le champ "_id" ni "contact"

**Reponse :**
```javascript noexec
match = {"category": "accommodation"};
project = {_id: 0, contact: 0};
db.paris.find(match, project).pretty();
```

**Resultat attendu :**
Documents accommodation sans les champs _id et contact.

**Explication :**
`{_id: 0, contact: 0}` = exclure ces champs. On ne peut pas melanger inclusion (1) et exclusion (0) dans la meme projection, sauf pour `_id`.

---

### Exercice 4

### Donner le nom et numero de telephone des lieux ayant un numero de telephone renseigne. Utilisez ($exists, $ne) ou ne signifie "different de".

**Reponse :**
```javascript noexec
match = {"contact.phone": {$exists: 1, $ne: ""}};
project = {"contact.phone": 1, name: 1};
db.paris.find(match, project);
```

**Resultat attendu :**
```json
{ "_id": 455674, "name": "Bibliotheque du Cnam", "contact": { "phone": "+33 1 40 27 27 03" } }
...
```

**Explication :**
- `"contact.phone"`: notation pointee pour acceder au champ phone du sous-document contact
- `$exists: 1`: le champ existe
- `$ne: ""`: la valeur n'est pas vide (ne = not equal)

---

### Exercice 5

### Nom et contacts des lieux ayant "website" et "Foursquare" renseignes

**Reponse :**
```javascript noexec
match = {
    "contact.Foursquare": {$ne: "", $exists: 1},
    "contact.website": {$ne: "", $exists: 1}
};
project = {"name": 1, "contact.Foursquare": 1, "contact.website": 1};
db.paris.find(match, project);
```

**Resultat attendu :**
Lieux avec website et Foursquare non vides.

**Explication :**
Plusieurs conditions dans le meme objet match agissent comme un AND implicite. La notation pointee permet de filtrer sur des sous-champs.

---

### Exercice 6

### Nom des lieux dont le nom contient le mot "hotel" (quelle que soit la casse)

**Reponse :**
```javascript noexec
match = {"name": {$regex: "Hotel", $options: "i"}};
project = {name: 1};
db.paris.find(match, project);
```

Ou avec la syntaxe regex native:

```javascript noexec
match = {"name": /Hotel/i};
db.paris.find(match, {name: 1});
```

**Resultat attendu :**
```json
{ "_id": ..., "name": "Hotel Lutecia" }
{ "_id": ..., "name": "Grand Hotel du Louvre" }
{ "_id": ..., "name": "hotel des Invalides" }
...
```

**Explication :**
L'option `"i"` rend la recherche **insensible a la casse**. `Hotel`, `hotel`, `HOTEL` sont tous trouves.

---

### Exercice 7

### Nom et services des lieux ayant un service "chambres non-fumeurs"

**Reponse :**
```javascript noexec
match = {"services": "chambres non-fumeurs"};
db.paris.find(match, {"name": 1, "services": 1});
```

**Resultat attendu :**
Lieux ayant "chambres non-fumeurs" dans leur tableau services.

**Explication :**
Quand on filtre un tableau avec une valeur simple, MongoDB cherche si cette valeur est l'un des elements du tableau. Pas besoin de `$in` ou `$elemMatch` pour un test simple.

---

### Exercice 8

### Nom et services des lieux dont le premier service est "chambres non-fumeurs"

**Reponse :**
```javascript noexec
match = {"services.0": "chambres non-fumeurs"};
db.paris.find(match, {"name": 1, "services": 1});
```

**Resultat attendu :**
Lieux dont le premier element du tableau services est "chambres non-fumeurs".

**Explication :**
`services.0` accede au premier element du tableau (index 0). C'est la notation pointee appliquee aux tableaux. Ref : https://docs.mongodb.com/manual/tutorial/query-arrays/

---

### Exercice 9

### Nom et services des lieux n'ayant qu'un seul service "chambres non-fumeurs"

**Reponse :**

Methode 1: tester que le second service n'existe pas

```javascript noexec
match = {"services.0": "chambres non-fumeurs", "services.1": {$exists: 0}};
db.paris.find(match, {"name": 1, "services": 1});
```

Methode 2: utiliser $size

```javascript noexec
match = {"services.0": "chambres non-fumeurs", "services": {$size: 1}};
db.paris.find(match, {"name": 1, "services": 1});
```

Methode 3: matcher le tableau exact

```javascript noexec
match = {"services": ["chambres non-fumeurs"]};
db.paris.find(match, {"name": 1, "services": 1});
```

**Resultat attendu :**
Lieux avec exactement un seul service et ce service est "chambres non-fumeurs".

**Explication :**
S'il n'y a qu'un seul service, le second service n'existe pas. On teste l'existence du service en position 1 du tableau. La methode 3 fait une correspondance exacte sur le tableau entier (ordre et contenu).

---

### Exercice 10

### Nom et services des lieux proposant 5 services

**Reponse :**
```javascript noexec
match = {"services": {$size: 5}};
project = {"name": 1, "services": 1};
db.paris.find(match, project);
```

**Resultat attendu :**
Lieux avec exactement 5 services dans le tableau.

**Explication :**
`$size: 5` teste la taille exacte du tableau. Attention: `$size` ne supporte PAS les operateurs de comparaison comme `$gte`.

---

## Section 4 : A vous de jouer pour quelques requetes simples

---

### Exercice 11

### Nom et services des lieux proposant au moins 5 services

**Reponse :**
```javascript noexec
match = {"services.4": {$exists: 1}};
project = {"name": 1, "services": 1};
db.paris.find(match, project);
```

**Resultat attendu :**
Lieux avec 5 services ou plus.

**Explication :**
`services.4` est l'element a l'index 4 (le 5eme). S'il existe, le tableau a au moins 5 elements. C'est l'astuce car `$size` ne supporte pas `$gte`. Alternative avec aggregate:

```javascript noexec
db.paris.aggregate([
    {$project: {name: 1, services: 1, nbServices: {$size: "$services"}}},
    {$match: {nbServices: {$gte: 5}}}
]);
```

---

### Exercice 12

### Donner les adresses des lieux de categorie "accommodation" avec un service "blanchisserie"

**Reponse :**
```javascript noexec
match = {"category": "accommodation", "services": "blanchisserie"};
project = {"name": 1, "location.address": 1};
db.paris.find(match, project);
```

**Resultat attendu :**
```json
{ "_id": ..., "name": "Hotel Concorde", "location": { "address": "2 Rue Scribe, Paris" } }
...
```

**Explication :**
Deux conditions dans le match (AND implicite): la categorie doit etre accommodation ET le tableau services doit contenir "blanchisserie".

---

### Exercice 13

### Categories des lieux ayant au moins une note (reviews.rating) de 4 ou plus

**Reponse :**
```javascript noexec
match = {"reviews.rating": {$gte: 4}};
project = {"category": 1, "name": 1};
db.paris.find(match, project);
```

**Resultat attendu :**
Noms et categories des lieux avec au moins un review ayant rating >= 4.

**Explication :**
`"reviews.rating"` utilise la notation pointee pour acceder au champ rating a l'interieur des elements du tableau reviews. MongoDB cherche si AU MOINS UN element du tableau a un rating >= 4.

---

### Exercice 14

### Affiche les sources des commentaires des lieux avec au moins un commentaire "Facebook" (source)

**Reponse :**
```javascript noexec
match = {"reviews.source": "Facebook"};
project = {"name": 1, "reviews.source": 1};
db.paris.find(match, project);
```

**Resultat attendu :**
Lieux avec au moins un commentaire de source "Facebook", affichant le nom et les sources des reviews.

**Explication :**
Meme principe que l'exercice 13: la notation pointee sur un tableau filtre sur les sous-champs des elements.

---

### Exercice 16

### Coordonnees GPS des lieux dont l'adresse contient "rue de rome"

**Reponse :**
```javascript noexec
match = {"location.address": {$regex: "rue de rome", $options: "i"}};
project = {"name": 1, "location.coord.coordinates": 1};
db.paris.find(match, project);
```

**Resultat attendu :**
```json
{ "_id": ..., "name": "Hotel Rome", "location": { "coord": { "coordinates": [2.3245, 48.8812] } } }
...
```

**Explication :**
`$regex` avec `$options: "i"` fait une recherche insensible a la casse sur l'adresse. La projection cible les coordonnees GPS imbriquees.

---

## Section 5 : API Mongo - Requetes 'aggregate'

L'operateur `aggregate` est une sequence d'operations representant une chaine de pipeline : `aggregate([{$op1}, {$op2}, {$op3}])`. Le resultat d'un operateur est donne a l'operateur suivant.

Doc : https://docs.mongodb.com/manual/aggregation/

**Important :** supprimer `db.paris.find(match, project).pretty();` de la console avant d'utiliser aggregate, sinon les resultats seront incorrects.

---

### Exercice 20

### Pour les lieux de categorie "accommodation" avec un service "blanchisserie", projeter le resultat sur le nom et numero de telephone (seulement si elle existe), et trier sur le nom

**Reponse :**
```javascript noexec
opMatch = {$match: {
    "services": "blanchisserie",
    "category": "accommodation",
    "contact.phone": {$exists: 1}
}};
opProject = {$project: {"name": 1, "contact.phone": 1}};
opSort = {$sort: {"name": 1}};

db.paris.aggregate([opMatch, opProject, opSort]);
```

**Resultat attendu :**
```json
{ "_id": ..., "name": "Best Western", "contact": { "phone": "+33 1 ..." } }
{ "_id": ..., "name": "Hotel Concorde", "contact": { "phone": "+33 1 ..." } }
...
```

**Explication :**
Pipeline en 3 etapes:
1. `$match`: filtre les documents (equivalent WHERE)
2. `$project`: choisit les champs a retourner (equivalent SELECT)
3. `$sort`: trie le resultat (1 = ascendant, -1 = descendant)

---

### Exercice 21

### Nombre de lieux de categorie "accommodation" et ayant un service "chambres non-fumeurs"

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$match: {"category": "accommodation", "services": "chambres non-fumeurs"}},
    {$count: "nb_lieux"}
]);
```

**Resultat attendu :**
```json
{ "nb_lieux": 847 }
```

**Explication :**
`$count` est un raccourci pour compter les documents en sortie du pipeline. Alternative: `{$group: {_id: null, nb_lieux: {$sum: 1}}}`.

---

### Exercice 22

### Donner le nombre de lieux par categorie

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$group: {_id: "$category", nb_lieux: {$sum: 1}}},
    {$sort: {nb_lieux: -1}}
]);
```

**Resultat attendu :**
```json
{ "_id": "poi", "nb_lieux": 5234 }
{ "_id": "restaurant", "nb_lieux": 4182 }
{ "_id": "accommodation", "nb_lieux": 2876 }
{ "_id": "attraction", "nb_lieux": 1243 }
```

**Explication :**
`_id: "$category"` groupe les documents par la valeur du champ category. `$sum: 1` compte le nombre de documents dans chaque groupe. C'est l'equivalent de `GROUP BY category` en SQL.

---

### Exercice 23

### Pour les lieux de categorie "accommodation", donner le nombre de lieux pour chaque service

**Reponse :**
```javascript noexec
opMatch = {$match: {"category": "accommodation"}};
opUnwind = {$unwind: "$services"};
opGroup = {$group: {_id: "$services", "tot": {$sum: 1}}};

db.paris.aggregate([opMatch, opUnwind, opGroup]);
```

**Resultat attendu :**
```json
{ "_id": "chambres non-fumeurs", "tot": 847 }
{ "_id": "wifi", "tot": 712 }
{ "_id": "parking", "tot": 534 }
...
```

**Explication :**
`$unwind` decompose le contenu d'un tableau en autant de nouveaux documents. Par exemple:

Avant: `{ "_id": 123, "nom": "GM", "etudiants": ["Jeanne", "Pierre", "Zoe"] }`

Apres `{$unwind: "$etudiants"}`:
```json
{ "_id": 123, "nom": "GM", "etudiants": "Jeanne" }
{ "_id": 123, "nom": "GM", "etudiants": "Pierre" }
{ "_id": 123, "nom": "GM", "etudiants": "Zoe" }
```

Il est donc ensuite facile de travailler sur chaque element avec `$group`.

---

### Exercice 24

### Trier le resultat precedent par ordre decroissant

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$match: {"category": "accommodation"}},
    {$unwind: "$services"},
    {$group: {_id: "$services", tot: {$sum: 1}}},
    {$sort: {tot: -1}}
]);
```

**Resultat attendu :**
Meme resultat que l'exercice 23 mais trie par tot decroissant.

**Explication :**
`{$sort: {tot: -1}}` ajoute un tri decroissant a la fin du pipeline. -1 = descendant, 1 = ascendant.

Note du sujet : passez a l'exercice 7 (section geospatiale) si vous le desirez.

---

### Exercice 25

### Du resultat precedent, n'afficher que les services presents dans plus de 1000 lieux ($gt, strictement superieur)

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$match: {"category": "accommodation"}},
    {$unwind: "$services"},
    {$group: {_id: "$services", tot: {$sum: 1}}},
    {$match: {tot: {$gt: 1000}}},
    {$sort: {tot: -1}}
]);
```

**Resultat attendu :**
Uniquement les services avec tot > 1000.

**Explication :**
Le second `$match` agit comme un HAVING en SQL: il filtre les GROUPES apres l'agregation. `$gt: 1000` signifie "strictement superieur a 1000".

---

### Exercice 26

### Pour chaque nom de lieu de categorie "poi", donner le nombre de commentaires dont la source (reviews.source) est "Facebook". Trier par ordre decroissant

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$match: {"category": "poi"}},
    {$unwind: "$reviews"},
    {$match: {"reviews.source": "Facebook"}},
    {$group: {_id: "$name", nb_commentaires: {$sum: 1}}},
    {$sort: {nb_commentaires: -1}}
]);
```

**Resultat attendu :**
```json
{ "_id": "Tour Eiffel Paris France", "nb_commentaires": 234 }
{ "_id": "Musee du Louvre", "nb_commentaires": 189 }
...
```

**Explication :**
Pipeline: filtrer par categorie poi -> decomposer les reviews -> filtrer par source Facebook -> grouper par nom et compter -> trier. Le double `$match` (avant et apres `$unwind`) est une technique courante.

---

### Exercice 27

### Pour chaque langue d'un commentaire (reviews.language), donner le nombre de commentaires de lieux ayant un service "chambres non-fumeurs"

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$match: {"services": "chambres non-fumeurs"}},
    {$unwind: "$reviews"},
    {$group: {_id: "$reviews.language", nb: {$sum: 1}}},
    {$sort: {nb: -1}}
]);
```

**Resultat attendu :**
```json
{ "_id": "en", "nb": 3456 }
{ "_id": "fr", "nb": 1234 }
{ "_id": "es", "nb": 567 }
...
```

**Explication :**
On filtre d'abord les lieux avec le service specifique, puis on decompose leurs reviews pour grouper par langue.

---

### Exercice 28

### Pour chaque nom de lieu de categorie "restaurant", donner la note moyenne et le nombre de commentaires. Trier le resultat par ordre decroissant de moyenne, puis de nombre

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$match: {"category": "restaurant"}},
    {$unwind: "$reviews"},
    {$group: {
        _id: "$name",
        note_moyenne: {$avg: "$reviews.rating"},
        nb_commentaires: {$sum: 1}
    }},
    {$sort: {note_moyenne: -1, nb_commentaires: -1}}
]);
```

**Resultat attendu :**
```json
{ "_id": "Le Jules Verne", "note_moyenne": 4.8, "nb_commentaires": 156 }
{ "_id": "L'Ambroisie", "note_moyenne": 4.7, "nb_commentaires": 89 }
...
```

**Explication :**
`$avg` calcule la moyenne du champ rating. Le tri se fait sur deux criteres: d'abord la moyenne decroissante, puis le nombre de commentaires decroissant pour departager les ex-aequo.

---

### Exercice 29

### Pour chaque categorie de lieux et langue de commentaire, donner le nombre de commentaires correspondants

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$unwind: "$reviews"},
    {$group: {
        _id: {category: "$category", language: "$reviews.language"},
        nb: {$sum: 1}
    }},
    {$sort: {"_id.category": 1, nb: -1}}
]);
```

**Resultat attendu :**
```json
{ "_id": { "category": "accommodation", "language": "en" }, "nb": 5678 }
{ "_id": { "category": "accommodation", "language": "fr" }, "nb": 2345 }
{ "_id": { "category": "poi", "language": "en" }, "nb": 4567 }
...
```

**Explication :**
`_id: {category: ..., language: ...}` groupe sur DEUX dimensions a la fois. Equivalent de `GROUP BY category, language` en SQL.

---

### Exercice 30

### Pour chaque categorie de lieux, donner le nombre moyen de commentaires par langue (reutiliser le resultat precedent)

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$unwind: "$reviews"},
    {$group: {
        _id: {category: "$category", language: "$reviews.language"},
        nb: {$sum: 1}
    }},
    {$group: {
        _id: "$_id.category",
        nb_moyen_par_langue: {$avg: "$nb"}
    }},
    {$sort: {nb_moyen_par_langue: -1}}
]);
```

**Resultat attendu :**
Le nombre moyen de commentaires par langue, pour chaque categorie.

**Explication :**
Double `$group`: le premier groupe par (categorie, langue), le second re-groupe par categorie et fait la moyenne des comptes. C'est l'equivalent d'une sous-requete agregee en SQL.

---

### Exercice 31

### Donner le nombre moyen de commentaires par lieu

**Reponse :**
```javascript noexec
db.paris.aggregate([
    {$project: {nb_reviews: {$size: "$reviews"}}},
    {$group: {_id: null, moyenne: {$avg: "$nb_reviews"}}}
]);
```

**Resultat attendu :**
```json
{ "_id": null, "moyenne": 3.42 }
```

**Explication :**
`{$size: "$reviews"}` calcule la taille du tableau reviews pour chaque document. Puis on fait la moyenne de toutes ces tailles avec `$avg`. `_id: null` signifie qu'on ne groupe pas -- on agrege sur toute la collection.

---

## Section 7 : Indexation 2D avec 2DSphere

Doc : http://docs.mongodb.org/manual/applications/geospatial-indexes/

---

### Preparation : Creation de l'index et recuperation des coordonnees

```javascript noexec
// Creer l'index spatial
db.paris.ensureIndex({"location.coord": "2dsphere"});

// Recuperer les coordonnees de reference
db.paris.find(
    {"name": {$in: [
        "Eiffel Tower Paris France",
        "Pyramide du Louvre",
        "Boulevard Saint-Michel"
    ]}},
    {"name": 1, "location.coord.coordinates": 1, "_id": 0}
);
```

Resultat:
```json
{ "name": "Pyramide du Louvre",
  "location": { "coord": { "coordinates": [2.3358714580536, 48.861018076911] } } }
{ "name": "Boulevard Saint-Michel",
  "location": { "coord": { "coordinates": [2.3421263694763, 48.849368645992] } } }
{ "name": "Eiffel Tower Paris France",
  "location": { "coord": { "coordinates": [2.3516704899184, 48.857770855496] } } }
```

Stocker dans des variables:

```javascript noexec
tourEiffel = [2.3516704899184, 48.857770855496];
louvre = [2.3358714580536, 48.861018076911];
saintMichel = [2.3421263694763, 48.849368645992];
```

---

### Exercice 32

### Afficher les noms et adresses des restaurants autour de Saint-Michel dans un rayon de 200m.

**Reponse :**
```javascript noexec
dist = 200;
near = {$near: {
    $geometry: {"type": "Point", "coordinates": saintMichel},
    $maxDistance: dist
}};

db.paris.find(
    {"location.coord": near, "category": "restaurant"},
    {"name": 1, "location.address": 1, "_id": 0}
);
```

**Resultat attendu :**
```json
{ "name": "Le Petit Chatelet", "location": { "address": "39 Rue de la Bucherie, Paris" } }
{ "name": "Bouillon Racine", "location": { "address": "3 Rue Racine, Paris" } }
...
```

**Explication :**
- `$near`: trouve les documents les plus proches d'un point
- `$geometry`: definit le point de reference en format GeoJSON
- `$maxDistance`: distance maximale en metres
- Les resultats sont tries du plus proche au plus eloigne
- Necessite l'index 2dsphere cree precedemment

---

### Exercice 33

### Afficher le nom des points d'interets (poi) compris dans le triangle "tour Eiffel - Louvre - Saint-Michel" avec l'operateur $geoWithin

**Reponse :**
```javascript noexec
triangle = [[tourEiffel, louvre, saintMichel, tourEiffel]];

db.paris.find(
    {
        "location.coord": {
            $geoWithin: {
                $geometry: {
                    "type": "Polygon",
                    "coordinates": triangle
                }
            }
        },
        "category": "poi"
    },
    {"name": 1, "_id": 0}
);
```

**Resultat attendu :**
```json
{ "name": "Musee d'Orsay" }
{ "name": "Assemblee Nationale" }
{ "name": "Palais de la Legion d'Honneur" }
...
```

**Explication :**
- `$geoWithin`: trouve les documents contenus dans une zone geographique
- Le triangle est une liste de points avec retour au point de depart (polygone ferme)
- La requete est une liste de polygones (d'ou le double crochet `[[...]]`)
- `"type": "Polygon"`: format GeoJSON standard

---

### Exercice 34

### Calculer le nombre de lieux par categorie dans cette zone

**Reponse :**
```javascript noexec
triangle = [[tourEiffel, louvre, saintMichel, tourEiffel]];

db.paris.aggregate([
    {$match: {
        "location.coord": {
            $geoWithin: {
                $geometry: {
                    "type": "Polygon",
                    "coordinates": triangle
                }
            }
        }
    }},
    {$group: {_id: "$category", nb: {$sum: 1}}},
    {$sort: {nb: -1}}
]);
```

**Resultat attendu :**
```json
{ "_id": "poi", "nb": 45 }
{ "_id": "restaurant", "nb": 38 }
{ "_id": "accommodation", "nb": 12 }
{ "_id": "attraction", "nb": 8 }
```

**Explication :**
On combine le filtre geospatial `$geoWithin` dans un pipeline aggregate avec `$group` pour compter par categorie. Le `$match` filtre d'abord les lieux dans le triangle, puis `$group` agrege par categorie.
