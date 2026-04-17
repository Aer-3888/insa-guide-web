---
title: "Parallelisme -- Guide de cours (S6, 3A INFO)"
sidebar_position: 0
---

# Parallelisme -- Guide de cours (S6, 3A INFO)

Guide complet de programmation parallele pour le cours de Parallelisme de l'INSA Rennes, couvrant les quatre paradigmes : Pthreads, OpenMP, MPI et CUDA.

---

## Organisation du guide

| # | Chapitre | Description |
|---|----------|-------------|
| 01 | [Fondamentaux du calcul parallele](/S6/Parallelisme/guide/01-fondamentaux) | Flynn, Amdahl, Gustafson, speedup, efficacite, modeles de decomposition |
| 02 | [Threads POSIX](/S6/Parallelisme/guide/02-pthreads) | pthread_create/join, mutex, conditions, producteur-consommateur |
| 03 | [OpenMP -- Memoire partagee](/S6/Parallelisme/guide/03-openmp) | Pragmas, parallel for, reduction, critical, atomic, scheduling |
| 04 | [MPI -- Memoire distribuee](/S6/Parallelisme/guide/04-mpi) | Send/Recv, collectives (Bcast, Scatter, Gather, Reduce), communicateurs |
| 05 | [Conception d'algorithmes paralleles](/S6/Parallelisme/guide/05-algorithmes) | Decomposition, equilibrage de charge, patterns de communication |
| 06 | [Synchronisation](/S6/Parallelisme/guide/06-synchronisation) | Mutex, barrieres, semaphores, race conditions, deadlocks |
| 07 | [Analyse de performance](/S6/Parallelisme/guide/07-performance) | Profilage, scalabilite forte/faible, goulots d'etranglement |
| 08 | [GPU et CUDA](/S6/Parallelisme/guide/08-gpu-cuda) | Kernels, grille/blocs/threads, hierarchie memoire, SIMT |

---

## Formules essentielles (apercu)

| Metrique | Formule | Signification |
|----------|---------|---------------|
| Speedup | `S(p) = T(1) / T(p)` | Facteur d'acceleration avec p processeurs |
| Efficacite | `E(p) = S(p) / p` | Taux d'utilisation des ressources |
| Amdahl | `S_max = 1 / ((1-f) + f/p)` | Limite theorique (f = fraction parallelisable) |
| Amdahl (limite) | `S_max(inf) = 1 / (1-f)` | Plafond absolu |
| Gustafson | `S = p - alpha*(p-1)` | Speedup a taille de probleme variable |
| CUDA index | `i = blockIdx.x * blockDim.x + threadIdx.x` | Index global d'un thread GPU |
| Nombre de blocs | `nb = (N + B - 1) / B` | ceil(N/B) pour lancer un kernel |

---

## Compilation rapide

```bash
# OpenMP
gcc -fopenmp programme.c -o programme -lm

# Threads POSIX
gcc -pthread programme.c -o programme

# MPI
mpicc programme.c -o programme -lm

# CUDA
nvcc programme.cu -o programme
```

### Execution

```bash
# OpenMP
export OMP_NUM_THREADS=4
./programme

# MPI
mpiexec -n 4 ./programme

# CUDA
./programme
```

---

## Parcours recommande

```
01 Fondamentaux
    |
    +---> 02 Pthreads ---> 03 OpenMP ---+
    |                                    |
    +---> 04 MPI ---------------------->+--> 05 Algorithmes
    |                                    |
    +---> 08 GPU/CUDA ----------------->+--> 06 Synchronisation
                                         |
                                         +--> 07 Performance
```

Le chapitre 01 est le socle commun. Ensuite, les chemins memoire partagee (02-03), memoire distribuee (04) et GPU (08) sont relativement independants. Les chapitres 05, 06 et 07 synthetisent les concepts transversaux.
