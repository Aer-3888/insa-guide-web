---
title: "Chapitre 04 -- MPI (Memoire distribuee)"
sidebar_position: 4
---

# Chapitre 04 -- MPI (Memoire distribuee)

## 1. Modele SPMD

MPI utilise le modele **SPMD** (Single Program, Multiple Data) : tous les processus executent le meme programme, mais chacun a un **rang** different et sa **propre memoire**. La communication se fait exclusivement par **envoi de messages**.

---

## 2. Squelette d'un programme MPI

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>

int main(int argc, char *argv[])
{
    int rang, nb_proc;

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rang);
    MPI_Comm_size(MPI_COMM_WORLD, &nb_proc);

    printf("Processus %d sur %d\n", rang, nb_proc);

    MPI_Finalize();
    return EXIT_SUCCESS;
}
```

```bash
mpicc hello.c -o hello
mpiexec -n 4 ./hello
```

| Concept | Signification |
|---------|---------------|
| Processus | Instance du programme avec sa propre memoire |
| Rang | Numero unique (0 a nb_proc-1) |
| Communicateur | Groupe de processus. `MPI_COMM_WORLD` = tous |

---

## 3. Communications point a point

### MPI_Send (bloquant)

```c noexec
MPI_Send(
    const void *buf,     /* donnees a envoyer */
    int count,           /* nombre d'elements (PAS taille en octets) */
    MPI_Datatype type,   /* MPI_INT, MPI_DOUBLE, etc. */
    int dest,            /* rang du destinataire */
    int tag,             /* etiquette du message */
    MPI_Comm comm        /* MPI_COMM_WORLD */
);
```

### MPI_Recv (bloquant)

```c noexec
MPI_Recv(
    void *buf,           /* buffer de reception */
    int count,           /* nombre max d'elements */
    MPI_Datatype type,
    int source,          /* rang expediteur (ou MPI_ANY_SOURCE) */
    int tag,             /* etiquette (ou MPI_ANY_TAG) */
    MPI_Comm comm,
    MPI_Status *status   /* info message (ou MPI_STATUS_IGNORE) */
);
```

### Types MPI

| Type MPI | Type C |
|----------|--------|
| `MPI_INT` | `int` |
| `MPI_LONG` | `long` |
| `MPI_FLOAT` | `float` |
| `MPI_DOUBLE` | `double` |
| `MPI_CHAR` | `char` |

### Exemple : ping-pong

```c noexec
if (rang == 0) {
    int val = 42;
    MPI_Send(&val, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
    MPI_Recv(&val, 1, MPI_INT, 1, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
} else {
    int val;
    MPI_Recv(&val, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
    val += 100;
    MPI_Send(&val, 1, MPI_INT, 0, 0, MPI_COMM_WORLD);
}
```

---

## 4. Deadlocks en MPI

### Deadlock classique : Send/Send

```c noexec
/* DEADLOCK -- les deux envoient avant de recevoir */
if (rang == 0) {
    MPI_Send(&a, 1, MPI_INT, 1, 0, comm);
    MPI_Recv(&b, 1, MPI_INT, 1, 0, comm, MPI_STATUS_IGNORE);
} else {
    MPI_Send(&a, 1, MPI_INT, 0, 0, comm);   /* BLOQUE */
    MPI_Recv(&b, 1, MPI_INT, 0, 0, comm, MPI_STATUS_IGNORE);
}
```

### Solutions

**1. Ordonner Send/Recv :**

```c noexec
if (rang == 0) { Send puis Recv; }
else            { Recv puis Send; }
```

**2. MPI_Sendrecv (atomique) :**

```c noexec
MPI_Sendrecv(&a, 1, MPI_INT, partenaire, 0,
             &b, 1, MPI_INT, partenaire, 0,
             comm, MPI_STATUS_IGNORE);
```

**3. Communications non-bloquantes :**

```c noexec
MPI_Request req;
MPI_Isend(&a, 1, MPI_INT, dest, 0, comm, &req);
MPI_Recv(&b, 1, MPI_INT, src, 0, comm, MPI_STATUS_IGNORE);
MPI_Wait(&req, MPI_STATUS_IGNORE);
```

---

## 5. Communications collectives

**Toutes les collectives doivent etre appelees par TOUS les processus du communicateur.**

### MPI_Bcast -- 1 vers tous

```c noexec
MPI_Bcast(&N, 1, MPI_INT, 0, MPI_COMM_WORLD);
/* P0 envoie N a tous. Tous appellent Bcast. */
```

### MPI_Scatter -- distribuer un tableau

```c noexec
MPI_Scatter(
    tab_complet, count_par_proc, MPI_DOUBLE,    /* envoi */
    mon_morceau, count_par_proc, MPI_DOUBLE,    /* reception */
    0, MPI_COMM_WORLD
);
```

P0 decoupe `tab_complet` en morceaux egaux et en envoie un a chaque processus.

### MPI_Gather -- rassembler

```c noexec
MPI_Gather(
    mon_morceau, count_par_proc, MPI_DOUBLE,    /* envoi */
    tab_complet, count_par_proc, MPI_DOUBLE,    /* reception (root) */
    0, MPI_COMM_WORLD
);
```

Chaque processus envoie son morceau, P0 les rassemble.

### MPI_Reduce -- combiner avec operation

```c noexec
MPI_Reduce(
    &ma_valeur, &resultat, 1, MPI_DOUBLE,
    MPI_SUM, 0, MPI_COMM_WORLD
);
/* P0 recoit la somme de toutes les ma_valeur */
```

### MPI_Allreduce -- reduce + diffusion

```c noexec
MPI_Allreduce(&ma_valeur, &resultat, 1, MPI_DOUBLE,
              MPI_SUM, MPI_COMM_WORLD);
/* TOUS les processus recoivent le resultat */
```

### Operations de reduction

| Operation | Resultat |
|-----------|----------|
| `MPI_SUM` | Somme |
| `MPI_PROD` | Produit |
| `MPI_MAX` | Maximum |
| `MPI_MIN` | Minimum |
| `MPI_MAXLOC` | Max + rang |
| `MPI_MINLOC` | Min + rang |

### Tableau recapitulatif

| Fonction | Direction | Description |
|----------|-----------|-------------|
| `MPI_Bcast` | 1 -> tous | Diffuser une valeur |
| `MPI_Scatter` | 1 -> tous (portions) | Distribuer un tableau |
| `MPI_Gather` | tous -> 1 | Rassembler les morceaux |
| `MPI_Reduce` | tous -> 1 (operation) | Combiner (somme, max...) |
| `MPI_Allreduce` | tous -> tous (operation) | Reduce + diffusion |
| `MPI_Allgather` | tous -> tous | Gather + diffusion |
| `MPI_Barrier` | synchronisation | Attendre tout le monde |

---

## 6. Communications non-bloquantes

```c noexec
MPI_Request req;
MPI_Isend(&a, n, MPI_DOUBLE, dest, 0, comm, &req);
/* faire du calcul pendant le transfert */
calculer_interieur();
MPI_Wait(&req, MPI_STATUS_IGNORE);   /* attendre la fin */
```

Permet de **recouvrir calcul et communication** (overlapping).

---

## 7. Mesurer le temps

```c noexec
double t0 = MPI_Wtime();
/* ... calcul ... */
double t1 = MPI_Wtime();
printf("Temps = %f s\n", t1 - t0);
```

Chaque processus a son propre chrono. Utiliser `MPI_Barrier` avant la mesure pour synchroniser.

---

## 8. Exemple : calcul de PI distribue (TP4 INSA)

```c noexec
MPI_Init(&argc, &argv);
MPI_Comm_rank(MPI_COMM_WORLD, &rang);
MPI_Comm_size(MPI_COMM_WORLD, &nb_proc);

if (rang == 0 && argc > 1) N = strtol(argv[1], NULL, 10);
MPI_Bcast(&N, 1, MPI_LONG, 0, MPI_COMM_WORLD);

double pas = 1.0 / (double)N;
double borneInf = (double)rang / nb_proc;
double somme_locale = 0.0;
/* Distribution par blocs contigus */
for (long i = 0; i < N / nb_proc; i++) {
    double x = borneInf + (i + 0.5) * pas;
    somme_locale += 4.0 / (1.0 + x * x);
}
somme_locale *= pas;

double pi;
MPI_Reduce(&somme_locale, &pi, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);
```

---

## 9. Exemple : produit matrice-vecteur distribue (TP5 INSA)

```c noexec
/* 1. Bcast du vecteur a tous */
MPI_Bcast(vecteur, n, MPI_DOUBLE, 0, MPI_COMM_WORLD);

/* 2. Scatter de la matrice (N/P lignes par processus) */
MPI_Scatter(matrice, n*(n/nb_proc), MPI_DOUBLE,
            mon_fragment, n*(n/nb_proc), MPI_DOUBLE, 0, MPI_COMM_WORLD);

/* 3. Calcul local */
for (int i = 0; i < n/nb_proc; i++) {
    resultat[i] = 0;
    for (int j = 0; j < n; j++)
        resultat[i] += mon_fragment[i*n + j] * vecteur[j];
}

/* 4. Gather des resultats */
MPI_Gather(resultat, n/nb_proc, MPI_DOUBLE,
           resultat_complet, n/nb_proc, MPI_DOUBLE, 0, MPI_COMM_WORLD);
```

---

## 10. Exemple : chaleur distribuee avec halo exchange (TP6 INSA)

Pattern SPMD avec ghost zones : chaque processus stocke N/P lignes utiles + 2 lignes fantomes echangees avec les voisins a chaque iteration.

```c noexec
/* Envoi non-bloquant de mes bords aux voisins */
if (rang > 0)
    MPI_Isend(fragment + M+2, M+2, MPI_DOUBLE, rang-1, 0, comm, &req);
if (rang+1 < nb_proc)
    MPI_Isend(fragment + taille - 2*(M+2), M+2, MPI_DOUBLE, rang+1, 0, comm, &req);

/* Reception bloquante des lignes fantomes */
if (rang > 0)
    MPI_Recv(fragment, M+2, MPI_DOUBLE, rang-1, 0, comm, &status);
if (rang+1 < nb_proc)
    MPI_Recv(fragment + taille - M - 2, M+2, MPI_DOUBLE, rang+1, 0, comm, &status);

/* Convergence globale */
MPI_Allreduce(&delta_local, &delta_total, 1, MPI_DOUBLE, MPI_SUM, comm);
```

---

## 11. Pieges classiques

| Piege | Correction |
|-------|------------|
| Deadlock Send/Send | Alterner : un Send, l'autre Recv |
| Bcast dans `if (rang==0)` seulement | Bcast appele par TOUS |
| Confondre count et taille en octets | count = nombre d'elements |
| N non divisible par nb_proc | Utiliser Scatterv/Gatherv |
| Oublier MPI_Finalize | Messages perdus |

---

## CHEAT SHEET -- MPI

```c noexec
/* Initialisation */
MPI_Init(&argc, &argv);
MPI_Comm_rank(MPI_COMM_WORLD, &rang);
MPI_Comm_size(MPI_COMM_WORLD, &nb_proc);
MPI_Finalize();

/* Point a point */
MPI_Send(&buf, count, type, dest, tag, comm);
MPI_Recv(&buf, count, type, src, tag, comm, &status);
MPI_Sendrecv(&send, cnt, type, dest, stag,
             &recv, cnt, type, src, rtag, comm, &status);

/* Collectives (appellees par TOUS) */
MPI_Bcast(&buf, count, type, root, comm);
MPI_Scatter(sendbuf, scnt, stype, recvbuf, rcnt, rtype, root, comm);
MPI_Gather(sendbuf, scnt, stype, recvbuf, rcnt, rtype, root, comm);
MPI_Reduce(&send, &recv, count, type, MPI_SUM, root, comm);
MPI_Allreduce(&send, &recv, count, type, MPI_SUM, comm);
MPI_Barrier(comm);

/* Non-bloquant */
MPI_Isend(&buf, count, type, dest, tag, comm, &request);
MPI_Irecv(&buf, count, type, src, tag, comm, &request);
MPI_Wait(&request, &status);

/* Temps */
double t = MPI_Wtime();

/* Compilation et execution */
mpicc prog.c -o prog -lm
mpiexec -n 4 ./prog
```
