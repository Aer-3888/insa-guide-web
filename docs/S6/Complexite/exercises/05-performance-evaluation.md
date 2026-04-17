---
title: "Exercices -- Evaluation de performance"
sidebar_position: 5
---

# Exercices -- Evaluation de performance

> Chaque calcul de speedup est detaille pas a pas. Les formules d'Amdahl et Gustafson sont expliquees et appliquees.

---

## Exercice 1 : Loi d'Amdahl -- choix d'optimisation (type DS 2024)

**Enonce :** Profil gprof du programme :
```
% time   self sec   calls   name
70.00    8.40       1       func2
17.00    2.04       1       func1
10.00    1.20       1       func3
 3.00    0.36               main
```

Optimisation A : func1 rendue 10x plus rapide.
Optimisation B : func2 rendue 1.25x plus rapide.
Laquelle choisir ?

### Rappel : Loi d'Amdahl

La loi d'Amdahl donne le speedup global quand on accelere une fraction p du programme par un facteur S :

```
Speedup_global = 1 / ((1 - p) + p/S)

ou :
  p = fraction du temps d'execution affectee par l'amelioration
  S = facteur d'acceleration de cette fraction
  (1 - p) = fraction non affectee (reste inchangee)
```

### Solution detaillee

Temps total initial = 8.40 + 2.04 + 1.20 + 0.36 = **12.00 secondes**.

**Optimisation A (func1 : p = 0.17, S = 10) :**

```
Speedup_A = 1 / ((1 - 0.17) + 0.17/10)
         = 1 / (0.83 + 0.017)
         = 1 / 0.847
         = 1.181

Nouveau temps : 12.00 / 1.181 = 10.16 s

Detail : func1 prend maintenant 2.04/10 = 0.204 s au lieu de 2.04 s.
Total = 8.40 + 0.204 + 1.20 + 0.36 = 10.164 s. OK.
Gain = 12.00 - 10.164 = 1.836 s.
```

**Optimisation B (func2 : p = 0.70, S = 1.25) :**

```
Speedup_B = 1 / ((1 - 0.70) + 0.70/1.25)
         = 1 / (0.30 + 0.56)
         = 1 / 0.86
         = 1.163

Nouveau temps : 12.00 / 1.163 = 10.32 s

Detail : func2 prend maintenant 8.40/1.25 = 6.72 s au lieu de 8.40 s.
Total = 6.72 + 2.04 + 1.20 + 0.36 = 10.32 s. OK.
Gain = 12.00 - 10.32 = 1.68 s.
```

**Choix : Optimisation A** (speedup 1.181 > 1.163).

**Intuition :** Meme si func2 occupe 70% du temps total, l'amelioration de seulement 1.25x est trop faible. La loi d'Amdahl montre qu'une petite fraction (17%) enormement acceleree (10x) peut produire un meilleur speedup qu'une grosse fraction (70%) faiblement acceleree (1.25x).

**Speedup maximal theorique (S -> inf) :**

```
Pour func1 : Speedup_max = 1 / (1 - 0.17) = 1.205
Pour func2 : Speedup_max = 1 / (1 - 0.70) = 3.333
```

Avec une amelioration infinie de func2, on obtiendrait au mieux 3.33x. Mais avec seulement 1.25x, on est tres loin de ce potentiel.

---

## Exercice 2 : Metriques, facteurs, workload (type DS 2024)

**Enonce :** Decrire les metriques, facteurs et charge de travail pour une etude comparative NGINX vs Apache.

### Solution detaillee

#### Metriques (ce qu'on mesure)

Les metriques sont classees par direction de prefererence : HB (Higher is Better), LB (Lower is Better), NB (Nominal is Best).

```
LB : Temps de reponse (ms)
     Temps entre l'envoi d'une requete et la reception de la reponse complete.
     Mesurer : moyenne, mediane, percentile 95, percentile 99.

HB : Debit (requetes/seconde)
     Nombre de requetes traitees par seconde en regime permanent.

NB : Utilisation CPU (%)
     Pourcentage de CPU utilise. Trop bas = sous-utilise. Trop haut = saturation.
     Objectif : 60-80% en charge nominale.

LB : Utilisation memoire (MB)
     Memoire consommee par le processus serveur.

LB : Taux d'erreur (%)
     Pourcentage de requetes en erreur (codes 5xx).
     Objectif : < 0.1%.

HB : Connexions simultanees max
     Nombre de connexions que le serveur peut gerer avant degradation.
```

#### Facteurs (ce qu'on fait varier)

```
Facteur principal : Type de serveur (NGINX vs Apache)
  Niveaux : 2 (NGINX, Apache)

Facteurs secondaires :
  Nombre de clients concurrents : 10, 50, 100, 500, 1000, 5000
  Type de contenu : statique (HTML, images), dynamique (PHP-FPM), API REST
  Taille des requetes : 1KB, 100KB, 1MB, 10MB
  Configuration : nombre de workers (= nombre de CPU), keep-alive on/off
  Protocole : HTTP/1.1, HTTP/2, HTTPS
```

#### Charge de travail (workload)

```
Mix operationnel representatif :
  70% GET pages statiques (HTML, CSS, JS, images)
  20% GET pages dynamiques (PHP/Python, requetes BDD)
  10% POST (formulaires, uploads)

Generation de charge :
  Outil : wrk, ab (Apache Benchmark), ou JMeter
  Duree de test : 5 minutes minimum par configuration
  Prechauffage : 30 secondes avant les mesures

Plan d'experience :
  Pour chaque combinaison (serveur, nb_clients, type_contenu) :
    - 3 repetitions minimum (mesurer la variabilite)
    - Calculer moyenne, ecart-type, intervalle de confiance
  Total : 2 serveurs * 6 niveaux_clients * 3 contenus * 3 repetitions = 108 tests
```

---

## Exercice 3 : Interpreter une sortie gprof

**Enonce :** Sortie gprof :
```
% time   cumul sec   self sec   calls   self s/call   total s/call   name
45.00    4.50        4.50       100     0.045         0.045          sort
30.00    7.50        3.00       1000    0.003         0.003          compare
15.00    9.00        1.50       1       1.500         7.500          process
 8.00    9.80        0.80       100     0.008         0.008          swap
 2.00   10.00        0.20                                            main
```

### Lecture colonne par colonne

```
% time    : pourcentage du temps total consacre a cette fonction (self seulement)
cumul sec : temps cumule en ajoutant les fonctions les unes apres les autres
self sec  : temps passe dans la fonction elle-meme (sans les appels enfants)
calls     : nombre d'appels a cette fonction
self s/call  : self sec / calls = temps moyen par appel (self)
total s/call : temps total par appel = self + temps des appels enfants
```

### Questions et reponses

**Q1 : Quelle fonction consomme le plus de temps CPU propre ?**

sort : 45%, 4.50 secondes propres. C'est le principal consommateur.

**Q2 : Pourquoi total s/call de process (7.5s) >> self s/call (1.5s) ?**

```
self s/call(process) = 1.5 s
total s/call(process) = 7.5 s

Difference = 7.5 - 1.5 = 6.0 s passees dans les appels enfants de process.
```

process appelle sort (qui prend 4.5 s) et probablement compare (3.0 s). Le temps total de process inclut tout l'arbre d'appels.

**Arbre d'appels probable :**

```
main (0.20 s)
  |
  +-- process (1.50 s self)
       |
       +-- sort (4.50 s) x100 appels
       |     |
       |     +-- compare (3.00 s) x1000 appels
       |     +-- swap (0.80 s) x100 appels
       |
       Total sous process : 1.50 + 4.50 + 3.00 + 0.80 = 9.80 s
       (mais total s/call = 7.50 s, donc seule une partie des compare/swap est appelee par sort dans process)
```

**Q3 : Si on optimise compare pour etre 2x plus rapide, quel speedup global ?**

```
p = 0.30 (compare represente 30% du temps total)
S = 2

Speedup = 1 / ((1 - 0.30) + 0.30/2)
       = 1 / (0.70 + 0.15)
       = 1 / 0.85
       = 1.176

Verification directe :
  Ancien temps compare = 3.00 s
  Nouveau temps compare = 3.00 / 2 = 1.50 s
  Nouveau total = 10.00 - 3.00 + 1.50 = 8.50 s
  Speedup = 10.00 / 8.50 = 1.176. OK.
```

**Q4 : Quel serait le speedup maximal en rendant sort infiniment rapide ?**

```
p = 0.45, S -> inf

Speedup_max = 1 / (1 - 0.45)
            = 1 / 0.55
            = 1.818

Nouveau temps minimal = 10.00 - 4.50 = 5.50 s
Speedup = 10.00 / 5.50 = 1.818. OK.
```

On ne peut jamais depasser un speedup de 1.82 en n'optimisant que sort, meme avec une amelioration infinie. C'est la **limite d'Amdahl**.

**Q5 : Quelle combinaison d'optimisations donne le meilleur resultat ?**

```
Optimiser sort 2x ET compare 2x :
  Nouveau temps sort = 4.50 / 2 = 2.25 s
  Nouveau temps compare = 3.00 / 2 = 1.50 s
  Nouveau total = 0.20 + 2.25 + 1.50 + 1.50 + 0.80 = 6.25 s
  Speedup = 10.00 / 6.25 = 1.60

Optimiser sort 4x :
  Nouveau temps sort = 4.50 / 4 = 1.125 s
  Nouveau total = 0.20 + 1.125 + 3.00 + 1.50 + 0.80 = 6.625 s
  Speedup = 10.00 / 6.625 = 1.51

La combinaison (sort 2x + compare 2x) est meilleure que (sort 4x seul).
```

---

## Exercice 4 : Patterns de performance -- diagnostic

**Q1 : Qu'est-ce qu'un bottleneck (goulot d'etranglement) ?**

Un composant dont la performance limite la performance globale du systeme. Tous les autres composants attendent celui-ci.

```
Exemple : Systeme web
  Serveur web   : 10% CPU (sous-utilise)
  Base de donnees : 95% CPU (sature !)        <- BOTTLENECK
  Serveur cache  : 5% CPU (sous-utilise)

Meme en doublant la puissance du serveur web, la performance globale
ne s'ameliore pas car la BDD est le goulot.
```

**Q2 : Qu'est-ce que le congestion collapse ?**

Phenomene ou augmenter la charge **offerte** au systeme fait **diminuer** la charge **effective** (le travail utile). Le systeme passe son temps a gerer la surcharge au lieu de traiter les requetes.

```
Charge offerte :   0  20  40  60  80  100  120  140
Charge effective : 0  20  40  58  70   65   50   30   <- collapse !

         Effective
    80 |       *
       |     *   *
    60 |   *       *
       |  *          *
    40 | *              *
       |*                 *
    20 *                    *
       +---+---+---+---+---+---+----> Offerte
       0  20  40  60  80  100 120
```

Causes typiques : retransmissions TCP, timeouts + retries, swap memoire, contention locks.

**Q3 : Qu'est-ce que le latent congestion collapse ?**

Quand on elimine un bottleneck, un autre composant (qui etait masque) devient le nouveau goulot et provoque un congestion collapse.

```
Avant : BDD lente -> debit plafonne a 100 req/s (bottleneck simple)
Apres optimisation BDD : debit monte a 500 req/s
  -> Le reseau sature -> retransmissions -> congestion collapse !
  -> Le debit chute a 200 req/s au lieu des 500 attendus.
```

Le congestion collapse etait **latent** : il etait invisible tant que la BDD bornait le debit en dessous du seuil de congestion reseau.

---

## Exercice 5 : Utilisation de gcov

**Enonce :** Interpreter la sortie gcov :
```
    100:   42: for (int i = 0; i < n; i++) {
    100:   43:     if (table[hash(key)] == key)
     10:   44:         return table[hash(key)];
     90:   45:     key = next_probe(key);
         :   46: }
```

### Interpretation detaillee

```
Ligne 42 : executee 100 fois
  La boucle fait 100 iterations.
  C'est le nombre de probes dans la table de hachage.

Ligne 43 : executee 100 fois
  Le test est effectue a chaque iteration.

Ligne 44 : executee 10 fois
  L'element est trouve dans 10 cas sur 100 (10% de hit direct).
  "return" sort de la boucle, donc les 10 recherches qui trouvent
  l'element ne continuent pas a prober.

Ligne 45 : executee 90 fois
  Dans 90% des iterations, l'element n'est pas la -> on probe la case suivante.

Ligne 46 : fin de boucle, pas executee separement.
```

**Diagnostic :**

```
Taux de collision = 90/100 = 90% (tres eleve !)

Sur les appels qui trouvent l'element (10 return), en moyenne
la recherche a fait 100/10 = 10 probes avant de trouver.
(En fait c'est un ratio moyen de probes par recherche reussie.)

Performance d'une table de hachage ideale : 
  Taux de collision ~= facteur de charge (alpha)
  Si alpha = 0.9, les 90% de collision sont normaux.
  Mais c'est trop : le temps de recherche explose.
```

**Recommandations :**

```
1. Reduire le facteur de charge :
   Doubler la taille de la table -> alpha passe de 0.9 a 0.45
   Collisions attendues : ~45% au lieu de 90%.

2. Ameliorer la fonction de hachage :
   Une mauvaise fonction cree des clusters de collisions.
   Utiliser le double hashing au lieu du linear probing.

3. Passer a une table avec chaining (listes chainees) :
   Les recherches ne modifient pas key, evitant le clustering.
```

---

## Exercice 6 : Loi de Gustafson -- parallelisme

**Enonce :** Un programme s'execute en 100s sequentiellement. 80% du code est parallelisable. Avec P processeurs, quel est le speedup ?

### Amdahl vs Gustafson

**Amdahl (taille fixe, plus de processeurs) :**

```
Speedup_Amdahl(P) = 1 / ((1 - p) + p/P)

Avec p = 0.80 :
  P=1  : Speedup = 1.00
  P=2  : Speedup = 1 / (0.20 + 0.40) = 1.667
  P=4  : Speedup = 1 / (0.20 + 0.20) = 2.500
  P=8  : Speedup = 1 / (0.20 + 0.10) = 3.333
  P=16 : Speedup = 1 / (0.20 + 0.05) = 4.000
  P=inf: Speedup = 1 / 0.20 = 5.000      <- LIMITE !
```

Avec Amdahl, on ne depassera jamais un speedup de 5 car 20% du code reste sequentiel.

**Gustafson (plus de processeurs, probleme plus gros) :**

```
Speedup_Gustafson(P) = P - alpha * (P - 1)

ou alpha = fraction sequentielle mesuree sur P processeurs.

Avec alpha = 0.20 :
  P=1  : Speedup = 1.00
  P=2  : Speedup = 2 - 0.20 * 1 = 1.80
  P=4  : Speedup = 4 - 0.20 * 3 = 3.40
  P=8  : Speedup = 8 - 0.20 * 7 = 6.40
  P=16 : Speedup = 16 - 0.20 * 15 = 13.00
  P=64 : Speedup = 64 - 0.20 * 63 = 51.40
```

Avec Gustafson, le speedup croit lineairement avec P (pas de limite fixe).

**Difference fondamentale :**
- **Amdahl** : on garde le meme probleme et on ajoute des processeurs. La partie sequentielle domine.
- **Gustafson** : on augmente la taille du probleme avec le nombre de processeurs. On fait plus de travail en parallele.

---

## Resume des formules

| Formule | Expression | Utilisation |
|---------|-----------|------------|
| Amdahl | 1 / ((1-p) + p/S) | Speedup d'une optimisation locale |
| Amdahl parallele | 1 / ((1-p) + p/P) | Speedup avec P processeurs |
| Gustafson | P - alpha*(P-1) | Speedup en scalant le probleme |
| Limite Amdahl | 1 / (1-p) | Speedup max (S -> inf) |

| Outil | Usage |
|-------|-------|
| gprof | Profiling : % temps par fonction, graphe d'appels |
| gcov | Couverture de code : nombre d'executions par ligne |
| Valgrind/callgrind | Profiling cache, memoire |
| perf | Compteurs hardware (cache misses, branch mispredictions) |
