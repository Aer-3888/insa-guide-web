---
title: "TP4 - Raspberry Pi GPIO Control"
sidebar_position: 4
---

# TP4 - Raspberry Pi GPIO Control

## Overview

This lab demonstrates bare-metal programming on Raspberry Pi, focusing on GPIO (General Purpose Input/Output) control. The exercise programs the Raspberry Pi to blink the ACT (Activity) LED in an SOS Morse code pattern.

## Exercise

### main.s - LED Blink Control (SOS Pattern)

Programs the Raspberry Pi's ACT LED (GPIO pin 47) to blink in Morse code SOS pattern:
- **S**: 3 short blinks
- **O**: 3 long blinks  
- **S**: 3 short blinks

## Raspberry Pi Hardware Concepts

### GPIO (General Purpose Input/Output)

GPIOs are pins that can be programmed to:
- **Input**: Read digital signals (buttons, sensors)
- **Output**: Control digital signals (LEDs, motors)

**Memory-Mapped I/O**: GPIO pins are controlled by writing to specific memory addresses.

### GPIO Register Map (BCM2837 - Raspberry Pi 3)

Base address: `0x3F200000` (for Raspberry Pi 3)

**Key registers**:
```
GPFSEL0-5   GPIO Function Select    (0x3F200000-0x3F200014)
GPSET0-1    GPIO Pin Output Set     (0x3F20001C-0x3F200020)
GPCLR0-1    GPIO Pin Output Clear   (0x3F200028-0x3F20002C)
```

### ACT LED (GPIO 47)

The green Activity LED on Raspberry Pi is connected to GPIO pin 47.

**Register calculations**:
- Pin 47 is in the second bank (pins 32-53)
- Function Select: `GPFSEL4` (handles pins 40-49)
- Set register: `GPSET1` (handles pins 32-53)
- Clear register: `GPCLR1` (handles pins 32-53)

## Key ARM Concepts Demonstrated

### 1. Memory-Mapped I/O

Hardware is controlled by reading/writing to specific memory addresses:

```assembly
.set GPSEL4, 0x3f200010     /* GPIO Function Select 4 */
.set GPSET1, 0x3f200020     /* GPIO Pin Set 1 */
.set GPCLR1, 0x3f20002c     /* GPIO Pin Clear 1 */

ldr r0, =GPSEL4             /* Load register address */
mov r1, #0b...              /* Prepare bit pattern */
str r1, [r0]                /* Write to register */
```

**Key point**: No actual I/O instructions needed - just memory writes!

### 2. Bit Manipulation

**Setting individual bits** to control specific pins:

```assembly
/* GPIO 47 in GPFSEL4 */
/* Each pin uses 3 bits: bits [21:19] for pin 47 */
/* 001 = Output mode */
mov r1, #0b00000000001000000000000000000000
str r1, [r0]                /* Configure pin 47 as output */
```

**Turning LED on/off**:
```assembly
/* GPIO 47 in GPSET1/GPCLR1 */
/* Pin 47 = bit 15 (47 - 32 = 15) */
mov r1, #0b00000000000000001000000000000000

ldr r0, =GPSET1
str r1, [r0]                /* Turn LED on (set bit 15) */

ldr r0, =GPCLR1  
str r1, [r0]                /* Turn LED off (clear bit 15) */
```

### 3. Binary Literals

ARM assembly supports binary notation with `0b` prefix:

```assembly
mov r1, #0b1010             /* r1 = 10 (decimal) */
mov r2, #0b10000000         /* r2 = 128 */
```

**Why use binary?**
- Bit patterns are more readable
- Easy to see which bits are set
- Natural for hardware control

### 4. Timing Loops

**Software delay** using busy-wait loop:

```assembly
sleep:
    mov r0, #0              /* Counter = 0 */
sleep_loop:
    cmp r0, r2              /* Compare with target */
    bge end_sleep_loop      /* Exit if counter >= target */
    add r0, #4              /* Increment counter */
    b sleep_loop            /* Continue loop */
end_sleep_loop:
    bx lr                   /* Return */
```

**Timing**:
- No real-time guarantees (depends on CPU frequency)
- Rough approximation: more iterations = longer delay
- Short delay: 1,800,000 iterations
- Long delay: 9,000,000 iterations

### 5. Subroutine Linkage Without Stack

The `allumer` function uses **manual LR preservation**:

```assembly
allumer:
    mov r3, lr              /* Save return address in r3 */
    
    /* ... function code ... */
    bl sleep                /* Call another function (corrupts LR) */
    /* ... more code ... */
    bl sleep                /* Another call */
    
    bx r3                   /* Return using saved address */
```

**Why not use the stack?**
- Bare metal - no stack initialized
- Simple functions can use registers
- More efficient for leaf functions

## Morse Code Pattern

**SOS in Morse**: `... --- ...`

```
S: ●●●         (3 short)
O: ▬▬▬         (3 long)
S: ●●●         (3 short)
```

**Timing conventions**:
- Short pulse (dit): 1 unit
- Long pulse (dah): 3 units
- Gap between pulses: 1 unit
- Gap between letters: 3 units

**Implementation**:
```assembly
begin:
    ldr r2, =speed_short
    bl allumer              /* S: short 1 */
    bl allumer              /* S: short 2 */
    bl allumer              /* S: short 3 */
    
    ldr r2, =speed_long
    bl allumer              /* O: long 1 */
    bl allumer              /* O: long 2 */
    bl allumer              /* O: long 3 */
    
    ldr r2, =speed_short
    bl allumer              /* S: short 1 */
    bl allumer              /* S: short 2 */
    bl allumer              /* S: short 3 */
    
    ldr r2, =speed_long
    bl sleep                /* Long pause between repeats */
    
    b begin                 /* Repeat forever */
```

## GPIO Register Details

### GPFSEL (Function Select)

**Purpose**: Configure pin function (input, output, alternate function)

**Format**: 3 bits per pin
```
000 = Input
001 = Output
010 = Alternate function 5
011 = Alternate function 4
100 = Alternate function 0
101 = Alternate function 1
110 = Alternate function 2
111 = Alternate function 3
```

**For GPIO 47** (in GPFSEL4):
- Pin 47: bits [21:19]
- Set to `001` for output

**Calculation**:
```
Pin offset = (47 % 10) = 7
Bit offset = 7 × 3 = 21
Mask = 0b001 << 21 = 0b00000000001000000000000000000000
```

### GPSET (Set Register)

**Purpose**: Turn on (set high) GPIO pins

**Format**: 1 bit per pin (write 1 to set)
- Writing 1 sets the pin high
- Writing 0 has no effect

**For GPIO 47** (in GPSET1):
- Pin 47 → bit 15 (47 - 32)
- Mask = 1 << 15 = 0x8000

### GPCLR (Clear Register)

**Purpose**: Turn off (set low) GPIO pins

**Format**: 1 bit per pin (write 1 to clear)
- Writing 1 clears the pin low
- Writing 0 has no effect

**For GPIO 47** (in GPCLR1):
- Pin 47 → bit 15
- Mask = 1 << 15 = 0x8000

## Building and Running

### Prerequisites

- ARM cross-compiler: `arm-none-eabi-gcc` toolchain
- Raspberry Pi (any model with ACT LED)
- SD card with boot files

### Compilation

```bash
# Assemble
arm-none-eabi-as -o main.o src/main.s

# Link (bare metal - no OS)
arm-none-eabi-ld -Ttext=0x8000 -o kernel.elf main.o

# Convert to binary
arm-none-eabi-objcopy kernel.elf -O binary kernel.img
```

**Why 0x8000?**
- Raspberry Pi boot loader loads kernel at address 0x8000
- First 32KB reserved for GPU and boot code

### Deploying to Raspberry Pi

1. **Format SD card** as FAT32

2. **Copy boot files** to SD card:
   - `bootcode.bin` - GPU firmware
   - `start.elf` - GPU firmware
   - `kernel.img` - Your compiled program

3. **Insert SD card** into Raspberry Pi

4. **Power on** - LED should blink SOS pattern

### Debugging

**No output?** Check:
1. LED pin number (varies by Pi model)
2. GPIO base address (varies by Pi model)
3. Boot files present on SD card

**LED always on/off?** Check:
1. Bit positions in GPFSEL, GPSET, GPCLR
2. Function select configuration

## Raspberry Pi Model Differences

### GPIO Base Addresses

- **Pi 1**: `0x20200000`
- **Pi 2/3**: `0x3F200000`
- **Pi 4**: `0xFE200000`

### ACT LED Pins

- **Pi 1/2**: GPIO 47 (as used here)
- **Pi 3**: GPIO 47 or GPIO 29 (model dependent)
- **Pi 4**: Connected differently, may require PWM

**Portability**: Adjust base address and pin number for your model.

## Study Exercises

1. **Change Pattern**: Modify to blink "HI" in Morse code (···· ··)

2. **Button Input**: Add a button on GPIO 2, blink when pressed

3. **Multiple LEDs**: Control several external LEDs in sequence

4. **PWM**: Implement software PWM for LED brightness control

5. **Timer**: Use system timer instead of busy-wait loops

## Advanced Topics

### Hardware Timers

Replace busy-wait with actual timer:
- **System Timer**: Address 0x3F003000
- **ARM Timer**: Address 0x3F00B000

### Interrupts

Configure timer interrupts:
1. Set up interrupt vector table
2. Enable timer interrupt
3. Write interrupt handler
4. Use `wfi` (wait for interrupt) instead of busy-wait

### DMA

Use DMA (Direct Memory Access) for:
- Precise timing control
- CPU-free operations
- Complex LED patterns

## Common Errors

### Wrong Address
**Problem**: LED doesn't respond
**Solution**: Verify GPIO base address for your Pi model

### Wrong Bit Position
**Problem**: Wrong LED turns on
**Solution**: Calculate bit position: (pin - 32) for GPSET1/GPCLR1

### Stack Issues
**Problem**: Crash after function call
**Solution**: This code doesn't use stack - if adding features, initialize SP first:
```assembly
mov sp, #0x8000  /* Stack grows down from 0x8000 */
```

### Timing Too Fast/Slow
**Problem**: Can't see blinks or too slow
**Solution**: Adjust `speed_short` and `speed_long` constants

## References

- BCM2835 ARM Peripherals Datasheet
- Raspberry Pi Hardware Documentation: www.raspberrypi.org/documentation/
- ARM Architecture Reference Manual
- Course materials: `../../cours/ARM/AssembleurARM - 2020-2021.pdf`
