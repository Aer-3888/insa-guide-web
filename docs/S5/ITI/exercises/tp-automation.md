---
title: "TP12 - LDS5: Process Automation & Scripting"
sidebar_position: 1
---

# TP12 - LDS5: Process Automation & Scripting

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp12_automation/README.md

## Exercise 1

### GEDCOM File Processing in Python: parse genealogy data in GEDCOM format, extract individual and family records, build a structured data model (Q1.py)

**1a. Understand the GEDCOM format**

GEDCOM (GEnealogical Data COMmunication) encodes genealogy data with numbered indentation levels:

```
0 HEAD                    <- Header (level 0)
1 SOUR Test               <- Source info (level 1, child of HEAD)
0 @I1@ INDI              <- Individual record, ID = I1
1 NAME Jean/DUPONT/       <- Name (given/SURNAME/)
1 SEX M                   <- Sex
1 BIRT                    <- Birth event
2 DATE 1 JAN 1800         <- Birth date (level 2, child of BIRT)
2 PLAC Paris              <- Birth place
1 DEAT                    <- Death event
2 DATE 15 MAR 1870
1 FAMS @F1@               <- Spouse in family F1
0 @F1@ FAM                <- Family record, ID = F1
1 HUSB @I1@               <- Husband reference
1 WIFE @I2@               <- Wife reference
1 CHIL @I3@               <- Child reference
1 MARR                    <- Marriage event
2 DATE 1825
0 TRLR                    <- Trailer (end of file)
```

**Key rules:**
- Level 0 starts a new top-level record (`INDI`, `FAM`, `HEAD`, `TRLR`)
- Level 1 tags are properties of the current record
- Level 2 tags are sub-properties (date/place of an event)
- `@ID@` references link individuals to families

---

**1b. Create a test GEDCOM file**

```bash
cat > sabotiers.ged << 'EOF'
0 HEAD
1 SOUR Test
0 @I1@ INDI
1 NAME Jean/DUPONT/
1 SEX M
1 BIRT
2 DATE 1 JAN 1800
2 PLAC Paris
1 DEAT
2 DATE 15 MAR 1870
2 PLAC Lyon
1 FAMS @F1@
0 @I2@ INDI
1 NAME Marie/MARTIN/
1 SEX F
1 BIRT
2 DATE 5 JUN 1805
2 PLAC Rennes
1 FAMS @F1@
0 @I3@ INDI
1 NAME Pierre/DUPONT/
1 SEX M
1 BIRT
2 DATE 12 FEB 1830
2 PLAC Paris
1 FAMC @F1@
1 FAMS @F2@
0 @I4@ INDI
1 NAME Jeanne/LEBLANC/
1 SEX F
1 BIRT
2 DATE 20 APR 1835
2 PLAC Nantes
1 FAMS @F2@
0 @I5@ INDI
1 NAME Louis/DUPONT/
1 SEX M
1 BIRT
2 DATE 3 SEP 1860
1 FAMC @F2@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
1 MARR
2 DATE 1825
2 PLAC Paris
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I4@
1 CHIL @I5@
1 MARR
2 DATE 1855
2 PLAC Lyon
0 TRLR
EOF
```

---

**1c. Create the GEDCOM parser class**

**Answer:**

```python
import re


class GEDCOMParser:
    """Parse GEDCOM files and extract genealogy data."""

    def __init__(self):
        self.individuals = {}  # id -> person dict
        self.families = {}     # id -> family dict

    def parse_file(self, filename):
        """Parse a GEDCOM file. Returns True on success."""
        try:
            with open(filename, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except FileNotFoundError:
            print(f"Error: File {filename} not found")
            return False

        current_record = None
        current_id = None
        current_event = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Parse: <level> <remainder>
            match = re.match(r"^(\d+)\s+(.+)$", line)
            if not match:
                continue

            level = int(match.group(1))
            remainder = match.group(2)

            # Level 0: new record or header/trailer
            if level == 0:
                current_event = None

                # Check for @ID@ TYPE
                id_match = re.match(r"@(\w+)@\s+(\w+)", remainder)
                if id_match:
                    record_id = id_match.group(1)
                    record_type = id_match.group(2)
                    if record_type == "INDI":
                        current_record = "INDI"
                        current_id = record_id
                        self.individuals[record_id] = {
                            "id": record_id,
                            "name": "",
                            "sex": "",
                            "birth_date": "",
                            "birth_place": "",
                            "death_date": "",
                            "death_place": "",
                            "families_spouse": [],
                            "family_child": None,
                        }
                    elif record_type == "FAM":
                        current_record = "FAM"
                        current_id = record_id
                        self.families[record_id] = {
                            "id": record_id,
                            "husband": None,
                            "wife": None,
                            "children": [],
                            "marriage_date": "",
                            "marriage_place": "",
                        }
                else:
                    current_record = None
                    current_id = None

            # Level 1: record fields
            elif level == 1 and current_record and current_id:
                parts = remainder.split(None, 1)
                tag = parts[0]
                value = parts[1] if len(parts) > 1 else ""

                if current_record == "INDI":
                    person = self.individuals[current_id]
                    if tag == "NAME":
                        # GEDCOM stores names as "Given/SURNAME/"
                        name_match = re.match(r"(.+)/(.+)/", value)
                        if name_match:
                            given = name_match.group(1).strip()
                            surname = name_match.group(2).strip()
                            person["name"] = f"{given} {surname}"
                        else:
                            person["name"] = value
                    elif tag == "SEX":
                        person["sex"] = value
                    elif tag in ("BIRT", "DEAT"):
                        current_event = tag
                    elif tag == "FAMS":
                        ref = re.search(r"@(\w+)@", value)
                        if ref:
                            person["families_spouse"].append(ref.group(1))
                    elif tag == "FAMC":
                        ref = re.search(r"@(\w+)@", value)
                        if ref:
                            person["family_child"] = ref.group(1)

                elif current_record == "FAM":
                    family = self.families[current_id]
                    if tag == "HUSB":
                        ref = re.search(r"@(\w+)@", value)
                        if ref:
                            family["husband"] = ref.group(1)
                    elif tag == "WIFE":
                        ref = re.search(r"@(\w+)@", value)
                        if ref:
                            family["wife"] = ref.group(1)
                    elif tag == "CHIL":
                        ref = re.search(r"@(\w+)@", value)
                        if ref:
                            family["children"].append(ref.group(1))
                    elif tag == "MARR":
                        current_event = "MARR"

            # Level 2: event details (date, place)
            elif level == 2 and current_event:
                parts = remainder.split(None, 1)
                tag = parts[0]
                value = parts[1] if len(parts) > 1 else ""

                if current_record == "INDI":
                    person = self.individuals[current_id]
                    if current_event == "BIRT":
                        if tag == "DATE":
                            person["birth_date"] = value
                        elif tag == "PLAC":
                            person["birth_place"] = value
                    elif current_event == "DEAT":
                        if tag == "DATE":
                            person["death_date"] = value
                        elif tag == "PLAC":
                            person["death_place"] = value

                elif current_record == "FAM":
                    family = self.families[current_id]
                    if current_event == "MARR":
                        if tag == "DATE":
                            family["marriage_date"] = value
                        elif tag == "PLAC":
                            family["marriage_place"] = value

        return True

    def get_person_name(self, person_id):
        """Get the name of a person by ID."""
        if person_id in self.individuals:
            return self.individuals[person_id]["name"]
        return "Unknown"

    def summary(self):
        """Print a summary of parsed data."""
        print(f"Individuals: {len(self.individuals)}")
        print(f"Families: {len(self.families)}")
        for pid, person in sorted(
            self.individuals.items(),
            key=lambda x: x[1]["name"],
        ):
            sex = f" ({person['sex']})" if person["sex"] else ""
            born = f", born {person['birth_date']}" if person["birth_date"] else ""
            print(f"  {person['name']}{sex}{born}")
```

**Parsing state machine:**
```
Level 0 line (@ID@ INDI)
  |-> sets current_record = "INDI", current_id = ID
  |
  Level 1 line (NAME, SEX, BIRT, DEAT, FAMS, FAMC)
    |-> reads tag value, or sets current_event for BIRT/DEAT
    |
    Level 2 line (DATE, PLAC)
      |-> reads event detail into the correct field
      |   based on current_event (BIRT/DEAT/MARR)

Level 0 line (@ID@ FAM)
  |-> sets current_record = "FAM", current_id = ID
  |
  Level 1 line (HUSB, WIFE, CHIL, MARR)
    |-> reads reference or sets current_event for MARR
```

---

**1d. Test the parser**

**Answer:**

```python
from gedcom_parser import GEDCOMParser

parser = GEDCOMParser()
success = parser.parse_file("sabotiers.ged")

if success:
    parser.summary()

    print("\n=== Family details ===")
    for fid, family in parser.families.items():
        husband = parser.get_person_name(family["husband"])
        wife = parser.get_person_name(family["wife"])
        date = family["marriage_date"]
        place = family["marriage_place"]
        children = [parser.get_person_name(c) for c in family["children"]]
        print(f"  {husband} & {wife} (married {date}, {place})")
        for child in children:
            print(f"    - {child}")
```

**Expected output:**
```
Individuals: 5
Families: 2
  Jean DUPONT (M), born 1 JAN 1800
  Jeanne LEBLANC (F), born 20 APR 1835
  Louis DUPONT (M), born 3 SEP 1860
  Marie MARTIN (F), born 5 JUN 1805
  Pierre DUPONT (M), born 12 FEB 1830

=== Family details ===
  Jean DUPONT & Marie MARTIN (married 1825, Paris)
    - Pierre DUPONT
  Pierre DUPONT & Jeanne LEBLANC (married 1855, Lyon)
    - Louis DUPONT
```

---

## Exercise 2

### Automated Report Generation: generate a formatted text report from parsed GEDCOM data including individual listings, family groups, and statistics (Q2.py)

**2a. Create the report generator**

**Answer:**

```python
from gedcom_parser import GEDCOMParser


def generate_report(parser, output_file):
    """Generate a text report from parsed GEDCOM data."""
    with open(output_file, "w", encoding="utf-8") as f:
        # Header
        f.write("=" * 60 + "\n")
        f.write("GENEALOGY REPORT\n")
        f.write("=" * 60 + "\n\n")

        # Individual list
        f.write(f"INDIVIDUALS ({len(parser.individuals)})\n")
        f.write("-" * 40 + "\n")
        for pid, person in sorted(
            parser.individuals.items(),
            key=lambda x: x[1]["name"],
        ):
            f.write(f"\n{person['name']}")
            if person["sex"]:
                f.write(f" ({person['sex']})")
            f.write("\n")
            if person["birth_date"]:
                f.write(f"  Born: {person['birth_date']}")
                if person["birth_place"]:
                    f.write(f" at {person['birth_place']}")
                f.write("\n")
            if person["death_date"]:
                f.write(f"  Died: {person['death_date']}")
                if person["death_place"]:
                    f.write(f" at {person['death_place']}")
                f.write("\n")

        # Family list
        f.write(f"\n\nFAMILIES ({len(parser.families)})\n")
        f.write("-" * 40 + "\n")
        for fid, family in parser.families.items():
            husband = parser.get_person_name(family["husband"])
            wife = parser.get_person_name(family["wife"])
            f.write(f"\n{husband} & {wife}")
            if family["marriage_date"]:
                f.write(f" (married {family['marriage_date']})")
            f.write("\n")
            for child_id in family["children"]:
                child = parser.get_person_name(child_id)
                f.write(f"  - {child}\n")

        # Statistics
        f.write(f"\n\nSTATISTICS\n")
        f.write("-" * 40 + "\n")
        males = sum(
            1 for p in parser.individuals.values() if p["sex"] == "M"
        )
        females = sum(
            1 for p in parser.individuals.values() if p["sex"] == "F"
        )
        f.write(f"Males: {males}\n")
        f.write(f"Females: {females}\n")
        f.write(f"Families: {len(parser.families)}\n")

    print(f"Report written to {output_file}")
```

---

**2b. Generate a report and verify the output**

**Answer:**

```python
from gedcom_parser import GEDCOMParser
from report_generator import generate_report

parser = GEDCOMParser()
parser.parse_file("sabotiers.ged")
generate_report(parser, "sabotiers_report.txt")
```

```bash
python3 test_report.py
cat sabotiers_report.txt
```

**Expected output (file content):**
```
============================================================
GENEALOGY REPORT
============================================================

INDIVIDUALS (5)
----------------------------------------

Jean DUPONT (M)
  Born: 1 JAN 1800 at Paris
  Died: 15 MAR 1870 at Lyon

Jeanne LEBLANC (F)
  Born: 20 APR 1835 at Nantes

Louis DUPONT (M)
  Born: 3 SEP 1860

Marie MARTIN (F)
  Born: 5 JUN 1805 at Rennes

Pierre DUPONT (M)
  Born: 12 FEB 1830 at Paris


FAMILIES (2)
----------------------------------------

Jean DUPONT & Marie MARTIN (married 1825)
  - Pierre DUPONT

Pierre DUPONT & Jeanne LEBLANC (married 1855)
  - Louis DUPONT


STATISTICS
----------------------------------------
Males: 3
Females: 2
Families: 2
```

**Key file I/O patterns:**

```python
# Writing with context manager (always closes file properly)
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("line\n")

# Appending to existing file
with open("log.txt", "a") as f:
    f.write("new entry\n")

# Reading entire file
with open("input.txt", "r") as f:
    content = f.read()

# Reading line by line (memory efficient for large files)
with open("input.txt", "r") as f:
    for line in f:
        process(line)
```

---

## Exercise 3

### File Processing Pipeline: build a script that processes all GEDCOM files in a directory, generating individual reports for each

**3a. Create additional test files for batch processing**

```bash
mkdir -p input_ged
cp sabotiers.ged input_ged/

cat > input_ged/small.ged << 'EOF'
0 HEAD
0 @I1@ INDI
1 NAME Alice/WONDER/
1 SEX F
1 BIRT
2 DATE 1900
0 TRLR
EOF
```

---

**3b. Create the batch processor**

**Answer:**

```python
from pathlib import Path
from gedcom_parser import GEDCOMParser
from report_generator import generate_report


def process_pipeline(input_dir, output_dir):
    """Process all GEDCOM files in a directory."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    ged_files = list(input_path.glob("*.ged"))

    if not ged_files:
        print(f"No .ged files found in {input_dir}")
        return

    print(f"Found {len(ged_files)} GEDCOM file(s) in {input_dir}")

    for ged_file in ged_files:
        print(f"\nProcessing: {ged_file.name}")

        parser = GEDCOMParser()
        if parser.parse_file(str(ged_file)):
            # Generate text report
            report_file = output_path / f"{ged_file.stem}_report.txt"
            generate_report(parser, str(report_file))

            print(f"  Individuals: {len(parser.individuals)}")
            print(f"  Families: {len(parser.families)}")
            print(f"  Report: {report_file}")
        else:
            print(f"  Error processing {ged_file.name}")

    print(f"\nAll reports written to {output_dir}/")
```

**Key pathlib operations:**

| Operation | Code | Result |
|-----------|------|--------|
| Create Path | `Path("folder/file.txt")` | Path object |
| Get filename | `path.name` | `"file.txt"` |
| Get stem | `path.stem` | `"file"` |
| Get extension | `path.suffix` | `".txt"` |
| Get parent | `path.parent` | `Path("folder")` |
| Check exists | `path.exists()` | `True` or `False` |
| Glob files | `path.glob("*.ged")` | Iterator of matches |
| Create dir | `path.mkdir(exist_ok=True)` | Creates directory |

---

**3c. Run batch processing**

**Answer:**

```python
from batch_processor import process_pipeline

process_pipeline("input_ged", "output_reports")
```

**Expected output:**
```
Found 2 GEDCOM file(s) in input_ged

Processing: sabotiers.ged
Report written to output_reports/sabotiers_report.txt
  Individuals: 5
  Families: 2
  Report: output_reports/sabotiers_report.txt

Processing: small.ged
Report written to output_reports/small_report.txt
  Individuals: 1
  Families: 0
  Report: output_reports/small_report.txt

All reports written to output_reports/
```

```bash
ls output_reports/
```

**Expected output:**
```
sabotiers_report.txt  small_report.txt
```

---

## Exercise 4

### Data Validation: validate GEDCOM files by checking format correctness, verifying referenced IDs exist, and reporting inconsistencies (Q4.py)

**4a. Create a GEDCOM validator**

**Answer:**

```python
from gedcom_parser import GEDCOMParser


def validate_gedcom(parser):
    """
    Validate parsed GEDCOM data.
    Returns a list of (severity, message) tuples.
    """
    issues = []

    # Check individuals have names
    for pid, person in parser.individuals.items():
        if not person["name"]:
            issues.append(("ERROR", f"Individual {pid} has no name"))
        if not person["sex"]:
            issues.append(("WARN", f"Individual {pid} ({person['name']}) has no sex"))
        if not person["birth_date"]:
            issues.append(("WARN", f"{person['name']} has no birth date"))

    # Check family references
    for fid, family in parser.families.items():
        if family["husband"] and family["husband"] not in parser.individuals:
            issues.append((
                "ERROR",
                f"Family {fid}: husband {family['husband']} not found",
            ))
        if family["wife"] and family["wife"] not in parser.individuals:
            issues.append((
                "ERROR",
                f"Family {fid}: wife {family['wife']} not found",
            ))
        for child_id in family["children"]:
            if child_id not in parser.individuals:
                issues.append((
                    "ERROR",
                    f"Family {fid}: child {child_id} not found",
                ))

    # Check FAMC/FAMS consistency
    for pid, person in parser.individuals.items():
        for fam_id in person["families_spouse"]:
            if fam_id not in parser.families:
                issues.append((
                    "ERROR",
                    f"{person['name']}: spouse family {fam_id} not found",
                ))
        if person["family_child"]:
            if person["family_child"] not in parser.families:
                issues.append((
                    "ERROR",
                    f"{person['name']}: child family "
                    f"{person['family_child']} not found",
                ))

    return issues
```

---

**4b. Test the validator on a valid file**

**Answer:**

```python
from gedcom_parser import GEDCOMParser
from validator import validate_gedcom

parser = GEDCOMParser()
parser.parse_file("sabotiers.ged")

issues = validate_gedcom(parser)
if issues:
    print(f"Found {len(issues)} issue(s):")
    for severity, message in issues:
        print(f"  [{severity}] {message}")
else:
    print("No issues found -- file is valid")
```

**Expected output:**
```
Found 1 issue(s):
  [WARN] Louis DUPONT has no birth place
```

(Louis DUPONT has a birth date but no `2 PLAC` line in the test file. The validator currently only checks for birth_date, not birth_place; adding that check would yield this warning.)

---

**4c. Test with a broken GEDCOM file**

```bash
cat > broken.ged << 'EOF'
0 HEAD
0 @I1@ INDI
1 NAME Alice/WONDER/
1 SEX F
1 FAMS @F99@
0 @F1@ FAM
1 HUSB @I99@
1 WIFE @I1@
1 CHIL @I88@
0 TRLR
EOF
```

**Answer:**

```python
parser = GEDCOMParser()
parser.parse_file("broken.ged")
issues = validate_gedcom(parser)
print(f"Found {len(issues)} issue(s):")
for severity, message in issues:
    print(f"  [{severity}] {message}")
```

**Expected output:**
```
Found 4 issue(s):
  [WARN] Alice WONDER has no birth date
  [ERROR] Alice WONDER: spouse family F99 not found
  [ERROR] Family F1: husband I99 not found
  [ERROR] Family F1: child I88 not found
```

---

## Exercise 5

### Command-Line Tool: build a complete CLI tool with subcommands -- parse, report, search, and batch -- using argparse (Q6.py)

**5a. Understand argparse subcommands**

```python
import argparse

# Create main parser
parser = argparse.ArgumentParser(description="Tool description")

# Add subcommand parsers
subparsers = parser.add_subparsers(dest="command", help="Command")

# Each subcommand has its own parser with its own arguments
p_cmd1 = subparsers.add_parser("cmd1", help="First command")
p_cmd1.add_argument("file", help="Input file")

p_cmd2 = subparsers.add_parser("cmd2", help="Second command")
p_cmd2.add_argument("input_dir", help="Input directory")
p_cmd2.add_argument("output_dir", help="Output directory")

args = parser.parse_args()
# args.command contains "cmd1" or "cmd2"
# args.file or args.input_dir/args.output_dir depending on command
```

---

**5b. Create the CLI tool**

**Answer:**

```python
#!/usr/bin/env python3
"""
GEDCOM Processing Tool

Usage:
  python ged_tool.py parse <file.ged>
  python ged_tool.py report <file.ged> <output.txt>
  python ged_tool.py search <file.ged> <name>
  python ged_tool.py batch <input_dir> <output_dir>
"""

import argparse
from gedcom_parser import GEDCOMParser
from report_generator import generate_report
from batch_processor import process_pipeline


def cmd_parse(args):
    """Parse and summarize a GEDCOM file."""
    parser = GEDCOMParser()
    if parser.parse_file(args.file):
        parser.summary()
    else:
        print("Failed to parse file")


def cmd_report(args):
    """Generate a text report."""
    parser = GEDCOMParser()
    if parser.parse_file(args.file):
        generate_report(parser, args.output)
    else:
        print("Failed to parse file")


def cmd_search(args):
    """Search for a person by name."""
    parser = GEDCOMParser()
    if parser.parse_file(args.file):
        pattern = args.name.lower()
        found = False
        for pid, person in parser.individuals.items():
            if pattern in person["name"].lower():
                found = True
                born = (
                    f" (born {person['birth_date']})"
                    if person["birth_date"]
                    else ""
                )
                died = (
                    f" (died {person['death_date']})"
                    if person["death_date"]
                    else ""
                )
                print(f"  {person['name']}{born}{died}")
        if not found:
            print(f"No matches for '{args.name}'")


def cmd_batch(args):
    """Process all GEDCOM files in a directory."""
    process_pipeline(args.input_dir, args.output_dir)


def main():
    parser = argparse.ArgumentParser(
        description="GEDCOM Processing Tool"
    )
    subparsers = parser.add_subparsers(dest="command", help="Command")

    # Parse command
    p_parse = subparsers.add_parser("parse", help="Parse and summarize")
    p_parse.add_argument("file", help="GEDCOM file to parse")

    # Report command
    p_report = subparsers.add_parser("report", help="Generate report")
    p_report.add_argument("file", help="GEDCOM file")
    p_report.add_argument("output", help="Output report file")

    # Search command
    p_search = subparsers.add_parser("search", help="Search for person")
    p_search.add_argument("file", help="GEDCOM file")
    p_search.add_argument("name", help="Name to search for")

    # Batch command
    p_batch = subparsers.add_parser("batch", help="Process directory")
    p_batch.add_argument("input_dir", help="Input directory")
    p_batch.add_argument("output_dir", help="Output directory")

    args = parser.parse_args()

    commands = {
        "parse": cmd_parse,
        "report": cmd_report,
        "search": cmd_search,
        "batch": cmd_batch,
    }

    if args.command in commands:
        commands[args.command](args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
```

```bash
chmod +x ged_tool.py
```

---

**5c. Test each subcommand**

**Parse:**

```bash
python3 ged_tool.py parse sabotiers.ged
```

**Expected output:**
```
Individuals: 5
Families: 2
  Jean DUPONT (M), born 1 JAN 1800
  Jeanne LEBLANC (F), born 20 APR 1835
  Louis DUPONT (M), born 3 SEP 1860
  Marie MARTIN (F), born 5 JUN 1805
  Pierre DUPONT (M), born 12 FEB 1830
```

**Search:**

```bash
python3 ged_tool.py search sabotiers.ged "dupont"
```

**Expected output:**
```
  Jean DUPONT (born 1 JAN 1800) (died 15 MAR 1870)
  Louis DUPONT (born 3 SEP 1860)
  Pierre DUPONT (born 12 FEB 1830)
```

```bash
python3 ged_tool.py search sabotiers.ged "xyz"
```

**Expected output:**
```
No matches for 'xyz'
```

**Report:**

```bash
python3 ged_tool.py report sabotiers.ged cli_report.txt
```

**Expected output:**
```
Report written to cli_report.txt
```

```bash
head -5 cli_report.txt
```

**Expected output:**
```
============================================================
GENEALOGY REPORT
============================================================

INDIVIDUALS (5)
```

**Batch:**

```bash
python3 ged_tool.py batch input_ged batch_output
ls batch_output/
```

**Expected output:**
```
Found 2 GEDCOM file(s) in input_ged
...
sabotiers_report.txt  small_report.txt
```

**No arguments (help):**

```bash
python3 ged_tool.py
```

**Expected output:**
```
usage: ged_tool.py [-h] {parse,report,search,batch} ...

GEDCOM Processing Tool

positional arguments:
  {parse,report,search,batch}
                        Command
    parse               Parse and summarize
    report              Generate report
    search              Search for person
    batch               Process directory

optional arguments:
  -h, --help            show this help message and exit
```

---

**Automation best practices:**
1. **Use `pathlib.Path`** instead of string concatenation for file paths -- it handles OS differences
2. **Always use context managers (`with`)** -- files close properly even on exceptions
3. **Validate input early** -- check file existence and permissions before processing
4. **Handle encoding** -- use `encoding="utf-8"` explicitly; fall back to `latin-1` if needed
5. **Use `argparse`** -- it generates help text, validates arguments, and handles errors automatically
6. **Modularize** -- separate parsing, processing, and output into different modules
7. **Test with small data first** -- debug on small files before processing large datasets
