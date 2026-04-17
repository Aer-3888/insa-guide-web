---
title: "Exercices -- Formes normales (FNC et FND)"
sidebar_position: 2
---

# Exercices -- Formes normales (FNC et FND)

---

## Exercice 1 : Mise en FNC -- methode algebrique

### Enonce
Mettre en FNC : `(p <-> q) -> r`

### Solution detaillee

**Etape 1 : Eliminer les equivalences (<->)**
```
(p <-> q) -> r
= ((p -> q) /\ (q -> p)) -> r       [definition de <-> : A <-> B = (A -> B) /\ (B -> A)]
```

**Etape 2 : Eliminer les implications (->)**
```
= ((~p \/ q) /\ (~q \/ p)) -> r     [elimination de -> : A -> B = ~A \/ B, appliquee aux deux implications internes]
= ~((~p \/ q) /\ (~q \/ p)) \/ r    [elimination de -> sur l'implication principale]
```

**Etape 3 : Descendre les negations (De Morgan + double negation)**
```
~((~p \/ q) /\ (~q \/ p))
= ~(~p \/ q) \/ ~(~q \/ p)          [De Morgan sur /\ : ~(A /\ B) = ~A \/ ~B]
= (~~p /\ ~q) \/ (~~q /\ ~p)        [De Morgan sur \/ : ~(A \/ B) = ~A /\ ~B, appliquee deux fois]
= (p /\ ~q) \/ (q /\ ~p)            [double negation : ~~p = p et ~~q = q]
```

Donc la formule est maintenant :
```
(p /\ ~q) \/ (q /\ ~p) \/ r
```

**Etape 4 : Distribuer le \/ sur le /\ pour obtenir un ET de OU**

Sous-etape 4a : Distribuer `(p /\ ~q) \/ (q /\ ~p)`.

On doit transformer ce OU de deux ET en un ET de OU. On distribue :
```
(p /\ ~q) \/ (q /\ ~p)
```
Posons A=p, B=~q, C=q, D=~p. On distribue `(A /\ B) \/ (C /\ D)` :
```
= (A \/ C) /\ (A \/ D) /\ (B \/ C) /\ (B \/ D)
= (p \/ q) /\ (p \/ ~p) /\ (~q \/ q) /\ (~q \/ ~p)
```

Simplifions :
```
p \/ ~p = V                          [complement]
~q \/ q = V                          [complement]
```

Donc :
```
= (p \/ q) /\ V /\ V /\ (~p \/ ~q)
= (p \/ q) /\ (~p \/ ~q)            [element neutre : X /\ V = X]
```

Sous-etape 4b : On a maintenant `((p \/ q) /\ (~p \/ ~q)) \/ r`. Il faut distribuer le \/ r sur le /\ :
```
((p \/ q) /\ (~p \/ ~q)) \/ r
= ((p \/ q) \/ r) /\ ((~p \/ ~q) \/ r)   [distributivite : (A /\ B) \/ C = (A \/ C) /\ (B \/ C)]
= (p \/ q \/ r) /\ (~p \/ ~q \/ r)        [associativite de \/]
```

**Resultat FNC :**
```
(p \/ q \/ r) /\ (~p \/ ~q \/ r)
```

**Verification :** C'est un ET de deux clauses. Chaque clause est un OU de litteraux. C'est bien une FNC.

---

## Exercice 2 : Mise en FND -- methode algebrique

### Enonce
Mettre en FND : `(p -> q) /\ r`

### Solution detaillee

**Etape 1 : Pas d'equivalence (<->).** Rien a faire.

**Etape 2 : Eliminer les implications (->)**
```
(p -> q) /\ r
= (~p \/ q) /\ r                    [elimination de -> : p -> q = ~p \/ q]
```

**Etape 3 : Descendre les negations.**
La negation ~p porte deja sur un seul litteral. Rien a faire.

**Etape 4 : Distribuer le /\ sur le \/ (pour FND)**

On doit transformer ce ET qui contient un OU interne en un OU de ET :
```
(~p \/ q) /\ r
= (~p /\ r) \/ (q /\ r)             [distributivite de /\ sur \/ : (A \/ B) /\ C = (A /\ C) \/ (B /\ C)]
```

**Resultat FND :**
```
(~p /\ r) \/ (q /\ r)
```

**Verification :** C'est un OU de deux monomes. Chaque monome est un ET de litteraux. C'est bien une FND.

**Lecture :** La formule est vraie quand (p est faux ET r est vrai) OU (q est vrai ET r est vrai).

---

## Exercice 3 : FNC et FND par table de verite

### Enonce
Trouver la FNC et la FND de `p <-> q`.

### Solution detaillee

**Etape 1 : Construire la table de verite.**

| p | q | p <-> q |
|---|---|---------|
| V | V | **V**   |
| V | F | **F**   |
| F | V | **F**   |
| F | F | **V**   |

**Etape 2 : Construire la FND (a partir des lignes ou la formule vaut V).**

Regles : pour chaque ligne a V, construire un monome :
- Variable a V dans la ligne -> la variable telle quelle
- Variable a F dans la ligne -> la negation de la variable

Lignes a V : ligne 1 et ligne 4.

- **Ligne 1** (p=V, q=V) : monome = `p /\ q`
  - p est a V, donc on met p
  - q est a V, donc on met q
  - Monome : p /\ q

- **Ligne 4** (p=F, q=F) : monome = `~p /\ ~q`
  - p est a F, donc on met ~p
  - q est a F, donc on met ~q
  - Monome : ~p /\ ~q

Relier les monomes par OU :

```
FND = (p /\ q) \/ (~p /\ ~q)
```

**Etape 3 : Construire la FNC (a partir des lignes ou la formule vaut F).**

Regles : pour chaque ligne a F, construire une clause :
- Variable a V dans la ligne -> la NEGATION de la variable
- Variable a F dans la ligne -> la variable telle quelle

(Attention : c'est l'inverse de la FND ! On nie les variables pour "bloquer" la combinaison qui rend la formule fausse.)

Lignes a F : ligne 2 et ligne 3.

- **Ligne 2** (p=V, q=F) : clause = `~p \/ q`
  - p est a V, donc on met ~p (on nie)
  - q est a F, donc on met q (on garde tel quel)
  - Clause : ~p \/ q

- **Ligne 3** (p=F, q=V) : clause = `p \/ ~q`
  - p est a F, donc on met p
  - q est a V, donc on met ~q
  - Clause : p \/ ~q

Relier les clauses par ET :

```
FNC = (~p \/ q) /\ (p \/ ~q)
```

**Verification :** Les deux formes sont equivalentes a `p <-> q`. On retrouve que :
- `p <-> q = (~p \/ q) /\ (p \/ ~q)` (FNC)
- `p <-> q = (p /\ q) \/ (~p /\ ~q)` (FND)

Ce sont les deux decompositions standard de l'equivalence logique.

---

## Exercice 4 : Mise en FNC -- formule avec negation externe

### Enonce
Mettre en FNC : `~((p \/ q) -> (p /\ q))`

### Solution detaillee

**Etape 1 : Pas d'equivalence.** Rien a faire.

**Etape 2 : Eliminer l'implication.**
```
~((p \/ q) -> (p /\ q))
= ~(~(p \/ q) \/ (p /\ q))          [elimination de -> : A -> B = ~A \/ B]
```

**Etape 3 : Descendre la negation externe.**

Appliquer De Morgan sur le \/ interne :
```
= ~~(p \/ q) /\ ~(p /\ q)           [De Morgan : ~(A \/ B) = ~A /\ ~B, mais ici c'est ~(~X \/ Y) = ~~X /\ ~Y]
```

Attendons -- soyons plus precis. On a `~(~(p \/ q) \/ (p /\ q))`. C'est une negation d'un OU. Appliquons De Morgan :
```
= ~~(p \/ q) /\ ~(p /\ q)           [De Morgan sur \/ : ~(A \/ B) = ~A /\ ~B]
= (p \/ q) /\ ~(p /\ q)             [double negation : ~~X = X]
= (p \/ q) /\ (~p \/ ~q)            [De Morgan sur /\ : ~(A /\ B) = ~A \/ ~B]
```

**Etape 4 :** C'est deja en FNC ! Verifions :
- Connecteur principal : /\ (ET)
- Chaque facteur est un OU de litteraux :
  - `p \/ q` est une clause
  - `~p \/ ~q` est une clause

**Resultat FNC :**
```
(p \/ q) /\ (~p \/ ~q)
```

**Remarque :** Cette formule represente le OU exclusif (XOR). Elle est vraie quand exactement un des deux (p ou q) est vrai, mais pas les deux.

**Verification par table de verite :**

| p | q | p \/ q | ~p \/ ~q | (p \/ q) /\ (~p \/ ~q) | p XOR q |
|---|---|--------|----------|------------------------|---------|
| V | V | V      | F        | F                      | F       |
| V | F | V      | V        | V                      | V       |
| F | V | V      | V        | V                      | V       |
| F | F | F      | V        | F                      | F       |

Les colonnes FNC et XOR sont identiques.

---

## Exercice 5 : Reconnaitre FNC et FND

### Enonce
Pour chaque formule, dire si elle est en FNC, FND, les deux, ou aucune. Justifier.

### Solution detaillee

| Formule | FNC ? | FND ? | Justification detaillee |
|---------|-------|-------|-------------------------|
| `(p \/ q) /\ (~p \/ r)` | **Oui** | Non | Connecteur principal = /\ (ET). Chaque facteur est un OU de litteraux (clause). C'est un ET de OU. Ce n'est pas une FND car `p \/ q` n'est pas un monome (c'est un OU, pas un ET). |
| `(p /\ q) \/ (~p /\ r)` | Non | **Oui** | Connecteur principal = \/ (OU). Chaque terme est un ET de litteraux (monome). C'est un OU de ET. Ce n'est pas une FNC car `p /\ q` n'est pas une clause. |
| `p /\ q /\ r` | **Oui** | **Oui** | Les deux ! C'est un ET de trois clauses unitaires (FNC). C'est aussi un seul monome de 3 litteraux (FND avec un seul monome). |
| `p \/ q \/ r` | **Oui** | **Oui** | Les deux ! C'est une seule clause a 3 litteraux (FNC avec une seule clause). C'est aussi un OU de trois monomes unitaires (FND). |
| `p` | **Oui** | **Oui** | Cas degenere. Un seul litteral est a la fois une clause et un monome. |
| `(p /\ q) \/ r` | Non | **Oui** | C'est un OU de deux monomes : `p /\ q` et `r`. Pas une FNC car un des termes du ET contiendrait un /\. |
| `~(p \/ q)` | Non | Non | La negation porte sur toute une sous-formule. Il faudrait appliquer De Morgan pour obtenir `~p /\ ~q`, qui serait alors en FNC et FND. |
| `(p \/ q) /\ (r \/ (s /\ t))` | Non | Non | `r \/ (s /\ t)` n'est pas une clause (contient un /\ a l'interieur du \/). Il faudrait distribuer. |

---

## Exercice 6 : FNC et FND d'une formule complexe

### Enonce
Mettre `(p <-> q) -> r` en FNC et en FND.

### Solution detaillee

**Etapes communes (1-3) :**

Etape 1 -- Eliminer <-> :
```
((p -> q) /\ (q -> p)) -> r
```

Etape 2 -- Eliminer -> :
```
~((~p \/ q) /\ (~q \/ p)) \/ r
```

Etape 3 -- Descendre les negations :
```
~((~p \/ q) /\ (~q \/ p)) \/ r
= (~(~p \/ q) \/ ~(~q \/ p)) \/ r              [De Morgan sur /\]
= ((~~p /\ ~q) \/ (~~q /\ ~p)) \/ r            [De Morgan sur \/ pour chaque terme]
= ((p /\ ~q) \/ (q /\ ~p)) \/ r                [double negation]
= (p /\ ~q) \/ (q /\ ~p) \/ r                  [associativite de \/]
```

**Pour la FND :**

La formule `(p /\ ~q) \/ (q /\ ~p) \/ r` est deja un OU de monomes :
- Monome 1 : `p /\ ~q`
- Monome 2 : `q /\ ~p`
- Monome 3 : `r` (monome a un seul litteral)

```
FND = (p /\ ~q) \/ (q /\ ~p) \/ r
```

C'est bien un OU de ET.

**Pour la FNC :**

On part de `(p /\ ~q) \/ (q /\ ~p) \/ r` et on distribue le \/ sur le /\.

**Sous-etape 4a :** Distribuer `(p /\ ~q) \/ (q /\ ~p)`.
```
(p /\ ~q) \/ (q /\ ~p)
= (p \/ q) /\ (p \/ ~p) /\ (~q \/ q) /\ (~q \/ ~p)   [distribution complete]
= (p \/ q) /\ V /\ V /\ (~p \/ ~q)                     [complement]
= (p \/ q) /\ (~p \/ ~q)                                 [element neutre]
```

**Sous-etape 4b :** Distribuer le \/ r sur le /\ :
```
((p \/ q) /\ (~p \/ ~q)) \/ r
= (p \/ q \/ r) /\ (~p \/ ~q \/ r)                      [distributivite]
```

```
FNC = (p \/ q \/ r) /\ (~p \/ ~q \/ r)
```

**Verification :** Deux clauses reliees par ET. Chaque clause est un OU de litteraux.

---

## Exercice 7 : Trouver une realisation (type ExoCours)

### Enonce
Donner une realisation (valuation rendant vrai) de : `(p /\ q -> r \/ s) /\ (~(p /\ ~r) -> p)`

### Solution detaillee

Il faut que les deux conjoncts soient vrais simultanement.

**Analyse de la partie droite :** `~(p /\ ~r) -> p`

Strategie : rendre la conclusion vraie. Si p = V, alors X -> V = V toujours. Posons **p = V**.

**Analyse de la partie gauche :** `p /\ q -> r \/ s`

Avec p = V, la formule devient `V /\ q -> r \/ s` = `q -> r \/ s`.

Strategie : rendre l'antecedent faux. Si q = F, alors F -> ... = V.

Posons **q = F**. Les valeurs de r et s n'importent plus.

Posons **r = V, s = F** (choix arbitraire).

**Verification complete :**

Partie gauche :
```
p /\ q -> r \/ s
= V /\ F -> V \/ F
= F -> V
= V
```

Partie droite :
```
~(p /\ ~r) -> p
= ~(V /\ ~V) -> V
= ~(V /\ F) -> V
= ~F -> V
= V -> V
= V
```

Conjonction : V /\ V = **V**.

**Realisation :** p = V, q = F, r = V, s = F.

---

## Exercice 8 : FNC par table de verite (3 variables)

### Enonce
Trouver la FNC et la FND de `(p -> q) \/ r` par la methode de la table de verite.

### Solution detaillee

**Etape 1 : Table de verite complete.**

| # | p | q | r | p -> q | (p -> q) \/ r |
|---|---|---|---|--------|---------------|
| 1 | V | V | V | V      | V |
| 2 | V | V | F | V      | V |
| 3 | V | F | V | F      | V |
| 4 | V | F | F | F      | **F** |
| 5 | F | V | V | V      | V |
| 6 | F | V | F | V      | V |
| 7 | F | F | V | V      | V |
| 8 | F | F | F | V      | V |

**Etape 2 : FND (lignes a V : 1, 2, 3, 5, 6, 7, 8).**

| Ligne | p | q | r | Monome |
|-------|---|---|---|--------|
| 1     | V | V | V | p /\ q /\ r |
| 2     | V | V | F | p /\ q /\ ~r |
| 3     | V | F | V | p /\ ~q /\ r |
| 5     | F | V | V | ~p /\ q /\ r |
| 6     | F | V | F | ~p /\ q /\ ~r |
| 7     | F | F | V | ~p /\ ~q /\ r |
| 8     | F | F | F | ~p /\ ~q /\ ~r |

```
FND = (p /\ q /\ r) \/ (p /\ q /\ ~r) \/ (p /\ ~q /\ r)
      \/ (~p /\ q /\ r) \/ (~p /\ q /\ ~r) \/ (~p /\ ~q /\ r) \/ (~p /\ ~q /\ ~r)
```

(7 monomes -- beaucoup ! On peut simplifier, voir ci-dessous.)

**Etape 3 : FNC (lignes a F : uniquement la ligne 4).**

Ligne 4 (p=V, q=F, r=F) : clause = `~p \/ q \/ r`
- p est a V -> on met ~p
- q est a F -> on met q
- r est a F -> on met r

```
FNC = ~p \/ q \/ r
```

Une seule clause ! La FNC est tres compacte ici.

**Verification :** `~p \/ q \/ r` est faux uniquement quand ~p=F, q=F, r=F, soit p=V, q=F, r=F (ligne 4). C'est bien la seule ligne a F.

**Simplification de la FND :** On peut factoriser :
```
FND = (p /\ q /\ r) \/ (p /\ q /\ ~r) \/ (p /\ ~q /\ r) \/ (~p /\ q /\ r) \/ (~p /\ q /\ ~r) \/ (~p /\ ~q /\ r) \/ (~p /\ ~q /\ ~r)
```

Groupons les monomes 1 et 2 : `p /\ q /\ (r \/ ~r)` = `p /\ q`.
Groupons les monomes 5 et 6 : `~p /\ q /\ (r \/ ~r)` = `~p /\ q`.
Groupons les monomes 3, 7 : `(p \/ ~p) /\ ~q /\ r` = ... non, ils ne sont pas du meme type. Essayons autrement.

Apres simplification algebrique complete, on obtient : `~p \/ q \/ r`, ce qui est coherent avec la FNC (la formule est si simple qu'elle est a la fois une clause unique en FNC et peut se simplifier a cette meme forme).

---

## Exercice 9 : Mise en FNC -- formule avec double negation et equivalence

### Enonce
Mettre en FNC : `~~p -> (q <-> r)`

### Solution detaillee

**Etape 1 : Eliminer <->**
```
~~p -> ((q -> r) /\ (r -> q))
```

**Etape 2 : Eliminer ->**
```
= ~(~~p) \/ ((~q \/ r) /\ (~r \/ q))     [elimination des trois implications]
```

Attendons, soyons precis. L'implication principale est `~~p -> X` qui donne `~(~~p) \/ X`.

```
~~p -> ((q -> r) /\ (r -> q))
= ~(~~p) \/ ((q -> r) /\ (r -> q))        [elimination de -> principale]
= ~(~~p) \/ ((~q \/ r) /\ (~r \/ q))      [elimination de -> sur les deux internes]
```

**Etape 3 : Descendre les negations**
```
~(~~p) = ~~~p = ~p                          [triple negation : ~~~p = ~p]
```

Justification : `~~~p = ~(~~p) = ~p` par double negation d'abord : `~~p = p`, donc `~(~~p) = ~p`.

La formule devient :
```
~p \/ ((~q \/ r) /\ (~r \/ q))
```

**Etape 4 : Distribuer \/ sur /\**
```
~p \/ ((~q \/ r) /\ (~r \/ q))
= (~p \/ (~q \/ r)) /\ (~p \/ (~r \/ q))   [distributivite : A \/ (B /\ C) = (A \/ B) /\ (A \/ C)]
= (~p \/ ~q \/ r) /\ (~p \/ ~r \/ q)       [associativite de \/]
```

**Resultat FNC :**
```
(~p \/ ~q \/ r) /\ (~p \/ ~r \/ q)
```

Deux clauses a 3 litteraux chacune, reliees par ET.

---

## Exercice 10 : Trouver une refutation (type ExoCours Diapo 27)

### Enonce
Donner une refutation (valuation rendant faux) de : `(p /\ q <-> r \/ s) \/ (~(p /\ ~r) -> p)`

### Solution detaillee

Il faut que les deux disjoncts soient faux simultanement (car c'est un OU).

**Analyse de la partie droite :** `~(p /\ ~r) -> p`

Pour que cette implication soit fausse, il faut que l'antecedent soit vrai et la conclusion fausse. Donc p = F.
```
~(p /\ ~r) -> p = faux
=> ~(p /\ ~r) = vrai   et   p = faux
```

Avec **p = F** :
```
~(F /\ ~r) = ~F = V    (quel que soit r)
V -> F = F
```
OK, la partie droite est fausse pour tout r.

**Analyse de la partie gauche :** `p /\ q <-> r \/ s`

Avec p = F :
```
p /\ q = F /\ q = F    (quel que soit q)
```

Pour que `F <-> (r \/ s)` soit faux, il faut que les deux cotes aient des valeurs differentes.
- Cote gauche = F.
- Il faut cote droit = V, donc `r \/ s = V`.

**Choix :** r = F, s = V (ou tout couple avec r \/ s = V).

**Verification complete :**

Partie gauche :
```
p /\ q <-> r \/ s
= F /\ q <-> F \/ V
= F <-> V
= F
```

Partie droite :
```
~(p /\ ~r) -> p
= ~(F /\ ~F) -> F
= ~(F /\ V) -> F
= ~F -> F
= V -> F
= F
```

Disjonction : F \/ F = **F**.

**Refutation :** p = F, q = F (ou V, libre), r = F, s = V.

**Remarque methodologique :** Pour les refutations, on commence par la formule la plus contraignante. Ici, la partie droite force p = F immediatement. Ensuite, on propage cette contrainte dans la partie gauche pour trouver les valeurs restantes.

---

## Exercice 11 : Prouver une tautologie par equivalences (type ExoCours Diapo 46)

### Enonce
Montrer par equivalences que `(r -> s) -> ((r \/ t) -> (s \/ t))` est une tautologie.

### Solution detaillee

```
(r -> s) -> ((r \/ t) -> (s \/ t))
```

**Pas 1 :** Eliminer les implications.
```
= ~(~r \/ s) \/ (~(r \/ t) \/ (s \/ t))           [A -> B = ~A \/ B, applique deux fois]
= (r /\ ~s) \/ ((~r /\ ~t) \/ s \/ t)             [De Morgan sur les negations]
```

**Pas 2 :** Reorganiser.
```
= (r /\ ~s) \/ (~r /\ ~t) \/ s \/ t               [associativite de \/]
```

**Pas 3 :** Distribuer `(~r /\ ~t) \/ t`.
```
(~r /\ ~t) \/ t
= (~r \/ t) /\ (~t \/ t)                           [distributivite]
= (~r \/ t) /\ V                                    [complement]
= ~r \/ t                                            [element neutre]
```

Donc :
```
= (r /\ ~s) \/ ~r \/ t \/ s                        [substitution]
```

**Pas 4 :** Distribuer `(r /\ ~s) \/ ~r`.
```
(r /\ ~s) \/ ~r
= (r \/ ~r) /\ (~s \/ ~r)                          [distributivite]
= V /\ (~s \/ ~r)                                    [complement]
= ~s \/ ~r                                            [element neutre]
```

Donc :
```
= ~s \/ ~r \/ t \/ s                                [substitution]
= ~r \/ (~s \/ s) \/ t                              [commutativite et associativite]
= ~r \/ V \/ t                                       [complement]
= V                                                   [absorbant]
```

**La formule se reduit a V. C'est une TAUTOLOGIE.**
