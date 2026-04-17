---
title: "TP1-2 - JavaScript Introduction"
sidebar_position: 1
---

# TP1-2 - JavaScript Introduction

## Objective

Learn JavaScript fundamentals through hands-on exercises covering variables, functions, DOM manipulation, events, and object-oriented programming.

## Assignment

**File**: TP-intro-JS.pdf

**Topics**:
- JavaScript basics (variables, functions, arrays)
- DOM manipulation and event handling
- Object-oriented JavaScript
- Template literals and string manipulation
- Random value generation

## Exercises

### 1. First Step - Silly Story Generator

**Location**: `First Step/`

**Concept**: Interactive story generator using template strings, random selection, and form input.

**Features**:
- Random story generation from predefined templates
- Custom name input
- US/UK unit conversion (Fahrenheit ↔ Celsius, pounds ↔ stone)
- DOM event handling

**Key JavaScript Concepts**:
```javascript
// Random array selection
function randomValueFromArray(array) {
    const random = Math.floor(Math.random() * array.length);
    return array[random];
}

// Template string replacement
let story = "It was 94 fahrenheit outside...";
story = story.replace(":insertx:", randomValue);

// Event listeners
button.addEventListener('click', generateStory);

// Form input handling
if(customName.value !== '') {
    story = story.replace("Bob", customName.value);
}

// Unit conversion
let celsius = Math.round((fahrenheit - 32) * 5/9);
```

**Files**:
- `index.html` - HTML structure with form inputs
- `main.js` - JavaScript logic for story generation

### 2. Building Blocks - Image Gallery

**Location**: `Building Blocks/`

**Concept**: Interactive image gallery with thumbnail navigation and overlay display.

**Features**:
- Thumbnail grid display
- Click to enlarge image
- Full-size overlay view
- Dynamic DOM manipulation

**Key JavaScript Concepts**:
```javascript
// DOM traversal and manipulation
const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

// Dynamic element creation
const newImage = document.createElement('img');
newImage.setAttribute('src', imagePath);

// Event delegation
thumbBar.addEventListener('click', (e) => {
    if(e.target.tagName === 'IMG') {
        displayedImage.src = e.target.src;
    }
});
```

**Files**:
- `index.html` - Gallery structure
- `main.js` - Gallery interaction logic
- `style.css` - Gallery styling
- `images/` - Image assets

### 3. Intro Objects - Bouncing Balls

**Location**: `Intro Objects/`

**Concept**: Object-oriented JavaScript with animated bouncing balls on canvas.

**Features**:
- Object-oriented programming (classes/constructors)
- Canvas 2D drawing
- Animation loop with `requestAnimationFrame`
- Collision detection
- Physics simulation (velocity, gravity)

**Key JavaScript Concepts**:
```javascript
// Constructor function / Class
function Ball(x, y, velX, velY, color, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.size = size;
}

// Canvas drawing
Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
}

// Physics update
Ball.prototype.update = function() {
    // Boundary collision detection
    if((this.x + this.size) >= width || (this.x - this.size) <= 0) {
        this.velX = -(this.velX);
    }
    
    // Update position
    this.x += this.velX;
    this.y += this.velY;
}

// Animation loop
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

**Files**:
- `index-finished.html` - Canvas setup
- `main-finished.js` - Ball animation logic
- `style.css` - Canvas styling

## Key Learning Outcomes

### JavaScript Fundamentals
- Variables (let, const) and data types
- Functions and arrow functions
- Arrays and object literals
- Template literals and string manipulation

### DOM Manipulation
- Selecting elements (`querySelector`, `getElementById`)
- Creating and modifying elements
- Event listeners and event handling
- Form input processing

### Object-Oriented JavaScript
- Constructor functions
- Prototypes and methods
- Object properties and methods
- `this` keyword

### Canvas API
- 2D context (`getContext('2d')`)
- Drawing shapes (`arc`, `fillRect`)
- Animation loops (`requestAnimationFrame`)
- Coordinate systems

### Algorithms
- Random number generation
- Collision detection
- Physics simulation
- Animation frame management

## Running the Exercises

All exercises run directly in the browser. No build step required.

```bash
# Open any HTML file in a browser
firefox First\ Step/index.html
firefox Building\ Blocks/index.html
firefox Intro\ Objects/index-finished.html
```

## Browser Compatibility

All exercises use standard JavaScript ES6+ features:
- `const`/`let` declarations
- Arrow functions
- Template literals
- Canvas 2D API

Tested on:
- Firefox 88+
- Chrome 90+
- Edge 90+
