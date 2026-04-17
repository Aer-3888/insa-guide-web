---
title: "Chapter 4 -- Logisim Circuits"
sidebar_position: 4
---

# Chapter 4 -- Logisim Circuits

## 4.1 Overview

Logisim is the circuit simulation tool used throughout the CLP course. All digital logic designs (combinational and sequential) are built and tested in Logisim before theoretical analysis.

This chapter catalogs all circuit files from the course and TDs, explains what each one demonstrates, and provides guidance on simulation techniques.

---

## 4.2 Course Circuit Reference

The circuits are numbered in pedagogical order, progressing from combinational to sequential to processor-level design.

### Combinational Circuits

| File | Topic | Description |
|------|-------|-------------|
| `0-maximum-2.circ` | Comparator | Finds the maximum of two values using comparators and MUXes |
| `binaire2bcd.circ` | Transcoder | Converts binary to BCD (Binary-Coded Decimal) |
| `Riche-Pauvre-final.circ` | Game logic | Combinational game circuit using logic gates |
| `decalage-GD-CH-8bits.circ` | Shifter | 8-bit left/right shift circuit with configurable direction |

### Sequential Circuits

| File | Topic | Description |
|------|-------|-------------|
| `1-Add-modulo4.circ` | Counter | Modulo-4 adder using flip-flops |
| `2-diviseur6-7-9-v2.circ` | Divider | Clock frequency divider (divide by 6, 7, or 9) |
| `3-registre-decalage.circ` | Shift register | Demonstrates shift register operation with serial input |
| `4-compteur-decompteur.circ` | Counter | Up/down counter with direction control |
| `5-arbitrage-ressource.circ` | Arbiter | Resource arbitration circuit (priority-based) |
| `6-arbitrage-machine-jeton.circ` | Arbiter | Token-based (round-robin) arbitration circuit |

### Control Unit Circuits

| File | Topic | Description |
|------|-------|-------------|
| `7-memory-horizontal.circ` | Hardwired UC | Horizontal microprogramming with direct state encoding |
| `8-memory-vertical.circ` | Microprogrammed UC | Vertical microprogramming with ROM-based control |

### GCD (PGCD) Complete Design

| File | Topic | Description |
|------|-------|-------------|
| `9-pgcd-ut.circ` | UT (Datapath) | Processing unit for GCD: registers A, B, subtractor, comparator |
| `10-pgcd-uc1.circ` | UC v1 | Hardwired control unit for GCD algorithm |
| `11-pgcd-uc2.circ` | UC v2 | Microprogrammed control unit for GCD (uses ROM) |
| `11-pgcd-uc2.mem` | Microcode | ROM contents for microprogrammed GCD control |
| `12-pgcd-integration.circ` | Full CPU | Complete GCD machine: UC + UT integrated |

### Processor Circuits

| File | Topic | Description |
|------|-------|-------------|
| `miniCPU.circ` | Mini CPU | Simplified processor with fetch-decode-execute cycle |

---

## 4.3 TD Circuit Reference

### TD 1 -- Combinational Logic

| File | Exercise | What it demonstrates |
|------|----------|---------------------|
| `TD1EX3.circ` | Ex 3: Gate analysis | Circuit with AND, NAND, NOR gates; derive S = abc + d |
| `TD1EX4C1.circ` | Ex 4: Transistor C1 | Category C1 classification circuit |
| `TD1EX4C2.circ` | Ex 4: Transistor C2 | Category C2 classification circuit |
| `TD1EX4C3.circ` | Ex 4: Transistor C3 | Category C3 classification circuit |

### TD 2 -- Arithmetic and Encoding

| File | Exercise | What it demonstrates |
|------|----------|---------------------|
| `TD2EX3.circ` | Ex 3: ALU | Circuit computing X+Y, 2X+Y, or X+2Y |
| `TD2EX4C1-C5.circ` | Ex 4: Adder variants | Different adder configurations |
| `TD2EX5C2-C18.circ` | Ex 5: Binary ops | Various binary operation circuits |
| `TD2EX6.circ` | Ex 6: MUX function | Implementing S with multiplexer |
| `TD2EX7C1-C4.circ` | Ex 7: VU-meter | LED bar controller using decoder + OR gates |

### TD 3 -- Sequential Circuits and State Machines

| File | Exercise | What it demonstrates |
|------|----------|---------------------|
| `ex_3_1.circ` | Ex 1: Flip-flop conversions | Building RS, JK from D flip-flop and vice versa |
| `ex_3_2.circ` | Ex 2: Moore machine | Two D flip-flops with AND gate feedback |
| `ex_3_3.circ` | Ex 3: Edge detector | Positive/negative transition detector |
| `ex_3_4.circ` | Ex 4: Div-by-5 | Serial divisibility-by-5 checker |

### TD 4 -- Complex State Machines

| File | Exercise | What it demonstrates |
|------|----------|---------------------|
| `ex_4_1.circ` | Ex 1: LED toggle | Button-controlled LED with state machine |
| `ex_4_2.circ` | Ex 2: Sequence detector | Detects input sequence 00,01,00,10 |
| `ex_4_4.circ` | Ex 4: Loadable counter UC | Control unit using loadable counter for state sequencing |

### TD 5 -- Fibonacci Machine

| File | Exercise | What it demonstrates |
|------|----------|---------------------|
| `ex_5.circ` | Fibonacci | Complete Fibonacci computing machine with UC + UT |
| `ex_5.mem` | Microcode | ROM contents for Fibonacci machine sequencer |

---

## 4.4 Simulation Techniques

### Running a Simulation

1. **Open** the `.circ` file in Logisim
2. **Set input values** by clicking on input pins (they toggle between 0 and 1)
3. **Observe outputs** -- they update immediately for combinational circuits
4. **For sequential circuits**: Use the clock (Ctrl+T to tick, or use the clock speed control)

### Debugging Sequential Circuits

1. **Slow the clock** to observe state changes step by step
2. **Watch flip-flop states** -- click on a flip-flop to see its current value
3. **Trace signals** -- use probes to monitor specific wires
4. **Check timing**: Ensure you understand when outputs change relative to clock edges

### Examining ROM Contents

For circuits using microprogrammed control (like `11-pgcd-uc2.circ`), the ROM contents are in `.mem` files.

**Format of `.mem` files**:
```
v2.0 raw
c110 10001 a112 1227 1236 52f3 2cf3 10007
70
```

Each hex value is one microinstruction word. The address corresponds to the state number.

### Common Logisim Issues

- **Red wires**: Bus width mismatch between components
- **Blue wires**: Unknown/uninitialized values
- **Orange dots**: Wire junctions (intentional connections) vs. crossings
- **Clock not ticking**: Make sure simulation is enabled (Simulate > Simulation Enabled)

---

## 4.5 Circuit Design Methodology

### Step-by-Step for Combinational Circuits

1. **Write the truth table** from the specification
2. **Simplify** using Karnaugh maps
3. **Draw the circuit** in Logisim using gates matching the simplified expression
4. **Verify** by testing all input combinations against the truth table

### Step-by-Step for Sequential Circuits

1. **Draw state diagram** from the specification
2. **Encode states** in binary
3. **Build transition table** (inputs + current state -> next state)
4. **Simplify** transition and output functions with Karnaugh maps
5. **Place D flip-flops** (one per state bit)
6. **Wire combinational logic** for transition and output functions
7. **Add clock** and verify with timing simulation

### Step-by-Step for UC+UT Integration

1. **Design UT first**: identify registers, ALU operations, buses
2. **Define interface**: list all commands (UC->UT) and conditions (UT->UC)
3. **Design UC**: state machine implementing the algorithm
4. **Implement UC** as hardwired or microprogrammed
5. **Connect** UC outputs to UT command inputs, UT condition outputs to UC inputs
6. **Test** the complete system with known input/output pairs

---

## 4.6 Common Pitfalls

1. **Bus width mismatches**: Ensure all connected wires have the same bit width. A 4-bit bus cannot directly connect to an 8-bit input.

2. **Missing clock connections**: Every flip-flop and register must be connected to the clock signal. A disconnected clock means the flip-flop never updates.

3. **Feedback loops without flip-flops**: Direct feedback (output -> input) without a flip-flop creates a race condition. Always use clocked elements for feedback.

4. **ROM addressing**: ROM address inputs must match the counter output width. If your counter outputs 3 bits, the ROM must have 8 entries (2^3).

5. **Forgetting tri-state control**: If multiple components share a bus, each must have a tri-state buffer. Without it, bus contention causes undefined values.

---

## CHEAT SHEET -- Logisim Circuits

```
CIRCUIT FILE MAP (course progression):
  0  -> Combinational: maximum of two values
  1  -> Sequential: modulo-4 adder
  2  -> Clock divider (6, 7, 9)
  3  -> Shift register
  4  -> Up/down counter
  5  -> Resource arbitration (priority)
  6  -> Token-based arbitration
  7  -> Horizontal microprogramming (hardwired UC)
  8  -> Vertical microprogramming (ROM-based UC)
  9  -> PGCD: Processing Unit (UT)
  10 -> PGCD: Control Unit v1 (hardwired)
  11 -> PGCD: Control Unit v2 (microprogrammed)
  12 -> PGCD: Complete integration (UC + UT)

KEY LOGISIM SHORTCUTS:
  Ctrl+T    Tick clock once
  Ctrl+K    Start/stop clock auto-tick
  Ctrl+R    Reset simulation
  Ctrl+E    Toggle edit/simulate mode

.MEM FILE FORMAT:
  v2.0 raw
  (hex values separated by spaces, one per ROM address)

DEBUGGING CHECKLIST:
  [ ] All wires connected (no dangling ends)
  [ ] Bus widths match at every connection
  [ ] Clock connected to all flip-flops/registers
  [ ] Tri-state buffers on shared buses
  [ ] ROM contents loaded from .mem file
  [ ] Input pins set to correct initial values
```
