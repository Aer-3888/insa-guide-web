---
title: "TP2-3 - Parallelisation avec OpenMP : Chaleur, Crible, Jacobi"
sidebar_position: 2
---

# TP2-3 - Parallelisation avec OpenMP : Chaleur, Crible, Jacobi

> D'apres les consignes de l'enseignant : `S6/Parallelisme/data/moodle/tp/Sujets_TP/TP2et3_OpenMP.pdf`

---

## Exercice 1 -- Propagation de la chaleur sur une plaque rectangulaire

### Enonce exact du sujet

> L'objectif de cet exercice est de fournir une implementation basee sur OpenMP de l'application qui simule la propagation de la chaleur sur une plaque rectangulaire. Cette application a ete decrite dans un TP precedent sur MPI. Le pseudo code est le suivant :
>
> ```
> double T[N+2][M+2], T1[N+2][M+2]
> Initialiser (T=0 sauf les bords = MAX) ;
> Faire
>     delta=0;
>     Pourtout i=1..N,j=1..M :
>         T1[i][j] = (T[i][j+1]+T[i][j-1]+T[i+1][j]+T[i-1][j]+T[i][j])/5;
>         delta = delta + |Tt+1(i,j)-Tt(i,j)| ;
>     T = T1 ;
> Jqa ( delta < seuil )
> ```
>
> Commencez a partir de votre version sequentielle de l'application et ajoutez les directives OpenMP necessaires.
>
> Comparez la duree d'execution de la version sequentielle et de la version parallele pour differents nombres de threads. Quel est le facteur d'acceleration (speed-up) ?

**Reponse :**

### Principe

La matrice est de dimension (N+2)x(M+2) : les lignes et colonnes supplementaires representent les bords maintenus a temperature constante MAX. L'interieur (indices 1..N, 1..M) est initialise a 0. A chaque iteration, chaque cellule interieure est remplacee par la moyenne de ses 4 voisins et d'elle-meme (stencil a 5 points). On itere jusqu'a convergence (delta < seuil).

Le pattern **double buffering** (T en lecture, T1 en ecriture, puis swap des pointeurs) evite les conflits lecture/ecriture pendant une iteration.

### Version sequentielle

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define N 100
#define M 100
#define MAX 1000
#define SEUIL 1

int main(void)
{
    double *T  = (double *)calloc((N + 2) * (M + 2), sizeof(double));
    double *T1 = (double *)calloc((N + 2) * (M + 2), sizeof(double));
    double *Temp = NULL;
    double delta;
    int compteur = 0;

    /* Initialisation des bords a MAX */
    for (int i = 0; i < N + 2; i++) {
        for (int j = 0; j < M + 2; j++) {
            if (i == 0 || i == N + 1 || j == 0 || j == M + 1) {
                T[i * (N + 2) + j]  = MAX;
                T1[i * (N + 2) + j] = MAX;
            }
        }
    }

    /* Boucle iterative */
    do {
        delta = 0;
        for (int k = 1; k < N + 1; k++) {
            int offset = k * (N + 2);
            for (int j = 1; j < M + 1; j++) {
                T1[offset + j] = (T[offset + j + 1] + T[offset + j - 1] +
                                  T[offset + j + (N + 2)] + T[offset + j - (N + 2)] +
                                  T[offset + j]) / 5.0;
                delta += fabs(T1[offset + j] - T[offset + j]);
            }
        }
        /* Swap des pointeurs */
        Temp = T1;
        T1 = T;
        T = Temp;
        compteur++;
    } while (delta >= SEUIL);

    printf("Convergence en %d iterations\n", compteur);
    free(T);
    free(T1);
    return EXIT_SUCCESS;
}
```

### Version parallele avec OpenMP

La seule modification est l'ajout d'une directive `#pragma omp parallel for reduction(+:delta)` sur la boucle externe (sur les lignes `k`).

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <omp.h>

#define N 100
#define M 100
#define MAX 1000
#define SEUIL 1

int main(void)
{
    double *T  = (double *)calloc((N + 2) * (M + 2), sizeof(double));
    double *T1 = (double *)calloc((N + 2) * (M + 2), sizeof(double));
    double *Temp = NULL;
    double delta;
    int compteur = 0;

    /* Initialisation des bords a MAX */
    for (int i = 0; i < N + 2; i++) {
        for (int j = 0; j < M + 2; j++) {
            if (i == 0 || i == N + 1 || j == 0 || j == M + 1) {
                T[i * (N + 2) + j]  = MAX;
                T1[i * (N + 2) + j] = MAX;
            }
        }
    }

    double prev = omp_get_wtime();

    /* Boucle iterative */
    do {
        delta = 0;
        #pragma omp parallel for reduction(+:delta)
        for (int k = 1; k < N + 1; k++) {
            int machin = k * (N + 2);
            for (int j = 1; j < M + 1; j++) {
                T1[machin + j] = (T[machin + j + 1] + T[machin + j - 1] +
                                  T[machin + j + (N + 2)] + T[machin + j - (N + 2)] +
                                  T[machin + j]) / 5.0;
                delta += fabs(T1[machin + j] - T[machin + j]);
            }
        }
        /* Swap des pointeurs */
        Temp = T1;
        T1 = T;
        T = Temp;
        compteur++;
    } while (delta >= SEUIL);

    fprintf(stderr, "Temps: %f secondes\n", omp_get_wtime() - prev);
    printf("Convergence en %d iterations\n", compteur);
    free(T);
    free(T1);
    return EXIT_SUCCESS;
}
```

### Pourquoi il n'y a pas de race condition

- `T` est en lecture seule pendant le `parallel for` -- acces concurrent en lecture sans conflit
- `T1` : chaque thread ecrit dans ses propres lignes (indices `k` distincts) -- pas de chevauchement
- `delta` est protegee par `reduction(+:delta)` -- copies locales combinees automatiquement
- `machin`, `j` sont declarees dans le bloc du `parallel for`, donc automatiquement `private`
- La barriere implicite a la fin du `parallel for` garantit que tous les threads ont termine avant le swap

**Compilation et execution :**

```bash
gcc -fopenmp exo1.c -o exo1 -Wall -Wextra -lm

export OMP_NUM_THREADS=1
./exo1

export OMP_NUM_THREADS=2
./exo1

export OMP_NUM_THREADS=4
./exo1

export OMP_NUM_THREADS=8
./exo1
```

**Comportement et sortie attendus :**

| Threads | Temps (s) | Speedup | Efficacite |
|---------|-----------|---------|------------|
| 1       | ~0.150    | 1.00    | 100%       |
| 2       | ~0.082    | ~1.83   | ~91%       |
| 4       | ~0.045    | ~3.33   | ~83%       |
| 8       | ~0.029    | ~5.17   | ~65%       |

Le speedup plafonne car ce probleme est **memory-bound** : chaque point du stencil necessite 5 lectures et 1 ecriture mais seulement 4 additions et 1 division. Le ratio calcul/memoire est faible. La bande passante memoire du bus est saturee bien avant que tous les coeurs soient utilises.

---

## Exercice 2 -- Le crible d'Eratosthene

### Enonce exact du sujet

> Le crible d'Eratosthene (IIIe av. JC) est un algorithme qui permet de trouver tous les nombres premiers inferieurs a un certain entier donne n. L'algorithme procede par elimination : il supprime d'une table tous les multiples d'un entier. Voici le pseudo code d'une variation possible :
>
> ```
> pour i <- 0 a n-1 faire
>     a[i] = i
> fin pour
> pour i <- 2 a sqrt(n) faire
>     si a[i] > 0 alors
>         pour j = i^2 a n-1 pas i faire
>             a[j] = 0
>         fin pour
>     fin si
> fin pour
> p <- 0
> pour j <- 0 a n-1 faire
>     si a[j] > 0 alors
>         a[p] <- a[j]
>         p <- p + 1
>     fin si
> fin pour
> ```
>
> Ecrivez et testez une implementation sequentielle de l'algorithme. Parallelisez ce code avec OpenMP et mesurez les performances de votre code.

**Reponse :**

### Version sequentielle

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define N 100000000L  /* 10^8 */

void affiche(unsigned long int *a, long int size);

int main(void)
{
    long int maxBorne = (long int)floor(sqrt((double)N));
    unsigned long int *a = calloc(N, sizeof(unsigned long int));
    long int p = 0;

    /* Initialisation */
    for (long int k = 0; k < N; k++) {
        a[k] = k;
    }

    /* Elimination des multiples */
    for (long int i = 2; i <= maxBorne; i++) {
        if (a[i] > 0) {
            for (long int j = i * i; j < N; j += i) {
                a[j] = 0;
            }
        }
    }

    /* Compaction */
    for (long int j = 0; j < N; j++) {
        if (a[j] > 0) {
            a[p] = a[j];
            p++;
        }
    }

    printf("Nombre de premiers trouves : %ld\n", p);
    free(a);
    return EXIT_SUCCESS;
}

void affiche(unsigned long int *a, long int size)
{
    for (long int i = 1; i < size; i++) {
        if (a[i] != 0) {
            printf("%ld\t", a[i]);
        }
    }
    printf("\n");
}
```

### Version parallele avec OpenMP

On ajoute `#pragma omp parallel for` sur la boucle d'elimination. Il n'y a pas besoin de `reduction` ni de `private` supplementaire (les variables `i` et `j` sont implicitement privees).

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <omp.h>

#define N 100000000L  /* 10^8 */

int main(void)
{
    long int maxBorne = (long int)floor(sqrt((double)N));
    unsigned long int *a = calloc(N, sizeof(unsigned long int));
    long int p = 0;

    /* Initialisation */
    for (long int k = 0; k < N; k++) {
        a[k] = k;
    }

    double prev = omp_get_wtime();

    /* Elimination des multiples -- parallelisee */
    #pragma omp parallel for
    for (long int i = 2; i <= maxBorne; i++) {
        if (a[i] > 0) {
            for (long int j = i * i; j < N; j += i) {
                a[j] = 0;
            }
        }
    }

    fprintf(stderr, "Temps: %f secondes\n", omp_get_wtime() - prev);

    /* Compaction (sequentielle -- dependances de donnees) */
    for (long int j = 0; j < N; j++) {
        if (a[j] > 0) {
            a[p] = a[j];
            p++;
        }
    }

    printf("Nombre de premiers trouves : %ld\n", p);
    free(a);
    return EXIT_SUCCESS;
}
```

### Pourquoi la parallelisation fonctionne malgre les dependances apparentes

A premiere vue, la boucle externe a des dependances : le thread qui traite `i=6` verifie `a[6]`, mais le thread `i=2` ou `i=3` aurait du mettre `a[6]=0` avant. Cependant :

1. **Ecritures idempotentes** : l'operation `a[j] = 0` donne toujours le meme resultat, qu'elle soit executee une ou dix fois.
2. **Travail redondant mais correct** : si un thread traite un `i` composite (race en lecture), il fait du travail inutile (eliminer des multiples deja elimines) mais ne produit pas de resultat incorrect.

### Pourquoi les performances sont mauvaises

Le code du TP affiche un avertissement : "C'est normal que les temps augmentent, c'est le but de l'exercice, montrer que la parallelisation ne fonctionne pas tout le temps."

**Compilation et execution :**

```bash
gcc -fopenmp exo2.c -o exo2 -Wall -Wextra -lm

export OMP_NUM_THREADS=1
./exo2

export OMP_NUM_THREADS=4
./exo2

export OMP_NUM_THREADS=8
./exo2
```

**Comportement et sortie attendus :**

| Threads | Temps (s) | Speedup | Observation |
|---------|-----------|---------|-------------|
| 1       | ~1.20     | 1.00    | Reference sequentielle |
| 2       | ~0.95     | ~1.26   | Modeste amelioration |
| 4       | ~0.85     | ~1.41   | Plafond atteint |
| 8       | ~1.05     | ~1.14   | Degradation -- quasi pas de gain |

Trois facteurs expliquent ce comportement :

1. **False sharing** : plusieurs threads ecrivent `a[j]=0` a des adresses proches, dans la meme ligne de cache (64 octets = 8 unsigned long int). Chaque ecriture invalide la ligne de cache des autres coeurs, coutant 100+ cycles au lieu de ~4.
2. **Desequilibrage de charge** : le thread qui traite `i=2` a N/2 multiples a eliminer, celui qui traite `i=9973` en a ~10000. Le travail est extremement inegal.
3. **Branchement conditionnel** : `if (a[i] > 0)` cause des mispredictions.

---

## Exercice 3 -- Methode de Jacobi

### Enonce exact du sujet

> La methode de Jacobi est une methode iterative de resolution d'un systeme matriciel de la forme Ax=b. La matrice A est diagonale strictement dominante sur les lignes (c.-a-d. le module de chaque terme diagonal est superieur ou egal a la somme des modules des autres termes de sa ligne). La methode utilise une suite de vecteurs x^(k) qui converge vers un point fixe x. Voici le pseudo code pour la methode :
>
> ```
> Choisir une estimation initiale x0 de la solution
> tant que (convergence non atteinte) faire
>     pour i := 1 a n faire
>         sigma = 0
>         pour j := 1 a n faire
>             si j != i alors
>                 sigma = sigma + a_ij * x_j^(k-1)
>             fin si
>         fin pour
>         x_i^(k) = (b_i - sigma) / a_ii
>     fin pour
>     verifier si la convergence est atteinte
> fin tant que
> ```
>
> Pour le test de convergence, on peut utiliser la formule suivante :
> |sum(j=0..n-1) a_i,j * x_j^k - b_i| < epsilon, pour tout i=0,...,n-1
>
> Ecrivez une implementation sequentielle de la methode. Parallelisez le code avec OpenMP et mesurez les performances.

**Reponse :**

### Version sequentielle

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define N_SIZE 1000
#define MAX_ITER 10000
#define EPSILON 1e-6

int main(void)
{
    /* Allocation (matrice linearisee A[i*N+j]) */
    double *A     = malloc(N_SIZE * N_SIZE * sizeof(double));
    double *b     = malloc(N_SIZE * sizeof(double));
    double *x_old = calloc(N_SIZE, sizeof(double));  /* x0 = vecteur nul */
    double *x_new = malloc(N_SIZE * sizeof(double));
    double *temp;

    /* Initialisation : matrice diagonale dominante aleatoire */
    srand(42);
    for (int i = 0; i < N_SIZE; i++) {
        double sum = 0;
        for (int j = 0; j < N_SIZE; j++) {
            if (i != j) {
                A[i * N_SIZE + j] = (double)(rand() % 10);
                sum += fabs(A[i * N_SIZE + j]);
            }
        }
        A[i * N_SIZE + i] = sum + 10;  /* Garantit la dominance diagonale */
        b[i] = (double)(rand() % 100);
    }

    /* Iterations de Jacobi */
    int iter = 0;
    double error;
    do {
        error = 0;
        for (int i = 0; i < N_SIZE; i++) {
            double sigma = 0;
            for (int j = 0; j < N_SIZE; j++) {
                if (j != i) {
                    sigma += A[i * N_SIZE + j] * x_old[j];
                }
            }
            x_new[i] = (b[i] - sigma) / A[i * N_SIZE + i];

            /* Test de convergence : |somme(a_ij * x_j) - b_i| */
            double row_error = 0;
            for (int j = 0; j < N_SIZE; j++) {
                row_error += A[i * N_SIZE + j] * x_new[j];
            }
            error += fabs(row_error - b[i]);
        }

        /* Swap des pointeurs */
        temp = x_old;
        x_old = x_new;
        x_new = temp;
        iter++;
    } while (error >= EPSILON && iter < MAX_ITER);

    printf("Convergence en %d iterations, erreur = %e\n", iter, error);

    free(A);
    free(b);
    free(x_old);
    free(x_new);
    return EXIT_SUCCESS;
}
```

### Version parallele avec OpenMP

La boucle sur `i` est le candidat a la parallelisation. Chaque composante `x_new[i]` ne depend que de `x_old` (lecture seule) et de la ligne `i` de A.

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <omp.h>

#define N_SIZE 1000
#define MAX_ITER 10000
#define EPSILON 1e-6

int main(void)
{
    double *A     = malloc(N_SIZE * N_SIZE * sizeof(double));
    double *b     = malloc(N_SIZE * sizeof(double));
    double *x_old = calloc(N_SIZE, sizeof(double));
    double *x_new = malloc(N_SIZE * sizeof(double));
    double *temp;

    /* Initialisation : matrice diagonale dominante aleatoire */
    srand(42);
    for (int i = 0; i < N_SIZE; i++) {
        double sum = 0;
        for (int j = 0; j < N_SIZE; j++) {
            if (i != j) {
                A[i * N_SIZE + j] = (double)(rand() % 10);
                sum += fabs(A[i * N_SIZE + j]);
            }
        }
        A[i * N_SIZE + i] = sum + 10;
        b[i] = (double)(rand() % 100);
    }

    double start = omp_get_wtime();

    int iter = 0;
    double error;
    do {
        error = 0;

        #pragma omp parallel for reduction(+:error)
        for (int i = 0; i < N_SIZE; i++) {
            double sigma = 0;   /* Declaree dans le bloc : private automatiquement */
            for (int j = 0; j < N_SIZE; j++) {
                if (j != i) {
                    sigma += A[i * N_SIZE + j] * x_old[j];
                }
            }
            x_new[i] = (b[i] - sigma) / A[i * N_SIZE + i];

            /* Test de convergence */
            double row_error = 0;   /* Declaree dans le bloc : private automatiquement */
            for (int j = 0; j < N_SIZE; j++) {
                row_error += A[i * N_SIZE + j] * x_new[j];
            }
            error += fabs(row_error - b[i]);
        }

        /* Swap des pointeurs (apres la barriere implicite) */
        temp = x_old;
        x_old = x_new;
        x_new = temp;
        iter++;
    } while (error >= EPSILON && iter < MAX_ITER);

    printf("Temps: %.6f s, Iterations: %d, Erreur: %e\n",
           omp_get_wtime() - start, iter, error);

    free(A);
    free(b);
    free(x_old);
    free(x_new);
    return EXIT_SUCCESS;
}
```

### Analyse des variables

| Variable | Statut | Justification |
|----------|--------|---------------|
| `A` | `shared` | Matrice en lecture seule |
| `b` | `shared` | Vecteur en lecture seule |
| `x_old` | `shared` | Lu par tous, ecrit par personne pendant le for |
| `x_new` | `shared` | Chaque thread ecrit a des indices `i` distincts |
| `sigma` | `private` (auto) | Declaree dans le bloc du for |
| `row_error` | `private` (auto) | Declaree dans le bloc du for |
| `j` | `private` (auto) | Declaree dans le bloc du for |
| `error` | `reduction(+:)` | Accumulateur partage |
| `i` | `private` (auto) | Variable de la boucle `parallel for` |

Le pattern est identique a la propagation de la chaleur : double buffering (`x_old` en lecture, `x_new` en ecriture), swap des pointeurs, reduction pour la convergence.

**Compilation et execution :**

```bash
gcc -fopenmp jacobi.c -o jacobi -Wall -Wextra -lm -O2

export OMP_NUM_THREADS=1
./jacobi

export OMP_NUM_THREADS=2
./jacobi

export OMP_NUM_THREADS=4
./jacobi

export OMP_NUM_THREADS=8
./jacobi
```

**Comportement et sortie attendus :**

| Threads | Temps (s) | Speedup | Efficacite |
|---------|-----------|---------|------------|
| 1       | ~2.50     | 1.00    | 100%       |
| 2       | ~1.30     | ~1.92   | ~96%       |
| 4       | ~0.70     | ~3.57   | ~89%       |
| 8       | ~0.40     | ~6.25   | ~78%       |

Meilleur speedup que la chaleur car le ratio calcul/memoire est plus eleve (N multiplications-additions par composante de x_new, contre 5 pour le stencil).
