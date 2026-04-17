---
title: "Chapitre 7 -- Mecanismes de defense"
sidebar_position: 7
---

# Chapitre 7 -- Mecanismes de defense

> Objectif : comprendre les mecanismes de protection contre l'exploitation de vulnerabilites memoire

---

## 7.1 ASLR (Address Space Layout Randomization)

### Principe

Randomiser l'emplacement en memoire de la pile (stack), du tas (heap), des bibliotheques partagees, et du code executable a chaque execution.

### Ce que ca protege

| Attaque | Pourquoi ASLR bloque |
|---------|---------------------|
| Shellcode | L'adresse du buffer injecte est imprevisible |
| NOP sled | L'adresse du sled est imprevisible |
| Return-to-libc | L'adresse de `system()` est imprevisible |
| ROP chains | Les adresses des gadgets sont imprevisibles |

### Limites

- **Brute force** : sur les systemes 32 bits, l'entropie est faible (~16 bits), permettant de deviner en ~65 000 essais
- **Fuites d'information** : si l'attaquant obtient une adresse memoire (format string, info leak), il peut calculer les autres
- **Partial overwrite** : les derniers bits d'une adresse sont souvent fixes (alignement de page)
- **Sans PIE** : le code executable principal n'est pas randomise si non compile avec PIE

### Verification

```bash noexec
# Linux : verifier l'ASLR
cat /proc/sys/kernel/randomize_va_space
# 0 = desactive, 1 = partiel, 2 = complet
```

---

## 7.2 DEP/NX (Data Execution Prevention / No-eXecute)

### Principe

Marquer les pages memoire comme executables OU inscriptibles, mais pas les deux. Les donnees (pile, tas) ne peuvent pas etre executees.

### Ce que ca protege

L'injection de shellcode dans un buffer est inutile car le processeur refuse d'executer du code dans une zone marquee "donnees".

### Limites

- **Return-to-libc** et **ROP** contournent DEP/NX car ils reutilisent du code existant (deja marque executable)
- **JIT compilation** : certains moteurs JS (V8, SpiderMonkey) creent des pages RWX (read-write-execute) pour le JIT

### Noms selon les plateformes

| Plateforme | Nom |
|-----------|-----|
| Intel/AMD | NX bit (No-eXecute) / XD bit (eXecute Disable) |
| Windows | DEP (Data Execution Prevention) |
| Linux | NX enforcement |

---

## 7.3 Stack Canaries (canaris de pile)

### Principe

Une valeur aleatoire ("canari") est placee entre les variables locales et l'adresse de retour. Avant chaque retour de fonction, le canari est verifie. S'il a ete modifie, le programme s'arrete.

```
Pile (stack)
+---------------------------+
| Adresse de retour         |
+---------------------------+
| CANARI (valeur aleatoire) | <-- verifie avant le retour
+---------------------------+
| Variables locales         |
| buffer[64]                | <-- l'attaquant ecrit ici
+---------------------------+
```

### Ce que ca protege

Un buffer overflow lineaire (qui ecrase sequentiellement la pile) modifie le canari, ce qui est detecte.

### Limites

- **Fuites d'information** : si l'attaquant lit le canari (format string, info leak), il peut le reproduire
- **Overflows non lineaires** : un overflow qui saute par-dessus le canari (ex: ecrasement d'un pointeur de fonction)
- **Heap overflows** : les canaris ne protegent que la pile

### Activation

```bash noexec
# GCC : active par defaut, desactivable avec :
gcc -fno-stack-protector  # desactive les canaries (NE PAS FAIRE en production)
gcc -fstack-protector-all # active pour toutes les fonctions
```

---

## 7.4 RELRO (Relocation Read-Only)

### Principe

Rendre les tables de relocation (GOT - Global Offset Table) en lecture seule apres le chargement du programme. Empeche un attaquant de modifier les pointeurs de fonctions dans la GOT.

### Niveaux

| Niveau | Protection |
|--------|-----------|
| **Partial RELRO** | Rearrange les sections, mais la GOT reste inscriptible |
| **Full RELRO** | La GOT est resolue au chargement et rendue lecture seule |

### Activation

```bash noexec
gcc -Wl,-z,relro,-z,now  # Full RELRO
```

---

## 7.5 PIE (Position Independent Executable)

### Principe

Compiler le programme pour qu'il puisse etre charge a n'importe quelle adresse. Combine avec ASLR, le code executable lui-meme est randomise (pas seulement les bibliotheques).

### Difference avec un binaire classique

| Sans PIE | Avec PIE |
|----------|----------|
| Le code est toujours charge a la meme adresse | Le code est charge a une adresse aleatoire |
| L'attaquant connait les adresses des gadgets | Les adresses changent a chaque execution |

### Activation

```bash noexec
gcc -pie -fPIE programme.c  # Compile en PIE
```

---

## 7.6 CFI (Control Flow Integrity)

### Principe

Verifier a l'execution que les sauts indirects (appels via pointeurs de fonction, retours de fonction) correspondent a des cibles legitimes definies a la compilation.

### Ce que ca protege

- **ROP chains** : les sauts vers des gadgets ne sont pas des cibles legitimes
- **JOP** (Jump-Oriented Programming) : meme principe avec des sauts indirects
- **Corruptions de pointeurs de fonctions**

### Limites

- Overhead de performance
- Protection incomplete si l'ensemble des cibles legitimes est trop large
- Des implementations faibles ont ete contournees

---

## 7.7 Defense en profondeur

Aucun mecanisme n'est suffisant seul. La defense en profondeur combine plusieurs couches :

```
Couche 1 : ASLR (adresses aleatoires)
    |
Couche 2 : DEP/NX (pas d'execution de donnees)
    |
Couche 3 : Stack canaries (detection d'ecrasement)
    |
Couche 4 : RELRO (GOT en lecture seule)
    |
Couche 5 : PIE (code a adresse aleatoire)
    |
Couche 6 : CFI (flux de controle verifie)
    |
Couche 7 : Sandboxing (isolation du processus)
```

---

## CHEAT SHEET -- Mecanismes de defense

```
ASLR :
  Randomise pile/tas/libs/code
  Bloque : shellcode, NOP sled, ret2libc, ROP
  Limite : brute force 32 bits, info leaks

DEP/NX :
  Pages donnees non-executables
  Bloque : injection de shellcode
  Limite : ret2libc et ROP le contournent

CANARIES :
  Valeur aleatoire entre buffer et adresse de retour
  Bloque : overflow lineaire de pile
  Limite : info leaks, overflows non lineaires

RELRO :
  GOT en lecture seule (Full RELRO)
  Bloque : ecrasement de GOT

PIE :
  Code executable a adresse aleatoire
  Combine avec ASLR pour proteger le code principal

CFI :
  Verifie les cibles des sauts indirects
  Bloque : ROP, JOP, corruptions de pointeurs

DEFENSE EN PROFONDEUR = toutes les couches ensemble
Aucune defense n'est suffisante seule !

Compilation securisee :
  gcc -pie -fPIE -fstack-protector-all -Wl,-z,relro,-z,now -D_FORTIFY_SOURCE=2
```
