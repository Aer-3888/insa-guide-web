---
title: "Exercices -- Injection SQL"
sidebar_position: 3
---

# Exercices -- Injection SQL

> Following teacher instructions from: S6/Vulnerabilites/data/moodle/guide/02_injection_sql.md
> Source du cours : 2026 SQL injections.pdf

---

## Exercice 1 : Comprendre le mecanisme de l'injection

### Le code suivant est-il vulnerable ? Si oui, montrez le payload et la requete resultante.

**Code :**
```php noexec
$connection = mysql_connect(...);
$request = "SELECT name, forename, role
             FROM musicians
             WHERE band='$bandname'";
$result = mysql_query($request, $connection);
```

**Answer:**

Oui, injection possible. La variable `$bandname` est concatenee directement dans la requete SQL sans aucune protection.

**Entree normale :**
```
$bandname = Eluveitie
Requete : SELECT name, forename, role FROM musicians WHERE band='Eluveitie'
Resultat : OK
```

**Entree declenchant une erreur :**
```
$bandname = 'Fi(sch)er
Requete : SELECT name, forename, role FROM musicians WHERE band=''Fi(sch)er'
Resultat : ERREUR SQL (apostrophe non fermee)
```

**Payload d'injection :**
```
$bandname = whatever' OR 1=1--
Requete : SELECT name, forename, role FROM musicians
          WHERE band='whatever' OR 1=1--'
```

Decomposition :
1. `whatever'` -- ferme l'apostrophe ouvrante de la chaine `band='`
2. `OR 1=1` -- ajoute une condition toujours vraie
3. `--` -- commente l'apostrophe fermante et tout le reste

**Variante sans commentaire :**
```
$bandname = whatever' OR 'a'='a
Requete : SELECT name, forename, role FROM musicians
          WHERE band='whatever' OR 'a'='a'
```

Ici, la derniere apostrophe de la requete originale ferme naturellement la chaine `'a`.

**Security explanation:**

La vulnerabilite vient de la concatenation non securisee d'entrees utilisateur dans le SQL. L'attaquant "sort" de la chaine de caracteres pour injecter du code SQL arbitraire. La correction est d'utiliser des requetes preparees :
```php noexec
$stmt = $mysqli->prepare("SELECT name, forename, role FROM musicians WHERE band=?");
$stmt->bind_param("s", $bandname);
$stmt->execute();
```

---

## Exercice 2 : Injection sur champ numerique

### Le code suivant est-il vulnerable ? Quelle est la particularite ?

**Code :**
```java noexec
String query = "SELECT name FROM table WHERE id="
             + request.getParameter("user_id");
```

**Answer:**

Oui, injection possible sur un champ numerique.

**Entree normale :**
```
URL : /show_me?user_id=1337
Requete : SELECT name FROM table WHERE id=1337
```

**Payload :**
```
URL : /show_me?user_id=0 OR 1=1
Requete : SELECT name FROM table WHERE id=0 OR 1=1
```

**Particularite :** pas besoin d'apostrophe car le champ est numerique. C'est un piege classique en DS -- on n'a pas besoin de "sortir" d'une chaine de caracteres.

**Security explanation:**

La protection par echappement des apostrophes ne protege PAS les champs numeriques. Pour se proteger :
- Forcer le type avec `settype($offset, 'integer')` ou `sprintf("%d", $id)`
- Utiliser des requetes preparees : `$stmt->bind_param("i", $id)`

---

## Exercice 3 : Contournement de login (sujet DS 2025, Q2)

### Requete d'authentification :
```php noexec
$req = "SELECT * FROM users WHERE name = '" + $name
     + "' AND password = '" + $pass + "'"
```

### Q2.1 : Que se passe-t-il si on met juste `'` comme nom ?

**Answer:**

La requete devient :
```sql noexec
SELECT * FROM users WHERE name = ''' AND password = '...'
```

Erreur SQL : apostrophe non fermee. Cela revele la presence d'une injection SQL. Le message d'erreur confirme que l'entree est directement concatenee dans la requete.

### Q2.2 : Quel $name pour se connecter en admin sans mot de passe ?

**Answer:**

**Payload :** `$name = admin'--`, `$pass = n'importe quoi`

```sql noexec
SELECT * FROM users WHERE name = 'admin'--' AND password = 'n'importe quoi'
                               ^^^^^^^
                               Le -- commente tout le reste
```

Trace d'execution :
1. Le SGBD parse la requete
2. `WHERE name='admin'` --> filtre sur le nom admin
3. `--' AND password='...'` --> ignore (commentaire SQL)
4. Retourne l'utilisateur admin (si il existe)
5. L'application considere l'authentification reussie

### Q2.3 : Se connecter sans connaitre aucun login

**Answer:**

**Payload :** `$name = ' OR 1=1--`, `$pass = x`

```sql noexec
SELECT * FROM users WHERE name = '' OR 1=1--' AND password = 'x'
                               ^^^^^^^^^^
                       Chaine vide OU condition toujours vraie
```

Retourne TOUS les utilisateurs. L'application prend generalement le premier (souvent l'admin, car c'est le premier cree).

### Q2.4 : Variante sans commentaire

**Answer:**

**Payload :** `$name = ' OR 'a'='a`, `$pass = ' OR 'a'='a`

```sql noexec
SELECT * FROM users WHERE name='' OR 'a'='a' AND password='' OR 'a'='a'
```

Chaque condition `'a'='a'` est toujours vraie. L'apostrophe fermante originale complete naturellement la chaine.

### Q2.5 : Que peut-on dire du stockage des mots de passe ?

**Answer:**

Les mots de passe sont stockes en clair (pas de hachage) puisque la comparaison est directe dans la requete SQL : `password = '$pass'`. Un stockage securise utiliserait :
```sql noexec
SELECT * FROM users WHERE name = ? AND password_hash = SHA256(CONCAT(?, salt))
```

Avec un hash sale, meme si la base est compromise, les mots de passe ne sont pas directement lisibles.

**Security explanation:**

Le stockage en clair des mots de passe est une faute grave. Les mots de passe doivent TOUJOURS etre stockes sous forme de hash sale (bcrypt, scrypt, Argon2). La comparaison ne se fait jamais en SQL directement mais cote application apres recuperation du hash.

---

## Exercice 4 : UNION SELECT

### La requete affiche les musiciens d'un groupe :
```php noexec
$req = "SELECT name, forename, role FROM musicians WHERE band='" . $band . "'";
```

### Q1 : Trouver le nombre de colonnes

**Answer:**

**Methode par ORDER BY :**
```
$band = ' ORDER BY 1--     (OK si >= 1 colonne)
$band = ' ORDER BY 2--     (OK si >= 2 colonnes)
$band = ' ORDER BY 3--     (OK si >= 3 colonnes)
$band = ' ORDER BY 4--     (ERREUR --> 3 colonnes)
```

**Methode par UNION NULL :**
```
$band = ' UNION SELECT null--          (erreur)
$band = ' UNION SELECT null,null--     (erreur)
$band = ' UNION SELECT null,null,null-- (OK --> 3 colonnes)
```

### Q2 : Extraire les logins et mots de passe de la table users

**Answer:**

```
$band = 0' UNION SELECT login, password, 0 FROM users--
```

Requete resultante :
```sql noexec
SELECT name, forename, role FROM musicians WHERE band='0'
UNION SELECT login, password, 0 FROM users--'
```

Trace d'execution :
1. Premier SELECT : `WHERE band='0'` --> aucun resultat (pas de groupe '0')
2. UNION : ajoute les resultats du second SELECT
3. Le second SELECT retourne login, password, 0 de la table users
4. L'application affiche les donnees comme si c'etaient des musiciens
5. La colonne "name" affiche les logins, "forename" affiche les mots de passe

### Q3 : Decouvrir les noms de tables (MySQL)

**Answer:**

```
$band = ' UNION SELECT table_name, table_schema, 0 FROM information_schema.tables--
```

`information_schema` est une meta-base presente sur tous les SGBD majeurs qui contient la structure de toutes les bases et tables.

### Q4 : Decouvrir les colonnes d'une table

**Answer:**

```
$band = ' UNION SELECT column_name, data_type, 0 FROM information_schema.columns WHERE table_name='users'--
```

**Security explanation:**

Le UNION SELECT est l'attaque SQL la plus dangereuse car elle permet d'extraire des donnees de n'importe quelle table de la base. Conditions : le nombre de colonnes doit correspondre et les types doivent etre compatibles. La protection est l'utilisation de requetes preparees.

---

## Exercice 5 : Enchainement de requetes (stacking)

### Montrez comment un attaquant pourrait modifier ou detruire des donnees

**Answer:**

```
$band = whatever';DROP TABLE users--
```

Requete :
```sql noexec
SELECT name,forename,role FROM musicians WHERE band='whatever';
DROP TABLE users--'
```

Le point-virgule termine la premiere requete et en commence une nouvelle. L'attaquant peut executer `INSERT`, `UPDATE`, `DELETE` ou meme `DROP TABLE`.

**Security explanation:**

Le stacking est possible sur certains SGBD (MySQL avec `mysqli_multi_query`, MS-SQL) mais pas tous. Sur MS-SQL, si `xp_cmdshell` est active, l'attaquant peut meme obtenir un shell systeme :
```sql noexec
xp_cmdshell 'whoami'
```

---

## Exercice 6 : Requete preparee -- Pourquoi est-ce securise ?

### Expliquez pourquoi le code suivant n'est PAS vulnerable

**Code :**
```php noexec
$stmt = $mysqli->prepare("SELECT * FROM users WHERE name=?");
$stmt->bind_param("s", $_GET['name']);
```

**Answer:**

Le `?` est un placeholder. La base de donnees compile d'abord le squelette de requete (la structure SQL), puis injecte le parametre comme une DONNEE, jamais comme du CODE SQL.

Si l'utilisateur entre `' OR 1=1--`, la requete effective est :
```sql noexec
SELECT * FROM users WHERE name = '\\' OR 1=1--'
```

L'entree est traitee comme la chaine literale `' OR 1=1--`, pas comme du SQL. La separation code/donnees empeche toute injection.

**Limitation :** les requetes preparees ne fonctionnent PAS pour les noms de tables, colonnes ou mots-cles SQL dynamiques :
```php noexec
// CECI NE MARCHE PAS :
$stmt = $mysqli->prepare('SELECT col1,col2 FROM a_table ORDER BY ?');
```

Pour un ORDER BY dynamique, utiliser une whitelist stricte :
```php noexec
$allowed_columns = ['date', 'title', 'author'];
$order = in_array($_GET['order'], $allowed_columns) ? $_GET['order'] : 'date';
```

---

## Exercice 7 : Distinguer SQL vs CMD (sujet DS 2020, exercice 2)

### On realise les tests suivants sur un formulaire de login :

| Test | Login | Reponse du serveur |
|------|-------|--------------------|
| 1 | `' OR 'a'='a` | `-bash: OR: command not found` |
| 2 | `admin` / `admin` | `Login failed for admin` |
| 3 | `' ; /bin/sleep 10` | Application met 10 secondes |
| 4 | `' ; /bin/cat /etc/shadow` | `Permission denied` |
| 5 | `admin` / `nawak` | `Login failed: password nawak incorrect for admin` |

### Analysez chaque test. Quel type d'injection est present ? Quelle autre vulnerabilite voyez-vous ?

**Answer:**

**Test 1 :** Le message `-bash: OR: command not found` vient du shell bash, PAS d'un moteur SQL. Cela signifie que le login est passe directement au shell (via `system()` ou equivalent), pas a une requete SQL.

**Verdict : injection de commande, pas injection SQL.**

Commande probable cote serveur :
```bash noexec
system("echo 'Checking login: " + $login + "'");
# ou
system("/usr/bin/check_login '" + $login + "'");
```

**Test 3 :** Le `sleep 10` s'execute avec succes (delai de 10 secondes). Confirme l'injection de commande.

**Test 4 :** `cat /etc/shadow` echoue avec "Permission denied" car le processus web n'a pas les privileges root. Mais l'injection a bien fonctionne (la commande a ete executee).

**Test 5 :** Le message d'erreur revele le mot de passe saisi en clair (`password nawak incorrect`). C'est une **fuite d'information** (information disclosure). Un message d'erreur ne doit JAMAIS afficher les credentials -- il devrait dire simplement "Login ou mot de passe incorrect".

**Security explanation:**

La methode pour distinguer une injection SQL d'une injection de commande est de lire le message d'erreur :
- Erreur SQL : `You have an error in your SQL syntax`, `ORA-01756`
- Erreur bash : `-bash: command not found`, `Permission denied`, `/bin/sh: syntax error`

Protections contre l'injection de commande :
1. Eviter les appels systeme (utiliser les fonctions natives du langage)
2. Whitelist par regex stricte (ex: `^([0-9]{1,3}\.){3}[0-9]{1,3}$` pour une IP)
3. Ne JAMAIS concatener d'entrees utilisateur dans un appel `system()`

---

## Exercice 8 : Injection de second ordre

### Un utilisateur s'enregistre avec le nom `admin'--`. Ce nom est stocke en base (protege par requete preparee a l'insertion). Plus tard, le systeme lit ce nom et l'utilise dans une requete dynamique. Y a-t-il un probleme ?

**Answer:**

**Etape 1 : Insertion (securisee)**
```php noexec
$stmt = $mysqli->prepare("INSERT INTO users (name, ...) VALUES (?, ...)");
$stmt->bind_param("s", "admin'--");
// Stocke "admin'--" en base sans probleme
```

**Etape 2 : Lecture et reutilisation (VULNERABLE)**
```php noexec
$result = $mysqli->query("SELECT name FROM users WHERE id=42");
$name = $result['name'];  // $name = "admin'--"

// Puis utilise dans une autre requete SANS protection
$req = "SELECT * FROM orders WHERE customer='" . $name . "'";
// Requete: SELECT * FROM orders WHERE customer='admin'--'
// INJECTION !
```

**Security explanation:**

Meme les valeurs provenant de la base de donnees peuvent contenir du SQL malicieux. Le principe "Never trust an input" s'applique a TOUTES les sources de donnees, y compris la base elle-meme. Il faut proteger TOUTES les requetes dynamiques, pas seulement celles qui utilisent directement des parametres HTTP.

---

## Exercice 9 : Proteger une application -- Hierarchie des protections

### Classez les protections suivantes de la meilleure a la moins bonne

**Answer:**

```
Meilleure protection
    |
    v
1. Eviter les requetes dynamiques (framework/ORM : Django, Rails, Laravel)
2. Requetes preparees (bind variables / bind_param)
3. Echapper + guillemets (mysqli_real_escape_string)
4. Forcer le type (settype, sprintf %d)
5. Verifier avec une whitelist
6. Verifier avec une regex
    |
    v
Protection minimale (mieux que rien)
```

**Pourquoi l'echappement seul n'est PAS parfait :**
```php noexec
$safe = str_replace("'", "''", $_GET['name']);
```
- Des sequences d'echappement (`\`) peuvent contourner la protection
- Des injections sur des encodages multi-octets (GBK, SJIS) peuvent contourner le remplacement
- Des conditions de longueur (troncature) peuvent casser l'echappement
- Cela ne protege PAS les champs numeriques

**Security explanation:**

Le principe fondamental est : **"Never trust an input!"** Verifier TOUTES les entrees signifie : `$_GET`, `$_POST`, `$_COOKIE`, `$_REQUEST`, `$_SERVER`, `$_ENV`, `$_FILES`, `$HTTP_USER_AGENT`, et meme les valeurs provenant de la base de donnees.

---

## Pieges courants en DS

1. **Oublier les champs numeriques** : pas besoin d'apostrophe pour `WHERE id=0 OR 1=1`
2. **Penser que l'echappement suffit** : doubler les quotes n'est pas parfait
3. **Ignorer l'injection de second ordre** : une valeur lue depuis la DB peut contenir du SQL
4. **Confondre `--` et `#`** : `--` est le commentaire SQL standard, `#` fonctionne sur MySQL
5. **Oublier l'espace apres `--`** : en SQL standard, `--` doit etre suivi d'un espace
6. **Confondre SQL et CMD** : lire le message d'erreur (erreur SQL vs erreur bash)
7. **Oublier que UNION necessite le meme nombre de colonnes** : utiliser ORDER BY pour trouver le nombre
