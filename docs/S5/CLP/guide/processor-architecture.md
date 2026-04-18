---
title: "Chapitre 3 -- Architecture processeur"
sidebar_position: 6
---

# Chapitre 3 -- Architecture processeur

## 3.1 Presentation

Un processeur se decompose en deux unites principales :

- **UT (Unite de Traitement / Chemin de donnees)** : Contient les registres, l'UAL, les bus, et effectue les calculs
- **UC (Unite de Commande)** : Genere les signaux de commande pour orchestrer l'UT en fonction de l'instruction courante et des conditions

```
                +------------------+
   Entrees ---->|                  |----> Sorties
                |   UT (Donnees)   |
                |                  |
                +--------+---------+
                         |
              conditions |  commandes
                         |
                +--------+---------+
                |                  |
                |  UC (Commande)   |
                |                  |
                +------------------+
```

L'UC envoie des **commandes** (signaux de controle) a l'UT. L'UT envoie des **conditions** (drapeaux d'etat) en retour a l'UC. Cette separation est le fondement de toute conception de processeur.

---

## 3.2 Unite de Traitement (UT / Chemin de donnees)

### Composants

| Composant | Role | Exemple |
|-----------|------|---------|
| Registres | Stocker des valeurs de donnees | N0, N1, Q, N dans la machine de Fibonacci |
| UAL | Arithmetique et logique | Additionneur, comparateur |
| Bus | Transferer des donnees entre composants | Bus de donnees interne |
| Tampons trois-etats | Controler l'acces au bus | Activer/desactiver les sorties sur un bus partage |
| Multiplexeurs | Selectionner les sources de donnees | Choisir quel registre alimente l'entree de l'UAL |

### Operations sur les registres

Chaque registre possede des signaux de commande :
- **Load (LD)** : Quand actif, le registre capture la valeur du bus au prochain front d'horloge
- **Output Enable (OE)** : Quand actif, le registre place sa valeur sur le bus

### Operations de l'UAL

L'UAL effectue des operations selectionnees par des signaux de commande :
- Addition, soustraction
- ET, OU, XOR, NON
- Decalage a gauche, decalage a droite
- Comparaison (genere des drapeaux de condition)

### Drapeaux de condition

L'UT genere des drapeaux envoyes a l'UC :

| Drapeau | Nom | Signification |
|---------|-----|---------------|
| Z | Zero | Le resultat est nul |
| N | Negatif | Le resultat est negatif (MSB = 1) |
| C | Retenue (Carry) | Debordement non signe |
| V | Debordement (oVerflow) | Debordement signe |

---

## 3.3 Unite de Commande (UC)

L'UC est elle-meme une machine a etats finis. Elle peut etre implementee de deux facons :

### 1. Commande cablee (microprogrammation horizontale)

L'UC est construite directement a partir de logique combinatoire et sequentielle. Depuis le circuit Logisim 7-memory-horizontal :

- Chaque etat est encode avec des bascules
- La logique de transition est implementee avec des portes
- Rapide mais inflexible -- les modifications necessitent un recablage

### 2. Commande microprogrammee (microprogrammation verticale)

L'UC utilise une ROM (memoire morte) pour stocker les microinstructions. Depuis le circuit Logisim 8-memory-vertical :

- Chaque adresse de la ROM correspond a un etat
- Le contenu de la ROM definit les signaux de commande et l'information d'etat suivant
- Flexible -- changer le comportement en reprogrammant la ROM
- Legerement plus lent en raison du temps d'acces a la ROM

### Sequenceur

Le sequenceur controle le flux des etats dans l'UC. D'apres l'exercice du TD5 :

Composants :
- **Compteur** : Contient l'etat courant (adresse)
- **ROM** : Stocke le microcode (commandes + cibles de saut)
- **Multiplexeur** : Selectionne la condition a evaluer
- **Logique de saut** : Decide s'il faut incrementer le compteur ou charger une nouvelle adresse

**Fonctionnement a chaque cycle d'horloge** :
1. Le compteur fournit l'adresse courante a la ROM
2. La ROM produit : bits de commande + code de saut + adresse de saut
3. Le code de saut selectionne via le MUX quelle condition verifier
4. Si la condition est vraie : charger l'adresse de saut dans le compteur
5. Si la condition est fausse : incrementer le compteur

---

## 3.4 Conception du microcode (d'apres le TD5 -- Machine de Fibonacci)

### Probleme

Concevoir un circuit qui calcule les nombres de Fibonacci F(n).

**Algorithme** :
```
while not init:
    N0 = 0; N1 = 1; N = input; Q = 0; Res = 0
while N > Q:
    N1 = N0 + N1; N0 = N1; Q = Q + 1   (simultane)
while init:
    Res = 1; display N0
Res = 0
```

### Conception de l'UT

Registres et commandes :
- R_N0 (registre 8 bits pour N0)
- R_N1 (registre 8 bits pour N1)
- R_N (registre 8 bits pour N, l'indice cible)
- Compteur Q (compteur 8 bits avec increment)
- Verrou Res (bascule JK pour le drapeau de resultat)

Commandes envoyees par l'UC :
- RESET : Initialiser tous les registres (N0=0, N1=1, N=entree, Q=0)
- N1_2_N0 : Charger la valeur de N1 dans N0
- SUM_N1 : Charger N0+N1 dans N1
- INC_Q : Incrementer le compteur Q
- RES_0 : Remettre Res a 0
- RES_1 : Mettre Res a 1
- OUT_N0 : Placer N0 sur le bus de sortie

Conditions envoyees a l'UC :
- init : Signal d'initialisation de l'utilisateur
- N_GT_Q : Sortie du comparateur (N > Q)

### Conception de l'UC (machine a etats)

| Etat | Nom | Action | Etat suivant |
|------|-----|--------|--------------|
| 0 (A) | Attente init | RESET, RES_0 | Si init : rester. Sinon : aller a 1 |
| 1 (B) | Verif. boucle | (rien) | Si N <= Q : aller a 3. Sinon : aller a 2 |
| 2 (C) | Iterer | N1_2_N0, SUM_N1, INC_Q | Aller a 1 |
| 3 (D) | Afficher | RES_1, OUT_N0 | Si init : rester. Sinon : aller a 4 |
| 4 (E) | Reset resultat | RES_0 | Aller a 0 |

### Encodage du microcode

Chaque mot de microinstruction (13 bits) :

```
[Jump Code (3 bits)] [Jump Address (3 bits)] [Commands (7 bits)]

Commands: N1_2_N0 | SUM_N1 | INC_Q | RES_0 | RES_1 | OUT_N0 | RESET

State A: 001 000 0001001    -- jump code 1 (test init), addr 0, RESET+RES_0
State B: 010 011 0000000    -- jump code 2 (test /N_GT_Q), addr 3, pas de commande
State C: 111 001 1110000    -- jump code 7 (inconditionnel), addr 1, N1_2_N0+SUM_N1+INC_Q
State D: 001 011 0000110    -- jump code 1 (test init), addr 3, RES_1+OUT_N0
State E: 111 000 0001000    -- jump code 7 (inconditionnel), addr 0, RES_0
```

### Entrees du MUX du sequenceur

| Code de saut | Condition selectionnee |
|--------------|------------------------|
| 0 | Toujours 0 (increment inconditionnel) |
| 1 | init |
| 2 | /N_GT_Q |
| 7 | Toujours 1 (saut inconditionnel) |

---

## 3.5 Architecture de la machine PGCD

La machine PGCD est un exemple cle du cours qui integre UC et UT. Voir le chapitre dedie [pgcd-arithmetic.md](/S5/CLP/guide/pgcd-arithmetic) pour le traitement complet.

**Resume rapide de l'architecture** :
- L'UT contient les registres A et B, un soustracteur, et un comparateur
- L'UC implemente l'algorithme d'Euclide sous forme de machine a etats
- L'integration utilise les conditions A>B, A=B, A<B pour commander la soustraction

---

## 3.6 Hierarchie memoire

### Banc de registres

Stockage le plus rapide. Directement a l'interieur du processeur. En ARM : 16 registres (r0-r15).

### Cache

Petite memoire rapide entre le processeur et la memoire principale. Exploite :
- **Localite temporelle** : Les donnees recemment accedees seront probablement accedees a nouveau
- **Localite spatiale** : Les donnees proches de donnees recemment accedees seront probablement accedees

### Memoire principale (RAM)

Plus grande, plus lente. Stocke le programme et les donnees pendant l'execution.

### ROM (Memoire morte)

Non volatile. Utilisee pour :
- Le stockage du microcode dans l'UC
- Le firmware de demarrage
- Les tables de consultation dans les circuits combinatoires

---

## 3.7 Pieges courants

1. **Confondre UC et UT** : L'UC controle, l'UT calcule. L'UC ne fait jamais d'arithmetique sur les donnees -- elle ne fait que sequencer les operations.

2. **Conditions manquantes** : L'UC a besoin des conditions de l'UT pour prendre des decisions. Si vous oubliez de ramener un resultat de comparaison vers l'UC, la machine ne peut pas brancher.

3. **Operations simultanees** : En materiel, les operations connectees a des registres differents peuvent se produire dans le meme cycle d'horloge (contrairement au code sequentiel). La machine de Fibonacci exploite cela : N0=N1 et N1=N0+N1 se produisent simultanement.

4. **Largeur du mot de microcode** : Chaque bit du mot de microcode a une signification precise. Se tromper dans l'ordre des bits revient a envoyer de mauvaises commandes a l'UT.

5. **Conflits de bus** : Ne jamais activer deux sorties sur le meme bus simultanement. Utiliser des tampons trois-etats avec des signaux d'activation mutuellement exclusifs.

6. **Nombre d'etats** : Le nombre d'etats du microcode N'EST PAS egal au nombre d'etapes de l'algorithme de haut niveau. Il peut falloir des etats supplementaires pour l'initialisation, la verification de conditions et le nettoyage.

---

## AIDE-MEMOIRE -- Architecture processeur

```
DECOMPOSITION EN DEUX UNITES :
  UT (Donnees) :   registres + UAL + bus + MUX
  UC (Commande) :  MEF qui genere les signaux de controle

UC -> UT :  commandes (charger registre, activer sortie, selectionner op. UAL)
UT -> UC :  conditions (zero, retenue, debordement, resultats de comparaison)

STYLES D'IMPLEMENTATION DE L'UC :
  Cablee :           Portes + bascules, rapide, inflexible
  Microprogrammee :  ROM + compteur + MUX, flexible, legerement plus lente

FONCTIONNEMENT DU SEQUENCEUR (a chaque cycle d'horloge) :
  1. Compteur -> adresse ROM
  2. ROM produit : commandes + code_saut + adresse_saut
  3. code_saut -> MUX selectionne la condition
  4. Si condition vraie : compteur <- adresse_saut (chargement)
  5. Si condition fausse : compteur <- compteur + 1 (increment)

FORMAT DU MOT DE MICROCODE :
  [Code de saut] [Adresse de saut] [Bits de commande]
  Code de saut : selectionne quelle condition (via MUX)
  Adresse de saut : ou sauter si condition verifiee
  Bits de commande : un bit par signal de controle vers l'UT

ETATS DE LA MACHINE DE FIBONACCI :
  A: Initialiser    B: Verifier N>Q    C: Iterer
  D: Afficher       E: Reset resultat

DRAPEAUX DE CONDITION (sortie UAL) :
  Z (Zero)      N (Negatif)    C (Retenue)    V (Debordement)

METHODOLOGIE DE CONCEPTION :
  1. Ecrire l'algorithme en pseudocode
  2. Identifier registres, operations, conditions
  3. Concevoir l'UT (registres + UAL + bus)
  4. Concevoir la machine a etats de l'UC
  5. Definir signaux de commande et conditions
  6. Encoder le microcode dans la ROM
  7. Construire le sequenceur (compteur + MUX + ROM)
  8. Integrer UC + UT
```
