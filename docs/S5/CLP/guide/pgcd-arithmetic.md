---
title: "Chapter 5 -- PGCD / Arithmetic Circuits"
sidebar_position: 5
---

# Chapter 5 -- PGCD / Arithmetic Circuits

## 5.1 Overview

The PGCD (Plus Grand Commun Diviseur / Greatest Common Divisor) machine is the flagship example of the CLP course. It demonstrates the complete design flow: from algorithm to hardware, integrating a Processing Unit (UT) with a Control Unit (UC).

This is the same GCD algorithm later implemented in ARM assembly (TP1), creating a powerful bridge between hardware and software perspectives.

---

## 5.2 The GCD Algorithm

### Euclid's Subtraction-Based Algorithm

```
function gcd(a, b):
    while a != b:
        if a > b:
            a = a - b
        else:
            b = b - a
    return a
```

**Example**: gcd(24, 18)
```
Step 1: a=24, b=18  ->  a > b  ->  a = 24-18 = 6
Step 2: a=6,  b=18  ->  a < b  ->  b = 18-6  = 12
Step 3: a=6,  b=12  ->  a < b  ->  b = 12-6  = 6
Step 4: a=6,  b=6   ->  a == b ->  return 6
```

### Why This Algorithm Works in Hardware

The subtraction-based version is preferred over the modulo-based version because:
1. Subtraction is simple to implement (just an adder with complement)
2. No division hardware needed
3. The comparison (a > b, a = b, a < b) naturally produces the conditions needed

---

## 5.3 Processing Unit (UT) Design

### From Logisim: `9-pgcd-ut.circ`

**Registers**:
- **Register A**: Holds the first operand
- **Register B**: Holds the second operand

**Arithmetic unit**:
- **Subtractor**: Computes A - B (or B - A, depending on control)
- **Comparator**: Produces conditions A > B, A = B, A < B

**Control signals (commands from UC)**:
- `LOAD_A`: Load a value into register A
- `LOAD_B`: Load a value into register B
- `A_MINUS_B`: Compute A - B and load result into A
- `B_MINUS_A`: Compute B - A and load result into B
- `INIT`: Load initial values from input

**Conditions (sent to UC)**:
- `A_EQ_B`: A equals B (algorithm terminates)
- `A_GT_B`: A is greater than B (subtract B from A)
- `A_LT_B`: A is less than B (subtract A from B)

### Datapath Diagram

```
          Input A        Input B
             |              |
         +---v---+      +---v---+
         |  Reg A |      |  Reg B |
         +---+---+      +---+---+
             |              |
             +------+-------+
             |      |       |
         +---v---+  |  +---v---+
         | Sub   |  |  | Comp  |
         | A - B |  |  | A ? B |
         +---+---+  |  +---+---+
             |      |      |
     Result  |      |   A>B, A=B, A<B
             v      |      v
          (back to  |   (to UC)
           Reg A    |
           or B)    |
```

---

## 5.4 Control Unit Design

### State Machine

The UC implements the algorithm as a finite state machine:

| State | Name | Action | Conditions | Next State |
|-------|------|--------|------------|------------|
| S0 | INIT | Load A and B from input | -- | S1 |
| S1 | COMPARE | Compare A and B | A=B -> S4, A>B -> S2, A<B -> S3 | Depends |
| S2 | SUB_A | A = A - B | -- | S1 |
| S3 | SUB_B | B = B - A | -- | S1 |
| S4 | DONE | Output result (A = B = GCD) | -- | S0 or halt |

### State Diagram

```
     +-----+
     | S0  |-----> INIT (load A, B)
     |INIT |
     +--+--+
        |
        v
     +--+--+<---------+----------+
     | S1  |           |          |
     |COMP |           |          |
     +--+--+           |          |
     /  |  \           |          |
    /   |   \          |          |
A>B/  A=B  A<B\       |          |
  /     |     \        |          |
 v      v      v       |          |
+--+  +--+  +--+      |          |
|S2|  |S4|  |S3|      |          |
|A-B| |END| |B-A|     |          |
+--+  +--+  +--+      |          |
 |            |        |          |
 +------------+--------+          |
 |                                |
 +--------------------------------+
```

### Hardwired Implementation (`10-pgcd-uc1.circ`)

The hardwired UC uses:
- 3-bit state register (flip-flops encoding states S0-S4)
- Combinational logic computing next state from current state + conditions
- Combinational logic generating commands from current state

### Microprogrammed Implementation (`11-pgcd-uc2.circ`)

The microprogrammed UC uses:
- 3-bit counter as state register
- ROM storing microcode words
- Multiplexer selecting conditions

**Microcode word format**:
```
[Jump code] [Jump address] [LOAD_A] [LOAD_B] [A_MINUS_B] [B_MINUS_A] [INIT] [OUTPUT]
```

**ROM contents** (from `11-pgcd-uc2.mem`):
```
v2.0 raw
c110 10001 a112 1227 1236 52f3 2cf3 10007
70
```

Each hex value encodes one microinstruction. The sequencer reads these to control the UT.

---

## 5.5 Integration (`12-pgcd-integration.circ`)

The complete GCD machine connects:
1. UT command inputs to UC command outputs
2. UT condition outputs to UC condition inputs
3. External inputs (initial A and B values) to UT
4. Clock signal to both UC and UT

**Testing**: Set input A=24, B=18. After running the clock, the result register should contain 6.

---

## 5.6 From Hardware to Software

The same GCD algorithm implemented in ARM assembly (from TP1):

```arm
pgcd:
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp

    ldr r0, [fp, #a_off]       @ r0 = a
    ldr r1, [fp, #b_off]       @ r1 = b

    cmp r0, #0                 @ if a == 0
    beq pgcd_null
    cmp r1, #0                 @ if b == 0
    beq pgcd_null

    cmp r0, r1                 @ compare a and b
    beq pgcd_equal             @ a == b: return a
    bgt pgcd_a_gt_b            @ a > b: recurse with (a-b, b)

    @ a < b: recurse with (a, b-a)
    sub r1, r1, r0
    @ ... setup recursive call ...

pgcd_a_gt_b:
    sub r0, r0, r1
    @ ... setup recursive call ...
```

**Comparison**:

| Aspect | Hardware (UT+UC) | Software (ARM) |
|--------|-----------------|----------------|
| Subtraction | Subtractor circuit | `SUB r0, r0, r1` |
| Comparison | Comparator circuit | `CMP r0, r1` |
| Branching | UC state transitions | `BEQ`, `BGT` instructions |
| Loop | UC cycles back to compare state | Recursive call or branch |
| Storage | Registers A, B in UT | Registers r0, r1 (or stack) |

---

## 5.7 Other Arithmetic Circuit Examples

### Modulo-4 Adder (`1-Add-modulo4.circ`)

A circuit that adds two 2-bit numbers modulo 4. Uses a full adder and discards the carry-out.

### Binary to BCD Converter (`binaire2bcd.circ`)

Converts binary representation to Binary-Coded Decimal for display on 7-segment displays. Uses the "double dabble" or shift-and-add-3 algorithm.

### 8-bit Shifter (`decalage-GD-CH-8bits.circ`)

Barrel shifter that can shift an 8-bit value left or right by a variable amount. Uses multiple layers of MUXes.

---

## 5.8 Common Pitfalls

1. **Forgetting the loop-back**: After S2 (A=A-B) or S3 (B=B-A), the machine MUST return to S1 (compare), not proceed to S4.

2. **Termination condition**: The algorithm terminates when A = B, not when A = 0 or B = 0. Using the wrong condition gives incorrect results for inputs that are not coprime.

3. **Zero inputs**: gcd(0, n) = n by convention, but the subtraction algorithm produces 0. Decide whether your machine handles this case.

4. **Microcode address alignment**: In the microprogrammed version, ensure ROM addresses correspond to the correct states. A jump to address 3 must reach state S3's microinstruction.

5. **Simultaneous register updates**: In hardware, both registers can be updated in the same clock cycle. But in the GCD algorithm, only one register changes per cycle. Be careful not to accidentally overwrite both.

---

## CHEAT SHEET -- PGCD / Arithmetic Circuits

```
GCD ALGORITHM (Euclid's subtraction):
  while a != b:
      if a > b: a = a - b
      else:     b = b - a
  return a

GCD MACHINE STATES:
  S0: INIT     -- Load inputs
  S1: COMPARE  -- Check A vs B
  S2: A = A-B  -- When A > B
  S3: B = B-A  -- When A < B
  S4: DONE     -- A = B = GCD

UT COMPONENTS:
  Registers: A, B
  ALU: Subtractor (A-B), Comparator (A?B)
  Commands: LOAD_A, LOAD_B, A_MINUS_B, B_MINUS_A, INIT, OUTPUT
  Conditions: A_EQ_B, A_GT_B, A_LT_B

UC TYPES:
  Hardwired:        Fast, built from gates
  Microprogrammed:  ROM + counter + MUX

GCD EXAMPLES:
  gcd(24, 18) = 6     (24->6->6, 18->12->6)
  gcd(666, 666) = 666  (equal, return immediately)
  gcd(48, 36) = 12    (48->12->12, 36->24->12)

LOGISIM FILES:
  9-pgcd-ut.circ            -- Processing Unit
  10-pgcd-uc1.circ          -- Hardwired Control Unit
  11-pgcd-uc2.circ + .mem   -- Microprogrammed Control Unit
  12-pgcd-integration.circ  -- Complete Machine
```
