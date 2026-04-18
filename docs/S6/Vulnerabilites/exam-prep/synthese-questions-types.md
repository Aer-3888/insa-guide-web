---
title: "Synthese des questions types -- DS Vulnerabilites"
sidebar_position: 6
---

# Synthese des questions types -- DS Vulnerabilites

> Analyse transversale des annales 2017-2018, 2020-2021, et 2025

---

## Questions qui reviennent a CHAQUE examen

### 1. Classification d'attaques dans des logs (100% de presence)

**Format** : 6 a 10 lignes de logs web, classifier chaque ligne.

**Methode rapide** :

```
<script>, alert(, <img onerror       --> XSS
UNION, SELECT, OR 1=1, '--           --> SQL injection
;, |, ||, &&, `cmd`, $(cmd)          --> CMD injection
URL action sensible sans token       --> CSRF
.bak, ../, exploration               --> INFO
```

**Piege frequent** : les casses mixtes (`<SCRipt>`), les encodages URL (`lo%67o` = `logo`).

---

### 2. Injection SQL : bypass de login (100% de presence)

**Format** : on donne une requete PHP/SQL, on demande un payload.

**Reponses standard** :
- Contournement (login connu) : `admin'--`
- Contournement (login inconnu) : `' OR 1=1--`
- Sans commentaire : `' OR 'a'='a`

**Question complementaire frequente** : "Que peut-on dire du stockage des mots de passe ?" --> En clair si la comparaison est directe dans SQL.

---

### 3. Analyse de protocole (MSC) (100% de presence)

**Format** : protocole donne en notation MSC, verifier des proprietes.

**Reponses types** :
- Secret pour l'emetteur avec pk(r) : VALIDE (seul r dechiffre)
- Secret pour le receveur avec pk(r) : INVALIDE (n'importe qui peut chiffrer)
- Secret avec cle symetrique : VALIDE pour les deux

---

### 4. CVSS (presence dans 2 annales sur 3)

**Metriques a connaitre par coeur** :

| Metrique | Plus grave |
|----------|-----------|
| AV | N(etwork) |
| AC | L(ow) |
| PR | N(one) |
| UI | N(one) |
| Impact | H(igh) |

---

### 5. Mots de passe (presence dans 2 annales sur 3)

**Points toujours valides** :
- Stockage : hash sale (bcrypt/Argon2)
- Kerckhoffs : si la methode est connue, est-ce encore sur ?
- Espace de recherche : combien de valeurs possibles ?
- Top 1 : `123456` (37M occurrences)

---

## Questions qui reviennent regulierement

### 6. Distinguer SQL et CMD (2020, potentiel 2025+)

L'erreur de bash (`-bash: OR: command not found`) vs l'erreur SQL (`syntax error near...`). Savoir lire le message d'erreur.

### 7. Securite cloud (2020)

Points a avoir prepares :
- IaaS/PaaS/SaaS
- Multitenancy, deduplication
- Images, mise a jour
- IAM

### 8. Correction de protocole (2017, 2020)

Savoir ajouter l'information manquante (typiquement l'identite d'un role) dans un message.

### 9. Attaque MitM / Lowe (2017, potentiel)

Dessiner les deux sessions paralleles. Savoir que NSPKL corrige en ajoutant `r` dans le message 2.

---

## Matrice de preparation

| Sujet | Annale 2017 | Annale 2020 | Annale 2025 | Priorite |
|-------|:-----------:|:-----------:|:-----------:|:--------:|
| Classification logs | X | X | X | CRITIQUE |
| Injection SQL | X | X | X | CRITIQUE |
| Protocoles MSC | X | X | X | CRITIQUE |
| CVSS | X | | X | HAUTE |
| Mots de passe | | X | X | HAUTE |
| Distinguer SQL/CMD | | X | | MOYENNE |
| Cloud | | X | | MOYENNE |
| MitM / Lowe | X | | | MOYENNE |

---

## Reponses "reflexes" pour gagner du temps

### Si on vous demande une protection contre...

| Attaque | Reponse reflexe |
|---------|----------------|
| SQL injection | Requetes preparees (`bind_param`) |
| XSS | `htmlspecialchars($val, ENT_QUOTES)` + CSP |
| CSRF | `SameSite=Strict` + token anti-CSRF |
| CMD injection | Eviter les appels OS + whitelist regex |
| MitM (protocole) | Ajouter l'identite dans les messages |
| Mots de passe | Hash sale (bcrypt/Argon2) |
| Cloud | IAM minimale + API + images a jour |

### Si on vous demande ce qui est "faux" dans un raisonnement...

| Affirmation fausse | Raison |
|-------------------|--------|
| "Le chiffrement suffit" | Protocole NSPK (crypto parfaite, faille logique) |
| "Nos experts ont verifie" | NSPK utilise 17 ans avant l'attaque |
| "Doubler les apostrophes suffit" | Pas complet (encodage, numeriques) |
| "Le cloud est securise par defaut" | Responsabilite partagee |
| "Base64 = chiffrement" | C'est de l'encodage, pas du chiffrement |

---

## Dernier conseil

Le DS est de 2h avec documents autorises. Le facteur limitant n'est pas la connaissance mais le **temps** et la **clarte des reponses**. Avoir un cheat sheet bien organise permet de gagner de precieuses minutes. Privilegier les reponses courtes et justifiees plutot que longues et vagues.
