---
title: "TP1 - OpenMP: Prise en main"
sidebar_position: 1
---

# TP1 - OpenMP: Prise en main

Premiers pas avec OpenMP pour le calcul parallèle sur architectures multi-cœurs.

## Objectifs pédagogiques

- Comprendre le modèle de programmation OpenMP
- Créer et gérer des threads
- Paralléliser des boucles
- Mesurer les performances et le speedup

## Exercices

### Exercice 1 - Prise en main

**Objectif**: Créer 10 threads OpenMP qui affichent leur numéro de rang.

**Concepts introduits**:
- Directive `#pragma omp parallel`
- Fonction `omp_get_thread_num()` - obtenir le rang du thread
- Fonction `omp_get_num_threads()` - obtenir le nombre total de threads
- Variable d'environnement `OMP_NUM_THREADS`

**Compilation et exécution**:
```bash
gcc -fopenmp exo1.c -o exo1
export OMP_NUM_THREADS=10
./exo1
```

**Résultat attendu**:
```
Thread numéro 0
Thread numéro 3
Thread numéro 1
...
Thread numéro 9
Fin de programme
```

**Note**: L'ordre d'affichage est non-déterministe (race condition).

---

### Exercice 2 - Découpage de boucles

**Objectif**: Distribuer les itérations d'une boucle entre plusieurs threads.

**Deux approches**:

1. **Manuelle**: Calcul explicite des bornes de chaque thread
   ```c
   #pragma omp parallel
   {
       int num = omp_get_thread_num();
       int tot = omp_get_num_threads();
       int debut = (N/tot) * num;
       int fin = (N/tot) * (num+1);
       for (int i = debut; i < fin; i++) {
           // travail
       }
   }
   ```

2. **Automatique**: Directive `#pragma omp parallel for`
   ```c
   #pragma omp parallel for
   for (int i = 0; i < N; i++) {
       // travail
   }
   ```

**Politique de distribution**: Par défaut, OpenMP utilise le **scheduling statique** avec découpage en chunks continus (thread 0 → itérations 0-9, thread 1 → 10-19, etc.).

**Compilation et exécution**:
```bash
gcc -fopenmp exo2.c -o exo2
export OMP_NUM_THREADS=10
./exo2
```

**Points d'attention**:
- Avec l'approche manuelle, si N n'est pas divisible par le nombre de threads, certaines itérations peuvent être oubliées
- L'approche automatique gère ce cas correctement

---

### Exercice 3 - Calcul de PI

**Objectif**: Paralléliser le calcul de π par intégration numérique (méthode des rectangles).

**Formule mathématique**:
```
π = ∫₀¹ 4/(1+x²) dx ≈ Σ 4/(1+xᵢ²) × pas
```

Avec `xᵢ = (i-0.5) × pas` et `pas = 1/nb_pas`.

**Défi de parallélisation**: Variable accumulateur `som` partagée → **race condition**.

**Solutions**:

1. **Mauvaise approche**: Section critique
   ```c
   #pragma omp parallel for
   for (long i = 1; i <= nb_pas; i++) {
       x = (i-0.5) * pas;
       #pragma omp critical
       som += 4.0/(1.0+x*x);
   }
   ```
   → Sérialise les accès, très lent (pire que séquentiel).

2. **Bonne approche**: Clause `reduction`
   ```c
   #pragma omp parallel for reduction(+:som) private(x)
   for (long i = 1; i <= nb_pas; i++) {
       x = (i-0.5) * pas;
       som += 4.0/(1.0+x*x);
   }
   ```
   → OpenMP crée une copie privée de `som` pour chaque thread, puis les combine automatiquement.

**Mesure de performance**:
```c
double debut = omp_get_wtime();
// calcul parallèle
double duree = omp_get_wtime() - debut;
```

**Résultats typiques** (pour 10⁸ itérations):
- Séquentiel: ~0.5s
- 2 threads: ~0.25s (speedup ≈ 2)
- 4 threads: ~0.13s (speedup ≈ 4)

**Compilation et exécution**:
```bash
gcc -fopenmp exo3.c -o exo3 -lm
export OMP_NUM_THREADS=4
./exo3
```

---

### Exercice 4 - Utilisation du Cluster

**Objectif**: Mesurer la scalabilité de l'exercice 3 sur le cluster (24 cœurs).

**Procédure**:

1. **Connexion**:
   ```bash
   ssh -l nom-login cluster-infomath-tete.educ.insa-rennes.fr
   ```

2. **Préparation**:
   ```bash
   mkdir /data/votre-login
   cd /data/votre-login
   # copier exo3 ici
   ```

3. **Exécution**:
   ```bash
   srun -N1 -c24 ./exo3
   ```
   → Attend un nœud libre, exécute avec 24 cœurs.

**Analyse de scalabilité**:

Faire varier `OMP_NUM_THREADS` de 1 à 24 et tracer:

1. **Temps d'exécution** vs nombre de threads
2. **Speedup** S(p) = T(1)/T(p) vs nombre de threads

**Résultats attendus**:
- Speedup quasi-linéaire jusqu'à 8-12 threads
- Plateau ensuite (loi d'Amdahl, overhead de synchronisation)
- Possible dégradation au-delà (false sharing, contentions mémoire)

**Facteurs limitants**:
- Bande passante mémoire (memory-bound)
- Overhead de création/synchronisation des threads
- Partie séquentielle du code (initialisation, affichage)

---

## Concepts OpenMP introduits

### 1. Région parallèle
```c
#pragma omp parallel
{
    // Code exécuté par tous les threads
}
```

### 2. Boucle parallèle
```c
#pragma omp parallel for
for (int i = 0; i < N; i++) {
    // Itérations distribuées entre threads
}
```

### 3. Variables privées vs partagées

- **Partagées** (par défaut): Toutes les variables déclarées avant la région parallèle
- **Privées**: Chaque thread a sa propre copie
  ```c
  #pragma omp parallel for private(x)
  ```

### 4. Réduction
```c
#pragma omp parallel for reduction(op:var)
```
Opérateurs supportés: `+`, `*`, `min`, `max`, `&`, `|`, `^`, `&&`, `||`

### 5. Barrière implicite
À la fin de `#pragma omp parallel` et `#pragma omp for`, tous les threads attendent (synchronisation automatique).

---

## Compilation et exécution

### Makefile fourni

```bash
make          # Compile tous les exercices
make tests    # Exécute les tests de performance (exo3)
```

### Commandes manuelles

```bash
# Exercice 1
gcc -fopenmp exo1.c -o exo1 -Wall -Wextra
export OMP_NUM_THREADS=10
./exo1

# Exercice 2
gcc -fopenmp exo2.c -o exo2 -Wall -Wextra
export OMP_NUM_THREADS=10
./exo2

# Exercice 3
gcc -fopenmp exo3.c -o exo3 -Wall -Wextra -lm
export OMP_NUM_THREADS=4
./exo3
```

---

## Points clés à retenir

1. **OpenMP = directives ajoutées au code séquentiel** → Parallélisation incrémentale
2. **Variables partagées = danger** → Utiliser `private` ou `reduction`
3. **Mesure de temps** → `omp_get_wtime()` pour précision
4. **Speedup réel < speedup idéal** → Overhead, synchronisation, partie séquentielle
5. **OMP_NUM_THREADS** → Toujours définir (sinon = nombre de cœurs logiques)

---

## Ressources

- Spécification OpenMP: https://www.openmp.org/specifications/
- Info CPU Linux: `cat /proc/cpuinfo`
- Tutoriel OpenMP: https://hpc-tutorials.llnl.gov/openmp/

---

## Fichiers du TP

```
tp1/
├── README.md           # Ce fichier
└── src/
    ├── Makefile        # Compilation automatique
    ├── exo1.c          # Threads et rangs
    ├── exo2.c          # Découpage de boucles
    └── exo3.c          # Calcul de PI avec réduction
```
