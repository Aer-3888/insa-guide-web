---
title: "Exercises -- Reseaux (S6)"
sidebar_position: 0
---

# Exercises -- Reseaux (S6)

Solutions detaillees et annotees des TPs de programmation reseau.
Chaque fichier contient le code source complet, les commandes de compilation, les sessions terminal et l'analyse reseau.

## Table des matieres

| Fichier | Description | Langages |
|---------|-------------|----------|
| [tp1_network_discovery.md](/S6/Reseaux/exercises/tp1-network-discovery) | TP1 : Decouverte reseau, Wireshark, ARP, ICMP, fragmentation, TCP handshake | Outils Linux |
| [tp2_udp_tcp_java.md](/S6/Reseaux/exercises/tp2-udp-tcp-java) | TP2 : Serveur echo UDP, serveur/client HTTP en Java | Java |
| [tp3_tcp_services.md](/S6/Reseaux/exercises/tp3-tcp-services) | TP3 : Services TCP interactifs (Majuscule, Plus ou Moins) en Java | Java |
| [tp4_sockets_c.md](/S6/Reseaux/exercises/tp4-sockets-c) | TP4 : Programmation socket en C (TCP, UDP, Plus ou Moins) | C |
| [tp5_multicast_chat.md](/S6/Reseaux/exercises/tp5-multicast-chat) | TP5 : Chat multicast en C (pthreads, termios, mutex) | C |

## Progression pedagogique

```
TP1 (Observation)     TP2 (Java basique)     TP3 (Java avance)     TP4 (C sockets)     TP5 (C avance)
    Wireshark     -->   UDP/TCP Java     -->   Protocoles TCP  -->   POSIX sockets  -->  Multicast
    ping/arp            DatagramSocket          ServerSocket         socket/bind          IP_ADD_MEMBERSHIP
    traceroute          ServerSocket            Protocole texte      send/recv            pthreads
    fragmentation       HTTP 1.0                Jeu interactif       sendto/recvfrom      termios raw mode
```
