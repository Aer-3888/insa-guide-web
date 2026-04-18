---
title: "TP6 - Arbres binaires"
sidebar_position: 6
---

# TP6 - Arbres binaires

## Vue d'ensemble

Structures de donnees et operations sur les arbres binaires :
- Definition et construction d'arbres
- Parcours d'arbres
- Arbres binaires de recherche
- Positionnement d'arbres pour l'affichage graphique

## Type de donnees

```ocaml
type 'a arbin = 
  | Feuille of 'a 
  | Noeud of 'a arbin * 'a * 'a arbin
```

## Exercices

### 1. Construction d'arbres
- `feuille v` : Creer un noeud feuille
- `noeud v g d` : Creer un noeud avec fils gauche et droit

**Concepts** : Types algebriques de donnees, constructeurs d'arbres

### 2. Comptage de noeuds (`compter`)
Compter le nombre de noeuds dans un arbre.

**Concepts** : Recursion structurelle sur les arbres

### 3. Arbre vers liste (`to_list`)
Convertir un arbre en liste par parcours infixe.

**Concepts** : Parcours d'arbre (gauche-racine-droite)

### 4. Arbre binaire de recherche (`ajoutArbre`, `constr`)
- Inserer des elements en maintenant la propriete d'ABR
- Construire un ABR a partir d'une liste

**Concepts** : Invariants des arbres binaires de recherche

### 5. Positionnement d'arbre (`placer`)
Assigner des coordonnees (x, y) a chaque noeud pour l'affichage graphique.

**Concepts** : Algorithmes de mise en page d'arbres, pattern accumulateur

## Algorithmes cles

### Parcours infixe
```ocaml
let rec to_list a = match a with
  | Feuille b -> [b]
  | Noeud (g, c, d) -> to_list g @ [c] @ to_list d
```

### Insertion dans un ABR
```ocaml
let rec ajoutArbre e a = match a with
  | Noeud (g, c, d) ->
      if e < c then Noeud (ajoutArbre e g, c, d)
      else Noeud (g, c, ajoutArbre e d)
  | Feuille _ -> Noeud (Feuille "Nil", e, Feuille "Nil")
```

### Positionnement d'arbre
Calcule les coordonnees (x, y) pour chaque noeud :
- Le parcours infixe determine les coordonnees x
- La profondeur determine les coordonnees y

## Execution du code

```bash
ocaml
# #use "tp6.ml";;
```

## Resultats attendus

Pour l'arbre : `noeud 12 (feuille 5) (noeud 7 (feuille 6) (feuille 8))`
- `compter` → 3 (noeuds feuilles)
- `to_list` → [5; 12; 6; 7; 8]
