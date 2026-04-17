---
title: "Assembly Exam Walkthroughs"
sidebar_position: 2
---

# Assembly Exam Walkthroughs

## 2017 Exam -- String Processing

### Exercise 1: Count Character Occurrences

**Problem** (reconstructed from solution code): Count the number of 'e' characters in the string "Ouvroir de litterature potentielle". Note: the source file `Exercice1 Theo.s` uses the accented spelling "litterature", which means the accented character is NOT counted by ASCII comparison.

**Given code** (`Exercice1 Theo.s`):

```arm
.data
  a: .space 4
  b: .asciz "Ouvroir de littérature potentielle"
.align
.text
.global _Start
_Start:
  mov r1, #0              @ r1 = counter (number of 'e' found)
  mov r2, #0              @ r2 = current character
  ldr r0, =b              @ r0 = pointer to string

  loop:
    ldrb r2, [r0], #1     @ r2 = current char, r0 += 1 (post-increment)
    cmp r2, #'e'           @ compare with 'e'
    addeq r1, r1, #1       @ if equal: counter++
    cmp r2, #0             @ check null terminator
    bne loop                @ continue if not end

  ldr r0, =a
  str r1, [r0]             @ store count in variable 'a'
```

**Note on encoding**: The original source string contains the accented character "e" in "litterature". Since ARM `LDRB` compares raw byte values, the accented "e" (UTF-8: 0xC3 0xA9) does NOT match ASCII 'e' (0x65). This affects the count.

### Step-by-Step Methodology

**Step 1: Identify the data structures**
- `a`: 4-byte space for the result
- `b`: Null-terminated string

**Step 2: Trace the registers**
- r0: Pointer walking through the string
- r1: Counter (accumulates result)
- r2: Current character being examined

**Step 3: Understand the loop pattern**
This is the standard string traversal pattern:
1. Load byte with post-increment (`LDRB r2, [r0], #1`)
2. Process the character (compare with target)
3. Use conditional execution for counting (`ADDEQ`)
4. Check for null terminator
5. Loop back

**Step 4: Count the result**
String: "Ouvroir de litterature potentielle" (note: the accented e in "litterature" is NOT matched by `cmp r2, #'e'`)
Occurrences of 'e': d**e**, literatur**e**, pot**e**nti**e**ll**e** = 5

**Key exam techniques demonstrated**:
- Post-increment addressing for string traversal
- Conditional execution (`ADDEQ`) avoids branches
- Null-terminated string convention

---

## 2018 Exam -- Structures and Vectors

### Context

The exam works with mathematical structures:

**Line** (Droite): ax + by + c = 0
```
Structure Droite {
    int a;       @ offset 0
    int b;       @ offset 4
    int c;       @ offset 8
}
```

**Direction Vector** (VectDir): (-b, a) for line ax + by + c = 0
```
Structure VectDir {
    int x;       @ offset 0
    int y;       @ offset 4
}
```

### Exercise: GenerationVectDir

**Problem**: Given an array of lines, compute the direction vector for each line. The direction vector of ax + by + c = 0 is (-b, a).

**Data setup**:
```arm
.data
D1: .word 3, 2, 12         @ Line: 3x + 2y + 12 = 0
D2: .word 6, 4, 0          @ Line: 6x + 4y = 0
D3: .word -1, 2, 3         @ Line: -x + 2y + 3 = 0

tabDroites: .word D1, D2, D3   @ Array of pointers to lines
tabVectDir: .word v1, v2, v3   @ Array of pointers to vectors

.bss
v1: .space 8                @ Direction vector for D1
v2: .space 8                @ Direction vector for D2
v3: .space 8                @ Direction vector for D3
```

**Solution code** (annotated version of `Annale 2018 GenerationVectDir.s`):

```arm
GenerationVectDir:
    @ Prologue
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    sub sp, sp, #4           @ 1 local variable: i
    stmfd sp!, {r0-r9}       @ Save all working registers

    @ Initialize loop: i = 0
    mov r4, #0
    str r4, [fp, #-4]        @ i = 0
    ldr r2, [fp, #16]        @ r2 = nbDroites (parameter)

Boucle:
    cmp r4, r2                @ i < nbDroites?
    bge fin_boucle

    @ Load ptTabDroites[i]
    ldr r8, [fp, #8]         @ r8 = tabDroites (parameter)
    ldr r5, [r8, r4, lsl #2] @ r5 = tabDroites[i] (pointer to line)

    @ Extract line coefficients
    ldr r6, [r5, #4]         @ r6 = tabDroites[i].b
    ldr r7, [r5, #0]         @ r7 = tabDroites[i].a
    rsb r6, r6, #0           @ r6 = -b (negate b)

    @ Store direction vector
    ldr r9, [fp, #12]        @ r9 = tabVectDir (parameter)
    ldr r3, [r9, r4, lsl #2] @ r3 = tabVectDir[i] (pointer to vector)
    str r6, [r3, #0]         @ tabVectDir[i].x = -b
    str r7, [r3, #4]         @ tabVectDir[i].y = a

    @ i++
    add r4, r4, #1
    str r4, [fp, #-4]
    b Boucle

fin_boucle:
    @ Epilogue
    ldmfd sp!, {r0-r9}
    add sp, sp, #4
    ldmfd sp!, {fp}
    ldmfd sp!, {lr}
    bx lr
```

### Key Exam Techniques

1. **Array of pointers to structures**: `ldr r5, [r8, r4, lsl #2]` gets the i-th pointer, then `ldr r6, [r5, #4]` dereferences the structure field.

2. **RSB for negation**: `rsb r6, r6, #0` computes 0 - r6 = -r6. This is the standard way to negate in ARM.

3. **Scaled indexing**: `ldr r5, [r8, r4, lsl #2]` means r5 = memory[r8 + r4*4]. The `lsl #2` multiplies the index by 4 for word-sized pointers.

### Exercise: Collinearity Test

**Problem**: Test if two vectors are collinear. Vectors (x1,y1) and (x2,y2) are collinear if x1*y2 - y1*x2 = 0.

```arm
Colinearite:
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    sub sp, sp, #4
    stmfd sp!, {r0-r9}

    @ Load vector u
    ldr r0, [fp, #12]        @ r0 = address of vector u
    ldr r5, [r0, #0]         @ r5 = u.x
    ldr r6, [r0, #4]         @ r6 = u.y

    @ Load vector v
    ldr r1, [fp, #16]        @ r1 = address of vector v
    ldr r7, [r1, #0]         @ r7 = v.x
    ldr r8, [r1, #4]         @ r8 = v.y

    @ Cross product: u.x * v.y - u.y * v.x
    mul r5, r5, r8            @ r5 = u.x * v.y
    mul r6, r6, r7            @ r6 = u.y * v.x
    sub r5, r5, r6            @ r5 = u.x*v.y - u.y*v.x

    @ Check if zero (collinear)
    cmp r5, #0
    moveq r8, #1              @ if zero: collinear (result = 1)
    streq r8, [fp, #8]
    movne r8, #0              @ if non-zero: not collinear (result = 0)
    strne r8, [fp, #8]

    @ Epilogue
    ldmfd sp!, {r0-r9}
    add sp, sp, #4
    ldmfd sp!, {fp}
    ldmfd sp!, {lr}
    bx lr
```

**Note on the source code**: The original student solution (`assembleur_2018.s`) contains a bug in the collinearity check: the `STR` instructions lack conditional suffixes (`STREQ`/`STRNE`), so the result is always overwritten unconditionally. The version shown above corrects this by using `STREQ` and `STRNE`. The source also uses indexed addressing (`ldr r5, [r0, r4, LSL #2]`) with a loop counter to access vector fields, rather than the simpler direct-offset approach shown here.

**Expected results**:
- D1 direction: (-2, 3), D2 direction: (-4, 6)
- Cross product: (-2)*6 - 3*(-4) = -12 + 12 = 0 -> Collinear (D1 parallel to D2)

---

## 2019 Exam -- Structures and String Processing

### Context

The exam works with ingredient structures for a recipe:

```
Structure Ingredient {
    byte grammage[3];    @ offset 0: 3 bytes encoding weight (BCD-like)
    padding;             @ offset 3: alignment
    char nom[12];        @ offset 4: name string
}
```

Total size: 16 bytes per ingredient.

**Data**:
```arm
i1: .byte 1, 5, 0   @ grammage = 150
    .align
    .asciz "BEURRE"

i2: .byte 0, 8, 0   @ grammage = 080
    .align
    .asciz "SUCRE"

@ ... more ingredients ...

i6: .asciz ""        @ empty name = sentinel (end of list)

TabIngredients: .word i1, i2, i3, i4, i5, i6
```

### Exercise: CompterIngredients (Count Ingredients)

**Problem**: Count the number of ingredients in the table (stop at sentinel with empty name).

```arm
CompterIngredients:
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    sub sp, sp, #4           @ local variable: i

    ldr r0, [fp, #12]        @ r0 = pointer to TabIngredients
    mov r1, #0               @ r1 = i = 0
    str r1, [fp, #-4]

loop:
    ldr r2, [r0, r1, lsl #2] @ r2 = TabIngredients[i] (pointer to ingredient)
    ldrb r2, [r2]             @ r2 = first byte of ingredient
                              @ For sentinel: first byte of empty string = 0
    cmp r2, #0
    beq finloop               @ if null: end of list

    add r1, r1, #1            @ i++
    b loop

finloop:
    str r1, [fp, #-4]         @ store count in local
    str r1, [fp, #8]          @ store count in return value
    b fin

fin:
    add sp, sp, #4
    ldmfd sp!, {fp}
    ldmfd sp!, {lr}
    bx lr
```

**Key technique**: Using `LDRB` to read the first byte of each ingredient's data. For the sentinel (empty string), the first byte is the null terminator (0).

### Exercise: TrouverNb (Extract Number from Grammage)

**Problem**: Extract the 3-byte grammage of ingredient i as an integer. The grammage is stored as 3 separate bytes representing digits (BCD-like encoding).

```arm
TrouverNb:
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    sub sp, sp, #8           @ locals: j, nb

    mov r0, #0               @ j = 0
    str r0, [fp, #-4]
    mov r1, #0               @ nb = 0
    str r1, [fp, #-8]

loop1:
    ldr r2, [fp, #-8]        @ r2 = nb
    mov r6, #10
    mul r2, r2, r6            @ r2 = nb * 10

    ldr r3, [fp, #16]        @ r3 = TabIngredients
    ldr r4, [fp, #12]        @ r4 = ingredient index i
    ldr r3, [r3, r4, lsl #2] @ r3 = TabIngredients[i]
    ldrb r3, [r3, r0]        @ r3 = byte at position j of ingredient

    add r5, r3, r2            @ r5 = nb*10 + digit
    str r5, [fp, #-8]         @ nb = r5
    str r0, [fp, #-4]         @ save j

    cmp r0, #2
    bge finloop1              @ exit after 3 bytes (j=0,1,2)

    add r0, r0, #1            @ j++
    b loop1

finloop1:
    str r5, [fp, #8]          @ store result

    add sp, sp, #8
    ldmfd sp!, {fp}
    ldmfd sp!, {lr}
    bx lr
```

**Execution for ingredient i1 (BEURRE, grammage bytes: 1, 5, 0)**:
```
j=0: nb = 0*10 + 1 = 1
j=1: nb = 1*10 + 5 = 15
j=2: nb = 15*10 + 0 = 150
Result: 150 (grams of butter)
```

---

## General Exam-Taking Strategy for Assembly

### Reading Code (Comprehension Questions)

1. **Identify the data**: Read `.data` and `.bss` sections first. Understand what variables exist and their types.
2. **Note the constants**: `.equ` and `.set` definitions tell you structure offsets and sizes.
3. **Trace registers**: For each instruction, write down what register holds what value.
4. **Draw the stack**: For function calls, draw the stack frame at the function entry point.

### Writing Code (Production Questions)

1. **Start with the prologue**: Always write the standard prologue first (save LR, FP, set FP, allocate locals, save registers).
2. **Define offsets**: Write `.equ` for all stack offsets before coding the body.
3. **Translate line by line**: Convert each pseudocode line to 2-4 ARM instructions.
4. **End with the epilogue**: Reverse the prologue exactly (restore registers, free locals, restore FP and LR, bx lr).
5. **Verify**: Check that every STMFD has a matching LDMFD with the same register list.

### Common Patterns to Memorize

**String traversal**:
```arm
ldr r0, =string
loop:
    ldrb r1, [r0], #1     @ load byte, advance pointer
    cmp r1, #0
    beq done
    @ ... process r1 ...
    b loop
```

**Array of pointers to structures**:
```arm
ldr r0, =table             @ r0 = table base
ldr r1, [r0, r2, lsl #2]   @ r1 = table[r2] (pointer)
ldr r3, [r1, #offset]       @ r3 = table[r2]->field
```

**Standard function frame**:
```arm
func:
    stmfd sp!, {fp, lr}
    mov fp, sp
    sub sp, sp, #N          @ N bytes of locals
    stmfd sp!, {r4-rX}     @ save callee-saved registers
    @ ... body ...
    ldmfd sp!, {r4-rX}
    add sp, sp, #N
    ldmfd sp!, {fp, lr}
    bx lr
```

### Self-Check Before Submitting

- [ ] Every function saves and restores LR (if it calls other functions)
- [ ] Stack is balanced (total pushed = total popped)
- [ ] Correct use of LDRB for bytes, LDR for words
- [ ] Scaled indexing (lsl #2) used for word arrays
- [ ] All structure offsets correct (draw the structure layout)
- [ ] Loop terminates (counter compared correctly, branch direction correct)
- [ ] Conditional execution conditions match the preceding CMP
