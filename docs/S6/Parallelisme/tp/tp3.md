---
title: "TP3 - OpenMP: Exercices avancés"
sidebar_position: 3
---

# TP3 - OpenMP: Exercices avancés

Note: Ce TP partage le même répertoire source que TP2 (TP2_3). Les exercices 1 et 2 du TP2 correspondent aux concepts du TP3 (Crible d'Ératosthène et Méthode de Jacobi).

## Objectifs pédagogiques

- Approfondir la parallélisation avec OpenMP
- Gérer des algorithmes avec dépendances complexes
- Optimiser les performances sur algorithmes itératifs
- Analyser les problèmes de false sharing et contentions mémoire

## Exercice 1 - Propagation de la chaleur (référence TP2)

Voir `../tp2/README.md` pour les détails complets.

Cet exercice introduit les calculs stencil 2D, un pattern fondamental en HPC utilisé dans :
- Simulations physiques (chaleur, fluides, électromagnétisme)
- Traitement d'images (convolutions, filtres)
- Résolution d'équations aux dérivées partielles

**Code source**: `../tp2/src/exo1.c`

---

## Exercice 2 - Crible d'Ératosthène (référence TP2)

Voir `../tp2/README.md` pour les détails complets.

Algorithme classique de théorie des nombres avec des défis de parallélisation intéressants :
- Dépendances de données apparentes
- Écritures idempotentes permettant la parallélisation
- False sharing intense
- Déséquilibre de charge

**Code source**: `../tp2/src/exo2.c`

---

## Exercice 3 - Méthode de Jacobi (non fourni)

### Description complète

La méthode de Jacobi est une méthode itérative classique pour résoudre des systèmes linéaires **Ax = b** de grande taille.

### Conditions d'application

La matrice A doit être **diagonale strictement dominante** sur les lignes :
```
|a[i][i]| > Σ |a[i][j]| pour j ≠ i
```

Cette condition garantit la convergence de la méthode.

### Algorithme mathématique

**Formule de mise à jour** :
```
x[i]^(k+1) = (b[i] - Σ(a[i][j] × x[j]^(k)) pour j≠i) / a[i][i]
```

**Critère de convergence** :
```
||A × x^(k) - b|| < ε
```

Ou approximation plus simple :
```
Σ |a[i][j] × x[j]^(k) - b[i]| < ε  pour tout i
```

### Implémentation séquentielle

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define N 1000
#define MAX_ITER 10000
#define EPSILON 1e-6

// Allocation des matrices
double **A = allocate_matrix(N, N);
double *b = allocate_vector(N);
double *x_old = allocate_vector(N);
double *x_new = allocate_vector(N);

// Initialisation (exemple : matrice diagonale dominante)
for (int i = 0; i < N; i++) {
    double sum = 0;
    for (int j = 0; j < N; j++) {
        if (i != j) {
            A[i][j] = rand() % 10;
            sum += fabs(A[i][j]);
        }
    }
    A[i][i] = sum + 10;  // Diagonale dominante
    b[i] = rand() % 100;
    x_old[i] = 0;  // Guess initial
}

// Itérations de Jacobi
int iter = 0;
double error;
do {
    error = 0;
    
    for (int i = 0; i < N; i++) {
        double sigma = 0;
        for (int j = 0; j < N; j++) {
            if (j != i) {
                sigma += A[i][j] * x_old[j];
            }
        }
        x_new[i] = (b[i] - sigma) / A[i][i];
        
        // Contribution à l'erreur
        double row_error = 0;
        for (int j = 0; j < N; j++) {
            row_error += A[i][j] * x_new[i];
        }
        error += fabs(row_error - b[i]);
    }
    
    // Swap des vecteurs
    double *temp = x_old;
    x_old = x_new;
    x_new = temp;
    
    iter++;
} while (error >= EPSILON && iter < MAX_ITER);

printf("Convergence en %d itérations, erreur = %e\n", iter, error);
```

### Parallélisation avec OpenMP

**Stratégie** : Paralléliser la boucle sur `i` (calcul de chaque composante de x_new)

```c noexec
#include <omp.h>

double start = omp_get_wtime();

int iter = 0;
double error;
do {
    error = 0;
    
    #pragma omp parallel for reduction(+:error) private(sigma, j)
    for (int i = 0; i < N; i++) {
        double sigma = 0;
        for (int j = 0; j < N; j++) {
            if (j != i) {
                sigma += A[i][j] * x_old[j];
            }
        }
        x_new[i] = (b[i] - sigma) / A[i][i];
        
        // Contribution à l'erreur (simplifiée)
        double row_error = 0;
        for (int j = 0; j < N; j++) {
            row_error += A[i][j] * x_new[i];
        }
        error += fabs(row_error - b[i]);
    }
    
    // Swap des pointeurs
    double *temp = x_old;
    x_old = x_new;
    x_new = temp;
    
    iter++;
} while (error >= EPSILON && iter < MAX_ITER);

double duration = omp_get_wtime() - start;
printf("Temps : %.6f s, Itérations : %d, Erreur : %e\n", 
       duration, iter, error);
```

### Analyse de la parallélisation

**Variables** :
- `A` : matrice (lecture seule) → **partagée**
- `b` : vecteur (lecture seule) → **partagé**
- `x_old` : vecteur (lecture seule) → **partagé**
- `x_new` : vecteur (écriture, indices distincts par thread) → **partagé, pas de conflit**
- `sigma`, `row_error`, `j` : **privés** (déclarés dans la clause `private`)
- `error` : accumulateur → **réduction**
- `i` : variable de boucle → **privée automatiquement**

**Pattern double buffering** :
- `x_old` : état k (lecture)
- `x_new` : état k+1 (écriture)
- Swap : `x_old` devient `x_new` pour l'itération suivante
- Barrière implicite à la fin du `parallel for` garantit que tous les threads ont fini

### Optimisations possibles

1. **Stockage compact de la matrice** :
   ```c noexec
   // Au lieu de double **A, utiliser double *A
   // A[i][j] → A[i*N + j]
   // Meilleure localité spatiale
   ```

2. **Éviter la vérification `j != i`** :
   ```c noexec
   sigma = 0;
   for (int j = 0; j < i; j++) {
       sigma += A[i*N + j] * x_old[j];
   }
   for (int j = i+1; j < N; j++) {
       sigma += A[i*N + j] * x_old[j];
   }
   // Ou : inclure le terme diagonal et le soustraire
   sigma = 0;
   for (int j = 0; j < N; j++) {
       sigma += A[i*N + j] * x_old[j];
   }
   sigma -= A[i*N + i] * x_old[i];
   ```

3. **Précalcul de 1/A[i][i]** :
   ```c noexec
   double *inv_diag = malloc(N * sizeof(double));
   for (int i = 0; i < N; i++) {
       inv_diag[i] = 1.0 / A[i*N + i];
   }
   // Dans la boucle :
   x_new[i] = (b[i] - sigma) * inv_diag[i];  // × au lieu de /
   ```

4. **Vectorisation (SIMD)** :
   ```c noexec
   #pragma omp simd
   for (int j = 0; j < N; j++) {
       sigma += A[i*N + j] * x_old[j];
   }
   ```

### Résultats attendus

**Performances typiques** (N=1000) :

| Threads | Temps (s) | Speedup | Efficacité |
|---------|-----------|---------|------------|
| 1       | 2.5       | 1.0     | 100%       |
| 2       | 1.3       | 1.92    | 96%        |
| 4       | 0.7       | 3.57    | 89%        |
| 8       | 0.4       | 6.25    | 78%        |

**Facteurs affectant les performances** :
- Taille de la matrice (N)
- Nombre d'itérations jusqu'à convergence
- Sparsité de la matrice (si A est creuse, beaucoup de calculs inutiles)
- Bande passante mémoire (N grand → A ne tient pas en cache)

### Comparaison avec d'autres méthodes

**Gauss-Seidel** :
- Utilise les valeurs de x_new dès qu'elles sont calculées
- Converge plus vite que Jacobi (2× moins d'itérations)
- **Mais** : difficile à paralléliser (dépendances entre itérations)

**SOR (Successive Over-Relaxation)** :
- Extension de Gauss-Seidel avec facteur de relaxation ω
- Converge encore plus vite
- Même difficulté de parallélisation

**Méthodes directes** (Gauss, LU, Cholesky) :
- Résolution exacte (à l'erreur d'arrondi près)
- Complexité O(N³)
- Jacobi : O(k×N²) où k = nombre d'itérations
- Pour N grand et k petit → Jacobi plus rapide

### Compilation et exécution

```bash
# Compilation
gcc -fopenmp jacobi.c -o jacobi -Wall -Wextra -lm -O2

# Exécution
export OMP_NUM_THREADS=4
./jacobi
```

---

## Comparaison des trois exercices

| Exercice | Type d'algo | Pattern parallèle | Défi principal |
|----------|-------------|-------------------|----------------|
| Chaleur | Stencil 2D | Double buffering | Memory-bound |
| Crible | Élimination | Écritures idempotentes | False sharing |
| Jacobi | Itératif matriciel | Double buffering | Convergence |

**Point commun** : Tous utilisent un pattern itératif avec convergence.

---

## Concepts avancés OpenMP

### 1. Scheduling adaptatif

Pour équilibrer la charge quand les itérations ont des coûts variables :

```c noexec
#pragma omp parallel for schedule(dynamic)
```

**Types de scheduling** :
- `static` : Découpage en chunks égaux (par défaut)
- `dynamic` : Distribution dynamique à la demande
- `guided` : Chunks de taille décroissante
- `auto` : Compilateur décide

### 2. Collapse de boucles imbriquées

Pour paralléliser plusieurs niveaux de boucles :

```c noexec
#pragma omp parallel for collapse(2)
for (int i = 0; i < N; i++) {
    for (int j = 0; j < M; j++) {
        // travail
    }
}
```

Crée N×M itérations distribuées entre threads.

### 3. Nowait (éviter les barrières)

```c noexec
#pragma omp parallel
{
    #pragma omp for nowait
    for (...) { /* travail A */ }
    
    #pragma omp for
    for (...) { /* travail B */ }
}
```

Le `nowait` évite la barrière entre A et B (si B n'a pas besoin que A soit terminé).

### 4. SIMD (vectorisation)

```c noexec
#pragma omp simd
for (int i = 0; i < N; i++) {
    a[i] = b[i] + c[i];
}
```

Exploite les instructions SIMD du processeur (AVX, SSE).

### 5. Tasks (parallélisme de tâches)

Pour algorithmes non-réguliers (arbres, graphes) :

```c noexec
#pragma omp parallel
{
    #pragma omp single
    {
        #pragma omp task
        function1();
        
        #pragma omp task
        function2();
    }
}
```

---

## Debugging et profilage OpenMP

### 1. Variables d'environnement utiles

```bash
export OMP_NUM_THREADS=4
export OMP_SCHEDULE="dynamic,10"
export OMP_PROC_BIND=true          # Affinité CPU
export OMP_DISPLAY_ENV=true        # Afficher config
```

### 2. Détection de race conditions

Utiliser des outils comme :
- **Intel Inspector**
- **Valgrind (helgrind)**
- **ThreadSanitizer** (gcc -fsanitize=thread)

### 3. Mesure fine des performances

```c noexec
double start = omp_get_wtime();
#pragma omp parallel
{
    double thread_start = omp_get_wtime();
    // travail
    double thread_end = omp_get_wtime();
    
    #pragma omp critical
    printf("Thread %d: %.6f s\n", 
           omp_get_thread_num(), thread_end - thread_start);
}
double end = omp_get_wtime();
printf("Total: %.6f s\n", end - start);
```

---

## Fichiers du TP

```
tp3/
├── README.md           # Ce fichier
└── (voir ../tp2/src pour le code source)
```

Note: Les exercices 1 et 2 partagent le code avec TP2. L'exercice 3 (Jacobi) n'a pas été fourni dans le code original.

---

## Points clés à retenir

1. **Jacobi = pattern double buffering** : Comme la propagation de chaleur
2. **Algorithmes itératifs** : Bien adaptés à la parallélisation
3. **Convergence** : Peut varier selon les méthodes (Jacobi vs Gauss-Seidel)
4. **Méthodes directes vs itératives** : Trade-off précision vs temps de calcul
5. **Optimisation matricielle** : Stockage, localité, vectorisation
6. **Scheduling** : Adapter à la régularité du problème

---

## Ressources

- OpenMP 4.5 specification: https://www.openmp.org/specifications/
- LLNL HPC tutorials: https://hpc-tutorials.llnl.gov/openmp/
- Méthodes numériques : "Numerical Recipes" (Press et al.)
- Calcul scientifique parallèle : "Parallel Programming" (Pacheco)
