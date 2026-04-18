---
title: "Chapitre 13 -- Securite systeme"
sidebar_position: 13
---

# Chapitre 13 -- Securite systeme

> Objectif : comprendre les mecanismes de securite au niveau du systeme d'exploitation

---

## 13.1 Elevation de privileges

### Concept

L'elevation de privileges (privilege escalation) permet a un attaquant d'obtenir des droits superieurs a ceux autorises.

| Type | Description |
|------|------------|
| **Vertical** | Utilisateur normal --> root/admin |
| **Horizontal** | Utilisateur A --> acces aux donnees de l'utilisateur B |

### Exemple du cours : PwnKit (CVE-2021-4034)

```
Cible : polkit (pkexec), installe par defaut sur la plupart des Linux
Impact : utilisateur standard devient root
CVSS : 7.8 (HIGH)
Correction : mise a jour de polkit
```

### Vecteurs courants d'elevation

| Vecteur | Description |
|---------|------------|
| **SUID/SGID binaries** | Programmes executables avec les droits du proprietaire |
| **Exploits noyau** | Vulnerabilites dans le noyau |
| **Mauvaise configuration sudo** | Regles sudo trop permissives |
| **Fichiers accessibles en ecriture a tous** | Scripts executes par root mais modifiables par tous |
| **Taches cron** | Taches planifiees avec des chemins relatifs |
| **Evasion Docker** | Sortir d'un conteneur |

---

## 13.2 Permissions de fichiers (Unix/Linux)

### Modele de base

```
-rwxr-xr-- 1 alice staff 4096 Apr 15 10:30 script.sh
 |  |  |
 |  |  +-- Autres (Others) : lecture seule
 |  +----- Groupe (Group)  : lecture + execution
 +-------- Proprietaire (Owner) : lecture + ecriture + execution
```

### Permissions speciales

| Permission | Effet |
|-----------|-------|
| **SUID** (4xxx) | Le programme s'execute avec les droits du proprietaire du fichier |
| **SGID** (2xxx) | Le programme s'execute avec les droits du groupe |
| **Bit collant** (1xxx) | Seul le proprietaire peut supprimer ses fichiers dans un repertoire partage |

### Recherche de fichiers SUID (audit de securite)

```bash noexec
# Trouver tous les fichiers SUID
find / -perm -4000 -type f 2>/dev/null

# Trouver les fichiers world-writable
find / -perm -0002 -type f 2>/dev/null
```

---

## 13.3 Principe de moindre privilege

### Definition

> Un processus, un utilisateur ou un programme ne doit avoir que les droits strictement necessaires pour accomplir sa tache.

### Application

| Contexte | Bonne pratique |
|----------|---------------|
| **Utilisateur** | Pas de travail quotidien en root/admin |
| **Service** | Creer un utilisateur dedie (ex: `www-data` pour Apache) |
| **Capabilities** | Donner des capacites individuelles au lieu du root complet |
| **Fichiers** | Permissions 600 (proprietaire seul) par defaut |
| **Base de donnees** | Utilisateur avec droits SELECT uniquement si seule la lecture est necessaire |
| **Cloud** | IAM avec policies minimales |

### Linux Capabilities

Au lieu de donner tous les droits root, on peut donner des capacites individuelles :

```bash noexec
# Donner la capacite de lier aux ports privilegies (< 1024) sans root
setcap 'cap_net_bind_service=+ep' /usr/bin/myapp
```

---

## 13.4 Sandboxing (bac a sable)

### Concept

Isoler un processus pour limiter l'impact d'une compromission.

### Techniques

| Technique | Description | Isolation |
|-----------|------------|-----------|
| **chroot** | Change la racine du systeme de fichiers | Fichiers uniquement |
| **seccomp** | Filtre les appels systeme autorises | Syscalls |
| **AppArmor** | Profiles de securite par application | Fichiers, reseau, capabilities |
| **SELinux** | Controle d'acces obligatoire (MAC) | Tout |
| **Namespaces** | Isolation PID, reseau, montages, etc. | Variable |

### Exemple : seccomp

```c noexec
// Autoriser uniquement read, write, exit, sigreturn
scmp_filter_ctx ctx = seccomp_init(SCMP_ACT_KILL);
seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(read), 0);
seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(write), 0);
seccomp_rule_add(ctx, SCMP_ACT_ALLOW, SCMP_SYS(exit), 0);
seccomp_load(ctx);
```

---

## 13.5 Conteneurs (Docker, etc.)

### Securite des conteneurs

Les conteneurs ne sont PAS des machines virtuelles. Ils partagent le noyau de l'hote.

| Aspect | Machine Virtuelle | Conteneur |
|--------|------------------|-----------|
| **Isolation** | Hyperviseur (forte) | Namespaces + cgroups (plus faible) |
| **Noyau** | Noyau separe | Noyau partage |
| **Surface d'attaque** | Hyperviseur | Noyau de l'hote |
| **Evasion** | Tres difficile | Possible (exploits noyau) |

### Bonnes pratiques conteneurs

1. Ne pas executer en root dans le conteneur
2. Utiliser des images minimales (Alpine, distroless)
3. Scanner les images pour les vulnerabilites
4. Ne pas monter le socket Docker
5. Utiliser les profils seccomp et AppArmor
6. Limiter les capabilities (`--cap-drop ALL --cap-add ...`)

---

## 13.6 Lien avec le cours

| Concept systeme | Reference cours |
|----------------|----------------|
| SUID exploitation | Contexte de PwnKit (CVE-2021-4034) |
| Permissions | Analyse de `/etc/shadow` en TP CMD injection |
| Moindre privilege | Principe general de securite (Ch. 1) |
| Commandes shell | TP Shell for Security (analyse defensive) |

---

## CHEAT SHEET -- Securite systeme

```
ELEVATION DE PRIVILEGES :
  Vertical : utilisateur --> root
  Horizontal : utilisateur A --> donnees de B
  Vecteurs : SUID, kernel exploit, sudo, cron, docker

PERMISSIONS UNIX :
  rwx = 7  rw- = 6  r-x = 5  r-- = 4
  SUID (4xxx) : execute avec droits du proprietaire
  Audit : find / -perm -4000 -type f

MOINDRE PRIVILEGE :
  Pas de root quotidien
  Capabilities individuelles au lieu de root
  IAM policies minimales en cloud

SANDBOXING :
  chroot (fichiers) < seccomp (syscalls) < AppArmor < SELinux

CONTENEURS :
  Pas une VM : noyau partage
  Pas root dans le conteneur
  Images minimales et scannees
  --cap-drop ALL

PwnKit (CVE-2021-4034) :
  polkit, user -> root, CVSS 7.8
  Correction : mise a jour
```
