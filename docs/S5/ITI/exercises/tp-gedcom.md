---
title: "TP4 - FUS4: Genealogy Data Parsing (GEDCOM)"
sidebar_position: 4
---

# TP4 - FUS4: Genealogy Data Parsing (GEDCOM)

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp4_gedcom/README.md

## Exercise 1

### Write a Ruby script that converts GEDCOM files to well-formed XML. Handle five classes of GEDCOM lines, use a stack to manage tag nesting, and produce properly indented output.

**The Five Line Classes:**

| Class | Pattern | GEDCOM Example | XML Output |
|-------|---------|----------------|------------|
| 1 | NAME tag with surname | `1 NAME Vincent/GASSOT/` | `<NAME>Vincent<S>GASSOT</S></NAME>` |
| 2 | ID declaration | `0 @142070@ INDI` | `<INDI ID="142070">` |
| 3 | Reference | `1 HUSB @142070@` | `<HUSB REF="142070"></HUSB>` |
| 4 | Event (no value) | `1 BIRT` | `<EVEN EV='BIRT'>` |
| 5 | Simple tag + value | `2 DATE 1754` | `<DATE>1754</DATE>` |

---

**1a. Complete GEDCOM to XML converter (ged2xml.rb)**

**Answer:**

```ruby
#!/usr/bin/ruby
# GEDCOM to XML Converter
# Usage: ruby ged2xml.rb input.ged output.xml

syntaxe = "Usage: #{$0} input.ged output.xml"

# Validate arguments
nbarg = ARGV.size
if nbarg != 2
    abort syntaxe
end

(entree, sortie) = ARGV

# Verify input file exists
unless File.exist?(entree)
    abort "\t[Error: Input file #{entree} does not exist]\n"
end

# Open files with error handling
begin
    fe = File.open(entree, "r")
rescue Errno::ENOENT
    abort "\t[Error: Failed to open input file #{entree}]\n"
end

begin
    fs = File.open(sortie, "w")
rescue Errno::ENOENT
    abort "\t[Error: Failed to open output file #{sortie}]\n"
end

# Track previous level for managing nested structures
last_tag_level = 0

# Stack to manage opening/closing of XML tags
tag_stack = []

# Main parsing loop
begin
    while line = fe.readline
        line.sub!(/\s+$/, "")   # Remove trailing whitespace

        # Extract level and remainder
        if line =~ /\s*(\d+)\s+(.*)$/
            niv = $1.to_i
            remainder = $2
            fs.print "\t" * niv  # Indentation based on level
        end

        # Close tags when level decreases
        if last_tag_level > niv
            while last_tag_level > niv
                last_tag_level -= 1
                fs.print "</", tag_stack.pop, ">\n"
                fs.print "\t" * last_tag_level
            end
        elsif last_tag_level < niv
            last_tag_level = niv
        end

        # Ignore HEAD tag
        if remainder =~ /^HEAD$/
            # Skip

        # Class 2: Identifier lines (@ID@ INDI or @ID@ FAM)
        elsif line =~ /@(\d+)@\s*(INDI|FAM)$/
            balise = $2
            tag_stack.push($2)
            fs.print "<#{balise} ID=\"#{$1}\">\n"

        # Class 1: NAME tag with "Given/SURNAME/" format
        elsif remainder =~ /NAME ([\s\w].*)\/([A-Z\-].*)\/
/
            fs.print "<NAME>#{$1}<S>#{$2}</S></NAME>\n"

        # Class 3: Reference lines (FAMS, FAMC, HUSB, WIFE, CHIL + @ID@)
        elsif /(?<balise>FAMS|FAMC|HUSB|WIFE|CHIL)\s+@(?<id>\d+)@/ =~ remainder
            fs.print "<#{balise} REF=\"#{id}\"></#{balise}>\n"

        # Class 4: Event tags without values (BIRT, DEAT, MARR, MARC)
        elsif /(?<tag>BIRT|DEAT|MARR|MARC)/ =~ remainder
            fs.print "<EVEN EV='#{tag}'>\n"
            tag_stack.push("EVEN")

        # Class 5: Tag with value (SEX, OCCU, DATE, PLAC + data)
        elsif /(?<tag>SEX|OCCU|DATE|PLAC)\s+(?<data>.*)$/ =~ remainder
            fs.print "<#{tag}>#{data}</#{tag}>\n"

        else
            print "Unexpected line: #{line}\n"
        end
    end
rescue EOFError
    # End of file
end

# Close remaining unclosed tags
while !tag_stack.empty?
    fs.print "\t" * (tag_stack.size - 1), "</", tag_stack.pop, ">\n"
end

fe.close
fs.close
```

---

**1b. Run the converter**

**Answer:**

```bash
ruby ged2xml.rb test.ged output.xml
```

**Test GEDCOM input (test.ged):**
```gedcom
0 HEAD
0 @142070@ INDI
1 NAME Vincent/GASSOT/
1 SEX M
1 BIRT
2 DATE 1754
2 PLAC Cherrueix
1 DEAT
2 DATE 1820
1 FAMS @142074@
0 @142075@ INDI
1 NAME Marie/DUPONT/
1 SEX F
1 BIRT
2 DATE 1760
2 PLAC Rennes
1 FAMS @142074@
0 @142074@ FAM
1 HUSB @142070@
1 WIFE @142075@
1 CHIL @142080@
1 MARR
2 DATE 1780
2 PLAC Cherrueix
0 @142080@ INDI
1 NAME Jean/GASSOT/
1 SEX M
1 BIRT
2 DATE 1782
1 FAMC @142074@
```

**Expected XML output (output.xml):**
```xml
<INDI ID="142070">
	<NAME>Vincent<S>GASSOT</S></NAME>
	<SEX>M</SEX>
	<EVEN EV='BIRT'>
		<DATE>1754</DATE>
		<PLAC>Cherrueix</PLAC>
	</EVEN>
	<EVEN EV='DEAT'>
		<DATE>1820</DATE>
	</EVEN>
	<FAMS REF="142074"></FAMS>
</INDI>
<INDI ID="142075">
	<NAME>Marie<S>DUPONT</S></NAME>
	<SEX>F</SEX>
	<EVEN EV='BIRT'>
		<DATE>1760</DATE>
		<PLAC>Rennes</PLAC>
	</EVEN>
	<FAMS REF="142074"></FAMS>
</INDI>
<FAM ID="142074">
	<HUSB REF="142070"></HUSB>
	<WIFE REF="142075"></WIFE>
	<CHIL REF="142080"></CHIL>
	<EVEN EV='MARR'>
		<DATE>1780</DATE>
		<PLAC>Cherrueix</PLAC>
	</EVEN>
</FAM>
<INDI ID="142080">
	<NAME>Jean<S>GASSOT</S></NAME>
	<SEX>M</SEX>
	<EVEN EV='BIRT'>
		<DATE>1782</DATE>
	</EVEN>
	<FAMC REF="142074"></FAMC>
</INDI>
```

---

**1c. Stack trace -- how the tag stack works**

```
GEDCOM line                     Action                 Stack state
-----------                     ------                 -----------
0 @142070@ INDI                 push "INDI"            [INDI]
1 NAME Vincent/GASSOT/          self-closing           [INDI]
1 SEX M                         self-closing           [INDI]
1 BIRT                          push "EVEN"            [INDI, EVEN]
2 DATE 1754                     self-closing           [INDI, EVEN]
2 PLAC Cherrueix                self-closing           [INDI, EVEN]
1 DEAT                          level 2->1: pop "EVEN" [INDI]
                                push "EVEN"            [INDI, EVEN]
2 DATE 1820                     self-closing           [INDI, EVEN]
1 FAMS @142074@                 level 2->1: pop "EVEN" [INDI]
                                self-closing           [INDI]
0 @142075@ INDI                 level 1->0: pop "INDI" []
                                push "INDI"            [INDI]
...
EOF                             pop all remaining      []
```

---

**1d. Verify regex patterns in irb**

**Answer:**

```ruby
# Class 2: ID declaration
"0 @142070@ INDI" =~ /@(\d+)@\s*(INDI|FAM)$/
puts $1    # => "142070"
puts $2    # => "INDI"

# Class 1: NAME with surname
"NAME Vincent/GASSOT/" =~ /NAME ([\s\w].*)\/([A-Z\-].*)\/$/
puts $1    # => "Vincent"
puts $2    # => "GASSOT"

# Class 3: Reference
remainder = "HUSB @142070@"
/(?<balise>FAMS|FAMC|HUSB|WIFE|CHIL)\s+@(?<id>\d+)@/ =~ remainder
puts balise  # => "HUSB"
puts id      # => "142070"

# Class 4: Event
/(?<tag>BIRT|DEAT|MARR|MARC)/ =~ "BIRT"
puts tag     # => "BIRT"

# Class 5: Tag + value
/(?<tag>SEX|OCCU|DATE|PLAC)\s+(?<data>.*)$/ =~ "SEX M"
puts tag     # => "SEX"
puts data    # => "M"
```

---

## Exercise 2

### Generate an HTML report from GEDCOM or XML data with CSS styling (family tree visualization)

**Answer:** This extends Exercise 1 by transforming the XML output into formatted HTML. The approach uses the same parsing logic but outputs HTML table rows instead of XML tags.

---

## Exercise 3

### Data validation -- check GEDCOM files for consistency: all referenced IDs exist, dates are valid, required fields are present

**Answer:**

```ruby
#!/usr/bin/ruby
# ged_validator.rb -- Validate GEDCOM file consistency

filename = ARGV[0] || abort("Usage: #{$0} <file.ged>")

declared_ids = []
referenced_ids = []

File.open(filename, "r") do |f|
    f.each_line do |line|
        line.strip!
        # Collect declared IDs
        if line =~ /^\d+\s+@(\w+)@\s+(INDI|FAM)/
            declared_ids << $1
        end
        # Collect referenced IDs
        line.scan(/@(\w+)@/).each do |match|
            referenced_ids << match[0] unless line =~ /^\d+\s+@#{match[0]}@\s+(INDI|FAM)/
        end
    end
end

missing = referenced_ids.uniq - declared_ids.uniq
if missing.empty?
    puts "All referenced IDs are declared."
else
    puts "Missing IDs: #{missing.join(', ')}"
end
```

---

## Concepts cles

1. **Pile pour les structures imbriquees** : empiler lors de l'ouverture d'une balise conteneur (`INDI`, `FAM`, `EVEN`), depiler quand le niveau diminue
2. **Suivi du niveau** : comparer `last_tag_level` avec le niveau courant pour decider s'il faut fermer des balises
3. **Groupes de capture regex** : `$1`, `$2` pour les captures positionnelles ; `(?<name>...)` pour les captures nommees
4. **Correspondance par priorite** : verifier les motifs les plus specifiques (identifiants avec `@ID@`) avant les moins specifiques
5. **Gestion de fin de fichier** : apres la boucle principale, vider la pile pour fermer toutes les balises ouvertes restantes
