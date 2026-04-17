---
title: "Chapitre 9 -- Analyse amortie"
sidebar_position: 9
---

# Chapitre 9 -- Analyse amortie

> L'analyse amortie mesure le cout moyen par operation sur une sequence, sans hypothese probabiliste. Elle montre que les operations couteuses sont rares.

---

## 1. Principe

L'analyse amortie s'interesse au **cout total** d'une sequence de n operations, puis divise par n pour obtenir le cout amorti par operation.

**Difference avec le cout moyen :**
- Cout moyen : necessite une distribution de probabilite sur les entrees
- Cout amorti : aucune hypothese probabiliste, c'est un pire cas sur la sequence

**Formellement :** Si le cout total de n operations est T(n), alors le cout amorti par operation est T(n)/n.

---

## 2. Methode agregee (aggregate)

**Principe :** Calculer le cout total de n operations, puis diviser par n.

### Exemple : compteur binaire

Un compteur de k bits. Incrementer peut changer plusieurs bits.

**Pire cas d'un increment :** O(k) (tous les bits changent, ex : 01111 -> 10000)

**Analyse amortie :** Sur n increments :
```
bit 0 change  n      fois
bit 1 change  n/2    fois
bit 2 change  n/4    fois
...
bit i change  n/2^i  fois
```

Total des changements :
```
sum_{i=0}^{k-1} n/2^i < n * sum_{i=0}^{inf} 1/2^i = 2n
```

**Cout amorti par increment : O(2n/n) = O(1)**

### Exemple : tableau dynamique

Quand un tableau est plein, on double sa taille (copie de tous les elements).

**Pire cas d'une insertion :** O(n) (recopie)

**Analyse amortie :** Sur n insertions :
```
Insertions normales : n * O(1) = O(n)
Copies lors des doublements : 1 + 2 + 4 + ... + n = 2n - 1

Total : O(n) + O(2n) = O(3n)
```

**Cout amorti par insertion : O(3n/n) = O(1)**

---

## 3. Methode comptable (accounting)

**Principe :** Assigner un cout amorti fixe a chaque operation. Les operations bon marche "epargnent" pour payer les operations couteuses.

**Contrainte :** Le solde du compte ne doit jamais etre negatif.

### Exemple : compteur binaire

- Cout reel de changer un bit : 1
- Cout amorti d'un increment : 2

Quand on met un bit a 1 : on depense 1 et on "epargne" 1 sur ce bit.
Quand on remet un bit a 0 : on utilise l'epargne.

Chaque increment met exactement 1 bit de 0 a 1 (le bit qui reste), et potentiellement remet des bits de 1 a 0 (payes par l'epargne).

**Cout amorti : 2 = O(1)**

### Exemple : tableau dynamique

- Cout amorti d'une insertion : 3
  - 1 pour l'insertion elle-meme
  - 1 epargne pour sa propre copie future
  - 1 epargne pour copier un element deja present

---

## 4. Methode du potentiel

**Principe :** Definir une fonction de potentiel Phi(D_i) sur la structure de donnees apres la i-eme operation. Le cout amorti est :

```
cout_amorti(i) = cout_reel(i) + Phi(D_i) - Phi(D_{i-1})
```

**Contrainte :** Phi(D_n) >= Phi(D_0) (en general Phi(D_0) = 0 et Phi >= 0)

Le cout total amorti somme telescopiquement :
```
sum cout_amorti = sum cout_reel + Phi(D_n) - Phi(D_0) >= sum cout_reel
```

### Exemple : compteur binaire

**Potentiel :** Phi = nombre de bits a 1.

Pour un increment qui remet t bits a 0 et met 1 bit a 1 :
```
cout_reel = t + 1
Delta Phi = 1 - t     (on perd t bits a 1, on en gagne 1)
cout_amorti = (t + 1) + (1 - t) = 2
```

**Cout amorti : O(1)**

### Exemple : tableau dynamique

**Potentiel :** Phi = 2 * nb_elements - taille_tableau

Quand on double la taille :
```
cout_reel = n + 1 (copier n elements + inserer)
Phi avant = 2n - n = n
Phi apres = 2(n+1) - 2n = 2
Delta Phi = 2 - n
cout_amorti = (n+1) + (2-n) = 3
```

---

## 5. Comparaison des trois methodes

| Methode | Principe | Avantage | Inconvenient |
|---------|---------|----------|-------------|
| Agregee | Cout total / n | Simple | Pas de detail par operation |
| Comptable | Epargne/depense | Intuitive | Trouver le bon cout amorti |
| Potentiel | Fonction d'etat | Puissante, formelle | Trouver la bonne fonction |

Les trois methodes donnent toujours le meme resultat. Le choix depend du probleme et de la clarte de l'argument.

---

## 6. Applications classiques

| Structure | Operation couteuse | Cout pire cas | Cout amorti |
|-----------|-------------------|---------------|-------------|
| Compteur binaire | Increment | O(k) | O(1) |
| Tableau dynamique | Insertion (doublement) | O(n) | O(1) |
| Pile avec multipop | Multipop(k) | O(k) | O(1) |
| Union-Find | Find (avec compression) | O(log n) | O(alpha(n)) ~ O(1) |
| Splay tree | Acces | O(n) | O(log n) |

---

## 7. Pieges classiques

1. **Confondre amorti et moyen** : L'analyse amortie ne fait aucune hypothese probabiliste. C'est un pire cas garanti sur la sequence.

2. **Potentiel negatif** : Si Phi(D_n) < Phi(D_0), le cout amorti ne majore plus le cout reel.

3. **Oublier que l'amorti est par operation** : Le cout amorti O(1) signifie que sur n operations, le total est O(n), meme si certaines operations individuelles coutent O(n).

---

## CHEAT SHEET -- Analyse amortie

```
DEFINITION :
  Cout amorti = cout total de n operations / n
  Aucune hypothese probabiliste (pire cas garanti)

TROIS METHODES :
  Agregee    : T(n)/n (calculer le total, diviser)
  Comptable  : assigner cout fixe, epargner le surplus
  Potentiel  : cout_amorti(i) = cout_reel(i) + Phi(D_i) - Phi(D_{i-1})

EXEMPLES CLASSIQUES :
  Compteur binaire : pire cas O(k), amorti O(1)
  Tableau dynamique : pire cas O(n), amorti O(1)
  Pile + multipop  : pire cas O(k), amorti O(1)

CLE :
  Les operations couteuses sont rares.
  L'epargne des operations bon marche paie les operations couteuses.
```
