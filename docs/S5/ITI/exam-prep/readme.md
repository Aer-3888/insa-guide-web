---
title: "ITI Exam Preparation"
sidebar_position: 0
---

# ITI Exam Preparation

## Exam Structure

The ITI course has **two separate exams**:

### 1. FUS/ITI Exam (November)
- **Duration**: ~2 hours
- **Format**: Written, on paper
- **Topics**: Shell, Makefile, file systems, debugging, regex, grep
- **Past exams available**: 2012-2024 (FUS), 2026 (ITI)

### 2. LDS Exam (January)
- **Duration**: ~2 hours
- **Format**: Written, on paper
- **Topics**: Python, Qt, SQL, web scraping, automation
- **Past exams available**: 2016-2025 (LDS), 2026 (ITI)

## Exam Archive Inventory

### November Exams (FUS / Systems)

| Year | Subject | Corrections Available |
|------|---------|----------------------|
| 2012 | FUS 2012-2013 | No |
| 2013 | FUS 2013-2014 | Yes (partial, Ivan Leplumey) |
| 2014 | FUS 2014-2015 | No |
| 2015 | FUS 2015-2016 | Yes (multiple student corrections) |
| 2016 | FUS 2016-2017 | Yes (student correction) |
| 2017 | FUS 2017 | Yes (student correction) |
| 2018 | FUS 2018 | Yes (student correction) |
| 2019 | FUS 2019 | Yes (student correction) |
| 2020 | FUS 2020 | Yes (student correction) |
| 2021 | FUS 2021 | Yes (student correction) |
| 2022 | FUS 2022 | Subject only |
| 2023 | FUS 2023 | Subject only |
| 2024 | FUS 2024 | Subject only |

### January Exams (LDS / Scripting)

| Year | Subject | Corrections Available |
|------|---------|----------------------|
| 2016 | LDS 2016 | Yes (student correction) |
| 2017 | LDS 2017 | Yes (student correction) |
| 2018 | LDS 2018 | Yes (student corrections) |
| 2019 | LDS 2019 | Yes (multiple student corrections) |
| 2020 | LDS 2020 | Yes (multiple student corrections) |
| 2022 | LDS 2022 | Yes (official solution) |
| 2023 | LDS 2023 | Yes (student correction) |
| 2024 | LDS 2024 | Yes (student correction) |
| 2025 | LDS 2025 | Subject only |
| 2026 | ITI 2026 | Yes (student corrections) |

## Topic Analysis by Exam

### FUS/ITI Exam (November) -- Typical Question Types

Based on analysis of 13 years of exams, the most common topics are:

#### 1. Shell Commands & Scripting (appears in ~95% of exams)
- **Writing shell scripts**: Variables, loops, conditionals, functions
- **Pipe chains**: Combining grep, sed, awk, sort, uniq, wc
- **File operations**: Testing with `-f`, `-d`, `-r`, `-x`
- **Command output prediction**: "What does this command produce?"
- **Script debugging**: "Find the error in this script"

**Typical question format:**
> Write a bash script that takes a directory as argument and lists all `.c` files, showing the number of lines in each.

#### 2. Regular Expressions & grep (appears in ~90% of exams)
- **Pattern writing**: "Write a regex that matches..."
- **grep command construction**: Using flags `-i`, `-v`, `-c`, `-n`, `-E`
- **sed substitution**: Writing `sed 's/.../.../'` commands
- **Pattern analysis**: "Which lines does this grep match?"

**Typical question format:**
> Write a grep command that extracts all lines containing an email address from a file.

#### 3. Makefile (appears in ~80% of exams)
- **Writing Makefile rules**: Target, dependencies, commands
- **Understanding automatic variables**: `$@`, `$<`, `$^`
- **Determining build order**: "Which files are recompiled if X changes?"
- **Pattern rules**: `%.o: %.c`
- **Tab vs spaces**: Understanding the TAB requirement

**Typical question format:**
> Given these source files and their dependencies, write a complete Makefile.

#### 4. File Systems (appears in ~70% of exams)
- **Inode structure**: How files are stored on disk
- **FAT table**: File Allocation Table traversal
- **Hard links vs symbolic links**: Differences and inode implications
- **Directory structure**: How directories reference inodes

**Typical question format:**
> Given this FAT table, trace the blocks belonging to file X.

#### 5. GCC Compilation (appears in ~60% of exams)
- **Compilation phases**: Preprocessing, compilation, assembly, linking
- **Flag meanings**: `-c`, `-o`, `-g`, `-Wall`, `-O2`, `-pg`, `-E`
- **Dependency analysis**: "If we change header.h, what must be recompiled?"

#### 6. GDB Debugging (appears in ~40% of exams)
- **Setting breakpoints**: `break function`, `break file:line`
- **Stepping**: `next`, `step`, `continue`, `finish`
- **Variable inspection**: `print`, `info locals`, `backtrace`

### LDS Exam (January) -- Typical Question Types

#### 1. Python Programming (appears in ~100% of exams)
- **Class definitions**: `__init__`, methods, `self`
- **List operations**: Comprehensions, slicing, sorting
- **File I/O**: Reading/writing files with `open()`
- **String manipulation**: split, join, replace, format
- **Algorithm implementation**: Sorting, searching, data processing

#### 2. SQL Queries (appears in ~80% of exams)
- **SELECT with conditions**: WHERE, ORDER BY, LIMIT
- **JOIN operations**: INNER JOIN, LEFT JOIN
- **Aggregate functions**: COUNT, AVG, SUM, GROUP BY
- **INSERT, UPDATE, DELETE**: CRUD operations
- **Schema design**: CREATE TABLE with constraints

#### 3. Qt/PyQt (appears in ~60% of exams)
- **Widget hierarchy**: QWidget, QMainWindow, layouts
- **Signals and slots**: `clicked.connect(function)`
- **Image handling**: QImage pixel access and manipulation
- **QTableView with QSqlTableModel**: Display database data

#### 4. Web Scraping (appears in ~50% of exams)
- **BeautifulSoup**: find(), find_all(), get_text()
- **CSS selectors**: Tag, class, id selection
- **HTML structure understanding**: DOM tree navigation
- **Data extraction patterns**: Tables, links, forms

## Exam Strategy

### Time Management

- **Read the entire exam first** (5 min)
- **Answer what you know immediately** -- shell and regex questions first
- **Allocate time proportionally** to point values
- **Leave time to review** (10 min)

### Common Point Distributions (FUS Exam)

| Topic | Approximate Weight |
|-------|-------------------|
| Shell scripting | 25-35% |
| Regex / grep | 20-25% |
| Makefile | 15-20% |
| File systems | 10-15% |
| GCC / Compilation | 5-10% |
| GDB / Debugging | 5-10% |

### Study Priority (FUS)

1. **HIGH PRIORITY**: Shell commands, piping, scripting, regex, grep
2. **MEDIUM PRIORITY**: Makefile, file system concepts, GCC flags
3. **LOWER PRIORITY**: GDB commands, valgrind, gprof

### Study Priority (LDS)

1. **HIGH PRIORITY**: Python classes, list operations, file I/O
2. **MEDIUM PRIORITY**: SQL queries (SELECT, JOIN, GROUP BY)
3. **LOWER PRIORITY**: Qt widgets, web scraping

### Key Exam Tips

1. **Syntax matters**: Exams require exact command syntax (no IDE autocomplete)
2. **Quote your variables**: Always write `"$var"` not `$var` in shell
3. **TABs in Makefiles**: Mention this explicitly if asked about Makefile rules
4. **Test operators**: Know the difference between `-eq` (numeric) and `=` (string)
5. **Regex escaping**: Know which characters need `\` to be literal
6. **Python indentation**: Crucial on paper -- use consistent indentation
7. **SQL semicolons**: End SQL statements with `;`
8. **Error handling**: Always mention checking for errors (file exists, arguments valid)

## Quick Reference for Exam Day

See the cheat sheets at the end of each topic guide:
- [Shell & Bash Cheat Sheet](/S5/ITI/guide/shell-bash#cheat-sheet)
- [Regex Cheat Sheet](/S5/ITI/guide/regex#cheat-sheet)
- [Build Tools Cheat Sheet](/S5/ITI/guide/build-tools#cheat-sheet)
- [Debugging Cheat Sheet](/S5/ITI/guide/debugging#cheat-sheet)
- [Git Cheat Sheet](/S5/ITI/guide/git#cheat-sheet)
- [Python Cheat Sheet](/S5/ITI/guide/python-basics#cheat-sheet)
- [SQL Cheat Sheet](/S5/ITI/guide/sql-sqlite#cheat-sheet)
- [Qt GUI Cheat Sheet](/S5/ITI/guide/qt-gui#cheat-sheet)
- [Web Scraping Cheat Sheet](/S5/ITI/guide/web-scraping#cheat-sheet)

## Practice Approach

### For FUS Exam
1. Do all past FUS exams from 2015-2024 (most relevant)
2. Practice writing shell scripts on paper (no computer)
3. Write grep/sed/awk commands from memory
4. Draw Makefile dependency trees
5. Trace inode and FAT table exercises

### For LDS Exam
1. Do all past LDS exams from 2018-2025
2. Practice Python class definitions on paper
3. Write SQL queries without running them
4. Know the BeautifulSoup API: find, find_all, get_text, CSS selectors
5. Practice writing Qt signal/slot connections
