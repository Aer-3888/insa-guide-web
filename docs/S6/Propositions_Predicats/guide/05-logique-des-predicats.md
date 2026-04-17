---
title: "Chapitre 5 -- Logique des predicats (premier ordre)"
sidebar_position: 5
---

# Chapitre 5 -- Logique des predicats (premier ordre)

> Quantificateurs (∀, ∃), variables libres/liees, substitution, portee, traduction langage naturel.

---

## 1. Pourquoi le premier ordre ?

Le calcul propositionnel parle de phrases entieres (vrai/faux). La logique des predicats permet de parler d'**objets** et de leurs **proprietes** :

- "**Tous** les etudiants ont un numero" → quantificateur universel
- "**Il existe** un etudiant avec 20/20" → quantificateur existentiel

---

## 2. Vocabulaire

### Domaine de discours

Le **domaine** D est l'ensemble des objets consideres (entiers, etudiants, etc.).

### Termes

Les termes designent des objets :

| Type | Exemple | Description |
|------|---------|-------------|
| Constante | a, b, 0, Socrate | Objet specifique |
| Variable | x, y, z | Objet quelconque |
| Fonction appliquee | f(x), succ(0), g(a, y) | Objet construit |

**Definition recursive :** Un terme est une constante, une variable, ou f(t1, ..., tn) ou f est un symbole de fonction et les ti sont des termes.

### Predicats

Un **predicat** applique a des termes donne une formule atomique (vrai ou faux).

| Predicat | Arite | Exemple |
|----------|-------|---------|
| Etudiant(x) | 1 | "x est etudiant" |
| PlusGrand(x, y) | 2 | "x > y" |

**Attention :** Un predicat n'est pas un terme. P(x) est une formule, pas un objet.

---

## 3. Les quantificateurs

### Quantificateur universel : ∀ ("pour tout")

```
∀x, P(x) signifie "pour tout objet x du domaine, P(x) est vrai"
```

Intuition : c'est un **ET geant** sur tout le domaine.
Si D = {a, b, c} : ∀x, P(x) ≡ P(a) ∧ P(b) ∧ P(c)

### Quantificateur existentiel : ∃ ("il existe")

```
∃x, P(x) signifie "il existe au moins un objet x tel que P(x) est vrai"
```

Intuition : c'est un **OU geant** sur tout le domaine.
Si D = {a, b, c} : ∃x, P(x) ≡ P(a) ∨ P(b) ∨ P(c)

---

## 4. Variables libres et liees

### Definitions

- Variable **liee** : sous la portee d'un quantificateur.
- Variable **libre** : pas sous la portee d'un quantificateur.

### Exemples

| Formule | Libres | Liees |
|---------|--------|-------|
| P(x) | x | -- |
| ∀x, P(x) | -- | x |
| ∀x, P(x, y) | y | x |
| (∀x, P(x)) ∧ Q(x) | x (dans Q) | x (dans P) |

**Attention :** Dans le dernier exemple, le meme symbole x est libre dans une partie et lie dans une autre.

### Formule close

Une formule est **close** si elle n'a aucune variable libre. Seules les formules closes ont une valeur de verite fixe dans une interpretation.

### Portee des quantificateurs

Les parentheses sont cruciales :

```
∀x, (P(x) → Q(x))        -- le ∀x porte sur toute la formule
(∀x, P(x)) → Q(x)        -- le ∀x ne porte que sur P(x), le x dans Q est libre
```

---

## 5. Substitution

### Definition

Substituer la variable x par le terme t dans la formule F, note F[x/t] ou F{x ← t}, consiste a remplacer toutes les occurrences libres de x par t.

### Substitution correcte

La substitution F[x/t] est **correcte** si aucune variable libre de t ne devient liee apres substitution. Sinon, il faut d'abord **renommer** les variables liees.

**Exemple de substitution incorrecte :**
```
F = ∀y, P(x, y)     t = f(y)
F[x/f(y)] = ∀y, P(f(y), y)   -- le y de f(y) est "capture" par ∀y !
```

**Correction :** renommer d'abord : ∀z, P(x, z), puis F[x/f(y)] = ∀z, P(f(y), z).

---

## 6. Equivalences avec les quantificateurs

### Negation des quantificateurs (De Morgan generalise)

```
¬(∀x, P(x))  ≡  ∃x, ¬P(x)
¬(∃x, P(x))  ≡  ∀x, ¬P(x)
```

Intuition :
- "Pas tous les A" = "il existe un non-A"
- "Il n'existe aucun A" = "tout est non-A"

### Distributivite des quantificateurs

**Valide :**
```
∀x, (P(x) ∧ Q(x))  ≡  (∀x, P(x)) ∧ (∀x, Q(x))
∃x, (P(x) ∨ Q(x))  ≡  (∃x, P(x)) ∨ (∃x, Q(x))
```

**NON valide (piege classique) :**
```
∀x, (P(x) ∨ Q(x))  ≢  (∀x, P(x)) ∨ (∀x, Q(x))
∃x, (P(x) ∧ Q(x))  ≢  (∃x, P(x)) ∧ (∃x, Q(x))
```

### Ordre des quantificateurs

Meme type : commutent.
```
∀x, ∀y, P(x,y)  ≡  ∀y, ∀x, P(x,y)
∃x, ∃y, P(x,y)  ≡  ∃y, ∃x, P(x,y)
```

Types differents : **l'ordre compte**.
```
∃x, ∀y, P(x,y)  ⟹  ∀y, ∃x, P(x,y)     (mais pas l'inverse)
```

"Il existe un medecin qui soigne tout le monde" implique "Pour tout malade, il existe un medecin", mais pas l'inverse.

### Deplacement de quantificateurs

Si x n'est pas libre dans Q :
```
(∀x, P(x)) ∧ Q  ≡  ∀x, (P(x) ∧ Q)
(∃x, P(x)) ∧ Q  ≡  ∃x, (P(x) ∧ Q)
```

---

## 7. Traduction langage naturel → logique

### Schemas courants

| Phrase | Formule |
|--------|---------|
| "Tous les A sont B" | ∀x, (A(x) → B(x)) |
| "Certains A sont B" | ∃x, (A(x) ∧ B(x)) |
| "Aucun A n'est B" | ∀x, (A(x) → ¬B(x)) |
| "Il existe un unique A qui est B" | ∃x, (A(x) ∧ B(x) ∧ ∀y, (A(y) ∧ B(y) → y = x)) |

### Pieges capitaux

**"Tous les A sont B" utilise → (pas ∧) :**
```
CORRECT :   ∀x, (A(x) → B(x))
INCORRECT : ∀x, (A(x) ∧ B(x))     ← dit "tout est A et B"
```

**"Certains A sont B" utilise ∧ (pas →) :**
```
CORRECT :   ∃x, (A(x) ∧ B(x))
INCORRECT : ∃x, (A(x) → B(x))     ← presque toujours vrai (trivial)
```

### Exemples de traduction

| Phrase | Formule |
|--------|---------|
| "Tout etudiant suit un cours" | ∀x, (E(x) → ∃y, (C(y) ∧ S(x,y))) |
| "Il existe un cours que tout etudiant suit" | ∃y, (C(y) ∧ ∀x, (E(x) → S(x,y))) |
| "Personne n'aime tout le monde" | ∀x, ∃y, ¬Aime(x,y) |
| "Tous les bebes sont illogiques" | ∀x, (BB(x) → ¬L(x)) |
| "Certains patients aiment tous les docteurs" | ∃x, (P(x) ∧ ∀y, (D(y) → A(x,y))) |

---

## 8. Pieges classiques

| Piege | Erreur | Correction |
|-------|--------|------------|
| Ordre des quantificateurs | ∀x ∃y ≡ ∃y ∀x | L'ordre change le sens |
| "Tous les A sont B" avec ∧ | ∀x, (A(x) ∧ B(x)) | Utiliser **→** |
| "Certains A sont B" avec → | ∃x, (A(x) → B(x)) | Utiliser **∧** |
| Oublier le renommage | Meme variable pour deux ∀ | Renommer avant manipulation |
| Confondre termes et formules | ∀f(x), ... | On quantifie sur des **variables** |
