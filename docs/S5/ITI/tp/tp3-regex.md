---
title: "FUS3 - Expressions regulieres et recherche de motifs"
sidebar_position: 3
---

# FUS3 - Expressions regulieres et recherche de motifs

## Objectifs pedagogiques

Ce TP se concentre sur regular expressions (regex) for text pattern matching and manipulation:

- Comprendre la syntaxe des regex et les metacaracteres
- Utiliser les regex dans les langages de script (Ruby, Perl)
- Traiter des fichiers texte structures (HTML, XML, TeX)
- Extraire et transformer des donnees par recherche de motifs
- Travailler avec le traitement de texte oriente lignes

## Concepts fondamentaux

### 1. Bases des expressions regulieres

Les expressions regulieres sont des motifs qui decrivent du texte. Elles utilisent des metacaracteres speciaux :

#### Metacaracteres de base
- `.` - Matches any single character (except newline)
- `^` - Start of line anchor
- `$` - End of line anchor
- `*` - Zero or more of previous character
- `+` - One or more of previous character
- `?` - Zero or one of previous character
- `[]` - Character class (matches any character inside)
- `[^]` - Negated character class (matches any character NOT inside)
- `|` - Alternation (OR)
- `()` - Grouping and capture

#### Classes de caracteres
- `\d` - Digit `[0-9]`
- `\w` - Word character `[A-Za-z0-9_]`
- `\s` - Whitespace (space, tab, newline)
- `\D`, `\W`, `\S` - Negations of above

#### Quantificateurs
- `{n}` - Exactly n times
- `{n,}` - At least n times
- `{n,m}` - Between n and m times

### 2. Exemples

```regex
^a          # Lines starting with 'a'
end$        # Lines ending with 'end'
^$          # Empty lines
[0-9]+      # One or more digits
\w+@\w+\.\w+ # Simple email pattern
<[^>]+>     # HTML/XML tags
```

### 3. Regex Ruby

Ruby offre un support natif des regex :

```ruby
# Match operator
if line =~ /pattern/
    puts "Match found"
end

# Substitution
line.sub(/old/, "new")      # Replace first occurrence
line.gsub(/old/, "new")     # Replace all occurrences (global)

# Modifiers
/pattern/i    # Case-insensitive
/pattern/m    # Multiline mode (. matches newline)
/pattern/x    # Extended mode (ignore whitespace, allow comments)
```

### 4. Options en ligne de commande

Ruby's `-n` and `-p` flags enable one-liner scripts:

```bash
# -n: Wraps code in 'while gets ... end' loop
# Reads lines but doesn't print them
ruby -n -e 'print if /pattern/' file.txt

# -p: Like -n but automatically prints $_
ruby -p -e '$_.upcase!' file.txt

# Equivalent to:
while gets
    # your code here
    print $_  # only with -p
end
```

### 5. Applications pratiques

#### Simulation de grep
```ruby
#!/usr/bin/ruby -n
# Print lines matching pattern
print if $_ =~ /pattern/
```

#### Transformation de texte
```ruby
#!/usr/bin/ruby -p
# Remove leading whitespace
$_.sub!(/^\s+/, "")

# Compress multiple spaces to single space
$_.gsub!(/\s+/, " ")
```

#### Formatage HTML/XML
```ruby
#!/usr/bin/ruby -p
# Insert newlines between tags
$_.gsub!(/>([^<>]+)</, ">\n<")
```

## Apercu des exercices

### Exercice 1 : Recherche de motifs dans du code C
Use regex to find specific patterns in source code:
- Function declarations
- Control structures (while, if, for)
- Comments
- Labels and goto statements

**File**: `source.c` - Sample C code with various patterns
**Script**: `pseudo_grep.rb` - Ruby script to match patterns

**Key patterns**:
```ruby
/^\s*[^\w\s]/        # Lines starting with non-word, non-space chars
/while/              # Lines containing 'while'
/\+\+/               # Increment operators (need to escape +)
/^\s*\S.*$/          # Non-empty lines
```

### Exercice 2 : Formatage de balises HTML/XML
Transform inline tags into properly formatted multi-line structure.

**Script**: `uneBalise.rb` - Adds newlines between tags

### Exercice 3 : Traitement TeX
Work with LaTeX source files to extract or transform document structure.

**File**: `f.tex` - Sample LaTeX document

### Exercice 4 : Extraction de donnees HTML
Parse HTML tables and extract structured data.

**File**: `etudiants3.html` - HTML table with student information

## Solutions

Voir le repertoire `src/` pour les implementations commentees :
- `grep_simulator.rb` - Exemples de recherche de motifs
- `tag_formatter.rb` - Traitement de balises HTML/XML
- `c_code_analyzer.rb` - Analyse de motifs dans le code C
- `latex_processor.rb` - Manipulation de fichiers TeX

## Points cles a retenir

1. **Commencer simple** - Construire des motifs complexes a partir de pieces simples
2. **Tester incrementalement** - Verifier chaque partie de la regex avant de les combiner
3. **Utiliser les chaines brutes** - Dans la plupart des langages, eviter le double echappement avec r"" ou //
4. **Correspondance non-greedy** - Utiliser `*?` ou `+?` pour correspondre au minimum
5. **Groupes de capture** - Utiliser () pour extraire les sous-chaines correspondantes

## Outils et test de regex

- Online testers: regex101.com, regexr.com
- Command line: `grep -E` (extended regex), `grep -P` (Perl regex)
- Ruby: `irb` interactive shell for testing patterns
- Perl: `perl -ne 'print if /pattern/' file`

## Motifs courants

### Validate Email
```regex
^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$
```

### Match URLs
```regex
https?://[^\s<>"{}|\\^`\[\]]+
```

### Extract HTML Tags
```regex
<([a-z][a-z0-9]*)\b[^>]*>.*?</\1>
```

### Find C Comments
```regex
/\*.*?\*/         # /* ... */ style
//.*$             # // style
```

## Erreurs courantes

1. **Gourmandise** - `.*` correspond au maximum possible ; utiliser `.*?` pour la correspondance minimale
2. **Ne pas echapper les metacaracteres** - `\.` pour un point litteral, `\+` pour un plus litteral
3. **Oublier les ancres** - `^` et `$` empechent les correspondances partielles
4. **Retour en arriere catastrophique** - Les motifs complexes avec beaucoup d'alternances peuvent bloquer
5. **Erreurs de classes de caracteres** - `[a-z-9]` vs `[a-z0-9]` (la position du tiret compte)

## Pour aller plus loin

- Mastering Regular Expressions (O'Reilly)
- Ruby regex: https://ruby-doc.org/core/Regexp.html
- Perl regex: `perldoc perlre`
- POSIX regex vs PCRE (Perl-Compatible)
- Lookahead/lookbehind assertions for complex matching
