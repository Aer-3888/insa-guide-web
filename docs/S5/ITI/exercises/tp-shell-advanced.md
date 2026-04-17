---
title: "TP2 - FUS2: Advanced Shell Scripting"
sidebar_position: 9
---

# TP2 - FUS2: Advanced Shell Scripting

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp2_shell_advanced/README.md

## Exercise 1 (exo01)

### Create scripts that use variables and demonstrate variable expansion

**1a. Basic variable script**

**Answer:**

```bash
cat > simple_variable.sh << 'EOF'
#!/bin/bash

# Simple script demonstrating variable usage
# Based on exo01 from original TP

message="Bonjour le monde !"
echo $message
EOF
chmod +x simple_variable.sh
./simple_variable.sh
```

**Expected output:**
```
Bonjour le monde !
```

---

**1b. Variable expansion, quoting, command substitution, and default values**

**Answer:**

```bash
cat > variables_demo.sh << 'EOF'
#!/bin/bash

# Variables and quoting
name="Alice"
greeting="Hello, $name"     # Double quotes: variable expanded
literal='Hello, $name'      # Single quotes: no expansion

echo "$greeting"
echo "$literal"

# Command substitution
current_dir=$(pwd)
echo "Current directory: $current_dir"

date_str=$(date +%Y-%m-%d)
echo "Today: $date_str"

# Variable with default value
user=${USER:-"unknown"}
echo "User: $user"

# String length
message="Hello World"
echo "Length of message: ${#message}"
EOF
chmod +x variables_demo.sh
./variables_demo.sh
```

**Expected output:**
```
Hello, Alice
Hello, $name
Current directory: /home/youruser/TP2_shell_advanced
Today: 2026-04-17
User: youruser
Length of message: 11
```

**Key constructs:**

| Syntax | Meaning | Example |
|--------|---------|---------|
| `var="value"` | Assignment (no spaces around `=`) | `name="Alice"` |
| `"$var"` | Expansion inside double quotes | `"Hello, $name"` -> `"Hello, Alice"` |
| `'$var'` | Literal (no expansion) | `'Hello, $name'` -> `Hello, $name` |
| `$(cmd)` | Command substitution | `$(pwd)` -> `/home/user` |
| `${var:-default}` | Use default if var is unset/empty | `${USER:-"nobody"}` |
| `${#var}` | Length of string | `${#name}` -> `5` |

---

**1c. Command-line argument handling**

**Answer:**

```bash
cat > show_args.sh << 'EOF'
#!/bin/bash
# Demonstrate command-line arguments
# $0 = script name
# $1, $2, ... = positional arguments
# $# = number of arguments
# $@ = all arguments (separate words)
# $* = all arguments (single string)

echo "Script name: $0"
echo "Number of arguments: $#"
echo "First argument: $1"
echo "Second argument: $2"
echo "All arguments (\$@): $@"
echo "All arguments (\$*): $*"
EOF
chmod +x show_args.sh
./show_args.sh apple banana cherry
```

**Expected output:**
```
Script name: ./show_args.sh
Number of arguments: 3
First argument: apple
Second argument: banana
All arguments ($@): apple banana cherry
All arguments ($*): apple banana cherry
```

With no arguments:

```bash
./show_args.sh
```

**Expected output:**
```
Script name: ./show_args.sh
Number of arguments: 0
First argument: 
Second argument: 
All arguments ($@): 
All arguments ($*): 
```

---

## Exercise 2 (exo02)

### Write a script that processes multiple files, counting specific patterns. Loop through files, use conditionals to test file types, accumulate counts.

**2a. Argument validation**

**Answer:**

```bash
cat > file_processor.sh << 'SCRIPT'
#!/bin/bash

# Advanced file processing script
# Demonstrates: argument validation, loops, conditionals, file testing

# --- Argument validation ---
if [ $# -lt 1 ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

target_dir="$1"

# Check directory exists
if [ ! -d "$target_dir" ]; then
    echo "Error: $target_dir is not a directory"
    exit 1
fi

# --- Initialize counters ---
nbfic=0
nbdir=0
nbexec=0

# --- Process all items ---
for e in "$target_dir"/*; do
    if [ -f "$e" ]; then
        nbfic=$((nbfic + 1))
        # Also check if executable
        if [ -x "$e" ]; then
            nbexec=$((nbexec + 1))
        fi
    elif [ -d "$e" ]; then
        nbdir=$((nbdir + 1))
    fi
done

# --- Print results ---
echo "Results for $target_dir:"
printf "  Files:       %d\n" $nbfic
printf "  Executables: %d\n" $nbexec
printf "  Directories: %d\n" $nbdir
SCRIPT
chmod +x file_processor.sh
```

---

**2b. Test with valid input**

**Answer:**

```bash
# Create test data
mkdir -p test_data/subdir1 test_data/subdir2
touch test_data/file1.txt test_data/file2.txt test_data/notes.md
chmod +x test_data/file1.txt

./file_processor.sh test_data
```

**Expected output:**
```
Results for test_data:
  Files:       3
  Executables: 1
  Directories: 2
```

**Execution trace:**
```
Iteration 1: e="test_data/file1.txt"   -f? yes  -x? yes  -> nbfic=1, nbexec=1
Iteration 2: e="test_data/file2.txt"   -f? yes  -x? no   -> nbfic=2
Iteration 3: e="test_data/notes.md"    -f? yes  -x? no   -> nbfic=3
Iteration 4: e="test_data/subdir1"     -d? yes            -> nbdir=1
Iteration 5: e="test_data/subdir2"     -d? yes            -> nbdir=2
```

---

**2c. Test with invalid inputs**

**Answer:**

No arguments:
```bash
./file_processor.sh
```
**Expected output:**
```
Usage: ./file_processor.sh <directory>
```

Nonexistent directory:
```bash
./file_processor.sh /nonexistent
```
**Expected output:**
```
Error: /nonexistent is not a directory
```

A file instead of a directory:
```bash
./file_processor.sh test_data/file1.txt
```
**Expected output:**
```
Error: test_data/file1.txt is not a directory
```

---

**2d. Exit codes**

**Answer:**

```bash
./file_processor.sh test_data
echo "Exit code: $?"
# Output: Exit code: 0

./file_processor.sh
echo "Exit code: $?"
# Output: Exit code: 1
```

---

## Common Patterns

### Argument validation template

```bash
#!/bin/bash
if [ $# -lt 2 ]; then
    echo "Usage: $0 <input_file> <output_file>"
    exit 1
fi
input_file="$1"
output_file="$2"
if [ ! -f "$input_file" ]; then
    echo "Error: File $input_file not found"
    exit 1
fi
```

### Loop patterns

```bash
# Loop over files by extension
for file in *.txt; do
    echo "Processing: $file"
    wc -l "$file"
done

# While loop reading a file line by line
while IFS= read -r line; do
    echo "Line: $line"
done < "$input_file"
```

### Functions

```bash
count_lines() {
    local file="$1"
    if [ ! -f "$file" ]; then
        echo "0"
        return 1
    fi
    wc -l < "$file"
    return 0
}
result=$(count_lines "myfile.txt")
echo "Lines: $result"
```

### Advanced text processing one-liners

```bash
# Count lines containing a pattern
grep -c "error" logfile.txt

# Extract first column from colon-separated file
awk -F: '{print $1}' /etc/passwd | head -5

# Replace text in a file
sed 's/old_text/new_text/g' input.txt

# Sort and count unique entries
sort file.txt | uniq -c | sort -rn
```

### Debugging with set -x

```bash
#!/bin/bash
set -x    # Print each command before executing it
message="hello"
echo $message
```

**Output with `set -x`:**
```
+ message=hello
+ echo hello
hello
```
