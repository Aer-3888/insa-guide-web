---
title: "TD2 -- Requetes SQL et Jointures"
sidebar_position: 2
---

# TD2 -- Requetes SQL et Jointures

> Source : TD2.pdf, Hugo TD 2.pdf
> Approfondissement des jointures, sous-requetes et agregations.

---

## Exercice 1 : Jointures avancees

### Q1 : Pour chaque etudiant, liste des professeurs qui lui enseignent

```sql
SELECT DISTINCT e.nom AS etudiant, p.nom AS professeur
FROM etudiant e
JOIN enseignementSuivi es ON e.etudId = es.etudId
JOIN professeur p ON es.profId = p.profId
ORDER BY e.nom, p.nom;
```

### Q2 : Etudiants qui ont le meme nom qu'un professeur

```sql
SELECT e.nom, e.prenom
FROM etudiant e
WHERE e.nom IN (SELECT p.nom FROM professeur p);

-- Alternative avec jointure
SELECT e.nom, e.prenom
FROM etudiant e
JOIN professeur p ON e.nom = p.nom;
```

### Q3 : Paires d'etudiants qui suivent au moins un cours commun

```sql
SELECT DISTINCT e1.nom AS etudiant1, e2.nom AS etudiant2
FROM enseignementSuivi es1
JOIN enseignementSuivi es2 ON es1.ensId = es2.ensId
    AND es1.etudId < es2.etudId  -- eviter les doublons (A,B) et (B,A)
JOIN etudiant e1 ON es1.etudId = e1.etudId
JOIN etudiant e2 ON es2.etudId = e2.etudId;
```

**Astuce :** `es1.etudId < es2.etudId` garantit chaque paire une seule fois et exclut les auto-paires.

---

## Exercice 2 : Sous-requetes

### Q4 : Etudiants inscrits a au moins un cours enseigne par le professeur P1

```sql
-- Avec IN
SELECT e.nom, e.prenom
FROM etudiant e
WHERE e.etudId IN (
    SELECT es.etudId
    FROM enseignementSuivi es
    WHERE es.profId = 'P1'
);

-- Avec EXISTS
SELECT e.nom, e.prenom
FROM etudiant e
WHERE EXISTS (
    SELECT 1
    FROM enseignementSuivi es
    WHERE es.etudId = e.etudId AND es.profId = 'P1'
);
```

### Q5 : Cours qui ne sont suivis par aucun etudiant

```sql
SELECT ens.ensId, ens.sujet
FROM enseignement ens
WHERE ens.ensId NOT IN (
    SELECT DISTINCT es.ensId FROM enseignementSuivi es
);

-- Alternative avec LEFT JOIN
SELECT ens.ensId, ens.sujet
FROM enseignement ens
LEFT JOIN enseignementSuivi es ON ens.ensId = es.ensId
WHERE es.etudId IS NULL;
```

### Q6 : Etudiant(s) inscrit(s) au plus grand nombre de cours

```sql
-- Methode 1 : sous-requete scalaire
SELECT e.nom, e.prenom, COUNT(DISTINCT es.ensId) AS nb_cours
FROM etudiant e
JOIN enseignementSuivi es ON e.etudId = es.etudId
GROUP BY e.etudId, e.nom, e.prenom
HAVING COUNT(DISTINCT es.ensId) = (
    SELECT MAX(nb) FROM (
        SELECT COUNT(DISTINCT ensId) AS nb
        FROM enseignementSuivi
        GROUP BY etudId
    ) AS sub
);

-- Methode 2 : ORDER BY + LIMIT (si un seul attendu)
SELECT e.nom, e.prenom, COUNT(DISTINCT es.ensId) AS nb_cours
FROM etudiant e
JOIN enseignementSuivi es ON e.etudId = es.etudId
GROUP BY e.etudId, e.nom, e.prenom
ORDER BY nb_cours DESC
LIMIT 1;
```

---

## Exercice 3 : Division relationnelle

### Q7 : Etudiants inscrits a TOUS les cours

```sql
-- Methode double NOT EXISTS
SELECT e.nom, e.prenom
FROM etudiant e
WHERE NOT EXISTS (
    SELECT ens.ensId
    FROM enseignement ens
    WHERE NOT EXISTS (
        SELECT *
        FROM enseignementSuivi es
        WHERE es.etudId = e.etudId AND es.ensId = ens.ensId
    )
);
```

**Lecture :** "Les etudiants pour lesquels il n'existe aucun cours auquel ils ne sont pas inscrits."

### Q8 : Professeurs qui enseignent TOUS les cours

```sql
SELECT p.nom, p.prenom
FROM professeur p
WHERE NOT EXISTS (
    SELECT ens.ensId
    FROM enseignement ens
    WHERE NOT EXISTS (
        SELECT *
        FROM enseignementSuivi es
        WHERE es.profId = p.profId AND es.ensId = ens.ensId
    )
);
```

---

## Exercice 4 : Algebre relationnelle vers SQL

### Q9 : Traduire `sigma_{sujet='BD'}(enseignement)`

```sql
SELECT * FROM enseignement WHERE sujet = 'BD';
```

### Q10 : Traduire `pi_{nom}(etudiant) - pi_{nom}(professeur)`

```sql
SELECT DISTINCT nom FROM etudiant
EXCEPT
SELECT DISTINCT nom FROM professeur;
```

**Resultat :** noms d'etudiants qui ne sont pas des noms de professeurs.

### Q11 : Traduire en algebre : "noms des profs qui enseignent a Alice"

```
pi_{nom}(
    professeur |x|
    sigma_{prenom='Alice'}(
        etudiant |x| enseignementSuivi
    )
)
```

Ou plus precisement :

```
pi_{p.nom}(
    sigma_{e.prenom='Alice'}(
        etudiant e |x|_{e.etudId = es.etudId} enseignementSuivi es
        |x|_{es.profId = p.profId} professeur p
    )
)
```

---

## Points cles a retenir

- Auto-jointure avec `<` pour eviter les paires dupliquees
- NOT IN vs LEFT JOIN IS NULL : les deux trouvent les "sans correspondance"
- Le double NOT EXISTS est la traduction SQL de la division
- Pour le "maximum parmi les groupes", utiliser une sous-requete avec MAX ou ORDER BY + LIMIT
