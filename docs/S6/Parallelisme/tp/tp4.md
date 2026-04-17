---
title: "TP4 - MPI: Calcul de PI (Introduction)"
sidebar_position: 4
---

# TP4 - MPI: Calcul de PI (Introduction)

Premier contact avec MPI (Message Passing Interface) pour le calcul parallèle distribué.

## Objectifs pédagogiques

- Comprendre le modèle de programmation MPI
- Maîtriser les communications collectives de base
- Distribuer un calcul sur plusieurs processus
- Mesurer les performances en mémoire distribuée

## Configuration de l'environnement MPI

### 1. Configuration SSH (prérequis)

MPI utilise SSH pour lancer les processus sur différentes machines.

```bash
# Générer une paire de clés (SANS passphrase)
ssh-keygen
# Appuyer sur Entrée pour tous les choix par défaut

# Copier la clé publique dans authorized_keys
cd ~/.ssh
cp id_rsa.pub authorized_keys

# Tester que SSH fonctionne SANS demander de mot de passe
ssh localhost
# Doit se connecter directement
```

**Important** : Si vous configurez une passphrase puis recommencez, déloguez-vous pour que ssh-agent oublie l'ancienne passphrase.

### 2. Configuration MPI

Référence : `/home-info/commun/4info/Parallelisme/mpi`

**Créer un fichier de machines** :
```bash
# Créer ~/.machines avec une machine par ligne
echo "localhost" > ~/.machines
echo "localhost" >> ~/.machines
echo "localhost" >> ~/.machines
echo "localhost" >> ~/.machines
# 4 slots sur localhost
```

**Compilation** :
```bash
mpicc -o programme programme.c
```

**Exécution** :
```bash
mpiexec -n <nb_processus> -f ~/.machines ./programme
```

---

## Premier exemple - Hello World

### Code minimal MPI

```c
#include <stdio.h>
#include <mpi.h>

int main(int argc, char **argv) {
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

### Exécution

```bash
mpicc -o hello hello.c
mpiexec -n 1 ./hello
# Output: Hello world from node 0 of 1 nodes
#         Fini

mpiexec -n 3 ./hello
# Output (ordre non-déterministe):
# Hello world from node 0 of 3 nodes
# Fini
# Hello world from node 2 of 3 nodes
# Hello world from node 1 of 3 nodes
```

**Observations** :
- Chaque processus exécute le même code (SPMD)
- L'ordre d'exécution est non-déterministe
- Seul le rang 0 affiche "Fini"

---

## Calcul de PI - Version séquentielle

### Méthode mathématique

Calcul de π par intégration numérique (méthode des trapèzes) :

```
π = ∫₀¹ 4/(1+x²) dx
```

Approximation par somme de trapèzes :

```
∫ f(x)dx ≈ Σ (f(xᵢ) + f(xᵢ₊₁)) × h/2
```

Avec `h = (b-a)/n` et `xᵢ = i/n`.

### Code séquentiel

```c
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <mpi.h>

#define N 1000000L

double f(double x) {
    return 4.0 / (1.0 + pow(x, 2.0));
}

int main(void) {
    double PI = 3.141592653589793238462643;
    double t0, t1;
    double rez = 0, oldrez = 0, temprez = f(0);
    
    t0 = MPI_Wtime();
    for (double i=1; i<=N; i++) {
        oldrez = temprez;
        temprez = f(i/N);
        rez += (oldrez + temprez);
    }
    t1 = MPI_Wtime();
    
    rez = rez / 2.0;
    rez = rez / N;
    
    fprintf(stderr, "PI=%.16f, error %e, time %.6lf (s)\n", 
            rez, fabs(rez-PI)/PI, t1-t0);
    return 0;
}
```

**Principe** :
- Calculer `f(x)` en N points
- Additionner les aires des trapèzes
- Normaliser par le pas

---

## Calcul de PI - Version parallèle MPI

### Stratégie de parallélisation

1. **Processus 0** (maître) :
   - Lit le paramètre N
   - Envoie N à tous les processus (`MPI_Bcast`)
   - Participe au calcul

2. **Tous les processus** :
   - Calculent une partie des intervalles
   - Processus `k` calcule les intervalles : `k/p, k/p + 1/N, k/p + 2/N, ..., (k+1)/p`

3. **Réduction** :
   - Chaque processus envoie son résultat partiel au processus 0 (`MPI_Reduce`)
   - Processus 0 additionne tous les résultats

### Code parallèle

```c
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <mpi.h>

int main(int argc, char **argv) {
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

    // Initialisation MPI
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &nbProc);

    // Processus 0 : récupération de N
    if (rank == 0) {
        if (argc > 1) {
            N = strtol(argv[1], NULL, 10);
        } else {
            printf("Default N size : %ld\n", N);
        }
    }
    
    // Broadcast de N à tous les processus
    MPI_Bcast(&N, 1, MPI_LONG, 0, MPI_COMM_WORLD);
    
    t0 = MPI_Wtime();

    // Calcul local
    pas = 1.0 / (double)N;
    borneInf = ((double)rank) / nbProc;
    nextVal = borneInf + pas;
    calculPrecedent = 4.0 / (1.0 + borneInf * borneInf);
    
    for (long int l = 0; l < N/nbProc; l++) {
        calcul = 4.0 / (1.0 + nextVal * nextVal);
        resultPartiel += pas * (calculPrecedent + calcul);
        calculPrecedent = calcul;
        nextVal += pas;
    }
    
    t1 = MPI_Wtime();

    // Réduction : somme des résultats partiels
    MPI_Reduce(&resultPartiel, &estimationPi, 1, MPI_DOUBLE, 
               MPI_SUM, 0, MPI_COMM_WORLD);
    
    if (rank == 0) {
        estimationPi = estimationPi / 2.0;
        fprintf(stderr, "PI=%.16f, error %e, time %.6lf (s)\n", 
                estimationPi, fabs(estimationPi-PI)/PI, t1-t0);
    }
    
    MPI_Finalize();
    return 0;
}
```

### Analyse du code

**Distribution des intervalles** :
- Processus 0 : [0, 1/p)
- Processus 1 : [1/p, 2/p)
- ...
- Processus p-1 : [(p-1)/p, 1)

Chaque processus calcule N/p trapèzes.

**Communications** :
- `MPI_Bcast(&N, 1, MPI_LONG, 0, MPI_COMM_WORLD)` : Processus 0 envoie N à tous
- `MPI_Reduce(&resultPartiel, &estimationPi, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD)` : Tous envoient à 0, qui additionne

**Mesure de temps** :
- `MPI_Wtime()` : Horloge murale (temps réel)
- Mesure entre le début du calcul et la fin (avant la réduction pour éviter le temps de communication)

---

## Fonctions MPI de base

### 1. Initialisation et terminaison

```c
int MPI_Init(int *argc, char ***argv);
int MPI_Finalize(void);
```

**Important** :
- `MPI_Init` : première fonction MPI appelée
- `MPI_Finalize` : dernière fonction MPI appelée
- Aucun appel MPI après `MPI_Finalize`

### 2. Informations sur les processus

```c
int MPI_Comm_rank(MPI_Comm comm, int *rank);
int MPI_Comm_size(MPI_Comm comm, int *size);
```

- `rank` : numéro du processus (0 à size-1)
- `size` : nombre total de processus
- `MPI_COMM_WORLD` : communicateur par défaut (tous les processus)

### 3. Broadcast

```c
int MPI_Bcast(void *buffer, int count, MPI_Datatype datatype, 
              int root, MPI_Comm comm);
```

**Effet** : Processus `root` envoie le contenu de `buffer` à tous les autres.

**Exemple** :
```c
int N = 1000;
MPI_Bcast(&N, 1, MPI_INT, 0, MPI_COMM_WORLD);
// Tous les processus ont maintenant N = 1000
```

### 4. Reduce

```c
int MPI_Reduce(void *sendbuf, void *recvbuf, int count, 
               MPI_Datatype datatype, MPI_Op op, 
               int root, MPI_Comm comm);
```

**Effet** : Combine les valeurs de tous les processus avec l'opération `op` et place le résultat dans `recvbuf` du processus `root`.

**Opérations** :
- `MPI_SUM` : somme
- `MPI_PROD` : produit
- `MPI_MAX` : maximum
- `MPI_MIN` : minimum
- `MPI_LAND` : ET logique
- `MPI_LOR` : OU logique

**Exemple** :
```c
double local_sum = 10.0;
double total_sum;
MPI_Reduce(&local_sum, &total_sum, 1, MPI_DOUBLE, 
           MPI_SUM, 0, MPI_COMM_WORLD);
// Processus 0 : total_sum = somme de tous les local_sum
```

### 5. Mesure de temps

```c
double MPI_Wtime(void);
```

**Retourne** : Temps en secondes depuis un point de référence arbitraire.

**Utilisation** :
```c
double start = MPI_Wtime();
// ... calcul ...
double duration = MPI_Wtime() - start;
```

---

## Types de données MPI

| Type C | Type MPI |
|--------|----------|
| `int` | `MPI_INT` |
| `long` | `MPI_LONG` |
| `float` | `MPI_FLOAT` |
| `double` | `MPI_DOUBLE` |
| `char` | `MPI_CHAR` |
| `unsigned int` | `MPI_UNSIGNED` |
| `long long` | `MPI_LONG_LONG` |

---

## Compilation et exécution

### Avec le Makefile fourni

```bash
cd src
make          # Compile séquentiel et parallèle
make run      # Exécute la version parallèle avec 4 processus
```

### Commandes manuelles

```bash
# Compilation
mpicc sequentiel.c -o sequentiel -Wall -Wextra -lm
mpicc parallel.c -o parallel -Wall -Wextra -lm

# Exécution séquentielle
./sequentiel

# Exécution parallèle
mpiexec -n 4 ./parallel 1000000
```

---

## Mesures de performance

### Résultats typiques (N = 10⁶)

| Processus | Temps (s) | Speedup | Efficacité |
|-----------|-----------|---------|------------|
| 1         | 0.050     | 1.0     | 100%       |
| 2         | 0.026     | 1.92    | 96%        |
| 4         | 0.014     | 3.57    | 89%        |
| 8         | 0.008     | 6.25    | 78%        |

**Observations** :
- Bon speedup jusqu'à 4-8 processus
- Overhead de communication devient visible au-delà
- Pour N petit, l'overhead domine (mauvais speedup)
- Pour N grand, meilleur speedup (calcul >> communication)

### Facteurs affectant les performances

1. **Granularité** :
   - Trop peu de travail par processus → overhead domine
   - Beaucoup de travail par processus → bon speedup

2. **Ratio calcul/communication** :
   - Ici : 1 Bcast + 1 Reduce vs N/p calculs
   - Pour N grand → ratio favorable

3. **Latence réseau** :
   - Sur localhost : latence faible (~µs)
   - Sur cluster : latence réseau (~ms) peut dominer

4. **Synchronisation** :
   - `MPI_Reduce` est bloquant : tous les processus attendent
   - Déséquilibre de charge → temps d'attente

---

## Différences OpenMP vs MPI

| Aspect | OpenMP | MPI |
|--------|--------|-----|
| **Modèle mémoire** | Partagée | Distribuée |
| **Communication** | Implicite | Explicite |
| **Parallélisation** | Incrémentale (directives) | Restructuration complète |
| **Scalabilité** | Machine SMP (8-64 cœurs) | Cluster (1000+ cœurs) |
| **Overhead** | Faible (création threads) | Plus élevé (MPI_Init, réseau) |
| **Portabilité** | Limitée (architecture) | Élevée (n'importe quel réseau) |
| **Débogage** | Plus facile | Plus complexe |

**Quand utiliser** :
- **OpenMP** : Machine multi-cœurs, mémoire suffisante, prototypage rapide
- **MPI** : Cluster, problèmes très grands, scalabilité maximale
- **Hybride (OpenMP+MPI)** : Nœuds multi-cœurs dans un cluster

---

## Points clés à retenir

1. **MPI = SPMD** : Même code, données différentes
2. **Communications explicites** : Programmer les échanges de données
3. **Broadcast** : Diffusion one-to-all
4. **Reduce** : Agrégation all-to-one
5. **Granularité** : Clé pour de bonnes performances
6. **MPI_Wtime()** : Mesure de temps distribuée

---

## Fichiers du TP

```
tp4/
├── README.md           # Ce fichier
└── src/
    ├── Makefile        # Compilation automatique
    ├── sequentiel.c    # Version séquentielle
    └── parallel.c      # Version parallèle MPI
```

---

## Ressources

- Spécification MPI: https://www.mpi-forum.org/docs/
- Tutoriel MPI: https://hpc-tutorials.llnl.gov/mpi/
- MPI for Python: https://mpi4py.readthedocs.io/ (pour ceux qui préfèrent Python)
