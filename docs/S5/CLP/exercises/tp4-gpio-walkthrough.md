---
title: "TP4 - Controle GPIO Raspberry Pi (bare metal)"
sidebar_position: 4
---

# TP4 - Controle GPIO Raspberry Pi (bare metal)

> D'apres les consignes enseignants : S5/CLP/data/moodle/tp/tp4/README.md

Ce TP est un exercice de programmation bare metal sur le Raspberry Pi. Il n'y a pas de systeme d'exploitation -- le code assembleur s'execute directement sur le materiel. Le programme fait clignoter la LED ACT (Activite) selon un patron de code Morse SOS. Ce TP differe fondamentalement des TP 1-3 : il n'y a pas de pile, pas de convention d'appel de fonction, et les registres materiels sont commandes par des entrees/sorties mappees en memoire.

---

## Exercice 1: Hardware Background and GPIO Configuration

### Understand memory-mapped I/O and GPIO registers

**Question:** What are the GPIO register addresses needed to control GPIO pin 47 (ACT LED)?

**Answer:**

```arm
.set GPSEL4, 0x3f200010     @ GPFSEL4: Function select for GPIO 40-49
.set GPSET1, 0x3f200020     @ GPSET1: Set pins 32-53 high
.set GPCLR1, 0x3f20002c     @ GPCLR1: Clear pins 32-53 low

.set speed_short, 1800000   @ Short delay (dit) ~0.3 seconds at ~700MHz
.set speed_long, 9000000    @ Long delay (dah) ~1.5 seconds
```

**GPIO register map (BCM2837 - Raspberry Pi 2/3, base 0x3F200000):**

| Register | Address | Purpose |
|----------|---------|---------|
| GPFSEL4 | 0x3F200010 | Function select for GPIO 40-49 |
| GPSET1 | 0x3F200020 | Set pins 32-53 high |
| GPCLR1 | 0x3F20002C | Clear pins 32-53 low |

**How it works:** On ARM processors, hardware peripherals are controlled by reading/writing to specific memory addresses. The same `LDR`/`STR` instructions used for regular memory work for hardware control -- there are no special I/O instructions.

---

### Configure GPIO 47 as output

**Question:** Calculate the bit positions needed to configure pin 47 as output and to set/clear it.

**Answer:**

**Step 1: Function select (GPFSEL4)**
- Pin 47 is in GPFSEL4 (handles pins 40-49)
- Each pin uses 3 bits in the FSEL register
- Pin position: (47 % 10) = 7, bit offset = 7 * 3 = 21
- Value 001 = output mode

```
GPFSEL4 bit layout:
Bits [2:0]   = GPIO 40    Bits [5:3]   = GPIO 41
Bits [8:6]   = GPIO 42    Bits [11:9]  = GPIO 43
Bits [14:12] = GPIO 44    Bits [17:15] = GPIO 45
Bits [20:18] = GPIO 46    Bits [23:21] = GPIO 47  <-- HERE
Bits [26:24] = GPIO 48    Bits [29:27] = GPIO 49
```

Setting bits [23:21] = 001:
```
Bit 21 = 1, Bit 22 = 0, Bit 23 = 0
Binary: 0000 0000 0010 0000 0000 0000 0000 0000 = 0x00200000
```

**Step 2: Set/Clear (GPSET1/GPCLR1)**
- Pin 47 is in bank 1 (pins 32-53)
- Bit position: 47 - 32 = 15
- Write 1 to bit 15 to set or clear

```
GPSET1/GPCLR1: bit 15 = 1
Binary: 0000 0000 0000 0000 1000 0000 0000 0000 = 0x00008000
```

---

## Exercice 2: main.s -- Complete LED Control Program

### Implement GPIO initialization

**Question:** Write the `_start` code that configures GPIO 47 as output.

**Answer:**

```arm
.section .text
.global _start

_start:
    @ Configure GPIO 47 as output
    ldr r0, =GPSEL4             @ r0 = 0x3F200010 (address of GPFSEL4)
    mov r1, #0b00000000001000000000000000000000
                                @ Bit 21 = 1 (pin 47, function = output)
    str r1, [r0]                @ Write to GPFSEL4 register
                                @ GPIO 47 is now configured as output
```

**How it works:** Writing to the GPFSEL4 memory address tells the GPIO controller to configure pin 47 as a digital output. All other pins in this register default to input (000). No special I/O instruction is needed -- just a regular `STR`.

---

### Implement the SOS Morse code pattern loop

**Question:** Write the main loop that blinks SOS pattern: 3 short, 3 long, 3 short, then pause and repeat.

**Answer:**

```arm
begin:
    @ S: Three short blinks
    ldr r2, =speed_short        @ r2 = 1800000 (duration parameter)
    bl allumer                  @ Short blink 1
    bl allumer                  @ Short blink 2
    bl allumer                  @ Short blink 3

    @ O: Three long blinks
    ldr r2, =speed_long         @ r2 = 9000000 (duration parameter)
    bl allumer                  @ Long blink 1
    bl allumer                  @ Long blink 2
    bl allumer                  @ Long blink 3

    @ S: Three short blinks
    ldr r2, =speed_short
    bl allumer                  @ Short blink 7
    bl allumer                  @ Short blink 8
    bl allumer                  @ Short blink 9

    @ Pause between SOS repetitions
    ldr r2, =speed_long         @ Long pause (LED stays off)
    bl sleep

    b begin                     @ Repeat forever
```

**Morse code timing:**
```
S:  ON-off ON-off ON-off     (3 short blinks, short gaps)
O:  ON----off ON----off ON----off  (3 long blinks, long gaps)
S:  ON-off ON-off ON-off     (3 short blinks)
    [========= long pause =========]
    (repeat)
```

---

### Implement the allumer (blink) function

**Question:** Write the `allumer` function that turns the LED on, waits, turns it off, and waits. Why can it not use the stack?

**Answer:**

```arm
allumer:
    mov r3, lr                  @ Save return address in r3 (NOT on stack!)

    @ Turn LED ON
    ldr r0, =GPSET1             @ r0 = 0x3F200020
    mov r1, #0b00000000000000001000000000000000
                                @ Bit 15 = 1 (GPIO 47 - 32 = 15)
    str r1, [r0]                @ Write to GPSET1 -> LED turns ON

    bl sleep                    @ Wait (LED on for duration in r2)

    @ Turn LED OFF
    ldr r0, =GPCLR1             @ r0 = 0x3F20002C
    mov r1, #0b00000000000000001000000000000000
    str r1, [r0]                @ Write to GPCLR1 -> LED turns OFF

    bl sleep                    @ Wait (LED off, creating gap)

    bx r3                       @ Return using saved LR (in r3)
```

**Why save LR in r3 instead of the stack?** This is bare-metal code. The stack pointer (SP) is not initialized because there is no OS to set it up. Using `stmfd sp!, {lr}` would write to an undefined address and crash. Instead, LR is saved in a register that `sleep` does not modify.

**Register contract:**
- Input: r2 = delay duration (preserved across calls to sleep)
- Modifies: r0, r1 (hardware addresses and values)
- Preserves: r2 (duration), r3 (saved LR)

---

### Implement the sleep (busy-wait delay) function

**Question:** Write the `sleep` function that implements a software delay loop.

**Answer:**

```arm
sleep:
    mov r0, #0                  @ Counter = 0

sleep_loop:
    cmp r0, r2                  @ Compare counter with target
    bge end_sleep_loop          @ Exit when counter >= target
    add r0, #4                  @ Increment by 4
    b sleep_loop                @ Continue

end_sleep_loop:
    bx lr                       @ Return
```

**Why increment by 4?** Each loop iteration executes 4 instructions (CMP, BGE, ADD, B). Incrementing by 4 makes the count roughly proportional to the number of instructions executed.

**Timing estimate (at 700 MHz, ~1 cycle per instruction):**
- Each iteration: ~4 instructions = ~4 cycles
- speed_short = 1,800,000: ~450,000 iterations
- speed_long = 9,000,000: ~2,250,000 iterations
- Actual timing varies with CPU clock, cache, and pipeline

---

## Exercice 3: Execution Flow Trace

### Trace one complete "S" (three short blinks)

**Question:** Show the register state and LED state through one letter "S".

**Answer:**

```
Time  Action                    LED    r0            r1            r2           r3
T0    ldr r2, =speed_short      -      ?             ?             1800000      ?
T1    bl allumer                -      ?             ?             1800000      LR_begin
T2      mov r3, lr              -      ?             ?             1800000      LR_begin
T3      ldr r0, =GPSET1         -      0x3F200020    ?             1800000      LR_begin
T4      mov r1, #0x8000         -      0x3F200020    0x8000        1800000      LR_begin
T5      str r1, [r0]            ON     0x3F200020    0x8000        1800000      LR_begin
T6      bl sleep                ON     0             0x8000        1800000      LR_allumer
T7        ... counting ...      ON     0->1.8M       ...           1800000      ...
T8      ldr r0, =GPCLR1         ON     0x3F20002C    0x8000        1800000      LR_begin
T9      str r1, [r0]            OFF    0x3F20002C    0x8000        1800000      LR_begin
T10     bl sleep                OFF    0             ...           1800000      LR_allumer
T11       ... counting ...      OFF    0->1.8M       ...           1800000      ...
T12     bx r3                   OFF    ...           ...           1800000      LR_begin
        (returns to begin, bl allumer again for blink 2, then 3)
```

---

## Exercice 4: GPIO Calculation Reference

### General formula for any GPIO pin

**Question:** Give the general formulas for configuring any GPIO pin P.

**Answer:**

**Function Select register:**
- Register: GPFSEL(P / 10)
- Address: 0x3F200000 + (P / 10) * 4
- Bit position: (P % 10) * 3
- Value: 001 for output

**Set register:**
- If P < 32: GPSET0 (0x3F20001C), bit P
- If P >= 32: GPSET1 (0x3F200020), bit (P - 32)

**Clear register:**
- If P < 32: GPCLR0 (0x3F200028), bit P
- If P >= 32: GPCLR1 (0x3F20002C), bit (P - 32)

**Worked example -- GPIO 17 (external LED):**
```
GPFSEL1 (pins 10-19): address 0x3F200004
Bit position: (17 % 10) * 3 = 7 * 3 = 21
Value: 1 << 21 = 0x00200000

GPSET0 (pins 0-31): address 0x3F20001C
Bit position: 17
Value: 1 << 17 = 0x00020000

GPCLR0 (pins 0-31): address 0x3F200028
Bit position: 17
Value: 1 << 17 = 0x00020000
```

---

## Differences cles avec les TP 1-3

| Aspect | TP1-3 (User-space) | TP4 (Bare-metal) |
|--------|---------------------|-------------------|
| OS | Linux (QEMU or real) | None |
| Stack | Initialized by OS | Not available |
| LR save | On stack (stmfd) | In register (mov r3, lr) |
| Memory access | Variables in .data/.bss | Hardware registers via MMIO |
| Program end | Infinite loop (convention) | Infinite loop (necessary) |
| Linking | Standard ld | ld -Ttext=0x8000 |
| Output format | ELF executable | Raw binary (kernel.img) |

## Build and Deploy

```bash
arm-none-eabi-as -o main.o main.s
arm-none-eabi-ld -Ttext=0x8000 -o kernel.elf main.o
arm-none-eabi-objcopy kernel.elf -O binary kernel.img
# Copy kernel.img to Raspberry Pi SD card (along with bootcode.bin and start.elf)
```

**Why 0x8000?** The Raspberry Pi GPU firmware loads `kernel.img` to physical address 0x8000. The first 32KB is reserved for GPU and interrupt vectors.
