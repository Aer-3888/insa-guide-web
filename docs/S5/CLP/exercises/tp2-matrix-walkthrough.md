---
title: "TP2 - Matrix Multiplication in ARM Assembly"
sidebar_position: 2
---

# TP2 - Matrix Multiplication in ARM Assembly

> Following teacher instructions from: S5/CLP/data/moodle/tp/tp2/README.md

This TP implements 3x3 matrix multiplication in ARM assembly. Two implementations are provided: `matrix.s` (English-style, passes matrix addresses as parameters) and `produitMatrices.s` (French-style, passes result address too). Both compute RES = M1 x M2 using three nested loops.

---

## Exercise 1: matrix.s -- Matrix Product with Two Parameters

### Understand the constants, data layout, and stack frame

**Question:** Define the matrix data, explain the row-major memory layout, and set up the stack frame offsets.

**Answer:**

```arm
.set    N, 3                    @ Matrix dimension (3x3)

.bss
res:    .space  (4*N*N)         @ Reserve 4*3*3 = 36 bytes for result (9 words)

.data
m1:     .word   1, 2, 3         @ Row 0
        .word   4, 5, 6         @ Row 1
        .word   7, 8, 9         @ Row 2

m2:     .word   1, 1, 1         @ Row 0
        .word   2, 2, 2         @ Row 1
        .word   3, 3, 3         @ Row 2

.equ    i_offset, -4            @ Local variable i at FP-4
.equ    j_offset, -8            @ Local variable j at FP-8
.equ    k_offset, -12           @ Local variable k at FP-12
.equ    m1_offset, 8            @ Parameter: address of M1 at FP+8
.equ    m2_offset, 12           @ Parameter: address of M2 at FP+12
```

**Row-major memory layout of M1:**
```
Address:    base    base+4  base+8  base+12 base+16 base+20 base+24 base+28 base+32
Value:      1       2       3       4       5       6       7       8       9
Index:      [0][0]  [0][1]  [0][2]  [1][0]  [1][1]  [1][2]  [2][0]  [2][1]  [2][2]
```

**Address formula:** `Address of M[i][j] = base + (i * N + j) * 4`

**Stack frame:**
```
High addresses
+------------------+
| addr of M2       |  FP + 12  [fp, #m2_offset]
+------------------+
| addr of M1       |  FP + 8   [fp, #m1_offset]
+------------------+
| saved LR         |  FP + 4
+------------------+
| saved FP         |  FP + 0   <-- FP
+------------------+
| i                |  FP - 4   [fp, #i_offset]
+------------------+
| j                |  FP - 8   [fp, #j_offset]
+------------------+
| k                |  FP - 12  [fp, #k_offset]
+------------------+
| saved r0-r2,     |
| r5-r9            |  <-- SP
+------------------+
Low addresses
```

**How it works:** Matrices are stored row by row in contiguous memory. The `.bss` section allocates zeroed memory for the result. Local loop counters (i, j, k) live on the stack at negative offsets from FP, while parameters are at positive offsets.

---

### Trace the _start entry point and function call setup

**Question:** How does `_start` prepare the parameters and call the `produit` function?

**Answer:**

```arm
_start:
    ldr     r0, =m1             @ r0 = address of matrix m1
    ldr     r1, =m2             @ r1 = address of matrix m2
    stmfd   sp!, {r0, r1}       @ Push addresses onto stack
    bl      produit             @ Call matrix multiplication
loop_end:
    b       loop_end            @ Halt
```

**How it works:** Only the addresses of the matrices are passed (not the data itself). The caller pushes two 4-byte pointers onto the stack. The result is written to the global `res` matrix, so no return value slot is needed.

---

### Analyze the produit function: prologue and outer loop

**Question:** Walk through the function prologue and the outer loop (i = 0 to N-1).

**Answer:**

```arm
produit:
    stmfd   sp!, {lr}           @ Save return address
    stmfd   sp!, {fp}           @ Save frame pointer
    mov     fp, sp              @ Set new frame pointer
    sub     sp, sp, #12         @ Allocate 3 local vars (i, j, k)
    stmfd   sp!, {r0, r1, r2, r5, r6, r7, r8, r9}  @ Save 8 registers

    mov     r0, #0              @ i = 0
    str     r0, [fp, #i_offset] @ Store i on stack

loop_i:
    ldr     r0, [fp, #i_offset] @ Load i from stack
    cmp     r0, #N              @ Compare i with 3
    bhs     loop_i_out          @ Exit if i >= 3 (unsigned: Branch if Higher or Same)
```

**How it works:** `BHS` (Branch if Higher or Same) is the unsigned equivalent of `BGE`. For non-negative loop counters, it works identically. The function saves 8 registers it will use, ensuring the caller's values are preserved.

---

### Analyze the address calculation for res[i][j]

**Question:** How is the address of `res[i][j]` computed using MLA and LSL?

**Answer:**

```arm
    @ Calculate linear index: N*i + j
    mov     r7, #N              @ r7 = 3
    mla     r8, r7, r0, r1     @ r8 = 3*i + j  (MLA rd, rm, rs, rn: rd = rm*rs + rn)

    mov     r8, r8, LSL #2     @ r8 = (3*i + j) * 4  (shift left 2 = multiply by 4)

    ldr     r7, =res            @ r7 = base address of result matrix
    add     r8, r7              @ r8 = &res[i][j] (absolute address)

    mov     r7, #0
    str     r7, [r8]            @ res[i][j] = 0 (initialize accumulator)
```

**Example for res[1][2]:**
```
Linear index = 3*1 + 2 = 5
Byte offset  = 5 * 4 = 20
Address      = base_res + 20
```

**How it works:** `MLA` (Multiply-Accumulate) computes `rd = rm * rs + rn` in one instruction, giving the linear index. `LSL #2` shifts left by 2 bits, which multiplies by 4 (since each word is 4 bytes). This is faster than a `MUL` by 4.

---

### Trace the inner loop: the multiplication core

**Question:** Walk through the inner k-loop showing how m1[i][k] and m2[k][j] are loaded and accumulated.

**Answer:**

```arm
loop_k:
    ldr     r2, [fp, #k_offset]
    cmp     r2, #N
    bhs     loop_k_out

    @ Load m1[i][k]
    mov     r9, #N              @ r9 = 3
    mla     r9, r9, r0, r2     @ r9 = 3*i + k (linear index in M1)
    mov     r9, r9, LSL #2     @ r9 = (3*i + k) * 4 (byte offset)
    ldr     r6, [fp, #m1_offset] @ r6 = base address of M1
    add     r9, r6              @ r9 = &m1[i][k]
    ldr     r5, [r9]            @ r5 = m1[i][k]

    @ Load m2[k][j]
    mov     r9, #N              @ r9 = 3
    mla     r9, r9, r2, r1     @ r9 = 3*k + j (linear index in M2)
    mov     r9, r9, LSL #2     @ r9 = (3*k + j) * 4
    ldr     r6, [fp, #m2_offset] @ r6 = base address of M2
    add     r6, r9              @ r6 = &m2[k][j]
    ldr     r6, [r6]            @ r6 = m2[k][j]

    @ Multiply-accumulate: res[i][j] += m1[i][k] * m2[k][j]
    mla     r7, r6, r5, r7     @ r7 = r6*r5 + r7
    str     r7, [r8]            @ Store updated res[i][j]

    add     r2, r2, #1          @ k++
    str     r2, [fp, #k_offset]
    b       loop_k
```

**How it works:** `MLA r7, r6, r5, r7` does `r7 = m2[k][j] * m1[i][k] + r7` in a single instruction -- three operations (multiply, add to accumulator, store to register) combined. The accumulator r7 carries the running sum across all k iterations.

---

## Exercise 2: produitMatrices.s -- Three-Parameter Version

### Identify the key differences from matrix.s

**Question:** How does this version differ in parameter passing and code style?

**Answer:**

```arm
.set a_res, 8           @ Result matrix address at FP+8
.set a_m1, 12           @ M1 address at FP+12
.set a_m2, 16           @ M2 address at FP+16
```

Key differences:
1. Passes THREE parameters: result address, M1 address, M2 address
2. Uses `stmfd sp!, {fp, lr}` to save FP and LR in a single instruction (more efficient)
3. Uses `add r3, r3, r2, lsl #2` (barrel shifter form) instead of separate `mov LSL` + `add`
4. Uses `beq` instead of `bhs` for loop termination
5. Saves registers with `stmfd sp!, {r0-r6}` (compact range notation)

**Caller setup:**
```arm
_Start:
    ldr r0, =res        @ Result address
    ldr r1, =m1         @ M1 address
    ldr r2, =m2         @ M2 address
    stmfd sp!, {r0, r1, r2}  @ Push all three
    bl produit
    add sp, sp, #12     @ Clean up 3 parameters
```

**How it works:** By passing the result address as a parameter, the function becomes more flexible -- it can write to any destination matrix, not just a hardcoded global. The barrel shifter in `add r3, r3, r2, lsl #2` computes `r3 = r3 + r2*4` in one instruction.

---

## Complete Execution Trace: Computing res[1][2]

### RES[1][2] = M1[1][0]*M2[0][2] + M1[1][1]*M2[1][2] + M1[1][2]*M2[2][2]

**Question:** Trace each iteration of the k-loop for i=1, j=2.

**Answer:**

**Iteration k=0:**
```
m1[1][0]: index = 3*1 + 0 = 3, offset = 12, value = 4
m2[0][2]: index = 3*0 + 2 = 2, offset = 8,  value = 1
r7 = 1 * 4 + 0 = 4
```

**Iteration k=1:**
```
m1[1][1]: index = 3*1 + 1 = 4, offset = 16, value = 5
m2[1][2]: index = 3*1 + 2 = 5, offset = 20, value = 2
r7 = 2 * 5 + 4 = 14
```

**Iteration k=2:**
```
m1[1][2]: index = 3*1 + 2 = 5, offset = 20, value = 6
m2[2][2]: index = 3*2 + 2 = 8, offset = 32, value = 3
r7 = 3 * 6 + 14 = 32
```

**res[1][2] = 32**

---

### Complete Result Matrix

**Question:** Verify the full result matrix.

**Answer:**

```
         j=0    j=1    j=2
i=0  [  14      14      14  ]
i=1  [  32      32      32  ]
i=2  [  50      50      50  ]
```

**Verification for each row:**
```
RES[0][j] = 1*1 + 2*2 + 3*3 = 1 + 4 + 9  = 14   (all columns same because M2 cols are identical)
RES[1][j] = 4*1 + 5*2 + 6*3 = 4 + 10 + 18 = 32
RES[2][j] = 7*1 + 8*2 + 9*3 = 7 + 16 + 27 = 50
```

**Memory layout of result:**
```
Address         Value   Element
res + 0         14      res[0][0]
res + 4         14      res[0][1]
res + 8         14      res[0][2]
res + 12        32      res[1][0]
res + 16        32      res[1][1]
res + 20        32      res[1][2]
res + 24        50      res[2][0]
res + 28        50      res[2][1]
res + 32        50      res[2][2]
```

---

## Key Concepts Summary

### Why loop counters live on the stack

In these implementations, i, j, k are stored on the stack rather than kept purely in registers because:
1. **Teaching convention:** The course uses a systematic approach where ALL local variables use the stack frame
2. **Register pressure:** With 3 loop counters, base addresses, and temporaries, many registers are needed
3. **Nested function calls:** If `produit` called another function, register values would be lost unless saved

### Addressing modes used

| Mode | Instruction | Explanation |
|------|-------------|-------------|
| Base + immediate offset | `ldr r0, [fp, #-4]` | Load from FP-4 (local variable) |
| Shifted register operand | `mov r8, r8, LSL #2` | r8 = r8 * 4 (barrel shifter) |
| Base + shifted register | `add r3, r3, r2, lsl #2` | r3 = r3 + r2*4 |
| MLA (multiply-accumulate) | `mla r8, r7, r0, r1` | r8 = r7*r0 + r1 |

### Debugging with GDB

```bash
arm-linux-gnueabi-gdb matrix
(gdb) break loop_k           # Break at inner loop
(gdb) run
(gdb) x/9dw &res             # Show result matrix (9 words, decimal)
# Expected: 14 14 14 32 32 32 50 50 50
```
