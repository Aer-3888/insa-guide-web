---
title: "Arbres Binaires"
sidebar_position: 5
---

# Arbres Binaires

## Theorie

Un **arbre binaire** est une structure hierarchique ou chaque noeud a au plus deux enfants (gauche et droit).

```
         [A]           <- racine
        /   \
      [B]   [C]        <- noeuds internes
      / \     \
    [D] [E]   [F]      <- feuilles = pas d'enfants
```

Terminologie :
- **Racine** : noeud au sommet, sans parent
- **Feuille** : noeud sans enfants
- **Noeud interne** : noeud avec au moins un enfant
- **Hauteur** : longueur du plus long chemin de la racine a une feuille
- **Profondeur** d'un noeud : distance de la racine a ce noeud
- **Sous-arbre** : tout noeud + tous ses descendants

### Arbre Binaire de Recherche (ABR)

Un ABR satisfait : pour tout noeud N,
- Toutes les valeurs du sous-arbre gauche < N.valeur
- Toutes les valeurs du sous-arbre droit > N.valeur

```
         [7]
        /   \
      [3]   [10]
      / \      \
    [1] [6]   [14]
        /
       [4]
```

Note : Inserer 7 a nouveau -- puisque l'ABR utilise `>=` pour le placement a gauche (voir `placer()` dans le code d'examen), un doublon 7 irait dans le sous-arbre gauche de 10. Le placement exact depend de la politique de gestion des doublons de l'ABR.

**Recherche** : aller a gauche si cible < noeud, a droite si cible > noeud.

### Arbre AVL

Un **ABR auto-equilibrant** ou pour chaque noeud, les hauteurs des sous-arbres gauche et droit different d'au plus 1.

**Facteur d'equilibre** = hauteur(gauche) - hauteur(droit)
- Si |facteur d'equilibre| > 1 : reequilibrer avec des rotations

#### Rotations

**Rotation droite** -- quand le cote gauche est trop lourd :
```
Avant :        Apres :
    [C]          [B]
    /            / \
  [B]          [A] [C]
  /
[A]
```

**Rotation gauche** -- quand le cote droit est trop lourd :
```
Avant :        Apres :
[A]              [B]
  \              / \
  [B]          [A] [C]
    \
    [C]
```

**Rotation gauche-droite** (double rotation) :
```
Avant :          Apres rot. gauche sur B :   Apres rot. droite sur C :
    [C]              [C]                        [B]
    /                /                          / \
  [A]              [B]                        [A] [C]
    \              /
    [B]          [A]
```

**Rotation droite-gauche** : symetrique de gauche-droite.


## Parcours

Quatre parcours fondamentaux :

```
         [+]
        /   \
      [*]   [3]
      / \
    [2] [4]
```

### Infixe -- Gauche, Racine, Droit
```
2, *, 4, +, 3     (donne l'ordre trie pour un ABR)
Expression infixe : (2 * 4) + 3
```

### Prefixe -- Racine, Gauche, Droit
```
+, *, 2, 4, 3
Expression prefixe : + * 2 4 3
```

### Postfixe -- Gauche, Droit, Racine
```
2, 4, *, 3, +
Postfixe (NPI) : 2 4 * 3 +
```

### Parcours en largeur (BFS)
```
+, *, 3, 2, 4     (niveau par niveau, en utilisant une file)
```

### Modele de parcours recursif

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


## Implementation Java (du TP6)

### Interface : Arbre

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

### Implementation : TreeTwo

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

### Parcours Postfixe (toString)

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

### Denombrer les occurrences (BFS iteratif avec pile)

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

### Arbre d'Expressions Arithmetiques (ExprArith, TP6)

```
Expression : (3 + 4) * 2

Arbre :      [*]
            /   \
          [+]   [2]
          / \
        [3] [4]

Postfixe : 3 4 + 2 *
Evaluation : descente recursive
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


## Operations sur les ABR

### Recherche dans un ABR

```java
Node search(Node root, int key) {
    if (root == null || root.value == key) return root;
    if (key < root.value) return search(root.left, key);
    return search(root.right, key);
}
```

### Insertion dans un ABR (examen 2020)

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

### Suppression dans un ABR (examen 2020)

Pour supprimer un noeud avec deux enfants :
1. Trouver la **plus grande valeur** du sous-arbre gauche (noeud le plus a droite du sous-arbre gauche)
2. Remplacer la valeur du noeud par cette valeur
3. Supprimer le noeud trouve (qui a au plus un enfant)

```java
public void supprimerEc() {
    if (!aFilsD() || !aFilsG()) {
        oterEc();  // 0 or 1 child: simple removal
    } else {
        oterPlusGrandInf();  // 2 children: replace with max of left
    }
}
```


## Complexite

| Operation | ABR (equilibre) | ABR (pire cas) | AVL |
|-----------|-----------------|----------------|-----|
| Recherche | O(log n) | O(n) | O(log n) |
| Insertion | O(log n) | O(n) | O(log n) |
| Suppression | O(log n) | O(n) | O(log n) |
| Parcours | O(n) | O(n) | O(n) |
| Hauteur | O(log n) | O(n) | O(log n) |

Pire cas pour un ABR : inserer des donnees triees cree un arbre "liste chainee".

```
Insertion : 1, 2, 3, 4, 5

     [1]
       \
       [2]
         \
         [3]
           \
           [4]
             \
             [5]

Hauteur = n-1 = 4   (toutes les operations en O(n))
```


## AIDE-MEMOIRE

```
ARBRE BINAIRE
==============
             [racine]
            /        \
        [gauche]    [droit]
        /   \         /  \
       ...   ...    ...   ...

PARCOURS :
  Infixe   (GRD) : gauche, noeud, droit  -> trie pour ABR
  Prefixe  (RGD) : noeud, gauche, droit  -> copie d'arbre
  Postfixe (GDR) : gauche, droit, noeud  -> suppression / NPI

PROPRIETE ABR : gauche < noeud < droit

INSERTION : suivre la propriete ABR pour trouver la bonne position feuille
SUPPRESSION :
  0 enfant : supprimer simplement
  1 enfant : remplacer par l'enfant
  2 enfants : remplacer par max(sous-arbre gauche), supprimer ce noeud

EQUILIBRE AVL : |hauteur(G) - hauteur(D)| <= 1
  Lourd a gauche  -> Rotation droite
  Lourd a droite  -> Rotation gauche
  Gauche-Droite   -> Rotation gauche sur enfant, puis droite sur noeud
  Droite-Gauche   -> Rotation droite sur enfant, puis gauche sur noeud

HAUTEUR : O(log n) equilibre, O(n) pire cas
TOUTES LES OPS ABR : O(hauteur)
```
