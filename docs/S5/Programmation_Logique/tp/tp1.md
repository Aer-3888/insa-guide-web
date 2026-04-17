---
title: "TP1 - Interrogation style base de donnees"
sidebar_position: 1
---

# TP1 - Interrogation style base de donnees

## Objectif

Se familiariser avec ECLiPSe Prolog : charger un fichier de clauses, explorer les
connaissances, ecrire des predicats pour extraire des reponses elaborees.

## Fichiers

- `src/basemenu.pl` -- Base de donnees d'un restaurant (hors d'oeuvres, plats, desserts, calories)
- `src/basevalois.pl` -- Famille royale de France (dynastie des Valois)

## Base Menu (`basemenu.pl`)

### Exercices

1. **plat/1** : un plat de resistance est une viande ou un poisson
2. **repas/3** : un repas = hors d'oeuvre + plat + dessert
3. **plat200_400/1** : plats entre 200 et 400 calories
4. **plat_bar/1** : plats plus caloriques que le bar aux algues
5. **val_cal/4** : valeur calorique totale d'un repas
6. **repas_eq/3** : repas equilibre (total <= 800 cal)

### Concepts

- Faits et regles simples
- Operateurs arithmetiques (`is`, `>=`, `=<`)
- Composition de predicats

## Base Valois (`basevalois.pl`)

### Exercices

1. **enfant/2** : E est enfant de P (via `pere` ou `mere`)
2. **parent/2** : inverse de `enfant`
3. **grand_pere/2** : G est un homme, parent d'un parent de E
4. **frere/2** : meme pere et meme mere, personnes differentes
5. **oncle/2** : frere du pere
6. **cousin/2** : fils d'un oncle
7. **le_roi_est_mort_vive_le_roi/3** : succession royale a une date
8. **ancetre/2** : relation transitive de parente (recursif)

### Concepts

- Recursivite (ancetre)
- Negation (`\==`)
- Mode trace pour explorer l'arbre de recherche

## Execution

```prolog noexec
% Charger la base Valois
[eclipse 1]: ["basevalois"].

% Lancer les tests
[eclipse 2]: tests.

% Exemples de requetes
[eclipse 3]: enfant(X, charles_V).
[eclipse 4]: ancetre(A, louis_d_Orleans).
```
