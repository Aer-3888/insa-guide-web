---
title: "Chapitre 3 : JavaScript ES6+ -- Le langage du Web"
sidebar_position: 3
---

# Chapitre 3 : JavaScript ES6+ -- Le langage du Web

## Table des matieres

1. [Variables et types](#1-variables-et-types)
2. [Fonctions et arrow functions](#2-fonctions-et-arrow-functions)
3. [Objets et JSON](#3-objets-et-json)
4. [Tableaux et methodes fonctionnelles](#4-tableaux-et-methodes-fonctionnelles)
5. [Classes ES6](#5-classes-es6)
6. [DOM et evenements](#6-dom-et-evenements)
7. [Programmation asynchrone](#7-programmation-asynchrone)
8. [Modules](#8-modules)
9. [Pieges courants](#9-pieges-courants)
10. [Cheat Sheet](#10-cheat-sheet)

---

## 1. Variables et types

### Declaration

```javascript
const PI = 3.14;      // non reassignable (privilegier const)
let compteur = 0;     // reassignable, portee de bloc
// var x = 10;        // ANCIEN, portee de fonction, A EVITER
```

**Attention** : `const` ne signifie pas immutable pour les objets/tableaux.
```javascript
const tab = [1, 2, 3];
tab.push(4);    // OK : on modifie le contenu, pas la reference
// tab = [];    // ERREUR : on ne peut pas reassigner
```

### Types primitifs

```javascript
typeof 42;          // "number"
typeof "hello";     // "string"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof null;        // "object"   <-- piege historique !
typeof [1, 2];      // "object"   <-- tableaux = objets
```

### Comparaison : == vs ===

```javascript
// == (avec conversion) : A EVITER
0 == "";        // true
"1" == 1;       // true

// === (stricte) : TOUJOURS UTILISER
0 === "";       // false
"1" === 1;      // false
```

### Template strings

```javascript
const nom = "Alice";
const msg = `Bonjour ${nom}, 2+2 = ${2+2}`;   // backticks
```

---

## 2. Fonctions et arrow functions

```javascript noexec
// Declaration classique (hoisted)
function addition(a, b) { return a + b; }

// Arrow function (retour implicite)
const multiplier = (a, b) => a * b;
const doubler = x => x * 2;
const direBonjour = () => "Bonjour !";

// Parametres par defaut
function saluer(nom = "Monde") { return `Bonjour ${nom}`; }

// Destructuration
function afficher({ nom, age }) { console.log(`${nom}, ${age} ans`); }

// Spread / Rest
const somme = (...nombres) => nombres.reduce((acc, n) => acc + n, 0);
const tab2 = [...tab1, 4, 5];   // copie + ajout
```

### ATTENTION : this dans les arrow functions

```javascript noexec
const jeu = {
    points: 0,
    // function : this = l'objet jeu
    incrementer: function() { this.points++; },       // OK
    // arrow : this = contexte ENGLOBANT (PAS l'objet)
    incrementerArrow: () => { this.points++; }         // BUG
};
```

> Utiliser `function` pour les methodes d'objets, arrow functions pour les callbacks.

---

## 3. Objets et JSON

### Objets JavaScript

```javascript
const personne = {
    nom: "Alice",
    age: 22,
    saluer() { return `Bonjour, je suis ${this.nom}`; }
};
personne.nom;            // "Alice"
personne["nom"];         // "Alice"
```

### JSON (JavaScript Object Notation)

```json
{
    "idcard": 1843739,
    "name": "John Doe",
    "address": ["Adress 1", "Adress 2"],
    "phone": { "prefix": "+33", "number": "000000" },
    "siblings": null,
    "alive": false
}
```

**Regles JSON** :
- Cles TOUJOURS entre guillemets doubles `""`
- Valeurs : string, number, boolean, null, array, object
- Pas de commentaires, pas de fonctions, pas de trailing comma

```javascript noexec
JSON.stringify(objet);     // objet -> texte JSON
JSON.parse(texte);         // texte JSON -> objet
```

---

## 4. Tableaux et methodes fonctionnelles

```javascript
const nombres = [1, 2, 3, 4, 5];

nombres.forEach(n => console.log(n));          // parcourir
const doubles = nombres.map(n => n * 2);       // transformer -> [2,4,6,8,10]
const pairs = nombres.filter(n => n % 2 === 0); // filtrer -> [2,4]
const premier = nombres.find(n => n > 3);      // trouver -> 4
const total = nombres.reduce((acc, n) => acc + n, 0); // accumuler -> 15
nombres.some(n => n > 4);                      // au moins un ? -> true
nombres.every(n => n > 0);                     // tous ? -> true
nombres.includes(3);                           // contient ? -> true
```

### Exemple combine (frequent en DS)

```javascript
const etudiants = [
    { nom: "Alice", note: 16 },
    { nom: "Bob", note: 8 },
    { nom: "Charlie", note: 14 }
];

const reussite = etudiants
    .filter(e => e.note >= 10)
    .sort((a, b) => b.note - a.note)
    .map(e => e.nom);
// ["Alice", "Charlie"]
```

---

## 5. Classes ES6

```javascript noexec
export class Shape {
    constructor(color, linewidth) {
        this.color = color;
        this.linewidth = linewidth;
    }
    describe() { return `Shape ${this.color}`; }
}

export class Rectangle extends Shape {
    constructor(color, linewidth, x, y, w, h) {
        super(color, linewidth);
        this.x = x; this.y = y;
        this.w = w; this.h = h;
    }
    area() { return this.w * this.h; }
}
```

---

## 6. DOM et evenements

### Selectionner des elements

```javascript noexec
document.getElementById("header");            // un element par id
document.querySelector(".carte");              // premier par selecteur CSS
document.querySelectorAll(".carte");           // tous par selecteur CSS
```

### Modifier le DOM

```javascript noexec
element.textContent = "Nouveau texte";         // securise (pas de HTML)
element.classList.add("active");               // ajouter une classe
element.setAttribute("data-x", "3");           // attribut
element.style.backgroundColor = "red";         // style direct

const div = document.createElement("div");     // creer
conteneur.appendChild(div);                     // ajouter au DOM
element.remove();                               // supprimer
```

### Evenements

```javascript noexec
// addEventListener (RECOMMANDE)
bouton.addEventListener("click", (evt) => {
    evt.target;           // element qui a declenche
    evt.currentTarget;    // element sur lequel le handler est attache
    evt.preventDefault(); // empecher le comportement par defaut
});

// Evenements courants :
// click, dblclick, mousedown, mouseup, mousemove
// keydown, keyup, submit, change, input, focus, blur
// DOMContentLoaded, load, scroll, resize
```

### Propagation

```
Phase 1: CAPTURE (document -> cible)
Phase 2: TARGET  (sur l'element)
Phase 3: BUBBLING (cible -> document)  <-- defaut de addEventListener
```

```javascript noexec
evt.stopPropagation();  // arreter la remontee
```

### Delegation d'evenements

```javascript noexec
liste.addEventListener("click", (evt) => {
    if (evt.target.tagName === "LI") {
        console.log(evt.target.textContent);
    }
});
```

---

## 7. Programmation asynchrone

### Promises

```javascript noexec
const promesse = new Promise((resolve, reject) => {
    if (succes) resolve("Donnees");
    else reject("Erreur");
});
promesse.then(data => ...).catch(err => ...);
```

### async/await

```javascript noexec
async function chargerUtilisateur(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        return await response.json();
    } catch (err) {
        console.error("Erreur:", err);
    }
}
```

### fetch API

```javascript noexec
// GET
const data = await (await fetch('/api/data')).json();

// POST
await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nom: "Alice", age: 22 })
});
```

---

## 8. Modules

```javascript noexec
// utils.js -- exports nommes
export function addition(a, b) { return a + b; }
export const PI = 3.14;

// main.js
import { addition, PI } from './utils.js';

// Export par defaut
export default class Calculatrice { }
import Calculatrice from './Calculatrice.js';  // pas d'accolades

// Import complet
import * as utils from './utils.js';
```

---

## 9. Pieges courants

1. **== au lieu de ===** : toujours `===` et `!==`
2. **this dans arrow functions** : ne pointe pas vers l'objet
3. **var au lieu de let/const** : `var` a une portee de fonction, fuite de variable
4. **typeof null === "object"** : bug historique, utiliser `=== null`
5. **Oublier await** : `fetch()` retourne une Promise, pas les donnees
6. **JSON.stringify de fonctions** : les fonctions disparaissent du JSON

---

## 10. Cheat Sheet

```
Variables : const (defaut), let (si mutation), JAMAIS var
Types : number, string, boolean, null, undefined, object
Comparaison : TOUJOURS ===
Fonctions : arrow pour callbacks, function pour methodes
Tableaux : map, filter, find, reduce, forEach, some, every
JSON : stringify (objet->texte), parse (texte->objet)
DOM : querySelector, textContent, classList, addEventListener
Async : async/await, fetch, Promise, try/catch
Modules : export/import { } from
```
