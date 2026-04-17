---
title: "Chapitre 3 -- Injections SQL"
sidebar_position: 3
---

# Chapitre 3 -- Injections SQL

> Source : 2026 SQL injections.pdf
> Objectif : comprendre le mecanisme des injections SQL, leurs variantes, et savoir s'en proteger

---

## 3.1 Concept de base

### Le probleme : les requetes dynamiques

Une application web construit souvent ses requetes SQL en concatenant des entrees utilisateur :

```php
// VULNERABLE : concatenation directe
$request = "SELECT name, forename, role
             FROM musicians
             WHERE band='$bandname'";
$result = mysql_query($request, $connection);
```

Si l'utilisateur entre une valeur contenant une apostrophe, il "sort" de la chaine et injecte du SQL arbitraire.

### Schema d'attaque

```
Utilisateur                Application Web              Base de donnees
     |                          |                            |
     | Entree: x' OR 1=1--     |                            |
     |------------------------->|                            |
     |                          | SELECT ... WHERE col='x'  |
     |                          |   OR 1=1--'               |
     |                          |--------------------------->|
     |                          |                            |
     |                          | (toutes les lignes)        |
     |                          |<---------------------------|
     | Affichage des donnees    |                            |
     |<-------------------------|                            |
```

---

## 3.2 Techniques d'injection

### Technique 1 : OR 1=1 (tautologie)

Rendre la condition WHERE toujours vraie :
```
Entree :  whatever' OR 1=1--
Requete : SELECT ... WHERE band='whatever' OR 1=1--'
```

Decomposition :
1. `whatever'` -- ferme l'apostrophe ouvrante
2. `OR 1=1` -- condition toujours vraie
3. `--` -- commente le reste (y compris l'apostrophe fermante)

**Variante sans commentaire :** `whatever' OR 'a'='a`

### Technique 2 : Champ numerique

```
URL : /show_me?user_id=0 OR 1=1
Requete : SELECT name FROM table WHERE id=0 OR 1=1
```
Pas besoin d'apostrophes pour les champs numeriques.

### Technique 3 : Contournement de login

```
Requete : SELECT * FROM users WHERE username='$name' AND password=sha1('$pass')

Attaque name : admin'--
Resultat    : SELECT * FROM users WHERE username='admin'--' AND password=...
```
Le `--` commente la verification du mot de passe.

### Technique 4 : UNION SELECT

Recuperer des donnees d'autres tables :
```
Entree : 0' UNION SELECT login,password,0 FROM users--
```
Conditions : meme nombre de colonnes, types compatibles.

### Technique 5 : Stacking (enchainement)

```
Entree : whatever'; DROP TABLE users--
```
Le `;` termine la requete et en commence une nouvelle.

### Technique 6 : Shell via MS-SQL

```sql
xp_cmdshell 'whoami'
```

---

## 3.3 Objectifs d'injection

```
Injection SQL
    +-- Login bypass : se connecter sans mot de passe
    +-- Vol de donnees : UNION SELECT pour d'autres tables
    +-- Modification : INSERT, UPDATE, DELETE via stacking
    +-- Execution de commandes : xp_cmdshell (MS-SQL)
    +-- Decouverte de schema : noms de tables et colonnes
```

---

## 3.4 Protections

### Principe fondamental

> **Never trust an input!** Ne jamais faire confiance a une entree utilisateur.

### TOUTES les entrees a verifier

`$_GET`, `$_POST`, `$_COOKIE`, `$_REQUEST`, `$_SERVER`, `$_ENV`, `$_FILES`, `$HTTP_USER_AGENT`, et meme les valeurs de la base de donnees (injection de second ordre).

### Hierarchie des protections

```
Meilleure protection
    v
1. Framework / ORM (Django, Rails, Laravel, SQLAlchemy)
2. Requetes preparees (bind variables)
3. Echapper + guillemets (mysqli_real_escape_string)
4. Forcer le type (settype, sprintf %d)
5. Whitelist
6. Regex
    v
Protection minimale
```

### Requetes preparees (RECOMMANDE)

```php
// SECURISE : separation code SQL / donnees
$stmt = $mysqli->prepare('SELECT usr, pwd FROM users WHERE usr=? AND pwd=?');
$stmt->bind_param('ss', $usr, $pwd);
$stmt->execute();
```

La base compile d'abord la requete, puis injecte les parametres sans les interpreter comme du SQL.

**Limitation** : les requetes preparees ne marchent PAS pour les noms de tables/colonnes/mots-cles SQL.

---

## 3.5 Exemple de DS (Sujet 2025)

**Requete d'authentification :**
```php
$req = "SELECT * FROM users WHERE name='" + $name + "' AND password='" + $pass + "'"
```

**Q1 : Que se passe-t-il si on met `'` comme nom ?**
Erreur SQL (apostrophe non fermee) -- revele la presence d'une injection.

**Q2 : $name pour se connecter sans mot de passe ?**
`admin'--` ou `' OR 1=1--`

**Q3 : Stockage des mots de passe ?**
En clair (pas de hachage) -- mauvaise pratique majeure.

---

## CHEAT SHEET -- Injection SQL

```
PAYLOADS CLASSIQUES :
  Login bypass (connu)    : admin'--
  Login bypass (inconnu)  : ' OR 1=1--
  Sans commentaire        : ' OR 'a'='a
  Champ numerique         : 0 OR 1=1
  Extraction              : 0' UNION SELECT col1,col2 FROM table--
  Destruction             : '; DROP TABLE users--

PROTECTIONS (ordre) :
  1. ORM / Framework
  2. Requetes preparees (bind_param)
  3. Echapper + guillemets
  4. Forcer le type
  5. Whitelist / regex

COMMENTAIRES SQL :
  -- (espace apres !)   Standard SQL
  #                      MySQL
  /* */                  Multi-lignes

PIEGES DS :
  - Champs numeriques : pas d'apostrophe
  - Echapper ne suffit pas toujours
  - Injection de second ordre (valeur lue depuis la BDD)
  - Espace obligatoire apres --
```
