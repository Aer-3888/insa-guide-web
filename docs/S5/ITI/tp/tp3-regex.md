---
title: "FUS3 - Regular Expressions & Pattern Matching"
sidebar_position: 3
---

# FUS3 - Regular Expressions & Pattern Matching

## Learning Objectives

This TP focuses on regular expressions (regex) for text pattern matching and manipulation:

- Understand regex syntax and metacharacters
- Use regex in scripting languages (Ruby, Perl)
- Process structured text files (HTML, XML, TeX)
- Extract and transform data using pattern matching
- Work with line-oriented text processing

## Core Concepts

### 1. Regular Expression Basics

Regular expressions are patterns that describe text. They use special metacharacters:

#### Basic Metacharacters
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

#### Character Classes
- `\d` - Digit `[0-9]`
- `\w` - Word character `[A-Za-z0-9_]`
- `\s` - Whitespace (space, tab, newline)
- `\D`, `\W`, `\S` - Negations of above

#### Quantifiers
- `{n}` - Exactly n times
- `{n,}` - At least n times
- `{n,m}` - Between n and m times

### 2. Examples

```regex
^a          # Lines starting with 'a'
end$        # Lines ending with 'end'
^$          # Empty lines
[0-9]+      # One or more digits
\w+@\w+\.\w+ # Simple email pattern
<[^>]+>     # HTML/XML tags
```

### 3. Ruby Regex

Ruby has first-class regex support:

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

### 4. Command-Line Options

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

### 5. Practical Applications

#### Grep Simulation
```ruby
#!/usr/bin/ruby -n
# Print lines matching pattern
print if $_ =~ /pattern/
```

#### Text Transformation
```ruby
#!/usr/bin/ruby -p
# Remove leading whitespace
$_.sub!(/^\s+/, "")

# Compress multiple spaces to single space
$_.gsub!(/\s+/, " ")
```

#### HTML/XML Formatting
```ruby
#!/usr/bin/ruby -p
# Insert newlines between tags
$_.gsub!(/>([^<>]+)</, ">\n<")
```

## Exercises Overview

### Exercise 1: Pattern Matching in C Code
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

### Exercise 2: HTML/XML Tag Formatting
Transform inline tags into properly formatted multi-line structure.

**Script**: `uneBalise.rb` - Adds newlines between tags

### Exercise 3: TeX Processing
Work with LaTeX source files to extract or transform document structure.

**File**: `f.tex` - Sample LaTeX document

### Exercise 4: HTML Data Extraction
Parse HTML tables and extract structured data.

**File**: `etudiants3.html` - HTML table with student information

## Solutions

See `src/` directory for cleaned, commented implementations:
- `grep_simulator.rb` - Pattern matching examples
- `tag_formatter.rb` - HTML/XML tag processing
- `c_code_analyzer.rb` - Analyze C source patterns
- `latex_processor.rb` - TeX file manipulation

## Key Takeaways

1. **Start simple** - Build complex patterns from simple pieces
2. **Test incrementally** - Verify each part of regex before combining
3. **Use raw strings** - In most languages, avoid double-escaping with r"" or //
4. **Non-greedy matching** - Use `*?` or `+?` to match minimally
5. **Capture groups** - Use () to extract matched substrings

## Regex Tools & Testing

- Online testers: regex101.com, regexr.com
- Command line: `grep -E` (extended regex), `grep -P` (Perl regex)
- Ruby: `irb` interactive shell for testing patterns
- Perl: `perl -ne 'print if /pattern/' file`

## Common Patterns

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

## Common Pitfalls

1. **Greediness** - `.*` matches as much as possible; use `.*?` for minimal match
2. **Not escaping metacharacters** - `\.` for literal dot, `\+` for literal plus
3. **Forgetting anchors** - `^` and `$` prevent partial matches
4. **Catastrophic backtracking** - Complex patterns with many alternations can hang
5. **Character class mistakes** - `[a-z-9]` vs `[a-z0-9]` (hyphen position matters)

## Further Reading

- Mastering Regular Expressions (O'Reilly)
- Ruby regex: https://ruby-doc.org/core/Regexp.html
- Perl regex: `perldoc perlre`
- POSIX regex vs PCRE (Perl-Compatible)
- Lookahead/lookbehind assertions for complex matching
