---
title: "Chapitre 06 -- Synchronisation"
sidebar_position: 6
---

# Chapitre 06 -- Synchronisation

## 1. Race conditions

Une **race condition** se produit quand deux threads accedent a la meme variable en meme temps et qu'au moins un ecrit. Le resultat depend de l'ordonnancement, qui est non-deterministe.

### Exemple classique

```c noexec
/* compteur++ n'est PAS atomique */
/* 1. lire compteur dans un registre    */
/* 2. incrementer le registre            */
/* 3. ecrire le registre dans compteur   */
/* Si deux threads font ca en meme temps, un increment est perdu */
```

### Detection

- **Outils :** ThreadSanitizer (`gcc -fsanitize=thread`), Helgrind (Valgrind)
- **Symptome :** resultats differents a chaque execution, valeurs incorrectes

---

## 2. Mutex (Pthreads)

Un seul thread peut detenir le verrou a la fois.

```c noexec
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;

pthread_mutex_lock(&m);     /* verrouiller */
/* section critique */
pthread_mutex_unlock(&m);   /* deverrouiller */
```

**Regle :** la section critique doit etre la plus courte possible.

---

## 3. Sections critiques (OpenMP)

### `#pragma omp critical`

Equivalent du mutex pour OpenMP. Un seul thread a la fois.

```c noexec
#pragma omp critical
{
    compteur++;
}
```

### `#pragma omp atomic`

Pour une operation simple sur une seule variable. Plus rapide que `critical`.

```c noexec
#pragma omp atomic
compteur++;
```

### `reduction`

Le mecanisme le plus performant pour les accumulateurs : chaque thread a sa copie locale, fusion a la fin.

```c noexec
#pragma omp parallel for reduction(+:somme)
for (int i = 0; i < N; i++) somme += tab[i];
```

### Comparaison des performances

| Mecanisme | Vitesse | Usage |
|-----------|---------|-------|
| `critical` | Lent | Bloc de code arbitraire |
| `atomic` | Rapide | Operation simple (++, +=) |
| `reduction` | Tres rapide | Accumulation dans une boucle |

---

## 4. Barrieres

Tous les threads/processus attendent que tout le monde soit arrive.

### OpenMP

```c noexec
#pragma omp barrier   /* barriere explicite */
```

Barriere **implicite** a la fin de `parallel`, `for`, `sections`, `single`. Supprimer avec `nowait`.

### MPI

```c noexec
MPI_Barrier(MPI_COMM_WORLD);
```

### Pthreads

```c noexec
pthread_barrier_t b;
pthread_barrier_init(&b, NULL, nb_threads);
/* dans chaque thread : */
pthread_barrier_wait(&b);
```

---

## 5. Deadlocks

### Definition

Deux threads/processus s'attendent mutuellement : chacun detient une ressource dont l'autre a besoin.

### 4 conditions de Coffman (toutes necessaires)

1. **Exclusion mutuelle** : une ressource ne peut etre utilisee que par un thread
2. **Detention et attente** : un thread detient un verrou et en attend un autre
3. **Pas de preemption** : on ne peut pas forcer un thread a lacher son verrou
4. **Attente circulaire** : T1 attend T2 qui attend T1

### Deadlocks en Pthreads

```c noexec
/* Thread 1 : lock A puis lock B */
/* Thread 2 : lock B puis lock A */
/* DEADLOCK si T1 a A et T2 a B */
```

**Solution :** ordre global de verrouillage (toujours A avant B).

### Deadlocks en MPI

```c noexec
/* Les deux envoient avant de recevoir */
P0: MPI_Send(..., dest=1, ...)   /* attend que P1 recoive */
P1: MPI_Send(..., dest=0, ...)   /* attend que P0 recoive */
/* Personne ne recoit -> DEADLOCK */
```

**Solutions :**
- Alterner Send/Recv
- MPI_Sendrecv (atomique)
- MPI_Isend (non-bloquant)

---

## 6. Variables de condition (Pthreads)

Permettent a un thread de dormir en attendant un evenement, sans attente active.

```c noexec
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;

/* Attendre */
pthread_mutex_lock(&m);
while (!condition)
    pthread_cond_wait(&cond, &m);
/* condition vraie ET mutex verrouille */
pthread_mutex_unlock(&m);

/* Signaler */
pthread_mutex_lock(&m);
condition = 1;
pthread_cond_signal(&cond);
pthread_mutex_unlock(&m);
```

**Regles :**
- Toujours `while`, jamais `if` (spurious wakeups)
- `cond_wait` libere le mutex atomiquement en dormant
- `signal` reveille UN thread, `broadcast` reveille TOUS

---

## 7. Faux partage (false sharing)

Deux threads modifient des variables **differentes** mais sur la **meme ligne de cache** (typiquement 64 octets). Le processeur invalide la ligne a chaque ecriture, meme s'il n'y a pas de conflit logique.

```c noexec
/* MAUVAIS : compteurs[0] et compteurs[1] sur la meme ligne de cache */
int compteurs[4] = {0};
#pragma omp parallel
{
    int id = omp_get_thread_num();
    for (int i = 0; i < 1000000; i++)
        compteurs[id]++;
}

/* BON : espacement (padding) */
int compteurs[4 * 16] = {0};   /* 64 octets entre chaque compteur */
#pragma omp parallel
{
    int id = omp_get_thread_num();
    for (int i = 0; i < 1000000; i++)
        compteurs[id * 16]++;
}

/* ENCORE MIEUX : variable locale puis fusion */
int total = 0;
#pragma omp parallel
{
    int local = 0;
    for (int i = 0; i < 1000000; i++) local++;
    #pragma omp atomic
    total += local;
}
```

---

## AIDE-MEMOIRE -- Synchronisation

```
Race condition : acces concurrent non protege -> mutex, atomic, reduction
Mutex (Pthreads) : lock/unlock, section critique minimale
Critical (OpenMP) : #pragma omp critical { }
Atomic (OpenMP) : #pragma omp atomic (operation simple, rapide)
Reduction (OpenMP) : reduction(op:var) (le plus performant pour accumulateurs)

Barrieres :
  OpenMP : barriere implicite fin de for/parallel, explicite avec #pragma omp barrier
  MPI : MPI_Barrier(comm)
  Pthreads : pthread_barrier_wait

Deadlocks :
  4 conditions de Coffman (toutes necessaires)
  Pthreads : ordre global de verrouillage
  MPI : alterner Send/Recv, ou Sendrecv, ou Isend

Variables de condition :
  while(!cond) cond_wait(&c, &m)  -- WHILE pas IF
  signal (1 thread) / broadcast (tous)

False sharing :
  Variables proches sur la meme ligne de cache
  Solution : padding (espacement) ou variables locales
```
