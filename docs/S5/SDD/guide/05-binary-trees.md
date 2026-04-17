---
title: "Binary Trees (Arbres Binaires)"
sidebar_position: 5
---

# Binary Trees (Arbres Binaires)

## Theory

A **binary tree** is a hierarchical structure where each node has at most two children (left and right).

```
         [A]           <- root (racine)
        /   \
      [B]   [C]        <- internal nodes
      / \     \
    [D] [E]   [F]      <- leaves (feuilles) = no children
```

Terminology:
- **Root** (racine): top node, has no parent
- **Leaf** (feuille): node with no children
- **Internal node**: node with at least one child
- **Height** (hauteur): length of longest path from root to leaf
- **Depth** of a node: distance from root to that node
- **Subtree** (sous-arbre): any node + all its descendants

### Binary Search Tree (BST / ABR)

A BST satisfies: for every node N,
- All values in left subtree < N.value
- All values in right subtree > N.value

```
         [7]
        /   \
      [3]   [10]
      / \      \
    [1] [6]   [14]
        /
       [4]
```

Note: Inserting 7 again -- since the BST uses `>=` for left placement (see `placer()` in exam code), a duplicate 7 would go to the left subtree of 10. The exact placement depends on the BST's duplicate-handling policy.

**Search**: follow left if target < node, right if target > node.

### AVL Tree

A **self-balancing BST** where for every node, the heights of left and right subtrees differ by at most 1.

**Balance factor** = height(left) - height(right)
- If |balance factor| > 1: rebalance with rotations

#### Rotations

**Right rotation** (rotation droite) -- when left-heavy:
```
Before:        After:
    [C]          [B]
    /            / \
  [B]          [A] [C]
  /
[A]
```

**Left rotation** (rotation gauche) -- when right-heavy:
```
Before:        After:
[A]              [B]
  \              / \
  [B]          [A] [C]
    \
    [C]
```

**Left-Right rotation** (double rotation):
```
Before:          After left on B:     After right on C:
    [C]              [C]                  [B]
    /                /                    / \
  [A]              [B]                  [A] [C]
    \              /
    [B]          [A]
```

**Right-Left rotation**: mirror of left-right.


## Traversals (Parcours)

Four fundamental tree traversals:

```
         [+]
        /   \
      [*]   [3]
      / \
    [2] [4]
```

### Inorder (Infixe) -- Left, Root, Right
```
2, *, 4, +, 3     (gives sorted order for BST)
Infix expression: (2 * 4) + 3
```

### Preorder (Prefixe) -- Root, Left, Right
```
+, *, 2, 4, 3
Prefix expression: + * 2 4 3
```

### Postorder (Postfixe) -- Left, Right, Root
```
2, 4, *, 3, +
Postfix (RPN): 2 4 * 3 +
```

### BFS / Level-order (Parcours en largeur)
```
+, *, 3, 2, 4     (level by level, using a queue)
```

### Recursive traversal template

```java
void inorder(Node n) {
    if (n == null) return;
    inorder(n.left);     // left subtree
    process(n);          // root
    inorder(n.right);    // right subtree
}

void preorder(Node n) {
    if (n == null) return;
    process(n);          // root
    preorder(n.left);
    preorder(n.right);
}

void postorder(Node n) {
    if (n == null) return;
    postorder(n.left);
    postorder(n.right);
    process(n);          // root
}
```


## Java Implementation (from TP6)

### Interface: Arbre

```java
public interface Arbre {
    Object racine();            // root value
    Arbre arbreG();             // left subtree
    Arbre arbreD();             // right subtree
    boolean estVide();          // is empty?
    void vider();               // empty the tree
    int hauteur();              // height
    void modifRacine(Object r); // change root value
    void modifArbreD(Arbre a);  // change right subtree
    void modifArbreG(Arbre a);  // change left subtree
    void dessiner();            // draw the tree
}
```

### Implementation: TreeTwo

```java
public class TreeTwo implements Arbre {
    private static class Noeud {
        private Object value;
        private Noeud droit;
        private Noeud gauche;
        public Noeud(Object value) { this.value = value; }
    }

    private Noeud root;

    public TreeTwo(Object root) { this.root = new Noeud(root); }

    public boolean estVide() {
        return root.getValue() == null
            && root.gauche == null
            && root.droit == null;
    }

    // Height: max of left and right subtree heights
    private int recursiveHeight(Noeud r) {
        if (r == null) return 0;
        return 1 + Math.max(recursiveHeight(r.gauche),
                            recursiveHeight(r.droit));
    }

    public int hauteur() {
        return Math.max(recursiveHeight(root.gauche),
                        recursiveHeight(root.droit));
    }
```

### Postfix Traversal (toString)

```java
    private String postfixTraversal(Noeud r) {
        StringBuilder res = new StringBuilder();
        if (r.gauche != null) res.append(postfixTraversal(r.gauche));
        if (r.droit != null)  res.append(postfixTraversal(r.droit));
        if (r.value != null) {
            res.append(r.value.toString());
            res.append(" ");
        }
        return res.toString();
    }
```

### Count occurrences (iterative BFS with stack)

```java
    public int denombrer(String n) {
        ArrayList<Noeud> lr = new ArrayList<>();
        int count = 0;
        lr.add(this.root);
        while (lr.size() > 0) {
            Noeud e = lr.remove(lr.size() - 1);  // pop last = DFS
            if (e.gauche != null) lr.add(e.gauche);
            if (e.droit != null) lr.add(e.droit);
            if (e.value != null && e.value.toString().equals(n))
                count++;
        }
        return count;
    }
```

### Arithmetic Expression Tree (ExprArith, TP6)

```
Expression: (3 + 4) * 2

Tree:        [*]
            /   \
          [+]   [2]
          / \
        [3] [4]

Postfix: 3 4 + 2 *
Evaluation: recursive descent
```

```java
public class ExprArith {
    protected Arbre arbre;
    protected final HashMap<String, Double> associations;

    public double evaluer() {
        return this.recursiveEvaluation(this.arbre);
    }

    private double recursiveEvaluation(Arbre root) {
        if (root.estVide())
            throw new RuntimeException("NULL ROOT TREE");
        Arbre gauche = root.arbreG();
        Arbre droit = root.arbreD();
        String renter = (String) root.racine();

        if (gauche.estVide() || droit.estVide()) {
            // Leaf: numeric literal or variable
            try { return Double.parseDouble(renter); }
            catch (NumberFormatException e) {}
            return this.valeur(renter);  // variable lookup via associations
        } else {
            double dgauche = recursiveEvaluation(gauche);
            double ddroite = recursiveEvaluation(droit);
            switch (renter) {
                case "+": return dgauche + ddroite;
                case "-": return dgauche - ddroite;
                case "*": return dgauche * ddroite;
                case "/": return dgauche / ddroite;
                default: throw new IllegalArgumentException("UNKNOWN OPERATION");
            }
        }
    }
}
```


## BST Operations

### Search in BST

```java
Node search(Node root, int key) {
    if (root == null || root.value == key) return root;
    if (key < root.value) return search(root.left, key);
    return search(root.right, key);
}
```

### Insert in BST (from exam 2020)

```java
public void placer(int i) {
    if (vide()) { modifRacine(i); return; }
    if (valec() >= i) {
        if (!aFilsG()) modifFilsG(i);
        else arbreG().placer(i);
    } else {
        if (!aFilsD()) modifFilsD(i);
        else arbreD().placer(i);
    }
}
```

### Delete from BST (from exam 2020)

To delete a node with two children:
1. Find the **largest value** in the left subtree (rightmost node in left subtree)
2. Replace the node's value with that value
3. Delete the found node (which has at most one child)

```java
public void supprimerEc() {
    if (!aFilsD() || !aFilsG()) {
        oterEc();  // 0 or 1 child: simple removal
    } else {
        oterPlusGrandInf();  // 2 children: replace with max of left
    }
}
```


## Complexity

| Operation | BST (balanced) | BST (worst) | AVL |
|-----------|---------------|-------------|-----|
| Search | O(log n) | O(n) | O(log n) |
| Insert | O(log n) | O(n) | O(log n) |
| Delete | O(log n) | O(n) | O(log n) |
| Traversal | O(n) | O(n) | O(n) |
| Height | O(log n) | O(n) | O(log n) |

Worst case for BST: inserting sorted data creates a "linked list" tree.

```
Insert: 1, 2, 3, 4, 5

     [1]
       \
       [2]
         \
         [3]
           \
           [4]
             \
             [5]

Height = n-1 = 4   (all operations O(n))
```


## CHEAT SHEET

```
BINARY TREE
============
             [root]
            /      \
        [left]    [right]
        /   \       /  \
       ...   ...  ...   ...

TRAVERSALS:
  Inorder  (LNR): left, node, right  -> sorted for BST
  Preorder (NLR): node, left, right  -> copy tree
  Postorder(LRN): left, right, node  -> delete tree / RPN

BST PROPERTY: left < node < right

INSERT: follow BST property to find correct leaf position
DELETE:
  0 children: just remove
  1 child:    replace with child
  2 children: replace with max(left subtree), delete that

AVL BALANCE: |height(L) - height(R)| <= 1
  Left-heavy   -> Right rotation
  Right-heavy  -> Left rotation
  Left-Right   -> Left on child, then Right on node
  Right-Left   -> Right on child, then Left on node

HEIGHT: O(log n) balanced, O(n) worst
ALL BST OPS: O(height)
```
