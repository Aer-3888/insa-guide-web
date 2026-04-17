---
title: "Chapitre 7 -- Unification et resolution"
sidebar_position: 7
---

# Chapitre 7 -- Unification et resolution

> Algorithme d'unification, principe de resolution, skolemisation, forme clausale.

---

## PARTIE A : Resolution propositionnelle

---

## 1. La resolvante

### Principe

Deux clauses contenant un litteral et sa negation :
- C1 : A ∨ p
- C2 : B ∨ ¬p

**Resolvante :** Res(C1, C2) = A ∨ B

On supprime p et ¬p, et on fusionne le reste.

### La clause vide

La **clause vide** (notee □, {}, ou ⊥) signifie **contradiction**. On l'obtient en resolvant deux clauses unitaires complementaires :

```
C1 = {p}     C2 = {¬p}
Res(C1, C2) = {}  (clause vide)
```

### Exemples

```
C1 = {p, q}      C2 = {¬p, r}
Res sur p = {q, r}

C1 = {p, q, r}   C2 = {¬p, q, s}
Res sur p = {q, r, s}    (q apparait une seule fois)

C1 = {p, q}      C2 = {¬p, ¬q}
Res sur p = {q, ¬q}      (tautologie, a ignorer)
```

### Regles critiques

- Resoudre sur **un seul** litteral a la fois
- Ignorer les resolvantes tautologiques (contenant p et ¬p)
- Eliminer les doublons dans une clause (c'est un ensemble)

---

## 2. Prouver l'insatisfiabilite

### Algorithme

1. Prendre un ensemble de clauses S = {C1, ..., Cn}
2. Choisir deux clauses avec un litteral complementaire
3. Calculer la resolvante R
4. Si R = clause vide → S est **insatisfiable**. STOP.
5. Si R est tautologie ou deja dans S → ignorer
6. Sinon, ajouter R a S et recommencer
7. Si plus de nouvelle resolvante possible → S est **satisfiable**

### Completude

La clause vide est derivable par resolution si et seulement si S est insatisfiable. La resolution est **correcte et complete**.

---

## 3. Prouver une tautologie par refutation

Pour prouver que F est une tautologie :
1. **Nier** F : calculer ¬F
2. Mettre ¬F en **FNC** (ensemble de clauses)
3. Appliquer la resolution
4. Clause vide → ¬F insatisfiable → F est une tautologie

### Exemple : prouver (p → q) → (¬q → ¬p)

**Etape 1 :** Nier : ¬((p → q) → (¬q → ¬p))

**Etape 2 :** Simplifier :
```
= (p → q) ∧ ¬(¬q → ¬p)
= (p → q) ∧ ¬q ∧ ¬¬p
= (¬p ∨ q) ∧ ¬q ∧ p
```

**Etape 3 :** Clauses :
```
C1 = {¬p, q}
C2 = {¬q}
C3 = {p}
```

**Etape 4 :** Resolution :
```
Res(C1, C2) sur q = {¬p}     → C4
Res(C4, C3) sur p = {}        → clause vide !
```

F est une **tautologie**. CQFD.

---

## 4. Prouver une consequence logique

Pour prouver A1, ..., An ⊨ B :
1. Prendre les clauses de A1, ..., An **et** de ¬B
2. Appliquer la resolution
3. Clause vide → B est consequence logique

### Exemple : {p → q, q → r} ⊨ p → r

Premisses en clauses :
```
p → q  →  C1 = {¬p, q}
q → r  →  C2 = {¬q, r}
```

Negation de la conclusion :
```
¬(p → r) = p ∧ ¬r  →  C3 = {p},  C4 = {¬r}
```

Resolution :
```
Res(C1, C3) sur p = {q}       → C5
Res(C2, C5) sur q = {r}       → C6
Res(C6, C4) sur r = {}        → clause vide !
```

Consequence logique prouvee (syllogisme hypothetique).

---

## PARTIE B : Skolemisation et forme clausale

---

## 5. Skolemisation

Pour appliquer la resolution au premier ordre, on doit eliminer les quantificateurs existentiels.

### Regles

1. Si ∃x n'est precede d'aucun ∀ : remplacer x par une **constante de Skolem** (nouvelle constante c).
```
∃x, P(x)  →  P(c)
```

2. Si ∃x est precede de ∀y1, ∀y2, ... : remplacer x par une **fonction de Skolem** f(y1, y2, ...).
```
∀y, ∃x, P(x, y)  →  ∀y, P(f(y), y)
```

### Exemple

```
∀x, ∃y, ∀z, ∃w, P(x, y, z, w)
→ y depend de x : y ← f(x)
→ w depend de x et z : w ← g(x, z)
→ ∀x, ∀z, P(x, f(x), z, g(x, z))
```

**Important :** La skolemisation ne preserve pas l'equivalence logique, mais preserve la **satisfiabilite**. C'est suffisant pour la resolution.

---

## 6. Forme clausale du premier ordre

### Procedure complete (8 etapes)

1. Eliminer ↔ et →
2. Descendre les negations (De Morgan + negation des quantificateurs)
3. Renommer les variables liees
4. Mettre en forme prenexe
5. **Skolemiser** (eliminer les ∃)
6. Supprimer les ∀ (implicites)
7. Mettre la matrice en FNC
8. Ecrire les clauses

### Exemple

Formule : ∀x, (P(x) → ∃y, Q(x, y))

1. Eliminer → : ∀x, (¬P(x) ∨ ∃y, Q(x, y))
2. Rien a descendre
3. Pas de conflit
4. Forme prenexe : ∀x, ∃y, (¬P(x) ∨ Q(x, y))
5. Skolemiser (y depend de x) : ∀x, (¬P(x) ∨ Q(x, f(x)))
6. Supprimer ∀ : ¬P(x) ∨ Q(x, f(x))
7-8. Clause : {¬P(x), Q(x, f(x))}

---

## PARTIE C : Unification

---

## 7. Substitutions

### Definition

Une substitution est un ensemble de remplacements : σ = {x ← t1, y ← t2, ...}

### Exemples

| Expression | Substitution | Resultat |
|-----------|-------------|---------|
| P(x, y) | {x ← a, y ← b} | P(a, b) |
| f(x, g(y)) | {x ← h(z), y ← a} | f(h(z), g(a)) |
| P(x, x) | {x ← f(a)} | P(f(a), f(a)) |

---

## 8. Unificateur et MGU

### Unificateur

Un **unificateur** de E1 et E2 est une substitution σ telle que E1σ = E2σ.

### Unificateur le Plus General (MGU)

Le **MGU** fait le minimum de remplacements necessaires. Si E1 et E2 sont unifiables, le MGU existe et est unique (a renommage pres).

---

## 9. Algorithme d'unification

```
UNIFIER(E1, E2):
  Si E1 = E2 : retourner {}
  Si E1 est une variable x :
    Si x ∈ E2 : ECHEC (test d'occurrence)
    Sinon : retourner {x ← E2}
  Si E2 est une variable x :
    Si x ∈ E1 : ECHEC (test d'occurrence)
    Sinon : retourner {x ← E1}
  Si E1 = f(s1,...,sn) et E2 = f(t1,...,tn) :
    σ ← {}
    Pour i = 1 a n :
      σi ← UNIFIER(si·σ, ti·σ)
      Si σi = ECHEC : retourner ECHEC
      σ ← σ ∘ σi
    Retourner σ
  Sinon : ECHEC
```

### Test d'occurrence (occur check)

On ne peut **jamais** substituer x par un terme contenant x (evite les termes infinis).

```
Unifier x et f(x) → ECHEC (x ∈ f(x))
```

---

## 10. Exemples d'unification resolus

### Exemple 1 : P(x, f(y)) et P(a, f(b))

```
1. Meme predicat P, arite 2
2. Unifier x et a → σ1 = {x ← a}
3. Appliquer σ1 : f(y) reste f(y), f(b) reste f(b)
4. Unifier f(y) et f(b) → unifier y et b → σ2 = {y ← b}
MGU = {x ← a, y ← b}
```

### Exemple 2 : P(x, y) et P(f(a), g(x))

```
1. Unifier x et f(a) → σ1 = {x ← f(a)}
2. Appliquer σ1 : y reste y, g(x) devient g(f(a))
3. Unifier y et g(f(a)) → σ2 = {y ← g(f(a))}
MGU = {x ← f(a), y ← g(f(a))}
```

### Exemple 3 : P(a, x) et P(b, c) → ECHEC

```
1. Unifier a et b → constantes differentes → ECHEC
```

### Exemple 4 : P(x, x) et P(y, f(y)) → ECHEC

```
1. Unifier x et y → σ1 = {x ← y}
2. Appliquer : x devient y, f(y) reste f(y)
3. Unifier y et f(y) → test d'occurrence : y ∈ f(y) → ECHEC
```

### Exemple 5 : P(x, x) et P(a, b) → ECHEC

```
1. Unifier x et a → σ1 = {x ← a}
2. Appliquer : x devient a, b reste b
3. Unifier a et b → constantes differentes → ECHEC
```

### Exemple 6 : P(f(x), g(y, a)) et P(f(f(b)), g(f(b), z))

```
1. Unifier f(x) et f(f(b)) → x et f(b) → σ1 = {x ← f(b)}
2. Unifier g(y, a) et g(f(b), z)
   - y et f(b) → σ2 = {y ← f(b)}
   - a et z → σ3 = {z ← a}
MGU = {x ← f(b), y ← f(b), z ← a}
```

---

## 11. Resolution au premier ordre

### Principe

Pour deux clauses C1 (contenant P(s1,...,sn)) et C2 (contenant ¬P(t1,...,tn)) :

Si P(s1,...,sn) et P(t1,...,tn) sont **unifiables** avec le MGU σ :

```
Res(C1, C2) = (C1 \ {P(...)} ∪ C2 \ {¬P(...)})σ
```

Le MGU s'applique a **toute** la resolvante.

### Exemple : Socrate est mortel

Premisses :
- A1 : ∀x, (Humain(x) → Mortel(x)) → C1 = {¬Humain(x), Mortel(x)}
- A2 : Humain(Socrate) → C2 = {Humain(Socrate)}

Negation de la conclusion :
- ¬(∃x, Mortel(x)) = ∀x, ¬Mortel(x) → C3 = {¬Mortel(y)}

Resolution :
```
C1 et C2 : unifier Humain(x) et Humain(Socrate) → σ = {x ← Socrate}
C4 = {Mortel(Socrate)}

C4 et C3 : unifier Mortel(Socrate) et Mortel(y) → σ = {y ← Socrate}
C5 = {}  (clause vide)
```

Socrate est bien mortel.

### Exemple : DS 2019 -- les bebes et les crocodiles

Premisses :
```
∀x, (BB(x) → ¬L(x))        C1 = {¬BB(x), ¬L(x)}
∀x, (DC(x) → R(x))          C2 = {¬DC(x), R(x)}
∀x, (¬L(x) → ¬R(x))        C3 = {L(x), ¬R(x)}
```

Conclusion a prouver : ¬(∃x, (BB(x) ∧ DC(x)))

Negation : ∃x, (BB(x) ∧ DC(x)) → C4 = {BB(a)}, C5 = {DC(a)}

Resolution :
```
Res(C1, C4) sur BB : σ={x←a}  →  C6 = {¬L(a)}
Res(C3, C6) sur L : σ={x←a}   →  C7 = {¬R(a)}
Res(C2, C5) sur DC : σ={x←a}  →  C8 = {R(a)}
Res(C7, C8) sur R               →  C9 = {}  clause vide !
```

---

## 12. Strategies de resolution

| Strategie | Description |
|-----------|-------------|
| Resolution unitaire | Privilegier les clauses a 1 litteral |
| Resolution lineaire | Toujours resoudre avec la derniere resolvante |
| Ensemble de support | Resoudre en impliquant toujours la negation de la conclusion |

**Conseil DS :** Commencer par les clauses unitaires, puis les plus courtes.

---

## 13. Pieges classiques

| Piege | Erreur | Correction |
|-------|--------|------------|
| Oublier de nier | Resoudre directement sans nier | **Nier** la formule d'abord |
| Resoudre sur 2 litteraux | Supprimer p et q en meme temps | Un seul litteral a la fois |
| Oublier le test d'occurrence | {x ← f(x)} accepte | ECHEC (terme infini) |
| Ne pas appliquer σ aux termes restants | Continuer sans appliquer la substitution | Appliquer σ **avant** de continuer |
| Oublier σ sur la resolvante | Appliquer σ seulement aux litteraux resolus | Appliquer σ a **toute** la resolvante |
