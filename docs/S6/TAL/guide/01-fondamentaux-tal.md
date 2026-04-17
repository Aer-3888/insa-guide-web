---
title: "Chapitre 1 -- Fondamentaux du TAL"
sidebar_position: 1
---

# Chapitre 1 -- Fondamentaux du TAL

## 1.1 Qu'est-ce que le TAL ?

Le TAL (Traitement Automatique des Langues), ou NLP (Natural Language Processing), est le domaine qui vise a faire comprendre et produire du langage humain par des machines. C'est un domaine interdisciplinaire : linguistique + informatique + IA.

### Applications

| Categorie | Exemples |
|-----------|----------|
| Analyse de texte | Recherche d'information, classification, extraction |
| Production | Traduction automatique, correction, resume, generation |
| Interaction | Chatbots, dictee vocale, questions-reponses |

## 1.2 Niveaux d'analyse linguistique

Un texte est analyse a plusieurs niveaux **imbriques** (pas sequentiels) :

```
  Phonetique      Sons de la parole
       |
  Graphique       Segmentation en tokens (tokenisation)
       |
  Lexical /       Identification des mots, categories
  Morphologique   Ex: "president" = nom ou verbe ?
       |
  Syntaxique      Structure des phrases
                  Ex: "la petite brise la glace" = 2 analyses
       |
  Semantique      Sens des mots et enonces
                  Ex: "avocat" = fruit ou homme de loi ?
       |
  Pragmatique     Fonction dans le contexte
                  Ex: "Il fait froid ici" = demande de fermer la fenetre ?
```

### Difficultes principales

1. Nombre infini de phrases correctes (impossible de tout lister)
2. Ambiguite a TOUS les niveaux (lexical, syntaxique, semantique)
3. Connaissances implicites (sens commun, culture, contexte)
4. Variations d'expression ("velo" = "bicyclette" = "petite reine")
5. Donnees non structurees

## 1.3 Tokenisation

La tokenisation est le **decoupage d'un texte en unites elementaires** (tokens).

### Cas difficiles

| Cas | Resultat attendu | Difficulte |
|-----|-------------------|------------|
| "j'ai" | "j'" + "ai" | Coupure a l'apostrophe |
| "aujourd'hui" | "aujourd'hui" | NE PAS couper |
| "S.N.C.F." | "S.N.C.F." | Points != fin de phrase |
| "31/12/2021" | "31/12/2021" | Date = un seul token |
| "New York" | "New York" | Expression multi-mots |

## 1.4 Lemmatisation vs Racinisation (Stemming)

| Aspect | Lemmatisation | Racinisation |
|--------|--------------|-------------|
| Principe | Ramene a la forme canonique | Coupe les suffixes |
| Resultat | Mot valide du dictionnaire | Radical (pas toujours un mot) |
| Exemple | "mangeaient" --> "manger" | "mangeaient" --> "mang" |
| Outils | spaCy, TreeTagger | Algorithme de Porter, Lovins |
| Precision | Haute | Moyenne |

### Vocabulaire essentiel

| Terme | Definition | Exemple |
|-------|-----------|---------|
| **Token** | Chaine graphique normalisee | "mangeaient" |
| **Mot-forme** | Signe linguistique autonome | "mangeaient" |
| **Lexeme** | Unite regroupant les formes flechies | {mange, manges, mangeons...} |
| **Lemme** | Forme canonique d'un lexeme | "manger" |
| **Radical (stem)** | Support morphologique | "mang-" |
| **Morpheme** | Plus petite unite significative | "mang-" + "-eaient" |

## 1.5 Mots vides (Stop Words)

Les mots vides sont les mots tres frequents mais non informatifs ("le", "de", "est", "et"...).

- ~30 mots = ~30% des occurrences dans un corpus
- Supprimer les 150 plus frequents reduit le stockage de ~25%
- Essentiels a retirer pour TF-IDF et Naive Bayes (sinon ils dominent les scores)

## 1.6 Normalisation du texte

Pipeline standard :
```
Texte brut
  --> Tokenisation (decoupage en tokens)
  --> Mise en minuscules
  --> Suppression mots vides
  --> Lemmatisation OU stemming
  --> Texte normalise pret pour l'analyse
```

## 1.7 Hypothese distributionnelle

> "You shall know a word by the company it keeps" -- Firth (1957)

Les mots qui apparaissent dans des contextes similaires ont des sens proches. C'est le fondement de Word2Vec, GloVe et de tous les embeddings modernes.

## 1.8 Perspective historique

```
  1950-1990           1990-2010           2010-present
  RATIONALISME        EMPIRISME           DEEP LEARNING
  - Regles            - Corpus            - Embeddings
  - Grammaires        - Statistiques      - Word2Vec (2013)
  - Symbolique        - N-grammes         - RNN/LSTM
  - ELIZA (1966)      - HMM, CRF         - Transformers
                      - Brown Corpus      - BERT, GPT
```

---

## CHEAT SHEET -- Fondamentaux TAL

```
TOKENISATION : decoupage en tokens (attention apostrophes, dates, multi-mots)

LEMME vs STEM :
  Lemme = forme canonique valide ("manger")
  Stem = radical tronque ("mang-")

NIVEAUX D'ANALYSE :
  Graphique > Lexical > Syntaxique > Semantique > Pragmatique
  (imbriques, PAS sequentiels)

AMBIGUITE :
  Lexicale : "avocat" (fruit / homme de loi)
  Syntaxique : "la petite brise la glace" (2 arbres)
  Semantique : "Il fait froid" (constat / demande)

VOCABULAIRE CLE :
  Token, Mot-forme, Lexeme, Lemme, Radical, Morpheme

HYPOTHESE DISTRIBUTIONNELLE :
  Contexte similaire = sens similaire (fondement des embeddings)

PIEGE DS : Confondre lemmatisation et stemming
  Lemmatisation --> mot valide du dictionnaire
  Stemming --> radical, PAS forcement un mot
```
