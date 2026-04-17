---
title: "TP6 - Arbres Binaires et Expressions Arithmetiques (Binary Trees)"
sidebar_position: 6
---

# TP6 - Arbres Binaires et Expressions Arithmetiques (Binary Trees)

> Following teacher instructions from: `S5/SDD/data/moodle/tp/tp6_binary_trees/README.md`

## Objectif

Implementer des arbres binaires pour representer, evaluer, simplifier et afficher des expressions arithmetiques.

## Fichiers

| Fichier | Role | Statut |
|---------|------|--------|
| `src/main/Arbre.java` | Interface pour les operations d'arbre binaire | Fourni |
| `src/main/TreeTwo.java` | Implementation de l'arbre binaire | **A ecrire** |
| `src/main/Trees.java` | Utilitaire de visualisation d'arbre | Fourni |
| `src/main/ExprArith.java` | Evaluateur d'expressions arithmetiques | **A ecrire** |
| `test/test/TreeTwoTest.java` | Tests pour TreeTwo | Fourni |
| `test/test/ExprArithTest.java` | Tests pour ExprArith | Fourni |

## Interface Arbre

```java
public interface Arbre {
    Object racine();           // Valeur de la racine
    Arbre arbreG();            // Sous-arbre gauche
    Arbre arbreD();            // Sous-arbre droit
    boolean estVide();         // L'arbre est-il vide ?
    void vider();              // Vider l'arbre
    int hauteur();             // Hauteur de l'arbre
    void modifRacine(Object r); // Modifier la valeur de la racine
    void modifArbreD(Arbre a); // Modifier le sous-arbre droit
    void modifArbreG(Arbre a); // Modifier le sous-arbre gauche
    String toString();         // Representation en notation postfixe
    void dessiner();           // Dessiner l'arbre (utilise Trees)
}
```

## Arbre de test utilise dans tout le TP

```
          +
         / \
        *   /
       / \ / \
      4  pi 5  2
```

Postfixe : `4 pi * 5 2 / +`
Infixe : `( 4 * pi ) + ( 5 / 2 )`

---

## Exercice 1

### Definir la classe interne Noeud et le constructeur de TreeTwo

**Answer:**

```java
package main;

import java.util.ArrayList;

public class TreeTwo implements Arbre {
    private static class Noeud {
        private Object value;
        private Noeud droit;
        private Noeud gauche;

        public Noeud(Object value) { this.value = value; }

        public Object getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        public Noeud getDroit() { return droit; }
        public void setDroit(Noeud droit) { this.droit = droit; }
    }

    private Noeud root;

    public TreeTwo(Object root) {
        this.root = new Noeud(root);
    }
}
```

**How the code works:**
`TreeTwo(Object root)` cree un noeud feuille. Les sous-arbres sont ajoutes ensuite via `modifArbreG` et `modifArbreD`.

---

## Exercice 2

### Implementer racine(), arbreG(), arbreD(), estVide()

**Answer:**

```java
    public Object racine() {
        return this.root.getValue();
    }

    public Arbre arbreG() {
        if (this.root.gauche == null) return new TreeTwo(null);
        TreeTwo res = new TreeTwo(this.root.gauche.getValue());
        res.root = this.root.gauche;
        return res;
    }

    public Arbre arbreD() {
        if (this.root.droit == null) return new TreeTwo(null);
        TreeTwo res = new TreeTwo(this.root.droit.getValue());
        res.root = this.root.droit;
        return res;
    }

    public boolean estVide() {
        return this.root.getValue() == null
                && this.root.gauche == null
                && this.root.droit == null;
    }
```

**How the code works:**
- `arbreG()` / `arbreD()` retournent un `TreeTwo(null)` (arbre vide) quand le fils n'existe pas, plutot que `null`. Cela permet d'appeler `estVide()` sur le resultat sans risque de NullPointerException.
- Le TreeTwo retourne pointe vers le meme Noeud interne -- les modifications sur le sous-arbre modifient l'arbre original.

---

## Exercice 3

### Implementer les methodes de modification : vider(), modifRacine(), modifArbreG(), modifArbreD()

**Answer:**

```java
    public void vider() {
        this.root.droit = null;
        this.root.gauche = null;
        this.root.value = null;
    }

    public void modifRacine(Object r) {
        this.root.value = r;
    }

    public void modifArbreG(Arbre a) {
        if (a == null)
            this.root.gauche = null;
        else if (a.getClass() == TreeTwo.class)
            this.root.gauche = ((TreeTwo) a).root;
        else
            throw new UnsupportedOperationException("Cannot modify with non TreeTwo");
    }

    public void modifArbreD(Arbre a) {
        if (a == null)
            this.root.droit = null;
        else if (a.getClass() == TreeTwo.class)
            this.root.droit = ((TreeTwo) a).root;
        else
            throw new UnsupportedOperationException("Cannot modify with non TreeTwo");
    }
```

**How the code works:**

Construction de l'arbre de test :
```java
TreeTwo tr = new TreeTwo("+");
TreeTwo droit = new TreeTwo("/");
droit.modifArbreD(new TreeTwo(2));
droit.modifArbreG(new TreeTwo(5));
tr.modifArbreD(droit);
TreeTwo gauche = new TreeTwo("*");
gauche.modifArbreD(new TreeTwo("pi"));
gauche.modifArbreG(new TreeTwo(4));
tr.modifArbreG(gauche);
```

---

## Exercice 4

### Implementer toString() -- parcours postfixe

Produire une representation en notation postfixe (gauche, droit, racine).

**Answer:**

```java
    private String postfixTraversal(Noeud r) {
        StringBuilder res = new StringBuilder();
        if (r.gauche != null) res.append(postfixTraversal(r.gauche));
        if (r.droit != null) res.append(postfixTraversal(r.droit));
        if (r.value != null) {
            res.append(r.value.toString());
            res.append(" ");
        }
        return res.toString();
    }

    public String toString() {
        String res = postfixTraversal(this.root);
        return res.substring(0, Math.max(res.length() - 1, 0));
    }
```

**How the code works:**
Pour l'arbre de test, `toString()` retourne `"4 pi * 5 2 / +"`. La notation postfixe (Reverse Polish Notation) n'a pas besoin de parentheses et est facile a evaluer avec une pile.

---

## Exercice 5

### Implementer hauteur() -- hauteur de l'arbre

**Answer:**

```java
    private int recursiveHeight(Noeud r) {
        if (r == null) return 0;
        return 1 + Math.max(recursiveHeight(r.gauche), recursiveHeight(r.droit));
    }

    public int hauteur() {
        if (this.estVide())
            throw new RuntimeException("Attempt to find depth of empty tree");
        return Math.max(recursiveHeight(this.root.gauche),
                        recursiveHeight(this.root.droit));
    }
```

**How the code works:**
Hauteur de l'arbre de test = 2 (racine au niveau 0, operateurs au niveau 1, feuilles au niveau 2). Un noeud seul a hauteur 0.

---

## Exercice 6

### Implementer denombrer() -- compter les occurrences d'une valeur

**Answer:**

```java
    public int denombrer(String n) {
        if (n == null)
            throw new IllegalArgumentException("Attempt to count null string");
        ArrayList<Noeud> lr = new ArrayList<>();
        int count = 0;
        lr.add(this.root);
        while (lr.size() > 0) {
            Noeud e = lr.remove(lr.size() - 1);
            if (e.gauche != null) lr.add(e.gauche);
            if (e.droit != null) lr.add(e.droit);
            if (e.value != null && e.value.toString().equals(n))
                count++;
        }
        return count;
    }
```

**How the code works:**
Approche iterative utilisant une pile explicite (ArrayList utilisee comme pile). Parcourt tous les noeuds et compte ceux dont la valeur correspond. Evite le debordement de pile pour les arbres tres profonds.

---

## Exercice 7

### Implementer remplacer() -- remplacer toutes les occurrences

**Answer:**

```java
    public void remplacer(String n1, String n2) {
        if (n1 == null)
            throw new IllegalArgumentException("Attempt to find null string");
        if (n2 == null)
            throw new IllegalArgumentException("Attempt to replace with null string");
        ArrayList<Noeud> lr = new ArrayList<>();
        lr.add(this.root);
        while (lr.size() > 0) {
            Noeud e = lr.remove(lr.size() - 1);
            if (e.gauche != null) lr.add(e.gauche);
            if (e.droit != null) lr.add(e.droit);
            if (e.value != null && e.value.toString().equals(n1))
                e.value = n2;
        }
    }

    public void dessiner() { Trees.draw(this); }
```

**How the code works:**
Meme schema iteratif que `denombrer()`, mais au lieu de compter, on remplace la valeur.

---

## Exercice 8

### Implementer ExprArith -- evaluateur, conversion infixe, simplification

**Answer:**

```java
package main;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class ExprArith {
    protected Arbre arbre;
    protected final HashMap<String, Double> associations;
    static final List<String> operators = Arrays.asList("+", "/", "-", "*");

    public ExprArith(Arbre a) {
        this.arbre = a;
        this.associations = new HashMap<>();
    }

    // Associer une valeur a une variable
    public void associerValeur(String symbole, double valeur) {
        if (symbole == null)
            throw new IllegalArgumentException("Attempt to use null symbol");
        this.associations.put(symbole, valeur);
    }

    // Obtenir la valeur d'une variable
    public double valeur(String symbol) {
        if (symbol == null)
            throw new IllegalArgumentException("Attempt to fetch null symbol");
        if (!this.associations.containsKey(symbol))
            throw new IllegalArgumentException("Unknown symbol " + symbol);
        return this.associations.get(symbol);
    }

    // Evaluation recursive
    private double recursiveEvaluation(Arbre root) {
        if (root.estVide()) throw new RuntimeException("NULL ROOT TREE");
        Arbre gauche = root.arbreG();
        Arbre droit = root.arbreD();
        String renter = (String) root.racine();

        // Noeud feuille : essayer de parser comme nombre, sinon chercher comme variable
        if (gauche.estVide() || droit.estVide()) {
            try { return Double.parseDouble(renter); }
            catch (NumberFormatException e) { /* pas un nombre */ }
            return this.valeur(renter);
        }
        // Noeud interne : evaluer les enfants et appliquer l'operateur
        double dgauche = recursiveEvaluation(gauche);
        double ddroite = recursiveEvaluation(droit);
        switch (renter) {
            case "+": return dgauche + ddroite;
            case "-": return dgauche - ddroite;
            case "/": return dgauche / ddroite;
            case "*": return dgauche * ddroite;
            default: throw new IllegalArgumentException("UNKNOWN OP " + renter);
        }
    }

    public double evaluer() {
        return this.recursiveEvaluation(this.arbre);
    }

    // Conversion postfixe vers infixe avec parentheses
    public String toString() {
        ArrayList<String> lr = new ArrayList<>(
            Arrays.asList(this.arbre.toString().split(" ")));
        ArrayList<String> stack = new ArrayList<>();
        while (lr.size() > 0) {
            String token = lr.remove(0);
            if (operators.contains(token)) {
                String rtoken = stack.remove(stack.size() - 1);
                if (rtoken.contains(" ")) rtoken = "( " + rtoken + " )";
                String ltoken = stack.remove(stack.size() - 1);
                if (ltoken.contains(" ")) ltoken = "( " + ltoken + " )";
                stack.add(ltoken + " " + token + " " + rtoken);
            } else {
                stack.add(token);
            }
        }
        return stack.remove(stack.size() - 1);
    }

    // Simplification -- constant folding
    private Arbre recursiveSimplify(Arbre root) {
        Arbre gauche = root.arbreG();
        Arbre droit = root.arbreD();
        String ricin = (String) root.racine();

        if (gauche.estVide() || droit.estVide()) return root;

        Arbre new_left = recursiveSimplify(gauche);
        Arbre new_right = recursiveSimplify(droit);
        TreeTwo res = new TreeTwo(root.racine());

        if (new_left.hauteur() > 0 || new_right.hauteur() > 0) {
            res.modifArbreD(new_right);
            res.modifArbreG(new_left);
            return res;
        }

        // Les deux enfants sont des feuilles -- essayer de calculer
        String nls = (String) new_left.racine();
        String nrs = (String) new_right.racine();
        double nld, nrd;
        try { nld = Double.parseDouble(nls); }
        catch (NumberFormatException e) {
            if (this.associations.containsKey(nls))
                nld = this.associations.get(nls);
            else { res.modifArbreD(new_right); res.modifArbreG(new_left); return res; }
        }
        try { nrd = Double.parseDouble(nrs); }
        catch (NumberFormatException e) {
            if (this.associations.containsKey(nrs))
                nrd = this.associations.get(nrs);
            else { res.modifArbreD(new_right); res.modifArbreG(new_left); return res; }
        }

        switch (ricin) {
            case "+": return new TreeTwo("" + (nld + nrd));
            case "-": return new TreeTwo("" + (nld - nrd));
            case "*": return new TreeTwo("" + (nld * nrd));
            case "/": return new TreeTwo("" + (nld / nrd));
            default: throw new RuntimeException("Unknown operator");
        }
    }

    public Arbre simplifier() {
        return recursiveSimplify(this.arbre);
    }
}
```

**How the code works:**

**toString() -- conversion postfixe vers infixe :**
1. Decoupe la chaine postfixe en tokens : `["4", "pi", "*", "5", "2", "/", "+"]`
2. Traite chaque token : nombre/variable -> empiler ; operateur -> depiler deux operandes, combiner comme `gauche op droit`, empiler le resultat
3. Si un operande contient des espaces (sous-expression), l'entourer de parentheses
4. Le dernier element de la pile est la chaine infixe : `"( 4 * pi ) + ( 5 / 2 )"`

**simplifier() -- constant folding :**
1. Simplifier recursivement de bas en haut
2. Si un noeud est une feuille, le retourner tel quel
3. Simplifier les enfants gauche et droit
4. Si les deux enfants simplifies sont des feuilles ET leurs valeurs sont connues (numeriques ou dans les associations), calculer le resultat et retourner une seule feuille
5. Sinon, retourner l'arbre avec les enfants simplifies

Tests attendus :
- `toStringCorrect` -- `"( 4 * pi ) + ( 5 / 2 )"` -- PASS
- `expressCorrect` -- avec pi=3.141592, resultat = `4*3.141592 + 5/2 = 15.06636` -- PASS
- `simplifyWithAllValues` -- sans pi : hauteur reste 2. Avec pi : tout se reduit a une feuille -- PASS

---

## Erreurs courantes

1. **Oublier les verifications `estVide()`** -- `arbreG().estVide()` doit etre verifie avant de traiter un noeud comme operateur.
2. **Cast de type** -- Les valeurs de racine sont `Object`, mais l'evaluateur attend `String`. Toujours caster et valider.
3. **Parentheses dans toString()** -- N'ajouter des parentheses qu'autour des sous-expressions (celles contenant des espaces), pas autour des operandes simples.
4. **Simplification avec variables inconnues** -- Si une feuille est une variable absente de la map des associations, la simplification doit s'arreter et retourner l'arbre inchange.
