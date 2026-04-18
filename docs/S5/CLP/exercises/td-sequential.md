---
title: "Corrections de TD -- Logique sequentielle : solutions detaillees"
sidebar_position: 4
---

# Corrections de TD -- Logique sequentielle : solutions detaillees

## TD 3 -- Bascules, machines a etats (Moore/Mealy)

### Exercice 1 : Conversions de bascules

Les types fondamentaux de bascules ont les equations caracteristiques suivantes :

| Type | Equation | Comportement |
|------|----------|--------------|
| D | Q(t+1) = D | La sortie suit l'entree |
| T | Q(t+1) = T XOR Q | Bascule quand T=1, maintien quand T=0 |
| JK | Q(t+1) = J./Q + /K.Q | Mise a 1 quand J=1, remise a 0 quand K=1, basculement quand J=K=1 |
| RS | Q(t+1) = S + /R.Q | Mise a 1 quand S=1, remise a 0 quand R=1 (S=R=1 interdit) |

**1a) Construire RS a partir d'une bascule D**

On cherche D tel que la bascule D se comporte comme RS.

Comportement RS :
| S | R | Q(t+1) |
|---|---|--------|
| 0 | 0 | Q (maintien) |
| 0 | 1 | 0 (remise a zero) |
| 1 | 0 | 1 (mise a un) |
| 1 | 1 | indefini |

```
D = S + /R . Q
```

**Verification** :
- S=0, R=0 : D = 0 + 1.Q = Q (maintien)
- S=0, R=1 : D = 0 + 0.Q = 0 (remise a zero)
- S=1, R=0 : D = 1 + 1.Q = 1 (mise a un)

**1a) Construire JK a partir d'une bascule D**

Equation caracteristique JK : Q(t+1) = J./Q + /K.Q

```
D = J./Q + /K.Q
```

**Circuit** : Deux portes ET (J avec /Q, /K avec Q) alimentant une porte OU vers D.

**1b) Construire D a partir d'une bascule T**

T bascule quand T=1. On veut Q(t+1) = D.

Quand D != Q, il faut basculer (T=1). Quand D == Q, maintenir (T=0).

```
T = D XOR Q
```

**Verification** :
- D=0, Q=0 : T = 0 XOR 0 = 0 (maintien a 0)
- D=0, Q=1 : T = 0 XOR 1 = 1 (bascule de 1 a 0)
- D=1, Q=0 : T = 1 XOR 0 = 1 (bascule de 0 a 1)
- D=1, Q=1 : T = 1 XOR 1 = 0 (maintien a 1)

**1c) Construire D a partir de JK**

Fixer J et K pour que Q suive D :
```
J = D,  K = /D
```

| D | J | K | Action | Q(t+1) |
|---|---|---|--------|--------|
| 0 | 0 | 1 | Remise a zero | 0 = D |
| 1 | 1 | 0 | Mise a un | 1 = D |

**1c) Construire T a partir de JK**

Basculer quand T=1, maintenir quand T=0 :
```
J = T,  K = T
```

| T | J | K | Action |
|---|---|---|--------|
| 0 | 0 | 0 | Maintien |
| 1 | 1 | 1 | Basculement |

---

### Exercice 2 : Analyse d'une machine de Moore

**Description du circuit** : Deux bascules D (sorties S1, S2).
- D1 = R . S2 (entree de la bascule 1)
- D2 = R . S1 (entree de la bascule 2)
- Sorties = (S2, S1) (l'etat EST la sortie -- machine de Moore)

**Etablissement de la table d'etats** :

L'etat suivant depend de l'etat courant (S2, S1) et de l'entree R.

Quand R = 0 :
```
D1 = 0 . S2 = 0  ->  S1(t+1) = 0
D2 = 0 . S1 = 0  ->  S2(t+1) = 0
```
Pour N'IMPORTE QUEL etat courant, si R=0, l'etat suivant = (0,0).

Quand R = 1 :
```
D1 = 1 . S2 = S2  ->  S1(t+1) = S2 (current S2 becomes next S1)
D2 = 1 . S1 = S1  ->  S2(t+1) = S1 (current S1 becomes next S2)
```

**Table d'etats complete** :

| R | (S2,S1) courant | (S2,S1) suivant |
|---|------------------|--------------|
| 0 | 00 | 00 |
| 0 | 01 | 00 |
| 0 | 10 | 00 |
| 0 | 11 | 00 |
| 1 | 00 | 00 |
| 1 | 01 | 10 |
| 1 | 10 | 01 |
| 1 | 11 | 11 |

Attendons -- re-derivons. S1 correspond a la sortie de la bascule 1, S2 a la sortie de la bascule 2.

D1 = R AND S2 means: S1(t+1) = R . S2(t)
D2 = R AND S1 means: S2(t+1) = R . S1(t)

| R | S2(t) | S1(t) | S1(t+1)=R.S2 | S2(t+1)=R.S1 |
|---|-------|-------|-------------|-------------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 | 0 |
| 0 | 1 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 1 | 0 |
| 1 | 1 | 1 | 1 | 1 |

**Diagramme d'etats** :
```
          R=0         R=0         R=0
(00) <---------- (01) <---- (11) ---+
 |                                   |
 | R=1           R=1          R=1    |
 +------> (00)   (01)-->(10)  (11)--+
```

Plus precisement :
```
(00) --R=0--> (00)
(00) --R=1--> (00)
(01) --R=0--> (00)
(01) --R=1--> (10)   [S1 and S2 swap values]
(10) --R=0--> (00)
(10) --R=1--> (01)   [S1 and S2 swap values]
(11) --R=0--> (00)
(11) --R=1--> (11)
```

**Chronogramme** pour la sequence d'entree R = 0, 1, 1, 0, 1 (en partant de S1=S2=0) :

| Horloge | R | S1(t) | S2(t) | S1(t+1) | S2(t+1) |
|-------|---|-------|-------|---------|---------|
| 0 | - | 0 | 0 | - | - |
| 1 | 0 | 0 | 0 | 0 | 0 |
| 2 | 1 | 0 | 0 | 0 | 0 |
| 3 | 1 | 0 | 0 | 0 | 0 |
| 4 | 0 | 0 | 0 | 0 | 0 |
| 5 | 1 | 0 | 0 | 0 | 0 |

Cette sequence particuliere ne quitte jamais l'etat (00) car R=1 depuis (00) mene a (00). Pour atteindre d'autres etats, il faudrait d'abord etre en (01) ou (10) (par ex., en initialisant les bascules).

---

### Exercice 3 : Detecteur de front (machine de Mealy)

**Probleme** : Detecter les fronts montants (0 vers 1) et descendants (1 vers 0) sur l'entree e.
- s1 = 1 pendant exactement un cycle d'horloge apres un front montant
- s2 = 1 pendant exactement un cycle d'horloge apres un front descendant

**Approche de conception** : Il faut memoriser la valeur PRECEDENTE de e pour detecter les transitions. Une variable d'etat (1 bascule) suffit.

**Encodage des etats** : Q = valeur precedente de e.
- Etat 0 (Q=0) : l'entree precedente etait 0
- Etat 1 (Q=1) : l'entree precedente etait 1

**C'est une machine de Mealy** car les sorties (s1, s2) dependent a la fois de l'etat (Q) ET de l'entree courante (e).

**Table d'etats/sorties** :

| Q (e precedent) | e (courant) | Q(t+1) | s1 (montant) | s2 (descendant) |
|-----------------|-------------|---------|--------------|-----------------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | **1** | 0 |
| 1 | 0 | 0 | 0 | **1** |
| 1 | 1 | 1 | 0 | 0 |

**Equations d'implementation** :
```
Q(t+1) = e           (etat suivant = entree courante, utiliser une bascule D)
s1 = e . /Q           (montant : entree a 1, precedent a 0)
s2 = /e . Q           (descendant : entree a 0, precedent a 1)
```

**Circuit** : 1 bascule D + 2 portes ET.

```
e ----+----+----> D flip-flop ----> Q
      |    |                         |
      |    +--- AND (/Q) ---> s1    |
      |                              |
      +-------- AND (Q, /e) --> s2  |
               (with NOT on e)
```

**Chronogramme** pour e = 0, 0, 1, 1, 0, 1, 0 :

| Horloge | e | Q | s1 | s2 |
|-------|---|---|----|----|
| 1 | 0 | 0 | 0 | 0 |
| 2 | 0 | 0 | 0 | 0 |
| 3 | 1 | 0 | **1** | 0 |
| 4 | 1 | 1 | 0 | 0 |
| 5 | 0 | 1 | 0 | **1** |
| 6 | 1 | 0 | **1** | 0 |
| 7 | 0 | 1 | 0 | **1** |

---

### Exercice 4 : Detecteur de divisibilite par 5

**Probleme** : Les chiffres binaires arrivent MSB en premier, un par cycle d'horloge. Apres chaque bit, indiquer si le nombre recu jusqu'ici est divisible par 5.

**Idee cle** : Quand on recoit un nouveau bit b, le nouveau nombre est N_nouveau = 2 * N_ancien + b. Il suffit de suivre le reste modulo 5 (pas le nombre entier).

```
R(N_nouveau) = R(2 * N_ancien + b) = (2 * R(N_ancien) + b) mod 5
```

**5 etats** (restes 0, 1, 2, 3, 4) :

**Table de transitions** :

| Reste courant | Bit d'entree = 0 | Bit d'entree = 1 |
|---------------|-------------------|-------------------|
| 0 | (2*0+0) mod 5 = 0 | (2*0+1) mod 5 = 1 |
| 1 | (2*1+0) mod 5 = 2 | (2*1+1) mod 5 = 3 |
| 2 | (2*2+0) mod 5 = 4 | (2*2+1) mod 5 = 0 |
| 3 | (2*3+0) mod 5 = 1 | (2*3+1) mod 5 = 2 |
| 4 | (2*4+0) mod 5 = 3 | (2*4+1) mod 5 = 4 |

**Diagramme d'etats** :
```
         0            1
  +--->(0)------->(1)
  |     |          |
  | 0   |1     0   |1
  |     v          v
  +---(2)<------(3)
  |     |          |
  | 1   |0     0   |1
  |     v          v
  +---(4)------->(4)
        0           1
```

**Sortie** : Est_div = 1 quand l'etat = 0.

**Encodage des etats** (3 bits : s3, s2, s1) :
```
State 0 = 000
State 1 = 001
State 2 = 010
State 3 = 011
State 4 = 100
```

**Trace d'exemple** : Reception du binaire 1010 (decimal 10) :

| Horloge | Bit recu | Nombre forme | Reste | Divisible ? |
|---------|----------|--------------|-------|-------------|
| init | - | 0 | 0 | Oui |
| 1 | 1 | 1 | 1 | Non |
| 2 | 0 | 10 | 2 | Non |
| 3 | 1 | 101 = 5 | 0 | **Oui** |
| 4 | 0 | 1010 = 10 | 0 | **Oui** |

**Implementation** : 3 bascules D pour l'etat + logique combinatoire derivee des tableaux de Karnaugh a 4 variables (s3, s2, s1, nbre).

**Tableaux de Karnaugh pour les bits d'etat suivant** (4 entrees : s3, s2, s1, b) :

Pour s1(t+1) :
```
           s1.b
        00    01    11    10
s3.s2
  00 |  0  |  1  |  0  |  1  |
  01 |  1  |  0  |  1  |  0  |
  10 |  1  |  1  |  -  |  -  |
  11 |  -  |  -  |  -  |  -  |
```

(Les tirets sont des conditions indifferentes pour les etats 5-7 qui ne se produisent jamais.)

---

## TD 4 -- Machines a etats complexes, unites de commande

### Exercice 1 : Basculement de LED par bouton

**Probleme** : L'appui sur un bouton bascule la LED. La LED garde son etat quand le bouton est relache. Il faut gerer le rebond du bouton (maintenu enfonce pendant plusieurs cycles).

**4 etats** encodes comme (m1, m2) ou m1 = etat de la LED, m2 = bouton appuye dans l'etat precedent :

| Etat (m1,m2) | Signification |
|--------------|---------------|
| (0,0) | LED eteinte, bouton non appuye |
| (0,1) | LED eteinte, bouton appuye (anti-rebond) |
| (1,0) | LED allumee, bouton non appuye |
| (1,1) | LED allumee, bouton appuye (anti-rebond) |

**Transitions d'etats** (BP = bouton presse) :
```
(0,0) + BP=0 -> (0,0)   LED reste eteinte
(0,0) + BP=1 -> (1,1)   Bouton appuye : basculer LED ON, entrer en etat "appuye"
(0,1) + BP=0 -> (0,0)   Bouton relache : rester eteinte
(0,1) + BP=1 -> (0,1)   Bouton encore maintenu : NE PAS re-basculer
(1,0) + BP=0 -> (1,0)   LED reste allumee
(1,0) + BP=1 -> (0,1)   Bouton appuye : basculer LED OFF, entrer en etat "appuye"
(1,1) + BP=0 -> (1,0)   Bouton relache : rester allumee
(1,1) + BP=1 -> (1,1)   Bouton encore maintenu : NE PAS re-basculer
```

**Table de transitions** :

| BP | m1 | m2 | m1(t+1) | m2(t+1) |
|----|----|----|---------|---------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 | 0 |
| 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | 0 | 0 | 1 |
| 1 | 1 | 1 | 1 | 1 |

**Tableau de Karnaugh pour m1(t+1)** (entrees : BP, m1, m2) :
```
         m1.m2
       00    01    11    10
  BP
   0 |  0  |  0  |  1  |  1  |
   1 |  1  |  0  |  1  |  0  |
```

Groupes :
- /BP.m1 (cote droit, BP=0) : 2 cellules
- BP./m1./m2 (haut-gauche, BP=1) : 1 cellule
- BP.m1.m2 (bas-droite, BP=1) : 1 cellule

```
m1(t+1) = /BP.m1 + BP.(m1.m2 + /m1./m2)
         = /BP.m1 + BP.XNOR(m1, m2)
```

**Tableau de Karnaugh pour m2(t+1)** :
```
         m1.m2
       00    01    11    10
  BP
   0 |  0  |  0  |  0  |  0  |
   1 |  1  |  1  |  1  |  1  |
```

```
m2(t+1) = BP
```

Simple : m2 memorise simplement si le bouton est actuellement presse.

**Sortie** : LED = m1.

---

### Exercice 2 : Detecteur de sequence (00, 01, 00, 10)

**Probleme** : Detecter la sequence specifique (00), (01), (00), (10) sur deux lignes d'entree (e1, e2). La sortie S=1 pendant un cycle quand la sequence complete est detectee.

**4 etats** suivant la progression dans la sequence attendue :

| Etat (d2,d1) | Signification |
|--------------|---------------|
| (0,0) | Initial : attente du premier 00 |
| (0,1) | Recu 00, attente du 01 |
| (1,0) | Recu 00+01, attente du 00 |
| (1,1) | Recu 00+01+00, attente du 10 |

**Transitions cles** :

Depuis l'etat (0,0) "attente de 00" :
- Entree 00 : correspondance, aller a (0,1)
- Autre : rester en (0,0)

Depuis l'etat (0,1) "attente de 01" :
- Entree 01 : correspondance, aller a (1,0)
- Entree 00 : possible debut de nouvelle sequence, rester en (0,1)
- Autre : reinitialiser a (0,0)

Depuis l'etat (1,0) "attente de 00" :
- Entree 00 : correspondance, aller a (1,1)
- Autre : reinitialiser a (0,0)

Depuis l'etat (1,1) "attente de 10" :
- Entree 10 : CORRESPONDANCE ! Sortie S=1, reinitialiser a (0,0)
- Entree 00 : possible debut de nouvelle sequence, aller a (0,1)
- Entree 01 : correspond a l'etape 2, aller a (1,0)
- Autre : reinitialiser a (0,0)

**Equations** (derivees des tableaux de Karnaugh sur les entrees d2, d1, e1, e2) :
```
d1(t+1) = /e1 . /e2
d2(t+1) = /e1 . (/e2.d2./d1 + d1.e2)
S = d2 . d1 . e1 . /e2
```

**Verification** avec la sequence (00), (01), (00), (10) :

| Horloge | e1,e2 | d2,d1 | S | Signification |
|---------|-------|-------|---|---------------|
| 1 | 0,0 | 0,0 | 0 | Recu 00, avancer |
| 2 | 0,1 | 0,1 | 0 | Recu 01, avancer |
| 3 | 0,0 | 1,0 | 0 | Recu 00, avancer |
| 4 | 1,0 | 1,1 | **1** | Recu 10, DETECTE |
| 5 | ... | 0,0 | 0 | Reinitialisation |

---

### Exercice 4 : Unite de commande avec compteur chargeable

**Probleme** : Implementer une machine a etats a 4 etats en utilisant un compteur chargeable.

Etats : A=0, B=1, C=2, D=3

Transitions :
```
A --(/C0)--> B (increment)
A --(C0)---> A (maintien a 0, charger 0)
B --(/C1)--> D (charger 3)
B --(C1)---> C (increment)
C ----------> D (toujours incrementer)
D ----------> A (charger 0)
```

**Interface du compteur chargeable** :
- INC : quand 1, le compteur s'incremente au front d'horloge
- LOAD : quand 1, le compteur charge la valeur depuis l'entree de donnees
- DATA : valeur a charger quand LOAD=1
- Q : valeur courante du compteur (etat)

**Logique de commande** :

| Etat | Condition | INC | LOAD | DATA |
|-------|-----------|-----|------|------|
| 0 (A) | /C0 | 1 | 0 | -- |
| 0 (A) | C0 | 0 | 1 | 00 |
| 1 (B) | C1 | 1 | 0 | -- |
| 1 (B) | /C1 | 0 | 1 | 11 |
| 2 (C) | toujours | 1 | 0 | -- |
| 3 (D) | toujours | 0 | 1 | 00 |

**Equations** (utilisant les bits d'etat Q1, Q0) :
```
INC  = /Q1./Q0./C0 + /Q1.Q0.C1 + Q1./Q0
LOAD = /Q1./Q0.C0 + /Q1.Q0./C1 + Q1.Q0
DATA1 = /Q1.Q0./C1
DATA0 = /Q1.Q0./C1
```

---

## TD 5 -- Machine de Fibonacci (integration UC + UT)

### Conception microprogrammee complete

Voir [td-processor.md](/S5/CLP/exercises/td-processor) pour la correction detaillee de la conception de processeur.

**Resume** :

La machine de Fibonacci calcule F(n) en utilisant :
- UT : registres R_N0, R_N1, compteur Q, comparateur, additionneur
- UC : controleur microprogramme a 5 etats avec des mots de microcode de 13 bits
- Interface : 7 signaux de commande (UC->UT), 2 signaux de condition (UT->UC)

**Format du microcode** (13 bits par instruction) :

```
[2:0]  Jump code (3 bits): selects condition to test
[5:3]  Jump address (3 bits): target state if condition true
[12:6] Commands (7 bits): which operations to activate
```

| Etat | Mot binaire | Signification |
|------|-------------|---------------|
| A (000) | 001 000 0001001 | Si init, rester ; sinon aller a B. Activer RESET, RES_0 |
| B (001) | 010 011 0000000 | Si /N_GT_Q, aller a D ; sinon aller a C. Pas de commande |
| C (010) | 111 001 1110000 | Toujours aller a B. Activer N1_2_N0, SUM_N1, INC_Q |
| D (011) | 001 011 0000110 | Si init, rester ; sinon aller a E. Activer RES_1, OUT_N0 |
| E (100) | 111 000 0001000 | Toujours aller a A. Activer RES_0 |
