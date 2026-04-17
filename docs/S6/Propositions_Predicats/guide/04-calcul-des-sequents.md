---
title: "Chapitre 4 -- Calcul des sequents"
sidebar_position: 4
---

# Chapitre 4 -- Calcul des sequents

> Sequents, regles structurelles, regles logiques, coupure (cut), lien avec la deduction naturelle.

---

## 1. Qu'est-ce qu'un sequent ?

Un **sequent** est une expression de la forme :

```
Γ ⊢ Δ
```

ou :
- **Γ** (Gamma) est un multiensemble de formules (les hypotheses / antecedents)
- **Δ** (Delta) est un multiensemble de formules (les conclusions / succedents)
- Le symbole **⊢** (turnstile) separe hypotheses et conclusions

### Interpretation

Le sequent Γ ⊢ Δ signifie :

```
Si toutes les formules de Γ sont vraies,
alors au moins une formule de Δ est vraie.
```

Formellement : (A1 ∧ A2 ∧ ... ∧ An) → (B1 ∨ B2 ∨ ... ∨ Bm)

### Cas particuliers

| Sequent | Signification |
|---------|---------------|
| A ⊢ B | Si A alors B |
| ⊢ A | A est un theoreme (valide sans hypothese) |
| A ⊢ | A est contradictoire |
| Γ ⊢ A | A est consequence logique de Γ |

---

## 2. Axiome et regles structurelles

### Axiome (identite)

```
------  [Ax]
A ⊢ A
```

Toute formule est consequence d'elle-meme.

### Affaiblissement (weakening)

On peut ajouter des formules sans changer la validite.

**A gauche :**
```
    Γ ⊢ Δ
    ----------  [W-L]
    Γ, A ⊢ Δ
```

**A droite :**
```
    Γ ⊢ Δ
    ----------  [W-R]
    Γ ⊢ Δ, A
```

### Contraction

Si une formule apparait en double, on peut la fusionner.

**A gauche :**
```
    Γ, A, A ⊢ Δ
    -------------  [C-L]
    Γ, A ⊢ Δ
```

**A droite :**
```
    Γ ⊢ Δ, A, A
    -------------  [C-R]
    Γ ⊢ Δ, A
```

### Echange (permutation)

L'ordre des formules n'importe pas (multiensemble).

---

## 3. Regles logiques a gauche et a droite

Dans le calcul des sequents, chaque connecteur a une regle **a gauche** (dans les hypotheses) et une regle **a droite** (dans la conclusion).

### 3.1 Negation (¬)

**¬ a droite :**
```
    Γ, A ⊢ Δ
    ----------  [¬-R]
    Γ ⊢ Δ, ¬A
```
Pour prouver ¬A, on ajoute A aux hypotheses.

**¬ a gauche :**
```
    Γ ⊢ Δ, A
    ----------  [¬-L]
    Γ, ¬A ⊢ Δ
```
Si ¬A est une hypothese, on doit prouver A.

### 3.2 Conjonction (∧)

**∧ a droite :** Il faut prouver les deux cotes.
```
    Γ ⊢ Δ, A      Γ ⊢ Δ, B
    -------------------------  [∧-R]
         Γ ⊢ Δ, A ∧ B
```

**∧ a gauche :** On dispose des deux hypotheses.
```
    Γ, A, B ⊢ Δ
    -------------  [∧-L]
    Γ, A ∧ B ⊢ Δ
```

### 3.3 Disjonction (∨)

**∨ a droite :** On prouve un seul cote suffit.
```
    Γ ⊢ Δ, A, B
    -------------  [∨-R]
    Γ ⊢ Δ, A ∨ B
```

**∨ a gauche :** Raisonnement par cas.
```
    Γ, A ⊢ Δ      Γ, B ⊢ Δ
    -------------------------  [∨-L]
         Γ, A ∨ B ⊢ Δ
```

### 3.4 Implication (→)

**→ a droite :**
```
    Γ, A ⊢ Δ, B
    -------------  [→-R]
    Γ ⊢ Δ, A → B
```

**→ a gauche :**
```
    Γ ⊢ Δ, A      Γ, B ⊢ Δ
    -------------------------  [→-L]
        Γ, A → B ⊢ Δ
```

---

## 4. La regle de coupure (Cut)

```
    Γ ⊢ Δ, A      Γ, A ⊢ Δ
    -------------------------  [Cut]
            Γ ⊢ Δ
```

La formule A sert de "lemme intermediaire" : on la prouve d'un cote, on l'utilise de l'autre. Elle disparait du sequent final.

### Theoreme d'elimination de la coupure (Hauptsatz de Gentzen)

> Toute preuve utilisant la regle de coupure peut etre transformee en une preuve sans coupure.

Consequences :
- La **propriete de la sous-formule** : dans une preuve sans coupure, toute formule apparaissant est une sous-formule de la conclusion.
- Cela garantit que la recherche de preuve est **structuree** et peut etre automatisee.
- C'est la base des **prouveurs automatiques**.

---

## 5. Lien avec la deduction naturelle

| Deduction naturelle | Calcul des sequents |
|--------------------|---------------------|
| Regles d'intro/elim pour chaque connecteur | Regles gauche/droite pour chaque connecteur |
| Hypotheses temporaires (crochets) | Formules a gauche du ⊢ |
| Modus ponens (→-E) | →-L |
| Preuve sous hypothese (→-I) | →-R |
| ∨-E (raisonnement par cas) | ∨-L |

Le calcul des sequents est plus **symetrique** que la deduction naturelle : chaque connecteur a exactement une regle a gauche et une a droite.

---

## 6. Exemple de preuve dans le calcul des sequents

### Prouver ⊢ p → p

```
         ------  [Ax]
         p ⊢ p
         ----------  [→-R]
         ⊢ p → p
```

### Prouver p ∧ q ⊢ q ∧ p

```
    -----------  [Ax]      -----------  [Ax]
    p, q ⊢ q              p, q ⊢ p
    ----------  [∧-L]     ----------  [∧-L]
    p ∧ q ⊢ q             p ∧ q ⊢ p
    ----------------------------------  [∧-R]
            p ∧ q ⊢ q ∧ p
```

### Prouver ⊢ ¬¬p → p (classique)

```
              ------  [Ax]
              p ⊢ p
              ---------  [¬-R]
              ⊢ p, ¬p
              -----------  [¬-L]
              ¬¬p ⊢ p
              ------------  [→-R]
              ⊢ ¬¬p → p
```

---

## 7. Recapitulatif des regles

### Regles structurelles

| Regle | Description |
|-------|-------------|
| Axiome | A ⊢ A |
| Affaiblissement | Ajouter des formules |
| Contraction | Fusionner les doublons |
| Echange | Permuter l'ordre |
| Coupure (Cut) | Utiliser un lemme intermediaire |

### Regles logiques

| Connecteur | A gauche (-L) | A droite (-R) |
|-----------|---------------|---------------|
| ¬ | Γ ⊢ Δ, A / Γ, ¬A ⊢ Δ | Γ, A ⊢ Δ / Γ ⊢ Δ, ¬A |
| ∧ | Γ, A, B ⊢ Δ / Γ, A∧B ⊢ Δ | Γ ⊢ Δ,A et Γ ⊢ Δ,B / Γ ⊢ Δ,A∧B |
| ∨ | Γ,A ⊢ Δ et Γ,B ⊢ Δ / Γ,A∨B ⊢ Δ | Γ ⊢ Δ,A,B / Γ ⊢ Δ,A∨B |
| → | Γ ⊢ Δ,A et Γ,B ⊢ Δ / Γ,A→B ⊢ Δ | Γ,A ⊢ Δ,B / Γ ⊢ Δ,A→B |
