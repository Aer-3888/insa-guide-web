---
title: "TP4 - MPI : Calcul de PI distribue"
sidebar_position: 4
---

# TP4 - MPI : Calcul de PI distribue

> D'apres les consignes de l'enseignant : `S6/Parallelisme/data/moodle/tp/Sujets_TP/TP4_mpi.pdf`

---

## Mise en place de l'environnement

### Enonce exact du sujet

> Vous devez d'abord configurer ssh si ce n'est deja fait :
> - commande `ssh-keygen` (sans passphrase, laisser les fichiers a l'endroit par defaut !)
> - dans le repertoire `~/.ssh` recopier le fichier `id_rsa.pub` dans `authorized_keys`
> - tester que le ssh fonctionne bien SANS demander le mot de passe.
>
> ATTENTION : si on a configure une passphrase et qu'on recommence ssh-keygen il faut se delogger sinon le ssh-agent qui tourne sous la session garde l'ancienne passphrase.
>
> Pour configurer MPI, referez-vous a : `/home-info/commun/4info/Parallelisme/mpi`
> - Creez un fichier `.machines` sous votre home dir (1 nom de machine par ligne)
> - Pour compiler : `mpicc -o <programme> <programme.c>`
> - Pour executer : `mpiexec -n <nb processus> -f ~/.machines <programme>`

**Reponse :**

```bash
# Configuration SSH
ssh-keygen                       # Appuyer Entree a chaque question (SANS passphrase)
cd ~/.ssh
cp id_rsa.pub authorized_keys
ssh localhost                    # Doit se connecter SANS mot de passe

# Fichier de machines
echo "localhost" > ~/.machines
echo "localhost" >> ~/.machines
echo "localhost" >> ~/.machines
echo "localhost" >> ~/.machines
```

---

## Premier exemple -- Hello World MPI

### Enonce exact du sujet

> Copiez, compilez et executez le programme `monprog.c`.
> Vous devez obtenir :
> ```
> Hello world from node 0 of 1 nodes
> Fini
> ```
>
> Executez : `mpiexec -n 3 ./monprog`
> Vous devez obtenir (pas forcement dans cet ordre) :
> ```
> Hello world from node 0 of 3 nodes
> Hello world from node 2 of 3 nodes
> Fini
> Hello world from node 1 of 3 nodes
> Fini
> Fini
> ```

**Reponse :**

```c noexec
#include <stdio.h>
#include <mpi.h>

int main(int argc, char **argv)
{
    int rank, size;

    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    printf("Hello world from node %d of %d nodes\n", rank, size);

    if (rank == 0) {
        printf("Fini\n");
    }

    MPI_Finalize();
    return 0;
}
```

**Compilation et execution :**

```bash
mpicc -o monprog monprog.c
mpiexec -n 1 ./monprog
mpiexec -n 3 ./monprog
```

**Comportement et sortie attendus :**

Chaque processus execute le meme code (SPMD). L'ordre d'affichage est non-deterministe. Seul le rang 0 affiche "Fini" (dans le code ci-dessus). Le sujet montre que chaque processus affiche "Fini" -- cela depend de la version du code fourni.

---

## Premier exemple -- teste.c

### Enonce exact du sujet

> Copiez, compilez et executez le programme `teste.c` avec un nombre variable de processus. Ce petit exemple contient l'essentiel de ce qu'il faut savoir pour ecrire des programmes MPI simples.

**Reponse :**

Ce programme de test illustre les fonctions de base MPI : `MPI_Init`, `MPI_Comm_rank`, `MPI_Comm_size`, `MPI_Finalize`, et les communications collectives.

---

## Calcul de PI -- Implementation sequentielle

### Enonce exact du sujet

> Le programme a mettre en oeuvre calcule Pi par approximation. Pi etant l'integrale d'une fonction sur un intervalle :
>
> f(x) = 4/(1+x^2)
> integrale de 0 a 1 de f(x)dx = 4 * [arctan(x)] de 0 a 1 = 4 * (pi/4 - 0) = pi
>
> On va donc calculer Pi en calculant cette integrale par approximation par la methode des trapezes :
>
> integrale de a a b de f(x)dx = lim(n->inf) somme(i=1..n) (f(x_i) + f(x_{i+1})) * h/2
> avec h = (b-a)/n et x_i = (i-1)*h + a
>
> Pour Pi on calculera : integrale de 0 a 1 ~ (1/2) * somme(i=1..n) ( f((i-1)/n) + f(i/n) )
>
> **Implementation sequentielle :** Ecrivez le programme calculant Pi avec cette methode. Verifier que l'on s'approche bien de Pi quand n augmente.

**Reponse :**

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <mpi.h>

#define N (long int)1000000

double f(double x)
{
    return 4.0 / (1.0 + pow(x, 2.0));
}

int main(void)
{
    double PI = 3.141592653589793238462643;
    double t0, t1;
    double rez = 0, oldrez = 0, temprez = f(0);

    t0 = MPI_Wtime();

    for (double i = 1; i <= N; i++) {
        oldrez = temprez;            /* f(x_{i-1}) */
        temprez = f(i / N);          /* f(x_i)     */
        rez += (oldrez + temprez);   /* somme des (f(x_{i-1}) + f(x_i)) */
    }

    t1 = MPI_Wtime();

    rez = rez / 2.0;   /* division par 2 (formule des trapezes) */
    rez = rez / N;      /* multiplication par h = 1/N */

    fprintf(stderr, "PI=%.16f, error %e, time %.6lf (s)\n",
            rez, fabs(rez - PI) / PI, t1 - t0);
    return 0;
}
```

**Compilation et execution :**

```bash
mpicc sequentiel.c -o sequentiel -lm
./sequentiel
```

**Comportement et sortie attendus :**

```
PI=3.1415926535899348, error 4.396282e-14, time 0.048572 (s)
```

L'erreur relative diminue quand N augmente, confirmant la convergence de la methode des trapezes.

---

## Calcul de PI -- Implementation parallele

### Enonce exact du sujet

> **Implementation parallele :** Realisez le programme parallele. Le processus 0 prend en parametre les valeurs de n et de p et transmet la valeur de n a tous les autres processus 1...p. Il realise egalement une partie des calculs lui meme. Chaque processus realise les calculs dont il est responsable et envoie au maitre le resultat. On pourra utiliser les fonctions `MPI_Broadcast` et `MPI_Gather`. Tester votre programme.

**Reponse :**

### Strategie de parallelisation

L'intervalle [0, 1] est decoupe en P sous-intervalles, un par processus :
- Processus 0 : [0, 1/P) -- calcule N/P trapezes
- Processus 1 : [1/P, 2/P) -- calcule N/P trapezes
- ...
- Processus P-1 : [(P-1)/P, 1) -- calcule N/P trapezes

Chaque processus calcule sa somme partielle, puis `MPI_Reduce` additionne toutes les sommes sur le processus 0.

### Code complet

```c noexec
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <mpi.h>

int main(int argc, char **argv)
{
    long int N = 1000000;
    int rank = 0;
    int nbProc = 1;
    double PI = 3.141592653589793238462643;
    double t0 = 0, t1 = 0;
    double estimationPi;
    double resultPartiel = 0;
    double borneInf = 0;
    double nextVal = 0;
    double calculPrecedent = 0;
    double calcul = 0;
    double pas = 0;

    /* Initialisation MPI */
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &nbProc);

    /* Processus 0 : recuperation de N depuis argv */
    if (rank == 0) {
        if (argc > 1) {
            N = strtol(argv[1], NULL, 10);
        } else {
            printf("Default N size : %ld\n", N);
        }
    }

    /* Broadcast de N a tous les processus */
    /* TOUS les processus doivent appeler MPI_Bcast, pas seulement P0 */
    MPI_Bcast(&N, 1, MPI_LONG, 0, MPI_COMM_WORLD);

    t0 = MPI_Wtime();

    /* Calcul local : chaque processus traite son intervalle */
    pas = 1.0 / (double)N;
    borneInf = ((double)rank) / nbProc;         /* debut de l'intervalle */
    nextVal = borneInf + pas;                     /* premier point x_1 */
    calculPrecedent = 4.0 / (1.0 + borneInf * borneInf);  /* f(borneInf) */

    for (long int l = 0; l < N / nbProc; l++) {
        calcul = 4.0 / (1.0 + nextVal * nextVal);          /* f(x_{l+1}) */
        resultPartiel += pas * (calculPrecedent + calcul);  /* aire trapeze */
        calculPrecedent = calcul;
        nextVal += pas;
    }

    t1 = MPI_Wtime();

    /* Reduction : somme des resultats partiels sur P0 */
    MPI_Reduce(&resultPartiel, &estimationPi, 1, MPI_DOUBLE,
               MPI_SUM, 0, MPI_COMM_WORLD);

    if (rank == 0) {
        estimationPi = estimationPi / 2.0;  /* division par 2 des trapezes */
        fprintf(stderr, "PI=%.16f, error %e, time %.6lf (s)\n",
                estimationPi, fabs(estimationPi - PI) / PI, t1 - t0);
    }

    MPI_Finalize();
    return EXIT_SUCCESS;
}
```

### Schema des communications

```
P0: [lire N] --> [Bcast N] --> [calcul local sur [0, 1/P)]       --> [Reduce] --> [afficher PI]
P1:              [Bcast N] --> [calcul local sur [1/P, 2/P)]      --> [Reduce]
P2:              [Bcast N] --> [calcul local sur [2/P, 3/P)]      --> [Reduce]
P3:              [Bcast N] --> [calcul local sur [3/P, 1)]        --> [Reduce]
```

### Detail des fonctions MPI utilisees

**MPI_Bcast :**
```c noexec
MPI_Bcast(&N, 1, MPI_LONG, 0, MPI_COMM_WORLD);
/*         ^  ^  ^          ^  ^                */
/*     buffer nb type     root communicateur    */
```
P0 envoie N a tous. Tous les processus doivent appeler MPI_Bcast (c'est une collective).

**MPI_Reduce :**
```c noexec
MPI_Reduce(&resultPartiel, &estimationPi, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);
/*          ^               ^              ^  ^           ^        ^  ^               */
/*      buf envoi       buf recept.       nb  type       op      root comm           */
```
Chaque processus fournit `resultPartiel`. MPI additionne (`MPI_SUM`) et place le resultat dans `estimationPi` sur P0.

**Compilation et execution :**

```bash
mpicc parallel.c -o parallel -lm

# Execution avec differents nombres de processus
mpiexec -n 1 ./parallel 1000000
mpiexec -n 2 ./parallel 1000000
mpiexec -n 4 ./parallel 1000000
mpiexec -n 8 ./parallel 1000000
```

**Comportement et sortie attendus :**

```
$ mpiexec -n 1 ./parallel 1000000
PI=3.1415926535899344, error 4.268697e-14, time 0.048100 (s)

$ mpiexec -n 4 ./parallel 1000000
PI=3.1415926535899175, error 7.335100e-14, time 0.012500 (s)
```

L'erreur varie legerement entre executions car l'ordre des additions flottantes change (l'addition n'est pas associative en virgule flottante).

---

## Performance

### Enonce exact du sujet

> Nous allons evaluer la performance de ce programme pour un nombre d'intervalles "n" donne et un nombre de processus variable. Pour cela, nous utiliserons la fonction `MPI_Wtime`.

**Reponse :**

### Resultats typiques (N = 10^6)

| Processus | Temps (s) | Speedup S(p)=T(1)/T(p) | Efficacite E(p)=S(p)/p |
|-----------|-----------|-------------------------|-------------------------|
| 1         | 0.0481    | 1.00                    | 100%                    |
| 2         | 0.0248    | 1.94                    | 97%                     |
| 4         | 0.0125    | 3.85                    | 96%                     |
| 8         | 0.0065    | 7.40                    | 93%                     |

### Pourquoi le speedup est excellent

1. **Compute-bound** : le calcul `4.0/(1.0+x*x)` est une operation flottante dense avec peu d'acces memoire.
2. **Communication minimale** : 1 Bcast (8 octets pour N) + 1 Reduce (8 octets pour un double). Le ratio calcul/communication est enorme.
3. **Iterations completement independantes** : pas de dependance de donnees entre processus pendant le calcul.
4. **Equilibrage parfait** : chaque processus a exactement N/P trapezes.

### Loi d'Amdahl

La fraction sequentielle (lecture de N, calcul final) est estimee a f ~ 0.0001 :
```
S_max(4)  = 1 / (0.0001 + 0.9999/4)  = 3.999
S_max(8)  = 1 / (0.0001 + 0.9999/8)  = 7.994
S_max(16) = 1 / (0.0001 + 0.9999/16) = 15.976
```

Le speedup theorique est quasi-parfait. L'ecart en pratique vient de la latence de `MPI_Init`, `MPI_Bcast` et `MPI_Reduce`.
