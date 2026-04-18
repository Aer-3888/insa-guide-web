---
title: "Analyse de Complexite"
sidebar_position: 9
---

# Analyse de Complexite

## Notation Asymptotique

### Grand-O : O(f(n)) -- Borne Superieure

f(n) = O(g(n)) signifie qu'il existe des constantes c > 0 et n0 telles que :
  f(n) <= c * g(n) pour tout n >= n0

"f croit au plus aussi vite que g"

### Grand-Omega : Omega(f(n)) -- Borne Inferieure

f(n) = Omega(g(n)) signifie qu'il existe des constantes c > 0 et n0 telles que :
  f(n) >= c * g(n) pour tout n >= n0

"f croit au moins aussi vite que g"

### Grand-Theta : Theta(f(n)) -- Borne Exacte

f(n) = Theta(g(n)) signifie f(n) = O(g(n)) ET f(n) = Omega(g(n))

"f croit au meme rythme que g"


## Classes de Complexite Courantes

```
O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)

n=1000:
  O(1)        = 1
  O(log n)    = ~10
  O(n)        = 1 000
  O(n log n)  = ~10 000
  O(n^2)      = 1 000 000
  O(n^3)      = 1 000 000 000
  O(2^n)      = (astronomiquement grand)
```


## Complexite des Structures de Donnees du Cours SDD

### Liste Chainee

| Operation | Simple chainage | Double chainage (au curseur) |
|-----------|--------------|---------------------------|
| Acces au i-eme | O(n) | O(n) |
| Insertion au curseur | O(1) | O(1) |
| Suppression au curseur | O(n)* | O(1) |
| Recherche | O(n) | O(n) |
| Insertion en tete | O(1) | O(1) |
| Insertion en queue | O(n)** | O(1) |

*Necessite le predecesseur pour le simple chainage.
**O(1) si on maintient un pointeur de queue.

### Table de Hachage

| Operation | Cas moyen | Pire cas |
|-----------|---------|------------|
| Insertion | O(1) | O(n) |
| Recherche | O(1) | O(n) |
| Suppression | O(1) | O(n) |

Pire cas : toutes les cles ont le meme hash.
Cas moyen sous hypothese de hachage uniforme et facteur de charge alpha < 1.

### Arbre Binaire de Recherche

| Operation | Equilibre (AVL) | Pire cas (degenere) |
|-----------|---------------|-------------------|
| Recherche | O(log n) | O(n) |
| Insertion | O(log n) | O(n) |
| Suppression | O(log n) | O(n) |
| Parcours | O(n) | O(n) |

### Tas / File de Priorite

| Operation | Tas binaire |
|-----------|------------|
| Insertion (add) | O(log n) |
| Extraction min/max (poll) | O(log n) |
| Peek | O(1) |
| Construction du tas (heapify) | O(n) |
| Tri par tas | O(n log n) |

### Algorithmes sur les Graphes

| Algorithme | Temps | Espace |
|-----------|------|-------|
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |
| Dijkstra (tas) | O((V + E) log V) | O(V + E) |


## Analyse Amortie

### Concept

Certaines operations sont couteuses occasionnellement mais peu couteuses la plupart du temps. L'analyse amortie donne le **cout moyen par operation** sur une sequence dans le pire cas.

### Exemple : Tableau Dynamique (ArrayList)

Quand le tableau est plein, doubler sa capacite (copier tous les elements).

```
Couts des operations pour n insertions :
  Insert 1 :  cout 1
  Insert 2 :  cout 1 + 2 (copie)  = 3
  Insert 3 :  cout 1
  Insert 4 :  cout 1 + 4 (copie)  = 5
  Insert 5 :  cout 1
  ...
  Insert 8 :  cout 1 + 8 (copie)  = 9

Total pour n insertions : n + (1 + 2 + 4 + ... + n) = n + 2n - 1 < 3n
Cout amorti par insertion : O(3n/n) = O(1)
```

### Exemple : Rehachage de Table de Hachage

Quand le facteur de charge depasse le seuil, creer une table 2x plus grande et rehacher toutes les entrees.

```
n insertions avec doublement a alpha = 1 :
  Travail total : n + (1 + 2 + 4 + ... + n) = O(n)
  Cout amorti par insertion : O(1)
```


## Techniques de Preuve

### Prouver O(f(n))

1. Trouver des constantes c et n0 telles que T(n) <= c * f(n) pour tout n >= n0
2. En general : identifier le terme dominant et montrer qu'il borne T(n)

**Exemple** : T(n) = 3n^2 + 5n + 7 est O(n^2)

Preuve : Pour n >= 1 : 3n^2 + 5n + 7 <= 3n^2 + 5n^2 + 7n^2 = 15n^2
Donc c = 15, n0 = 1.

### Prouver Theta(f(n))

Il faut prouver a la fois O(f(n)) et Omega(f(n)).

**Exemple** : T(n) = 3n^2 + 5n + 7 est Theta(n^2)

Borne superieure : montre ci-dessus, O(n^2)
Borne inferieure : Pour n >= 1 : 3n^2 + 5n + 7 >= 3n^2, donc Omega(n^2) avec c = 3.

### Relations de Recurrence

De nombreux algorithmes arborescents ont des recurrences :

**Recherche dichotomique** : T(n) = T(n/2) + O(1) -> T(n) = O(log n)
**Tri fusion** : T(n) = 2T(n/2) + O(n) -> T(n) = O(n log n)
**Parcours d'arbre** : T(n) = T(k) + T(n-1-k) + O(1) -> T(n) = O(n)

### Theoreme Maitre

Pour T(n) = aT(n/b) + O(n^d) :

| Condition | Resultat |
|-----------|--------|
| d > log_b(a) | T(n) = O(n^d) |
| d = log_b(a) | T(n) = O(n^d * log n) |
| d < log_b(a) | T(n) = O(n^(log_b(a))) |


## Comparaison des Algorithmes de Tri

| Algorithme | Meilleur | Moyen | Pire | Espace | Stable ? |
|-----------|------|---------|-------|-------|---------|
| Tri a bulles | O(n) | O(n^2) | O(n^2) | O(1) | Oui |
| Tri par selection | O(n^2) | O(n^2) | O(n^2) | O(1) | Non |
| Tri par insertion | O(n) | O(n^2) | O(n^2) | O(1) | Oui |
| Tri fusion | O(n log n) | O(n log n) | O(n log n) | O(n) | Oui |
| Tri rapide | O(n log n) | O(n log n) | O(n^2) | O(log n) | Non |
| Tri par tas | O(n log n) | O(n log n) | O(n log n) | O(1) | Non |
| Tri par comptage | O(n+k) | O(n+k) | O(n+k) | O(k) | Oui |

Borne inferieure pour le tri par comparaison : Omega(n log n).


## Erreurs Courantes

1. **Confondre O et Theta** : O(n^2) ne signifie PAS exactement n^2 etapes
2. **Supprimer les constantes trop tot** : 100n est O(n) mais cela compte en pratique
3. **Ignorer l'amortissement** : ArrayList.add est O(1) amorti, pas dans le pire cas
4. **Mauvaise recurrence** : compter seulement les appels recursifs en oubliant le travail a chaque niveau
5. **Supposer un ABR equilibre** : un ABR desequilibre peut etre en O(n) pour toutes les operations


## AIDE-MEMOIRE

```
NOTATION :
  O(f)     : borne superieure  (au plus)
  Omega(f) : borne inferieure  (au moins)
  Theta(f) : borne exacte      (exactement)

TAUX DE CROISSANCE :
  1 < log n < sqrt(n) < n < n log n < n^2 < n^3 < 2^n < n!

COMPLEXITES CLEFS :
  Table de hachage :  O(1) moyen, O(n) pire cas
  ABR equilibre :     O(log n) toutes ops
  Tas add/poll :      O(log n)
  Construction tas :  O(n)
  Dijkstra :          O((V+E) log V)
  BFS/DFS :           O(V+E)
  Borne inf. tri :    Omega(n log n) par comparaison

AMORTI :
  Ajout tableau dynamique : O(1) amorti (strategie de doublement)
  Insertion table de hachage avec rehachage : O(1) amorti

THEOREME MAITRE : T(n) = aT(n/b) + O(n^d)
  d > log_b(a) => O(n^d)
  d = log_b(a) => O(n^d log n)
  d < log_b(a) => O(n^(log_b a))
```
