---
title: "08 -- Securite reseau"
sidebar_position: 8
---

# 08 -- Securite reseau

## Vue d'ensemble

La securite reseau protege les communications contre les menaces : ecoute, usurpation, modification, deni de service. Ce chapitre couvre les mecanismes de protection les plus courants.

---

## Firewalls (pare-feu)

### Role

Un firewall filtre le trafic reseau en fonction de regles. Il se place entre le reseau interne et Internet.

### Types de firewalls

| Type | Couche | Description |
|------|--------|-------------|
| Filtrage de paquets (stateless) | 3-4 | Filtre par IP src/dest, port, protocole. Chaque paquet est evalue independamment. |
| Filtrage a etats (stateful) | 3-4 | Suit les connexions. Accepte les paquets de retour si la connexion est initiee de l'interieur. |
| Proxy applicatif | 7 | Inspecte le contenu applicatif (HTTP, DNS). Plus lent mais plus precis. |

### Regles de filtrage

Les regles s'evaluent dans l'ordre. La premiere qui correspond est appliquee. Regle par defaut en dernier : **deny all** (tout bloquer).

**Exemple de regles iptables (Linux) :**

```bash
# Autoriser le trafic HTTP sortant
iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT

# Autoriser les reponses (connexions etablies)
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Autoriser SSH entrant depuis un reseau specifique
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT

# Bloquer tout le reste
iptables -A INPUT -j DROP
```

### Criteres de filtrage

| Critere | Couche | Exemple |
|---------|--------|---------|
| Adresse IP source/destination | 3 | Bloquer 10.0.0.0/8 |
| Protocole | 3-4 | Autoriser TCP, bloquer ICMP |
| Port source/destination | 4 | Autoriser port 80 (HTTP) |
| Direction | - | Entrant vs sortant |
| Etat de connexion | 4 | ESTABLISHED, NEW, RELATED |
| Interface | - | eth0 (interne) vs eth1 (externe) |

---

## TLS/SSL (Transport Layer Security)

### Role

TLS chiffre la communication entre deux machines. Utilise par HTTPS (HTTP + TLS).

### Fonctionnement simplifie (TLS handshake)

```
Client                              Serveur
  |                                    |
  |--- ClientHello (version, ciphers)->|
  |                                    |
  |<-- ServerHello (cipher choisi) ----|
  |<-- Certificat (cle publique) ------|
  |<-- ServerHelloDone ----------------|
  |                                    |
  |--- ClientKeyExchange (pre-master)->|  (chiffre avec la cle publique)
  |--- ChangeCipherSpec --------------->|
  |--- Finished (chiffre) ------------>|
  |                                    |
  |<-- ChangeCipherSpec ----------------|
  |<-- Finished (chiffre) -------------|
  |                                    |
  |<=== Communication chiffree =======>|
```

### Points cles

- **Certificat** : document signe par une autorite de certification (CA) qui lie un nom de domaine a une cle publique.
- **Chiffrement asymetrique** : pour echanger la cle de session (RSA, ECDH).
- **Chiffrement symetrique** : pour les donnees (AES, ChaCha20). Plus rapide.
- **Port HTTPS** : 443.

### Difference SSL vs TLS

SSL est l'ancien nom (SSL 3.0 est obsolete). TLS 1.2 et 1.3 sont les versions actuelles. On dit souvent "SSL" par habitude, mais c'est TLS qui est utilise.

---

## VPN (Virtual Private Network)

### Role

Un VPN cree un tunnel chiffre entre deux points a travers un reseau non securise (Internet).

### Types

| Type | Description |
|------|-------------|
| VPN site-a-site | Relie deux reseaux d'entreprise |
| VPN acces distant | Un utilisateur se connecte au reseau de l'entreprise |

### Protocoles VPN

| Protocole | Description |
|-----------|-------------|
| IPsec | Chiffrement au niveau IP (couche 3). Modes tunnel et transport. |
| OpenVPN | Base sur TLS/SSL. Utilise UDP ou TCP. Tres repandu. |
| WireGuard | Moderne, simple, performant. Chiffrement base sur Curve25519. |

### Fonctionnement (tunnel)

1. Le client VPN encapsule le paquet original dans un nouveau paquet chiffre.
2. Le nouveau paquet est envoye au serveur VPN via Internet.
3. Le serveur VPN dechiffre et extrait le paquet original.
4. Le paquet original est achemine sur le reseau interne.

L'interface VPN (ex: `tun0`) apparait dans la table de routage avec un MTU legerement inferieur (ex: 1420 au lieu de 1500).

---

## Filtrage de paquets

### Exercice type en DS

**Donne** : un reseau avec un serveur web (192.168.1.10, port 80) et un serveur DNS (192.168.1.20, port 53). Ecrire les regles de filtrage.

```
# Autoriser HTTP entrant vers le serveur web
Action=ACCEPT, Protocole=TCP, IP dest=192.168.1.10, Port dest=80

# Autoriser DNS (UDP) entrant vers le serveur DNS
Action=ACCEPT, Protocole=UDP, IP dest=192.168.1.20, Port dest=53

# Autoriser DNS (TCP) entrant vers le serveur DNS
Action=ACCEPT, Protocole=TCP, IP dest=192.168.1.20, Port dest=53

# Autoriser les reponses (connexions deja etablies)
Action=ACCEPT, Etat=ESTABLISHED

# Bloquer tout le reste
Action=DROP
```

---

## Attaques reseau courantes

| Attaque | Couche | Description | Protection |
|---------|--------|-------------|------------|
| ARP Spoofing | 2 | Fausses reponses ARP pour intercepter le trafic | ARP statique, 802.1X |
| IP Spoofing | 3 | Falsifier l'adresse IP source | Filtrage ingress |
| SYN Flood | 4 | Saturer le serveur de SYN sans completer le handshake | SYN cookies, rate limiting |
| DNS Spoofing | 7 | Fausses reponses DNS | DNSSEC |
| Man-in-the-Middle | 3-7 | Intercepter et modifier les communications | TLS, certificats |
| DDoS | 3-7 | Surcharger un service avec du trafic massif | CDN, rate limiting |

---

## Pieges classiques

1. **TLS != SSL** : SSL est obsolete, mais le terme est encore utilise. En pratique, c'est TLS.
2. **HTTPS = HTTP + TLS** : le chiffrement est assure par TLS, pas par HTTP.
3. **Firewall stateless vs stateful** : stateless evalue chaque paquet isolement, stateful suit les connexions.
4. **VPN ne protege pas de tout** : il chiffre le tunnel, mais le trafic apres le serveur VPN est en clair.
5. **ARP est vulnerable** : pas d'authentification, n'importe qui peut repondre a une requete ARP.

---

## CHEAT SHEET

```
Firewall : filtre par IP, port, protocole, etat
  Stateless : chaque paquet isole
  Stateful  : suit les connexions (ESTABLISHED, RELATED)
  Regle par defaut : DENY ALL

TLS/SSL : chiffrement de la communication
  Certificat = cle publique + signature CA
  Asymetrique pour echange de cle, symetrique pour les donnees
  HTTPS = HTTP + TLS (port 443)

VPN : tunnel chiffre a travers Internet
  IPsec (couche 3), OpenVPN (TLS), WireGuard
  Interface tun0, MTU < 1500

Filtrage :
  iptables -A INPUT -p tcp --dport 80 -j ACCEPT
  iptables -A INPUT -m state --state ESTABLISHED -j ACCEPT
  iptables -A INPUT -j DROP

Attaques : ARP spoofing, SYN flood, DNS spoofing, MitM
Protection : TLS, firewalls, DNSSEC, rate limiting
```
