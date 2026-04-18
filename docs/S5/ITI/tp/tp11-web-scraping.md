---
title: "LDS4 - Web Scraping (BeautifulSoup)"
sidebar_position: 11
---

# LDS4 - Web Scraping (BeautifulSoup)

## Objectifs pedagogiques

Extraire et analyser des donnees de pages web :

- Comprendre la structure HTML et le DOM
- Analyser le HTML avec BeautifulSoup
- Extraire des donnees avec les selecteurs CSS
- Gerer les requetes web avec urllib
- Traiter et stocker les donnees recuperees
- Construire une application pratique de DVDtheque

## Concepts fondamentaux

### 1. Bases du HTML

Le HTML (HyperText Markup Language) structure le contenu web :

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

**Concepts cles** :
- **Tags**: `<tag>content</tag>`
- **Attributes**: `<tag attribute="value">`
- **Classes** : `class="classname"` (can have multiple)
- **IDs**: `id="unique-id"` (must be unique)
- **Nesting**: Tags inside tags (tree structure)

### 2. BeautifulSoup

Bibliotheque Python pour analyser le HTML/XML :

```python noexec
from bs4 import BeautifulSoup

# Parse HTML string
html = "<html><body><h1>Title</h1></body></html>"
soup = BeautifulSoup(html, 'html.parser')

# Parse from file
with open('page.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')
```

### 3. Trouver des elements

```python noexec
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

### 4. Extraire des donnees

```python noexec
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

### 5. Requetes web

```python noexec
from urllib.request import urlopen

# Fetch web page
url = "https://example.com/page"
response = urlopen(url)
html = response.read().decode('utf-8')

# Parse
soup = BeautifulSoup(html, 'html.parser')
```

**Note** : For production, use `requests` library instead of `urllib`.

### 6. Gestion des erreurs

```python noexec
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

## Apercu des exercices

### Exercice 1 : Analyser les informations de DVD
Extraire les details des DVD depuis les pages HTML de DVDFr.com.

**Donnees a extraire** :
- Title
- Director
- Release year
- Genre
- Rating
- Cover image URL
- Synopsis

**Fichiers** : Sample HTML files included

### Exercice 2 : Traitement des codes-barres EAN13
Travailler avec les codes-barres EAN13 pour les DVD.

**Concepts** :
- Barcode format and validation
- Checksum calculation
- Database lookup by barcode

**Fichiers** : `ean13.py`, `codesBarresSA.csv`

### Exercice 3 : Integration base de donnees
Stocker les donnees de DVD recuperees dans une base de donnees SQLite.

**Schema** :
```sql noexec
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

**Fichiers** : `bdDVD.py`, `BDRegMat.py`

### Exercice 4 : Application complete de DVDtheque
Construire une application qui :
- Searches DVDs by title or barcode
- Scrapes data from web
- Stores in database
- Displays collection with Qt GUI

**Fichiers** : `dvdtheque.py`, `parserWeb.py`

## Solutions

See `src/` directory and original files:
- `parserWeb.py` - Fonctions de web scraping
- `ean13.py` - Gestion des codes-barres
- `bdDVD.py` - Operations de base de donnees
- `dvdtheque.py` - Application complete

## Points cles a retenir

1. **Inspecter avant de scraper** - Utiliser les outils de developpement du navigateur pour comprendre la structure
2. **Les pages web changent** - Le code de scraping casse quand les sites sont mis a jour
3. **Respecter robots.txt** - Verifier si le scraping est autorise
4. **Limiter le debit** - Ne pas submerger les serveurs de requetes
5. **Les selecteurs CSS sont puissants** - Plus flexibles que les noms de balises

## Motifs courants

### Modele de scraping basique
```python noexec
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

### Analyse de tableaux
```python noexec
def parse_table(soup):
    table = soup.find('table', class_='data')
    rows = []
    
    for tr in table.find_all('tr')[1:]:  # Skip header row
        cells = tr.find_all('td')
        row = [cell.get_text(strip=True) for cell in cells]
        rows.append(row)
    
    return rows
```

### Extraction de liens
```python noexec
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

## Erreurs courantes

1. **Ne pas gerer None** - find() retourne None si rien n'est trouve
2. **Mauvais analyseur** - Utiliser 'html.parser', pas 'lxml' sauf s'il est installe
3. **Oublier strip=True** - get_text() inclut les espaces
4. **Ne pas verifier l'existence des attributs** - Utiliser .get() pour un acces securise
5. **Problemes d'encodage** - Specifier l'encodage lors de la lecture de fichiers
6. **Contenu dynamique** - BeautifulSoup ne peut pas gerer le contenu rendu par JavaScript

## Pour aller plus loin

- BeautifulSoup Documentation: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- CSS Selectors: https://www.w3schools.com/cssref/css_selectors.asp
- Requests library: Better alternative to urllib
- Selenium: For JavaScript-heavy sites
- Scrapy: Full-featured scraping framework
- Web scraping ethics and legality

## Format de code-barres EAN13

EAN13 is 13-digit barcode standard:
```
[Country][Manufacturer][Product][Checksum]
3333329930413
 ^^^  ^^^^^  ^^^^  ^
```

**Calcul du checksum** :
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

## Ethique du web scraping

1. **Verifier robots.txt** - Respecter la politique de scraping du site
2. **Limiter le debit des requetes** - Ne pas surcharger les serveurs
3. **Identifier votre bot** - Utiliser un en-tete User-Agent correct
4. **Mettre en cache les reponses** - Ne pas re-telecharger inutilement
5. **Respecter le droit d'auteur** - Ne pas republier le contenu recupere
6. **Verifier les conditions d'utilisation** - Certains sites interdisent le scraping

## Gestion du contenu dynamique

BeautifulSoup n'analyse que le HTML statique. Pour le contenu rendu par JavaScript :

```python noexec
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
