---
title: "TP1 - Shell for Security: File Analysis"
sidebar_position: 1
---

# TP1 - Shell for Security: File Analysis

## Objective

Analyze a security-sensitive data file (.prep) to identify vulnerabilities, extract metrics, and search for security elements like passwords, credentials, and obfuscated data.

## Assignment

**File**: TP-Shell-1.pdf

**Tasks**:
1. Select a random file from prep.zip
2. Evaluate content (file type, structure, language)
3. Calculate metrics (line count, character frequencies, structural elements)
4. Search for security elements (passwords, credentials, admin URLs, obfuscated data)
5. Document findings with shell commands

**Constraints**:
- Use shell commands only (no Python scripts except for calculations)
- Focus on literal string searches (fgrep) not regex
- No binary files provided

## Solution

**File analyzed**: `pixgame.html.prep` (WordPress site homepage)

**Results**: `resultat-GONZALEZ.txt`

### Key Findings

#### 1. File Metrics
- **Type**: UTF-8 HTML file with very long lines
- **Size**: 656,028 bytes
- **Lines**: 16,368 total, 14,289 non-empty
- **Longest line**: 32,083 characters (line 9825, filled with 'x')
- **Average line length**: ~44 characters

#### 2. HTML Structure
Most frequent tags:
- `<div>`: 794 occurrences
- `<span>`: 355
- `<a>`: 310 (links)
- `<script>`: 63
- `<form>`: 2 (search forms)

#### 3. Security Vulnerabilities Found

**Critical: WordPress Admin Credentials Exposed**
- Location: Line 127 in `twdGlobal` JavaScript object
- Exposed data:
  - WordPress admin panel URL
  - **Authentication nonce** for REST API
  - REST API endpoint URL
  - Permalink format

**Impact**: The nonce allows API authentication without credentials. Even if rotated per session, exposing it to all site visitors is a critical security flaw.

**Plaintext Passwords Found**:
- Line 830: `password=ohsuo6xae7Th`
- Lines 1469-1471: `Mot de Passe\nip6ooja6Eize`
- Lines 6779, 6781: `Login\naiv1Xaet4vee`
- Lines 2554, 2557: `va5eijih9OPe\nCREDential`
- Lines 6889, 8691: `temporary\neich7So5xo4a`

**Obfuscated JavaScript Attributes**:
- Lines 2563-2564: Base64-encoded CSS/font configurations in `tdc_css` and `f_article_font_size` attributes
- Lines 3765, 3770-3772, 3784-3788: More Base64-encoded JSON structures
- All decode to benign formatting data (JSON with margins, font sizes)

### Shell Commands Used

```bash
# File type and encoding
file pixgame.html.prep
stat pixgame.html.prep

# Line count (total and non-empty)
wc -l pixgame.html.prep
cat pixgame.html.prep | grep -v '^\s*$' | wc -l

# Calculate longest line length
cat pixgame.html.prep | grep -v '^\s*$' | awk '{ print length }' | \
  python -c "print(max([int(input()) for _ in range(14289)]))"

# Tag frequency analysis
cat pixgame.html.prep | grep -v '^\s*$' | sed 's/</ </g' | sed 's/>/> /g' | \
  tr ' ' '\n' | grep '^<[^!/]' | cut -b '2-' | sed 's/>//g' | \
  sort | uniq -c | sort -nr

# Search for admin credentials
grep "admin" pixgame.html.prep -n

# Search for password-related strings
grep -i "password\|login\|credential" pixgame.html.prep -n

# Decode Base64 obfuscated content
grep -o 'ey.*=' pixgame.html.prep | base64 -d
```

## Lessons Learned

1. **Client-side exposure**: Never embed authentication tokens (nonces, API keys) in client-side JavaScript
2. **Password storage**: Plaintext passwords in HTML are catastrophic - use proper authentication systems
3. **Obfuscation ≠ Security**: Base64 encoding is not encryption; it provides no security
4. **Surface area analysis**: Shell commands can quickly map attack surface (forms, scripts, external resources)
5. **WordPress security**: Default WordPress installations expose admin paths; hardening is essential

## Files

- `TP-Shell-1.pdf` - Assignment description
- `prep.zip` - Data files for analysis (19MB archive)
- `resultat-GONZALEZ.txt` - Complete analysis report (original submission)
