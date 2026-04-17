---
title: "Ingenierie Web -- Guide de cours S6 INSA Rennes"
sidebar_position: 0
---

# Ingenierie Web -- Guide de cours S6 INSA Rennes

## Presentation du cours

Ce cours couvre les fondamentaux de l'ingenierie Web moderne, du HTML/CSS jusqu'au developpement d'applications Web completes avec front-end Angular et back-end Java Spring Boot.

**Enseignant** : Arnaud Blouin (arnaud.blouin@irisa.fr)

**Competences visees** :
- Fabriquer un back-end REST en Java (Spring Boot)
- Definir, tester et securiser des routes REST
- Utiliser du marshalling et des DTO
- Lier un back-end avec une base de donnees via un ORM (JPA)
- Concevoir une API REST avec OpenAPI
- Maitriser les bases de TypeScript et Angular

## Architecture d'une application Web

```
+-------------------+          +-------------------+          +-------------------+
|    FRONT-END      |  REST    |    BACK-END       |   ORM    |   BASE DE         |
|                   |  HTTP    |                   |   JPA    |   DONNEES         |
|  HTML + CSS       |<-------->|  Spring Boot      |<-------->|                   |
|  TypeScript       |  JSON    |  Java 17          |          |  H2 / PostgreSQL  |
|  Angular          |          |  Controllers      |          |                   |
|                   |          |  Services          |          |                   |
+-------------------+          +-------------------+          +-------------------+
     Navigateur                   Serveur (localhost:8080)        Stockage
```

## Parcours d'apprentissage

```
Semaine 1-2          Semaine 3-4          Semaine 5-6          Semaine 7-8
+-----------+        +-----------+        +-----------+        +-----------+
| HTML/CSS  |------->| JavaScript|------->| REST API  |------->| Angular   |
| bases du  |        | ES6+ et   |        | Spring    |        | TypeScript|
| Web       |        | DOM       |        | Boot, ORM |        | Front-end |
+-----------+        +-----------+        +-----------+        +-----------+
```

## Plan du guide

| # | Chapitre | Fichier | Description |
|---|----------|---------|-------------|
| 1 | HTTP et fondamentaux Web | [01_http_web_fundamentals.md](/S6/Ingenierie_Web/guide/01-http-web-fundamentals) | HTTP, REST, URL, client-serveur |
| 2 | HTML et CSS | [02_html_css.md](/S6/Ingenierie_Web/guide/02-html-css) | Structure HTML, CSS, Flexbox, Grid |
| 3 | JavaScript ES6+ | [03_javascript.md](/S6/Ingenierie_Web/guide/03-javascript) | Types, fonctions, classes, async, fetch |
| 4 | Java Servlets et Spring Boot | [04_java_spring_boot.md](/S6/Ingenierie_Web/guide/04-java-spring-boot) | Routes REST, DTO, services, tests |
| 5 | ORM et JPA | [05_orm_jpa.md](/S6/Ingenierie_Web/guide/05-orm-jpa) | Entites, relations, repositories |
| 6 | XML et JSON | [06_xml_json.md](/S6/Ingenierie_Web/guide/06-xml-json) | Formats de donnees, schemas, marshalling |
| 7 | Securite Web | [07_web_security.md](/S6/Ingenierie_Web/guide/07-web-security) | XSS, CSRF, authentification, sessions |
| 8 | Angular et TypeScript | [08_angular_typescript.md](/S6/Ingenierie_Web/guide/08-angular-typescript) | Composants, data binding, HttpClient |

## Correspondance avec les materiaux

| Chapitre du guide | Cours source | TP associe |
|--------------------|-------------|------------|
| 01 HTTP / Web | Poly 2022.pdf (intro), Web-3INFO.pdf | - |
| 02 HTML/CSS | Poly 2022.pdf (intro) | TP1 (Building Blocks) |
| 03 JavaScript ES6+ | Poly 2022.pdf, TP-intro-JS.pdf | TP1 (First Step, ES6 Babel) |
| 04 Spring Boot | Web-3INFO.pdf, Poly 2022.pdf | TP legacy (springboot2) |
| 05 ORM/JPA | Poly 2022.pdf | TP4 (JPA), TP legacy (JPA) |
| 06 XML/JSON | Poly 2022.pdf | TP3 (data formats) |
| 07 Securite | Poly 2022.pdf | TP legacy (auth) |
| 08 Angular | front-end1.pdf, front-end2.pdf | TP5 (Angular) |

## Structure typique du DS (basee sur les annales 2017-2023)

| Exercice | Theme | Points | Ce qu'on vous demande |
|----------|-------|--------|----------------------|
| **1** | JSON / XML | ~2-3 pts | Ecrire JSON/XML a partir d'un diagramme UML |
| **2** | ORM / JPA | ~6 pts | Annotations JPA sur un diagramme UML |
| **3** | Routes REST | ~10 pts | Verbe + URI + body + DTO + codes HTTP |
| **4** | Securite | ~2 pts | Authentification, sessions, droits d'acces |
