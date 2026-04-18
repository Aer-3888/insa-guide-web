---
title: "TP7 - QuadTrees et Compression d'Images"
sidebar_position: 7
---

# TP7 - QuadTrees et Compression d'Images

> D'apres les consignes de l'enseignant : `S5/SDD/data/moodle/tp/tp7_quadtrees/README.md`

## Objectif

Implementer un QuadTree pour la compression hierarchique d'images. Construire des arbres a partir d'images, naviguer avec un curseur, elaguer pour la compression avec perte, et reconstruire les images.

## Fichiers

| Fichier | Role | Statut |
|---------|------|--------|
| `src/main/quadtree/QuadTree.java` | Interface pour les operations de quadtree | Fourni |
| `src/main/quadtree/Color.java` | Classe couleur avec distance/average/near | Fourni |
| `src/main/quadtree/Image.java` | Tableau 2D de pixels, contrainte puissance de 2 | Fourni |
| `src/main/quadtree/Tree.java` | Implementation du QuadTree | **A ecrire** |
| `src/test/quadtree/TreeTest.java` | Tests pour Tree | Fourni |
| `src/test/quadtree/ColorTest.java` | Tests pour Color | Fourni |
| `src/test/quadtree/ImageTest.java` | Tests pour Image | Fourni |

## Concept du QuadTree

Un quadtree subdivise une image carree en 4 quadrants recursivement :
- **Quadrant 0** : Haut-gauche (NW)
- **Quadrant 1** : Haut-droit (NE)
- **Quadrant 2** : Bas-droit (SE)
- **Quadrant 3** : Bas-gauche (SW)

Si tous les pixels d'une region ont la meme couleur (dans un seuil), la region devient une feuille. Sinon, elle se subdivise en 4 enfants.

---

## Exercice 1

### Definir la classe interne Node et les attributs de base

**Reponse :**

```java
package quadtree;

import java.util.ArrayList;
import java.util.List;

public class Tree implements QuadTree {
    private static class Node {
        Color value;
        List<Node> children;
        Node parent;

        public Node(Color c, Node p) {
            this.value = c;
            this.parent = p;
            this.children = new ArrayList<>();
        }

        public void addChild(Node n) {
            if (n == null) throw new IllegalArgumentException("Null node child");
            if (this.children.size() == 4)
                throw new RuntimeException("List full");
            n.parent = this;
            this.children.add(n);
        }

        public void removeChildren() {
            this.children.clear();
        }
    }

    private Node root;
    private Node current;
```

**Fonctionnement du code :**
Chaque noeud peut avoir 0 (feuille) ou exactement 4 enfants. On utilise une ArrayList pour l'acces par index. La navigation se fait par curseur (`current`), comme un systeme de fichiers.

---

## Exercice 2

### Implementer les constructeurs, la navigation et les operations de base

**Reponse :**

```java
    public Tree() { }

    public Tree(Color c) {
        this.createRoot(c);
    }

    public boolean isEmpty() { return this.root == null; }
    public boolean outOfTree() { return this.current == null; }

    public void goToRoot() { this.current = this.root; }

    public void goToParent() {
        if (this.outOfTree())
            throw new ArrayIndexOutOfBoundsException("Parent of node outside tree");
        this.current = this.current.parent;
    }

    public void goToChild(int i) {
        if (this.outOfTree())
            throw new ArrayIndexOutOfBoundsException("Child of node out of tree");
        try {
            this.current = this.current.children.get(i);
        } catch (IndexOutOfBoundsException e) {
            this.current = null;
        }
    }

    public boolean onRoot() { return this.current == this.root; }

    public boolean onLeaf() {
        return !this.outOfTree() && this.current.children.isEmpty();
    }

    public boolean hasChild(int i) {
        return !this.outOfTree() && this.current.children.size() >= i;
    }

    public Color getValue() {
        if (this.outOfTree())
            throw new ArrayIndexOutOfBoundsException("Value out of tree");
        return this.current.value;
    }

    public void setValue(Color c) {
        if (this.outOfTree())
            throw new ArrayIndexOutOfBoundsException("Value on out of tree");
        if (c == null) throw new IllegalArgumentException("Adding null color");
        this.current.value = c;
    }

    public void addChildren(Color[] c) {
        if (this.outOfTree())
            throw new ArrayIndexOutOfBoundsException("Adding children out of tree");
        if (c == null) throw new IllegalArgumentException("Null array of children");
        if (c.length != 4)
            throw new RuntimeException("Invalid number of children for a quadtree");
        for (Color ci : c) {
            this.current.addChild(new Node(ci, this.current));
        }
    }

    public void createRoot(Color c) {
        if (!this.isEmpty()) throw new RuntimeException("Trying to recreate a tree");
        if (c == null) throw new IllegalArgumentException("Null color for root");
        this.root = new Node(c, null);
        this.current = this.root;
    }

    public void delete() {
        if (this.outOfTree()) throw new RuntimeException("Deleting out of tree");
        this.goToParent();
        this.current.removeChildren();
    }

    public String toString() { return "nope"; }
```

**Fonctionnement du code :**
Contrairement au TP6 (qui utilisait arbreG/arbreD), le quadtree utilise un curseur (`current`) qu'on deplace avec `goToRoot()`, `goToParent()`, `goToChild(i)`. Chaque `goToChild(i)` doit etre equilibre par un `goToParent()`.

---

## Exercice 3

### Construire un quadtree a partir d'une image -- subdivision recursive

Chaque region de 1x1 pixel devient un noeud feuille avec la couleur du pixel.

**Reponse :**

```java
    private Node buildFromImageRec(Image u, int low_x, int low_y,
                                    int high_x, int high_y) {
        // Cas de base : pixel unique
        if (low_x + 1 == high_x && low_y + 1 == high_y) {
            return new Node(u.getPixel(low_x, low_y), null);
        }
        // Cas recursif : subdiviser en 4 quadrants
        Node ch = new Node(null, null);
        int mx = (low_x + high_x) / 2;
        int my = (low_y + high_y) / 2;
        ch.addChild(buildFromImageRec(u, low_x, low_y, mx, my));       // 0: NW
        ch.addChild(buildFromImageRec(u, mx, low_y, high_x, my));      // 1: NE
        ch.addChild(buildFromImageRec(u, mx, my, high_x, high_y));     // 2: SE
        ch.addChild(buildFromImageRec(u, low_x, my, mx, high_y));      // 3: SW
        return ch;
    }

    public Tree(Image u) {
        if (u == null) throw new IllegalArgumentException("Null building image");
        int size = u.getSize();
        this.root = this.buildFromImageRec(u, 0, 0, size, size);
        this.current = this.root;
        this.prune(0);  // Fusionner les freres identiques immediatement
    }
```

**Fonctionnement du code :**
- Apres construction de l'arbre complet (chaque pixel est une feuille), on appelle `prune(0)` pour fusionner les freres avec des couleurs identiques. Cela produit le quadtree compact.
- Ordre des quadrants (important -- doit correspondre a recreate) :
  - Enfant 0 : haut-gauche (NW)
  - Enfant 1 : haut-droit (NE)
  - Enfant 2 : bas-droit (SE)
  - Enfant 3 : bas-gauche (SW)

---

## Exercice 4

### Implementer prune() -- compression avec perte

Fusionner recursivement les enfants dans leur parent si les 4 enfants sont des feuilles avec des couleurs similaires (dans le seuil).

**Reponse :**

```java
    public void prune(int threshold) {
        if (this.onLeaf()) {
            if (this.onRoot()) return;
            return;
        }
        // Elaguer recursivement tous les enfants d'abord
        for (int i = 0; i < 4; i++) {
            this.goToChild(i);
            prune(threshold);
            this.goToParent();
        }
        // Verifier si tous les enfants sont des feuilles avec des couleurs similaires
        Color avg = null;
        for (int i = 0; i < 4; i++) {
            this.goToChild(i);
            if (this.current.value == null) {
                this.goToParent();
                return;  // Pas tous les enfants ont des couleurs
            }
            this.goToParent();
            // Comparer avec tous les enfants precedents
            for (int j = 0; j < i; j++) {
                if (!this.current.children.get(i).value.near(
                        this.current.children.get(j).value, threshold)) {
                    return;  // Les couleurs different trop
                }
            }
            if (avg == null)
                avg = this.current.children.get(i).value;
            else
                avg = avg.average(this.current.children.get(i).value, 0.25);
        }
        // Tous les enfants sont similaires -- fusionner
        this.current.removeChildren();
        this.current.value = avg;
    }
```

**Fonctionnement du code :**
1. Elaguer recursivement les enfants (de bas en haut)
2. Si les 4 enfants sont des feuilles ET toutes les couleurs sont dans le `threshold` les unes des autres, remplacer les 4 enfants par une seule feuille avec la couleur moyenne
3. Seuil plus eleve = compression plus agressive = plus de perte de qualite

Exemples de seuil :
- `threshold=0` : fusionner uniquement les couleurs identiques (sans perte)
- `threshold=10` : fusionner les couleurs differant de 10 max par canal (leger flou)
- `threshold=50` : compression forte (artefacts visibles)

---

## Exercice 5

### Implementer recreate() -- reconstruction d'image

Parcourir le quadtree et remplir une image de sortie. Les noeuds feuilles remplissent toute leur region avec une seule couleur.

**Reponse :**

```java
    private void recreateRec(Image out, int low_x, int low_y,
                              int high_x, int high_y) {
        if (this.onLeaf()) {
            Color c = this.getValue();
            for (int x = low_x; x < high_x; x++)
                for (int y = low_y; y < high_y; y++)
                    out.setPixel(x, y, c);
        } else {
            int mx = (high_x + low_x) / 2;
            int my = (high_y + low_y) / 2;
            this.goToChild(0);
            this.recreateRec(out, low_x, low_y, mx, my);         // NW
            this.goToChild(1);
            this.recreateRec(out, mx, low_y, high_x, my);        // NE
            this.goToChild(2);
            this.recreateRec(out, mx, my, high_x, high_y);       // SE
            this.goToChild(3);
            this.recreateRec(out, low_x, my, mx, high_y);        // SW
        }
        this.goToParent();
    }

    public void recreate(Image out) {
        if (out == null) throw new IllegalArgumentException("Null out image");
        int size = out.getSize();
        this.goToRoot();
        recreateRec(out, 0, 0, size, size);
    }
}
```

**Fonctionnement du code :**
- L'ordre des quadrants dans `recreateRec` doit correspondre exactement a `buildFromImageRec`. Si l'enfant 0 est NW pendant la construction, il doit aussi etre NW pendant la reconstruction.
- Apres avoir traite un enfant, on appelle `goToParent()` pour revenir au niveau courant. Le `goToParent()` final a la fin de la methode retourne au niveau de l'appelant.

---

## Exemple d'utilisation

```java
// Charger une image
Image original = new Image("photo.png");

// Construire le quadtree
Tree tree = new Tree(original);

// Compresser avec threshold=20
tree.prune(20);

// Reconstruire
Image result = new Image(original.getSize());
tree.recreate(result);
result.save("compressed.png", "png");
```

---

## Erreurs courantes

1. **Mauvais ordre des quadrants** -- Si la construction utilise (NW, NE, SE, SW) mais la reconstruction utilise (NW, NE, SW, SE), les quadrants seront echanges.
2. **Oublier goToParent()** -- Chaque `goToChild(i)` doit etre equilibre par un `goToParent()`. En oublier un fait deriver le curseur plus profondement dans l'arbre.
3. **Elaguer avant les enfants** -- Il faut elaguer de bas en haut (enfants d'abord, puis verifier le parent).
4. **Taille d'image non puissance de 2** -- Le constructeur `Image` impose cette contrainte. Les images de taille non puissance de 2 ne peuvent pas etre subdivisees uniformement.

## Complexite

| Operation | Temps |
|-----------|-------|
| Construction depuis image | O(n) ou n = pixels |
| Elagage | O(m) ou m = noeuds |
| Reconstruction | O(n) -- remplit chaque pixel |
