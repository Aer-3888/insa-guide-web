---
title: "Pieges frequents a l'examen"
sidebar_position: 3
---

# Pieges frequents a l'examen

Ce document recense les erreurs les plus courantes dans les copies d'examen de parallelisme. Pour chaque piege, on donne le code faux, l'explication, et la correction.

---

## 1. OpenMP -- Oublier une reduction

### Code FAUX

```c
double somme = 0;
#pragma omp parallel for
for (int i = 0; i < N; i++) {
    somme += f(i);
}
```

### Pourquoi c'est faux

**Race condition** sur `somme`. Plusieurs threads lisent, modifient et ecrivent `somme` en meme temps. Le resultat est non-deterministe et incorrect.

### Correction

```c
double somme = 0;
#pragma omp parallel for reduction(+:somme)
for (int i = 0; i < N; i++) {
    somme += f(i);
}
```

La clause `reduction(+:somme)` cree une copie locale dans chaque thread, puis combine les resultats a la fin.

**Rappel examen :** si l'enonce demande de "paralleliser une boucle avec un accumulateur", la reponse attendue est toujours `reduction`.

---

## 2. OpenMP -- Variable private non initialisee

### Code FAUX

```c
double x = 3.14;
#pragma omp parallel for private(x)
for (int i = 0; i < N; i++) {
    tab[i] = x * i;   /* x est indefini ! */
}
```

### Pourquoi c'est faux

`private(x)` cree une copie locale dans chaque thread, mais **non initialisee**. La valeur 3.14 assignee avant le bloc parallele n'est pas copiee.

### Correction

```c
double x = 3.14;
#pragma omp parallel for firstprivate(x)
for (int i = 0; i < N; i++) {
    tab[i] = x * i;   /* x vaut 3.14 dans chaque thread */
}
```

**Regle :** `private` = copie vide, `firstprivate` = copie avec la valeur actuelle.

---

## 3. OpenMP -- Paralleliser une boucle avec dependance

### Code FAUX

```c
#pragma omp parallel for
for (int i = 1; i < N; i++) {
    tab[i] = tab[i-1] + 1;
}
```

### Pourquoi c'est faux

L'iteration `i` depend du resultat de l'iteration `i-1`. Si les iterations sont executees en parallele, `tab[i-1]` n'a peut-etre pas encore ete calcule. Le resultat depend de l'ordonnancement des threads.

### Comment detecter

Poser la question : "est-ce que l'iteration i lit ou ecrit une case modifiee par une autre iteration ?" Si oui, il y a une dependance.

### Comment corriger (quand c'est possible)

Parfois la boucle n'est **pas parallelisable** en l'etat. Il faut la reformuler :

```c
/* Si tab[i] = tab[0] + i (forme close) */
#pragma omp parallel for
for (int i = 1; i < N; i++) {
    tab[i] = tab[0] + i;
}
```

**Rappel examen :** l'enonce peut volontairement proposer une boucle non parallelisable pour tester votre capacite a le detecter.

---

## 4. OpenMP -- Oublier -fopenmp a la compilation

### Symptome

Le code compile et execute **sans erreur**, mais en sequentiel. Les pragmas OpenMP sont traites comme des commentaires par le compilateur.

### Correction

```bash
gcc -fopenmp programme.c -o programme -lm
```

**Rappel examen :** si l'enonce demande les flags de compilation, `-fopenmp` est obligatoire.

---

## 5. OpenMP -- Mesurer le temps avec clock()

### Code FAUX

```c
clock_t t0 = clock();
#pragma omp parallel for
for (int i = 0; i < N; i++) { /* ... */ }
clock_t t1 = clock();
double temps = (double)(t1 - t0) / CLOCKS_PER_SEC;
```

### Pourquoi c'est faux

`clock()` mesure le temps CPU **total** (tous threads confondus). Avec 4 threads, `clock()` rapporte environ 4x le temps reel. Le speedup calcule serait donc toujours proche de 1.

### Correction

```c
double t0 = omp_get_wtime();
#pragma omp parallel for
for (int i = 0; i < N; i++) { /* ... */ }
double t1 = omp_get_wtime();
double temps = t1 - t0;   /* temps mur (wall-clock) */
```

| Technologie | Chrono correct | Piege |
|------------|----------------|-------|
| OpenMP | `omp_get_wtime()` | `clock()` = temps CPU total |
| MPI | `MPI_Wtime()` | Mesurer apres le Reduce/Gather |
| CUDA | `cudaEvent` | Kernel asynchrone, `clock()` = temps de lancement |

---

## 6. OpenMP -- Faux partage (false sharing)

### Code FAUX (mais correct logiquement)

```c
int compteurs[NB_THREADS];
#pragma omp parallel
{
    int id = omp_get_thread_num();
    for (int i = 0; i < 1000000; i++)
        compteurs[id]++;   /* pas de race condition, mais tres lent */
}
```

### Pourquoi c'est lent

Les elements `compteurs[0]`, `compteurs[1]`, etc. sont sur la **meme ligne de cache** (64 octets). A chaque ecriture par un thread, la ligne est invalidee pour tous les autres. Les performances s'effondrent.

### Corrections

**Solution 1 -- Padding :**

```c
int compteurs[NB_THREADS * 16];  /* 64 octets entre chaque compteur */
compteurs[id * 16]++;
```

**Solution 2 -- Variables locales (recommandee) :**

```c
int total = 0;
#pragma omp parallel
{
    int local = 0;
    for (int i = 0; i < 1000000; i++) local++;
    #pragma omp atomic
    total += local;
}
```

**Rappel examen :** le faux partage est une question recurrente (2017, 2023, 2024). La reponse attendue est : "variables sur la meme ligne de cache" + solution par padding ou variables locales.

---

## 7. MPI -- Deadlock Send/Send

### Code FAUX

```c
if (rang == 0) {
    MPI_Send(buf, N, MPI_DOUBLE, 1, 0, comm);
    MPI_Recv(buf2, N, MPI_DOUBLE, 1, 0, comm, &status);
} else {
    MPI_Send(buf, N, MPI_DOUBLE, 0, 0, comm);
    MPI_Recv(buf2, N, MPI_DOUBLE, 0, 0, comm, &status);
}
```

### Pourquoi c'est faux

Si le message est trop grand pour le buffer interne MPI, `MPI_Send` **bloque** en attendant que le destinataire appelle `MPI_Recv`. Mais les deux processus font Send avant Recv : personne ne recoit, les deux bloquent indefiniment.

### Methode de detection a l'examen

Tracer l'ordre des operations :
1. P0: Send vers P1 (bloque si buffer plein)
2. P1: Send vers P0 (bloque si buffer plein)
3. Ni P0 ni P1 ne fait Recv -> **DEADLOCK**

### Corrections (3 methodes)

**Solution 1 -- Alterner :**

```c
if (rang == 0) {
    MPI_Send(buf, N, MPI_DOUBLE, 1, 0, comm);
    MPI_Recv(buf2, N, MPI_DOUBLE, 1, 0, comm, &status);
} else {
    MPI_Recv(buf2, N, MPI_DOUBLE, 0, 0, comm, &status);
    MPI_Send(buf, N, MPI_DOUBLE, 0, 0, comm);
}
```

**Solution 2 -- Sendrecv :**

```c
MPI_Sendrecv(buf, N, MPI_DOUBLE, voisin, 0,
             buf2, N, MPI_DOUBLE, voisin, 0, comm, &status);
```

**Solution 3 -- Isend (non-bloquant) :**

```c
MPI_Isend(buf, N, MPI_DOUBLE, voisin, 0, comm, &req);
MPI_Recv(buf2, N, MPI_DOUBLE, voisin, 0, comm, &status);
MPI_Wait(&req, &status);
```

**Rappel examen :** le deadlock MPI est present dans TOUTES les annales (2016-2025). Savoir le detecter et le corriger est indispensable.

---

## 8. MPI -- Collective appelee par un seul processus

### Code FAUX

```c
if (rang == 0) {
    MPI_Bcast(data, N, MPI_DOUBLE, 0, MPI_COMM_WORLD);
}
/* Les autres processus ne font rien */
```

### Pourquoi c'est faux

Les operations collectives (Bcast, Scatter, Gather, Reduce, Barrier) doivent etre appelees par **TOUS** les processus du communicateur. Si un processus ne l'appelle pas, les autres bloquent indefiniment.

### Correction

```c
/* TOUS les processus appellent Bcast */
MPI_Bcast(data, N, MPI_DOUBLE, 0, MPI_COMM_WORLD);
/* P0 envoie, les autres recoivent -- mais tous appellent la meme fonction */
```

**Regle :** dans un programme SPMD, les collectives sont **toujours hors des** `if (rang == 0)`.

---

## 9. MPI -- Confondre count et taille en octets

### Code FAUX

```c
MPI_Send(buf, N * sizeof(double), MPI_DOUBLE, dest, tag, comm);
```

### Pourquoi c'est faux

Le parametre `count` est le **nombre d'elements**, pas la taille en octets. MPI connait deja la taille de chaque element grace au type (`MPI_DOUBLE` = 8 octets). Ici on enverrait 8x trop de donnees.

### Correction

```c
MPI_Send(buf, N, MPI_DOUBLE, dest, tag, comm);
/* N elements de type MPI_DOUBLE */
```

---

## 10. MPI -- N non divisible par nb_proc

### Code FAUX

```c
int local_n = N / nb_proc;
MPI_Scatter(data, local_n, MPI_DOUBLE, ...);
/* Si N=100 et nb_proc=3 : 100/3 = 33, 3*33 = 99, 1 element perdu */
```

### Correction

**Option 1 :** Exiger `N % nb_proc == 0` (assertion).

**Option 2 :** Utiliser `MPI_Scatterv` / `MPI_Gatherv` avec des tailles variables :

```c
int *counts = malloc(nb_proc * sizeof(int));
int *displs = malloc(nb_proc * sizeof(int));
for (int i = 0; i < nb_proc; i++) {
    counts[i] = N / nb_proc + (i < N % nb_proc ? 1 : 0);
    displs[i] = (i > 0) ? displs[i-1] + counts[i-1] : 0;
}
MPI_Scatterv(data, counts, displs, MPI_DOUBLE,
             local, counts[rang], MPI_DOUBLE, 0, comm);
```

**Rappel examen :** dans les sujets INSA, N est generalement divisible par P. Mais si l'enonce ne le precise pas, mentionner cette limitation montre une bonne comprehension.

---

## 11. CUDA -- Oublier la garde if (i < N)

### Code FAUX

```c
__global__ void kernel(float *tab, int N) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    tab[i] = tab[i] * 2.0f;  /* buffer overflow si i >= N */
}
```

### Pourquoi c'est faux

Le nombre total de threads = `nb_blocs * taille_bloc`. Ce n'est pas toujours un multiple exact de N. Exemple : N=1000, taille_bloc=256 -> nb_blocs=4, total=1024 -> 24 threads excedentaires qui accedent hors limites.

### Correction

```c
__global__ void kernel(float *tab, int N) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < N) {
        tab[i] = tab[i] * 2.0f;
    }
}
```

**Rappel examen :** l'oubli de `if (i < N)` est un piege classique et fait perdre des points.

---

## 12. CUDA -- Acceder a la memoire GPU depuis le CPU

### Code FAUX

```c
float *d_tab;
cudaMalloc(&d_tab, N * sizeof(float));
printf("%f\n", d_tab[0]);   /* CRASH -- segfault */
```

### Pourquoi c'est faux

`d_tab` pointe vers la memoire **GPU** (device). Le CPU ne peut pas y acceder directement. Toute lecture/ecriture de `d_tab[i]` depuis le code hote provoque un segfault.

### Correction

```c
float *d_tab, *h_tab;
cudaMalloc(&d_tab, N * sizeof(float));
h_tab = malloc(N * sizeof(float));
/* ... kernel modifie d_tab ... */
cudaMemcpy(h_tab, d_tab, N * sizeof(float), cudaMemcpyDeviceToHost);
printf("%f\n", h_tab[0]);   /* OK */
```

---

## 13. CUDA -- Oublier cudaDeviceSynchronize

### Code FAUX

```c
kernel<<<blocs, threads>>>(d_tab, N);
cudaMemcpy(h_tab, d_tab, N * sizeof(float), cudaMemcpyDeviceToHost);
```

### Pourquoi c'est risque

Le lancement du kernel est **asynchrone**. Le CPU continue immediatement. En pratique, `cudaMemcpy` synchronise implicitement, donc ce code specifique fonctionne. Mais si on fait autre chose entre les deux (timing, decisions), les resultats peuvent etre incomplets.

### Bonne pratique

```c
kernel<<<blocs, threads>>>(d_tab, N);
cudaDeviceSynchronize();   /* attendre la fin du kernel */
/* Maintenant on peut lire les resultats */
```

---

## 14. Calculs -- Erreur dans la loi d'Amdahl

### Erreur frequente

Confondre `f` (fraction parallelisable) avec `1-f` (fraction sequentielle).

```
FAUX : S(p) = 1 / (f + (1-f)/p)        <-- fraction sequentielle en premier
VRAI : S(p) = 1 / ((1-f) + f/p)        <-- (1-f) = partie seq, f/p = partie par
```

### Methode de verification

Pour verifier votre reponse, tester les cas limites :
- Si f = 1 (100% parallelisable) : `S(p) = 1/(0 + 1/p) = p` -> speedup lineaire. Correct.
- Si f = 0 (100% sequentiel) : `S(p) = 1/(1 + 0) = 1` -> pas d'amelioration. Correct.
- Si p = 1 : `S(1) = 1/((1-f) + f) = 1`. Correct.

### Autre erreur : Amdahl vs Gustafson

| | Amdahl | Gustafson |
|--|--------|-----------|
| Formule | `S = 1/((1-f) + f/p)` | `S = p - alpha*(p-1)` |
| Taille probleme | **Fixe** | **Croit** avec p |
| Resultat | Pessimiste (plafonne) | Optimiste (lineaire) |
| alpha/f | f = fraction parallelisable | alpha = fraction sequentielle mesuree |

---

## 15. General -- Pthreads : passer &i dans une boucle

### Code FAUX

```c
for (int i = 0; i < NB; i++) {
    pthread_create(&threads[i], NULL, func, &i);
}
```

### Pourquoi c'est faux

Tous les threads recoivent un **pointeur vers la meme variable** `i`. Quand le thread demarre et lit `*arg`, la boucle a deja avance. Plusieurs threads voient la meme valeur, ou pire, une valeur apres la fin de la boucle.

### Correction

```c
int numeros[NB];
for (int i = 0; i < NB; i++) {
    numeros[i] = i;
    pthread_create(&threads[i], NULL, func, &numeros[i]);
}
```

Ou avec un cast (courant mais moins propre) :

```c
pthread_create(&threads[i], NULL, func, (void*)(intptr_t)i);
/* Dans func : int id = (intptr_t)arg; */
```

---

## Resume : checklist avant de rendre sa copie

### Pour chaque code OpenMP, verifier :

- [ ] Les iterations sont-elles **independantes** ? (pas de `tab[i-1]`)
- [ ] Y a-t-il un **accumulateur** ? -> `reduction`
- [ ] Les variables temporaires sont-elles `private` ou declarees dans la boucle ?
- [ ] Les variables lues mais jamais modifiees sont `shared` (defaut) ?
- [ ] Le flag `-fopenmp` est mentionne pour la compilation ?
- [ ] Le chrono utilise `omp_get_wtime()` et non `clock()` ?

### Pour chaque code MPI, verifier :

- [ ] Les collectives sont appelees par **TOUS** les processus ?
- [ ] Il n'y a pas de **deadlock Send/Send** ?
- [ ] Le parametre `count` est un **nombre d'elements** (pas d'octets) ?
- [ ] N est divisible par nb_proc (ou Scatterv est utilise) ?
- [ ] `MPI_Finalize()` est appele a la fin ?
- [ ] `MPI_Init` est appele au debut ?

### Pour chaque kernel CUDA, verifier :

- [ ] La garde `if (i < N)` est presente ?
- [ ] Le nombre de blocs est `(N + taille_bloc - 1) / taille_bloc` ?
- [ ] Les donnees sont copiees avec `cudaMemcpy` (pas d'acces direct) ?
- [ ] `cudaDeviceSynchronize()` est appele avant de lire les resultats ?

### Pour les calculs d'Amdahl :

- [ ] La formule est `S = 1/((1-f) + f/p)` avec f = fraction parallelisable ?
- [ ] Le resultat a ete verifie avec un cas limite (f=1 -> S=p) ?
- [ ] Le speedup infini est `1/(1-f)` ?
