---
title: "TP CPOO1 - UML vers Java : Associations et Composition"
sidebar_position: 1
---

# TP CPOO1 - UML vers Java : Associations et Composition

## Apercu

Ce TP se concentre sur l'implementation de diagrammes de classes UML en Java, en explorant les differents types d'associations entre objets : associations simples, associations bidirectionnelles et relations de composition.

## Objectifs d'apprentissage

- Convertir des diagrammes de classes UML en code Java
- Implementer des associations unidirectionnelles et bidirectionnelles
- Comprendre et implementer des relations de composition
- Maintenir l'integrite referentielle dans les associations bidirectionnelles
- Ecrire des tests JUnit complets pour les relations entre objets
- Utiliser IntelliJ IDEA pour le developpement Java

## Prerequis

- Java 11 ou superieur
- IntelliJ IDEA configure pour le developpement Java
- JUnit 5 pour les tests

## Structure du projet

```
tp1/
├── q1/          # Exercice 1 : Association unidirectionnelle simple (Velo → Guidon)
├── q2/          # Exercice 2 : Association bidirectionnelle avec integrite referentielle
├── q3/          # Exercice 3 : Suppression de l'acces bidirectionnel (Guidon ne peut plus acceder a Velo)
├── q4/          # Exercice 4 : Association un-vers-plusieurs (Velo → Roue[*])
├── q5/          # Exercice 5 : Composition avec navigation bidirectionnelle (Velo ↔ Roue)
└── q6/          # Exercice 6 : Execution des tests avec la suite de tests Moodle
```

## Exercices

### Q.1 - Association simple (0..1)

**Objectif** : Creer une association unidirectionnelle simple entre `Velo` et `Guidon`.

**Diagramme UML** :
```
┌─────────────┐         guidon    ┌─────────────┐
│    Velo     │ ──────────────────>│   Guidon    │
│─────────────│         0..1       │─────────────│
│             │                    │             │
│ getGuidon() │        velo        │ getVelo()   │
│ setGuidon() │         0..1       │ setVelo()   │
└─────────────┘                    └─────────────┘
```

**Details d'implementation** :
- Un `Velo` peut avoir 0 ou 1 `Guidon`
- Un `Guidon` peut etre associe a 0 ou 1 `Velo`
- Les deux classes ont des getters et setters

**Fichier** : `q1/src/main/java/q1/Velo.java`, `q1/src/main/java/q1/Guidon.java`

### Q.2 - Association bidirectionnelle avec integrite referentielle

**Objectif** : Assurer l'integrite referentielle lors de l'ajout d'un `Guidon` a un `Velo`.

**Concept cle** : Quand on ajoute un `Guidon` a un `Velo`, le `Guidon` devrait automatiquement referencer le `Velo` (principe d'integrite referentielle).

**Implementation** :
- Copier les classes de q1 vers le package q2
- Modifier `setGuidon()` pour maintenir l'integrite referentielle
- Quand `velo.setGuidon(guidon)` est appele, `guidon.setVelo(velo)` devrait etre appele automatiquement

**Fichier** : `q2/src/main/java/q2/Velo.java`, `q2/src/main/java/q2/Guidon.java`

### Q.3 - Suppression de l'acces bidirectionnel

**Objectif** : Empecher `Guidon` d'acceder a son `Velo` parent.

**Diagramme UML** :
```
┌─────────────┐         guidon    ┌─────────────┐
│    Velo     │ ──────────────────>│   Guidon    │
│─────────────│            1       │─────────────│
│ getGuidon() │                    │             │
│ setGuidon() │                    │             │
└─────────────┘                    └─────────────┘
```

**Implementation** :
- Copier les classes de q2 vers le package q3
- Supprimer le champ `velo` et les methodes associees de `Guidon`
- Mettre a jour `Velo.setGuidon()` en consequence

**Fichier** : `q3/src/main/java/q3/Velo.java`, `q3/src/main/java/q3/Guidon.java`

### Q.4 - Association un-vers-plusieurs

**Objectif** : Implementer une association un-vers-plusieurs ou un `Velo` a plusieurs `Roue` (roues).

**Diagramme UML** :
```
┌─────────────────┐      roues     ┌─────────────┐
│      Velo       │ ──────────────>│    Roue     │
│─────────────────│        0..*    │─────────────│
│ getRoues()      │                │             │
│ addRoue()       │                │             │
│ removeRoue()    │                │             │
└─────────────────┘                └─────────────┘
```

**Implementation** :
- Creer `Velo` avec une `List<Roue>` (association multiple)
- Creer la classe `Roue`
- Implementer les methodes pour ajouter/retirer des roues

**Fichier** : `q4/src/main/java/q4/Velo.java`, `q4/src/main/java/q4/Roue.java`

### Q.5 - Composition avec navigation bidirectionnelle

**Objectif** : Implementer la composition ou `Roue` appartient a exactement un `Velo`, et `Velo` peut acceder a ses roues.

**Diagramme UML** :
```
┌─────────────────┐       velo     ┌─────────────┐
│      Velo       │ ───────────────│    Roue     │
│─────────────────│ 0..1       0..*│─────────────│
│ getRoues()      │      roues     │ getVelo()   │
│ addRoue()       │ ───────────────>│ setVelo()   │
│ removeRoue()    │                │             │
└─────────────────┘                └─────────────┘
```

**Concept cle** : Respecter l'integrite referentielle du role `roues` dans la composition.

**Implementation** :
- Copier les classes de q4 vers le package q5
- Ajouter la navigation bidirectionnelle
- S'assurer que lors de l'ajout d'une `Roue` a un `Velo`, la `Roue` reference automatiquement le `Velo`
- Gerer correctement le retrait (mettre `velo` a null lors du retrait)

**Fichier** : `q5/src/main/java/q5/Velo.java`, `q5/src/main/java/q5/Roue.java`

### Q.6 - Tests avec la suite de tests Moodle

**Objectif** : Executer les tests fournis par Moodle et corriger les eventuels problemes.

**Etapes** :
1. Telecharger l'archive de tests depuis Moodle
2. Extraire dans le repertoire `test/java2`
3. Dans IntelliJ : clic droit sur `java2` -> "Mark directory as" -> "Test Sources Root"
4. Executer les tests et corriger les problemes

## Compilation et execution

### Compiler tous les exercices

```bash
# Depuis le repertoire tp1
javac q1/src/main/java/q1/*.java
javac q2/src/main/java/q2/*.java
javac q3/src/main/java/q3/*.java
javac q4/src/main/java/q4/*.java
javac q5/src/main/java/q5/*.java
```

### Executer les tests

```bash
# Avec IntelliJ : Clic droit sur la classe de test → Run
# Ou en ligne de commande avec JUnit :
java -cp .:junit-platform-console-standalone.jar org.junit.platform.console.ConsoleLauncher --scan-classpath
```

## Concepts POO cles

### 1. Association
- Represente une relation "utilise" ou "possede"
- Peut etre unidirectionnelle ou bidirectionnelle
- La multiplicite definit combien d'objets peuvent etre impliques

### 2. Composition
- Forme forte d'agregation
- L'objet enfant ne peut pas exister sans le parent
- Le parent a la propriete exclusive

### 3. Integrite referentielle
- Assurer la coherence dans les relations bidirectionnelles
- Quand l'objet A reference l'objet B, B devrait referencer A
- Essentiel pour maintenir la coherence des donnees

### 4. Encapsulation
- Utiliser des champs prives avec des getters/setters publics
- Controler l'acces a l'etat interne
- Valider les donnees avant modification

## Problemes courants et solutions

### Probleme 1 : ConcurrentModificationException dans couperArbre()
```java
// INCORRECT : Modifier la liste pendant l'iteration
for (Arbre arbre : arbres) {
    if (condition) {
        arbres.remove(arbre); // ConcurrentModificationException!
    }
}

// CORRECT : Utiliser un iterateur ou une boucle par indice
for (int i = arbres.size() - 1; i >= 0; i--) {
    if (condition) {
        arbres.remove(i);
    }
}
```

### Probleme 2 : Oubli de l'integrite referentielle
```java
// INCORRECT : Mise a jour d'un seul cote
velo.setGuidon(guidon); // guidon.velo est toujours null !

// CORRECT : Mettre a jour les deux cotes
public void setGuidon(Guidon guidon) {
    this.guidon = guidon;
    if (guidon != null) {
        guidon.setVelo(this);
    }
}
```

### Probleme 3 : Verifications de null
```java
// Toujours verifier null avant les operations
public Boolean addRoue(Roue r) {
    if (r == null || this.roues.contains(r)) {
        return false;
    }
    // ... suite du code
}
```

## Strategie de test

1. **Tester la creation** : Ecrire des tests pour chaque methode
2. **Tester les cas limites** : valeurs null, collections vides, doublons
3. **Tester l'integrite referentielle** : Verifier que les relations bidirectionnelles sont maintenues
4. **Tester les changements d'etat** : Verifier l'etat des objets apres les operations

## Ressources

- [Framework Collections Java](https://docs.oracle.com/javase/8/docs/technotes/guides/collections/)
- [Guide utilisateur JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Diagrammes de classes UML](https://www.uml-diagrams.org/class-diagrams-overview.html)

## Auteur

INSA Rennes - Arnaud Blouin
Cours : CPOO (Conception et Programmation Orientee Objet) - 3e annee Informatique
