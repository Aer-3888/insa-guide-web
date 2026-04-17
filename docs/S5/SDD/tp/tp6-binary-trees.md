---
title: "TP06 - Binary Trees and Expression Trees (Arbres Binaires et Expressions)"
sidebar_position: 6
---

# TP06 - Binary Trees and Expression Trees (Arbres Binaires et Expressions)

## Objective

Implement and manipulate **binary trees** to represent and evaluate arithmetic expressions.

Learn:
- Tree structure and traversal
- Recursive algorithms
- Expression parsing and evaluation
- Tree transformations

## Theory: Binary Trees

### What is a Binary Tree?

A **binary tree** is a hierarchical structure where each node has:
- A **value** (data)
- Up to **two children**: left and right

```
        +
       / \
      *   5
     / \
    4   /
       / \
      p   2
```

This represents: `4 * (p / 2) + 5`

### Expression Trees

**Expression trees** represent arithmetic expressions:
- **Leaves**: Numbers or variables
- **Internal nodes**: Operators (+, -, *, /)
- **Evaluation**: Recursively evaluate subtrees

**Advantages:**
- Natural representation of operator precedence
- Easy to evaluate
- Easy to transform (simplification, optimization)

### Tree Traversals

**1. Infix** (left, root, right): `4 * p / 2 + 5`
**2. Prefix** (root, left, right): `+ * 4 / p 2 5`
**3. Postfix** (left, right, root): `4 p 2 / * 5 +`

Postfix notation doesn't need parentheses!

## Interfaces

### `Arbre` - Binary Tree Interface

```java
public interface Arbre {
    // Tree structure
    boolean estVide();
    Object racine();
    Arbre arbreG();
    Arbre arbreD();
    
    // Modifications
    void modifArbreG(Arbre a);
    void modifArbreD(Arbre a);
    
    // Properties
    int hauteur();
    int denombrer(String n);
    
    // Output
    String toString();  // Postfix notation
}
```

### Implementation: `TreeTwo`

Simple binary tree implementation:

```java
public class TreeTwo implements Arbre {
    private Object value;
    private Arbre left;
    private Arbre right;
    
    // Empty tree
    public TreeTwo() {
        this.value = null;
        this.left = null;
        this.right = null;
    }
    
    // Leaf node
    public TreeTwo(Object val) {
        this.value = val;
        this.left = new TreeTwo();
        this.right = new TreeTwo();
    }
    
    // Internal node
    public TreeTwo(Object val, Arbre left, Arbre right) {
        this.value = val;
        this.left = left;
        this.right = right;
    }
}
```

## Core Operations

### 1. Basic Queries

```java
public boolean estVide() {
    return value == null;
}

public Object racine() {
    if (estVide()) {
        throw new IllegalStateException("Empty tree has no root");
    }
    return value;
}

public Arbre arbreG() {
    return estVide() ? null : left;
}

public Arbre arbreD() {
    return estVide() ? null : right;
}
```

### 2. Height Calculation

```java
public int hauteur() {
    if (estVide()) return -1;
    return 1 + Math.max(left.hauteur(), right.hauteur());
}
```

**Complexity:** O(n) where n = number of nodes

### 3. Count Occurrences

```java
public int denombrer(String n) {
    if (estVide()) return 0;
    
    int count = value.equals(n) ? 1 : 0;
    return count + left.denombrer(n) + right.denombrer(n);
}
```

Counts how many times value `n` appears in the tree.

### 4. String Representation (Postfix)

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

Example: `4 p 2 / * 5 +` (postfix notation)

### 5. Replace All Occurrences

```java
public Arbre replacer(String n1, String n2) {
    if (estVide()) return this;
    
    Object newValue = value.equals(n1) ? n2 : value;
    Arbre newLeft = left.replacer(n1, n2);
    Arbre newRight = right.replacer(n1, n2);
    
    return new TreeTwo(newValue, newLeft, newRight);
}
```

## Expression Arithmetic: `ExprArith`

### Class Structure

```java
public class ExprArith {
    protected Arbre arbre;
    protected Map<String, Double> associations;  // Variable bindings
    
    public ExprArith(Arbre a) {
        this.arbre = a;
        this.associations = new HashMap<>();
    }
}
```

### Operations

#### 1. Assign Variable Values

```java
public void associerValeur(String symbole, double valeur) {
    if (symbole == null) {
        throw new IllegalArgumentException("Symbol cannot be null");
    }
    associations.put(symbole, valeur);
}
```

Example:
```java
ExprArith expr = ...;
expr.associerValeur("x", 5.0);
expr.associerValeur("y", 3.0);
```

#### 2. Get Variable Value

```java
public double valeur(String symbol) {
    if (!associations.containsKey(symbol)) {
        throw new IllegalArgumentException("Unknown symbol: " + symbol);
    }
    return associations.get(symbol);
}
```

#### 3. Evaluate Expression

```java
public double evaluer() {
    return recursiveEvaluation(arbre);
}

private double recursiveEvaluation(Arbre root) {
    if (root.estVide()) {
        throw new RuntimeException("Cannot evaluate empty tree");
    }
    
    Arbre gauche = root.arbreG();
    Arbre droit = root.arbreD();
    String racine = (String) root.racine();
    
    // Leaf node: number or variable
    if (gauche.estVide() || droit.estVide()) {
        try {
            return Double.parseDouble(racine);
        } catch (NumberFormatException e) {
            return valeur(racine);  // Look up variable
        }
    }
    
    // Internal node: operator
    double left = recursiveEvaluation(gauche);
    double right = recursiveEvaluation(droit);
    
    switch (racine) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/": return left / right;
        default: throw new IllegalArgumentException("Unknown operator: " + racine);
    }
}
```

**Complexity:** O(n) - visits each node once

#### 4. Simplify Expression

```java
public Arbre simplifier() {
    return recursiveSimplify(arbre);
}

private Arbre recursiveSimplify(Arbre root) {
    if (root.estVide()) return root;
    
    Arbre gauche = root.arbreG();
    Arbre droit = root.arbreD();
    
    // Leaf: can't simplify further
    if (gauche.estVide() || droit.estVide()) {
        return root;
    }
    
    // Recursively simplify children
    Arbre newLeft = recursiveSimplify(gauche);
    Arbre newRight = recursiveSimplify(droit);
    
    // If both children are constants, evaluate
    if (newLeft.hauteur() == 0 && newRight.hauteur() == 0) {
        try {
            String leftVal = (String) newLeft.racine();
            String rightVal = (String) newRight.racine();
            
            double left = parseOrLookup(leftVal);
            double right = parseOrLookup(rightVal);
            
            String op = (String) root.racine();
            double result = evaluate(op, left, right);
            
            return new TreeTwo(String.valueOf(result));
        } catch (Exception e) {
            // Can't simplify, return original
        }
    }
    
    // Return tree with simplified children
    return new TreeTwo(root.racine(), newLeft, newRight);
}
```

**Example:**
```
Original: 2 + 3 * 4
Tree:       +
           / \
          2   *
             / \
            3   4

After simplify:  +
                / \
               2  12

Final result: 14
```

#### 5. Convert to Infix Notation

```java
public String toString() {
    return toInfix(arbre);
}

private String toInfix(Arbre root) {
    if (root.estVide()) return "";
    
    Arbre left = root.arbreG();
    Arbre right = root.arbreD();
    String value = (String) root.racine();
    
    // Leaf: just the value
    if (left.estVide() || right.estVide()) {
        return value;
    }
    
    // Internal node: (left op right)
    String leftStr = toInfix(left);
    String rightStr = toInfix(right);
    
    // Add parentheses if child is also an expression
    if (left.hauteur() > 0) leftStr = "( " + leftStr + " )";
    if (right.hauteur() > 0) rightStr = "( " + rightStr + " )";
    
    return leftStr + " " + value + " " + rightStr;
}
```

**Example:**
```
Postfix: 4 p 2 / * 5 +
Infix: ( 4 * ( p / 2 ) ) + 5
```

## Building Expression Trees

### Manual Construction

```java
// Build tree for: (4 * 5) + 2

Arbre leaf4 = new TreeTwo("4");
Arbre leaf5 = new TreeTwo("5");
Arbre mult = new TreeTwo("*", leaf4, leaf5);  // 4 * 5

Arbre leaf2 = new TreeTwo("2");
Arbre plus = new TreeTwo("+", mult, leaf2);   // (4*5) + 2

ExprArith expr = new ExprArith(plus);
System.out.println(expr.evaluer());  // 22.0
```

### From Postfix String

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
            stack.push(new TreeTwo(token));  // Operand
        }
    }
    
    return stack.pop();
}

private static boolean isOperator(String s) {
    return s.equals("+") || s.equals("-") || s.equals("*") || s.equals("/");
}
```

**Example:**
```java
Arbre tree = fromPostfix("3 4 + 2 *");
// Represents: (3 + 4) * 2
ExprArith expr = new ExprArith(tree);
System.out.println(expr.evaluer());  // 14.0
```

## Usage Example

```java
// Build expression: 4 + 5 / 2
Arbre leaf4 = new TreeTwo("4");
Arbre leaf5 = new TreeTwo("5");
Arbre leaf2 = new TreeTwo("2");
Arbre div = new TreeTwo("/", leaf5, leaf2);
Arbre plus = new TreeTwo("+", leaf4, div);

ExprArith expr = new ExprArith(plus);

// Evaluate
double result = expr.evaluer();
System.out.println(result);  // 6.5

// With variables
Arbre x = new TreeTwo("x");
Arbre y = new TreeTwo("y");
Arbre mult = new TreeTwo("*", x, y);

ExprArith expr2 = new ExprArith(mult);
expr2.associerValeur("x", 3.0);
expr2.associerValeur("y", 7.0);
System.out.println(expr2.evaluer());  // 21.0

// Simplify
Arbre simple = expr2.simplifier();
// If x and y are known, tree becomes single leaf "21.0"
```

## Testing

```java
@Test
public void testEvaluation() {
    Arbre leaf2 = new TreeTwo("2");
    Arbre leaf3 = new TreeTwo("3");
    Arbre plus = new TreeTwo("+", leaf2, leaf3);
    
    ExprArith expr = new ExprArith(plus);
    assertEquals(5.0, expr.evaluer(), 0.001);
}

@Test
public void testVariables() {
    Arbre x = new TreeTwo("x");
    Arbre y = new TreeTwo("y");
    Arbre mult = new TreeTwo("*", x, y);
    
    ExprArith expr = new ExprArith(mult);
    expr.associerValeur("x", 4.0);
    expr.associerValeur("y", 5.0);
    
    assertEquals(20.0, expr.evaluer(), 0.001);
}

@Test
public void testSimplification() {
    Arbre tree = fromPostfix("2 3 + 4 *");
    ExprArith expr = new ExprArith(tree);
    
    Arbre simplified = expr.simplifier();
    // Should become "20.0" (constant folding)
    
    assertEquals(0, simplified.hauteur());
    assertEquals("20.0", simplified.racine());
}
```

## Applications

1. **Compilers**: Parse and optimize expressions
2. **Calculators**: Evaluate user input
3. **Computer Algebra Systems**: Symbolic math (Mathematica, Maple)
4. **Database Query Optimization**: Rewrite query expressions
5. **Decision Trees**: AI/ML classification

## Extensions

### 1. More Operators

```java
case "%": return left % right;      // Modulo
case "^": return Math.pow(left, right);  // Exponentiation
case "max": return Math.max(left, right);
case "min": return Math.min(left, right);
```

### 2. Unary Operators

```java
// Handle: -x, sqrt(x), sin(x)
if (left.estVide()) {  // Only right child
    double val = recursiveEvaluation(right);
    switch (racine) {
        case "-": return -val;
        case "sqrt": return Math.sqrt(val);
        case "sin": return Math.sin(val);
    }
}
```

### 3. Differentiation

```java
public Arbre derivative(String variable) {
    // d/dx(constant) = 0
    // d/dx(x) = 1
    // d/dx(f + g) = f' + g'
    // d/dx(f * g) = f'*g + f*g'  (product rule)
    // d/dx(f / g) = (f'*g - f*g') / g^2  (quotient rule)
}
```

### 4. Pretty Printing

```java
public void printTree(Arbre root, String prefix, boolean isLeft) {
    if (!root.estVide()) {
        System.out.println(prefix + (isLeft ? "├── " : "└── ") + root.racine());
        printTree(root.arbreG(), prefix + (isLeft ? "│   " : "    "), true);
        printTree(root.arbreD(), prefix + (isLeft ? "│   " : "    "), false);
    }
}
```

Output:
```
└── +
    ├── *
    │   ├── 4
    │   └── 5
    └── 2
```

## See Also

- **TP07**: QuadTrees (4-ary trees)
- [Abstract Syntax Trees](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
- [Expression Parsing](https://en.wikipedia.org/wiki/Shunting-yard_algorithm)
- [Symbolic Differentiation](https://en.wikipedia.org/wiki/Computer_algebra)
