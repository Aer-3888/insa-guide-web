---
title: "Chapitre 11 -- Securite reseau"
sidebar_position: 11
---

# Chapitre 11 -- Securite reseau

> Objectif : comprendre les attaques reseau et les protocoles de protection

---

## 11.1 Packet Sniffing (ecoute passive)

### Concept

Capturer les paquets qui transitent sur le reseau pour lire les donnees en clair.

### Conditions

- Reseau partage (hub, WiFi ouvert)
- Mode promiscuous sur la carte reseau
- Position physique sur le reseau

### Outils defensifs

| Outil | Usage |
|-------|-------|
| **Wireshark** | Analyse de paquets (graphique) |
| **tcpdump** | Capture de paquets (ligne de commande) |

### Protection

- **Chiffrement en transit** : TLS/HTTPS
- **Reseaux commutes** (switch au lieu de hub)
- **WPA3** pour le WiFi

---

## 11.2 ARP Spoofing

### Concept

Le protocole ARP (Address Resolution Protocol) associe adresses IP et adresses MAC. Il n'a aucune authentification : un attaquant peut envoyer de fausses reponses ARP pour rediriger le trafic.

### Schema d'attaque

```
Victime (192.168.1.10)        Attaquant (192.168.1.50)       Passerelle (192.168.1.1)
     |                              |                              |
     |                              | ARP Reply :                  |
     |                              | "192.168.1.1 est a MAC_Eve"  |
     |<-----------------------------|                              |
     |                              |                              |
     |                              | ARP Reply :                  |
     |                              | "192.168.1.10 est a MAC_Eve" |
     |                              |------------------------------>|
     |                              |                              |
     | Tout le trafic passe         |                              |
     | par l'attaquant              |                              |
     |----------------------------->|------------------------------>|
     |<-----------------------------|<-----------------------------|
```

### Impact

L'attaquant est en position de Man-in-the-Middle : il peut lire, modifier, bloquer le trafic.

### Protection

| Protection | Description |
|-----------|------------|
| **ARP statique** | Fixer les associations IP/MAC (peu pratique) |
| **Dynamic ARP Inspection** | Le switch verifie les reponses ARP |
| **802.1X** | Authentification au niveau du port reseau |
| **Chiffrement** | TLS rend l'interception inutile (meme si le trafic passe par l'attaquant) |

---

## 11.3 DNS Poisoning

### Concept

Corrompre les enregistrements DNS pour rediriger un nom de domaine vers une adresse IP controlee par l'attaquant.

### Types

| Type | Description |
|------|------------|
| **Cache poisoning** | Injecter de fausses reponses dans le cache du resolveur DNS |
| **DNS hijacking** | Modifier les enregistrements au niveau du registrar |
| **DNS spoofing** | Repondre avant le vrai serveur DNS |

### Impact

La victime tape `www.banque.fr` mais se retrouve sur le site de l'attaquant. Si le site est visuellement identique, les identifiants sont voles (phishing).

### Protection

| Protection | Description |
|-----------|------------|
| **DNSSEC** | Signatures cryptographiques sur les enregistrements DNS |
| **DNS over HTTPS (DoH)** | Chiffre les requetes DNS |
| **DNS over TLS (DoT)** | Chiffre les requetes DNS (port 853) |
| **Verification certificat** | TLS empeche l'usurpation meme si le DNS est corrompu |

---

## 11.4 TLS/SSL

### Principe

TLS (Transport Layer Security) fournit confidentialite, integrite et authentification pour les communications reseau.

### Handshake simplifie

```
Client                                  Serveur
  |                                       |
  |  ClientHello (versions, ciphers)      |
  |-------------------------------------->|
  |                                       |
  |  ServerHello (version, cipher choisie)|
  |  Certificat du serveur                |
  |  ServerKeyExchange                    |
  |<--------------------------------------|
  |                                       |
  |  ClientKeyExchange                    |
  |  [ChangeCipherSpec]                   |
  |  Finished                             |
  |-------------------------------------->|
  |                                       |
  |  [ChangeCipherSpec]                   |
  |  Finished                             |
  |<--------------------------------------|
  |                                       |
  |  Donnees chiffrees                    |
  |<------------------------------------->|
```

### Ce que TLS protege

| Propriete | Comment |
|-----------|---------|
| **Confidentialite** | Chiffrement symetrique (AES) |
| **Integrite** | MAC (HMAC) ou AEAD (AES-GCM) |
| **Authentification** | Certificats X.509 (PKI) |

### Erreurs courantes

- **Ignorer les erreurs de certificat** : annule l'authentification
- **TLS 1.0/1.1** : versions obsoletes avec des vulnerabilites connues
- **Suites de chiffrement faibles** : RC4, DES, export ciphers
- **Mixed content** : page HTTPS qui charge des ressources en HTTP

---

## 11.5 PKI (Public Key Infrastructure)

### Principe

Un tiers de confiance (Autorite de Certification - CA) certifie l'association entre une cle publique et une identite.

```
CA (Autorite de Certification)
  |
  | signe le certificat de S
  v
Certificat de S = {pk(S), identite de S, validite, ...}sig(sk(CA))

Le client verifie :
  1. Le certificat est signe par une CA de confiance
  2. Le nom de domaine correspond
  3. Le certificat n'est pas expire
  4. Le certificat n'est pas revoque (CRL/OCSP)
```

### Problemes de la PKI

- **CA compromise** : tous les certificats emis sont suspects
- **Confiance transitive** : le navigateur fait confiance a des centaines de CA
- **Certificats auto-signes** : aucune verification d'identite

---

## 11.6 Lien avec le modele de Dolev-Yao

Dans le cours, le modele Dolev-Yao suppose le controle total du reseau :
- **Sniffing** = observation passive (sous-ensemble de Dolev-Yao)
- **ARP spoofing** = redirection du trafic (positionnement MitM)
- **DNS poisoning** = redirection au niveau applicatif
- **TLS** = contre-mesure qui rend Dolev-Yao impuissant (si correctement configure)

---

## CHEAT SHEET -- Securite reseau

```
SNIFFING :
  Ecoute passive du reseau
  Protection : TLS/HTTPS, reseaux commutes

ARP SPOOFING :
  Fausses reponses ARP --> position MitM
  Protection : Dynamic ARP Inspection, 802.1X, TLS

DNS POISONING :
  Corrompre la resolution DNS --> phishing
  Protection : DNSSEC, DoH, DoT, verification certificat

TLS :
  Confidentialite (AES) + Integrite (HMAC) + Authentification (PKI)
  Versions actuelles : TLS 1.2 minimum, TLS 1.3 recommande
  Erreurs : ignorer erreurs certificat, mixed content, TLS 1.0/1.1

PKI :
  CA signe les certificats
  Le client verifie : signature, domaine, expiration, revocation

DOLEV-YAO vs RESEAU :
  Sniffing = passif, ARP spoofing = positionnement MitM
  TLS correctement configure rend Dolev-Yao inefficace
```
