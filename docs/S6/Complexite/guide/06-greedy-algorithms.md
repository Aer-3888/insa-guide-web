---
title: "Chapitre 6 -- Algorithmes gloutons"
sidebar_position: 6
---

# Chapitre 6 -- Algorithmes gloutons

> A chaque etape, on fait le choix qui semble le meilleur sur le moment, sans jamais revenir en arriere.

---

## 1. Cadre general

Un probleme d'optimisation se compose de :
- Un **ensemble fini** E d'elements
- Des **solutions realisables** (parties de E satisfaisant les contraintes)
- Une **fonction objectif** a minimiser ou maximiser

L'algorithme glouton :
1. Fait un **choix definitif** a chaque etape (pas de retour arriere)
2. Choix guide par un **critere local** de selection
3. Verifie que la contrainte est toujours respectee

**Complexite typique :** O(n log n) -- domine par le tri initial.

---

## 2. Schema general (du cours)

```python
def chercher_glouton(i, X, S):
    y = choix(S[i])               # meilleur element selon critere local
    if predicat_partiel(X, i, y): # contrainte respectee ?
        X[i] = y
        if est_solution(X, i):    # solution complete ?
            return SUCCES
        else:
            return chercher_glouton(i+1, X, S)
    else:
        return ECHEC
```

---

## 3. Algorithmes gloutons exacts (optimaux)

### 3.1 Reservation de salles (Interval Scheduling)

**Probleme :** n activites avec debut/fin, planifier le maximum sans chevauchement.

**Critere glouton :** Trier par **heure de fin croissante**.

```python
def reservation_salles(activites):
    activites.sort(key=lambda a: a.fin)
    selection = [activites[0]]
    derniere_fin = activites[0].fin
    for a in activites[1:]:
        if a.debut >= derniere_fin:
            selection.append(a)
            derniere_fin = a.fin
    return selection
```

**Complexite :** O(n log n).

**Preuve d'optimalite (echange) :** En choisissant l'activite qui finit le plus tot, on laisse le maximum de place. On peut remplacer chaque choix d'une solution optimale par le choix glouton sans perdre.

### 3.2 Arbre couvrant minimal (MST)

**Kruskal :** Trier aretes par poids croissant, ajouter si pas de cycle (Union-Find).
```
Complexite : O(E log E)
```

**Prim :** Partir d'un sommet, ajouter l'arete de poids minimal vers un sommet hors de l'arbre.
```
Complexite : O(E log V) avec tas binaire
```

### 3.3 Plus courts chemins : Dijkstra

Depuis un sommet source, toujours explorer le sommet non visite le plus proche.
```
Complexite : O(V^2) ou O((V+E) log V) avec tas
```
Attention : ne fonctionne qu'avec des poids positifs.

### 3.4 Code de Huffman

Compresser un texte : les caracteres frequents ont des codes courts.
Fusionner toujours les deux noeuds de plus petite frequence.
```
Complexite : O(n log n)
```

### 3.5 Ordonnancement de taches (SJF)

n taches, minimiser le temps d'attente moyen. Strategie : trier par temps croissant.

---

## 4. Algorithmes gloutons inexacts (heuristiques)

| Probleme | Glouton | Pourquoi inexact |
|----------|---------|-----------------|
| Rendu de monnaie (pieces arbitraires) | Plus grosse piece d'abord | Pas optimal pour toutes les denominations |
| Traversee de matrice | Case adjacente minimale | Prog. dyn. donne le vrai optimum |
| Voyageur de commerce (TSP) | Ville la plus proche | Peut donner des tours tres sous-optimaux |
| Sac a dos | Ratio valeur/poids | Pas optimal pour sac a dos 0/1 |

**Utilite des heuristiques gloutonnes :**
- **Valeur initiale** pour Branch & Bound (indispensable pour elaguer)
- **Solution approchee** rapide pour les problemes NP-durs
- **Borne** pour l'elagage

---

## 5. Comment prouver l'optimalite

### Methode par echange

1. Prendre une solution optimale O differente de la solution gloutonne G
2. Montrer qu'on peut transformer O en une solution au moins aussi bonne et plus proche de G
3. Par induction, G est optimale

### Methode par contradiction

1. Supposer que G n'est pas optimale
2. Montrer que cela mene a une contradiction

---

## 6. Astuce DS : glouton puis prog. dyn.

**Regle d'or :** Si le sujet pose la question "le glouton est-il optimal ?" PUIS enchaine sur la programmation dynamique, c'est que le glouton n'est PAS optimal. Il faut donner un **contre-exemple**.

| Indice dans le sujet | Reponse probable |
|---------------------|-----------------|
| "L'algo glouton donne-t-il l'optimum ?" suivi de prog. dyn. | NON (donner contre-exemple) |
| "Prouver que l'algo glouton est optimal" | OUI (preuve par echange/contradiction) |

---

## 7. Pieges classiques

1. **Supposer le glouton optimal sans preuve** : Quelques exemples reussis ne prouvent rien.

2. **Mauvais critere glouton** : Pour la reservation de salles, trier par duree ne marche PAS. Trier par heure de fin est le bon critere.

3. **Confondre glouton et prog. dyn.** : Glouton = un seul choix par etape. Prog. dyn. = explore tout et garde le meilleur.

4. **Oublier que le glouton inexact est utile** : Meme non optimal, il fournit une bonne valeur initiale pour B&B.

---

## CHEAT SHEET -- Algorithmes gloutons

```
SCHEMA : A chaque etape, choix local optimal, sans retour arriere

COMPLEXITE TYPIQUE : O(n log n) (domine par le tri)

GLOUTONS EXACTS (optimaux) :
  Reservation salles : trier par fin croissante   O(n log n)
  Kruskal (MST)      : trier aretes poids croissant O(E log E)
  Prim (MST)         : arete min vers arbre         O(E log V)
  Dijkstra           : sommet non visite le + proche O((V+E) log V)
  Huffman            : fusionner plus petites freq.  O(n log n)
  Ordonnancement SJF : trier par temps croissant     O(n log n)

PREUVE D'OPTIMALITE :
  Methode par echange : transformer sol. optimale vers glouton sans degrader
  Methode par contradiction : supposer non-optimal => contradiction

ASTUCE DS :
  "Glouton optimal ?" + prog. dyn. apres => NON (contre-exemple)
  "Prouver l'optimalite du glouton" => OUI (preuve formelle)

GLOUTON INEXACT :
  Utile pour : valeur initiale B&B, solution approchee, borne
```
