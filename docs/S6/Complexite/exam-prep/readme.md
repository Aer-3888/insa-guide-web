---
title: "Exam Prep -- Complexite (S6 INSA Rennes)"
sidebar_position: 0
---

# Exam Prep -- Complexite (S6 INSA Rennes)

Guide strategique pour le DS, base sur l'analyse de 7 annees d'examens (2017-2024).

---

## 1. Structure du DS (2h)

D'apres l'analyse des annales :

| Partie | Points | Contenu | Duree conseillee | Difficulte |
|--------|--------|---------|------------------|-----------|
| Exercice 1 | ~6 pts | Recurrences | 30 min | Moyen |
| Exercice 2 | 4-6 pts | Complexite / DPR / Glouton | 20-30 min | Variable |
| Probleme | 10-14 pts | Programmation dynamique | 60-70 min | Difficile |
| Peva (2024+) | 4-6 pts | Metriques, gprof, Amdahl | 15-20 min | Facile-Moyen |

**Strategie de temps :**
- Commencer par l'exercice 1 (recurrences) si bien maitrise -- points "faciles"
- Passer rapidement aux questions Peva (depuis 2024) -- points accessibles
- Consacrer le maximum de temps au probleme de prog. dyn. (50-60% des points)

---

## 2. Analyse des annales par theme

### Recurrences (TOUS les ans)

| Annee | Contenu |
|-------|---------|
| 2017 | Eq. caract. + series gen. |
| 2018 | Eq. caract. + series gen. |
| 2019 | Eq. caract. + series gen. |
| 2020 | Eq. caract. + series gen. |
| 2021 | Eq. caract. + series gen. |
| 2023 | Eq. caract. + series gen. |
| 2024 | Eq. caract. + series gen. |

**Constante :** Toujours demande les DEUX methodes (eq. caract. ET series generatrices).
**Piege recurrent :** g(n) = c*alpha^n avec alpha racine de l'eq. caract.

### Programmation dynamique (TOUS les ans)

| Annee | Probleme |
|-------|----------|
| 2017 | Triangulation de polygone |
| 2018 | Probleme specifique |
| 2019 | Probleme specifique |
| 2020 | Raccordement d'images + sac a dos (B&B) |
| 2021 | Triangulation de polygone (variante) |
| 2023 | Impression equilibree |
| 2024 | Complexite + Peva |

**Schema recurrent :**
1. Comprendre le probleme (exemple)
2. Justifier la formule de recurrence
3. Algo recursif naif
4. Calculs redondants
5. Complexite naive (exponentielle)
6. Algo dynamique + complexite
7. Reconstituer la solution

### Glouton vs dynamique (frequent)

Le sujet demande souvent : "L'algo glouton donne-t-il l'optimum ?" puis enchaine sur la prog. dyn. => reponse : NON + contre-exemple.

### Branch & Bound (occasionnel)

Apparait dans les DS 2020 (sac a dos). Connaitre le schema :
1. Solution gloutonne initiale (nbopt)
2. epd(N) = e(N) + d(N)
3. Elaguer si epd(N) >= nbopt

### Evaluation de performance (depuis 2024)

Questions sur : metriques/facteurs/workload, lecture gprof, loi d'Amdahl.

---

## 3. Strategies par type de question

### Questions de recurrence (6 pts)

**Equation caracteristique :**
1. Ecrire l'eq. caract.
2. Trouver les racines (formule quadratique)
3. Solution homogene
4. VERIFIER si alpha est racine avant la solution particuliere
5. Conditions initiales

**Series generatrices :**
1. Definir F(x)
2. Multiplier par x^n, sommer
3. Reconnaitre F(x) et les formules connues
4. Resoudre pour F(x)
5. Decomposer (si demande)

### Questions de programmation dynamique (10-14 pts)

1. **Q1 (comprendre) :** Calculer a la main sur l'exemple fourni
2. **Q2 (formule) :** Identifier les parametres, les cas de base, la relation de recurrence
3. **Q3 (algo naif) :** Traduire la formule en code recursif
4. **Q4 (redondances) :** Dessiner l'arbre des appels, entourer les noeuds repetes
5. **Q5 (complexite naive) :** Compter les noeuds de l'arbre => O(2^n) ou O(3^n)
6. **Q6 (dynamique) :** Table + ordre de remplissage + complexite O(n^2) ou O(n^3)
7. **Q7 (reconstruction) :** Remonter dans la table en suivant les choix optimaux

### Questions Peva (4-6 pts, depuis 2024)

1. **Metriques/facteurs/workload :** Enumerer 3-5 de chaque categorie
2. **Lecture gprof :** Identifier % time, self seconds, interpreter les chiffres
3. **Loi d'Amdahl :** Appliquer la formule, comparer deux optimisations

---

## 4. Erreurs les plus penalisantes

| Erreur | Frequence | Cout |
|--------|-----------|------|
| Oublier que alpha est racine de l'eq. caract. | Tres frequente | -2 a -3 pts |
| Solution particuliere fausse | Frequente | -2 pts |
| Conditions initiales fausses | Frequente | -1 pt |
| Formule de recurrence incorrecte (prog. dyn.) | Frequente | -3 a -5 pts |
| Oublier les cas de base de la table | Moderee | -1 pt |
| Dire "glouton optimal" sans preuve | Moderee | -1 a -2 pts |
| Mauvais ordre de remplissage de la table | Occasionnelle | -2 pts |
| Confondre O et Theta | Occasionnelle | -0.5 pt |

---

## 5. Checklist la veille du DS

### Recurrences
- [ ] Je sais resoudre par equation caracteristique (5 etapes)
- [ ] Je sais quand multiplier par n^m (alpha est racine)
- [ ] Je sais mettre en equation avec les series generatrices
- [ ] Je connais les 4 formules de series generatrices

### Complexite
- [ ] Je connais les complexites des tris classiques
- [ ] Je sais appliquer le theoreme maitre (3 cas)
- [ ] Je sais calculer la complexite de boucles imbriquees

### Programmation dynamique
- [ ] Je connais la methode en 4 etapes
- [ ] Je sais ecrire un algo top-down et bottom-up
- [ ] Je sais montrer les calculs redondants
- [ ] Je connais les formules : edit distance, mult. matrices, triangulation

### Glouton et exploration
- [ ] Je sais quand le glouton est optimal et quand il ne l'est pas
- [ ] Je sais appliquer Branch & Bound avec une heuristique
- [ ] Je sais initialiser nbopt avec le glouton

### Evaluation de performance (depuis 2024)
- [ ] Je connais la loi d'Amdahl et sais l'appliquer
- [ ] Je sais lire une sortie gprof
- [ ] Je connais les definitions : metriques, facteurs, workload, HB/LB/NB

---

## 6. Formules a avoir en tete le jour J

```
EQUATION CARACTERISTIQUE :
  r^k - a1*r^{k-1} - ... - ak = 0
  Racines distinctes : C1*r1^n + C2*r2^n
  Racine double r : (C1 + C2*n)*r^n

SERIES GENERATRICES :
  1/(1-x) = sum x^n
  1/(1-ax) = sum a^n x^n
  1/(1-x)^2 = sum (n+1) x^n
  x/(1-x)^2 = sum n x^n

THEOREME MAITRE :
  T(n) = aT(n/b) + cn
  a<b: O(n) | a=b: O(n log n) | a>b: O(n^{log_b a})

SOMMES :
  1+2+...+n = n(n+1)/2
  1+2+4+...+2^k = 2^{k+1}-1
  sum a^i = (a^{k+1}-1)/(a-1)

LOI D'AMDAHL :
  Speedup = 1 / ((1-p) + p/S)

LOGARITHMES :
  log_2(10^6) ~ 20
  log_2(10^9) ~ 30
```
