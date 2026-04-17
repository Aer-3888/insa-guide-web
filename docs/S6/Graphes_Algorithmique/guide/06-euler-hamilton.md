---
title: "Chapitre 06 -- Euler et Hamilton"
sidebar_position: 6
---

# Chapitre 06 -- Euler et Hamilton

> **Idee centrale :** Euler = passer par chaque ARETE exactement une fois (condition simple : degres pairs). Hamilton = passer par chaque SOMMET exactement une fois (probleme NP-complet, pas de condition simple).

---

## 1. Cycles et chaines euleriens

### Definitions

- **Cycle eulerien** : cycle passant par chaque arete exactement une fois, revenant au depart.
- **Chaine eulerienne** : chaine passant par chaque arete exactement une fois (pas forcement fermee).

### Probleme des ponts de Koenigsberg (1736)

Euler a montre qu'il est impossible de traverser les 7 ponts de Koenigsberg chacun exactement une fois. C'est la naissance de la theorie des graphes.

---

## 2. Conditions d'existence (Theoreme d'Euler)

### Graphe non oriente

| Type | Condition |
|------|-----------|
| Cycle eulerien | Graphe connexe + TOUS les sommets de degre pair |
| Chaine eulerienne | Graphe connexe + exactement 0 ou 2 sommets de degre impair |

Si 0 sommet de degre impair : cycle eulerien (= chaine fermee).
Si 2 sommets de degre impair : chaine ouverte entre ces deux sommets.

### Pourquoi degre pair ?

Chaque passage par un sommet "consomme" 2 aretes (une pour entrer, une pour sortir). Si le degre est impair, il reste une arete sans partenaire et on est bloque.

### Graphe oriente

Un graphe oriente connexe admet un **circuit eulerien** ssi pour chaque sommet : d+(v) = d-(v).

### Exemple

```
Graphe :
    A ------- B
    |       / |
    |      /  |
    |     /   |
    C ------- D
    |         |
    E --------+

Degres : d(A)=2, d(B)=3, d(C)=3, d(D)=3, d(E)=2
Sommets de degre impair : B, C, D  (3 sommets)
3 est impair => PAS de cycle eulerien
3 != 0 et 3 != 2 => PAS de chaine eulerienne non plus

Modifions : ajoutons l'arete B-D
Degres : d(A)=2, d(B)=4, d(C)=3, d(D)=4, d(E)=2
Sommets de degre impair : C (1 seul)
1 != 0 et 1 != 2 => toujours pas

Ajoutons aussi C-E :
Degres : d(A)=2, d(B)=4, d(C)=4, d(D)=4, d(E)=4
Tous pairs => CYCLE EULERIEN existe !
```

---

## 3. Algorithme de Hierholzer

### Principe

Trouver un cycle, puis l'etendre en inserant des sous-cycles jusqu'a couvrir toutes les aretes.

### Pseudo-code

```
Hierholzer(G, v0):
    Trouver un cycle C en partant de v0
    (suivre des aretes non utilisees jusqu'a revenir a v0)

    Tant qu'il reste des aretes non utilisees:
        Choisir un sommet v de C ayant des aretes non utilisees
        Trouver un cycle C' en partant de v (aretes non utilisees)
        Inserer C' dans C a la position de v

    Retourner C
```

### Complexite : O(m)

### Exemple

```
Graphe "bowtie" (tous degres pairs) :

    A --- B
     \   /
      \ /
       C
      / \
     /   \
    D --- E

Aretes : A-B, A-C, B-C, C-D, C-E, D-E
6 aretes. d(C) = 4, d(A) = d(B) = d(D) = d(E) = 2. Tous pairs.

Application de Hierholzer depuis A :

Etape 1 : Trouver un cycle depuis A en suivant des aretes non utilisees.
  Cycle : A-B-C-A (aretes A-B, B-C, C-A)
  Restantes : C-D, C-E, D-E

Etape 2 : Chercher un sommet du cycle ayant des aretes restantes.
  C a des aretes restantes (C-D, C-E).
  Sous-cycle depuis C : C-D-E-C (aretes C-D, D-E, E-C)

Etape 3 : Inserer le sous-cycle dans le cycle principal a la position de C.
  Cycle principal : A-B-C-A
  Insertion : A-B-[C-D-E-C]-A = A-B-C-D-E-C-A

Verification :
  A-B(ok), B-C(ok), C-D(ok), D-E(ok), E-C(ok), C-A(ok).
  6 aretes = m = 6. Toutes utilisees exactement une fois.
  Depart et arrivee = A. CORRECT !
```

L'algorithme de Hierholzer fonctionne en O(m) et c'est l'algorithme de reference pour trouver un cycle eulerien.

---

## 4. Cycles et chemins hamiltoniens

### Definitions

- **Cycle hamiltonien** : cycle passant par chaque SOMMET exactement une fois.
- **Chemin hamiltonien** : chemin passant par chaque SOMMET exactement une fois (pas forcement ferme).

### Difference Euler vs Hamilton

| | Euler | Hamilton |
|---|---|---|
| Passe par chaque... | ARETE une fois | SOMMET une fois |
| Condition | Simple (degres pairs) | Tres difficile (NP-complet) |
| Algorithme | Hierholzer O(m) | Pas d'algo efficace |

---

## 5. Conditions suffisantes pour Hamilton

### Theoreme de Dirac (1952)

Si G graphe simple, n >= 3 sommets, et d(v) >= n/2 pour tout v, alors G a un cycle hamiltonien.

### Theoreme d'Ore (1960)

Si G graphe simple, n >= 3 sommets, et d(u) + d(v) >= n pour tout couple non adjacent (u,v), alors G a un cycle hamiltonien.

**ATTENTION :** Ce sont des conditions SUFFISANTES, pas necessaires. Un graphe peut etre hamiltonien sans les verifier.

### Conditions necessaires

- Le graphe doit etre connexe.
- Supprimer k sommets ne doit pas creer plus de k composantes.

### Exemple

```
Graphe de Petersen (10 sommets, 15 aretes, 3-regulier) :

Ce graphe n'est PAS hamiltonien (resultat classique).
d(v) = 3 < n/2 = 5 pour tout v => Dirac ne s'applique pas.
Il admet un chemin hamiltonien mais PAS de cycle hamiltonien.

C_5 (cycle de longueur 5) :
d(v) = 2, n/2 = 2.5. 2 < 2.5 => Dirac ne s'applique pas.
Pourtant C_5 est lui-meme un cycle hamiltonien !
=> Dirac est suffisant, PAS necessaire.

K_5 (5 sommets, 10 aretes) :
d(v) = 4 >= n/2 = 2.5 pour tout v.
Dirac s'applique => cycle hamiltonien garanti.
Exemple : A-B-C-D-E-A
```

---

## 6. Exemples de verification

### Verifier l'existence d'un cycle eulerien

```
Graphe G :
    1 --- 2 --- 3
    |   / |   / |
    |  /  |  /  |
    | /   | /   |
    4 --- 5 --- 6

Degres :
  d(1) = 2 (relie a 2, 4)
  d(2) = 4 (relie a 1, 3, 4, 5)
  d(3) = 3 (relie a 2, 5, 6)
  d(4) = 3 (relie a 1, 2, 5)
  d(5) = 4 (relie a 2, 3, 4, 6)
  d(6) = 2 (relie a 3, 5)

Sommets de degre impair : 3 et 4 (2 sommets)
=> Pas de cycle eulerien (il faudrait 0 sommets impairs)
=> MAIS chaine eulerienne existe (exactement 2 sommets impairs)
   Elle part de 3 (ou 4) et arrive a 4 (ou 3).

Chaine : 3-2-1-4-5-2-4-... non, revoyons.
Aretes : {1-2, 1-4, 2-3, 2-4, 2-5, 3-5, 3-6, 4-5, 5-6}
9 aretes.

Chaine eulerienne de 3 a 4 :
3-6-5-4-2-1-4... non, 4 deja visite comme sommet mais on peut
y repasser (Euler = aretes uniques, pas sommets).
3-6-5-2-1-4-5-3-2-4
Verifions : 3-6(ok), 6-5(ok), 5-2(ok), 2-1(ok), 1-4(ok),
4-5(ok), 5-3(ok), 3-2(ok), 2-4(ok). 9 aretes.
Debut=3, Fin=4. Correct !
```

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  EULER & HAMILTON -- RESUME                                      |
+------------------------------------------------------------------+
|                                                                  |
|  EULER (chaque ARETE une fois) :                                 |
|    Non oriente :                                                 |
|      Cycle eulerien : connexe + TOUS degres pairs               |
|      Chaine eulerienne : connexe + 0 ou 2 sommets degre impair  |
|    Oriente :                                                     |
|      Circuit eulerien : connexe + d+(v) = d-(v) pour tout v     |
|    Algorithme : Hierholzer O(m)                                  |
|                                                                  |
|  HAMILTON (chaque SOMMET une fois) :                             |
|    NP-complet, pas de condition simple                           |
|    Suffisant (pas necessaire) :                                  |
|      Dirac : d(v) >= n/2 pour tout v                             |
|      Ore : d(u)+d(v) >= n pour tout couple non adjacent          |
|    Necessaire :                                                  |
|      Graphe connexe                                              |
|      Supprimer k sommets => au plus k composantes               |
|                                                                  |
|  PIEGES :                                                        |
|    - Confondre eulerien (aretes) et hamiltonien (sommets)        |
|    - Dirac/Ore = SUFFISANTS, pas necessaires                     |
|    - Euler : verifier la connexite EN PLUS des degres            |
|    - Circuit eulerien (oriente) : d+ = d- (pas juste pairs)     |
+------------------------------------------------------------------+
```
