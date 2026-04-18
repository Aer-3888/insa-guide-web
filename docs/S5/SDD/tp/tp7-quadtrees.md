---
title: "TP07 - QuadTrees et Compression d'Images"
sidebar_position: 7
---

# TP07 - QuadTrees et Compression d'Images

## Objectif

Implementer un **QuadTree** pour la compression hierarchique d'images.

Apprentissages :
- Structures arborescentes a 4 branches
- Subdivision recursive d'images
- Techniques de compression avec perte
- Structures de donnees spatiales

## Theorie : QuadTrees

### Qu'est-ce qu'un QuadTree ?

Un **QuadTree** est un arbre ou chaque noeud a **quatre enfants**, representant typiquement :
1. Haut-gauche (NO)
2. Haut-droit (NE)
3. Bas-gauche (SO)
4. Bas-droit (SE)

Utilisations :
- Compression d'images
- Indexation spatiale (SIG)
- Detection de collisions (jeux)
- Raffinement adaptatif de maillage

### Subdivision recursive

Si une region est **uniforme** (meme couleur partout), la stocker comme **feuille**.
Si **non uniforme**, subdiviser en 4 quadrants.

**Compression** : Au lieu de stocker tous les pixels, on stocke un arbre avec beaucoup moins de noeuds.

## Structures de donnees

### `Color` - Couleur de pixel

```java
public class Color {
    private int red, green, blue;
    
    public boolean near(Color c, int threshold) {
        return Math.abs(red - c.red) <= threshold
            && Math.abs(green - c.green) <= threshold
            && Math.abs(blue - c.blue) <= threshold;
    }
    
    public Color average(Color c, double weight) {
        return new Color(
            (int)(red * weight + c.red * (1 - weight)),
            (int)(green * weight + c.green * (1 - weight)),
            (int)(blue * weight + c.blue * (1 - weight)));
    }
}
```

### `Image` - Tableau 2D de pixels

```java
public class Image {
    private int width, height;
    private Color[][] pixels;
    
    public Color getPixel(int x, int y) { return pixels[y][x]; }
    public void setPixel(int x, int y, Color c) { pixels[y][x] = c; }
}
```

### `QuadTree` - Interface

```java
public interface QuadTree {
    void goToRoot();
    void goToParent();
    void goToChild(int i);  // 0=NO, 1=NE, 2=SE, 3=SO
    boolean isEmpty();
    boolean outOfTree();
    boolean onRoot();
    boolean onLeaf();
    Color getValue();
    void setValue(Color c);
    void createRoot(Color c);
    void addChildren(Color[] colors);
    void delete();
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
        List<Node> children;
        
        Node(Color c) {
            this.value = c;
            this.children = new ArrayList<>();
        }
        
        boolean isLeaf() { return children.isEmpty(); }
    }
    
    private Node root;
    private Node current;  // curseur de navigation
}
```

## Operations principales

### 1. Navigation par curseur

```java
public void goToRoot() { current = root; }
public void goToParent() { current = current.parent; }
public void goToChild(int i) { current = current.children.get(i); }
```

### 2. Construction depuis une image

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
    ch.addChild(buildFromImageRec(u, low_x, low_y, mx, my));     // NO
    ch.addChild(buildFromImageRec(u, mx, low_y, high_x, my));    // NE
    ch.addChild(buildFromImageRec(u, mx, my, high_x, high_y));   // SE
    ch.addChild(buildFromImageRec(u, low_x, my, mx, high_y));    // SO
    return ch;
}
```

### 3. Elagage (compression avec perte)

Supprimer les details en dessous d'un seuil :

```java
public void prune(int threshold) {
    if (this.onLeaf()) return;
    
    // Elaguer recursivement les enfants
    for (int i = 0; i < 4; i++) {
        goToChild(i);
        prune(threshold);
        goToParent();
    }
    
    // Verifier si tous les enfants sont des feuilles avec des couleurs similaires
    // Si oui : supprimer les enfants, faire de ce noeud une feuille avec la couleur moyenne
}
```

Exemples de seuil :
- `threshold=0` : Pas de compression (fusion uniquement des couleurs identiques)
- `threshold=5` : Leger flou
- `threshold=10` : Compression notable
- `threshold=50` : Compression forte (artefacts visibles)

### 4. Reconstruction d'image depuis l'arbre

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
        goToChild(0); recreateRec(out, low_x, low_y, mx, my);      // NO
        goToChild(1); recreateRec(out, mx, low_y, high_x, my);     // NE
        goToChild(2); recreateRec(out, mx, my, high_x, high_y);    // SE
        goToChild(3); recreateRec(out, low_x, my, mx, high_y);     // SO
    }
    goToParent();
}
```

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

## Metriques de compression

### Taux de compression

Noeuds de l'arbre / Pixels de l'image. Plus c'est bas, meilleure est la compression.

### PSNR (Peak Signal-to-Noise Ratio)

PSNR plus eleve = meilleure qualite :
- > 40 dB : Excellente
- 30-40 dB : Bonne
- 20-30 dB : Acceptable
- < 20 dB : Mauvaise

## Applications

1. **Compression d'images** : Compression avec perte de type JPEG
2. **Niveau de detail (LOD)** : Rendu d'objets distants avec moins de details
3. **Detection de collisions** : Trouver rapidement les objets qui se chevauchent en 2D
4. **Systemes d'information geographique** : Indexation spatiale de donnees cartographiques
5. **Maillage adaptatif** : Analyse par elements finis a resolution variable

## Extensions

1. **Seuil variable** : Differents seuils pour differentes regions
2. **Preservation des contours** : Ne pas compresser pres des bords
3. **Compression video** : Ne stocker que les changements entre images
4. **Octrees 3D** : Extension a 3D avec 8 enfants par noeud (utilise dans Minecraft, imagerie medicale)

## Voir aussi

- **TP06** : Arbres binaires (2 enfants)
- **TP08** : Files de priorite (tas = arbre binaire)
- [QuadTree Wikipedia](https://en.wikipedia.org/wiki/Quadtree)
