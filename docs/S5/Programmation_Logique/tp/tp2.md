---
title: "TP2 - Manipulation de termes construits"
sidebar_position: 2
---

# TP2 - Manipulation de termes construits

## Objectif

Maitriser les termes construits en Prolog a travers un jeu de cartes de poker.
Les cartes sont representees par `carte(Hauteur, Couleur)` et les mains par
`main(C1, C2, C3, C4, C5)`.

## Fichier

- `src/cartes.pl` -- Definitions et predicats pour le jeu de poker

## Exercices

1. **est_carte/1** : verifie qu'un terme est une carte valide (52 cartes au total)
2. **est_main/1** : verifie qu'un terme est une main de 5 cartes toutes differentes
3. **inf_carte/2** : ordre total sur les cartes (d'abord par hauteur, puis par couleur)
   - Utilise `inf_hauteur/2` et `inf_couleur/2` (definis recursivement via `succ_hauteur` et `succ_couleur`)
4. **est_main_triee/1** : la main est une main valide dont les cartes sont en ordre croissant
5. **une_paire/1** : la main contient au moins 2 cartes de meme hauteur (consecutives en main triee)
6. **deux_paires/1** : la main contient au moins 2 paires distinctes
7. **brelan/1** : 3 cartes consecutives de meme hauteur
8. **suite/1** : 5 hauteurs consecutives (utilise `succ_hauteur`)
9. **full/1** : une paire + un brelan (hauteurs differentes)

## Concepts cles

- **Termes construits** : `carte(sept, trefle)`, `main(C1, C2, C3, C4, C5)`
- **Unification** : le filtrage par motif (pattern matching) permet de decomposer les termes
- **Ordre defini par faits** : `succ_hauteur` et `succ_couleur` definissent un ordre sans arithmetique
- **Recursion pour la transitivite** : `inf_hauteur` utilise `succ_hauteur` transitivement

## Execution

```prolog noexec
[eclipse 1]: ["cartes"].
[eclipse 2]: test.

% Verifier qu'une main contient un full
[eclipse 3]: full(main(carte(deux,coeur), carte(deux,pique), carte(quatre,trefle), carte(quatre,coeur), carte(quatre,pique))).
```
