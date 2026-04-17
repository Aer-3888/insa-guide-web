---
title: "Chapter 1 -- Combinational Logic"
sidebar_position: 3
---

# Chapter 1 -- Combinational Logic

## 1.1 Foundations

A **combinational circuit** is one whose outputs depend only on the current inputs -- there is no memory, no clock, and no feedback. The output is a pure function of the inputs.

### Logic Gates

| Gate | Symbol | Boolean | Truth Table (2 inputs) |
|------|--------|---------|----------------------|
| AND | A . B | A AND B | 0,0->0; 0,1->0; 1,0->0; 1,1->1 |
| OR | A + B | A OR B | 0,0->0; 0,1->1; 1,0->1; 1,1->1 |
| NOT | /A | NOT A | 0->1; 1->0 |
| NAND | /(A.B) | NOT(A AND B) | 0,0->1; 0,1->1; 1,0->1; 1,1->0 |
| NOR | /(A+B) | NOT(A OR B) | 0,0->1; 0,1->0; 1,0->0; 1,1->0 |
| XOR | A (+) B | A XOR B | 0,0->0; 0,1->1; 1,0->1; 1,1->0 |
| XNOR | /(A(+)B) | A XNOR B | 0,0->1; 0,1->0; 1,0->0; 1,1->1 |

**Universality**: NAND and NOR are each functionally complete -- any Boolean function can be built using only NAND gates (or only NOR gates).

---

## 1.2 Boolean Algebra

### Fundamental Laws

| Law | AND form | OR form |
|-----|----------|---------|
| Identity | A . 1 = A | A + 0 = A |
| Null | A . 0 = 0 | A + 1 = 1 |
| Idempotent | A . A = A | A + A = A |
| Complement | A . /A = 0 | A + /A = 1 |
| Commutative | A . B = B . A | A + B = B + A |
| Associative | (A.B).C = A.(B.C) | (A+B)+C = A+(B+C) |
| Distributive | A.(B+C) = A.B+A.C | A+(B.C) = (A+B).(A+C) |
| Absorption | A.(A+B) = A | A+A.B = A |

### De Morgan's Laws

These are critical and used constantly:

```
/(A . B) = /A + /B        (NOT of AND = OR of NOTs)
/(A + B) = /A . /B        (NOT of OR = AND of NOTs)
```

**Generalized**: For n variables:
```
/(A1 . A2 . ... . An) = /A1 + /A2 + ... + /An
/(A1 + A2 + ... + An) = /A1 . /A2 . ... . /An
```

### Worked Example (from TD1)

**Prove**: /(A./B + /A.B) = /A./B + A.B

**Solution using De Morgan**:
```
/(A./B + /A.B)
= /(A./B) . /(/A.B)           -- De Morgan on OR
= (/A + B) . (A + /B)         -- De Morgan on each AND
= /A.A + B.A + /A./B + B./B   -- Distribute
= 0 + A.B + /A./B + 0         -- Complement law
= /A./B + A.B                  -- QED
```

This result is important: the negation of XOR is XNOR (same values = 1).

### Another Example (from TD1)

**Prove**: A.B + A.C.D + /B.D = A.B + /B.D

**Strategy**: Expand A.B to cover all cases where A.B is true regardless of C and D, show that A.C.D is already included.

```
A.B = A.B.(C+/C).(D+/D) = A.B./C./D + A.B.C./D + A.B./C.D + A.B.C.D
```

A.C.D with A=1 expands to A./B.C.D + A.B.C.D. The A.B.C.D term is already in A.B's expansion. The A./B.C.D term is covered by /B.D. Therefore A.C.D adds nothing new, and A.B + /B.D is the minimal form.

---

## 1.3 Truth Tables and Canonical Forms

### Minterms and Maxterms

For n input variables, there are 2^n possible input combinations.

- **Minterm**: A product (AND) term where every variable appears exactly once (complemented or not). Each minterm equals 1 for exactly one row of the truth table.
- **Maxterm**: A sum (OR) term where every variable appears exactly once. Each maxterm equals 0 for exactly one row.

**Sum of Minterms (SOP)**: F = sum of minterms where F=1
**Product of Maxterms (POS)**: F = product of maxterms where F=0

### Example: S = 1 if N = 0, 3, 5, or 7 (N coded on 3 bits C,B,A)

From TD2 Exercise 6:

| C | B | A | S |
|---|---|---|---|
| 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 |
| 1 | 1 | 1 | 1 |

SOP = /C./B./A + /C.B.A + C./B.A + C.B.A

Simplified: S = /A./B./C + A.(B + C)

---

## 1.4 Karnaugh Maps

Karnaugh maps are a visual method for simplifying Boolean expressions. They work best for 2, 3, or 4 variables.

### Rules

1. **Adjacent cells differ by exactly one variable** (Gray code ordering)
2. **Group cells containing 1** into rectangles of size 1, 2, 4, 8, 16 (powers of 2)
3. **Groups can wrap around** edges of the map
4. **Each group eliminates variables** that change within it
5. **Make groups as large as possible** to maximize simplification
6. **Every 1 must be covered** by at least one group

### 2-Variable Map

```
      B=0   B=1
A=0 | f(0,0) | f(0,1) |
A=1 | f(1,0) | f(1,1) |
```

### 3-Variable Map

```
        BC=00  BC=01  BC=11  BC=10
A=0   |      |      |      |      |
A=1   |      |      |      |      |
```

Note: BC ordering is 00, 01, 11, 10 (Gray code, NOT binary order).

### 4-Variable Map

```
        CD=00  CD=01  CD=11  CD=10
AB=00 |      |      |      |      |
AB=01 |      |      |      |      |
AB=11 |      |      |      |      |
AB=10 |      |      |      |      |
```

### Worked Example: Binary to Gray Code Transcoder (from TD1)

For output bit b (given inputs A, B, C, D):

```
        CD=00  CD=01  CD=11  CD=10
AB=00 |  0   |  0   |  0   |  0   |
AB=01 |  1   |  1   |  1   |  1   |
AB=11 |  0   |  0   |  0   |  0   |
AB=10 |  1   |  1   |  1   |  1   |
```

The 1s form two horizontal bands. Grouping: b = /A.B + A./B = A XOR B

Complete transcoder results:
- a = A
- b = A XOR B (= /A.B + A./B)
- c = B XOR C (= /B.C + B./C)
- d = C XOR D (= /C.D + C./D)

**Key insight**: Gray code is generated by XORing adjacent bits of the binary input.

### Worked Example: Transistor Classification (from TD1)

Inputs: F (frequency), B (bandwidth), G (gain), Z (impedance)

C1 = F . (B.Z + B.G + Z.G) -- correct frequency + at least 2 of 3 others correct

C2 = /F.B.G.Z + F.(/B./G + /B./Z + /G./Z) -- only freq wrong, or freq right but 2+ others wrong

C3 = /F . (/G + /B + /Z) -- freq wrong and at least one other wrong

---

## 1.5 Combinational Building Blocks

### Multiplexer (MUX)

A multiplexer selects one of 2^n inputs based on n selection bits.

**2-to-1 MUX**: Output = /S.I0 + S.I1
**4-to-1 MUX**: Output = /S1./S0.I0 + /S1.S0.I1 + S1./S0.I2 + S1.S0.I3

**Key property**: A 2^n-to-1 MUX can implement ANY function of n+1 variables. This makes multiplexers extremely powerful.

From TD2 Exercise 6: To implement S(C,B,A) using a MUX, use C,B as selection inputs and wire A or /A or 0 or 1 to the data inputs based on the truth table.

### Decoder

A decoder activates exactly one of 2^n outputs based on n inputs.

**3-to-8 decoder**: Input 101 activates output line 5.

**Application**: Combined with OR gates, a decoder can implement any Boolean function. From TD2 Exercise 7, a VU-meter controller uses a decoder to activate LED segments based on input level.

### Encoder

The inverse of a decoder: given 2^n input lines (at most one active), outputs the n-bit binary code of the active line.

### Adder

**Half adder**: Sum = A XOR B, Carry = A AND B
**Full adder**: Sum = A XOR B XOR Cin, Cout = A.B + (A XOR B).Cin
**Ripple-carry adder**: Chain n full adders for n-bit addition

From TD2 Exercise 3: A circuit computing X+Y, 2X+Y, or X+2Y uses adders with shift operations (multiplying by 2 = left shift by 1).

---

## 1.6 Number Systems

### Binary, Octal, Hexadecimal Conversions (from TD2)

| Binary | Decimal | Hex | Octal |
|--------|---------|-----|-------|
| 0011001 | 25 | 19 | 31 |
| 100001 | 33 | 21 | 41 |
| 0101101 | 45 | 2D | 55 |
| 11010 | 26 | 1A | 32 |
| 1111111 | 127 | 7F | 177 |

**Method**: For binary to decimal, sum powers of 2. For binary to hex, group in 4-bit chunks from the right. For binary to octal, group in 3-bit chunks.

### Two's Complement (Signed Integers)

For n bits, range is [-2^(n-1), 2^(n-1) - 1].

**To negate** a number in two's complement: invert all bits, add 1.

**Example** (from TD2): +63 on 8 bits = 00111111. -63 = 11000001.

**Addition** (from TD2): 30 + (-8)
```
 30 = 011110
 -8 = 111000
-----------
 22 = 010110
```

### Encoding Precision (from TD1)

- Ship heading with 1-degree precision: need 360 values -> ceil(log2(360)) = 9 bits
- Ship heading with 0.1-degree precision: need 3600 values -> ceil(log2(3600)) = 12 bits

### ASCII Case Conversion (from TD1)

- Lowercase to uppercase: clear bit 5 -> X AND 0b01011111
- Toggle case: flip bit 5 -> X XOR 0b00100000

---

## 1.7 Common Pitfalls

1. **Karnaugh map column ordering**: Use Gray code (00, 01, 11, 10), NOT binary (00, 01, 10, 11). Getting this wrong invalidates all groupings.

2. **Don't-care conditions**: If certain input combinations cannot occur, mark them as "don't care" (X) in the Karnaugh map and group them with 1s or 0s as convenient.

3. **Incomplete simplification**: Always check if groups can be made larger. A group of 2 that could be a group of 4 means you have a non-minimal expression.

4. **De Morgan errors**: The most common mistake is forgetting to change AND to OR (or vice versa) when complementing. Always check: NOT(AND) = OR(NOTs), NOT(OR) = AND(NOTs).

5. **Overflow in two's complement**: Adding two positive numbers can give a negative result (or vice versa) if the result exceeds the representable range.

---

## CHEAT SHEET -- Combinational Logic

```
BOOLEAN ALGEBRA IDENTITIES:
  A + 0 = A          A . 1 = A
  A + 1 = 1          A . 0 = 0
  A + A = A          A . A = A
  A + /A = 1         A . /A = 0
  A + A.B = A        A.(A+B) = A        (absorption)

DE MORGAN:
  /(A.B) = /A + /B
  /(A+B) = /A . /B

XOR:
  A XOR B = A./B + /A.B
  /(A XOR B) = A.B + /A./B = XNOR

KARNAUGH MAP ORDERING (4 variables):
  Columns CD: 00, 01, 11, 10
  Rows AB:    00, 01, 11, 10
  Groups: 1, 2, 4, 8, 16 cells (powers of 2)
  Groups CAN wrap around edges

COMMON BUILDING BLOCKS:
  MUX 2-to-1:  out = /S.I0 + S.I1
  Half Adder:  Sum = A XOR B, Carry = A.B
  Full Adder:  Sum = A XOR B XOR Cin, Cout = A.B + Cin.(A XOR B)

TWO'S COMPLEMENT (n bits):
  Range: [-2^(n-1), 2^(n-1) - 1]
  Negate: invert all bits, add 1
  8 bits: [-128, 127]
  16 bits: [-32768, 32767]

GRAY CODE CONVERSION:
  a = A
  b = A XOR B
  c = B XOR C
  d = C XOR D
```
