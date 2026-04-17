---
title: "Exercices -- Resolution"
sidebar_position: 3
---

# Exercices -- Resolution

---

## Exercice 1 : Tautologie -- contraposee

### Enonce
Prouver par resolution que `(p -> q) -> (~q -> ~p)` est une tautologie.

### Solution detaillee

**Etape 1 : Nier la formule.**

On veut montrer que la negation est insatisfiable.
```
~((p -> q) -> (~q -> ~p))
```

**Etape 2 : Simplifier la negation -- mettre en FNC.**

Rappel : `~(A -> B) = A /\ ~B`.

```
~((p -> q) -> (~q -> ~p))
= (p -> q) /\ ~(~q -> ~p)                [~(A -> B) = A /\ ~B]
= (p -> q) /\ (~q) /\ ~(~p)              [~(A -> B) = A /\ ~B, avec A = ~q, B = ~p]
= (p -> q) /\ ~q /\ ~~p                  [donc ~(~q -> ~p) = ~q /\ ~~p]
= (p -> q) /\ ~q /\ p                    [double negation : ~~p = p]
= (~p \/ q) /\ ~q /\ p                   [elimination de -> : p -> q = ~p \/ q]
```

**Etape 3 : Identifier les clauses.**

La formule est en FNC (ET de clauses) :
```
C1 = {~p, q}       (de ~p \/ q)
C2 = {~q}           (de ~q)
C3 = {p}             (de p)
```

**Etape 4 : Appliquer la resolution.**

```
Pas 1 : Res(C1, C2) sur q
   C1 = {~p, q}    C2 = {~q}
   On supprime q et ~q, on fusionne le reste.
   C4 = {~p}

Pas 2 : Res(C4, C3) sur p
   C4 = {~p}       C3 = {p}
   On supprime ~p et p, on fusionne le reste.
   C5 = {}          (clause vide !)
```

**Conclusion :** La clause vide a ete derivee. Donc ~F est insatisfiable, donc F est une **tautologie**. CQFD.

**Arbre de resolution :**
```
   {~p, q}     {~q}
       \         /
        {~p}         (C4 = Res(C1, C2) sur q)
          \
           \    {p}
            \   /
             {}       (C5 = Res(C4, C3) sur p)
```

---

## Exercice 2 : Consequence logique -- syllogisme hypothetique

### Enonce
Prouver par resolution que `{p -> q, q -> r} |= p -> r`.

### Solution detaillee

**Etape 1 : Former l'ensemble de clauses.**

Premisses (hypotheses) -- on les met en clauses directement :
```
p -> q   =  ~p \/ q   -->   C1 = {~p, q}
q -> r   =  ~q \/ r   -->   C2 = {~q, r}
```

Negation de la conclusion :
```
~(p -> r) = ~(~p \/ r) = ~~p /\ ~r = p /\ ~r
```

Cela donne deux clauses :
```
C3 = {p}
C4 = {~r}
```

**Ensemble complet de clauses :**
```
C1 = {~p, q}
C2 = {~q, r}
C3 = {p}
C4 = {~r}
```

**Etape 2 : Appliquer la resolution.**

```
Pas 1 : Res(C1, C3) sur p
   C1 = {~p, q}    C3 = {p}
   On supprime ~p et p.
   C5 = {q}

Pas 2 : Res(C2, C5) sur q
   C2 = {~q, r}    C5 = {q}
   On supprime ~q et q.
   C6 = {r}

Pas 3 : Res(C6, C4) sur r
   C6 = {r}         C4 = {~r}
   On supprime r et ~r.
   C7 = {}          (clause vide !)
```

**Conclusion :** Clause vide obtenue. `p -> r` est bien consequence logique de `{p -> q, q -> r}`. C'est le **syllogisme hypothetique**.

**Arbre de resolution :**
```
   {~p, q}     {p}
       \        /
        {q}              (C5)
          \
           \    {~q, r}
            \    /
             {r}         (C6)
               \
                \  {~r}
                 \  /
                  {}     (C7 = clause vide)
```

---

## Exercice 3 : Insatisfiabilite d'un ensemble de clauses

### Enonce
Montrer que l'ensemble `{p \/ q, p \/ ~q, ~p \/ q, ~p \/ ~q}` est insatisfiable.

### Solution detaillee

**Etape 1 : Identifier les clauses.**
```
C1 = {p, q}
C2 = {p, ~q}
C3 = {~p, q}
C4 = {~p, ~q}
```

**Etape 2 : Resolution.**

```
Pas 1 : Res(C1, C2) sur q
   C1 = {p, q}      C2 = {p, ~q}
   Supprime q et ~q, fusionne le reste.
   C5 = {p}          (attention : p \/ p = p par idempotence, on ne met p qu'une fois)

Pas 2 : Res(C3, C4) sur q
   C3 = {~p, q}     C4 = {~p, ~q}
   Supprime q et ~q, fusionne le reste.
   C6 = {~p}

Pas 3 : Res(C5, C6) sur p
   C5 = {p}          C6 = {~p}
   Supprime p et ~p.
   C7 = {}           (clause vide !)
```

**Conclusion :** L'ensemble est **insatisfiable**.

**Verification intuitive :**
- C1 et C2 ensemble : (p \/ q) /\ (p \/ ~q) = p \/ (q /\ ~q) = p \/ F = p. Donc p doit etre vrai.
- C3 et C4 ensemble : (~p \/ q) /\ (~p \/ ~q) = ~p \/ (q /\ ~q) = ~p \/ F = ~p. Donc p doit etre faux.
- p vrai ET p faux : **contradiction**.

---

## Exercice 4 : Resolution au premier ordre -- tautologie simple

### Enonce
Prouver par resolution que `(Ax, P(x)) -> P(a)` est une tautologie (a est une constante).

### Solution detaillee

**Etape 1 : Nier la formule.**
```
~((Ax, P(x)) -> P(a))
= (Ax, P(x)) /\ ~P(a)              [~(A -> B) = A /\ ~B]
```

**Etape 2 : Mettre en clauses.**

`Ax, P(x)` donne directement la clause : C1 = {P(x)} (x est universellement quantifie, implicite).
`~P(a)` donne : C2 = {~P(a)}.

```
C1 = {P(x)}
C2 = {~P(a)}
```

**Etape 3 : Resolution avec unification.**

Pour resoudre C1 et C2, on doit unifier P(x) et P(a) :
```
Unifier P(x) et P(a) :
   x est une variable, a est une constante.
   MGU sigma = {x <- a}
```

Resolvante :
```
Res(C1, C2) avec sigma = {x <- a}
= ({P(x)} \ {P(x)} union {~P(a)} \ {~P(a)}) sigma
= {} sigma
= {}                                (clause vide !)
```

**Conclusion :** Clause vide derivee. C'est une **tautologie**.

---

## Exercice 5 : Resolution au premier ordre -- parite (type DS 2021)

### Enonce
H = {P(0), Ax, (P(x) -> P(s(s(x))))}. Prouver que P(s(s(s(s(0))))) est consequence de H.

### Solution detaillee

**Etape 1 : Mettre les hypotheses en clauses.**

Hypothese 1 : P(0)
```
C1 = {P(0)}
```

Hypothese 2 : Ax, (P(x) -> P(s(s(x))))
```
= Ax, (~P(x) \/ P(s(s(x))))
C2 = {~P(x), P(s(s(x)))}
```

**Etape 2 : Nier la conclusion et mettre en clause.**
```
~P(s(s(s(s(0)))))
C3 = {~P(s(s(s(s(0)))))}
```

**Etape 3 : Resolution avec unification -- pas a pas.**

```
Pas 1 : Res(C2, C1) sur P
   Litteraux : P(s(s(x))) dans C2 (positif) et ... non, soyons precis.
   C2 = {~P(x), P(s(s(x)))}
   C1 = {P(0)}
   
   On unifie le litteral NEGATIF ~P(x) de C2 avec le litteral POSITIF P(0) de C1.
   Unifier P(x) et P(0) : sigma = {x <- 0}
   
   Resolvante = ({P(s(s(x)))} union {}) sigma = {P(s(s(0)))} 
   C4 = {P(s(s(0)))}
```

```
Pas 2 : Res(C2, C4) sur P
   C2 = {~P(x'), P(s(s(x')))}      (on renomme x en x' pour eviter les conflits)
   C4 = {P(s(s(0)))}
   
   Unifier P(x') et P(s(s(0))) : sigma = {x' <- s(s(0))}
   
   Resolvante = {P(s(s(x')))} sigma = {P(s(s(s(s(0)))))}
   C5 = {P(s(s(s(s(0)))))}
```

```
Pas 3 : Res(C5, C3) sur P
   C5 = {P(s(s(s(s(0)))))}
   C3 = {~P(s(s(s(s(0)))))}
   
   Unifier P(s(s(s(s(0))))) et P(s(s(s(s(0))))) : identiques, sigma = {}
   
   Resolvante = {} union {} = {}
   C6 = {}                          (clause vide !)
```

**Conclusion :** P(s(s(s(s(0))))) est bien consequence de H. Intuitivement : P(0) est vrai, et P(x) -> P(s(s(x))) permet de "monter" de 2 en 2. Donc P(0) -> P(2) -> P(4).

**Arbre de resolution :**
```
   {~P(x), P(s(s(x)))}     {P(0)}
            \                  /
             {P(s(s(0)))}               (C4, sigma={x<-0})
                   \
                    \   {~P(x'), P(s(s(x')))}
                     \     /
              {P(s(s(s(s(0)))))}        (C5, sigma={x'<-s(s(0))})
                       \
                        \   {~P(s(s(s(s(0)))))}
                         \   /
                          {}            (C6, clause vide)
```

---

## Exercice 6 : Bebes et crocodiles (DS 2019)

### Enonce
Premisses :
- A1 : Tous les bebes sont illogiques -- Ax, (BB(x) -> ~L(x))
- A2 : Tous ceux qui domptent un crocodile sont respectes -- Ax, (DC(x) -> R(x))
- A3 : Toutes les personnes illogiques ne sont pas respectees -- Ax, (~L(x) -> ~R(x))

Prouver : ~(Ex, (BB(x) /\ DC(x))) ("Aucun bebe ne peut dompter un crocodile")

### Solution detaillee

**Etape 1 : Mise en clauses des premisses.**

A1 : Ax, (~BB(x) \/ ~L(x))
```
C1 = {~BB(x), ~L(x)}
```

A2 : Ax, (~DC(x) \/ R(x))
```
C2 = {~DC(x), R(x)}
```

A3 : Ax, (~(~L(x)) \/ ~R(x)) = Ax, (L(x) \/ ~R(x))
```
C3 = {L(x), ~R(x)}
```

**Etape 2 : Nier la conclusion et mettre en clauses.**

```
~(~(Ex, (BB(x) /\ DC(x))))
= Ex, (BB(x) /\ DC(x))
```

Skolemiser Ex avec la constante a :
```
BB(a) /\ DC(a)
C4 = {BB(a)}
C5 = {DC(a)}
```

**Etape 3 : Resolution -- pas a pas.**

```
Pas 1 : Res(C1, C4) sur BB
   C1 = {~BB(x), ~L(x)}     C4 = {BB(a)}
   Unifier BB(x) et BB(a) : sigma = {x <- a}
   Resolvante = {~L(x)} sigma = {~L(a)}
   C6 = {~L(a)}
```

```
Pas 2 : Res(C3, C6) sur L
   C3 = {L(x'), ~R(x')}     C6 = {~L(a)}     (renommage x -> x')
   Unifier L(x') et L(a) : sigma = {x' <- a}
   Resolvante = {~R(x')} sigma = {~R(a)}
   C7 = {~R(a)}
```

```
Pas 3 : Res(C2, C5) sur DC
   C2 = {~DC(x''), R(x'')}   C5 = {DC(a)}    (renommage x -> x'')
   Unifier DC(x'') et DC(a) : sigma = {x'' <- a}
   Resolvante = {R(x'')} sigma = {R(a)}
   C8 = {R(a)}
```

```
Pas 4 : Res(C7, C8) sur R
   C7 = {~R(a)}              C8 = {R(a)}
   Unifier R(a) et R(a) : identiques, sigma = {}
   Resolvante = {}
   C9 = {}                   (clause vide !)
```

**Conclusion :** Clause vide derivee. Aucun bebe ne peut dompter un crocodile. CQFD.

**Chaine logique :** Si un bebe (BB(a)) domptait un croco (DC(a)), alors :
- BB(a) -> ~L(a) : il serait illogique
- ~L(a) -> ~R(a) : il ne serait pas respecte
- DC(a) -> R(a) : il serait respecte
- Contradiction : ~R(a) et R(a)

---

## Exercice 7 : Patients et docteurs (DS 2019)

### Enonce
Premisses :
- A1 : Certains patients aiment tous les docteurs -- Ex, (P(x) /\ Ay, (D(y) -> A(x,y)))
- A2 : Aucun patient n'aime les charlatans -- Ax, (P(x) -> Ay, (C(y) -> ~A(x,y)))

Prouver : Ax, (D(x) -> ~C(x)) ("Aucun docteur n'est un charlatan")

### Solution detaillee

**Etape 1 : Mise en clauses des premisses.**

A1 : Ex, (P(x) /\ Ay, (D(y) -> A(x,y)))
- Skolemiser Ex par la constante a :
```
P(a) /\ Ay, (~D(y) \/ A(a,y))
```
Clauses :
```
C1 = {P(a)}
C2 = {~D(y), A(a,y)}
```

A2 : Ax, (P(x) -> Ay, (C(y) -> ~A(x,y)))
```
= Ax, Ay, (~P(x) \/ ~C(y) \/ ~A(x,y))
```
Clause :
```
C3 = {~P(x), ~C(y), ~A(x,y)}
```

**Etape 2 : Nier la conclusion et mettre en clauses.**

```
~(Ax, (D(x) -> ~C(x)))
= Ex, (D(x) /\ ~~C(x))
= Ex, (D(x) /\ C(x))
```

Skolemiser Ex par la constante b :
```
C4 = {D(b)}
C5 = {C(b)}
```

**Etape 3 : Resolution -- pas a pas.**

```
Pas 1 : Res(C2, C4) sur D
   C2 = {~D(y), A(a,y)}     C4 = {D(b)}
   Unifier D(y) et D(b) : sigma = {y <- b}
   Resolvante = {A(a,y)} sigma = {A(a,b)}
   C6 = {A(a,b)}
```

```
Pas 2 : Res(C3, C1) sur P
   C3 = {~P(x), ~C(y'), ~A(x,y')}     C1 = {P(a)}     (renommage y -> y')
   Unifier P(x) et P(a) : sigma = {x <- a}
   Resolvante = {~C(y'), ~A(a,y')}
   C7 = {~C(y'), ~A(a,y')}
```

```
Pas 3 : Res(C7, C5) sur C
   C7 = {~C(y'), ~A(a,y')}     C5 = {C(b)}
   Unifier C(y') et C(b) : sigma = {y' <- b}
   Resolvante = {~A(a,y')} sigma = {~A(a,b)}
   C8 = {~A(a,b)}
```

```
Pas 4 : Res(C6, C8) sur A
   C6 = {A(a,b)}              C8 = {~A(a,b)}
   Unifier A(a,b) et A(a,b) : identiques, sigma = {}
   Resolvante = {}
   C9 = {}                    (clause vide !)
```

**Conclusion :** Clause vide derivee. Aucun docteur n'est un charlatan. CQFD.

**Chaine logique :** Le patient a (qui existe par A1) aime tous les docteurs. Si un docteur b etait charlatan, alors a aimerait b (car b est docteur) mais a n'aimerait pas b (car b est charlatan et aucun patient n'aime les charlatans). Contradiction.

---

## Exercice 8 : Dragons (type DS 2023)

### Enonce
Hypotheses :
- A1 : Ex, Dragon(x)
- A2 : Ax, (Dragon(x) -> (Sleep(x) \/ Hunt(x)))
- A3 : Ax, (Dragon(x) -> (Hungry(x) -> ~Sleep(x)))
- A4 : Ax, (Dragon(x) -> (Tired(x) -> ~Hunt(x)))

Montrer que F5 = Ax, ((Dragon(x) /\ Tired(x)) -> Sleep(x)) est consequence.

### Solution detaillee

**Etape 1 : Mise en clauses des hypotheses.**

A1 : Ex, Dragon(x). Skolemiser : Dragon(a).
```
C1 = {Dragon(a)}
```

A2 : Ax, (~Dragon(x) \/ Sleep(x) \/ Hunt(x))
```
C2 = {~Dragon(x), Sleep(x), Hunt(x)}
```

A3 : Ax, (Dragon(x) -> (Hungry(x) -> ~Sleep(x)))
```
= Ax, (~Dragon(x) \/ ~Hungry(x) \/ ~Sleep(x))
C3 = {~Dragon(x), ~Hungry(x), ~Sleep(x)}
```

A4 : Ax, (Dragon(x) -> (Tired(x) -> ~Hunt(x)))
```
= Ax, (~Dragon(x) \/ ~Tired(x) \/ ~Hunt(x))
C4 = {~Dragon(x), ~Tired(x), ~Hunt(x)}
```

**Etape 2 : Nier la conclusion.**

```
~F5 = ~(Ax, ((Dragon(x) /\ Tired(x)) -> Sleep(x)))
     = Ex, (Dragon(x) /\ Tired(x) /\ ~Sleep(x))
```

Skolemiser Ex par la constante b :
```
C5 = {Dragon(b)}
C6 = {Tired(b)}
C7 = {~Sleep(b)}
```

**Etape 3 : Resolution -- pas a pas.**

```
Pas 1 : Res(C2, C7) sur Sleep
   C2 = {~Dragon(x), Sleep(x), Hunt(x)}     C7 = {~Sleep(b)}
   Unifier Sleep(x) et Sleep(b) : sigma = {x <- b}
   Resolvante = {~Dragon(b), Hunt(b)}
   C8 = {~Dragon(b), Hunt(b)}
```

```
Pas 2 : Res(C8, C5) sur Dragon
   C8 = {~Dragon(b), Hunt(b)}     C5 = {Dragon(b)}
   Unifier Dragon(b) et Dragon(b) : sigma = {}
   Resolvante = {Hunt(b)}
   C9 = {Hunt(b)}
```

```
Pas 3 : Res(C4, C9) sur Hunt
   C4 = {~Dragon(x'), ~Tired(x'), ~Hunt(x')}     C9 = {Hunt(b)}
   Unifier Hunt(x') et Hunt(b) : sigma = {x' <- b}
   Resolvante = {~Dragon(b), ~Tired(b)}
   C10 = {~Dragon(b), ~Tired(b)}
```

```
Pas 4 : Res(C10, C5) sur Dragon
   C10 = {~Dragon(b), ~Tired(b)}     C5 = {Dragon(b)}
   Resolvante = {~Tired(b)}
   C11 = {~Tired(b)}
```

```
Pas 5 : Res(C11, C6) sur Tired
   C11 = {~Tired(b)}     C6 = {Tired(b)}
   Resolvante = {}
   C12 = {}               (clause vide !)
```

**Conclusion :** Clause vide derivee en 5 pas de resolution. F5 est consequence de {A1, A2, A3, A4}. CQFD.

**Logique du raisonnement :** Un dragon fatigue et non endormi devrait chasser (A2). Mais un dragon fatigue ne peut pas chasser (A4). Contradiction. Donc un dragon fatigue dort.

---

## Exercice 9 : Non-consequence -- par interpretation (type DS 2023 suite)

### Enonce
Montrer que F6 = Ax, ((Dragon(x) /\ Hungry(x)) -> ~Hunt(x)) n'est PAS consequence de {A1, A2, A3, A4}.

### Solution detaillee

**Methode :** Trouver une interpretation (un contre-exemple) ou A1-A4 sont toutes vraies mais F6 est fausse.

F6 fausse signifie : il existe un dragon affame qui chasse.

**Construction de l'interpretation :**
- Domaine D = {d} (un seul objet)
- Dragon(d) = V
- Hungry(d) = V
- Hunt(d) = V
- Sleep(d) = F
- Tired(d) = F

**Verification de chaque hypothese :**

A1 : Ex, Dragon(x) = Dragon(d) = V. **OK.**

A2 : Ax, (Dragon(x) -> (Sleep(x) \/ Hunt(x)))
- Dragon(d) -> (Sleep(d) \/ Hunt(d))
- V -> (F \/ V)
- V -> V = **V. OK.**

A3 : Ax, (Dragon(x) -> (Hungry(x) -> ~Sleep(x)))
- Dragon(d) -> (Hungry(d) -> ~Sleep(d))
- V -> (V -> ~F)
- V -> (V -> V)
- V -> V = **V. OK.**

A4 : Ax, (Dragon(x) -> (Tired(x) -> ~Hunt(x)))
- Dragon(d) -> (Tired(d) -> ~Hunt(d))
- V -> (F -> ~V)
- V -> (F -> F)
- V -> V = **V. OK.** (Tired(d) = F, donc F -> ... = V)

**Verification de F6 :**

F6 : Ax, ((Dragon(x) /\ Hungry(x)) -> ~Hunt(x))
- (Dragon(d) /\ Hungry(d)) -> ~Hunt(d)
- (V /\ V) -> ~V
- V -> F = **F !**

**Conclusion :** Les hypotheses A1-A4 sont toutes vraies mais F6 est fausse dans cette interpretation. Donc F6 n'est **pas** consequence logique de {A1, A2, A3, A4}.

**Intuition :** Les hypotheses ne disent pas qu'un dragon affame ne peut pas chasser. Elles disent seulement qu'un dragon affame ne dort pas (A3) et qu'un dragon fatigue ne chasse pas (A4). Etre affame et chasser en meme temps est compatible avec les hypotheses (a condition de ne pas etre fatigue).

---

## Exercice 10 : Conversion en clauses et resolution (type ExoCours Diapo 103)

### Enonce
Soient :
- H1 = `(I /\ t) -> (m \/ w)`
- H2 = `w -> ((m /\ ~t) \/ ~I)`
- H3 = `(m /\ t) -> w`

Montrer en utilisant la resolution que `{H1, H2, H3} |= I -> ~t`.

### Solution detaillee

**Etape 1 : Convertir les hypotheses en clauses.**

H1 = `(I /\ t) -> (m \/ w)` :
```
= ~(I /\ t) \/ (m \/ w)
= ~I \/ ~t \/ m \/ w
```
Clause : `C1 = {~I, ~t, m, w}`

H2 = `w -> ((m /\ ~t) \/ ~I)` :
```
= ~w \/ ((m /\ ~t) \/ ~I)
= ~w \/ ((m \/ ~I) /\ (~t \/ ~I))          [distributivite de \/ sur /\]
= (~w \/ m \/ ~I) /\ (~w \/ ~t \/ ~I)      [distributivite de \/ sur /\]
```
Deux clauses :
```
C2 = {~w, m, ~I}
C3 = {~w, ~t, ~I}
```

H3 = `(m /\ t) -> w` :
```
= ~(m /\ t) \/ w
= ~m \/ ~t \/ w
```
Clause : `C4 = {~m, ~t, w}`

**Etape 2 : Nier la conclusion et mettre en clauses.**

```
~(I -> ~t) = ~(~I \/ ~t) = I /\ t
```
Deux clauses :
```
C5 = {I}
C6 = {t}
```

**Ensemble complet :**
```
C1 = {~I, ~t, m, w}
C2 = {~w, m, ~I}
C3 = {~w, ~t, ~I}
C4 = {~m, ~t, w}
C5 = {I}
C6 = {t}
```

**Etape 3 : Resolution.**

```
Pas 1 : Res(C3, C5) sur I
   C3 = {~w, ~t, ~I}     C5 = {I}
   Resolvante = {~w, ~t}
   C7 = {~w, ~t}

Pas 2 : Res(C7, C6) sur t
   C7 = {~w, ~t}          C6 = {t}
   Resolvante = {~w}
   C8 = {~w}

Pas 3 : Res(C4, C6) sur t
   C4 = {~m, ~t, w}       C6 = {t}
   Resolvante = {~m, w}
   C9 = {~m, w}

Pas 4 : Res(C9, C8) sur w
   C9 = {~m, w}           C8 = {~w}
   Resolvante = {~m}
   C10 = {~m}

Pas 5 : Res(C1, C5) sur I
   C1 = {~I, ~t, m, w}    C5 = {I}
   Resolvante = {~t, m, w}
   C11 = {~t, m, w}

Pas 6 : Res(C11, C6) sur t
   C11 = {~t, m, w}       C6 = {t}
   Resolvante = {m, w}
   C12 = {m, w}

Pas 7 : Res(C12, C10) sur m
   C12 = {m, w}           C10 = {~m}
   Resolvante = {w}
   C13 = {w}

Pas 8 : Res(C13, C8) sur w
   C13 = {w}              C8 = {~w}
   Resolvante = {}
   C14 = {}                (clause vide !)
```

**Conclusion :** Clause vide derivee. `I -> ~t` est bien consequence de {H1, H2, H3}. CQFD.

**Point methodologique -- conversion de H2 :** L'exercice illustre une difficulte courante : quand l'elimination de -> donne `~w \/ ((m /\ ~t) \/ ~I)`, il faut distribuer pour obtenir une conjonction de clauses. H2 produit donc DEUX clauses (C2 et C3), pas une seule. Oublier de distribuer est une erreur classique d'examen.
