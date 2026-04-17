---
title: "TD1 -- Modele Relationnel et SQL de Base"
sidebar_position: 1
---

# TD1 -- Modele Relationnel et SQL de Base

> Source : TD1.pdf, Hugo TD 1.pdf
> Schema : etudiant, professeur, enseignement, enseignementSuivi

---

## Schema de la base

```sql
CREATE TABLE etudiant (
    etudId VARCHAR(3),      -- E1, E2, ...
    nom VARCHAR(30),
    prenom VARCHAR(30)
);

CREATE TABLE professeur (
    profId VARCHAR(3),      -- P1, P2, ...
    nom VARCHAR(30),
    prenom VARCHAR(30)
);

CREATE TABLE enseignement (
    ensId VARCHAR(3),
    sujet VARCHAR(50)
);

CREATE TABLE enseignementSuivi (
    ensId VARCHAR(3),       -- FK vers enseignement
    etudId VARCHAR(3),      -- FK vers etudiant
    profId VARCHAR(3)       -- FK vers professeur
);
```

---

## Exercice 1 : Requetes de base

### Q1 : Liste des prenoms et noms des etudiants

```sql
SELECT nom, prenom
FROM etudiant;
```

**Explication :** projection simple sur deux colonnes.

### Q2 : Professeurs dont le nom contient la lettre 'a'

```sql
SELECT nom, prenom
FROM professeur
WHERE nom LIKE '%a%';
```

**Explication :** `LIKE '%a%'` filtre les noms contenant 'a' n'importe ou. Le `%` remplace zero ou plusieurs caracteres.

**Exemples de resultats :** ARNALDI, GARCIA, MARCHAL, ...

### Q3 : Produit cartesien etudiant-professeur

```sql
SELECT etudId, profId
FROM etudiant, professeur;
```

**Explication :** sans clause WHERE, c'est un produit cartesien. Chaque etudiant est associe a chaque professeur.

**Nombre de lignes :** 73 etudiants x 25 professeurs = **1825 lignes**.

---

## Exercice 2 : Jointures

### Q4 : Etudiants et les cours qu'ils suivent

```sql
SELECT e.nom, e.prenom, ens.sujet
FROM etudiant e
JOIN enseignementSuivi es ON e.etudId = es.etudId
JOIN enseignement ens ON es.ensId = ens.ensId;
```

**Explication :** double jointure via la table de jonction `enseignementSuivi`.

### Q5 : Etudiants qui suivent le cours 'BD'

```sql
SELECT e.nom, e.prenom
FROM etudiant e
JOIN enseignementSuivi es ON e.etudId = es.etudId
JOIN enseignement ens ON es.ensId = ens.ensId
WHERE ens.sujet = 'BD';
```

### Q6 : Etudiants qui ne suivent aucun cours

```sql
SELECT e.nom, e.prenom
FROM etudiant e
LEFT JOIN enseignementSuivi es ON e.etudId = es.etudId
WHERE es.ensId IS NULL;
```

**Explication :** LEFT JOIN garde tous les etudiants. Ceux sans correspondance dans enseignementSuivi ont NULL pour es.ensId.

---

## Exercice 3 : Algebre relationnelle

### Q7 : Exprimer "etudiants inscrits en BD" en algebre relationnelle

```
pi_{nom, prenom}(
    sigma_{sujet = 'BD'}(
        etudiant |x| enseignementSuivi |x| enseignement
    )
)
```

**Decomposition :**
1. Jointure naturelle des 3 tables.
2. Selection des lignes ou sujet = 'BD'.
3. Projection sur nom et prenom.

### Q8 : Exprimer "etudiants inscrits a TOUS les cours" (division)

```
pi_{etudId, ensId}(enseignementSuivi) div pi_{ensId}(enseignement)
```

**En SQL :**

```sql
SELECT e.nom
FROM etudiant e
WHERE NOT EXISTS (
    SELECT ens.ensId
    FROM enseignement ens
    WHERE NOT EXISTS (
        SELECT * FROM enseignementSuivi es
        WHERE es.etudId = e.etudId AND es.ensId = ens.ensId
    )
);
```

---

## Exercice 4 : Agregations

### Q9 : Nombre d'etudiants par cours

```sql
SELECT ens.sujet, COUNT(DISTINCT es.etudId) AS nb_etudiants
FROM enseignement ens
JOIN enseignementSuivi es ON ens.ensId = es.ensId
GROUP BY ens.ensId, ens.sujet;
```

### Q10 : Cours ayant plus de 10 etudiants inscrits

```sql
SELECT ens.sujet, COUNT(DISTINCT es.etudId) AS nb_etudiants
FROM enseignement ens
JOIN enseignementSuivi es ON ens.ensId = es.ensId
GROUP BY ens.ensId, ens.sujet
HAVING COUNT(DISTINCT es.etudId) > 10;
```

### Q11 : Professeur qui enseigne le plus de cours differents

```sql
SELECT p.nom, p.prenom, COUNT(DISTINCT es.ensId) AS nb_cours
FROM professeur p
JOIN enseignementSuivi es ON p.profId = es.profId
GROUP BY p.profId, p.nom, p.prenom
ORDER BY nb_cours DESC
LIMIT 1;
```

---

## Points cles a retenir

- `LIKE '%a%'` : recherche par motif
- Produit cartesien = toutes les combinaisons (n x m)
- LEFT JOIN pour trouver les lignes "sans correspondance"
- La division repond a "X en relation avec TOUS les Y"
- DISTINCT dans COUNT pour eviter les doublons
