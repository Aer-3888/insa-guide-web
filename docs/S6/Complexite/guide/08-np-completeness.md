---
title: "Chapitre 8 -- NP-Completude"
sidebar_position: 8
---

# Chapitre 8 -- NP-Completude

> Certains problemes n'ont (probablement) pas de solution efficace. Comprendre pourquoi est fondamental en informatique.

---

## 1. Classes de complexite

### Classe P
Ensemble des problemes de decision resolubles en temps **polynomial** par une machine de Turing deterministe.

Exemples : tri, plus court chemin, MST, 2-SAT.

### Classe NP
Ensemble des problemes de decision dont une solution peut etre **verifiee** en temps polynomial par une machine de Turing deterministe.

Equivalemment : problemes resolubles en temps polynomial par une machine de Turing **non deterministe** (qui peut "deviner" la bonne solution).

Exemples : SAT, voyageur de commerce (version decision), sac a dos.

### Classe NP-dur
Un probleme H est NP-dur si tout probleme dans NP se reduit polynomialement a H.

```
Pour tout L dans NP : L <=_p H
```

Un probleme NP-dur n'est pas forcement dans NP (peut ne pas etre un probleme de decision).

### Classe NP-complet
Un probleme est NP-complet s'il est :
1. Dans NP (verifiable en temps polynomial)
2. NP-dur (au moins aussi dur que tout probleme dans NP)

```
NP-complet = NP inter NP-dur
```

### Relations entre les classes

```
P  sous-ensemble de  NP  sous-ensemble de  EXPTIME

NP-complet = NP inter NP-dur

Si un seul probleme NP-complet est dans P, alors P = NP.
```

**La question ouverte P = NP ?** : On conjecture que P != NP (il existe des problemes dans NP qui ne sont pas dans P), mais personne n'a pu le prouver.

---

## 2. Reductions polynomiales

### Definition

A <=_p B (A se reduit polynomialement a B) signifie :
- Il existe une fonction f calculable en temps polynomial
- Telle que x est dans A ssi f(x) est dans B

### Implications

```
Si A <=_p B et B dans P, alors A dans P
Si A <=_p B et A est NP-dur, alors B est NP-dur
```

### Comment montrer qu'un probleme est NP-complet

1. Montrer qu'il est dans NP (decrire un certificat et un verificateur polynomial)
2. Montrer qu'il est NP-dur par reduction : prendre un probleme NP-complet connu et le reduire au nouveau probleme

---

## 3. Theoreme de Cook-Levin

**Enonce :** Le probleme SAT (satisfiabilite booleenne) est NP-complet.

C'est le premier probleme prouve NP-complet. Tous les autres sont prouves par reduction depuis SAT ou ses variantes.

**SAT :** Etant donne une formule booleenne en forme normale conjonctive (CNF), existe-t-il une affectation des variables qui la rend vraie ?

---

## 4. Problemes NP-complets classiques

| Probleme | Description | Reduction typique |
|----------|------------|-------------------|
| SAT | Satisfiabilite d'une formule CNF | (premier NP-complet, Cook-Levin) |
| 3-SAT | SAT ou chaque clause a exactement 3 litteraux | SAT <=_p 3-SAT |
| CLIQUE | Existe-t-il un sous-graphe complet de taille k ? | 3-SAT <=_p CLIQUE |
| VERTEX COVER | Peut-on couvrir toutes les aretes avec <= k sommets ? | CLIQUE <=_p VERTEX COVER |
| INDEPENDENT SET | Existe-t-il un ensemble independant de taille k ? | CLIQUE <=_p INDEPENDENT SET |
| HAMILTONIAN CYCLE | Existe-t-il un cycle passant par tous les sommets ? | VERTEX COVER <=_p HAM. CYCLE |
| TSP (decision) | Existe-t-il un tour de longueur <= k ? | HAM. CYCLE <=_p TSP |
| SUBSET SUM | Existe-t-il un sous-ensemble dont la somme = S ? | 3-SAT <=_p SUBSET SUM |
| KNAPSACK | Peut-on atteindre une valeur >= V avec poids <= W ? | SUBSET SUM <=_p KNAPSACK |
| GRAPH COLORING | Peut-on colorer le graphe avec <= k couleurs ? | 3-SAT <=_p 3-COLORING |
| PARTITION | Peut-on partitionner un ensemble en 2 de meme somme ? | SUBSET SUM <=_p PARTITION |

---

## 5. Strategies face aux problemes NP-complets

Quand un probleme est NP-complet, on ne peut pas esperer un algorithme polynomial exact. Strategies :

| Strategie | Description | Garantie |
|-----------|------------|----------|
| Algorithmes exacts exponentiels | Backtracking, B&B | Optimal mais lent |
| Algorithmes d'approximation | Solution garantie a facteur constant | O(poly) mais pas exact |
| Heuristiques | Glouton, recuit simule, genetique | Rapide, pas de garantie |
| Cas particuliers | Exploiter la structure (ex: graphe planaire) | Polynomial dans le cas restreint |
| Parametrisation | Algorithme FPT, polynomial si parametre fixe | Depends du parametre |

---

## 6. Techniques de reduction

### Structure d'une preuve de NP-completude

```
1. DANS NP :
   - Definir un certificat (la "solution" a verifier)
   - Montrer que le certificat est de taille polynomiale
   - Montrer que la verification se fait en temps polynomial

2. NP-DUR (par reduction) :
   - Choisir un probleme NP-complet connu (souvent 3-SAT)
   - Construire une transformation polynomiale f
   - Prouver : instance OUI du probleme connu <=> instance OUI du nouveau probleme
     (les deux directions !)
```

### Exemple : 3-SAT <=_p CLIQUE

**Transformation :** Pour une formule 3-SAT a m clauses :
- Pour chaque clause C_i = (l_1 v l_2 v l_3), creer 3 sommets v_{i,1}, v_{i,2}, v_{i,3}
- Ajouter une arete entre v_{i,j} et v_{k,l} ssi :
  - i != k (clauses differentes) ET
  - l_j et l_l ne sont pas complementaires

**Resultat :** La formule est satisfiable ssi le graphe a une clique de taille m.

---

## 7. Rapport avec le cours

Le cours de Maud Marchal traite surtout de l'exploration d'arbres et du Branch & Bound comme strategies pratiques face aux problemes NP-durs. Les reductions formelles sont moins centrales dans l'examen mais le concept est important :

- **Branch & Bound** : methode exacte pour les problemes NP-durs, avec elagage heuristique
- **Heuristiques gloutonnes** : solutions approchees rapides
- **Metaheuristiques** : recuit simule, algorithmes genetiques

---

## 8. Pieges classiques

1. **Confondre NP et "pas polynomial"** : NP ne signifie pas "Non-Polynomial". NP = "Non-deterministic Polynomial". P est un sous-ensemble de NP.

2. **Confondre NP-dur et NP-complet** : Tout NP-complet est NP-dur, mais pas l'inverse. Un probleme NP-dur peut ne pas etre dans NP (ex: probleme d'arret).

3. **Sens de la reduction** : Pour montrer que B est NP-dur, il faut reduire un probleme NP-complet A **vers** B (pas l'inverse !). A <=_p B.

4. **Oublier une direction de la preuve** : Une reduction doit marcher dans les deux sens : OUI => OUI et NON => NON.

---

## CHEAT SHEET -- NP-Completude

```
CLASSES :
  P         : resoluble en temps polynomial
  NP        : verifiable en temps polynomial
  NP-dur    : au moins aussi dur que tout pb dans NP
  NP-complet : dans NP ET NP-dur

REDUCTION A <=_p B :
  "A se reduit a B" = il existe f en temps poly telle que
  x in A  <=>  f(x) in B
  Si A NP-dur et A <=_p B, alors B NP-dur

PROUVER NP-COMPLET :
  1. Montrer dans NP (certificat + verification poly)
  2. Montrer NP-dur (reduire depuis un pb NP-complet connu)

COOK-LEVIN : SAT est le premier NP-complet

CHAINE DE REDUCTIONS CLASSIQUE :
  SAT -> 3-SAT -> CLIQUE -> VERTEX COVER -> HAM. CYCLE -> TSP
  SAT -> 3-SAT -> SUBSET SUM -> KNAPSACK -> PARTITION

FACE A UN PB NP-COMPLET :
  Exact exponentiel (B&B), approximation, heuristique, cas particulier
```
