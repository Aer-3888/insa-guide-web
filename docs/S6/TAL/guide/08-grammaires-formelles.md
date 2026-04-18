---
title: "Chapitre 8 -- Grammaires Formelles et Hierarchie de Chomsky"
sidebar_position: 8
---

# Chapitre 8 -- Grammaires Formelles et Hierarchie de Chomsky

## 8.1 Definition d'une grammaire formelle

Une grammaire G = (V_N, V_T, R, S) ou :
- V_N : vocabulaire non-terminal (symboles de categories : S, NP, VP...)
- V_T : vocabulaire terminal (les mots)
- R : regles de production
- S : symbole de depart (axiome)

## 8.2 Hierarchie de Chomsky -- QUESTION CLASSIQUE EN DS

| Type | Nom | Forme des regles | Expressivite | Reconnaissance |
|------|-----|-----------------|-------------|----------------|
| 0 | Sans restriction | alpha --> beta (aucune contrainte) | Maximale | Indecidable (Turing) |
| 1 | Context-sensitive | alpha A beta --> alpha gamma beta | Haute | Exp. bornee |
| **2** | **Context-free (CFG)** | **A --> gamma** (1 NT a gauche) | **Standard en TAL** | **O(n^3) CKY** |
| 3 | Reguliere | A --> aB ou A --> a | Faible | O(n) automate fini |

### Relations d'inclusion

```
Type 3 (Regulieres) C Type 2 (CFG) C Type 1 (Context-sensitive) C Type 0 (Sans restriction)
```

Chaque type est strictement inclus dans le suivant : toute grammaire reguliere est aussi une CFG, etc.

### Ce que chaque type peut/ne peut pas faire

**Grammaires regulieres (type 3)** :
- Peuvent : reconnaitre des patterns simples (expressions regulieres)
- Ne peuvent PAS : capturer les structures recursives imbriquees (ex: parentheses equilibrees)
- Utilisation : tokenisation, patterns simples

**CFG (type 2)** :
- Peuvent : representer les structures syntaxiques de la plupart des phrases
- Ne peuvent PAS : capturer l'accord a longue distance de maniere elegante
- Utilisation : analyse syntaxique (standard en TAL)

**Context-sensitive (type 1)** :
- Peuvent : modeliser l'accord (nombre, genre)
- Plus expressives mais plus complexes a analyser
- Peu utilisees directement en TAL

## 8.3 Grammaires regulieres (Type 3)

### Definition

Regles de la forme :
- A --> aB (lineaire a droite)
- A --> a (terminaison)

### Equivalence avec les automates finis

Toute grammaire reguliere peut etre convertie en automate fini deterministe (DFA) et inversement.

### Equivalence avec les expressions regulieres

```
Grammaires regulieres <--> Automates finis <--> Expressions regulieres
```

### Limites

Ne peut pas reconnaitre :
- a^n b^n (n parentheses ouvrantes puis n fermantes)
- Les structures recursives imbriquees
- Les langages a pile

## 8.4 Grammaires hors-contexte (Type 2) -- CFG

### Definition

Regles de la forme A --> gamma, ou :
- A est un non-terminal unique (un seul symbole a gauche)
- gamma est une chaine de terminaux et non-terminaux

### Exemples de regles

```
S  --> NP VP           (phrase = syntagme nominal + syntagme verbal)
NP --> Det N           (syntagme nominal = determinant + nom)
NP --> Det N PP        (avec complement prepositionnel)
VP --> V               (verbe seul)
VP --> V NP            (verbe + objet)
VP --> V NP PP         (verbe + objet + complement)
PP --> Prep NP         (preposition + syntagme nominal)
```

### Forme Normale de Chomsky (CNF)

Toute CFG peut etre transformee en CNF :
- A --> B C (exactement deux non-terminaux)
- A --> a (exactement un terminal)

Transformations :
1. Eliminer les regles epsilon (A --> epsilon)
2. Eliminer les productions unitaires (A --> B)
3. Binariser (A --> B C D devient A --> B X, X --> C D)
4. Remplacer les terminaux dans les regles longues

### Arbres de derivation

Un arbre de derivation montre comment une phrase est generee :
```
           S
          / \
        NP    VP
       / \   / \
     Det  N  V   NP
      |   |  |  / \
     Le chat mange Det  N
                    |   |
                   la souris
```

### Ambiguite

Une grammaire est ambigue si certaines phrases ont **plusieurs arbres de derivation**.

Exemple classique : "I saw the man with the telescope" (J'ai vu l'homme avec le telescope)
- Interpretation 1 : J'ai vu l'homme EN UTILISANT le telescope
- Interpretation 2 : J'ai vu l'homme QUI AVAIT le telescope

## 8.5 PCFG (Grammaires hors-contexte probabilistes)

### Ajout des probabilites

Pour chaque non-terminal X :
```
SUM_{gamma} P(X --> gamma) = 1
```

### Probabilite d'un arbre

```
P(arbre) = PRODUIT des P(regle_i) pour chaque regle utilisee
```

### Apprentissage

A partir de treebanks (corpus annotes en arbres syntaxiques) :
```
P(A --> gamma) = C(A --> gamma) / C(A)
```

### Limites des PCFG

- Invariance positionnelle (les pronoms sont plus frequents en sujet)
- Ne tiennent pas compte des mots (seulement des POS)
- Solution : lexicalisation des grammaires

## 8.6 Grammaires de dependances

Alternative aux grammaires de constituants : relations binaires tete-dependant.

### Avantages

- Plus proches de la semantique (qui fait quoi a qui)
- Mieux adaptees aux langues a ordre libre (allemand, russe...)
- Standard : Universal Dependencies (UD)

### Contraintes

- Un seul mot depend de ROOT
- Chaque mot a exactement un arc entrant
- Pas de cycles
- Projectivite : pas d'arcs croises (pour la plupart des phrases)

## 8.7 Grammaires au-dela des CFG

### Grammaires a unification

- LFG (Lexical-Functional Grammar)
- GPSG (Generalized Phrase Structure Grammar)
- HPSG (Head-driven Phrase Structure Grammar)

Permettent de modeliser l'accord, les structures complexes.

### TAG (Tree Adjoining Grammars)

- Grammaires faiblement context-sensitive
- Operations : substitution et adjonction
- Plus expressives que les CFG, lexicalisees

---

## CHEAT SHEET -- Grammaires Formelles

```
HIERARCHIE DE CHOMSKY :
  Type 0 : Sans restriction (Turing)
  Type 1 : Context-sensitive (alpha A beta --> alpha gamma beta)
  Type 2 : CFG (A --> gamma)   <-- STANDARD EN TAL
  Type 3 : Reguliere (A --> aB ou A --> a)
  Inclusion : Type 3 C Type 2 C Type 1 C Type 0

CFG : G = (V_N, V_T, R, S)
  Un non-terminal a gauche de chaque regle

CNF (Forme Normale de Chomsky) :
  A --> B C  ou  A --> a
  Necessaire pour l'algorithme CKY

PCFG :
  P(arbre) = PRODUIT P(regle_i)
  SUM P(X --> gamma) = 1 pour chaque X
  Interet : desambiguation syntaxique

REGULIERES :
  Equivalent a automates finis et regex
  Ne peut PAS : structures recursives imbriquees (a^n b^n)

CFG :
  Peut : structures recursives, syntaxe naturelle
  Ne peut PAS (bien) : accord a distance, dependances croisees

PIEGES :
  - CFG = Type 2 de Chomsky
  - Reguliere = Type 3 (la plus faible)
  - CKY necessite CNF, pas n'importe quelle CFG
  - PCFG : PRODUIT des probabilites, pas somme
  - Une grammaire ambigue = plusieurs arbres pour une phrase
```
