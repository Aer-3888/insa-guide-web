---
title: "FUSGIT - Git Version Control"
sidebar_position: 7
---

# FUSGIT - Git Version Control

## Learning Objectives

Master Git for version control and collaborative development:

- Understand Git's data model (commits, branches, trees)
- Create and manage repositories
- Use branches for parallel development
- Merge and resolve conflicts
- Collaborate with remotes (push, pull, fetch)
- Work with git history (log, diff, reset, revert)

## Core Concepts

### Git Basics

**Repository**: A project tracked by Git
```bash
git init                 # Create new repo
git clone url            # Clone existing repo
```

**Staging Area**: Buffer between working directory and commits
```bash
git add file.txt         # Stage file
git add .                # Stage all changes
git status               # See staged/unstaged changes
```

**Commits**: Snapshots of your project
```bash
git commit -m "message"  # Commit staged changes
git log                  # View commit history
git show <commit>        # Show commit details
```

### Branching & Merging

**Branches**: Independent lines of development
```bash
git branch               # List branches
git branch feature       # Create branch
git checkout feature     # Switch to branch
git checkout -b feature  # Create and switch
```

**Merging**: Integrate branches
```bash
git merge feature        # Merge feature into current branch
git merge --no-ff        # Force merge commit
```

**Conflicts**: When Git can't auto-merge
```bash
# Edit conflicted files
git add <resolved-files>
git commit
```

### Working with Remotes

```bash
git remote add origin url    # Add remote
git push origin main         # Push to remote
git pull origin main         # Fetch and merge
git fetch origin             # Fetch without merging
```

### History Navigation

```bash
git log                      # Show commits
git log --oneline            # Compact format
git log --graph --all        # Visual branch history
git diff                     # Show unstaged changes
git diff --staged            # Show staged changes
git diff commit1 commit2     # Compare commits
```

### Undoing Changes

```bash
git checkout -- file         # Discard working changes
git reset HEAD file          # Unstage file
git reset --soft HEAD~1      # Undo commit, keep changes
git reset --hard HEAD~1      # Undo commit, discard changes
git revert <commit>          # Create new commit undoing changes
```

## Exercises Overview

### Exercise 0: Configuration
Set up Git with user name and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "email@insa-rennes.fr"
```

### Exercise 1: Basic Workflow
- Initialize repository (git init)
- Check status (git status)
- Create and stage files (git add)
- View differences (git diff)
- Commit changes (git commit)
- View history (git log)
- Reset changes (git reset, git checkout)

### Exercise 2: Branching
- Create branches (git branch)
- Switch branches (git checkout)
- View branch differences (git log, git diff)
- Delete branches (git branch -d)

### Exercise 3: Merging
- Merge branches (git merge)
- Handle fast-forward merges
- Handle three-way merges
- Resolve merge conflicts

### Exercise 4: Remotes
- Add remote repository (git remote add)
- Push changes (git push)
- Fetch and pull updates (git fetch, git pull)
- Handle conflicts in collaborative work

## Solutions

The `hellogit/` and `FUS TP git/` directories contain example repositories demonstrating these concepts.

## Key Takeaways

1. **Commit often** - Small, focused commits are better
2. **Write good commit messages** - Explain WHY, not just WHAT
3. **Branch for features** - Keep main/master stable
4. **Pull before push** - Avoid conflicts
5. **Never force push to shared branches** - Destroys others' work

## Common Git Workflows

### Feature Branch Workflow
```bash
git checkout -b feature-x     # Create feature branch
# ... make changes ...
git add .
git commit -m "Add feature X"
git checkout main
git merge feature-x           # Merge when ready
git branch -d feature-x       # Delete feature branch
```

### Fixing Mistakes
```bash
# Wrong commit message
git commit --amend -m "Correct message"

# Forgot to stage file
git add forgotten-file.txt
git commit --amend --no-edit

# Undo last commit but keep changes
git reset --soft HEAD~1
```

## Common Pitfalls

1. **Forgetting to commit** - Changes only saved locally after commit
2. **Working directly on main** - Use branches for development
3. **Not pulling before starting work** - Causes conflicts
4. **Adding too much in one commit** - Use git add selectively
5. **Not understanding detached HEAD** - Checkout commits by hash carefully
6. **Force pushing shared branches** - Use --force-with-lease if needed

## Further Reading

- Pro Git book: https://git-scm.com/book
- Git cheat sheet: https://education.github.com/git-cheat-sheet-education.pdf
- Interactive tutorial: https://learngitbranching.js.org/
- Git workflows: Gitflow, GitHub Flow, GitLab Flow

## Essential Git Commands Summary

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
