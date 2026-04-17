---
title: "Shell & Bash Scripting"
sidebar_position: 8
---

# Shell & Bash Scripting

## Overview

The shell is the command-line interface to the operating system. Bash (Bourne Again Shell) is the default shell on most Linux distributions. Mastering the shell is essential for the FUS exam and for daily engineering work.

## Shell Types

| Shell | Description | Shebang |
|-------|-------------|---------|
| `bash` | Bourne Again Shell, most common | `#!/bin/bash` |
| `tcsh` | TENEX C Shell, C-like syntax | `#!/bin/tcsh` |
| `sh` | Original Bourne Shell, POSIX compliant | `#!/bin/sh` |
| `zsh` | Z Shell, extended bash features | `#!/bin/zsh` |

The **shebang** (`#!`) on the first line of a script tells the system which interpreter to use.

## File System Navigation

```bash
pwd                        # Print working directory
ls                         # List directory contents
ls -l                      # Long format: permissions, size, date
ls -la                     # Long format including hidden files
ls -lh                     # Human-readable file sizes
cd /path/to/dir            # Change directory (absolute)
cd ../                     # Go up one level
cd ~                       # Go to home directory
cd -                       # Go to previous directory
mkdir dirname              # Create directory
mkdir -p path/to/nested    # Create nested directories
rmdir dirname              # Remove empty directory
rm -r dirname              # Remove directory and contents (careful!)
```

## File Operations

```bash
cp source dest             # Copy file
cp -r source/ dest/        # Copy directory recursively
mv source dest             # Move/rename file
rm file                    # Remove file
rm -f file                 # Force remove (no confirmation)
touch newfile              # Create empty file or update timestamp
cat file                   # Display file contents
less file                  # Page through file (q to quit)
head -n 5 file             # Show first 5 lines
tail -n 5 file             # Show last 5 lines
wc file                    # Word count: lines, words, bytes
wc -l file                 # Count lines only
wc -w file                 # Count words only
```

## File Permissions

```bash
chmod +x script.sh         # Make executable
chmod 755 file             # rwxr-xr-x
chmod 644 file             # rw-r--r--
chown user:group file      # Change ownership
```

Permission format: `rwxrwxrwx` (owner/group/others)
- `r` = read (4), `w` = write (2), `x` = execute (1)

## Text Processing Commands

### `echo` -- Print text
```bash
echo "Hello World"         # Print string
echo $VAR                  # Print variable value
echo -n "No newline"       # Suppress trailing newline
echo -e "Tab\there"        # Enable escape sequences
```

### `cat` -- Concatenate and display
```bash
cat file.txt               # Display file
cat file1 file2            # Concatenate files
cat > newfile.txt          # Create file from stdin (Ctrl+D to end)
cat >> file.txt            # Append stdin to file
```

### `grep` -- Search for patterns
```bash
grep "pattern" file        # Lines containing pattern
grep -i "pattern" file     # Case-insensitive
grep -v "pattern" file     # Lines NOT containing pattern
grep -c "pattern" file     # Count matching lines
grep -n "pattern" file     # Show line numbers
grep -r "pattern" dir/     # Recursive search in directory
grep -E "regex" file       # Extended regex (egrep)
grep "^start" file         # Lines starting with "start"
grep "end$" file           # Lines ending with "end"
grep "[0-9]" file          # Lines containing digits
```

### `sed` -- Stream editor
```bash
sed 's/old/new/' file      # Replace first occurrence per line
sed 's/old/new/g' file     # Replace ALL occurrences
sed -i 's/old/new/g' file  # Edit file in-place
sed -n '5,10p' file        # Print lines 5 to 10
sed '/pattern/d' file      # Delete lines matching pattern
sed 's/^/prefix/' file     # Add prefix to each line
```

### `awk` -- Pattern scanning and processing
```bash
awk '{print $1}' file      # Print first column (space-delimited)
awk -F: '{print $1}' file  # Print first column (colon-delimited)
awk '{print NR, $0}' file  # Print with line numbers
awk '/pattern/' file       # Print matching lines
awk '{sum+=$1} END {print sum}' file  # Sum first column
```

### `sort` and `uniq`
```bash
sort file                  # Sort lines alphabetically
sort -n file               # Sort numerically
sort -r file               # Reverse sort
sort -k2 file              # Sort by 2nd column
uniq file                  # Remove adjacent duplicates
sort file | uniq           # Remove all duplicates
sort file | uniq -c        # Count occurrences
```

### `cut` -- Extract columns
```bash
cut -d: -f1 /etc/passwd    # Extract first field, colon delimiter
cut -c1-10 file            # Extract characters 1-10
```

### `tr` -- Translate characters
```bash
echo "hello" | tr 'a-z' 'A-Z'    # Uppercase
echo "hello" | tr -d 'l'          # Delete 'l' characters
echo "hello" | tr -s ' '          # Squeeze repeated spaces
```

## Pipes and Redirection

```bash
# Pipes: connect stdout of one command to stdin of another
command1 | command2        # Pipe
ls -l | grep ".txt"        # List, then filter for .txt files
cat file | sort | uniq     # Chain multiple commands

# Redirection
command > file             # Redirect stdout to file (overwrite)
command >> file            # Redirect stdout to file (append)
command 2> file            # Redirect stderr to file
command 2>&1               # Redirect stderr to stdout
command > file 2>&1        # Redirect both stdout and stderr
command < file             # Redirect file to stdin
command << EOF             # Here document (inline input)
line1
line2
EOF
```

### Practical pipe examples (exam favorites)

```bash
# Count files in current directory
ls -l | grep "^-" | wc -l

# Count directories
ls -l | grep "^d" | wc -l

# Find 10 most common words
cat file | tr ' ' '\n' | sort | uniq -c | sort -rn | head -10

# Extract unique IP addresses from log
cat access.log | awk '{print $1}' | sort | uniq

# Find largest files
ls -lS | head -5
```

## Variables

```bash
# Assignment (NO spaces around =)
name="Alice"
age=25
readonly CONST="immutable"

# Access
echo $name
echo ${name}               # Safer form
echo "${name} is ${age}"   # Within string

# Special variables
$0                         # Script name
$1, $2, ...                # Positional arguments
$#                         # Number of arguments
$@                         # All arguments as separate words
$*                         # All arguments as single string
$?                         # Exit status of last command
$$                         # Current process ID

# Default values
name=${name:-"default"}    # Use "default" if name is unset/empty
name=${name:="default"}    # Set and use "default" if unset/empty
```

## Conditional Statements

```bash
# Basic if-then-else
if [ condition ]; then
    # commands
elif [ another_condition ]; then
    # commands
else
    # commands
fi

# Numeric comparisons
[ $a -eq $b ]              # Equal
[ $a -ne $b ]              # Not equal
[ $a -lt $b ]              # Less than
[ $a -le $b ]              # Less than or equal
[ $a -gt $b ]              # Greater than
[ $a -ge $b ]              # Greater than or equal

# String comparisons
[ "$s1" = "$s2" ]          # Equal
[ "$s1" != "$s2" ]         # Not equal
[ -z "$str" ]              # String is empty
[ -n "$str" ]              # String is not empty

# File tests
[ -f file ]                # Is a regular file
[ -d dir ]                 # Is a directory
[ -e path ]                # Exists (any type)
[ -r file ]                # Is readable
[ -w file ]                # Is writable
[ -x file ]                # Is executable
[ -s file ]                # File is non-empty

# Logical operators
[ cond1 ] && [ cond2 ]     # AND
[ cond1 ] || [ cond2 ]     # OR
[ ! condition ]             # NOT
```

## Loops

```bash
# For loop over list
for item in one two three; do
    echo "$item"
done

# For loop with range
for i in {1..10}; do
    echo "$i"
done

# For loop over files
for file in *.txt; do
    echo "Processing $file"
done

# For loop C-style
for ((i=0; i<10; i++)); do
    echo "$i"
done

# While loop
counter=0
while [ $counter -lt 10 ]; do
    echo $counter
    counter=$((counter + 1))
done

# Read file line by line
while IFS= read -r line; do
    echo "$line"
done < file.txt
```

## Functions

```bash
# Define function
greet() {
    local name=$1          # Local variable
    echo "Hello, $name!"
    return 0               # Return status (0 = success)
}

# Call function
greet "Alice"

# Capture function output
result=$(greet "Bob")
```

## Arithmetic

```bash
# Arithmetic expansion
result=$((3 + 5))
result=$((a * b))
result=$((10 / 3))        # Integer division
result=$((10 % 3))        # Modulo

# Increment
count=$((count + 1))
((count++))                # Bash shorthand

# expr (older method)
result=$(expr 3 + 5)
```

## Script Structure Template

```bash
#!/bin/bash
# Description: What this script does
# Usage: ./script.sh <arg1> <arg2>

# Validate arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <arg1> <arg2>"
    exit 1
fi

# Assign arguments to named variables
input_file="$1"
output_file="$2"

# Validate input
if [ ! -f "$input_file" ]; then
    echo "Error: File $input_file not found"
    exit 1
fi

# Main logic
process_data() {
    local file="$1"
    while IFS= read -r line; do
        echo "$line"
    done < "$file"
}

# Execute
process_data "$input_file" > "$output_file"
echo "Done. Output written to $output_file"
exit 0
```

## Debugging Shell Scripts

```bash
set -x                     # Print each command before executing
set -e                     # Exit immediately on error
set -u                     # Treat unset variables as error
set -o pipefail            # Pipe fails if any command fails

# Combine at script top:
set -euo pipefail

# Trace a specific section
set -x
# ... commands to trace ...
set +x
```

---

## CHEAT SHEET

### Navigation
| Command | Action |
|---------|--------|
| `pwd` | Print working directory |
| `cd dir` | Change directory |
| `ls -la` | List all files with details |
| `tree` | Show directory tree |

### File Manipulation
| Command | Action |
|---------|--------|
| `cp src dst` | Copy |
| `mv src dst` | Move/rename |
| `rm file` | Delete |
| `touch file` | Create/update timestamp |
| `chmod +x file` | Make executable |

### Text Processing
| Command | Action |
|---------|--------|
| `cat file` | Show contents |
| `grep pattern file` | Search for pattern |
| `sed 's/a/b/g' file` | Replace all a with b |
| `awk '{print $1}' file` | Print first column |
| `sort file` | Sort lines |
| `uniq` | Remove duplicates |
| `wc -l file` | Count lines |
| `cut -d: -f1 file` | Extract field |
| `tr 'a-z' 'A-Z'` | Translate chars |
| `head -n 5 file` | First 5 lines |
| `tail -n 5 file` | Last 5 lines |

### Redirection & Pipes
| Syntax | Action |
|--------|--------|
| `cmd > file` | Stdout to file (overwrite) |
| `cmd >> file` | Stdout to file (append) |
| `cmd 2> file` | Stderr to file |
| `cmd < file` | File to stdin |
| `cmd1 \| cmd2` | Pipe stdout to next command |

### Variables & Arithmetic
| Syntax | Action |
|--------|--------|
| `VAR="value"` | Assign (no spaces!) |
| `$VAR` or `${VAR}` | Read variable |
| `$((expr))` | Arithmetic |
| `$?` | Last exit code |
| `$#` | Argument count |
| `$1` | First argument |

### Tests
| Test | Meaning |
|------|---------|
| `-f file` | Is regular file |
| `-d dir` | Is directory |
| `-e path` | Exists |
| `-z "$str"` | String empty |
| `$a -eq $b` | Numeric equal |
| `"$s1" = "$s2"` | String equal |

### Control Flow
```
if [ cond ]; then ... elif ... else ... fi
for x in list; do ... done
while [ cond ]; do ... done
```
