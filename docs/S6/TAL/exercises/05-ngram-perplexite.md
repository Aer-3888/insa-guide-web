---
title: "Exercices -- N-grammes et Perplexite : Calculs complets"
sidebar_position: 5
---

# Exercices -- N-grammes et Perplexite : Calculs complets

---

## Exercice 1 : Construction d'un modele bigramme

### Enonce

Corpus d'entrainement (avec marqueurs de debut/fin de phrase) :
```
<s> le chat mange la souris </s>
<s> la souris mange du fromage </s>
<s> le chat dort </s>
```

**1. Construire le modele bigramme (estimation ML).**
**2. Calculer P("le chat mange du fromage").**

### Solution

**Etape 1 : Compter les unigrammes (contexte des bigrammes)**

```
C(<s>)      = 3    (3 phrases)
C(le)       = 2    (2 occurrences de "le")
C(la)       = 2
C(chat)     = 2
C(mange)    = 2
C(souris)   = 2
C(du)       = 1
C(fromage)  = 1
C(dort)     = 1
```

**Etape 2 : Compter les bigrammes**

| Bigramme | Comptage | Source |
|----------|---------|--------|
| <s> le | 2 | phrase 1, phrase 3 |
| <s> la | 1 | phrase 2 |
| le chat | 2 | phrase 1, phrase 3 |
| chat mange | 1 | phrase 1 |
| chat dort | 1 | phrase 3 |
| mange la | 1 | phrase 1 |
| mange du | 1 | phrase 2 |
| la souris | 2 | phrase 1, phrase 2 |
| souris mange | 1 | phrase 2 |
| souris </s> | 1 | phrase 1 |
| du fromage | 1 | phrase 2 |
| fromage </s> | 1 | phrase 2 |
| dort </s> | 1 | phrase 3 |

**Etape 3 : Probabilites bigrammes P(w | h) = C(h w) / C(h)**

```
P(le | <s>)       = C(<s> le) / C(<s>)        = 2/3 = 0.6667
P(la | <s>)       = C(<s> la) / C(<s>)        = 1/3 = 0.3333
P(chat | le)      = C(le chat) / C(le)        = 2/2 = 1.0000
P(mange | chat)   = C(chat mange) / C(chat)   = 1/2 = 0.5000
P(dort | chat)    = C(chat dort) / C(chat)    = 1/2 = 0.5000
P(la | mange)     = C(mange la) / C(mange)    = 1/2 = 0.5000
P(du | mange)     = C(mange du) / C(mange)    = 1/2 = 0.5000
P(souris | la)    = C(la souris) / C(la)      = 2/2 = 1.0000
P(mange | souris) = C(souris mange)/C(souris)  = 1/2 = 0.5000
P(</s> | souris)  = C(souris </s>)/C(souris)  = 1/2 = 0.5000
P(fromage | du)   = C(du fromage) / C(du)     = 1/1 = 1.0000
P(</s> | fromage) = C(fromage </s>)/C(fromage)= 1/1 = 1.0000
P(</s> | dort)    = C(dort </s>) / C(dort)    = 1/1 = 1.0000
```

**Etape 4 : P("le chat mange du fromage")**

Phrase avec marqueurs : "<s> le chat mange du fromage </s>"

```
P = P(le|<s>) * P(chat|le) * P(mange|chat) * P(du|mange) * P(fromage|du) * P(</s>|fromage)
  = 2/3     *    1        *    1/2         *    1/2       *    1          *    1
  = 0.6667 * 1.0000 * 0.5000 * 0.5000 * 1.0000 * 1.0000
  = 0.1667
```

**Verification** : cette probabilite est raisonnable. La phrase combine des bigrammes vus dans le corpus (le chat, chat mange) et un bigramme moins courant (mange du).

---

## Exercice 2 : Perplexite avec et sans lissage

### Enonce

Modele bigramme de l'exercice 1. Calculer la perplexite de "le chat mange".

### Rappel : formule de perplexite

```
PP(modele, texte) = 2^{-1/n * SUM_{i=1}^{n} log2(P(w_i | w_{i-1}))}
```
ou n = nombre de tokens du texte (incluant </s>, excluant <s>).

### Solution

Phrase test avec marqueurs : "<s> le chat mange </s>"

n = 4 tokens (le, chat, mange, </s>)

**Probabilites necessaires** :
```
P(le | <s>)     = 2/3  = 0.6667
P(chat | le)    = 2/2  = 1.0000
P(mange | chat) = 1/2  = 0.5000
P(</s> | mange) = C(mange </s>) / C(mange) = 0/2 = 0.0000
```

**Probleme** : P(</s> | mange) = 0 car dans le corpus, "mange" n'est jamais suivi de "</s>" (il est suivi de "la" ou "du"). Sans lissage, la perplexite est **infinie** (un seul zero dans un log annule tout).

### Solution avec lissage de Laplace

Vocabulaire : {<s>, le, la, chat, mange, souris, du, fromage, dort, </s>} --> |V| = 10

**Formule avec Laplace** : P(w | h) = (C(hw) + 1) / (C(h) + |V|)

```
P_L(le | <s>)     = (2+1) / (3+10) = 3/13 = 0.2308
P_L(chat | le)    = (2+1) / (2+10) = 3/12 = 0.2500
P_L(mange | chat) = (1+1) / (2+10) = 2/12 = 0.1667
P_L(</s> | mange) = (0+1) / (2+10) = 1/12 = 0.0833
```

**Calcul de la perplexite** :

```
log2(0.2308) = -2.1155
log2(0.2500) = -2.0000
log2(0.1667) = -2.5850
log2(0.0833) = -3.5850

SUM = -2.1155 + (-2.0000) + (-2.5850) + (-3.5850) = -10.2855

-1/n * SUM = -1/4 * (-10.2855) = 2.5714

PP = 2^{2.5714} = 5.94
```

**Perplexite = 5.94**

**Interpretation** : en moyenne, le modele "hesite" entre ~6 mots possibles a chaque position. C'est un resultat mediocre car le vocabulaire n'a que 10 mots.

### Comparaison : perplexite sans lissage pour "le chat dort"

```
P(le | <s>)    = 2/3 = 0.6667
P(chat | le)   = 2/2 = 1.0000
P(dort | chat) = 1/2 = 0.5000
P(</s> | dort) = 1/1 = 1.0000

log2(0.6667) = -0.5850
log2(1.0000) =  0.0000
log2(0.5000) = -1.0000
log2(1.0000) =  0.0000

SUM = -1.5850
-1/4 * (-1.5850) = 0.3963

PP = 2^{0.3963} = 1.317
```

**Perplexite = 1.32** -- excellente car la phrase est quasiment "deterministe" dans le modele.

---

## Exercice 3 : Pourquoi Laplace est inadapte aux n-grammes (question DS 2022)

### Enonce

La technique de lissage de Laplace est-elle adaptee aux modeles n-grammes ?

### Reponse type complete

**Non, Laplace est inadapte aux n-grammes**, pour les raisons suivantes :

**1. Redistribution excessive** :
Avec un vocabulaire V de taille |V| et des n-grammes d'ordre n, le nombre de n-grammes possibles est |V|^n. Pour un trigramme avec |V|=50000, il y a 50000^3 = 1.25 * 10^14 trigrammes possibles. Ajouter 1 a chacun redistribue une masse enorme vers les n-grammes non observes.

**2. Tendance vers l'uniforme** :
Quand on augmente la constante de lissage (alpha au lieu de 1), le modele tend vers une distribution uniforme P(w|h) = 1/|V| pour tout w et h. On perd toute l'information apprise du corpus.

**Demonstration** :
```
P(w|h) = (C(hw) + alpha) / (C(h) + alpha * |V|)

Quand alpha --> infini :
P(w|h) --> alpha / (alpha * |V|) = 1/|V|  (uniforme)
```

**3. Perplexite augmente** :
En TP, on observe experimentalement que la perplexite augmente quand on augmente la constante de lissage. Le modele devient moins precis, pas plus.

**4. Alternatives superieures** :

| Methode | Principe | Avantage |
|---------|---------|---------|
| Kneser-Ney | Diversite contextuelle des mots | Le plus performant en pratique |
| Interpolation | Melange des ordres | Combine les forces de chaque ordre |
| Good-Turing | Frequence des frequences | Mathematiquement fonde |
| Back-off | Recule si pas d'observation | Simple et efficace |

---

## Exercice 4 : Interpolation lineaire

### Enonce

Modele interpolant trigramme + bigramme + unigramme :
```
P_I[w|h] = lambda_3 * P_tri[w|h2] + lambda_2 * P_bi[w|h1] + lambda_1 * P_uni[w]
         = 0.6 * P_tri + 0.3 * P_bi + 0.1 * P_uni
```

Donnees :
```
P_tri[mange | le chat] = 0.50
P_bi[mange | chat]     = 0.40
P_uni[mange]           = 0.02

P_tri[dort | le chat]  = 0.30
P_bi[dort | chat]      = 0.35
P_uni[dort]            = 0.01
```

**Calculer P_I[mange | le chat] et P_I[dort | le chat].**

### Solution

```
P_I[mange | le chat] = 0.6 * 0.50 + 0.3 * 0.40 + 0.1 * 0.02
                     = 0.300 + 0.120 + 0.002
                     = 0.422

P_I[dort | le chat] = 0.6 * 0.30 + 0.3 * 0.35 + 0.1 * 0.01
                    = 0.180 + 0.105 + 0.001
                    = 0.286
```

**Verification** : les lambdas somment a 1 (0.6 + 0.3 + 0.1 = 1.0).

**Observation** : le trigramme contribue le plus (60%) car il est le plus informatif quand il dispose de donnees suffisantes. L'unigramme contribue peu (10%) mais assure que la probabilite n'est jamais nulle.

---

## Exercice 5 : Perplexite comparative de deux modeles

### Enonce

Phrase test : "la souris dort" (n=4 avec </s>)

Modele A (bigramme ML) et Modele B (bigramme Laplace, |V|=10).

### Solution

**Modele A (ML)** :
```
P(la | <s>)     = 1/3 = 0.3333
P(souris | la)  = 2/2 = 1.0000
P(dort | souris)= C(souris dort)/C(souris) = 0/2 = 0.0000

PP_A = infini (a cause du zero)
```

**Modele B (Laplace)** :
```
P_L(la | <s>)     = (1+1)/(3+10) = 2/13 = 0.1538
P_L(souris | la)  = (2+1)/(2+10) = 3/12 = 0.2500
P_L(dort | souris)= (0+1)/(2+10) = 1/12 = 0.0833
P_L(</s> | dort)  = (1+1)/(1+10) = 2/11 = 0.1818

log2(0.1538) = -2.7004
log2(0.2500) = -2.0000
log2(0.0833) = -3.5850
log2(0.1818) = -2.4594

SUM = -10.7448
-1/4 * (-10.7448) = 2.6862

PP_B = 2^{2.6862} = 6.45
```

**Lecon** : meme si le lissage de Laplace n'est pas ideal, il produit une perplexite finie (6.45) alors que le ML donne l'infini. Le lissage est indispensable.

---

## Exercice 6 : Construction d'un modele trigramme

### Enonce

Corpus : `<s> <s> a b c a b </s>`

Estimer P(c | a b) et P(</s> | a b) en trigramme ML.

### Solution

```
C(a b c) = 1    C(a b </s>) = 1    C(a b) = 2

P(c | a b)   = C(a b c) / C(a b)   = 1/2 = 0.50
P(</s> | a b) = C(a b </s>) / C(a b) = 1/2 = 0.50
```

**Verification** : P(c | a b) + P(</s> | a b) = 1.0 (les deux seuls continuations observees somment a 1).

---

## Exercice 7 : Kneser-Ney (question type DS)

### Enonce

Expliquer le principe du lissage de Kneser-Ney et pourquoi il est superieur a Laplace pour les n-grammes.

### Reponse type complete

**Probleme de Laplace rappele :**
Le lissage de Laplace ajoute 1 a chaque comptage, ce qui avec un vocabulaire de taille |V| et des n-grammes d'ordre n redistribue massivement la masse de probabilite vers les |V|^n n-grammes non observes. Par exemple, avec |V|=50000 et des trigrammes, il y a 50000^3 = 1.25 * 10^14 trigrammes possibles. Ajouter 1 a chacun rend le modele presque uniforme.

**Principe de Kneser-Ney :**

Kneser-Ney utilise deux idees fondamentales :

1. **Discounting absolu** : au lieu d'ajouter un pseudo-comptage, on SOUSTRAIT un montant fixe d (typiquement d = 0.75) de chaque comptage observe.

```
P_KN(w|h) = max(C(hw) - d, 0) / C(h) + lambda(h) * P_continuation(w)
```

2. **Probabilite de continuation** : la masse de probabilite liberee par le discounting est redistribuee selon la "diversite contextuelle" du mot w. Un mot qui apparait dans beaucoup de contextes differents recoit plus de masse qu'un mot qui n'apparait que dans un seul contexte.

```
P_continuation(w) = |{h : C(hw) > 0}| / |{(h', w') : C(h'w') > 0}|
```

Cette formule compte le nombre de contextes differents precedant w, divise par le total des paires (contexte, mot) observees.

**Exemple intuitif :**

"San Francisco" a un comptage tres eleve, mais "Francisco" n'apparait pratiquement que dans un seul contexte ("San"). Avec Laplace, "Francisco" recevrait une probabilite elevee comme mot de continuation apres n'importe quel historique (car son comptage unigram est eleve). Kneser-Ney corrige ce probleme : P_continuation("Francisco") est faible car le mot n'apparait que dans 1 contexte distinct.

**Comparaison :**

| Critere | Laplace | Kneser-Ney |
|---------|---------|------------|
| Modification | Ajoute 1 a chaque comptage | Soustrait d des comptages observes |
| Redistribution | Uniforme | Basee sur la diversite contextuelle |
| Effet sur les mots frequents | Faible impact (relative) | Impact controle par d |
| Effet sur les mots rares | Surestime si peu de contextes | Adapte selon les contextes vus |
| Perplexite | Augmente avec |V| | Parmi les meilleurs en pratique |

---

## Resume des formules essentielles

```
ESTIMATION ML :           P[w|h] = C(hw) / C(h)

LISSAGE LAPLACE :         P[w|h] = (C(hw) + 1) / (C(h) + |V|)

PERPLEXITE :              PP = 2^{-1/n * SUM_i log2(P(w_i | contexte))}
                          Plus BASSE = meilleur modele
                          PP = 1 : prediction parfaite
                          PP = |V| : pas mieux que le hasard

INTERPOLATION :           P_I = lambda_n * P_ML[w|h_n]
                                + lambda_{n-1} * P_ML[w|h_{n-1}]
                                + ... + lambda_1 * P_ML[w]
                          avec SUM lambda_i = 1
```

---

## Pieges courants en DS

1. **Perplexite BASSE = meilleur** : piege le plus courant en DS
2. **n dans la formule de PP** : nombre de tokens du test (excluant <s>, incluant </s>)
3. **Logarithme base 2** : la perplexite utilise log2 (pas log10 ni ln)
4. **Un seul zero** : sans lissage, un P=0 rend PP=infini
5. **Bigramme regarde 1 mot** : bigramme = n=2 mais l'historique est de taille n-1 = 1
6. **Ne pas confondre C(h) et C(hw)** : C("le") est le nombre de fois que "le" apparait, C("le chat") est le nombre de fois que "le chat" apparait en sequence
7. **<s> et </s>** : <s> n'est jamais predit (pas de P(<s>|...)), mais </s> l'est toujours
