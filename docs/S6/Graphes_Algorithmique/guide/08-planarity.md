---
title: "Chapitre 08 -- Planarite"
sidebar_position: 8
---

# Chapitre 08 -- Planarite

> **Idee centrale :** Un graphe planaire peut etre dessine dans le plan sans croisement d'aretes. La formule d'Euler (n - m + f = 2) et le theoreme de Kuratowski sont les outils fondamentaux pour determiner la planarite.

---

## 1. Definitions

### Graphe planaire

Un graphe est **planaire** s'il peut etre dessine dans le plan de sorte que les aretes ne se croisent pas (sauf aux sommets).

Un tel dessin est appele une **representation planaire** ou **plongement planaire**.

```
K_4 est planaire (deux representations) :

Representation 1 :       Representation 2 :
    A --- B                   A
   / \ / \                   /|\
  D   X   C                / | \
   \ / \ /               B--+--C
    C --- D                  |
                             D

La seconde representation ne croise pas d'aretes.
```

### Faces

Dans une representation planaire, le plan est divise en **faces** (regions) :
- Les faces interieures (delimitees par des aretes)
- La face exterieure (infinie)

```
    A --- B
    |     |
    D --- C

Faces :
  f1 = face interieure (le carre ABCD)
  f2 = face exterieure (tout autour)
  Total : 2 faces
```

---

## 2. Formule d'Euler

### Enonce

Pour tout graphe planaire **connexe** :

```
n - m + f = 2
```

ou n = sommets, m = aretes, f = faces (y compris la face exterieure).

### Exemple

```
    A --- B
    |   / |
    |  /  |
    C --- D

n = 4, m = 5, f = ?
4 - 5 + f = 2  =>  f = 3

Faces : le triangle ABC, le triangle BCD, et la face exterieure.
Verification : 3 faces. Correct !
```

### Consequences importantes

**Pour un graphe planaire simple connexe avec n >= 3 :**

```
m <= 3n - 6
```

**Preuve :** Chaque face est delimitee par au moins 3 aretes. Chaque arete borde 2 faces. Donc 3f <= 2m, soit f <= 2m/3. Par Euler : n - m + f = 2, donc f = 2 - n + m. Substituant : 2 - n + m <= 2m/3, soit m <= 3n - 6.

**Pour un graphe planaire biparti connexe (pas de triangle) :**

```
m <= 2n - 4
```

(Chaque face est delimitee par au moins 4 aretes.)

---

## 3. Graphes non planaires : K_5 et K_{3,3}

### K_5 n'est pas planaire

K_5 : n=5, m=10. Verifier : 10 <= 3(5) - 6 = 9. FAUX !
Donc K_5 n'est pas planaire.

```
K_5 :
    A --- B
    |\ /|\ 
    | X | X
    |/ \|/ 
    C --- D
       |
       E

10 aretes > 9 = 3*5-6
=> NON PLANAIRE
```

### K_{3,3} n'est pas planaire

K_{3,3} : n=6, m=9. Test m <= 3n-6 : 9 <= 12. OK, le test ne conclut pas.

Mais K_{3,3} est biparti (pas de triangle). Test m <= 2n-4 : 9 <= 8. FAUX !
Donc K_{3,3} n'est pas planaire.

```
K_{3,3} :
  Groupe 1 : {A, B, C}
  Groupe 2 : {X, Y, Z}
  Chaque sommet relie a chaque sommet de l'autre groupe.
  9 aretes > 8 = 2*6-4
  => NON PLANAIRE
```

---

## 4. Theoreme de Kuratowski (1930)

### Enonce

Un graphe est planaire si et seulement si il ne contient aucun sous-graphe qui soit une subdivision de K_5 ou de K_{3,3}.

### Subdivision

Une **subdivision** d'un graphe H est obtenue en remplacant certaines aretes par des chemins (en ajoutant des sommets intermediaires sur les aretes).

```
Arete originale :     Subdivision :
    A --- B            A --- X --- Y --- B

K_5 subdivise :
    A ---- B
    |\ ---/|
    | X   |
    |/ \--|
    C - Y - D
        |
        E

Si un graphe contient une telle structure, il n'est pas planaire.
```

### Version alternative : Theoreme de Wagner

Un graphe est planaire ssi il ne contient aucun mineur isomorphe a K_5 ou K_{3,3}.

Un **mineur** est obtenu par contraction d'aretes (fusionner deux sommets adjacents) et suppression d'aretes/sommets.

---

## 5. Methode pratique pour tester la planarite

### Etape 1 : Tests rapides

1. m <= 3n - 6 ? Si non => non planaire.
2. Si biparti : m <= 2n - 4 ? Si non => non planaire.
3. Si oui aux deux => on ne peut pas conclure directement.

### Etape 2 : Chercher K_5 ou K_{3,3}

Chercher un sous-graphe qui soit une subdivision de K_5 ou K_{3,3}.

### Etape 3 : Essayer de dessiner

Si les tests ne concluent pas, essayer de trouver une representation planaire.

### Exemples

```
Graphe de Petersen (10 sommets, 15 aretes) :
  m = 15, 3n - 6 = 24. 15 <= 24 OK.
  Mais le graphe de Petersen contient K_{3,3} en subdivision.
  => Non planaire.

Cube Q_3 (8 sommets, 12 aretes) :
  m = 12, 3n - 6 = 18. 12 <= 18 OK.
  Q_3 est biparti : m = 12, 2n - 4 = 12. 12 <= 12 OK.
  En fait Q_3 est planaire (on peut le dessiner sans croisement).
```

---

## 6. Graphes planaires et coloration

Le theoreme des 4 couleurs s'applique aux graphes planaires :

```
Planaire => chi(G) <= 4
```

Plus facile a demontrer : tout graphe planaire est 5-colorable (chi <= 5).

### Preuve du theoreme des 5 couleurs (schema)

Par recurrence sur n. On utilise le fait qu'un graphe planaire a toujours un sommet de degre <= 5 (consequence de m <= 3n - 6).

---

## 7. Formule d'Euler : exemples de calcul

### Exemple 1 : Calculer le nombre de faces

```
Graphe planaire connexe :
    A --- B --- C
    |   /   \   |
    |  /     \  |
    D -------- E

n = 5, m = 7
f = 2 - n + m = 2 - 5 + 7 = 4 faces
```

### Exemple 2 : Prouver la non-planarite

```
Graphe avec n = 8, m = 19 :
3n - 6 = 18.  19 > 18 => NON PLANAIRE.
```

### Exemple 3 : Graphe planaire avec composantes

Pour un graphe planaire avec p composantes connexes :

```
n - m + f = 1 + p
```

---

## CHEAT SHEET

```
+------------------------------------------------------------------+
|  PLANARITE -- RESUME                                             |
+------------------------------------------------------------------+
|                                                                  |
|  PLANAIRE = dessinable sans croisement d'aretes                  |
|                                                                  |
|  FORMULE D'EULER (connexe) :                                     |
|    n - m + f = 2                                                 |
|    f = faces, y compris la face EXTERIEURE                       |
|                                                                  |
|  CONSEQUENCES :                                                  |
|    m <= 3n - 6      (graphe simple, n >= 3)                      |
|    m <= 2n - 4      (graphe biparti, n >= 3)                     |
|                                                                  |
|  GRAPHES NON PLANAIRES :                                         |
|    K_5 : 10 > 9 = 3*5-6                                         |
|    K_{3,3} : 9 > 8 = 2*6-4                                      |
|                                                                  |
|  KURATOWSKI :                                                    |
|    Planaire ssi pas de subdivision de K_5 ou K_{3,3}             |
|                                                                  |
|  COLORATION :                                                    |
|    Planaire => chi <= 4 (theoreme des 4 couleurs)                |
|    Planaire => chi <= 5 (plus facile a prouver)                  |
|                                                                  |
|  METHODE EN DS :                                                 |
|    1. Tester m <= 3n-6 (et m <= 2n-4 si biparti)                |
|    2. Si depasse => non planaire                                 |
|    3. Sinon : chercher K_5 ou K_{3,3} en subdivision            |
|    4. Ou essayer de dessiner sans croisement                     |
|                                                                  |
|  PIEGES :                                                        |
|    - Face exterieure COMPTE dans f                               |
|    - m <= 3n-6 est necessaire, pas suffisant                     |
|    - K_{3,3} passe le test 3n-6 mais echoue a 2n-4              |
|    - Euler : graphe doit etre CONNEXE                            |
|    - Avec p composantes : n - m + f = 1 + p                     |
+------------------------------------------------------------------+
```
