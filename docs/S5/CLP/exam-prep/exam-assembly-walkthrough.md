---
title: "Corrections detaillees d'annales d'assembleur"
sidebar_position: 2
---

# Corrections detaillees d'annales d'assembleur

## Annale 2017 -- Traitement de chaines

### Exercice 1 : Compter les occurrences d'un caractere

**Probleme** (reconstitue a partir du code de correction) : Compter le nombre de caracteres 'e' dans la chaine "Ouvroir de litterature potentielle". Remarque : le fichier source `Exercice1 Theo.s` utilise l'orthographe accentuee "litterature", ce qui signifie que le caractere accentue N'EST PAS compte par la comparaison ASCII.

**Code donne** (`Exercice1 Theo.s`) :

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

**Remarque sur l'encodage** : La chaine source originale contient le caractere accentue "e" dans "litterature". Puisque `LDRB` d'ARM compare les valeurs brutes d'octets, le "e" accentue (UTF-8 : 0xC3 0xA9) NE correspond PAS au 'e' ASCII (0x65). Cela affecte le compte.

### Methodologie pas a pas

**Etape 1 : Identifier les structures de donnees**
- `a` : Espace de 4 octets pour le resultat
- `b` : Chaine terminee par null

**Etape 2 : Tracer les registres**
- r0 : Pointeur parcourant la chaine
- r1 : Compteur (accumule le resultat)
- r2 : Caractere courant examine

**Etape 3 : Comprendre le patron de boucle**
C'est le patron standard de parcours de chaine :
1. Charger un octet avec post-increment (`LDRB r2, [r0], #1`)
2. Traiter le caractere (comparer avec la cible)
3. Utiliser l'execution conditionnelle pour le comptage (`ADDEQ`)
4. Verifier le terminateur null
5. Revenir en boucle

**Etape 4 : Compter le resultat**
Chaine : "Ouvroir de litterature potentielle" (remarque : le e accentue dans "litterature" N'EST PAS reconnu par `cmp r2, #'e'`)
Occurrences de 'e' : d**e**, literatur**e**, pot**e**nti**e**ll**e** = 5

**Techniques d'examen cles demontrees** :
- Adressage post-increment pour le parcours de chaines
- Execution conditionnelle (`ADDEQ`) evite les branchements
- Convention de chaine terminee par null

---

## Annale 2018 -- Structures et vecteurs

### Contexte

L'examen travaille avec des structures mathematiques :

**Droite** : ax + by + c = 0
```
Structure Droite {
    int a;       @ offset 0
    int b;       @ offset 4
    int c;       @ offset 8
}
```

**Vecteur directeur** (VectDir) : (-b, a) pour la droite ax + by + c = 0
```
Structure VectDir {
    int x;       @ offset 0
    int y;       @ offset 4
}
```

### Exercice : GenerationVectDir

**Probleme** : Etant donne un tableau de droites, calculer le vecteur directeur de chaque droite. Le vecteur directeur de ax + by + c = 0 est (-b, a).

**Donnees :**
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

**Code de correction** (version annotee de `Annale 2018 GenerationVectDir.s`) :

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

### Techniques d'examen cles

1. **Tableau de pointeurs vers des structures** : `ldr r5, [r8, r4, lsl #2]` obtient le i-eme pointeur, puis `ldr r6, [r5, #4]` dereference le champ de la structure.

2. **RSB pour la negation** : `rsb r6, r6, #0` calcule 0 - r6 = -r6. C'est la maniere standard de nier en ARM.

3. **Indexation avec echelle** : `ldr r5, [r8, r4, lsl #2]` signifie r5 = memory[r8 + r4*4]. Le `lsl #2` multiplie l'index par 4 pour des pointeurs de taille mot.

### Exercice : Test de colinearite

**Probleme** : Tester si deux vecteurs sont colineaires. Les vecteurs (x1,y1) et (x2,y2) sont colineaires si x1*y2 - y1*x2 = 0.

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

**Remarque sur le code source** : La correction originale de l'etudiant (`assembleur_2018.s`) contient un bug dans le test de colinearite : les instructions `STR` n'ont pas de suffixes conditionnels (`STREQ`/`STRNE`), donc le resultat est toujours ecrase inconditionnellement. La version presentee ci-dessus corrige cela en utilisant `STREQ` et `STRNE`. Le code source utilise aussi l'adressage indexe (`ldr r5, [r0, r4, LSL #2]`) avec un compteur de boucle pour acceder aux champs des vecteurs, plutot que l'approche plus simple par decalage direct presentee ici.

**Resultats attendus** :
- Direction D1 : (-2, 3), direction D2 : (-4, 6)
- Produit vectoriel : (-2)*6 - 3*(-4) = -12 + 12 = 0 -> Colineaires (D1 parallele a D2)

---

## Annale 2019 -- Structures et traitement de chaines

### Contexte

L'examen travaille avec des structures d'ingredients pour une recette :

```
Structure Ingredient {
    byte grammage[3];    @ offset 0: 3 bytes encoding weight (BCD-like)
    padding;             @ offset 3: alignment
    char nom[12];        @ offset 4: name string
}
```

Taille totale : 16 octets par ingredient.

**Donnees** :
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

### Exercice : CompterIngredients

**Probleme** : Compter le nombre d'ingredients dans le tableau (s'arreter a la sentinelle avec un nom vide).

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

**Technique cle** : Utiliser `LDRB` pour lire le premier octet des donnees de chaque ingredient. Pour la sentinelle (chaine vide), le premier octet est le terminateur null (0).

### Exercice : TrouverNb (extraire le nombre du grammage)

**Probleme** : Extraire le grammage sur 3 octets de l'ingredient i sous forme d'entier. Le grammage est stocke sous forme de 3 octets separes representant des chiffres (encodage de type BCD).

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

**Execution pour l'ingredient i1 (BEURRE, octets de grammage : 1, 5, 0)** :
```
j=0: nb = 0*10 + 1 = 1
j=1: nb = 1*10 + 5 = 15
j=2: nb = 15*10 + 0 = 150
Result: 150 (grams of butter)
```

---

## Strategie generale pour les examens d'assembleur

### Lecture de code (questions de comprehension)

1. **Identifier les donnees** : Lire les sections `.data` et `.bss` en premier. Comprendre quelles variables existent et leurs types.
2. **Noter les constantes** : Les definitions `.equ` et `.set` indiquent les decalages et tailles des structures.
3. **Tracer les registres** : Pour chaque instruction, noter quel registre contient quelle valeur.
4. **Dessiner la pile** : Pour les appels de fonctions, dessiner le cadre de pile au point d'entree de la fonction.

### Ecriture de code (questions de production)

1. **Commencer par le prologue** : Toujours ecrire le prologue standard d'abord (sauvegarder LR, FP, etablir FP, allouer les locales, sauvegarder les registres).
2. **Definir les decalages** : Ecrire les `.equ` pour tous les decalages de pile avant de coder le corps.
3. **Traduire ligne par ligne** : Convertir chaque ligne de pseudocode en 2 a 4 instructions ARM.
4. **Terminer par l'epilogue** : Inverser exactement le prologue (restaurer les registres, liberer les locales, restaurer FP et LR, bx lr).
5. **Verifier** : S'assurer que chaque STMFD a un LDMFD correspondant avec la meme liste de registres.

### Patrons courants a memoriser

**Parcours de chaine** :
```arm
ldr r0, =string
loop:
    ldrb r1, [r0], #1     @ load byte, advance pointer
    cmp r1, #0
    beq done
    @ ... process r1 ...
    b loop
```

**Tableau de pointeurs vers des structures** :
```arm
ldr r0, =table             @ r0 = table base
ldr r1, [r0, r2, lsl #2]   @ r1 = table[r2] (pointer)
ldr r3, [r1, #offset]       @ r3 = table[r2]->field
```

**Cadre de fonction standard** :
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

### Auto-verification avant de rendre

- [ ] Chaque fonction sauvegarde et restaure LR (si elle appelle d'autres fonctions)
- [ ] La pile est equilibree (total empile = total depile)
- [ ] Utilisation correcte de LDRB pour les octets, LDR pour les mots
- [ ] Indexation avec echelle (lsl #2) utilisee pour les tableaux de mots
- [ ] Tous les decalages de structure corrects (dessiner l'organisation de la structure)
- [ ] La boucle se termine (compteur compare correctement, direction de branchement correcte)
- [ ] Les conditions d'execution conditionnelle correspondent au CMP precedent
