---
title: "Corrections de TD -- Conception de processeur : solutions detaillees"
sidebar_position: 3
---

# Corrections de TD -- Conception de processeur : solutions detaillees

## Presentation

Ce fichier couvre la methodologie complete de conception de processeurs dedies, incluant la machine PGCD (cours) et la machine de Fibonacci (TD5). Le schema est toujours le meme :

1. Ecrire l'algorithme
2. Identifier les registres, operations, conditions
3. Concevoir l'UT (Unite de Traitement)
4. Concevoir l'UC (Unite de Commande)
5. Choisir l'implementation : cablee (portes) ou microprogrammee (ROM)
6. Integrer UC + UT et tester

---

## Conception de la machine PGCD (exemple du cours)

### Etape 1 : Algorithme

```
Input: A, B (integers)
Output: GCD(A, B)

INIT: load A and B from external inputs
LOOP:
    if A == B: goto DONE
    if A > B:  A = A - B
    else:      B = B - A
    goto LOOP
DONE: output A (or B, since A == B)
```

### Etape 2 : Identifier les besoins materiels

**Registres** : A (8 bits), B (8 bits)

**Operations** :
- Soustraction (A-B ou B-A)
- Comparaison (A vs B : egal, superieur, inferieur)
- Chargement depuis l'entree
- Sortie du resultat

**Conditions** (decisions que prend l'algorithme) :
- A est-il egal a B ?
- A est-il superieur a B ?

### Etape 3 : Conception de l'UT

```
                +--------+
External In --> |   A    |---+---> Subtractor ---> A (on A>B)
                +--------+   |        |
                             +---> Comparator ---> A_EQ_B (to UC)
                +--------+   |        |         --> A_GT_B (to UC)
External In --> |   B    |---+---> Subtractor ---> B (on A<B)
                +--------+
                     |
                     +---> Output
```

**Signaux de commande** (de l'UC vers l'UT) :

| Commande | Action | Active quand |
|----------|--------|--------------|
| INIT | Charger les entrees externes dans A et B | Etat d'initialisation |
| A_SUB_B | A <- A - B | A > B |
| B_SUB_A | B <- B - A | A < B |
| OUTPUT | Placer A sur le bus de sortie | Etat termine |

**Signaux de condition** (de l'UT vers l'UC) :

| Condition | Signification | Utilise pour |
|-----------|---------------|--------------|
| A_EQ_B | A egal a B | Detection de la terminaison |
| A_GT_B | A superieur a B | Choisir quelle soustraction |

### Etape 4 : L'UC comme machine a etats

**5 etats** :

| Etat | Code | Description |
|------|------|-------------|
| S0 | 000 | Initialiser : charger les entrees |
| S1 | 001 | Comparer : verifier A vs B |
| S2 | 010 | Soustraire : A = A - B |
| S3 | 011 | Soustraire : B = B - A |
| S4 | 100 | Termine : sortir le resultat |

**Diagramme d'etats** :
```
        +---> S2 (A_SUB_B) ---+
        |                      |
S0 ---> S1 ---> S4 (A_EQ_B)   |
(INIT)  ^  |                   |
        |  +---> S3 (B_SUB_A) -+
        |                      |
        +--------- <----------+
```

**Table de transitions** :

| Courant | Condition | Suivant | Commandes actives |
|---------|-----------|---------|-------------------|
| S0 | toujours | S1 | INIT |
| S1 | A_EQ_B | S4 | (aucune) |
| S1 | A_GT_B et non A_EQ_B | S2 | (aucune) |
| S1 | non A_GT_B et non A_EQ_B | S3 | (aucune) |
| S2 | toujours | S1 | A_SUB_B |
| S3 | toujours | S1 | B_SUB_A |
| S4 | toujours | S4 (ou S0) | OUTPUT |

### Etape 5 : Implementation de l'UC cablee

**3 bascules** (s2, s1, s0) encodent les 5 etats. La logique d'etat suivant est combinatoire.

**Equations d'etat suivant** (derivees de la table de transitions) :

```
s2(t+1) = s0 . /s1 . /s2 . A_EQ_B
           @ Only transition to S4 (100): from S1 (001) when A_EQ_B

s1(t+1) = s0 . /s1 . /s2 . /A_EQ_B . /A_GT_B
           @ Transition to S3 (011): from S1 when A < B
         + /s0 . s1 . /s2
           @ Stay in S2/S3 path (both go to S1, but s1 bit...)
```

En fait, derivons ces equations plus soigneusement.

**Depuis chaque etat, quel est l'etat suivant ?**

| De | Vers | Condition pour cette transition |
|------|----|------|
| 000 (S0) | 001 (S1) | toujours |
| 001 (S1) | 100 (S4) | A_EQ_B |
| 001 (S1) | 010 (S2) | A_GT_B and /A_EQ_B |
| 001 (S1) | 011 (S3) | /A_GT_B and /A_EQ_B |
| 010 (S2) | 001 (S1) | toujours |
| 011 (S3) | 001 (S1) | toujours |
| 100 (S4) | 100 (S4) | toujours (boucle) |

**Equations d'etat suivant bit par bit** :

Pour s0(t+1) = 1 quand l'etat suivant a le bit 0 a 1 (S1=001, S3=011) :
```
s0(t+1) = /s2./s1./s0                         @ S0 -> S1
         + /s2./s1.s0./A_EQ_B./A_GT_B         @ S1 -> S3
         + /s2.s1./s0                          @ S2 -> S1
         + /s2.s1.s0                           @ S3 -> S1
```

Simplification :
```
s0(t+1) = /s2./s1./s0                         @ from S0
         + /s2.s1                              @ from S2 or S3
         + /s2./s1.s0./A_EQ_B./A_GT_B         @ from S1 to S3
```

Pour s1(t+1) = 1 quand l'etat suivant a le bit 1 a 1 (S2=010, S3=011) :
```
s1(t+1) = /s2./s1.s0.A_GT_B./A_EQ_B          @ S1 -> S2
         + /s2./s1.s0./A_GT_B./A_EQ_B         @ S1 -> S3
         = /s2./s1.s0./A_EQ_B                 @ S1 -> S2 or S3
```

Pour s2(t+1) = 1 quand l'etat suivant a le bit 2 a 1 (S4=100) :
```
s2(t+1) = /s2./s1.s0.A_EQ_B                  @ S1 -> S4
         + s2./s1./s0                          @ S4 -> S4
```

**Generation des commandes** (actif haut) :
```
INIT    = /s2 . /s1 . /s0     @ State S0
A_SUB_B = /s2 . s1 . /s0      @ State S2
B_SUB_A = /s2 . s1 . s0       @ State S3
OUTPUT  = s2 . /s1 . /s0      @ State S4
```

### Etape 6 : Implementation de l'UC microprogrammee

Au lieu de portes, utiliser une ROM qui fait correspondre (etat, conditions) a (etat suivant, commandes).

**Format du mot de microcode** (12 bits) :
```
Bits [11:9]: Jump type (3 bits)
Bits [8:6]:  Jump address (3 bits)
Bits [5:3]:  Condition select (for MUX)
Bits [2:0]:  Commands (INIT, A_SUB_B, B_SUB_A, OUTPUT)
```

Alternativement, format plus simple utilisant des codes de saut :

| Code de saut | Signification |
|--------------|---------------|
| 000 | Incrementer (aller a l'adresse suivante) |
| 001 | Tester la condition, sauter si vraie |
| 010 | Tester la condition, sauter si fausse |
| 111 | Saut inconditionnel |

**Contenu de la ROM** :

| Adresse | Etat | Code de saut | Condition | Adr. saut | Commandes |
|---------|-------|-----------|-----------|-----------|----------|
| 000 | S0 | 000 (INC) | -- | -- | INIT |
| 001 | S1 | 001 (test=jump) | A_EQ_B | 100 | -- |
| 010 | S2 | 111 (always) | -- | 001 | A_SUB_B |
| 011 | S3 | 111 (always) | -- | 001 | B_SUB_A |
| 100 | S4 | 111 (always) | -- | 100 | OUTPUT |

Attendons -- S1 a un branchement a 3 voies (S2, S3, ou S4). Cela necessite un traitement special. Options :

**Option A** : Test en deux etapes a S1.
```
Address 001: Test A_EQ_B, jump to 100 if true. Else increment to 010.
Address 010: Test A_GT_B, jump to 011 if true. Else increment to 100_alt.
     (This requires re-encoding)
```

**Option B** : Re-encoder les etats pour un test sequentiel.
```
000: S0 (INIT), INC
001: S1-check-eq, test A_EQ_B, jump to 101 (S4)
002: S1-check-gt, test A_GT_B, jump to 011 (S2)
003: S3 (B_SUB_A), jump to 001
004: S2 (A_SUB_B), jump to 001   -- wait, numbering conflict
```

Utilisons un encodage plus propre :
```
000: S0, always INC                          Commands: INIT
001: test A_EQ_B, jump to 100 if true        Commands: --
002: test A_GT_B, jump to 011 if true        Commands: --
     (falls through to 011 if false -- oops)
```

**Meilleure approche** : Utiliser un format de microcode dedie ou S1 est scinde en deux etats de test :

| Adr. | Label | Test | Vrai -> | Faux -> | Commandes |
|------|-------|------|---------|----------|----------|
| 000 | S0 | -- | 001 | 001 | INIT |
| 001 | S1a | A_EQ_B? | 100 | 010 | -- |
| 010 | S1b | A_GT_B? | 011 | 100 | -- |
| 011 | S2 | -- | 001 | 001 | A_SUB_B |
| 100 | S3 | -- | 001 | 001 | B_SUB_A |
| 101 | S4 | -- | 101 | 101 | OUTPUT |

Cela rend le branchement a 3 voies explicite sous forme de deux tests a 2 voies sequentiels.

### Trace d'execution : PGCD(18, 12)

| Cycle | Etat | A | B | A_EQ_B | A_GT_B | Commande | Suivant |
|-------|-------|---|---|--------|--------|---------|------|
| 0 | S0 | 18 | 12 | 0 | 1 | INIT | S1 |
| 1 | S1 | 18 | 12 | 0 | 1 | -- | S2 |
| 2 | S2 | 6 | 12 | 0 | 0 | A_SUB_B | S1 |
| 3 | S1 | 6 | 12 | 0 | 0 | -- | S3 |
| 4 | S3 | 6 | 6 | 1 | 0 | B_SUB_A | S1 |
| 5 | S1 | 6 | 6 | 1 | 0 | -- | S4 |
| 6 | S4 | 6 | 6 | -- | -- | OUTPUT | S4 |

Resultat : A = B = 6 = PGCD(18, 12).

---

## Conception de la machine de Fibonacci (TD 5)

### Etape 1 : Algorithme

```
WAIT: while not init:
        N0 = 0, N1 = 1, N = input, Q = 0, Res = 0

COMPUTE: while N > Q:
           temp = N0
           N0 = N1        (N1_2_N0)
           N1 = temp + N1 (SUM_N1)
           Q = Q + 1      (INC_Q)

DISPLAY: while init:
           Res = 1, output N0

RESET: Res = 0, goto WAIT
```

### Etape 2 : Composants de l'UT

| Composant | Type | Largeur | Role |
|-----------|------|-------|---------|
| R_N0 | Registre | 8 bits | Valeur courante de Fibonacci (commence a 0) |
| R_N1 | Registre | 8 bits | Valeur suivante de Fibonacci (commence a 1) |
| R_N | Registre | 8 bits | Indice cible (depuis l'entree) |
| Q | Compteur | 8 bits | Nombre d'iterations courantes |
| Res | Verrou JK | 1 bit | Drapeau "resultat pret" |
| Additionneur | Combinatoire | 8 bits | Calcule N0 + N1 |
| Comp | Comparateur | 8 bits | Compare N avec Q |

**Schema bloc de l'UT** :
```
Input ---------> R_N
                  |
            Comparator <--- Q (counter)
                |                |
            N_GT_Q           INC_Q (from UC)
            (to UC)
                        
R_N0 ---+--> Adder <--- R_N1
        |      |          |
        |   SUM_N1     N1_2_N0
        |   (load N0+N1  (load N1
        |    into N1)     into N0)
        |
        +--> Output bus (when OUT_N0 active)

RESET (from UC): N0=0, N1=1, Q=0, N=input
RES_0 / RES_1 (from UC): control Res latch
```

### Etape 3 : Signaux d'interface

**Commandes** (UC vers UT) :

| # | Commande | Action |
|---|---------|--------|
| 0 | RESET | Charger les valeurs initiales : N0=0, N1=1, Q=0, N=entree |
| 1 | N1_2_N0 | Copier N1 courant dans N0 (N0 <- N1) |
| 2 | SUM_N1 | Charger la sortie de l'additionneur dans N1 (N1 <- N0 + N1) |
| 3 | INC_Q | Incrementer le compteur Q (Q <- Q + 1) |
| 4 | RES_0 | Remettre le drapeau Res a 0 |
| 5 | RES_1 | Mettre le drapeau Res a 1 |
| 6 | OUT_N0 | Placer N0 sur le bus de sortie |

**Conditions** (UT vers UC) :

| Condition | Signification |
|-----------|---------------|
| init | Signal d'initialisation externe (bouton utilisateur) |
| N_GT_Q | N > Q (sortie du comparateur) |

### Etape 4 : Machine a etats

**5 etats** :

| Etat | Code | Description | Commandes actives |
|-------|------|-------------|-----------------|
| A | 000 | Attente init ; initialiser | RESET, RES_0 |
| B | 001 | Verifier la condition de boucle | (aucune) |
| C | 010 | Executer une iteration | N1_2_N0, SUM_N1, INC_Q |
| D | 011 | Afficher le resultat | RES_1, OUT_N0 |
| E | 100 | Remettre le drapeau resultat a zero | RES_0 |

**State diagram**:
```
     /init           N_GT_Q
A <---------> A    B -------> C ----+
|                   ^               |
| init              |    always     |
+-------> B         +--------------+
          |
          | /N_GT_Q
          v
          D <--- init ---> D
          |
          | /init
          v
          E ----always----> A
```

**CRITIQUE** : Dans l'etat C, N1_2_N0 et SUM_N1 s'executent SIMULTANEMENT dans le meme cycle d'horloge. L'additionneur utilise les ANCIENNES valeurs de N0 et N1 (avant la mise a jour des registres). C'est correct car :
- L'additionneur est combinatoire : sa sortie = N0 courant + N1 courant
- Le registre N1 charge la sortie de l'additionneur au front d'horloge
- Le registre N0 charge le N1 courant au meme front d'horloge
- Les deux chargements se produisent au MEME moment (front montant de l'horloge)

### Etape 5 : Conception du sequenceur

L'UC microprogrammee utilise un sequenceur compose de :
- Un registre 3 bits (etat courant)
- Un MUX selectionnant la condition a tester
- Une ROM contenant le microcode

**Configuration du MUX** :

| Entree MUX | Valeur | Fonction |
|-----------|-------|---------|
| 0 | 0 (constante) | Force l'increment (condition toujours fausse) |
| 1 | init | Teste le signal d'initialisation |
| 2 | /N_GT_Q | Teste la condition de sortie de boucle |
| 7 | 1 (constante) | Force le saut (condition toujours vraie) |

**Interpretation du code de saut** :
- Le code selectionne quelle entree MUX utiliser
- Si la condition selectionnee est VRAIE : charger l'adresse de saut dans le registre d'etat
- Si la condition selectionnee est FAUSSE : incrementer le registre d'etat

### Etape 6 : Microcode

**Format du mot de microcode** (13 bits) :
```
Bits [2:0]:  Jump code (3 bits) - selects MUX input
Bits [5:3]:  Jump address (3 bits) - target if condition true
Bits [12:6]: Commands (7 bits) - one bit per command signal
```

**Affectation des bits de commande** (bits 12 a 6) :
```
Bit 12: N1_2_N0
Bit 11: SUM_N1
Bit 10: INC_Q
Bit 9:  (unused)
Bit 8:  RES_0
Bit 7:  RES_1
Bit 6:  OUT_N0 / RESET (combined)
```

**Contenu de la ROM** :

| Etat | Code de saut | Adr. saut | Commandes | Binaire |
|-------|-----------|-----------|----------|--------|
| A (000) | 001 (test init) | 000 (self) | RES_0=1, RESET=1 | 001 000 0001001 |
| B (001) | 010 (test /N_GT_Q) | 011 (D) | none | 010 011 0000000 |
| C (010) | 111 (always jump) | 001 (B) | N1_2_N0, SUM_N1, INC_Q | 111 001 1110000 |
| D (011) | 001 (test init) | 011 (self) | RES_1=1, OUT_N0=1 | 001 011 0000110 |
| E (100) | 111 (always jump) | 000 (A) | RES_0=1 | 111 000 0001000 |

**Fonctionnement de l'etat A** :
- Code de saut = 001 : tester l'entree MUX 1 = signal init
- Si init est VRAI : charger l'adresse de saut 000 (rester en A, continuer a reinitialiser)
- Si init est FAUX : incrementer vers l'etat B (001)
- Commandes : RESET et RES_0 s'executent a chaque cycle tant qu'on est dans l'etat A

**Fonctionnement de l'etat B** :
- Code de saut = 010 : tester l'entree MUX 2 = /N_GT_Q
- Si /N_GT_Q est VRAI (boucle terminee) : charger l'adresse de saut 011 (aller a D)
- Si /N_GT_Q est FAUX (N > Q) : incrementer vers l'etat C (010)
- Pas de commandes (juste le test de condition)

### Etape 7 : Verification -- Calcul de F(6)

F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8

| Cycle | Etat | N0 | N1 | Q | N | N_GT_Q | Commande | Suivant |
|-------|-------|----|----|---|---|--------|---------|------|
| 0 | A | 0 | 1 | 0 | 6 | - | RESET, RES_0 | A (init=1) |
| 1 | A | 0 | 1 | 0 | 6 | - | RESET, RES_0 | B (init=0) |
| 2 | B | 0 | 1 | 0 | 6 | 1 | -- | C (N>Q) |
| 3 | C | **1** | **1** | **1** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 4 | B | 1 | 1 | 1 | 6 | 1 | -- | C |
| 5 | C | **1** | **2** | **2** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 6 | B | 1 | 2 | 2 | 6 | 1 | -- | C |
| 7 | C | **2** | **3** | **3** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 8 | B | 2 | 3 | 3 | 6 | 1 | -- | C |
| 9 | C | **3** | **5** | **4** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 10 | B | 3 | 5 | 4 | 6 | 1 | -- | C |
| 11 | C | **5** | **8** | **5** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 12 | B | 5 | 8 | 5 | 6 | 1 | -- | C |
| 13 | C | **8** | **13** | **6** | 6 | - | N1_2_N0, SUM_N1, INC_Q | B |
| 14 | B | 8 | 13 | 6 | 6 | 0 | -- | D (/N_GT_Q) |
| 15 | D | 8 | 13 | 6 | 6 | - | RES_1, OUT_N0 | D (init=1) |
| ... | D | 8 | 13 | 6 | 6 | - | RES_1, OUT_N0 | E (init=0) |
| ... | E | 8 | 13 | 6 | 6 | - | RES_0 | A |

**Sortie** : N0 = **8** = F(6). Correct.

**Detail du cycle 3** (la premiere iteration) :
- Avant le cycle 3 : N0=0, N1=1
- L'additionneur calcule : 0 + 1 = 1 (combinatoire, instantane)
- Au front d'horloge : N0 <- N1 (ancienne valeur) = 1, N1 <- sortie additionneur = 1, Q <- Q+1 = 1
- Apres le cycle 3 : N0=1, N1=1, Q=1

**Detail du cycle 5** :
- Avant : N0=1, N1=1
- Additionneur : 1 + 1 = 2
- Au front : N0 <- 1 (ancien N1), N1 <- 2 (additionneur), Q <- 2
- Apres : N0=1, N1=2, Q=2

---

## Resume de la methodologie de conception

### Quand on vous donne un algorithme, suivez cette recette

1. **Ecrire le pseudocode** en separant clairement initialisation, calcul et sortie
2. **Lister toutes les variables** -- chacune devient un registre dans l'UT
3. **Lister toutes les operations arithmetiques** -- chacune devient une unite fonctionnelle (additionneur, multiplieur, comparateur)
4. **Lister toutes les decisions** -- chacune devient un signal de condition de l'UT vers l'UC
5. **Lister toutes les operations de changement d'etat** -- chacune devient un signal de commande de l'UC vers l'UT
6. **Dessiner l'UT** en connectant registres, unites fonctionnelles et bus
7. **Dessiner le diagramme d'etats** de l'UC avec les transitions etiquetees par les conditions
8. **Choisir l'implementation** :
   - Cablee : deriver les equations booleennes pour les signaux d'etat suivant et de commande
   - Microprogrammee : encoder la machine a etats dans la ROM avec codes de saut et champs de commande
9. **Verifier** en tracant l'execution avec des entrees/sorties connues

### Types de questions d'examen frequents

- "Concevoir une UT pour l'algorithme X" -- lister registres, UAL, signaux
- "Dessiner la machine a etats de l'UC" -- 3 a 7 etats typiquement
- "Ecrire le microcode pour l'etat Y" -- encoder saut + commandes
- "Tracer l'execution pour l'entree Z" -- remplir le tableau cycle par cycle
- "Que se passe-t-il si on supprime la commande W ?" -- identifier quelle iteration de Fibonacci est cassee
