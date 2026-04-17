---
title: "TP1 - FUS1: Shell Basics & Text Processing"
sidebar_position: 10
---

# TP1 - FUS1: Shell Basics & Text Processing

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp1_shell_basics/README.md

## Exercise 1

### Create basic shell scripts that print messages and manipulate variables

**1a. Write a `bonjour.sh` script that prints "Bonjour."**

**Answer:**

```bash
cat > bonjour.sh << 'EOF'
#!/bin/bash

# Simple greeting script demonstrating basic shell scripting
# Concepts: shebang, echo command, newline

echo "Bonjour."
EOF
chmod +x bonjour.sh
./bonjour.sh
```

**Expected output:**
```
Bonjour.
```

**Key concepts:**
- `#!/bin/bash` -- the shebang, must be the very first line; tells the OS to use `/bin/bash` to interpret this script
- `echo "Bonjour."` -- prints the string followed by a newline to stdout

---

**1b. Write a `hello_world.sh` script that stores a message in a variable and prints it**

**Answer:**

```bash
cat > hello_world.sh << 'EOF'
#!/bin/bash

# Classic Hello World in bash
# Demonstrates variable declaration and usage

message="Bonjour le monde !"
echo $message
EOF
chmod +x hello_world.sh
./hello_world.sh
```

**Expected output:**
```
Bonjour le monde !
```

**Key concepts:**
- `message="Bonjour le monde !"` -- variable assignment; critical rule: **no spaces around the `=` sign**
- `echo $message` -- `$message` expands (substitutes) the variable's value

---

**1c. Understand quoting differences**

**Answer:**

```bash
name="Alice"

echo "Hello, $name"
# Output: Hello, Alice       (double quotes: variable expanded)

echo 'Hello, $name'
# Output: Hello, $name       (single quotes: literal, no expansion)

echo "Today is $(date +%A)"
# Output: Today is Thursday   (command substitution with $(...))
```

**Expected output:**
```
Hello, Alice
Hello, $name
Today is Thursday
```

---

## Exercise 2

### Count the number of files and directories in the current location using two approaches: pipes (tcsh-style) and loops with file-test operators (bash-style)

**2a. Understand the building blocks -- examine `ls -l` output**

**Answer:**

```bash
ls -l /usr/bin | head -10
```

**Expected output:**
```
total 123456
-rwxr-xr-x 1 root root  35064 Jan  1 00:00 [
-rwxr-xr-x 1 root root  59736 Jan  1 00:00 arch
drwxr-xr-x 2 root root  40960 Jan  1 00:00 subdir
...
```

The first character indicates file type: `-` = regular file, `d` = directory, `l` = symbolic link.

---

**2b. tcsh version (pipe approach)**

**Answer:**

```bash
cat > count_files_tcsh.sh << 'SCRIPT'
#!/bin/tcsh

# Count files and directories using pipes and text processing (tcsh approach)
# Demonstrates the Unix philosophy: combine simple tools via pipes

echo "Analyse du contenu du répertoire `pwd` :"

# Count regular files: grep "^-" matches lines starting with -
echo -n "   Nombre de fichiers    : "
ls -l | grep "^-" | wc -l

# Count directories: grep "^d" matches lines starting with d
echo -n "   Nombre de répertoires : "
ls -l | grep "^d" | wc -l
SCRIPT
chmod +x count_files_tcsh.sh
```

**Pipeline trace:**
```
Step 1: ls -l
-rw-r--r-- 1 user group  0 Oct  1 12:00 file1.txt
drwxr-xr-x 2 user group 40 Oct  1 12:00 subdir1

Step 2: ls -l | grep "^-"       (keep lines starting with -)
-rw-r--r-- 1 user group  0 Oct  1 12:00 file1.txt

Step 3: ls -l | grep "^-" | wc -l   (count those lines)
1
```

**Expected output (in a directory with 3 files and 2 subdirectories):**
```
Analyse du contenu du répertoire /tmp/test_dir :
   Nombre de fichiers    : 3
   Nombre de répertoires : 2
```

---

**2c. bash version (loop approach)**

**Answer:**

```bash
cat > count_files_bash.sh << 'SCRIPT'
#!/bin/bash

# Count files and directories using loops and file tests (bash approach)

# Initialize counters
nbfic=0
nbdir=0

# Loop through all items in current directory
for e in $(ls); do
    # Test if item is a regular file
    if [ -f $e ]; then
        nbfic=$((nbfic+1))    # Arithmetic expansion: increment counter
    # Test if item is a directory
    elif [ -d $e ] ; then
        nbdir=$((nbdir+1))
    fi
done

# Print results
printf "%d files and %d directories\n" $nbfic $nbdir
SCRIPT
chmod +x count_files_bash.sh
```

**Execution trace:**
```
Iteration 1: e="file1.txt"   [ -f file1.txt ] = true   -> nbfic=1
Iteration 2: e="file2.txt"   [ -f file2.txt ] = true   -> nbfic=2
Iteration 3: e="file3.txt"   [ -f file3.txt ] = true   -> nbfic=3
Iteration 4: e="subdir1"     [ -d subdir1 ]   = true   -> nbdir=1
Iteration 5: e="subdir2"     [ -d subdir2 ]   = true   -> nbdir=2
```

**Expected output:**
```
3 files and 2 directories
```

---

**2d. File test operators reference**

| Operator | Test | Example |
|----------|------|---------|
| `-f FILE` | Is a regular file? | `[ -f hello.sh ]` |
| `-d DIR` | Is a directory? | `[ -d /tmp ]` |
| `-e PATH` | Exists (any type)? | `[ -e /dev/null ]` |
| `-r FILE` | Readable? | `[ -r config.txt ]` |
| `-w FILE` | Writable? | `[ -w output.log ]` |
| `-x FILE` | Executable? | `[ -x script.sh ]` |

**Comparison of approaches:**

| tcsh approach | bash approach |
|---------------|---------------|
| Uses pipes and text processing | Uses loops and file tests |
| Concise, Unix-philosophy style | More explicit, imperative style |
| Relies on `ls -l` output format | Uses shell built-in file tests |
| Runs three external commands per count | Runs one `ls` then pure shell logic |

---

## Exercise 3

### Learn to read Unix manual pages using `man cat`, `man echo`, `man wc`, and `man grep` to discover command options and usage

**3a. Reading a man page**

**Answer:**

```bash
man cat
```

Navigation keys:
| Key | Action |
|-----|--------|
| `q` | Quit |
| `Space` | Next page |
| `b` | Previous page |
| `/pattern` | Search forward |
| `n` | Next search match |
| `g` | Go to top |
| `G` | Go to bottom |

---

**3b. Key discoveries from each man page**

**Answer:**

```bash
man echo
man wc
man grep
man cat
```

| Command | Flag | Purpose | Example |
|---------|------|---------|---------|
| `cat -n` | `-n` | Show line numbers | `cat -n bonjour.sh` |
| `echo -n` | `-n` | No trailing newline | `echo -n "no newline"` |
| `echo -e` | `-e` | Enable escape sequences | `echo -e "line1\nline2"` |
| `wc -l` | `-l` | Count lines only | `wc -l bonjour.sh` |
| `wc -w` | `-w` | Count words only | `wc -w bonjour.sh` |
| `wc -c` | `-c` | Count bytes | `wc -c bonjour.sh` |
| `grep -i` | `-i` | Case-insensitive search | `grep -i "bonjour" *.sh` |
| `grep -v` | `-v` | Invert match | `grep -v "^#" bonjour.sh` |
| `grep -c` | `-c` | Count matching lines | `grep -c "echo" *.sh` |
| `grep -n` | `-n` | Show line numbers | `grep -n "echo" bonjour.sh` |

---

**3c. Practical examples**

**Answer:**

```bash
# Show bonjour.sh with line numbers
cat -n bonjour.sh
```

**Expected output:**
```
     1	#!/bin/bash
     2	
     3	# Simple greeting script demonstrating basic shell scripting
     4	# Concepts: shebang, echo command, newline
     5	
     6	echo "Bonjour."
```

```bash
# Count lines in all scripts
wc -l *.sh
```

**Expected output:**
```
  7 bonjour.sh
  7 hello_world.sh
 25 count_files_bash.sh
 17 count_files_tcsh.sh
 56 total
```

```bash
# Find all lines containing "echo" across all scripts
grep -n "echo" *.sh
```

**Expected output:**
```
bonjour.sh:6:echo "Bonjour."
hello_world.sh:7:echo $message
count_files_tcsh.sh:8:echo "Analyse du contenu..."
count_files_tcsh.sh:12:echo -n "   Nombre de fichiers    : "
count_files_tcsh.sh:17:echo -n "   Nombre de répertoires : "
```

```bash
# Show lines that are NOT comments and NOT empty
grep -v "^#" bonjour.sh | grep -v "^$"
```

**Expected output:**
```
echo "Bonjour."
```
