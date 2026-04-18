---
title: "Preparation a l'examen -- Probabilites"
sidebar_position: 0
---

# Preparation a l'examen -- Probabilites

## Format de l'examen

- **Duree** : 2 heures
- **Type** : Ecrit (DS -- Devoir Surveille)
- **Materiel autorise** : Aucun (pas de formulaire, pas de calculatrice sauf mention contraire)
- **Structure** : 3-4 exercices, typiquement 20 points au total
- **Langue** : Francais

## Structure de l'examen (basee sur les annales 2021-2026)

L'examen suit systematiquement ce schema :

| Exercice | Sujet | Points | Frequence |
|---|---|---|---|
| 1 | **Intervalles de confiance** | 4-5 pts | Chaque annee |
| 2 | **Tests d'hypotheses** (conformite ou homogeneite) | 5-6 pts | Chaque annee |
| 3 | **Probleme de distribution** (analyse de puissance, multinomiale, ou distribution specifique) | 5-6 pts | Chaque annee |
| 4 | **Vecteurs aleatoires** / Distributions jointes | 4-5 pts | La plupart des annees |

## Analyse de frequence des sujets (2022-2026)

| Sujet | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| Estimation ponctuelle (moyenne, variance) | x | x | x | x | x |
| IC pour la moyenne ($\sigma$ inconnu, Student) | x | x | x | x | x |
| IC pour la variance (Chi-deux) | x | | x | | |
| Test de conformite (un echantillon) | x | | | | |
| Test d'homogeneite (deux echantillons) | x | x | x | | |
| Calcul de la p-valeur | x | x | x | | |
| Analyse de puissance | | x | | | |
| Loi multinomiale | | | x | | |
| IC pour une proportion | | | x | | |
| Ecriture de code R | x | x | x | x | x |
| Vecteurs aleatoires / matrice de covariance | | | x | | |

## Strategie d'examen

### Gestion du temps

| Phase | Temps | Quoi faire |
|---|---|---|
| Lecture | 5 min | Lire tous les exercices, identifier les points faciles |
| Exercice 1 (IC) | 25 min | Generalement des formules directes |
| Exercice 2 (Test) | 30 min | Le plus detaille ; approche methodique |
| Exercice 3 (Distribution) | 25 min | Necessite souvent du code R |
| Exercice 4 (Vecteurs) | 25 min | Beaucoup de theorie |
| Relecture | 10 min | Verifier les calculs, le signe des statistiques |

### Competences cles requises

1. **Calculer a partir de donnees brutes** : A partir de $\sum x_i$ et $\sum x_i^2$, retrouver $\bar{x}$, $S^2$, $S'^2$
2. **Ecrire du code R** : `mean()`, `sd()`, `qt()`, `qnorm()`, `qchisq()`, `t.test()`
3. **Identifier le bon test/IC** : Voir l'arbre de decision ci-dessous
4. **Montrer les formules avec les valeurs numeriques** : Les enseignants veulent voir la substitution des nombres, meme si vous ne pouvez pas calculer la valeur finale (valeurs de quantiles a partir des tables ou de R)

### Formules critiques a memoriser

Elles apparaissent dans **chaque examen** :

$$\bar{X} = \frac{1}{n}\sum X_i \qquad S'^2 = \frac{1}{n-1}\sum(X_i - \bar{X})^2$$

$$\text{IC pour } \mu \text{ (}\sigma\text{ inconnu)}: \bar{X} \pm t_{n-1}(1-\alpha/2)\frac{S'}{\sqrt{n}}$$

$$\text{IC pour } \sigma^2: \left[\frac{(n-1)S'^2}{\chi^2_{n-1}(1-\alpha/2)},\ \frac{(n-1)S'^2}{\chi^2_{n-1}(\alpha/2)}\right]$$

---

## Arbre de decision : Quel test/IC ?

```
Que vous demande-t-on ?
|
+-- ESTIMER un parametre (Intervalle de confiance)
|   |
|   +-- Moyenne ?
|   |   +-- sigma connu ? --> Z = (Xbar-mu)/(sigma/sqrt(n)), utiliser qnorm()
|   |   +-- sigma inconnu ? --> T = (Xbar-mu)/(S'/sqrt(n)), utiliser qt(df=n-1)
|   |
|   +-- Variance ?
|   |   +-- (n-1)S'^2/sigma^2 ~ chi^2(n-1), utiliser qchisq(df=n-1)
|   |
|   +-- Proportion ?
|       +-- Grand n ? --> Approx. normale, utiliser qnorm()
|
+-- TESTER une hypothese
    |
    +-- Une population vs valeur de reference (CONFORMITE)
    |   +-- sigma connu ? --> Z ~ N(0,1)
    |   +-- sigma inconnu ? --> T ~ t(n-1)
    |
    +-- Deux populations (HOMOGENEITE)
        +-- sigma1=sigma2 connu ? --> Z ~ N(0,1)
        +-- sigma1=sigma2 inconnu ? --> T groupe ~ t(n1+n2-2)
        +-- sigma1!=sigma2 inconnu ? --> T Welch ~ t(nu)
```

## Pieges classiques de l'examen

1. **Variance biaisee vs non biaisee** : $S^2$ (division par $n$) est biaisee. $S'^2$ (division par $n-1$) est non biaisee. R utilise $n-1$. Toujours utiliser $S'^2$ pour les IC et les tests.

2. **Les bornes de l'IC chi-deux sont inversees** : La borne inferieure de l'IC de $\sigma^2$ utilise le quantile SUPERIEUR du chi-deux.

3. **Student vs Normale** : N'utilisez $\mathcal{N}(0,1)$ que lorsque $\sigma$ est explicitement CONNU. S'il est estime a partir des donnees, utilisez la loi de Student.

4. **Notation $\mathcal{N}(\mu, \sigma)$ vs $\mathcal{N}(\mu, \sigma^2)$** : Ce cours utilise $\sigma$ (ecart-type), coherent avec R. Certains problemes donnent directement la variance -- prendre la racine carree.

5. **`sd()` de R renvoie $S'$** : Il divise par $n-1$, pas par $n$. Ne le « corrigez » pas une seconde fois.

6. **Oublier $\sqrt{n}$** : L'erreur standard est $\sigma/\sqrt{n}$, pas $\sigma$.

7. **Bilatere vs unilateral** : Par defaut c'est bilatere ($H_1: \mu \neq \mu_0$). Pour un test unilateral, ajuster le quantile et la p-valeur.

8. **Ecrire la conclusion** : Toujours enoncer « Rejeter $H_0$ » ou « Ne pas rejeter $H_0$ » avec l'interpretation dans le contexte.

## References pour les corriges d'annales

- Voir [formula-sheet.md](/S5/Probabilites/exam-prep/formula-sheet) pour la reference complete des formules
- Voir [distribution-recognition.md](/S5/Probabilites/exam-prep/distribution-recognition) pour l'identification rapide des distributions
