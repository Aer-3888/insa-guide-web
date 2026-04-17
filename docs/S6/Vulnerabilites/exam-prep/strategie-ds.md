---
title: "Strategie d'examen -- DS Vulnerabilites"
sidebar_position: 5
---

# Strategie d'examen -- DS Vulnerabilites

> Duree : 2h | Documents : slides, notes TP, notes personnelles

---

## 1. Gestion du temps

| Phase | Duree | Action |
|-------|-------|--------|
| Lecture | 10 min | Lire TOUT le sujet avant de commencer |
| Partie facile | 30 min | Repondre aux questions simples (identification, definitions) |
| Partie Olivier | 30 min | Injections, logs, CVSS |
| Partie Barbara | 40 min | Protocoles, MSC, proprietes de securite |
| Relecture | 10 min | Verifier les reponses, completer les justifications |

---

## 2. Points gratuits a ne pas manquer

### Identification d'attaques dans les logs

C'est souvent la question la plus simple et rapide. Methode :

```
1. Lire chaque ligne de log
2. Chercher les indices :
   - <script>, alert(  --> XSS
   - UNION, SELECT, ' OR, '--  --> SQL
   - ;, |, ||, `cmd`  --> CMD
   - URL d'action sensible  --> CSRF
   - Exploration (.bak, ../)  --> INFO
3. UN SEUL type par ligne
```

### Definitions

- CIA : Confidentialite, Integrite, Disponibilite
- CVE : identifiant unique de vulnerabilite
- CVSS : score de gravite (0-10)
- Dolev-Yao : attaquant ACTIF, crypto parfaite, controle total du reseau
- Kerckhoffs : pas de securite par l'obscurite

---

## 3. Questions d'injection (SQL ou commande)

### Methode

1. **Lire la requete vulnerable** attentivement
2. **Identifier** : champ string (apostrophes) ou numerique (pas d'apostrophe)
3. **Ecrire le payload** : montrer la requete resultante complete
4. **Proposer la correction** : requete preparee ou whitelist

### Erreurs a eviter

- Oublier l'espace apres `--`
- Confondre injection SQL et injection de commande
- Ne pas verifier le nombre de colonnes pour UNION SELECT
- Ne pas mentionner les requetes preparees comme meilleure protection

---

## 4. Questions de protocoles (Barbara)

### Methode

1. **Dessiner le MSC** avec les connaissances initiales de chaque role
2. **Lister les connaissances de l'attaquant** (Dolev-Yao)
3. **Pour chaque message** : qui peut le creer ? qui peut le lire ?
4. **Verifier la propriete** demandee (secret, weak aliveness, agreement)
5. **Si attaque trouvee** : dessiner le MSC de l'attaque avec les deux sessions

### Points cles a retenir

- `pk(i)` est PUBLIC : n'importe qui peut chiffrer pour i
- Chiffrement =/= signature : `{m}pk(i)` vs `{m}sk(i)`
- Secret pour i =/= secret pour r
- Dolev-Yao est ACTIF (pas passif)
- NSPK : manque l'identite de r dans le message 2
- NSPKL : corrige en ajoutant r

---

## 5. Questions CVSS

### Methode rapide

```
1. Identifier le vecteur d'attaque :
   - Depuis internet ? AV:N
   - Depuis le reseau local ? AV:A
   - Acces local requis ? AV:L
   - Acces physique ? AV:P

2. Complexite :
   - Conditions speciales necessaires ? AC:H
   - Sinon ? AC:L

3. Privileges :
   - Attaque sans compte ? PR:N
   - Compte utilisateur requis ? PR:L
   - Compte admin requis ? PR:H

4. Interaction :
   - La victime doit faire quelque chose ? UI:R
   - Sinon ? UI:N

5. Impact C/I/A :
   - Pour chaque propriete : H, L, ou N
```

---

## 6. Questions de securite cloud

### Points a mentionner

- Modele de service (IaaS/PaaS/SaaS) et responsabilites
- Multitenancy et canaux auxiliaires
- Images : mettre a jour immediatement
- Interface web vs API
- Chiffrement : au repos et en transit
- IAM : droits minimaux

---

## 7. Questions sur les mots de passe

### Reponses type

- **Stockage** : hash sale avec bcrypt/Argon2, JAMAIS en clair
- **Cracking** : brute force < masques < dictionnaire < dictionnaire + regles
- **72%** crackables en 10^12 essais
- **Top 1** : 123456 (37M occurrences)

---

## 8. Checklist finale

Avant de rendre la copie :

- [ ] Chaque reponse est **justifiee** (pas juste "oui" ou "non")
- [ ] Pour les logs : UN SEUL type par ligne
- [ ] Pour les SQL : verifier string vs numerique
- [ ] Pour les CVSS : mentionner AV et UI
- [ ] Pour les protocoles : MSC complet avec connaissances initiales
- [ ] Pour les proprietes de securite : preciser le **role** (i ou r)
- [ ] Pour les MitM : montrer les **deux sessions** paralleles
- [ ] Corrections proposees : requetes preparees (SQL), whitelist (CMD), identite dans les messages (protocoles)
