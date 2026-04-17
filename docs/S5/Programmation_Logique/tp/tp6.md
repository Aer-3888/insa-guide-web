---
title: "TP6 - Bases de donnees deductives"
sidebar_position: 6
---

# TP6 - Bases de donnees deductives

## Objectif

Simuler une base de donnees deductive en Prolog pour un constructeur automobile.
Implementer des operations relationnelles classiques (SQL-like), puis des requetes
recursives impossibles a exprimer en SQL standard.

## Fichiers

- `src/tp_BDD.pl` -- Base de donnees, operations relationnelles et requetes recursives
- `src/tp_BDD_tests.pl` -- Reference (tests inclus dans tp_BDD.pl)

## Base de donnees

5 tables representees par des faits Prolog :

| Table | Predicat | Colonnes |
|-------|----------|----------|
| Assemblage | `assemblage/3` | Composant, ComposeDe, Quantite |
| Piece | `piece/3` | NumPiece, Nom, LieuFabrication |
| Demande Fournisseur | `demandeFournisseur/2` | Nom, Ville |
| Fournisseur Reference | `fournisseurReference/3` | NumF, Nom, Ville |
| Livraison | `livraison/3` | NumF, Piece, Quantite |

## Section 2 : Operations relationnelles

| # | Operation | Predicat | Description |
|---|-----------|----------|-------------|
| Q2.1 | Selection | `selection_lyon/2` | Pieces fabriquees a Lyon |
| Q2.2 | Projection | `projection/2` | Noms et lieux des pieces |
| Q2.3 | Union | `union/2` | Union de demande et reference |
| Q2.3 | Intersection | `intersection/2` | Intersection des deux |
| Q2.3 | Difference | `difference/2` | Dans demande mais pas reference |
| Q2.4 | Produit cartesien | `produit_cartesien/6` | Fournisseurs x Livraisons |
| Q2.5 | Jointure | `jointure/5` | Fournisseurs avec leurs livraisons |
| Q2.5 | Jointure sup | `jointure_sup/5` | Livraisons > 350 |
| Q2.6 | Division | `division/1` | Fournisseurs livrant toutes les pieces de Lyon |
| Q2.7 | Agregation | `total_pieces_livrees_fournisseur/2` | Total livraisons par fournisseur |

### Notes techniques

- La **difference** et la **negation** utilisent un predicat auxiliaire avec coupure (`!` + `fail`)
  pour simuler `NOT EXISTS` de SQL.
- La **division** utilise la double negation : un fournisseur fournit toutes les pieces de Lyon
  s'il n'existe pas de piece de Lyon qu'il ne fournit pas.
- Le **total** utilise `findall/3` pour collecter les quantites puis les sommer.

## Section 3 : Au-dela de l'algebre relationnelle

| # | Predicat | Description |
|---|----------|-------------|
| Q3.1 | `est_compose_de/2` | Composants et pieces necessaires (transitif) |
| Q3.2 | `nb_pieces_tot/3` | Nombre total de pieces de base par composant |
| Q3.3 | `nb_voiture/1` | Nombre de voitures constructibles avec les livraisons |

Ces requetes recursives sont impossibles en SQL standard (sans CTE recursif).

## Execution

```prolog
[eclipse 1]: ["tp_BDD"].
[eclipse 2]: tests.

% Quels composants faut-il pour construire une voiture ?
[eclipse 3]: est_compose_de(voiture, X).

% Combien de voitures peut-on construire ?
[eclipse 4]: nb_voiture(N).
% N = 62
```
