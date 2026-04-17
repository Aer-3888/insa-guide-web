---
title: "Exercices types resolus -- Preparation DS"
sidebar_position: 3
---

# Exercices types resolus -- Preparation DS

> Exercices representatifs du DS, resolus pas a pas.

---

## Exercice 1 : Valuation complete

### Enonce (type DS)
Soit F = ((p1 ∨ p3) ∧ (p3 → p4)) → (p2 → p3).

Q1 : Trouver v telle que v(F) = 1.
Q2 : Trouver v telle que v(F) = 0.

### Solution

**Q1 (v(F) = 1) :** F est une implication A → B. F est vraie si A est faux ou B est vrai.

Methode simple : rendre l'antecedent faux.
- A = (p1 ∨ p3) ∧ (p3 → p4). Prenons p1 = F, p3 = F.
- p1 ∨ p3 = F. Donc A = F ∧ ... = F.
- F → B = V quel que soit B.

**Reponse :** v(p1) = F, v(p2) = F, v(p3) = F, v(p4) = F donne v(F) = 1.

**Q2 (v(F) = 0) :** F fausse signifie A vrai et B faux.
- B = p2 → p3 = F necessite p2 = V, p3 = F.
- A = (p1 ∨ p3) ∧ (p3 → p4) = (p1 ∨ F) ∧ (F → p4) = p1 ∧ V = p1.
- Donc A = V necessite p1 = V.

**Reponse :** v(p1) = V, v(p2) = V, v(p3) = F, v(p4) = V (ou F) donne v(F) = 0.

Verification : F = (V ∧ V) → (V → F) = V → F = **F**.

---

## Exercice 2 : Resolution au premier ordre -- Dragons (type DS 2023)

### Enonce
Soit :
- A1 : ∃x, Dragon(x)
- A2 : ∀x, (Dragon(x) → (Sleep(x) ∨ Hunt(x)))
- A3 : ∀x, (Dragon(x) → (Hungry(x) → ¬Sleep(x)))
- A4 : ∀x, (Dragon(x) → (Tired(x) → ¬Hunt(x)))

Montrer que F5 = ∀x, ((Dragon(x) ∧ Tired(x)) → Sleep(x)) est consequence de {A1, A2, A3, A4}.

### Solution

**Mise en clauses des hypotheses :**

A1 : ∃x, Dragon(x). Skolemiser : Dragon(a).
```
C1 = {Dragon(a)}
```

A2 : ∀x, (¬Dragon(x) ∨ Sleep(x) ∨ Hunt(x))
```
C2 = {¬Dragon(x), Sleep(x), Hunt(x)}
```

A3 : ∀x, (¬Dragon(x) ∨ ¬Hungry(x) ∨ ¬Sleep(x))
```
C3 = {¬Dragon(x), ¬Hungry(x), ¬Sleep(x)}
```

A4 : ∀x, (¬Dragon(x) ∨ ¬Tired(x) ∨ ¬Hunt(x))
```
C4 = {¬Dragon(x), ¬Tired(x), ¬Hunt(x)}
```

**Negation de la conclusion :**

¬F5 = ¬∀x, ((Dragon(x) ∧ Tired(x)) → Sleep(x))
= ∃x, (Dragon(x) ∧ Tired(x) ∧ ¬Sleep(x))

Skolemiser avec constante b :
```
C5 = {Dragon(b)}
C6 = {Tired(b)}
C7 = {¬Sleep(b)}
```

**Resolution :**
```
Res(C2, C7) σ={x←b}  :  C8 = {¬Dragon(b), Hunt(b)}
Res(C8, C5)           :  C9 = {Hunt(b)}
Res(C4, C9) σ={x←b}  :  C10 = {¬Dragon(b), ¬Tired(b)}
Res(C10, C5)          :  C11 = {¬Tired(b)}
Res(C11, C6)          :  C12 = {}  clause vide
```

F5 est consequence de {A1, A2, A3, A4}.

---

## Exercice 3 : Resolution -- montrer F6 (type DS 2023 suite)

### Enonce
Montrer que F6 = ∀x, ((Dragon(x) ∧ Hungry(x)) → ¬Hunt(x)) n'est PAS consequence de {A1, A2, A3, A4}.

### Solution (par interpretation)

On doit trouver une interpretation ou A1-A4 sont vraies mais F6 est fausse.

F6 fausse signifie : il existe un dragon affame qui chasse.

**Interpretation :**
- D = {d} (un seul dragon)
- Dragon(d) = V, Hungry(d) = V, Hunt(d) = V, Sleep(d) = F, Tired(d) = F

Verification des hypotheses :
- A1 : ∃x Dragon(x) = V (Dragon(d) = V)
- A2 : Dragon(d) → (Sleep(d) ∨ Hunt(d)) = V → (F ∨ V) = V → V = V
- A3 : Dragon(d) → (Hungry(d) → ¬Sleep(d)) = V → (V → V) = V → V = V
- A4 : Dragon(d) → (Tired(d) → ¬Hunt(d)) = V → (F → F) = V → V = V

Verification de F6 :
- F6 : Dragon(d) ∧ Hungry(d) → ¬Hunt(d) = (V ∧ V) → F = V → F = **F**

Toutes les hypotheses sont vraies mais F6 est fausse. F6 n'est **pas** consequence de A1-A4.

---

## Exercice 4 : Enigme -- liens internet (type DS 2021)

### Enonce
3 liens : un donne la solution, un donne une solution bidon, un est un piege.
Une seule description est vraie.
- Lien 1 : "Ce lien donne la solution au DS."
- Lien 2 : "Si Lien 1 ne mene pas a la solution alors Lien 3 te fera attraper."
- Lien 3 : "Lien 1 ne te fera pas attraper."

### Solution

Notons S(i) = "lien i donne la solution", P(i) = "lien i est le piege".

D1 : S(1)
D2 : ¬S(1) → P(3)
D3 : ¬P(1)

**Cas 1 :** D1 vraie (les seule vraie).
- S(1) est vrai. Lien 1 donne la solution.
- D2 fausse : ¬S(1) → P(3) = F → ... = V. Contradiction (D2 devrait etre fausse mais F → P(3) = V).
- Hmm, D2 = ¬S(1) → P(3). Avec S(1) = V : ¬V → P(3) = F → P(3) = V. D2 est vraie aussi.
- Contradiction : une seule description doit etre vraie, mais D1 et D2 sont toutes les deux vraies.

**Cas 2 :** D2 vraie (la seule vraie).
- D1 fausse : ¬S(1), lien 1 ne donne pas la solution.
- D2 vraie : ¬S(1) → P(3). Comme ¬S(1) est vrai, P(3) est vrai. Lien 3 est le piege.
- D3 fausse : ¬(¬P(1)) = P(1). Lien 1 est aussi le piege ? Non, il n'y a qu'un piege.
- D3 fausse signifie P(1) est vrai. Mais P(3) est aussi vrai. Deux pieges ? Contradiction si on suppose un seul piege.

Revisons : D3 = ¬P(1). D3 fausse = P(1).

Si le piege est unique : P(3) et P(1) ne peuvent etre vrais tous les deux. Contradiction.

**Cas 3 :** D3 vraie (la seule vraie).
- D3 vraie : ¬P(1). Lien 1 n'est pas le piege.
- D1 fausse : ¬S(1). Lien 1 ne donne pas la solution.
- Lien 1 n'est ni solution ni piege → Lien 1 est la solution bidon.
- D2 fausse : ¬(¬S(1) → P(3)). ¬S(1) → P(3) doit etre faux. ¬S(1) = V, donc P(3) = F.
- Lien 3 n'est pas le piege. Lien 1 est bidon, Lien 3 n'est pas le piege.
- Donc Lien 2 est le piege, et Lien 3 est la solution.

**Reponse :**
- Lien 1 : solution bidon
- Lien 2 : piege
- Lien 3 : **la solution**
- Seule D3 est vraie.

---

## Exercice 5 : Modelisation SAT -- addition binaire (type DS 2023)

### Enonce
Modeliser l'addition de deux nombres de 3 bits (a2a1a0 + b2b1b0 = s2s1s0) en clauses.

### Solution

**Variables propositionnelles :**
- ai : bit i du premier nombre (i = 0, 1, 2)
- bi : bit i du deuxieme nombre
- si : bit i de la somme
- ci : retenue sortante de la position i (c0 est la retenue de la position 0)

Note : il n'y a pas de retenue entrante a la position 0 (ou c_{-1} = 0).

**Contraintes pour la position 0 (pas de retenue entrante) :**

s0 = a0 XOR b0
c0 = a0 AND b0

En clauses (XOR de a0 et b0 pour s0) :
```
s0 vrai quand a0 ≠ b0 :
  (¬a0 ∨ ¬b0 ∨ ¬s0)     -- si les deux sont V, s0 est F
  (a0 ∨ b0 ∨ ¬s0)         -- si les deux sont F, s0 est F
  (¬a0 ∨ b0 ∨ s0)         -- si a0=F et b0=V, s0 est V
  (a0 ∨ ¬b0 ∨ s0)         -- si a0=V et b0=F, s0 est V
```

Retenue c0 = a0 ∧ b0 :
```
  (¬a0 ∨ ¬b0 ∨ c0)       -- si les deux sont V, c0 est V
  (a0 ∨ ¬c0)              -- si a0=F, c0 est F
  (b0 ∨ ¬c0)              -- si b0=F, c0 est F
```

**Contraintes pour la position i (i = 1, 2) avec retenue entrante c_{i-1} :**

si = ai XOR bi XOR c_{i-1}
ci = (ai AND bi) OR (ai AND c_{i-1}) OR (bi AND c_{i-1})

Ces relations booleennes se convertissent en clauses de la meme maniere.

De maniere generique, pour chaque position i > 0 :
- Si est le XOR de 3 bits (ai, bi, c_{i-1})
- Ci est la retenue majoritaire de 3 bits

---

## Exercice 6 : Programmation OCaml -- modus ponens

### Enonce (DS 2021)
Ecrire `modus_ponens : prop * prop -> prop list` qui applique modus ponens.

### Solution

```ocaml noexec
type prop = Atom of string | Not of prop | Imp of prop * prop

let modus_ponens (p, p') =
  match (p, p') with
  | (a, Imp(b, c)) when a = b -> [p; p'; c]
  | (Imp(b, c), a) when a = b -> [p; p'; c]
  | _ -> [p; p']
```

Explication :
- Si p = A et p' = A → C, alors on deduit C (modus ponens).
- Si p = A → C et p' = A, meme chose (ordre inverse).
- Sinon, pas de deduction possible, on retourne les deux propositions.

### Enonce (DS 2021 suite)
Ecrire `saturation : prop list -> prop list` qui applique modus ponens jusqu'a saturation.

### Solution

```ocaml noexec
let rec saturation l =
  let pairs = all_pairs l in
  let new_props = List.concat_map modus_ponens pairs in
  let extended = setify (l @ new_props) in
  if extended = setify l then l
  else saturation extended
```

On genere toutes les paires, applique modus ponens, et si on obtient de nouvelles propositions, on recommence.

---

## Exercice 7 : Deduction naturelle -- preuve type DS

### Enonce
Prouver : ∀x, (P(x) → Q(x)), P(a) ⊢ Q(a)

### Solution
```
1.  ∀x, (P(x) → Q(x))    (hypothese)
2.  P(a)                   (hypothese)
3.  P(a) → Q(a)           (∀-E, 1)
4.  Q(a)                   (→-E, 2, 3)
```

### Enonce
Prouver : ∀x, (P(x) → Q(x)) ⊢ ∀x, P(x) → ∀x, Q(x)

### Solution
```
1.  ∀x, (P(x) → Q(x))    (hypothese)
2.    [∀x, P(x)]          (hypothese temporaire)
3.    P(a)                 (∀-E, 2, a frais)
4.    P(a) → Q(a)         (∀-E, 1)
5.    Q(a)                 (→-E, 3, 4)
6.    ∀x, Q(x)            (∀-I, 5, a frais)
7.  ∀x, P(x) → ∀x, Q(x)  (→-I, decharge 2)
```
