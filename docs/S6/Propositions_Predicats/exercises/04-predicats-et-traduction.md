---
title: "Exercices -- Predicats et traduction"
sidebar_position: 4
---

# Exercices -- Predicats et traduction

---

## Exercice 1 : Traduction francais -> logique du premier ordre

### Enonce
Traduire chaque phrase en logique du premier ordre. Definir explicitement les predicats.

### Solutions detaillees

**a) "Tous les etudiants suivent au moins un cours."**

Predicats :
- E(x) = "x est un etudiant"
- C(y) = "y est un cours"
- S(x,y) = "x suit y"

Analyse de la phrase :
- "Tous les etudiants" = quantificateur universel sur les etudiants
- "suivent au moins un cours" = quantificateur existentiel sur les cours

Structure : "Pour tout x, SI x est etudiant, ALORS il existe un cours que x suit."

```
Ax, (E(x) -> Ey, (C(y) /\ S(x,y)))
```

Justification de chaque choix :
- **Ax** : "tous les etudiants" -> quantificateur universel
- **E(x) ->** : "tous les A sont B" se traduit avec IMPLIQUE (pas /\). Si on mettait /\, on dirait "tout objet est un etudiant et suit un cours", ce qui est faux.
- **Ey** : "au moins un" -> quantificateur existentiel
- **C(y) /\** : "il existe un A qui est B" se traduit avec ET (pas ->). Si on mettait ->, la formule serait triviale.
- **S(x,y)** : x suit y

**b) "Il existe un cours que tous les etudiants suivent."**

```
Ey, (C(y) /\ Ax, (E(x) -> S(x,y)))
```

Justification :
- **Ey** en premier : il y a UN cours (fixe) qui satisfait la suite
- **C(y)** : ce y est un cours
- **Ax, (E(x) -> S(x,y))** : TOUS les etudiants le suivent

**Difference cruciale avec (a) :** En (a), chaque etudiant peut suivre un cours DIFFERENT (le y depend du x). En (b), il y a un SEUL cours y suivi par TOUS. L'ordre des quantificateurs change le sens.

- (a) : `Ax Ey` -> pour chaque x, un y (possiblement different)
- (b) : `Ey Ax` -> il existe un y fixe, pour tout x

**c) "Aucun bebe ne peut dompter un crocodile."**

Predicats :
- BB(x) = "x est un bebe"
- DC(x) = "x peut dompter un crocodile"

"Aucun A n'est B" = "Pour tout A, A n'est pas B" :
```
Ax, (BB(x) -> ~DC(x))
```

Forme equivalente (avec negation existentielle) :
```
~Ex, (BB(x) /\ DC(x))
```

Verification de l'equivalence :
```
~Ex, (BB(x) /\ DC(x))
= Ax, ~(BB(x) /\ DC(x))            [negation de il existe]
= Ax, (~BB(x) \/ ~DC(x))           [De Morgan]
= Ax, (BB(x) -> ~DC(x))            [car ~A \/ B = A -> B]
```

**d) "Certains patients aiment tous les docteurs."**

Predicats :
- P(x) = "x est patient"
- D(y) = "y est docteur"
- A(x,y) = "x aime y"

```
Ex, (P(x) /\ Ay, (D(y) -> A(x,y)))
```

Justification :
- **Ex** : "certains" -> il en existe au moins un
- **P(x) /\** : cet x est un patient (avec ET car c'est un existentiel)
- **Ay, (D(y) -> A(x,y))** : ce patient aime TOUS les docteurs
  - "Tous les D sont aimes" = Ay, (D(y) -> ...)

**e) "Personne n'aime tout le monde."**

Predicat : A(x,y) = "x aime y"

"Personne" = "il n'existe pas de personne telle que..."

```
~Ex, Ay, A(x,y)
```

Forme equivalente (en mettant en forme prenexe) :
```
= Ax, ~(Ay, A(x,y))                 [negation du il existe]
= Ax, Ey, ~A(x,y)                    [negation du pour tout]
```

Lecture : "Pour toute personne x, il existe une personne y que x n'aime pas."

**f) "Tout le monde aime quelqu'un."**

```
Ax, Ey, A(x,y)
```

Lecture : "Pour toute personne x, il existe une personne y que x aime."

**g) "Il existe quelqu'un que tout le monde aime."**

```
Ey, Ax, A(x,y)
```

Lecture : "Il existe une personne y telle que pour toute personne x, x aime y."

**Difference entre (f) et (g) :**
- (f) `Ax Ey` : chaque personne aime au moins une personne (pas forcement la meme)
- (g) `Ey Ax` : il y a UNE personne aimee de TOUS (une "star")
- (g) implique (f), mais (f) n'implique pas (g)

**h) "Il existe un unique etudiant qui a obtenu 20/20."**

Predicats :
- E(x) = "x est un etudiant"
- N(x) = "x a obtenu 20/20"

```
Ex, (E(x) /\ N(x) /\ Ay, ((E(y) /\ N(y)) -> y = x))
```

Decomposition :
- `Ex` : il en existe au moins un
- `E(x) /\ N(x)` : c'est un etudiant qui a 20/20
- `Ay, ((E(y) /\ N(y)) -> y = x)` : tout etudiant qui a 20/20 est egal a x (unicite)

---

## Exercice 2 : Forme prenexe

### Enonce
Mettre en forme prenexe : `(Ax, P(x)) -> (Ex, Q(x))`

### Solution detaillee

**Etape 1 : Eliminer l'implication (->)**
```
(Ax, P(x)) -> (Ex, Q(x))
= ~(Ax, P(x)) \/ (Ex, Q(x))        [elimination de -> : A -> B = ~A \/ B]
```

**Etape 2 : Descendre la negation sur le quantificateur**
```
= (Ex, ~P(x)) \/ (Ex, Q(x))        [negation de pour tout : ~(Ax, P(x)) = Ex, ~P(x)]
```

**Etape 3 : Renommer les variables liees**

Les deux quantificateurs lient la variable x, mais ce sont des x INDEPENDANTS. Il faut les renommer pour eviter les conflits :
```
= (Ex, ~P(x)) \/ (Ey, Q(y))        [renommage : le deuxieme x devient y]
```

**Etape 4 : Sortir les quantificateurs vers le debut**

Regle : quand un quantificateur existentiel est dans une disjonction et que sa variable n'apparait pas dans l'autre cote, on peut le sortir.
```
= Ex, (~P(x) \/ (Ey, Q(y)))         [sortir le premier Ex]
= Ex, Ey, (~P(x) \/ Q(y))           [sortir le deuxieme Ey]
```

**Resultat en forme prenexe :**
```
Ex, Ey, (~P(x) \/ Q(y))
```

Prefixe : `Ex, Ey` (deux quantificateurs existentiels)
Matrice : `~P(x) \/ Q(y)` (sans quantificateur)

---

## Exercice 3 : Forme prenexe complexe

### Enonce
Mettre en forme prenexe : `(Ax, P(x) -> Q(x)) -> (Ex, P(x) -> Ex, Q(x))`

### Solution detaillee

**Etape 1 : Eliminer les implications**

L'implication principale est `A -> B` avec :
- A = `Ax, (P(x) -> Q(x))` = `Ax, (~P(x) \/ Q(x))`
- B = `Ex, P(x) -> Ex, Q(x)` = `~(Ex, P(x)) \/ (Ex, Q(x))`

Donc :
```
~(Ax, (~P(x) \/ Q(x))) \/ (~(Ex, P(x)) \/ (Ex, Q(x)))
```

**Etape 2 : Descendre les negations**
```
~(Ax, (~P(x) \/ Q(x)))
= Ex, ~(~P(x) \/ Q(x))             [negation de pour tout]
= Ex, (~~P(x) /\ ~Q(x))            [De Morgan]
= Ex, (P(x) /\ ~Q(x))              [double negation]
```

```
~(Ex, P(x))
= Ax, ~P(x)                         [negation de il existe]
```

La formule complete :
```
(Ex, (P(x) /\ ~Q(x))) \/ ((Ax, ~P(x)) \/ (Ex, Q(x)))
```

**Etape 3 : Renommer les variables liees**

Il y a TROIS variables x independantes :
- Le x dans `Ex, (P(x) /\ ~Q(x))`
- Le x dans `Ax, ~P(x)`
- Le x dans `Ex, Q(x)`

Renommage :
```
(Ex, (P(x) /\ ~Q(x))) \/ ((Ay, ~P(y)) \/ (Ez, Q(z)))
```

**Etape 4 : Sortir les quantificateurs**

```
Ex, ((P(x) /\ ~Q(x)) \/ ((Ay, ~P(y)) \/ (Ez, Q(z))))
= Ex, Ay, ((P(x) /\ ~Q(x)) \/ ~P(y) \/ (Ez, Q(z)))
= Ex, Ay, Ez, ((P(x) /\ ~Q(x)) \/ ~P(y) \/ Q(z))
```

**Regle pour la sortie du Ay :** Le quantificateur universel sort d'une disjonction en restant universel (car la variable y n'apparait pas dans les autres parties).

**Resultat en forme prenexe :**
```
Ex, Ay, Ez, ((P(x) /\ ~Q(x)) \/ ~P(y) \/ Q(z))
```

---

## Exercice 4 : Skolemisation

### Enonce
Skolemiser : `Ax, Ey, Az, Ew, R(x, y, z, w)`

### Solution detaillee

**Principe :** Chaque quantificateur existentiel est remplace par une fonction (ou constante) de Skolem qui depend de toutes les variables universelles qui le precedent.

**Analyse des dependances :**

1. `Ax` : x est universel, on le garde.
2. `Ey` : y est existentiel. Il est precede par `Ax`.
   - y depend de x.
   - **Remplacer y par f(x)** ou f est une nouvelle fonction de Skolem d'arite 1.
3. `Az` : z est universel, on le garde.
4. `Ew` : w est existentiel. Il est precede par `Ax` et `Az`.
   - w depend de x et z (les deux variables universelles qui precedent).
   - **Remplacer w par g(x, z)** ou g est une nouvelle fonction de Skolem d'arite 2.

**Application :**
```
Ax, Ey, Az, Ew, R(x, y, z, w)
--> Ax, Az, R(x, f(x), z, g(x, z))
```

**Resultat :**
```
Ax, Az, R(x, f(x), z, g(x, z))
```

On peut ensuite supprimer les quantificateurs universels (ils deviennent implicites) :
```
R(x, f(x), z, g(x, z))
```

---

## Exercice 5 : Forme clausale complete

### Enonce
Mettre en forme clausale : `Ax, (P(x) /\ Ey, Q(y)) -> Ez, R(x, z)`

### Solution detaillee

**Etape 1 : Eliminer les implications**
```
Ax, (~(P(x) /\ Ey, Q(y)) \/ Ez, R(x, z))
```

**Etape 2 : Descendre les negations**
```
~(P(x) /\ Ey, Q(y))
= ~P(x) \/ ~(Ey, Q(y))             [De Morgan sur /\]
= ~P(x) \/ Ay, ~Q(y)               [negation de il existe]
```

La formule :
```
Ax, (~P(x) \/ (Ay, ~Q(y)) \/ Ez, R(x, z))
```

**Etape 3 : Renommer si necessaire**

Les variables x, y, z sont toutes distinctes. Pas de conflit. OK.

**Etape 4 : Forme prenexe (sortir les quantificateurs)**
```
Ax, Ay, Ez, (~P(x) \/ ~Q(y) \/ R(x, z))
```

Justification de l'ordre :
- `Ax` est deja a l'exterieur
- `Ay` sort de la disjonction (y n'apparait que dans ~Q(y))
- `Ez` sort de la disjonction (z n'apparait que dans R(x,z))

**Etape 5 : Skolemiser**

`Ez` est precede par `Ax` et `Ay`. Donc z depend de x et y.

Remplacer z par h(x, y) (fonction de Skolem d'arite 2) :
```
Ax, Ay, (~P(x) \/ ~Q(y) \/ R(x, h(x, y)))
```

**Etape 6 : Supprimer les quantificateurs universels (implicites)**
```
~P(x) \/ ~Q(y) \/ R(x, h(x, y))
```

**Etapes 7-8 : C'est deja une clause (un OU de litteraux).**
```
Clause : {~P(x), ~Q(y), R(x, h(x, y))}
```

---

## Exercice 6 : Evaluation dans une interpretation

### Enonce
Soit D = {1, 2}, P = {1} (P(1) vrai, P(2) faux), Q = {(1,2), (2,1)}.

Evaluer : `Ax, Ey, (P(x) -> Q(x, y))`

### Solution detaillee

Il faut verifier : pour CHAQUE x dans D, il EXISTE un y dans D tel que `P(x) -> Q(x, y)` est vrai.

**Cas x = 1 :**
- P(1) = V

Cherchons un y tel que V -> Q(1, y) = V. Il faut Q(1, y) = V.
- y = 1 : Q(1,1) = F. Donc V -> F = F. Non.
- y = 2 : Q(1,2) = V. Donc V -> V = V. **Oui !**

Il existe y = 2 qui marche pour x = 1.

**Cas x = 2 :**
- P(2) = F

Il faut : F -> Q(2, y). Or F -> X = V pour TOUT X (premisse fausse).
- y = 1 : F -> Q(2,1) = F -> V = V. **Oui !**

Il existe y = 1 qui marche pour x = 2 (en fait, n'importe quel y marche ici).

**Resultat :** Pour tout x dans D, il existe y dans D tel que P(x) -> Q(x,y) est vrai. La formule vaut **V**.

---

## Exercice 7 : Contre-exemple d'interpretation (type DS 2021)

### Enonce
H = {P(0), Ax, (P(x) -> P(s(s(x))))}. Trouver une interpretation I telle que I satisfait H et I satisfait P(s(0)) (c'est-a-dire que ~P(s(0)) n'est PAS consequence de H).

### Solution detaillee

**Objectif :** Montrer que H n'implique pas ~P(s(0)) en trouvant un modele ou H est vrai et P(s(0)) est aussi vrai.

**Construction de l'interpretation :**
- Domaine D = N (entiers naturels)
- 0 interprete comme le nombre 0
- s(x) interprete comme x + 1 (le successeur)
- P(x) interprete comme "vrai pour tout x" (P est partout vrai)

**Verification de H :**

Hypothese 1 : P(0) = V. **OK.**

Hypothese 2 : Ax, (P(x) -> P(s(s(x))))
- Pour tout n dans N : P(n) -> P(n+2) = V -> V = V. **OK.**

**Verification de P(s(0)) :**
- P(s(0)) = P(1) = V. **OK.**

**Conclusion :** Il existe une interpretation ou H est vraie et P(s(0)) est vraie. Donc H ne peut pas impliquer ~P(s(0)). Cela montre que H ne capture pas completement la notion de parite : H dit que P est vrai pour 0, 2, 4, 6..., mais ne dit RIEN sur les nombres impairs. Un nombre impair peut etre vrai ou faux pour P, ce qui est compatible avec H.

Pour que H capture exactement "P(x) ssi x est pair", il faudrait ajouter une hypothese comme ~P(s(0)) et Ax, (~P(x) -> ~P(s(s(x)))).

---

## Exercice 8 : Piege -- "tous les A sont B" vs "certains A sont B"

### Enonce
Pour chaque phrase, donner la traduction correcte ET la traduction incorrecte frequente. Expliquer pourquoi la traduction incorrecte est fausse.

### Solution detaillee

**a) "Tous les chats sont mortels."**

- Correct : `Ax, (Chat(x) -> Mortel(x))`
- **Incorrect :** `Ax, (Chat(x) /\ Mortel(x))` -- Ceci dit "tout objet est un chat ET est mortel", ce qui est faux (une table n'est pas un chat).

Pourquoi -> et pas /\ ? Le quantificateur universel porte sur TOUT le domaine, pas seulement les chats. On veut dire "PARMI les chats, tous sont mortels", c'est-a-dire "SI c'est un chat, ALORS c'est mortel".

**b) "Certains oiseaux ne volent pas."**

- Correct : `Ex, (Oiseau(x) /\ ~Vole(x))`
- **Incorrect :** `Ex, (Oiseau(x) -> ~Vole(x))` -- Ceci est (presque) toujours vrai.

Pourquoi /\ et pas -> ? `Ex, (Oiseau(x) -> ~Vole(x))` = `Ex, (~Oiseau(x) \/ ~Vole(x))`. Il suffit qu'il existe un objet qui N'EST PAS un oiseau pour que la formule soit vraie. C'est trivial. On veut au contraire dire "il existe un objet qui EST un oiseau ET qui ne vole pas".

**Regle mnemotechnique :**
- "Tous les A sont B" : `Ax, (A(x) -> B(x))` -- quantificateur universel + implication
- "Certains A sont B" : `Ex, (A(x) /\ B(x))` -- quantificateur existentiel + conjonction

---

## Exercice 9 : Pipeline complet -- traduction, forme clausale, resolution (type DS 2023-2025)

### Enonce

Premisses en francais :
- P1 : "Tout etudiant qui travaille reussit."
- P2 : "Tout etudiant qui reussit est content."
- P3 : "Il existe un etudiant qui travaille."

Montrer par resolution que "Il existe un etudiant content."

### Solution detaillee

**Etape 1 : Traduction en logique du premier ordre.**

Predicats : E(x) = "x est etudiant", T(x) = "x travaille", R(x) = "x reussit", C(x) = "x est content"

```
P1 : Ax, ((E(x) /\ T(x)) -> R(x))
P2 : Ax, ((E(x) /\ R(x)) -> C(x))
P3 : Ex, (E(x) /\ T(x))
Conclusion : Ex, (E(x) /\ C(x))
```

**Etape 2 : Mise en forme clausale des premisses.**

P1 : `Ax, (~E(x) \/ ~T(x) \/ R(x))`
```
C1 = {~E(x), ~T(x), R(x)}
```

P2 : `Ax, (~E(x) \/ ~R(x) \/ C(x))`
```
C2 = {~E(x), ~R(x), C(x)}
```

P3 : `Ex, (E(x) /\ T(x))` -- skolemiser avec la constante a :
```
C3 = {E(a)}
C4 = {T(a)}
```

**Etape 3 : Nier la conclusion et mettre en clause.**

```
~(Ex, (E(x) /\ C(x)))
= Ax, (~E(x) \/ ~C(x))
= Ax, (E(x) -> ~C(x))
```

Clause :
```
C5 = {~E(x), ~C(x)}
```

**Etape 4 : Resolution.**

```
Pas 1 : Res(C1, C4) sur T
   C1 = {~E(x), ~T(x), R(x)}     C4 = {T(a)}
   Unifier T(x) et T(a) : sigma = {x <- a}
   Resolvante = {~E(a), R(a)}
   C6 = {~E(a), R(a)}

Pas 2 : Res(C6, C3) sur E
   C6 = {~E(a), R(a)}     C3 = {E(a)}
   Resolvante = {R(a)}
   C7 = {R(a)}

Pas 3 : Res(C2, C7) sur R
   C2 = {~E(x'), ~R(x'), C(x')}     C7 = {R(a)}
   Unifier R(x') et R(a) : sigma = {x' <- a}
   Resolvante = {~E(a), C(a)}
   C8 = {~E(a), C(a)}

Pas 4 : Res(C8, C3) sur E
   C8 = {~E(a), C(a)}     C3 = {E(a)}
   Resolvante = {C(a)}
   C9 = {C(a)}

Pas 5 : Res(C5, C9) sur C
   C5 = {~E(x''), ~C(x'')}     C9 = {C(a)}
   Unifier C(x'') et C(a) : sigma = {x'' <- a}
   Resolvante = {~E(a)}
   C10 = {~E(a)}

Pas 6 : Res(C10, C3) sur E
   C10 = {~E(a)}     C3 = {E(a)}
   Resolvante = {}
   C11 = {}           (clause vide !)
```

**Conclusion :** Clause vide derivee. Il existe bien un etudiant content. CQFD.

**Arbre de resolution :**
```
{~E(x),~T(x),R(x)}  {T(a)}     {~E(x),~R(x),C(x)}
        \              /                  |
    {~E(a), R(a)}                         |
          \                               |
           \   {E(a)}                     |
            \   /                         |
          {R(a)}                          |
               \                         /
                \---------+-----------/
                          |
                   {~E(a), C(a)}
                          |
                     \    |  {E(a)}
                      \   |  /
                      {C(a)}
                          \
                           \   {~E(x''),~C(x'')}
                            \   /
                         {~E(a)}
                              \
                               \   {E(a)}
                                \   /
                                 {}
```

**Chaine logique :** L'etudiant a (temoin de Skolem de P3) travaille, donc il reussit (P1), donc il est content (P2). Supposer qu'aucun etudiant n'est content mene a contradiction.

---

## Exercice 10 : Interpretation et modeles (type ExoCours Diapo 157-158)

### Enonce

Soit G = `Ex, (P(a, x) /\ (Ay, Ez, (Q(x, f(y, z)) -> (Q(y, a) \/ Q(y, x)))))`

Soit l'interpretation M :
- D_M = N (entiers naturels)
- a_M = 1
- f_M = multiplication (f(y,z) = y * z)
- P_M = < (strictement inferieur)
- Q_M = = (egalite)

Q1 : L'interpretation M est-elle modele de G ?

Q2 : Donner un modele a domaine fini pour les formules A1, A2, A3 definies par :
- A1 = `Ax, Ay, Az, ((P(x,y) /\ P(y,z)) -> P(x,z))`
- A2 = `Ax, (P(a,x) \/ P(x,b))`
- A3 = `Ax, P(x, f(x))`

Q3 : Montrer que {A1, A2, A3} n'implique pas `Ex, P(x, a)`.

### Solution detaillee

**Q1 : Verification du modele**

Traduisons G dans l'interpretation M :
```
Ex, (1 < x /\ (Ay, Ez, (x = y*z -> (y = 1 \/ y = x))))
```

Lecture : "Il existe un x > 1 tel que, pour tout y et z, si x = y*z alors y = 1 ou y = x."

Autrement dit : il existe un entier strictement superieur a 1 qui, s'il peut s'ecrire comme produit de deux facteurs, a forcement 1 ou lui-meme comme facteur. C'est la definition d'un **nombre premier**.

Puisqu'il existe des nombres premiers dans N (par exemple x = 2), la formule est **vraie** dans cette interpretation.

Verification explicite pour x = 2 :
- P(a, 2) = P(1, 2) = 1 < 2 = V
- Pour tout y, z : si 2 = y*z, alors y = 1 ou y = 2.
  - y = 1, z = 2 : 2 = 1*2, et y = 1. V.
  - y = 2, z = 1 : 2 = 2*1, et y = 2. V.
  - Aucun autre couple (y,z) d'entiers naturels ne donne y*z = 2.

**M est un modele de G.**

**Q2 : Modele a domaine fini**

*Astuce :* chercher une interpretation ou P(x,y) est toujours vrai. Cela simplifie enormement la verification.

Interpretation M1 :
```
D_M1 = {0, 1}
a_M1 = 0
b_M1 = 1
f_M1(x) = x         (identite, ou n'importe quelle fonction)
P_M1 = toujours vrai (pour tout x,y : P(x,y) = V)
```

Verification :
- A1 : `Ax,Ay,Az, (P(x,y) /\ P(y,z)) -> P(x,z)` = `(V /\ V) -> V` = V pour tout x,y,z. **OK.**
- A2 : `Ax, P(a,x) \/ P(x,b)` = `V \/ V` = V pour tout x. **OK.**
- A3 : `Ax, P(x, f(x))` = V pour tout x. **OK.**

**Q3 : Non-consequence**

On cherche un modele de {A1, A2, A3} qui ne satisfait PAS `Ex, P(x, a)`.

`Ex, P(x, a)` dit "il existe un x tel que P(x, a)". Pour que ce soit faux, il faut P(x, a) = F pour tout x.

Interpretation M3 :
```
D_M3 = N (entiers naturels)
a_M3 = 0
b_M3 = 9
f_M3(x) = x + 1     (successeur)
P_M3 = <             (strictement inferieur)
```

Verification de {A1, A2, A3} :
- A1 (transitivite) : Si x < y et y < z, alors x < z. **V** (transitivite de <).
- A2 : Pour tout x, 0 < x ou x < 9. **V** (si x = 0, alors 0 < 9 est vrai).
  - Pour x = 0 : P(0,0) = 0<0 = F, mais P(0,9) = 0<9 = V. V \/ V ou F \/ V selon le cote. Verifions : P(a,x) \/ P(x,b) = P(0,0) \/ P(0,9) = F \/ V = V. OK.
  - Pour x = 5 : P(0,5) = V, donc V \/ ... = V. OK.
- A3 : Pour tout x, P(x, f(x)) = x < x+1. **V** pour tout x dans N.

Verification de `Ex, P(x, a)` :
- `Ex, P(x, 0)` = il existe x tel que x < 0.
- Dans N, il n'existe aucun x tel que x < 0. **F.**

**Conclusion :** M3 satisfait A1, A2, A3 mais pas `Ex, P(x,a)`. Donc `Ex, P(x,a)` n'est **pas** consequence logique de {A1, A2, A3}.

**Remarque pedagogique :** Pour montrer qu'une formule n'est PAS consequence d'un ensemble H, on ne peut PAS utiliser la resolution (qui ne prouve que les consequences). Il FAUT exhiber un contre-modele : une interpretation ou H est vrai mais la formule est fausse.
