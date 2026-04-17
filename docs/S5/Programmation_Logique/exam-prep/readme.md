---
title: "Preparation a l'examen -- Programmation Logique (Prolog)"
sidebar_position: 0
---

# Preparation a l'examen -- Programmation Logique (Prolog)

## Format de l'examen

L'examen de Programmation Logique suit un format regulier (analyse de 12 ans d'annales 2015-2026) :

- **Duree** : ~2h
- **Documents** : generalement sans documents
- **Structure typique** : 2-3 exercices

### Types d'exercices recurrents

| Type | Frequence | Description |
|------|-----------|-------------|
| Ecriture de predicats sur une base de faits | Tres frequent | On donne une base (films, tennis, famille, ...) et on demande d'ecrire des regles |
| Predicats sur listes | Tres frequent | Trier, fusionner, filtrer, compter, permuter |
| Trace d'execution | Frequent | Suivre l'execution d'un predicat pas a pas |
| Arbre de resolution | Frequent | Dessiner l'arbre SLD complet |
| Comprehension de predicat mystere | Frequent | Deviner ce que fait un predicat donne |
| Impact du cut | Frequent | Que se passe-t-il si on ajoute/enleve un cut ? |
| Predicat recursif avec accumulateur | Moyen | Transformer un predicat naif en version avec accumulateur |
| Negation et double negation | Moyen | Division relationnelle, NOT EXISTS |
| Interpreteur en Prolog | Recent (2024) | Ecrire un interpreteur de langage a pile |

## Strategie de resolution

### 1. Ecriture de predicats (le plus frequent)

**Methode** :
1. Identifier les **faits** disponibles dans la base
2. Determiner les **arguments** du predicat demande (arite)
3. Ecrire le **cas de base** en premier
4. Ecrire le(s) **cas recursif(s)**
5. Verifier sur un ou deux exemples

**Pieges courants** :
- Oublier le `\==` pour les variables differentes (ex: frere, cousin)
- Confondre `=` et `is` pour l'arithmetique
- Recursion sans condition de terminaison
- `=<` et non `<=`

### 2. Trace d'execution

**Methode** :
1. Ecrire la requete initiale
2. Identifier la premiere clause unifiable (haut en bas)
3. Appliquer la substitution
4. Remplacer le but par le corps de la clause
5. Repeter jusqu'au succes ou echec
6. Noter les backtrackings

**Format de reponse** :
```
Call: predicat(args)
  Call: sous_predicat(args)
  Exit: sous_predicat(resultats)     % ou Fail
Exit: predicat(resultats)            % ou Fail
```

### 3. Arbre de resolution

**Methode** : voir le guide detaille dans [../guide/08-resolution-trees.md](/S5/Programmation_Logique/guide/08-resolution-trees)

Regles essentielles :
- Renommer les variables a chaque utilisation de clause
- Annoter les branches avec le numero de clause et la substitution
- Marquer SUCCES et ECHEC aux feuilles
- Pour le cut : barrer les branches coupees

### 4. Predicat mystere

**Methode** :
1. Identifier les arguments (quels sont les entrees/sorties)
2. Tracer sur un petit exemple
3. Donner le resultat de la trace
4. Formuler en une phrase ce que fait le predicat

## Themes par annee

| Annee | Exercice 1 | Exercice 2 | Exercice 3 |
|-------|-----------|-----------|-----------|
| 2026 | Disponible en PDF | - | - |
| 2025 | Disponible en PDF | - | - |
| 2024 | Base de films (real_acteur, vedettes, sans_eastwood, genre_stable) | Predicat mystere avec cut (debut de liste inverse) | Interpreteur de langage a pile (add, minus, mul, neq, if, while, variables) |
| 2023 | Listes (is_sorted, merge, zip, unzip, insert, permutation) | Base de faits COVID (fievre, covid, grippe, travaillent, contagion) | - |
| 2022 | Grille et quadtree (dimension, slice, sub_grid, constant_grid, to_quadtree) | - | - |
| 2020 | Listes (oter_n_prem, pas_dans, maxi, ajout_deb) | Base de tennis (arbitre_ok, prog_lundi, tout_perdu, tous_les_jours) | - |
| 2019 | Listes (meme_taille, liste_somme, multiples, autres) | - | - |

## Exercices corriges detailles

Voir les fichiers suivants pour les corrections completes :
- [annale-2024.md](/S5/Programmation_Logique/exam-prep/annale-2024) -- Annale 2024 (films, mystere, interpreteur)
- [annale-2023.md](/S5/Programmation_Logique/exam-prep/annale-2023) -- Annale 2023 (listes, COVID)
- [annale-recurrent-patterns.md](/S5/Programmation_Logique/exam-prep/annale-recurrent-patterns) -- Patterns recurrents toutes annales

## Priorites de revision

### Indispensable (apparait a chaque examen)

1. **Ecriture de predicats** : maitriser faits + regles + recursion
2. **Listes** : membre, append, reverse, tri, filtrage
3. **Unification** : savoir unifier deux termes quelconques
4. **Negation** : `\+` et cut-fail

### Important (apparait souvent)

5. **Trace d'execution** : suivre le modele 4 ports
6. **Cut** : green vs red, impact sur l'arbre de recherche
7. **findall** : collecter toutes les solutions
8. **Arithmetique** : `is/2`, comparaisons, accumulateurs

### Utile (apparait parfois)

9. **Arbres** : representation, parcours, ABR
10. **Peano** : addition, multiplication par unification
11. **Division relationnelle** : double negation
12. **Termes construits** : pattern matching sur structures complexes

## Erreurs a eviter le jour de l'examen

| Erreur | Consequence | Correction |
|--------|-------------|------------|
| `<=` au lieu de `=<` | Erreur de syntaxe | Retenir : `=<` (le egal est avant) |
| `X = 3 + 4` au lieu de `X is 3 + 4` | X vaut le terme +(3,4), pas 7 | Toujours `is` pour evaluer |
| Variable libre dans `is` | Erreur d'execution | Instancier avant d'evaluer |
| `_` quand on veut la meme variable | Les deux `_` sont independants | Utiliser un nom de variable |
| Recursion gauche | Boucle infinie | Cas de base AVANT le cas recursif |
| `\+` avec variable libre | Resultat inattendu | Instancier les variables AVANT `\+` |
| Oublier le `.` final | Erreur de syntaxe | Chaque clause finit par un point |
| Pas de `\==` pour exclure l'identite | Trop de solutions (ex: frere de soi-meme) | Ajouter `X \== Y` |
