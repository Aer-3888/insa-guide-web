---
title: "TD Solutions -- Sequential Logic: Complete Walkthroughs"
sidebar_position: 4
---

# TD Solutions -- Sequential Logic: Complete Walkthroughs

## TD 3 -- Flip-Flops, State Machines (Moore/Mealy)

### Exercise 1: Flip-Flop Conversions

The fundamental flip-flop types have these characteristic equations:

| Type | Equation | Behavior |
|------|----------|----------|
| D | Q(t+1) = D | Output follows input |
| T | Q(t+1) = T XOR Q | Toggle when T=1, hold when T=0 |
| JK | Q(t+1) = J./Q + /K.Q | Set when J=1, Reset when K=1, Toggle when J=K=1 |
| RS | Q(t+1) = S + /R.Q | Set when S=1, Reset when R=1 (S=R=1 forbidden) |

**1a) Build RS from D flip-flop**

We need D such that the D flip-flop behaves like RS.

RS behavior:
| S | R | Q(t+1) |
|---|---|--------|
| 0 | 0 | Q (hold) |
| 0 | 1 | 0 (reset) |
| 1 | 0 | 1 (set) |
| 1 | 1 | undefined |

```
D = S + /R . Q
```

**Verification**:
- S=0, R=0: D = 0 + 1.Q = Q (hold)
- S=0, R=1: D = 0 + 0.Q = 0 (reset)
- S=1, R=0: D = 1 + 1.Q = 1 (set)

**1a) Build JK from D flip-flop**

JK characteristic: Q(t+1) = J./Q + /K.Q

```
D = J./Q + /K.Q
```

**Circuit**: Two AND gates (J with /Q, /K with Q) feeding an OR gate into D.

**1b) Build D from T flip-flop**

T toggles when T=1. We want Q(t+1) = D.

When D != Q, we need to toggle (T=1). When D == Q, hold (T=0).

```
T = D XOR Q
```

**Verification**:
- D=0, Q=0: T = 0 XOR 0 = 0 (hold at 0)
- D=0, Q=1: T = 0 XOR 1 = 1 (toggle from 1 to 0)
- D=1, Q=0: T = 1 XOR 0 = 1 (toggle from 0 to 1)
- D=1, Q=1: T = 1 XOR 1 = 0 (hold at 1)

**1c) Build D from JK**

Set J and K so that Q follows D:
```
J = D,  K = /D
```

| D | J | K | Action | Q(t+1) |
|---|---|---|--------|--------|
| 0 | 0 | 1 | Reset | 0 = D |
| 1 | 1 | 0 | Set | 1 = D |

**1c) Build T from JK**

Toggle when T=1, hold when T=0:
```
J = T,  K = T
```

| T | J | K | Action |
|---|---|---|--------|
| 0 | 0 | 0 | Hold |
| 1 | 1 | 1 | Toggle |

---

### Exercise 2: Moore Machine Analysis

**Circuit description**: Two D flip-flops (outputs S1, S2). 
- D1 = R . S2 (input of flip-flop 1)
- D2 = R . S1 (input of flip-flop 2)
- Outputs = (S2, S1) (state IS the output -- Moore machine)

**Derivation of state table**:

The next state depends on current state (S2, S1) and input R.

When R = 0:
```
D1 = 0 . S2 = 0  ->  S1(t+1) = 0
D2 = 0 . S1 = 0  ->  S2(t+1) = 0
```
For ANY current state, if R=0, next state = (0,0).

When R = 1:
```
D1 = 1 . S2 = S2  ->  S1(t+1) = S2 (current S2 becomes next S1)
D2 = 1 . S1 = S1  ->  S2(t+1) = S1 (current S1 becomes next S2)
```

**Complete state table**:

| R | (S2,S1) current | (S2,S1) next |
|---|------------------|--------------|
| 0 | 00 | 00 |
| 0 | 01 | 00 |
| 0 | 10 | 00 |
| 0 | 11 | 00 |
| 1 | 00 | 00 |
| 1 | 01 | 10 |
| 1 | 10 | 01 |
| 1 | 11 | 11 |

Wait -- let me re-derive. S1 corresponds to flip-flop 1 output, S2 to flip-flop 2 output.

D1 = R AND S2 means: S1(t+1) = R . S2(t)
D2 = R AND S1 means: S2(t+1) = R . S1(t)

| R | S2(t) | S1(t) | S1(t+1)=R.S2 | S2(t+1)=R.S1 |
|---|-------|-------|-------------|-------------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 | 0 |
| 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 1 | 0 |
| 1 | 1 | 1 | 1 | 1 |

**State diagram**:
```
          R=0         R=0         R=0
(00) <---------- (01) <---- (11) ---+
 |                                   |
 | R=1           R=1          R=1    |
 +------> (00)   (01)-->(10)  (11)--+
```

More precisely:
```
(00) --R=0--> (00)
(00) --R=1--> (00)
(01) --R=0--> (00)
(01) --R=1--> (10)   [S1 and S2 swap values]
(10) --R=0--> (00)
(10) --R=1--> (01)   [S1 and S2 swap values]
(11) --R=0--> (00)
(11) --R=1--> (11)
```

**Timing diagram** for input sequence R = 0, 1, 1, 0, 1 (starting from S1=S2=0):

| Clock | R | S1(t) | S2(t) | S1(t+1) | S2(t+1) |
|-------|---|-------|-------|---------|---------|
| 0 | - | 0 | 0 | - | - |
| 1 | 0 | 0 | 0 | 0 | 0 |
| 2 | 1 | 0 | 0 | 0 | 0 |
| 3 | 1 | 0 | 0 | 0 | 0 |
| 4 | 0 | 0 | 0 | 0 | 0 |
| 5 | 1 | 0 | 0 | 0 | 0 |

This particular sequence never leaves state (00) because R=1 from (00) goes to (00). To reach other states, you would need to somehow get to (01) or (10) first (e.g., by initializing the flip-flops).

---

### Exercise 3: Edge Detector (Mealy Machine)

**Problem**: Detect rising edges (0 to 1) and falling edges (1 to 0) on input e.
- s1 = 1 for exactly one clock cycle after a rising edge
- s2 = 1 for exactly one clock cycle after a falling edge

**Design approach**: We need to remember the PREVIOUS value of e to detect transitions. One state variable (1 flip-flop) suffices.

**State encoding**: Q = previous value of e.
- State 0 (Q=0): previous input was 0
- State 1 (Q=1): previous input was 1

**This is a Mealy machine** because the outputs (s1, s2) depend on both the state (Q) AND the current input (e).

**State/output table**:

| Q (previous e) | e (current) | Q(t+1) | s1 (rising) | s2 (falling) |
|----------------|-------------|---------|-------------|--------------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | **1** | 0 |
| 1 | 0 | 0 | 0 | **1** |
| 1 | 1 | 1 | 0 | 0 |

**Implementation equations**:
```
Q(t+1) = e           (next state = current input, use a D flip-flop)
s1 = e . /Q           (rising: input is 1, previous was 0)
s2 = /e . Q           (falling: input is 0, previous was 1)
```

**Circuit**: 1 D flip-flop + 2 AND gates.

```
e ----+----+----> D flip-flop ----> Q
      |    |                         |
      |    +--- AND (/Q) ---> s1    |
      |                              |
      +-------- AND (Q, /e) --> s2  |
               (with NOT on e)
```

**Timing diagram** for e = 0, 0, 1, 1, 0, 1, 0:

| Clock | e | Q | s1 | s2 |
|-------|---|---|----|----|
| 1 | 0 | 0 | 0 | 0 |
| 2 | 0 | 0 | 0 | 0 |
| 3 | 1 | 0 | **1** | 0 |
| 4 | 1 | 1 | 0 | 0 |
| 5 | 0 | 1 | 0 | **1** |
| 6 | 1 | 0 | **1** | 0 |
| 7 | 0 | 1 | 0 | **1** |

---

### Exercise 4: Divisibility-by-5 Detector

**Problem**: Binary digits arrive MSB first, one per clock cycle. After each bit, output whether the number received so far is divisible by 5.

**Key insight**: When we receive a new bit b, the new number is N_new = 2 * N_old + b. We only need to track the remainder mod 5 (not the entire number).

```
R(N_new) = R(2 * N_old + b) = (2 * R(N_old) + b) mod 5
```

**5 states** (remainders 0, 1, 2, 3, 4):

**Transition table**:

| Current remainder | Input bit = 0 | Input bit = 1 |
|-------------------|----------------|----------------|
| 0 | (2*0+0) mod 5 = 0 | (2*0+1) mod 5 = 1 |
| 1 | (2*1+0) mod 5 = 2 | (2*1+1) mod 5 = 3 |
| 2 | (2*2+0) mod 5 = 4 | (2*2+1) mod 5 = 0 |
| 3 | (2*3+0) mod 5 = 1 | (2*3+1) mod 5 = 2 |
| 4 | (2*4+0) mod 5 = 3 | (2*4+1) mod 5 = 4 |

**State diagram**:
```
         0            1
  +--->(0)------->(1)
  |     |          |
  | 0   |1     0   |1
  |     v          v
  +---(2)<------(3)
  |     |          |
  | 1   |0     0   |1
  |     v          v
  +---(4)------->(4)
        0           1
```

**Output**: Est_div = 1 when state = 0.

**State encoding** (3 bits: s3, s2, s1):
```
State 0 = 000
State 1 = 001
State 2 = 010
State 3 = 011
State 4 = 100
```

**Example trace**: Receiving binary 1010 (decimal 10):

| Clock | Bit received | Number so far | Remainder | Divisible? |
|-------|-------------|---------------|-----------|------------|
| init | - | 0 | 0 | Yes |
| 1 | 1 | 1 | 1 | No |
| 2 | 0 | 10 | 2 | No |
| 3 | 1 | 101 = 5 | 0 | **Yes** |
| 4 | 0 | 1010 = 10 | 0 | **Yes** |

**Implementation**: 3 D flip-flops for state + combinational logic derived from Karnaugh maps on 4 variables (s3, s2, s1, nbre).

**Karnaugh maps for next-state bits** (4 inputs: s3, s2, s1, b):

For s1(t+1):
```
           s1.b
        00    01    11    10
s3.s2
  00 |  0  |  1  |  0  |  1  |
  01 |  1  |  0  |  1  |  0  |
  10 |  1  |  1  |  -  |  -  |
  11 |  -  |  -  |  -  |  -  |
```

(Dashes are don't-cares for states 5-7 which never occur.)

---

## TD 4 -- Complex State Machines, Control Units

### Exercise 1: LED Toggle with Button

**Problem**: Pressing a button toggles an LED. LED holds its state when button is released. Must handle button bounce (held down for multiple cycles).

**4 states** encoded as (m1, m2) where m1 = LED state, m2 = button was pressed in previous state:

| State (m1,m2) | Meaning |
|----------------|---------|
| (0,0) | LED off, button was not pressed |
| (0,1) | LED off, button was pressed (debounce) |
| (1,0) | LED on, button was not pressed |
| (1,1) | LED on, button was pressed (debounce) |

**State transitions** (BP = button pressed):
```
(0,0) + BP=0 -> (0,0)   LED stays off
(0,0) + BP=1 -> (1,1)   Button pressed: toggle LED ON, enter "pressed" state
(0,1) + BP=0 -> (0,0)   Button released: stay off
(0,1) + BP=1 -> (0,1)   Button still held: DON'T toggle again
(1,0) + BP=0 -> (1,0)   LED stays on
(1,0) + BP=1 -> (0,1)   Button pressed: toggle LED OFF, enter "pressed" state
(1,1) + BP=0 -> (1,0)   Button released: stay on
(1,1) + BP=1 -> (1,1)   Button still held: DON'T toggle again
```

**Transition table**:

| BP | m1 | m2 | m1(t+1) | m2(t+1) |
|----|----|----|---------|---------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

**Karnaugh map for m1(t+1)** (inputs: BP, m1, m2):
```
         m1.m2
       00    01    11    10
  BP
   0 |  0  |  0  |  1  |  1  |
   1 |  1  |  0  |  1  |  0  |
```

Groups:
- /BP.m1 (right side, BP=0): 2 cells
- BP./m1./m2 (top-left, BP=1): 1 cell
- BP.m1.m2 (bottom-right, BP=1): 1 cell

```
m1(t+1) = /BP.m1 + BP.(m1.m2 + /m1./m2)
         = /BP.m1 + BP.XNOR(m1, m2)
```

**Karnaugh map for m2(t+1)**:
```
         m1.m2
       00    01    11    10
  BP
   0 |  0  |  0  |  0  |  0  |
   1 |  1  |  1  |  1  |  1  |
```

```
m2(t+1) = BP
```

Simple: m2 just tracks whether the button is currently pressed.

**Output**: LED = m1.

---

### Exercise 2: Sequence Detector (00, 01, 00, 10)

**Problem**: Detect the specific sequence (00), (01), (00), (10) on two input lines (e1, e2). Output S=1 for one cycle when complete sequence detected.

**4 states** tracking progress through the expected sequence:

| State (d2,d1) | Meaning |
|----------------|---------|
| (0,0) | Initial: waiting for first 00 |
| (0,1) | Seen 00, waiting for 01 |
| (1,0) | Seen 00+01, waiting for 00 |
| (1,1) | Seen 00+01+00, waiting for 10 |

**Key transitions**:

From state (0,0) "waiting for 00":
- Input 00: match, go to (0,1)
- Other: stay in (0,0)

From state (0,1) "waiting for 01":
- Input 01: match, go to (1,0)
- Input 00: could be start of new sequence, stay in (0,1)
- Other: reset to (0,0)

From state (1,0) "waiting for 00":
- Input 00: match, go to (1,1)
- Other: reset to (0,0)

From state (1,1) "waiting for 10":
- Input 10: MATCH! Output S=1, reset to (0,0)
- Input 00: could be start of new sequence, go to (0,1)
- Input 01: matches step 2, go to (1,0)
- Other: reset to (0,0)

**Equations** (derived from Karnaugh maps on inputs d2, d1, e1, e2):
```
d1(t+1) = /e1 . /e2
d2(t+1) = /e1 . (/e2.d2./d1 + d1.e2)
S = d2 . d1 . e1 . /e2
```

**Verification** with sequence (00), (01), (00), (10):

| Clock | e1,e2 | d2,d1 | S | Meaning |
|-------|-------|-------|---|---------|
| 1 | 0,0 | 0,0 | 0 | Got 00, advance |
| 2 | 0,1 | 0,1 | 0 | Got 01, advance |
| 3 | 0,0 | 1,0 | 0 | Got 00, advance |
| 4 | 1,0 | 1,1 | **1** | Got 10, DETECTED |
| 5 | ... | 0,0 | 0 | Reset |

---

### Exercise 4: Loadable Counter Control Unit

**Problem**: Implement a state machine with 4 states using a loadable counter.

States: A=0, B=1, C=2, D=3

Transitions:
```
A --(/C0)--> B (increment)
A --(C0)---> A (hold at 0, load 0)
B --(/C1)--> D (load 3)
B --(C1)---> C (increment)
C ----------> D (always increment)
D ----------> A (load 0)
```

**Loadable counter interface**:
- INC: when 1, counter increments on clock edge
- LOAD: when 1, counter loads value from data input
- DATA: value to load when LOAD=1
- Q: current counter value (state)

**Control logic**:

| State | Condition | INC | LOAD | DATA |
|-------|-----------|-----|------|------|
| 0 (A) | /C0 | 1 | 0 | -- |
| 0 (A) | C0 | 0 | 1 | 00 |
| 1 (B) | C1 | 1 | 0 | -- |
| 1 (B) | /C1 | 0 | 1 | 11 |
| 2 (C) | always | 1 | 0 | -- |
| 3 (D) | always | 0 | 1 | 00 |

**Equations** (using state bits Q1, Q0):
```
INC  = /Q1./Q0./C0 + /Q1.Q0.C1 + Q1./Q0
LOAD = /Q1./Q0.C0 + /Q1.Q0./C1 + Q1.Q0
DATA1 = /Q1.Q0./C1
DATA0 = /Q1.Q0./C1
```

---

## TD 5 -- Fibonacci Machine (UC + UT Integration)

### Complete Microprogrammed Design

See [td-processor.md](/S5/CLP/exercises/td-processor) for the full processor design walkthrough.

**Summary**:

The Fibonacci machine computes F(n) using:
- UT: registers R_N0, R_N1, counter Q, comparator, adder
- UC: 5-state microprogrammed controller with 13-bit microcode words
- Interface: 7 command signals (UC->UT), 2 condition signals (UT->UC)

**Microcode format** (13 bits per instruction):

```
[2:0]  Jump code (3 bits): selects condition to test
[5:3]  Jump address (3 bits): target state if condition true
[12:6] Commands (7 bits): which operations to activate
```

| State | Binary word | Meaning |
|-------|------------|---------|
| A (000) | 001 000 0001001 | If init, stay; else go to B. Activate RESET, RES_0 |
| B (001) | 010 011 0000000 | If /N_GT_Q, go to D; else go to C. No commands |
| C (010) | 111 001 1110000 | Always go to B. Activate N1_2_N0, SUM_N1, INC_Q |
| D (011) | 001 011 0000110 | If init, stay; else go to E. Activate RES_1, OUT_N0 |
| E (100) | 111 000 0001000 | Always go to A. Activate RES_0 |
