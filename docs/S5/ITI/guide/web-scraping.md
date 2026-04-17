---
title: "Web Scraping"
sidebar_position: 10
---

# Web Scraping

## Overview

Web scraping is the automated extraction of data from web pages. The LDS course uses Python with BeautifulSoup to parse HTML and extract structured data. The course project involves building a DVD library application that scrapes data from web pages and stores it in SQLite.

## HTML Fundamentals

### Document Structure

```html
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>Main Heading</h1>
    <p class="description">A paragraph</p>
    <div id="content">
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
        <a href="https://example.com">Link</a>
    </div>
    <table>
        <tr><th>Name</th><th>Age</th></tr>
        <tr><td>Alice</td><td>20</td></tr>
    </table>
</body>
</html>
```

### Key HTML Concepts

- **Tags**: `<tag>content</tag>` (opening and closing)
- **Attributes**: `<tag attribute="value">`
- **class**: `class="name"` -- can appear on multiple elements (CSS styling)
- **id**: `id="unique"` -- must be unique in document
- **Nesting**: Tags inside tags form a tree (DOM tree)
- **Self-closing**: `<img src="..." />`, `<br />`

### Common Tags

| Tag | Purpose |
|-----|---------|
| `<h1>` to `<h6>` | Headings |
| `<p>` | Paragraph |
| `<a href="...">` | Hyperlink |
| `<img src="...">` | Image |
| `<div>` | Division (block container) |
| `<span>` | Inline container |
| `<ul>`, `<ol>`, `<li>` | Lists |
| `<table>`, `<tr>`, `<td>` | Tables |
| `<form>`, `<input>` | Forms |

## BeautifulSoup

### Setup and Parsing

```python
from bs4 import BeautifulSoup

# Parse HTML string
html = "<html><body><h1>Title</h1></body></html>"
soup = BeautifulSoup(html, 'html.parser')

# Parse from file
with open('page.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Parse from web (see Web Requests section below)
```

### Finding Elements

```python
# find() -- returns FIRST match (or None)
h1 = soup.find('h1')
div = soup.find('div', class_='content')
elem = soup.find(id='main')
link = soup.find('a', href=True)          # Has href attribute

# find_all() -- returns LIST of all matches
paragraphs = soup.find_all('p')
links = soup.find_all('a')
divs = soup.find_all('div', class_='item')
items = soup.find_all(['h1', 'h2', 'h3'])  # Multiple tags
```

### CSS Selectors

```python
# select() returns list, select_one() returns first
soup.select('div.item')             # <div class="item">
soup.select('#main')                # <div id="main">
soup.select('div > p')              # <p> directly inside <div>
soup.select('div p')                # <p> anywhere inside <div>
soup.select('[href]')               # Elements with href attribute
soup.select('a[href^="https"]')     # href starting with https
soup.select('tr:nth-child(2)')      # Second <tr>
soup.select('div.a.b')             # <div class="a b">
```

### Extracting Data

```python
# Text content
text = elem.get_text()              # All text (including children)
text = elem.get_text(strip=True)    # Stripped whitespace
text = elem.string                   # Direct text (None if has children)

# Attributes
url = link['href']                   # Direct access (KeyError if missing)
url = link.get('href')              # Safe access (None if missing)
classes = div['class']               # Returns list of classes
src = img.get('src', '')            # With default

# Navigation
parent = elem.parent
children = list(elem.children)       # Direct children
descendants = list(elem.descendants) # All descendants
next_sib = elem.next_sibling
prev_sib = elem.previous_sibling
```

### Table Parsing

```python
def parse_table(soup):
    table = soup.find('table')
    rows = []
    
    for tr in table.find_all('tr')[1:]:   # Skip header row
        cells = tr.find_all('td')
        row = [cell.get_text(strip=True) for cell in cells]
        rows.append(row)
    
    return rows
```

### Link Extraction

```python
def extract_links(soup, base_url=""):
    links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        if href.startswith('/'):
            href = base_url + href
        links.append({
            'url': href,
            'text': a.get_text(strip=True)
        })
    return links
```

## Web Requests

### Using urllib

```python
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# Simple GET request
try:
    response = urlopen("https://example.com")
    html = response.read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
except HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
except URLError as e:
    print(f"URL Error: {e.reason}")
```

### With Custom Headers

```python
url = "https://example.com/page"
req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urlopen(req)
html = response.read().decode('utf-8')
```

### Using requests (preferred for production)

```python
import requests

response = requests.get("https://example.com")
response.raise_for_status()         # Raise on HTTP errors
soup = BeautifulSoup(response.text, 'html.parser')
```

## Complete Scraping Example

```python
from bs4 import BeautifulSoup
from urllib.request import urlopen

def scrape_dvd_info(url):
    """Scrape DVD information from a page."""
    try:
        response = urlopen(url)
        soup = BeautifulSoup(response, 'html.parser')
        
        # Extract title
        title_elem = soup.find('h1', class_='title')
        title = title_elem.get_text(strip=True) if title_elem else "Unknown"
        
        # Extract director
        director_elem = soup.find('span', class_='director')
        director = director_elem.get_text(strip=True) if director_elem else "Unknown"
        
        # Extract year
        year_elem = soup.find('span', class_='year')
        year = int(year_elem.get_text(strip=True)) if year_elem else None
        
        # Extract genre
        genre_elem = soup.find('span', class_='genre')
        genre = genre_elem.get_text(strip=True) if genre_elem else "Unknown"
        
        return {
            'title': title,
            'director': director,
            'year': year,
            'genre': genre
        }
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None
```

## EAN13 Barcode Handling

EAN13 is a 13-digit barcode standard used for products (including DVDs).

### Barcode Structure

```
3 3 3 3 3 2 9 9 3 0 4 1 3
[Country ] [Manufacturer] [Product] [Check]
```

### Checksum Validation

```python
def validate_ean13(code):
    """Validate EAN13 barcode checksum."""
    if len(code) != 13 or not code.isdigit():
        return False
    
    odd_sum = sum(int(code[i]) for i in range(0, 12, 2))
    even_sum = sum(int(code[i]) for i in range(1, 12, 2))
    total = odd_sum + even_sum * 3
    checksum = (10 - (total % 10)) % 10
    
    return checksum == int(code[12])
```

### Checksum Calculation

```python
def calculate_ean13_checksum(code_12):
    """Calculate checksum digit for 12-digit code."""
    odd_sum = sum(int(code_12[i]) for i in range(0, 12, 2))
    even_sum = sum(int(code_12[i]) for i in range(1, 12, 2))
    total = odd_sum + even_sum * 3
    return (10 - (total % 10)) % 10
```

## File I/O for Scraping

### Saving Scraped Data

```python
import json
import csv

# Save as JSON
def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Save as CSV
def save_csv(data, filename, headers):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
```

### Integrating with SQLite

```python
import sqlite3

def save_to_database(dvd_data, db_file='dvds.db'):
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS dvds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ean TEXT UNIQUE,
            title TEXT,
            director TEXT,
            year INTEGER,
            genre TEXT
        )
    """)
    
    cursor.execute(
        "INSERT OR IGNORE INTO dvds (ean, title, director, year, genre) VALUES (?, ?, ?, ?, ?)",
        (dvd_data['ean'], dvd_data['title'], dvd_data['director'],
         dvd_data['year'], dvd_data['genre'])
    )
    
    conn.commit()
    conn.close()
```

## Process Automation

### Running System Commands

```python
import subprocess

# Run command and capture output
result = subprocess.run(['ls', '-l'], capture_output=True, text=True)
print(result.stdout)
print(result.returncode)      # 0 = success

# Run shell command
result = subprocess.run('echo "Hello"', shell=True, capture_output=True, text=True)

# Check for errors
try:
    subprocess.run(['command'], check=True)
except subprocess.CalledProcessError as e:
    print(f"Failed: {e}")
```

### File Operations

```python
import os
import shutil
from pathlib import Path

# Directory operations
os.makedirs('path/to/dir', exist_ok=True)
os.listdir('.')

# File operations
shutil.copy('src.txt', 'dst.txt')
shutil.move('old.txt', 'new.txt')
os.remove('file.txt')

# Path manipulation (preferred)
path = Path('folder/file.txt')
path.name          # 'file.txt'
path.stem          # 'file'
path.suffix        # '.txt'
path.parent        # Path('folder')
path.exists()      # True/False

# Glob
for file in Path('.').glob('*.txt'):
    print(file)
for file in Path('.').rglob('*.py'):  # Recursive
    print(file)
```

### Batch Processing

```python
from pathlib import Path

def process_directory(input_dir, output_dir):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    for file in input_path.glob('*.html'):
        with open(file, 'r') as f:
            soup = BeautifulSoup(f, 'html.parser')
        # Process...
        output_file = output_path / f"{file.stem}.json"
        save_json(data, output_file)
```

## Ethics and Best Practices

1. **Check robots.txt** before scraping any site
2. **Rate limit** requests -- add delays between requests
3. **Set a User-Agent** header identifying your scraper
4. **Cache responses** -- do not re-fetch unchanged pages
5. **Respect terms of service** -- some sites prohibit scraping
6. **Handle errors gracefully** -- sites change their HTML structure

---

## CHEAT SHEET

### BeautifulSoup
```python
soup = BeautifulSoup(html, 'html.parser')

# Finding elements
soup.find('tag')                     First match
soup.find('div', class_='name')      By class
soup.find(id='myid')                 By ID
soup.find_all('tag')                 All matches
soup.select('div.class > p')        CSS selector

# Extracting data
elem.get_text(strip=True)           Text content
elem['attribute']                    Attribute value
elem.get('attr', default)           Safe attribute access

# Navigation
elem.parent, elem.children
elem.next_sibling, elem.previous_sibling
```

### Web Requests
```python
from urllib.request import urlopen
response = urlopen(url)
html = response.read().decode('utf-8')
```

### Common Patterns
```python
# Check for None before accessing
elem = soup.find('div')
if elem is not None:
    text = elem.get_text(strip=True)

# Table parsing
for tr in table.find_all('tr')[1:]:
    cells = [td.get_text(strip=True) for td in tr.find_all('td')]
```
