---
title: "TP5 - FUS5: Build Tools (Make, GDB, Gprof)"
sidebar_position: 2
---

# TP5 - FUS5: Build Tools (Make, GDB, Gprof)

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp5_build_tools/README.md

## Exercise 1

### Understand the Application: analyze the multi-module C program, read `commun.h` and `setValeur`, compile with `-E` flag to see preprocessed output, compile without modifying sources using `-D` flags

**1a. Read `commun.h` and the `setValeur` function**

The application consists of:
- `commun.h` -- defines `TAILLE` (array size, default 10000)
- `tableau.h` / `tableau.c` -- array operations (`setValeur`, `getValeur`, `lireValeur`, `inverseValeurs`, `afficheValeur`)
- `principal.c` -- main program using the array module

---

**1b. View preprocessed output with `-E`**

**Answer:**

```bash
gcc -E principal.c -o principal.i
wc -l principal.i
# Expected: ~800+ lines (includes all stdio.h content)

tail -30 principal.i
```

**Expected output (last section):**
```c
# 5 "principal.c"
int main() {
    int tab[10000];
    int n = 10000;
    printf("Array size: %d\n", n);
    lireValeur(tab, n);
    printf("First 10 values: ");
    afficheValeur(tab, 10);
    inverseValeurs(tab, n);
    printf("After inverse, first 10: ");
    afficheValeur(tab, 10);
    return 0;
}
```

Notice: `TAILLE` has been replaced with `10000` by the preprocessor.

---

**1c. Compile with `-D` to override TAILLE**

**Answer:**

```bash
gcc -DTAILLE=50 -c principal.c -o principal_small.o
gcc -E -DTAILLE=50 principal.c | grep "int tab"
```

**Expected output:**
```
    int tab[50];
```

The `-DTAILLE=50` flag defines the macro on the command line, overriding the default in `commun.h`.

---

## Exercise 2

### View Dependencies: use `gcc -MM` to see file dependencies for the Makefile

**Answer:**

```bash
gcc -MM principal.c
```

**Expected output:**
```
principal.o: principal.c commun.h tableau.h
```

```bash
gcc -MM tableau.c
```

**Expected output:**
```
tableau.o: tableau.c commun.h tableau.h
```

**Interpretation:** If `commun.h` changes, both `.o` files must be recompiled. If only `principal.c` changes, only `principal.o` needs recompiling.

---

## Exercise 3

### Create a Makefile with variables (CC, SOURCES, OBJETS), pattern rules (`%.o: %.c`), dependencies, `clean` target, and compilation time measurement

**Answer:**

```makefile
# Compiler configuration
CC = gcc
CFLAGS = -Wall -g
LDFLAGS =

# Source and object files
SOURCES = principal.c tableau.c
OBJECTS = $(SOURCES:.c=.o)
TARGET = principal

# Default target: build everything
all: $(TARGET)

# Link object files into executable
# $@ = target name (principal)
# $^ = all dependencies (principal.o tableau.o)
$(TARGET): $(OBJECTS)
	$(CC) -o $@ $^ $(LDFLAGS)
	@echo "Build complete: $(TARGET)"

# Pattern rule: compile any .c to .o
# $< = first dependency (the .c file)
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

# Explicit dependencies (from gcc -MM)
principal.o: principal.c commun.h tableau.h
tableau.o: tableau.c commun.h tableau.h

# Clean build artifacts
clean:
	rm -f $(OBJECTS) $(TARGET) gmon.out
	@echo "Cleaned build artifacts"

# Profiling target
profile: CFLAGS += -pg
profile: clean $(TARGET)
	@echo "Built with profiling enabled"

# Optimized target
optimized: CFLAGS += -O3
optimized: clean $(TARGET)
	@echo "Built with -O3 optimization"

# Show dependencies
deps:
	$(CC) -MM $(SOURCES)

.PHONY: all clean profile optimized deps
```

**CRITICAL:** Commands under each target MUST use a TAB character, not spaces.

---

**3a. Build the project**

```bash
make
```

**Expected output:**
```
gcc -Wall -g -c principal.c -o principal.o
gcc -Wall -g -c tableau.c -o tableau.o
gcc -o principal principal.o tableau.o
Build complete: principal
```

---

**3b. Test the executable**

```bash
./principal
```

**Expected output:**
```
Array size: 10000
First 10 values: 0 2 4 6 8 10 12 14 16 18 
After inverse, first 10: 19998 19996 19994 19992 19990 19988 19986 19984 19982 19980 
```

---

**3c. Test incremental build (only changed files recompiled)**

```bash
touch principal.c
make
```

**Expected output (only principal.c recompiled):**
```
gcc -Wall -g -c principal.c -o principal.o
gcc -o principal principal.o tableau.o
Build complete: principal
```

```bash
touch commun.h
make
```

**Expected output (both recompiled because both depend on commun.h):**
```
gcc -Wall -g -c principal.c -o principal.o
gcc -Wall -g -c tableau.c -o tableau.o
gcc -o principal principal.o tableau.o
Build complete: principal
```

---

**3d. Measure compilation time**

```bash
make clean
time make
```

**Expected output:**
```
real    0m0.45s
user    0m0.30s
sys     0m0.10s
```

**Makefile variable reference:**

| Variable | Meaning |
|----------|---------|
| `CC = gcc` | Compiler |
| `CFLAGS = -Wall -g` | Compiler flags (all warnings + debug symbols) |
| `$(SOURCES:.c=.o)` | Text substitution: replace `.c` with `.o` |
| `$@` | Target name |
| `$<` | First prerequisite |
| `$^` | All prerequisites |
| `%.o: %.c` | Pattern rule |
| `.PHONY` | Declares non-file targets |

---

## Exercise 4

### Debugging with GDB: set breakpoints, step through code, inspect variables, analyze function calls

**4a. Start GDB**

**Answer:**

```bash
make clean && make    # CFLAGS includes -g by default
gdb ./principal
```

---

**4b. Set breakpoints and run**

```
(gdb) break main
Breakpoint 1 at 0x...: file principal.c, line 6.

(gdb) break inverseValeurs
Breakpoint 2 at 0x...: file tableau.c, line 18.

(gdb) run
Breakpoint 1, main () at principal.c:6
```

---

**4c. Step through and inspect**

```
(gdb) next
7	    int n = TAILLE;

(gdb) print n
$1 = 10000

(gdb) continue
Breakpoint 2, inverseValeurs (tab=0x7fff..., n=10000) at tableau.c:18

(gdb) info locals
i = 0
temp = 0

(gdb) info args
tab = 0x7fff...
n = 10000

(gdb) print tab[0]@10
$2 = {0, 2, 4, 6, 8, 10, 12, 14, 16, 18}

(gdb) quit
```

**Essential GDB commands:**

| Command | Short | Purpose |
|---------|-------|---------|
| `run` | `r` | Start program |
| `break func` | `b func` | Breakpoint at function |
| `break file:line` | `b file:42` | Breakpoint at line |
| `continue` | `c` | Continue to next breakpoint |
| `next` | `n` | Step over |
| `step` | `s` | Step into |
| `finish` | -- | Run until function returns |
| `print var` | `p var` | Print variable value |
| `print arr[0]@10` | -- | Print 10 array elements |
| `info locals` | -- | Show local variables |
| `backtrace` | `bt` | Show call stack |
| `quit` | `q` | Exit GDB |

---

## Exercise 5

### Performance Profiling with gprof: compile with `-pg`, run program, analyze with `gprof program gmon.out`, identify bottlenecks

**5a. Build with profiling**

**Answer:**

```bash
make clean
make profile
```

---

**5b. Run and generate profile data**

```bash
./principal
ls -la gmon.out    # Should exist
```

---

**5c. Analyze the profile**

```bash
gprof principal gmon.out > analysis.txt
head -30 analysis.txt
```

**Expected output (flat profile):**
```
  %   cumulative   self              self     total
 time   seconds   seconds    calls  s/call   s/call  name
 44.50      0.44     0.44 1394467004  0.00     0.00  getValeur
 24.24      0.68     0.24        1   0.24     0.68  inverseValeurs
 20.20      0.88     0.20       1    0.20     0.20  lireValeur
  8.08      0.96     0.08 10000      0.00     0.00  setValeur
  2.02      0.98     0.02       1    0.02     0.02  afficheValeur
```

**Analysis:** `getValeur` uses 44.5% of time, called ~1.4 billion times. The bottleneck is function call overhead -- direct array access would eliminate it.

---

## Exercise 6

### Optimization Comparison: build with different optimization levels and compare execution time

**6a. Non-optimized build**

**Answer:**

```bash
gcc -pg -O0 -o principal_O0 principal.c tableau.c
time ./principal_O0
```

---

**6b. Optimized build**

```bash
gcc -pg -O3 -o principal_O3 principal.c tableau.c
time ./principal_O3
```

---

**6c. Compare profiles**

```bash
./principal_O0
gprof principal_O0 gmon.out > profile_O0.txt

./principal_O3
gprof principal_O3 gmon.out > profile_O3.txt
```

**Key differences:**
- `-O3` significantly reduces execution time (often 5-10x faster)
- Some functions disappear from the profile (compiler inlined them)
- `getValeur`/`setValeur` calls may be eliminated entirely (inlined)
- Call counts may differ (loop unrolling)
