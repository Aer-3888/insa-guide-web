---
title: "FUS4 - Analyse de donnees genealogiques (GEDCOM)"
sidebar_position: 4
---

# FUS4 - Analyse de donnees genealogiques (GEDCOM)

## Objectifs pedagogiques

Ce TP introduit parsing structured data formats using scripting languages:

- Comprendre les formats de donnees hierarchiques (GEDCOM)
- Analyser et transformer des donnees avec Ruby/Perl
- Travailler avec des piles pour gerer les structures imbriquees
- Convertir entre formats de donnees (GEDCOM → XML)
- Gerer les E/S fichier avec verification d'erreurs

## Concepts fondamentaux

### 1. Format GEDCOM

GEDCOM (GEnealogical Data COMmunication) est un format standard pour l'echange de donnees genealogiques.

#### Structure
Chaque ligne comporte trois parties :
```
<level> <tag> <optional_value>
```

Example:
```gedcom
0 @142070@ INDI          # Level 0: Individual record
1 NAME Vincent/GASSOT/   # Level 1: Name field
1 SEX M                  # Level 1: Sex field
1 BIRT                   # Level 1: Birth event
2 DATE 1754              # Level 2: Birth date
2 PLAC Cherrueix...      # Level 2: Birth place
```

#### Balises cles
- `INDI` - Individual person
- `FAM` - Family unit
- `NAME` - Person's name (format: Given/SURNAME/)
- `SEX` - Gender (M/F)
- `BIRT`, `DEAT`, `MARR` - Events (birth, death, marriage)
- `DATE`, `PLAC` - Event details
- `HUSB`, `WIFE`, `CHIL` - Family relationships
- `FAMS` - Family as spouse
- `FAMC` - Family as child

#### References
Identifiers use @ID@ syntax:
```gedcom
0 @142070@ INDI          # Person with ID 142070
1 FAMS @142074@          # Reference to family 142074
```

### 2. Conversion XML

L'objectif est de convertir le format GEDCOM base sur les niveaux en XML hierarchique :

**GEDCOM**:
```gedcom
0 @142070@ INDI
1 NAME Vincent/GASSOT/
1 SEX M
1 BIRT
2 DATE 1754
```

**XML**:
```xml
<INDI ID="142070">
    <NAME>Vincent<S>GASSOT</S></NAME>
    <SEX>M</SEX>
    <EVEN EV='BIRT'>
        <DATE>1754</DATE>
    </EVEN>
</INDI>
```

### 3. Analyse basee sur une pile

Pour gerer les structures imbriquees, utiliser une pile pour suivre les balises ouvertes :

```ruby
tag_stack = []

# Opening tag
if opening_tag
    fs.print "<#{tag}>"
    tag_stack.push(tag)
end

# Closing tags when level decreases
while last_level > current_level
    fs.print "</#{tag_stack.pop}>"
    last_level -= 1
end
```

### 4. E/S fichier Ruby

```ruby
# Open file for reading
begin
    file = File.open(filename, "r")
rescue Errno::ENOENT
    abort "File not found: #{filename}"
end

# Read line by line
begin
    while line = file.readline
        # Process line
    end
rescue EOFError
    # End of file reached
end

# Close file
file.close
```

### 5. Expressions regulieres pour l'analyse

```ruby
# Extract level and remainder
if line =~ /\s*(\d+)\s+(.*)$/
    level = $1.to_i        # Capture group 1
    remainder = $2         # Capture group 2
end

# Named captures (Ruby 2.0+)
if /(?<tag>BIRT|DEAT)\s+(?<data>.*)/ =~ line
    puts "Tag: #{tag}, Data: #{data}"
end

# Extract name components
if line =~ /NAME ([\w\s]+)\/([\w\-]+)\//
    given_name = $1
    surname = $2
end
```

## Apercu des exercices

### Exercice 1 : Convertir GEDCOM en XML
Ecrire un convertisseur qui transforme les fichiers GEDCOM en format XML.

**Input**: `.ged` files (GassotRed.ged, mouche.ged)
**Sortie** : XML with proper nesting and attributes

**Cinq classes de lignes** :

1. **Class 1: Simple tag + value**
   - `SEX M`, `DATE 1754`, `PLAC Paris`
   - Format: `<tag>value</tag>`

2. **Class 2: Identifier declarations**
   - `0 @142070@ INDI`, `0 @142074@ FAM`
   - Format: `<INDI ID="142070">` (opens tag)

3. **Class 3: References**
   - `HUSB @142070@`, `FAMS @142074@`
   - Format: `<HUSB REF="142070"></HUSB>`

4. **Class 4: Event tags (no value)**
   - `BIRT`, `DEAT`, `MARR`
   - Format: `<EVEN EV='BIRT'>` (opens tag)

5. **Class 5: Tag + data**
   - Similar to Class 1 but different tags
   - Format: `<tag>data</tag>`

### Exercice 2 : Generer un rapport HTML
Transformer le XML ou le GEDCOM en HTML lisible avec du style CSS.

**Sortie** : Family tree visualization

### Exercice 3 : Validation des donnees
Verifier la coherence des fichiers GEDCOM :
- Tous les ID references existent
- Les dates sont valides
- Les champs obligatoires sont presents

## Solutions

Voir le repertoire `src/` pour les implementations commentees :
- `ged2xml.rb` - Convertisseur GEDCOM vers XML
- `ged2html.rb` - Generateur de rapports HTML depuis GEDCOM
- `ged_validator.rb` - Validateur de fichiers GEDCOM

## Points cles a retenir

1. **Les donnees hierarchiques necessitent un suivi attentif** - Utiliser des piles ou des compteurs
2. **Les regex sont essentielles pour l'analyse** - Apprendre les groupes de capture
3. **Gerer les erreurs proprement** - Verifier l'existence des fichiers, gerer EOFError
4. **Tester avec de petits jeux de donnees** - Utiliser GassotRed.ged avant mouche.ged
5. **Fermer les balises correctement** - Ne pas laisser de balises non fermees en fin de fichier

## Strategie d'analyse

1. **Lire ligne par ligne** - Ne pas charger le fichier entier en memoire
2. **Extraire le niveau d'abord** - Determine la profondeur d'imbrication
3. **Correspondre les motifs par priorite** - Le plus specifique d'abord
4. **Suivre l'etat** - Retenir le niveau precedent, les balises ouvertes
5. **Fermer les balises quand le niveau diminue** - Depiler

## Motifs courants

### Validation des arguments
```ruby
if ARGV.size != 2
    abort "Usage: #{$0} input.ged output.xml"
end
```

### File Existence Check
```ruby
unless File.exist?(filename)
    abort "Error: File #{filename} not found"
end
```

### Operations securisees sur les fichiers
```ruby
begin
    file = File.open(filename, "r")
    # ... process file
ensure
    file.close if file
end
```

## Erreurs courantes

1. **Ne pas fermer les balises en fin de fichier** - Toujours vider la pile
2. **Suivi de niveau incorrect** - Erreurs de decalage dans l'imbrication
3. **Regex gourmande** - `.*` peut correspondre a trop de texte
4. **Ne pas gerer les cas limites** - Noms vides, dates manquantes
5. **Oublier d'echapper le XML** - `<`, `>`, `&` necessitent un echappement

## Pour aller plus loin

- GEDCOM 5.5 specification
- Ruby regex: https://ruby-doc.org/core/Regexp.html
- XML well-formedness rules
- Stack data structure and applications
- Recursive descent parsing

## Notes sur les formats de donnees

### Convention de nommage GEDCOM
Les noms en GEDCOM utilisent des delimiteurs slash :
```
Given Names/SURNAME/
```

### Attributs XML vs elements
- Utiliser les attributs pour les ID et les references : `ID="123"`, `REF="456"`
- Utiliser les elements pour le contenu : `<DATE>1754</DATE>`

### Indentation
Maintenir une indentation XML correcte correspondant aux niveaux GEDCOM :
- Level 0 → No indent
- Level 1 → One tab
- Level 2 → Two tabs
