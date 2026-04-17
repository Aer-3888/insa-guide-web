---
title: "TP7 - FUSGIT: Git Version Control"
sidebar_position: 5
---

# TP7 - FUSGIT: Git Version Control

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp7_git/README.md

## Exercise 0

### Set up Git with user name and email

**Answer:**

```bash
git config --global user.name "Prenom Nom"
git config --global user.email "prenom.nom@insa-rennes.fr"

# Verify
git config --list
```

**Expected output (relevant lines):**
```
user.name=Prenom Nom
user.email=prenom.nom@insa-rennes.fr
```

Optional useful settings:

```bash
git config --global init.defaultBranch main
git config --global color.ui auto
git config --global core.editor "nano"
```

---

## Exercise 1

### Basic Workflow: initialize repository, check status, create and stage files, view differences, commit changes, view history, reset changes

**1a. Initialize a repository**

**Answer:**

```bash
mkdir mon-projet && cd mon-projet
git init
```

**Expected output:**
```
Initialized empty Git repository in /home/user/TP7_git/mon-projet/.git/
```

---

**1b. Check status**

```bash
git status
```

**Expected output:**
```
On branch main
No commits yet
nothing to commit
```

---

**1c. Create and stage a file**

```bash
echo "Hello, Git!" > hello.txt
git add hello.txt
git status
```

**Expected output:**
```
Changes to be committed:
	new file:   hello.txt
```

---

**1d. View staged changes**

```bash
git diff --staged
```

**Expected output:**
```diff
+Hello, Git!
```

---

**1e. Commit**

```bash
git commit -m "Initial commit: add hello.txt"
```

**Expected output:**
```
[main (root-commit) abc1234] Initial commit: add hello.txt
 1 file changed, 1 insertion(+)
```

---

**1f. View history**

```bash
git log --oneline
```

**Expected output:**
```
abc1234 Initial commit: add hello.txt
```

---

**1g. Modify, diff, and commit**

```bash
echo "Second line" >> hello.txt
git diff
```

**Expected output:**
```diff
 Hello, Git!
+Second line
```

```bash
git add hello.txt
git commit -m "Add second line to hello.txt"
git log --oneline
```

**Expected output:**
```
def5678 Add second line to hello.txt
abc1234 Initial commit: add hello.txt
```

---

**1h. Undo changes**

Discard unstaged changes:
```bash
echo "Mistake" >> hello.txt
git checkout -- hello.txt    # or: git restore hello.txt
```

Unstage a file:
```bash
echo "Another change" >> hello.txt
git add hello.txt
git reset HEAD hello.txt     # or: git restore --staged hello.txt
git checkout -- hello.txt
```

---

## Exercise 2

### Branching: create branches, switch between them, observe files differ between branches, view branch graph

**2a. List and create branches**

**Answer:**

```bash
git branch
# Output: * main

git branch feature
git checkout feature
# Or: git checkout -b feature

git branch
# Output:
# * feature
#   main
```

---

**2b. Make changes on the feature branch**

```bash
echo "Feature code" > feature.txt
git add feature.txt
git commit -m "Add feature.txt"
```

---

**2c. Switch back to main and verify**

```bash
git checkout main
ls
```

**Expected output:**
```
hello.txt
```

`feature.txt` does NOT exist on main.

---

**2d. View branch graph**

```bash
git log --oneline --graph --all
```

**Expected output:**
```
* ghi9012 (feature) Add feature.txt
* def5678 (HEAD -> main) Add second line to hello.txt
* abc1234 Initial commit: add hello.txt
```

---

## Exercise 3

### Merging: fast-forward merges, three-way merges, resolve merge conflicts

**3a. Fast-forward merge**

**Answer:**

```bash
git checkout main
git merge feature
```

**Expected output:**
```
Fast-forward
 feature.txt | 1 +
 1 file changed, 1 insertion(+)
```

---

**3b. Three-way merge (diverging history)**

```bash
git checkout -b feature-b
echo "Feature B content" > feature-b.txt
git add feature-b.txt
git commit -m "Add feature-b.txt"

git checkout main
echo "Main change" >> hello.txt
git add hello.txt
git commit -m "Update hello on main"

git merge feature-b
```

**Expected output:**
```
Merge made by the 'ort' strategy.
```

```bash
git log --oneline --graph --all
```

**Expected output:**
```
*   jkl3456 (HEAD -> main) Merge branch 'feature-b'
|\
| * mno7890 (feature-b) Add feature-b.txt
* | pqr1234 Update hello on main
|/
* ghi9012 (feature) Add feature.txt
...
```

---

**3c. Create and resolve a merge conflict**

```bash
git checkout main
echo "Main version" > shared.txt
git add shared.txt
git commit -m "Add shared.txt on main"

git checkout -b conflict-branch
echo "Conflict version" > shared.txt
git add shared.txt
git commit -m "Add shared.txt on conflict-branch"

git checkout main
git merge conflict-branch
```

**Expected output:**
```
CONFLICT (content): Merge conflict in shared.txt
```

```bash
cat shared.txt
```

**Expected content:**
```
<<<<<<< HEAD
Main version
=======
Conflict version
>>>>>>> conflict-branch
```

Resolve by editing the file:
```
Main and Conflict version combined
```

```bash
git add shared.txt
git commit -m "Resolve merge conflict in shared.txt"
```

---

## Exercise 4

### Remotes: add remote repository, push local branches, fetch and pull updates, collaborative work

**4a. Add remote and push**

**Answer:**

```bash
git remote add origin https://gitlab.insa-rennes.fr/user/repo.git
git remote -v
```

**Expected output:**
```
origin  https://gitlab.insa-rennes.fr/user/repo.git (fetch)
origin  https://gitlab.insa-rennes.fr/user/repo.git (push)
```

```bash
git push -u origin main
```

---

**4b. Collaborative Pokemon Git TP**

```bash
# Clone shared repository
git clone https://gitlab.insa-rennes.fr/3info-2025-2026/tp-pokegit-iti-3info.git
cd tp-pokegit-iti-3info

# Create working branch
git checkout -b mon-pokemon

# Add your Pokemon image
cp ~/pikachu.png pokemon/
git add pokemon/pikachu.png
git commit -m "Add Pikachu"

# Push branch
git push -u origin mon-pokemon

# After merge request is accepted, update local main
git checkout main
git pull origin main
```

---

**4c. Handling conflicts in collaborative work**

```bash
# Always pull before pushing
git pull origin main

# If conflict:
# 1. Edit conflicted files (remove markers)
# 2. git add <resolved files>
# 3. git commit
# 4. git push
```

---

## Git Commands Summary

```bash
# Setup
git init                    # New repository
git clone <url>             # Clone existing
git config --global ...     # Configure

# Daily use
git status                  # What's changed?
git add <file>              # Stage for commit
git commit -m "msg"         # Save snapshot
git log --oneline --graph   # View history
git diff                    # Unstaged changes
git diff --staged           # Staged changes

# Branching
git branch                  # List branches
git branch <name>           # Create branch
git checkout <name>         # Switch branch
git checkout -b <name>      # Create + switch
git merge <name>            # Merge into current branch

# Remotes
git remote add origin <url> # Add remote
git push -u origin <branch> # First push
git pull                    # Fetch + merge
git fetch                   # Download only

# Undo
git checkout -- <file>      # Discard unstaged changes
git restore <file>          # Modern equivalent
git reset HEAD <file>       # Unstage
git reset --soft HEAD~1     # Undo last commit (keep changes)
git revert <commit>         # New commit undoing changes
git stash                   # Save changes temporarily
git stash pop               # Restore stashed changes
```
