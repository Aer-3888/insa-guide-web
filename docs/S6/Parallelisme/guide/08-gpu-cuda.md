---
title: "Chapitre 08 -- GPU et CUDA"
sidebar_position: 8
---

# Chapitre 08 -- GPU et CUDA

## 1. CPU vs GPU

| Aspect | CPU | GPU |
|--------|-----|-----|
| Coeurs | 4-16 (puissants, complexes) | 1000-10000 (simples) |
| Tache ideale | Complexe, variee | Simple, repetee des milliers de fois |
| Latence | Tres faible | Elevee |
| Debit | Faible | Enorme |
| Memoire | 8-64 Go RAM | 4-24 Go VRAM |

---

## 2. Architecture GPU NVIDIA

### Hierarchie materielle

- **GPU** : la puce entiere
- **SM** (Streaming Multiprocessor) : 10-80 par GPU, unite de calcul autonome
- **CUDA cores** : 32-128 par SM, executent les operations arithmetiques
- **Warp** : 32 threads executes en meme temps (SIMT)

### Hierarchie memoire (du plus rapide au plus lent)

| Memoire | Portee | Vitesse | Taille |
|---------|--------|---------|--------|
| Registres | Par thread | Ultra-rapide | Quelques Ko |
| Memoire partagee (`__shared__`) | Par bloc | Tres rapide (~5 cycles) | 48-96 Ko par SM |
| Memoire globale | Pour tous | Lente (400-600 cycles) | 4-24 Go |
| Memoire CPU (RAM) | CPU seulement | Tres lente (PCIe) | 8-64 Go |

**Regle :** maximiser l'utilisation des registres et de la memoire partagee, minimiser les acces a la memoire globale.

---

## 3. Modele de programmation CUDA

Le programme s'execute en deux parties :
1. **Host (CPU)** : gere la memoire, lance les calculs, recupere les resultats
2. **Device (GPU)** : execute les calculs en parallele (kernel)

### Flux d'execution standard

```
1. cudaMalloc       -- allouer sur le GPU
2. cudaMemcpy H2D   -- copier CPU -> GPU
3. kernel<<<...>>>   -- lancer le calcul
4. cudaDeviceSync    -- attendre la fin
5. cudaMemcpy D2H   -- copier GPU -> CPU
6. cudaFree          -- liberer
```

---

## 4. Kernels et indexation

### Qu'est-ce qu'un kernel ?

Un kernel est une fonction executee par chaque thread du GPU. On ecrit le code pour **un seul thread**, CUDA le lance des milliers de fois.

```c
__global__ void additionner(float *a, float *b, float *c, int n)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        c[i] = a[i] + b[i];
    }
}
```

### Qualificateurs de fonction

| Qualificateur | Appele depuis | Execute sur |
|---------------|---------------|-------------|
| `__global__` | CPU (host) | GPU (device) |
| `__device__` | GPU | GPU |
| `__host__` | CPU | CPU |

---

## 5. Grille, blocs et threads

### Hierarchie d'execution

```
Grille (grid) : ensemble de tous les blocs
  Bloc 0 : threads 0..255
  Bloc 1 : threads 0..255
  Bloc 2 : threads 0..255
  ...
```

### Variables built-in

| Variable | Signification |
|----------|---------------|
| `threadIdx.x` | Index du thread dans son bloc (0 a blockDim.x-1) |
| `blockIdx.x` | Index du bloc dans la grille (0 a gridDim.x-1) |
| `blockDim.x` | Nombre de threads par bloc |
| `gridDim.x` | Nombre de blocs |

### LA formule a connaitre : index global

```c
int i = blockIdx.x * blockDim.x + threadIdx.x;
```

### Calcul du nombre de blocs

```c
int nb_blocs = (N + taille_bloc - 1) / taille_bloc;  /* ceil(N/B) */
```

### Syntaxe de lancement

```c
kernel<<<nb_blocs, taille_bloc>>>(args);
```

### Exemple avec 3 blocs de 4 threads

```
Bloc 0: threadIdx = 0,1,2,3  -> i = 0,1,2,3
Bloc 1: threadIdx = 0,1,2,3  -> i = 4,5,6,7
Bloc 2: threadIdx = 0,1,2,3  -> i = 8,9,10,11
```

### Dimensions 2D

```c
dim3 taille_bloc(16, 16);   /* 16x16 = 256 threads */
dim3 nb_blocs((largeur+15)/16, (hauteur+15)/16);
kernel<<<nb_blocs, taille_bloc>>>(args);

/* Dans le kernel */
int col = blockIdx.x * blockDim.x + threadIdx.x;
int lig = blockIdx.y * blockDim.y + threadIdx.y;
if (col < largeur && lig < hauteur) { /* traiter (lig,col) */ }
```

---

## 6. Gestion de la memoire

Le CPU et le GPU ont des memoires **separees**. Il faut copier explicitement.

```c
/* Allouer sur le GPU */
float *d_a;
cudaMalloc((void **)&d_a, N * sizeof(float));

/* Copier CPU -> GPU */
cudaMemcpy(d_a, h_a, N * sizeof(float), cudaMemcpyHostToDevice);

/* Copier GPU -> CPU */
cudaMemcpy(h_a, d_a, N * sizeof(float), cudaMemcpyDeviceToHost);

/* Liberer */
cudaFree(d_a);
```

**Convention :** prefixer `h_` (host/CPU) et `d_` (device/GPU).

---

## 7. Memoire partagee (`__shared__`)

Memoire rapide (~5 cycles) accessible par tous les threads d'un **meme bloc**.

```c
__global__ void kernel(float *donnees, int n)
{
    __shared__ float cache[256];
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    int tid = threadIdx.x;

    if (i < n) cache[tid] = donnees[i];
    __syncthreads();   /* OBLIGATOIRE avant de lire */

    /* utiliser cache[...] */
}
```

**`__syncthreads()`** : barriere intra-bloc. Tous les threads du bloc attendent. Indispensable avant de lire des donnees ecrites par d'autres threads du bloc.

---

## 8. Reduction sur GPU

```c
__global__ void reduction_somme(float *entree, float *sortie, int n)
{
    __shared__ float cache[256];
    int tid = threadIdx.x;
    int i = blockIdx.x * blockDim.x + threadIdx.x;

    cache[tid] = (i < n) ? entree[i] : 0.0f;
    __syncthreads();

    /* Reduction par arbre */
    for (int stride = blockDim.x / 2; stride > 0; stride /= 2) {
        if (tid < stride)
            cache[tid] += cache[tid + stride];
        __syncthreads();
    }

    if (tid == 0)
        sortie[blockIdx.x] = cache[0];
}
```

Donne un resultat partiel par bloc. Relancer le kernel sur les sommes partielles ou finir sur CPU.

---

## 9. Gestion des erreurs

```c
#define CUDA_CHECK(appel) do { \
    cudaError_t err = appel; \
    if (err != cudaSuccess) { \
        fprintf(stderr, "Erreur CUDA %d : %s\n", __LINE__, cudaGetErrorString(err)); \
        exit(EXIT_FAILURE); \
    } \
} while(0)

CUDA_CHECK(cudaMalloc(&d_a, taille));
kernel<<<blocs, threads>>>(args);
CUDA_CHECK(cudaGetLastError());
CUDA_CHECK(cudaDeviceSynchronize());
```

---

## 10. Bonnes pratiques

| Aspect | Recommandation |
|--------|----------------|
| Taille de bloc | Commencer avec 256 threads |
| Garde `if (i < n)` | Toujours dans le kernel |
| Acces coalescent | Threads consecutifs -> adresses consecutives |
| Transferts CPU-GPU | Regrouper, garder les donnees sur le GPU |
| `__syncthreads` | Obligatoire avant de lire du `__shared__` |
| `cudaDeviceSynchronize` | Apres le kernel si on a besoin du resultat |

### Acces coalescent

```c
/* BON : threads consecutifs -> adresses consecutives */
float val = tableau[threadIdx.x];

/* MAUVAIS : stride entre les acces */
float val = tableau[threadIdx.x * 32];
```

---

## 11. Pieges classiques

| Piege | Correction |
|-------|------------|
| Oublier `if (i < n)` | Buffer overflow GPU |
| Oublier `cudaDeviceSynchronize` | Resultats incorrects |
| Trop de `__shared__` | Kernel ne se lance pas (~48 Ko max) |
| Oublier `__syncthreads` | Lecture de donnees pas encore ecrites |
| Acceder a `d_ptr[0]` depuis le CPU | CRASH -- memoire GPU non accessible |

---

## CHEAT SHEET -- CUDA

```c
/* Allocation et copie */
cudaMalloc(&d_ptr, taille);
cudaMemcpy(d_ptr, h_ptr, taille, cudaMemcpyHostToDevice);
cudaMemcpy(h_ptr, d_ptr, taille, cudaMemcpyDeviceToHost);
cudaFree(d_ptr);

/* Lancement du kernel */
kernel<<<nb_blocs, taille_bloc>>>(args);
cudaDeviceSynchronize();

/* Index global (LA formule) */
int i = blockIdx.x * blockDim.x + threadIdx.x;

/* Nombre de blocs */
int nb_blocs = (N + B - 1) / B;   /* ceil(N/B) */

/* Memoire partagee */
__shared__ float cache[256];
__syncthreads();

/* Qualificateurs */
__global__   /* kernel : appele CPU, execute GPU */
__device__   /* appele GPU, execute GPU */
__host__     /* appele CPU, execute CPU (defaut) */

/* Compilation */
nvcc programme.cu -o programme
```
