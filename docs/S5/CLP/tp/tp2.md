---
title: "TP2 - Matrix Operations in ARM Assembly"
sidebar_position: 2
---

# TP2 - Matrix Operations in ARM Assembly

## Overview

This lab focuses on multi-dimensional array manipulation in ARM assembly. Two implementations of matrix multiplication are provided, demonstrating different approaches to memory layout, address calculation, and nested loop structures.

## Exercises

### 1. matrix.s
Matrix multiplication with English-style comments and clear structure.

### 2. produitMatrices.s
French-style implementation with detailed inline comments showing offset calculations.

## Matrix Multiplication Algorithm

Given two 3×3 matrices M1 and M2, compute result matrix RES where:

```
RES[i][j] = Σ(k=0 to N-1) M1[i][k] × M2[k][j]
```

Pseudocode:
```
for i = 0 to N-1:
    for j = 0 to N-1:
        RES[i][j] = 0
        for k = 0 to N-1:
            RES[i][j] += M1[i][k] × M2[k][j]
```

## Key ARM Concepts Demonstrated

### 1. Two-Dimensional Array Memory Layout

Matrices are stored in **row-major order** (rows are contiguous in memory):

```
Matrix M[3][3]:
    [0][0] [0][1] [0][2]    →  Memory: [M00, M01, M02, M10, M11, M12, M20, M21, M22]
    [1][0] [1][1] [1][2]
    [2][0] [2][1] [2][2]
```

**Address calculation for M[i][j]**:
```
Address = base + (i × N + j) × element_size
        = base + (i × 3 + j) × 4      (for 32-bit words)
```

### 2. Address Calculation with MLA

The **MLA** (Multiply-Accumulate) instruction is perfect for array indexing:

```assembly
mov r9, #N                  @ r9 = N (3)
mla r9, r9, r0, r1         @ r9 = N*i + j (r9 = r9*r0 + r1)
mov r9, r9, LSL #2         @ r9 = (N*i + j) * 4 (shift left by 2 = multiply by 4)
ldr r6, =matrix            @ r6 = base address of matrix
add r9, r6                 @ r9 = base + offset = &matrix[i][j]
```

**Why LSL #2?**
- LSL = Logical Shift Left
- Shifting left by 2 bits multiplies by 2² = 4
- Each matrix element is 4 bytes (32-bit word)
- Faster than multiplication instruction

### 3. Nested Loop Implementation

Three nested loops with loop counter management:

```assembly
/* Outer loop: i from 0 to N-1 */
loop_i:
    ldr r0, [fp, #i_offset]     @ Load i
    cmp r0, #N                  @ Compare i with N
    bhs loop_i_out              @ Branch if i >= N (unsigned)
    
    /* Middle loop: j from 0 to N-1 */
    loop_j:
        ldr r1, [fp, #j_offset]
        cmp r1, #N
        bhs loop_j_out
        
        /* Inner loop: k from 0 to N-1 */
        loop_k:
            ldr r2, [fp, #k_offset]
            cmp r2, #N
            bhs loop_k_out
            
            @ ... computation ...
            
            add r2, r2, #1          @ k++
            str r2, [fp, #k_offset] @ Store k back
            b loop_k                @ Continue inner loop
        
        loop_k_out:
        add r1, r1, #1              @ j++
        str r1, [fp, #j_offset]
        b loop_j
    
    loop_j_out:
    add r0, r0, #1                  @ i++
    str r0, [fp, #i_offset]
    b loop_i

loop_i_out:
```

**Key Points**:
- Loop counters stored on stack (local variables)
- Must reload counter before use, store after modification
- Use `bhs` (unsigned higher or same) instead of `bge` for clarity

### 4. Local Variables on Stack

Function `produit` has three local variables (i, j, k):

```
High memory
    +------------------+
    | m2 address       |  [fp, #12]
    +------------------+
    | m1 address       |  [fp, #8]
    +------------------+
    | Saved LR         |
    +------------------+
FP->| Saved FP         |  [fp, #0]
    +------------------+
    | i (local)        |  [fp, #-4]
    +------------------+
    | j (local)        |  [fp, #-8]
    +------------------+
    | k (local)        |  [fp, #-12]
    +------------------+
    | Saved registers  |
SP->+------------------+
Low memory
```

**Allocation**:
```assembly
mov fp, sp              @ Set frame pointer
sub sp, sp, #12         @ Allocate 3 × 4 bytes for i, j, k
```

**Access**:
```assembly
.equ i_offset, -4
.equ j_offset, -8
.equ k_offset, -12

str r0, [fp, #i_offset]     @ Store value in local variable i
ldr r0, [fp, #i_offset]     @ Load value from local variable i
```

### 5. Multiply-Accumulate (MLA) Instruction

**Format**: `MLA rd, rm, rs, rn` → rd = (rm × rs) + rn

**Use in matrix multiplication**:
```assembly
@ Compute: res[i][j] += m1[i][k] * m2[k][j]

ldr r5, [...]           @ r5 = m1[i][k]
ldr r6, [...]           @ r6 = m2[k][j]
ldr r7, [r8]            @ r7 = current res[i][j]
mla r7, r6, r5, r7      @ r7 = m2[k][j] * m1[i][k] + res[i][j]
str r7, [r8]            @ Store back to res[i][j]
```

**One instruction does three operations**:
1. Multiply: m1[i][k] × m2[k][j]
2. Add: result + previous sum
3. Store in destination register

## Test Data

Both implementations use:

**Matrix M1**:
```
[ 1  2  3 ]
[ 4  5  6 ]
[ 7  8  9 ]
```

**Matrix M2**:
```
[ 1  1  1 ]
[ 2  2  2 ]
[ 3  3  3 ]
```

**Expected Result**:
```
RES[i][j] = Σ M1[i][k] × M2[k][j]

RES[0][0] = 1×1 + 2×2 + 3×3 = 1 + 4 + 9 = 14
RES[0][1] = 1×1 + 2×2 + 3×3 = 14
RES[0][2] = 1×1 + 2×2 + 3×3 = 14

RES = [ 14  14  14 ]
      [ 32  32  32 ]
      [ 50  50  50 ]
```

**Verification**:
- Row 1: (1+4+9) + (2+10+18) + (3+16+27) = 14 + 30 + 46 = 90 (sum check)
- Row 2: (4+10+18) + (8+20+36) + (12+30+54) = 32 + 64 + 96 = 192

## Memory Sections

### .data Section
```assembly
.data
m1: .word 1, 2, 3, 4, 5, 6, 7, 8, 9    @ 3×3 matrix (9 words)
m2: .word 1, 1, 1, 2, 2, 2, 3, 3, 3    @ 3×3 matrix (9 words)
```

### .bss Section
```assembly
.bss
res: .skip 36          @ Reserve 36 bytes (9 words × 4 bytes)
@ Or:
res: .space (4*N*N)    @ Reserve 4*3*3 = 36 bytes
```

### Constants
```assembly
.set N, 3              @ Matrix dimension (3×3)
.set size, 4           @ Size of one element (word = 4 bytes)
```

## Key Instructions Used

### Data Movement
- `LDR` - Load word from memory
- `STR` - Store word to memory
- `MOV` - Move between registers

### Arithmetic
- `ADD` - Addition
- `SUB` - Subtraction
- `MUL` - Multiplication
- `MLA rd, rm, rs, rn` - Multiply-accumulate (rd = rm×rs + rn)

### Bit Operations
- `LSL #n` - Logical shift left by n bits (multiply by 2^n)

### Control Flow
- `CMP` - Compare (sets flags)
- `B` - Branch unconditionally
- `BHS` - Branch if higher or same (unsigned ≥)
- `BEQ` - Branch if equal

### Stack Operations
- `STMFD sp!, {regs}` - Push multiple registers
- `LDMFD sp!, {regs}` - Pop multiple registers

## Building and Running

### Compilation
```bash
# matrix.s
arm-linux-gnueabi-as -o matrix.o src/matrix.s
arm-linux-gnueabi-ld -o matrix matrix.o

# produitMatrices.s
arm-linux-gnueabi-as -o produit.o src/produitMatrices.s
arm-linux-gnueabi-ld -o produit produit.o
```

### Debugging
```bash
arm-linux-gnueabi-gdb ./matrix
(gdb) break produit
(gdb) run
(gdb) x/9wx &res       # Examine result matrix (9 words)
```

Expected output in memory:
```
0x000e (14)  0x000e (14)  0x000e (14)
0x0020 (32)  0x0020 (32)  0x0020 (32)
0x0032 (50)  0x0032 (50)  0x0032 (50)
```

## Study Exercises

1. **Trace Inner Loop**: Manually trace the k loop for computing res[0][0]
2. **Change Matrix Size**: Modify N to 2 or 4 and adjust test data
3. **Add Matrix**: Implement matrix addition (simpler: no inner loop)
4. **Transpose**: Implement matrix transpose (swap rows and columns)
5. **Optimization**: The current code recalculates addresses. Can you cache some?

## Performance Considerations

### Current Implementation
- Recalculates array addresses every iteration
- Three memory accesses per inner loop: read m1, read m2, read/write res
- O(N³) time complexity (cannot be improved for general matrix multiply)

### Possible Optimizations
1. **Register Caching**: Keep frequently used addresses in registers
2. **Loop Unrolling**: Process multiple elements per iteration
3. **Block Matrix Multiplication**: Better cache locality for large matrices
4. **NEON SIMD**: Use ARM NEON instructions for parallel multiplication (advanced)

## Common Errors

### Wrong Address Calculation
**Problem**: Accessing wrong matrix elements
**Solution**: Draw memory layout, verify offset formula: (i×N + j)×4

### Register Corruption
**Problem**: Loop variables change unexpectedly
**Solution**: Save/restore all registers used, or use separate registers for each loop

### Alignment Issues
**Problem**: Crashes on memory access
**Solution**: Ensure `.align` after strings/odd-sized data

### Loop Bounds
**Problem**: Loop runs too many/few times
**Solution**: Use `bhs` (≥) not `bgt` (>), verify comparison with N

## References

- ARM Architecture Reference: MLA instruction
- Course materials: `../../cours/ARM/AssembleurARM - 2020-2021.pdf`
- ARM Instruction Set: `../../cours/ARM/arm-cheatsheet.pdf`
