---
title: "TP5 - MPI: Produit matrice-vecteur"
sidebar_position: 5
---

# TP5 - MPI: Produit matrice-vecteur

Calcul distribué du produit matrice-vecteur avec deux stratégies de distribution.

## Objectifs pédagogiques

- Distribuer des données volumineuses (matrices)
- Utiliser les communications collectives avancées (`Scatter`, `Gather`)
- Comparer différentes stratégies de distribution
- Analyser l'équilibrage de charge

## Problème : Produit matrice-vecteur

### Description mathématique

Calculer **R = Mat × V** où :
- `Mat` : matrice N×N
- `V` : vecteur N
- `R` : vecteur résultat N

**Formule** :
```
R[i] = Σ Mat[i][j] × V[j]  pour j=0..N-1
```

Chaque composante de R est le produit scalaire de la ligne i de Mat par V.

### Distribution initiale

- **Processus 0** : possède Mat et V
- **Objectif** : calculer R de manière distribuée
- **Résultat final** : R sur le processus 0

---

## Implémentation 1 : Distribution par blocs de lignes

### Stratégie

1. **Distribution de la matrice** :
   - Découper Mat en P blocs de N/P lignes
   - Chaque processus reçoit N/P lignes complètes

2. **Réplication du vecteur** :
   - V est envoyé à tous les processus (`MPI_Bcast`)
   - Tous les processus ont une copie complète de V

3. **Calcul local** :
   - Chaque processus calcule N/P composantes de R
   - Processus k calcule R[k×N/P] à R[(k+1)×N/P - 1]

4. **Collecte des résultats** :
   - Chaque processus envoie son fragment de R au processus 0 (`MPI_Gather`)

### Schéma de distribution

```
Matrice (N×N)          Vecteur V (N)       Résultat R (N)
+---+---+---+---+      +---+               +---+
| 0 | 1 | 2 | 3 |      | V |   broadcast   | R0| ← Proc 0
+---+---+---+---+      +---+   ========>   +---+
| 4 | 5 | 6 | 7 |      | V |               | R1| ← Proc 1
+---+---+---+---+      +---+               +---+
| 8 | 9 | 10| 11|      | V |               | R2| ← Proc 2
+---+---+---+---+      +---+               +---+
| 12| 13| 14| 15|      | V |               | R3| ← Proc 3
+---+---+---+---+      +---+               +---+
                                    gather
                                    ========>
                                           Proc 0
```

Chaque processus calcule N/P lignes de la matrice.

### Code commenté

```c
#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>

#define N 10000

int main(int argc, char *argv[]) {
    int proc, nbproc;
    int n = N;
    double t0, t1;
    double *matriceAMult = NULL;
    double *vectAMult = NULL;
    double *matFragment = NULL;
    double *rezFragment = NULL;
    double *rez = NULL;
    
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &proc);
    MPI_Comm_size(MPI_COMM_WORLD, &nbproc);
    
    // Lecture du paramètre N (optionnel)
    if (argc > 1) {
        n = strtol(argv[1], NULL, 10);
    }
    
    // Vérification : N doit être divisible par nbproc
    assert(n % nbproc == 0);
    
    // Allocation mémoire
    vectAMult = (double *) malloc(n * sizeof(double));
    matFragment = (double *) malloc(n * n / nbproc * sizeof(double));
    rezFragment = (double *) malloc(n / nbproc * sizeof(double));
    rez = (double *) malloc(n * sizeof(double));
    
    /*** Initialisation (processus 0 uniquement) ***/
    if (proc == 0) {
        matriceAMult = (double *) malloc(n * n * sizeof(double));
        
        // Remplissage de la matrice et du vecteur (valeurs aléatoires)
        for (int l = 0; l < n; l++) {
            for (int k = 0; k < n; k++) {
                matriceAMult[k + l*n] = (double)(rand() % 1000);
            }
        }
        for (int i = 0; i < n; i++) {
            vectAMult[i] = (double)(rand() % 1000);
        }
        
        t0 = MPI_Wtime();
    }
    
    /*** Distribution ***/
    // Broadcast du vecteur à tous les processus
    MPI_Bcast(vectAMult, n, MPI_DOUBLE, 0, MPI_COMM_WORLD);
    
    // Scatter de la matrice (chaque processus reçoit N/P lignes)
    MPI_Scatter(matriceAMult, n*(n/nbproc), MPI_DOUBLE,
                matFragment, n*(n/nbproc), MPI_DOUBLE,
                0, MPI_COMM_WORLD);
    
    /*** Calcul local ***/
    for (int k = 0; k < n/nbproc; k++) {
        rezFragment[k] = 0;
        for (int l = 0; l < n; l++) {
            rezFragment[k] += matFragment[k*n + l] * vectAMult[l];
        }
    }
    
    /*** Collecte des résultats ***/
    MPI_Gather(rezFragment, n/nbproc, MPI_DOUBLE,
               rez, n/nbproc, MPI_DOUBLE,
               0, MPI_COMM_WORLD);
    
    if (proc == 0) {
        t1 = MPI_Wtime();
        fprintf(stderr, "time %.6lf (s)\n", t1-t0);
    }
    
    /*** Libération mémoire ***/
    MPI_Finalize();
    if (proc == 0) {
        free(matriceAMult);
    }
    free(vectAMult);
    free(matFragment);
    free(rezFragment);
    free(rez);
    
    return 0;
}
```

### Analyse des communications

**MPI_Bcast** :
- Taille : N doubles
- Temps : O(log P × α + N × β)
  - α : latence
  - β : temps par octet

**MPI_Scatter** :
- Taille totale : N² doubles
- Chaque processus reçoit : N²/P doubles
- Temps : O(P × α + N²/P × β)

**MPI_Gather** :
- Taille : N/P doubles par processus
- Temps : O(P × α + N × β)

**Total communication** : O(N² + N)

### Analyse du calcul

**Travail par processus** : N/P lignes × N colonnes = N²/P multiplications-additions

**Temps calcul** : O(N²/P)

**Speedup théorique** :
```
T_seq = O(N²)
T_par = O(N²/P + N² + N)
     ≈ O(N²/P) pour N grand et P petit
Speedup ≈ P
```

---

## Implémentation 2 : Maître-esclave dynamique

### Stratégie

1. **Processus 0 (maître)** :
   - Envoie les lignes de la matrice une par une aux esclaves
   - Attend les résultats
   - Distribue dynamiquement le travail

2. **Processus 1..P-1 (esclaves)** :
   - Reçoivent une ligne de la matrice
   - Calculent une composante de R
   - Renvoient le résultat au maître
   - Demandent une nouvelle ligne

3. **Vecteur V** :
   - Répliqué sur tous les processus (comme implémentation 1)

### Avantages et inconvénients

**Avantages** :
- Équilibrage de charge automatique
- Gestion des hétérogénéités (processeurs différents)
- Tolérance aux perturbations (charge externe)

**Inconvénients** :
- Beaucoup plus de communications (P×N messages au lieu de 3)
- Latence cumulée importante
- Overhead du maître (devient le goulot d'étranglement)

### Pseudo-code

```c
// Processus 0 (maître)
MPI_Bcast(V, N, MPI_DOUBLE, 0, MPI_COMM_WORLD);

for (ligne = 0; ligne < N; ligne++) {
    // Attendre une demande d'un esclave
    MPI_Recv(&esclave_id, 1, MPI_INT, MPI_ANY_SOURCE, TAG_REQUEST, ...);
    
    // Envoyer la ligne à cet esclave
    MPI_Send(&Mat[ligne*N], N, MPI_DOUBLE, esclave_id, TAG_DATA, ...);
}

// Recevoir tous les résultats
for (ligne = 0; ligne < N; ligne++) {
    MPI_Recv(&R[ligne], 1, MPI_DOUBLE, MPI_ANY_SOURCE, TAG_RESULT, ...);
}

// Signaler la fin
for (proc = 1; proc < P; proc++) {
    MPI_Send(NULL, 0, MPI_DOUBLE, proc, TAG_END, ...);
}

// Processus 1..P-1 (esclaves)
MPI_Bcast(V, N, MPI_DOUBLE, 0, MPI_COMM_WORLD);

while (true) {
    // Demander du travail
    MPI_Send(&rank, 1, MPI_INT, 0, TAG_REQUEST, ...);
    
    // Recevoir une ligne ou signal de fin
    MPI_Recv(ligne, N, MPI_DOUBLE, 0, MPI_ANY_TAG, ..., &status);
    
    if (status.tag == TAG_END) break;
    
    // Calculer le produit scalaire
    double result = 0;
    for (int j = 0; j < N; j++) {
        result += ligne[j] * V[j];
    }
    
    // Renvoyer le résultat
    MPI_Send(&result, 1, MPI_DOUBLE, 0, TAG_RESULT, ...);
}
```

### Analyse des performances

**Nombre de communications** :
- Implémentation 1 : 3 communications collectives
- Implémentation 2 : ~2N communications point-à-point

**Latence totale** :
- Implémentation 1 : O(log P × α)
- Implémentation 2 : O(N × α)

**Pour N = 10000, α = 1µs** :
- Implémentation 1 : ~3µs
- Implémentation 2 : ~20ms (10000× plus lent)

**Résultat attendu** : Implémentation 2 beaucoup plus lente pour ce problème régulier.

---

## Communications collectives MPI

### 1. MPI_Scatter

```c
int MPI_Scatter(void *sendbuf, int sendcount, MPI_Datatype sendtype,
                void *recvbuf, int recvcount, MPI_Datatype recvtype,
                int root, MPI_Comm comm);
```

**Effet** : Distribue des données de `root` à tous les processus.

**Schéma** :
```
Processus 0 :  [A0 A1 A2 A3]
                  |  |  |  |
MPI_Scatter       V  V  V  V
                  |  |  |  |
Processus 0-3 : [A0][A1][A2][A3]
```

### 2. MPI_Gather

```c
int MPI_Gather(void *sendbuf, int sendcount, MPI_Datatype sendtype,
               void *recvbuf, int recvcount, MPI_Datatype recvtype,
               int root, MPI_Comm comm);
```

**Effet** : Collecte des données de tous les processus vers `root`.

**Schéma** :
```
Processus 0-3 : [B0][B1][B2][B3]
                  |  |  |  |
MPI_Gather        V  V  V  V
                  |  |  |  |
Processus 0 :  [B0 B1 B2 B3]
```

### 3. MPI_Allgather

```c
int MPI_Allgather(void *sendbuf, int sendcount, MPI_Datatype sendtype,
                  void *recvbuf, int recvcount, MPI_Datatype recvtype,
                  MPI_Comm comm);
```

**Effet** : Comme `Gather`, mais tous les processus reçoivent le résultat.

### 4. MPI_Reduce vs MPI_Allreduce

**MPI_Reduce** : Résultat sur un seul processus (root)
**MPI_Allreduce** : Résultat sur tous les processus

```c
int MPI_Allreduce(void *sendbuf, void *recvbuf, int count,
                  MPI_Datatype datatype, MPI_Op op,
                  MPI_Comm comm);
```

---

## Compilation et exécution

### Avec le Makefile

```bash
cd src
make          # Compile main (implémentation 1)
make run      # Exécute avec 4 processus, N=10000
```

### Commandes manuelles

```bash
mpicc main.c -o main -Wall -Wextra -lm
mpiexec -n 4 ./main 10000
```

---

## Mesures de performance

### Résultats typiques (N = 10000)

#### Implémentation 1 (Scatter/Gather)

| Processus | Temps (s) | Speedup | Efficacité |
|-----------|-----------|---------|------------|
| 1         | 0.80      | 1.0     | 100%       |
| 2         | 0.42      | 1.90    | 95%        |
| 4         | 0.22      | 3.64    | 91%        |
| 8         | 0.13      | 6.15    | 77%        |

**Observations** :
- Bon speedup jusqu'à 4 processus
- Communication (N²) devient non-négligeable pour P > 8
- Efficacité décroît avec P

#### Implémentation 2 (Maître-esclave)

**Temps attendu** : 2-3× plus lent que implémentation 1 (latence des communications)

**Quand utiliser** :
- Problèmes irréguliers (calculs de durée variable)
- Hétérogénéité des processeurs
- Tolérance aux pannes

---

## Comparaison des stratégies

| Aspect | Implémentation 1 | Implémentation 2 |
|--------|------------------|------------------|
| **Communications** | 3 collectives | ~2N point-à-point |
| **Latence** | O(log P) | O(N) |
| **Équilibrage** | Statique | Dynamique |
| **Complexité code** | Simple | Moyenne |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Flexibilité** | Faible | Élevée |
| **Scalabilité** | Bonne (P < N) | Mauvaise |

**Règle générale** :
- Problème régulier → Distribution statique (impl. 1)
- Problème irrégulier → Distribution dynamique (impl. 2)

---

## Extensions possibles

### 1. Distribution 2D (damier)

Découper la matrice en blocs 2D :
- Moins de données à communiquer par processus
- Meilleure utilisation de la mémoire cache
- Plus complexe à implémenter

### 2. Matrices creuses

Pour Mat très creuse (beaucoup de zéros) :
- Stocker uniquement les éléments non-nuls (format CSR, COO)
- Distribuer les lignes non-vides équitablement
- Réduction du volume de communication

### 3. Algorithmes de Cannon et Fox

Algorithmes optimisés pour produit matrice-matrice :
- Réduction du volume de communication : O(N²/√P) au lieu de O(N²)
- Distribution 2D sur grille de processus

---

## Points clés à retenir

1. **Scatter/Gather** : Distribution et collecte efficaces
2. **Broadcast** : Réplication de données partagées
3. **Distribution statique** : Performante pour problèmes réguliers
4. **Maître-esclave** : Flexible mais coûteux en communications
5. **Granularité** : N²/P calculs vs O(N²) communication
6. **Scalabilité limitée** : Communication devient dominante pour P grand

---

## Fichiers du TP

```
tp5/
├── README.md           # Ce fichier
└── src/
    ├── Makefile        # Compilation
    └── main.c          # Implémentation 1 (Scatter/Gather)
```

**Note** : Seule l'implémentation 1 est fournie. L'implémentation 2 est laissée comme exercice.

---

## Ressources

- MPI-3.1 Standard: https://www.mpi-forum.org/docs/mpi-3.1/mpi31-report.pdf
- Tutoriel MPI collectives: https://mpitutorial.com/tutorials/mpi-scatter-gather-and-allgather/
- Algorithmes parallèles matriciels: "Parallel Scientific Computing in C++ and MPI" (Karniadakis)
