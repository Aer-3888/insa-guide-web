---
title: "Chapitre 1 : Fondements des probabilites"
sidebar_position: 1
---

# Chapitre 1 : Fondements des probabilites

## 1.1 Experiences aleatoires et espaces probabilises

### Definitions

Une **experience aleatoire** est une experience dont le resultat ne peut pas etre predit avec certitude en raison du hasard.

- **Espace fondamental** $\Omega$ : L'ensemble de tous les resultats possibles (aussi appele ensemble universel).
- **Evenement** $A$ : Un sous-ensemble de $\Omega$. Un evenement est « realise » lorsque le resultat $\omega \in A$.
- **Evenement elementaire** : Un singleton $\{\omega\}$ contenant un seul resultat.

Les espaces fondamentaux **discrets** sont au plus denombrables ($\subseteq \mathbb{N}$). Les espaces fondamentaux **continus** sont non denombrables ($\subseteq \mathbb{R}$).

### Tribu (sigma-algebre)

Une **tribu** $\mathcal{F}$ sur $\Omega$ est une collection d'evenements satisfaisant :

1. $\Omega \in \mathcal{F}$ et $\emptyset \in \mathcal{F}$
2. Si $A \in \mathcal{F}$, alors $\bar{A} = \Omega \setminus A \in \mathcal{F}$ (stabilite par complementaire)
3. Si $A_i \in \mathcal{F}$ pour tout $i$, alors $\bigcup_i A_i \in \mathcal{F}$ (stabilite par union denombrable)

La **tribu de Borel** sur $\mathbb{R}$ est la plus petite tribu contenant tous les intervalles ouverts $]-\infty, a[$.

**Exemple** : Pour $\Omega = \{a, b, c\}$, la tribu triviale est $\{\emptyset, \Omega\}$. L'ensemble des parties $\{\emptyset, \{a\}, \{b\}, \{c\}, \{a,b\}, \{a,c\}, \{b,c\}, \Omega\}$ est egalement une tribu valide.

---

## 1.2 Axiomes de probabilite (Kolmogorov)

Une **mesure de probabilite** $P: \mathcal{F} \to [0,1]$ attribue un nombre reel a chaque evenement tel que :

| Axiome | Enonce |
|-------|-----------|
| Axiome 1 | $0 \leq P(A) \leq 1$ pour tout $A \in \mathcal{F}$ |
| Axiome 2 | $P(\Omega) = 1$ (evenement certain) |
| Axiome 3 | Pour des evenements disjoints $A_i \cap A_j = \emptyset$ : $P\left(\bigcup_i A_i\right) = \sum_i P(A_i)$ (sigma-additivite) |

Le triplet $(\Omega, \mathcal{F}, P)$ est appele un **espace probabilise**.

### Proprietes fondamentales

A partir des axiomes, les proprietes suivantes sont verifiees :

$$P(\emptyset) = 0$$

$$P(\bar{A}) = 1 - P(A)$$

$$A \subseteq B \implies P(A) \leq P(B)$$

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

$$P(A \cup B) \leq P(A) + P(B) \quad \text{(borne de l'union / inegalite de Boole)}$$

### Probabilite classique (uniforme)

Lorsque tous les evenements elementaires sont equiprobables :

$$P(A) = \frac{|A|}{|\Omega|} = \frac{\text{nombre de cas favorables}}{\text{nombre total de cas}}$$

### Interpretation frequentiste (statistique)

Repeter l'experience $N$ fois et observer combien de fois $A$ se realise :

$$P(A) = \lim_{N \to \infty} \frac{\text{nombre de fois ou } A \text{ s'est realise}}{N}$$

---

## 1.3 Probabilite conditionnelle

### Definition

La **probabilite conditionnelle** de $A$ sachant $B$ (avec $P(B) > 0$) est :

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

Cela represente la probabilite que $A$ se realise, sachant que $B$ s'est realise.

**Remarque** : Le fait que $B$ conditionne $A$ n'implique pas que $B$ s'est produit chronologiquement avant $A$.

### Exemple corrige

> On lance un de equilibre et le resultat est pair (evenement $A$). Quelle est $P(\text{resultat} \geq 4 \mid \text{resultat pair})$ ?

$A = \{2, 4, 6\}$ (pair), $B = \{4, 5, 6\}$ (au moins 4).

$$P(B \mid A) = \frac{P(A \cap B)}{P(A)} = \frac{P(\{4, 6\})}{P(\{2, 4, 6\})} = \frac{2/6}{3/6} = \frac{2}{3}$$

---

## 1.4 Probabilite totale et theoreme de Bayes

### Formule des probabilites totales

Si $A_1, \ldots, A_n$ est une **partition** de $\Omega$ (mutuellement exclusifs, collectivement exhaustifs) avec $P(A_i) > 0$ :

$$P(B) = \sum_{i=1}^{n} P(A_i) \cdot P(B \mid A_i)$$

### Theoreme de Bayes

$$P(A \mid B) = \frac{P(B \mid A) \cdot P(A)}{P(B)}$$

**Forme generalisee** (avec la partition $A_1, \ldots, A_n$) :

$$P(A_i \mid B) = \frac{P(B \mid A_i) \cdot P(A_i)}{\sum_{j=1}^{n} P(A_j) \cdot P(B \mid A_j)}$$

| Terme | Nom | Interpretation |
|------|------|----------------|
| $P(A)$ | A priori | Croyance sur $A$ avant d'observer $B$ |
| $P(A \mid B)$ | A posteriori | Croyance mise a jour apres observation de $B$ |
| $P(B \mid A)$ | Vraisemblance | Probabilite de $B$ si $A$ est vrai |

### Exemple corrige

> Une usine possede deux machines : la Machine 1 produit 60% des articles, la Machine 2 en produit 40%. Les taux de defaut sont de 3% pour la Machine 1 et 5% pour la Machine 2. Sachant qu'un article est defectueux, quelle est la probabilite qu'il provienne de la Machine 1 ?

Soit $M_1$ : provient de la Machine 1, $D$ : defectueux.

$$P(M_1 \mid D) = \frac{P(D \mid M_1) P(M_1)}{P(D \mid M_1) P(M_1) + P(D \mid M_2) P(M_2)}$$

$$= \frac{0.03 \times 0.60}{0.03 \times 0.60 + 0.05 \times 0.40} = \frac{0.018}{0.018 + 0.020} = \frac{0.018}{0.038} \approx 0.474$$

---

## 1.5 Independance

### Definition

Deux evenements $A$ et $B$ sont **independants** si et seulement si :

$$P(A \cap B) = P(A) \cdot P(B)$$

De maniere equivalente : $P(A \mid B) = P(A)$ (connaitre $B$ ne change pas la probabilite de $A$).

### Independance mutuelle

Une famille d'evenements $A_1, \ldots, A_n$ est **mutuellement independante** si pour tout sous-ensemble $J \subseteq \{1, \ldots, n\}$ :

$$P\left(\bigcap_{i \in J} A_i\right) = \prod_{i \in J} P(A_i)$$

**Attention** : L'independance deux a deux N'implique PAS l'independance mutuelle.

---

## 1.6 Rappels de combinatoire

| Concept | Formule | Ordre important ? | Repetition ? |
|---------|---------|:-:|:-:|
| Permutation | $n!$ | Oui | Non |
| Arrangement ($k$ parmi $n$) | $\frac{n!}{(n-k)!}$ | Oui | Non |
| Combinaison | $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ | Non | Non |
| Avec remise | $n^k$ | Oui | Oui |

---

## AIDE-MEMOIRE -- Fondements des probabilites

| Concept | Formule |
|---------|---------|
| Complementaire | $P(\bar{A}) = 1 - P(A)$ |
| Union | $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ |
| Conditionnelle | $P(A \mid B) = P(A \cap B) / P(B)$ |
| Probabilite totale | $P(B) = \sum_i P(A_i) P(B \mid A_i)$ |
| Bayes | $P(A \mid B) = \frac{P(B \mid A) P(A)}{P(B)}$ |
| Independance | $P(A \cap B) = P(A) P(B)$ |
| Uniforme | $P(A) = |A| / |\Omega|$ |
