---
title: "LDS4 - Web Scraping (BeautifulSoup)"
sidebar_position: 11
---

# LDS4 - Web Scraping (BeautifulSoup)

## Learning Objectives

Extract and parse data from web pages:

- Understand HTML structure and DOM
- Parse HTML with BeautifulSoup
- Extract data using CSS selectors
- Handle web requests with urllib
- Process and store scraped data
- Build a practical DVD database application

## Core Concepts

### 1. HTML Basics

HTML (HyperText Markup Language) structures web content:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>Heading</h1>
    <p class="description">Paragraph text</p>
    <div id="container">
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    </div>
</body>
</html>
```

**Key concepts**:
- **Tags**: `<tag>content</tag>`
- **Attributes**: `<tag attribute="value">`
- **Classes**: `class="classname"` (can have multiple)
- **IDs**: `id="unique-id"` (must be unique)
- **Nesting**: Tags inside tags (tree structure)

### 2. BeautifulSoup

Python library for parsing HTML/XML:

```python
from bs4 import BeautifulSoup

# Parse HTML string
html = "<html><body><h1>Title</h1></body></html>"
soup = BeautifulSoup(html, 'html.parser')

# Parse from file
with open('page.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')
```

### 3. Finding Elements

```python
# Find first matching element
h1 = soup.find('h1')
div = soup.find('div', class_='content')
elem = soup.find(id='main')

# Find all matching elements
paragraphs = soup.find_all('p')
links = soup.find_all('a')
divs = soup.find_all('div', class_='item')

# CSS selectors
soup.select('div.item')           # <div class="item">
soup.select('#main')              # <div id="main">
soup.select('div > p')            # <p> directly inside <div>
soup.select('div p')              # <p> anywhere inside <div>
soup.select('[href]')             # Elements with href attribute
```

### 4. Extracting Data

```python
# Get element text
text = elem.get_text()
text = elem.string

# Get attributes
url = link['href']
url = link.get('href')
classes = div['class']  # Returns list

# Navigate tree
parent = elem.parent
children = list(elem.children)
siblings = list(elem.next_siblings)
```

### 5. Web Requests

```python
from urllib.request import urlopen

# Fetch web page
url = "https://example.com/page"
response = urlopen(url)
html = response.read().decode('utf-8')

# Parse
soup = BeautifulSoup(html, 'html.parser')
```

**Note**: For production, use `requests` library instead of `urllib`.

### 6. Error Handling

```python
try:
    response = urlopen(url)
    soup = BeautifulSoup(response, 'html.parser')
    
    element = soup.find('div', class_='content')
    if element is None:
        print("Element not found")
    else:
        text = element.get_text(strip=True)
        
except URLError as e:
    print(f"Network error: {e}")
except Exception as e:
    print(f"Parsing error: {e}")
```

## Exercises Overview

### Exercise 1: Parse DVD Information
Extract DVD details from DVDFr.com HTML pages.

**Data to extract**:
- Title
- Director
- Release year
- Genre
- Rating
- Cover image URL
- Synopsis

**Files**: Sample HTML files included

### Exercise 2: EAN13 Barcode Processing
Work with EAN13 barcodes for DVDs.

**Concepts**:
- Barcode format and validation
- Checksum calculation
- Database lookup by barcode

**Files**: `ean13.py`, `codesBarresSA.csv`

### Exercise 3: Database Integration
Store scraped DVD data in SQLite database.

**Schema**:
```sql
CREATE TABLE dvds (
    id INTEGER PRIMARY KEY,
    ean TEXT UNIQUE,
    title TEXT,
    director TEXT,
    year INTEGER,
    genre TEXT,
    rating REAL
);
```

**Files**: `bdDVD.py`, `BDRegMat.py`

### Exercise 4: Complete DVD Library Application
Build application that:
- Searches DVDs by title or barcode
- Scrapes data from web
- Stores in database
- Displays collection with Qt GUI

**Files**: `dvdtheque.py`, `parserWeb.py`

## Solutions

See `src/` directory and original files:
- `parserWeb.py` - Web scraping functions
- `ean13.py` - Barcode handling
- `bdDVD.py` - Database operations
- `dvdtheque.py` - Complete application

## Key Takeaways

1. **Inspect before scraping** - Use browser dev tools to understand structure
2. **Web pages change** - Scraping code breaks when sites update
3. **Respect robots.txt** - Check if scraping is allowed
4. **Rate limiting** - Don't overwhelm servers with requests
5. **CSS selectors are powerful** - More flexible than tag names

## Common Patterns

### Basic Scraping Template
```python
from bs4 import BeautifulSoup
from urllib.request import urlopen

def scrape_page(url):
    try:
        response = urlopen(url)
        soup = BeautifulSoup(response, 'html.parser')
        
        # Extract data
        title = soup.find('h1', class_='title').get_text(strip=True)
        items = soup.find_all('div', class_='item')
        
        results = []
        for item in items:
            name = item.find('span', class_='name').get_text()
            price = item.find('span', class_='price').get_text()
            results.append({'name': name, 'price': price})
        
        return results
    except Exception as e:
        print(f"Error: {e}")
        return []
```

### Table Parsing
```python
def parse_table(soup):
    table = soup.find('table', class_='data')
    rows = []
    
    for tr in table.find_all('tr')[1:]:  # Skip header row
        cells = tr.find_all('td')
        row = [cell.get_text(strip=True) for cell in cells]
        rows.append(row)
    
    return rows
```

### Link Extraction
```python
def extract_links(soup, base_url):
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

## Common Pitfalls

1. **Not handling None** - find() returns None if not found
2. **Wrong parser** - Use 'html.parser', not 'lxml' unless installed
3. **Forgetting strip=True** - get_text() includes whitespace
4. **Not checking attributes exist** - Use .get() for safe access
5. **Encoding issues** - Specify encoding when reading files
6. **Dynamic content** - BeautifulSoup can't handle JavaScript-rendered content

## Further Reading

- BeautifulSoup Documentation: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- CSS Selectors: https://www.w3schools.com/cssref/css_selectors.asp
- Requests library: Better alternative to urllib
- Selenium: For JavaScript-heavy sites
- Scrapy: Full-featured scraping framework
- Web scraping ethics and legality

## EAN13 Barcode Format

EAN13 is 13-digit barcode standard:
```
[Country][Manufacturer][Product][Checksum]
3333329930413
 ^^^  ^^^^^  ^^^^  ^
```

**Checksum calculation**:
1. Sum odd positions (1st, 3rd, 5th...)
2. Sum even positions × 3
3. Add sums
4. Checksum = (10 - (sum % 10)) % 10

```python
def validate_ean13(code):
    if len(code) != 13 or not code.isdigit():
        return False
    
    odd_sum = sum(int(code[i]) for i in range(0, 12, 2))
    even_sum = sum(int(code[i]) for i in range(1, 12, 2))
    total = odd_sum + even_sum * 3
    checksum = (10 - (total % 10)) % 10
    
    return checksum == int(code[12])
```

## Web Scraping Ethics

1. **Check robots.txt** - Respect site's scraping policy
2. **Rate limit requests** - Don't overload servers
3. **Identify your bot** - Use proper User-Agent header
4. **Cache responses** - Don't re-fetch unnecessarily
5. **Respect copyright** - Don't republish scraped content
6. **Check terms of service** - Some sites prohibit scraping

## Handling Dynamic Content

BeautifulSoup only parses static HTML. For JavaScript-rendered content:

```python
# Option 1: Use Selenium (loads JavaScript)
from selenium import webdriver
driver = webdriver.Chrome()
driver.get(url)
html = driver.page_source
soup = BeautifulSoup(html, 'html.parser')

# Option 2: Find API endpoint used by site
# Inspect network traffic in browser dev tools
# Make direct API requests instead of scraping HTML
```
