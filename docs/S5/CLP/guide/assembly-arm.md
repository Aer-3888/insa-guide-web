---
title: "Chapter 6 -- ARM Assembly Language"
sidebar_position: 2
---

# Chapter 6 -- ARM Assembly Language

## 6.1 Overview

The ARM assembly portion of CLP covers programming at the hardware level using the ARM instruction set. ARM is a RISC (Reduced Instruction Set Computer) architecture used in mobile devices, embedded systems, and the Raspberry Pi used in TP4.

---

## 6.2 ARM Register Set

### General-Purpose Registers

| Register | Alias | Convention |
|----------|-------|------------|
| r0 | -- | Argument 1 / Return value |
| r1 | -- | Argument 2 |
| r2 | -- | Argument 3 |
| r3 | -- | Argument 4 |
| r4-r10 | -- | General purpose (callee-saved) |
| r11 | fp | Frame Pointer |
| r12 | ip | Intra-procedure scratch |
| r13 | sp | Stack Pointer |
| r14 | lr | Link Register (return address) |
| r15 | pc | Program Counter |

### Condition Flags (CPSR)

| Flag | Name | Set when... |
|------|------|-------------|
| N | Negative | Result bit 31 is 1 (negative in two's complement) |
| Z | Zero | Result is zero |
| C | Carry | Unsigned overflow (carry out of bit 31) |
| V | oVerflow | Signed overflow |

---

## 6.3 Data Sections and Directives

### Section Declarations

```arm
.data                    @ Initialized data section
    x: .word 42          @ 32-bit integer, initialized to 42
    msg: .asciz "Hello"  @ Null-terminated string
    arr: .word 1, 2, 3   @ Array of 3 words

.bss                     @ Uninitialized data section
    result: .skip 4      @ Reserve 4 bytes (1 word)
    buffer: .space 100   @ Reserve 100 bytes
    .align               @ Align to word boundary

.text                    @ Code section
    .global _start       @ Make _start visible to linker
```

### Data Definition Directives

| Directive | Size | Example |
|-----------|------|---------|
| `.word` | 4 bytes | `.word 42` or `.word 1, 2, 3` |
| `.byte` | 1 byte | `.byte 0xFF` |
| `.ascii` | string (no null) | `.ascii "hello"` |
| `.asciz` | string (null-terminated) | `.asciz "hello"` |
| `.skip N` / `.space N` | N bytes | `.skip 40` |
| `.align` | pad to word boundary | `.align` |

### Constants

```arm
.equ NAME, value        @ Assembly-time constant
.set NAME, value        @ Alternative syntax (same effect)

@ Example:
.equ N, 10              @ N is always 10
.set offset_x, 4        @ offset_x is always 4
```

---

## 6.4 Instruction Set

### Data Movement

```arm
MOV  rd, op2            @ rd = op2 (register or immediate)
MVN  rd, op2            @ rd = NOT(op2)
LDR  rd, [rn]           @ rd = memory[rn]  (load word)
LDR  rd, [rn, #offset]  @ rd = memory[rn + offset]
LDR  rd, =label         @ rd = address of label (pseudo-instruction)
STR  rd, [rn]           @ memory[rn] = rd  (store word)
STR  rd, [rn, #offset]  @ memory[rn + offset] = rd
LDRB rd, [rn]           @ rd = memory[rn] (load byte, zero-extended)
STRB rd, [rn]           @ memory[rn] = rd (store byte)
```

### Loading a Variable from Memory (Two-Step Pattern)

```arm
ldr r0, =x              @ Step 1: r0 = ADDRESS of x
ldr r0, [r0]            @ Step 2: r0 = VALUE at that address

@ For storing:
ldr r0, =x              @ r0 = address of x
str r1, [r0]            @ memory[address of x] = r1
```

This two-step pattern is fundamental. `ldr r0, =x` is a pseudo-instruction that loads the address into r0. The second `ldr` dereferences the pointer.

### Addressing Modes

```arm
@ Offset addressing
ldr r0, [r1, #4]        @ r0 = memory[r1 + 4]    (pre-indexed)
ldr r0, [r1, r2]        @ r0 = memory[r1 + r2]
ldr r0, [r1, r2, lsl #2] @ r0 = memory[r1 + r2*4] (scaled index)

@ Post-indexed addressing
ldr r0, [r1], #4        @ r0 = memory[r1], then r1 = r1 + 4

@ Pre-indexed with writeback
ldr r0, [r1, #4]!       @ r1 = r1 + 4, then r0 = memory[r1]
```

### Arithmetic

```arm
ADD  rd, rn, op2        @ rd = rn + op2
SUB  rd, rn, op2        @ rd = rn - op2
RSB  rd, rn, op2        @ rd = op2 - rn  (reverse subtract)
MUL  rd, rm, rs         @ rd = rm * rs
MLA  rd, rm, rs, rn     @ rd = rm * rs + rn  (multiply-accumulate)
```

**RSB is useful** for negation: `RSB r0, r0, #0` computes r0 = 0 - r0 = -r0.

### Logic

```arm
AND  rd, rn, op2        @ rd = rn AND op2
ORR  rd, rn, op2        @ rd = rn OR op2
EOR  rd, rn, op2        @ rd = rn XOR op2
BIC  rd, rn, op2        @ rd = rn AND NOT(op2)  (bit clear)
```

### Shifts

```arm
MOV  rd, rm, LSL #n     @ rd = rm << n   (logical shift left)
MOV  rd, rm, LSR #n     @ rd = rm >> n   (logical shift right, fill with 0)
MOV  rd, rm, ASR #n     @ rd = rm >> n   (arithmetic shift right, sign extend)
MOV  rd, rm, ROR #n     @ rd = rm rotated right by n
```

Shifts can also be used as the second operand in other instructions:
```arm
ADD r0, r1, r2, LSL #2  @ r0 = r1 + (r2 * 4)
```

### Comparison

```arm
CMP  rn, op2            @ Set flags based on rn - op2 (result discarded)
CMN  rn, op2            @ Set flags based on rn + op2
TST  rn, op2            @ Set flags based on rn AND op2
TEQ  rn, op2            @ Set flags based on rn XOR op2
```

### Branching

```arm
B    label              @ Unconditional branch
BL   label              @ Branch with Link (saves PC+4 in LR)
BX   lr                 @ Branch to address in lr (return from function)
BEQ  label              @ Branch if Z=1 (equal)
BNE  label              @ Branch if Z=0 (not equal)
BGT  label              @ Branch if N=V and Z=0 (signed greater than)
BLT  label              @ Branch if N!=V (signed less than)
BGE  label              @ Branch if N=V (signed greater or equal)
BLE  label              @ Branch if Z=1 or N!=V (signed less or equal)
BHI  label              @ Branch if C=1 and Z=0 (unsigned higher)
BHS  label              @ Branch if C=1 (unsigned higher or same)
BLO  label              @ Branch if C=0 (unsigned lower)
BLS  label              @ Branch if C=0 or Z=1 (unsigned lower or same)
```

### Conditional Execution

Any ARM instruction can be made conditional by adding a condition suffix:

```arm
ADDEQ r0, r0, #1       @ Add 1 to r0 ONLY IF Zero flag is set
MOVGT r1, r0            @ Move r0 to r1 ONLY IF greater than
STRNE r2, [r3]          @ Store ONLY IF not equal
```

This avoids short branches and is a signature feature of the ARM ISA.

**Example** (from TD assembly, counting in array):
```arm
cmp r0, #0
addlt r3, r3, #1       @ If r0 < 0: increment negative count
addeq r4, r4, #1       @ If r0 == 0: increment zero count
```

---

## 6.5 Stack Operations

### Full Descending Stack

ARM uses a Full Descending (FD) stack by convention:
- **Full**: SP points to the last occupied location
- **Descending**: Stack grows toward lower addresses

### Push and Pop

```arm
STMFD sp!, {r0, r1, r2}    @ Push r0, r1, r2 onto stack
                            @ SP decreases by 12 (3 * 4 bytes)
                            @ Registers stored: r2 at highest addr, r0 at lowest

LDMFD sp!, {r0, r1, r2}    @ Pop from stack into r0, r1, r2
                            @ SP increases by 12
```

**IMPORTANT**: STMFD stores registers in ascending order of register number from lowest address. So `STMFD sp!, {r0, r1}` stores r0 at [sp-8] and r1 at [sp-4].

### Reserving Space for Local Variables

```arm
SUB sp, sp, #8          @ Reserve 8 bytes (2 words) on stack
@ ... use [fp, #-4] and [fp, #-8] for local variables ...
ADD sp, sp, #8          @ Free the reserved space
```

---

## 6.6 Function Calling Convention

### The Stack Frame

```
High addresses
    +------------------+
    | Argument N       |  [fp, #8 + 4*(N-1)]
    +------------------+
    | ...              |
    +------------------+
    | Argument 2       |  [fp, #12]
    +------------------+
    | Argument 1       |  [fp, #8]
    +------------------+
    | Return value     |  [fp, #8] (if result passed via stack)
    +------------------+
    | Saved LR         |  [fp, #4]
    +------------------+
FP->| Saved FP         |  [fp, #0]
    +------------------+
    | Local var 1      |  [fp, #-4]
    +------------------+
    | Local var 2      |  [fp, #-8]
    +------------------+
    | Saved registers  |  (below local vars)
    +------------------+
SP->|                  |
Low addresses
```

### Caller's Responsibilities

```arm
@ 1. Load arguments
ldr r0, =arg1
ldr r0, [r0]
ldr r1, =arg2
ldr r1, [r1]

@ 2. Push arguments onto stack
stmfd sp!, {r0, r1}        @ Push arguments

@ 3. Reserve space for return value (if using stack-based return)
sub sp, sp, #4

@ 4. Call function
bl myFunction

@ 5. Retrieve return value
ldmfd sp!, {r2}             @ Pop return value into r2

@ 6. Clean up arguments
add sp, sp, #8              @ Remove 2 arguments (2 * 4 bytes)
```

### Callee's Responsibilities (Function Prologue/Epilogue)

```arm
myFunction:
    @ === PROLOGUE ===
    stmfd sp!, {lr}         @ Save return address
    stmfd sp!, {fp}         @ Save caller's frame pointer
    mov fp, sp              @ Set up our frame pointer
    sub sp, sp, #N          @ Reserve N bytes for local variables
    stmfd sp!, {r4-r9}      @ Save registers we'll modify

    @ === BODY ===
    ldr r0, [fp, #8]        @ Access first parameter
    ldr r1, [fp, #12]       @ Access second parameter
    @ ... computation ...
    str r0, [fp, #8]        @ Store return value (if stack-based)

    @ === EPILOGUE ===
    ldmfd sp!, {r4-r9}      @ Restore saved registers
    add sp, sp, #N          @ Free local variables
    ldmfd sp!, {fp}         @ Restore caller's frame pointer
    ldmfd sp!, {lr}         @ Restore return address
    bx lr                   @ Return to caller
```

### Alternative Prologue Style

Some implementations save FP and LR together:

```arm
stmfd sp!, {fp, lr}     @ Save both in one instruction
mov fp, sp
@ ...
ldmfd sp!, {fp, lr}     @ Restore both
bx lr
```

---

## 6.7 Recursion

### Template for Recursive Functions

```arm
recursive_func:
    @ Prologue: MUST save LR because BL will overwrite it
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    stmfd sp!, {r0-r3}      @ Save any registers we use

    @ Load parameters
    ldr r0, [fp, #param1_offset]

    @ Base case check
    cmp r0, #base_value
    beq base_case

    @ Recursive case: prepare new arguments
    @ ... modify r0, r1 ...
    stmfd sp!, {r0, r1}     @ Push new arguments
    sub sp, sp, #4           @ Reserve space for result
    bl recursive_func        @ RECURSIVE CALL
    ldmfd sp!, {r0}          @ Get result
    add sp, sp, #8           @ Clean up arguments
    str r0, [fp, #result_offset]
    b epilogue

base_case:
    @ Store base case result
    mov r0, #base_result
    str r0, [fp, #result_offset]

epilogue:
    ldmfd sp!, {r0-r3}
    ldmfd sp!, {fp}
    ldmfd sp!, {lr}
    bx lr
```

### Example: Recursive GCD (from TP1)

```arm
pgcd:
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    stmfd sp!, {r0, r1, r2}

    ldr r0, [fp, #12]       @ a
    ldr r1, [fp, #16]       @ b

    cmp r0, #0
    beq retZ                 @ a == 0: return 0
    cmp r1, #0
    beq retZ                 @ b == 0: return 0
    cmp r0, r1
    beq retA                 @ a == b: return a
    bgt retP1                @ a > b: recurse(a-b, b)

    @ a < b: recurse(a, b-a)
    sub r1, r1, r0
    stmfd sp!, {r0, r1}
    sub sp, sp, #4
    bl pgcd
    ldmfd sp!, {r0}
    add sp, sp, #8
    str r0, [fp, #8]
    b fin
```

---

## 6.8 Arrays and Structures

### Array Access

For an array of words (4 bytes each):
```arm
@ Address of arr[i] = base + i * 4
ldr r0, =array              @ r0 = base address
mov r1, #3                   @ i = 3
ldr r2, [r0, r1, lsl #2]    @ r2 = array[3]  (r0 + 3*4)
```

For an array of bytes:
```arm
ldr r0, =string
mov r1, #5
ldrb r2, [r0, r1]           @ r2 = string[5] (no scaling needed)
```

### Post-increment Pattern (Array Traversal)

```arm
@ Walk through array, loading each element
ldr r1, =T                  @ r1 = base address
loop:
    ldr r0, [r1], #4        @ r0 = *r1, then r1 += 4
    @ ... process r0 ...
    b loop
```

### Matrix Addressing (from TP2)

For a matrix M[N][N] of words stored row-major:
```arm
@ Address of M[i][j] = base + (i*N + j) * 4
mov r9, #N
mla r9, r9, r0, r1      @ r9 = N*i + j
mov r9, r9, lsl #2       @ r9 = (N*i + j) * 4
ldr r6, =matrix
add r9, r6               @ r9 = &M[i][j]
ldr r5, [r9]             @ r5 = M[i][j]
```

### Structure Access (from TP3)

Define structure offsets as constants:
```arm
.equ offset_name, 0         @ First field: char* name
.equ offset_count, 4        @ Second field: int count
.equ offset_data, 8         @ Third field: int* data

@ Access structure member:
ldr r1, [r0, #offset_count] @ r1 = struct_ptr->count
```

For array of pointers to structures:
```arm
ldr r2, [r0, r3, lsl #2]    @ r2 = array[r3] (pointer to struct)
ldr r4, [r2, #offset_count]  @ r4 = array[r3]->count
```

---

## 6.9 Worked Examples

### Example 1: Count Characters (from Annales 2017 Exercise 1)

Count occurrences of 'e' in a string:

```arm
.data
  a: .space 4
  b: .asciz "Ouvroir de littérature potentielle"
.text
.global _Start
_Start:
  mov r1, #0                 @ counter = 0
  mov r2, #0                 @ current char
  ldr r0, =b                 @ r0 = address of string
  loop:
    ldrb r2, [r0], #1        @ r2 = *r0++  (load byte, post-increment)
    cmp r2, #'e'             @ compare with 'e'
    addeq r1, r1, #1         @ if equal: counter++
    cmp r2, #0               @ check for null terminator
    bne loop                  @ continue if not end of string
  ldr r0, =a
  str r1, [r0]               @ store count in memory
```

**Key techniques**: Post-increment addressing, conditional execution (`addeq`), null-terminated string traversal. Note that the accented "e" in "litterature" does not match ASCII 'e', so the final count is 5.

### Example 2: Collatz Sequence (from TD)

```arm
.data
  x: .word 0x20             @ x = 32
.text
_start:
  ldr r2, =x
  ldr r0, [r2]              @ r0 = x
collatz_loop:
  cmp r0, #1
  beq collatz_done           @ stop when x == 1
  and r3, r0, #1            @ test if odd (bit 0)
  cmp r3, #1
  bne collatz_even
  @ Odd: x = 3*x + 1
  mov r7, #1
  mov r6, #3
  mla r0, r0, r6, r7        @ r0 = r0*3 + 1
  b collatz_store
collatz_even:
  @ Even: x = x / 2
  mov r0, r0, lsr #1        @ r0 = r0 >> 1
collatz_store:
  str r0, [r2]               @ save back to memory
  b collatz_loop
collatz_done:
```

**Key techniques**: Bit testing with AND, MLA for 3x+1, LSR for division by 2.

### Example 3: Factorial (from TD)

```arm
.set N, 12                   @ Maximum factorial that fits in 32 bits
.data
  i:    .word 1
  fact: .word 1
.text
_start:
  ldr r9, =N                 @ r9 = 12 (the limit)
  ldr r0, =fact
  ldr r0, [r0]               @ r0 = 1 (running product)
loop_condition:
  ldr r1, =i
  ldr r1, [r1]               @ r1 = i
  cmp r1, r9
  bhi loop_done               @ exit when i > 12
  mul r0, r0, r1              @ fact = fact * i
  add r1, r1, #1              @ i++
  ldr r8, =i
  str r1, [r8]
  b loop_condition
loop_done:
  ldr r9, =fact
  str r0, [r9]                @ store final result
```

**Note**: 12! = 479001600 fits in 32 bits. 13! = 6227020800 does NOT.

---

## 6.10 GPIO / Raspberry Pi (from TP4)

### Memory-Mapped I/O

On Raspberry Pi, hardware registers are accessed by reading/writing to specific memory addresses. No special I/O instructions needed.

```arm
.set GPSEL4, 0x3f200010     @ GPIO Function Select Register 4
.set GPSET1, 0x3f200020     @ GPIO Set Register 1
.set GPCLR1, 0x3f20002c     @ GPIO Clear Register 1
```

### Configuring a Pin as Output

GPIO 47 uses bits [21:19] of GPFSEL4. Setting to 001 = output mode:

```arm
ldr r0, =GPSEL4
mov r1, #(1 << 21)          @ Bit 21 = 1, others = 0
str r1, [r0]                 @ Configure pin 47 as output
```

### Controlling the LED

```arm
@ Turn ON: write 1 to bit 15 of GPSET1
ldr r0, =GPSET1
mov r1, #(1 << 15)          @ Pin 47 = bit 15 in bank 1
str r1, [r0]

@ Turn OFF: write 1 to bit 15 of GPCLR1
ldr r0, =GPCLR1
mov r1, #(1 << 15)
str r1, [r0]
```

### Bare Metal Considerations

- No OS, no stack initialization (use registers for save/restore)
- No printf -- observe LEDs or use hardware debugger
- Link at 0x8000 (`-Ttext=0x8000`) -- Raspberry Pi boot address
- Busy-wait loops for timing (no timer interrupt setup)

---

## 6.11 Common Pitfalls

1. **Forgetting to save LR**: If your function calls another function (BL), LR is overwritten. Always STMFD {lr} before BL if you need to return.

2. **Stack misalignment**: Every STMFD must have a matching LDMFD. Every SUB sp must have a matching ADD sp. Mismatched pairs corrupt the stack.

3. **Wrong offset calculations**: Draw the stack frame and count bytes. Remember: LR is at fp+4, FP is at fp+0, return value at fp+8, first param at fp+12 (if using the standard convention).

4. **LDRB vs LDR**: Use LDRB for single characters/bytes, LDR for 32-bit words. Using LDR on a byte array reads 4 bytes at once, giving garbage.

5. **Scaled indexing**: For word arrays, use `lsl #2` to multiply index by 4. For byte arrays, no scaling needed. Forgetting the scale reads wrong elements.

6. **Conditional execution gotcha**: `ADDEQ` does nothing if the Z flag is not set. Make sure CMP is executed immediately before the conditional instruction -- other instructions between CMP and the conditional may modify flags.

7. **Forgetting .align**: After `.ascii` or `.byte` data, the next data/code may be misaligned. Always use `.align` after byte/string data.

8. **MUL destination restriction**: On some ARM variants, `MUL rd, rm, rs` requires rd != rm. Use a different register as destination if in doubt.

---

## CHEAT SHEET -- ARM Assembly

```
REGISTERS:
  r0-r3:  Arguments / Return / Scratch (caller-saved)
  r4-r10: General purpose (callee-saved)
  r11/fp: Frame Pointer
  r13/sp: Stack Pointer (Full Descending)
  r14/lr: Link Register (return address)
  r15/pc: Program Counter

LOADING FROM MEMORY (TWO-STEP PATTERN):
  ldr r0, =variable     @ r0 = ADDRESS
  ldr r0, [r0]          @ r0 = VALUE

FUNCTION CALL TEMPLATE:
  Caller:                    Callee:
    stmfd sp!, {args}          stmfd sp!, {lr}
    sub sp, sp, #4             stmfd sp!, {fp}
    bl function                mov fp, sp
    ldmfd sp!, {result}        sub sp, sp, #locals
    add sp, sp, #args_size     stmfd sp!, {regs}
                               @ ... body ...
                               ldmfd sp!, {regs}
                               add sp, sp, #locals
                               ldmfd sp!, {fp}
                               ldmfd sp!, {lr}
                               bx lr

STACK FRAME OFFSETS:
  [fp, #0]  = saved FP
  [fp, #4]  = saved LR
  [fp, #8]  = return value (or 1st param)
  [fp, #12] = 1st param (or 2nd param)
  [fp, #-4] = 1st local variable

ARRAY ACCESS:
  Word array:  ldr r0, [base, index, lsl #2]   @ base + index*4
  Byte array:  ldrb r0, [base, index]           @ base + index

MATRIX ACCESS: M[i][j] where M is NxN words
  offset = (i*N + j) * 4
  mla r0, N_reg, i_reg, j_reg    @ r0 = N*i + j
  ldr r1, [base, r0, lsl #2]     @ r1 = M[i][j]

CONDITION CODES:
  EQ (Z=1)   NE (Z=0)   GT (N=V,Z=0)   LT (N!=V)
  GE (N=V)   LE (Z=1|N!=V)
  HI (C=1,Z=0)  HS/CS (C=1)  LO/CC (C=0)  LS (C=0|Z=1)

KEY INSTRUCTIONS:
  MLA rd, rm, rs, rn    @ rd = rm*rs + rn
  RSB rd, rn, op2       @ rd = op2 - rn (reverse subtract)
  LSL #n                @ shift left by n (multiply by 2^n)
  LSR #n                @ shift right by n (divide by 2^n)
```
