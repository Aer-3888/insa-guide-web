---
title: "Vulnerabilites -- Guide de revision complet"
sidebar_position: 0
---

# Vulnerabilites -- Guide de revision complet

> S6 -- INSA Rennes, 3A INFO
> Enseignants : Olivier Heen (attaques web, injections, shell, cloud), Barbara Fila (protocoles cryptographiques, modeles d'attaquant)
> Ce guide est strictement educatif -- comprendre les attaques pour concevoir des systemes plus surs

---

## Organisation du cours

Le cours couvre les vulnerabilites des systemes informatiques selon deux axes complementaires :

- **Approche pratique** (O. Heen) : vulnerabilites web (SQL, XSS, CSRF, injections de commandes), securite cloud, analyse de fichiers avec le shell
- **Approche formelle** (B. Fila) : protocoles cryptographiques, modeles d'attaquant (Dolev-Yao), proprietes de securite (secret, authentification), verification avec Scyther

---

## Parcours de revision recommande

```
01. Fondamentaux de securite (CIA, CVE, CVSS, modeles d'attaquant)
     |
02. Vulnerabilites memoire (buffer overflow, format strings, integer overflow)
     |
03. Injections SQL (mecanisme, variantes, protections)
     |
04. XSS et CSRF (reflete, stocke, DOM, forge de requetes)
     |
05. Injection de commandes (separateurs shell, reverse shells)
     |
06. Techniques d'exploitation (shellcode, ROP, NOP sled -- contexte educatif)
     |
07. Mecanismes de defense (ASLR, DEP/NX, canaries, RELRO, PIE, CFI)
     |
08. Vulnerabilites web avancees (SSRF, directory traversal, OWASP Top 10)
     |
09. Authentification et sessions (password cracking, stockage, MFA)
     |
10. Cryptographie et protocoles (sym/asym, hachage, signatures, PKI)
     |
11. Securite reseau (sniffing, ARP spoofing, DNS poisoning, TLS)
     |
12. Man-in-the-Middle (NSPK, attaque de Lowe, correction NSPKL)
     |
13. Securite systeme (privileges, permissions, sandboxing, conteneurs)
     |
14. Securite cloud (IaaS/PaaS/SaaS, multitenancy, bonnes pratiques)
     |
15. Developpement securise (validation, encodage, moindre privilege, OWASP)
     |
Cheat Sheet : revision finale avant DS
```

---

## Table des matieres

| Fichier | Sujet | Points cles |
|---------|-------|-------------|
| [01_fondamentaux_securite.md](/S6/Vulnerabilites/guide/01-fondamentaux-securite) | CIA, CVE, CVSS, modeles d'attaquant | Triade CIA, Dolev-Yao, Kerckhoffs |
| [02_vulnerabilites_memoire.md](/S6/Vulnerabilites/guide/02-vulnerabilites-memoire) | Buffer overflows, format strings, integer overflows | Stack/heap, exploitation, prevention |
| [03_injection_sql.md](/S6/Vulnerabilites/guide/03-injection-sql) | SQL injection : mecanisme, variantes, protections | OR 1=1, UNION, requetes preparees |
| [04_xss_csrf.md](/S6/Vulnerabilites/guide/04-xss-csrf) | XSS reflete/stocke/DOM, CSRF | CSP, HttpOnly, tokens anti-CSRF |
| [05_injection_commandes.md](/S6/Vulnerabilites/guide/05-injection-commandes) | Injection OS, reverse shells, ShellShock | Separateurs, whitelist, regex |
| [06_techniques_exploitation.md](/S6/Vulnerabilites/guide/06-techniques-exploitation) | Shellcode, return-to-libc, ROP, NOP sled | Contexte educatif defensif |
| [07_mecanismes_defense.md](/S6/Vulnerabilites/guide/07-mecanismes-defense) | ASLR, DEP/NX, canaries, RELRO, PIE, CFI | Defense en profondeur |
| [08_vulnerabilites_web.md](/S6/Vulnerabilites/guide/08-vulnerabilites-web) | SSRF, path traversal, OWASP Top 10 | Classification, prevention |
| [09_authentification_sessions.md](/S6/Vulnerabilites/guide/09-authentification-sessions) | Password cracking, stockage securise, MFA | hashcat, sel, hierarchie d'authentification |
| [10_cryptographie_protocoles.md](/S6/Vulnerabilites/guide/10-cryptographie-protocoles) | Sym/asym, hachage, signatures, PKI | Notations, inference, hypothese crypto parfaite |
| [11_securite_reseau.md](/S6/Vulnerabilites/guide/11-securite-reseau) | Sniffing, ARP spoofing, DNS poisoning, TLS | Protocoles, attaques, contre-mesures |
| [12_man_in_the_middle.md](/S6/Vulnerabilites/guide/12-man-in-the-middle) | NSPK, attaque de Lowe, NSPKL | Sessions paralleles, verification Scyther |
| [13_securite_systeme.md](/S6/Vulnerabilites/guide/13-securite-systeme) | Privileges, permissions, sandboxing | PwnKit, conteneurs, moindre privilege |
| [14_securite_cloud.md](/S6/Vulnerabilites/guide/14-securite-cloud) | IaaS/PaaS/SaaS, multitenancy, canaux auxiliaires | Deduplication, IAM, images |
| [15_developpement_securise.md](/S6/Vulnerabilites/guide/15-developpement-securise) | Validation, encodage, OWASP, moindre privilege | Secure coding, revue de code |
| [cheat_sheet.md](/S6/Vulnerabilites/guide/cheat-sheet) | Fiche de revision rapide pour le DS | Tout en une page |

---

## Format du DS

- **Duree** : 2 heures
- **Documents autorises** : slides de cours, notes de TP, notes personnelles
- **Structure typique** (basee sur les annales) :
  - Exercice 1 : Qualifier des vulnerabilites / CVSS (~4 pts)
  - Exercice 2 : Injection SQL et/ou commande (~2-4 pts)
  - Exercice 3 : Securite cloud / questions ouvertes (~2-4 pts)
  - Exercice 4 : Protocoles et proprietes de securite (~4-6 pts)
  - Exercice 5 : Authentification / analyse de protocole (~2-4 pts)

---

## Ressources externes

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CVE Mitre](https://cve.mitre.org/)
- [CVSS v4 Calculator](https://www.first.org/cvss/calculator/4.0)
- [Scyther (verification de protocoles)](https://people.cispa.io/cas.cremers/scyther/)
- [HackTheBox](https://www.hackthebox.eu/) / [RootMe](https://www.root-me.org/)

---

## Avertissement ethique

Ce guide est strictement educatif. Toute tentative de penetration d'un systeme sans autorisation ecrite explicite du proprietaire est **illegale** (articles 323-1 a 323-7 du Code penal). Les vulnerabilites sont etudiees ici dans un but defensif : comprendre les attaques pour concevoir des systemes plus surs.
