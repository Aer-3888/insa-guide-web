---
title: "07 -- Protocoles de routage"
sidebar_position: 7
---

# 07 -- Protocoles de routage

## Vue d'ensemble

Les protocoles de routage permettent aux routeurs de decouvrir automatiquement les chemins optimaux et de s'adapter aux changements de topologie. Ils se divisent en deux grandes families : IGP (intra-AS) et EGP (inter-AS).

---

## Classification

```
Protocoles de routage
├── IGP (Interior Gateway Protocol) -- au sein d'un systeme autonome
│   ├── Vecteur de distance (Distance Vector)
│   │   └── RIP
│   └── Etat de liens (Link State)
│       └── OSPF
└── EGP (Exterior Gateway Protocol) -- entre systemes autonomes
    └── BGP (vecteur de chemin)
```

**Systeme autonome (AS)** : ensemble de reseaux sous une meme administration (ex: un operateur comme Free, Orange). Identifie par un numero d'AS.

---

## Routage statique vs dynamique

| | Statique | Dynamique |
|---|----------|-----------|
| Configuration | Manuelle | Automatique |
| Adaptation aux pannes | Non | Oui |
| Bande passante | Aucune surcharge | Messages de controle |
| Complexite | Simple | Plus complexe |
| Usage | Petits reseaux, liens fixes | Grands reseaux |

```bash
# Ajouter une route statique sous Linux
ip route add 10.0.0.0/24 via 192.168.1.1
```

---

## RIP (Routing Information Protocol)

### Principes

- **Type** : vecteur de distance (distance vector).
- **Metrique** : nombre de sauts (hop count), **maximum 15**. 16 = infini (inaccessible).
- **Echange** : chaque routeur envoie sa table complete a ses voisins, toutes les **30 secondes**.
- **Algorithme** : Bellman-Ford distribue.

### Fonctionnement

```
Routeur A connait :
  Reseau X : 0 sauts (directement connecte)
  Reseau Y : 1 saut (via B)

A dit a ses voisins :
  "X en 0 sauts, Y en 1 saut"

Routeur C recoit et calcule :
  "A dit X en 0 sauts. Moi je suis a 1 saut de A.
   Donc X est a 1 saut via A."
```

### Probleme de boucle de routage

Si un lien tombe, les routeurs peuvent se renvoyer le trafic en boucle (count-to-infinity).

**Solutions :**
- **Split horizon** : ne pas annoncer une route sur l'interface par laquelle on l'a apprise.
- **Route poisoning** : annoncer la route tombee avec metrique 16 (infini).
- **Hold-down timer** : ignorer les mises a jour pour une route tombee pendant un certain temps.
- **Triggered updates** : envoyer immediatement une mise a jour lors d'un changement.

### Avantages / Inconvenients

| Avantages | Inconvenients |
|-----------|---------------|
| Tres simple | Convergence lente |
| Facile a configurer | Limite a 15 sauts |
| | Boucles de routage possibles |
| | Echange toute la table (bande passante) |

---

## OSPF (Open Shortest Path First)

### Principes

- **Type** : etat de liens (link state).
- **Metrique** : **cout** (base sur la bande passante).
- **Algorithme** : Dijkstra (plus court chemin).
- **Echange** : chaque routeur envoie des **LSA** (Link State Advertisements) a tous les routeurs.

### Fonctionnement

1. Chaque routeur **decouvre ses voisins** directs (Hello packets).
2. Il **mesure le cout** de chaque lien.
3. Il envoie un **LSA** a tous les routeurs du reseau (flooding).
4. Chaque routeur construit la **carte complete** du reseau (LSDB = Link State Database).
5. Il applique **Dijkstra** pour calculer le plus court chemin vers chaque destination.

### Calcul du cout OSPF

```
Cout = bande passante de reference / bande passante du lien

Reference par defaut : 100 Mbit/s

Exemples :
  Ethernet 10 Mbit/s  -> cout = 100/10  = 10
  Fast Ethernet        -> cout = 100/100 = 1
  Gigabit Ethernet     -> cout = 100/1000 = 1 (arrondi)
```

### Exemple Dijkstra simplifie

Topologie :
```
    10
A -------> B
|          |
| 5        | 3
|          |
v    2     v
C -------> D
```

Depuis A :
- A->B = 10, A->C = 5
- A->C->D = 5+2 = 7, A->B->D = 10+3 = 13
- Plus court vers D : **A->C->D (cout 7)**

### Avantages / Inconvenients

| Avantages | Inconvenients |
|-----------|---------------|
| Convergence rapide | Plus complexe |
| Pas de limite de sauts | Necessite plus de memoire |
| Pas de boucles | Calcul Dijkstra couteux |
| N'echange que les changements | |

---

## BGP (Border Gateway Protocol)

### Principes

- **Type** : vecteur de chemin (path vector).
- **Usage** : routage **entre** systemes autonomes -- c'est le protocole d'Internet.
- **Port** : TCP 179.
- **Metrique** : **politiques** (pas seulement la distance).

### Particularites

- Les decisions de routage sont basees sur des **politiques** (accords commerciaux, preferences) autant que sur la distance.
- Chaque route contient le **chemin complet** des AS traverses (empeche les boucles).
- Deux types : **eBGP** (entre AS differents) et **iBGP** (au sein du meme AS).
- BGP est le protocole qui fait fonctionner Internet a grande echelle.

---

## Processus de routage complet (rappel)

A chaque saut :
1. Recevoir la trame -> retirer en-tete Ethernet.
2. Lire IP destination -> consulter table de routage (**longest prefix match**).
3. **Decrementer TTL** (si TTL=0 -> detruire + ICMP Time Exceeded).
4. ARP pour trouver la MAC du prochain saut.
5. Construire nouvelle trame Ethernet -> transmettre.

**Ce qui change** : MAC src, MAC dest, TTL, checksum IP.
**Ce qui NE change PAS** : IP src, IP dest, donnees.

---

## ICMP (rappel)

| Type | Message | Usage |
|------|---------|-------|
| 0 | Echo Reply | Reponse ping |
| 3/0 | Network Unreachable | Reseau inaccessible |
| 3/1 | Host Unreachable | Hote inaccessible |
| 3/3 | Port Unreachable | Port inaccessible (UDP) |
| 8 | Echo Request | Commande ping |
| 11 | Time Exceeded | TTL expire (traceroute) |

```bash
ping 10.0.0.20        # ICMP Echo Request / Reply
traceroute 10.0.0.20  # TTL incremental + ICMP Time Exceeded
```

---

## Pieges classiques

1. **RIP vs OSPF** : RIP = sauts (max 15), convergence lente. OSPF = cout (Dijkstra), convergence rapide.
2. **Longest prefix match** : la route avec le masque le plus long gagne, pas la metrique la plus basse.
3. **TTL decremente a chaque routeur** : oubli frequent dans les exercices pas a pas.
4. **MAC change a chaque saut** : la MAC destination est celle du prochain routeur, pas de la destination finale.
5. **Route par defaut** : 0.0.0.0/0 correspond a tout mais avec le masque le plus court (priorite la plus basse).

---

## CHEAT SHEET

```
Protocoles de routage :
  RIP  : vecteur de distance, metrique=sauts (max 15), simple, lent
  OSPF : etat de liens, metrique=cout, Dijkstra, rapide, pas de boucles
  BGP  : vecteur de chemin, inter-AS, politiques, TCP 179

Cout OSPF = 100 Mbit/s / bande passante du lien

RIP : table complete toutes les 30s, Bellman-Ford
  Probleme : boucles -> split horizon, route poisoning, hold-down

OSPF : LSA floods, chaque routeur a la carte complete
  Dijkstra pour plus court chemin

A chaque saut :
  IP src/dest : INCHANGE
  MAC src/dest : CHANGE
  TTL : DECREMENTE

Longest prefix match : /24 > /16 > /8 > /0 (route par defaut)

ICMP : ping (type 8/0), traceroute (TTL + type 11)
```
