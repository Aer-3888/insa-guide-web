---
title: "LDS5 - Process Automation & Scripting"
sidebar_position: 12
---

# LDS5 - Process Automation & Scripting

## Learning Objectives

Automate tasks with Python scripts:

- Execute system commands from Python
- Process files and directories
- Parse structured data (GEDCOM genealogy files)
- Generate reports and output files
- Build command-line tools
- Integrate multiple technologies (file I/O, databases, web)

## Core Concepts

### 1. Running System Commands

```python
import subprocess

# Run command and capture output
result = subprocess.run(['ls', '-l'], capture_output=True, text=True)
print(result.stdout)
print(result.returncode)  # 0 = success

# Run shell command
result = subprocess.run('echo "Hello"', shell=True, capture_output=True, text=True)

# Check for errors
try:
    subprocess.run(['command'], check=True)
except subprocess.CalledProcessError as e:
    print(f"Command failed: {e}")
```

### 2. File and Directory Operations

```python
import os
import shutil
from pathlib import Path

# Check existence
if os.path.exists('file.txt'):
    print("File exists")

# Directory operations
os.mkdir('newdir')
os.makedirs('path/to/dir', exist_ok=True)
os.listdir('.')  # List files
os.walk('.')     # Recursive traversal

# File operations
shutil.copy('src.txt', 'dst.txt')
shutil.move('old.txt', 'new.txt')
os.remove('file.txt')

# Path manipulation (pathlib - recommended)
path = Path('folder/file.txt')
print(path.name)        # 'file.txt'
print(path.stem)        # 'file'
print(path.suffix)      # '.txt'
print(path.parent)      # 'folder'
print(path.exists())    # True/False

# Read directory
for file in Path('.').glob('*.txt'):
    print(file)
```

### 3. Reading and Writing Files

```python
# Reading
with open('file.txt', 'r') as f:
    content = f.read()              # Entire file
    lines = f.readlines()           # List of lines
    for line in f:                  # Line by line
        process(line)

# Writing
with open('output.txt', 'w') as f:
    f.write('Hello\n')
    f.writelines(['Line 1\n', 'Line 2\n'])

# Appending
with open('log.txt', 'a') as f:
    f.write('New entry\n')

# Binary files
with open('image.jpg', 'rb') as f:
    data = f.read()
```

### 4. Parsing Structured Data

**CSV Files**:
```python
import csv

# Reading CSV
with open('data.csv', 'r') as f:
    reader = csv.reader(f)
    headers = next(reader)  # First row
    for row in reader:
        print(row)

# Writing CSV
with open('output.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Age'])
    writer.writerow(['Alice', 25])
```

**JSON Files**:
```python
import json

# Reading JSON
with open('data.json', 'r') as f:
    data = json.load(f)

# Writing JSON
with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### 5. Command-Line Arguments

```python
import sys
import argparse

# Simple: sys.argv
if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <filename>")
    sys.exit(1)

filename = sys.argv[1]

# Advanced: argparse
parser = argparse.ArgumentParser(description='Process some files')
parser.add_argument('input', help='Input file')
parser.add_argument('output', help='Output file')
parser.add_argument('-v', '--verbose', action='store_true',
                    help='Verbose output')
parser.add_argument('-n', '--number', type=int, default=10,
                    help='Number of items')

args = parser.parse_args()
print(f"Input: {args.input}")
print(f"Verbose: {args.verbose}")
```

### 6. Regular Expressions

```python
import re

# Match pattern
if re.match(r'^\d{3}$', '123'):
    print("Three digits")

# Search for pattern
match = re.search(r'\d+', 'Order 12345')
if match:
    print(match.group())  # '12345'

# Find all matches
numbers = re.findall(r'\d+', 'Numbers: 1, 2, 3')

# Replace
result = re.sub(r'\d+', 'X', 'Replace 123 and 456')

# Split
parts = re.split(r'\s+', 'Split  on   whitespace')
```

## Exercises Overview

### Exercise 1: GEDCOM File Processing
Parse genealogy data in GEDCOM format (see FUS4 for format details).

**Tasks**:
- Read GEDCOM file
- Extract person records
- Build family tree structure
- Generate reports

**Files**: `sabotiers.ged`

### Exercise 2: Automated Report Generation
Generate HTML or text reports from GEDCOM data.

**Features**:
- List of all individuals
- Family groups
- Statistics (births, deaths, marriages by year)
- Formatted output

### Exercise 3: File Processing Pipeline
Build script that processes multiple files:
- Read input files
- Transform data
- Generate output files
- Handle errors gracefully

### Exercise 4: Data Validation
Validate GEDCOM files:
- Check format correctness
- Verify referenced IDs exist
- Validate dates
- Report inconsistencies

### Exercise 5: Integration Project
Combine previous concepts:
- File processing
- Database storage
- Web scraping (if needed)
- GUI or CLI interface

## Solutions

See `src/` directory and original files:
- `Q1.py` - Question 1 solution
- `Q2.py` - Question 2 solution
- `Q4.py` - Question 4 solution
- `Q6.py` - Question 6 solution

## Key Takeaways

1. **Automate repetitive tasks** - Scripts save time on repeated operations
2. **Error handling is critical** - Files may not exist, permissions may fail
3. **Test with small data first** - Debug on small files before processing large datasets
4. **Modularize code** - Separate parsing, processing, output
5. **Document scripts** - Add usage instructions and examples

## Common Patterns

### File Processing Template
```python
import sys
from pathlib import Path

def process_file(input_path, output_path):
    """Process input file and write to output file"""
    try:
        with open(input_path, 'r') as f_in:
            with open(output_path, 'w') as f_out:
                for line in f_in:
                    # Process line
                    result = transform(line)
                    f_out.write(result)
    except FileNotFoundError:
        print(f"Error: File {input_path} not found")
        return False
    except Exception as e:
        print(f"Error processing file: {e}")
        return False
    return True

def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <input> <output>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if process_file(input_file, output_file):
        print("Processing completed successfully")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
```

### Batch Processing
```python
from pathlib import Path

def process_directory(input_dir, output_dir):
    """Process all files in directory"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    for file in input_path.glob('*.txt'):
        output_file = output_path / file.name
        process_file(file, output_file)
        print(f"Processed: {file.name}")
```

### Progress Reporting
```python
def process_with_progress(items):
    total = len(items)
    for i, item in enumerate(items, 1):
        process(item)
        percent = (i / total) * 100
        print(f"Progress: {i}/{total} ({percent:.1f}%)")
```

## Common Pitfalls

1. **Not using context managers (with)** - Files may not close properly
2. **Hardcoding paths** - Use Path objects, accept arguments
3. **Not validating input** - Check file existence, permissions
4. **Ignoring errors** - Wrap risky operations in try-except
5. **Not testing edge cases** - Empty files, malformed data
6. **Platform-specific code** - Use Path instead of string concatenation

## Further Reading

- Pathlib documentation: https://docs.python.org/3/library/pathlib.html
- Subprocess module: https://docs.python.org/3/library/subprocess.html
- Argparse tutorial: https://docs.python.org/3/howto/argparse.html
- "Automate the Boring Stuff with Python" book
- Python's standard library: csv, json, configparser, logging

## Script Organization

```python
#!/usr/bin/env python3
"""
Script description and usage
"""

import sys
import argparse
from pathlib import Path

def parse_args():
    """Parse command-line arguments"""
    parser = argparse.ArgumentParser(description='...')
    # Add arguments
    return parser.parse_args()

def main():
    """Main entry point"""
    args = parse_args()
    # Main logic
    
if __name__ == '__main__':
    main()
```

## Best Practices

1. **Shebang line** - `#!/usr/bin/env python3` for executable scripts
2. **Docstrings** - Document functions and modules
3. **Type hints** - Help catch errors early
4. **Logging** - Use logging module instead of print
5. **Configuration files** - Separate config from code
6. **Exit codes** - Use sys.exit(0) for success, non-zero for errors

## GEDCOM Processing Tips

- Use state machine for parsing nested structures
- Track level changes to close tags
- Build dictionary mapping IDs to records
- Validate references after parsing
- Handle missing fields gracefully
