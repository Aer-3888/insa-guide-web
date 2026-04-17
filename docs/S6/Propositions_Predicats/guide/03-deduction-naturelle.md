---
title: "Chapitre 3 -- Deduction naturelle"
sidebar_position: 3
---

# Chapitre 3 -- Deduction naturelle

> Regles d'introduction et d'elimination pour chaque connecteur, strategies de preuve, arbres de derivation.

---

## 1. Structure d'une preuve

### Le sequent

```
A1, A2, ..., An ⊢ B
```

Signifie : "A partir des hypotheses A1, ..., An, on peut deduire B."

- Gauche du ⊢ : le **contexte** (hypotheses)
- Droite du ⊢ : la **conclusion**

### Format lineaire (Fitch)

Chaque ligne est numerotee et justifiee par une regle + numeros des lignes utilisees. Les hypotheses temporaires sont entre crochets [...].

```
1.  A1                (hypothese)
2.  A2                (hypothese)
3.  ...               (regle, lignes)
n.  Conclusion        (regle, lignes)
```

---

## 2. Regles d'inference propositionnelles

### 2.1 Conjonction (∧)

**Introduction ∧-I :** Si on a A et B, on conclut A ∧ B.
```
     A       B
    -----------  [∧-I]
      A ∧ B
```

**Elimination ∧-E :** Si on a A ∧ B, on extrait A ou B.
```
    A ∧ B                A ∧ B
    ------  [∧-E1]       ------  [∧-E2]
      A                     B
```

### 2.2 Disjonction (∨)

**Introduction ∨-I :** Si on a A, on conclut A ∨ B (pour tout B).
```
      A                     B
    ------  [∨-I1]       ------  [∨-I2]
    A ∨ B                A ∨ B
```

**Elimination ∨-E (raisonnement par cas) :** Si on a A ∨ B, et qu'en supposant A on prouve C, et qu'en supposant B on prouve aussi C, alors C est prouve.
```
              [A]       [B]
               :         :
    A ∨ B      C         C
    -------------------------  [∨-E]
               C
```

### 2.3 Implication (→)

**Introduction →-I (preuve sous hypothese) :** Supposer A, montrer B, conclure A → B. Decharger l'hypothese A.
```
     [A]
      :
      B
    ------  [→-I]
    A → B
```

**Elimination →-E (modus ponens) :** Si on a A et A → B, on conclut B.
```
    A     A → B
    ------------  [→-E]
         B
```

### 2.4 Negation (¬)

**Introduction ¬-I (preuve par contradiction) :** Supposer A, deriver ⊥ (absurde), conclure ¬A.
```
     [A]
      :
     ⊥
    ------  [¬-I]
      ¬A
```

**Elimination ¬-E :** Si on a A et ¬A, on obtient ⊥.
```
    A     ¬A
    --------  [¬-E]
      ⊥
```

### 2.5 Absurde (⊥)

**Elimination ⊥-E (ex falso quodlibet) :** Du faux, on deduit n'importe quoi.
```
     ⊥
    ------  [⊥-E]
      A
```

### 2.6 Reduction par l'absurde (RAA)

**RAA :** Supposer ¬A, deriver ⊥, conclure A.
```
     [¬A]
      :
     ⊥
    ------  [RAA]
      A
```

**Difference avec ¬-I :** ¬-I suppose A et conclut ¬A. RAA suppose ¬A et conclut A.

---

## 3. Tableau recapitulatif des regles propositionnelles

| Regle | Premisses | Conclusion | Hypothese dechargee |
|-------|-----------|-----------|---------------------|
| ∧-I | A, B | A ∧ B | -- |
| ∧-E1 | A ∧ B | A | -- |
| ∧-E2 | A ∧ B | B | -- |
| ∨-I1 | A | A ∨ B | -- |
| ∨-I2 | B | A ∨ B | -- |
| ∨-E | A ∨ B, [A]→C, [B]→C | C | A, B |
| →-I | [A]→B | A → B | A |
| →-E | A, A → B | B | -- |
| ¬-I | [A]→⊥ | ¬A | A |
| ¬-E | A, ¬A | ⊥ | -- |
| ⊥-E | ⊥ | A (n'importe quoi) | -- |
| RAA | [¬A]→⊥ | A | ¬A |

---

## 4. Regles pour les quantificateurs

### 4.1 Quantificateur universel (∀)

**Introduction ∀-I :** Prouver P(a) pour une variable **fraiche** a (qui n'apparait dans aucune hypothese non dechargee).
```
    P(a)         (a frais)
    --------  [∀-I]
    ∀x, P(x)
```

**Elimination ∀-E :** De ∀x, P(x), on deduit P(t) pour tout terme t.
```
    ∀x, P(x)
    ----------  [∀-E]
       P(t)
```

### 4.2 Quantificateur existentiel (∃)

**Introduction ∃-I :** De P(t) pour un terme t, on deduit ∃x, P(x).
```
       P(t)
    ----------  [∃-I]
    ∃x, P(x)
```

**Elimination ∃-E :** Si on a ∃x, P(x), on pose P(a) pour a **frais**, et si on arrive a C (qui ne contient pas a), alors C est prouve.
```
                  [P(a)]       (a frais)
                    :
    ∃x, P(x)       C
    --------------------------  [∃-E]
              C
```

**Conditions cruciales :**
- ∀-I : a ne doit apparaitre dans aucune hypothese non dechargee.
- ∃-E : a ne doit apparaitre ni dans C, ni dans les hypotheses non dechargees (sauf P(a)).

### Tableau recapitulatif des quantificateurs

| Regle | Premisses | Conclusion | Condition |
|-------|-----------|-----------|-----------|
| ∀-I | P(a) | ∀x, P(x) | a frais |
| ∀-E | ∀x, P(x) | P(t) | t quelconque |
| ∃-I | P(t) | ∃x, P(x) | t quelconque |
| ∃-E | ∃x, P(x), [P(a)]→C | C | a frais, a ∉ C |

---

## 5. Exemples resolus

### Exemple 1 : p ∧ q ⊢ q ∧ p (commutativite)

```
1.  p ∧ q          (hypothese)
2.  q              (∧-E2, 1)
3.  p              (∧-E1, 1)
4.  q ∧ p          (∧-I, 2, 3)
```

### Exemple 2 : ⊢ p → p (reflexivite)

```
1.  [p]            (hypothese temporaire)
2.  p → p          (→-I, decharge 1)
```

### Exemple 3 : p → q, q → r ⊢ p → r (syllogisme hypothetique)

```
1.  p → q          (hypothese)
2.  q → r          (hypothese)
3.    [p]          (hypothese temporaire)
4.    q            (→-E, 3, 1)
5.    r            (→-E, 4, 2)
6.  p → r          (→-I, decharge 3)
```

### Exemple 4 : p ∧ (q ∨ r) ⊢ (p ∧ q) ∨ (p ∧ r) (distributivite)

```
1.  p ∧ (q ∨ r)        (hypothese)
2.  p                   (∧-E1, 1)
3.  q ∨ r              (∧-E2, 1)
    -- Cas 1 : supposons q
4.    [q]              (hypothese temporaire)
5.    p ∧ q            (∧-I, 2, 4)
6.    (p ∧ q) ∨ (p ∧ r)  (∨-I1, 5)
    -- Cas 2 : supposons r
7.    [r]              (hypothese temporaire)
8.    p ∧ r            (∧-I, 2, 7)
9.    (p ∧ q) ∨ (p ∧ r)  (∨-I2, 8)
10. (p ∧ q) ∨ (p ∧ r)  (∨-E, 3, 6, 9 -- decharge 4, 7)
```

### Exemple 5 : p → q ⊢ ¬q → ¬p (contraposee)

```
1.  p → q          (hypothese)
2.    [¬q]         (hypothese temporaire)
3.      [p]        (hypothese temporaire)
4.      q          (→-E, 3, 1)
5.      ⊥          (¬-E, 4, 2)
6.    ¬p           (¬-I, decharge 3)
7.  ¬q → ¬p       (→-I, decharge 2)
```

### Exemple 6 : ⊢ ¬¬p → p (double negation, classique)

```
1.  [¬¬p]          (hypothese temporaire)
2.    [¬p]         (hypothese temporaire)
3.    ⊥            (¬-E, 1, 2)
4.  p              (RAA, decharge 2)
5.  ¬¬p → p       (→-I, decharge 1)
```

### Exemple 7 : ∀x, P(x) ⊢ ∀x, (P(x) ∨ Q(x))

```
1.  ∀x, P(x)              (hypothese)
2.  P(a)                   (∀-E, 1)
3.  P(a) ∨ Q(a)           (∨-I1, 2)
4.  ∀x, (P(x) ∨ Q(x))    (∀-I, 3 -- a frais)
```

### Exemple 8 : ∃x, P(x), ∀x, (P(x) → Q(x)) ⊢ ∃x, Q(x)

```
1.  ∃x, P(x)              (hypothese)
2.  ∀x, (P(x) → Q(x))    (hypothese)
3.    [P(a)]              (hypothese temporaire, a frais)
4.    P(a) → Q(a)         (∀-E, 2)
5.    Q(a)                (→-E, 3, 4)
6.    ∃x, Q(x)            (∃-I, 5)
7.  ∃x, Q(x)              (∃-E, 1, 3-6, decharge 3)
```

### Exemple 9 : ∀x, (P(x) → Q(x)), ∀x, P(x) ⊢ ∀x, Q(x)

```
1.  ∀x, (P(x) → Q(x))    (hypothese)
2.  ∀x, P(x)              (hypothese)
3.  P(a) → Q(a)           (∀-E, 1)
4.  P(a)                   (∀-E, 2)
5.  Q(a)                   (→-E, 4, 3)
6.  ∀x, Q(x)              (∀-I, 5 -- a frais)
```

---

## 6. Strategies de construction

### Strategie generale

1. **Regarder la conclusion** : quel est le connecteur principal ?
   - → : utiliser →-I (supposer le cote gauche)
   - ∧ : utiliser ∧-I (prouver les deux cotes)
   - ∨ : utiliser ∨-I (prouver un cote)
   - ¬ : utiliser ¬-I (supposer l'oppose, trouver ⊥)
   - ∀ : utiliser ∀-I (prouver pour a frais)
   - ∃ : utiliser ∃-I (trouver un temoin)

2. **Exploiter les hypotheses** :
   - A ∧ B : extraire A et B
   - A → B et A : deduire B
   - A ∨ B : raisonnement par cas
   - ∃x, P(x) : poser P(a) pour a frais

3. **Travailler aux deux bouts** : conclusion (introduction) et hypotheses (elimination), jusqu'a la jonction.

---

## 7. Pieges classiques

| Piege | Erreur | Correction |
|-------|--------|------------|
| Hypothese non dechargee | Garder une hypothese temporaire | Toujours decharger avec →-I, ¬-I, ∨-E, ∃-E |
| Variable non fraiche | Utiliser a deja dans les hypotheses | a doit etre nouveau pour ∀-I et ∃-E |
| Modus ponens a l'envers | De B et A → B, deduire A | On ne remonte **pas** une implication |
| Confondre ¬-I et RAA | ¬-I et RAA font la meme chose | ¬-I : [A]→⊥ donne ¬A. RAA : [¬A]→⊥ donne A |
| Oublier la justification | Ligne sans regle | Chaque ligne doit citer la regle et les numeros |
