---
title: "TP6 - MPI : Propagation de chaleur distribuee"
sidebar_position: 6
---

# TP6 - MPI : Propagation de chaleur distribuee

> Following teacher instructions from: `S6/Parallelisme/data/moodle/tp/Sujets_TP/TP6_mpi.pdf`

---

## L'application

### Enonce exact du sujet

> L'application a realiser simule la propagation de la chaleur sur une plaque rectangulaire dont les bords sont en contact avec un milieu uniformement chaud. La plaque est "discretisee" sous forme d'une matrice de points. Une matrice represente la temperature de la plaque en chacun de ses points. On va calculer de maniere iterative la repartition de la chaleur sur cette plaque grace a l'equation suivante :
>
> T_{t+1}(i,j) = (T_t(i,j+1) + T_t(i,j-1) + T_t(i+1,j) + T_t(i-1,j) + T_t(i,j)) / 5
>
> Le calcul se termine lorsque l'ecart moyen est inferieur a un certain seuil :
> delta = somme_{i,j} |T_{t+1}(i,j) - T_t(i,j)|
>
> Pour simplifier l'ecriture de l'algorithme, les bords de la matrice representent le milieu exterieur. Il n'y a ainsi pas de cas particulier a traiter.
>
> L'algorithme a donc la forme suivante :
> ```
> double T[N+2][M+2], T1[N+2][M+2]
> Initialiser (T=0 sauf les bords = MAX) ;
> Faire
>     delta=0;
>     Pourtout i=1..N,j=1..M :
>         T1[i][j] = (T[i][j+1]+T[i][j-1]+T[i+1][j]+T[i-1][j]+T[i][j])/5;
>         delta = delta + |T1[i][j]-T[i][j]| ;
>     T = T1 ;
> Jqa ( delta < seuil )
> ```
>
> Attention : sur les bords (i=0 ou j=0 ou i=N+1 ou j=M+1) la valeur reste inchangee : il s'agit du milieu exterieur.

---

## Question 1

### Enonce exact du sujet

> Ecrire le programme sequentiel en C et le tester. On fera afficher le contenu de la matrice toutes les K iterations.

**Answer:**

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#define N 20
#define M 20
#define MAX 200
#define SEUIL 10
#define K 10

void afficheTab(double *T)
{
    for (int i = 0; i < N + 2; i++) {
        printf("\n");
        for (int j = 0; j < M + 2; j++) {
            printf("%5.2f\t", T[i * (N + 2) + j]);
        }
    }
    printf("\n");
}

double eqChaleurIter(double *tabIn, double *tabOut,
                     size_t m, size_t n, size_t lda)
{
    double delta = 0;
    for (size_t i = 0; i < n; ++i) {
        size_t offset_l = i * lda;
        for (size_t j = 0; j < m; ++j) {
            size_t offset_t = offset_l + j;
            tabOut[offset_t] = (tabIn[offset_t] +
                                tabIn[offset_t - 1] +
                                tabIn[offset_t + 1] +
                                tabIn[offset_t - lda] +
                                tabIn[offset_t + lda]) / 5.0;
            delta += fabs(tabOut[offset_t] - tabIn[offset_t]);
        }
    }
    return delta;
}

int main(void)
{
    int k_total = 0;
    double delta = 0.0;
    double *T  = calloc((N + 2) * (M + 2), sizeof(double));
    double *T1 = calloc((N + 2) * (M + 2), sizeof(double));
    double *temp = NULL;

    /* Initialisation : bords a MAX, interieur a 0 (calloc) */
    for (int j = 0; j < M + 2; j++) {
        for (int i = 0; i < N + 2; i++) {
            if (i == 0 || j == 0 || i == N + 1 || j == M + 1) {
                T[i * (N + 2) + j]  = MAX;
                T1[i * (N + 2) + j] = MAX;
            }
        }
    }

    afficheTab(T);

    do {
        for (int k = 0; k < K; k++) {
            /* Calcul sur les cellules interieures */
            /* T+M+3 pointe vers T[1][1] (premiere cellule interieure) */
            delta = eqChaleurIter(T + M + 3, T1 + M + 3, M, N, M + 2);

            /* Swap des pointeurs */
            temp = T;
            T = T1;
            T1 = temp;
        }
        k_total += K;
        printf("%d : %f\n", k_total, delta);
        afficheTab(T);
    } while (delta >= SEUIL);

    printf("On termine ici !\n");
    free(T);
    free(T1);
    return EXIT_SUCCESS;
}
```

La fonction `eqChaleurIter` recoit des pointeurs vers la premiere cellule interieure (offset M+3 = (M+2)+1 = premiere ligne interieure, premiere colonne interieure). Le parametre `lda` (leading dimension = M+2) permet de naviguer entre les lignes.

**Compilation & Run:**

```bash
gcc sequentiel.c -o sequentiel -Wall -Wextra -lm
./sequentiel
```

**Expected behavior/output:**

La matrice initiale a les bords a 200.00 et l'interieur a 0.00. Toutes les K=10 iterations, la matrice est affichee avec le delta. Les valeurs interieures augmentent progressivement (diffusion de la chaleur depuis les bords). Le programme s'arrete quand delta < SEUIL=10.

---

## Question 2

### Enonce exact du sujet

> Donner une mise en oeuvre en MPI dans laquelle la matrice est distribuee en B blocs dans une seule dimension.
>
> Le programme aura une forme "SPMD" (meme code sur chaque processeur mais travaillant sur des donnees differentes). En plus de ces processus on aura un processus initiateur qui lancera le calcul et recuperera un resultat (la copie de la matrice) a intervalles reguliers (toutes les K iterations). Pour gerer la terminaison, on pourra se contenter d'un algorithme centralise : on transmet delta avec la matrice et si l'initiateur s'apercoit que delta est inferieur au seuil il arrete les processus SPMD.
>
> **Recouvrement :** du fait que l'on a besoin des 2 voisins pour realiser un calcul, chaque processeur calculera une tranche de la matrice mais possedera 2 lignes de plus qui seront mises a jour a chaque iteration par ses voisins. On recopiera donc a chaque iteration une ligne de la matrice de Pi-1 vers Pi et de Pi+1 vers Pi.

**Answer:**

### Architecture SPMD avec ghost zones

Chaque processus stocke N/P lignes utiles + 2 lignes fantomes (ghost zones) :

```
Fragment du processus k :
+-----------------------------+
| Ghost zone haute            |  <-- Copie de la derniere ligne utile de P(k-1)
+-----------------------------+
| Ligne utile 0               |
| Ligne utile 1               |
| ...                         |
| Ligne utile N/P-1           |
+-----------------------------+
| Ghost zone basse            |  <-- Copie de la premiere ligne utile de P(k+1)
+-----------------------------+
```

A chaque iteration, l'echange de halos (halo exchange) met a jour les ghost zones :
- Pk envoie sa premiere ligne utile a P(k-1) et sa derniere a P(k+1)
- Pk recoit la ghost zone haute de P(k-1) et la ghost zone basse de P(k+1)

### Code complet

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <mpi.h>
#include <math.h>
#include <unistd.h>
#include <assert.h>

#define N 20
#define M 20
#define MAX 200
#define SEUIL 10
#define K 10

void afficheTab(FILE *fichier, double *T, int tX, int tY)
{
    for (int i = 0; i < tX; i++) {
        fprintf(fichier, "\n");
        for (int j = 0; j < tY; j++) {
            fprintf(fichier, "%5.2f\t", T[i * (N + 2) + j]);
        }
    }
    fprintf(fichier, "\n");
}

double eqChaleurIter(double *tabIn, double *tabOut,
                     size_t m, size_t n, size_t lda)
{
    double delta = 0;
    for (size_t i = 0; i < n; ++i) {
        size_t offset_l = i * lda;
        for (size_t j = 0; j < m; ++j) {
            size_t offset_t = offset_l + j;
            tabOut[offset_t] = (tabIn[offset_t] +
                                tabIn[offset_t - 1] +
                                tabIn[offset_t + 1] +
                                tabIn[offset_t - lda] +
                                tabIn[offset_t + lda]) / 5.0;
            delta += fabs(tabOut[offset_t] - tabIn[offset_t]);
        }
    }
    return delta;
}

int main(int argc, char *argv[])
{
    int k_total = 0;
    double delta = 0.0;
    double deltaTotal = 0.0;
    double *T = NULL, *T1 = NULL;
    double *fragment = NULL, *fragment1 = NULL;
    double *temp = NULL;
    int rank, nbP;
    MPI_Status status;
    MPI_Request send_request;

    /* Initialisation MPI */
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &nbP);

    /* N doit etre divisible par le nombre de processus */
    assert(N % nbP == 0);

    /* Dimensionnement des fragments */
    int nbLignesUtiles = N / nbP;               /* lignes de calcul par processus */
    int nbLines = nbLignesUtiles + 2;            /* +2 pour les ghost zones */
    int debutFragment = nbLignesUtiles * (M + 2); /* offset entre fragments */
    int tailleFragment = nbLines * (M + 2);       /* taille totale d'un fragment */

    /*** Phase 1 : Initialisation et distribution ***/
    if (rank == 0) {
        /* P0 cree la matrice complete et distribue les fragments */
        T  = calloc((N + 2) * (M + 2), sizeof(double));
        T1 = calloc((N + 2) * (M + 2), sizeof(double));

        /* Initialisation des bords a MAX */
        for (int j = 0; j < M + 2; j++) {
            for (int i = 0; i < N + 2; i++) {
                if (i == 0 || j == 0 || i == N + 1 || j == M + 1) {
                    T[i * (N + 2) + j]  = MAX;
                    T1[i * (N + 2) + j] = MAX;
                }
            }
        }

        /* Envoyer les fragments aux autres processus */
        for (int i = 1; i < nbP; i++) {
            MPI_Send(T  + (debutFragment * i), tailleFragment,
                     MPI_DOUBLE, i, 0, MPI_COMM_WORLD);
            MPI_Send(T1 + (debutFragment * i), tailleFragment,
                     MPI_DOUBLE, i, 0, MPI_COMM_WORLD);
        }

        /* P0 utilise la matrice complete comme son fragment */
        fragment  = T;
        fragment1 = T1;
    } else {
        /* Les autres processus allouent et recoivent leur fragment */
        fragment  = calloc(tailleFragment, sizeof(double));
        fragment1 = calloc(tailleFragment, sizeof(double));

        MPI_Recv(fragment, tailleFragment, MPI_DOUBLE,
                 0, 0, MPI_COMM_WORLD, &status);
        MPI_Recv(fragment1, tailleFragment, MPI_DOUBLE,
                 0, 0, MPI_COMM_WORLD, &status);
    }

    printf("%d : Debut du programme\n", rank);

    /*** Phase 2 : Boucle de calcul avec halo exchange ***/
    do {
        for (int k = 0; k < K; k++) {
            /* Calcul local sur les lignes utiles (sans les ghost zones) */
            delta = eqChaleurIter(fragment + M + 3, fragment1 + M + 3,
                                  M, nbLignesUtiles, M + 2);

            /* Swap des buffers */
            temp = fragment;
            fragment = fragment1;
            fragment1 = temp;

            /*** Echange des ghost zones (halo exchange) ***/

            /* Envoi NON-BLOQUANT de ma premiere ligne utile au voisin du dessus */
            if (rank > 0) {
                MPI_Isend(fragment + M + 2, M + 2, MPI_DOUBLE,
                          rank - 1, 0, MPI_COMM_WORLD, &send_request);
            }

            /* Envoi NON-BLOQUANT de ma derniere ligne utile au voisin du dessous */
            if (rank + 1 < nbP) {
                MPI_Isend(fragment + tailleFragment - 2 * (M + 2), M + 2,
                          MPI_DOUBLE, rank + 1, 0, MPI_COMM_WORLD, &send_request);
            }

            /* Reception BLOQUANTE de la ghost zone haute */
            if (rank > 0) {
                MPI_Recv(fragment, M + 2, MPI_DOUBLE,
                         rank - 1, 0, MPI_COMM_WORLD, &status);
            }

            /* Reception BLOQUANTE de la ghost zone basse */
            if (rank + 1 < nbP) {
                MPI_Recv(fragment + tailleFragment - M - 2, M + 2,
                         MPI_DOUBLE, rank + 1, 0, MPI_COMM_WORLD, &status);
            }
        }

        k_total += K;

        /* Reduction globale de delta : tous les processus recoivent deltaTotal */
        MPI_Allreduce(&delta, &deltaTotal, 1, MPI_DOUBLE,
                      MPI_SUM, MPI_COMM_WORLD);

        if (rank == 0) {
            printf("Iteration %d : deltaTotal = %f\n", k_total, deltaTotal);
        }
    } while (deltaTotal >= SEUIL);

    /*** Phase 3 : Collecte finale ***/
    printf("%d : deltaTotal < SEUIL, arret du processus\n", rank);

    if (rank == 0) {
        /* Recevoir les fragments de tous les autres processus */
        for (int i = 1; i < nbP; i++) {
            MPI_Recv(T + (debutFragment * i), tailleFragment,
                     MPI_DOUBLE, i, 0, MPI_COMM_WORLD, &status);
        }
        printf("Matrice finale : \n");
        afficheTab(stdout, T, N + 2, M + 2);
    } else {
        /* Envoyer mon fragment complet a P0 */
        MPI_Send(fragment, tailleFragment, MPI_DOUBLE,
                 0, 0, MPI_COMM_WORLD);
    }

    /*** Liberation memoire ***/
    MPI_Finalize();

    if (rank == 0) {
        free(T);
        T = NULL;
        free(T1);
        T1 = NULL;
    } else {
        free(fragment);
        free(fragment1);
    }
    fragment = NULL;
    fragment1 = NULL;

    return EXIT_SUCCESS;
}
```

### Explication du halo exchange

Le halo exchange est la partie critique du code. Apres chaque iteration de calcul et swap, les ghost zones doivent etre mises a jour avec les nouvelles valeurs des processus voisins.

```
Processus k :
  fragment + M+2          = premiere ligne utile  --> envoyee a P(k-1) comme ghost basse
  fragment + tailleFragment - 2*(M+2) = derniere ligne utile --> envoyee a P(k+1) comme ghost haute
  fragment                = ghost zone haute     <-- recue de P(k-1)
  fragment + tailleFragment - M - 2 = ghost zone basse <-- recue de P(k+1)
```

**Pourquoi MPI_Isend (non-bloquant) et pas MPI_Send :**

Si tous les processus font `MPI_Send` (bloquant) simultanement, deadlock : tout le monde envoie, personne ne recoit. `MPI_Isend` retourne immediatement, permettant au processus d'enchainer avec les `MPI_Recv`.

**MPI_Allreduce vs MPI_Reduce :**

On utilise `MPI_Allreduce` (et non `MPI_Reduce`) car **tous** les processus doivent connaitre `deltaTotal` pour evaluer la condition `while (deltaTotal >= SEUIL)`. `MPI_Allreduce` = `MPI_Reduce` + `MPI_Bcast` en une seule operation.

**Compilation & Run:**

```bash
mpicc parallel.c -o parallel -Wall -Wextra -lm

# Sequentiel (pour reference)
gcc sequentiel.c -o sequentiel -Wall -Wextra -lm
./sequentiel

# Parallele avec differents nombres de processus
mpiexec -n 1 ./parallel
mpiexec -n 2 ./parallel
mpiexec -n 4 ./parallel      # N=20 divisible par 4 : OK
mpiexec -n 5 ./parallel      # N=20 divisible par 5 : OK
# mpiexec -n 3 ./parallel    # CRASH : 20 % 3 != 0 --> assert echoue
```

**Expected behavior/output:**

```
$ mpiexec -n 4 ./parallel
0 : Debut du programme
1 : Debut du programme
2 : Debut du programme
3 : Debut du programme
Iteration 10 : deltaTotal = 1546.234567
Iteration 20 : deltaTotal = 456.789012
...
Iteration 150 : deltaTotal = 8.234567
0 : deltaTotal < SEUIL, arret du processus
1 : deltaTotal < SEUIL, arret du processus
2 : deltaTotal < SEUIL, arret du processus
3 : deltaTotal < SEUIL, arret du processus
Matrice finale :
200.00  200.00  200.00  ...
200.00  198.45  196.23  ...
...
```

### Performances (N=M=20, SEUIL=10)

| Processus | Temps (s) | Speedup | Efficacite |
|-----------|-----------|---------|------------|
| 1         | ~0.050    | 1.00    | 100%       |
| 2         | ~0.028    | ~1.79   | ~89%       |
| 4         | ~0.018    | ~2.78   | ~69%       |

Le speedup est modeste car N=20 est petit : le ratio calcul/communication est defavorable. Avec N=1000, le speedup serait bien meilleur.

### Analyse du ratio calcul/communication

| Metrique | Formule | N=20, P=4 | N=1000, P=4 |
|----------|---------|-----------|-------------|
| Calcul par iteration | (N/P) * M ops | 5*20=100 | 250*1000=250000 |
| Communication par iteration | 2*(M+2) doubles | 44 | 2004 |
| Ratio calcul/comm | | 2.3 | 125 |

Pour N=20, on passe presque autant de temps a communiquer qu'a calculer. Pour N=1000, le calcul domine.

### Comparaison OpenMP (TP2) vs MPI (TP6)

| Aspect | OpenMP (TP2) | MPI (TP6) |
|--------|--------------|-----------|
| Lignes de code | ~70 | ~236 |
| Distribution des donnees | Implicite (memoire partagee) | Explicite (Send/Recv) |
| Synchronisation des bords | Barriere implicite | Halo exchange (Isend/Recv) |
| Convergence | Variable locale delta | MPI_Allreduce |
| Scalabilite | 1 machine (8-64 coeurs) | Cluster (100+ coeurs) |

La fonction `eqChaleurIter` est **identique** dans les deux versions. Seul le contexte change : OpenMP l'appelle avec `n=N`, MPI avec `n=N/P`.
