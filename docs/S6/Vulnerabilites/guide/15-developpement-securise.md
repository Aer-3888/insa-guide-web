---
title: "Chapitre 15 -- Developpement securise"
sidebar_position: 15
---

# Chapitre 15 -- Developpement securise

> Objectif : maitriser les principes de developpement securise et les appliquer dans la conception logicielle

---

## 15.1 Principes fondamentaux

### Les trois regles du cours

1. **Faire moins confiance** : minimiser la trusted base
2. **Verifier les parametres** : en entree ET en sortie, au moment de l'usage
3. **Changer les configs par defaut** : mots de passe, a l'installation ET apres les mises a jour

### Les six idees les plus stupides en securite informatique

Le cours reference cet article classique de Marcus Ranum :

| Mauvaise idee | Explication |
|--------------|-------------|
| Autoriser par defaut | Autoriser par defaut au lieu d'interdire |
| Lister le "mal" | Lister le "mal" (liste noire) au lieu du "bien" (liste blanche) |
| Penetrer et corriger | Corriger les failles une par une au lieu de concevoir correctement |
| Le piratage, c'est cool | Glorifier l'attaque au lieu de la defense |
| Former les utilisateurs | Compter sur la formation des utilisateurs comme seule defense |
| Agir vaut mieux que ne rien faire | Agir sans reflexion prealable |

---

## 15.2 Validation des entrees

### Principe : ne jamais faire confiance a une entree

**Toutes** les entrees doivent etre validees :

```
Sources d'entrees non fiables :
    +-- Formulaires web (GET, POST)
    +-- Cookies
    +-- Headers HTTP (User-Agent, Referer)
    +-- Variables d'environnement
    +-- Fichiers uploades
    +-- Donnees de la base (injection de second ordre)
    +-- Reponses d'API tierces
    +-- Date et heure systeme
```

### Strategies de validation

```
Meilleure strategie
    v
1. Liste blanche (n'accepter que les valeurs connues)
2. Regex stricte (pattern matching)
3. Forcer le type (int, float, date)
4. Echapper les caracteres speciaux
5. Liste noire (rejeter les valeurs dangereuses)
    v
Pire strategie
```

### Exemple concret

```python noexec
# MAUVAIS : blacklist
def sanitize(input):
    return input.replace("'", "").replace(";", "")  # incomplet

# BON : whitelist
import re
def validate_ip(input):
    pattern = r'^([0-9]{1,3}\.){3}[0-9]{1,3}$'
    if not re.match(pattern, input):
        raise ValueError("Invalid IP address")
    return input

# MEILLEUR : requete preparee (pas de validation manuelle necessaire)
stmt = conn.prepare("SELECT * FROM users WHERE id = ?")
stmt.execute(user_id)
```

---

## 15.3 Encodage des sorties

### Principe : Never Trust an Output

Encoder les donnees avant de les inserer dans un contexte :

| Contexte | Encodage |
|---------|----------|
| HTML body | `&lt;` `&gt;` `&amp;` `&quot;` `&#x27;` |
| HTML attribut | Echapper + guillemets obligatoires |
| JavaScript | `\xHH` encoding ou JSON serialization |
| URL | Percent-encoding (`%20`, `%3C`, etc.) |
| SQL | Requetes preparees (pas d'encodage manuel) |
| Shell | Eviter les appels systeme (ou whitelist stricte) |

### Regles OWASP par contexte

```
Regle 0 : Ne jamais inserer de donnees non fiables SAUF dans des emplacements autorises
Regle 1 : Echapper HTML dans le body
Regle 2 : Echapper HTML dans les attributs
Regle 3 : Echapper JavaScript dans les valeurs JS
Regle 4 : Echapper CSS
Regle 5 : Echapper URL dans les parametres
Regle 6 : CSP comme filet de securite
```

---

## 15.4 Gestion des erreurs

### Ce qu'il ne faut PAS faire

```python noexec
# MAUVAIS : message d'erreur revelateur
try:
    user = db.query("SELECT * FROM users WHERE id=" + user_id)
except Exception as e:
    return f"Database error: {str(e)}"  # Revele la structure de la requete
```

### Ce qu'il faut faire

```python noexec
# BON : message generique + log detaille
import logging
try:
    user = db.query_prepared("SELECT * FROM users WHERE id=?", [user_id])
except Exception as e:
    logging.error(f"DB error for user_id={user_id}: {e}")  # Log interne
    return "An error occurred. Please try again."  # Message generique
```

### Principes

- Messages d'erreur generiques pour l'utilisateur
- Logs detailles cote serveur
- Ne jamais reveler : version du serveur, chemin des fichiers, requetes SQL, stack traces

---

## 15.5 OWASP Top 10 -- resume actionnable

| Rang | Categorie | Action de prevention |
|------|----------|---------------------|
| A01 | Controle d'acces defaillant | Verifier les autorisations cote serveur pour chaque requete |
| A02 | Defaillances cryptographiques | TLS partout, hash sale (bcrypt), pas de donnees sensibles en clair |
| A03 | Injection | Requetes preparees, validation d'entrees, encodage des sorties |
| A04 | Conception non securisee | Modelisation des menaces, principes de securite des la conception |
| A05 | Mauvaise configuration | Configs par defaut changees, headers de securite, pas de services inutiles |
| A06 | Composants vulnerables | Audit regulier des dependances, mises a jour |
| A07 | Defaillances d'authentification | MFA, rate limiting, sessions securisees |
| A08 | Defaillances d'integrite | Verification des signatures, deserialization securisee |
| A09 | Defaillances de journalisation | Logger les echecs d'authentification, les acces suspects |
| A10 | SSRF | Whitelist de destinations, validation d'URL |

---

## 15.6 Headers de securite HTTP

```
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 0  (desactive le filtre XSS du navigateur, CSP est meilleur)
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), camera=()
```

---

## 15.7 SDLC securise (cycle de vie securise)

```
Exigences        --> Modelisation des menaces
Conception       --> Principes de securite (moindre privilege, defense en profondeur)
Implementation   --> Standards de codage, revue de code
Tests            --> Tests de securite (SAST, DAST, pentest)
Deploiement      --> Durcissement, configuration securisee
Maintenance      --> Mises a jour, monitoring, reponse aux incidents
```

---

## 15.8 Recapitulatif des protections par type d'attaque

| Attaque | Protection cle | Phrase cle |
|---------|---------------|-----------|
| Injection SQL | Requetes preparees | "Ne jamais faire confiance a une entree" |
| XSS | Echapper les sorties + CSP | "Ne jamais faire confiance a une sortie" |
| CSRF | SameSite + token anti-CSRF | "Verifier l'origine" |
| Injection de commandes | Eviter les appels OS + whitelist | "Ne jamais faire confiance a une entree" |
| Debordement de tampon | strncpy + compilation securisee | "Verifier les tailles" |
| Homme du milieu | TLS + verification certificat | "Chiffrer + authentifier" |
| Attaque sur les mots de passe | bcrypt + sel + MFA | "Hash sale + MFA" |

---

## CHEAT SHEET -- Developpement securise

```
VALIDATION ENTREES :
  Liste blanche > Regex > Type > Echapper > Liste noire
  TOUTES les sources : GET, POST, cookies, headers, BDD, API

ENCODAGE SORTIES :
  HTML : &lt; &gt; &amp; &quot; &#x27;
  PHP : htmlspecialchars($val, ENT_QUOTES)
  JS : JSON.stringify() ou \xHH encoding

ERREURS :
  Utilisateur : message generique
  Serveur : log detaille
  JAMAIS : stack trace, chemin de fichier, requete SQL

HEADERS HTTP :
  CSP, X-Content-Type-Options, HSTS, X-Frame-Options

OWASP TOP 10 :
  A01 Controle d'acces : verifier les autorisations serveur
  A02 Crypto : TLS + bcrypt + pas de clair
  A03 Injection : requetes preparees + encodage des sorties
  A04 Conception : modelisation des menaces
  A05 Configuration : changer les defauts, supprimer le superflu
  A06 Composants : auditer et mettre a jour
  A07 Authentification : MFA + rate limiting
  A08 Integrite : signatures + deserialization securisee
  A09 Journalisation : logger les echecs
  A10 SSRF : whitelist de destinations

PRINCIPES :
  Moindre privilege, defense en profondeur, Kerckhoffs
  Pas de securite par l'obscurite
  La securite est un processus, pas un produit
```
