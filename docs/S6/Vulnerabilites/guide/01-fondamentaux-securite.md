---
title: "Chapitre 1 -- Fondamentaux de securite informatique"
sidebar_position: 1
---

# Chapitre 1 -- Fondamentaux de securite informatique

> Sources : 2026-Vulnerabilities.pdf, intro.pdf, C1-annotated.pdf
> Objectif : maitriser les concepts fondamentaux avant d'aborder les vulnerabilites specifiques

---

## 1.1 Principes fondamentaux

### Adages du cours

- **"Lorsque vous etes connecte a Internet... Internet est connecte a vous"** -- toute machine connectee est exposee
- **"We're Not a Target"** -- faux. Les vers et attaques automatisees balayent tout, sans cibler
- **"Security is a process, not a product"** -- la securite est une demarche continue, pas un logiciel
- **"Trust, but verify"** -- ne jamais faire confiance aveuglment

### Definitions de base

| Terme | Definition |
|-------|-----------|
| **Vulnerabilite** | Point faible d'un systeme (logiciel, materiel, organisation, reseau) |
| **Attaque** | Exploitation d'une vulnerabilite pour obtenir des donnees, privileges, etc. |
| **Surface d'attaque** | Ensemble de toutes les vulnerabilites exploitables d'un systeme |
| **Contre-mesure** | Mecanisme de defense pour prevenir ou attenuer une attaque |

---

## 1.2 La triade CIA

```
            +-------------------+
            | CONFIDENTIALITE   |
            | (ne pas divulguer)|
            +--------+----------+
                     |
        +------------+------------+
        |                         |
+-------v--------+      +--------v-------+
| INTEGRITE      |      | DISPONIBILITE  |
| (ne pas alterer)|      | (rester access.)|
+----------------+      +----------------+
```

| Propriete | But | Domaine d'origine | Exemple de violation |
|-----------|-----|-------------------|---------------------|
| **Confidentialite** | Empecher l'acces non autorise | Militaire | Vol de base de donnees, lecture d'emails |
| **Integrite** | Garantir la non-modification | Bancaire | Modification d'un montant de virement |
| **Disponibilite** | Garantir l'accessibilite | Telecoms | DDoS rendant un site inaccessible |

### Au-dela de CIA

| Propriete | Description |
|-----------|------------|
| **Secret (Secrecy)** | Garder une information secrete |
| **Authentification** | S'assurer de l'identite d'un interlocuteur |
| **Anonymat** | Ne pas reveler qui a effectue une action |
| **Non-repudiation** | Ne pas pouvoir nier avoir effectue une action |
| **Non-chainabilite** | Un adversaire ne peut pas lier deux evenements |

---

## 1.3 Qu'est-ce qu'une vulnerabilite ?

```
Vulnerabilite
    |
    +-- Bug logiciel ou materiel (avec consequences nefastes)
    +-- Defaut de conception (protocoles, elevation de privileges)
    +-- Defaut de configuration (mot de passe par defaut, service inutile)
    +-- Serie de negligences
    +-- Mauvais apprentissage
```

### Exemples concrets

| Vulnerabilite | CVE | Description | Impact |
|--------------|-----|-------------|--------|
| Heartbleed | CVE-2014-0160 | Fuite memoire OpenSSL | Vol de cles privees, mots de passe |
| ShellShock | CVE-2014-6271 | Injection via variables d'env Bash | Execution de code a distance |
| PwnKit | CVE-2021-4034 | Elevation de privileges polkit | Utilisateur standard devient root |
| Supermicro IPMI | -- | Mot de passe en clair sur port 49152 | Acces admin complet |

---

## 1.4 CVE et CVSS

### CVE (Common Vulnerabilities and Exposures)

- Base de donnees geree par MITRE : [https://cve.mitre.org/](https://cve.mitre.org/)
- Format : `CVE-ANNEE-NUMERO` (ex: CVE-2014-6271)
- Objectif : nommer et recenser les vulnerabilites de maniere unique

### CVSS (Common Vulnerability Scoring System)

**Echelle de gravite :**

| Score | Niveau |
|-------|--------|
| 0 -- 3.9 | LOW |
| 4.0 -- 6.9 | MEDIUM |
| 7.0 -- 8.9 | HIGH |
| 9.0 -- 10.0 | CRITICAL |

**Metriques CVSS v3.1 :**

```
CVSS v3.1
    |
    +-- AV (Attack Vector) : N(etwork) > A(djacent) > L(ocal) > P(hysical)
    +-- AC (Attack Complexity) : L(ow) > H(igh)
    +-- PR (Privileges Required) : N(one) > L(ow) > H(igh)
    +-- UI (User Interaction) : N(one) > R(equired)
    +-- S (Scope) : C(hanged) > U(nchanged)
    +-- Impact C/I/A : H(igh) > L(ow) > N(one)
```

**Lecture d'un vecteur CVSS :**
```
Heartbleed : AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N = 7.5 (HIGH)
  Reseau, complexite basse, aucun privilege, aucune interaction,
  impact confidentialite haute, pas d'impact integrite ni disponibilite
```

### CVSS v4 (depuis 2023)

Ajoute des metriques supplementaires : AT (Attack Requirements), VC/VI/VA (impacts composant vulnerable), SC/SI/SA (impacts composants subsequents). Les scores evoluent d'une version a l'autre.

---

## 1.5 Divulgation des vulnerabilites

```
Decouverte d'une vulnerabilite
            |
    +-------+--------+------------+
    |                |             |
Full Disclosure  Non-Disclosure  Responsible Disclosure
(publication     (patch           (cooperation inventeur/editeur,
 directe)        silencieux)      delai ~3 mois, role des CERTs)
```

**Tendance recente : Bug Bounty** -- les entreprises recompensent les chercheurs qui signalent des vulnerabilites (Google, Meta, Microsoft).

---

## 1.6 Modeles d'attaquant

| Type | Capacites |
|------|-----------|
| **Passif** | Observe le systeme, ecoute les communications, ne peut pas interagir |
| **Actif** | Observe ET interagit : envoyer, bloquer, modifier des messages |

### Modele de Dolev-Yao

```
Hypotheses :
- Cryptographie parfaite (on ne casse pas le chiffrement sans la cle)
- Messages = termes abstraits
- Le reseau est ENTIEREMENT controle par l'adversaire

Capacites :
- Intercepter tout message sur le reseau
- Bloquer des messages
- Inserer des messages forges
- Modifier des messages en transit
```

**Question piege DS** : Dolev-Yao est-il passif ou actif ? Reponse : **actif** (il peut modifier et inserer des messages).

---

## 1.7 Principes de securite

| Principe | Description |
|----------|------------|
| **Kerckhoffs** | Pas de securite par l'obscurite -- la securite repose sur le secret de la cle, pas de l'algorithme |
| **Moindre privilege** | Donner uniquement les droits necessaires |
| **Defense en profondeur** | Plusieurs couches de protection |
| **Minimiser la confiance** | Reduire la base de confiance (trusted base) |
| **Verifier les parametres** | En entree ET en sortie, au moment de l'usage |
| **Configs par defaut** | Changer les mots de passe par defaut a l'installation ET apres mises a jour |

---

## 1.8 Notations cryptographiques du cours

| Notation | Signification |
|----------|--------------|
| `pk(i)` | Cle publique de i |
| `sk(i)` | Cle privee de i |
| `{m}pk(i)` | Chiffrement de m avec la cle publique de i |
| `{m}sk(i)` | Signature de m avec la cle privee de i |
| `k(i,r)` ou `k` | Cle symetrique partagee entre i et r |
| `{m}k` | Chiffrement symetrique de m avec k |
| `nonce n` | Nombre utilise une seule fois (aleatoire) |
| `h(m)` | Hachage de m |

---

## CHEAT SHEET -- Fondamentaux

```
CIA = Confidentialite + Integrite + Disponibilite
CVE = identifiant unique (CVE-YYYY-NNNNN)
CVSS = score 0-10 (LOW/MEDIUM/HIGH/CRITICAL)
Dolev-Yao = attaquant ACTIF, controle le reseau, crypto parfaite
Kerckhoffs = pas de securite par l'obscurite
AV:N = plus grave que AV:P
AC:L = plus grave que AC:H
PR:N = plus grave que PR:H

Pieges DS :
- Confondre integrite et confidentialite
- Oublier la disponibilite (3e composante CIA)
- Penser que la crypto suffit (NSPK prouve le contraire)
- Confondre CVE (identifiant) et CVSS (score)
```
