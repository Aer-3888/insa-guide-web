---
title: "Chapitre 5 : ORM et JPA -- La persistance des donnees"
sidebar_position: 5
---

# Chapitre 5 : ORM et JPA -- La persistance des donnees

## Table des matieres

1. [Pourquoi un ORM ?](#1-pourquoi-un-orm)
2. [@Entity et @Id](#2-entity-et-id)
3. [Relations entre entites](#3-relations-entre-entites)
4. [Heritage en JPA](#4-heritage-en-jpa)
5. [Repository](#5-repository)
6. [Methode complete : du diagramme UML au code](#6-methode-complete--du-diagramme-uml-au-code)
7. [Pieges courants](#7-pieges-courants)
8. [Cheat Sheet](#8-cheat-sheet)

---

## 1. Pourquoi un ORM ?

```
Base de donnees (relationnelle)     Back-end (oriente objet)
  Tables, colonnes                    Classes, objets
  Cles primaires/etrangeres           References, heritage
  SQL                                 Java
```

L'ORM (Object-Relational Mapping) fait le pont entre ces deux mondes.
JPA (Jakarta Persistence API) est la specification Java. Hibernate est l'implementation utilisee par Spring.

---

## 2. @Entity et @Id

### Entite de base

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Data        // Lombok : getters, setters, toString, equals, hashCode
@Entity      // Cette classe sera stockee en base
public class Examen {
    @Id                  // Cle primaire
    @GeneratedValue      // Auto-incrementee
    private long id;

    private String nom;
    private String date;
}
```

> **@Id** est OBLIGATOIRE sur chaque @Entity. Sans lui, JPA ne sait pas quelle colonne est la cle primaire.

> **@GeneratedValue** fait que Spring genere et auto-incremente l'id. Sans cette annotation, vous devez gerer les ids manuellement.

---

## 3. Relations entre entites

### ONE TO MANY / MANY TO ONE

Un Examen a plusieurs Copies. Chaque Copie appartient a un seul Examen.

```java
@Entity
public class Examen {
    @Id @GeneratedValue
    private long id;
    private String nom;
    private String date;

    @OneToMany(mappedBy = "examen",            // attribut dans Copie
               cascade = CascadeType.PERSIST,   // sauvegarder les copies en cascade
               fetch = FetchType.LAZY)           // charger a la demande
    private List<Copie> copies;
}

@Entity
public class Copie {
    @Id @GeneratedValue
    private long id;
    private Double note;

    @ManyToOne
    private Examen examen;     // reference vers l'examen parent

    @ManyToOne
    private Etudiant etudiant;
}
```

### MANY TO MANY

Un Etudiant peut avoir plusieurs Examens, un Examen peut avoir plusieurs Etudiants.

```java
@Entity
public class Etudiant {
    @Id @GeneratedValue
    private long id;
    private String nom;

    @ManyToMany
    private List<Examen> examens;
}

@Entity
public class Examen {
    @Id @GeneratedValue
    private long id;

    @ManyToMany(mappedBy = "examens")
    private List<Etudiant> etds;
}
```

### Composition (losange plein en UML)

La composition indique une relation de possession forte. En JPA, on utilise `cascade = CascadeType.ALL` pour que la suppression du parent supprime les enfants.

```java
@OneToMany(mappedBy = "examen",
           cascade = CascadeType.ALL,    // supprimer l'examen = supprimer ses copies
           orphanRemoval = true)
private List<Copie> copies;
```

### mappedBy

`mappedBy` se place du cote "un" de la relation (@OneToMany) et reference le nom de l'attribut Java dans la classe "plusieurs" (@ManyToOne).

```
@OneToMany(mappedBy = "examen")   <-- "examen" = nom de l'attribut dans Copie
private List<Copie> copies;

// Dans Copie :
@ManyToOne
private Examen examen;            <-- cet attribut s'appelle "examen"
```

> **Sans mappedBy**, JPA cree une table intermediaire inutile.

---

## 4. Heritage en JPA

```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class Player {
    @Id @GeneratedValue
    private long id;
    private String name;
}

@Entity
public class BaseballPlayer extends Player {
    private int totalHomeRuns;
}
```

### Strategies d'heritage

| Strategie | Description | Tables |
|-----------|-------------|--------|
| `SINGLE_TABLE` | Une seule table + colonne DTYPE | 1 table |
| `TABLE_PER_CLASS` | Une table par classe (colonnes dupliquees) | N tables |
| `JOINED` | Une table par classe, colonnes factorisees, cles etrangeres | N tables liees |

---

## 5. Repository

### Interface de base

```java
@Repository
public interface ExamenCrudRepository extends CrudRepository<Examen, Long> {
    // Methodes fournies automatiquement :
    // save(entity), delete(entity), findById(id), findAll()
}

@Repository
public interface CopieCrudRepository extends CrudRepository<Copie, Long> { }

@Repository
public interface EtudiantCrudRepository extends CrudRepository<Etudiant, Long> { }
```

### Requetes personnalisees

```java
@Repository
public interface EtudiantCrudRepository extends CrudRepository<Etudiant, Long> {
    @Query("select u from Etudiant u where u.nom like %?1%")
    List<Etudiant> findByNomContaining(final String nom);
}
```

### Methodes de base

```java
repo.save(entity);           // Enregistrer / mettre a jour
repo.delete(entity);         // Supprimer
repo.findById(id);           // Trouver par cle -> Optional<T>
repo.findAll();              // Tous les elements -> Iterable<T>
```

### Pourquoi on n'implemente jamais ces interfaces ?

Spring genere automatiquement l'implementation a l'execution. C'est le principe de Spring Data JPA : on definit l'interface, Spring fournit le code SQL correspondant.

---

## 6. Methode complete : du diagramme UML au code

### Etape par etape (pour le DS)

A partir d'un diagramme UML :

**1. Pour chaque classe :**
- Ajouter `@Entity`
- Ajouter `@Id` + `@GeneratedValue` sur l'identifiant
- Ajouter les attributs simples (String, int, etc.)

**2. Pour chaque association :**
- Composition 1..* : `@OneToMany(mappedBy="...")` cote "un" + `@ManyToOne` cote "plusieurs"
- Association * .. * : `@ManyToMany`
- Preciser `cascade` si composition (losange plein)

**3. Pour l'heritage :**
- `@Inheritance(strategy = InheritanceType.JOINED)` sur la classe parent
- Les classes enfants heritent et ajoutent `@Entity`

**4. Un Repository par entite**

### Exemple complet : DS 2022-2023

Diagramme : Examen (1) --copies-- (*) Copie, Copie (*) --etudiant-- (1) Etudiant, Etudiant (*) --examens-- (*) Examen

```java
@Entity
public class Examen {
    @Id @GeneratedValue
    private long id;
    private String nom;
    private String date;

    @OneToMany(mappedBy = "examen", cascade = CascadeType.PERSIST)
    private List<Copie> copies;

    @ManyToMany(mappedBy = "examens")
    private List<Etudiant> etds;
}

@Entity
public class Copie {
    @Id @GeneratedValue
    private long id;
    private Double note;

    @ManyToOne
    private Examen examen;

    @ManyToOne
    private Etudiant etudiant;
}

@Entity
public class Etudiant {
    @Id @GeneratedValue
    private long id;
    private String nom;

    @ManyToMany
    private List<Examen> examens;

    @OneToMany(mappedBy = "etudiant")
    private List<Copie> copies;
}
```

---

## 7. Pieges courants

1. **Oublier @Entity** : la classe n'est pas persistee
2. **Oublier @Id + @GeneratedValue** : pas de cle primaire
3. **Confondre @OneToMany et @ManyToOne** : OneToMany = cote "un" (la collection), ManyToOne = cote "plusieurs"
4. **Oublier mappedBy** : JPA cree une table intermediaire inutile
5. **Mauvais nom dans mappedBy** : doit correspondre exactement au nom de l'attribut Java
6. **Ne pas ajouter @Entity sur les sous-classes** : heritage incomplet

---

## 8. Cheat Sheet

```
Annotations obligatoires :
  @Entity                           = classe persistee
  @Id                               = cle primaire
  @GeneratedValue                   = auto-incremente

Relations :
  @OneToMany(mappedBy = "attribut") = cote "un" (collection)
  @ManyToOne                        = cote "plusieurs" (reference)
  @ManyToMany                       = association N-N
  cascade = CascadeType.PERSIST     = sauvegarder en cascade
  fetch = FetchType.LAZY            = chargement a la demande

Heritage :
  @Inheritance(strategy = JOINED / SINGLE_TABLE / TABLE_PER_CLASS)

Repository :
  extends CrudRepository<Entity, Long>
  Methodes auto : save, delete, findById, findAll
  @Query pour requetes personnalisees

Spring genere l'implementation des repositories automatiquement.
```
