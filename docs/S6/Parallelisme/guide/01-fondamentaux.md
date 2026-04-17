---
title: "Chapitre 01 -- Fondamentaux du calcul parallele"
sidebar_position: 1
---

# Chapitre 01 -- Fondamentaux du calcul parallele

## 1. Pourquoi paralleliser ?

Depuis environ 2005, la frequence des processeurs plafonne autour de 4 GHz a cause du mur thermique. L'industrie a repondu en multipliant les coeurs. Consequence : pour exploiter la puissance disponible, il faut reecrire les programmes pour distribuer le travail entre plusieurs coeurs.

---

## 2. Taxonomie de Flynn (1966)

Classification selon le nombre d'instructions et de donnees traitees simultanement.

| Categorie | Instructions | Donnees | Exemple |
|-----------|-------------|---------|---------|
| **SISD** | 1 | 1 | Processeur mono-coeur classique |
| **SIMD** | 1 | Plusieurs | GPU, instructions SSE/AVX |
| **MISD** | Plusieurs | 1 | Systemes tolerants aux pannes (rare) |
| **MIMD** | Plusieurs | Plusieurs | Multi-coeur, clusters, Pthreads, OpenMP, MPI |

Les programmes paralleles de ce cours sont en general **MIMD**. Les GPU fonctionnent en mode **SIMT** (Single Instruction Multiple Threads), variante du SIMD.

---

## 3. Architectures : memoire partagee vs memoire distribuee

| Aspect | Memoire partagee | Memoire distribuee | GPU |
|--------|------------------|--------------------|-----|
| Memoire | Commune a tous les coeurs | Propre a chaque noeud | Propre au GPU + memoire partagee interne |
| Communication | Lecture/ecriture en RAM | Envoi de messages reseau | Transferts CPU <-> GPU |
| Scalabilite | 1 machine (quelques coeurs) | Cluster (centaines de noeuds) | 1 GPU (milliers de coeurs) |
| Outils | Pthreads, OpenMP | MPI | CUDA, OpenCL |
| Difficulte | Moyenne (synchronisation) | Elevee (messages explicites) | Elevee (modele different) |

---

## 4. Speedup et efficacite

### Speedup

```
S(p) = T(1) / T(p)
```

- `S(p) = p` : lineaire (ideal, tres rare)
- `S(p) < p` : sous-lineaire (typique -- overhead de synchronisation, communication)
- `S(p) > p` : super-lineaire (rare, effets de cache)

### Efficacite

```
E(p) = S(p) / p
```

- `E(p) = 1` (100%) : chaque processeur utilise a plein
- `E(p) = 0.5` (50%) : la moitie de la puissance gaspillee

### Exemple concret

Somme d'un tableau de 100 millions d'elements :
- Sequentiel (1 coeur) : 2.0 s
- 4 coeurs : 0.6 s
- Speedup : S(4) = 2.0 / 0.6 = 3.33
- Efficacite : E(4) = 3.33 / 4 = 0.83 (83%)

---

## 5. Loi d'Amdahl

### Formule

```
S_max(p) = 1 / ((1 - f) + f/p)
```

| Variable | Signification |
|----------|---------------|
| `f` | Fraction parallelisable du programme (0 a 1) |
| `1 - f` | Fraction sequentielle (incompressible) |
| `p` | Nombre de processeurs |

### Limite quand p tend vers l'infini

```
S_max(inf) = 1 / (1 - f)
```

| f | Speedup max |
|---|-------------|
| 50% | 2x |
| 75% | 4x |
| 90% | 10x |
| 95% | 20x |
| 99% | 100x |

### Exemples numeriques (f = 0.9)

| p | S_max | Calcul |
|---|-------|--------|
| 1 | 1.00 | 1 / (0.1 + 0.9/1) |
| 2 | 1.82 | 1 / (0.1 + 0.9/2) |
| 4 | 3.08 | 1 / (0.1 + 0.9/4) |
| 8 | 4.71 | 1 / (0.1 + 0.9/8) |
| 16 | 6.40 | 1 / (0.1 + 0.9/16) |
| inf | 10.00 | 1 / 0.1 |

### Exercice type : trouver f a partir du speedup

"Le speedup avec 8 processeurs est de 5. Quelle fraction est parallelisable ?"

```
5 = 1 / ((1-f) + f/8)
(1-f) + f/8 = 0.2
1 - f + f/8 = 0.2
1 - 7f/8 = 0.2
7f/8 = 0.8
f = 0.8 * 8/7 = 0.914   (91.4%)
```

---

## 6. Loi de Gustafson

Vision complementaire a Amdahl : on garde le temps constant et on augmente la taille du probleme.

```
S_scaled(p) = p - alpha * (p - 1)
```

| Variable | Signification |
|----------|---------------|
| `alpha` | Fraction sequentielle |
| `p` | Nombre de processeurs |

**Exemple** : alpha = 0.1, p = 100

```
S = 100 - 0.1 * 99 = 90.1
```

Gustafson predit 90.1x la ou Amdahl predit ~10x. La difference : Gustafson suppose un probleme 100 fois plus gros.

### Amdahl vs Gustafson

| | Amdahl | Gustafson |
|--|--------|-----------|
| Question | Combien de temps je gagne pour CE probleme ? | Quel probleme je peux resoudre dans LE MEME temps ? |
| Taille probleme | Fixe | Croit avec p |
| Vision | Pessimiste | Optimiste |

---

## 7. Modeles de parallelisme

### Parallelisme de donnees

On divise les **donnees** entre les processeurs. Chaque processeur execute le **meme code** sur sa portion.

```
Thread 0: traite tab[0..N/4-1]
Thread 1: traite tab[N/4..N/2-1]
Thread 2: traite tab[N/2..3N/4-1]
Thread 3: traite tab[3N/4..N-1]
```

### Parallelisme de taches

On divise le **travail** en taches differentes. Chaque processeur execute une **tache differente**.

```
Thread 0: lire le fichier
Thread 1: decompresser
Thread 2: filtrer
Thread 3: ecrire le resultat
```

---

## 8. Sources de surcout (overhead)

| Source | Description | Solution |
|--------|-------------|----------|
| Creation de threads | Quelques microsecondes par thread | Pool de threads (OpenMP le fait) |
| Synchronisation | Mutex, barrieres = temps d'attente | Minimiser les sections critiques |
| Communication | Messages MPI, transferts GPU | Regrouper les messages |
| Desequilibrage de charge | Un thread a plus de travail | schedule(dynamic) en OpenMP |
| Faux partage (false sharing) | Variables differentes sur meme ligne de cache | Padding, variables locales |

---

## CHEAT SHEET -- Fondamentaux

```
Speedup :           S(p) = T(1) / T(p)
Efficacite :        E(p) = S(p) / p
Amdahl :            S_max(p) = 1 / ((1-f) + f/p)
Amdahl (limite) :   S_max(inf) = 1 / (1-f)
Gustafson :         S(p) = p - alpha*(p-1)

Flynn : SISD (sequentiel), SIMD (GPU), MISD (rare), MIMD (multi-coeur)
Overhead : creation threads, synchronisation, communication, desequilibrage, false sharing
Parallelisme de donnees = meme code, donnees differentes
Parallelisme de taches = codes differents, taches differentes
```
