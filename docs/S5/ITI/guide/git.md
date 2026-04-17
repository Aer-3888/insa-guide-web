---
title: "Git Version Control"
sidebar_position: 4
---

# Git Version Control

## Overview

Git is a distributed version control system that tracks changes to files. The ITI course covers Git fundamentals through interactive exercises (Learn Git Branching) and collaborative projects (Pokemon Git with GitLab).

## Core Concepts

### Git's Data Model

```
Working Directory  -->  Staging Area (Index)  -->  Repository (.git/)
   (your files)        (git add)                 (git commit)
```

- **Working Directory**: Your actual files on disk
- **Staging Area**: Files prepared for the next commit
- **Repository**: Complete history of all commits

### Commit = Snapshot

Each commit is a snapshot of all tracked files at a point in time:
- Has a unique SHA-1 hash (e.g., `a1b2c3d`)
- Points to its parent commit(s)
- Contains author, date, and message

## Setup

```bash
# Configure identity
git config --global user.name "Your Name"
git config --global user.email "email@insa-rennes.fr"

# Useful configuration
git config --global core.editor "nano"
git config --global init.defaultBranch main
git config --global pull.rebase false
```

## Repository Operations

### Creating Repositories
```bash
git init                           # Initialize new repo in current directory
git init project-name              # Create new directory with repo
git clone https://url/repo.git     # Clone existing remote repo
git clone git@gitlab:user/repo.git # Clone via SSH
```

### Checking Status
```bash
git status                         # Show working tree status
git status -s                      # Short format
git log                            # Show commit history
git log --oneline                  # Compact one-line format
git log --oneline --graph --all    # Visual branch history
git log -5                         # Last 5 commits
git log --stat                     # Show files changed per commit
```

## Basic Workflow

### Stage and Commit
```bash
# Stage files
git add file.txt                   # Stage specific file
git add file1.txt file2.txt        # Stage multiple files
git add *.c                        # Stage by pattern
git add .                          # Stage all changes (careful!)

# Check what's staged
git status                         # Overview
git diff                           # Unstaged changes
git diff --staged                  # Staged changes (what will be committed)

# Commit
git commit -m "Add feature X"     # Commit with message
git commit                         # Opens editor for message
git commit -am "Fix bug"          # Stage tracked files and commit
```

### Viewing Changes
```bash
git diff                           # Working dir vs staging
git diff --staged                  # Staging vs last commit
git diff HEAD                      # Working dir vs last commit
git diff commit1 commit2           # Between two commits
git diff branch1..branch2          # Between two branches
git show commit-hash               # Show specific commit details
```

## Branching

### Branch Operations
```bash
git branch                         # List local branches
git branch -a                      # List all branches (including remote)
git branch feature                 # Create branch
git checkout feature               # Switch to branch
git checkout -b feature            # Create and switch (shortcut)
git switch feature                 # Switch (modern syntax)
git switch -c feature              # Create and switch (modern syntax)
git branch -d feature              # Delete branch (safe: only if merged)
git branch -D feature              # Delete branch (force)
```

### Merging
```bash
# Merge feature into current branch (e.g., main)
git checkout main
git merge feature

# Types of merges:
# Fast-forward: No merge commit, just moves pointer
# Three-way merge: Creates merge commit combining both branches

# Force merge commit even when fast-forward possible
git merge --no-ff feature
```

### Resolving Merge Conflicts

When Git cannot auto-merge, it marks conflicts in the file:
```
<<<<<<< HEAD
Your version of the code
=======
Their version of the code
>>>>>>> feature-branch
```

Resolution:
1. Open conflicted file
2. Choose which version to keep (or combine both)
3. Remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
4. Stage resolved file: `git add file.txt`
5. Complete merge: `git commit`

### Rebasing

```bash
# Rebase current branch onto main
git rebase main

# Rebase interactively (rewrite history)
git rebase -i HEAD~3               # Edit last 3 commits
```

Rebase replays your commits on top of another branch, creating a linear history.

**Golden rule**: Never rebase commits that have been pushed to a shared branch.

## Working with Remotes

```bash
# Add remote
git remote add origin https://gitlab.insa-rennes.fr/user/repo.git
git remote -v                      # List remotes

# Push
git push origin main               # Push main branch
git push -u origin feature         # Push and set upstream (-u = first time)
git push                           # Push to tracked remote

# Fetch and Pull
git fetch origin                   # Download changes (don't merge)
git pull origin main               # Fetch + merge
git pull --rebase origin main      # Fetch + rebase

# Tracking
git branch -u origin/main         # Set upstream branch
git branch -vv                     # Show tracking info
```

## Undoing Changes

### Working Directory
```bash
git checkout -- file.txt           # Discard changes to file
git restore file.txt               # Modern equivalent
```

### Staging Area
```bash
git reset HEAD file.txt            # Unstage file (keep changes)
git restore --staged file.txt      # Modern equivalent
```

### Commits
```bash
# Amend last commit (change message or add files)
git commit --amend -m "New message"
git add forgotten-file.txt
git commit --amend --no-edit

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, keep changes in working dir
git reset HEAD~1                   # Same as --mixed

# Undo last commit, discard all changes
git reset --hard HEAD~1            # DANGEROUS: destroys changes!

# Create a new commit that undoes a previous commit (safe)
git revert commit-hash
```

### Reset Types

| Type | Working Dir | Staging | Commit |
|------|-------------|---------|--------|
| `--soft` | Unchanged | Unchanged | Removed |
| `--mixed` (default) | Unchanged | Reset | Removed |
| `--hard` | Reset | Reset | Removed |

## Stashing

```bash
git stash                          # Save changes temporarily
git stash list                     # List stashes
git stash pop                      # Apply and remove last stash
git stash apply                    # Apply but keep stash
git stash drop                     # Remove last stash
```

## .gitignore

Create a `.gitignore` file to exclude files from tracking:

```
# Compiled files
*.o
*.exe
*.out

# IDE files
.vscode/
.idea/

# Build directories
build/
bin/

# System files
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.log
```

## Common Workflows

### Feature Branch Workflow
```bash
git checkout -b feature-x          # Create feature branch
# ... make changes ...
git add .
git commit -m "Implement feature X"
git checkout main                  # Switch to main
git pull origin main               # Get latest changes
git merge feature-x                # Merge feature
git push origin main               # Push to remote
git branch -d feature-x            # Clean up branch
```

### Collaborative Workflow (GitLab)
```bash
git clone https://gitlab.../repo.git
git checkout -b my-feature
# ... make changes ...
git add .
git commit -m "Add my feature"
git push -u origin my-feature
# Create merge request on GitLab
```

### Fixing Mistakes
```bash
# Wrong commit message
git commit --amend -m "Correct message"

# Committed to wrong branch
git log --oneline -1                # Note the commit hash
git reset --soft HEAD~1             # Undo commit
git stash                           # Stash changes
git checkout correct-branch
git stash pop                       # Apply changes here
git commit -m "Message"

# Accidentally deleted file
git checkout -- deleted-file.txt
```

---

## CHEAT SHEET

### Setup
```
git init                    Create repo
git clone <url>             Clone repo
git config --global user.name "Name"
```

### Daily Workflow
```
git status                  Check status
git add <file>              Stage file
git commit -m "msg"         Commit
git push                    Push to remote
git pull                    Fetch + merge
```

### Branching
```
git branch                  List branches
git checkout -b <name>      Create + switch
git merge <branch>          Merge into current
git branch -d <name>        Delete branch
```

### History
```
git log --oneline --graph   Visual history
git diff                    Unstaged changes
git diff --staged           Staged changes
git show <hash>             Show commit
```

### Undo
```
git checkout -- <file>      Discard file changes
git reset HEAD <file>       Unstage file
git reset --soft HEAD~1     Undo commit (keep staged)
git revert <hash>           Undo commit (safe, new commit)
git stash / git stash pop   Temporary save
```

### Remote
```
git remote add origin <url> Add remote
git push -u origin <branch> First push
git fetch                   Download only
git pull                    Download + merge
```
