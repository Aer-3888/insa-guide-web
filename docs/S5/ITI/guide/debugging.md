---
title: "Debugging -- GDB, Valgrind, and Profiling"
sidebar_position: 3
---

# Debugging -- GDB, Valgrind, and Profiling

## Overview

Debugging is the process of finding and fixing errors in programs. The ITI course covers three essential tools:
- **gdb** -- Interactive debugger for logic bugs and crashes
- **valgrind** -- Memory error detector (leaks, invalid access)
- **gprof** -- Performance profiler (find bottlenecks)

## GDB (GNU Debugger)

### Setup

Always compile with the `-g` flag to include debugging symbols:
```bash
gcc -g -Wall -o program program.c
```

### Starting GDB

```bash
gdb ./program                      # Start debugging
gdb --args ./program arg1 arg2     # Start with arguments
gdb -x commands.gdb ./program      # Run command script
```

### Essential Commands

#### Execution Control
```gdb
run (r)                            # Start program
run arg1 arg2                      # Start with arguments
continue (c)                       # Continue to next breakpoint
next (n)                           # Step over (skip function calls)
step (s)                           # Step into (enter function calls)
finish                             # Run until current function returns
until 50                           # Run until line 50
quit (q)                           # Exit gdb
```

#### Breakpoints
```gdb
break main (b main)                # Break at function entry
break file.c:42                    # Break at specific line
break main if argc > 2             # Conditional breakpoint
info breakpoints                   # List all breakpoints
delete 1                           # Delete breakpoint #1
disable 1                          # Temporarily disable
enable 1                           # Re-enable
clear file.c:42                    # Remove breakpoint at location
```

#### Watchpoints
```gdb
watch variable                     # Break when variable changes
watch *0x12345678                  # Watch memory address
rwatch variable                    # Break when variable is read
awatch variable                    # Break on read or write
```

#### Inspection
```gdb
print variable (p variable)        # Print value
print *pointer                     # Dereference pointer
print array[0]@10                  # Print 10 elements from array
print/x variable                   # Print in hex
print/d variable                   # Print as decimal
print/t variable                   # Print in binary
display variable                   # Auto-print after each step
undisplay 1                        # Stop auto-printing
info locals                        # Show all local variables
info args                          # Show function arguments
whatis variable                    # Show type
ptype struct_name                  # Show struct definition
```

#### Call Stack
```gdb
backtrace (bt)                     # Show full call stack
frame 0                            # Switch to stack frame 0
up                                 # Move up one frame
down                               # Move down one frame
info frame                         # Details about current frame
```

#### Source Code
```gdb
list (l)                           # Show source around current line
list main                          # Show source of function
list 40,50                         # Show lines 40-50
list file.c:30                     # Show around line 30 of file.c
```

### GDB Debugging Workflow

```
1. Compile with -g:          gcc -g -Wall -o prog prog.c
2. Start gdb:                gdb ./prog
3. Set breakpoint:           break main
4. Run:                      run
5. Step through code:        next / step
6. Inspect variables:        print var / info locals
7. Find the bug:             backtrace / print suspicious_var
8. Fix and recompile:        (exit gdb, edit, recompile)
```

### GDB Command Scripts

Save repetitive commands in a file:

```
# commands.gdb
break main
run
print argc
print argv[0]
continue
```

Run with: `gdb -x commands.gdb ./program`

### Custom Commands

```gdb
define print_array
    set $i = 0
    while $i < $arg0
        print array[$i]
        set $i = $i + 1
    end
end
```

### TUI Mode

GDB has a text user interface showing source code:
```
Ctrl+X A                           # Toggle TUI mode
Ctrl+X 2                           # Show assembly alongside
```

### Core Dump Analysis

```bash
# Enable core dumps
ulimit -c unlimited

# After crash, analyze
gdb ./program core
backtrace                          # See where it crashed
print variable                     # Inspect state at crash
```

## Valgrind

Valgrind detects memory errors that are invisible to the compiler.

### Basic Usage

```bash
# Compile with -g (no optimization)
gcc -g -O0 -o program program.c

# Run with valgrind
valgrind ./program
valgrind --leak-check=full ./program
valgrind --leak-check=full --show-leak-kinds=all ./program
valgrind --track-origins=yes ./program
```

### What Valgrind Detects

| Error Type | Description | Example |
|-----------|-------------|---------|
| Invalid read/write | Accessing freed or out-of-bounds memory | `array[100]` on size-10 array |
| Use of uninitialized | Reading variable before assigning | `int x; if (x > 0)` |
| Memory leak | malloc without free | `malloc(100)` never freed |
| Double free | Freeing memory twice | `free(p); free(p);` |
| Mismatched free | Using wrong dealloc function | `malloc` + `delete` |

### Reading Valgrind Output

```
==12345== Invalid read of size 4
==12345==    at 0x4005E8: main (program.c:10)
==12345==  Address 0x51f9068 is 0 bytes after a block of size 40 alloc'd
==12345==    at 0x4C2B6CD: malloc (in /usr/lib/valgrind/...)
==12345==    by 0x4005C1: main (program.c:5)
```

Key information:
- **Error type**: "Invalid read of size 4"
- **Location**: `program.c:10`
- **Context**: "0 bytes after a block of size 40" = reading just past end of array

### Memory Leak Summary

```
==12345== HEAP SUMMARY:
==12345==     in use at exit: 100 bytes in 1 blocks
==12345==   total heap usage: 3 allocs, 2 frees, 200 bytes allocated
==12345==
==12345== LEAK SUMMARY:
==12345==    definitely lost: 100 bytes in 1 blocks
==12345==    indirectly lost: 0 bytes in 0 blocks
==12345==    possibly lost: 0 bytes in 0 blocks
==12345==    still reachable: 0 bytes in 0 blocks
```

## Gprof (GNU Profiler)

Gprof identifies performance bottlenecks -- which functions consume the most time.

### Workflow

```bash
# 1. Compile with profiling enabled
gcc -pg -o program program.c

# 2. Run program (generates gmon.out automatically)
./program

# 3. Analyze
gprof program gmon.out > analysis.txt
less analysis.txt
```

### Reading the Flat Profile

```
  %   cumulative   self              self     total
 time   seconds   seconds    calls  s/call   s/call  name
 44.5      0.44     0.44 1394467004   0.00     0.00  getValeur
 24.2      0.68     0.24        1   0.24     0.68  inverseValeurs
```

| Column | Meaning |
|--------|---------|
| % time | Percentage of total execution time |
| cumulative seconds | Running total of time |
| self seconds | Time in this function only (not callees) |
| calls | Number of invocations |
| self s/call | Average time per call (this function) |
| total s/call | Average time per call (including callees) |

### Reading the Call Graph

Shows caller-callee relationships:
- Which functions call which
- How much time is attributed to each caller
- How deeply nested the call chain is

### Optimization Strategy

1. **Profile first** -- Never guess where the bottleneck is
2. **Focus on hotspots** -- Top 3-5 functions by % time
3. **Algorithm over micro-optimization** -- Better algorithm beats faster code
4. **Measure again** -- Verify improvements with new profile
5. **Compare optimization levels** -- Build with `-O0` and `-O3`, profile both

### Comparing Optimization Levels

```bash
# Non-optimized
gcc -pg -O0 -o prog_O0 program.c
./prog_O0
gprof prog_O0 gmon.out > profile_O0.txt

# Optimized
gcc -pg -O3 -o prog_O3 program.c
./prog_O3
gprof prog_O3 gmon.out > profile_O3.txt

# Compare
diff profile_O0.txt profile_O3.txt
```

## Debugging Strategies

### Common Bug Categories

| Category | Symptoms | Tool |
|----------|----------|------|
| Logic error | Wrong output, no crash | gdb (breakpoints, print) |
| Segfault | Program crashes | gdb (backtrace), valgrind |
| Memory leak | Increasing memory use | valgrind --leak-check=full |
| Buffer overflow | Corrupted data, crashes | valgrind, -fsanitize=address |
| Infinite loop | Program hangs | gdb (Ctrl+C, backtrace) |
| Off-by-one | Wrong boundary | gdb (print loop variables) |

### Systematic Debugging Process

1. **Reproduce** -- Make the bug happen consistently
2. **Isolate** -- Find the smallest input that triggers it
3. **Locate** -- Use gdb breakpoints to narrow down the line
4. **Understand** -- Why does the code do the wrong thing?
5. **Fix** -- Make the minimal change to correct behavior
6. **Verify** -- Confirm the fix works and nothing else broke

---

## CHEAT SHEET

### GDB Commands
```
run / r                  Start program
break func / b func      Set breakpoint
continue / c             Continue execution
next / n                 Step over
step / s                 Step into
finish                   Run to return
print var / p var        Print variable
backtrace / bt           Show call stack
info locals              Local variables
info breakpoints         List breakpoints
quit / q                 Exit
```

### Valgrind
```
valgrind ./program                    Basic check
valgrind --leak-check=full ./prog     Full leak check
valgrind --track-origins=yes ./prog   Trace uninit values
```

### Gprof
```
gcc -pg -o prog prog.c    Compile with profiling
./prog                     Run (generates gmon.out)
gprof prog gmon.out        Analyze profile
```

### Compilation for Debugging
```
gcc -g -Wall -O0 prog.c        Debug build
gcc -g -Wall -pg prog.c        Profile build
gcc -g -Wall -fsanitize=address  Address sanitizer
```
