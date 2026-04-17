---
title: "Exam Prep -- Parallelisme"
sidebar_position: 0
---

# Exam Prep -- Parallelisme

## Structure typique du DS

Le DS dure generalement **2 heures** et couvre :

| Partie | Poids | Contenu |
|--------|-------|---------|
| Questions de cours | ~30% | Definitions, Amdahl, Flynn, vrai/faux |
| OpenMP | ~30% | Analyser/ecrire du code, identifier les bugs |
| MPI | ~25% | Communications collectives, analyser un programme |
| GPU/CUDA | ~15% | Architecture, ecrire un kernel simple |

---

## Fichiers de preparation

| Fichier | Contenu |
|---------|---------|
| [questions_cours.md](/S6/Parallelisme/exam-prep/questions-cours) | Questions de cours recurrentes avec reponses |
| [exercices_type.md](/S6/Parallelisme/exam-prep/exercices-type) | Exercices types avec solutions detaillees |
| [pieges_frequents.md](/S6/Parallelisme/exam-prep/pieges-frequents) | Erreurs classiques a l'examen et comment les eviter |

---

## Analyse des annales (2016-2025)

### Questions qui reviennent CHAQUE annee

1. **Calcul de speedup/efficacite** a partir de temps mesures
2. **Loi d'Amdahl** : calculer S_max, trouver f, expliquer la limite
3. **Paralleliser une boucle OpenMP** : ajouter les bons pragmas et clauses
4. **Identifier une race condition** et la corriger
5. **Completer un programme MPI** : Bcast, Scatter, Gather, Reduce
6. **Detecter un deadlock MPI** : Send/Send ou ordre incorrect

### Questions frequentes

7. **Taxonomie de Flynn** : classer SISD/SIMD/MISD/MIMD
8. **Choisir un schedule OpenMP** et justifier
9. **Remplacer des Send/Recv par des collectives**
10. **Ecrire un kernel CUDA** simple (addition de vecteurs)
11. **Calculer l'index global** d'un thread GPU
12. **Expliquer le faux partage** et proposer une solution

### Themes couverts par annee

| Theme | 2016 | 2017 | 2020 | 2021 | 2023 | 2024 | 2025 |
|-------|------|------|------|------|------|------|------|
| Amdahl/Speedup | x | x | x | x | x | x | x |
| OpenMP | x | x | x | x | x | x | x |
| MPI | x | x | x | x | x | x | x |
| CUDA/GPU | | x | | x | x | x | x |
| Pthreads | x | | | | | | |
| Deadlocks | x | x | x | x | x | x | x |
| False sharing | | x | | | x | x | |

---

## Strategie pour le DS

### Avant l'examen

1. Memoriser les formules : Amdahl, speedup, efficacite, Gustafson
2. S'entrainer a paralleliser des boucles avec OpenMP (reduction, private, schedule)
3. Savoir ecrire un programme MPI complet (Init, Bcast, Scatter/Gather, Reduce, Finalize)
4. Connaitre l'index global CUDA et le calcul du nombre de blocs
5. Identifier les race conditions et les deadlocks sur du code

### Pendant l'examen

1. **Lire tout le sujet** avant de commencer
2. Commencer par les questions de cours (rapides, points faciles)
3. Pour les exercices de code : verifier systematiquement
   - Variables shared vs private ?
   - Y a-t-il un accumulateur ? -> reduction
   - Les iterations sont-elles independantes ?
   - Les collectives MPI sont-elles appelees par TOUS ?
   - Y a-t-il un risque de deadlock ?
4. Ne pas oublier les flags de compilation (`-fopenmp`, `mpicc`)
