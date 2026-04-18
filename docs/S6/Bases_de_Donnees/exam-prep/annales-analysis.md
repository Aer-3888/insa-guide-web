---
title: "Analyse des Annales -- Bases de Donnees (2013-2024)"
sidebar_position: 2
---

# Analyse des Annales -- Bases de Donnees (2013-2024)

> Analyse de 9 annees de sujets pour identifier les motifs et exercices recurrents.

---

## Vue d'ensemble des sujets

| Annee | DF/Normalisation | SQL | XML/XQuery | OLAP | NoSQL |
|-------|:---:|:---:|:---:|:---:|:---:|
| 2013 | Oui | Oui | Oui | -- | -- |
| 2014 | Oui | Oui | Oui | -- | -- |
| 2015 | Oui | Oui | Oui | Oui | -- |
| 2016 | Oui | Oui | Oui | -- | -- |
| 2017 | Oui | Oui | Oui | Oui | -- |
| 2019 | Oui | Oui | Oui | -- | Oui |
| 2021 | Oui | Oui | Oui | -- | Oui |
| 2022 | Oui | Oui | Oui | Oui | Oui |
| 2024 | Oui | Oui | Oui | -- | Oui |

**Constat :** DF/Normalisation et SQL sont dans **100%** des DS. XML est present dans tous les sujets. OLAP et NoSQL alternent ou sont combines.

---

## Exercices types par theme

### Theme 1 : DF et Normalisation

#### Type A : Calcul de fermeture (presente dans 9/9 DS)

**Enonce typique :** Soit R(A, B, C, D, E) avec F = { AB -> C, C -> D, D -> E, B -> D }. Calculer {AB}+.

**Solution methodique :**

| Etape | Resultat | DF | Ajout |
|-------|----------|-----|-------|
| Init | {A, B} | -- | -- |
| 1 | {A, B} | AB -> C | C |
| 2 | {A, B, C} | C -> D | D |
| 3 | {A, B, C, D} | D -> E | E |
| 4 | {A, B, C, D, E} | B -> D | (deja present) |
| Final | {A, B, C, D, E} | stable | -- |

**Attention :** toujours iterer jusqu'a stabilite. Montrer chaque etape.

#### Type B : Cles candidates (presente dans 9/9 DS)

**Enonce typique :** Trouver toutes les cles candidates de R(A, B, C, D, E) avec F = { A -> BC, D -> E, BC -> A }.

**Solution :**

1. Attributs jamais en partie droite : **D** (obligatoire dans toute cle).
2. {A, D}+ : A -> BC, D -> E. {A, D}+ = {A, B, C, D, E}. Super-cle. Minimale ? A seul : {A}+ = {A, B, C}. Pas tous. D seul : {D}+ = {D, E}. Non. **{A, D} est cle candidate.**
3. Chercher d'autres : {B, C, D}+ : BC -> A, A -> BC (deja), D -> E. {B, C, D}+ = {A, B, C, D, E}. Super-cle. {B, D}+ : pas de DF qui part de B seul. {B, D}+ = {B, D, E}. Non. {C, D}+ : pas de DF depuis C seul. {C, D}+ = {C, D, E}. Non. {B, C, D} minimale ? {B, C}+ sans D = {A, B, C}. Pas tous. **{B, C, D} est cle candidate.**

**Cles candidates : {A, D} et {B, C, D}**

#### Type C : Couverture minimale (presente dans ~7/9 DS)

**Methode :**
1. Decomposer les parties droites.
2. Reduire les parties gauches (tester si un attribut est superflu).
3. Supprimer les DF redondantes.

#### Type D : Decomposition 3NF par synthese (presente dans ~7/9 DS)

**Methode :** couverture minimale -> une relation par partie gauche -> verifier la cle.

#### Type E : BCNF avec perte de DF (presente dans ~4/9 DS)

**Point a surveiller :** toujours mentionner si la decomposition BCNF perd des DF.

---

### Theme 2 : SQL

#### Type A : Requete avec jointure (presente dans 9/9 DS)

**Enonce typique :** "Donner le nom des clients qui ont passe au moins une commande."

```sql noexec
SELECT DISTINCT c.nom
FROM client c
JOIN commande co ON c.clientId = co.clientId;
```

#### Type B : Sous-requete avec agregation (presente dans ~8/9 DS)

**Enonce typique :** "Donner le nom des clients dont le total des commandes depasse la moyenne."

```sql noexec
SELECT c.nom, SUM(co.montant) AS total
FROM client c
JOIN commande co ON c.clientId = co.clientId
GROUP BY c.clientId, c.nom
HAVING SUM(co.montant) > (SELECT AVG(montant) FROM commande);
```

#### Type C : Division (presente dans ~5/9 DS)

**Enonce typique :** "Quels clients ont achete TOUS les produits ?"

```sql noexec
SELECT c.nom
FROM client c
WHERE NOT EXISTS (
    SELECT p.produitId
    FROM produit p
    WHERE NOT EXISTS (
        SELECT * FROM commande co
        WHERE co.clientId = c.clientId
          AND co.produitId = p.produitId
    )
);
```

#### Type D : Algebre relationnelle (presente dans ~6/9 DS)

**Enonce typique :** "Exprimer en algebre relationnelle : noms des clients ayant commande le produit P1."

```
pi_{nom}(
    sigma_{produitId = 'P1'}(
        client |x|_{client.clientId = commande.clientId} commande
    )
)
```

---

### Theme 3 : XML / XQuery

#### Type A : Ecrire une DTD (presente dans ~8/9 DS)

**Points a verifier :**
- Cardinalites (+, *, ?)
- ID/IDREF pour les references
- #REQUIRED vs #IMPLIED

#### Type B : XPath (presente dans ~8/9 DS)

**Enonce typique :** "Ecrire l'expression XPath pour obtenir les titres des livres publies apres 2000."

```
//livre[annee > 2000]/titre
```

#### Type C : XQuery FLWOR (presente dans ~7/9 DS)

**Enonce typique :** "Ecrire une requete XQuery qui retourne pour chaque auteur, la liste de ses livres."

```xquery
for $auteur in distinct-values(doc("biblio.xml")//auteur/nom)
return <auteur nom="{ $auteur }">
{
    for $livre in doc("biblio.xml")//livre[auteur/nom = $auteur]
    return <titre>{ $livre/titre/text() }</titre>
}
</auteur>
```

---

### Theme 4 : OLAP / NoSQL

#### Type A : Schema en etoile (presente quand OLAP est au programme)

**Enonce typique :** "Concevoir un schema en etoile pour analyser les inscriptions des etudiants."

**Solution :** Identifier :
- Table de faits : Inscription (mesures : note, nombre de credits)
- Dimensions : Etudiant, Cours, Professeur, Temps (semestre, annee)

#### Type B : ROLLUP / CUBE (presente dans ~3/9 DS)

**Enonce typique :** "Ecrire une requete ROLLUP pour obtenir les sous-totaux par region et par annee."

#### Type C : Comparaison SQL vs NoSQL (presente dans ~4/9 DS)

**Enonce typique :** "Pour chacun des scenarios suivants, choisir la technologie la plus adaptee et justifier."

---

## Analyse du sujet 2024 (le plus recent)

Le sujet 2024 (BD-3INFO-mai24.pdf) suit la structure classique :

### Partie 1 : Dependances fonctionnelles
- Calculer des fermetures
- Trouver les cles candidates
- Couverture minimale
- Decomposition 3NF
- **Nouveau :** verification detaillee de chaque etape avec justification

### Partie 2 : SQL
- Requetes sur un schema de gestion (clients, commandes, produits)
- Jointures, GROUP BY, sous-requetes
- Division relationnelle

### Partie 3 : XML
- DTD a ecrire
- XPath
- XQuery FLWOR

### Partie 4 : NoSQL
- Questions theoriques (CAP, ACID vs BASE)
- Modelisation Cassandra
- Requetes MongoDB ou Cypher

---

## Erreurs les plus frequentes (d'apres les corrections)

| Erreur | Frequence | Comment eviter |
|--------|-----------|---------------|
| Arreter la fermeture trop tot | Tres haute | Toujours iterer jusqu'a stabilite |
| Oublier les attributs jamais a droite dans la cle | Haute | Les lister systematiquement |
| Couverture minimale dans le mauvais ordre | Haute | Decomposer -> Reduire -> Supprimer |
| NULL = NULL dans SQL | Haute | Utiliser IS NULL |
| NOT IN avec NULL dans la sous-requete | Moyenne | Ajouter WHERE ... IS NOT NULL |
| Oublier DISTINCT | Moyenne | Verifier si les doublons sont possibles |
| Oublier text() en XQuery | Haute | Toujours ajouter /text() pour le contenu |
| Oublier les { } en XQuery | Haute | Entourer les expressions evaluees |
| SELECT sans GROUP BY en agregation | Moyenne | Toute colonne non agregee doit etre dans GROUP BY |

---

## Exercices d'entrainement recommandes

### Priorite haute (reviennent a chaque DS)

1. **Fermeture + cles candidates** : faire au moins 5 exercices differents.
2. **Decomposition 3NF** : maitriser l'algorithme de synthese.
3. **SQL avec GROUP BY + HAVING** : 3-4 exercices.
4. **Division en SQL** : savoir ecrire le double NOT EXISTS sans hesiter.
5. **DTD + XQuery FLWOR** : 2-3 exercices.

### Priorite moyenne

6. Couverture minimale : 3 exercices.
7. Decomposition BCNF : 2 exercices.
8. Schema en etoile : 1-2 exercices.
9. ROLLUP vs CUBE : comprendre la difference.
10. Requetes Cassandra/Neo4j/MongoDB basiques.

### Sources d'exercices

- **TD3-4** : exercices de DF et normalisation avec solutions
- **TD1-2** : exercices SQL
- **TD5** : XML
- **TD6** : OLAP
- **TD7** : NoSQL
- **Annales 2024** (correction disponible) : le meilleur entrainement
