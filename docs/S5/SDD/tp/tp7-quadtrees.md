---
title: "TP07 - QuadTrees and Image Compression"
sidebar_position: 7
---

# TP07 - QuadTrees and Image Compression

## Objective

Implement a **QuadTree** data structure for hierarchical image compression.

Learn:
- 4-ary tree structures
- Recursive image subdivision
- Lossy compression techniques
- Spatial data structures

## Theory: QuadTrees

### What is a QuadTree?

A **QuadTree** is a tree where each node has **four children**, typically representing:
1. Top-left (NW)
2. Top-right (NE)
3. Bottom-left (SW)
4. Bottom-right (SE)

Used for:
- Image compression
- Spatial indexing (GIS)
- Collision detection (games)
- Adaptive mesh refinement

### Image Representation

An image is a 2D grid of pixels:
```
  0   1   2   3   4   5   6   7
0 [0] [0] [0] [0] [1] [5] [0] [0]
1 [0] [0] [0] [0][128][128][0] [0]
2 [0] [0] [0] [0] [1] [1][128][128]
3 [0] [0] [0] [0] [1] [1][128][128]
4[10][10][20][20][10][10][10][10]
5[10][10][20][20][10][10][10][10]
6 [0] [0] [0] [0][10][10][10][10]
7 [0] [0] [0] [0][10][10][10][10]
```

### Recursive Subdivision

If a region is **uniform** (all same color), store as a **leaf**.  
If **non-uniform**, subdivide into 4 quadrants:

```
Original 8x8:           Quad 1 (4x4):      Quad 1.1 (2x2):
┌───────────┐           ┌─────┐            ┌──┐
│           │           │     │            │  │
│     ?     │  -------> │  ?  │  -------> │ 0│
│           │           │     │            └──┘
│           │           └─────┘
└───────────┘
```

### QuadTree Structure

```
Root (0)
├── NW (0)  ← All black, leaf
├── NE (?)  ← Mixed
│   ├── NW (1)
│   ├── NE (5)
│   ├── SW (1)
│   └── SE (128)
├── SW (10)  ← All gray, leaf
└── SE (10)  ← All gray, leaf
```

**Compression**: Instead of storing 64 pixels, store ~10 nodes!

## Data Structures

### `Color` - Pixel Color

```java
public class Color {
    private int red;
    private int green;
    private int blue;
    
    public Color(int r, int g, int b) {
        this.red = r;
        this.green = g;
        this.blue = b;
    }
    
    public boolean near(Color c, int threshold) {
        int dr = Math.abs(red - c.red);
        int dg = Math.abs(green - c.green);
        int db = Math.abs(blue - c.blue);
        return dr <= threshold && dg <= threshold && db <= threshold;
    }
    
    public Color average(Color c, double weight) {
        int r = (int)(red * weight + c.red * (1 - weight));
        int g = (int)(green * weight + c.green * (1 - weight));
        int b = (int)(blue * weight + c.blue * (1 - weight));
        return new Color(r, g, b);
    }
}
```

### `Image` - 2D Pixel Array

```java
public class Image {
    private int width;
    private int height;
    private Color[][] pixels;
    
    public Image(int w, int h) {
        this.width = w;
        this.height = h;
        this.pixels = new Color[h][w];
    }
    
    public Color getPixel(int x, int y) {
        return pixels[y][x];
    }
    
    public void setPixel(int x, int y, Color c) {
        pixels[y][x] = c;
    }
    
    // Load from file
    public static Image loadPNG(String filename) { ... }
    
    // Save to file
    public void savePNG(String filename) { ... }
}
```

### `QuadTree` - Interface

```java
public interface QuadTree {
    // Navigation
    void goToRoot();
    void goToParent();
    void goToChild(int i);  // 1=NW, 2=NE, 3=SW, 4=SE
    
    // State queries
    boolean isEmpty();
    boolean outOfTree();
    boolean onRoot();
    boolean onLeaf();
    boolean hasChild(int i);
    
    // Value access
    Color getValue();
    void setValue(Color c);
    
    // Modifications
    void createRoot(Color c);
    void addChildren(Color[] colors);  // Add 4 children
    void delete();  // Delete subtree
    
    // Operations
    void prune(int threshold);
    void recreate(Image img);
}
```

### `Tree` - Implementation

```java
public class Tree implements QuadTree {
    static class Node {
        Color value;
        Node parent;
        Node[] children;  // Length 4: [NW, NE, SW, SE]
        
        Node(Color c) {
            this.value = c;
            this.children = new Node[4];
        }
        
        boolean isLeaf() {
            return children[0] == null;
        }
    }
    
    private Node root;
    private Node current;
    
    public Tree() {
        root = current = null;
    }
}
```

## Core Operations

### 1. Navigation

```java
public void goToRoot() {
    if (root == null) {
        throw new IllegalStateException("Tree is empty");
    }
    current = root;
}

public void goToParent() {
    if (current == null || current == root) {
        throw new IllegalStateException("Cannot go to parent");
    }
    current = current.parent;
}

public void goToChild(int i) {
    if (i < 1 || i > 4) {
        throw new IllegalArgumentException("Child index must be 1-4");
    }
    if (current == null || current.children[i-1] == null) {
        throw new IllegalStateException("Child does not exist");
    }
    current = current.children[i-1];
}
```

### 2. Add Children

```java
public void addChildren(Color[] colors) {
    if (colors.length != 4) {
        throw new IllegalArgumentException("Must provide exactly 4 colors");
    }
    if (current == null || !current.isLeaf()) {
        throw new IllegalStateException("Cannot add children");
    }
    
    for (int i = 0; i < 4; i++) {
        Node child = new Node(colors[i]);
        child.parent = current;
        current.children[i] = child;
    }
}
```

### 3. Build from Image

```java
public static Tree fromImage(Image img) {
    Tree tree = new Tree();
    tree.createRoot(avgColor(img, 0, 0, img.getWidth(), img.getHeight()));
    buildRecursive(tree, img, 0, 0, img.getWidth(), img.getHeight());
    return tree;
}

private static void buildRecursive(Tree tree, Image img, 
                                   int x, int y, int width, int height) {
    if (width <= 1 || height <= 1) {
        return;  // Can't subdivide further
    }
    
    // Check if region is uniform
    Color base = img.getPixel(x, y);
    boolean uniform = true;
    
    for (int dy = 0; dy < height; dy++) {
        for (int dx = 0; dx < width; dx++) {
            if (!img.getPixel(x + dx, y + dy).equals(base)) {
                uniform = false;
                break;
            }
        }
        if (!uniform) break;
    }
    
    if (uniform) {
        tree.setValue(base);
        return;  // Leaf node
    }
    
    // Subdivide into 4 quadrants
    int hw = width / 2;
    int hh = height / 2;
    
    Color[] childColors = new Color[4];
    childColors[0] = avgColor(img, x, y, hw, hh);           // NW
    childColors[1] = avgColor(img, x + hw, y, hw, hh);      // NE
    childColors[2] = avgColor(img, x, y + hh, hw, hh);      // SW
    childColors[3] = avgColor(img, x + hw, y + hh, hw, hh); // SE
    
    tree.addChildren(childColors);
    
    // Recursively build each quadrant
    tree.goToChild(1);
    buildRecursive(tree, img, x, y, hw, hh);
    tree.goToParent();
    
    tree.goToChild(2);
    buildRecursive(tree, img, x + hw, y, hw, hh);
    tree.goToParent();
    
    tree.goToChild(3);
    buildRecursive(tree, img, x, y + hh, hw, hh);
    tree.goToParent();
    
    tree.goToChild(4);
    buildRecursive(tree, img, x + hw, y + hh, hw, hh);
    tree.goToParent();
}

private static Color avgColor(Image img, int x, int y, int w, int h) {
    int r = 0, g = 0, b = 0;
    int count = 0;
    
    for (int dy = 0; dy < h; dy++) {
        for (int dx = 0; dx < w; dx++) {
            Color c = img.getPixel(x + dx, y + dy);
            r += c.getRed();
            g += c.getGreen();
            b += c.getBlue();
            count++;
        }
    }
    
    return new Color(r / count, g / count, b / count);
}
```

### 4. Recreate Image from Tree

```java
public void recreate(Image img) {
    goToRoot();
    recreateRecursive(img, 0, 0, img.getWidth(), img.getHeight());
}

private void recreateRecursive(Image img, int x, int y, int width, int height) {
    Color color = getValue();
    
    if (onLeaf()) {
        // Fill entire region with this color
        for (int dy = 0; dy < height; dy++) {
            for (int dx = 0; dx < width; dx++) {
                img.setPixel(x + dx, y + dy, color);
            }
        }
        return;
    }
    
    // Recursively fill quadrants
    int hw = width / 2;
    int hh = height / 2;
    
    goToChild(1);  // NW
    recreateRecursive(img, x, y, hw, hh);
    goToParent();
    
    goToChild(2);  // NE
    recreateRecursive(img, x + hw, y, hw, hh);
    goToParent();
    
    goToChild(3);  // SW
    recreateRecursive(img, x, y + hh, hw, hh);
    goToParent();
    
    goToChild(4);  // SE
    recreateRecursive(img, x + hw, y + hh, hw, hh);
    goToParent();
}
```

### 5. Pruning (Lossy Compression)

Remove details below a threshold:

```java
public void prune(int threshold) {
    goToRoot();
    pruneRecursive(threshold);
}

private boolean pruneRecursive(int threshold) {
    if (onLeaf()) {
        return true;  // Already a leaf
    }
    
    // Recursively prune children
    for (int i = 1; i <= 4; i++) {
        goToChild(i);
        pruneRecursive(threshold);
        goToParent();
    }
    
    // Check if all children are leaves with similar colors
    Color[] childColors = new Color[4];
    for (int i = 0; i < 4; i++) {
        goToChild(i + 1);
        if (!onLeaf()) {
            goToParent();
            return false;  // Child is not a leaf, can't prune
        }
        childColors[i] = getValue();
        goToParent();
    }
    
    // Check color similarity
    Color avg = averageColor(childColors);
    boolean similar = true;
    for (Color c : childColors) {
        if (!c.near(avg, threshold)) {
            similar = false;
            break;
        }
    }
    
    if (similar) {
        // Delete children, make this a leaf
        setValue(avg);
        for (int i = 0; i < 4; i++) {
            current.children[i] = null;
        }
        return true;
    }
    
    return false;
}
```

## Usage Example

```java
// Load image
Image original = Image.loadPNG("photo.png");
System.out.println("Original: " + original.getWidth() + "x" + original.getHeight());

// Build quadtree
Tree tree = Tree.fromImage(original);
System.out.println("Tree nodes: " + tree.countNodes());

// Compress with different thresholds
int[] thresholds = {0, 5, 10, 20, 50};

for (int t : thresholds) {
    Tree compressed = tree.clone();
    compressed.prune(t);
    
    Image result = new Image(original.getWidth(), original.getHeight());
    compressed.recreate(result);
    result.savePNG("compressed_" + t + ".png");
    
    int nodes = compressed.countNodes();
    double ratio = 100.0 * nodes / tree.countNodes();
    System.out.println("Threshold " + t + ": " + nodes + " nodes (" + ratio + "%)");
}
```

Output:
```
Original: 512x512
Tree nodes: 85342
Threshold 0: 85342 nodes (100.0%)  ← No compression
Threshold 5: 23451 nodes (27.5%)   ← Slight blur
Threshold 10: 8734 nodes (10.2%)   ← Noticeable compression
Threshold 20: 3201 nodes (3.8%)    ← Heavy compression
Threshold 50: 892 nodes (1.0%)     ← Very lossy
```

## Compression Metrics

### Compression Ratio

```java
public double compressionRatio() {
    int nodes = countNodes();
    int pixels = width * height;
    return (double) nodes / pixels;
}
```

Lower is better (fewer nodes = more compression).

### Peak Signal-to-Noise Ratio (PSNR)

```java
public double psnr(Image original, Image compressed) {
    double mse = 0;
    int count = 0;
    
    for (int y = 0; y < original.getHeight(); y++) {
        for (int x = 0; x < original.getWidth(); x++) {
            Color c1 = original.getPixel(x, y);
            Color c2 = compressed.getPixel(x, y);
            
            int dr = c1.getRed() - c2.getRed();
            int dg = c1.getGreen() - c2.getGreen();
            int db = c1.getBlue() - c2.getBlue();
            
            mse += dr*dr + dg*dg + db*db;
            count++;
        }
    }
    
    mse /= (count * 3);  // Average over all channels
    
    if (mse == 0) return Double.POSITIVE_INFINITY;
    
    double maxPixelValue = 255.0;
    return 20 * Math.log10(maxPixelValue / Math.sqrt(mse));
}
```

Higher PSNR = better quality:
- > 40 dB: Excellent
- 30-40 dB: Good
- 20-30 dB: Acceptable
- < 20 dB: Poor

## Visualization

Print tree structure:

```java
public void printTree() {
    goToRoot();
    printTreeRecursive("", true);
}

private void printTreeRecursive(String prefix, boolean isLast) {
    System.out.println(prefix + (isLast ? "└── " : "├── ") + getValue());
    
    if (!onLeaf()) {
        for (int i = 1; i <= 4; i++) {
            goToChild(i);
            printTreeRecursive(prefix + (isLast ? "    " : "│   "), i == 4);
            goToParent();
        }
    }
}
```

Output:
```
└── RGB(128,128,128)
    ├── RGB(0,0,0)      [NW - uniform black]
    ├── RGB(100,100,100) [NE]
    │   ├── RGB(50,50,50)
    │   ├── RGB(150,150,150)
    │   ├── RGB(75,75,75)
    │   └── RGB(125,125,125)
    ├── RGB(200,200,200) [SW - uniform light]
    └── RGB(255,255,255) [SE - uniform white]
```

## Applications

1. **Image Compression**: JPEG-like lossy compression
2. **Level of Detail (LOD)**: Render distant objects with less detail
3. **Collision Detection**: Quickly find overlapping objects in 2D space
4. **Geographic Information Systems**: Spatial indexing of map data
5. **Adaptive Mesh**: Finite element analysis with variable resolution

## Extensions

### 1. Variable Threshold

Different thresholds for different regions:

```java
public void adaptivePrune(Function<Integer, Integer> thresholdFunc) {
    // Higher threshold for less important regions
}
```

### 2. Edge Preservation

Don't compress near edges:

```java
public void edgeAwarePrune(int threshold, double edgeStrength) {
    // Detect edges using gradient
    // Use lower threshold near edges
}
```

### 3. Video Compression

Store only changes between frames:

```java
public Tree frameDifference(Tree previousFrame) {
    // Only store quadrants that changed
}
```

### 4. 3D Octrees

Extend to 3D with 8 children per node:
- Used in Minecraft for voxel storage
- Medical imaging (CT/MRI scans)
- 3D game engines

## Testing

```java
@Test
public void testBuildFromImage() {
    Image img = new Image(4, 4);
    // Fill with uniform color
    Color black = new Color(0, 0, 0);
    for (int y = 0; y < 4; y++) {
        for (int x = 0; x < 4; x++) {
            img.setPixel(x, y, black);
        }
    }
    
    Tree tree = Tree.fromImage(img);
    assertTrue(tree.onLeaf());  // Should be single node
    assertEquals(black, tree.getValue());
}

@Test
public void testRecreate() {
    Image original = Image.loadPNG("test.png");
    Tree tree = Tree.fromImage(original);
    
    Image recreated = new Image(original.getWidth(), original.getHeight());
    tree.recreate(recreated);
    
    // Should match exactly (before pruning)
    for (int y = 0; y < original.getHeight(); y++) {
        for (int x = 0; x < original.getWidth(); x++) {
            assertEquals(original.getPixel(x, y), recreated.getPixel(x, y));
        }
    }
}

@Test
public void testPruning() {
    Image img = Image.loadPNG("test.png");
    Tree tree = Tree.fromImage(img);
    
    int originalNodes = tree.countNodes();
    tree.prune(10);
    int prunedNodes = tree.countNodes();
    
    assertTrue(prunedNodes < originalNodes);
}
```

## See Also

- **TP06**: Binary trees (2 children)
- **TP08**: Priority queues (heap = binary tree)
- [QuadTree Wikipedia](https://en.wikipedia.org/wiki/Quadtree)
- [Image Compression](https://en.wikipedia.org/wiki/Image_compression)
- [Octrees](https://en.wikipedia.org/wiki/Octree)
