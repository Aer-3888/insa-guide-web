---
title: "Chapitre 4 : Java Spring Boot -- Le back-end REST"
sidebar_position: 4
---

# Chapitre 4 : Java Spring Boot -- Le back-end REST

## Table des matieres

1. [Creer un projet Spring Boot](#1-creer-un-projet-spring-boot)
2. [Controleurs REST](#2-controleurs-rest)
3. [Routes CRUD completes](#3-routes-crud-completes)
4. [Transmission des donnees](#4-transmission-des-donnees)
5. [ResponseEntity et codes HTTP](#5-responseentity-et-codes-http)
6. [DTO (Data Transfer Object)](#6-dto-data-transfer-object)
7. [Services Spring](#7-services-spring)
8. [Marshalling (Jackson)](#8-marshalling-jackson)
9. [Tester les routes avec MockMvc](#9-tester-les-routes-avec-mockmvc)
10. [Cheat Sheet](#10-cheat-sheet)

---

## 1. Creer un projet Spring Boot

### Point d'entree

```java
@SpringBootApplication
public class TpSpringApplication {
    public static void main(String[] args) {
        SpringApplication.run(TpSpringApplication.class, args);
    }
}
// Lancer le Main = demarrer le serveur sur localhost:8080
```

### Structure du projet

```
src/main/java/fr/insarennes/
    |-- TpSpringApplication.java        (Main)
    |-- controller/                      (@RestController)
    |-- service/                         (@Service)
    |-- model/                           (@Entity)
    |-- dto/                             (DTOs)
    |-- repository/                      (@Repository)
```

---

## 2. Controleurs REST

### Creer une ressource REST

```java
@RestController                           // Marque comme ressource REST
@RequestMapping("api/public/v1/hello")    // URI de base
public class HelloControllerV1 {
    private final DataService dataService;

    // Injection de dependance par constructeur
    public HelloControllerV1(final DataService dataService) {
        this.dataService = dataService;
    }
}
```

### Annotations des routes

| Verbe | Annotation | Usage |
|-------|-----------|-------|
| GET | `@GetMapping` | Lire |
| POST | `@PostMapping` | Creer |
| PUT | `@PutMapping` | Remplacer |
| PATCH | `@PatchMapping` | Modifier partiellement |
| DELETE | `@DeleteMapping` | Supprimer |

---

## 3. Routes CRUD completes

### GET : lire

```java
// Texte brut
@GetMapping(path = "world", produces = MediaType.TEXT_PLAIN_VALUE)
public String helloWorld() {
    return "Hello world!";
}

// JSON
@GetMapping(path = "user", produces = MediaType.APPLICATION_JSON_VALUE)
public UserDTO getUser() {
    return new UserDTO(user);
}

// Liste JSON
@GetMapping(path = "all", produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<List<ExamDTO>> getAll() {
    return ResponseEntity.ok(service.getAll());
}

// Par id
@GetMapping(path = "{id}", produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<ExamDTO> getById(@PathVariable("id") final long id) {
    Optional<ExamDTO> opt = service.getById(id);
    if (opt.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found");
    }
    return ResponseEntity.ok(opt.get());
}
```

### POST : creer

```java
@PostMapping(path = "", consumes = MediaType.APPLICATION_JSON_VALUE,
                        produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<ExamDTO> create(@RequestBody final ExamNoIdDTO dto) {
    return ResponseEntity.ok(service.create(dto));
}
```

### DELETE : supprimer

```java
@DeleteMapping(path = "{id}")
public ResponseEntity<Void> delete(@PathVariable("id") final long id) {
    if (!service.delete(id)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete");
    }
    return ResponseEntity.ok().build();
}
```

### PATCH : modifier partiellement

```java
@PatchMapping(path = "{id}", consumes = MediaType.APPLICATION_JSON_VALUE,
                              produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<ExamDTO> patch(@PathVariable("id") final long id,
                                      @RequestBody final ExamDTO dto) {
    Optional<ExamDTO> opt = service.patch(id, dto);
    if (opt.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid");
    }
    return ResponseEntity.ok(opt.get());
}
```

### PUT : remplacer completement

```java
@PutMapping(path = "user", consumes = MediaType.APPLICATION_JSON_VALUE)
public void replaceUser(@RequestBody final User newUser) {
    if (newUser.getId().equals(user.getId())) {
        user = newUser;
    } else {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID mismatch");
    }
}
```

---

## 4. Transmission des donnees

### Trois manieres

| Methode | Annotation | Exemple |
|---------|-----------|---------|
| **Body** | `@RequestBody` | `POST /api/exam` body: `{ "nom": "Web" }` |
| **URI** | `@PathVariable("id")` | `GET /api/exam/{id}` -> `/api/exam/42` |
| **Query** | `@RequestParam("name")` | `GET /api/exam?name=Web` |

```java
// Body (POST, PUT, PATCH)
public void create(@RequestBody final ExamNoIdDTO dto) { }

// PathVariable (dans l'URI)
@GetMapping("{id}")
public ExamDTO getById(@PathVariable("id") final long id) { }

// RequestParam (query string)
@GetMapping("search")
public List<Arret> search(@RequestParam("nom") final String nom) { }
```

---

## 5. ResponseEntity et codes HTTP

### Sans body

```java
return ResponseEntity.ok().build();            // 200 OK
return ResponseEntity.badRequest().build();    // 400 Bad Request
return ResponseEntity.notFound().build();      // 404 Not Found
```

### Avec body

```java
return ResponseEntity.ok(monDTO);              // 200 + JSON
return ResponseEntity.status(HttpStatus.CREATED).body(monDTO); // 201
```

### Gestion des erreurs

```java
// MAUVAIS : exception non geree -> 500
throw new IllegalArgumentException("erreur");

// BON : code HTTP explicite
throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message clair");
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found");
```

---

## 6. DTO (Data Transfer Object)

### Pourquoi ?

```java
// PROBLEME : la classe User contient le mot de passe
public class User {
    private String name, address, id, pwd;
}

// Si on retourne User directement :
// {"name":"Foo","address":"here","id":"1","pwd":"p1"}  <-- pwd expose !
```

### Solution : DTO

```java
// DTO pour GET : sans mot de passe
public class UserDTO {
    private String name;
    private String address;
    private String id;
    // PAS de pwd

    public UserDTO(final User user) {
        this.name = user.getName();
        this.address = user.getAddress();
        this.id = user.getId();
    }
}

// DTO pour POST : sans id (sera genere)
public class UserNoIdDTO {
    private String name;
    private String address;
}
```

### Quand utiliser differents DTOs

| DTO | Usage | Contient |
|-----|-------|----------|
| `ExamDTO` | GET (retour) | id + nom + date |
| `ExamNoIdDTO` | POST (entree) | nom + date (sans id) |
| `ExamPatchDTO` | PATCH (entree) | tous les attributs optionnels |
| `NoteEtudiantDTO` | Route optimisee | nom du cours + date + note |

---

## 7. Services Spring

```java
@Getter @Setter     // Lombok : genere getters et setters
@Service
public class DataService {
    private final Set<String> txts;
    private User user;

    public DataService() {
        txts = new HashSet<>();
        txts.add("foo");
        txts.add("bar");
        user = new User("Foo", "here", "1", "p1");
    }
}
```

### Utilisation dans le controleur

```java
@RestController
@RequestMapping("api/public/v3/hello")
public class HelloControllerV3 {
    private final DataService dataService;

    // Injection par constructeur
    public HelloControllerV3(final DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping(path = "user", produces = MediaType.APPLICATION_JSON_VALUE)
    public UserDTO getUser() {
        return new UserDTO(dataService.getUser());
    }
}
```

**@Autowired** : annotation qui demande a Spring de fournir automatiquement une instance.
Quand il n'y a qu'un seul constructeur, `@Autowired` est implicite.

---

## 8. Marshalling (Jackson)

```
Marshalling    : Objet Java --> JSON/XML
Demarshalling  : JSON/XML --> Objet Java
```

### Annotations Jackson

```java
@JsonIgnore                  // ignorer un attribut
private int secret;

// Gerer le polymorphisme (heritage)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Cat.class, name = "cat"),
    @JsonSubTypes.Type(value = Dog.class, name = "dog")
})
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
              include = JsonTypeInfo.As.PROPERTY,
              property = "type")
public interface Animal { }
// JSON : { "type": "cat", "name": "Minou", "age": 3 }
```

> Un attribut est marshalle uniquement s'il a un getter ET un setter.

---

## 9. Tester les routes avec MockMvc

```java
@SpringBootTest
@AutoConfigureMockMvc
class ExamControllerTest {
    @Autowired private MockMvc mvc;

    @Test
    void testGetAll() throws Exception {
        mvc.perform(get("/api/public/v1/exam/all"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].name", equalTo("Web")));
    }

    @Test
    void testPost() throws Exception {
        mvc.perform(
            post("/api/public/v1/exam")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "nom": "Web", "date": "2023-06-01" }""")
        ).andExpect(status().isOk());
    }

    @Test
    void testBadRequest() throws Exception {
        mvc.perform(
            post("/api/public/v1/exam")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ }")
        ).andExpect(status().isBadRequest());
    }
}
```

---

## 10. Cheat Sheet

```
Controleur :
  @RestController + @RequestMapping("api/...")
  @GetMapping, @PostMapping, @PutMapping, @PatchMapping, @DeleteMapping

Donnees :
  @RequestBody       = body JSON (POST, PUT, PATCH)
  @PathVariable("x") = dans l'URI /path/{x}
  @RequestParam("x") = dans la query ?x=val

Reponse :
  ResponseEntity.ok(body)              = 200 + body
  ResponseEntity.ok().build()          = 200 sans body
  ResponseEntity.badRequest().build()  = 400
  ResponseStatusException(HttpStatus.NOT_FOUND, "msg") = 404

DTO :
  ExamDTO      = pour GET (avec id)
  ExamNoIdDTO  = pour POST (sans id, sera genere)
  NE JAMAIS retourner le modele directement (expose des donnees)

Service :
  @Service -> logique metier, injecte dans le controleur

Marshalling :
  Java <-> JSON automatique par Jackson
  @JsonIgnore pour cacher un attribut
  Getter + Setter requis pour le marshalling
```
