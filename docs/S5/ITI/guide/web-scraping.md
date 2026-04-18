---
title: "Web Scraping"
sidebar_position: 10
---

# Web Scraping

## Apercu

Le web scraping est l'extraction automatisee de donnees a partir de pages web. Le cours LDS utilise Python avec BeautifulSoup pour analyser le HTML et extraire des donnees structurees. Le projet du cours consiste a construire une application de DVDtheque qui recupere des donnees depuis des pages web et les stocke dans SQLite.

## Fondamentaux du HTML

### Structure d'un document

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

### Concepts cles du HTML

- **Balises** : `<tag>contenu</tag>` (ouvrante et fermante)
- **Attributs** : `<tag attribute="value">`
- **class** : `class="name"` -- peut apparaitre sur plusieurs elements (style CSS)
- **id** : `id="unique"` -- doit etre unique dans le document
- **Imbrication** : des balises dans des balises forment un arbre (arbre DOM)
- **Auto-fermantes** : `<img src="..." />`, `<br />`

### Balises courantes

| Balise | Objectif |
|--------|----------|
| `<h1>` a `<h6>` | Titres |
| `<p>` | Paragraphe |
| `<a href="...">` | Lien hypertexte |
| `<img src="...">` | Image |
| `<div>` | Division (conteneur bloc) |
| `<span>` | Conteneur en ligne |
| `<ul>`, `<ol>`, `<li>` | Listes |
| `<table>`, `<tr>`, `<td>` | Tableaux |
| `<form>`, `<input>` | Formulaires |

## BeautifulSoup

### Installation et analyse

```python noexec
from bs4 import BeautifulSoup

# Analyser une chaine HTML
html = "<html><body><h1>Title</h1></body></html>"
soup = BeautifulSoup(html, 'html.parser')

# Analyser depuis un fichier
with open('page.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Analyser depuis le web (voir la section Requetes web ci-dessous)
```

### Trouver des elements

```python noexec
# find() -- retourne la PREMIERE correspondance (ou None)
h1 = soup.find('h1')
div = soup.find('div', class_='content')
elem = soup.find(id='main')
link = soup.find('a', href=True)          # Possede l'attribut href

# find_all() -- retourne une LISTE de toutes les correspondances
paragraphs = soup.find_all('p')
links = soup.find_all('a')
divs = soup.find_all('div', class_='item')
items = soup.find_all(['h1', 'h2', 'h3'])  # Plusieurs balises
```

### Selecteurs CSS

```python noexec
# select() retourne une liste, select_one() retourne le premier
soup.select('div.item')             # <div class="item">
soup.select('#main')                # <div id="main">
soup.select('div > p')              # <p> directement dans <div>
soup.select('div p')                # <p> n'importe ou dans <div>
soup.select('[href]')               # Elements avec l'attribut href
soup.select('a[href^="https"]')     # href commencant par https
soup.select('tr:nth-child(2)')      # Deuxieme <tr>
soup.select('div.a.b')             # <div class="a b">
```

### Extraire des donnees

```python noexec
# Contenu textuel
text = elem.get_text()              # Tout le texte (enfants inclus)
text = elem.get_text(strip=True)    # Espaces supprimes
text = elem.string                   # Texte direct (None si a des enfants)

# Attributs
url = link['href']                   # Acces direct (KeyError si absent)
url = link.get('href')              # Acces securise (None si absent)
classes = div['class']               # Retourne une liste de classes
src = img.get('src', '')            # Avec valeur par defaut

# Navigation
parent = elem.parent
children = list(elem.children)       # Enfants directs
descendants = list(elem.descendants) # Tous les descendants
next_sib = elem.next_sibling
prev_sib = elem.previous_sibling
```

### Analyse de tableaux

```python noexec
def parse_table(soup):
    table = soup.find('table')
    rows = []
    
    for tr in table.find_all('tr')[1:]:   # Sauter la ligne d'en-tete
        cells = tr.find_all('td')
        row = [cell.get_text(strip=True) for cell in cells]
        rows.append(row)
    
    return rows
```

### Extraction de liens

```python noexec
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

## Requetes web

### Utilisation de urllib

```python noexec
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# Requete GET simple
try:
    response = urlopen("https://example.com")
    html = response.read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
except HTTPError as e:
    print(f"Erreur HTTP {e.code}: {e.reason}")
except URLError as e:
    print(f"Erreur URL: {e.reason}")
```

### Avec des en-tetes personnalises

```python noexec
url = "https://example.com/page"
req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urlopen(req)
html = response.read().decode('utf-8')
```

### Utilisation de requests (prefere en production)

```python noexec
import requests

response = requests.get("https://example.com")
response.raise_for_status()         # Lever une exception sur les erreurs HTTP
soup = BeautifulSoup(response.text, 'html.parser')
```

## Exemple complet de scraping

```python noexec
from bs4 import BeautifulSoup
from urllib.request import urlopen

def scrape_dvd_info(url):
    """Recuperer les informations d'un DVD depuis une page."""
    try:
        response = urlopen(url)
        soup = BeautifulSoup(response, 'html.parser')
        
        # Extraire le titre
        title_elem = soup.find('h1', class_='title')
        title = title_elem.get_text(strip=True) if title_elem else "Unknown"
        
        # Extraire le realisateur
        director_elem = soup.find('span', class_='director')
        director = director_elem.get_text(strip=True) if director_elem else "Unknown"
        
        # Extraire l'annee
        year_elem = soup.find('span', class_='year')
        year = int(year_elem.get_text(strip=True)) if year_elem else None
        
        # Extraire le genre
        genre_elem = soup.find('span', class_='genre')
        genre = genre_elem.get_text(strip=True) if genre_elem else "Unknown"
        
        return {
            'title': title,
            'director': director,
            'year': year,
            'genre': genre
        }
    except Exception as e:
        print(f"Erreur lors du scraping de {url}: {e}")
        return None
```

## Gestion des codes-barres EAN13

EAN13 est un standard de code-barres a 13 chiffres utilise pour les produits (y compris les DVD).

### Structure du code-barres

```
3 3 3 3 3 2 9 9 3 0 4 1 3
[Pays    ] [Fabricant   ] [Produit] [Controle]
```

### Validation du checksum

```python
def validate_ean13(code):
    """Valider le checksum d'un code-barres EAN13."""
    if len(code) != 13 or not code.isdigit():
        return False
    
    odd_sum = sum(int(code[i]) for i in range(0, 12, 2))
    even_sum = sum(int(code[i]) for i in range(1, 12, 2))
    total = odd_sum + even_sum * 3
    checksum = (10 - (total % 10)) % 10
    
    return checksum == int(code[12])
```

### Calcul du checksum

```python
def calculate_ean13_checksum(code_12):
    """Calculer le chiffre de controle pour un code a 12 chiffres."""
    odd_sum = sum(int(code_12[i]) for i in range(0, 12, 2))
    even_sum = sum(int(code_12[i]) for i in range(1, 12, 2))
    total = odd_sum + even_sum * 3
    return (10 - (total % 10)) % 10
```

## Entrees/Sorties fichiers pour le scraping

### Sauvegarder les donnees recuperees

```python noexec
import json
import csv

# Sauvegarder en JSON
def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Sauvegarder en CSV
def save_csv(data, filename, headers):
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
```

### Integration avec SQLite

```python noexec
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

## Automatisation de processus

### Executer des commandes systeme

```python noexec
import subprocess

# Executer une commande et capturer la sortie
result = subprocess.run(['ls', '-l'], capture_output=True, text=True)
print(result.stdout)
print(result.returncode)      # 0 = succes

# Executer une commande shell
result = subprocess.run('echo "Hello"', shell=True, capture_output=True, text=True)

# Verifier les erreurs
try:
    subprocess.run(['command'], check=True)
except subprocess.CalledProcessError as e:
    print(f"Echec : {e}")
```

### Operations sur les fichiers

```python noexec
import os
import shutil
from pathlib import Path

# Operations sur les repertoires
os.makedirs('path/to/dir', exist_ok=True)
os.listdir('.')

# Operations sur les fichiers
shutil.copy('src.txt', 'dst.txt')
shutil.move('old.txt', 'new.txt')
os.remove('file.txt')

# Manipulation de chemins (prefere)
path = Path('folder/file.txt')
path.name          # 'file.txt'
path.stem          # 'file'
path.suffix        # '.txt'
path.parent        # Path('folder')
path.exists()      # True/False

# Glob
for file in Path('.').glob('*.txt'):
    print(file)
for file in Path('.').rglob('*.py'):  # Recursif
    print(file)
```

### Traitement par lots

```python noexec
from pathlib import Path

def process_directory(input_dir, output_dir):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    for file in input_path.glob('*.html'):
        with open(file, 'r') as f:
            soup = BeautifulSoup(f, 'html.parser')
        # Traitement...
        output_file = output_path / f"{file.stem}.json"
        save_json(data, output_file)
```

## Ethique et bonnes pratiques

1. **Verifier robots.txt** avant de scraper un site
2. **Limiter le debit** des requetes -- ajouter des delais entre les requetes
3. **Definir un User-Agent** identifiant votre scraper
4. **Mettre en cache les reponses** -- ne pas re-telecharger les pages inchangees
5. **Respecter les conditions d'utilisation** -- certains sites interdisent le scraping
6. **Gerer les erreurs correctement** -- les sites changent leur structure HTML

---

## AIDE-MEMOIRE

### BeautifulSoup
```python noexec
soup = BeautifulSoup(html, 'html.parser')

# Trouver des elements
soup.find('tag')                     Premiere correspondance
soup.find('div', class_='name')      Par classe
soup.find(id='myid')                 Par ID
soup.find_all('tag')                 Toutes les correspondances
soup.select('div.class > p')        Selecteur CSS

# Extraire des donnees
elem.get_text(strip=True)           Contenu textuel
elem['attribute']                    Valeur d'attribut
elem.get('attr', default)           Acces securise aux attributs

# Navigation
elem.parent, elem.children
elem.next_sibling, elem.previous_sibling
```

### Requetes web
```python noexec
from urllib.request import urlopen
response = urlopen(url)
html = response.read().decode('utf-8')
```

### Motifs courants
```python noexec
# Verifier None avant d'acceder
elem = soup.find('div')
if elem is not None:
    text = elem.get_text(strip=True)

# Analyse de tableaux
for tr in table.find_all('tr')[1:]:
    cells = [td.get_text(strip=True) for td in tr.find_all('td')]
```
