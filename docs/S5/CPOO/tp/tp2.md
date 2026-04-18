---
title: "TP CPOO1 - Exercice 1 : Systeme de gestion forestiere (Arbre/Foret)"
sidebar_position: 2
---

# TP CPOO1 - Exercice 1 : Systeme de gestion forestiere (Arbre/Foret)

## Apercu

Ce TP se concentre sur l'implementation d'un systeme de gestion forestiere oriente objet utilisant l'heritage, le polymorphisme, les collections et les generiques. Les etudiants apprennent a modeliser des hierarchies du monde reel a l'aide de classes abstraites et d'implementations concretes.

## Objectifs d'apprentissage

- Concevoir et implementer des hierarchies de classes par heritage
- Utiliser des classes et methodes abstraites pour un comportement commun
- Implementer le polymorphisme pour un comportement specialise
- Travailler avec les Collections Java (ArrayList)
- Utiliser l'operateur `instanceof` pour la verification de type a l'execution
- Appliquer les generiques pour une production de fruits type-safe
- Gerer correctement les iterateurs pour eviter les ConcurrentModificationException

## Structure du projet

```
tp2/
├── basic/          # Version basique sans generiques (Q.7-Q.17)
│   └── src/
│       ├── main/java/
│       │   ├── Arbre.java
│       │   ├── Chene.java
│       │   ├── Pin.java
│       │   └── Foret.java
│       └── test/java/
└── advanced/       # Version avancee avec generiques et animaux (Q.18-Q.20)
    └── src/
        ├── main/java/
        │   ├── Arbre.java      (avec generiques)
        │   ├── Chene.java
        │   ├── Pin.java
        │   ├── Foret.java
        │   ├── Fruit.java      (interface)
        │   ├── Gland.java
        │   ├── Cone.java
        │   ├── Animal.java     (interface)
        │   ├── Ecureuil.java
        │   └── Cochon.java
        └── test/java/
```

## Description du probleme

Une foret se compose de deux types d'arbres : les chenes et les pins. Chaque arbre possede :
- **Prix** : par metre cube (euros/m3)
  - Chene : 1000 euros/m3, doit avoir au moins 10 ans pour etre coupe
  - Pin : 500 euros/m3, doit avoir au moins 5 ans pour etre coupe
- **Age** : en annees (augmente avec `vieillir()`)
- **Volume** : en metres cubes (m3)

Le prix d'un arbre est calcule par : `prix_au_m3 x volume`.

## Exercices

### Q.7 - Dessiner le diagramme de classes UML

Concevoir un diagramme de classes UML representant la hierarchie d'heritage :
- Classe abstraite `Arbre` avec attributs et methodes communs
- Classes concretes `Chene` et `Pin` etendant `Arbre`

**Decisions de conception cles :**
- Utiliser l'heritage pour eviter la duplication de code
- Classe abstraite pour le comportement partage
- Classes concretes pour le comportement specialise

### Q.8 - Implementer les classes d'arbres basiques

Implementer le diagramme de classes en Java :

**Arbre.java** (abstraite) :
- `protected int prix` - prix au metre cube
- `protected double age` - age en annees
- `protected double volume` - volume en m3
- `protected double age_coupe` - age minimum pour couper
- `public Arbre(double age, double volume)` - constructeur
- `public void vieillir()` - incrementer l'age
- `public double getAge()` - obtenir l'age
- `public double getVolume()` - obtenir le volume
- `public double getPrix()` - calculer le prix total
- `public boolean peutEtreCoupe()` - verifier si l'arbre peut etre coupe

### Q.9 - Constructeur avec parametres

Ajouter un constructeur a `Arbre` prenant `age` et `volume` en parametres.
Mettre a jour les constructeurs des sous-classes pour appeler `super(age, volume)`.

### Q.10 - Ajouter la methode `vieillir()`

Implementer `vieillir()` pour incrementer l'age de l'arbre d'un an.

### Q.11 - Ajouter la methode `getPrix()`

Implementer `getPrix()` pour retourner le prix total : `prix * volume`.

### Q.12 - Ajouter la methode `peutEtreCoupe()`

Implementer `peutEtreCoupe()` pour retourner `true` si l'arbre est assez vieux pour etre coupe.

### Q.13 - Implementer la classe Foret

Creer une classe `Foret` pour gerer une collection d'arbres :

**Foret.java** :
- `private List<Arbre> arbres` - arbres de la foret
- `private List<Arbre> arbres_coupes` - arbres qui ont ete coupes
- `public Foret()` - constructeur initialisant des listes vides
- `public List<Arbre> getArbres()` - obtenir les arbres debout
- `public List<Arbre> getArbres_coupes()` - obtenir les arbres coupes

Utiliser `ArrayList<Arbre>` pour les collections. Inclure des getters pour les deux listes.

### Q.14 - Ajouter la methode `planterArbre()`

Ajouter une methode pour planter un arbre :
```java
public void planterArbre(Arbre arbre)
```

Cela ajoute l'arbre a la liste `arbres`.

### Q.15 - Ajouter la methode `getPrixTotal()`

Ajouter une methode pour calculer la valeur totale de tous les arbres debout :
```java
public double getPrixTotal()
```

Utiliser une boucle pour sommer les prix de tous les arbres de la foret.

### Q.16 - Ajouter la methode `couperArbre()`

Ajouter une methode pour couper un arbre de la foret :
```java
public boolean couperArbre()
```

Cette methode doit :
1. Trouver le premier arbre pouvant etre coupe (`peutEtreCoupe()`)
2. Le deplacer de `arbres` vers `arbres_coupes`
3. Retourner `true` si un arbre a ete coupe, `false` sinon

**Attention** : Evitez la `ConcurrentModificationException` !

**Probleme** :
```java
// INCORRECT : Modifier la liste pendant l'iteration
for (Arbre arbre : arbres) {
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        arbres.remove(arbre);  // ConcurrentModificationException!
        return true;
    }
}
```

**Solution 1 : Utiliser un Iterator** :
```java
Iterator<Arbre> iterator = arbres.iterator();
while (iterator.hasNext()) {
    Arbre arbre = iterator.next();
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        iterator.remove();  // Retrait sur
        return true;
    }
}
```

**Solution 2 : Utiliser une boucle par indice (ordre inverse)** :
```java
for (int i = arbres.size() - 1; i >= 0; i--) {
    Arbre arbre = arbres.get(i);
    if (arbre.peutEtreCoupe()) {
        arbres_coupes.add(arbre);
        arbres.remove(i);
        return true;
    }
}
```

### Q.17 - Ajouter la methode `getNombreChenes()`

Ajouter une methode pour compter les chenes dans la foret :
```java
public int getNombreChenes()
```

Utiliser l'operateur `instanceof` :
```java
if (arbre instanceof Chene) {
    nombreChenes++;
}
```

## Version avancee (avec generiques et animaux)

### Q.18 - Ajouter la production de fruits (generiques)

Les arbres produisent differents types de fruits :
- Les chenes (`Chene`) produisent des glands (`Gland`)
- Les pins (`Pin`) produisent des cones (`Cone`)

**Implementation** :
1. Creer l'interface `Fruit`
2. Creer les classes `Gland` et `Cone` implementant `Fruit`
3. Modifier `Arbre` pour utiliser les generiques : `Arbre<F extends Fruit>`
4. Ajouter la methode abstraite : `public abstract F produireFruit()`

**Arbre.java** (avec generiques) :
```java
public abstract class Arbre<F extends Fruit> {
    // ... code existant ...
    public abstract F produireFruit();
}
```

**Chene.java** :
```java
public class Chene extends Arbre<Gland> {
    @Override
    public Gland produireFruit() {
        return new Gland();
    }
}
```

### Q.19 - Ajouter les classes d'animaux

Des animaux vivent dans la foret et mangent des fruits specifiques :
- Les ecureuils (`Ecureuil`) mangent des cones
- Les cochons (`Cochon`) mangent des glands

**Implementation** :
1. Creer l'interface `Animal` avec la methode `manger(Fruit fruit)`
2. Creer les classes `Ecureuil` et `Cochon` implementant `Animal`
3. Chaque animal ne devrait manger que son type de fruit prefere

**Methode generique dans Animal** :
```java
public interface Animal<F extends Fruit> {
    void manger(F fruit);
}
```

### Q.20 - Tester le systeme complet

Ecrire des tests complets :
1. Creer une foret avec differents arbres
2. Faire vieillir les arbres
3. Recolter les fruits des arbres
4. Nourrir les animaux avec les fruits appropries
5. Couper des arbres et calculer la valeur totale

## Concepts POO cles

### 1. Heritage
- Reutiliser le code commun dans la classe de base
- Specialiser le comportement dans les sous-classes
- Le mot-cle `extends` etablit une relation "est-un"

### 2. Classes et methodes abstraites
- Impossible d'instancier les classes abstraites
- Les methodes abstraites doivent etre implementees par les sous-classes
- Melange de methodes concretes et abstraites autorise

### 3. Polymorphisme
- Type de reference vs type reel de l'objet
- Dispatch de methode base sur le type reel
- `instanceof` pour la verification de type a l'execution

### 4. Collections
- Interface `List<E>` pour les collections ordonnees
- `ArrayList<E>` pour l'implementation par tableau dynamique
- Eviter les `ConcurrentModificationException`

### 5. Generiques
- Collections et methodes type-safe
- Parametres de type bornes : `<F extends Fruit>`
- Verification de type a la compilation

## Problemes courants et solutions

### Probleme 1 : ConcurrentModificationException
**Probleme** : Modifier une collection pendant l'iteration avec une boucle foreach.
**Solution** : Utiliser Iterator.remove() ou une boucle par indice inverse.

### Probleme 2 : NullPointerException
**Probleme** : Ne pas initialiser les collections dans le constructeur.
**Solution** : Toujours initialiser les collections : `this.arbres = new ArrayList<>();`

### Probleme 3 : Mauvaise utilisation de instanceof
**Probleme** : Utiliser `instanceof` apres un cast.
**Solution** : Verifier le type avant de caster : `if (obj instanceof Type) { Type t = (Type) obj; }`

### Probleme 4 : Implementation manquante de methode abstraite
**Probleme** : Oublier d'implementer les methodes abstraites dans les classes concretes.
**Solution** : Utiliser l'annotation `@Override` et laisser l'IDE montrer les erreurs.

### Probleme 5 : Bornes generiques incorrectes
**Probleme** : `Arbre<Fruit>` au lieu de `Arbre<F extends Fruit>`.
**Solution** : Utiliser un parametre de type borne dans la declaration de la classe.

## Compilation et execution

### Compiler la version basique
```bash
cd tp2/basic/src
javac main/java/*.java
```

### Compiler la version avancee
```bash
cd tp2/advanced/src
javac main/java/*.java
```

### Executer les tests
```bash
# Avec IntelliJ : Clic droit sur la classe de test → Run
# Ou compiler et executer manuellement :
javac -cp .:junit-5.jar test/java/*.java
java -cp .:junit-5.jar org.junit.platform.console.ConsoleLauncher --scan-classpath
```

## Strategie de test

1. **Tester les constructeurs** : Verifier l'etat initial
2. **Tester le vieillissement** : Verifier que `vieillir()` incremente l'age
3. **Tester le calcul du prix** : Verifier la formule de `getPrix()`
4. **Tester la logique de coupe** : Verifier le seuil d'age
5. **Tester les operations de la foret** : Planter, couper, compter les arbres
6. **Tester la verification de type** : Verifier que `instanceof` fonctionne correctement
7. **Tester les generiques** : Verifier la surete de type pour les fruits et les animaux

## Diagramme UML (Version avancee)

```
                    ┌─────────────────┐
                    │     <<abstract>> │
                    │      Arbre<F>    │
                    ├─────────────────┤
                    │ #age: double     │
                    │ #volume: double  │
                    ├─────────────────┤
                    │ +getAge()        │
                    │ +getVolume()     │
                    │ +vieillir()      │
                    │ +getPrix()       │
                    │ +peutEtreCoupe() │
                    │ +produireFruit():F│
                    └─────────────────┘
                            ▲
                            │
                   ┌────────┴────────┐
                   │                 │
          ┌────────────────┐  ┌─────────────┐
          │ Chene<Gland>   │  │  Pin<Cone>  │
          ├────────────────┤  ├─────────────┤
          │ -prix: int     │  │ -prix: int  │
          │ -age_coupe: dbl│  │ -age_coupe  │
          ├────────────────┤  ├─────────────┤
          │ +produireFruit()│ │+produireFruit()│
          └────────────────┘  └─────────────┘
                   │                 │
                   produit           produit
                   │                 │
          ┌────────────────┐  ┌─────────────┐
          │     Gland      │  │    Cone     │
          │  implements    │  │ implements  │
          │     Fruit      │  │   Fruit     │
          └────────────────┘  └─────────────┘
                   │                 │
                 mange par         mange par
                   │                 │
          ┌────────────────┐  ┌─────────────┐
          │    Cochon      │  │  Ecureuil   │
          │  implements    │  │ implements  │
          │  Animal<Gland> │  │Animal<Cone> │
          └────────────────┘  └─────────────┘
```

## Ressources

- [Heritage Java](https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html)
- [Classes abstraites](https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html)
- [Generiques Java](https://docs.oracle.com/javase/tutorial/java/generics/)
- [ConcurrentModificationException](https://docs.oracle.com/javase/8/docs/api/java/util/ConcurrentModificationException.html)

## Auteur

INSA Rennes - Arnaud Blouin
Cours : CPOO (Conception et Programmation Orientee Objet) - 3e annee Informatique
