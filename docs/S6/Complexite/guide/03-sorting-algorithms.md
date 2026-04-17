---
title: "Chapitre 3 -- Algorithmes de tri"
sidebar_position: 3
---

# Chapitre 3 -- Algorithmes de tri

> Les algorithmes de tri sont les exemples canoniques pour illustrer la complexite. Connaitre leurs complexites est un prerequis pour le reste du cours.

---

## 1. Table de reference des tris

| Algorithme | Meilleur | Moyen | Pire | Stable ? | En place ? | Paradigme |
|-----------|---------|-------|------|----------|-----------|-----------|
| Tri par insertion | O(n) | O(n^2) | O(n^2) | Oui | Oui | Incremental |
| Tri par selection | O(n^2) | O(n^2) | O(n^2) | Non | Oui | Incremental |
| Tri par fusion | O(n log n) | O(n log n) | O(n log n) | Oui | Non (O(n) extra) | DPR |
| Tri rapide | O(n log n) | O(n log n) | O(n^2) | Non | Oui | DPR |
| Tri par tas | O(n log n) | O(n log n) | O(n log n) | Non | Oui | Selection |
| Tri comptage | O(n+k) | O(n+k) | O(n+k) | Oui | Non | Non-comparaison |
| Tri par base (radix) | O(d*(n+k)) | O(d*(n+k)) | O(d*(n+k)) | Oui | Non | Non-comparaison |

---

## 2. Tris par comparaison

### 2.1 Tri par insertion

```python noexec
def tri_insertion(T):
    for i in range(1, len(T)):
        cle = T[i]
        j = i - 1
        while j >= 0 and T[j] > cle:
            T[j+1] = T[j]
            j -= 1
        T[j+1] = cle
```

**Analyse :**
- Meilleur cas (deja trie) : boucle while jamais executee => O(n)
- Pire cas (ordre inverse) : 1 + 2 + ... + (n-1) = n(n-1)/2 => O(n^2)

**Vu comme DPR desequilibre :** T(n) = T(n-1) + O(n) => O(n^2)

### 2.2 Tri par fusion (Merge Sort)

```python noexec
def tri_fusion(T, debut, fin):
    if debut < fin:
        mid = (debut + fin) // 2
        tri_fusion(T, debut, mid)
        tri_fusion(T, mid + 1, fin)
        fusionner(T, debut, mid, fin)    # O(n)
```

**Analyse :** T(n) = 2*T(n/2) + O(n) => O(n log n) par le theoreme maitre (a = b = 2).

Complexite O(n log n) dans **tous** les cas. Stable mais pas en place (necessite O(n) memoire supplementaire).

### 2.3 Tri rapide (Quicksort)

```python noexec
def tri_rapide(T, inf, sup):
    if inf < sup:
        pivot = partitionner(T, inf, sup)    # O(n)
        tri_rapide(T, inf, pivot - 1)
        tri_rapide(T, pivot + 1, sup)
```

**Analyse :**
- Cas moyen/meilleur : pivot au milieu => T(n) = 2T(n/2) + O(n) => O(n log n)
- Pire cas : pivot toujours min ou max => T(n) = T(n-1) + O(n) => O(n^2)

**Distinction fondamentale avec le tri fusion :**
- Tri fusion : travail a la **recombinaison** (fusion). Division O(1), combinaison O(n).
- Tri rapide : travail a la **division** (partitionnement). Division O(n), combinaison O(1).

### 2.4 Tri par tas (Heap Sort)

Construit un tas (max-heap), puis extrait le maximum n fois.
- Construction du tas : O(n)
- n extractions : n * O(log n)
- Total : O(n log n) dans tous les cas

---

## 3. Tris non comparatifs

### 3.1 Tri comptage (Counting Sort)
Pour des elements dans [0, k] :
- Complexite : O(n + k) en temps, O(k) en espace
- Stable, pas en place

### 3.2 Tri par base (Radix Sort)
Applique le tri comptage chiffre par chiffre, du moins significatif au plus significatif :
- Complexite : O(d * (n + k)) ou d = nombre de chiffres, k = base
- Pour des entiers bornes : effectivement O(n)

---

## 4. Borne inferieure pour les tris comparatifs

**Theoreme :** Tout algorithme de tri par comparaison effectue Omega(n log n) comparaisons dans le pire cas.

**Preuve (idee) :** L'arbre de decision a n! feuilles (permutations). Un arbre binaire de h niveaux a au plus 2^h feuilles. Donc :
```
2^h >= n!
h >= log_2(n!)
h >= n*log_2(n) - n*log_2(e)    (Stirling)
h = Omega(n log n)
```

**Consequence :** Tri fusion et tri par tas sont asymptotiquement optimaux parmi les tris comparatifs.

---

## 5. Reconnaitre un tri par sa trace (question de DS)

Le DS demande parfois d'identifier un algorithme a partir d'une trace d'execution :

| Indice | Tri |
|--------|-----|
| A chaque etape, un element est place a sa position finale en fin de tableau | Selection |
| A chaque etape, l'element est insere a sa place dans le sous-tableau trie gauche | Insertion |
| Le tableau est divise en deux, chaque moitie triee, puis fusionnee | Fusion |
| Un pivot est choisi, les elements sont partitionnes autour du pivot | Rapide |

---

## 6. Pieges classiques

1. **Dire que quicksort est O(n log n)** sans preciser "en moyenne". Son pire cas est O(n^2).

2. **Oublier que tri fusion n'est pas en place** : il utilise O(n) memoire supplementaire.

3. **Confondre stable et en place** : stable = elements egaux gardent leur ordre relatif. En place = O(1) memoire supplementaire.

4. **Croire que la borne inferieure O(n log n) s'applique a tous les tris** : elle ne s'applique qu'aux tris par comparaison. Les tris comptage/radix peuvent faire mieux.

---

## CHEAT SHEET -- Tris

```
TRIS COMPARATIFS :
  Insertion  : O(n) meilleur, O(n^2) pire    | stable, en place
  Selection  : O(n^2) toujours               | instable, en place
  Fusion     : O(n log n) toujours            | stable, PAS en place
  Rapide     : O(n log n) moyen, O(n^2) pire  | instable, en place
  Tas        : O(n log n) toujours            | instable, en place

BORNE INFERIEURE :
  Tout tri par comparaison : Omega(n log n) dans le pire cas

TRIS NON COMPARATIFS :
  Comptage : O(n + k)         | stable, pas en place
  Radix    : O(d * (n + k))   | stable, pas en place

DISTINCTION CLE :
  Fusion = travail a la combinaison (O(n) pour fusionner)
  Rapide = travail a la division (O(n) pour partitionner)
```
