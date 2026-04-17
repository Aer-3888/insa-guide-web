---
title: "TP3 - Graph Algorithms in ARM Assembly"
sidebar_position: 3
---

# TP3 - Graph Algorithms in ARM Assembly

> Following teacher instructions from: S5/CLP/data/moodle/tp/tp3/README.md

This TP implements graph algorithms in ARM assembly: depth-first search (DFS), vertex search, and entry point detection. Four files work together: `main.s` (graph data definition), `rechercheSommet.s` (find vertex index by name), `estPointEntree.s` (entry point check), and `dfs.s` (DFS traversal).

---

## Exercise 1: Graph Data Structure (main.s)

### Define the graph structure and its memory layout

**Question:** Define the C-equivalent graph structure, its assembly constants, and the complete data definition.

**Answer:**

**C equivalent:**
```c noexec
struct Graph {
    int   nbSommets;     // offset 0:  number of vertices
    char* nom;           // offset 4:  pointer to array of vertex names
    int*  nbSucc;        // offset 8:  pointer to array of successor counts
    char**lesSuccs;      // offset 12: pointer to array of pointers to successor strings
};
```

**Assembly constants and data:**
```arm
.equ offsetGrapheNbSommets, 0   @ 4 bytes: int
.equ offsetGrapheNom, 4         @ 4 bytes: pointer
.equ offsetGrapheNbSucc, 8      @ 4 bytes: pointer
.equ offsetGrapheLesSuccs, 12   @ 4 bytes: pointer

.data
nom:     .ascii "abcde"          @ 5 bytes: vertex names (NOT null-terminated)
.align                           @ Pad to 4-byte boundary

nbSucc:  .word 1, 2, 1, 1, 2    @ Successor counts: a=1, b=2, c=1, d=1, e=2

@ Successor arrays (strings of vertex names)
b:       .ascii "b"              @ Successors of 'a': just 'b'
.align
cd:      .ascii "cd"             @ Successors of 'b': 'c' and 'd'
.align
d:       .ascii "d"              @ Successors of 'c': just 'd'
.align
e:       .ascii "e"              @ Successors of 'd': just 'e'
.align
bc:      .ascii "bc"             @ Successors of 'e': 'b' and 'c'
.align

@ Array of pointers to successor strings
lesSucc: .word b, cd, d, e, bc   @ 5 pointers (20 bytes)

@ The graph structure itself (4 words = 16 bytes)
g:
  .word 5                        @ nbSommets = 5
  .word nom                      @ pointer to "abcde"
  .word nbSucc                   @ pointer to [1, 2, 1, 1, 2]
  .word lesSucc                  @ pointer to [b, cd, d, e, bc]

@ DFS marking array (1 byte per vertex)
marquer:
  .byte 0, 0, 0, 0, 0           @ All unvisited initially
  .align
```

**Graph visualization:**
```
    a ----> b <----+
           / \     |
          v   v    |
          c   d    |
           \ /     |
            v      |
            e -----+
            |
            +----> c
```

Edges: a->b, b->c, b->d, c->d, d->e, e->b, e->c

**How it works:** The graph structure uses 4 pointers stored as 4 consecutive words. The vertex names are stored as raw ASCII bytes (NOT null-terminated). The successor lists use an array-of-pointers pattern: `lesSuccs[i]` is a pointer to a character array, and `lesSuccs[i][j]` is the j-th successor of vertex i.

---

### Set up the _start entry point for DFS

**Question:** How does `_start` prepare the parameters and call DFS?

**Answer:**

```arm
.text
.global _start

_start:
  mov r0, #'a'                  @ r0 = starting vertex ('a' = 0x61)
  ldr r1, =g                    @ r1 = address of graph structure
  ldr r2, =marquer              @ r2 = address of marking array

  stmfd sp!, {r2, r1, r0}       @ Push parameters: (marquer, g, v) from top

  bl dfs                        @ Call depth-first search

end:
  b end                         @ Infinite loop - halt execution
```

**How it works:** Three parameters are pushed onto the stack. The DFS function modifies the `marquer` array in place -- after DFS from 'a', all reachable vertices will have `marquer[i] = 1`.

---

## Exercise 2: rechercheSommet.s -- Vertex Search

### Implement linear search through vertex names

**Question:** Implement `rechercheSommet(sommet, g)` that returns the index of a vertex given its character name.

**Answer:**

**Algorithm:**
```
rechercheSommet(sommet='c', g):
  i = 0
  g.nom[0] = 'a' != 'c', i=1
  g.nom[1] = 'b' != 'c', i=2
  g.nom[2] = 'c' == 'c', return 2
```

**Stack frame:**
```
+------------------+
| 'c' (sommet)     |  FP + 16  [fp, #offsetSommet]
+------------------+
| addr of g        |  FP + 12  [fp, #offsetG]
+------------------+
| [return value]   |  FP + 8   [fp, #offsetReturnValue]
+------------------+
| saved LR         |  FP + 4
+------------------+
| saved FP         |  FP + 0   <-- FP
+------------------+
| i (local)        |  FP - 4   [fp, #offsetI]
+------------------+
| saved r0,r1,r2   |  <-- SP
+------------------+
```

**Complete assembly:**
```arm
rechercheSommet:
  stmfd sp!, {fp, lr}         @ Push FP and LR
  mov fp, sp                  @ FP = SP
  sub sp, #4                  @ Allocate 1 local variable (i)
  stmfd sp!, {r0, r1, r2}    @ Save registers

  mov r0, #0                  @ r0 = 0
  str r0, [fp, #offsetI]     @ i = 0

loop:
  ldr r0, [fp, #offsetI]     @ r0 = i
  ldr r1, [fp, #offsetG]     @ r1 = address of graph structure g
  add r1, #offsetGrapheNom   @ r1 = &(g.nom)  [address of the nom FIELD]
  ldr r1, [r1]               @ r1 = g.nom      [value = pointer to "abcde"]
  ldrb r1, [r1, r0]          @ r1 = g.nom[i]   [byte at index i]

  ldr r2, [fp, #offsetSommet] @ r2 = sommet (target character)
  cmp r1, r2                  @ Compare g.nom[i] with sommet
  beq endloop                 @ Found it

  add r0, #1                  @ i++
  str r0, [fp, #offsetI]
  b loop

endloop:
  ldr r0, [fp, #offsetI]     @ r0 = i (the found index)
  str r0, [fp, #offsetReturnValue]  @ Store return value

  ldmfd sp!, {r0, r1, r2}    @ Restore registers
  add sp, #4                  @ Free local variable
  ldmfd sp!, {fp, lr}        @ Restore FP and LR
  bx lr                       @ Return
```

**How it works:** The key pattern is the three-level dereference to access `g.nom[i]`:
1. `ldr r1, [fp, #offsetG]` -- load graph struct address
2. `add r1, #offsetGrapheNom` then `ldr r1, [r1]` -- load the nom field (a pointer)
3. `ldrb r1, [r1, r0]` -- load byte at pointer + index i

**LDRB** is critical: it loads a single byte (character), not a 4-byte word. Using `LDR` would load 4 adjacent bytes and contaminate the register.

---

## Exercise 3: estPointEntree.s -- Entry Point Detection

### Check if a vertex has no incoming edges

**Question:** Implement `estPointEntree(sommet, g)` that returns 1 if the vertex is an entry point (no incoming edges), 0 otherwise.

**Answer:**

**Algorithm:**
```
estPointEntree(sommet, g):
  for i = 0 to g.nbSommets - 1:       // for each vertex
    for j = 0 to g.nbSucc[i] - 1:     // for each successor
      if g.lesSuccs[i][j] == sommet:
        return 0                        // found incoming edge
  return 1                              // no incoming edges found
```

**Complete assembly:**
```arm
estPointEntree:
  stmfd sp!, {fp, lr}
  mov fp, sp
  sub sp, #8                    @ Allocate local variables (i, j)
  stmfd sp!, {r0, r1, r2, r3, r4, r5, r6, r7}

  mov r0, #0
  str r0, [fp, #offsetI]       @ i = 0

loopI:
  ldr r0, [fp, #offsetI]
  ldr r1, [fp, #offsetG]
  ldr r2, [r1, #offsetGrapheNbSommets]
  cmp r0, r2                   @ i < g.nbSommets ?
  bge endLoopI

  mov r3, #0
  str r3, [fp, #offsetJ]       @ j = 0

loopJ:
  ldr r3, [fp, #offsetJ]
  ldr r4, [r1, #offsetGrapheNbSucc]
  ldr r4, [r4, r0, lsl #2]    @ r4 = g.nbSucc[i]  (word access, scaled by 4)
  cmp r3, r4                   @ j < nbSucc[i] ?
  bge endLoopJ

  @ Check if g.lesSuccs[i][j] == sommet
  ldr r5, [r1, #offsetGrapheLesSuccs]
  ldr r5, [r5, r0, lsl #2]    @ r5 = g.lesSuccs[i]  (pointer to successor string)
  ldrb r5, [r5, r3]           @ r5 = g.lesSuccs[i][j]  (character, byte access)
  ldr r6, [fp, #offsetSommet]
  cmp r5, r6
  bne else

  mov r7, #0                   @ Found incoming edge: return 0
  b return

else:
  add r3, #1                   @ j++
  str r3, [fp, #offsetJ]
  b loopJ

endLoopJ:
  add r0, #1                   @ i++
  str r0, [fp, #offsetI]
  b loopI

endLoopI:
  mov r7, #1                   @ No incoming edges: return 1

return:
  str r7, [fp, #offsetReturnValue]
  ldmfd sp!, {r0, r1, r2, r3, r4, r5, r6, r7}
  add sp, #8
  ldmfd sp!, {fp, lr}
  bx lr
```

**How it works:** The critical pattern for accessing `lesSuccs[i][j]` is:
- `ldr r5, [r5, r0, lsl #2]` -- load pointer from word array (scale by 4 because pointers are 4 bytes)
- `ldrb r5, [r5, r3]` -- load byte from character array (no scaling, characters are 1 byte)

**Execution trace for sommet='a':**
```
i=0 (a): successors="b"   -> j=0: 'b' != 'a', j=1: exit
i=1 (b): successors="cd"  -> j=0: 'c' != 'a', j=1: 'd' != 'a', j=2: exit
i=2 (c): successors="d"   -> j=0: 'd' != 'a', j=1: exit
i=3 (d): successors="e"   -> j=0: 'e' != 'a', j=1: exit
i=4 (e): successors="bc"  -> j=0: 'b' != 'a', j=1: 'c' != 'a', j=2: exit
i=5: exit outer loop
Return 1 -- 'a' IS an entry point
```

---

## Exercise 4: dfs.s -- Depth-First Search

### Implement recursive DFS traversal

**Question:** Implement `dfs(v, g, marquer)` that performs a depth-first search marking visited vertices.

**Answer:**

**Stack frame:**
```
+------------------+
| v (vertex char)  |  FP + 16  [fp, #offsetV]
+------------------+
| g (graph ptr)    |  FP + 12  [fp, #offsetG]
+------------------+
| marquer (ptr)    |  FP + 8   [fp, #offsetMarquer]
+------------------+
| saved LR         |  FP + 4
+------------------+
| saved FP         |  FP + 0   <-- FP
+------------------+
| i_v              |  FP - 4   (index of current vertex)
+------------------+
| i_w              |  FP - 8   (index of successor)
+------------------+
| (unused)         |  FP - 12, FP - 16
+------------------+
| j                |  FP - 20  (loop counter)
+------------------+
| w                |  FP - 24  (successor character)
+------------------+
| saved r0-r4      |  <-- SP
+------------------+
```

**Complete assembly:**
```arm
dfs:
  stmfd sp!, {fp, lr}
  mov fp, sp
  sub sp, #20                  @ Allocate 5 local variables (20 bytes)
  stmfd sp!, {r0, r1, r2, r3, r4}

  @ Step 1: Find index of current vertex
  ldr r0, [fp, #offsetV]       @ r0 = v (vertex character)
  ldr r1, [fp, #offsetG]       @ r1 = g (graph pointer)
  stmfd sp!, {r1, r0}          @ Push (g, v) as arguments
  sub sp, #4                   @ Reserve return value space
  bl rechercheSommet
  ldmfd sp!, {r0}              @ r0 = returned index
  str r0, [fp, #offsetI_v]    @ i_v = index
  add sp, #8                   @ Clean up arguments

  @ Step 2: Mark vertex as visited
  ldr r0, [fp, #offsetMarquer] @ r0 = marquer array pointer
  ldr r1, [fp, #offsetI_v]    @ r1 = i_v
  mov r2, #1
  strb r2, [r0, r1]           @ marquer[i_v] = 1  (STRB for byte store)

  @ Step 3: Initialize successor loop
  mov r0, #0
  str r0, [fp, #offsetJ]      @ j = 0

loop:
  @ Step 4: Check j < g.nbSucc[i_v]
  ldr r0, [fp, #offsetJ]
  ldr r1, [fp, #offsetG]
  ldr r2, [r1, #offsetGrapheNbSucc]
  ldr r3, [fp, #offsetI_v]
  ldr r2, [r2, r3, lsl #2]    @ r2 = g.nbSucc[i_v]
  cmp r0, r2
  bge endLoop

  @ Step 5: Get successor w = g.lesSuccs[i_v][j]
  ldr r2, [r1, #offsetGrapheLesSuccs]
  ldr r2, [r2, r3, lsl #2]    @ r2 = g.lesSuccs[i_v] (pointer)
  ldrb r2, [r2, r0]           @ r2 = g.lesSuccs[i_v][j] (character)
  str r2, [fp, #offsetW]

  @ Step 6: Find index of successor
  stmfd sp!, {r1, r2}          @ Push (g, w) as arguments
  sub sp, #4
  bl rechercheSommet
  ldmfd sp!, {r4}              @ r4 = i_w
  add sp, #8
  str r4, [fp, #offsetI_w]

  @ Step 7: Check if successor is visited
  ldr r3, [fp, #offsetMarquer]
  ldrb r3, [r3, r4]           @ r3 = marquer[i_w]
  cmp r3, #0
  bne else                     @ Skip if already visited

  @ Step 8: Recursive DFS on unvisited successor
  ldr r3, [fp, #offsetMarquer]
  stmfd sp!, {r3, r1, r2}     @ Push (marquer, g, w) as arguments
  bl dfs                       @ Recursive call
  add sp, #12                  @ Clean up 3 arguments

else:
  @ Step 9: Increment and continue
  ldr r0, [fp, #offsetJ]
  add r0, r0, #1               @ j++
  str r0, [fp, #offsetJ]
  b loop

endLoop:
  ldmfd sp!, {r0, r1, r2, r3, r4}
  add sp, #20
  ldmfd sp!, {fp, lr}
  bx lr
```

---

### Complete DFS execution trace from vertex 'a'

**Question:** Trace the full DFS starting from `dfs('a', g, marquer)` with marquer = [0,0,0,0,0].

**Answer:**

**Call 1: dfs('a', g, marquer)**
```
rechercheSommet('a', g) -> i_v = 0
marquer[0] = 1                          marquer = [1,0,0,0,0]
j=0: nbSucc[0]=1, w=lesSuccs[0][0]='b', i_w=1, marquer[1]==0 -> RECURSE dfs('b')
```

**Call 2: dfs('b', g, marquer)**
```
rechercheSommet('b', g) -> i_v = 1
marquer[1] = 1                          marquer = [1,1,0,0,0]
j=0: nbSucc[1]=2, w=lesSuccs[1][0]='c', i_w=2, marquer[2]==0 -> RECURSE dfs('c')
```

**Call 3: dfs('c', g, marquer)**
```
rechercheSommet('c', g) -> i_v = 2
marquer[2] = 1                          marquer = [1,1,1,0,0]
j=0: nbSucc[2]=1, w=lesSuccs[2][0]='d', i_w=3, marquer[3]==0 -> RECURSE dfs('d')
```

**Call 4: dfs('d', g, marquer)**
```
rechercheSommet('d', g) -> i_v = 3
marquer[3] = 1                          marquer = [1,1,1,1,0]
j=0: nbSucc[3]=1, w=lesSuccs[3][0]='e', i_w=4, marquer[4]==0 -> RECURSE dfs('e')
```

**Call 5: dfs('e', g, marquer)**
```
rechercheSommet('e', g) -> i_v = 4
marquer[4] = 1                          marquer = [1,1,1,1,1]
j=0: w='b', i_w=1, marquer[1]==1 -> SKIP
j=1: w='c', i_w=2, marquer[2]==1 -> SKIP
j=2: j >= nbSucc[4]=2 -> EXIT LOOP, RETURN
```

**Unwinding:**
```
Call 5 returns -> Call 4: j=1 >= nbSucc[3]=1, exit, RETURN
Call 4 returns -> Call 3: j=1 >= nbSucc[2]=1, exit, RETURN
Call 3 returns -> Call 2: j=1, w='d', i_w=3, marquer[3]==1 -> SKIP
                          j=2 >= nbSucc[1]=2, exit, RETURN
Call 2 returns -> Call 1: j=1 >= nbSucc[0]=1, exit, RETURN
```

**Final state:** `marquer = [1, 1, 1, 1, 1]` -- all vertices visited.

**DFS traversal order:** a -> b -> c -> d -> e

**Maximum recursion depth:** 5 (equal to number of vertices).

---

## Key Concepts Summary

### Byte vs Word Access

| Data Type | Load | Store | Index Scaling | Example |
|-----------|------|-------|---------------|---------|
| char (1 byte) | `LDRB` | `STRB` | none | `ldrb r1, [r0, r2]` |
| int (4 bytes) | `LDR` | `STR` | `lsl #2` (x4) | `ldr r1, [r0, r2, lsl #2]` |
| pointer (4 bytes) | `LDR` | `STR` | `lsl #2` (x4) | `ldr r1, [r0, r2, lsl #2]` |

### Scaled Indexing

`ldr rd, [rn, rm, lsl #n]` computes effective address `rn + (rm << n)`:
- `lsl #0` -- byte array (no scaling)
- `lsl #2` -- word array (multiply index by 4)

### Common Mistakes

- **Using LDR for characters:** Loads 4 bytes instead of 1, contaminating the register with adjacent memory
- **Forgetting `lsl #2` for word arrays:** Reads from wrong address (offset is in bytes, not words)
- **Missing pointer dereference:** `lesSuccs` is a pointer to an array of pointers -- must dereference twice
