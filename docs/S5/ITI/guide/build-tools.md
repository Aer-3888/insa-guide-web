---
title: "Build Tools -- Make, GCC, and Compilation"
sidebar_position: 2
---

# Build Tools -- Make, GCC, and Compilation

## Overview

Build tools automate the process of compiling and linking programs. The FUS part of the ITI course focuses on `gcc` (GNU Compiler Collection) and `make` (build automation). Understanding how compilation works and how to write Makefiles is a core exam topic.

## GCC Compilation Pipeline

The compilation of a C program happens in four phases:

```
Source (.c) --> Preprocessor --> Compiler --> Assembler --> Linker --> Executable
              (-E, .i)       (-S, .s)    (-c, .o)     (link)
```

### Phase by Phase

| Phase | Flag | Input | Output | What It Does |
|-------|------|-------|--------|--------------|
| Preprocessing | `-E` | `.c` | `.i` | Expand macros, include headers, remove comments |
| Compilation | `-S` | `.i` | `.s` | Translate C to assembly language |
| Assembly | `-c` | `.s` | `.o` | Convert assembly to machine code (object file) |
| Linking | (none) | `.o` | executable | Combine object files, resolve symbols |

### Important GCC Flags

```bash
# Compilation control
gcc -c file.c              # Compile only, produce .o (no linking)
gcc -o output file.c       # Specify output filename
gcc -E file.c              # Stop after preprocessing
gcc -S file.c              # Stop after compilation (produce .s)

# Warnings
gcc -Wall file.c           # Enable all common warnings
gcc -Werror file.c         # Treat warnings as errors
gcc -Wextra file.c         # Extra warnings

# Debugging
gcc -g file.c              # Include debugging symbols (for gdb)

# Optimization
gcc -O0 file.c             # No optimization (default)
gcc -O1 file.c             # Basic optimization
gcc -O2 file.c             # Recommended optimization
gcc -O3 file.c             # Aggressive optimization
gcc -Os file.c             # Optimize for size
gcc -Og file.c             # Optimize for debugging

# Profiling
gcc -pg file.c             # Enable profiling (for gprof)

# Preprocessor defines
gcc -DDEBUG file.c         # Define DEBUG macro
gcc -DSIZE=100 file.c      # Define SIZE as 100

# Include and library paths
gcc -I/path/to/headers     # Add include search path
gcc -L/path/to/libs        # Add library search path
gcc -lm                    # Link with math library

# Dependencies
gcc -MM file.c             # Generate dependency rules for Make
```

### Optimization Levels Comparison

| Level | Speed | Compile Time | Debugging | Code Size |
|-------|-------|-------------|-----------|-----------|
| `-O0` | Baseline | Fast | Easy | Normal |
| `-O1` | Faster | Moderate | Harder | Normal |
| `-O2` | Fast | Slow | Harder | Normal |
| `-O3` | Fastest | Slowest | Very hard | Larger |
| `-Os` | Good | Moderate | Harder | Smallest |

The **80-20 rule**: 80% of execution time is spent in 20% of code. Profile first, optimize second.

## Make and Makefiles

### Why Make?

Without make, you must recompile everything after any change:
```bash
gcc -c file1.c && gcc -c file2.c && gcc -c file3.c && gcc -o program file1.o file2.o file3.o
```

With make, only changed files are recompiled, based on file timestamps.

### Makefile Syntax

```makefile
# Rule format:
target: dependencies
	command          # MUST be indented with a TAB (not spaces!)

# Example:
program: main.o utils.o
	gcc -o program main.o utils.o

main.o: main.c main.h
	gcc -c main.c

utils.o: utils.c utils.h main.h
	gcc -c utils.c
```

**Critical rule**: Commands MUST start with a TAB character, not spaces. This is the most common Makefile error.

### Variables

```makefile
# User-defined variables
CC = gcc
CFLAGS = -Wall -g
LDFLAGS = -lm
SOURCES = main.c utils.c
OBJECTS = $(SOURCES:.c=.o)    # Replace .c with .o
TARGET = program

# Use variables
$(TARGET): $(OBJECTS)
	$(CC) -o $@ $^ $(LDFLAGS)
```

### Automatic Variables

| Variable | Meaning | Example |
|----------|---------|---------|
| `$@` | Target name | `program` |
| `$<` | First dependency | `main.c` |
| `$^` | All dependencies | `main.o utils.o` |
| `$?` | Dependencies newer than target | Changed files |

### Pattern Rules

```makefile
# Generic rule: compile any .c to .o
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# This replaces individual rules for each .c file
```

### Phony Targets

```makefile
# Targets that don't produce files
.PHONY: all clean

all: $(TARGET)

clean:
	rm -f $(OBJECTS) $(TARGET)
```

### Complete Makefile Template

```makefile
# Compiler configuration
CC = gcc
CFLAGS = -Wall -g
LDFLAGS =

# Files
SOURCES = principal.c tableau.c
OBJECTS = $(SOURCES:.c=.o)
TARGET = principal

# Default target
all: $(TARGET)

# Link executable
$(TARGET): $(OBJECTS)
	$(CC) -o $@ $^ $(LDFLAGS)

# Pattern rule for object files
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Explicit dependencies (from gcc -MM)
principal.o: principal.c commun.h tableau.h
tableau.o: tableau.c commun.h tableau.h

# Profiling build
profile: CFLAGS += -pg
profile: LDFLAGS += -pg
profile: clean $(TARGET)

# Optimized build
optimized: CFLAGS += -O3
optimized: clean $(TARGET)

# Clean build artifacts
clean:
	rm -f $(OBJECTS) $(TARGET) gmon.out

# Show dependencies
deps:
	$(CC) -MM $(SOURCES)

# Generate preprocessed output
%.i: %.c
	$(CC) -E $< -o $@

# Generate assembly output
%.s: %.c
	$(CC) $(CFLAGS) -S $< -o $@

.PHONY: all clean profile optimized deps
```

### How Make Decides What to Build

1. Check if target exists
2. If target exists, compare timestamps with dependencies
3. If any dependency is newer than target, rebuild
4. Recursively check dependencies

### Common Make Invocations

```bash
make                       # Build default target (first target, usually 'all')
make clean                 # Run clean target
make -n                    # Dry run (show commands without executing)
make -f MyMakefile         # Use specific makefile
make -j4                   # Build with 4 parallel jobs
make CC=clang              # Override variable on command line
```

## Libraries

### Static Libraries (.a)

```bash
# Create object files
gcc -c file1.c file2.c

# Create static library
ar rcs libmylib.a file1.o file2.o

# Use static library
gcc -o program main.c -L. -lmylib
```

### Dynamic Libraries (.so)

```bash
# Create position-independent object files
gcc -fPIC -c file1.c file2.c

# Create shared library
gcc -shared -o libmylib.so file1.o file2.o

# Use shared library
gcc -o program main.c -L. -lmylib

# Set library path at runtime
export LD_LIBRARY_PATH=.
```

### Makefile for Libraries

```makefile
# Static library
libmylib.a: file1.o file2.o
	ar rcs $@ $^

# Dynamic library
libmylib.so: file1.o file2.o
	gcc -shared -o $@ $^
```

## Dependency Generation

```bash
# Generate dependency lines for Makefile
gcc -MM main.c
# Output: main.o: main.c main.h utils.h

# Include auto-generated dependencies in Makefile
-include $(SOURCES:.c=.d)

%.d: %.c
	$(CC) -MM $< > $@
```

---

## CHEAT SHEET

### GCC Flags
| Flag | Purpose |
|------|---------|
| `-c` | Compile only (no link) |
| `-o name` | Output filename |
| `-Wall` | All warnings |
| `-g` | Debug symbols |
| `-O0/O2/O3` | Optimization level |
| `-pg` | Profiling (gprof) |
| `-E` | Preprocess only |
| `-S` | Compile to assembly |
| `-MM` | Show dependencies |
| `-DNAME` | Define macro |
| `-I dir` | Include path |
| `-L dir` | Library path |
| `-l lib` | Link library |

### Makefile Essentials
```
target: deps           Rule definition
	command            Command (TAB-indented!)
$@                     Target name
$<                     First dependency
$^                     All dependencies
$(VAR)                 Variable reference
%.o: %.c               Pattern rule
.PHONY: target         Non-file target
```

### Compilation Commands
```
gcc -Wall -g -c file.c       Compile to object file
gcc -o prog file1.o file2.o  Link to executable
gcc -MM file.c               Show dependencies
make                         Build default target
make clean                   Clean artifacts
make -n                      Dry run
```
