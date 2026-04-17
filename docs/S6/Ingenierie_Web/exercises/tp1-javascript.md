---
title: "TP1 : JavaScript -- Introduction"
sidebar_position: 1
---

# TP1 : JavaScript -- Introduction

> Following teacher instructions from: `S6/Ingenierie_Web/data/moodle/tp/tp1_javascript/README.md`

Ce TP couvre les fondamentaux de JavaScript a travers trois exercices progressifs issus du sujet `TP-intro-JS.pdf` :
1. **First Step** : generateur d'histoires (variables, fonctions, DOM, evenements)
2. **Building Blocks** : galerie d'images (creation dynamique d'elements, delegation d'evenements)
3. **Intro Objects** : balles rebondissantes (Canvas 2D, heritage par prototype, animation)

Puis un exercice supplementaire issu du depot GitHub :
4. **ES6 Babel** : dessin vectoriel avec classes ES6, Drag and Drop, tests Jest

Technologies : JavaScript ES6+, HTML5, CSS3, Canvas API, Jest, Babel

---

## Exercice 1 : First Step -- Silly Story Generator

### Q1 : Definir la structure HTML

Le fichier `index.html` est fourni. Il contient un champ texte, deux boutons radio US/UK, un bouton de generation et un paragraphe cache.

```html
<!-- Fichier : First Step/index.html (fourni) -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width">
    <title>Silly story generator</title>
    <style>
      body { font-family: helvetica, sans-serif; width: 350px; }
      label { font-weight: bold; }
      div { padding-bottom: 20px; }
      input[type="text"] { padding: 5px; width: 150px; }
      p {
        background: #FFC125;
        color: #5E2612;
        padding: 10px;
        visibility: hidden;
      }
    </style>
  </head>
  <body>
    <div>
      <label for="customname">Enter custom name:</label>
      <input id="customname" type="text" placeholder="">
    </div>
    <div>
      <label for="us">US</label>
      <input id="us" type="radio" name="ukus" value="us" checked>
      <label for="uk">UK</label>
      <input id="uk" type="radio" name="ukus" value="uk">
    </div>
    <div>
      <button class="randomize">Generate random story</button>
    </div>
    <p class="story"></p>
    <script src="main.js"></script>
  </body>
</html>
```

**File changes:**
- `First Step/index.html` : fourni, aucune modification necessaire

---

### Q2 : Ecrire la logique JavaScript

**Answer:**

```javascript noexec
// Fichier : First Step/main.js

// 1. Recuperer les references DOM
const customName = document.getElementById('customname');
const randomize = document.querySelector('.randomize');
const story = document.querySelector('.story');

// 2. Fonction utilitaire : element aleatoire d'un tableau
function randomValueFromArray(array) {
    const random = Math.floor(Math.random() * array.length);
    return array[random];
}

// 3. Donnees statiques : template et valeurs de remplacement
let storyText = "It was 94 fahrenheit outside, so :insertx: went for a walk. When they got to :inserty:, they stared in horror for a few moments, then :insertz:. Bob saw the whole thing, but was not surprised — :insertx: weighs 300 pounds, and it was a hot day.";

let insertX = ["Willy the Goblin", "Big Daddy", "Father Christmas"];
let insertY = ["the soup kitchen", "Disneyland", "the White House"];
let insertZ = ["spontaneously combusted", "melted into a puddle on the sidewalk", "turned into a slug and crawled away"];

// 4. Attacher l'evenement click au bouton
randomize.addEventListener('click', result);

// 5. Fonction de generation
function result() {
    let newStory = storyText;

    // Choisir des valeurs aleatoires
    let xItem = randomValueFromArray(insertX);
    let yItem = randomValueFromArray(insertY);
    let zItem = randomValueFromArray(insertZ);

    // Remplacer les placeholders (:insertx: apparait 2 fois)
    for (let i = 0; i < 2; i++)
        newStory = newStory.replace(":insertx:", xItem);
    newStory = newStory.replace(":inserty:", yItem);
    newStory = newStory.replace(":insertz:", zItem);

    // Personnaliser le nom si l'utilisateur en a saisi un
    if (customName.value !== '') {
        let name = customName.value;
        newStory = newStory.replace("Bob", name);
    }

    // Conversion d'unites si UK est coche
    if (document.getElementById("uk").checked) {
        let weight = Math.round(300 * 0.0714286) + " stone";
        let temperature = Math.round((94 - 32) * 5 / 9) + " centigrade";
        // IMPORTANT : String.replace() retourne une NOUVELLE chaine
        newStory = newStory.replace("94 fahrenheit", temperature);
        newStory = newStory.replace("300 pounds", weight);
    }

    // Afficher l'histoire
    story.textContent = newStory;
    story.style.visibility = 'visible';
}
```

### Bug a corriger

Le code source original contient un bug intentionnel dans la conversion UK :
```javascript noexec
// BUG : newStory.replace() retourne une nouvelle chaine mais NE modifie PAS newStory
newStory.replace("94 farenheit", temperature);   // resultat perdu !
newStory.replace("300 pounds", weight);           // resultat perdu !

// CORRECTION : assigner le resultat
newStory = newStory.replace("94 fahrenheit", temperature);
newStory = newStory.replace("300 pounds", weight);
```

Note : il y a aussi une faute d'orthographe dans le code original ("farenheit" au lieu de "fahrenheit") qui fait que le replace ne matche pas le texte du template.

**File changes:**
- `First Step/main.js` : ecriture complete de la logique de generation

---

## Exercice 2 : Building Blocks -- Galerie d'images

### Q1 : Creer dynamiquement les vignettes et gerer les interactions

**Answer:**

```html
<!-- Fichier : Building Blocks/index.html (fourni) -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Image gallery</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Image gallery example</h1>
    <div class="full-img">
      <img class="displayed-img" src="images/pic1.jpg">
      <div class="overlay"></div>
      <button class="dark">Darken</button>
    </div>
    <div class="thumb-bar">
    </div>
    <script src="main.js"></script>
  </body>
</html>
```

```css
/* Fichier : Building Blocks/style.css (fourni) */
h1 { font-family: helvetica, arial, sans-serif; text-align: center; }
body { width: 640px; margin: 0 auto; }

.full-img {
  position: relative;
  display: block;
  width: 640px;
  height: 480px;
}

.overlay {
  position: absolute;
  top: 0; left: 0;
  width: 640px; height: 480px;
  background-color: rgba(0,0,0,0);
}

button {
  border: 0;
  background: rgba(150,150,150,0.6);
  text-shadow: 1px 1px 1px white;
  border: 1px solid #999;
  position: absolute;
  cursor: pointer;
  top: 2px; left: 2px;
}

.thumb-bar img {
  display: block;
  width: 20%;
  float: left;
  cursor: pointer;
}
```

```javascript noexec
// Fichier : Building Blocks/main.js

// 1. References DOM
const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');
const btn = document.querySelector('button');
const overlay = document.querySelector('.overlay');

// 2. Creer dynamiquement les vignettes (5 images)
const maximage = 5;
for (let i = 1; i <= maximage; i++) {
    const imgname = "images/pic" + i + ".jpg";
    const newImage = document.createElement('img');
    newImage.setAttribute('src', imgname);
    thumbBar.appendChild(newImage);
}

// 3. Delegation d'evenements : clic sur vignette -> changer l'image principale
thumbBar.onclick = function(event) {
    displayedImage.setAttribute("src", event.target.src);
}

// 4. Toggle Darken/Lighten
btn.onclick = function(event) {
    if (btn.getAttribute("class") == "dark") {
        btn.setAttribute("class", "light");
        btn.textContent = "Lighten";
        overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    } else {
        btn.setAttribute("class", "dark");
        btn.textContent = "Darken";
        overlay.style.backgroundColor = "rgba(0,0,0,0)";
    }
}
```

**Concepts cles :**
- `document.createElement('img')` : creation dynamique d'un element DOM
- `thumbBar.appendChild(newImage)` : ajout au DOM
- `thumbBar.onclick` avec `event.target.src` : delegation d'evenements (un seul handler sur le conteneur parent)
- Toggle entre classes `dark`/`light` pour basculer l'etat

**File changes:**
- `Building Blocks/main.js` : ecriture complete de la galerie

---

## Exercice 3 : Intro Objects -- Balles rebondissantes (Canvas)

### Q1 : Initialiser le canvas et creer les constructeurs

### Q2 : Ecrire les methodes draw, update, collisionDetect

### Q3 : Creer les balles et la boucle d'animation

**Answer:**

```javascript noexec
// Fichier : Intro Objects/main-finished.js

// 1. Obtenir le canvas et son contexte 2D
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// 2. Redimensionner le canvas a la taille de la fenetre
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// 3. Fonction utilitaire : nombre aleatoire dans un intervalle
function random(min, max) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

// 4. Constructeur de base Shape (pre-ES6)
function Shape(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.exists = true;
}

// 5. Constructeur Ball qui herite de Shape
function Ball(x, y, velX, velY, color, size) {
    Shape.call(this, x, y, velX, velY);  // Appel au constructeur parent
    this.color = color;
    this.size = size;
}

// Heritage du prototype
Ball.prototype = Object.create(Shape.prototype);

// 6. Dessiner une balle sur le canvas
Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
};

// 7. Mettre a jour la position (rebond sur les bords)
Ball.prototype.update = function() {
    if ((this.x + this.size) >= width) {
        this.velX = -(this.velX);
    }
    if ((this.x - this.size) <= 0) {
        this.velX = -(this.velX);
    }
    if ((this.y + this.size) >= height) {
        this.velY = -(this.velY);
    }
    if ((this.y - this.size) <= 0) {
        this.velY = -(this.velY);
    }
    this.x += this.velX;
    this.y += this.velY;
};

// 8. Detection de collision avec les autres balles
Ball.prototype.collisionDetect = function() {
    for (let j = 0; j < balls.length; j++) {
        if (!(this === balls[j])) {
            const dx = this.x - balls[j].x;
            const dy = this.y - balls[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size + balls[j].size) {
                balls[j].color = this.color =
                    'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
            }
        }
    }
};

// 9. Creer 25 balles avec des positions et vitesses aleatoires
let balls = [];
while (balls.length < 25) {
    const size = random(10, 20);
    let ball = new Ball(
        random(0 + size, width - size),
        random(0 + size, height - size),
        random(-7, 7),
        random(-7, 7),
        'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')',
        size
    );
    balls.push(ball);
}

// 10. Boucle d'animation
function loop() {
    // Rectangle semi-transparent pour effet de trainee
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw();
        balls[i].update();
        balls[i].collisionDetect();
    }

    requestAnimationFrame(loop);
}

loop();
```

**Concepts cles :**
- `Shape.call(this, ...)` : heritage par prototype (equivalent pre-ES6 de `super()`)
- `Ball.prototype = Object.create(Shape.prototype)` : chaine de prototypes
- `ctx.arc(x, y, radius, 0, 2*PI)` : dessin d'un cercle
- `requestAnimationFrame(loop)` : animation fluide a ~60fps
- `Math.sqrt(dx*dx + dy*dy)` : distance euclidienne pour la detection de collision

**File changes:**
- `Intro Objects/main-finished.js` : ecriture complete de l'animation

---

## Exercice 4 : ES6 Babel -- Classes et Drag and Drop

### Q1 : Implementer Rectangle (guide par les tests)

Les tests `Rectangle.test.js` definissent l'interface attendue :

```javascript noexec
// Fichier : es6_babel/src/test/Rectangle.test.js (fourni)
import "jest";
import { Rectangle } from "../main/model.js";

let rec;
beforeEach(() => { rec = new Rectangle(1, 2, 3, 4, 'red', 11); });

test("testX", () => { expect(rec.x).toBe(1); });
test("testY", () => { expect(rec.y).toBe(2); });
test("testW", () => { expect(rec.w).toBe(3); });
test("testH", () => { expect(rec.h).toBe(4); });
test("testColor", () => { expect(rec.color).toBe('red'); });
test("testLinewidth", () => { expect(rec.linewidth).toBe(11); });
```

**Answer:**

```javascript noexec
export class Rectangle extends Shape {
    constructor(x, y, w, h, color, linewidth) {
        super(color, linewidth);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}
```

---

### Q2 : Implementer Line (guide par les tests)

```javascript noexec
// Fichier : es6_babel/src/test/Line.test.js (fourni)
test("testX1", () => { expect(line.x1).toBe(1); });
test("testX2", () => { expect(line.x2).toBe(3); });
test("testY1", () => { expect(line.y1).toBe(2); });
test("testY2", () => { expect(line.y2).toBe(4); });
```

**Answer:**

```javascript noexec
export class Line extends Shape {
    constructor(x1, y1, x2, y2, color, linewidth) {
        super(color, linewidth);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}
```

---

### Q3 : Implementer Drawing (guide par les tests)

```javascript noexec
// Fichier : es6_babel/src/test/Drawing.test.js (fourni)
test("testArray", () => { expect(drawing.shapes).toHaveLength(0); });
```

**Answer:**

```javascript noexec
export class Drawing {
    constructor() {
        this.shapes = [];
    }
}
```

---

### Q4 : Implementer DnD (guide par les tests)

**Answer:**

```javascript noexec
// Fichier : es6_babel/src/main/interaction.js
export class DnD {
    constructor(canvas, interactor) {
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.pressed = false;

        canvas.addEventListener('mousedown', (event) => {
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.endX = event.clientX;
            this.endY = event.clientY;
            this.pressed = true;
            interactor.onInteractionStart(this);
        });

        canvas.addEventListener('mousemove', (event) => {
            if (this.pressed) {
                this.endX = event.clientX;
                this.endY = event.clientY;
                interactor.onInteractionUpdate(this);
            }
        });

        canvas.addEventListener('mouseup', (event) => {
            this.pressed = false;
            interactor.onInteractionEnd(this);
        });
    }
}
```

---

### Fichier model.js complet

```javascript noexec
// Fichier : es6_babel/src/main/model.js (SOLUTION COMPLETE)
export class Shape {
    constructor(color, linewidth) {
        this.color = color;
        this.linewidth = linewidth;
    }
}

export class Rectangle extends Shape {
    constructor(x, y, w, h, color, linewidth) {
        super(color, linewidth);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

export class Line extends Shape {
    constructor(x1, y1, x2, y2, color, linewidth) {
        super(color, linewidth);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

export class Drawing {
    constructor() {
        this.shapes = [];
    }
}
```

### Lancer les tests

```bash
cd es6_babel
npm install
npx jest                     # Lancer tous les tests
npx jest Rectangle.test.js   # Lancer un test specifique
```

**File changes:**
- `es6_babel/src/main/model.js` : ajout de Rectangle, Line, Drawing
- `es6_babel/src/main/interaction.js` : nouveau fichier -- classe DnD

---

## Execution

```bash
# Exercices 1, 2, 3 : ouvrir directement dans le navigateur
firefox "First Step/index.html"
firefox "Building Blocks/index.html"
firefox "Intro Objects/index-finished.html"

# Exercice 4 : necessite npm
cd es6_babel
npm install
npx jest
```
