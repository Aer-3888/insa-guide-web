---
title: "Chapter 3 -- Processor Architecture"
sidebar_position: 6
---

# Chapter 3 -- Processor Architecture

## 3.1 Overview

A processor is decomposed into two main units:

- **UT (Unite de Traitement / Processing Unit / Datapath)**: Contains registers, ALU, buses, and performs computations
- **UC (Unite de Commande / Control Unit)**: Generates control signals to orchestrate the UT based on the current instruction and conditions

```
                +------------------+
   Inputs ----->|                  |----> Outputs
                |   UT (Datapath)  |
                |                  |
                +--------+---------+
                         |
              conditions |  commands
                         |
                +--------+---------+
                |                  |
                |  UC (Control)    |
                |                  |
                +------------------+
```

The UC sends **commands** (control signals) to the UT. The UT sends **conditions** (status flags) back to the UC. This separation is the foundation of all processor design.

---

## 3.2 Processing Unit (UT / Datapath)

### Components

| Component | Role | Example |
|-----------|------|---------|
| Registers | Store data values | N0, N1, Q, N in Fibonacci machine |
| ALU | Arithmetic and Logic | Adder, comparator |
| Buses | Transfer data between components | Internal data bus |
| Tri-state buffers | Control bus access | Enable/disable outputs onto shared bus |
| Multiplexers | Select data sources | Choose which register feeds ALU input |

### Register Operations

Each register has control signals:
- **Load (LD)**: When active, register captures value from bus on next clock edge
- **Output Enable (OE)**: When active, register drives its value onto the bus

### ALU Operations

The ALU performs operations selected by control signals:
- Addition, subtraction
- AND, OR, XOR, NOT
- Shift left, shift right
- Comparison (generates condition flags)

### Condition Flags

The UT generates flags sent to the UC:

| Flag | Name | Meaning |
|------|------|---------|
| Z | Zero | Result is zero |
| N | Negative | Result is negative (MSB = 1) |
| C | Carry | Unsigned overflow occurred |
| V | oVerflow | Signed overflow occurred |

---

## 3.3 Control Unit (UC)

The UC is itself a finite state machine. It can be implemented in two ways:

### 1. Hardwired Control (Horizontal Microprogramming)

The UC is built directly from combinational and sequential logic. From Logisim circuit 7-memory-horizontal:

- Each state is encoded with flip-flops
- Transition logic is implemented with gates
- Fast but inflexible -- changes require rewiring

### 2. Microprogrammed Control (Vertical Microprogramming)

The UC uses a ROM (Read-Only Memory) to store microinstructions. From Logisim circuit 8-memory-vertical:

- Each address in ROM corresponds to a state
- ROM contents define control signals and next-state information
- Flexible -- change behavior by reprogramming ROM
- Slightly slower due to ROM access time

### Sequencer

The sequencer controls the flow of states in the UC. From TD5 Exercise:

Components:
- **Counter**: Holds current state (address)
- **ROM**: Stores microcode (commands + jump targets)
- **Multiplexer**: Selects the condition to evaluate
- **Jump logic**: Decides whether to increment counter or load a new address

**Operation each clock cycle**:
1. Counter provides current address to ROM
2. ROM outputs: command bits + jump code + jump address
3. Jump code selects which condition to check via MUX
4. If condition is true: load jump address into counter
5. If condition is false: increment counter

---

## 3.4 Microcode Design (from TD5 -- Fibonacci Machine)

### Problem

Design a circuit that computes Fibonacci numbers F(n).

**Algorithm**:
```
while not init:
    N0 = 0; N1 = 1; N = input; Q = 0; Res = 0
while N > Q:
    N1 = N0 + N1; N0 = N1; Q = Q + 1   (simultaneous)
while init:
    Res = 1; display N0
Res = 0
```

### UT Design

Registers and controls:
- R_N0 (8-bit register for N0)
- R_N1 (8-bit register for N1)
- R_N (8-bit register for N, the target index)
- Counter Q (8-bit counter with increment)
- Latch Res (JK flip-flop for result flag)

Commands sent by UC:
- RESET: Initialize all registers (N0=0, N1=1, N=input, Q=0)
- N1_2_N0: Load N1's value into N0
- SUM_N1: Load N0+N1 into N1
- INC_Q: Increment counter Q
- RES_0: Reset Res to 0
- RES_1: Set Res to 1
- OUT_N0: Put N0 on output bus

Conditions sent to UC:
- init: User initialization signal
- N_GT_Q: Comparator output (N > Q)

### UC Design (State Machine)

| State | Name | Action | Next State |
|-------|------|--------|------------|
| 0 (A) | Wait for init | RESET, RES_0 | If init: stay. Else: go to 1 |
| 1 (B) | Check loop | (none) | If N <= Q: go to 3. Else: go to 2 |
| 2 (C) | Iterate | N1_2_N0, SUM_N1, INC_Q | Go to 1 |
| 3 (D) | Display | RES_1, OUT_N0 | If init: stay. Else: go to 4 |
| 4 (E) | Reset result | RES_0 | Go to 0 |

### Microcode Encoding

Each microinstruction word (13 bits):

```
[Jump Code (3 bits)] [Jump Address (3 bits)] [Commands (7 bits)]

Commands: N1_2_N0 | SUM_N1 | INC_Q | RES_0 | RES_1 | OUT_N0 | RESET

State A: 001 000 0001001    -- jump code 1 (check init), addr 0, RESET+RES_0
State B: 010 011 0000000    -- jump code 2 (check /N_GT_Q), addr 3, no commands
State C: 111 001 1110000    -- jump code 7 (unconditional), addr 1, N1_2_N0+SUM_N1+INC_Q
State D: 001 011 0000110    -- jump code 1 (check init), addr 3, RES_1+OUT_N0
State E: 111 000 0001000    -- jump code 7 (unconditional), addr 0, RES_0
```

### Sequencer MUX Inputs

| Jump Code | Condition Selected |
|-----------|-------------------|
| 0 | Always 0 (unconditional increment) |
| 1 | init |
| 2 | /N_GT_Q |
| 7 | Always 1 (unconditional jump) |

---

## 3.5 PGCD Machine Architecture

The GCD (PGCD) machine is a key course example that integrates UC and UT. See the dedicated chapter [pgcd-arithmetic.md](/S5/CLP/guide/pgcd-arithmetic) for the full treatment.

**Quick summary of architecture**:
- UT contains registers A and B, a subtractor, and a comparator
- UC implements the Euclidean algorithm as a state machine
- The integration uses the condition A>B, A=B, A<B to control subtraction

---

## 3.6 Memory Hierarchy

### Register File

Fastest storage. Directly inside the processor. In ARM: 16 registers (r0-r15).

### Cache

Small, fast memory between processor and main memory. Exploits:
- **Temporal locality**: Recently accessed data is likely to be accessed again
- **Spatial locality**: Data near recently accessed data is likely to be accessed

### Main Memory (RAM)

Larger, slower. Stores program and data during execution.

### ROM (Read-Only Memory)

Non-volatile. Used for:
- Microcode storage in UC
- Boot firmware
- Lookup tables in combinational circuits

---

## 3.7 Common Pitfalls

1. **Confusing UC and UT**: The UC controls, the UT computes. The UC never performs arithmetic on data -- it only sequences operations.

2. **Missing conditions**: The UC needs conditions from the UT to make decisions. If you forget to wire a comparison result back to the UC, the machine cannot branch.

3. **Simultaneous operations**: In hardware, operations connected to different registers can happen in the same clock cycle (unlike sequential code). The Fibonacci machine exploits this: N0=N1 and N1=N0+N1 happen simultaneously.

4. **Microcode word width**: Each bit in the microcode word has a specific meaning. Getting the bit order wrong means sending wrong commands to the UT.

5. **Bus conflicts**: Never enable two outputs onto the same bus simultaneously. Use tri-state buffers with mutually exclusive enable signals.

6. **State count**: The number of microcode states does NOT equal the number of high-level algorithm steps. You may need extra states for initialization, condition checking, and cleanup.

---

## CHEAT SHEET -- Processor Architecture

```
TWO-UNIT DECOMPOSITION:
  UT (Datapath):  registers + ALU + buses + MUXes
  UC (Control):   FSM that generates control signals

UC -> UT:  commands (load register, enable output, select ALU op)
UT -> UC:  conditions (zero, carry, overflow, comparison results)

UC IMPLEMENTATION STYLES:
  Hardwired:        Gates + flip-flops, fast, inflexible
  Microprogrammed:  ROM + counter + MUX, flexible, slightly slower

SEQUENCER OPERATION (each clock cycle):
  1. Counter -> ROM address
  2. ROM outputs: commands + jump_code + jump_address
  3. jump_code -> MUX selects condition
  4. If condition true: counter <- jump_address (load)
  5. If condition false: counter <- counter + 1 (increment)

MICROCODE WORD FORMAT:
  [Jump Code] [Jump Address] [Command Bits]
  Jump Code: selects which condition (via MUX)
  Jump Address: where to jump if condition met
  Command Bits: one bit per control signal to UT

FIBONACCI MACHINE STATES:
  A: Initialize    B: Check N>Q    C: Iterate
  D: Display       E: Reset result

CONDITION FLAGS (ALU output):
  Z (Zero)      N (Negative)    C (Carry)    V (oVerflow)

DESIGN METHODOLOGY:
  1. Write algorithm in pseudocode
  2. Identify registers, operations, conditions
  3. Design UT (registers + ALU + buses)
  4. Design UC state machine
  5. Define command signals and conditions
  6. Encode microcode in ROM
  7. Build sequencer (counter + MUX + ROM)
  8. Integrate UC + UT
```
