---
title: "Corrections de TD -- Logique combinatoire et numerique"
sidebar_position: 2
---

# Corrections de TD -- Logique combinatoire et numerique

> D'apres les consignes enseignants : S5/CLP/data/moodle/td/Logique/TD 1/Gonzalez/TD_01.tex, TD 2/Gonzalez/TD_02.tex

Ce fichier couvre les exercices de TD en logique combinatoire : algebre de Boole, tableaux de Karnaugh, analyse de circuits, systemes de numeration, multiplexeurs, decodeurs et conception de VU-metre.

---

## TD 1 -- Algebre de Boole, tableaux de Karnaugh, circuits combinatoires

---

### Exercice 1 : Demonstrations en algebre de Boole

**Question :** Demontrer les relations suivantes en utilisant l'algebre de Boole, puis verifier a l'aide de tables de verite.

---

#### 1a) Demontrer : NOT(A.NOT(B) + NOT(A).B) = NOT(A).NOT(B) + A.B

**Reponse :**

```
Etape 1 : Appliquer De Morgan au NOT exterieur :
  NOT(X + Y) = NOT(X) . NOT(Y)   ou X = A.NOT(B), Y = NOT(A).B

  NOT(A.NOT(B) + NOT(A).B) = NOT(A.NOT(B)) . NOT(NOT(A).B)

Etape 2 : Appliquer De Morgan a chaque NOT interieur :
  NOT(A.NOT(B)) = NOT(A) + B      (De Morgan sur ET)
  NOT(NOT(A).B) = A + NOT(B)      (De Morgan sur ET)

Etape 3 : Distribuer (developper) :
  (NOT(A) + B) . (A + NOT(B))
  = NOT(A).A + NOT(A).NOT(B) + B.A + B.NOT(B)

Etape 4 : Simplifier avec la loi du complement (X.NOT(X) = 0) :
  = 0 + NOT(A).NOT(B) + A.B + 0
  = NOT(A).NOT(B) + A.B            CQFD
```

**Interpretation :** Le membre de gauche est NOT(XOR(A,B)) = XNOR(A,B). Le resultat vaut 1 quand A et B ont la meme valeur.

**Verification par table de verite :**

| A | B | A.NOT(B) + NOT(A).B (XOR) | NOT(XOR) = XNOR | NOT(A).NOT(B) + A.B |
|---|---|---------------------------|------------------|---------------------|
| 0 | 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 |
| 1 | 0 | 1 | 0 | 0 |
| 1 | 1 | 0 | 1 | 1 |

Les colonnes 4 et 5 correspondent.

---

#### 1b) Demontrer : A.B + A.C.D + NOT(B).D = A.B + NOT(B).D

**Reponse :**

**Strategie :** Montrer que A.C.D est redondant (absorbe par les autres termes).

```
Etape 1 : Developper A.C.D par consensus sur B :
  A.C.D = A.C.D.(B + NOT(B))         (car B + NOT(B) = 1)
        = A.B.C.D + A.NOT(B).C.D

Etape 2 : Montrer que chaque partie est deja couverte :
  A.B.C.D  est couvert par  A.B      (A.B inclut TOUS les cas ou A=1, B=1)
  A.NOT(B).C.D est couvert par  NOT(B).D   (NOT(B).D inclut TOUS les cas ou B=0, D=1)

Etape 3 : Donc A.C.D n'apporte rien de nouveau :
  A.B + A.C.D + NOT(B).D = A.B + NOT(B).D    CQFD
```

**Verification par tableau de Karnaugh (4 variables : A, B, C, D) :**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  1  |  1  |  0  |
   01  |  0  |  0  |  0  |  0  |
   11  |  1  |  1  |  1  |  1  |
   10  |  0  |  1  |  1  |  0  |
```

Lecture du tableau :
- Groupe 1 : Ligne AB=11 (les 4 cellules) = A.B
- Groupe 2 : Colonne D=1 avec B=0 (lignes AB=00 et AB=10, colonnes CD=01 et CD=11) = NOT(B).D

Deux groupes couvrent tous les 1. Le terme A.C.D est deja couvert par ces groupes.

---

### Exercice 2 : Transcodeur binaire vers code de Gray

**Question :** Construire un transcodeur de binaire naturel 4 bits (A,B,C,D) vers le code de Gray (a,b,c,d). Utiliser les tableaux de Karnaugh pour simplifier les fonctions logiques de chaque sortie.

**Reponse :**

**Table de conversion :**

| Decimal | Binaire ABCD | Gray abcd |
|---------|-------------|-----------|
| 0 | 0000 | 0000 |
| 1 | 0001 | 0001 |
| 2 | 0010 | 0011 |
| 3 | 0011 | 0010 |
| 4 | 0100 | 0110 |
| 5 | 0101 | 0111 |
| 6 | 0110 | 0101 |
| 7 | 0111 | 0100 |
| 8 | 1000 | 1100 |
| 9 | 1001 | 1101 |
| 10 | 1010 | 1111 |
| 11 | 1011 | 1110 |
| 12 | 1100 | 1010 |
| 13 | 1101 | 1011 |
| 14 | 1110 | 1001 |
| 15 | 1111 | 1000 |

**Tableau de Karnaugh pour la sortie a :**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  0  |  0  |  0  |
   01  |  0  |  0  |  0  |  0  |
   11  |  1  |  1  |  1  |  1  |
   10  |  1  |  1  |  1  |  1  |
```

**a = A** (copie directe du MSB)

**Tableau de Karnaugh pour la sortie b :**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  0  |  0  |  0  |
   01  |  1  |  1  |  1  |  1  |
   11  |  0  |  0  |  0  |  0  |
   10  |  1  |  1  |  1  |  1  |
```

Deux groupes : NOT(A).B (ligne AB=01) et A.NOT(B) (ligne AB=10).
**b = NOT(A).B + A.NOT(B) = A XOR B**

**Tableau de Karnaugh pour la sortie c :**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  0  |  1  |  1  |
   01  |  1  |  1  |  0  |  0  |
   11  |  1  |  1  |  0  |  0  |
   10  |  0  |  0  |  1  |  1  |
```

**c = NOT(B).C + B.NOT(C) = B XOR C**

**Tableau de Karnaugh pour la sortie d :**

```
              CD
         00    01    11    10
   AB
   00  |  0  |  1  |  0  |  1  |
   01  |  0  |  1  |  0  |  1  |
   11  |  0  |  1  |  0  |  1  |
   10  |  0  |  1  |  0  |  1  |
```

**d = C.NOT(D) + NOT(C).D = C XOR D**

**Resume :**
```
a = A
b = A XOR B
c = B XOR C
d = C XOR D
```

**Regle generale :** Gray_bit[i] = Binary_bit[i] XOR Binary_bit[i+1], avec le MSB recopie directement.

**Circuit :** 3 portes XOR :
```
A ----+---> a
      |
B --+-XOR-> b
    |
C -+--XOR-> c
   |
D ---XOR--> d
```

---

### Exercice 3 : Analyse de circuit

**Question :** Analyser le circuit donne comportant 5 portes et simplifier l'expression de la sortie S.

**Reponse :**

Analyse porte par porte (de gauche a droite, de haut en bas) :
1. Porte 1 (ET) : entrees b, c -> sortie b.c
2. Porte 2 (ET) : entrees a, porte1 -> sortie a.b.c
3. Porte 3 (NON-ET) : entrees a, porte1 -> sortie NOT(a.b.c)
4. Porte 4 (NON-OU) : entrees porte2, d -> sortie NOT(a.b.c + d)
5. Porte 5 (NON-ET) : entrees porte4, porte3 -> S

```
S = NOT(porte4 . porte3)
  = NOT(NOT(a.b.c + d) . NOT(a.b.c))
```

**Simplification :**
```
Etape 1 : Appliquer De Morgan au NON-ET exterieur :
  S = NOT(X . Y)  ou X = NOT(a.b.c + d), Y = NOT(a.b.c)
  S = NOT(X) + NOT(Y)

Etape 2 : Double negation :
  NOT(X) = NOT(NOT(a.b.c + d)) = a.b.c + d
  NOT(Y) = NOT(NOT(a.b.c)) = a.b.c

Etape 3 : Combiner :
  S = (a.b.c + d) + a.b.c
    = a.b.c + d                    (idempotence : X + X = X)
```

**Resultat : S = a.b.c + d**

---

### Exercice 4 : Classification de transistors

**Question :** Classifier des transistors en C1 (bon), C2 (marginal), C3 (rebut) selon les parametres F (frequence), B (bande passante), G (gain), Z (impedance). X=1 si le parametre est correct.

- C1 : frequence correcte ET au moins 2 parmi {B, G, Z} corrects
- C2 : seule la frequence est fausse, OU frequence correcte avec au moins 2 autres faux
- C3 : frequence fausse ET au moins 1 autre faux

#### Question 1 : Ecrire C1, C2, C3 sous forme d'equations logiques

**Reponse :**

**C1 :** Frequence correcte et au moins 2 des 3 autres corrects :
```
C1 = F . (B.G + B.Z + G.Z)
```

**C2 :** Tout correct sauf la frequence, OU frequence correcte avec au moins 2 autres incorrects :
```
C2 = NOT(F).B.G.Z + F.(NOT(G).NOT(B) + NOT(Z).NOT(G) + NOT(Z).NOT(B))
```

**C3 :** Frequence fausse et au moins 1 autre faux :
```
C3 = NOT(F) . (NOT(G) + NOT(B) + NOT(Z))
```

#### Question 2 : Verifier a l'aide des tableaux de Karnaugh

**Reponse :**

**Tableau de Karnaugh pour C1 (lignes : FB, colonnes : GZ) :**
```
              GZ
         00    01    11    10
   FB
   00  |  0  |  0  |  0  |  0  |
   01  |  0  |  0  |  0  |  0  |
   11  |  0  |  1  |  1  |  1  |
   10  |  0  |  0  |  1  |  0  |
```

Groupes : F.B.Z (2 cellules) + F.B.G (2 cellules) + F.G.Z (2 cellules) -> **C1 = F.(B.Z + B.G + G.Z)**. Correspond.

**Tableau de Karnaugh pour C2 :**
```
              GZ
         00    01    11    10
   FB
   00  |  0  |  0  |  0  |  0  |
   01  |  0  |  0  |  1  |  0  |
   11  |  1  |  0  |  0  |  0  |
   10  |  1  |  1  |  0  |  1  |
```

Se simplifie en : **C2 = NOT(F).B.G.Z + F.(NOT(B).NOT(G) + NOT(B).NOT(Z) + NOT(G).NOT(Z))**. Correspond.

**Tableau de Karnaugh pour C3 :**
```
              GZ
         00    01    11    10
   FB
   00  |  1  |  1  |  1  |  1  |
   01  |  1  |  1  |  0  |  1  |
   11  |  0  |  0  |  0  |  0  |
   10  |  0  |  0  |  0  |  0  |
```

Se simplifie en : **C3 = NOT(F).(NOT(G) + NOT(B) + NOT(Z))**. Correspond.

#### Question 3 : Proposer des circuits avec des portes a 2, 3 ou 4 entrees

**Reponse :** Voir les fichiers de circuits Logisim (ex4-circuit.circ). Les circuits utilisent des portes ET, OU et NON pour implementer les equations ci-dessus. C1 necessite trois portes ET a 2 entrees alimentant un OU a 3 entrees, precede d'une verification de F. C3 necessite un OU a 3 entrees alimentant un ET a 2 entrees avec NOT(F).

---

### Exercice 5 : Intervalles de codage des nombres

**Question 1 :** Donner l'intervalle de codage binaire non signe pour 10, 12, 16 bits.

**Reponse :**
- 10 bits : [0, 2^10 - 1] = [0, 1023]
- 12 bits : [0, 2^12 - 1] = [0, 4095]
- 16 bits : [0, 2^16 - 1] = [0, 65535]

**Question 2 :** Avec n bits en complement a deux, quel est le plus grand entier representable ?

**Reponse :**

L'intervalle en complement a deux est [-2^(n-1), 2^(n-1) - 1].

Le plus grand entier representable est **2^(n-1) - 1**.

Exemples :
- 8 bits : [-128, 127]
- 16 bits : [-32768, 32767]
- 32 bits : [-2 147 483 648, 2 147 483 647]

---

### Exercice 6 : Precision du cap d'un navire

**Question 1 :** Combien de bits N pour representer un cap avec une precision de 1 degre ?

**Reponse :**
Il faut representer 360 valeurs distinctes (0 a 359).
```
N = ceil(log2(360)) = ceil(8.49) = 9 bits
```
Verification : 2^8 = 256 < 360 (insuffisant), 2^9 = 512 >= 360 (suffisant).

**Remarque :** La correction de l'enseignant indique 8 bits, arrondissant 360 < 512 = 2^9, mais le minimum est en fait 9 bits puisque 2^8 = 256 < 360.

**Question 2 :** Combien de bits pour une precision de 0.1 degre ?

**Reponse :**
Il faut representer 3600 valeurs distinctes (0.0 a 359.9).
```
N = ceil(log2(3600)) = ceil(11.81) = 12 bits
```
Verification : 2^11 = 2048 < 3600 (insuffisant), 2^12 = 4096 >= 3600 (suffisant).

---

### Exercice 7 : Conversion de casse ASCII

**Question :** Parmi les caracteres ASCII, on trouve des minuscules et des majuscules. Concevoir les operateurs MAJUSC (minuscule vers majuscule) et MAJMINUSC (basculer la casse).

**Reponse :**

**Observation ASCII :**

| Caractere | Decimal | Binaire |
|-----------|---------|---------|
| 'A' | 65 | 01000001 |
| 'Z' | 90 | 01011010 |
| 'a' | 97 | 01100001 |
| 'z' | 122 | 01111010 |

La seule difference : le bit 5 (valeur 32).

**Question 1 -- MAJUSC (minuscule vers majuscule) : mettre le bit 5 a zero :**
```
MAJUSC(X) = X AND 0b01011111 = X AND 0xDF
```
Exemple : 'a' AND 0xDF = 01100001 AND 01011111 = 01000001 = 'A'

**Question 2 -- MAJMINUSC (basculer la casse) : inverser le bit 5 :**
```
MAJMINUSC(X) = X XOR 0b00100000 = X XOR 0x20
```
Exemple : 'a' XOR 0x20 = 01100001 XOR 00100000 = 01000001 = 'A'
Exemple : 'A' XOR 0x20 = 01000001 XOR 00100000 = 01100001 = 'a'

**Circuit :** Entree 8 bits, le bit 5 passe a travers une porte XOR avec un signal de commande. Les 7 autres bits passent inchanges.

---

## TD 2 -- Systemes de numeration, arithmetique, MUX, decodeurs

---

### Exercice 1 : Conversions de base

**Question 1 :** Convertir les nombres binaires suivants en decimal, octal, hexadecimal.

**Reponse :**

Methode pour binaire vers decimal : somme des puissances de 2.
Exemple : 0011001 = 2^4 + 2^3 + 2^0 = 16 + 8 + 1 = 25

| Binaire | Decimal | Hexadecimal | Octal |
|---------|---------|-------------|-------|
| 0011001 | 25 | 0x19 | 31 |
| 100001 | 33 | 0x21 | 41 |
| 0101101 | 45 | 0x2D | 55 |
| 11010 | 26 | 0x1A | 32 |
| 1111111 | 127 | 0x7F | 177 |

**Raccourci binaire vers hex :** Grouper les bits par 4 depuis la droite.
- 0011001 -> 001|1001 -> 1|9 -> 0x19
- 1111111 -> 111|1111 -> 7|F -> 0x7F

**Question 2 :** Convertir les decimaux 12 et 1025 en binaire.

**Reponse :**
- 12 = 8 + 4 = 2^3 + 2^2 -> 0b1100
- 1025 = 1024 + 1 = 2^10 + 2^0 -> 0b10000000001

---

### Exercice 2 : Arithmetique en complement a deux

**Question 1 :** Representer +63 et -63 sur 8 bits (complement a deux).

**Reponse :**

+63 : 63 = 2^6 - 1 = 00111111

-63 : Procedure du complement a deux :
```
Etape 1 : Ecrire +63     = 00111111
Etape 2 : Inverser tous les bits = 11000000
Etape 3 : Ajouter 1          = 11000001
```
-63 = 11000001

**Verification :** 11000001 + 00111111 = 100000000 (9 bits ; ignorer la retenue) = 00000000. Correct.

**Alternative :** -128 + 65 = 10000000 + 01000001 = 11000001. Puisque 11000001 = -128 + 65 = -63. Correct.

**Question 2 :** Calculer 30 + (-8) en complement a deux sur 6 bits.

**Reponse :**

```
+30 = 011110
 -8 : +8 = 001000, inverser = 110111, ajouter 1 = 111000
```

```
  011110   (30)
+ 111000   (-8)
--------
 1010110
```

Ignorer la retenue (7e bit) : resultat = 010110 = 22. Correct (30 - 8 = 22).

---

### Exercice 6 : Implementation de fonction par multiplexeur

**Question :** S = 1 quand N = 0, 3, 5 ou 7 (N sur 3 bits C, B, A).
1. Ecrire la table de verite.
2. Implementer a l'aide d'un multiplexeur.
3. Combien de fonctions de M variables existent ? Quel est l'interet du multiplexeur ?

**Reponse :**

**Question 1 -- Table de verite :**

| C | B | A | N (decimal) | S |
|---|---|---|-------------|---|
| 0 | 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 2 | 0 |
| 0 | 1 | 1 | 3 | 1 |
| 1 | 0 | 0 | 4 | 0 |
| 1 | 0 | 1 | 5 | 1 |
| 1 | 1 | 0 | 6 | 0 |
| 1 | 1 | 1 | 7 | 1 |

Expression booleenne : S = NOT(A).NOT(B).NOT(C) + A.(B + C)

**Question 2 -- Avec un MUX 8 vers 1 :** Connecter C, B, A comme entrees de selection S2, S1, S0.

```
Selection  N  S    Entree MUX
  000      0  1    entree 0 -> VCC (1)
  001      1  0    entree 1 -> GND (0)
  010      2  0    entree 2 -> GND (0)
  011      3  1    entree 3 -> VCC (1)
  100      4  0    entree 4 -> GND (0)
  101      5  1    entree 5 -> VCC (1)
  110      6  0    entree 6 -> GND (0)
  111      7  1    entree 7 -> VCC (1)
```

**Question 3 :** Pour M variables, il existe exactement 2^(2^M) fonctions booleennes differentes. Un MUX 2^M vers 1 peut implementer N'IMPORTE QUELLE fonction de M variables en cablant simplement chaque entree de donnees a 0 ou 1 selon la table de verite. Cela fait des multiplexeurs des generateurs de fonctions universels -- utiles quand la fonction est complexe ou irreguliere, evitant d'avoir a concevoir un arrangement de portes specifique.

---

### Exercice 7 : Controleur de VU-metre

**Question :** Concevoir un VU-metre : entree 3 bits (v2, v1, v0) representant le niveau 0-7. Le segment LED s_k s'allume quand le niveau >= k. Pour le niveau 0, la barre est eteinte.

#### Question 1 : Methode booleenne pour un VU-metre 3 bits / 7 segments

**Reponse :**

**Table de verite pour s3 (s'allume quand niveau >= 3) :**

| v2 v1 v0 | Niveau | s3 |
|-----------|--------|----|
| 000 | 0 | 0 |
| 001 | 1 | 0 |
| 010 | 2 | 0 |
| 011 | 3 | 1 |
| 100 | 4 | 1 |
| 101 | 5 | 1 |
| 110 | 6 | 1 |
| 111 | 7 | 1 |

**Tableau de Karnaugh pour s3 :**
```
        v0
       0    1
v2v1
 00 |  0  |  0  |
 01 |  0  |  1  |
 11 |  1  |  1  |
 10 |  1  |  1  |
```

Groupes : v2 (4 cellules) + v1.v0 (2 cellules) -> **s3 = v2 + v1.v0**

**Toutes les equations des segments :**
```
s1 = v2 + v1 + v0            (niveau >= 1 : un bit quelconque a 1)
s2 = v2 + v1                 (niveau >= 2)
s3 = v2 + v1.v0              (niveau >= 3)
s4 = v2                      (niveau >= 4)
s5 = v2.(v1 + v0)            (niveau >= 5)
s6 = v2.v1                   (niveau >= 6)
s7 = v2.v1.v0                (niveau = 7 : tous les bits a 1)
```

**Avec un decodeur 3 vers 8 :** Un decodeur active exactement une ligne de sortie par valeur d'entree. Pour construire un VU-metre, faire un OU des lignes de sortie au-dessus ou au seuil :
```
s1 = D1 + D2 + D3 + D4 + D5 + D6 + D7
s3 = D3 + D4 + D5 + D6 + D7
s5 = D5 + D6 + D7
s7 = D7
```

Cette approche est plus systematique : si un segment est allume, tous les segments avant lui doivent l'etre aussi, donc les sorties du decodeur se propagent a travers des portes OU.

#### Question 2 : VU-metre 4 bits / 15 segments

**Reponse :** Meme principe avec une entree 4 bits (v3, v2, v1, v0) et 15 segments. Utiliser un decodeur 4 vers 16 et faire un OU des lignes de sortie appropriees pour chaque seuil de segment. Voir le fichier de circuit Logisim pour l'implementation.

#### Question 3 : VU-metre signe 4 bits / barre bilaterale

**Reponse :** Pour une entree signee en complement a deux sur 4 bits (intervalle -8 a +7), diviser la barre en 7 segments superieurs (positifs) et 8 segments inferieurs (negatifs). Le MSB (bit de signe) determine quelle moitie est active. Les valeurs positives allument les segments superieurs proportionnellement ; les valeurs negatives allument les segments inferieurs proportionnellement. Voir le fichier de circuit Logisim pour l'implementation.
