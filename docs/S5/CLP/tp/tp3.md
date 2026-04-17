---
title: "TP3 - Graph Algorithms in ARM Assembly"
sidebar_position: 3
---

# TP3 - Graph Algorithms in ARM Assembly

## Overview

This lab implements graph algorithms in ARM assembly, focusing on data structure representation, pointer manipulation, and recursive traversal. The exercises demonstrate how to work with complex data structures (graphs) in low-level programming.

## Exercises

### 1. main.s
Graph definition and program entry point. Defines a directed graph structure with 5 vertices (a-e) and initializes the marking array for DFS.

### 2. dfs.s
Depth-First Search (DFS) implementation - recursively traverses a graph marking visited vertices.

### 3. rechercheSommet.s
Vertex search function - finds the index of a vertex given its character name.

### 4. estPointEntree.s
Entry point detection - determines if a given vertex is an entry point (has no incoming edges).

## Graph Data Structure

### Structure Definition

The graph is represented as a C-like structure:

```c noexec
struct Graph {
    int nbSommets;          // Number of vertices
    char *nom;              // Array of vertex names (characters)
    int *nbSucc;            // Array of successor counts per vertex
    char **lesSuccs;        // Array of pointers to successor arrays
};
```

### Memory Layout

```
Offset 0:  nbSommets (4 bytes)     - Number of vertices
Offset 4:  nom (4 bytes)           - Pointer to names array
Offset 8:  nbSucc (4 bytes)        - Pointer to successor counts
Offset 12: lesSuccs (4 bytes)      - Pointer to successor arrays
```

**Accessing structure members**:
```assembly
.equ offsetGrapheNbSommets, 0
.equ offsetGrapheNom, 4
.equ offsetGrapheNbSucc, 8
.equ offsetGrapheLesSuccs, 12

ldr r1, [fp, #offsetG]              @ r1 = address of graph structure
ldr r2, [r1, #offsetGrapheNbSommets] @ r2 = g.nbSommets
ldr r3, [r1, #offsetGrapheNom]      @ r3 = g.nom (pointer to names)
```

### Example Graph

The graph defined in `main.s`:

```
Vertices: a, b, c, d, e (5 vertices)

Edges (adjacency list):
  a → b         (1 successor)
  b → c, d      (2 successors)
  c → d         (1 successor)
  d → e         (1 successor)
  e → b, c      (2 successors)
```

**Visual representation**:
```
    a
    ↓
    b ←─────┐
   ↙ ↘      │
  c   d     │
   ↘ ↙      │
    e ──────┘
```

### Memory Representation

```assembly
nom:     .ascii "abcde"              @ Vertex names
nbSucc:  .word 1, 2, 1, 1, 2         @ Successors per vertex
b:       .ascii "b"                  @ Successors of 'a'
cd:      .ascii "cd"                 @ Successors of 'b'
d:       .ascii "d"                  @ Successors of 'c'
e:       .ascii "e"                  @ Successors of 'd'
bc:      .ascii "bc"                 @ Successors of 'e'
lesSucc: .word b, cd, d, e, bc       @ Pointers to successor arrays

g:                                   @ Graph structure
  .word 5                            @ nbSommets
  .word nom                          @ Pointer to names
  .word nbSucc                       @ Pointer to successor counts
  .word lesSucc                      @ Pointer to successor arrays

marquer: .byte 0, 0, 0, 0, 0         @ Marking array (visited flags)
```

## Key ARM Concepts Demonstrated

### 1. Structure Member Access

**Accessing g.nbSommets**:
```assembly
ldr r1, [fp, #offsetG]              @ Load graph pointer
ldr r2, [r1, #offsetGrapheNbSommets] @ Load nbSommets field
```

**Accessing g.nom[i]** (character at index i):
```assembly
ldr r1, [fp, #offsetG]              @ Load graph pointer
ldr r2, [r1, #offsetGrapheNom]      @ Load nom pointer
ldrb r3, [r2, r0]                   @ Load byte at offset r0
```

### 2. Array of Pointers

**Accessing g.lesSuccs[i][j]** (j-th successor of vertex i):
```assembly
ldr r1, [fp, #offsetG]              @ r1 = graph address
ldr r2, [r1, #offsetGrapheLesSuccs] @ r2 = lesSuccs array
ldr r3, [fp, #offsetI_v]            @ r3 = i (vertex index)
ldr r2, [r2, r3, lsl #2]            @ r2 = lesSuccs[i] (pointer)
ldr r0, [fp, #offsetJ]              @ r0 = j (successor index)
ldrb r2, [r2, r0]                   @ r2 = lesSuccs[i][j] (character)
```

**Breakdown**:
1. `ldr r2, [r2, r3, lsl #2]` - Load pointer from array with scaled index
   - `r3, lsl #2` = r3 × 4 (word alignment)
   - Equivalent to `lesSuccs[i]`
2. `ldrb r2, [r2, r0]` - Load byte from successor string
   - Byte access for characters (LDRB vs LDR)

### 3. Byte vs Word Access

**LDRB/STRB for characters**:
```assembly
ldrb r2, [r0, r1]                   @ Load 8-bit character
strb r2, [r3, r4]                   @ Store 8-bit value
```

**LDR/STR for integers**:
```assembly
ldr r2, [r0, r1, lsl #2]            @ Load 32-bit word (scaled index)
str r2, [r3, r4, lsl #2]            @ Store 32-bit word
```

**Why the difference?**
- Characters (char) = 1 byte → use LDRB/STRB
- Integers (int) = 4 bytes → use LDR/STR with scaled indexing

### 4. Scaled Indexing

**Format**: `ldr rd, [rn, rm, lsl #n]`
- Base address: rn
- Index: rm
- Scale: shift left by n bits (multiply by 2^n)
- Effective address: rn + (rm << n)

**Example for array access**:
```assembly
ldr r2, [r1, r3, lsl #2]            @ r2 = *(r1 + r3*4)
```

**Use cases**:
- `lsl #0` - Byte array (no scaling)
- `lsl #1` - Half-word array (16-bit, ×2)
- `lsl #2` - Word array (32-bit, ×4)
- `lsl #3` - Double-word array (64-bit, ×8)

## Algorithm Details

### Depth-First Search (dfs.s)

**Pseudocode**:
```
function dfs(v, g, marquer):
    i_v = rechercheSommet(v, g)
    marquer[i_v] = 1
    
    for j = 0 to g.nbSucc[i_v] - 1:
        w = g.lesSuccs[i_v][j]
        i_w = rechercheSommet(w, g)
        if marquer[i_w] == 0:
            dfs(w, g, marquer)
```

**Key operations**:
1. Find vertex index in graph
2. Mark vertex as visited
3. Iterate through all successors
4. Recursively visit unvisited successors

**Stack frame**:
```
[fp, #16] - v (vertex character)
[fp, #12] - g (graph pointer)
[fp, #8]  - marquer (marking array pointer)
[fp, #-4] - i_v (local: vertex index)
[fp, #-8] - i_w (local: successor index)
[fp, #-16] - i (local: unused?)
[fp, #-20] - j (local: loop counter)
[fp, #-24] - w (local: successor character)
```

### Vertex Search (rechercheSommet.s)

**Pseudocode**:
```
function rechercheSommet(sommet, g):
    i = 0
    while g.nom[i] != sommet:
        i++
    return i
```

**Simple linear search** through vertex names until match found.

**Stack frame**:
```
[fp, #16] - sommet (character to search)
[fp, #12] - g (graph pointer)
[fp, #8]  - return value
[fp, #-4] - i (local loop counter)
```

### Entry Point Detection (estPointEntree.s)

**Pseudocode**:
```
function estPointEntree(sommet, g):
    for i = 0 to g.nbSommets - 1:
        for j = 0 to g.nbSucc[i] - 1:
            if g.lesSuccs[i][j] == sommet:
                return 0  // Has incoming edge
    return 1  // No incoming edges = entry point
```

**Logic**:
- Checks if any vertex has `sommet` as a successor
- If found → not an entry point (return 0)
- If not found → is an entry point (return 1)

**In the example graph**:
- 'a' is an entry point (no incoming edges)
- 'b', 'c', 'd', 'e' are not entry points (have incoming edges)

## Building and Running

### Compilation
```bash
# Compile all files
arm-linux-gnueabi-as -o main.o src/main.s
arm-linux-gnueabi-as -o dfs.o src/dfs.s
arm-linux-gnueabi-as -o rechercheSommet.o src/rechercheSommet.s
arm-linux-gnueabi-as -o estPointEntree.o src/estPointEntree.s

# Link together
arm-linux-gnueabi-ld -o graph main.o dfs.o rechercheSommet.o estPointEntree.o
```

### Running
```bash
qemu-arm ./graph
```

### Debugging DFS
```bash
arm-linux-gnueabi-gdb ./graph
(gdb) break dfs
(gdb) run
(gdb) x/5xb &marquer        # Examine marking array (5 bytes)
(gdb) stepi
(gdb) x/5xb &marquer        # Check which vertices marked
```

**Expected marking after DFS from 'a'**:
```
Before: 00 00 00 00 00  (all unvisited)
After:  01 01 01 01 01  (all visited - graph is connected)
```

## Key Instructions Used

### Memory Access
- `LDR` - Load word (32-bit)
- `LDRB` - Load byte (8-bit for characters)
- `STR` - Store word
- `STRB` - Store byte

### Indexed Addressing
- `LDR rd, [rn, rm]` - Load from address rn+rm
- `LDR rd, [rn, rm, lsl #n]` - Load from rn + (rm << n)
- `ADD rd, rn, #offset` - Calculate address with offset

### Comparison
- `CMP` - Compare two values
- `BEQ` - Branch if equal
- `BNE` - Branch if not equal
- `BGE` - Branch if greater or equal
- `BLT` - Branch if less than

## Study Exercises

1. **Trace DFS**: Manually trace `dfs('a', g, marquer)` showing the call stack and marking array at each step.

2. **Modify Graph**: Add edge c→a to create a cycle. Does DFS still work?

3. **Connected Components**: Modify main.s to call DFS from each unvisited vertex to count components.

4. **BFS Implementation**: Implement breadth-first search (requires a queue structure).

5. **Cycle Detection**: Implement a function to detect if the graph has a cycle.

6. **Entry Points**: Modify main.s to find all entry points in the graph.

## Common Errors

### Wrong Indexing
**Problem**: Accessing wrong array element
**Cause**: Forgetting to scale index (×4 for words, ×1 for bytes)
**Solution**: Use `lsl #2` for word arrays, no scaling for byte arrays

### Pointer Dereferencing
**Problem**: Accessing pointer value instead of pointed-to value
**Cause**: Missing second LDR for pointer-to-pointer
**Example**:
```assembly
@ Wrong: loads pointer itself
ldr r2, [r1, #offsetGrapheLesSuccs]
ldrb r3, [r2, r0]  @ WRONG: r2 is address of array, not element

@ Correct: dereference pointer first
ldr r2, [r1, #offsetGrapheLesSuccs]  @ r2 = address of pointer array
ldr r2, [r2, r3, lsl #2]             @ r2 = pointer at index r3
ldrb r3, [r2, r0]                    @ r3 = character at offset r0
```

### Byte vs Word Confusion
**Problem**: Crash or wrong data
**Cause**: Using LDR for byte data or LDRB for word data
**Solution**: 
- Characters → LDRB/STRB
- Integers/Pointers → LDR/STR

### Stack Imbalance in Recursion
**Problem**: Crash after multiple recursive calls
**Cause**: Not cleaning up stack properly after function call
**Solution**: Match every `stmfd` with `ldmfd`, every `sub sp` with `add sp`

## Performance Considerations

### Time Complexity
- **DFS**: O(V + E) where V = vertices, E = edges
- **rechercheSommet**: O(V) linear search
- **estPointEntree**: O(V × E) nested loops

### Optimization Opportunities
1. **Binary Search**: If vertex names were sorted, use binary search O(log V)
2. **Hash Table**: Map vertex characters to indices in O(1)
3. **Adjacency Matrix**: Trade space for time - O(1) edge lookup
4. **Iterative DFS**: Use explicit stack instead of recursion

## References

- Graph algorithms: Introduction to Algorithms (CLRS)
- ARM addressing modes: `../../cours/ARM/arm-cheatsheet.pdf`
- Course materials: `../../cours/ARM/AssembleurARM - 2020-2021.pdf`
