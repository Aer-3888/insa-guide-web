---
title: "Chapitre 2 : HTML et CSS -- Les fondations du Web"
sidebar_position: 2
---

# Chapitre 2 : HTML et CSS -- Les fondations du Web

## Table des matieres

1. [HTML : structure d'une page](#1-html--structure-dune-page)
2. [Balises HTML essentielles](#2-balises-html-essentielles)
3. [Formulaires HTML](#3-formulaires-html)
4. [CSS : mise en forme](#4-css--mise-en-forme)
5. [Selecteurs CSS et specificite](#5-selecteurs-css-et-specificite)
6. [Modele de boite (Box Model)](#6-modele-de-boite-box-model)
7. [Flexbox et Grid](#7-flexbox-et-grid)
8. [Design adaptatif (responsive)](#8-design-adaptatif-responsive)
9. [Pieges courants](#9-pieges-courants)
10. [Aide-memoire](#10-aide-memoire)

---

## 1. HTML : structure d'une page

### Document HTML minimal

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Bienvenue</h1>
    <p>Mon paragraphe.</p>
    <script src="main.js"></script>
</body>
</html>
```

### Anatomie d'une balise

```
   balise ouvrante          contenu          balise fermante
        |                     |                    |
        v                     v                    v
    <a href="url" class="lien">Cliquez ici</a>
        ^                                      ^
    attributs                            element complet
```

**Regles** :
- Toute balise ouverte doit etre fermee : `<p>...</p>`
- Balises auto-fermantes : `<br/>`, `<img/>`, `<input/>`
- Imbrication correcte : `<p><strong>OK</strong></p>` (pas `<p><strong>FAUX</p></strong>`)

---

## 2. Balises HTML essentielles

### Titres, texte, listes

```html
<h1>Titre principal</h1>    <!-- un seul h1 par page -->
<h2>Sous-titre</h2>
<p>Paragraphe</p>
<strong>Gras</strong>  <em>Italique</em>

<ul><li>Puce 1</li><li>Puce 2</li></ul>     <!-- liste non ordonnee -->
<ol><li>Etape 1</li><li>Etape 2</li></ol>   <!-- liste ordonnee -->
```

### Conteneurs semantiques HTML5

```html
<header>En-tete</header>
<nav>Navigation</nav>
<main>Contenu principal</main>
<section>Section thematique</section>
<article>Article independant</article>
<aside>Contenu lateral</aside>
<footer>Pied de page</footer>

<div>Bloc generique (display: block)</div>
<span>En ligne (display: inline)</span>
```

### Tableaux

```html
<table>
    <thead>
        <tr><th>Nom</th><th>Note</th></tr>
    </thead>
    <tbody>
        <tr><td>Alice</td><td>16</td></tr>
        <tr><td>Bob</td><td>14</td></tr>
    </tbody>
</table>
```

---

## 3. Formulaires HTML

```html
<form action="/api/submit" method="POST">
    <label for="nom">Nom :</label>
    <input type="text" id="nom" name="nom" placeholder="Votre nom" required/>

    <input type="email" name="email" placeholder="email@exemple.fr"/>
    <input type="password" name="mdp"/>

    <input type="checkbox" name="accepte" id="accepte"/>
    <label for="accepte">J'accepte</label>

    <input type="radio" name="genre" value="h"/> Homme
    <input type="radio" name="genre" value="f"/> Femme

    <select name="pays">
        <option value="fr">France</option>
        <option value="de">Allemagne</option>
    </select>

    <textarea name="message" rows="4" cols="50"></textarea>
    <button type="submit">Envoyer</button>
</form>
```

---

## 4. CSS : mise en forme

### Trois manieres d'appliquer du CSS

```html
<!-- 1. En ligne (a eviter) -->
<p style="color: red;">Texte</p>

<!-- 2. Interne (dans le head) -->
<style> p { color: blue; } </style>

<!-- 3. Externe (recommande) -->
<link rel="stylesheet" href="style.css"/>
```

### Proprietes CSS les plus utilisees

| Propriete | Description | Exemple |
|-----------|-------------|---------|
| `color` | Couleur du texte | `color: #333;` |
| `background-color` | Couleur de fond | `background-color: #f0f0f0;` |
| `font-size` | Taille de police | `font-size: 16px;` |
| `margin` | Marge exterieure | `margin: 10px 20px;` |
| `padding` | Marge interieure | `padding: 15px;` |
| `border` | Bordure | `border: 1px solid black;` |
| `width` / `height` | Dimensions | `width: 100%;` |
| `display` | Mode d'affichage | `display: flex;` |

---

## 5. Selecteurs CSS et specificite

### Selecteurs de base

```css
p { }                    /* balise */
.important { }           /* classe (.) */
#header { }              /* identifiant (#) -- unique */
* { }                    /* universel */
div p { }                /* descendant */
div > p { }              /* enfant direct */
p.note { }               /* element + classe */
input[type="text"] { }   /* attribut */
a:hover { }              /* pseudo-classe */
```

### Specificite (priorite croissante)

```
balise (p, div)           -->  0,0,1
classe (.maclasse)        -->  0,1,0
identifiant (#monid)      -->  1,0,0
style en ligne (style="") -->  1,0,0,0
!important                -->  surpasse tout (a eviter)
```

> A specificite egale, c'est la derniere declaration qui gagne.

---

## 6. Modele de boite (Box Model)

```
+-----------------------------------------------+
|                   MARGIN                       |
|   +---------------------------------------+   |
|   |              BORDER                   |   |
|   |   +-------------------------------+   |   |
|   |   |           PADDING             |   |   |
|   |   |   +-----------------------+   |   |   |
|   |   |   |       CONTENT         |   |   |   |
|   |   |   +-----------------------+   |   |   |
|   |   +-------------------------------+   |   |
|   +---------------------------------------+   |
+-----------------------------------------------+
```

```css
/* Bonne pratique : appliquer border-box a tous les elements */
* { box-sizing: border-box; }
```

Sans `border-box` : `width: 200px` + `padding: 10px` + `border: 2px` = 224px
Avec `border-box` : `width: 200px` inclut tout = 200px

---

## 7. Flexbox et Grid

### Flexbox

```css
.conteneur {
    display: flex;
    flex-direction: row;       /* row | column */
    justify-content: center;   /* alignement axe principal */
    align-items: center;       /* alignement axe secondaire */
    gap: 10px;
    flex-wrap: wrap;
}
.element { flex: 1; }          /* prend l'espace disponible */
```

### CSS Grid

```css
.grille {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* 3 colonnes egales */
    gap: 10px;
}
```

### Variables CSS

```css
:root {
    --couleur-primaire: #3498db;
    --espacement: 10px;
}
.bouton {
    background-color: var(--couleur-primaire);
    padding: var(--espacement);
}
```

---

## 8. Design adaptatif (responsive)

```css
/* Media query : adapter le layout selon la taille de l'ecran */
@media (max-width: 768px) {
    .conteneur { flex-direction: column; }
}
```

```html
<!-- Meta viewport obligatoire pour le responsive -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 9. Pieges courants

1. **Oublier le DOCTYPE** : sans `<!DOCTYPE html>`, mode "quirks" imprevisible
2. **Confondre id et class** : id = unique, class = reutilisable
3. **Mauvaise imbrication** : `<p><strong>texte</p></strong>` = FAUX
4. **Oublier box-sizing** : debordements inattendus
5. **Confondre block et inline** : block prend toute la largeur, inline = largeur du contenu

---

## 10. Aide-memoire

```
HTML minimal :
  <!DOCTYPE html>
  <html><head><meta charset="UTF-8"><title>T</title></head>
  <body>...</body></html>

Balises semantiques : header, nav, main, section, article, aside, footer
Conteneurs generiques : div (block), span (inline)

CSS :
  Selecteurs : balise, .classe, #id, *, [attr], :pseudo
  Specificite : id > classe > balise
  Modele de boite : content + padding + border + margin
  border-box : width inclut padding + border

Mise en page :
  Flexbox : display: flex + justify-content + align-items
  Grid : display: grid + grid-template-columns
  Variables : --nom: val; utiliser avec var(--nom)
```
