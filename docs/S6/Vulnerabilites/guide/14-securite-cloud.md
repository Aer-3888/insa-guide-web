---
title: "Chapitre 14 -- Securite Cloud"
sidebar_position: 14
---

# Chapitre 14 -- Securite Cloud

> Source : Cloud Security 2020-2021.pdf
> Objectif : comprendre les enjeux de securite specifiques au cloud computing

---

## 14.1 Modeles de service

```
Responsabilite du fournisseur
    |
    +-- IaaS (Infrastructure) : AWS EC2, Azure VMs
    |       Fournisseur : reseau, stockage, serveurs, virtualisation
    |       Client : OS, middleware, runtime, applications, donnees
    |
    +-- PaaS (Platform) : AWS Lambda, Google App Engine
    |       Fournisseur : + OS, middleware, runtime
    |       Client : applications, donnees
    |
    +-- SaaS (Software) : Gmail, Dropbox, Office 365
            Fournisseur : tout
            Client : utilise l'application
```

---

## 14.2 Caracteristiques et risques

| Caracteristique | Risque associe |
|----------------|---------------|
| Elastique (pay-as-you-go) | Factures surprises, instances oubliees |
| Pas cher | Difficulte a prouver disponibilite et performances |
| Facile | Carte bancaire = SPOF, interface web = risques XSS |

### La facilite comme vecteur de risque

- Des failles XSS ont ete trouvees dans les interfaces AWS et Eucalyptus
- Le navigateur est le maillon faible
- Les utilisateurs ne savent pas ou sont leurs donnees

### Probleme d'URL et de confiance

```
Modele classique : https://service.enterprise.com  (l'entreprise controle)
Modele cloud    : https://enterprise.service.com   (le fournisseur controle)
```

---

## 14.3 Multitenancy et canaux auxiliaires

### Canal de deduplication

```
Utilisateur A stocke un fichier X.
Utilisateur B (attaquant) tente de stocker le meme fichier X.
Si le cloud repond "deja present" (pas d'upload) :
  --> B sait que quelqu'un possede ce fichier !
```

Attaques possibles : brute-forcer un code PIN dans un document, verifier la presence de contenu specifique.

### Canaux CPU

| Type | Description |
|------|------------|
| **Canal covert** | Collaboration pour exfiltrer des donnees |
| **Canal side** | Observation des effets secondaires (cache, temps) |

---

## 14.4 Confiance dans les images

| Risque | Description |
|--------|------------|
| Images pre-compromises | Vulnerabilites, backdoors dans les images tierces |
| Images obsoletes | Deviennent vulnerables avec le temps |
| Premiere action | TOUJOURS mettre a jour apres le deploiement |

---

## 14.5 Bonnes pratiques

### Administration

```
+-- Eviter l'interface web (preferer l'API, ex: boto pour Python)
+-- IAM (Identity and Access Management) avec droits minimaux
+-- Groupes d'utilisateurs
+-- Reduire les droits apres le demarrage
+-- Chiffrement des buckets
+-- Images a jour
```

### Chiffrement

```
Option 1 : Chiffrer AVANT d'envoyer
  + Protection maximale
  - Annule les benefices du cloud (recherche, indexation)

Option 2 : Chiffrer DANS le cloud (S3 SSE, HSM)
  + Pratique
  - Le fournisseur a les cles

Option 3 : Chiffrement homomorphe
  + Le Graal (traiter des donnees chiffrees)
  - Encore trop lent pour un usage pratique
```

### Detection des mauvaises configurations

- Tester depuis differents profils d'acces (public, utilisateur, admin)
- Rechercher des mots-cles sensibles : `admin`, `security`, `private`, `credential`
- Verifier regulierement les configurations de partage
- Penser a la conformite RGPD

---

## 14.6 Exemple de DS (2020)

**Question** : En quoi le cloud favorise certains modeles d'attaque ?

Elements de reponse :
- **Multitenancy** : canaux auxiliaires (cache CPU, deduplication)
- **Confiance deleguee** : on fait confiance au fournisseur
- **Images partagees** : vulnerabilites dans les images publiques
- **Surface d'attaque etendue** : interfaces web, API, IAM
- **Centralisation** : une compromission affecte de nombreux clients

---

## CHEAT SHEET -- Securite Cloud

```
MODELES :
  IaaS : le client gere l'OS et au-dessus
  PaaS : le client gere les applications et donnees
  SaaS : le fournisseur gere tout

RISQUES SPECIFIQUES :
  Multitenancy : canaux auxiliaires (cache, deduplication)
  Images : toujours mettre a jour
  Interface web : risques XSS, preferer l'API
  Confiance : "easy in... easy out?"

BONNES PRATIQUES :
  IAM avec droits minimaux
  API plutot qu'interface web
  Chiffrement des buckets
  Mise a jour des images
  Audits reguliers de configuration

CHIFFREMENT :
  Avant envoi : protege mais annule les benefices
  Dans le cloud : pratique mais le fournisseur a les cles
  Homomorphe : ideal mais trop lent

PIEGE DS :
  - Le cloud n'est PAS "quelqu'un d'autre s'en occupe"
  - Responsabilite partagee selon IaaS/PaaS/SaaS
  - La deduplication est un canal d'information
```
