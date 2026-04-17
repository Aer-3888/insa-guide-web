---
title: "TP1 - Introduction to ARM Assembly"
sidebar_position: 1
---

# TP1 - Introduction to ARM Assembly

## Overview

This lab introduces fundamental ARM assembly concepts through the implementation of the GCD (Greatest Common Divisor) algorithm. Two implementations are provided, demonstrating different coding styles and approaches.

## Exercises

### 1. assembleur_TP1.s
Basic ARM assembly exercise with GCD computation (French-style implementation).

### 2. pgcd.s
GCD computation using Euclid's algorithm (English-style implementation with detailed comments).

## GCD Algorithm (Euclid's Algorithm)

The Greatest Common Divisor is computed using the Euclidean algorithm:

```
function gcd(a, b):
    if a == 0 or b == 0:
        return 0
    if a == b:
        return a
    if a > b:
        return gcd(a - b, b)
    else:
        return gcd(a, b - a)
```

This is a recursive algorithm that repeatedly subtracts the smaller value from the larger until they are equal.

## Key ARM Concepts Demonstrated

### 1. Stack Management

**Full Descending Stack** (standard ARM convention):
```assembly
stmfd sp!, {r0, r1}    @ Push r0 and r1 onto stack
ldmfd sp!, {r0, r1}    @ Pop from stack back into r0 and r1
```

The `!` suffix means "writeback" - update SP after the operation.

### 2. Function Calling Convention

**Caller responsibilities**:
1. Push arguments onto stack (right to left)
2. Reserve space for return value
3. Call function with `bl`
4. Retrieve return value from stack
5. Clean up arguments from stack

**Callee responsibilities**:
1. Save LR (return address) and FP (frame pointer)
2. Set up new frame pointer
3. Save registers that will be modified
4. Execute function logic
5. Store return value at correct stack offset
6. Restore registers, FP, and LR
7. Return with `bx lr`

### 3. Stack Frame Layout

For a function call `pgcd(a, b)` returning `res`:

```
High memory
    +------------------+
    | b (arg 2)        |  [fp, #16]
    +------------------+
    | a (arg 1)        |  [fp, #12]
    +------------------+
    | res (return)     |  [fp, #8]
    +------------------+
    | Saved LR         |  [fp, #4]
    +------------------+
FP->| Saved FP         |  [fp, #0]
    +------------------+
    | Saved registers  |  Below FP
SP->+------------------+
Low memory
```

Offsets defined with `.equ`:
```assembly
.equ a, 12        @ Offset to parameter a
.equ b, 16        @ Offset to parameter b  
.equ res, 8       @ Offset to return value
```

### 4. Recursive Function Calls

Recursion in assembly requires careful stack management:

```assembly
@ Recursive call: pgcd(a-b, b)
sub r0, r0, r1          @ Compute a-b
stmfd sp!, {r0, r1}     @ Push new arguments
sub sp, sp, #4          @ Reserve space for result
bl pgcd                 @ Recursive call
ldmfd sp!, {r0}         @ Get result
add sp, sp, #8          @ Clean up arguments
str r0, [fp, #res]      @ Store in our return location
```

### 5. Conditional Branching

The algorithm uses comparisons and conditional branches:

```assembly
cmp r0, #0              @ Compare r0 with 0
beq retZ                @ Branch if equal (a == 0)

cmp r0, r1              @ Compare r0 with r1
beq retA                @ Branch if equal (a == b)
bgt retP1               @ Branch if greater than (a > b)
                        @ Fall through to else case (a < b)
```

### 6. Memory Access

**Loading data from memory**:
```assembly
ldr r0, =x              @ Load address of x into r0
ldr r0, [r0]            @ Load value at address into r0
```

**Two-stage process**:
1. `ldr r0, =x` - Get address (pseudo-instruction)
2. `ldr r0, [r0]` - Dereference pointer

**Storing to stack**:
```assembly
str r2, [fp, #res]      @ Store r2 at offset 'res' from FP
```

## Instruction Set Reference

### Data Movement
- `MOV rd, op2` - Move operand2 to destination register
- `LDR rd, [addr]` - Load 32-bit word from memory
- `STR rs, [addr]` - Store 32-bit word to memory

### Stack Operations  
- `STMFD sp!, {list}` - Store multiple, full descending, writeback
- `LDMFD sp!, {list}` - Load multiple, full descending, writeback

### Arithmetic
- `ADD rd, rn, op2` - rd = rn + op2
- `SUB rd, rn, op2` - rd = rn - op2

### Branch/Compare
- `CMP rn, op2` - Compare (sets condition flags)
- `B label` - Unconditional branch
- `BL label` - Branch with link (call function)
- `BX lr` - Branch exchange (return from function)
- `BEQ label` - Branch if equal (Z flag set)
- `BNE label` - Branch if not equal (Z flag clear)
- `BGT label` - Branch if greater than (signed)
- `BLT label` - Branch if less than (signed)

## Register Usage

In these implementations:
- **r0**: First parameter (a), intermediate calculations
- **r1**: Second parameter (b), intermediate calculations
- **r2**: Result value before storing
- **r3-r9**: Additional calculations (in pgcd.s)
- **SP (r13)**: Stack pointer
- **LR (r14)**: Return address (link register)
- **FP (r11)**: Frame pointer (base for accessing parameters/locals)

## Assembly Directives

### Section Definitions
```assembly
.data                   @ Initialized data section
.bss                    @ Uninitialized data section
.text                   @ Code section
.global _start          @ Make _start visible to linker
```

### Data Definitions
```assembly
.word value             @ Define 32-bit word
.byte value             @ Define 8-bit byte
.ascii "string"         @ Define ASCII string
.skip n                 @ Reserve n bytes
.align                  @ Align to word boundary
```

### Constants
```assembly
.equ name, value        @ Define assembly-time constant
.set name, value        @ Alternative syntax
```

## Building and Running

### Compilation
```bash
# Using GNU ARM toolchain
arm-linux-gnueabi-as -o tp1.o src/assembleur_TP1.s
arm-linux-gnueabi-ld -o tp1 tp1.o

# Or for pgcd.s
arm-linux-gnueabi-as -o pgcd.o src/pgcd.s
arm-linux-gnueabi-ld -o pgcd pgcd.o
```

### Running with QEMU
```bash
qemu-arm ./tp1
echo $?    # Check exit code (result may be in r0)
```

### Debugging
```bash
arm-linux-gnueabi-gdb ./tp1
(gdb) break pgcd
(gdb) run
(gdb) info registers
(gdb) x/10wx $sp        # Examine stack
(gdb) stepi             # Step one instruction
```

## Expected Results

### assembleur_TP1.s
- Input: `x = 666, y = 666`
- Expected output: `res = 666` (GCD of 666 and 666 is 666)

### pgcd.s  
- Input: `a = 24, b = 18`
- Expected output: `res = 6` (GCD of 24 and 18 is 6)

**Verification**:
- 24 = 4 × 6
- 18 = 3 × 6
- No larger number divides both

## Study Exercises

1. **Trace Execution**: Draw the stack state after each function call for `gcd(24, 18)`
2. **Modify Values**: Change the initial values of a and b and verify the result
3. **Iterative Version**: Implement GCD iteratively (without recursion) to compare approaches
4. **Optimization**: Notice the subtraction-based algorithm is slow. Research the modulo-based version: `gcd(a, b) = gcd(b, a mod b)`

## Common Errors and Solutions

### Stack Imbalance
**Problem**: Program crashes or wrong results
**Cause**: Mismatched push/pop operations
**Solution**: Ensure every `stmfd sp!, {...}` has corresponding `ldmfd sp!, {...}` with same registers

### Wrong Offsets
**Problem**: Loading wrong values for parameters
**Cause**: Incorrect calculation of `.equ` offsets
**Solution**: Draw stack layout, count bytes from FP

### Missing LR Save
**Problem**: Infinite recursion or crash
**Cause**: Calling another function without saving LR first
**Solution**: Always `stmfd sp!, {lr}` before `bl` if your function calls others

### Frame Pointer Not Set
**Problem**: Unable to access parameters correctly
**Cause**: Forgot `mov fp, sp` after saving old FP
**Solution**: Set up FP immediately after saving it

## References

- ARM Architecture Reference Manual: Calling Convention
- Course slides: `../../cours/ARM/AssembleurARM - 2020-2021.pdf`
- ARM Instruction Reference: `../../cours/ARM/arm-cheatsheet.pdf`
