---
title: "Chapitre 1 -- Logique combinatoire"
sidebar_position: 3
---

# Chapitre 1 -- Logique combinatoire

## 1.1 Fondements

Un **circuit combinatoire** est un circuit dont les sorties dependent uniquement des entrees actuelles -- il n'y a ni memoire, ni horloge, ni boucle de retour. La sortie est une fonction pure des entrees.

### Portes logiques

| Porte | Symbole | Booleenne | Table de verite (2 entrees) |
|-------|---------|-----------|---------------------------|
| ET | A . B | A AND B | 0,0->0; 0,1->0; 1,0->0; 1,1->1 |
| OU | A + B | A OR B | 0,0->0; 0,1->1; 1,0->1; 1,1->1 |
| NON | /A | NOT A | 0->1; 1->0 |
| NON-ET | /(A.B) | NOT(A AND B) | 0,0->1; 0,1->1; 1,0->1; 1,1->0 |
| NON-OU | /(A+B) | NOT(A OR B) | 0,0->1; 0,1->0; 1,0->0; 1,1->0 |
| OU-X | A (+) B | A XOR B | 0,0->0; 0,1->1; 1,0->1; 1,1->0 |
| NON-OU-X | /(A(+)B) | A XNOR B | 0,0->1; 0,1->0; 1,0->0; 1,1->1 |

**Universalite** : Les portes NON-ET et NON-OU sont chacune fonctionnellement completes -- toute fonction booleenne peut etre construite en utilisant uniquement des portes NON-ET (ou uniquement des portes NON-OU).

---

## 1.2 Algebre de Boole

### Lois fondamentales

| Loi | Forme ET | Forme OU |
|-----|----------|----------|
| Identite | A . 1 = A | A + 0 = A |
| Element nul | A . 0 = 0 | A + 1 = 1 |
| Idempotence | A . A = A | A + A = A |
| Complement | A . /A = 0 | A + /A = 1 |
| Commutativite | A . B = B . A | A + B = B + A |
| Associativite | (A.B).C = A.(B.C) | (A+B)+C = A+(B+C) |
| Distributivite | A.(B+C) = A.B+A.C | A+(B.C) = (A+B).(A+C) |
| Absorption | A.(A+B) = A | A+A.B = A |

### Lois de De Morgan

Ces lois sont essentielles et utilisees en permanence :

```
/(A . B) = /A + /B        (NON du ET = OU des NON)
/(A + B) = /A . /B        (NON du OU = ET des NON)
```

**Generalisation** : Pour n variables :
```
/(A1 . A2 . ... . An) = /A1 + /A2 + ... + /An
/(A1 + A2 + ... + An) = /A1 . /A2 . ... . /An
```

### Exemple detaille (du TD1)

**Prouver** : /(A./B + /A.B) = /A./B + A.B

**Solution avec De Morgan** :
```
/(A./B + /A.B)
= /(A./B) . /(/A.B)           -- De Morgan sur le OU
= (/A + B) . (A + /B)         -- De Morgan sur chaque ET
= /A.A + B.A + /A./B + B./B   -- Distribution
= 0 + A.B + /A./B + 0         -- Loi du complement
= /A./B + A.B                  -- CQFD
```

Ce resultat est important : la negation du XOR est le XNOR (memes valeurs = 1).

### Autre exemple (du TD1)

**Prouver** : A.B + A.C.D + /B.D = A.B + /B.D

**Strategie** : Etendre A.B pour couvrir tous les cas ou A.B est vrai quelle que soit la valeur de C et D, montrer que A.C.D est deja inclus.

```
A.B = A.B.(C+/C).(D+/D) = A.B./C./D + A.B.C./D + A.B./C.D + A.B.C.D
```

A.C.D avec A=1 se developpe en A./B.C.D + A.B.C.D. Le terme A.B.C.D est deja dans le developpement de A.B. Le terme A./B.C.D est couvert par /B.D. Donc A.C.D n'apporte rien de nouveau, et A.B + /B.D est la forme minimale.

---

## 1.3 Tables de verite et formes canoniques

### Mintermes et maxtermes

Pour n variables d'entree, il y a 2^n combinaisons d'entrees possibles.

- **Minterme** : Un terme produit (ET) ou chaque variable apparait exactement une fois (complementee ou non). Chaque minterme vaut 1 pour exactement une ligne de la table de verite.
- **Maxterme** : Un terme somme (OU) ou chaque variable apparait exactement une fois. Chaque maxterme vaut 0 pour exactement une ligne.

**Somme de mintermes (SOP)** : F = somme des mintermes ou F=1
**Produit de maxtermes (POS)** : F = produit des maxtermes ou F=0

### Exemple : S = 1 si N = 0, 3, 5 ou 7 (N code sur 3 bits C,B,A)

Du TD2 exercice 6 :

| C | B | A | S |
|---|---|---|---|
| 0 | 0 | 0 | 1 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 0 |
| 1 | 0 | 1 | 1 |
| 1 | 1 | 0 | 0 |
| 1 | 1 | 1 | 1 |

SOP = /C./B./A + /C.B.A + C./B.A + C.B.A

Simplification : S = /A./B./C + A.(B + C)

---

## 1.4 Tableaux de Karnaugh

Les tableaux de Karnaugh sont une methode visuelle de simplification des expressions booleennes. Ils fonctionnent mieux pour 2, 3 ou 4 variables.

### Regles

1. **Les cellules adjacentes different d'exactement une variable** (ordre du code de Gray)
2. **Regrouper les cellules contenant 1** en rectangles de taille 1, 2, 4, 8, 16 (puissances de 2)
3. **Les groupes peuvent s'enrouler** autour des bords du tableau
4. **Chaque groupe elimine les variables** qui changent a l'interieur
5. **Faire des groupes aussi grands que possible** pour maximiser la simplification
6. **Chaque 1 doit etre couvert** par au moins un groupe

### Tableau a 2 variables

```
      B=0   B=1
A=0 | f(0,0) | f(0,1) |
A=1 | f(1,0) | f(1,1) |
```

### Tableau a 3 variables

```
        BC=00  BC=01  BC=11  BC=10
A=0   |      |      |      |      |
A=1   |      |      |      |      |
```

Attention : l'ordre de BC est 00, 01, 11, 10 (code de Gray, PAS l'ordre binaire).

### Tableau a 4 variables

```
        CD=00  CD=01  CD=11  CD=10
AB=00 |      |      |      |      |
AB=01 |      |      |      |      |
AB=11 |      |      |      |      |
AB=10 |      |      |      |      |
```

### Exemple detaille : Transcodeur binaire vers code de Gray (du TD1)

Pour le bit de sortie b (entrees A, B, C, D) :

```
        CD=00  CD=01  CD=11  CD=10
AB=00 |  0   |  0   |  0   |  0   |
AB=01 |  1   |  1   |  1   |  1   |
AB=11 |  0   |  0   |  0   |  0   |
AB=10 |  1   |  1   |  1   |  1   |
```

Les 1 forment deux bandes horizontales. Regroupement : b = /A.B + A./B = A XOR B

Resultats complets du transcodeur :
- a = A
- b = A XOR B (= /A.B + A./B)
- c = B XOR C (= /B.C + B./C)
- d = C XOR D (= /C.D + C./D)

**Point cle** : Le code de Gray est genere en faisant un XOR entre les bits adjacents de l'entree binaire.

### Exemple detaille : Classification de transistors (du TD1)

Entrees : F (frequence), B (bande passante), G (gain), Z (impedance)

C1 = F . (B.Z + B.G + Z.G) -- frequence correcte + au moins 2 des 3 autres parametres corrects

C2 = /F.B.G.Z + F.(/B./G + /B./Z + /G./Z) -- seule la frequence est fausse, ou frequence correcte mais 2+ autres faux

C3 = /F . (/G + /B + /Z) -- frequence fausse et au moins un autre parametre faux

---

## 1.5 Blocs combinatoires de base

### Multiplexeur (MUX)

Un multiplexeur selectionne une de ses 2^n entrees en fonction de n bits de selection.

**MUX 2 vers 1** : Sortie = /S.I0 + S.I1
**MUX 4 vers 1** : Sortie = /S1./S0.I0 + /S1.S0.I1 + S1./S0.I2 + S1.S0.I3

**Propriete cle** : Un MUX 2^n vers 1 peut implementer N'IMPORTE QUELLE fonction de n+1 variables. Cela rend les multiplexeurs extremement puissants.

Du TD2 exercice 6 : Pour implementer S(C,B,A) avec un MUX, utiliser C,B comme entrees de selection et connecter A ou /A ou 0 ou 1 aux entrees de donnees selon la table de verite.

### Decodeur

Un decodeur active exactement une de ses 2^n sorties en fonction de n entrees.

**Decodeur 3 vers 8** : L'entree 101 active la ligne de sortie 5.

**Application** : Combine avec des portes OU, un decodeur peut implementer n'importe quelle fonction booleenne. Du TD2 exercice 7, un controleur de VU-metre utilise un decodeur pour activer des segments LED en fonction du niveau d'entree.

### Encodeur

L'inverse du decodeur : etant donne 2^n lignes d'entree (au plus une active), il produit le code binaire sur n bits de la ligne active.

### Additionneur

**Demi-additionneur** : Somme = A XOR B, Retenue = A AND B
**Additionneur complet** : Somme = A XOR B XOR Cin, Cout = A.B + (A XOR B).Cin
**Additionneur a propagation de retenue** : Chainer n additionneurs complets pour une addition sur n bits

Du TD2 exercice 3 : Un circuit calculant X+Y, 2X+Y ou X+2Y utilise des additionneurs avec des operations de decalage (multiplier par 2 = decalage a gauche de 1).

---

## 1.6 Systemes de numeration

### Conversions binaire, octal, hexadecimal (du TD2)

| Binaire | Decimal | Hex | Octal |
|---------|---------|-----|-------|
| 0011001 | 25 | 19 | 31 |
| 100001 | 33 | 21 | 41 |
| 0101101 | 45 | 2D | 55 |
| 11010 | 26 | 1A | 32 |
| 1111111 | 127 | 7F | 177 |

**Methode** : Pour le binaire vers decimal, sommer les puissances de 2. Pour le binaire vers hexadecimal, grouper par blocs de 4 bits depuis la droite. Pour le binaire vers octal, grouper par blocs de 3 bits.

### Complement a deux (entiers signes)

Pour n bits, l'intervalle est [-2^(n-1), 2^(n-1) - 1].

**Pour nier** un nombre en complement a deux : inverser tous les bits, ajouter 1.

**Exemple** (du TD2) : +63 sur 8 bits = 00111111. -63 = 11000001.

**Addition** (du TD2) : 30 + (-8)
```
 30 = 011110
 -8 = 111000
-----------
 22 = 010110
```

### Precision de codage (du TD1)

- Cap d'un navire avec une precision de 1 degre : il faut 360 valeurs -> ceil(log2(360)) = 9 bits
- Cap d'un navire avec une precision de 0.1 degre : il faut 3600 valeurs -> ceil(log2(3600)) = 12 bits

### Conversion de casse ASCII (du TD1)

- Minuscule vers majuscule : mettre le bit 5 a zero -> X AND 0b01011111
- Basculer la casse : inverser le bit 5 -> X XOR 0b00100000

---

## 1.7 Pieges courants

1. **Ordre des colonnes du tableau de Karnaugh** : Utiliser le code de Gray (00, 01, 11, 10), PAS l'ordre binaire (00, 01, 10, 11). Se tromper invalide tous les regroupements.

2. **Conditions indifferentes** : Si certaines combinaisons d'entrees ne peuvent pas se produire, les marquer comme "indifferent" (X) dans le tableau de Karnaugh et les grouper avec les 1 ou les 0 selon ce qui convient.

3. **Simplification incomplete** : Toujours verifier si les groupes peuvent etre agrandis. Un groupe de 2 qui pourrait etre un groupe de 4 signifie que l'expression n'est pas minimale.

4. **Erreurs de De Morgan** : L'erreur la plus courante est d'oublier de changer ET en OU (ou inversement) lors de la complementation. Toujours verifier : NON(ET) = OU(NON), NON(OU) = ET(NON).

5. **Debordement en complement a deux** : L'addition de deux nombres positifs peut donner un resultat negatif (ou inversement) si le resultat depasse l'intervalle representable.

---

## AIDE-MEMOIRE -- Logique combinatoire

```
IDENTITES DE L'ALGEBRE DE BOOLE :
  A + 0 = A          A . 1 = A
  A + 1 = 1          A . 0 = 0
  A + A = A          A . A = A
  A + /A = 1         A . /A = 0
  A + A.B = A        A.(A+B) = A        (absorption)

DE MORGAN :
  /(A.B) = /A + /B
  /(A+B) = /A . /B

XOR :
  A XOR B = A./B + /A.B
  /(A XOR B) = A.B + /A./B = XNOR

ORDRE DU TABLEAU DE KARNAUGH (4 variables) :
  Colonnes CD : 00, 01, 11, 10
  Lignes AB :   00, 01, 11, 10
  Groupes : 1, 2, 4, 8, 16 cellules (puissances de 2)
  Les groupes PEUVENT s'enrouler autour des bords

BLOCS COMBINATOIRES COURANTS :
  MUX 2 vers 1 : out = /S.I0 + S.I1
  Demi-additionneur : Somme = A XOR B, Retenue = A.B
  Additionneur complet : Somme = A XOR B XOR Cin, Cout = A.B + Cin.(A XOR B)

COMPLEMENT A DEUX (n bits) :
  Intervalle : [-2^(n-1), 2^(n-1) - 1]
  Negation : inverser tous les bits, ajouter 1
  8 bits : [-128, 127]
  16 bits : [-32768, 32767]

CONVERSION EN CODE DE GRAY :
  a = A
  b = A XOR B
  c = B XOR C
  d = C XOR D
```
