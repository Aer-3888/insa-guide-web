---
title: "Chapitre 05 -- Conception d'algorithmes paralleles"
sidebar_position: 5
---

# Chapitre 05 -- Conception d'algorithmes paralleles

## 1. Strategies de decomposition

### Decomposition par donnees (data parallelism)

Diviser les **donnees** entre les processeurs. Chaque processeur execute le meme code sur sa portion.

```
Tableau de N elements, P processeurs :
P0 : tab[0..N/P-1]
P1 : tab[N/P..2N/P-1]
...
P(P-1) : tab[(P-1)*N/P..N-1]
```

**Exemples du cours :**
- Calcul de PI (TP1/TP4) : chaque thread/processus integre sur son intervalle
- Produit matrice-vecteur (TP5) : chaque processus calcule N/P lignes du resultat
- Propagation de la chaleur (TP2/TP6) : chaque processeur traite N/P lignes de la grille

### Decomposition par taches (task parallelism)

Diviser le **travail** en taches differentes.

```
T0 : lire fichier
T1 : pre-traiter
T2 : calculer
T3 : ecrire resultat
```

**En OpenMP :** `#pragma omp sections` + `#pragma omp section`

### Decomposition pipeline

Les donnees passent par une serie d'etapes, chaque etape traitee par un processeur different.

---

## 2. Patterns de distribution en MPI

### Distribution par blocs contigus

Chaque processus recoit un bloc continu de donnees. Utilise avec `MPI_Scatter` / `MPI_Gather`.

```
P0 : lignes 0..249
P1 : lignes 250..499
P2 : lignes 500..749
P3 : lignes 750..999
```

**Avantage :** bonne localite memoire.
**Inconvenient :** desequilibre si le travail n'est pas uniforme.

### Distribution cyclique

Processus k traite les indices k, k+P, k+2P, ...

```
P0 : i = 0, 4, 8, 12, ...
P1 : i = 1, 5, 9, 13, ...
P2 : i = 2, 6, 10, 14, ...
P3 : i = 3, 7, 11, 15, ...
```

**Avantage :** meilleur equilibrage si le cout varie avec l'indice.
**Utilise dans :** calcul de PI avec MPI (TP4, version cyclique).

### Distribution maitre-esclave

Le maitre distribue le travail dynamiquement aux esclaves qui en demandent.

**Avantage :** equilibrage automatique.
**Inconvenient :** goulot d'etranglement au maitre, beaucoup de messages.

---

## 3. Equilibrage de charge (load balancing)

### En OpenMP

```c noexec
/* Iterations homogenes */
#pragma omp parallel for schedule(static)

/* Iterations heterogenes */
#pragma omp parallel for schedule(dynamic, 4)

/* Compromis */
#pragma omp parallel for schedule(guided)
```

### En MPI

- **Statique :** Scatter/Gather avec tailles egales (suppose travail uniforme)
- **Dynamique :** maitre-esclave (adapte a travail irregulier)
- **Scatterv/Gatherv :** tailles differentes par processus si le probleme n'est pas divisible

---

## 4. Patterns de communication en MPI

### Halo exchange (echange de bordures)

Pattern fondamental pour les calculs stencil distribues. Chaque processus echange ses lignes de bord avec ses voisins.

```
P0        P1        P2
[ghost]   [ghost]   [ghost]
[data ]-->|[data ] -->|[data ]
[data ]   |[data ]   |[data ]
[data ]<--|[data ]<-- |[data ]
[ghost]   [ghost]   [ghost]
```

**Utilise dans :** chaleur distribuee (TP6).

### Broadcast + calcul local + Reduce

Pattern "scatter-compute-gather" :
1. Le root diffuse les donnees communes (Bcast)
2. Le root distribue les donnees propres (Scatter)
3. Chaque processus calcule
4. Rassembler les resultats (Gather ou Reduce)

**Utilise dans :** produit matrice-vecteur (TP5), calcul de PI (TP4).

---

## 5. Recouvrement calcul-communication

Lancer les communications non-bloquantes, faire du calcul utile pendant le transfert, puis attendre la fin.

```c noexec
/* Lancer les echanges de halo */
MPI_Isend(bords, ...);
MPI_Irecv(ghost, ...);

/* Calculer l'interieur (ne depend pas des ghost zones) */
calculer_interieur(grille);

/* Attendre la fin des communications */
MPI_Wait(...);

/* Calculer les bords (depend des ghost zones recues) */
calculer_bords(grille, ghost);
```

---

## 6. Convergence distribuee

Pour les algorithmes iteratifs (chaleur, Jacobi), tous les processus doivent decider ensemble d'arreter.

```c noexec
/* Chaque processus calcule son delta local */
double delta_local = ...;

/* Reduction globale pour obtenir le delta total */
double delta_total;
MPI_Allreduce(&delta_local, &delta_total, 1, MPI_DOUBLE, MPI_SUM, comm);

/* Tous les processus comparent au seuil */
if (delta_total < SEUIL) break;
```

`MPI_Allreduce` (et non `MPI_Reduce`) car TOUS les processus doivent connaitre la decision.

---

## CHEAT SHEET -- Algorithmes paralleles

```
Decomposition :
  - Par donnees : meme code, donnees differentes
  - Par taches : codes differents
  - Pipeline : etapes successives

Distribution MPI :
  - Blocs contigus : Scatter/Gather
  - Cyclique : i = rang, rang+P, rang+2P...
  - Maitre-esclave : dynamique

Equilibrage de charge :
  - OpenMP : schedule(static/dynamic/guided)
  - MPI : blocs egaux ou maitre-esclave

Patterns de communication :
  - Bcast + calcul + Reduce : donnees communes + distribution
  - Halo exchange : stencils distribues (ghost zones)
  - Recouvrement : Isend/Irecv + calcul + Wait

Convergence distribuee :
  - MPI_Allreduce pour que TOUS connaissent le critere d'arret
```
