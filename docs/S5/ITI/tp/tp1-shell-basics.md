---
title: "FUS1 - Shell Basics & Text Processing"
sidebar_position: 1
---

# FUS1 - Shell Basics & Text Processing

## Learning Objectives

This TP introduces fundamental Unix shell concepts and text manipulation utilities. You learn to:

- Navigate the Unix filesystem using the command line
- Understand shell basics (bash vs tcsh syntax)
- Work with standard I/O streams (stdin, stdout, stderr)
- Use core text processing tools (cat, echo, wc, grep)
- Write simple shell scripts with variables and control structures

## Core Concepts

### 1. Shell Types

Unix systems support multiple shell interpreters:

- **bash** (Bourne Again Shell) - Most common, default on Linux
- **tcsh** (TENEX C Shell) - C-like syntax, common on older systems
- **sh** (Bourne Shell) - Original Unix shell, minimal but portable

The shebang (`#!/bin/bash`) at the start of a script specifies which interpreter to use.

### 2. Text Processing Commands

#### `cat` - Concatenate and display files
```bash
cat file.txt           # Display file contents
cat file1 file2        # Concatenate multiple files
cat > newfile.txt      # Create file from stdin (Ctrl+D to end)
```

#### `echo` - Print text to stdout
```bash
echo "Hello World"     # Print string
echo $VAR              # Print variable value
echo -n "No newline"   # Suppress newline
```

#### `wc` - Word count
```bash
wc file.txt            # Show lines, words, bytes
wc -l file.txt         # Count lines only
wc -w file.txt         # Count words only
```

#### `grep` - Pattern matching
```bash
grep "pattern" file    # Find lines containing pattern
grep -i "pattern" file # Case-insensitive search
grep -v "pattern" file # Invert match (lines NOT containing pattern)
```

### 3. File System Navigation

```bash
ls                     # List directory contents
ls -l                  # Long format (permissions, size, date)
ls -a                  # Show hidden files (.file)
pwd                    # Print working directory
cd /path/to/dir        # Change directory
```

### 4. File Type Testing

In bash scripts, you can test file properties:

```bash
if [ -f filename ]; then    # Is it a regular file?
    echo "It's a file"
fi

if [ -d dirname ]; then     # Is it a directory?
    echo "It's a directory"
fi
```

Common test operators:
- `-f` : Regular file
- `-d` : Directory
- `-e` : Exists (any type)
- `-r` : Readable
- `-w` : Writable
- `-x` : Executable

### 5. Pipes and Redirection

```bash
command1 | command2    # Pipe: stdout of command1 → stdin of command2
command > file         # Redirect stdout to file (overwrite)
command >> file        # Redirect stdout to file (append)
command 2> file        # Redirect stderr to file
command < file         # Redirect file to stdin
```

## Exercises Overview

### Exercise 1: Simple Scripts
Create basic shell scripts that print messages and manipulate variables.

**Key concepts**: Shebang, variables, echo

### Exercise 2: File Counting Script
Count the number of files and directories in the current location using `ls`, `grep`, and `wc`.

**Key concepts**: Piping, grep patterns (`^-` for files, `^d` for directories), wc -l

**Two approaches**:
1. **tcsh version**: Uses pipes and text processing
   ```bash
   ls -l | grep "^-" | wc -l    # Count files
   ls -l | grep "^d" | wc -l    # Count directories
   ```

2. **bash version**: Uses loops and file testing
   ```bash
   for e in $(ls); do
       if [ -f $e ]; then nbfic=$((nbfic+1)); fi
       if [ -d $e ]; then nbdir=$((nbdir+1)); fi
   done
   ```

### Exercise 3: Understanding man Pages
Learn to read Unix manual pages (man cat, man echo, man wc) to understand command options and usage.

## Solutions

See `src/` directory for cleaned, commented implementations:
- `bonjour.sh` - Basic greeting script
- `cat_simulator.sh` - Demonstrates how cat works
- `count_files_tcsh.sh` - File counter using pipes (tcsh)
- `count_files_bash.sh` - File counter using loops (bash)

## Key Takeaways

1. **Shell scripts are interpreted line-by-line** - No compilation needed
2. **Different shells have different syntax** - Always specify shebang
3. **Pipes are powerful** - Combine simple tools to solve complex problems
4. **File system operations are fundamental** - Understanding ls, cd, pwd is essential
5. **Testing file types matters** - Use appropriate test operators

## Further Reading

- Bash scripting guide: `man bash`
- Text processing: Advanced grep, sed, awk
- Shell scripting best practices: Quoting variables, error handling
- POSIX compliance for portable scripts

## Common Pitfalls

1. **Forgetting shebang** - Script may run in wrong shell
2. **Not quoting variables** - `"$var"` vs `$var` matters with spaces
3. **Using bash syntax in sh** - `[[ ]]` doesn't work in POSIX sh
4. **Forgetting to make scripts executable** - `chmod +x script.sh`
5. **Hardcoding paths** - Use `pwd`, `dirname`, or relative paths
