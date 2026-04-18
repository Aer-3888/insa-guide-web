---
title: "Preparation aux examens -- Propositions et Predicats"
sidebar_position: 0
---

# Preparation aux examens -- Propositions et Predicats

## Format de l'examen

- **Duree :** 1h30 a 2h
- **Documents :** Sans documents (formules et regles parfois fournies)
- **Structure typique :** 4 a 5 exercices

---

## Structure typique du DS (analyse de 12 annales, 2013-2025)

### Exercice 1 : Valuation (2 points)
Toujours present. On donne une formule propositionnelle F et on demande :
- Trouver v telle que v(F) = 1 (satisfiable)
- Trouver v telle que v(F) = 0 (falsifiable)

**Strategie :** Identifier les sous-formules les plus simples a satisfaire/falsifier. Commencer par les variables qui apparaissent le moins. Rendre F → V en rendant l'antecedent faux, ou rendre un ∧ faux en rendant un seul conjoint faux.

### Exercice 2 : Resolution (7-8 points)
Toujours present, souvent le plus gros exercice.
- Prouver qu'une formule est une tautologie par resolution
- Prouver une consequence logique par resolution
- Souvent au premier ordre (avec predicats, skolemisation, unification)

**Themes recurrents :**
- Formule avec quantificateurs a nier et skolemiser
- Problemes du type "tous les A sont B, certains C sont D, prouver que..."
- Parite, proprietes recursives (P(0), P(x) → P(s(s(x))))

### Exercice 3 : Enigme (2-4 points)
Tres frequent (present dans la majorite des annales).
- Enigme logique a resoudre de maniere informelle puis formelle
- Menteurs/veridiques (qui dit la verite, qui ment ?)
- Robots auto-reproducteurs (annales recentes)
- Liens internet avec descriptions (une seule vraie)

**Strategie :** Raisonnement par hypothese. Tester chaque cas. Utiliser la table de verite si demande.

### Exercice 4 : Modelisation SAT (4-6 points)
Tres frequent dans les annales recentes (2019-2025).
- Modeliser un probleme sous forme de clauses pour un solveur SAT
- Themes : coloriage de graphe, Mastermind, addition binaire, sudoku
- Definir les variables propositionnelles
- Ecrire les contraintes sous forme de clauses

**Strategie :** Bien choisir les variables (une variable par "choix" possible). Ecrire les contraintes "au moins un" (clause ∨) et "au plus un" (clauses ¬xi ∨ ¬xj).

### Exercice 5 : Programmation OCaml (3-4 points)
Present dans la majorite des annales recentes.
- Implementer des fonctions liees a la logique en OCaml
- Verifier si une preuve est correcte (is_axiom, modus_ponens, check)
- Saturation par modus ponens
- Tester si une formule est contenue dans une autre

---

## Repartition des points (estimation)

| Theme | Points moyens | Frequence |
|-------|--------------|-----------|
| Valuation | 2 pts | 100% |
| Resolution (propositionnelle) | 3-4 pts | 90% |
| Resolution (premier ordre) | 4-5 pts | 90% |
| Enigme logique | 2-4 pts | 80% |
| Modelisation SAT | 4-6 pts | 70% |
| Programmation OCaml | 3-4 pts | 70% |
| Table de verite | 2-3 pts | 50% |
| Forme prenexe/skolemisation | 2-3 pts | 40% |
| Deduction naturelle | 4-6 pts | 30% |

---

## Contenu des fiches de revision

| Fichier | Contenu |
|---------|---------|
| [analyse_annales.md](/S6/Propositions_Predicats/exam-prep/analyse-annales) | Analyse detaillee des sujets 2013-2025 avec exercices types resolus |
| [exercices_types_resolus.md](/S6/Propositions_Predicats/exam-prep/exercices-types-resolus) | Exercices types avec solutions completes |

---

## Liste de verification pour la revision

### Calcul propositionnel
- [ ] Tables de verite : savoir les construire rapidement
- [ ] Connaitre toutes les equivalences (De Morgan, distributivite, absorption...)
- [ ] Maitriser l'implication (seul cas faux : V → F)
- [ ] Priorite des connecteurs

### Formes normales
- [ ] 4 etapes dans l'ordre (↔, →, ¬, distribution)
- [ ] FNC = ET de OU, FND = OU de ET
- [ ] Methode par table de verite (lignes V pour FND, lignes F pour FNC)

### Resolution
- [ ] TOUJOURS nier la formule avant de resoudre
- [ ] Un seul litteral par resolution
- [ ] Ignorer tautologies, eliminer doublons
- [ ] Strategie : clauses unitaires d'abord

### Calcul des predicats
- [ ] Traduction francais → logique (∀ avec →, ∃ avec ∧)
- [ ] Negation des quantificateurs
- [ ] Ordre des quantificateurs (∀∃ ≠ ∃∀)
- [ ] Forme prenexe : renommer avant de sortir les quantificateurs

### Skolemisation
- [ ] ∃ sans ∀ avant : constante de Skolem
- [ ] ∃ precede de ∀y1,...,∀yn : fonction de Skolem f(y1,...,yn)

### Unification
- [ ] Test d'occurrence
- [ ] Appliquer σ entre chaque etape
- [ ] MGU = minimum de specialisation

### Deduction naturelle
- [ ] Connaitre toutes les regles par coeur
- [ ] Toujours decharger les hypotheses temporaires
- [ ] Variables fraiches pour ∀-I et ∃-E
- [ ] Justifier chaque ligne

### Modelisation SAT
- [ ] Choisir les bonnes variables propositionnelles
- [ ] Contrainte "exactement un" = "au moins un" + "au plus un"
- [ ] Ecrire les clauses en FNC

---

## Conseils de gestion du temps

| Phase | Temps | Actions |
|-------|-------|---------|
| Lecture | 5 min | Lire tout le sujet, identifier les exercices faciles |
| Valuation | 5-10 min | Exercice mecanique, ne pas y passer trop de temps |
| Resolution | 20-25 min | Le plus gros exercice, bien detailler les etapes |
| Enigme | 10-15 min | Raisonnement informel d'abord, formaliser si demande |
| Modelisation | 15-20 min | Variables d'abord, puis contraintes |
| Programmation | 10-15 min | Si OCaml est maitrise, sinon a faire en dernier |
| Relecture | 5 min | Verifier les pieges classiques |

Si un exercice bloque, passer au suivant et revenir a la fin.
