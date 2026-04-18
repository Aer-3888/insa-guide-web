---
title: "Chapitre 2 -- Vulnerabilites memoire"
sidebar_position: 2
---

# Chapitre 2 -- Vulnerabilites memoire

> Objectif : comprendre les vulnerabilites de corruption memoire pour mieux concevoir des systemes defensifs

---

## 2.1 Buffer overflows (debordements de tampon)

### Concept

Un buffer overflow survient quand un programme ecrit des donnees au-dela des limites d'un tampon alloue en memoire, ecrasant des donnees adjacentes.

### Stack buffer overflow

**Code vulnerable :**
```c noexec
// VULNERABLE : pas de verification de taille
void greet(char *name) {
    char buffer[64];
    strcpy(buffer, name);  // Aucune limite sur la copie
    printf("Hello, %s!\n", buffer);
}
```

**Mecanisme d'exploitation :**
```
Pile (stack) - adresses hautes en haut
+---------------------------+
| Adresse de retour (EIP)   | <-- ecrasee par l'attaquant
+---------------------------+
| Ancien EBP (frame pointer)| <-- ecrase
+---------------------------+
| buffer[64]                | <-- rempli avec des donnees
| ...                       |     controlees par l'attaquant
| buffer[0]                 |
+---------------------------+
```

L'attaquant envoie plus de 64 octets pour ecraser l'adresse de retour et rediriger l'execution.

**Code corrige :**
```c noexec
// SECURISE : limitation de la copie
void greet(char *name) {
    char buffer[64];
    strncpy(buffer, name, sizeof(buffer) - 1);
    buffer[sizeof(buffer) - 1] = '\0';
    printf("Hello, %s!\n", buffer);
}
```

**CVE reference** : CVE-2014-0160 (Heartbleed) -- lecture hors limites dans OpenSSL permettant de lire la memoire du serveur.

### Heap buffer overflow

Les tampons alloues dynamiquement (`malloc`, `new`) peuvent aussi deborder. L'exploitation differe : on ecrase les metadonnees du heap (pointeurs de liste chainee) pour obtenir une ecriture arbitraire en memoire.

**Code vulnerable :**
```c noexec
// VULNERABLE : taille non verifiee
char *buf = malloc(256);
fgets(buf, 1024, stdin);  // Lit 1024 octets dans un buffer de 256
```

**Code corrige :**
```c noexec
// SECURISE : taille coherente
char *buf = malloc(256);
if (buf == NULL) { /* gerer l'erreur */ }
fgets(buf, 256, stdin);  // Lit au maximum la taille allouee
```

---

## 2.2 Format string attacks

### Concept

Si une chaine de format est controlee par l'utilisateur, les specificateurs `%x`, `%n`, `%s` permettent de lire et ecrire en memoire.

**Code vulnerable :**
```c noexec
// VULNERABLE : l'entree utilisateur EST la chaine de format
char *user_input = get_input();
printf(user_input);  // L'utilisateur peut injecter %x, %n, etc.
```

**Exploitation :**
```
Entree : "%08x.%08x.%08x.%08x"
Resultat : affiche le contenu de la pile (lecture memoire)

Entree : "%n" (apres preparation)
Resultat : ecrit en memoire (ecriture arbitraire)
```

**Code corrige :**
```c noexec
// SECURISE : l'entree est un argument, pas le format
char *user_input = get_input();
printf("%s", user_input);  // Le format est fixe
```

**CVE reference** : CVE-2012-0809 -- vulnerabilite format string dans sudo permettant une elevation de privileges.

---

## 2.3 Integer overflows

### Concept

Un depassement d'entier survient quand une operation arithmetique produit un resultat qui depasse la capacite du type.

**Code vulnerable :**
```c noexec
// VULNERABLE : multiplication peut deborder
void allocate_buffer(unsigned int count, unsigned int size) {
    unsigned int total = count * size;  // Peut deborder !
    // Si count=0x10000001 et size=0x100, total=0x100 (debordement)
    char *buf = malloc(total);  // Alloue un petit buffer
    for (unsigned int i = 0; i < count * size; i++) {
        buf[i] = 0;  // Ecrit bien au-dela du buffer alloue
    }
}
```

**Code corrige :**
```c noexec
// SECURISE : verification de debordement
#include <stdint.h>
void allocate_buffer(unsigned int count, unsigned int size) {
    if (count > 0 && size > SIZE_MAX / count) {
        // Debordement detecte
        return;
    }
    size_t total = (size_t)count * size;
    char *buf = malloc(total);
    if (buf == NULL) { return; }
    memset(buf, 0, total);
}
```

**CVE reference** : CVE-2015-1593 -- integer overflow dans le noyau Linux (stack ASLR randomization) reduisant l'entropie de l'ASLR.

---

## 2.4 Use-After-Free

### Concept

Utiliser un pointeur vers une zone memoire deja liberee. Si cette zone a ete reallouee pour un autre objet, l'attaquant peut manipuler les donnees.

**Code vulnerable :**
```c noexec
// VULNERABLE : utilisation apres liberation
char *ptr = malloc(128);
// ... utilisation ...
free(ptr);
// ... plus tard ...
strcpy(ptr, user_data);  // Ecriture dans une zone liberee
```

**Code corrige :**
```c noexec
// SECURISE : mise a NULL apres liberation
char *ptr = malloc(128);
// ... utilisation ...
free(ptr);
ptr = NULL;  // Empeche toute utilisation accidentelle
```

**CVE reference** : CVE-2022-0609 -- use-after-free dans Chrome Animation permettant l'execution de code a distance (exploitee activement).

---

## 2.5 Recapitulatif des vulnerabilites memoire

| Vulnerabilite | Mecanisme | Impact | Prevention |
|--------------|-----------|--------|------------|
| Stack overflow | Ecrire au-dela d'un buffer sur la pile | Detournement du flux d'execution | `strncpy`, verification de tailles |
| Heap overflow | Ecrire au-dela d'un buffer sur le tas | Ecriture arbitraire | Tailles coherentes, verification de bornes |
| Format string | Chaine de format controlee par l'utilisateur | Lecture/ecriture memoire | `printf("%s", input)` |
| Integer overflow | Depassement arithmetique | Allocation trop petite | Verification avant operation |
| Use-After-Free | Utilisation apres `free()` | Corruption memoire | Mise a NULL, pointeurs intelligents |

---

## CHEAT SHEET -- Vulnerabilites memoire

```
BUFFER OVERFLOW :
  Vulnerable : strcpy(buf, input)    sans limite
  Corrige    : strncpy(buf, input, sizeof(buf)-1)

FORMAT STRING :
  Vulnerable : printf(user_input)    format controle
  Corrige    : printf("%s", user_input)

INTEGER OVERFLOW :
  Vulnerable : total = count * size  sans verification
  Corrige    : if (size > SIZE_MAX / count) abort();

USE-AFTER-FREE :
  Vulnerable : free(ptr); use(ptr);
  Corrige    : free(ptr); ptr = NULL;

Fonctions C dangereuses :
  strcpy -> strncpy / strlcpy
  gets   -> fgets
  sprintf -> snprintf
  scanf %s -> scanf %63s (avec taille)
```
