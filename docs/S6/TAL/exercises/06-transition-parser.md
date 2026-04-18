---
title: "Exercices -- Parser Transition-Based (Dependances) : Traces completes"
sidebar_position: 6
---

# Exercices -- Parser Transition-Based (Dependances) : Traces completes

---

## Exercice 1 : Trace complete -- "The lazy dog sleeps"

### Enonce

Phrase : "The lazy dog sleeps"

Arbre de dependances cible :
```
ROOT --> sleeps (root)
sleeps --> dog (nsubj)
dog --> The (det)
dog --> lazy (amod)
```

**Donner la sequence d'operations shift/left-arc/right-arc.**

### Rappel des operations (convention Nivre arc-standard)

| Action | Notation | Effet | Qui est retire |
|--------|----------|-------|----------------|
| Shift (S) | sigma, w_i\|beta --> sigma\|w_i, beta | buffer --> pile | personne |
| Left-Arc (G) | sigma\|w_i\|w_j, beta --> sigma\|w_j, beta, A U {r(w_j,w_i)} | arc : sommet --> second | le second (plus profond) |
| Right-Arc (D) | sigma\|w_i\|w_j, beta --> sigma\|w_i, beta, A U {r(w_i,w_j)} | arc : second --> sommet | le sommet |

**Regle cle** :
- Left-Arc : le **sommet** de la pile est la TETE, le **second** est le dependant (retire)
- Right-Arc : le **second** de la pile est la TETE, le **sommet** est le dependant (retire)

### Solution pas a pas

| Etape | Pile | Buffer | Action | Dependance ajoutee |
|-------|------|--------|--------|--------------------|
| 0 | [ROOT] | [The, lazy, dog, sleeps] | Shift | - |
| 1 | [ROOT, The] | [lazy, dog, sleeps] | Shift | - |
| 2 | [ROOT, The, lazy] | [dog, sleeps] | Shift | - |
| 3 | [ROOT, The, lazy, dog] | [sleeps] | Left-Arc | dog --> lazy (amod) |
| 4 | [ROOT, The, dog] | [sleeps] | Left-Arc | dog --> The (det) |
| 5 | [ROOT, dog] | [sleeps] | Shift | - |
| 6 | [ROOT, dog, sleeps] | [] | Left-Arc | sleeps --> dog (nsubj) |
| 7 | [ROOT, sleeps] | [] | Right-Arc | ROOT --> sleeps (root) |
| 8 | [ROOT] | [] | FIN | - |

### Explication detaillee

**Etapes 0-2 (Shift x3)** : on empile The, lazy, dog. Il faut empiler tous les dependants AVANT de creer les arcs (les dependants a gauche doivent etre dans la pile avant leur tete).

**Etape 3 (Left-Arc)** :
```
Pile avant : [ROOT, The, lazy, dog]
Sommet = dog, Second = lazy
Question : dog est-il la tete de lazy ? OUI (amod)
Action : Left-Arc cree l'arc dog --> lazy, retire lazy
Pile apres : [ROOT, The, dog]
```

**Etape 4 (Left-Arc)** :
```
Pile avant : [ROOT, The, dog]
Sommet = dog, Second = The
Question : dog est-il la tete de The ? OUI (det)
Action : Left-Arc cree l'arc dog --> The, retire The
Pile apres : [ROOT, dog]
```

**Etape 5 (Shift)** : on empile sleeps. Il faut empiler le verbe car dog est son dependant (nsubj).

**Etape 6 (Left-Arc)** :
```
Pile avant : [ROOT, dog, sleeps]
Sommet = sleeps, Second = dog
Question : sleeps est-il la tete de dog ? OUI (nsubj)
Action : Left-Arc cree l'arc sleeps --> dog, retire dog
Pile apres : [ROOT, sleeps]
```

**Etape 7 (Right-Arc)** :
```
Pile avant : [ROOT, sleeps]
Sommet = sleeps, Second = ROOT
Question : ROOT est-il la tete de sleeps ? OUI (root)
Action : Right-Arc cree l'arc ROOT --> sleeps, retire sleeps
Pile apres : [ROOT]
```

**Terminaison** : pile = [ROOT], buffer = [] --> analyse terminee.

### Verification de l'arbre obtenu

```
Arcs crees :
  dog --> lazy    (amod)     etape 3
  dog --> The     (det)      etape 4
  sleeps --> dog  (nsubj)    etape 6
  ROOT --> sleeps (root)     etape 7

Arbre :
          ROOT
           |
         sleeps
           |
          dog
         / \
       The  lazy
```

Correspond exactement a l'arbre cible.

---

## Exercice 2 : "Paul regarde le chien noir"

### Arbre cible

```
ROOT --> regarde (root)
regarde --> Paul (nsubj)
regarde --> chien (obj)
chien --> le (det)
chien --> noir (amod)
```

### Solution

| Etape | Pile | Buffer | Action | Dependance |
|-------|------|--------|--------|-----------|
| 0 | [ROOT] | [Paul, regarde, le, chien, noir] | Shift | - |
| 1 | [ROOT, Paul] | [regarde, le, chien, noir] | Shift | - |
| 2 | [ROOT, Paul, regarde] | [le, chien, noir] | Left-Arc | regarde --> Paul (nsubj) |
| 3 | [ROOT, regarde] | [le, chien, noir] | Shift | - |
| 4 | [ROOT, regarde, le] | [chien, noir] | Shift | - |
| 5 | [ROOT, regarde, le, chien] | [noir] | Left-Arc | chien --> le (det) |
| 6 | [ROOT, regarde, chien] | [noir] | Shift | - |
| 7 | [ROOT, regarde, chien, noir] | [] | Right-Arc | chien --> noir (amod) |
| 8 | [ROOT, regarde, chien] | [] | Right-Arc | regarde --> chien (obj) |
| 9 | [ROOT, regarde] | [] | Right-Arc | ROOT --> regarde (root) |
| 10 | [ROOT] | [] | FIN | - |

### Explication detaillee

**Etapes 0-1** : Shift Paul et regarde sur la pile.

**Etape 2 (Left-Arc)** : sommet=regarde est la tete de second=Paul (nsubj). Retire Paul.
```
On peut creer cet arc maintenant car Paul n'a pas de dependants a gauche.
Regle : un mot peut etre retire par Left-Arc des que tous ses dependants
a gauche ont ete traites.
```

**Etapes 3-4** : Shift le et chien sur la pile.

**Etape 5 (Left-Arc)** : sommet=chien est la tete de second=le (det). Retire le.

**Etape 6** : Shift noir sur la pile. Il faut empiler noir car c'est un dependant A DROITE de chien.

**Etape 7 (Right-Arc)** : second=chien est la tete de sommet=noir (amod). Retire noir.
```
IMPORTANT : noir est un dependant A DROITE de chien.
Le dependant (noir) est le sommet et la tete (chien) est le second.
Donc on utilise Right-Arc (arc second-->sommet, retire sommet).
Ne PAS confondre avec Left-Arc qui ferait de noir la tete !
```

**Etape 8 (Right-Arc)** : second=regarde est la tete de sommet=chien (obj). Retire chien.
```
On attend d'avoir traite TOUS les dependants de chien (le, noir)
avant de le relier a sa tete (regarde).
```

**Etape 9 (Right-Arc)** : second=ROOT est la tete de sommet=regarde (root). Retire regarde.

### Verification

```
Arcs crees :
  regarde --> Paul   (nsubj)   etape 2
  chien --> le       (det)     etape 5
  chien --> noir     (amod)    etape 7
  regarde --> chien  (obj)     etape 8
  ROOT --> regarde   (root)    etape 9

        ROOT
         |
       regarde
       /     \
    Paul     chien
             / \
           le  noir
```

---

## Exercice 3 : "Le president visite une usine a Lyon"

### Arbre cible

```
ROOT --> visite (root)
visite --> president (nsubj)
president --> Le (det)
visite --> usine (obj)
usine --> une (det)
visite --> Lyon (obl)
Lyon --> a (case)
```

### Solution

| Etape | Pile | Buffer | Action | Dependance |
|-------|------|--------|--------|-----------|
| 0 | [ROOT] | [Le, president, visite, une, usine, a, Lyon] | S | - |
| 1 | [ROOT, Le] | [president, visite, une, usine, a, Lyon] | S | - |
| 2 | [ROOT, Le, president] | [visite, une, usine, a, Lyon] | G | president --> Le (det) |
| 3 | [ROOT, president] | [visite, une, usine, a, Lyon] | S | - |
| 4 | [ROOT, president, visite] | [une, usine, a, Lyon] | G | visite --> president (nsubj) |
| 5 | [ROOT, visite] | [une, usine, a, Lyon] | S | - |
| 6 | [ROOT, visite, une] | [usine, a, Lyon] | S | - |
| 7 | [ROOT, visite, une, usine] | [a, Lyon] | G | usine --> une (det) |
| 8 | [ROOT, visite, usine] | [a, Lyon] | S | - |
| 9 | [ROOT, visite, usine, a] | [Lyon] | S | - |
| 10 | [ROOT, visite, usine, a, Lyon] | [] | G | Lyon --> a (case) |
| 11 | [ROOT, visite, usine, Lyon] | [] | D | visite --> Lyon (obl) |

Attend -- il faut d'abord vider usine :

Reprenons a l'etape 8 :

| Etape | Pile | Buffer | Action | Dependance |
|-------|------|--------|--------|-----------|
| 8 | [ROOT, visite, usine] | [a, Lyon] | D | visite --> usine (obj) |
| 9 | [ROOT, visite] | [a, Lyon] | S | - |
| 10 | [ROOT, visite, a] | [Lyon] | S | - |
| 11 | [ROOT, visite, a, Lyon] | [] | G | Lyon --> a (case) |
| 12 | [ROOT, visite, Lyon] | [] | D | visite --> Lyon (obl) |
| 13 | [ROOT, visite] | [] | D | ROOT --> visite (root) |
| 14 | [ROOT] | [] | FIN | - |

### Trace complete corrigee

| Etape | Pile | Buffer | Action | Dependance |
|-------|------|--------|--------|-----------|
| 0 | [ROOT] | [Le, president, visite, une, usine, a, Lyon] | S | - |
| 1 | [ROOT, Le] | [president, visite, une, usine, a, Lyon] | S | - |
| 2 | [ROOT, Le, president] | [visite, une, usine, a, Lyon] | G | president --> Le (det) |
| 3 | [ROOT, president] | [visite, une, usine, a, Lyon] | S | - |
| 4 | [ROOT, president, visite] | [une, usine, a, Lyon] | G | visite --> president (nsubj) |
| 5 | [ROOT, visite] | [une, usine, a, Lyon] | S | - |
| 6 | [ROOT, visite, une] | [usine, a, Lyon] | S | - |
| 7 | [ROOT, visite, une, usine] | [a, Lyon] | G | usine --> une (det) |
| 8 | [ROOT, visite, usine] | [a, Lyon] | D | visite --> usine (obj) |
| 9 | [ROOT, visite] | [a, Lyon] | S | - |
| 10 | [ROOT, visite, a] | [Lyon] | S | - |
| 11 | [ROOT, visite, a, Lyon] | [] | G | Lyon --> a (case) |
| 12 | [ROOT, visite, Lyon] | [] | D | visite --> Lyon (obl) |
| 13 | [ROOT, visite] | [] | D | ROOT --> visite (root) |
| 14 | [ROOT] | [] | FIN | - |

**Point cle** : usine doit etre retiree (Right-Arc a l'etape 8) AVANT d'empiler "a" et "Lyon", car usine est un dependant a droite de visite et n'a plus de dependants a traiter.

### Verification

```
Arcs crees :
  president --> Le      (det)      etape 2
  visite --> president  (nsubj)    etape 4
  usine --> une         (det)      etape 7
  visite --> usine      (obj)      etape 8
  Lyon --> a            (case)     etape 11
  visite --> Lyon       (obl)      etape 12
  ROOT --> visite       (root)     etape 13

           ROOT
            |
          visite
         /  |   \
  president usine Lyon
       |      |     |
      Le     une    a
```

---

## Exercice 4 : "Marie donne un cadeau a Pierre"

### Arbre cible

```
ROOT --> donne (root)
donne --> Marie (nsubj)
donne --> cadeau (obj)
cadeau --> un (det)
donne --> Pierre (iobj)
Pierre --> a (case)
```

### Solution

| Etape | Pile | Buffer | Action | Dependance |
|-------|------|--------|--------|-----------|
| 0 | [ROOT] | [Marie, donne, un, cadeau, a, Pierre] | S | - |
| 1 | [ROOT, Marie] | [donne, un, cadeau, a, Pierre] | S | - |
| 2 | [ROOT, Marie, donne] | [un, cadeau, a, Pierre] | G | donne --> Marie (nsubj) |
| 3 | [ROOT, donne] | [un, cadeau, a, Pierre] | S | - |
| 4 | [ROOT, donne, un] | [cadeau, a, Pierre] | S | - |
| 5 | [ROOT, donne, un, cadeau] | [a, Pierre] | G | cadeau --> un (det) |
| 6 | [ROOT, donne, cadeau] | [a, Pierre] | D | donne --> cadeau (obj) |
| 7 | [ROOT, donne] | [a, Pierre] | S | - |
| 8 | [ROOT, donne, a] | [Pierre] | S | - |
| 9 | [ROOT, donne, a, Pierre] | [] | G | Pierre --> a (case) |
| 10 | [ROOT, donne, Pierre] | [] | D | donne --> Pierre (iobj) |
| 11 | [ROOT, donne] | [] | D | ROOT --> donne (root) |
| 12 | [ROOT] | [] | FIN | - |

**Observation** : le verbe "donne" a trois dependants a droite (cadeau, Pierre) et un a gauche (Marie). L'ordre de traitement est : d'abord les dependants a gauche, puis les dependants a droite de gauche a droite.

---

## Exercice 5 : Quand utiliser Left-Arc vs Right-Arc (analyse)

### Regle generale

```
Left-Arc (G) : utiliser quand le SOMMET de la pile est la TETE
               du SECOND element.
               Le second est retire.
               
               Cas typiques : le sommet "domine" le second
               - Nom --> Determinant (Det est second, retire)
               - Verbe --> Sujet (sujet est second, retire)

Right-Arc (D) : utiliser quand le SECOND de la pile est la TETE
                du SOMMET.
                Le sommet est retire.
                
                Cas typiques : le second "domine" le sommet
                - Nom --> Adjectif postpose (adj est sommet, retire)
                - Verbe --> Objet (objet est sommet, retire)
                - ROOT --> Verbe principal (verbe est sommet, retire)
```

### Quand faire un Shift ?

```
Shift quand :
1. Le sommet de la pile n'a pas encore tous ses dependants
   (il faut empiler les mots suivants avant de creer des arcs)
2. Le buffer contient encore des mots necessaires
3. Aucun arc n'est possible entre le sommet et le second

Exemple : "le chat noir mange"
  Apres [ROOT, le, chat], on ne peut PAS faire Right-Arc(chat --> noir)
  car "noir" est encore dans le buffer. Il faut d'abord Shift "noir".
```

### Contrainte d'ordre

```
REGLE FONDAMENTALE :
  Un mot ne peut etre retire de la pile que si TOUS ses dependants
  (a gauche ET a droite) ont deja ete traites.
  
  Si on retire trop tot, on perd la possibilite de creer des arcs.
  
  Exemple : retirer "chien" avant "noir" dans "le chien noir" est une erreur.
  Il faut d'abord creer l'arc chien --> noir, puis retirer chien.
```

---

## Exercice 6 : Types de relations de dependance (question cours)

### Relations principales (Universal Dependencies)

| Relation | Signification | Exemple |
|----------|---------------|---------|
| nsubj | Sujet nominal | "chat" dans "le chat mange" |
| obj | Objet direct | "souris" dans "mange la souris" |
| iobj | Objet indirect | "Pierre" dans "donne a Pierre" |
| det | Determinant | "le" dans "le chat" |
| amod | Modificateur adjectival | "noir" dans "chat noir" |
| advmod | Modificateur adverbial | "vite" dans "court vite" |
| case | Marque casuelle (preposition) | "a" dans "a Lyon" |
| obl | Oblique (complement circonstanciel) | "Lyon" dans "visite a Lyon" |
| root | Racine (verbe principal) | "mange" relie a ROOT |
| conj | Coordination | "dort" dans "mange et dort" |
| cc | Conjonction de coordination | "et" dans "mange et dort" |

### Metriques d'evaluation

```
UAS (Unlabeled Attachment Score) :
  = nombre d'arcs avec tete correcte / nombre total d'arcs
  (on ne verifie PAS le label de la relation)

LAS (Labeled Attachment Score) :
  = nombre d'arcs avec tete ET label corrects / nombre total d'arcs
  (on verifie AUSSI le label de la relation)

LAS <= UAS toujours (LAS est plus strict)
```

**Exemple** :
```
Prediction : chat --nsubj--> mange
Reference :  chat --obj--> mange

UAS : tete de "chat" = "mange" --> CORRECT (tete est bonne)
LAS : tete de "chat" = "mange", label = nsubj vs obj --> INCORRECT (label faux)
```

---

## Resume : algorithme transition-based

```
Etat initial : pile = [ROOT], buffer = [w1, w2, ..., wn], arcs = {}

3 actions possibles a chaque etape :
  SHIFT     : buffer[0] --> pile
  LEFT-ARC  : arc sommet --> second, retire second
  RIGHT-ARC : arc second --> sommet, retire sommet

Condition d'arret : buffer vide ET pile = [ROOT]

Oracle : classifieur (SVM, reseau de neurones) qui decide l'action
         Entree : caracteristiques de la pile et du buffer
         Sortie : Shift, Left-Arc(label), ou Right-Arc(label)

Complexite : O(2n) -- lineaire ! (chaque mot est empile une fois et retire une fois)
```

---

## Pieges courants en DS

1. **Convention Left-Arc/Right-Arc** : verifier la definition dans l'enonce (qui est tete, qui est dependant). La convention Nivre est la plus courante
2. **Ordre des operations** : empiler les dependants AVANT de creer leurs arcs
3. **ROOT** : toujours le premier element de la pile, JAMAIS retire
4. **Un seul Right-Arc pour ROOT** : ROOT n'a qu'un seul enfant (le verbe principal)
5. **Ne pas confondre** : Left-Arc retire le second (plus profond), Right-Arc retire le sommet
6. **Dependants a droite** : il faut d'abord Shift le dependant, puis Right-Arc (ex: "noir" dans "chat noir")
7. **Dependants a gauche** : ils sont deja dans la pile, on fait Left-Arc directement
8. **Retirer trop tot** : ne jamais retirer un mot qui a encore des dependants non traites
9. **Confusion UAS/LAS** : UAS = juste la tete, LAS = tete + label. LAS est plus strict
10. **Complexite** : O(2n) lineaire, pas O(n^3) comme CKY
