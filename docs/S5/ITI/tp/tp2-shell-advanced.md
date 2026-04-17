---
title: "FUS2 - Advanced Shell Scripting"
sidebar_position: 2
---

# FUS2 - Advanced Shell Scripting

## Learning Objectives

This TP builds upon FUS1 with more advanced shell scripting concepts:

- Work with command-line arguments and parameters
- Implement conditional logic and loops
- Handle file operations programmatically
- Use advanced text processing with grep patterns
- Understand script debugging techniques

## Core Concepts

### 1. Command-Line Arguments

Shell scripts can accept arguments passed from the command line:

```bash
#!/bin/bash
# $0 = script name
# $1 = first argument
# $2 = second argument
# $# = number of arguments
# $@ = all arguments as separate words
# $* = all arguments as single string

echo "Script: $0"
echo "First arg: $1"
echo "Total args: $#"
```

### 2. Conditional Statements

```bash
# if-then-else structure
if [ condition ]; then
    # commands
elif [ another_condition ]; then
    # commands
else
    # commands
fi

# Common conditions:
# [ $a -eq $b ]  # Equal (numeric)
# [ $a -ne $b ]  # Not equal (numeric)
# [ $a -lt $b ]  # Less than
# [ $a -gt $b ]  # Greater than
# [ "$s1" = "$s2" ]   # String equality
# [ -z "$str" ]  # String is empty
# [ -n "$str" ]  # String is not empty
```

### 3. Loops

```bash
# For loop over items
for item in list of items; do
    echo $item
done

# For loop with counter
for i in {1..10}; do
    echo $i
done

# While loop
while [ condition ]; do
    # commands
done
```

### 4. Functions

```bash
# Define a function
function_name() {
    local var="local variable"  # Local to function
    echo "Function arg 1: $1"
    return 0  # Return status (0 = success)
}

# Call the function
function_name argument1 argument2
```

### 5. Advanced Text Processing

```bash
# grep with patterns
grep "^start"    # Lines starting with "start"
grep "end$"      # Lines ending with "end"
grep "[0-9]"     # Lines containing digits
grep -v "pattern" # Lines NOT matching pattern
grep -c "pattern" # Count matching lines
grep -n "pattern" # Show line numbers

# sed (stream editor)
sed 's/old/new/' file     # Replace first occurrence per line
sed 's/old/new/g' file    # Replace all occurrences

# awk (pattern scanning)
awk '{print $1}' file     # Print first column
awk -F: '{print $1}' file # Use : as delimiter
```

## Exercises Overview

### Exercise 1: Variable Scripts
Create scripts that use variables and demonstrate variable expansion.

**Files**: `exo01`
- Simple variable assignment and echo
- Understanding variable scope

### Exercise 2: File Processing Loop
Write a script that processes multiple files, counting specific patterns.

**Files**: `exo02`
- Loop through files
- Use conditionals to test file types
- Accumulate counts

## Solutions

See `src/` directory for cleaned, commented implementations:
- `simple_variable.sh` - Basic variable usage
- `file_processor.sh` - Advanced file processing with loops

## Key Takeaways

1. **Always quote variables** - `"$var"` prevents word splitting issues
2. **Test for argument count** - Check `$#` before using `$1`, `$2`, etc.
3. **Use local variables in functions** - Prevents namespace pollution
4. **Exit codes matter** - `exit 0` for success, non-zero for errors
5. **Debugging**: Use `set -x` to trace execution, `set -e` to exit on errors

## Common Patterns

### Argument Validation
```bash
if [ $# -lt 2 ]; then
    echo "Usage: $0 <arg1> <arg2>"
    exit 1
fi
```

### Safe File Operations
```bash
if [ ! -f "$filename" ]; then
    echo "Error: File $filename not found"
    exit 1
fi
```

### Default Values
```bash
# Use default if variable is unset or empty
name=${name:-"default_value"}
```

## Further Reading

- Advanced bash scripting guide: https://tldp.org/LDP/abs/html/
- Shell parameter expansion: `man bash` (search for "Parameter Expansion")
- Regular expressions: `man grep`, `man regex`
- Best practices: ShellCheck (shellcheck.net)

## Common Pitfalls

1. **Not quoting variables with spaces** - Always use `"$var"`
2. **Using `[ ]` vs `[[ ]]`** - `[[ ]]` is bash-specific but more powerful
3. **Forgetting semicolons** - `if [ test ]; then` needs semicolon before `then`
4. **Using `=` in `[ ]` tests** - Should be `[ "$a" = "$b" ]`, not `==` in sh
5. **Not checking exit codes** - Use `$?` to check previous command status
