---
title: "CHEAT SHEET -- Propositions et Predicats"
sidebar_position: 10
---

# CHEAT SHEET -- Propositions et Predicats

> Toutes les regles, equivalences et procedures en un seul endroit.

---

## 1. Tables de verite

| p | q | ¬p | p ∧ q | p ∨ q | p → q | p ↔ q |
|---|---|-----|-------|-------|-------|-------|
| V | V | F | V | V | V | V |
| V | F | F | F | V | **F** | F |
| F | V | V | F | V | V | F |
| F | F | V | F | F | V | V |

**Priorite :** ¬ > ∧ > ∨ > → > ↔

---

## 2. Equivalences fondamentales

```
ELIMINATION
  p → q        ≡  ¬p ∨ q
  p ↔ q        ≡  (p → q) ∧ (q → p)
  ¬(p → q)     ≡  p ∧ ¬q

DE MORGAN
  ¬(p ∧ q)     ≡  ¬p ∨ ¬q
  ¬(p ∨ q)     ≡  ¬p ∧ ¬q

DOUBLE NEGATION
  ¬¬p           ≡  p

DISTRIBUTIVITE
  p ∧ (q ∨ r)  ≡  (p ∧ q) ∨ (p ∧ r)
  p ∨ (q ∧ r)  ≡  (p ∨ q) ∧ (p ∨ r)

ABSORPTION
  p ∧ (p ∨ q)  ≡  p
  p ∨ (p ∧ q)  ≡  p

COMPLEMENT
  p ∧ ¬p       ≡  F
  p ∨ ¬p       ≡  V

ELEMENTS NEUTRES / ABSORBANTS
  p ∧ V = p      p ∧ F = F
  p ∨ F = p      p ∨ V = V

CONTRAPOSEE
  p → q        ≡  ¬q → ¬p
```

---

## 3. Tautologies classiques

```
Tiers exclu              p ∨ ¬p
Non-contradiction        ¬(p ∧ ¬p)
Modus ponens             (p ∧ (p → q)) → q
Modus tollens            ((p → q) ∧ ¬q) → ¬p
Syllogisme hypothetique  ((p → q) ∧ (q → r)) → (p → r)
Contraposee              (p → q) ↔ (¬q → ¬p)
Exportation              ((p ∧ q) → r) ↔ (p → (q → r))
```

---

## 4. Formes normales -- Procedure

### FNC (ET de OU)
```
1. Eliminer ↔  :  A ↔ B  →  (A → B) ∧ (B → A)
2. Eliminer →  :  A → B  →  ¬A ∨ B
3. Descendre ¬ :  De Morgan + double negation
4. Distribuer ∨ sur ∧ :  A ∨ (B ∧ C) → (A ∨ B) ∧ (A ∨ C)
```

### FND (OU de ET)
```
Etapes 1-3 identiques
4. Distribuer ∧ sur ∨ :  A ∧ (B ∨ C) → (A ∧ B) ∨ (A ∧ C)
```

### Via table de verite
- **FND** : lignes V → monomes (variable si V, ¬variable si F) relies par ∨
- **FNC** : lignes F → clauses (¬variable si V, variable si F) relies par ∧

---

## 5. Resolution -- Procedure

### Prouver une tautologie
```
1. NIER la formule
2. Mettre en FNC (clauses)
3. Resoudre jusqu'a la clause vide □
4. □ obtenue → tautologie prouvee
```

### Prouver A1, ..., An ⊨ B
```
1. Clauses de A1, ..., An + clauses de ¬B
2. Resoudre jusqu'a □
```

### Resolvante
```
C1 = {..., p, ...}     C2 = {..., ¬p, ...}
Res(C1, C2) = (C1 \ {p}) ∪ (C2 \ {¬p})
```

**Regles :**
- Un seul litteral a la fois
- Ignorer tautologies (contenant p et ¬p)
- Eliminer doublons

---

## 6. Quantificateurs

### Negation
```
¬(∀x, P(x))  ≡  ∃x, ¬P(x)
¬(∃x, P(x))  ≡  ∀x, ¬P(x)
```

### Traduction

| Phrase | Formule |
|--------|---------|
| Tous les A sont B | ∀x, (A(x) **→** B(x)) |
| Certains A sont B | ∃x, (A(x) **∧** B(x)) |
| Aucun A n'est B | ∀x, (A(x) → ¬B(x)) |

### Distributivite (valide)
```
∀x, (P(x) ∧ Q(x))  ≡  (∀x, P(x)) ∧ (∀x, Q(x))
∃x, (P(x) ∨ Q(x))  ≡  (∃x, P(x)) ∨ (∃x, Q(x))
```

### Distributivite (NON valide)
```
∀x, (P(x) ∨ Q(x))  ≢  (∀x, P(x)) ∨ (∀x, Q(x))
∃x, (P(x) ∧ Q(x))  ≢  (∃x, P(x)) ∧ (∃x, Q(x))
```

### Ordre
```
∃x, ∀y, P(x,y)  ⟹  ∀y, ∃x, P(x,y)     (pas l'inverse)
```

---

## 7. Forme prenexe et skolemisation

### Forme prenexe
```
1. Eliminer ↔ et →
2. Descendre ¬ (De Morgan + negation quantificateurs)
3. Renommer variables liees
4. Sortir quantificateurs en tete
```

### Skolemisation
```
∃x (sans ∀ avant)         →  x ← c (constante de Skolem)
∀y, ∃x                    →  x ← f(y) (fonction de Skolem)
∀y, ∀z, ∃x                →  x ← f(y, z)
```

---

## 8. Unification

### Algorithme
```
1. E1 = E2 ?  → retourner {}
2. E1 est variable x ?
   - x ∈ E2 → ECHEC (occur check)
   - sinon → {x ← E2}
3. E2 est variable x ?  (symetrique)
4. Meme symbole et arite ?
   → unifier arguments un par un, appliquer σ entre chaque
5. Sinon → ECHEC
```

**Regles critiques :**
- Test d'occurrence : x ← f(x) est ECHEC
- Appliquer σ intermediaire avant de continuer
- MGU s'applique a toute la resolvante

---

## 9. Deduction naturelle -- Toutes les regles

### Regles propositionnelles

| Regle | Premisses | Conclusion |
|-------|-----------|-----------|
| **∧-I** | A, B | A ∧ B |
| **∧-E1** | A ∧ B | A |
| **∧-E2** | A ∧ B | B |
| **∨-I1** | A | A ∨ B |
| **∨-I2** | B | A ∨ B |
| **∨-E** | A ∨ B, [A]→C, [B]→C | C |
| **→-I** | [A]→B | A → B |
| **→-E** | A, A → B | B |
| **¬-I** | [A]→⊥ | ¬A |
| **¬-E** | A, ¬A | ⊥ |
| **⊥-E** | ⊥ | A (tout) |
| **RAA** | [¬A]→⊥ | A |

### Regles pour les quantificateurs

| Regle | Premisses | Conclusion | Condition |
|-------|-----------|-----------|-----------|
| **∀-I** | P(a) | ∀x, P(x) | a frais |
| **∀-E** | ∀x, P(x) | P(t) | t quelconque |
| **∃-I** | P(t) | ∃x, P(x) | t quelconque |
| **∃-E** | ∃x, P(x), [P(a)]→C | C | a frais, a ∉ C |

### Strategie
1. Regarder la **conclusion** → regle d'introduction
2. Exploiter les **hypotheses** → regle d'elimination
3. → : supposer le gauche, montrer le droit
4. ¬ : supposer l'oppose, trouver ⊥
5. ∨ : raisonnement par cas

---

## 10. Les 15 pieges du DS

| # | Domaine | Piege | Correction |
|---|---------|-------|------------|
| 1 | Prop | F → F = F ? | F → F = **V** |
| 2 | Prop | V ∨ V = F ? | V ∨ V = **V** (inclusif) |
| 3 | Prop | ¬p ∧ q = ¬(p ∧ q) ? | C'est **(¬p) ∧ q** |
| 4 | Prop | ¬(p ∧ q) = ¬p ∧ ¬q ? | ¬p **∨** ¬q |
| 5 | FN | FNC = ET de ET ? | ET de **OU** |
| 6 | FN | Distribuer sans eliminer → | Ordre : ↔, →, ¬, distribution |
| 7 | FN | A ∨ (B ∧ C) = (A ∨ B) ∧ C | **(A ∨ B) ∧ (A ∨ C)** |
| 8 | Res | Resoudre sans nier | **Nier** d'abord |
| 9 | Res | Resoudre sur 2 litteraux | **Un seul** a la fois |
| 10 | Res | Garder doublons {p, p, q} | C'est **{p, q}** |
| 11 | Pred | ∀x, A(x) ∧ B(x) pour "tous A sont B" | ∀x, (A(x) **→** B(x)) |
| 12 | Pred | ∃x, A(x) → B(x) pour "certains A sont B" | ∃x, (A(x) **∧** B(x)) |
| 13 | Pred | ∀x ∃y = ∃y ∀x | L'ordre **change le sens** |
| 14 | Unif | {x ← f(x)} accepte | **ECHEC** (terme infini) |
| 15 | DN | De B et A → B, deduire A | On ne **remonte pas** → |

---

## 11. Checklist avant de rendre

```
[ ] Tables de verite : 2^n lignes pour n variables
[ ] De Morgan : ET↔OU s'inversent, negation sur chaque terme
[ ] FNC = ET de OU, FND = OU de ET
[ ] Resolution : negation AVANT de resoudre
[ ] Un seul litteral par resolution
[ ] "Tous les A sont B" utilise →
[ ] "Certains A sont B" utilise ∧
[ ] Occur check verifie pour chaque unification
[ ] Substitutions appliquees progressivement
[ ] Hypotheses temporaires dechargees en deduction naturelle
[ ] Variables fraiches dans ∀-I et ∃-E
[ ] Chaque ligne justifiee (regle + numeros)
```

---

## 12. Gestion du temps

| Exercice | Temps | Conseil |
|----------|-------|---------|
| Valuation | 5-10 min | Mecanique, verifier |
| Formes normales | 10-15 min | 4 etapes dans l'ordre |
| Resolution | 15-20 min | Clauses unitaires d'abord |
| Traduction predicats | 10-15 min | Relire la phrase 2 fois |
| Unification | 10-15 min | Noter chaque σ |
| Deduction naturelle | 15-20 min | Partir de la conclusion |
