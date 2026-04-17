---
title: "ITI - Introduction aux Techniques de l'Ingenieur"
sidebar_position: 0
---

# ITI - Introduction aux Techniques de l'Ingenieur

## Course Overview

ITI (Introduction aux Techniques de l'Ingenieur) is a 3rd-year practical engineering course at INSA Rennes that covers the foundational tools and techniques every computer science engineer needs. The course is divided into two major parts:

- **FUS (Fonctions et Utilisation des Systemes)** -- System-level programming and Unix/Linux tools
- **LDS (Langages De Script)** -- Scripting languages (Python) and application development

This course is hands-on: almost every session is a lab (TP) or a guided tutorial (TD). The exam heavily tests shell commands, regular expressions, and scripting.

## Course Structure

### FUS Series (Systems & Tools) -- Semester 1

| Session | Topic | Type | Key Skills |
|---------|-------|------|------------|
| CM1 | Introduction to ITI | Lecture | Course overview, Linux basics |
| CM2 | Shell scripting | Lecture | Bash syntax, commands |
| CM3 | Build systems & Makefile | Lecture | Compilation, dependencies |
| CM4 | File systems | Lecture | Inodes, FAT, ext4 |
| CM5 | Processes | Lecture | Process management, signals |
| TD1 | Linux intro & Jupyter | Tutorial | Navigation, basic commands |
| TP1 | Shell basics | Lab | echo, cat, wc, grep, pipes |
| TP2 | Advanced shell scripting | Lab | Arguments, loops, functions |
| TP3 | Makefile | Lab | gcc, make, dependencies |
| TP4 | Debugging (gdb, valgrind) | Lab | Breakpoints, memory analysis |
| TD5 | Libraries & Makefile 2 | Tutorial | Static/dynamic libraries |
| TD6 | Inodes & FAT | Tutorial | File system internals |
| TP7 | File system exploration | Lab | Linux filesystem manipulation |
| TD8 | grep & regex | Tutorial | Regular expressions |
| Git Session 1 | Learn Git Branching | Lab | Git fundamentals |
| Git Session 2 | Pokemon Git & GitLab | Lab | Collaborative workflows |

### LDS Series (Scripting & Applications) -- Semester 2

| Session | Topic | Key Skills |
|---------|-------|------------|
| TP8 | Python basics & sorting | Syntax, OOP, algorithms |
| TP9 | Qt GUI programming | PyQt5, signals/slots, layouts |
| TP10 | SQLite databases | SQL, Python sqlite3, CRUD |
| TP11 | Web scraping | BeautifulSoup, urllib, HTML parsing |
| TP12 | Process automation | File I/O, subprocess, argparse |

## Exams

The course has two separate exams:

1. **November Exam (FUS/ITI)** -- Covers shell, Makefile, file systems, debugging, grep/regex
2. **January Exam (LDS)** -- Covers Python, Qt, SQL, web scraping, automation

The November exam is especially focused on shell commands and regular expressions. The January exam tests Python scripting with applied problems.

## How to Use This Guide

| Section | Purpose |
|---------|---------|
| [Shell & Bash](/S5/ITI/guide/shell-bash) | Commands, piping, scripting -- the backbone of the FUS exam |
| [Regular Expressions](/S5/ITI/guide/regex) | Syntax, patterns, grep/sed/awk -- exam staple |
| [Build Tools](/S5/ITI/guide/build-tools) | Make, gcc, compilation pipeline |
| [Debugging](/S5/ITI/guide/debugging) | gdb, valgrind, profiling with gprof |
| [Git Version Control](/S5/ITI/guide/git) | All git commands and workflows |
| [Python Basics](/S5/ITI/guide/python-basics) | Syntax, data structures, OOP, sorting |
| [SQL & SQLite](/S5/ITI/guide/sql-sqlite) | Queries, joins, Python integration |
| [Qt GUI Programming](/S5/ITI/guide/qt-gui) | PyQt5 widgets, signals/slots, image processing |
| [Web Scraping](/S5/ITI/guide/web-scraping) | BeautifulSoup, HTML parsing, automation |

## Key Exam Topics (Priority Order)

1. **Shell commands & scripting** -- Appears in nearly every FUS exam
2. **Regular expressions** -- grep patterns, sed substitutions
3. **Makefile** -- Writing rules, understanding dependencies
4. **File systems** -- Inodes, FAT tables, links
5. **Python** -- Classes, sorting, file processing
6. **SQL** -- Queries, joins, schema design
7. **Git** -- Branching, merging, conflict resolution
