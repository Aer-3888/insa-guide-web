---
title: "Annale 2025 -- Analyse et corrige"
sidebar_position: 4
---

# Annale 2025 -- Analyse et corrige

> Source : sujet_2025.pdf (Secu 2025)
> Structure : exercices couvrant les deux parties du cours

---

## Structure du sujet 2025

| Exercice | Sujet | Points (estimes) |
|----------|-------|------------------|
| 1 | Qualification d'attaques + CVSS | ~4 pts |
| 2 | Injection SQL (login bypass + protections) | ~4 pts |
| 3 | Protocoles cryptographiques | ~6 pts |
| 4 | Mots de passe (systeme de Barbara) | ~4 pts |
| 5 | Questions diverses (cloud, principes) | ~2 pts |

---

## Exercice 1 : Qualifier des attaques

### Question 1.1 : Classification de logs

| Log | Type | Justification |
|-----|------|---------------|
| `/search="<SCRipt>alert(42)</SCRipt>"` | **XSS** | Balise script avec casse mixte |
| `/stuff.php?id=42 UNION SELECT 1, 1, null -` | **SQL** | Mot-cle UNION SELECT |
| `/test.php?traceroute="\|\| echo reboot > /etc/rc.local"` | **CMD** | Separateur `\|\|` + commande `echo` |
| `/set.php?WifiKey=ABC123` | **CSRF** | Action sur parametre sensible sans token |
| `/scripts/admin.php.bak` | **INFO** | Fichier de sauvegarde (reconnaissance) |
| `/images/lo%67o.png` | **INFO** | Encodage URL, exploration |
| `dostuff.php?dir=; dd if=/dev/urandom of=/dev/sda bs=4069;` | **CMD** | Separateur `;` + commande `dd` |
| `/login.php?user=Johnny' or 'b' = 'b` | **SQL** | Tautologie avec apostrophe |

### Question 1.2 : CVSS pour un scenario

Pour chaque vulnerabilite identifiee, donner les metriques CVSS pertinentes.

---

## Exercice 2 : Injection SQL

### Enonce

```php
$req = "SELECT * FROM users WHERE name = '" + $name
     + "' AND password = '" + $pass + "'"
```

### Question 2.1 : Que se passe-t-il avec `'` comme nom ?

```sql
SELECT * FROM users WHERE name = ''' AND password = '...'
```
**Erreur SQL** : apostrophe non fermee. Cela revele la presence d'une injection SQL.

### Question 2.2 : Se connecter en admin sans mot de passe

**Reponse 1** : `$name = admin'--`
```sql
SELECT * FROM users WHERE name = 'admin'--' AND password = '...'
```
Le `--` commente la verification du mot de passe.

**Reponse 2** : `$name = ' OR 1=1--`
```sql
SELECT * FROM users WHERE name = '' OR 1=1--' AND password = '...'
```
Retourne tous les utilisateurs (le premier est souvent l'admin).

### Question 2.3 : Stockage des mots de passe

Les mots de passe sont stockes **en clair** car la comparaison est directe dans la requete SQL. Il n'y a ni hachage ni sel.

Correction : utiliser `bcrypt` ou `Argon2` avec un sel unique par utilisateur, et comparer le hash en PHP/Python plutot que dans la requete SQL.

---

## Exercice 3 : Protocoles

### Type de questions

1. Verifier si le secret d'un nonce est garanti pour un role donne
2. Verifier la weak aliveness / agreement
3. Proposer une attaque si une propriete est violee
4. Corriger le protocole

### Methode

Appliquer systematiquement les regles d'inference de messages et le modele Dolev-Yao :
- L'attaquant connait toutes les cles publiques
- L'attaquant peut creer n'importe quel message avec ce qu'il connait
- L'attaquant peut intercepter, modifier, bloquer, inserer des messages

### Points cles

- **{m}pk(r)** : seul r peut dechiffrer, mais n'importe qui peut chiffrer
- **{m}sk(i)** : seul i peut signer, mais tout le monde peut verifier
- **Cle symetrique k(i,r)** : seuls i et r connaissent k, donc le secret est garanti pour les deux

---

## Exercice 4 : Systeme de mots de passe de Barbara

### Enonce

Barbara genere les mots de passe avec : `5^dn(E) mod 11` ou dn(E) est la date de naissance au format yyyymmdd.

### Question 4.1 : Deux etudiants peuvent-ils avoir le meme mot de passe ?

**Oui.** `5^x mod 11` ne prend que **10 valeurs possibles** (0 a 10, par le petit theoreme de Fermat). Avec plus de 10 etudiants, des collisions sont inevitables.

### Question 4.2 : Confidentialite du mot de passe

**Nulle.** Raisons :
1. Le systeme de calcul est connu (principe de Kerckhoffs : on ne peut pas compter sur le secret de la methode)
2. La date de naissance est souvent publique (reseaux sociaux, registres)
3. Seulement 10 valeurs possibles : brute force trivial sans meme connaitre la date

### Question 4.3 : Protection des donnees personnelles

Si la base est compromise :
- Les mots de passe en clair sont exposes
- A partir du mot de passe (5^dn mod 11), retrouver la date exacte n'est pas immediat (plusieurs dates donnent le meme resultat)
- MAIS l'espace des dates est petit (~40 000 dates possibles en 100 ans), donc une attaque par enumeration est triviale
- On peut retrouver la date de naissance avec certitude

---

## Exercice 5 : Questions diverses

### Type de questions

- Principes de securite (Kerckhoffs, defense en profondeur)
- Securite cloud (modeles de menaces, bonnes pratiques)
- Questions ouvertes sur des scenarios concrets

---

## Points cles a retenir de cette annale

1. **L'exercice 1** (classification) est le plus rapide -- le faire en premier
2. **L'exercice 2** (SQL) suit un schema previsible -- avoir les payloads classiques en tete
3. **L'exercice 3** (protocoles) est le plus long et vaut le plus de points
4. **L'exercice 4** (mots de passe) combine maths et securite -- penser a Kerckhoffs
5. **Toujours justifier** : une reponse sans justification vaut 0
