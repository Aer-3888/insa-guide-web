---
title: "TP1-2 - Introduction a JavaScript"
sidebar_position: 1
---

# TP1-2 - Introduction a JavaScript

## Objectif

Apprendre les fondamentaux de JavaScript a travers des exercices pratiques couvrant les variables, les fonctions, la manipulation du DOM, les evenements et la programmation orientee objet.

## Sujet

**Fichier** : TP-intro-JS.pdf

**Themes** :
- Bases de JavaScript (variables, fonctions, tableaux)
- Manipulation du DOM et gestion des evenements
- JavaScript oriente objet
- Template literals et manipulation de chaines
- Generation de valeurs aleatoires

## Exercices

### 1. First Step - Generateur d'histoires

**Emplacement** : `First Step/`

**Concept** : Generateur d'histoires interactif utilisant les chaines de gabarit (template strings), la selection aleatoire et la saisie de formulaire.

**Fonctionnalites** :
- Generation aleatoire d'histoires a partir de modeles predefinis
- Saisie d'un nom personnalise
- Conversion d'unites US/UK (Fahrenheit ↔ Celsius, pounds ↔ stone)
- Gestion des evenements DOM

**Concepts JavaScript essentiels** :
```javascript noexec
// Selection aleatoire dans un tableau
function randomValueFromArray(array) {
    const random = Math.floor(Math.random() * array.length);
    return array[random];
}

// Remplacement dans une chaine
let story = "It was 94 fahrenheit outside...";
story = story.replace(":insertx:", randomValue);

// Ecouteurs d'evenements
button.addEventListener('click', generateStory);

// Gestion des saisies de formulaire
if(customName.value !== '') {
    story = story.replace("Bob", customName.value);
}

// Conversion d'unites
let celsius = Math.round((fahrenheit - 32) * 5/9);
```

**Fichiers** :
- `index.html` - Structure HTML avec champs de formulaire
- `main.js` - Logique JavaScript pour la generation d'histoires

### 2. Building Blocks - Galerie d'images

**Emplacement** : `Building Blocks/`

**Concept** : Galerie d'images interactive avec navigation par vignettes et affichage en superposition.

**Fonctionnalites** :
- Affichage en grille de vignettes
- Clic pour agrandir l'image
- Vue en taille reelle avec superposition
- Manipulation dynamique du DOM

**Concepts JavaScript essentiels** :
```javascript noexec
// Parcours et manipulation du DOM
const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

// Creation dynamique d'elements
const newImage = document.createElement('img');
newImage.setAttribute('src', imagePath);

// Delegation d'evenements
thumbBar.addEventListener('click', (e) => {
    if(e.target.tagName === 'IMG') {
        displayedImage.src = e.target.src;
    }
});
```

**Fichiers** :
- `index.html` - Structure de la galerie
- `main.js` - Logique d'interaction de la galerie
- `style.css` - Mise en forme de la galerie
- `images/` - Ressources images

### 3. Intro Objects - Balles rebondissantes

**Emplacement** : `Intro Objects/`

**Concept** : JavaScript oriente objet avec des balles rebondissantes animees sur un canvas.

**Fonctionnalites** :
- Programmation orientee objet (classes/constructeurs)
- Dessin sur Canvas 2D
- Boucle d'animation avec `requestAnimationFrame`
- Detection de collisions
- Simulation physique (vitesse, gravite)

**Concepts JavaScript essentiels** :
```javascript noexec
// Fonction constructeur / Classe
function Ball(x, y, velX, velY, color, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.size = size;
}

// Dessin sur le canvas
Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
}

// Mise a jour physique
Ball.prototype.update = function() {
    // Detection de collision avec les bords
    if((this.x + this.size) >= width || (this.x - this.size) <= 0) {
        this.velX = -(this.velX);
    }
    
    // Mettre a jour la position
    this.x += this.velX;
    this.y += this.velY;
}

// Boucle d'animation
function loop() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, width, height);
    
    for(let ball of balls) {
        ball.draw();
        ball.update();
        ball.collisionDetect();
    }
    
    requestAnimationFrame(loop);
}
```

**Fichiers** :
- `index-finished.html` - Configuration du canvas
- `main-finished.js` - Logique d'animation des balles
- `style.css` - Mise en forme du canvas

## Competences acquises

### Fondamentaux JavaScript
- Variables (let, const) et types de donnees
- Fonctions et fonctions flechees
- Tableaux et objets litteraux
- Chaines de gabarit (template literals) et manipulation de chaines

### Manipulation du DOM
- Selection d'elements (`querySelector`, `getElementById`)
- Creation et modification d'elements
- Ecouteurs d'evenements et gestion des evenements
- Traitement des saisies de formulaire

### JavaScript oriente objet
- Fonctions constructeurs
- Prototypes et methodes
- Proprietes et methodes d'objets
- Mot-cle `this`

### API Canvas
- Contexte 2D (`getContext('2d')`)
- Dessin de formes (`arc`, `fillRect`)
- Boucles d'animation (`requestAnimationFrame`)
- Systemes de coordonnees

### Algorithmes
- Generation de nombres aleatoires
- Detection de collisions
- Simulation physique
- Gestion des images d'animation

## Execution des exercices

Tous les exercices s'executent directement dans le navigateur. Aucune etape de compilation n'est requise.

```bash
# Ouvrir n'importe quel fichier HTML dans un navigateur
firefox First\ Step/index.html
firefox Building\ Blocks/index.html
firefox Intro\ Objects/index-finished.html
```

## Compatibilite navigateur

Tous les exercices utilisent les fonctionnalites standard de JavaScript ES6+ :
- Declarations `const`/`let`
- Fonctions flechees
- Chaines de gabarit (template literals)
- API Canvas 2D

Teste sur :
- Firefox 88+
- Chrome 90+
- Edge 90+
