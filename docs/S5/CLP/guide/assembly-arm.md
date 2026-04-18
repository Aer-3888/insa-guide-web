---
title: "Chapitre 6 -- Langage assembleur ARM"
sidebar_position: 2
---

# Chapitre 6 -- Langage assembleur ARM

## 6.1 Presentation

La partie assembleur ARM du cours CLP couvre la programmation au niveau materiel en utilisant le jeu d'instructions ARM. ARM est une architecture RISC (Reduced Instruction Set Computer) utilisee dans les appareils mobiles, les systemes embarques, et le Raspberry Pi utilise en TP4.

---

## 6.2 Jeu de registres ARM

### Registres generaux

| Registre | Alias | Convention |
|----------|-------|------------|
| r0 | -- | Argument 1 / Valeur de retour |
| r1 | -- | Argument 2 |
| r2 | -- | Argument 3 |
| r3 | -- | Argument 4 |
| r4-r10 | -- | Usage general (sauvegardes par l'appele) |
| r11 | fp | Pointeur de cadre (Frame Pointer) |
| r12 | ip | Registre de travail intra-procedure |
| r13 | sp | Pointeur de pile (Stack Pointer) |
| r14 | lr | Registre de lien (adresse de retour) |
| r15 | pc | Compteur de programme (Program Counter) |

### Drapeaux de condition (CPSR)

| Drapeau | Nom | Active quand... |
|---------|-----|-----------------|
| N | Negatif | Le bit 31 du resultat est 1 (negatif en complement a deux) |
| Z | Zero | Le resultat est nul |
| C | Retenue (Carry) | Debordement non signe (retenue sortante du bit 31) |
| V | Debordement (oVerflow) | Debordement signe |

---

## 6.3 Sections de donnees et directives

### Declarations de sections

```arm
.data                    @ Section de donnees initialisees
    x: .word 42          @ Entier 32 bits, initialise a 42
    msg: .asciz "Hello"  @ Chaine terminee par null
    arr: .word 1, 2, 3   @ Tableau de 3 mots

.bss                     @ Section de donnees non initialisees
    result: .skip 4      @ Reserve 4 octets (1 mot)
    buffer: .space 100   @ Reserve 100 octets
    .align               @ Aligner a la frontiere de mot

.text                    @ Section de code
    .global _start       @ Rendre _start visible pour l'editeur de liens
```

### Directives de definition de donnees

| Directive | Taille | Exemple |
|-----------|--------|---------|
| `.word` | 4 octets | `.word 42` ou `.word 1, 2, 3` |
| `.byte` | 1 octet | `.byte 0xFF` |
| `.ascii` | chaine (sans null) | `.ascii "hello"` |
| `.asciz` | chaine (terminee par null) | `.asciz "hello"` |
| `.skip N` / `.space N` | N octets | `.skip 40` |
| `.align` | remplir jusqu'a la frontiere de mot | `.align` |

### Constantes

```arm
.equ NAME, value        @ Constante au moment de l'assemblage
.set NAME, value        @ Syntaxe alternative (meme effet)

@ Exemple :
.equ N, 10              @ N vaut toujours 10
.set offset_x, 4        @ offset_x vaut toujours 4
```

---

## 6.4 Jeu d'instructions

### Deplacement de donnees

```arm
MOV  rd, op2            @ rd = op2 (registre ou immediat)
MVN  rd, op2            @ rd = NOT(op2)
LDR  rd, [rn]           @ rd = memory[rn]  (charger un mot)
LDR  rd, [rn, #offset]  @ rd = memory[rn + offset]
LDR  rd, =label         @ rd = adresse de label (pseudo-instruction)
STR  rd, [rn]           @ memory[rn] = rd  (stocker un mot)
STR  rd, [rn, #offset]  @ memory[rn + offset] = rd
LDRB rd, [rn]           @ rd = memory[rn] (charger un octet, extension par zeros)
STRB rd, [rn]           @ memory[rn] = rd (stocker un octet)
```

### Charger une variable depuis la memoire (patron en deux etapes)

```arm
ldr r0, =x              @ Etape 1 : r0 = ADRESSE de x
ldr r0, [r0]            @ Etape 2 : r0 = VALEUR a cette adresse

@ Pour stocker :
ldr r0, =x              @ r0 = adresse de x
str r1, [r0]            @ memory[adresse de x] = r1
```

Ce patron en deux etapes est fondamental. `ldr r0, =x` est une pseudo-instruction qui charge l'adresse dans r0. Le second `ldr` dereference le pointeur.

### Modes d'adressage

```arm
@ Adressage par decalage
ldr r0, [r1, #4]        @ r0 = memory[r1 + 4]    (pre-indexe)
ldr r0, [r1, r2]        @ r0 = memory[r1 + r2]
ldr r0, [r1, r2, lsl #2] @ r0 = memory[r1 + r2*4] (index avec mise a l'echelle)

@ Adressage post-indexe
ldr r0, [r1], #4        @ r0 = memory[r1], puis r1 = r1 + 4

@ Pre-indexe avec reecriture
ldr r0, [r1, #4]!       @ r1 = r1 + 4, puis r0 = memory[r1]
```

### Arithmetique

```arm
ADD  rd, rn, op2        @ rd = rn + op2
SUB  rd, rn, op2        @ rd = rn - op2
RSB  rd, rn, op2        @ rd = op2 - rn  (soustraction inverse)
MUL  rd, rm, rs         @ rd = rm * rs
MLA  rd, rm, rs, rn     @ rd = rm * rs + rn  (multiplication-accumulation)
```

**RSB est utile** pour la negation : `RSB r0, r0, #0` calcule r0 = 0 - r0 = -r0.

### Logique

```arm
AND  rd, rn, op2        @ rd = rn ET op2
ORR  rd, rn, op2        @ rd = rn OU op2
EOR  rd, rn, op2        @ rd = rn XOR op2
BIC  rd, rn, op2        @ rd = rn ET NON(op2)  (effacement de bits)
```

### Decalages

```arm
MOV  rd, rm, LSL #n     @ rd = rm << n   (decalage logique a gauche)
MOV  rd, rm, LSR #n     @ rd = rm >> n   (decalage logique a droite, remplissage par 0)
MOV  rd, rm, ASR #n     @ rd = rm >> n   (decalage arithmetique a droite, extension de signe)
MOV  rd, rm, ROR #n     @ rd = rm en rotation a droite de n)
```

Les decalages peuvent aussi etre utilises comme second operande dans d'autres instructions :
```arm
ADD r0, r1, r2, LSL #2  @ r0 = r1 + (r2 * 4)
```

### Comparaison

```arm
CMP  rn, op2            @ Positionner les drapeaux selon rn - op2 (resultat ignore)
CMN  rn, op2            @ Positionner les drapeaux selon rn + op2
TST  rn, op2            @ Positionner les drapeaux selon rn ET op2
TEQ  rn, op2            @ Positionner les drapeaux selon rn XOR op2
```

### Branchement

```arm
B    label              @ Branchement inconditionnel
BL   label              @ Branchement avec lien (sauvegarde PC+4 dans LR)
BX   lr                 @ Branchement vers l'adresse dans lr (retour de fonction)
BEQ  label              @ Brancher si Z=1 (egal)
BNE  label              @ Brancher si Z=0 (different)
BGT  label              @ Brancher si N=V et Z=0 (signe strictement superieur)
BLT  label              @ Brancher si N!=V (signe strictement inferieur)
BGE  label              @ Brancher si N=V (signe superieur ou egal)
BLE  label              @ Brancher si Z=1 ou N!=V (signe inferieur ou egal)
BHI  label              @ Brancher si C=1 et Z=0 (non signe strictement superieur)
BHS  label              @ Brancher si C=1 (non signe superieur ou egal)
BLO  label              @ Brancher si C=0 (non signe strictement inferieur)
BLS  label              @ Brancher si C=0 ou Z=1 (non signe inferieur ou egal)
```

### Execution conditionnelle

Toute instruction ARM peut etre rendue conditionnelle en ajoutant un suffixe de condition :

```arm
ADDEQ r0, r0, #1       @ Ajouter 1 a r0 UNIQUEMENT SI le drapeau Zero est active
MOVGT r1, r0            @ Deplacer r0 vers r1 UNIQUEMENT SI strictement superieur
STRNE r2, [r3]          @ Stocker UNIQUEMENT SI different
```

Cela evite les branchements courts et c'est une caracteristique emblematique de l'ISA ARM.

**Exemple** (du TD assembleur, comptage dans un tableau) :
```arm
cmp r0, #0
addlt r3, r3, #1       @ Si r0 < 0 : incrementer le compteur de negatifs
addeq r4, r4, #1       @ Si r0 == 0 : incrementer le compteur de zeros
```

---

## 6.5 Operations sur la pile

### Pile descendante pleine

L'ARM utilise par convention une pile descendante pleine (Full Descending - FD) :
- **Pleine (Full)** : SP pointe sur le dernier emplacement occupe
- **Descendante (Descending)** : La pile croit vers les adresses basses

### Push et Pop

```arm
STMFD sp!, {r0, r1, r2}    @ Empiler r0, r1, r2 sur la pile
                            @ SP diminue de 12 (3 * 4 octets)
                            @ Registres stockes : r2 a l'adresse la plus haute, r0 a la plus basse

LDMFD sp!, {r0, r1, r2}    @ Depiler de la pile vers r0, r1, r2
                            @ SP augmente de 12
```

**IMPORTANT** : STMFD stocke les registres en ordre croissant de numero de registre depuis l'adresse la plus basse. Donc `STMFD sp!, {r0, r1}` stocke r0 a [sp-8] et r1 a [sp-4].

### Reserver de l'espace pour les variables locales

```arm
SUB sp, sp, #8          @ Reserver 8 octets (2 mots) sur la pile
@ ... utiliser [fp, #-4] et [fp, #-8] pour les variables locales ...
ADD sp, sp, #8          @ Liberer l'espace reserve
```

---

## 6.6 Convention d'appel de fonction

### Le cadre de pile (stack frame)

```
Adresses hautes
    +------------------+
    | Argument N       |  [fp, #8 + 4*(N-1)]
    +------------------+
    | ...              |
    +------------------+
    | Argument 2       |  [fp, #12]
    +------------------+
    | Argument 1       |  [fp, #8]
    +------------------+
    | Valeur de retour |  [fp, #8] (si resultat passe par la pile)
    +------------------+
    | LR sauvegarde    |  [fp, #4]
    +------------------+
FP->| FP sauvegarde    |  [fp, #0]
    +------------------+
    | Var. locale 1    |  [fp, #-4]
    +------------------+
    | Var. locale 2    |  [fp, #-8]
    +------------------+
    | Registres sauv.  |  (sous les variables locales)
    +------------------+
SP->|                  |
Adresses basses
```

### Responsabilites de l'appelant

```arm
@ 1. Charger les arguments
ldr r0, =arg1
ldr r0, [r0]
ldr r1, =arg2
ldr r1, [r1]

@ 2. Empiler les arguments sur la pile
stmfd sp!, {r0, r1}        @ Empiler les arguments

@ 3. Reserver de l'espace pour la valeur de retour (si retour par pile)
sub sp, sp, #4

@ 4. Appeler la fonction
bl myFunction

@ 5. Recuperer la valeur de retour
ldmfd sp!, {r2}             @ Depiler la valeur de retour dans r2

@ 6. Nettoyer les arguments
add sp, sp, #8              @ Retirer 2 arguments (2 * 4 octets)
```

### Responsabilites de l'appele (prologue/epilogue de fonction)

```arm
myFunction:
    @ === PROLOGUE ===
    stmfd sp!, {lr}         @ Sauvegarder l'adresse de retour
    stmfd sp!, {fp}         @ Sauvegarder le pointeur de cadre de l'appelant
    mov fp, sp              @ Etablir notre pointeur de cadre
    sub sp, sp, #N          @ Reserver N octets pour les variables locales
    stmfd sp!, {r4-r9}      @ Sauvegarder les registres qu'on va modifier

    @ === CORPS ===
    ldr r0, [fp, #8]        @ Acceder au premier parametre
    ldr r1, [fp, #12]       @ Acceder au second parametre
    @ ... calculs ...
    str r0, [fp, #8]        @ Stocker la valeur de retour (si par pile)

    @ === EPILOGUE ===
    ldmfd sp!, {r4-r9}      @ Restaurer les registres sauvegardes
    add sp, sp, #N          @ Liberer les variables locales
    ldmfd sp!, {fp}         @ Restaurer le pointeur de cadre de l'appelant
    ldmfd sp!, {lr}         @ Restaurer l'adresse de retour
    bx lr                   @ Retourner a l'appelant
```

### Style de prologue alternatif

Certaines implementations sauvegardent FP et LR ensemble :

```arm
stmfd sp!, {fp, lr}     @ Sauvegarder les deux en une instruction
mov fp, sp
@ ...
ldmfd sp!, {fp, lr}     @ Restaurer les deux
bx lr
```

---

## 6.7 Recursivite

### Modele pour les fonctions recursives

```arm
recursive_func:
    @ Prologue : IL FAUT sauvegarder LR car BL va l'ecraser
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    stmfd sp!, {r0-r3}      @ Sauvegarder les registres utilises

    @ Charger les parametres
    ldr r0, [fp, #param1_offset]

    @ Verification du cas de base
    cmp r0, #base_value
    beq base_case

    @ Cas recursif : preparer les nouveaux arguments
    @ ... modifier r0, r1 ...
    stmfd sp!, {r0, r1}     @ Empiler les nouveaux arguments
    sub sp, sp, #4           @ Reserver l'espace pour le resultat
    bl recursive_func        @ APPEL RECURSIF
    ldmfd sp!, {r0}          @ Recuperer le resultat
    add sp, sp, #8           @ Nettoyer les arguments
    str r0, [fp, #result_offset]
    b epilogue

base_case:
    @ Stocker le resultat du cas de base
    mov r0, #base_result
    str r0, [fp, #result_offset]

epilogue:
    ldmfd sp!, {r0-r3}
    ldmfd sp!, {fp}
    ldmfd sp!, {lr}
    bx lr
```

### Exemple : PGCD recursif (du TP1)

```arm
pgcd:
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp
    stmfd sp!, {r0, r1, r2}

    ldr r0, [fp, #12]       @ a
    ldr r1, [fp, #16]       @ b

    cmp r0, #0
    beq retZ                 @ a == 0: return 0
    cmp r1, #0
    beq retZ                 @ b == 0: return 0
    cmp r0, r1
    beq retA                 @ a == b: return a
    bgt retP1                @ a > b: recurse(a-b, b)

    @ a < b: recurse(a, b-a)
    sub r1, r1, r0
    stmfd sp!, {r0, r1}
    sub sp, sp, #4
    bl pgcd
    ldmfd sp!, {r0}
    add sp, sp, #8
    str r0, [fp, #8]
    b fin
```

---

## 6.8 Tableaux et structures

### Acces aux tableaux

Pour un tableau de mots (4 octets chacun) :
```arm
@ Adresse de arr[i] = base + i * 4
ldr r0, =array              @ r0 = adresse de base
mov r1, #3                   @ i = 3
ldr r2, [r0, r1, lsl #2]    @ r2 = array[3]  (r0 + 3*4)
```

Pour un tableau d'octets :
```arm
ldr r0, =string
mov r1, #5
ldrb r2, [r0, r1]           @ r2 = string[5] (pas de mise a l'echelle)
```

### Patron de post-increment (parcours de tableau)

```arm
@ Parcourir le tableau, charger chaque element
ldr r1, =T                  @ r1 = adresse de base
loop:
    ldr r0, [r1], #4        @ r0 = *r1, puis r1 += 4
    @ ... traiter r0 ...
    b loop
```

### Adressage matriciel (du TP2)

Pour une matrice M[N][N] de mots stockee en ligne (row-major) :
```arm
@ Adresse de M[i][j] = base + (i*N + j) * 4
mov r9, #N
mla r9, r9, r0, r1      @ r9 = N*i + j
mov r9, r9, lsl #2       @ r9 = (N*i + j) * 4
ldr r6, =matrix
add r9, r6               @ r9 = &M[i][j]
ldr r5, [r9]             @ r5 = M[i][j]
```

### Acces aux structures (du TP3)

Definir les decalages de structure comme constantes :
```arm
.equ offset_name, 0         @ Premier champ : char* name
.equ offset_count, 4        @ Deuxieme champ : int count
.equ offset_data, 8         @ Troisieme champ : int* data

@ Acceder a un membre de structure :
ldr r1, [r0, #offset_count] @ r1 = struct_ptr->count
```

Pour un tableau de pointeurs vers des structures :
```arm
ldr r2, [r0, r3, lsl #2]    @ r2 = array[r3] (pointeur vers la structure)
ldr r4, [r2, #offset_count]  @ r4 = array[r3]->count
```

---

## 6.9 Exemples detailles

### Exemple 1 : Compter des caracteres (annale 2017, exercice 1)

Compter les occurrences de 'e' dans une chaine :

```arm
.data
  a: .space 4
  b: .asciz "Ouvroir de littérature potentielle"
.text
.global _Start
_Start:
  mov r1, #0                 @ compteur = 0
  mov r2, #0                 @ caractere courant
  ldr r0, =b                 @ r0 = adresse de la chaine
  loop:
    ldrb r2, [r0], #1        @ r2 = *r0++  (charger octet, post-increment)
    cmp r2, #'e'             @ comparer avec 'e'
    addeq r1, r1, #1         @ si egal : compteur++
    cmp r2, #0               @ verifier le terminateur null
    bne loop                  @ continuer si pas fin de chaine
  ldr r0, =a
  str r1, [r0]               @ stocker le compteur en memoire
```

**Techniques cles** : Adressage post-increment, execution conditionnelle (`addeq`), parcours de chaine terminee par null. A noter que le "e" accentue de "litterature" ne correspond pas au 'e' ASCII, donc le compte final est 5.

### Exemple 2 : Suite de Collatz (du TD)

```arm
.data
  x: .word 0x20             @ x = 32
.text
_start:
  ldr r2, =x
  ldr r0, [r2]              @ r0 = x
collatz_loop:
  cmp r0, #1
  beq collatz_done           @ arreter quand x == 1
  and r3, r0, #1            @ tester si impair (bit 0)
  cmp r3, #1
  bne collatz_even
  @ Impair : x = 3*x + 1
  mov r7, #1
  mov r6, #3
  mla r0, r0, r6, r7        @ r0 = r0*3 + 1
  b collatz_store
collatz_even:
  @ Pair : x = x / 2
  mov r0, r0, lsr #1        @ r0 = r0 >> 1
collatz_store:
  str r0, [r2]               @ sauvegarder en memoire
  b collatz_loop
collatz_done:
```

**Techniques cles** : Test de bit avec AND, MLA pour 3x+1, LSR pour la division par 2.

### Exemple 3 : Factorielle (du TD)

```arm
.set N, 12                   @ Factorielle maximale tenant sur 32 bits
.data
  i:    .word 1
  fact: .word 1
.text
_start:
  ldr r9, =N                 @ r9 = 12 (la limite)
  ldr r0, =fact
  ldr r0, [r0]               @ r0 = 1 (produit courant)
loop_condition:
  ldr r1, =i
  ldr r1, [r1]               @ r1 = i
  cmp r1, r9
  bhi loop_done               @ sortir quand i > 12
  mul r0, r0, r1              @ fact = fact * i
  add r1, r1, #1              @ i++
  ldr r8, =i
  str r1, [r8]
  b loop_condition
loop_done:
  ldr r9, =fact
  str r0, [r9]                @ stocker le resultat final
```

**Remarque** : 12! = 479001600 tient sur 32 bits. 13! = 6227020800 NE TIENT PAS.

---

## 6.10 GPIO / Raspberry Pi (du TP4)

### Entrees/sorties mappees en memoire

Sur Raspberry Pi, les registres materiels sont accedes en lisant/ecrivant a des adresses memoire specifiques. Pas besoin d'instructions d'E/S speciales.

```arm
.set GPSEL4, 0x3f200010     @ Registre de selection de fonction GPIO 4
.set GPSET1, 0x3f200020     @ Registre de mise a 1 GPIO 1
.set GPCLR1, 0x3f20002c     @ Registre de mise a 0 GPIO 1
```

### Configurer une broche en sortie

Le GPIO 47 utilise les bits [21:19] de GPFSEL4. Mettre a 001 = mode sortie :

```arm
ldr r0, =GPSEL4
mov r1, #(1 << 21)          @ Bit 21 = 1, les autres = 0
str r1, [r0]                 @ Configurer la broche 47 en sortie
```

### Commander la LED

```arm
@ Allumer : ecrire 1 au bit 15 de GPSET1
ldr r0, =GPSET1
mov r1, #(1 << 15)          @ Broche 47 = bit 15 dans le banc 1
str r1, [r0]

@ Eteindre : ecrire 1 au bit 15 de GPCLR1
ldr r0, =GPCLR1
mov r1, #(1 << 15)
str r1, [r0]
```

### Considerations pour le bare metal

- Pas d'OS, pas d'initialisation de pile (utiliser les registres pour sauvegarder/restaurer)
- Pas de printf -- observer les LED ou utiliser un debogueur materiel
- Edition de liens a 0x8000 (`-Ttext=0x8000`) -- adresse de demarrage du Raspberry Pi
- Boucles d'attente active pour la temporisation (pas de timer configure)

---

## 6.11 Pieges courants

1. **Oublier de sauvegarder LR** : Si votre fonction appelle une autre fonction (BL), LR est ecrase. Toujours faire STMFD {lr} avant BL si vous devez retourner.

2. **Desalignement de pile** : Chaque STMFD doit avoir un LDMFD correspondant. Chaque SUB sp doit avoir un ADD sp correspondant. Les paires non appariees corrompent la pile.

3. **Erreurs de calcul de decalage** : Dessiner le cadre de pile et compter les octets. Rappel : LR est a fp+4, FP est a fp+0, la valeur de retour a fp+8, le premier parametre a fp+12 (avec la convention standard).

4. **LDRB vs LDR** : Utiliser LDRB pour les caracteres/octets individuels, LDR pour les mots de 32 bits. Utiliser LDR sur un tableau d'octets lit 4 octets d'un coup, donnant des resultats errones.

5. **Indexation avec mise a l'echelle** : Pour les tableaux de mots, utiliser `lsl #2` pour multiplier l'index par 4. Pour les tableaux d'octets, pas de mise a l'echelle. Oublier la mise a l'echelle lit de mauvais elements.

6. **Piege de l'execution conditionnelle** : `ADDEQ` ne fait rien si le drapeau Z n'est pas active. S'assurer que CMP est execute immediatement avant l'instruction conditionnelle -- d'autres instructions entre CMP et l'instruction conditionnelle peuvent modifier les drapeaux.

7. **Oublier .align** : Apres des donnees `.ascii` ou `.byte`, les donnees/code suivants peuvent etre desalignes. Toujours utiliser `.align` apres des donnees d'octets/chaines.

8. **Restriction de MUL sur la destination** : Sur certaines variantes ARM, `MUL rd, rm, rs` requiert rd != rm. Utiliser un registre different comme destination en cas de doute.

---

## AIDE-MEMOIRE -- Assembleur ARM

```
REGISTRES :
  r0-r3 :  Arguments / Retour / Travail (sauvegardes par l'appelant)
  r4-r10 : Usage general (sauvegardes par l'appele)
  r11/fp : Pointeur de cadre (Frame Pointer)
  r13/sp : Pointeur de pile (Full Descending)
  r14/lr : Registre de lien (adresse de retour)
  r15/pc : Compteur de programme

CHARGEMENT DEPUIS LA MEMOIRE (PATRON EN DEUX ETAPES) :
  ldr r0, =variable     @ r0 = ADRESSE
  ldr r0, [r0]          @ r0 = VALEUR

MODELE D'APPEL DE FONCTION :
  Appelant :                 Appele :
    stmfd sp!, {args}          stmfd sp!, {lr}
    sub sp, sp, #4             stmfd sp!, {fp}
    bl function                mov fp, sp
    ldmfd sp!, {result}        sub sp, sp, #locals
    add sp, sp, #args_size     stmfd sp!, {regs}
                               @ ... corps ...
                               ldmfd sp!, {regs}
                               add sp, sp, #locals
                               ldmfd sp!, {fp}
                               ldmfd sp!, {lr}
                               bx lr

DECALAGES DU CADRE DE PILE :
  [fp, #0]  = FP sauvegarde
  [fp, #4]  = LR sauvegarde
  [fp, #8]  = valeur de retour (ou 1er param.)
  [fp, #12] = 1er param. (ou 2eme param.)
  [fp, #-4] = 1ere variable locale

ACCES AUX TABLEAUX :
  Tableau de mots :  ldr r0, [base, index, lsl #2]   @ base + index*4
  Tableau d'octets : ldrb r0, [base, index]           @ base + index

ACCES MATRICIEL : M[i][j] ou M est NxN de mots
  offset = (i*N + j) * 4
  mla r0, N_reg, i_reg, j_reg    @ r0 = N*i + j
  ldr r1, [base, r0, lsl #2]     @ r1 = M[i][j]

CODES DE CONDITION :
  EQ (Z=1)   NE (Z=0)   GT (N=V,Z=0)   LT (N!=V)
  GE (N=V)   LE (Z=1|N!=V)
  HI (C=1,Z=0)  HS/CS (C=1)  LO/CC (C=0)  LS (C=0|Z=1)

INSTRUCTIONS CLES :
  MLA rd, rm, rs, rn    @ rd = rm*rs + rn
  RSB rd, rn, op2       @ rd = op2 - rn (soustraction inverse)
  LSL #n                @ decalage gauche de n (multiplication par 2^n)
  LSR #n                @ decalage droite de n (division par 2^n)
```
