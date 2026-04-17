---
title: "Exercices -- Unification"
sidebar_position: 5
---

# Exercices -- Unification

---

## Exercice 1 : Unifications simples

### Enonce
Trouver le MGU (ou conclure ECHEC) pour chaque paire.

### Solutions detaillees

**a) P(x, a) et P(b, a)**

```
Etape 1 : Comparer les predicats.
   P et P : meme predicat. Arite 2 et 2 : meme arite. On continue.

Etape 2 : Unifier le 1er argument : x et b.
   x est une variable, b est une constante.
   Test d'occurrence : x n'apparait pas dans b.
   sigma1 = {x <- b}

Etape 3 : Appliquer sigma1 aux 2emes arguments.
   a . sigma1 = a     (a est une constante, pas affectee)
   a . sigma1 = a

Etape 4 : Unifier le 2eme argument : a et a.
   Identiques. Rien a ajouter.

Resultat : MGU = {x <- b}
```

Verification : P(x, a){x <- b} = P(b, a) et P(b, a){x <- b} = P(b, a). Identiques.

**b) P(x, y) et P(a, f(b))**

```
Etape 1 : P = P, arite 2 = 2. OK.

Etape 2 : Unifier x et a.
   x est une variable, a est une constante.
   sigma1 = {x <- a}

Etape 3 : Appliquer sigma1 aux arguments suivants.
   y . sigma1 = y           (y pas affecte)
   f(b) . sigma1 = f(b)     (pas de x dans f(b))

Etape 4 : Unifier y et f(b).
   y est une variable, f(b) est un terme compose.
   Test d'occurrence : y n'apparait pas dans f(b).
   sigma2 = {y <- f(b)}

Resultat : MGU = {x <- a, y <- f(b)}
```

Verification :
- P(x, y){x <- a, y <- f(b)} = P(a, f(b))
- P(a, f(b)){x <- a, y <- f(b)} = P(a, f(b))
Identiques. OK.

**c) P(a) et Q(a)**

```
Etape 1 : Comparer les predicats.
   P et Q : predicats DIFFERENTS.
   ECHEC.
```

Justification : on ne peut unifier que des expressions ayant le MEME symbole de predicat (ou de fonction) a la racine.

**d) P(x) et P(f(x))**

```
Etape 1 : P = P, arite 1 = 1. OK.

Etape 2 : Unifier x et f(x).
   x est une variable.
   Test d'occurrence : x apparait-il dans f(x) ? OUI.
   ECHEC (test d'occurrence).
```

Justification : si on posait x = f(x), on obtiendrait x = f(f(f(f(...)))) a l'infini. Ce n'est pas un terme fini valide.

**e) f(x, g(a)) et f(b, g(y))**

```
Etape 1 : f = f, arite 2 = 2. OK.

Etape 2 : Unifier x et b.
   x est une variable, b est une constante.
   sigma1 = {x <- b}

Etape 3 : Appliquer sigma1 aux 2emes arguments.
   g(a) . sigma1 = g(a)     (pas de x dans g(a))
   g(y) . sigma1 = g(y)     (pas de x dans g(y))

Etape 4 : Unifier g(a) et g(y).
   g = g, arite 1 = 1. OK.

Etape 5 : Unifier a et y.
   y est une variable, a est une constante.
   sigma2 = {y <- a}

Resultat : MGU = {x <- b, y <- a}
```

Verification :
- f(x, g(a)){x <- b, y <- a} = f(b, g(a))
- f(b, g(y)){x <- b, y <- a} = f(b, g(a))
Identiques. OK.

---

## Exercice 2 : Unification avec propagation de substitution

### Enonce
Unifier P(x, x, y) et P(a, z, z).

### Solution detaillee

```
Etape 1 : P = P, arite 3 = 3. OK.

Etape 2 : Unifier le 1er argument : x et a.
   x est une variable, a est une constante.
   sigma1 = {x <- a}

Etape 3 : Appliquer sigma1 aux arguments restants.
   Arguments de P(x, x, y) apres sigma1 :  2eme = x.sigma1 = a,   3eme = y.sigma1 = y
   Arguments de P(a, z, z) apres sigma1 :  2eme = z.sigma1 = z,   3eme = z.sigma1 = z

   On doit maintenant unifier :
   - 2eme arguments : a et z
   - 3eme arguments : y et z

Etape 4 : Unifier le 2eme argument : a et z.
   z est une variable, a est une constante.
   sigma2 = {z <- a}

Etape 5 : Appliquer sigma2 aux 3emes arguments.
   y . sigma2 = y     (y pas affecte)
   z . sigma2 = a

Etape 6 : Unifier le 3eme argument : y et a.
   y est une variable, a est une constante.
   sigma3 = {y <- a}

Resultat : MGU = sigma1 compose sigma2 compose sigma3 = {x <- a, z <- a, y <- a}
```

Verification :
- P(x, x, y){x <- a, z <- a, y <- a} = P(a, a, a)
- P(a, z, z){x <- a, z <- a, y <- a} = P(a, a, a)
Identiques. OK.

**Point cle :** A l'etape 3, on DOIT appliquer sigma1 aux arguments restants AVANT de continuer l'unification. Si on oublie, on n'aurait pas "a" comme 2eme argument de la premiere expression, et le resultat serait faux.

---

## Exercice 3 : Unification avec fonctions imbriquees

### Enonce
Unifier P(f(x), g(y, a)) et P(f(f(b)), g(f(b), z)).

### Solution detaillee

```
Etape 1 : P = P, arite 2 = 2. OK.

Etape 2 : Unifier le 1er argument : f(x) et f(f(b)).
   f = f, arite 1 = 1. OK.
   
   Sous-etape 2a : Unifier x et f(b).
      x est une variable, f(b) est un terme compose.
      Test d'occurrence : x n'apparait pas dans f(b). OK.
      sigma1 = {x <- f(b)}

Etape 3 : Appliquer sigma1 aux 2emes arguments.
   g(y, a) . sigma1 = g(y, a)          (pas de x dans g(y, a))
   g(f(b), z) . sigma1 = g(f(b), z)    (pas de x dans g(f(b), z))

Etape 4 : Unifier le 2eme argument : g(y, a) et g(f(b), z).
   g = g, arite 2 = 2. OK.

   Sous-etape 4a : Unifier y et f(b).
      y est une variable, f(b) est un terme compose.
      Test d'occurrence : y n'apparait pas dans f(b). OK.
      sigma2 = {y <- f(b)}

   Sous-etape 4b : Appliquer sigma2 aux arguments restants.
      a . sigma2 = a
      z . sigma2 = z

   Sous-etape 4c : Unifier a et z.
      z est une variable, a est une constante.
      sigma3 = {z <- a}

Resultat : MGU = {x <- f(b), y <- f(b), z <- a}
```

Verification :
- P(f(x), g(y, a)){...} = P(f(f(b)), g(f(b), a))
- P(f(f(b)), g(f(b), z)){...} = P(f(f(b)), g(f(b), a))
Identiques. OK.

---

## Exercice 4 : Echecs varies -- diagnostic

### Enonce
Expliquer precisement pourquoi chaque unification echoue.

### Solutions detaillees

**a) P(a, b) et P(b, a) (a, b sont des constantes)**

```
Etape 1 : P = P, arite 2 = 2. OK.

Etape 2 : Unifier a et b.
   a est une constante. b est une constante.
   a et b sont des constantes DIFFERENTES.
   Les constantes ne peuvent etre rendues identiques par substitution.
   ECHEC.
```

Diagnostic : conflit de constantes. Aucune substitution ne peut rendre deux constantes differentes egales.

**b) P(x, x) et P(a, b) (a et b sont des constantes, a != b)**

```
Etape 1 : P = P, arite 2 = 2. OK.

Etape 2 : Unifier x et a.
   sigma1 = {x <- a}

Etape 3 : Appliquer sigma1 aux 2emes arguments.
   x . sigma1 = a     (x remplace par a)
   b . sigma1 = b

Etape 4 : Unifier a et b.
   Constantes differentes.
   ECHEC.
```

Diagnostic : P(x, x) exige que les deux arguments soient IDENTIQUES. Mais P(a, b) a deux arguments differents. Apres avoir pose x = a, le deuxieme argument devient aussi a, mais il devrait etre b. Contradiction.

**c) P(x, x) et P(y, f(y))**

```
Etape 1 : P = P, arite 2 = 2. OK.

Etape 2 : Unifier x et y.
   Deux variables. On choisit : sigma1 = {x <- y}

Etape 3 : Appliquer sigma1 aux 2emes arguments.
   x . sigma1 = y          (x remplace par y)
   f(y) . sigma1 = f(y)    (y pas remplace car c'est la cible, pas la source)

Etape 4 : Unifier y et f(y).
   y est une variable.
   Test d'occurrence : y apparait-il dans f(y) ? OUI.
   ECHEC (test d'occurrence).
```

Diagnostic : P(x, x) impose que les deux arguments soient egaux. Avec le premier argument y, le deuxieme devrait aussi etre y. Mais dans P(y, f(y)), le deuxieme est f(y). Donc il faudrait y = f(y), ce qui donnerait un terme infini : y = f(f(f(f(...)))). Impossible.

**d) f(x, y) et g(a, b)**

```
Etape 1 : Comparer les symboles de tete.
   f et g : symboles DIFFERENTS.
   ECHEC.
```

Diagnostic : on ne peut unifier que des expressions ayant le meme symbole racine.

**e) P(x, y, z) et P(a, b)**

```
Etape 1 : P = P. OK.
   Mais arite 3 != arite 2.
   ECHEC.
```

Diagnostic : meme predicat mais arites differentes. On ne peut pas unifier deux applications de predicat si elles n'ont pas le meme nombre d'arguments.

---

## Exercice 5 : Plusieurs unificateurs -- identifier le MGU

### Enonce
P(x) et P(y). Donner trois unificateurs differents et identifier le MGU.

### Solution detaillee

Les deux expressions sont P(x) et P(y). Meme predicat, arite 1.

On doit unifier x et y (deux variables).

**Unificateurs possibles :**

1. **sigma1 = {x <- y}**
   - P(x) sigma1 = P(y)
   - P(y) sigma1 = P(y)
   - Resultat commun : P(y). **Correct.**

2. **sigma2 = {y <- x}**
   - P(x) sigma2 = P(x)
   - P(y) sigma2 = P(x)
   - Resultat commun : P(x). **Correct.**

3. **sigma3 = {x <- a, y <- a}** (a est une constante)
   - P(x) sigma3 = P(a)
   - P(y) sigma3 = P(a)
   - Resultat commun : P(a). **Correct.**

4. **sigma4 = {x <- f(z), y <- f(z)}** (f symbole de fonction, z variable)
   - P(x) sigma4 = P(f(z))
   - P(y) sigma4 = P(f(z))
   - Resultat commun : P(f(z)). **Correct.**

**Le MGU est sigma1 = {x <- y} (ou de facon equivalente sigma2 = {y <- x}).**

Pourquoi ? Le MGU fait le **minimum de specialisation necessaire**. Il ne fixe pas de constante ni de terme compose, il dit simplement "x et y sont la meme chose". Toute autre substitution est une specialisation de sigma1 :
- sigma3 est obtenu en composant sigma1 avec {y <- a}
- sigma4 est obtenu en composant sigma1 avec {y <- f(z)}

Les sigma3 et sigma4 ne sont PAS des MGU car ils ajoutent des contraintes inutiles.

---

## Exercice 6 : Unification dans le cadre de la resolution

### Enonce
Clauses :
```
C1 = {P(x, a), Q(x)}
C2 = {~P(b, y), R(y)}
```

Calculer la resolvante.

### Solution detaillee

**Etape 1 : Identifier les litteraux complementaires.**

C1 contient le litteral positif P(x, a).
C2 contient le litteral negatif ~P(b, y).

On va resoudre sur le predicat P.

**Etape 2 : Unifier P(x, a) et P(b, y).**

```
P = P, arite 2 = 2. OK.

Sous-etape 2a : Unifier x et b.
   x est une variable, b est une constante.
   sigma1 = {x <- b}

Sous-etape 2b : Appliquer sigma1 aux arguments suivants.
   a . sigma1 = a
   y . sigma1 = y

Sous-etape 2c : Unifier a et y.
   y est une variable, a est une constante.
   sigma2 = {y <- a}

MGU = {x <- b, y <- a}
```

**Etape 3 : Calculer la resolvante.**

Resolvante = (C1 \ {P(x,a)} union C2 \ {~P(b,y)}) appliquee au MGU

```
= ({Q(x)} union {R(y)}) . {x <- b, y <- a}
= {Q(x), R(y)} . {x <- b, y <- a}
= {Q(b), R(a)}
```

**Resolvante : {Q(b), R(a)}**, c'est-a-dire `Q(b) \/ R(a)`.

---

## Exercice 7 : Renommage de variables entre clauses

### Enonce
Pourquoi faut-il renommer les variables entre clauses avant la resolution ? Illustrer avec un exemple.

### Solution detaillee

**Principe :** Chaque clause en resolution au premier ordre est implicitement quantifiee universellement. Les variables de deux clauses differentes sont INDEPENDANTES, meme si elles portent le meme nom.

**Exemple problematique sans renommage :**

```
C1 = {P(x), Q(x)}       -- "il existe quelque chose qui est P et Q" (pour tout x)
C2 = {~P(x), R(x)}      -- "si P(x) alors R(x)" (pour tout x)
```

Si on resout sur P sans renommer :
```
Unifier P(x) et P(x) : sigma = {} (identiques)
Resolvante = {Q(x), R(x)}
```

Ce resultat dit que Q et R sont vrais pour le MEME x. Or les x de C1 et C2 etaient independants. Le bon resultat devrait permettre des x differents.

**Avec renommage :**

Renommons C2 : C2' = {~P(y), R(y)}

```
Unifier P(x) et P(y) : sigma = {x <- y}
Resolvante = {Q(x), R(y)} . {x <- y} = {Q(y), R(y)}
```

Ici, Q(y) et R(y) partagent la meme variable car l'unification les a liees. C'est le comportement correct : la resolution a trouve que le meme objet satisfait les deux proprietes.

**Mais sans le renommage**, on aurait pu faire une resolution erronee si les structures etaient plus complexes. Le renommage garantit la correction de la procedure.

**Regle :** Avant toute etape de resolution, renommer les variables de l'une des deux clauses pour qu'elles soient disjointes des variables de l'autre.

---

## Exercice 8 : Unification complexe -- trois niveaux d'imbrication

### Enonce
Unifier `Q(f(x, g(y)), h(z))` et `Q(f(a, g(h(b))), h(f(a, c)))`.

### Solution detaillee

```
Etape 1 : Q = Q, arite 2 = 2. OK.

Etape 2 : Unifier le 1er argument : f(x, g(y)) et f(a, g(h(b))).
   f = f, arite 2 = 2. OK.

   Sous-etape 2a : Unifier x et a.
      x est une variable, a est une constante.
      sigma1 = {x <- a}

   Sous-etape 2b : Appliquer sigma1.
      g(y) . sigma1 = g(y)          (pas de x)
      g(h(b)) . sigma1 = g(h(b))    (pas de x)

   Sous-etape 2c : Unifier g(y) et g(h(b)).
      g = g, arite 1 = 1. OK.
      Unifier y et h(b).
      y est une variable, h(b) est un terme compose.
      Test d'occurrence : y n'apparait pas dans h(b). OK.
      sigma2 = {y <- h(b)}

Etape 3 : Appliquer sigma1 compose sigma2 aux 2emes arguments.
   h(z) . {x <- a, y <- h(b)} = h(z)                    (pas de x ni y)
   h(f(a, c)) . {x <- a, y <- h(b)} = h(f(a, c))        (pas de x ni y)

Etape 4 : Unifier h(z) et h(f(a, c)).
   h = h, arite 1 = 1. OK.
   Unifier z et f(a, c).
   z est une variable, f(a, c) est un terme compose.
   Test d'occurrence : z n'apparait pas dans f(a, c). OK.
   sigma3 = {z <- f(a, c)}

Resultat : MGU = {x <- a, y <- h(b), z <- f(a, c)}
```

Verification :
- Q(f(x, g(y)), h(z)){...} = Q(f(a, g(h(b))), h(f(a, c)))
- Q(f(a, g(h(b))), h(f(a, c))){...} = Q(f(a, g(h(b))), h(f(a, c)))
Identiques. OK.
