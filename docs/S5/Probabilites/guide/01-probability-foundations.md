---
title: "Chapter 1: Probability Foundations"
sidebar_position: 1
---

# Chapter 1: Probability Foundations

## 1.1 Random Experiments and Sample Spaces

### Definitions

A **random experiment** is an experiment whose outcome cannot be predicted with certainty due to randomness.

- **Sample space** $\Omega$: The set of all possible outcomes (also called the universal set or fundamental set).
- **Event** $A$: A subset of $\Omega$. An event "occurs" when the outcome $\omega \in A$.
- **Elementary event**: A singleton $\{\omega\}$ containing a single outcome.

**Discrete** sample spaces are at most countable ($\subseteq \mathbb{N}$). **Continuous** sample spaces are uncountable ($\subseteq \mathbb{R}$).

### Sigma-Algebra (Tribe)

A **sigma-algebra** $\mathcal{F}$ on $\Omega$ is a collection of events satisfying:

1. $\Omega \in \mathcal{F}$ and $\emptyset \in \mathcal{F}$
2. If $A \in \mathcal{F}$, then $\bar{A} = \Omega \setminus A \in \mathcal{F}$ (closure under complement)
3. If $A_i \in \mathcal{F}$ for all $i$, then $\bigcup_i A_i \in \mathcal{F}$ (closure under countable union)

The **Borel sigma-algebra** on $\mathbb{R}$ is the smallest sigma-algebra containing all open intervals $]-\infty, a[$.

**Example**: For $\Omega = \{a, b, c\}$, the trivial tribe is $\{\emptyset, \Omega\}$. The power set $\{\emptyset, \{a\}, \{b\}, \{c\}, \{a,b\}, \{a,c\}, \{b,c\}, \Omega\}$ is also a valid tribe.

---

## 1.2 Axioms of Probability (Kolmogorov)

A **probability measure** $P: \mathcal{F} \to [0,1]$ assigns a real number to each event such that:

| Axiom | Statement |
|-------|-----------|
| Axiom 1 | $0 \leq P(A) \leq 1$ for all $A \in \mathcal{F}$ |
| Axiom 2 | $P(\Omega) = 1$ (certain event) |
| Axiom 3 | For disjoint events $A_i \cap A_j = \emptyset$: $P\left(\bigcup_i A_i\right) = \sum_i P(A_i)$ (sigma-additivity) |

The triplet $(\Omega, \mathcal{F}, P)$ is called a **probability space**.

### Fundamental Properties

From the axioms, the following hold:

$$P(\emptyset) = 0$$

$$P(\bar{A}) = 1 - P(A)$$

$$A \subseteq B \implies P(A) \leq P(B)$$

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

$$P(A \cup B) \leq P(A) + P(B) \quad \text{(union bound / Boole's inequality)}$$

### Classical (Uniform) Probability

When all elementary events are equally likely:

$$P(A) = \frac{|A|}{|\Omega|} = \frac{\text{number of favorable outcomes}}{\text{total number of outcomes}}$$

### Frequentist (Statistical) Interpretation

Repeat the experiment $N$ times and observe how often $A$ occurs:

$$P(A) = \lim_{N \to \infty} \frac{\text{number of times } A \text{ occurred}}{N}$$

---

## 1.3 Conditional Probability

### Definition

The **conditional probability** of $A$ given $B$ (with $P(B) > 0$) is:

$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}$$

This represents the probability of $A$ occurring, knowing that $B$ has occurred.

**Note**: $B$ conditioning $A$ does not imply $B$ happened chronologically before $A$.

### Worked Example

> A fair die is rolled and the result is even (event $A$). What is $P(\text{result} \geq 4 \mid \text{result is even})$?

$A = \{2, 4, 6\}$ (even), $B = \{4, 5, 6\}$ (at least 4).

$$P(B \mid A) = \frac{P(A \cap B)}{P(A)} = \frac{P(\{4, 6\})}{P(\{2, 4, 6\})} = \frac{2/6}{3/6} = \frac{2}{3}$$

---

## 1.4 Total Probability and Bayes' Theorem

### Law of Total Probability

If $A_1, \ldots, A_n$ is a **partition** of $\Omega$ (mutually exclusive, collectively exhaustive) with $P(A_i) > 0$:

$$P(B) = \sum_{i=1}^{n} P(A_i) \cdot P(B \mid A_i)$$

### Bayes' Theorem

$$P(A \mid B) = \frac{P(B \mid A) \cdot P(A)}{P(B)}$$

**Generalized form** (with partition $A_1, \ldots, A_n$):

$$P(A_i \mid B) = \frac{P(B \mid A_i) \cdot P(A_i)}{\sum_{j=1}^{n} P(A_j) \cdot P(B \mid A_j)}$$

| Term | Name | Interpretation |
|------|------|----------------|
| $P(A)$ | Prior (a priori) | Belief about $A$ before observing $B$ |
| $P(A \mid B)$ | Posterior (a posteriori) | Updated belief after observing $B$ |
| $P(B \mid A)$ | Likelihood | How likely $B$ is if $A$ holds |

### Worked Example

> A factory has two machines: Machine 1 produces 60% of items, Machine 2 produces 40%. Defect rates are 3% for Machine 1 and 5% for Machine 2. Given a defective item, what is the probability it came from Machine 1?

Let $M_1$: from Machine 1, $D$: defective.

$$P(M_1 \mid D) = \frac{P(D \mid M_1) P(M_1)}{P(D \mid M_1) P(M_1) + P(D \mid M_2) P(M_2)}$$

$$= \frac{0.03 \times 0.60}{0.03 \times 0.60 + 0.05 \times 0.40} = \frac{0.018}{0.018 + 0.020} = \frac{0.018}{0.038} \approx 0.474$$

---

## 1.5 Independence

### Definition

Two events $A$ and $B$ are **independent** if and only if:

$$P(A \cap B) = P(A) \cdot P(B)$$

Equivalently: $P(A \mid B) = P(A)$ (knowing $B$ does not change the probability of $A$).

### Mutual Independence

A family of events $A_1, \ldots, A_n$ is **mutually independent** if for every subset $J \subseteq \{1, \ldots, n\}$:

$$P\left(\bigcap_{i \in J} A_i\right) = \prod_{i \in J} P(A_i)$$

**Warning**: Pairwise independence does NOT imply mutual independence.

---

## 1.6 Combinatorics Refresher

| Concept | Formula | Order matters? | Repetition? |
|---------|---------|:-:|:-:|
| Permutation | $n!$ | Yes | No |
| Arrangement ($k$ from $n$) | $\frac{n!}{(n-k)!}$ | Yes | No |
| Combination | $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ | No | No |
| With replacement | $n^k$ | Yes | Yes |

---

## CHEAT SHEET -- Probability Foundations

| Concept | Formula |
|---------|---------|
| Complement | $P(\bar{A}) = 1 - P(A)$ |
| Union | $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ |
| Conditional | $P(A \mid B) = P(A \cap B) / P(B)$ |
| Total probability | $P(B) = \sum_i P(A_i) P(B \mid A_i)$ |
| Bayes | $P(A \mid B) = \frac{P(B \mid A) P(A)}{P(B)}$ |
| Independence | $P(A \cap B) = P(A) P(B)$ |
| Uniform | $P(A) = |A| / |\Omega|$ |
