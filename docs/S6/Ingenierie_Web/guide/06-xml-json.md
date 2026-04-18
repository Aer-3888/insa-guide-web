---
title: "Chapitre 6 : XML et JSON -- Formats de donnees"
sidebar_position: 6
---

# Chapitre 6 : XML et JSON -- Formats de donnees

## Table des matieres

1. [XML : structure et regles](#1-xml--structure-et-regles)
2. [Schemas XML (DTD, XSD)](#2-schemas-xml-dtd-xsd)
3. [JSON : structure et regles](#3-json--structure-et-regles)
4. [YAML](#4-yaml)
5. [Java vers JSON : du diagramme UML au JSON](#5-java-vers-json--du-diagramme-uml-au-json)
6. [Bien forme vs valide](#6-bien-forme-vs-valide)
7. [Exercices types du DS](#7-exercices-types-du-ds)
8. [Aide-memoire](#8-aide-memoire)

---

## 1. XML : structure et regles

### Syntaxe XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<carteDeVisite>
    <prenom>Jean</prenom>
    <nom>Dupont</nom>
    <adresse>
        <numero>33</numero>
        <voie type="boulevard">des capucines</voie>
    </adresse>
</carteDeVisite>
```

### Regles XML

- Balises ouvrantes/fermantes OBLIGATOIRES : `<nom>...</nom>`
- Balises auto-fermantes : `<br/>`
- Sensible a la casse : `<Foo>` != `<foo>`
- UN SEUL element racine
- Imbrication correcte : `<a><b></b></a>` (pas `<a><b></a></b>`)
- Les attributs sont entre guillemets : `type="boulevard"`

---

## 2. Schemas XML (DTD, XSD)

### DTD (Document Type Definition)

```dtd
<!ELEMENT person (name, address*)>
<!ELEMENT name (#PCDATA)>
<!ELEMENT address (#PCDATA)>
<!ATTLIST person idcard CDATA #REQUIRED>
```

### XMLSchema (XSD)

```xml
<xs:element name="person">
    <xs:complexType>
        <xs:sequence>
            <xs:element name="name" type="xs:string"/>
            <xs:element name="address" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
        </xs:sequence>
        <xs:attribute name="idcard" type="xs:integer" use="required"/>
    </xs:complexType>
</xs:element>
```

---

## 3. JSON : structure et regles

### Syntaxe JSON

```json
{
    "idcard": 1843739,
    "name": "John Doe",
    "address": ["Adress 1", "Adress 2"],
    "phone": {
        "prefix": "+33",
        "number": "000000"
    },
    "siblings": null,
    "alive": false
}
```

### Types JSON

| Type | Exemple |
|------|---------|
| string | `"hello"` (guillemets doubles OBLIGATOIRES) |
| number | `42`, `3.14` |
| boolean | `true`, `false` |
| null | `null` |
| array | `[1, 2, 3]` |
| object | `{ "cle": "valeur" }` |

### Regles JSON

- Les cles sont TOUJOURS entre guillemets doubles `""`
- Pas de guillemets simples `'`
- Pas de commentaires
- Pas de fonctions
- Pas de virgule finale (trailing comma)
- Virgules ENTRE les elements, pas apres le dernier

---

## 4. YAML

```yaml
persons:
  - idcard: 1843739
    name: John Doe
    address:
      - Address 1
      - Address 2
    alive: false
```

- Indentation = structure (pas d'accolades)
- Supporte les commentaires (`#`)
- Utilise pour OpenAPI, configurations Spring

---

## 5. Java vers JSON : du diagramme UML au JSON

### Methode (exercice frequent au DS)

A partir d'un objet Java et de son diagramme UML, ecrire le JSON correspondant.

**Regles** :
1. Chaque attribut Java devient une cle JSON
2. String -> `"valeur"`, int/double -> nombre, boolean -> true/false
3. null -> `null`
4. List/Set -> `[ ]` (tableau JSON)
5. Objet imbrique -> `{ }` (objet JSON)
6. Les associations deviennent des objets ou tableaux imbriques

### Exemple DS 2021-2022

Java :
```java
Arret a1 = new Arret(1, "INSA", "", true);
Arret a2 = new Arret(2, "Chimie", "", false);
List<Arret> arrets = List.of(a1, a2);
```

JSON :
```json
[
    {
        "id": 1,
        "nom": "INSA",
        "gps": "",
        "abris": true
    },
    {
        "id": 2,
        "nom": "Chimie",
        "gps": "",
        "abris": false
    }
]
```

XML (attributs de classe -> attributs XML) :
```xml
<arrets>
    <arret id="1" nom="INSA" gps="" abris="true"/>
    <arret id="2" nom="Chimie" gps="" abris="false"/>
</arrets>
```

### Exemple DS 2022-2023

Un Examen avec deux etudiants, sans copie :
```json
{
    "id": 1,
    "nom": "Web",
    "date": "01/06/2023",
    "etds": [
        { "id": 1, "nom": "Alice" },
        { "id": 2, "nom": "Bob" }
    ],
    "copies": []
}
```

---

## 6. Bien forme vs valide

### Definitions

| Terme | Signification |
|-------|---------------|
| **Bien forme** | La syntaxe est correcte |
| **Valide** | Bien forme ET conforme a un schema (DTD/XSD) |
| **Pas bien forme** | Erreur de syntaxe -> automatiquement pas valide |

### Decision rapide

```
Syntaxe correcte ?
  NON -> Pas bien forme, donc PAS valide
  OUI -> Bien forme
    Schema existe ?
      NON -> On ne peut pas dire "valide" (pas de schema a verifier)
      OUI -> Conforme au schema ? OUI -> Valide, NON -> Pas valide
```

### Exemples du DS 2021-2022

**Q.8** `<Foo><Bar></Foo><Bar/>` :
- Pas bien forme (Bar est ouvert dans Foo mais ferme apres, imbrication incorrecte)
- Donc pas valide non plus

**Q.9** `<A><B b="b"/>Hello<C>C<C/></A>` :
- Pas bien forme (`<C/>` devrait etre `</C>` pour fermer la balise)
- Donc pas valide

**Q.10** `{ "foo": null, "bar": { "id": "2" }, "hello": "1" }` :
- JSON valide et bien forme

**Q.11** `[ "foo": "f", "bar": "b" ]` :
- Pas bien forme (un tableau JSON ne contient pas de paires cle:valeur, il faudrait des objets `{ }`)

**Q.12** `{ "a": "1" "b": 2 "c": false }` :
- Pas bien forme (virgules manquantes entre les champs)

---

## 7. Exercices types du DS

### Exercice type 1 : "Ecrire le JSON de cet objet Java"

1. Identifier les attributs de la classe
2. Pour chaque attribut : cle = nom, valeur = valeur Java convertie en JSON
3. Les listes deviennent des tableaux `[ ]`
4. Les objets imbriques deviennent des objets `{ }`

### Exercice type 2 : "Ce JSON/XML est-il bien forme/valide ?"

Pour JSON, verifier :
- Accolades `{}` et crochets `[]` correctement fermes
- Virgules entre chaque paire cle:valeur
- Cles entre guillemets doubles
- Pas de trailing comma

Pour XML, verifier :
- Balises correctement ouvertes et fermees
- Imbrication correcte
- Un seul element racine
- Attributs entre guillemets

---

## 8. Aide-memoire

```
XML :
  Balises ouvrantes/fermantes obligatoires
  Un seul element racine
  Sensible a la casse
  Bien forme = syntaxe correcte
  Valide = bien forme + conforme au schema

JSON :
  Types : string, number, boolean, null, array, object
  Cles TOUJOURS entre guillemets doubles ""
  Virgules entre les elements (pas apres le dernier)
  Pas de commentaires, pas de fonctions

YAML :
  Indentation = structure
  Supporte les commentaires (#)
  Utilise pour OpenAPI / config

Java -> JSON :
  String -> "valeur"
  int/double -> nombre
  boolean -> true/false
  null -> null
  List/Set -> [ ]
  Objet -> { }
```
