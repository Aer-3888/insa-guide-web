---
title: "Chapitre 10 -- Evaluation de performance (Peva)"
sidebar_position: 10
---

# Chapitre 10 -- Evaluation de performance (Peva)

> Quantifier le service delivre par un systeme pour comparer, optimiser et dimensionner.

**Depuis 2024, le DS inclut des questions sur ce module (4-6 points).**

---

## 1. Approche systematique en 9 etapes

| Etape | Action | Piege |
|-------|--------|-------|
| 1 | Definir objectifs et systeme | "Notre systeme est le meilleur" => objectif biaise |
| 2 | Selectionner les metriques | Eviter la redondance (ex: longueur file = temps attente) |
| 3 | Lister les parametres | Inclure specs systeme, OS, nb utilisateurs, etc. |
| 4 | Selectionner facteurs et niveaux | Facteur = parametre qui varie, niveau = valeur fixe |
| 5 | Choisir technique d'evaluation | Mesure / Modelisation / Simulation |
| 6 | Definir la charge de travail | Representative de l'usage reel |
| 7 | Concevoir les experiences | Phase 1 : beaucoup de facteurs, peu de niveaux; Phase 2 : inverse |
| 8 | Analyser et interpreter | Prendre en compte la variabilite |
| 9 | Presenter les resultats | Graphiques clairs, intervalles de confiance |

---

## 2. Metriques de performance

### Types de metriques

| Categorie | Exemples |
|-----------|---------|
| Vitesse (speed) | Temps de reponse, debit (req/s, pkt/s) |
| Ressources | Utilisation CPU, memoire, reseau |
| Fiabilite | Probabilite d'erreur, taux de defaillance |
| Disponibilite | uptime / (uptime + downtime) |
| Financier | Cout par minute d'indisponibilite |
| Energetique | kWh, W, CO2e/kWh |

### Classification HB / LB / NB

| Classe | Signification | Exemple |
|--------|---------------|---------|
| HB (Higher is Better) | Plus c'est grand, mieux c'est | Debit (req/s) |
| LB (Lower is Better) | Plus c'est petit, mieux c'est | Temps de reponse |
| NB (Nominal is Best) | Une valeur cible est optimale | Utilisation CPU (~70-80%) |

### Criteres de selection

- **Faible variabilite** : moins de repetitions necessaires
- **Pas de redondance** : eviter deux metriques mesurant la meme chose
- **Completude** : couvrir tous les trade-offs du systeme

---

## 3. Techniques d'evaluation

| Technique | Quand | Temps | Cout | Precision | Persuasion |
|-----------|-------|-------|------|-----------|-----------|
| Modelisation analytique | Systeme n'existe pas encore | Petit | Petit | Faible | Faible |
| Simulation | Tout stade | Moyen | Moyen | Moyenne | Moyenne |
| Mesure | Systeme existant (prototype+) | Variable | Eleve | Elevee | Elevee |

---

## 4. Strategies de mesure

### Trois approches

| Strategie | Principe |
|-----------|---------|
| Event-driven | Compter les occurrences d'evenements predefinis |
| Tracing | Enregistrer des evenements horodates (sans recompilation) |
| Sampling | Releves d'etat a intervalles fixes (vue statistique) |

### Outils de mesure

| Outil | Fonction |
|-------|---------|
| **Instrumentation du code** | Ajout de compteurs/logs dans le code source |
| **Timers** | Mesure du temps d'execution (attention erreur de quantification) |
| **strace** | Tracing des appels systeme |
| **tcpdump** | Tracing des paquets reseau |
| **DTrace** | Tracing user + kernel, observabilite quasi-illimitee |
| **ps, top, vmstat, iostat** | Surveillance en temps reel (CPU, memoire, I/O) |
| **gprof** | Profiling : % temps par fonction + graphe d'appels |
| **gcov** | Couverture de code ligne par ligne |
| **perf** | Toolkit Linux de performance |

---

## 5. Profiling avec gprof

### Lire une sortie gprof

```
% time  cumulative  self     calls  self    total   name
        seconds     seconds         s/call  s/call
70.00   8.40        8.40     1      8.40    8.40    func2
17.00   10.44       2.04     1      2.04    3.24    func1
10.00   11.64       1.20     1      1.20    1.20    func3
 3.00   12.00       0.36                            main
```

| Colonne | Signification |
|---------|---------------|
| % time | Pourcentage du temps total dans cette fonction |
| cumulative seconds | Temps cumule (somme des self seconds precedents) |
| self seconds | Temps passe dans la fonction elle-meme |
| calls | Nombre d'appels |
| self s/call | self seconds / calls |
| total s/call | Temps total (fonction + ses appels) / calls |

### Utilisation en TP

```bash noexec
gcc -Wall -g -pg -fprofile-arcs -ftest-coverage ngram.c -o ngram
./ngram -n 2 -shown 10 -file shakespeare.txt
gprof ngram > report.txt          # profiling
gcov ngram.c                       # couverture
```

---

## 6. Loi d'Amdahl

### Formule

```
Speedup = 1 / ((1 - p) + p/S)
```

Ou :
- p = fraction du temps d'execution amelioree
- S = facteur d'acceleration de cette fraction

### Implications

- Meme une acceleration infinie (S -> inf) de la fraction p donne au maximum Speedup = 1/(1-p)
- **Identifier le goulot d'etranglement** avant d'optimiser (profiler d'abord!)

### Exemple DS 2024

Deux optimisations, une seule possible :

**Optimisation A :** func1 (17% du temps) 10x plus rapide
```
Speedup_A = 1 / ((1 - 0.17) + 0.17/10) = 1 / (0.83 + 0.017) = 1.18
```

**Optimisation B :** func2 (70% du temps) 1.25x plus rapide
```
Speedup_B = 1 / ((1 - 0.70) + 0.70/1.25) = 1 / (0.30 + 0.56) = 1.16
```

**Choix : Optimisation A** (speedup 1.18 > 1.16).

Meme si func2 prend beaucoup plus de temps, l'acceleration est trop faible (1.25x) pour compenser. Une petite fonction tres acceleree peut battre une grosse fonction peu acceleree.

---

## 7. Patterns de performance

### Bottleneck (goulot d'etranglement)
La performance globale est determinee par le composant le plus lent. Retirer un goulot peut en reveler un autre.

### Congestion Collapse
Augmenter la charge offerte fait **diminuer** la performance effective (surcharge, rejet de jobs). Exemple : reseau sature.

### Latent Congestion Collapse
Ajouter des ressources masque temporairement un goulot, qui se revele ensuite plus profond.

---

## 8. Presentation des donnees

### Bonnes pratiques graphiques

- Origine a (0, 0) sauf raison valable
- Cause sur l'axe x, effet sur l'axe y
- Etiquettes detaillees (ex : "Temps de reponse (s)" pas juste "Temps")
- Legendes explicites, directement sur les courbes si possible
- Minimiser l'encre (pas de fioritures)
- Toujours inclure les intervalles de confiance

### Erreurs courantes

- Origines non nulles (exagere les differences)
- Utiliser des courbes pour des donnees discretes (utiliser des barres)
- Pas d'intervalles de confiance (moyennes seules induisent en erreur)
- Trop de variables sur un seul axe y

### Ratio Games (attention aux manipulations)

- **Base system game** : le choix du systeme de reference change le classement
- **Ratio metrics** : un ratio de deux metriques peut etre trompeur
- **Pourcentages** : sont des ratios deguises, attention si les conditions different

---

## 9. Pieges classiques

1. **Confondre metriques et facteurs** : Metrique = ce qu'on mesure. Facteur = ce qu'on fait varier.

2. **Oublier la variabilite** : Presenter des moyennes sans intervalles de confiance.

3. **Appliquer Amdahl a la mauvaise fraction** : p doit etre la fraction du temps **total** passee dans la partie amelioree.

4. **Preferer la technique familiere** : Choisir la mesure quand la modelisation suffit, ou inversement.

---

## CHEAT SHEET -- Evaluation de performance

```
APPROCHE SYSTEMATIQUE (9 etapes) :
  Objectifs -> Metriques -> Parametres -> Facteurs/Niveaux ->
  Technique -> Workload -> Experiences -> Analyse -> Presentation

METRIQUES : HB (debit), LB (latence), NB (utilisation)
CRITERES : faible variabilite, pas de redondance, completude

TECHNIQUES :
  Modelisation (rapide, pas cher, imprecis)
  Simulation (moyen)
  Mesure (precis, cher, persuasif)

LOI D'AMDAHL :
  Speedup = 1 / ((1-p) + p/S)
  p = fraction amelioree, S = facteur d'acceleration
  Maximum si S -> inf : Speedup_max = 1/(1-p)

GPROF :
  % time : % du temps total dans la fonction
  self seconds : temps dans la fonction seule
  Compiler avec : gcc -pg -fprofile-arcs -ftest-coverage

PROFILING :
  gprof : repartition du temps par fonction
  gcov  : couverture ligne par ligne

PATTERNS :
  Bottleneck : composant le plus lent limite tout
  Congestion collapse : plus de charge = moins de performance
```
