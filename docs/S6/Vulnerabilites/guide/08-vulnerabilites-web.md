---
title: "Chapitre 8 -- Vulnerabilites web avancees et OWASP Top 10"
sidebar_position: 8
---

# Chapitre 8 -- Vulnerabilites web avancees et OWASP Top 10

> Objectif : connaitre les categories OWASP et les vulnerabilites web au-dela de SQLi/XSS/CSRF

---

## 8.1 OWASP Top 10 (2021)

L'OWASP Top 10 est la reference pour les vulnerabilites web les plus critiques. Le cours y fait reference regulierement.

| Rang | Categorie | Description | Exemples du cours |
|------|----------|-------------|-------------------|
| A01 | **Controle d'acces defaillant** | Acces a des ressources non autorisees | Path traversal, IDOR |
| A02 | **Defaillances cryptographiques** | Mauvaise utilisation de la cryptographie | Mots de passe en clair, HTTP sans TLS |
| A03 | **Injection** | Injection de code dans un interprete | SQL, CMD, XSS |
| A04 | **Conception non securisee** | Defauts de conception | Protocoles vulnerables (NSPK) |
| A05 | **Mauvaise configuration** | Mauvaise configuration | Mots de passe par defaut, services inutiles |
| A06 | **Composants vulnerables** | Composants avec des vulnerabilites connues | Heartbleed (OpenSSL), ShellShock (Bash) |
| A07 | **Defaillances d'authentification** | Authentification defaillante | Sessions previsibles, brute force |
| A08 | **Defaillances d'integrite** | Donnees non verifiees | Deserialization, mises a jour non signees |
| A09 | **Defaillances de journalisation** | Journalisation insuffisante | Pas de logs d'authentification echouee |
| A10 | **SSRF** | Requetes forgees cote serveur | Le serveur fait des requetes vers des cibles internes |

---

## 8.2 SSRF (Server-Side Request Forgery)

### Concept

L'attaquant amene le serveur a effectuer des requetes HTTP vers des ressources internes (inaccessibles depuis l'exterieur).

### Schema d'attaque

```
Attaquant                Serveur web              Reseau interne
    |                        |                        |
    | GET /fetch?url=        |                        |
    | http://169.254.169.254 |                        |
    |----------------------->|                        |
    |                        | GET /latest/meta-data  |
    |                        |----------------------->|
    |                        |                        |
    |                        | (identifiants AWS)     |
    |                        |<-----------------------|
    | Reponse avec les       |                        |
    | identifiants           |                        |
    |<-----------------------|                        |
```

### Code vulnerable

```python noexec
# VULNERABLE : URL non validee
@app.route('/fetch')
def fetch():
    url = request.args.get('url')
    response = requests.get(url)  # Le serveur fait la requete
    return response.text
```

### Code corrige

```python noexec
# SECURISE : whitelist de domaines + validation
import urllib.parse

ALLOWED_HOSTS = ['api.trusted.com', 'cdn.trusted.com']

@app.route('/fetch')
def fetch():
    url = request.args.get('url')
    parsed = urllib.parse.urlparse(url)

    if parsed.hostname not in ALLOWED_HOSTS:
        return "Forbidden", 403

    if parsed.scheme not in ('http', 'https'):
        return "Forbidden", 403

    response = requests.get(url, timeout=5)
    return response.text
```

### Cas celebre

L'attaque contre Capital One en 2019 a exploite une SSRF pour acceder au service de metadonnees AWS (169.254.169.254), permettant de voler des cles d'acces IAM et d'extraire les donnees de 106 millions de clients.

---

## 8.3 Path Traversal (Directory Traversal)

### Concept

L'attaquant utilise `../` pour remonter dans l'arborescence de fichiers et acceder a des fichiers sensibles.

### Exemples

```
URL normale   : /images/logo.png
URL malicieuse : /images/../../../etc/passwd

Log du cours  : /../../../../../../etc/passwd  --> INFO (path traversal)
```

### Code vulnerable

```python noexec
# VULNERABLE : concatenation directe du chemin
@app.route('/download')
def download():
    filename = request.args.get('file')
    return send_file('/uploads/' + filename)
```

### Code corrige

```python noexec
# SECURISE : normalisation et verification
import os

UPLOAD_DIR = '/uploads'

@app.route('/download')
def download():
    filename = request.args.get('file')
    safe_path = os.path.normpath(os.path.join(UPLOAD_DIR, filename))

    if not safe_path.startswith(UPLOAD_DIR):
        return "Forbidden", 403

    return send_file(safe_path)
```

---

## 8.4 IDOR (Insecure Direct Object Reference)

### Concept

L'application expose un identifiant interne (ID numerique) que l'utilisateur peut modifier pour acceder a des ressources d'autres utilisateurs.

```
URL normale   : /api/orders/123      (ma commande)
URL modifiee  : /api/orders/124      (la commande de quelqu'un d'autre)
```

### Protection

Toujours verifier que l'utilisateur authentifie est autorise a acceder a la ressource demandee.

---

## 8.5 Deserialisation non securisee

### Concept

Un objet serialise (JSON, XML, binaire) est reconstruit sans verification. Si l'attaquant controle les donnees serialisees, il peut injecter des objets arbitraires.

### Impact

- Execution de code a distance
- Elevation de privileges
- Deni de service

### Protection

- Ne jamais deserialiser de donnees non fiables
- Utiliser des formats simples (JSON) plutot que des formats binaires
- Valider le schema avant la deserialization

---

## 8.6 Recapitulatif OWASP et cours

| Vulnerabilite du cours | Categorie OWASP | Chapitre |
|----------------------|-----------------|----------|
| Injection SQL | A03 Injection | Ch. 3 |
| XSS | A03 Injection | Ch. 4 |
| CSRF | A01 Controle d'acces defaillant | Ch. 4 |
| Injection de commandes | A03 Injection | Ch. 5 |
| Mots de passe en clair | A02 Defaillances cryptographiques | Ch. 9 |
| Protocole NSPK | A04 Conception non securisee | Ch. 12 |
| Mot de passe par defaut | A05 Mauvaise configuration | Ch. 1 |
| OpenSSL Heartbleed | A06 Composants vulnerables | Ch. 1 |
| Detournement de session (XSS) | A07 Defaillances d'authentification | Ch. 4 |
| SSRF | A10 SSRF | Ce chapitre |

---

## CHEAT SHEET -- Vulnerabilites web et OWASP

```
OWASP TOP 10 (2021) :
  A01: Controle d'acces defaillant    (CSRF, IDOR, path traversal)
  A02: Defaillances cryptographiques (mdp en clair, HTTP sans TLS)
  A03: Injection                     (SQL, CMD, XSS)
  A04: Conception non securisee      (protocoles defaillants)
  A05: Mauvaise configuration        (mdp par defaut)
  A06: Composants vulnerables        (Heartbleed, ShellShock)
  A07: Defaillances d'authentification (sessions previsibles)
  A08: Defaillances d'integrite      (deserialization)
  A09: Defaillances de journalisation (pas de logs)
  A10: SSRF                          (requetes forgees cote serveur)

SSRF :
  Le SERVEUR fait une requete vers une cible interne
  Protection : whitelist de domaines + validation de schema

PATH TRAVERSAL :
  ../../../etc/passwd
  Protection : os.path.normpath + verification de prefixe

IDOR :
  Modification d'un ID pour acceder aux donnees d'autrui
  Protection : verification d'autorisation cote serveur
```
