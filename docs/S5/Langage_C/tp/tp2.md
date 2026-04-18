---
title: "TP2 - Structures de Controle et Calculs Numeriques"
sidebar_position: 2
---

# TP2 - Structures de Controle et Calculs Numeriques

## Objectifs
- Maitriser les boucles et la recursivite
- Implementer des algorithmes mathematiques
- Comprendre la stabilite numerique
- Utiliser les constantes mathematiques (`M_PI`, `M_E`)

## Exercices

### Exercice 1 : Calcul de la Factorielle
Implementer une fonction `myfact(n)` qui calcule n!

**Points cles :**
- Gestion des erreurs (n < 0)
- Detection du depassement de capacite (`INT_MAX`)
- Identification du plus grand n calculable correctement

**Probleme :** La factorielle croit tres rapidement. A partir de n=13, le resultat depasse `INT_MAX` (2147483647).

### Exercice 2 : Calcul du Sinus par Developpement de Taylor
Calculer sin(x) en utilisant la serie de Taylor :

```
sin(x) = x - x^3/3! + x^5/5! - x^7/7! + ...
       = Somme (-1)^n x x^(2n+1) / (2n+1)!
```

**Deux approches :**
1. **Version naive** (`sinus()`) : recalcule chaque terme independamment
2. **Version optimisee** (`sinus2()`) : calcule chaque terme a partir du precedent

**Optimisation :**
```c noexec
// Au lieu de recalculer x^(2n+1) / (2n+1)! a chaque fois
terme_suivant = terme_precedent * x^2 / (n * (n-1))
```

### Exercice 3 : Suite Recurrente et Stabilite Numerique
Calculer la suite definie par :
```
u_0 = e - 1
u_n = e - n * u_{n-1}
```

**Deux implementations :**
1. **Recursive ascendante** (`suite()`) : calcule de u_0 vers u_n (instable !)
2. **Iterative descendante** (`suiteDecroissante()`) : calcule de u_50 vers u_0 (stable)

**Probleme de stabilite :** La version recursive amplifie les erreurs d'arrondi a chaque iteration.

## Compilation et Execution

```bash
cd tp2/src
make factorial
make sinus
make suite

./factorial
./sinus
./suite
```

## Exemples d'Execution

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

### Suite Recurrente
```
La suite au rang 49 vaut 0.054555
La suite au rang 48 vaut 0.055544
...
La suite au rang 1 vaut 1.000000
La suite au rang 0 vaut 1.718282
```

## Concepts C Abordes

- **Boucles :** `for`, `while`
- **Recursivite :** fonctions qui s'appellent elles-memes
- **Fonctions mathematiques :** `pow()`, `sin()`, `fmod()`
- **Constantes :** `M_PI`, `M_E`, `INT_MAX`
- **Algorithmes numeriques :** serie de Taylor, suites recurrentes
- **Stabilite numerique :** propagation des erreurs d'arrondi

## Points Importants

1. **Depassement d'entier :**
   - Verifier les limites avant calcul
   - Utiliser `INT_MAX` de `<limits.h>`

2. **Precision numerique :**
   - Les calculs en virgule flottante ne sont pas exacts
   - L'ordre des calculs affecte la precision
   - Certains algorithmes sont plus stables que d'autres

3. **Optimisation :**
   - Reutiliser les resultats precedents evite les recalculs couteux
   - `x^n / n!` peut etre calcule iterativement

4. **Constantes mathematiques :**
   - `M_PI`, `M_E` definis dans `<math.h>`
   - Necessitent parfois `#define _USE_MATH_DEFINES` (Windows)
