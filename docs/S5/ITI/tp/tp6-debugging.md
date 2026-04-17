---
title: "FUS6 - Advanced Debugging & Profiling"
sidebar_position: 6
---

# FUS6 - Advanced Debugging & Profiling

## Learning Objectives

This TP extends FUS5 with advanced debugging and profiling techniques in real-world scenarios.

## Topics Covered

- Advanced gdb features (watchpoints, conditional breakpoints)
- Memory debugging with valgrind
- Performance analysis on larger codebases
- Optimization trade-offs
- Debugging multi-threaded programs

## Key Concepts

### Advanced GDB Features

**Watchpoints**: Break when a variable changes
```gdb
watch myvar
watch *0x12345678  # Watch memory address
```

**Conditional Breakpoints**: Only break when condition is true
```gdb
break main if argc > 3
break file.c:42 if pointer == NULL
```

**Command Scripts**: Automate debugging workflows
```gdb
define print_array
    set $i = 0
    while $i < $arg1
        print array[$i]
        set $i = $i + 1
    end
end
```

### Valgrind

Memory error detection tool:
```bash
valgrind --leak-check=full ./program
```

Detects:
- Memory leaks
- Use of uninitialized memory
- Invalid memory access
- Double frees

### Performance Analysis

Compare optimization levels:
- Code size impact
- Execution time differences
- Debugging difficulty with optimizations

## Reference Material

See the included PDF for detailed exercises and examples.

## Key Takeaways

1. **Use the right tool** - gdb for logic bugs, valgrind for memory issues
2. **Watchpoints are powerful** - Find when/where data gets corrupted
3. **Optimization != Always faster** - Profile to verify
4. **Debug builds vs Release builds** - Different trade-offs
