---
title: "Chapitre 1 : HTTP et fondamentaux du Web"
sidebar_position: 1
---

# Chapitre 1 : HTTP et fondamentaux du Web

## Table des matieres

1. [Le Web : concepts de base](#1-le-web--concepts-de-base)
2. [Le protocole HTTP](#2-le-protocole-http)
3. [Methodes HTTP (verbes)](#3-methodes-http-verbes)
4. [Codes de statut HTTP](#4-codes-de-statut-http)
5. [En-tetes HTTP](#5-en-tetes-http)
6. [Structure d'une URL](#6-structure-dune-url)
7. [REST : principes architecturaux](#7-rest--principes-architecturaux)
8. [Architecture client-serveur](#8-architecture-client-serveur)
9. [Pieges courants](#9-pieges-courants)
10. [Cheat Sheet](#10-cheat-sheet)

---

## 1. Le Web : concepts de base

### Page Web vs Application Web

| Page Web | Application Web |
|----------|-----------------|
| Contenu statique (HTML/CSS/JS basique) | Logiciel accessible via Internet |
| Pas d'interaction complexe | Separation client-serveur |
| Exemple : blog personnel | Exemple : Netflix, Gmail |

### Les trois piliers

```
+------------------+     +------------------+     +------------------+
|       HTML       |     |       CSS        |     |    JavaScript    |
|   Structure      |     |   Presentation   |     |   Comportement   |
|   (squelette)    |     |   (apparence)    |     |   (interactif)   |
+------------------+     +------------------+     +------------------+
```

### Vocabulaire essentiel

| Terme | Definition |
|-------|-----------|
| **Front-end** | Interface dans le navigateur (HTML, CSS, TypeScript, Angular) |
| **Back-end** | Serveur (donnees, calculs, Java, Spring Boot) |
| **Full-stack** | Personne capable de developper front ET back |
| **Stack** | Pile des technologies utilisees |
| **npm** | Gestionnaire de paquets front-end (JS/TS) |
| **Maven** | Gestionnaire de paquets back-end (Java) |

---

## 2. Le protocole HTTP

HTTP (HyperText Transfer Protocol) est le protocole de communication du Web.

### Requete HTTP

```
POST /api/public/v1/hello/txt HTTP/1.1     <-- ligne de requete : VERBE URI VERSION
Host: localhost:8080                         <-- en-tetes
Content-Type: application/json
Content-Length: 25

{ "text": "foo" }                            <-- corps (body)
```

### Reponse HTTP

```
HTTP/1.1 200 OK                              <-- ligne de statut : VERSION CODE MESSAGE
Content-Type: application/json
Content-Length: 42

{ "id": 1, "name": "Alice" }                <-- corps (body)
```

### Dialogue type

```
Client (navigateur)                     Serveur (Spring Boot)
      |                                        |
      |-- GET /api/users ---------------------->|
      |                                        |  traitement
      |<------------- 200 OK + JSON -----------|
      |                                        |
      |-- POST /api/users + body JSON -------->|
      |                                        |  creation
      |<------------- 201 Created -------------|
```

---

## 3. Methodes HTTP (verbes)

### Correspondance CRUD

```
+--------+----------+---------------------------------------------------+
| Verbe  | Action   | Description                                       |
+--------+----------+---------------------------------------------------+
| POST   | Create   | Creer une nouvelle ressource                      |
|        |          | Donnees dans le body                              |
+--------+----------+---------------------------------------------------+
| GET    | Read     | Lire / recuperer une ressource                    |
|        |          | Lecture seule, PAS de body                         |
+--------+----------+---------------------------------------------------+
| PUT    | Update   | Remplacer completement une ressource              |
|        |          | Objet complet dans le body                        |
+--------+----------+---------------------------------------------------+
| PATCH  | Update   | Modifier partiellement une ressource              |
|        |          | Seuls les attributs a modifier dans le body       |
+--------+----------+---------------------------------------------------+
| DELETE | Delete   | Supprimer une ressource                           |
|        |          | Identifiant dans l'URI                            |
+--------+----------+---------------------------------------------------+
```

### Difference PUT vs PATCH

```
PUT (remplacement complet) :
  Envoyer : { "name": "Alice", "address": "Paris", "age": 22 }
  Resultat : tout l'objet est remplace

PATCH (modification partielle) :
  Envoyer : { "name": "Alice" }
  Resultat : seul name change, address et age restent inchanges
  (les attributs non envoyes = null dans le body recu)
```

### Exemples avec curl

```bash
# POST : creer
curl -X POST "http://localhost:8080/api/public/v1/hello/txt" \
     -H "Content-Type: application/json" \
     -d '{ "text": "foo" }'

# GET : lire
curl -X GET "http://localhost:8080/api/public/v1/hello/world"

# DELETE : supprimer
curl -X DELETE "http://localhost:8080/api/public/v1/hello/txt/foo"

# PATCH : modifier partiellement
curl -X PATCH "http://localhost:8080/api/public/v1/hello/user" \
     -H "Content-Type: application/json" \
     -d '{ "name": "aa" }'
```

---

## 4. Codes de statut HTTP

### Les codes essentiels pour le DS

| Code | Nom | Signification | Quand l'utiliser |
|------|-----|---------------|-----------------|
| **200** | OK | Requete reussie | GET reussi, PATCH reussi |
| **201** | Created | Ressource creee | POST reussi |
| **204** | No Content | OK mais pas de body | DELETE reussi |
| **400** | Bad Request | Donnees invalides | Body mal forme, donnees manquantes |
| **404** | Not Found | Ressource inexistante | GET/DELETE sur un id qui n'existe pas |
| **401** | Unauthorized | Non authentifie | Pas de session / pas de cookie |
| **403** | Forbidden | Pas les droits | Authentifie mais pas le bon role |
| **405** | Method Not Allowed | Mauvais verbe HTTP | PUT au lieu de PATCH par exemple |
| **500** | Internal Server Error | Bug dans le back-end | Exception non geree |

### En une phrase

```
2xx = succes
4xx = erreur du client (mauvaise requete)
5xx = erreur du serveur (bug dans le code)
```

---

## 5. En-tetes HTTP

### En-tetes courants

| En-tete | Role | Exemple |
|---------|------|---------|
| `Content-Type` | Format du body | `application/json`, `text/plain` |
| `Accept` | Format attendu en reponse | `application/json` |
| `Cookie` | Session utilisateur | `JSESSIONID=abc123` |
| `Set-Cookie` | Le serveur envoie un cookie | `Set-Cookie: JSESSIONID=abc123` |
| `Authorization` | Credentials d'authentification | `Bearer token123` |

### Content-Type en Spring Boot

```java
// Consommer du JSON
@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)

// Produire du JSON
@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)

// Produire du texte brut
@GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
```

---

## 6. Structure d'une URL

```
https://www.example.com:8080/api/v1/users?name=alice&sort=desc#section1
|___|   |_______________|____|_______________|________________|________|
scheme       host        port     path           query         fragment
```

### En Spring Boot

```
@RequestMapping("api/public/v1/hello")    <-- chemin de base
@GetMapping("user/{id}")                  <-- chemin relatif avec variable
// URL complete : GET http://localhost:8080/api/public/v1/hello/user/42

// Trois manieres de passer des donnees :
@PathVariable("id")     -->  dans le chemin : /user/42
@RequestParam("name")   -->  dans la query : /user?name=alice
@RequestBody            -->  dans le body de la requete
```

---

## 7. REST : principes architecturaux

REST (Representational State Transfer, Roy Fielding, 2000) est un **style d'architecture** pour les communications client-serveur.

### Les 4 principes REST

```
1. Separation client-serveur
   Le front-end et le back-end sont independants

2. Sans etat (stateless)
   Chaque requete contient toutes les informations necessaires
   Le serveur ne stocke pas l'etat de la conversation

3. Mise en cache (cacheable)
   Les reponses peuvent etre mises en cache

4. Interface uniforme (API)
   Verbe HTTP + URI = identifiant unique d'une route
```

### Regle fondamentale

**Verbe + URI = tuple UNIQUE.** Deux routes ne peuvent pas avoir le meme verbe ET la meme URI.

```
OK    : POST /api/foo  et  GET /api/foo     (verbes differents)
CONFLIT : GET /api/foo/{param1}  et  GET /api/foo/{param2}
          (les noms de parametres ne comptent pas pour le routage !)
```

### Avantages et inconvenients

| Avantages | Inconvenients |
|-----------|---------------|
| Operations CRUD + authentification | Asynchrone (latence reseau) |
| Repose sur HTTP (standard) | Verbeux (en-tetes HTTP) |
| API explicite front-end / back-end | Unidirectionnel (back ne peut pas contacter le front) |
| Supporte par toutes les bibliotheques | |

**Alternative** : WebSockets pour communication bidirectionnelle en temps reel.

---

## 8. Architecture client-serveur

### Communication front-end / back-end

```
Front-end (Angular)              Back-end (Spring Boot)
localhost:4200                    localhost:8080
     |                                |
     |-- requete REST /api/* -------->|
     |<-- reponse JSON --------------|
     |                                |

Proxy Angular (proxy.conf.json) :
{
    "/api/*": {
        "target": "http://localhost:8080",
        "secure": false,
        "changeOrigin": true
    }
}
```

### Structure typique d'un projet Spring Boot

```
src/main/java/fr/insarennes/
    |-- Application.java             (Main : @SpringBootApplication)
    |-- controller/                   (Ressources REST : @RestController)
    |-- service/                      (Logique metier : @Service)
    |-- model/                        (Entites : @Entity)
    |-- dto/                          (Data Transfer Objects)
    |-- repository/                   (Acces base de donnees : @Repository)
```

---

## 9. Pieges courants

### Piege 1 : Confondre PUT et PATCH
- PUT = remplacement complet de l'objet
- PATCH = modification partielle (seuls les champs fournis sont modifies)

### Piege 2 : Mettre des donnees dans le body d'un GET
- GET ne doit PAS avoir de body. Utiliser @PathVariable ou @RequestParam.

### Piege 3 : Confondre @PathVariable et @RequestParam
- `@PathVariable` : dans l'URI `/user/{id}` -> `/user/42`
- `@RequestParam` : dans la query string `/user?id=42`

### Piege 4 : Toujours retourner 200
- Utiliser le bon code HTTP selon la situation (201, 204, 400, 404, etc.)

### Piege 5 : Conflit de routes
- `GET /user/{id}` et `GET /user/{name}` = CONFLIT (meme structure)
- Les noms de PathVariable ne comptent pas pour le routage

---

## 10. Cheat Sheet

```
HTTP = protocole de communication du Web
REST = style d'architecture client-serveur sur HTTP

Verbes HTTP :
  POST   = creer   (body : JSON)
  GET    = lire    (pas de body)
  PUT    = remplacer completement (body : JSON complet)
  PATCH  = modifier partiellement (body : JSON partiel)
  DELETE = supprimer (id dans l'URI)

Codes HTTP :
  200 OK            = succes
  201 Created       = ressource creee
  204 No Content    = succes, rien a retourner
  400 Bad Request   = donnees invalides
  404 Not Found     = ressource inexistante
  401 Unauthorized  = pas authentifie
  403 Forbidden     = pas les droits
  500 Server Error  = bug serveur

Transmission de donnees :
  @RequestBody     = dans le body (POST, PUT, PATCH)
  @PathVariable    = dans l'URI (/user/{id})
  @RequestParam    = dans la query (/user?name=foo)

Regle d'or REST :
  Verbe + URI = tuple UNIQUE
  Les noms de @PathVariable ne comptent PAS pour l'unicite
```
