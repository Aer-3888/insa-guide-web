---
title: "Exercices -- Solutions detaillees des TP"
sidebar_position: 0
---

# Exercices -- Solutions detaillees des TP

Ce repertoire contient les guides de solutions pas-a-pas pour chaque TP du cours de Parallelisme / Calcul Hautes Performances.

Chaque fichier contient :
- Le code source complet avec annotations ligne par ligne
- Les commandes de compilation exactes (flags, Makefile)
- Les commandes d'execution avec differents nombres de threads/processus
- Des tableaux de performance avec calculs de speedup et efficacite
- L'analyse des race conditions et comment elles sont evitees
- La transformation sequentiel vers parallele pour chaque exercice
- Les techniques de debogage specifiques au paradigme

| TP | Sujet | Technologie | Fichier |
|----|-------|-------------|---------|
| TP1 | Prise en main OpenMP (threads, boucles, PI) | OpenMP | [tp1_openmp_bases.md](/S6/Parallelisme/exercises/tp1-openmp-bases) |
| TP2-3 | Chaleur + Crible + Jacobi | OpenMP | [tp2_3_openmp_avance.md](/S6/Parallelisme/exercises/tp2-3-openmp-avance) |
| TP4 | Calcul de PI distribue (Bcast, Reduce) | MPI | [tp4_mpi_pi.md](/S6/Parallelisme/exercises/tp4-mpi-pi) |
| TP5 | Produit matrice-vecteur (Scatter, Gather) | MPI | [tp5_mpi_matvec.md](/S6/Parallelisme/exercises/tp5-mpi-matvec) |
| TP6 | Chaleur distribuee (SPMD, zones fantomes, Isend) | MPI | [tp6_mpi_chaleur.md](/S6/Parallelisme/exercises/tp6-mpi-chaleur) |
