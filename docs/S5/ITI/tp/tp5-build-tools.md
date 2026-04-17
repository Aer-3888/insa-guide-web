---
title: "FUS5 - Build Tools (make, gdb, gprof)"
sidebar_position: 5
---

# FUS5 - Build Tools (make, gdb, gprof)

## Learning Objectives

This TP introduces essential development tools for C programming:

- Automate builds with **make** and Makefiles
- Debug programs with **gdb** (GNU Debugger)
- Profile performance with **gprof** (GNU Profiler)
- Understand compiler flags and optimization levels
- Manage dependencies in multi-file projects

## Core Concepts

### 1. Make - Build Automation

**make** is a build automation tool that manages dependencies between source files and build products.

#### Why Make?
Without make, rebuilding after changes requires recompiling all files:
```bash
gcc -c file1.c
gcc -c file2.c
gcc -c file3.c
gcc -o program file1.o file2.o file3.o
```

With make, only changed files are recompiled automatically.

#### Makefile Structure

```makefile
# Target: dependencies
target: dependency1 dependency2
	command to build target

# Example: Build object file from source
file.o: file.c file.h
	gcc -c file.c

# Example: Link executable
program: file1.o file2.o
	gcc -o program file1.o file2.o
```

**Key rules**:
- Targets are files to be built
- Dependencies are files needed to build the target
- Commands must be indented with a **TAB** (not spaces!)
- Make checks file timestamps to determine what needs rebuilding

#### Special Variables

```makefile
CC = gcc              # Compiler
CFLAGS = -Wall -g     # Compiler flags
LDFLAGS = -lm         # Linker flags

# Automatic variables
$@    # Target name
$<    # First dependency
$^    # All dependencies
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
```

#### Common Targets

```makefile
all: program          # Default target (builds everything)

clean:                # Remove generated files
	rm -f *.o program

.PHONY: all clean     # Declare non-file targets
```

### 2. GCC Compiler Options

#### Compilation Phases

1. **Preprocessing** (`-E`): Expand macros, include headers
2. **Compilation** (`-S`): Translate C to assembly
3. **Assembly** (`-c`): Convert assembly to object code
4. **Linking**: Combine object files into executable

#### Important Flags

```bash
-c           # Compile only (don't link), produces .o files
-o file      # Specify output filename
-E           # Stop after preprocessing
-S           # Stop after compilation (produces .s assembly)
-Wall        # Enable all warnings
-g           # Include debugging symbols (for gdb)
-O0          # No optimization (default, fastest compile)
-O1, -O2, -O3 # Increasing optimization levels
-pg          # Enable profiling (for gprof)
-MM          # Generate dependency rules for make
-I dir       # Add directory to include search path
-L dir       # Add directory to library search path
-l library   # Link with library
```

#### Optimization Levels

- **-O0**: No optimization, fastest compilation, easiest debugging
- **-O1**: Basic optimization, moderate compile time
- **-O2**: Recommended optimization level (faster code, longer compile)
- **-O3**: Aggressive optimization, may increase code size
- **-Os**: Optimize for size
- **-Og**: Optimize for debugging experience

**80-20 Rule**: 80% of execution time is spent in 20% of the code. Optimize carefully!

### 3. GDB - GNU Debugger

**gdb** is an interactive debugger for finding bugs and understanding program behavior.

#### Basic Usage

```bash
# Compile with debugging symbols
gcc -g program.c -o program

# Start gdb
gdb ./program

# Start with arguments
gdb --args ./program arg1 arg2
```

#### Essential GDB Commands

```gdb
run (r)                    # Start program execution
break function (b)         # Set breakpoint at function
break file.c:42            # Set breakpoint at line 42 of file.c
continue (c)               # Continue execution after breakpoint
next (n)                   # Step over (execute next line)
step (s)                   # Step into (enter function calls)
finish                     # Run until current function returns
print var (p)              # Print variable value
print *ptr                 # Print value pointed to
display var                # Auto-print var after each step
info locals                # Show local variables
info args                  # Show function arguments
backtrace (bt)             # Show call stack
frame n                    # Switch to stack frame n
list (l)                   # Show source code
quit (q)                   # Exit gdb
```

#### Breakpoint Types

```gdb
break main                 # Break at function entry
break 42                   # Break at line 42 (current file)
break file.c:42            # Break at specific file:line
break main if argc > 2     # Conditional breakpoint
watch variable             # Break when variable changes
```

#### GDB Script Files

Save commands in a file and execute:
```bash
# commands.gdb
break main
run
print argc
continue
```

```bash
gdb -x commands.gdb ./program
```

#### Core Dumps

When a program crashes:
```bash
# Enable core dumps
ulimit -c unlimited

# After crash, analyze core file
gdb ./program core
backtrace  # See where it crashed
```

### 4. Gprof - GNU Profiler

**gprof** analyzes where your program spends its time, identifying performance bottlenecks.

#### Usage Workflow

```bash
# 1. Compile with profiling enabled
gcc -pg -o program program.c

# 2. Run program (generates gmon.out)
./program

# 3. Analyze profile data
gprof program gmon.out > analysis.txt

# 4. View results
less analysis.txt
```

#### Reading Gprof Output

**Flat Profile**: Shows time spent in each function
```
  %   cumulative   self              self     total
 time   seconds   seconds    calls  s/call   s/call  name
 44.5      0.44     0.44 1394467004   0.00     0.00  getValeur
 24.2      0.68     0.24        1   0.24     0.68  inverseValeurs
```

- **% time**: Percentage of total time
- **cumulative seconds**: Total time up to this function
- **self seconds**: Time in this function only (excluding callees)
- **calls**: Number of times called
- **self s/call**: Average time per call (this function only)
- **total s/call**: Average time per call (including callees)

**Call Graph**: Shows caller-callee relationships
```
[4]  58.5   10.85   3.43 1394467004           getValeur [4]
                    3.43 1394467004/1394625405     lireValeur [3]
```

#### Interpretation

- Functions with high **self seconds** are CPU-intensive
- Functions with high **calls** might benefit from optimization or caching
- **total s/call >> self s/call** means time is in callees, not the function itself

#### Optimization Strategy

1. **Profile first** - Don't guess where the bottleneck is
2. **Optimize hotspots** - Focus on top 3-5 functions
3. **Measure again** - Verify improvements with new profile
4. **Don't over-optimize** - Stop when performance is acceptable

### 5. Dependency Management

#### Automatic Dependency Generation

```bash
# Generate dependencies for file.c
gcc -MM file.c

# Output:
# file.o: file.c file.h common.h
```

#### Including Dependencies in Makefile

```makefile
# Generate and include dependencies
DEPS = $(SOURCES:.c=.d)

%.d: %.c
	$(CC) -MM $< > $@

-include $(DEPS)
```

## Exercises Overview

### Exercise 1: Understand the Application
Analyze a multi-module C program:
- `tableau.c/h` - Array data structure
- `principal.c` - Main program

**Tasks**:
1. Read `commun.h` and `setValeur` function
2. Compile with `-E` flag to see preprocessed output
3. Compile without modifying sources using `-D` flags

### Exercise 2: View Dependencies
Use `gcc -MM` to see file dependencies for the Makefile.

### Exercise 3: Create Makefile
Build a Makefile that:
- Generates object files (.o) from source files (.c)
- Manages dependencies between .o and .h files
- Links objects into executable
- Supports `clean` target
- Measures compilation time with `time` command
- Uses variables (CC, SOURCES, OBJETS)
- Defines compilation rules using pattern rules (`%.o: %.c`)

### Exercise 4: Debugging with GDB
Use gdb to debug the application:
- Set breakpoints
- Step through code
- Inspect variables
- Analyze function calls

### Exercise 5: Performance Profiling
Profile the application with gprof:
- Compile with `-pg` flag
- Run program (generates `gmon.out`)
- Analyze profile with `gprof program gmon.out`
- Identify performance bottlenecks
- Compare optimized vs unoptimized builds

### Exercise 6: Optimization
Build with different optimization levels and compare:
- Non-optimized (`-O0`)
- Optimized (`-O3`)
- Profile both versions and compare performance

## Solutions

See `src/` directory for:
- `Makefile` - Complete makefile with all targets
- `README_gdb.txt` - GDB command reference
- `README_profiling.txt` - Profiling workflow and interpretation

## Key Takeaways

1. **make saves time** - Only rebuilds what changed
2. **Dependencies matter** - Incorrect dependencies cause subtle bugs
3. **Debug symbols are essential** - Always compile with `-g` during development
4. **Profile before optimizing** - Measure, don't guess
5. **Optimization has trade-offs** - Slower compilation, harder debugging, sometimes worse performance

## Common Patterns

### Basic Makefile Template

```makefile
CC = gcc
CFLAGS = -Wall -g
TARGET = program
SOURCES = main.c util.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(TARGET)

.PHONY: all clean
```

### Debugging Workflow

1. Compile with `-g`
2. Run in gdb: `gdb ./program`
3. Set breakpoint: `break main`
4. Run: `run`
5. Step through: `next`, `step`
6. Inspect: `print var`, `backtrace`

### Profiling Workflow

1. Compile with `-pg`
2. Run program normally
3. Analyze: `gprof program gmon.out | less`
4. Focus on high % time functions
5. Optimize and re-profile

## Common Pitfalls

1. **Using spaces instead of tabs in Makefiles** - Commands must start with TAB
2. **Forgetting -g flag** - Can't debug without symbols
3. **Not cleaning before rebuilding** - Old object files cause issues
4. **Optimizing too early** - Profile first, optimize later
5. **Ignoring warnings** - `-Wall` catches many bugs
6. **Circular dependencies** - Make will report error
7. **Forgetting .PHONY** - Targets with no output file need .PHONY

## Further Reading

- GNU Make Manual: https://www.gnu.org/software/make/manual/
- GDB Manual: https://www.gnu.org/software/gdb/documentation/
- Gprof Manual: https://sourceware.org/binutils/docs/gprof/
- GCC Optimization Options: https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html
- "The Art of Debugging with GDB, DDD, and Eclipse"
- Donald Knuth: "Premature optimization is the root of all evil"

## Performance Optimization Rules

1. **Profile first** - Don't optimize without data
2. **Focus on bottlenecks** - 80-20 rule applies
3. **Measure impact** - Verify optimizations help
4. **Algorithm > Micro-optimizations** - Better algorithm beats faster code
5. **Readability matters** - Don't sacrifice maintainability for 5% speedup
