---
title: "Exercices -- Calcul propositionnel"
sidebar_position: 1
---

# Exercices -- Calcul propositionnel

---

## Exercice 1 : Table de verite complete (3 variables)

### Enonce
Etablir la table de verite de : `~a \/ (b -> ((a /\ b) -> ~b))`

Identifier s'il s'agit d'une tautologie, contradiction ou contingence.

### Solution detaillee

**Etape 1 :** Identifier les variables : a, b. (2 variables = 4 lignes.)

**Etape 2 :** Identifier les sous-formules, de l'interieur vers l'exterieur :
1. `a /\ b`
2. `~b`
3. `(a /\ b) -> ~b`
4. `b -> ((a /\ b) -> ~b)`
5. `~a`
6. `~a \/ (b -> ((a /\ b) -> ~b))`

**Etape 3 :** Construire la table colonne par colonne.

| a | b | a /\ b | ~b | (a /\ b) -> ~b | b -> ((a /\ b) -> ~b) | ~a | ~a \/ (b -> ((a /\ b) -> ~b)) |
|---|---|--------|----|-----------------|------------------------|----|-------------------------------|
| F | F | F      | V  | V               | V                      | V  | **V** |
| F | V | F      | F  | V               | V                      | V  | **V** |
| V | F | F      | V  | V               | V                      | F  | **V** |
| V | V | V      | F  | F               | F                      | F  | **F** |

**Verification colonne par colonne :**

- **a /\ b :** Vrai uniquement quand a=V ET b=V. Ligne 4 seule.
- **~b :** Inverse de b. V quand b=F (lignes 1, 3), F quand b=V (lignes 2, 4).
- **(a /\ b) -> ~b :** Rappel : X -> Y est faux UNIQUEMENT quand X=V et Y=F.
  - Ligne 1 : F -> V = V (premisse fausse, implication vraie)
  - Ligne 2 : F -> F = V (premisse fausse, implication vraie)
  - Ligne 3 : F -> V = V (premisse fausse, implication vraie)
  - Ligne 4 : V -> F = **F** (seul cas ou la premisse est vraie et la conclusion fausse)
- **b -> ((a /\ b) -> ~b) :**
  - Ligne 1 : F -> V = V
  - Ligne 2 : V -> V = V
  - Ligne 3 : F -> V = V
  - Ligne 4 : V -> F = **F**
- **~a :** V quand a=F (lignes 1, 2), F quand a=V (lignes 3, 4).
- **Formule finale (~a \/ ...) :**
  - Ligne 1 : V \/ V = V
  - Ligne 2 : V \/ V = V
  - Ligne 3 : F \/ V = V
  - Ligne 4 : F \/ F = **F**

**Conclusion :** La colonne finale contient V, V, V, F. Ce n'est ni toujours V (pas tautologie) ni toujours F (pas contradiction). C'est une **contingence**.

**Valuation rendant la formule fausse :** a = V, b = V.
**Valuations rendant la formule vraie :** toutes les autres.

---

## Exercice 2 : Table de verite (3 variables, 8 lignes)

### Enonce
Etablir la table de verite complete de : `(p -> q) /\ (q -> r)`

Identifier les lignes ou la formule est vraie. Est-ce une tautologie ?

### Solution detaillee

**Etape 1 :** Variables : p, q, r. (3 variables = 2^3 = 8 lignes.)

**Etape 2 :** Sous-formules :
1. `p -> q`
2. `q -> r`
3. `(p -> q) /\ (q -> r)`

**Etape 3 :** Table complete.

| p | q | r | p -> q | q -> r | (p -> q) /\ (q -> r) |
|---|---|---|--------|--------|----------------------|
| V | V | V | V      | V      | **V** |
| V | V | F | V      | F      | **F** |
| V | F | V | F      | V      | **F** |
| V | F | F | F      | V      | **F** |
| F | V | V | V      | V      | **V** |
| F | V | F | V      | F      | **F** |
| F | F | V | V      | V      | **V** |
| F | F | F | V      | V      | **V** |

**Verification colonne par colonne :**

- **p -> q :** Faux uniquement quand p=V et q=F, soit lignes 3 et 4.
  - Ligne 1 : V -> V = V
  - Ligne 2 : V -> V = V
  - Ligne 3 : V -> F = **F**
  - Ligne 4 : V -> F = **F**
  - Ligne 5 : F -> V = V
  - Ligne 6 : F -> V = V
  - Ligne 7 : F -> F = V
  - Ligne 8 : F -> F = V
- **q -> r :** Faux uniquement quand q=V et r=F, soit lignes 2 et 6.
- **Conjonction :** Vraie uniquement quand les DEUX sont vraies.
  - Lignes vraies : 1, 5, 7, 8.

**Conclusion :** Pas une tautologie (il y a des F dans la colonne finale). La formule est vraie dans les cas ou "la chaine d'implications tient" : chaque fois que l'antecedent d'une implication est vrai, le consequent l'est aussi.

---

## Exercice 3 : Trouver des valuations (type DS)

### Enonce
Soit F = (p1 -> (p2 \/ ~p3)) /\ (p2 <-> p3).

Q1 : Trouver une valuation v telle que v(F) = 1.
Q2 : Trouver une valuation v telle que v(F) = 0.

### Solution detaillee

F est une conjonction de deux parties :
- Partie gauche : `p1 -> (p2 \/ ~p3)`
- Partie droite : `p2 <-> p3`

Pour que F soit vraie, il faut que les DEUX parties soient vraies (connecteur /\).

**Q1 -- Trouver v(F) = 1 :**

*Strategie :* Satisfaire les deux conjoncts.

Commencons par la partie droite (la plus contraignante) :
- `p2 <-> p3` est vrai quand p2 et p3 ont la MEME valeur.
- **Choix :** p2 = V, p3 = V.

Verifions la partie gauche avec ce choix :
- `p2 \/ ~p3` = V \/ ~V = V \/ F = V
- `p1 -> V` = V quel que soit p1 (car X -> V = V toujours).
- **Choix :** p1 = V (ou F, ca marche dans les deux cas).

**Verification complete :**
- v(p1) = V, v(p2) = V, v(p3) = V
- Partie gauche : V -> (V \/ F) = V -> V = V
- Partie droite : V <-> V = V
- F = V /\ V = **V**

**Q2 -- Trouver v(F) = 0 :**

*Strategie :* Rendre au moins UNE partie fausse.

Methode la plus simple : rendre la partie droite fausse.
- `p2 <-> p3` est faux quand p2 et p3 ont des valeurs DIFFERENTES.
- **Choix :** p2 = V, p3 = F.

Quel que soit p1 :
- F = ... /\ F = F

**Verification complete :**
- v(p1) = V, v(p2) = V, v(p3) = F
- Partie gauche : V -> (V \/ V) = V -> V = V
- Partie droite : V <-> F = F
- F = V /\ F = **F**

---

## Exercice 4 : Simplification par equivalences

### Enonce
Simplifier chaque formule en utilisant les equivalences logiques. Citer la loi utilisee a chaque etape.

### 4a : `~(p /\ (q -> p))`

```
~(p /\ (q -> p))
= ~(p /\ (~q \/ p))              [elimination de -> : q -> p  =  ~q \/ p]
= ~p \/ ~(~q \/ p)               [De Morgan sur /\ : ~(A /\ B) = ~A \/ ~B]
= ~p \/ (~~q /\ ~p)              [De Morgan sur \/ : ~(A \/ B) = ~A /\ ~B]
= ~p \/ (q /\ ~p)                [double negation : ~~q = q]
= ~p                              [absorption : A \/ (B /\ A) = A, avec A = ~p]
```

**Justification de l'absorption :** ~p \/ (q /\ ~p). La forme est A \/ (B /\ A) = A.
- Si ~p = V : tout est V.
- Si ~p = F : (q /\ F) = F, donc F \/ F = F = ~p.

Resultat : **~(p /\ (q -> p)) = ~p**

### 4b : `(p -> q) /\ (p -> ~q)`

```
(p -> q) /\ (p -> ~q)
= (~p \/ q) /\ (~p \/ ~q)        [elimination de -> sur les deux implications]
= ~p \/ (q /\ ~q)                [distributivite de \/ sur /\ : (A \/ B) /\ (A \/ C) = A \/ (B /\ C)]
= ~p \/ F                         [complement : q /\ ~q = F]
= ~p                              [element neutre : A \/ F = A]
```

Resultat : **(p -> q) /\ (p -> ~q) = ~p**

Interpretation : "Si p implique q ET p implique non-q, alors p doit etre faux." En effet, si p etait vrai, on aurait q et ~q, contradiction.

### 4c : `(p \/ q) /\ (~p \/ q) /\ (p \/ ~q)`

```
(p \/ q) /\ (~p \/ q) /\ (p \/ ~q)
```

**Pas 1 :** Groupons les deux premieres clauses.
```
(p \/ q) /\ (~p \/ q)
= q \/ (p /\ ~p)                  [distributivite : (A \/ B) /\ (C \/ B) = B \/ (A /\ C)]
= q \/ F                          [complement : p /\ ~p = F]
= q                               [element neutre : A \/ F = A]
```

**Pas 2 :** Le resultat est maintenant q /\ (p \/ ~q).
```
q /\ (p \/ ~q)
= (q /\ p) \/ (q /\ ~q)          [distributivite de /\ sur \/]
= (q /\ p) \/ F                   [complement : q /\ ~q = F]
= q /\ p                          [element neutre]
= p /\ q                          [commutativite]
```

Resultat : **(p \/ q) /\ (~p \/ q) /\ (p \/ ~q) = p /\ q**

---

## Exercice 5 : Verifier une tautologie par table de verite

### Enonce
Montrer que le syllogisme hypothetique est une tautologie :
`((p -> q) /\ (q -> r)) -> (p -> r)`

### Solution detaillee

**Variables :** p, q, r (3 variables = 8 lignes).

**Sous-formules :**
1. `p -> q`
2. `q -> r`
3. `(p -> q) /\ (q -> r)` (antecedent)
4. `p -> r` (consequent)
5. Formule complete (implication principale)

| p | q | r | p->q | q->r | (p->q)/\(q->r) | p->r | Formule |
|---|---|---|------|------|----------------|------|---------|
| V | V | V | V    | V    | V              | V    | **V** |
| V | V | F | V    | F    | F              | F    | **V** |
| V | F | V | F    | V    | F              | V    | **V** |
| V | F | F | F    | V    | F              | F    | **V** |
| F | V | V | V    | V    | V              | V    | **V** |
| F | V | F | V    | F    | F              | V    | **V** |
| F | F | V | V    | V    | V              | V    | **V** |
| F | F | F | V    | V    | V              | V    | **V** |

**Verification de la colonne finale :**
- L'implication principale est A -> B. Elle est fausse UNIQUEMENT quand A=V et B=F.
- Ligne 1 : V -> V = V
- Ligne 2 : F -> F = V (antecedent faux, implication vraie)
- Ligne 3 : F -> V = V (antecedent faux)
- Ligne 4 : F -> F = V (antecedent faux)
- Ligne 5 : V -> V = V
- Ligne 6 : F -> V = V (antecedent faux)
- Ligne 7 : V -> V = V
- Ligne 8 : V -> V = V

**Toutes les lignes donnent V. C'est une TAUTOLOGIE.**

---

## Exercice 6 : Consequence logique par table de verite

### Enonce
Montrer que p, p -> (q -> r), q |= r.

### Solution detaillee

**Methode :** Montrer que `(p /\ (p -> (q -> r)) /\ q) -> r` est une tautologie.

Equivalemment : verifier que dans toute ligne ou TOUTES les premisses sont vraies, la conclusion r est aussi vraie.

**Table complete (3 variables, 8 lignes) :**

| p | q | r | q->r | p->(q->r) | Premisse 1 (p) | Premisse 2 (p->(q->r)) | Premisse 3 (q) | Toutes V ? | r |
|---|---|---|------|-----------|-----------------|------------------------|----------------|------------|---|
| V | V | V | V    | V         | V               | V                      | V              | **OUI**    | V |
| V | V | F | F    | F         | V               | F                      | V              | NON        | - |
| V | F | V | V    | V         | V               | V                      | F              | NON        | - |
| V | F | F | V    | V         | V               | V                      | F              | NON        | - |
| F | V | V | V    | V         | F               | V                      | V              | NON        | - |
| F | V | F | F    | V         | F               | V                      | V              | NON        | - |
| F | F | V | V    | V         | F               | V                      | F              | NON        | - |
| F | F | F | V    | V         | F               | V                      | F              | NON        | - |

**Analyse :**
La seule ligne ou les trois premisses sont TOUTES vraies est la ligne 1 (p=V, q=V, r=V). Dans cette ligne, r = V.

Il n'existe AUCUNE ligne ou toutes les premisses sont vraies et r est faux.

**Conclusion :** r est bien consequence logique de p, p -> (q -> r) et q.

**Raisonnement deductif (verification) :**
1. p est vrai (premisse 1)
2. p -> (q -> r) est vrai (premisse 2)
3. Par modus ponens sur 1 et 2 : q -> r est vrai
4. q est vrai (premisse 3)
5. Par modus ponens sur 4 et 3 : **r est vrai**

---

## Exercice 7 : Verifier une tautologie par equivalences

### Enonce
Montrer que `(p -> q) -> (~q -> ~p)` est une tautologie (contraposee).

### Solution par equivalences

```
(p -> q) -> (~q -> ~p)
```

**Pas 1 :** Eliminer les implications (de l'interieur vers l'exterieur).
```
= (p -> q) -> (~~q \/ ~p)         [elimination de -> sur ~q -> ~p]
= (p -> q) -> (q \/ ~p)           [double negation : ~~q = q]
= ~(p -> q) \/ (q \/ ~p)          [elimination de -> sur l'implication principale]
```

**Pas 2 :** Eliminer la derniere implication restante.
```
= ~(~p \/ q) \/ (q \/ ~p)         [elimination de -> sur p -> q]
```

**Pas 3 :** Appliquer De Morgan a la negation.
```
= (~~p /\ ~q) \/ (q \/ ~p)        [De Morgan : ~(A \/ B) = ~A /\ ~B]
= (p /\ ~q) \/ (q \/ ~p)          [double negation]
```

**Pas 4 :** Reorganiser et distribuer.
```
= (p /\ ~q) \/ q \/ ~p            [associativite de \/]
= ((p /\ ~q) \/ q) \/ ~p          [associativite]
```

Simplifions `(p /\ ~q) \/ q` :
```
(p /\ ~q) \/ q
= (p \/ q) /\ (~q \/ q)           [distributivite de \/ sur /\]
= (p \/ q) /\ V                   [complement : ~q \/ q = V]
= p \/ q                          [element neutre]
```

**Pas 5 :** Substituer.
```
= (p \/ q) \/ ~p                  [substitution]
= p \/ ~p \/ q                    [commutativite et associativite]
= V \/ q                          [complement : p \/ ~p = V]
= V                               [element absorbant : V \/ q = V]
```

**Resultat : la formule se reduit a V. C'est une TAUTOLOGIE.**

---

## Exercice 8 : Operateur NAND -- completude fonctionnelle

### Enonce
Montrer que le NAND (p NAND q = ~(p /\ q)) permet d'exprimer ~, /\, et \/.

### Solution detaillee

**Definition :** p NAND q = ~(p /\ q)

Table de verite du NAND :

| p | q | p /\ q | p NAND q |
|---|---|--------|----------|
| V | V | V      | F        |
| V | F | F      | V        |
| F | V | F      | V        |
| F | F | F      | V        |

**1. Negation : ~a = a NAND a**

Verification par table de verite :

| a | a NAND a = ~(a /\ a) = ~a | ~a |
|---|----------------------------|----|
| V | ~(V /\ V) = ~V = F        | F  |
| F | ~(F /\ F) = ~F = V        | V  |

Les colonnes sont identiques. **~a = a NAND a.**

*Justification algebrique :*
```
a NAND a = ~(a /\ a) = ~a      [idempotence : a /\ a = a]
```

**2. Conjonction : a /\ b = (a NAND b) NAND (a NAND b)**

*Justification algebrique :*
```
(a NAND b) NAND (a NAND b)
= ~((a NAND b) /\ (a NAND b))     [definition du NAND]
= ~(a NAND b)                      [idempotence : X /\ X = X]
= ~(~(a /\ b))                     [definition du NAND]
= a /\ b                           [double negation]
```

*Autrement dit :* NAND de quelque chose avec lui-meme donne sa negation. Donc on nie le NAND pour retrouver le AND.

**3. Disjonction : a \/ b = (a NAND a) NAND (b NAND b)**

*Justification algebrique :*
```
(a NAND a) NAND (b NAND b)
= ~a NAND ~b                       [car X NAND X = ~X]
= ~(~a /\ ~b)                      [definition du NAND]
= a \/ b                           [De Morgan : ~(~A /\ ~B) = A \/ B]
```

**Conclusion :** Puisque {~, /\, \/} est un systeme fonctionnellement complet (on peut exprimer tout connecteur avec eux), et que NAND seul permet d'exprimer {~, /\, \/}, alors **NAND seul est fonctionnellement complet**.

---

## Exercice 9 : Nombre de tables de verite

### Enonce
Avec n propositions atomiques, combien existe-t-il de tables de verite differentes ?

### Solution detaillee

**Raisonnement pas a pas :**

1. Avec n variables, la table de verite a **2^n** lignes (chaque variable peut etre V ou F, donc 2 x 2 x ... x 2 = 2^n combinaisons).

2. Pour chaque ligne, le resultat de la formule est soit V soit F : **2 choix par ligne**.

3. Le nombre total de tables de verite differentes est donc :
```
2 choix/ligne x 2^n lignes = 2^(2^n)
```

**Applications numeriques :**

| n (variables) | 2^n (lignes) | 2^(2^n) (tables) |
|---------------|-------------|-------------------|
| 1             | 2           | 4                 |
| 2             | 4           | 16                |
| 3             | 8           | 256               |
| 4             | 16          | 65 536            |

**Pour n = 1 :** Les 4 tables possibles sont :
- Toujours V (tautologie) : `p \/ ~p`
- Identite : `p`
- Negation : `~p`
- Toujours F (contradiction) : `p /\ ~p`

**Pour n = 2 :** Les 16 tables correspondent aux 16 connecteurs binaires possibles (dont /\, \/, ->, <->, NAND, NOR, XOR, etc.).

---

## Exercice 10 : Tautologies fondamentales -- verification exhaustive

### Enonce
Verifier par table de verite que le modus ponens `(p /\ (p -> q)) -> q` est une tautologie.

### Solution detaillee

| p | q | p -> q | p /\ (p -> q) | (p /\ (p -> q)) -> q |
|---|---|--------|---------------|----------------------|
| V | V | V      | V             | **V** |
| V | F | F      | F             | **V** |
| F | V | V      | F             | **V** |
| F | F | V      | F             | **V** |

**Verification ligne par ligne :**

- **Ligne 1 (p=V, q=V) :**
  - p -> q = V -> V = V
  - p /\ V = V
  - V -> q = V -> V = V

- **Ligne 2 (p=V, q=F) :**
  - p -> q = V -> F = F
  - p /\ F = F
  - F -> q = F -> F = V (antecedent faux, implication vraie)

- **Ligne 3 (p=F, q=V) :**
  - p -> q = F -> V = V
  - p /\ V = F /\ V = F
  - F -> q = F -> V = V (antecedent faux)

- **Ligne 4 (p=F, q=F) :**
  - p -> q = F -> F = V
  - p /\ V = F /\ V = F
  - F -> q = F -> F = V (antecedent faux)

**Toutes les lignes donnent V. C'est une TAUTOLOGIE.**

Observation : dans les lignes 2, 3 et 4, l'antecedent `p /\ (p -> q)` est faux, donc l'implication est automatiquement vraie. Dans la ligne 1, l'antecedent est vrai et la conclusion q aussi. Il n'existe aucune ligne ou l'antecedent est vrai et la conclusion fausse.

---

## Exercice 11 : Traduction francais -> propositions (type ExoCours Diapo 9)

### Enonce

Soit les trois assertions :
- H1 : "Soit Jerome ne fait pas attention et il perd le fil du raisonnement, soit il prend des notes et il n'est pas dans le coup."
- H2 : "Soit Jerome n'est pas dans le coup, soit il ne perd pas le fil du raisonnement."
- H3 : "Si Jerome etudie la logique, alors il n'est pas dans le coup seulement s'il ne prend pas de notes et fait attention."

Variables propositionnelles :
- a : Jerome fait attention
- n : Jerome prend des notes
- c : Jerome est dans le coup
- l : Jerome etudie la logique
- r : Jerome perd le fil du raisonnement

Q1 : Exprimer H1, H2, H3 en propositions.
Q2 : L'ensemble {H1, H2, H3, l} est-il satisfaisable ?

### Solution detaillee

**Q1 : Traduction**

**H1 :** "Soit A, soit B" se traduit par un OU exclusif... mais en logique propositionnelle, on utilise le \/ (ou inclusif) pour le "soit...soit" car l'ambiguite du francais le permet generalement.

```
H1 = (~a /\ r) \/ (n /\ ~c)
```

Decomposition :
- "Jerome ne fait pas attention" = ~a
- "il perd le fil" = r
- "il prend des notes" = n
- "il n'est pas dans le coup" = ~c

**H2 :** "Soit A, soit B" (meme schema).

```
H2 = ~c \/ ~r
```

Forme equivalente : `H2 = ~(c /\ r)` (il n'est pas le cas que Jerome soit dans le coup ET perde le fil).

**H3 :** "Si A, alors B seulement si C."

Le point cle est "B seulement si C" qui se traduit par `B -> C`. Donc :

```
H3 = l -> (~c -> (~n /\ a))
```

Decomposition :
- "Si Jerome etudie la logique" = l -> ...
- "il n'est pas dans le coup" = ~c (c'est le B dans "B seulement si C")
- "seulement si" = -> (le B implique le C)
- "il ne prend pas de notes et fait attention" = ~n /\ a (c'est le C)

**Piege :** "A seulement si B" = `A -> B`, PAS `B -> A`. "Seulement si" introduit une condition NECESSAIRE, pas suffisante.

**Q2 : Satisfaisabilite**

Ajoutons l : Jerome etudie la logique. Cherchons une valuation satisfaisant {H1, H2, H3, l}.

**Strategie :** Commencer par les contraintes les plus fortes.

Avec l = V, H3 donne : `V -> (~c -> (~n /\ a))`, soit `~c -> (~n /\ a)`.

Essayons c = F (~c = V) :
- H3 impose ~n /\ a, donc n = F, a = V.
- H1 = (~V /\ r) \/ (F /\ V) = (F /\ r) \/ F = F.

H1 serait faux. Essayons c = V :
- ~c = F, donc H3 donne F -> ... = V (trivial). Pas de contrainte.
- H2 = V \/ ~r = ~r (car c = V, ~c = F, donc ~c \/ ~r = F \/ ~r = ~r). Donc r = F.
- H1 = (~a /\ F) \/ (n /\ F) = F \/ F = F.

H1 est encore faux. Essayons c = F et revenons :
- Avec c = F, H3 impose n = F et a = V.
- H1 = (F /\ r) \/ (F /\ V) = F \/ F = F.

H1 est faux dans tous les cas. **L'ensemble {H1, H2, H3, l} est insatisfaisable.**

Verification systematique : si c = V, H2 force r = F, et H1 = (~a /\ F) \/ (n /\ F) = F. Si c = F, H3 (avec l) force a = V et n = F, et H1 = (F /\ r) \/ (F /\ V) = F. Dans tous les cas, H1 est faux.

---

## Exercice 12 : Tautologie par contre-exemple (type ExoCours Diapo 29)

### Enonce

Verifier les propositions suivantes sont des tautologies. Methode : chercher un contre-exemple (valuation rendant la formule fausse). S'il n'en existe pas, c'est une tautologie.

**a)** `r -> (s -> r)`
**b)** `r -> ((~r) -> s)`
**c)** `(r -> s) -> ((s -> t) -> (r -> t))`

### Solution detaillee

**a)** `r -> (s -> r)`

Pour avoir un contre-exemple, il faut V -> F, donc r = V et (s -> r) = F.
- r = V, et s -> V = V pour tout s. Donc (s -> r) = V.
- Contradiction : on a besoin de (s -> r) = F mais on obtient V.

Pas de contre-exemple. **Tautologie.**

**b)** `r -> ((~r) -> s)`

Pour avoir un contre-exemple, il faut r = V et (~r) -> s = F.
- r = V force ~r = F.
- (~r) -> s = F -> s = V pour tout s (premisse fausse, implication vraie).
- Contradiction : on a besoin de F mais on obtient V.

Pas de contre-exemple. **Tautologie.**

**c)** `(r -> s) -> ((s -> t) -> (r -> t))`

Pour avoir un contre-exemple, il faut V -> F, donc le cote gauche doit etre vrai et le cote droit faux.

Analysons le cote droit d'abord (plus contraignant car c'est celui qui doit etre F) :
```
(s -> t) -> (r -> t) = F
```
Il faut (s -> t) = V et (r -> t) = F.
- (r -> t) = F force r = V et t = F.
- (s -> t) = (s -> F) = ~s. Il faut V, donc s = F.

Verifions le cote gauche : (r -> s) = (V -> F) = F. Or on a besoin que le cote gauche soit V. **Contradiction.**

Pas de contre-exemple. **Tautologie.**

**Remarque methodologique :** Cette methode est bien plus rapide que la table de verite pour 3+ variables. Au lieu de verifier 2^n lignes, on cherche a construire UNE valuation contradictoire. Si la construction echoue a chaque tentative, c'est une tautologie.
