---
title: "Chapitre 03 -- OpenMP (Memoire partagee)"
sidebar_position: 3
---

# Chapitre 03 -- OpenMP (Memoire partagee)

## 1. Modele Fork-Join

OpenMP ajoute des directives `#pragma` au code C sequentiel. Le programme demarre avec un seul thread (maitre), forke lors d'un `#pragma omp parallel`, puis les threads se rejoignent a la fin du bloc.

```
Main  -->  FORK  -->  T0  T1  T2  T3  -->  JOIN  -->  Main
```

---

## 2. Region parallele de base

```c noexec
#include <omp.h>

#pragma omp parallel
{
    int id = omp_get_thread_num();     /* 0 a N-1 */
    int nb = omp_get_num_threads();    /* N threads actifs */
    printf("Thread %d/%d\n", id, nb);
}
/* Barriere implicite ici */
```

### Controler le nombre de threads (par priorite decroissante)

```c noexec
#pragma omp parallel num_threads(8)     /* 1. dans la directive */
omp_set_num_threads(8);                 /* 2. par appel de fonction */
/* export OMP_NUM_THREADS=8 */          /* 3. variable d'environnement */
```

---

## 3. Paralleliser une boucle : `#pragma omp parallel for`

```c noexec
#pragma omp parallel for
for (int i = 0; i < N; i++) {
    tab[i] = tab[i] * 2;
}
```

OpenMP cree les threads, divise les iterations, synchronise a la fin.

**Conditions :** la boucle `for` doit avoir une forme canonique (bornes calculables a l'avance). Pas de `while`, pas de condition dependant des donnees.

**Les iterations doivent etre independantes** -- verifier qu'il n'y a pas de `tab[i] = tab[i-1] + 1`.

---

## 4. Variables partagees et privees

| Clause | Comportement |
|--------|-------------|
| `shared(x)` | Tous les threads partagent la meme variable x |
| `private(x)` | Chaque thread a une copie **non initialisee** |
| `firstprivate(x)` | Chaque thread a une copie **initialisee** avec la valeur actuelle |
| `lastprivate(x)` | Comme private, derniere valeur copiee apres le bloc |
| `reduction(op:x)` | Copies locales combinees par l'operateur a la fin |

### Regles par defaut

- Variables declarees **avant** le bloc : `shared`
- Variables declarees **dans** le bloc : `private`
- Variable de boucle (`i`) : `private` automatiquement

---

## 5. Clause `reduction`

```c noexec
double somme = 0.0;
#pragma omp parallel for reduction(+:somme)
for (int i = 0; i < N; i++) {
    somme += tab[i];
}
/* somme contient la somme correcte */
```

Chaque thread a sa copie locale initialisee a l'element neutre de l'operateur, puis les copies sont fusionnees.

| Operateur | Valeur initiale | Usage |
|-----------|-----------------|-------|
| `+` | 0 | Somme |
| `*` | 1 | Produit |
| `min` | Plus grande valeur | Minimum |
| `max` | Plus petite valeur | Maximum |
| `&` | ~0 | AND bit a bit |
| `\|` | 0 | OR bit a bit |

---

## 6. Synchronisation

### `#pragma omp critical`

Section critique -- un seul thread a la fois. Equivalent du mutex en Pthreads.

```c noexec
#pragma omp critical
{
    compteur++;
}
```

Nommer les sections critiques pour des verrous independants :

```c noexec
#pragma omp critical(verrou_a)
{ /* section A */ }

#pragma omp critical(verrou_b)
{ /* section B -- peut s'executer en meme temps que A */ }
```

### `#pragma omp atomic`

Pour les operations simples sur UNE variable (++, +=). Plus rapide que `critical` car utilise les instructions atomiques du CPU.

```c noexec
#pragma omp atomic
compteur++;
```

### Comparaison des performances

| Mecanisme | Usage | Vitesse |
|-----------|-------|---------|
| `critical` | Bloc de code arbitraire | Lent (verrou logiciel) |
| `atomic` | Operation simple sur 1 variable | Rapide (instruction CPU) |
| `reduction` | Accumulation dans une boucle | Le plus rapide (copies locales) |

### `#pragma omp barrier`

Tous les threads attendent que tout le monde soit arrive.

```c noexec
#pragma omp parallel
{
    phase_1();
    #pragma omp barrier    /* tout le monde attend */
    phase_2();
}
```

Barriere implicite a la fin de `parallel`, `for`, `sections`, `single`. Supprimer avec `nowait` :

```c noexec
#pragma omp for nowait
for (...) { ... }
```

---

## 7. Sections et single

### `#pragma omp sections` -- parallelisme de taches

```c noexec
#pragma omp parallel sections
{
    #pragma omp section
    { traitement_A(); }

    #pragma omp section
    { traitement_B(); }

    #pragma omp section
    { traitement_C(); }
}
```

### `#pragma omp single`

Un seul thread execute le bloc, les autres attendent.

```c noexec
#pragma omp parallel
{
    calcul_parallele();
    #pragma omp single
    { printf("Resultat intermediaire\n"); }
    suite();
}
```

### `#pragma omp master`

Seul le thread 0 execute. Pas de barriere implicite.

---

## 8. Politiques de schedule

```c noexec
#pragma omp parallel for schedule(TYPE, CHUNK)
```

| Schedule | Repartition | Surcout | Quand l'utiliser |
|----------|-------------|---------|------------------|
| `static` | Blocs egaux, a l'avance | Tres faible | Iterations homogenes |
| `static,C` | Blocs de taille C en round-robin | Faible | |
| `dynamic` | A la demande, chunk=1 par defaut | Moyen-eleve | Iterations tres inegales |
| `dynamic,C` | A la demande, blocs de taille C | Moyen | |
| `guided` | Blocs decroissants, a la demande | Moyen | Compromis static/dynamic |
| `auto` | Le compilateur/runtime decide | Variable | Quand on ne sait pas |

---

## 9. Combiner les directives

### `parallel` + `for` separes (reutiliser les threads)

```c noexec
#pragma omp parallel
{
    #pragma omp for
    for (int i = 0; i < N; i++) a[i] = f(i);
    /* barriere implicite */

    #pragma omp for
    for (int i = 0; i < N; i++) b[i] = g(a[i]);
}
/* threads crees une seule fois */
```

### `collapse` pour boucles imbriquees

```c noexec
#pragma omp parallel for collapse(2)
for (int i = 0; i < N; i++) {
    for (int j = 0; j < M; j++) {
        /* N*M iterations distribuees */
    }
}
```

---

## 10. Exemple complet : calcul de PI

```c noexec
#include <stdio.h>
#include <omp.h>

int main(void)
{
    long N = 100000000;
    double pas = 1.0 / N;
    double pi = 0.0;

    double t0 = omp_get_wtime();

    #pragma omp parallel for reduction(+:pi)
    for (long i = 0; i < N; i++) {
        double x = (i + 0.5) * pas;
        pi += 4.0 / (1.0 + x * x);
    }
    pi *= pas;

    double t1 = omp_get_wtime();
    printf("PI = %.15f, temps = %.4f s\n", pi, t1 - t0);
    return 0;
}
```

**Compilation :** `gcc -fopenmp pi.c -o pi -lm`

---

## 11. Exemple complet : propagation de la chaleur

Stencil a 5 points sur grille 2D (TP2 INSA).

```c noexec
#define N 100
#define M 100
#define MAX 1000
#define SEUIL 1
#define IDX(i,j) ((i)*(N+2)+(j))

double *T  = calloc((N+2)*(M+2), sizeof(double));
double *T1 = calloc((N+2)*(M+2), sizeof(double));

/* Initialisation : bords = MAX, interieur = 0 */
do {
    delta = 0;
    #pragma omp parallel for reduction(+:delta)
    for (int i = 1; i <= N; i++) {
        int off = i * (N + 2);
        for (int j = 1; j <= M; j++) {
            T1[off+j] = (T[off+j+1] + T[off+j-1] +
                          T[off+j+(N+2)] + T[off+j-(N+2)] +
                          T[off+j]) / 5.0;
            delta += fabs(T1[off+j] - T[off+j]);
        }
    }
    /* Swap des pointeurs */
    double *tmp = T1; T1 = T; T = tmp;
} while (delta >= SEUIL);
```

**Pattern :** double buffering -- T en lecture, T1 en ecriture, swap apres chaque iteration.

---

## 12. Pieges classiques

| Piege | Correction |
|-------|------------|
| Race condition sur un accumulateur | `reduction(+:somme)` |
| `private(x)` non initialisee | `firstprivate(x)` |
| Paralleliser une boucle avec dependance | Verifier `tab[i]` ne depend pas de `tab[i-1]` |
| Oublier `-fopenmp` a la compilation | Les pragmas sont ignores silencieusement |
| Mesurer avec `clock()` | `omp_get_wtime()` mesure le temps mur |
| Faux partage (compteurs adjacents) | Variables locales puis fusion atomique |

---

## AIDE-MEMOIRE -- OpenMP

```c noexec
/* Directives */
#pragma omp parallel                      /* region parallele */
#pragma omp for                           /* distribuer un for */
#pragma omp parallel for                  /* combine parallel + for */
#pragma omp parallel for reduction(+:s)   /* boucle avec reduction */
#pragma omp critical                      /* section critique */
#pragma omp atomic                        /* operation atomique */
#pragma omp barrier                       /* barriere */
#pragma omp single                        /* 1 seul thread */
#pragma omp master                        /* thread 0 uniquement */
#pragma omp sections / section            /* parallelisme de taches */

/* Clauses */
shared(x)       private(x)       firstprivate(x)
lastprivate(x)  reduction(op:x)  schedule(type,chunk)
num_threads(n)  nowait            collapse(n)

/* Fonctions */
omp_get_thread_num()     /* mon numero 0..N-1 */
omp_get_num_threads()    /* nb threads actifs */
omp_get_wtime()          /* temps mur (secondes) */
omp_set_num_threads(n)   /* fixer nb threads */

/* Compilation */
gcc -fopenmp prog.c -o prog -lm
OMP_NUM_THREADS=4 ./prog
```
