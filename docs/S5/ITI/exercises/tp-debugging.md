---
title: "TP6 - FUS6: Advanced Debugging & Profiling"
sidebar_position: 3
---

# TP6 - FUS6: Advanced Debugging & Profiling

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp6_debugging/README.md

## Advanced GDB Features

### Watchpoints: break when a variable changes, without knowing which function changes it

**Answer:**

```bash
# Compile the buggy program
gcc -g -O0 -Wall -o buggy buggy.c
gdb ./buggy
```

```
(gdb) break main
Breakpoint 1 at 0x...

(gdb) run
Breakpoint 1, main () at buggy.c:5

(gdb) next
(gdb) next
(gdb) next

(gdb) watch arr[5]
Hardware watchpoint 2: arr[5]

(gdb) continue
Hardware watchpoint 2: arr[5]

Old value = <uninitialized>
New value = 50
main () at buggy.c:17

(gdb) print i
$1 = 5

(gdb) print arr[5]
$2 = 50
```

**Watchpoint types:**
```
(gdb) watch myvar            # Break when myvar is WRITTEN
(gdb) rwatch myvar           # Break when myvar is READ
(gdb) awatch myvar           # Break on read OR write
(gdb) watch *0x7fff1234      # Watch a specific memory address
```

---

### Conditional Breakpoints: break only when a condition is met

**Answer:**

```
(gdb) delete                          # Remove all breakpoints

(gdb) break buggy.c:17 if i == 10
Breakpoint 3 at 0x...

(gdb) run
Breakpoint 3, main () at buggy.c:17

(gdb) print i
$3 = 10

(gdb) print arr[10]
$4 = 100
```

This catches the buffer overflow at iteration `i == 10` (array indices 0-9 only).

```
(gdb) break main
Breakpoint 4 at 0x...

(gdb) condition 4 argc > 2    # Add condition to existing breakpoint
(gdb) condition 4              # Remove condition
```

---

### GDB Command Scripts: automate debugging workflows

**Answer:**

```bash
cat > debug_commands.gdb << 'EOF'
# Automated GDB script for buggy.c
break main
run
echo === At main() entry ===\n
info locals
next
next
next
echo === After variable declarations ===\n
print x
echo --- x was uninitialized (Bug 1) ---\n
break buggy.c:17 if i == 10
continue
echo === Buffer overflow iteration ===\n
print i
print arr[9]
echo --- arr[10] is out of bounds (Bug 2) ---\n
continue
quit
EOF
```

```bash
gdb -x debug_commands.gdb ./buggy
```

**Expected output:**
```
=== At main() entry ===
...
=== After variable declarations ===
$1 = 32767   (or some random value -- uninitialized!)
--- x was uninitialized (Bug 1) ---
...
=== Buffer overflow iteration ===
$2 = 10
$3 = 90
--- arr[10] is out of bounds (Bug 2) ---
```

---

### Custom GDB command

```
(gdb) define print_array
>set $i = 0
>while $i < $arg0
  >print arr[$i]
  >set $i = $i + 1
  >end
>end

(gdb) print_array 5
$1 = 0
$2 = 10
$3 = 20
$4 = 30
$5 = 40
```

---

## Valgrind

### Use Valgrind to detect memory errors: uninitialized values, buffer overflows, memory leaks, and double frees

**Basic check:**

**Answer:**

```bash
gcc -g -O0 -Wall -o buggy buggy.c
valgrind ./buggy
```

**Expected output:**
```
==12345== Conditional jump or move depends on uninitialised value(s)
==12345==    at 0x...: main (buggy.c:11)
==12345== 
Value: 42
==12345== 
==12345== HEAP SUMMARY:
==12345==     in use at exit: 400 bytes in 1 blocks
==12345== 
==12345== LEAK SUMMARY:
==12345==    definitely lost: 400 bytes in 1 blocks
```

---

**Full leak check:**

```bash
valgrind --leak-check=full ./buggy
```

**Expected output:**
```
==12345== 400 bytes in 1 blocks are definitely lost in loss record 1 of 1
==12345==    at 0x...: malloc (...)
==12345==    by 0x...: main (buggy.c:22)
```

---

**Track origins of uninitialized values:**

```bash
valgrind --track-origins=yes ./buggy
```

**Expected output:**
```
==12345== Conditional jump or move depends on uninitialised value(s)
==12345==    at 0x...: main (buggy.c:11)
==12345==  Uninitialised value was created by a stack allocation
==12345==    at 0x...: main (buggy.c:5)
```

---

**Common Valgrind errors and fixes:**

| Error | Cause | Fix |
|-------|-------|-----|
| "Conditional jump depends on uninitialised value" | Reading before assigning | `int x = 0;` |
| "Invalid write of size 4" | Writing past array bounds | `i <= 10` -> `i < 10` |
| "definitely lost: N bytes" | `malloc` without `free` | Add `free(ptr);` |
| "Invalid read of size 4" | Reading freed memory | Do not access after `free` |
| "Invalid free()" | Double free | Set `ptr = NULL` after free |

---

## Git Merge Conflict Exercise

### Create a merge conflict using burger HTML files, then resolve it manually

**Setup:**

**Answer:**

```bash
git init merge_demo && cd merge_demo

cat > recette.html << 'EOF'
<!doctype html>
<html>
	<head><meta charset="utf-8"></head>
	<body>
		<h1>Burger</h1>
		<ul>
			<li>pain</li>
			<li>steak</li>
			<li>salade</li>
		</ul>
	</body>
</html>
EOF

git add recette.html
git commit -m "Initial burger recipe"
```

---

**Create two branches with conflicting changes:**

```bash
# Branch A: add toppings
git checkout -b toppings
# Add: cornichon, tabasco, tomates after salade
git add recette.html
git commit -m "Add toppings: cornichon, tabasco, tomates"

# Branch B: add cheese
git checkout main
git checkout -b cheese
# Add: emmental, cheddar after salade
git add recette.html
git commit -m "Add cheese: emmental, cheddar"
```

---

**Merge and resolve conflict:**

```bash
git checkout main
git merge toppings      # Fast-forward (no conflict)
git merge cheese        # CONFLICT!
```

**Expected output:**
```
CONFLICT (content): Merge conflict in recette.html
Automatic merge failed; fix conflicts and then commit the result.
```

---

**Examine conflict markers:**

```bash
cat recette.html
```

**Expected content:**
```html
<<<<<<< HEAD
			<li>cornichon</li>
			<li>tabasco</li>
			<li>tomates</li>
=======
			<li>emmental</li>
			<li>cheddar</li>
>>>>>>> cheese
```

---

**Resolve by keeping both:**

Edit `recette.html` to remove markers and keep all ingredients:

```html
<!doctype html>
<html>
	<head><meta charset="utf-8"></head>
	<body>
		<h1>Cheeseburger Deluxe</h1>
		<ul>
			<li>pain</li>
			<li>steak</li>
			<li>salade</li>
			<li>cornichon</li>
			<li>tabasco</li>
			<li>tomates</li>
			<li>emmental</li>
			<li>cheddar</li>
		</ul>
	</body>
</html>
```

```bash
git add recette.html
git commit -m "Merge toppings and cheese into cheeseburger deluxe"
git log --oneline --graph --all
```

**Expected output:**
```
*   abc1234 Merge toppings and cheese into cheeseburger deluxe
|\
| * def5678 Add cheese: emmental, cheddar
* | ghi9012 Add toppings: cornichon, tabasco, tomates
|/
* jkl3456 Initial burger recipe
```

---

## Debugging Strategy Reference

| Problem | Tool | Key Commands |
|---------|------|--------------|
| Logic error (wrong output) | GDB | `break`, `print`, `step`, `next` |
| Crash / segfault | GDB | `run`, `backtrace`, `info locals` |
| Memory leak | Valgrind | `--leak-check=full` |
| Buffer overflow | Valgrind | default (detects invalid write) |
| Uninitialized memory | Valgrind | `--track-origins=yes` |
| Performance bottleneck | Gprof | `gcc -pg`, `gprof` |
| Data corruption | GDB watchpoints | `watch variable` |
| Program hangs | GDB | Ctrl+C then `backtrace` |
