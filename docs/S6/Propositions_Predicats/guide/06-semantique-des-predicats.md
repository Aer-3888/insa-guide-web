---
title: "Chapitre 6 -- Semantique des predicats"
sidebar_position: 6
---

# Chapitre 6 -- Semantique des predicats

> Interpretations, modeles, validite, satisfiabilite en logique du premier ordre.

---

## 1. Interpretation (structure)

Une **interpretation** I donne un sens concret a tous les symboles d'une formule :

1. **Domaine** D : l'ensemble des objets
2. **Constantes** : chaque constante associee a un element de D
3. **Fonctions** : chaque symbole de fonction associe a une fonction D^n → D
4. **Predicats** : chaque symbole de predicat associe a une relation sur D (sous-ensemble de D^n)
5. **Variables libres** : chaque variable libre associee a un element de D

---

## 2. Evaluation d'une formule

### Formule atomique

P(t1, ..., tn) est vraie dans I si le n-uplet (val(t1), ..., val(tn)) appartient a la relation associee a P.

### Connecteurs logiques

Les connecteurs (¬, ∧, ∨, →, ↔) s'evaluent comme en logique propositionnelle.

### Quantificateurs

- **∀x, F(x)** est vraie dans I si F(d) est vraie pour **tout** d ∈ D.
- **∃x, F(x)** est vraie dans I si F(d) est vraie pour **au moins un** d ∈ D.

---

## 3. Exemple detaille

### Formule : ∀x, (P(x) → Q(x, a))

**Interpretation I1 :**
- D = {1, 2, 3}
- a = 1
- P = {2} (P(x) vrai si x est pair)
- Q = {(1,1), (1,2), (1,3), (2,2), (2,3), (3,3)} (Q(x,y) vrai si x ≤ y)

**Evaluation :**

| x | P(x) | Q(x, 1) | P(x) → Q(x, 1) |
|---|------|---------|------------------|
| 1 | F | V | V |
| 2 | **V** | **F** | **F** |
| 3 | F | F | V |

∀x, (P(x) → Q(x, a)) = V ∧ F ∧ V = **F**

La formule est **fausse** dans I1 (a cause de x=2 : P(2) est vrai mais Q(2,1) est faux).

**Interpretation I2 :**
- D = {1, 2, 3}
- a = 3
- P = {2}
- Q = meme que I1

| x | P(x) | Q(x, 3) | P(x) → Q(x, 3) |
|---|------|---------|------------------|
| 1 | F | V | V |
| 2 | V | V | V |
| 3 | F | V | V |

∀x, (P(x) → Q(x, a)) = V ∧ V ∧ V = **V**

La formule est **vraie** dans I2.

---

## 4. Satisfiabilite, validite, modele

### Definitions

| Concept | Definition |
|---------|-----------|
| **Satisfiable** | Il existe au moins une interpretation qui rend la formule vraie |
| **Valide** | Toute interpretation rend la formule vraie |
| **Insatisfiable** | Aucune interpretation ne rend la formule vraie |
| **Modele** | Une interpretation qui rend la formule (ou l'ensemble de formules) vraie |

### Proprietes

```
F valide       ⟺  ¬F insatisfiable
F insatisfiable ⟺  ¬F valide
```

### Consequence semantique

Γ ⊨ F signifie : tout modele de Γ est aussi modele de F.

Autrement dit : dans toute interpretation ou toutes les formules de Γ sont vraies, F est aussi vraie.

---

## 5. Validite vs satisfiabilite : exemples

### Formules valides (vraies dans toute interpretation)

```
∀x, P(x) → ∃x, P(x)         (si tout a P, alors au moins un a P)
∀x, (P(x) → P(x))           (toute chose implique elle-meme)
¬∀x, P(x) ↔ ∃x, ¬P(x)      (De Morgan generalise)
```

### Formules satisfiables mais non valides

```
∀x, P(x)                     (vrai si tous les elements ont P, faux sinon)
∃x, P(x)                     (vrai s'il existe un element avec P)
```

### Formules insatisfiables

```
∀x, P(x) ∧ ∃x, ¬P(x)       (tout a P ET il existe un sans P : contradiction)
∀x, (P(x) ∧ ¬P(x))          (tout est P et non-P : contradiction)
```

---

## 6. Forme prenexe

### Definition

Une formule est en **forme prenexe** si tous les quantificateurs sont au debut :

```
Q1 x1, Q2 x2, ..., Qn xn, M(x1, ..., xn)
```

ou chaque Qi est ∀ ou ∃, et M (la **matrice**) ne contient aucun quantificateur.

### Methode de mise en forme prenexe

1. Eliminer ↔ et →
2. Descendre les negations (De Morgan + negation des quantificateurs)
3. **Renommer les variables liees** (eviter les conflits)
4. **Sortir les quantificateurs** vers le debut

### Exemple

Mettre en forme prenexe : (∀x, P(x)) → (∃x, Q(x))

**Etape 1 :** Eliminer →
```
¬(∀x, P(x)) ∨ (∃x, Q(x))
```

**Etape 2 :** Descendre la negation
```
(∃x, ¬P(x)) ∨ (∃x, Q(x))
```

**Etape 3 :** Renommer (les deux x sont differents)
```
(∃x, ¬P(x)) ∨ (∃y, Q(y))
```

**Etape 4 :** Sortir les quantificateurs
```
∃x, ∃y, (¬P(x) ∨ Q(y))
```

---

## 7. Interpretation et satisfiabilite : exercice type DS

### Enonce type

Soit la formule F = ((p1 ∧ p2) ↔ (p3 ∨ ¬p4)) ∧ (p2 → p3).

**Q1 :** Trouver une valuation v telle que v(F) = 1.

**Methode :** Choisir des valeurs qui satisfont chaque partie.
- Prenons p2 = F. Alors p2 → p3 = V (premisse fausse).
- Avec p2 = F : p1 ∧ p2 = F.
- Il faut F ↔ (p3 ∨ ¬p4) = V, donc p3 ∨ ¬p4 = F.
- Donc p3 = F et p4 = V.
- p1 peut etre quelconque.

**Reponse :** v(p1) = V, v(p2) = F, v(p3) = F, v(p4) = V donne v(F) = 1.

**Q2 :** Trouver une valuation v telle que v(F) = 0.

**Methode :** Il suffit qu'une partie soit fausse.
- Prenons p2 = V, p3 = F. Alors p2 → p3 = F.
- Donc F = ... ∧ F = F.

**Reponse :** v(p1) = V, v(p2) = V, v(p3) = F, v(p4) = V donne v(F) = 0.

---

## 8. Recapitulatif

- Une **interpretation** assigne un sens a chaque symbole d'une formule.
- ∀ s'evalue comme un ET sur le domaine, ∃ comme un OU.
- **Valide** = vrai dans toute interpretation. **Satisfiable** = vrai dans au moins une.
- Un **modele** est une interpretation qui rend la formule vraie.
- F valide ⟺ ¬F insatisfiable.
- La **forme prenexe** place tous les quantificateurs en tete.
- La mise en forme prenexe exige le renommage des variables liees pour eviter les conflits.
