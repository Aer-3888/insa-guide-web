---
title: "TP1 - OpenMP : Prise en main"
sidebar_position: 1
---

# TP1 - OpenMP : Prise en main

> Following teacher instructions from: `S6/Parallelisme/data/moodle/tp/Sujets_TP/TP1_OpenMP.pdf`

---

## Prise en main de l'environnement openMP

Le sujet rappelle les commandes de base :

- Generation de l'executable : `gcc -fopenmp ex1.c -o ex1`
- Execution : `./ex1`
- Variable d'environnement : `OMP_NUM_THREADS`

---

## Exercice 1 -- Prise en main

### Enonce exact du sujet

> Ecrire un programme C qui se separe en 10 threads openMP, chacun affichera son numero de rang, puis a l'issue de l'execution de ces 10 threads, le programme affichera qu'il se termine.
>
> Il est toujours preferable de definir la variable d'environnement OMP_NUM_THREAD plutot que de fixer le nombre de Threads dans le programme lorsque cela est possible.
>
> - utiliser les directives suivantes : `#include <omp.h>`, `#pragma omp parallel`
> - utiliser les fonctions suivantes : `int omp_get_thread_num()` pour obtenir le rang d'un thread, `int omp_get_num_threads()` pour connaitre le nombre de threads
> - toujours compiler sous gcc avec l'option `-fopenmp` **en premier**

**Answer:**

Le programme utilise `#pragma omp parallel` pour creer une region parallele. Chaque thread execute le bloc et affiche son rang via `omp_get_thread_num()`. A la fin de la region parallele, une barriere implicite synchronise tous les threads, puis le thread maitre affiche le message de terminaison.

```c
#include <omp.h>
#include <stdlib.h>
#include <stdio.h>

int main(void)
{
    #pragma omp parallel
    {
        printf("Thread numero %d\n", omp_get_thread_num());
    }
    printf("Fin de programme\n");
    return EXIT_SUCCESS;
}
```

**Compilation & Run:**

```bash
gcc -fopenmp exo1.c -o exo1
export OMP_NUM_THREADS=10
./exo1
```

**Expected behavior/output:**

L'ordre d'affichage est non-deterministe (l'OS ordonnance les threads librement). "Fin de programme" apparait toujours en dernier grace a la barriere implicite.

```
Thread numero 3
Thread numero 0
Thread numero 7
Thread numero 1
Thread numero 5
Thread numero 9
Thread numero 4
Thread numero 2
Thread numero 8
Thread numero 6
Fin de programme
```

Sans le flag `-fopenmp`, le programme compile et s'execute avec 1 seul thread sans erreur ni avertissement.

---

## Exercice 2 -- Variables Decoupage de boucles

### Enonce exact du sujet

> On se propose de faire executer une boucle en decoupant l'espace d'iteration entre plusieurs Threads. Pour une boucle `for(i=0;i<100) i++` repartie sur 10 Threads par exemple, le Thread 0 executera les iterations i=0..9; le Thread 1 de 10 a 19 et ainsi de suite.
>
> Ecrivez un programme qui execute une telle boucle dans laquelle on affiche a chaque iteration, le numero de l'iteration courante et le numero du Thread executant cette partie de l'iteration.
>
> Apres et **seulement apres** avoir reussi la premiere partie de la question, utilisez `#pragma omp parallel for` pour faire la meme chose.

**Answer:**

### Partie 1 : Decoupage manuel

Chaque thread calcule ses propres bornes en fonction de son rang et du nombre total de threads. On utilise `#pragma omp parallel` (sans `for`) et chaque thread itere sur sa tranche.

```c
#include <omp.h>
#include <stdlib.h>
#include <stdio.h>

#define ITERNUM 100

int main(void)
{
    #pragma omp parallel
    {
        int num = omp_get_thread_num();
        int tot = omp_get_num_threads();
        int debut = (ITERNUM / tot) * num;
        int fin = (ITERNUM / tot) * (num + 1);
        for (int i = debut; i < fin; i++) {
            printf("Iteration %d executee par Thread %d\n", i, num);
        }
    }
    printf("Fin du programme. Il est possible que certaines iterations "
           "n'aient pas ete executees, si le nombre d'iterations n'est "
           "pas multiple du nombre de processus\n");
    return EXIT_SUCCESS;
}
```

**Piege de la division entiere :** Avec ITERNUM=100 et 3 threads, `100/3 = 33`, donc le thread 2 va de 66 a 98 (33*3=99). L'iteration 99 est perdue. Pour corriger, le dernier thread devrait aller jusqu'a ITERNUM :

```c
int fin = (num == tot - 1) ? ITERNUM : (ITERNUM / tot) * (num + 1);
```

Le commentaire du code original suggere ITERNUM=420, qui est le PPCM de 1 a 8, donc `420/tot` est toujours entier pour 1 a 8 threads.

### Partie 2 : Avec `#pragma omp parallel for`

```c
#include <omp.h>
#include <stdlib.h>
#include <stdio.h>

#define ITERNUM 100

int main(void)
{
    #pragma omp parallel for
    for (int i = 0; i < ITERNUM; i++) {
        printf("Iteration %d executee par Thread %d\n", i, omp_get_thread_num());
    }
    printf("Fin du programme.\n");
    return EXIT_SUCCESS;
}
```

OpenMP gere automatiquement le decoupage. Meme si ITERNUM n'est pas divisible par le nombre de threads, toutes les iterations sont executees (par ex. 34+33+33=100 avec 3 threads). La variable de boucle `i` est automatiquement `private`.

**Compilation & Run:**

```bash
gcc -fopenmp exo2.c -o exo2
export OMP_NUM_THREADS=10
./exo2
```

**Expected behavior/output:**

Les 100 iterations sont affichees dans un ordre non-deterministe. Avec la version manuelle et 3 threads, l'iteration 99 est manquante. Avec `parallel for`, toutes les iterations sont toujours presentes.

---

## Exercice 3 -- Calcul de PI

### Enonce exact du sujet

> Transformez le calcul de Pi suivant afin de le rendre parallele avec openMP (pour N threads). Attention au traitement des variables `som` et `x`.
>
> Comparez les durees d'execution entre la version mono-thread et les versions 2 et 4 threads. Que constatez-vous ?
>
> Optimisez votre programme et verifiez le gain en performance. Quel est le speedup maximal ? Votre processeur est-il dual-core ?
>
> Remarque : sous linux le fichier `/proc/cpuinfo` permet d'obtenir des informations sur le(s) processeur(s).

Le code sequentiel fourni par le sujet :

```c
#include<stdio.h>
int main () {
    static long nb_pas = 100000000; // 10^8
    double pas;
    long i;
    double x, pi, som = 0.0;
    pas = 1.0/(double) nb_pas;
    for (i=1;i<= nb_pas; i++){
        x = (i-0.5)*pas; som = som + 4.0/(1.0+x*x);
    }
    pi = pas * som;
    printf("PI=%f\n",pi);
    return 0;
}
```

**Answer:**

### Probleme des race conditions

Les variables `som` et `x` sont partagees par defaut. Si plusieurs threads font `som += ...` ou `x = ...` simultanement, les resultats sont incorrects (race condition).

- `x` doit etre `private` (chaque thread a sa propre copie)
- `som` doit utiliser `reduction(+:som)` (copies locales combinees a la fin)

### Version parallele optimisee

```c
#include <stdlib.h>
#include <stdio.h>
#include <omp.h>

int main(void)
{
    static long nb_pas = 100000000; /* 10^8 */
    double pas;
    double x, pi, som = 0.0;

    pas = 1.0 / (double)nb_pas;

    double debut = omp_get_wtime();

    #pragma omp parallel for reduction(+:som) private(x)
    for (long i = 1; i <= nb_pas; i++) {
        x = (i - 0.5) * pas;
        som = som + 4.0 / (1.0 + x * x);
    }

    double duree = omp_get_wtime() - debut;

    pi = pas * som;
    printf("PI=%.15f\n", pi);
    printf("Temps: %f secondes\n", duree);

    return EXIT_SUCCESS;
}
```

### Pourquoi NE PAS utiliser `critical`

```c
/* MAUVAISE approche -- plus lent que sequentiel */
#pragma omp parallel for private(x)
for (long i = 1; i <= nb_pas; i++) {
    x = (i - 0.5) * pas;
    #pragma omp critical
    som += 4.0 / (1.0 + x * x);
}
```

Le `critical` serialise l'acces a `som` : un seul thread a la fois peut y acceder. Le resultat est correct mais le programme est plus lent que la version sequentielle a cause de l'overhead du verrou.

**Compilation & Run:**

```bash
gcc -fopenmp exo3.c -o exo3 -lm

export OMP_NUM_THREADS=1
./exo3

export OMP_NUM_THREADS=2
./exo3

export OMP_NUM_THREADS=4
./exo3
```

**Expected behavior/output:**

La valeur de PI est toujours correcte (3.141592653589793...). Les temps diminuent quasi-lineairement :

| Threads | Temps (s) | Speedup S(p)=T(1)/T(p) | Efficacite E(p)=S(p)/p |
|---------|-----------|-------------------------|-------------------------|
| 1       | ~0.50     | 1.00                    | 100%                    |
| 2       | ~0.25     | ~2.0                    | ~100%                   |
| 4       | ~0.13     | ~3.8                    | ~96%                    |
| 8       | ~0.07     | ~7.1                    | ~89%                    |

Le speedup est quasi-lineaire car le calcul est compute-bound (beaucoup d'operations flottantes, peu d'acces memoire) et les iterations sont completement independantes.

Le speedup maximal correspond au nombre de coeurs physiques. Au-dela, l'hyperthreading n'apporte que peu de gain. Pour verifier : `cat /proc/cpuinfo | grep "cpu cores"`.

---

## Exercice 4 -- Utilisation du Cluster math-info

### Enonce exact du sujet

> **Utilisation du cluster :**
> - Pour se connecter : `ssh -l nom-login cluster-infomath-tete.educ.insa`
> - Dans le repertoire `/data`, creer un repertoire dont le nom est votre login
> - Recompiler les programmes, copier l'executable dans `/data/votre-nom`
> - Executer : `srun -N1 -c24 mon-programme` (attend un noeud libre, execute avec 24 coeurs)
>
> **Exercice :** Testez les performances de votre programme et faites une courbe de performance et de speedup pour 1 a 24 Threads. Que constatez-vous ? Pourquoi ?

**Answer:**

### Connexion et preparation

```bash
ssh -l votre-login cluster-infomath-tete.educ.insa-rennes.fr
mkdir -p /data/votre-login
cd /data/votre-login
# Copier exo3.c ici puis compiler
gcc -fopenmp exo3.c -o exo3 -lm
```

### Script de test automatise

```bash
#!/bin/bash
for i in 1 2 4 6 8 12 16 20 24
do
    export OMP_NUM_THREADS=$i
    echo -n "Threads=$i : "
    srun -N1 -c24 ./exo3
done
```

### Execution

```bash
srun -N1 -c24 ./exo3
```

**Expected behavior/output:**

| Threads | Temps (s) | Speedup | Efficacite |
|---------|-----------|---------|------------|
| 1       | ~0.50     | 1.0     | 100%       |
| 2       | ~0.25     | ~2.0    | ~100%      |
| 4       | ~0.13     | ~3.8    | ~96%       |
| 8       | ~0.07     | ~7.1    | ~89%       |
| 12      | ~0.05     | ~10.0   | ~83%       |
| 16      | ~0.04     | ~12.5   | ~78%       |
| 20      | ~0.04     | ~12.5   | ~63%       |
| 24      | ~0.04     | ~12.5   | ~52%       |

**Que constate-t-on ? Pourquoi ?**

1. **Speedup quasi-lineaire jusqu'a 8-12 threads** : le calcul est compute-bound et les iterations sont independantes.
2. **Plateau a partir de 16 threads** : la bande passante memoire du noeud est saturee. Le bus memoire est partage entre tous les coeurs.
3. **Au-dela du nombre de coeurs physiques** (hyperthreading), le speedup stagne ou diminue car deux threads logiques sur le meme coeur physique partagent les memes unites de calcul.

Les facteurs limitants sont :
- La bande passante memoire partagee entre les coeurs
- L'overhead de creation/synchronisation des threads (negligeable ici)
- La partie sequentielle du code (initialisation, printf) -- negligeable selon la loi d'Amdahl
- L'hyperthreading qui ne double pas la puissance de calcul effective
