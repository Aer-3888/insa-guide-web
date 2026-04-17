---
title: "Exercices -- TF-IDF, Similarite Cosinus et Recherche d'Information : Calculs complets"
sidebar_position: 4
---

# Exercices -- TF-IDF, Similarite Cosinus et Recherche d'Information : Calculs complets

---

## Exercice 1 : Calcul TF-IDF complet

### Enonce

Collection de 5 documents :
```
d1 : "le chat mange la souris"
d2 : "la souris mange du fromage"
d3 : "le chat dort sur le canape"
d4 : "le chien dort dans le jardin"
d5 : "la souris a peur du chat"
```

**Calculer le vecteur TF-IDF de d1 et d5, puis leur similarite cosinus.**

### Solution

**Etape 1 : Vocabulaire (apres suppression mots vides)**

Mots vides a supprimer : le, la, du, sur, dans, a

Vocabulaire restant : {chat, mange, souris, fromage, dort, canape, chien, jardin, peur}
|V| = 9

**Etape 2 : TF (frequence relative dans chaque document)**

Pour d1 = "chat mange souris" (3 mots apres nettoyage) :
```
tf(chat, d1)   = 1/3 = 0.333
tf(mange, d1)  = 1/3 = 0.333
tf(souris, d1) = 1/3 = 0.333
tf(fromage, d1) = 0, tf(dort, d1) = 0, tf(canape, d1) = 0
tf(chien, d1) = 0, tf(jardin, d1) = 0, tf(peur, d1) = 0
```

Pour d5 = "souris peur chat" (3 mots apres nettoyage) :
```
tf(souris, d5) = 1/3 = 0.333
tf(peur, d5)   = 1/3 = 0.333
tf(chat, d5)   = 1/3 = 0.333
Tous les autres = 0
```

**Etape 3 : DF et IDF**

| Mot | Documents contenant | df | IDF = log10(5/df) |
|-----|--------------------|----|-------------------|
| chat | d1, d3, d5 | 3 | log10(5/3) = log10(1.667) = 0.222 |
| mange | d1, d2 | 2 | log10(5/2) = log10(2.5) = 0.398 |
| souris | d1, d2, d5 | 3 | log10(5/3) = 0.222 |
| fromage | d2 | 1 | log10(5/1) = log10(5) = 0.699 |
| dort | d3, d4 | 2 | log10(5/2) = 0.398 |
| canape | d3 | 1 | log10(5/1) = 0.699 |
| chien | d4 | 1 | log10(5/1) = 0.699 |
| jardin | d4 | 1 | log10(5/1) = 0.699 |
| peur | d5 | 1 | log10(5/1) = 0.699 |

**Observation** : les mots rares (fromage, canape, chien, jardin, peur) ont un IDF eleve (0.699). Les mots frequents (chat, souris) ont un IDF faible (0.222). C'est exactement le role de l'IDF : penaliser les mots courants et valoriser les mots rares.

**Etape 4 : TF-IDF = TF * IDF**

Pour d1 (vecteur sur le vocabulaire complet) :
```
tfidf(chat, d1)    = 0.333 * 0.222 = 0.074
tfidf(mange, d1)   = 0.333 * 0.398 = 0.133
tfidf(souris, d1)  = 0.333 * 0.222 = 0.074
tfidf(fromage, d1) = 0     * 0.699 = 0.000
tfidf(dort, d1)    = 0     * 0.398 = 0.000
tfidf(canape, d1)  = 0     * 0.699 = 0.000
tfidf(chien, d1)   = 0     * 0.699 = 0.000
tfidf(jardin, d1)  = 0     * 0.699 = 0.000
tfidf(peur, d1)    = 0     * 0.699 = 0.000

d1 = (0.074, 0.133, 0.074, 0, 0, 0, 0, 0, 0)
```

Pour d5 :
```
tfidf(chat, d5)    = 0.333 * 0.222 = 0.074
tfidf(mange, d5)   = 0     * 0.398 = 0.000
tfidf(souris, d5)  = 0.333 * 0.222 = 0.074
tfidf(fromage, d5) = 0     * 0.699 = 0.000
tfidf(dort, d5)    = 0     * 0.398 = 0.000
tfidf(canape, d5)  = 0     * 0.699 = 0.000
tfidf(chien, d5)   = 0     * 0.699 = 0.000
tfidf(jardin, d5)  = 0     * 0.699 = 0.000
tfidf(peur, d5)    = 0.333 * 0.699 = 0.233

d5 = (0.074, 0, 0.074, 0, 0, 0, 0, 0, 0.233)
```

**Etape 5 : Similarite cosinus**

```
d1 . d5 = 0.074*0.074 + 0.133*0 + 0.074*0.074 + 0 + 0 + 0 + 0 + 0 + 0*0.233
        = 0.005476 + 0 + 0.005476 + 0 + 0 + 0 + 0 + 0 + 0
        = 0.010952

||d1|| = sqrt(0.074^2 + 0.133^2 + 0.074^2)
       = sqrt(0.005476 + 0.017689 + 0.005476)
       = sqrt(0.028641)
       = 0.1692

||d5|| = sqrt(0.074^2 + 0.074^2 + 0.233^2)
       = sqrt(0.005476 + 0.005476 + 0.054289)
       = sqrt(0.065241)
       = 0.2554

cos(d1, d5) = 0.010952 / (0.1692 * 0.2554)
            = 0.010952 / 0.04323
            = 0.253
```

**Similarite = 0.253**

**Interpretation** : d1 et d5 partagent "chat" et "souris" (mots frequents, faible IDF). Le mot "mange" de d1 et "peur" de d5 ne sont pas partages. La similarite est moderee. Le fait que "peur" ait un fort IDF (0.699) augmente la norme de d5, ce qui reduit le cosinus.

---

## Exercice 2 : Role de l'IDF (question type DS)

### Enonce

**Q** : A quoi correspond le terme IDF et quel est son role ?

### Reponse type complete

**Definition** :
```
IDF(t) = log(|D| / df(t))

ou :
  |D| = nombre total de documents dans la collection
  df(t) = nombre de documents contenant le terme t
```

**Role** :
1. Donne un poids **eleve** aux termes **rares** dans la collection (mots discriminants)
2. Donne un poids **faible** aux termes **frequents** partout (mots vides, mots generiques)
3. Un mot present dans TOUS les documents a IDF = log(1) = 0 --> TF-IDF = 0
4. Un mot present dans 1 seul document a IDF = log(|D|) --> maximum, fort pouvoir discriminant

**Exemple concret** :
```
Collection de 1000 documents :

Mot "algorithme" : present dans 5 documents
  IDF = log10(1000/5) = log10(200) = 2.30
  --> Tres discriminant, bon pour la recherche

Mot "est" : present dans 990 documents
  IDF = log10(1000/990) = log10(1.01) = 0.004
  --> Quasiment inutile pour distinguer les documents

Mot "quantique" : present dans 1 document
  IDF = log10(1000/1) = 3.00
  --> Extremement discriminant
```

**Intuition** : si un mot apparait dans tous les documents, il ne permet pas de distinguer un document d'un autre. L'IDF penalise ces mots.

---

## Exercice 3 : Modele booleen vs vectoriel (type DS 2023)

### Enonce

Requete : "bonjour". Documents d1 et d2 contiennent tous les deux "bonjour".

**Q1** : Le modele booleen donne-t-il necessairement le meme score aux 2 documents ?
**Q2** : Le modele vectoriel (produit scalaire, representation binaire) ?
**Q3** : Le modele vectoriel (cosinus, representation binaire) ?

### Solution

**Q1 -- Booleen** : **OUI, meme resultat.**

```
Le modele booleen retourne un ENSEMBLE de documents sans classement.
d1 contient "bonjour" --> pertinent
d2 contient "bonjour" --> pertinent
Les deux sont retournes avec le meme statut (pertinent/non pertinent).
Pas d'ordre entre eux.
```

**Q2 -- Produit scalaire binaire** : **OUI, meme score.**

```
Representation binaire : 1 si le mot est present, 0 sinon.
Requete q : seul "bonjour" est a 1.

d1 . q = ... + 1 * 1 + ... = 1  (le terme "bonjour" contribue 1)
d2 . q = ... + 1 * 1 + ... = 1  (meme contribution)

ATTENTION : si la requete avait PLUSIEURS termes, le score pourrait differer
car le produit scalaire somme sur TOUS les termes communs.
```

**Q3 -- Cosinus binaire** : **PAS NECESSAIREMENT le meme score.**

```
cos(d, q) = (d . q) / (||d|| * ||q||)

d1 . q = 1 et d2 . q = 1 (meme numerateur)

MAIS :
||q|| est le meme pour les deux (ne depend pas du document)
||d1|| et ||d2|| peuvent differer !

Exemple :
  d1 contient 3 termes distincts : ||d1|| = sqrt(3) = 1.732
  d2 contient 10 termes distincts : ||d2|| = sqrt(10) = 3.162

  cos(d1, q) = 1 / (1.732 * 1) = 0.577
  cos(d2, q) = 1 / (3.162 * 1) = 0.316

  cos(d1, q) > cos(d2, q) !
```

**Lecon** : le cosinus normalise par la taille du document. Il favorise les documents courts/focalises. Le produit scalaire brut ne normalise pas et favorise les documents longs.

---

## Exercice 4 : BM25 (type DS)

### Enonce

Collection de N=1000 documents, longueur moyenne avgdl=200 tokens.

Document d : 300 tokens, contient "chat" 5 fois et "noir" 2 fois.
Requete q : "chat noir"

Parametres : k1=1.2, b=0.75

```
df(chat) = 100 documents
df(noir) = 50 documents
```

### Rappel : formule BM25

```
BM25(q, d) = SUM_{t in q} idf(t) * [tf(t,d) * (k1 + 1)] / [tf(t,d) + k1 * (1 - b + b * |d|/avgdl)]
```

### Solution

**Etape 1 : IDF de chaque terme**

```
idf(chat) = log((N - df + 0.5) / (df + 0.5))
          = log((1000 - 100 + 0.5) / (100 + 0.5))
          = log(900.5 / 100.5)
          = log(8.960)
          = 2.193

idf(noir) = log((1000 - 50 + 0.5) / (50 + 0.5))
          = log(950.5 / 50.5)
          = log(18.822)
          = 2.935
```

**Observation** : "noir" a un IDF plus eleve car il apparait dans moins de documents (50 vs 100).

**Etape 2 : Score BM25 pour "chat"**

```
tf(chat, d) = 5
|d| = 300, avgdl = 200

denominateur = tf + k1 * (1 - b + b * |d|/avgdl)
             = 5 + 1.2 * (1 - 0.75 + 0.75 * 300/200)
             = 5 + 1.2 * (0.25 + 0.75 * 1.5)
             = 5 + 1.2 * (0.25 + 1.125)
             = 5 + 1.2 * 1.375
             = 5 + 1.65
             = 6.65

numerateur = tf * (k1 + 1) = 5 * 2.2 = 11.0

score_chat = idf * numerateur / denominateur
           = 2.193 * 11.0 / 6.65
           = 2.193 * 1.654
           = 3.625
```

**Etape 3 : Score BM25 pour "noir"**

```
tf(noir, d) = 2

denominateur = 2 + 1.2 * 1.375 = 2 + 1.65 = 3.65

numerateur = 2 * 2.2 = 4.4

score_noir = 2.935 * 4.4 / 3.65
           = 2.935 * 1.205
           = 3.537
```

**Etape 4 : Score BM25 total**

```
BM25(q, d) = score_chat + score_noir
           = 3.625 + 3.537
           = 7.162
```

**Interpretation** :
- "noir" contribue presque autant que "chat" malgre une frequence moindre (2 vs 5), grace a son IDF plus eleve
- La normalisation par la longueur (b=0.75, |d|/avgdl = 1.5) penalise le document car il est plus long que la moyenne
- Le parametre k1 controle la saturation : au-dela d'un certain TF, augmenter les occurrences apporte de moins en moins

---

## Exercice 5 : Evaluation de RI -- MAP et nDCG

### Enonce

Un systeme retourne 10 documents pour une requete. Les jugements de pertinence sont :

| Rang | Document | Pertinent ? | Pertinence graduee (0-3) |
|------|---------|-------------|-------------------------|
| 1 | d4 | OUI | 3 (excellent) |
| 2 | d7 | NON | 0 |
| 3 | d1 | OUI | 2 (bon) |
| 4 | d9 | OUI | 1 (faible) |
| 5 | d2 | NON | 0 |
| 6 | d5 | NON | 0 |
| 7 | d3 | OUI | 3 (excellent) |
| 8 | d8 | NON | 0 |
| 9 | d6 | OUI | 2 (bon) |
| 10 | d10 | NON | 0 |

Total de documents pertinents dans la collection : 5.

### Partie A : Precision, Rappel, F1

```
Documents pertinents recuperes : 5 (d4, d1, d9, d3, d6)
Documents recuperes : 10
Documents pertinents totaux : 5

Precision P = 5/10 = 0.50
Rappel    R = 5/5  = 1.00
F1        = 2 * 0.50 * 1.00 / (0.50 + 1.00) = 1.00 / 1.50 = 0.667
```

### Partie B : P@k et R@k

```
P@1 = 1/1 = 1.000   (d4 pertinent)
P@2 = 1/2 = 0.500   (d7 non pertinent)
P@3 = 2/3 = 0.667   (d1 pertinent)
P@4 = 3/4 = 0.750   (d9 pertinent)
P@5 = 3/5 = 0.600   (d2 non pertinent)

R@3 = 2/5 = 0.400
R@5 = 3/5 = 0.600
R@10 = 5/5 = 1.000
```

### Partie C : MAP (Mean Average Precision)

```
AveP(q) = moyenne des precisions aux rangs des documents pertinents

Documents pertinents aux rangs : 1, 3, 4, 7, 9

P@1 = 1/1 = 1.000   (d4 pertinent)
P@3 = 2/3 = 0.667   (d1 pertinent, 2e pertinent trouve)
P@4 = 3/4 = 0.750   (d9 pertinent, 3e pertinent trouve)
P@7 = 4/7 = 0.571   (d3 pertinent, 4e pertinent trouve)
P@9 = 5/9 = 0.556   (d6 pertinent, 5e pertinent trouve)

AveP = (1.000 + 0.667 + 0.750 + 0.571 + 0.556) / 5
     = 3.544 / 5
     = 0.709
```

**Interpretation** : une MAP de 0.709 signifie que le systeme place generalement les documents pertinents en bonne position. Le premier document est pertinent (bon), mais les documents non pertinents aux rangs 2, 5, 6, 8 et 10 reduisent la precision aux rangs suivants.

### Partie D : nDCG (type DS 2023)

**Etape 1 : DCG (Discounted Cumulative Gain)**

```
DCG@k = SUM_{i=1}^{k} (2^{rel(i)} - 1) / log2(i + 1)

DCG@10 = (2^3 - 1)/log2(2) + (2^0 - 1)/log2(3) + (2^2 - 1)/log2(4)
       + (2^1 - 1)/log2(5) + (2^0 - 1)/log2(6) + (2^0 - 1)/log2(7)
       + (2^3 - 1)/log2(8) + (2^0 - 1)/log2(9) + (2^2 - 1)/log2(10)
       + (2^0 - 1)/log2(11)
```

Calcul terme par terme :
```
Rang 1 : (8-1)/1.000  = 7.000/1.000 = 7.000
Rang 2 : (1-1)/1.585  = 0.000/1.585 = 0.000
Rang 3 : (4-1)/2.000  = 3.000/2.000 = 1.500
Rang 4 : (2-1)/2.322  = 1.000/2.322 = 0.431
Rang 5 : (1-1)/2.585  = 0.000/2.585 = 0.000
Rang 6 : (1-1)/2.807  = 0.000/2.807 = 0.000
Rang 7 : (8-1)/3.000  = 7.000/3.000 = 2.333
Rang 8 : (1-1)/3.170  = 0.000/3.170 = 0.000
Rang 9 : (4-1)/3.322  = 3.000/3.322 = 0.903
Rang 10: (1-1)/3.459  = 0.000/3.459 = 0.000

DCG@10 = 7.000 + 0 + 1.500 + 0.431 + 0 + 0 + 2.333 + 0 + 0.903 + 0
       = 12.167
```

**Etape 2 : IDCG (classement ideal)**

Classement ideal : trier par pertinence decroissante.
```
Rang 1 : rel=3 (d4)
Rang 2 : rel=3 (d3)
Rang 3 : rel=2 (d1)
Rang 4 : rel=2 (d6)
Rang 5 : rel=1 (d9)
Rangs 6-10 : rel=0
```

```
IDCG@10 = 7/1.000 + 7/1.585 + 3/2.000 + 3/2.322 + 1/2.585 + 0 + ... + 0
        = 7.000 + 4.416 + 1.500 + 1.292 + 0.387
        = 14.595
```

**Etape 3 : nDCG**

```
nDCG@10 = DCG@10 / IDCG@10 = 12.167 / 14.595 = 0.834
```

**Interpretation** : nDCG = 0.834 signifie que le classement est a 83.4% du classement ideal. Le principal defaut est que d3 (pertinence=3) est au rang 7 au lieu du rang 2.

### Difference MAP vs nDCG (question DS)

| Critere | MAP | nDCG |
|---------|-----|------|
| Jugements | Binaire (pertinent / non pertinent) | Gradues (0, 1, 2, 3...) |
| Discount | Penalise les pertinents mal classes | Discount logarithmique |
| Normalisation | Par le nombre de documents pertinents | Par le classement ideal (IDCG) |
| Quand l'utiliser | Pertinence binaire simple | Pertinence a plusieurs niveaux |

---

## Exercice 6 : PageRank (type DS)

### Enonce

4 pages web formant le graphe suivant :

```
A --> B
A --> C
B --> C
C --> A
D --> C
```

d = 0.85, N = 4

### Solution

**Formule** :
```
PR(u) = (1-d)/N + d * SUM_{v in B_u} PR(v) / L(v)

ou :
  B_u = pages pointant vers u
  L(v) = nombre de liens sortants de v
```

**Liens sortants** :
```
L(A) = 2 (A --> B, A --> C)
L(B) = 1 (B --> C)
L(C) = 1 (C --> A)
L(D) = 1 (D --> C)
```

**Pages pointant vers chaque page** :
```
B_A = {C}          (seul C pointe vers A)
B_B = {A}          (seul A pointe vers B)
B_C = {A, B, D}    (A, B et D pointent vers C)
B_D = {}           (personne ne pointe vers D)
```

**Iteration 0 (initialisation)** :
```
PR_0(A) = PR_0(B) = PR_0(C) = PR_0(D) = 1/4 = 0.250
```

**Iteration 1** :
```
PR_1(A) = (1-0.85)/4 + 0.85 * [PR_0(C)/L(C)]
        = 0.0375 + 0.85 * [0.250/1]
        = 0.0375 + 0.2125
        = 0.250

PR_1(B) = 0.0375 + 0.85 * [PR_0(A)/L(A)]
        = 0.0375 + 0.85 * [0.250/2]
        = 0.0375 + 0.10625
        = 0.144

PR_1(C) = 0.0375 + 0.85 * [PR_0(A)/L(A) + PR_0(B)/L(B) + PR_0(D)/L(D)]
        = 0.0375 + 0.85 * [0.250/2 + 0.250/1 + 0.250/1]
        = 0.0375 + 0.85 * [0.125 + 0.250 + 0.250]
        = 0.0375 + 0.85 * 0.625
        = 0.0375 + 0.53125
        = 0.569

PR_1(D) = 0.0375 + 0.85 * []
        = 0.0375 + 0
        = 0.0375
```

**Verification** : PR_1(A) + PR_1(B) + PR_1(C) + PR_1(D) = 0.250 + 0.144 + 0.569 + 0.0375 = 1.0

**Apres convergence** (plusieurs iterations) :
```
C a le plus fort PageRank car il recoit le plus de liens entrants (3 pages)
D a le plus faible car personne ne pointe vers lui (seule la teleportation)
A a un bon score grace au lien depuis C (qui a un fort PR)
```

**Interpretation** : PageRank mesure la "popularite" d'une page par le nombre et la qualite des liens entrants. C est la page la plus "importante" dans ce graphe.

---

## Exercice 7 : Index inverse (question cours)

### Enonce

Construire l'index inverse pour la collection :
```
d1 : "chat mange souris"
d2 : "souris mange fromage"
d3 : "chat dort"
```

### Solution

**Index inverse** :
```
chat    --> {d1, d3}     (2 documents)
mange   --> {d1, d2}     (2 documents)
souris  --> {d1, d2}     (2 documents)
fromage --> {d2}         (1 document)
dort    --> {d3}         (1 document)
```

**Avec positions (index inverse positionnel)** :
```
chat    --> {d1: [1], d3: [1]}
mange   --> {d1: [2], d2: [2]}
souris  --> {d1: [3], d2: [1]}
fromage --> {d2: [3]}
dort    --> {d3: [2]}
```

**Interet de l'index inverse** :
- Acces direct aux documents pertinents sans parcourir toute la collection
- Requete "chat" : consulter l'entree "chat" --> {d1, d3} en O(1)
- Requete "chat AND mange" : intersection {d1, d3} inter {d1, d2} = {d1}

---

## Resume des formules essentielles

```
TF-IDF :
  tf(t, d) = occurrences de t dans d / total mots dans d
  idf(t) = log(|D| / df(t))
  tfidf(t, d) = tf(t, d) * idf(t)

SIMILARITE COSINUS :
  cos(d1, d2) = (d1 . d2) / (||d1|| * ||d2||)
  ou d1 . d2 = SUM_i d1_i * d2_i
  et ||d|| = sqrt(SUM_i d_i^2)

BM25 :
  score(q, d) = SUM_{t in q} idf(t) * [tf(t,d)*(k1+1)] / [tf(t,d) + k1*(1-b+b*|d|/avgdl)]

MAP :
  AveP(q) = (1/|R|) * SUM_{rang des docs pertinents} P@rang

nDCG :
  DCG@k = SUM_{i=1}^{k} (2^{rel(i)} - 1) / log2(i+1)
  nDCG@k = DCG@k / IDCG@k

PAGERANK :
  PR(u) = (1-d)/N + d * SUM_{v-->u} PR(v)/L(v)
```

---

## Pieges courants en DS

1. **log en base 10 vs base 2** : verifier la convention dans l'enonce. Base 10 est courante en RI, base 2 pour la perplexite
2. **Mots vides** : les supprimer AVANT le calcul TF-IDF
3. **IDF = 0** : un mot present dans TOUS les documents a un TF-IDF nul
4. **Normalisation cosinus** : invariant a la longueur du document, pas le produit scalaire
5. **df vs tf** : df = nombre de DOCUMENTS contenant le mot, tf = nombre d'OCCURRENCES dans un document
6. **nDCG utilise des jugements gradues** : c'est sa particularite par rapport a MAP (question classique)
7. **MAP** : on ne calcule la precision qu'aux rangs ou un document pertinent apparait
8. **BM25 k1** : controle la saturation du TF. k1=0 --> TF ignore, k1 grand --> TF lineaire
9. **BM25 b** : controle la normalisation par la longueur. b=0 --> pas de normalisation, b=1 --> normalisation complete
10. **PageRank** : la somme de tous les PR doit toujours faire 1.0 (verification)
