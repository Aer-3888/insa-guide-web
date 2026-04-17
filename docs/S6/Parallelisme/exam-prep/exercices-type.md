---
title: "Exercices types d'examen"
sidebar_position: 2
---

# Exercices types d'examen

## Exercice 1 : Calculs de performance (revient CHAQUE annee)

### Enonce

Un programme sequentiel s'execute en 20 secondes. La version parallele avec 8 processeurs s'execute en 4 secondes.

a) Calculer le speedup et l'efficacite.
b) Estimer la fraction parallelisable f du code.
c) Quel serait le speedup maximum avec 64 processeurs ?
d) Quel serait le speedup avec un nombre infini de processeurs ?

### Solution

**a)** Speedup et efficacite :

```
S(8) = T(1)/T(8) = 20/4 = 5.0
E(8) = S(8)/8 = 5/8 = 0.625  (62.5%)
```

**b)** Trouver f avec Amdahl :

```
S(p) = 1 / ((1-f) + f/p)
5 = 1 / ((1-f) + f/8)
(1-f) + f/8 = 0.2
1 - f + f/8 = 0.2
1 - 7f/8 = 0.2
7f/8 = 0.8
f = 0.8 * 8/7 = 6.4/7 = 0.914   (91.4%)
```

**c)** Speedup max avec 64 processeurs :

```
S(64) = 1 / ((1-0.914) + 0.914/64)
      = 1 / (0.086 + 0.0143)
      = 1 / 0.1003
      = 9.97
```

**d)** Speedup max avec p infini :

```
S(inf) = 1 / (1-f) = 1 / 0.086 = 11.63
```

---

## Exercice 2 : Paralleliser une boucle avec OpenMP

### Enonce

Paralleliser le code suivant avec OpenMP. Indiquer les clauses necessaires.

```c noexec
double total = 0;
double tab[N];
int max_idx = 0;

for (int i = 0; i < N; i++) {
    double val = compute(tab[i]);
    total += val;
    if (val > tab[max_idx]) {
        max_idx = i;
    }
}
```

### Solution

**Analyse des variables :**
- `total` : accumulateur -> `reduction(+:total)`
- `val` : variable temporaire locale -> `private` (ou declaree dans la boucle)
- `tab` : tableau en lecture seule -> `shared` (defaut)
- `max_idx` : problematique -- on ne peut pas faire de reduction sur un index

**Approche en deux passes :**

```c noexec
double total = 0;
double max_val = -INFINITY;
int max_idx = 0;

/* Passe 1 : calcul de total et max_val */
#pragma omp parallel for reduction(+:total) reduction(max:max_val)
for (int i = 0; i < N; i++) {
    double val = compute(tab[i]);
    total += val;
    if (val > max_val) max_val = val;
}

/* Passe 2 : trouver l'index du max (sequentiel ou avec critical) */
for (int i = 0; i < N; i++) {
    if (compute(tab[i]) == max_val) {
        max_idx = i;
        break;
    }
}
```

Ou avec une section critique (moins performant) :

```c noexec
#pragma omp parallel for reduction(+:total)
for (int i = 0; i < N; i++) {
    double val = compute(tab[i]);
    total += val;
    #pragma omp critical
    {
        if (val > tab[max_idx]) max_idx = i;
    }
}
```

---

## Exercice 3 : Identifier et corriger une race condition

### Enonce

Le code suivant produit des resultats incorrects. Identifier le probleme et le corriger.

```c noexec
int histogram[256] = {0};
unsigned char image[WIDTH * HEIGHT];

#pragma omp parallel for
for (int i = 0; i < WIDTH * HEIGHT; i++) {
    histogram[image[i]]++;
}
```

### Solution

**Probleme :** race condition sur `histogram[]`. Plusieurs threads peuvent incrementer le meme element en meme temps.

**Solution 1 -- atomic :**

```c noexec
#pragma omp parallel for
for (int i = 0; i < WIDTH * HEIGHT; i++) {
    #pragma omp atomic
    histogram[image[i]]++;
}
```

**Solution 2 -- histogrammes locaux (plus rapide) :**

```c noexec
#pragma omp parallel
{
    int local_hist[256] = {0};

    #pragma omp for
    for (int i = 0; i < WIDTH * HEIGHT; i++) {
        local_hist[image[i]]++;
    }

    for (int i = 0; i < 256; i++) {
        #pragma omp atomic
        histogram[i] += local_hist[i];
    }
}
```

---

## Exercice 4 : Detecter un deadlock MPI

### Enonce

Ce programme MPI peut-il provoquer un deadlock ? Justifier.

```c noexec
if (rang == 0) {
    MPI_Send(buf_a, N, MPI_DOUBLE, 1, 0, comm);
    MPI_Send(buf_b, N, MPI_DOUBLE, 1, 1, comm);
    MPI_Recv(buf_c, N, MPI_DOUBLE, 1, 0, comm, &status);
} else if (rang == 1) {
    MPI_Send(buf_d, N, MPI_DOUBLE, 0, 0, comm);
    MPI_Recv(buf_e, N, MPI_DOUBLE, 0, 0, comm, &status);
    MPI_Recv(buf_f, N, MPI_DOUBLE, 0, 1, comm, &status);
}
```

### Solution

**Oui, deadlock possible.** Si N est grand (buffer interne MPI insuffisant) :

- P0 fait Send(buf_a) vers P1, qui peut bloquer si le buffer est plein
- P1 fait Send(buf_d) vers P0, qui peut bloquer si le buffer est plein
- Ni P0 ni P1 ne fait de Recv -> les deux bloquent

**Correction avec Sendrecv :**

```c noexec
if (rang == 0) {
    MPI_Sendrecv(buf_a, N, MPI_DOUBLE, 1, 0,
                 buf_c, N, MPI_DOUBLE, 1, 0, comm, &status);
    MPI_Send(buf_b, N, MPI_DOUBLE, 1, 1, comm);
} else {
    MPI_Sendrecv(buf_d, N, MPI_DOUBLE, 0, 0,
                 buf_e, N, MPI_DOUBLE, 0, 0, comm, &status);
    MPI_Recv(buf_f, N, MPI_DOUBLE, 0, 1, comm, &status);
}
```

---

## Exercice 5 : Ecrire un programme MPI (Scatter/Gather)

### Enonce

Ecrire un programme MPI qui calcule la norme L2 d'un vecteur de taille N, distribue entre P processus.

```
||v||_2 = sqrt(somme(v[i]^2))
```

### Solution

```c noexec
int rang, nb_proc;
MPI_Init(&argc, &argv);
MPI_Comm_rank(MPI_COMM_WORLD, &rang);
MPI_Comm_size(MPI_COMM_WORLD, &nb_proc);

int N = 10000;
int local_n = N / nb_proc;
double *v = NULL;
double *local_v = malloc(local_n * sizeof(double));

/* P0 initialise le vecteur */
if (rang == 0) {
    v = malloc(N * sizeof(double));
    for (int i = 0; i < N; i++) v[i] = (double)i;
}

/* Distribuer le vecteur */
MPI_Scatter(v, local_n, MPI_DOUBLE,
            local_v, local_n, MPI_DOUBLE, 0, MPI_COMM_WORLD);

/* Calcul local : somme des carres */
double local_sum = 0.0;
for (int i = 0; i < local_n; i++) {
    local_sum += local_v[i] * local_v[i];
}

/* Reduction : somme globale */
double global_sum;
MPI_Reduce(&local_sum, &global_sum, 1, MPI_DOUBLE,
           MPI_SUM, 0, MPI_COMM_WORLD);

if (rang == 0) {
    printf("Norme L2 = %f\n", sqrt(global_sum));
    free(v);
}

free(local_v);
MPI_Finalize();
```

---

## Exercice 6 : Ecrire un kernel CUDA

### Enonce

Ecrire un kernel CUDA qui calcule C[i] = A[i] * B[i] + alpha pour chaque element.

### Solution

```c noexec
__global__ void saxpy_like(float *A, float *B, float *C,
                           float alpha, int N)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < N) {
        C[i] = A[i] * B[i] + alpha;
    }
}

/* Cote host */
int taille_bloc = 256;
int nb_blocs = (N + taille_bloc - 1) / taille_bloc;
saxpy_like<<<nb_blocs, taille_bloc>>>(d_A, d_B, d_C, alpha, N);
cudaDeviceSynchronize();
```

---

## Exercice 7 : Choisir un schedule OpenMP

### Enonce

On parallelise une boucle ou l'iteration i a un cout proportionnel a i^2. Quel schedule choisir ?

### Solution

**`schedule(dynamic)`** ou **`schedule(guided)`**.

- `static` : les dernieres iterations (les plus couteuses) seraient toutes sur le meme thread -> desequilibre massif.
- `dynamic` : les threads prennent des iterations a la demande, equilibrant la charge.
- `guided` : blocs de taille decroissante, bon compromis entre static et dynamic.

```c noexec
#pragma omp parallel for schedule(dynamic, 4)
for (int i = 0; i < N; i++) {
    /* travail proportionnel a i^2 */
}
```

Le chunk de 4 reduit l'overhead du scheduling dynamique tout en maintenant un bon equilibrage.
