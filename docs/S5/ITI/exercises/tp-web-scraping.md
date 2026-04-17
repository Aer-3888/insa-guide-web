---
title: "TP11 - LDS4: Web Scraping (BeautifulSoup)"
sidebar_position: 12
---

# TP11 - LDS4: Web Scraping (BeautifulSoup)

> Following teacher instructions from: S5/ITI/data/moodle/tp/tp11_web_scraping/README.md

## Exercise 1

### Parse DVD Information: extract DVD details (title, director, year, genre, cover image URL, synopsis) from HTML pages using BeautifulSoup

**1a. Setup -- install BeautifulSoup and create test data**

```bash
pip3 install beautifulsoup4
python3 -c "from bs4 import BeautifulSoup; print('BeautifulSoup OK')"
```

**Expected output:**
```
BeautifulSoup OK
```

Create a sample HTML page simulating a DVD detail page (DVDFr.com structure):

```bash
cat > dvd_sample.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>DVD Details - The Matrix</title></head>
<body>
<h1>The Matrix</h1>
<div class="product-info">
    <table>
        <tr><td>Realisateur</td><td>Lana Wachowski, Lilly Wachowski</td></tr>
        <tr><td>Annee</td><td>1999</td></tr>
        <tr><td>Genre</td><td>Science-Fiction</td></tr>
        <tr><td>Duree</td><td>136 min</td></tr>
    </table>
</div>
<img class="cover" src="https://example.com/matrix_cover.jpg" />
<div class="synopsis">
    A computer hacker learns about the true nature of reality
    and his role in the war against its controllers.
</div>
<div class="rating">4.5/5</div>
</body>
</html>
EOF
```

---

**1b. Explore the HTML structure interactively**

**Answer:**

```python noexec
>>> from bs4 import BeautifulSoup
>>> with open("dvd_sample.html", "r") as f:
...     soup = BeautifulSoup(f, "html.parser")
...
>>> soup.find("h1")
<h1>The Matrix</h1>

>>> soup.find("h1").get_text(strip=True)
'The Matrix'

>>> soup.find("div", class_="synopsis").get_text(strip=True)
'A computer hacker learns about the true nature of reality\n    and his role in the war against its controllers.'

>>> soup.find("img", class_="cover").get("src")
'https://example.com/matrix_cover.jpg'

>>> for row in soup.find("div", class_="product-info").find_all("tr"):
...     cells = row.find_all("td")
...     print(f"{cells[0].get_text()}: {cells[1].get_text()}")
...
Realisateur: Lana Wachowski, Lilly Wachowski
Annee: 1999
Genre: Science-Fiction
Duree: 136 min
```

**Key finding methods:**

| Method | Returns | Example |
|--------|---------|---------|
| `soup.find("tag")` | First match or `None` | `soup.find("h1")` |
| `soup.find_all("tag")` | List (possibly empty) | `soup.find_all("tr")` |
| `soup.find("tag", class_="x")` | First with class | `soup.find("div", class_="synopsis")` |
| `soup.find(id="x")` | First with id | `soup.find(id="main")` |
| `soup.select("css")` | List via CSS selector | `soup.select("div.item > p")` |

---

**1c. Create the DVD page parser (parserWeb.py)**

**Answer:**

```python noexec
from bs4 import BeautifulSoup
from urllib.request import urlopen


def parse_dvd_page(html_content):
    """Parse a DVD information page and extract key details."""
    soup = BeautifulSoup(html_content, "html.parser")

    dvd_info = {}

    # Extract title
    title_elem = soup.find("h1")
    if title_elem:
        dvd_info["title"] = title_elem.get_text(strip=True)

    # Extract from structured table
    info_div = soup.find("div", class_="product-info")
    if info_div:
        for row in info_div.find_all("tr"):
            cells = row.find_all("td")
            if len(cells) >= 2:
                label = cells[0].get_text(strip=True).lower()
                value = cells[1].get_text(strip=True)

                if "realisateur" in label or "director" in label:
                    dvd_info["director"] = value
                elif "annee" in label or "year" in label:
                    dvd_info["year"] = value
                elif "genre" in label:
                    dvd_info["genre"] = value

    # Extract cover image URL
    img = soup.find("img", class_="cover")
    if img:
        dvd_info["cover_url"] = img.get("src", "")

    # Extract synopsis
    synopsis_div = soup.find("div", class_="synopsis")
    if synopsis_div:
        dvd_info["synopsis"] = synopsis_div.get_text(strip=True)

    return dvd_info


def scrape_dvd_from_url(url):
    """Fetch and parse a DVD page from a URL."""
    try:
        response = urlopen(url)
        html = response.read().decode("utf-8")
        return parse_dvd_page(html)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None
```

---

**1d. Test the parser on the sample file**

**Answer:**

```python noexec
from parser_web import parse_dvd_page

with open("dvd_sample.html", "r", encoding="utf-8") as f:
    info = parse_dvd_page(f.read())

print("=== Parsed DVD Info ===")
for key, value in info.items():
    print(f"  {key}: {value}")
```

**Expected output:**
```
=== Parsed DVD Info ===
  title: The Matrix
  director: Lana Wachowski, Lilly Wachowski
  year: 1999
  genre: Science-Fiction
  cover_url: https://example.com/matrix_cover.jpg
  synopsis: A computer hacker learns about the true nature of reality
    and his role in the war against its controllers.
```

**Safe patterns to follow:**

```python noexec
# ALWAYS check for None before accessing attributes
elem = soup.find("h1")
if elem is not None:
    text = elem.get_text(strip=True)

# Use .get() for safe attribute access (returns default if missing)
href = link.get("href", "")        # Returns "" if missing
# vs
href = link["href"]                 # Raises KeyError if missing

# CSS selectors as alternative to find/find_all
soup.select("div.item")            # <div class="item">
soup.select("#main")               # <div id="main">
soup.select("div > p")             # <p> directly inside <div>
soup.select("table tr td")         # <td> inside <tr> inside <table>
```

---

## Exercise 2

### EAN13 Barcode Processing: validate EAN13 barcodes using the checksum algorithm, calculate checksums, process a CSV file of barcodes (ean13.py)

**2a. Understand the EAN13 checksum algorithm**

EAN13 is a 13-digit barcode standard:
```
[Country][Manufacturer][Product][Checksum]
3333329930413
```

**Checksum calculation:**
1. Sum digits at odd positions (1st, 3rd, 5th, 7th, 9th, 11th)
2. Sum digits at even positions (2nd, 4th, 6th, 8th, 10th, 12th) and multiply by 3
3. Add both sums
4. Checksum = (10 - (total % 10)) % 10
5. Compare checksum with the 13th digit

**Worked example for `5051889066217`:**
```
Position:  1  2  3  4  5  6  7  8  9  10 11 12 13
Digit:     5  0  5  1  8  8  9  0  6  6  2  1  7

Odd positions (1,3,5,7,9,11): 5 + 5 + 8 + 9 + 6 + 2 = 35
Even positions (2,4,6,8,10,12): 0 + 1 + 8 + 0 + 6 + 1 = 16

Total = 35 + 16 * 3 = 35 + 48 = 83
Checksum = (10 - 83 % 10) % 10 = (10 - 3) % 10 = 7

Position 13 digit is 7 --> matches! VALID
```

---

**2b. Implement the validator and checksum calculator**

**Answer:**

```python noexec
import csv


def validate_ean13(code):
    """
    Validate an EAN13 barcode.

    EAN13 checksum algorithm:
    1. Sum digits at odd positions (1st, 3rd, 5th, 7th, 9th, 11th)
    2. Sum digits at even positions (2nd, 4th, 6th, 8th, 10th, 12th)
    3. Total = odd_sum + even_sum * 3
    4. Checksum = (10 - (total % 10)) % 10
    5. Compare checksum with 13th digit
    """
    if len(code) != 13 or not code.isdigit():
        return False

    odd_sum = sum(int(code[i]) for i in range(0, 12, 2))
    even_sum = sum(int(code[i]) for i in range(1, 12, 2))
    total = odd_sum + even_sum * 3
    checksum = (10 - (total % 10)) % 10

    return checksum == int(code[12])


def calculate_checksum(code_12):
    """Calculate the checksum digit for a 12-digit partial EAN13."""
    if len(code_12) != 12 or not code_12.isdigit():
        return None

    odd_sum = sum(int(code_12[i]) for i in range(0, 12, 2))
    even_sum = sum(int(code_12[i]) for i in range(1, 12, 2))
    total = odd_sum + even_sum * 3
    return (10 - (total % 10)) % 10


def process_barcode_file(csv_file):
    """Read barcodes from CSV, validate, and return valid ones."""
    valid_codes = []
    invalid_codes = []

    with open(csv_file, "r") as f:
        reader = csv.reader(f)
        for row in reader:
            if row:
                code = row[0].strip()
                if validate_ean13(code):
                    valid_codes.append(code)
                else:
                    invalid_codes.append(code)

    return valid_codes, invalid_codes
```

---

**2c. Test with individual barcodes**

**Answer:**

```python noexec
from ean13 import validate_ean13, calculate_checksum

# Test individual codes
test_codes = [
    "5051889066217",
    "3700301002013",
    "1234567890123",
    "0000000000000",
]

for code in test_codes:
    result = validate_ean13(code)
    print(f"{code}: {'VALID' if result else 'INVALID'}")

# Demonstrate checksum calculation
print("\n=== Checksum calculation for 505188906621_ ===")
partial = "505188906621"
checksum = calculate_checksum(partial)
print(f"First 12 digits: {partial}")
print(f"Calculated checksum: {checksum}")
print(f"Complete EAN13: {partial}{checksum}")
print(f"Validation: {validate_ean13(partial + str(checksum))}")
```

**Expected output:**
```
5051889066217: VALID
3700301002013: VALID
1234567890123: INVALID
0000000000000: VALID

=== Checksum calculation for 505188906621_ ===
First 12 digits: 505188906621
Calculated checksum: 7
Complete EAN13: 5051889066217
Validation: True
```

---

**2d. Process barcodes from a CSV file (codesBarresSA.csv)**

Create a test CSV file:

```bash
cat > barcodes_test.csv << 'EOF'
3333329930413
5051889066217
3700301002013
1234567890123
0000000000000
EOF
```

**Answer:**

```python noexec
from ean13 import process_barcode_file

valid, invalid = process_barcode_file("barcodes_test.csv")
print(f"Valid barcodes ({len(valid)}):")
for code in valid:
    print(f"  {code}")

print(f"\nInvalid barcodes ({len(invalid)}):")
for code in invalid:
    print(f"  {code}")
```

**Expected output:**
```
Valid barcodes (3):
  5051889066217
  3700301002013
  0000000000000

Invalid barcodes (2):
  3333329930413
  1234567890123
```

---

## Exercise 3

### Database Integration: store scraped DVD data in an SQLite database with proper schema and CRUD operations (bdDVD.py / BDRegMat.py)

**3a. Create the DVD database class**

**Answer:**

```python noexec
import sqlite3


class DVDDatabase:
    def __init__(self, db_file="dvds.db"):
        self.conn = sqlite3.connect(db_file)
        self.cursor = self.conn.cursor()
        self.create_tables()

    def create_tables(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS dvds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ean TEXT UNIQUE,
                title TEXT NOT NULL,
                director TEXT,
                year INTEGER,
                genre TEXT,
                synopsis TEXT,
                cover_url TEXT
            )
        """)
        self.conn.commit()

    def add_dvd(self, ean, title, director=None, year=None,
                genre=None, synopsis=None, cover_url=None):
        """Add a DVD. Returns ID or None if duplicate."""
        try:
            self.cursor.execute(
                "INSERT INTO dvds "
                "(ean, title, director, year, genre, synopsis, cover_url) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (ean, title, director, year, genre, synopsis, cover_url),
            )
            self.conn.commit()
            return self.cursor.lastrowid
        except sqlite3.IntegrityError:
            print(f"DVD with EAN {ean} already exists")
            return None

    def search_by_title(self, title):
        self.cursor.execute(
            "SELECT * FROM dvds WHERE title LIKE ?",
            (f"%{title}%",),
        )
        return self.cursor.fetchall()

    def get_by_ean(self, ean):
        self.cursor.execute(
            "SELECT * FROM dvds WHERE ean = ?", (ean,)
        )
        return self.cursor.fetchone()

    def get_all(self):
        self.cursor.execute("SELECT * FROM dvds ORDER BY title")
        return self.cursor.fetchall()

    def close(self):
        self.conn.close()
```

**Key design points:**
- `ean TEXT UNIQUE` prevents duplicate entries
- `?` placeholders prevent SQL injection -- never use f-strings in SQL queries
- `IntegrityError` is caught for duplicate EAN inserts rather than crashing
- `LIKE ?` with `%` wildcards enables partial title matching

---

**3b. Test the database operations**

**Answer:**

```python noexec
from bd_dvd import DVDDatabase

db = DVDDatabase("test_dvds.db")

# Add DVDs
db.add_dvd("5051889066217", "The Matrix",
           director="Wachowski", year=1999,
           genre="Sci-Fi", synopsis="A hacker discovers reality is simulated")
db.add_dvd("3700301002013", "Inception",
           director="Christopher Nolan", year=2010,
           genre="Sci-Fi", synopsis="Dreams within dreams")

# Try duplicate
db.add_dvd("5051889066217", "The Matrix Duplicate")

# Query
print("=== All DVDs ===")
for dvd in db.get_all():
    print(f"  [{dvd[1]}] {dvd[2]} - {dvd[3]} ({dvd[4]})")

print("\n=== Search 'matrix' ===")
for dvd in db.search_by_title("matrix"):
    print(f"  {dvd[2]} ({dvd[4]})")

print("\n=== Lookup by EAN ===")
result = db.get_by_ean("5051889066217")
if result:
    print(f"  Found: {result[2]} by {result[3]}")

db.close()
```

**Expected output:**
```
DVD with EAN 5051889066217 already exists

=== All DVDs ===
  [3700301002013] Inception - Christopher Nolan (2010)
  [5051889066217] The Matrix - Wachowski (1999)

=== Search 'matrix' ===
  The Matrix (1999)

=== Lookup by EAN ===
  Found: The Matrix by Wachowski
```

---

## Exercise 4

### Complete DVD Library Application: build an application that validates barcodes, scrapes DVD info from the web, and stores results in the database (dvdtheque.py)

**4a. Create the library application that integrates all modules**

**Answer:**

```python noexec
from ean13 import validate_ean13
from parser_web import parse_dvd_page, scrape_dvd_from_url
from bd_dvd import DVDDatabase


class DVDLibrary:
    """Complete DVD library: validate, scrape, store, search."""

    def __init__(self, db_file="ma_dvdtheque.db"):
        self.db = DVDDatabase(db_file)

    def add_dvd_by_barcode(self, ean):
        """Validate barcode, scrape info, store in database."""
        # 1. Validate barcode
        if not validate_ean13(ean):
            print(f"Invalid EAN13: {ean}")
            return None

        # 2. Check if already in database
        existing = self.db.get_by_ean(ean)
        if existing:
            print(f"Already in collection: {existing[2]}")
            return existing

        # 3. Scrape info from web
        url = f"https://www.dvdfr.com/dvd/ean-{ean}.html"
        print(f"Fetching info from {url}...")
        dvd_info = scrape_dvd_from_url(url)

        if dvd_info is None:
            print(f"Could not fetch DVD info for EAN {ean}")
            return None

        # 4. Store in database
        year = None
        if "year" in dvd_info:
            try:
                year = int(dvd_info["year"])
            except ValueError:
                year = None

        dvd_id = self.db.add_dvd(
            ean=ean,
            title=dvd_info.get("title", "Unknown"),
            director=dvd_info.get("director"),
            year=year,
            genre=dvd_info.get("genre"),
            synopsis=dvd_info.get("synopsis"),
            cover_url=dvd_info.get("cover_url"),
        )

        if dvd_id:
            print(f"Added: {dvd_info.get('title', 'Unknown')}")
        return dvd_id

    def add_dvd_from_html_file(self, ean, html_file):
        """Add a DVD from a local HTML file (for testing without network)."""
        if not validate_ean13(ean):
            print(f"Invalid EAN13: {ean}")
            return None

        with open(html_file, "r", encoding="utf-8") as f:
            dvd_info = parse_dvd_page(f.read())

        year = None
        if "year" in dvd_info:
            try:
                year = int(dvd_info["year"])
            except ValueError:
                year = None

        return self.db.add_dvd(
            ean=ean,
            title=dvd_info.get("title", "Unknown"),
            director=dvd_info.get("director"),
            year=year,
            genre=dvd_info.get("genre"),
            synopsis=dvd_info.get("synopsis"),
            cover_url=dvd_info.get("cover_url"),
        )

    def search(self, query):
        results = self.db.search_by_title(query)
        for dvd in results:
            print(f"  [{dvd[1]}] {dvd[2]} - {dvd[3]} ({dvd[4]})")
        return results

    def list_all(self):
        dvds = self.db.get_all()
        print(f"\n=== DVD Collection ({len(dvds)} titles) ===")
        for dvd in dvds:
            print(f"  {dvd[2]} - {dvd[3]} ({dvd[4]})")
        return dvds

    def close(self):
        self.db.close()
```

**Application pipeline:**
```
User enters barcode
        |
        v
[1] validate_ean13(ean)  --- invalid ---> error message
        |
        | valid
        v
[2] db.get_by_ean(ean)   --- found ---> "Already in collection"
        |
        | not found
        v
[3] scrape_dvd_from_url() --- fail ---> "Could not fetch"
        |
        | success
        v
[4] db.add_dvd(...)       --- done ---> "Added: Title"
```

---

**4b. Test the complete application**

**Answer:**

```python noexec
lib = DVDLibrary("demo_dvdtheque.db")

# Add from local HTML file (testing without network)
lib.add_dvd_from_html_file("5051889066217", "dvd_sample.html")

# List collection
lib.list_all()

# Search
print("\n=== Search 'matrix' ===")
lib.search("matrix")

lib.close()
```

**Expected output:**
```
=== DVD Collection (1 titles) ===
  The Matrix - Lana Wachowski, Lilly Wachowski (1999)

=== Search 'matrix' ===
  [5051889066217] The Matrix - Lana Wachowski, Lilly Wachowski (1999)
```

---

**4c. Test barcode validation in the pipeline**

**Answer:**

```python noexec
lib = DVDLibrary("demo_dvdtheque.db")

# Test with invalid barcode
lib.add_dvd_by_barcode("1234567890123")

# Test with already-added DVD
lib.add_dvd_by_barcode("5051889066217")

lib.close()
```

**Expected output:**
```
Invalid EAN13: 1234567890123
Already in collection: The Matrix
```

---

**Web scraping ethics:**
1. **Check robots.txt** -- respect the site's scraping policy
2. **Rate limit requests** -- do not overload servers (use `time.sleep()`)
3. **Identify your bot** -- use a proper User-Agent header
4. **Cache responses** -- do not re-fetch pages unnecessarily
5. **Respect copyright** -- scraped data is for personal use

**Common pitfalls:**
- `soup.find()` returns `None` if no match -- always check before calling `.get_text()`
- Use `'html.parser'` as the parser (not `'lxml'` unless installed)
- `get_text()` includes whitespace by default -- pass `strip=True`
- Use `.get("attr", "")` instead of `["attr"]` to avoid `KeyError`
- BeautifulSoup cannot handle JavaScript-rendered content (use Selenium for that)
