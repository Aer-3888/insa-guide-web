---
title: "Preparation au DS -- Ingenierie Web"
sidebar_position: 0
---

# Preparation au DS -- Ingenierie Web

## Structure du DS

Le DS d'Ingenierie Web (3A INSA Rennes, Arnaud Blouin) dure 2h et suit un schema recurrent base sur l'analyse des sujets 2017-2023.

### Repartition des exercices

| Exercice | Theme | Points (approx.) | Temps conseille |
|----------|-------|-------------------|-----------------|
| **Exercice 1** | JSON / XML | 2-3 pts | 15 min |
| **Exercice 2** | ORM / JPA | 5-6 pts | 30 min |
| **Exercice 3** | REST API (routes) | 8-10 pts | 50 min |
| **Exercice 4** | Securite | 2-3 pts | 15 min |

### Scenario du DS

Chaque DS propose un **domaine metier** sous forme de diagramme UML :
- 2021-2022 : Transports en commun (Ligne, Arret, Type)
- 2022-2023 : Gestion d'examens (Examen, Etudiant, Copie)

Toutes les questions portent sur ce meme domaine, de la serialisation JSON jusqu'a la securisation de l'API.

---

## Strategie par exercice

### Exercice 1 : JSON / XML (15 min)

**Ce qui est demande** : ecrire le JSON et/ou XML correspondant a des objets Java donnes.

**Methode** :
1. Lire le diagramme UML et les valeurs des objets
2. Convertir chaque attribut Java en cle JSON
3. Respecter les types : `String -> "..."`, `int -> nombre`, `boolean -> true/false`, `null -> null`
4. `List/Set -> [ ]`, objets imbriques `-> { }`
5. Virgules entre les elements, PAS de trailing comma

**Questions pieges** :
- "Ce JSON/XML est-il bien forme ?" -> verifier la syntaxe strictement
- "Est-il valide ?" -> bien forme ET conforme a un schema (si pas de schema, on ne peut pas dire "valide")
- XML : verifier imbrication, un seul element racine, balises fermees
- JSON : guillemets doubles obligatoires, pas de paires cle:valeur dans un tableau `[ ]`

**Exemple type (DS 2021-2022, Q.1)** :
```java
Arret a1 = new Arret(1, "INSA", "", true);
Arret a2 = new Arret(2, "Chimie", "", false);
```
Reponse :
```json
[
    { "id": 1, "nom": "INSA", "gps": "", "abris": true },
    { "id": 2, "nom": "Chimie", "gps": "", "abris": false }
]
```

---

### Exercice 2 : ORM / JPA (30 min)

**Ce qui est demande** : ecrire les entites JPA a partir du diagramme UML, creer les repositories.

**Methode** :
1. Pour chaque classe du diagramme : `@Entity` + `@Id` + `@GeneratedValue`
2. Pour chaque association :
   - `1..*` <-> `0..*` : `@ManyToMany`
   - `1` <-> `0..*` : `@OneToMany` (cote 1) + `@ManyToOne` (cote *)
   - `1` <-> `1` : `@OneToOne`
3. Identifier qui "possede" la relation (le cote sans `mappedBy`)
4. Creer les `CrudRepository<Entity, Long>`

**Points critiques** :
- `@OneToMany(mappedBy = "nomAttributCoteMany")` TOUJOURS du cote "One"
- `@ManyToOne` TOUJOURS du cote qui a la cle etrangere
- `@ManyToMany` : un seul cote a `mappedBy`, l'autre possede
- Constructeur vide obligatoire pour JPA
- Ne pas oublier `@GeneratedValue` avec `@Id`

**Exemple type (DS 2022-2023, Q.2-4)** :
```java
@Entity
public class Copie {
    @Id @GeneratedValue
    private long id;
    private Double note;

    @ManyToOne
    private Etudiant etudiant;   // cle etrangere

    @ManyToOne
    private Examen examen;       // cle etrangere
}

@Entity
public class Examen {
    @Id @GeneratedValue
    private long id;
    private String nom;
    private String date;

    @ManyToMany
    private List<Etudiant> etds;

    @OneToMany(mappedBy = "examen")
    private List<Copie> copies;
}
```

**Question sur CrudRepository** :
```java
@Repository
public interface ExamenRepository extends CrudRepository<Examen, Long> { }
```
"Spring genere automatiquement les methodes CRUD (save, findById, findAll, deleteById) pour interagir avec la base de donnees."

---

### Exercice 3 : REST API (50 min)

**Ce qui est demande** : concevoir les routes REST (verbe, URI, entree, sortie, codes retour) puis ecrire le code Java Spring Boot.

**Methode pour chaque route** :
1. Identifier l'operation CRUD : Creer/Lire/Modifier/Supprimer
2. Choisir le verbe HTTP : POST/GET/PATCH-PUT/DELETE
3. Definir l'URI (avec `{id}` pour les parametres)
4. Definir la donnee d'entree (DTO ou entite)
5. Definir la donnee de sortie (DTO ou entite)
6. Lister les codes de retour possibles

**Grille verbe/code de retour** :

| Verbe | Succes | Echec possible |
|-------|--------|----------------|
| **POST** (creer) | 201 Created ou 204 No Content | 400 Bad Request |
| **GET** (lire) | 200 OK | 404 Not Found |
| **DELETE** (supprimer) | 200 OK ou 204 No Content | 404 Not Found |
| **PATCH** (modifier partiellement) | 200 OK | 400 Bad Request, 404 Not Found |
| **PUT** (remplacer) | 200 OK | 400 Bad Request, 404 Not Found |

Avec securite : ajouter `401 Unauthorized` et `403 Forbidden`.

**Exemple type (DS 2022-2023, Q.5-10)** :

Q.5 : "Creer un examen"
```
Verbe : POST
URI : /api/public/examen
Entree : ExamenDTO (nom, date, etds)
Sortie : rien (ou l'examen cree)
Codes : 201 Created / 400 Bad Request
```

Q.6 : "Obtenir un examen"
```
Verbe : GET
URI : /api/public/examen/{id}
Entree : rien
Sortie : Examen (JSON)
Codes : 200 OK / 404 Not Found
```

Q.7 : "Supprimer un examen"
```
Verbe : DELETE
URI : /api/public/examen/{id}
Entree : rien
Sortie : rien
Codes : 200 OK ou 204 / 404 Not Found
```

Q.8 : "Modifier un examen"
```
Verbe : PATCH
URI : /api/public/examen/{id}
Entree : ExamenPatchDTO (champs optionnels)
Sortie : Examen modifie
Codes : 200 OK / 400 Bad Request / 404 Not Found
```

**Code Java pour un controleur type DS** :

```java
@RestController
@RequestMapping("api/public/examen")
public class ExamenController {
    private final ExamenService examenService;

    public ExamenController(ExamenService es) {
        this.examenService = es;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> creerExamen(@RequestBody ExamenDTO dto) {
        examenService.creer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping(path = "{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Examen getExamen(@PathVariable("id") long id) {
        return examenService.getExamen(id);
        // Le service lance ResponseStatusException(NOT_FOUND) si absent
    }

    @DeleteMapping(path = "{id}")
    public void supprimerExamen(@PathVariable("id") long id) {
        examenService.supprimer(id);
    }

    @PatchMapping(path = "{id}", consumes = MediaType.APPLICATION_JSON_VALUE,
                  produces = MediaType.APPLICATION_JSON_VALUE)
    public Examen modifierExamen(@PathVariable("id") long id,
                                 @RequestBody ExamenPatchDTO dto) {
        return examenService.modifier(id, dto);
    }
}
```

**Question sur @Autowired (Q.11)** :
"`@Autowired` permet d'injecter automatiquement les dependances dans les beans geres par Spring. Quand on l'utilise sur un constructeur, Spring fournit automatiquement les instances des services requis."

---

### Exercice 4 : Securite (15 min)

**Ce qui est demande** : expliquer comment securiser l'API, ajouter authentification.

**Reponse type** :
1. **Definir les routes publiques et privees** dans SecurityConfig :
```java
http.authorizeRequests()
    .antMatchers("/api/public/**").permitAll()
    .antMatchers("/api/etudiant/**").hasRole("ETUDIANT")
    .antMatchers("/api/enseignant/**").hasRole("ENSEIGNANT")
    .anyRequest().authenticated()
```

2. **Creer des routes de creation de compte et connexion** (publiques) :
```java
@PostMapping("api/public/user/new")
public void newAccount(@RequestBody UserDTO user) { ... }

@PostMapping("api/public/user/login")
public void login(@RequestBody UserDTO user) { ... }
```

3. **Utiliser Principal dans les routes privees** pour verifier l'identite :
```java
@GetMapping("api/etudiant/copies")
public List<CopieDTO> mesCopies(Principal user) {
    return service.getCopiesByEtudiant(user.getName());
}
```

4. **Codes de retour securite** : 401 Unauthorized (pas connecte), 403 Forbidden (pas le bon role)

---

## Liste de verification avant le DS

### JSON/XML (Exercice 1)
- [ ] Je sais convertir un objet Java en JSON
- [ ] Je connais les 6 types JSON : string, number, boolean, null, array, object
- [ ] Je sais verifier si un JSON/XML est bien forme
- [ ] Je connais la difference entre bien forme et valide

### ORM/JPA (Exercice 2)
- [ ] Je sais placer @Entity, @Id, @GeneratedValue
- [ ] Je sais ecrire @OneToMany avec mappedBy
- [ ] Je sais ecrire @ManyToOne (cote cle etrangere)
- [ ] Je sais ecrire @ManyToMany (un cote avec mappedBy)
- [ ] Je sais creer un CrudRepository

### REST API (Exercice 3)
- [ ] Je connais les 5 verbes HTTP et leurs usages
- [ ] Je sais choisir les codes de retour pour chaque verbe
- [ ] Je sais ecrire un @RestController avec @RequestMapping
- [ ] Je sais utiliser @GetMapping, @PostMapping, @DeleteMapping, @PatchMapping
- [ ] Je sais utiliser @RequestBody, @PathVariable
- [ ] Je sais creer un @Service et l'injecter
- [ ] Je sais utiliser ResponseStatusException pour les erreurs

### Securite (Exercice 4)
- [ ] Je sais configurer SecurityConfig (routes publiques/privees)
- [ ] Je sais expliquer le mecanisme de session (JSESSIONID)
- [ ] Je sais utiliser Principal pour verifier l'identite
- [ ] Je connais les codes 401 et 403

---

## Erreurs frequentes a eviter

1. **JSON** : oublier les guillemets doubles sur les cles
2. **JSON** : mettre une virgule apres le dernier element
3. **JPA** : oublier le constructeur vide
4. **JPA** : mettre `mappedBy` du mauvais cote
5. **REST** : confondre POST (creer) et PUT/PATCH (modifier)
6. **REST** : confondre PATCH (partiel) et PUT (remplacement complet)
7. **REST** : oublier les codes d'erreur (400, 404)
8. **Securite** : oublier 401/403 quand les routes sont privees
9. **Service** : oublier `@Service` ou ne pas injecter via le constructeur
10. **Code** : oublier `consumes`/`produces` dans les annotations

---

## Themes recurrents par annee

| Annee | Domaine | JSON/XML | ORM | REST | Securite |
|-------|---------|----------|-----|------|----------|
| 2021-2022 | Transport (Ligne, Arret) | JSON + XML d'arrets, bien-forme | Service Transport | Routes CRUD arrets/lignes | Routes privees |
| 2022-2023 | Examens (Examen, Etudiant, Copie) | JSON d'examen | Entites + Repos | Routes CRUD examen/copie | Roles etudiant/enseignant |
| 2020 | (QCM format) | Validation JSON/XML | Annotations JPA | Verbes + codes | Authentification |
| 2019 | Variable | XML + DTD | Relations | Routes + services | Config securite |
| 2018 | Variable | JSON/XML | Heritage JPA | CRUD complet | Sessions |
| 2017 | Variable | Formats de donnees | Entites de base | Routes REST | Principes |
