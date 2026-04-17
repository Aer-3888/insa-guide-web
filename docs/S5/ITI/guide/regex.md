---
title: "Regular Expressions"
sidebar_position: 7
---

# Regular Expressions

## Overview

Regular expressions (regex) are patterns that describe text. They are used for searching, matching, and transforming text. Regex knowledge is critical for the FUS exam -- it appears in nearly every past paper, usually combined with `grep`, `sed`, or `awk`.

## Metacharacters

### Anchors
| Pattern | Meaning | Example |
|---------|---------|---------|
| `^` | Start of line | `^Hello` matches lines starting with "Hello" |
| `$` | End of line | `world$` matches lines ending with "world" |
| `^$` | Empty line | Matches lines with no content |
| `\b` | Word boundary | `\bcat\b` matches "cat" but not "concatenate" |

### Character Classes
| Pattern | Meaning | Example |
|---------|---------|---------|
| `.` | Any character (except newline) | `a.c` matches "abc", "a1c", "a-c" |
| `[abc]` | Any of a, b, or c | `[aeiou]` matches vowels |
| `[^abc]` | NOT a, b, or c | `[^0-9]` matches non-digits |
| `[a-z]` | Range a to z | `[A-Za-z]` matches any letter |
| `[0-9]` | Any digit | `[0-9]+` matches one or more digits |

### Shorthand Classes (Perl-style)
| Pattern | Equivalent | Meaning |
|---------|------------|---------|
| `\d` | `[0-9]` | Digit |
| `\D` | `[^0-9]` | Non-digit |
| `\w` | `[A-Za-z0-9_]` | Word character |
| `\W` | `[^A-Za-z0-9_]` | Non-word character |
| `\s` | `[ \t\n\r]` | Whitespace |
| `\S` | `[^ \t\n\r]` | Non-whitespace |

### Quantifiers
| Pattern | Meaning | Example |
|---------|---------|---------|
| `*` | Zero or more | `ab*c` matches "ac", "abc", "abbc" |
| `+` | One or more | `ab+c` matches "abc", "abbc" but not "ac" |
| `?` | Zero or one | `colou?r` matches "color" and "colour" |
| `{n}` | Exactly n | `a{3}` matches "aaa" |
| `{n,}` | At least n | `a{2,}` matches "aa", "aaa", "aaaa" |
| `{n,m}` | Between n and m | `a{2,4}` matches "aa", "aaa", "aaaa" |

### Greedy vs Non-Greedy
| Pattern | Behavior | Example on `<b>bold</b>` |
|---------|----------|--------------------------|
| `<.*>` | Greedy (match as much as possible) | Matches `<b>bold</b>` |
| `<.*?>` | Non-greedy (match as little as possible) | Matches `<b>` |

### Grouping and Alternation
| Pattern | Meaning | Example |
|---------|---------|---------|
| `(abc)` | Group and capture | `(cat\|dog)` matches "cat" or "dog" |
| `\|` | OR (alternation) | `yes\|no` matches "yes" or "no" |
| `\1` | Back-reference to group 1 | `(word)\1` matches "wordword" |

## grep Usage

### Basic grep
```bash
grep "pattern" file              # Lines containing pattern
grep -i "pattern" file           # Case-insensitive
grep -v "pattern" file           # Lines NOT matching (invert)
grep -c "pattern" file           # Count matching lines
grep -n "pattern" file           # Show line numbers
grep -l "pattern" *.txt          # List files containing pattern
grep -r "pattern" dir/           # Recursive search
grep -w "word" file              # Match whole word only
grep -o "pattern" file           # Print only the matching part
```

### Extended grep (egrep / grep -E)
```bash
grep -E "pattern1|pattern2" file     # OR
grep -E "^[A-Z]" file               # Lines starting with uppercase
grep -E "[0-9]{3}-[0-9]{4}" file     # Phone number pattern
grep -E "^.{80,}$" file             # Lines longer than 80 chars
```

### Common exam grep patterns

```bash
# Lines starting with a digit
grep "^[0-9]" file

# Lines ending with a period
grep "\.$" file

# Lines containing exactly 3 digits
grep -E "^[^0-9]*[0-9][^0-9]*[0-9][^0-9]*[0-9][^0-9]*$" file

# Empty lines
grep "^$" file

# Non-empty lines
grep -v "^$" file

# Lines containing an IP address (simplified)
grep -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" file

# Lines containing a C comment
grep "/\*" file

# Lines starting with # (comments in config files)
grep "^#" file

# Lines NOT starting with # (exclude comments)
grep -v "^#" file

# Lines with email-like pattern
grep -E "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" file
```

## sed Usage

### Substitution
```bash
sed 's/old/new/' file              # Replace first per line
sed 's/old/new/g' file             # Replace all per line
sed 's/old/new/2' file             # Replace 2nd occurrence
sed -i 's/old/new/g' file          # Edit in-place
sed 's/old/new/gi' file            # Case-insensitive replace
```

### Line operations
```bash
sed -n '5p' file                   # Print line 5 only
sed -n '5,10p' file                # Print lines 5-10
sed '5d' file                      # Delete line 5
sed '/pattern/d' file              # Delete matching lines
sed '/^$/d' file                   # Delete empty lines
sed '5a\New line' file             # Append after line 5
sed '5i\New line' file             # Insert before line 5
```

### Regex in sed
```bash
# Remove HTML tags
sed 's/<[^>]*>//g' file

# Extract content between tags
sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p' file

# Add prefix to each line
sed 's/^/PREFIX: /' file

# Remove trailing whitespace
sed 's/[[:space:]]*$//' file

# Replace multiple spaces with single space
sed 's/  */ /g' file
```

## awk Usage

### Basic syntax
```bash
awk '/pattern/ {action}' file
awk '{print $1, $3}' file           # Print columns 1 and 3
awk -F: '{print $1}' /etc/passwd    # Use : as delimiter
```

### Built-in variables
| Variable | Meaning |
|----------|---------|
| `$0` | Entire line |
| `$1, $2, ...` | Fields (columns) |
| `NF` | Number of fields |
| `NR` | Line number (record number) |
| `FS` | Field separator (default: space) |
| `OFS` | Output field separator |

### Examples
```bash
# Print lines longer than 80 characters
awk 'length > 80' file

# Sum a column
awk '{sum += $2} END {print sum}' file

# Print last column
awk '{print $NF}' file

# Conditional printing
awk '$3 > 100 {print $1, $3}' file

# Count lines matching pattern
awk '/error/ {count++} END {print count}' file
```

## Ruby Regex (for GEDCOM/FUS TPs)

Ruby uses first-class regex with the `=~` operator:

```ruby
# Match operator
if line =~ /pattern/
    puts "Match found"
end

# Capture groups
if line =~ /(\d+)\s+(.*)/
    level = $1    # First capture group
    rest = $2     # Second capture group
end

# Named captures (Ruby 2.0+)
if /(?<tag>BIRT|DEAT)\s+(?<data>.*)/ =~ line
    puts tag      # "BIRT" or "DEAT"
    puts data     # Rest of line
end

# Substitution
line.sub(/old/, "new")      # First occurrence
line.gsub(/old/, "new")     # All occurrences
line.sub!(/old/, "new")     # In-place modification

# Modifiers
/pattern/i    # Case-insensitive
/pattern/m    # Multiline (. matches newline)
/pattern/x    # Extended (ignore whitespace, allow comments)
```

### Ruby command-line flags
```bash
# -n: Wraps code in while-gets loop, does NOT auto-print
ruby -n -e 'print if /pattern/' file.txt

# -p: Like -n but auto-prints $_ after each iteration
ruby -p -e '$_.gsub!(/old/, "new")' file.txt
```

## Python Regex

```python
import re

# Match at start of string
match = re.match(r'^\d{3}', '123abc')

# Search anywhere in string
match = re.search(r'\d+', 'Order 12345')
if match:
    print(match.group())    # '12345'

# Find all matches
numbers = re.findall(r'\d+', 'a1 b22 c333')  # ['1', '22', '333']

# Replace
result = re.sub(r'\d+', 'X', 'a1 b22')  # 'aX bX'

# Split
parts = re.split(r'\s+', 'split  on   spaces')  # ['split', 'on', 'spaces']

# Compile for reuse
pattern = re.compile(r'\d{3}-\d{4}')
matches = pattern.findall(text)
```

## Common Patterns for Exams

### Validate formats
```regex
# Email (simplified)
^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$

# IP Address (simplified)
^(\d{1,3}\.){3}\d{1,3}$

# Date (DD/MM/YYYY)
^\d{2}/\d{2}/\d{4}$

# Phone number (French)
^0[1-9](s-d-2){4}$
```

### Extract data
```regex
# HTML tags
<([a-z]+)[^>]*>(.*?)</\1>

# C comments /* ... */
/\*.*?\*/

# C single-line comments
//.*$

# Quoted strings
"[^"]*"
'[^']*'

# URLs
https?://[^\s]+
```

### Text manipulation
```regex
# Leading whitespace
^\s+

# Trailing whitespace
\s+$

# Multiple spaces to one
\s+  (replace with single space)

# Empty lines
^$

# Non-empty lines
\S
```

---

## CHEAT SHEET

### Metacharacters
```
.       Any character           ^       Start of line
$       End of line             *       Zero or more
+       One or more             ?       Zero or one
[]      Character class         [^]     Negated class
()      Group                   |       OR
\       Escape                  {n,m}   Quantifier
```

### Character Classes
```
\d  digit       \D  non-digit
\w  word char   \W  non-word
\s  whitespace  \S  non-whitespace
```

### grep Quick Reference
```
grep "pattern" file          Basic search
grep -i                      Case-insensitive
grep -v                      Invert match
grep -c                      Count matches
grep -n                      Line numbers
grep -E                      Extended regex
grep -o                      Only matching part
grep -w                      Whole word
```

### sed Quick Reference
```
sed 's/old/new/'             Replace first
sed 's/old/new/g'            Replace all
sed -n '5,10p'               Print range
sed '/pattern/d'             Delete matching
sed -i                       In-place edit
```

### awk Quick Reference
```
awk '{print $1}'             First column
awk -F:                      Set delimiter
awk '/pattern/'              Filter lines
awk '{sum+=$1} END{print sum}' Sum column
$NF = last field, NR = line number
```
