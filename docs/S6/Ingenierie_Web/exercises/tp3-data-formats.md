---
title: "TP3 : Formats de donnees -- XML, DTD, XSD, JSON"
sidebar_position: 3
---

# TP3 : Formats de donnees -- XML, DTD, XSD, JSON

> Following teacher instructions from: `S6/Ingenierie_Web/data/moodle/tp/tp3_data_formats/README.md`, `S6/Ingenierie_Web/data/moodle/tp/tp3_data_formats/xml/README.md` et `S6/Ingenierie_Web/data/moodle/tp/tp3_data_formats/json/README.md`

Ce TP couvre les formats de donnees utilises en ingenierie web :
1. **XML** : syntaxe, bien-forme, validation avec DTD/XSD/Relax NG
2. **JSON** : syntaxe, manipulation en JavaScript et Java

Technologies : XML, DTD, XSD, Relax NG Compact, JSON, JavaScript (Node.js), Java (org.json), Maven

---

## Partie 1 : XML

### Exercice 1 : Document XML de reference

> Lire et comprendre `person.xml`.

**Answer:**

```xml
<!-- Fichier : xml/person.xml (fourni) -->
<?xml version="1.0"?>

<person idcard="1843739">
    <name>John Doe</name>
    <address>Adress 1</address>
    <address>Adress 2</address>
</person>
```

Analyse :
- `<?xml version="1.0"?>` : declaration XML (optionnelle mais recommandee)
- `<person>` : element racine (obligatoirement unique)
- `idcard="1843739"` : attribut de l'element person
- `<name>` : element enfant avec contenu texte (1 seul)
- `<address>` : element enfant repete (0 ou plusieurs)

---

### Exercice 2 : Validation par DTD

> Ecrire ou analyser la DTD correspondant a `person.xml`.

**Answer:**

```dtd
<!-- Fichier : xml/person.dtd (fourni) -->
<!ELEMENT person (name,address*)>
<!ELEMENT name (#PCDATA)>
<!ELEMENT address (#PCDATA)>

<!ATTLIST person idcard CDATA #REQUIRED>
```

Explication ligne par ligne :

| Ligne DTD | Signification |
|-----------|---------------|
| `<!ELEMENT person (name,address*)>` | person contient exactement 1 name puis 0 ou plusieurs address |
| `<!ELEMENT name (#PCDATA)>` | name contient du texte (Parsed Character Data) |
| `<!ELEMENT address (#PCDATA)>` | address contient du texte |
| `<!ATTLIST person idcard CDATA #REQUIRED>` | person a un attribut `idcard` obligatoire de type texte |

Aide-memoire DTD :
```
<!ELEMENT nom (enfants)>        -> element avec enfants
<!ELEMENT nom (#PCDATA)>        -> element avec texte
<!ELEMENT nom EMPTY>            -> element vide (<br/>)
(a, b)     -> sequence (a PUIS b)
(a | b)    -> choix (a OU b)
(enfant)   -> exactement 1
(enfant?)  -> 0 ou 1
(enfant*)  -> 0 ou plus
(enfant+)  -> 1 ou plus

<!ATTLIST element attribut TYPE DEFAUT>
  TYPE   : CDATA (texte), ID (identifiant unique), IDREF (reference)
  DEFAUT : #REQUIRED (obligatoire), #IMPLIED (optionnel), "valeur" (par defaut)
```

Valider :
```bash
xmllint --noout --dtdvalid person.dtd person.xml
```

---

### Exercice 3 : Validation par XSD

> Ecrire ou analyser le XSD correspondant a `person.xml`.

**Answer:**

```xml
<!-- Fichier : xml/person.xsd (fourni) -->
<?xml version="1.0"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="person">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="name" type="xs:string" maxOccurs="1"/>
                <xs:element name="address" type="xs:string"
                            minOccurs="0" maxOccurs="unbounded"/>
            </xs:sequence>
            <xs:attribute name="idcard" type="xs:string" use="required"/>
        </xs:complexType>
    </xs:element>
</xs:schema>
```

Explication :

| Element XSD | Signification |
|-------------|---------------|
| `<xs:element name="person">` | Element racine "person" |
| `<xs:complexType>` | person contient des sous-elements |
| `<xs:sequence>` | Enfants dans l'ordre defini |
| `name` avec `maxOccurs="1"` | Exactement 1 element name |
| `address` avec `minOccurs="0" maxOccurs="unbounded"` | 0 ou plusieurs address |
| `<xs:attribute name="idcard" use="required"/>` | Attribut obligatoire |

Types XSD courants : `xs:string`, `xs:integer`, `xs:boolean`, `xs:date`, `xs:decimal`, `xs:float`

Valider :
```bash
xmllint --noout --schema person.xsd person.xml
```

---

### Exercice 4 : Relax NG Compact

> Comprendre le schema Relax NG.

**Answer:**

```
# Fichier : xml/person.rnc (fourni)

start = person

person = element person { idcard & name & address* }

idcard = attribute idcard { text }
address = element address { text }
name = element name { text }
```

Operateurs RNC :
```
,    -> sequence (dans l'ordre)
&    -> entrelacement (tous presents, n'importe quel ordre)
|    -> choix (un seul)
?    -> optionnel (0 ou 1)
*    -> repetition (0 ou plus)
+    -> repetition (1 ou plus)
```

---

### Exercice 5 : Detecter les erreurs XML (illformedDoc.xml)

> Identifier toutes les erreurs de syntaxe dans le fichier `illformedDoc.xml`.

**Answer:**

```xml
<!-- Fichier : xml/illformedDoc.xml (fourni, avec erreurs) -->
<project xmlns=http://maven.apache.org/POM/4.0.0>       <!-- ERREUR 1 -->
    <groupId>web</groupId>
    <artifactId>tpREST</artifactId>
    <packaging>war</packaging>
    <version>1.0.0</version>
    <name>tpREST</name>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.glassfish.jersey                    <!-- ERREUR 2 -->
                <artifactId>jersey-bom</artifact>                <!-- ERREUR 2b -->
                <version>${jersey.version}<version>              <!-- ERREUR 3 -->
                <type>pom</type>
                <scope/>import</scope>                           <!-- ERREUR 4 -->
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

| Erreur | Ligne fautive | Probleme | Correction |
|--------|--------------|----------|------------|
| 1 | `xmlns=http://...` | Attribut sans guillemets | `xmlns="http://..."` |
| 2 | `<groupId>org.glassfish.jersey` | Balise non fermee | `<groupId>org.glassfish.jersey</groupId>` |
| 2b | `</artifact>` | Nom de balise fermante incorrect | `</artifactId>` |
| 3 | `<version>...<version>` | Balise fermante sans `/` | `<version>...</version>` |
| 4 | `<scope/>import</scope>` | Auto-fermeture suivie de contenu | `<scope>import</scope>` |

Tester :
```bash
xmllint --noout illformedDoc.xml
# -> Affiche les erreurs de syntaxe
```

---

### Exercice 6 : Document bien forme (validdoc.xml)

> Comparer avec le document corrige.

**Answer:**

```xml
<!-- Fichier : xml/validdoc.xml (fourni, correct) -->
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <groupId>web</groupId>
    <artifactId>tpREST</artifactId>
    <packaging>war</packaging>
    <version>1.0.0</version>
    <name>tpREST</name>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.glassfish.jersey</groupId>
                <artifactId>jersey-bom</artifactId>
                <version>${jersey.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

Methode de verification systematique :
```
1. Un seul element racine ?
2. Toutes les balises sont fermees ?
3. Imbrication correcte ? (<a><b></b></a>, pas <a><b></a></b>)
4. Attributs entre guillemets doubles ?
5. Caracteres speciaux echappes ? (< > & " ')
```

---

## Partie 2 : JSON

### Exercice 7 : Structure JSON de reference

> Lire et comprendre `person.json`.

**Answer:**

```json
{
    "idcard": "1843739",
    "name": "John Doe",
    "address": ["Adress 1", "Adress 2"],
    "phones": {
        "work": "+339999999",
        "home": "+338888888"
    }
}
```

Analyse :
- Objet racine `{ }` avec 4 proprietes
- `idcard`, `name` : valeurs de type string
- `address` : tableau `[ ]` de strings
- `phones` : objet imbrique `{ }` avec 2 proprietes

---

### JSON vs XML -- Meme donnee, deux representations

| Critere | JSON | XML |
|---------|------|-----|
| Taille | Plus compact | Plus verbeux |
| Tableaux | Natifs `[ ]` | Elements repetes |
| Types | string, number, boolean, null, array, object | Tout est texte |
| Commentaires | Interdits | Autorises `<!-- -->` |
| Validation | JSON Schema | DTD / XSD / Relax NG |
| Usage principal | API REST, configs | Documents, SOAP, configs XML |

---

### Exercice 8 : Manipulation JSON en JavaScript (Node.js)

> Executer et comprendre `person.js`.

**Answer:**

```javascript noexec
// Fichier : json/js/person.js (fourni)
// Execution : node person.js

let person = {
    "idcard": "1843739",
    "name": "John Doe",
    "address": ["Adress 1", "Adress 2"],
    "phones": {
        "work": "+339999999",
        "home": "+338888888"
    }
};

// Acces aux proprietes
console.log("ID card: " + person.idcard);
console.log("name: " + person.name);

// Parcourir un tableau
for (i in person.address) {
    console.log("address #" + i + ": " + person.address[i]);
}

// Objet imbrique
console.log("Work phones: " + person.phones.work);
console.log("Home phones: " + person.phones.home);

// Parser une chaine JSON
let jsonText = '{"idcard":"1843739"}';
try {
    let jsonObj = JSON.parse(jsonText);
    console.log("Parsed JSON text: " + jsonObj.idcard);
} catch(err) {
    console.log("Cannot parse the JSON text");
}
```

Operations essentielles :

| Operation | Code |
|-----------|------|
| Parser (string -> objet) | `JSON.parse(jsonString)` |
| Serialiser (objet -> string) | `JSON.stringify(objet)` |
| Serialiser formatte | `JSON.stringify(objet, null, 2)` |
| Propriete | `objet.propriete` ou `objet["propriete"]` |
| Element de tableau | `objet.tableau[0]` |
| Objet imbrique | `objet.parent.enfant` |

---

### Exercice 9 : Manipulation JSON en Java (org.json)

> Executer et comprendre `App.java`.

**Answer:**

```java
// Fichier : json/java/web.json/src/main/java/fr/insa/rennes/info/App.java (fourni)
package fr.insa.rennes.info;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.stream.Collectors;
import org.json.JSONObject;

public class App {
    public static void main(final String[] args) {
        try {
            // 1. Lire le fichier JSON et le parser
            final JSONObject json = new JSONObject(
                Files.lines(Paths.get("src/main/resources/person.json"))
                     .collect(Collectors.joining("\n"))
            );

            // 2. Proprietes simples
            System.out.println("ID card: " + json.getString("idcard"));
            System.out.println("Name: " + json.getString("name"));

            // 3. Tableau
            System.out.println("addresses: " + json.getJSONArray("address").join(", "));

            // 4. Objet imbrique
            final JSONObject phones = json.getJSONObject("phones");
            System.out.println("Work phone: " + phones.getString("work"));
            System.out.println("Home phone: " + phones.getString("home"));
        } catch (final Exception e) {
            e.printStackTrace();
        }
    }
}
```

Methodes org.json :

| Methode | Usage |
|---------|-------|
| `new JSONObject(String)` | Parser une chaine JSON |
| `json.getString("key")` | Recuperer une string |
| `json.getInt("key")` | Recuperer un entier |
| `json.getJSONArray("key")` | Recuperer un tableau |
| `json.getJSONObject("key")` | Recuperer un objet imbrique |

Executer :
```bash
cd json/java/web.json
mvn compile exec:java -Dexec.mainClass="fr.insa.rennes.info.App"
```

---

## Exercices de synthese (type DS)

### Exercice 10 : Verifier si un XML est bien forme

**Answer:**

| XML | Bien forme ? | Pourquoi |
|-----|-------------|----------|
| `<a><b></b></a>` | Oui | Imbrication correcte |
| `<a><b></a></b>` | Non | Imbrication croisee |
| `<a><b/></a>` | Oui | b est auto-ferme |
| `<a b=c></a>` | Non | Attribut sans guillemets |
| `<a><b>texte</a>` | Non | b non ferme |
| `<a/><b/>` | Non | Deux racines |

---

### Exercice 11 : Ecrire une DTD a partir d'un XML

> A partir du XML :
> ```xml
> <carnet>
>     <personne idcard="12345">
>         <nom>Dupont</nom>
>         <prenom>Jean</prenom>
>         <adresse>
>             <numero>33</numero>
>             <voie type="boulevard">des capucines</voie>
>         </adresse>
>     </personne>
> </carnet>
> ```

**Answer:**

```dtd
<!ELEMENT carnet (personne*)>
<!ELEMENT personne (nom, prenom, adresse)>
<!ATTLIST personne idcard CDATA #REQUIRED>
<!ELEMENT nom (#PCDATA)>
<!ELEMENT prenom (#PCDATA)>
<!ELEMENT adresse (numero, voie)>
<!ELEMENT numero (#PCDATA)>
<!ELEMENT voie (#PCDATA)>
<!ATTLIST voie type CDATA #REQUIRED>
```

---

### Exercice 12 : Ecrire un XSD a partir du meme XML

**Answer:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="carnet">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="personne" maxOccurs="unbounded" minOccurs="0">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="nom" type="xs:string"/>
                            <xs:element name="prenom" type="xs:string"/>
                            <xs:element name="adresse">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="numero" type="xs:integer"/>
                                        <xs:element name="voie">
                                            <xs:complexType>
                                                <xs:simpleContent>
                                                    <xs:extension base="xs:string">
                                                        <xs:attribute name="type"
                                                            type="xs:string" use="required"/>
                                                    </xs:extension>
                                                </xs:simpleContent>
                                            </xs:complexType>
                                        </xs:element>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                        <xs:attribute name="idcard" type="xs:integer" use="required"/>
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
```

---

### Exercice 13 : JSON bien forme ou non

**Answer:**

Regles JSON :
1. Cles TOUJOURS entre guillemets doubles `"key"`
2. Pas de guillemets simples
3. Virgules ENTRE les elements (pas apres le dernier)
4. Pas de commentaires
5. Types autorises : string, number, boolean, null, array, object

| JSON | Bien forme ? | Pourquoi |
|------|-------------|----------|
| `{ "foo": null, "bar": { "id": "2" } }` | Oui | Syntaxe correcte |
| `[ "foo": "f", "bar": "b" ]` | Non | Paires cle:valeur dans un tableau |
| `{ "a": "1" "b": 2 }` | Non | Virgule manquante |
| `{ "a": "1", "b": 2, "c": false, }` | Non | Virgule apres le dernier element |
| `{ 'a': 1 }` | Non | Guillemets simples |
| `{ "a": undefined }` | Non | `undefined` n'est pas un type JSON |
| `{ "a": 1, "b": [1, 2, 3] }` | Oui | Tableau dans un objet |

---

### Exercice 14 : Convertir Java vers JSON

> Methode de conversion :
> ```
> String     -> "valeur"
> int/double -> nombre (sans guillemets)
> boolean    -> true / false
> null       -> null
> List/Set   -> [ ]
> Objet      -> { } (recursif)
> enum       -> "NOM_ENUM"
> ```

**Exemple :**

```java
class Matiere {
    int id = 1;
    String name = "Web";
    int annee = 3;
}
```

**JSON :**
```json
{
    "id": 1,
    "name": "Web",
    "annee": 3
}
```

---

## Outils de validation

```bash
# XML : bien-forme
xmllint --noout fichier.xml

# XML : validation DTD
xmllint --noout --dtdvalid schema.dtd fichier.xml

# XML : validation XSD
xmllint --noout --schema schema.xsd fichier.xml

# JSON : validation (jq)
jq . fichier.json

# JSON : validation (Python)
python3 -m json.tool fichier.json

# JSON : validation (Node.js)
node -e "JSON.parse(require('fs').readFileSync('person.json'))"
```
