---
title: "Exercices -- Vulnerabilites et Securite informatique"
sidebar_position: 0
---

# Exercices -- Vulnerabilites et Securite informatique

> Solutions detaillees avec traces d'execution, payloads exacts et notation CVSS

---

## Table des matieres

| Fichier | Sujet | Exercices |
|---------|-------|-----------|
| [tp1_shell_security.md](/S6/Vulnerabilites/exercises/tp1-shell-security) | TP1 : Shell for Security -- Analyse de fichiers | Commandes shell, extraction de balises, recherche de credentials, Base64, CVSS |
| [exercices_injection_sql.md](/S6/Vulnerabilites/exercises/exercices-injection-sql) | Injection SQL | Identification de champs, contournement de login, UNION SELECT, second ordre, CVSS |
| [exercices_xss_csrf.md](/S6/Vulnerabilites/exercises/exercices-xss-csrf) | XSS et CSRF | XSS reflete/stocke/DOM-based, CSRF GET/POST, CSP, comparaison XSS vs CSRF, CVSS |
| [exercices_protocoles.md](/S6/Vulnerabilites/exercises/exercices-protocoles) | Protocoles de securite | Inference de messages, secret, attaque de Lowe, challenge-response, Scyther, NSPKL |
| [exercices_cvss.md](/S6/Vulnerabilites/exercises/exercices-cvss) | Qualification et CVSS | CIA, calcul CVSS v3.1, comparaison versions, IoT, Log4Shell, classement de vulnerabilites |

## Comment utiliser ces exercices

1. Essayer de resoudre l'exercice AVANT de regarder la solution
2. Verifier chaque etape du raisonnement (payload, requete resultante, trace d'execution)
3. Pour chaque vulnerabilite, s'entrainer a evaluer le CVSS metrique par metrique
4. Identifier les pieges courants dans la section "Pieges" de chaque fichier
5. Les exercices couvrent les sujets de DS 2020-2025

## Couverture par sujet de DS

| Theme DS | Fichier(s) |
|----------|-----------|
| Identifier le type d'attaque (XSS/SQL/CMD/CSRF) | exercices_xss_csrf.md (Ex1), exercices_injection_sql.md (Ex5) |
| Donner un payload et la requete resultante | exercices_injection_sql.md (Ex1-4), exercices_xss_csrf.md (Ex2-5) |
| Qualifier les proprietes CIA violees | exercices_cvss.md (Ex1) |
| Calculer un score CVSS | exercices_cvss.md (Ex2-7), tous les exercices (sections CVSS) |
| Analyser un protocole de securite | exercices_protocoles.md (Ex1-9) |
| Trouver une attaque sur un protocole | exercices_protocoles.md (Ex5-6, Ex8-9) |
| Corriger un protocole vulnerable | exercices_protocoles.md (Ex3, Ex6, Ex8-9) |
| Proposer des protections | exercices_injection_sql.md (Ex4), exercices_xss_csrf.md (Ex3, Ex5, Ex7) |
