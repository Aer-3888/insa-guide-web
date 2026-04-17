---
title: "Chapitre 07 -- Analyse de performance"
sidebar_position: 7
---

# Chapitre 07 -- Analyse de performance

## 1. Metriques fondamentales

### Speedup

```
S(p) = T(1) / T(p)
```

| Cas | Interpretation |
|-----|----------------|
| S(p) = p | Lineaire (ideal) |
| S(p) < p | Sous-lineaire (typique) |
| S(p) > p | Super-lineaire (rare, effets cache) |

### Efficacite

```
E(p) = S(p) / p
```

Pourcentage de la puissance de calcul reellement utilisee. E = 100% est ideal.

---

## 2. Scalabilite forte vs faible

### Scalabilite forte (strong scaling)

Taille du probleme **fixe**, on augmente le nombre de processeurs.

- Mesure : comment le temps diminue avec p
- Limite : loi d'Amdahl -- la partie sequentielle plafonne le speedup
- Objectif : reduire le temps pour un probleme donne

### Scalabilite faible (weak scaling)

Taille du probleme **croit proportionnellement** au nombre de processeurs (charge constante par processeur).

- Mesure : le temps reste-t-il constant quand on double p et la taille ?
- Modele : loi de Gustafson
- Objectif : resoudre des problemes plus gros

### Resultat attendu

| Scaling | Speedup ideal | Temps ideal |
|---------|--------------|-------------|
| Fort | S(p) = p | T(p) = T(1)/p |
| Faible | S(p) = p | T(p) = T(1) (constant) |

---

## 3. Mesurer correctement

### OpenMP

```c noexec
double t0 = omp_get_wtime();   /* temps mur (wall clock) */
/* ... code parallele ... */
double t1 = omp_get_wtime();
double temps = t1 - t0;
```

**Piege :** `clock()` mesure le temps CPU **total** (tous threads confondus). Avec 4 threads, `clock()` rapporte ~4x le temps reel.

### MPI

```c noexec
double t0 = MPI_Wtime();
/* ... calcul distribue ... */
double t1 = MPI_Wtime();
```

Chaque processus a son propre chrono. Pour un timing global, placer la mesure sur P0 apres le Reduce/Gather final.

### CUDA

```c noexec
cudaEvent_t debut, fin;
cudaEventCreate(&debut);
cudaEventCreate(&fin);
cudaEventRecord(debut);
/* ... kernel ... */
cudaEventRecord(fin);
cudaEventSynchronize(fin);
float ms;
cudaEventElapsedTime(&ms, debut, fin);
```

**Piege :** le lancement du kernel est asynchrone, `clock()` mesurerait seulement le temps de lancement.

---

## 4. Goulots d'etranglement

### Bande passante memoire (memory-bound)

Si le ratio calcul/acces memoire est faible, le programme est limite par la bande passante memoire, pas par le CPU.

**Symptome :** le speedup plafonne bien avant d'atteindre le nombre de coeurs.

**Exemples :** propagation de la chaleur (5 lectures, 1 ecriture, quelques operations).

### Overhead de synchronisation

Chaque barriere, mutex, section critique ajoute du temps d'attente.

**Symptome :** efficacite qui chute quand on ajoute des threads.

### Desequilibrage de charge

Si certains threads/processus ont plus de travail que les autres.

**Symptome :** le temps est determine par le thread le plus lent.

**Solution OpenMP :** `schedule(dynamic)` ou `schedule(guided)`.

### Communication (MPI)

Latence et debit du reseau limitent le speedup en memoire distribuee.

**Rapport calcul/communication :** si le calcul est O(N^2/P) et la communication O(N^2), le speedup est plafonne.

### Transferts CPU-GPU

Le bus PCIe est un goulot d'etranglement. Minimiser les transferts, regrouper les copies, garder les donnees sur le GPU entre les kernels.

---

## 5. Resultats de performance typiques (cours INSA)

### TP1 -- Calcul de PI (OpenMP, 10^8 iterations)

| Threads | Temps (s) | Speedup | Efficacite |
|---------|-----------|---------|------------|
| 1 | ~0.50 | 1.0 | 100% |
| 2 | ~0.25 | ~2.0 | ~100% |
| 4 | ~0.13 | ~3.8 | ~96% |
| 8 | ~0.07 | ~7.0 | ~88% |

Bon speedup car le probleme est compute-bound et sans dependances.

### TP2 -- Chaleur (OpenMP, N=M=100)

| Threads | Temps (s) | Speedup | Efficacite |
|---------|-----------|---------|------------|
| 1 | 0.15 | 1.0 | 100% |
| 2 | 0.08 | 1.88 | 94% |
| 4 | 0.04 | 3.75 | 94% |
| 8 | 0.025 | 6.0 | 75% |

Degradation au-dela de 4 threads : memory-bound.

### TP5 -- Produit matrice-vecteur (MPI, N=10000)

| Processus | Temps (s) | Speedup | Efficacite |
|-----------|-----------|---------|------------|
| 1 | 0.80 | 1.0 | 100% |
| 2 | 0.42 | 1.90 | 95% |
| 4 | 0.22 | 3.64 | 91% |
| 8 | 0.13 | 6.15 | 77% |

La communication (Scatter de N^2 doubles) devient non-negligeable pour P > 8.

---

## 6. Facteurs affectant les performances

| Facteur | Impact | Comment ameliorer |
|---------|--------|-------------------|
| Taille du probleme | Petit = overhead domine | Augmenter N |
| Bande passante memoire | Plafonne le speedup | Optimiser les acces cache |
| Latence reseau (MPI) | Penalise les petits messages | Regrouper les messages |
| Nombre de synchronisations | Ralentit le parallele | Reduire les barrieres |
| False sharing | Invalidations de cache | Padding, variables locales |
| Ratio calcul/communication | Bas = mauvais speedup | Augmenter la granularite |

---

## CHEAT SHEET -- Performance

```
Speedup :     S(p) = T(1) / T(p)
Efficacite :  E(p) = S(p) / p

Scaling fort : taille fixe, on ajoute des processeurs (Amdahl)
Scaling faible : taille croit avec p, temps constant (Gustafson)

Mesurer :
  OpenMP : omp_get_wtime()      (PAS clock())
  MPI :    MPI_Wtime()
  CUDA :   cudaEvent + cudaEventElapsedTime

Goulots :
  - Memory-bound : ratio calcul/memoire faible
  - Synchronisation : barrieres, mutex
  - Desequilibrage : schedule(dynamic)
  - Communication MPI : latence, debit
  - Transferts GPU : bus PCIe

Performance = toujours mesurer, jamais deviner.
```
