---
title: "Chapter 2 -- Sequential Logic"
sidebar_position: 7
---

# Chapter 2 -- Sequential Logic

## 2.1 Foundations

A **sequential circuit** has outputs that depend on both the current inputs AND the internal state (memory). Unlike combinational circuits, sequential circuits have a clock signal and feedback paths.

**Key difference from combinational**: Sequential circuits have memory. They "remember" past inputs.

### Two Models of Sequential Machines

| Property | Moore Machine | Mealy Machine |
|----------|--------------|---------------|
| Output depends on | State only | State + Input |
| Output changes | Only at clock edge | Anytime input changes |
| Generally needs | More states | Fewer states |
| Output timing | Synchronized to clock | May have glitches |

---

## 2.2 Flip-Flops

Flip-flops are the fundamental memory elements of sequential circuits. Each stores exactly **one bit** of information.

### D Flip-Flop (Data)

The most commonly used flip-flop. On each rising clock edge, the output Q takes the value of input D.

```
Truth table:
  D | Q(t+1)
  --|-------
  0 |   0
  1 |   1
```

Characteristic equation: Q(t+1) = D

**Key property**: D flip-flops are the simplest -- output follows input with one clock delay.

### T Flip-Flop (Toggle)

Toggles its output when T=1, holds when T=0.

```
Truth table:
  T | Q(t+1)
  --|-------
  0 |  Q(t)     (hold)
  1 | /Q(t)     (toggle)
```

Characteristic equation: Q(t+1) = T XOR Q(t)

**Building T from D**: D = T XOR Q (feed XOR of T and current Q into D input)

### JK Flip-Flop

The most versatile flip-flop. J=set, K=reset, J=K=1 toggles.

```
Truth table:
  J | K | Q(t+1)
  --|---|-------
  0 | 0 | Q(t)      (hold)
  0 | 1 |  0         (reset)
  1 | 0 |  1         (set)
  1 | 1 | /Q(t)      (toggle)
```

Characteristic equation: Q(t+1) = J./Q(t) + /K.Q(t)

### RS Flip-Flop (Set-Reset)

Basic latch. S=1 sets output to 1, R=1 resets to 0. S=R=1 is FORBIDDEN.

```
Truth table:
  R | S | Q(t+1)
  --|---|-------
  0 | 0 | Q(t)      (hold)
  0 | 1 |  1         (set)
  1 | 0 |  0         (reset)
  1 | 1 | FORBIDDEN
```

### Converting Between Flip-Flops (from TD3)

| Build | From | Method |
|-------|------|--------|
| RS from D | D flip-flop + gates | D = S + /R.Q |
| JK from D | D flip-flop + gates | D = J./Q + /K.Q |
| D from T | T flip-flop + XOR | T = D XOR Q |
| D from JK | JK flip-flop | J = D, K = /D |
| T from JK | JK flip-flop | J = T, K = T |

---

## 2.3 Registers

A **register** is a group of flip-flops that stores a multi-bit value.

### Parallel Register

All bits loaded simultaneously on clock edge. Used to hold data values (addresses, operands, results).

### Shift Register (from Logisim circuit 3-registre-decalage)

Bits shift left or right on each clock edge. The vacated position gets a new input bit.

**Applications**:
- Serial-to-parallel conversion
- Parallel-to-serial conversion
- Multiplication/division by powers of 2
- Delay lines

### Shift Register Operations

- **Shift Left**: Multiply by 2 (for unsigned). MSB is lost, 0 enters from right.
- **Shift Right**: Divide by 2 (for unsigned). LSB is lost, 0 enters from left.
- **Arithmetic Shift Right**: For signed numbers. MSB (sign bit) is replicated.

---

## 2.4 Counters

A **counter** is a register that increments (or decrements) its value on each clock edge.

### Binary Counter (from Logisim circuit 4-compteur-decompteur)

Counts in natural binary sequence: 0, 1, 2, ..., 2^n-1, 0, 1, ...

**Modulo-N counter**: Counts from 0 to N-1, then wraps to 0.

### Up/Down Counter

Can count up or down based on a control signal. From the course circuit 4-compteur-decompteur, a single control bit selects the counting direction.

### Loadable Counter

Can be loaded with an arbitrary value (used in control units as a sequencer). Critical for implementing jumps in microcode.

### Clock Dividers (from Logisim circuit 2-diviseur6-7-9-v2)

A counter that divides the clock frequency by N. The output toggles every N clock cycles.

**Example**: Divider by 6 -- counter counts 0,1,2,3,4,5 then resets. Output goes high for one cycle every 6 cycles.

---

## 2.5 Finite State Machines (FSMs)

An FSM is the fundamental abstraction for sequential circuit design. It consists of:
- **States**: A finite set of internal configurations
- **Inputs**: External signals
- **Outputs**: Results computed by the machine
- **Transition function**: Maps (current state, input) to next state
- **Output function**: Maps state (Moore) or (state, input) (Mealy) to output

### Design Methodology

1. **Understand the problem** -- what behavior is needed?
2. **Identify states** -- what does the machine need to "remember"?
3. **Draw state diagram** -- bubbles for states, arrows for transitions
4. **Assign state codes** -- binary encoding for each state
5. **Build transition table** -- inputs + current state -> next state
6. **Build output table** -- state (+ input for Mealy) -> output
7. **Simplify** with Karnaugh maps
8. **Implement** with flip-flops and combinational logic

### Worked Example: Positive Edge Detector (from TD3 Exercise 3)

**Problem**: Input e is 0 or 1 for complete cycles. Output s1=1 for one cycle after 0->1 transition. Output s2=1 for one cycle after 1->0 transition.

**States**: Two states based on previous input value:
- State 0: Previous input was 0
- State 1: Previous input was 1

**This is a Mealy machine** because the output depends on both the state (previous value) and the current input.

**Transition/output table**:

| State | Input e | Next State | s1 | s2 |
|-------|---------|------------|----|----|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 0 | 1 |
| 1 | 1 | 1 | 0 | 0 |

**Implementation**: One D flip-flop stores the previous input. s1 = e AND /Q. s2 = /e AND Q.

### Worked Example: LED Toggle Button (from TD4 Exercise 1)

**Problem**: Button press toggles LED. LED stays in its state when button is released.

**States** (4 states, 2 bits m1,m2):
- (0,0): LED off, button released
- (0,1): LED off, button pressed
- (1,0): LED on, button released
- (1,1): LED on, button pressed

**Output**: LED = m1 (first memory bit directly)

**Transition function** (from Karnaugh simplification):
```
m1(t+1) = /BP . m1 + BP . (m1.m2 + /m1./m2)
m2(t+1) = BP
```

### Worked Example: Sequence Detector (from TD4 Exercise 2)

**Problem**: Detect sequence 00, 01, 00, 10 on two inputs (e1, e2). Output S=1 for one cycle when sequence is detected.

**States** (4 states, 2 bits d2,d1):
- (0,0): Waiting for 00
- (0,1): Read 00, waiting for 01
- (1,0): Read 00+01, waiting for 00
- (1,1): Read 00+01+00, waiting for 10

**Transition equations** (after Karnaugh simplification):
```
d1(t+1) = /e1 . /e2
d2(t+1) = /e1 . (/e2.d2./d1 + d1.e2)
Output S = d2.d1.e1./e2
```

### Worked Example: Divisibility by 5 Detector (from TD3 Exercise 4)

**Problem**: Bits arrive MSB first. After each bit, output whether the number formed so far is divisible by 5.

**Key insight**: Receiving a 0 bit means N -> 2N. Receiving a 1 bit means N -> 2N+1. Track remainder mod 5.

**States**: 5 states (remainders 0-4), encoded on 3 bits.

**Transition table**:

| R(N) | R(2N) (input 0) | R(2N+1) (input 1) |
|------|------------------|--------------------|
| 0 | 0 | 1 |
| 1 | 2 | 3 |
| 2 | 4 | 0 |
| 3 | 1 | 2 |
| 4 | 3 | 4 |

**Output**: Est_div = 1 when state = 0 (remainder is 0).

---

## 2.6 Timing Diagrams

A timing diagram shows the evolution of signals over time. For sequential circuits:

1. Draw the clock signal (square wave)
2. For each clock rising edge, compute the next state using the transition function
3. Compute outputs from the state (Moore) or state+input (Mealy)
4. Draw all signals aligned to the clock

**Example** (from TD3 Exercise 2, two D flip-flops with AND gates):

```
Input sequence R = 0, 1, 1, 0, 1

Clock:  _|--|__|--|__|--|__|--|__|--|__
R:      0     1     1     0     1
S1:     0     0     1     1     0
S2:     0     0     0     1     1
```

Where S1 and S2 are the D flip-flop outputs, fed back through AND gates with R.

---

## 2.7 Common Pitfalls

1. **Forgetting the clock**: All state changes happen at clock edges. Outputs in a Moore machine do NOT change between clock edges.

2. **State encoding**: The number of bits needed = ceil(log2(number of states)). With 5 states you need 3 bits (not 2).

3. **Missing transitions**: Every state must have a defined transition for every possible input. Missing transitions lead to undefined behavior.

4. **Mealy vs Moore confusion**: If the exam says "Moore machine," the output must depend only on the state, not on the input.

5. **Off-by-one in sequence detectors**: Be careful about whether the output occurs on the same cycle as the last input or one cycle later. Use an extra flip-flop if needed to delay output by one clock.

6. **Self-loops**: Do not forget self-loops (state staying in itself) when drawing state diagrams. They are transitions too.

---

## CHEAT SHEET -- Sequential Logic

```
FLIP-FLOP EQUATIONS:
  D:  Q(t+1) = D
  T:  Q(t+1) = T XOR Q(t)
  JK: Q(t+1) = J./Q(t) + /K.Q(t)
  RS: Q(t+1) = S + /R.Q(t)  [S.R = 0 required]

CONVERSIONS:
  D from JK:  J=D, K=/D
  T from JK:  J=T, K=T
  D from T:   T = D XOR Q
  JK from D:  D = J./Q + /K.Q

FSM DESIGN STEPS:
  1. Identify states
  2. Draw state diagram
  3. Assign binary codes to states
  4. Build transition table
  5. Build output table
  6. Karnaugh simplification
  7. Implement with flip-flops + gates

MOORE vs MEALY:
  Moore: output = f(state)         -- synchronized, more states
  Mealy: output = f(state, input)  -- fewer states, async output

STATE ENCODING:
  n states -> ceil(log2(n)) flip-flops
  2 states -> 1 bit
  3-4 states -> 2 bits
  5-8 states -> 3 bits

COUNTER TYPES:
  Binary:     0,1,2,...,2^n-1,0,1,...
  Modulo-N:   0,1,...,N-1,0,1,...
  Up/Down:    direction controlled by input
  Loadable:   can jump to any value (for sequencer)

TIMING DIAGRAM RULES:
  - State changes on clock RISING edge
  - Moore outputs: change ONLY at clock edge
  - Mealy outputs: can change between edges (when input changes)
  - D flip-flop: output is previous input (1 clock delay)
```
