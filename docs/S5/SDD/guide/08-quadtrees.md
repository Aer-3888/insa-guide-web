---
title: "Quadtrees"
sidebar_position: 8
---

# Quadtrees

## Theorie

Un **quadtree** est une structure de donnees arborescente ou chaque noeud interne a exactement quatre enfants, representant les quatre quadrants d'un espace 2D. Ils sont utilises pour le partitionnement spatial, la compression d'images et les systemes d'information geographique.

### Types de Quadtrees

1. **Quadtree de points** : stocke des points dans un espace 2D
2. **Quadtree de region** : subdivise recursivement une region carree en quatre quadrants egaux (utilise dans le TP7)

### Quadtree de Region (du TP7)

Chaque noeud est soit :
- Une **feuille** avec une couleur uniforme (toute la region est d'une seule couleur)
- Un noeud avec **4 enfants** (la region est subdivisee en quadrants)

Numerotation des quadrants (telle qu'utilisee dans le TP7) :
```
  +-------+-------+
  |       |       |
  |  NO   |  NE   |
  |  (0)  |  (1)  |
  +-------+-------+
  |       |       |
  |  SO   |  SE   |
  |  (3)  |  (2)  |
  +-------+-------+
```

### Exemple de Compression d'Image

Image originale 4x4 (chaque cellule est un pixel de couleur) :
```
  +--+--+--+--+
  |R |R |B |B |
  +--+--+--+--+
  |R |R |B |B |
  +--+--+--+--+
  |G |G |G |G |
  +--+--+--+--+
  |G |G |G |G |
  +--+--+--+--+
```

Representation en quadtree :
```
           [null]           <- racine (non uniforme)
          /  |  \  \
        /    |    \  \
      [R]  [B]  [G]  [G]   <- les enfants sont uniformes
      NO    NE   SE   SO
```

Le carre 2x2 en haut a gauche est entierement Rouge -> feuille [R].
Le carre 2x2 en haut a droite est entierement Bleu -> feuille [B].
Les carres 2x2 en bas a droite et en bas a gauche sont entierement Verts -> feuille [G].

Sans quadtree : 16 pixels a stocker.
Avec quadtree : 4 noeuds feuilles. Compression !

### Region Non Uniforme

Si un quadrant n'est pas uniforme, subdiviser recursivement :
```
  +--+--+--+--+
  |R |R |B |G |
  +--+--+--+--+
  |R |R |G |B |
  +--+--+--+--+
  |G |G |G |G |
  +--+--+--+--+
  |G |G |G |G |
  +--+--+--+--+

Le carre 2x2 en haut a droite N'EST PAS uniforme (B,G,G,B), donc on subdivise :

             [null]
            /  |   \    \
          /    |     \    \
        [R]  [null]  [G]  [G]
              / | \ \
            [B][G][B][G]
```


## Implementation Java (du TP7)

### Interface QuadTree

```java
public interface QuadTree {
    boolean isEmpty();
    boolean outOfTree();
    void prune(int threshold);
    void goToRoot();
    void goToParent();
    void goToChild(int i);       // i = 0,1,2,3
    boolean onRoot();
    boolean onLeaf();
    boolean hasChild(int i);
    Color getValue();
    void setValue(Color c);
    void addChildren(Color[] c); // add 4 children
    void createRoot(Color c);
    void delete();
    void recreate(Image c);      // tree -> image
}
```

### Implementation Tree (navigation par curseur)

```java
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
            if (children.size() == 4)
                throw new RuntimeException("List full");
            n.parent = this;
            children.add(n);
        }
    }

    private Node root;
    private Node current;  // cursor for navigation
```

### Construction a Partir d'une Image (subdivision recursive)

```java
    private Node buildFromImageRec(Image u,
            int low_x, int low_y, int high_x, int high_y) {
        // Base case: single pixel
        if (low_x + 1 == high_x && low_y + 1 == high_y) {
            return new Node(u.getPixel(low_x, low_y), null);
        }
        // Recursive case: divide into 4 quadrants
        Node ch = new Node(null, null);
        int mx = (low_x + high_x) / 2;
        int my = (low_y + high_y) / 2;
        ch.addChild(buildFromImageRec(u, low_x, low_y, mx, my));     // NW (0)
        ch.addChild(buildFromImageRec(u, mx, low_y, high_x, my));    // NE (1)
        ch.addChild(buildFromImageRec(u, mx, my, high_x, high_y));   // SE (2)
        ch.addChild(buildFromImageRec(u, low_x, my, mx, high_y));    // SW (3)
        return ch;
    }

    public Tree(Image u) {
        int size = u.getSize();
        this.root = buildFromImageRec(u, 0, 0, size, size);
        this.current = this.root;
        this.prune(0);  // merge identical quadrants
    }
```

### Elagage (Compression)

L'elagage fusionne les enfants dans leur parent s'ils sont suffisamment similaires :

```java
    public void prune(int threshold) {
        if (this.onLeaf()) {
            if (this.onRoot()) return;
        } else {
            // Recursively prune all children
            for (int i = 0; i < 4; i++) {
                this.goToChild(i);
                prune(threshold);
                this.goToParent();
            }
            // Check if all children are leaves with similar colors
            for (int i = 0; i < 4; i++) {
                goToChild(i);
                if (current.value == null) { goToParent(); return; }
                goToParent();
                for (int j = 0; j < i; j++) {
                    if (!current.children.get(i).value
                         .near(current.children.get(j).value, threshold))
                        return;  // too different, don't merge
                }
            }
            // All similar -> merge: compute average color
            Color avg = /* weighted average of 4 children */;
            current.removeChildren();
            current.value = avg;
        }
    }
```

threshold = 0 : ne fusionner que si tous les enfants ont exactement la meme couleur
threshold > 0 : fusionner si les couleurs sont "suffisamment proches" (compression avec perte)

### Recreation de l'Image a Partir de l'Arbre

```java
    private void recreateRec(Image out,
            int low_x, int low_y, int high_x, int high_y) {
        if (this.onLeaf()) {
            // Paint the entire region with this color
            Color c = this.getValue();
            for (int x = low_x; x < high_x; x++)
                for (int y = low_y; y < high_y; y++)
                    out.setPixel(x, y, c);
        } else {
            int mx = (high_x + low_x) / 2;
            int my = (high_y + low_y) / 2;
            goToChild(0); recreateRec(out, low_x, low_y, mx, my);
            goToChild(1); recreateRec(out, mx, low_y, high_x, my);
            goToChild(2); recreateRec(out, mx, my, high_x, high_y);
            goToChild(3); recreateRec(out, low_x, my, mx, high_y);
        }
        goToParent();
    }
```


## Complexite

| Operation | Complexite | Notes |
|-----------|-----------|-------|
| Construction depuis image n x n | O(n^2) | Visite chaque pixel |
| Elagage (threshold=0) | O(n^2) | Visite tous les noeuds |
| Requete ponctuelle | O(log n) | Profondeur = log4(n^2) = log2(n) |
| Recreation d'image | O(n^2) | Ecrit chaque pixel |
| Espace (pire cas) | O(n^2) | Pas de compression |
| Espace (meilleur cas) | O(1) | Image entierement d'une seule couleur |
| Espace (cas typique) | O(n) | Depend de l'image |

Profondeur de l'arbre pour une image n x n : log4(n^2) = log2(n)

### Comparaison avec une Image Brute

| Representation | Espace | Requete ponctuelle | Requete de region |
|---------------|-------|-------------|--------------|
| Tableau de pixels brut | O(n^2) | O(1) | O(taille_region) |
| Quadtree (non compresse) | O(n^2) | O(log n) | O(log n + resultat) |
| Quadtree (compresse) | O(k) << O(n^2) | O(log n) | O(log n + resultat) |


## Distance et Moyenne des Couleurs

Depuis la classe Color (TP7) :

```java
// Euclidean distance per channel
public Color distance(final Color c) {
    return new Color(
        Math.abs(this.getRed()   - c.getRed()),
        Math.abs(this.getGreen() - c.getGreen()),
        Math.abs(this.getBlue()  - c.getBlue()),
        Math.abs(this.getAlpha() - c.getAlpha())
    );
}

// Are two colors "close enough"?
public boolean near(final Color c, final int threshold) {
    Color d = this.distance(c);
    return d.getRed()   <= threshold
        && d.getGreen() <= threshold
        && d.getBlue()  <= threshold
        && d.getAlpha() <= threshold;
}

// Weighted average
public Color average(final Color c, final double weight) {
    return new Color(
        (int)(weight * getRed()   + (1 - weight) * c.getRed()),
        (int)(weight * getGreen() + (1 - weight) * c.getGreen()),
        (int)(weight * getBlue()  + (1 - weight) * c.getBlue()),
        (int)(weight * getAlpha() + (1 - weight) * c.getAlpha())
    );
}
```


## AIDE-MEMOIRE

```
QUADTREE (REGION)
=================
Chaque noeud : soit FEUILLE (couleur uniforme) soit 4 ENFANTS (subdivise)

Quadrants :    +----+----+
               | NO | NE |
               | 0  | 1  |
               +----+----+
               | SO | SE |
               | 3  | 2  |
               +----+----+

CONSTRUCTION :  subdivision recursive jusqu'au pixel unique -> O(n^2)
ELAGAGE :       fusionner les enfants similaires dans le parent -> compression
RECREATION :    parcourir l'arbre, peindre les regions -> O(n^2)

NAVIGATION : par curseur (goToRoot, goToChild(i), goToParent)
PROFONDEUR : log2(n) pour une image n x n
ESPACE :     O(k) ou k = nombre de regions distinctes

LA TAILLE DE L'IMAGE DOIT ETRE UNE PUISSANCE DE 2 (2^k x 2^k)
```
