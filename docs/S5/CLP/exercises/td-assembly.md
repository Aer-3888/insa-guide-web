---
title: "TD Solutions -- ARM Assembly"
sidebar_position: 1
---

# TD Solutions -- ARM Assembly

> Following teacher instructions from: S5/CLP/data/moodle/td/TDAsm1.pdf and S5/CLP/data/moodle/td/Assembleur/

This file covers the ARM assembly TD exercises: character-to-number conversion (carastruct.s), the Collatz sequence (collatz.s), factorial computation (factorial.s), and array analysis (CodeTest.s).

---

## Exercise 1: Character-to-Number Conversion (carastruct.s)

### Convert a string of digit characters to an integer

**Question:** Given a struct containing a length field and a character array "5487", convert it to the integer 5487.

**Answer:**

**Struct layout:**
```c
struct chain {
    int lg;        // offset 0: length of the string
    char tcar[];   // offset 4: character array (NOT null-terminated)
};
```

**Complete annotated assembly:**
```arm
.data
t_chain:
    .word 4              @ lg = 4 (string length)
    .ascii "5487"        @ tcar = "5487" (4 bytes, no null terminator)
.align 4

.set lg, 0               @ Offset to length field
.set tcar, 4             @ Offset to character array

N:  .word 0              @ Result accumulator
i:  .word 0              @ Loop counter

.text
.global _start
.align 4

_start:
    @ Load string length into r9
    ldr r9, =t_chain     @ r9 = address of t_chain struct
    ldr r9, [r9, #lg]    @ r9 = t_chain.lg = 4

    @ Load pointer to first character into r8
    ldr r8, =t_chain
    add r8, r8, #tcar    @ r8 = &tcar[0]

loop_condition:
    ldr r0, =i
    ldr r0, [r0]         @ r0 = value of i

    cmp r0, r9           @ Compare i with 4
    bcs loop_done        @ BCS (Branch if Carry Set) = unsigned >=

    @ Load current N
    ldr r1, =N
    ldr r1, [r1]         @ r1 = current N

    @ Load character at index i
    ldrb r7, [r8, r0]   @ r7 = tcar[i] (SINGLE BYTE via LDRB)

    @ Convert ASCII digit to integer
    sub r7, r7, #'0'    @ r7 = r7 - 48 (ASCII '0' = 48)

    @ Multiply-accumulate: N = N * 10 + digit
    ldr r6, =10
    mla r1, r1, r6, r7  @ r1 = r1 * 10 + r7

    @ Store updated N
    ldr r6, =N
    str r1, [r6]

    @ Increment i
    add r0, r0, #1
    ldr r7, =i
    str r0, [r7]
    b loop_condition

loop_done:
    ldr r0, =N
    ldr r0, [r0]         @ r0 = 5487
```

**Register trace:**

| Iteration | i (r0) | char (r7) | digit (r7) | N before (r1) | N after (r1) |
|-----------|--------|-----------|------------|----------------|---------------|
| 0 | 0 | '5' (53) | 5 | 0 | 0*10 + 5 = 5 |
| 1 | 1 | '4' (52) | 4 | 5 | 5*10 + 4 = 54 |
| 2 | 2 | '8' (56) | 8 | 54 | 54*10 + 8 = 548 |
| 3 | 3 | '7' (55) | 7 | 548 | 548*10 + 7 = 5487 |
| 4 | 4 | -- | -- | 5487 | (loop exits: 4 >= 4) |

**How it works:**
- **LDRB for byte access:** `ldrb r7, [r8, r0]` loads exactly 1 byte, zero-extending to 32 bits. Using `LDR` would load 4 bytes (wrong).
- **ASCII conversion:** Characters '0'-'9' have values 48-57. Subtracting '0' gives 0-9.
- **BCS (Branch if Carry Set):** For unsigned `cmp r0, r9`, carry is set when r0 >= r9. Equivalent to BHS.
- **MLA in one instruction:** `mla r1, r1, r6, r7` does N = N*10 + digit without needing separate MUL and ADD.

---

## Exercise 2: Collatz Sequence (collatz.s)

### Apply Collatz conjecture rules until reaching 1

**Question:** Starting from x = 32 (0x20), apply: if x is even, x = x/2; if x is odd, x = 3x + 1. Stop when x = 1.

**Answer:**

```arm
.data
x:  .word 0x20           @ x = 32 (initial value)

.text
.global _start

_start:
    ldr r2, =x           @ r2 = address of x
    ldr r0, [r2]         @ r0 = 32

collatz_loop:
    cmp r0, #1           @ Is x == 1?
    beq collatz_done

    @ Test parity: check bit 0
    and r3, r0, #1       @ r3 = x AND 1
    cmp r3, #1
    bne collatz_op_even  @ If r3 == 0, x is even

    @ ODD CASE: x = 3*x + 1
    mov r7, #1
    mov r6, #3
    mla r0, r0, r6, r7  @ r0 = r0 * 3 + 1
    b collatz_op_done

collatz_op_even:
    @ EVEN CASE: x = x / 2
    mov r0, r0, lsr #1  @ r0 = r0 >> 1 (logical shift right)

collatz_op_done:
    str r0, [r2]         @ Store updated x
    b collatz_loop

collatz_done:
    @ x = 1, sequence complete
```

**Execution trace (x = 32):**

| Step | x | Bit 0 | Operation | New x |
|------|---|-------|-----------|-------|
| 1 | 32 | 0 | even: 32 >> 1 | 16 |
| 2 | 16 | 0 | even: 16 >> 1 | 8 |
| 3 | 8 | 0 | even: 8 >> 1 | 4 |
| 4 | 4 | 0 | even: 4 >> 1 | 2 |
| 5 | 2 | 0 | even: 2 >> 1 | 1 |
| 6 | 1 | -- | x == 1, STOP | -- |

Starting value 32 = 2^5 is purely even, so it divides down in 5 steps. A more interesting trace uses x = 7:

| Step | x | Bit 0 | Operation | New x |
|------|---|-------|-----------|-------|
| 1 | 7 | 1 | odd: 3*7+1 | 22 |
| 2 | 22 | 0 | even: 22/2 | 11 |
| 3 | 11 | 1 | odd: 3*11+1 | 34 |
| 4 | 34 | 0 | even: 34/2 | 17 |
| 5 | 17 | 1 | odd: 3*17+1 | 52 |
| 6 | 52 | 0 | even: 52/2 | 26 |
| 7 | 26 | 0 | even: 26/2 | 13 |
| 8 | 13 | 1 | odd: 3*13+1 | 40 |
| 9 | 40 | 0 | even: 40/2 | 20 |
| 10 | 20 | 0 | even: 20/2 | 10 |
| 11 | 10 | 0 | even: 10/2 | 5 |
| 12 | 5 | 1 | odd: 3*5+1 | 16 |
| 13-17 | 16->1 | 0 | even path | 1 |

**How it works:**
- **Parity test with AND:** `and r3, r0, #1` isolates bit 0. Faster and cleaner than division.
- **LSR for unsigned division:** `mov r0, r0, lsr #1` shifts all bits right by 1 = divide by 2. Vacated MSB filled with 0.
- **MLA for 3x+1:** `mla r0, r0, r6, r7` computes x*3+1 in a single instruction.

---

## Exercise 3: Factorial (factorial.s)

### Compute N! for N = 12

**Question:** Implement iterative factorial. Why is 12 the maximum for 32-bit?

**Answer:**

```arm
.set N, 12

.data
i:    .word 1            @ Loop counter starts at 1
fact: .word 1            @ Accumulator starts at 1

.text
.global _start

_start:
    ldr r9, =N           @ r9 = 12 (loop bound)
    ldr r0, =fact
    ldr r0, [r0]         @ r0 = 1 (initial factorial value)

loop_condition:
    ldr r1, =i
    ldr r1, [r1]         @ r1 = current i

    cmp r1, r9           @ Compare i with 12
    bhi loop_done        @ BHI = Branch if Higher (unsigned >)

    mul r0, r0, r1       @ r0 = fact * i

    add r1, r1, #1       @ i++
    ldr r8, =i
    str r1, [r8]

    b loop_condition

loop_done:
    ldr r9, =fact
    str r0, [r9]         @ Store final result
```

**Register trace:**

| i | fact (r0) before | fact (r0) after |
|---|-----------------|-----------------|
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 3 | 2 | 6 |
| 4 | 6 | 24 |
| 5 | 24 | 120 |
| 6 | 120 | 720 |
| 7 | 720 | 5,040 |
| 8 | 5,040 | 40,320 |
| 9 | 40,320 | 362,880 |
| 10 | 362,880 | 3,628,800 |
| 11 | 3,628,800 | 39,916,800 |
| 12 | 39,916,800 | 479,001,600 |
| 13 | -- | loop exits (13 > 12) |

**Final result:** r0 = 479,001,600 = 0x1C8CFC00

**Why 12 is maximum:** 13! = 6,227,020,800 exceeds 2^32 - 1 = 4,294,967,295. A 32-bit `MUL` would silently overflow. For larger factorials, use `UMULL` (unsigned multiply long) for a 64-bit result.

**How it works:**
- **BHI (Branch if Higher):** Unsigned greater-than. Exits when i=13 > 12.
- **Accumulator in register:** Unlike i (loaded/stored each iteration), fact stays in r0 throughout -- a natural optimization.

---

## Exercise 4: Array Analysis (CodeTest.s)

### Count negative, zero, and positive values in an array

**Question:** Given an array of 10 integers, count negative, zero, and positive values.

**Answer:**

```arm
.data
T:  .word 4, 8, 12, 9, 0, -1, 0, -18, 2, 0
.align

.bss
X:  .skip 4              @ Count of negative values
Y:  .skip 4              @ Count of zero values
Z:  .skip 4              @ Count of positive values

.equ N, 10

.text
.global _Start

_Start:
    mov r3, #0           @ r3 = negative count
    mov r4, #0           @ r4 = zero count
    ldr r1, =T           @ r1 = pointer to array T

Boucle:
    ldr r0, [r1], #4    @ r0 = *r1, then r1 += 4 (POST-INCREMENT)

    cmp r0, #0

    addlt r3, r3, #1    @ CONDITIONAL: if r0 < 0, negative count++
    addeq r4, r4, #1    @ CONDITIONAL: if r0 == 0, zero count++

    bge Boucle           @ Loop continues while element >= 0
```

**Important note:** The loop termination `bge Boucle` is BUGGY in the original code. It exits on the first negative element:
- Elements processed: 4, 8, 12, 9, 0 (then -1 causes exit)
- Elements MISSED: 0, -18, 2, 0

**Corrected version using a separate counter:**
```arm
    mov r5, #N           @ Total elements
    mov r6, #0           @ Processed count
    mov r3, #0           @ Negative count
    mov r4, #0           @ Zero count
    ldr r1, =T

Boucle:
    cmp r6, r5
    bge Done
    ldr r0, [r1], #4
    cmp r0, #0
    addlt r3, r3, #1
    addeq r4, r4, #1
    addgt r5, r5, #0    @ (no-op, just to illustrate conditional)
    add r6, r6, #1
    b Boucle

Done:
    @ Positive count = N - negative - zero
    rsb r5, r3, #N      @ r5 = N - r3
    sub r5, r5, r4      @ r5 = N - negative - zero = positive count
```

**How it works:**
- **Post-increment addressing:** `ldr r0, [r1], #4` loads the word at r1, THEN adds 4 to r1. Standard array-walking pattern.
- **Conditional execution:** ARM's signature feature. `addlt r3, r3, #1` only executes the ADD if the N!=V flag condition holds (signed less than). Avoids branches, more efficient on ARM pipeline.
- **RSB (Reverse Subtract):** `rsb r3, r3, #N` computes `r3 = N - r3` (operands reversed from SUB).

---

## Annale 2017: Vector Dot Product and Orthogonality

### Compute scalar product and test orthogonality

**Question:** Given vectors as structs with (letter, x, y), compute the dot product and determine if two vectors are orthogonal.

**Answer:**

**Data structure:**
```arm
.set lettre, 0           @ Identifier character
.set x, 4                @ x coordinate (after alignment)
.set y, 8                @ y coordinate
```

**Stack frame for ProduitScalaire:**
```arm
.set valScalaire, -4     @ Local variable
.set resScalaire, 8      @ Return value
.set u_pile, 12          @ First parameter (vector u pointer)
.set v_pile, 16          @ Second parameter (vector v pointer)
```

**Dot product computation for B(4,0) and C(0,2):**
```arm
ldr r0, [fp, #u_pile]   @ r0 = address of B
ldr r5, [r0, #x]        @ r5 = B.x = 4
ldr r6, [r0, #y]        @ r6 = B.y = 0

ldr r1, [fp, #v_pile]   @ r1 = address of C
ldr r7, [r1, #x]        @ r7 = C.x = 0
ldr r8, [r1, #y]        @ r8 = C.y = 2

mul r3, r5, r7           @ r3 = 4 * 0 = 0
mul r4, r6, r8           @ r4 = 0 * 2 = 0
add r2, r3, r4           @ r2 = 0 + 0 = 0
```

Result: dot product = 0, so B and C are orthogonal (estOrtho = 1).

**Conditional store pattern (orthogonality test):**
```arm
cmp r2, #0
moveq r4, #1             @ If dot product == 0: orthogonal
streq r4, [r3]
movne r4, #0             @ If dot product != 0: not orthogonal
strne r4, [r3]
```

---

## Annale 2018: Direction Vectors and Collinearity

### Generate direction vectors and test collinearity

**Question:** Given lines ax + by + c = 0, compute direction vectors (-b, a) and test collinearity via cross product.

**Answer:**

**Direction vector for D1 (a=3, b=2, c=12):**
```arm
ldr r6, [r5, #b]        @ r6 = D1.b = 2
ldr r7, [r5, #a]        @ r7 = D1.a = 3
rsb r6, r6, #0          @ r6 = 0 - 2 = -2 (negate b)

str r6, [r3, #x]        @ v1.x = -2
str r7, [r3, #y]        @ v1.y = 3
```

Results: v1 = (-2, 3), v2 = (-4, 6), v3 = (-2, -1)

**Collinearity check (cross product = 0):**

For v1=(-2,3) and v2=(-4,6):
```
(-2)*6 - 3*(-4) = -12 - (-12) = -12 + 12 = 0
```
Cross product is 0, so v1 and v2 are collinear (D1 and D2 are parallel).

---

## Annale 2019: Recipe Ingredients

### Count non-empty ingredients and extract numeric values

**Question:** Given ingredient structs with a 3-byte encoded quantity and a name string, implement CompterIngredients and TrouverNb.

**Answer:**

**CompterIngredients -- count non-empty entries:**
```arm
CompterIngredients:
    ldr r0, [fp, #ptRecette]   @ r0 = address of TabIngredients
    mov r1, #0                  @ i = 0

loop:
    ldr r2, [r0, r1, lsl #2]  @ r2 = TabIngredients[i] (pointer)
    ldrb r2, [r2]              @ r2 = first byte of ingredient
    cmp r2, #0                 @ Null terminator?
    beq finloop
    add r1, r1, #1             @ i++
    b loop

finloop:
    str r1, [fp, #res]         @ Return count
```

**TrouverNb -- extract 3-digit number (e.g., bytes 0,8,0 -> 80):**
```arm
TrouverNb:
    mov r0, #0                  @ j = 0 (byte index)
    mov r1, #0                  @ nb = 0

loop1:
    ldr r2, [fp, #nb]
    mov r6, #10
    mul r2, r2, r6             @ nb = nb * 10
    ldr r3, [fp, #ptTabIngredients]
    ldr r4, [fp, #IngrI]
    ldr r3, [r3, r4, lsl #2]  @ r3 = TabIngredients[IngrI]
    ldrb r3, [r3, r0]         @ r3 = byte at offset j
    add r5, r3, r2             @ r5 = nb * 10 + byte
    str r5, [fp, #nb]
    cmp r0, #2
    bge finloop1
    add r0, r0, #1
    b loop1
```

Trace for ingredient i4 (FARINE, bytes 0, 8, 0):
```
j=0: nb = 0*10 + 0 = 0
j=1: nb = 0*10 + 8 = 8
j=2: nb = 8*10 + 0 = 80
Result: 80 (quantity = 080g)
```
