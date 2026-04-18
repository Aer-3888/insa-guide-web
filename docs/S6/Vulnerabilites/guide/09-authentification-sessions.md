---
title: "Chapitre 9 -- Authentification et sessions"
sidebar_position: 9
---

# Chapitre 9 -- Authentification et sessions

> Sources : secrecy_auth-annotated.pdf, password_cracking.pdf
> Objectif : comprendre les proprietes d'authentification et les enjeux du cracking de mots de passe

---

## 9.1 Hierarchie des proprietes d'authentification

Du plus faible au plus fort :

```
Non-injective synchronization (la plus forte)
          |
Non-injective agreement
          |
Weak aliveness in the correct role
          |
Weak aliveness (la plus faible)
```

---

## 9.2 Weak Aliveness

> "Mon interlocuteur B est bien vivant et a participe au protocole."

### Attaque par miroir

```
Bob                    Eve (se fait passer pour Alice)
 |                          |
 |       "Hello"            |
 |------------------------->|
 |       "Hello"            |  Eve renvoie simplement le message
 |<-------------------------|
 |                          |
[weak-alive Alice ?]
INVALIDE : Alice n'a jamais participe !
```

### Correction : signatures

```
  sk(i), pk(r)               sk(r), pk(i)
       i                          r
       |    {"Hello"}sk(i)        |
       |------------------------->|
       |    {"Hello"}sk(r)        |
       |<-------------------------|
       |                          |
     [weak-alive r : VALIDE]
```
Seul `r` possede `sk(r)`, donc seul `r` peut produire la signature.

---

## 9.3 Weak Aliveness in the Correct Role

Meme avec des signatures, un agent peut etre "vivant" mais dans le mauvais role. Il faut inclure des informations sur le role dans les messages signes.

---

## 9.4 Non-injective Agreement

Les agents s'accordent sur les partenaires de communication ET les messages correspondent a ceux specifies par le protocole. Plus fort que weak aliveness : on verifie aussi le contenu.

---

## 9.5 Non-injective Synchronization

En plus de l'accord, l'ordre du protocole est respecte. C'est la propriete la plus forte.

---

## 9.6 Attaques classiques sur l'authentification

| Attaque | Description | Contre-mesure |
|---------|------------|---------------|
| **Miroir** | Renvoyer un message a son emetteur | Signatures |
| **Rejeu** | Rejouer un ancien message | Nonces frais |
| **MitM** | Relayer entre deux sessions | Identite dans les messages |
| **Brute force** | Essayer toutes les combinaisons | Limitation de debit, verrouillage |
| **Dictionnaire** | Essayer des mots connus | Mots de passe forts, MFA |

---

## 9.7 Stockage des mots de passe

### Ce qu'il ne faut JAMAIS faire

```
CATASTROPHIQUE : stocker en clair
  password = "hunter2"

MAUVAIS : stocker un hash simple
  password = sha256("hunter2")
  --> vulnerable aux rainbow tables

INSUFFISANT : hash avec sel statique
  password = sha256("fixedsalt" + "hunter2")
  --> si le sel fuite, toute la base est vulnerable
```

### Ce qu'il faut faire

```
CORRECT : hash sale avec algorithme adapte
  salt = random_bytes(32)  // sel unique par utilisateur
  password = bcrypt("hunter2", salt, cost=12)

Verification :
  entree_utilisateur --> bcrypt(entree, salt_stocke, cost)
  Comparer avec le hash stocke
```

### Algorithmes recommandes

| Algorithme | Avantage |
|-----------|----------|
| **bcrypt** | Resisteur au GPU, cout ajustable |
| **scrypt** | Memoire-intensive (resiste au GPU/ASIC) |
| **Argon2** | Gagnant du PHC (Password Hashing Competition), le plus moderne |

---

## 9.8 Cassage de mots de passe

### Types d'attaques

| Attaque | Description | Efficacite |
|---------|-------------|-----------|
| **Brute force** | Toutes les combinaisons | Lent mais complet |
| **Masques** | Structure donnee (ex: 5 lettres + 3 chiffres) | Plus rapide |
| **Dictionnaire** | Liste de mots connus | Rapide sur mdp faibles |
| **Dictionnaire + regles** | Transformations sur le dictionnaire | Tres efficace |

### Regles de transformation (hashcat, John the Ripper)

- Premiere lettre en majuscule
- Ajouter des chiffres a la fin
- Remplacement : `s->$`, `a->@`, `e->3`
- Inverser le mot, combiner des mots

### Statistiques du cours

```
Top 3 mondial :
  1. 123456      (37 359 195 occurrences)
  2. 123456789   (16 629 796)
  3. qwerty      (10 556 095)

Avec un entrainement adequat :
  72.67% des mots de passe crackables en 10^12 essais
```

### Outils

| Outil | Description |
|-------|-------------|
| **hashcat** | Cracking GPU, nombreux formats |
| **John the Ripper** | Cracking CPU/GPU, detection auto |
| **haveibeenpwned.com** | Verification de mot de passe compromis |

---

## 9.9 Detournement de session

### Mecanismes

1. **Vol de cookie de session** (via XSS) : `document.cookie`
2. **Fixation de session** : l'attaquant impose un identifiant de session connu
3. **Prediction de session** : identifiants de session previsibles (sequentiels)

### Protection

```
Set-Cookie: session=<random>; HttpOnly; Secure; SameSite=Strict; Path=/
```

| Flag | Effet |
|------|-------|
| `HttpOnly` | Inaccessible depuis JavaScript |
| `Secure` | Envoye uniquement en HTTPS |
| `SameSite=Strict` | Pas envoye sur les requetes cross-site |

---

## 9.10 MFA (Multi-Factor Authentication)

### Les trois facteurs

| Facteur | Exemples |
|---------|----------|
| **Ce que je sais** | Mot de passe, PIN |
| **Ce que j'ai** | Telephone, cle USB (FIDO2) |
| **Ce que je suis** | Empreinte, reconnaissance faciale |

MFA combine au moins deux facteurs differents.

---

## 9.11 Exemple de DS : systeme de Barbara (Sujet 2025)

Mot de passe genere par : `5^dn(E) mod 11` (dn = date de naissance)

1. **Memes mots de passe possibles ?** Oui -- `5^x mod 11` ne prend que 10 valeurs, il y a plus de 10 etudiants
2. **Confidentialite ?** Nulle -- date de naissance souvent publique, seulement 10 valeurs possibles
3. **Protection des donnees ?** L'espace des dates est petit (~40000), enumeration triviale

---

## CHEAT SHEET -- Authentification et sessions

```
HIERARCHIE AUTH (du faible au fort) :
  Weak aliveness < Correct role < Agreement < Synchronization

ATTAQUES :
  Miroir : renvoyer un message (defense : signatures)
  Rejeu : rejouer un ancien msg (defense : nonces frais)
  Brute force : essayer tout (defense : rate limiting, MFA)

MOTS DE PASSE :
  Stockage : hash sale (bcrypt/scrypt/Argon2), JAMAIS en clair
  Cracking : 72% crackables en 10^12 essais
  Top 1 : "123456" (37M occurrences)

SESSIONS :
  Cookie : HttpOnly + Secure + SameSite=Strict
  Vol : via XSS (document.cookie)
  Protection : CSP + HttpOnly

MFA :
  Sais + Ai + Suis (au moins 2 facteurs)

PIEGE DS :
  - Confondre aliveness et agreement
  - Oublier l'attaque par miroir
  - Oublier le sel dans le hachage
```
