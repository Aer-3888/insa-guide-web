---
title: "Questions de cours recurrentes"
sidebar_position: 4
---

# Questions de cours recurrentes

## 1. Speedup et efficacite

### Q : Calculer le speedup et l'efficacite

**Donnees :** T(1) = 10 s, T(4) = 3 s

```
S(4) = T(1)/T(4) = 10/3 = 3.33
E(4) = S(4)/4 = 3.33/4 = 0.83  (83%)
```

### Q : Pourquoi le speedup n'est-il pas lineaire ?

**Reponse :** Plusieurs causes de surcout :
- Partie sequentielle du code (loi d'Amdahl)
- Creation et synchronisation des threads
- Communication entre processus (MPI)
- Desequilibrage de charge
- Faux partage (false sharing)
- Bande passante memoire saturee (memory-bound)

---

## 2. Loi d'Amdahl

### Q : Calculer le speedup max pour f=0.8 et p=16

```
S_max(16) = 1 / ((1-0.8) + 0.8/16)
          = 1 / (0.2 + 0.05)
          = 1 / 0.25
          = 4.0
```

### Q : Calculer le speedup max pour f=0.8 et p=infini

```
S_max(inf) = 1 / (1-f) = 1 / 0.2 = 5.0
```

### Q : Quelle fraction doit etre parallelisable pour S=8 avec p=16 ?

```
8 = 1 / ((1-f) + f/16)
(1-f) + f/16 = 1/8 = 0.125
1 - f + f/16 = 0.125
1 - 15f/16 = 0.125
15f/16 = 0.875
f = 0.875 * 16/15 = 0.933   (93.3%)
```

### Q : Quelle fraction doit etre parallelisable pour atteindre un speedup de 10 avec un nombre infini de processeurs ?

```
S_max(inf) = 1/(1-f) = 10
1-f = 0.1
f = 0.9   (90%)
```

---

## 3. Loi de Gustafson

### Q : Calculer le speedup de Gustafson pour alpha=0.05 et p=64

```
S = p - alpha*(p-1) = 64 - 0.05*63 = 64 - 3.15 = 60.85
```

### Q : Difference entre Amdahl et Gustafson ?

| | Amdahl | Gustafson |
|--|--------|-----------|
| Taille du probleme | Fixe | Croit avec p |
| Question | Combien de temps je gagne ? | Quel probleme je peux resoudre ? |
| Resultat | Pessimiste (plafonne) | Optimiste (lineaire) |

---

## 4. Taxonomie de Flynn

### Q : Classer les architectures

| Architecture | Classification |
|-------------|----------------|
| Processeur mono-coeur | SISD |
| Instructions SSE/AVX | SIMD |
| GPU NVIDIA | SIMD (ou SIMT) |
| Multi-coeur avec OpenMP | MIMD |
| Cluster avec MPI | MIMD |
| Systeme tolerant aux pannes (vote) | MISD |

---

## 5. Memoire partagee vs distribuee

### Q : Comparer les deux modeles

| Aspect | Memoire partagee | Memoire distribuee |
|--------|------------------|--------------------|
| Memoire | Commune | Propre a chaque processus |
| Communication | Lecture/ecriture memoire | Messages explicites |
| Scalabilite | 1 machine | Cluster |
| Synchronisation | Mutex, barrieres | Barriers, collectives |
| Outils | Pthreads, OpenMP | MPI |
| Difficulte | Race conditions | Deadlocks, gestion des messages |

---

## 6. OpenMP -- Questions de cours

### Q : Qu'est-ce que le modele fork-join ?

Le programme demarre avec un seul thread (maitre). A chaque `#pragma omp parallel`, le maitre cree une equipe de threads (fork). A la fin du bloc parallele, les threads se rejoignent (join) et seul le maitre continue.

### Q : Quelle est la difference entre shared et private ?

- `shared` : tous les threads voient la meme variable (attention race conditions)
- `private` : chaque thread a sa propre copie, non initialisee
- `firstprivate` : copie privee initialisee avec la valeur actuelle

### Q : Quand utiliser reduction vs critical vs atomic ?

- `reduction` : accumulateur dans une boucle (le plus rapide)
- `atomic` : operation simple sur une variable (rapide)
- `critical` : bloc de code quelconque (lent)

---

## 7. MPI -- Questions de cours

### Q : Qu'est-ce que le modele SPMD ?

Single Program Multiple Data : tous les processus executent le meme programme, mais chacun a un rang different et ses propres donnees. Le rang determine le comportement (`if (rang == 0) ...`).

### Q : Quelle est la difference entre MPI_Reduce et MPI_Allreduce ?

- `MPI_Reduce` : le resultat est disponible sur le processus root uniquement
- `MPI_Allreduce` : le resultat est disponible sur TOUS les processus

### Q : Pourquoi faut-il que tous les processus appellent les collectives ?

Les collectives (Bcast, Scatter, Gather, Reduce) sont des operations **collectives** : tous les processus du communicateur doivent participer. Si un processus ne l'appelle pas, les autres bloquent indefiniment.

---

## 8. CUDA -- Questions de cours

### Q : Donner la formule de l'index global d'un thread GPU

```c
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

### Q : Calculer le nombre de blocs pour N=10000 elements et des blocs de 256 threads

```c
int nb_blocs = (10000 + 256 - 1) / 256 = 10255 / 256 = 40 blocs
/* 40 * 256 = 10240 threads, dont 240 inactifs (garde if (i < N)) */
```

### Q : Pourquoi faut-il `if (i < N)` dans un kernel ?

Le nombre total de threads (nb_blocs * taille_bloc) est souvent superieur a N (arrondi au multiple de la taille de bloc). Sans la garde, les threads excedentaires accedraient hors des limites du tableau.

### Q : Quelle est la difference entre memoire globale et memoire partagee ?

| | Memoire globale | Memoire partagee |
|--|-----------------|------------------|
| Portee | Tous les threads | Un bloc |
| Vitesse | Lente (400-600 cycles) | Rapide (~5 cycles) |
| Taille | 4-24 Go | 48-96 Ko par SM |
| Declaration | `float *d_ptr` (cudaMalloc) | `__shared__ float cache[N]` |

---

## 9. Synchronisation -- Questions de cours

### Q : Qu'est-ce qu'une race condition ? Comment la corriger ?

Acces concurrent a une variable partagee sans protection, ou au moins un thread ecrit. Le resultat depend de l'ordonnancement.

Corrections : mutex (Pthreads), critical/atomic/reduction (OpenMP).

### Q : Qu'est-ce qu'un deadlock ? Donner les 4 conditions de Coffman.

Situation ou deux threads/processus s'attendent mutuellement indefiniment.

1. Exclusion mutuelle
2. Detention et attente
3. Pas de preemption
4. Attente circulaire

### Q : Qu'est-ce que le faux partage (false sharing) ?

Deux threads modifient des variables differentes mais situees sur la meme ligne de cache (typiquement 64 octets). Le processeur invalide la ligne de cache a chaque ecriture, degradant les performances.

Solution : espacer les variables (padding) ou utiliser des variables locales.
