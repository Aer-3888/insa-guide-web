---
title: "Exercices -- Naive Bayes avec Lissage de Laplace : Calculs complets"
sidebar_position: 3
---

# Exercices -- Naive Bayes avec Lissage de Laplace : Calculs complets

---

## Exercice 1 : Classification de sentiment (type DS 2022)

### Enonce

Corpus d'entrainement :

| Classe | bien | super | fantastique | decevant | mauvais | nul |
|--------|------|-------|-------------|----------|---------|-----|
| positif | 4 | 2 | 1 | 2 | 0 | 0 |
| negatif | 1 | 3 | 0 | 3 | 4 | 7 |

10 documents positifs, 10 negatifs. p(positif) = p(negatif) = 0.5.

**Classifier le document "super mais nul" avec lissage de Laplace.**

### Rappel : formules

```
Classification :   c_hat = argmax_c  p(c) * PROD_i p(w_i | c)

Lissage Laplace :  p(w|c) = (n(w,c) + 1) / (N_c + |V|)
   ou :  n(w,c) = nombre d'occurrences de w dans les documents de classe c
         N_c = nombre total de mots dans la classe c
         |V| = taille du vocabulaire (mots distincts)
```

### Solution pas a pas

**Etape 1 : Calculer N_c et |V|**

```
N_positif = 4 + 2 + 1 + 2 + 0 + 0 = 9  (total des occurrences dans la classe positif)
N_negatif = 1 + 3 + 0 + 3 + 4 + 7 = 18 (total des occurrences dans la classe negatif)
|V| = 6 (6 mots distincts dans le vocabulaire)
```

**Etape 2 : Probabilites conditionnelles avec Laplace**

Pour la classe **positif** (denominateur = N_positif + |V| = 9 + 6 = 15) :

| Mot | n(w, positif) | p(w\|positif) = (n+1)/(9+6) | Resultat |
|-----|-------------|---------------------------|----------|
| bien | 4 | (4+1)/15 | 5/15 = 0.3333 |
| super | 2 | (2+1)/15 | 3/15 = 0.2000 |
| fantastique | 1 | (1+1)/15 | 2/15 = 0.1333 |
| decevant | 2 | (2+1)/15 | 3/15 = 0.2000 |
| mauvais | 0 | (0+1)/15 | 1/15 = 0.0667 |
| nul | 0 | (0+1)/15 | 1/15 = 0.0667 |

**Verification** : somme = 5/15 + 3/15 + 2/15 + 3/15 + 1/15 + 1/15 = 15/15 = 1.0

Pour la classe **negatif** (denominateur = N_negatif + |V| = 18 + 6 = 24) :

| Mot | n(w, negatif) | p(w\|negatif) = (n+1)/(18+6) | Resultat |
|-----|-------------|------------------------------|----------|
| bien | 1 | (1+1)/24 | 2/24 = 0.0833 |
| super | 3 | (3+1)/24 | 4/24 = 0.1667 |
| fantastique | 0 | (0+1)/24 | 1/24 = 0.0417 |
| decevant | 3 | (3+1)/24 | 4/24 = 0.1667 |
| mauvais | 4 | (4+1)/24 | 5/24 = 0.2083 |
| nul | 7 | (7+1)/24 | 8/24 = 0.3333 |

**Verification** : somme = 2/24 + 4/24 + 1/24 + 4/24 + 5/24 + 8/24 = 24/24 = 1.0

**Etape 3 : Classification du document "super mais nul"**

Le mot "mais" n'est pas dans le vocabulaire --> on l'ignore.

```
score(positif) = p(positif) * p(super|positif) * p(nul|positif)
               = 0.5 * (3/15) * (1/15)
               = 0.5 * 0.2000 * 0.0667
               = 0.5 * 0.01333
               = 0.006667

score(negatif) = p(negatif) * p(super|negatif) * p(nul|negatif)
               = 0.5 * (4/24) * (8/24)
               = 0.5 * 0.1667 * 0.3333
               = 0.5 * 0.05556
               = 0.027778
```

**Comparaison** :
```
score(negatif) = 0.02778  >  score(positif) = 0.00667

Rapport : 0.02778 / 0.00667 = 4.17 (negatif est 4x plus probable)
```

**Classification : NEGATIF**

**Explication intuitive** : le mot "nul" n'apparait jamais dans la classe positif (0 occurrences), donc meme avec le lissage il a un poids tres faible (1/15). Dans la classe negatif, "nul" apparait 7 fois sur 18 et a un poids fort (8/24).

---

## Exercice 2 : Classifier "fantastique mais decevant"

### Solution

Memes donnees que l'exercice 1. On ignore "mais" (hors vocabulaire).

```
score(positif) = 0.5 * p(fantastique|positif) * p(decevant|positif)
               = 0.5 * (2/15) * (3/15)
               = 0.5 * 0.1333 * 0.2000
               = 0.5 * 0.02667
               = 0.01333

score(negatif) = 0.5 * p(fantastique|negatif) * p(decevant|negatif)
               = 0.5 * (1/24) * (4/24)
               = 0.5 * 0.0417 * 0.1667
               = 0.5 * 0.006944
               = 0.003472
```

**Comparaison** :
```
score(positif) = 0.01333  >  score(negatif) = 0.003472

Rapport : 0.01333 / 0.003472 = 3.84 (positif est ~4x plus probable)
```

**Classification : POSITIF**

**Explication** : "fantastique" est vu 1 fois en positif et 0 en negatif. "decevant" est vu 2 fois en positif et 3 en negatif. Le facteur "fantastique" pese plus lourd car il est proportionnellement plus frequent en positif.

---

## Exercice 3 : Classification thematique avec TF-IDF et cosinus (type DS 2023)

### Enonce

200 documents, 4 termes d'indexation.

| terme | w1 | w2 | w3 | w4 |
|-------|----|----|----|----|
| n_t (docs contenant) | 75 | 2 | 10 | 20 |

Representations moyennes TF-IDF des deux classes :
```
c1 = (0.13, 0.6, 0.13, 0.1)
c2 = (0.08, 0.2, 0.4, 0.4)
```

Document d : 20 tokens, 4 occurrences de w1, 1 de w2, 0 de w3, 3 de w4.

### Solution complete

**Etape 1 : IDF (base 10)**

```
idf(w1) = log10(200/75)  = log10(2.667)  = 0.4260
idf(w2) = log10(200/2)   = log10(100)    = 2.0000
idf(w3) = log10(200/10)  = log10(20)     = 1.3010
idf(w4) = log10(200/20)  = log10(10)     = 1.0000
```

**Observation** : w2 a le plus fort IDF car il n'apparait que dans 2 documents sur 200 (tres discriminant). w1 a le plus faible IDF car il apparait dans 75 documents (peu discriminant).

**Etape 2 : TF de d**

```
tf(w1, d) = 4/20  = 0.2000
tf(w2, d) = 1/20  = 0.0500
tf(w3, d) = 0/20  = 0.0000
tf(w4, d) = 3/20  = 0.1500
```

**Etape 3 : TF-IDF de d**

```
tfidf(w1, d) = tf(w1,d) * idf(w1) = 0.2000 * 0.4260 = 0.0852
tfidf(w2, d) = tf(w2,d) * idf(w2) = 0.0500 * 2.0000 = 0.1000
tfidf(w3, d) = tf(w3,d) * idf(w3) = 0.0000 * 1.3010 = 0.0000
tfidf(w4, d) = tf(w4,d) * idf(w4) = 0.1500 * 1.0000 = 0.1500
```

**Vecteur d** = (0.0852, 0.1000, 0.0000, 0.1500)

**Etape 4 : Similarite cosinus avec c1**

```
d . c1 = 0.0852*0.13 + 0.1000*0.60 + 0.0000*0.13 + 0.1500*0.10
       = 0.01108 + 0.06000 + 0.00000 + 0.01500
       = 0.08608

||d|| = sqrt(0.0852^2 + 0.1000^2 + 0.0000^2 + 0.1500^2)
      = sqrt(0.00726 + 0.01000 + 0.00000 + 0.02250)
      = sqrt(0.03976)
      = 0.19940

||c1|| = sqrt(0.13^2 + 0.60^2 + 0.13^2 + 0.10^2)
       = sqrt(0.0169 + 0.3600 + 0.0169 + 0.0100)
       = sqrt(0.4038)
       = 0.63546

cos(d, c1) = 0.08608 / (0.19940 * 0.63546)
           = 0.08608 / 0.12671
           = 0.6792
```

**Etape 5 : Similarite cosinus avec c2**

```
d . c2 = 0.0852*0.08 + 0.1000*0.20 + 0.0000*0.40 + 0.1500*0.40
       = 0.00682 + 0.02000 + 0.00000 + 0.06000
       = 0.08682

||c2|| = sqrt(0.08^2 + 0.20^2 + 0.40^2 + 0.40^2)
       = sqrt(0.0064 + 0.0400 + 0.1600 + 0.1600)
       = sqrt(0.3664)
       = 0.60532

cos(d, c2) = 0.08682 / (0.19940 * 0.60532)
           = 0.08682 / 0.12074
           = 0.7192
```

**Comparaison** :
```
cos(d, c2) = 0.7192  >  cos(d, c1) = 0.6792
```

**Classification : classe c2**

**Explication** : le document d a un fort poids sur w4 (tfidf=0.15) et pas de w3 (tfidf=0). Le profil de c2 (fort sur w3 et w4) correspond mieux que c1 (fort sur w2).

---

## Exercice 4 : Verifier le lissage de Laplace

### Enonce

Vocabulaire |V| = 4, classe c avec comptages : {a:5, b:3, c:0, d:2}, N_c = 10.

### Solution

**Sans lissage** :
```
p(a) = 5/10 = 0.5000
p(b) = 3/10 = 0.3000
p(c) = 0/10 = 0.0000   <-- PROBLEME : zero !
p(d) = 2/10 = 0.2000
Somme = 1.0000
```

Un document contenant "c" recevrait un score de 0 pour cette classe (le produit tombe a zero).

**Avec lissage de Laplace** :
```
p(a) = (5+1)/(10+4) = 6/14 = 0.4286
p(b) = (3+1)/(10+4) = 4/14 = 0.2857
p(c) = (0+1)/(10+4) = 1/14 = 0.0714   <-- plus de zero !
p(d) = (2+1)/(10+4) = 3/14 = 0.2143
Somme = 14/14 = 1.0000
```

**Verification** : la somme fait toujours 1.0 (c'est bien une distribution de probabilite).

**Observation** : le lissage a "emprunte" de la masse aux evenements frequents (a passe de 0.50 a 0.43) pour la redistribuer a l'evenement non observe (c passe de 0.00 a 0.07).

---

## Exercice 5 : Impact du prior p(c)

### Enonce

Memes donnees que l'exercice 1, mais 15 documents positifs et 5 negatifs. Reclassifier "super mais nul".

### Solution

```
p(positif) = 15/20 = 0.75
p(negatif) = 5/20  = 0.25

score(positif) = 0.75 * (3/15) * (1/15) = 0.75 * 0.01333 = 0.01000
score(negatif) = 0.25 * (4/24) * (8/24) = 0.25 * 0.05556 = 0.01389
```

**Classification : toujours NEGATIF** (mais la marge est plus faible)

Avec un prior encore plus desequilibre (p(positif)=0.9, p(negatif)=0.1) :
```
score(positif) = 0.9 * 0.01333 = 0.01200
score(negatif) = 0.1 * 0.05556 = 0.00556
```

**Classification : POSITIF** -- le prior a inverse la decision !

**Lecon** : le prior p(c) joue un role crucial quand les classes sont desequilibrees.

---

## Exercice 6 : Naive Bayes binaire vs frequentiel

### Enonce

Quelle est la difference entre l'estimateur binaire et l'estimateur frequentiel ?

### Reponse

**Binaire** : on compte la presence/absence du mot dans chaque document.
```
p(w|c) = (nb de docs de classe c contenant w) / (nb total de termes dans les docs de c)
```

**Frequentiel** : on compte le nombre d'occurrences du mot.
```
p(w|c) = (nb occurrences de w dans les docs de c) / (nb total mots dans les docs de c)
```

**Exemple** : document "super super nul" en classe negatif

| Methode | Comptage pour "super" | Comptage pour "nul" |
|---------|----------------------|---------------------|
| Binaire | 1 (present une fois dans le doc) | 1 (present une fois) |
| Frequentiel | 2 (deux occurrences) | 1 (une occurrence) |

Le choix entre les deux depend de la tache. Le frequentiel est plus courant en classification de texte.

---

## Pieges courants en DS

1. **Denominateur Laplace** : c'est N_c + **|V|**, PAS N_c + 1
2. **|V| est le vocabulaire GLOBAL** : tous les mots distincts, pas juste ceux de la classe
3. **Mots hors vocabulaire** : les ignorer dans le produit (ne pas les compter)
4. **Logarithmes** : en pratique on utilise log(p) pour eviter les underflows, mais en DS on calcule directement les produits
5. **Prior** : ne pas oublier p(c) dans le produit final
6. **Verification** : la somme des p(w|c) pour tous les w du vocabulaire doit faire 1
7. **Zero sans lissage** : un seul mot avec p=0 annule tout le produit
