---
title: "Exercices -- Deduction naturelle"
sidebar_position: 6
---

# Exercices -- Deduction naturelle

---

## Exercice 1 : Modus tollens

### Enonce
Prouver : p -> q, ~q |- ~p

### Preuve detaillee

**Strategie :** La conclusion est ~p. Pour introduire une negation (~-I), on suppose p et on cherche une contradiction (faux, _|_).

```
1.  p -> q              [hypothese]
2.  ~q                  [hypothese]
3.  | [p]               [hypothese temporaire -- on suppose p pour obtenir ~p par ~-I]
4.  | q                 [->-E (modus ponens) sur 3 et 1 : on a p, et p -> q, donc q]
5.  | _|_               [~-E sur 4 et 2 : on a q et ~q, contradiction]
6.  ~p                  [~-I, decharge de 3 : en supposant p on a obtenu _|_, donc ~p]
```

**Justification de chaque pas :**
- Ligne 3 : hypothese temporaire pour preparer ~-I
- Ligne 4 : modus ponens (->-E). Premisses : p (ligne 3) et p -> q (ligne 1). Conclusion : q.
- Ligne 5 : contradiction (~-E). Premisses : q (ligne 4) et ~q (ligne 2). Conclusion : _|_.
- Ligne 6 : introduction de la negation (~-I). On avait suppose p (ligne 3) et obtenu _|_ (ligne 5). Donc ~p est prouve, et l'hypothese p est dechargee.

---

## Exercice 2 : Loi de De Morgan (sens 1)

### Enonce
Prouver : ~(p \/ q) |- ~p /\ ~q

### Preuve detaillee

**Strategie :** La conclusion est ~p /\ ~q (un ET). Pour /\-I, il faut prouver ~p et ~q separement. Pour prouver chaque negation, on utilise ~-I.

```
1.  ~(p \/ q)           [hypothese]
    
    -- Sous-preuve A : prouver ~p
2.  | [p]               [hypothese temporaire pour ~-I]
3.  | p \/ q            [\/-I1 sur 2 : de p, on deduit p \/ q]
4.  | _|_               [~-E sur 3 et 1 : on a p \/ q et ~(p \/ q), contradiction]
5.  ~p                  [~-I, decharge de 2]
    
    -- Sous-preuve B : prouver ~q
6.  | [q]               [hypothese temporaire pour ~-I]
7.  | p \/ q            [\/-I2 sur 6 : de q, on deduit p \/ q]
8.  | _|_               [~-E sur 7 et 1 : on a p \/ q et ~(p \/ q), contradiction]
9.  ~q                  [~-I, decharge de 6]
    
    -- Combiner
10. ~p /\ ~q            [/\-I sur 5 et 9]
```

**Justification de chaque pas :**
- Lignes 2-5 : sous-preuve pour ~p. On suppose p, on construit p \/ q par \/-I1, on obtient une contradiction avec l'hypothese ~(p \/ q), donc ~p.
- Lignes 6-9 : sous-preuve pour ~q. Meme schema avec q et \/-I2.
- Ligne 10 : on combine ~p et ~q avec /\-I.

---

## Exercice 3 : De Morgan (sens 2)

### Enonce
Prouver : ~p /\ ~q |- ~(p \/ q)

### Preuve detaillee

**Strategie :** La conclusion est ~(p \/ q) (negation). On utilise ~-I : supposer p \/ q et chercher _|_. Comme on suppose un OU, il faudra faire un raisonnement par cas (\/-E).

```
1.  ~p /\ ~q            [hypothese]
2.  ~p                  [/\-E1 sur 1 : extraction du premier conjonct]
3.  ~q                  [/\-E2 sur 1 : extraction du deuxieme conjonct]
4.  | [p \/ q]          [hypothese temporaire pour ~-I]
    |
    |   -- Cas 1 : supposons p
5.  |   | [p]           [hypothese temporaire pour \/-E, cas 1]
6.  |   | _|_           [~-E sur 5 et 2 : on a p et ~p, contradiction]
    |
    |   -- Cas 2 : supposons q
7.  |   | [q]           [hypothese temporaire pour \/-E, cas 2]
8.  |   | _|_           [~-E sur 7 et 3 : on a q et ~q, contradiction]
    |
9.  | _|_               [\/-E sur 4, 6, 8 : dans les deux cas, on obtient _|_. Decharge 5, 7.]
10. ~(p \/ q)           [~-I, decharge de 4 : en supposant p \/ q, on a obtenu _|_]
```

**Justification de chaque pas :**
- Lignes 2-3 : extraire les deux negations de l'hypothese.
- Ligne 4 : hypothese temporaire p \/ q pour preparer ~-I.
- Lignes 5-6 : cas p -> contradiction avec ~p.
- Lignes 7-8 : cas q -> contradiction avec ~q.
- Ligne 9 : \/-E combine les deux cas. Les deux branches donnent _|_, donc _|_.
- Ligne 10 : ~-I conclut ~(p \/ q).

---

## Exercice 4 : Exportation

### Enonce
Prouver : (p /\ q) -> r |- p -> (q -> r)

### Preuve detaillee

**Strategie :** La conclusion est p -> (q -> r). C'est une implication. On utilise ->-I : supposer p, prouver q -> r. Ensuite q -> r est aussi une implication : supposer q, prouver r. On aura p et q, donc p /\ q, et avec l'hypothese (p /\ q) -> r, on obtient r.

```
1.  (p /\ q) -> r       [hypothese]
2.  | [p]               [hypothese temporaire pour ->-I (implication externe)]
3.  |   | [q]           [hypothese temporaire pour ->-I (implication interne)]
4.  |   | p /\ q        [/\-I sur 2 et 3 : on combine p et q]
5.  |   | r             [->-E sur 4 et 1 : on a p /\ q et (p /\ q) -> r, donc r]
6.  |   q -> r          [->-I, decharge de 3 : en supposant q, on a obtenu r]
7.  p -> (q -> r)       [->-I, decharge de 2 : en supposant p, on a obtenu q -> r]
```

**Justification de chaque pas :**
- Ligne 2 : hypothese temporaire p (pour la fleche externe).
- Ligne 3 : hypothese temporaire q (pour la fleche interne).
- Ligne 4 : /\-I combine p (ligne 2, dans la portee) et q (ligne 3).
- Ligne 5 : modus ponens avec (p /\ q) -> r.
- Ligne 6 : ->-I decharge q, obtient q -> r.
- Ligne 7 : ->-I decharge p, obtient p -> (q -> r).

---

## Exercice 5 : Importation (sens inverse de l'exportation)

### Enonce
Prouver : p -> (q -> r) |- (p /\ q) -> r

### Preuve detaillee

**Strategie :** La conclusion est (p /\ q) -> r. On utilise ->-I : supposer p /\ q, prouver r. De p /\ q on extrait p et q, puis on utilise l'hypothese deux fois.

```
1.  p -> (q -> r)        [hypothese]
2.  | [p /\ q]           [hypothese temporaire pour ->-I]
3.  | p                  [/\-E1 sur 2 : extraction de p]
4.  | q                  [/\-E2 sur 2 : extraction de q]
5.  | q -> r             [->-E sur 3 et 1 : on a p et p -> (q -> r), donc q -> r]
6.  | r                  [->-E sur 4 et 5 : on a q et q -> r, donc r]
7.  (p /\ q) -> r        [->-I, decharge de 2]
```

---

## Exercice 6 : Tiers exclu (classique, avec RAA)

### Enonce
Prouver : |- p \/ ~p

### Preuve detaillee

**Strategie :** C'est une tautologie sans hypotheses. On ne peut pas la prouver en logique intuitionniste. En logique classique, on utilise RAA (Reductio Ad Absurdum) : supposer ~(p \/ ~p), trouver _|_, conclure p \/ ~p.

```
1.  | [~(p \/ ~p)]       [hypothese temporaire pour RAA]
    |
    |   -- Sous-preuve : montrons ~p
2.  |   | [p]            [hypothese temporaire pour ~-I]
3.  |   | p \/ ~p        [\/-I1 sur 2 : de p, on deduit p \/ ~p]
4.  |   | _|_            [~-E sur 3 et 1 : contradiction avec ~(p \/ ~p)]
5.  |   ~p               [~-I, decharge de 2 : en supposant p, contradiction, donc ~p]
    |
6.  | p \/ ~p            [\/-I2 sur 5 : de ~p, on deduit p \/ ~p]
7.  | _|_                [~-E sur 6 et 1 : contradiction avec ~(p \/ ~p)]
8.  p \/ ~p              [RAA, decharge de 1 : en supposant ~(p \/ ~p), contradiction]
```

**Justification de chaque pas :**
- Ligne 1 : on suppose ~(p \/ ~p) pour appliquer RAA.
- Lignes 2-5 : on prouve ~p (en supposant p, on obtient p \/ ~p qui contredit l'hypothese 1).
- Ligne 6 : de ~p on obtient p \/ ~p par \/-I2.
- Ligne 7 : p \/ ~p contredit encore l'hypothese 1.
- Ligne 8 : RAA conclut p \/ ~p (l'hypothese ~(p \/ ~p) mene a contradiction).

**Note :** La regle RAA (supposer ~A, trouver _|_, conclure A) est DIFFERENTE de ~-I (supposer A, trouver _|_, conclure ~A). RAA n'est valide qu'en logique classique.

---

## Exercice 7 : Syllogisme disjonctif

### Enonce
Prouver : p \/ q, ~p |- q

### Preuve detaillee

**Strategie :** On a p \/ q (un OU). On utilise \/-E (raisonnement par cas). Dans le cas p : on a ~p, donc contradiction, donc q par _|_-E. Dans le cas q : q directement.

```
1.  p \/ q              [hypothese]
2.  ~p                  [hypothese]
    
    -- Cas 1 : supposons p
3.  | [p]               [hypothese temporaire pour \/-E, cas 1]
4.  | _|_               [~-E sur 3 et 2 : on a p et ~p, contradiction]
5.  | q                 [_|_-E sur 4 : du faux, on deduit n'importe quoi, ici q]
    
    -- Cas 2 : supposons q
6.  | [q]               [hypothese temporaire pour \/-E, cas 2]
7.  | q                 [reprise de 6 : q est deja disponible]
    
8.  q                   [\/-E sur 1, avec cas 1 (lignes 3-5) et cas 2 (lignes 6-7). Decharge 3, 6.]
```

**Justification de chaque pas :**
- Ligne 5 : _|_-E (ex falso quodlibet). Du faux, on peut deduire N'IMPORTE QUELLE formule. On choisit q car c'est ce qu'on veut prouver dans le \/-E.
- Ligne 8 : \/-E necessite que les deux cas arrivent a la MEME conclusion (ici q). Les deux cas donnent q, donc q est prouve.

---

## Exercice 8 : Transitivite universelle avec quantificateurs

### Enonce
Prouver : Ax, (P(x) -> Q(x)), Ax, (Q(x) -> R(x)) |- Ax, (P(x) -> R(x))

### Preuve detaillee

**Strategie :** La conclusion est Ax, (P(x) -> R(x)). Pour A-I (introduction du pour tout), on prouve P(a) -> R(a) pour une variable fraiche a. Pour ->-I, on suppose P(a) et on montre R(a).

```
1.  Ax, (P(x) -> Q(x))     [hypothese]
2.  Ax, (Q(x) -> R(x))     [hypothese]
    
    -- Sous-preuve : prouver P(a) -> R(a) pour a frais
3.  | [P(a)]                [hypothese temporaire pour ->-I (a est une variable fraiche)]
4.  | P(a) -> Q(a)          [A-E sur 1 : instantiation de x par a]
5.  | Q(a) -> R(a)          [A-E sur 2 : instantiation de x par a]
6.  | Q(a)                  [->-E sur 3 et 4 : on a P(a) et P(a) -> Q(a), donc Q(a)]
7.  | R(a)                  [->-E sur 6 et 5 : on a Q(a) et Q(a) -> R(a), donc R(a)]
8.  P(a) -> R(a)            [->-I, decharge de 3]
9.  Ax, (P(x) -> R(x))     [A-I sur 8 : a est frais (n'apparait dans aucune hypothese non dechargee)]
```

**Justification de chaque pas :**
- Ligne 3 : variable fraiche a. a n'apparait dans aucune hypothese (1 et 2 ne mentionnent pas a).
- Ligne 4 : A-E (elimination du pour tout). De Ax, (P(x) -> Q(x)), on instantie x par a.
- Ligne 5 : A-E sur la deuxieme hypothese.
- Lignes 6-7 : deux applications de modus ponens (chaine de la transitivite).
- Ligne 9 : A-I. Condition : a ne doit apparaitre dans aucune hypothese non dechargee. Les seules hypotheses non dechargees sont 1 et 2, qui ne contiennent pas a. OK.

---

## Exercice 9 : Existentiel implique universel

### Enonce
Prouver : Ex, Ay, R(x,y) |- Ay, Ex, R(x,y)

### Preuve detaillee

**Strategie :** On a Ex, Ay, R(x,y) (il existe un x tel que pour tout y, R(x,y)). On veut Ay, Ex, R(x,y) (pour tout y, il existe un x tel que R(x,y)).

Pour E-E : on pose Ay, R(a,y) pour a frais. Ensuite on prouve la conclusion sans utiliser a dedans.

```
1.  Ex, Ay, R(x,y)          [hypothese]
    
    -- Elimination de l'existentiel : poser un temoin frais a
2.  | [Ay, R(a,y)]          [hypothese temporaire pour E-E (a frais)]
    |
    |   -- Prouver Ay, Ex, R(x,y)
    |   -- Pour A-I, on prend b frais
3.  |   R(a,b)              [A-E sur 2 : instantiation de y par b]
4.  |   Ex, R(x,b)          [E-I sur 3 : de R(a,b), on deduit qu'il existe x tel que R(x,b)]
5.  |   Ay, Ex, R(x,y)      [A-I sur 4 : b est frais (n'apparait ni dans 1 ni dans 2)]
    |
6.  Ay, Ex, R(x,y)          [E-E sur 1 et sous-preuve 2-5. Decharge de 2.]
                              [Conditions : a n'apparait pas dans la conclusion Ay, Ex, R(x,y). OK.]
```

**Justification de chaque pas :**
- Ligne 2 : E-E. On "ouvre" l'existentiel en posant un temoin frais a.
- Ligne 3 : A-E instancie y par b (un terme quelconque, ici une variable fraiche).
- Ligne 4 : E-I. De R(a,b), on conclut qu'il EXISTE un x (a savoir a) tel que R(x,b).
- Ligne 5 : A-I. La variable b est fraiche : elle n'apparait dans aucune hypothese non dechargee (1 et 2 ne contiennent pas b).
- Ligne 6 : E-E ferme la sous-preuve. La variable a ne doit pas apparaitre dans la conclusion -- elle n'y apparait pas. OK.

**Note :** L'inverse (Ay, Ex, R(x,y) |- Ex, Ay, R(x,y)) est en general FAUX. Penser a l'exemple : "pour tout malade, il existe un medecin qui le soigne" n'implique pas "il existe un medecin qui soigne tout le monde".

---

## Exercice 10 : Contraposee

### Enonce
Prouver : p -> q |- ~q -> ~p (sans RAA)

### Preuve detaillee

**Strategie :** La conclusion est ~q -> ~p (implication). On utilise ->-I : supposer ~q, prouver ~p. Pour prouver ~p (negation), on utilise ~-I : supposer p, trouver _|_.

```
1.  p -> q              [hypothese]
2.  | [~q]              [hypothese temporaire pour ->-I (implication ~q -> ~p)]
3.  |   | [p]           [hypothese temporaire pour ~-I (negation ~p)]
4.  |   | q             [->-E sur 3 et 1 : on a p et p -> q, donc q]
5.  |   | _|_           [~-E sur 4 et 2 : on a q et ~q, contradiction]
6.  |   ~p              [~-I, decharge de 3 : en supposant p, on a _|_, donc ~p]
7.  ~q -> ~p            [->-I, decharge de 2 : en supposant ~q, on a ~p]
```

**Justification de chaque pas :**
- Ligne 2 : on suppose ~q pour le ->-I de la conclusion.
- Ligne 3 : on suppose p pour le ~-I de ~p.
- Ligne 4 : modus ponens classique.
- Ligne 5 : q et ~q donnent _|_.
- Ligne 6 : ~-I conclut ~p (hypothese p dechargee).
- Ligne 7 : ->-I conclut ~q -> ~p (hypothese ~q dechargee).

Remarque : cette preuve n'utilise PAS RAA. Elle est valide en logique intuitionniste.

---

## Exercice 11 : Preuve par l'absurde (RAA)

### Enonce
Prouver : ~p -> p |- p

### Preuve detaillee

**Strategie :** La conclusion est p (pas une implication, pas une negation). Quand la conclusion est "atomique", on pense a RAA : supposer ~p, trouver _|_, conclure p.

```
1.  ~p -> p              [hypothese]
2.  | [~p]               [hypothese temporaire pour RAA]
3.  | p                  [->-E sur 2 et 1 : on a ~p et ~p -> p, donc p]
4.  | _|_                [~-E sur 3 et 2 : on a p et ~p, contradiction]
5.  p                    [RAA, decharge de 2 : en supposant ~p, contradiction, donc p]
```

**Justification de chaque pas :**
- Ligne 2 : hypothese temporaire ~p pour RAA.
- Ligne 3 : modus ponens avec l'hypothese ~p -> p. L'antecedent ~p est vrai (ligne 2), donc p.
- Ligne 4 : p (ligne 3) et ~p (ligne 2) donnent _|_.
- Ligne 5 : RAA conclut p.

---

## Exercice 12 : Axiome S de la logique combinatoire

### Enonce
Prouver : |- (p -> (q -> r)) -> ((p -> q) -> (p -> r))

### Preuve detaillee

**Strategie :** Triple implication emboitee. On applique ->-I trois fois (du plus externe au plus interne).

```
1.  | [p -> (q -> r)]            [hypothese temporaire 1 (pour l'implication la plus externe)]
2.  |   | [p -> q]               [hypothese temporaire 2 (pour la deuxieme implication)]
3.  |   |   | [p]                [hypothese temporaire 3 (pour la troisieme implication)]
4.  |   |   | q -> r             [->-E sur 3 et 1 : on a p et p -> (q -> r), donc q -> r]
5.  |   |   | q                  [->-E sur 3 et 2 : on a p et p -> q, donc q]
6.  |   |   | r                  [->-E sur 5 et 4 : on a q et q -> r, donc r]
7.  |   |   p -> r               [->-I, decharge de 3]
8.  |   (p -> q) -> (p -> r)     [->-I, decharge de 2]
9.  (p -> (q -> r)) -> ((p -> q) -> (p -> r))   [->-I, decharge de 1]
```

**Justification de chaque pas :**
- Lignes 1-3 : trois hypotheses temporaires emboitees. Chacune prepare une introduction d'implication.
- Ligne 4 : modus ponens avec p (ligne 3) et p -> (q -> r) (ligne 1).
- Ligne 5 : modus ponens avec p (ligne 3) et p -> q (ligne 2).
- Ligne 6 : modus ponens avec q (ligne 5) et q -> r (ligne 4).
- Lignes 7-9 : trois ->-I consecutives, dechargent les trois hypotheses dans l'ordre inverse.

C'est l'**axiome S** de la logique combinatoire (systeme SKI). Il exprime la distributivite de l'implication.

---

## Exercice 13 : Existentiel et implication universelle

### Enonce
Prouver : Ex, P(x), Ax, (P(x) -> Q(x)) |- Ex, Q(x)

### Preuve detaillee

**Strategie :** On a un existentiel Ex, P(x). On utilise E-E pour poser P(a) pour a frais. Ensuite on utilise A-E pour obtenir P(a) -> Q(a), puis modus ponens pour Q(a), puis E-I pour Ex, Q(x).

```
1.  Ex, P(x)                    [hypothese]
2.  Ax, (P(x) -> Q(x))          [hypothese]
    
    -- Elimination de l'existentiel
3.  | [P(a)]                    [hypothese temporaire pour E-E (a frais)]
4.  | P(a) -> Q(a)              [A-E sur 2 : instantiation de x par a]
5.  | Q(a)                      [->-E sur 3 et 4 : on a P(a) et P(a) -> Q(a), donc Q(a)]
6.  | Ex, Q(x)                  [E-I sur 5 : de Q(a), on deduit qu'il existe x tel que Q(x)]
    
7.  Ex, Q(x)                    [E-E sur 1 et sous-preuve 3-6. Decharge de 3.]
                                 [Condition : a n'apparait pas dans Ex, Q(x). OK.]
```

**Justification de chaque pas :**
- Ligne 3 : E-E ouvre l'existentiel avec un temoin frais a.
- Ligne 4 : A-E instancie le pour tout avec le meme temoin a.
- Ligne 5 : modus ponens.
- Ligne 6 : E-I "ferme" l'existentiel (on sait que Q est vrai pour au moins a).
- Ligne 7 : E-E valide. La variable a n'apparait pas dans la conclusion Ex, Q(x).

---

## Exercice 14 : Double negation (classique)

### Enonce
Prouver : |- ~~p -> p

### Preuve detaillee

**Strategie :** La conclusion est ~~p -> p. On utilise ->-I : supposer ~~p, prouver p. Pour prouver p (formule atomique) a partir de ~~p, on utilise RAA.

```
1.  | [~~p]              [hypothese temporaire pour ->-I]
2.  |   | [~p]           [hypothese temporaire pour RAA]
3.  |   | _|_            [~-E sur 1 et 2 : on a ~~p et ~p, contradiction]
4.  | p                  [RAA, decharge de 2 : en supposant ~p, contradiction, donc p]
5.  ~~p -> p             [->-I, decharge de 1]
```

**Justification de chaque pas :**
- Ligne 1 : hypothese temporaire ~~p.
- Ligne 2 : hypothese temporaire ~p pour RAA (on veut conclure p, donc on suppose ~p).
- Ligne 3 : ~-E. ~~p est une negation de ~p. Donc ~~p et ~p donnent _|_. (Ici, ~~p joue le role de "pas ~p", et ~p joue le role de "~p".)
- Ligne 4 : RAA. On supposait ~p, on a obtenu _|_, donc p.
- Ligne 5 : ->-I decharge ~~p.

---

## Exercice 15 : Loi de Peirce (type DS 2022-2023)

### Enonce
Prouver : |- ((p -> q) -> p) -> p

### Preuve detaillee

**Strategie :** La conclusion est une implication. On utilise ->-I : supposer (p -> q) -> p, prouver p. Pour p (atomique), on utilise RAA.

```
1.  | [(p -> q) -> p]        [hypothese temporaire pour ->-I]
2.  |   | [~p]               [hypothese temporaire pour RAA]
3.  |   |   | [p]            [hypothese temporaire pour ->-I (on veut construire p -> q)]
4.  |   |   | _|_            [~-E sur 3 et 2 : on a p et ~p, contradiction]
5.  |   |   | q              [_|_-E sur 4 : du faux, on deduit q (ex falso quodlibet)]
6.  |   |   p -> q           [->-I, decharge de 3 : en supposant p, on obtient q]
7.  |   | p                  [->-E sur 6 et 1 : on a (p -> q) et (p -> q) -> p, donc p]
8.  |   | _|_                [~-E sur 7 et 2 : on a p et ~p, contradiction]
9.  | p                      [RAA, decharge de 2]
10. ((p -> q) -> p) -> p     [->-I, decharge de 1]
```

**Justification de chaque pas :**
- Lignes 3-5 : L'astuce est de construire p -> q en utilisant ex falso. Dans l'hypothese ~p (ligne 2), si on suppose p (ligne 3), on a immediatement _|_, d'ou on peut deduire n'importe quoi, y compris q.
- Ligne 6 : ->-I conclut p -> q.
- Ligne 7 : Modus ponens avec l'hypothese 1.
- Lignes 8-9 : p et ~p donnent _|_, donc RAA conclut p.

**Note :** Cette preuve utilise RAA (logique classique). La loi de Peirce n'est PAS prouvable en logique intuitionniste -- c'est l'un des axiomes qui distingue la logique classique de la logique intuitionniste.

---

## Exercice 16 : Distributivite du OU sur le ET

### Enonce
Prouver : p \/ (q /\ r) |- (p \/ q) /\ (p \/ r)

### Preuve detaillee

**Strategie :** La conclusion est un ET (p \/ q) /\ (p \/ r). Il faut prouver les deux conjoncts. On a p \/ (q /\ r), donc on utilise \/-E (raisonnement par cas).

```
1.  p \/ (q /\ r)                 [hypothese]

    -- Cas 1 : supposons p
2.  | [p]                         [hypothese temporaire pour \/-E, cas 1]
3.  | p \/ q                      [\/-I1 sur 2]
4.  | p \/ r                      [\/-I1 sur 2]
5.  | (p \/ q) /\ (p \/ r)       [/\-I sur 3 et 4]

    -- Cas 2 : supposons q /\ r
6.  | [q /\ r]                    [hypothese temporaire pour \/-E, cas 2]
7.  | q                           [/\-E1 sur 6]
8.  | r                           [/\-E2 sur 6]
9.  | p \/ q                      [\/-I2 sur 7]
10. | p \/ r                      [\/-I2 sur 8]
11. | (p \/ q) /\ (p \/ r)       [/\-I sur 9 et 10]

12. (p \/ q) /\ (p \/ r)         [\/-E sur 1, cas 1 (2-5), cas 2 (6-11). Decharge 2, 6.]
```

**Justification de chaque pas :**
- Cas 1 : de p seul, on construit p \/ q par \/-I1 (cote gauche) et p \/ r par \/-I1 (cote gauche), puis le ET.
- Cas 2 : de q /\ r, on extrait q et r, puis on construit p \/ q par \/-I2 (cote droit) et p \/ r par \/-I2 (cote droit), puis le ET.
- Les deux cas donnent la meme conclusion (p \/ q) /\ (p \/ r), donc \/-E est applicable.

---

## Reference rapide des regles de deduction naturelle

| Regle | Notation | Effet |
|-------|----------|-------|
| /\-I | De A et B, conclure A /\ B | Introduction du ET |
| /\-E1 | De A /\ B, conclure A | Elimination du ET (gauche) |
| /\-E2 | De A /\ B, conclure B | Elimination du ET (droite) |
| \/-I1 | De A, conclure A \/ B | Introduction du OU (gauche) |
| \/-I2 | De B, conclure A \/ B | Introduction du OU (droite) |
| \/-E | De A \/ B, A |- C, B |- C, conclure C | Elimination du OU (par cas) |
| ->-I | De [A] ... B, conclure A -> B | Introduction de l'implication |
| ->-E | De A et A -> B, conclure B | Elimination de l'implication (modus ponens) |
| ~-I | De [A] ... _\|_, conclure ~A | Introduction de la negation |
| ~-E | De A et ~A, conclure _\|_ | Elimination de la negation (contradiction) |
| _\|_-E | De _\|_, conclure A (n'importe quoi) | Ex falso quodlibet |
| RAA | De [~A] ... _\|_, conclure A | Reductio ad absurdum (classique seulement) |
| A-I | De P(a) avec a frais, conclure Ax, P(x) | Introduction du pour tout |
| A-E | De Ax, P(x), conclure P(t) pour tout terme t | Elimination du pour tout |
| E-I | De P(t), conclure Ex, P(x) | Introduction du il existe |
| E-E | De Ex, P(x) et [P(a)] ... C (a frais, a absent de C), conclure C | Elimination du il existe |
