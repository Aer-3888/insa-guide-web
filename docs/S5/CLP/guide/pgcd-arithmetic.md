---
title: "Chapitre 5 -- PGCD / Circuits arithmetiques"
sidebar_position: 5
---

# Chapitre 5 -- PGCD / Circuits arithmetiques

## 5.1 Presentation

La machine PGCD (Plus Grand Commun Diviseur) est l'exemple phare du cours CLP. Elle illustre le flot de conception complet : de l'algorithme au materiel, en integrant une Unite de Traitement (UT) avec une Unite de Commande (UC).

C'est le meme algorithme du PGCD qui est ensuite implemente en assembleur ARM (TP1), creant un pont puissant entre les perspectives materielle et logicielle.

---

## 5.2 L'algorithme du PGCD

### Algorithme d'Euclide par soustractions

```
function gcd(a, b):
    while a != b:
        if a > b:
            a = a - b
        else:
            b = b - a
    return a
```

**Exemple** : pgcd(24, 18)
```
Step 1: a=24, b=18  ->  a > b  ->  a = 24-18 = 6
Step 2: a=6,  b=18  ->  a < b  ->  b = 18-6  = 12
Step 3: a=6,  b=12  ->  a < b  ->  b = 12-6  = 6
Step 4: a=6,  b=6   ->  a == b ->  return 6
```

### Pourquoi cet algorithme fonctionne en materiel

La version par soustractions est preferee a la version par modulo car :
1. La soustraction est simple a implementer (juste un additionneur avec complement)
2. Pas besoin de circuit de division
3. La comparaison (a > b, a = b, a < b) produit naturellement les conditions necessaires

---

## 5.3 Conception de l'Unite de Traitement (UT)

### Depuis Logisim : `9-pgcd-ut.circ`

**Registres** :
- **Registre A** : Contient le premier operande
- **Registre B** : Contient le second operande

**Unite arithmetique** :
- **Soustracteur** : Calcule A - B (ou B - A, selon la commande)
- **Comparateur** : Produit les conditions A > B, A = B, A < B

**Signaux de commande (commandes venant de l'UC)** :
- `LOAD_A` : Charger une valeur dans le registre A
- `LOAD_B` : Charger une valeur dans le registre B
- `A_MINUS_B` : Calculer A - B et charger le resultat dans A
- `B_MINUS_A` : Calculer B - A et charger le resultat dans B
- `INIT` : Charger les valeurs initiales depuis l'entree

**Conditions (envoyees a l'UC)** :
- `A_EQ_B` : A est egal a B (l'algorithme se termine)
- `A_GT_B` : A est superieur a B (soustraire B de A)
- `A_LT_B` : A est inferieur a B (soustraire A de B)

### Schema du chemin de donnees

```
          Input A        Input B
             |              |
         +---v---+      +---v---+
         |  Reg A |      |  Reg B |
         +---+---+      +---+---+
             |              |
             +------+-------+
             |      |       |
         +---v---+  |  +---v---+
         | Sub   |  |  | Comp  |
         | A - B |  |  | A ? B |
         +---+---+  |  +---+---+
             |      |      |
     Result  |      |   A>B, A=B, A<B
             v      |      v
          (retour   |   (vers UC)
           vers     |
           Reg A    |
           ou B)    |
```

---

## 5.4 Conception de l'Unite de Commande

### Machine a etats

L'UC implemente l'algorithme sous forme de machine a etats finis :

| Etat | Nom | Action | Conditions | Etat suivant |
|------|-----|--------|------------|--------------|
| S0 | INIT | Charger A et B depuis l'entree | -- | S1 |
| S1 | COMPARE | Comparer A et B | A=B -> S4, A>B -> S2, A<B -> S3 | Depend |
| S2 | SUB_A | A = A - B | -- | S1 |
| S3 | SUB_B | B = B - A | -- | S1 |
| S4 | FIN | Sortie du resultat (A = B = PGCD) | -- | S0 ou arret |

### Diagramme d'etats

```
     +-----+
     | S0  |-----> INIT (charger A, B)
     |INIT |
     +--+--+
        |
        v
     +--+--+<---------+----------+
     | S1  |           |          |
     |COMP |           |          |
     +--+--+           |          |
     /  |  \           |          |
    /   |   \          |          |
A>B/  A=B  A<B\       |          |
  /     |     \        |          |
 v      v      v       |          |
+--+  +--+  +--+      |          |
|S2|  |S4|  |S3|      |          |
|A-B| |FIN| |B-A|     |          |
+--+  +--+  +--+      |          |
 |            |        |          |
 +------------+--------+          |
 |                                |
 +--------------------------------+
```

### Implementation cablee (`10-pgcd-uc1.circ`)

L'UC cablee utilise :
- Un registre d'etat sur 3 bits (bascules encodant les etats S0-S4)
- De la logique combinatoire calculant l'etat suivant a partir de l'etat courant + conditions
- De la logique combinatoire generant les commandes a partir de l'etat courant

### Implementation microprogrammee (`11-pgcd-uc2.circ`)

L'UC microprogrammee utilise :
- Un compteur sur 3 bits comme registre d'etat
- Une ROM stockant les mots de microcode
- Un multiplexeur selectionnant les conditions

**Format du mot de microcode** :
```
[Jump code] [Jump address] [LOAD_A] [LOAD_B] [A_MINUS_B] [B_MINUS_A] [INIT] [OUTPUT]
```

**Contenu de la ROM** (depuis `11-pgcd-uc2.mem`) :
```
v2.0 raw
c110 10001 a112 1227 1236 52f3 2cf3 10007
70
```

Chaque valeur hexadecimale encode une microinstruction. Le sequenceur les lit pour commander l'UT.

---

## 5.5 Integration (`12-pgcd-integration.circ`)

La machine PGCD complete connecte :
1. Les entrees de commande de l'UT aux sorties de commande de l'UC
2. Les sorties de condition de l'UT aux entrees de condition de l'UC
3. Les entrees externes (valeurs initiales de A et B) a l'UT
4. Le signal d'horloge a la fois a l'UC et a l'UT

**Test** : Fixer l'entree A=24, B=18. Apres execution de l'horloge, le registre de resultat doit contenir 6.

---

## 5.6 Du materiel au logiciel

Le meme algorithme du PGCD implemente en assembleur ARM (extrait du TP1) :

```arm
pgcd:
    stmfd sp!, {lr}
    stmfd sp!, {fp}
    mov fp, sp

    ldr r0, [fp, #a_off]       @ r0 = a
    ldr r1, [fp, #b_off]       @ r1 = b

    cmp r0, #0                 @ if a == 0
    beq pgcd_null
    cmp r1, #0                 @ if b == 0
    beq pgcd_null

    cmp r0, r1                 @ compare a and b
    beq pgcd_equal             @ a == b: return a
    bgt pgcd_a_gt_b            @ a > b: recurse with (a-b, b)

    @ a < b: recurse with (a, b-a)
    sub r1, r1, r0
    @ ... setup recursive call ...

pgcd_a_gt_b:
    sub r0, r0, r1
    @ ... setup recursive call ...
```

**Comparaison** :

| Aspect | Materiel (UT+UC) | Logiciel (ARM) |
|--------|-----------------|----------------|
| Soustraction | Circuit soustracteur | `SUB r0, r0, r1` |
| Comparaison | Circuit comparateur | `CMP r0, r1` |
| Branchement | Transitions d'etat de l'UC | Instructions `BEQ`, `BGT` |
| Boucle | L'UC retourne a l'etat de comparaison | Appel recursif ou branchement |
| Stockage | Registres A, B dans l'UT | Registres r0, r1 (ou pile) |

---

## 5.7 Autres exemples de circuits arithmetiques

### Additionneur modulo 4 (`1-Add-modulo4.circ`)

Un circuit qui additionne deux nombres de 2 bits modulo 4. Utilise un additionneur complet et ignore la retenue de sortie.

### Convertisseur binaire vers BCD (`binaire2bcd.circ`)

Convertit la representation binaire en Decimal Code Binaire pour l'affichage sur des afficheurs 7 segments. Utilise l'algorithme "double dabble" ou decalage-et-ajout-de-3.

### Decaleur 8 bits (`decalage-GD-CH-8bits.circ`)

Decaleur a barillet pouvant decaler une valeur de 8 bits a gauche ou a droite d'un nombre variable de positions. Utilise plusieurs couches de MUX.

---

## 5.8 Pieges courants

1. **Oublier le retour en boucle** : Apres S2 (A=A-B) ou S3 (B=B-A), la machine DOIT retourner a S1 (comparaison), et non passer a S4.

2. **Condition de terminaison** : L'algorithme se termine quand A = B, pas quand A = 0 ou B = 0. Utiliser la mauvaise condition donne des resultats incorrects pour des entrees qui ne sont pas premieres entre elles.

3. **Entrees nulles** : pgcd(0, n) = n par convention, mais l'algorithme par soustraction produit 0. Decider si votre machine gere ce cas.

4. **Alignement des adresses du microcode** : Dans la version microprogrammee, s'assurer que les adresses de la ROM correspondent aux bons etats. Un saut a l'adresse 3 doit atteindre la microinstruction de l'etat S3.

5. **Mises a jour simultanees de registres** : En materiel, les deux registres peuvent etre mis a jour dans le meme cycle d'horloge. Mais dans l'algorithme du PGCD, un seul registre change par cycle. Faire attention a ne pas ecraser accidentellement les deux.

---

## AIDE-MEMOIRE -- PGCD / Circuits arithmetiques

```
ALGORITHME DU PGCD (soustraction d'Euclide) :
  while a != b:
      if a > b: a = a - b
      else:     b = b - a
  return a

ETATS DE LA MACHINE PGCD :
  S0: INIT       -- Charger les entrees
  S1: COMPARER   -- Verifier A vs B
  S2: A = A-B    -- Quand A > B
  S3: B = B-A    -- Quand A < B
  S4: FIN        -- A = B = PGCD

COMPOSANTS DE L'UT :
  Registres : A, B
  UAL : Soustracteur (A-B), Comparateur (A?B)
  Commandes : LOAD_A, LOAD_B, A_MINUS_B, B_MINUS_A, INIT, OUTPUT
  Conditions : A_EQ_B, A_GT_B, A_LT_B

TYPES D'UC :
  Cablee :           Rapide, construite avec des portes
  Microprogrammee :  ROM + compteur + MUX

EXEMPLES DE PGCD :
  pgcd(24, 18) = 6     (24->6->6, 18->12->6)
  pgcd(666, 666) = 666  (egaux, retour immediat)
  pgcd(48, 36) = 12    (48->12->12, 36->24->12)

FICHIERS LOGISIM :
  9-pgcd-ut.circ            -- Unite de Traitement
  10-pgcd-uc1.circ          -- Unite de Commande cablee
  11-pgcd-uc2.circ + .mem   -- Unite de Commande microprogrammee
  12-pgcd-integration.circ  -- Machine complete
```
