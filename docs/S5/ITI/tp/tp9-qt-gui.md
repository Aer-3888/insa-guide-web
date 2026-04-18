---
title: "LDS2 - Programmation d'interface graphique Qt (PyQt)"
sidebar_position: 9
---

# LDS2 - Programmation d'interface graphique Qt (PyQt)

## Objectifs pedagogiques

Introduction au developpement d'applications graphiques avec Qt et Python :

- Comprendre la programmation evenementielle
- Creer des applications graphiques avec PyQt
- Gerer les interactions utilisateur (signaux et slots)
- Travailler avec les images et les graphiques
- Implementer les patrons d'interface courants (MDI, dialogues, menus)

## Concepts fondamentaux

### 1. Bases de PyQt

**Qt** : framework d'interface graphique multiplateforme (C++)
**PyQt** : bindings Python pour Qt

```python noexec
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel
from PyQt5.QtCore import Qt
import sys

app = QApplication(sys.argv)
window = QMainWindow()
window.setWindowTitle("My App")
window.show()
sys.exit(app.exec_())
```

### 2. Widgets

Widgets Qt courants :
- `QWidget` - Base class for all UI elements
- `QMainWindow` - Main application window
- `QLabel` - Display text or images
- `QPushButton` - Clickable button
- `QLineEdit` - Single-line text input
- `QTextEdit` - Multi-line text editor
- `QSpinBox` - Numeric input
- `QSlider` - Slider control
- `QComboBox` - Dropdown list

### 3. Layouts

Automatic widget positioning:
```python noexec
from PyQt5.QtWidgets import QVBoxLayout, QHBoxLayout

# Vertical layout
vlayout = QVBoxLayout()
vlayout.addWidget(widget1)
vlayout.addWidget(widget2)

# Horizontal layout
hlayout = QHBoxLayout()
hlayout.addWidget(widget3)
hlayout.addWidget(widget4)

# Apply to container
container.setLayout(vlayout)
```

Types de layouts :
- `QVBoxLayout` - Vertical stack
- `QHBoxLayout` - Horizontal row
- `QGridLayout` - Grid (rows × columns)
- `QFormLayout` - Form with labels

### 4. Signaux et slots

**Programmation evenementielle** : repondre aux actions de l'utilisateur

```python noexec
# Signal: Event that can be emitted
# Slot: Function that handles signal

button = QPushButton("Click me")
button.clicked.connect(on_button_clicked)

def on_button_clicked():
    print("Button was clicked!")
```

Signaux courants :
- `clicked` - Button clicked
- `textChanged` - Text edited
- `valueChanged` - Value changed (spinbox, slider)
- `currentIndexChanged` - Selection changed (combobox)

### 5. Traitement d'images

```python noexec
from PyQt5.QtGui import QImage, QPixmap

# Load image
image = QImage("photo.jpg")

# Display in label
pixmap = QPixmap.fromImage(image)
label.setPixmap(pixmap)

# Pixel access
rgb = image.pixel(x, y)
r = (rgb >> 16) & 0xFF
g = (rgb >> 8) & 0xFF
b = rgb & 0xFF

# Modify pixel
new_rgb = (r << 16) | (g << 8) | b
image.setPixel(x, y, new_rgb)
```

### 6. MDI (Interface multi-documents)

```python noexec
from PyQt5.QtWidgets import QMdiArea, QMdiSubWindow

mdi_area = QMdiArea()
sub_window = QMdiSubWindow()
sub_window.setWidget(child_widget)
mdi_area.addSubWindow(sub_window)
sub_window.show()
```

## Apercu des exercices

### Exercice 1 : Fenetre simple
Creer une fenetre de base avec des widgets et des layouts.

**Concepts** :
- QMainWindow
- QLabel, QPushButton
- Layouts
- Window properties (title, size)

### Exercice 2 : Visionneuse d'images
Construire une application de visionneuse d'images.

**Fonctionnalites** :
- Load and display images
- Zoom in/out
- Navigate between images
- Image transformations

**Fichiers** : `ex2/tp6-p2_e.py`

### Exercice 3 : Widget horloge
Creer un widget horloge analogique ou numerique.

**Concepts** :
- QPainter for custom drawing
- QTimer for periodic updates
- Coordinate transformations

**Fichiers** : `ex3/Horloge_e.py`

### Exercice 4 : Editeur d'images MDI
Interface multi-documents pour l'edition d'images.

**Fonctionnalites** :
- Multiple image windows
- RGB color adjustment
- True color vs indexed color
- Window management

**Fichiers** : `ex4/fenetreMDI_e.py`, `principalMDI_e.py`

## Solutions

Voir les repertoires `src/` et exercices (`ex2/`, `ex3/`, `ex4/`) for les implementations completes.

## Points cles a retenir

1. **Event-driven ≠ procedural** - Code runs in response to events
2. **Les signaux/slots sont puissants** - Facon propre de gerer les interactions
3. **Layouts > positionnement absolu** - Plus flexible, gere le redimensionnement
4. **Qt est complet** - Possede des widgets pour presque tout
5. **La documentation est essentielle** - La doc Qt est detaillee et utile

## Motifs courants

### Modele de fenetre principale
```python noexec
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("App Name")
        self.setGeometry(100, 100, 800, 600)
        self.init_ui()
    
    def init_ui(self):
        # Create widgets
        # Create layouts
        # Connect signals
        pass
```

### Patron de dialogue
```python noexec
from PyQt5.QtWidgets import QDialog, QDialogButtonBox

class MyDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        # Setup dialog
        buttons = QDialogButtonBox(
            QDialogButtonBox.Ok | QDialogButtonBox.Cancel
        )
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
```

### Menu et barre d'outils
```python noexec
# Menu bar
menubar = self.menuBar()
file_menu = menubar.addMenu("File")
open_action = file_menu.addAction("Open")
open_action.triggered.connect(self.open_file)

# Toolbar
toolbar = self.addToolBar("Main")
toolbar.addAction(open_action)
```

## Erreurs courantes

1. **Oublier sys.exit(app.exec_())** - L'application n'executera pas la boucle evenementielle
2. **Ne pas appeler super().__init__()** - La classe parente n'est pas initialisee
3. **Se connecter au mauvais signal** - Verifier la documentation Qt
4. **Fuites memoire avec les images** - Effacer les pixmaps une fois termine
5. **Securite des threads** - Les mises a jour de l'interface doivent etre sur le thread principal
6. **Conflits de layouts** - On ne peut pas melanger le positionnement manuel avec les layouts

## Pour aller plus loin

- PyQt5 Documentation: https://www.riverbankcomputing.com/static/Docs/PyQt5/
- Qt Documentation: https://doc.qt.io/
- Qt Designer: Visual GUI designer tool
- Model-View architecture: For complex data display
- Qt Graphics View: For custom 2D graphics

## Architecture Qt

```
QApplication (manages app)
    └── QMainWindow (main window)
            ├── Central Widget
            ├── Menu Bar
            ├── Toolbars
            └── Status Bar
```

## Operations de traitement d'images

Operations courantes sur QImage :
- Conversion d'espace colorimetrique (RVB, niveaux de gris, indexe)
- Filtrage (flou, nettete, detection de contours)
- Transformations (rotation, mise a l'echelle, retournement)
- Ajustements de couleur (luminosite, contraste, saturation)
- Analyse d'histogramme

## Conseils de performance

1. **Utiliser QPixmap pour l'affichage** - Optimise pour le rendu ecran
2. **Traiter avec QImage** - Optimise pour la manipulation de pixels
3. **Mettre en cache les operations couteuses** - Ne pas recalculer a chaque dessin
4. **Mettre a jour uniquement les regions modifiees** - Utiliser update(QRect) et non update()
5. **Considerer le multi-threading** - Les operations longues doivent etre hors du thread principal
