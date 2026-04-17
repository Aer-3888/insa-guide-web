---
title: "TD Solutions -- Processor Design: Complete Walkthroughs"
sidebar_position: 3
---

# TD Solutions -- Processor Design: Complete Walkthroughs

## Overview

This file covers the complete design methodology for building dedicated processors, including the GCD machine (cours) and Fibonacci machine (TD5). The key pattern is always the same:

1. Write the algorithm
2. Identify registers, operations, conditions
3. Design the UT (Processing Unit / Unite de Traitement)
4. Design the UC (Control Unit / Unite de Commande)
5. Choose implementation: hardwired (gates) or microprogrammed (ROM)
6. Integrate UC + UT and test

---

## GCD Machine Design (Course Example)

### Step 1: Algorithm

```
Input: A, B (integers)
Output: GCD(A, B)

INIT: load A and B from external inputs
LOOP:
    if A == B: goto DONE
    if A > B:  A = A - B
    else:      B = B - A
    goto LOOP
DONE: output A (or B, since A == B)
```

### Step 2: Identify Hardware Needs

**Registers**: A (8-bit), B (8-bit)

**Operations**:
- Subtraction (A-B or B-A)
- Comparison (A vs B: equal, greater, less)
- Load from input
- Output to result

**Conditions** (decisions the algorithm makes):
- Is A equal to B?
- Is A greater than B?

### Step 3: UT Design

```
                +--------+
External In --> |   A    |---+---> Subtractor ---> A (on A>B)
                +--------+   |        |
                             +---> Comparator ---> A_EQ_B (to UC)
                +--------+   |        |         --> A_GT_B (to UC)
External In --> |   B    |---+---> Subtractor ---> B (on A<B)
                +--------+
                     |
                     +---> Output
```

**Command signals** (from UC to UT):

| Command | Action | Active when |
|---------|--------|-------------|
| INIT | Load external inputs into A and B | Initialization state |
| A_SUB_B | A <- A - B | A > B |
| B_SUB_A | B <- B - A | A < B |
| OUTPUT | Place A on output bus | Done state |

**Condition signals** (from UT to UC):

| Condition | Meaning | Used for |
|-----------|---------|----------|
| A_EQ_B | A equals B | Detecting termination |
| A_GT_B | A greater than B | Choosing which subtraction |

### Step 4: UC as State Machine

**5 states**:

| State | Code | Description |
|-------|------|-------------|
| S0 | 000 | Initialize: load inputs |
| S1 | 001 | Compare: check A vs B |
| S2 | 010 | Subtract: A = A - B |
| S3 | 011 | Subtract: B = B - A |
| S4 | 100 | Done: output result |

**State diagram**:
```
        +---> S2 (A_SUB_B) ---+
        |                      |
S0 ---> S1 ---> S4 (A_EQ_B)   |
(INIT)  ^  |                   |
        |  +---> S3 (B_SUB_A) -+
        |                      |
        +--------- <----------+
```

**Transition table**:

| Current | Condition | Next | Active Commands |
|---------|-----------|------|-----------------|
| S0 | always | S1 | INIT |
| S1 | A_EQ_B | S4 | (none) |
| S1 | A_GT_B and not A_EQ_B | S2 | (none) |
| S1 | not A_GT_B and not A_EQ_B | S3 | (none) |
| S2 | always | S1 | A_SUB_B |
| S3 | always | S1 | B_SUB_A |
| S4 | always | S4 (or S0) | OUTPUT |

### Step 5: Hardwired UC Implementation

**3 flip-flops** (s2, s1, s0) encode the 5 states. Next-state logic is combinational.

**Next-state equations** (derived from the transition table):

```
s2(t+1) = s0 . /s1 . /s2 . A_EQ_B
           @ Only transition to S4 (100): from S1 (001) when A_EQ_B

s1(t+1) = s0 . /s1 . /s2 . /A_EQ_B . /A_GT_B
           @ Transition to S3 (011): from S1 when A < B
         + /s0 . s1 . /s2
           @ Stay in S2/S3 path (both go to S1, but s1 bit...)
```

Actually, let me derive these more carefully.

**From each state, what is the next state?**

| From | To | Condition for this transition |
|------|----|------|
| 000 (S0) | 001 (S1) | always |
| 001 (S1) | 100 (S4) | A_EQ_B |
| 001 (S1) | 010 (S2) | A_GT_B and /A_EQ_B |
| 001 (S1) | 011 (S3) | /A_GT_B and /A_EQ_B |
| 010 (S2) | 001 (S1) | always |
| 011 (S3) | 001 (S1) | always |
| 100 (S4) | 100 (S4) | always (loop) |

**Bit-level next-state equations**:

For s0(t+1) = 1 when next state has bit 0 set (S1=001, S3=011):
```
s0(t+1) = /s2./s1./s0                         @ S0 -> S1
         + /s2./s1.s0./A_EQ_B./A_GT_B         @ S1 -> S3
         + /s2.s1./s0                          @ S2 -> S1
         + /s2.s1.s0                           @ S3 -> S1
```

Simplifying:
```
s0(t+1) = /s2./s1./s0                         @ from S0
         + /s2.s1                              @ from S2 or S3
         + /s2./s1.s0./A_EQ_B./A_GT_B         @ from S1 to S3
```

For s1(t+1) = 1 when next state has bit 1 set (S2=010, S3=011):
```
s1(t+1) = /s2./s1.s0.A_GT_B./A_EQ_B          @ S1 -> S2
         + /s2./s1.s0./A_GT_B./A_EQ_B         @ S1 -> S3
         = /s2./s1.s0./A_EQ_B                 @ S1 -> S2 or S3
```

For s2(t+1) = 1 when next state has bit 2 set (S4=100):
```
s2(t+1) = /s2./s1.s0.A_EQ_B                  @ S1 -> S4
         + s2./s1./s0                          @ S4 -> S4
```

**Command generation** (active-high):
```
INIT    = /s2 . /s1 . /s0     @ State S0
A_SUB_B = /s2 . s1 . /s0      @ State S2
B_SUB_A = /s2 . s1 . s0       @ State S3
OUTPUT  = s2 . /s1 . /s0      @ State S4
```

### Step 6: Microprogrammed UC Implementation

Instead of gates, use a ROM that maps (state, conditions) to (next state, commands).

**Microcode word format** (12 bits):
```
Bits [11:9]: Jump type (3 bits)
Bits [8:6]:  Jump address (3 bits)
Bits [5:3]:  Condition select (for MUX)
Bits [2:0]:  Commands (INIT, A_SUB_B, B_SUB_A, OUTPUT)
```

Alternatively, simpler format using jump codes:

| Jump Code | Meaning |
|-----------|---------|
| 000 | Increment (go to next address) |
| 001 | Test condition, jump if true |
| 010 | Test condition, jump if false |
| 111 | Unconditional jump |

**ROM contents**:

| Address | State | Jump Code | Condition | Jump Addr | Commands |
|---------|-------|-----------|-----------|-----------|----------|
| 000 | S0 | 000 (INC) | -- | -- | INIT |
| 001 | S1 | 001 (test=jump) | A_EQ_B | 100 | -- |
| 010 | S2 | 111 (always) | -- | 001 | A_SUB_B |
| 011 | S3 | 111 (always) | -- | 001 | B_SUB_A |
| 100 | S4 | 111 (always) | -- | 100 | OUTPUT |

Wait -- S1 has a 3-way branch (S2, S3, or S4). This needs special handling. Options:

**Option A**: Two-step test at S1.
```
Address 001: Test A_EQ_B, jump to 100 if true. Else increment to 010.
Address 010: Test A_GT_B, jump to 011 if true. Else increment to 100_alt.
     (This requires re-encoding)
```

**Option B**: Re-encode states for sequential testing.
```
000: S0 (INIT), INC
001: S1-check-eq, test A_EQ_B, jump to 101 (S4)
002: S1-check-gt, test A_GT_B, jump to 011 (S2)
003: S3 (B_SUB_A), jump to 001
004: S2 (A_SUB_B), jump to 001   -- wait, numbering conflict
```

Let me use a cleaner encoding:
```
000: S0, always INC                          Commands: INIT
001: test A_EQ_B, jump to 100 if true        Commands: --
002: test A_GT_B, jump to 011 if true        Commands: --
     (falls through to 011 if false -- oops)
```

**Better approach**: Use dedicated microcode format where S1 is split into two test states:

| Addr | Label | Test | True -> | False -> | Commands |
|------|-------|------|---------|----------|----------|
| 000 | S0 | -- | 001 | 001 | INIT |
| 001 | S1a | A_EQ_B? | 100 | 010 | -- |
| 010 | S1b | A_GT_B? | 011 | 100 | -- |
| 011 | S2 | -- | 001 | 001 | A_SUB_B |
| 100 | S3 | -- | 001 | 001 | B_SUB_A |
| 101 | S4 | -- | 101 | 101 | OUTPUT |

This makes the 3-way branch explicit as two sequential 2-way tests.

### Execution Trace: GCD(18, 12)

| Cycle | State | A | B | A_EQ_B | A_GT_B | Command | Next |
|-------|-------|---|---|--------|--------|---------|------|
| 0 | S0 | 18 | 12 | 0 | 1 | INIT | S1 |
| 1 | S1 | 18 | 12 | 0 | 1 | -- | S2 |
| 2 | S2 | 6 | 12 | 0 | 0 | A_SUB_B | S1 |
| 3 | S1 | 6 | 12 | 0 | 0 | -- | S3 |
| 4 | S3 | 6 | 6 | 1 | 0 | B_SUB_A | S1 |
| 5 | S1 | 6 | 6 | 1 | 0 | -- | S4 |
| 6 | S4 | 6 | 6 | -- | -- | OUTPUT | S4 |

Result: A = B = 6 = GCD(18, 12).

---

## Fibonacci Machine Design (TD 5)

### Step 1: Algorithm

```
WAIT: while not init:
        N0 = 0, N1 = 1, N = input, Q = 0, Res = 0

COMPUTE: while N > Q:
           temp = N0
           N0 = N1        (N1_2_N0)
           N1 = temp + N1 (SUM_N1)
           Q = Q + 1      (INC_Q)

DISPLAY: while init:
           Res = 1, output N0

RESET: Res = 0, goto WAIT
```

### Step 2: UT Components

| Component | Type | Width | Purpose |
|-----------|------|-------|---------|
| R_N0 | Register | 8 bits | Current Fibonacci value (starts at 0) |
| R_N1 | Register | 8 bits | Next Fibonacci value (starts at 1) |
| R_N | Register | 8 bits | Target index (from input) |
| Q | Counter | 8 bits | Current iteration count |
| Res | JK latch | 1 bit | "Result ready" flag |
| Adder | Combinational | 8 bits | Computes N0 + N1 |
| Comp | Comparator | 8 bits | Compares N with Q |

**UT block diagram**:
```
Input ---------> R_N
                  |
            Comparator <--- Q (counter)
                |                |
            N_GT_Q           INC_Q (from UC)
            (to UC)
                        
R_N0 ---+--> Adder <--- R_N1
        |      |          |
        |   SUM_N1     N1_2_N0
        |   (load N0+N1  (load N1
        |    into N1)     into N0)
        |
        +--> Output bus (when OUT_N0 active)

RESET (from UC): N0=0, N1=1, Q=0, N=input
RES_0 / RES_1 (from UC): control Res latch
```

### Step 3: Interface Signals

**Commands** (UC to UT):

| # | Command | Action |
|---|---------|--------|
| 0 | RESET | Load initial values: N0=0, N1=1, Q=0, N=input |
| 1 | N1_2_N0 | Copy current N1 into N0 (N0 <- N1) |
| 2 | SUM_N1 | Load adder output into N1 (N1 <- N0 + N1) |
| 3 | INC_Q | Increment counter Q (Q <- Q + 1) |
| 4 | RES_0 | Reset Res flag to 0 |
| 5 | RES_1 | Set Res flag to 1 |
| 6 | OUT_N0 | Place N0 on output bus |

**Conditions** (UT to UC):

| Condition | Meaning |
|-----------|---------|
| init | External initialization signal (user button) |
| N_GT_Q | N > Q (comparator output) |

### Step 4: State Machine

**5 states**:

| State | Code | Description | Active Commands |
|-------|------|-------------|-----------------|
| A | 000 | Wait for init; initialize | RESET, RES_0 |
| B | 001 | Check loop condition | (none) |
| C | 010 | Execute one iteration | N1_2_N0, SUM_N1, INC_Q |
| D | 011 | Display result | RES_1, OUT_N0 |
| E | 100 | Reset result flag | RES_0 |

**State diagram**:
```
     /init           N_GT_Q
A <---------> A    B -------> C ----+
|                   ^               |
| init              |    always     |
+-------> B         +--------------+
          |
          | /N_GT_Q
          v
          D <--- init ---> D
          |
          | /init
          v
          E ----always----> A
```

**CRITICAL**: In state C, N1_2_N0 and SUM_N1 execute SIMULTANEOUSLY in the same clock cycle. The adder uses the OLD values of N0 and N1 (before the register updates). This is correct because:
- The adder is combinational: its output = current N0 + current N1
- N1 register loads the adder output at the clock edge
- N0 register loads the current N1 at the same clock edge
- Both loads happen at the SAME moment (rising edge of clock)

### Step 5: Sequencer Design

The microprogrammed UC uses a sequencer with:
- A 3-bit register (current state)
- A MUX selecting the condition to test
- A ROM containing the microcode

**MUX configuration**:

| MUX input | Value | Purpose |
|-----------|-------|---------|
| 0 | 0 (constant) | Forces increment (condition always false) |
| 1 | init | Tests initialization signal |
| 2 | /N_GT_Q | Tests loop exit condition |
| 7 | 1 (constant) | Forces jump (condition always true) |

**Jump code interpretation**:
- Code selects which MUX input to use
- If selected condition is TRUE: load jump address into state register
- If selected condition is FALSE: increment state register

### Step 6: Microcode

**Microcode word format** (13 bits):
```
Bits [2:0]:  Jump code (3 bits) - selects MUX input
Bits [5:3]:  Jump address (3 bits) - target if condition true
Bits [12:6]: Commands (7 bits) - one bit per command signal
```

**Command bit assignment** (bits 12 down to 6):
```
Bit 12: N1_2_N0
Bit 11: SUM_N1
Bit 10: INC_Q
Bit 9:  (unused)
Bit 8:  RES_0
Bit 7:  RES_1
Bit 6:  OUT_N0 / RESET (combined)
```

**ROM contents**:

| State | Jump Code | Jump Addr | Commands | Binary |
|-------|-----------|-----------|----------|--------|
| A (000) | 001 (test init) | 000 (self) | RES_0=1, RESET=1 | 001 000 0001001 |
| B (001) | 010 (test /N_GT_Q) | 011 (D) | none | 010 011 0000000 |
| C (010) | 111 (always jump) | 001 (B) | N1_2_N0, SUM_N1, INC_Q | 111 001 1110000 |
| D (011) | 001 (test init) | 011 (self) | RES_1=1, OUT_N0=1 | 001 011 0000110 |
| E (100) | 111 (always jump) | 000 (A) | RES_0=1 | 111 000 0001000 |

**How state A works**:
- Jump code = 001: test MUX input 1 = init signal
- If init is TRUE: load jump address 000 (stay at A, keep resetting)
- If init is FALSE: increment to state B (001)
- Commands: RESET and RES_0 execute every cycle while in state A

**How state B works**:
- Jump code = 010: test MUX input 2 = /N_GT_Q
- If /N_GT_Q is TRUE (loop done): load jump address 011 (go to D)
- If /N_GT_Q is FALSE (N > Q): increment to state C (010)
- No commands (just testing the condition)

### Step 7: Verification -- Computing F(6)

F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8

| Cycle | State | N0 | N1 | Q | N | N_GT_Q | Command | Next |
|-------|-------|----|----|---|---|--------|---------|------|
| 0 | A | 0 | 1 | 0 | 6 | - | RESET, RES_0 | A (init=1) |
| 1 | A | 0 | 1 | 0 | 6 | - | RESET, RES_0 | B (init=0) |
| 2 | B | 0 | 1 | 0 | 6 | 1 | -- | C (N>Q) |
| 3 | C | **1** | **1** | **1** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 4 | B | 1 | 1 | 1 | 6 | 1 | -- | C |
| 5 | C | **1** | **2** | **2** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 6 | B | 1 | 2 | 2 | 6 | 1 | -- | C |
| 7 | C | **2** | **3** | **3** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 8 | B | 2 | 3 | 3 | 6 | 1 | -- | C |
| 9 | C | **3** | **5** | **4** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 10 | B | 3 | 5 | 4 | 6 | 1 | -- | C |
| 11 | C | **5** | **8** | **5** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 12 | B | 5 | 8 | 5 | 6 | 1 | -- | C |
| 13 | C | **8** | **13** | **6** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 14 | B | 8 | 13 | 6 | 6 | 0 | -- | D (/N_GT_Q) |
| 15 | D | 8 | 13 | 6 | 6 | - | RES_1, OUT_N0 | D (init=1) |
| ... | D | 8 | 13 | 6 | 6 | - | RES_1, OUT_N0 | E (init=0) |
| ... | E | 8 | 13 | 6 | 6 | - | RES_0 | A |

**Output**: N0 = **8** = F(6). Correct.

**Cycle 3 detail** (the first iteration):
- Before cycle 3: N0=0, N1=1
- Adder computes: 0 + 1 = 1 (combinational, instant)
- At clock edge: N0 <- N1 (old value) = 1, N1 <- adder output = 1, Q <- Q+1 = 1
- After cycle 3: N0=1, N1=1, Q=1

**Cycle 5 detail**:
- Before: N0=1, N1=1
- Adder: 1 + 1 = 2
- At edge: N0 <- 1 (old N1), N1 <- 2 (adder), Q <- 2
- After: N0=1, N1=2, Q=2

---

## Design Methodology Summary

### When Given an Algorithm, Follow This Recipe

1. **Write pseudocode** clearly separating initialization, computation, and output
2. **List all variables** -- each becomes a register in the UT
3. **List all arithmetic operations** -- each becomes a functional unit (adder, multiplier, comparator)
4. **List all decisions** -- each becomes a condition signal from UT to UC
5. **List all state-change operations** -- each becomes a command signal from UC to UT
6. **Draw the UT** connecting registers, functional units, and buses
7. **Draw the state diagram** for the UC with transitions labeled by conditions
8. **Choose implementation**:
   - Hardwired: derive boolean equations for next-state and command signals
   - Microprogrammed: encode state machine in ROM with jump codes and command fields
9. **Verify** by tracing execution with known inputs/outputs

### Common Exam Question Patterns

- "Design a UT for algorithm X" -- list registers, ALU, signals
- "Draw the state machine for the UC" -- 3-7 states typical
- "Write the microcode for state Y" -- encode jump + commands
- "Trace execution for input Z" -- fill in table cycle by cycle
- "What happens if we remove command W?" -- identify which Fibonacci iteration breaks
