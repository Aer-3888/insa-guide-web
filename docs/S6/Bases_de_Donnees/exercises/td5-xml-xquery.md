---
title: "TD5 -- XML et XQuery"
sidebar_position: 4
---

# TD5 -- XML et XQuery

> Source : TD5.pdf, Hugo TD 5.pdf
> DTD, XPath, XQuery FLWOR, conversion relationnel-XML.

---

## Exercice 1 : Ecrire une DTD

### Enonce

Ecrire la DTD pour un document XML representant une bibliotheque avec des livres, auteurs et emprunts.

### Solution

```xml
<!DOCTYPE bibliotheque [
    <!ELEMENT bibliotheque (livre+, emprunteur*)>
    <!ELEMENT livre (titre, auteur+, annee, prix?)>
    <!ELEMENT titre (#PCDATA)>
    <!ELEMENT auteur (prenom, nom)>
    <!ELEMENT prenom (#PCDATA)>
    <!ELEMENT nom (#PCDATA)>
    <!ELEMENT annee (#PCDATA)>
    <!ELEMENT prix (#PCDATA)>
    <!ELEMENT emprunteur (nom, prenom, emprunt+)>
    <!ELEMENT emprunt EMPTY>

    <!ATTLIST livre isbn ID #REQUIRED>
    <!ATTLIST livre genre CDATA #IMPLIED>
    <!ATTLIST prix devise CDATA "EUR">
    <!ATTLIST emprunteur eid ID #REQUIRED>
    <!ATTLIST emprunt livre IDREF #REQUIRED>
    <!ATTLIST emprunt date CDATA #REQUIRED>
]>
```

**Explication des choix :**
- `livre+` : au moins un livre dans la bibliotheque.
- `auteur+` : un livre peut avoir plusieurs auteurs.
- `prix?` : le prix est optionnel.
- `isbn` est un `ID` : identifiant unique dans le document.
- `emprunt livre` est un `IDREF` : reference vers l'isbn d'un livre (comme une FK).
- `devise` a la valeur par defaut "EUR".

### Syntaxe DTD -- rappel

| Symbole | Signification |
|---------|---------------|
| `(A, B, C)` | A puis B puis C (ordre strict) |
| `(A \| B)` | A ou B (choix) |
| `A+` | 1 ou plusieurs |
| `A*` | 0 ou plusieurs |
| `A?` | 0 ou 1 |
| `#PCDATA` | Texte brut |
| `EMPTY` | Element vide |
| `ID` | Identifiant unique |
| `IDREF` | Reference a un ID |
| `#REQUIRED` | Attribut obligatoire |
| `#IMPLIED` | Attribut optionnel |

---

## Exercice 2 : Expressions XPath

### Document de reference

```xml
<bibliotheque>
    <livre isbn="L1" genre="fiction">
        <titre>Les Miserables</titre>
        <auteur><prenom>Victor</prenom><nom>Hugo</nom></auteur>
        <annee>1862</annee>
        <prix devise="EUR">12.50</prix>
    </livre>
    <livre isbn="L2" genre="science">
        <titre>Cosmos</titre>
        <auteur><prenom>Carl</prenom><nom>Sagan</nom></auteur>
        <annee>1980</annee>
        <prix devise="USD">15.00</prix>
    </livre>
    <livre isbn="L3" genre="fiction">
        <titre>Le Petit Prince</titre>
        <auteur><prenom>Antoine</prenom><nom>de Saint-Exupery</nom></auteur>
        <annee>1943</annee>
    </livre>
</bibliotheque>
```

### Questions et solutions

| # | Question | XPath |
|---|---------|-------|
| 1 | Tous les titres | `/bibliotheque/livre/titre` |
| 2 | Titre du premier livre | `/bibliotheque/livre[1]/titre` |
| 3 | Livres de fiction | `/bibliotheque/livre[@genre='fiction']` |
| 4 | Livres publies apres 1900 | `/bibliotheque/livre[annee > 1900]` |
| 5 | Noms de tous les auteurs | `//auteur/nom` |
| 6 | Livres avec un prix | `/bibliotheque/livre[prix]` |
| 7 | Livres sans prix | `/bibliotheque/livre[not(prix)]` |
| 8 | Prix en EUR | `//prix[@devise='EUR']` |
| 9 | Titres de livres a moins de 15 | `//livre[prix < 15]/titre` |
| 10 | Nombre de livres | `count(/bibliotheque/livre)` |

**Rappel :** `/` = enfant direct, `//` = descendant a n'importe quel niveau, `@` = attribut, `[cond]` = predicat.

---

## Exercice 3 : Requetes XQuery FLWOR

### Q1 : Lister tous les titres

```xquery
for $livre in doc("bibliotheque.xml")//livre
return $livre/titre
```

### Q2 : Livres de fiction publies apres 1900

```xquery
for $livre in doc("bibliotheque.xml")//livre
where $livre/@genre = 'fiction' and $livre/annee > 1900
return <resultat>
    <titre>{ $livre/titre/text() }</titre>
    <annee>{ $livre/annee/text() }</annee>
</resultat>
```

### Q3 : Trier les livres par annee decroissante

```xquery
for $livre in doc("bibliotheque.xml")//livre
order by $livre/annee descending
return <livre>
    <titre>{ $livre/titre/text() }</titre>
    <annee>{ $livre/annee/text() }</annee>
</livre>
```

### Q4 : Nombre de livres et prix moyen

```xquery
let $livres := doc("bibliotheque.xml")//livre
return <stats>
    <nombre>{ count($livres) }</nombre>
    <prix_moyen>{ avg($livres/prix) }</prix_moyen>
    <prix_max>{ max($livres/prix) }</prix_max>
</stats>
```

### Q5 : Livres sans prix

```xquery
for $livre in doc("bibliotheque.xml")//livre
where not($livre/prix)
return $livre/titre
```

### Q6 : Livres groupes par genre (simulation)

```xquery
for $genre in distinct-values(doc("bibliotheque.xml")//livre/@genre)
return <genre nom="{ $genre }">
{
    for $livre in doc("bibliotheque.xml")//livre[@genre = $genre]
    return <titre>{ $livre/titre/text() }</titre>
}
</genre>
```

---

## Exercice 4 : Conversion relationnel vers XML

### Schema relationnel

```
Etudiant(etudId, nom, prenom)
Cours(coursId, sujet)
Inscription(etudId, coursId, note)
```

### Representation XML

```xml
<universite>
    <etudiants>
        <etudiant eid="E1">
            <nom>Dupont</nom>
            <prenom>Alice</prenom>
            <inscriptions>
                <inscription cours="C1" note="15"/>
                <inscription cours="C2" note="12"/>
            </inscriptions>
        </etudiant>
    </etudiants>
    <listecours>
        <cours cid="C1">
            <sujet>Bases de Donnees</sujet>
        </cours>
        <cours cid="C2">
            <sujet>Algorithmique</sujet>
        </cours>
    </listecours>
</universite>
```

### DTD correspondante

```xml
<!ELEMENT universite (etudiants, listecours)>
<!ELEMENT etudiants (etudiant+)>
<!ELEMENT etudiant (nom, prenom, inscriptions)>
<!ELEMENT inscriptions (inscription*)>
<!ELEMENT inscription EMPTY>
<!ELEMENT listecours (cours+)>
<!ELEMENT cours (sujet)>
<!ELEMENT nom (#PCDATA)>
<!ELEMENT prenom (#PCDATA)>
<!ELEMENT sujet (#PCDATA)>
<!ATTLIST etudiant eid ID #REQUIRED>
<!ATTLIST cours cid ID #REQUIRED>
<!ATTLIST inscription cours IDREF #REQUIRED>
<!ATTLIST inscription note CDATA #IMPLIED>
```

---

## Points cles a retenir

- DTD : les `ID` sont comme des cles primaires, les `IDREF` comme des cles etrangeres.
- XPath : `/` = direct, `//` = n'importe ou, `@` = attribut, `[cond]` = filtre.
- XQuery : toujours utiliser `{ }` pour evaluer une expression dans du XML construit.
- `text()` extrait le contenu textuel sans les balises.
- `distinct-values()` est l'equivalent de SELECT DISTINCT.
