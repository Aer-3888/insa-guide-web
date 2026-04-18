---
title: "TP1 - Introduction a l'assembleur ARM : algorithme du PGCD"
sidebar_position: 1
---

# TP1 - Introduction a l'assembleur ARM : algorithme du PGCD

> D'apres les consignes enseignants : S5/CLP/data/moodle/tp/tp1/README.md

Ce TP introduit les fondamentaux de l'assembleur ARM a travers deux implementations de l'algorithme du PGCD d'Euclide : `assembleur_TP1.s` (exercice 2, style francais) et `pgcd.s` (style anglais avec une structure plus claire).

---

## Exercice 1: assembleur_TP1.s -- GCD with Full Register Saving

### Understand the data section and constants

**Question:** What do the `.equ` directives define, and how do the `.data` values get loaded?

**Answer:**

```arm
.equ a, 12              @ Offset from FP to parameter a on stack
.equ b, 16              @ Offset from FP to parameter b on stack
.equ res, 8             @ Offset from FP to return value on stack

.section .data
    x : .word 666       @ First input stored in memory (4 bytes)
    y : .word 666       @ Second input stored in memory (4 bytes)

.section .bss           @ Uninitialized data (empty here)

.section .text
.global _start          @ Make _start visible to linker
```

**How it works:** The `.equ` constants define byte offsets from the frame pointer (FP) used to access parameters and return values on the stack. The `.data` section stores initialized 32-bit words. `.global _start` exports the entry point symbol so the linker can find it.

---

### Trace the _start entry point

**Question:** How are the parameters loaded from memory and pushed onto the stack for the function call?

**Answer:**

```arm
_start:
    ldr r0, =x          @ r0 = address of variable x (pseudo-instruction)
    ldr r0, [r0]         @ r0 = memory[r0] = 666 (dereference pointer)

    ldr r1, =y           @ r1 = address of variable y
    ldr r1, [r1]         @ r1 = memory[r1] = 666

    stmfd sp!, {r0, r1}  @ Push r0 and r1 onto stack (Full Descending)
    sub sp, sp, #4       @ Reserve 4 bytes for return value

    bl pgcd              @ Branch with Link: saves PC+4 in LR, jumps to pgcd

    ldmfd sp!, {r2}      @ Pop return value into r2
    add sp, sp, #8       @ Clean up the two parameters (2 x 4 bytes)

end:
    b end                @ Infinite loop (halts program on bare metal)
```

**How it works:** The two-step load pattern (`ldr r0, =x` then `ldr r0, [r0]`) first gets the ADDRESS of x, then dereferences it to get the VALUE. The caller pushes arguments, reserves space for the return value, calls `bl pgcd`, then retrieves the result and cleans the stack.

**Stack state before calling pgcd:**
```
High addresses
+------------------+
| 666 (b = y)      |  SP + 8
+------------------+
| 666 (a = x)      |  SP + 4
+------------------+
| [return value]   |  SP + 0  <-- SP points here
+------------------+
Low addresses
```

---

### Analyze the pgcd function prologue and stack frame

**Question:** Explain the function prologue and draw the complete stack frame.

**Answer:**

```arm
pgcd:
    stmfd sp!, {lr}          @ Save return address (Link Register)
    stmfd sp!, {fp}          @ Save caller's frame pointer
    mov fp, sp               @ FP = SP (base of our stack frame)
    stmfd sp!, {r0, r1, r2}  @ Save registers we will modify

    ldr r0, [fp, #a]         @ r0 = value at FP+12 = parameter a
    ldr r1, [fp, #b]         @ r1 = value at FP+16 = parameter b
```

**Stack frame after prologue (first call with a=666, b=666):**
```
High addresses
+------------------+
| 666 (b)          |  FP + 16   [fp, #b]
+------------------+
| 666 (a)          |  FP + 12   [fp, #a]
+------------------+
| [return value]   |  FP + 8    [fp, #res]
+------------------+
| saved LR         |  FP + 4
+------------------+
| saved FP         |  FP + 0    <-- FP points here
+------------------+
| saved r2         |
+------------------+
| saved r1         |
+------------------+
| saved r0         |  <-- SP points here
+------------------+
Low addresses
```

**How it works:** FP+12 reaches parameter `a` because: FP+0 = saved FP (4 bytes), FP+4 = saved LR (4 bytes), FP+8 = return value slot (4 bytes), FP+12 = first parameter. The three register saves protect the caller's register values across the recursive call.

---

### Trace the recursive algorithm logic

**Question:** Explain each branch of the GCD algorithm and the recursive call mechanism.

**Answer:**

```arm
    @ Base case: a == 0 or b == 0 -> return 0
    cmp r0, #0               @ Sets CPSR flags: Z=1 if r0==0
    beq retZ                 @ If Z flag set, jump to return 0

    cmp r1, #0               @ Sets CPSR flags: Z=1 if r1==0
    beq retZ

    @ Base case: a == b -> return a
    cmp r0, r1               @ Compare a with b, sets N, Z, C, V flags
    beq retA                 @ If Z=1 (equal), return a
    bgt retP1                @ If Z=0 and N=V (greater), recurse with (a-b, b)

    @ Recursive case: a < b -> pgcd(a, b-a)
    sub r1, r1, r0           @ r1 = b - a
    stmfd sp!, {r0, r1}      @ Push new args: (a, b-a)
    sub sp, sp, #4           @ Reserve space for result
    bl pgcd                  @ Recursive call: pgcd(a, b-a)
    ldmfd sp!, {r0}          @ Pop result
    add sp, sp, #8           @ Clean up arguments
    str r0, [fp, #res]       @ Store result in caller's return value slot
    b fin

retA:   @ a == b: GCD is a
    mov r2, r0
    str r2, [fp, #res]
    b fin

retZ:   @ a==0 or b==0: GCD is 0
    mov r2, #0
    str r2, [fp, #res]
    b fin

retP1:  @ a > b: recurse with (a-b, b)
    sub r0, r0, r1           @ r0 = a - b
    stmfd sp!, {r0, r1}      @ Push new args
    sub sp, sp, #4           @ Reserve result space
    bl pgcd                  @ Recursive call: pgcd(a-b, b)
    ldmfd sp!, {r0}          @ Pop result
    add sp, sp, #8           @ Clean up
    str r0, [fp, #res]
    b fin

fin:    @ Epilogue
    ldmfd sp!, {r0, r1, r2}  @ Restore saved registers
    ldmfd sp!, {fp}           @ Restore caller's frame pointer
    ldmfd sp!, {lr}           @ Restore return address
    bx lr                     @ Return to caller
```

**How it works:** The algorithm subtracts the smaller value from the larger until both are equal. Each recursive call pushes new arguments and a result slot onto the stack, calls itself, retrieves the result, cleans up, and stores the result in its own return slot at `[fp, #res]`.

---

## Exercice 2: pgcd.s -- Cleaner GCD Implementation

### Identify the structural differences from assembleur_TP1.s

**Question:** What are the key differences between this implementation and the first one?

**Answer:**

```arm
.data
a:      .word   24              @ First input: 24
b:      .word   18              @ Second input: 18

.equ    b_off, 16               @ Parameter b at FP+16
.equ    a_off, 12               @ Parameter a at FP+12
.equ    res_off, 8              @ Return value at FP+8
```

Key differences:
1. `pgcd` is defined BEFORE `_start` (order does not matter to the assembler)
2. Uses `sub r0, r0` as a clever way to set r0 to 0 (r0 = r0 - r0 = 0)
3. Does NOT save r0-r2 in the prologue (simpler, smaller stack frame)
4. Uses `bls` (Branch if Lower or Same, unsigned) instead of `blt`
5. Consolidates the recursive call into a single `pgcd_func_call` label

**Simpler stack frame (no saved r0-r2):**
```
High addresses
+------------------+
| 18 (b)           |  FP + 16   [fp, #b_off]
+------------------+
| 24 (a)           |  FP + 12   [fp, #a_off]
+------------------+
| [return value]   |  FP + 8    [fp, #res_off]
+------------------+
| saved LR         |  FP + 4
+------------------+
| saved FP         |  FP + 0    <-- FP, SP
+------------------+
Low addresses
```

---

### Complete execution trace for pgcd(24, 18)

**Question:** Trace the full execution showing all recursive calls and the unwinding.

**Answer:**

**Call tree:**
```
pgcd(24, 18)
  24 > 18 -> pgcd(24-18, 18) = pgcd(6, 18)
    6 < 18 -> pgcd(6, 18-6) = pgcd(6, 12)
      6 < 12 -> pgcd(6, 12-6) = pgcd(6, 6)
        6 == 6 -> return 6
      return 6
    return 6
  return 6
```

**Detailed register trace:**

Call 1 -- pgcd(24, 18):
```
r0 = 24, r1 = 18
cmp r0, #0  : 24 != 0, Z=0, no branch
cmp r1, #0  : 18 != 0, Z=0, no branch
cmp r0, r1  : 24 vs 18, Z=0, C=1 -> not equal, not lower-or-same
-> a > b: sub r0, r0, r1 -> r0 = 6. Push (6, 18), call pgcd(6, 18)
```

Call 2 -- pgcd(6, 18):
```
r0 = 6, r1 = 18
cmp r0, r1  : 6 vs 18, Z=0, C=0 -> bls taken (6 <= 18)
-> a < b: sub r1, r1, r0 -> r1 = 12. Push (6, 12), call pgcd(6, 12)
```

Call 3 -- pgcd(6, 12):
```
r0 = 6, r1 = 12
6 < 12 -> sub r1, r1, r0 -> r1 = 6. Push (6, 6), call pgcd(6, 6)
```

Call 4 -- pgcd(6, 6):
```
r0 = 6, r1 = 6
cmp r0, r1  : 6 == 6, Z=1 -> beq pgcd_not_null, then beq stores r0=6
str r0, [fp, #res_off] -> stores 6 in return value slot
```

**Unwinding:** Each returning call pops 6 from the result slot and stores it in its own return slot:
```
Call 4 returns 6 -> Call 3 stores 6 -> Call 2 stores 6 -> Call 1 stores 6
```

**Final result:** r0 = 6 in `_start` after `ldm sp!, {r0}`.

---

### Stack depth at maximum recursion

**Question:** Draw the full stack with all 4 frames nested.

**Answer:**

```
High addresses
+====================+ _start frame
| 18 (b=y)           |
| 24 (a=x)           |
| [result slot] = 6  |
+====================+ pgcd call 1 frame
| 18 (b)             |
| 24 (a)             |
| [result] = 6       |
| saved LR           |
| saved FP           | <-- FP1
+--------------------+
| 18 (b)             |  args for call 2
| 6 (a)              |
| [result] = 6       |
+====================+ pgcd call 2 frame
| saved LR           |
| saved FP           | <-- FP2
+--------------------+
| 12 (b)             |  args for call 3
| 6 (a)              |
| [result] = 6       |
+====================+ pgcd call 3 frame
| saved LR           |
| saved FP           | <-- FP3
+--------------------+
| 6 (b)              |  args for call 4
| 6 (a)              |
| [result] = 6       |
+====================+ pgcd call 4 frame
| saved LR           |
| saved FP           | <-- FP4
+====================+
Low addresses (SP at deepest point)
```

---

## Resume des concepts cles

### Addressing Modes Used

| Mode | Example | Description |
|------|---------|-------------|
| Pseudo-literal | `ldr r0, =x` | Load address of label x |
| Register indirect | `ldr r0, [r0]` | Load word at address in r0 |
| Base + offset | `ldr r0, [fp, #12]` | Load word at FP+12 |
| Immediate | `mov r2, #0` | Load immediate constant |
| Pre-decrement writeback | `stmfd sp!, {r0, r1}` | Push registers onto stack |
| Post-increment writeback | `ldmfd sp!, {r0}` | Pop register from stack |

### Common Mistakes

- **Forgetting step 2 of the two-step load:** `ldr r0, =x` gets the address, not the value. You must follow with `ldr r0, [r0]`.
- **STMFD push order:** Registers are pushed in register-number order regardless of listing. After `stmfd sp!, {r0, r1}`, SP points to r0 (lower number at lower address).
- **Stack cleanup is the CALLER's job:** The caller pushes arguments and must clean them up after the call returns.
- **BX vs B for return:** `bx lr` is the correct return instruction. `b lr` is invalid syntax (B takes a label, not a register).
