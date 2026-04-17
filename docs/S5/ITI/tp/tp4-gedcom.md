---
title: "FUS4 - Genealogy Data Parsing (GEDCOM)"
sidebar_position: 4
---

# FUS4 - Genealogy Data Parsing (GEDCOM)

## Learning Objectives

This TP introduces parsing structured data formats using scripting languages:

- Understand hierarchical data formats (GEDCOM)
- Parse and transform data with Ruby/Perl
- Work with stacks for managing nested structures
- Convert between data formats (GEDCOM → XML)
- Handle file I/O with error checking

## Core Concepts

### 1. GEDCOM Format

GEDCOM (GEnealogical Data COMmunication) is a standard format for genealogical data exchange.

#### Structure
Each line has three parts:
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

#### Key Tags
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

### 2. XML Conversion

The goal is to convert GEDCOM's level-based format to hierarchical XML:

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

### 3. Stack-Based Parsing

To handle nested structures, use a stack to track open tags:

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

### 4. Ruby File I/O

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

### 5. Regular Expressions for Parsing

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

## Exercises Overview

### Exercise 1: Parse GEDCOM to XML
Write a converter that transforms GEDCOM files to XML format.

**Input**: `.ged` files (GassotRed.ged, mouche.ged)
**Output**: XML with proper nesting and attributes

**Five line classes**:

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

### Exercise 2: Generate HTML Report
Transform the XML or GEDCOM into human-readable HTML with CSS styling.

**Output**: Family tree visualization

### Exercise 3: Data Validation
Check GEDCOM files for consistency:
- All referenced IDs exist
- Dates are valid
- Required fields are present

## Solutions

See `src/` directory for cleaned, commented implementations:
- `ged2xml.rb` - GEDCOM to XML converter
- `ged2html.rb` - GEDCOM to HTML reporter
- `ged_validator.rb` - GEDCOM file validator

## Key Takeaways

1. **Hierarchical data needs careful tracking** - Use stacks or counters
2. **Regex is essential for parsing** - Learn capture groups
3. **Handle errors gracefully** - Check file existence, handle EOFError
4. **Test with small datasets** - Use GassotRed.ged before mouche.ged
5. **Close tags properly** - Don't leave unclosed tags at EOF

## Parsing Strategy

1. **Read line by line** - Don't load entire file into memory
2. **Extract level first** - Determines nesting depth
3. **Match patterns by priority** - Most specific first
4. **Track state** - Remember previous level, open tags
5. **Close tags when level decreases** - Pop from stack

## Common Patterns

### Argument Validation
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

### Safe File Operations
```ruby
begin
    file = File.open(filename, "r")
    # ... process file
ensure
    file.close if file
end
```

## Common Pitfalls

1. **Not closing tags at EOF** - Always flush the stack
2. **Incorrect level tracking** - Off-by-one errors in nesting
3. **Greedy regex** - `.*` can match too much
4. **Not handling edge cases** - Empty names, missing dates
5. **Forgetting to escape XML** - `<`, `>`, `&` need escaping

## Further Reading

- GEDCOM 5.5 specification
- Ruby regex: https://ruby-doc.org/core/Regexp.html
- XML well-formedness rules
- Stack data structure and applications
- Recursive descent parsing

## Data Format Notes

### GEDCOM Naming Convention
Names in GEDCOM use slash delimiters:
```
Given Names/SURNAME/
```

### XML Attributes vs Elements
- Use attributes for IDs and references: `ID="123"`, `REF="456"`
- Use elements for content: `<DATE>1754</DATE>`

### Indentation
Maintain proper XML indentation matching GEDCOM levels:
- Level 0 → No indent
- Level 1 → One tab
- Level 2 → Two tabs
