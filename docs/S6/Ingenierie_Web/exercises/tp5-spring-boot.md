---
title: "TP Spring Boot -- Back-end REST CRUD pour des Todos"
sidebar_position: 5
---

# TP Spring Boot -- Back-end REST CRUD pour des Todos

> Following teacher instructions from: `S6/Ingenierie_Web/data/moodle/tp/tp_github_resources/tp-spring/README.md`

Le sujet des TP concerne la creation d'un back-end pour realiser des operations CRUD pour des todos.

```
TodoList (id: long, name: string, owner: string)
    |
    | 1 list -- * todos
    v
Todo (id: long, title: string, owner: string, description: string)
    |
    | * categories
    v
Category (enum: HIGH_PRIORITY, LOW_PRIORITY, WORK, ENTERTAINMENT)
```

Prerequis :
- Java 21, Maven 3, IntelliJ (+ plugin Lombok), navigateur Firefox/Chrome
- Cloner le depot : `git clone https://github.com/arnobl/WebEngineering-INSA.git`
- Projet du TP dans : `tp-spring`
- Swagger Editor en ligne : https://editor-next.swagger.io/

---

## TP 1

**Pensez a la fin du TP a sauvegarder votre modele OpenAPI de Swagger Editor !**

### Q1.1

> Lancer le back-end en allant dans `TpSpringApplication.java` et en lancant le `main`.
> Vous pouvez aussi demarrer l'application en executant la commande suivante (dans le meme dossier que le `pom.xml`) : `mvn spring-boot:run`
>
> Dans Swagger Editor, supprimez le contenu affiche et ajoutez simplement le modele OpenAPI fourni. Executez cette commande REST avec `Try it out` -> `Execute`.
> Cette route est deja codee dans le controleur REST `HelloController` (package `tpspring.controller`). Regardez cette classe.

**Answer:**

1. Lancer le back-end :
```bash
cd tp-spring
mvn spring-boot:run
```

2. Dans Swagger Editor (https://editor-next.swagger.io), coller ce modele OpenAPI :
```yaml
openapi: 3.1.0
info:
  title: TP Web INSA Rennes
  description: |-
    Intro au dev d'un back-end REST en Java avec Spring et OpenAPI
  version: 2024.0.0
servers:
  - url: "http://localhost:8080/api"

tags:
  - name: hello
    description: Demo
paths:
    /v1/public/hello/helloworld:
        get:
            tags:
                - hello
            responses:
              '200':
                description: c'est bon
```

3. Cliquer `Try it out` -> `Execute`. On doit recevoir `Hello World` avec un code 200.

4. La classe `HelloController` fournie gere cette route :

```java
// Fichier : src/main/java/tpspring/controller/HelloController.java (fourni)
package tpspring.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

record Message(String txt) {}

@RestController
@RequestMapping("api/v1/public/hello")
@CrossOrigin
public class HelloController {
    private final List<String> txts = new ArrayList<>();

    @GetMapping(path = "helloworld", produces = MediaType.TEXT_PLAIN_VALUE)
    public String hello() {
        return "Hello World";
    }

    @GetMapping(path = "helloworld2", produces = MediaType.APPLICATION_JSON_VALUE)
    public Message helloWorld() {
        return new Message("Hello world!");
    }

    @PostMapping(path = "txt", consumes = MediaType.TEXT_PLAIN_VALUE)
    public void newTxt(@RequestBody final String txt) {
        txts.add(txt);
    }

    @GetMapping(path = "txt", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<String> getTxts() {
        return txts;
    }
}
```

**File changes:**
- Aucun fichier modifie a cette etape. On observe le code fourni.

---

### Q1.2

> Dans votre navigateur, entrez l'URL `http://localhost:8080/api/v1/public/hello/helloworld`
> Pourquoi la barre d'adresse de votre navigateur sait-elle gerer une requete REST GET ? Est-elle aussi capable de gerer un POST ?
>
> Affichez la console de developpement de votre navigateur. Allez dans l'onglet reseau et rafraichissez la page. Vous devriez pouvoir observer la requete et ses details.

**Answer:**

1. Dans Firefox/Chrome, aller a : `http://localhost:8080/api/v1/public/hello/helloworld`
   - On voit s'afficher `Hello World`

2. **Pourquoi la barre d'adresse gere le GET ?**
   La barre d'adresse d'un navigateur envoie toujours une requete HTTP GET lorsqu'on entre une URL. C'est le comportement par defaut du navigateur. **Non, la barre d'adresse ne peut pas gerer un POST** directement. Pour envoyer un POST, il faut soit un formulaire HTML, soit du JavaScript (XMLHttpRequest/fetch), soit un outil comme curl, Postman, ou Swagger.

3. Ouvrir la console developpeur (F12) -> onglet `Reseau` (`Network`) -> rafraichir la page (F5).
   On observe :
   - Methode : GET
   - URL : `http://localhost:8080/api/v1/public/hello/helloworld`
   - Status : 200 OK
   - Content-Type : `text/plain`
   - Response : `Hello World`

**File changes:**
- Aucun fichier modifie.

---

### Q1.3 Get OpenAPI

> Dans votre Swagger Editor, ajoutez une route REST `/v1/public/todo/todo/{id}` (`GET`) qui retournera au format JSON une instance de la classe `Todo`. Le tag de cette route sera (tag `todo`). Cette route aura un parametre `id` du type *integer*. Inspirez-vous de l'exemple OpenAPI du cours.
> Notamment, vous aurez besoin de definir et d'utiliser le schema de l'objet retourne (le `Todo`).
> Avec Swagger, testez que la commande ne fonctionne pas.

**Answer:**

Ajouter dans le Swagger Editor, apres les paths existants, la nouvelle route et les composants :

```yaml
openapi: 3.1.0
info:
  title: TP Web INSA Rennes
  description: |-
    Intro au dev d'un back-end REST en Java avec Spring et OpenAPI
  version: 2024.0.0
servers:
  - url: "http://localhost:8080/api"

tags:
  - name: hello
    description: Demo
  - name: todo
    description: Operations CRUD sur les todos

paths:
    /v1/public/hello/helloworld:
        get:
            tags:
                - hello
            responses:
              '200':
                description: c'est bon

    /v1/public/todo/todo/{id}:
        get:
            tags:
                - todo
            parameters:
              - name: id
                in: path
                required: true
                schema:
                    type: integer
            responses:
              '200':
                description: Le todo correspondant a l'id
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'

components:
  schemas:
    Todo:
      type: object
      properties:
        id:
          type: integer
          format: int64
          examples: [10, 1]
        title:
          type: string
          examples: ["mon todo"]
        description:
          type: string
          examples: ["je dois terminer mon TP de Web pour le prochain TP"]
        categories:
          type: array
          items:
            type: string
            examples: ["WORK"]
```

Tester avec `Try it out` -> `Execute` : la requete retourne une erreur 404 car la route n'est pas encore codee dans Spring.

**File changes:**
- Swagger Editor seulement (pas de fichier Java modifie).

---

### Q1.4 Get v1

> Creez un nouveau controleur REST `TodoControllerV1` dans le package `controller`.
> Ajoutez un attribut dans ce controleur correspondant a une table d'objets `TODO` (a initialiser dans le constructeur avec deux objets `Todo` ayant pour `id` 1 et 2 et le titre que vous voulez, attention en Java un long s'ecrit `1L`):
> ```java
> private final Map<Long, Todo> todos;
> ```
> Codez cette requete dans ce controleur (il faudra redemarrer le back-end, et n'oubliez pas `@PathVariable`). L'instance retournee sera celle ayant l'ID correspondant au parametre `id`. Si l'id fourni ne correspond a aucun TODO retournez pour l'instant `null`.
> Tester a nouveau dans Swagger Editor. Tester dans le navigateur avec 1, 2 et 3 comme ID.
> Pourquoi une `Map` plutot qu'une `List` ? Pourquoi un `Long` plutot qu'un `Integer` ?

**Answer:**

Creer le fichier `TodoControllerV1.java` dans le package `tpspring.controller` :

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV1.java
package tpspring.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tpspring.model.Todo;

@RestController
@RequestMapping("api/v1/public/todo")
@CrossOrigin
public class TodoControllerV1 {
    private final Map<Long, Todo> todos;

    public TodoControllerV1() {
        todos = new HashMap<>();
        todos.put(1L, new Todo(1L, "Faire le TP de Web"));
        todos.put(2L, new Todo(2L, "Reviser pour le DS"));
    }

    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        return todos.get(id);
    }
}
```

Tester :
- Swagger Editor -> `Try it out` avec id=1 : retourne le JSON du todo 1
- Navigateur : `http://localhost:8080/api/v1/public/todo/todo/1` -> JSON du todo
- Navigateur : `http://localhost:8080/api/v1/public/todo/todo/2` -> JSON du todo 2
- Navigateur : `http://localhost:8080/api/v1/public/todo/todo/3` -> `null` (pas de todo avec cet id)

Le format du JSON recu ne correspond pas exactement a celui defini dans Swagger Editor car on serialise directement l'objet `Todo` Java (avec tous ses attributs, y compris `list`, `owner`, etc.) alors que le schema OpenAPI ne definit que quelques champs. Nous verrons les DTO plus tard.

**Pourquoi une `Map` plutot qu'une `List` ?**
Une `Map<Long, Todo>` permet un acces O(1) par identifiant (clef = id). Avec une `List<Todo>`, il faudrait parcourir toute la liste pour trouver le todo ayant le bon id, ce qui serait O(n).

**Pourquoi un `Long` plutot qu'un `Integer` ?**
Le type `long` (64 bits) est le type standard pour les identifiants en JPA/bases de donnees. Il offre une plage de valeurs beaucoup plus grande que `int` (32 bits). De plus, les cles primaires en JPA utilisent `Long` par convention.

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV1.java` : nouveau fichier -- controleur REST v1 avec GET par id

---

### Q1.5 Post v1

> Creez une route REST `POST` `/v1/public/todo/todo` (**NE METTEZ JAMAIS DE / A LA FIN DE URI DANS SWAGGER**) (dans Swagger Editor puis dans votre projet Spring) qui recevra un objet `Todo` (en JSON, `consumes`) avec les donnees que vous voulez (ignorez l'unicite des ID pour l'instant). Le type de retour de la route sera `void` (code 200 donc).
> La route affichera pour l'instant juste cet objet (`System.out.println(...)`) et l'ajoutera a la table de hachage (pas grave si la cle existe deja).
> **Attention :** la sortie de `println` sera visible dans la console d'IntelliJ (et non dans votre navigateur).
> Tester avec Swagger Editor

**Answer:**

1. Ajouter dans le Swagger Editor la route POST :
```yaml
    /v1/public/todo/todo:
        post:
            tags:
                - todo
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'
            responses:
              '200':
                description: Todo ajoute avec succes
```

2. Ajouter la methode dans `TodoControllerV1.java` :

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV1.java (complet)
package tpspring.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tpspring.model.Todo;

@RestController
@RequestMapping("api/v1/public/todo")
@CrossOrigin
public class TodoControllerV1 {
    private final Map<Long, Todo> todos;

    public TodoControllerV1() {
        todos = new HashMap<>();
        todos.put(1L, new Todo(1L, "Faire le TP de Web"));
        todos.put(2L, new Todo(2L, "Reviser pour le DS"));
    }

    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        return todos.get(id);
    }

    @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void addTodo(@RequestBody final Todo todo) {
        System.out.println(todo);
        todos.put(todo.getId(), todo);
    }
}
```

Tester dans Swagger Editor : `Try it out` avec un body JSON :
```json
{
  "id": 3,
  "title": "Nouveau todo",
  "description": "Description du todo",
  "categories": ["WORK"]
}
```

Dans la console d'IntelliJ, on voit la sortie de `println`. La reponse HTTP est 200 (void).

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV1.java` : ajout de la methode POST `addTodo`

---

## TP 2

**Pensez a la fin du TP a sauvegarder votre modele OpenAPI de Swagger Editor !**

### Q2.1 Post v2

> Dans les questions precedentes, nous ne gerions pas l'identifiant unique des `Todo`.
> Dans le controleur REST, ajoutez un attribut `cpt` (type `long`) qui sera incremente a chaque nouveau todo et utilise comme identifiant du nouveau todo. Modifiez la route `POST` en consequence et commentez les deux ajouts de `Todo` dans le constructeur. Cette pratique n'est pas propre du tout. Nous verrons plus tard comment faire cela de maniere correcte.
> Cette route retournera maintenant l'objet `Todo` cree. Modifiez le Swagger Editor en consequence. Modifiez le `println` pour qu'il affiche la liste des todos.

**Answer:**

Modifier `TodoControllerV1.java` :

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV1.java (modifie pour Q2.1)
package tpspring.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tpspring.model.Todo;

@RestController
@RequestMapping("api/v1/public/todo")
@CrossOrigin
public class TodoControllerV1 {
    private final Map<Long, Todo> todos;
    private long cpt;

    public TodoControllerV1() {
        todos = new HashMap<>();
        cpt = 0;
        // Commentez les ajouts initiaux :
        // todos.put(1L, new Todo(1L, "Faire le TP de Web"));
        // todos.put(2L, new Todo(2L, "Reviser pour le DS"));
    }

    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        return todos.get(id);
    }

    @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo addTodo(@RequestBody final Todo todo) {
        cpt++;
        todo.setId(cpt);
        todos.put(cpt, todo);
        System.out.println(todos);
        return todo;
    }
}
```

Modifier le Swagger Editor pour que le POST retourne un `Todo` :
```yaml
    /v1/public/todo/todo:
        post:
            tags:
                - todo
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'
            responses:
              '200':
                description: Todo cree
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'
```

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV1.java` : ajout de `cpt`, auto-incrementation de l'id, retour du Todo cree

---

### Q2.2 Delete

> Ajoutez (dans Swagger Editor et votre code Spring) une route `DELETE` `/v1/public/todo/todo/{id}` qui supprimera le todo dont l'id est celui donne en parametre de l'URI. Cette route devra alors chercher dans la structure le todo dont l'id est egal a celui du todo passe en parametre. Si la recherche echoue, alors retourner un code `400`. Si elle reussit, vous supprimerez l'objet de la liste des todos.
> Testez avec Swagger Editor.

**Answer:**

1. Ajouter dans Swagger Editor :
```yaml
    /v1/public/todo/todo/{id}:
        get:
            tags:
                - todo
            parameters:
              - name: id
                in: path
                required: true
                schema:
                    type: integer
            responses:
              '200':
                description: Le todo correspondant a l'id
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'
        delete:
            tags:
                - todo
            parameters:
              - name: id
                in: path
                required: true
                schema:
                    type: integer
            responses:
              '200':
                description: Todo supprime
              '400':
                description: Todo non trouve
```

2. Ajouter la methode dans le controleur :

```java
    @DeleteMapping(path = "todo/{id}")
    public void deleteTodo(@PathVariable("id") final long id) {
        if (todos.remove(id) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }
```

Ajouter les imports necessaires :
```java
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.server.ResponseStatusException;
```

Tester : creer un todo (POST), le supprimer (DELETE avec son id), puis tenter de le supprimer a nouveau -> 400.

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV1.java` : ajout de la route DELETE

---

### Q2.3 Get v2

> A l'instar du `delete` de la question precedente, ameliorez le `get` developpe lors du TP 1 (meilleure gestion d'un mauvais id fourni).
> Testez avec Swagger Editor.

**Answer:**

Modifier la methode `getTodo` pour retourner un code 400 si l'id n'existe pas :

```java
    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        final Todo todo = todos.get(id);
        if (todo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        return todo;
    }
```

Modifier le Swagger Editor pour ajouter la reponse 400 au GET :
```yaml
        get:
            tags:
                - todo
            parameters:
              - name: id
                in: path
                required: true
                schema:
                    type: integer
            responses:
              '200':
                description: Le todo correspondant a l'id
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'
              '400':
                description: Todo non trouve
```

Tester : GET avec un id inexistant -> 400. GET avec un id existant -> 200 + JSON.

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV1.java` : amelioration du GET avec gestion d'erreur

---

### Q2.4 Put

> Le `Put` remplace un objet par un autre. C'est une maniere de modifier completement un objet.
> Ajoutez une route `PUT` `/v1/public/todo/todo` qui fera cette operation sur un todo. Pour cela vous pouvez copier-coller-adapter la route `POST` car assez proche.
> Si l'objet n'existe pas (si l'ID donne ne correspond pas a un objet existant), alors une reponse avec un code `BAD_REQUEST` (code 400) sera retournee.
> Testez avec Swagger Editor.

**Answer:**

1. Ajouter dans Swagger Editor :
```yaml
        put:
            tags:
                - todo
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'
            responses:
              '200':
                description: Todo remplace
              '400':
                description: Todo non trouve
```

2. Ajouter la methode dans le controleur :

```java
    @PutMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void replaceTodo(@RequestBody final Todo todo) {
        if (!todos.containsKey(todo.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        todos.put(todo.getId(), todo);
    }
```

Ajouter l'import :
```java
import org.springframework.web.bind.annotation.PutMapping;
```

Tester : creer un todo (POST), puis le remplacer entierement (PUT avec le meme id mais des nouvelles donnees).

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV1.java` : ajout de la route PUT

---

### Q2.5 Patch pas terrible

> Ajoutez une route `PATCH` `todo` qui modifiera un todo. Pour cela copier-coller-modifier la route `POST` `todo` car cette premiere version du patch est assez similaire. Cette route devra alors chercher dans la liste le todo dont l'id est egal a celui du todo passe en parametre. Si la recherche echoue, alors retourner un code `400`. Si elle reussit, alors vous utiliserez les setters de `Todo`.
> Cette maniere de faire le patch souffre de plusieurs defauts importants. Lesquels selon vous ?

**Answer:**

1. Ajouter dans Swagger Editor :
```yaml
        patch:
            tags:
                - todo
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Todo'
            responses:
              '200':
                description: Todo modifie
              '400':
                description: Todo non trouve
```

2. Ajouter la methode dans le controleur :

```java
    @PatchMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void patchTodo(@RequestBody final Todo todo) {
        final Todo todoFound = todos.get(todo.getId());
        if (todoFound == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        if (todo.getTitle() != null) {
            todoFound.setTitle(todo.getTitle());
        }
        if (todo.getDescription() != null) {
            todoFound.setDescription(todo.getDescription());
        }
        if (todo.getCategories() != null) {
            todoFound.setCategories(todo.getCategories());
        }
    }
```

Ajouter l'import :
```java
import org.springframework.web.bind.annotation.PatchMapping;
```

**Defauts de cette approche du patch :**
1. **On ne peut pas mettre un champ a `null`** : si on envoie `"title": null`, on ne sait pas si c'est volontaire (on veut effacer le titre) ou si le champ n'etait tout simplement pas dans le body JSON. Jackson deserialisera un champ absent et un champ `null` de la meme maniere.
2. **Code fragile** : chaque nouveau champ ajoute a `Todo` necessite un `if` supplementaire dans le patch. C'est du code repetitif et source d'oublis.
3. **Pas de standard** : cette approche ne suit pas le standard JSON Patch (RFC 6902) ou JSON Merge Patch (RFC 7386).

Lecture recommandee : https://stackoverflow.com/a/19111046/9649530

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV1.java` : ajout de la route PATCH

---

### Fichier complet TodoControllerV1 (fin du TP 2)

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV1.java
package tpspring.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import tpspring.model.Todo;

@RestController
@RequestMapping("api/v1/public/todo")
@CrossOrigin
public class TodoControllerV1 {
    private final Map<Long, Todo> todos;
    private long cpt;

    public TodoControllerV1() {
        todos = new HashMap<>();
        cpt = 0;
    }

    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        final Todo todo = todos.get(id);
        if (todo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        return todo;
    }

    @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo addTodo(@RequestBody final Todo todo) {
        cpt++;
        todo.setId(cpt);
        todos.put(cpt, todo);
        System.out.println(todos);
        return todo;
    }

    @DeleteMapping(path = "todo/{id}")
    public void deleteTodo(@PathVariable("id") final long id) {
        if (todos.remove(id) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }

    @PutMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void replaceTodo(@RequestBody final Todo todo) {
        if (!todos.containsKey(todo.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        todos.put(todo.getId(), todo);
    }

    @PatchMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void patchTodo(@RequestBody final Todo todo) {
        final Todo todoFound = todos.get(todo.getId());
        if (todoFound == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        if (todo.getTitle() != null) {
            todoFound.setTitle(todo.getTitle());
        }
        if (todo.getDescription() != null) {
            todoFound.setDescription(todo.getDescription());
        }
        if (todo.getCategories() != null) {
            todoFound.setCategories(todo.getCategories());
        }
    }
}
```

---

## TP 3

### Q3.1 Controleur V2

> Copiez-collez le controleur `TodoControllerV1.java` pour avoir un `TodoControllerV2.java` dont le `RequestMapping` indique `api/v2/public/todo`.
> Dans Swagger, les routes creees aux TP precedents etaient destinees a la `v1`. Pour interagir avec la `v2` vous devrez copier-coller-adapter les routes de `v1` en fonction des besoins du controleur `v2`. Mettez en commentaire toutes les routes de ce nouveau controleur.

**Answer:**

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV2.java
package tpspring.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import tpspring.model.Todo;

@RestController
@RequestMapping("api/v2/public/todo")
@CrossOrigin
public class TodoControllerV2 {
    private final Map<Long, Todo> todos;
    private long cpt;

    public TodoControllerV2() {
        todos = new HashMap<>();
        cpt = 0;
    }

    // @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    // public Todo getTodo(@PathVariable("id") final long id) {
    //     final Todo todo = todos.get(id);
    //     if (todo == null) {
    //         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
    //     }
    //     return todo;
    // }

    // @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
    //              produces = MediaType.APPLICATION_JSON_VALUE)
    // public Todo addTodo(@RequestBody final Todo todo) {
    //     cpt++;
    //     todo.setId(cpt);
    //     todos.put(cpt, todo);
    //     System.out.println(todos);
    //     return todo;
    // }

    // @DeleteMapping(path = "todo/{id}")
    // public void deleteTodo(@PathVariable("id") final long id) {
    //     if (todos.remove(id) == null) {
    //         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
    //     }
    // }

    // @PutMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    // public void replaceTodo(@RequestBody final Todo todo) {
    //     if (!todos.containsKey(todo.getId())) {
    //         throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
    //     }
    //     todos.put(todo.getId(), todo);
    // }

    // @PatchMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    // public void patchTodo(@RequestBody final Todo todo) {
    //     ...
    // }
}
```

Dans Swagger Editor, dupliquer les routes `/v1/...` en `/v2/...`.

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV2.java` : nouveau fichier -- copie de V1 avec routes commentees et RequestMapping en v2

---

### Q3.2 Service

> Dans un package `tpspring/service`, creez un service `TodoServiceV1` (n'oubliez pas l'annotation `@Service`) et ajoutez un attribut de ce type dans votre nouveau controleur avec `@Autowired`. Que fait cette annotation ?
>
> Deplacez les attributs `cpt` et `todos` dans ce service. Cela va vous demander de modifier la plupart des routes de votre controleur pour deleguer au service toute la logique CRUD des operations.
>
> Que se passe-t-il si je mets un attribut `@Autowired TodoServiceV1...` dans un autre controleur ?
> Quels sont les avantages d'un service par rapport a nos 2 TP precedents ?

**Answer:**

1. Creer le service :

```java
// Fichier : src/main/java/tpspring/service/TodoServiceV1.java
package tpspring.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import tpspring.model.Todo;

@Service
public class TodoServiceV1 {
    private final Map<Long, Todo> todos;
    private long cpt;

    public TodoServiceV1() {
        todos = new HashMap<>();
        cpt = 0;
    }

    public Todo addTodo(final Todo todo) {
        cpt++;
        todo.setId(cpt);
        todos.put(cpt, todo);
        System.out.println(todos);
        return todo;
    }

    // true si newTodo correspond a un todo existant
    public boolean replaceTodo(final Todo newTodo) {
        if (!todos.containsKey(newTodo.getId())) {
            return false;
        }
        todos.put(newTodo.getId(), newTodo);
        return true;
    }

    // true si l'id correspond a un todo existant
    public boolean removeTodo(final long id) {
        return todos.remove(id) != null;
    }

    public Todo modifyTodo(final Todo partialTodo) {
        final Todo todoFound = todos.get(partialTodo.getId());
        if (todoFound == null) {
            return null;
        }
        if (partialTodo.getTitle() != null) {
            todoFound.setTitle(partialTodo.getTitle());
        }
        if (partialTodo.getDescription() != null) {
            todoFound.setDescription(partialTodo.getDescription());
        }
        if (partialTodo.getCategories() != null) {
            todoFound.setCategories(partialTodo.getCategories());
        }
        return todoFound;
    }

    public Todo findTodo(final long id) {
        return todos.get(id);
    }
}
```

**Que fait `@Autowired` ?**
L'annotation `@Autowired` demande a Spring d'injecter automatiquement une instance du type demande (ici `TodoServiceV1`). Spring cree une seule instance du service (singleton par defaut) et la partage avec tous les composants qui la demandent. C'est le principe d'injection de dependances (IoC).

**Que se passe-t-il si je mets `@Autowired TodoServiceV1` dans un autre controleur ?**
Spring injecte la MEME instance du service. C'est un singleton : tous les controleurs partagent le meme service, et donc les memes donnees (`todos`, `cpt`). C'est un avantage car les donnees sont centralisees.

**Avantages d'un service :**
- Les donnees sont partagees entre plusieurs controleurs
- Separation des responsabilites : le controleur gere les requetes HTTP, le service gere la logique metier
- Le service est testable independamment du controleur
- Le controleur devient plus leger et plus lisible

**File changes:**
- `src/main/java/tpspring/service/TodoServiceV1.java` : nouveau fichier -- service avec logique CRUD

---

### Q3.4 Controleur V2 + service V1

> Decommentez et adaptez au fur et a mesure les methodes du `TodoControllerV2` pour utiliser `TodoServiceV1`.

**Answer:**

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV2.java (avec service)
package tpspring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import tpspring.model.Todo;
import tpspring.service.TodoServiceV1;

@RestController
@RequestMapping("api/v2/public/todo")
@CrossOrigin
public class TodoControllerV2 {
    @Autowired
    private TodoServiceV1 todoService;

    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        final Todo todo = todoService.findTodo(id);
        if (todo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        return todo;
    }

    @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo addTodo(@RequestBody final Todo todo) {
        return todoService.addTodo(todo);
    }

    @DeleteMapping(path = "todo/{id}")
    public void deleteTodo(@PathVariable("id") final long id) {
        if (!todoService.removeTodo(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }

    @PutMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void replaceTodo(@RequestBody final Todo todo) {
        if (!todoService.replaceTodo(todo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }

    @PatchMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void patchTodo(@RequestBody final Todo todo) {
        final Todo patched = todoService.modifyTodo(todo);
        if (patched == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }
}
```

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV2.java` : decommente et adapte pour utiliser le service

---

### Q3.4 Repository

> Les `repository` sont injectables tout comme les services. La difference est que ces premiers ont pour but de stocker des donnees et faciliter leur acces. Les services offrent des methodes pour realiser des operations, des calculs.
>
> Creez un repository CRUD pour les todo.
> Dupliquez `TodoServiceV1.java` en `TodoServiceV2`.
> Modifiez le code du service `TodoServiceV2` pour qu'il utilise desormais le repository.
> Remplacez `TodoServiceV1` par `TodoServiceV2` dans votre `TodoControllerV2`.
> Ajoutez les annotations necessaires dans la classe `Todo` pour que Spring identifie la cle unique.
> Testez votre nouveau controleur avec Swagger Editor.

**Answer:**

1. Creer le repository :

```java
// Fichier : src/main/java/tpspring/service/TodoCrudRepository.java
package tpspring.service;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import tpspring.model.Todo;

@Repository
public interface TodoCrudRepository extends CrudRepository<Todo, Long> {
}
```

2. Creer le service V2 :

```java
// Fichier : src/main/java/tpspring/service/TodoServiceV2.java
package tpspring.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tpspring.model.Todo;

@Service
public class TodoServiceV2 {
    @Autowired
    private TodoCrudRepository repository;

    public Todo addTodo(final Todo todo) {
        return repository.save(todo);
    }

    // Retourne true si newTodo correspond a un todo existant
    public boolean replaceTodo(final Todo newTodo) {
        if (!repository.existsById(newTodo.getId())) {
            return false;
        }
        repository.save(newTodo);
        return true;
    }

    // Retourne true si l'id correspond a un todo existant
    public boolean removeTodo(final long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public Optional<Todo> modifyTodo(final Todo partialTodo) {
        final Optional<Todo> optTodo = repository.findById(partialTodo.getId());
        if (optTodo.isEmpty()) {
            return Optional.empty();
        }
        final Todo todoFound = optTodo.get();
        if (partialTodo.getTitle() != null) {
            todoFound.setTitle(partialTodo.getTitle());
        }
        if (partialTodo.getDescription() != null) {
            todoFound.setDescription(partialTodo.getDescription());
        }
        if (partialTodo.getCategories() != null) {
            todoFound.setCategories(partialTodo.getCategories());
        }
        repository.save(todoFound);
        return Optional.of(todoFound);
    }

    public Optional<Todo> findTodo(final long id) {
        return repository.findById(id);
    }
}
```

La methode `save` du repository ne demande pas l'id unique car **JPA genere automatiquement l'id** grace aux annotations `@Id` et `@GeneratedValue`.

3. Ajouter les annotations JPA dans `Todo` :

```java
// Fichier : src/main/java/tpspring/model/Todo.java (modifie)
package tpspring.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    protected long id;
    protected String title;
    protected String description;
    protected List<Category> categories;

    protected TodoList list;

    protected String owner;

    public Todo(long id, String title) {
        this.id = id;
        this.title = title;
        description = "";
        categories = new ArrayList<>();
    }

    @Override
    public String toString() {
        return "Todo [id=" + id + ", title=" + title
                + ", description=" + description + ", categories=" + categories + "]";
    }
}
```

4. Adapter `TodoControllerV2` pour utiliser `TodoServiceV2` :

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV2.java (avec service V2)
package tpspring.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import tpspring.model.Todo;
import tpspring.service.TodoServiceV2;

@RestController
@RequestMapping("api/v2/public/todo")
@CrossOrigin
public class TodoControllerV2 {
    @Autowired
    private TodoServiceV2 todoService;

    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        final Optional<Todo> todo = todoService.findTodo(id);
        if (todo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        return todo.get();
    }

    @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo addTodo(@RequestBody final Todo todo) {
        return todoService.addTodo(todo);
    }

    @DeleteMapping(path = "todo/{id}")
    public void deleteTodo(@PathVariable("id") final long id) {
        if (!todoService.removeTodo(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }

    @PutMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void replaceTodo(@RequestBody final Todo todo) {
        if (!todoService.replaceTodo(todo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }

    @PatchMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void patchTodo(@RequestBody final Todo todo) {
        final Optional<Todo> patched = todoService.modifyTodo(todo);
        if (patched.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
    }
}
```

**File changes:**
- `src/main/java/tpspring/service/TodoCrudRepository.java` : nouveau fichier -- repository CRUD
- `src/main/java/tpspring/service/TodoServiceV2.java` : nouveau fichier -- service utilisant le repository
- `src/main/java/tpspring/model/Todo.java` : ajout de `@Entity`, `@Id`, `@GeneratedValue`
- `src/main/java/tpspring/controller/TodoControllerV2.java` : utilise `TodoServiceV2` avec `Optional`

---

## TP 4

### Q4.1 Retour des routes REST

> Etant donne le code ci-dessous, qu'est-ce qui est retourne au client qui a envoye la requete REST ? Un objet `Todo` ?
> ```java
> @GetMapping(path = "todo", produces = MediaType.APPLICATION_JSON_VALUE)
> public Todo todo() {
>   return new Todo(1, "A title", "desc", List.of(Category.ENTERTAINMENT, Category.WORK), "foo");
> }
> ```
> Et maintenant avec cette methode qui retourne `void` ?
> ```java
> @DeleteMapping(path = "todo/{id}")
> public void deleteTodo(@PathVariable("id") final long id) { ... }
> ```

**Answer:**

**Pour le GET retournant `Todo` :**
Non, ce n'est pas un objet Java `Todo` qui est retourne au client. Spring utilise Jackson pour **marshaller** (serialiser) l'objet Java `Todo` en **JSON**. Le client recoit donc une chaine de caracteres JSON representant le todo :
```json
{
  "id": 1,
  "title": "A title",
  "description": "desc",
  "categories": ["ENTERTAINMENT", "WORK"],
  "owner": "foo"
}
```
L'annotation `produces = MediaType.APPLICATION_JSON_VALUE` indique que le format de sortie est JSON. Spring convertit automatiquement l'objet Java en JSON via le `HttpMessageConverter` de Jackson.

**Pour le DELETE retournant `void` :**
Quand une methode retourne `void`, Spring renvoie une reponse HTTP avec le **code 200 OK** et un **body vide**. Le client recoit juste le code de statut HTTP sans aucun contenu.

---

### Q4.2

> Du coup, quelle difference avec le code suivant ? Que permet le code suivant ?
> ```java
> @PutMapping(path = "user", consumes = MediaType.APPLICATION_JSON_VALUE)
> public ResponseEntity<String> replaceUser(@RequestBody final User patchedUser) {
>   if(patchedUser.getId().equals(dataService.getUser().getId())) {
>     dataService.setUser(patchedUser);
>     return ResponseEntity.ok().build();
>   }
>   throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The ID is not the same");
> }
> ```

**Answer:**

La difference est que `ResponseEntity<String>` permet un **controle fin de la reponse HTTP** :
- On peut choisir le **code de statut** (200, 201, 204, etc.)
- On peut ajouter des **headers HTTP** personnalises
- On peut choisir le **type du body** (ici `String`, mais ca pourrait etre un objet)

Avec un retour direct (`return user;`), Spring renvoie automatiquement 200 avec l'objet marshalle. Avec `ResponseEntity`, on a plus de flexibilite. Par exemple :
- `ResponseEntity.ok().build()` -> 200 sans body
- `ResponseEntity.status(HttpStatus.CREATED).body(user)` -> 201 avec l'objet
- `ResponseEntity.noContent().build()` -> 204 sans body

---

### Q4.3 Les exceptions

> Toujours avec le code du DELETE, qu'est-ce qui est retourne au client lorsqu'une exception est levee ?

**Answer:**

Quand `throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not possible")` est execute, Spring intercepte l'exception et retourne au client :
- **Code HTTP** : 400 Bad Request
- **Body JSON** contenant les details de l'erreur :
```json
{
  "timestamp": "2024-XX-XXTXX:XX:XX.XXX+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Not possible",
  "path": "/api/v2/public/todo/todo/999"
}
```

Spring genere automatiquement ce JSON d'erreur. Le client recoit donc une reponse structuree avec le code d'erreur et le message explicatif.

---

### Q4.4 Marshalling avec heritage

> La classe `SpecificTodo` est une sous-classe de `Todo`. Modifiez temporairement la route `GET` `todo/todo/{id}` pour qu'elle retourne un `SpecificTodo`. Relancez le serveur et testez cette route. Utilisez le resultat retourne pour l'envoyer via la route `POST`. Pourquoi cette derniere ne cree-t-elle finalement pas un `SpecificTodo` mais un `Todo` ?
> Ajoutez les annotations necessaires pour que cela fonctionne. Cf vers le slide 47. Il vous faudra aussi ajouter l'annotation `@Entity`.

**Answer:**

1. Modifier temporairement le GET :
```java
    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        // Temporaire pour tester le polymorphisme
        return new SpecificTodo(1L, "Test specific");
    }
```

2. Le GET retourne un JSON contenant les champs de `SpecificTodo` (y compris `specificAttr`). Mais quand on envoie ce JSON via POST, Spring deserialisera un `Todo` (pas un `SpecificTodo`) car **Jackson ne sait pas quel type concret instancier**. Le type declare dans la methode POST est `Todo`, et Jackson n'a aucune indication pour savoir qu'il faut creer un `SpecificTodo`.

3. Pour que le polymorphisme fonctionne, il faut ajouter les annotations Jackson dans `Todo` :

```java
// Fichier : src/main/java/tpspring/model/Todo.java (avec annotations polymorphisme)
package tpspring.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Todo.class, name = "todo"),
    @JsonSubTypes.Type(value = SpecificTodo.class, name = "specificTodo")
})
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    protected long id;
    protected String title;
    protected String description;
    protected List<Category> categories;
    protected TodoList list;
    protected String owner;

    public Todo(long id, String title) {
        this.id = id;
        this.title = title;
        description = "";
        categories = new ArrayList<>();
    }

    @Override
    public String toString() {
        return "Todo [id=" + id + ", title=" + title
                + ", description=" + description + ", categories=" + categories + "]";
    }
}
```

Et ajouter `@Entity` sur `SpecificTodo` :

```java
// Fichier : src/main/java/tpspring/model/SpecificTodo.java (modifie)
package tpspring.model;

import jakarta.persistence.Entity;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(callSuper = true)
@Entity
public class SpecificTodo extends Todo {
    private String specificAttr;

    public SpecificTodo(long id, String title) {
        super(id, title);
        specificAttr = "specific";
    }
}
```

Maintenant le JSON contiendra un champ `"type": "specificTodo"` qui permet a Jackson de savoir quel type instancier. Penser a remettre le GET comme avant.

**File changes:**
- `src/main/java/tpspring/model/Todo.java` : ajout de `@JsonTypeInfo` et `@JsonSubTypes`
- `src/main/java/tpspring/model/SpecificTodo.java` : ajout de `@Entity`

---

### Q4.5

> Creez un nouveau controleur (URI `api/v2/public/todolist`), un nouveau service et un nouveau repository pour les `TodoList`.

**Answer:**

1. Repository :

```java
// Fichier : src/main/java/tpspring/service/TodoListCrudRepository.java
package tpspring.service;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import tpspring.model.TodoList;

@Repository
public interface TodoListCrudRepository extends CrudRepository<TodoList, Long> {
}
```

2. Service :

```java
// Fichier : src/main/java/tpspring/service/TodoListService.java
package tpspring.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tpspring.model.TodoList;

@Service
public class TodoListService {
    @Autowired
    private TodoListCrudRepository repository;

    public TodoList addTodoList(final TodoList todoList) {
        return repository.save(todoList);
    }

    public Optional<TodoList> findTodoList(final long id) {
        return repository.findById(id);
    }

    public boolean removeTodoList(final long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }
}
```

3. Controleur :

```java
// Fichier : src/main/java/tpspring/controller/TodoListController.java
package tpspring.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import tpspring.model.TodoList;
import tpspring.service.TodoListService;

@RestController
@RequestMapping("api/v2/public/todolist")
@CrossOrigin
public class TodoListController {
    @Autowired
    private TodoListService todoListService;

    @PostMapping(path = "todolist", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public TodoList addTodoList(@RequestBody final TodoList todoList) {
        return todoListService.addTodoList(todoList);
    }

    @GetMapping(path = "todolist/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public TodoList getTodoList(@PathVariable("id") final long id) {
        final Optional<TodoList> todoList = todoListService.findTodoList(id);
        if (todoList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TodoList not found");
        }
        return todoList.get();
    }
}
```

**File changes:**
- `src/main/java/tpspring/service/TodoListCrudRepository.java` : nouveau repository
- `src/main/java/tpspring/service/TodoListService.java` : nouveau service
- `src/main/java/tpspring/controller/TodoListController.java` : nouveau controleur

---

### Q4.6

> Ajoutez dans Swagger Editor et dans votre nouveau controleur les routes REST suivantes :
> - une route pour ajouter une `TodoList` vide. Vous devrez ajouter des annotations a `TodoList` a l'instar de `Todo`. Vous devrez egalement ajouter des annotations JPA pour identifier les cles etrangeres de `TodoList` et `Todo` : regardez les annotations `@OneToMany` et `@ManyToOne`.

**Answer:**

Modifier `TodoList` avec les annotations JPA :

```java
// Fichier : src/main/java/tpspring/model/TodoList.java (modifie)
package tpspring.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class TodoList {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
    private String name;
    private String owner;

    @OneToMany(mappedBy = "list")
    private List<Todo> todos;

    public TodoList(final String name) {
        super();
        this.name = name;
        todos = new ArrayList<>();
    }
}
```

Modifier `Todo` pour ajouter `@ManyToOne` sur l'attribut `list` :

```java
// Dans Todo.java, modifier l'attribut list :
    @ManyToOne
    protected TodoList list;
```

La route POST pour ajouter une `TodoList` vide est deja definie dans le controleur de Q4.5. On envoie un JSON avec `name` et `owner` :

```json
{
  "name": "Ma liste de courses",
  "owner": "theo"
}
```

Swagger Editor :
```yaml
    /v2/public/todolist/todolist:
        post:
            tags:
                - todolist
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/TodoList'
            responses:
              '200':
                description: TodoList creee
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/TodoList'
```

Et dans components/schemas :
```yaml
    TodoList:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        owner:
          type: string
```

**File changes:**
- `src/main/java/tpspring/model/TodoList.java` : ajout de `@Entity`, `@Id`, `@GeneratedValue`, `@OneToMany`, getters/setters Lombok
- `src/main/java/tpspring/model/Todo.java` : ajout de `@ManyToOne` sur l'attribut `list`

---

## TP 5

### Q5.1 DTO

> La route pour ajouter un objet `TodoList` vide n'est pas optimale : pourquoi envoyer un objet `TodoList` alors que nous n'avons besoin que de son nom et de sa description ?
> A la place d'un objet `TodoList`, utilisez le record `NamedDTO` (package `tpspring/controller/dto`) contenant un attribut correspondant a un nom.
> Les DTO ne devraient pas etre utilises en dehors des controleurs REST.

**Answer:**

Le record `NamedDTO` fourni :

```java
// Fichier : src/main/java/tpspring/controller/dto/NamedDTO.java (fourni, a modifier)
package tpspring.controller.dto;

public record NamedDTO(String name, String description) {
}
```

Note : on ajoute `description` au record car le sujet mentionne "un attribut correspondant a un nom ; un attribut pour la description".

Modifier la route POST du `TodoListController` :

```java
// Dans TodoListController.java
import tpspring.controller.dto.NamedDTO;

    @PostMapping(path = "todolist", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public TodoList addTodoList(@RequestBody final NamedDTO dto) {
        final TodoList todoList = new TodoList(dto.name());
        return todoListService.addTodoList(todoList);
    }
```

Ajouter le DTO dans Swagger Editor :
```yaml
    NamedDTO:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
```

Et modifier la route POST pour utiliser le DTO :
```yaml
    /v2/public/todolist/todolist:
        post:
            tags:
                - todolist
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/NamedDTO'
            responses:
              '200':
                description: TodoList creee
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/TodoList'
```

**File changes:**
- `src/main/java/tpspring/controller/dto/NamedDTO.java` : ajout du champ `description`
- `src/main/java/tpspring/controller/TodoListController.java` : utilisation du DTO au lieu de TodoList

---

### Q5.2

> Ajoutez une route pour ajouter un todo a une todo list (un todo peut etre dans plusieurs lists pour l'instant). Attention, vous aurez donc besoin de l'id du todo a ajouter et de l'id de la todo list concernee. Donc votre `TodoListService` aura les deux repositories.
> Attention, une boucle infinie va survenir. Il faut casser cette boucle avec `@JsonIgnore` sur l'attribut `list` de `Todo`.

**Answer:**

1. Ajouter `@JsonIgnore` dans `Todo` :

```java
// Dans Todo.java, sur l'attribut list :
import com.fasterxml.jackson.annotation.JsonIgnore;

    @ManyToOne
    @JsonIgnore
    protected TodoList list;
```

2. Modifier `TodoListService` pour avoir les deux repositories :

```java
// Fichier : src/main/java/tpspring/service/TodoListService.java (modifie)
package tpspring.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tpspring.model.Todo;
import tpspring.model.TodoList;

@Service
public class TodoListService {
    @Autowired
    private TodoListCrudRepository todoListRepository;

    @Autowired
    private TodoCrudRepository todoRepository;

    public TodoList addTodoList(final TodoList todoList) {
        return todoListRepository.save(todoList);
    }

    public Optional<TodoList> findTodoList(final long id) {
        return todoListRepository.findById(id);
    }

    public boolean removeTodoList(final long id) {
        if (!todoListRepository.existsById(id)) {
            return false;
        }
        todoListRepository.deleteById(id);
        return true;
    }

    public Optional<TodoList> addTodoToList(final long todoId, final long listId) {
        final Optional<Todo> optTodo = todoRepository.findById(todoId);
        final Optional<TodoList> optList = todoListRepository.findById(listId);

        if (optTodo.isEmpty() || optList.isEmpty()) {
            return Optional.empty();
        }

        final Todo todo = optTodo.get();
        final TodoList list = optList.get();

        todo.setList(list);
        list.getTodos().add(todo);

        todoRepository.save(todo);
        todoListRepository.save(list);

        return Optional.of(list);
    }
}
```

3. Ajouter la route dans le controleur :

```java
// Dans TodoListController.java
import org.springframework.web.bind.annotation.PutMapping;

    @PutMapping(path = "todolist/{listId}/todo/{todoId}",
                produces = MediaType.APPLICATION_JSON_VALUE)
    public TodoList addTodoToList(@PathVariable("todoId") final long todoId,
                                  @PathVariable("listId") final long listId) {
        final Optional<TodoList> result = todoListService.addTodoToList(todoId, listId);
        if (result.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo or TodoList not found");
        }
        return result.get();
    }
```

**File changes:**
- `src/main/java/tpspring/model/Todo.java` : ajout de `@JsonIgnore` sur `list`
- `src/main/java/tpspring/service/TodoListService.java` : ajout du `todoRepository` et de `addTodoToList`
- `src/main/java/tpspring/controller/TodoListController.java` : ajout de la route PUT pour ajouter un todo a une liste

---

### Q5.3 Patch Todo

> Nous allons modifier la requete `patch` `todo/todo` pour la rendre de meilleure qualite.
> Inspirez-vous du slide 31 (ou slides autour) pour modifier la requete et le service pour patch correctement le todo.
> Modifiez le Swagger Editor et testez.

**Answer:**

L'approche amelioree utilise `ObjectMapper.updateValue()` de Jackson qui permet de merger un `Map` de champs partiels dans un objet existant :

1. Modifier le controleur :

```java
// Dans TodoControllerV2.java
import java.util.Map;

    @PatchMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                  produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo patchTodo(@RequestBody final Map<String, Object> updates) {
        if (!updates.containsKey("id")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing id");
        }
        final long id = ((Number) updates.get("id")).longValue();
        final Optional<Todo> patched = todoService.modifyTodo(id, updates);
        if (patched.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        return patched.get();
    }
```

2. Modifier le service :

```java
// Dans TodoServiceV2.java
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class TodoServiceV2 {
    @Autowired
    private TodoCrudRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    // ... (autres methodes inchangees)

    public Optional<Todo> modifyTodo(final long id, final Map<String, Object> updates) {
        final Optional<Todo> optTodo = repository.findById(id);
        if (optTodo.isEmpty()) {
            return Optional.empty();
        }
        try {
            final Todo todoFound = optTodo.get();
            final Todo patched = objectMapper.updateValue(todoFound, updates);
            repository.save(patched);
            return Optional.of(patched);
        } catch (final Exception e) {
            return Optional.empty();
        }
    }
}
```

Cette approche est meilleure car :
- On n'a pas besoin d'un `if` pour chaque champ
- Les champs absents du Map ne sont pas modifies
- Les champs presents a `null` sont mis a null (distinction possible)
- Moins de code repetitif

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV2.java` : PATCH prend un `Map<String, Object>` au lieu d'un `Todo`
- `src/main/java/tpspring/service/TodoServiceV2.java` : `modifyTodo` utilise `ObjectMapper.updateValue()`

---

### Q5.4 Query

> Ajoutez une query dans le repository des `Todo` pour retourner la liste des `Todo` dont le titre contient le texte donne en parametre.
> Ajoutez la requete REST associee dans le controleur Todo v2 et testez avec Swagger Editor.

**Answer:**

1. Ajouter la query dans le repository :

```java
// Fichier : src/main/java/tpspring/service/TodoCrudRepository.java (modifie)
package tpspring.service;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import tpspring.model.Todo;

@Repository
public interface TodoCrudRepository extends CrudRepository<Todo, Long> {
    List<Todo> findByTitleContaining(String title);
}
```

Spring Data genere automatiquement l'implementation de cette methode a partir du nom : `findBy` + `Title` + `Containing` = `SELECT * FROM todo WHERE title LIKE '%text%'`.

2. Ajouter la methode dans le service :

```java
// Dans TodoServiceV2.java
    public List<Todo> findByTitle(final String title) {
        return repository.findByTitleContaining(title);
    }
```

3. Ajouter la route dans le controleur :

```java
// Dans TodoControllerV2.java
import java.util.List;

    @GetMapping(path = "todos/{title}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Todo> getTodosByTitle(@PathVariable("title") final String title) {
        return todoService.findByTitle(title);
    }
```

4. Ajouter dans Swagger Editor :
```yaml
    /v2/public/todo/todos/{title}:
        get:
            tags:
                - todo
            parameters:
              - name: title
                in: path
                required: true
                schema:
                    type: string
            responses:
              '200':
                description: Liste des todos contenant le titre
                content:
                    application/json:
                        schema:
                            type: array
                            items:
                                $ref: '#/components/schemas/Todo'
```

**File changes:**
- `src/main/java/tpspring/service/TodoCrudRepository.java` : ajout de `findByTitleContaining`
- `src/main/java/tpspring/service/TodoServiceV2.java` : ajout de `findByTitle`
- `src/main/java/tpspring/controller/TodoControllerV2.java` : ajout de la route GET par titre

---

## TP 6 -- Test

> Le sujet de ce TP est simple. Developpez une suite de tests qui teste la derniere version de votre controleur, votre service, et repository avec une couverture de branche de 100%.
> En test unitaire (TU) nous testons chaque classe separement, donc le service puis le controleur (le repository n'a pas de code etant gere par Spring).
>
> Completez la classe de tests `TestTodoServiceV2`. Nous fournissons un premier test pour vous aider. Cette suite de tests requiert l'utilisation de *mocks*.
> Completez la classe de tests `TestTodoControllerV2`. L'utilisation de mocks est egalement necessaire.

**Answer:**

### Tests du service (TestTodoServiceV2)

```java
// Fichier : src/test/java/tpspring/service/TestTodoServiceV2.java
package tpspring.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.databind.ObjectMapper;

import tpspring.model.Category;
import tpspring.model.Todo;

@ExtendWith(MockitoExtension.class)
public class TestTodoServiceV2 {
    @Mock
    private TodoCrudRepository repository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private TodoServiceV2 todoService;

    private Todo todo;
    private Todo todo2;

    @BeforeEach
    void setUp() {
        todo = new Todo();
        todo.setId(1L);
        todo.setTitle("title 1");
        todo.setDescription("desc 1");
        todo.setCategories(List.of(Category.LOW_PRIORITY));
        todo.setOwner("foo");

        todo2 = new Todo();
        todo2.setId(2L);
        todo2.setTitle("title 2");
        todo2.setDescription("desc 2");
        todo2.setCategories(List.of(Category.HIGH_PRIORITY));
        todo2.setOwner("bar");
    }

    @Test
    void addTodoIsOk() {
        when(repository.save(todo)).thenReturn(todo2);
        Todo res = todoService.addTodo(todo);
        assertSame(todo2, res);
        verify(repository).save(todo);
    }

    @Test
    void findTodoExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(todo));
        Optional<Todo> res = todoService.findTodo(1L);
        assertTrue(res.isPresent());
        assertSame(todo, res.get());
    }

    @Test
    void findTodoDoesNotExist() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        Optional<Todo> res = todoService.findTodo(99L);
        assertTrue(res.isEmpty());
    }

    @Test
    void removeTodoExists() {
        when(repository.existsById(1L)).thenReturn(true);
        boolean res = todoService.removeTodo(1L);
        assertTrue(res);
        verify(repository).deleteById(1L);
    }

    @Test
    void removeTodoDoesNotExist() {
        when(repository.existsById(99L)).thenReturn(false);
        boolean res = todoService.removeTodo(99L);
        assertFalse(res);
        verify(repository, never()).deleteById(anyLong());
    }

    @Test
    void replaceTodoExists() {
        when(repository.existsById(1L)).thenReturn(true);
        boolean res = todoService.replaceTodo(todo);
        assertTrue(res);
        verify(repository).save(todo);
    }

    @Test
    void replaceTodoDoesNotExist() {
        when(repository.existsById(1L)).thenReturn(false);
        boolean res = todoService.replaceTodo(todo);
        assertFalse(res);
        verify(repository, never()).save(any());
    }

    @Test
    void modifyTodoExists() throws Exception {
        Map<String, Object> updates = Map.of("title", "new title");
        when(repository.findById(1L)).thenReturn(Optional.of(todo));
        when(objectMapper.updateValue(todo, updates)).thenReturn(todo);

        Optional<Todo> res = todoService.modifyTodo(1L, updates);
        assertTrue(res.isPresent());
        verify(repository).save(todo);
    }

    @Test
    void modifyTodoDoesNotExist() {
        Map<String, Object> updates = Map.of("title", "new title");
        when(repository.findById(99L)).thenReturn(Optional.empty());

        Optional<Todo> res = todoService.modifyTodo(99L, updates);
        assertTrue(res.isEmpty());
    }

    @Test
    void findByTitleReturnsResults() {
        when(repository.findByTitleContaining("title")).thenReturn(List.of(todo, todo2));
        List<Todo> res = todoService.findByTitle("title");
        assertEquals(2, res.size());
    }
}
```

### Tests du controleur (TestTodoControllerV2)

```java
// Fichier : src/test/java/tpspring/controller/TestTodoControllerV2.java
package tpspring.controller;

import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import tpspring.model.Category;
import tpspring.model.Todo;
import tpspring.service.TodoServiceV2;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class TestTodoControllerV2 {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private TodoServiceV2 todoService;

    @Test
    @WithMockUser(value = "usertest")
    void testHello() throws Exception {
        mvc.perform(get("/api/v1/public/hello/helloworld"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
            .andExpect(content().string(equalTo("Hello World")));
    }

    @Test
    @WithMockUser(value = "usertest")
    void getTodoExists() throws Exception {
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setTitle("t1");
        todo.setDescription("desc");
        todo.setCategories(List.of(Category.LOW_PRIORITY));
        todo.setOwner("foo");

        Mockito.when(todoService.findTodo(1L)).thenReturn(Optional.of(todo));

        mvc.perform(get("/api/v2/public/todo/todo/1"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.title", equalTo("t1")))
            .andExpect(jsonPath("$.description", equalTo("desc")))
            .andExpect(jsonPath("$.categories", hasSize(1)))
            .andExpect(jsonPath("$.categories[0]", equalTo("LOW_PRIORITY")))
            .andExpect(jsonPath("$.owner", equalTo("foo")))
            .andExpect(jsonPath("$.id", equalTo(1)));
    }

    @Test
    @WithMockUser(value = "usertest")
    void getTodoNotFound() throws Exception {
        Mockito.when(todoService.findTodo(99L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/v2/public/todo/todo/99"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(value = "usertest")
    void postTodo() throws Exception {
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setTitle("new todo");

        Mockito.when(todoService.addTodo(Mockito.any(Todo.class))).thenReturn(todo);

        mvc.perform(post("/api/v2/public/todo/todo")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"new todo\",\"type\":\"todo\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title", equalTo("new todo")));
    }

    @Test
    @WithMockUser(value = "usertest")
    void deleteTodoExists() throws Exception {
        Mockito.when(todoService.removeTodo(1L)).thenReturn(true);

        mvc.perform(delete("/api/v2/public/todo/todo/1"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(value = "usertest")
    void deleteTodoNotFound() throws Exception {
        Mockito.when(todoService.removeTodo(99L)).thenReturn(false);

        mvc.perform(delete("/api/v2/public/todo/todo/99"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(value = "usertest")
    void putTodoExists() throws Exception {
        Mockito.when(todoService.replaceTodo(Mockito.any(Todo.class))).thenReturn(true);

        mvc.perform(put("/api/v2/public/todo/todo")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":1,\"title\":\"updated\",\"type\":\"todo\"}"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(value = "usertest")
    void putTodoNotFound() throws Exception {
        Mockito.when(todoService.replaceTodo(Mockito.any(Todo.class))).thenReturn(false);

        mvc.perform(put("/api/v2/public/todo/todo")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"id\":99,\"title\":\"updated\",\"type\":\"todo\"}"))
            .andExpect(status().isBadRequest());
    }
}
```

**File changes:**
- `src/test/java/tpspring/service/TestTodoServiceV2.java` : complete avec tous les tests du service
- `src/test/java/tpspring/controller/TestTodoControllerV2.java` : complete avec tous les tests du controleur

---

## TP 7 -- Page Web + requetes basiques

> Le but de ce TP est de comprendre comment une page Web fonctionne dans un navigateur.
> Pour ce TP, lancez le back et ouvrez, dans votre navigateur et dans IntelliJ, le fichier `index.html` se trouvant dans le dossier `tp7`.

### Q7.1

> Ctrl+U dans Firefox permet d'afficher le code source de la page.
>
> Qu'est-ce qu'un `body` ?
> Combien de `body` une page peut-elle avoir ?
> Qu'est-ce qu'un `div` ?
> A quoi sert l'attribut `id` ?
> Pourquoi on ne retrouve pas dans le code source du texte pourtant affiche par la page Web (le `Hello World`) ?

**Answer:**

Le fichier `index.html` fourni :
```html
<!DOCTYPE html>
<html>
  <head>
    <title>TP Web I</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link href="style.css" rel="stylesheet" type="text/css">
    <script src="script.js" type="text/javascript"></script>
 </head>
  <body>
    <h1>TP Web I -- Manipulation page Web</h1>
    <div class="content">
      <div id="hello">
      </div>
      <div id="todo">
      </div>
    </div>
  </body>
</html>
```

**Qu'est-ce qu'un `body` ?**
Le `<body>` est l'element HTML qui contient tout le contenu visible de la page web (texte, images, formulaires, etc.). C'est le "corps" du document HTML, par opposition au `<head>` qui contient les metadonnees (titre, CSS, scripts).

**Combien de `body` une page peut-elle avoir ?**
Une page HTML ne peut avoir qu'**un seul** element `<body>`.

**Qu'est-ce qu'un `div` ?**
Un `<div>` (division) est un conteneur generique qui permet de **regrouper des elements HTML** pour les styler (CSS) ou les manipuler (JavaScript). Il n'a pas de semantique propre (contrairement a `<article>`, `<section>`, etc.).

**A quoi sert l'attribut `id` ?**
L'attribut `id` donne un **identifiant unique** a un element HTML. Il permet de le selectionner en CSS (`#hello { ... }`) ou en JavaScript (`document.getElementById("hello")`). Un `id` doit etre unique dans toute la page.

**Pourquoi on ne retrouve pas "Hello World" dans le code source ?**
Le texte "Hello World" n'est pas dans le HTML statique. Il est **injecte dynamiquement par JavaScript** (`script.js`) qui fait une requete REST GET vers le back-end (`http://localhost:8080/api/v1/public/hello/helloworld`) et modifie le DOM en ecrivant la reponse dans le `div#hello` via `innerHTML`. Le code source (Ctrl+U) montre le HTML original, pas les modifications faites par JavaScript.

---

### Q7.2

> Dans ces sources, vous pouvez voir un lien vers `style.css` et `script.js`.
> Ouvrez `style.css` : a quoi sert ce fichier ?
> Dans Firefox, clic-droit -> Inspecter. Cliquez sur la balise `h1`, et etudiez son CSS affiche a droite.
> A quoi sert l'attribut `class` du premier `div` ?

**Answer:**

Le fichier `style.css` :
```css
h1 {
  font-size: 24px
}

.title {
 font-weight: bold
}

#todo {
  border: solid red;
}
```

**A quoi sert `style.css` ?**
Ce fichier CSS definit les **styles visuels** de la page HTML. Il separe la presentation (CSS) du contenu (HTML). Ici :
- `h1` a une taille de police de 24px
- `.title` (classe CSS) met le texte en gras
- `#todo` (id CSS) ajoute une bordure rouge pleine autour du div todo

**L'inspecteur Firefox montre que le `h1` :**
- Herite des styles par defaut du navigateur (font-weight bold, display block, margin)
- A le style personnalise `font-size: 24px` defini dans `style.css`

**A quoi sert l'attribut `class` du premier `div` ?**
`class="content"` permet d'appliquer des styles CSS a cet element (et a tous les elements ayant la meme classe). Contrairement a `id` (unique), une `class` peut etre utilisee sur **plusieurs elements**. Ici, la classe `content` n'est pas definie dans le CSS fourni, mais elle pourrait l'etre.

---

### Q7.3

> Ouvrez `script.js` : a quoi sert ce fichier ?
> Etudiez la fonction `getHelloWorld` pour comprendre ce qu'elle fait.

**Answer:**

Le fichier `script.js` fourni :
```javascript noexec
function getHelloWorld() {
  const apiURL = 'http://localhost:8080/api/v1/public/hello/helloworld';
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("loadend", evt => {
    if(evt.target.readyState === 4) {
      console.log('Query 1 executed with success');
      console.log(evt.target.responseText);

      const helloTag = document.getElementById("hello");
      helloTag.innerHTML = evt.target.responseText;
    }
  });

  xhr.open("GET", apiURL);
  xhr.send();
}

getHelloWorld();
```

**A quoi sert `script.js` ?**
Ce fichier JavaScript execute du code cote client (dans le navigateur). Il fait des requetes HTTP vers le back-end REST et modifie le DOM de la page avec les reponses.

**Analyse de `getHelloWorld` :**
1. `const apiURL = '...'` : definit l'URL de l'API REST a appeler
2. `const xhr = new XMLHttpRequest()` : cree un objet `XMLHttpRequest` pour envoyer une requete HTTP asynchrone
3. `xhr.addEventListener("loadend", ...)` : enregistre un callback qui sera execute quand la requete est terminee
4. `evt.target.readyState === 4` : verifie que la requete est completement terminee (readyState 4 = DONE)
5. `document.getElementById("hello")` : recupere le `div` avec l'id "hello"
6. `helloTag.innerHTML = evt.target.responseText` : remplace le contenu HTML du div par la reponse du serveur ("Hello World")
7. `xhr.open("GET", apiURL)` : prepare la requete GET
8. `xhr.send()` : envoie la requete

La fonction est appelee immediatement (`getHelloWorld()`) au chargement du script, donc "Hello World" apparait des que la page se charge.

---

### Q7.4

> Ajoutez et appelez une nouvelle fonction JavaScript `function getTodo(id)` qui modifiera le DOM de la page pour afficher le TODO retourne par la requete REST qui demandera au back-end le TODO correspondant a l'id donne en parametre.

**Answer:**

Modifier `script.js` :

```javascript noexec
// Fichier : tp7/script.js (modifie)

function getHelloWorld() {
  const apiURL = 'http://localhost:8080/api/v1/public/hello/helloworld';
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("loadend", evt => {
    if(evt.target.readyState === 4) {
      console.log('Query 1 executed with success');
      console.log(evt.target.responseText);

      const helloTag = document.getElementById("hello");
      helloTag.innerHTML = evt.target.responseText;
    }
  });

  xhr.open("GET", apiURL);
  xhr.send();
}

function getTodo(id) {
  const apiURL = 'http://localhost:8080/api/v2/public/todo/todo/' + id;
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("loadend", evt => {
    if(evt.target.readyState === 4) {
      const todoTag = document.getElementById("todo");

      if(evt.target.status === 200) {
        console.log('Todo retrieved successfully');
        const todo = JSON.parse(evt.target.responseText);
        console.log(todo);

        todoTag.innerHTML =
          '<h2>' + todo.title + '</h2>' +
          '<p><strong>Description :</strong> ' + todo.description + '</p>' +
          '<p><strong>Categories :</strong> ' + (todo.categories ? todo.categories.join(', ') : 'aucune') + '</p>' +
          '<p><strong>ID :</strong> ' + todo.id + '</p>';
      } else {
        console.log('Todo not found');
        todoTag.innerHTML = '<p>Todo non trouve (erreur ' + evt.target.status + ')</p>';
      }
    }
  });

  xhr.open("GET", apiURL);
  xhr.send();
}

getHelloWorld();
getTodo(1);
```

Note sur la securite : `innerHTML` est utilise ici pour le TP mais c'est une **passoire de securite** (XSS). En production, il faudrait utiliser `textContent` ou des methodes safe pour le DOM (cf. https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html).

**File changes:**
- `tp7/script.js` : ajout de la fonction `getTodo(id)` avec requete XHR et modification du DOM

---

## TP 8 -- Securite

### Q8.1

> Regardez le code de la classe `SecurityConfig` : que fait la ligne `.requestMatchers("/api/v*/public/**").permitAll()` selon vous ?
>
> Dans `TodoControllerV2`, remplacez `@RequestMapping("api/v2/public/todo")` par `@RequestMapping("api/v2/private/todo")`, modifiez votre Swagger Editor. Faites de meme pour `TodoListController`. Testez : que se passe-t-il desormais ?

**Answer:**

Le code de `SecurityConfig` fourni :
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v*/public/**").permitAll()
                .requestMatchers("/api/v*/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v*/private/**").hasRole("USER")
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().permitAll()
            )
            .csrf(config -> config.disable())
            .build();
    }
}
```

**Que fait `.requestMatchers("/api/v*/public/**").permitAll()` ?**
Cette ligne configure les regles de securite : toutes les URLs qui matchent le pattern `/api/v*/public/**` (ou `v*` matche n'importe quelle version : v1, v2, etc. et `**` matche n'importe quel sous-chemin) sont **accessibles a tous** sans authentification. C'est une route "publique".

A l'inverse :
- `/api/v*/private/**` necessite le role `USER` (authentification requise)
- `/api/v*/admin/**` necessite le role `ADMIN`

**Que se passe-t-il apres le changement `public` -> `private` ?**
En changeant `@RequestMapping("api/v2/public/todo")` en `@RequestMapping("api/v2/private/todo")`, les routes tombent maintenant dans le pattern `.requestMatchers("/api/v*/private/**").hasRole("USER")`. Il faut donc etre authentifie avec le role `USER` pour y acceder. Sans authentification, on recoit une **erreur 401 Unauthorized** (ou 403 Forbidden).

Modifier les controleurs :
```java
// TodoControllerV2.java
@RequestMapping("api/v2/private/todo")

// TodoListController.java
@RequestMapping("api/v2/private/todolist")
```

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV2.java` : `public` -> `private` dans RequestMapping
- `src/main/java/tpspring/controller/TodoListController.java` : `public` -> `private` dans RequestMapping

---

### Q8.2

> Creez un controleur Spring: `PublicUserController` (URI : `api/v2/public/user`).
> Utilisez le code fournit dans la classe `PublicUserController` du projet exemple pour ajouter une route pour creer un nouvel utilisateur et un autre pour s'identifier.
> Pour `UserDTO`, creez votre propre DTO.
> Ajoutez ces deux routes dans Swagger Editor et testez. Apres avoir utilise la route pour s'identifier, regardez la console d'IntelliJ. Que voyez-vous de special concernant l'authentification par cookie ?

**Answer:**

1. Creer le DTO :

```java
// Fichier : src/main/java/tpspring/controller/dto/UserDTO.java
package tpspring.controller.dto;

public record UserDTO(String pwd, String login) {}
```

2. Creer le controleur public d'utilisateur :

```java
// Fichier : src/main/java/tpspring/controller/PublicUserController.java
package tpspring.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import tpspring.controller.dto.UserDTO;

@RestController
@RequestMapping("api/v2/public/user")
@CrossOrigin
public class PublicUserController {
    @Autowired
    private InMemoryUserDetailsManager userDetailsManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(path = "signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void signup(@RequestBody final UserDTO user) {
        if (user.login() == null || user.pwd() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Login and password required");
        }
        final UserDetails userDetails = User.builder()
            .username(user.login().toLowerCase())
            .password(passwordEncoder.encode(user.pwd()))
            .roles("USER")
            .build();
        userDetailsManager.createUser(userDetails);
    }

    @PostMapping(path = "login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void login(@RequestBody final UserDTO user, final HttpServletRequest request) {
        if (user.login() == null || user.pwd() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Login and password required");
        }

        final UserDetails userDetails;
        try {
            userDetails = userDetailsManager.loadUserByUsername(user.login().toLowerCase());
        } catch (final Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found");
        }

        if (!passwordEncoder.matches(user.pwd(), userDetails.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wrong password");
        }

        final UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        final SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(auth);

        final HttpSession session = request.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", sc);

        System.out.println("User logged in: " + user.login());
        System.out.println("Session ID (JSESSIONID): " + session.getId());
    }
}
```

3. Ajouter dans Swagger Editor :
```yaml
    /v2/public/user/signup:
        post:
            tags:
                - user
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/UserDTO'
            responses:
              '200':
                description: Utilisateur cree

    /v2/public/user/login:
        post:
            tags:
                - user
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/UserDTO'
            responses:
              '200':
                description: Connecte avec succes
```

Et le schema :
```yaml
    UserDTO:
      type: object
      properties:
        login:
          type: string
        pwd:
          type: string
```

**Que voit-on dans la console d'IntelliJ ?**
On voit le **JSESSIONID** affiche : c'est l'identifiant de session HTTP. L'authentification par cookie fonctionne ainsi : apres le login, le serveur cree une session et envoie un cookie `JSESSIONID` au client. Ce cookie devra etre renvoye dans toutes les requetes suivantes vers les routes privees pour prouver que l'utilisateur est authentifie.

**File changes:**
- `src/main/java/tpspring/controller/dto/UserDTO.java` : nouveau fichier
- `src/main/java/tpspring/controller/PublicUserController.java` : nouveau fichier -- signup et login

---

### Q8.3

> Creez un controleur Spring: `PrivateUserController` (URI : `api/v2/private/user`).
> Ajoutez la route GET qui retourne le login de l'utilisateur authentifie.
> Pour tester cette route, il faut passer dans le cookie de la requete le parametre `JSESSIONID`.

**Answer:**

```java
// Fichier : src/main/java/tpspring/controller/PrivateUserController.java
package tpspring.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v2/private/user")
@CrossOrigin
public class PrivateUserController {
    @GetMapping()
    public String hello(final Principal user) {
        return user.getName();
    }
}
```

Tester avec curl :
```bash
# 1. Creer un utilisateur
curl -X POST 'http://localhost:8080/api/v2/public/user/signup' \
  -H 'Content-Type: application/json' \
  -d '{"login":"theo","pwd":"password123"}'

# 2. Se connecter (noter le JSESSIONID dans la console IntelliJ)
curl -X POST 'http://localhost:8080/api/v2/public/user/login' \
  -H 'Content-Type: application/json' \
  -d '{"login":"theo","pwd":"password123"}' -v
# -> Regarder le Set-Cookie dans la reponse ou la console IntelliJ pour le JSESSIONID

# 3. Acceder a la route privee avec le cookie
curl -X GET 'http://localhost:8080/api/v2/private/user' \
  --cookie 'JSESSIONID=<votre_session_id>'
# -> Retourne "theo"
```

Pour Swagger Editor, ajouter a la fin du modele OpenAPI :
```yaml
securitySchemes:
  CookieAuth:
    type: apiKey
    in: cookie
    name: JSESSIONID
    description: Use a session cookie to authenticate (see /login).
```

**File changes:**
- `src/main/java/tpspring/controller/PrivateUserController.java` : nouveau fichier -- route privee retournant le login

---

### Q8.4

> Il faut maintenant refaire fonctionner les routes de `TodoControllerV2`.
> Pour la route 'todo', nous voulons que le `owner` du `todo` cree soit le `login` de l'utilisateur authentifie. Pour cela, dans toutes les requetes qui necessiteront cette information vous devrez ajouter en parametre de la methode Java de la route : `Principal principal` et utiliser `principal.getName()`.

**Answer:**

Modifier la route POST dans `TodoControllerV2` :

```java
import java.security.Principal;

    @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo addTodo(@RequestBody final Todo todo, final Principal principal) {
        todo.setOwner(principal.getName());
        return todoService.addTodo(todo);
    }
```

Tester avec curl :
```bash
curl -X POST 'http://localhost:8080/api/v2/private/todo/todo' \
  --cookie 'JSESSIONID=<votre_session_id>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mon todo","description":"A faire","categories":["WORK"],"type":"todo"}'
```

Le todo cree aura `owner` egal au login de l'utilisateur authentifie.

**File changes:**
- `src/main/java/tpspring/controller/TodoControllerV2.java` : ajout de `Principal` dans le POST

---

### Q8.5

> Faites de meme pour toutes les autres routes REST du controleur `TodoControllerV2`.
> Attention : pour les routes *put*, *delete* et *patch* il faut verifier que le login de l'utilisateur soit bien le `owner` des todos concernes.
> Cela vous demandera de modifier votre service `TodoService` pour ajouter a differentes methodes le login en parametre.

**Answer:**

1. Modifier le service pour verifier le owner :

```java
// Fichier : src/main/java/tpspring/service/TodoServiceV2.java (modifie pour la securite)
package tpspring.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import tpspring.model.Todo;

@Service
public class TodoServiceV2 {
    @Autowired
    private TodoCrudRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    public Todo addTodo(final Todo todo) {
        return repository.save(todo);
    }

    public boolean replaceTodo(final Todo newTodo, final String login) {
        final Optional<Todo> existing = repository.findById(newTodo.getId());
        if (existing.isEmpty()) {
            return false;
        }
        if (!login.equals(existing.get().getOwner())) {
            return false;
        }
        newTodo.setOwner(login);
        repository.save(newTodo);
        return true;
    }

    public boolean removeTodo(final long id, final String login) {
        final Optional<Todo> existing = repository.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        if (!login.equals(existing.get().getOwner())) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    public Optional<Todo> modifyTodo(final long id, final Map<String, Object> updates,
                                      final String login) {
        final Optional<Todo> optTodo = repository.findById(id);
        if (optTodo.isEmpty()) {
            return Optional.empty();
        }
        if (!login.equals(optTodo.get().getOwner())) {
            return Optional.empty();
        }
        try {
            final Todo todoFound = optTodo.get();
            final Todo patched = objectMapper.updateValue(todoFound, updates);
            repository.save(patched);
            return Optional.of(patched);
        } catch (final Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Todo> findTodo(final long id) {
        return repository.findById(id);
    }

    public List<Todo> findByTitle(final String title) {
        return repository.findByTitleContaining(title);
    }
}
```

2. Modifier le controleur complet :

```java
// Fichier : src/main/java/tpspring/controller/TodoControllerV2.java (version finale avec securite)
package tpspring.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import tpspring.model.Todo;
import tpspring.service.TodoServiceV2;

@RestController
@RequestMapping("api/v2/private/todo")
@CrossOrigin
public class TodoControllerV2 {
    @Autowired
    private TodoServiceV2 todoService;

    @GetMapping(path = "todo/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo getTodo(@PathVariable("id") final long id) {
        final Optional<Todo> todo = todoService.findTodo(id);
        if (todo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todo not found");
        }
        return todo.get();
    }

    @PostMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo addTodo(@RequestBody final Todo todo, final Principal principal) {
        todo.setOwner(principal.getName());
        return todoService.addTodo(todo);
    }

    @DeleteMapping(path = "todo/{id}")
    public void deleteTodo(@PathVariable("id") final long id, final Principal principal) {
        if (!todoService.removeTodo(id, principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Todo not found or not owned by user");
        }
    }

    @PutMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void replaceTodo(@RequestBody final Todo todo, final Principal principal) {
        if (!todoService.replaceTodo(todo, principal.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Todo not found or not owned by user");
        }
    }

    @PatchMapping(path = "todo", consumes = MediaType.APPLICATION_JSON_VALUE,
                  produces = MediaType.APPLICATION_JSON_VALUE)
    public Todo patchTodo(@RequestBody final Map<String, Object> updates,
                          final Principal principal) {
        if (!updates.containsKey("id")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing id");
        }
        final long id = ((Number) updates.get("id")).longValue();
        final Optional<Todo> patched = todoService.modifyTodo(id, updates, principal.getName());
        if (patched.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Todo not found or not owned by user");
        }
        return patched.get();
    }

    @GetMapping(path = "todos/{title}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Todo> getTodosByTitle(@PathVariable("title") final String title) {
        return todoService.findByTitle(title);
    }
}
```

Tester avec curl (apres signup et login) :
```bash
# Creer un todo
curl -X POST 'http://localhost:8080/api/v2/private/todo/todo' \
  --cookie 'JSESSIONID=...' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Mon todo","description":"A faire","type":"todo"}'

# Le supprimer (seul le owner peut)
curl -X DELETE 'http://localhost:8080/api/v2/private/todo/todo/1' \
  --cookie 'JSESSIONID=...'

# Modifier (PATCH)
curl -X PATCH 'http://localhost:8080/api/v2/private/todo/todo' \
  --cookie 'JSESSIONID=...' \
  -H 'Content-Type: application/json' \
  -d '{"id":1,"title":"Titre modifie"}'
```

**File changes:**
- `src/main/java/tpspring/service/TodoServiceV2.java` : ajout du parametre `login` dans `removeTodo`, `replaceTodo`, `modifyTodo` avec verification du owner
- `src/main/java/tpspring/controller/TodoControllerV2.java` : ajout de `Principal` dans toutes les routes, verification de l'ownership
