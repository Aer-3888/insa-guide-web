---
title: "Chapitre 8 -- Completude et solidite"
sidebar_position: 8
---

# Chapitre 8 -- Completude et solidite

> Theoreme de completude de Godel, solidite, decidabilite, liens entre syntaxe et semantique.

---

## 1. Solidite (correction)

### Definition

Un systeme de preuve est **solide** (ou correct) si tout ce qu'il permet de prouver est effectivement vrai.

```
Si Γ ⊢ F  alors  Γ ⊨ F
```

"Si on peut deduire F a partir de Γ par les regles de preuve, alors F est vraie dans tout modele de Γ."

### Ce que ca signifie

- La solidite garantit qu'on ne peut **pas prouver de faussetes**.
- Si le systeme est solide, on peut faire confiance a ses preuves.
- C'est la propriete minimale qu'on exige d'un systeme de preuve.

### Solidite de la deduction naturelle

La deduction naturelle pour la logique propositionnelle et la logique du premier ordre est **solide**. Chaque regle d'inference preserve la verite :

| Regle | Preservation de la verite |
|-------|--------------------------|
| ∧-I | Si A et B sont vrais, A ∧ B est vrai |
| →-E | Si A et A → B sont vrais, B est vrai |
| ∀-E | Si ∀x P(x) est vrai, P(t) est vrai pour tout t |
| ... | Chaque regle se verifie de maniere similaire |

### Solidite de la resolution

La methode de resolution est **solide** :
- Si on derive la clause vide a partir d'un ensemble de clauses S, alors S est effectivement insatisfiable.
- La resolvante est une consequence logique des deux clauses parentes.

---

## 2. Completude

### Definition

Un systeme de preuve est **complet** si tout ce qui est vrai peut etre prouve.

```
Si Γ ⊨ F  alors  Γ ⊢ F
```

"Si F est vraie dans tout modele de Γ, alors il existe une preuve de F a partir de Γ."

### Theoreme de completude de Godel (1930)

> La logique du premier ordre est **complete** :
> Si une formule est valide (vraie dans toute interpretation), alors elle est prouvable.

```
⊨ F  ⟹  ⊢ F
```

C'est un resultat fondamental : il n'y a pas de "verite inaccessible" en logique du premier ordre. Tout ce qui est semantiquement vrai a une preuve syntaxique.

### Forme equivalente (completude de la refutation)

Un ensemble de formules Γ est insatisfiable si et seulement s'il existe une preuve de contradiction a partir de Γ.

### Completude de la resolution

Le theoreme de completude de la resolution affirme :

> Un ensemble de clauses S est insatisfiable si et seulement si la clause vide est derivable par resolution a partir de S.

C'est un resultat puissant : la resolution est a la fois **solide et complete** pour la detection de l'insatisfiabilite.

---

## 3. Correction et completude reunies

### Le theoreme principal

En combinant solidite et completude :

```
Γ ⊢ F  ⟺  Γ ⊨ F
```

La deductibilite syntaxique et la consequence semantique coincident en logique du premier ordre.

```
Syntaxe (preuves)  ⟺  Semantique (modeles)
    Γ ⊢ F          ⟺      Γ ⊨ F
```

### Applications pratiques

| On veut montrer... | Methode syntaxique | Methode semantique |
|--------------------|-------------------|--------------------|
| F est valide | Construire une preuve de F | Montrer F vraie dans toute interpretation |
| F insatisfiable | Deriver une contradiction | Montrer qu'aucune interpretation ne satisfait F |
| Γ ⊨ B | Construire une preuve de B a partir de Γ | Resolution : nier B, ajouter a Γ, trouver clause vide |

---

## 4. Decidabilite

### Logique propositionnelle

La logique propositionnelle est **decidable** : il existe un algorithme qui, pour toute formule, determine en temps fini si elle est valide ou non.

**Methode :** Table de verite (2^n lignes pour n variables). Complexite : exponentielle en n.

**Probleme SAT :** Determiner si une formule propositionnelle est satisfiable est un probleme **NP-complet** (theoreme de Cook, 1971). C'est le premier probleme prouve NP-complet.

### Logique du premier ordre

La logique du premier ordre est **semi-decidable** :
- Si une formule est valide, on finira par trouver une preuve (completude).
- Si une formule n'est pas valide, la recherche peut ne **jamais terminer**.

> Theoreme de Church (1936) : Il n'existe pas d'algorithme qui decide, pour toute formule du premier ordre, si elle est valide ou non.

### Fragments decidables

Certains fragments de la logique du premier ordre sont decidables :

| Fragment | Decidable ? |
|----------|-------------|
| Logique propositionnelle | Oui (NP-complet) |
| Logique monadique (predicats a 1 argument) | Oui |
| Clauses de Horn | Oui (base de Prolog) |
| Logique du premier ordre generale | Non (semi-decidable) |

---

## 5. Theoremes d'incompletude de Godel (1931)

### Premier theoreme d'incompletude

> Tout systeme formel suffisamment puissant (capable d'exprimer l'arithmetique) et coherent contient des enonces vrais mais **indemontables**.

Cela concerne les theories (comme l'arithmetique de Peano), pas la logique du premier ordre elle-meme. La logique du premier ordre est complete, mais les theories exprimees dedans peuvent etre incompletes.

### Distinction importante

| | Logique du premier ordre | Arithmetique de Peano |
|---|---|---|
| Complete ? | **Oui** (Godel 1930) | **Non** (Godel 1931) |
| Ce que ca signifie | Toute formule valide est prouvable | Il existe des verites arithmetiques non prouvables |

---

## 6. Compacite

### Theoreme de compacite

> Un ensemble de formules Γ est satisfiable si et seulement si tout sous-ensemble **fini** de Γ est satisfiable.

Consequence : si Γ est insatisfiable, il existe un sous-ensemble fini de Γ qui est deja insatisfiable.

### Application a la resolution

C'est pour cette raison que la resolution fonctionne : si un ensemble de clauses est insatisfiable, un nombre fini d'etapes de resolution suffit pour deriver la clause vide.

---

## 7. Liens entre les concepts

```
                 SOLIDITE
               ⊢ F ⟹ ⊨ F
              (preuves ⟹ verite)
                    │
    Systeme de      │       Interpretations
    preuve ─────────┼───────── et modeles
    (syntaxe)       │         (semantique)
                    │
               ⊨ F ⟹ ⊢ F
                COMPLETUDE
```

### Resume en une phrase

- **Solidite :** on ne prouve que des verites.
- **Completude :** on peut prouver toutes les verites.
- **Decidabilite :** on peut toujours determiner si c'est vrai ou faux (en temps fini).
- **Semi-decidabilite :** on peut confirmer les verites, mais pas toujours les faussetes.

---

## 8. Recapitulatif

| Propriete | Logique propositionnelle | Logique du 1er ordre |
|-----------|--------------------------|----------------------|
| Solidite | Oui | Oui |
| Completude | Oui | Oui (Godel 1930) |
| Decidabilite | Oui (NP-complet) | Non (semi-decidable, Church 1936) |
| Resolution solide | Oui | Oui |
| Resolution complete | Oui | Oui |

### Ce qu'il faut retenir pour le DS

1. La deduction naturelle et la resolution sont **solides et completes**.
2. ⊢ F ⟺ ⊨ F en logique du premier ordre.
3. La logique propositionnelle est decidable (tables de verite).
4. La logique du premier ordre est semi-decidable (pas d'algorithme de decision general).
5. La resolution termine toujours si l'ensemble est insatisfiable (completude de la refutation).
