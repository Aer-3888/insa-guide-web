---
title: "TP2 : REST API avec Jersey/JAX-RS"
sidebar_position: 2
---

# TP2 : REST API avec Jersey/JAX-RS

> D'apres les consignes de l'enseignant dans : `S6/Ingenierie_Web/data/moodle/tp/tp2_rest_api/README.md` et `S6/Ingenierie_Web/data/moodle/tp/tp2_rest_api/jersey_calendar_api/README.md`

Ce TP porte sur la creation d'API RESTful en Java avec Jersey (implementation de reference de JAX-RS). Le sujet complet est dans `sujet_rest.pdf`.

Le projet principal est `jersey_calendar_api/` : une API d'agenda universitaire gerant des enseignants, matieres et cours.

Technologies : Java 11, Jersey/JAX-RS, Grizzly HTTP Server, JAXB (XML), Swagger, Maven, JUnit 5

---

## Modele de donnees

```
CalendarElement (abstract, id auto-incremente)
    |
    +-- Agenda (conteneur principal : Set<Cours>, Set<Enseignant>, Set<Matiere>)
    +-- Enseignant (name)
    +-- Matiere (name, annee)
    +-- Cours (abstract : matiere, horaire, enseignant, duration)
          +-- CM (Cours Magistral)
          +-- TD (Travaux Diriges)
```

---

## Exercice 1 : Comprendre le modele -- CalendarElement

### Q1 : Comment fonctionne l'auto-incrementation des identifiants ?

**Reponse :**

```java
// Fichier : model/CalendarElement.java (fourni)
package fr.insarennes.model;

public abstract class CalendarElement {
    static int ID_CPT = 0;    // Compteur statique partage par TOUTES les instances

    protected int id;

    CalendarElement() {
        super();
        this.id = ID_CPT;     // Chaque instance recoit un ID unique
        ID_CPT++;
    }

    public int getId() { return id; }
    public void setId(final int id) { this.id = id; }
}
```

`ID_CPT` est un compteur statique : chaque nouvelle instance de n'importe quelle sous-classe (Enseignant, Matiere, Cours) incremente le meme compteur. Cela simule le comportement de `@GeneratedValue` de JPA sans base de donnees.

---

## Exercice 2 : Creer les entites

### Q2.1 : Enseignant et Matiere

**Reponse :**

```java
// Fichier : model/Enseignant.java (fourni)
package fr.insarennes.model;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.Objects;

@XmlRootElement    // Permet la serialisation XML automatique par JAXB
public class Enseignant extends CalendarElement {
    private String name;

    Enseignant() { this("enseignant"); }   // Constructeur par defaut (requis par JAXB)

    public Enseignant(final String n) {
        super();
        name = Objects.requireNonNull(n);
    }

    public String getName() { return name; }
    public void setName(final String name) { this.name = name; }
}
```

```java
// Fichier : model/Matiere.java (fourni)
package fr.insarennes.model;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.Objects;

@XmlRootElement
public class Matiere extends CalendarElement {
    private String name;
    private int annee;

    Matiere() { super(); name = "matiere"; annee = -1; }

    public Matiere(final String n, final int a) {
        super();
        name = Objects.requireNonNull(n);
        annee = a;
    }

    public int getAnnee() { return annee; }
    public void setAnnee(final int annee) { this.annee = annee; }
    public String getName() { return name; }
    public void setName(final String name) { this.name = name; }
}
```

L'annotation `@XmlRootElement` est necessaire pour que JAXB puisse serialiser/deserialiser automatiquement ces objets en XML.

---

### Q2.2 : Cours, CM, TD avec heritage polymorphe

**Reponse :**

```java
// Fichier : model/Cours.java (fourni)
package fr.insarennes.model;

import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import java.time.Duration;
import java.time.LocalDateTime;

@XmlSeeAlso({CM.class, TD.class})   // Indique a JAXB les sous-classes concretes
public abstract class Cours extends CalendarElement {
    protected Matiere matiere;
    protected LocalDateTime horaire;
    protected Enseignant ens;
    protected Duration duration;

    Cours() { super(); }

    public Cours(final Matiere m, final LocalDateTime h, final Enseignant e, final Duration d) {
        super();
        matiere = Objects.requireNonNull(m);
        horaire = Objects.requireNonNull(h);
        ens = Objects.requireNonNull(e);
        duration = Objects.requireNonNull(d);
    }

    // Getters/setters avec adaptateurs JAXB pour les types Java 8
    @XmlJavaTypeAdapter(LocalDateTimeXmlAdapter.class)
    public void setHoraire(final LocalDateTime h) { horaire = h; }
    @XmlJavaTypeAdapter(DurationXmlAdapter.class)
    public void setDuration(final Duration d) { duration = d; }
    // ... autres getters/setters
}
```

`@XmlSeeAlso({CM.class, TD.class})` est indispensable pour que JAXB sache deserialiser les sous-classes quand il recoit du XML de type `Cours`.

```java
// Fichier : model/CM.java
@XmlRootElement
public class CM extends Cours {
    CM() { super(); }
    public CM(Matiere m, LocalDateTime h, Enseignant e, Duration d) { super(m, h, e, d); }
}

// Fichier : model/TD.java
@XmlRootElement
public class TD extends Cours {
    TD() { super(); }
    public TD(Matiere m, LocalDateTime h, Enseignant e, Duration d) { super(m, h, e, d); }
}
```

---

### Q2.3 : Agenda -- Conteneur avec regles de validation metier

**Reponse :**

```java
// Fichier : model/Agenda.java (fourni)
package fr.insarennes.model;

import java.util.HashSet;
import java.util.Set;

public class Agenda extends CalendarElement {
    private final Set<Cours> cours;
    private final Set<Enseignant> enseignants;
    private final Set<Matiere> matieres;

    public Agenda() {
        super();
        cours = new HashSet<>();
        enseignants = new HashSet<>();
        matieres = new HashSet<>();
    }

    // Rejet si doublon de nom
    public void addEnseignant(final Enseignant ens) throws IllegalArgumentException {
        if (enseignants.stream().anyMatch(e -> ens.getName().equals(e.getName()))) {
            throw new IllegalArgumentException("Two teachers cannot have the same name");
        }
        enseignants.add(ens);
    }

    // Rejet si meme nom OU meme annee existe deja
    public void addMatiere(final Matiere mat) throws IllegalArgumentException {
        if (matieres.stream().anyMatch(m ->
                mat.getName().equals(m.getName()) || mat.getAnnee() == m.getAnnee())) {
            throw new IllegalArgumentException("Duplicate subject");
        }
        matieres.add(mat);
    }

    public boolean delMatiere(final int id) {
        final Matiere mat = getMatiere(id);
        if (mat == null) return false;
        matieres.remove(mat);
        return true;
    }

    public Matiere getMatiere(final int id) {
        for (Matiere mat : matieres) {
            if (mat.getId() == id) return mat;
        }
        return null;
    }

    public void addCours(final Cours c) {
        if (c != null) cours.add(c);
    }
}
```

---

## Exercice 3 : La ressource REST -- CalendarResource

### Q3.1 : POST /calendar/ens/{name} -- Creer un enseignant

**Reponse :**

```java
// Fichier : resource/CalendarResource.java
package fr.insarennes.resource;

import fr.insarennes.model.*;
import javax.inject.Singleton;
import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.net.HttpURLConnection;

@Singleton
@Path("calendar")
public class CalendarResource {
    private final Agenda agenda;

    public CalendarResource() {
        agenda = new Agenda();
    }

    @POST
    @Path("ens/{name}")
    public Response postEnseignant(@PathParam("name") final String name) {
        final Enseignant ens = new Enseignant(name);
        try {
            agenda.addEnseignant(ens);
        } catch (final IllegalArgumentException ex) {
            throw new WebApplicationException(
                Response.status(HttpURLConnection.HTTP_BAD_REQUEST, ex.getMessage()).build()
            );
        }
        return Response.status(Response.Status.OK).entity(ens).build();
    }
```

Tester :
```bash
curl -X POST "http://localhost:4444/calendar/ens/Blouin"
# -> XML : <enseignant><id>1</id><name>Blouin</name></enseignant>

# Doublon -> 400
curl -X POST "http://localhost:4444/calendar/ens/Blouin"
```

---

### Q3.2 : POST /calendar/mat/{annee}/{name} -- Creer une matiere

**Reponse :**

```java
    @POST
    @Path("mat/{annee}/{name}")
    public Response postMatiere(@PathParam("annee") final int annee,
                                @PathParam("name") final String name) {
        final Matiere mat = new Matiere(name, annee);
        try {
            agenda.addMatiere(mat);
        } catch (final IllegalArgumentException ex) {
            throw new WebApplicationException(
                Response.status(HttpURLConnection.HTTP_BAD_REQUEST, ex.getMessage()).build()
            );
        }
        return Response.status(Response.Status.OK).entity(mat).build();
    }
```

Tester :
```bash
curl -X POST "http://localhost:4444/calendar/mat/3/Web"
curl -X POST "http://localhost:4444/calendar/mat/4/BDD"
```

---

### Q3.3 : GET /calendar/mat/{id} -- Recuperer une matiere

**Reponse :**

```java
    @GET
    @Path("mat/{id}")
    public Response getMatiere(@PathParam("id") final int id) {
        final Matiere mat = agenda.getMatiere(id);
        if (mat == null) {
            return Response.status(Response.Status.NOT_FOUND).entity(Entity.text("")).build();
        }
        return Response.status(Response.Status.OK).entity(mat).build();
    }
```

Tester :
```bash
curl -X GET "http://localhost:4444/calendar/mat/2"     # -> 200 + XML
curl -X GET "http://localhost:4444/calendar/mat/999"   # -> 404
```

---

### Q3.4 : PUT /calendar/mat/{id}/{newname} -- Modifier le nom

**Reponse :**

```java
    @PUT
    @Path("mat/{id}/{newname}")
    public Response patchMatiere(@PathParam("id") final int id,
                                 @PathParam("newname") final String newname) {
        final Matiere mat = agenda.getMatiere(id);
        if (mat == null) {
            throw new WebApplicationException(
                Response.status(HttpURLConnection.HTTP_BAD_REQUEST).build()
            );
        }
        mat.setName(newname);
        return Response.status(Response.Status.OK).entity(mat).build();
    }
```

Tester :
```bash
curl -X PUT "http://localhost:4444/calendar/mat/2/WebAvance"
```

---

### Q3.5 : DELETE /calendar/mat/{id} -- Supprimer une matiere

**Reponse :**

```java
    @DELETE
    @Path("mat/{id}")
    public Response delMatiere(@PathParam("id") final int id) {
        final boolean action = agenda.delMatiere(id);
        return Response.status(action ? Response.Status.OK : Response.Status.NOT_FOUND)
                       .entity(Entity.text("")).build();
    }
```

Tester :
```bash
curl -X DELETE "http://localhost:4444/calendar/mat/2"
curl -v -X GET "http://localhost:4444/calendar/mat/2"    # -> 404
```

---

### Q3.6 : POST /calendar/cours/new -- Creer un cours (XML)

**Reponse :**

```java
    @POST
    @Path("cours/new")
    @Consumes(MediaType.APPLICATION_XML)
    @Produces(MediaType.APPLICATION_XML)
    public Response newCourse(Cours c) {
        agenda.addCours(c);
        return Response.status(Response.Status.OK).entity(c).build();
    }
}
```

Tester :
```bash
curl -X POST "http://localhost:4444/calendar/cours/new" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<cm>
  <matiere><name>Web</name><annee>3</annee></matiere>
  <horaire>2021-05-18T13:00:00</horaire>
  <ens><name>Blouin</name></ens>
  <duration>PT1H30M</duration>
</cm>'
```

---

## Exercice 4 : Le client JavaScript

### Q4.1 : Page de recherche de matiere (cote client)

**Reponse :**

```javascript noexec
// Fichier : webapp/js/main.js (fourni)
document.getElementById('searchbutton').onclick = function () {
    let nommat = document.getElementById('nommat').value;
    let req = new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (req.readyState !== 4) return;

        if (req.status === 200) {
            let mat = JSON.parse(req.response);
            document.getElementById('info').innerHTML = mat.name;
        } else {
            document.getElementById('info').innerHTML = "Cannot be retrieved";
        }
    };

    req.open("GET", "http://localhost:4444/calendar/mat/" + nommat, true);
    req.send();
};
```

---

## Exercice 5 : Les tests JUnit 5

### Q5.1 : Ecrire les tests de la ressource REST (tests unitaires)

**Reponse :**

```java
// Fichier : test/TestCalendarResource.java (extraits)
public class TestCalendarResource {
    @RegisterExtension
    JerseyExtension jerseyExtension = new JerseyExtension(this::configureJersey);

    @Test
    void testPostEnseignantOK(final WebTarget target) {
        Response resp = target.path("calendar/ens/Cellier")
            .request().post(Entity.text(""));
        assertEquals(200, resp.getStatus());
        Enseignant ens = resp.readEntity(Enseignant.class);
        assertEquals("Cellier", ens.getName());
    }

    @Test
    void testPostMatiereOK(final WebTarget target) {
        Response resp = target.path("calendar/mat/2021/Web")
            .request().post(Entity.text(""));
        assertEquals(200, resp.getStatus());
        Matiere mat = resp.readEntity(Matiere.class);
        assertEquals("Web", mat.getName());
        assertEquals(2021, mat.getAnnee());
    }

    @Test
    void testGetMatiereOK(final WebTarget target) {
        Response postResp = target.path("calendar/mat/2021/Graphs")
            .request().post(Entity.text(""));
        Matiere mat = postResp.readEntity(Matiere.class);

        Response getResp = target.path("calendar/mat/" + mat.getId())
            .request().get();
        Matiere found = getResp.readEntity(Matiere.class);
        assertEquals(200, getResp.getStatus());
        assertEquals("Graphs", found.getName());
    }

    @Test
    void testPatchMatiereOK(final WebTarget target) {
        Response postResp = target.path("calendar/mat/2021/Data")
            .request().post(Entity.text(""));
        Matiere mat = postResp.readEntity(Matiere.class);

        Response putResp = target.path("calendar/mat/" + mat.getId() + "/BDD")
            .request().put(Entity.text(""));
        Matiere updated = putResp.readEntity(Matiere.class);
        assertEquals(200, putResp.getStatus());
        assertEquals("BDD", updated.getName());
    }
}
```

Executer les tests :
```bash
cd jersey_calendar_api
mvn test
```

---

## Comparaison entre JAX-RS (Jersey) et Spring Boot

| Aspect | JAX-RS (Jersey) | Spring Boot |
|--------|-----------------|-------------|
| Controleur | `@Path("...")` | `@RestController` + `@RequestMapping` |
| GET | `@GET` + `@Path` | `@GetMapping(path = "...")` |
| POST | `@POST` + `@Path` | `@PostMapping(path = "...")` |
| Parametre de chemin | `@PathParam("id")` | `@PathVariable("id")` |
| Parametre du corps | parametre sans annotation | `@RequestBody` |
| Reponse | `Response.status(...).entity(...).build()` | `ResponseEntity<>` ou retour direct |
| Gestion d'erreur | `WebApplicationException` | `ResponseStatusException` |
| Singleton | `@Singleton` | Singleton par defaut |
| Serialisation | JAXB (XML) | Jackson (JSON) par defaut |

---

## Execution

```bash
# Demarrer le serveur Jersey
cd jersey_calendar_api
mvn compile exec:java
# -> http://localhost:4444/

# Swagger UI
# http://localhost:4444/myCalendarApp/swag/

# Client JavaScript
# http://localhost:4444/myCalendarApp/index.html
```
