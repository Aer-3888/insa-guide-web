---
title: "FUSGIT - Controle de version Git"
sidebar_position: 7
---

# FUSGIT - Controle de version Git

## Objectifs pedagogiques

Maitriser Git pour le controle de version et le developpement collaboratif :

- Comprendre le modele de donnees de Git (commits, branches, arbres)
- Creer et gerer des depots
- Utiliser les branches pour le developpement parallele
- Fusionner et resoudre les conflits
- Collaborer avec les depots distants (push, pull, fetch)
- Travailler avec l'historique git (log, diff, reset, revert)

## Concepts fondamentaux

### Bases de Git

**Depot** : un projet suivi par Git
```bash
git init                 # Create new repo
git clone url            # Clone existing repo
```

**Zone de staging** : tampon entre le repertoire de travail et les commits
```bash
git add file.txt         # Stage file
git add .                # Stage all changes
git status               # See staged/unstaged changes
```

**Commits** : instantanes de votre projet
```bash
git commit -m "message"  # Commit staged changes
git log                  # View commit history
git show <commit>        # Show commit details
```

### Branchement et fusion

**Branches** : lignes de developpement independantes
```bash
git branch               # List branches
git branch feature       # Create branch
git checkout feature     # Switch to branch
git checkout -b feature  # Create and switch
```

**Fusion** : integrer des branches
```bash
git merge feature        # Merge feature into current branch
git merge --no-ff        # Force merge commit
```

**Conflits** : quand Git ne peut pas fusionner automatiquement
```bash
# Edit conflicted files
git add <resolved-files>
git commit
```

### Travailler avec les depots distants

```bash
git remote add origin url    # Add remote
git push origin main         # Push to remote
git pull origin main         # Fetch and merge
git fetch origin             # Fetch without merging
```

### Navigation dans l'historique

```bash
git log                      # Show commits
git log --oneline            # Compact format
git log --graph --all        # Visual branch history
git diff                     # Show unstaged changes
git diff --staged            # Show staged changes
git diff commit1 commit2     # Compare commits
```

### Annuler des modifications

```bash
git checkout -- file         # Discard working changes
git reset HEAD file          # Unstage file
git reset --soft HEAD~1      # Undo commit, keep changes
git reset --hard HEAD~1      # Undo commit, discard changes
git revert <commit>          # Create new commit undoing changes
```

## Apercu des exercices

### Exercice 0 : Configuration
Set up Git with user name and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "email@insa-rennes.fr"
```

### Exercice 1 : Flux de travail de base
- Initialize repository (git init)
- Check status (git status)
- Create and stage files (git add)
- View differences (git diff)
- Commit changes (git commit)
- View history (git log)
- Reset changes (git reset, git checkout)

### Exercice 2 : Branchement
- Create branches (git branch)
- Switch branches (git checkout)
- View branch differences (git log, git diff)
- Delete branches (git branch -d)

### Exercice 3 : Fusion
- Merge branches (git merge)
- Handle fast-forward merges
- Handle three-way merges
- Resolve merge conflicts

### Exercice 4 : Depots distants
- Add remote repository (git remote add)
- Push changes (git push)
- Fetch and pull updates (git fetch, git pull)
- Handle conflicts in collaborative work

## Solutions

Les repertoires `hellogit/` et `FUS TP git/` contiennent des depots exemples illustrant ces concepts.

## Points cles a retenir

1. **Commiter souvent** - De petits commits cibles sont meilleurs
2. **Ecrire de bons messages de commit** - Expliquer POURQUOI, pas seulement QUOI
3. **Brancher pour les fonctionnalites** - Garder main/master stable
4. **Tirer avant de pousser** - Eviter les conflits
5. **Ne jamais forcer le push sur les branches partagees** - Detruit le travail des autres

## Flux de travail Git courants

### Flux de travail avec branche de fonctionnalite
```bash
git checkout -b feature-x     # Create feature branch
# ... make changes ...
git add .
git commit -m "Add feature X"
git checkout main
git merge feature-x           # Merge when ready
git branch -d feature-x       # Delete feature branch
```

### Corriger des erreurs
```bash
# Wrong commit message
git commit --amend -m "Correct message"

# Forgot to stage file
git add forgotten-file.txt
git commit --amend --no-edit

# Undo last commit but keep changes
git reset --soft HEAD~1
```

## Erreurs courantes

1. **Oublier de commiter** - Les modifications ne sont sauvegardees localement qu'apres le commit
2. **Travailler directement sur main** - Utiliser les branches pour le developpement
3. **Ne pas tirer avant de commencer** - Cause des conflits
4. **Ajouter trop dans un seul commit** - Utiliser git add selectivement
5. **Ne pas comprendre le HEAD detache** - Checkout de commits par hash avec precaution
6. **Forcer le push sur des branches partagees** - Utiliser --force-with-lease si necessaire

## Pour aller plus loin

- Pro Git book: https://git-scm.com/book
- Git cheat sheet: https://education.github.com/git-cheat-sheet-education.pdf
- Interactive tutorial: https://learngitbranching.js.org/
- Git workflows: Gitflow, GitHub Flow, GitLab Flow

## Resume des commandes Git essentielles

```bash
# Setup
git config --global user.name "Name"
git config --global user.email "email"

# Repository
git init
git clone <url>

# Changes
git status
git add <file>
git commit -m "message"
git diff

# Branches
git branch
git checkout <branch>
git merge <branch>

# History
git log
git log --oneline --graph

# Remotes
git remote add origin <url>
git push origin <branch>
git pull origin <branch>

# Undo
git checkout -- <file>
git reset HEAD <file>
git revert <commit>
```
