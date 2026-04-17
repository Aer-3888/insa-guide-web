---
title: "TP5 - MPI : Produit matrice-vecteur distribue"
sidebar_position: 5
---

# TP5 - MPI : Produit matrice-vecteur distribue

> Following teacher instructions from: `S6/Parallelisme/data/moodle/tp/Sujets_TP/TP5_mpi.pdf`

---

## Calcul distribue d'un produit scalaire

### Enonce exact du sujet

> On se propose de realiser le calcul du produit scalaire d'une matrice par un vecteur de maniere distribuee sur P processeurs.
>
> La matrice Mat(N,N) et le vecteur V(N) sont initialement presents sur le processus 0. A la fin du calcul, le vecteur resultat R(N) devra egalement se trouver sur le processeur 0 (ceci est une variante de l'exemple vu en cours).

Le probleme mathematique : calculer **R = Mat x V** ou R[i] = somme(j=0..N-1) Mat[i][j] * V[j].

---

## Implementation 1

### Enonce exact du sujet

> La matrice est decoupee en N/P blocs de lignes, le vecteur V est replique sur tous les processeurs et le vecteur resultat R(N) est decoupe en N/P sous vecteurs.
>
> Realisez l'implementation de cette solution et realisez des mesures de performances en fonction du nombre de processeurs utilises.

**Answer:**

### Strategie

```
Etape 1 : P0 diffuse V a tous les processus         --> MPI_Bcast
Etape 2 : P0 distribue Mat en blocs de N/P lignes   --> MPI_Scatter
Etape 3 : Chaque processus calcule N/P produits scalaires  --> Calcul local
Etape 4 : P0 rassemble les N/P composantes de R     --> MPI_Gather
```

### Schema de distribution

```
Matrice NxN (sur P0)          Vecteur V         Resultat R
+-------------------+         +---+             +---+
| lignes 0..N/P-1   | --+     | V | -- Bcast    | R0| <- Proc 0
+-------------------+   |     +---+    =====>   +---+
| lignes N/P..2N/P-1| --+                       | R1| <- Proc 1
+-------------------+   |                       +---+
| lignes 2N/P..3N/P-1|--+                       | R2| <- Proc 2
+-------------------+   |                       +---+
| lignes 3N/P..N-1  | --+                       | R3| <- Proc 3
+-------------------+                           +---+
      Scatter                                   Gather
                                                =====>
                                                  P0
```

### Code complet

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <mpi.h>
#include <unistd.h>
#include <assert.h>

#define N 10000

void initVector(double *vect, size_t n)
{
    for (size_t i = 0; i < n; ++i) {
        vect[i] = (double)(rand() % 1000);
    }
}

void afficheVector(double *vect, size_t n)
{
    for (size_t i = 0; i < n; ++i) {
        printf("%lf\t", vect[i]);
    }
    printf("\n");
}

int main(int argc, char *argv[])
{
    int proc;       /* rang du processus courant */
    int nbproc;     /* nombre total de processus */
    int n = N;
    int k = 0, l = 0;
    double t0, t1;
    double *matriceAMult = NULL;
    double *vectAMult    = NULL;
    double *matFragment  = NULL;
    double *rezFragment  = NULL;
    double *rez          = NULL;

    srand(time(NULL));

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &proc);
    MPI_Comm_size(MPI_COMM_WORLD, &nbproc);

    if (argc > 1) {
        n = strtol(argv[1], NULL, 10);
    } else {
        printf("Default N size : %d\n", N);
    }

    /* N doit etre divisible par le nombre de processus */
    assert(n % nbproc == 0);

    /* Allocation memoire (tous les processus) */
    matriceAMult = NULL;   /* Seul P0 allouera la matrice complete */
    vectAMult    = (double *)malloc(n * sizeof(double));
    matFragment  = (double *)malloc(n * n / nbproc * sizeof(double));
    rezFragment  = (double *)malloc(n / nbproc * sizeof(double));
    rez          = (double *)malloc(n * sizeof(double));

    /*** Initialisation (P0 uniquement) ***/
    if (proc == 0) {
        matriceAMult = (double *)malloc(n * n * sizeof(double));
        for (l = 0; l < n; l++) {
            for (k = 0; k < n; k++) {
                /* Test avec identite : decommenter pour verifier R == V */
                /* matriceAMult[k + l*n] = (k == l) ? 1.0 : 0.0; */
                matriceAMult[k + l * n] = (double)(rand() % 1000);
            }
        }
        initVector(vectAMult, n);
        t0 = MPI_Wtime();
    }

    /*** Distribution des donnees ***/
    /* Broadcast du vecteur V a tous les processus */
    MPI_Bcast(vectAMult, n, MPI_DOUBLE, 0, MPI_COMM_WORLD);

    /* Scatter de la matrice : chaque processus recoit N/P lignes */
    MPI_Scatter(matriceAMult, n * (n / nbproc), MPI_DOUBLE,
                matFragment, n * (n / nbproc), MPI_DOUBLE,
                0, MPI_COMM_WORLD);

    /*** Calcul local : N/P produits scalaires ***/
    for (k = 0; k < n / nbproc; k++) {
        rezFragment[k] = 0;
        for (l = 0; l < n; l++) {
            rezFragment[k] += matFragment[k * n + l] * vectAMult[l];
        }
    }

    /*** Collecte des resultats ***/
    MPI_Gather(rezFragment, n / nbproc, MPI_DOUBLE,
               rez, n / nbproc, MPI_DOUBLE,
               0, MPI_COMM_WORLD);

    if (proc == 0) {
        t1 = MPI_Wtime();
        fprintf(stderr, "time %.6lf (s)\n", t1 - t0);
        /* afficheVector(rez, n); */
    }

    /*** Liberation memoire ***/
    MPI_Finalize();
    if (proc == 0) {
        free(matriceAMult);
        matriceAMult = NULL;
    }
    free(vectAMult);
    vectAMult = NULL;
    free(matFragment);
    matFragment = NULL;
    free(rezFragment);
    rezFragment = NULL;
    free(rez);
    rez = NULL;

    return EXIT_SUCCESS;
}
```

### Detail des communications collectives

**MPI_Bcast(V) :**
```c
MPI_Bcast(vectAMult, n, MPI_DOUBLE, 0, MPI_COMM_WORLD);
```
P0 envoie les N doubles de V a tous. Apres, tous les processus ont une copie identique de V.

**MPI_Scatter(Mat) :**
```c
MPI_Scatter(matriceAMult, n*(n/nbproc), MPI_DOUBLE,
            matFragment,  n*(n/nbproc), MPI_DOUBLE, 0, MPI_COMM_WORLD);
```
Decoupe la matrice en P morceaux contigus de n*(n/nbproc) doubles. Le processus k recoit les lignes k*N/P a (k+1)*N/P-1. Le premier argument (`matriceAMult`) n'est lu que par P0 (peut etre NULL sur les autres).

**MPI_Gather(R) :**
```c
MPI_Gather(rezFragment, n/nbproc, MPI_DOUBLE,
           rez,         n/nbproc, MPI_DOUBLE, 0, MPI_COMM_WORLD);
```
Rassemble les fragments de resultat dans l'ordre des rangs. P0 obtient le vecteur complet.

**Compilation & Run:**

```bash
mpicc main.c -o main -Wall -Wextra -lm

mpiexec -n 1 ./main 10000
mpiexec -n 2 ./main 10000
mpiexec -n 4 ./main 10000
mpiexec -n 8 ./main 10000
# ATTENTION : N doit etre divisible par nbproc
# mpiexec -n 3 ./main 10000   --> CRASH (10000 % 3 != 0)
```

**Expected behavior/output:**

| Processus | Temps (s) | Speedup | Efficacite |
|-----------|-----------|---------|------------|
| 1         | ~0.800    | 1.00    | 100%       |
| 2         | ~0.420    | ~1.90   | ~95%       |
| 4         | ~0.220    | ~3.64   | ~91%       |
| 8         | ~0.130    | ~6.15   | ~77%       |

Le Scatter de la matrice (N^2 doubles) domine les communications. Pour P grand, la latence accumulee reduit l'efficacite.

---

## Implementation 2

### Enonce exact du sujet

> Le processeur 0 agit comme "maitre" et envoie les calculs a faire a chaque noeud, ligne par ligne. Chaque noeud renvoie son resultat (une composante de R). Le vecteur V est replique sur tous les processeurs comme dans l'implementation precedente.
>
> Realisez l'implementation de cette solution et realisez des mesures de performances en fonction du nombre de processeurs utilises.

**Answer:**

### Strategie

Le maitre (P0) distribue les lignes dynamiquement aux esclaves. Chaque esclave recoit une ligne, calcule le produit scalaire, renvoie le resultat, et demande une nouvelle ligne.

### Code complet

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <mpi.h>
#include <assert.h>

#define N 10000
#define TAG_LIGNE  1
#define TAG_INDEX  2
#define TAG_RESULT 3
#define TAG_FIN    4

void initVector(double *vect, size_t n)
{
    for (size_t i = 0; i < n; ++i) {
        vect[i] = (double)(rand() % 1000);
    }
}

int main(int argc, char *argv[])
{
    int rank, nbproc;
    int n = N;
    double t0, t1;
    double *matrice = NULL;
    double *V       = NULL;
    double *R       = NULL;

    srand(time(NULL));

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &nbproc);

    if (argc > 1) {
        n = strtol(argv[1], NULL, 10);
    }

    assert(nbproc >= 2);  /* Il faut au moins 1 maitre + 1 esclave */

    V = (double *)malloc(n * sizeof(double));

    if (rank == 0) {
        /*** MAITRE ***/
        matrice = (double *)malloc(n * n * sizeof(double));
        R       = (double *)malloc(n * sizeof(double));

        /* Initialisation */
        for (int l = 0; l < n; l++) {
            for (int k = 0; k < n; k++) {
                matrice[k + l * n] = (double)(rand() % 1000);
            }
        }
        initVector(V, n);

        /* Broadcast de V a tous */
        MPI_Bcast(V, n, MPI_DOUBLE, 0, MPI_COMM_WORLD);

        t0 = MPI_Wtime();

        int ligne_courante = 0;
        int lignes_recues = 0;

        /* Distribuer les premieres lignes aux esclaves */
        for (int p = 1; p < nbproc && ligne_courante < n; p++) {
            MPI_Send(&matrice[ligne_courante * n], n, MPI_DOUBLE,
                     p, TAG_LIGNE, MPI_COMM_WORLD);
            MPI_Send(&ligne_courante, 1, MPI_INT,
                     p, TAG_INDEX, MPI_COMM_WORLD);
            ligne_courante++;
        }

        /* Boucle : recevoir un resultat, envoyer une nouvelle ligne */
        while (lignes_recues < n) {
            double resultat;
            int index_recu;
            MPI_Status status;

            MPI_Recv(&resultat, 1, MPI_DOUBLE,
                     MPI_ANY_SOURCE, TAG_RESULT, MPI_COMM_WORLD, &status);
            int source = status.MPI_SOURCE;
            MPI_Recv(&index_recu, 1, MPI_INT,
                     source, TAG_INDEX, MPI_COMM_WORLD, &status);
            R[index_recu] = resultat;
            lignes_recues++;

            if (ligne_courante < n) {
                /* Envoyer une nouvelle ligne */
                MPI_Send(&matrice[ligne_courante * n], n, MPI_DOUBLE,
                         source, TAG_LIGNE, MPI_COMM_WORLD);
                MPI_Send(&ligne_courante, 1, MPI_INT,
                         source, TAG_INDEX, MPI_COMM_WORLD);
                ligne_courante++;
            } else {
                /* Signaler la fin a cet esclave */
                MPI_Send(NULL, 0, MPI_DOUBLE,
                         source, TAG_FIN, MPI_COMM_WORLD);
            }
        }

        t1 = MPI_Wtime();
        fprintf(stderr, "time %.6lf (s)\n", t1 - t0);

        free(matrice);
        free(R);
    } else {
        /*** ESCLAVE ***/

        /* Broadcast de V (tous doivent appeler Bcast) */
        MPI_Bcast(V, n, MPI_DOUBLE, 0, MPI_COMM_WORLD);

        double *ligne = (double *)malloc(n * sizeof(double));

        while (1) {
            MPI_Status status;

            /* Recevoir une ligne ou le signal de fin */
            MPI_Recv(ligne, n, MPI_DOUBLE,
                     0, MPI_ANY_TAG, MPI_COMM_WORLD, &status);

            if (status.MPI_TAG == TAG_FIN) break;

            int index;
            MPI_Recv(&index, 1, MPI_INT,
                     0, TAG_INDEX, MPI_COMM_WORLD, MPI_STATUS_IGNORE);

            /* Produit scalaire */
            double resultat = 0;
            for (int j = 0; j < n; j++) {
                resultat += ligne[j] * V[j];
            }

            /* Renvoyer le resultat et l'index */
            MPI_Send(&resultat, 1, MPI_DOUBLE,
                     0, TAG_RESULT, MPI_COMM_WORLD);
            MPI_Send(&index, 1, MPI_INT,
                     0, TAG_INDEX, MPI_COMM_WORLD);
        }

        free(ligne);
    }

    free(V);
    MPI_Finalize();
    return EXIT_SUCCESS;
}
```

**Compilation & Run:**

```bash
mpicc maitre_esclave.c -o maitre_esclave -Wall -Wextra -lm

mpiexec -n 2 ./maitre_esclave 10000
mpiexec -n 4 ./maitre_esclave 10000
mpiexec -n 8 ./maitre_esclave 10000
```

**Expected behavior/output:**

L'implementation 2 est significativement plus lente que l'implementation 1 pour ce probleme regulier :

| Processus | Impl. 1 (s) | Impl. 2 (s) | Rapport |
|-----------|-------------|-------------|---------|
| 2         | ~0.420      | ~1.200      | ~3x     |
| 4         | ~0.220      | ~0.800      | ~4x     |
| 8         | ~0.130      | ~0.500      | ~4x     |

### Comparaison des deux implementations

| Aspect | Impl. 1 (Scatter/Gather) | Impl. 2 (Maitre-esclave) |
|--------|--------------------------|--------------------------|
| Nombre de messages | 3 collectives | ~2N point-a-point |
| Latence totale | O(log P * alpha) | O(N * alpha) |
| Equilibrage de charge | Statique (blocs egaux) | Dynamique (a la demande) |
| Complexite du code | Simple | Moyenne |
| Performance | Excellente | Mediocre pour probleme regulier |
| Flexibilite | Faible | Elevee |

Pour N=10000 et latence alpha=1 microseconde, l'impl. 2 accumule ~20ms de latence (20000 messages) contre ~3 microsecondes pour l'impl. 1 (3 collectives). Le rapport est d'environ 7000x en latence.

**Quand l'impl. 2 est meilleure :** problemes irreguliers (calculs de duree variable), processeurs heterogenes, tolerance aux pannes.
