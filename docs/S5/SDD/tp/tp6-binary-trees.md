---
title: "TP06 - Arbres Binaires et Expressions Arithmetiques"
sidebar_position: 6
---

# TP06 - Arbres Binaires et Expressions Arithmetiques

## Objectif

Implementer et manipuler des **arbres binaires** pour representer et evaluer des expressions arithmetiques.

Apprentissages :
- Structure d'arbre et parcours
- Algorithmes recursifs
- Analyse et evaluation d'expressions
- Transformations d'arbres

## Theorie : Arbres Binaires

### Qu'est-ce qu'un arbre binaire ?

Un **arbre binaire** est une structure hierarchique ou chaque noeud possede :
- Une **valeur** (donnee)
- Jusqu'a **deux enfants** : gauche et droit

```
        +
       / \
      *   5
     / \
    4   /
       / \
      p   2
```

Cela represente : `4 * (p / 2) + 5`

### Arbres d'expressions

Les **arbres d'expressions** representent des expressions arithmetiques :
- **Feuilles** : Nombres ou variables
- **Noeuds internes** : Operateurs (+, -, *, /)
- **Evaluation** : Evaluer recursivement les sous-arbres

**Avantages :**
- Representation naturelle de la precedence des operateurs
- Facile a evaluer
- Facile a transformer (simplification, optimisation)

### Parcours d'arbre

**1. Infixe** (gauche, racine, droit) : `4 * p / 2 + 5`
**2. Prefixe** (racine, gauche, droit) : `+ * 4 / p 2 5`
**3. Postfixe** (gauche, droit, racine) : `4 p 2 / * 5 +`

La notation postfixe n'a pas besoin de parentheses.

## Interfaces

### `Arbre` - Interface d'arbre binaire

```java
public interface Arbre {
    boolean estVide();
    Object racine();
    Arbre arbreG();
    Arbre arbreD();
    void modifArbreG(Arbre a);
    void modifArbreD(Arbre a);
    int hauteur();
    int denombrer(String n);
    String toString();  // Notation postfixe
}
```

### Implementation : `TreeTwo`

```java
public class TreeTwo implements Arbre {
    private Object value;
    private Arbre left;
    private Arbre right;
    
    public TreeTwo() { this.value = null; }
    public TreeTwo(Object val) { this.value = val; }
    public TreeTwo(Object val, Arbre left, Arbre right) {
        this.value = val;
        this.left = left;
        this.right = right;
    }
}
```

## Operations principales

### 1. Requetes de base

```java
public boolean estVide() { return value == null; }
public Object racine() { return value; }
public Arbre arbreG() { return estVide() ? null : left; }
public Arbre arbreD() { return estVide() ? null : right; }
```

### 2. Calcul de hauteur

```java
public int hauteur() {
    if (estVide()) return -1;
    return 1 + Math.max(left.hauteur(), right.hauteur());
}
```

**Complexite :** O(n) ou n = nombre de noeuds

### 3. Denombrer les occurrences

```java
public int denombrer(String n) {
    if (estVide()) return 0;
    int count = value.equals(n) ? 1 : 0;
    return count + left.denombrer(n) + right.denombrer(n);
}
```

### 4. Representation en chaine (Postfixe)

```java
public String toString() {
    if (estVide()) return "";
    String leftStr = left.toString();
    String rightStr = right.toString();
    StringBuilder sb = new StringBuilder();
    if (!leftStr.isEmpty()) sb.append(leftStr).append(" ");
    if (!rightStr.isEmpty()) sb.append(rightStr).append(" ");
    sb.append(value);
    return sb.toString();
}
```

Exemple : `4 p 2 / * 5 +` (notation postfixe)

## Arithmetique d'expressions : `ExprArith`

### Structure de la classe

```java
public class ExprArith {
    protected Arbre arbre;
    protected Map<String, Double> associations;
    
    public ExprArith(Arbre a) {
        this.arbre = a;
        this.associations = new HashMap<>();
    }
}
```

### Operations

#### 1. Associer des valeurs aux variables

```java
public void associerValeur(String symbole, double valeur) {
    associations.put(symbole, valeur);
}
```

#### 2. Evaluer l'expression

```java
public double evaluer() {
    return recursiveEvaluation(arbre);
}

private double recursiveEvaluation(Arbre root) {
    Arbre gauche = root.arbreG();
    Arbre droit = root.arbreD();
    String racine = (String) root.racine();
    
    // Noeud feuille : nombre ou variable
    if (gauche.estVide() || droit.estVide()) {
        try { return Double.parseDouble(racine); }
        catch (NumberFormatException e) { return valeur(racine); }
    }
    
    // Noeud interne : operateur
    double left = recursiveEvaluation(gauche);
    double right = recursiveEvaluation(droit);
    
    switch (racine) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/": return left / right;
        default: throw new IllegalArgumentException("Operateur inconnu : " + racine);
    }
}
```

**Complexite :** O(n) - visite chaque noeud une fois

#### 3. Simplifier l'expression

La simplification (constant folding) evalue recursivement de bas en haut. Si les deux enfants simplifies sont des feuilles dont les valeurs sont connues, on calcule le resultat et retourne une seule feuille.

#### 4. Convertir en notation infixe

La methode `toString()` convertit de la notation postfixe vers la notation infixe avec parentheses. Exemple :
```
Postfixe : 4 p 2 / * 5 +
Infixe :   ( 4 * ( p / 2 ) ) + 5
```

## Construction d'arbres d'expressions

### Construction manuelle

```java
Arbre leaf4 = new TreeTwo("4");
Arbre leaf5 = new TreeTwo("5");
Arbre mult = new TreeTwo("*", leaf4, leaf5);
Arbre leaf2 = new TreeTwo("2");
Arbre plus = new TreeTwo("+", mult, leaf2);

ExprArith expr = new ExprArith(plus);
System.out.println(expr.evaluer());  // 22.0
```

### Depuis une chaine postfixe

```java
public static Arbre fromPostfix(String postfix) {
    Stack<Arbre> stack = new Stack<>();
    String[] tokens = postfix.split(" ");
    
    for (String token : tokens) {
        if (isOperator(token)) {
            Arbre right = stack.pop();
            Arbre left = stack.pop();
            stack.push(new TreeTwo(token, left, right));
        } else {
            stack.push(new TreeTwo(token));
        }
    }
    return stack.pop();
}
```

## Applications

1. **Compilateurs** : Analyser et optimiser les expressions
2. **Calculatrices** : Evaluer les saisies utilisateur
3. **Systemes d'algebre** : Mathematiques symboliques
4. **Optimisation de requetes** : Reecritures d'expressions de requetes

## Voir aussi

- **TP07** : QuadTrees (arbres a 4 branches)
- **TP08** : Files de priorite (tas = arbre binaire)
