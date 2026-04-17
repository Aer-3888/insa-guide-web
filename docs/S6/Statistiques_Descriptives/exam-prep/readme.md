---
title: "Preparation a l'examen -- Statistiques Descriptives (S6)"
sidebar_position: 0
---

# Preparation a l'examen -- Statistiques Descriptives (S6)

---

## Structure de l'examen

L'examen se compose typiquement de :

1. **Partie theorique (DS)** : tests d'hypothese, estimation, formules, interpretation.
2. **Partie pratique (TP note)** : code R, regression, ANOVA, interpretation de sorties.

---

## Strategie d'examen

### Avant l'examen

1. **Maitriser le flowchart "quel test utiliser"** -- c'est la cle pour ne pas perdre de points sur le choix du test.
2. **Connaitre les formules des IC** et savoir les appliquer numeriquement.
3. **Savoir interpreter un `summary(lm())`** -- chaque ligne, chaque colonne.
4. **Pratiquer le calcul matriciel** $\hat{\beta} = (X^TX)^{-1}X^TY$ a la main.
5. **Reviser les 4 diagnostics** de la regression (plot(modele)).

### Pendant l'examen

1. **Lire tout le sujet** avant de commencer.
2. **Poser les hypotheses** $H_0$ et $H_1$ explicitement.
3. **Ecrire la statistique de test** et sa loi sous $H_0$.
4. **Conclure en francais** : "Au risque de 5%, on rejette/ne rejette pas $H_0$. On conclut que..."
5. **Verifier les conditions** avant d'appliquer un test (normalite, homoscedasticite).

### Erreurs frequentes a eviter

- Oublier de convertir en facteur avant une ANOVA.
- Oublier la colonne de 1 dans la matrice X.
- Confondre IC (moyenne) et IP (individu).
- Confondre t-test apparie et independant.
- Dire "on accepte $H_0$" au lieu de "on ne rejette pas $H_0$".
- Interpreter les effets principaux quand l'interaction est significative.

---

## Fiches de revision

| Document | Contenu |
|----------|---------|
| [Arbre de decision des tests](/S6/Statistiques_Descriptives/exam-prep/decision-tree) | Le flowchart complet "quel test utiliser ?" |
| [Formulaire](/S6/Statistiques_Descriptives/exam-prep/formula-sheet) | Toutes les formules du cours organisees par theme |

---

## Sujets d'annales

| Annee | Fichier | Themes |
|-------|---------|--------|
| 2024-2025 | `data/annales/DS_Stat_2024-2025.pdf` | Regression, tests, ANOVA |
| 2023-2024 (TP) | `data/moodle/cours/TP_2024/` | Tabac, masse grasse, textile |
| 2017-2023 | `data/moodle/cours/` (sous-dossiers par annee) | Sujets + corrections |
