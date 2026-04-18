---
title: "Controle de version Git"
sidebar_position: 4
---

# Controle de version Git

## Apercu

Git est un systeme de controle de version distribue qui suit les modifications apportees aux fichiers. Le cours ITI couvre les fondamentaux de Git a travers des exercices interactifs (Learn Git Branching) et des projets collaboratifs (Pokemon Git avec GitLab).

## Concepts fondamentaux

### Modele de donnees de Git

```
Repertoire de travail  -->  Zone de staging (Index)  -->  Depot (.git/)
   (vos fichiers)          (git add)                    (git commit)
```

- **Repertoire de travail** : vos fichiers reels sur le disque
- **Zone de staging** : fichiers prepares pour le prochain commit
- **Depot** : historique complet de tous les commits

### Commit = Instantane

Chaque commit est un instantane de tous les fichiers suivis a un instant donne :
- Possede un hash SHA-1 unique (ex. `a1b2c3d`)
- Pointe vers son ou ses commit(s) parent(s)
- Contient l'auteur, la date et le message

## Configuration

```bash
# Configurer l'identite
git config --global user.name "Your Name"
git config --global user.email "email@insa-rennes.fr"

# Configuration utile
git config --global core.editor "nano"
git config --global init.defaultBranch main
git config --global pull.rebase false
```

## Operations sur le depot

### Creer des depots
```bash
git init                           # Initialiser un nouveau depot dans le repertoire courant
git init project-name              # Creer un nouveau repertoire avec un depot
git clone https://url/repo.git     # Cloner un depot distant existant
git clone git@gitlab:user/repo.git # Cloner via SSH
```

### Verifier l'etat
```bash
git status                         # Afficher l'etat de l'arbre de travail
git status -s                      # Format court
git log                            # Afficher l'historique des commits
git log --oneline                  # Format compact sur une ligne
git log --oneline --graph --all    # Historique visuel des branches
git log -5                         # Les 5 derniers commits
git log --stat                     # Afficher les fichiers modifies par commit
```

## Flux de travail de base

### Indexer et valider
```bash
# Indexer des fichiers
git add file.txt                   # Indexer un fichier specifique
git add file1.txt file2.txt        # Indexer plusieurs fichiers
git add *.c                        # Indexer par motif
git add .                          # Indexer toutes les modifications (attention !)

# Verifier ce qui est indexe
git status                         # Vue d'ensemble
git diff                           # Modifications non indexees
git diff --staged                  # Modifications indexees (ce qui sera commite)

# Valider
git commit -m "Add feature X"     # Valider avec un message
git commit                         # Ouvre l'editeur pour le message
git commit -am "Fix bug"          # Indexer les fichiers suivis et valider
```

### Voir les modifications
```bash
git diff                           # Repertoire de travail vs staging
git diff --staged                  # Staging vs dernier commit
git diff HEAD                      # Repertoire de travail vs dernier commit
git diff commit1 commit2           # Entre deux commits
git diff branch1..branch2          # Entre deux branches
git show commit-hash               # Afficher les details d'un commit specifique
```

## Branchement

### Operations sur les branches
```bash
git branch                         # Lister les branches locales
git branch -a                      # Lister toutes les branches (y compris distantes)
git branch feature                 # Creer une branche
git checkout feature               # Basculer sur une branche
git checkout -b feature            # Creer et basculer (raccourci)
git switch feature                 # Basculer (syntaxe moderne)
git switch -c feature              # Creer et basculer (syntaxe moderne)
git branch -d feature              # Supprimer une branche (sur : seulement si fusionnee)
git branch -D feature              # Supprimer une branche (force)
```

### Fusion
```bash
# Fusionner feature dans la branche courante (ex. main)
git checkout main
git merge feature

# Types de fusions :
# Fast-forward : pas de commit de fusion, deplace simplement le pointeur
# Fusion a trois voies : cree un commit de fusion combinant les deux branches

# Forcer un commit de fusion meme si le fast-forward est possible
git merge --no-ff feature
```

### Resoudre les conflits de fusion

Quand Git ne peut pas fusionner automatiquement, il marque les conflits dans le fichier :
```
<<<<<<< HEAD
Votre version du code
=======
Leur version du code
>>>>>>> feature-branch
```

Resolution :
1. Ouvrir le fichier en conflit
2. Choisir quelle version garder (ou combiner les deux)
3. Supprimer les marqueurs de conflit (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Indexer le fichier resolu : `git add file.txt`
5. Terminer la fusion : `git commit`

### Rebasage

```bash
# Rebaser la branche courante sur main
git rebase main

# Rebasage interactif (reecrire l'historique)
git rebase -i HEAD~3               # Editer les 3 derniers commits
```

Le rebasage rejoue vos commits au-dessus d'une autre branche, creant un historique lineaire.

**Regle d'or** : ne jamais rebaser des commits qui ont ete pousses sur une branche partagee.

## Travailler avec des depots distants

```bash
# Ajouter un depot distant
git remote add origin https://gitlab.insa-rennes.fr/user/repo.git
git remote -v                      # Lister les depots distants

# Pousser
git push origin main               # Pousser la branche main
git push -u origin feature         # Pousser et definir l'upstream (-u = premiere fois)
git push                           # Pousser vers le distant suivi

# Recuperer et tirer
git fetch origin                   # Telecharger les modifications (sans fusionner)
git pull origin main               # Fetch + merge
git pull --rebase origin main      # Fetch + rebase

# Suivi
git branch -u origin/main         # Definir la branche upstream
git branch -vv                     # Afficher les informations de suivi
```

## Annuler des modifications

### Repertoire de travail
```bash
git checkout -- file.txt           # Annuler les modifications d'un fichier
git restore file.txt               # Equivalent moderne
```

### Zone de staging
```bash
git reset HEAD file.txt            # Desindexer un fichier (garder les modifications)
git restore --staged file.txt      # Equivalent moderne
```

### Commits
```bash
# Modifier le dernier commit (changer le message ou ajouter des fichiers)
git commit --amend -m "New message"
git add forgotten-file.txt
git commit --amend --no-edit

# Annuler le dernier commit, garder les modifications indexees
git reset --soft HEAD~1

# Annuler le dernier commit, garder les modifications dans le repertoire de travail
git reset HEAD~1                   # Equivalent a --mixed

# Annuler le dernier commit, supprimer toutes les modifications
git reset --hard HEAD~1            # DANGEREUX : detruit les modifications !

# Creer un nouveau commit qui annule un commit precedent (sur)
git revert commit-hash
```

### Types de reset

| Type | Repertoire de travail | Staging | Commit |
|------|----------------------|---------|--------|
| `--soft` | Inchange | Inchange | Supprime |
| `--mixed` (par defaut) | Inchange | Reinitialise | Supprime |
| `--hard` | Reinitialise | Reinitialise | Supprime |

## Remisage (stash)

```bash
git stash                          # Sauvegarder temporairement les modifications
git stash list                     # Lister les remises
git stash pop                      # Appliquer et supprimer la derniere remise
git stash apply                    # Appliquer mais garder la remise
git stash drop                     # Supprimer la derniere remise
```

## .gitignore

Creer un fichier `.gitignore` pour exclure des fichiers du suivi :

```
# Fichiers compiles
*.o
*.exe
*.out

# Fichiers IDE
.vscode/
.idea/

# Repertoires de construction
build/
bin/

# Fichiers systeme
.DS_Store
Thumbs.db

# Fichiers temporaires
*.tmp
*.log
```

## Flux de travail courants

### Flux de travail avec branche de fonctionnalite
```bash
git checkout -b feature-x          # Creer la branche de fonctionnalite
# ... faire des modifications ...
git add .
git commit -m "Implement feature X"
git checkout main                  # Basculer sur main
git pull origin main               # Recuperer les dernieres modifications
git merge feature-x                # Fusionner la fonctionnalite
git push origin main               # Pousser vers le distant
git branch -d feature-x            # Nettoyer la branche
```

### Flux de travail collaboratif (GitLab)
```bash
git clone https://gitlab.../repo.git
git checkout -b my-feature
# ... faire des modifications ...
git add .
git commit -m "Add my feature"
git push -u origin my-feature
# Creer une merge request sur GitLab
```

### Corriger des erreurs
```bash
# Mauvais message de commit
git commit --amend -m "Correct message"

# Commit sur la mauvaise branche
git log --oneline -1                # Noter le hash du commit
git reset --soft HEAD~1             # Annuler le commit
git stash                           # Remiser les modifications
git checkout correct-branch
git stash pop                       # Appliquer les modifications ici
git commit -m "Message"

# Fichier supprime accidentellement
git checkout -- deleted-file.txt
```

---

## AIDE-MEMOIRE

### Configuration
```
git init                    Creer un depot
git clone <url>             Cloner un depot
git config --global user.name "Name"
```

### Flux de travail quotidien
```
git status                  Verifier l'etat
git add <file>              Indexer un fichier
git commit -m "msg"         Valider
git push                    Pousser vers le distant
git pull                    Recuperer + fusionner
```

### Branchement
```
git branch                  Lister les branches
git checkout -b <name>      Creer + basculer
git merge <branch>          Fusionner dans la branche courante
git branch -d <name>        Supprimer une branche
```

### Historique
```
git log --oneline --graph   Historique visuel
git diff                    Modifications non indexees
git diff --staged           Modifications indexees
git show <hash>             Afficher un commit
```

### Annuler
```
git checkout -- <file>      Annuler les modifications d'un fichier
git reset HEAD <file>       Desindexer un fichier
git reset --soft HEAD~1     Annuler le commit (garder indexe)
git revert <hash>           Annuler le commit (sur, nouveau commit)
git stash / git stash pop   Sauvegarde temporaire
```

### Distant
```
git remote add origin <url> Ajouter un distant
git push -u origin <branch> Premier push
git fetch                   Telecharger uniquement
git pull                    Telecharger + fusionner
```
