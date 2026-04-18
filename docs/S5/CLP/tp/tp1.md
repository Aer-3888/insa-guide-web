---
title: "TP1 - Introduction a l'assembleur ARM"
sidebar_position: 1
---

# TP1 - Introduction a l'assembleur ARM

## Presentation

Ce TP introduit les concepts fondamentaux de l'assembleur ARM a travers l'implementation de l'algorithme du PGCD (Plus Grand Commun Diviseur). Deux implementations sont fournies, illustrant differents styles de codage et approches.

## Exercices

### 1. assembleur_TP1.s
Exercice d'assembleur ARM de base avec calcul du PGCD (implementation en style francais).

### 2. pgcd.s
Calcul du PGCD utilisant l'algorithme d'Euclide (implementation en style anglais avec commentaires detailles).

## Algorithme du PGCD (algorithme d'Euclide)

Le Plus Grand Commun Diviseur est calcule a l'aide de l'algorithme d'Euclide :

```
function gcd(a, b):
    if a == 0 or b == 0:
        return 0
    if a == b:
        return a
    if a > b:
        return gcd(a - b, b)
    else:
        return gcd(a, b - a)
```

C'est un algorithme recursif qui soustrait de maniere repetee la plus petite valeur de la plus grande jusqu'a ce qu'elles soient egales.

## Concepts ARM cles illustres

### 1. Gestion de la pile

**Pile descendante pleine** (convention ARM standard) :
```assembly
stmfd sp!, {r0, r1}    @ Push r0 and r1 onto stack
ldmfd sp!, {r0, r1}    @ Pop from stack back into r0 and r1
```

Le suffixe `!` signifie "reecriture" - mettre a jour SP apres l'operation.

### 2. Convention d'appel de fonction

**Responsabilites de l'appelant** :
1. Empiler les arguments sur la pile (de droite a gauche)
2. Reserver de l'espace pour la valeur de retour
3. Appeler la fonction avec `bl`
4. Recuperer la valeur de retour depuis la pile
5. Nettoyer les arguments de la pile

**Responsabilites de l'appele** :
1. Sauvegarder LR (adresse de retour) et FP (pointeur de cadre)
2. Etablir le nouveau pointeur de cadre
3. Sauvegarder les registres qui seront modifies
4. Executer la logique de la fonction
5. Stocker la valeur de retour au bon decalage dans la pile
6. Restaurer les registres, FP et LR
7. Retourner avec `bx lr`

### 3. Organisation du cadre de pile

Pour un appel de fonction `pgcd(a, b)` retournant `res` :

```
High memory
    +------------------+
    | b (arg 2)        |  [fp, #16]
    +------------------+
    | a (arg 1)        |  [fp, #12]
    +------------------+
    | res (return)     |  [fp, #8]
    +------------------+
    | Saved LR         |  [fp, #4]
    +------------------+
FP->| Saved FP         |  [fp, #0]
    +------------------+
    | Saved registers  |  Below FP
SP->+------------------+
Low memory
```

Decalages definis avec `.equ` :
```assembly
.equ a, 12        @ Offset to parameter a
.equ b, 16        @ Offset to parameter b  
.equ res, 8       @ Offset to return value
```

### 4. Appels de fonctions recursifs

La recursivite en assembleur necessite une gestion soigneuse de la pile :

```assembly
@ Recursive call: pgcd(a-b, b)
sub r0, r0, r1          @ Compute a-b
stmfd sp!, {r0, r1}     @ Push new arguments
sub sp, sp, #4          @ Reserve space for result
bl pgcd                 @ Recursive call
ldmfd sp!, {r0}         @ Get result
add sp, sp, #8          @ Clean up arguments
str r0, [fp, #res]      @ Store in our return location
```

### 5. Branchements conditionnels

L'algorithme utilise des comparaisons et des branchements conditionnels :

```assembly
cmp r0, #0              @ Compare r0 with 0
beq retZ                @ Branch if equal (a == 0)

cmp r0, r1              @ Compare r0 with r1
beq retA                @ Branch if equal (a == b)
bgt retP1               @ Branch if greater than (a > b)
                        @ Fall through to else case (a < b)
```

### 6. Acces memoire

**Chargement de donnees depuis la memoire** :
```assembly
ldr r0, =x              @ Load address of x into r0
ldr r0, [r0]            @ Load value at address into r0
```

**Processus en deux etapes** :
1. `ldr r0, =x` - Obtenir l'adresse (pseudo-instruction)
2. `ldr r0, [r0]` - Dereferencement du pointeur

**Stockage dans la pile** :
```assembly
str r2, [fp, #res]      @ Store r2 at offset 'res' from FP
```

## Reference du jeu d'instructions

### Deplacement de donnees
- `MOV rd, op2` - Move operand2 to destination register
- `LDR rd, [addr]` - Load 32-bit word from memory
- `STR rs, [addr]` - Store 32-bit word to memory

### Operations de pile
- `STMFD sp!, {list}` - Store multiple, full descending, writeback
- `LDMFD sp!, {list}` - Load multiple, full descending, writeback

### Arithmetique
- `ADD rd, rn, op2` - rd = rn + op2
- `SUB rd, rn, op2` - rd = rn - op2

### Branchement/Comparaison
- `CMP rn, op2` - Compare (sets condition flags)
- `B label` - Unconditional branch
- `BL label` - Branch with link (call function)
- `BX lr` - Branch exchange (return from function)
- `BEQ label` - Branch if equal (Z flag set)
- `BNE label` - Branch if not equal (Z flag clear)
- `BGT label` - Branch if greater than (signed)
- `BLT label` - Branch if less than (signed)

## Utilisation des registres

Dans ces implementations :
- **r0**: First parameter (a), intermediate calculations
- **r1**: Second parameter (b), intermediate calculations
- **r2**: Result value before storing
- **r3-r9**: Additional calculations (in pgcd.s)
- **SP (r13)**: Stack pointer
- **LR (r14)**: Return address (link register)
- **FP (r11)**: Frame pointer (base for accessing parameters/locals)

## Directives d'assemblage

### Definitions de sections
```assembly
.data                   @ Initialized data section
.bss                    @ Uninitialized data section
.text                   @ Code section
.global _start          @ Make _start visible to linker
```

### Definitions de donnees
```assembly
.word value             @ Define 32-bit word
.byte value             @ Define 8-bit byte
.ascii "string"         @ Define ASCII string
.skip n                 @ Reserve n bytes
.align                  @ Align to word boundary
```

### Constantes
```assembly
.equ name, value        @ Define assembly-time constant
.set name, value        @ Alternative syntax
```

## Compilation et execution

### Compilation
```bash
# Using GNU ARM toolchain
arm-linux-gnueabi-as -o tp1.o src/assembleur_TP1.s
arm-linux-gnueabi-ld -o tp1 tp1.o

# Or for pgcd.s
arm-linux-gnueabi-as -o pgcd.o src/pgcd.s
arm-linux-gnueabi-ld -o pgcd pgcd.o
```

### Execution avec QEMU
```bash
qemu-arm ./tp1
echo $?    # Check exit code (result may be in r0)
```

### Debogage
```bash
arm-linux-gnueabi-gdb ./tp1
(gdb) break pgcd
(gdb) run
(gdb) info registers
(gdb) x/10wx $sp        # Examine stack
(gdb) stepi             # Step one instruction
```

## Resultats attendus

### assembleur_TP1.s
- Input: `x = 666, y = 666`
- Expected output: `res = 666` (GCD of 666 and 666 is 666)

### pgcd.s  
- Input: `a = 24, b = 18`
- Expected output: `res = 6` (GCD of 24 and 18 is 6)

**Verification** :
- 24 = 4 x 6
- 18 = 3 x 6
- Aucun nombre plus grand ne divise les deux

## Exercices d'entrainement

1. **Tracer l'execution** : Dessiner l'etat de la pile apres chaque appel de fonction pour `pgcd(24, 18)`
2. **Modifier les valeurs** : Changer les valeurs initiales de a et b et verifier le resultat
3. **Version iterative** : Implementer le PGCD de maniere iterative (sans recursion) pour comparer les approches
4. **Optimisation** : Remarquer que l'algorithme par soustraction est lent. Rechercher la version par modulo : `pgcd(a, b) = pgcd(b, a mod b)`

## Erreurs courantes et solutions

### Desequilibre de pile
**Probleme** : Le programme plante ou donne de mauvais resultats
**Cause** : Operations push/pop non appariees
**Solution** : S'assurer que chaque `stmfd sp!, {...}` a un `ldmfd sp!, {...}` correspondant avec les memes registres

### Mauvais decalages
**Probleme** : Chargement de mauvaises valeurs pour les parametres
**Cause** : Calcul incorrect des decalages `.equ`
**Solution** : Dessiner l'organisation de la pile, compter les octets depuis FP

### Sauvegarde de LR manquante
**Probleme** : Recursion infinie ou crash
**Cause** : Appel d'une autre fonction sans sauvegarder LR d'abord
**Solution** : Toujours faire `stmfd sp!, {lr}` avant `bl` si votre fonction appelle d'autres fonctions

### Pointeur de cadre non etabli
**Probleme** : Impossible d'acceder correctement aux parametres
**Cause** : Oubli de `mov fp, sp` apres la sauvegarde de l'ancien FP
**Solution** : Etablir FP immediatement apres l'avoir sauvegarde

## References

- Manuel de reference de l'architecture ARM : Convention d'appel
- Diapositives du cours : `../../cours/ARM/AssembleurARM - 2020-2021.pdf`
- Reference des instructions ARM : `../../cours/ARM/arm-cheatsheet.pdf`
