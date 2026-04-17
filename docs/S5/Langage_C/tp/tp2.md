---
title: "TP2 - Structures de Contrôle et Calculs Numériques"
sidebar_position: 2
---

# TP2 - Structures de Contrôle et Calculs Numériques

## Objectifs
- Maîtriser les boucles et la récursivité
- Implémenter des algorithmes mathématiques
- Comprendre la stabilité numérique
- Utiliser les constantes mathématiques (`M_PI`, `M_E`)

## Exercices

### Exercice 1: Calcul de la Factorielle
Implémenter une fonction `myfact(n)` qui calcule n!

**Points clés:**
- Gestion des erreurs (n < 0)
- Détection du dépassement de capacité (`INT_MAX`)
- Identification du plus grand n calculable correctement

**Problème:** La factorielle croît très rapidement. À partir de n=13, le résultat dépasse `INT_MAX` (2147483647).

### Exercice 2: Calcul du Sinus par Développement de Taylor
Calculer sin(x) en utilisant la série de Taylor:

```
sin(x) = x - x³/3! + x⁵/5! - x⁷/7! + ...
       = Σ (-1)ⁿ × x^(2n+1) / (2n+1)!
```

**Deux approches:**
1. **Version naïve** (`sinus()`): recalcule chaque terme indépendamment
2. **Version optimisée** (`sinus2()`): calcule chaque terme à partir du précédent

**Optimisation:**
```c noexec
// Au lieu de recalculer x^(2n+1) / (2n+1)! à chaque fois
terme_suivant = terme_precedent × x² / (n × (n-1))
```

### Exercice 3: Suite Récurrente et Stabilité Numérique
Calculer la suite définie par:
```
u₀ = e - 1
uₙ = e - n × uₙ₋₁
```

**Deux implémentations:**
1. **Récursive ascendante** (`suite()`): calcule de u₀ vers uₙ (instable!)
2. **Itérative descendante** (`suiteDecroissante()`): calcule de u₅₀ vers u₀ (stable)

**Problème de stabilité:** La version récursive amplifie les erreurs d'arrondi à chaque itération.

## Compilation et Exécution

```bash
cd tp2/src
make factorial
make sinus
make suite

./factorial
./sinus
./suite
```

## Exemples d'Exécution

### Factorielle
```
Rentrez n 
12
Factorielle de n = 479001600 

Rang de la plus grande factorielle correcte = 12
```

### Sinus
```
Rentrez x puis n : 
1.5708 20
sin(x) au rang n (en RADIANT) = 1.000000

sinus(Pi/2) au rang 1 = 1.5708 
sinus(Pi/2) au rang 3 = 0.924832 
sinus(Pi/2) au rang 5 = 1.00452 
...
sinus(Pi/2) au rang 41 = 1
```

### Suite Récurrente
```
La suite au rang 49 vaut 0.054555
La suite au rang 48 vaut 0.055544
...
La suite au rang 1 vaut 1.000000
La suite au rang 0 vaut 1.718282
```

## Concepts C Abordés

- **Boucles:** `for`, `while`
- **Récursivité:** fonctions qui s'appellent elles-mêmes
- **Fonctions mathématiques:** `pow()`, `sin()`, `fmod()`
- **Constantes:** `M_PI`, `M_E`, `INT_MAX`
- **Algorithmes numériques:** série de Taylor, suites récurrentes
- **Stabilité numérique:** propagation des erreurs d'arrondi

## Points Importants

1. **Dépassement d'entier:**
   - Vérifier les limites avant calcul
   - Utiliser `INT_MAX` de `<limits.h>`

2. **Précision numérique:**
   - Les calculs en virgule flottante ne sont pas exacts
   - L'ordre des calculs affecte la précision
   - Certains algorithmes sont plus stables que autres

3. **Optimisation:**
   - Réutiliser les résultats précédents évite les recalculs coûteux
   - `x^n / n!` peut être calculé itérativement

4. **Constantes mathématiques:**
   - `M_PI`, `M_E` définis dans `<math.h>`
   - Nécessitent parfois `#define _USE_MATH_DEFINES` (Windows)
