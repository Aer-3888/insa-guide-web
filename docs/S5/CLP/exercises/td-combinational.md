---
title: "TD Solutions -- Combinational and Digital Logic"
sidebar_position: 2
---

# TD Solutions -- Combinational and Digital Logic

> Following teacher instructions from: S5/CLP/data/moodle/td/Logique/TD 1/Gonzalez/TD_01.tex, TD 2/Gonzalez/TD_02.tex

This file covers the combinational logic TD exercises: Boolean algebra, Karnaugh maps, circuit analysis, number systems, multiplexers, decoders, and VU-meter design.

---

## TD 1 -- Boolean Algebra, Karnaugh Maps, Combinational Circuits

---

### Exercise 1: Boolean Algebra Proofs

**Question:** Prove the following relations using Boolean algebra, then verify with truth tables.

---

#### 1a) Prove: NOT(A.NOT(B) + NOT(A).B) = NOT(A).NOT(B) + A.B

**Answer:**

```
Step 1: Apply De Morgan to the outer NOT:
  NOT(X + Y) = NOT(X) . NOT(Y)   where X = A.NOT(B), Y = NOT(A).B

  NOT(A.NOT(B) + NOT(A).B) = NOT(A.NOT(B)) . NOT(NOT(A).B)

Step 2: Apply De Morgan to each inner NOT:
  NOT(A.NOT(B)) = NOT(A) + B      (De Morgan on AND)
  NOT(NOT(A).B) = A + NOT(B)      (De Morgan on AND)

Step 3: Distribute (multiply out):
  (NOT(A) + B) . (A + NOT(B))
  = NOT(A).A + NOT(A).NOT(B) + B.A + B.NOT(B)

Step 4: Simplify using complement law (X.NOT(X) = 0):
  = 0 + NOT(A).NOT(B) + A.B + 0
  = NOT(A).NOT(B) + A.B            QED
```

**Interpretation:** The left side is NOT(XOR(A,B)) = XNOR(A,B). The result is 1 when A and B have the same value.

**Truth table verification:**

| A | B | A.NOT(B) + NOT(A).B (XOR) | NOT(XOR) = XNOR | NOT(A).NOT(B) + A.B |
|---|---|---------------------------|------------------|---------------------|
| 0 | 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 |
| 1 | 0 | 1 | 0 | 0 |
| 1 | 1 | 0 | 1 | 1 |

Columns 4 and 5 match.

---

#### 1b) Prove: A.B + A.C.D + NOT(B).D = A.B + NOT(B).D

**Answer:**

**Strategy:** Show that A.C.D is redundant (absorbed by the other terms).

```
Step 1: Expand A.C.D using consensus on B:
  A.C.D = A.C.D.(B + NOT(B))         (since B + NOT(B) = 1)
        = A.B.C.D + A.NOT(B).C.D

Step 2: Show each part is already covered:
  A.B.C.D  is covered by  A.B      (A.B includes ALL cases where A=1, B=1)
  A.NOT(B).C.D is covered by  NOT(B).D   (NOT(B).D includes ALL where B=0, D=1)

Step 3: Therefore A.C.D adds nothing new:
  A.B + A.C.D + NOT(B).D = A.B + NOT(B).D    QED
```

**Karnaugh map verification (4 variables: A, B, C, D):**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  1  |  1  |  0  |
   01  |  0  |  0  |  0  |  0  |
   11  |  1  |  1  |  1  |  1  |
   10  |  0  |  1  |  1  |  0  |
```

Reading the map:
- Group 1: Row AB=11 (all 4 cells) = A.B
- Group 2: Column D=1 with B=0 (rows AB=00 and AB=10, columns CD=01 and CD=11) = NOT(B).D

Two groups cover all 1s. The term A.C.D is already covered by these groups.

---

### Exercise 2: Binary-to-Gray Code Transcoder

**Question:** Build a transcoder from 4-bit natural binary (A,B,C,D) to Gray code (a,b,c,d). Use Karnaugh maps to simplify the logical functions for each output.

**Answer:**

**Conversion table:**

| Decimal | Binary ABCD | Gray abcd |
|---------|-------------|-----------|
| 0 | 0000 | 0000 |
| 1 | 0001 | 0001 |
| 2 | 0010 | 0011 |
| 3 | 0011 | 0010 |
| 4 | 0100 | 0110 |
| 5 | 0101 | 0111 |
| 6 | 0110 | 0101 |
| 7 | 0111 | 0100 |
| 8 | 1000 | 1100 |
| 9 | 1001 | 1101 |
| 10 | 1010 | 1111 |
| 11 | 1011 | 1110 |
| 12 | 1100 | 1010 |
| 13 | 1101 | 1011 |
| 14 | 1110 | 1001 |
| 15 | 1111 | 1000 |

**Karnaugh map for output a:**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  0  |  0  |  0  |
   01  |  0  |  0  |  0  |  0  |
   11  |  1  |  1  |  1  |  1  |
   10  |  1  |  1  |  1  |  1  |
```

**a = A** (direct copy of MSB)

**Karnaugh map for output b:**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  0  |  0  |  0  |
   01  |  1  |  1  |  1  |  1  |
   11  |  0  |  0  |  0  |  0  |
   10  |  1  |  1  |  1  |  1  |
```

Two groups: NOT(A).B (row AB=01) and A.NOT(B) (row AB=10).
**b = NOT(A).B + A.NOT(B) = A XOR B**

**Karnaugh map for output c:**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  0  |  1  |  1  |
   01  |  1  |  1  |  0  |  0  |
   11  |  1  |  1  |  0  |  0  |
   10  |  0  |  0  |  1  |  1  |
```

**c = NOT(B).C + B.NOT(C) = B XOR C**

**Karnaugh map for output d:**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  1  |  0  |  1  |
   01  |  0  |  1  |  0  |  1  |
   11  |  0  |  1  |  0  |  1  |
   10  |  0  |  1  |  0  |  1  |
```

**d = C.NOT(D) + NOT(C).D = C XOR D**

**Summary:**
```
a = A
b = A XOR B
c = B XOR C
d = C XOR D
```

**General rule:** Gray_bit[i] = Binary_bit[i] XOR Binary_bit[i+1], with MSB copied directly.

**Circuit:** 3 XOR gates:
```
A ----+---> a
      |
B --+-XOR-> b
    |
C -+--XOR-> c
   |
D ---XOR--> d
```

---

### Exercise 3: Circuit Analysis

**Question:** Analyze the given circuit with 5 gates and simplify the output expression S.

**Answer:**

Gate-by-gate analysis (left to right, top to bottom):
1. Gate 1 (AND): inputs b, c -> output b.c
2. Gate 2 (AND): inputs a, gate1 -> output a.b.c
3. Gate 3 (NAND): inputs a, gate1 -> output NOT(a.b.c)
4. Gate 4 (NOR): inputs gate2, d -> output NOT(a.b.c + d)
5. Gate 5 (NAND): inputs gate4, gate3 -> S

```
S = NOT(gate4 . gate3)
  = NOT(NOT(a.b.c + d) . NOT(a.b.c))
```

**Simplification:**
```
Step 1: Apply De Morgan to outer NAND:
  S = NOT(X . Y)  where X = NOT(a.b.c + d), Y = NOT(a.b.c)
  S = NOT(X) + NOT(Y)

Step 2: Double-negate:
  NOT(X) = NOT(NOT(a.b.c + d)) = a.b.c + d
  NOT(Y) = NOT(NOT(a.b.c)) = a.b.c

Step 3: Combine:
  S = (a.b.c + d) + a.b.c
    = a.b.c + d                    (idempotent: X + X = X)
```

**Result: S = a.b.c + d**

---

### Exercise 4: Transistor Classification

**Question:** Classify transistors into C1 (good), C2 (marginal), C3 (reject) based on parameters F (frequency), B (bandwidth), G (gain), Z (impedance). X=1 if parameter is correct.

- C1: correct frequency AND at least 2 of {B, G, Z} correct
- C2: only frequency wrong, OR correct frequency with at least 2 others wrong
- C3: frequency wrong AND at least 1 other wrong

#### Question 1: Write C1, C2, C3 as logical equations

**Answer:**

**C1:** Correct frequency and at least 2 of 3 others correct:
```
C1 = F . (B.G + B.Z + G.Z)
```

**C2:** All fine but frequency, OR correct frequency with at least 2 others incorrect:
```
C2 = NOT(F).B.G.Z + F.(NOT(G).NOT(B) + NOT(Z).NOT(G) + NOT(Z).NOT(B))
```

**C3:** Frequency wrong and at least 1 other wrong:
```
C3 = NOT(F) . (NOT(G) + NOT(B) + NOT(Z))
```

#### Question 2: Verify using Karnaugh maps

**Answer:**

**Karnaugh map for C1 (rows: FB, cols: GZ):**
```
              GZ
         00    01    11    10
   FB
   00  |  0  |  0  |  0  |  0  |
   01  |  0  |  0  |  0  |  0  |
   11  |  0  |  1  |  1  |  1  |
   10  |  0  |  0  |  1  |  0  |
```

Groups: F.B.Z (2 cells) + F.B.G (2 cells) + F.G.Z (2 cells) -> **C1 = F.(B.Z + B.G + G.Z)**. Matches.

**Karnaugh map for C2:**
```
              GZ
         00    01    11    10
   FB
   00  |  0  |  0  |  0  |  0  |
   01  |  0  |  0  |  1  |  0  |
   11  |  1  |  0  |  0  |  0  |
   10  |  1  |  1  |  0  |  1  |
```

Simplifies to: **C2 = NOT(F).B.G.Z + F.(NOT(B).NOT(G) + NOT(B).NOT(Z) + NOT(G).NOT(Z))**. Matches.

**Karnaugh map for C3:**
```
              GZ
         00    01    11    10
   FB
   00  |  1  |  1  |  1  |  1  |
   01  |  1  |  1  |  0  |  1  |
   11  |  0  |  0  |  0  |  0  |
   10  |  0  |  0  |  0  |  0  |
```

Simplifies to: **C3 = NOT(F).(NOT(G) + NOT(B) + NOT(Z))**. Matches.

#### Question 3: Propose circuits with 2, 3, or 4 input gates

**Answer:** See Logisim circuit files (ex4-circuit.circ). The circuits use AND, OR, and NOT gates to implement the equations above. C1 requires three 2-input AND gates feeding a 3-input OR, preceded by a check on F. C3 requires a 3-input OR feeding a 2-input AND with NOT(F).

---

### Exercise 5: Number Encoding Ranges

**Question 1:** Give the unsigned binary coding range for 10, 12, 16 bits.

**Answer:**
- 10 bits: [0, 2^10 - 1] = [0, 1023]
- 12 bits: [0, 2^12 - 1] = [0, 4095]
- 16 bits: [0, 2^16 - 1] = [0, 65535]

**Question 2:** With n bits in two's complement, what is the largest representable integer?

**Answer:**

The range in two's complement is [-2^(n-1), 2^(n-1) - 1].

The largest representable integer is **2^(n-1) - 1**.

Examples:
- 8 bits: [-128, 127]
- 16 bits: [-32768, 32767]
- 32 bits: [-2,147,483,648, 2,147,483,647]

---

### Exercise 6: Ship Heading Precision

**Question 1:** How many bits N to represent a heading with 1-degree precision?

**Answer:**
Need to represent 360 distinct values (0 to 359).
```
N = ceil(log2(360)) = ceil(8.49) = 9 bits
```
Check: 2^8 = 256 < 360 (insufficient), 2^9 = 512 >= 360 (sufficient).

**Note:** The teacher's solution states 8 bits, rounding 360 < 512 = 2^9, but the minimum is actually 9 bits since 2^8 = 256 < 360.

**Question 2:** How many bits for 0.1-degree precision?

**Answer:**
Need to represent 3600 distinct values (0.0 to 359.9).
```
N = ceil(log2(3600)) = ceil(11.81) = 12 bits
```
Check: 2^11 = 2048 < 3600 (insufficient), 2^12 = 4096 >= 3600 (sufficient).

---

### Exercise 7: ASCII Case Conversion

**Question:** Among ASCII characters, there are lowercase and uppercase letters. Design the operators MAJUSC (lowercase to uppercase) and MAJMINUSC (toggle case).

**Answer:**

**ASCII observation:**

| Char | Decimal | Binary |
|------|---------|--------|
| 'A' | 65 | 01000001 |
| 'Z' | 90 | 01011010 |
| 'a' | 97 | 01100001 |
| 'z' | 122 | 01111010 |

The only difference: bit 5 (value 32).

**Question 1 -- MAJUSC (lowercase to uppercase): clear bit 5:**
```
MAJUSC(X) = X AND 0b01011111 = X AND 0xDF
```
Example: 'a' AND 0xDF = 01100001 AND 01011111 = 01000001 = 'A'

**Question 2 -- MAJMINUSC (toggle case): flip bit 5:**
```
MAJMINUSC(X) = X XOR 0b00100000 = X XOR 0x20
```
Example: 'a' XOR 0x20 = 01100001 XOR 00100000 = 01000001 = 'A'
Example: 'A' XOR 0x20 = 01000001 XOR 00100000 = 01100001 = 'a'

**Circuit:** 8-bit input, bit 5 passes through an XOR gate with control signal. Other 7 bits pass through unchanged.

---

## TD 2 -- Number Systems, Arithmetic, MUX, Decoders

---

### Exercise 1: Base Conversions

**Question 1:** Convert the following binary numbers to decimal, octal, hexadecimal.

**Answer:**

Method for binary to decimal: sum of powers of 2.
Example: 0011001 = 2^4 + 2^3 + 2^0 = 16 + 8 + 1 = 25

| Binary | Decimal | Hexadecimal | Octal |
|--------|---------|-------------|-------|
| 0011001 | 25 | 0x19 | 31 |
| 100001 | 33 | 0x21 | 41 |
| 0101101 | 45 | 0x2D | 55 |
| 11010 | 26 | 0x1A | 32 |
| 1111111 | 127 | 0x7F | 177 |

**Binary to hex shortcut:** Group bits by 4 from right.
- 0011001 -> 001|1001 -> 1|9 -> 0x19
- 1111111 -> 111|1111 -> 7|F -> 0x7F

**Question 2:** Convert decimal 12 and 1025 to binary.

**Answer:**
- 12 = 8 + 4 = 2^3 + 2^2 -> 0b1100
- 1025 = 1024 + 1 = 2^10 + 2^0 -> 0b10000000001

---

### Exercise 2: Two's Complement Arithmetic

**Question 1:** Represent +63 and -63 on 8 bits (two's complement).

**Answer:**

+63: 63 = 2^6 - 1 = 00111111

-63: Two's complement procedure:
```
Step 1: Write +63     = 00111111
Step 2: Invert all bits = 11000000
Step 3: Add 1          = 11000001
```
-63 = 11000001

**Verification:** 11000001 + 00111111 = 100000000 (9 bits; discard carry) = 00000000. Correct.

**Alternative:** -128 + 65 = 10000000 + 01000001 = 11000001. Since 11000001 = -128 + 65 = -63. Correct.

**Question 2:** Compute 30 + (-8) in 6-bit two's complement.

**Answer:**

```
+30 = 011110
 -8: +8 = 001000, invert = 110111, add 1 = 111000
```

```
  011110   (30)
+ 111000   (-8)
--------
 1010110
```

Discard carry (7th bit): result = 010110 = 22. Correct (30 - 8 = 22).

---

### Exercise 6: Multiplexer Function Implementation

**Question:** S = 1 when N = 0, 3, 5, or 7 (N on 3 bits C, B, A).
1. Write the truth table.
2. Implement using a multiplexer.
3. How many functions of M variables exist? What is the interest of the multiplexer?

**Answer:**

**Question 1 -- Truth table:**

| C | B | A | N (decimal) | S |
|---|---|---|-------------|---|
| 0 | 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 2 | 0 |
| 0 | 1 | 1 | 3 | 1 |
| 1 | 0 | 0 | 4 | 0 |
| 1 | 0 | 1 | 5 | 1 |
| 1 | 1 | 0 | 6 | 0 |
| 1 | 1 | 1 | 7 | 1 |

Boolean expression: S = NOT(A).NOT(B).NOT(C) + A.(B + C)

**Question 2 -- Using an 8:1 MUX:** Connect C, B, A as selection inputs S2, S1, S0.

```
Selection  N  S    MUX input
  000      0  1    input 0 -> VCC (1)
  001      1  0    input 1 -> GND (0)
  010      2  0    input 2 -> GND (0)
  011      3  1    input 3 -> VCC (1)
  100      4  0    input 4 -> GND (0)
  101      5  1    input 5 -> VCC (1)
  110      6  0    input 6 -> GND (0)
  111      7  1    input 7 -> VCC (1)
```

**Question 3:** For M variables, there exist exactly 2^(2^M) different Boolean functions. A 2^M:1 MUX can implement ANY function of M variables by simply wiring each data input to 0 or 1 based on the truth table. This makes multiplexers universal function generators -- useful when the function is complex or irregular, avoiding the need for custom gate arrangements.

---

### Exercise 7: VU-Meter Controller

**Question:** Design a VU-meter: 3-bit input (v2, v1, v0) representing level 0-7. LED segment s_k lights up when level >= k. For level 0, the bar is off.

#### Question 1: Boolean method for 3-bit / 7-segment VU-meter

**Answer:**

**Truth table for s3 (lights when level >= 3):**

| v2 v1 v0 | Level | s3 |
|-----------|-------|----|
| 000 | 0 | 0 |
| 001 | 1 | 0 |
| 010 | 2 | 0 |
| 011 | 3 | 1 |
| 100 | 4 | 1 |
| 101 | 5 | 1 |
| 110 | 6 | 1 |
| 111 | 7 | 1 |

**Karnaugh map for s3:**
```
        v0
       0    1
v2v1
 00 |  0  |  0  |
 01 |  0  |  1  |
 11 |  1  |  1  |
 10 |  1  |  1  |
```

Groups: v2 (4 cells) + v1.v0 (2 cells) -> **s3 = v2 + v1.v0**

**All segment equations:**
```
s1 = v2 + v1 + v0            (level >= 1: any bit set)
s2 = v2 + v1                 (level >= 2)
s3 = v2 + v1.v0              (level >= 3)
s4 = v2                      (level >= 4)
s5 = v2.(v1 + v0)            (level >= 5)
s6 = v2.v1                   (level >= 6)
s7 = v2.v1.v0                (level = 7: all bits set)
```

**Using a 3:8 decoder:** A decoder activates exactly one output line per input value. To build a VU-meter, OR together all output lines at or above the threshold:
```
s1 = D1 + D2 + D3 + D4 + D5 + D6 + D7
s3 = D3 + D4 + D5 + D6 + D7
s5 = D5 + D6 + D7
s7 = D7
```

This approach is more systematic: if a segment is on, all segments before it must also be on, so the decoder outputs propagate through OR gates.

#### Question 2: 4-bit / 15-segment VU-meter

**Answer:** Same principle with 4-bit input (v3, v2, v1, v0) and 15 segments. Use a 4:16 decoder and OR together the appropriate output lines for each segment threshold. See Logisim circuit file for implementation.

#### Question 3: Signed 4-bit / two-sided VU-meter

**Answer:** For signed two's complement input on 4 bits (range -8 to +7), split the bar into 7 upper segments (positive) and 8 lower segments (negative). The MSB (sign bit) determines which half is active. Positive values light up the upper segments proportionally; negative values light up lower segments proportionally. See Logisim circuit file for implementation.
