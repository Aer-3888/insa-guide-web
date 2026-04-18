---
title: "Expressions regulieres"
sidebar_position: 7
---

# Expressions regulieres

## Apercu

Les expressions regulieres (regex) sont des motifs qui decrivent du texte. Elles sont utilisees pour rechercher, filtrer et transformer du texte. La connaissance des regex est essentielle pour l'examen FUS -- elles apparaissent dans quasiment tous les sujets d'annales, generalement combinees avec `grep`, `sed` ou `awk`.

## Metacaracteres

### Ancres
| Motif | Signification | Exemple |
|-------|---------------|---------|
| `^` | Debut de ligne | `^Hello` correspond aux lignes commencant par "Hello" |
| `$` | Fin de ligne | `world$` correspond aux lignes finissant par "world" |
| `^$` | Ligne vide | Correspond aux lignes sans contenu |
| `\b` | Frontiere de mot | `\bcat\b` correspond a "cat" mais pas a "concatenate" |

### Classes de caracteres
| Motif | Signification | Exemple |
|-------|---------------|---------|
| `.` | N'importe quel caractere (sauf retour a la ligne) | `a.c` correspond a "abc", "a1c", "a-c" |
| `[abc]` | Un parmi a, b ou c | `[aeiou]` correspond aux voyelles |
| `[^abc]` | PAS a, b ou c | `[^0-9]` correspond aux non-chiffres |
| `[a-z]` | Intervalle de a a z | `[A-Za-z]` correspond a toute lettre |
| `[0-9]` | N'importe quel chiffre | `[0-9]+` correspond a un ou plusieurs chiffres |

### Classes raccourcies (style Perl)
| Motif | Equivalent | Signification |
|-------|------------|---------------|
| `\d` | `[0-9]` | Chiffre |
| `\D` | `[^0-9]` | Non-chiffre |
| `\w` | `[A-Za-z0-9_]` | Caractere de mot |
| `\W` | `[^A-Za-z0-9_]` | Non-caractere de mot |
| `\s` | `[ \t\n\r]` | Espace blanc |
| `\S` | `[^ \t\n\r]` | Non-espace blanc |

### Quantificateurs
| Motif | Signification | Exemple |
|-------|---------------|---------|
| `*` | Zero ou plus | `ab*c` correspond a "ac", "abc", "abbc" |
| `+` | Un ou plus | `ab+c` correspond a "abc", "abbc" mais pas "ac" |
| `?` | Zero ou un | `colou?r` correspond a "color" et "colour" |
| `{n}` | Exactement n | `a{3}` correspond a "aaa" |
| `{n,}` | Au moins n | `a{2,}` correspond a "aa", "aaa", "aaaa" |
| `{n,m}` | Entre n et m | `a{2,4}` correspond a "aa", "aaa", "aaaa" |

### Greedy vs Non-greedy
| Motif | Comportement | Exemple sur `<b>bold</b>` |
|-------|--------------|---------------------------|
| `<.*>` | Greedy (correspondre le plus possible) | Correspond a `<b>bold</b>` |
| `<.*?>` | Non-greedy (correspondre le moins possible) | Correspond a `<b>` |

### Groupes et alternation
| Motif | Signification | Exemple |
|-------|---------------|---------|
| `(abc)` | Groupe et capture | `(cat\|dog)` correspond a "cat" ou "dog" |
| `\|` | OU (alternation) | `yes\|no` correspond a "yes" ou "no" |
| `\1` | Reference arriere au groupe 1 | `(word)\1` correspond a "wordword" |

## Utilisation de grep

### grep basique
```bash
grep "pattern" file              # Lignes contenant le motif
grep -i "pattern" file           # Insensible a la casse
grep -v "pattern" file           # Lignes NE correspondant PAS (inversion)
grep -c "pattern" file           # Compter les lignes correspondantes
grep -n "pattern" file           # Afficher les numeros de ligne
grep -l "pattern" *.txt          # Lister les fichiers contenant le motif
grep -r "pattern" dir/           # Recherche recursive
grep -w "word" file              # Correspondre au mot entier uniquement
grep -o "pattern" file           # Afficher seulement la partie correspondante
```

### grep etendu (egrep / grep -E)
```bash
grep -E "pattern1|pattern2" file     # OU
grep -E "^[A-Z]" file               # Lignes commencant par une majuscule
grep -E "[0-9]{3}-[0-9]{4}" file     # Motif de numero de telephone
grep -E "^.{80,}$" file             # Lignes de plus de 80 caracteres
```

### Motifs grep courants a l'examen

```bash
# Lignes commencant par un chiffre
grep "^[0-9]" file

# Lignes finissant par un point
grep "\.$" file

# Lignes contenant exactement 3 chiffres
grep -E "^[^0-9]*[0-9][^0-9]*[0-9][^0-9]*[0-9][^0-9]*$" file

# Lignes vides
grep "^$" file

# Lignes non vides
grep -v "^$" file

# Lignes contenant une adresse IP (simplifie)
grep -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" file

# Lignes contenant un commentaire C
grep "/\*" file

# Lignes commencant par # (commentaires dans les fichiers de configuration)
grep "^#" file

# Lignes NE commencant PAS par # (exclure les commentaires)
grep -v "^#" file

# Lignes avec un motif de type email
grep -E "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" file
```

## Utilisation de sed

### Substitution
```bash
sed 's/old/new/' file              # Remplacer la premiere par ligne
sed 's/old/new/g' file             # Remplacer toutes par ligne
sed 's/old/new/2' file             # Remplacer la 2e occurrence
sed -i 's/old/new/g' file          # Editer en place
sed 's/old/new/gi' file            # Remplacement insensible a la casse
```

### Operations sur les lignes
```bash
sed -n '5p' file                   # Afficher uniquement la ligne 5
sed -n '5,10p' file                # Afficher les lignes 5 a 10
sed '5d' file                      # Supprimer la ligne 5
sed '/pattern/d' file              # Supprimer les lignes correspondantes
sed '/^$/d' file                   # Supprimer les lignes vides
sed '5a\New line' file             # Ajouter apres la ligne 5
sed '5i\New line' file             # Inserer avant la ligne 5
```

### Regex dans sed
```bash
# Supprimer les balises HTML
sed 's/<[^>]*>//g' file

# Extraire le contenu entre balises
sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p' file

# Ajouter un prefixe a chaque ligne
sed 's/^/PREFIX: /' file

# Supprimer les espaces en fin de ligne
sed 's/[[:space:]]*$//' file

# Remplacer les espaces multiples par un seul
sed 's/  */ /g' file
```

## Utilisation de awk

### Syntaxe de base
```bash
awk '/pattern/ {action}' file
awk '{print $1, $3}' file           # Afficher les colonnes 1 et 3
awk -F: '{print $1}' /etc/passwd    # Utiliser : comme delimiteur
```

### Variables integrees
| Variable | Signification |
|----------|---------------|
| `$0` | Ligne entiere |
| `$1, $2, ...` | Champs (colonnes) |
| `NF` | Nombre de champs |
| `NR` | Numero de ligne (numero d'enregistrement) |
| `FS` | Separateur de champs (par defaut : espace) |
| `OFS` | Separateur de champs en sortie |

### Exemples
```bash
# Afficher les lignes de plus de 80 caracteres
awk 'length > 80' file

# Sommer une colonne
awk '{sum += $2} END {print sum}' file

# Afficher la derniere colonne
awk '{print $NF}' file

# Affichage conditionnel
awk '$3 > 100 {print $1, $3}' file

# Compter les lignes correspondant a un motif
awk '/error/ {count++} END {print count}' file
```

## Regex Ruby (pour les TP GEDCOM/FUS)

Ruby utilise les regex comme type natif avec l'operateur `=~` :

```ruby
# Operateur de correspondance
if line =~ /pattern/
    puts "Match found"
end

# Groupes de capture
if line =~ /(\d+)\s+(.*)/
    level = $1    # Premier groupe de capture
    rest = $2     # Deuxieme groupe de capture
end

# Captures nommees (Ruby 2.0+)
if /(?<tag>BIRT|DEAT)\s+(?<data>.*)/ =~ line
    puts tag      # "BIRT" ou "DEAT"
    puts data     # Reste de la ligne
end

# Substitution
line.sub(/old/, "new")      # Premiere occurrence
line.gsub(/old/, "new")     # Toutes les occurrences
line.sub!(/old/, "new")     # Modification en place

# Modificateurs
/pattern/i    # Insensible a la casse
/pattern/m    # Multiligne (. correspond au retour a la ligne)
/pattern/x    # Etendu (ignorer les espaces, autoriser les commentaires)
```

### Drapeaux en ligne de commande Ruby
```bash
# -n: Encapsule le code dans une boucle while-gets, N'affiche PAS automatiquement
ruby -n -e 'print if /pattern/' file.txt

# -p: Comme -n mais affiche automatiquement $_ apres chaque iteration
ruby -p -e '$_.gsub!(/old/, "new")' file.txt
```

## Regex Python

```python
import re

# Correspondre au debut de la chaine
match = re.match(r'^\d{3}', '123abc')

# Rechercher n'importe ou dans la chaine
match = re.search(r'\d+', 'Order 12345')
if match:
    print(match.group())    # '12345'

# Trouver toutes les correspondances
numbers = re.findall(r'\d+', 'a1 b22 c333')  # ['1', '22', '333']

# Remplacer
result = re.sub(r'\d+', 'X', 'a1 b22')  # 'aX bX'

# Decouper
parts = re.split(r'\s+', 'split  on   spaces')  # ['split', 'on', 'spaces']

# Compiler pour reutilisation
pattern = re.compile(r'\d{3}-\d{4}')
matches = pattern.findall(text)
```

## Motifs courants pour les examens

### Validation de formats
```regex
# Email (simplifie)
^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$

# Adresse IP (simplifiee)
^(\d{1,3}\.){3}\d{1,3}$

# Date (JJ/MM/AAAA)
^\d{2}/\d{2}/\d{4}$

# Numero de telephone (francais)
^0[1-9](s-d-2){4}$
```

### Extraction de donnees
```regex
# Balises HTML
<([a-z]+)[^>]*>(.*?)</\1>

# Commentaires C /* ... */
/\*.*?\*/

# Commentaires C en ligne
//.*$

# Chaines entre guillemets
"[^"]*"
'[^']*'

# URLs
https?://[^\s]+
```

### Manipulation de texte
```regex
# Espaces en debut de ligne
^\s+

# Espaces en fin de ligne
\s+$

# Espaces multiples en un seul
\s+  (remplacer par un seul espace)

# Lignes vides
^$

# Lignes non vides
\S
```

---

## AIDE-MEMOIRE

### Metacaracteres
```
.       N'importe quel caractere    ^       Debut de ligne
$       Fin de ligne                *       Zero ou plus
+       Un ou plus                  ?       Zero ou un
[]      Classe de caracteres        [^]     Classe inversee
()      Groupe                      |       OU
\       Echappement                 {n,m}   Quantificateur
```

### Classes de caracteres
```
\d  chiffre      \D  non-chiffre
\w  car. de mot  \W  non-car. de mot
\s  espace blanc \S  non-espace blanc
```

### Reference rapide grep
```
grep "pattern" file          Recherche basique
grep -i                      Insensible a la casse
grep -v                      Inverser la correspondance
grep -c                      Compter les correspondances
grep -n                      Numeros de ligne
grep -E                      Regex etendue
grep -o                      Seulement la partie correspondante
grep -w                      Mot entier
```

### Reference rapide sed
```
sed 's/old/new/'             Remplacer la premiere
sed 's/old/new/g'            Remplacer toutes
sed -n '5,10p'               Afficher un intervalle
sed '/pattern/d'             Supprimer les correspondances
sed -i                       Edition en place
```

### Reference rapide awk
```
awk '{print $1}'             Premiere colonne
awk -F:                      Definir le delimiteur
awk '/pattern/'              Filtrer les lignes
awk '{sum+=$1} END{print sum}' Sommer une colonne
$NF = dernier champ, NR = numero de ligne
```
