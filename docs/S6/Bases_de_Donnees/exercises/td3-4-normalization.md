---
title: "TD3-4 -- Dependances Fonctionnelles et Normalisation"
sidebar_position: 3
---

# TD3-4 -- Dependances Fonctionnelles et Normalisation

> Source : TD3_4.pdf, Hugo TD 3-4.pdf
> Fermetures, cles candidates, couverture minimale, decomposition 3NF et BCNF.

---

## Exercice 1 : Fermetures

### Enonce

R(A, B, C, D, E), F = { A -> B, B -> C, A -> D, D -> E }

**Q1 : Calculer {A}+**

| Etape | Resultat | DF appliquee | Ajout |
|-------|----------|-------------|-------|
| Init | {A} | -- | -- |
| 1 | {A} | A -> B | B |
| 2 | {A, B} | B -> C | C |
| 3 | {A, B, C} | A -> D | D |
| 4 | {A, B, C, D} | D -> E | E |
| **Final** | **{A, B, C, D, E}** | stable | -- |

{A}+ = {A, B, C, D, E} = tous les attributs. **A est une cle candidate.**

**Q2 : Calculer {B}+**

| Etape | Resultat | DF appliquee | Ajout |
|-------|----------|-------------|-------|
| Init | {B} | -- | -- |
| 1 | {B} | B -> C | C |
| **Final** | **{B, C}** | stable | -- |

{B}+ = {B, C}. B n'est PAS une super-cle.

**Q3 : A -> E est-elle impliquee par F ?**

E est dans {A}+ = {A, B, C, D, E}. **Oui**, A -> E est impliquee.

---

## Exercice 2 : Cles candidates

### Enonce

R(A, B, C, D), F = { A -> B, C -> D }

**Methode :**

1. Attributs jamais en partie droite : **A** et **C** (ils n'apparaissent qu'a gauche).
2. Calculer {A, C}+ :
   - A -> B : {A, B, C}
   - C -> D : {A, B, C, D} = tous les attributs
3. A seul : {A}+ = {A, B}. Pas tous les attributs.
4. C seul : {C}+ = {C, D}. Pas tous les attributs.
5. {A, C} est minimale.

**Cle candidate : {A, C}**

---

## Exercice 3 : Couverture minimale

### Enonce

F = { A -> BC, B -> C, AB -> D }

**Etape 1 : Decomposer**

```
A -> B
A -> C
B -> C
AB -> D
```

**Etape 2 : Reduire les parties gauches**

- AB -> D : tester A seul. {A}+ = A -> B -> C (avec A -> B, A -> C, B -> C). {A}+ = {A, B, C}. D pas dedans. A ne suffit pas.
- AB -> D : tester B seul. {B}+ = {B, C}. D pas dedans. B ne suffit pas.
- AB -> D reste inchange.

**Etape 3 : Supprimer les DF redondantes**

- A -> C : sans elle, {A}+ = A -> B (via A -> B), puis B -> C (via B -> C). Donc {A}+ inclut C. **A -> C est redondante.**

**Fmin = { A -> B, B -> C, AB -> D }**

---

## Exercice 4 : Decomposition en 3NF

### Enonce

R(A, B, C, D, E), F = { AB -> C, C -> D, D -> E, E -> A }

**Etape 1 : Couverture minimale**

Deja decomposee. Verifions les reductions :
- AB -> C : A seul ? {A}+ = {A} (E -> A boucle). Non. B seul ? {B}+ = {B}. Non. AB reste.

Fmin = { AB -> C, C -> D, D -> E, E -> A }

**Etape 2 : Creer les relations**

| Partie gauche | DF regroupees | Relation |
|---|---|---|
| AB | AB -> C | R1(**A**, **B**, C) |
| C | C -> D | R2(**C**, D) |
| D | D -> E | R3(**D**, E) |
| E | E -> A | R4(**E**, A) |

**Etape 3 : Verifier la cle**

{AB}+ = AB -> C -> D -> E -> A. Tous les attributs. R1 contient AB. OK.

**Resultat final : R1(A, B, C), R2(C, D), R3(D, E), R4(E, A)**

**Verification :** chaque relation est en 3NF. Les DF sont preservees. La jointure est sans perte.

---

## Exercice 5 : Decomposition en BCNF

### Enonce

R(A, B, C), F = { A -> B, B -> C }

**Cle candidate :** {A}+ = {A, B, C}. A est la cle.

**Verification BCNF :**
- A -> B : A est super-cle. OK.
- B -> C : B n'est PAS super-cle ({B}+ = {B, C}). **Violation BCNF.**

**Decomposition :**
1. DF violante : B -> C
2. {B}+ = {B, C}
3. R1 = {B, C} (cle : B)
4. R2 = {A, B} (cle : A)

**Resultat : R1(B, C) et R2(A, B)**

**Verification :**
- R1 : B -> C, B est super-cle. BCNF OK.
- R2 : A -> B, A est super-cle. BCNF OK.
- DF preservees : A -> B dans R2, B -> C dans R1. Tout est preserve.

---

## Exercice 6 : Identifier la forme normale

### Enonce

R(A, B, C, D), cle = {A, B}, DF = { AB -> CD, A -> C }

**1NF :** Pas d'attribut multivalues mentionne. Supposons 1NF. OK.

**2NF :** A -> C est une DP partielle (C depend d'une partie de la cle {A, B}). **Non 2NF.**

**Conclusion :** R est en **1NF** mais pas en 2NF.

**Decomposition en 2NF :**
- R1(**A**, C) : DF A -> C
- R2(**A**, **B**, D) : DF AB -> D

---

## Exercice 7 : Exercice complet

### Enonce

R(A, B, C, D, E, F), DF = { A -> B, BC -> D, D -> E, E -> F, CF -> A }

**1. Cles candidates**

Attributs jamais en partie droite : **C** (C n'apparait jamais a droite).

{A, C}+ : A -> B, BC -> D (B et C dans resultat), D -> E, E -> F. {A, C}+ = {A, B, C, D, E, F}. Super-cle.
- A seul ? {A}+ = {A, B}. Non.
- C seul ? {C}+ = {C}. Non.
- **{A, C} est cle candidate.**

Cherchons d'autres cles : {B, C} ? {B, C}+ = BC -> D -> E -> F. {B, C}+ = {B, C, D, E, F}. Pas A. Non.
{C, D}? {C, D}+ = D -> E -> F, CF -> A (F et C dans resultat), A -> B. {C, D}+ = {A, B, C, D, E, F}. Super-cle.
- D seul deja teste non. C seul non. **{C, D} est cle candidate.**

{C, E}? {C, E}+ = E -> F, CF -> A, A -> B, BC -> D. {C, E}+ = {A, B, C, D, E, F}. **{C, E} est cle candidate.**

{C, F}? {C, F}+ = CF -> A, A -> B, BC -> D, D -> E. {C, F}+ = {A, B, C, D, E, F}. **{C, F} est cle candidate.**

**Cles candidates : {A, C}, {C, D}, {C, E}, {C, F}**

**2. Forme normale**

Attributs premiers : A, C, D, E, F (tous sauf B).

Verification 2NF : {A, C} est une cle candidate. A -> B signifie que B (attribut non-cle) depend de A seul, qui est un **sous-ensemble strict** de la cle {A, C}. C'est une **dependance partielle**. Donc la relation n'est **pas en 2NF**.

**Conclusion : la relation est en 1NF seulement** (violation de la 2NF par la DP partielle A -> B).

---

## Points cles a retenir

- Toujours calculer les fermetures etape par etape en montrant le travail.
- Les attributs jamais en partie droite sont obligatoires dans toute cle.
- L'ordre de la couverture minimale est strict : decomposer -> reduire -> supprimer.
- La 3NF par synthese preserve toujours les DF.
- La BCNF peut perdre des DF : mentionner ce risque dans les exercices.
