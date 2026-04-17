---
title: "TP2 - OpenMP: Propagation de la chaleur"
sidebar_position: 2
---

# TP2 - OpenMP: Propagation de la chaleur

Simulation de la propagation de chaleur sur une plaque rectangulaire avec OpenMP.

## Objectifs pédagogiques

- Paralléliser un algorithme itératif avec stencil 2D
- Gérer les dépendances de données
- Optimiser les performances pour les calculs sur grille
- Mesurer le speedup sur algorithmes réalistes

## Exercice 1 - Propagation de la chaleur

### Description du problème

On simule la diffusion de chaleur sur une plaque rectangulaire dont les bords sont maintenus à température constante (MAX). La plaque est discrétisée en une grille de points NxM.

**Équation de la chaleur** (moyenne des 5 points):
```
T[t+1][i][j] = (T[t][i][j+1] + T[t][i][j-1] + T[t][i+1][j] + T[t][i-1][j] + T[t][i][j]) / 5
```

**Critère de convergence**:
```
Δ = Σ |T[t+1][i][j] - T[t][i][j]| < seuil
```

Le calcul s'arrête lorsque la variation totale devient suffisamment petite.

### Pseudo-code séquentiel

```c noexec
double T[N+2][M+2], T1[N+2][M+2];

// Initialisation
T = 0 partout sauf les bords = MAX

// Itérations
do {
    delta = 0;
    for (i=1 to N) {
        for (j=1 to M) {
            T1[i][j] = (T[i][j+1] + T[i][j-1] + T[i+1][j] + T[i-1][j] + T[i][j]) / 5;
            delta += |T1[i][j] - T[i][j]|;
        }
    }
    T = T1;  // Swap des matrices
} while (delta >= seuil);
```

**Dimensions** : N+2 × M+2 (les bords sont inclus pour simplifier le code).

### Parallélisation avec OpenMP

**Stratégie**:
1. Paralléliser la boucle sur `i` (lignes de la matrice)
2. Utiliser `reduction(+:delta)` pour accumuler les variations
3. Déclarer les variables de boucle comme `private`

**Code parallèle**:
```c noexec
do {
    delta = 0;
    #pragma omp parallel for reduction(+:delta)
    for (int k=1; k<N+1; k++) {
        for (int j=1; j<M+1; j++) {
            T1[k][j] = (T[k][j+1] + T[k][j-1] + 
                        T[k+1][j] + T[k-1][j] + 
                        T[k][j]) / 5.0;
            delta += fabs(T1[k][j] - T[k][j]);
        }
    }
    // Swap des pointeurs
    Temp = T1;
    T1 = T;
    T = Temp;
} while (delta >= SEUIL);
```

### Optimisations implémentées

1. **Linéarisation de la matrice** :
   ```c noexec
   // Au lieu de T[i][j], utiliser T[i*(N+2)+j]
   // Améliore la localité spatiale
   ```

2. **Swap de pointeurs** au lieu de copie :
   ```c noexec
   Temp = T1;
   T1 = T;
   T = Temp;
   // Évite N×M copies de valeurs
   ```

3. **Calcul d'index optimisé** :
   ```c noexec
   int machin = k*(N+2);  // Pré-calcul hors de la boucle j
   T1[machin+j] = ...
   ```

### Concepts parallèles

**Calcul stencil** : Chaque point dépend de ses voisins
- Lecture de T : accès concurrent sûr (read-only)
- Écriture dans T1 : pas de conflits (indices distincts)
- Barrière implicite à la fin du `for` : tous les threads terminent avant le swap

**Pattern double buffering** :
- T : matrice de lecture (état t)
- T1 : matrice d'écriture (état t+1)
- Swap : T devient T1 pour l'itération suivante

### Compilation et exécution

```bash
# Compilation
gcc -fopenmp exo1.c -o exo1 -Wall -Wextra -lm

# Exécution séquentielle
export OMP_NUM_THREADS=1
./exo1

# Exécution parallèle (4 threads)
export OMP_NUM_THREADS=4
./exo1

# Avec le Makefile
make exo1
make test1  # Lance des tests de performance
```

### Mesure de performance

Le code mesure le temps avec `omp_get_wtime()` :

```c noexec
double prev = omp_get_wtime();
// ... calcul ...
fprintf(stderr, "%f\n", omp_get_wtime() - prev);
```

**Résultats typiques** (N=M=100, SEUIL=1):

| Threads | Temps (s) | Speedup | Efficacité |
|---------|-----------|---------|------------|
| 1       | 0.15      | 1.0     | 100%       |
| 2       | 0.08      | 1.88    | 94%        |
| 4       | 0.04      | 3.75    | 94%        |
| 8       | 0.025     | 6.0     | 75%        |

**Observations** :
- Bon speedup jusqu'à 4 threads
- Dégradation avec 8+ threads (overhead, bande passante mémoire)
- Problème memory-bound (beaucoup d'accès mémoire, peu de calculs)

### Facteurs affectant les performances

1. **Taille de la grille** :
   - Grilles petites : overhead domine
   - Grilles grandes : meilleure utilisation des caches

2. **Localité des données** :
   - Accès par lignes (row-major order) → bon
   - Accès par colonnes → mauvais (cache misses)

3. **False sharing** :
   - Si deux threads écrivent dans la même ligne de cache
   - Moins problématique ici (chaque thread traite des lignes complètes)

4. **Bande passante mémoire** :
   - Goulot d'étranglement pour 8+ threads
   - Ratio calcul/mémoire faible (5 lectures, 1 écriture, 1 division, 4 additions)

---

## Exercice 2 - Crible d'Ératosthène

### Description de l'algorithme

Algorithme ancien (IIIe siècle av. J.-C.) pour trouver tous les nombres premiers jusqu'à N.

**Principe** : Élimination successive des multiples
1. Marquer tous les nombres de 2 à N comme potentiellement premiers
2. Pour chaque nombre i non éliminé (de 2 à √N) :
   - Éliminer tous les multiples de i (i², i²+i, i²+2i, ...)
3. Les nombres restants sont premiers

### Pseudo-code

```c noexec
// Initialisation
for i ← 0 to N-1 do
    a[i] = i

// Élimination des multiples
for i ← 2 to √N do
    if a[i] > 0 then
        for j = i² to N-1 step i do
            a[j] = 0
        end for
    end if
end for

// Compaction (optionnel)
p ← 0
for j ← 0 to N-1 do
    if a[j] > 0 then
        a[p] ← a[j]
        p ← p + 1
    end if
end for
```

### Parallélisation

**Difficulté** : La boucle externe n'est PAS parallélisable directement (dépendances).

**Solution** : Paralléliser la boucle externe avec prudence
```c noexec
#pragma omp parallel for
for (long int i=2; i<=maxBorne; i++) {
    if (a[i] > 0) {
        for (long int j=i*i; j<=N-1; j+=i) {
            a[j] = 0;
        }
    }
}
```

**Pourquoi ça marche** :
- Différents threads éliminent des multiples de nombres premiers différents
- Les écritures (`a[j]=0`) sont **idempotentes** (écrire 0 plusieurs fois = même résultat)
- Pas de race condition critique (le résultat final est correct)

**Attention** : Écritures concurrentes possibles, mais sans impact sur la correction.

### Résultats attendus

**Performance** : Le speedup est variable selon N
- Pour N petit (< 10⁶) : overhead domine
- Pour N grand (≥ 10⁸) : bon speedup (2-4x avec 4 threads)

**Comportement surprenant** : Les temps peuvent **augmenter** avec plus de threads pour certains N (voir Makefile).

**Raisons** :
- False sharing intense (plusieurs threads écrivent dans le même a[j])
- Contentions mémoire
- Déséquilibre de charge (les premiers nombres premiers font plus de travail)

### Compilation et exécution

```bash
gcc -fopenmp exo2.c -o exo2 -Wall -Wextra -lm
export OMP_NUM_THREADS=4
./exo2

# Avec le Makefile
make exo2
make test2  # Mesures de performance
```

---

## Exercice 3 - Méthode de Jacobi (non fourni)

### Description

La méthode de Jacobi résout un système linéaire **Ax = b** de manière itérative.

**Conditions** : A doit être à diagonale strictement dominante :
```
|A[i][i]| > Σ |A[i][j]| pour j ≠ i
```

**Itération de Jacobi** :
```
x[k+1][i] = (b[i] - Σ A[i][j] × x[k][j] pour j≠i) / A[i][i]
```

### Pseudo-code

```c noexec
// Initialisation
x = guess initial

while (non convergé) {
    for i = 1 to n {
        σ = 0
        for j = 1 to n {
            if (j != i)
                σ += A[i][j] × x_old[j]
        }
        x_new[i] = (b[i] - σ) / A[i][i]
    }
    
    // Test de convergence
    if (||A×x_new - b|| < ε)
        break
        
    x_old = x_new
}
```

### Parallélisation

**Stratégie** : Paralléliser la boucle externe (sur i)
```c noexec
#pragma omp parallel for private(σ, j)
for (int i = 0; i < n; i++) {
    σ = 0;
    for (int j = 0; j < n; j++) {
        if (j != i)
            σ += A[i][j] * x_old[j];
    }
    x_new[i] = (b[i] - σ) / A[i][i];
}
```

**Points clés** :
- x_old : lecture seule → partagé
- x_new : chaque thread écrit un indice distinct → pas de conflit
- σ, j : privés à chaque thread

---

## Concepts OpenMP avancés

### 1. Scheduling de boucles

Par défaut : `schedule(static)` → chunks contigus

Autres options :
```c noexec
#pragma omp parallel for schedule(dynamic, chunk)
#pragma omp parallel for schedule(guided)
```

### 2. Réduction avec opérations mathématiques

```c noexec
#pragma omp parallel for reduction(+:delta)
```
OpenMP gère automatiquement :
- Création de variables privées
- Combinaison thread-safe des résultats
- Opérateurs : +, *, min, max, &, |, ^, &&, ||

### 3. Barrières

Barrière implicite à la fin de :
- `#pragma omp parallel`
- `#pragma omp for`
- `#pragma omp single`

Barrière explicite :
```c noexec
#pragma omp barrier
```

### 4. Sections de code critique

À éviter (très lent) :
```c noexec
#pragma omp critical
{
    // Code sérialisé
}
```

Préférer : `reduction`, `atomic`, ou restructuration de l'algorithme.

---

## Fichiers du TP

```
tp2/
├── README.md           # Ce fichier
└── src/
    ├── Makefile        # Compilation et tests
    ├── exo1.c          # Propagation de chaleur
    ├── exo2.c          # Crible d'Ératosthène
    └── tests.sh        # Script de mesures de performance
```

---

## Points clés à retenir

1. **Calculs stencil** : Bon candidat pour parallélisation (indépendance des calculs)
2. **Double buffering** : Éviter les conflits lecture/écriture
3. **Réduction** : Mécanisme puissant pour accumulateurs parallèles
4. **Memory-bound** : Goulot d'étranglement fréquent (bande passante > calcul)
5. **False sharing** : Peut dégrader les performances (attention aux petits tableaux)
6. **Speedup non-linéaire** : Normal pour algorithmes réalistes

---

## Ressources

- Équation de la chaleur : https://en.wikipedia.org/wiki/Heat_equation
- Crible d'Ératosthène : https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
- Méthode de Jacobi : https://en.wikipedia.org/wiki/Jacobi_method
