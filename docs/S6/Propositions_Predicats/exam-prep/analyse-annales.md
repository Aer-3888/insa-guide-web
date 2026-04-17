---
title: "Analyse des annales -- Propositions et Predicats (2013-2025)"
sidebar_position: 2
---

# Analyse des annales -- Propositions et Predicats (2013-2025)

---

## 1. Vue d'ensemble des sujets

| Annee | Valuation | Resolution | Enigme | Modelisation | Programmation |
|-------|-----------|-----------|--------|-------------|---------------|
| 2025 | Oui | Oui | ? | ? | ? |
| 2024 | Oui | Oui (prop) | ? | Addition binaire | ? |
| 2023 | Oui | Oui (1er ordre, dragons) | Robots auto-reproducteurs | Addition binaire (clauses) | Axiome + modus ponens (OCaml) |
| 2022 | ? | ? | ? | ? | ? |
| 2021 | Oui (p1∧p2 ↔ p3∨¬p4) ∧ (p2→p3) | Tautologie + parite (1er ordre) | Liens internet | Mastermind (SAT) | Saturation modus ponens (OCaml) |
| 2019 | Oui (p1→(p2∨¬p3)) ∧ (p2↔p3) | Bebes/crocodiles + patients/docteurs | Voleurs de SRAM | Coloriage de graphe (SAT) | is_in (sous-formule) |
| 2018 | Oui | Resolution 1er ordre | ? | ? | ? |
| 2017 | Oui | Resolution 1er ordre | ? | ? | ? |
| 2016 | Oui | Resolution | ? | ? | ? |
| 2015 | Oui | Resolution | ? | ? | ? |
| 2014 | Oui | Resolution | ? | ? | ? |
| 2013 | Oui | Resolution | ? | ? | ? |

---

## 2. Questions recurrentes par theme

### Valuation (toujours present, 2 pts)

Format constant : on donne F, trouver v(F)=1 et v(F)=0.

Formules typiques :
- 2021 : ((p1 ∧ p2) ↔ (p3 ∨ ¬p4)) ∧ (p2 → p3)
- 2023 : ((p1 ∨ p3) ∧ (p3 → p4)) → (p2 → p3)
- 2019 : (p1 → (p2 ∨ ¬p3)) ∧ (p2 ↔ p3)

**Methode universelle :**
- Pour v(F) = 1 : choisir les variables qui simplifient le plus de sous-formules (rendre un antecedent faux, un element neutre).
- Pour v(F) = 0 : choisir les variables qui brisent la formule (rendre un ∧ faux en rendant un membre faux).

### Resolution (toujours present, 7-8 pts)

**Sous-question type 1 :** Prouver une tautologie par resolution.
- 2021 : (∀x P(x) ∧ ¬∃x ¬P(x)) → ∀x P(x)
- 2023 : (∀x P(x)) → P(a)

**Sous-question type 2 :** Prouver une consequence logique (1er ordre).
- 2021 : Parite -- H = {P(0), ∀x(P(x)→P(s(s(x))))} ⊨ P(s(s(s(s(0)))))
- 2019 : Bebes/crocodiles -- {∀x(BB→¬L), ∀x(DC→R), ∀x(¬L→¬R)} ⊨ ¬∃x(BB∧DC)
- 2019 : Patients/docteurs -- {∃x(P∧∀y(D→A)), ∀x(P→∀y(C→¬A))} ⊨ ∀x(D→¬C)
- 2023 : Dragons -- Hypotheses sur Dragon, Sleep, Hunt, Hungry, Tired

**Sous-question type 3 :** Trouver une interpretation / contre-exemple.
- 2021 : Trouver I rendant H vrai mais ¬P(s(0)) faux
- Requiert de comprendre les limites d'un ensemble d'hypotheses

### Enigme logique (80% des annales)

**Type 1 : Menteurs/veridiques**
- 2019 : Ed, Fred, Ted (vol de SRAM). Innocents disent vrai, coupables mentent.

**Type 2 : Liens/descriptions (une seule vraie)**
- 2021 : 3 liens, 1 donne la solution, 1 faux, 1 piege. Une seule description vraie.

**Type 3 : Robots auto-reproducteurs**
- 2023 : Systeme de nommage avec regles Q et R, trouver des auto-reproducteurs.

**Methode :** Raisonnement par cas. Supposer chaque possibilite et verifier la coherence.

### Modelisation SAT (70% des annales recentes)

**Type 1 : Coloriage de graphe** (2019)
- Variables : xi,c = "sommet i a la couleur c"
- Contraintes : au moins une couleur par sommet, au plus une, voisins differents

**Type 2 : Mastermind** (2021)
- Variables : di,v = "chiffre i a la valeur v"
- Contraintes : valeur unique par position, coherence avec les indices

**Type 3 : Addition binaire** (2023-2024)
- Variables : ai, bi, si, ci (bits des operandes, de la somme, retenue)
- Contraintes : additionneur par position

### Programmation OCaml (70% des annales recentes)

**Fonctions typiques demandees :**
- `is_axiom : formula -> bool` -- tester si une formule est un axiome
- `modus_ponens : prop * prop -> prop list` -- appliquer modus ponens
- `saturation : prop list -> prop list` -- saturer par modus ponens
- `check : formula list -> bool` -- verifier une demonstration
- `is_in : formula -> formula -> bool` -- sous-formule

**Type formula en OCaml :**
```ocaml
type formula =
  | Atom of string
  | Not of formula
  | Imp of formula * formula
```

---

## 3. Exercices types resolus (tire des annales)

### Type : Enigme des menteurs (DS 2019)

**Enonce :** Ed, Fred, Ted accuses de vol. Innocent dit vrai, coupable ment.
- Ed : "Fred a vole et Ted est innocent"
- Fred : "Si Ed est coupable, alors Ted l'est aussi"
- Ted : "Je suis innocent et au moins un des deux autres est coupable"

**Solution informelle :**

Variables : e = "Ed coupable", f = "Fred coupable", t = "Ted coupable"

Declarations (ce que chaque personne dit) :
- Ed dit : f ∧ ¬t
- Fred dit : e → t
- Ted dit : ¬t ∧ (e ∨ f)

Regles : un innocent dit vrai, un coupable ment (sa declaration est fausse).

**Cas 1 :** Ed innocent (e = F). Alors Ed dit vrai : f = V et t = F.
- Fred coupable (f = V), donc Fred ment : ¬(e → t) = e ∧ ¬t. Avec e = F : F ∧ V = F.
- Fred ment, sa declaration est fausse. Verifions : e → t = F → F = V, sa negation = F.
- Hmm, Fred dit e → t = V (premisse fausse donc V). Si Fred est coupable, il ment : sa declaration serait fausse. Mais e → t = F → F = V, qui est vrai. Contradiction : Fred dit vrai mais est coupable.

**Cas 2 :** Ed coupable (e = V). Alors Ed ment : ¬(f ∧ ¬t) = ¬f ∨ t.

Sous-cas 2a : Ted innocent (t = F). Ted dit vrai : ¬t ∧ (e ∨ f) = V ∧ (V ∨ f) = V. OK.
- De Ed : ¬f ∨ t = ¬f ∨ F = ¬f, donc f = F (Fred innocent).
- Fred innocent dit vrai : e → t = V → F = F. Mais Fred dit vrai ! Contradiction.

Sous-cas 2b : Ted coupable (t = V). Ted ment : ¬(¬t ∧ (e ∨ f)) = t ∨ ¬(e ∨ f) = V ∨ ... = V. La negation de la declaration de Ted est t ∨ (¬e ∧ ¬f). Avec t = V, c'est V. OK Ted ment.
- De Ed : ¬f ∨ t = ¬f ∨ V = V. Pas de contrainte sur f.
- Fred : sa declaration est e → t = V → V = V.
  - Si Fred innocent (f = F) : dit vrai, e → t = V. OK.
  - Si Fred coupable (f = V) : ment, e → t = V devrait etre faux. Contradiction.

Donc f = F.

**Reponse :** Ed coupable, Fred innocent, Ted coupable.

### Type : Valuation (DS 2021)

**Enonce :** F = ((p1 ∧ p2) ↔ (p3 ∨ ¬p4)) ∧ (p2 → p3)

**v(F) = 1 :**
Prenons p2 = F. Alors p2 → p3 = V (quel que soit p3).
Avec p2 = F : p1 ∧ p2 = F.
Il faut F ↔ (p3 ∨ ¬p4) = V, donc p3 ∨ ¬p4 = F, donc p3 = F et p4 = V.
Reponse : p1 = V, p2 = F, p3 = F, p4 = V.

**v(F) = 0 :**
Prenons p2 = V, p3 = F. Alors p2 → p3 = V → F = F.
F = ... ∧ F = F.
Reponse : p1 = V, p2 = V, p3 = F, p4 = V.

### Type : Resolution premier ordre avec parite (DS 2021)

**Enonce :** H = {P(0), ∀x(P(x) → P(s(s(x))))}. Prouver P(s(s(s(s(0))))).

**Clauses :** C1 = {P(0)}, C2 = {¬P(x), P(s(s(x)))}. Negation : C3 = {¬P(s(s(s(s(0)))))}.

**Resolution :**
```
Res(C2, C1) σ={x←0}        :  C4 = {P(s(s(0)))}
Res(C2, C4) σ={x←s(s(0))}  :  C5 = {P(s(s(s(s(0)))))}
Res(C5, C3)                  :  C6 = {}  clause vide
```

### Type : Modelisation SAT -- coloriage de graphe (DS 2019)

**Variables :** Pour chaque sommet i et couleur c, on definit xi,c = "sommet i colore en c".

Avec 6 sommets et 3 couleurs : 18 variables.

**Contraintes :**

1. Chaque sommet a au moins une couleur :
```
xi,1 ∨ xi,2 ∨ xi,3     pour chaque sommet i
```

2. Chaque sommet a au plus une couleur :
```
¬xi,c ∨ ¬xi,c'         pour chaque sommet i et chaque paire c ≠ c'
```

3. Deux voisins n'ont pas la meme couleur :
```
¬xi,c ∨ ¬xj,c          pour chaque arete (i,j) et chaque couleur c
```

**Lecture de la solution :** Le solveur SAT donne une valuation. Pour chaque sommet i, la couleur c telle que xi,c = V est la couleur de i.

---

## 4. Themes absents ou rares

- Deduction naturelle formelle : rarement un exercice a part entiere en DS (plus frequent en TD)
- Calcul des sequents : pas observe dans les annales analysees
- Theoremes de completude/decidabilite : pas de question theorique directe
- DPLL : mentionne dans le code mais pas comme exercice de preuve

---

## 5. Conseils prioritaires

1. **Maitriser la resolution au premier ordre** : c'est le coeur du DS (7-8 pts).
2. **Savoir modeliser en SAT** : tendance forte dans les annales recentes.
3. **Traduire francais → logique** : ∀ avec →, ∃ avec ∧ (pieges constants).
4. **Ne pas negliger la valuation** : 2 points faciles si methode maitrisee.
5. **Enigmes** : entrainement au raisonnement par cas, pas besoin de formalisme lourd.
6. **Programmation OCaml** : connaitre le pattern matching sur les types formula.
