---
title: "Chapitre 6 -- Reconnaissance d'Entites Nommees (NER) et Extraction d'Information"
sidebar_position: 6
---

# Chapitre 6 -- Reconnaissance d'Entites Nommees (NER) et Extraction d'Information

## 6.1 NER : Definition

La reconnaissance d'entites nommees (Named Entity Recognition) consiste a identifier et classifier les entites dans un texte.

```
"Emmanuel Macron a visite la Tour Eiffel a Paris le 14 juillet"
 [B-PER    I-PER] O O      [B-LOC  I-LOC] O [B-LOC] O [B-TIME I-TIME]
```

### Types d'entites standard

| Type | Exemples |
|------|----------|
| PER (personne) | Emmanuel Macron, Jean-Paul Sartre |
| LOC (lieu) | Paris, Tour Eiffel, France |
| ORG (organisation) | INSA, ONU, Google |
| MISC / TIME | 14 juillet, 100 euros |

## 6.2 Le systeme BIO (Begin-Inside-Outside)

```
B = Beginning   (debut d'une entite)
I = Inside      (interieur d'une entite)
O = Outside     (hors entite)
```

Si n types d'entites --> **2n + 1** etiquettes possibles.

### Exemples d'annotation BIO

**Exemple 1** :
```
"Le president Emmanuel Macron a visite Paris"
 O  O         B-PER    I-PER  O O       B-LOC
```

**Exemple 2** :
```
"A   Marseille  Jean-Claude  Gaudin  est  elu   depuis  1995"
 O   B-LOC      B-PER        I-PER   O    O     O       B-TIME
```

### Pourquoi B et I ?

Sans la distinction B/I, on ne pourrait pas distinguer deux entites consecutives :
```
"Barack Obama Bill Clinton"
 B-PER I-PER  B-PER I-PER    (2 entites distinctes)
```
Si on avait juste PER/O :
```
 PER   PER   PER   PER       (impossible de separer les deux noms)
```

## 6.3 NER comme etiquetage de sequence

Le NER est un cas particulier d'etiquetage de sequences. On utilise les memes modeles :

| Modele | Application au NER |
|--------|--------------------|
| HMM | Performances moyennes, simple |
| CRF | Bonnes performances, features manuelles (majuscule, suffixe...) |
| BiLSTM-CRF | Etat de l'art, features apprises automatiquement |

### Features utiles pour le NER

| Feature | Exemple | Utilite |
|---------|---------|---------|
| Majuscule initiale | "Paris" vs "paris" | Indice d'entite nommee |
| Tout en majuscules | "ONU", "OTAN" | Sigle/organisation |
| Contient des chiffres | "14 juillet" | Date/nombre |
| Mot precedent/suivant | "president Macron" | Contexte |
| Prefixe/suffixe | "-tion", "anti-" | Morphologie |
| Gazetteers | Listes de noms de villes, personnes | Connaissances externes |

## 6.4 Extraction d'information

### Relation Extraction

Identifier les relations entre entites :
```
"Emmanuel Macron est president de la France"
--> relation(president_de, Emmanuel_Macron, France)
```

### Coreference Resolution

Identifier quand deux expressions referent a la meme entite :
```
"Le chat a mange la souris. Il dormait ensuite."
--> "Il" = "Le chat" (coreference)
```

### Slot Filling

Remplir des champs predetermines a partir de texte :
```
"un resto italien a Rennes" --> {type: "resto", cuisine: "italien", lieu: "Rennes"}
```

## 6.5 Evaluation du NER

Les metriques standard sont calculees par type d'entite :

| Metrique | Formule |
|----------|---------|
| Precision | entites correctement predites / entites predites |
| Rappel | entites correctement predites / entites de reference |
| F1 | 2 * P * R / (P + R) |

Une entite est "correcte" si ses frontieres ET son type correspondent exactement.

---

## CHEAT SHEET -- NER et Extraction

```
SYSTEME BIO :
  B = debut d'entite
  I = interieur d'entite
  O = hors entite
  n types --> 2n + 1 etiquettes

TYPES D'ENTITES :
  PER (personne), LOC (lieu), ORG (organisation), MISC/TIME

NER = etiquetage de sequence :
  HMM < CRF < BiLSTM-CRF (etat de l'art)

FEATURES UTILES :
  Majuscule, chiffres, contexte, gazetteers, morphologie

EXTRACTION :
  Relations : lier entites par des predicats
  Coreference : "il" = "le chat"
  Slot filling : remplir des champs structures

EVALUATION :
  Precision, Rappel, F1 par type d'entite
  "Correct" = frontieres + type exacts

PIEGE :
  BIO est necessaire pour distinguer entites consecutives
  "Barack Obama Bill Clinton" = 2 entites, pas 1
```
