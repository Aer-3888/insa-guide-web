---
title: "TP3 - FUS3: Regular Expressions & Pattern Matching"
sidebar_position: 8
---

# TP3 - FUS3: Regular Expressions & Pattern Matching

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp3_regex/README.md

## Exercise 1

### Use regex to find specific patterns in C source code: lines starting with punctuation, lines containing `while`, increment operators, non-empty lines, and labels for goto

**Setup -- create the sample C file:**

```bash
cat > source.c << 'EOF'
#include <stdio.h>

/* Global variables */
int counter = 0;

int main(int argc, char *argv[]) {
    int i;
    int sum = 0;
    
    /* Count loop */
    for (i = 0; i < 10; i++) {
        sum += i;
        counter++;
    }
    
    while (sum > 0) {
        sum--;
        printf("sum = %d\n", sum);
    }
    
    goto cleanup;
    
cleanup:
    printf("Done: counter=%d\n", counter);
    return 0;
}
EOF
```

---

**1a. Pattern 1: Lines starting with non-word, non-space characters (pseudo_grep.rb)**

**Answer:**

```ruby
#!/usr/bin/ruby -n
# Usage: ruby grep_simulator.rb < source.c

# Match lines starting with non-word, non-space characters
print if ($_ =~ /^\s*[^\w\s]/)
```

```bash
ruby grep_simulator.rb < source.c
```

**Expected output:**
```
#include <stdio.h>
/* Global variables */
    /* Count loop */
    for (i = 0; i < 10; i++) {
        counter++;
    }
    while (sum > 0) {
        sum--;
        printf("sum = %d\n", sum);
    }
cleanup:
    printf("Done: counter=%d\n", counter);
    return 0;
}
```

**Regex breakdown:** `^\s*[^\w\s]`
- `^` -- start of line
- `\s*` -- zero or more whitespace (indentation)
- `[^\w\s]` -- a character that is NOT a word character AND NOT whitespace (matches punctuation: `{`, `}`, `#`, `*`, `/`, etc.)

---

**1b. Pattern 2: Lines containing `while`**

**Answer:**

```ruby
#!/usr/bin/ruby -n
print if ($_ =~ /while/)
```

**Expected output:**
```
    while (sum > 0) {
```

---

**1c. Pattern 3: Increment operators (`++`)**

**Answer:**

```ruby
#!/usr/bin/ruby -n
# Need to escape + since it's a regex metacharacter
print if ($_ =~ /\+\+/)
```

**Expected output:**
```
    for (i = 0; i < 10; i++) {
        counter++;
```

---

**1d. Pattern 4: Non-empty lines**

**Answer:**

```ruby
#!/usr/bin/ruby -n
print if ($_ =~ /^\s*\S.*$/)
```

**Expected output:** all lines that are not blank (every line with at least one non-whitespace character).

---

**1e. Pattern 5: Labels (for goto)**

**Answer:**

```ruby
#!/usr/bin/ruby -n
print if ($_ =~ /^\s*[a-z0-9]+\s*:/)
```

**Expected output:**
```
cleanup:
```

---

**1f. Transform: Remove leading whitespace**

**Answer:**

```ruby
#!/usr/bin/ruby -n
$_.sub!(/^\s+/,"")
print $_
```

---

**1g. Transform: Compress multiple spaces to single space (in comment blocks)**

**Answer:**

```ruby
#!/usr/bin/ruby -n
$_.gsub!(/\s\s+/," ") if ($_ =~ /\/\*/)
print $_
```

---

**Pattern reference table:**

| Pattern | Regex | Matches |
|---------|-------|---------|
| Punctuation start | `/^\s*[^\w\s]/` | Lines starting with punctuation |
| while keyword | `/while/` | Lines containing "while" |
| Increment operators | `/\+\+/` | `++` (must escape `+`) |
| Non-empty lines | `/^\s*\S.*$/` | Any line with content |
| Labels (goto) | `/^\s*[a-z0-9]+\s*:/` | Label definitions |
| While loops | `/\bwhile\s*\(/` | while with opening paren |
| For loops | `/\bfor\s*\(/` | for with opening paren |
| Comment blocks | `/\/\*/` | Start of C block comment |

---

## Exercise 2

### Transform inline HTML/XML tags into properly formatted multi-line structure (uneBalise.rb)

**Answer:**

```ruby
#!/usr/bin/ruby -p
# Formats HTML/XML by adding newlines between tags
# -p flag: like -n but automatically prints modified lines

# Replace "><" sequences with ">\n<" to put each tag on its own line
$_.gsub!(/>([^<>]+)</, ">\n<")
```

**Test with adjacent tags (GEDCOM-to-XML output):**

```bash
echo '</INDI><INDI ID="123"><NAME>Vincent</NAME><SEX>M</SEX></INDI>' | ruby tag_formatter.rb
```

**Expected output:**
```
</INDI>
<INDI ID="123">
<SEX>M</SEX></INDI>
```

**Note:** The regex `>([^<>]+)<` matches text content between tags. Text like `Vincent` between `<NAME>` and `</NAME>` is removed because it matches `[^<>]+`. This is intentional for formatting GEDCOM-to-XML output where the goal is to separate adjacent tags.

---

## Exercise 3

### Work with LaTeX source files (f.tex) to extract or transform document structure

**Answer (extract LaTeX sections):**

```ruby
#!/usr/bin/ruby -n
# Print lines containing LaTeX section commands
print if ($_ =~ /\\(section|subsection|chapter)\{/)
```

---

## Exercise 4

### Parse HTML tables and extract structured data (etudiants3.html)

**Answer (extract table data from HTML):**

```ruby
#!/usr/bin/ruby
# Parse HTML table and extract student information

filename = ARGV[0] || "etudiants3.html"

File.open(filename, "r") do |file|
    in_row = false
    cells = []
    
    file.each_line do |line|
        if line =~ /<tr>/i
            in_row = true
            cells = []
        elsif line =~ /<\/tr>/i
            in_row = false
            puts cells.join(" | ") unless cells.empty?
        elsif in_row && line =~ /<td[^>]*>(.*?)<\/td>/i
            cells << $1.strip
        end
    end
end
```

---

## Key Regex Concepts

### Ruby regex quick reference

```ruby
# Match test (returns index or nil)
line =~ /pattern/

# Capture groups
line =~ /(\d+)\s+(\w+)/
first_match = $1       # First capture group
second_match = $2      # Second capture group

# Named captures (regex literal must be on LEFT side of =~)
/(?<tag>\w+)/ =~ "hello"
puts tag    # => "hello"

# Substitution
line.sub(/pattern/, "replace")     # First occurrence only
line.gsub(/pattern/, "replace")    # All occurrences
line.sub!(/pattern/, "replace")    # In-place, first occurrence
line.gsub!(/pattern/, "replace")   # In-place, all occurrences

# Flags
/pattern/i   # Case-insensitive
/pattern/m   # Multiline (. matches newline)
/pattern/x   # Extended (whitespace ignored, comments allowed)
```

### Ruby command-line flags

```bash
# -n: Wraps code in 'while gets ... end' loop, reads lines but doesn't print
ruby -n -e 'print if /pattern/' file.txt

# -p: Like -n but automatically prints $_
ruby -p -e '$_.upcase!' file.txt
```

### Character classes

| Symbol | Meaning | Equivalent |
|--------|---------|------------|
| `.` | Any character except newline | -- |
| `\d` | Digit | `[0-9]` |
| `\w` | Word character | `[A-Za-z0-9_]` |
| `\s` | Whitespace | `[ \t\n\r]` |
| `\D` | Not a digit | `[^0-9]` |
| `\W` | Not a word character | `[^A-Za-z0-9_]` |
| `\S` | Not whitespace | `[^ \t\n\r]` |

### Quantifiers

| Symbol | Meaning |
|--------|---------|
| `*` | Zero or more |
| `+` | One or more |
| `?` | Zero or one |
| `{n}` | Exactly n |
| `{n,m}` | Between n and m |
| `*?` | Zero or more (non-greedy) |

### Escaping

These metacharacters must be escaped with `\` to match literally:
```
.  *  +  ?  ^  $  [  ]  (  )  {  }  |  \
```
