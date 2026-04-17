---
title: "Quadtrees"
sidebar_position: 8
---

# Quadtrees

## Theory

A **quadtree** is a tree data structure where each internal node has exactly four children, representing the four quadrants of a 2D space. They are used for spatial partitioning, image compression, and geographic information systems.

### Types of Quadtrees

1. **Point Quadtree**: stores points in 2D space
2. **Region Quadtree**: recursively subdivides a square region into four equal quadrants (used in TP7)

### Region Quadtree (from TP7)

Each node either:
- Is a **leaf** with a uniform color (the entire region is one color)
- Has **4 children** (the region is subdivided into quadrants)

Quadrant numbering (as used in TP7):
```
  +-------+-------+
  |       |       |
  |  NW   |  NE   |
  |  (0)  |  (1)  |
  +-------+-------+
  |       |       |
  |  SW   |  SE   |
  |  (3)  |  (2)  |
  +-------+-------+
```

### Image Compression Example

Original 4x4 image (each cell is a pixel color):
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

Quadtree representation:
```
           [null]           <- root (not uniform)
          /  |  \  \
        /    |    \  \
      [R]  [B]  [G]  [G]   <- children are uniform
      NW    NE   SE   SW
```

The top-left 2x2 is all Red -> leaf [R].
The top-right 2x2 is all Blue -> leaf [B].
The bottom-right 2x2 and bottom-left 2x2 are all Green -> leaf [G].

Without quadtree: 16 pixels to store.
With quadtree: 4 leaf nodes. Compression!

### Non-uniform Region

If a quadrant is not uniform, subdivide recursively:
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

Top-right 2x2 is NOT uniform (B,G,G,B), so subdivide:

             [null]
            /  |   \    \
          /    |     \    \
        [R]  [null]  [G]  [G]
              / | \ \
            [B][G][B][G]
```


## Java Implementation (from TP7)

### QuadTree Interface

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

### Tree Implementation (Cursor-based navigation)

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

### Building from Image (recursive subdivision)

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

### Pruning (Compression)

Pruning merges children into their parent if they are similar enough:

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

threshold = 0: only merge if all children are exactly the same color
threshold > 0: merge if colors are "close enough" (lossy compression)

### Recreating Image from Tree

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


## Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Build from n x n image | O(n^2) | Visit every pixel |
| Prune (threshold=0) | O(n^2) | Visit all nodes |
| Query point | O(log n) | Depth = log4(n^2) = log2(n) |
| Recreate image | O(n^2) | Write every pixel |
| Space (worst) | O(n^2) | No compression |
| Space (best) | O(1) | Entire image one color |
| Space (typical) | O(n) | Depends on image |

Tree depth for an n x n image: log4(n^2) = log2(n)

### Comparison with Raw Image

| Representation | Space | Point query | Region query |
|---------------|-------|-------------|--------------|
| Raw pixel array | O(n^2) | O(1) | O(region_size) |
| Quadtree (uncompressed) | O(n^2) | O(log n) | O(log n + result) |
| Quadtree (compressed) | O(k) << O(n^2) | O(log n) | O(log n + result) |


## Color Distance and Averaging

From the Color class (TP7):

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


## CHEAT SHEET

```
QUADTREE (REGION)
=================
Each node: either LEAF (uniform color) or 4 CHILDREN (subdivided)

Quadrants:     +----+----+
               | NW | NE |
               | 0  | 1  |
               +----+----+
               | SW | SE |
               | 3  | 2  |
               +----+----+

BUILD:  recursive subdivision until single pixel -> O(n^2)
PRUNE:  merge similar children into parent leaf -> compression
RECREATE: walk tree, paint regions -> O(n^2)

NAVIGATION: cursor-based (goToRoot, goToChild(i), goToParent)
DEPTH: log2(n) for n x n image
SPACE: O(k) where k = number of distinct regions

IMAGE SIZE MUST BE POWER OF 2 (2^k x 2^k)
```
