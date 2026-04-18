---
title: "Preparation aux examens CLP"
sidebar_position: 0
---

# Preparation aux examens CLP

## Structure des examens

CLP comporte **deux examens distincts** :

### DS Logique

| Aspect | Details |
|--------|---------|
| Duree | ~2 heures |
| Sujets | Logique combinatoire, logique sequentielle, machines a etats, conception UC/UT |
| Format | Ecrit : tables de verite, tableaux de Karnaugh, diagrammes d'etats, conception de circuits |
| Outils autorises | Generalement aucun (pas de calculatrice) |

**Types de questions typiques** :
1. Simplification d'algebre de Boole (15-20 min)
2. Simplification par tableaux de Karnaugh (15-20 min)
3. Conception de machine a etats a partir d'un cahier des charges (30-40 min)
4. Conception ou analyse UC/UT (30-40 min)

### DS Assembleur

| Aspect | Details |
|--------|---------|
| Duree | ~2 heures |
| Sujets | Assembleur ARM : lecture d'instructions, ecriture de code, trace de pile |
| Format | Ecrit : lire du code, ecrire du code, tracer l'execution |
| Outils autorises | Aide-memoire ARM generalement fourni |

**Types de questions typiques** :
1. Lire et expliquer du code assembleur existant (20-30 min)
2. Ecrire une fonction en assembleur ARM (30-40 min)
3. Tracer la pile/les registres a travers des appels de fonctions (20-30 min)
4. Manipulation de structures de donnees en assembleur (20-30 min)

---

## Strategie de revision

### Pour le DS Logique

**Semaine 1** : Revoir les fondamentaux de la logique combinatoire
- Pratiquer les simplifications d'algebre de Boole (au moins 10 exercices)
- Maitriser les tableaux de Karnaugh pour 3 et 4 variables
- Revoir les systemes de numeration (binaire, hex, complement a deux)

**Semaine 2** : Se concentrer sur la logique sequentielle
- Pratiquer la conception de machines a etats depuis zero
- Convertir entre types de bascules
- Dessiner des chronogrammes a partir des tables d'etats

**Semaine 3** : Architecture processeur
- Comprendre la decomposition UC/UT
- Pratiquer la microprogrammation (ecriture de mots de microcode)
- Revoir les machines PGCD et Fibonacci de bout en bout

### Pour le DS Assembleur

**Semaine 1** : Maitrise du jeu d'instructions
- Memoriser les 15 instructions les plus courantes
- Pratiquer la lecture de bouts de code et la prediction du resultat
- Comprendre les modes d'adressage (immediat, registre, indexe, avec echelle)

**Semaine 2** : Convention d'appel de fonction
- Dessiner les cadres de pile de memoire
- Pratiquer l'ecriture de fonctions completes (prologue + corps + epilogue)
- Tracer les appels recursifs pas a pas

**Semaine 3** : Structures de donnees et annales
- Pratiquer l'acces aux tableaux et structures en assembleur
- Travailler toutes les annales en conditions chronometrees
- Se concentrer sur les patrons courants : boucles, traitement de chaines, acces aux structures

---

## Repartition du temps pendant l'examen

### DS Logique (2 heures)

| Phase | Temps | Activite |
|-------|-------|----------|
| Lecture | 10 min | Lire TOUTES les questions d'abord. Identifier les gains faciles. |
| Questions faciles | 30 min | Algebre de Boole, conversions, tables de verite simples |
| Questions moyennes | 40 min | Tableaux de Karnaugh, circuits a bascules |
| Questions difficiles | 30 min | Conception de machine a etats, integration UC/UT |
| Relecture | 10 min | Verifier toutes les tables de verite, valider les groupements de Karnaugh |

### DS Assembleur (2 heures)

| Phase | Temps | Activite |
|-------|-------|----------|
| Lecture | 10 min | Lire TOUTES les questions. Identifier les structures de donnees utilisees. |
| Lecture de code | 30 min | Annoter le code donne, tracer l'execution |
| Ecriture de code | 40 min | Ecrire les fonctions demandees avec prologue/epilogue complets |
| Trace de pile | 20 min | Dessiner les diagrammes de pile, tracer les valeurs des registres |
| Relecture | 20 min | Verifier l'equilibre de la pile, valider les decalages, revoir les cas limites |

---

## Erreurs courantes a eviter

### DS Logique

1. **Ordre des colonnes du tableau de Karnaugh** : 00, 01, 11, 10 (code de Gray), PAS 00, 01, 10, 11
2. **Transitions d'etats manquantes** : Chaque etat doit definir ce qui se passe pour CHAQUE entree
3. **Oublier de verifier les etats redondants** : Minimiser avant d'implementer
4. **Mauvais ordre des bits du microcode** : Bien verifier quel bit commande quelle operation

### DS Assembleur

1. **Ne pas sauvegarder LR avant BL** : Crash ou retour errone garanti
2. **Mauvais decalages de pile** : Dessiner le cadre, compter les octets depuis FP
3. **Confondre LDR et LDRB** : Mot (4 octets) vs octet (1 octet)
4. **Oublier .align apres .ascii** : Provoque des erreurs d'alignement
5. **Nettoyage de pile manquant** : Chaque SUB sp doit avoir un ADD sp correspondant

---

## Index des annales

### Examens d'assembleur

| Annee | Materiaux disponibles | Sujets cles |
|-------|----------------------|-------------|
| 2017 | Sujet PDF, 2 corrections (.s + .pdf) | Traitement de chaines, comptage de caracteres |
| 2018 | Sujet PDF, 2 corrections (.s + .pdf) | Structures (droites/vecteurs), vecteurs directeurs, colinearite |
| 2019 | Sujet PDF, 2 corrections (.s + .pdf) | Structures (ingredients), comptage, extraction de nombres |
| 2022 | Sujet PDF | -- |
| 2023 | Sujet PDF | -- |
| 2024 | Sujet PDF | -- |

### Examens de logique

| Annee | Materiaux disponibles |
|-------|----------------------|
| 2008-2016 | Plusieurs sujets PDF de logique (ancien format) |
| 2021 | DS CLP Logique PDF |
| 2022 | DS CLP Logique PDF |
| 2023 | DS CLP Logique PDF + exam_clp_logique_23.pdf |

---

## Corrections detaillees d'annales

Voir les corrections detaillees :
- [exam-assembly-walkthrough.md](/S5/CLP/exam-prep/exam-assembly-walkthrough) -- Analyse pas a pas des annales d'assembleur 2017, 2018, 2019
