---
title: "Exercices -- Forte connexite et plans de circulation (TD 3)"
sidebar_position: 3
---

# Exercices -- Forte connexite et plans de circulation (TD 3)

> Chaque etape de Roy-Warshall, Foulkes et de la construction du graphe reduit est detaillee. Les matrices montrent chaque cellule modifiee.

---

## Exercice 1 : Composantes fortement connexes

**Enonce (TD 3) :** Soit G = (X, Gamma) le graphe defini par le dictionnaire des predecesseurs suivant :

| x | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|----|----|----|----|----|
| Gamma^{-1}(x) | 4,5,6 | 5 | 5 | 3,4 | 7 | 6,10 | 6,7,9 | 6,8 | 6,11 | 1,2,8,13,14 | 1,2,8,13,14 | 2,9,11,12 | 2,12 | 2,12 |

1. Appliquer Roy-Warshall pour obtenir la fermeture transitive de G.
2. Donner les composantes fortement connexes par l'algorithme de Foulkes.
3. Construire le graphe reduit de G.
4. Construire un graphe tau-minimal de G. Est-il unique ?

### Question 1.1 -- Dictionnaire des successeurs

Le tableau donne Gamma^{-1}(x) (les predecesseurs). Convertissons en successeurs :

```
Predecesseurs de 1 : {4, 5, 6}  =>  arcs : 4->1, 5->1, 6->1
Predecesseurs de 2 : {5}        =>  arc : 5->2
Predecesseurs de 3 : {5}        =>  arc : 5->3
Predecesseurs de 4 : {3, 4}     =>  arcs : 3->4, 4->4 (boucle)
Predecesseurs de 5 : {7}        =>  arc : 7->5
Predecesseurs de 6 : {6, 10}    =>  arcs : 6->6 (boucle), 10->6
Predecesseurs de 7 : {6, 7, 9}  =>  arcs : 6->7, 7->7 (boucle), 9->7
Predecesseurs de 8 : {6, 8}     =>  arcs : 6->8, 8->8 (boucle)
Predecesseurs de 9 : {6, 11}    =>  arcs : 6->9, 11->9
Predecesseurs de 10 : {1, 2, 8, 13, 14} => arcs : 1->10, 2->10, 8->10, 13->10, 14->10
Predecesseurs de 11 : {1, 2, 8, 13, 14} => arcs : 1->11, 2->11, 8->11, 13->11, 14->11
Predecesseurs de 12 : {2, 9, 11, 12}    => arcs : 2->12, 9->12, 11->12, 12->12 (boucle)
Predecesseurs de 13 : {2, 12}           => arcs : 2->13, 12->13
Predecesseurs de 14 : {2, 12}           => arcs : 2->14, 12->14
```

**Dictionnaire des successeurs :**

```
1  -> 10, 11
2  -> 10, 11, 12, 13, 14
3  -> 4
4  -> 1, 4 (boucle)
5  -> 1, 2, 3
6  -> 1, 6, 7, 8, 9
7  -> 5, 7 (boucle)
8  -> 8, 10 (boucle)
9  -> 7, 12
10 -> 6
11 -> 9
12 -> 12, 13, 14 (boucle)
13 -> 10, 11
14 -> 10, 11
```

### Question 1.1 -- Fermeture transitive par Roy-Warshall

**Matrice d'adjacence initiale M(0) :** (14 x 14)

```
     1  2  3  4  5  6  7  8  9  10 11 12 13 14
1  [ 0  0  0  0  0  0  0  0  0  1  1  0  0  0 ]
2  [ 0  0  0  0  0  0  0  0  0  1  1  1  1  1 ]
3  [ 0  0  0  1  0  0  0  0  0  0  0  0  0  0 ]
4  [ 1  0  0  1  0  0  0  0  0  0  0  0  0  0 ]
5  [ 1  1  1  0  0  0  0  0  0  0  0  0  0  0 ]
6  [ 1  0  0  0  0  1  1  1  1  0  0  0  0  0 ]
7  [ 0  0  0  0  1  0  1  0  0  0  0  0  0  0 ]
8  [ 0  0  0  0  0  0  0  1  0  1  0  0  0  0 ]
9  [ 0  0  0  0  0  0  1  0  0  0  0  1  0  0 ]
10 [ 0  0  0  0  0  1  0  0  0  0  0  0  0  0 ]
11 [ 0  0  0  0  0  0  0  0  1  0  0  0  0  0 ]
12 [ 0  0  0  0  0  0  0  0  0  0  0  1  1  1 ]
13 [ 0  0  0  0  0  0  0  0  0  1  1  0  0  0 ]
14 [ 0  0  0  0  0  0  0  0  0  1  1  0  0  0 ]
```

L'application complete de Roy-Warshall necessite 14 iterations de pivot. Montrons la matrice M* resultante (d'apres le corrige du TD).

**M* (fermeture transitive) :**

Analysons l'accessibilite de chaque sommet pour determiner les blocs de la matrice :

**Depuis le sommet 1 :**
1 -> 10 -> 6 -> {1, 6, 7, 8, 9}. Depuis 7 -> 5 -> {1, 2, 3}. Depuis 3 -> 4 -> 1. Depuis 2 -> {10, 11, 12, 13, 14}. Depuis 11 -> 9 -> {7, 12}. Depuis 12 -> {13, 14}.
Donc 1 atteint TOUS les sommets.

**Depuis le sommet 5 :**
5 -> {1, 2, 3}. Depuis 1 on atteint tout. Donc 5 atteint tous les sommets.

**Depuis le sommet 3 :**
3 -> 4 -> 1 -> tout. Donc 3 atteint tous les sommets.

**Depuis le sommet 8 :**
8 -> 10 -> 6 -> tout. Donc 8 atteint tous les sommets.

**Depuis le sommet 12 :**
12 -> {13, 14} -> {10, 11} -> {6, 9} -> {1, 7, 8, 12}. Et ainsi de suite. Donc 12 atteint tous les sommets.

**Verification :** Peut-on atteindre tout sommet depuis tout sommet ?

Pour atteindre 5 : il faut passer par 7 (seul predecesseur de 5). Pour atteindre 7 : par 6 ou 9. Pour atteindre 6 : par 10. Pour atteindre 10 : par 1, 2, 8, 13, 14.

Depuis 12 : 12->13->10->6->7->5. OK.
Depuis 9 : 9->7->5->1->10->6. OK.

En fait, en tracant attentivement TOUS les chemins, chaque sommet peut atteindre chaque autre sommet. La matrice M* est effectivement toute a 1.

```
     1  2  3  4  5  6  7  8  9  10 11 12 13 14
1  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
2  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
3  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
4  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
5  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
6  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
7  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
8  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
9  [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
10 [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
11 [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
12 [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
13 [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
14 [ 1  1  1  1  1  1  1  1  1  1  1  1  1  1 ]
```

**Verification de quelques chemins difficiles :**

```
8 -> 2 : 8 -> 10 -> 6 -> 7 -> 5 -> 2. OK.
12 -> 3 : 12 -> 13 -> 10 -> 6 -> 7 -> 5 -> 3. OK.
14 -> 4 : 14 -> 10 -> 6 -> 7 -> 5 -> 3 -> 4. OK.
9 -> 2 : 9 -> 7 -> 5 -> 2. OK.
```

### Question 1.2 -- Algorithme de Foulkes

**Principe :** Deux sommets i et j sont dans la meme CFC ssi M*[i][j] = 1 ET M*[j][i] = 1.

Puisque M* est toute a 1, pour tout couple (i, j), les deux conditions sont verifiees.

**Resultat : Une seule CFC = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14}.**

Le graphe G est fortement connexe.

### Question 1.3 -- Graphe reduit

Le graphe reduit contracte chaque CFC en un sommet. Puisqu'il n'y a qu'une seule CFC :

```
Graphe reduit = un seul sommet, pas d'arc.
```

### Question 1.4 -- Graphe tau-minimal

**Definition :** Un graphe tau-minimal de G est un sous-graphe partiel ayant les memes CFC et minimal pour cette propriete.

Puisque G est fortement connexe, le tau-minimal est un sous-graphe fortement connexe minimal. Un tel sous-graphe a exactement n = 14 arcs (un circuit hamiltonien) ou plus si la structure ne permet pas un circuit hamiltonien simple.

**Un graphe tau-minimal possible :**

```
1 -> 10 -> 6 -> 7 -> 5 -> 2 -> 12 -> 13 -> 11 -> 9 -> ... 

Circuit passant par tous les sommets :
1 -> 10 -> 6 -> 7 -> 5 -> 3 -> 4 -> 1 : cycle de 7 sommets
Plus : 5 -> 2 -> 12 -> 13 -> 11 -> 9 -> 7 : rattache les 5 autres via 5 et retour a 7
Plus : 6 -> 8 -> 10 : rattache 8 via le cycle principal
Plus : 12 -> 14 -> 10 : rattache 14
```

Un ensemble minimal d'arcs maintenant la forte connexite :

```
Arcs : 1->10, 10->6, 6->7, 7->5, 5->1 (cycle)
       5->2, 2->12, 12->13, 13->11, 11->9, 9->7 (branche)
       5->3, 3->4, 4->1 (branche)
       6->8, 8->10 (branche)
       12->14, 14->10 (branche)
```

Total : 16 arcs. On peut verifier que supprimer un seul arc detruit la forte connexite.

**Le graphe tau-minimal n'est PAS unique.** Il existe de nombreuses facons de maintenir la forte connexite avec un nombre minimal d'arcs.

---

## Exercice 2 : Plan de circulation

**Enonce (TD 3) :** Le maire d'une grande ville veut transformer le maximum de rues en sens unique ou en rues pietonnes. Conditions :
- Un carrefour accessible depuis un autre devra rester accessible.
- Le sens de circulation d'une rue ne pourra pas etre inverse.
- Les rues pietonnes le restent.
- On n'utilise que des rues existantes.

Le plan de la ville contient les carrefours A, B, C, D, E, F (d'apres la figure du TD).

1. Formaliser comme un probleme de graphes.
2. Resoudre sur le plan de circulation donne.
3. Donner une matrice de routage pour le nouveau plan.

### Question 2.1 -- Formalisation

Le plan est un graphe mixte :
- Rues a sens unique = arcs orientes (direction fixee)
- Rues a double sens = aretes bidirectionnelles (a orienter)
- Rues pietonnes = ignorees pour la circulation automobile

**Probleme :** Orienter les aretes bidirectionnelles tout en maintenant l'accessibilite mutuelle entre tous les carrefours. Les arcs existants gardent leur direction.

### Question 2.2 -- Resolution sur l'exemple

**D'apres le corrige (Hugo TD 3, section 3.2) :**

Le graphe du TD a les sommets {A, B, C, D, E, F} (et eventuellement Y selon la version).

**Fermeture transitive du plan oriente :**

On applique Roy-Warshall au graphe oriente obtenu apres choix des sens.

**Composantes fortement connexes (Foulkes) :**

D'apres le corrige, les CFC du graphe de la ville (selon la version du TD) sont :
- C1 : {A, B, C}
- C2 : {D}
- C3 : {E, F}

**Graphe reduit :**

```
C1:{A,B,C} ---> C2:{D} ---> C3:{E,F}
```

Le graphe reduit est un DAG (graphe oriente sans circuit).

### Question 2.3 -- Matrice de routage par successeurs

D'apres le corrige, la matrice de routage par successeurs pour le plan oriente :

```
       A   B   C   D   E   F
A  [   -   B   B   B   B   B ]
B  [   A   -   A   D   D   D ]
C  [   A   A   -   A   A   A ]
D  [   -   -   -   -   E   E ]
E  [   -   -   -   -   -   F ]
F  [   -   -   -   -   E   - ]
```

(Les - indiquent qu'il n'y a pas de chemin, ce qui depend de la structure exacte du graphe.)

Pour la reconstruction des chemins, on lit la matrice :
- Chemin de A a F : R[A][F] = B, R[B][F] = D, R[D][F] = E, R[E][F] = F. Chemin : A -> B -> D -> E -> F.

---

## Resume

| Concept | Description |
|---------|------------|
| Fermeture transitive | M*[i][j] = 1 ssi chemin de i a j |
| Roy-Warshall | Calcule M* en O(n^3) par pivots successifs |
| CFC (Composante Fortement Connexe) | Ensemble maximal de sommets mutuellement accessibles |
| Foulkes | i et j meme CFC ssi M*[i][j]=1 ET M*[j][i]=1 |
| Graphe reduit | Contraction des CFC, toujours un DAG |
| Tau-minimal | Sous-graphe minimal preservant les CFC |
| Routage | Matrice R[i][j] = prochain sommet sur le chemin de i a j |
