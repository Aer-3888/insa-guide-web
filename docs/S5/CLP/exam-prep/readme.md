---
title: "CLP Exam Preparation"
sidebar_position: 0
---

# CLP Exam Preparation

## Exam Structure

CLP has **two separate exams**:

### DS Logique (Digital Logic Exam)

| Aspect | Details |
|--------|---------|
| Duration | ~2 hours |
| Topics | Combinational logic, sequential logic, state machines, UC/UT design |
| Format | Written: truth tables, Karnaugh maps, state diagrams, circuit design |
| Tools allowed | Usually none (no calculator) |

**Typical question types**:
1. Boolean algebra simplification (15-20 min)
2. Karnaugh map simplification (15-20 min)
3. State machine design from specification (30-40 min)
4. UC/UT design or analysis (30-40 min)

### DS Assembleur (Assembly Exam)

| Aspect | Details |
|--------|---------|
| Duration | ~2 hours |
| Topics | ARM assembly: instruction reading, code writing, stack tracing |
| Format | Written: read code, write code, trace execution |
| Tools allowed | ARM cheatsheet usually provided |

**Typical question types**:
1. Read and explain existing assembly code (20-30 min)
2. Write a function in ARM assembly (30-40 min)
3. Trace stack/registers through function calls (20-30 min)
4. Data structure manipulation in assembly (20-30 min)

---

## Study Strategy

### For DS Logique

**Week 1**: Review combinational logic fundamentals
- Practice Boolean algebra simplifications (at least 10 exercises)
- Master Karnaugh maps for 3 and 4 variables
- Review number systems (binary, hex, two's complement)

**Week 2**: Focus on sequential logic
- Practice state machine design from scratch
- Convert between flip-flop types
- Draw timing diagrams from state tables

**Week 3**: Processor architecture
- Understand UC/UT decomposition
- Practice microprogramming (writing microcode words)
- Review the PGCD and Fibonacci machines end-to-end

### For DS Assembleur

**Week 1**: Instruction set mastery
- Memorize the 15 most common instructions
- Practice reading code snippets and predicting output
- Understand addressing modes (immediate, register, indexed, scaled)

**Week 2**: Function calling convention
- Draw stack frames from memory
- Practice writing complete functions (prologue + body + epilogue)
- Trace recursive calls step by step

**Week 3**: Data structures and past exams
- Practice array and structure access in assembly
- Work through all past exams under timed conditions
- Focus on common patterns: loops, string processing, struct access

---

## Time Allocation During the Exam

### DS Logique (2 hours)

| Phase | Time | Activity |
|-------|------|----------|
| Read | 10 min | Read ALL questions first. Identify easy wins. |
| Easy questions | 30 min | Boolean algebra, conversions, simple truth tables |
| Medium questions | 40 min | Karnaugh maps, flip-flop circuits |
| Hard questions | 30 min | State machine design, UC/UT integration |
| Review | 10 min | Check all truth tables, verify Karnaugh groupings |

### DS Assembleur (2 hours)

| Phase | Time | Activity |
|-------|------|----------|
| Read | 10 min | Read ALL questions. Identify data structures used. |
| Code reading | 30 min | Annotate given code, trace execution |
| Code writing | 40 min | Write requested functions with full prologue/epilogue |
| Stack tracing | 20 min | Draw stack diagrams, trace register values |
| Review | 20 min | Check stack balance, verify offsets, review edge cases |

---

## Common Mistakes to Avoid

### DS Logique

1. **Karnaugh map column order**: 00, 01, 11, 10 (Gray code), NOT 00, 01, 10, 11
2. **Missing state transitions**: Every state must define what happens for EVERY input
3. **Forgetting to check for redundant states**: Minimize before implementing
4. **Wrong microcode bit ordering**: Double-check which bit controls which command

### DS Assembleur

1. **Not saving LR before BL**: Guaranteed crash or wrong return
2. **Wrong stack offsets**: Draw the frame, count bytes from FP
3. **Confusing LDR and LDRB**: Word (4 bytes) vs byte (1 byte)
4. **Forgetting .align after .ascii**: Causes misalignment errors
5. **Missing stack cleanup**: Every SUB sp must have matching ADD sp

---

## Past Exam Index

### Assembly Exams

| Year | Available Materials | Key Topics |
|------|-------------------|------------|
| 2017 | Subject PDF, 2 solutions (.s + .pdf) | String processing, counting characters |
| 2018 | Subject PDF, 2 solutions (.s + .pdf) | Structures (lines/vectors), direction vectors, collinearity |
| 2019 | Subject PDF, 2 solutions (.s + .pdf) | Structures (ingredients), counting, number parsing |
| 2022 | Subject PDF | -- |
| 2023 | Subject PDF | -- |
| 2024 | Subject PDF | -- |

### Logic Exams

| Year | Available Materials |
|------|-------------------|
| 2008-2016 | Multiple logic exam PDFs (older format) |
| 2021 | DS CLP Logique PDF |
| 2022 | DS CLP Logique PDF |
| 2023 | DS CLP Logique PDF + exam_clp_logique_23.pdf |

---

## Exam Walkthroughs

See the detailed walkthroughs:
- [exam-assembly-walkthrough.md](/S5/CLP/exam-prep/exam-assembly-walkthrough) -- Step-by-step analysis of 2017, 2018, 2019 assembly exams
