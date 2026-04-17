---
title: "Chapitre 1 -- Logique propositionnelle"
sidebar_position: 1
---

# Chapitre 1 -- Logique propositionnelle

> Syntaxe, semantique, tables de verite, connecteurs logiques, tautologies, contradictions.

---

## 1. Definitions fondamentales

### Proposition

Une **proposition** (ou variable propositionnelle) est un enonce qui est soit **vrai** (V, 1) soit **faux** (F, 0). Pas d'entre-deux.

| Enonce | Proposition ? | Raison |
|--------|---------------|--------|
| "La Terre est ronde" | Oui | Vrai ou faux (vrai) |
| "2 + 2 = 5" | Oui | Vrai ou faux (faux) |
| "Quelle heure est-il ?" | Non | Question |
| "x > 3" | Non | Depend de x (predicat, pas proposition) |

### Formule propositionnelle

Une **formule** est construite a partir de :
- Variables propositionnelles : p, q, r...
- Connecteurs logiques : ¬, ∧, ∨, →, ↔
- Parentheses

### Valuation

Une **valuation** (ou interpretation) est une fonction qui assigne V ou F a chaque variable propositionnelle. Avec n variables, il y a 2^n valuations possibles.

---

## 2. Les cinq connecteurs logiques

### 2.1 Negation : ¬ (NON)

| p | ¬p |
|---|-----|
| V | F |
| F | V |

### 2.2 Conjonction : ∧ (ET)

Vrai **uniquement** si les deux sont vrais.

| p | q | p ∧ q |
|---|---|-------|
| V | V | **V** |
| V | F | F |
| F | V | F |
| F | F | F |

### 2.3 Disjonction : ∨ (OU inclusif)

Vrai des qu'**au moins un** est vrai.

| p | q | p ∨ q |
|---|---|-------|
| V | V | V |
| V | F | V |
| F | V | V |
| F | F | **F** |

**Attention :** C'est un OU inclusif (vrai meme si les deux sont vrais).

### 2.4 Implication : → (SI... ALORS)

| p | q | p → q |
|---|---|-------|
| V | V | V |
| V | F | **F** |
| F | V | V |
| F | F | V |

**Regle d'or :** L'implication n'est fausse que dans un seul cas : **V → F = F**.

Equivalence fondamentale :
```
p → q  ≡  ¬p ∨ q
```

### 2.5 Equivalence : ↔ (SI ET SEULEMENT SI)

Vraie quand les deux cotes ont la **meme** valeur.

| p | q | p ↔ q |
|---|---|-------|
| V | V | V |
| V | F | F |
| F | V | F |
| F | F | V |

Equivalence fondamentale :
```
p ↔ q  ≡  (p → q) ∧ (q → p)
```

---

## 3. Priorite des connecteurs

Du plus prioritaire au moins prioritaire :

| Rang | Connecteur | Symbole |
|------|------------|---------|
| 1 | Negation | ¬ |
| 2 | Conjonction | ∧ |
| 3 | Disjonction | ∨ |
| 4 | Implication | → |
| 5 | Equivalence | ↔ |

**Exemple :** `¬p ∧ q ∨ r` se lit comme `((¬p) ∧ q) ∨ r`

---

## 4. Tables de verite : methode

### Methode pas a pas

1. Identifier toutes les variables (n variables = 2^n lignes).
2. Ecrire toutes les combinaisons V/F.
3. Calculer les sous-formules de l'interieur vers l'exterieur.
4. Calculer la formule finale.

### Exemple : (p → q) ∧ (q → r)

| p | q | r | p → q | q → r | (p → q) ∧ (q → r) |
|---|---|---|-------|-------|--------------------|
| V | V | V | V | V | V |
| V | V | F | V | F | F |
| V | F | V | F | V | F |
| V | F | F | F | V | F |
| F | V | V | V | V | V |
| F | V | F | V | F | F |
| F | F | V | V | V | V |
| F | F | F | V | V | V |

### Exemple : loi de De Morgan ¬(p ∧ q) ↔ (¬p ∨ ¬q)

| p | q | p ∧ q | ¬(p ∧ q) | ¬p | ¬q | ¬p ∨ ¬q | Resultat ↔ |
|---|---|-------|----------|----|----|---------|------------|
| V | V | V | F | F | F | F | **V** |
| V | F | F | V | F | V | V | **V** |
| F | V | F | V | V | F | V | **V** |
| F | F | F | V | V | V | V | **V** |

Toute la colonne finale est V : c'est une **tautologie**.

---

## 5. Tautologies, contradictions, contingences

| Type | Definition | Exemple |
|------|-----------|---------|
| **Tautologie** | Vraie pour toute valuation | p ∨ ¬p (tiers exclu) |
| **Contradiction** | Fausse pour toute valuation | p ∧ ¬p |
| **Contingence** | Ni tautologie ni contradiction | p ∧ q |

### Tautologies fondamentales

| Nom | Formule |
|-----|---------|
| Tiers exclu | p ∨ ¬p |
| Non-contradiction | ¬(p ∧ ¬p) |
| Modus ponens | (p ∧ (p → q)) → q |
| Modus tollens | ((p → q) ∧ ¬q) → ¬p |
| Syllogisme hypothetique | ((p → q) ∧ (q → r)) → (p → r) |
| Contraposee | (p → q) ↔ (¬q → ¬p) |
| Exportation | ((p ∧ q) → r) ↔ (p → (q → r)) |

---

## 6. Equivalences logiques fondamentales

Deux formules A et B sont **logiquement equivalentes** (A ≡ B) si elles ont la meme table de verite.

### Lois de De Morgan
```
¬(p ∧ q)  ≡  ¬p ∨ ¬q
¬(p ∨ q)  ≡  ¬p ∧ ¬q
```

### Double negation
```
¬¬p  ≡  p
```

### Commutativite
```
p ∧ q  ≡  q ∧ p
p ∨ q  ≡  q ∨ p
```

### Associativite
```
(p ∧ q) ∧ r  ≡  p ∧ (q ∧ r)
(p ∨ q) ∨ r  ≡  p ∨ (q ∨ r)
```

### Distributivite
```
p ∧ (q ∨ r)  ≡  (p ∧ q) ∨ (p ∧ r)
p ∨ (q ∧ r)  ≡  (p ∨ q) ∧ (p ∨ r)
```

### Idempotence
```
p ∧ p  ≡  p
p ∨ p  ≡  p
```

### Absorption
```
p ∧ (p ∨ q)  ≡  p
p ∨ (p ∧ q)  ≡  p
```

### Element neutre et absorbant
```
p ∧ V  ≡  p       p ∧ F  ≡  F
p ∨ V  ≡  V       p ∨ F  ≡  p
```

### Complement
```
p ∧ ¬p  ≡  F
p ∨ ¬p  ≡  V
```

### Elimination de l'implication et de l'equivalence
```
p → q    ≡  ¬p ∨ q
p ↔ q    ≡  (p → q) ∧ (q → p)
p ↔ q    ≡  (p ∧ q) ∨ (¬p ∧ ¬q)
¬(p → q) ≡  p ∧ ¬q
```

### Contraposee
```
p → q  ≡  ¬q → ¬p
```

---

## 7. Satisfiabilite et consequence logique

### Definitions

| Concept | Definition |
|---------|-----------|
| **Satisfiable** | Il existe au moins une valuation rendant la formule vraie |
| **Valide** (= tautologie) | Toute valuation rend la formule vraie |
| **Insatisfiable** (= contradiction) | Aucune valuation ne la rend vraie |

### Lien fondamental
```
A est valide  ⟺  ¬A est insatisfiable
```

### Consequence logique

A1, A2, ..., An ⊨ B signifie : toute valuation rendant toutes les Ai vraies rend aussi B vraie.

```
A1, ..., An ⊨ B  ⟺  (A1 ∧ ... ∧ An) → B est une tautologie
```

### Exemple : modus ponens p, p → q ⊨ q

| p | q | p → q | p ∧ (p → q) | (p ∧ (p → q)) → q |
|---|---|-------|-------------|---------------------|
| V | V | V | V | **V** |
| V | F | F | F | V |
| F | V | V | F | V |
| F | F | V | F | V |

Tautologie confirmee.

---

## 8. Exemples resolus

### Simplifier ¬(p → q)

```
¬(p → q)
= ¬(¬p ∨ q)           (elimination de →)
= ¬¬p ∧ ¬q            (De Morgan)
= p ∧ ¬q              (double negation)
```

### Simplifier (p ∨ q) ∧ (p ∨ ¬q)

```
(p ∨ q) ∧ (p ∨ ¬q)
= p ∨ (q ∧ ¬q)        (distributivite)
= p ∨ F               (complement)
= p                    (element neutre)
```

### Verifier si (p → q) → (¬q → ¬p) est une tautologie

| p | q | p → q | ¬q | ¬p | ¬q → ¬p | Resultat → |
|---|---|-------|----|----|---------|------------|
| V | V | V | F | F | V | V |
| V | F | F | V | F | F | V |
| F | V | V | F | V | V | V |
| F | F | V | V | V | V | V |

Que des V : **tautologie** (c'est la contraposee).

---

## 9. Pieges classiques

| Piege | Erreur | Correction |
|-------|--------|------------|
| Implication avec premisse fausse | Croire que F → F = F | F → F = **V** |
| OU inclusif | Croire que V ∨ V = F | V ∨ V = **V** |
| Priorite de ¬ | Lire ¬p ∧ q comme ¬(p ∧ q) | C'est (¬p) ∧ q |
| De Morgan | ¬(p ∧ q) = ¬p ∧ ¬q | ¬(p ∧ q) = ¬p **∨** ¬q |
| Equivalence vs implication | Confondre p ↔ q et p → q | ↔ exige les deux sens |
