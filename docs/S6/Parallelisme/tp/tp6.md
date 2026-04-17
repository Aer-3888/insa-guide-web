---
title: "TP6 - MPI: Propagation de chaleur distribuée (SPMD + Recouvrement)"
sidebar_position: 6
---

# TP6 - MPI: Propagation de chaleur distribuée (SPMD + Recouvrement)

Application complète de calcul parallèle distribué avec communications point-à-point et recouvrement de données (ghost zones).

## Objectifs pédagogiques

- Implémenter un algorithme SPMD complet
- Gérer les communications entre voisins (halo exchange)
- Utiliser les communications non-bloquantes
- Converger de manière distribuée avec `MPI_Allreduce`
- Comprendre le pattern de recouvrement (ghost zones / overlap)

## Problème : Propagation de chaleur distribuée

Même problème que TP2 (OpenMP), mais en mémoire distribuée (MPI).

### Équation de la chaleur

```
T[t+1][i][j] = (T[t][i][j+1] + T[t][i][j-1] + 
                T[t][i+1][j] + T[t][i-1][j] + 
                T[t][i][j]) / 5
```

**Critère de convergence** :
```
Δ = Σ |T[t+1][i][j] - T[t][i][j]| < seuil
```

### Différences avec la version OpenMP

| Aspect | OpenMP (TP2) | MPI (TP6) |
|--------|--------------|-----------|
| **Mémoire** | Partagée (T accessible partout) | Distribuée (chaque proc a un fragment) |
| **Synchronisation** | Implicite (barrière) | Explicite (MPI_Send/Recv) |
| **Convergence** | Variable locale | MPI_Allreduce |
| **Complexité** | Simple | Moyenne (gestion des bords) |

---

## Architecture SPMD

### SPMD : Single Program Multiple Data

Tous les processus exécutent le même programme, mais travaillent sur des données différentes.

**Particularité ici** : Processus "initiateur" (rang 0) en plus des processus de calcul.

### Rôles des processus

1. **Processus 0 (initiateur)** :
   - Crée la matrice complète
   - Distribue les fragments aux processus SPMD
   - Récupère périodiquement l'état (toutes les K itérations)
   - Décide de l'arrêt (quand Δ < seuil)

2. **Processus 1..P (SPMD)** :
   - Reçoivent un fragment de la matrice
   - Calculent itérativement
   - Échangent les lignes de bord avec voisins
   - Participent à la réduction globale de Δ

**Note** : Dans le code fourni, le processus 0 joue double rôle (initiateur + calcul).

---

## Recouvrement (Ghost Zones / Halo)

### Problème

Chaque processus calcule une tranche de N/P lignes. Mais pour calculer la ligne i, on a besoin des lignes i-1 et i+1.

**Problème** : Les lignes des bords nécessitent des données du processus voisin.

### Solution : Ghost zones

Chaque processus stocke :
- Ses N/P lignes utiles
- 2 lignes fantômes (ghost) : une avant, une après

**Schéma** :
```
Processus 0        Processus 1        Processus 2
+----------+       +----------+       +----------+
| Bord ext |       | Ghost 0  | ←---- | Ghost 1  | ←---- ...
+----------+       +----------+       +----------+
| Ligne 0  |       | Ligne 4  |       | Ligne 8  |
| Ligne 1  | ---→  | Ligne 5  | ---→  | Ligne 9  |
| Ligne 2  |       | Ligne 6  |       | Ligne 10 |
| Ligne 3  |       | Ligne 7  |       | Ligne 11 |
+----------+       +----------+       +----------+
| Ghost 1  | ---→  | Ghost 2  | ---→  | Bord ext |
+----------+       +----------+       +----------+
```

**Taille du fragment** : (N/P + 2) lignes × (M+2) colonnes

### Échange de halos (halo exchange)

À chaque itération :
1. Processus k envoie sa première ligne utile au processus k-1
2. Processus k envoie sa dernière ligne utile au processus k+1
3. Processus k reçoit la ligne fantôme du processus k-1
4. Processus k reçoit la ligne fantôme du processus k+1

**Code** :
```c
// Envoi de ma première ligne au processus précédent
if (rank > 0) {
    MPI_Isend(fragment + M+2, M+2, MPI_DOUBLE, 
              rank-1, 0, MPI_COMM_WORLD, &send_request);
}

// Envoi de ma dernière ligne au processus suivant
if (rank+1 < nbP) {
    MPI_Isend(fragment + tailleFragment - 2*(M+2), M+2, MPI_DOUBLE, 
              rank+1, 0, MPI_COMM_WORLD, &send_request);
}

// Réception de la ligne fantôme du processus précédent
if (rank > 0) {
    MPI_Recv(fragment, M+2, MPI_DOUBLE, 
             rank-1, 0, MPI_COMM_WORLD, &status);
}

// Réception de la ligne fantôme du processus suivant
if (rank+1 < nbP) {
    MPI_Recv(fragment + tailleFragment - M - 2, M+2, MPI_DOUBLE, 
             rank+1, 0, MPI_COMM_WORLD, &status);
}
```

**Important** : `MPI_Isend` (non-bloquant) pour éviter les deadlocks.

---

## Code source commenté

### Structure du programme

```c
#include <mpi.h>
#include <assert.h>

#define N 20           // Hauteur de la matrice
#define M 20           // Largeur de la matrice
#define MAX 200        // Température des bords
#define SEUIL 10       // Seuil de convergence
#define K 10           // Itérations entre affichages

int main(int argc, char *argv[]) {
    int rank, nbP;
    double *fragment, *fragment1;
    double delta, deltaTotal;
    int k_total = 0;
    MPI_Status status;
    MPI_Request send_request;
    
    MPI_Init(&argc, &argv);
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &nbP);
    
    // Vérification : N doit être divisible par nbP
    assert(N % nbP == 0);
    
    int nbLignesUtiles = N / nbP;
    int nbLines = nbLignesUtiles + 2;  // + 2 ghost zones
    int tailleFragment = nbLines * (M+2);
    int debutFragment = nbLignesUtiles * (M+2);
    
    // ... (suite ci-dessous)
}
```

### Initialisation (processus 0)

```c
if (rank == 0) {
    // Allouer la matrice complète
    T = calloc((N+2)*(M+2), sizeof(double));
    T1 = calloc((N+2)*(M+2), sizeof(double));
    
    // Initialiser les bords à MAX
    for (int j = 0; j < M+2; j++) {
        for (int i = 0; i < N+2; i++) {
            if (i==0 || j==0 || i==N+1 || j==M+1) {
                T[i*(N+2)+j] = MAX;
                T1[i*(N+2)+j] = MAX;
            }
        }
    }
    
    // Distribuer les fragments aux autres processus
    for (int i = 1; i < nbP; i++) {
        MPI_Send(T + (debutFragment*i), tailleFragment, MPI_DOUBLE, 
                 i, 0, MPI_COMM_WORLD);
        MPI_Send(T1 + (debutFragment*i), tailleFragment, MPI_DOUBLE, 
                 i, 0, MPI_COMM_WORLD);
    }
    
    // Processus 0 : fragment = matrice complète
    fragment = T;
    fragment1 = T1;
} else {
    // Autres processus : allouer et recevoir le fragment
    fragment = calloc(tailleFragment, sizeof(double));
    fragment1 = calloc(tailleFragment, sizeof(double));
    
    MPI_Recv(fragment, tailleFragment, MPI_DOUBLE, 
             0, 0, MPI_COMM_WORLD, &status);
    MPI_Recv(fragment1, tailleFragment, MPI_DOUBLE, 
             0, 0, MPI_COMM_WORLD, &status);
}
```

### Boucle de calcul principale

```c
do {
    for (int k = 0; k < K; k++) {
        // Calcul local (sans les lignes fantômes)
        delta = eqChaleurIter(fragment + M+3,   // Début de la zone utile
                               fragment1 + M+3, 
                               M, nbLignesUtiles, M+2);
        
        // Swap des fragments
        temp = fragment;
        fragment = fragment1;
        fragment1 = temp;
        
        /*** Échange des halos (ghost zones) ***/
        
        // Envoi non-bloquant de ma première ligne au processus précédent
        if (rank > 0) {
            MPI_Isend(fragment + M+2, M+2, MPI_DOUBLE, 
                      rank-1, 0, MPI_COMM_WORLD, &send_request);
        }
        
        // Envoi non-bloquant de ma dernière ligne au processus suivant
        if (rank+1 < nbP) {
            MPI_Isend(fragment + tailleFragment - 2*(M+2), M+2, MPI_DOUBLE, 
                      rank+1, 0, MPI_COMM_WORLD, &send_request);
        }
        
        // Réception bloquante de la ligne fantôme du processus précédent
        if (rank > 0) {
            MPI_Recv(fragment, M+2, MPI_DOUBLE, 
                     rank-1, 0, MPI_COMM_WORLD, &status);
        }
        
        // Réception bloquante de la ligne fantôme du processus suivant
        if (rank+1 < nbP) {
            MPI_Recv(fragment + tailleFragment - M - 2, M+2, MPI_DOUBLE, 
                     rank+1, 0, MPI_COMM_WORLD, &status);
        }
    }
    
    k_total += K;
    
    // Réduction globale de delta
    MPI_Allreduce(&delta, &deltaTotal, 1, MPI_DOUBLE, 
                  MPI_SUM, MPI_COMM_WORLD);
    
    if (rank == 0) {
        printf("Iteration %d : deltaTotal = %f\n", k_total, deltaTotal);
    }
    
} while (deltaTotal >= SEUIL);
```

### Collecte finale (processus 0)

```c
if (rank == 0) {
    // Recevoir les fragments de tous les autres processus
    for (int i = 1; i < nbP; i++) {
        MPI_Recv(T + (debutFragment*i), tailleFragment, MPI_DOUBLE, 
                 i, 0, MPI_COMM_WORLD, &status);
    }
    
    // Afficher la matrice finale
    printf("Matrice finale : \n");
    afficheTab(stdout, T, N+2, M+2);
}
else {
    // Envoyer mon fragment au processus 0
    MPI_Send(fragment, tailleFragment, MPI_DOUBLE, 
             0, 0, MPI_COMM_WORLD);
}

MPI_Finalize();
```

---

## Fonctions MPI utilisées

### 1. MPI_Isend (envoi non-bloquant)

```c
int MPI_Isend(void *buf, int count, MPI_Datatype datatype,
              int dest, int tag, MPI_Comm comm,
              MPI_Request *request);
```

**Différence avec MPI_Send** :
- Retourne immédiatement (non-bloquant)
- Permet de faire du calcul pendant la communication
- Évite les deadlocks dans certains patterns

**Utilisation** :
- Envoyer plusieurs messages sans attendre
- Overlapping communication/computation

### 2. MPI_Allreduce

```c
int MPI_Allreduce(void *sendbuf, void *recvbuf, int count,
                  MPI_Datatype datatype, MPI_Op op,
                  MPI_Comm comm);
```

**Différence avec MPI_Reduce** :
- Tous les processus reçoivent le résultat
- Équivalent à MPI_Reduce + MPI_Bcast

**Utilisation** :
- Calcul distribué de convergence (tous doivent savoir si continuer)
- Statistiques globales (min, max, somme)

### 3. MPI_Send / MPI_Recv (point-à-point bloquant)

```c
int MPI_Send(void *buf, int count, MPI_Datatype datatype,
             int dest, int tag, MPI_Comm comm);

int MPI_Recv(void *buf, int count, MPI_Datatype datatype,
             int source, int tag, MPI_Comm comm,
             MPI_Status *status);
```

**Bloquant** :
- `MPI_Send` : retourne quand le buffer peut être réutilisé
- `MPI_Recv` : retourne quand les données sont reçues

---

## Patterns de communication

### 1. Halo Exchange (pattern dominant ici)

Chaque processus échange des données avec ses voisins immédiats.

**Topologie** : Chaîne 1D
```
P0 ←→ P1 ←→ P2 ←→ P3
```

**Généralisation** : Grilles 2D, 3D (stencils multi-dimensionnels)

### 2. All-to-one (Gather)

Tous les processus envoient au processus 0 (collecte finale).

### 3. All-to-all (Allreduce)

Tous les processus participent à un calcul collectif et reçoivent le résultat.

---

## Éviter les deadlocks

### Problème du deadlock

Si tous les processus font :
```c
MPI_Send(..., rank+1, ...);  // Envoyer au suivant
MPI_Recv(..., rank-1, ...);  // Recevoir du précédent
```

**Deadlock** : Tous attendent que leur send se termine, mais personne ne fait de recv.

### Solutions

1. **Ordre alterné** :
   ```c
   if (rank % 2 == 0) {
       MPI_Send(...);
       MPI_Recv(...);
   } else {
       MPI_Recv(...);
       MPI_Send(...);
   }
   ```

2. **Communications non-bloquantes** (utilisée ici) :
   ```c
   MPI_Isend(..., &request);  // Non-bloquant
   MPI_Recv(...);             // Bloquant, mais le Isend est déjà lancé
   ```

3. **MPI_Sendrecv** (atomique) :
   ```c
   MPI_Sendrecv(sendbuf, ..., dest, sendtag,
                recvbuf, ..., source, recvtag, ...);
   ```

---

## Compilation et exécution

### Avec le Makefile

```bash
cd src
make            # Compile séquentiel et parallèle
```

### Commandes manuelles

```bash
# Version séquentielle
gcc sequentiel.c -o sequentiel -Wall -Wextra -lm

# Version parallèle
mpicc parallel.c -o parallel -Wall -Wextra -lm

# Exécution séquentielle
./sequentiel

# Exécution parallèle (4 processus)
mpiexec -n 4 ./parallel
```

**Note** : N doit être divisible par le nombre de processus (assertion dans le code).

---

## Mesures de performance

### Résultats typiques (N=M=20)

| Processus | Temps (s) | Speedup | Efficacité | Itérations |
|-----------|-----------|---------|------------|------------|
| 1         | 0.050     | 1.0     | 100%       | 150        |
| 2         | 0.028     | 1.79    | 89%        | 150        |
| 4         | 0.018     | 2.78    | 69%        | 150        |
| 8         | 0.015     | 3.33    | 42%        | 150        |

**Observations** :
- Speedup sous-linéaire (communications dominent)
- Pour N petit (20), overhead élevé
- Pour N grand (1000+), meilleur speedup

### Facteurs limitants

1. **Volume de communication** :
   - Échange de 2×M valeurs par itération et par processus
   - Pour K=10, 20×M valeurs échangées tous les 10 calculs

2. **Latence** :
   - 4 messages par itération (2 envois + 2 réceptions)
   - Latence cumulée : 4×K×α par bloc de K itérations

3. **Synchronisation globale** :
   - `MPI_Allreduce` toutes les K itérations
   - Tous les processus doivent attendre le plus lent

### Optimisations possibles

1. **Augmenter K** :
   - Moins de réductions globales
   - Mais convergence détectée moins vite

2. **Communications asynchrones** :
   - Lancer les Isend/Irecv
   - Calculer les lignes internes pendant la communication
   - Attendre les communications avant de calculer les bords

3. **Distribution 2D** :
   - Découper la matrice en blocs 2D (damier)
   - Moins de voisins à communiquer (4 au lieu de 2)
   - Meilleure localité

---

## Comparaison OpenMP vs MPI

| Aspect | OpenMP (TP2) | MPI (TP6) |
|--------|--------------|-----------|
| **Lignes de code** | ~70 | ~230 |
| **Complexité** | Faible | Moyenne-Élevée |
| **Performance (N=100)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Scalabilité (P>8)** | Limitée (SMP) | Excellente (cluster) |
| **Débogage** | Facile | Difficile |
| **Portabilité** | Moyenne | Élevée |

**Quand utiliser** :
- **OpenMP** : Petits problèmes, machine SMP, prototypage
- **MPI** : Grands problèmes, cluster, production
- **Hybride** : Meilleur des deux mondes (MPI entre nœuds, OpenMP sur chaque nœud)

---

## Extensions possibles

### 1. Conditions aux limites périodiques

Au lieu de bords fixes, connecter les extrémités :
- Processus 0 échange avec processus P-1
- Simule une topologie torique

### 2. Distribution 2D

Découper la matrice en blocs 2D :
- Topologie cartésienne MPI (`MPI_Cart_create`)
- 4 voisins par processus (N, S, E, O)
- Meilleure scalabilité

### 3. Convergence asynchrone

Permettre aux processus de continuer sans attendre les autres :
- Convergence locale (chaque processus décide)
- Communications asynchrones permanentes
- Plus complexe, mais meilleure performance

---

## Points clés à retenir

1. **SPMD** : Même programme, données différentes
2. **Ghost zones** : Duplication des bords pour calculs locaux
3. **Halo exchange** : Pattern fondamental pour stencils distribués
4. **MPI_Isend** : Éviter les deadlocks, permettre l'overlapping
5. **MPI_Allreduce** : Convergence distribuée
6. **Scalabilité limitée** : Communication O(M) vs calcul O(N×M/P)

---

## Fichiers du TP

```
tp6/
├── README.md           # Ce fichier
└── src/
    ├── Makefile        # Compilation
    ├── sequentiel.c    # Version séquentielle (référence)
    └── parallel.c      # Version parallèle MPI (SPMD + halo)
```

---

## Ressources

- MPI Topologies: https://www.mpi-forum.org/docs/ (section 7: Process Topologies)
- Halo exchange patterns: "Using MPI" (Gropp, Lusk, Skjellum)
- Stencil computations: "Parallel Programming for Science and Engineering" (Eijkhout)
- Non-blocking communications: https://mpitutorial.com/tutorials/mpi-non-blocking/
